# Plan — Spec 029: Mostrar registros y detalles

## Secuencia de implementación

1. Verificar los contratos actuales de usuario, grupos, Gmail y tarjetas; mantener el estado vacío de movimientos según el alcance definido.
2. Crear el contenedor modal común reutilizando los hooks existentes de foco/cierre; migrar o adaptar en forma incremental las vistas de detalle para no duplicar el comportamiento accesible.
3. En grupos, hacer clickeable la tarjeta completa, presentar las fuentes vinculadas y agregar las acciones de edición/eliminación con confirmación.
4. En Correos, convertir cada fuente `CORREO` en una tarjeta; seleccionar una filtra mensajes por destinatario y conserva los filtros de categoría.
5. En Tarjetas, validar los datos antes de guardar y conectar la tarjeta persistida con la vista previa y el estado vacío de movimientos.
6. En Perfil, revisar el contrato `PUT`, limitar los campos editables y verificar que los campos no enviados se conserven.
7. Replantear «Fuentes registradas» en móvil para mantener datos y acciones sin overflow.
8. Añadir pruebas focalizadas por página/componente, pruebas de servicios/backend, suite completa, build y revisión visual desktop/móvil.

## Criterios técnicos

- Mantener rutas HTTP en `src/config/api.config.js` y usar servicios, no `fetch` directo en componentes.
- Reutilizar la relación grupo-fuente de la spec 027 y limitar las operaciones al usuario activo.
- Reutilizar `ModalTarjeta` o su presentación visual existente cuando el contrato de datos sea compatible; mapear datos sin copiar fixtures demo a registros reales.
- El contenedor común del modal resuelve cromo, accesibilidad y foco; las vistas de dominio conservan el contenido propio de cada entidad.
- Aplicar tokens existentes, fallback de superficie y límites Fluid Glass.

## Validación

- Pruebas de teclado/foco/cierre del modal común.
- Pruebas de filtrado Gmail por fuente y categoría, y de estados de carga/error/vacío.
- Pruebas de validación de tarjeta, apertura del detalle y ocultamiento de campos sensibles.
- Pruebas del payload PUT del perfil y de conservación de campos no editables.
- Pruebas responsive de las fuentes con acciones visibles en anchura móvil.
- `npm test`, `npm run build` y pruebas de backend relacionadas.
