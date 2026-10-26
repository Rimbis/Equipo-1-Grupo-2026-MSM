// Errores de la API: se lanzan con `throw` desde las rutas y los atrapa middleware/errorHandler.js
class ErrorApp extends Error {
    constructor(status, message, { codigo, detalle } = {}) {
        super(message);
        this.name = 'ErrorApp';
        this.status = status;
        this.codigo = codigo;
        this.detalle = detalle;
    }
}

// Error de reglas de negocio. Las rutas y modelos lo usan como new NegocioError(mensaje, status).
class NegocioError extends ErrorApp {
    constructor(mensaje, status = 400, opciones) {
        super(status, mensaje, opciones);
        this.name = 'NegocioError';
    }
}

const crear = (status, mensajePorDefecto) => (mensaje = mensajePorDefecto, opciones) =>
    new ErrorApp(status, mensaje, opciones);

const errores = {
    peticionInvalida: crear(400, 'La petición no es válida.'),
    noAutenticado: crear(401, 'Necesitás iniciar sesión.'),
    prohibido: crear(403, 'No tenés permisos para realizar esta acción.'),
    noEncontrado: crear(404, 'No se encontró el recurso.'),
    conflicto: crear(409, 'La operación entra en conflicto con el estado actual.'),
    noDisponible: crear(503, 'El servicio no está disponible.'),
};

// Express 4 no atrapa los errores de funciones async: este envoltorio los manda al errorHandler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Convierte errores de PostgreSQL (por su código) en errores HTTP entendibles.
function traducirErrorPg(error) {
    switch (error.code) {
        case '23503': // clave foránea
            return /is still referenced/i.test(error.detail || '')
                ? errores.conflicto('No se puede eliminar porque tiene registros asociados.')
                : errores.peticionInvalida('Hace referencia a un registro que no existe.');
        case '23505':
            return errores.conflicto('Ya existe un registro con esos datos.');
        case '23502':
            return errores.peticionInvalida('Falta un dato obligatorio.');
        case '23514':
            return errores.peticionInvalida('Un dato no cumple las reglas permitidas.');
        case '22P02':
            return errores.peticionInvalida('Un dato tiene un formato inválido.');
        case '22001':
            return errores.peticionInvalida('Un texto supera el largo permitido.');
        case 'ECONNREFUSED':
        case 'ENOTFOUND':
        case 'ETIMEDOUT':
        case '57P01':
            return errores.noDisponible('No se pudo conectar con la base de datos.');
        default:
            return null;
    }
}

// Valida que el parámetro :id en las rutas sea un número entero positivo
const validarId = (req, res, next, id) => {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
    }
    req.params.id = numero;
    next();
};

// Valida que un texto no esté vacío o solo tenga espacios
const textoValido = (texto) => {
    return typeof texto === 'string' && texto.trim().length > 0;
};

module.exports = { ErrorApp, NegocioError, errores, asyncHandler, traducirErrorPg, validarId, textoValido };