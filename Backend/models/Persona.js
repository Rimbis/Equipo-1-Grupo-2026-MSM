const pool = require('../config/db');
const { personas: ULTIMA_PERSONA_PROTEGIDA } = require('../config/registrosProtegidos');
const { NegocioError } = require('../utils/errores');

const Persona = {
    getAll: async () => {
        const result = await pool.query(
            'SELECT *, (id > $1) AS eliminable FROM personas ORDER BY apellido',
            [ULTIMA_PERSONA_PROTEGIDA]
        );
        return result.rows;
    },

    create: async ({ nombre, apellido, curso }) => {
        const result = await pool.query(
            'INSERT INTO personas (nombre, apellido, curso) VALUES ($1, $2, $3) RETURNING *',
            [nombre.trim(), apellido.trim(), curso.trim()]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        if (id <= ULTIMA_PERSONA_PROTEGIDA) {
            throw new NegocioError('Esta persona es predeterminada y no se puede eliminar.', 403);
        }
        try {
            const result = await pool.query('DELETE FROM personas WHERE id = $1 RETURNING *', [id]);
            if (!result.rows[0]) throw new NegocioError('Persona no encontrada', 404);
            return result.rows[0];
        } catch (err) {
            if (err.code === '23503') {
                throw new NegocioError('No se puede eliminar porque la persona tiene préstamos asociados.', 409);
            }
            throw err;
        }
    },
};

module.exports = Persona;