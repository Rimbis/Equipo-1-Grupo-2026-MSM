import { useEffect, useMemo, useState } from 'react';
import { eliminarCategoria, obtenerCategorias } from '../services/api';

const POR_PAGINA = 9;

export default function Categorias() {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const categorias = await obtenerCategorias();
        if (activo) setDatos(categorias);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => { activo = false; };
  }, []);

  const filtradas = useMemo(() => datos.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  ), [datos, busqueda]);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const visibles = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function buscar(valor) {
    setBusqueda(valor);
    setPagina(1);
  }

  async function eliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    setEliminando(categoria.id);
    setError('');
    try {
      await eliminarCategoria(categoria.id);
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
          <p>Explorá las categorías disponibles para organizar los objetos.</p>
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

      {!cargando && !error && (
        <>
          <div className="lista-categorias">
            {visibles.map((categoria, indice) => (
              <article className="categoria" key={categoria.id}>
                <span className={`categoria-icono tono-${indice % 4}`} aria-hidden="true">◇</span>
                <div className="categoria-contenido">
                  <strong>{categoria.nombre}</strong>
                  <small>Categoría de biblioteca</small>
                </div>
                {categoria.eliminable && <button className="boton-eliminar" disabled={eliminando === categoria.id} onClick={() => eliminar(categoria)} aria-label={`Eliminar ${categoria.nombre}`}>{eliminando === categoria.id ? '…' : 'Eliminar'}</button>}
              </article>
            ))}
          </div>

          {!filtradas.length && <p className="vacio">No encontramos categorías con esa búsqueda.</p>}

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
