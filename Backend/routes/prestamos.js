const express = require('express');
const router = express.Router();
const Prestamo = require('../models/Prestamo');

// Obtener préstamos activos
router.get('/', async (req, res) => {
    try {
        const activos = await Prestamo.getActivos();
        res.json(activos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Registrar préstamo
router.post('/add', async (req, res) => {
    try {
        const nuevo = await Prestamo.create(req.body);
        res.status(201).json({ mensaje: 'Préstamo registrado', data: nuevo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Devolver objeto
router.patch('/:id/devolver', async (req, res) => {
    try {
        await Prestamo.devolver(req.params.id);
        res.json({ mensaje: 'Objeto devuelto correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
