const jwt = require('jsonwebtoken');

/**
 * Middleware de sesión: lee Authorization: Bearer <token> y valida el JWT.
 * Al aceptar el token, deja su contenido en req.usuario y llama a next().
 * Si falta, venció o la firma es inválida, termina la petición con HTTP 401.
 * No consulta la tabla usuarios ni implementa permisos por rol.
 */
module.exports = function requireAuth(req, res, next) {
    const [tipo, token] = (req.headers.authorization || '').split(' ');

    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Autenticación requerida' });
    }

    try {
        // Solo admite HS256 y la clave JWT_SECRET; verify también controla expiración.
        req.usuario = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        next();
    } catch (error) {
        const expirado = error.name === 'TokenExpiredError';
        return res.status(401).json({
            message: expirado ? 'La sesión expiró, volvé a iniciar sesión' : 'Token inválido',
        });
    }
};