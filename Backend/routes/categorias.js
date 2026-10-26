const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');
const { asyncHandler, validarId, textoValido, NegocioError } = require('../utils/errores');

router.param('id', validarId);

router.get('/', asyncHandler(async (req, res) => {
    res.json(await Categoria.getAll());
}));

router.post('/', asyncHandler(async (req, res) => {
    if (!textoValido(req.body.nombre)) {
        throw new NegocioError('El nombre es requerido', 400);
    }
    const nueva = await Categoria.create({ nombre: req.body.nombre });
    res.status(201).json({ mensaje: 'Categoría creada', data: nueva });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Categoria.delete(req.params.id);
    res.json({ mensaje: 'Categoría eliminada correctamente' });
}));

module.exports = router;