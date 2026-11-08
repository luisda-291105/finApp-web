# Feature: Suscripciones

## Qué hace

Presenta una demostración local de suscripciones, permite filtrarlas y pausar o activar cada ejemplo. Los cambios se mantienen en memoria y se reinician al recargar.

## Estructura

- `pages/SuscripcionesPage`: compone el resumen, los filtros y la lista.
- `components/cards/ResumenSuscripciones`: tarjetas de gasto mensual, suscripciones activas y próximo cobro.
- `components/cards/SuscripcionCard`: el cuerpo de la tarjeta abre el detalle; pausa/activación sigue como acción separada.
- `components/modals/DetalleSuscripcionModal`: fuente de pago, último pago, pagos pasados y controles CRUD visibles (edición/eliminación aún deshabilitadas).
- `hooks/useSuscripciones`: estado local y coordinación de filtros/acciones.
- `utils/suscripcionesData`: ejemplos, etiquetas, formato monetario y cálculos derivados.
- `index.js`: API pública usada por el mapa de rutas.

No hay servicio en `services/` porque esta pantalla todavía no consulta ni modifica datos del backend.
