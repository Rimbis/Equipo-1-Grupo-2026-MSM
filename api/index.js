const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas con prefijo /api
app.use('/api/personas', require('../Backend/routes/personas'));
app.use('/api/objetos', require('../Backend/routes/objetos'));
app.use('/api/prestamos', require('../Backend/routes/prestamos'));
app.use('/api/categorias', require('../Backend/routes/categorias'));

module.exports = app;