import { useState, useEffect } from 'react';

function Personas() {
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/personas')
      .then(res => res.json())
      .then(data => setPersonas(data))
      .catch(err => console.error('Error cargando personas:', err));
  }, []);

  return (
    <div>
      <h2>Personas</h2>
      <ul>
        {personas.map(p => (
          <li key={p._id}>{p.nombre}</li>
        ))}
      </ul>
    </div>
  );
}

export default Personas;