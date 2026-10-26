# Dependencias de Biblioteca Tec

**Proyecto:** Equipo 1 Grupo 2026 MSM  
**Fecha de documentación:** 26 de octubre de 2026

Este documento describe las bibliotecas declaradas directamente por el proyecto, su función y dónde se utilizan. Las versiones se tomaron de los archivos `package.json` y `package-lock.json` de Backend y Frontend; no representan necesariamente la última versión publicada de cada biblioteca.

## Resumen

El proyecto declara **15 dependencias directas**: 8 del backend, 3 del frontend y 4 herramientas de desarrollo del frontend. Las dependencias indirectas o transitivas se instalan automáticamente y quedan registradas en los archivos de bloqueo.

## Backend

Estas bibliotecas están declaradas en `Backend/package.json`, dentro de `dependencies`, y se instalan en Render para ejecutar la API.

| Dependencia | Versión declarada | Versión fijada | Función y uso en la aplicación |
|---|---|---|---|
| `express` | `^4.22.2` | `4.22.3` | Crea el servidor HTTP y las rutas de objetos, personas, categorías, préstamos y autenticación. Se configura en `Backend/server.js` y en los módulos de `Backend/routes`. |
| `pg` | `^8.22.0` | `8.23.0` | Conecta Node.js con PostgreSQL en Supabase. Proporciona el pool de conexiones, consultas parametrizadas y transacciones utilizadas por los modelos. Se configura en `Backend/config/db.js`. |
| `dotenv` | `^17.4.2` | `17.4.2` | Carga las variables de un archivo `.env` durante la ejecución local. Se invoca en `Backend/server.js` y `Backend/config/db.js`. En Render, las variables se configuran en el panel del servicio. |
| `cors` | `^2.8.6` | `2.8.6` | Configura qué orígenes pueden acceder a la API desde un navegador. Utiliza `FRONTEND_URL` en `Backend/server.js`. No reemplaza la autenticación. |
| `helmet` | `^8.3.0` | `8.3.0` | Agrega encabezados HTTP que ayudan a proteger las respuestas de la API. Se aplica mediante `app.use(helmet())` en `Backend/server.js`. |
| `bcryptjs` | `^3.0.3` | `3.0.3` | Genera hashes de contraseñas y permite compararlas con el hash almacenado. El login usa `bcrypt.compare` con `BIBLIOTECARIO_PASSWORD_HASH`; la utilidad de administración también genera hashes. No cifra contraseñas de forma reversible. |
| `jsonwebtoken` | `^9.0.3` | `9.0.3` | Firma y verifica tokens JWT. El login emite tokens HS256 con duración de ocho horas; `Backend/middleware/auth.js` valida la firma y la expiración usando `JWT_SECRET`. |
| `express-rate-limit` | `^8.7.1` | `8.7.1` | Limita los intentos de login por IP. `Backend/routes/auth.js` configura un máximo de 10 solicitudes por ventana de 15 minutos y devuelve HTTP 429 al superar el límite. |

### Cómo colaboran en una solicitud

Express recibe la petición. Helmet agrega encabezados y CORS configura el acceso desde otros orígenes. En el login, express-rate-limit controla la frecuencia, bcryptjs verifica la contraseña y jsonwebtoken genera el token. En las rutas protegidas, el middleware verifica ese token antes de que los modelos consulten Supabase mediante pg. Las variables necesarias provienen del entorno o del archivo `.env` cargado por dotenv.

El login actual valida el usuario configurado en variables de entorno. La existencia de un modelo `Usuario` no implica que el login consulte esa tabla.

## Frontend

Estas bibliotecas están declaradas en `Frontend/package.json`, dentro de `dependencies`, y forman parte del código que Vite compila para el navegador.

| Dependencia | Versión declarada | Versión fijada | Función y uso en la aplicación |
|---|---|---|---|
| `react` | `^19` | `19.2.6` | Construye la interfaz mediante componentes y administra estado, efectos y formularios. Se usa en las pantallas de `Frontend/src/componentes` y en `App.jsx`. |
| `react-dom` | `^19` | `19.2.6` | Conecta React con el DOM del navegador. `Frontend/src/main.jsx` usa `createRoot` para montar la aplicación dentro de `#root`. |
| `react-router-dom` | `^7.18.1` | `7.18.2` | Gestiona las rutas y la navegación sin recargar toda la página. `Frontend/src/App.jsx` usa `BrowserRouter`, `Routes`, `Route`, `NavLink`, `Navigate` y `Outlet`, incluyendo las redirecciones según la sesión. La API sigue validando cada solicitud protegida. |

Las solicitudes HTTP se realizan con **`fetch`**, disponible en el navegador, desde `Frontend/src/services/api.js`. El proyecto no necesita Axios para este flujo. El token se guarda en `sessionStorage`, que también es una API del navegador.

## Herramientas de desarrollo del frontend

Se declaran en `devDependencies`. Son necesarias para desarrollar y compilar, aunque el sitio publicado se entrega como archivos estáticos en `Frontend/dist`.

| Dependencia | Versión declarada | Versión fijada | Función y uso en el proyecto |
|---|---|---|---|
| `vite` | `^6.0.0` | `6.4.3` | Proporciona el servidor de desarrollo y genera la compilación de producción. Su configuración incluye el proxy local `/api` hacia el backend en el puerto 4000. |
| `@vitejs/plugin-react` | `^4.3.4` | `4.7.0` | Integra React con Vite y habilita la transformación de JSX y la actualización de componentes durante el desarrollo. Se registra en `Frontend/vite.config.js`. |
| `@types/react` | `^19` | `19.2.15` | Proporciona definiciones de tipos de React para herramientas de edición y análisis. No agrega funcionalidad al navegador; las pantallas actuales están escritas en JavaScript y JSX. |
| `@types/react-dom` | `^19` | `19.2.3` | Proporciona definiciones de tipos de React DOM. Complementa el soporte de edición y análisis, sin intervenir en la ejecución de producción. |

## Entorno y servicios externos

Estos elementos son parte de la arquitectura, pero no son dependencias npm directas:

- **Node.js:** entorno que ejecuta el backend y las herramientas de compilación. El Blueprint de Render declara Node.js 22.
- **npm:** administrador que instala paquetes y ejecuta los scripts de cada carpeta.
- **PostgreSQL y Supabase:** motor de base de datos y servicio que lo aloja. La aplicación se conecta mediante `pg`; no utiliza el SDK de Supabase como dependencia directa.
- **Render:** alojamiento del servidor Express.
- **Vercel:** alojamiento del frontend y proxy de las solicitudes `/api` hacia Render.

## Instalación y comandos

Desde la raíz del repositorio:

```bash
npm ci --prefix Backend
npm ci --prefix Frontend
```

`npm ci` usa las versiones registradas en cada `package-lock.json`. Requiere que el archivo de bloqueo sea coherente con su `package.json` y reemplaza el contenido de `node_modules`. Las variables de entorno y el esquema de la base se preparan por separado, como indica el README.

| Comando | Uso |
|---|---|
| `npm run dev --prefix Backend` | Ejecuta el backend con el modo de observación nativo de Node.js. No requiere nodemon. |
| `npm start --prefix Backend` | Ejecuta `node server.js`. Es el arranque de producción, equivalente a `npm start` desde Backend. |
| `npm run dev --prefix Frontend` | Inicia el servidor de desarrollo de Vite. |
| `npm run build --prefix Frontend` | Compila el frontend y genera `Frontend/dist`. |
| `npm run preview --prefix Frontend` | Previsualiza la compilación. Para probar la API requiere configurar su acceso; el proxy de desarrollo no se configura para preview en este proyecto. |

## Versiones y mantenimiento

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

## Archivos de referencia

- [Dependencias declaradas del backend](../Backend/package.json)
- [Versiones fijadas del backend](../Backend/package-lock.json)
- [Dependencias declaradas del frontend](../Frontend/package.json)
- [Versiones fijadas del frontend](../Frontend/package-lock.json)
- [Instalación y despliegue](../README.md)
- [Informe de pruebas de funcionamiento](Informe_pruebas_funcionamiento.md)
