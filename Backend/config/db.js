const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en Backend/.env');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});

pool.on('error', (error) => {
    console.error('Conexión de base de datos interrumpida:', error.message);
});

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
