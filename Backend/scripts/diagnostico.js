// Diagnóstico del login. Copiar en Backend/scripts/diagnostico.js y correr desde Backend/:
//   node scripts/diagnostico.js <usuario> '<contraseña>'
// (la contraseña SIEMPRE entre comillas simples)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const ok = (m) => console.log('  [OK]   ' + m);
const mal = (m) => console.log('  [FALLA] ' + m);

(async () => {
  const [usuarioArg, password] = process.argv.slice(2);
  if (!usuarioArg || !password) {
    console.log("Uso: node scripts/diagnostico.js <usuario> '<contraseña>'");
    process.exit(1);
  }

  console.log('\n1) Variables de entorno');
  for (const v of ['DATABASE_URL', 'JWT_SECRET']) {
    process.env[v] ? ok(`${v} definida`) : mal(`${v} NO está definida en Backend/.env`);
  }
  if (process.env.DATABASE_URL) {
    try {
      const u = new URL(process.env.DATABASE_URL);
      ok(`Base: host=${u.hostname} puerto=${u.port} usuario=${u.username}`);
    } catch {
      mal('DATABASE_URL no es una URL válida (¿caracteres especiales sin codificar en la contraseña?)');
    }
  }

  console.log('\n2) Código del login (routes/auth.js)');
  const auth = fs.readFileSync(path.join(__dirname, '..', 'routes', 'auth.js'), 'utf8');
  if (auth.includes('buscarPorUsuario')) ok('El login consulta la tabla usuarios');
  else mal('El login TODAVÍA compara contra el .env. El cambio de auth.js no está aplicado en este archivo.');

  console.log('\n3) Conexión a la base');
  const pool = require('../config/db');
  try {
    await pool.query('SELECT 1');
    ok('Conecta a la base');
  } catch (e) {
    mal('No conecta: ' + e.message);
    process.exit(1);
  }

  console.log('\n4) Usuarios en la tabla');
  const Usuario = require('../models/Usuario');
  const lista = await Usuario.listar();
  console.log('  Usuarios encontrados:', lista.map((u) => `"${u.usuario}" (${u.rol})`).join(', ') || 'NINGUNO');

  console.log('\n5) Usuario y contraseña ingresados');
  const buscado = usuarioArg.trim().toLowerCase();
  const fila = await Usuario.buscarPorUsuario(buscado);
  if (!fila) {
    mal(`No existe el usuario "${buscado}" en ESTA base. Se creó en otra base, o con otro nombre.`);
  } else {
    ok(`Existe el usuario "${fila.usuario}"`);
    const coincide = await bcrypt.compare(password, fila.password_hash);
    coincide
      ? ok('La contraseña COINCIDE con el hash guardado. El login desde acá debería andar.')
      : mal('La contraseña NO coincide con el hash guardado. Resetéala con crear-admin (con comillas simples).');
  }

  await pool.end();
  console.log('');
})().catch((e) => {
  console.error('Error inesperado:', e.message);
  process.exit(1);
});