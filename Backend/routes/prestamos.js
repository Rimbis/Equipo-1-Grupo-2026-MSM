// Rutas de prestamos. server.js exige sesión antes de ingresar a este router.
// req contiene parámetros/cuerpo; res construye la respuesta HTTP en JSON.

const express = require('express');
const router = express.Router();
const Prestamo = require('../models/Prestamo');
const { asyncHandler, validarId, NegocioError } = require('../utils/errores');

// Cada ruta con :id valida el parámetro antes de ejecutar su controlador.
router.param('id', validarId);

// GET /api/prestamos: Devuelve solo préstamos activos con datos de la persona y del objeto.
// asyncHandler envía los rechazos asíncronos al middleware de errores.
router.get('/', asyncHandler(async (req, res) => {
    res.json(await Prestamo.getActivos());
}));

// POST /api/prestamos: Recibe persona_id y objeto_id como enteros positivos; el modelo controla existencia y disponibilidad.
// Responde HTTP 201 con el registro creado; las validaciones fallidas producen 400.
router.post('/', asyncHandler(async (req, res) => {
    const { persona_id, objeto_id } = req.body;
    if (!Number.isInteger(persona_id) || persona_id <= 0 || !Number.isInteger(objeto_id) || objeto_id <= 0) {
        throw new NegocioError('persona_id y objeto_id deben ser números enteros válidos', 400);
    }
    const nuevo = await Prestamo.create({ persona_id, objeto_id });
    res.status(201).json({ mensaje: 'Préstamo registrado', data: nuevo });
}));

// PATCH /api/prestamos/:id/devolver: registra devolución y libera el objeto.
// El modelo rechaza préstamos inexistentes o devueltos; ambas actualizaciones son atómicas.
router.patch('/:id/devolver', asyncHandler(async (req, res) => {
    await Prestamo.devolver(req.params.id);
    res.json({ mensaje: 'Objeto devuelto correctamente' });
}));

module.exports = router;