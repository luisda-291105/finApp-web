# Tareas — Spec 016: Contactos, Correos y registro de fuentes

Las tareas están ordenadas por dependencias de implementación. RF-01–RF-06 remiten a
`spec.md`. Ninguna tarea implementa servicios, envío o persistencia.

## T1 — Añadir las páginas y rutas informativas

**RF cubiertos:** RF-01, RF-02  
**Depende de:** ninguna.

**Estado:** Hecha (2026-10-20).

Crear las páginas de Contactos y Correos con el patrón informativo actual del dashboard y registrar
las subrutas correspondientes en `App.jsx`. Cada vista lleva encabezado, una descripción breve del
propósito en FinApp y una indicación de demostración; no presenta listas, ejemplos ficticios ni
acciones.

**Hecho cuando:**

- `/dashboard/contactos` y `/dashboard/correos` muestran la sección correspondiente.
- Las dos páginas identifican explícitamente el contenido como demostración.
- Las descripciones son breves y no afirman datos o acciones reales.
- Las pruebas de página verifican encabezado, descripción y ausencia de listas/acciones.
- Se conservan las rutas y pruebas existentes del dashboard.

## T2 — Incorporar Contactos y Correos a la navegación compartida

**RF cubiertos:** RF-01, RF-02, RF-03  
**Depende de:** T1.

**Estado:** Hecha (2026-10-20).

Agregar ambos destinos a `SidebarNavContenido`, usado por la sidebar de escritorio y por el Drawer
móvil. Mantener `BottomNav` sin cambios de producción y ajustar únicamente expectativas antiguas de
cantidad/orden de enlaces y elementos enfocables que la ampliación necesariamente afecta.

**Hecho cuando:**

- La navegación compartida expone cinco enlaces, incluyendo Contactos y Correos.
- Desde escritorio se puede seguir cada enlace a su ruta correspondiente.
- Desde el menú móvil se puede seleccionar cada destino y se muestra la ruta correcta.
- El Drawer mantiene el avatar después de todos los enlaces.
- La barra inferior conserva exactamente Inicio, Transacciones, Tarjetas y Menú; sus pruebas
  existentes pasan sin cambios de contrato.

## T3 — Crear el modal Fuentes con estado temporal

**RF cubiertos:** RF-04, RF-05  
**Depende de:** ninguna.

**Estado:** Hecha (2026-10-20).

Crear `ModalFuentes.jsx` y su suite. El diálogo contiene campos accesibles para correo y teléfono,
un botón demostrativo sin envío y cierre usando los patrones accesibles ya existentes. Los valores
viven solo mientras el modal está montado.

**Hecho cuando:**

- El modal se identifica semánticamente como diálogo y se relaciona con su título.
- Los campos de correo y teléfono tienen etiquetas accesibles asociadas y aceptan entrada.
- El botón no envía el formulario, no invoca servicios ni produce mensajes que confirmen una
  conexión o un registro.
- Cerrar el modal desmonta el estado de campos, sin persistirlo.
- Las pruebas verifican semántica, entrada de valores y comportamiento no-op.

## T4 — Integrar el punto de acceso en Configuración y verificar reset

**RF cubiertos:** RF-04, RF-05  
**Depende de:** T3.

**Estado:** Hecha (2026-10-20).

Agregar a `PaginaDashboardConfiguracion` un acceso que abre el modal. Conservar el contenido de
Configuración vigente cuando no contradiga la spec.

**Hecho cuando:**

- El acceso está disponible en la página Configuración y abre el modal Fuentes.
- Tras escribir en ambos campos, el botón de demostración no produce confirmación ni envío.
- Al cerrar y volver a abrir el modal, ambos campos aparecen vacíos.
- La prueba de Configuración cubre apertura, interacción, cierre y reapertura.
- No hay llamadas de red, almacenamiento local/session, persistencia ni integración backend.

**Validación:** prueba focalizada de Configuración y ModalFuentes (5/5), suite completa (549/549
en 39 archivos), build correcto y revisión visual de Configuración/modal en escritorio y móvil.

## T5 — Anclar el avatar al fondo solo en escritorio

**RF cubiertos:** RF-06  
**Depende de:** T2.

**Estado:** Hecha (2026-10-20).

Separar el grupo desplazable de enlaces y el bloque del avatar en la composición de la sidebar
permanente, manteniendo al avatar en el pie con la sidebar expandida o colapsada. En el Drawer,
conservar el avatar al final de los enlaces sin anclaje inferior.

**Hecho cuando:**

- En escritorio, el avatar aparece en un bloque separado al pie tanto a 768 px como en anchos
  superiores.
- La distribución se mantiene con la sidebar expandida y colapsada.
- En el Drawer móvil, el avatar queda después de todos los enlaces y no está fijado al fondo.
- Pruebas estructurales cubren ambos estados desktop y el orden móvil sin exigir medidas de layout
  que jsdom no calcula.
- No se cambia el comportamiento del avatar dentro del menú móvil fuera de su posición tras los
  enlaces añadidos.

**Validación:** suites focalizadas de SidebarNavContenido, SidebarResponsive y DashboardDrawer
(85/85), suite completa (552/552 en 39 archivos), build correcto y comprobación visual directa de
sidebar expandida/colapsada a 768 px y 1280 px, además del Drawer móvil.

## T6 — Ejecutar regresión automatizada y validación visual

**RF cubiertos:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06  
**Depende de:** T1, T2, T3, T4 y T5.

**Estado:** Hecha (2026-10-20).

Ejecutar suites focalizadas y suite completa, construir la aplicación y efectuar la revisión manual
de responsive/Fluid Glass. Corregir solo fallos dentro del alcance aprobado.

**Hecho cuando:**

- Pasan las suites focalizadas de páginas/rutas, Configuración/modal, sidebar, Drawer y BottomNav.
- `npm test` y `npm run build` terminan correctamente.
- La inspección manual comprueba desktop 768 px/≥1024 px en sidebar expandida/colapsada y móvil con
  navegación por menú, avatar después de enlaces y BottomNav intacta.
- Se comprueba el modal en teclado, su botón no-op y el borrado de campos al cerrar/reabrir.
- Se reporta contraste, foco, fallback, borde/radio y límites Fluid Glass; cualquier revisión no
  disponible se registra como no realizada.

**Validación:** suites focalizadas 110/110 en 9 archivos; `npm test` 554/554 en 39 archivos; build
correcto. Revisión visual realizada en navegador: desktop a 768 px y 1280 px (sidebar expandida y
colapsada), móvil (Drawer, Contactos/Correos, avatar después de enlaces y BottomNav intacta),
Configuración/modal (teclado, foco visible, botón no-op, cierre y reapertura con campos vacíos).
Contraste AA revisado; se aumentó el contraste de enlaces y correo del avatar en la sidebar, y se
añadieron nombres accesibles explícitos para enlaces colapsados. Fallback semisólido, borde/radio
24 px y límites de capas (2 superficies glass en la vista modal, 0 blobs) verificados.

**Seguimiento de corrección visual (ronda 1/2):** se añadió al panel de `ModalFuentes` el highlight
superior inset existente, conservando `shadow-xl`. Prueba focalizada 4/4, suite completa 554/554,
build y `git diff --check` correctos; en navegador se verificaron escritorio (1280 px) y móvil
(390 px).
