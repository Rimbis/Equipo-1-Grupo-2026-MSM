const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/personas', require('./routes/personas'));
app.use('/api/objetos', require('./routes/objetos'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/categorias', require('./routes/categorias'));

// Solo escuchar si se ejecuta directamente (no serverless)
if (require.main === module) {
  app.listen(process.env.PORT || 4000, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT || 4000}`);
  });
}


module.exports = app;
