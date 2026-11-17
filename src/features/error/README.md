# Feature: Error

Contiene la vista de respaldo para rutas desconocidas y los componentes globales de error/alertas.

- `pages/ErrorPage`: presenta el código, el mensaje y las acciones de regreso.
- `components/LimiteDeError`: límite de errores de renderizado y carga de rutas.
- `components/alertas/AlertaGlobal`: puente declarativo hacia la pila lateral global.
- `components/alertas/NotificacionLateral`: notificación apilable (éxito, fallo o advertencia).
- `components/alertas/PilaNotificacionesLaterales`: contenedor lateral derecho que apila las alertas.
- `index.js`: entrada pública usada por las rutas y por los consumidores de alertas.
