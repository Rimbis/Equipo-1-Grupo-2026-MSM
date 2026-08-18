import { useEffect, useState } from 'react';
import { eliminarObjeto, obtenerObjetos } from '../services/api';

export default function Objeto() {
  const [datos, setDatos] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    let activo = true;
    obtenerObjetos().then((d) => activo && setDatos(d)).catch((e) => activo && setError(e.message)).finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  const lista = datos.filter((o) => `${o.nombre} ${o.categoria_nombre || ''}`.toLowerCase().includes(q.toLowerCase()));

  async function eliminar(objeto) {
    if (!window.confirm(`¿Eliminar el objeto "${objeto.nombre}"?`)) return;
    setEliminando(objeto.id);
    setError('');
    try {
      await eliminarObjeto(objeto.id);
      setDatos((actuales) => actuales.filter((item) => item.id !== objeto.id));
    } catch (e) { setError(e.message); }
    finally { setEliminando(null); }
  }

  return <section><div className="encabezado-pagina"><div><h1>Objetos</h1><p>Listado de objetos registrados en la biblioteca.</p></div></div><input className="buscador" placeholder="Buscar objeto..." value={q} onChange={(e) => setQ(e.target.value)}/>{error&&<p className="mensaje error">{error}</p>}{cargando?<div className="estado-pagina"><span className="spinner"/>Cargando objetos...</div>:<><div className="tabla-contenedor"><table><thead><tr><th>Nombre</th><th>Categoría</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{lista.map((o)=><tr key={o.id}><td>{o.nombre}</td><td>{o.categoria_nombre||'Sin categoría'}</td><td><span className={`estado ${o.estado}`}>{o.estado}</span></td><td>{o.eliminable?<button className="boton-eliminar" disabled={eliminando===o.id} onClick={()=>eliminar(o)}>{eliminando===o.id?'Eliminando…':'Eliminar'}</button>:<span className="protegido">Predeterminado</span>}</td></tr>)}</tbody></table></div>{!lista.length&&<p className="vacio">No hay objetos para mostrar.</p>}</>}</section>;
}
