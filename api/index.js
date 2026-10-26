
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

class ErrorApi extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.status = status;
  }
}

export const haySesion = () => !!sessionStorage.getItem('token');
export const cerrarSesion = () => sessionStorage.removeItem('token');

async function request(ruta, { silencioso = false, ...opciones } = {}) {
  const token = sessionStorage.getItem('token');

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...opciones.headers,
      },
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor. Verificá que el backend esté iniciado.');
  }

  const tipo = respuesta.headers.get('content-type') || '';
  const datos = tipo.includes('application/json') ? await respuesta.json().catch(() => null) : null;

  // Token vencido o inválido (el backend responde 401 desde middleware/auth.js).
  // En el login NO hay token guardado, así que un 401 ahí es "credenciales incorrectas" y se muestra tal cual.
  if (respuesta.status === 401 && token) {
    if (!silencioso) {
      cerrarSesion();
      window.location.href = '/login';
    }
    throw new ErrorApi(datos?.message || 'La sesión expiró, volvé a iniciar sesión.', 401);
  }

  if (!respuesta.ok) {
    throw new ErrorApi(datos?.message || `El servidor respondió con un error (${respuesta.status}).`, respuesta.status);
  }
  if (datos === null) {
    throw new ErrorApi('El servidor devolvió una respuesta inválida.', respuesta.status);
  }
  return datos;
}

// GET que devuelve un array (personas, objetos, préstamos, categorías)
const lista = async (ruta) => {
  const datos = await request(ruta);
  if (!Array.isArray(datos)) throw new ErrorApi('El formato de los datos recibidos no es válido.');
  return datos;
};

// --- Auth ---
// POST /api/auth/login -> { token, expiraEn }
export async function login(usuario, password) {
  cerrarSesion(); // por si quedó un token viejo
  const datos = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usuario: usuario.trim(), password }),
  });
  if (!datos.token) throw new ErrorApi('El servidor no devolvió un token.');
  sessionStorage.setItem('token', datos.token);
}

// GET /api/auth/me -> { usuario, rol }. Confirma que el token guardado sigue siendo válido.
// Solo devuelve false si el backend responde 401; si está caído, deja entrar y cada pantalla mostrará su error.
export async function verificarSesion() {
  if (!haySesion()) return false;
  try {
    await request('/api/auth/me', { silencioso: true });
    return true;
  } catch (e) {
    if (e.status === 401) {
      cerrarSesion();
      return false;
    }
    return true;
  }
}

// --- Objetos --- (GET incluye categoria_nombre y eliminable)
export const obtenerObjetos = () => lista('/api/objetos');
export const crearObjeto = (datos) => request('/api/objetos', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarObjeto = (id) => request(`/api/objetos/${id}`, { method: 'DELETE' });

// --- Personas --- (GET incluye eliminable)
export const obtenerPersonas = () => lista('/api/personas');
export const crearPersona = (datos) => request('/api/personas', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarPersona = (id) => request(`/api/personas/${id}`, { method: 'DELETE' });

// --- Préstamos --- (GET devuelve solo los activos, con nombre, apellido, curso y objeto_nombre)
export const obtenerPrestamos = () => lista('/api/prestamos');
export const crearPrestamo = (datos) => request('/api/prestamos', { method: 'POST', body: JSON.stringify(datos) });
export const devolverPrestamo = (id) => request(`/api/prestamos/${id}/devolver`, { method: 'PATCH' });

// --- Categorías --- (GET incluye eliminable)
export const obtenerCategorias = () => lista('/api/categorias');
export const crearCategoria = (datos) => request('/api/categorias', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarCategoria = (id) => request(`/api/categorias/${id}`, { method: 'DELETE' });