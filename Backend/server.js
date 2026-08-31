const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const database = await pool.verificarConexion();
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

// Rutas
app.use('/api/personas', require('./routes/personas'));
app.use('/api/objetos', require('./routes/objetos'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/categorias', require('./routes/categorias'));

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
