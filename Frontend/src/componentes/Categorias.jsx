import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { eliminarCategoria, obtenerCategorias, obtenerObjetos, eliminarObjeto } from '../services/api';

const POR_PAGINA = 9;

export default function Categorias() {
  const tituloDetalle = useRef(null);
  const [datos, setDatos] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [busquedaObjeto, setBusquedaObjeto] = useState('');
  const [eliminandoObjeto, setEliminandoObjeto] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const [categorias, inventario] = await Promise.all([obtenerCategorias(), obtenerObjetos()]);
        if (activo) { setDatos(categorias); setObjetos(inventario); }
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (seleccionada) {
      tituloDetalle.current?.focus({ preventScroll: true });
      tituloDetalle.current?.scrollIntoView({ block: 'center' });
    }
  }, [seleccionada]);

  const filtradas = useMemo(() => datos.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  ), [datos, busqueda]);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const visibles = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function buscar(valor) {
    setBusqueda(valor);
    setPagina(1);
  }

  const objetosCategoria = objetos.filter((objeto) => String(objeto.categoria_id) === String(seleccionada?.id));
  const objetosVisibles = objetosCategoria.filter((objeto) => objeto.nombre.toLowerCase().includes(busquedaObjeto.trim().toLowerCase()));

  async function borrarObjeto(objeto) {
    if (!window.confirm(`¿Eliminar el objeto "${objeto.nombre}"?`)) return;
    setEliminandoObjeto(objeto.id);
    setError('');
    try {
      await eliminarObjeto(objeto.id);
      setObjetos((actuales) => actuales.filter((item) => item.id !== objeto.id));
    } catch (e) { setError(e.message); }
    finally { setEliminandoObjeto(null); }
  }

  async function eliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    setEliminando(categoria.id);
    setError('');
    try {
      await eliminarCategoria(categoria.id);
      if (seleccionada?.id === categoria.id) setSeleccionada(null);
      setDatos((actuales) => actuales.filter((item) => item.id !== categoria.id));
      setPagina((actual) => Math.min(actual, Math.max(1, Math.ceil((filtradas.length - 1) / POR_PAGINA))));
    } catch (e) {
      setError(e.message);
    } finally {
      setEliminando(null);
    }
  }

  return (
    <section>
      <div className="encabezado-pagina">
        <div>
          <span className="eyebrow">Inventario</span>
          <h1>Categorías</h1>
          <p>Seleccioná una categoría para ver y gestionar sus objetos.</p>
        </div>
        {!cargando && !error && <span className="contador">{filtradas.length} categorías</span>}
      </div>

      <label className="campo-busqueda">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Buscar categoría</span>
        <input
          placeholder="Buscar categoría..."
          value={busqueda}
          onChange={(e) => buscar(e.target.value)}
        />
      </label>

      {error && <p className="mensaje error" role="alert">{error}</p>}
      {cargando && <div className="estado-pagina" aria-live="polite"><span className="spinner" />Cargando categorías...</div>}

      {!cargando && (
        <>
          <div className="lista-categorias">
            {visibles.map((categoria, indice) => (
              <article className="categoria" key={categoria.id}>
                <button type="button" className="categoria-abrir" aria-pressed={seleccionada?.id === categoria.id} aria-controls="objetos-categoria" onClick={() => { setSeleccionada(categoria); setBusquedaObjeto(''); }}>
                <span className={`categoria-icono tono-${indice % 4}`} aria-hidden="true">◇</span>
                <span className="categoria-contenido">
                  <strong>{categoria.nombre}</strong>
                  <small>{objetos.filter((objeto) => String(objeto.categoria_id) === String(categoria.id)).length} objetos · Ver objetos</small>
                </span>
                </button>
                {categoria.eliminable && <button className="boton-eliminar" disabled={eliminando === categoria.id} onClick={() => eliminar(categoria)} aria-label={`Eliminar ${categoria.nombre}`}>{eliminando === categoria.id ? '…' : 'Eliminar'}</button>}
              </article>
            ))}
          </div>

          {!filtradas.length && <p className="vacio">No encontramos categorías con esa búsqueda.</p>}

          <Link className="enlace-accion" to="/carga-datos?tipo=categoria">Agregar categoría</Link>

          {seleccionada && (
            <section id="objetos-categoria" className="detalle-categoria" aria-labelledby="titulo-categoria">
              <div className="encabezado-pagina">
                <div><h2 id="titulo-categoria" ref={tituloDetalle} tabIndex={-1}>Objetos de {seleccionada.nombre}</h2><p>{objetosCategoria.length} objetos en esta categoría</p></div>
                <button type="button" className="boton" onClick={() => setSeleccionada(null)}>Cerrar detalle</button>
              </div>
              <Link className="enlace-accion" to={`/carga-datos?tipo=objeto&categoria=${seleccionada.id}`}>Agregar objeto a esta categoría</Link>
              <label className="campo-busqueda"><span className="sr-only">Buscar objeto en la categoría</span><input placeholder="Buscar objeto en esta categoría..." value={busquedaObjeto} onChange={(e) => setBusquedaObjeto(e.target.value)} /></label>
              {objetosVisibles.length ? <div className="tabla-contenedor"><table>
                <thead><tr><th>Objeto</th><th>Estado</th><th>Acción</th></tr></thead>
                <tbody>{objetosVisibles.map((objeto) => <tr key={objeto.id}>
                  <td>{objeto.nombre}</td><td><span className={`estado ${objeto.estado}`}>{objeto.estado}</span></td>
                  <td>{objeto.eliminable ? <button type="button" className="boton-eliminar" disabled={eliminandoObjeto === objeto.id} onClick={() => borrarObjeto(objeto)}>{eliminandoObjeto === objeto.id ? 'Eliminando…' : 'Eliminar'}</button> : <span className="protegido">Predeterminado</span>}</td>
                </tr>)}</tbody>
              </table></div> : <p className="vacio" role="status">{objetosCategoria.length ? 'No encontramos objetos con esa búsqueda.' : 'Esta categoría todavía no tiene objetos.'}</p>}
            </section>
          )}

          {totalPaginas > 1 && (
            <nav className="paginacion" aria-label="Paginación de categorías">
              <button disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>Anterior</button>
              <span>Página {pagina} de {totalPaginas}</span>
              <button disabled={pagina === totalPaginas} onClick={() => setPagina((p) => p + 1)}>Siguiente</button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
