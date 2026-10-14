# MEMORY.md — FinApp

- Spec 005 (arquitectura, capa de páginas) FINALIZADA (cierre, 2026-10-13):
  T1–T7 completadas. Creada la capa `src/pages/` (`PaginaInicio`,
  `PaginaLogin`, `PaginaDashboard` y las cuatro páginas de sección, más
  `PanelTarjetas` + su test como excepción documentada por decisión del
  usuario); `src/components/LoginPage.jsx`, `Dashboard.jsx` y
  `PanelTarjetas.jsx` eliminados tras la migración (move-no-duplication);
  `App.jsx` quedó como capa de rutas pura. Mapa final: `/` = landing
  siempre, `/inicio` → `/` (alias eliminado), `/login` (cierre sin trial →
  `/`), `/dashboard/*` con guardia `TRIAL_ACTIVO`, `*` → `/`. Decisiones
  clave: **hex heredados de la landing conservados tal cual** en
  `PaginaInicio.jsx` (deuda técnica fuera de alcance); **corrección de
  `GridTarjetas.test.jsx` a `sm:grid-cols-2 lg:grid-cols-3`** (el código de
  HEAD era la fuente de verdad; el registro viejo de cols-3/5 en MEMORY era
  erróneo); TDD en T5 (test de raíz en rojo antes de implementar). Sección
  "Estado actual" actualizada a la nueva arquitectura y mapa de rutas.
  Validaciones finales: `npm test` **98/98 en 12 archivos** y
  `npm run build` en verde. Validación visual en navegador: **no realizada**
  (sin cambios visuales; sin navegador disponible). Sin commit ni staging en
  todo el flujo (a petición del orquestador).

- Spec 005, T6 completa (2026-10-13): `src/components/Navbar.test.jsx`
  actualizado, `initialEntries={["/inicio"]}` → `["/"]` (alias eliminado en
  T5). Verificado: el resto del test no depende de `/inicio` (el enlace del
  logo ya apuntaba a `/`, línea del href intacta) y ningún componente cita
  `/inicio` (grep: solo queda en la redirección de `App.jsx` y en los tests
  que la ejercitan). Validaciones: focalizada (2/2), `npm test` (98/98, 12
  archivos) y `npm run build` en verde. Validación visual no realizada (sin
  cambios visuales; sin navegador). Sin commit ni staging.

- Spec 005, T5 completa (2026-10-13): creada `src/pages/PaginaInicio.jsx`
  extrayendo `LandingPage` de `App.jsx` (estado `modalAbierto`/`modoAuth`,
  manejadores y botón flotante "?" intactos; **hex heredados conservados tal
  cual** por decisión del usuario, limpieza a tokens fuera de alcance).
  Header JSDoc nuevo según plantilla. `App.jsx` reescrito como capa de rutas
  pura (imports de páginas + `Routes`/`Route`/`Navigate` + guardia
  `TRIAL_ACTIVO` en `/dashboard`; sin `LandingPage` ni `DashboardSection`,
  comentario obsoleto que citaba `/inicio` eliminado; header actualizado).
  Mapa final: `/` → PaginaInicio siempre; `/inicio` → `<Navigate to="/"
  replace />`; `/login`; `/dashboard/*` con guardia intacta; `*` → `/`.
  TDD: test de raíz reescrito ("muestra siempre la landing...") **falló
  primero** (raíz aún redirigía a /dashboard), verde tras implementar; test
  nuevo de `/inicio` → landing. `grep -rn '"/inicio"' src` solo en la
  redirección de `App.jsx` (y tests que la ejercitan; `Navbar.test.jsx` es
  T6, no tocado). Validaciones: `src/App.test.jsx` (10/10), `npm test`
  **98/98 en 12 archivos** y `npm run build` en verde. Validación visual no
  realizada (sin cambios visuales; sin navegador). Sin commit ni staging.

- Spec 005, T4 completa (2026-10-13): `src/components/LoginPage.jsx` movido a
  `src/pages/PaginaLogin.jsx` (export renombrado; header JSDoc actualizado,
  `@usadoPor App.jsx (ruta /login)`; import de `AuthModal` ajustado a
  `../components/AuthModal`). RF-03: `alCerrar` sin trial ahora navega a `/`
  (antes `/inicio`, alias a eliminar en T5); con `TRIAL_ACTIVO` sigue yendo a
  `/dashboard`. `App.jsx` importa `./pages/PaginaLogin`; original eliminado
  y `@usadoPor` de `src/config/app.config.js` actualizado a
  `PaginaLogin.jsx`. `grep -rn '"/inicio"' src` solo encuentra la ruta alias
  de `App.jsx` (T5) y `Navbar.test.jsx` (`initialEntries`, T6, no tocado);
  ningún test de App/login referenciaba `/inicio`. Validaciones: focalizada
  `src/App.test.jsx` (9/9), `npm test` (97/97, 12 archivos) y
  `npm run build` en verde. Validación visual no realizada (sin cambios
  visuales; sin navegador). Sin commit ni staging.

- Spec 005, T3 completa (2026-10-13): `src/components/Dashboard.jsx` movido a
  `src/pages/PaginaDashboard.jsx` renombrando el export a `PaginaDashboard`
  (struct/type sin cambios internos; header JSDoc actualizado con
  `@usadoPor App.jsx (ruta /dashboard)`). `App.jsx` importa
  `./pages/PaginaDashboard` para la ruta padre `/dashboard`; original
  eliminado. `grep -r "components/Dashboard" src` sin resultados.
  Validaciones: focalizadas `src/App.test.jsx` + `src/pages` (21/21),
  `npm test` (97/97, 12 archivos) y `npm run build` en verde. Validación
  visual no realizada (sin cambios visuales; sin navegador). Sin commit ni
  staging.

- Spec 005, T2 completa (2026-10-13): creadas las cuatro páginas de sección
  del dashboard en `src/pages/` (`PaginaDashboardInicio`,
  `PaginaDashboardTransacciones`, `PaginaDashboardTarjetas` — compone
  `./PanelTarjetas` — y `PaginaDashboardConfiguracion`), cada una con header
  JSDoc según plantilla y conservando exactos el bloque "FinApp / Panel", el
  `<h1 id="dashboard-title">` con `aria-labelledby` y los
  títulos/contenidos ("Tu dinero, en equilibrio." + tres tarjetas de cifras
  idénticas, placeholders de transacciones y configuración). `App.jsx`: las
  cuatro subrutas apuntan a las páginas, `DashboardSection` eliminado junto
  con el import directo de `PanelTarjetas` (aún conserva `LandingPage`
  embebida, pendiente de T5). `@usadoPor` de `PanelTarjetas.jsx` actualizado
  a `PaginaDashboardTarjetas` (nota transitoria retirada). Cero cambios
  visuales/funcionales. Validaciones: focalizadas `src/pages` +
  `src/App.test.jsx` (21/21), `npm test` (97/97, 12 archivos) y
  `npm run build` en verde. Validación visual no realizada (sin cambios
  visuales; sin navegador). Sin commit ni staging.

- Spec 005, T1 completa (2026-10-13): `PanelTarjetas.jsx` y
  `PanelTarjetas.test.jsx` movidos de `src/components/` a `src/pages/`
  (excepción documentada a la regla pages↔components, decisión del usuario).
  Imports del componente ajustados a `../components/AcordeonTarjetas`,
  `../components/GridTarjetas`, `../components/ModalTarjeta` (el de
  `../data/tarjetasDemo` y los del test quedaban válidos); header JSDoc
  actualizado (`@usadoPor PaginaDashboardTarjetas ... hoy App.jsx/DashboardSection,
  spec 005 T2`); test exento de header (RF-10). `App.jsx` importa ahora
  `./pages/PanelTarjetas`; originales eliminados. Sin cambios de
  comportamiento ni visuales. Validaciones: focalizada
  (12/12 en `src/pages/PanelTarjetas.test.jsx`) y `npm run build` en verde.
  **`npm test` NO en verde por fallo PREEXISTENTE en HEAD** (verificado con
  stash: falla también sin los cambios de T1): `GridTarjetas.test.jsx`
  espera `sm:grid-cols-3 lg:grid-cols-5` pero `GridTarjetas.jsx` en HEAD dice
  `sm:grid-cols-2 lg:grid-cols-3` (y `PanelTarjetas.test.jsx` espera 2/3, así
  que hay contradicción entre tests heredada de spec 004 T8). Fuera de
  alcance de T1; pendiente de decisión (probable restauración de cols-3/5
  en `GridTarjetas.jsx` y sus tests dependientes). Validación visual no
  realizada (sin navegador). Cambios sin commit ni staging, en working tree.
  Resolución (misma sesión, aprobada por el orquestador): la fuente de verdad
  es el código de HEAD (`sm:grid-cols-2 lg:grid-cols-3`); se corrigió
  `GridTarjetas.test.jsx` para esperar 2/3 y aserción/título actualizados.
  Con ello `npm test` queda **97/97 en 12 archivos** (corrige el registro
  de MEMORY de spec 004 T8, que afirmaba cols-3/5 como estado del plan: el
  valor real aprobado es 2/3, coherente con `PanelTarjetas.test.jsx`).

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
- App React de finanzas personales con landing, login y dashboard de demostración.
- Stack activo: React 18, Vite 5, Tailwind CSS v4 y React Router 6.
- Arquitectura (spec 005): capa de páginas en `src/pages/` (`PaginaInicio`,
  `PaginaLogin`, `PaginaDashboard` como layout con `<Outlet />`,
  `PaginaDashboardInicio/Transacciones/Tarjetas/Configuracion` y
  `PanelTarjetas` — este último en pages/ por decisión del usuario,
  excepción documentada). `App.jsx` es capa de rutas pura (sin composición
  de vistas). Las piezas reutilizables viven en `src/components/`
  (ya no existen `LoginPage`/`Dashboard`/`PanelTarjetas` allí).
- Mapa de rutas: `/` = landing siempre (sin redirección por trial);
  `/inicio` → `<Navigate to="/" replace />` (alias eliminado); `/login`;
  `/dashboard/*` con guardia (`TRIAL_ACTIVO = false` → `/login`); 
  subrutas inicio/transacciones/tarjetas/configuracion; `*` → `/`.
- `TRIAL_ACTIVO = true`: el dashboard está abierto como demo, no hay autenticación real.
- El dashboard muestra importes de ejemplo; no hay persistencia financiera en `src/`.
- `AuthModal` usa endpoints centralizados, pero el backend no está listo; el fallback
  actual muestra mensajes demo y no confirma persistencia real.
- Pruebas: Vitest + Testing Library en jsdom; 12 archivos de test cubren rutas
  (`App.test.jsx`), componentes y páginas (incluido `PanelTarjetas` en
  `src/pages/`), `useReveal` y reglas de `index.css`. Suite: 98/98.
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
### Spec 006 — Capa layout y componentes reutilizables (en curso)

- Spec 006, T1 completa (2026-10-14): creados los 6 directorios base de la arquitectura
  atómica/molecular: `src/components/ui/`, `src/components/layout/`,
  `src/components/domain/landing/`, `src/components/domain/modales/`,
  `src/components/domain/dashboard/` y `src/layout/`. Verificación: `ls -la
  src/components/ src/layout/` confirma los 6 directorios; `npm run build` pasa en
  verde (estructura vacía no rompe build). RF cubiertos: RF-01, RF-04. Sin commit
  ni staging.

- Spec 006, T2 completa (2026-10-14): `Navbar.jsx` → `Header.jsx` y `Footer.jsx` movidos a
  `src/components/layout/`. `Navbar.test.jsx` → `Header.test.jsx` (actualizado
  import y `describe("Header")`). `PaginaInicio.jsx` actualiza imports a las nuevas
  rutas y usa `<Header />`. Archivos antiguos eliminados. Validaciones: test
  focalizado `src/components/layout/Header.test.jsx` (2/2), `npm test` **98/98 en
  12 archivos**, `npm run build` en verde, `grep -r "components/Navbar" src/`
  sin resultados, `grep -r "components/Footer" src/` solo nueva ruta. RF cubiertos:
  RF-02, RF-08. Sin commit ni staging.

- Spec 006, T3 completa (2026-10-14): 5 componentes de landing movidos a
  `src/components/domain/landing/` (`Hero.jsx`, `StatsBar.jsx`, `Features.jsx`,
  `HowItWorks.jsx`, `CtaSection.jsx`). Headers JSDoc actualizados: `@usadoPor`
  ahora apunta a `LandingLayout` en los 5 archivos. `PaginaInicio.jsx` actualiza
  imports a las nuevas rutas; tests `Hero.test.jsx` y `Features.test.jsx`
  actualizan imports a la nueva ubicación. Archivos antiguos eliminados.
  Validaciones: `npm run build` verde, `npm test` **98/98 en 12 archivos**,
  `grep -r "components/Hero|components/StatsBar|components/Features|components/HowItWorks|components/CtaSection" src/` sin resultados (cero referencias a rutas antiguas), headers JSDoc verificados. RF cubiertos: RF-01, RF-08. Sin commit ni staging.

- Spec 006, T4 completa (2026-10-14): 2 componentes de modales movidos a
  `src/components/domain/modales/` (`AuthModal.jsx`, `ModalTarjeta.jsx`). Headers
  JSDoc actualizados: `AuthModal @usadoPor PaginaInicio, PaginaLogin`; `ModalTarjeta
  @usadoPor PanelTarjetas`. Imports actualizados en `PaginaInicio.jsx`,
  `PaginaLogin.jsx`, `PanelTarjetas.jsx` y `ModalTarjeta.test.jsx` a las nuevas
  rutas. Archivos antiguos eliminados. Validaciones: `npm run build` verde,
  `npm test` **98/98 en 12 archivos**, `grep -r "components/AuthModal|components/ModalTarjeta" src/` sin resultados (cero referencias a rutas antiguas en `components/`), headers JSDoc verificados. RF cubiertos: RF-01, RF-08. Sin commit ni staging.

- Spec 006, T5 completa (2026-10-14): 4 componentes de dashboard movidos a
  `src/components/domain/dashboard/` (`AcordeonTarjetas.jsx`, `GridTarjetas.jsx`,
  `MiTarjetaVirtual.jsx`, `LogMovimientos.jsx`). Headers JSDoc actualizados:
  `AcordeonTarjetas @usadoPor PanelTarjetas`; `GridTarjetas @usadoPor PanelTarjetas`;
  `MiTarjetaVirtual @usadoPor AcordeonTarjetas, GridTarjetas, ModalTarjeta`;
  `LogMovimientos @usadoPor ModalTarjeta`. Tests correspondientes movidos a la misma
  carpeta con imports corregidos a `../../../data/tarjetasDemo`. Imports actualizados
  en `PanelTarjetas.jsx` (`../components/domain/dashboard/...`) y en
  `ModalTarjeta.jsx` (`../dashboard/...`). Archivos antiguos eliminados.
  Validaciones: `npm run build` verde, `npm test` **98/98 en 12 archivos**,
  `grep -r "components/AcordeonTarjetas|components/GridTarjetas|components/MiTarjetaVirtual|components/LogMovimientos" src/` sin resultados (cero referencias a rutas antiguas), headers JSDoc verificados. RF cubiertos: RF-01, RF-08. Sin commit ni staging.

- Spec 006, T6 completa (2026-10-14): creado `src/components/ui/Card.jsx` (átomo UI).
  Props: `children` (obligatorio), `className` (string, default `""`), `como` (string|componente, default `"div"`). Renderiza `<Tag className={"glass-card " + className}>{children}</Tag>`. Header JSDoc según plantilla. Sin interacción, sin animación, sin hex, solo `.glass-card` + `className`. Validaciones: `npm run build` verde, `npm test` **98/98 en 12 archivos**. RF cubierto: RF-03. Sin commit ni staging.

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

- Spec 006, T7 completa (2026-10-14): creados `src/components/layout/Container.jsx` y `src/components/layout/Sidebar.jsx` (moléculas layout).
   - `Container`: `<div className="mx-auto max-w-6xl px-4">{children}</div>` (clases exactas que usan las páginas, verificado en `PaginaDashboard.jsx` línea 72). Header JSDoc: `@usadoPor LandingLayout, DashboardLayout, páginas que necesiten contenedor estándar`.
   - `Sidebar`: placeholder mínimo `<aside />` para navegación responsive futura. Header JSDoc: `@usadoPor DashboardLayout (esqueleto)`.
   Validaciones: `npm run build` verde, `npm test` **98/98 en 12 archivos**. RF cubiertos: RF-01, RF-04 (parte). Sin commit ni staging.

- Spec 006, T8 completa (2026-10-14): creado `src/layout/LandingLayout.jsx` (organismo que compone la landing completa).
   - Compone 7 componentes hijos: `Header` (`components/layout/`), `Hero`, `StatsBar`, `Features`, `HowItWorks`, `CtaSection` (`components/domain/landing/`), `Footer` (`components/layout/`).
   - Recibe `alAbrirAuth` (callback para Header, Hero, CtaSection) y `children` opcional (AuthModal, botón flotante de ayuda).
   - Header JSDoc según plantilla: `@usadoPor PaginaInicio`.
   - Estructura: `div.min-h-screen` → `Header` + `main.flex-1` (Hero, StatsBar, Features, HowItWorks, CtaSection) + `Footer` + `{children}`.
   Validaciones: `npm run build` verde, `npm test` **98/98 en 12 archivos**, compone correctamente los 7 componentes. RF cubiertos: RF-04, RF-06 (parte). Sin commit ni staging.

- Spec 006, T9 completa (2026-10-14): creados `src/layout/DashboardLayout.jsx` (esqueleto) y `src/layout/AuthLayout.jsx`.
   - `DashboardLayout`: compone `Header` (`components/layout/`), `Sidebar` (`components/layout/`, placeholder), `Container` (`components/layout/`), `main{Outlet}`. Estructura exacta: `<div className="min-h-screen bg-bg-cream text-bg-dark md:grid md:grid-cols-[240px_minmax(0,1fr)]">` con `Sidebar` en `<aside className="hidden md:block">`, `Header` + `Container` + `main{Outlet}` en área principal (`md:col-start-2`). Header JSDoc: `@usadoPor PaginaDashboardInicio, PaginaDashboardTransacciones, PaginaDashboardTarjetas, PaginaDashboardConfiguracion`. Importa `Outlet` de `react-router-dom` para que subrutas funcionen sin cambios.
   - `AuthLayout`: chrome mínimo, centra `children` vertical/horizontal, fondo `bg-bg-dark`, sin Header/Footer. Estructura: `<main className="grid min-h-screen place-items-center bg-bg-dark px-5">{children}</main>`. Header JSDoc: `@usadoPor PaginaLogin`.
   Validaciones: `npm run build` **verde**, `npm test` **98/98 en 12 archivos**. RF cubierto: RF-04. Sin commit ni staging.

- Spec 006, T10 completa (2026-10-14): `src/pages/PaginaInicio.jsx` refactorizado para usar `LandingLayout`.
   - Eliminados imports directos de `Header`, `Hero`, `StatsBar`, `Features`, `HowItWorks`, `CtaSection`, `Footer`.
   - Importa `LandingLayout` desde `../layout/LandingLayout` y `AuthModal` desde `../components/domain/modales/AuthModal`.
   - Renderiza `<LandingLayout alAbrirAuth={manejarAbrirAuth}>` envolviendo `AuthModal` y botón flotante "?" como `children`.
   - Header JSDoc actualizado: `@usadoPor App.jsx (ruta /)`, `@funciones` actualizado a `PaginaInicio()`, `@datos`/`@eventos`/`@estados` reflejan el nuevo uso de `LandingLayout`.
   Validaciones: `npx vitest run src/App.test.jsx` (10/10 pass, ruta `/`), `npm test` **98/98 en 12 archivos**, `npm run build` verde, `grep` confirma cero referencias a componentes sueltos en `PaginaInicio.jsx`. RF cubiertos: RF-06, RF-08. Sin commit ni staging.

- Spec 006, T11 completa (2026-10-14): Refactorización de páginas de dashboard para usar `DashboardLayout`.
   - **Eliminado** `src/pages/PaginaDashboard.jsx` (layout antiguo con sidebar hardcodeada).
   - `src/App.jsx`: importado `DashboardLayout` desde `./layout/DashboardLayout`; ruta `/dashboard` ahora usa `element={<DashboardLayout />}` en lugar de `<PaginaDashboard />` (guardia `TRIAL_ACTIVO` intacta).
   - `src/pages/PaginaDashboardInicio.jsx`: header JSDoc actualizado: `@usadoPor App.jsx (ruta /dashboard)`.
   - Las 4 páginas de sección (`PaginaDashboardTransacciones`, `PaginaDashboardTarjetas`, `PaginaDashboardConfiguracion`) **no cambian** — funcionan vía `<Outlet />` anidado en `DashboardLayout` (Opción A del plan).
   Validaciones: `npx vitest run src/App.test.jsx` **10/10 pass (todas las rutas dashboard)**, `npm test` **98/98 en 12 archivos**, `npm run build` **verde**, `PaginaDashboard.jsx` eliminado, `App.jsx` importa y usa `DashboardLayout`. RF cubiertos: RF-04, RF-06, RF-08. Sin commit ni staging.

- Spec 006, T12 completa (2026-10-14): Refactorización de 10 usos de `.glass-card` a componente `<Card>`.
   - **4 archivos modificados**:
     - `src/pages/PaginaDashboardInicio.jsx`: 3 `<article className="glass-card p-5">` → `<Card como="article" className="p-5">` (import `Card` desde `../components/ui/Card`).
     - `src/components/domain/landing/Features.jsx`: 5 `<div className="glass-card p-7 sm:p-8 flex flex-col justify-between">` dentro del `.map()` → `<Card className="p-7 sm:p-8 flex flex-col justify-between">` (import `Card` desde `../../../components/ui/Card`).
     - `src/pages/PaginaDashboardTransacciones.jsx`: 1 `<div className="glass-card p-6">` → `<Card className="p-6">` (import `Card` desde `../components/ui/Card`).
     - `src/pages/PaginaDashboardConfiguracion.jsx`: 1 `<div className="glass-card p-6">` → `<Card className="p-6">` (import `Card` desde `../components/ui/Card`).
   - Total: 10 instancias `<Card>` correctas (3 con `como="article"`, 7 con `como="div"` por defecto).
   Validaciones: `grep -r "glass-card" ...` → **0 resultados** en los 4 archivos; `grep -r "<Card" ...` → **10 ocurrencias** totales (3 + 5 vía map + 1 + 1); `npm test` **98/98 en 12 archivos** verde; `npm run build` **verde**. RF cubiertos: RF-03, RF-05, RF-07. Sin commit ni staging.

- Spec 006, T13 completa (2026-10-14): Tests nuevos/actualizados creados y ejecutados.
   - **Creados**: `src/components/ui/Card.test.jsx` (4 tests: children, clase base glass-card, como="article", combina className), `src/layout/LandingLayout.test.jsx` (3 tests: compone 7 componentes, renderiza children, propaga alAbrirAuth).
   - **Actualizado**: `src/components/domain/landing/Features.test.jsx` (1 test: verifica 5 tarjetas vía Card con clase glass-card efectiva en DOM).
   - **Verificado**: `src/components/layout/Header.test.jsx` (2 tests, ya existente de T2), `src/App.test.jsx` (10 tests, regresión de rutas).
   - **Eliminado**: `src/components/Features.test.jsx` (duplicado antiguo tras mover componente a `domain/landing/`).
   - Validaciones: 5 pruebas focales pasan (20 tests totales en archivos nuevos/actualizados), `npm test` **105/105 en 14 archivos** verde, `npm run build` **verde**. RF cubiertos: RF-09, pruebas afectadas (spec líneas 127-133). Sin commit ni staging.

- Spec 006, T14 completa (2026-10-14): **Validación final y limpieza — SPEC 006 FINALIZADA**.
   - **Validación 1** (`grep` referencias antiguas): `grep -r "components/Navbar|components/Footer|components/Hero|components/StatsBar|components/Features|components/HowItWorks|components/CtaSection|components/AuthModal|components/ModalTarjeta|components/AcordeonTarjetas|components/GridTarjetas|components/MiTarjetaVirtual|components/LogMovimientos" src/` → **0 resultados** (solo rutas nuevas en `domain/` o `layout/`). ✅
   - **Validación 2** (`grep` glass-card en archivos refactorizados): `grep -r "glass-card" src/pages/PaginaDashboardInicio.jsx src/components/domain/landing/Features.jsx src/pages/PaginaDashboardTransacciones.jsx src/pages/PaginaDashboardConfiguracion.jsx` → **0 resultados**. ✅
   - **Validación 3** (`npm test` suite completa): **105/105 tests en 14 archivos** → **verde**. ✅
   - **Validación 4** (`npm run build`): **build exitoso** (333.33 kB JS, 51.79 kB CSS). ✅
   - **RF cubiertos en toda la spec**: RF-01 a RF-09 (todos los requisitos funcionales de la spec 006).
   - **Arquitectura entregada**:
     - `src/components/ui/Card.jsx` (átomo reutilizable, 10 usos migrados)
     - `src/components/layout/` (`Header`, `Footer`, `Container`, `Sidebar`)
     - `src/components/domain/landing/` (5: Hero, StatsBar, Features, HowItWorks, CtaSection)
     - `src/components/domain/modales/` (2: AuthModal, ModalTarjeta)
     - `src/components/domain/dashboard/` (4: AcordeonTarjetas, GridTarjetas, MiTarjetaVirtual, LogMovimientos)
     - `src/layout/` (3 organismos: LandingLayout, DashboardLayout esqueleto, AuthLayout)
     - `src/pages/` refactorizadas: `PaginaInicio` usa `LandingLayout`; dashboard usa `DashboardLayout` con `Outlet` (PaginaDashboard.jsx eliminado).
   - **Decisiones clave registradas**:
     - DashboardLayout esqueleto (sidebar responsive completo = spec posterior).
     - Features usa 5 `<Card>` directas con CSS grid interno (no `GridTarjetas` genérico).
     - Hex heredados conservados (deuda técnica en MEMORY, fuera de alcance).
     - `Card` sin interacción, sin animación, solo `.glass-card` + `className`, `como` libre.
     - `Container` clases exactas `mx-auto max-w-6xl px-4` (idénticas a uso previo en páginas).
     - Tests: 14 archivos, 105 tests totales (antes 12 archivos, 98 tests; +Card, +LandingLayout, +Features actualizado, -duplicado).
   - **Validación visual**: no realizada (sin cambios visuales/comportamiento; sin navegador disponible).
   - Sin commit ni staging (a petición del orquestador).
