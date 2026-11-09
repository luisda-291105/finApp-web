# Feature: Suscripciones

## Qué hace

Presenta cobros recurrentes inferidos desde gastos reales y remitentes suscritos detectados desde Gmail.

## Estructura

- `pages/SuscripcionesPage`: compone el resumen, los filtros y la lista.
- `components/cards/CobrosRecurrentesReales`: métricas y tarjetas de recurrencias inferidas desde gastos confirmados.
- `hooks/useSuscripcionesRecurrentes`: consulta el DTO de cobros recurrentes del backend.
- `hooks/useSuscripcionesGmail`: carga desde backend las suscripciones detectadas en las cuentas Gmail autorizadas.
- `components/cards/SuscripcionGmailCard`: resumen del remitente de correo.
- `components/modals/BuscarSuscripcionesModal`: búsqueda de remitentes detectados.
- `components/modals/FiltrarSuscripcionesModal`: filtros por cuenta, categoría y opción de baja.
- `components/modals/DetalleSuscripcionModal`: detalle del remitente, confirmación de baja con un clic y enlaces para terminar la gestión en Gmail.
- `index.js`: API pública usada por el mapa de rutas.

Las recurrencias se infieren en el backend desde gastos reales confirmados con intervalos regulares. Las suscripciones de correo también se consultan desde el backend usando la autorización Gmail existente y DTOs. La detección es estimada y requiere confirmación del usuario; Gmail sigue siendo el lugar para administrar las bajas.
