# Feature: Correos

## Qué hace

Lista fuentes de correo y cuentas Gmail conectadas, consulta los mensajes destinados a cada dirección y permite filtrarlos por categoría. La renovación automática ocurre cada cinco minutos mientras la vista está abierta.

## Componentes

- `pages/CorreosPage`: vista principal de `/dashboard/correos`.
- `components/cards/CorreoCuentaCard`: estado y acceso a una fuente o cuenta.
- `components/modals/BandejaCorreosModal`: mensajes y filtros para una dirección seleccionada.

## Hook, servicio y utilidades

- `hooks/useCorreos`: carga fuentes, sincroniza Gmail, gestiona selección y estados de consulta.
- `services/correosService`: consulta mensajes por fuente usando la integración compartida de Gmail.
- `utils/correoHelpers`: normalización, deduplicación, combinación de direcciones, fechas y filtros puros.

## API pública

`index.js` expone `CorreosPage` y `CorreoCuentaCard`. Las operaciones OAuth y la conexión Gmail siguen en `src/services/gmailServicio.js`, compartidas con el contexto de Gmail.
