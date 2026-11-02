// Errores de la API: se lanzan con `throw` desde las rutas y los atrapa middleware/errorHandler.js
class ErrorApp extends Error {
    // Conserva estado HTTP, mensaje y metadatos opcionales para errorHandler.
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
    // Adaptación de ErrorApp para reglas de negocio; por defecto responde HTTP 400.
    constructor(mensaje, status = 400, opciones) {
        super(status, mensaje, opciones);
        this.name = 'NegocioError';
    }
}

// Fábrica de funciones: fija un estado HTTP y permite personalizar mensaje y opciones.
// Ejemplo: errores.noEncontrado("Objeto no encontrado") crea un ErrorApp con estado 404.
const crear = (status, mensajePorDefecto) => (mensaje = mensajePorDefecto, opciones) =>
    new ErrorApp(status, mensaje, opciones);

// Atajos para estados habituales. Cada función devuelve un error; quien la llama lo lanza.
const errores = {
    peticionInvalida: crear(400, 'La petición no es válida.'),
    noAutenticado: crear(401, 'Necesitás iniciar sesión.'),
    prohibido: crear(403, 'No tenés permisos para realizar esta acción.'),
    noEncontrado: crear(404, 'No se encontró el recurso.'),
    conflicto: crear(409, 'La operación entra en conflicto con el estado actual.'),
    noDisponible: crear(503, 'El servicio no está disponible.'),
};

/**
 * Envuelve un controlador de Express para llevar sus promesas rechazadas a next(error).
 * req es la solicitud, res la respuesta y next delega al middleware siguiente.
 * Así los controladores async de Express 4 llegan al errorHandler al fallar.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Traduce códigos de PostgreSQL o de conexión a errores controlados de la API.
 * Devuelve null si el código es desconocido para que errorHandler trate el fallo como 500.
 */
function traducirErrorPg(error) {
    switch (error.code) {
        case '23503': // clave foránea
            return /is still referenced/i.test(error.detail || '')
                ? errores.conflicto('No se puede eliminar porque tiene registros asociados.')
                : errores.peticionInvalida('Hace referencia a un registro que no existe.');
        case '23505': // Se repite un valor que debe ser único.
            return errores.conflicto('Ya existe un registro con esos datos.');
        case '23502': // Falta un valor en una columna NOT NULL.
            return errores.peticionInvalida('Falta un dato obligatorio.');
        case '23514': // Incumplimiento de una restricción CHECK.
            return errores.peticionInvalida('Un dato no cumple las reglas permitidas.');
        case '22P02': // Conversión inválida al tipo esperado por PostgreSQL.
            return errores.peticionInvalida('Un dato tiene un formato inválido.');
        case '22001': // Texto más largo que el tamaño permitido.
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

/**
 * Callback de router.param para :id: convierte el texto de la URL en entero positivo.
 * Reemplaza req.params.id por ese número y continúa, o termina con HTTP 400.
 */
const validarId = (req, res, next, id) => {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
    }
    req.params.id = numero;
    next();
};

// Predicado usado por las rutas: devuelve true solo para texto con contenido.
// trim se usa para verificar; la limpieza del valor guardado la hacen los modelos.
const textoValido = (texto) => {
    return typeof texto === 'string' && texto.trim().length > 0;
};

module.exports = { ErrorApp, NegocioError, errores, asyncHandler, traducirErrorPg, validarId, textoValido };