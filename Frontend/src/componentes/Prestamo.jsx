import { useCallback, useEffect, useState } from 'react';
import { devolverPrestamo, obtenerPrestamos } from '../services/api';

export default function Prestamo() {
  const [datos, setDatos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try { setDatos(await obtenerPrestamos()); }
    catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function devolver(id) {
    try {
      await devolverPrestamo(id);
      setMensaje('Devolución registrada correctamente.');
      await cargar();
    } catch (e) { setError(e.message); }
  }

  return <section><div className="encabezado-pagina"><div><h1>Préstamos</h1><p>Préstamos que se encuentran activos.</p></div></div>{mensaje&&<p className="mensaje exito">{mensaje}</p>}{error&&<p className="mensaje error">{error}</p>}{cargando?<div className="estado-pagina"><span className="spinner"/>Cargando préstamos...</div>:<><div className="tabla-contenedor"><table><thead><tr><th>Persona</th><th>Curso</th><th>Objeto</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>{datos.map(p=><tr key={p.id}><td>{p.nombre} {p.apellido}</td><td>{p.curso||'-'}</td><td>{p.objeto_nombre}</td><td>{p.fecha_salida?new Date(p.fecha_salida).toLocaleDateString('es-AR'):'-'}</td><td><button className="boton secundario" onClick={()=>devolver(p.id)}>Devolver</button></td></tr>)}</tbody></table></div>{!datos.length&&<p className="vacio">No hay préstamos activos.</p>}</>}</section>;
}
