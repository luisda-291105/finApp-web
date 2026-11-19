# Feature: Grupo

## Qué hace

Gestiona los grupos del usuario: listado, creación, edición, eliminación y vinculación de fuentes. El chat y las invitaciones se muestran como demostración.

## Componentes

- `pages/GruposPage`: listado principal de `/dashboard/grupos`.
- `components/cards/GrupoCard`: resumen y acceso al detalle de un grupo.
- `components/forms/GrupoForm`: campos controlados para crear un grupo.
- `components/forms/EditarGrupoForm`: campos controlados para actualizar los datos del grupo.
- `components/modals/CrearGrupoModal`: formulario de creación.
- `components/cards/GrupoConfiguracionCard`: configuración de grupos en `/dashboard/configuracion` (datos, invitaciones, fuentes y Vínculo de Telegram); transicional a la migración de la configuración fuera del modal.
- `components/modals/GrupoDetalleModal`: fuentes vinculadas y chat con el asistente IA por Telegram.

## Hooks y servicios

- `hooks/useGrupos`: carga y estado del listado; sincroniza actualizaciones y eliminaciones.
- `services/gruposService`: operaciones de grupos usando `api.config` y `httpServicio`.

## API pública

`index.js` exporta `GruposPage`, `GrupoCard` y `CrearGrupoModal`. El resto de la aplicación debe importar desde `features/grupo`, no desde rutas internas.

## Dependencias

Usa contextos, hooks de foco y componentes base compartidos desde `src/`. Los tests continúan centralizados bajo `src/test/`.
