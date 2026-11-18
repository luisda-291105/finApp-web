# Feature: Suscripciones

## Qué hace

Presenta todas las suscripciones en una única cuadrícula: cobros recurrentes (los de las suscripciones con monto y fecha de cobro y los pagos repetidos detectados en Contabilidad), suscripciones detectadas en Gmail y registros manuales, cada una con una insignia de origen.

## Estructura

- `pages/SuscripcionesPage`: compone el encabezado, los filtros de Gmail y la sección unificada.
- `components/cards/MetricasCobrosRecurrentes`: tarjetas de resumen (gasto/mes, servicios detectados, próximo cobro) fuera de la cuadrícula unificada.
- `components/cards/TodasSuscripcionesSection`: estados de carga, estado vacío y la cuadrícula única con divisiones por prioridad (Alta, Media, Baja); dentro de cada bloque se ordenan por importancia (Alta primero).
- `components/cards/SuscripcionUnificadaCard`: tarjeta común; la de Gmail y la manual abren el detalle al pulsar toda la tarjeta.
- `components/cards/SuscripcionUnificadaCard`: tarjeta común con insignia de origen (Gmail / Manual / Detectada).
- `hooks/useSuscripcionesRecurrentes`: consulta los cobros recurrentes (suscripciones con monto y fecha de cobro + pagos repetidos de Contabilidad) y evita duplicar un servicio que ya esté registrado como suscripción.
- `hooks/useSuscripcionesGmail`: carga desde backend las suscripciones detectadas en las cuentas Gmail autorizadas.
- `components/modals/BuscarSuscripcionesModal`: búsqueda de remitentes detectados.
- `components/modals/FiltrarSuscripcionesModal`: filtros por cuenta, categoría y opción de baja.
- `components/modals/DetalleSuscripcionModal`: detalle compartido (Gmail y manuales), confirmación de baja con un clic y enlaces para terminar la gestión en Gmail.
- `index.js`: API pública usada por el mapa de rutas.

Los cobros recurrentes se toman de las suscripciones activas que tienen monto y fecha de cobro (`GET /suscripcion/recurrentes`) y, como complemento, de los pagos repetidos del mismo servicio en Contabilidad (`GET /movimiento/recurrentes`); si un servicio ya está registrado como suscripción, el pago repetido no se vuelve a sumar. Las suscripciones de correo también se consultan desde el backend usando la autorización Gmail existente y DTOs. La detección es estimada y requiere confirmación del usuario; Gmail sigue siendo el lugar para administrar las bajas.
