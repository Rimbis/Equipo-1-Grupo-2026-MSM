// Modelo de préstamos: conserva juntos los cambios de préstamos y objetos.
// Toda operación transaccional usa una conexión propia, no llamadas sueltas a pool.query.

const pool = require('../config/db');
const { NegocioError } = require('../utils/errores');

const Prestamo = {
    /**
     * Lista únicamente préstamos activos, del más reciente al más antiguo.
     * Une personas y objetos para devolver nombres y curso junto con los IDs.
     */
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

    /**
     * Registra un préstamo y marca el objeto como prestado en la misma transacción.
     * Comprueba persona y objeto existentes (404) y disponibilidad (409).
     * Devuelve la fila del préstamo creado; si una operación falla, revierte ambas.
     */
    create: async ({ persona_id, objeto_id }) => {
        // Reserva una conexión para que todas las sentencias compartan la transacción.
        const client = await pool.connect();
        try {
            // Los cambios se confirman juntos con COMMIT o se deshacen con ROLLBACK.
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

            // INSERT y UPDATE mantienen coherentes el préstamo y la disponibilidad.
            const result = await client.query(
                'INSERT INTO prestamos (persona_id, objeto_id, estado) VALUES ($1, $2, $3) RETURNING *',
                [persona_id, objeto_id, 'activo']
            );
            await client.query('UPDATE objetos SET estado = $1 WHERE id = $2', ['prestado', objeto_id]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (err) {
            // El error se propaga a la ruta después de descartar los cambios parciales.
            await client.query('ROLLBACK');
            throw err;
        } finally {
            // Devuelve la conexión al pool tanto en éxito como en error.
            client.release();
        }
    },

    /**
     * Devuelve un préstamo activo: registra fecha_devolucion y libera el objeto.
     * No elimina el historial. Rechaza un ID inexistente (404) o ya devuelto (409).
     * Resuelve sin devolver datos; la ruta genera el mensaje de confirmación.
     */
    devolver: async (id) => {
        // Reserva una conexión para que todas las sentencias compartan la transacción.
        const client = await pool.connect();
        try {
            // Los cambios se confirman juntos con COMMIT o se deshacen con ROLLBACK.
            await client.query('BEGIN');

            // Bloquea la fila del préstamo para serializar devoluciones simultáneas.
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

            // NOW() registra la fecha del servidor de base de datos.
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
            // El error se propaga a la ruta después de descartar los cambios parciales.
            await client.query('ROLLBACK');
            throw err;
        } finally {
            // Devuelve la conexión al pool tanto en éxito como en error.
            client.release();
        }
    },
};

module.exports = Prestamo;