# Informe de pruebas de funcionamiento de Biblioteca Tec

**Proyecto:** Equipo 1 Grupo 2026 MSM  
**Fecha de las pruebas:** 26 de octubre de 2026  
**Aplicación:** https://equipo-1-grupo-2026-msm.vercel.app

## Objetivo y resultado general

Verificar el funcionamiento de los procesos principales de la aplicación y la coherencia entre el frontend en Vercel, el backend en Render y la base PostgreSQL en Supabase. En los escenarios evaluados no se detectaron fallos que impidan el uso de los flujos principales. Las 18 verificaciones de la lógica de negocio contra la base de datos finalizaron correctamente.

## Procedimientos y resultados

| Área | Procedimiento realizado | Resultado |
|---|---|---|
| Conexión y autenticación | Se consultó el estado del backend, se inició sesión mediante la API publicada en Vercel y se verificó la sesión. También se comprobó el rechazo de solicitudes sin autenticación. | Conexión con Supabase y autenticación correctas. |
| Interfaz y consultas | Se recorrieron Inicio, Objetos, Personas, Categorías, Préstamos y Carga de datos en Safari. Se probaron los buscadores de objetos, personas y categorías. | Las pantallas cargaron y los filtros respondieron correctamente. |
| Formularios | Se revisaron los formularios de objetos, personas, categorías y préstamos, las opciones de personas y el rechazo de un formulario de objeto vacío. | Campos y selectores disponibles; el navegador bloqueó el envío vacío. |
| Altas y eliminaciones | Se crearon categorías, objetos y personas de prueba mediante los modelos del backend. Se verificó la normalización de espacios y la eliminación de registros sin relaciones. | Operaciones correctas. Se rechazaron borrados con relaciones o protección aplicable. |
| Préstamos y devoluciones | Se registró un préstamo, se verificó el estado del objeto, se intentó repetir el préstamo y se efectuó la devolución. Luego se intentó devolverlo nuevamente. | El objeto pasó de disponible a prestado y volvió a disponible. Se bloquearon las operaciones duplicadas y se guardó la fecha de devolución. |

## Evidencia y cuidado de los datos

La API publicada permitió consultar 74 objetos, 4 personas, 7 categorías y ningún préstamo activo en el momento de la comprobación. La revisión de coherencia no encontró diferencias entre los objetos marcados como prestados y sus préstamos activos.

Las pruebas de escritura se ejecutaron dentro de una transacción controlada contra Supabase y finalizaron con **ROLLBACK**. Los registros creados para probar se descartaron. Estas verificaciones ejercitaron los modelos del backend; no constituyen un envío completo de cada formulario desde el navegador.

## Conclusiones y alcance

La comunicación Vercel–Render–Supabase, la autenticación y las reglas principales de altas, préstamos, devoluciones y eliminaciones funcionaron en las pruebas realizadas. La interfaz permitió navegar y consultar la información sin errores observados.

Los resultados respaldan el funcionamiento de los escenarios probados. No se realizaron pruebas de carga, una auditoría integral de seguridad ni una evaluación en todos los navegadores y dispositivos. Tampoco se verificó la concurrencia real de dos usuarios prestando el mismo objeto simultáneamente.
