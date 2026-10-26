const express = require('express');
const router = express.Router();
const Objeto = require('../models/Objeto');
const { asyncHandler, validarId, textoValido, NegocioError } = require('../utils/errores');

router.param('id', validarId);

router.get('/', asyncHandler(async (req, res) => {
    res.json(await Objeto.getAll());
}));

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

router.delete('/:id', asyncHandler(async (req, res) => {
    await Objeto.delete(req.params.id);
    res.json({ mensaje: 'Objeto eliminado correctamente' });
}));

module.exports = router;