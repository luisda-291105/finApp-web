# Tasks 010 — Cierre universal de las cuatro superficies modales

**Estado:** finalizada (2026-10-16)
**Plan base:** `specs/010-cierre-de-modales/plan.md` (spec aprobada por el usuario el 2026-10-16 con el
cambio de la Fase 2b: sin botón «Cerrar» al pie)
**Máx. 10 tareas** — orden de ejecución; cada tarea declara los RF/AC que cubre y su verificación.

> **Regla común a todas las tareas**
> 1. **Paso 0 obligatorio:** re-leer el código real de cada archivo antes de editarlo (DP-21: el
>    usuario edita a mano). Si un artefacto que el plan espera ya no existe, se registra como «ya no
>    aplicable», no se recrea.
> 2. **Cambios mínimos y localizados**, sin reformatear líneas ajenas al objetivo.
> 3. **Validación:** se ejecuta la prueba indicada y se reporta **pass / fail / no ejecutado**.
>    Nada se declara verde sin medirse. `npm test` y `npm run build` se reservan para la Tarea 10.
> 4. **Navegador:** las tareas marcadas **[navegador]** tienen criterios que jsdom no puede probar;
>    si no hay navegador disponible, se registran como **no ejecutados** en la Tarea 10 (nunca como
>    aprobados).
> 5. **Al terminar cada tarea** se añade su entrada en `MEMORY.md` (estado medido y decisiones).
> 6. **Límites:** ≤3 superficies translúcidas y ≤2 blobs por vista; solo tokens de
>    `src/styles/index.css`; sin hexadecimales nuevos, sin dependencias nuevas y **sin** botón
>    «Cerrar» al pie (RF-03 eliminado).
> 7. **Configuración de pruebas (ajuste tras la Tarea 1):** su ubicación **no se asume, se localiza**.
>    Hoy vive en **`vitest.config.js`** y en **`package.json`** (`"vitest": { "setupFiles":
>    ["vitest.setup.js"] }`), y `vite.config.js` **ya no** tiene el bloque `test` (edición manual del
>    usuario: **no se revierte ni se propone revertir**). Ninguna tarea edita esa configuración: el
>    andamiaje sigue yendo **solo** en `vitest.setup.js` (Tarea 2), que sigue siendo válido porque
>    `setupFiles` lo carga.

---

## Tarea 1 — Paso 0: línea base, re-verificación de líneas e inventario de aserciones

**Objetivo:** fijar el estado real antes de tocar código y confirmar que las premisas del plan siguen
siendo ciertas.
**RF/AC cubiertos:** RF-19 (re-verificación), habilita la atribución de AC-18/AC-13
**Archivos:** ninguno (solo lectura; salida en el informe de la tarea)

**Pasos:**
1. `git status --short` y `git diff --stat`: inventariar el trabajo en curso del usuario y qué
   archivos del alcance ya están modificados.
2. `npm test` completo: registrar el resultado **archivo por archivo** (pass/fail) y la lista de
   fallos con su causa; en particular, confirmar que hoy **pasan** las suites que mockean
   `focus-trap-react`. **Medido (Tarea 1 ejecutada): 257/257 pruebas en 22 archivos**; el delta frente
   a `MEMORY.md` (253/253 en 21) es del commit `6cc43c7` de correcciones de consola, **no** de esta
   spec (comparar contra 257/257 en la Tarea 10).
3. `npm run build` y registrar el resultado (línea base de la Tarea 10). **Medido: verde.**
4. **Localizar la configuración de pruebas** (no asumir su ubicación): hoy está en
   `vitest.config.js` (`test.setupFiles`, `environment`, `include`, `globals`) y en `package.json`
   (`"vitest".setupFiles`), y `vite.config.js` **no** tiene el bloque `test`. Registrar qué archivo
   carga `vitest.setup.js`; **no** se modifica nada de esta configuración.
5. Re-verificar las referencias del plan y de la spec contra el código actual: X ausente en
   `DashboardUserModal` (≈`:119-123`), `clickDeactivates` (≈`DashboardUserModal.jsx:102`,
   `DashboardDrawer.jsx:88`), `AnimatePresence` como hijo directo de `FocusTrap`
   (`DashboardDrawer.jsx:98-115`; `FocusTrap` `:94-97`), ausencia de listener de Esc y de clic fuera
   en `AuthModal`, foco inicial al primer enfocable en `ModalTarjeta` (≈`:44-45`), `triggerRef` no
   pasado (`DashboardLayout.jsx:113-116`), `useBreakpoint.js:12` y el mock global de
   `vitest.setup.js:5-36`.
6. Inventariar **todas** las aserciones que cambian por D4 (foco inicial al contenedor y recuentos de
   focoables) en las cuatro suites de modales, no solo las citadas en CL-14. **Ya inventariadas además
   tres aserciones frágiles** (registradas en las Tareas 4, 5 y 8): el bucle sobre **todos** los
   `<svg>` de `DashboardUserModal.test.jsx:266-274`, el `panel.parentElement !== document.body` de
   `DashboardDrawer.test.jsx:159-166` y el `dialog.contains(document.activeElement)` de
   `ModalTarjeta.test.jsx:123-127`.

**Hecho cuando:**
- [ ] Existe el registro de `npm test` (archivo por archivo) y de `npm run build` como línea base
- [ ] Están re-verificadas (o corregidas) todas las referencias `archivo:línea` del plan
- [ ] Está inventariada la lista completa de aserciones afectadas por el foco inicial y los recuentos
- [ ] No se ha editado ningún archivo de código ni de pruebas

**Verificación:** `npm test` y `npm run build` (reporte literal); greps de re-verificación:
`clickDeactivates`, `FocusTrap`, `initialFocus`, `escapeDeactivates`, `aria-label="Cerrar modal"`,
`vi.mock("focus-trap-react"` (sin paréntesis de cierre; hoy **2** ocurrencias, en
`DashboardUserModal.test.jsx:32` y `DashboardDrawer.test.jsx:17`).
**Revisión en navegador:** no aplica.

---

## Tarea 2 — Andamiaje de geometría en `vitest.setup.js` y semilla de la suite transversal

**Objetivo:** hacer posible ejercer la **trampa real** en jsdom sin mockear la librería (D1/DP-10).
**RF/AC cubiertos:** RF-18; AC-19 (andamiaje), DP-10
**Archivos:** `vitest.setup.js`, `src/components/layout/cierreDeModales.test.jsx` (nueva)
**Dependencia:** Tarea 1.

**Pasos:**
1. **Ubicar antes de tocar:** confirmar dónde está la configuración de pruebas y que carga
   `vitest.setup.js` (hoy `vitest.config.js` y `package.json`; **no** se edita ninguno de los dos, ni
   `vite.config.js`). Esta tarea escribe **solo** en `vitest.setup.js`.
2. Añadir a `vitest.setup.js` el **stub de geometría**: `getBoundingClientRect()` y
   `getClientRects()` devuelven un rectángulo no vacío (1×1) **solo** cuando el elemento está
   `isConnected` y jsdom no aporta geometría (rect vacío); los nodos desconectados conservan el
   comportamiento original. Sin `vi.mock` de `focus-trap-react`/`tabbable` y sin `displayCheck`.
3. Documentar en el archivo (comentario + cabecera) **qué** hace y **por qué**
   (`tabbable` con `displayCheck: 'full'` usa `getClientRects().length`; jsdom no calcula layout).
4. Crear `src/components/layout/cierreDeModales.test.jsx` con la **semilla**: caso canario que monta
   un `FocusTrap` **real** con dos botones y comprueba que la trampa se crea (foco dentro del
   contenedor y Tab cicla sin escaparse) — es la prueba de que el andamiaje funciona.
5. Ejecutar la suite completa y comparar con la línea base de la Tarea 1 (**257/257 en 22**):
   **ningún** failure nuevo atribuible al stub; si alguna suite ajena se degrada, **estrechar** el
   stub (p. ej. solo para elementos dentro de `[role="dialog"]`) antes de dar la tarea por cerrada.

**Hecho cuando:**
- [x] `vitest.setup.js` contiene el stub acotado y documentado, y **no** mockea la librería
- [x] El caso canario con `FocusTrap` real pasa (la trampa se crea y Tab cicla)
- [x] `npm test` no muestra fallos nuevos frente a **257/257 en 22** (línea base de la Tarea 1).
      **Medido: 260/260 en 23 archivos** (+3 del canario, +1 archivo; ningún recuento por archivo cambió)
- [x] `grep` de `vi.mock("focus-trap-react"` (patrón **sin** paréntesis de cierre) no **aumenta** las
      **2** ocurrencias existentes y `displayCheck` no aparece en `src/` (retirar esas 2 ocurrencias es
      de las Tareas 4 y 5). **Medido: 2 ocurrencias (sin cambios) y `displayCheck` 0**
- [x] No se ha editado `vitest.config.js`, `vite.config.js` ni `package.json`

**Verificación:** `npx vitest run src/components/layout/cierreDeModales.test.jsx` + `npm test`.
**Revisión en navegador:** no aplica (entorno de pruebas).

---

## Tarea 3 — Maquinaria común de cierre: `BotonCerrar`, `useCierreConEsc`, `useDeslizarParaCerrar`

**Objetivo:** tener las tres piezas compartidas listas antes de tocar ninguna superficie.
**RF/AC cubiertos:** RF-02, RF-04, RF-06, RF-14, RF-16, RF-20 (versión de vista), RF-21;
AC-10, AC-12, AC-16 (y defensa AC-07)
**Archivos:** `src/components/ui/BotonCerrar.jsx` **(nuevo)** + `BotonCerrar.test.jsx` **(nuevo)**;
`src/hooks/useCierreConEsc.js` **(nuevo)** + `useCierreConEsc.test.js` **(nuevo)**;
`src/hooks/useDeslizarParaCerrar.js` **(nuevo)** + `useDeslizarParaCerrar.test.js` **(nuevo)**
**Dependencia:** Tarea 2.

**Pasos:**
1. `BotonCerrar`: `type="button"`, `aria-label` recibido (nombre **específico** de la superficie),
   SVG de aspa con `aria-hidden`, clases base (`rounded-full p-2`, `focus-visible:ring-2`,
   `outline-none`) y clases de tono inyectadas por `className` (tokens por panel claro/oscuro).
   Cabecera JSDoc según la plantilla real (`.agents/skills/file-hearder-template.md/SKILL.md`).
2. `useCierreConEsc({ activo, zIndex, alCerrar })`: registro de capas en el módulo + **un único**
   listener `keydown` en `document` (instalado con la primera capa, retirado con la última); en
   `Escape` cierra **solo** la superior (mayor `zIndex`; empate: montada más tarde); desregistro en
   el *cleanup*; una pulsación ⇒ una llamada.
3. `useDeslizarParaCerrar({ activo, refPanel, alCerrar })`: solo **móvil** (`useBreakpoint().isMobile`),
   `pointerdown`/`pointermove`/`pointerup`/`pointercancel` sin `setPointerCapture` ni `drag` de
   Framer Motion, puntero primario, umbral `96px` + dirección vertical predominante
   (`|dy| > |dx| * 1.5`), no arranca sobre control interactivo ni con `scrollTop > 0`, y **no**
   aplica `transform`/transición alguna (RF-21 por construcción, plan §2.3-M6).
4. Pruebas de las tres piezas: `BotonCerrar` (render, `type`, `aria-label`, una llamada, tono);
   `useCierreConEsc` (registro/limpieza, un solo listener, superior por capa y por orden, una
   llamada por pulsación); `useDeslizarParaCerrar` (móvil vs ≥768px controlando `matchMedia`,
   umbral/dirección, exclusión de controles, `scrollTop`, puntero no primario, limpieza).

**Hecho cuando:**
- [x] Las tres piezas existen con cabecera JSDoc y **sin** dependencias nuevas ni hex nuevos.
      **Medido: 0 hex y 0 dependencias nuevas** (`package.json` intacto)
- [x] `useCierreConEsc` instala **un solo** listener global y cierra solo la capa superior.
      **Medido:** un solo `addEventListener("keydown")` con 3 capas; superior por `zIndex` y por
      `orden`; una llamada por pulsación; idempotente con StrictMode
- [x] `useDeslizarParaCerrar` no registra nada en ≥768px y no aplica `transform`. **Medido:** 0
      listeners en 1024px y `panel.style.transform === ""` durante el gesto
- [x] Las tres suites nuevas pasan. **Medido (T3 ejecutada): 33/33** — `BotonCerrar` 5,
      `useCierreConEsc` 10, `useDeslizarParaCerrar` 18

**Verificación:** `npx vitest run src/components/ui/BotonCerrar.test.jsx src/hooks/useCierreConEsc.test.js src/hooks/useDeslizarParaCerrar.test.js`.
**Revisión en navegador:** no aplica a las piezas (el gesto real se revisa en Tareas 4/7/8/10).

---

## Tarea 4 — `DashboardUserModal`: cuatro formas, clic fuera efectivo y foco al contenedor **[navegador]**

**Objetivo:** que el modal de Cuenta no pueda quedar bloqueado.
**RF/AC cubiertos:** RF-02, RF-04, RF-05, RF-06, RF-08, RF-09, RF-16, RF-22; AC-01, AC-02, AC-08, AC-12, AC-20
**Archivos:** `src/components/layout/DashboardUserModal.jsx`, `src/components/layout/DashboardUserModal.test.jsx`
**Dependencia:** Tarea 3.

**Pasos:**
1. «X» con `BotonCerrar` (nombre accesible específico, p. ej. «Cerrar Cuenta») dentro del `<header>`
   del panel, junto al `<h2>`; el panel gana `tabIndex={-1}`, `max-h-[85vh]` y `overflow-y-auto`.
2. `focusTrapOptions`: `allowOutsideClick: true`, `escapeDeactivates: false`,
   `initialFocus: () => refPanel.current`, `returnFocusOnDeactivate: false`; **eliminar**
   `clickDeactivates`. Retirar el listener propio de Esc (lo cubre `useCierreConEsc` con capa `60`).
3. Retorno de foco encadenado (plan §2.3-M4): `triggerRef` conectado → elemento previo conectado →
   control estable (`aside[role="navigation"] button`); `previousActiveElementRef` se captura siempre.
4. Añadir el gesto con `useDeslizarParaCerrar` sobre el panel (solo móvil) y el `onClick` del overlay
   con la guarda `event.target === event.currentTarget` (se conserva).
5. Cabecera JSDoc al contrato nuevo; suite: **quitar el mock** de `focus-trap-react`, foco inicial =
   contenedor, recuento de focoables 2 → **3**, clic en overlay cierra **con la trampa real** y la
   trampa sigue activa después, Esc una sola vez, retorno de foco en los tres casos, gesto en móvil
   (`matchMedia` explícito) y `max-h`/`overflow`.
   **Aserciones frágiles conocidas (registradas en la Tarea 1):**
   - `DashboardUserModal.test.jsx:266-274` recorre **todos** los `<svg>` de
     `#dashboard-user-modal-panel` y exige `flex-shrink-0 w-6 h-6`. El aspa de `BotonCerrar` **no**
     lleva esas clases, así que el caso **romperá** si no se acota la consulta al icono que se quiere
     probar (p. ej. por `lucide-*` o dentro del botón correspondiente). **Acotar la consulta**, no
     relajar la aserción.
   - `DashboardUserModal.test.jsx:146-151` y `:163-171` (foco y recuento) cambian por el mock retirado
     y por el foco inicial al contenedor (CL-14).

**Hecho cuando:**
- [x] La «X» cierra una sola vez y está **dentro** del panel/trampa.
      **Medido:** `BotonCerrar` con `aria-label="Cerrar Cuenta"` en el `<header>`; test
      «la «X» superior llama a alCerrar una sola vez y está dentro del panel» verde
- [x] El clic fuera cierra con la trampa real activa (sin `clickOutsideDeactivates` ni
      `clickDeactivates`). **Medido:** `allowOutsideClick: true`; el caso de overlay corre con la
      **trampa real** (mock retirado) y un foco exterior posterior es devuelto al panel
      (`checkFocusIn`), lo que prueba que la trampa sigue activa. Grep `clickDeactivates` en
      `DashboardUserModal.jsx` = **0** (queda solo `DashboardDrawer.jsx:88`, Tarea 5)
- [x] Esc cierra **una** vez por pulsación mediante `useCierreConEsc` (sin listener propio).
      **Medido:** listener propio retirado; capa `zIndex: 60`; test «ESC cierra una sola vez» verde
- [x] El foco inicial está en el **contenedor** (`tabindex="-1"`, fuera del ciclo de Tab).
      **Medido:** test de foco inicial (con `waitFor` por `delayInitialFocus`) y
      `tabindex="-1"` en el panel; navegador: activo `dashboard-user-modal-panel` (≥768 y <768)
- [x] El retorno de foco termina en el disparador o en el control estable, nunca en `body`.
      **Medido (jsdom):** tres casos (disparador conectado, elemento previo conectado, control
      estable `aside[role="navigation"] button`) en verde. **Navegador ≥768:** el foco vuelve al
      avatar. **Navegador <768:** transitoriamente en `body` (ver nota de dependencia abajo)
- [x] La aserción de iconos queda **acotada** al icono bajo prueba (el aspa de la «X» ya no la
      rompe). **Medido:** consulta acotada a `#dashboard-user-modal-panel svg.lucide` (2 iconos
      lucide), se conserva `flex-shrink-0 w-6 h-6`
- [x] La suite pasa con la trampa **real** (sin el mock). **Medido:** 26/26 en
      `DashboardUserModal.test.jsx`; grep `vi.mock("focus-trap-react"` baja de 2 a **1**
      (`DashboardDrawer.test.jsx`); `displayCheck` = **0**

**Nota de dependencia (medida, no oculta):** en móvil, cerrar con Esc devuelve el foco a `body`
**hoy** porque `DashboardDrawer` conserva su propio listener de Esc (`:35-48`, Tarea 5) y también
se cierra, desmontando el avatar disparador; sin `triggerRef` (Tarea 6) no hay control estable en
móvil (no existe `aside`). Se resuelve con T5 (mecanismo único) + T6 (`triggerRef` = botón «Menú»).
El desktop (≥768) sí devuelve el foco al disparador.


**Verificación:** `npx vitest run src/components/layout/DashboardUserModal.test.jsx` (debe fallar antes del cambio y pasar después).
**Medido (Tarea 4 ejecutada):** la suite nueva con la trampa real **falla antes** de implementar
(**10 fallos / 26**, por «X» ausente, foco al botón, recuento 2≠3, `max-h` ausente y gesto ausente)
y **pasa después** (**26/26**). `npm test` **299/299 en 26 archivos** (línea base 293/293: +6 de esta
suite, ningún recuento ajeno cambia) y `npm run build` verde.
**Revisión en navegador [navegador]:** Firefox 156.0.1 headless (geckodriver 0.37.1) sobre `vite preview:4173`.
Ejecutado: Esc real cierra en ≥768px (1024×768) y en <768px (375×700); foco inicial en el contenedor
en ambas; foco al cerrar al disparador en ≥768px; gesto de arrastre hacia abajo de 180px sobre zona
no interactiva cierra el modal en móvil (puntero `touch` **y** `mouse`), y un arrastre que arranca
sobre un control **no** cierra. Pendiente/deuda (no oculto): el foco al cerrar en móvil queda en
`body` por las Tareas 5/6 (ver «Nota de dependencia»).

---

## Tarea 5 — `DashboardDrawer`: trampa real, «X» con aire superior y clic fuera **[navegador]**

**Objetivo:** que el menú móvil tenga su trampa, su «X» y más aire arriba.
**RF/AC cubiertos:** RF-02, RF-05, RF-10, RF-15, RF-16, RF-22; AC-03, AC-09, AC-12, AC-20
**Archivos:** `src/components/layout/DashboardDrawer.jsx`, `src/components/layout/DashboardDrawer.test.jsx`
**Dependencia:** Tarea 3.

**Pasos:**
1. **Hijo directo de `FocusTrap`:** hoy es `<AnimatePresence>` (`DashboardDrawer.jsx:98-115`, dentro
   de `FocusTrap` `:94-97`) y por eso el `ref` no llega al panel. Mover `AnimatePresence` para que
   **envuelva** a `FocusTrap`, de modo que el `motion.div` del panel (con `ref={panelRef}`) sea el
   hijo directo y la trampa se cree de verdad (plan §2.3-M5). Sin animaciones nuevas (DP-07).
2. `focusTrapOptions`: `allowOutsideClick: true`, `escapeDeactivates: false`,
   `initialFocus: () => refPanel.current`, `returnFocusOnDeactivate: false`; **eliminar**
   `clickDeactivates` (`:88`); retirar el listener propio de Esc (capa `55` en `useCierreConEsc`).
3. Panel `tabIndex={-1}` + `flex flex-col`; fila de cromo superior con la «X» (`BotonCerrar`,
   nombre específico p. ej. «Cerrar menú») alineada a la derecha, y contenido en un envoltorio
   `min-h-0 flex-1 overflow-y-auto`: el contenido queda **un poco más abajo** (RF-15) sin perder
   `inset-y-0` (Spec 008). Sin gesto de deslizar (DP-08).
4. Suite: **quitar el mock** de la trampa (hoy enmascara que no se crea); foco inicial = panel;
   focoables 4 → **5**; se conservan `inset-y-0`, `z-55`, `aria-label="Menú de navegación"`, el clic
   en backdrop y el retorno de foco; se añade un caso que verifica que la trampa **existe** y que el
   gesto **no** cierra el menú; y que el contenido aparece más abajo (estructura/clases).
   **Aserción frágil conocida (registrada en la Tarea 1):** `DashboardDrawer.test.jsx:159-166` afirma
   `panel.parentElement !== document.body` y `panel.parentElement.tagName === "DIV"`; al retirar el
   mock eso **deja de ser cierto**: con la **trampa real** `focus-trap-react` **no** envuelve al hijo
   en ningún `<div>`, así que el `parentElement` del panel **es** `document.body`. El caso debe
   reescribirse al hecho nuevo (panel hijo directo de `body` **y** trampa creada de verdad), sin
   perder la comprobación de que la trampa ya no es un mock.

**Hecho cuando:**
- [x] La trampa se crea con el hijo directo corregido (el `ref` llega al panel)
- [x] La «X» cierra una sola vez y **no** se solapa con el contenido
- [x] El contenido del menú está un poco más abajo y sigue siendo desplazable hasta el final
- [x] `clickDeactivates` ya no aparece y el clic fuera sigue cerrando
- [x] Se conserva altura completa del panel (`inset-y-0`) y el gesto **no** cierra el menú
- [x] El caso de `:159-166` está reescrito al hecho nuevo (`parentElement` es `body`) sin perder la
      comprobación de que la trampa se crea de verdad
- [x] La suite pasa con la trampa **real**

**Verificación:** `npx vitest run src/components/layout/DashboardDrawer.test.jsx`.
**Revisión en navegador [navegador]:** aire superior y ausencia de solape con la «X» (AC-09),
fluidez del scroll del menú y contraste de la «X» sobre panel oscuro (AC-15).

---

## Tarea 6 — `DashboardLayout`: una sola superficie al abrir «Cuenta» y `triggerRef` estable

**Objetivo:** hacer imposible el apilamiento menú↔modal y fijar el retorno de foco.
**RF/AC cubiertos:** RF-07, RF-08, RF-13; AC-02, AC-06, AC-08
**Archivos:** `src/layout/DashboardLayout.jsx`, `src/layout/DashboardLayout.test.jsx`
**Dependencia:** Tareas 4 y 5 (contrato de `triggerRef` y de cierre del menú).

**Pasos:**
1. `alAbrirUserModal` pasa a cerrar el menú y abrir el modal (`setMobileMenuAbierto(false)` +
   `setUserModalAbierto(true)`): único punto de apertura (plan §2.3-M9).
2. Pasar `triggerRef={bottomNavMenuRef}` a `DashboardUserModal` (hoy no recibe nada): es el control
   estable del retorno de foco en móvil; en ≥768px el ref no tiene elemento y la cadena de M4 cae al
   avatar de la navegación lateral. **Sin** props nuevas en `SidebarResponsive`.
3. Conservar el traslado de foco al cruzar el corte (Spec 009 RF-09/AC-11) y el resto del layout.
4. Suite: caso «abrir Cuenta desde el menú ⇒ una sola superficie» (menú cerrado + modal abierto),
   `triggerRef` pasado al modal, y regresión del cruce de corte y de la composición por versión.

**Hecho cuando:**
- [x] Al abrir «Cuenta» desde el menú, el menú se cierra y solo queda una `role="dialog"`.
      **Medido:** caso «abrir «Cuenta» desde el menú cierra el menú y deja una sola superficie»
      (el mock de `DashboardUserModal` expone `role="dialog"`); el menú pasa a `null` y
      `getAllByRole("dialog")` = **1**
- [x] El modal recibe `triggerRef` y el layout no cambia de firmas.
      **Medido:** `triggerRef.current` **es** el botón «Menú» (`data-testid="bottom-nav-menu"`,
      `aria-label="Abrir menú"`) en móvil y `null` en ≥768px (sin `BottomNav`); props del modal
      exactamente `{abierto, alCerrar, triggerRef}` y del drawer `{abierto, alCerrar, children,
      triggerRef}` (sin `esMobile` ni props nuevas en `SidebarResponsive`)
- [x] El traslado de foco al cruzar 768px sigue verificado.
      **Medido:** se conservan los casos de recomposición (móvil → ≥768: menú cerrado + foco en
      `sidebar-toggle`; ≥768 → móvil con el modal abierto: permanece) y la composición por versión
- [x] La suite del layout pasa.
      **Medido:** `Test Files 1 passed (1)` / `Tests 23 passed (23)`, 0 fallos

**Verificación:** `npx vitest run src/layout/DashboardLayout.test.jsx`.
**Medido (Tarea 6 ejecutada):** **TDD rojo → verde**: con los casos nuevos contra el
`DashboardLayout.jsx` previo ⇒ **3 fallos / 23** (el menú no se cerraba al abrir «Cuenta» y
`triggerRef` llegaba `undefined` al modal) y **pasa después** (**23/23**, línea base de esta suite:
**21/21**; +2 casos). Chequeo extra de regresión (no sustituye a la T10):
`npx vitest run src/components/layout/DashboardUserModal.test.jsx` → **26/26** (el contrato
`triggerRef` del modal real no cambia). `npm test` y `npm run build` **no ejecutados aquí** (regla
común nº 3: se reservan para la T10). **Deuda para la T10 (no verificada aquí):** el foco
`document.activeElement` al cerrar «Cuenta» en móvil **no** se puede medir en esta suite porque
`DashboardUserModal` está mockeado (no implementa el retorno de foco); lo que sí queda verificado es
el **cableado** (`triggerRef.current` = botón «Menú», siempre montado en móvil) y, en
`DashboardUserModal.test.jsx` (T4), la cadena unitaria (`triggerRef` conectado → foco). La medición
de extremo a extremo en jsdom exigiría desmockear el modal (fuera del alcance de esta tarea) y en
navegador se reserva para la T10.
**Revisión en navegador:** **no ejecutada** aquí (queda para la T10: una sola superficie visible y
sin franja muerta de clic).

**Hallazgo preexistente (ajeno a esta tarea, DP-21):** `npx vitest run src/layout
src/components/layout` deja **3 fallos / 143** en `src/components/layout/BottomNav.test.jsx`
(«5 items fijos», «click en items 1-4 … Configuración», «media query landscape … 4≠5»). Los causa la
**edición manual del usuario** en `src/components/layout/BottomNav.jsx` (retira el ítem
«Configuración»: hoy `items` tiene 3 entradas → 4 botones con «Menú», no 5), **no** este cambio
(`BottomNav.test.jsx` no está en el alcance de la T6 y no se tocó). Se reporta, no se corrige.

---

## Tarea 7 — `AuthModal`: trampa real, Esc, clic fuera, nombres accesibles y gesto **[navegador]**

**Objetivo:** que el modal de autenticación cumpla la regla general sin cambiar su aspecto.
**RF/AC cubiertos:** RF-02, RF-04, RF-05, RF-06, RF-08, RF-11, RF-16, RF-20, RF-22; AC-04, AC-12, AC-22, AC-23
**Archivos:** `src/components/domain/modales/AuthModal.jsx`, `src/components/domain/modales/AuthModal.test.jsx` **(nuevo)**
**Dependencia:** Tarea 3.

**Pasos:**
1. Envolver el panel en `FocusTrap` con el contrato de opciones del plan (§2.2): `allowOutsideClick`,
   `escapeDeactivates: false`, `initialFocus` al contenedor, `returnFocusOnDeactivate: false`.
2. Panel: `tabIndex={-1}` + `aria-label` propio (nombre accesible del diálogo), `max-h-[85vh]` y
   `overflow-y-auto`. **Sin** tocar clases de color ni hex heredados (DP-03).
3. «X»: conservar su posición y su SVG/tono, añadir anillo de foco con tokens y cambiar el
   `aria-label` genérico «Cerrar modal» por uno específico (p. ej. «Cerrar ventana de acceso»).
4. Añadir `onClick` con guarda de destino en la capa exterior (hoy no existe) y Esc mediante
   `useCierreConEsc` (capa `50`); gesto con `useDeslizarParaCerrar` en móvil, sin interferir con los
   campos ni con el scroll.
5. Suite nueva: «X», Esc, clic/tap fuera, foco inicial al contenedor con **trampa real**, nombre
   accesible del diálogo y de la «X», estructura `max-h`/`overflow`, gesto en móvil (con
   `matchMedia` explícito) y **el cierre no borra** `nombre`/`correo`/`contrasena` (AC-22).

**Hecho cuando:**
- [x] Esc cierra el modal por el mecanismo único, incluso con el foco en un campo.
      **Medido:** jsdom con la trampa real (foco en `tu@correo.com` ⇒ una llamada por pulsación,
      capa `50` de `useCierreConEsc`); navegador: Esc real en `/login` cierra en 1024×768 y 390×744
- [x] El clic/tap fuera cierra con la trampa activa y el foco queda confinado.
      **Medido:** jsdom (`allowOutsideClick: true`, el `onClick` del overlay corre y un foco
      exterior posterior vuelve al panel por `checkFocusIn`); navegador: clic en el backdrop cierra
- [x] El diálogo y la «X» tienen nombre accesible específico y la «X» tiene foco visible con tokens.
      **Medido:** `aria-label="Ventana de acceso"` en el panel y `aria-label="Cerrar ventana de
      acceso"` en la «X» (jsdom y navegador); `focus-visible:ring-2` + `focus-visible:ring-mint-accent`
      presentes (el contraste final sobre panel oscuro es de AC-15/T10)
- [x] El foco inicial está en el contenedor (`tabindex="-1"`, fuera del ciclo de Tab).
      **Medido:** jsdom (`document.activeElement` es el panel con `waitFor` por `delayInitialFocus`;
      Tab cicla dentro) y navegador (`document.activeElement === [role="dialog"]`, 1024×768 y 390×744)
- [x] El aspecto no cambia: **cero** hex nuevos y ninguna clase de color migrada.
      **Medido:** el diff solo añade `max-h-[85vh] overflow-y-auto outline-none` al panel y
      `outline-none focus-visible:ring-2 focus-visible:ring-mint-accent` a la «X»; los hex
      heredados (`#0f1117`, `#1a7a5e`, `#6ee7c0`, `hover:bg-[#15634c]`, `bg-black/70`) quedan intactos
- [x] La suite nueva pasa (y **fallaría** antes del cambio).
      **Medido:** **14 fallos / 15** antes de implementar y **15/15** después
      (`AuthModal.test.jsx`, trampa **real**, sin mock de `focus-trap-react`)

**Verificación:** `npx vitest run src/components/domain/modales/AuthModal.test.jsx`.
**Medido (Tarea 7 ejecutada):** `Test Files 1 passed (1)` / `Tests 15 passed (15)`, 0 fallos.
`npm test` y `npm run build` **no ejecutados** aquí (se reservan para la T10). Chequeo extra de
regresión: `npx vitest run src/App.test.jsx` → **11/11**, sin cambios frente a la línea base.
**Revisión en navegador [navegador]:** Firefox headless + geckodriver (snap) sobre `vite --port 5199`.
Ejecutado: Esc real en `/login` cierra en 1024×768 y 390×744 con el foco inicial en el panel; clic en
el backdrop en la landing (`/`) cierra; gesto de arrastre de 180px hacia abajo sobre zona no
interactiva del panel cierra en 390×744; lo escrito se conserva al reabrir (AC-22). **No ejecutado
aquí:** contraste medido de la «X» sobre el panel oscuro y límites Fluid Glass (AC-15/T10).

---

## Tarea 8 — `ModalTarjeta`: foco inicial al contenedor y gesto en móvil **[navegador]**

**Objetivo:** alinear el detalle de tarjeta con el contrato nuevo sin tocar su contenido.
**RF/AC cubiertos:** RF-06, RF-12, RF-16, RF-20; AC-05, AC-10, AC-12
**Archivos:** `src/components/domain/modales/ModalTarjeta.jsx`, `src/components/ModalTarjeta.test.jsx`
**Dependencia:** Tarea 3.

**Pasos:**
1. **Foco inicial al contenedor:** sustituir `(primerFocoable ?? dialogo)?.focus()` (`:44-45`) por
   `dialogo?.focus()`; el `tabIndex={-1}` (`:100`) ya existe. El cambio **es necesario** (errata
   corregida en la spec §7.1): con la «X» presente el `??` nunca caía al contenedor.
2. Esc: mover su listener (`:54-61`) a `useCierreConEsc` (capa `50`); la **trampa manual**
   (Tab/Shift+Tab, `:63-76`) se conserva tal cual (RF-12).
3. Gesto con `useDeslizarParaCerrar` sobre el panel en móvil, respetando la prioridad del scroll
   (`overflow-y-auto`) y sin interferir con el flip de la tarjeta (botón interno ⇒ excluido).
4. Suite: foco inicial **es** el diálogo (`document.activeElement === dialog`), gesto en móvil,
   Esc sigue cerrando una vez, X/Esc/clic fuera intactos, trampa manual intacta, `useReducedMotion`
   sin cambios.
   **Aserción frágil conocida (registrada en la Tarea 1):** `ModalTarjeta.test.jsx:123-127` hoy solo
   exige `dialog.contains(document.activeElement)`, que **pasaría aunque el foco estuviera en la «X»**.
   Hay que **reforzarla** a `document.activeElement === dialog` (coherente con la errata (a) ya
   corregida en la spec §7.1).

**Hecho cuando:**
- [x] `document.activeElement` **es** el diálogo al abrir (no un botón).
      **Medido:** jsdom (`document.activeElement === dialog`, `tabindex="-1"`) y navegador
      (1024×768 y 375×700, `activeElement` = panel)
- [x] El gesto cierra en móvil y **no** existe en ≥768px ni interfiere con el scroll del panel.
      **Medido:** jsdom (cierra con 160px, no con 40px ni con desplazamiento horizontal, no
      arranca sobre el control de flip ni con `scrollTop > 0`, no aplica en 1024px); navegador
      (móvil: cierra con arrastre de 180px con puntero `mouse` **y** `touch`; escritorio: no cierra)
- [x] X, Esc y clic fuera siguen cerrando una sola vez cada uno.
      **Medido:** «X» 1 llamada; Esc **una por pulsación** (1 → 2 con dos pulsaciones, capa `50`
      de `useCierreConEsc`); clic en backdrop 1 llamada y clic dentro 0
- [x] Contenido, props, trampa manual y retorno de foco sin cambios.
      **Medido:** el diff solo toca foco inicial, listener de Esc y gesto; Tab **y** Shift+Tab
      ciclan dentro del diálogo (trampa manual conservada); regresión de retorno de foco:
      `PanelTarjetas.test.jsx` **12/12** y `App.test.jsx` **11/11**
- [x] La aserción `:123-127` está **reforzada** a `document.activeElement === dialog` (ya no basta
      `dialog.contains(...)`).
      **Medido:** el caso pasa a exigir `document.activeElement === dialog` (y comprueba además que
      el foco no está ni en la «X» ni en el botón de flip)
- [x] La suite pasa (y el caso de foco **fallaría** antes del cambio).
      **Medido:** **3 fallos / 18** antes de implementar (foco inicial en la «X» en los dos casos
      de foco y gesto que no cierra) y **18/18** después

**Verificación:** `npx vitest run src/components/ModalTarjeta.test.jsx`.
**Medido (Tarea 8 ejecutada):** `Test Files 1 passed (1)` / `Tests 18 passed (18)`, 0 fallos
(línea base de la suite: 11/11). `npm test` y `npm run build` **no ejecutados** aquí (se reservan
para la T10). Chequeo extra de regresión: `npx vitest run src/pages/PanelTarjetas.test.jsx
src/App.test.jsx` → **23/23**.
**Revisión en navegador [navegador]:** ejecutada (Firefox headless + geckodriver por WebDriver
sobre `vite --port 5215`, `/dashboard/tarjetas`): **11/11 comprobaciones PASS** — foco inicial en el
contenedor en 1024×768 y 375×700; gesto de 180px que **cierra** en móvil con puntero `mouse` y
`touch`; gesto que **no** arranca sobre el control de flip; gesto que **no** se aplica en ≥768px;
panel con `overflow-y` `auto` y scroll interno real (se recorrió el log hasta el final,
`scrollTop ≈ 213`, **sin** cierre involuntario) y arrastre con el panel desplazado que **no** cierra
(prioridad del scroll); Esc real cierra en ambas versiones de vista.

---

## Tarea 9 — Suite transversal, auditoría de greps y cabeceras JSDoc

**Objetivo:** cerrar la verificación automática de la regla general y dejar la documentación al día.
**RF/AC cubiertos:** RF-01, RF-07, RF-14, RF-19; AC-06, AC-07, AC-16, AC-18, AC-19
**Archivos:** `src/components/layout/cierreDeModales.test.jsx`, cabeceras JSDoc de los archivos
tocados, `src/components/ui/BotonCerrar.jsx`, `src/components/layout/DashboardUserModal.jsx`,
`src/components/layout/DashboardDrawer.jsx`, `src/components/domain/modales/AuthModal.jsx`,
`src/components/domain/modales/ModalTarjeta.jsx`, `src/hooks/*` nuevos, `vitest.setup.js`
**Dependencia:** Tareas 3–8.

**Pasos:**
1. Completar la suite transversal: **matriz superficie × forma** (ninguna forma aplicable ausente ni
   inutilizada), **una sola** trampa y **una sola** superficie activa, Esc con **dos capas forzadas**
   cierra solo la superior (mayor `z-*`; empate: montada más tarde) y **una** llamada de cierre por
   pulsación.
2. Auditoría de greps en `src/` (patrones **efectivos**, no «bonitos»):
   - `clickDeactivates` (**0**), `clickOutsideDeactivates` (**0**), `escapeDeactivates: true` (**0**),
     `displayCheck` (**0**) y menciones de un botón «Cerrar» al pie (**0**).
   - `vi.mock("focus-trap-react"` — **sin paréntesis de cierre**: la forma real es
     `vi.mock("focus-trap-react", async () => {`, y el grep con paréntesis devolvía 0 y no detectaba
     nada. Hoy devuelve **2** (`DashboardUserModal.test.jsx:32`, `DashboardDrawer.test.jsx:17`) y debe
     terminar en **0**.
   - `min-width` de versión de vista: única fuente `src/hooks/useBreakpoint.js:12,14`; **0** fuera de
     ahí en código de producto. El literal `768` en **comentarios/JSDoc** (`DashboardLayout.jsx:18,24,25,68,77`,
     `SidebarResponsive.jsx:2,15`, `useBreakpoint.js:4,5,11,30,61`) y en **pruebas**
     (`useBreakpoint.test.js`, `DashboardLayout.test.jsx`) es **esperado**: ese grep **no** debe dar 0.
3. Cabeceras JSDoc de todos los archivos tocados al contrato nuevo (cuatro formas, control de cierre
   superior, trampa única, foco inicial al diálogo, ajuste del menú móvil), sin citar las rutas
   inexistentes de plantillas de `AGENTS.md` (aviso registrado en el plan §0.4).
4. Ejecutar la suite de layout completa y las cuatro suites de modales para confirmar el estado.

**Hecho cuando:**
- [x] La matriz transversal cubre las cuatro superficies y las cuatro formas aplicables.
      **Medido:** `describe.each(SUPERFICIES)` monta las **cuatro superficies reales**
      (`DashboardUserModal`, `DashboardDrawer`, `AuthModal`, `ModalTarjeta`) sin mockear
      `focus-trap-react`: «X» (dentro del panel, 1 llamada), Esc (1 llamada por pulsación) y clic
      fuera (con la trampa real) + gesto ↓ aplicable/ausente (solo en las tres de contenido; el
      menú **no** cierra, DP-08)
- [x] Esc con dos capas cierra solo la superior y una sola vez.
      **Medido:** caso capa distinta (`AuthModal` 50 + `DashboardUserModal` 60 ⇒ cierra Cuenta, 1
      llamada, y una segunda pulsación cierra la siguiente) y caso empate de capa (`AuthModal` 50
      montada antes + `ModalTarjeta` 50 montada después ⇒ gana la montada más tarde)
- [x] Los greps de **código** dan **0**: `vi.mock("focus-trap-react"` (sin paréntesis de cierre),
      `clickDeactivates`, `clickOutsideDeactivates`, `escapeDeactivates: true`, `displayCheck`,
      `min-width` fuera de `useBreakpoint.js` y botón «Cerrar» al pie.
      **Medido:** los seis patrones = **0** en `src/` (ver el detalle literal en el informe);
      `min-width` solo aparece en `useBreakpoint.js:12,14` y en archivos de **pruebas**; `al pie` = 0
- [x] El conteo de `768` en **comentarios/JSDoc y pruebas** está registrado como **esperado** (no se fuerza a 0).
      **Medido:** `768` = **17** ocurrencias en código de producto (todas en comentarios/JSDoc o en
      la fuente única `useBreakpoint.js`) y **35** en pruebas; ninguna duplica el corte
- [x] Ninguna cabecera describe el contrato viejo (foco al primer enfocable, botón «Cerrar» al pie).
      **Medido:** revisadas `BotonCerrar.jsx` (corregido `@usadoPor`: AuthModal/ModalTarjeta
      conservan su propia «X» con el mismo patrón, DP-03), `DashboardUserModal.jsx`,
      `DashboardDrawer.jsx`, `AuthModal.jsx`, `ModalTarjeta.jsx` (contrato nuevo en `@uso`/`@eventos`),
      `useCierreConEsc.js`, `useDeslizarParaCerrar.js`, `vitest.setup.js` y `DashboardLayout.jsx`;
      `grep 'al pie'` = 0 y `grep 'primer enfocable'` solo aparece en comentarios que **explican** la
      corrección
- [x] `npx vitest run src/components/layout src/layout src/components/domain/modales src/hooks` en verde.
      **Medido (2026-10-16): `Test Files 14 passed (14)` / `Tests 238 passed (238)`, 0 fallos.** En la
      T9 este mismo comando daba `3 failed | 235 passed (238)`: los **3 fallos** eran de
      `src/components/layout/BottomNav.test.jsx` («5 items fijos», «click en items 1-4 …
      Configuración», «media query landscape … 4≠5»), causados por la **edición manual del usuario** en
      `BottomNav.jsx` (retira el ítem «Configuración»: 3 entradas → 4 botones, no 5), **ajenos a la
      spec 010**. Se resolvieron al **alinear `BottomNav.test.jsx` a los 4 controles reales**
      (cambio pequeño **solo de pruebas**, ajeno a esta spec: `BottomNav.test.jsx` 13/13). Re-ejecutado
      el comando tras esa alineación: verde, sin fallos nuevos.

**Medido (Tarea 9 ejecutada):** la suite transversal pasa de canario a **22/22 pruebas en 1 archivo**
(3 del canario de T2 + 12 de la matriz superficie × forma + 4 de gesto + 1 de integración con
`DashboardLayout` + 2 de Esc con dos capas). Línea base del comando completo: **3 failed | 216 passed
(219)**; tras T9: **3 failed | 235 passed (238)** (delta = +19 pruebas de esta suite; los 3 fallos de
`BottomNav` son idénticos antes y después). `npm test` y `npm run build` **no ejecutados aquí**
(regla común nº 3: se reservan para la T10).
**Verificación:** `npx vitest run src/components/layout src/layout src/components/domain/modales src/hooks` + los greps.
**Revisión en navegador:** no aplica.

---

## Tarea 10 — Validación final: `npm test`, `npm run build`, diff, navegador y `MEMORY.md` **[navegador]**

**Objetivo:** reportar el estado **medido** de la spec completa.
**RF/AC cubiertos:** verificación final de todos (RF-17, RF-18, RF-19); AC-13, AC-14, AC-15, AC-16, AC-18, AC-20, AC-21
**Archivos:** `MEMORY.md`; se corrige solo lo que la validación destape
**Dependencia:** todas las anteriores y el aviso del usuario de que terminó sus ediciones manuales.

**Pasos:**
1. Escaneo del diff de los archivos del alcance frente a la línea base de la Tarea 1, distinguiendo
   ediciones manuales del usuario de los cambios de esta spec.
2. `npm test` completo contra la línea base **260/260 en 23 archivos** (Tarea 1: 257/257 en 22;
   +3 del canario de la Tarea 2; **no** contra las 253/253 en 21 de `MEMORY.md`, cuyo delta es del
   commit `6cc43c7` de correcciones de consola, ajeno a esta spec): reportar archivo por archivo y
   confirmar que **AC-01, AC-03, AC-06 y AC-14** dejan de fallar, que no aparece ningún fallo nuevo y
   que ningún recuento por archivo de la línea base empeora (el crecimiento por pruebas nuevas es
   esperado).
3. `npm run build` (línea base: verde).
4. Revisión en navegador (o registro como **no ejecutado**): AC-14 (Esc en las cuatro superficies y
   en ambas versiones de vista, con navegador/versión/ancho), AC-15 (Fluid Glass: ≤3 superficies,
   ≤2 blobs, contraste de la «X» en panel claro y oscuro), AC-09 (aire superior), AC-10 (gesto con
   prioridad del scroll), AC-20 (viewport 320×568, apaisado, zoom) y AC-21
   (`prefers-reduced-motion`: sin animación nueva y cierre inmediato).
5. `MEMORY.md`: entrada con el estado medido (pass/fail/no ejecutado), las decisiones
   (piezas compartidas, opciones reales de `focus-trap`, andamiaje de DP-10, gesto con punteros,
   cierre del menú al abrir Cuenta, aire superior), **la línea base 257/257 en 22 archivos** y las
   deudas/observaciones (animación de salida DP-07, `ModalTarjeta.test.jsx` fuera de carpeta, deuda de
   `SidebarNavContenido`, configuración de pruebas repartida entre `vitest.config.js` y `package.json`).

**Hecho cuando:**
- [x] `npm test` reportado **contra la línea base 260/260 en 23**, sin declarar verde nada no medido.
      **Medido: `Test Files 27 passed (27)` / `Tests 348 passed (348)`, 0 fallos.** Ningún recuento por
      archivo de la línea base (T1: 257/257 en 22) empeora y AC-01/AC-03/AC-06/AC-14 dejan de fallar
      (crecimiento esperado por suites y aserciones nuevas: véase la entrada de `MEMORY.md`).
- [x] `npm run build` reportado. **Medido: verde** (`index.html 1.11 kB`; CSS `57.49 kB` gzip `9.48`;
      JS `382.86 kB` gzip `122.07`; `✓ built in 1.72s`).
- [x] Los criterios de navegador están reportados como ejecutados o **no ejecutados** (AC-14/AC-15 nunca
      como aprobados sin medir). **Ejecutados** en Firefox 158.0 headless + geckodriver 0.37.1
      (54 comprobaciones: 47 PASS / 0 FAIL / 7 INFO): AC-14, AC-15 (incluido contraste real de la «X»),
      AC-09, AC-10, AC-20 y AC-21. **Excepción documentada:** el menú superpuesto **no aplica** en ≥768px
      porque `DashboardDrawer` y `BottomNav` solo se montan en móvil (`isMobile`).
- [x] El diff se limita a los archivos del alcance (línea base de la Tarea 1). Los cambios **de esta
      spec** no salen del alcance de T1–T9; el árbol de trabajo contiene además **ediciones manuales del
      usuario fuera del alcance** (`.pi/agents/*`, `BottomNav.jsx`/`BottomNav.test.jsx`,
      `src/config/app.config.js`, `vite.config.js`, `PENDIENTE.m`, `analicis-completo-cambios.md`,
      `specs/008-correccion-sidebar/`), documentadas y **no** revertidas.
- [x] `MEMORY.md` refleja el estado real y las decisiones pendientes (entrada «Spec 010 — FINALIZADA
      (T10, 2026-10-16)» con la línea base 257/257 en 22, el estado medido, las decisiones y las deudas).

**Verificación:** `npm test` y `npm run build` (reporte literal) + revisión en navegador.
**Revisión en navegador [navegador]:** sí, obligatoria para AC-14 y AC-15.

---

## Resumen de orden y dependencias

```
T1 (Paso 0: línea base + re-verificación de líneas + inventario de aserciones)
  → T2 (andamiaje de geometría en vitest.setup.js + semilla de la suite transversal)
    → T3 (maquinaria común: BotonCerrar + useCierreConEsc + useDeslizarParaCerrar)
      → T4 (DashboardUserModal: cuatro formas, clic fuera efectivo, foco al contenedor)
      → T5 (DashboardDrawer: trampa real, «X» con aire superior)
      → T7 (AuthModal: trampa real, Esc, clic fuera, nombres accesibles, gesto)
      → T8 (ModalTarjeta: foco inicial al contenedor + gesto)
        → T6 (DashboardLayout: cierre del menú al abrir Cuenta + triggerRef estable)
          → T9 (suite transversal + auditoría de greps + cabeceras JSDoc)
            → [aviso del usuario: terminó sus ediciones manuales]
              → T10 (validación final, navegador y MEMORY.md)
```

**Acoplamientos a respetar:**
- T4 y T6 tocan el mismo contrato de foco (`triggerRef` del modal): T6 se cierra **después** de T4.
- T5 y T6 tocan el mismo flujo (menú abierto ⇒ abrir Cuenta): T5 primero (panel y trampa), T6 después
  (quién cierra el menú).
- T9 depende de que T4–T8 estén cerradas: la matriz transversal monta las cuatro superficies reales.
