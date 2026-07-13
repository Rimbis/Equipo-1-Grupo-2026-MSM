import { useState, useEffect } from 'react';

function Objeto() {
  const [objetos, setObjetos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/objetos')
      .then(res => res.json())
      .then(data => setObjetos(data))
      .catch(err => console.error('Error cargando objetos:', err));
  }, []);

  return (
    <div>
      <h2>Objetos</h2>
      <ul>
        {objetos.map(obj => (
          <li key={obj._id}>{obj.nombre}</li>
        ))}
      </ul>
    </div>
  );
}

export default Objeto;