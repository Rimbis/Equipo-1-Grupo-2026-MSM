const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/auth');
const { asyncHandler, validarId, textoValido, NegocioError } = require('../utils/errores');

const router = express.Router();

// Máximo 10 intentos de login cada 15 minutos por IP
const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
});

const Usuario = require('../models/Usuario');
const HASH_DUMMY = bcrypt.hashSync('dummy', 10); // para que el tiempo no delate si el usuario existe

router.post('/login', limitarLogin, asyncHandler(async (req, res) => {
    const { usuario, password } = req.body;

    if (typeof usuario !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    const fila = await Usuario.buscarPorUsuario(usuario.trim().toLowerCase());
    const passwordOk = await bcrypt.compare(password, fila ? fila.password_hash : HASH_DUMMY);

    if (!fila || !passwordOk) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
        { sub: fila.usuario, rol: fila.rol },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '8h' }
    );

    res.json({ token, expiraEn: '8h' });
}));

// El frontend lo usa para saber si el token guardado sigue siendo válido
router.get('/me', requireAuth, (req, res) => {
    res.json({ usuario: req.usuario.sub, rol: req.usuario.rol });
});

module.exports = router;