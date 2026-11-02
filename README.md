# Biblioteca Tec

Sistema para gestionar objetos, personas, categorías, préstamos y devoluciones de materiales de una biblioteca escolar.

**Equipo:** Micaela Pedrozo (Mazuu12), Santiago Lopez (bacha2007) y María Villarruel (Rimbis).

## Aplicación publicada

- **Frontend:** https://equipo-1-grupo-2026-msm.vercel.app
- **Backend:** https://biblioteca-tecnica-msm-api.onrender.com
- **Estado del servicio y conexión a la base:** https://biblioteca-tecnica-msm-api.onrender.com/api/health

El frontend está alojado en Vercel, la API en Render y la base PostgreSQL en Supabase. Las solicitudes del frontend a `/api` pasan por el proxy configurado en Vercel y se envían a Render.

## Funcionalidades

- Inicio de sesión y cierre de sesión.
- Resumen de objetos, disponibilidad, personas y préstamos activos.
- Consulta y búsqueda de objetos, personas y categorías.
- Registro de categorías, objetos, personas y préstamos desde Carga de datos.
- Devolución de materiales y actualización de su disponibilidad.
- Eliminación de registros cuando las reglas de protección y las relaciones lo permiten.
- Validación de datos y mensajes de error.

La API rechaza un segundo préstamo de un objeto ya prestado y una segunda devolución del mismo préstamo. Las operaciones de préstamo y devolución se realizan con transacciones.

## Tecnologías y estructura

| Componente | Tecnologías |
|---|---|
| Frontend | React 19, React Router 7 y Vite 6 |
| Backend | Node.js, Express 4 y controlador PostgreSQL `pg` |
| Autenticación | JWT y bcrypt |
| Base de datos | PostgreSQL en Supabase |
| Despliegue | Vercel y Render |

```text
Backend/
  config/         Conexión y reglas de protección de registros
  middleware/     Autenticación y manejo de errores
  models/         Consultas SQL y lógica de negocio
  routes/         Rutas de la API
  scripts/        Utilidades de administración
  sql/schema.sql  Esquema inicial de la base
  server.js       Aplicación Express y arranque del servidor
Frontend/
  src/componentes/ Pantallas y formularios
  src/services/    Cliente de la API
  src/main.jsx     Montaje de React
  vercel.json      Despliegue con Frontend como directorio raíz
Entregables/       Documentación del proyecto e informe de pruebas
render.yaml        Blueprint del backend
vercel.json        Despliegue desde la raíz del repositorio
```

## Instalación y ejecución local

### 1 Descargar e instalar

Se recomienda Node.js 22 y npm. Los comandos se ejecutan desde la raíz del repositorio, salvo indicación contraria.

```bash
git clone https://github.com/Rimbis/Equipo-1-Grupo-2026-MSM.git
cd Equipo-1-Grupo-2026-MSM
npm ci --prefix Backend
npm ci --prefix Frontend
cp Backend/.env.example Backend/.env
```

### 2 Preparar la base de datos

En el proyecto de Supabase correspondiente a Biblioteca, ejecutar el contenido de [Backend/sql/schema.sql](Backend/sql/schema.sql) desde el editor SQL. El archivo crea las tablas y un índice que impide dos préstamos activos para un mismo objeto. No carga registros iniciales ni modifica automáticamente tablas existentes con una estructura diferente.

Desde **Connect → Session pooler**, obtener la URI PostgreSQL completa e ingresar la contraseña real de la base. Si contiene caracteres especiales, codificarlos para URL. Guardar esa URI en `DATABASE_URL`.

### 3 Configurar las variables del backend

Editar `Backend/.env` según [Backend/.env.example](Backend/.env.example).

| Variable | Uso |
|---|---|
| `DATABASE_URL` | URI completa de PostgreSQL; obligatoria. |
| `JWT_SECRET` | Clave aleatoria para firmar las sesiones; obligatoria. |
| `BIBLIOTECARIO_USER` | Nombre exacto del usuario autorizado; obligatorio. |
| `BIBLIOTECARIO_PASSWORD_HASH` | Hash bcrypt de la contraseña; obligatorio. |
| `FRONTEND_URL` | Origen permitido, por ejemplo `http://localhost:5173`. Admite varios separados por comas. |
| `PORT` | Puerto local; por defecto `4000`. Render proporciona su propio puerto. |

Para generar la clave de sesión y el hash, ejecutar desde `Backend`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log(require('bcryptjs').hashSync('REEMPLAZAR_POR_TU_CONTRASENA', 12))"
```

En el archivo `.env`, encerrar el hash entre comillas simples para conservar los signos `$`. En el panel de Render, pegar solamente el valor del hash, sin comillas ni el prefijo `BIBLIOTECARIO_PASSWORD_HASH=`. No publicar contraseñas, tokens ni archivos `.env` en el repositorio.

### 4 Iniciar ambos servicios

En una terminal:

```bash
npm run dev --prefix Backend
```

En otra terminal:

```bash
npm run dev --prefix Frontend
```

Abrir `http://localhost:5173`. Vite redirige `/api` a `http://localhost:4000`; para este flujo no hace falta definir `VITE_API_URL`.

Para comprobar la compilación del frontend:

```bash
npm run build --prefix Frontend
```

## Inicio de sesión

El login actual valida **un usuario configurado mediante las variables de entorno**. No hay registro público ni credenciales predeterminadas incluidas en el proyecto. El administrador debe comunicar las credenciales a las personas autorizadas.

El usuario debe coincidir con `BIBLIOTECARIO_USER` y la contraseña con el hash de `BIBLIOTECARIO_PASSWORD_HASH`. El token dura ocho horas y se guarda en `sessionStorage`. La API exige `Authorization: Bearer <token>` en las rutas protegidas.

Aunque existen la tabla `usuarios`, su modelo y `Backend/scripts/crearAdmin.js`, el login actual no los consulta. Crear un usuario en esa tabla no habilita su acceso. Tampoco existe un script npm llamado `crear-admin` en la configuración actual.

## Despliegue

### Backend en Render

Crear un Web Service con el repositorio y la rama `main`:

| Opción | Valor |
|---|---|
| Runtime | Node |
| Root Directory | `Backend` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Configurar las variables obligatorias de la tabla anterior y usar `https://equipo-1-grupo-2026-msm.vercel.app` como `FRONTEND_URL`. Guardar los cambios con un nuevo despliegue. Como alternativa, [render.yaml](render.yaml) permite crear el servicio mediante un Blueprint; su nombre puede generar una URL distinta a la del servicio publicado.

La respuesta esperada de `/api/health` es HTTP 200:

```json
{"status":"ok","database":{"ok":true}}
```

HTTP 503 con `database.ok: false` indica que el servidor responde pero no logra consultar la base. Revisar los logs de Render para obtener el motivo. La instancia gratuita puede tardar en responder después de un período de inactividad.

### Frontend en Vercel

Importar el mismo repositorio y usar `main` como rama de producción. Hay configuración para dos opciones:

- **Raíz del repositorio:** usar `vercel.json`; la salida es `Frontend/dist`.
- **Directorio raíz Frontend:** usar `Frontend/vercel.json`; la salida es `dist`.

Ambas configuraciones compilan el frontend con `VITE_API_URL` vacío y redirigen `/api/:path*` al backend publicado. La regla de la API debe aparecer antes de la redirección general a `index.html`, necesaria para las rutas de React Router.

Si cambia el dominio de Render, actualizar su destino en **ambos archivos `vercel.json`** y volver a desplegar Vercel. `VITE_API_URL` es una variable del frontend, no del backend; para alojamientos sin ese proxy puede apuntar directamente al dominio de Render, con CORS configurado para el frontend.

## Uso básico

1. Iniciar sesión con las credenciales configuradas.
2. En **Cargar datos**, registrar categorías, personas y objetos según sea necesario.
3. Elegir **Préstamo** en Cargar datos y seleccionar una persona y un objeto disponible.
4. Consultar los préstamos activos en **Préstamos** y pulsar **Devolver** para registrar la devolución.
5. Consultar y filtrar la información en las demás pantallas.

Las eliminaciones pueden rechazarse por relaciones existentes, incluso si un préstamo ya fue devuelto. Además, `Backend/config/registrosProtegidos.js` protege por ID las personas y objetos hasta el ID 3 y las categorías hasta el ID 11. En una base nueva, revisar esos límites: el esquema no carga los registros que justifican esa protección.

## Rutas principales de la API

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/health` | Estado del servicio y de la base; pública. |
| POST | `/api/auth/login` | Inicio de sesión; pública, con límite de intentos. |
| GET | `/api/auth/me` | Verificación de sesión; protegida. |
| GET / POST | `/api/objetos` | Listar o crear objetos. |
| GET / POST | `/api/personas` | Listar o crear personas. |
| GET / POST | `/api/categorias` | Listar o crear categorías. |
| DELETE | `/api/objetos/:id`, `/api/personas/:id`, `/api/categorias/:id` | Eliminar un registro permitido. |
| GET / POST | `/api/prestamos` | Listar préstamos activos o registrar uno. |
| PATCH | `/api/prestamos/:id/devolver` | Registrar una devolución. |

Todas las rutas de objetos, personas, categorías y préstamos requieren sesión. Las peticiones de creación utilizan JSON; los IDs de categoría, persona y objeto deben enviarse como números enteros positivos.

## Pruebas y documentación

El 26 de octubre de 2026 se verificaron el login y las consultas mediante Vercel y Render, la navegación y los buscadores en Safari, y 18 comprobaciones de la lógica de negocio contra Supabase. Las pruebas de escritura se ejecutaron dentro de una transacción revertida al terminar, sin conservar registros de prueba.

El detalle de procedimientos, resultados y límites está en el [informe de pruebas de funcionamiento](Entregables/Informe_pruebas_funcionamiento.md). No existe actualmente una suite automatizada ni un comando `npm test`; estas verificaciones no sustituyen pruebas de carga, concurrencia o una auditoría de seguridad.

La carpeta [Entregables](Entregables/) reúne la descripción del proyecto, el diagrama de entidad relación, la planificación y el informe.

## Resolución de problemas

- **Pantalla en blanco:** comprobar que `Frontend/index.html` carga `/src/main.jsx`, que monta React, y volver a desplegar.
- **Usuario o contraseña incorrectos:** verificar las variables activas en Render, el hash bcrypt y los valores autocompletados del navegador. Guardar nuevas variables requiere redespliegue.
- **Demasiados intentos:** esperar el período indicado; el login limita los intentos por IP.
- **No conecta con la base:** revisar la URI completa, contraseña, host y puerto de Supabase. `ENOTFOUND` señala un problema al resolver el host configurado.
- **La API devuelve HTML o 404 desde Vercel:** revisar el destino y orden de las reglas `/api` del proxy y confirmar el despliegue de la rama correcta.
- **El backend no inicia:** revisar dependencias, comandos, directorio `Backend` y variables obligatorias en los logs de Render.
