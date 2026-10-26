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

router.post('/login', limitarLogin, asyncHandler(async (req, res) => {
    const { usuario, password } = req.body;

    if (typeof usuario !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    // Se compara el hash siempre, para no revelar por tiempo si el usuario existe.
    const passwordOk = await bcrypt.compare(password, process.env.BIBLIOTECARIO_PASSWORD_HASH);
    const usuarioOk = usuario === process.env.BIBLIOTECARIO_USER;

    if (!usuarioOk || !passwordOk) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
        { sub: usuario, rol: 'bibliotecario' },
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