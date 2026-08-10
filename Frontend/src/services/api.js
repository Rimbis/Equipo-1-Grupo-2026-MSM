const API_URL='http://localhost:3000';
async function request(ruta,opciones={}){const r=await fetch(`${API_URL}${ruta}`,{headers:{'Content-Type':'application/json',...opciones.headers},...opciones});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||'Error al comunicarse con el servidor');return d;}
export const obtenerObjetos=()=>request('/objetos'); export const crearObjeto=d=>request('/objetos/add',{method:'POST',body:JSON.stringify(d)});
export const obtenerPersonas=()=>request('/personas'); export const crearPersona=d=>request('/personas',{method:'POST',body:JSON.stringify(d)});
export const obtenerPrestamos=()=>request('/prestamos'); export const crearPrestamo=d=>request('/prestamos/add',{method:'POST',body:JSON.stringify(d)}); export const devolverPrestamo=id=>request(`/prestamos/${id}/devolver`,{method:'PATCH'});
export const obtenerCategorias=()=>request('/categorias'); export const crearCategoria=d=>request('/categorias/add',{method:'POST',body:JSON.stringify(d)});
