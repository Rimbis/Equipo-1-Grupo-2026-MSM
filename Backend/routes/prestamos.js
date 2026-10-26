const express = require('express');
const router = express.Router();
const Prestamo = require('../models/Prestamo');
const { asyncHandler, validarId, NegocioError } = require('../utils/errores');

router.param('id', validarId);

router.get('/', asyncHandler(async (req, res) => {
    res.json(await Prestamo.getActivos());
}));

router.post('/', asyncHandler(async (req, res) => {
    const { persona_id, objeto_id } = req.body;
    if (!Number.isInteger(persona_id) || persona_id <= 0 || !Number.isInteger(objeto_id) || objeto_id <= 0) {
        throw new NegocioError('persona_id y objeto_id deben ser números enteros válidos', 400);
    }
    const nuevo = await Prestamo.create({ persona_id, objeto_id });
    res.status(201).json({ mensaje: 'Préstamo registrado', data: nuevo });
}));

router.patch('/:id/devolver', asyncHandler(async (req, res) => {
    await Prestamo.devolver(req.params.id);
    res.json({ mensaje: 'Objeto devuelto correctamente' });
}));

module.exports = router;