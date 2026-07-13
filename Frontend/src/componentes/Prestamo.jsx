import { useState, useEffect } from 'react';

function Prestamo() {
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/prestamos')
      .then(res => res.json())
      .then(data => setPrestamos(data))
      .catch(err => console.error('Error cargando préstamos:', err));
  }, []);

  return (
    <div>
      <h2>Préstamos</h2>
      <ul>
        {prestamos.map(p => (
          <li key={p._id}>{p.objeto} - {p.persona}</li>
        ))}
      </ul>
    </div>
  );
}

export default Prestamo;