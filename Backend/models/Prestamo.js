const pool = require('../config/db');
const { NegocioError } = require('../utils/errores');

const Prestamo = {
    getActivos: async () => {
        const result = await pool.query(`
            SELECT prestamos.*,
                   personas.nombre, personas.apellido, personas.curso,
                   objetos.nombre as objeto_nombre
            FROM prestamos
            LEFT JOIN personas ON prestamos.persona_id = personas.id
            LEFT JOIN objetos ON prestamos.objeto_id = objetos.id
            WHERE prestamos.estado = 'activo'
            ORDER BY prestamos.fecha_salida DESC
        `);
        return result.rows;
    },

    create: async ({ persona_id, objeto_id }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const persona = await client.query('SELECT 1 FROM personas WHERE id = $1', [persona_id]);
            if (persona.rows.length === 0) {
                throw new NegocioError('Persona no encontrada', 404);
            }

            // FOR UPDATE bloquea la fila hasta el COMMIT/ROLLBACK, evitando prestar el mismo objeto dos veces
            const objeto = await client.query(
                'SELECT estado FROM objetos WHERE id = $1 FOR UPDATE',
                [objeto_id]
            );
            if (objeto.rows.length === 0) {
                throw new NegocioError('Objeto no encontrado', 404);
            }
            if (objeto.rows[0].estado !== 'disponible') {
                throw new NegocioError('El objeto ya está prestado', 409);
            }

            const result = await client.query(
                'INSERT INTO prestamos (persona_id, objeto_id, estado) VALUES ($1, $2, $3) RETURNING *',
                [persona_id, objeto_id, 'activo']
            );
            await client.query('UPDATE objetos SET estado = $1 WHERE id = $2', ['prestado', objeto_id]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    devolver: async (id) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const prestamo = await client.query(
                'SELECT objeto_id, estado FROM prestamos WHERE id = $1 FOR UPDATE',
                [id]
            );
            if (prestamo.rows.length === 0) {
                throw new NegocioError('Préstamo no encontrado', 404);
            }
            if (prestamo.rows[0].estado !== 'activo') {
                throw new NegocioError('Este préstamo ya fue devuelto', 409);
            }

            await client.query(
                'UPDATE prestamos SET estado = $1, fecha_devolucion = NOW() WHERE id = $2',
                ['devuelto', id]
            );
            await client.query(
                'UPDATE objetos SET estado = $1 WHERE id = $2',
                ['disponible', prestamo.rows[0].objeto_id]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },
};

module.exports = Prestamo;