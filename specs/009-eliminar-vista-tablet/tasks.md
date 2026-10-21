# Tasks 009 — Eliminar la versión tablet: dos versiones de vista

**Estado:** borrador
**Plan base:** `specs/009-eliminar-vista-tablet/plan.md` (spec aprobada 2026-10-16)
**Máx. 10 tareas** — orden de ejecución; cada tarea declara los RF que cubre y criterios verificables.

> **Regla común a todas las tareas**
> 1. **Paso 0 obligatorio:** re-leer el código real de cada archivo antes de editarlo. Si un artefacto
>    que el plan espera ya no existe, se registra como «ya no aplicable» (CL-10), no se recrea.
> 2. **Sin reformateos ni líneas ajenas:** cambios mínimos y localizados (el usuario edita a mano en
>    paralelo).
> 3. **Validación:** al cerrar la tarea se ejecuta la prueba indicada y se reporta
>    **pass / fail / no ejecutado** contra la **línea base** de la Tarea 1. Lo que no se pueda
>    verificar todavía se marca «pendiente de la validación diferida» (sin duplicar registros).
>    **No se declara verde ninguna suite que hoy esté en rojo.** AC-17 (rutas) sí es ejecutable antes.
> 4. **DP-06 (ajuste de pruebas, no de fuente):** las suites que cuentan **4 enlaces** de navegación
>    lateral (y **5** elementos enfocables) se corrigen a **3** (y **4**), sin modificar el código de
>    la navegación. Configuración **no** se restituye en el sidebar: se alcanza desde el
>    modal/banner del perfil (`DashboardUserModal`, sin cambios). Estas suites deben quedar **verdes**
>    al cerrar las tareas 3 y 5.

---

## Tarea 1 — Paso 0: línea base de la suite y reconocimiento del estado real ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** — (medición previa; habilita la atribución de AC-18)
**Archivos:** ninguno (no se edita código; salida en el informe de la tarea)

> **Resultado (solo lectura, ningún archivo de código editado):** línea base = **236 tests en
> 21 archivos: 226 pass / 10 fail**; 4 archivos con fallos. `DashboardLayout.test.jsx` no
> compila (import `../components/layout/DashboardHeader`, borrado en `b61286a`). Los 10 fallos
> de aserción (en `DashboardDrawer`, `SidebarNavContenido`, `SidebarResponsive`) son
> **preexistentes** y comparten causa: las suites esperan **4 enlaces** y el código tiene **3**.
> Según la decisión **DP-06**, su corrección (solo aserciones, sin tocar la fuente) queda asignada
> a las tareas 3 y 5 de esta spec. `src/` está limpio: las ediciones manuales del dashboard ya
> están en `b61286a`, no «sin commitear» como decía el plan (ya corregido). AC-17 baseline:
> `App.test.jsx` **PASS 10/10**. Detalle completo en el informe de la tarea y en `MEMORY.md`
> (sección Spec 009).

**Paso 0:** reconocer el árbol real antes de medir.

**Pasos:**
1. `git status --short` y `git diff --stat` para inventariar el trabajo en curso del usuario; anotar
   qué archivos del alcance están ya modificados.
2. `npm test` completo y registrar el resultado **archivo por archivo** (pass/fail) y la lista de
   fallos con su causa aparente. Registrar explícitamente que `src/layout/DashboardLayout.test.jsx`
   no compila por importar `../components/layout/DashboardHeader` (módulo inexistente).
3. Foto de referencias actuales en `src/`: `isTablet`, `esMobile`, `drawerAbierto`,
   `DashboardHeader`, `pt-[var(--header-height)]`, `lg:ml-`, `640`.
4. Inventario de artefactos RF-15 **presentes o ausentes hoy** (rama no-móvil del drawer, estado de
   tablet en el layout, padding superior sobrante, altura restada).
5. Anotar la observación de desalineación de `MEMORY.md` (`273/273`) frente a lo medido.

**Hecho cuando:**
- [x] Existe un registro con el **resultado de `npm test` archivo por archivo** y la lista de fallos preexistentes
- [x] Está registrada la **línea base** como referencia de atribución para AC-18
- [x] Está inventariado qué archivos del alcance el usuario ya modificó (para coordinar)
- [x] Está registrado el inventario de artefactos RF-15 presentes/ausentes
- [x] **No se ha editado ningún archivo de código** en esta tarea

**Prueba:** `npm test` (reporte literal: sin declarar verde nada de lo que falle).
**Resultado T1:** `npx vitest run` → 236 tests / 21 archivos; 226 pass, 10 fail (4 archivos).
`npm run build` no ejecutado (T1 es medición). Validación diferida pendiente del aviso del usuario.

---

## Tarea 2 — `useBreakpoint`: dos versiones, 4 props, defaults por banda y contrato de preferencia ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** RF-01, RF-02, RF-06, RF-07, RF-11
**Archivos:** `src/hooks/useBreakpoint.js`, `src/hooks/useBreakpoint.test.js`

**Paso 0:** leer el hook y su test actuales y confirmar las queries y el `useEffect` de persistencia.

**Pasos (mecanismos M1 y M2 del plan §2.3):**
1. Versión de vista con **una única** media query `(min-width: 768px)`: `isDesktop = matches`,
   `isMobile = !isDesktop`; inicial desde `window.innerWidth >= 768`; sin `window` ⇒ `isDesktop = true`.
   Eliminar `mqMobile`, `mqTablet` y el flag `isTablet`. Cleanup de listeners en unmount.
2. Estado por defecto: `preferencia` (`boolean | null`) + `anchoGrande` (query `(min-width: 1024px)`
   con listener). `sidebarColapsada = preferencia !== null ? preferencia : !anchoGrande`.
3. Contrato de preferencia válida: `JSON.parse(localStorage.getItem("sidebarCollapsed"))` en
   `try/catch`; válida ⇔ `typeof === "boolean"`; `null`/otro tipo/error ⇒ sin preferencia.
4. **Quitar el `useEffect` que persiste el estado en cada cambio**; escribir **solo** dentro de
   `toggleSidebar` (`siguiente = !sidebarColapsada`, `setPreferencia`, `setItem`).
5. Actualizar la cabecera JSDoc (contrato de 4 props; rol distinto de 768px y 1024px).

**Hecho cuando:**
- [x] `Object.keys(...)` devuelve exactamente `isDesktop, isMobile, sidebarColapsada, toggleSidebar`
- [x] `isTablet` no existe y no hay ninguna query de la banda 640–1023px
- [x] Para 767 / 767,5 / 768 / 800 / 1023 / 1024 / 1440 se cumple `isMobile === !isDesktop` (**exactamente uno** activo)
- [x] Sin preferencia válida: **colapsada** en 768–1023px y **expandida** en ≥1024px
- [x] Preferencia válida manda en cualquier banda y se restaura al montar
- [x] `null`, `"null"`, `"1"` y JSON corrupto ⇒ sin preferencia (el default de banda se aplica; `null` **no** es «expandida»)
- [x] Montar el hook **no** escribe en `localStorage`; `toggleSidebar` **sí** escribe el valor elegido
- [x] Cruzar 1200px→800px por `change` sin preferencia ⇒ colapsada y **sin** escrituras
- [x] Listeners de **ambas** queries registrados y eliminados en unmount; patrón SSR sin `window` intacto

**Prueba:** `npx vitest run src/hooks/useBreakpoint.test.js`
**Resultado T2:** ✅ **pass — 27/27** (línea base del archivo: 17/17). TDD: la nueva prueba se
ejecutó primero contra el hook de HEAD en un worktree temporal (ya eliminado) → 20 fallos / 7
pass por el contrato viejo. Informativo (no cierre): `npx vitest run src/App.test.jsx
src/components/layout src/layout/DashboardLayout.test.jsx` → `App.test.jsx` 10/10 pass y el
**mismo perfil de 10 fallos preexistentes** de la línea base; sin regresiones atribuibles a T2.
`npm test` y `npm run build` completos **no ejecutados** (validación diferida, T8). Validación
visual **no ejecutada** (sin navegador).

---

## Tarea 3 — `DashboardDrawer`: rama móvil incondicional y retirada de `esMobile` ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** RF-04, RF-15
**Archivos:** `src/components/layout/DashboardDrawer.jsx`, `src/components/layout/DashboardDrawer.test.jsx`

**Paso 0:** leer el drawer y su test; confirmar si `esMobile` y la rama no-móvil siguen existiendo.

**Pasos:**
1. Retirar la prop `esMobile` y **toda** la rama no-móvil (`panelContent` sin backdrop, panel
   `left-0 top-[var(--header-height)] h-[calc(100vh-...)]`, `translate-x-full`, etc.). La rama
   móvil pasa a ser la única e incondicional.
2. Retirar el código que quede **colgando** por esa retirada (p. ej. una constante de panel que ya
   no se usa). **No** rehacer el panel duplicado ni la animación de salida: son exención explícita
   de RF-15.
3. Contrato final: `{ abierto, alCerrar, children, triggerRef }`.
4. Cabecera JSDoc: sin mención a tablet ni a `esMobile`.
5. En el test: retirar los casos `esMobile=false` / «tablet»; conservar y reforzar los de la rama
   móvil (portal, backdrop, ESC, click en backdrop, focus trap, `role="dialog"`,
   `aria-label="Menú de navegación"`, retorno de foco a `triggerRef`), sin la prop.
6. **Ajustar los conteos desfasados de la suite (DP-06, plan §2.3-M5) sin tocar la fuente:** los
   enlaces del panel pasan de **4 a 3** y los elementos enfocables de **5 a 4** (3 enlaces + botón
   de avatar). Son los 5 fallos de la línea base en este archivo. **No** se restituye el enlace de
   Configuración en la navegación: la sección se alcanza desde el modal/banner del perfil
   (`DashboardUserModal`, sin cambios).

**Hecho cuando:**
- [x] El componente **no** bifurca por modo y no acepta `esMobile`
- [x] No queda ninguna referencia a `[var(--header-height)]` ni a la rama de tablet en el archivo
- [x] Se mantienen portal, backdrop con click, cierre con ESC, focus trap y retorno de foco
- [x] El test ya no menciona `esMobile` ni la composición tablet, y **pasa íntegro** (0 fallos)
- [x] Conteos corregidos a **3 enlaces** y **4 enfocables**, sin tocar el código fuente
- [x] Sin cambios en la animación ni en el panel móvil más allá de retirar la rama eliminada

**Prueba:** `npx vitest run src/components/layout/DashboardDrawer.test.jsx` → **verde** (los 5 fallos de la línea base quedan resueltos).
**Resultado T3:** ✅ **pass — 17/17** (línea base del archivo: 26/31 con 5 fallos de conteo). TDD: el
test reescrito (sin `esMobile`, sin casos tablet, conteos 3/4) se ejecutó primero contra el componente
de HEAD → **5 fallos / 12 pass**: exactamente los cinco que dependen de la rama móvil
(backdrop ausente, `inset-y-0` ausente, `border-l`, `z-55`, `aria-label` «Navegación del dashboard» en
vez de «Menú de navegación»). Verde tras retirar la prop y la rama no-móvil.
Cambios: `DashboardDrawer.jsx` de 170 → 132 líneas (fuera la prop `esMobile`, la rama `if (!esMobile)`
con `top-[var(--header-height)] h-[calc(100vh-var(--header-height))]`, la constante `panelContent` que
quedaba colgando y el `id` repetido; la rama móvil es ahora la única e incondicional, con su
`AnimatePresence`/`motion.div` intactos). El test baja de 31 a **17 casos** al retirar los 14 de
`esMobile=false`/duplicados por modo (exención de RF-15: lo que validaba lo eliminado se retira).
`esMobile` solo permanece en `src/layout/DashboardLayout.jsx` (línea 129) y su test: es **T4**; la prop
de más no rompe nada (el componente ya no la lee). `npm test` y `npm run build` completos **no
ejecutados** (validación diferida, T8). Validación visual **no ejecutada** (sin navegador; sin
composición visual nueva). Sin commit ni staging.

---

## Tarea 4 — `DashboardLayout`: composición de dos versiones, margen desde 768px y estados ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** RF-03, RF-04, RF-05, RF-08, RF-09, RF-15
**Archivos:** `src/layout/DashboardLayout.jsx`, `src/layout/DashboardLayout.test.jsx`

**Paso 0:** leer el layout y su test; confirmar qué ramas y estados siguen presentes hoy.
**Dependencia:** Tareas 2 y 3 cerradas.

**Pasos:**
1. Destructuring con 4 props (sin `isTablet`); un solo bloque de navegación lateral bajo
   `esDesktop`; retirada del estado `drawerAbierto` y de los efectos ligados a tablet.
2. Margen del área principal **sin prefijo de breakpoint** (plan §2.3-M3):
   `esDesktop ? (sidebarColapsada ? "ml-[72px]" : "ml-64") : "ml-0"` (se retira `lg:ml-*`).
3. `main`: retirar `pt-[var(--header-height)]` (header inexistente). **Conservar** `pb-20`.
4. Drawer de móvil: pasar solo `abierto`, `alCerrar`, `triggerRef`, `children` (sin `esMobile`);
   conservar el efecto que lo cierra al salir de móvil.
5. Recomposición al cruzar el corte (plan §2.3-M4): al pasar a pantallas grandes con el menú
   abierto, cerrarlo y **trasladar el foco** al control de la navegación lateral (`aside[role="navigation"] button`).
6. Cabecera JSDoc: dos versiones de vista, composición por rango, margen desde 768px; sin
   `DashboardHeader` ni tablet.
7. Reescribir `DashboardLayout.test.jsx`: sin el import/mock de `DashboardHeader` (hoy no compila),
   mock de `useBreakpoint` con 4 props y casos de 768/800/1023/1024/1440 y 375/700/767 con margen,
   `SidebarResponsive`, `BottomNav`, drawer, modal y `main` sin padding superior.

**Hecho cuando:**
- [x] En 768/800/1023px: navegación lateral presente y `colapsada=true`, sin composición tablet, sin `BottomNav`, margen `ml-[72px]`
- [x] En 1024/1440px: navegación lateral `colapsada=false`, margen `ml-64`
- [x] En 375/700/767px: `BottomNav` + drawer de menú, sin navegación lateral permanente, margen `ml-0`
- [x] El drawer recibe `abierto/alCerrar/children/triggerRef` y **no** `esMobile`
- [x] `main` **no** tiene `pt-[var(--header-height)]` y conserva `pb-20`
- [x] No existen `isTablet`, `drawerAbierto` ni import de `DashboardHeader` en el layout
- [x] El test del layout compila y **pasa** (0 fallos; en la línea base no compilaba), o sus fallos se atribuyen y registran contra la línea base
- [x] AC-10 (traslado de foco) verificado por test si es estable; si no, anotado para la revisión manual

**Prueba:** `npx vitest run src/layout/DashboardLayout.test.jsx`
**Resultado T4:** ✅ **pass — 21/21** (línea base del archivo: **no compilaba** por importar `DashboardHeader`).
TDD: el test reescrito se ejecutó primero contra el layout de HEAD → **15 fallos / 6 pass** (margen `lg:ml-*`,
`pt-[var(--header-height)]`, rama tablet, `esMobile`, sin traslado de foco). Verde tras implementar.
Cambios: destructuring de 4 props (sin `isTablet`); un único bloque `SidebarResponsive` bajo `isDesktop`;
retirada de `drawerAbierto` y de sus dos efectos; margen sin prefijo `esDesktop ? (sidebarColapsada ?
"ml-[72px]" : "ml-64") : "ml-0"`; `main` solo con `pb-20`; drawer de móvil sin `esMobile` (solo
`abierto/alCerrar/triggerRef/children`); efecto de recomposición que al salir de móvil cierra el menú y
traslada el foco a `aside[role="navigation"] button` (**AC-10 verificado por test estable en jsdom**);
cabecera JSDoc sin tablet/header. Exenciones respetadas: `getUsuarioMock`/`usuario` intactos, `--header-height`
y `index.css` sin tocar, `pb-20` incondicional.
Informativo (no cierre): `npx vitest run src/App.test.jsx src/components/layout/BottomNav.test.jsx` → **23/23 pass**
(10 + 13), sin regresiones. `npx vitest run` global: **5 fallos / 248 pass (253 tests, 21 archivos)**; los 5
fallos son los preexistentes de conteo de enlaces de `SidebarNavContenido.test.jsx` (2) y
`SidebarResponsive.test.jsx` (3), **asignados a la Tarea 5** (DP-06); ninguno nuevo atribuible a T4.
`npm test` y `npm run build` completos **no ejecutados** (validación diferida, T8). Validación visual **no
ejecutada** (sin navegador). Sin commit ni staging.

---

## Tarea 5 — Pruebas de los demás componentes de layout del dashboard ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** RF-03, RF-04, RF-05, RF-08, RF-12
**Archivos:** `src/components/layout/SidebarResponsive.test.jsx`, `BottomNav.test.jsx`,
`SidebarNavContenido.test.jsx`, `DashboardUserModal.test.jsx` (**solo si fallan por esta spec**), y
las cabeceras de `SidebarResponsive.jsx`/`BottomNav.jsx` si aún describen tres bandas

**Paso 0:** leer cada componente y su test; anotar cuáles fallan ya en la línea base.

**Pasos:**
1. Ejecutar las suites y comparar con la línea base: `SidebarNavContenido.test.jsx` (**2 fallos**) y
   `SidebarResponsive.test.jsx` (**3 fallos**) caen por el mismo desfase; `BottomNav.test.jsx` y
   `DashboardUserModal.test.jsx` **pasan** (no se tocan salvo que el cambio de ámbito los rompa).
2. Ajustar los conteos de enlaces/iconos de navegación lateral de **4 a 3** en
   `SidebarNavContenido.test.jsx` y `SidebarResponsive.test.jsx` (DP-06), **sin tocar el componente**.
3. **Sin cambios de firma** y sin tocar el conjunto de enlaces (3 laterales; 4 + «Menú» en la
   navegación inferior), sin tocar `my-`, `text-white` ni el import `Settings`, sin corregir el
   recuento de enlaces de la cabecera JSDoc.
4. Confirmar que `DashboardUserModal` sigue siendo la vía de acceso a Configuración en pantallas
   grandes y que **no se modifica**.

**Hecho cuando:**
- [x] `SidebarNavContenido.test.jsx` y `SidebarResponsive.test.jsx` **verdes** (5 fallos de la línea base resueltos), solo con cambios de aserciones
- [x] `BottomNav.test.jsx` (4 + «Menú») y `DashboardUserModal.test.jsx` siguen verdes y sin cambios
- [x] No se ha cambiado ninguna firma de props ni el conjunto de enlaces
- [x] No se ha «corregido» el recuento de enlaces de ninguna cabecera JSDoc
- [x] Cualquier fallo ajeno a esta spec queda registrado como preexistente

**Prueba:** `npx vitest run src/components/layout` → todas verdes (o reporte pass/fail contra la línea base).
**Resultado T5:** ✅ **pass — 49/49** en las dos suites del alcance
(`SidebarNavContenido.test.jsx` 17/17; `SidebarResponsive.test.jsx` 32/32), frente a la línea base de
**44 pass / 5 fail** en esos mismos archivos. **Solo pruebas; cero cambios en código fuente.**
Cambios (DP-06/M5): conteos 4→3 en `getAllByRole("link")` (2 casos), en los iconos de navegación
(`SidebarNavContenido` `a svg` y `SidebarResponsive` `a[href^='/dashboard'] svg`) y el piso de iconos
decorativos `toBeGreaterThanOrEqual(4)`→`(3)`; títulos de los dos casos de recuento actualizados a «3».
**Casos de «Configuración» resueltos en el sentido de DP-06:** los tres asertos que exigían el enlace
lateral a Configuración (`getByRole("link", {name:/Configuración/i})` + `href` + `svg.lucide-settings`)
en `SidebarNavContenido.test.jsx` (~L50-54) y `SidebarResponsive.test.jsx` (~L136-139) se **eliminan**,
dejando constancia del conjunto vigente en el título/comentario («3 NavLink»/«3 enlaces (conjunto
vigente de la navegación lateral)»). **No se restituye el enlace en la fuente**; Configuración sigue
alcanzándose desde `DashboardUserModal` (verificado: `navigate("/dashboard/configuracion")`, archivo
sin cambios). Informativo (no cierre): `npx vitest run src/components/layout` → **102/102 pass en 6
archivos**, con `BottomNav.test.jsx` (13) y `DashboardUserModal.test.jsx` (20) intactos.
`npm test` y `npm run build` completos **no ejecutados** (validación diferida, T8). Validación visual
**no ejecutada** (cambio solo de pruebas). Sin commit ni staging.

---

## Tarea 6 — Cabeceras JSDoc del alcance e inconsistencias documentales ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** RF-15
**Archivos:** cabeceras de `src/hooks/useBreakpoint.js`, `src/layout/DashboardLayout.jsx`,
`src/components/layout/DashboardDrawer.jsx`, `SidebarResponsive.jsx`, `BottomNav.jsx`,
`SidebarNavContenido.jsx`

**Paso 0:** leer las cabeceras actuales; comprobar que las de las tareas 2–4 ya quedaron sin tablet.

**Pasos:**
1. Actualizar las cabeceras restantes para que dejen de documentar la banda tablet y el flag
   eliminado (contrato de 4 props, dos versiones, ámbito por versión, `usadoPor` real).
2. **Avisar de la inconsistencia de `AGENTS.md`** (cita `.agents/response-rules.md` y
   `.agents/file-header-template.md`, que no existen; la real es
   `.agents/skills/file-hearder-template.md/SKILL.md`) **antes** de seguir esa convención.
3. Registrar como observación, sin corregirlo: la cabecera de `SidebarNavContenido.jsx` dice «4
   enlaces» y hay 3.

**Hecho cuando:**
- [x] Ninguna cabecera del alcance menciona la banda tablet, `isTablet` ni `esMobile`
- [x] `useBreakpoint.js` documenta el contrato de 4 props y el rol distinto de 768px y 1024px
- [x] `SidebarNavContenido.jsx`: recuento de enlaces **intacto** y observación registrada
- [x] La inconsistencia de `AGENTS.md` está comunicada y registrada
- [x] Solo han cambiado comentarios/cabeceras: ningún cambio funcional

**Prueba:** `npx vitest run src/hooks/useBreakpoint.test.js src/layout/DashboardLayout.test.jsx`
**Resultado T6:** ✅ **pass — 160/160 en 9 archivos** con
`npx vitest run src/hooks/useBreakpoint.test.js src/layout/DashboardLayout.test.jsx
src/components/layout src/App.test.jsx` (27 + 21 + 102 + 10; informativo además del par de la tarea),
sin regresiones. **Paso 0 (re-lectura):** `git status --short` mostró solo los cambios aún sin
commitear de T2–T5 (`useBreakpoint*`, `DashboardDrawer*`, `DashboardLayout*`,
`SidebarNavContenido.test.jsx`, `SidebarResponsive.test.jsx`, `MEMORY.md`); se editaron **solo
cabeceras/comentarios** de 4 archivos, diffs mínimos (4 líneas). Barrido del contrato viejo por grep
antes y después: `tablet`/`isTablet`/`esMobile`/`DashboardHeader`/`header-height`/`drawerAbierto`/
`lg:ml-`/`escritorio`/`desktop`/`640`/`tres bandas` → **0 resultados** en las cabeceras del alcance
tras la edición (antes: `DashboardLayout.jsx:25` «Sin versión tablet» y
`SidebarNavContenido.jsx:7` «DashboardDrawer (tablet)»).
Cambios (solo comentarios/cabeceras, cero cambios funcionales):
`DashboardLayout.jsx` «Sin versión tablet.» → «Sin categoría intermedia.»;
`SidebarNavContenido.jsx` `@usadoPor` con el rol tablet → `SidebarResponsive (colapsada/expandida),
DashboardDrawer (menú superpuesto de móvil)`;
`BottomNav.jsx` `@usadoPor DashboardLayout (futuro), vistas mobile del dashboard` → `DashboardLayout
(navegación inferior de móvil)` (`usadoPor` real);
`SidebarResponsive.jsx` «Sidebar desktop» → «Navegación lateral permanente/fija de pantallas
grandes (≥768px)» en `@uso` y en la descripción (ámbito por versión; plan §1).
**Sin cambios (revisados):** `useBreakpoint.js` (T2 ya documenta 4 props y el rol de 768/1024),
`DashboardDrawer.jsx` (T3), `DashboardUserModal.jsx` (`@usadoPor DashboardLayout (global, portal)`
real). **RF-15 respetado:** el recuento «4 enlaces» de `SidebarNavContenido.jsx`
(`@uso`/`@datos`/comentario «4 enlaces») queda **intacto** y se registra como observación, igual
que el `@datos enlaces fijos (4)` de `SidebarResponsive.jsx`; tampoco se tocaron enlaces, firma,
`index.css`, `--header-height`, landing, panel de tarjetas, `App.jsx` ni `vitest.setup.js`.
`npm test` y `npm run build` completos **no ejecutados** (validación diferida, T8). Validación visual
**no ejecutada** (solo comentarios). Sin commit ni staging.

---

## Tarea 7 — Auditoría ejecutable: referencias colgantes, umbrales y rutas (AC-15, AC-17) ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** RF-13, RF-15 (verificación); **no se aplaza**
**Archivos:** ninguno (verificación); solo se corrige si la auditoría encuentra un resto de la Tarea 3/4

**Paso 0:** partir del inventario de la Tarea 1 y comparar con el estado tras las tareas 2–6.

**Pasos:**
1. Greps de referencias colgantes en los archivos del alcance: `isTablet`, `esMobile`,
   `drawerAbierto`, `DashboardHeader`, `pt-[var(--header-height)]`, `lg:ml-`, `640`.
2. Comprobar que el 1024px **solo** aparece como umbral del estado por defecto (hook) y que no hay
   reglas que asignen 768–1023px a una versión tablet (AC-15).
3. Ejecutar `src/App.test.jsx` (AC-17) y registrar el resultado contra la línea base.

**Hecho cuando:**
- [x] Greps sin resultados en los archivos del alcance (`isTablet`, `esMobile`, `drawerAbierto`, `DashboardHeader`, `pt-[var(--header-height)]`, `lg:ml-` en el layout)
- [x] `640` no aparece como corte de versión de vista en el alcance
- [x] Único umbral de versión documentado/codificado: 768px; 1024px solo como default del estado
- [x] `npx vitest run src/App.test.jsx` reportado pass/fail contra la línea base (AC-17, **no** pendiente)

**Prueba:** `npx vitest run src/App.test.jsx` + los greps anteriores
**Resultado T7:** ✅ **pass** en las cuatro comprobaciones; **ningún archivo de código ni de pruebas
editado** (solo este ✅ y el registro en `MEMORY.md`).
- **AC-15 (greps sobre las fuentes del alcance; producción):** `isTablet` **0**, `esMobile` **0**,
  `drawerAbierto` **0**, `DashboardHeader` **0**, `pt-[var(--header-height)]` **0**,
  `header-height` **0**, `lg:ml-` **0**, `640` **0**, `translate-x-full` **0**,
  `top-[var(--header-height)]` **0**, `max-width` **0**. `1023` aparece **una vez**, en un comentario
  del hook que describe el estado por defecto de RF-06 (no es query ni corte). En `src/` esos
  términos solo sobreviven en **aserciones negativas de las propias pruebas** de AC-14/AC-15
  (`useBreakpoint.test.js`, `DashboardLayout.test.jsx`) y en contenido **fuera de alcance**
  (`App.test.jsx` y panel de tarjetas).
- **AC-15 (umbrales):** el hook declara **exactamente dos** `matchMedia` —`(min-width: 768px)`
  (única fuente de versión de vista; `isDesktop = esDesktop`, `isMobile = !esDesktop`) y
  `(min-width: 1024px)`, que alimenta **solo** `sidebarColapsada = preferencia !== null ?
  preferencia : !anchoGrande`. Ninguna regla asigna 768–1023px a una versión tablet; 0 resultados de
  prefijos de breakpoint (`sm:`/`md:`/`lg:`/`xl:`) y de `min-width`/`max-width` en los componentes de
  layout del dashboard; margen reservado desde 768px por estado JS sin `lg:`; rama no-móvil del drawer
  ausente (panel móvil incondicional, un único `id="dashboard-drawer-panel"`).
- **AC-17:** `npx vitest run src/App.test.jsx` → ✅ **pass 10/10** (línea base 10/10), con
  `src/App.jsx` y `src/App.test.jsx` **sin diff**; rutas del dashboard intactas
  (`/dashboard` índice + `transacciones`/`tarjetas`/`configuracion` + `*` → `/dashboard`).
- **Informativo (no cierre):** `npx vitest run src/hooks/useBreakpoint.test.js
  src/layout/DashboardLayout.test.jsx src/components/layout` → ✅ **pass 150/150 en 8 archivos**
  (27 + 21 + 102). **No se declara verde ninguna suite global.**
- **Observaciones:** aviso preexistente de React (`non-boolean attribute 'jsx'` en
  `BottomNav.jsx`, ya en HEAD, sin efecto: 10/10); `sm:grid-cols-3` de
  `PaginaDashboardInicio.jsx` es rejilla de contenido (una sola presentación que refluye, fuera de
  alcance), no una bifurcación de versión de vista; sigue en pie la observación de T6 sobre el
  recuento «4 enlaces» de `SidebarNavContenido.jsx`.
- **Diferido (T8):** `npm test`, `npm run build` y revisión visual AC-19. Sin commit ni staging.

---

## Tarea 8 — Validación diferida: diff, suite, build y revisión visual (AC-16, AC-18, AC-19) ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** RF-14, RF-15 (verificación final de AC-16)
**Archivos:** ninguno (reporte); se corrige solo lo que la validación destape
**Dependencia:** todas las anteriores **y** el aviso del usuario de que terminó sus ediciones manuales.

**Paso 0:** confirmar que el usuario avisó del fin de sus ediciones manuales y volver a leer el
estado real de los archivos antes de juzgar el diff.

**Pasos:**
1. Escaneo del diff de los archivos del alcance frente a la línea base de la Tarea 1 (incluidas las
   ediciones manuales del usuario, identificadas como tales, no como regresiones de esta spec).
2. `npm test` completo, **contra la línea base**, reportando pass/fail/no ejecutado.
3. `npm run build`.
4. Revisión visual (AC-19) en 768px, 800px, 1023px, 1024px, 1440px, móvil y móvil en horizontal:
   sin solape navegación/contenido, sin desplazamiento horizontal, superficies translúcidas ≤3
   (en pantallas grandes, 2: navegación lateral + modal), sin blobs, contraste legible con y sin
   blur. Si no hay navegador disponible, se registra como **«no ejecutado»**.
5. Reporte único con pass/fail/no ejecutado de AC-16, AC-18 y AC-19.

**Hecho cuando:**
- [x] Reporte escrito de AC-16 (limpieza, con exenciones `index.css`/variable de altura y contenido de navegación intactos)
- [x] Reporte de `npm test` y `npm run build` **contra la línea base**, sin declarar verde nada no medido
- [x] Checklist visual de AC-19 registrado (**ejecutado** con Firefox 156 headless + geckodriver)
- [x] Fallos preexistentes del usuario distinguidos de regresiones de esta spec (los 4 archivos / 10 tests de la línea base quedan resueltos; **0 fallos** restantes)
- [x] Ninguna edición nueva fuera de lo que la validación destape (ningún fallo atribuible a la spec)

**Prueba:** `npm test` y `npm run build` (reporte literal)

**Resultado T8 (validación diferida, ejecutada tras el aviso del usuario):**

**1) Escaneo del diff — PASS (alcance respetado).**
`git status --short` / `git diff --stat`: **17 archivos, +887 / −1234**. Archivos de código/pruebas
modificados = **12**, todos del alcance: `src/hooks/useBreakpoint.js` + `.test.js`,
`src/layout/DashboardLayout.jsx` + `.test.jsx`,
`src/components/layout/{DashboardDrawer.jsx,.test.jsx, SidebarNavContenido.jsx,.test.jsx,
SidebarResponsive.jsx,.test.jsx, BottomNav.jsx}`; más `MEMORY.md`. De los tres archivos de
componentes cuyo diff es **solo cabecera** (T6): `BottomNav.jsx` 1 línea, `SidebarNavContenido.jsx`
1 línea, `SidebarResponsive.jsx` 2 líneas.
**Excepciones (reportadas, ninguna atribuible a T2–T7):** (a) **borrados sin commitear de `.pi/`**
(`.pi/agents/{coordinator-sdd,implementer,planner,reviewer}.md` y `.pi/modes.config.json`), ya
presentes en la línea base de T1 (ajenos a esta spec, fuera de su alcance declarado); (b) archivos
**sin trackear** `analicis-completo-cambios.md`, `specs/008-correccion-sidebar/` (3) y
`specs/009-eliminar-vista-tablet/` (3) — documentación del flujo, no código.
**Confirmado SIN diff** (`git diff --stat` vacío): `src/styles/index.css` (con `--header-height:
64px` intacto en la línea 33), `src/App.jsx`, `src/App.test.jsx`, `vitest.setup.js`,
`src/components/layout/Header.jsx` y `Footer.jsx`, `src/pages/*` (panel de tarjetas),
`src/config/*`, `specs/008-*` (mtime 2026-10-15, no tocados hoy).

**2) `npm test` completo — PASS (literal).**
`Test Files 21 passed (21)` / `Tests 253 passed (253)` / `Duration 6.14s`, exit 0; **0 archivos y 0
tests fallidos**, sin `FAIL` en la salida. Contra la línea base (**4 archivos fallan / 17 pasan
(21)**; **10 tests fallan / 226 pasan (236)**): los 4 archivos y los 10 tests en rojo **quedan
resueltos** (`DashboardLayout.test.jsx` ya compila 21/21; `DashboardDrawer` 17/17;
`SidebarNavContenido` 17/17; `SidebarResponsive` 32/32) y **no aparece ningún fallo nuevo** ⇒ **no hay
regresión**. El total sube de 236 a 253 (+17) por la reescritura/ampliación de suites
(`useBreakpoint` 17→27, `DashboardLayout` 0→21, `DashboardDrawer` 31→17). Por archivo (literal):
`index.css.test.js` 19, `useReveal.test.js` 6, `useBreakpoint.test.js` 27,
`DashboardLayout.test.jsx` 21, `BottomNav.test.jsx` 13, `LandingLayout.test.jsx` 3,
`DashboardDrawer.test.jsx` 17, `SidebarNavContenido.test.jsx` 17, `ModalTarjeta.test.jsx` 11,
`SidebarResponsive.test.jsx` 32, `AcordeonTarjetas.test.jsx` 8, `DashboardUserModal.test.jsx` 20,
`Header.test.jsx` 3, `App.test.jsx` 10, `LogMovimientos.test.jsx` 6, `Card.test.jsx` 4,
`PanelTarjetas.test.jsx` 12, `Features.test.jsx` 1, `Hero.test.jsx` 1, `GridTarjetas.test.jsx` 6,
`MiTarjetaVirtual.test.jsx` 16. Warnings de stderr **preexistentes** (`jsx` no booleano en
`BottomNav.jsx`, `initial` en `MiTarjetaVirtual`, avisos de future flags de React Router); no afectan
al resultado.

**3) `npm run build` completo — PASS, sin warnings.** `vite v5.4.21`, 2027 módulos,
`dist/index.html 1.11 kB`, `dist/assets/index-BtWvw5Nx.css 57.24 kB`,
`dist/assets/index-BkB5WvCe.js 379.63 kB`, `✓ built in 1.70s`, exit 0.

**4) Revisión visual (AC-19) — EJECUTADA** (Firefox 156 headless sobre el **build de producción**
servido con `vite preview`; capturas y medidas de DOM por WebDriver/geckodriver). Anchos: 768, 800,
1023, 1024, 1440, 375 (móvil), 640×360 (móvil horizontal), más 700 y 767 como control.
- **768 / 800 / 1023:** navegación lateral **colapsada** (72px), contenido con margen exacto
  (696/728/951px), `solape nav↔main = false`, `scrollWidth === innerWidth` ⇒ **sin solape y sin
  desplazamiento horizontal**; **sin `BottomNav`** ni composición tablet.
- **1024 / 1440:** lateral **expandida** (256px) y contenido 768/1184px; sin solape ni overflow.
- **375 / 700 / 767 / 640:** sin navegación lateral permanente, `BottomNav` presente (4 items +
  «Menú»), contenido a ancho completo, sin overflow ⇒ **la banda 640–767 es móvil** (CL-03).
- **Superficies translúcidas:** **1** con paneles cerrados (lateral en pantallas grandes; `BottomNav`
  en móvil); **3** con el menú de móvil abierto (BottomNav + overlay + panel) y **3** con el modal de
  cuenta abierto en 1440 (lateral + overlay + modal) ⇒ **≤3** (RF-14). **Blobs: 0** en todas las
  vistas y anchos.
- **AC-10 en navegador real (extra):** con el menú de móvil abierto, pasar de 767px a 1100px **cierra
  el drawer** (`#dashboard-drawer-panel` desaparece) y **traslada el foco** al control de la
  navegación lateral (`BUTTON:Colapsar navegación`) ⇒ no se pierde el foco (RF-09).
- **AC-05/AC-06 en navegador real (extra):** en 800px sin preferencia ⇒ colapsada (72px); al pulsar
  el control ⇒ expandida (256px) y `localStorage.sidebarCollapsed = "false"`; **tras recargar sigue
  expandida** (256px, pref `"false"`) ⇒ la preferencia se guarda y se respeta (RF-07).
- **Contraste (medido, WCAG):** título de contenido **17,45:1**; etiqueta «FinApp / Panel» (emerald
  sobre crema) **4,87:1**; enlace de la navegación lateral (emerald sobre `bg-dark`) **3,58:1**.
  Los dos primeros cumplen AA; el **3,58:1** no alcanza AA para texto normal: es **preexistente y
  ajeno a esta spec** (en `SidebarResponsive.jsx`/`SidebarNavContenido.jsx` esta spec solo cambia
  comentarios; los tokens no se tocan y la banda 768–1023 ya renderizaba esa misma navegación en
  HEAD), se registra como **observación** y **no** se corrige aquí.
- **Límite de la medición:** en la ronda por WebDriver, la petición de 375px se resolvió a 500px de
  ancho interno (banda móvil igualmente); la **captura de 375px sí es real** (375×812) y confirma
  móvil sin solape ni recorte. La medición numérica exacta a 375px queda cubierta por captura, no por
  `scrollWidth`.

**5) AC-16 (limpieza) — PASS.** Grep sobre las fuentes del alcance (`useBreakpoint.js`,
`DashboardLayout.jsx`, `DashboardDrawer.jsx`, `SidebarResponsive.jsx`, `SidebarNavContenido.jsx`,
`BottomNav.jsx`, `DashboardUserModal.jsx`): `isTablet` **0**, `esMobile` **0**, `drawerAbierto` **0**,
`DashboardHeader` **0**, `pt-[var(--header-height)]` **0**, `header-height` **0**, `lg:ml-` **0**,
`translate-x-full` **0**, `640` **0**, `max-width` **0**. Exenciones respetadas: `--header-height:
64px` sigue en `index.css` (sin diff) y el contenido de navegación mantiene sus 3 enlaces y el
recuento «4 enlaces» de su cabecera.

**Atribución final:** **0 fallos preexistentes y 0 regresiones** en la suite global (los 4 archivos /
10 tests de la línea base quedan verdes por DP-06 y la reescritura de T4); `npm test` y
`npm run build` **verdes y medidos**; la única observación no verde es de contraste de un color
preexistente fuera del alcance. Sin commit ni staging.

---

## Tarea 9 — `MEMORY.md` con estado y decisiones ✅ COMPLETADA (2026-10-16)

**RF cubiertos:** — (cierre documental)
**Archivos:** `MEMORY.md`
**Dependencia:** Tarea 8 completada.

**Pasos:**
1. Entrada de cierre: dos versiones de vista con corte 768px, umbral 1024px solo para el default del
   estado; contrato de 4 props; contrato de preferencia válida; espacio reservado desde 768px;
   limpieza RF-15 con sus exenciones.
2. Estado real medido en la Tarea 8 (pass/fail/no ejecutado), **sin** declarar verde lo no medido ni
   reproducir la cifra `273/273` sin sustento.
3. Decisiones pendientes registradas: deuda del nombre accesible en estado colapsado, obsolescencia
   de la spec 008, `pb-20` incondicional y pasada de limpieza de `index.css`/`--header-height`.
4. Sin datos sensibles (la app es demo; no se documentan credenciales ni datos reales).

**Hecho cuando:**
- [x] `MEMORY.md` refleja el estado **medido** y distingue lo diferido de lo verificado
- [x] Quedan registradas las deudas y pendientes fuera de esta spec
- [x] No se declara verde ninguna suite que no se haya medido
- [x] Sin commit ni staging (no solicitados)

**Prueba:** no aplica (documento).

**Resultado T9:** ✅ `MEMORY.md` actualizado con la sección de cierre de la spec 009 (T8), con el
**estado medido** (no declarado): `npm test` 21/21 archivos y 253/253 tests en verde medidos contra la
línea base 4/21 y 10/236 (0 fallos restantes), `npm run build` en verde sin warnings, revisión visual
AC-19 **ejecutada** con Firefox headless + WebDriver (anchos, solape, overflow, superficies
translúcidas, blobs, foco y preferencia) y la observación de **contraste preexistente 3,58:1** en los
enlaces laterales (fuera de alcance). Incluye las decisiones (dos versiones con corte 768px, umbral
1024px solo para el default, contrato de 4 props, contrato de preferencia válida, margen desde 768px,
limpieza RF-15 con exenciones), las **deudas pendientes** (nombre accesible en estado colapsado,
obsolescencia de la spec 008, `pb-20` incondicional, pasada de limpieza de `index.css`/`--header-height`,
contraste del sidebar, `.pi/` borrado sin commitear) y la **inconsistencia documental** con archivo y
líneas exactas. Sin datos sensibles. Sin commit ni staging.

---

## Resumen de orden y dependencias

```
T1 (Paso 0: línea base + reconocimiento, sin tocar código)
  → T2 (useBreakpoint: 4 props, partición complementaria, defaults, preferencia)
    → T3 (DashboardDrawer: rama móvil incondicional, sin esMobile)
      → T4 (DashboardLayout: composición por versión, margen desde 768px, limpieza)
        → T5 (pruebas de los demás componentes de layout)
        → T6 (cabeceras JSDoc + inconsistencias documentales)
          → T7 (auditoría ejecutable: AC-15 + AC-17, no diferida)
            → [aviso del usuario: terminó sus ediciones manuales]
              → T8 (validación diferida: AC-16, AC-18, AC-19)
                → T9 (MEMORY.md)
```

**Nota de acoplamiento:** T3 y T4 se tocan el mismo contrato (el layout pasa `esMobile` al drawer).
Si se cierra T3 antes de T4, el layout puede seguir pasando una prop de más sin romper nada, pero no
debe cerrarse T4 sin que T3 esté hecho. Ambas requieren re-leer los archivos justo antes de editar
(ediciones manuales en curso).
