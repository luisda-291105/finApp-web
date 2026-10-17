# Tasks 011 — Devolución de foco de las cuatro superficies modales y traslado de foco al cruzar el corte de 768px

**Estado:** borrador
**Plan base:** `specs/011-foco-de-superficies-y-cruce/plan.md` (spec `011` **aprobada** por el usuario
el 2026-10-17 y verificada por el reviewer: «SPEC OK PARA PLANIFICAR»)
**Máx. 10 tareas** — orden de ejecución; cada tarea declara los RF/AC que cubre y su verificación.

> **Regla común a todas las tareas**
> 1. **Orden con la 012 (crítico, H4):** la **012 se implementa PRIMERO**; la 011 se re-mide **después**
>    contra el estado resultante (011 §3/§9/§10-1; 012 §3.4). La Tarea 1 lo **comprueba** antes de tocar
>    código y **para** si el stub local de `DashboardUserModal.test.jsx` no es coherente.
> 2. **Paso 0 obligatorio:** re-leer el código real de cada archivo antes de editarlo (DP-21: el usuario
>    edita a mano). Si un artefacto que el plan espera ya no existe, se registra como «ya no aplicable»,
>    **no** se recrea. Las líneas citadas son del 2026-10-17 y **deben** re-verificarse.
> 3. **Cambios mínimos y localizados**, sin reformatear líneas ajenas al objetivo y sin migraciones
>    generales.
> 4. **Criterio único de pruebas: ampliar sí, reescribir no.** Se **añaden** casos; **ningún** caso
>    vigente se modifica ni se debilita; el recuento crece. La **única** excepción prevista (stub local
>    de `DashboardUserModal.test.jsx`) pertenece a la **012**: esta spec **no** toca esa suite.
> 5. **Validación:** se ejecuta la prueba indicada y se reporta **pass / fail / no ejecutado**. Nada se
>    declara verde sin medirse. `npm test` y `npm run build` se reservan para la Tarea 10.
> 6. **Límites duros:** sin props nuevas ni cambios de firma (RF-07), sin `refs` nuevas desde los
>    consumidores, sin dependencias, sin hexadecimales nuevos, ≤3 superficies translúcidas y ≤2 blobs
>    por vista, **sin animaciones ni transiciones nuevas** (RF-17), corte de 768px y contrato de 4 props
>    de `useBreakpoint` (009) y mapa de rutas **intactos** (RF-16).
> 7. **Navegador:** ninguna tarea de esta spec decide criterios con **[navegador]**; la corrección **no**
>    cambia aspecto, marcado ni movimiento. Si al implementar apareciera algún efecto visual, se registra
>    como excepción y se valida en navegador (o se registra como **no ejecutado**).
> 8. **No se toca:** `specs/010-*/` (DP-09/AC-19), `specs/012-*/`, `src/components/layout/BottomNav.jsx`,
>    `SidebarResponsive.jsx`, `SidebarNavContenido.jsx`, `BotonCerrar.jsx`, `useCierreConEsc.js`,
>    `useDeslizarParaCerrar.js`, `useBreakpoint.js`, `vitest.setup.js`, `vitest.config.js`,
>    `vite.config.js`, `package.json`, `src/config/*`, `src/data/*` y `src/App.jsx` (mapa de rutas).
> 9. **Sin commit ni staging.** No usar `git add -A`; de git solo lecturas
>    (`git status --porcelain --untracked-files=all`, `git diff --stat`).
> 10. **Cabeceras JSDoc** con la plantilla real
>    `.agents/skills/file-hearder-template.md/SKILL.md` (con el typo); `AGENTS.md`/`doc/constitution.md`/
>    `.agents/rules/rules.md` citan `.agents/file-header-template.md`, que **no existe**: se avisa de la
>    inconsistencia. Los archivos **nuevos** de esta spec llevan esa cabecera.
> 11. **Al terminar cada tarea** se añade su entrada en `MEMORY.md` (estado **medido** y decisiones).

---

## Tarea 1 — Paso 0 (post-012) y limpieza del puntero antiguo

**Estado:** ✅ **Hecha** (2026-10-17, medida post-012). Solo lectura sobre `src/`; la carpeta antigua
`specs/011-retorno-de-foco-drawer/` resultó **ya no aplicable** (no existía). Línea base post-012:
8 archivos / 151 casos (alcance 011) y 28 archivos / 373 casos (`npm test`); `npm run build` verde.

**Objetivo:** fijar el estado real **después** de implementada la 012, medir la línea base atribuida
suite por suite, congelar las referencias `archivo:línea` y **eliminar la carpeta antigua**
`specs/011-retorno-de-foco-drawer/` (tarea ordenada por el usuario como **primera**). Tarea de
**solo lectura** sobre el código: no se edita ningún archivo de `src/`.

**Archivos:** solo `specs/011-retorno-de-foco-drawer/` (se elimina la carpeta y su nota «MOVED»).
*Resultado:* **ninguno** (la carpeta ya no existe ⇒ «ya no aplicable», CL-15). Los únicos archivos
escritos por esta tarea son `plan.md`, `tasks.md` y `MEMORY.md` (documentación); `src/` intacto.
**Verificación de solo lectura:** `src/hooks/useBreakpoint.js`, `src/components/layout/DashboardUserModal.test.jsx`,
`vitest.setup.js`, los 8 archivos de prueba del alcance y los 7 archivos de producto de §1 del plan.

**RF que cubre:** ninguno directamente (habilita RF-01..RF-19); sostiene la atribución de **AC-17** y
**AC-19**.
**AC que cubre:** prepara **AC-17** (línea base re-medida), **AC-19** (la 010 intacta) y **AC-16**.

**Prueba relevante:** la línea base del alcance completo de la 011 (plan §6.4) y los greps de auditoría.

**Comando:**
`npx vitest run src/components/layout/DashboardDrawer.test.jsx src/components/layout/DashboardUserModal.test.jsx src/components/layout/cierreDeModales.test.jsx src/layout/DashboardLayout.test.jsx src/components/domain/modales/AuthModal.test.jsx src/components/ModalTarjeta.test.jsx src/pages/PanelTarjetas.test.jsx src/App.test.jsx`
(las dos suites **nuevas** aún no existen) y, como contraste, `npm test`.

**Hecho cuando:**
- [x] **012 implementada (comprobación bloqueante):** el stub **local** de
      `DashboardUserModal.test.jsx` (`:38-48` `mockMatchMedia`/`:56-62`
      `restaurarViewportEscritorio`) deriva `matches` de `innerWidth` (ya no es
      `innerWidth=1024` con `matches=false`) y el caso del respaldo lateral (`:285-309`) mide «pantallas
      grandes». **Si no, se PARA y se avisa**: sin ese ajuste, la Tarea 4 no puede cerrar verde.
- [x] **Línea base registrada** del alcance de la 011: **archivo por archivo** (pass/fail/nº de casos),
      con las dos cifras medidas (alcance 011 y `npm test` completo). Se anotan las discrepancias con
      `MEMORY.md` (registra 253/21, 257/22 y 348/27): **la cifra válida es la medida hoy**.
      *Resultado (2026-10-17, post-012):* alcance 011 = **8 archivos / 151 casos / 0 fail**
      (`App 11`, `ModalTarjeta 18`, `DashboardLayout 23`, `PanelTarjetas 12`, `DashboardDrawer 23`,
      `DashboardUserModal 27`, `cierreDeModales 22`, `AuthModal 15`); `npm test` = **28 archivos /
      373 casos / 0 fail**. Coincide con la cifra post-012 de `MEMORY.md` (28/373); las de 253/21,
      257/22 y 348/27 son anteriores y quedan superadas. `npm run build`: verde.
- [x] **Criterios que hoy fallan** confirmados como rojos antes de la corrección: AC-01 (drawer),
      AC-10 (`AuthModal`), AC-12(ii) y AC-13 (layout), AC-22 (`/login`) y AC-24 (cadena).
      *Resultado:* sondas ejecutables **fuera del repo** (`/tmp/opencode/011/pruebas-rojas/`, sin tocar
      `src/`) → **7 fail | 2 pass**. Rojos confirmados: **AC-01** (el montaje cerrado del drawer enfoca
      el botón «Menú»: `focus()` llamado 1 vez), **AC-10** (`AuthModal` no captura ni devuelve: el foco
      queda en `body`), **AC-12(ii)** (cruce móvil → ≥768px sin menú: el foco no pasa al control
      lateral), **AC-13** (cruce ≥768px → móvil: el foco no pasa al botón «Menú»), **AC-22** en
      escritorio (`/login`: el foco queda en `body`) y **AC-24** (disparador `disabled`: el foco acaba en
      `body`). **Aviso de enmascaramiento:** AC-13 y AC-22-móvil **pasan hoy con los hijos reales por el
      robo de foco del drawer (AC-01), no por el mecanismo exigido**; se registran como rojo del
      mecanismo con los mocks de la suite.
- [x] **Referencias re-verificadas** una a una (y corregidas en el plan si alguna se movió):
      `DashboardDrawer.jsx:72-78,:81-90,:92`; `DashboardUserModal.jsx:83-93,:96`;
      `AuthModal.jsx:48-68`; `ModalTarjeta.jsx:44-45,:49-61`; `DashboardLayout.jsx:62-72,:115,:127`;
      `PaginaLogin.jsx:20-31`; `BottomNav.jsx:70-82`; `SidebarResponsive.jsx:26-36,:39-61`;
      `Header.jsx:42`; `useBreakpoint.js:12,38-73`; `DashboardLayout.test.jsx:294-312,:316-329,:331-343`;
      `DashboardUserModal.test.jsx:239-309`; `ModalTarjeta.test.jsx:263-301`;
      `cierreDeModales.test.jsx:130-172`; `PanelTarjetas.test.jsx:138-165`.
      *Resultado:* todas re-leídas contra el código real. Corregidas en `plan.md` (y en esta lista) por
      haberse **movido** en la 012: stub de `DashboardUserModal.test.jsx` `:34-44`/`:47-50` →
      **`:38-48`/`:56-62`**; caso de respaldo lateral `:265-290` → **`:285-309`** (y los vigentes
      `:219-240,:242-263` → `:239-260,:262-283`); `vitest.setup.js:47-83` → **`:55-91`** (plan §0.9,
      §6.1). El resto sin cambios. `cierreDeModales.test.jsx:130-172` se confirma **correcto**: es el
      canario de geometría («andamiaje de geometría», describe en `:130`, cierra en `:172`), uno de los
      vigentes que la Tarea 9 no modifica; el caso «abrir «Cuenta» desde el menú» es `:312-340`.
- [x] **Carpeta antigua eliminada:** `specs/011-retorno-de-foco-drawer/` ya no existe (y con ella su
      `spec.md` con la nota «MOVED»). Ningún otro archivo se toca en esta operación.
      *Resultado:* **ya no aplicable (CL-15)**: no existe en disco, ni en el historial de git
      (`git log --all -- 'specs/011-retorno-de-foco-drawer*'` vacío), ni en `git ls-files specs`. No se
      recrea ni se borra nada.
- [x] **AC-19 congelado:** `sha256sum` (o `stat`) de `specs/010-cierre-de-modales/{spec,plan,tasks}.md`
      anotado para la comparación final, y `git status --porcelain --untracked-files=all` registrado
      (aviso: los documentos de la 010 son **sin trackear**: su integridad se comprueba por hash/mtime,
      no por git).
      *Resultado:* `spec.md` `69d84001…f7982`, `plan.md` `b7fc73fc…3d8e4`, `tasks.md` `ddb354cd…d5d5b`
      (mtime 2026-10-16, anterior a esta spec). **Corrección del aviso:** en el repo actual los tres
      documentos **sí están trackeados** (commit `c341f17`); `git status --porcelain` y
      `git diff --stat -- specs/010-cierre-de-modales/` salen **vacíos** ⇒ la 010 está intacta por git
      y por hash.
- [x] **Sin ediciones de código**: `git status --porcelain --untracked-files=all` no muestra cambios en
      `src/` atribuibles a esta tarea.
      *Resultado:* `git status` no lista **ningún** archivo de `src/`; solo aparecen cambios ajenos a
      esta spec ya presentes (borrados `.pi/agents/*.md` y `.pi/modes.config.json`, alta de
      `analicis-completo-cambios.md` y de `specs/011-foco-de-superficies-y-cruce/*`).

---

## Tarea 2 — Pieza compartida `useRetornoDeFoco` (M1) y su suite

**Estado:** ✅ **Hecha** (2026-10-17, post-012, TDD rojo→verde). Solo se **crean** los dos archivos
nuevos (`src/hooks/useRetornoDeFoco.js` y `src/hooks/useRetornoDeFoco.test.js`); **ninguna** suite ni
código de producción existente se modifica. Suite nueva **29/29 verde**; `npm test` **29 archivos /
402 casos / 0 fail** (línea base post-012: 28/373 → +1 archivo / +29 casos); `npm run build` verde.

**Objetivo:** implementar **una sola vez** la regla común de devolución de foco: captura incondicional
al abrir, guarda de transición abierta → cerrada, cadena determinista **con comprobación del
resultado**, respaldo **por versión de vista** y limitación explícita cuando no hay candidato.
Exporta además el resolutor puro `resolverControlDeVista(esMovil)`, que reutilizará la Tarea 8.

**Archivos:**
- `src/hooks/useRetornoDeFoco.js` **(nuevo)** — cabecera JSDoc según la plantilla real.
- `src/hooks/useRetornoDeFoco.test.js` **(nuevo)**.

**RF que cubre:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07 (no recibe props nuevas de los
consumidores) y RF-16 (no altera contratos).
**AC que cubre:** AC-05, AC-06, AC-15, AC-23, AC-24 (y sostiene AC-01/AC-02/AC-03/AC-10 de las tareas
siguientes).

**Prueba relevante:** suite **nueva** de la pieza, con una superficie falsa controlable (bloque
`abierto`/`no abierto`) que dispare la transición de `activo`, y control explícito de `matchMedia`
(coherente con `innerWidth`) en cada caso de versión de vista.

**Comando:** `npx vitest run src/hooks/useRetornoDeFoco.test.js`

**Hecho cuando:**
- [x] **RF-01/RF-02:** con la superficie **cerrada** desde el montaje, la pieza hace **0** llamadas a
      `focus()` sobre los candidatos y `document.activeElement` no cambia; con **dos** re-renders
      cerrados, tampoco.
      *Resultado:* 2 casos verdes (montaje cerrado con el disparador y el respaldo siendo el **mismo**
      nodo —el caso enmascarado del drawer—, `focus()` 0 veces y `activeElement` intacto; y dos
      re-renders cerrados —uno con `triggerRef` de identidad nueva— sin mover el foco).
- [x] **RF-02/CL-14:** la transición abre → cierra ejecuta **una** devolución; cerrar sin haber abierto
      (`activo` inicial `false`) ejecuta **cero**.
      *Resultado:* 3 casos verdes: abre→cierra = 1 llamada y `activeElement` = disparador; los
      re-renders posteriores al cierre no repiten (sigue 1); el cierre sin apertura previa = 0.
      Añadido un caso con `<StrictMode>` (CL-14): el montaje **abierto** solo captura (0 `focus()`) y
      el cierre devuelve exactamente una vez.
- [x] **RF-03:** la captura del elemento activo ocurre **al abrir** aunque no haya `triggerRef`, aunque
      el candidato `null` previsto esté desconectado y aunque el foco esté en `body` (se descarta
      `body`).
      *Resultado:* 3 casos verdes: sin `triggerRef`, con `triggerRef.current` desconectado, y con el
      foco en `body` al abrir (se descarta y la cadena cae al respaldo móvil).
- [x] **RF-04/AC-24:** la cadena recorre y **continúa** ante candidatos `null`, `body`, desconectados,
      `disabled` y dentro de subárboles `inert`/`[aria-hidden="true"]`, y también cuando el candidato
      está conectado pero **no** queda enfocado tras el intento (`document.activeElement !== candidato`).
      *Resultado:* 8 casos verdes (null, `body`, desconectado, `disabled` conectado, subárbol `inert`,
      subárbol `aria-hidden`, `<div>` conectado que no admite foco, y cadena completa inválida →
      respaldo). **Nota medida:** una sonda en jsdom 25 confirmó que `.focus()` **sí** enfoca nodos
      dentro de `inert`/`aria-hidden` (jsdom no implementa esa inhibición); por eso la pieza los
      **descarta antes** de intentar el foco (`SELECTOR_NO_ENFOCABLE`) y el caso tiene señal real.
- [x] **RF-05/AC-06:** respaldo parametrizado: **móvil del dashboard** → botón
      `button[aria-label="Abrir menú"]`; **≥768px del dashboard** → `aside[role="navigation"] button`;
      **landing** → **primer control enfocable** en orden de documento con
      `a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])`, excluyendo
      subárboles `[role="dialog"]` y `disabled`. En los tres casos, `document.activeElement` **nunca**
      queda en `body` si existe candidato.
      *Resultado:* 4 casos verdes (móvil; ≥768px; landing —descarta el botón del `[role="dialog"]` y el
      `disabled` previos y enfoca el `a[href]` del logo—; y precedencia del control de la versión
      actual cuando coexisten ambos controles estables). En los tres casos se aserta además
      `activeElement !== document.body`.
- [x] **AC-15/AC-23:** sin control estable y sin ningún enfocable en la vista, el resolutor devuelve
      `null` y **no** hay `focus()` ni excepción (limitación explícita, sin marcado ficticio ni
      `scrollIntoView`).
      *Resultado:* 2 casos verdes: `resolverControlDeVista(true|false)` → `null` con una vista sin
      controles, y la transición completa no lanza y deja `activeElement` en `document.body`.
- [x] **AC-05:** con `triggerRef` **conectado**, la devolución usa ese nodo (1 llamada) y no el
      respaldo; con `triggerRef` **desconectado**, cae al elemento capturado y, si este falta, al
      respaldo.
      *Resultado:* 3 casos verdes: conectado → 1 llamada al disparador y 0 al capturado y al respaldo;
      desconectado → elemento capturado; sin `triggerRef` y sin captura válida → respaldo «Menú».
- [x] **RF-07:** la firma es `{ activo, triggerRef }` (con `triggerRef` opcional) y **no** añade props al
      consumidor; ningún caso de la suite necesita props nuevas.
      *Resultado:* 3 casos verdes (solo `activo`; llamada sin argumentos sin lanzar;
      `resolverControlDeVista` exportado como función). Firma final:
      `useRetornoDeFoco({ activo = false, triggerRef } = {})`.
- [x] Cabecera JSDoc del archivo nuevo según la plantilla real (con `@uso`, `@funciones`, `@datos`,
      `@eventos`, `@estados`, `@usadoPor`).
      *Resultado:* cabecera completa en `useRetornoDeFoco.js`, más el JSDoc de contrato del resolutor
      y del hook. Aviso (ya registrado en el plan §0.7): `AGENTS.md` / `doc/constitution.md` /
      `.agents/rules/rules.md` citan `.agents/file-header-template.md`, **ruta que no existe**; la
      plantilla real es `.agents/skills/file-hearder-template.md/SKILL.md` (typo «hearder»).
- [x] Suite verde y **sin** modificar ninguna suite existente.
      *Resultado:* `npx vitest run src/hooks/useRetornoDeFoco.test.js` → **29/29 pass** (rojo previo
      registrado: import `./useRetornoDeFoco` no resoluble). Ninguna suite existente tocada; `git
      status` solo muestra los 2 archivos nuevos de `src/hooks/`.

---

## Tarea 3 — `DashboardDrawer`: paridad M4 (RF-08)

**Estado:** ✅ **Hecha** (2026-10-17, TDD rojo→verde). Se retiraron los dos efectos propios del drawer
(`:72-78` captura condicional y `:81-90` cadena sin validar) y se delegó la devolución en
`useRetornoDeFoco({ activo: abierto, triggerRef })`; se conservó el `if (!abierto) return null` (`:92`)
y todo el cromo, incluida la trampa real. Suite del drawer **23 → 28 casos** (+5 nuevos; los vigentes,
incluidos los dos de retorno `:341-384`, **sin editar**). Rojo previo medido: **3 fail / 25 pass**
(AC-01: el montaje cerrado enfocaba «Menú»; AC-02: doble devolución; AC-05: el foco quedaba en
`body`). Verde tras la corrección: **28/28**. `npm test` **29 archivos / 407 casos / 0 fail** (baseline
T2: 402); `npm run build` verde. Sin cambios de props, clases, textos, dependencias ni hexadecimales.

**Objetivo:** sustituir la lógica propia del drawer (captura **condicional** en `:72-78` y cadena **sin
validar** en `:81-90`) por la pieza compartida, de modo que el montaje cerrado ya **no** enfoque el
botón «Menú» y que el respaldo móvil siga siendo ese mismo control.

**Archivos:**
- `src/components/layout/DashboardDrawer.jsx` (se retiran los dos efectos propios y se llama a la
  pieza; **se conserva** el `if (!abierto) return null` de `:92` y todo el cromo, incluida la trampa
  real).
- `src/components/layout/DashboardDrawer.test.jsx` (**ampliar**: casos nuevos; los vigentes, incluidos
  los dos de retorno de foco `:341-384`, **sin modificar**).

**RF que cubre:** RF-06, RF-08, RF-16, RF-19.
**AC que cubre:** AC-01, AC-02, AC-05, AC-07, AC-10 (parte), AC-24 (parte).

**Prueba relevante:** `DashboardDrawer.test.jsx` (se amplía) — trampa real sin `vi.mock("focus-trap-react"`.

**Comando:** `npx vitest run src/components/layout/DashboardDrawer.test.jsx`

**Hecho cuando:**
- [x] **AC-01 (hoy falla):** con `triggerRef` **conectado** y `abierto={false}` desde el montaje, el
      botón «Menú» **no** recibe `focus()` (espía sobre el nodo) y `document.activeElement` no cambia.
      *Resultado:* caso nuevo verde tras la corrección; **rojo medido antes** (el `focus()` se invocaba
      **1** vez sobre el botón «Menú»). Con `useRetornoDeFoco` la guarda de transición corta la
      devolución en el montaje cerrado.
- [x] **AC-02:** con `abierto` en `true` y después `false`, la devolución al disparador ocurre **una**
      sola vez; re-renders posteriores cerrados **no** repiten.
      *Resultado:* caso nuevo verde; **rojo medido antes** (2 llamadas a `focus()` en el segundo
      re-render cerrado). Ahora 1 devolución, también con identidad nueva del `ref` (`triggerRef`
      distinto) tras el cierre.
- [x] **AC-05:** disparador **desconectado** → la cadena usa el elemento capturado y, si falta, el
      respaldo móvil; el foco **nunca** queda en `body` existiendo candidato.
      *Resultado:* 2 casos nuevos verdes (disparador retirado del DOM → elemento capturado, con
      `focus()` **0** veces sobre el nodo desconectado; sin captura válida → botón
      `button[aria-label="Abrir menú"]` de respaldo; en ambos `activeElement !== document.body`).
- [x] **AC-24 (parte):** un candidato `disabled` no corta la cadena.
      *Resultado:* caso nuevo verde: con el disparador `disabled` como primer candidato, el `.focus()`
      no queda en él y la cadena continúa al elemento capturado.
- [x] **AC-07:** se mantienen la trampa real, «X», Esc (mecanismo único), clic en backdrop, clic en el
      panel sin cerrar y los gestos que **no** cierran: los casos vigentes pasan **sin cambios**.
      *Resultado:* los 23 casos vigentes pasan **sin editarse**; el diff de la suite es **solo
      adiciones** (0 líneas eliminadas); no se añadió `vi.mock("focus-trap-react")`.
- [x] **No-regresión medida:** la suite queda verde con **nº de casos ≥** el de la línea base de la
      Tarea 1 (los dos casos de retorno `:341-384` verdes **sin editar**).
      *Resultado:* baseline T1 `DashboardDrawer 23` → hoy **28** casos verdes (0 fail); los dos casos
      de «restauración de foco al cerrar» verdes sin editar.
- [x] Cabecera JSDoc actualizada: `@estados`/`@eventos` describen la devolución de foco delegada en la
      pieza y el respaldo móvil; **sin** tocar clases, props ni texto de interfaz.
      *Resultado:* `@eventos` cita la transición abierta → cerrada delegada en `useRetornoDeFoco`;
      `@estados` describe la guarda, la cadena validada y el respaldo móvil (botón «Menú», el mismo
      nodo que `triggerRef`). Cero cambios en clases, props y textos.

---

## Tarea 4 — `DashboardUserModal`: respaldo por versión de vista (RF-09)

**Objetivo:** que el respaldo estable del modal de cuenta se resuelva **por la versión de vista** con la
pieza compartida (móvil → botón «Menú»; ≥768px → control lateral), sin props nuevas y conservando la
cadena M4 y la firma `{ abierto, alCerrar, triggerRef? }`.

**Archivos:**
- `src/components/layout/DashboardUserModal.jsx` (el respaldo propio de `:96` pasa a la pieza).
- `src/components/layout/DashboardUserModal.test.jsx` (**ampliar**; caso vigente del respaldo lateral
  `:285-309` y los de `:239-283` **sin modificar**).

**RF que cubre:** RF-06, RF-09, RF-16, RF-19.
**AC que cubre:** AC-05, AC-06, AC-10 (parte), AC-24 (parte); **reutiliza** la coherencia de la 012.

**Prueba relevante:** `DashboardUserModal.test.jsx` (se amplía) con control explícito de `matchMedia`
(coherente con `innerWidth`) por caso.

**Comando:** `npx vitest run src/components/layout/DashboardUserModal.test.jsx`

**Hecho cuando:**
- [x] **Paso 0 bloqueante:** se confirma que la 012 está aplicada (Tarea 1) y que el caso `:285-309`
      mide «pantallas grandes»; la suite está **verde** antes de tocar el componente.
      *Resultado:* la 012 está commiteada (`8aa9f0f`) y el stub local deriva `matches` de `innerWidth`;
      línea base medida antes de tocar nada: **27/27 pass**.
- [x] **AC-06 (móvil):** con `innerWidth` móvil y un `button[aria-label="Abrir menú"]` presente en el
      DOM, sin disparador y con el elemento capturado desconectado, el foco acaba en **ese** botón.
      *Resultado:* caso nuevo verde tras la migración (rojo previo: el foco quedaba en `body`).
- [x] **AC-06 (≥768px):** el caso vigente `:285-309` sigue verde **sin cambios** (control lateral).
      *Resultado:* verde **sin editar**; además se añadió un caso con `matchMedia` explícito a 1024 en
      el que, existiendo también el botón «Menú», el respaldo elegido es el control lateral.
- [x] **AC-05:** disparador conectado → 1 devolución a ese nodo; disparador desconectado → capturado →
      respaldo por versión de vista; **nunca** `body`.
      *Resultado:* dos casos nuevos (conectado = 1 `focus()` y `activeElement` = disparador;
      desconectado = elemento capturado, 0 `focus()` sobre el nodo desconectado, `activeElement !== body`).
- [x] **AC-24 (parte):** candidato `disabled`/`inert` → la cadena continúa.
      *Resultado:* dos casos nuevos verdes tras la migración (rojo previo: `disabled` dejaba el foco en
      `body`; `inert` se enfocaba en jsdom).
- [x] **Montaje cerrado sin robo:** `abierto={false}` desde el montaje no enfoca ningún candidato.
      *Resultado:* caso nuevo verde (0 `focus()` sobre disparador y respaldo; `activeElement` sin cambios).
- [x] **No-regresión medida:** suite verde con nº de casos ≥ línea base; los casos vigentes de cierre
      (clic fuera, Esc, «X», gesto, convivencia con la trampa) pasan **sin editarse**.
      *Resultado:* `DashboardUserModal` **27 → 34** casos verdes (0 fail); el diff de la suite es **solo
      adiciones** (192 líneas añadidas, **0** eliminadas). `npm test` **29 archivos / 414 casos / 0 fail**.
- [x] Cabecera JSDoc actualizada (respaldo por versión de vista vía `useBreakpoint`), sin cambiar props
      ni contenido.
      *Resultado:* `@eventos`/`@estados` describen la devolución delegada en `useRetornoDeFoco` y el
      respaldo por versión de vista; cero cambios en props, clases, marcado y textos.

---

## Tarea 5 — `AuthModal`: captura y devolución de foco (RF-10)

**Objetivo:** cubrir el hueco de la 010: el `AuthModal` **captura** el elemento activo al abrir y
**devuelve** el foco al cerrar, con la pieza compartida. En la **landing** el respaldo es el **primer
control enfocable**; en `/login` rige la **limitación explícita** (H2), sin marcado nuevo.

**Archivos:**
- `src/components/domain/modales/AuthModal.jsx` (se añade la llamada a la pieza; **no** se toca el
  marcado, ni las clases —incluida la clase muerta retirada por la 012—, ni el aspecto).
- `src/components/domain/modales/AuthModal.test.jsx` (**ampliar**; casos vigentes **sin modificar**).

**RF que cubre:** RF-06, RF-10, RF-16, RF-19.
**AC que cubre:** AC-06, AC-08 (parte), AC-10 (parte).

**Prueba relevante:** `AuthModal.test.jsx` (se amplía) con el patrón propio de `matchMedia`
(`:20-43`) y una vista de landing mínima alrededor.

**Comando:** `npx vitest run src/components/domain/modales/AuthModal.test.jsx`

**Hecho cuando:**
- [x] **AC-10 (hoy falla):** montado abierto con un disparador enfocado antes del render, al cerrar el
      foco vuelve a **ese** disparador (1 devolución).
      *Resultado:* caso nuevo verde tras añadir la pieza (rojo previo medido: 0 devoluciones y foco en
      `body` tras el desmontaje).
- [x] **AC-06 (landing):** sin disparador válido, el cierre deja el foco en el **primer control
      enfocable** de la vista (no en `body`, no en un nodo dentro de `[role="dialog"]`).
      *Resultado:* caso nuevo verde con un enlace de landing mínima (`a[href="/"]` en orden de
      documento); rojo previo: el foco quedaba en `body`.
- [x] **AC-06 (`/login`):** cerrando el modal en la vista `/login` (sin ningún enfocable fuera del
      modal) la pieza devuelve `null`: **no** hay `focus()` sobre `body` ni excepción (limitación
      explícita).
      *Resultado:* caso nuevo verde (espía `document.body.focus` sin llamadas; 0 enfocables fuera de
      `[role="dialog"]`, evidencia de H2); el paso intermedio por `body` queda documentado.
- [x] **AC-08 (parte):** montado **cerrado** no hay captura ni devolución y ningún `focus()` sobre los
      candidatos.
      *Resultado:* caso nuevo verde (`abierto={false}` con disparador enfocado y respaldo de landing
      presentes: 0 `focus()`, `activeElement` sin cambios).
- [x] **No-regresión medida:** suite verde con nº de casos ≥ línea base; los casos vigentes («X», clic
      fuera, Esc con el foco en un campo, clic dentro, gesto en móvil) pasan **sin editarse**.
      *Resultado:* `AuthModal.test.jsx` **15 → 19** casos verdes (0 fail); el diff de la suite es solo
      adiciones (el único cambio fuera de los casos nuevos es `act` en la línea de import). `npm test`
      **29 archivos / 418 casos / 0 fail**.
- [x] Cabecera JSDoc actualizada (`@eventos`/`@estados`: captura y devolución), sin tocar props ni
      contenido.
      *Resultado:* `@eventos`/`@estados` describen la captura al abrir y la devolución vía
      `useRetornoDeFoco`; cero cambios en props, marcado, clases (sin reintroducir `animate-fadeIn`) y
      en el bloque `fetch` (DP-21).

---

## Tarea 6 — `ModalTarjeta`: migración al patrón M4 (RF-11, H12)

**Objetivo:** dejar de devolver el foco en la **limpieza** del efecto y gobernarlo por la transición
**abierta → cerrada** con la pieza compartida, conservando captura, foco inicial al contenedor,
bloqueo de scroll, **trampa manual**, gesto, Esc, clic fuera y contrato `{ tarjeta, onCerrar }`.

**Archivos:**
- `src/components/domain/modales/ModalTarjeta.jsx` (se divide el efecto de `:49-61`: apertura + scroll
  en un efecto con limpieza **sin** `focus()`; la devolución pasa a la pieza; se retira `refActivador`).
- `src/components/ModalTarjeta.test.jsx` (**ampliar**; los casos vigentes de foco `:263-301` **sin
  modificar**).
- `src/pages/PanelTarjetas.test.jsx` (**verificar**; caso de retorno al activador `:138-165` **sin
  modificar**).

**RF que cubre:** RF-06, RF-11, RF-16, RF-19.
**AC que cubre:** AC-05, AC-08, AC-11, AC-10 (parte).

**Prueba relevante:** `ModalTarjeta.test.jsx` ampliado + `PanelTarjetas.test.jsx` como no-regresión de
integración.

**Comando:**
`npx vitest run src/components/ModalTarjeta.test.jsx src/pages/PanelTarjetas.test.jsx`

**Hecho cuando:**
- [x] **AC-08/CL-11 (hoy falla en el camino de la limpieza):** **ningún** `focus()` sobre el activador
      cuando la limpieza del efecto corre sin cierre real: (i) montaje **con tarjeta activa** (el foco
      acaba en el contenedor del diálogo, no en el activador) y (ii) cambio de tarjeta sin cierre.
      *Resultado:* dos casos nuevos. (i) `montar con tarjeta activa`: 0 `focus()` sobre el activador
      (conectado y enfocado antes del render) y `document.activeElement` = contenedor del diálogo —
      verde antes y después (no había limpieza en el montaje sin `StrictMode`; fija la garantía).
      (ii) `cambiar de tarjeta sin cierre` (`rerender` con otra tarjeta): **rojo** previo
      (`refActivador.current?.focus?.()` en la limpieza → 1 llamada) → verde tras dividir el efecto.
- [x] **AC-11/CL-14:** con **`StrictMode`** y tarjeta activa, **0** devoluciones al activador; el
      bloqueo del scroll y el foco inicial al contenedor se conservan.
      *Resultado:* caso nuevo con `StrictMode`: **rojo** previo (el doble montaje enfocaba al activador
      → 1 llamada) → verde (0 `focus()`); `overflow === "hidden"` y foco en el contenedor conservados.
- [x] **AC-05:** transición abierta → cerrada con activador **conectado** → foco en el activador;
      activador **desconectado** → cadena → respaldo estable (excluyendo `[role="dialog"]`); **nunca**
      `body` existiendo candidato.
      *Resultado:* dos casos nuevos. Con activador conectado (capturado al abrir) → `focus()` 1 vez y
      `activeElement` = activador (verde). Con activador **desconectado** antes del cierre → **rojo**
      previo (la limpieza enfocaba el nodo desconectado: respaldo 0 veces) → verde: cae al respaldo
      estable, `activeElement` ≠ `body` y 0 `focus()` sobre `body`.
- [x] **Trampa manual conservada:** Tab/Shift+Tab siguen ciclando dentro del diálogo (`atraparTab`,
      `:71-84`) y los casos vigentes de trampa pasan **sin editarse**.
      *Resultado:* `atraparTab` intacto; los casos vigentes de foco y trampa (`:263-301`) corren sin
      editar y verdes.
- [x] **Contrato y aspecto intactos:** firma `{ tarjeta, onCerrar }`, `tabIndex={-1}` del contenedor,
      animaciones existentes y contenido del modal **sin** cambios (RF-16/RF-17).
      *Resultado:* sin cambios en props, marcado, clases ni animaciones; `refActivador` retirado (ya no
      aparece en `src/`); `refDialogo`/`tabIndex={-1}` y las cuatro formas de cierre intactos.
- [x] **No-regresión medida:** `ModalTarjeta.test.jsx` y `PanelTarjetas.test.jsx` verdes con nº de casos
      ≥ línea base (los casos vigentes de retorno al activador verdes **sin editar**).
      *Resultado:* `ModalTarjeta.test.jsx` **18 → 23** casos (0 fail, solo adiciones — el único cambio
      fuera de los casos nuevos son `StrictMode`/`act` en los imports); `PanelTarjetas.test.jsx` **12**
      casos **sin editar**. Conjunto focalizado **35/35**; `npm test` **29 archivos / 423 casos / 0 fail**.
- [x] Cabecera JSDoc actualizada (`@eventos`/`@estados`: la devolución se gobierna por la transición de
      apertura y se delega en la pieza).
      *Resultado:* `@eventos`/`@estados` describen la captura al abrir y la devolución gobernada por
      `useRetornoDeFoco` por la transición de apertura; cero cambios en props, contenido ni clases.

---

## Tarea 7 — `DashboardLayout`: cruce bidireccional del corte (RF-12/RF-13/RF-14)

**Estado:** ✅ **Hecha** (2026-10-17, TDD rojo→verde). Canario `focusin` **pass** (estable en jsdom);
solo se modifican `src/layout/DashboardLayout.jsx` y `src/layout/DashboardLayout.test.jsx` (casos
vigentes sin editar). Suite del layout **23 → 29** casos verdes; `npm test` **29 archivos / 429 casos
/ 0 fail** (línea base 423 → +6); `npm run build` verde.

**Objetivo:** sustituir el efecto de un solo sentido (`:62-72`) por uno **bidireccional** que distingue
la dirección con un `ref` de la versión previa, cierra el panel superpuesto con traslado
**incondicional** al control lateral (camino vigente) y, **sin** panel abierto, traslada el foco
**solo** si el elemento enfocado pertenecía a la navegación que se desmonta (lectura simétrica), sin
robárselo a quien sobrevive.

**Archivos:**
- `src/layout/DashboardLayout.jsx` (efecto de cruce bidireccional + un **único** listener `focusin`
  sobre `document` que mantiene el recuerdo del origen del foco; selectores de la tabla M8 del plan).
- `src/layout/DashboardLayout.test.jsx` (**ampliar**: canario + casos nuevos; casos vigentes
  `:294-312` (firmas), `:316-329` (cruce con el menú abierto) y `:331-343` (convivencia) **sin
  modificar**).

**RF que cubre:** RF-12, RF-13, RF-14, RF-16, RF-19.
**AC que cubre:** AC-12, AC-13, AC-14, AC-15 (variante).

**Prueba relevante:** `DashboardLayout.test.jsx` con el patrón ya establecido de `useBreakpoint`
mockeado (`:24-26`) y re-render para cruzar de versión.

**Comando:** `npx vitest run src/layout/DashboardLayout.test.jsx`

**Hecho cuando:**
- [x] **Canario del mecanismo (primero):** se comprueba que jsdom despacha `focusin` en `.focus()` (y en
      el clic de `userEvent`) y que el recuerdo se actualiza y se **borra** al enfocar el contenido.
      **Si no se despacha**, AC-12(ii) y AC-13 se registran como revisión **no realizada** (nunca
      verdes) y **no** se rediseña el mecanismo: se documenta y se sigue (§2.3/M5 del plan).
      *Resultado:* **pass** — jsdom **sí** despacha `focusin` en `.focus()` y en el clic de `userEvent`
      (caso `Canario del mecanismo focusin (jsdom)`). El mecanismo es estable ⇒ AC-12(ii)/AC-13
      **verificables** (no se requirió la alternativa `focus`/`blur` en captura). El recuerdo se
      **actualiza/borra** se verifica de forma observable en AC-12(ii)/AC-13/AC-14.
- [x] **AC-12(i) sin cambios:** el caso vigente `:316-329` (menú abierto programáticamente, foco en
      `body`) pasa **sin editarlo** y el destino sigue siendo el control lateral.
      *Resultado:* verde **sin editar**; el camino (a) cierra el menú y traslada de forma incondicional
      al control lateral, con independencia del foco de origen (que estaba en `body`).
- [x] **AC-12(ii) (hoy falla):** cruce **móvil → ≥768px sin** el menú abierto, con el foco en un ítem
      de la navegación inferior (que se desmonta) → el foco acaba en `aside[role="navigation"] button`.
      *Resultado:* **rojo** previo (el foco quedaba en `body`) → **verde**; `activeElement` =
      `sidebar-toggle` (control lateral).
- [x] **AC-13 (hoy falla):** cruce **≥768px → móvil** con el foco en la navegación lateral (que se
      desmonta) → el foco acaba en `button[aria-label="Abrir menú"]`.
      *Resultado:* **rojo** previo (el foco quedaba en `body`) → **verde**; `activeElement` =
      `bottom-nav-menu` (botón «Menú», `button[aria-label="Abrir menú"]`).
- [x] **AC-14:** con el foco en el **contenido principal** (o en un elemento fuera de toda navegación)
      el cruce **no** mueve el foco (en ambos sentidos); el caso vigente `:331-343` (modal de cuenta
      abierto) sigue verde **sin cambios**.
      *Resultado:* 2 casos nuevos (`it.each`, ambos sentidos) con el foco en el contenido (`tabIndex=-1`)
      ⇒ `activeElement` intacto; el caso vigente `:331-343` **sin editar** y verde (no le roba el foco).
- [x] **AC-15 (variante):** si el control estable de la versión de destino no existe, se intenta el
      **otro** control estable y, en su defecto, el **primer control enfocable**; sin ninguno, el foco
      **no** se fuerza a `body`. (Si la variante no se considera estable en jsdom, se registra como
      **no ejecutada** y se cubre con la suite de la pieza en la Tarea 2, **sin** declararla aprobada.)
      *Resultado:* **ejecutada y verde** — con la versión de destino montada **sin** su control estable
      (`aside[role="navigation"]` sin botones, `mockImplementationOnce`), el cruce recae en el primer
      control enfocable de la vista; no se fuerza `body` (`trasladarFocoDeCruce` termina en `null` si no
      hay candidato). Estable en jsdom (3 ejecuciones consecutivas verdes).
- [x] **Un solo listener:** se registra **una** vez al montar el layout y se retira al desmontar; **no**
      se añade ninguna lectura nueva de `matchMedia`, ninguna prop y ninguna `ref` expuesta al
      consumidor (RF-07/H4).
      *Resultado:* **un** `useEffect(() => { document.addEventListener("focusin", …); return () =>
      removeEventListener }, [])`; los refs del cruce (`origenFocoRef`, `versionPreviaRef`) son internos
      y **no** se exponen; cero `matchMedia` nuevo (la versión viene de `useBreakpoint`), cero props ni
      `ref`s nuevas.
- [x] **No-regresión medida:** suite verde con nº de casos ≥ línea base y los casos vigentes de
      composición por versión, márgenes, navegación y apertura del modal **sin editarse**.
      *Resultado:* `DashboardLayout.test.jsx` **23 → 29** casos (0 fail, **solo adiciones** + `userEvent`
      en los imports). `:294-312` (firmas), `:316-329` (cruce con el menú abierto) y `:331-343`
      (convivencia) **sin editar**. `npm test` **29 archivos / 429 casos / 0 fail**; `npm run build`
      verde.
- [x] Cabecera JSDoc actualizada (`@eventos`: cruce en ambos sentidos con las dos condiciones).
      *Resultado:* `@eventos` describe el cruce bidireccional con el recuerdo por `focusin` y sus dos
      condiciones (panel abierto ⇒ cierre + traslado incondicional; sin panel ⇒ traslado solo si el
      foco pertenecía a la navegación desmontada), sin cambiar props, marcado ni clases.

---

## Tarea 8 — Cierre que navega: foco en la vista de destino (RF-15)

**Objetivo:** cuando el **cierre** de la superficie modal **cambia de ruta**, colocar el foco en la
vista de destino **una sola vez**, sin usar nodos de la vista de origen y sin afectar a las
navegaciones ordinarias.

**Archivos:**
- `src/hooks/useFocoEnVistaDestino.js` **(nuevo)** — lee `location.state.focoEnDestino`, espera al
  render de la vista de destino y aplica la lista ordenada de RF-15 reutilizando
  `resolverControlDeVista` de la pieza de la Tarea 2; guarda por `location.key` + `ref`.
- `src/hooks/useFocoEnVistaDestino.test.js` **(nuevo)**.
- `src/pages/PaginaLogin.jsx` (**una línea**: el cierre que navega escribe la marca en `location.state`;
  sin tocar rutas, contenido ni marcado).
- `src/layout/DashboardLayout.jsx` (consume la pieza: destino `/dashboard`).
- `src/pages/PaginaInicio.jsx` (consume la pieza: destino `/`).
- `src/App.test.jsx` (**ampliar**) y `src/components/domain/modales/AuthModal.test.jsx`
  (**ampliar**: origen `/login` → destino `/`; los casos vigentes **sin modificar**).

**RF que cubre:** RF-15, RF-16, RF-19.
**AC que cubre:** AC-22, AC-23, AC-25.

**Prueba relevante:** `App.test.jsx` con `MemoryRouter` (origen `/login` → destino), parametrizado por
versión de vista, + suite nueva de la pieza + caso de `/login` → `/` en `AuthModal.test.jsx`.

**Comando:**
`npx vitest run src/hooks/useFocoEnVistaDestino.test.js src/App.test.jsx src/components/domain/modales/AuthModal.test.jsx`

**Hecho cuando:**
- [x] **AC-22(a) (hoy falla):** en `/login`, cerrar el modal (X o Esc) navega a `/dashboard` y, **tras
      completarse la navegación**, `document.activeElement` es el control de la lista ordenada para la
      versión de vista efectiva (móvil → `button[aria-label="Abrir menú"]`; ≥768px → control lateral).
      Parametrizado por **versión de vista** (móvil y ≥768px).
      *Resultado:* **ejecutada y verde** — 3 casos nuevos en `App.test.jsx` (`it.each` móvil 375px /
      ≥768px 1024px cerrando con la «X» + un caso con **Esc** en móvil). Rojo medido **antes** de
      implementar: los 3 dejaban el foco en `body`. Verde tras implementar. Se espera al render de la
      vista de destino (`heading` «Tu dinero, en equilibrio.») y después al foco.
- [x] **AC-22(b):** con destino `/` (la landing), el foco acaba en el **primer control enfocable** de la
      vista (el enlace del logotipo). Caso con la ruta de origen `/login` y `TRIAL_ACTIVO` ajustado en el
      ámbito de la prueba (mock local de `config/app.config` **solo** en los casos nuevos; se comprueba
      antes por `grep` que los casos vigentes de esa suite no leen `TRIAL_ACTIVO`), o, si el mock
      resultara inestable en jsdom, caso de la **mitad de destino** con la marca inyectada
      (`initialEntries={[{ pathname: "/", state: { focoEnDestino: true } }]}`) y **registro de la
      limitación** en el informe (nunca declarado aprobado sin medirse).
      *Resultado:* **ejecutada y verde con el mock, que resultó estable en jsdom** (por tanto **no** se
      usó la variante de la mitad de destino ni se registra limitación). Caso nuevo en
      `AuthModal.test.jsx` con las rutas reales (`PaginaLogin` → `PaginaInicio`) en `MemoryRouter`.
      `grep TRIAL_ACTIVO` en esa suite **antes** de editar: **0 resultados** (ningún caso vigente lo lee).
      El mock es **local al caso**: getter con `vi.hoisted` que por defecto devuelve el **valor real**
      del módulo y solo se pone a `false` dentro del caso nuevo (restaurado en `afterEach`); el resto de
      la suite queda idéntico. Se asertan el logotipo (`header a[href="/"]`), que no es `body` y que es
      el **primer** control enfocable de la vista. Rojo medido antes de implementar (`activeElement` =
      `body`).
- [x] **AC-23:** destino **sin** ningún enfocable y con la marca presente → **no** hay `focus()`, ni
      excepción, ni marcado ficticio (limitación explícita).
      *Resultado:* **ejecutada y verde** en la suite nueva de la pieza
      (`useFocoEnVistaDestino.test.js`, destino con solo un `<p>` y la marca): 0 `focus()` (ni sobre
      `body`), sin excepción, `activeElement` sigue en `body`, **0** enfocables en la vista y recuento de
      nodos **sin cambios** (no se inventa marcado). Se cubre en la suite de la pieza porque con las
      rutas reales no existe un destino alcanzable sin controles.
- [x] **AC-25:** una navegación **ordinaria** (sin cierre de superficie) **no** mueve el foco; y en el
      destino, los re-renders posteriores **no** repiten la colocación (una sola vez por entrada de
      historial).
      *Resultado:* **ejecutada y verde** — `App.test.jsx`: navegación ordinaria a `/dashboard` y a `/`
      sin la marca ⇒ `activeElement` sigue en `body` (2 casos). `useFocoEnVistaDestino.test.js`: sin
      marca no hay `focus()`; con **StrictMode** y un re-render posterior, **una sola** llamada a
      `focus()`; y una **entrada de historial nueva** con la marca sí vuelve a colocar el foco (guarda
      por `location.key` + `ref`).
- [x] **CL-18:** el candidato elegido **nunca** pertenece a la vista de origen ni a un subárbol
      `[role="dialog"]`; el destino no usa identificadores de la vista de origen.
      *Resultado:* **ejecutada y verde** — caso de la pieza: con un `[role="dialog"]` (con un botón
      dentro) y un `disabled` antes del logotipo, el foco va al logotipo y **nunca** al botón del
      diálogo. Caso de `App.test.jsx`: tras `/login` → `/dashboard`, `queryByRole("dialog")` es `null`,
      el candidato vive en el `nav` del destino y no tiene ancestro `[role="dialog"]`.
- [x] **RF-16:** el mapa de rutas (`App.jsx:26-50`) **no** se modifica, `PaginaLogin` no gana marcado ni
      controles y no se añaden props a `AuthModal` (ni a ninguna superficie).
      *Resultado:* **verificado** — `git diff --stat -- src/App.jsx` **vacío**; en `PaginaLogin.jsx` el
      único cambio de código es la línea del `alCerrar` (marca en `location.state`), sin marcado,
      controles ni rutas nuevas; `AuthModal.jsx`, `DashboardDrawer.jsx`, `DashboardUserModal.jsx` y
      `ModalTarjeta.jsx` **no** se tocaron en esta tarea (firmas intactas: `export default function
      AuthModal({ abierto, modoInicial = "login", alCerrar })`); sin dependencias ni hexadecimales
      nuevos; `specs/010-*` y `specs/012-*` sin tocar.
- [x] **No-regresión medida:** `App.test.jsx` verde con nº de casos ≥ línea base (rutas públicas,
      `/login`, subrutas y sección de tarjetas verdes **sin editarse**); `AuthModal.test.jsx` verde con
      los casos vigentes intactos.
      *Resultado:* `App.test.jsx` **17/17** (línea base 11; +6 casos, **0 eliminados**: el diff solo
      borra las 3 líneas de cabecera y la línea del import de Testing Library). `AuthModal.test.jsx`
      **20/20** (línea base 19; +1 caso, **0 eliminados**). `npm test` **30 archivos / 444 casos /
      0 fail** (línea base 429/29 ⇒ +15 casos y +1 archivo, sin pérdidas).
- [x] Cabeceras JSDoc: la nueva pieza con la plantilla real; `PaginaLogin.jsx`, `PaginaInicio.jsx` y
      `DashboardLayout.jsx` actualizadas (`@eventos`/`@funciones`) sin cambiar props ni contenido.
      *Resultado:* `useFocoEnVistaDestino.js` con la cabecera de la plantilla real
      (`.agents/skills/file-hearder-template.md/SKILL.md`); `PaginaLogin.jsx` `@eventos` (marca en el
      estado de la ruta), `PaginaInicio.jsx` `@eventos` (vista de destino) y `DashboardLayout.jsx`
      `@eventos` (cierre que navega + `useFocoEnVistaDestino`) actualizados **solo** en documentación:
      sin props, marcado ni contenido nuevos.

---

## Tarea 9 — Suite transversal, auditoría de `grep`, cabeceras y AC-19

**Estado:** ✅ **Hecha** (2026-10-17). `cierreDeModales.test.jsx` **22 → 32** casos verdes (solo
adiciones: 6 líneas eliminadas = cabecera JSDoc + import; ningún caso vigente tocado). Matriz de
paridad AC-10 en las **cuatro** superficies reales × 2 versiones de vista (8 casos); AC-11 y AC-14
(1 cada uno, **cruce forzado en jsdom** con mock controlable de `matchMedia`). `npm test`
**30 archivos / 454 casos / 0 fail** (línea base 444/30 ⇒ +10, 0 eliminados); `npm run build` verde.
Auditoría: `vi.mock("focus-trap-react"` ⇒ 0; `displayCheck` ⇒ 0; `min-width` solo en
`useBreakpoint.js` y pruebas; `DashboardLayout.test.jsx` **29/29** (firmas `:295-313` sin cambios);
`package.json` y hex sin cambios. AC-19: `sha256sum` de la 010 **idéntico** al de la Tarea 1 y
`git status` de `specs/010-*/` **vacío**. Cabeceras JSDoc: 9/9 archivos de producto con los 6 campos
de la plantilla real (sin cambios de código).

**Objetivo:** verificar la **misma regla** en las cuatro superficies **reales**, confirmar la
no-regresión documental y dejar el árbol en condiciones para la validación final.

**Archivos:**
- `src/components/layout/cierreDeModales.test.jsx` (**ampliar**: casos nuevos; canario, matriz,
  integración y dos capas vigentes **sin modificar**).
- Cabeceras JSDoc de los archivos de producto tocados (`DashboardDrawer.jsx`,
  `DashboardUserModal.jsx`, `AuthModal.jsx`, `ModalTarjeta.jsx`, `DashboardLayout.jsx`,
  `PaginaLogin.jsx`, `PaginaInicio.jsx`) — **solo** documentación.
- **Nada** de `specs/010-*/` ni `specs/012-*/`.

**RF que cubre:** RF-06, RF-18, RF-19.
**AC que cubre:** AC-10, AC-11, AC-14 (convivencia real), AC-16, AC-18, AC-19, AC-20, AC-21.

**Prueba relevante:** `cierreDeModales.test.jsx` (se amplía) con las superficies reales y la trampa real.

**Comando:**
`npx vitest run src/components/layout/cierreDeModales.test.jsx` + los `grep` de auditoría del plan §8.

**Hecho cuando:**
- [x] **AC-10 (paridad):** el **mismo** escenario (disparador ausente/desconectado → devolución) se
      verifica en las **cuatro** superficies reales y el destino coincide con lo que exige RF-05; ninguna
      queda en `body` existiendo candidato.
      *Resultado:* **8 casos nuevos verdes** (`describe.each` × `it.each`): las cuatro superficies con
      disparador **desconectado** (`document.createElement("button")` fuera del árbol) y elemento previo
      inválido (`body`), cerradas por su propio control, en **móvil (375px) → botón «Menú»** y
      **≥768px (1024px) → control lateral**. En los 8, `document.activeElement` **es** el respaldo de
      RF-05 y **≠** `body`. Mismo escenario observable en las cuatro ⇒ RF-06.
- [x] **AC-11:** ampliación del caso de convivencia: con el menú superpuesto y «Cuenta» abiertos, cerrar
      «Cuenta» deja el foco en el respaldo del menú (botón «Menú»), sin doble devolución.
      *Resultado:* **caso nuevo verde** en el `describe` de integración (menú real + «Cuenta» real):
      tras cerrar «Cuenta», `document.activeElement` es el botón «Abrir menú» (el mismo nodo del
      `triggerRef`), la espía `vi.spyOn(botonMenu, "focus")` se invoca **1** vez (sin doble devolución),
      el menú sigue cerrado y no queda ninguna superficie abierta (0 `dialog`).
- [x] **AC-14 (convivencia real):** con el modal **real** abierto, un cruce de versión de vista **no**
      roba el foco ni cierra el modal. Se registra si el cruce se pudo forzar en jsdom (mock
      controlable de `matchMedia`) o si se deja como **no ejecutado**.
      *Resultado:* **ejecutada y verde — el cruce SÍ se pudo forzar en jsdom** con un mock controlable
      de `matchMedia` (registra los oyentes de `change` y `fijarAncho` los dispara; el mock de
      `fijarViewport` no lo permite). Caso nuevo: con el modal de Cuenta real abierto y su trampa
      activada, el cruce móvil → pantallas grandes **no** mueve `document.activeElement` (sigue dentro
      del panel), el modal sigue montado y queda **1** `dialog`. Se asevera además que la composición
      cambió de verdad (`aside[role="navigation"]` ausente antes, presente después) ⇒ el cruce ocurrió,
      no fue un no-op. **No** se registra como no ejecutado.
- [x] **AC-16/AC-18 (grep):** `vi.mock("focus-trap-react"` (sin paréntesis de cierre) ⇒ **0**;
      `displayCheck` en `src/` ⇒ **0**; `min-width` **solo** en `src/hooks/useBreakpoint.js` y en
      pruebas; ninguna prop nueva en las firmas (`DashboardLayout.test.jsx:294-312` verde **sin
      cambios**); `package.json` sin dependencias nuevas; sin hex nuevos en el diff.
      *Resultado:* `grep -rn 'vi.mock("focus-trap-react"' src/` ⇒ **0**; `grep -rn 'displayCheck' src/`
      ⇒ **0**; `min-width` fuera de `useBreakpoint.js` y de pruebas ⇒ **0** (solo aparece en
      `useBreakpoint.js` [2] y en archivos `.test.*`); `npx vitest run src/layout/DashboardLayout.test.jsx`
      ⇒ **29/29 verde** con el caso de firmas **sin cambios**; `git diff -- package.json` **vacío**; en
      los añadidos del diff de `src/` (rastreados y hooks nuevos) ⇒ **0** hexadecimales.
- [x] **AC-19:** `sha256sum` (o `stat`) de `specs/010-cierre-de-modales/{spec,plan,tasks}.md` **idéntico**
      al de la Tarea 1 + `git status --porcelain --untracked-files=all` sin cambios en `specs/010-*/`.
      *Resultado:* `spec.md` `69d84001e19dc4…f7982`, `plan.md` `b7fc73fc9477425…3d8e4`, `tasks.md`
      `ddb354cd29ce3a8…d5d5b` — **idénticos** a los de la Tarea 1. `git status --porcelain
      --untracked-files=all -- specs/010-cierre-de-modales/` ⇒ **vacío**; `git diff --stat -- specs/010-*`
      ⇒ **vacío**.
- [x] **AC-20:** cabeceras JSDoc de todos los archivos de producto tocados actualizadas según la
      plantilla real; se registra el aviso de la ruta inexistente `.agents/file-header-template.md`.
      *Resultado:* los **9** archivos de producto tocados (`DashboardDrawer.jsx`,
      `DashboardUserModal.jsx`, `AuthModal.jsx`, `ModalTarjeta.jsx`, `DashboardLayout.jsx`,
      `PaginaLogin.jsx`, `PaginaInicio.jsx`, `useRetornoDeFoco.js`, `useFocoEnVistaDestino.js`) tienen
      los **6 campos** de la plantilla (`@uso`, `@funciones`, `@datos`, `@eventos`, `@estados`,
      `@usadoPor`) y describen el contrato de foco corregido (RF-19). **No fue necesario editar
      ninguna** (ya quedaron actualizadas en T2-T8); cero cambios de código. **Aviso:** `AGENTS.md:38`,
      `doc/constitution.md:39` y `.agents/rules/rules.md:21` citan `.agents/file-header-template.md`,
      ruta que **no existe**; la plantilla real es `.agents/skills/file-hearder-template.md/SKILL.md`
      (typo «hearder»).
- [x] **AC-21/RF-17:** inspección del diff: **cero** animaciones, transiciones, hexadecimales,
      superficies translúcidas o blobs nuevos; **cero** cambios de aspecto.
      *Resultado:* en los añadidos del diff de `src/` (incluidos los hooks nuevos) ⇒ **0** coincidencias
      de `animate|transition|duration|backdrop|blob|#hex` y **0** de `backdrop-blur|glass-`; las
      cabeceras JSDoc de los 9 archivos no cambian respecto a HEAD. Validación visual **no aplicable**
      (la corrección no cambia aspecto, marcado ni movimiento).
- [x] Suite transversal verde con nº de casos ≥ línea base; los casos vigentes pasan **sin editarse**.
      *Resultado:* `npx vitest run src/components/layout/cierreDeModales.test.jsx` ⇒ **32/32 pass**
      (línea base 22 ⇒ **+10**, 0 eliminados; el diff de la suite borra **6** líneas: la cabecera JSDoc
      y la línea del import). Canario (3), matriz (12), gesto (4), integración vigente (1) y Esc con dos
      capas (2) pasan **sin editarse**. `npm test` ⇒ **30 archivos / 454 casos / 0 fail**;
      `npm run build` ⇒ **verde**.

---

## Tarea 10 — Validación final, línea base de AC-17 y `MEMORY.md`

**Estado:** ✅ **Hecha** (2026-10-17). **Validación final medida: la spec 011 queda cerrada.**
`npm test` **30 archivos / 454 casos / 0 fail** contra la línea base post-012 de la Tarea 1
(**28 archivos / 373 casos**): **+2 archivos** (las dos suites nuevas) y **+81 casos**, sin que
**ningún** recuento de la línea base empeore (comparación **archivo por archivo** en el registro de
`MEMORY.md`). `npm run build` **verde** (`index.html` 1.11 kB; CSS 57.49 kB / gzip 9.48; JS 384.58 kB
/ gzip 122.73 — idénticos a la T9). AC-19: los tres documentos de la 010 **idénticos por `sha256sum`**
a los de la Tarea 1 y sin entradas en `git status --porcelain --untracked-files=all`. AC-21: **cero**
animaciones, transiciones, hexadecimales, superficies translúcidas o blobs nuevos. **Solo** se
editaron `MEMORY.md` y esta `tasks.md`: **cero** cambios de código de producto o de pruebas (la
validación **no** destapó ningún defecto que exija una corrección de una línea).

**Objetivo:** cerrar la spec con la medición completa **post-011** comparada contra la línea base
**post-012** de la Tarea 1, y dejar el registro en `MEMORY.md`.

**Archivos:** `MEMORY.md` (entrada nueva, **sin** datos sensibles). Ningún archivo de `src/` en esta
tarea salvo correcciones de una línea derivadas de un fallo medido (con su caso de prueba).

**RF que cubre:** cierre de RF-01..RF-19 por medición.
**AC que cubre:** AC-17 (re-medición y atribución suite por suite), AC-18, AC-19, AC-21.

**Prueba relevante:** suite completa y build.

**Comando:** `npm test` y `npm run build`.

**Hecho cuando:**
- [x] **AC-17:** `npm test` completo verde y comparado **archivo por archivo** contra la línea base de la
      Tarea 1. Se confirma que pasan los criterios que estaban rojos (AC-01, AC-10, AC-12(ii), AC-13,
      AC-22, AC-24) y que **ningún** recuento de la línea base empeora. Cualquier diferencia se atribuye
      a una suite concreta y se explica (p. ej. el crecimiento por casos nuevos).
      *Resultado:* `Test Files 30 passed (30)` / `Tests 454 passed (454)`, 0 fallos, 5,95 s. La
      comparación **archivo por archivo** con las 28 suites de la línea base da **0 recuentos que
      empeoran** (20 suites con recuento **idéntico** y 8 en crecimiento). Los tres criterios antes
      rojos quedan verdes con evidencia focalizada: **AC-01** (`DashboardDrawer.test.jsx` →
      «montado cerrado con el disparador conectado no invoca `focus()` ni mueve el foco»), **AC-10**
      (`AuthModal.test.jsx` → «al cerrar devuelve el foco al disparador enfocado antes del render
      (1 devolución)» + los 4 pares de paridad de `cierreDeModales.test.jsx`), **AC-12(ii)** y
      **AC-13** (`DashboardLayout.test.jsx`), **AC-22(a)** ×3 y **AC-22(b)** (`App.test.jsx` +
      `AuthModal.test.jsx`) y **AC-24** (`DashboardDrawer` + `DashboardUserModal`), todas PASS en la
      ejecución filtrada por nombre (`-t "AC-(01|10|11|12|13|22|24)"` → **36 pass / 0 fail**).
      **Corrección de la cifra declarada (2026-10-17, hallazgo 6 del reviewer):** la primera medición
      de este filtro se anotó como «**22 pass / 0 fail**» y resultó **no reproducible**: el patrón de
      `-t` se interpreta como **regex sobre el nombre completo del caso** (archivo + `describe` + `it`),
      así que casa además con los casos que **citan** «AC-01/AC-10/…» en su título. Re-ejecutado el
      **mismo comando** —`npx vitest run -t "AC-(01|10|11|12|13|22|24)"`— el 2026-10-17:
      `Test Files 10 passed | 20 skipped (30)` y `Tests 36 passed | 418 skipped (454)` ⇒
      **36 pass / 0 fail**. La cifra válida es **36**; la de «22» queda **corregida** por esta nota. El
      filtro se usa **solo** como orientación: la evidencia firme es la comparación **archivo por
      archivo** de `npm test`. Deltas
      positivos, uno por uno: `App.test.jsx` 11→**17** (+6), `AuthModal.test.jsx` 15→**20** (+5),
      `cierreDeModales.test.jsx` 22→**32** (+10), `DashboardDrawer.test.jsx` 23→**28** (+5),
      `DashboardUserModal.test.jsx` 27→**34** (+7), `ModalTarjeta.test.jsx` 18→**23** (+5),
      `DashboardLayout.test.jsx` 23→**29** (+6) y las dos suites **nuevas** de la spec
      (`useRetornoDeFoco.test.js` **29**, `useFocoEnVistaDestino.test.js` **8**) ⇒ **+44** casos en las
      8 suites del alcance (151→195) y **+37** de las dos piezas; `PanelTarjetas.test.jsx` (12) y las
      20 suites restantes (222) **conservan su recuento exacto**. Avisos de stderr **preexistentes** que no
      afectan al resultado (future flags de React Router, `non-boolean attribute initial` y
      `whileHover`/`whileTap` de los mocks de `framer-motion`).
- [x] **`npm run build`** verde.
      *Resultado:* `vite v5.4.21`, **2032 módulos**, `dist/index.html` 1.11 kB (gzip 0.60),
      `dist/assets/index-B0_ZOIQp.css` 57.49 kB (gzip 9.48), `dist/assets/index-DslZ-WoW.js`
      384.58 kB (gzip 122.73), `✓ built in 1.67s`. Mismo CSS y mismo JS que la T9 ⇒ la corrección de
      foco no entra al bundle salvo las dos piezas consumidas.
- [x] **AC-19 (repetición final):** `sha256sum` (o `stat`) de los tres documentos de la 010 **idéntico**
      al de la Tarea 1 y `git status --porcelain --untracked-files=all` sin entradas nuevas en
      `specs/010-*/`.
      *Resultado:* `spec.md` `69d84001e19dc4c9…f7982`, `plan.md` `b7fc73fc94774252…3d8e4`, `tasks.md`
      `ddb354cd29ce3a84…d5d5b` ⇒ **idénticos** a los de la Tarea 1 (mtime 2026-10-16, anterior a esta
      spec). `git status --porcelain --untracked-files=all -- specs/010-cierre-de-modales/` ⇒ **vacío**;
      `git diff --stat -- specs/010-cierre-de-modales/` ⇒ **vacío**. La 010 intacta por hash **y** por
      git.
- [x] **AC-21:** confirmación de que no hay cambios visuales/animationes/hex/superficies nuevas; si
      apareció alguno, se registra como excepción y se valida en navegador o se declara **no ejecutado**.
      *Resultado:* en los añadidos del diff de `src/` y en los 4 archivos nuevos ⇒ **0** coincidencias de
      `animate|transition|duration|backdrop|blob|hex` y **0** de `glass-`; en los **7 archivos de
      producto** modificados, **0** líneas añadidas con `className`, `style=` o `#hex` ⇒ **cero** cambios
      de marcado, aspecto o movimiento (las apariciones de `aria-label`/`role=` del diff viven **solo**
      en mocks de suites). Validación visual en navegador: **no aplicable / no ejecutada** (no hay nada
      visual que comparar; Firefox y geckodriver están disponibles en el entorno, pero la corrección es
      solo de foco/teclado, tal como fija el plan §8.5 y la regla común nº 7).
- [x] **`MEMORY.md`:** entrada con la línea base **post-012**, el resultado **medido** (pass/fail/no
      ejecutado) del alcance de la 011, las decisiones M1-M8/D-01..D-11 y las limitaciones registradas
      (H2 en `/login`, y si procede AC-12(ii)/AC-13/AC-15/AC-22(b) como **no ejecutadas**). Sin datos
      sensibles.
      *Resultado:* entrada «Spec 011 — Tarea 10 (cierre, 2026-10-17)» añadida al final de `MEMORY.md`
      con la tabla de atribución **archivo por archivo** (373 → 454), las cifras del build, las
      decisiones M1-M8 y D-01..D-11 y las limitaciones: **H2** (`/login`: respaldo «primer control
      enfocable» **no aplica**; se aserta la limitación explícita, sin marcado ficticio) y
      **AC-15/AC-23** (`null` cuando no existe ningún candidato). **Ninguna** de AC-12(ii), AC-13,
      AC-15 y AC-22(b) se registra como «no ejecutada»: las cuatro se ejecutaron y quedaron **verdes**
      (canario `focusin` y cruce forzado con mock controlable de `matchMedia` en la Tarea 9). Sin datos
      sensibles.
- [x] **Sin commit ni staging:** el árbol queda con los cambios sin preparar; no se usa `git add -A`.
      *Resultado:* **ninguna** operación de escritura en git (ni `git add`, ni `commit`, ni `stash`); solo
      lecturas (`git status --porcelain --untracked-files=all`, `git diff --stat`,
      `git diff -U0 -- src/`). `git status` sigue mostrando los 14 archivos de `src/` modificados, los 4
      nuevos de `src/hooks/`, `MEMORY.md` y los documentos de `specs/011-*` **sin preparar**.
- [x] **Informe final de la spec:** 10 tareas, orden, mecanismos fijados (a)-(f) y **cero** preguntas
      abiertas (`plan.md` §10).
      *Resultado:* informe entregado con la Tarea 10 (10/10 tareas ✅ en el orden del plan §9:
      T1 → T2 → T3-T6 → T7 → T8 → T9 → T10) y los **seis** mecanismos fijados y aplicados: **(a)** pieza
      compartida `useRetornoDeFoco` (M1); **(b)** registro por `focusin` en `document` (M5);
      **(c)** `location.state` (M6); **(d)** `useBreakpoint()` **dentro** de la pieza (M3);
      **(e)** división del efecto de `ModalTarjeta` (M7); **(f)** selectores de M8. **Cero preguntas
      abiertas** (spec §11 y `plan.md` §10: «Ninguna»).

---

## Cierre de la revisión del reviewer (2026-10-17)

Tras la validación del reviewer de la 011 (**APROBADO «OK»**), se aplicaron **dos ajustes menores** y
se documentó **una limitación**, **sin tocar RF ni AC** y **sin cambiar código de producto**:

1. **Hallazgo 3 — método de AC-02:** `DashboardDrawer.test.jsx` gana **un caso nuevo** que monta el
   drawer dentro de **`<StrictMode>`** con `abierto={false}` **desde el montaje** (la superficie del
   defecto **D1**) y asercia que el botón «Menú» **no** recibe `focus()` (espía sobre el nodo) y que
   `document.activeElement` **no** cambia. Ningún caso vigente se modifica. Suite del drawer
   **28 → 29** casos verdes; `npm test` **454 → 455**, `30 archivos`, 0 fail. **Señal del caso
   medida:** una sonda temporal con los **dos efectos previos a la 011** (borrada tras medirla)
   confirmó que aquel montaje cerrado **sí** invocaba `focus()` ⇒ el caso nuevo falla contra el
   comportamiento defectuoso y pasa con la corrección.
2. **Hallazgo 6 — cifra no reproducible:** corregida **en el punto de AC-17 de esta Tarea 10**
   (bloque «Corrección de la cifra declarada»), con la medida real del **mismo** filtro
   (`npx vitest run -t "AC-(01|10|11|12|13|22|24)"` ⇒ **36 pass / 0 fail**, `Test Files 10 passed |
   20 skipped (30)`, `Tests 36 passed | 418 skipped (454)`).
3. **Hallazgo 5 — limitación documentada (no cambia comportamiento):** la marca
   `location.state.focoEnDestino` **no se limpia al consumirse** (`useFocoEnVistaDestino.js`): al
   **re-montar la misma entrada de historial** (p. ej. `/login` → cerrar → `/dashboard`; navegación
   ordinaria; y **atrás** hasta la entrada marcada) el foco **se vuelve a colocar** sin ningún cierre
   de superficie. RF-15/AC-25 **no** definen la navegación «atrás» ⇒ queda como **limitación
   explícita** en `spec.md` **§6.1 CL-19** y en `MEMORY.md`, como **deuda para una spec futura**.
   **Cero** cambios de código.

**No se tocó** `specs/010-*`, `specs/012-*`, `specs/013/` ni `specs/014/`.
