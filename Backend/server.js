const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const pool = require('./config/db');
const requireAuth = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

for (const variable of ['JWT_SECRET', 'BIBLIOTECARIO_USER', 'BIBLIOTECARIO_PASSWORD_HASH']) {
    if (!process.env[variable]) {
        throw new Error(`Falta ${variable} en Backend/.env`);
    }
}

const app = express();
app.use(helmet());
// FRONTEND_URL: una o varias URLs separadas por coma (ej. https://biblioteca.vercel.app).
// Si no se define, se permite cualquier origen (cómodo solo para desarrollo).
const origenes = (process.env.FRONTEND_URL || '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
app.use(cors({
    origin: origenes.length ? origenes : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json({ limit: '100kb' }));

// Rutas públicas
app.get('/api/health', async (req, res) => {
    const database = await pool.verificarConexion();
    res.status(database.ok ? 200 : 503).json({
        status: database.ok ? 'ok' : 'degraded',
        // El detalle del error solo se loguea, no se expone
        database: { ok: database.ok },
    });
});
app.use('/api/auth', require('./routes/auth'));

// Todo lo que sigue requiere token
app.use('/api', requireAuth);
app.use('/api/personas', require('./routes/personas'));
app.use('/api/objetos', require('./routes/objetos'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/categorias', require('./routes/categorias'));

app.use('/api', (req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use(errorHandler);

// Solo escuchar si se ejecuta directamente (no serverless)
if (require.main === module) {
    const port = Number(process.env.PORT) || 4000;
    app.listen(port, async () => {
        console.log(`Servidor corriendo en puerto ${port}`);
        const database = await pool.verificarConexion();
        if (database.ok) console.log('Base de datos conectada');
        else console.error(database.message);
    });
}

module.exports = app;