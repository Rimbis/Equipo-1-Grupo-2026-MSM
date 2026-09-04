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

router.delete('/:id', async (req, res) => {
    try {
        const eliminada = await Categoria.delete(req.params.id);
        if (!eliminada) return res.status(403).json({ message: 'Esta categoría es predeterminada y no se puede eliminar.' });
        res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (error) {
        if (error.code === '23503') return res.status(409).json({ message: 'No se puede eliminar porque hay objetos asociados a esta categoría.' });
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
