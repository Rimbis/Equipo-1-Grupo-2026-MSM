const { ErrorApp, errores, traducirErrorPg } = require('../utils/errores');

/**
 * Middleware final de errores; Express reconoce esta función por sus cuatro parámetros.
 * Recibe errores de rutas/modelos, los traduce y devuelve JSON con message.
 * Conserva errores controlados, trata JSON inválido o excesivo y traduce fallos de pg.
 * Los errores desconocidos se registran y devuelven un mensaje genérico con HTTP 500.
 */
module.exports = (err, req, res, next) => {
    // Si la respuesta empezó, delega en Express para no intentar enviarla otra vez.
    if (res.headersSent) return next(err);

    let e = null;
    if (err instanceof ErrorApp) e = err;
    else if (err.type === 'entity.parse.failed') e = errores.peticionInvalida('El cuerpo de la petición no es un JSON válido.');
    else if (err.type === 'entity.too.large') e = new ErrorApp(413, 'El cuerpo de la petición es demasiado grande.');
    else if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) e = new ErrorApp(err.status, err.message);
    else e = traducirErrorPg(err);

    if (!e) {
        console.error(err); // el detalle interno se loguea, no se expone
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
    if (e.status >= 500) console.error(err);

    // codigo y detalle solo se incluyen si el error controlado los proporciona.
    res.status(e.status).json({
        message: e.message,
        ...(e.codigo && { codigo: e.codigo }),
        ...(e.detalle && { detalle: e.detalle }),
    });
};