# Plan 010 — Cierre universal de las cuatro superficies modales

**Estado:** borrador
**Spec base:** `specs/010-cierre-de-modales/spec.md` (aprobada por el usuario el 2026-10-16 con el
cambio de la Fase 2b: eliminación del botón «Cerrar» al pie)
**Tareas:** `specs/010-cierre-de-modales/tasks.md`
**Fecha:** 2026-10-16

---

## 0. Condiciones de ejecución (leer antes de tocar nada)

1. **Paso 0 dentro de cada tarea: re-leer el código real.** El usuario edita a mano en paralelo y
   toda referencia `archivo:línea` **debe** re-verificarse antes de editar (DP-21). Si un artefacto
   que este plan espera ya no existe, se registra como «ya no aplicable» en lugar de recrearlo.
   Las líneas citadas en este plan se verificaron leyendo los archivos el **2026-10-16**.
2. **Cambios mínimos y localizados, sin reformatear** líneas ajenas al objetivo.
3. **Validación por tarea:** `npx vitest run <ruta>` al cerrar cada tarea; `npm test` y
   `npm run build` en la validación final. Nada se declara verde sin medirse: cada criterio se
   reporta **pass / fail / no ejecutado**. Los criterios visuales y de Esc real se cierran **en
   navegador** (o se registran como no ejecutados).
4. **Cabeceras JSDoc.** `AGENTS.md` cita `.agents/file-header-template.md` y
   `.agents/response-rules.md`, **rutas que no existen**: las reales son
   `.agents/skills/file-hearder-template.md/SKILL.md` (con el typo) y
   `.agents/skills/response-rules.md/SKILL.md`. Se avisa de la inconsistencia **antes** de seguirla
   (spec §9). Los archivos nuevos de este plan llevan cabecera según esa plantilla real.
5. **Límites Fluid Glass y tokens.** Máximo **3** superficies translúcidas y **2** blobs por vista;
   solo tokens de `src/styles/index.css`; **sin hexadecimales nuevos** y **sin dependencias nuevas**.
   El botón «Cerrar» al pie **no** se implementa (RF-03 eliminado, Fase 2b).
6. **Dónde vive la configuración de pruebas (hecho verificado en la Tarea 1, ajuste de plan).** El
   bloque `test` **ya no está** en `vite.config.js`: la configuración vive en un **`vitest.config.js`**
   (edición manual del usuario; **no se revierte ni se propone revertir**) y en `package.json`
   (`"vitest": { "setupFiles": ["vitest.setup.js"] }`). Consecuencias para la implementación:
   (a) **la ubicación no se asume, se localiza**: quien implemente debe verificar dónde está la
   configuración de pruebas antes de tocarla, y las referencias de este plan son **al contenido**
   (`setupFiles`, entorno `jsdom`, `include`, `globals`), no al archivo que la aloja;
   (b) el andamiaje sigue siendo el mismo y sigue yendo **solo** en `vitest.setup.js` (la Tarea 2
   **no** edita `vitest.config.js`, `vite.config.js` ni `package.json`), que continúa siendo válido y
   cargado por `setupFiles`;
   (c) **no** se propone unificar ni mover la configuración: es deuda del usuario y queda fuera del
   alcance.

---

## 1. Resumen de cambios

| Archivo | Cambio principal | RF |
|---|---|---|
| `vitest.setup.js` | **Andamiaje de geometría** (stub de `getBoundingClientRect`/`getClientRects` para nodos conectados sin rect) que permite la **trampa real** en jsdom; sin mocks de librería. Es el **único** archivo de configuración de pruebas que se toca: la configuración puede vivir en `vitest.config.js`/`package.json` (§0.6) | RF-18, DP-10 |
| `src/components/ui/BotonCerrar.jsx` **(nuevo)** + `BotonCerrar.test.jsx` | Pieza compartida del control de cierre («X»): estructura, `type="button"`, `aria-label` específico por superficie y anillo de foco con tokens | RF-02, RF-14, RF-16 |
| `src/hooks/useCierreConEsc.js` **(nuevo)** + `useCierreConEsc.test.js` | **Único** manejador de Esc por superficie y **único punto de coordinación** entre capas (superior = mayor `z-*`; empate: montada más tarde) | RF-04, DP-11, DP-16 |
| `src/hooks/useDeslizarParaCerrar.js` **(nuevo)** + `useDeslizarParaCerrar.test.js` | Gesto de deslizar hacia abajo con **eventos de puntero nativos**: umbral, dirección, exclusión de controles interactivos, prioridad del scroll y solo móvil | RF-06, RF-20 (versión de vista), RF-21, DP-08, DP-13 |
| `src/components/layout/DashboardUserModal.jsx` + su test | «X» nueva, clic fuera **efectivo** (`allowOutsideClick`), foco inicial al contenedor, retorno de foco encadenado, gesto en móvil, altura con scroll | RF-02, RF-04, RF-05, RF-06, RF-08, RF-09, RF-16, RF-22 |
| `src/components/layout/DashboardDrawer.jsx` + su test | Trampa **realmente creada** (hijo directo que reenvía `ref`), opción inexistente corregida, «X» nueva con **aire superior**, foco inicial al panel, altura con scroll | RF-02, RF-05, RF-10, RF-15, RF-16, RF-22 |
| `src/layout/DashboardLayout.jsx` + su test | Abrir «Cuenta» **cierra el menú** (una sola superficie/trampa) y se pasa un `triggerRef` estable al modal | RF-07, RF-13, RF-08 |
| `src/components/domain/modales/AuthModal.jsx` + `AuthModal.test.jsx` **(test nuevo)** | Trampa de foco real, Esc, clic/tap fuera, nombre accesible del diálogo y de la «X», foco inicial al contenedor, gesto en móvil, altura con scroll. Aspecto y hex heredados **intactos** | RF-02, RF-04, RF-05, RF-06, RF-08, RF-11, RF-16, RF-20, RF-22 |
| `src/components/domain/modales/ModalTarjeta.jsx` + `src/components/ModalTarjeta.test.jsx` | Foco inicial al **contenedor** (hoy va al primer enfocable), gesto en móvil, Esc por el mecanismo único; X, clic fuera, trampa manual y contenido intactos | RF-02, RF-06, RF-12, RF-16, RF-20 |
| `src/components/layout/cierreDeModales.test.jsx` **(nuevo, suite transversal)** | Canario del andamiaje, matriz superficie × forma, unicidad de trampa/superficie, Esc solo superior, una llamada por cierre | RF-01, RF-07, RF-18; AC-06, AC-07, AC-19 |
| `MEMORY.md` | Registro del estado **medido** y de las decisiones tras la validación final | — |

**Ningún archivo cambia de ruta ni de nombre.** El test de `ModalTarjeta` vive hoy en
`src/components/ModalTarjeta.test.jsx` (fuera de la carpeta del componente, §4.3-C7): se edita **en
su sitio**, no se mueve.

---

## 2. Arquitectura objetivo

### 2.1 Piezas y flujo

```
src/components/ui/BotonCerrar.jsx          ← control de cierre reutilizable (la «X»)
        └─ usado por DashboardUserModal, DashboardDrawer, AuthModal, ModalTarjeta

src/hooks/useCierreConEsc.js               ← UN listener de Esc para toda la app
        ├─ registro de capas [{ orden, zIndex, alCerrar }]
        └─ cierra SOLO la superior (mayor z-*; empate: montada más tarde)
        └─ usado por las cuatro superficies (una sola vez cada una)

src/hooks/useDeslizarParaCerrar.js         ← gesto con punteros nativos
        ├─ solo móvil (<768px) vía useBreakpoint
        └─ usado por DashboardUserModal, AuthModal y ModalTarjeta (NO por el menú, DP-08)

DashboardLayout
├─ [isMobile] DashboardDrawer   → X + aire superior, trampa real, sin gesto
│                                (alCerrar del avatar ⇒ alAbrirUserModal() cierra el menú y abre el modal)
├─ [siempre]  DashboardUserModal → X, clic fuera efectivo, Esc, gesto, foco al contenedor
│                                triggerRef = bottomNavMenuRef (móvil) → retorno de foco estable
└─ AuthModal / ModalTarjeta      → fuera del dashboard; reutilizan useBreakpoint para «móvil»
```

### 2.2 Contrato de las opciones de `focus-trap` (las tres superficies con la librería)

| Opción | Valor | Por qué |
|---|---|---|
| `allowOutsideClick` | **`true`** | Es lo que hace **efectivo** el clic fuera: `checkPointerDown` (`focus-trap.js:674-677`) y `checkClick` (`:826-828`) **retornan sin tocar el evento**, así el `onClick` del overlay se ejecuta y la trampa **sigue activa** (RF-05, DP-15) |
| `clickOutsideDeactivates` | **no se usa** | Desactivaría la trampa (prohibido, DP-15) |
| `clickDeactivates` | **se elimina** | **Opción inexistente** que hoy aparece en `DashboardUserModal.jsx:102` y `DashboardDrawer.jsx:88` (RF-05, AC-06) |
| `escapeDeactivates` | **`false`** | La trampa no consume ni maneja Esc; el único que cierra es `useCierreConEsc` (RF-04, DP-16) |
| `initialFocus` | **`() => refPanel.current`** | Foco al **contenedor** (D4). El panel lleva `tabindex="-1"`; si el nodo no fuese *focusable*, `focus-trap` cae al primer *tabbable* (`focus-trap.js:377-405`), de modo que el `tabindex="-1"` es **obligatorio**, no decorativo |
| `returnFocusOnDeactivate` | **`false`** | El retorno de foco es **manual** (RF-08) para poder aplicar la cadena de control estable (DP-05); con el valor por defecto (`true`) la trampa devolvería el foco antes de nuestra decisión |
| `fallbackFocus` | no se usa | El contenedor siempre existe mientras la superficie está montada |

La configuración se escribe **una vez** como constante compartida en cada superficie (objeto literal
en el módulo, sin exportar utilidades nuevas) para que las tres coincidan.

### 2.3 Mecanismos que fija este plan

**M1 — Esc: un solo manejador por superficie y un solo punto de coordinación (RF-04, DP-11, DP-16).**

- `src/hooks/useCierreConEsc.js` mantiene un **registro de capas** en el módulo y **un único**
  listener `keydown` sobre `document`, instalado cuando la primera capa se registra y retirado
  cuando la última se desregistra.
- `useCierreConEsc({ activo, zIndex, alCerrar })` registra la capa al montar/activarse
  (`orden` incremental) y la desregistra en el *cleanup*. En `Escape` cierra **solo** la capa
  superior: mayor `zIndex`; en empate, mayor `orden`.
- Las capas se declaran con la capa **del panel**: Cuenta `60`, menú `55`, `AuthModal` `50`,
  `ModalTarjeta` `50` (coherente con DP-20).
- Una pulsación ⇒ **una** llamada de cierre (AC-16). La idempotencia del cierre posterior (AC-17)
  la garantiza el estado del padre (el hook se desregistra al cerrarse la superficie).
- Se retiran los listeners propios de `DashboardUserModal.jsx:37-50`, `DashboardDrawer.jsx:35-48` y
  `ModalTarjeta.jsx:54-61`: **el hook es el único** mecanismo.

**M2 — Clic/toque fuera sin desactivar la trampa (RF-05, DP-15).**

- `allowOutsideClick: true` + overlay con `onClick` y guarda `event.target === event.currentTarget`
  (patrón ya usado en `DashboardUserModal.jsx:85-90` y `DashboardDrawer.jsx:74-78`).
- En `AuthModal` **no** existe hoy `onClick` en el contenedor (`:81`): se añade el mismo patrón en la
  capa exterior (backdrop) y `stopPropagation`-equivalente por la guarda de destino, sin cambiar el
  aspecto ni las clases del panel.
- El clic dentro del panel nunca cierra; la trampa sigue confinando el foco después del clic (AC-06).

**M3 — Foco inicial al contenedor del diálogo (D4/RF-16, DP-12).**

- `tabIndex={-1}` en el panel + `initialFocus: () => refPanel.current`; el contenedor queda **fuera**
  del ciclo de Tab (`[tabindex]:not([tabindex="-1"])`) y sin anillo visible al abrirse
  (`outline-none` solo en el contenedor, no en los controles) — CL-15.
- `AuthModal` y `DashboardDrawer` ganan `tabIndex={-1}`; `ModalTarjeta` ya lo tiene (`:100`) y
  **cambia** su foco inicial: `(primerFocoable ?? dialogo)?.focus()` (`:44-45`) pasa a
  `dialogo?.focus()` (errata corregida en la spec §7.1: con la «X» presente el `??` nunca caía al
  contenedor).

**M4 — Retorno de foco con control estable (RF-08, DP-05).**

Cadena **única** aplicada al cerrar, en este orden (se detiene en el primer candidato conectado):

1. `triggerRef?.current` si `isConnected`;
2. `previousActiveElementRef.current` si `isConnected`;
3. **control estable equivalente**: `bottomNavMenuRef.current` (botón «Menú») en móvil;
   si no, `document.querySelector('aside[role="navigation"] button')` (control lateral, ≥768px);
4. nunca `document.body` ni un nodo desconectado (lo verifica AC-08).

`DashboardLayout` pasa `triggerRef={bottomNavMenuRef}` a `DashboardUserModal` (hoy no pasa nada,
`:113-116`). `previousActiveElementRef` se captura **siempre** (no solo cuando falta `triggerRef`),
para que la cadena tenga datos. No se añaden props ni refs a `SidebarResponsive` (sin cambios de
firma), en línea con el selector de DOM ya usado en `DashboardLayout.jsx:57-59`.

**M5 — La trampa del menú se crea de verdad (RF-10, §4.3-C4).**

- `focus-trap-react` clona el hijo directo y le inyecta un `ref`
  (`focus-trap-react/dist/focus-trap-react.js:362-387`), y solo crea la trampa si ese ref resuelve a
  un nodo (`:132`, `:286-298`). El `AnimatePresence` (`DashboardDrawer.jsx:98-115`, dentro de
  `FocusTrap` `:94-97`) no reenvía `ref`.
- **Corrección:** el hijo directo de `FocusTrap` pasa a ser el `motion.div` del panel
  (`ref={panelRef}`, ya aceptado por `motion`), y `AnimatePresence` pasa a **envolver** a
  `FocusTrap` en lugar de estar dentro. Cambio de dos líneas, sin animaciones nuevas: la animación de
  **salida** del menú/panel sigue sin reproducirse hoy (el componente retorna `null` al cerrarse) y
  eso queda como observación (DP-07), **no** se implementa aquí.
- El `ref` del hijo original **sí** se aplica: el `callbackRef` interno invoca `child.ref(element)`
  antes de asignar el suyo (`:370-380`), por lo que `panelRef` sigue funcionando.

**M6 — Gesto de deslizar con punteros nativos (RF-06, DP-08, DP-13, RF-21).**

`useDeslizarParaCerrar({ activo, refPanel, alCerrar })`:

- **Solo móvil:** `useBreakpoint().isMobile` (RF-20); en ≥768px no registra listeners.
- Eventos: `pointerdown` / `pointermove` / `pointerup` / `pointercancel` sobre el panel (sin
  `setPointerCapture`, sin `touch-action`, sin `drag` de Framer Motion). Se acepta solo el puntero
  primario (`event.isPrimary !== false`) y un único puntero a la vez.
- **Umbral y dirección:** cierra si `dy > 96px` **y** `|dy| > |dx| * 1.5` (vertical predominante). Un
  arrastre corto o predominantemente horizontal **no** cierra (AC-10).
- **No arranca** si el `pointerdown` cae en un control interactivo
  (`closest('button, a, input, select, textarea, [role="button"], [contenteditable="true"]')`) — esto
  excluye también la «X» (RF-06).
- **Prioridad del scroll:** si el panel (o el ancestro desplazable más próximo dentro de él) tiene
  `scrollTop > 0`, el gesto **no** se inicia: el arrastre desplaza el contenido (CL-09).
- **Sin animación de arrastre:** no se aplica `transform` ni transición al panel. Motivo: (a) el
  panel de Cuenta es un `motion.div` que ya escribe `transform` en línea (Framer Motion) y un
  `transform` imperativo competiría con él; (b) evita introducir un movimiento nuevo que hubiera que
  inhibir con `prefers-reduced-motion`. Con esto **RF-21 se cumple por construcción** (no hay
  animación nueva que respetar) y se verifica que: el cierre por gesto es inmediato, no se añade
  ningún `style.transform`/transición, y no se altera el comportamiento con movimiento reducido
  activo. `ModalTarjeta` conserva su `duration: 0` con `useReducedMotion` sin cambios.
- **No aplica al menú** (`DashboardDrawer`), por DP-08.

**M7 — Andamiaje de geometría en el entorno de pruebas (RF-18, DP-10, D1).**

- En `vitest.setup.js`, junto a los mocks ya existentes (`matchMedia` `:5-17`, `innerWidth`
  `:20-24`, `localStorage` `:27-36`), se añade un **stub de geometría**: `getBoundingClientRect()` y
  `getClientRects()` devuelven un rectángulo **no vacío (1×1)** cuando el elemento está
  `isConnected` y jsdom no aporta geometría (rect vacío). Los nodos **desconectados** conservan el
  comportamiento original. **Único archivo de configuración de pruebas que se toca:** así se cargue
  `vitest.setup.js` desde `vitest.config.js` (`test.setupFiles`) o desde `package.json`
  (`"vitest".setupFiles`) —hoy ambos existen (§0.6)—, el andamiaje va en el mismo archivo de siempre.
- Motivo: `tabbable` con `displayCheck: 'full'` consulta `node.getClientRects().length`
  (`node_modules/tabbable/dist/index.js:377-421`); sin layout, `focus-trap` concluye que no hay
  nodos enfocables y lanza «Your focus-trap needs to have at least one focusable element»
  (`focus-trap.js:402-404`).
- **No es un mock**: `focus-trap-react` y `tabbable` se ejecutan reales; solo se aporta la geometría
  que jsdom no implementa. **Prohibido** `displayCheck: 'none'` en `src/` y `vi.mock("focus-trap-react"`
  (el patrón a auditar es `vi.mock("focus-trap-react"` **sin** paréntesis de cierre: hoy devuelve
  **2** ocurrencias, `DashboardUserModal.test.jsx:32` y `DashboardDrawer.test.jsx:17`, y debe
  terminar en **0**; ver AC-19).
- Se actualiza la cabecera JSDoc/comentario de `vitest.setup.js` explicando qué hace y por qué, y se
  **retiran** los mocks de `focus-trap-react` de `DashboardUserModal.test.jsx:32-58` y
  `DashboardDrawer.test.jsx:17-53` (tareas de sus superficies). Los mocks de `framer-motion` **se
  conservan** (no son la librería bajo prueba y evitan animaciones en jsdom).

**M8 — Corte único de 768px (RF-20, D3, DP-14).**

`AuthModal` y `ModalTarjeta` obtienen «móvil» de `useBreakpoint().isMobile` (misma fuente de verdad
que el dashboard, `useBreakpoint.js:12`). No se duplica `768`, no se añade media query propia y no se
toca la semántica del corte (Spec 009) ni el `localStorage` de la navegación lateral (solo se
escribiría llamando a `toggleSidebar`, que estos componentes no usan — CL-19). Coste: el hook monta
dos listeners de `matchMedia` por superficie abierta, aceptado por la spec.

**M9 — Una sola superficie por diseño: abrir «Cuenta» cierra el menú (RF-07, RF-13).**

`DashboardLayout.alAbrirUserModal` pasa a `setMobileMenuAbierto(false); setUserModalAbierto(true);`
(único punto de apertura). Con ello desaparece el escenario de pila `z-55` sobre `z-50`, la cuádruple
superficie translúcida y el doble cierre con una tecla; la coordinación de M1 queda como **defensa**
(AC-07).

**M10 — Altura y scroll interno (RF-22, CL-16).**

| Superficie | Hoy | Objetivo |
|---|---|---|
| `DashboardUserModal` | sin `max-h` (`:112`) | `max-h-[85vh] overflow-y-auto` en el panel |
| `DashboardDrawer` | `inset-y-0`, sin scroll propio (`:105-107`) | panel `flex flex-col`; contenido en un envoltorio con `min-h-0 flex-1 overflow-y-auto`; se conserva `inset-y-0` (altura completa de Spec 008) |
| `AuthModal` | sin `max-h` (`:84`) | `max-h-[85vh] overflow-y-auto` en el panel, tal cual sus clases actuales |
| `ModalTarjeta` | ya `max-h-[85vh] overflow-y-auto` (`:101`) | sin cambios |

**M11 — Aire superior del menú móvil (RF-15, CL-13).**

El cromo nuevo del panel (`DashboardDrawer`) es una fila superior con la «X» alineada a la derecha
(`flex justify-end px-4 pt-6 pb-2`), **no** dentro de `children`; el contenido del menú
(`SidebarNavContenido`) queda así un poco más abajo, con más aire arriba. Solo cambia el panel de
móvil: la navegación lateral de ≥768px (`SidebarResponsive`) y su contenido no se tocan. Sin
superficies translúcidas nuevas (la «X» es un botón, no una superficie) ni blobs.

---

## 3. Archivos afectados y límites

### 3.1 Se modifican / se crean (solo estos)

Los de la tabla de §1. Rutas y nombres sin cambios.

### 3.2 NO se tocan (exenciones explícitas)

- **El botón «Cerrar» al pie**: no se implementa en ninguna superficie (RF-03 eliminado, §2.2 de la
  spec). Tampoco un pie con acciones de cierre.
- **Rediseño visual**: `AuthModal` conserva su aspecto y sus **hex heredados**
  (`#0f1117`, `#1a7a5e`, `#6ee7c0`, `text-white`): no se migran (DP-03). El único cambio visual
  nuevo es la «X» y el aire superior del menú móvil, más el anillo de foco de la «X» de `AuthModal`
  (accesibilidad, no aspecto).
- **Navegación de ≥768px**: `SidebarResponsive`, `SidebarNavContenido` (enlaces, `my-`, `text-white`,
  import `Settings` sin usar) y el layout lateral no se modifican; la deuda de
  `SidebarNavContenido` sigue fuera de alcance.
- **Props y firmas**: `{ abierto, alCerrar, triggerRef? }`, `{ abierto, alCerrar, children, triggerRef? }`,
  `{ abierto, modoInicial, alCerrar }` y `{ tarjeta, onCerrar }` se mantienen; **no** se renombran
  (`onCerrar` vs `alCerrar` sigue como está).
- **Contenido y datos**: `src/pages/*`, `src/data/*`, `src/config/*`, `App.jsx`, rutas y
  `TRIAL_ACTIVO` sin cambios.
- **Bloqueo del scroll del body** (`body.style.overflow`): sigue solo en `ModalTarjeta`; no se
  extiende ni se retira.
- **Animación de salida** de los modales (DP-07): no se implementa.
- **`src/styles/index.css`**: solo se usa; no se añaden tokens ni utilidades (el espaciado de M11
  usa la escala existente).
- **Dependencias**: ninguna nueva; `framer-motion` no se usa para el gesto (RF-06/DP-13).
- **`ModalTarjeta`**: contenido, props y trampa manual (Tab/Shift+Tab) intactos; el test no se mueve
  de carpeta.

---

## 4. Alternativas descartadas

| Alternativa | Por qué se descarta |
|---|---|
| `clickOutsideDeactivates: true` para «arreglar» el clic fuera | Desactiva la trampa: foco y confinamiento se pierden (RF-05/RF-07, DP-15) |
| Dejar `clickDeactivates` (opción inexistente) «porque no molesta» | No pertenece a la API de `focus-trap`; da falsa sensación de configuración y aparece en el barrido de AC-06 |
| `escapeDeactivates: true` en vez del hook | Esc se gestionaría dentro de la trampa y conviviría con listeners propios: doble cierre (RF-04, DP-16) |
| Un listener `keydown` propio por superficie (lo que hay hoy) | Dos superficies apiladas cerrarían dos capas con una tecla; RF-04 exige **un único punto de coordinación** (DP-11) |
| Un listener global único en `DashboardLayout` en vez del hook | El layout no monta `AuthModal`/`ModalTarjeta` (viven fuera del dashboard); el registro en el módulo del hook cubre las cuatro superficies |
| `drag` / `onDragEnd` de Framer Motion para el gesto | Desactiva el scroll vertical, se activa sobre controles y no es la vía nativa que pide D5/DP-13 |
| Feedback visual (transform) durante el arrastre | Competiría con el `transform` que ya escribe Framer Motion en el panel y añadiría un movimiento nuevo que habría que inhibir (RF-21) |
| `displayCheck: 'none'` para que jsdom acepte la trampa | Prohibido por RF-18/DP-10: silencia justo el defecto que la spec persigue |
| Volver a mockear `focus-trap-react` (como hoy) | Verde falso: ni el bloqueo del clic ni la ausencia de trampa del menú se detectan (RF-18, AC-19) |
| `max-width: 767px` / constante `768` propia en `AuthModal` o `ModalTarjeta` | Duplica el corte único de Spec 009 (RF-20, AC-23) |
| Extraer la parte de versión de vista de `useBreakpoint` a un hook nuevo | Refactor no necesario: reutilizar el hook es inocuo (D3/CL-19) y el refactor es más superficie que mantener |
| Un `useGestionCierre` monolítico (Esc + clic fuera + gesto + foco) | Acopla responsabilidades muy distintas y complica las pruebas; la spec pide **un patrón común**, no una pieza única (§7.1) |
| Posicionar la «X» de Cuenta en `absolute` fuera del `<header>` | El `<header>` ya es la fila superior del panel; meterla ahí evita solapes con el scroll (`max-h`) y mantiene el orden de tabulación natural |
| Botón «Cerrar» al pie como alternativa a la «X» | Decisión del usuario (Fase 2b): descartado; RF-03 eliminado |
| Añadir un ref/`forwardRef` a `SidebarResponsive` para el retorno de foco | Cambio de firma no autorizado; basta el selector estable ya usado por el layout para el foco (DP-05) |
| Unificar los cuatro modales en un componente único | Fuera de alcance (§2 de la spec): se unifica el **control de cierre**, no las superficies |

---

## 5. Relación entre cambios y requisitos

| RF | Cambio que lo implementa | AC |
|---|---|---|
| RF-01 (regla general) | Las cuatro superficies con «X» + Esc + clic fuera y gesto donde aplica (Tareas 4–8) | AC-01..AC-06 |
| RF-02 («X» superior) | `BotonCerrar` insertado en las cuatro superficies (dentro del panel) | AC-01..AC-05, AC-12 |
| RF-03 | **Eliminado** (Fase 2b): no se implementa pie «Cerrar»; la necesidad de altura se cubre con RF-22 | AC-20 |
| RF-04 (Esc único) | `useCierreConEsc` + `escapeDeactivates: false`; sin listeners propios | AC-16 y defensa AC-07 |
| RF-05 (clic fuera) | `allowOutsideClick: true`, sin `clickOutsideDeactivates`, sin `clickDeactivates`; overlay con guarda de destino | AC-01..AC-06 |
| RF-06 (gesto) | `useDeslizarParaCerrar`: punteros nativos, umbral, dirección, exclusión, scroll, solo móvil, no en el menú | AC-10, AC-11 |
| RF-07 (una sola trampa) | Corrección del ref del menú (M5) + cierre del menú al abrir Cuenta (M9) | AC-06, AC-07 |
| RF-08 (retorno de foco) | Cadena de M4 + `triggerRef` desde el layout + `returnFocusOnDeactivate: false` | AC-08 |
| RF-09 (Cuenta) | «X», clic fuera efectivo, Esc, gesto, foco inicial, altura | AC-01, AC-02 |
| RF-10 (menú) | Trampa real, `X` con aire superior, clic fuera, foco inicial al panel | AC-03 |
| RF-11 (AuthModal) | Trampa real, Esc, clic fuera, nombres accesibles, gesto, altura; aspecto intacto | AC-04, AC-22 |
| RF-12 (ModalTarjeta) | Gesto en móvil y foco inicial al contenedor; trampa manual y contenido intactos | AC-05 |
| RF-13 (menú → Cuenta) | `alAbrirUserModal` cierra el menú (M9) | AC-02, AC-06 |
| RF-14 (patrón común) | `BotonCerrar` como pieza compartida (estructura, `aria-label`, anillo de foco) | AC-12, AC-15 |
| RF-15 (aire superior del menú) | Fila de cromo con la «X» + espaciado superior, solo móvil | AC-03, AC-09 |
| RF-16 (accesibilidad) | `role`/`aria-modal`/nombre accesible del diálogo, `tabindex="-1"` fuera del ciclo de Tab, `aria-label` específico en la «X» | AC-12 |
| RF-17 (no regresión) | Cero rutas/datos/tokens nuevos; ≤3 superficies y ≤2 blobs; andamiaje fuera del bundle | AC-13, AC-23 |
| RF-18 (pruebas reales) | Andamiaje de geometría (M7), mocks retirados, suite transversal, AC-14 en navegador | AC-19, AC-14, AC-06 |
| RF-19 (documentación) | Cabeceras JSDoc de los archivos tocados al contrato nuevo | AC-18 |
| RF-20 (corte único) | `useBreakpoint().isMobile` en `AuthModal`/`ModalTarjeta` | AC-23 |
| RF-21 (`prefers-reduced-motion`) | Sin animación nueva en el gesto; `ModalTarjeta` conserva `duration: 0` | AC-21 |
| RF-22 (altura/scroll) | `max-h` + `overflow-y-auto` en las cuatro superficies (M10) | AC-20 |

---

## 6. Pruebas con Vitest (enfoque)

**Convenciones:** `*.test.jsx` para componentes, `*.test.js` para hooks; pruebas junto al código;
`MemoryRouter` para rutas; comando por tarea `npx vitest run <ruta>`.

### 6.1 Qué se hace viable con el andamiaje (M7) y qué no

| Verificable en jsdom | Solo con revisión manual |
|---|---|
| Trampa real: foco inicial en el contenedor, Tab cicla dentro, no se crea dos veces | Esc real en un navegador con la trampa real (AC-14) |
| Clic fuera efectivo (la trampa no cancela el evento) y trampa aún activa después | Contraste, «se ve bien», solapes (AC-15) |
| Esc: un solo cierre por pulsación y solo la capa superior (forzando dos capas) | El gesto con el dedo real y su sensación (AC-10) |
| Gesto con **eventos de puntero sintéticos** (umbral, dirección, scroll, exclusión) | Aire superior y ausencia de solape con la «X» (AC-09) |
| Estructura/clases: `max-h`, `overflow-y-auto`, `tabindex="-1"` fuera del selector de focoables | Viewports reales bajos/apaisados/zoom (AC-20) |
| Retorno de foco: `document.activeElement` e `isConnected` tras cada forma | — |

### 6.2 Suites

- **`vitest.setup.js`** (Tarea 2): stub de geometría + comentario; `grep` de que no hay
  `vi.mock("focus-trap-react"` (patrón sin paréntesis de cierre) ni `displayCheck` en `src/`
  (el `grep` definitivo es de la Tarea 9).
- **`src/components/layout/cierreDeModales.test.jsx`** (nueva; semilla en Tarea 2, completa en Tarea 9):
  canario del andamiaje (montar un `FocusTrap` real con dos botones: foco inicial y Tab cicla),
  matriz **superficie × forma** de las cuatro superficies (AC-06), unicidad de trampa y de
  superficie activa (AC-06), Esc con **dos capas forzadas** cierra solo la superior (AC-07) y
  **una** llamada de cierre por pulsación (AC-16).
- **`src/components/layout/DashboardUserModal.test.jsx`**: se **retira el mock de la trampa**; foco
  inicial = contenedor; recuento de focoables 2 → **3** («X», «Configuración», «Salir del demo»);
  clic en overlay cierra **con la trampa real**; Esc cierra **una** vez; retorno de foco a
  `triggerRef` conectado, al elemento previo y al **control estable** cuando ambos están
  desconectados (AC-08); gesto en móvil con `matchMedia` controlado (CL-18); `max-h`/`overflow`.
- **`src/components/layout/DashboardDrawer.test.jsx`**: se **retira el mock de la trampa** (hoy
  enmascara que la trampa no se crea); foco inicial = panel; focoables 4 → **5** («X», 3 enlaces,
  avatar); el panel **no** cambia de estructura (`inset-y-0`, `z-55`, `aria-label`); el contenido
  aparece **más abajo**; el gesto **no** cierra el menú (AC-03); caso que comprueba que la trampa
  **existe** con el hijo directo corregido.
- **`src/layout/DashboardLayout.test.jsx`**: abrir «Cuenta» desde el menú deja **una sola**
  superficie (el menú se cierra) y el modal recibe `triggerRef`; se conserva el traslado de foco al
  cruzar el corte (Spec 009/AC-11).
- **`src/components/domain/modales/AuthModal.test.jsx`** (nueva): «X» con nombre accesible
  específico y anillo de foco, Esc, clic/tap fuera, foco inicial al contenedor con trampa real,
  nombre accesible del diálogo, gesto en móvil, `max-h`/`overflow`, y **el cierre no borra** los
  campos (AC-22).
- **`src/components/ModalTarjeta.test.jsx`**: foco inicial **es** el diálogo
  (`document.activeElement === dialog`), gesto en móvil, Esc sigue cerrando una vez, X/Esc/clic
  fuera intactos, trampa manual intacta.
- **`src/components/ui/BotonCerrar.test.jsx`** (nueva): render, `type="button"`, `aria-label`
  recibido, llamada única, icono `aria-hidden`, clases base + tono inyectado.
- **`src/hooks/useCierreConEsc.test.js`** (nueva): registra/desregistra, un solo listener global,
  cierra solo la superior por `zIndex` y por orden de montaje en empate, una llamada por pulsación,
  limpieza al desmontar.
- **`src/hooks/useDeslizarParaCerrar.test.js`** (nueva): no cierra en ≥768px; cierra al superar el
  umbral con dirección vertical; no cierra con arrastre corto/horizontal; no arranca sobre control
  interactivo; no arranca con `scrollTop > 0`; ignora punteros no primarios; limpia listeners.

**`matchMedia`/`innerWidth` (CL-18).** `vitest.setup.js` devuelve `matches:false` para todo
(equivalente a **móvil** tras el hook): las suites que necesiten ≥768px **deben** controlar
`matchMedia`/`innerWidth` explícitamente, no depender del mock global.

**`ModalTarjeta` no entra en la exigencia de «trampa real»** (AC-19): usa trampa manual, que RF-12
obliga a conservar; su cobertura es AC-05/AC-10/AC-12.

---

## 7. Validación

| Fase | Qué se ejecuta | Cuándo |
|---|---|---|
| **Paso 0 (Tarea 1)** | Re-verificación de referencias `archivo:línea` (DP-21) + línea base `npm test` / `npm run build` + inventario de aserciones afectadas. **Ejecutado:** ver la nota de línea base bajo esta tabla | Antes de tocar código |
| **Por tarea** | `npx vitest run <ruta relevante>`; lo no verificable se marca «pendiente de la validación final» | Al cerrar cada tarea |
| **Auditoría ejecutable (Tarea 9)** | `grep` de `clickDeactivates`, `clickOutsideDeactivates`, `escapeDeactivates: true`, `vi.mock("focus-trap-react"` (**sin** paréntesis de cierre: patrón efectivo, hoy 2 ocurrencias), `displayCheck`, `min-width` de versión de vista fuera de `useBreakpoint.js` (el literal `768` en comentarios/JSDoc y en pruebas es **esperado**; ver AC-23), `Cerrar»` al pie | Sin esperar a nada |
| **Diferida (Tarea 10)** | `npm test`, `npm run build`, escaneo del diff y `MEMORY.md` | Tras terminar la implementación |
| **Navegador (Tarea 10)** | AC-14 (Esc en las cuatro superficies y en ambas versiones de vista), AC-15 (Fluid Glass/contraste), AC-09 (aire superior), AC-10 (gesto), AC-20 (viewport bajo), AC-13 (visual) | Con navegador disponible; si no, **no ejecutado** y registrado |

**Regla de reporte:** cada criterio se informa **pass / fail / no ejecutado**, con navegador,
versión y ancho cuando sea manual. `AC-01, AC-03, AC-06, AC-14` deben **fallar hoy** (reproducen el
defecto con la trampa real una vez aplicado el andamiaje) y pasar después.

> **Línea base medida en la Tarea 1 (nota de contexto, no la cambia esta spec):** `npm test` dio
> **257/257 pruebas en 22 archivos** y `npm run build` en **verde**. El último registro de
> `MEMORY.md` es **253/253 en 21 archivos**; el delta corresponde al commit **`6cc43c7`**
> («correcciones de consola»), **no** a un cambio de esta spec.
> **Tras la Tarea 2 (ejecutada):** el andamiaje de geometría y el caso canario de la suite transversal
> dejan `npm test` en **260/260 pruebas en 23 archivos** (+3 del canario, +1 archivo;
> ningún recuento por archivo empeoró). Por tanto la Tarea 10 compara contra
> **260/260 en 23** más lo que añadan las Tareas 3–9: el crecimiento por pruebas **nuevas** no es
> regresión; el criterio es **0 fallos** y **ninguna suite perdida**, con los recuentos por archivo de
> la línea base intactos. No usar la cifra de `MEMORY.md` como referencia.

---

## 8. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El andamiaje de geometría altera suites ajenas (Framer Motion, `getBoundingClientRect` en otros tests) | Fallos aparentes de regresión en cualquier suite | Stub acotado (solo nodos `isConnected` con rect vacío) + `npm test` completo en la Tarea 2; si algo se degrada, se **estrecha** el stub (p. ej. solo dentro de `[role="dialog"]`) en lugar de retirarlo |
| El stub degenera en un mock encubierto o alguien añade `displayCheck: 'none'` | Se pierde la capacidad de detectar el defecto | DP-10 + RF-18 + `grep` de AC-19 |
| La trampa real rompe las aserciones de foco existentes de forma más amplia de lo previsto | Suites en rojo y ruido | CL-14 fija qué cambia (foco inicial y recuentos); Tarea 1 inventaría todas las aserciones antes de editar |
| El retorno de foco depende de un selector de DOM (`aside[role="navigation"] button`) | Se rompe si la navegación lateral cambia | Es el mismo selector que Spec 009 ya usa para el traslado de foco; AC-08 verifica el destino y `isConnected` |
| Pasar `triggerRef` al modal altera el caso «sin triggerRef» que hoy prueban las suites | Fallos por contrato antiguo | `previousActiveElementRef` se captura siempre y la cadena de M4 conserva el comportamiento previo como segundo candidato |
| El gesto provoca cierres involuntarios o pelea con el scroll | Pérdida de datos/frustración | Umbral + dirección + exclusión de controles + `scrollTop > 0` + nunca es la única vía (RF-06/CL-09, AC-10) |
| El gesto se implementa por descuido también en el menú | El menú se cierra al desplazarlo | DP-08 explícito y AC-03 |
| El aire superior del menú tapa la «X» o desborda | Regresión visual en móvil | Fila de cromo propia + contenido con `overflow-y-auto` y `min-h-0`; AC-03/AC-09/AC-20 |
| Añadir `max-h` rompe la altura completa del menú (Spec 008) | Regresión de una spec aprobada | Se conserva `inset-y-0` y solo se desplaza el contenido interno (M10); AC-11 |
| Se «arregla» la trampa del menú rehaciendo su animación de salida | Cambio visual no pedido | DP-07: la animación de salida queda fuera; solo se mueve `AnimatePresence` para liberar el hijo directo |
| Alguien reintroduce el botón «Cerrar» al pie por inercia de documentos previos | Trabajo y cromo no pedidos | Fase 2b + RF-03 eliminado + DP-22 + §3.2 |
| Se migran los hex de `AuthModal` «ya que se toca» | Cambio visual no autorizado | DP-03 + AC-13 |
| Esc no reproduce el fallo en jsdom y se da por bueno | El usuario sigue sin poder cerrar con Esc | AC-14 en navegador, obligatorio y con pasos/entorno |
| El foco inicial al contenedor recibe un anillo visible | Aspecto de «control seleccionado» al abrir | `outline-none` solo en el contenedor; CL-15 y AC-12 |
| Una superficie declara mal su capa en el registro de Esc | Esc cierra la capa equivocada en el caso defensivo | Capas declaradas en la tabla de M1; AC-07 fuerza dos capas y comprueba el orden |
| El usuario edita en paralelo archivos del alcance | Conflictos y premisas falsas | Paso 0 por tarea (DP-21), cambios mínimos, aviso al usuario del archivo tocado |

---

## 9. Observaciones (no bloquean la implementación)

1. **`ModalTarjeta.test.jsx` vive en `src/components/`** (fuera de la carpeta del componente,
   §4.3-C7): se edita ahí y **no** se mueve (moverlo sería un cambio de estructura no pedido).
2. **`text-white`/`my-` de `SidebarNavContenido` y los hex de `AuthModal`** son deuda técnica
   preexistente: fuera de alcance (§3.2, DP-03).
3. **El menú no tiene animación de salida** (el componente retorna `null` al cerrarse) y el panel de
   Cuenta tampoco reproduce la suya por el mismo motivo (§4.3-C2): sigue como observación (DP-07).
4. **`BottomNav` emite un aviso de `jsx` no booleano en stderr** (preexistente, corregido parte y
   registrado en `MEMORY.md`): no afecta al resultado de las suites.
5. **AC-13 y AC-15 no son automatizables**: se reportan como revisión manual (o no ejecutados).
6. Si al implementar el gesto se quisiera **feedback visual** de arrastre, es un movimiento nuevo que
   exige `prefers-reduced-motion` y compatibilidad con el `transform` de Framer Motion: **consultar
   antes**, no entra en este plan.
7. **Configuración de pruebas repartida** (`vitest.config.js` **y** `package.json`, con
   `vite.config.js` ya sin el bloque `test`): decisión manual del usuario, **fuera de alcance** (§0.6).
   Este plan no la mueve, no la unifica y no asume ubicación: solo escribe en `vitest.setup.js`.
8. **Los patrones de auditoría van sin paréntesis de cierre** (`vi.mock("focus-trap-react"`), porque
   la forma real del mock es `vi.mock("focus-trap-react", async () => {`: el grep «bonito» con
   paréntesis devolvía cero y no detectaba nada.
