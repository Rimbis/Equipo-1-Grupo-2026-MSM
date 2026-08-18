import {useEffect,useState} from 'react'; import {crearCategoria,crearObjeto,crearPersona,crearPrestamo,obtenerCategorias,obtenerObjetos,obtenerPersonas} from '../services/api';
export default function CargaDatos()
{const [tipo,setTipo]=useState('objeto'),
    [categorias,setCategorias]=useState([]),
    [personas,setPersonas]=useState([]),
    [objetos,setObjetos]=useState([]),
    [mensaje,setMensaje]=useState(''),
    [error,setError]=useState('');const [objeto,setObjeto]=useState({nombre:'',categoria_id:''}),
    [persona,setPersona]=useState({nombre:'',apellido:'',curso:''}),
    [categoria,setCategoria]=useState({nombre:''}),
    [prestamo,setPrestamo]=useState({persona_id:'',objeto_id:''});
    async function cargar()
    {try{const [c,p,o]=await Promise.all([obtenerCategorias(),obtenerPersonas(),obtenerObjetos()]);setCategorias(c);setPersonas(p);
        setObjetos(o)}catch(e){setError(e.message)}}useEffect(()=>{cargar()},[]);
        async function guardar(e){e.preventDefault();
            setMensaje('');setError('');try{if(tipo==='objeto')
            {await crearObjeto({...objeto,categoria_id:Number(objeto.categoria_id)});
            setObjeto({nombre:'',categoria_id:''})}if(tipo==='persona'){await crearPersona(persona);
            setPersona({nombre:'',apellido:'',curso:''})}if(tipo==='categoria'){await crearCategoria(categoria);
                        setCategoria({nombre:''})}if(tipo==='prestamo'){await crearPrestamo({persona_id:Number(prestamo.persona_id),objeto_id:Number(prestamo.objeto_id)});
                        setPrestamo({persona_id:'',objeto_id:''})}setMensaje('Datos guardados correctamente.');
                        await cargar()}catch(e){setError(e.message)}}const disponibles=objetos.filter(o=>o.estado==='disponible');
                        return <section><div className="encabezado-pagina"><h1>Carga de datos</h1>
                        <p>Registrá información desde la página sin ingresar manualmente a la base de datos.</p></div>
                        <div className="selector-tipo">{['objeto','persona','categoria','prestamo'].map(t=><button type="button" key={t} className={tipo===t?'seleccionado':''}
                         onClick={()=>setTipo(t)}>{t}</button>)}</div>{mensaje&&<p className="mensaje exito">{mensaje}</p>}{error&&<p className="mensaje error">{error}</p>}<form className="formulario" onSubmit={guardar}>{tipo==='objeto'&&<>
                         <h2>Registrar objeto</h2>
                         <label>Nombre<input required value={objeto.nombre} onChange={e=>setObjeto({...objeto,nombre:e.target.value})}/></label><label>Categoría<select required value={objeto.categoria_id} onChange={e=>setObjeto({...objeto,categoria_id:e.target.value})}><option value="">Seleccionar</option>{categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label></>}{tipo==='persona'&&<><h2>Registrar persona</h2><label>Nombre<input required value={persona.nombre} onChange={e=>setPersona({...persona,nombre:e.target.value})}/></label><label>Apellido<input required value={persona.apellido} onChange={e=>setPersona({...persona,apellido:e.target.value})}/></label><label>Curso<input required value={persona.curso} onChange={e=>setPersona({...persona,curso:e.target.value})}/></label></>}{tipo==='categoria'&&<>
                         <h2>Registrar categoría</h2>
                         <label>Nombre<input required value={categoria.nombre} onChange={e=>setCategoria({nombre:e.target.value})}/></label>
                         </>}{tipo==='prestamo'&&<><h2>Registrar préstamo</h2>
                         <label>Persona<select required value={prestamo.persona_id} onChange={e=>setPrestamo({...prestamo,persona_id:e.target.value})}>
                         <option value="">Seleccionar</option>{personas.map(p=><option key={p.id} value={p.id}>{p.apellido}, {p.nombre} - {p.curso}</option>)}</select>
                         </label><label>Objeto disponible<select required value={prestamo.objeto_id} onChange={e=>setPrestamo({...prestamo,objeto_id:e.target.value})}><option value="">Seleccionar</option>{disponibles.map(o=><option key={o.id} value={o.id}>{o.nombre}</option>)}</select></label></>}<button className="boton" type="submit">Guardar</button></form></section>}
