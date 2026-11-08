# Feature: Correos

## Qué hace

Lista fuentes de correo y cuentas Gmail conectadas, consulta los mensajes destinados a cada dirección y permite filtrarlos por categoría. La renovación automática ocurre cada cinco minutos mientras la vista está abierta.

En Correos, Gmail también se analiza para sugerir ingresos, compras, pagos y suscripciones. Se leen hasta 10 mensajes recientes en una consulta conjunta para las fuentes de la cuenta; solo se descargan en serie los cuerpos de hasta 5 mensajes con señales financieras, guardándolos temporalmente en memoria para no volver a pedirlos al refrescar. El contenido se analiza temporalmente en el navegador y solo se registra un movimiento cuando la persona confirma y selecciona un bolsillo compatible. Los movimientos Gmail reutilizan `origen_tipo`, `origen_id` y `origen_nombre`; el ID de mensaje queda dentro de `origen_id` para detectar importaciones repetidas. `finApp-backend/sql/058_origen_correo_movimientos.sql` amplía esa columna para admitir la referencia compuesta.

Cada cuenta Gmail conectada se representa como una fila `CORREO` en `fuente`; sus tokens OAuth cifrados se guardan en esa misma fila. La migración `finApp-backend/sql/059_consolidar_gmail_en_fuente.sql` copia las conexiones antiguas antes de eliminar las tablas duplicadas `cuenta_gmail` y `gmail_conexion`.

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
