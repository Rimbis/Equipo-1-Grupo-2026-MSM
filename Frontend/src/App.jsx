import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Inicio from './componentes/Inicio';
import Objeto from './componentes/Objeto';
import Personas from './componentes/Personas';
import Prestamo from './componentes/Prestamo';
import Categorias from './componentes/Categorias';
import CargaDatos from './componentes/CargaDatos';
import './App.css';

const enlaces = [
  { to: '/', label: 'Inicio', icono: '⌂', end: true },
  { to: '/objetos', label: 'Objetos', icono: '□' },
  { to: '/personas', label: 'Personas', icono: '♧' },
  { to: '/prestamos', label: 'Préstamos', icono: '⇄' },
  { to: '/categorias', label: 'Categorías', icono: '◇' },
  { to: '/carga-datos', label: 'Cargar datos', icono: '+' },
];

export default function App() {
  return (
    <BrowserRouter>
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
          </nav>
        </header>
        <main className="contenido">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/objetos" element={<Objeto />} />
            <Route path="/personas" element={<Personas />} />
            <Route path="/prestamos" element={<Prestamo />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/carga-datos" element={<CargaDatos />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
