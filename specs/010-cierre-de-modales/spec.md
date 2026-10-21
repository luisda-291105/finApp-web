# Spec 010 — Formas de cierre universales en modales: «X», Esc, clic fuera y deslizar abajo

**Estado: finalizada**
**Cierre (2026-10-16):** aprobada por el usuario el 2026-10-16 (Fase 2b, sin botón «Cerrar» al pie);
validación final T10 el 2026-10-16 (`npm test` **348/348 en 27 archivos**, `npm run build` verde;
navegador **47 PASS / 0 FAIL**).
**Fecha:** 2026-10-16
**Última revisión (mantenimiento tras la Tarea 1):** 2026-10-16 — solo **ajustes de verificación**,
sin cambio de alcance: AC-19 pasa a auditarse con el patrón **efectivo** `vi.mock("focus-trap-react"`
(sin paréntesis de cierre; hoy 2 ocurrencias, debe terminar en 0); AC-23 acota el `grep` a la media
query `min-width` de versión de vista (el literal `768` en comentarios/JSDoc y en pruebas es
esperado); se anota que la configuración de pruebas puede vivir en `vitest.config.js`/`package.json`
(se **localiza**, no se asume) y que el andamiaje sigue yendo **solo** en `vitest.setup.js`; y se
corrigen dos referencias `archivo:línea` (§4.3-C4: `AnimatePresence` `:98-115`, `FocusTrap` `:94-97`).
El estado sigue **`borrador`**, la numeración de RF/AC no se renumeró y no se toca ningún archivo de
código.
**Última revisión anterior (Fase 2b):** 2026-10-16 — **se elimina el botón «Cerrar» al pie** por cambio de
decisión del usuario: las formas de cierre pasan de cinco a **cuatro** («X» superior, Esc,
toque/clic fuera y deslizar hacia abajo solo en móvil y solo en los tres modales de contenido).
Siguen vigentes y sin debilitarse: el desbordamiento con scroll interno (RF-22, el cromo nuevo se
reduce a la «X» y al aire superior), el foco inicial al contenedor, el mecanismo único de Esc, el
clic fuera sin desactivar la trampa, la fuente única del corte de 768px (`AuthModal`/`ModalTarjeta`),
`prefers-reduced-motion` y la igualdad de accesibilidad entre las cuatro superficies. Los
requisitos y criterios que quedan **sin objeto** conservan su número **indicado como eliminado**
(RF-03; DP-09 revisada) para trazabilidad. Se corrigen además tres erratas del reviewer (§7.1 fila
`ModalTarjeta`, AC-19 y DP-10).
**Revisión anterior (Fase 2):** decisiones D1–D5 (andamiaje del entorno de pruebas, apilamiento
imposible por diseño, corte único de 768px, foco inicial al propio diálogo, gesto con eventos de
puntero nativos) y correcciones de la auditoría I-1 (único mecanismo de Esc), I-2 (invariante del
clic exterior) y los menores (CL-07/CL-10, `prefers-reduced-motion`, desbordamiento con el cromo
nuevo, criterio objetivo de AC-08, pasos de AC-14, verificación de `z-55`/`z-60`/`z-65`).
**Revisión anterior:** Fase 1 (cierre de las 6 preguntas abiertas; formas de cierre; ajuste visual
del menú móvil).
**Basada en:** Spec 004 (`ModalTarjeta`), Spec 006 (modales en `domain/modales/`),
Spec 007 (crea los modales del dashboard), Spec 008 (menú superpuesto a pantalla completa),
Spec 009 (dos versiones de vista; el menú superpuesto y el modal de cuenta)


---

## 1. Propósito

El modal de cuenta del dashboard («Cuenta», con «Configuración» y «Salir del demo») **no se
puede cerrar de forma fiable**: no tiene ningún control visible de cierre, el clic fuera no
cierra y el conjunto queda bloqueado. El origen no es un descuido estético: la trampa de foco
del modal, con la configuración actual, **anula todos los clics que no ocurran dentro del
panel**, de modo que el propio backdrop del modal deja de responder y el resto de la interfaz
parece muerta mientras el modal está abierto (evidencia en §4).

El propósito de esta spec es doble:

1. **Fijar una regla general y verificable para toda superficie modal de la app**: ninguna puede
   quedar bloqueada. Cada superficie debe ofrecer **cuatro formas de cierre adaptadas a su
   naturaleza** —**(1) «X» en la parte superior, (2) tecla Esc, (3) tocar/clicar fuera del modal y
   (4) deslizar hacia abajo (solo en la versión móvil y solo en los modales de contenido)**—,
   con estas garantías estructurales:
   - **una sola superficie modal y una sola trampa de foco activas por diseño**: abrir «Cuenta»
     cierra el menú superpuesto, de modo que el apilamiento **no puede producirse**;
   - **un único mecanismo de Esc por superficie** (la trampa no consume Esc y solo hay un
     manejador propio), y coordinación única entre superficies para el caso defensivo;
   - **el clic exterior es efectivo sin desactivar la trampa** (la trampa sigue activa y confina
     el foco; lo que cambia es que deja pasar el clic);
   - **foco inicial en el propio diálogo**, no en un botón de acción, y **retorno de foco** al
     control que lo abrió (o a un control estable equivalente si ese control ya no existe).
2. **Ajustar la versión móvil del menú superpuesto**: al abrirse «Cuenta» desde él, el menú se
   cierra, y el contenido del menú móvil se sitúa **un poco más abajo**, con más aire en la parte
   superior, sin tocar la navegación lateral de ≥768px.

---

## 2. Alcance

### 2.1 Incluido

- **Regla general de cierre** con las **cuatro formas** de §1 para **las cuatro superficies
  modales** de la app: modal de **Cuenta** (`DashboardUserModal`), **menú superpuesto de móvil**
  (`DashboardDrawer`), **modal de autenticación** (`AuthModal`) y **detalle de tarjeta**
  (`ModalTarjeta`).
- **«X» en la parte superior** de cada modal: a añadir en Cuenta y en el menú superpuesto; ya
  existe (y se conserva) en autenticación y en detalle de tarjeta. Patrón visual común basado en
  el ya usado en `ModalTarjeta` (esquina superior, botón redondo con área de toque suficiente,
  `aria-label` claro, foco visible con tokens).
- **Sin botón «Cerrar» al pie**: descartado por decisión del usuario (Fase 2b). El control visible
  de cierre es la **«X» superior**; ver RF-03 (eliminado) para trazabilidad.
- **Cierre por Esc** garantizado en las cuatro superficies (hoy falta en autenticación; el
  usuario confirma que Esc no cierra el modal de Cuenta: se trata como **fallo a corregir**, §4.5),
  con **un único mecanismo de Esc por superficie** (I-1) y **exactamente un cierre por pulsación**.
- **Cierre por tocar/clicar fuera** efectivo en las cuatro (hoy anulado en Cuenta por la trampa
  de foco y no implementado en autenticación), **sin desactivar la trampa de foco** (I-2).
- **Cierre deslizando hacia abajo, solo en la versión móvil (<768px)**, en los **tres modales de
  contenido** (Cuenta, autenticación y detalle de tarjeta), implementado con **eventos de puntero
  nativos** (D5). **No aplica al menú superpuesto** (DP-08).
- **Una sola superficie modal y una sola trampa de foco activas a la vez**, garantizado **por
  diseño**: al abrir «Cuenta» se cierra el menú (DP-01/RF-13) y no existe ninguna otra ruta que
  apile superficies (DP-11).
- **Foco inicial en el propio contenedor del diálogo** (D4), no en la «X» ni en un botón de acción.
- **Menú superpuesto de móvil**: al abrir «Cuenta» desde él, **el menú se cierra automáticamente**
  (§6.2, DP-01).
- **Ajuste visual del contenido del menú móvil**: más aire por encima del contenido del panel
  deslizante, **solo en móvil**, con los tokens y la escala de espaciado del proyecto.
- **Altura y desbordamiento**: el cromo nuevo («X» + aire superior) **no debe**
  dejar contenido inalcanzable en viewports bajos; cada panel limita su altura y ofrece scroll
  interno (RF-22).
- **Reutilización del corte único de 768px** para decidir «móvil» en `AuthModal` y `ModalTarjeta`
  (D3): misma fuente de verdad que el resto de la app, sin duplicar la frontera.
- **Respeto de `prefers-reduced-motion`** en todo lo nuevo o modificado (RF-21).
- **Accesibilidad mínima homogénea** de las cuatro superficies: `role="dialog"`,
  `aria-modal="true"`, nombre accesible del diálogo, nombre accesible específico en los controles
  de cierre, foco inicial en el contenedor, foco visible con tokens y orden de tabulación lógico.
- **Andamiaje mínimo del entorno de pruebas** (D1, autorizado por el usuario): ajuste en
  `vitest.setup.js` y/o en la configuración de pruebas para que jsdom pueda ejercer la **trampa
  real** (jsdom no calcula layout y `tabbable` concluye que no hay nodos enfocables → `focus-trap`
  lanza). El andamiaje se limita a **geometría** (stub de `getBoundingClientRect`/`getClientRects`):
  **no es «mockear la librería»** y **no** se usa `displayCheck: 'none'` en el código de producto.
- **Actualización de las pruebas existentes** cuyas aserciones fijan hoy el contrato antiguo
  (foco inicial en el primer enfocable y recuento de enfocables): `DashboardUserModal.test.jsx`,
  `DashboardDrawer.test.jsx` (D4/§6.1 CL-14) y, en lo que aplique, `ModalTarjeta.test.jsx`.
- Las **pruebas** de las cuatro superficies con la **trampa real** (sin sustituir la librería), la
  prueba transversal de la regla general y la regresión de rutas/layout.
- Actualización de las **cabeceras JSDoc** de los archivos que se toquen.

### 2.2 Fuera de alcance (explícito)

- **Rediseño visual** de los modales: no se cambian fondos, radios, jerarquía de capas (`z-*`)
  más allá de lo imprescindible para que el cierre funcione, ni la animación de salida (ver DP-07).
  El ajuste de altura/scroll de RF-22 es una necesidad de layout, no un rediseño.
- **Migración a tokens de los hexadecimales heredados** de `AuthModal` (`bg-black/70`,
  `bg-[#0f1117]/95`, `border-[#1a7a5e]`, etc.) y de la landing: deuda técnica ya registrada.
  El cambio en `AuthModal` es **solo de comportamiento y accesibilidad** (DP-03), sin revisión
  visual del login.
- **La navegación lateral de ≥768px** (`SidebarResponsive`): **no** se modifica su aspecto ni su
  contenido; el ajuste de espaciado superior es **solo** del panel deslizante de móvil.
- **Cambios de contenido, rutas, datos, autenticación** (`TRIAL_ACTIVO` sin cambios), endpoints
  y backend.
- **Renombrado de props** (`ModalTarjeta` usa `onCerrar`/`onSeleccionarTarjeta` mientras el resto
  usa `alCerrar`): inconsistencia preexistente, se mantiene.
- **Unificación de los cuatro modales en un componente común**: se conservan los cuatro
  componentes y su API; solo se homologa el comportamiento de cierre (el patrón compartido se
  limita a los controles de cierre, RF-14).
- **Bloqueo del scroll del cuerpo** (`body.overflow`), que solo implementa `ModalTarjeta`: no se
  extiende ni se retira.
- **Deuda preexistente de `SidebarNavContenido`** (clase inválida `my-`, `text-white` en lugar de
  token, import `Settings` sin usar, nombre accesible de los enlaces colapsados): fuera de alcance
  según Spec 009 RF-12/RF-15. El componente conserva sus props y su contenido.
- **Mocks de la librería de trampa de foco** (`focus-trap-react`) y **`displayCheck: 'none'` en
  código de producción**: prohibidos por esta spec (D1). Sustituir la trampa real en pruebas
  vuelve a dejar sin verificar el defecto que motiva la spec.
- **Cambiar o duplicar el corte de 768px**, incluida cualquier media query propia en `AuthModal`
  o `ModalTarjeta` (D3).
- **El botón «Cerrar» al pie de los modales**: descartado por cambio de decisión del usuario
  (Fase 2b, 2026-10-16). No debe reintroducirse ni sustituirse por otro control de pie (por
  ejemplo, un pie con acciones de cierre). La accesibilidad de la superficie no depende de él:
  la «X» superior, Esc, el toque fuera y (en móvil) el gesto cubren el cierre.
- **Gestos adicionales** (deslizar hacia arriba, gestos horizontales, doble toque), **E2E**, y
  **dependencias nuevas**.

---

## 3. Relación con specs anteriores

| Spec | Relación |
|---|---|
| 004 (`ModalTarjeta`) | Es la referencia interna que **ya cumple** varias formas de cierre (X `aria-label="Cerrar detalle de tarjeta"`, Esc, clic en backdrop, trampa manual, retorno de foco). Aporta el patrón visual de la X; **no** cambia su contenido ni sus props. Su foco inicial pasa al contenedor (D4) y añade el gesto en móvil (D5). |
| 006 | Movió `AuthModal` y `ModalTarjeta` a `src/components/domain/modales/`. Ubicación vigente. |
| 007 | Creó `DashboardUserModal` y `DashboardDrawer` con `focus-trap-react`; de ahí vienen las opciones de trampa que causan el bloqueo (§4.2). |
| 008 | Dejó el menú superpuesto a pantalla completa (`inset-y-0`), lo que hace que cubra casi todo el viewport en móvil y que el «fuera del panel» sea invisible (§4.3-C3). El nuevo ajuste de espaciado del contenido móvil se aplica sobre ese panel. |
| 009 | Fija las **dos versiones de vista** (móvil <768 / pantallas grandes ≥768) y exige que el modal de cuenta **permanezca** con foco y trampa intactos al cruzar el corte (RF-09 y AC-11). Esta spec **preserva** ese comportamiento, añade las formas de cierre, fija que el gesto de deslizar es **exclusivo de móvil** y **no** modifica `useBreakpoint` ni el corte de 768px: solo **reutiliza** su fuente de verdad (D3) para las superficies que viven fuera del dashboard. |
| 010 (esta) | No reabre 007/008/009; corrige el comportamiento de cierre de las superficies modales, añade las formas de cierre, ajusta la convivencia menú↔modal en móvil y deja registrada la causa raíz. |

---

## 4. Diagnóstico del estado actual y causa raíz (evidencia)

> Las líneas citadas se verificaron el 2026-10-16 contra el repositorio y contra las dependencias
> instaladas. **Re-verificar antes de implementar** (el usuario sigue editando a mano).

### 4.1 Inventario: superficies modales existentes y su estado real

| Superficie | Dónde | «X» | Esc | Clic fuera | Trampa de foco real | Retorno de foco |
|---|---|---|---|---|---|---|
| **Modal de cuenta** (`DashboardUserModal.jsx`) | `src/components/layout/` | **No existe** (`:119-123`, el `<header>` solo contiene el `<h2>`) | Listener propio **independiente** (`:37-50`) con `escapeDeactivates: false` (`:103`); **el usuario confirma que no cerró** (§4.5) | **Implementado pero anulado por la trampa** (`:158-162` + §4.2) | Sí (panel con botones) | Sí, a `previousActiveElement` (`:53-71`); **el layout no le pasa `triggerRef`** (`DashboardLayout.jsx:113-116`) |
| **Menú superpuesto de móvil** (`DashboardDrawer.jsx`) | `src/components/layout/` | **No existe** (panel sin cabecera, `:105-113`) | Listener propio **independiente** (`:35-48`) con `escapeDeactivates: false` (`:89`) | Sí (backdrop `:122-126`), y **no lo bloquea ninguna trampa** | **NO se crea** (§4.3-C4) | Sí, a `triggerRef` / elemento previo (`:51-69`) |
| **Modal de autenticación** (`AuthModal.jsx`) | `src/components/domain/modales/` | **Sí** (`:89-98`, `aria-label="Cerrar modal"`) | **No** (sin listener de teclado) | **No** (el contenedor `:81` no tiene `onClick`) | **No** (trampa manual ausente) | **No** |
| **Detalle de tarjeta** (`ModalTarjeta.jsx`) | `src/components/domain/modales/` | **Sí** (`:109-118`, `aria-label="Cerrar detalle de tarjeta"`) | Sí (`:54-61`) | Sí (`:89`, con `stopPropagation` en el panel `:102`) | Sí, manual con Tab/Shift+Tab (`:63-76`, `:103`) | Sí (`:40-51`) |

> El inventario se revisó en la Fase 2b: la columna del **botón «Cerrar» al pie** (que ninguna
> superficie tenía) se elimina porque ese control ya no forma parte del objetivo (RF-03 eliminado).

**Ninguna de las cuatro cumple el objetivo**: dos no tienen X, una no tiene Esc ni clic fuera, y en
el modal de cuenta el clic fuera está anulado. Ninguna tiene tampoco un control de cierre en la
parte superior salvo las dos que ya lo implementan.

**Esc hoy:** cada superficie con Esc tiene **su propio listener independiente** en `document`
(`DashboardUserModal.jsx:37-50`, `DashboardDrawer.jsx:35-48`, `ModalTarjeta.jsx:54-61`) y ninguna
coordina con las demás; con dos superficies montadas, una sola pulsación ejecutaría **dos**
cierres (§4.3-C11, §6.2 DP-16).

### 4.2 Causa raíz del «modal bloqueado» (modal de cuenta)

**El clic fuera no cierra y, además, toda la interfaz deja de responder a clics mientras el
modal está abierto.** Cadena verificada (código del proyecto + código de las dependencias
instaladas):

1. `DashboardUserModal` configura la trampa así (`DashboardUserModal.jsx:95-104`):
   `clickDeactivates: false` y `escapeDeactivates: false`.
   `clickDeactivates` **no es una opción de `focus-trap`** (no aparece en su documentación: ver
   `node_modules/focus-trap/README.md`, opciones `clickOutsideDeactivates`/`allowOutsideClick`);
   es decir, la intención de «dejar pasar el clic y cerrar por overlay» **no se aplica**. El
   componente **tampoco** pasa `allowOutsideClick`, cuya **opción por defecto es `false`**
   (`node_modules/focus-trap/README.md:227`; `clickOutsideDeactivates` también `false`, `:216`).
   **La misma opción inexistente está repetida en el menú superpuesto**: `DashboardDrawer.jsx:88`
   (`clickDeactivates: false`), luego el defecto está **en dos** superficies, no solo en Cuenta.
2. Con `allowOutsideClick` en `false`, la trampa **no solo “no desactiva”: cancela el clic
   exterior**. Su `checkClick` en **fase de captura sobre `document`**
   (`node_modules/focus-trap/dist/focus-trap.js:818-831`) ejecuta `e.preventDefault()` y
   `e.stopImmediatePropagation()` para cualquier clic fuera del contenedor; y `checkPointerDown`
   **anula antes el `mousedown`/`touchstart`** con `e.preventDefault()` (`:651-681`).
3. `stopImmediatePropagation()` en la captura de `document` se ejecuta **antes** de que el
   evento llegue al contenedor donde React delega sus eventos (el `#root` de la app y el
   contenedor del portal, `document.body`). Por tanto **el `onClick` del overlay
   (`DashboardUserModal.jsx:158-162`) nunca se ejecuta**: el backdrop existe y es visible, pero
   es inerte. El mismo bloqueo anula los clics en **cualquier otra** superficie de la página
   mientras el modal esté abierto, lo que se percibe como «la app queda bloqueada».
4. **La vía de corrección es viable y no entra en conflicto con «una sola trampa activa»**. Con
   `allowOutsideClick: true`:
   - `checkPointerDown` retorna **sin tocar el evento** (`focus-trap.js:674-677`), de modo que no
     hay `preventDefault()` previo;
   - `checkClick` retorna **sin tocar el evento** (`:826-828`), de modo que el evento sigue su
     curso y **el `onClick` del overlay vuelve a ejecutarse**;
   - la trampa **no se desactiva** (a diferencia de `clickOutsideDeactivates`, que la desactiva en
     `:657-668`): el foco sigue confinado y `state.active` permanece.
   Conclusión: **`allowOutsideClick: true` + `clickOutsideDeactivates` sin usar** es la
   invariante del clic exterior (DP-15), compatible con RF-07 y con la trampa activa.
5. Consecuencia directa: sin X (`:119-123`, no existe) y sin clic fuera
   operativo, la única salida teórica sería Esc (listener propio, `:37-50`, no interceptado por la
   trampa porque `escapeDeactivates: false` deja pasar la tecla: `focus-trap.js:811-817`) o uno
   de los dos botones de acción; uno de ellos navega fuera del dashboard, lo que agrava la
   percepción de bloqueo. **El usuario confirma que Esc tampoco cerró** (§4.5).

**Resumen de la causa raíz:** configuración de la trampa de foco con los valores por defecto que
**prohíben** el clic exterior (con una opción inexistente repetida en dos componentes), sin ningún
control visible de cierre alternativo. El defecto es de **comportamiento de la trampa + ausencia
de controles de cierre**, no del `z-index` ni del portal.

### 4.3 Hallazgos adicionales (verificados por lectura de código)

- **C1 — Modal de cuenta sin X ni botón de cierre.** `DashboardUserModal.jsx:119-123`: el
  `<header>` usa `justify-between` pero solo contiene el `<h2 id="user-modal-title">Cuenta</h2>`.
  Tampoco hay pie con botón.
- **C2 — `AnimatePresence` no anima la salida.** El componente hace `if (!abierto) return null`
  (`:73`) **antes** de montar `<AnimatePresence>` (`:164-166`), así que el `exit` del panel
  (`:115`) nunca se ejecuta: el desmontaje es instantáneo. No causa el bloqueo, pero (a) explica
  parte de la sensación de «salto brusco» al cerrar y (b) es relevante para el gesto de deslizar:
  sin animación de salida, el gesto debe cerrar de forma igualmente inmediata. Ver DP-07.
- **C3 — En móvil se apilan dos superficies modales.** Abrir el modal de cuenta **no cierra el
  menú superpuesto** (`DashboardLayout.jsx:46-47` y `:101-110`): quedan dos `role="dialog"
  aria-modal="true"` (menú y modal) y dos capas simultáneas. El panel del menú es
  `fixed inset-y-0 right-0 w-[85vw] max-w-sm z-55` (`DashboardDrawer.jsx:105-107`) y el overlay
  del modal es `z-50` (`DashboardUserModal.jsx:159`), así que **el menú pinta por encima del
  overlay**: la zona «fuera del modal» clicable queda reducida a una franja estrecha a la
  izquierda, y en ella el clic está anulado igualmente (§4.2). Es decir: en móvil **no hay
  ninguna zona útil de «clic fuera»**. Además, contando con los criterios de Spec 007, la pila
  móvil llega a **cuatro superficies translúcidas simultáneas** (backdrop del menú + panel del
  menú + overlay del modal + panel del modal), por encima del límite de **tres**. Con DP-01 este
  escenario desaparece: el menú se cierra antes de montar el modal.
- **C4 — La trampa del menú superpuesto no llega a crearse.** `focus-trap-react` no envuelve a
  su hijo: clona el hijo y le inyecta un `ref`
  (`node_modules/focus-trap-react/dist/focus-trap-react.js:362-387`) y crea la trampa solo si ese
  `ref` resolvió a un nodo (`:132`, `:286-298`). En `DashboardDrawer` el hijo directo de
  `FocusTrap` es `<AnimatePresence>` (`:98-115`, dentro de `FocusTrap` `:94-97`), y `AnimatePresence` es un componente de función
  **sin `forwardRef`** (`node_modules/framer-motion/dist/cjs/index.js:306`), por lo que el `ref`
  **no se asigna** y la trampa **no se crea**: no hay foco inicial dentro del panel ni ciclado de
  Tab. La hipótesis inicial de «dos trampas peleando» **no se confirma**: el menú no tiene
  trampa; la que bloquea es la del modal de cuenta.
- **C5 — Las pruebas ocultan estos defectos.** `DashboardUserModal.test.jsx:31-58` y
  `DashboardDrawer.test.jsx:16-53` **sustituyen `focus-trap-react` por un mock**, precisamente
  para evitar el error «no tabbable nodes» de jsdom. Con el mock, «clic en overlay llama a
  `alCerrar`» (`DashboardUserModal.test.jsx:105-111`) pasa, pero **no verifica el
  comportamiento real** que hoy falla; y el mock convierte a la trampa del menú en un `<div>` que
  no existe en producción. Ninguna prueba ejerce **Esc con la trampa real**. La causa técnica del
  mock está en C13 y su solución autorizada en D1.
- **C6 — `AuthModal` es el único que no tiene Esc**, y su overlay no tiene `onClick`
  (`AuthModal.jsx:81`); su diálogo no tiene nombre accesible (`:83-87`).
- **C7 — Ubicación de pruebas.** `src/components/ModalTarjeta.test.jsx` está **fuera** de la
  carpeta del componente (`src/components/domain/modales/ModalTarjeta.jsx`), contra la convención
  de `AGENTS.md` (pruebas junto al código probado). Se registra como observación; moverlo **no**
  es requisito de esta spec. `AuthModal` **no tiene archivo de pruebas**.
- **C8 — Contraste del control de cierre según el panel.** El patrón de la X de
  `ModalTarjeta` (`text-slate-text hover:text-bg-dark`, `rounded-full p-2`,
  `focus-visible:ring-emerald-primary`) está pensado para un panel claro (`glass-card` sobre
  crema). El menú superpuesto usa panel **oscuro** (`bg-bg-dark/95`, `DashboardDrawer.jsx:106`),
  así que su X necesita tokens con contraste legible sobre oscuro
  manteniendo el mismo foco visible. La decisión concreta de clases corresponde al plan.
- **C9 — El panel del menú móvil empieza pegado al borde superior.** El panel es `inset-y-0`
  (`DashboardDrawer.jsx:106`) y su contenido es `SidebarNavContenido` sin margen superior
  (`SidebarNavContenido.jsx:36-38`): en móvil el primer enlace queda prácticamente a ras del
  borde. Ese es el punto de partida del ajuste visual de RF-15.
- **C10 — Opción inexistente repetida.** `DashboardDrawer.jsx:88` usa `clickDeactivates: false`,
  igual que el modal de cuenta (`DashboardUserModal.jsx:102`). Cualquier corrección debe atacar
  **las dos** superficies, no solo la que el usuario percibió bloqueada.
- **C11 — No hay coordinación de Esc.** Los tres listeners de Esc son independientes
  (`DashboardUserModal.jsx:37-50`, `DashboardDrawer.jsx:35-48`, `ModalTarjeta.jsx:54-61`); con dos
  superficies montadas, una pulsación cerraría ambas. Base de I-1/DP-16.
- **C12 — El foco inicial hoy va al primer elemento enfocable.** `focus-trap` enfoca el primer
  nodo tabulable al activarse (por eso `DashboardUserModal.test.jsx:146-151` fija el foco en
  «Configuración»), y `ModalTarjeta.jsx:44-45` lo pide explícitamente
  (`primerFocoable ?? dialogo`). D4 cambia esa expectativa: el foco inicial va al **contenedor**.
- **C13 — Por qué jsdom no puede ejercer la trampa real.** `tabbable` decide visibilidad con
  `displayCheck: 'full'` (por defecto), que consulta `node.getClientRects().length`
  (`node_modules/tabbable/dist/index.js:377-421`). jsdom **no calcula layout**, así que toda lista
  de rectángulos está vacía, `tabbable` concluye que no hay nodos enfocables y `focus-trap`
  termina en el estado «no tabbable nodes» que motiva el mock de C5. Es un problema de **entorno**,
  no del producto.
- **C14 — El cromo nuevo puede desbordar en viewports bajos.** Ni el panel de
  `DashboardUserModal` (`:112`, sin `max-h` ni scroll) ni el de `AuthModal` (`:84`, sin `max-h`
  ni scroll) tienen hoy límite de altura; añadir la «X» y **más aire superior** reduce el espacio
  útil del panel y puede dejar contenido inalcanzable (o desbordar el panel) en pantallas bajas,
  zoom alto o apaisado. `ModalTarjeta` ya lo resuelve (`max-h-[85vh] overflow-y-auto`, `:101`).
  Base de RF-22, que **sigue siendo necesario aunque el pie «Cerrar» ya no exista**.
- **C15 — `AuthModal` no limpia el formulario al cerrar y permanece montado.** Al cerrar solo se
  reinician `modo` y `mensaje` (`AuthModal.jsx:28-31`); `nombre`, `correo` y `contrasena`
  conservan su valor, y en la landing el componente está **siempre montado** (`PaginaInicio.jsx:37-41`,
  recibe `abierto`). Corrige la afirmación anterior de esta spec sobre el «descarte de datos»
  (§6.1 CL-07).

### 4.4 Qué se verificó y qué no (honestidad de la evidencia)

- **Verificado por lectura de código del repositorio y de las dependencias instaladas**
  (`focus-trap` 7.8.0, `focus-trap-react` 10.3.1, `framer-motion` 14.0.0, `tabbable` en
  `node_modules`): todo lo de §4.1, §4.2 y §4.3, incluida la invariante del clic exterior
  (`focus-trap.js:674-677` y `:826-828` retornan antes de tocar el evento) y la causa del error
  «no tabbable nodes» en jsdom (`tabbable/dist/index.js:377-421` → `getClientRects()`).
- **Verificado en el CSS construido** (cierra la duda anterior): el build presente en `dist/`
  (`dist/assets/index-*.css`, generado con **tailwindcss v4.3.3**) contiene las reglas
  `.z-55{z-index:55}`, `.z-60{z-index:60}` y `.z-65{z-index:65}`. Tailwind v4 admite valores
  numéricos de `z-index`, así que las capas usadas por los modales **sí se generan**. Si el build
  se regenera, volver a comprobarlo con un `grep` en el CSS resultante.
- **No verificado / pendiente**: comportamiento en un navegador real (esta fase no dispone de
  navegador ni terminal). Todo dato sobre comportamiento en navegador queda pendiente de AC-14
  (con pasos y entorno definidos) y de AC-15.
- **El fallo de Esc no se explica por completo con el código leído** (ver §4.5): se acepta como
  **fallo real confirmado por el usuario**, se exige Esc en las cuatro superficies y se añade una
  verificación **en navegador** (AC-14).
- **Estado del repositorio**: el usuario sigue editando código; medir la línea base
  (`npm test`, `npm run build`) antes de tocar nada y **re-verificar cada `archivo:línea`**.

### 4.5 El fallo de Esc confirmado por el usuario (hipótesis)

El usuario probó Esc y **no cerró** el modal. Por lectura de código, el modal de cuenta **sí**
registra Esc (`DashboardUserModal.jsx:37-50`) y la trampa **no intercepta** la tecla con
`escapeDeactivates: false` (`focus-trap.js:811-817`), por lo que el fallo no queda explicado del
todo. Hipótesis registradas, de mayor a menor probabilidad:

- **H1 — La superficie probada fue el modal de autenticación.** Es la única que **no tiene ningún
  tratamiento de Esc** (`AuthModal.jsx`, sin listener de teclado): ahí el fallo es seguro y está
  confirmado por código.
- **H2 — No había una tecla Esc real disponible.** En la versión móvil (táctil) no existe tecla
  Esc; si la prueba se hizo en móvil, el «no responde Esc» es un no-aplicable y las vías reales
  son X, tocar fuera y deslizar.
- **H3 — El cierre se produjo de forma confusa por los listeners independientes.** Con el menú y
  el modal apilados (hoy posible, §4.3-C3), **una sola pulsación dispara los dos listeners**
  (`DashboardUserModal.jsx:37-50` y `DashboardDrawer.jsx:35-48`) y cierra **dos** superficies a la
  vez; unido a que el panel del menú (`z-55`) pinta por encima del overlay del modal (`z-50`) y a
  que el modal **no reproduce animación de salida** (§4.3-C2), el resultado es difícil de
  interpretar y puede leerse como «no hizo nada». Con DP-01/DP-11 el apilamiento desaparece y con
  DP-16 el Esc deja de ser doble.
- **H4 — Esc se probó con la trampa real, y esa combinación nunca se ha verificado.** Todas las
  pruebas de Esc existentes corren con `focus-trap-react` **mockeado** (§4.3-C5), de modo que no
  existe evidencia automatizada del comportamiento real; cualquier interacción no prevista entre
  el listener propio y la trampa real solo se puede confirmar en navegador (AC-14).

**Conclusión:** Esc se exige en las cuatro superficies (RF-04), se prohíbe que la trampa
interfiera con él, se implementa donde falta, se elimina el doble manejo (I-1) y se **verifica en
navegador** (AC-14). No se justifica ignorar el síntoma por no reproducirlo en el código.

---

## 5. Requisitos Funcionales (EARS)

> Los RF-20 a RF-22 se añadieron en la revisión de Fase 2; los RF-17 a RF-19 conservan su número
> para no invalidar referencias previas. El **RF-03 se eliminó en la Fase 2b** y se conserva su
> hueco, **indicado como eliminado**, para trazabilidad.

### Regla general

- **RF-01 — Ubicuo — Regla general de no bloqueo.** Toda superficie modal de la app **DEBE** poder
  cerrarse por las **cuatro formas** aplicables a su naturaleza:
  **(1)** «X» en la parte superior, **(2)** tecla **Esc**,
  **(3)** **toque/clic fuera** del modal y **(4)** **deslizar hacia abajo** en la versión móvil
  (aplicabilidad por superficie en RF-09 a RF-12). Ninguna superficie **DEBE** quedar con alguna
  de sus formas ausente o inutilizada por otra capa o por la trampa de foco.
- **RF-02 — Ubicuo — «X» en la parte superior.** Cada superficie modal **DEBE** renderizar un
  botón de cierre en la parte superior del panel (esquina superior), con **área de toque
  suficiente**, icono con `aria-hidden`, **nombre accesible específico de la superficie que
  cierra** (p. ej. «Cerrar Cuenta», «Cerrar menú», «Cerrar detalle de tarjeta») y **foco visible
  con tokens** y contraste legible sobre el fondo de su panel (claro u oscuro). Activarla **DEBE**
  cerrar la superficie con el mismo efecto que las demás formas y **exactamente una vez**. La «X»
  **NO DEBE** ser el destino del foco inicial (RF-16) y **DEBE** ser el **único control visible de
  cierre** de la superficie (no hay controles de cierre al pie: §2.2).
- **RF-03 — ELIMINADO en la revisión de Fase 2b.** Exigía un botón «Cerrar» al pie en cada
  superficie y que siguiera alcanzable con scroll interno. Se **descarta el botón** por decisión del
  usuario (2026-10-16): queda sin objeto. Se conserva el número para trazabilidad. La necesidad de
  altura con scroll interno que mencionaba **no desaparece**: la cubre RF-22 con el cromo nuevo
  reducido a la «X» y al aire superior, y la alcanzabilidad de la «X» en viewports bajos se
  verifica en AC-20.
- **RF-04 — Evento — Cierre por Esc con un único mecanismo.** **CUANDO** se pulse Esc **MIENTRAS**
  una superficie modal esté abierta **EL SISTEMA DEBE** cerrarla. El sistema **DEBE** usar **un
  único mecanismo de Esc por superficie**: la trampa de foco **DEBE** mantener
  `escapeDeactivates: false` (la trampa no consume, no cancela ni maneja la tecla) y la superficie
  **DEBE** tener **un solo manejador propio** de Esc. **NO DEBE** combinarse `escapeDeactivates: true`
  con un manejador propio, y una pulsación **NO DEBE** provocar más de una llamada de cierre
  (RF-18/AC-16). Esc **NO DEBE** verse afectado ni consumido por la trampa, por el scroll del
  contenido ni por el foco de los campos de formulario.
  **Defensa (caso no previsto):** el apilamiento de superficies **NO DEBE** producirse por diseño
  (RF-07/RF-13); **SI**, por un caso no previsto, hubiera dos superficies montadas a la vez, la
  pulsación **DEBE** cerrar **solo la superior** —entendiendo por superior (a) la de **mayor capa
  `z-*`** y (b) en empate de capa, la **montada más tarde**— y una segunda pulsación **DEBE**
  cerrar la siguiente. Esa coordinación **DEBE** residir en **un único punto** (un registro o
  portador de la superficie activa que solo deja actuar a la superior) y **NO DEBE** dejarse a dos
  listeners independientes que cierren dos superficies con la misma tecla.
- **RF-05 — Evento — Cierre por toque/clic fuera (sin desactivar la trampa).** **CUANDO** ocurra
  un toque/clic sobre la zona exterior (backdrop) y **no** dentro del panel **EL SISTEMA DEBE**
  cerrar la superficie. La configuración del clic exterior **DEBE** permitirlo de forma explícita
  (**`allowOutsideClick: true`**, que hace que la trampa no cancele ni consuma el evento) y **NO
  DEBE** usar **`clickOutsideDeactivates`** (que desactivaría la trampa). Tras el clic exterior, la
  trampa **DEBE** seguir activa y confinando el foco (RF-07), y el retorno de foco **DEBE**
  gestionarse por RF-08. La opción **no existente** `clickDeactivates` **NO DEBE** reaparecer en
  ninguna superficie. El clic dentro del panel **NO DEBE** cerrarlo nunca, y **NO DEBE** cerrarlo
  un clic/gesto que comience en un control interactivo del panel.
- **RF-06 — Evento — Cierre por deslizar hacia abajo (solo móvil, con eventos de puntero
  nativos).** **CUANDO** la versión de vista sea **móvil (<768px)** y el usuario deslice el modal
  hacia abajo superando el umbral y con dirección predominantemente vertical **EL SISTEMA DEBE**
  cerrarlo. El gesto **DEBE** implementarse con **eventos de puntero nativos** (`pointerdown`/
  `pointermove`/`pointerup` o `touchstart`/`touchmove`/`touchend` + ratón) y **NO DEBE** usar el
  `drag` de Framer Motion, para no desactivar el scroll vertical del panel, no activarse si el
  arrastre **comienza en un control interactivo** (botón, enlace, X, campo) y poder respetar
  `prefers-reduced-motion` (RF-21; justificación en DP-13). El gesto **NO DEBE** existir en
  pantallas grandes (≥768px) y **NO DEBE** aplicarse al menú superpuesto lateral (DP-08). El gesto
  **NO DEBE** consumir ni bloquear el **scroll interno** del panel: si el contenido es desplazable
  y no está al principio, el arrastre **DEBE** desplazar el contenido en lugar de cerrar. El
  cierre por gesto **NO DEBE** ser la única vía: siempre coexiste con RF-02, RF-04 y RF-05.
- **RF-07 — Estado — Una sola superficie modal y una sola trampa de foco, por diseño.**
  **MIENTRAS** haya una superficie modal abierta **EL SISTEMA DEBE** mantener **exactamente una**
  trampa de foco activa, la de esa superficie, y **NO DEBE** existir ninguna ruta que deje dos
  superficies modales activas a la vez (dos `role="dialog"` + `aria-modal="true"` con contenido
  interactivo propio) ni dos trampas activas: en particular, abrir «Cuenta» **DEBE** cerrar el
  menú superpuesto (RF-13) y cualquier otra apertura **DEBE** impedirse en el mismo punto donde se
  abre la superficie. La trampa **DEBE** confinar el foco en el panel, **NO DEBE** interferir con
  RF-02 a RF-06 y **DEBE** seguir activa tras un clic exterior (RF-05).
- **RF-08 — Evento — Retorno de foco.** **CUANDO** se cierre una superficie modal **EL SISTEMA
  DEBE** devolver el foco al **control que la abrió**. **SI** ese control ya no existe en el DOM
  (p. ej. el avatar del menú superpuesto, que se cierra al abrir «Cuenta») **EL SISTEMA DEBE**
  trasladarlo a un **control estable equivalente** de la vista actual: en móvil, el botón
  **«Menú»** de la navegación inferior; en pantallas grandes, el **control de la navegación
  lateral** (el botón del logotipo/colapso). **NO DEBE** dejarse el foco en `body` ni en un nodo
  desmontado, y **NO DEBE** perderse al cerrar con cualquiera de las formas aplicables.

### Aplicación por superficie, forma a forma

| Superficie | «X» arriba | Esc | Toque/clic fuera | Deslizar ↓ (solo móvil) |
|---|---|---|---|---|
| **Cuenta** (`DashboardUserModal`) | **Añadir** | **Exigir** (hoy existe; fallo confirmado, verificar) | **Hacer efectivo** (hoy anulado) | **Sí** |
| **Menú superpuesto de móvil** (`DashboardDrawer`) | **Añadir** | **Exigir** (hoy existe) | **Exigir** (hoy funciona) | **No** (DP-08) |
| **Autenticación** (`AuthModal`) | Conservar (ya existe) | **Añadir** (hoy no tiene) | **Añadir** (hoy no tiene) | **Sí** |
| **Detalle de tarjeta** (`ModalTarjeta`) | Conservar (ya existe) | Conservar (ya funciona) | Conservar (ya funciona) | **Sí** |

> La columna del botón «Cerrar» al pie se retiró en la Fase 2b (RF-03 eliminado): ninguna
> superficie lleva control de cierre en el pie.

- **RF-09 — Ubicuo — Modal de cuenta.** `DashboardUserModal` **DEBE** cumplir RF-01 a RF-08 con
  **X nueva**, **clic fuera efectivo** (hoy anulado: `allowOutsideClick`, DP-15) y Esc
  verificado con mecanismo único. La X **DEBE** quedar **dentro** del panel (y por
  tanto dentro de la trampa de foco).
- **RF-10 — Ubicuo — Menú superpuesto de móvil.** `DashboardDrawer` **DEBE** cumplir RF-01 a RF-08
  con **X nueva**, **corrección de la opción inexistente** (`:88`) y **trampa de foco
  realmente creada** (hoy no se crea: §4.3-C4), con foco inicial en el panel, ciclado de Tab y sin
  bloquear el cierre por toque fuera. **NO DEBE** habilitarse el gesto de deslizar hacia abajo
  (DP-08).
- **RF-11 — Ubicuo — Modal de autenticación.** `AuthModal` **DEBE** cumplir RF-01 a RF-08:
  conservar su X actual, **añadir Esc** y **toque/clic fuera**, y
  dotar de **nombre accesible** al diálogo y a su control de cierre. **NO DEBE** cambiarse su
  aspecto ni migrarse sus colores heredados (§2.2, DP-03). El gesto de deslizar (móvil) **DEBE**
  convivir con el formulario sin interferir con la edición ni con el scroll (RF-06).
- **RF-12 — Ubicuo — Detalle de tarjeta.** `ModalTarjeta` **DEBE** conservar sus tres formas
  actuales (X, Esc, clic fuera) y **añadir el gesto de
  deslizar** en móvil, sin cambiar su contenido, sus props ni su trampa manual.
- **RF-13 — Evento — Menú abierto + apertura de «Cuenta» (móvil).** **CUANDO** se abra el modal de
  cuenta desde el menú superpuesto **EL SISTEMA DEBE** cerrar el menú, de modo que exista **una
  sola** superficie modal y **una sola** trampa, se recupere la zona útil de «tocar fuera» y no se
  superen las tres superficies translúcidas por vista. El foco **NO DEBE** perderse en la
  transición (RF-08).

### Patrón compartido, accesibilidad y ajuste visual

- **RF-14 — Ubicuo — Patrón común del control de cierre.** Las «X» de las cuatro superficies
  **DEBEN** seguir **un mismo patrón** (misma estructura, misma
  convención de nombre accesible, mismas clases de tokens para foco visible y hover, mismo
  comportamiento de cierre único), de modo que el resultado sea **consistente y sin duplicación
  innecesaria** cuando el mismo control aparece en varias superficies. La forma concreta del
  patrón (pieza reutilizable, utilidad compartida o repetición controlada) se decide en el plan;
  **NO DEBE** introducirse ninguna dependencia nueva.
- **RF-15 — Ubicuo — Ajuste visual del contenido del menú móvil.** **CUANDO** la versión de vista
  sea **móvil** **EL SISTEMA DEBE** mostrar el contenido del panel deslizante (navegación y
  avatar) **un poco más abajo**, con **mayor aire en la parte superior** del panel, usando los
  **tokens y la escala de espaciado** del proyecto, y **sin** solaparse con la nueva «X». La
  navegación lateral de **≥768px** y el resto del layout **NO DEBEN** cambiar. El ajuste **NO
  DEBE** añadir superficies translúcidas, blobs ni hexadecimales nuevos.
- **RF-16 — Ubicuo — Accesibilidad mínima homogénea.** Cada superficie modal **DEBE** exponer
  `role="dialog"`, `aria-modal="true"`, **nombre accesible del diálogo** (`aria-labelledby` a su
  título o `aria-label` si no tiene título), **foco inicial en el propio contenedor del diálogo**
  (`tabindex="-1"` o equivalente), orden de tabulación lógico, **foco visible** con tokens y
  **nombre accesible específico** en la «X». El contenedor **NO DEBE** formar parte del
  ciclo de tabulación (queda fuera del selector de enfocables) y **NO DEBE** mostrar indicador de
  foco que sugiera interacción. En `AuthModal`, el diálogo **DEBE** pasar a tener nombre accesible
  (hoy no lo tiene) y su X **DEBE** dejar de llamarse genéricamente «Cerrar modal».

### Comportamiento transversal (añadido en la revisión de Fase 2)

- **RF-20 — Ubicuo — Fuente única del corte de 768px.** La decisión «¿es versión móvil?» en
  `AuthModal` y `ModalTarjeta` **DEBE** reutilizar **la misma fuente de verdad** del corte de
  **768px** que usa el dashboard (`useBreakpoint` o la parte de versión de vista extraída de él en
  un refactor mínimo), y **NO DEBE** duplicarse el valor 768 ni introducirse una media query o
  constante paralela en esos componentes. El corte, su semántica (<768 móvil / ≥768 pantallas
  grandes) y el contrato de Spec 009 **NO DEBEN** cambiar. Reutilizarlo fuera del dashboard es
  inocuo: `useBreakpoint` lee `localStorage` y registra listeners de `matchMedia` al montarse, y
  **solo persiste la preferencia de la navegación lateral cuando el usuario la alterna**
  (`useBreakpoint.js:18-31, 43-59, 64-71`); el gesto no alterna nada.
- **RF-21 — Ubicuo — Respeto de `prefers-reduced-motion`.** Toda animación, transición o
  movimiento **nuevo o modificado** por esta spec (incluido el desplazamiento del gesto y cualquier
  animación de entrada/salida que se toque) **DEBE** respetar `prefers-reduced-motion` mediante
  `useReducedMotion` o el bloque `@media (prefers-reduced-motion: reduce)` de
  `src/styles/index.css:113-121`; con movimiento reducido, el cierre por gesto **DEBE** ser
  inmediato y sin animación, y no **DEBE** introducirse ninguna animación nueva por CSS o por
  transición que ignore esa preferencia. Se alinea con `doc/constitution.md:71-72` (animaciones con
  CSS y APIs nativas, sin librerías nuevas) y con `.agents/rules/rules.md:41`.
- **RF-22 — Ubicuo — Altura y desbordamiento con el cromo nuevo.** Al añadir la «X» y el aire
  superior, cada superficie modal **DEBE** limitar la altura de su panel al viewport disponible
  y ofrecer **scroll interno** cuando el contenido no quepa (`max-h` + `overflow-y-auto` o el
  criterio equivalente que fije el plan), de modo que **NINGUNA** parte esencial —contenido y «X»—
  quede inalcanzable en pantallas bajas, en apaisado o con zoom alto. Este ajuste
  **NO DEBE** alterar el aspecto declarado fuera de alcance (§2.2) ni introducir nuevas superficies
  translúcidas, y en el menú móvil **NO DEBE** romper el comportamiento de altura completa de
  Spec 008. **Sigue siendo necesario aunque el botón «Cerrar» al pie ya no exista** (Fase 2b): el
  aire superior consume espacio útil y la «X» debe seguir siendo alcanzable.

### Regresión y no-regresión

- **RF-17 — Ubicuo — Sin cambios de rutas, contenido ni datos.** Rutas del dashboard y de la
  landing, contenido de las páginas, `TRIAL_ACTIVO`, endpoints y datos **NO DEBEN** cambiar. **NO
  DEBEN** introducirse hexadecimales nuevos en JSX/JS ni aumentarse las superficies translúcidas
  simultáneas (**máx. 3**) ni los blobs (**máx. 2**) por vista. El corte de versión de vista de
  **768px** y el contrato de dos versiones de Spec 009 **NO DEBEN** alterarse. El andamiaje de
  pruebas (RF-18) **NO DEBE** cambiar el comportamiento del producto ni entrar en el bundle.
- **RF-18 — Ubicuo — Cobertura de pruebas con la trampa real, sin mocks ni `displayCheck`.**
  Cada superficie modal **DEBE** tener pruebas que ejerzan el **comportamiento real** de las cuatro
  formas aplicables **sin sustituir la librería de trampa de foco**, más una prueba **transversal**
  que verifique la regla general (ninguna superficie sin formas de cierre; nunca dos trampas ni dos
  superficies modales activas; una sola llamada de cierre por gesto). Para hacerlo viable en jsdom
  se autoriza el **andamiaje mínimo de D1** (stub de geometría en `vitest.setup.js` y/o en la
  configuración de pruebas). **NO DEBE** mockearse `focus-trap-react` (ni `tabbable`) y **NO DEBE**
  usarse **`displayCheck: 'none'`** en el código de producto. Las aserciones existentes que fijan
  el contrato antiguo (foco inicial en el primer enfocable, recuento de enfocables) **DEBEN**
  actualizarse al contrato nuevo (D4). **DEBE** existir al menos una verificación **en navegador**
  de Esc en las cuatro superficies (AC-14).
- **RF-19 — Ubicuo — Documentación.** Las cabeceras JSDoc de los archivos tocados **DEBEN**
  reflejar el contrato nuevo (cuatro formas de cierre, control de cierre superior, trampa única, foco
  inicial en el diálogo, ajuste del menú móvil). Antes de citar la convención de rutas de
  `AGENTS.md`, ver §9 (rutas inexistentes). Toda referencia `archivo:línea` de esta spec **DEBE**
  re-verificarse antes de implementar.

---

## 6. Casos Límite y Decisiones

### 6.1 Casos límite

- **CL-01 — Menú superpuesto abierto + apertura de «Cuenta» (móvil).** Resuelto: el menú se
  cierra al abrir el modal (RF-13, DP-01). Debe verificarse que la transición no deja foco en
  `body` ni un panel pintado por encima del modal.
- **CL-02 — Esc con dos superficies montadas (defensa, no camino previsto).** El apilamiento está
  impedido por diseño (RF-07/RF-13); si ocurriera, la pulsación **cierra solo la superior** —mayor
  capa `z-*`; en empate, la montada más tarde— desde el **punto único de coordinación** (DP-16), y
  la segunda pulsación cierra la siguiente. La superficie inferior conserva su trampa y sus formas
  de cierre. Se verifica en prueba, no se asume como flujo real.
- **CL-03 — Retorno de foco con el disparador desmontado.** El avatar vive en
  `SidebarNavContenido`, que se renderiza **en dos sitios** (navegación lateral de ≥768px y menú
  superpuesto móvil). Si al abrir «Cuenta» se cierra el menú (RF-13), el avatar disparador se
  desmonta: el foco **DEBE** ir al botón «Menú» de la navegación inferior (DP-05). Además, el
  modal de cuenta **no recibe `triggerRef`** (`DashboardLayout.jsx:113-116`) y captura el foco
  previo en un `useLayoutEffect` (`DashboardUserModal.jsx:53-59`) mientras la trampa enfoca con
  retardo (`delayInitialFocus` por defecto), por lo que el valor capturado puede no ser el
  esperado: el requisito se cumple por el destino final del foco, no por el valor capturado.
- **CL-04 — Dos disparadores distintos para el mismo modal.** En pantallas grandes el avatar está
  en la navegación lateral; en móvil, en el menú. Las cuatro formas (tres en pantallas grandes)
  **DEBEN** cumplirse en los dos caminos y el retorno de foco debe ir al disparador correcto.
- **CL-05 — «Fuera del panel» con el menú abierto (móvil).** Mientras exista esa convivencia, el
  panel del menú (`z-55`) cubre el 85 % del ancho y queda por encima del overlay del modal
  (`z-50`): la zona exterior útil sería una franja mínima. Con RF-13 esta situación **no debe
  producirse**; aun así, RF-05 exige que **toda** la superficie exterior al panel cierre.
- **CL-06 — Contraste de los controles de cierre según el panel.** Panel claro en Cuenta
  (`bg-bg-cream/95`), detalle de tarjeta (`glass-card`) y autenticación (panel oscuro heredado);
  panel oscuro en el menú móvil (`bg-bg-dark/95`). Ningún control de cierre **DEBE** perder
  contraste ni foco visible en ninguno de los casos (§4.3-C8).
- **CL-07 — Esc mientras se escribe (afirmación corregida).** En `AuthModal` hay campos de
  formulario: Esc **DEBE** cerrar el modal **sin pedir confirmación** y sin interferir con la
  edición. **No se descartan datos**: el componente **no** limpia `nombre`, `correo` ni
  `contrasena` al cerrarse (`AuthModal.jsx:21-31`) y en la landing permanece montado
  (`PaginaInicio.jsx:37-41`), de modo que los valores escritos **persisten** al reabrir. Ese
  comportamiento se **mantiene** (fuera de alcance cambiarlo) y se convierte en verificable: cerrar
  con cualquiera de las formas **NO DEBE** borrar ni reiniciar los campos, ni provocar errores
  (AC-22).
- **CL-08 — Modal abierto + cruce del corte de 768px (coherencia con Spec 009).** El modal **DEBE
  permanecer** abierto con foco y trampa intactos (Spec 009 RF-09/AC-11), **DEBE** conservar todas
  las formas aplicables a la nueva versión de vista (incluido el gesto de deslizar en móvil y su
  ausencia en ≥768px) y **NO DEBE** generar una segunda trampa ni perder la X.
- **CL-09 — Gesto de deslizar y scroll interno.** En el detalle de tarjeta (panel con
  `overflow-y-auto`) y en formularios largos, el arrastre **DEBE** desplazar el contenido cuando
  este pueda desplazarse y no esté al principio; el cierre por gesto solo procede cuando el
  arrastre no está consumido por el scroll. El gesto **NO DEBE** activarse por un toque
  involuntario (exige umbral y dirección vertical predominante) ni cuando **comienza en un control
  interactivo** (botón, enlace, X, campo).
- **CL-10 — Cierres consecutivos / idempotencia.** Un cierre por X seguido de Esc (o de un clic
  fuera) **NO DEBE** producir errores ni cerrar dos veces superficies distintas, ni reactivar el
  modal ya cerrado, ni llamar de nuevo al callback de cierre (AC-17).
- **CL-11 — `ModalTarjeta` dentro de `PanelTarjetas`.** Abrir/cerrar el detalle **NO DEBE** cambiar
  el número de llamadas al cierre (una por gesto) ni el retorno de foco actual (Spec 004), con las
  formas nuevas incluidas.
- **CL-12 — Verificación en jsdom (resuelto por D1).** El error «no tabbable nodes» está
  diagnosticado (§4.3-C13) y su solución autorizada es el **andamiaje de geometría** de D1, no el
  mock de la librería. La prueba con trampa real **DEBE** montar paneles con nodos enfocables
  presentes y **NO DEBE** silenciarse volviendo a mockear (RF-18).
- **CL-13 — Ajuste visual del menú móvil.** El aire superior nuevo **NO DEBE** provocar
  desbordamiento vertical, solapar la X ni romper el comportamiento `safe-area`/altura completa
  del panel (Spec 008); el contenido del menú **DEBE** seguir siendo desplazable hasta el final.
- **CL-14 — Impacto de D4 en las aserciones existentes.** Cambian, como mínimo:
  `DashboardUserModal.test.jsx:146-151` (foco inicial ya no es «Configuración» sino el contenedor)
  y `:163-171` (el recuento de enfocables pasa de 2 a 3: «X», «Configuración», «Salir del demo»);
  `DashboardDrawer.test.jsx:203-215` (el foco inicial ya no es el primer enlace sino el
  panel) y `:217-231` (pasa de 4 a 5: «X», 3 enlaces, avatar); `ModalTarjeta.test.jsx:123-127`
  (ya pasa, porque el foco queda dentro del diálogo, pero **DEBE** reforzarse a que
  `document.activeElement` **sea** el diálogo, no un botón). Los recuentos finales dependen del
  orden que fije el plan; lo exigible es que el foco inicial sea el contenedor y que la «X» esté
  **dentro** del panel. Al no existir botón «Cerrar» al pie (Fase 2b), ninguno de esos recuentos lo
  incluye.
- **CL-15 — Contenedor con `tabindex="-1"`.** El panel **NO DEBE** entrar en el ciclo de Tab (queda
  excluido por el selector `[tabindex]:not([tabindex="-1"])` que ya se usa en las pruebas y en la
  trampa manual de `ModalTarjeta`) ni mostrar un indicador de foco visible al abrirse (foco
  programático). Un reencuadre de foco al abrir **NO DEBE** producir scroll no deseado.
- **CL-16 — Desbordamiento con el cromo nuevo.** En viewports bajos (p. ej. 320×568), apaisado o
  con zoom alto, el panel con `max-h` + scroll interno **DEBE** seguir permitiendo llegar a la «X»
  y al contenido; **NO DEBE** quedar contenido cortado sin scroll ni el panel fuera del
  viewport (RF-22, AC-20). Sigue siendo exigible **sin** botón «Cerrar» al pie (Fase 2b).
- **CL-17 — `prefers-reduced-motion` / `prefers-reduced-transparency`.** Con movimiento reducido,
  ninguna animación nueva se reproduce (el cierre por gesto es inmediato); con transparencia
  reducida, los paneles ya tienen su propio tratamiento en `src/styles/index.css:104-110` y esta
  spec **NO DEBE** añadir superficies translúcidas que lo empeoren (RF-21).
- **CL-18 — Simulación de la versión de vista en pruebas.** `vitest.setup.js` devuelve hoy
  `matches: false` en todas las media queries y `innerWidth: 1024` (`vitest.setup.js:5-24`), lo que
  equivale a **móvil** tras el `sincronizarVersion()` del hook. Las pruebas del gesto y de la
  versión de vista **DEBEN** controlar explícitamente `matchMedia`/`innerWidth` para cubrir móvil y
  ≥768px, sin depender del mock global.
- **CL-19 — Reutilizar `useBreakpoint` fuera del dashboard (D3).** Importarlo en `AuthModal` o
  `ModalTarjeta` es inocuo: solo lee `localStorage` y registra listeners de `matchMedia`
  (`useBreakpoint.js:18-31, 43-59`); **no** escribe la preferencia salvo que se llame a
  `toggleSidebar` (`:64-71`), que esos componentes no usan. Si el plan prefiere extraer solo la
  parte de versión de vista, el refactor **DEBE** ser mínimo y **NO DEBE** cambiar el
  comportamiento de la navegación lateral ni el corte (RF-20).

### 6.2 Decisiones (incorporadas del usuario)

| ID | Decisión |
|---|---|
| **DP-01** | En móvil, al abrirse «Cuenta» desde el menú superpuesto, **el menú se cierra automáticamente**: una sola superficie y una sola trampa, se recupera la zona útil de «tocar fuera» y se evita la pila de capas (`z-55` del menú sobre `z-50` del overlay del modal). Coherente además con el límite de **≤3 superficies translúcidas** por vista (§4.3-C3). |
| **DP-02** | Alcance: **las cuatro superficies** (Cuenta, menú superpuesto de móvil, autenticación y detalle de tarjeta) entran en la regla general, en el añadido de controles de cierre y en las pruebas. |
| **DP-03** | `AuthModal`: **solo comportamiento y accesibilidad** (X existente, Esc, clic/tap fuera, nombre accesible del diálogo y del control de cierre). **No** se migra su aspecto ni se hace revisión visual del login. |
| **DP-04** | Esc con dos capas: **cierra solo la superior**; otra pulsación cierra la siguiente. **Defensa**, no camino previsto: el apilamiento está prohibido por diseño (DP-11). «Superior» = mayor capa `z-*`; en empate, la montada más tarde. |
| **DP-05** | Foco al cerrar con el disparador desmontado: **control estable equivalente** — botón «Menú» del `BottomNav` en móvil; control de la navegación lateral en pantallas grandes. El foco **nunca** se pierde. |
| **DP-06** | **Esc se exige en las cuatro superficies** y se verifica en navegador (AC-14). El fallo reportado por el usuario se trata como **defecto a corregir**, no como pendiente de reproducción; hipótesis en §4.5. |
| **DP-07** | La **animación de salida** del modal de cuenta (§4.3-C2) queda **fuera** de esta spec: no es necesaria para las formas de cierre y no se pide cambio visual. Se registra como observación. |
| **DP-08** | **Alcance del gesto de deslizar hacia abajo:** aplica **solo** a los **tres modales de contenido** (Cuenta, autenticación y detalle de tarjeta) y **solo en móvil (<768px)**; **no aplica al menú superpuesto**, porque ese panel se desliza **lateralmente**, ocupa todo el alto (`inset-y-0`) y su contenido es desplazable: un arrastre vertical pertenece al scroll del menú y usarlo para cerrar produciría cierres involuntarios. El menú conserva X, Esc y toque fuera. Si el usuario quisiera un gesto propio para el menú, sería un gesto lateral, no una deslizada hacia abajo, y se trataría en una spec aparte. |
| **DP-09** | **Control visible de cierre en las cuatro superficies:** la **«X» arriba**, además de Esc, toque fuera y (en móvil, según DP-08) deslizar abajo. **Revisada en la Fase 2b:** la versión original de esta decisión incluía también un botón «Cerrar» al pie, que el usuario **descartó** (RF-03 eliminado, §2.2). |
| **DP-10** | **Andamiaje del entorno de pruebas autorizado (B-1, D1).** Para ejercer la **trampa real** en jsdom se autoriza un ajuste **mínimo** en `vitest.setup.js` y/o en la configuración de pruebas: stub de geometría (`getBoundingClientRect`/`getClientRects`) que devuelva rectángulos no vacíos, porque jsdom no calcula layout y `tabbable` (`displayCheck: 'full'`, `tabbable/dist/index.js:377-421`) concluye que no hay nodos enfocables y `focus-trap` lanza «no tabbable nodes». **Esto no es «mockear la librería»**: `focus-trap-react` y `tabbable` se usan reales; solo se aporta la geometría que jsdom no implementa. **Prohibido** `displayCheck: 'none'` en el código de producto. Consecuencia documentada: `vitest.setup.js`/configuración de pruebas **entran en el alcance** (antes estaban declarados fuera, lo que se contradecía con exigir la trampa real), y los AC que piden «trampa real» (**AC-01, AC-03, AC-06, AC-16 y AC-19**; **AC-01** añadido en la corrección de la Fase 2b) son ejecutables. |
| **DP-11** | **Apilamiento imposible por diseño (B-2, D2).** Con RF-13 (abrir «Cuenta» cierra el menú) no existe ningún camino real con dos superficies abiertas: RF-07 exige **exactamente una** trampa y prohíbe cualquier ruta que apile. Por tanto, «Esc cierra solo la superior» (RF-04/CL-02) queda como **caso defensivo** verificado en prueba, con **un único punto de coordinación** que identifica la superior por **orden de capas** (`z-*`; empate: montada más tarde) y **nunca** mediante dos listeners independientes que cierren dos superficies. |
| **DP-12** | **Foco inicial al contenedor del diálogo (I-3, D4).** Al abrirse, el foco va al **propio contenedor** del modal (`tabindex="-1"` o equivalente), **no** a la «X», ni al primer botón, ni a un botón de acción; el contenedor queda fuera del ciclo de Tab y sin indicador de foco visible. Impacto en aserciones existentes: §6.1 CL-14. |
| **DP-13** | **Gesto con eventos de puntero nativos (I-5, D5).** El «deslizar hacia abajo» se implementa con eventos de puntero/touch nativos y **no** con `drag` de Framer Motion: así no se desactiva el scroll vertical del panel, no se cierra si el arrastre empieza en un control interactivo y se puede respetar `prefers-reduced-motion`. Coherente con las reglas del proyecto (Framer Motion reservado para hover/tap, modales, `layoutId` y contadores; `doc/constitution.md:71-72` pide animaciones con CSS y APIs nativas). Se **retira** la sugerencia anterior de `drag`/`onDragEnd` en §9. |
| **DP-14** | **Reutilizar el corte único de 768px (I-4, D3).** `AuthModal` y `ModalTarjeta` deciden «móvil» reutilizando la **misma fuente de verdad** que el dashboard (`useBreakpoint`, o el refactor mínimo que extraiga solo la parte de versión de vista), **sin** duplicar el 768 ni crear media queries propias. Reutilizarlo fuera del dashboard es inocuo (solo lee `localStorage` y escucha `matchMedia`; persiste únicamente al alternar la navegación lateral). |
| **DP-15** | **Invariante del clic exterior (I-2).** El cierre por clic/toque fuera **DEBE** ser efectivo **sin desactivar la trampa**: se usa **`allowOutsideClick: true`** y **nunca `clickOutsideDeactivates`**. Verificado en `focus-trap`: con `allowOutsideClick` verdadero, `checkPointerDown` (`:674-677`) y `checkClick` (`:826-828`) retornan **sin tocar el evento**, de modo que el `onClick` del overlay se ejecuta y la trampa sigue activa; la opción inexistente `clickDeactivates` (`DashboardUserModal.jsx:102`, `DashboardDrawer.jsx:88`) desaparece. El **retorno de foco** lo gestiona la propia superficie/el layout (RF-08), no la desactivación de la trampa. |
| **DP-16** | **Un único mecanismo de Esc (I-1).** Por superficie: **`escapeDeactivates: false`** (la trampa no consume ni maneja Esc) + **un solo manejador propio**; prohibido combinar `escapeDeactivates: true` con manejador propio o duplicar listeners. Coordinación entre superficies desde **un único punto** (registro de la superficie activa) que, en el caso defensivo de dos capas, deja actuar **solo a la superior**. Una pulsación ⇒ **una** llamada de cierre (AC-16). |
| **DP-17** | **`prefers-reduced-motion` como requisito (menor).** Toda animación nueva o modificada respeta la preferencia; con ella activa el gesto cierra sin animación (RF-21). Framer Motion ya expone `useReducedMotion` y el proyecto ya tiene su bloque CSS. |
| **DP-18** | **Cromo nuevo sin desbordamiento (menor).** El panel limita su altura y ofrece scroll interno, de modo que la «X» y el contenido sigan alcanzables en viewports bajos, apaisado o zoom alto (RF-22). `ModalTarjeta` ya lo hace (`max-h-[85vh] overflow-y-auto`); se homologa el criterio sin cambiar el aspecto declarado fuera de alcance. |
| **DP-19** | **Corregida la afirmación sobre `AuthModal` y los datos (menor).** Verificado que el componente **no** limpia los campos al cerrar y que permanece montado en la landing: los datos escritos **persisten**; se mantiene ese comportamiento y se verifica que el cierre no los borre (CL-07, AC-22). |
| **DP-20** | **`z-55`/`z-60`/`z-65` verificados (menor).** El CSS construido (`dist/assets/index-*.css`, tailwindcss v4.3.3) contiene `.z-55{z-index:55}`, `.z-60{z-index:60}` y `.z-65{z-index:65}`: las capas de los modales **sí se generan**. Duda cerrada; re-comprobar tras cada build. |
| **DP-21** | **Re-verificación de líneas (aviso).** El usuario sigue editando código: toda referencia `archivo:línea` de esta spec **DEBE** re-verificarse antes de implementar y antes de escribir el plan. |
| **DP-22** | **Eliminación del botón «Cerrar» al pie (Fase 2b).** Por cambio de decisión del usuario (2026-10-16), el botón «Cerrar» al pie **se descarta** en las cuatro superficies: el control visible de cierre es la «X» superior. Solo quedan cuatro formas de cierre («X», Esc, toque/clic fuera y deslizar abajo solo en móvil). Se conservan **RF-03** y las decisiones/criterios afectados con la marca de «eliminado/revisada» para no romper la trazabilidad; el resto del contrato (RF-22, foco inicial al contenedor, mecanismo único de Esc, clic fuera sin desactivar la trampa, corte único de 768px, `prefers-reduced-motion` e igualdad de accesibilidad) permanece intacto. |

### 6.3 Puntos abiertos

**Ninguno.** Las seis preguntas de la Fase 1 quedaron resueltas (DP-01 a DP-06) y la Fase 2 cerró
las decisiones D1–D5, la auditoría I-1/I-2 y los puntos menores (DP-10 a DP-21); la Fase 2b añadió
DP-22 (eliminación del botón «Cerrar» al pie). Si aparece
información nueva durante la implementación (por ejemplo, un fallo de Esc reproducible con pasos
concretos), se registrará como caso límite y se verificará en navegador, sin reabrir la spec.

---

## 7. API afectada

### 7.1 Componentes de superficie modal

| Componente | Props hoy | Efecto de esta spec |
|---|---|---|
| `DashboardUserModal` | `{ abierto, alCerrar, triggerRef? }` | **Sin cambios de firma.** Se añade internamente la «X» superior (único control visible de cierre, RF-02); el cierre por clic fuera pasa a ser efectivo (`allowOutsideClick: true`, nunca `clickOutsideDeactivates`); Esc se mantiene con mecanismo único; foco inicial al contenedor (`tabindex="-1"`); se añade el gesto de deslizar en móvil; altura con scroll interno. `triggerRef` sigue opcional, pero el layout puede pasarle un ref estable para RF-08. |
| `DashboardDrawer` | `{ abierto, alCerrar, children, triggerRef? }` | **Sin cambios de firma.** Se añade la «X» superior (único control visible de cierre) con aire superior para no solaparla, se corrige la trampa de foco (hoy no se crea) y la opción inexistente (`:88`). **Sin** botón de pie (RF-03 eliminado) y **sin** gesto de deslizar (DP-08). Foco inicial al panel. Es chrome propio del panel, **no** dentro de `children`. `children` sigue siendo `SidebarNavContenido`. |
| `AuthModal` | `{ abierto, modoInicial, alCerrar }` | **Sin cambios de firma.** Se añaden Esc, toque/clic fuera, foco inicial al contenedor y el gesto de deslizar en móvil (con punteros nativos y sin interferir con el formulario); su «X» existente se conserva como único control visible de cierre (RF-03 eliminado); el diálogo y el control de cierre pasan a tener nombre accesible específico; altura con scroll interno. Estilo intacto. Necesita saber la versión de vista reutilizando el corte de 768px (RF-20). |
| `ModalTarjeta` | `{ tarjeta, onCerrar }` | **Sin cambios de firma.** Se añade el gesto de deslizar en móvil (punteros nativos); se conservan su «X» como único control visible de cierre, Esc, clic fuera, trampa manual y retorno de foco. **El cambio de foco inicial al contenedor SÍ es necesario**: la justificación previa («ya lo contempla `primerFocoable ?? dialogo`», `:44-45`) era **falsa**, porque con la «X» presente ese operador siempre resuelve a un botón y **nunca** cae al contenedor; hay que forzar el foco al diálogo (`tabindex="-1"` y `dialogo.focus()` sin depender del `??`). Contenido intacto. Necesita la versión de vista por el corte único (RF-20). |

### 7.2 Layout del dashboard

| Elemento | Hoy | Efecto de esta spec |
|---|---|---|
| `DashboardLayout` — estados | `mobileMenuAbierto`, `userModalAbierto` | Se mantienen; su **coordinación** cambia: al abrir el modal de cuenta **se cierra el menú** (DP-01/RF-13). |
| `DashboardLayout` — llamada al modal | `<DashboardUserModal abierto={userModalAbierto} alCerrar={alCerrarUserModal} />` sin `triggerRef` | Debe resolverse el retorno de foco al disparador o a su equivalente estable (RF-08/DP-05); puede requerir pasar un `triggerRef` estable (p. ej. el botón «Menú»). |
| `DashboardLayout` — foco al cruzar el corte | efecto que cierra el menú y traslada el foco al control lateral (`:53-63`) | Se conserva y **NO DEBE** perder el modal abierto (CL-08, Spec 009 RF-09). |
| `SidebarNavContenido` | `{ alAbrirUserModal, colapsada }` (avatar en `:61-77`) | **Sin cambios de firma ni de contenido** (Spec 009 RF-12/RF-15): el avatar sigue siendo el disparador; su foco se devuelve o se traslada según RF-08. |
| `SidebarResponsive` / navegación lateral ≥768px | — | **Sin cambios** de aspecto ni de contenido; el ajuste de espaciado superior es solo del panel móvil (RF-15). |
| `BottomNav` | `{ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef }` | **Sin cambios de firma**; su botón «Menú» es el destino de foco estable en móvil (DP-05). |
| `useBreakpoint` (`src/hooks/useBreakpoint.js`) | Devolución `{ isMobile, isDesktop, sidebarColapsada, toggleSidebar }`; corte único 768px | **Sin cambios de comportamiento ni de corte.** Puede **reutilizarse** tal cual por `AuthModal`/`ModalTarjeta` o refactorizarse mínimamente para compartir solo la parte de versión de vista (DP-14). Si se refactoriza, su contrato público y el de Spec 009 **NO DEBEN** cambiar. |

### 7.3 Entorno de pruebas (nuevo en el alcance)

| Elemento | Hoy | Efecto de esta spec |
|---|---|---|
| `vitest.setup.js` | Mock de `matchMedia` (`:5-17`), `innerWidth` (`:20-24`) y `localStorage` (`:27-36`) | **Entra en el alcance.** Se autoriza el **stub de geometría** de DP-10 para que jsdom permita la trampa real. **NO DEBE** mockearse `focus-trap-react`/`tabbable` ni condicionar la visibilidad de nodos de producto. Debe seguir permitiendo simular móvil y ≥768px en las pruebas (CL-18). Es el **único** archivo de configuración de pruebas que se toca: el que lo carga (`vitest.config.js`/`package.json`) **no** se modifica y su ubicación se **localiza**, no se asume |
| `DashboardUserModal.test.jsx` | Mock de `focus-trap-react` (`:32-58`), mock de `framer-motion` (`:16-29`), aserciones de foco/recuento (`:146-151`, `:163-171`) | **Se retira el mock de la trampa**; se actualizan las aserciones al contrato nuevo (CL-14) y se añaden las **cuatro formas** por superficie. |
| `DashboardDrawer.test.jsx` | Mock de `focus-trap-react` (`:17-53`), aserciones de foco/recuento (`:203-215`, `:217-231`) | **Se retira el mock de la trampa** (que además hoy convierte en `<div>` algo que no se monta en producción); se actualizan aserciones y se prueba el gesto/menú. |
| `ModalTarjeta.test.jsx` | Sin mock de trampa (manual); aserción de foco dentro del diálogo (`:123-127`) | Se amplía con el gesto en móvil y el refuerzo del foco inicial **en el contenedor** (`document.activeElement === dialogo`, cambio necesario: §7.1). |
| `AuthModal` | **Sin archivo de pruebas** | **Debe** ganar cobertura de las **cuatro formas**, accesibilidad y versión de vista. |
| Prueba transversal | — | Nueva: matriz superficie × forma y unicidad de trampa/superficie activa (AC-06). |

---

## 8. Pruebas de Aceptación (criterios verificables)

> **Naturaleza y viabilidad.** Gracias al **andamiaje autorizado** (DP-10: stub de geometría en
> `vitest.setup.js`, no un mock de la librería), en jsdom **sí** es verificable la cadena de
> bloqueo del clic (§4.2), el cierre por las **cuatro formas** y la trampa real; el gesto de deslizar
> es verificable con **eventos de puntero sintéticos**. «Se ve bien», contraste, solapes y el
> **comportamiento real de Esc en navegador** requieren **revisión manual**. Cada criterio se
> reporta como pass/fail o como **no ejecutado**. Los AC-16 a AC-23 se añadieron en la revisión de
> Fase 2. **Ninguna AC queda sin objeto** por la eliminación del pie «Cerrar» (Fase 2b): se ajustan
> sus menciones y sigue siendo exigible todo lo demás (RF-22 incluido).

| ID | Escenario | Esperado | Verificación |
|---|---|---|---|
| AC-01 | **Cuenta** (escritorio, abierto desde el avatar de la navegación lateral) | Las formas aplicables (aquí tres: sin gesto en ≥768px) funcionan: **X**, **Esc** y **clic fuera** cierran; cada una cierra **una sola vez**; el foco inicial está en el **contenedor** y al cerrar vuelve al avatar | Test (trampa real) + revisión visual |
| AC-02 | **Cuenta** (móvil, abierto desde el menú superpuesto) | Al abrir, **el menú se cierra** (una sola superficie y una sola trampa); **X**, **Esc**, **tocar fuera** y **deslizar abajo** cierran; el foco termina en el botón **«Menú»** del BottomNav | Test + revisión visual |
| AC-03 | **Menú superpuesto de móvil** | **X** nueva cierra; **Esc** cierra; **tocar fuera** cierra; **la trampa se crea de verdad** (foco inicial en el **panel** y Tab cicla sin salir); el gesto de deslizar **NO** cierra el menú (DP-08); el contenido del menú aparece **más abajo** con más aire arriba, sin solaparse con la X | Test (trampa real, con andamiaje de DP-10) + revisión visual |
| AC-04 | **Autenticación** (`AuthModal` en `/` y `/login`) | **X** existente, **Esc**, **clic/tap fuera** y **deslizar abajo** (móvil) cierran; el diálogo y el control de cierre tienen nombre accesible específico; Esc cierra incluso con el foco en un campo | Test + revisión visual |
| AC-05 | **Detalle de tarjeta** (`ModalTarjeta`, regresión + formas nuevas) | **X**, **Esc** y **clic fuera** siguen cerrando; **deslizar abajo** (móvil) cierra; el contenido del detalle no cambia; el foco inicial está en el contenedor y al cerrar vuelve al activador | Test existente ampliado + revisión visual |
| AC-06 | **Regla general (transversal, matriz superficie × forma)** | Para las cuatro superficies, ninguna forma aplicable está ausente ni inutilizada; en ningún momento hay dos trampas activas ni dos `role="dialog"` con contenido interactivo propio; no aparece la opción inexistente `clickDeactivates` en el código | Test transversal (trampa real) + `grep` |
| AC-07 | **Esc con dos superficies montadas (caso defensivo, forzado en prueba)** | La pulsación cierra **solo** la superior (mayor capa `z-*`; en empate, la montada más tarde); la segunda cierra la siguiente; la inferior conserva su trampa y sus formas de cierre; **no** se cierra dos superficies con una pulsación | Test |
| AC-08 | **Retorno de foco (criterio objetivo)** | Tras cerrar con cada una de las formas aplicables, `document.activeElement` **es exactamente** el control esperado: el disparador si sigue en el DOM; si el disparador se desmontó (avatar del menú), el **botón «Menú»** (móvil) o el **control de la navegación lateral** (≥768px); **nunca** `document.body` ni un nodo desconectado (`isConnected === false`) | Test (aserción sobre `document.activeElement` y `isConnected`) + revisión manual solo si el entorno no lo permite |
| AC-09 | **Ajuste visual del menú móvil** | Solo en móvil, el contenido del panel empieza más abajo (más aire arriba), con tokens de espaciado; la navegación lateral de ≥768px **no cambia**; sin desbordamiento ni solape con la X | Test (estructura/clases) + revisión visual |
| AC-10 | **Gesto de deslizar** | Solo en móvil y solo en los tres modales de contenido: un arrastre vertical corto **no** cierra; uno que supera el umbral cierra; un arrastre sobre contenido desplazable **desplaza** y no cierra; el gesto no se activa al empezar sobre un control interactivo ni en ≥768px | Test (eventos de puntero sintéticos, controlando la versión de vista: CL-18) + revisión visual |
| AC-11 | **Modal abierto + cruce del corte de 768px** | El modal **permanece** abierto con foco y trampa intactos (Spec 009 RF-09/AC-11); conserva las formas aplicables a la nueva versión (gesto al pasar a móvil y su ausencia al pasar a pantallas grandes) | Test (estructura) + revisión visual |
| AC-12 | **Accesibilidad mínima** | Las cuatro superficies: `role="dialog"`, `aria-modal="true"`, nombre accesible del diálogo, nombre accesible específico en la «X», foco visible con tokens, **foco inicial en el contenedor** con `tabindex="-1"` fuera del ciclo de Tab | Test (atributos/estructura) |
| AC-13 | **Regresión funcional, datos y diseño** | Rutas y contenido sin cambios (`App.test.jsx`, `PanelTarjetas.test.jsx`), `TRIAL_ACTIVO` sin cambios, **sin hexadecimales nuevos** en JSX/JS, sin superficies translúcidas extra, corte de 768px intacto, andamiaje de pruebas fuera del bundle | `npm test` + `npm run build` + `grep` |
| AC-14 | **Verificación en navegador de Esc en las cuatro superficies** (defecto confirmado por el usuario) | Con la trampa de foco **real**, Esc cierra cada una de las cuatro superficies: en escritorio (≥768px) Cuenta desde el avatar, menú desde el botón «Menú», `AuthModal` en `/` y `/login`, detalle de tarjeta desde el panel; y en móvil (<768px) la misma batería. **Una** pulsación ⇒ **un** cierre. **Entorno a registrar:** navegador y versión (p. ej. Chrome/Chromium, Firefox o Safari con su número), sistema operativo, y la versión de vista (≥768px real o <768px simulada, indicando el ancho). **Pasos:** abrir la superficie → pulsar Esc → registrar si cierra, en cuántos intentos y dónde queda el foco; adjuntar evidencia (captura o nota) | Revisión manual **obligatoria** (no automatizable) |
| AC-15 | **Revisión visual Fluid Glass** (escritorio y móvil, con el menú abierto y con el modal abierto) | La «X» se ve y contrasta en panel claro (Cuenta, tarjeta) y en panel **oscuro** (menú); el backdrop es visible y utilizable; ≤3 superficies translúcidas y ≤2 blobs por vista; sin solape ni contenido tapado | Revisión manual (no automatizable) |
| AC-16 | **Esc: un solo mecanismo, un solo cierre** (I-1) | Cada superficie tiene **exactamente un** manejador de Esc (`escapeDeactivates: false` + un único listener propio); una pulsación produce **una sola** llamada al callback de cierre; no existe doble manejo ni cierre de dos superficies con una tecla | Test (contador de llamadas y espía de listeners) |
| AC-17 | **Cierres consecutivos / idempotencia** (CL-10) | Cerrar con una forma y volver a intentarlo (Esc después de la X, clic fuera después de la X) **no** produce errores, **no** repite la llamada de cierre, **no** cierra otras superficies y **no** reactiva el modal | Test |
| AC-18 | **Cabeceras JSDoc actualizadas** (RF-19) | Todos los archivos tocados describen el contrato nuevo (cuatro formas, control de cierre superior, trampa única, foco inicial en el diálogo, ajuste del menú móvil) y no citan rutas inexistentes de plantillas | Revisión de archivos (`grep` de `@uso`/`@eventos`) |
| AC-19 | **Andamiaje de pruebas correcto y sin mocks de la librería** (RF-18, DP-10) | Las pruebas de las superficies **que usan `focus-trap-react`** (Cuenta, menú y autenticación) ejercen la librería **real**; `ModalTarjeta` queda **fuera de esta exigencia** porque usa **trampa manual**, que RF-12 obliga a conservar (su cobertura es la de AC-05/AC-10/AC-12). El andamiaje se limita a geometría (`getBoundingClientRect`/`getClientRects`) **en `vitest.setup.js`** (la configuración de pruebas puede vivir en `vitest.config.js` o en `package.json`; su ubicación se localiza, no se asume); **no** hay `vi.mock("focus-trap-react"` ni `displayCheck` en `src/`; `npm test` pasa | Revisión de pruebas + `grep` (**patrón sin paréntesis de cierre**: `vi.mock("focus-trap-react"`; hoy devuelve 2 ocurrencias, `DashboardUserModal.test.jsx:32` y `DashboardDrawer.test.jsx:17`, y debe terminar en 0) + `npm test` |
| AC-20 | **Sin desbordamiento con el cromo nuevo** (RF-22, CL-16) | En viewports bajos (p. ej. 320×568), apaisado y zoom alto, ninguna parte esencial queda inalcanzable: la «X» y el contenido son alcanzables (visibles o vía scroll interno del panel) y no hay contenido cortado sin scroll | Test (estructura/clases `max-h`/`overflow`) + revisión visual |
| AC-21 | **`prefers-reduced-motion`** (RF-21) | Con movimiento reducido activo, ninguna animación nueva o modificada se reproduce y el cierre por gesto es inmediato; sin la preferencia, el comportamiento es el normal | Test (mock de `useReducedMotion`/`matchMedia`) + revisión manual |
| AC-22 | **`AuthModal`: el cierre no borra lo escrito** (CL-07 corregido) | Con texto en los campos, cerrar con cualquiera de las formas (Esc, X, clic fuera, gesto) cierra sin confirmación, sin errores y **sin** borrar ni reiniciar `nombre`, `correo` ni `contrasena`: al reabrir en la landing, los valores persisten (comportamiento actual mantenido) | Test |
| AC-23 | **Fuente única del corte de 768px** (RF-20, D3) | `AuthModal` y `ModalTarjeta` obtienen «móvil» de la misma fuente de verdad que el dashboard; **no** hay `768` duplicado ni media query propia de versión de vista fuera de `useBreakpoint` (o de la parte extraída de él) | `grep` de **`min-width` de versión de vista** en `src/`: única aparición en `src/hooks/useBreakpoint.js:12,14` y **0** fuera de ahí en código de producto. El literal `768` en **comentarios/JSDoc** (`DashboardLayout.jsx`, `SidebarResponsive.jsx`, `useBreakpoint.js`) y en **pruebas** (`useBreakpoint.test.js`, `DashboardLayout.test.jsx`) es **esperado**: ese grep **no** debe dar 0 |

> Ninguna AC se declara verde sin medición. Hoy **deben fallar** (reproducen el defecto con la
> trampa real, una vez aplicado el andamiaje de DP-10): **AC-01, AC-03, AC-06 y AC-14**; y deben
> pasar tras el cambio. AC-02, AC-04 y AC-05 también deben fallar en sus formas nuevas
> (fuera/X/Esc ausentes o anuladas).

---

## 9. Dependencias Técnicas

- **`focus-trap-react` 10.3.1 + `focus-trap` 7.8.0** (ya instaladas, no se añaden dependencias):
  el comportamiento que causa el bloqueo son los **valores por defecto** de `allowOutsideClick`
  y `clickOutsideDeactivates` (`README.md:216,227`) y el `stopImmediatePropagation()` del clic
  exterior (`dist/focus-trap.js:818-831`). La corrección pasa por **`allowOutsideClick: true`**
  (que hace retornar `checkPointerDown` `:674-677` y `checkClick` `:826-828` **sin tocar el
  evento**) y **nunca** por `clickOutsideDeactivates` (que desactivaría la trampa, `:657-668`) ni
  por la opción inexistente `clickDeactivates` (`DashboardUserModal.jsx:102`,
  `DashboardDrawer.jsx:88`). Esc se mantiene con `escapeDeactivates: false` (`:811-817`) + un
  único manejador propio (DP-16).
- **`focus-trap-react` solo crea la trampa si el `ref` inyectado al hijo directo resuelve**
  (`dist/focus-trap-react.js:132,286-298,362-387`) → el hijo directo de `FocusTrap` debe ser un
  elemento del DOM (p. ej. el propio panel), no un componente que no reenvíe `ref` como
  `AnimatePresence` (`framer-motion` 14.0.0, `dist/cjs/index.js:306`). Es la causa de que la
  trampa del menú no exista hoy (§4.3-C4).
- **`tabbable` (dependencia de `focus-trap`) y jsdom**: su `displayCheck: 'full'` por defecto
  consulta `node.getClientRects().length` (`node_modules/tabbable/dist/index.js:377-421`); jsdom no
  calcula layout, de ahí el error «no tabbable nodes». **Solución autorizada**: stub de geometría
  **en `vitest.setup.js`** (DP-10), **no** mock de la librería ni `displayCheck: 'none'` en
  producción. La configuración que carga ese archivo **puede vivir en `vitest.config.js` o en
  `package.json`** (hoy en ambos, y `vite.config.js` ya no tiene el bloque `test`): **se localiza, no
  se asume**; esta spec **no** la mueve ni la unifica.
- **`framer-motion` 14** (ya instalada, permitida en modales): se conserva para las animaciones
  existentes y **no** se usa para el gesto: el «deslizar hacia abajo» se implementa con **eventos
  de puntero nativos** (DP-13), que no desactivan el scroll del panel, no capturan gestos que
  empiezan en controles interactivos y permiten respetar `prefers-reduced-motion` sin depender de
  la librería. Queda **retirada** la sugerencia anterior de `drag`/`onDragEnd`. Sin dependencias
  de gestos nuevas.
- **`prefers-reduced-motion`**: soporte ya existente (`useReducedMotion` en `ModalTarjeta` y
  bloque `@media (prefers-reduced-motion: reduce)` en `src/styles/index.css:113-121`) más el
  requisito de `doc/constitution.md:71-72`.
- **Corte único de 768px**: `src/hooks/useBreakpoint.js` (constante `QUERY_PANTALLAS_GRANDES`
  `:12`) es la única fuente de verdad; `AuthModal`/`ModalTarjeta` lo **reutilizan** (DP-14). El
  hook lee `localStorage` y escucha `matchMedia` al montarse y **solo** persiste la preferencia al
  alternar la navegación lateral (`:64-71`), por lo que reutilizarlo fuera del dashboard es
  inocuo; si se extrae la parte de versión de vista, el refactor debe ser mínimo.
- **Trampa manual de `ModalTarjeta`** (Tab/Shift+Tab con selector propio, `:63-76`): patrón
  interno ya probado que puede reutilizarse como referencia y como base de comparación.
- **Patrón compartido del control de cierre** (RF-14): si el mismo botón «X» se repite en cuatro
  superficies, la forma reutilizable (pieza o utilidad) se decide en el plan, con el patrón visual
  de `ModalTarjeta.jsx:109-118` como base y **sin** dependencias nuevas.
- **Pruebas actuales**: `DashboardUserModal.test.jsx` (`:16-58` mocks de `framer-motion` y
  `focus-trap-react`; `:146-151` y `:163-171` aserciones a actualizar) y `DashboardDrawer.test.jsx`
  (`:17-53` mock de la trampa que además enmascara la no-creación real; `:203-215` y `:217-231`
  aserciones a actualizar); `AuthModal` **no tiene pruebas**; `ModalTarjeta.test.jsx` vive fuera de
  la carpeta del componente (§4.3-C7). La configuración global de pruebas
  (`vitest.setup.js:5-36`) **entra en el alcance** por DP-10: es el **único** archivo de configuración
  de pruebas que se toca —el archivo que lo carga (`vitest.config.js`, `package.json`) **no** se
  modifica y su ubicación se localiza, no se asume—. Tres aserciones frágiles quedan registradas para
  las tareas: `DashboardUserModal.test.jsx:266-274` (exige `flex-shrink-0 w-6 h-6` a **todos** los
  `<svg>` del panel y romperá con el aspa de la «X»), `DashboardDrawer.test.jsx:159-166`
  (`parentElement !== document.body`, que deja de ser cierto con la trampa **real**) y
  `ModalTarjeta.test.jsx:123-127` (`dialog.contains(...)`, que debe **reforzarse** a
  `document.activeElement === dialog`).
- **Tokens y límites Fluid Glass**: `src/styles/index.css` como única fuente de color y escala de
  espaciado (base del ajuste de RF-15 y de la altura de RF-22); ≤3 superficies translúcidas y ≤2
  blobs por vista.
- **Capas `z-*`**: verificadas en el CSS construido (`dist/assets/index-*.css` contiene
  `.z-55{z-index:55}`, `.z-60{z-index:60}`, `.z-65{z-index:65}` con tailwindcss v4.3.3). No hace
  falta definir tokens nuevos de capa; re-comprobar tras cada build.
- **Cabeceras JSDoc**: la convención citada en `AGENTS.md` apunta a
  `.agents/file-header-template.md` y `.agents/response-rules.md`, **rutas que no existen**; las
  reales están en `.agents/skills/response-rules.md/SKILL.md` y
  `.agents/skills/file-hearder-template.md/SKILL.md` (con el typo). **Avisar de la
  inconsistencia antes de seguirla** (ya registrada en Spec 009 §8).
- **Sin dependencias nuevas** y sin cambios de build (el andamiaje de pruebas no forma parte del
  bundle).

---

## 10. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Se «arregla» la X y se da por resuelto el bloqueo sin corregir el clic fuera | El usuario sigue sintiendo el modal bloqueado; el resto de la interfaz sigue inerte mientras está abierto | RF-05 + DP-15 (`allowOutsideClick: true`, sin `clickOutsideDeactivates`) + AC-01/AC-06 con la **trampa real**; verificar que el resto de la UI no queda anulada |
| Se vuelve a mockear `focus-trap-react` «porque jsdom no lo permite» (§4.3-C5) | Verde falso: ni el bloqueo ni la ausencia de trampa del menú se detectan | RF-18 + DP-10 (andamiaje de **geometría**, explícitamente no un mock) + AC-19 midiendo el fallo actual antes del cambio |
| El andamiaje de pruebas se convierte en un mock encubierto o en `displayCheck: 'none'` | Se pierde la capacidad de detectar el defecto por completo | DP-10 + RF-18 + AC-19 (`grep` de `vi.mock("focus-trap-react")` y `displayCheck`) |
| El fallo de Esc no se reproduce en jsdom y se da por bueno | El usuario sigue sin poder cerrar con Esc | RF-04/RF-18 + **AC-14 en navegador obligatorio con pasos y entorno** + AC-16 (un solo mecanismo, un solo cierre) |
| Dos mecanismos de Esc por superficie (trampa + listener) o listeners sueltos entre superficies | Doble cierre, superficies cerradas de golpe, comportamiento impredecible | DP-16 + AC-16/AC-07; `escapeDeactivates: false` siempre, coordinación en un punto único |
| El apilamiento se «soluciona» solo en el caso del menú y reaparece por otra vía | Vuelven la zona muerta de clic, el exceso de superficies translúcidas y el doble Esc | RF-07 exige impedirlo en el punto de apertura de cualquier superficie + AC-06 con la trampa real |
| El gesto de deslizar provoca cierres involuntarios o pelea con el scroll | Pérdida de datos en formularios y frustración al leer contenido largo | RF-06 (punteros nativos, umbral, dirección, prioridad del scroll, exclusión de controles) + AC-10 + CL-09; el gesto nunca es la única vía de cierre |
| El gesto se implementa también en el menú y cierra el menú al desplazarlo | Usuario no puede leer el menú en móvil con contenido desplazable | DP-08 explícito: el gesto **no** aplica al menú; AC-03 lo verifica |
| Cambiar el foco inicial al contenedor rompe pruebas y expectativas (D4) | Suites en rojo y confusión sobre el foco esperado | CL-14 documenta exactamente qué aserciones cambian; AC-12 exige el contenedor con `tabindex="-1"` fuera del ciclo de Tab |
| El cromo nuevo (X + aire superior) desborda en viewports bajos o zoom alto | La «X» o el contenido quedan inalcanzables: el modal vuelve a sentirse bloqueado | RF-22 + CL-16 + AC-20 (`max-h` + scroll interno) + AC-15 |
| El retorno de foco apunta a un disparador desmontado | Foco perdido en `body`: el teclado queda sin contexto tras cerrar | RF-08 + DP-05 + AC-08 con aserción objetiva sobre `document.activeElement` y `isConnected` |
| Se duplica el corte de 768px en `AuthModal`/`ModalTarjeta` | Divergencia de versiones de vista y regresión de Spec 009 | RF-20/DP-14 + AC-23 (`grep` de `768`) + preservar el contrato de `useBreakpoint` |
| Los controles de cierre nuevos repiten markup y divergen (nombres, clases, foco) | Inconsistencia visual y de accesibilidad entre las cuatro superficies | RF-14 (patrón común de la «X») + AC-12/AC-15 |
| La «X» rompe contraste en panel oscuro o añade una superficie translúcida | Incumple AA y el límite Fluid Glass | CL-06 + RF-15/RF-17 + AC-15 |
| Se reintroduce por inercia el botón «Cerrar» al pie (docs o tareas previas) | Trabajo y cromo no pedidos, y expectativas desalineadas con la decisión del usuario | Fase 2b registrada en la cabecera y en §2.2 + DP-22 + RF-03 eliminado con trazabilidad; AC-19/AC-12 no lo exigen |
| El nuevo aire superior del menú móvil desborda o tapa la X | Regresión visual en móvil | CL-13 + AC-03/AC-09 (estructura) + AC-15 (visual) |
| Se ignora `prefers-reduced-motion` en el gesto o en las animaciones tocadas | Incumple una regla del proyecto y afecta a usuarios sensibles al movimiento | RF-21/DP-17 + AC-21 |
| Se amplía el alcance a un rediseño de `AuthModal` o a la migración de hex heredados | Cambio visual no pedido y sin revisión | §2.2 y DP-03 + AC-13 (`grep` de hexadecimales) |
| Se rompe el comportamiento exigido por Spec 009 (modal permanece al cruzar el corte) | Regresión de una spec aprobada | RF-17/CL-08 + AC-11 |
| Las líneas citadas quedan obsoletas por las ediciones manuales del usuario | Diagnóstico y plan sobre premisas falsas | DP-21: re-verificar cada `archivo:línea` antes de planificar e implementar |
| La validación visual no puede realizarse (no hay navegador en el entorno) | Criterios visuales, AC-14 y AC-15 sin verificar | Reportar AC-14 y AC-15 como **no ejecutados**, nunca como aprobados; dejarlo constar en el cierre |

---

## 11. Próximos Pasos

1. **Spec aprobada por el usuario con el cambio de Fase 2b** (eliminación del botón «Cerrar» al
   pie). La cabecera sigue en **`borrador`** como marca documental; no quedan preguntas abiertas:
   DP-01 a DP-22 están resueltas (§6.2 y §6.3). El **plan** y las **tareas** derivados ya se han
   generado a partir de esta spec.
2. **Re-verificar el diagnóstico contra el código actual** (DP-21): líneas de los cuatro modales,
   `DashboardLayout`, los tres archivos de prueba y `vitest.setup.js`, porque el usuario sigue
   editando a mano. **Ejecutado el 2026-10-16 (Tarea 1 de `tasks.md`)**: dejó cuatro ajustes
   documentales (configuración de pruebas movida a `vitest.config.js`/`package.json`, patrón efectivo
   del `grep` de AC-19, alcance real del `grep` de AC-23 y la línea del `AnimatePresence` del menú) y
   tres aserciones frágiles registradas en las Tareas 4, 5 y 8.
3. **Medir la línea base antes de tocar código**: `npm test` y `npm run build`, registrando el
   estado real (incluidas las suites que hoy pasarían a fallar cuando se retire el mock de la
   trampa). **Ejecutado: 257/257 pruebas en 22 archivos y build en verde**; tras la Tarea 2
   (andamiaje + canario) la suite queda en **260/260 en 23 archivos**.
4. **Generar `plan.md`** con: andamiaje de pruebas concreto (stub de geometría, sin mock), mecánica
   del clic exterior (`allowOutsideClick: true`), mecanismo único de Esc y su punto de coordinación,
   foco inicial del contenedor, corrección de la trampa del menú (hijo directo con `ref`),
   forma del patrón compartido del control de cierre (RF-14), estructura de la «X» por panel
   (claro/oscuro), altura y scroll (RF-22), gesto con eventos de puntero
   (umbral, prioridad del scroll, `prefers-reduced-motion`), reutilización del corte de 768px
   (RF-20), espaciado superior del menú móvil, archivos afectados, pruebas (con las que hoy deben
   fallar) y relación RF → cambio.
5. **Generar `tasks.md`** (máx. 10 tareas pequeñas, en orden, con RF cubiertos y «Hecho cuando»),
   incluyendo el andamiaje de pruebas, la prueba transversal de la regla general, el ajuste visual
   del menú móvil y la regresión de Spec 009.
6. **Implementar y validar**: pruebas focalizadas, `npm test`, `npm run build`, **verificación en
   navegador de Esc (AC-14, con navegador/versión/ancho registrados)** y revisión visual de
   escritorio/móvil con el menú abierto y con el modal abierto (AC-15, AC-20); registrar
   explícitamente lo no ejecutado.
