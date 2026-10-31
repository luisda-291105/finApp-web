# Tasks 012 — Correcciones menores: medición inicial de `useBreakpoint`, clase muerta de `AuthModal` y fecha inválida en `LogMovimientos`

**Estado:** borrador
**Plan base:** `specs/012-correcciones-menores/plan.md` (spec aprobada por el usuario; Q1/Q2/Q3 cerradas
y alcance de pruebas ampliado por coordinación con la 011)
**Máx. 10 tareas** — orden de ejecución; cada tarea declara los RF/AC que cubre y su verificación.

> **Regla común a todas las tareas**
> 1. **Paso 0 obligatorio:** re-leer el código real de cada archivo antes de editarlo (DP-21: el
>    usuario edita a mano). Si un artefacto que la tarea espera ya no existe (la clase retirada, el
>    helper ya validado, el stub ya coherente), se registra como **«ya no aplicable»**, no se recrea
>    (CL-12).
> 2. **Cambios mínimos y localizados**, sin reformatear ni reordenar líneas ajenas al objetivo.
> 3. **Validación:** se ejecuta la prueba indicada y se reporta **pass / fail / no ejecutado**. Nada
>    se declara verde sin medirse. `npm test` y `npm run build` se reservan a la **Tarea 9**.
> 4. **Navegador:** ninguna tarea tiene criterios de navegador; la validación visual es **no
>    aplicable** (la clase retirada no generaba reglas) o **no declarada como realizada** para la
>    corrección (1) (solo observable en el borde de 768px).
> 5. **Prohibido tocar producción para hacer pasar una prueba:** los únicos cambios de código de
>    producción son los de la Tarea 4, la Tarea 5 y la Tarea 6.
> 6. **Sin dependencias nuevas, sin hexadecimales nuevos, sin animaciones**; nombres en español; sin
>    `git add -A`; **sin commit ni staging**.
> 7. **Orden clave:** la 012 va **primero**; la 011 **no** se toca y se re-mide después (Tarea 9).

---

## Tarea 1 — Paso 0: re-verificación del inventario y línea base por suite ✅ COMPLETADA (2026-10-17)

**Objetivo:** dejar constancia del estado real **antes** de tocar nada.
**Archivos:** ninguno (solo lectura).
**Pasos:**
1. `git status --short` y confirmar que no hay cambios previos fuera de `specs/`.
2. Re-verificar el inventario de §7.1 de la spec por `grep`: `useBreakpoint`, `useDeslizarParaCerrar`,
   `window.matchMedia`; anotar lo que ya no aplique (CL-12).
3. Confirmar las referencias críticas de las tres correcciones: `useBreakpoint.js:28-36/40-41/43-59/62/73`,
   `AuthModal.jsx:123-126`, `LogMovimientos.jsx:12-15/17-24`, `vitest.setup.js:13-33`,
   `DashboardUserModal.test.jsx:34-50/292-345`, `useBreakpoint.test.js:33-37/47-54/211-216`.
4. Medir la línea base **suite por suite** (sin tocar código) y registrar casos y estado:
   `npx vitest run src/hooks/useBreakpoint.test.js src/hooks/useDeslizarParaCerrar.test.js src/components/domain/dashboard/LogMovimientos.test.jsx src/components/domain/modales/AuthModal.test.jsx src/components/ModalTarjeta.test.jsx src/components/layout src/layout/DashboardLayout.test.jsx src/pages/PanelTarjetas.test.jsx src/App.test.jsx src/main.test.jsx`
**Cubre:** precondición de AC-09 (línea base); §7 de la spec.
**Hecho cuando:** está registrada la cifra y el estado (pass/fail) de **cada** suite del inventario,
lo re-verificado por `grep` y lo que dejó de aplicar.

**Resultado T1 (2026-10-17, solo medición; sin cambios en producción ni pruebas):**

- **`git status --short`:** existen cambios previos **fuera** de `specs/` (no atribuibles a la 012):
  `D .pi/agents/{coordinator-sdd,implementer,planner,reviewer}.md`, `D .pi/modes.config.json`,
  `M vite.config.js` (se le retiró el bloque `test`; la config de pruebas vive en el `vitest.config.js`
  ya existente) y `?? analicis-completo-cambios.md`. `specs/` sin seguimiento: `011-…`, `012-…`.
  Ninguno de esos archivos es código ni prueba de esta spec. Se registra como **discrepancia**, no se toca.
- **Inventario §7.1 por `grep`** (`useBreakpoint`, `useDeslizarParaCerrar`, `window.matchMedia`):
  sigue **aplicable** tal cual. Stubs locales incoherentes vigentes: `vitest.setup.js:14-26`
  (`matches:false` fijo con `innerWidth=1024` en `:29-33`) y `DashboardUserModal.test.jsx:49`
  (`mockMatchMedia(false)` con `innerWidth=1024` en `:48`). Suites con stub propio coherente: las de
  §7.1-C. Consumidores: `DashboardLayout.jsx:4,40` (directo) y `useDeslizarParaCerrar.js:10,48`
  (usado por `AuthModal.jsx:61`, `ModalTarjeta.jsx:69`, `DashboardUserModal.jsx:66`). **Nada dejó de
  aplicar (CL-12 sin incidencias).** `SidebarResponsive.jsx` solo cita el hook en comentarios (no lo importa).
- **Referencias críticas re-verificadas (todas coinciden):** `useBreakpoint.js:28-36/40-41/43-59/62/73`;
  `AuthModal.jsx:123-126` (clase `animate-fadeIn` en `:124`); `LogMovimientos.jsx:12-15/17-24`;
  `vitest.setup.js:13-33`; `DashboardUserModal.test.jsx:34-50/292-345`; `useBreakpoint.test.js:33-37/47-54/211-216`.
- **Comando focalizado del inventario** (`npx vitest run …`, arriba): **16 archivos / 267 tests — pass
  (0 fallos)**, desglose por suite:

  | Suite | Casos | Estado |
  |---|---|---|
  | `src/hooks/useBreakpoint.test.js` | 27 | pass |
  | `src/hooks/useDeslizarParaCerrar.test.js` | 18 | pass |
  | `src/components/domain/dashboard/LogMovimientos.test.jsx` | 6 | pass |
  | `src/components/domain/modales/AuthModal.test.jsx` | 15 | pass |
  | `src/components/ModalTarjeta.test.jsx` | 18 | pass |
  | `src/components/layout/Header.test.jsx` | 3 | pass |
  | `src/components/layout/BottomNav.test.jsx` | 13 | pass |
  | `src/components/layout/SidebarNavContenido.test.jsx` | 17 | pass |
  | `src/components/layout/SidebarResponsive.test.jsx` | 32 | pass |
  | `src/components/layout/DashboardDrawer.test.jsx` | 23 | pass |
  | `src/components/layout/DashboardUserModal.test.jsx` | 26 | pass |
  | `src/components/layout/cierreDeModales.test.jsx` | 22 | pass |
  | `src/layout/DashboardLayout.test.jsx` | 23 | pass |
  | `src/pages/PanelTarjetas.test.jsx` | 12 | pass |
  | `src/App.test.jsx` | 11 | pass |
  | `src/main.test.jsx` | 1 | pass |

- **`npm test` (global):** **27 archivos / 348 tests — pass (0 fallos)**. **`npm run build`:** verde
  (`dist/assets/index-*.css` 57.49 kB, gzip 9.48 kB; `dist/assets/index-*.js` 382.86 kB, gzip 122.07 kB).
- **Discrepancias con lo que cita la spec §7** (deriva por edición manual, DP-21; manda lo medido):
  `ModalTarjeta.test.jsx` **11 → 18**; `DashboardLayout.test.jsx` **21 → 23**; `DashboardUserModal.test.jsx`
  **20 → 26** (ya previsto en el plan §10-5); `cierreDeModales.test.jsx` sin cifra en la spec → **22**.
  `useBreakpoint.test.js` **27** ✅, `LogMovimientos.test.jsx` **6** ✅ y `AuthModal.test.jsx` **15** ✅ coinciden.
- **AC-04:** no ejecutado (jsdom siempre tiene `window`), nunca verde.

---

## Tarea 2 — Stub global coherente + suite dedicada del stub (AC-11) ✅ COMPLETADA (2026-10-17)

**Objetivo:** que `vitest.setup.js` mida **una sola** versión de vista
(`matches = innerWidth >= min-width de la consulta`).
**Archivos:** `vitest.setup.js` (`matchMedia` `:14-26`; comentarios `:13`, `:28`); **nuevo**
`src/entornoDeMedicion.test.js`.
**Pasos (TDD):**
1. Escribir `src/entornoDeMedicion.test.js` (4 casos: default 1024 ⇒ `true`/`true`;
   `(prefers-reduced-motion: reduce)` ⇒ `false`; coherencia dinámica 375 ⇒ `false`/`false` y 800 ⇒
   `true`/`false`; stub reemplazable con restitución). Restaura `innerWidth` en `afterEach`.
2. Ejecutarlo y **dejar constancia del rojo** (hoy `matches: false` con `innerWidth = 1024`).
3. Editar el stub global: derivar `matches` del `innerWidth` vigente **en el momento de la consulta**;
   conservar el default `1024` y `onchange`/`addListener`/`removeListener`/`addEventListener`/
   `removeEventListener`/`dispatchEvent`; añadir `configurable: true` (se mantiene asignable).
   Actualizar los comentarios `:13` y `:28`. **`vitest.config.js` no se toca.**
4. Repetir el caso y medir los consumidores del stub global: `src/App.test.jsx` y
   `src/pages/PanelTarjetas.test.jsx` **antes y después** (si alguno cambia, se registra el hallazgo y
   solo se ajusta su **aserción**).
**Verificación:** `npx vitest run src/entornoDeMedicion.test.js` +
`npx vitest run src/App.test.jsx src/pages/PanelTarjetas.test.jsx`.
**Cubre:** RF-13; AC-11 (excepción única: el mock incoherente de AC-02 vive solo en la Tarea 4).
**Hecho cuando:** los 4 casos nuevos pasan, el stub conserva `1024` como default documentado, las
consultas sin `min-width` dan `false`, y ninguna de las dos suites del stub global empeora sin
justificación registrada.

**Resultado T2 (2026-10-17, solo infraestructura de pruebas: `vitest.setup.js` + suite nueva; sin
código de producción, sin tocar `vitest.config.js`):**

- **Paso 0 (re-lectura):** el stub seguía siendo el descrito (`vitest.setup.js:14-26` con
  `matches: false` fijo y `innerWidth = 1024` en `:29-33`, `writable` pero **no** `configurable`).
  Nada había derivado (CL-12 sin incidencias).
- **Rojo inicial (evidencia TDD):** `npx vitest run src/entornoDeMedicion.test.js` ⇒ **3 fallos /
  1 pass (4)**. Fallan «default 1024 ⇒ `true`/`true`» (recibe `false`), «coherencia dinámica 375/800»
  y «stub reemplazable con restitución» (recibe `false` al restituir el stub global); pasa el caso de
  las consultas ajenas al ancho (`false`). Confirma la firma del defecto: `matches: false` con
  `innerWidth = 1024`.
- **Cambio aplicado (`vitest.setup.js`, `:14-26` + comentarios `:13` y `:28`):** `matches` pasa a
  derivarse del **`innerWidth` vigente en el momento de la consulta**
  (`/min-width:\s*(\d+)px/` ⇒ `innerWidth >= min-width`; consulta sin `min-width` ⇒ `false`, así
  `(prefers-reduced-motion: reduce)` sigue en `false`). Se conservan `onchange`, `addListener`,
  `removeListener`, `addEventListener`, `removeEventListener` y `dispatchEvent`, el default `1024`
  (documentado) y se añade `configurable: true` (el stub sigue asignable por las suites). Diff de
  `+20 / −12` líneas en ese archivo (reescritura del cuerpo del `mockImplementation` y de los dos
  comentarios), sin reformateos ajenos.
- **Verde final:** `npx vitest run src/entornoDeMedicion.test.js` ⇒ **4/4 pass**.
- **Consumidores del stub global, antes → después:** `src/App.test.jsx` **11 → 11** y
  `src/pages/PanelTarjetas.test.jsx` **12 → 12**; comando conjunto **23/23 pass** en ambas mediciones.
  **Ningún test cambió de resultado ⇒ no se ajustó ninguna aserción** (ni se tocó ninguna suite del
  inventario).
- **`npm test` (global):** **28 archivos / 352 tests — pass (0 fallos)** (línea base 27/348 + la suite
  nueva con sus 4 casos). **`npm run build`:** verde con los **mismos tamaños** que la línea base
  (`dist/assets/index-*.css` 57.49 kB, gzip 9.48 kB; `dist/assets/index-*.js` 382.86 kB, gzip
  122.07 kB). **Validación visual: no aplicable** (solo infraestructura de pruebas).
- **Archivos:** `vitest.setup.js` (modificado) y `src/entornoDeMedicion.test.js` (nuevo). Sin
  dependencias nuevas, sin hexadecimales, sin staging ni commit.
- **Discrepancias:** ninguna. La línea base de la Tarea 1 se confirma (348/27) y el delta medido
  (+4 casos, +1 archivo) es exactamente el previsto.

---

## Tarea 3 — Stub local coherente en `DashboardUserModal.test.jsx` (AC-13) ✅ COMPLETADA (2026-10-17)

**Objetivo:** que el default de la suite del modal de cuenta mida una **sola** versión de vista
(pantallas grandes de verdad), como declara su comentario `:46`.
**Archivos:** `src/components/layout/DashboardUserModal.test.jsx` (`:34-50`; **1 caso nuevo**).
**Pasos (TDD):**
1. Añadir el caso que aserta, tras el `beforeEach`, `innerWidth` 1024 ⇒ `matches: true` para
   `"(min-width: 768px)"` y `"(min-width: 1024px)"`; ejecutarlo y dejar constancia del **rojo**.
2. Cambiar el default `:47-50` para instalar un `matchMedia` **derivado** del `innerWidth` vigente
   (mismo criterio que el global). Si el factory existente `:34-44` deja de usarse, se retira; si se
   conserva para los viewports del gesto, se documenta.
3. **No** cambiar el `describe` del gesto (`:292-345`) ni lo que mide cada caso: sus dos viewports
   explícitos (`:293-296` móvil 375; `:298-301` pantallas grandes) se conservan (AC-13, §7.1-B).
4. Ejecutar la suite completa y comparar los **casos existentes** con la línea base de la Tarea 1 (la
   spec cita 20; el archivo declara 26 `it(` al 2026-10-17 ⇒ manda el recuento medido).
**Verificación:** `npx vitest run src/components/layout/DashboardUserModal.test.jsx`.
**Cubre:** RF-13 (párrafo de stubs locales), DP-12; AC-13.
**Hecho cuando:** el caso nuevo pasa, los **casos existentes** conservan su resultado (recuento real
de la Tarea 1) y, si alguno cambió por el default, el hallazgo queda registrado y el ajuste se limita
a su aserción.

**Resultado T3 (2026-10-17, solo suite de pruebas: `DashboardUserModal.test.jsx`; sin código de
producción, sin tocar `MEMORY.md`):**

- **Paso 0 (re-lectura):** el stub seguía siendo el descrito (`mockMatchMedia` `:34-44`; default
  `:47-50` con `innerWidth` 1024 y `matches: false`; `beforeEach` `:52`; `afterEach` `:54-57`), el
  `describe` del gesto seguía en `:292-345` con sus dos viewports explícitos (`:293-296` móvil 375;
  `:298-301` pantallas grandes 1024) y el archivo declaraba **26** `it(`. Nada había derivado
  (CL-12 sin incidencias).
- **Rojo inicial (evidencia TDD):** `npx vitest run src/components/layout/DashboardUserModal.test.jsx`
  ⇒ **1 fallo / 26 pass (27)**. Falla el caso nuevo «el default mide pantallas grandes: con
  `innerWidth` 1024 coinciden 768 y 1024» con `expected false to be true` en
  `matchMedia("(min-width: 768px)").matches` (`:95`), confirmando la firma del defecto: `matches:
  false` con `innerWidth = 1024`.
- **Cambio aplicado:** (a) caso nuevo `describe("entorno de medición (RF-13, AC-13)")` al inicio del
  `describe` exterior (asertos sobre `window.innerWidth === 1024` y `matches === true` para
  `"(min-width: 768px)"` y `"(min-width: 1024px)"`, evaluados tras el `beforeEach`); (b) el default
  `restaurarViewportEscritorio` pasa a instalar un `matchMedia` **derivado del `innerWidth` vigente en
  el momento de la consulta** con la **misma fórmula** que el stub global de T2
  (`/min-width:\s*(\d+)px/` ⇒ `innerWidth >= min-width`; consulta sin `min-width` ⇒ `false`), en vez
  del `mockMatchMedia(false)` fijo; (c) comentarios del default y del factory actualizados.
- **Factory `mockMatchMedia` `:34-44`: se conserva** (documentado en su JSDoc) porque lo siguen usando
  los dos viewports explícitos del gesto (`activarMovil` con `false` y `activarPantallasGrandes` con
  predicado): **no** se retira ni se reescribe.
- **Gesto intacto (AC-13, §7.1-B):** el diff **no** toca el `describe` del gesto ni lo que mide cada
  caso; sus dos viewports explícitos (375 y 1024) se conservan literales.
- **Verde final:** `npx vitest run src/components/layout/DashboardUserModal.test.jsx` ⇒ **27/27 pass**
  (26 casos existentes **intactos** + 1 nuevo). **Ningún caso existente cambió de resultado ni se
  ajustó ninguna aserción**: el único ajuste es el stub del default, y las tres suites del gesto
  siguen pasando igual (los dos casos de móvil fijan su propio viewport y el de pantallas grandes
  conserva su predicado).
- **`npm test` (global):** **28 archivos / 353 tests — pass (0 fallos)** (T2: 28/352 + el caso nuevo).
  **`npm run build`:** verde con los **mismos tamaños** que T2
  (`dist/assets/index-*.css` 57.49 kB, gzip 9.48 kB; `dist/assets/index-*.js` 382.86 kB, gzip
  122.07 kB). **Validación visual: no aplicable** (solo infraestructura de pruebas).
- **Archivos:** `src/components/layout/DashboardUserModal.test.jsx` (único archivo de esta tarea).
  Sin dependencias nuevas, sin hexadecimales, sin staging ni commit. `git diff --stat` no muestra
  ningún archivo de producción atribuible a la Tarea 3.
- **Discrepancias:** ninguna. El recuento real lo fija la Tarea 1 (26, no los 20 que cita la spec) y el
  delta medido es exactamente **26 → 27**.

---

## Tarea 4 — `useBreakpoint.js`: fuente única del snapshot inicial ✅ COMPLETADA (2026-10-17)

**Objetivo:** que el primer render comprometido ya sea el valor medido por las media queries.
**Archivos:** `src/hooks/useBreakpoint.js` (medición `:28-36`; cabecera `:1-8`);
`src/hooks/useBreakpoint.test.js` (**2 casos nuevos**, sondas de composición).
**Pasos (TDD):**
1. Añadir a `useBreakpoint.test.js`: (a) **AC-02** — mock deliberadamente **incoherente**
   (`innerWidth` 1024 con `matches: false`) y **sonda** que acumula cada composición; el aserto va
   sobre `registros[0]` (`isMobile: true`, `sidebarColapsada: true`) **y** sobre que ninguna
   composición contradiga la media query. **No** usar `result.current` (post-efecto) ni `result.all`
   (no existe en RTL 16.3.3). (b) **AC-01** — mock coherente en 375 y 1200 con sonda ⇒ primer render
   medido (caso esperado **verde** también antes del cambio).
2. Ejecutar y **dejar constancia del rojo de AC-02** (hoy: primera composición desktop y una segunda
   contradictoria).
3. Cambiar **solo el cuerpo** de las dos funciones de medición: leer
   `window.matchMedia(QUERY_PANTALLAS_GRANDES).matches` y
   `window.matchMedia(QUERY_ANCHO_GRANDE).matches`, conservando `typeof window === "undefined"` ⇒
   `true`, los nombres, la forma del `useState` con inicializador diferido y **sin** helper nuevo.
4. **No** tocar el efecto (`:43-59`), el default de banda (`:62`), `toggleSidebar` (`:64-71`), el
   retorno (`:73`) ni `leerPreferencia` (`:18-26`). Actualizar la cabecera JSDoc (`@datos`, `@estados`).
5. Ejecutar la suite del hook (27 casos existentes **intactos**) y los consumidores indirectos.
**Verificación:** `npx vitest run src/hooks/useBreakpoint.test.js` +
`npx vitest run src/hooks/useDeslizarParaCerrar.test.js src/layout/DashboardLayout.test.jsx`.
**Cubre:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-12; AC-01, AC-02, AC-03 (y AC-04 reportado **no
ejecutado**).
**Hecho cuando:** AC-02 pasa (una sola composición, la de la media query), AC-01 pasa, los 27 casos
existentes del hook conservan su resultado y el diff se limita a las dos funciones + la cabecera.

**Resultado T4 (2026-10-17, primera corrección de producción de la 012; sin tocar la 011 ni
`MEMORY.md`):**

- **Paso 0 (re-lectura):** el hook seguía con las dos fuentes descritas (`medirEsDesktop` `:28-31` ⇒
  `window.innerWidth >= 768`; `medirAnchoGrande` `:33-36` ⇒ `window.innerWidth >= 1024`), los
  inicializadores diferidos en `:40-41`, el efecto en `:43-59`, el default de banda en `:62`,
  `toggleSidebar` `:64-71` y el retorno de 4 props en `:73`; la cabecera seguía en `:1-8` y la suite
  declaraba **27** `it(`. Nada había derivado (CL-12 sin incidencias).
- **Rojo inicial (evidencia TDD, AC-02):** `npx vitest run src/hooks/useBreakpoint.test.js` ⇒
  **1 fallo / 28 pass (29)**. Falla «con un mock incoherente manda la media query ya en el primer
  render (AC-02)»: `expected { isMobile: false, … } to match object { isMobile: true, … }` en
  `registros[0]` (recibe `isDesktop: true`, `isMobile: false`, `sidebarColapsada: false`). **Sondeo
  directo del defecto** (archivo temporal, ya eliminado; mismo mock incoherente `innerWidth` 1024 /
  `matches: false`): hoy **dos composiciones contradictorias**
  `[{isMobile:false,sidebarColapsada:false},{isMobile:true,sidebarColapsada:true}]` — la primera
  desde `innerWidth` y la segunda desde el sync inicial del efecto (`:52-53`).
- **Cambio aplicado (`src/hooks/useBreakpoint.js`, 4 líneas; archivo de producción):** solo el
  **cuerpo** de las dos funciones de medición pasa a la **misma fuente** que la suscripción
  (`return window.matchMedia(QUERY_PANTALLAS_GRANDES).matches;` y
  `return window.matchMedia(QUERY_ANCHO_GRANDE).matches;`), conservando nombres, firma, la guarda
  `typeof window === "undefined"` ⇒ `true`, la forma del `useState` con inicializador diferido y
  **sin** helper nuevo. Cabecera JSDoc (`:1-8`): `@datos` declara la fuente única del snapshot
  inicial y `@estados` que ambos booleanos se inicializan con la medición de `matchMedia`. El diff
  son **4 inserciones / 4 borrados** y **no** toca el efecto, el default de banda, `toggleSidebar`,
  `leerPreferencia` ni el retorno.
- **Verde final:** `npx vitest run src/hooks/useBreakpoint.test.js` ⇒ **29/29 pass** (27 casos
  existentes **intactos** —el diff de la suite es una inserción pura al final— + los 2 nuevos).
  Sondeo con el hook ya corregido: **una sola** composición
  `[{isMobile:true,sidebarColapsada:true}]` ⇒ el sync inicial del efecto es **no-op** (RF-02).
- **Casos nuevos (2, `describe("fuente única del snapshot inicial (RF-01, RF-02)")`):**
  (a) **AC-02** con mock deliberadamente incoherente (única excepción de RF-13, local al caso) y
  **sonda de composiciones** (el callback de `renderHook` acumula cada valor; **no** se usa
  `result.current` ni `result.all`): asertos sobre `registros[0]` (`isMobile`, `isDesktop`,
  `sidebarColapsada`) **y** sobre que **ninguna** composición contradiga `matches` de las dos
  consultas. **Falla antes del cambio / pasa después.** (b) **AC-01** con mock **coherente** (375 y
  1200, cada ancho con su sonda): el primer render ya es el medido — **verde también antes del
  cambio** (no discrimina el defecto), como preveía DP-P4. La sonda auxiliar
  `medirComposiciones(width)` vive dentro del `describe` nuevo (no es helper de producción).
- **Consumidores indirectos:** `npx vitest run src/hooks/useDeslizarParaCerrar.test.js
  src/layout/DashboardLayout.test.jsx` ⇒ **41/41 pass** (18 + 23), mismos recuentos que la línea base
  de la Tarea 1; ninguna aserción cambió de resultado.
- **`npm test` (global):** **28 archivos / 355 tests — pass (0 fallos)** (T3: 28/353 + los 2 casos
  nuevos ⇒ delta exactamente **+2**). **`npm run build`:** verde
  (`dist/assets/index-*.css` 57.49 kB, gzip 9.48 kB; `dist/assets/index-*.js` 382.88 kB, gzip
  122.05 kB) — variación despreciable frente a T3 (382.86 kB / 122.07 kB) por el código minificado
  de las dos funciones. **Validación visual: no aplicable / no declarada como realizada** (el
  defecto solo sería observable en el borde de 768px; §10-6).
- **Archivos:** `src/hooks/useBreakpoint.js` (4 líneas) y `src/hooks/useBreakpoint.test.js`
  (+2 casos). Sin dependencias nuevas, sin hexadecimales, sin staging ni commit; `MEMORY.md` sin
  tocar (le corresponde a la Tarea 8). El archivo temporal de sondeo se eliminó: `git status` no lo
  muestra y `git diff --stat src/hooks/useBreakpoint.js` sigue siendo **4/4**.
- **AC-04:** **no ejecutado** (jsdom siempre tiene `window`), nunca verde.
- **Discrepancias:** ninguna. El delta medido (`useBreakpoint.test.js` 27 → **29**) coincide con el
  esperado y el recuento de casos nuevos es **exactamente 2** (AC-01 se escribió como un único caso
  que mide 375 y 1200, sin `it.each`, para no alterar el delta previsto).

- **Ajustes posteriores a la validación del reviewer (2026-10-17, cierre de la 012; aditivos, solo
  pruebas, sin cambiar ningún aserto existente ni el comportamiento):**
  1. **AC-01** (`useBreakpoint.test.js`, mismo `it`, sin crear casos nuevos): el caso del mock
     coherente pasa a medir también **800px** (la fila de AC-01 pide 375 / **800** / 1200). Se añade una
     tercera sonda (`enMediano`) con los asertos esperados en 800 —`isMobile: false`, `isDesktop: true`,
     `sidebarColapsada: true`— y los mismos dos asertos de coherencia que los otros anchos; el título
     del caso se actualiza a «375, 800 y 1200» para no describir mal lo que mide.
  2. **AC-02** (`useBreakpoint.test.js`, mismo `it`): se añade `expect(registros).toHaveLength(1)`, que
     ata RF-02 (una **sola** composición). Con el defecto previo a esta tarea la sonda registraba **dos**
     composiciones contradictorias, así que el aserto habría fallado entonces: es un cierre real, no
     decorativo.
  - **Recuento:** la suite sigue con **29** casos (los dos ajustes viven dentro de los dos casos
    existentes; no se crea ningún `it` nuevo) y el global sigue en **28 archivos / 373 tests**.
  - **Re-validación (2026-10-17):** `npx vitest run src/hooks/useBreakpoint.test.js` ⇒ **29/29 pass**;
    `npm test` ⇒ **28 archivos / 373 tests — pass (0 fallos)**; `npm run build` ⇒ **verde**
    (`dist/assets/index-B0_ZOIQp.css` 57.49 kB, gzip 9.48 kB; `dist/assets/index-D_MUzjqS.js`
    **382.97 kB**, gzip 122.09 kB). El JS sube **0.02 kB** frente a T9 (382.95 kB) por el commit
    **ajeno a la 012** `54d2a6a` («feat: add padding to dashboard sections for improved layout»,
    4 páginas del dashboard) que el usuario creó entre T9 y esta re-validación; ningún archivo de
    producción de la 012 cambió tras T9.

---

## Tarea 5 — `AuthModal.jsx`: retirar la clase muerta ✅ COMPLETADA (2026-10-17)

**Objetivo:** quitar `animate-fadeIn` sin ningún otro cambio.
**Archivos:** `src/components/domain/modales/AuthModal.jsx:124` (solo esa línea).
**Pasos:**
1. Confirmar por lectura que la clase sigue en la capa exterior (`:123-126`) y que la cabecera
   (`:1-11`) no la menciona.
2. Retirar `animate-fadeIn` del listado de clases. **No** crear la animación ni un token, **no**
   migrar colores, **no** tocar el panel (`:129-136`), su `aria-*`, la «X» ni el resto de clases.
3. Verificar por `grep`: `fadeIn` con **0** coincidencias en `src/`; y que la capa exterior conserva
   `fixed`, `inset-0`, `z-50`, `bg-black/70` y `backdrop-blur-sm`.
**Verificación:** `grep` + `npx vitest run src/components/domain/modales/AuthModal.test.jsx`
(**15 casos**, recuento igual: esta corrección no añade casos).
**Cubre:** RF-06, RF-07; AC-05 (la parte «de aspecto» se cierra por inspección).
**Hecho cuando:** `grep` da 0 coincidencias, la suite queda en 15 casos con el mismo resultado que la
línea base y el diff del archivo es de una sola línea.

**Resultado T5 (2026-10-17, segunda corrección de producción de la 012; sin tocar la 011 ni
`MEMORY.md`):**

- **Paso 0 (re-lectura):** la clase seguía **solo** en la capa exterior (`AuthModal.jsx:124`; el
  bloque `:123-126` intacto) y la cabecera JSDoc `:1-11` **no** la menciona. **DP-21:** la edición
  manual del usuario en el bloque `fetch` (`:77-120`, `try/catch` interno con
  «No se pudo conectar con el backend…») se conserva **literal**, sin revertir ni alterar. Nada había
  derivado (CL-12 sin incidencias).
- **Cambio aplicado (una sola línea, archivo de producción):** se retira `animate-fadeIn` del listado
  de clases de la capa exterior. La línea queda:
  `className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"`.
  `git diff --stat src/components/domain/modales/AuthModal.jsx` ⇒ **1 archivo / 1 inserción / 1
  borrado**. **No** se creó animación ni token, **no** se migraron colores (persiste el hexadecimal
  heredado `bg-[#0f1117]/95` del panel, fuera de alcance) y **no** se tocaron el panel (`:129-136`),
  sus `aria-*` (`role`/`aria-modal`/`aria-label`), la «X» ni el resto de clases. Cabecera sin tocar.
- **1) `grep` de `fadeIn`/`fade-in`/`fade_in` en `src/`: 0 coincidencias** (`grep -rn … src/` sin
  salida, exit 1) ⇒ **pass**. Capa exterior verificada por lectura: conserva `fixed`, `inset-0`,
  `z-50`, `bg-black/70` y `backdrop-blur-sm` ⇒ **pass**.
- **2) `npx vitest run src/components/domain/modales/AuthModal.test.jsx`: 1 archivo / 15 tests —
  pass (0 fallos)** ⇒ **pass**, recuento **15 → 15** igual a la línea base de la Tarea 1 (esta
  corrección no añade casos: AC-05/DP-06, verificación por `grep` + inspección; un aserto
  `classList.contains("animate-fadeIn") === false` no aportaría señal en jsdom, que no evalúa
  animaciones).
- **3) `npm test` (global): 28 archivos / 355 tests — pass (0 fallos)** ⇒ **pass**, idéntico a la
  línea base posterior a T4 (28/355): delta exactamente **0** casos, como exige AC-05.
- **4) `npm run build`: verde** ⇒ **pass**. Tamaños: `dist/assets/index-*.css` **57.49 kB**,
  gzip **9.48 kB** (idéntico a T3/T4) y `dist/assets/index-*.js` **382.86 kB**, gzip **122.04 kB**
  (T4: 382.88 kB / 122.05 kB). El **CSS no cambia de tamaño**, lo que confirma
  empíricamente **CL-11**: la clase no generaba ninguna regla y el aspecto queda intacto (RF-07).
- **Validación visual: no aplicable / no declarada como realizada** (la clase no producía estilos; la
  retirada no puede cambiar el render; §10-6). AC-05 en su parte «de aspecto» se cierra por
  **inspección** del diff (una línea) y por el CSS invariante del build.
- **Archivos:** `src/components/domain/modales/AuthModal.jsx` (único archivo de esta tarea, 1 línea).
  Sin dependencias nuevas, sin hexadecimales nuevos, sin animaciones, nombres en español, sin
  `git add -A`, sin staging ni commit. `MEMORY.md` sin tocar (le corresponde a la Tarea 8).
- **Discrepancias:** ninguna. La Tarea 5 no aportaba casos nuevos y el delta medido es exactamente
  **0** (`AuthModal.test.jsx` 15 → 15; global 355 → 355).

---

## Tarea 6 — `formatearFechaCorta`: formato estricto, mes validado y «—» ✅ COMPLETADA (2026-10-17)

**Objetivo:** que toda entrada inválida devuelva el neutro U+2014 sin perder el `TypeError` de
contrato.
**Archivos:** `src/components/domain/dashboard/LogMovimientos.jsx` (`:21-24`; comentario `:17-20`;
cabecera `:1-10`); `src/components/domain/dashboard/LogMovimientos.test.jsx` (**casos nuevos**).
**Pasos (TDD):**
1. Añadir el `describe` del helper exportado con dos tablas `it.each`: **AC-06** válidas
   (`"2026-10-12"`, `"2026-10-01"`, `"2026-01-01"`, `"2026-03-31"`, `"2026-12-31"`, `"2026-10-99"`,
   `"0000-01-01"`) y **AC-07** inválidas (mes 0/13/99, `"2026-XX-12"`, `"2026-10-1"`, `"2026-1-12"`,
   `"26-10-12"`, `" 2026-10-12"`, `"12-10-2026"`, `"no-es-fecha"`, `""` ⇒ **«—»**, sin `undefined`
   ni `NaN`). Ejecutar y dejar constancia del **rojo**.
2. Implementar: `fechaISO.split("-")` **primero** (conserva el `TypeError`; sin guarda de tipo, sin
   conversión, sin `trim`, sin `try/catch`), luego el patrón **anclado** con exactamente 4/2/2 dígitos,
   luego la validación del **mes (1–12)** antes de indexar `MESES_ES`, y una **única constante**
   `"—"` (U+2014) para todos los caminos inválidos. Día con `Number(dia)` (sin cero a la izquierda) y
   año con `Number(anio)` (**no** se valida el año ni el día).
3. **No** tocar `MESES_ES`, `formatearMonto`, el orden descendente, los tokens, la fuente tabular, el
   estado vacío ni el `<li>` del log. Actualizar las cabeceras JSDoc indicadas.
**Verificación:** `npx vitest run src/components/domain/dashboard/LogMovimientos.test.jsx`
(6 casos existentes intactos + las tablas nuevas).
**Cubre:** RF-08, RF-09, RF-10, RF-12; AC-06, AC-07, AC-08, AC-12 (inspección del diff: sin `typeof`).
**Hecho cuando:** todas las filas de ambas tablas pasan, los 6 casos existentes conservan su resultado
y el diff no contiene comprobaciones de tipo.

**Resultado T6 (2026-10-17, tercera y última corrección de producción de la 012; sin tocar la 011 ni
`MEMORY.md`):**

- **Paso 0 (re-lectura):** el helper seguía con el defecto descrito (`LogMovimientos.jsx:21-24`:
  `fechaISO.split("-").map(Number)` + indexación directa de `MESES_ES[mes - 1]`), el mapa de meses en
  `:12-15` intacto, la cabecera en `:1-10` (con `@datos` que no documentaba el formato ni el neutro) y
  el comentario del helper en `:17-20`; la suite declaraba **6** `it(`. Nada había derivado
  (CL-12 sin incidencias).
- **Paso 1 — prueba primero y rojo (evidencia TDD):** se añade al final de
  `LogMovimientos.test.jsx` el `describe("formatearFechaCorta (spec 012, RF-08/RF-09)")` con dos
  tablas `it.each` (import del helper exportado) y se ejecuta:
  `npx vitest run src/components/domain/dashboard/LogMovimientos.test.jsx` ⇒ **11 fallos / 13 pass
  (24)**. Fallan **las 11 filas de AC-07** (todas con salidas del defecto: `"2026-00-12"` ⇒
  `"12 undefined 2026"`, `"2026-13-12"`/`"2026-99-12"` ⇒ `"12 undefined 2026"`, `"2026-XX-12"` ⇒
  `"12 undefined NaN"`, `"2026-10-1"` ⇒ `"1 undefined 2026"`, `"2026-1-12"` ⇒ `"12 undefined 2026"`,
  `"26-10-12"` ⇒ `"12 oct 26"`, `" 2026-10-12"` ⇒ `"12 oct 2026"`, `"12-10-2026"` ⇒ `"2026 oct 12"`,
  `"no-es-fecha"` ⇒ `"NaN undefined NaN"`, `""` ⇒ `"undefined undefined 0"`). Las **7 filas de AC-06**
  pasan ya antes del cambio (no discriminan el defecto: el formato válido funciona hoy), igual que los
  **6 casos existentes** ⇒ 13 pass, como preveía el plan.
- **Paso 2 — cambio aplicado (11 líneas en el helper + JSDoc; archivo de producción):** en
  `formatearFechaCorta` (a) `fechaISO.split("-")` sigue siendo la **primera** sentencia (conserva el
  `TypeError` de contrato, Q3/CL-08); (b) patrón **anclado** `^\d{4}-\d{2}-\d{2}$` —exactamente 4/2/2
  dígitos— ⇒ `FECHA_NEUTRA`; (c) **mes** validado (1–12) **antes** de indexar `MESES_ES` ⇒
  `FECHA_NEUTRA`; (d) salida válida `${Number(dia)} ${MESES_ES[numeroMes - 1]} ${Number(anio)}`
  (día/año con `Number`, **sin** validar día ni año: `"2026-10-99"` ⇒ `"99 oct 2026"` y
  `"0000-01-01"` ⇒ `"1 ene 0"`). Una **única constante** `const FECHA_NEUTRA = "—";` (guion largo
  **U+2014**, verificado por `codePointAt` ⇒ `0x2014`) cubre **todos** los caminos inválidos.
  JSDoc (RF-12): cabecera `@datos` (formato estricto, mes validado, neutro y contrato de **cadena**) y
  comentario del helper reescritos; **no** citan plantillas inexistentes.
- **Paso 3 — sin cambios colaterales:** `git diff` del archivo se limita a la cabecera, al comentario
  del helper y al cuerpo del helper. `MESES_ES` (`:12-15`), `formatearMonto`, el orden descendente
  (`localeCompare`), los tokens `text-cat-income`/`text-cat-expense`, la fuente `tabular-nums`, el
  estado vacío («Sin movimientos este mes») y el `<li>` del log (el neutro ocupa el mismo lugar en
  `:54`) quedan **intactos** (RF-10).
- **AC-12 por inspección del diff: pass.** `grep -nE "typeof|trim|try\s*\{|catch"` sobre
  `LogMovimientos.jsx` ⇒ **0 coincidencias**: no hay guarda de tipo, ni conversión, ni `trim`, ni
  `try/catch`; el `TypeError` se mantiene porque `split` va primero (CL-08; sin pruebas de entradas
  no-cadena, como ordena la spec).
- **Paso 4 — verde (validaciones reportadas):**
  1. `npx vitest run src/components/domain/dashboard/LogMovimientos.test.jsx`: **1 archivo / 24 tests —
     pass (0 fallos)** ⇒ **pass** (6 casos existentes **intactos** + 7 filas AC-06 + 11 filas AC-07 =
     24; delta exactamente **6 → 24**, el previsto).
  2. `npm test` (global): **28 archivos / 373 tests — pass (0 fallos)** ⇒ **pass** (línea base
     posterior a T5 = 28/355 + los 18 casos nuevos ⇒ delta exactamente **+18**).
  3. `npm run build`: **verde** ⇒ **pass**. Tamaños: `dist/assets/index-*.css` **57.49 kB**, gzip
     **9.48 kB** (idéntico a T3/T4/T5) y `dist/assets/index-*.js` **382.95 kB**, gzip **122.09 kB**
     (T5: 382.86 kB / 122.04 kB) por el código minificado de la validación; sin CSS nuevo (el neutro
     no añade reglas).
- **Validación visual: no aplicable** (corrección (3): mismo marcado y misma línea; el neutro sustituye
  al texto de fecha; §2.2/§10-6) ⇒ **no declarada como realizada**.
- **Archivos:** `src/components/domain/dashboard/LogMovimientos.jsx` (producción: helper + 2 bloques
  JSDoc) y `src/components/domain/dashboard/LogMovimientos.test.jsx` (2 tablas nuevas + import). Sin
  dependencias nuevas, sin hexadecimales nuevos, sin animaciones, nombres en español, sin `git add -A`,
  sin staging ni commit; `MEMORY.md` sin tocar (le corresponde a la Tarea 8).
- **Discrepancias:** ninguna. Todas las filas de ambas tablas dan lo previsto por la spec (§5.1 CL-07) y
  el delta medido coincide con el esperado (6 → 24 local; 355 → 373 global).

---

## Tarea 7 — Barrido de no-regresión del inventario y de los consumidores ✅ COMPLETADA (2026-10-17)

**Objetivo:** confirmar que el cambio de medición no altera lo que cada suite afirma medir.
**Archivos:** solo si un ajuste está justificado: stub o aserción de una suite del inventario (nunca
código de producción; §7.2-6 de la spec).
**Pasos:**
1. Repetir el comando focalizado de la Tarea 1 y comparar **suite por suite** con su línea base.
2. Vigilar en particular: `useDeslizarParaCerrar.test.js`, `ModalTarjeta.test.jsx`,
   `cierreDeModales.test.jsx`, `DashboardDrawer.test.jsx`, `AuthModal.test.jsx`,
   `DashboardLayout.test.jsx`, `PanelTarjetas.test.jsx`, `App.test.jsx`, `main.test.jsx`.
3. Revisar por `grep` que **no** quede ningún stub local incoherente (`matches` fijo con `innerWidth`
   afirmado) salvo el mock de AC-02, que debe seguir **solo** dentro de su caso.
4. Si alguna aserción falla, documentar el hallazgo (qué medía), ajustar **solo** la aserción o el
   stub y registrar el cambio; si no, no tocar nada.
**Verificación:** el comando focalizado del inventario (Tarea 1).
**Cubre:** RF-11, RF-13; AC-09 (preparación), AC-11, AC-13.
**Hecho cuando:** cada suite del inventario tiene su resultado explicado frente a la línea base, no
queda stub incoherente fuera de AC-02 y todo ajuste realizado está justificado por lo que la suite
mide.

**Resultado T7 (2026-10-17, solo medición y verificación; sin cambios de archivos —ningún ajuste de
aserción ni de stub fue necesario—; `MEMORY.md` sin tocar, le corresponde a la Tarea 8):**

- **Paso 0 (re-lectura):** no se edita ningún archivo del inventario en esta tarea, pero se
  re-verificó por lectura que los stubs locales vigentes siguen siendo los descritos (T1/T2/T3) y que
  nada había derivado (CL-12 sin incidencias).
- **Paso 1 — comando focalizado de la T1, suite por suite (casos antes → después, estado):**

  | Suite | T1 (base) | T7 (medido) | Δ | Estado |
  |---|---|---|---|---|
  | `src/hooks/useBreakpoint.test.js` | 27 | **29** | +2 | pass |
  | `src/hooks/useDeslizarParaCerrar.test.js` | 18 | **18** | 0 | pass |
  | `src/components/domain/dashboard/LogMovimientos.test.jsx` | 6 | **24** | +18 | pass |
  | `src/components/domain/modales/AuthModal.test.jsx` | 15 | **15** | 0 | pass |
  | `src/components/ModalTarjeta.test.jsx` | 18 | **18** | 0 | pass |
  | `src/components/layout/Header.test.jsx` | 3 | **3** | 0 | pass |
  | `src/components/layout/BottomNav.test.jsx` | 13 | **13** | 0 | pass |
  | `src/components/layout/SidebarNavContenido.test.jsx` | 17 | **17** | 0 | pass |
  | `src/components/layout/SidebarResponsive.test.jsx` | 32 | **32** | 0 | pass |
  | `src/components/layout/DashboardDrawer.test.jsx` | 23 | **23** | 0 | pass |
  | `src/components/layout/DashboardUserModal.test.jsx` | 26 | **27** | +1 | pass |
  | `src/components/layout/cierreDeModales.test.jsx` | 22 | **22** | 0 | pass |
  | `src/layout/DashboardLayout.test.jsx` | 23 | **23** | 0 | pass |
  | `src/pages/PanelTarjetas.test.jsx` | 12 | **12** | 0 | pass |
  | `src/App.test.jsx` | 11 | **11** | 0 | pass |
  | `src/main.test.jsx` | 1 | **1** | 0 | pass |
  | **Total** | **267** | **288** | **+21** | **pass** |

  Comando: `npx vitest run src/hooks/useBreakpoint.test.js src/hooks/useDeslizarParaCerrar.test.js
  src/components/domain/dashboard/LogMovimientos.test.jsx src/components/domain/modales/AuthModal.test.jsx
  src/components/ModalTarjeta.test.jsx src/components/layout src/layout/DashboardLayout.test.jsx
  src/pages/PanelTarjetas.test.jsx src/App.test.jsx src/main.test.jsx` ⇒ **16 archivos / 288 tests —
  pass (0 fallos)**.

- **Atribución de los deltas (todos previstos, ninguno imprevisto):** los únicos tres cambios de
  recuento son los declarados por T2–T6 —`useBreakpoint.test.js` **27 → 29** (los 2 casos nuevos de
  AC-01/AC-02, T4), `LogMovimientos.test.jsx` **6 → 24** (7 filas AC-06 + 11 filas AC-07, T6) y
  `DashboardUserModal.test.jsx` **26 → 27** (1 caso de coherencia del stub local, T3)—. **Las 13
  suites restantes conservan su recuento exacto** de la T1; `AuthModal.test.jsx` **15 → 15** y
  `ModalTarjeta.test.jsx` **18 → 18** como exigen AC-05/DP-06 y la vigilancia de §7.2. El delta total
  **+21 = +2 +18 +1** cierra sin residuo.
- **Paso 2 — suites vigiladas en particular: ninguna cambió de resultado.** `useDeslizarParaCerrar.test.js`
  (18), `ModalTarjeta.test.jsx` (18), `cierreDeModales.test.jsx` (22), `DashboardDrawer.test.jsx`
  (23), `AuthModal.test.jsx` (15), `DashboardLayout.test.jsx` (23 – sustituye el hook y no depende
  del stub), `PanelTarjetas.test.jsx` (12), `App.test.jsx` (11) y `main.test.jsx` (1) quedan **todos
  pass con el recuento de la línea base**. **Ninguna aserción falló ⇒ no se ajustó nada** (paso 4:
  «si no, no tocar nada», cumplido literalmente).
- **Paso 3 — revisión de stubs locales incoherentes por `grep`.** Cruce de archivos que usan
  `matchMedia` e `innerWidth` en `src/`: solo las 6 suites del inventario de §7.1-B/C más la suite
  nueva y el hook. Estado de cada stub local:
  - **Coherentes** (`matches` derivado del `innerWidth` en la misma llamada): `AuthModal.test.jsx`
    (:20-33 ± `fijarViewport` :36-43), `ModalTarjeta.test.jsx` (:39-52), `cierreDeModales.test.jsx`
    (:50-63), `DashboardDrawer.test.jsx` (:34-52), `DashboardUserModal.test.jsx` (default
    `restaurarViewportEscritorio` :56-62, derivado del `innerWidth`) y `useDeslizarParaCerrar.test.js`
    (`configurarAncho` :62-66 deriva ambos `matches` del ancho; default 375 ⇒ `false`×2 coherente).
  - **Excepción única permitida:** el mock **deliberadamente incoherente** de **AC-02** sigue
    **solo dentro de su caso** (`useBreakpoint.test.js:308-331`, `innerWidth` 1024 con
    `matches: false`); no se propagó a ningún otro stub. Confirmado por `grep`.
  - **Caso documentado y conservado por mandato (no es un stub nuevo ni un ajuste):** dentro del
    `describe` del gesto de `DashboardUserModal.test.jsx` (`:312-321`), `activarMovil` usa
    `mockMatchMedia(false)` con `innerWidth` 375 (coherente en ambas queries) y
    `activarPantallasGrandes` usa un **predicado** `query.includes("min-width: 768px")` con
    `innerWidth` 1024 (coherente para la query de 768px; no decide nada del estado de banda de
    1024px, que ese caso no aserta). No es un `matches` fijo: la **spec ordena conservar ese
    `describe` literal** (AC-13, §7.1-B) y el plan §4 ya documenta esta misma lectura ⇒ **no se
    toca**.
  - **`grep` de `matches: false` fijo:** las únicas ocurrencias fuera de la excepción de AC-02 son
    los valores iniciales del mock de `useBreakpoint.test.js:29-36` (la suite los deriva después con
    `configurarAncho`), el fallback de consulta ajena del mock de `useDeslizarParaCerrar.test.js:88-95`
    (default coherente 375) y un sustituto de la propia suite de `entornoDeMedicion.test.js:56`
    (verifica precisamente que las consultas sin `min-width` dan `false`). Ninguno afirma un
    `innerWidth` incoherente. ⇒ **no queda ningún stub incoherente fuera de AC-02.**
- **Paso 4 — sin ajustes:** ninguna aserción falló, así que no se modificó ni una aserción ni un
  stub. **Cero archivos escritos por esta tarea** (`git status` no muestra cambios nuevos respecto
  a T6). **Sin `git add -A`, sin staging ni commit; `MEMORY.md` sin tocar.**
- **Validaciones reportadas:**
  1. Comando focalizado del inventario: **16 archivos / 288 tests — pass** (tabla).
  2. `npm test` (global): **28 archivos / 373 tests — pass (0 fallos)** ⇒ idéntico a T6.
  3. `npm run build`: **verde** (`dist/assets/index-*.css` **57.49 kB**, gzip **9.48 kB**;
     `dist/assets/index-*.js` **382.95 kB**, gzip **122.09 kB**), mismos tamaños que T6.
- **Validación visual: no aplicable** (esta tarea solo mide; §10-6). **AC-04:** **no ejecutado**.
- **Discrepancias:** ninguna. La no-regresión queda cerrada: cada suite del inventario conserva su
  resultado frente a la T1, los tres deltas están atribuidos a T3/T4/T6 y no aparece ningún stub
  incoherente fuera de la excepción AC-02.

---

## Tarea 8 — Documentación y auditoría de alcance ✅ COMPLETADA (2026-10-17)

**Objetivo:** dejar el registro y comprobar que nada se salió del alcance.
**Archivos:** `MEMORY.md` (entrada nueva); verificación de cabeceras JSDoc.
**Pasos:**
1. Añadir a `MEMORY.md` la entrada de la spec 012: las tres correcciones, Q1/Q2/Q3, el stub global y
   el local (DP-12), las cifras **medidas**, y el orden «012 primero; la 011 se re-mide después».
   Sin datos sensibles.
2. Verificar que **solo** cambiaron las cabeceras de `useBreakpoint.js` y `LogMovimientos.jsx`
   (RF-12), siguiendo la plantilla real `.agents/skills/file-hearder-template.md/SKILL.md`, y que
   `AuthModal.jsx` quedó excluido.
3. Auditoría de alcance: `git diff --stat` (solo los archivos de §3.1 del plan), `grep` de `fadeIn`
   (⇒ 0), `grep` de hexadecimales nuevos y comprobación de que `package.json` no cambió.
**Verificación:** `git diff --stat` + `grep` (RF-11/RF-12).
**Cubre:** RF-11, RF-12; AC-10.
**Hecho cuando:** `MEMORY.md` documenta el cambio y su medición, las cabeceras actualizadas son solo
las dos previstas y el diff no contiene archivos ni datos fuera de alcance.

**Resultado T8 (2026-10-17, solo documentación y auditoría: `MEMORY.md` + este `tasks.md`; ningún
archivo de código, prueba o configuración editado por esta tarea):**

- **Paso 0 (re-lectura):** se releyeron `AGENTS.md`, `doc/constitution.md`, los bloques `### Spec 009`
  y `### Spec 010` de `MEMORY.md` (referencia de formato), `.agents/rules/rules.md`, la spec 012 +
  `plan.md` + `tasks.md` y la plantilla real
  `.agents/skills/file-hearder-template.md/SKILL.md`; `git status --short` mostró el estado esperado
  tras T2–T7 (solo los archivos del alcance modificados y aún sin commitear + `MEMORY.md`);
  **ningún artefacto dejó de aplicar** (CL-12 sin incidencias).
- **Paso 1 — entrada de la spec 012 en `MEMORY.md`:** se añadió la sección
  `### Spec 012 — Correcciones menores: … (en curso)` al final, tras el bloque de la spec 010. Registra:
  las **tres correcciones** (fuente única en `useBreakpoint.js`; retirada de la clase muerta
  `animate-fadeIn` con diff 1/1; `formatearFechaCorta` estricto con mes validado y neutro **U+2014**),
  **Q1/Q2/Q3** (opción b / a / b), el **stub global** de `vitest.setup.js` y el **stub local** de
  `DashboardUserModal.test.jsx` (**DP-12**, coordinación con la 011) con la **excepción única** del mock
  incoherente de AC-02, las **cifras medidas** (línea base T1 `348/27` → `373/28`; build CSS 57.49 kB /
  JS 382.95 kB; inventario 267 → 288 con los tres deltas atribuidos suite por suite), el **orden «012
  primero; la 011 se re-mide después»** y el cierre «sin commit ni staging». **Sin datos sensibles**
  (no hay credenciales, tokens ni datos financieros reales; solo cifras de demo ya públicas en el
  repositorio).
- **Paso 2 — cabeceras JSDoc (RF-12):** verificado por diff que **solo** cambiaron las cabeceras de
  `useBreakpoint.js` (`@datos` declara la fuente única; `@estados`, la inicialización por `matchMedia`)
  y `LogMovimientos.jsx` (`@datos` con formato estricto / mes validado / neutro / contrato de cadena, y
  el comentario del helper reescrito). Ambas siguen los campos de la plantilla real
  (`.agents/skills/file-hearder-template.md/SKILL.md`: `@uso`, `@funciones`, `@datos`, `@eventos`,
  `@estados`, `@usadoPor`) y **no** citan rutas de plantilla inexistentes. **`AuthModal.jsx` quedó
  excluido:** `git diff --numstat` de ese archivo = **1/1** y la única línea tocada es la **124**;
  su cabecera (`:1-11`) **no** se modificó.
- **Paso 3 — auditoría de alcance:**
  1. **`git diff --stat` — pass.** Código/pruebas de la 012 = **7 archivos modificados + 1 nuevo
     (+180 / −26)**, exactamente los de §3.1 del plan (`git diff --numstat`): `src/hooks/useBreakpoint.js`
     (**+4/−4**), `src/hooks/useBreakpoint.test.js` (**+72/−0**),
     `src/components/domain/modales/AuthModal.jsx` (**+1/−1**),
     `src/components/domain/dashboard/LogMovimientos.jsx` (**+25/−5**),
     `src/components/domain/dashboard/LogMovimientos.test.jsx` (**+35/−1**),
     `vitest.setup.js` (**+20/−12**), `src/components/layout/DashboardUserModal.test.jsx` (**+23/−3**) y
     el nuevo `src/entornoDeMedicion.test.js` (untracked). **Excepciones ajenas a la 012** (preexistentes,
     reportadas y no tocadas): borrados `.pi/agents/*.md` (4) + `.pi/modes.config.json`,
     `M vite.config.js` (retirada manual del bloque `test` por el usuario, ya presente en la T1) y
     `?? analicis-completo-cambios.md`. `src/styles/index.css`, `src/App.*`, `src/config/*` y
     `src/data/*` **sin diff**.
  2. **`grep` de `fadeIn` — pass:** `grep -rn -E "fadeIn|fade-in|fade_in" src/` ⇒ **0** coincidencias
     (exit 1). La capa exterior de `AuthModal` conserva `fixed`, `inset-0`, `z-50`, `bg-black/70` y
     `backdrop-blur-sm`.
  3. **`grep` de hexadecimales nuevos — pass:** sobre las líneas **añadidas** del diff (`git diff -U0
     -- src vitest.setup.js | grep '^+'`), patrón `#[0-9a-fA-F]{3,8}` ⇒ **0** coincidencias.
  4. **`package.json` sin cambios — pass:** `git diff -- package.json` vacío (0 líneas); sin
     dependencias nuevas ni cambios de scripts.
- **Paso 4 — validaciones globales (reportadas):**
  1. **`npm test`: 28 archivos / 373 tests — pass (0 fallos)**, `Duration 5.84s`; idéntico a la
     medición de la Tarea 7. Incluye la suite nueva `src/entornoDeMedicion.test.js` (4).
  2. **`npm run build`: verde** (`vite v5.4.21`, 2030 módulos): `dist/index.html` **1.11 kB** (gzip
     0.60), CSS **57.49 kB** (gzip 9.48), JS **382.95 kB** (gzip 122.09); mismos tamaños que T6/T7.
  3. **AC-04: no ejecutado** (jsdom siempre tiene `window`), nunca verde.
  4. **Validación visual: no aplicable / no declarada como realizada** (la clase retirada no generaba
     reglas y el defecto de la corrección (1) solo sería observable en el borde de 768px; §10-6).
- **Archivos escritos por esta tarea:** **solo** `MEMORY.md` (entrada de la spec 012) y este `tasks.md`
  (marca ✅ y este resultado). Ningún cambio de producción, pruebas ni configuración. Sin
  dependencias nuevas, sin hexadecimales, sin animaciones, nombres en español, **sin `git add -A`, sin
  commit ni staging**. Sin tocar `specs/011-*` ni `specs/010-*`.
- **Discrepancias:** ninguna. El diff encaja exactamente con §3.1 del plan; las únicas entradas fuera
  del alcance de la 012 son las manuales ya documentadas en la Tarea 1 y se reportan sin tocarlas.

---

## Tarea 9 — Validación final: suite completa, build y atribución ✅ COMPLETADA (2026-10-17)

**Objetivo:** cerrar con la medición global y la comparación contra la línea base.
**Archivos:** ninguno (solo ejecución y reporte).
**Pasos:**
1. `npm test` (suite completa) y registrar `Test Files` / `Tests` globales.
2. `npm run build` y registrar el resultado (tamaños de CSS/JS).
3. Re-ejecutar el comando focalizado del inventario para la **atribución suite por suite**:
   casos antes → casos después y **pass / fail / no ejecutado**.
4. Comparar con la línea base de la Tarea 1 y explicar cualquier diferencia; **AC-04 se reporta
   «no ejecutado»** (jsdom siempre tiene `window`), nunca verde.
5. Dejar constancia de la coordinación pendiente: la 011 se re-mide **después** contra este estado; la
   011 no se toca.
**Verificación:** `npm test`, `npm run build`, comando focalizado del inventario.
**Cubre:** RF-11; AC-09, AC-10 (con Tarea 8) y el reporte de AC-04.
**Hecho cuando:** la suite completa y el build pasan, la tabla de atribución por suite está completa y
toda diferencia frente a la línea base está explicada; sin commit ni staging.

**Resultado T9 (2026-10-17, solo ejecución y reporte; ningún archivo de código, prueba o configuración
editado por esta tarea —solo `tasks.md` y `MEMORY.md`; sin tocar la 011 ni la 010):**

- **Paso 0 (re-lectura):** se releyeron `AGENTS.md`, `doc/constitution.md`, `MEMORY.md` (bloques de
  specs 009/010/012), `.agents/rules/rules.md`, la spec 012 + `plan.md` + `tasks.md` y los resultados
  de T1–T8 antes de medir. `git status --short` mostró exactamente el estado heredado de T8 (7 archivos
  del alcance + `MEMORY.md` + el nuevo `src/entornoDeMedicion.test.js`, más las excepciones ajenas ya
  documentadas en T1: borrados en `.pi/`, `M vite.config.js` y `?? analicis-completo-cambios.md`).
  **Ningún artefacto dejó de aplicar** (CL-12 sin incidencias).

- **Validación 1 — `npm test` (suite completa): pass.** `Test Files  28 passed (28)` /
  `Tests  373 passed (373)` — **0 fallos**, `Duration 5.77s`. Línea base T1: **27 archivos / 348
  tests**. Delta medido: **+1 archivo / +25 tests**, atribuido por completo a la spec 012 (ver tabla
  de atribución: +2 `useBreakpoint.test.js` +18 `LogMovimientos.test.jsx` +1
  `DashboardUserModal.test.jsx` +4 `entornoDeMedicion.test.js` = **+25**; el archivo nuevo
  `src/entornoDeMedicion.test.js` es el **+1**). Nótese que el total global (373) no coincide con la
  suma del comando focalizado (288) porque la suite completa incluye los 12 archivos restantes fuera
  del inventario.

- **Validación 2 — `npm run build`: pass.** `vite v5.4.21`, 2030 módulos, `✓ built in 3.30s`:
  `dist/index.html` **1.11 kB** (gzip 0.60 kB), `dist/assets/index-B0_ZOIQp.css` **57.49 kB**
  (gzip **9.48 kB**), `dist/assets/index-CF3xkdKE.js` **382.95 kB** (gzip **122.09 kB**). Tamaños
  **idénticos** a la línea base de T1 (CSS 57.49 kB / gzip 9.48 kB) y al build de T6/T7/T8
  (JS 382.95 kB / gzip 122.09 kB); el CSS invariante confirma que las tres correcciones no añadieron
  reglas (CL-11).

- **Validación 3 — comando focalizado del inventario: 16 archivos / 288 tests — pass (0 fallos)**,
  `Duration 2.84s`. Tabla de atribución **suite por suite** (casos antes = línea base T1 → casos
  después = T9):

  | Suite | T1 (base) | T9 (medido) | Δ | Estado |
  |---|---|---|---|---|
  | `src/hooks/useBreakpoint.test.js` | 27 | **29** | +2 | pass |
  | `src/hooks/useDeslizarParaCerrar.test.js` | 18 | **18** | 0 | pass |
  | `src/components/domain/dashboard/LogMovimientos.test.jsx` | 6 | **24** | +18 | pass |
  | `src/components/domain/modales/AuthModal.test.jsx` | 15 | **15** | 0 | pass |
  | `src/components/ModalTarjeta.test.jsx` | 18 | **18** | 0 | pass |
  | `src/components/layout/Header.test.jsx` | 3 | **3** | 0 | pass |
  | `src/components/layout/BottomNav.test.jsx` | 13 | **13** | 0 | pass |
  | `src/components/layout/SidebarNavContenido.test.jsx` | 17 | **17** | 0 | pass |
  | `src/components/layout/SidebarResponsive.test.jsx` | 32 | **32** | 0 | pass |
  | `src/components/layout/DashboardDrawer.test.jsx` | 23 | **23** | 0 | pass |
  | `src/components/layout/DashboardUserModal.test.jsx` | 26 | **27** | +1 | pass |
  | `src/components/layout/cierreDeModales.test.jsx` | 22 | **22** | 0 | pass |
  | `src/layout/DashboardLayout.test.jsx` | 23 | **23** | 0 | pass |
  | `src/pages/PanelTarjetas.test.jsx` | 12 | **12** | 0 | pass |
  | `src/App.test.jsx` | 11 | **11** | 0 | pass |
  | `src/main.test.jsx` | 1 | **1** | 0 | pass |
  | **Total** | **267** | **288** | **+21** | **pass** |

  Ninguna suite cambia de **estado** (las 16 pasan; 0 `fail`, 0 `no ejecutado` en este comando). Los
  únicos tres cambios de **recuento** son los declarados por T3/T4/T6: `useBreakpoint.test.js`
  **27 → 29** (AC-01/AC-02, T4), `LogMovimientos.test.jsx` **6 → 24** (7 filas AC-06 + 11 filas AC-07,
  T6) y `DashboardUserModal.test.jsx` **26 → 27** (1 caso de coherencia del stub local, T3). Las **13
  suites restantes** conservan su recuento exacto; el delta total **+21 = +2 +18 +1** cierra sin
  residuo. Coincide con la medición intermedia de T7 (267 → 288): **la 012 no introdujo deriva tras
  T7**.

- **Paso 4 — comparación con la línea base de la Tarea 1 y explicación de diferencias.** Línea base
  global T1 = **27 archivos / 348 tests (0 fallos)**; T9 = **28 archivos / 373 tests (0 fallos)**.
  **Ninguna suite empeora** (0 fallos nuevos) y toda diferencia está explicada por los casos nuevos de
  la 012 (`+2` hook, `+18` helper, `+1` modal de cuenta, `+4` suite nueva del entorno de medición =
  **+25**), más el **+1 archivo** que aporta `src/entornoDeMedicion.test.js`. El inventario focalizado
  pasa de **267** (T1) a **288** (T9) = **+21**, exactamente la suma de los tres deltas locales previstos
  (`+2 +18 +1`); la suite nueva del entorno global (`entornoDeMedicion.test.js`, 4 casos) vive **fuera**
  del comando focalizado del inventario, por eso no aparece en esa tabla y sí en el total global.
  **Discrepancias:** ninguna. El recuento de `DashboardUserModal.test.jsx` manda según el medido en T1
  (**26**, no los 20 que citaba la spec: deriva por edición manual, DP-21).

- **AC-04: NO EJECUTADO** (jsdom siempre tiene `window`, así que la rama «sin entorno de medición» de
  `useBreakpoint` no es verificable en esta suite). Se declara **no cubierto / no ejecutado**, **nunca
  verde**. El `describe` nominal «primer render sin medición disponible (SSR)» de
  `useBreakpoint.test.js` no simula su ausencia y **no** se declara cubierto por esta medición.

- **Coordinación pendiente (registro):** el orden acordado «**012 primero, la 011 se re-mide después**»
  se cumple: esta Tarea 9 cierra la 012 y deja el estado (**medición única** en el hook + **entorno de
  pruebas coherente**) contra el que la **spec 011** debe **re-medirse** en su propia fase. **La 011 no
  se ha tocado:** `git status --short -- specs/011-foco-de-superficies-y-cruce specs/011-retorno-de-foco-drawer`
  muestra únicamente `?? specs/011-foco-de-superficies-y-cruce/` (documento **sin seguimiento**, sin
  modificar); `specs/010-*` no aparece en el estado. La 012 no modifica ningún archivo de la 011.

- **Estado del repositorio al cierre:** **sin `git add -A`, sin commit y sin staging**
  (`git diff --cached --stat` vacío). `git diff --stat` = los 7 archivos del alcance de §3.1 del plan
  (`useBreakpoint.js` +4/−4, `useBreakpoint.test.js` +72, `AuthModal.jsx` +1/−1, `LogMovimientos.jsx`
  +25/−5, `LogMovimientos.test.jsx`, `vitest.setup.js`, `DashboardUserModal.test.jsx`) + `MEMORY.md` +
  las excepciones ajenas preexistentes (borrados en `.pi/`, `M vite.config.js`), más
  `?? src/entornoDeMedicion.test.js`. Ningún archivo fuera de §3.1 del plan escrito por esta tarea.

- **Validación visual: no declarada como realizada** (la clase retirada no generaba reglas; la única
  corrección con efecto visual potencial —la (1)— solo sería observable en el borde de 768px; §10-6).
  **Sin dependencias nuevas, sin hexadecimales nuevos, sin animaciones.**

- **Discrepancias:** ninguna. Suite completa y build verdes, la tabla de atribución está completa y
  toda diferencia frente a la T1 queda explicada; **la spec 012 queda lista para cerrar** con la
  medición global registrada.

---

## Resumen de orden y dependencias

| Orden | Tarea | Depende de | Cubre |
|---|---|---|---|
| 1 | Paso 0: inventario y línea base | — | precondición de AC-09 |
| 2 | Stub global coherente + suite dedicada | T1 | AC-11 (RF-13) |
| 3 | Stub local del modal de cuenta | T1 (independiente de T2) | AC-13 (RF-13, DP-12) |
| 4 | `useBreakpoint`: fuente única | T2 y T3 (entorno coherente primero) | AC-01, AC-02, AC-03 (RF-01…RF-05, RF-12) |
| 5 | `AuthModal`: clase muerta | T1 | AC-05 (RF-06, RF-07) |
| 6 | `formatearFechaCorta` | T1 | AC-06, AC-07, AC-08, AC-12 (RF-08…RF-10, RF-12) |
| 7 | Barrido de no-regresión | T2…T6 | AC-09 (preparación), AC-11, AC-13 |
| 8 | Documentación y auditoría | T5…T7 | AC-10 (RF-11, RF-12) |
| 9 | Validación final | todas | AC-09, reporte de AC-04 |

**Deltas esperados de casos** (a confirmar midiendo; §7.2 de la spec): `useBreakpoint.test.js`
27 → 29; `LogMovimientos.test.jsx` 6 → 24 (dos tablas: 7 + 11); `DashboardUserModal.test.jsx` **+1**
(la spec cita 20 casos, el archivo declara 26 `it(` al 2026-10-17: manda el recuento de la Tarea 1);
`src/entornoDeMedicion.test.js` nuevo (4); `AuthModal.test.jsx` 15 → 15 (la corrección (2) no añade
casos: AC-05, DP-06). Las cifras 27/6/15 están confirmadas por lectura del repositorio el 2026-10-17
(`it(` + filas de `it.each`).
