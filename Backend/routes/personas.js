const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const Persona = require('../models/Persona');
const { personas: ULTIMA_PERSONA_PROTEGIDA } = require('../config/registrosProtegidos');

// Obtener todas las personas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT *, (id > $1) AS eliminable FROM personas ORDER BY apellido',
            [ULTIMA_PERSONA_PROTEGIDA]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const eliminada = await Persona.delete(req.params.id);
        if (!eliminada) return res.status(403).json({ message: 'Esta persona es predeterminada y no se puede eliminar.' });
        res.json({ mensaje: 'Persona eliminada correctamente' });
    } catch (error) {
        if (error.code === '23503') return res.status(409).json({ message: 'No se puede eliminar porque la persona tiene préstamos asociados.' });
        res.status(500).json({ message: error.message });
    }
});

// Crear persona
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido, curso } = req.body;
        const result = await pool.query(
            'INSERT INTO personas (nombre, apellido, curso) VALUES ($1, $2, $3) RETURNING *',
            [nombre, apellido, curso]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
