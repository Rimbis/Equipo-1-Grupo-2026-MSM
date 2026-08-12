const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
async function request(ruta,opciones={}){const r=await fetch(`${API_URL}${ruta}`,{headers:{'Content-Type':'application/json',...opciones.headers},...opciones});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||'Error al comunicarse con el servidor');return d;}
export const obtenerObjetos=()=>request('/api/objetos'); export const crearObjeto=d=>request('/api/objetos/add',{method:'POST',body:JSON.stringify(d)});
export const obtenerPersonas=()=>request('/api/personas'); export const crearPersona=d=>request('/api/personas',{method:'POST',body:JSON.stringify(d)});
export const obtenerPrestamos=()=>request('/api/prestamos'); export const crearPrestamo=d=>request('/api/prestamos/add',{method:'POST',body:JSON.stringify(d)}); export const devolverPrestamo=id=>request(`/api/prestamos/${id}/devolver`,{method:'PATCH'});
export const obtenerCategorias=()=>request('/api/categorias'); export const crearCategoria=d=>request('/api/categorias/add',{method:'POST',body:JSON.stringify(d)});
