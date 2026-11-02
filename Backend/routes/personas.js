// Rutas de personas. server.js exige sesión antes de ingresar a este router.
// req contiene parámetros/cuerpo; res construye la respuesta HTTP en JSON.

const express = require('express');
const router = express.Router();
const Persona = require('../models/Persona');
const { asyncHandler, validarId, textoValido, NegocioError } = require('../utils/errores');

// Cada ruta con :id valida el parámetro antes de ejecutar su controlador.
router.param('id', validarId);

// GET /api/personas: Devuelve personas ordenadas por apellido y su indicador eliminable.
// asyncHandler envía los rechazos asíncronos al middleware de errores.
router.get('/', asyncHandler(async (req, res) => {
    res.json(await Persona.getAll());
}));

// POST /api/personas: Recibe nombre, apellido y curso; todos deben ser textos con contenido.
// Responde HTTP 201 con el registro creado; las validaciones fallidas producen 400.
router.post('/', asyncHandler(async (req, res) => {
    const { nombre, apellido, curso } = req.body;
    if (![nombre, apellido, curso].every(textoValido)) {
        throw new NegocioError('Nombre, apellido y curso son requeridos', 400);
    }
    const nueva = await Persona.create({ nombre, apellido, curso });
    res.status(201).json({ mensaje: 'Persona creada', data: nueva });
}));

// DELETE /api/personas/:id: El modelo rechaza IDs protegidos o con préstamos asociados; responde éxito si elimina.
router.delete('/:id', asyncHandler(async (req, res) => {
    await Persona.delete(req.params.id);
    res.json({ mensaje: 'Persona eliminada correctamente' });
}));

module.exports = router;