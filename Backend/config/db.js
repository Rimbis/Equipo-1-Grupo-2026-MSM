// Conexión compartida a PostgreSQL. DATABASE_URL se lee del entorno o de .env.
// No se crea el esquema de tablas aquí; el SQL inicial está en sql/schema.sql.

const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en Backend/.env');
}

// El pool reutiliza conexiones; cada modelo lo importa para ejecutar consultas.
// SSL cifra el tráfico, pero rejectUnauthorized: false desactiva la validación del certificado.
// Los tiempos están en milisegundos: 15 s para conectar y 30 s de inactividad.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
});

// Registra fallos en conexiones inactivas del pool; no responde solicitudes HTTP.
pool.on('error', (error) => {
    console.error('Conexión de base de datos interrumpida:', error.message);
});

/**
 * Ejecuta SELECT 1 para comprobar acceso a PostgreSQL, sin modificar datos.
 * Devuelve { ok: true } o { ok: false, message }; captura el error de conexión
 * para que el arranque y /api/health puedan informar el estado del servicio.
 */
pool.verificarConexion = async () => {
    try {
        await pool.query('SELECT 1');
        return { ok: true };
    } catch (error) {
        const tenantInvalido = /tenant\/user .* not found/i.test(error.message);
        return {
            ok: false,
            message: tenantInvalido
                ? 'La DATABASE_URL apunta a un proyecto o pooler de Supabase inexistente. Actualizala desde Supabase > Connect.'
                : `No se pudo conectar a la base de datos: ${error.message}`,
        };
    }
};

module.exports = pool;
