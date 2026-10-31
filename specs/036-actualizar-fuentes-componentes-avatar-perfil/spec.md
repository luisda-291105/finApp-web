## Propósito

Reemplazar los campos "quemados" (hardcodeados) que muestran "No registrado" en el avatar del sidebar y en los modales de cuenta y perfil, y volverlos dinámicos a partir de las **fuentes registradas del usuario**, filtrando por tipo de fuente (CORREO / TELEFONO). El correo y el teléfono se muestran reales cuando existan en una fuente registrada, aunque esa fuente aún no esté verificada.

## Requisitos

### RF-01 — Avatar del sidebar (`SidebarNavContenido`)
El correo mostrado bajo el nombre en el bloque de avatar (pie del sidebar en escritorio y dentro del menú) debe obtenerse de las fuentes registradas del usuario filtrando por tipo `CORREO`, en lugar del literal `"No registrado"` hardcodeado. Si no hay una fuente de tipo CORREO, se muestra "No registrado".

### RF-02 — Modal de cuenta (`DashboardUserModal`)
El campo "Correo" del header del modal de cuenta debe mostrar el `contenido` de la fuente de tipo `CORREO` del usuario activo, en lugar del literal `"No registrado"` hardcodeado. Debe seguir siendo de solo lectura.

### RF-03 — Modal de perfil (`ModalPerfilUsuario`)
En la vista de solo lectura del modal de perfil, el renglón de correo y teléfono debe mostrar el `contenido` de las fuentes registradas filtradas por tipo `CORREO` y `TELEFONO`, respectivamente, en lugar del literal "No registrados". En modo edición, los campos de correo y teléfono también deben mostrar esos valores. Si no hay fuente de un tipo, se muestra "No registrado".

### RF-04 — Origen de los datos por tipo de fuente
El correo y el teléfono se resuelven exclusivamente a partir de las fuentes registradas del usuario (`obtenerFuentesPorUsuario`), filtrando por `tipo` igual a `"CORREO"` (correo) o `"TELEFONO"` (teléfono), sin exigir verificación previa (`estado`) de la fuente para mostrar el dato. No se lee de `usuario.correo` ni `usuario.telefono` directamente.

### RF-05 — Hook compartido (`useFuentesUsuario`)
Se crea un hook `useFuentesUsuario(idUsuario)` que carga las fuentes del usuario y devuelve `{ correo, telefono, fuentes, cargando, error }`, extrayendo `correo` de la fuente con tipo `CORREO` y `telefono` de la fuente con tipo `TELEFONO`.

### RF-06 — Compatibilidad
No se rompe el comportamiento de apertura/cierre de modales (spec 010), el retorno de foco (spec 011) ni el uso del avatar como trigger (RF-07/RF-13 del layout).

## Validaciones (criterios de aceptación)

1. **Avatar sidebar:** al renderizar con un usuario activo que tiene una fuente de tipo CORREO, el bloque de avatar muestra el `contenido` de esa fuente; sin fuente CORREO, muestra "No registrado".
2. **Modal de cuenta:** al abrir el modal de cuenta, el campo "Correo" muestra el `contenido` de la fuente CORREO del usuario cuando existe, y "No registrado" cuando no.
3. **Modal de perfil (solo lectura):** al abrir el modal de perfil con fuentes registradas (no verificadas) de tipo CORREO y/o TELEFONO, esos valores se muestran en lugar de "No registrado"; si no hay fuente de un tipo, se muestra "No registrado".
4. **Sin verificación requerida:** los datos se muestran aunque las fuentes asociadas tengan `estado` distinto de verdadero (no verificadas).
5. **Por tipo de fuente:** el correo se toma solo de fuentes con tipo `CORREO` y el teléfono solo de fuentes con tipo `TELEFONO`; otros tipos no se consideran.
6. **Regresión:** las pruebas existentes de cierre de modales, retorno de foco y navegación del sidebar siguen pasando (`npm test` y `npm run build` verdes).
