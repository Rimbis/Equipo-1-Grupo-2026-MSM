import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Objeto from './componentes/Objeto';
import Personas from './componentes/Personas';
import Prestamo from './componentes/Prestamo';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/objetos">Objetos</Link>
          <Link to="/personas">Personas</Link>
          <Link to="/prestamos">Préstamos</Link>
        </nav>

        <main>
          <Routes>
            <Route path="/objetos" element={<Objeto />} />
            <Route path="/personas" element={<Personas />} />
            <Route path="/prestamos" element={<Prestamo />} />
            <Route path="/" element={<h2>Bienvenido a Biblioteca-Tec</h2>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;