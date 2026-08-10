const pool = require('../config/db');

const Objeto = {
    getAll: async () => {
        const result = await pool.query(
            'SELECT objetos.*, categorias.nombre as categoria_nombre FROM objetos LEFT JOIN categorias ON objetos.categoria_id = categorias.id ORDER BY objetos.nombre'
        );
        return result.rows;
    },

    create: async ({ nombre, categoria_id }) => {
        const result = await pool.query(
            'INSERT INTO objetos (nombre, categoria_id, estado) VALUES ($1, $2, $3) RETURNING *',
            [nombre, categoria_id, 'disponible']
        );
        return result.rows[0];
    },

    updateEstado: async (id, estado) => {
        const result = await pool.query(
            'UPDATE objetos SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        return result.rows[0];
    }
};

module.exports = Objeto;