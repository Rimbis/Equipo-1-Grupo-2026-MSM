const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const todas = await Categoria.getAll();
        res.json(todas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Agregar categoría
router.post('/add', async (req, res) => {
    try {
        const nueva = await Categoria.create(req.body);
        res.status(201).json({ mensaje: 'Categoría creada', data: nueva });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;