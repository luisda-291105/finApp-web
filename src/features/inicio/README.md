# Feature: Inicio

## Qué hace

Muestra las vistas o muestras guardadas por el usuario en `/dashboard` y permite crear, editar, eliminar y abrir el detalle de cada una.

## Estructura

- `pages/InicioPage`: compone la página y coordina navegación, selección y ciclo visual de los modales.
- `components/cards/MuestraCard`: tarjeta accesible que presenta una muestra guardada.
- `components/cards/MuestraVisual`: renderiza sus tipos de visualización (tarjeta, gráfica, métrica y mapa de calor).
- `components/forms/CrearMuestraForm`: campos controlados y envío de la muestra.
- `components/modals/CrearMuestraModal`: formulario de crear/editar, captura de foco y cierre accesible.
- `components/modals/AgruparMuestrasModal`: selección de dos a cuatro muestras activas y creación de agrupaciones.
- `components/modals/DetalleMuestraModal`: vista previa, datos, navegación a la fuente y acciones CRUD.
- `hooks/useMuestras`: carga, validación y operaciones CRUD de las muestras del usuario.
- `services/muestrasService`: llamadas HTTP y adaptación del payload de muestra.
- `utils/inicioHelpers`: opciones, valores demo, formatos, normalización y validación pura.
- `index.js`: API pública de la página.

Cada muestra consulta una fuente (Suscripciones, Contabilidad, Correo o Contactos) y conserva su tipo y tamaño natural. Para Correo se pueden elegir varias cuentas específicas o todas. Desde el botón «Crear agrupación» se pueden agrupar entre dos y cuatro muestras activas; las muestras agrupadas se presentan juntas conservando cada tarjeta, y la acción «Separar» las devuelve al dashboard. El orden de las muestras y agrupaciones se puede cambiar arrastrando el control o usando los botones accesibles; el nuevo orden se guarda mediante `PUT /api/muestras/orden`.
