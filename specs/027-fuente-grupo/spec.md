# Spec 027 — Fuentes, conversación e invitaciones en grupos

**Estado:** implementada (2026-10-29)

## Propósito

Permitir que cada grupo del usuario vincule fuentes que ya tiene registradas o registre una fuente nueva desde el detalle del grupo. El detalle también organiza el contenido en fuentes y chat grupal, y ofrece una acción para invitar usuarios. La página de grupos incorpora una sección de solicitudes.

## Decisiones de alcance

- La relación grupo-fuente se persiste en backend mediante una tabla de asociación. Un grupo solo puede vincular fuentes propiedad del mismo usuario que creó ese grupo.
- Registrar una fuente desde el detalle la guarda primero en la cuenta del usuario y luego la vincula al grupo. Desvincularla del grupo no elimina la fuente de la cuenta.
- El modal de detalle sigue los patrones existentes de trampa, cierre y devolución de foco.
- El chat acepta mensajes únicamente en el estado local de la vista; no hay endpoint/modelo de chat.
- La acción de invitación muestra el flujo de preparación, pero no envía ni persiste invitaciones. No hay endpoint/modelo de invitación.
- La sección Solicitudes muestra solicitudes de ejemplo claramente marcadas como demostración hasta que exista un endpoint que entregue solicitudes reales.
- Las transacciones siguen fuera de alcance (decisión del usuario en la conversación de la spec).

## Requisitos funcionales

- **RF-01 — Asociación persistente:** El detalle de un grupo lista las fuentes vinculadas, permite asociar una fuente existente del usuario y desvincularla sin borrarla.
- **RF-02 — Registro desde el grupo:** El usuario puede registrar una fuente nueva (tipo y contenido) desde el detalle. La fuente queda asociada a su cuenta y al grupo seleccionado.
- **RF-03 — Propiedad:** El backend rechaza la vinculación si el grupo o la fuente no pertenecen al `idUsuario` indicado. Una fuente no puede asociarse desde la interfaz si ya está vinculada a ese grupo.
- **RF-04 — Modal accesible:** El detalle presenta nombre y descripción del grupo, usa `FocusTrap`, `useCierreConEsc`, `useRetornoDeFoco`, nombres accesibles y foco visible.
- **RF-05 — Chat de grupo:** El modal permite abrir la pestaña de chat y redactar mensajes locales. La interfaz informa claramente que estos mensajes no se guardan.
- **RF-06 — Invitaciones:** El modal contiene una acción para preparar una invitación por correo y comunica que no se envía hasta que exista el endpoint.
- **RF-07 — Solicitudes:** La página de grupos contiene una sección/pestaña de solicitudes con ejemplos claramente rotulados como no persistidos, mientras no exista servicio de solicitudes.
- **RF-08 — Errores y estados:** Las cargas, altas, asociaciones y desvinculaciones muestran estados de espera y errores sin confirmar operaciones que fallaron.
- **RF-09 — Administrar fuentes registradas:** En Configuración cada fuente ofrece acciones accesibles para editar tipo, contenido y estado, o eliminarla con confirmación. Los cambios se guardan en backend y la lista se actualiza después del éxito.
- **RF-10 — Propiedad al administrar:** El backend solo permite editar o eliminar una fuente si coincide con el usuario indicado. Al eliminarla, limpia sus asociaciones de grupo y conserva los grupos.

## Fuera de alcance

- Persistir chat, miembros, invitaciones o solicitudes.
- Autenticación real/autorización por sesión. El backend actual no tiene autenticación; los endpoints validan consistencia del `idUsuario` recibido.
- Crear, aceptar o rechazar solicitudes de grupo.
- Movimientos, aportes o transferencias financieras.

## Validación

- Backend: pruebas de servicio para asociación de fuentes del mismo usuario, rechazo de fuentes ajenas y desvinculación sin borrar.
- Frontend: pruebas de listado/asociación, registro y asociación de fuente nueva, errores, pestañas de chat/solicitudes y foco del modal.
- Validación final: pruebas frontend focalizadas (12/12), `npm run test` (589/589 en 43 archivos), `npm run build` correcto y `mvnw test` (7/7) correcto.
- Revisión visual en navegador no realizada: el control de escritorio se detuvo al no poder determinar la URL actual de forma segura.
