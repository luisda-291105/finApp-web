# Feature: Correos

## Qué hace

Lista fuentes de correo y cuentas Gmail conectadas, muestra desde la base de datos los mensajes destinados a cada dirección y permite filtrarlos por categoría. El backend sincroniza Gmail en segundo plano cada cinco minutos y procesa eventos Push cuando están configurados; abrir o actualizar la vista solo lee los datos persistidos.

El backend analiza el cuerpo de los mensajes guardados de los últimos 90 días y registra automáticamente compras e ingresos cuando el contenido menciona Bancolombia, una operación inequívoca y un monto etiquetado. No basta con que el remitente o el asunto contengan esas señales. Solo registra si existe exactamente un bolsillo activo del tipo correspondiente; con cero o varios, no modifica la contabilidad. Las alertas pendientes se muestran en Correos y se pueden marcar como vistas. Los movimientos Gmail reutilizan `origen_tipo`, `origen_id` y `origen_nombre` para evitar duplicados. En bases existentes, aplica también `finApp-backend/sql/066_movimientos_automaticos_gmail.sql`.

Cada cuenta Gmail conectada se representa como una fila `CORREO` en `fuente`; sus tokens OAuth cifrados se guardan en esa misma fila. La migración `finApp-backend/sql/059_consolidar_gmail_en_fuente.sql` copia las conexiones antiguas antes de eliminar las tablas duplicadas `cuenta_gmail` y `gmail_conexion`.

## Componentes

- `pages/CorreosPage`: vista principal de `/dashboard/correos`.
- `components/cards/CorreoCuentaCard`: estado y acceso a una fuente o cuenta.
- `components/modals/BandejaCorreosModal`: mensajes y filtros para una dirección seleccionada.

## Hook, servicio y utilidades

- `hooks/useCorreos`: carga fuentes, sincroniza Gmail, gestiona selección y estados de consulta.
- `services/correosService`: solicita al backend los mensajes por fuente conectada.
- `utils/correoHelpers`: normalización, deduplicación, combinación de direcciones, fechas y filtros puros.

## API pública

`index.js` expone `CorreosPage` y `CorreoCuentaCard`. Google Identity Services se usa en el navegador únicamente para autorizar y enviar el código OAuth; Gmail se sincroniza y persiste desde el backend, que expone DTOs de lectura. La consulta de Contactos y la renovación de tokens también se realizan desde el backend.
