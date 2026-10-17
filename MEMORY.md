# MEMORY.md — FinApp

- Cambio pequeño (2026-10-16, sin spec, aprobado por el usuario): alineación de
  `src/components/layout/BottomNav.test.jsx` al estado real de `BottomNav.jsx`
  editado a mano por el usuario (le retiró el enlace «Configuración», coherente con
  la spec 009). La barra inferior tiene **4** controles (3 ítems de navegación +
  botón «Menú»), no 5. **Solo se tocó el archivo de pruebas; `BottomNav.jsx` quedó
  intacto.** Ajustes (patrón de la T5 de la spec 009): título/`@uso` «5 items»→«4» y
  «click items 1-4»→«1-3»; `toHaveLength(5)`→`(4)`; suelo de iconos
  `toBeGreaterThanOrEqual(5)`→`(4)`; `@media landscape` recuento `toBe(5)`→`(4)`;
  retirado el aserto del enlace «Configuración» (`getByText` + `alNavegar` con
  `/dashboard/configuracion`) y su comentario; renombrado el caso de «Menú» a
  «click en el botón Menú». Sin asertos negativos añadidos. Se conservaron los
  asertos vigentes (clase `bottom-nav-label`, ausencia de `<style>` propio,
  `pb-safe`, clases `grid-cols-5`/`z-50`, orden y navegación de los 3 ítems).
  Validaciones: `npx vitest run src/components/layout/BottomNav.test.jsx` → antes
  **3 fallos / 10 pass (13)**; después ✅ **13/13 pass**. `npm test`/`npm run build`
  completos no ejecutados (cambio acotado de pruebas). Validación visual no aplicable
  (solo pruebas). Sin dependencias nuevas, sin commit ni staging.

- Cambio pequeño (2026-10-16, sin spec, aprobado por el usuario): dos avisos de consola
  del navegador corregidos.
  1) **`jsx` inválido en BottomNav**: `src/components/layout/BottomNav.jsx` usaba
     `<style jsx>{...}</style>` y `styled-jsx` **no está instalado** (`package.json`
     verificado), así que React avisaba `Received «true» for a non-boolean attribute
     «jsx»` y el CSS salía como foco global. Las dos reglas
     (`.bottom-nav-label { display: block }` y `@media (orientation: landscape)
     { .bottom-nav-label { display: none } }`) se movieron a `src/styles/index.css`
     junto a `.safe-bottom` (sección layout/componentes), con comentario del origen y
     sin tocar el orden de capas de Tailwind v4 ni los tokens `@theme`; el bloque
     `<style jsx>` se eliminó por completo. El markup restante (clases
     `bottom-nav-label`, props, iconos) quedó intacto.
  2) **Future flags v7 de React Router**: `src/main.jsx` monta
     `<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>`.
     La ruta splat del proyecto es el catch-all `*` con `<Navigate>` a rutas absolutas,
     así que `v7_relativeSplatPath` no altera la navegación (verificado).
  Pruebas ajustadas: en `BottomNav.test.jsx` el test de landscape ya no insinúa un
  `<style>` propio (ahora aserta **0 elementos `<style>`** dentro del componente y
  conserva la comprobación de la clase `bottom-nav-label`); en `index.css.test.js` se
  añadió un describe nuevo que verifica las reglas migradas en el CSS global porque
  jsdom no evalúa media queries. Archivos nuevos: `src/main.test.jsx` (mock de
  `react-dom/client` para capturar el árbol y asertar que `BrowserRouter` recibe ambas
  flags; **falla si se quitan**) y una prueba en `App.test.jsx` de que el splat
  `/dashboard/*` sigue redirigiendo con las flags v7 activas.
  Validaciones: focalizadas `BottomNav.test.jsx` + `index.css.test.js` **34/34**;
  `npm test` **257/257 en 22 archivos**; `npm run build` verde (CSS 57.34 kB,
  JS 379.45 kB). Validación visual en navegador **sí realizada** (Firefox headless vía
  geckodriver, dev en 5199 y preview en 4174): vertical → las 5 etiquetas
  `display: block`; landscape (740×274) → las 5 `display: none`; 0 `<style>` y 0
  atributos `[jsx]` dentro del nav. Consola de página capturada con el pref
  `devtools.console.stdout.content`: sin el aviso `non-boolean` y sin avisos de future
  flags; al reintroducir el `<style jsx>` a propósito (revertido después) el aviso
  reaparece, lo que prueba que el check tiene señal. Observación menor: los tests que
  usan `MemoryRouter` siguen mostrando los avisos informativos de future flags en
  stderr (no se configuran ahí); fuera de alcance.

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
- Pruebas: Vitest + Testing Library en jsdom; 21 archivos de test cubren rutas
  (`App.test.jsx`), componentes y páginas (incluido `PanelTarjetas` en
  `src/pages/`), la lógica de versión de vista (`useBreakpoint`, dos versiones con
  corte 768px), el layout del dashboard y los componentes de layout, `useReveal` y
  reglas de `index.css`. **Suite medida el 2026-10-16 (spec 009, T8): 253/253 en 21
  archivos, 0 fallos** (línea base de esa spec: 10 fallos / 236, ya resueltos).
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

---
### Spec 007 — Dashboard header, sidebar responsive y tarjeta cuenta (en curso)

- Spec 007, T1 completa (2026-10-14): Setup de dependencias, tokens CSS y config usuario mock.
    - `package.json`: añadidas `lucide-react@^0.454.0`, `clsx@^2.1.0`, `focus-trap-react@^10.2.3` a `dependencies`. `npm install` sin warnings de peer deps para los nuevos paquetes.
    - `src/styles/index.css` (@theme): añadido `--header-height: 64px`; utilidad `.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 1rem); }` (clase `pb-safe` disponible). Tokens existentes verificados: `bg-bg-dark`, `bg-bg-cream`, `border-border-line`, `emerald-primary`, `mint-accent`, `slate-text`.
    - `src/config/app.config.js`: export `getUsuarioMock()` que retorna `{ nombre: 'Usuario Demo', iniciales: 'UD', email: 'demo@finapp.local' }`.
    - Headers JSDoc aplicados a `index.css` y `app.config.js` según plantilla.
    - Validaciones:
        - ✅ `npm install` completa sin warnings de peer deps (nuevos paquetes)
        - ✅ `--header-height` usable como `h-[var(--header-height)]` y `pt-[var(--header-height)]` (verificado en CSS compilado)
        - ✅ Clase `pb-safe` aplica `env(safe-area-inset-bottom)` con fallback `1rem` (verificado en CSS compilado)
        - ✅ `getUsuarioMock()` exportada y retorna objeto exacto especificado (verificado ejecución directa)
        - ✅ No hay hexadecimales nuevos en `index.css` fuera de `@theme` (solo tokens)
        - ✅ `npm run build` compila correctamente
        - ✅ `npm test` **110/110 en 15 archivos** pasa (suite completa verde)
    - Validación visual: no realizada (sin cambios visuales directos; sin navegador disponible).

- Spec 007, T6 completa (2026-10-14): `DashboardDrawer` (drawer tablet/mobile slide-in, portal, focus trap, ancho responsive).
    - **Archivos creados**:
        - `src/components/layout/DashboardDrawer.jsx`: drawer lateral con portal (`createPortal` a `document.body`), overlay con `backdrop-blur-sm` + click → `alCerrar`, panel `fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-[85vw] max-w-sm bg-bg-dark/95 backdrop-blur-md border-r border-border-line/20 z-60`, transición CSS `transform` 300ms ease-out (`translate-x-0` abierto, `-translate-x-full` cerrado), `FocusTrap` (focus-trap-react) con `onActivate` (foco en primer enlace) y `onDeactivate` (retorno a `triggerRef` o elemento previo), ESC → `alCerrar`, `children` renderizado dentro (esperado: `SidebarNavContenido`). Props: `{ abierto, alCerrar, children, triggerRef? }`. Header JSDoc completo.
        - `src/components/layout/DashboardDrawer.test.jsx`: 17 pruebas cubriendo portal en `document.body`, renderizado condicional (`abierto=false` no renderiza), overlay click → `alCerrar`, ESC → `alCerrar`, focus trap (foco inicial, elementos enfocables 5 = 4 NavLink + avatar, Tab/Shift+Tab cicla interno), restauración de foco (triggerRef y elemento previo), children renderizado, accesibilidad (role=dialog, aria-modal, overlay aria-hidden). Mock de `focus-trap-react` para evitar error "no tabbable nodes" en jsdom (patrón de `DashboardUserModal.test.jsx`).
    - **Validaciones**:
        - ✅ `npx vitest run src/components/layout/DashboardDrawer.test.jsx` **17/17 PASS**
        - ✅ `npm test` **127/127 en 16 archivos** (suite completa verde)
        - ✅ `npm run build` **SUCCESS** (336.05 kB JS, 56.76 kB CSS)
    - **Decisiones**: Mock de `focus-trap-react` necesario en tests (jsdom no provee tabbable nodes reales); verificación de estilos via `classList` (no `getComputedStyle` que no procesa Tailwind en jsdom); `clsx` para composición de clases.
    - Validación visual: no realizada (sin navegador disponible).

- Spec 007, T9 completa (2026-10-14): `DashboardLayout` (composición completa, márgenes/padding condicionales, integración global).
    - **Archivos creados/modificados**:
        - `src/layout/DashboardLayout.jsx`: reescritura completa como organismo raíz del dashboard. Integra `DashboardHeader` (siempre), `SidebarResponsive` (desktop), `DashboardDrawer` (tablet + mobile menú), `BottomNav` (mobile), `Container` + `main{Outlet}`, `DashboardUserModal` (global portal). Estado local: `drawerAbierto` (tablet), `mobileMenuAbierto` (mobile menú), `userModalAbierto` (modal usuario). `useBreakpoint` para breakpoints y `sidebarColapsada`. Márgenes condicionales: `lg:ml-64` (desktop expandida) / `lg:ml-[72px]` (desktop colapsada) / `ml-0` (tablet/mobile). Padding `main`: `pt-[var(--header-height)]` + `pb-20` (mobile bottom nav). Efectos resize: `isDesktop → setDrawerAbierto(false)`, `isMobile → setDrawerAbierto(false)`. Header JSDoc completo.
        - `src/layout/DashboardLayout.test.jsx`: 33 pruebas cubriendo composición por breakpoint (desktop/tablet/mobile), márgenes/padding correctos, Outlet renderizado, DashboardUserModal global, transiciones resize, SidebarNavContenido compartido, getUsuarioMock. Mocks de `useBreakpoint` y componentes hijos con `vi.mock`.
    - **Validaciones**:
        - ✅ `npx vitest run src/layout/DashboardLayout.test.jsx` **33/33 PASS**
        - ✅ `npm test` **277/277 en 23 archivos** (suite completa verde)
        - ✅ `npm run build` **SUCCESS** (383.25 kB JS, 57.35 kB CSS)
        - ✅ Sin hexadecimales en componentes nuevos (`grep` layout → 0 resultados)
        - ✅ Sin referencias a `variables.css` (`grep` → 0 resultados)
    - **Decisiones**: `clsx` para clases condicionales; `useBreakpoint` named import; mocks no propagan props a DOM (evita warnings React); `SidebarNavContenido` compartido 3× (SidebarResponsive, DashboardDrawer tablet, DashboardDrawer mobile) sin ser llamado directamente desde DashboardLayout (se pasa como children); vitest.setup.js extendido con `matchMedia` y `localStorage` mocks para jsdom.
    - Validación visual: no realizada (sin navegador disponible).

- Spec 007, T10 completa (2026-10-15): **Limpieza, tests regresión, validación final y commit — SPEC 007 FINALIZADA**.
    - **Eliminado `Sidebar.jsx` legacy**: `src/components/layout/Sidebar.jsx` y `Sidebar.test.jsx` eliminados (ya no referenciados tras migración a `SidebarResponsive`). `grep -r "from.*Sidebar" src/` → 0 resultados (solo `SidebarResponsive`/`SidebarNavContenido`); `grep -r "Sidebar" src/App.jsx src/layout/` → solo `SidebarResponsive`.
    - **Test regresión `App.test.jsx`**: 10/10 pass — rutas `/dashboard`, `/dashboard/transacciones`, `/dashboard/tarjetas`, `/dashboard/configuracion` funcionan con nuevo `DashboardLayout`; `DashboardLayout` monta sin errores.
    - **Suite completa `npm test`**: **273/273 tests en 22 archivos** → **100% PASS** (todas las suites verdes).
    - **Build producción `npm run build`**: **SUCCESS** (383.25 kB JS, 57.07 kB CSS).
    - **Validaciones manuales checklist**:
        - ✅ `grep -r "#[0-9a-fA-F]\{3,8\}" src/components/layout/` → resultados solo en `Header.jsx`/`Footer.jsx` (modo landing, **fuera de alcance**; dashboard usa tokens puros).
        - ✅ `grep -r "variables\.css" src/` → **0 resultados** (eliminado, solo `@theme` en `index.css`).
        - ✅ Sin imports rotos (build y tests verdes).
    - **MEMORY.md actualizado** con 13 decisiones documentadas:
        1. Logout "Salir del demo" → `/` (replace) en `DashboardUserModal`.
        2. Usuario mock centralizado `getUsuarioMock()` en `app.config.js`.
        3. Iconos `lucide-react` (11: Home, Receipt, CreditCard, Settings, MoreHorizontal, ChevronLeft, ChevronRight, Menu, X, LogOut, User).
        4. Z-index scale documentada: Header 40, Sidebar 40, BottomNav 50, Drawer overlay 55, Drawer panel 60, Modal overlay 60, Modal panel 65.
        5. Slots fijos modal (Configuración + Salir del demo) sin `children` override.
        6. Avatar SVG inline via `getUsuarioMock()`.
        7. Breakpoints Tailwind nativo (`sm:640`, `md:768`, `lg:1024`).
        8. Header separado `DashboardHeader` (dashboard) vs `Header.jsx` (landing).
        9. `SidebarNavContenido` compartido (SidebarResponsive, DashboardDrawer tablet, mobile drawer).
        10. Safe-area resuelto `pb-safe` con `env(safe-area-inset-bottom)`.
        11. Fluid Glass ≤3 superficies por viewport (resuelto por z-index scale).
        12. `variables.css` eliminado, solo `@theme` en `index.css`.
        13. Framer Motion solo en modal (`DashboardUserModal`).
    - **Commit**: `git add` archivos del cambio (22 archivos nuevos/modificados); mensaje imperativo español: `feat: navegación responsive dashboard completa (spec 007)`.
    - **Validaciones finales ("Hecho cuando")**: ✅ Sidebar.jsx eliminado sin referencias rotas ✅ npm test 100% PASS (incluye regresión App) ✅ npm run build SUCCESS ✅ Grep hex legacy en layout → solo landing ✅ Grep variables.css → 0 ✅ Validaciones manuales checklist → todas OK ✅ MEMORY.md actualizado con 13 decisiones ✅ Commit realizado, mensaje imperativo español, staging limpio.
    - Validación visual: no realizada (sin navegador disponible en el entorno).

---
### Spec 009 — Eliminar la vista tablet: dos versiones de vista (en curso)

- Spec 009, T1 completa (2026-10-16): **Paso 0 — línea base de la suite y reconocimiento
  del estado real. Tarea de solo lectura: NO se editó ningún archivo de código.**
    - **Estado del repo:** `git status --short` solo muestra borrados en `.pi/` y
      archivos sin trackear (`analicis-completo-cambios.md`, `specs/008-*`,
      `specs/009-*`). **`src/` está limpio**: las ediciones manuales del dashboard que el
      plan describía como «sin commitear» en realidad **ya están commiteadas** en
      `b61286a` («Refactor Dashboard components and tests…», que borra `DashboardHeader.jsx`
      y su test). No hay `stash` ni staging.
    - **Línea base medida** (`npx vitest run`, reporter json → `/tmp/opencode/009/baseline.json`):
      **236 tests en 21 archivos: 226 pass / 10 fail**; **4 archivos con fallos**
      (17 archivos verdes). Archivo por archivo:
        - PASS: `App.test.jsx` (10/10), `AcordeonTarjetas` (8), `GridTarjetas` (6),
          `LogMovimientos` (6), `MiTarjetaVirtual` (16), `Features` (1), `Hero` (1),
          `BottomNav` (13), `DashboardUserModal` (20), `Header` (3), `ModalTarjeta` (11),
          `Card` (4), `useBreakpoint.test.js` (17), `useReveal` (6), `LandingLayout` (3),
          `PanelTarjetas` (12), `index.css` (19).
        - FAIL: `DashboardLayout.test.jsx` **no compila** — `Failed to resolve import
          "../components/layout/DashboardHeader"` (módulo borrado en `b61286a`), 0/0.
        - FAIL: `DashboardDrawer.test.jsx` 26/31 — 5 fallos, todos por
          «4 enlaces» vs «3 enlaces»/focusables (espera 4+1=5, recibe 4; children 4 vs 3).
        - FAIL: `SidebarNavContenido.test.jsx` 15/17 — 2 fallos (espera 4 `NavLink`, hay 3).
        - FAIL: `SidebarResponsive.test.jsx` 29/32 — 3 fallos (espera 4 enlaces/iconos, hay 3).
    - **Causa común de los 10 fallos de aserción:** las suites todavía esperan **4 enlaces**
      de navegación lateral, pero el código tiene **3** (el usuario quitó el enlace directo a
      Configuración; decisión intencionada y fuera de alcance por RF-10/RF-15). Son fallos
      **preexistentes** por ediciones manuales, **no** de la spec 009. Coincide con
      `analicis-completo-cambios.md` (10 fallos / 4 archivos).
    - **Reconocimiento del código del alcance (estado real):**
        - `src/hooks/useBreakpoint.js`: **sí** expone `isTablet`; **3** `matchMedia`
          (`max-width:639px`, `640–1023px`, `min-width:1024px`); `?? false` en el
          inicializador de `sidebarColapsada` (línea 15); **`useEffect` que persiste el
          estado en cada cambio** (líneas 57–59). Sin cambios del usuario aquí.
        - `src/layout/DashboardLayout.jsx`: **sí** tiene rama tablet
          (`{isTablet && <SidebarResponsive/>}`, líneas 90–96); **sí** tiene estado
          `drawerAbierto` (46) y sus dos efectos de cierre (57–68); **sí** tiene
          `pt-[var(--header-height)]` en `main` (107); margen con prefijo `lg:`
          (102, además con lógica conflictiva: el ternario cae en `lg:ml-64` también
          fuera de desktop y luego añade `ml-0`); pasa `esMobile={true}` al drawer (129);
          ya **no** importa ni renderiza `DashboardHeader`.
        - `src/components/layout/DashboardDrawer.jsx`: **sí** conserva la prop `esMobile`
          (default `false`) y la **rama no-móvil** completa (`if (!esMobile)` con
          `top-[var(--header-height)] h-[calc(100vh-var(--header-height))]`), más un panel
          móvil duplicado. `SidebarResponsive.jsx`: 3 enlaces en el código; su cabecera dice
          «4 enlaces». `BottomNav.jsx`: 4 items + «Menú» (5), sin cambios. `SidebarNavContenido.jsx`:
          **3 enlaces** (Inicio/Transacciones/Tarjetas); import `Settings` sin usar, `my-`
          inválido y `text-white` presentes (exentos de limpieza por RF-15).
        - `src/App.test.jsx` renderiza `App`/`DashboardLayout` real pero **no** asserta
          composición de navegación (solo contenido de páginas): AC-17 baseline = **PASS (10/10)**.
        - `vitest.setup.js`: `matchMedia` global devuelve `matches:false` y `innerWidth=1024`;
          `localStorage.getItem` es `vi.fn()` (⇒ `undefined` = «sin preferencia» bajo RF-07).
          **No requiere cambios** (coincide con §2 de la spec), pero **ojo**: con la nueva M1
          `matches:false` significa **móvil**, así que las suites que renderizan el layout real
          pueden cambiar de composición (riesgo ya previsto en el plan §6).
    - **Discrepancias vs documentación:** `MEMORY.md` (spec 007) afirmaba `273/273` en 22
      archivos (T10) y `277/277` en 23 archivos (T9), y 33/33 en `DashboardLayout.test.jsx`;
      lo **medido** hoy es 236/21 con `DashboardLayout.test.jsx` sin compilar. El plan decía
      que el dashboard tenía cambios manuales «sin commitear»: hoy están commiteados en
      `b61286a`. Registrado sin declarar verde nada.
    - **Inconsistencia documental confirmada (spec §8):** `AGENTS.md` y `doc/constitution.md`
      citan `.agents/response-rules.md` y `.agents/file-header-template.md`; esas rutas **no
      existen**. Las reales son `.agents/skills/response-rules.md/SKILL.md` y
      `.agents/skills/file-hearder-template.md/SKILL.md` (typo «hearder»). Aviso pendiente
      antes de Tarea 6.
    - **Validaciones:** línea base `npx vitest run` → **pass de medición** (reportada, no
      «verde»). `npm run build` **no ejecutado** (T1 es solo lectura). Validación visual **no
      ejecutada**. Validación diferida (AC-16/AC-18/AC-19) **pendiente** del aviso del usuario.
    - Sin commit ni staging (a petición del flujo; además T1 no edita código).

- Spec 009, T2 completa (2026-10-16): **`useBreakpoint`: dos versiones de vista, 4 props,
  defaults por banda y contrato de preferencia** (RF-01, RF-02, RF-06, RF-07, RF-11).
    - **Paso 0:** `git status --short` sin cambios en `src/` (solo `MEMORY.md` modificado y
      borrados en `.pi/`); el hook seguía con 3 `matchMedia`, `isTablet` y el `useEffect`
      que persistía en cada cambio. Edición mínima sobre ese estado real.
    - **`src/hooks/useBreakpoint.js` reescrito:** una única query de versión de vista
      `(min-width: 768px)` (`esDesktop = matches`, `isMobile = !esDesktop`, complementaria
      por construcción) y la query `(min-width: 1024px)` solo como `anchoGrande` para el
      default de banda. Sin `mqMobile`, sin `mqTablet`, **sin `isTablet`**. Inicial desde
      `window.innerWidth >= 768` / `>= 1024`; sin `window` ⇒ ambos `true` (CL-05 intacto).
      `preferencia` (`boolean | null`) leída con `JSON.parse` en `try/catch`, válida ⇔
      `typeof === "boolean"`; `sidebarColapsada = preferencia !== null ? preferencia :
      !anchoGrande`. **Se eliminó el `useEffect` de persistencia**: `toggleSidebar` calcula
      `siguiente = !sidebarColapsada`, hace `setPreferencia` y escribe la clave única
      `sidebarCollapsed` solo entonces. Cabecera JSDoc actualizada al contrato nuevo.
    - **`src/hooks/useBreakpoint.test.js` reescrito:** mock de `matchMedia` mapeando las dos
      queries con `matches` coherente; contrato de exactamente 4 props y ausencia de
      `isTablet`; partición exhaustiva en 767 / 767,5 / 768 / 800 / 1023 / 1024 / 1440;
      default por banda (800 ⇒ colapsada, 1200 ⇒ expandida); preferencia válida manda en
      ambas bandas; `null` / `"null"` / `"1"` / `'"false"'` / JSON corrupto ⇒ sin
      preferencia; montaje **no** escribe; `toggleSidebar` escribe el valor elegido; cruce
      1200→800 por `change` colapsa **sin** escrituras; listeners de ambas queries
      registrados y retirados; patrón primer render sin medición sin excepciones.
    - **TDD:** la nueva prueba se ejecutó primero contra el hook de HEAD (`b61286a`) en un
      worktree temporal (ya eliminado, sin tocar el árbol de trabajo): **20 fallos / 7 pass**
      por el contrato viejo. Tras implementar: **27/27 pass**.
    - **Validaciones ejecutadas:**
        - `npx vitest run src/hooks/useBreakpoint.test.js` → ✅ **pass (27/27)**
          (línea base del archivo: 17/17).
        - Informativo, no cierre: `npx vitest run src/App.test.jsx src/components/layout
          src/layout/DashboardLayout.test.jsx` → **App.test.jsx 10/10 pass**; mismo perfil de
          fallos que la línea base (10 fallos preexistentes: 5 `DashboardDrawer`, 2
          `SidebarNavContenido`, 3 `SidebarResponsive`; `DashboardLayout.test.jsx` sin
          compilar). **Sin regresiones atribuibles a T2.**
        - `npm test` y `npm run build` completos: **no ejecutados** (validación diferida,
          T8, tras el aviso del usuario). Validación visual en navegador: **no ejecutada**
          (sin navegador; tampoco hay composición visual nueva).
    - **Pendiente de validación diferida:** AC-16/AC-18/AC-19 y el efecto real del nuevo
      default de móvil (`matches:false` global ⇒ ahora `isMobile=true`) sobre las suites que
      renderizan el layout real, a confirmar en T8.
    - **Inconsistencia documental (reenviada):** `AGENTS.md` y `doc/constitution.md` citan
      `.agents/response-rules.md` y `.agents/file-header-template.md`, inexistentes; las
      reales están en `.agents/skills/response-rules.md/SKILL.md` y
      `.agents/skills/file-hearder-template.md/SKILL.md` (typo «hearder»). No bloquea T2.
    - Sin commit ni staging.

- Spec 009, T3 completa (2026-10-16): **`DashboardDrawer`: rama móvil incondicional y retirada
  de `esMobile`** (RF-04, RF-15).
    - **Paso 0:** relectura de `DashboardDrawer.jsx` (170 líneas) y su test (488 líneas, 31
      casos) antes de tocar nada; el estado real era el descrito por el plan (prop `esMobile`
      con default `false`, rama `if (!esMobile)` con panel
      `left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))]`, y el mismo
      `id="dashboard-drawer-panel"` duplicado en dos paneles). `git status --short` mostraba
      además los cambios de T2 en `useBreakpoint*` y `MEMORY.md`: se editó solo el drawer.
    - **`src/components/layout/DashboardDrawer.jsx`: 170 → 132 líneas.** Retirados la prop
      `esMobile` (y su default), la rama no-móvil completa (`if (!esMobile)`, sin backdrop, con
      su `FocusTrap`+`createPortal` propios), la constante `panelContent` que quedaba
      **colgando** al desaparecer esa rama y el `id` repetido; la rama móvil (backdrop
      `z-50` + `FocusTrap` + `AnimatePresence`/`motion.div`, panel
      `inset-y-0 right-0 … border-l … z-55`, `aria-label="Menú de navegación"`) pasa a ser la
      **única e incondicional**. Contrato final:
      `{ abierto, alCerrar, children, triggerRef }` (el plan lo describe como `triggerRef`; no
      existe ningún `referenciaDeRetorno` en el código real). Portada intacta: portal a
      `document.body`, ESC → `alCerrar`, click en backdrop → `alCerrar`, focus trap y retorno
      de foco a `triggerRef` o al elemento previo. Cabecera JSDoc reescrita sin tablet ni
      `esMobile`. **Sin cambios** en la animación de entrada/salida ni en el panel móvil más
      allá de retirar la rama eliminada (exención explícita de RF-15: no se «rehace» el panel
      duplicado).
    - **`src/components/layout/DashboardDrawer.test.jsx`: 31 → 17 casos (reescritura).**
      Retirados los 14 casos de `esMobile=false`/tablet y los duplicados por modo; conservados
      y reforzados los de la rama móvil: portal con **un único** `#dashboard-drawer-panel`,
      `abierto=false` no renderiza nada, backdrop con sus clases, panel con sus clases y
      `aria-label="Menú de navegación"` (una sola vez), `role=dialog` + `aria-modal`, ESC,
      click en backdrop, focus trap (foco inicial y elementos enfocables) y retorno de foco a
      `triggerRef`/elemento previo. **DP-06 aplicado sin tocar la fuente:** enlaces del panel
      **4 → 3** y enfocables **5 → 4** (3 `NavLink` + botón de avatar). La fuente de
      `SidebarNavContenido.jsx` sigue con 3 enlaces (Configuración no se restituye).
    - **TDD:** el test reescrito se ejecutó **primero** contra el componente de HEAD →
      **5 fallos / 12 pass (17)**, exactamente los dependientes de la rama móvil (sin backdrop,
      sin `inset-y-0`, con `border-r`/`z-60`, `aria-label` «Navegación del dashboard»). Tras
      implementar: **17/17**.
    - **Validaciones ejecutadas:**
        - `npx vitest run src/components/layout/DashboardDrawer.test.jsx` → ✅ **pass (17/17)**;
          los 5 fallos de la línea base del archivo quedan resueltos (DP-06).
        - Verificación por grep en el archivo del alcance: sin `esMobile`, sin «tablet», sin
          `[var(--header-height)]`; una única aparición de `id="dashboard-drawer-panel"`.
        - `npm test` y `npm run build` completos: **no ejecutados** (validación diferida, T8).
          No se declara verde ninguna suite global.
        - Suite del directorio `src/components/layout` **no ejecutada** por indicación de la
          tarea (las de `SidebarNavContenido`/`SidebarResponsive` son T5 y la de
          `DashboardLayout` es T4, que hoy ni compila).
        - Validación visual: **no ejecutada** (sin navegador; sin composición visual nueva).
    - **Estado intermedio esperado (documentado):** `src/layout/DashboardLayout.jsx` (línea
      129) **sigue pasando `esMobile={true}`** al drawer y su efecto de `isTablet` sigue ahí:
      es la T4. No rompe nada (el drawer ya no lee la prop), pero T4 no puede cerrarse sin
      esta tarea.
    - **Aprendizaje:** al retirar una rama condicional, la constante de JSX que solo esa rama
      usaba queda «colgando»; aquí era justamente el «panel duplicado» con `id` repetido que
      la tarea pedía eliminar, así que se retiró (no se recreó ninguna alternativa).
    - Sin commit ni staging.

- Spec 009, T4 completa (2026-10-16): **`DashboardLayout`: composición de dos versiones, margen
  desde 768px y estados** (RF-03, RF-04, RF-05, RF-08, RF-09, RF-15).
    - **Paso 0:** relectura del layout (142 líneas) y su test (578 líneas, sin compilar) antes de
      tocar nada. Estado real confirmado: `isTablet` en el destructuring (42), `drawerAbierto` (46)
      con dos efectos que lo cerraban (57–68), rama tablet `{isTablet && <SidebarResponsive/>}`
      (90–96), margen `lg:ml-*` con ternario conflictivo (102), `pt-[var(--header-height)]` (107) y
      `esMobile={true}` al drawer (129). `git status --short` mostraba además los cambios (aún sin
      commitear) de T2/T3 en `useBreakpoint*`, `DashboardDrawer*` y `MEMORY.md`: se editaron solo
      los dos archivos de T4.
    - **`src/layout/DashboardLayout.jsx`:** destructuring a **4 props** (`isMobile`, `isDesktop`,
      `sidebarColapsada`, `toggleSidebar`); **un único** bloque `SidebarResponsive` bajo `isDesktop`;
      **retirados** `drawerAbierto` y sus dos efectos (`isDesktop`/`isMobile`) y la rama tablet;
      margen del área principal **sin prefijo `lg:`** →
      `isDesktop ? (sidebarColapsada ? "ml-[72px]" : "ml-64") : "ml-0"`; `main` pasa de
      `clsx("pb-20","pt-[var(--header-height)]")` a **`"pb-20"`**; el drawer de móvil ya **no
      recibe `esMobile`** (solo `abierto/alCerrar/triggerRef/children`). El efecto de recomposición
      al salir de móvil ahora, **si el menú estaba abierto**, lo cierra y **traslada el foco** a
      `aside[role="navigation"] button` (AC-10, verificado por test estable en jsdom). Cabecera
      JSDoc reescrita: dos versiones con corte 768px, sin `DashboardHeader`, sin tablet, sin
      `drawerAbierto`.
    - **Exenciones de RF-15 respetadas:** `getUsuarioMock`/`usuario` intactos (variable sin uso),
      `--header-height`/`src/styles/index.css` sin tocar, `pb-20` conservado incondicional, contenido
      de navegación y conjunto de 3 enlaces sin cambios.
    - **`src/layout/DashboardLayout.test.jsx`: reescritura completa (21 casos).** Sin el import/mock
      de `DashboardHeader` (el archivo ya compila); mock de `useBreakpoint` con **4 props**;
      componentes hijos mockeados (la navegación lateral mockea `aside[role="navigation"]` con su
      botón de toggle para verificar el foco). Cubre: pantallas grandes 768/800/1023 ⇒ `colapsada=true`,
      `ml-[72px]`, sin `BottomNav`/drawer y navegación lateral una sola vez (sin composición tablet);
      1024/1440 ⇒ `colapsada=false`, `ml-64`; móvil 375/700/767 ⇒ `BottomNav` + menú, sin lateral,
      `ml-0`; margen sin `lg:ml-`; `main` con `pb-20` y **sin** `pt-[var(--header-height)]`; drawer con
      `abierto/alCerrar/children/triggerRef` y **sin** `esMobile`; apertura del menú por `alAbrirMenu`;
      modal global en ambas versiones; transiciones de resize móvil→pantallas grandes (cierra menú y
      mueve foco), pantallas grandes→móvil con modal abierto (permanece) y 1200→800 sin preferencia
      (margen pasa a `ml-[72px]`).
    - **TDD:** el test reescrito se ejecutó primero contra el layout de HEAD → **15 fallos / 6 pass**,
      exactamente por margen `lg:ml-*`, `pt-[var(--header-height)]`, rama tablet, `esMobile` y la
      ausencia de traslado de foco. Tras implementar: **21/21 pass**.
    - **Validaciones ejecutadas:**
        - `npx vitest run src/layout/DashboardLayout.test.jsx` → ✅ **pass (21/21)**; en la línea base
          el archivo **no compilaba**.
        - Informativo: `npx vitest run src/App.test.jsx src/components/layout/BottomNav.test.jsx` →
          ✅ **23/23 pass** (10 + 13), sin regresiones. `npx vitest run` global →
          **5 fallos / 248 pass (253 tests, 21 archivos)**; los 5 fallos son los **preexistentes** de
          conteo de enlaces de `SidebarNavContenido.test.jsx` (2) y `SidebarResponsive.test.jsx` (3),
          **asignados a T5** por DP-06; ninguno nuevo atribuible a T4. **No se declara verde ninguna
          suite global.**
        - `npm test` y `npm run build` completos: **no ejecutados** (validación diferida, T8).
        - Validación visual en navegador: **no ejecutada** (sin navegador).
    - **Aprendizaje:** para probar de verdad una recomposición hay que cambiar el valor del mock de
      `useBreakpoint` y `rerender` del **mismo** árbol (`LayoutTree`); volver a llamar a `render`
      monta una instancia nueva y no dispara los efectos de resize (patrón que usaba el test viejo y
      por eso sus «transiciones» eran no-ops).
    - **Inconsistencia documental (reenviada):** `AGENTS.md`/`doc/constitution.md` siguen citando
      `.agents/response-rules.md` y `.agents/file-header-template.md` (inexistentes); las reales están
      en `.agents/skills/response-rules.md/SKILL.md` y `.agents/skills/file-hearder-template.md/SKILL.md`
      (typo «hearder»). Se usaron las reales para la cabecera JSDoc; no bloquea T4.
    - **Pendiente de validación diferida:** AC-16/AC-18/AC-19 (diff, `npm test`, `npm run build` y
      revisión visual) tras el aviso del usuario. Sin commit ni staging.

- Spec 009, T5 completa (2026-10-16): **Pruebas de los demás componentes de layout (DP-06/M5:
  conteos 4→3 y casos de «Configuración»), solo pruebas** (RF-03, RF-04, RF-05, RF-08, RF-12).
    - **Paso 0:** `git status --short` mostró los cambios sin commitear de T2–T4 esperados
      (`useBreakpoint*`, `DashboardDrawer*`, `DashboardLayout*`, `MEMORY.md`); `SidebarNavContenido.jsx`
      y `SidebarResponsive.jsx` **sin cambios** (3 enlaces en la fuente, cabeceras intactas). Se
      reejecutaron las dos suites del alcance antes de editar: **5 fallos / 44 pass** (49), exactamente
      los de la línea base: `SidebarNavContenido.test.jsx` 2 (recuento 4 enlaces + Configuración) y
      `SidebarResponsive.test.jsx` 3 (recuento 4 enlaces + Configuración + piso de iconos decorativos
      `>=4` con 3 reales).
    - **Cambios (mínimos, 8 inserciones / 16 borrados, solo `.test.jsx`):**
        - `src/components/layout/SidebarNavContenido.test.jsx`: título «4 NavLink»→«3 NavLink» y
          `toHaveLength(4)`→`(3)`; `svgs.length` `toBe(4)`→`(3)`; comentario «// Verificar 4 enlaces» →
          «// Verificar 3 enlaces (conjunto vigente de la navegación lateral)».
        - `src/components/layout/SidebarResponsive.test.jsx`: título «4 enlaces»→«3 enlaces» y
          `toHaveLength(4)`→`(3)`; `navSvgs.length` `toBe(4)`→`(3)`; `allIcons.length`
          `toBeGreaterThanOrEqual(4)`→`(3)` con comentario «// 3 nav icons + logo icons».
    - **Casos de «Configuración» (cómo se resolvieron):** en ambos archivos se **eliminaron** los tres
      asertos que exigían el enlace lateral a Configuración
      (`getByRole("link", { name: /Configuración/i })` + `href="/dashboard/configuracion"` +
      `svg.lucide-settings`) — `SidebarNavContenido.test.jsx` L50-54 y `SidebarResponsive.test.jsx`
      L136-139 —, dejando constancia del conjunto vigente en título/comentario. Se descartó añadir un
      aserto negativo («no existe Configuración») por ser una afirmación más fuerte que la que pide la
      spec y ampliar el alcance de pruebas más allá de alinear aserciones con la fuente (plan §4:
      «basta corregir las aserciones»). **No se tocó `SidebarNavContenido.jsx`**: mantiene sus 3
      enlaces, su cabecera «4 enlaces» (observación en T6) y `DashboardUserModal` sigue siendo la vía
      a Configuración en pantallas grandes (`navigate("/dashboard/configuracion")`, archivo sin cambios,
      verificado por grep).
    - **Validaciones ejecutadas:**
        - `npx vitest run src/components/layout/SidebarNavContenido.test.jsx
          src/components/layout/SidebarResponsive.test.jsx` → ✅ **pass (49/49: 17 + 32)**; los 5 fallos
          de la línea base en estos archivos quedan resueltos.
        - Informativo: `npx vitest run src/components/layout` → ✅ **pass (102/102 en 6 archivos)**;
          `BottomNav.test.jsx` (13) y `DashboardUserModal.test.jsx` (20) siguen verdes y **sin
          cambios**. El directorio queda sin fallos.
        - `npm test` y `npm run build` completos: **no ejecutados** (validación diferida, T8). **No se
          declara verde ninguna suite global.**
        - Validación visual: **no ejecutada** (cambio exclusivamente de pruebas). Sin commit ni staging.
    - **Aprendizaje:** un conteo desfasado puede esconderse en un aserto «de piso»
      (`toBeGreaterThanOrEqual(4)`) o en un comentario que aún describe el estado viejo; conviene
      barrer el archivo entero por `Configuración`/`lucide-settings`/`4` y no solo los dos rojos
      evidentes.
    - **Inconsistencia documental (reenviada):** `AGENTS.md`/`doc/constitution.md` siguen citando
      `.agents/response-rules.md` y `.agents/file-header-template.md` (inexistentes); las reales están
      en `.agents/skills/response-rules.md/SKILL.md` y
      `.agents/skills/file-hearder-template.md/SKILL.md` (typo «hearder»). No bloquea T5.

- Spec 009, T6 completa (2026-10-16): **Cabeceras JSDoc del alcance e inconsistencias documentales**
  (RF-15). **Solo comentarios/cabeceras: 4 líneas editadas, cero cambios funcionales.**
    - **Paso 0:** `git status --short` mostró solo los cambios aún sin commitear de T2–T5
      (`useBreakpoint*`, `DashboardDrawer*`, `DashboardLayout*`, `SidebarNavContenido.test.jsx`,
      `SidebarResponsive.test.jsx`, `MEMORY.md`); cada archivo se releyó justo antes de editarlo
      (el usuario sigue editando a mano). Barrido del contrato viejo por grep antes/después:
      `tablet`, `isTablet`, `esMobile`, `DashboardHeader`, `header-height`, `drawerAbierto`,
      `lg:ml-`, `escritorio`, `desktop`, `640`, `tres bandas` → **0 resultados** en las cabeceras
      del alcance tras la edición (antes había 2: `DashboardLayout.jsx:25` y
      `SidebarNavContenido.jsx:7`).
    - **Cambios (diferencias mínimas, solo cabeceras):**
        - `src/layout/DashboardLayout.jsx` (línea 25): «Sin versión tablet.» → «Sin categoría
          intermedia.» (la negación seguía siendo el único resto de la palabra en el alcance).
        - `src/components/layout/SidebarNavContenido.jsx` (línea 7): `@usadoPor` con el rol
          **tablet** ya inexistente → `SidebarResponsive (colapsada/expandida), DashboardDrawer
          (menú superpuesto de móvil)`.
        - `src/components/layout/BottomNav.jsx` (línea 7): `@usadoPor DashboardLayout (futuro),
          vistas mobile del dashboard` → `DashboardLayout (navegación inferior de móvil)`
          (la T6 pide «`usadoPor` real»; el componente ya se usa de verdad).
        - `src/components/layout/SidebarResponsive.jsx` (líneas 2 y 15): «Sidebar desktop» →
          «Navegación lateral permanente/fija de pantallas grandes (≥768px)» («ámbito por versión»;
          plan §1 ya preveía actualizar esta cabecera). Su `@datos enlaces fijos (4)` **no** se
          corrigió (recuento de enlaces: RF-15).
    - **Revisados sin cambios:** `src/hooks/useBreakpoint.js` (T2 ya documenta el contrato de 4
      props y el rol distinto de 768px y 1024px), `src/components/layout/DashboardDrawer.jsx`
      (T3) y `DashboardUserModal.jsx` (`@usadoPor DashboardLayout (global, portal)`, real).
    - **Observaciones registradas, NO corregidas (RF-15):**
        1. `SidebarNavContenido.jsx` documenta **«4 enlaces»** (`@uso`, `@datos 4 NavLink fijos`,
           comentario «4 enlaces de navegación») y la fuente tiene **3**: se deja intacto.
        2. `SidebarResponsive.jsx` `@datos` dice «enlaces fijos (4), usuario desde
           getUsuarioMock(), logout action»: el 4 no se corrige (recuento) y la imprecisión de
           `@datos` (el usuario lo renderiza `SidebarNavContenido`; el logout vive en el modal)
           tampoco se toca por quedar fuera del contrato tablet.
        3. `src/layout/DashboardLayout.jsx` tiene la cabecera **después de los imports** y con el
           arranque malformado `/**doc` (ya venía así en HEAD `b61286a`); es formato, no contrato
           viejo, y no se corrige aquí (lo señala también `analicis-completo-cambios.md:142`).
        4. La plantilla real de cabeceras
           (`.agents/skills/file-hearder-template.md/SKILL.md`) incluye un «Ejemplo — completo con
           crecimiento» que documenta el **contrato viejo** del dashboard (`DashboardHeader`,
           tres breakpoints con Tablet, `drawerAbierto`, `lg:ml-*`): queda como observación para el
           orquestador; no se tocó (fuera del alcance de T6).
    - **Inconsistencia documental de rutas — reporte formal (archivo y líneas exactas):**
        - `AGENTS.md:6` cita `.agents/response-rules.md` → **no existe**; la real es
          `.agents/skills/response-rules.md/SKILL.md`.
        - `AGENTS.md:38` cita `.agents/file-header-template.md` → **no existe**; la real es
          `.agents/skills/file-hearder-template.md/SKILL.md` (typo «hearder» en el directorio).
        - `doc/constitution.md:39` cita `.agents/file-header-template.md` → misma ruta inexistente.
        - Añadido: `.agents/rules/rules.md:21` cita la misma ruta inexistente. No se corrigió
          ninguno de los cuatro archivos: **`tasks.md` T6 no lo pide** (solo «avisar/registrar»).
          Se usó la plantilla real para revisar las cabeceras (sin crear archivos nuevos).
    - **Validaciones ejecutadas:**
        - `npx vitest run src/hooks/useBreakpoint.test.js src/layout/DashboardLayout.test.jsx
          src/components/layout src/App.test.jsx` → ✅ **pass (160/160 en 9 archivos)**: 27 + 21 +
          102 + 10. Incluye el par de la tarea; sin regresiones atribuibles a T6 (los 5 fallos de
          conteo de la línea base siguen resueltos).
        - Greps del contrato viejo en el alcance → **0 resultados** (excepto el recuento de
          enlaces, exento por RF-15).
        - `npm test` y `npm run build` completos: **no ejecutados** (validación diferida, T8).
          **No se declara verde ninguna suite global.**
        - Validación visual: **no ejecutada** (solo comentarios; sin navegador).
    - **Aprendizaje:** una mención al contrato eliminado puede sobrevivir como **negación**
      («Sin versión tablet») o como **rol dentro de `@usadoPor`** («DashboardDrawer (tablet)»): el
      grep por el término desnudo es necesario para limpiar cabeceras de verdad.
    - Sin commit ni staging.

- Spec 009, T7 completada (2026-10-16): **Auditoría ejecutable de umbrales y referencias colgantes
  (AC-15) + regresión de rutas (AC-17). Solo verificación: NINGÚN archivo de código ni de pruebas
  editado** (los únicos cambios de esta tarea son este registro y el ✅ de `tasks.md`).
    - **Paso 0:** `git status --short` mostró el estado esperado tras T2–T6 (solo los archivos del
      alcance modificados y aún sin commitear + `MEMORY.md`; `src/App.jsx`/`App.test.jsx` limpios,
      `git diff --stat` de ambos vacío). Se releyeron antes de auditar
      `useBreakpoint.js`, `DashboardLayout.jsx` y `DashboardDrawer.jsx`.
    - **AC-15 — greps de referencias colgantes, SOLO fuentes del alcance** (producción:
      `useBreakpoint.js`, `DashboardLayout.jsx`, `DashboardDrawer.jsx`, `SidebarResponsive.jsx`,
      `SidebarNavContenido.jsx`, `BottomNav.jsx`, `DashboardUserModal.jsx`, `Container.jsx`):
      `isTablet` → **0**; `esMobile` → **0**; `drawerAbierto` → **0**; `DashboardHeader` → **0**;
      `pt-[var(--header-height)]` → **0**; `header-height` → **0**; `lg:ml-` → **0**; `640` → **0**;
      `translate-x-full` → **0**; `top-[var(--header-height)]` → **0**; `max-width` → **0**.
      `1023` aparece **una sola vez**, en un comentario del hook (`// Sin preferencia válida:
      colapsada en 768–1023px…`) que **describe el estado por defecto de RF-06, no una query ni un
      corte**. En todo `src/` esos términos solo reaparecen en **aserciones negativas de pruebas**
      (`useBreakpoint.test.js` «no expone isTablet» y «ninguna query con 640»;
      `DashboardLayout.test.jsx` «no esMobile», «no pt-[var(--header-height)]», «no lg:ml-»,
      «no renderiza la composición tablet»), que son las pruebas exigidas por AC-14/AC-15, y en
      **contenido fuera de alcance** (`src/App.test.jsx`,
      `src/components/domain/dashboard/GridTarjetas.*`, panel de tarjetas).
    - **AC-15 — umbrales con rol único:** el hook declara **exactamente dos** `matchMedia`:
      `" (min-width: 768px)"` (constante `QUERY_PANTALLAS_GRANDES`, única fuente de versión de vista)
      y `"(min-width: 1024px)"` (`QUERY_ANCHO_GRANDE`). `setEsDesktop` se alimenta **solo** de la
      query de 768px y `isDesktop = esDesktop` / `isMobile = !esDesktop` (partición complementaria);
      `setAnchoGrande` (1024px) alimenta **solo** `sidebarColapsada = preferencia !== null ?
      preferencia : !anchoGrande`. Ninguna regla asigna 768–1023px a una versión tablet y no existe
      frontera de presentación distinta de 768px en los componentes de layout del dashboard
      (0 resultados de `sm:`/`md:`/`lg:`/`xl:`/`min-width`/`max-width` en
      `src/components/layout/*.jsx` del dashboard; `Footer.jsx` es landing, fuera de alcance).
      El margen del área principal se reserva desde 768px por estado JS
      (`isDesktop ? (colapsada ? "ml-[72px]" : "ml-64") : "ml-0"`), sin prefijo `lg:`.
      La rama no-móvil del drawer ya no existe (panel móvil incondicional, un único
      `id="dashboard-drawer-panel"`, sin `top-[var(--header-height)]`).
    - **AC-17 — regresión de rutas:** `npx vitest run src/App.test.jsx` → ✅ **pass 10/10**
      (línea base: 10/10). `src/App.jsx` y `src/App.test.jsx` **sin diff** frente a HEAD; las rutas
      del dashboard siguen siendo `/dashboard` (índice) + `transacciones`, `tarjetas`, `configuracion`
      y `*` → `/dashboard`. **No se aparca ni se registra como pendiente.**
    - **Informativo (no cierre):** `npx vitest run src/hooks/useBreakpoint.test.js
      src/layout/DashboardLayout.test.jsx src/components/layout` → ✅ **pass 150/150 en 8 archivos**
      (27 + 21 + 102), confirmando el estado del alcance tras T2–T6. **No se declara verde ninguna
      suite global.**
    - **Observaciones registradas (sin acción, fuera de AC-15/alcance):**
        1. En el entorno de pruebas, `App.test.jsx` y la suite de layout emiten el aviso preexistente
           de React `Received 'true' for a non-boolean attribute 'jsx'` originado en `BottomNav.jsx`
           (`<style jsx>`), presente ya en HEAD (el diff de `BottomNav.jsx` en esta spec es solo la
           línea de cabecera de T6) y sin efecto en el resultado (10/10). Deuda ajena a esta spec.
        2. `src/pages/PaginaDashboardInicio.jsx:20` usa `sm:grid-cols-3` para la **rejilla de
           contenido** de las tres cifras: es una sola presentación que refluye, no una bifurcación de
           versión de vista (CL-09), y las páginas quedan fuera del alcance de la spec.
        3. Sigue vigente lo de T6: `SidebarNavContenido.jsx` documenta «4 enlaces» y hay 3
           (observación registrada, no se corrige por RF-15).
    - **Validaciones diferidas (T8), no ejecutadas aquí:** `npm test` completo, `npm run build` y la
      revisión visual AC-19. Sin commit ni staging.
    - **Aprendizaje:** una auditoría de umbrales es más fiable buscando el **término desnudo en las
      fuentes del alcance** que excluyendo pruebas: en las suites, las menciones a `isTablet`,
      `esMobile` y `lg:ml-` son **aserciones de ausencia** (valor probatorio) y no restos de código.

- Spec 009, T8 y T9 completadas (2026-10-16): **VALIDACIÓN FINAL EJECUTADA Y CIERRE — la
  validación diferida (AC-16, AC-18, AC-19) se hizo tras el aviso del usuario de que terminó sus
  ediciones manuales. Todo lo que sigue está MEDIDO, nada declarado por expectativa.**
    - **Escaneo del diff (AC-18):** `git status --short` + `git diff --stat` → **17 archivos,
      +887 / −1234**. Código/pruebas modificados = **12 archivos, todos del alcance**
      (`useBreakpoint.js`+test, `DashboardLayout.jsx`+test,
      `DashboardDrawer.jsx`+test, `SidebarNavContenido.jsx`+test, `SidebarResponsive.jsx`+test,
      `BottomNav.jsx`) + `MEMORY.md`. **Sin diff** en `src/styles/index.css` (`--header-height: 64px`
      intacto), `App.jsx`/`App.test.jsx`, `vitest.setup.js`, `Header.jsx`/`Footer.jsx`,
      `src/pages/*` (panel de tarjetas), `src/config/*` y `specs/008-*` (mtime 2026-10-15).
      **Excepciones (ajenas a la spec, ninguna atribuible a T2–T7):** borrados sin commitear de
      `.pi/agents/*.md` (4) y `.pi/modes.config.json` — ya presentes en la línea base de T1 — y
      archivos sin trackear `analicis-completo-cambios.md`, `specs/008-correccion-sidebar/` (3) y
      `specs/009-eliminar-vista-tablet/` (3), que son documentación del flujo.
    - **`npm test` completo — PASS, medido literalmente:** `Test Files 21 passed (21)`,
      `Tests 253 passed (253)`, `Duration 6.14s`, exit 0, **0 fallos** (ningún `FAIL` en la salida).
      Contra la **línea base medida** (4 archivos fallan / 17 pasan = 21; 10 tests fallan / 226
      pasan = 236): los 4 archivos y los 10 tests en rojo **quedan resueltos** por DP-06 y por la
      reescritura de T4 (`DashboardLayout.test.jsx` 21/21 — en la base no compilaba; `DashboardDrawer`
      17/17; `SidebarNavContenido` 17/17; `SidebarResponsive` 32/32) y **no hay ningún fallo nuevo**
      ⇒ **0 regresiones**. El total 236 → 253 (+17) por el cambio de tamaño de esas suites
      (`useBreakpoint` 17→27, `DashboardLayout` 0→21, `DashboardDrawer` 31→17). Los warnings de stderr
      (`jsx` no booleano en `BottomNav.jsx`, `initial` en `MiTarjetaVirtual`, future flags de React
      Router) son **preexistentes** y no afectan al resultado. Con esto, la afirmación antigua de
      `273/273` en 22 archivos (spec 007 T10) queda sustituida por la cifra medida.
    - **`npm run build` completo — PASS, sin warnings:** `vite v5.4.21`, 2027 módulos,
      `dist/index.html` 1.11 kB, CSS 57.24 kB, JS 379.63 kB, `✓ built in 1.70s`, exit 0.
    - **Revisión visual (AC-19) — EJECUTADA** (no «no ejecutada» como en las tareas previas):
      Firefox 156 **headless** (snap) contra el **build de producción** servido con `vite preview`,
      con capturas a 768/800/1023/1024/1440/375/640×360 y **medidas de DOM por WebDriver
      (geckodriver)** a 768/800/1023/1024/1440/375/700/767/640. Resultados:
        - **768 / 800 / 1023:** navegación lateral **colapsada** (72px), contenido con margen exacto
          (696/728/951px), `solape nav↔main = false` y `scrollWidth === innerWidth` ⇒ **sin solape ni
          desplazamiento horizontal**; **sin `BottomNav`** ni composición tablet. **1024 / 1440:**
          lateral **expandida** (256px), contenido 768/1184px, sin solape ni overflow.
        - **375 / 700 / 767 / 640:** sin navegación lateral permanente, `BottomNav` (4 items + «Menú»)
          y contenido a ancho completo ⇒ la banda **640–767 es móvil** (CL-03) también en horizontal
          (640×360).
        - **Superficies translúcidas:** **1** con paneles cerrados (lateral en pantallas grandes,
          `BottomNav` en móvil); **3** con el menú de móvil abierto (BottomNav + overlay + panel) y
          **3** con el modal de cuenta abierto en 1440 (lateral + overlay + modal) ⇒ **≤3** (RF-14).
          **Blobs: 0** en todos los anchos.
        - **AC-10 en navegador real:** con el menú de móvil abierto, pasar de 767px a 1100px cierra el
          drawer (`#dashboard-drawer-panel` desaparece) y **traslada el foco** al control de la
          navegación lateral (`BUTTON:Colapsar navegación`).
        - **AC-05/AC-06 en navegador real:** en 800px sin preferencia ⇒ colapsada (72px); al pulsar el
          control ⇒ expandida (256px) con `localStorage.sidebarCollapsed = "false"`; **tras recargar
          sigue expandida** ⇒ la preferencia se guarda, se escribe solo al elegir y se respeta (RF-07).
        - **Contraste (medido, WCAG):** título de contenido **17,45:1**; etiqueta «FinApp / Panel»
          (emerald sobre crema) **4,87:1**; enlace de la navegación lateral (emerald sobre `bg-dark`)
          **3,58:1** ⇒ los dos primeros cumplen AA, el tercero **no alcanza AA para texto normal**.
          Es **preexistente y ajeno a esta spec** (en esos archivos la 009 solo cambió comentarios y
          los tokens no se tocan; la banda 768–1023 ya renderizaba esa misma navegación en HEAD `b61286a`):
          se registra como **deuda/observación de contraste del sidebar** y no se corrige aquí.
        - **Límite de la medición visual:** la petición de 375px por WebDriver se resolvió a 500px de
          ancho interno (banda móvil igualmente); la captura de **375×812 es real** y confirma móvil
          sin solape ni recorte, pero el `scrollWidth` exacto a 375px no se midió numéricamente.
        - Evidencia auxiliar (fuera del repo, no versionada): capturas en `/tmp/opencode/009/pngs/` y
          JSON de medidas en `/tmp/opencode/009/`.
    - **AC-16 (limpieza) — PASS:** grep en las fuentes del alcance → `isTablet` **0**, `esMobile`
      **0**, `drawerAbierto` **0**, `DashboardHeader` **0**, `pt-[var(--header-height)]` **0**,
      `header-height` **0**, `lg:ml-` **0**, `translate-x-full` **0**, `640` **0**, `max-width` **0**.
      Exenciones respetadas: `--header-height` sigue en `index.css` (sin diff) y el contenido de
      navegación conserva sus 3 enlaces y el recuento «4 enlaces» de su cabecera.
    - **Decisiones de la spec 009, ya implementadas:** (1) **dos versiones de vista con un único
      corte en 768px** (móvil <768 / pantallas grandes ≥768) y **sin categoría tablet**; (2) el
      **umbral de 1024px** existe **solo** como default del estado inicial de la navegación lateral
      (colapsada en 768–1023, expandida en ≥1024 sin preferencia), nunca como frontera de versión;
      (3) **contrato de 4 props** (`isMobile`, `isDesktop`, `sidebarColapsada`, `toggleSidebar`) con
      partición complementaria derivada de una sola media query y `isTablet` eliminado; (4) **contrato
      de preferencia válida**: válida ⇔ booleano tras `JSON.parse`, y se **escribe solo** al elegir
      (`toggleSidebar`), sin materializar defaults de banda; (5) **espacio de la navegación reservado
      desde 768px por estado JS** (`ml-[72px]`/`ml-64`/`ml-0`), sin prefijos de breakpoint en CSS;
      (6) **limpieza RF-15 acotada** (rama no-móvil del drawer y `esMobile`, `drawerAbierto`,
      `pt-[var(--header-height)]`), con exenciones (`index.css`/`--header-height`, `pb-20`
      incondicional, enlaces vigentes 3, `usuario` sin uso, `my-`/`text-white`/`Settings`).
    - **Deudas y pendientes registrados fuera de esta spec:** (a) **contraste 3,58:1** de los enlaces
      de la navegación lateral (preexistente, ver arriba); (b) **nombre accesible de los enlaces en
      estado colapsado** inexistente (deuda preexistente, RF-12, explícitamente fuera de alcance);
      (c) **obsolescencia de la spec 008** ya declarada en `specs/009-*/spec.md` §3 (no se anota en
      sus documentos hasta abordarla: DP-05); (d) `pb-20` incondicional en `main` (cambio de
      comportamiento no autorizado por la spec); (e) **pasada de limpieza de `index.css` /
      `--header-height`**; (f) borrado sin commitear de `.pi/agents/*.md` y `.pi/modes.config.json`,
      ajeno a esta spec y **no restaurado** (solo reportado).
    - **Inconsistencia documental (registrada, no corregida; archivo y línea exactos):**
      `AGENTS.md:6` cita `.agents/response-rules.md`; `AGENTS.md:38`, `doc/constitution.md:39` y
      `.agents/rules/rules.md:21` citan `.agents/file-header-template.md`. **Ninguna de esas dos rutas
      existe**; las reales son `.agents/skills/response-rules.md/SKILL.md` y
      `.agents/skills/file-hearder-template.md/SKILL.md` (**typo «hearder»** en el directorio).
      No se corrigió ninguno de los cuatro archivos (fuera del alcance de la spec).
      Observación adicional: el «Ejemplo — completo con crecimiento» de esa plantilla real documenta
      el **contrato viejo** del dashboard (`DashboardHeader`, tres breakpoints con Tablet,
      `drawerAbierto`, `lg:ml-*`); queda como aviso para el orquestador.
    - **Aprendizajes:** (1) para medir de verdad «sin solape» y «sin scroll horizontal» en jsdom no
      sirve nada, pero **sí un navegador headless por WebDriver**: `scrollWidth === innerWidth`,
      rectángulos de `aside`/`main` y recuento de `backdrop-filter` por `getComputedStyle` dan
      evidencia numérica reutilizable; (2) el snap de Firefox **no puede escribir en `/tmp`**:
      `--screenshot` falla en silencio y hay que apuntar la salida a `$HOME`; (3) lanzar Firefox
      headless en bucle seguido falla por bloqueo de perfil: conviene ejecutarlos **de uno en uno**;
      (4) un recuento de tests que **baja** (DashboardDrawer 31→17) es esperado cuando se retiran
      casos que validaban comportamiento eliminado (RF-15), pero hay que **explicarlo** para que no
      parezca pérdida de cobertura; (5) el contraste no lo cubre ninguna suite: medirlo con una
      pasada de `getComputedStyle` evita afirmar «contraste legible» sin dato.
    - **Validaciones:** `npm test` **PASS (21/21 archivos, 253/253 tests)**; `npm run build` **PASS**;
      AC-16/AC-18/AC-19 **PASS** (visual **ejecutado**); evidencia y utilidades temporales en
      `/tmp/opencode/009/` (fuera del repo). Procesos temporales (`vite preview`, `geckodriver`)
      detenidos; el servidor de desarrollo que el usuario tuviera abierto **no** se tocó.
      **Sin commit ni staging** (no solicitados).

---

### Spec 010 — Cierre universal de las cuatro superficies modales (finalizada, 2026-10-16)

- Cierre documental (2026-10-16, sin spec nueva, aprobado por el usuario): spec marcada como
  **finalizada (2026-10-16)** en `spec.md` (Estado + nota de cierre: aprobada en Fase 2b sin botón
  «Cerrar» al pie; validación T10 348/348 en 27 archivos, build verde, navegador 47 PASS / 0 FAIL) y
  en `tasks.md` (`**Estado:** finalizada (2026-10-16)`). Se marcó la casilla residual de la **T9**
  tras la alineación de `BottomNav.test.jsx` a los 4 controles reales (cambio pequeño **solo de
  pruebas**): el comando de T9
  `npx vitest run src/components/layout src/layout src/components/domain/modales src/hooks` queda
  **verde (`14 passed`, `238 passed`, 0 fallos, 2026-10-16)**. Se corrigió la cabecera JSDoc de
  `src/components/layout/BottomNav.jsx` a **4 controles** (3 ítems de navegación + botón «Menú»),
  sin tocar clases (incluida `grid-cols-5`), props, lógica ni texto de UI. Verificado
  `BottomNav.test.jsx` **13/13**. Sin datos sensibles.

- Spec 010, T1 completa (2026-10-16, **solo lectura**: 0 archivos de código/pruebas editados).
  **Paso 0 / línea base medida:**
  - `npm test` → **PASS: 257/257 en 22 archivos, 0 fallos** (línea base). Del último registro de
    MEMORY (spec 009 T8/T10: 253/253 en 21) hay **+4 pruebas y +1 archivo**; delta **no atribuido**
    (queda para la T10 contrastar). Archivos por resultado (todos ✓): `useReveal.test.js` (6),
    `index.css.test.js` (21), `useBreakpoint.test.js` (27), `DashboardLayout.test.jsx` (21),
    `BottomNav.test.jsx` (13), `LandingLayout.test.jsx` (3), `SidebarNavContenido.test.jsx` (17),
    `DashboardDrawer.test.jsx` (17), `ModalTarjeta.test.jsx` (11), `DashboardUserModal.test.jsx` (20),
    `SidebarResponsive.test.jsx` (32), `AcordeonTarjetas.test.jsx` (8), `Header.test.jsx` (3),
    `App.test.jsx` (11), `LogMovimientos.test.jsx` (6), `Card.test.jsx` (4), `PanelTarjetas.test.jsx`
    (12), `Hero.test.jsx` (1), `Features.test.jsx` (1), `GridTarjetas.test.jsx` (6), `main.test.jsx`
    (1), `MiTarjetaVirtual.test.jsx` (16). **Confirmado:** hoy **pasan** las dos suites que mockean
    `focus-trap-react` (`DashboardUserModal` y `DashboardDrawer`), que es justo lo que oculta que la
    trampa del menú no se crea (el mock las hace verdes).
  - `npm run build` → **PASS** (`dist/index.html` 1.11 kB; CSS 57.34 kB / gzip 9.46 kB; JS 379.52 kB /
    gzip 120.45 kB). Línea base para la T10.
  **Premisas del plan que ya NO son ciertas (reportadas, NO resueltas):**
  1. **La config de Vitest ya no está en `vite.config.js`.** El usuario **eliminó** el bloque `test`
     (`environment: "jsdom"`, `globals: true`) de `vite.config.js` (modificado sin commitear); la
     configuración real vive en un **`vitest.config.js` nuevo** (`setupFiles`, `environment: jsdom`,
     `include: ["src/**/*.test.{js,jsx}"]`, `globals: true`) y en `package.json`
     (`"vitest": { "setupFiles": ["vitest.setup.js"] }`). El plan T2/M7 solo edita `vitest.setup.js`
     (sigue vigente), pero cualquier premisa que asuma la config en `vite.config.js` es falsa.
  2. **El grep de auditoría `vi.mock("focus-trap-react")` de la T9/AC-19 da 0 aunque los mocks
     existan**: la forma real es `vi.mock("focus-trap-react", async () => {`, que no contiene el
     literal con `)` final. El grep debe ser **sin el paréntesis de cierre** (`vi.mock("focus-trap-react"`),
     que hoy devuelve **2** (`DashboardUserModal.test.jsx:32`, `DashboardDrawer.test.jsx:17`).
  3. **El grep `768` fuera de `useBreakpoint` NO da 0 hoy**: hay menciones en **comentarios/JSDoc** de
     `DashboardLayout.jsx` (`:18,24,25,68,77`) y `SidebarResponsive.jsx` (`:2,15`). AC-23 debe
     excluir comentarios. `min-width` solo aparece en `useBreakpoint.js:12,14` (OK).
  **Referencias `archivo:línea` re-verificadas (todas correctas salvo una):**
  - Correctas: X ausente en `DashboardUserModal.jsx:119-123` (el `<header>` solo tiene el `<h2>`);
    `clickDeactivates` en `DashboardUserModal.jsx:102` y `DashboardDrawer.jsx:88`; ausencia de Esc y
    de clic fuera en `AuthModal` (contenedor `:81` sin `onClick`; sin listener de teclado);
    `aria-label="Cerrar modal"` en `AuthModal.jsx:92`; `ModalTarjeta` foco a primer enfocable
    `:44-45`, `tabIndex={-1}` `:100`, Esc `:54-61`, trampa manual `:63-76`, `max-h`/`overflow` `:101`;
    `triggerRef` no pasado en `DashboardLayout.jsx:113-116`; `useBreakpoint.js:12`
    (`QUERY_PANTALLAS_GRANDES`); mock global `vitest.setup.js:5-36` (matchMedia 5-17, innerWidth 20-24,
    localStorage 27-36); mocks de trampa `DashboardUserModal.test.jsx:32-58` y
    `DashboardDrawer.test.jsx:17-53`; aserciones `DashboardUserModal.test.jsx:146-151,163-171` y
    `DashboardDrawer.test.jsx:203-215,217-231`; `ModalTarjeta.test.jsx:123-127`.
  - **Única imprecisa:** el plan/§4.3-C4 citan `AnimatePresence` como hijo directo de `FocusTrap` en
    `DashboardDrawer.jsx:93-97`; el código real es `FocusTrap` `:94-97` y `<AnimatePresence>` `:98-115`
    (el `motion.div` del panel en `:99`). El hecho (hijo directo sin `ref`) se confirma.
  - La `spec.md` §4.2 depende de `focus-trap` 7.8.0: verificado `checkPointerDown` retorna con
    `allowOutsideClick` (~`:674-677`) y `checkClick` retorna (~`:826-828`) sin tocar el evento; README
    confirma `allowOutsideClick` default `false` (`:227`) y `clickOutsideDeactivates` default `false`
    (`:216`).
  **Inventario de aserciones afectadas por D4 (foco al contenedor) y por la «X» nueva:**
  - `DashboardUserModal.test.jsx:146-151` — hoy espera `document.activeElement === btnConfig`
    («Configuración»); debe pasar a **contenedor** del diálogo.
  - `DashboardUserModal.test.jsx:163-171` — hoy espera **2** focoables, `[0]`«Configuración»,
    `[1]`«Salir del demo»; con la «X» pasa a **3** (cambia el índice del primero).
  - `DashboardUserModal.test.jsx:266-274` (**afectada por la X, no por D4**) — recorre *todos* los
    `svg` de `#dashboard-user-modal-panel` y exige `flex-shrink-0 w-6 h-6`; el aspa de `BotonCerrar`
    no tiene esas clases ⇒ **romperá** salvo que se acote el selector.
  - `DashboardDrawer.test.jsx:203-215` — hoy espera **4** focoables y `activeElement === primer enlace`;
    pasa a **5** y foco = panel.
  - `DashboardDrawer.test.jsx:217-231` — hoy espera **4** con orden `A,A,A,BUTTON`; pasa a **5** con la
    «X» (reordenar índices).
  - `DashboardDrawer.test.jsx:159-166` (**afectada por retirar el mock de la trampa**) — hoy exige
    `panel.parentElement !== document.body` y `tagName === "DIV"` (por el wrapper del mock); con la
    trampa real `focus-trap-react` no envuelve ⇒ `parentElement` será `document.body`.
  - `ModalTarjeta.test.jsx:123-127` — hoy solo aserta `dialog.contains(document.activeElement)` (pasa
    con el foco en la X); debe **reforzarse** a `document.activeElement === dialog`.
  - `PanelTarjetas.test.jsx:151,164` — retorno de foco al activador tras cerrar; **no** cambia por D4
    (se conserva), se vigila como regresión.
  - `AuthModal` — **no existe suite propia** (confirmado); la T7 la crea.
  **Nota:** `ModalTarjeta.test.jsx` vive en `src/components/` (fuera de la carpeta del componente), tal
  como registran plan/§9:1 (se edita en su sitio).
  **Validación:** re-verificación de líneas y greps **PASS**; greps vacíos hoy: `initialFocus` 0,
  `allowOutsideClick`/`clickOutsideDeactivates` 0, `displayCheck` 0. Sin cambios de código ni pruebas.

- Spec 010, T2 completa (2026-10-16): **andamiaje de geometría en el entorno de pruebas** (RF-18,
  DP-10/D1) + semilla de la suite transversal. Archivos: `vitest.setup.js` (cabecera JSDoc nueva +
  bloque `// Stub de geometría…`) y `src/components/layout/cierreDeModales.test.jsx` **(nuevo)**.
  - **Qué hace el stub:** `Element.prototype.getBoundingClientRect()` y `getClientRects()`
    devuelven un rectángulo **1×1 no vacío** **solo** cuando `this.isConnected` y jsdom no aporta
    geometría (rect vacío); los nodos **desconectados** conservan el comportamiento original, y si
    jsdom devolviera área se respeta tal cual. Sin `vi.mock` de `focus-trap-react`/`tabbable` y sin
    `displayCheck` (la librería se ejecuta **real**).
  - **Por qué (motivo real, verificado):** jsdom no calcula layout ⇒ `getClientRects()` vacío;
    `tabbable` decide visibilidad con `displayCheck: 'full'` (su defecto) por
    `node.getClientRects().length` (`tabbable/dist/index.js:421`), no encuentra nodos tabulables y
    `focus-trap` lanza al activar `Your focus-trap must have at least one container with at least
    one tabbable node in it at all times`. **Corrección de referencia:** en las suites la librería
    resuelve al **build UMD** `node_modules/focus-trap/index.js`, así que el throw observado es
    `index.js:437-438` (y `:333-334` para «needs at least one focusable element»), no el
    `dist/focus-trap.js:402-404` que citan spec §4.3-C13 y plan §2.3-M7 (ese es el equivalente ESM,
    `:485`). El hecho diagnosticado no cambia.
  - **Canario (`cierreDeModales.test.jsx`, 3 pruebas):** monta un `FocusTrap` **real** con dos
    botones dentro y un botón fuera; verifica (1) la trampa se crea y el foco queda en el primer
    botón del contenedor, (2) Tab desde el último vuelve al primero **sin** escaparse al control de
    fuera, (3) Shift+Tab desde el primero va al último sin escapar. Foco inicial esperado con
    `waitFor` porque `focus-trap` difiere el foco (`delayInitialFocus`). El archivo queda preparado
    para que la T9 añada la matriz transversal (no se inventó la matriz).
  - **Demostración del andamiaje:** con el stub **desactivado temporalmente** (setup recortado y
    restaurado después, verificado byte a byte con `cmp`) el canario **falla 3/3** con el error de
    «no tabbable node»; con el stub **pasa 3/3**. El stub quedó activo.
  - **Suite completa medida: 260/260 en 23 archivos, 0 fallos** = línea base **257/257 en 22** + las
    3 pruebas del canario y +1 archivo. **Comparación archivo por archivo: los 22 archivos de la T1
    conservan exactamente su recuento** (useReveal 6, index.css 21, useBreakpoint 27,
    DashboardLayout 21, BottomNav 13, LandingLayout 3, SidebarNavContenido 17, DashboardDrawer 17,
    ModalTarjeta 11, DashboardUserModal 20, SidebarResponsive 32, AcordeonTarjetas 8, Header 3,
    App 11, LogMovimientos 6, Card 4, PanelTarjetas 12, Hero 1, Features 1, GridTarjetas 6,
    main 1, MiTarjetaVirtual 16). **No hubo degradación ⇒ no se estrechó el stub** (no hizo falta el
    acotado a `[role="dialog"]`); solo se observaron los avisos ya conocidos en stderr (future flags
    de React Router y `Received false for a non-boolean attribute initial`), sin nuevos fallos.
  - `npm run build` **verde** y **idéntico a la línea base** (CSS 57.34 kB, JS 379.52 kB): el
    andamiaje vive fuera del bundle.
  - **Greps:** `vi.mock("focus-trap-react"` = **2** (sin cambios: `DashboardUserModal.test.jsx:32`,
    `DashboardDrawer.test.jsx:17`; su retirada es de T4/T5) y `displayCheck` = **0**. No se tocó
    `vitest.config.js`, `vite.config.js` ni `package.json` (config localizada, no revertida).
  - **Premisa observada:** `specs/010-cierre-de-modales/tasks.md` fue **editado por el usuario
    durante la sesión** (nueva regla común nº 7 y `Archivos`/paso 1 de la T2 sobre localizar la
    config); se leyó la versión vigente antes de cerrar y se marcó la T2 como hecha con los
    recuentos medidos. Sin commit ni staging.

- Spec 010, T3 completa (2026-10-16): **maquinaria común de cierre** (RF-02, RF-04, RF-06, RF-14,
  RF-16, RF-20-versión-de-vista, RF-21; AC-10/AC-12/AC-16 y defensa AC-07). Seis archivos **nuevos**
  (untracked, sin staging): `src/components/ui/BotonCerrar.jsx` + `.test.jsx`,
  `src/hooks/useCierreConEsc.js` + `.test.js`, `src/hooks/useDeslizarParaCerrar.js` + `.test.js`.
  Ninguna superficie modal ni el layout se tocaron (T4–T8).
  - **Contrato exacto — `BotonCerrar({ ariaLabel, alCerrar, className })`** · export **nombrado**
    (coherente con `ui/Card`). Renderiza `<button type="button" aria-label={ariaLabel}
    onClick={alCerrar}>` con las clases base `rounded-full p-2 focus-visible:ring-2 outline-none`
    + las de tono inyectadas por `className` (tokens claro/oscuro los elige el consumidor). Dentro,
    aspa SVG `aria-hidden` (`w-5 h-5`, mismo `path` que `ModalTarjeta.jsx:115-117`). Sin hex.
    Una pulsación ⇒ **una** llamada (verificado).
  - **Contrato exacto — `useCierreConEsc({ activo = true, zIndex = 0, alCerrar })`**: registro de
    capas **a nivel de módulo** (`capas[]`, `contadorOrden`, `listenerInstalado`) compartido por
    todas las instancias; **un único** `keydown` en `document`, instalado con la primera capa y
    retirado con la última; `Escape` cierra **solo** la superior (mayor `zIndex`; empate ⇒ mayor
    `orden` = montada más tarde); `activo:false` no registra ni instala; `alCerrar` se lee por
    **ref** (cambiar la identidad del callback no re-registra la capa). Con **doble montaje
    (StrictMode)** queda 1 capa y 1 listener y sigue habiendo **una** llamada por pulsación.
    Capas previstas: Cuenta `60`, menú `55`, `AuthModal`/`ModalTarjeta` `50` (plan §M1).
  - **Contrato exacto — `useDeslizarParaCerrar({ activo = true, refPanel, alCerrar })`**: solo actúa
    si `activo && useBreakpoint().isMobile` (corte único 768px; en ≥768px **no registra nada**).
    Eventos **de puntero nativos** `pointerdown/pointermove/pointerup/pointercancel` sobre
    `refPanel.current`, **sin** `setPointerCapture` y **sin** Framer Motion; solo el puntero
    **primario** (`isPrimary !== false`) y uno a la vez. Cierra cuando `dy >= 96px` **y**
    `|dy| > |dx| · 1.5` (vertical predominante). **No arranca** si el `pointerdown` cae en
    `button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]`, ni si el
    objetivo o sus ancestros **hasta el panel** tienen `scrollTop > 0` (no consume el scroll, CL-09).
    **No aplica `transform` ni transición** ⇒ RF-21 se cumple **por construcción** (no hay movimiento
    nuevo que inhibir). Limpia sus 4 listeners al desactivarse/desmontar.
  - **Decisiones de diseño (no cubiertas literalmente por el plan, tomadas y reportadas):**
    1. `BotonCerrar` con **export nombrado** (como `ui/Card`) y callback `alCerrar` (español,
       convención del proyecto; T8 lo cableará a `onCerrar` de `ModalTarjeta`).
    2. `alCerrar` guardado en **ref** en ambos hooks para que un callback de identidad nueva no
       re-registre la capa del registro de Esc (rompería el desempate por «montada más tarde») ni
       re-suscriba el gesto.
    3. La comprobación de scroll recorre la cadena **objetivo → ancestros → panel**, no sólo el
       `scrollTop` del panel: cumple tanto el texto de la tarea («panel con `scrollTop > 0`») como el
       plan §M6/CL-09 («ancestro desplazable más próximo dentro de él»).
    4. Decisión consciente de **no tocar ningún archivo existente** ni la config de pruebas: los tres
       hooks no se consumen aún, así que la T3 no puede romper superficies.
  - **Validación medida:**
    - Focalizadas: **33/33 PASS** — `BotonCerrar` 5, `useCierreConEsc` 10, `useDeslizarParaCerrar` 18.
      TDD: las 3 suites se escribieron antes (fallaron por «Failed to resolve import»).
    - `npm test` → **293/293 en 26 archivos, 0 fallos** (línea base **260/260 en 23**). **Contraste
      archivo por archivo: los 23 recuentos previos intactos** (diff solo añade las 3 suites nuevas).
    - `npm run build` → **verde** e **idéntico** a la línea base (CSS 57.34 kB; JS 379.52 kB): las
      piezas aún no importadas no entran al bundle.
    - Greps: `clickDeactivates` **2** (T4/T5, sin cambios), `vi.mock("focus-trap-react"` **2**
      (sin cambios), `displayCheck` **0**, `drag` en `src/` **0** (se reformuló un comentario JSDoc
      del hook nuevo para no introducir el literal y no ensuciar el grep de auditoría de T9).
    - **Validación visual: no ejecutada** (no aplica a las piezas; el gesto real se revisa en
      T4/T7/T8/T10).
  - **Nota/deuda:** `useDeslizarParaCerrar` monta `useBreakpoint` (2 listeners de `matchMedia` por
    superficie abierta), coste aceptado por la spec (plan §M8); el cierre por Esc casa con
    `evento.key === "Escape"` (navegadores modernos). Sin commit ni staging.

- Spec 010, T4 completa (2026-10-16): **`DashboardUserModal` con las cuatro formas de cierre**
  (RF-02, RF-04, RF-05, RF-06, RF-08, RF-09, RF-16, RF-22; AC-01, AC-02, AC-08, AC-12, AC-20).
  Solo dos archivos tocados: `src/components/layout/DashboardUserModal.jsx` y su `.test.jsx`.
  - **Contrato final del modal:** «X» de `BotonCerrar` (export nombrado) con `aria-label`
    **«Cerrar Cuenta»** dentro del `<header>` (junto al `<h2>` con `justify-between` ya existente),
    como **único** control visible de cierre (sin botón al pie). Panel `motion.div` con
    `id="dashboard-user-modal-panel"`, `role="dialog"`, `aria-modal="true"`,
    `aria-labelledby="user-modal-title"`, **`tabIndex={-1}`**, **`max-h-[85vh] overflow-y-auto
    outline-none`** (el cromo nuevo no deja nada inalcanzable y el contenedor no muestra anillo).
    Overlay sin cambios (guarda `event.target === event.currentTarget` conservada).
  - **Opciones reales de la trampa** (fábrica `crearOpcionesTrampa(refPanel)` en el módulo):
    `allowOutsideClick: true`, `escapeDeactivates: false`, `initialFocus: () => refPanel.current`,
    `returnFocusOnDeactivate: false`. **Eliminado** `clickDeactivates` (opción inexistente); **no**
    se usa `clickOutsideDeactivates`. Listener propio de Esc **retirado**: Esc lo cubre
    `useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar })` (capa del panel). Gesto con
    `useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar })` (solo móvil).
    Se eliminaron también los `onActivate`/`onDeactivate` no-ops que servían al retorno manual viejo.
  - **Retorno de foco encadenado (M4):** al cerrar, primer candidato **conectado** de
    `[triggerRef?.current, previousActiveElementRef.current]` (excluyendo `body`), y si ninguno,
    el control estable `document.querySelector('aside[role="navigation"] button')`.
    `previousActiveElementRef` se captura **siempre** en `useLayoutEffect` al abrir; un
    `estuvoAbiertoRef` evita devolver foco en el montaje inicial cerrado. `triggerRef` aún **no** se
    pasa desde el layout (T6): la cadena funciona con `triggerRef` ausente.
  - **Decisiones no cubiertas literalmente por el plan (tomadas y reportadas):** (1) capturar el
    foco previo **siempre** y excluir `body` de la cadena — evita enfocar `body` y cumple
    «nunca en `body`»; (2) guardas `estuvoAbiertoRef` para no robar foco al montar cerrado;
    (3) la aserción frágil de iconos se **acotó** (no se relajó) a `svg.lucide` (los dos iconos
    lucide conservan `flex-shrink-0 w-6 h-6`; el aspa de la «X» es `w-5 h-5` y queda fuera).
  - **Validación medida:**
    - Focalizada `npx vitest run src/components/layout/DashboardUserModal.test.jsx`: **falla antes**
      (mock retirado + contrato nuevo ⇒ **10 fallos / 26**) y **pasa después** (**26/26**).
    - `npm test` → **299/299 en 26 archivos, 0 fallos** (línea base **293/293**; delta = +6 de esta
      suite; **ningún recuento ajeno cambia**).
    - `npm run build` → **verde** (CSS 57.34 kB idéntico; JS 382.32 kB, +2.8 kB por las piezas nuevas).
    - Greps: `clickDeactivates` **2 → 1** (queda `DashboardDrawer.jsx:88`, T5);
      `vi.mock("focus-trap-react"` **2 → 1** (queda `DashboardDrawer.test.jsx:17`, T5);
      `displayCheck` **0**; `clickOutsideDeactivates` **0**.
    - **Revisión en navegador: EJECUTADA** (Firefox 156.0.1 headless + geckodriver 0.37.1, sobre
      `vite preview:4173`). PASS: Esc real cierra en 1024×768 y en 375×700; foco inicial en el
      **contenedor** en ambas; en ≥768 el foco al cerrar va al **avatar** (disparador); gesto de
      arrastre 180px hacia abajo sobre zona no interactiva cierra en móvil con puntero **`touch`
      y `mouse`**; un arrastre que **arranca sobre un control no cierra** (exclusión verificada).
    - **Deuda/hallazgo honesto (no aprobado):** en **móvil**, el foco al cerrar queda hoy en `body`
      porque `DashboardDrawer` (T5 pendiente) conserva su propio listener de Esc (`:35-48`) y también
      se cierra al pulsar Esc, desmontando el avatar; sin `triggerRef` (T6) no hay control estable en
      móvil (no existe `aside`). Se resolverá con T5 (mecanismo único) + T6 (`triggerRef` = botón
      «Menú», siempre montado en móvil). **No se improvisó** un sustituto dentro de T4.
  - Nota de contexto: durante la sesión apareció una edición manual del usuario en
    `src/components/layout/BottomNav.jsx` (retira el ítem «Configuración»); es DP-21, **fuera de
    alcance de T4** y no se tocó. Sin commit ni staging.

- Spec 010, T5 completa (2026-10-16): **`DashboardDrawer` con trampa real, «X» con aire superior y
  clic fuera** (RF-02, RF-05, RF-10, RF-15, RF-16, RF-22; AC-03, AC-09, AC-12, AC-20). Tarea de
  **cierre documental**: el código y la suite ya estaban escritos en el árbol de trabajo (sin
  commitear); se re-verificó el código real (DP-21) y solo se editaron `tasks.md` y este `MEMORY.md`.
- **Contrato final del menú (verificado en el código):** `AnimatePresence` **envuelve** a
  `FocusTrap` y el hijo directo es el `motion.div` del panel (con `ref={panelRef}`), de modo que la
  trampa se crea de verdad (antes el hijo directo era `AnimatePresence` y el `ref` no llegaba).
  Opciones reales vía `crearOpcionesTrampa(refPanel)`: `allowOutsideClick: true`,
  `escapeDeactivates: false`, `initialFocus: () => refPanel.current`,
  `returnFocusOnDeactivate: false`; **eliminado** `clickDeactivates`. Esc por **mecanismo único**
  `useCierreConEsc({ activo: abierto, zIndex: 55, alCerrar })` (sin listener propio). Panel
  `tabIndex={-1}` + `flex flex-col`, **`inset-y-0` conservado** (Spec 008), fila de cromo
  `flex justify-end px-4 pt-6 pb-2` con la «X» (`BotonCerrar`, `aria-label="Cerrar menú"`,
  `focus-visible:ring-mint-accent`) y contenido en `min-h-0 flex-1 overflow-y-auto pb-4`.
  **Sin** gesto de deslizar (DP-08): el hook no se importa.
- **Decisiones registradas (no cubiertas literalmente por el plan):**
  1. Envolver `AnimatePresence` alrededor de `FocusTrap` (y no al revés) es lo que hace que el
     `motion.div` sea hijo directo y la trampa se cree; el mock de `framer-motion` del test reenvía
     el `ref` para que la trampa real reciba el nodo.
  2. El clic exterior se apoya en `allowOutsideClick: true` (la trampa **sigue activa**) más la
     guarda `event.target === event.currentTarget` del backdrop; nunca `clickOutsideDeactivates`.
  3. El aire superior se da con cromo `pt-6 pb-2` + envoltorio `min-h-0 flex-1 overflow-y-auto`,
     sin perder la altura completa (`inset-y-0`) ni la desplazabilidad hasta el final.
- **Validación medida:**
  - `npx vitest run src/components/layout/DashboardDrawer.test.jsx` → **PASS: 23/23 en 1 archivo,
    0 fallos** (literal: `Test Files 1 passed (1)` / `Tests 23 passed (23)`). Sustituye el recuento
    previo de 17 de la T1/T2: la suite se reescribió con la **trampa real** (sin el mock de
    `focus-trap-react`); los +6 casos cubren hijo directo corregido, foco al contenedor, confinamiento
    por Tab, recuento/orden de focoables (5 = «X» + 3 enlaces + avatar), gesto que **no** cierra y
    estructura del cromo/envoltorio.
  - Greps en `src/`: `clickDeactivates` = **0** (heredado de T4, ya retirado también del test) y
    `vi.mock("focus-trap-react"` (sin paréntesis de cierre) = **0**. Ambos en el objetivo de T9.
  - **`npm test` (global) y `npm run build`: NO ejecutados aquí** (la regla común nº 3 de
    `tasks.md` los reserva para la T10). No se declaran verdes.
  - **Revisión en navegador [navegador] (AC-09/AC-15): no ejecutada aquí**; queda para la T10.
- **Aprendizajes / deudas:** (1) con la trampa real `focus-trap-react` **no** envuelve al hijo en
  ningún `<div>`: el `parentElement` del panel es `document.body`, y el test se reescribió a ese
  hecho sin perder la comprobación de que la trampa existe (foco inicial en el contenedor tras
  `delayInitialFocus`). (2) `initialFocus` como función que devuelve el contenedor mantiene el foco
  inicial **fuera** del ciclo de Tab (`tabindex="-1"`), coherente con D4/T8. (3) **Deuda DP-07:** la
  animación de salida (transición `x: "100%"` al cerrar) queda pendiente de revisión fina en T10;
  el desmontaje (`if (!abierto) return null`) puede impedir ver el `exit`, no se modificó aquí.
  Sin commit ni staging.

- Spec 010, T7 completa (2026-10-16): **`AuthModal` con trampa real, Esc, clic fuera, nombres
  accesibles y gesto** (RF-02, RF-04, RF-05, RF-06, RF-08, RF-11, RF-16, RF-20, RF-22; AC-04,
  AC-12, AC-22, AC-23). Dos archivos: `src/components/domain/modales/AuthModal.jsx` (editado) y
  `AuthModal.test.jsx` **(nuevo, no existía)**. Aspecto y hex heredados **intactos** (DP-03).
  - **Contrato final del modal de acceso:** capa exterior (backdrop) con `onClick={manejarClicExterior}`
    (guarda `event.target === event.currentTarget`, antes **no existía** `onClick`); dentro,
    `FocusTrap` con `crearOpcionesTrampa(panelRef)` = `allowOutsideClick: true`,
    `escapeDeactivates: false`, `initialFocus: () => panelRef.current`,
    `returnFocusOnDeactivate: false` (misma fábrica que T4/T5, sin `clickDeactivates` ni
    `clickOutsideDeactivates`). Panel `ref={panelRef}`, `role="dialog"`, `aria-modal="true"`,
    **`aria-label="Ventana de acceso"`** (antes el diálogo **no tenía nombre accesible**),
    `tabIndex={-1}`, `max-h-[85vh] overflow-y-auto outline-none`. «X» propia conservada en
    `absolute top-5 right-5` con su SVG y su tono (`text-white/50 hover:text-white p-1 rounded-lg
    transition-colors cursor-pointer`), **`aria-label` específico «Cerrar ventana de acceso»** (antes
    «Cerrar modal») y anillo de foco con tokens
    (`outline-none focus-visible:ring-2 focus-visible:ring-mint-accent`). Esc por **mecanismo único**
    `useCierreConEsc({ activo: abierto, zIndex: 50, alCerrar })`; gesto con
    `useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar })` (solo móvil).
  - **Decisiones no cubiertas literalmente por el plan (tomadas y reportadas):**
    1. **No** se reutilizó `BotonCerrar` en esta superficie: su base (`rounded-full p-2` + aspa
       `strokeWidth="2"`) habría alterado el aspecto heredado (`rounded-lg p-1`, aspa con
       `strokeLinecap/Linejoin`); la tarea autoriza conservar el `<button>` propio con el **mismo
       patrón visual**, y así se hizo (DP-03).
    2. `outline-none` en el panel (no en los controles): evita que el foco inicial pinte un anillo
       que sugiera interacción (plan §2.3-M3/CL-15, RF-16).
    3. Se reindentó (+2 espacios) el cuerpo del panel al ganar un nivel de anidamiento con
       `FocusTrap`: **ninguna** clase, texto ni lógica cambió en esas líneas.
    4. `manejarEnvio`/`fetch` y los estados del formulario **no** se tocaron (edición manual del
       usuario, DP-21).
  - **Validación medida:**
    - **TDD:** suite nueva contra el `AuthModal.jsx` actual ⇒ **14 fallos / 15** (nombre del diálogo y
      de la «X», anillo, `max-h`/`tabindex`, foco al contenedor, Esc, clic fuera, los cuatro casos del
      gesto y las dos de AC-22; el único verde era «clic dentro del panel NO cierra», trivial sin
      `onClick`). Tras implementar: `Test Files 1 passed (1)` / **`Tests 15 passed (15)`**, 0 fallos.
    - Chequeo extra de regresión (no sustituye a la T10): `npx vitest run src/App.test.jsx` → **11/11**
      (el test de `/login` monta `AuthModal` **abierto**, así que era el riesgo real de regresión).
    - **Navegador (Firefox headless + geckodriver sobre `vite --port 5199`):** en `/login`
      1024×768 y 390×744, Esc real cierra (navega a `/dashboard`) y el foco inicial **es** el panel
      (`document.activeElement === [role="dialog"]`, `overflow-y: auto`, `max-height` ≈ 85vh medido);
      en móvil, tras cerrar, el foco queda en «Abrir menú» (BottomNav). En la landing, clic en el
      backdrop cierra; gesto de **180px** hacia abajo sobre zona **no interactiva** del panel cierra en
      390×744; lo escrito (`ana@correo.com`) **persiste** al reabrir (AC-22 real).
    - **No ejecutado aquí:** `npm test` y `npm run build` completos (T10); contraste medido de la «X»
      sobre panel oscuro y límites Fluid Glass (AC-15/T10).
  - **Aprendizajes / deudas:** (1) el gesto **no** arranca si el arrastre empieza sobre la fila de
    tabs o sobre un campo (exclusión de controles), lo que obligó a repetir la prueba de navegador
    con el inicio en el padding del panel: el primer intento (inicio sobre los tabs) **no** cerró, y
    es el comportamiento esperado, no un fallo. (2) El grep de `displayCheck` en `src/` es **0**, pero
    la palabra aparece **2 veces en comentarios** de `vitest.setup.js:55,64` (prosa del stub, no
    código): conviene acotar el grep de la T9 a `src/`. (3) La deuda DP-07 (animación de salida) y el
    contraste AC-15 siguen abiertos para la T10. Sin commit ni staging.

- Spec 010, T8 completa (2026-10-16): **`ModalTarjeta` con foco inicial al contenedor y gesto en
  móvil** (RF-06, RF-12, RF-16, RF-20; AC-05, AC-10, AC-12). Dos archivos: `src/components/domain/
  modales/ModalTarjeta.jsx` (editado) y `src/components/ModalTarjeta.test.jsx` (editado **en su
  sitio**: sigue fuera de la carpeta del componente, plan §9:1).
  - **Cambios en el componente (mínimos y localizados; contenido, props `tarjeta`/`onCerrar`, «X»
    (`aria-label="Cerrar detalle de tarjeta"`), bloqueo del scroll del body y animación con
    `useReducedMotion` intactos):**
    1. **Foco inicial al contenedor:** `(primerFocoable ?? dialogo)?.focus()` → `refDialogo.current?.focus()`
    (errata del plan corregida en spec §7.1: con la «X» presente el `??` nunca caía al contenedor; el
    `tabIndex={-1}` ya existía y el selector `SELECTOR_FOCOABLES` sigue usándose **solo** en la trampa manual).
    2. **Esc:** el listener propio (`:54-61`) se retiró y pasa a
    `useCierreConEsc({ activo: Boolean(tarjeta), zIndex: 50, alCerrar: onCerrar })` (capa `50`, plan §M1).
    3. **Gesto:** `useDeslizarParaCerrar({ activo: Boolean(tarjeta), refPanel: refDialogo, alCerrar: onCerrar })`
    sobre el panel (solo móvil vía `useBreakpoint`), reutilizando las piezas de T3 sin añadirlas ni
    modificarlas.
  - **Decisiones no cubiertas literalmente por el plan (tomadas y reportadas):**
    1. `activo: Boolean(tarjeta)` (y no `tarjeta !== null`/una condición nueva): el componente
    permanece montado con `tarjeta = null`, así que los dos hooks se llaman **siempre** en el mismo
    orden (reglas de hooks) y el registro de Esc se desregistra al cerrar.
    2. **No** se sustituyó la trampa manual de Tab/Shift+Tab por `focus-trap-react`: RF-12 la obliga a
    conservar, y con el foco inicial en el contenedor (`-1`, fuera del ciclo de Tab) el primer Tab
    pasa al primer focoable por el comportamiento nativo del navegador.
    3. Se actualizaron **solo** las líneas del JSDoc que describían el contrato viejo (mecanismo de
    Esc y foco inicial); la revisión completa de cabeceras sigue siendo de la T9 (RF-19).
    4. En el test se añadió `beforeEach` que fija viewport explícito (1024px + `matchMedia`
    coherente, patrón de `AuthModal.test.jsx`) y **restaura** `useReducedMotion` a `false`: antes el
    último caso dejaba el mock en `true` para cualquier caso posterior.
  - **Validación medida:**
    - **TDD (rojo → verde):** la suite actualizada contra el componente viejo ⇒ **3 fallos / 18**
    (los dos casos de foco: `document.activeElement` era la «X», no el diálogo; y el gesto en móvil
    no cerraba). Tras implementar: `Test Files 1 passed (1)` / **`Tests 18 passed (18)`**, 0 fallos
    (línea base de esta suite: **11/11**).
    - Chequeo extra de regresión (no sustituye a la T10): `npx vitest run src/pages/PanelTarjetas.test.jsx
    src/App.test.jsx` → **23/23** (CL-11: el retorno de foco al activador de `PanelTarjetas` —con «X»
    y con Esc— se conserva).
    - **`npm test` y `npm run build`: NO ejecutados aquí** (regla común nº 3 de `tasks.md`: se reservan
    para la T10). No se declaran verdes.
    - **Navegador (Firefox headless + geckodriver por WebDriver, `vite --port 5215`,
    `/dashboard/tarjetas`): 11/11 comprobaciones PASS.** Foco inicial = contenedor en 1024×768 y
    375×700; gesto de 180px que cierra en móvil con puntero `mouse` y `touch`; gesto que no arranca
    sobre el control de flip; gesto que no existe en ≥768px; panel con `overflow-y: auto` y scroll
    real (se recorrió el log hasta el final, `scrollTop ≈ 213`, **sin** cierre involuntario); con el
    panel desplazado el arrastre **no** cierra (prioridad del scroll, CL-09); Esc real cierra en ambas
    versiones de vista. Script fuera del repo: `/tmp/opencode/010/verificar_t8.py`.
  - **Aprendizajes / deudas:** (1) `dispararPuntero` con `Event` nativo (no `PointerEvent`) basta
    porque jsdom no implementa coordenadas de `PointerEvent`; el gesto solo lee
    `clientX/clientY/isPrimary/pointerId`. (2) Para probar la exclusión de scroll hay que definir
    `scrollTop` con `Object.defineProperty` (jsdom no lo conserva al asignarlo directamente). (3) La
    deuda DP-07 (animación de salida) y el contraste AC-15 siguen abiertos para la T10. Sin commit ni
    staging.

- Spec 010, T6 completa (2026-10-16): **`DashboardLayout`: una sola superficie al abrir «Cuenta» y
  `triggerRef` estable** (RF-07, RF-08, RF-13; AC-02, AC-06, AC-08). Dos archivos: `src/layout/
  DashboardLayout.jsx` y `src/layout/DashboardLayout.test.jsx`. Sin props nuevas en
  `SidebarResponsive` (firmas intactas).
  - **Cambios exactos en el layout:**
    1. `alAbrirUserModal` pasa de `() => setUserModalAbierto(true)` a
       `() => { setMobileMenuAbierto(false); setUserModalAbierto(true); }` → **único punto de
       apertura** (plan §2.3-M9): al abrir «Cuenta» el menú superpuesto se cierra, con lo que
       desaparece el apilamiento menú (`z-55`) ↔ modal (`z-60`) y la doble superficie translúcida.
       Sirve a los **dos** disparadores (avatar del menú de móvil y avatar de la navegación lateral
       ≥768px), que comparten el mismo callback.
    2. `DashboardUserModal` recibe `triggerRef={bottomNavMenuRef}` (el mismo ref que ya usaban
       `BottomNav.menuTriggerRef` y `DashboardDrawer.triggerRef`): es el **control estable** del
       retorno de foco en móvil (botón «Menú», siempre montado); en ≥768px el ref no tiene elemento
       (`BottomNav` no se monta) y la cadena de M4 cae al control `aside[role="navigation"] button`.
       El contrato del modal (T4) **no** se tocó: ya encadenaba `triggerRef` → elemento previo →
       control estable.
  - **Decisiones no cubiertas literalmente por el plan (tomadas y reportadas):**
    1. El cierre del menú se hace **antes** de abrir el modal, en el mismo manejador y sin un
       `useEffect` de coordinación: un solo punto de apertura ⇒ no puede haber dos superficies
       (RF-07/RF-13), sin estado ni efecto nuevos.
    2. El JSDoc del layout **no** se reescribió: su `@eventos` («apertura modal usuario») sigue
       siendo cierto; la revisión completa de cabeceras es de la T9 (RF-19).
    3. En la suite se enriquecieron **solo** los dos mocks estrictamente necesarios: `BottomNav`
       ahora reenvía `menuTriggerRef` a un botón «Menú» (`aria-label="Abrir menú"`) — refleja el
       comportamiento real y permite comprobar la **identidad** del control estable — y
       `DashboardUserModal` expone `role="dialog"` cuando está abierto (se mantienen los
       `data-testid` previos, así que ninguna aserción anterior cambia).
  - **Validación medida:**
    - **TDD (rojo → verde):** casos nuevos contra el layout previo ⇒ **3 fallos / 23** («abrir Cuenta
      desde el menú» no cerraba el menú: el `dashboard-drawer` seguía presente; y `triggerRef`
      llegaba `undefined` al modal, en móvil y en ≥768px). Tras implementar:
      `npx vitest run src/layout/DashboardLayout.test.jsx` → **`Test Files 1 passed (1)` /
      `Tests 23 passed (23)`**, 0 fallos (línea base de la suite: **21/21**; +2 casos).
    - Chequeo extra de regresión (no sustituye a la T10):
      `npx vitest run src/components/layout/DashboardUserModal.test.jsx` → **26/26** (el modal real
      conserva su contrato `triggerRef`).
    - **`npm test` y `npm run build`: NO ejecutados aquí** (regla común nº 3 de `tasks.md`: se
      reservan para la T10). No se declaran verdes.
    - **Revisión en navegador: NO ejecutada aquí** (T10); queda pendiente comprobar una sola
      superficie visible y la ausencia de franja muerta de clic.
  - **Estado de la deuda de foco (heredada de T4):** el **cableado** que la resuelve queda verificado
    aquí (`triggerRef.current` **es** el botón «Menú», conectado y montado en móvil; en ≥768px es
    `null` ⇒ cadena al control lateral) y la cadena de retorno ya estaba verde en T4
    (`triggerRef` conectado → foco). **No verificado de extremo a extremo en jsdom:** esta suite
    **mockea** `DashboardUserModal`, así que `document.activeElement` tras cerrar no se mide aquí
    (exigiría desmockear el modal, fuera del alcance de la T6). Queda como **deuda para la T10**
    (medición real del foco al cerrar «Cuenta» en móvil).
  - **Hallazgo preexistente (ajeno a esta tarea, DP-21):** `npx vitest run src/layout
    src/components/layout` deja **3 fallos / 143** en `src/components/layout/BottomNav.test.jsx`
    («5 items fijos», «click en items 1-4 … Configuración», «media query landscape … 4≠5»). Los
    causa la **edición manual del usuario** en `src/components/layout/BottomNav.jsx` (retira el ítem
    «Configuración»: `items` tiene 3 entradas → 4 botones con «Menú», no 5), **no** este cambio;
    `BottomNav.test.jsx` no está en el alcance de la T6 y no se tocó. Se reporta, no se corrige.
    **Aprendizaje:** un fallo preexistente por edición manual del usuario aparece al ejecutar la
    carpeta completa aunque la suite de la tarea esté verde; hay que **atribuirlo** con `git status`
    y el código real antes de llamarlo regresión. Sin commit ni staging.

- Spec 010, T9 completa (2026-10-16): **suite transversal, auditoría de greps y cabeceras JSDoc**
  (RF-01, RF-07, RF-14, RF-19; AC-06, AC-07, AC-16, AC-18, AC-19). Archivos tocados:
  `src/components/layout/cierreDeModales.test.jsx` (de canario a suite completa) y **solo cabeceras
  JSDoc** de `src/components/ui/BotonCerrar.jsx`, `src/components/domain/modales/ModalTarjeta.jsx` y
  `src/layout/DashboardLayout.jsx`; además `specs/010-cierre-de-modales/tasks.md` (casillas de T9) y
  este `MEMORY.md`.
  - **Suite transversal (22/22 en 1 archivo).** Mantiene las 3 pruebas del canario de la T2 y añade:
    **matriz superficie × forma** (`describe.each` sobre las cuatro superficies reales) con «X»
    (dentro del panel, 1 llamada), Esc (1 llamada por pulsación) y clic fuera (con la **trampa real**,
    sin mock); **gesto ↓** en móvil (cierra en las tres de contenido y **no** en el menú, DP-08);
    **una sola superficie/trampa** por integración con el `DashboardLayout` **real** (se abre el menú
    con el botón «Menú» real del `BottomNav`, se pulsa el avatar del menú y se comprueba que el menú
    se cierra, queda **1** `role="dialog"` y el foco queda confinado por Tab en el modal); y **Esc con
    dos capas forzadas** (CL-02): capa distinta (`AuthModal` 50 + `DashboardUserModal` 60 ⇒ cierra solo
    Cuenta con 1 llamada y la segunda pulsación cierra la siguiente) y empate de capa (`AuthModal` 50
    montada antes + `ModalTarjeta` 50 montada después ⇒ gana la montada más tarde). Los anfitriones de
    los casos defensivos usan `useState` para que el cierre real desmonte la superficie y se
    **desregistre** la capa (con un `vi.fn()` que no cierra, la capa superior seguiría registrada).
  - **Mocks mínimos:** solo `framer-motion` (`motion.div` con `forwardRef`, `AnimatePresence`
    pass-through y `useReducedMotion` a `false`) y el viewport (`innerWidth` + `matchMedia`).
    **Nunca** se mockea `focus-trap-react`: la trampa se ejecuta real en las tres superficies que la
    usan (RF-18/AC-19).
  - **Señal de la suite (no medida contra el código previo, documentada):** las aserciones de la
    matriz reutilizan el mismo hecho que ya falló antes de T4–T8 — «X» ausente en Cuenta y menú
    (T4: 10 fallos; T5), Esc/clic fuera ausentes en `AuthModal` (T7: 14 fallos), gesto ausente
    (T7/T8) y apilamiento menú↔modal (T6: 3 fallos) — y ahora corren **sin el mock** de la trampa
    que ocultaba el defecto. No se ejecutó la suite contra el árbol pre-T4–T8 (requeriría revertir
    trabajo cerrado), así que la señal se documenta, no se mide.
  - **Auditoría de greps (conteo literal en `src/`):** `clickDeactivates` **0**;
    `clickOutsideDeactivates` **0**; `escapeDeactivates: true` **0**; `displayCheck` **0**
    (las **2** apariciones de la palabra viven en comentarios de prosa de `vitest.setup.js`, fuera de
    `src/` y no son código); `vi.mock("focus-trap-react"` (sin paréntesis de cierre) **0**;
    `min-width` **0** en código de producto fuera de `useBreakpoint.js` (única fuente: `:12,14`; las
    ocurrencias restantes son de archivos `*.test.*`, esperadas); `al pie` **0** (no hay botón
    «Cerrar» al pie; el único comentario «Botón Cerrar» es la «X» **superior** de `AuthModal`).
    **`768` = 17** en código de producto (todas en comentarios/JSDoc o en la fuente única
    `useBreakpoint.js`) y **35** en pruebas: **esperado**, no se fuerza a 0.
  - **Cabeceras JSDoc (RF-19).** Ninguna describe el contrato viejo. Correcciones: `BotonCerrar.jsx`
    decía que lo usaban las cuatro superficies y **es falso** (AuthModal y ModalTarjeta conservan su
    propia «X» con el mismo patrón visual, DP-03) ⇒ `@usadoPor` corregido a DashboardUserModal y
    DashboardDrawer; `ModalTarjeta.jsx` gana en `@uso`/`@eventos` el contrato de las cuatro formas,
    la «X» como único control visible y la trampa **manual** conservada; `DashboardLayout.jsx`
    documenta que abrir «Cuenta» **cierra** el menú (una sola superficie/trampa, RF-07/RF-13) y pasa
    un `triggerRef` estable (RF-08). `DashboardUserModal.jsx`, `DashboardDrawer.jsx`, `AuthModal.jsx`,
    `useCierreConEsc.js`, `useDeslizarParaCerrar.js` y `vitest.setup.js` ya estaban al contrato nuevo
    (no se editaron). Sin citar las rutas inexistentes de plantilla (`grep '.agents/'` en `src/` = 0).
  - **Validación medida:** `npx vitest run src/components/layout src/layout src/components/domain/
    modales src/hooks` → `Test Files 1 failed | 13 passed (14)` / `Tests 3 failed | 235 passed (238)`.
    Línea base del mismo comando antes de T9: `3 failed | 216 passed (219)`. Delta = **+19 pruebas**
    (esta suite: 3 → 22); los **3 fallos** son de `BottomNav.test.jsx` y **preexistentes** (véase el
    hallazgo de la T6): `BottomNav.jsx` fue editado a mano por el usuario (3 ítems ⇒ 4 botones) **no**
    por esta spec; ningún otro archivo falla ⇒ **0 fallos nuevos** atribuibles a la spec 010.
    `npm test` y `npm run build` completos **no ejecutados** aquí (regla común nº 3: reservados a la
    T10). **Revisión en navegador: no aplica** (T9 es suite + documentación).
  - **Deudas / observaciones abiertas para la T10:** (1) la suite produce avisos de React en stderr
    por el mock de `framer-motion` (`Received false for a non-boolean attribute initial`,
    `whileHover`/`whileTap`), del mismo tipo que las suites de T7/T8: no afectan al resultado.
    (2) `BottomNav.test.jsx` sigue en rojo por la edición manual (fuera de alcance; no se tocó).
    (3) Siguen abiertas la animación de salida (DP-07) y el contraste/AC-15 en navegador.
    Sin commit ni staging.

- Spec 010 — FINALIZADA (T10, 2026-10-16): **validación final medida — las cuatro superficies modales
  cierran con «X», Esc, clic fuera y gesto ↓** (RF-01…RF-21; AC-01…AC-22). Archivos tocados por la T10:
  **solo** `MEMORY.md` y `specs/010-cierre-de-modales/tasks.md` (casillas de T10); **no** se tocó código
  de producto ni de pruebas (la validación **no** destapó ningún defecto).
  - **`npm test` (literal):** `Test Files 27 passed (27)` / `Tests 348 passed (348)`, 0 fallos, 5.89 s.
    Contra la línea base de la T1 **257/257 en 22 archivos** (+3 del canario de la T2 = 260/260 en 23):
    crecimiento esperado por suites nuevas y aserciones añadidas; **ningún recuento por archivo de la
    línea base empeora** y **AC-01, AC-03, AC-06 y AC-14 dejan de fallar**. Reparto medido hoy:
    DashboardUserModal **26**, DashboardDrawer **23**, DashboardLayout **23**, ModalTarjeta **18**,
    cierreDeModales **22**, AuthModal **15** (nueva), BotonCerrar **5** (nueva), useCierreConEsc **10**
    (nueva), useDeslizarParaCerrar **18** (nueva); `BottomNav.test.jsx` (**13**) pasa: fue realineado a
    mano por el usuario a 4 controles (fuera del alcance de esta spec).
  - **`npm run build` (literal):** verde — `dist/index.html 1.11 kB (gzip 0.60)`,
    `dist/assets/index-B0_ZOIQp.css 57.49 kB (gzip 9.48)`, `dist/assets/index-CGGCbTeD.js 382.86 kB
    (gzip 122.07)`, `✓ 2030 modules transformed` / `✓ built in 1.72s`.
  - **Diff:** los cambios de **esta spec** se limitan al alcance de T1–T9 (`vitest.setup.js`,
    `cierreDeModales.test.jsx`, `BotonCerrar`, `useCierreConEsc`, `useDeslizarParaCerrar`,
    `DashboardUserModal`, `DashboardDrawer`, `DashboardLayout`, `AuthModal`, `ModalTarjeta` —fuente y
    pruebas— y cabeceras JSDoc). El árbol de trabajo contiene además **ediciones manuales del usuario
    fuera del alcance** (`.pi/agents/*` borrados, `BottomNav.jsx` + `BottomNav.test.jsx`,
    `src/config/app.config.js`, `vite.config.js`, `PENDIENTE.m`, `analicis-completo-cambios.md`,
    `specs/008-correccion-sidebar/`): se documentan, no se revierten ni se apropian.
  - **Revisión en navegador (EJECUTADA):** Firefox **158.0** headless + geckodriver **0.37.1** sobre
    `vite preview` (:4173), WebDriver por HTTP; Linux 7.0.0-38-generic. **54 comprobaciones: 47 PASS /
    0 FAIL / 7 INFO.** Viewports reales 1024×682 y 500×626 (mínimo de ventana en headless); viewports
    pequeños (320×568, 568×320, 320×300 ≈ zoom 200 %) emulados con un **iframe same-origin del tamaño
    exacto** (la ventana headless no baja de ~500 px de ancho).
    - **AC-14 (Esc):** PASS en las cuatro superficies (Cuenta/lateral, menú móvil, AuthModal en `/` y en
      `/login`, ModalTarjeta) y en las dos versiones de vista; **1 sola pulsación cierra** y el foco no
      queda en `body` (vuelve al disparador: «Abrir menú», «Colapsar navegación», etc.). Abrir «Cuenta»
      desde el menú deja **1** `role="dialog"` (el menú se cierra). **En ≥768px el menú superpuesto NO
      APLICA:** `DashboardDrawer` y `BottomNav` solo se montan en móvil (`isMobile`), así que no hay forma
      de abrirlo en escritorio (discrepancia doc↔código, ver observaciones).
    - **AC-15 (Fluid Glass):** menú abierto ⇒ **3** superficies translúcidas / **0** blobs; Cuenta (móvil
      y escritorio) ⇒ **3** / **0**; AuthModal ⇒ **1** blob. En el límite (≤3 y ≤2) y conforme. Contraste
      **real** de la «X» medido por píxeles (captura del elemento + Pillow): Cuenta **5.06:1** (panel
      claro), menú **17.17:1** (oscuro), AuthModal **5.36:1** (oscuro), ModalTarjeta **5.98:1** (claro)
      ⇒ todas ≥ **3:1** (WCAG 1.4.11, control no textual). (El cálculo por color computado se descartó:
      Firefox devuelve `oklab(...)` para los tokens Tailwind v4.)
    - **AC-09 (aire superior):** menú móvil ⇒ `panelTop 0`, «X» `top 24 / bottom 60`, primer contenido
      `top 68` ⇒ **aire superior 68 px** y sin solape con la «X».
    - **AC-10 (gesto):** el gesto ↓ **no** arranca sobre un control interactivo (flip de la tarjeta ni la
      «X»); con el panel desplazado **no** cierra (prioridad del scroll, `scrollTop 212.9`); al principio
      cierra con **touch y mouse**; en ≥768px **no existe**.
    - **AC-20 (viewports pequeños):** la «X» del menú y de Cuenta queda dentro del viewport real
      (320×568, 568×320, 320×300) y es el `elementFromPoint` de su centro; el contenido usa
      `overflow-y:auto`; Esc cierra dentro del viewport pequeño. **Aprobado con el método de iframe
      documentado** (no se pudo usar una ventana real de 320 px: Firefox headless la fija en ~500).
    - **AC-21 (`prefers-reduced-motion`):** la banda está activa en el navegador; el gesto **no** aplica
      `transform` ni añade transición; cierre por gesto **16 ms** (< 300) y apertura de ModalTarjeta
      **19 ms** ⇒ sin animación nueva.
  - **Decisiones de la spec (resumen):** (1) **piezas compartidas** `BotonCerrar` + `useCierreConEsc` +
    `useDeslizarParaCerrar` como única maquinaria de cierre (AuthModal y ModalTarjeta conservan su propia
    «X» con el mismo patrón visual, DP-03); (2) **opciones reales de `focus-trap`** —se retiraron los mocks
    de `focus-trap-react` y las opciones viejas (`clickDeactivates`, `escapeDeactivates`) y se usa
    `clickOutsideDeactivates` con la trampa **real** en jsdom gracias al **andamiaje de geometría**
    (DP-10) de `vitest.setup.js`; (3) **gesto con Pointer Events nativos** (touch + mouse), no sintético;
    (4) **abrir «Cuenta» cierra el menú** (una sola superficie/trampa, RF-07/RF-13) con `triggerRef`
    estable; (5) **aire superior** del panel del menú para que la «X» no pise el contenido.
  - **Deudas / observaciones abiertas:** (1) animación de salida de las superficies (DP-07) sigue fuera
    de alcance; (2) `src/components/ModalTarjeta.test.jsx` vive **fuera** de la carpeta de su fuente
    (`src/components/domain/modales/ModalTarjeta.jsx`); (3) deuda documental de `SidebarNavContenido.jsx`:
    JSDoc/comentario dicen **«4 enlaces»** pero hay **3**, y usa la clase inválida `my-` (`:64`) —estado
    **commiteado**, ajeno a esta spec; (4) configuración de pruebas **repartida** entre `vitest.config.js`
    (`test.setupFiles`, `environment`, `include`, `globals`) y `package.json` (`"vitest".setupFiles`),
    mientras `vite.config.js` perdió su bloque `test` por edición manual del usuario (no unificar
    unilateralmente); (5) `BottomNav.jsx` conserva JSDoc «5 items» y `grid-cols-5` con solo **4** botones
    (3 ítems + «Menú») tras la edición manual; (6) el foco móvil tras cerrar vuelve a «Abrir menú»
    (correcto), pero la deuda genérica de foco móvil del `BottomNav` sigue anotada; (7)
    `BottomNav.jsx`/`BottomNav.test.jsx` son ediciones manuales del usuario fuera del alcance. Sin commit
    ni staging.

---

### Spec 012 — Correcciones menores: medición inicial de `useBreakpoint`, clase muerta de `AuthModal` y fecha inválida en `LogMovimientos` (T1–T9 completadas 2026-10-17)

- Spec 012, **T1–T9 completadas (2026-10-17; cerrada)**. **Tres correcciones de
  producción** independientes, todas medidas:
  1. **`src/hooks/useBreakpoint.js` — fuente única del snapshot inicial** (RF-01…RF-05): el cuerpo de
     las dos funciones de medición (`medirEsDesktop`/`medirAnchoGrande`) pasa de `window.innerWidth` a
     `window.matchMedia(QUERY_PANTALLAS_GRANDES/QUERY_ANCHO_GRANDE).matches`, la **misma fuente** que la
     suscripción. Diff **4 líneas (4/4)**. Contrato **intacto**: 4 props, corte único 768px, umbral
     1024px solo como default de banda, `leerPreferencia`, efecto, `toggleSidebar` y la guarda
     `typeof window === "undefined"` ⇒ `true`. Cabecera JSDoc actualizada (`@datos`, `@estados`).
  2. **`src/components/domain/modales/AuthModal.jsx:124` — clase muerta `animate-fadeIn` retirada**
     (RF-06/RF-07): **1 línea / 1 inserción / 1 borrado**; sin animación nueva, sin migración de colores
     (hex heredados intactos); la capa exterior conserva `fixed inset-0 z-50 … bg-black/70
     backdrop-blur-sm`. Cabecera **no** tocada (RF-12 la excluye). `grep` de `fadeIn`/`fade-in`/`fade_in`
     en `src/` ⇒ **0**. El **CSS del build no cambia de tamaño** ⇒ CL-11 confirmada empíricamente.
  3. **`src/components/domain/dashboard/LogMovimientos.jsx` — `formatearFechaCorta` estricto**
     (RF-08…RF-10): `fechaISO.split("-")` sigue **primero** (conserva el `TypeError`, Q3); patrón
     **anclado** `^\d{4}-\d{2}-\d{2}$`, **mes validado (1–12)** antes de indexar `MESES_ES`, y **una
     única** constante `FECHA_NEUTRA = "—"` (**U+2014**, verificado por `codePointAt`) para **todos** los
     caminos inválidos. **Día y año no validados**: `"2026-10-99"` ⇒ `"99 oct 2026"`, `"0000-01-01"` ⇒
     `"1 ene 0"`. Sin `typeof`/`trim`/`try-catch` (AC-12 pass). Salidas válidas y resto del log
     (orden, monto, tokens, `tabular-nums`, estado vacío) **intactos**.
- **Decisiones cerradas por el usuario:** **Q1 = opción (b)** — se permite ajustar `vitest.setup.js` y
  las suites afectadas para que `matchMedia` sea **coherente con `innerWidth`**; **Q2 = opción (a)** —
  formato **estricto** `AAAA-MM-DD` (4/2/2 dígitos), **mes validado (1–12)**, **día no validado**;
  **Q3 = opción (b)** — se **mantiene el `TypeError`** de contrato (espera **cadena**, no es función
  total; **sin** guarda de tipo ni conversión).
- **Entorno de medición: una sola fórmula `matches = innerWidth >= min-width` (RF-13).**
  - **Stub global (`vitest.setup.js`):** `matches` se deriva del `innerWidth` **vigente en el momento de
    la consulta**; las consultas sin `min-width` (p. ej. `(prefers-reduced-motion: reduce)`) siguen en
    `false`; default `1024` («pantallas grandes») conservado y documentado; se añadió
    `configurable: true` (el stub sigue asignable). Suite dedicada **`src/entornoDeMedicion.test.js`**
    (nueva, 4 casos) que **no** reemplaza `window.matchMedia`. `vitest.config.js` **no** se tocó.
  - **Stub local (`src/components/layout/DashboardUserModal.test.jsx`, DP-12):** el default
    `restaurarViewportEscritorio` deja de fijar `matches: false` con `innerWidth 1024` y pasa a
    derivarlo con el **mismo criterio** que el global; se conserva el factory `mockMatchMedia` (lo usan
    los dos viewports explícitos del `describe` del gesto, que **no** cambia) y se añade **1 caso** de
    coherencia. Esta ampliación **no** viene de Q1: viene de la **coordinación con la 011** (DP-12,
    §3.4).
  - **Excepción única permitida:** el mock **deliberadamente incoherente** (`innerWidth 1024` /
    `matches:false`) vive **solo** dentro del caso AC-02 de `useBreakpoint.test.js` y **no** se propagó
    a ningún otro stub (verificado por `grep`).
- **Cifras medidas (nada declarado verde sin medirse):** línea base **T1 = 27 archivos / 348 tests
  pass**; **T2** 28/352 (la suite nueva aporta 4); **T3** 28/353; **T4** 28/355; **T5** 28/355;
  **T6** 28/373; **T7** 28/373 ⇒ **`npm test` 373/373 en 28 archivos, 0 fallos**. **Build:**
  `dist/index.html` 1.11 kB; CSS **57.49 kB** (gzip 9.48); JS **382.95 kB** (gzip 122.09). Comando
  focalizado del inventario (16 archivos): **267 (T1) → 288 (T7)**. Deltas **todos atribuidos**:
  `useBreakpoint.test.js` **27→29** (+2 de AC-01/AC-02), `LogMovimientos.test.jsx` **6→24** (+7 AC-06 /
  +11 AC-07), `DashboardUserModal.test.jsx` **26→27** (+1 de AC-13) y `AuthModal.test.jsx` **15→15**
  (0 casos, AC-05/DP-06); las **13 suites restantes** del inventario conservan su recuento exacto.
- **Orden clave: la 012 va PRIMERO; la 011 NO se toca y se re-mide DESPUÉS** contra este estado (§3.4
  de la spec, DP-12; §10 de la 011). `specs/011-*` y `specs/010-*` quedaron **sin tocar**.
- **Auditoría de alcance (T8, AC-10):** `git diff --stat` de código/pruebas = **7 archivos modificados
  + 1 nuevo (+180 / −26)**, todos de §3.1 del plan (`useBreakpoint.js` + su test, `AuthModal.jsx`,
  `LogMovimientos.jsx` + su test, `vitest.setup.js`, `DashboardUserModal.test.jsx` y el nuevo
  `entornoDeMedicion.test.js`). Cabeceras JSDoc actualizadas **solo** en `useBreakpoint.js` y
  `LogMovimientos.jsx` (siguiendo la plantilla **real**
  `.agents/skills/file-hearder-template.md/SKILL.md`); **`AuthModal.jsx` excluido** (su cabecera no se
  toca). `grep` de `fadeIn` en `src/` ⇒ **0**; **0 hexadecimales nuevos** en las líneas añadidas del
  diff; **`package.json` sin cambios**. **Excepciones ajenas a la 012** (preexistentes, reportadas y
  **no** tocadas): borrados en `.pi/agents/*.md` (4) y `.pi/modes.config.json`, `M vite.config.js` (el
  usuario retiró el bloque `test`; la config vive en `vitest.config.js`) y `?? analicis-completo-cambios.md`.
- **AC-04 (sin `window`) reportado «no ejecutado»** (jsdom siempre tiene `window`), **nunca verde**.
  **Validación visual: no aplicable / no declarada como realizada** (la clase retirada no generaba
  reglas y el efecto de la corrección (1) solo sería observable en el borde de 768px).
- **T9 — validación final (2026-10-17, solo medición y reporte):** `npm test` **28 archivos / 373 tests
  — pass (0 fallos)**; `npm run build` **verde** con los **mismos tamaños** que T6–T8
  (`index.html` 1.11 kB; CSS 57.49 kB / gzip 9.48; JS 382.95 kB / gzip 122.09); **comando focalizado del
  inventario 16 archivos / 288 tests — pass (0 fallos)**, idéntico a T7 (267 T1 → 288 T9). Atribución
  `+21 = +2` (hook) `+18` (helper) `+1` (modal de cuenta); las 13 suites restantes conservan recuento.
  La línea base T1 (`27/348`) pasa a `28/373` (+1 archivo de la suite nueva `entornoDeMedicion.test.js`,
  +25 tests), sin que ninguna suite empeore. **AC-04: no ejecutado.** **Coordinación pendiente:** la
  **011** se re-mide **después** contra este estado (medición única + entorno coherente); **la 011 no se
  ha tocado** (`specs/011-*` sin seguimiento, sin modificar; `specs/010-*` sin cambios).
- Sin dependencias nuevas, sin hexadecimales, sin animaciones, nombres en español, sin `git add -A`,
  **sin commit ni staging** (hasta el cierre). Sin datos sensibles.
- **Cierre de la spec 012 (2026-10-17, tras la validación del reviewer: APROBADO «OK»).** Dos ajustes
  **aditivos** de pruebas, dentro de casos ya existentes y sin cambiar ningún aserto previo: (a) **AC-01**
  mide también **800px** (375 / **800** / 1200, como pide su fila) ⇒ `isMobile: false`, `isDesktop: true`,
  `sidebarColapsada: true`; (b) **AC-02** añade `expect(registros).toHaveLength(1)` (ata RF-02: una
  **sola** composición; con el defecto previo eran dos). La suite sigue en **29** casos y el global en
  **28 archivos / 373 tests**: re-validado **29/29**, **373/373** y **build verde**
  (CSS 57.49 kB / gzip 9.48; JS **382.97 kB** / gzip 122.09 — el +0.02 kB frente a T9 viene del commit
  **ajeno** `54d2a6a` «feat: add padding to dashboard sections…» que el usuario creó entre T9 y el
  cierre y que **ya incluyó** `vitest.setup.js` (T2) y `vite.config.js`; ningún archivo de producción de
  la 012 cambió después de T9). **Commit** «fix: corrige la fuente de medición, la clase muerta y la
  fecha inválida (spec 012)» con rutas **explícitas** (sin `git add -A` y sin `push`), que deja la 012
  commiteada y **`specs/011-*` / `specs/010-*` sin tocar**.



