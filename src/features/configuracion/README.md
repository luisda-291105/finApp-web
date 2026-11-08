# Feature: Configuración

Agrupa la pantalla de preferencias, las fuentes vinculadas a la cuenta y sus modales.

## Estructura

- `pages/ConfiguracionPage`: compone Apariencia, Perfil y Fuentes; coordina Gmail y sus modales.
- `components/cards/AparienciaCard`: preferencia de tema claro/oscuro.
- `components/cards/PerfilCard`: resumen de cuenta y acceso al modal de perfil.
- `components/cards/FuentesRegistradas`: lista de fuentes y cuentas Gmail con estados de carga, error y vacío.
- `components/cards/FuenteItem`: resumen seleccionable que abre el detalle de la fuente.
- `components/modals/FuenteDetalleModal`: detalle, edición y eliminación de una fuente; concentra las acciones fuera de las tarjetas para evitar desbordes.
- `components/cards/EstadoFuente`: indicador visual del estado de una fuente.
- `hooks/useFuentesConfiguracion`: carga y administra las fuentes (alta confirmada, edición y eliminación).
- `components/modals/CrearFuenteModal`: modal independiente para registrar fuentes y conectar Gmail desde el mismo flujo.
- `components/modals/PerfilUsuarioModal`: modal independiente para consultar y editar el perfil.
- `components/modals/index.js`: exporta ambos modales como componentes separados.
- `index.js`: entrada pública consumida por las rutas.

Los servicios de fuentes, Gmail y usuario, así como sus contextos y hooks comunes, permanecen en `src/services`, `src/context` y `src/hooks` porque los comparten otras funcionalidades.
