# Plan — Spec 016: Contactos, Correos y registro de fuentes

**Base:** `spec.md` (aprobación explícita del usuario en la fase SDD)  
**Estado:** listo para implementación tras aprobación del plan y las tareas

## 1. Objetivo y límites

Planificar dos vistas informativas de demostración, su navegación desde escritorio y desde el menú
móvil, el modal Fuentes en Configuración y la ubicación responsive del avatar. El modal usa estado
temporal de interfaz: sus campos no se envían ni persisten y se vacían al cerrar.

No se añaden backend, servicios, almacenamiento, dependencias ni listas o ejemplos ficticios para
Contactos y Correos. Se conserva la barra inferior móvil actual. Los nombres/formatos exactos de los
campos, las reglas de validación y el texto literal de las descripciones quedan fuera de decisión;
la implementación deberá usar etiquetas accesibles descriptivas sin añadir validaciones o flujos no
aprobados.

## 2. Arquitectura propuesta y decisiones

### 2.1 Rutas y páginas de demostración

- Añadir páginas independientes en `src/pages/` para Contactos y Correos, siguiendo la composición
  de las páginas actuales del dashboard: sección con encabezado, tarjeta informativa y texto
  estático.
- Registrar `/dashboard/contactos` y `/dashboard/correos` como subrutas de la ruta protegida de
  demostración en `src/App.jsx`.
- Mantener el contenido limitado al propósito de cada sección en FinApp y a la identificación como
  demo; no agregar registros ficticios, listas ni controles de gestión.

**Decisión:** páginas y rutas separadas, coherentes con la capa `src/pages/` y la composición actual
de `App.jsx`. Se descarta agregar las dos vistas dentro de Configuración o reutilizar la página de
Transacciones como una vista parametrizada: son secciones distintas y cada una debe tener ruta,
encabezado y propósito verificables.

### 2.2 Navegación

- Ampliar los enlaces de `SidebarNavContenido` con Contactos y Correos. El componente compartido
  hace que esos destinos estén disponibles tanto en `SidebarResponsive` (escritorio) como en
  `DashboardDrawer` (móvil).
- Usar el patrón existente `NavLink`; los destinos activos, nombres accesibles y comportamiento de
  navegación seguirán los enlaces actuales.
- No modificar `BottomNav.jsx`: conserva Inicio, Transacciones, Tarjetas y Menú como sus cuatro
  controles.
- La ruta se prueba con React Router y `MemoryRouter`. En móvil, se verifica el acceso abriendo
  «Menú» y seleccionando Contactos o Correos; en escritorio, mediante los enlaces de la sidebar.

**Decisión:** reutilizar la navegación compartida y mantener intacta la barra inferior. Se descarta
añadir botones a `BottomNav`, lo que incumpliría RF-03 y alteraría el reparto actual de controles.
La apertura/cierre del Drawer al cambiar de ruta conserva el comportamiento preexistente; no se
añade una política nueva de cierre automático.

### 2.3 Modal Fuentes y estado temporal

- Crear `src/components/domain/modales/ModalFuentes.jsx` y su suite colocada junto al componente.
- La página `PaginaDashboardConfiguracion` ofrece el punto de acceso y controla la apertura; el
  modal monta sus valores de correo y teléfono en estado local.
- Presentar ambos campos con etiquetas asociadas y semántica apropiada, sin añadir reglas de
  validación, placeholders o pasos no aprobados.
- El botón de demostración será un control sin envío ni operación; no se conectará a
  `api.config.js`, `fetch` ni otra capa de servicio.
- Cerrar desmonta el modal y descarta su estado. Al abrirlo de nuevo, ambos campos estarán vacíos.
- Para semántica modal, cierre accesible y foco se seguirá el patrón existente en
  `DashboardUserModal.jsx`/`AsistenteAyuda`: `BotonCerrar`, `role="dialog"`, `aria-modal`, título
  asociado, `useCierreConEsc`, trampa de foco y `useRetornoDeFoco`; el acceso de Configuración
  proporciona el disparador para el retorno de foco. No se incorpora el gesto de deslizar ni un
  mensaje de éxito.

**Decisión:** estado efímero contenido en el modal, con el punto de acceso en Configuración. El
desmontaje al cerrar hace verificable el borrado sin persistencia ni lógica de limpieza global.
Se descartan reutilizar `DashboardUserModal` (su propósito y acciones son diferentes) y agregar
servicios o persistencia.

### 2.4 Ubicación del avatar

- Ajustar `SidebarNavContenido` para separar estructuralmente el grupo de enlaces del bloque del
  avatar, conservando una única representación visual del avatar.
- En `SidebarResponsive`, reservar el espacio flexible/scrollable a los enlaces y ubicar el avatar
  en el pie de la sidebar; la estructura cubre sidebar expandida y colapsada desde el breakpoint
  vigente de 768 px.
- En `DashboardDrawer`, mantener los enlaces seguidos del avatar al final del contenido; no fijarlo
  al fondo. Al crecer la lista, su posición vertical podrá desplazarse.

**Decisión:** mantener el contenido compartido y distinguir el contenedor permanente de escritorio
del Drawer móvil. Se descarta cambiar la ubicación en móvil o añadir una segunda implementación del
avatar que pueda divergir visual o accesiblemente.

### 2.5 Diseño y dependencias

- Reutilizar `Card`, tokens Tailwind de `src/styles/index.css`, `BotonCerrar` y herramientas ya
  instaladas.
- No agregar dependencias, servicios, formatos de datos ni nuevos tokens salvo que el alcance
  aprobado no pueda satisfacerse con los existentes; en ese caso debe detenerse y solicitar una
  decisión antes de ampliar la spec.
- Las nuevas páginas y el modal deben mantener la semántica, nombres accesibles, foco visible y
  navegación por teclado de los patrones existentes. Los componentes nuevos siguen
  `.agents/file-header-template.md`.

## 3. Archivos previstos

### Producción

- `src/App.jsx` — subrutas del dashboard para Contactos y Correos.
- `src/pages/PaginaDashboardContactos.jsx` — sección informativa de demostración.
- `src/pages/PaginaDashboardCorreos.jsx` — sección informativa de demostración.
- `src/pages/PaginaDashboardConfiguracion.jsx` — acceso al modal y estado de apertura.
- `src/components/domain/modales/ModalFuentes.jsx` — diálogo, campos temporales, botón no-op y
  cierre que descarta valores.
- `src/components/layout/SidebarNavContenido.jsx` — enlaces nuevos y separación adaptable del avatar.
- `src/components/layout/SidebarResponsive.jsx` — distribución de escritorio que ancla el avatar al
  pie sin alterar el corte de vista.

`src/components/layout/DashboardDrawer.jsx` y `src/components/layout/BottomNav.jsx` se mantienen sin
cambios de producción: el primero recibe la navegación compartida actualizada; el segundo conserva
su estructura de cuatro controles.

### Pruebas

- `src/App.test.jsx` — cobertura aditiva de rutas, contenido y llegada desde navegación de
  escritorio/móvil con `MemoryRouter`; conservar los casos existentes que sigan vigentes.
- `src/pages/PaginaDashboardContactos.test.jsx` y
  `src/pages/PaginaDashboardCorreos.test.jsx` — propósito, identificación de demo y ausencia de
  listas/acciones.
- `src/pages/PaginaDashboardConfiguracion.test.jsx` — apertura, edición de campos, botón sin efecto,
  cierre, reapertura y valores vacíos.
- `src/components/domain/modales/ModalFuentes.test.jsx` — estructura accesible, campos, no-op y
  descarte al cierre.
- `src/components/layout/SidebarNavContenido.test.jsx` y
  `src/components/layout/SidebarResponsive.test.jsx` — cinco destinos de navegación, avatar al
  final/abajo según composición y estados expandido/colapsado.
- `src/components/layout/DashboardDrawer.test.jsx` — orden de enlaces y avatar, y actualización
  estrictamente necesaria del número de elementos enfocables del contenido.
- `src/components/layout/BottomNav.test.jsx` — ejecutar sin alterar sus expectativas de cuatro
  controles.

Las suites de contratos anteriores se preservan. Solo se ajustan las expectativas exactas de
cantidad/orden de enlaces o elementos enfocables que cambian necesariamente por RF-01/RF-03; no se
reescriben pruebas ajenas ni se reabren los contratos de las specs cerradas. No se modifica
`DashboardUserModal` ni su suite.

## 4. Trazabilidad: requisitos, cambios y pruebas

| Requisito | Cambio previsto | Evidencia automatizada |
|---|---|---|
| RF-01 Contactos | Ruta, página y enlace en navegación compartida | Page test: encabezado, descripción demo, sin lista/acciones; App test: ruta y navegación |
| RF-02 Correos | Ruta, página y enlace en navegación compartida | Page test: encabezado, descripción demo, sin lista/acciones; App test: ruta y navegación |
| RF-03 Menú móvil / BottomNav | Enlaces desde `SidebarNavContenido`; BottomNav sin cambios | Integración móvil por menú; test de orden/acceso en Drawer; BottomNav test conserva 4 controles |
| RF-04 Modal en Configuración | Acceso en página y `ModalFuentes` con campos correo/teléfono y botón demo | Config test: apertura y campos accesibles; modal test: estructura y controles |
| RF-05 No-op y borrado | Sin servicio/envío/persistencia; estado local desmontado al cerrar | Test de clic sin resultado/solicitud, cierre y reapertura con campos vacíos |
| RF-06 Avatar responsive | Enlaces y avatar separados para la sidebar desktop; orden final móvil | Pruebas estructurales de sidebar expandida/colapsada y avatar al final del Drawer; revisión visual |

## 5. Validación

### Automatizada, por orden

1. Ejecutar suites focalizadas de rutas/páginas, `ModalFuentes`, `SidebarNavContenido`,
   `SidebarResponsive`, `DashboardDrawer` y `BottomNav`.
2. Ejecutar `npm test` completa para detectar regresiones en las suites cerradas y el resto de la
   aplicación.
3. Ejecutar `npm run build`.
4. Reportar cada resultado como pass/fail/no realizado; no declarar el cambio terminado si falla una
   validación requerida.

### Manual visual y de interacción

- En **escritorio**, revisar 768 px y un ancho ≥1024 px, sidebar expandida y colapsada: avatar al pie,
  separado de enlaces, visible y accesible con teclado.
- En **móvil**, abrir el menú, navegar a Contactos y Correos, confirmar que la barra inferior conserva
  exactamente sus tres destinos más «Menú», y verificar que el avatar sigue después de todos los
  enlaces sin anclaje al fondo.
- En Configuración, abrir el modal, recorrerlo por teclado, escribir en ambos campos, pulsar el
  botón de demostración, cerrar y reabrir; confirmar ausencia de resultado real y campos vacíos.
- Revisar tamaños móvil/escritorio, contraste AA, foco visible, fallback sin blur, borde y radio de
  cualquier superficie de vidrio añadida, y que no se excedan los límites Fluid Glass de la guía.
- Si no hay navegador disponible, dejar registrada la validación visual como no realizada.

## 6. Riesgos y controles

- **Expectativas antiguas de tres enlaces:** actualizar solamente los conteos/órdenes impactados y
  agregar pruebas de los dos destinos; conservar el resto de contratos previos.
- **Drawer de móvil:** puede seguir abierto tras navegar, conforme a su comportamiento actual; este
  plan no agrega cierre automático. Verificar que los nuevos destinos sean seleccionables y la ruta
  cambie.
- **Confusión con una conexión real:** el botón no envía datos ni muestra éxito; copy y contenido se
  mantienen en modo demo.
- **Persistencia accidental:** no integrar hooks, servicios, almacenamiento del navegador ni API;
  desmontar y vaciar al cerrar.
- **Límite de decisiones del formulario:** no inventar etiquetas literales, formato de datos,
  validaciones o acciones. Si una decisión de implementación exige alguno de esos comportamientos,
  detenerse y consultar antes de ampliar el alcance.
