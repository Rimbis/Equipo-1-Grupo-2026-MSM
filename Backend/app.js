// Aplicación Express compartida: la usan Backend/server.js (Render / local)
// y api/index.js (función serverless de Vercel).
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const { requireAuth } = require('./middleware/auth');

const app = express();

// Render está detrás de un proxy: necesario para que req.ip sea la IP real del cliente.
app.set('trust proxy', 1);

// CORS_ORIGIN: URLs del frontend separadas por coma (ej. https://biblioteca.vercel.app).
// Si no se define, se permite cualquier origen (cómodo para desarrollo).
const origenes = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
app.use(cors(origenes.length ? { origin: origenes } : {}));
app.use(express.json());

// Health check pública (la usa Render para saber si el servicio está vivo).
app.get('/api/health', async (req, res) => {
  const database = await pool.verificarConexion({ forzar: true });
  res.status(database.ok ? 200 : 503).json({
    status: database.ok ? 'ok' : 'degraded',
    database,
  });
});

// Evita que cada ruta devuelva un 500 ambiguo cuando Supabase no está disponible.
app.use('/api', async (req, res, next) => {
  const database = await pool.verificarConexion();
  if (!database.ok) {
    return res.status(503).json({ message: database.message });
  }
  next();
});

// Rutas públicas (login) y, dentro de auth.js, las de administración de usuarios.
app.use('/api/auth', require('./routes/auth'));

// Todo lo que sigue exige haber iniciado sesión.
app.use('/api', requireAuth);
app.use('/api/personas', require('./routes/personas'));
app.use('/api/objetos', require('./routes/objetos'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/categorias', require('./routes/categorias'));


// Respuestas siempre en JSON (antes Express devolvía HTML y el frontend mostraba "respuesta inválida").
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

module.exports = app;
