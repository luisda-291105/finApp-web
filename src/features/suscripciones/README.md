# Feature: Suscripciones

## Qué hace

Presenta todas las suscripciones en una única cuadrícula: cobros recurrentes inferidos desde gastos reales, suscripciones detectadas en Gmail y registros manuales, cada una con una insignia de origen.

## Estructura

- `pages/SuscripcionesPage`: compone el encabezado, los filtros de Gmail y la sección unificada.
- `components/cards/MetricasCobrosRecurrentes`: tarjetas de resumen (gasto/mes, servicios detectados, próximo cobro) fuera de la cuadrícula unificada.
- `components/cards/TodasSuscripcionesSection`: estados de carga, estado vacío y la cuadrícula única con divisiones por prioridad (Alta, Media, Baja); dentro de cada bloque se ordenan por importancia (Alta primero).
- `components/cards/SuscripcionUnificadaCard`: tarjeta común; la de Gmail y la manual abren el detalle al pulsar toda la tarjeta.
- `components/cards/SuscripcionUnificadaCard`: tarjeta común con insignia de origen (Gmail / Manual / Detectada).
- `hooks/useSuscripcionesRecurrentes`: consulta el DTO de cobros recurrentes del backend.
- `hooks/useSuscripcionesGmail`: carga desde backend las suscripciones detectadas en las cuentas Gmail autorizadas.
- `components/modals/BuscarSuscripcionesModal`: búsqueda de remitentes detectados.
- `components/modals/FiltrarSuscripcionesModal`: filtros por cuenta, categoría y opción de baja.
- `components/modals/DetalleSuscripcionModal`: detalle compartido (Gmail y manuales), confirmación de baja con un clic y enlaces para terminar la gestión en Gmail.
- `index.js`: API pública usada por el mapa de rutas.

Las recurrencias se infieren en el backend desde gastos reales confirmados con intervalos regulares. Las suscripciones de correo también se consultan desde el backend usando la autorización Gmail existente y DTOs. La detección es estimada y requiere confirmación del usuario; Gmail sigue siendo el lugar para administrar las bajas.
