// Crea (o resetea la contraseña de) un usuario administrador desde la terminal.
// Desde Backend: node scripts/crearAdmin.js <usuario> <contraseña> "<Nombre completo>"
// No existe actualmente un script npm crear-admin; el mensaje de uso del programa está desactualizado.
// Esta utilidad modifica usuarios en PostgreSQL, no las credenciales del login en el entorno.
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const Usuario = require('../models/Usuario');

/**
 * Función asíncrona que se ejecuta al iniciar este archivo desde la terminal.
 * Valida argumentos, genera el hash y crea el usuario o actualiza su contraseña y rol.
 * Finaliza con código de error si falla y cierra el pool al terminar la operación.
 */
(async () => {
  // Los argumentos después del usuario y la contraseña forman el nombre completo.
  const [usuario, password, ...resto] = process.argv.slice(2);
  const nombre = resto.join(' ') || usuario;
  if (!usuario || !password) {
    console.error('Uso: npm run crear-admin -- <usuario> <contraseña> "<Nombre completo>"');
    process.exit(1);
  }
  if (!/^[a-z0-9._-]{3,30}$/.test(usuario.toLowerCase()) || password.length < 8) {
    console.error('Usuario: 3-30 caracteres (letras, números . _ -). Contraseña: mínimo 8 caracteres.');
    process.exit(1);
  }
  try {
    // Guarda un hash bcrypt, no la contraseña original; normaliza el usuario a minúsculas.
    const hash = await bcrypt.hash(password, 10);
    const existente = await Usuario.buscarPorUsuario(usuario.toLowerCase());
    // Si ya existe, reinicia su contraseña y lo convierte en admin; si no, lo crea.
    if (existente) {
      await pool.query("UPDATE usuarios SET password_hash = $1, rol = 'admin' WHERE id = $2", [hash, existente.id]);
      console.log(`Contraseña de "${usuario}" actualizada (rol admin).`);
    } else {
      await Usuario.crear({ nombre, usuario: usuario.toLowerCase(), passwordHash: hash, rol: 'admin' });
      console.log(`Administrador "${usuario}" creado.`);
    }
  } catch (error) {
    console.error('No se pudo crear el administrador:', error.message);
    process.exitCode = 1;
  } finally {
    // Cierra conexiones para que el proceso de terminal pueda terminar.
    await pool.end();
  }
})();
