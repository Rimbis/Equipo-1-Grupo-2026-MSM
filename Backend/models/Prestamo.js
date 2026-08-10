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
        const result = await pool.query(
            'INSERT INTO prestamos (persona_id, objeto_id, estado) VALUES ($1, $2, $3) RETURNING *',
            [persona_id, objeto_id, 'activo']
        );
        // Marcar el objeto como prestado
        await pool.query('UPDATE objetos SET estado = $1 WHERE id = $2', ['prestado', objeto_id]);
        return result.rows[0];
    },

    devolver: async (id) => {
        const prestamo = await pool.query('SELECT objeto_id FROM prestamos WHERE id = $1', [id]);
        const objeto_id = prestamo.rows[0].objeto_id;
        
        await pool.query(
            'UPDATE prestamos SET estado = $1, fecha_devolucion = NOW() WHERE id = $2',
            ['devuelto', id]
        );
        await pool.query('UPDATE objetos SET estado = $1 WHERE id = $2', ['disponible', objeto_id]);
    }
};

module.exports = Prestamo;