import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Inicio from './componentes/Inicio';
import Objeto from './componentes/Objeto';
import Personas from './componentes/Personas';
import Prestamo from './componentes/Prestamo';
import Categorias from './componentes/Categorias';
import CargaDatos from './componentes/CargaDatos';
import Login from './componentes/Login';
import { haySesion, cerrarSesion, verificarSesion } from './services/api';
import './App.css';

const enlaces = [
  { to: '/', label: 'Inicio', icono: '⌂', end: true },
  { to: '/objetos', label: 'Objetos', icono: '□' },
  { to: '/personas', label: 'Personas', icono: '♧' },
  { to: '/prestamos', label: 'Préstamos', icono: '⇄' },
  { to: '/categorias', label: 'Categorías', icono: '◇' },
  { to: '/carga-datos', label: 'Cargar datos', icono: '+' },
];

function Layout({ onLogout }) {
  return (
    <div className="App">
      <header className="header">
        <NavLink className="marca" to="/" aria-label="Ir al inicio">
          <span className="marca-icono">BT</span>
          <span>Biblioteca<span>Tec</span></span>
        </NavLink>
        <nav aria-label="Navegación principal">
          {enlaces.map(({ to, label, icono, end }) => (
            <NavLink key={to} to={to} end={end}>
              <span aria-hidden="true">{icono}</span>{label}
            </NavLink>
          ))}
          <button type="button" onClick={onLogout}>Cerrar sesión</button>
        </nav>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  // 'verificando': hay token guardado y se está confirmando con GET /api/auth/me
  const [sesion, setSesion] = useState(haySesion() ? 'verificando' : 'no');

  useEffect(() => {
    if (sesion !== 'verificando') return;
    let activo = true;
    verificarSesion().then((ok) => activo && setSesion(ok ? 'si' : 'no'));
    return () => { activo = false; };
  }, []);

  const logueado = sesion === 'si';

  const salir = () => {
    cerrarSesion();
    setSesion('no');
  };

  if (sesion === 'verificando') {
    return <div className="estado-pagina"><span className="spinner" />Verificando sesión...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={logueado ? <Navigate to="/" replace /> : <Login onLogin={() => setSesion('si')} />}
        />

        {/* Todo lo que está acá adentro requiere sesión */}
        <Route element={logueado ? <Layout onLogout={salir} /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/objetos" element={<Objeto />} />
          <Route path="/personas" element={<Personas />} />
          <Route path="/prestamos" element={<Prestamo />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/carga-datos" element={<CargaDatos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}