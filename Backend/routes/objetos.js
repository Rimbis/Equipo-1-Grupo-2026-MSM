// Rutas de objetos. server.js exige sesión antes de ingresar a este router.
// req contiene parámetros/cuerpo; res construye la respuesta HTTP en JSON.

const express = require('express');
const router = express.Router();
const Objeto = require('../models/Objeto');
const { asyncHandler, validarId, textoValido, NegocioError } = require('../utils/errores');

// Cada ruta con :id valida el parámetro antes de ejecutar su controlador.
router.param('id', validarId);

// GET /api/objetos: Devuelve objetos con categoría, estado y el indicador eliminable.
// asyncHandler envía los rechazos asíncronos al middleware de errores.
router.get('/', asyncHandler(async (req, res) => {
    res.json(await Objeto.getAll());
}));

// POST /api/objetos: Recibe nombre y categoria_id entero positivo; el modelo crea un objeto disponible.
// Responde HTTP 201 con el registro creado; las validaciones fallidas producen 400.
router.post('/', asyncHandler(async (req, res) => {
    const { nombre, categoria_id } = req.body;
    if (!textoValido(nombre)) {
        throw new NegocioError('El nombre es requerido', 400);
    }
    if (!Number.isInteger(categoria_id) || categoria_id <= 0) {
        throw new NegocioError('La categoría es requerida', 400);
    }
    const nuevo = await Objeto.create({ nombre, categoria_id });
    res.status(201).json({ mensaje: 'Objeto creado', data: nuevo });
}));

// DELETE /api/objetos/:id: El modelo rechaza IDs protegidos o con préstamos asociados; responde éxito si elimina.
router.delete('/:id', asyncHandler(async (req, res) => {
    await Objeto.delete(req.params.id);
    res.json({ mensaje: 'Objeto eliminado correctamente' });
}));

module.exports = router;