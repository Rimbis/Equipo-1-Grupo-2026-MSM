const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener todas las personas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM personas ORDER BY apellido');
        res.json(result.rows);
    } catch (error) {
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