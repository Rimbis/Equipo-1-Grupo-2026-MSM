// Crea (o resetea la contraseña de) un usuario administrador desde la terminal.
// Uso:  npm run crear-admin -- <usuario> <contraseña> "<Nombre completo>"
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const Usuario = require('../models/Usuario');

(async () => {
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
    const hash = await bcrypt.hash(password, 10);
    const existente = await Usuario.buscarPorUsuario(usuario.toLowerCase());
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
    await pool.end();
  }
})();
