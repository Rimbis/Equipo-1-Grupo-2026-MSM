const pool = require('../config/db');

// La tabla se crea sola la primera vez (CREATE TABLE IF NOT EXISTS), así no hay
// que correr SQL a mano en Supabase para que funcione el login.
let tablaLista = null;
function asegurarTabla() {
    if (!tablaLista) {
        tablaLista = pool
            .query(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id            SERIAL PRIMARY KEY,
                    nombre        VARCHAR(100) NOT NULL,
                    usuario       VARCHAR(30)  NOT NULL UNIQUE,
                    password_hash TEXT         NOT NULL,
                    rol           VARCHAR(20)  NOT NULL DEFAULT 'bibliotecario'
                                  CHECK (rol IN ('admin', 'bibliotecario')),
                    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
                )
            `)
            .catch((error) => {
                tablaLista = null; // permite reintentar si falló la conexión
                throw error;
            });
    }
    return tablaLista;
}

const PUBLICO = 'id, nombre, usuario, rol, creado_en';

const Usuario = {
    contar: async () => {
        await asegurarTabla();
        const r = await pool.query('SELECT COUNT(*)::int AS total FROM usuarios');
        return r.rows[0].total;
    },

    buscarPorUsuario: async (usuario) => {
        await asegurarTabla();
        const r = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
        return r.rows[0];
    },

    listar: async () => {
        await asegurarTabla();
        const r = await pool.query(`SELECT ${PUBLICO} FROM usuarios ORDER BY nombre`);
        return r.rows;
    },

    crear: async ({ nombre, usuario, passwordHash, rol }) => {
        await asegurarTabla();
        const r = await pool.query(
            `INSERT INTO usuarios (nombre, usuario, password_hash, rol)
             VALUES ($1, $2, $3, $4) RETURNING ${PUBLICO}`,
            [nombre, usuario, passwordHash, rol]
        );
        return r.rows[0];
    },

    // Crea el primer administrador SOLO si la tabla está vacía, en una sola
    // sentencia, para que dos pedidos simultáneos no creen dos admins.
    crearPrimerAdmin: async ({ nombre, usuario, passwordHash }) => {
        await asegurarTabla();
        const r = await pool.query(
            `INSERT INTO usuarios (nombre, usuario, password_hash, rol)
             SELECT $1, $2, $3, 'admin'
             WHERE NOT EXISTS (SELECT 1 FROM usuarios)
             RETURNING ${PUBLICO}`,
            [nombre, usuario, passwordHash]
        );
        return r.rows[0];
    },
};

module.exports = Usuario;
