# MEMORY.md — FinApp

- Spec 004, T8 completa (cierre, 2026-10-12): spec 004 FINALIZADA (T1–T8).
  Resumen final: panel de tarjetas = conjunto fluido con **5 tarjetas** del
  fixture `src/data/tarjetasDemo.js` (datos fijos **octubre 2026**,
  `PERIODO_DEMO = { anio: 2026, mes: 10 }`); componentes nuevos
  `LogMovimientos`, `AcordeonTarjetas` (móvil, `sm:hidden`, acordeón exclusivo,
  encabezado expandido = toggle, el modal solo abre tocando la tarjeta
  expandida), `GridTarjetas` (`hidden sm:grid sm:grid-cols-3 lg:grid-cols-5`)
  y `ModalTarjeta` (dialog accesible, focus trap, Esc/backdrop, **flip 3D solo
  dentro del modal**; en el conjunto se usa la prop `flipDeshabilitado`).
  Decisiones clave: **doble render por breakpoints solo CSS, cero matchMedia
  en JS**; **retorno de foco al activador gestionado por el propio modal en el
  cleanup del efecto** (guarda `document.activeElement` al abrir); estado
  único `tarjetaActiva` en `PanelTarjetas`. En T8 se detectó una modificación
  suelta sin commitear en `GridTarjetas.jsx` (clases `sm:grid-cols-1
  md:grid-cols-2 lg:grid-cols-3`, sin autor ni registro) que rompía 2 tests:
  revertida con `git checkout HEAD --` para restaurar el estado del plan
  aprobado (no se commiteó nada de código). Docs: plan.md alineado
  (`onSeleccionarTarjeta`, encabezado toggle) en commit propio; notas "superada
  por spec 004 (solo presentación del panel; RF de datos/a11y vigentes)"
  añadidas a specs 002 y 003; títulos marcados ✅ en tasks.md. Validaciones
  finales reales: `npm test` **97/97 en 12 archivos** y `npm run build` en
  verde. **Pendiente honesto: validación visual Fluid Glass en navegador NO
  realizada** (sin navegador disponible en el entorno).


- Spec 004, T7 completa: refactor total de `PanelTarjetas.jsx`. Eliminadas las
  tres secciones antiguas ("Mi Tarjeta Virtual" destacada, "Ejemplos de diseño"
  y "Tus otras tarjetas") y las constantes internas `tarjetasDemo`/
  `ejemplosDiseno` hardcodeadas. Ahora usa `TARJETAS_DEMO` (5 tarjetas del
  fixture oct 2026) como fuente única y compone: `AcordeonTarjetas`
  (`sm:hidden`), `GridTarjetas` (`hidden sm:grid sm:grid-cols-3
  lg:grid-cols-5`) — doble render por breakpoints solo CSS, cero matchMedia en
  JS — y `ModalTarjeta`. Estado local único `tarjetaActiva` (`useState(null)`);
  ambos layouts reciben `onSeleccionarTarjeta={setTarjetaActiva}`; cierre con
  `setTarjetaActiva(null)` y el retorno del foco al activador lo gestiona el
  propio modal en su cleanup (guarda `document.activeElement` al abrir). Se
  conserva la nota "Datos de demostración". Sin hex nuevos, solo tokens, header
  actualizado. TDD: 12 pruebas nuevas reescritas en `PanelTarjetas.test.jsx`
  (integración: clases de breakpoint, 5 tarjetas por presentación, ausencia de
  secciones viejas, abrir modal desde grid/acordeón con log del fixture, cierre
  por botón/Esc/backdrop con retorno de foco, estado vacío para tarjeta-azul-2,
  modal cerrado al inicio y solo uno abierto) y la prueba de ruta en
  `App.test.jsx` reescrita (ya no usa `section:nth-of-type(3)`; verifica
  acordeón+grid por clases, los 5 titulares del fixture y la nota, y que las
  secciones antiguas no existen). Los 11 fallos iniciales TDD fueron sobre la
  versión vieja. Aprendizaje: `MiTarjetaVirtual` ya expone `role="region"`, así
  que para contar paneles del acordeón hay que consultar `[id^='panel-tarjeta-']`
  en lugar de `getAllByRole("region")`. Validaciones: focalizadas (21 en 2
  archivos), `npm test` (97, 12 archivos) y `npm run build` en verde. Validación
  visual Fluid Glass no realizada (sin navegador disponible).

- Spec 004, T6 completa: nuevo `src/components/ModalTarjeta.jsx` (modal de
  detalle de tarjeta). Props `tarjeta` (objeto del fixture o `null` = cerrado,
  no renderiza) y `onCerrar()`. `role="dialog"` + `aria-modal="true"` +
  `aria-labelledby` al `<h2>` "Tarjeta de {titular}"; dentro: `MiTarjetaVirtual`
  con flip habilitado (sin `flipDeshabilitado`), `<dl>` con titular/número
  enmascarado/expiración/entidad y `LogMovimientos` alimentado desde
  `MOVIMIENTOS_DEMO[tarjeta.id]`. Focus trap manual con Tab/Shift+Tab (selector
  de focoables propio), foco inicial en el botón "Cerrar detalle de tarjeta",
  Esc y clic en backdrop cierran (panel con stopPropagation), scroll del body
  bloqueado mientras está abierto. **Retorno del foco: lo gestiona el propio
  modal** (guarda `document.activeElement` al abrir y lo restaura en el cleanup
  del efecto); T7 NO necesita refs/callbacks extra para el foco. Animación
  fade/escala con `AnimatePresence` interno, duración 0 con `useReducedMotion`.
  Backdrop `bg-bg-dark/60` + `backdrop-blur-sm`, panel `glass-card`, z-50; sin
  hex nuevos. TDD: 11 pruebas fallaron antes (import inexistente).
  Aprendizaje: el mock de `framer-motion` (`motion.div` trivial) debe usar
  `React.forwardRef` cuando el componente bajo prueba pasa `ref` (p. ej. para el
  focus trap); sin forwardRef el ref llega `null` y el foco/trap fallan en jsdom.
  Validaciones: focalizadas (11), `npm test` (92, 12 archivos) y
  `npm run build` en verde. Validación visual no realizada (sin navegador).

- Spec 004, T4 completa: nuevo `src/components/AcordeonTarjetas.jsx` (layout
  móvil `< sm`). Contenedor `role="list"` con clase `sm:hidden`; acordeón
  exclusivo con estado `indiceExpandido` (inicial 0, primera expandida);
  encabezados `<button aria-expanded aria-controls>` con titular + "•••• XXXX"
  y chevron; solo se monta el panel expandido (`role="region"` +
  `aria-labelledby`, sin hijos interactivos ocultos). Gesto: tocar encabezado
  colapsado expande (y colapsa la anterior), tocar encabezado expandido lo
  colapsa (toggle, sin abrir modal — decisión distinta al borrador del plan que
  abría modal también desde el encabezado), y toque/Enter/Espacio sobre la
  tarjeta ya expandida (wrapper `role="button"` con
  `aria-label="Ver detalle de la tarjeta de {titular}"`) invoca
  `onSeleccionarTarjeta(tarjeta)`. Prop nombrada `onSeleccionarTarjeta` (no
  `onAbrirTarjeta` del plan; orquestador de T4 lo fijó así — T7 deberá usar
  ese nombre). Panel con `MiTarjetaVirtual` `flipDeshabilitado`; animación de
  altura/opacidad con `motion.div` (duration 0 con `useReducedMotion`). TDD:
  test primero falló (componente inexistente); 8 pruebas nuevas en
  `AcordeonTarjetas.test.jsx` (detalle: las queries por titular del encabezado
  deben incluir "••••" para no colisionar con el aria-label del wrapper).
  Validaciones: focalizadas (8), `npm test` (75, 10 archivos) y
  `npm run build` en verde. Validación visual no realizada (sin navegador).

- Spec 004, correcciones ronda 2 (T3): revert real de `PanelTarjetas.jsx` y
  `tarjetasDemo.js` a HEAD (`git checkout HEAD --`); la ronda anterior no se
  había aplicado (PanelTarjetas tenía slice(0,3) de TARJETAS_DEMO y el fixture
  2 tarjetas duplicadas incoherentes `tarjeta-menta-2/3`). Fixture vuelve a 5
  tarjetas (`grep -c colorTema` = 5). Se aclaró el staging: `LogMovimientos.jsx`
  y su test NO estaban en el commit a3573b4 (figuraban untracked); commit
  aparte c085bd1. Validaciones: focalizadas (16), `npm test` (67, 9 archivos),
  `npm run build` en verde. `MiTarjetaVirtual.jsx` sin cambios.

- Spec 004, T3 completa: `MiTarjetaVirtual` acepta `flipDeshabilitado` (boolean,
  default `false`). En modo solo-vista la cara no expone `role="button"`,
  `tabIndex`, `aria-pressed` ni handlers (props interactivas esparcidas con
  spread condicional sobre el `motion.div`), no renderiza la pill "Toca para
  ver CVV", quita `whileTap`/`cursor-pointer` y `volteada` nunca commuta
  (reverso inaccesible); frente intacto y `useReducedMotion` respetado igual
  que antes. TDD: 6 pruebas nuevas en `MiTarjetaVirtual.test.jsx` (fallaron
  antes; las 10+ existentes de spec 003 sin modificar). Validaciones:
  focalizadas (16), `npm test` (67, 9 archivos) y `npm run build` en verde.
  Pendiente uso desde AcordeonTarjetas/GridTarjetas (T4/T5).

- Spec 004, T2 completa: nuevo `src/components/LogMovimientos.jsx` (log de
  movimientos de una tarjeta; ordena descendente por fecha ISO lexicográfica,
  helper exportado `formatearFechaCorta(fechaISO)` con mapa de meses en español
  sin Intl, montos con signo explícito y `tabular-nums`, tokens
  `text-cat-income`/`text-cat-expense`, estado vacío "Sin movimientos este mes"
  para `[]`/undefined). TDD con `LogMovimientos.test.jsx` (6 pruebas); el
  proyecto no tiene jest-dom configurado: se usan matchers Chai
  (`toBeDefined`, `toBeNull`, `classList.contains`). Validaciones: focalizadas
  (6), `npm test` (61, 9 archivos) y `npm run build` en verde.

- Spec 004 (tarjetas acordeón y movimientos): spec aprobada. T1 completa: añadido
  `src/data/tarjetasDemo.js` con `TARJETAS_DEMO` (5 tarjetas: azul MARÍA GARCÍA,
  menta ANA MARTÍNEZ, morado CARLOS RUIZ + 2 nuevas ficticias), `MOVIMIENTOS_DEMO`
  (fechas fijas octubre 2026 en ISO "2026-10-DD", signos mezclados, tarjeta-azul-2 sin movimientos para
  estado vacío) y `PERIODO_DEMO = { anio: 2026, mes: 10 }`. Sin cambios en
  componentes. Pendientes tareas 2–8 (LogMovimientos, flipDeshabilitado, acordeón,
  grid, modal, integración, cierre).

Memoria breve del estado del proyecto, decisiones y aprendizajes entre sesiones.

## Estado actual
- App React de finanzas personales con landing, login/modal y dashboard de demostración.
- Stack activo: React 18, Vite 5, Tailwind CSS v4 y React Router 6.
- Rutas: `/inicio`, `/login` y `/dashboard` con secciones de inicio, transacciones,
  tarjetas y configuración. `/` redirige según `TRIAL_ACTIVO`.
- `TRIAL_ACTIVO = true`: el dashboard está abierto como demo, no hay autenticación real.
- El dashboard muestra importes de ejemplo; no hay persistencia financiera en `src/`.
- `AuthModal` usa endpoints centralizados, pero el backend no está listo; el fallback
  actual muestra mensajes demo y no confirma persistencia real.
- Pruebas: Vitest + Testing Library en jsdom; 7 archivos de test cubren rutas,
  componentes (incluido `PanelTarjetas`), `useReveal` y reglas de `index.css`.
- RF6 (tarea 1 de spec 001): `useReveal` inicializa por defecto con
  `threshold: 0.15` y `rootMargin: "0px 0px -8% 0px"`; Hero, StatsBar,
  Features, HowItWorks y CtaSection ya no sobreescriben opciones.
- RF6 (tarea 2 de spec 001): `useReveal.test.js` verifica disconnect tras la
  primera intersección, disconnect en el cleanup al desmontar y ejecución sin
  error cuando nunca intersecta. El hook ya implementaba ese ciclo de vida, así
  que las pruebas nuevas pasaron al añadirse (no hubo cambio en `useReveal.js`);
  quedan como cobertura. `npm test` (13) y `npm run build` en verde.
- RF1 (tarea 3 de spec 001): el fallback de `.glass-hero` usa
  `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`,
  así el fondo semisólido solo aplica cuando ningún prefijo tiene soporte y el
  caso "solo uno soportado" conserva el vidrio. Nuevo test
  `src/styles/index.css.test.js` (lectura del CSS) lo verifica; `npm test` (15)
  y `npm run build` en verde.
- RF2 (tarea 4 de spec 001): `index.css` incluye
  `@media (prefers-reduced-transparency: reduce)` con `.glass-hero` usando fondo
  `rgba(15, 17, 23, 0.92)` y `backdrop-filter`/`-webkit-backdrop-filter: none`.
  Dos pruebas nuevas en `index.css.test.js` lo verifican; `npm test` (17) y
  `npm run build` en verde.
- RF3 (tarea 5 de spec 001): el hover de `.glass-card` vive únicamente dentro de
  `@media (hover: hover)`; no queda `.glass-card:hover` suelto. Dos pruebas en
  `index.css.test.js` lo verifican (prueba primero, falló antes del cambio);
  `npm test` (19) y `npm run build` en verde. Validación visual no realizada.
- RF4 (tarea 6 de spec 001): `index.css` incluye
  `@media (prefers-reduced-motion: reduce)` que fija `.reveal`, `.reveal-left` y
  `.reveal-stagger > *` con `opacity: 1; transform: none; transition: none;`.
  Dos pruebas nuevas en `index.css.test.js` (primero fallaron); `npm test` (21)
  y `npm run build` en verde. Validación visual no realizada.
- RF5 (tarea 7 de spec 001): `index.css` incluye
  `@media (max-width: 640px)` con `.glass-hero` usando
  `blur(14px) saturate(180%)` (solo cambia el blur a 12–16px, `saturate()`
  intacto). Dos pruebas nuevas en `index.css.test.js` (primero fallaron);
  `npm test` (23) y `npm run build` en verde. Validación visual no realizada.
- RF7 (tarea 8 de spec 001): las cinco reglas `nth-child` del stagger se
  sustituyeron por una única regla
  `.reveal-stagger.revealed > *` con
  `transition-delay: calc(var(--i, 0) * 90ms)`. Dos pruebas nuevas en
  `index.css.test.js` (primero fallaron). `npm test` (25) y
  `npm run build` en verde. Nota: ningún componente usa hoy la clase
  `.reveal-stagger` (los componentes animan con Tailwind en línea), así que no
  hubo hijo al que asignar `--i`; cuando un componente lo use, cada hijo debe
  llevar `style={{ "--i": índice }}`. Validación visual no realizada.
- RF8 y RF9 (tarea 9 de spec 001): las reglas de ocultamiento de `.reveal`,
  `.reveal-left` y `.reveal-stagger > *` ahora viven bajo `.js` (clase
  añadida por script inline en `index.html` vía
  `document.documentElement.classList.add("js")`), así sin JS el contenido
  es visible. El bloque de `prefers-reduced-motion` usa `html.js ...` para
  ganar especificidad al ocultamiento. Se añadió `:focus-visible` con anillo
  `outline: 3px` usando tokens (`var(--color-mint-accent)` al 50% sobre
  `.glass-hero`/oscuro y `var(--color-emerald-primary)` al 40% sobre
  `.glass-card`/crema, vía `color-mix`). Cinco pruebas nuevas en
  `index.css.test.js` (primero fallaron). `npm test` (30) y `npm run build`
  en verde. Validación visual no realizada.
- RF10 (tarea 10 de spec 001): nuevo describe "RF10 — bloques presentes en
  index.css" en `src/styles/index.css.test.js` que verifica la presencia de
  `@supports`, las media queries relevantes (`prefers-reduced-transparency`,
  `prefers-reduced-motion`, `hover: hover`, `max-width: 640px`),
  `calc(var(--i, 0) * 90ms)` y `:focus-visible`. El resto de bloques ya
  quedaba cubierto por los describes RF1..RF9. Tras esta tarea la revisión
  falló: `App.test.jsx > redirige la raíz al dashboard durante el trial`
  lanzaba `ReferenceError: IntersectionObserver is not defined` en jsdom y,
  además, la raíz redirigía a `/inicio` en lugar de `/dashboard` durante el
  trial, contradiciendo la prueba. No se declaró aprobada esa validación.
- Corrección post-review: `useReveal` comprueba
  `typeof IntersectionObserver === "undefined"` y marca `visible = true` sin
  lanzar error (caso jsdom); prueba nueva en `useReveal.test.js` (primero
  falló). `App.jsx` ahora redirige `/` a `/dashboard` cuando
  `TRIAL_ACTIVO = true` (a `/login` en caso contrario). `npm test` (33) y
  `npm run build` en verde. Validación visual no realizada. RF7 no se tocó;
  su alcance quedó solo CSS para `--i`.
- Spec 002 (bloque tarjetas, tareas 1-7): nuevo componente puro
  `src/components/PanelTarjetas.jsx` con `tarjetasDemo` interno (3 tarjetas
  demo: nombre, "•••• XXXX" y saldo ficticio en formato `$X,XXX.XX`) y la
  nota exacta "Datos de demostración" bajo el grid; `DashboardSection` lo
  renderiza en `/dashboard/tarjetas` y el placeholder ya no aparece
  (RF1-RF5). Cobertura RF6: `PanelTarjetas.test.jsx` (3 pruebas) + 5 pruebas
  de ruta en `App.test.jsx` (incluida la ausencia del placeholder).
  Validaciones: `npm test` (41 tests, 7 archivos) y `npm run build` en verde;
  revisión visual con Firefox headless pass en escritorio (3 columnas) y
  móvil < 640px (1 columna); pendiente hover interactivo y
  `prefers-reduced-transparency` (sin CSS nuevo que evaluar). Los commits se
  limitaron al código y a esta memoria; la carpeta
  `specs/002-bloque-tarjetas/` sigue sin commitear.

## Decisiones (y por qué)
- Endpoints centralizados en `src/config/api.config.js`: permite configurar la base URL
  y evita distribuir rutas del backend por la interfaz.
- `TRIAL_ACTIVO` en `src/config/app.config.js`: habilita revisar el dashboard sin login
  mientras se desarrolla la integración de autenticación.
- Tokens de color y utilidades compartidas en `src/styles/index.css`: mantienen una
  fuente visual común para Fluid Glass.
- Pruebas junto al código y `MemoryRouter` para rutas: coincide con la estructura actual
  y permite comprobar la navegación sin servidor.
- Especificaciones y cambios deben respetar el alcance aprobado; consultar
  `doc/constitution.md`, `AGENTS.md` y `.agents/rules/rules.md`.

## Aprendizajes y errores a evitar
- No tratar FinApp como una app estática ni usar `node --test`: el proyecto usa React,
  Vite y `npm test` (Vitest).
- No presentar cifras, login ni mensajes de éxito del fallback como datos guardados u
  operaciones reales; verificar backend y persistencia antes de afirmarlo.
- No añadir colores hexadecimales a JSX/JS: existen literales heredados, pero los nuevos
  estilos deben usar tokens de `src/styles/index.css`.
- No añadir librerías de animación; las animaciones siguen CSS y APIs nativas.
- Los límites Fluid Glass de capas y blobs son reglas manuales; no hay pruebas
  automáticas dedicadas que deban darse por ejecutadas.

## Próximos pasos
- Conectar autenticación y datos financieros a un backend operativo; definir antes
  contratos, manejo de errores, seguridad y persistencia.
- Sustituir progresivamente cifras de demostración por datos reales cuando exista API.
- Añadir cobertura para flujos de autenticación y casos de error al implementar el
  backend; considerar pruebas verificables para límites de diseño.

---
### Spec 003 — Mi Tarjeta Virtual (completada)
- Componente `src/components/MiTarjetaVirtual.jsx` con flip 3D (600ms, easing marca),
  hover elevación solo escritorio (`whileHover` + `@media (hover: hover)` via Framer
  Motion), click/teclado (Enter/Espacio) toggle frente/reverso con CVV.
- Props: `titular`, `numero`, `expiracion`, `cvv`, `entidad`, `colorTema` (azul/menta/morado),
  `onFlip` callback tras animación. Accesibilidad: `role=button`, `tabIndex=0`,
  `aria-label` dinámico, `aria-pressed`, foco visible (hereda `.glass-card:focus-visible`),
  `prefers-reduced-motion` via `useReducedMotion()`.
- Colores solo tokens (`mint-accent`, `emerald-primary`, `cat-income`, `cat-other`,
  `slate-text`, `bg-dark`, `bg-cream`, `border-line`, `radius-glass`, `font-display`,
  `font-body`, `font-mono`, `tabular-nums`); gradientes via clases Tailwind
  mapeadas a `@theme` (`from-cat-income`, `from-emerald-primary`, `from-cat-other`).
- Integrado en `PanelTarjetas` como tarjeta principal destacada (`max-w-xs`) antes del
  grid de 3 tarjetas demo (spec 002), con `reveal` y `reveal-stagger` respectivamente.
- Tests: `MiTarjetaVirtual.test.jsx` (7 pruebas: render, flip click/teclado, callback,
  colorTema, a11y, reduced-motion), `PanelTarjetas.test.jsx` (5 pruebas), `App.test.jsx`
  (9 pruebas incl. ruta `/dashboard/tarjetas` con MiTarjetaVirtual + grid + nota).
- `npm test` (50 tests, 8 archivos) y `npm run build` en verde.
- Revisión visual: pendiente (sin navegador disponible).
- Decisión: Framer Motion para interacciones (hover/tap/flip) permitido por skills;
  no para scroll-reveal. `glass-card` como base del contenedor flip; gradiente interno
  para realismo de tarjeta bancaria sin añadir superficies translúcidas (cumple límites
  Fluid Glass).
- Corrección de 5 hallazgos en MiTarjetaVirtual (2026-10-12, spec 003):
  1. Altura: `aspect-[8/5]` en el motion.div interactivo (con `min-h-[200px]` como
     respaldo) para evitar el colapso a altura 0 con caras `absolute inset-0`.
  2. Indicador "Toca para ver CVV": clase `group` movida al motion.div interactivo;
     el overlay conserva solo `pointer-events-none`.
  3. `onFlip`: refactor a `useEffect` sobre `volteada` con setTimeout(600) y ref de
     montaje; ya no hay efectos secundarios dentro del updater (duplicación
     StrictMode). Prueba nueva verifica una sola llamada por giro en StrictMode.
  4. Centrado móvil: `mx-auto` junto a `max-w-xs` en el contenedor de la tarjeta.
  5. Temas (RF7) homologados a tokens de index.css: azul usa variantes con opacidad
     de `cat-income`, morado de `cat-other` y menta
     `from-emerald-primary via-emerald-hover to-emerald-primary/80`. Sin hex nuevos.
  Validaciones: tests focalizados (13), `npm test` (51, 8 archivos) y `npm run build`
  en verde. Validación visual no realizada (sin navegador disponible).
- Corrección ronda 2 tras revisión (2026-10-12, spec 003):
  1. `onFlip`: la guardia de ref booleano fallaba con el doble setup de StrictMode;
     ahora se guarda el valor anterior de `volteada` y solo dispara cuando
     `prev !== actual`. Pruebas nuevas: no se dispara al montar en StrictMode
     (timers avanzados) y se dispara en cada giro (true/false).
  2. Eliminadas reglas manuales redundantes `.bg-bg-dark` y `.bg-bg-dark/80` de
     `index.css`; Tailwind v4 genera ambas desde `@theme --color-bg-dark`
     (verificado en dist: `color-mix(in oklab, var(--color-bg-dark) 80%, transparent)`).
  3. Resuelta contradicción spec↔código: eliminadas `.perspective-1000` y
     `.backface-hidden` del CSS; perspectiva ahora inline en el wrapper
     (`style={{ perspective: "1000px" }}`), backfaceVisibility ya era inline.
  4. Pill "Toca para ver CVV": `focus-within:opacity-100` sustituido por
     `group-focus-visible:opacity-100` (visibilidad con teclado respecto al
     botón enfocado).
  5. Salto de línea final añadido en PanelTarjetas.jsx y su test; bloque de
     spec 003 en MEMORY.md reconciliado: gradientes reales son
     `from-cat-income via-cat-income/85 to-cat-income/70` (azul),
     `from-emerald-primary via-emerald-hover to-emerald-primary/80` (menta) y
     `from-cat-other via-cat-other/85 to-cat-other/70` (morado); nunca hubo
     `from-blue-600`/`from-purple-600` en el código final.
  Validaciones: tests focalizados (15), `npm test` (53, 8 archivos) y
  `npm run build` en verde. Validación visual no realizada (sin navegador).
- Cambio pequeño (2026-10-12, spec 003 simplificada): "tarjetas de ejemplo" en
  `PanelTarjetas`. Nueva sección "Ejemplos de diseño" (con nota "Variaciones de
  diseño de la tarjeta virtual") entre la tarjeta principal (azul, MARÍA GARCÍA)
  y "Tus otras tarjetas": grid `gap-6 sm:grid-cols-2` con dos `MiTarjetaVirtual`
  (menta con ANA MARTÍNEZ, morado con CARLOS RUIZ; datos ficticios distintos).
  Sin blobs ni superficies extra ni hex nuevos; ejemplos instancias puras del
  componente (flip funcional). TDD: 2 pruebas nuevas en `PanelTarjetas.test.jsx`
  (fallaron antes), y selectores `section:nth-of-type` ajustados de 2 a 3 en
  `PanelTarjetas.test.jsx` y `App.test.jsx` (el grid demo es ahora la 3.ª
  sección). Validaciones: focalizadas (17), `npm test` (55, 8 archivos) y
  `npm run build` en verde. Validación visual no realizada (sin navegador).
- Fix bug (2026-10-12, spec 003): `PanelTarjetas` usaba `reveal`/`reveal-stagger`
  sin `useReveal`, dejando todas las tarjetas invisibles con JS activo. Eliminadas
  esas clases de las tres `<section>` y el `style={{ "--i": index }}` del grid
  demo; secciones visibles por defecto (scroll-reveal fuera de alcance en spec
  003). Tests no referenciaban reveal; sin cambios en pruebas. Validaciones:
  focalizadas (16), `npm test` (55, 8 archivos) y `npm run build` en verde.
  Validación visual no realizada (sin navegador).
- Spec 004 T5 (2026-10-12): nuevo `GridTarjetas` (tablet/escritorio) con doble
  render por clases (`hidden sm:grid sm:grid-cols-3 lg:grid-cols-5`, gap-4).
  Cada celda: wrapper accesible `role="button"` + `tabIndex` + aria-label
  "Ver detalle de la tarjeta de {titular}" con foco visible via tokens
  (`focus-visible:ring-2 ring-emerald-primary`); dentro, `MiTarjetaVirtual`
  con `flipDeshabilitado` (frente completo, sin flip/pill). Primer gesto
  (clic/Enter/Espacio) dispara `onSeleccionarTarjeta(tarjeta)` (modal en T6/T7).
  Aprendizaje: el proyecto no carga jest-dom; usar `toBeTruthy`/`className`
  en lugar de `toBeInTheDocument`/`toHaveClass`. TDD: 6 pruebas fallaron antes
  (import inexistente y luego matchers), 6/6 en verde tras implementar.
  Validaciones: focalizadas (6), `npm test` (81, 11 archivos) y `npm run build`
  en verde. Validación visual no realizada (sin navegador).
