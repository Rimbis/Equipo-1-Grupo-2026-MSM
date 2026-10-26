const express = require('express');
const router = express.Router();
const Persona = require('../models/Persona');
const { asyncHandler, validarId, textoValido, NegocioError } = require('../utils/errores');

router.param('id', validarId);

router.get('/', asyncHandler(async (req, res) => {
    res.json(await Persona.getAll());
}));

router.post('/', asyncHandler(async (req, res) => {
    const { nombre, apellido, curso } = req.body;
    if (![nombre, apellido, curso].every(textoValido)) {
        throw new NegocioError('Nombre, apellido y curso son requeridos', 400);
    }
    const nueva = await Persona.create({ nombre, apellido, curso });
    res.status(201).json({ mensaje: 'Persona creada', data: nueva });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Persona.delete(req.params.id);
    res.json({ mensaje: 'Persona eliminada correctamente' });
}));

module.exports = router;