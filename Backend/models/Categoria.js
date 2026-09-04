const pool = require('../config/db');
const { categorias: ULTIMA_CATEGORIA_PROTEGIDA } = require('../config/registrosProtegidos');

const Categoria = {
    getAll: async () => {
        const result = await pool.query(
            'SELECT *, (id > $1) AS eliminable FROM categorias ORDER BY nombre',
            [ULTIMA_CATEGORIA_PROTEGIDA]
        );
        return result.rows;
    },

    create: async ({ nombre }) => {
        const result = await pool.query(
            'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
            [nombre]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        const result = await pool.query(
            'DELETE FROM categorias WHERE id = $1 AND id > $2 RETURNING *',
            [id, ULTIMA_CATEGORIA_PROTEGIDA]
        );
        return result.rows[0];
    },
};

module.exports = Categoria;
