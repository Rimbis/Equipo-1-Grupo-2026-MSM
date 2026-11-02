const pool = require('../config/db');

// Modelo utilizado por la utilidad de administración; el login actual no consulta esta tabla.
// La tabla se prepara al usar el modelo, sin crear el resto del esquema de la aplicación.
// Se conserva la promesa para compartir la inicialización dentro de este proceso.
let tablaLista = null;
/**
 * Crea usuarios si no existe y reutiliza la promesa en las llamadas posteriores.
 * Si falla la inicialización, permite reintentar; no modifica una tabla existente.
 */
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

// Campos que se devuelven sin exponer password_hash en las operaciones públicas del modelo.
const PUBLICO = 'id, nombre, usuario, rol, creado_en';

const Usuario = {
    // Devuelve el número de usuarios como entero, luego de asegurar que exista la tabla.
    contar: async () => {
        await asegurarTabla();
        const r = await pool.query('SELECT COUNT(*)::int AS total FROM usuarios');
        return r.rows[0].total;
    },

    // Busca coincidencia exacta; devuelve la fila completa (incluido hash) o undefined.
    buscarPorUsuario: async (usuario) => {
        await asegurarTabla();
        const r = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
        return r.rows[0];
    },

    // Lista usuarios por nombre; omite el hash de contraseña.
    listar: async () => {
        await asegurarTabla();
        const r = await pool.query(`SELECT ${PUBLICO} FROM usuarios ORDER BY nombre`);
        return r.rows;
    },

    // Inserta un usuario con un hash ya generado y devuelve sus campos públicos.
    // Las restricciones SQL validan usuario único y rol permitido.
    crear: async ({ nombre, usuario, passwordHash, rol }) => {
        await asegurarTabla();
        const r = await pool.query(
            `INSERT INTO usuarios (nombre, usuario, password_hash, rol)
             VALUES ($1, $2, $3, $4) RETURNING ${PUBLICO}`,
            [nombre, usuario, passwordHash, rol]
        );
        return r.rows[0];
    },

    /**
     * Inserta un administrador si la sentencia observa la tabla vacía.
     * Devuelve el usuario creado o undefined si ya había registros.
     * NOT EXISTS por sí solo no impide que dos transacciones concurrentes
     * creen administradores con nombres distintos; no hay bloqueo de tabla aquí.
     */
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
