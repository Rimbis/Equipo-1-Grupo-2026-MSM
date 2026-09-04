const express = require('express');
const router = express.Router();
const Prestamo = require('../models/Prestamo');

// Errores de negocio esperables que puede tirar el modelo Prestamo.

const ERRORES_NEGOCIO = {
    'Objeto no encontrado': 404,
    'El objeto ya está prestado': 409,
    'Préstamo no encontrado': 404,
    'Este préstamo ya fue devuelto': 409,
};

function manejarError(error, res) {
    const status = ERRORES_NEGOCIO[error.message];
    if (status) {
        return res.status(status).json({ message: error.message });
    }
    // Error inesperado
    res.status(500).json({ message: error.message });
}

// Obtener préstamos activos
router.get('/', async (req, res) => {
    try {
        const activos = await Prestamo.getActivos();
        res.json(activos);
    } catch (error) {
        manejarError(error, res);
    }
});

// Registrar préstamo
router.post('/add', async (req, res) => {
    try {
        const { persona_id, objeto_id } = req.body;

        // Validación básica antes de tocar la base
        if (!persona_id || !objeto_id) {
            return res.status(400).json({ message: 'Faltan persona_id u objeto_id' });
        }

        const nuevo = await Prestamo.create({ persona_id, objeto_id });
        res.status(201).json({ mensaje: 'Préstamo registrado', data: nuevo });
    } catch (error) {
        manejarError(error, res);
    }
});

// Devolver objeto
router.patch('/:id/devolver', async (req, res) => {
    try {
        await Prestamo.devolver(req.params.id);
        res.json({ mensaje: 'Objeto devuelto correctamente' });
    } catch (error) {
        manejarError(error, res);
    }
});

module.exports = router;