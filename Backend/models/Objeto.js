const pool = require('../config/db');
const { objetos: ULTIMO_OBJETO_PROTEGIDO } = require('../config/registrosProtegidos');
const { NegocioError } = require('../utils/errores');

const Objeto = {
    getAll: async () => {
        const result = await pool.query(
            `SELECT objetos.*, categorias.nombre as categoria_nombre,
                    (objetos.id > $1) AS eliminable
             FROM objetos
             LEFT JOIN categorias ON objetos.categoria_id = categorias.id
             ORDER BY objetos.nombre`,
            [ULTIMO_OBJETO_PROTEGIDO]
        );
        return result.rows;
    },

    create: async ({ nombre, categoria_id }) => {
        const result = await pool.query(
            'INSERT INTO objetos (nombre, categoria_id, estado) VALUES ($1, $2, $3) RETURNING *',
            [nombre.trim(), categoria_id, 'disponible']
        );
        return result.rows[0];
    },

    delete: async (id) => {
        if (id <= ULTIMO_OBJETO_PROTEGIDO) {
            throw new NegocioError('Este objeto es predeterminado y no se puede eliminar.', 403);
        }
        try {
            const result = await pool.query('DELETE FROM objetos WHERE id = $1 RETURNING *', [id]);
            if (!result.rows[0]) throw new NegocioError('Objeto no encontrado', 404);
            return result.rows[0];
        } catch (err) {
            if (err.code === '23503') {
                throw new NegocioError('No se puede eliminar porque el objeto tiene préstamos asociados.', 409);
            }
            throw err;
        }
    },
};

module.exports = Objeto;