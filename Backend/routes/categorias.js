// Rutas de categorias. server.js exige sesión antes de ingresar a este router.
// req contiene parámetros/cuerpo; res construye la respuesta HTTP en JSON.

const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');
const { asyncHandler, validarId, textoValido, NegocioError } = require('../utils/errores');

// Cada ruta con :id valida el parámetro antes de ejecutar su controlador.
router.param('id', validarId);

// GET /api/categorias: Devuelve categorías ordenadas por nombre y su indicador eliminable.
// asyncHandler envía los rechazos asíncronos al middleware de errores.
router.get('/', asyncHandler(async (req, res) => {
    res.json(await Categoria.getAll());
}));

// POST /api/categorias: Recibe un nombre con contenido; el modelo elimina espacios de los extremos.
// Responde HTTP 201 con el registro creado; las validaciones fallidas producen 400.
router.post('/', asyncHandler(async (req, res) => {
    if (!textoValido(req.body.nombre)) {
        throw new NegocioError('El nombre es requerido', 400);
    }
    const nueva = await Categoria.create({ nombre: req.body.nombre });
    res.status(201).json({ mensaje: 'Categoría creada', data: nueva });
}));

// DELETE /api/categorias/:id: El modelo rechaza IDs protegidos o categorías con objetos; responde éxito si elimina.
router.delete('/:id', asyncHandler(async (req, res) => {
    await Categoria.delete(req.params.id);
    res.json({ mensaje: 'Categoría eliminada correctamente' });
}));

module.exports = router;