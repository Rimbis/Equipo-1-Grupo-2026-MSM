const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const haySesion = () => !!sessionStorage.getItem('token');
export const cerrarSesion = () => sessionStorage.removeItem('token');

async function request(ruta, opciones = {}) {
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
    throw new Error('No se pudo conectar con el servidor. Verificá que el backend esté iniciado.');
  }

  // Sesión vencida o inválida: se limpia el token y se vuelve al login
  if (respuesta.status === 401 && token) {
    cerrarSesion();
    window.location.href = '/login';
    throw new Error('La sesión expiró, volvé a iniciar sesión.');
  }

  const tipo = respuesta.headers.get('content-type') || '';
  const datos = tipo.includes('application/json') ? await respuesta.json() : null;
  if (!respuesta.ok) {
    throw new Error(datos?.message || `El servidor respondió con un error (${respuesta.status}).`);
  }
  if (datos === null) {
    throw new Error('El servidor devolvió una respuesta inválida.');
  }
  return datos;
}

const lista = async (ruta) => {
  const datos = await request(ruta);
  if (!Array.isArray(datos)) throw new Error('El formato de los datos recibidos no es válido.');
  return datos;
};

// --- Auth ---
export async function login(usuario, password) {
  cerrarSesion(); // por si quedó un token viejo
  const datos = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usuario, password }),
  });
  sessionStorage.setItem('token', datos.token);
}

// --- Objetos ---
export const obtenerObjetos = () => lista('/api/objetos');
export const crearObjeto = (datos) => request('/api/objetos', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarObjeto = (id) => request(`/api/objetos/${id}`, { method: 'DELETE' });

// --- Personas ---
export const obtenerPersonas = () => lista('/api/personas');
export const crearPersona = (datos) => request('/api/personas', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarPersona = (id) => request(`/api/personas/${id}`, { method: 'DELETE' });

// --- Préstamos ---
export const obtenerPrestamos = () => lista('/api/prestamos');
export const crearPrestamo = (datos) => request('/api/prestamos', { method: 'POST', body: JSON.stringify(datos) });
export const devolverPrestamo = (id) => request(`/api/prestamos/${id}/devolver`, { method: 'PATCH' });

// --- Categorías ---
export const obtenerCategorias = () => lista('/api/categorias');
export const crearCategoria = (datos) => request('/api/categorias', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarCategoria = (id) => request(`/api/categorias/${id}`, { method: 'DELETE' });