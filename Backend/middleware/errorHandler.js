const { ErrorApp, errores, traducirErrorPg } = require('../utils/errores');

// (es el que lee el frontend en services/api.js).
module.exports = (err, req, res, next) => {
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

    res.status(e.status).json({
        message: e.message,
        ...(e.codigo && { codigo: e.codigo }),
        ...(e.detalle && { detalle: e.detalle }),
    });
};