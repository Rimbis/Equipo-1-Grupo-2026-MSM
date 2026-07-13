const express = require('express');
const router = express.Router();
const Objeto = require('../models/Objeto');

// Obtener todos los objetos
router.get('/', async (req, res) => {
    try {
        const todos = await Objeto.getAll();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Agregar nuevo objeto
router.post('/add', async (req, res) => {
    try {
        const nuevo = await Objeto.create(req.body);
        res.status(201).json({ mensaje: 'Objeto guardado', data: nuevo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar estado
router.patch('/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;
        const actualizado = await Objeto.updateEstado(req.params.id, estado);
        res.json({ mensaje: 'Estado actualizado', data: actualizado });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;