// Modelo de categoría: concentra consultas y reglas que no dependen de HTTP.
// pool.query devuelve un resultado de PostgreSQL; rows contiene sus registros.

const pool = require('../config/db');
const { categorias: ULTIMA_CATEGORIA_PROTEGIDA } = require('../config/registrosProtegidos');
const { NegocioError } = require('../utils/errores');

const Categoria = {
    /**
     * Devuelve una lista de registros para el frontend. Ordena alfabéticamente por nombre.
     * eliminable depende del límite de IDs; no comprueba relaciones que impidan borrar.
     */
    getAll: async () => {
        const result = await pool.query(
            'SELECT *, (id > $1) AS eliminable FROM categorias ORDER BY nombre',
            [ULTIMA_CATEGORIA_PROTEGIDA]
        );
        return result.rows;
    },

    /**
     * Crea un registro. Recorta el nombre antes de crear la categoría.
     * Usa parámetros SQL ($1, etc.) para separar datos de la consulta.
     * Devuelve la fila insertada mediante RETURNING; la ruta valida los campos requeridos.
     */
    create: async ({ nombre }) => {
        const result = await pool.query(
            'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
            [nombre.trim()]
        );
        return result.rows[0];
    },

    /**
     * Elimina el registro por ID y devuelve la fila borrada.
     * Rechaza IDs protegidos con 403, inexistentes con 404 y referencias con 409.
     */
    delete: async (id) => {
        if (id <= ULTIMA_CATEGORIA_PROTEGIDA) {
            throw new NegocioError('Esta categoría es predeterminada y no se puede eliminar.', 403);
        }
        try {
            const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
            if (!result.rows[0]) throw new NegocioError('Categoría no encontrada', 404);
            return result.rows[0];
        } catch (err) {
            // PostgreSQL conserva la integridad: 23503 indica una clave foránea asociada.
            if (err.code === '23503') {
                throw new NegocioError('No se puede eliminar porque hay objetos asociados a esta categoría.', 409);
            }
            throw err;
        }
    },
};

module.exports = Categoria;