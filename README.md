# Biblioteca Tec

Sistema para gestionar objetos, personas, categorías, préstamos y devoluciones de materiales de una biblioteca escolar.

**Actualización de la documentación:** 2 de noviembre de 2026

Este documento reúne la descripción del sistema, los resultados de pruebas, la instalación, el despliegue, las dependencias y el manual de uso. La primera parte está dirigida al cliente y a su responsable técnico; la segunda, al bibliotecario.

**Equipo:** Micaela Pedrozo (Mazuu12), Santiago Lopez (bacha2007) y María Villarruel (Rimbis).

## Parte 1 Documentación para el cliente

### Objetivo y alcance

Biblioteca Tec centraliza el inventario y los préstamos de materiales escolares, como computadoras, mapas, calculadoras y libros. La institución puede conocer qué materiales están disponibles, a quién se prestaron y cuándo se devolvieron. El bibliotecario realiza las operaciones desde un navegador, sin editar directamente la base de datos.

### Aplicación publicada

- **Frontend:** https://equipo-1-grupo-2026-msm.vercel.app
- **Backend:** https://biblioteca-tecnica-msm-api.onrender.com
- **Estado del servicio y conexión a la base:** https://biblioteca-tecnica-msm-api.onrender.com/api/health

El frontend está alojado en Vercel, la API en Render y la base PostgreSQL en Supabase. Las solicitudes del frontend a `/api` pasan por el proxy configurado en Vercel y se envían a Render.

### Funcionalidades

- Inicio de sesión y cierre de sesión.
- Resumen de objetos, disponibilidad, personas y préstamos activos.
- Consulta y búsqueda de objetos, personas y categorías.
- Registro de categorías, objetos, personas y préstamos desde Carga de datos.
- Devolución de materiales y actualización de su disponibilidad.
- Eliminación de registros cuando las reglas de protección y las relaciones lo permiten.
- Validación de datos y mensajes de error.

La API rechaza un segundo préstamo de un objeto ya prestado y una segunda devolución del mismo préstamo. Las operaciones de préstamo y devolución se realizan con transacciones.

### Tecnologías y estructura

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

### Instalación y ejecución local

#### 1 Descargar e instalar

Se recomienda Node.js 22 y npm. Los comandos se ejecutan desde la raíz del repositorio, salvo indicación contraria.

```bash
git clone https://github.com/Rimbis/Equipo-1-Grupo-2026-MSM.git
cd Equipo-1-Grupo-2026-MSM
npm ci --prefix Backend
npm ci --prefix Frontend
cp Backend/.env.example Backend/.env
```

#### 2 Preparar la base de datos

En el proyecto de Supabase correspondiente a Biblioteca, ejecutar el contenido de [Backend/sql/schema.sql](Backend/sql/schema.sql) desde el editor SQL. El archivo crea las tablas y un índice que impide dos préstamos activos para un mismo objeto. No carga registros iniciales ni modifica automáticamente tablas existentes con una estructura diferente.

Desde **Connect → Session pooler**, obtener la URI PostgreSQL completa e ingresar la contraseña real de la base. Si contiene caracteres especiales, codificarlos para URL. Guardar esa URI en `DATABASE_URL`.

#### 3 Configurar las variables del backend

Editar `Backend/.env` según [Backend/.env.example](Backend/.env.example).

| Variable | Uso |
|---|---|
| `DATABASE_URL` | URI completa de PostgreSQL; obligatoria. |
| `JWT_SECRET` | Clave aleatoria para firmar las sesiones; obligatoria. |
| `BIBLIOTECARIO_USER` | Variable requerida por el arranque actual; el login consulta la tabla `usuarios`. |
| `BIBLIOTECARIO_PASSWORD_HASH` | Variable requerida por el arranque actual; el login usa el hash de la tabla `usuarios`. |
| `FRONTEND_URL` | Origen permitido, por ejemplo `http://localhost:5173`. Admite varios separados por comas. |
| `PORT` | Puerto local; por defecto `4000`. Render proporciona su propio puerto. |

Para generar la clave de sesión y el hash, ejecutar desde `Backend`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log(require('bcryptjs').hashSync('REEMPLAZAR_POR_TU_CONTRASENA', 12))"
```

En el archivo `.env`, encerrar el hash entre comillas simples para conservar los signos `$`. En el panel de Render, pegar solamente el valor del hash, sin comillas ni el prefijo `BIBLIOTECARIO_PASSWORD_HASH=`. No publicar contraseñas, tokens ni archivos `.env` en el repositorio.

#### 4 Iniciar ambos servicios

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

### Autenticación y administración técnica

El login consulta la tabla `usuarios`, normaliza el nombre ingresado a minúsculas y compara la contraseña con el hash bcrypt almacenado. No existe un registro público de cuentas. La API emite un token JWT de ocho horas, que el navegador guarda en `sessionStorage`, y exige `Authorization: Bearer <token>` en las rutas protegidas.

La utilidad `Backend/scripts/crearAdmin.js` permite crear una cuenta administradora o restablecer su contraseña. Desde la raíz, ejecutar `npm run crear-admin --prefix Backend -- <usuario> <contraseña> "<Nombre completo>"`. Esta operación modifica la base de datos y debe ejecutarla el responsable técnico cuando corresponda.

El servidor todavía exige `BIBLIOTECARIO_USER` y `BIBLIOTECARIO_PASSWORD_HASH` al arrancar, aunque la comparación de credenciales del login se realiza contra la tabla `usuarios`. Mantener esas variables junto con `DATABASE_URL` y `JWT_SECRET` en la configuración del servicio.

### Despliegue

#### Backend en Render

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

#### Frontend en Vercel

Importar el mismo repositorio y usar `main` como rama de producción. Hay configuración para dos opciones:

- **Raíz del repositorio:** usar `vercel.json`; la salida es `Frontend/dist`.
- **Directorio raíz Frontend:** usar `Frontend/vercel.json`; la salida es `dist`.

Ambas configuraciones compilan el frontend con `VITE_API_URL` vacío y redirigen `/api/:path*` al backend publicado. La regla de la API debe aparecer antes de la redirección general a `index.html`, necesaria para las rutas de React Router.

Si cambia el dominio de Render, actualizar su destino en **ambos archivos `vercel.json`** y volver a desplegar Vercel. `VITE_API_URL` es una variable del frontend, no del backend; para alojamientos sin ese proxy puede apuntar directamente al dominio de Render, con CORS configurado para el frontend.

### Reglas de protección de los datos

Las eliminaciones pueden rechazarse por relaciones existentes, incluso si un préstamo ya fue devuelto. Además, `Backend/config/registrosProtegidos.js` protege por ID las personas y objetos hasta el ID 3 y las categorías hasta el ID 11. En una base nueva, revisar esos límites: el esquema no carga los registros que justifican esa protección.

### Rutas principales de la API

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

### Pruebas de funcionamiento y estado de entrega

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

Las pruebas de escritura se ejecutaron dentro de una transacción controlada contra Supabase y finalizaron con **ROLLBACK**. Los registros creados para probar se descartaron. Estas verificaciones ejercitaron los modelos del backend; no constituyen un envío completo de cada formulario desde el navegador.

#### Conclusión de las pruebas

La integración entre Vercel, Render y Supabase funciona correctamente. Las funciones evaluadas se completaron sin errores observados y el sistema está disponible para su uso cotidiano. Este resultado describe las pruebas funcionales registradas y el estado de funcionamiento confirmado para la entrega; no constituye una garantía de ausencia de fallos en cualquier situación futura.

No hay una suite automatizada ni un comando `npm test`. Las comprobaciones registradas no incluyen pruebas de carga, concurrencia real, todos los navegadores y dispositivos ni una auditoría integral de seguridad.

### Actualización de categorías y cierre de sesión del 2 de noviembre de 2026

Se agregó la selección de categorías mediante botones accesibles. Al pulsar una categoría se abre su detalle con los objetos asociados por su identificador, el nombre y el estado disponible o prestado. Cada tarjeta indica cuántos objetos contiene. El detalle permite buscar objetos, muestra un aviso cuando la categoría está vacía y permite eliminar los objetos autorizados, con confirmación previa. Los registros protegidos conservan su restricción y los rechazos de la API se muestran sin ocultar el listado.

Se agregaron accesos para crear una categoría y para cargar un objeto en la categoría seleccionada. Este último abre Carga de datos con el formulario de objeto y la categoría preseleccionada. Al eliminar un objeto correctamente se actualizan el detalle y el contador; al cerrar el detalle se vuelve a la exploración de categorías.

El botón **Cerrar sesión** se ubicó fuera del menú de navegación desplazable, con fondo verde y texto blanco. En pantallas pequeñas comparte la fila superior con la marca, mientras los enlaces quedan en una fila independiente. Su acción elimina el token de sesión y la aplicación redirige al acceso.

| Comprobación realizada | Resultado |
|---|---|
| Compilación de producción mediante `npm run build --prefix Frontend` | Correcta. |
| Selección de distintas categorías y asociación de objetos por ID numérico o de texto | Correcta en comprobaciones aisladas con datos ficticios. No se mezclaron objetos de otras categorías. |
| Búsqueda de objetos, categoría vacía y búsqueda sin coincidencias | Correctas en comprobaciones aisladas. |
| Paginación de categorías y cierre del detalle | Correctos en comprobaciones aisladas. |
| Objeto protegido y eliminación rechazada por la API | Se conserva el registro y se muestra el motivo del rechazo en comprobaciones aisladas. |
| Eliminación aceptada de un objeto | Se actualizan el listado y el contador en comprobaciones aisladas. |
| Accesos a creación y categoría preseleccionada en el formulario | Correctos en comprobaciones aisladas. |
| Cierre de sesión mediante el servicio del frontend | Se comprobó que elimina el token de `sessionStorage` y deja la sesión inactiva. |

Estas comprobaciones se realizaron localmente con respuestas simuladas y sin modificar la base publicada. Las comprobaciones aisladas ejecutan la lógica de los componentes con un entorno de hooks simulado; no sustituyen una prueba completa de React en un navegador. Queda pendiente la comprobación visual del botón y del detalle en escritorio y móvil, así como el recorrido completo contra la API publicada.

### Resolución de problemas

- **Pantalla en blanco:** comprobar que `Frontend/index.html` carga `/src/main.jsx`, que monta React, y volver a desplegar.
- **Usuario o contraseña incorrectos:** verificar la cuenta y su hash bcrypt en la tabla `usuarios`, y los valores autocompletados del navegador. El responsable técnico puede restablecer la contraseña mediante la utilidad de administración.
- **Demasiados intentos:** esperar el período indicado; el login limita los intentos por IP.
- **No conecta con la base:** revisar la URI completa, contraseña, host y puerto de Supabase. `ENOTFOUND` señala un problema al resolver el host configurado.
- **La API devuelve HTML o 404 desde Vercel:** revisar el destino y orden de las reglas `/api` del proxy y confirmar el despliegue de la rama correcta.
- **El backend no inicia:** revisar dependencias, comandos, directorio `Backend` y variables obligatorias en los logs de Render.

### Dependencias e integración técnica

#### Resumen

El proyecto declara **15 dependencias directas**: 8 del backend, 3 del frontend y 4 herramientas de desarrollo del frontend. Las dependencias indirectas o transitivas se instalan automáticamente y quedan registradas en los archivos de bloqueo.

#### Backend

Estas bibliotecas están declaradas en `Backend/package.json`, dentro de `dependencies`, y se instalan en Render para ejecutar la API.

| Dependencia | Versión declarada | Versión fijada | Función y uso en la aplicación |
|---|---|---|---|
| `express` | `^4.22.2` | `4.22.3` | Crea el servidor HTTP y las rutas de objetos, personas, categorías, préstamos y autenticación. Se configura en `Backend/server.js` y en los módulos de `Backend/routes`. |
| `pg` | `^8.22.0` | `8.23.0` | Conecta Node.js con PostgreSQL en Supabase. Proporciona el pool de conexiones, consultas parametrizadas y transacciones utilizadas por los modelos. Se configura en `Backend/config/db.js`. |
| `dotenv` | `^17.4.2` | `17.4.2` | Carga las variables de un archivo `.env` durante la ejecución local. Se invoca en `Backend/server.js` y `Backend/config/db.js`. En Render, las variables se configuran en el panel del servicio. |
| `cors` | `^2.8.6` | `2.8.6` | Configura qué orígenes pueden acceder a la API desde un navegador. Utiliza `FRONTEND_URL` en `Backend/server.js`. No reemplaza la autenticación. |
| `helmet` | `^8.3.0` | `8.3.0` | Agrega encabezados HTTP que ayudan a proteger las respuestas de la API. Se aplica mediante `app.use(helmet())` en `Backend/server.js`. |
| `bcryptjs` | `^3.0.3` | `3.0.3` | Genera hashes de contraseñas y permite compararlas con el hash almacenado. El login usa `bcrypt.compare` con el hash de la tabla `usuarios`; la utilidad de administración también genera hashes. No cifra contraseñas de forma reversible. |
| `jsonwebtoken` | `^9.0.3` | `9.0.3` | Firma y verifica tokens JWT. El login emite tokens HS256 con duración de ocho horas; `Backend/middleware/auth.js` valida la firma y la expiración usando `JWT_SECRET`. |
| `express-rate-limit` | `^8.7.1` | `8.7.1` | Limita los intentos de login por IP. `Backend/routes/auth.js` configura un máximo de 10 solicitudes por ventana de 15 minutos y devuelve HTTP 429 al superar el límite. |

##### Cómo colaboran en una solicitud

Express recibe la petición. Helmet agrega encabezados y CORS configura el acceso desde otros orígenes. En el login, express-rate-limit controla la frecuencia, bcryptjs verifica la contraseña y jsonwebtoken genera el token. En las rutas protegidas, el middleware verifica ese token antes de que los modelos consulten Supabase mediante pg. Las variables necesarias provienen del entorno o del archivo `.env` cargado por dotenv.

El login consulta el modelo `Usuario` para buscar la cuenta en PostgreSQL y comparar su hash bcrypt.

#### Frontend

Estas bibliotecas están declaradas en `Frontend/package.json`, dentro de `dependencies`, y forman parte del código que Vite compila para el navegador.

| Dependencia | Versión declarada | Versión fijada | Función y uso en la aplicación |
|---|---|---|---|
| `react` | `^19` | `19.2.6` | Construye la interfaz mediante componentes y administra estado, efectos y formularios. Se usa en las pantallas de `Frontend/src/componentes` y en `App.jsx`. |
| `react-dom` | `^19` | `19.2.6` | Conecta React con el DOM del navegador. `Frontend/src/main.jsx` usa `createRoot` para montar la aplicación dentro de `#root`. |
| `react-router-dom` | `^7.18.1` | `7.18.2` | Gestiona las rutas y la navegación sin recargar toda la página. `Frontend/src/App.jsx` usa `BrowserRouter`, `Routes`, `Route`, `NavLink`, `Navigate` y `Outlet`, incluyendo las redirecciones según la sesión. La API sigue validando cada solicitud protegida. |

Las solicitudes HTTP se realizan con **`fetch`**, disponible en el navegador, desde `Frontend/src/services/api.js`. El proyecto no necesita Axios para este flujo. El token se guarda en `sessionStorage`, que también es una API del navegador.

#### Herramientas de desarrollo del frontend

Se declaran en `devDependencies`. Son necesarias para desarrollar y compilar, aunque el sitio publicado se entrega como archivos estáticos en `Frontend/dist`.

| Dependencia | Versión declarada | Versión fijada | Función y uso en el proyecto |
|---|---|---|---|
| `vite` | `^6.0.0` | `6.4.3` | Proporciona el servidor de desarrollo y genera la compilación de producción. Su configuración incluye el proxy local `/api` hacia el backend en el puerto 4000. |
| `@vitejs/plugin-react` | `^4.3.4` | `4.7.0` | Integra React con Vite y habilita la transformación de JSX y la actualización de componentes durante el desarrollo. Se registra en `Frontend/vite.config.js`. |
| `@types/react` | `^19` | `19.2.15` | Proporciona definiciones de tipos de React para herramientas de edición y análisis. No agrega funcionalidad al navegador; las pantallas actuales están escritas en JavaScript y JSX. |
| `@types/react-dom` | `^19` | `19.2.3` | Proporciona definiciones de tipos de React DOM. Complementa el soporte de edición y análisis, sin intervenir en la ejecución de producción. |

#### Entorno y servicios externos

Estos elementos son parte de la arquitectura, pero no son dependencias npm directas:

- **Node.js:** entorno que ejecuta el backend y las herramientas de compilación. El Blueprint de Render declara Node.js 22.
- **npm:** administrador que instala paquetes y ejecuta los scripts de cada carpeta.
- **PostgreSQL y Supabase:** motor de base de datos y servicio que lo aloja. La aplicación se conecta mediante `pg`; no utiliza el SDK de Supabase como dependencia directa.
- **Render:** alojamiento del servidor Express.
- **Vercel:** alojamiento del frontend y proxy de las solicitudes `/api` hacia Render.

#### Instalación y comandos

Desde la raíz del repositorio:

```bash
npm ci --prefix Backend
npm ci --prefix Frontend
```

`npm ci` usa las versiones registradas en cada `package-lock.json`. Requiere que el archivo de bloqueo sea coherente con su `package.json` y reemplaza el contenido de `node_modules`. Las variables de entorno y el esquema de la base se preparan por separado, como indica la sección de instalación de este documento.

| Comando | Uso |
|---|---|
| `npm run dev --prefix Backend` | Ejecuta el backend con el modo de observación nativo de Node.js. No requiere nodemon. |
| `npm start --prefix Backend` | Ejecuta `node server.js`. Es el arranque de producción, equivalente a `npm start` desde Backend. |
| `npm run dev --prefix Frontend` | Inicia el servidor de desarrollo de Vite. |
| `npm run build --prefix Frontend` | Compila el frontend y genera `Frontend/dist`. |
| `npm run preview --prefix Frontend` | Previsualiza la compilación. Para probar la API requiere configurar su acceso; el proxy de desarrollo no se configura para preview en este proyecto. |

#### Versiones y mantenimiento

La versión **declarada** es el rango permitido por `package.json`; la versión **fijada** es la registrada en `package-lock.json`. El prefijo `^` permite actualizaciones compatibles dentro de la misma versión mayor en los paquetes de este proyecto. Por eso, por ejemplo, Express declara `^4.22.2` pero el bloqueo registra `4.22.3`.

Para agregar o actualizar paquetes, ejecutar npm dentro del componente correspondiente y guardar tanto `package.json` como `package-lock.json`. En los despliegues con `npm ci`, el archivo de bloqueo determina la instalación. Aunque existen archivos `bun.lock`, los comandos documentados y la configuración de Render utilizan npm; no se necesita Bun para ese procedimiento.

Como revisión de mantenimiento pueden ejecutarse:

```bash
npm outdated --prefix Backend
npm outdated --prefix Frontend
npm audit --prefix Backend
npm audit --prefix Frontend
```

Estos comandos no equivalen a una actualización aprobada ni garantizan la ausencia de vulnerabilidades. Antes de desplegar cambios de versiones, revisar compatibilidad, compilar y repetir las pruebas de autenticación, consultas, altas, préstamos y devoluciones. No hay actualmente una suite automatizada ni scripts `npm test` configurados.



## Parte 2 Manual para el bibliotecario

### Acceso y credenciales

Abrir https://equipo-1-grupo-2026-msm.vercel.app desde un navegador con conexión a internet e ingresar los siguientes datos en la pantalla de inicio de sesión:

| Dato | Valor |
|---|---|
| Usuario | `Bibliotec` |
| Contraseña | `ClaveBiblioTec` |

Escribir la contraseña respetando las mayúsculas y sin agregar espacios. Pulsar el botón de inicio de sesión para acceder al panel. Estas credenciales corresponden al acceso comunicado para la entrega.

### Consultar el inventario

En **Inicio**, revisar el resumen de objetos, disponibilidad, personas y préstamos activos. En **Objetos**, buscar el material y consultar su categoría y estado. La pantalla **Personas** permite buscar los registros necesarios antes de cargar un préstamo. En **Categorías**, pulsar una tarjeta para ver sus objetos y su disponibilidad. Dentro del detalle se puede buscar un objeto, eliminarlo si está permitido o usar **Agregar objeto a esta categoría** para abrir el formulario con la categoría ya elegida. **Cerrar detalle** permite volver al listado. Para crear otra categoría, usar **Agregar categoría**.

### Registrar categorías personas y objetos

1. Abrir **Carga de datos** y elegir **categoría** para registrar una categoría por su nombre.
2. Elegir **persona** y completar nombre, apellido y curso de quien recibirá el material.
3. Elegir **objeto**, escribir el nombre del material y seleccionar su categoría.
4. Pulsar **Guardar** en cada formulario y esperar el mensaje de confirmación antes de continuar.

Registrar primero la categoría si todavía no existe. Los campos obligatorios deben completarse para guardar el registro.

### Registrar un préstamo

1. En **Carga de datos**, elegir **préstamo**.
2. Seleccionar la persona que recibe el material.
3. Seleccionar el objeto disponible.
4. Pulsar **Guardar** y esperar la confirmación.
5. Abrir **Préstamos** para consultar el préstamo activo.

El material pasa a estado prestado y deja de estar disponible para otro préstamo hasta su devolución. Si una persona o un objeto no aparece, comprobar que esté registrado y que el material esté disponible.

### Registrar una devolución

1. Abrir **Préstamos** y localizar el préstamo correspondiente al material recibido.
2. Pulsar **Devolver**.
3. Esperar la confirmación y comprobar que el objeto vuelva a figurar como disponible.

La devolución guarda su fecha y quita el préstamo de la lista de activos. No debe repetirse una devolución ya registrada.

### Eliminar registros y entender los avisos

Usar la opción de eliminación en la pantalla correspondiente cuando el registro ya no deba conservarse y el sistema lo permita. Los registros protegidos o vinculados a préstamos pueden bloquear la eliminación para conservar la información. Ese aviso es un control de integridad previsto.

Si faltan datos, completar los campos indicados y volver a guardar. Si se supera el límite de intentos de acceso, esperar el período informado. Si vence la sesión, ingresar nuevamente con las credenciales. Ante una dificultad persistente, comunicar al responsable técnico la pantalla, la acción realizada y el mensaje mostrado.

### Finalizar la jornada

Pulsar **Cerrar sesión**, en el encabezado de la aplicación, al terminar, especialmente en computadoras compartidas. Mantener las credenciales disponibles solo para las personas autorizadas a operar el sistema.
