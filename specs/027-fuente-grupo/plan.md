# Plan — Spec 027: Fuentes e interacción de grupos

## Diseño

El modelo `MGrupo` será propietario del lado de asociación muchos-a-muchos con `MFuente`, mediante la tabla `grupo_fuente`. No se agrega cascada de eliminación: las fuentes son registros del usuario y quitar la asociación no debe borrarlas. `SGrupo` valida que el grupo y la fuente pertenezcan al mismo usuario antes de guardar.

El frontend usa operaciones específicas del servicio de grupos para vincular y desvincular, y consulta fuentes mediante `fuenteServicio`. El modal de detalle administra dos pestañas: fuentes persistentes y chat de demostración; el formulario de registro en línea registra la fuente en el usuario y luego la vincula. La pestaña Solicitudes muestra ejemplos marcados como demostración mientras no exista endpoint.

Configuración incorpora edición de tipo, contenido y estado, además de una confirmación accesible antes de eliminar. Las operaciones de edición/eliminación envían `idUsuario` y el backend comprueba la propiedad. El borrado limpia filas de `grupo_fuente` antes de borrar la fuente.

## Archivos principales

- Backend: `MGrupo.java`, `SGrupo.java`, `CGrupo.java`, `SFuente.java`, `CFuente.java`, `IFuentes.java`, `IGrupo.java` y pruebas de servicios.
- Frontend: `grupoServicio.js`, `fuenteServicio.js`, `ModalDetalleGrupo.jsx`, `PaginaDashboardBolsillos.jsx`, `PaginaDashboardConfiguracion.jsx` y sus pruebas.
- Documentación: `spec.md`, `plan.md`, `tasks.md`, `MEMORY.md`.

## Validaciones

1. Pruebas focalizadas de asociación, registro desde el detalle, estados vacíos/errores y foco.
2. Suite Vitest completa y build Vite.
3. Suite Maven del backend; confirmar que la tabla relacional se crea con el `ddl-auto=update` configurado.
