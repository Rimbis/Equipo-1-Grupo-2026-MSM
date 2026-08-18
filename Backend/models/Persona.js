const pool = require('../config/db');
const { personas: ULTIMA_PERSONA_PROTEGIDA } = require('../config/registrosProtegidos');

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
            [nombre, apellido, curso]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        const result = await pool.query(
            'DELETE FROM personas WHERE id = $1 AND id > $2 RETURNING *',
            [id, ULTIMA_PERSONA_PROTEGIDA]
        );
        return result.rows[0];
    },
};

module.exports = Persona;
