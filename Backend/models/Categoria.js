const pool = require('../config/db');
const { categorias: ULTIMA_CATEGORIA_PROTEGIDA } = require('../config/registrosProtegidos');
const { NegocioError } = require('../utils/errores');

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
            [nombre.trim()]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        if (id <= ULTIMA_CATEGORIA_PROTEGIDA) {
            throw new NegocioError('Esta categoría es predeterminada y no se puede eliminar.', 403);
        }
        try {
            const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
            if (!result.rows[0]) throw new NegocioError('Categoría no encontrada', 404);
            return result.rows[0];
        } catch (err) {
            if (err.code === '23503') {
                throw new NegocioError('No se puede eliminar porque hay objetos asociados a esta categoría.', 409);
            }
            throw err;
        }
    },
};

module.exports = Categoria;