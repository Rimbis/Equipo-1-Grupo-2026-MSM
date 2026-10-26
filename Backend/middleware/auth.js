const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
    const [tipo, token] = (req.headers.authorization || '').split(' ');

    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Autenticación requerida' });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        next();
    } catch (error) {
        const expirado = error.name === 'TokenExpiredError';
        return res.status(401).json({
            message: expirado ? 'La sesión expiró, volvé a iniciar sesión' : 'Token inválido',
        });
    }
};