import { useEffect, useState } from 'react';
import { eliminarPersona, obtenerPersonas } from '../services/api';

export default function Personas() {
  const [datos, setDatos] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    let activo = true;
    obtenerPersonas().then((d) => activo && setDatos(d)).catch((e) => activo && setError(e.message)).finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  const lista = datos.filter((p) => `${p.nombre} ${p.apellido} ${p.curso || ''}`.toLowerCase().includes(q.toLowerCase()));

  async function eliminar(persona) {
    if (!window.confirm(`¿Eliminar a ${persona.nombre} ${persona.apellido}?`)) return;
    setEliminando(persona.id);
    setError('');
    try {
      await eliminarPersona(persona.id);
      setDatos((actuales) => actuales.filter((item) => item.id !== persona.id));
    } catch (e) { setError(e.message); }
    finally { setEliminando(null); }
  }

  return <section><div className="encabezado-pagina"><div><h1>Personas</h1><p>Personas registradas en el sistema.</p></div></div><input className="buscador" placeholder="Buscar persona..." value={q} onChange={(e) => setQ(e.target.value)}/>{error&&<p className="mensaje error">{error}</p>}{cargando?<div className="estado-pagina"><span className="spinner"/>Cargando personas...</div>:<><div className="tabla-contenedor"><table><thead><tr><th>Apellido</th><th>Nombre</th><th>Curso</th><th>Acción</th></tr></thead><tbody>{lista.map((p)=><tr key={p.id}><td>{p.apellido}</td><td>{p.nombre}</td><td>{p.curso||'-'}</td><td>{p.eliminable?<button className="boton-eliminar" disabled={eliminando===p.id} onClick={()=>eliminar(p)}>{eliminando===p.id?'Eliminando…':'Eliminar'}</button>:<span className="protegido">Predeterminada</span>}</td></tr>)}</tbody></table></div>{!lista.length&&<p className="vacio">No hay personas para mostrar.</p>}</>}</section>;
}
