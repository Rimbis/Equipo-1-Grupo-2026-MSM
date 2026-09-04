const pool = require('../config/db');

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

            // ANTES: se insertaba el préstamo directamente, sin chequear
            // el estado del objeto. Eso permitía prestar dos veces el
            // mismo objeto si dos pedidos llegaban casi juntos.
            // AHORA: primero leemos el objeto CON "FOR UPDATE" (especifica a quien). Eso bloquea
            // esa fila hasta que termine la transacción, entonces si dos
            // personas piden el mismo objeto al mismo tiempo, la segunda
            // query queda esperando a que la primera haga COMMIT o ROLLBACK,
            // y ya no puede "colarse" con datos viejos.
            const objeto = await client.query(
                'SELECT estado FROM objetos WHERE id = $1 FOR UPDATE',
                [objeto_id]
            );

            if (objeto.rows.length === 0) {
                throw new Error('Objeto no encontrado');
            }

            if (objeto.rows[0].estado !== 'disponible') {
                throw new Error('El objeto ya está prestado');
            }

            const result = await client.query(
                'INSERT INTO prestamos (persona_id, objeto_id, estado) VALUES ($1, $2, $3) RETURNING *',
                [persona_id, objeto_id, 'activo']
            );

            // Marcar el objeto como prestado
            await client.query(
                'UPDATE objetos SET estado = $1 WHERE id = $2',
                ['prestado', objeto_id]
            );

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

            // ANTES: se traía solo objeto_id, sin mirar el estado.
            // Eso permitía "devolver" dos veces el mismo préstamo
            // (por un doble click o un reintento de red) sin avisar.
            // AHORA: también traemos "estado" con FOR UPDATE, y si ya
            // estaba devuelto, cortamos con un error claro en vez de
            // pisar fecha_devolucion.
            const prestamo = await client.query(
                'SELECT objeto_id, estado FROM prestamos WHERE id = $1 FOR UPDATE',
                [id]
            );

            if (prestamo.rows.length === 0) {
                throw new Error('Préstamo no encontrado');
            }

            if (prestamo.rows[0].estado !== 'activo') {
                throw new Error('Este préstamo ya fue devuelto');
            }

            const objeto_id = prestamo.rows[0].objeto_id;

            await client.query(
                'UPDATE prestamos SET estado = $1, fecha_devolucion = NOW() WHERE id = $2',
                ['devuelto', id]
            );

            await client.query(
                'UPDATE objetos SET estado = $1 WHERE id = $2',
                ['disponible', objeto_id]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
};

module.exports = Prestamo;