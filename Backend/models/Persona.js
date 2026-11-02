// Modelo de persona: concentra consultas y reglas que no dependen de HTTP.
// pool.query devuelve un resultado de PostgreSQL; rows contiene sus registros.

const pool = require('../config/db');
const { personas: ULTIMA_PERSONA_PROTEGIDA } = require('../config/registrosProtegidos');
const { NegocioError } = require('../utils/errores');

const Persona = {
    /**
     * Devuelve una lista de registros para el frontend. Ordena por apellido e incluye los campos de cada persona.
     * eliminable depende del límite de IDs; no comprueba relaciones que impidan borrar.
     */
    getAll: async () => {
        const result = await pool.query(
            'SELECT *, (id > $1) AS eliminable FROM personas ORDER BY apellido',
            [ULTIMA_PERSONA_PROTEGIDA]
        );
        return result.rows;
    },

    /**
     * Crea un registro. Recorta nombre, apellido y curso antes de insertarlos.
     * Usa parámetros SQL ($1, etc.) para separar datos de la consulta.
     * Devuelve la fila insertada mediante RETURNING; la ruta valida los campos requeridos.
     */
    create: async ({ nombre, apellido, curso }) => {
        const result = await pool.query(
            'INSERT INTO personas (nombre, apellido, curso) VALUES ($1, $2, $3) RETURNING *',
            [nombre.trim(), apellido.trim(), curso.trim()]
        );
        return result.rows[0];
    },

    /**
     * Elimina el registro por ID y devuelve la fila borrada.
     * Rechaza IDs protegidos con 403, inexistentes con 404 y referencias con 409.
     */
    delete: async (id) => {
        if (id <= ULTIMA_PERSONA_PROTEGIDA) {
            throw new NegocioError('Esta persona es predeterminada y no se puede eliminar.', 403);
        }
        try {
            const result = await pool.query('DELETE FROM personas WHERE id = $1 RETURNING *', [id]);
            if (!result.rows[0]) throw new NegocioError('Persona no encontrada', 404);
            return result.rows[0];
        } catch (err) {
            // PostgreSQL conserva la integridad: 23503 indica una clave foránea asociada.
            if (err.code === '23503') {
                throw new NegocioError('No se puede eliminar porque la persona tiene préstamos asociados.', 409);
            }
            throw err;
        }
    },
};

module.exports = Persona;