/**
 * Configura Express y define el orden de procesamiento de cada solicitud:
 * seguridad y JSON -> rutas públicas -> autenticación -> rutas de negocio -> errores.
 * Los routers validan las peticiones; los modelos ejecutan SQL y reglas de negocio.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const pool = require('./config/db');
const requireAuth = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Detiene el arranque si no están las credenciales y la clave de firma requeridas.
// config/db.js verifica DATABASE_URL al importarse, antes de este bloque.
for (const variable of ['JWT_SECRET', 'BIBLIOTECARIO_USER', 'BIBLIOTECARIO_PASSWORD_HASH']) {
    if (!process.env[variable]) {
        throw new Error(`Falta ${variable} en Backend/.env`);
    }
}

const app = express();
app.use(helmet());
// FRONTEND_URL: una o varias URLs separadas por coma (ej. https://biblioteca.vercel.app).
// Si no se define, se permite cualquier origen (cómodo solo para desarrollo).
// map normaliza cada URL y filter elimina entradas vacías de la lista.
const origenes = (process.env.FRONTEND_URL || '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
app.use(cors({
    origin: origenes.length ? origenes : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
// Convierte cuerpos JSON a req.body y rechaza cuerpos de más de 100 KB.
app.use(express.json({ limit: '100kb' }));

// Rutas públicas
/**
 * GET /api/health: ruta pública de diagnóstico para Render y monitoreo.
 * Responde 200 si PostgreSQL está accesible o 503 si la conexión está degradada.
 * No comprueba que estén todas las tablas ni publica detalles de conexión.
 */
app.get('/api/health', async (req, res) => {
    const database = await pool.verificarConexion();
    res.status(database.ok ? 200 : 503).json({
        status: database.ok ? 'ok' : 'degraded',
        build: 'login-db-v1',
        // El detalle del error solo se loguea, no se expone
        database: { ok: database.ok },
    });
});
// /login es pública; /me aplica su propia comprobación de sesión.
app.use('/api/auth', require('./routes/auth'));

// Todo lo que sigue requiere token
app.use('/api', requireAuth);
app.use('/api/personas', require('./routes/personas'));
app.use('/api/objetos', require('./routes/objetos'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/categorias', require('./routes/categorias'));

// Captura rutas API no reconocidas, después de comprobar autenticación.
app.use('/api', (req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
// Debe ir después de las rutas para recibir sus errores mediante next(error).
app.use(errorHandler);

// Solo escuchar si se ejecuta directamente (no serverless)
if (require.main === module) {
    const port = Number(process.env.PORT) || 4000;
    // Este callback se ejecuta al abrir el puerto; luego informa el estado de la base.
    // La API puede estar escuchando aunque la base falle; /api/health reflejará ese fallo.
    app.listen(port, async () => {
        console.log(`Servidor corriendo en puerto ${port}`);
        const database = await pool.verificarConexion();
        if (database.ok) console.log('Base de datos conectada');
        else console.error(database.message);
    });
}

module.exports = app;