const pool = require('../config/db');

const Categoria = {
    getAll: async () => {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
        return result.rows;
    },

    create: async ({ nombre }) => {
        const result = await pool.query(
            'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
            [nombre]
        );
        return result.rows[0];
    }
};

module.exports = Categoria;