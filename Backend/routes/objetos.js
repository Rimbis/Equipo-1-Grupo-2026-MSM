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
        const { nombre } = req.body;
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }
        const nueva = await Categoria.create({ nombre });
        res.status(201).json({ mensaje: 'Categoría creada', data: nueva });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar estado
router.patch('/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;
        const estadosValidos = ['disponible', 'prestado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }
        const actualizado = await Objeto.updateEstado(req.params.id, estado);
        res.json({ mensaje: 'Estado actualizado', data: actualizado });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const eliminado = await Objeto.delete(req.params.id);
        if (!eliminado) return res.status(403).json({ message: 'Este objeto es predeterminado y no se puede eliminar.' });
        res.json({ mensaje: 'Objeto eliminado correctamente' });
    } catch (error) {
        if (error.code === '23503') return res.status(409).json({ message: 'No se puede eliminar porque el objeto tiene préstamos asociados.' });
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
