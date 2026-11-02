// Punto de entrada alternativo: exporta la misma aplicación configurada en server.js.
// Importarlo no abre un puerto; server.js solo escucha cuando se ejecuta directamente.

// La aplicación Express vive en server.js (con autenticación, helmet y errorHandler).

module.exports = require('./server');