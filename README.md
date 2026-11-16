# BibliotecaTec – Sistema de Gestión de Inventario para Biblioteca Escolar

Aplicación web para registrar, controlar y hacer seguimiento de los materiales escolares (netbooks, calculadoras, mapas, televisores, etc.) que la biblioteca presta a los alumnos. Reemplaza las planillas de papel / Excel por un panel web simple para el bibliotecario.

> Proyecto del Equipo 1 – Grupo 2026 (MSM). Stack **PERN**: PostgreSQL (Supabase) · Express · React · Node.js.

## Funcionalidades

- Catálogo de **objetos** con categoría y estado (`disponible` / `prestado`), búsqueda y baja.
- Alta, listado y baja de **personas** (nombre, apellido, curso) y de **categorías**.
- **Préstamos**: registrar salida, ver préstamos activos y registrar devolución. El objeto cambia de estado automáticamente.
- **Control de concurrencia**: un mismo objeto no puede prestarse dos veces ni devolverse dos veces (transacciones con `FOR UPDATE`).
- Panel de **inicio** con totales (objetos, disponibles, personas, préstamos activos).
- Pantalla **Cargar datos** para altas rápidas de objeto, persona, categoría y préstamo.

## Arquitectura (resumen)

```
Navegador ── React + Vite ──HTTP/JSON──> Express (/api/*) ──pg──> Supabase (PostgreSQL)
        (Frontend/)                      (Backend/)
```
En producción todo se publica en **Vercel**: el frontend como sitio estático y el backend como función serverless (`api/index.js`). Detalle completo en [`docs/01-arquitectura-y-diseno.md`](docs/01-arquitectura-y-diseno.md).

## Estructura del repositorio

```
├── Backend/            API REST (Express + pg)
│   ├── config/         conexión a la base y registros protegidos
│   ├── models/         acceso a datos (Persona, Objeto, Categoria, Prestamo)
│   ├── routes/         endpoints
│   └── server.js       arranque local
├── Frontend/           SPA React + Vite
│   └── src/            componentes/ y services/api.js
├── api/index.js        entrada serverless para Vercel
├── db/schema.sql       script de creación de tablas
├── docs/               documentación técnica y de gestión
├── Entregables/        WBS, Gantt, Curva S, DER, descripción del proyecto
└── vercel.json
```

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20 o superior (Vercel usa 22.x) |
| npm | 10 o superior |
| Cuenta en [Supabase](https://supabase.com) | plan gratuito alcanza |

## Instalación y ejecución local

**1. Clonar**
```bash
git clone <URL-del-repo>
cd Equipo-1-Grupo-2026-MSM
```

**2. Base de datos (Supabase)**
1. Crear un proyecto en Supabase.
2. En *SQL Editor* ejecutar el contenido de [`db/schema.sql`](db/schema.sql).
3. En *Connect → Session pooler* copiar la cadena de conexión.

**3. Backend**
```bash
cd Backend
npm install
cp .env.example .env      # en Windows: copy .env.example .env
# editar .env y pegar DATABASE_URL
npm start                 # http://localhost:4000
```
Verificar: `http://localhost:4000/api/health` debe responder `{"status":"ok"}`.

**4. Frontend** (en otra terminal)
```bash
cd Frontend
npm install
npm run dev               # http://localhost:5173
```
Vite redirige `/api` a `http://localhost:4000` (ver `vite.config.js`), no hace falta configurar nada más en local.

## Variables de entorno

| Variable | Dónde | Descripción | Ejemplo |
|---|---|---|---|
| `DATABASE_URL` | Backend / Vercel | URI de Supabase (Session pooler). Si la clave tiene caracteres especiales, codificarlos para URL. | `postgresql://postgres.REF:CLAVE@host:5432/postgres` |
| `PORT` | Backend | Puerto local del servidor (opcional) | `4000` |
| `VITE_API_URL` | Frontend (opcional) | URL base de la API si el backend está en otro dominio. Vacío = mismo dominio. | `https://mi-api.onrender.com` |

Nunca subir `.env` al repositorio (ya está en `.gitignore`).

## Despliegue en Vercel

1. Importar el repositorio en Vercel.
2. Agregar la variable `DATABASE_URL` en *Settings → Environment Variables*.
3. Desplegar. `vercel.json` ya define el build (`Frontend/dist`) y el rewrite `/api/*` → `api/index.js`.

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servidor y la base (solo `Backend/server.js`) |
| GET | `/api/objetos` | Lista de objetos con categoría |
| POST | `/api/objetos/add` | Crea objeto `{nombre, categoria_id}` |
| PATCH | `/api/objetos/:id/estado` | Cambia estado (`disponible`/`prestado`) |
| DELETE | `/api/objetos/:id` | Elimina objeto (no los predeterminados) |
| GET | `/api/personas` | Lista de personas |
| POST | `/api/personas` | Crea persona `{nombre, apellido, curso}` |
| DELETE | `/api/personas/:id` | Elimina persona (no las predeterminadas) |
| GET | `/api/categorias` | Lista de categorías |
| POST | `/api/categorias/add` | Crea categoría `{nombre}` |
| DELETE | `/api/categorias/:id` | Elimina categoría (no las predeterminadas) |
| GET | `/api/prestamos` | Préstamos activos |
| POST | `/api/prestamos/add` | Registra préstamo `{persona_id, objeto_id}` |
| PATCH | `/api/prestamos/:id/devolver` | Registra devolución |

Códigos de error: `400` datos inválidos · `403` registro predeterminado · `404` no encontrado · `409` conflicto (objeto ya prestado, préstamo ya devuelto, FK) · `503` base no disponible.

## Documentación

<<<<<<< HEAD
**Resultado general:** el sistema funciona correctamente en todas las funciones documentadas y no presenta errores de funcionamiento conocidos al cierre de esta actualización. El acceso, las consultas, la carga de datos, los préstamos y las devoluciones están operativos.

Las comprobaciones registradas el 26 de octubre de 2026 finalizaron correctamente, incluidas 18 verificaciones de lógica de negocio contra Supabase. Los formularios rechazan datos incompletos y el sistema impide préstamos o devoluciones duplicados; estos mensajes son controles previstos del sistema.

### Procedimientos y resultados

| Área | Procedimiento realizado | Resultado |
|---|---|---|
| Conexión y autenticación | Se consultó el estado del backend, se inició sesión mediante la API publicada en Vercel y se verificó la sesión. También se comprobó el rechazo de solicitudes sin autenticación. | Conexión con Supabase y autenticación correctas. |
| Interfaz y consultas | Se recorrieron Inicio, Objetos, Personas, Categorías, Préstamos y Carga de datos en Safari. Se probaron los buscadores de objetos, personas y categorías. | Las pantallas cargaron y los filtros respondieron correctamente. |
| Formularios | Se revisaron los formularios de objetos, personas, categorías y préstamos, las opciones de personas y el rechazo de un formulario de objeto vacío. | Campos y selectores disponibles; el navegador bloqueó el envío vacío. |
| Altas y eliminaciones | Se crearon categorías, objetos y personas de prueba mediante los modelos del backend. Se verificó la normalización de espacios y la eliminación de registros sin relaciones. | Operaciones correctas. Se rechazaron borrados con relaciones o protección aplicable. |
| Préstamos y devoluciones | Se registró un préstamo, se verificó el estado del objeto, se intentó repetir el préstamo y se efectuó la devolución. Luego se intentó devolverlo nuevamente. | El objeto pasó de disponible a prestado y volvió a disponible. Se bloquearon las operaciones duplicadas y se guardó la fecha de devolución. |

### Evidencia y cuidado de los datos

La API publicada permitió consultar 74 objetos, 4 personas, 7 categorías y ningún préstamo activo en el momento de la comprobación. La revisión de coherencia no encontró diferencias entre los objetos marcados como prestados y sus préstamos activos.

### Simulación de incidencias y dedicación semanal

> **Ejercicio ficticio para documentar el proyecto.** Los problemas y las horas de esta sección son escenarios plausibles inventados a partir de las funciones de Biblioteca Tec y de las fases del diagrama de Gantt. No son incidencias observadas, partes horarios ni un registro de asistencia. El Gantt organiza el trabajo por meses, no por semanas, y no descuenta feriados, clases suspendidas ni otras interrupciones; por eso las horas son estimaciones ilustrativas y no deben presentarse como horas reales trabajadas.

| Semana ilustrativa | Fase del Gantt | Incidencia simulada y resolución posible | Micaela (h) | Santiago (h) | María (h) | Total estimado (h) |
|---|---|---|---:|---:|---:|---:|
| 4–8 de mayo | Análisis | Se descubre que el inventario debe distinguir disponibilidad de existencia física. Se acuerda registrar el estado a partir de los préstamos activos. | 2 | 2 | 2 | 6 |
| 15–19 de junio | Diseño de datos | Un objeto prestado podría aparecer como disponible si se actualiza el préstamo y el objeto por separado. Se define una operación transaccional y la regla para impedir préstamos activos duplicados. | 2 | 3 | 2 | 7 |
| 20–24 de julio | Desarrollo backend | Una consulta podría fallar si los identificadores llegan como texto o los datos contienen espacios. Se agregan validaciones y consultas parametrizadas, y se normaliza la entrada pertinente. | 2 | 4 | 2 | 8 |
| 17–21 de agosto | Desarrollo frontend y backend | Al vencer la sesión, una pantalla podría seguir visible aunque la API rechace las solicitudes. Se plantea verificar el token al cargar la aplicación y redirigir al login ante una sesión inválida. | 3 | 3 | 2 | 8 |
| 21–25 de septiembre | Pruebas | Una segunda devolución podría alterar el estado o generar una respuesta confusa. Se valida que la API rechace la devolución repetida y se muestra un mensaje claro. | 2 | 2 | 3 | 7 |
| 12–16 de octubre | Pruebas y README | El frontend podría apuntar a un backend distinto del que contiene la cuenta configurada. Se comparan los destinos del proxy en Vercel y se documenta la configuración correcta. | 2 | 3 | 3 | 8 |
| 26–30 de octubre | Despliegue y documentación | Una categoría sin objetos podría parecer rota al seleccionarla. Se prevé un estado vacío explícito y una forma directa de agregar un objeto a esa categoría. | 3 | 2 | 3 | 8 |
| 2–6 de noviembre | Documentación y entrega | En pantallas chicas, los enlaces de navegación podrían dificultar encontrar el cierre de sesión. Se revisa la disposición móvil y se documenta la salida segura. | 2 | 2 | 3 | 7 |
| **Total de esta muestra** |  | **Estimación ficticia; no representa el total del proyecto.** | **18** | **21** | **20** | **59** |

Las fechas semanales son una distribución ilustrativa de actividades dentro de los meses indicados en el Gantt; el archivo no especifica días ni horas. Si se necesita un registro real, el equipo debe reemplazar esta muestra con sus propios datos y excluir o anotar por separado las semanas afectadas por feriados, clases y otras interrupciones.

Las pruebas de escritura se ejecutaron dentro de una transacción controlada contra Supabase y finalizaron con **ROLLBACK**. Los registros creados para probar se descartaron. Estas verificaciones ejercitaron los modelos del backend; no constituyen un envío completo de cada formulario desde el navegador.

#### Conclusión de las pruebas

La integración entre Vercel, Render y Supabase funciona correctamente. Las funciones evaluadas se completaron sin errores observados y el sistema está disponible para su uso cotidiano. Este resultado describe las pruebas funcionales registradas y el estado de funcionamiento confirmado para la entrega; no constituye una garantía de ausencia de fallos en cualquier situación futura.

No hay una suite automatizada ni un comando `npm test`. Las comprobaciones registradas no incluyen pruebas de carga, concurrencia real, todos los navegadores y dispositivos ni una auditoría integral de seguridad.

### Corrección del destino del login en Vercel

Se detectó que el proxy de Vercel enviaba las solicitudes a un backend distinto del que tiene configurada la cuenta entregada. Se comprobó el inicio de sesión con las credenciales documentadas en ambos servicios: `pedidosydesarrollo` respondió HTTP 200 con un token y `msm-api` respondió HTTP 401. Se corrigió el destino de `/api/:path*` en `vercel.json` y `Frontend/vercel.json` para utilizar `https://biblioteca-tecnica-pedidosydesarrollo.onrender.com` en ambos modos de despliegue. No fue necesario modificar la contraseña ni los registros de la base de datos.

### Actualización de categorías y cierre de sesión del 2 de noviembre de 2026

Se agregó la selección de categorías mediante botones accesibles. Al pulsar una categoría se abre su detalle con los objetos asociados por su identificador, el nombre y el estado disponible o prestado. Cada tarjeta indica cuántos objetos contiene. El detalle permite buscar objetos, muestra un aviso cuando la categoría está vacía y permite eliminar los objetos autorizados, con confirmación previa. Los registros protegidos conservan su restricción y los rechazos de la API se muestran sin ocultar el listado.

Se agregaron accesos para crear una categoría y para cargar un objeto en la categoría seleccionada. Este último abre Carga de datos con el formulario de objeto y la categoría preseleccionada. Al eliminar un objeto correctamente se actualizan el detalle y el contador; al cerrar el detalle se vuelve a la exploración de categorías.

El botón **Cerrar sesión** se ubicó fuera del menú de navegación desplazable, con fondo verde y texto blanco. En pantallas pequeñas comparte la fila superior con la marca, mientras los enlaces quedan en una fila independiente. Su acción elimina el token de sesión y la aplicación redirige al acceso.

| Comprobación realizada | Resultado |
=======
| Documento | Contenido |
>>>>>>> 2ee4c72 (anteultimno commit)
|---|---|
| [`docs/00-estado-y-faltantes.md`](docs/00-estado-y-faltantes.md) | Checklist de entrega e inconsistencias detectadas |
| [`docs/01-arquitectura-y-diseno.md`](docs/01-arquitectura-y-diseno.md) | Diseño técnico y diagramas |
| [`docs/02-modulos.md`](docs/02-modulos.md) | Módulos y funciones |
| [`docs/03-base-de-datos.md`](docs/03-base-de-datos.md) | Modelo y diccionario de datos |
| [`docs/04-trazabilidad.md`](docs/04-trazabilidad.md) | Requerimientos ↔ diseño ↔ implementación |
| [`docs/05-bitacora-problemas.md`](docs/05-bitacora-problemas.md) | Problemas técnicos, decisiones y soluciones |
| [`docs/06-pruebas.md`](docs/06-pruebas.md) | Casos de prueba y resultados |
| [`docs/07-wbs-diccionario.md`](docs/07-wbs-diccionario.md) | WBS, diccionario, plazos y precedencias |
| [`docs/08-equipo-y-riesgos.md`](docs/08-equipo-y-riesgos.md) | Roles, tareas compartidas y registro de riesgos |

## Equipo

| Integrante | Rol |
|---|---|
| María Gómez Villarruel | Project Manager · Base de datos (Supabase/PostgreSQL) |
| Santiago López | Backend (Node.js / Express) |
| Micaela Pedrozo | Frontend (React) |

## Licencia

Proyecto académico. Uso educativo.