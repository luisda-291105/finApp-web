## Propósito

Reemplazar los campos "quemados" (hardcodeados) que muestran "No registrado" en el avatar del sidebar y en los modales de cuenta y perfil, y volverlos dinámicos a partir del usuario activo y las fuentes registradas, de modo que el correo y el teléfono se muestren reales cuando existan, aunque sus fuentes aún no estén verificadas.

## Requisitos

### RF-01 — Avatar del sidebar (`SidebarNavContenido`)
El correo mostrado bajo el nombre en el bloque de avatar (pie del sidebar en escritorio y dentro del menú) debe obtenerse del usuario activo (`usuario.correo`) en lugar del literal `"No registrado"` hardcodeado. Si el usuario no tiene correo, se conserva el valor de respaldo "No registrado".

### RF-02 — Modal de cuenta (`DashboardUserModal`)
El campo "Correo" del header del modal de cuenta debe mostrar `usuario.correo` de forma dinámica en lugar del literal `"No registrado"` hardcodeado. Debe seguir siendo de solo lectura.

### RF-03 — Modal de perfil (`ModalPerfilUsuario`)
En la vista de solo lectura del modal de perfil, el renglón "Correo y teléfono: No registrados" y los campos de correo/teléfono hardcodeados a `"No registrado"` deben mostrar los valores reales del usuario activo o de sus fuentes registradas, aunque dichas fuentes no estén verificadas. Si no hay dato, se muestra "No registrado".

### RF-04 — Origen de los datos
El correo y el teléfono se resuelven a partir del contexto de usuario activo (`UsuarioActivoContext`) y, cuando correspondan, de las fuentes registradas del usuario (`obtenerFuentesPorUsuario`), sin exigir verificación previa de la fuente para mostrar el dato.

### RF-05 — Compatibilidad
No se rompe el comportamiento de apertura/cierre de modales (spec 010), el retorno de foco (spec 011) ni el uso del avatar como trigger (RF-07/RF-13 del layout).

## Validaciones (criterios de aceptación)

1. **Avatar sidebar:** al renderizar con un usuario activo que tiene correo, el bloque de avatar muestra el correo real; con usuario sin correo, muestra "No registrado".
2. **Modal de cuenta:** al abrir el modal de cuenta, el campo "Correo" muestra `usuario.correo` cuando existe y "No registrado" cuando no.
3. **Modal de perfil (solo lectura):** al abrir el modal de perfil con fuentes registradas (no verificadas) que incluyan correo y/o teléfono, esos valores se muestran en lugar de "No registrado"; si no hay dato, se muestra "No registrado".
4. **Sin verificación requerida:** los datos se muestran aunque las fuentes asociadas no estén verificadas.
5. **Regresión:** las pruebas existentes de cierre de modales, retorno de foco y navegación del sidebar siguen pasando (`npm test` y `npm run build` verdes).
