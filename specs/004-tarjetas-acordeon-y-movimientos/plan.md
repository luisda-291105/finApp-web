# Plan — Spec 004: Grid fluido de tarjetas con modal, flip y movimientos

Base: `specs/004-tarjetas-acordeon-y-movimientos/spec.md` (aprobada).
Stack: React 18 + Vite 5 + Tailwind CSS v4 + React Router 6 + Framer Motion 14
(instalado; permitido para modal, flip y acordeón). Sin dependencias nuevas.

## Arquitectura general

Se mantiene una **única ruta** `/dashboard/tarjetas` que renderiza
`PanelTarjetas` (refactor completo). El panel deja de tener las secciones "Mi
Tarjeta Virtual" destacada, "Ejemplos de diseño" y "Tus otras tarjetas", y pasa
a ser un **conjunto fluido de 5 tarjetas** con dos presentaciones controladas
por CSS (no por JS de viewport):

- **Acordeón móvil** (`<640px`): bloque visible solo en `block sm:hidden`.
- **Grid** (`sm+`): bloque oculto en móvil (`hidden sm:grid`), con
  `sm:grid-cols-3 lg:grid-cols-5`.

**Decisión clave — doble render, no `matchMedia` en JS:** el acordeón y el grid
se implementan como dos contenedores hermanos en el DOM conmutados por clases
Tailwind de breakpoint. Justificación:

1. jsdom no implementa `matchMedia` de forma fiable; conmutar por clases hace
   las pruebas deterministas (se verifica la clase del contenedor y la
   interacción de cada bloque por separado con RTL, sin mocks frágiles de
   viewport).
2. La spec exige comportamiento distinto por bloque (acordeón exclusivo + doble
   toque vs. un clic en grid); componentes separados por bloque son más simples
   que un componente con rama condicional según `innerWidth`.
3. La duplicación de markup es inocua: son 5 tarjetas estáticas de demo.

El estado del **modal** (`tarjetaActiva: tarjetaDemo | null`) vive en
`PanelTarjetas`, de modo que tanto el acordeón como el grid abren el mismo
`ModalTarjeta`. Solo un modal a la vez, garantizado por tener un único estado.

## Componentes

### 1. `src/components/PanelTarjetas.jsx` (refactor)

- Fuente de datos: nuevo módulo `src/data/tarjetasDemo.js` (ver abajo) con las
  5 tarjetas y sus movimientos de octubre 2026.
- Renderiza:
  - `<AcordeonTarjetas tarjetas={tarjetas} onAbrirTarjeta={abrirModal} />`
    (solo móvil por clases).
  - `<GridTarjetas tarjetas={tarjetas} onAbrirTarjeta={abrirModal} />` (sm+).
  - `<ModalTarjeta tarjeta={tarjetaActiva} onCerrar={cerrarModal} />`.
  - La nota "Datos de demostración" (se conserva).
- Expone el elemento activador al cerrar el modal para devolver el foco
  (ref guardada al abrir).

### 2. `src/components/AcordeonTarjetas.jsx` (nuevo)

- Contenedor `sm:hidden` (visible solo en móvil).
- Estado propio `indiceExpandido` (inicial `0`, primera expandida; exclusivo).
- Cada ítem: `<button>` de encabezado con `aria-expanded`,
  `aria-controls="panel-tarjeta-N"`, texto con titular y últimos 4 dígitos;
  panel con `id` correspondiente y `role="region"`. Los paneles colapsados no
  interactivos: se renderizan colapsados sin el contenido interactivo (la
  tarjeta solo se monta en el panel expandido, o se monta con
  `hidden`/`inert`-equivalente: decisión concreta = solo se monta el panel
  expandido, evitando hijos tabulables ocultos, cumpliendo RF13).
- Interacción (RF5):
  - Clic/toque sobre encabezado de ítem **colapsado** → expande ese ítem
    (colapsando el anterior).
  - Clic/toque sobre **la tarjeta ya expandida** → `onAbrirTarjeta(tarjeta)`.
  - Encabezado del ítem expandido: al tocarlo de nuevo también abre el modal
    (es el "segundo toque" del gesto natural) — verificado con el criterio de
    la spec: "primer toque expande, segundo toque abre modal" sobre encabezado
    o tarjeta.
  - Teclado: Enter/Espacio sobre el encabezado togglea expansión; sobre la
    tarjeta expandida abre el modal (la tarjeta interna es clickeable vía
    wrapper `role="button"`, ya que `MiTarjetaVirtual` con flip deshabilitado
    deja su superficie libre — ver prop abajo).
- Animación de expansión: altura/opacidad con Framer Motion (`AnimatePresence` no
  necesario; `motion.div` con `initial/animate` y `useReducedMotion` para
  desactivarla, RF11). Alternativa CSS `grid-template-rows` descartada por
  consistencia con la librería ya permitida para el acordeón.

### 3. `src/components/GridTarjetas.jsx` (nuevo)

- Contenedor `hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4`.
- Cada celda: wrapper `role="button" tabIndex={0}` con `aria-label`
  (p. ej. "Ver detalle de la tarjeta de {titular}") que al primer clic/tap o
  Enter/Espacio llama a `onAbrirTarjeta(tarjeta)` (RF3, RF6).
- Dentro, `MiTarjetaVirtual` con `modo="vista"` (flip deshabilitado).

### 4. `src/components/ModalTarjeta.jsx` (nuevo)

- Estructura: backdrop fijo (`fixed inset-0`, fondo `bg-bg-dark/60` +
  `backdrop-blur` moderado) y panel centrado con la superficie `glass-card`
  (una superficie translúcida nueva; total en viewport ≤3: ver checklist de
  integración — la ruta tarjetas no tiene otras superficies visibles
  simultáneas además de las tarjetas, que son `glass-card` ya contadas;
  verificación manual, sin nueva automatización).
- Accesibilidad (RF7):
  - `role="dialog" aria-modal="true" aria-labelledby="modal-tarjeta-titulo"`.
  - **Focus trap** manual (sin dependencias): al abrir, foco al botón de
    cierre (o al contenedor con `tabIndex={-1}`); handler de `Tab`/`Shift+Tab`
    que cicla entre los elementos focusables del modal; guarda
    `document.activeElement` previo y lo restaura al cerrar.
  - `Esc` cierra (listener en `document` mientras el modal esté montado).
  - Clic en el **backdrop** cierra (`onClick` en el backdrop; el panel detiene
    propagación).
  - Botón de cierre `<button aria-label="Cerrar detalle de tarjeta">`.
- Contenido:
  - `MiTarjetaVirtual` de la tarjeta activa **con flip funcional** (sin prop
    de deshabilitado) (RF6).
  - Datos: titular, número enmascarado (•••• XXXX), expiración, entidad.
  - `LogMovimientos` con los movimientos de la tarjeta filtrados al periodo
    demo fijo (octubre 2026).
- Animación de entrada/salida: Framer Motion `AnimatePresence` con
  fade/escala, desactivada con `useReducedMotion` (duración 0) (RF11).
- Si `tarjeta` es `null`, no renderiza nada (montaje/desmontaje controlado por
  el padre; usar `AnimatePresence` en el padre para animar la salida).

### 5. `src/components/LogMovimientos.jsx` (nuevo)

- Props: `movimientos` (array filtrado del periodo), `titulo` opcional.
- Lista `<ul>` ordenada ya de más reciente a más antigua (el orden se fija en
  los datos; el componente además ordena defensivamente por fecha
  descendente) (RF8).
- Cada entrada: fecha formateada **"12 oct 2026"** con helper
  `formatearFechaCorta(fechaISO)` (mapa de meses en español, sin `Intl` para no
  depender de locale del entorno en tests), descripción, categoría (chip con
  texto) y monto con signo y `tabular-nums`; positivos en `text-cat-income`,
  negativos en `text-cat-expense` (RF10).
- Estado vacío: `<p>"Sin movimientos este mes"</p>` (RF9).

### 6. `src/data/tarjetasDemo.js` (nuevo, config/datos)

- Sigue la plantilla de header de `.agents/file-header-template.md`.
- `TARJETAS_DEMO`: array ordenado de 5 tarjetas:
  1. Azul — MARÍA GARCÍA (datos actuales de la tarjeta destacada).
  2. Menta — ANA MARTÍNEZ.
  3. Morado — CARLOS RUIZ.
  4. Nueva 1 (ficticia: titular, número enmascarable, expiración, CVV,
     entidad) con `colorTema` existente (p. ej. `menta` o `azul`; la spec
     permite reutilizar temas soportados, no exige tema nuevo).
  5. Nueva 2 análoga.
  Cada tarjeta: `{ id, titular, numero, expiracion, cvv, entidad, colorTema }`.
- `MOVIMIENTOS_DEMO`: mapa `idTarjeta → [{ fecha: "2026-10-DD",
  descripcion, categoria, monto }]` con fechas fijas de **octubre 2026**,
  mezcla de montos positivos y negativos; **al menos una tarjeta sin
  movimientos** para cubrir el estado vacío de RF9 (y al menos una con varios
  movimientos desordenados en la fuente para verificar el orden descendente).
- Exporta también `PERIODO_DEMO = { anio: 2026, mes: 10 }` como constante
  documentativa; el filtrado es declarativo (los datos ya son del periodo).

**Aclaración de formato de datos:** estos datos demo son nuevos (no existen en
`src/`); la spec aprueba su creación (RF1, RF8). No se modifica ningún formato
existente.

## Cambio en `MiTarjetaVirtual.jsx`: prop de modo vista (RF4)

- Nueva prop booleana `flipDeshabilitado` (default `false`). Se elige booleana
  sobre `modo="vista"` por simplicidad binaria (hay dos contextos exactos:
  vista y modal).
- Cuando `true`:
  - `onClick`/`onKeyDown` del motion.div interno se desactivan (no togglea
    `volteada`); **se eliminan `role="button"`, `tabIndex` y `aria-pressed`**
    de la cara interactiva, dejando el contenedor como `role="region"` pasivo,
    para que el wrapper del padre (grid/acordeón) sea el único elemento
    interactivo (evita doble botón anidado, inválido en HTML/a11y).
  - Se oculta la pill "Toca para ver CVV" (es engañosa sin flip).
  - `whileHover`/`whileTap` de elevación se mantienen (feedback visual) salvo
    en reduced-motion… decisión: se mantienen como hoy, ya que su desactivación
    la gestiona `useReducedMotion` del propio componente.
- Compatibilidad: comportamiento por defecto idéntico al actual (tests de
  spec 003 siguen pasando sin cambios; se añaden tests nuevos para la prop).
- El clic "libre" lo captura el wrapper padre (`GridTarjetas`/`AcordeonTarjetas`)
  añadiendo su `onClick` en el elemento contenedor.

## Estrategia de pruebas (Vitest + RTL + user-event)

Sin depender de viewport real: cada bloque se prueba renderizando el panel y
haciendo queries dentro del contenedor móvil (`sm:hidden`) o del grid
(`hidden sm:grid`), ambos presentes en jsdom. Las clases de breakpoint se
verifican como atributo `class` (responsivo por diseño CSS, sin e2e).

Mocks: se reutiliza el mock parcial de `framer-motion` existente en
`PanelTarjetas.test.jsx` (`useReducedMotion` controlable por test +
`motion.div` trivial) para pruebas de reduced-motion.

Archivos de prueba (junto al código):

1. `src/components/AcordeonTarjetas.test.jsx`
   - Primera expandida por defecto; `aria-expanded`/`aria-controls` correctos.
   - Exclusividad: expandir una colapsa la anterior.
   - Primer "toque" (userEvent.click) sobre encabezado colapsado expande;
     segundo clic sobre la tarjeta expandida abre el modal (callback recibido).
   - Paneles colapsados sin contenido interactivo.
   - Reduced-motion: expansión instantánea (mock `useReducedMotion` true).
2. `src/components/GridTarjetas.test.jsx`
   - Clases `sm:grid-cols-3 lg:grid-cols-5` presentes; 5 celdas.
   - Un clic abre el modal; Enter/Espacio también.
   - `MiTarjetaVirtual` interno sin `role="button"` interactivo (flip off).
3. `src/components/ModalTarjeta.test.jsx`
   - Apertura con `role="dialog"`, `aria-modal`, `aria-labelledby`.
   - Foco entra al modal; `Esc` cierra; botón de cierre cierra (nombre
     accesible); clic en backdrop cierra; clic dentro no cierra.
   - Foco devuelto al activador (via `onCerrar` + ref, probado a nivel
     integración en PanelTarjetas).
   - Flip funcional dentro del modal (clic en la tarjeta alterna frente/reverso
     — `aria-pressed` cambia o testid de reverso visible).
   - Reduced-motion: sin animación de entrada (mock).
4. `src/components/LogMovimientos.test.jsx`
   - Solo movimientos de octubre 2026; orden descendente; formato "12 oct
     2026"; signos y clases de token; estado vacío "Sin movimientos este mes".
5. `src/components/MiTarjetaVirtual.test.jsx` (ampliar)
   - `flipDeshabilitado`: clic no gira; sin `role="button"` en la cara; pill
     oculta; comportamiento por defecto intacto.
6. `src/components/PanelTarjetas.test.jsx` (reescritura)
   - 5 tarjetas en cada presentación; no hay secciones antiguas; nota "Datos
     de demostración" visible; integración apertura/cierre de modal y foco.
7. `src/App.test.jsx` (ajustar)
   - Ruta `/dashboard/tarjetas` con `MemoryRouter`: conjunto presente, sin
     textos de secciones eliminadas.

Validación final por tarea integradora: `npm test` + `npm run build`.

## Decisiones y alternativas descartadas

- **Doble render CSS vs. `matchMedia`/JS de viewport:** descartado el JS por
  testabilidad en jsdom y SSR-simplicidad. Ver "Decisión clave" arriba.
- **`<dialog>` nativo vs. div `role="dialog"`:** se usa div con
  `role="dialog"`: compatibilidad total con jsdom (`showModal` tiene soporte
  irregular en jsdom 25) y control explícito del focus trap. Cumple RF7 igual.
- **Focus trap manual vs. dependencia (`focus-trap-react`):** manual, porque
  está prohibido añadir dependencias y el alcance del trap es pequeño (modal
  con pocos focusables).
- **Orden en datos vs. orden en componente:** los datos llegan pre-ordenados
  pero `LogMovimientos` ordena defensivamente por fecha (robustez ante datos
  futuros), cubierto por test con fuente desordenada.
- **Sin scroll-reveal** (`useReveal`/`reveal`) en nada de esta spec (bug
  histórico de invisibilidad; fuera de alcance explícito).
- **Límites Fluid Glass:** el modal añade 1 superficie (`glass-card`) + blur de
  backdrop (capa de fondo, no superficie translúcida con contenido); no se
  añaden blobs. Verificación manual en navegador; quedará registrada si no hay
  navegador disponible (reglas.md permite reportarlo como no verificado).

## Relación cambios ↔ RF

| Cambio | RF |
|---|---|
| `tarjetasDemo.js` (5 tarjetas, movimientos oct 2026, una sin movimientos) | RF1, RF8, RF9, RF12 |
| Refactor `PanelTarjetas` (fusión secciones, estado modal, nota demo) | RF1, RF6, RF12 |
| `AcordeonTarjetas` (exclusivo, primera expandida, ARIA, doble toque) | RF2, RF5, RF11, RF13 |
| `GridTarjetas` (3/5 columnas, un clic, frente completo) | RF3, RF6 |
| Prop `flipDeshabilitado` en `MiTarjetaVirtual` | RF4 |
| `ModalTarjeta` (dialog, focus trap, Esc, backdrop, flip) | RF6, RF7, RF11 |
| `LogMovimientos` + formato fecha + signos tokens | RF8, RF9, RF10 |
| Pruebas nuevas/actualizadas | RF14 |

## Orden sugerido de implementación

1. Datos demo (`tarjetasDemo.js`) — base de todo.
2. `LogMovimientos` + helper de fecha (independiente).
3. Prop `flipDeshabilitado` en `MiTarjetaVirtual`.
4. `AcordeonTarjetas`.
5. `GridTarjetas`.
6. `ModalTarjeta` (integra tarjeta con flip + log).
7. Refactor de `PanelTarjetas` + ajuste de tests de ruta en `App.test.jsx`.
