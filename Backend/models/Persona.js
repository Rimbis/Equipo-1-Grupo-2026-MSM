const pool = require('../config/db');

const Persona = {
    getAll: async () => {
        const result = await pool.query('SELECT * FROM personas ORDER BY apellido');
        return result.rows;
    },

    create: async ({ nombre, apellido, curso }) => {
        const result = await pool.query(
            'INSERT INTO personas (nombre, apellido, curso) VALUES ($1, $2, $3) RETURNING *',
            [nombre, apellido, curso]
        );
        return result.rows[0];
    }
};

module.exports = Persona;