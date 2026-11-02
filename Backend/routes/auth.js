// Router de autenticación: el prefijo /api/auth se asigna en server.js.

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/auth');
const { asyncHandler, validarId, textoValido, NegocioError } = require('../utils/errores');

const router = express.Router();

// Middleware de límite por IP: cuenta solicitudes de login, también las exitosas.
// Superar 10 solicitudes en 15 minutos produce HTTP 429 antes de comparar contraseñas.
const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
});

const Usuario = require('../models/Usuario');
const HASH_DUMMY = bcrypt.hashSync('dummy', 10); // para que el tiempo no delate si el usuario existe

/**
 * POST /api/auth/login: recibe { usuario, password } como texto.
 * Valida las credenciales contra la tabla usuarios.
 * Si son correctas, devuelve un JWT y su duración; si no, responde HTTP 401.
 */
router.post('/login', limitarLogin, asyncHandler(async (req, res) => {
    const { usuario, password } = req.body;

    if (typeof usuario !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    // Se compara el hash siempre, para no revelar por tiempo si el usuario existe.
    const fila = await Usuario.buscarPorUsuario(usuario.trim().toLowerCase());
    const passwordOk = await bcrypt.compare(password, fila ? fila.password_hash : HASH_DUMMY);

    if (!fila || !passwordOk) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // sub identifica al usuario; rol es información del token, no una comprobación de permisos.
    // La firma usa JWT_SECRET y el middleware rechazará el token al vencer en ocho horas.
    const token = jwt.sign(
        { sub: fila.usuario, rol: fila.rol },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '8h' }
    );

    res.json({ token, expiraEn: '8h' });
}));

/**
 * GET /api/auth/me: requireAuth valida primero el token.
 * Devuelve el usuario y rol de ese token para confirmar la sesión del frontend.
 */
router.get('/me', requireAuth, (req, res) => {
    res.json({ usuario: req.usuario.sub, rol: req.usuario.rol });
});

module.exports = router;