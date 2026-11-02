// Modelo de objeto: concentra consultas y reglas que no dependen de HTTP.
// pool.query devuelve un resultado de PostgreSQL; rows contiene sus registros.

const pool = require('../config/db');
const { objetos: ULTIMO_OBJETO_PROTEGIDO } = require('../config/registrosProtegidos');
const { NegocioError } = require('../utils/errores');

const Objeto = {
    /**
     * Devuelve una lista de registros para el frontend. Incluye el nombre de la categoría con LEFT JOIN, aun si falta la categoría.
     * eliminable depende del límite de IDs; no comprueba relaciones que impidan borrar.
     */
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

    /**
     * Crea un registro. Recorta el nombre, guarda su categoría y asigna estado disponible.
     * Usa parámetros SQL ($1, etc.) para separar datos de la consulta.
     * Devuelve la fila insertada mediante RETURNING; la ruta valida los campos requeridos.
     */
    create: async ({ nombre, categoria_id }) => {
        const result = await pool.query(
            'INSERT INTO objetos (nombre, categoria_id, estado) VALUES ($1, $2, $3) RETURNING *',
            [nombre.trim(), categoria_id, 'disponible']
        );
        return result.rows[0];
    },

    /**
     * Elimina el registro por ID y devuelve la fila borrada.
     * Rechaza IDs protegidos con 403, inexistentes con 404 y referencias con 409.
     */
    delete: async (id) => {
        if (id <= ULTIMO_OBJETO_PROTEGIDO) {
            throw new NegocioError('Este objeto es predeterminado y no se puede eliminar.', 403);
        }
        try {
            const result = await pool.query('DELETE FROM objetos WHERE id = $1 RETURNING *', [id]);
            if (!result.rows[0]) throw new NegocioError('Objeto no encontrado', 404);
            return result.rows[0];
        } catch (err) {
            // PostgreSQL conserva la integridad: 23503 indica una clave foránea asociada.
            if (err.code === '23503') {
                throw new NegocioError('No se puede eliminar porque el objeto tiene préstamos asociados.', 409);
            }
            throw err;
        }
    },
};

module.exports = Objeto;