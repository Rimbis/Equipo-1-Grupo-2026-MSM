const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verificá que el backend esté iniciado.');
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

export const obtenerObjetos = () => lista('/api/objetos');
export const crearObjeto = (datos) => request('/api/objetos/add', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarObjeto = (id) => request(`/api/objetos/${id}`, { method: 'DELETE' });
export const obtenerPersonas = () => lista('/api/personas');
export const crearPersona = (datos) => request('/api/personas', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarPersona = (id) => request(`/api/personas/${id}`, { method: 'DELETE' });
export const obtenerPrestamos = () => lista('/api/prestamos');
export const crearPrestamo = (datos) => request('/api/prestamos/add', { method: 'POST', body: JSON.stringify(datos) });
export const devolverPrestamo = (id) => request(`/api/prestamos/${id}/devolver`, { method: 'PATCH' });
export const obtenerCategorias = () => lista('/api/categorias');
export const crearCategoria = (datos) => request('/api/categorias/add', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarCategoria = (id) => request(`/api/categorias/${id}`, { method: 'DELETE' });
