# Plan 017 — Asistente de ayuda en el dashboard (solo diseño)

**Spec:** [`spec.md`](spec.md) — **aprobada por el usuario el 2026-10-20**.
**Fecha del plan:** 2026-10-20 · **Estado:** listo para ejecutar [`tasks.md`](tasks.md).
**Alcance:** solo diseño (RF-01…RF-14): reutilizar `AsistenteAyuda` de la 014, montarlo una vez en
el layout, añadir el disparador flotante y cerrar el detalle de tarjeta en el único punto de apertura.
**Fuera:** motor, guion, texto libre, máquina de estados, persistencia, IA, backend, red,
dependencias nuevas y migración global de hexadecimales (spec §2.2, §9).
**Fase:** planificación. **Este documento no modifica `src/`**; fija archivos, mecanismos, orden y
validación.

**Línea base de partida (aportada, no asumida):** `HEAD` `dadc119`; `npm test` **518/518 en 33
archivos**; `npm run build` verde, CSS **61,13 kB** · JS **389,45 kB**. La **T1 la re-mide** antes de
tocar código. El **CSS no es criterio de aceptación**: solo se registra como referencia (spec
§«Línea base», §9.1).

**Referencias `archivo:línea`:** el planner las re-verificó el **2026-10-20** sobre el árbol actual.
El usuario edita a mano: **T1 vuelve a sondearlas** y lo que ya no exista se registra como «ya no
aplicable», sin corregirlo ni recrearlo (spec CL-09).

**Re-verificación del planner (2026-10-20):**

| Pieza | Estado verificado | Uso |
|---|---|---|
| `src/layout/DashboardLayout.jsx:16-24` | Selectores del cruce (`SELECTOR_ENFOCABLE` incluye `button`) | D-6 |
| `src/layout/DashboardLayout.jsx:46-54` | `esCandidatoDeCruce` valida enfocable, conectado y fuera de diálogo | D-6 |
| `src/layout/DashboardLayout.jsx:72-81` | `trasladarFocoDeCruce`: preferido → alterno → primer enfocable | D-6 |
| `src/layout/DashboardLayout.jsx:118-119`, `:136-139` | Estados de superficie y patrón de cierre previo de Cuenta | RF-02/RF-06 |
| `src/layout/DashboardLayout.jsx:196-231` | `Container` + `main` + `Outlet`; BottomNav; drawer; Cuenta | Montaje único |
| `src/layout/DashboardLayout.test.jsx:427-451` | Prueba cerrada del «primer control enfocable» | AC-11/AC-15 |
| `src/pages/PanelTarjetas.jsx:31`, `:43-46` | `tarjetaActiva` y montaje de `ModalTarjeta` | D-1 |
| `src/pages/PanelTarjetas.test.jsx:72-254` | **12** pruebas que montan el panel sin router | CL-14/AC-11 |
| `src/components/domain/modales/ModalTarjeta.jsx:71`, `:96`, `:102-111`, `:106`, `:119` | Foco, `AnimatePresence`, velo `z-50`, panel `glass-card` | D-1/D-4 |
| `src/components/domain/modales/AsistenteAyuda.jsx:85-227` | Props, ids, ARIA, scrim sin blur, `z-50`/`z-60`, Esc 60 | RF-01/RF-05 |
| `src/components/domain/modales/AsistenteAyuda.test.jsx:15-41` | Literales verbatim y suite cerrada | AC-01/AC-03 |
| `src/styles/index.css:15-28`, `:30`, `:34-36`, `:79-82`, `:88-94` | Once tokens, radio, `.safe-bottom` (padding, fallback `1rem`), superficies | RF-09/DP-19 |
| `src/components/layout/BottomNav.jsx:39`, `:69-81` | `z-50`, `safe-bottom`, `grid-cols-4`, «Menú» | Geometría |
| `src/pages/PaginaInicio.jsx:72-80`, `:75`, `:77` | Control de robot de la portada, literal accesible y hex heredados | RF-12 |
| `node_modules/react-router/dist/index.js:245-254` | `useOutletContext` sin proveedor devuelve `null` | CL-14 |
| `package.json:15-34` | Sin dependencias nuevas; `lucide-react` ya instalado | RF-10 |

---

## 1. Estrategia

Se integra **por capas y con las suites cerradas delante**, de modo que cada tarea deje la suite en
verde:

1. **Medir** la línea base y sondear las referencias (T1). Sin números no se declara nada.
2. **Preparar la exclusión del respaldo de foco** (T2) **antes** de añadir el disparador: así la
   prueba cerrada `DashboardLayout.test.jsx:427-451` nunca se rompe por el nodo nuevo (D-6).
3. **Integrar el asistente en el layout** (T3): estado único, montaje único, disparador flotante y
   apertura/cierre. La suite existente sigue verde; las pruebas nuevas llegan después.
4. **Añadir las pruebas** en un **archivo nuevo** por bloques: montaje/alcance/disparador (T4) y
   literales/ARIA/foco (T5). Ninguna suite cerrada se edita (AC-11).
5. **Cerrar el detalle de tarjeta** desde su dueño (T6) y probar las tres superficies y la defensa
   del cruce (T7).
6. **Auditar la fuente** (T8): 014 intacta, suites cerradas sin editar, tokens/hex, lógica y build.
7. **Medir a mano** lo que jsdom no puede (T9): *hit test*, geometría, contraste, M-8 y teclado
   virtual, con parámetros reproducibles.
8. **Cerrar** con la línea de `MEMORY.md` (T10) y el registro de lo manual/pendiente.

**Principio de compatibilidad:** no se añaden dependencias, tokens, rutas, datos ni archivos de
configuración. Se reutilizan `AsistenteAyuda`, el cromo 010/011, `lucide-react`, los tokens de
`src/styles/index.css` y el patrón de cierre previo ya usado para Cuenta.

---

## 2. Decisiones del plan

### PD-01 — Disparador **inline** en `DashboardLayout`, sin componente nuevo

- **Qué:** el `<button>` flotante se escribe al final del fragmento de `DashboardLayout`, después de
  `AsistenteAyuda`. No se crea `src/components/.../BotonAsistente*.jsx`.
- **Por qué:** la spec §4.5 lo fija expresamente («control flotante inline … sin archivo de
  componente nuevo»); el control comparte estado, `ref` y el único manejador de apertura con el
  layout, así que un componente aparte obligaría a pasar props/refs sin resolver nada. Además evita
  una cabecera JSDoc y un archivo extra que mantener.
- **Descartado:** (a) componente nuevo `BotonAsistenteDashboard` —indirección sin beneficio—;
  (b) quinto control del `BottomNav` —obligaría a cambiar `grid-cols-4` y la navegación cerrada de
  007/009 (DP-11)—; (c) entrada en el sidebar/drawer —dos pasos en móvil y toca navegación cerrada—;
  (d) portal del disparador —no aporta capa y complica el orden—.

### PD-02 — Geometría exacta del disparador

- **Clase de geometría:**
  `bottom-[calc(60px_+_env(safe-area-inset-bottom,0px)_+_16px)]` y **margen lateral `right-6`**.
- **Cifras:** `bottom` = **60 px** (altura del BottomNav) **+ `env(safe-area-inset-bottom, 0px)`**
  **+ 16 px** de separación; margen lateral derecho = **24 px** (`right-6`); área **44×44 px**
  (`w-11 h-11`). Total con inset 0: **76 px** de `bottom` y **24 px** de margen.
- **Justificación:** el `BottomNav` mide ≈60 px de contenido (icono 24 + `gap-1` 4 + etiqueta 16 +
  `py-2` 16) más 1 px de borde; con 16 px de separación el control queda **por encima** y no tapa el
  cuarto control «Menú». A 375×812: borde inferior del disparador en `812−76=736`, borde superior
  del nav en `812−≈61=751` ⇒ holgura ≈15 px. A 320×568: `492` frente a `507` ⇒ misma holgura. A
  1440×900 no invade la sidebar (`w-64`/`w-[72px]` a la izquierda) porque el control va a la derecha.
- **Reserva:** el `env()` **se suma** al desplazamiento; **no** se usa `.safe-bottom` (aplica
  `padding-bottom` con fallback `1rem`, no desplaza). Con inset 0 la reserva real sigue
  **pendiente** (D-5/DP-19): se registra, nunca se declara verde.
- **Descartado:** `style={{ bottom: ... }}` —jsdom puede no conservar `env()` y AC-12 comprueba el
  `className`; la clase es verificable en fuente y en build—; `.safe-bottom` —padding, no offset—;
  `bottom-6`/`bottom-20` fijos —no suman la reserva—; `bottom-24` (96 px) —holgura innecesaria y
  menos precisa—.

### PD-03 — Aspecto del disparador: solo tokens, sin hover ni blur

- **Clases exactas:**
  `fixed right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border-line/30 bg-emerald-primary text-bg-cream shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark bottom-[calc(60px_+_env(safe-area-inset-bottom,0px)_+_16px)]`
- **Tokens usados:** `bg-emerald-primary`, `text-bg-cream`, `border-border-line/30`,
  `ring-mint-accent/60`, `ring-offset-bg-dark` (familias de spec §3.4). Sin `#`, sin paleta nombrada,
  sin valores arbitrarios de color.
- **Sin** `hover:`, `active:scale`, `scale-`, `transform`, `transition` ni `duration-` (D-2).
  **Sin** `backdrop-blur`/`backdrop-filter`, `glass-surface` ni `glass-card` (DP-04).
- **Atributos:** `type="button"`, `aria-label="Abrir el asistente de ayuda"` (literal exacto),
  `data-respaldo-foco="excluir"`, `ref={asistenteTriggerRef}`, `onClick={alAbrirAsistente}`.
- **Icono:** `BotMessageSquare` de `lucide-react`, `size={20}`, `aria-hidden="true"`.

### PD-04 — Estado y punto único de apertura en el layout

- **Estado nuevo:** `ayudaAbierta` (`useState(false)`), junto a `mobileMenuAbierto` y
  `userModalAbierto`.
- **Refs:** `asistenteTriggerRef` (retorno de foco) y `cierreDetalleRef` (registro del cierre del
  detalle; `useRef(null)`).
- **Registro estable:** `const registrarCierreDetalle = useCallback((cerrar) => { cierreDetalleRef.current = cerrar; }, []);`
  La identidad estable evita que el efecto de `PanelTarjetas` se re-ejecute en cada render.
- **Único punto de apertura:**
  ```js
  const alAbrirAsistente = () => {
    cierreDetalleRef.current?.();
    setMobileMenuAbierto(false);
    setUserModalAbierto(false);
    setAyudaAbierta(true);
  };
  const alCerrarAsistente = () => setAyudaAbierta(false);
  ```
  React 18 agrupa las cuatro actualizaciones: detalle, drawer y Cuenta dejan de estar abiertos en el
  mismo commit en que se monta el asistente. No hay otra llamada de apertura.
- **Contexto:** `<Outlet context={{ registrarCierreDetalle }} />`. La identidad del objeto cambia por
  render, pero la función es estable; el consumidor no re-registra (dependencia del efecto estable).
- **Descartado:** guardar el callback en `useState` —render extra y riesgo de bucle—; contexto en
  archivo aparte —archivo innecesario—; evento DOM a medida —dueño implícito—; elevar
  `tarjetaActiva` al layout —rompe las 12 pruebas de `PanelTarjetas` y cambia la propiedad del
  estado (004/005)—.

### PD-05 — Montaje y orden de documento

- `AsistenteAyuda` se monta **una vez** en `DashboardLayout`, **después** de `BottomNav` y de
  `DashboardUserModal`, nunca dentro de `<main>`/`Container` ni en una página.
- El `<button>` del disparador va **al final del fragmento**, después del asistente. Cuando el
  asistente está abierto, su scrim (`z-50`) tapa el disparador (`z-40`) y el BottomNav
  (`z-50`, empate resuelto por orden de documento: el asistente se monta después).
- **Descartado:** portalizar el asistente desde el layout —no hace falta y añade nodo—; montarlo
  antes del BottomNav —el nav quedaría clicable—; montarlo por página —ids duplicados y dos
  trampas—.

### PD-06 — Cierre del detalle de tarjeta desde su dueño

- `PanelTarjetas` lee `useOutletContext()` (tolera `null`), obtiene `registrarCierreDetalle` y
  registra `() => setTarjetaActiva(null)` al montar; limpia con `registrarCierreDetalle(null)` al
  desmontar.
- No cambia su marcado, props, estado ni datos. `ModalTarjeta` recibe `tarjeta={null}` exactamente
  como con su `onCerrar` actual.
- **Descartado:** tocar `ModalTarjeta` (D-1/010); mover el estado (rompe pruebas); contador +
  efecto (deja un commit con dos trampas); contexto nuevo en archivo aparte.

### PD-07 — Exclusión del disparador del respaldo de foco (D-6)

Tres piezas, solo en `DashboardLayout`:

1. `const SELECTOR_EXCLUIDO_RESPALDO = '[data-respaldo-foco="excluir"]';` junto a los selectores del
   cruce.
2. `!nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)` en la conjunción de `esCandidatoDeCruce`.
3. `data-respaldo-foco="excluir"` en el `<button>` del disparador.

`useRetornoDeFoco`, `useCierreConEsc` y `trasladarFocoDeCruce` **no se tocan**: sus tres escalones se
conservan; solo cambia el conjunto de candidatos del respaldo local. Los controles de navegación y
contenido siguen siendo candidatos. **Descartado:** editar la prueba cerrada; tocar el hook;
excepción por `aria-label` (frágil y no declarativa).

### PD-08 — Pruebas: un archivo nuevo, ninguna suite cerrada editada

- **Archivo nuevo:** `src/layout/AsistenteDashboard.test.jsx`. Ahí viven AC-02, AC-03, AC-04,
  AC-05, AC-06, AC-07, AC-12, AC-13, AC-14, AC-15 (funcional) y CL-14.
- **No se edita** `DashboardLayout.test.jsx`, `PanelTarjetas.test.jsx`, `cierreDeModales.test.jsx`,
  `ModalTarjeta.test.jsx`, `DashboardDrawer.test.jsx`, `DashboardUserModal.test.jsx` ni
  `AsistenteAyuda.test.jsx` (AC-11/AC-01).
- **Mocks del archivo nuevo:** `useBreakpoint` con su contrato de cuatro props; `framer-motion` con
  `motion.div` trivial y `useReducedMotion: () => false` (mismo patrón que las suites cerradas);
  `SidebarResponsive` con un `aside` y un botón por defecto, y una implementación sin botones solo
  para el caso funcional de AC-15. `focus-trap-react` **no** se mockea: se usa la trampa real y el
  stub de geometría de `vitest.setup.js:73-91`.
- **Por qué:** las suites cerradas prueban el cromo y el cruce; la 017 solo añade un punto de uso y
  un filtro local. Un archivo nuevo permite probar el layout real con `MemoryRouter` sin reabrir
  contratos ajenos.

### PD-09 — `MEMORY.md` al cierre

Solo se añade **una línea** en «Referencias a specs»:
`- `specs/017-asistente-en-dashboard/` — asistente de ayuda en el dashboard (solo diseño). Aprobada (2026-10-20); implementada y validada.`
No se toca el texto de hexadecimales (`MEMORY.md:31-32`) ni la línea de archivos ajenos
(`MEMORY.md:37`). Lo hace el implementer en T10; el planner no edita `MEMORY.md` (D-3/DP-17).

---

## 3. Archivos

### 3.1 Se crean

| Archivo | Contenido |
|---|---|
| `src/layout/AsistenteDashboard.test.jsx` | **Nuevo** archivo de pruebas de la 017: 18 casos (T4: 8; T5: 6; T7: 4). Cabecera JSDoc de suite, mocks descritos en PD-08 y helpers `renderDashboard`, `abrirAsistente`, `cerrarCon...`, `obtenerScrim`. |
| `specs/017-asistente-en-dashboard/plan.md` | Este documento (planner). |
| `specs/017-asistente-en-dashboard/tasks.md` | Tareas T1…T10 (planner). |

### 3.2 Se modifican

| Archivo | Qué cambia exactamente |
|---|---|
| `src/layout/DashboardLayout.jsx` | (1) Imports `useCallback`, `AsistenteAyuda`, `BotMessageSquare`. (2) Constante `SELECTOR_EXCLUIDO_RESPALDO` y filtro `!nodo.closest(...)` en `esCandidatoDeCruce`. (3) Estados `ayudaAbierta`; refs `asistenteTriggerRef`, `cierreDetalleRef`; `registrarCierreDetalle` con `useCallback`; `alAbrirAsistente`/`alCerrarAsistente`. (4) `<Outlet context={{ registrarCierreDetalle }} />`. (5) `<AsistenteAyuda abierto={ayudaAbierta} estadoVisual="vacio" alCerrar={alCerrarAsistente} triggerRef={asistenteTriggerRef} />` después del BottomNav/Cuenta. (6) `<button>` inline del disparador al final, con la clase de PD-03 y `data-respaldo-foco="excluir"`. (7) Cabecera JSDoc: `@funciones`, `@eventos`, `@estados` y `@usadoPor` mencionan el asistente; no se reformatea el resto. |
| `src/pages/PanelTarjetas.jsx` | (1) Imports `useEffect` y `useOutletContext`. (2) Lectura tolerante a `null` y efecto de registro/limpieza de `() => setTarjetaActiva(null)` con dependencia `[registrarCierreDetalle]`. (3) Cabecera JSDoc: una línea en `@eventos`/`@usadoPor` sobre el cierre registrado. **No** cambia marcado, props, estado, datos ni clases. |
| `specs/017-asistente-en-dashboard/spec.md` | **Solo cabecera** (estado aprobada, enlaces a plan y tareas) y la nota de cierre de §16 que decía «en revisión». **No** se tocan RF, AC, CL ni DP. |
| `MEMORY.md` | **Solo** la línea de referencia de la 017, en T10 (implementer). |

### 3.3 No se tocan

`src/components/domain/modales/AsistenteAyuda.jsx` y `AsistenteAyuda.test.jsx`; `src/styles/index.css`
y `src/styles/index.css.test.js`; `src/hooks/**`; `src/components/layout/DashboardDrawer.jsx`,
`DashboardUserModal.jsx`, `SidebarResponsive.jsx`, `SidebarNavContenido.jsx`, `BottomNav.jsx`;
`src/components/domain/modales/ModalTarjeta.jsx`, `AuthModal.jsx`; `src/pages/PaginaInicio.jsx`;
`src/config/**`, `src/App.jsx`, `index.html`, `package.json`; las suites cerradas; `specs/016/` y
cualquier otra spec.

---

## 4. Diseño de la implementación

### 4.1 `DashboardLayout.jsx`

**Forma del layout (orden de documento):** sidebar (≥768) → contenedor con `<main><Outlet /></main>` →
BottomNav (<768) → drawer (<768) → `DashboardUserModal` → `AsistenteAyuda` → `<button>` del disparador.

**Contexto y cierre del detalle:**

```jsx
const cierreDetalleRef = useRef(null);
const registrarCierreDetalle = useCallback((cerrar) => {
  cierreDetalleRef.current = cerrar;
}, []);

// ...
<main className="pb-20">
  <Outlet context={{ registrarCierreDetalle }} />
</main>
```

**Por qué un `ref` y no estado:** el registro no necesita render; el layout solo invoca el callback
en el punto de apertura. El `?.()` cubre la ausencia de registro fuera de `/dashboard/tarjetas`.

**Montaje del asistente:**

```jsx
<AsistenteAyuda
  abierto={ayudaAbierta}
  estadoVisual="vacio"
  alCerrar={alCerrarAsistente}
  triggerRef={asistenteTriggerRef}
/>
```

`estadoVisual="vacio"` es explícito (RF-04), aunque sea el valor por defecto. No se añade control,
gesto ni temporizador para la variante `conversacion`.

**Disparador (clase exacta de PD-03):**

```jsx
<button
  ref={asistenteTriggerRef}
  type="button"
  aria-label="Abrir el asistente de ayuda"
  data-respaldo-foco="excluir"
  onClick={alAbrirAsistente}
  className="fixed right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border-line/30 bg-emerald-primary text-bg-cream shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark bottom-[calc(60px_+_env(safe-area-inset-bottom,0px)_+_16px)]"
>
  <BotMessageSquare size={20} aria-hidden="true" />
</button>
```

**Secuencia de apertura:** `cierreDetalleRef.current?.()` → `setMobileMenuAbierto(false)` →
`setUserModalAbierto(false)` → `setAyudaAbierta(true)`. El cierre del detalle es el mismo
`setTarjetaActiva(null)` que ya usa `onCerrar`; no se añade un segundo mecanismo de cierre a
`ModalTarjeta`.

**JSDoc:** se actualiza la cabecera existente (hoy con `/**doc`) para que `@funciones`, `@eventos`,
`@estados` y `@usadoPor` incluyan el asistente, el disparador y el registro del detalle. Si la
cabecera menciona `data-respaldo-foco="excluir"` en una línea de comentario, AC-15 la descarta por
la partición de comentarios.

### 4.2 `PanelTarjetas.jsx`

```jsx
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
// ...
const contexto = useOutletContext();
const registrarCierreDetalle = contexto?.registrarCierreDetalle;

useEffect(() => {
  if (!registrarCierreDetalle) return undefined;
  registrarCierreDetalle(() => setTarjetaActiva(null));
  return () => registrarCierreDetalle(null);
}, [registrarCierreDetalle]);
```

- Sin proveedor (`useOutletContext` devuelve `null`) el efecto no se registra: las 12 pruebas que
  montan `<PanelTarjetas />` fuera de un `Outlet` siguen verdes.
- Al desmontar se limpia el registro; la señal nunca llama al `setState` de un componente desmontado.
- No se renombran ids, props ni estados. `ModalTarjeta` sigue recibiendo `tarjeta={tarjetaActiva}` y
  `onCerrar={() => setTarjetaActiva(null)}`.

### 4.3 Archivo nuevo de pruebas

**Arnés:**

```jsx
const renderDashboard = (initialPath = "/dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dashboard/*" element={<DashboardLayout />}>
          <Route index element={<div>Inicio</div>} />
          <Route path="transacciones" element={<div>Transacciones</div>} />
          <Route path="tarjetas" element={<PanelTarjetas />} />
          <Route path="configuracion" element={<div>Configuración</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
```

- **Móvil por defecto** (`useBreakpoint` mockeado como `vi.fn()` con `isMobile: true`,
  `isDesktop: false`, `sidebarColapsada: false`, `toggleSidebar: vi.fn()`), para cubrir disparador,
  BottomNav y drawer. El mock es **mutable** (`useBreakpoint.mockReturnValue({ isMobile: false,
  isDesktop: true, ... })` + `rerender`) solo para AC-15; el resto de casos lo deja en móvil.
- **Mocks:** `framer-motion` (motion.div con `forwardRef`, `useReducedMotion: false`),
  `SidebarResponsive` (`vi.fn()` que devuelve `aside role="navigation"` con un botón; solo AC-15 usa
  `mockImplementationOnce` sin botón) y `useBreakpoint` como `vi.fn()`. No se mockea
  `focus-trap-react`.
- **Helpers:** `abrirAsistente()` (`user.click`), `abrirDrawer()` (click «Abrir menú»),
  `abrirCuentaDesdeDrawer()` (click avatar `Cuenta de …`), `obtenerGrid()` (la `role="list"` cuyo
  `className` incluye `hidden` y `sm:grid`, igual que `PanelTarjetas.test.jsx:54-61`), y
  `abrirDetalleDeTarjeta()` = `within(obtenerGrid()).getByRole("button", { name: "Ver detalle de la
  tarjeta de MARÍA GARCÍA" })` + `user.click`. **El scoping al grid es obligatorio**: el acordeón
  móvil (montado a la vez, solo oculto por CSS) repite el mismo nombre accesible para MARÍA GARCÍA y
  un `getByRole` global sería ambiguo. `obtenerDialogoAsistente()` y `obtenerScrim()`
  (`dialogo.parentElement`, mismo criterio que `AsistenteAyuda.test.jsx:124`).

**Casos (18):**

| # | Caso | AC | Qué comprueba |
|---|---|---|---|
| 1 | Un solo nodo y una sola trampa | AC-02 | Tras abrir: `#asistente-titulo` ×1, `role="dialog"` ×1, foco dentro. |
| 2 | Orden de capas y scrim | AC-07 | `nav.compareDocumentPosition(scrim)` FOLLOWING; scrim `z-50`; sin `backdrop-*`/`glass-*`. |
| 3 | Disparador: nombre, icono, área, capa, tokens | AC-12 | Nombre exacto, `type`, sin `aria-haspopup`/`aria-expanded`, `BotMessageSquare` 20, `w-11 h-11 z-40`, foco visible, sin hover/escala/transición/blur/hex/paleta nombrada. |
| 4 | Disparador: geometría | AC-12 | `className` contiene `right-6` y `bottom-[calc(60px_+_env(safe-area-inset-bottom,0px)_+_16px)]`; no `.safe-bottom`; `style` sin color/backdrop. |
| 5-8 | Cuatro rutas | AC-14 | Disparador presente; al abrir, un solo diálogo y un solo `#asistente-titulo`; sin errores de consola en transacciones/configuración (CL-14). |
| 9 | Literales verbatim | AC-03 | Título, marca, nota, texto vacío, cuatro sugerencias, aviso, label, placeholder, «Enviar», «Cerrar asistente de ayuda», log; ausencia de «Conversación de ejemplo». |
| 10 | Estado `vacio` | AC-04 | Texto vacío presente; sin control de cambio. |
| 11 | ARIA y foco inicial | AC-05 | `aria-modal`, `aria-labelledby`, `aria-describedby`, `role="log"` y sus atributos; foco inicial en el panel, no en la «X»; Esc cierra. |
| 12-14 | Retorno de foco | AC-13 | Cierre por «X», Esc y scrim; `waitFor(activeElement === disparador)`. |
| 15 | Drawer abierto | AC-06(a) | Abrir drawer, `fireEvent.click(disparador)`, `waitFor` un solo diálogo (asistente), drawer ausente, foco dentro. |
| 16 | Cuenta abierta | AC-06(b) | Abrir Cuenta desde el drawer, `fireEvent.click(disparador)`, `waitFor` un solo diálogo, Cuenta ausente, foco dentro. |
| 17 | Detalle abierto | AC-06(c) | Abrir detalle en `/dashboard/tarjetas`, `fireEvent.click(disparador)`, `waitFor` un solo diálogo, detalle ausente, foco dentro. `waitFor` obligatorio (DP-18). |
| 18 | Exclusión del respaldo | AC-15 | Cruce móvil → ≥768 (`useBreakpoint.mockReturnValue` + `rerender`) con `SidebarResponsive` sin botones y un botón de contenido en `body`: el foco cae en el contenido, no en el disparador. |

**Nota de fidelidad:** el mock de `framer-motion` desactiva la animación de salida en jsdom (mismo
criterio que las suites cerradas). El `waitFor` de AC-06 se mantiene igualmente; el límite de ~0,2 s
con el nodo saliente se documenta como aceptado (DP-18) y se revisa en navegador (T9).

### 4.4 Relación cambio ↔ requisito

| Cambio | RF | AC | CL/DP |
|---|---|---|---|
| Estado `ayudaAbierta` + montaje único | RF-02, RF-14 | AC-02, AC-14 | DP-03/DP-12 |
| `AsistenteAyuda` reutilizado | RF-01, RF-03, RF-04, RF-05 | AC-01, AC-03, AC-04, AC-05 | DP-01/DP-02 |
| Punto único de apertura (drawer/Cuenta/detalle) | RF-06 | AC-06 | CL-01, CL-02, CL-14; DP-05/DP-15 |
| Orden tras BottomNav y scrim | RF-07 | AC-07 | DP-08 |
| Sin superficies/blob nuevos | RF-08 | AC-08 | — |
| Disparador con tokens y sin hover/blur | RF-09, RF-12 | AC-09, AC-12 | DP-04/DP-16 |
| Sin lógica/red/dependencias | RF-10 | AC-10 | DP-01/DP-10 |
| Navegación y cromo intactos | RF-11 | AC-11 | — |
| `triggerRef` y exclusión del respaldo | RF-13 | AC-13, AC-15 | DP-20 |
| Registro del detalle en `PanelTarjetas` | RF-06, RF-11 | AC-06, AC-11 | DP-15 |
| `MEMORY.md` de cierre | — | — | DP-17 |

---

## 5. Orden de ejecución

| Etapa | Tarea | Resultado esperado | Suite |
|---|---|---|---|
| 0 | T1 | Línea base y sondeo | 518/518 (medido) |
| 1 | T2 | Filtro D-6 (sin disparador todavía) | 518/518 |
| 2 | T3 | Asistente + disparador + apertura/cierre | 518/518 |
| 3 | T4 | Pruebas de montaje/alcance/disparador | 526/526 en 34 archivos |
| 4 | T5 | Pruebas de literales/ARIA/foco | 532/532 en 34 archivos |
| 5 | T6 | Registro del cierre del detalle | 532/532 |
| 6 | T7 | Pruebas de una sola superficie y cruce | 536/536 en 34 archivos |
| 7 | T8 | Auditoría de fuente y regresión | 536/536 + build |
| 8 | T9 | Validación manual | Sin cambios de suite |
| 9 | T10 | `MEMORY.md` y cierre | 536/536 + build |

Las cifras son **proyección** sobre la línea base aportada. Si T1 mide otra base, el esperado es
**base + 18** casos y **34** archivos; se registra la diferencia, no se ajusta la spec.

---

## 6. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Añadir el disparador **antes** del filtro rompe `DashboardLayout.test.jsx:427-451` | Suite cerrada en rojo y AC-11 incumplido | T2 (filtro) **antes** de T3 (disparador); AC-15 funcional en T7; `npx vitest run src/layout/DashboardLayout.test.jsx` en T2/T3. |
| `cierreDeModales.test.jsx` monta el layout real y cuenta diálogos | Falla por un diálogo extra | El asistente cerrado devuelve `null`; T3 ejecuta esa suite; T7 prueba las tres superficies. |
| `PanelTarjetas` sin router y `useOutletContext` | `null` inesperado o excepción | Lectura con `?.` y guarda en el efecto; `PanelTarjetas.test.jsx` sigue sin editarse; CL-14. |
| Efecto de registro en bucle | Render infinito | `registrarCierreDetalle` con `useCallback([])`; dependencia estable; prueba de apertura en T7. |
| Callback de cierre huérfano | `setState` de componente desmontado | Limpieza `registrarCierreDetalle(null)` al desmontar; `?.()` en el layout; CL-14. |
| Trampa de foco real en jsdom | Falsos negativos | No se mockea `focus-trap-react`; se usa el stub de geometría de `vitest.setup.js:73-91` y `waitFor`. |
| Nodo saliente de `ModalTarjeta` (~0,2 s) | Aserto síncrono intermitente | `waitFor` obligatorio en AC-06(c); no se suprime la animación; DP-18. |
| `env()` dentro de una clase arbitraria no se emite en el CSS | Geometría sin reserva | T3/T8 verifican `grep -o 'safe-area-inset-bottom' dist/assets/*.css`; si no aparece, se usa el `style` de geometría que §4.4 permite y se repite AC-12. No se cambia el alcance. |
| El disparador tapa «Menú» o desborda a 320×568 | Navegación inutilizable | Geometría 60+16+44; holgura calculada ≈15 px; T9 mide `getBoundingClientRect` y `elementFromPoint`. |
| Reserva del área segura con inset 0 | Se declara resuelta sin estarlo | Se registra «aplicada + pendiente» (D-5/DP-19); T9 la marca **pendiente**, nunca verde. |
| Se copia el `className` con hex de la portada | Rompe RF-09 | Clase de PD-03 solo con tokens; T8 audita líneas `^+`. |
| Se edita una suite cerrada «para que pase» | Rompe AC-11/AC-01 | T8 comprueba `git diff HEAD --stat` vacío de todas las suites cerradas. |
| `MEMORY.md` con más de una línea | Rompe D-3 | T10 limita el diff a una inserción; no toca hex ni la línea de ajenos. |
| El test nuevo duplica ids o monta dos asistentes | Falso verde | `renderDashboard` monta el layout una vez por caso; `#asistente-titulo` ×1; `cleanup` entre casos. |
| Nombre accesible `Ver detalle de la tarjeta de MARÍA GARCÍA` repetido en acordeón y grid | `getByRole` ambiguo y caso 17 inestable | `abrirDetalleDeTarjeta()` busca **dentro** de la lista del grid (`hidden sm:grid`), como `PanelTarjetas.test.jsx:54-69`; nunca `getByRole` global. |
| Carrera de retorno de foco al cerrar drawer/Cuenta en el mismo commit que abre el asistente | Foco fuera del panel y caso 15/16 intermitente | La apertura cierra las otras superficies antes de `setAyudaAbierta(true)`; los casos 15-17 usan `waitFor` sobre «foco dentro del diálogo», no aserto síncrono. Si aun así falla, se reporta como bloqueante; no se editan suites cerradas. |

---

## 7. Protocolo de validación

### 7.1 Automática (Vitest + build)

| Cuándo | Comando | Esperado |
|---|---|---|
| T1 | `npm test` · `npm run build` | Base medida (hoy 518/518, 33 archivos; build verde) |
| T2/T3 | `npx vitest run src/layout/DashboardLayout.test.jsx src/components/layout/cierreDeModales.test.jsx` | Verde sin editar |
| T3/T6 | `npm run build` | Verde; CSS/JS se registran, **no** son criterio |
| T4 | `npx vitest run src/layout/AsistenteDashboard.test.jsx` | 8/8 (AC-02/07/12/14) |
| T5 | `npx vitest run src/layout/AsistenteDashboard.test.jsx` | 14/14 (añade AC-03/04/05/13) |
| T7 | `npx vitest run src/layout/AsistenteDashboard.test.jsx` | 18/18 (añade AC-06/15) |
| T8/T10 | `npm test` · `npm run build` | 536/536 en 34 archivos (proyección) y build verde |

### 7.2 De fuente

```bash
# 014 intacta
git diff HEAD --stat -- src/components/domain/modales/AsistenteAyuda.jsx \
  src/components/domain/modales/AsistenteAyuda.test.jsx          # vacío
npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx

# Suites cerradas sin editar
git diff HEAD --stat -- src/layout/DashboardLayout.test.jsx \
  src/pages/PanelTarjetas.test.jsx src/components/layout/cierreDeModales.test.jsx \
  src/components/ModalTarjeta.test.jsx src/components/layout/DashboardDrawer.test.jsx \
  src/components/layout/DashboardUserModal.test.jsx              # vacío

# Nada de lógica/red/config
git diff HEAD --stat -- package.json src/config src/App.jsx src/hooks \
  src/styles/index.css src/styles/index.css.test.js              # vacío

# Ninguna página monta el asistente
grep -n "AsistenteAyuda" src/pages/PaginaDashboard*.jsx          # sin coincidencias

# D-6 (AC-15)
grep -n 'data-respaldo-foco="excluir"' src/layout/DashboardLayout.jsx \
  | grep -v 'const SELECTOR_EXCLUIDO_RESPALDO' \
  | grep -Ev '^[0-9]+:[[:space:]]*(\*|//|/\*)'                   # exactamente 1
grep -n 'SELECTOR_EXCLUIDO_RESPALDO' src/layout/DashboardLayout.jsx   # >= 2
grep -n 'nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)' src/layout/DashboardLayout.jsx # 1
```

**Tokens y hexadecimales (AC-09):** sobre `git diff HEAD --unified=0 -- src ':!src/**/*.test.js'
':!src/**/*.test.jsx'`, las líneas `^+` (sin `^+++`) deben pasar las cuatro comprobaciones de spec
§3.4: sin `#`/`rgb(`/`hsl(`/`oklch(`; sin valores arbitrarios de color; sin paleta nombrada en
familias de color; sin `style` con color/fondo/borde ni `fill`/`stroke` literales. El
`style` del disparador (si se usara como contingencia) solo puede declarar `bottom`.

**Ámbito:** no se usa `git add -N`; los archivos nuevos son solo de pruebas y no entran en el diff de
producción. El índice no se modifica.

### 7.3 Manual (navegador) — parámetros reproducibles

**Entorno:** `npm run dev`; Chromium (versión registrada) y, si está disponible, Firefox; sistema y
zoom registrados. **Viewports:** `1440×900`, `375×812`, `320×568`; apaisado `812×375`; zoom 100 % y
200 %. **Preferencias:** `prefers-reduced-motion: reduce` y `prefers-reduced-transparency: reduce`
en dos pasadas. **Rutas:** `/dashboard`, `/dashboard/transacciones`, `/dashboard/tarjetas`,
`/dashboard/configuracion`.

| Qué | Procedimiento | Veredicto |
|---|---|---|
| Geometría | En cada viewport: `getBoundingClientRect()` del disparador y del BottomNav; `getComputedStyle(trigger).bottom/right`; comprobar `trigger.bottom <= nav.top - 8`, `right = 24`, `bottom = 76px` con inset 0 y 44×44. | pass/fail/pendiente |
| *Hit test* de capas | Con drawer, Cuenta y detalle abiertos: `document.elementFromPoint(centro del disparador)` no es el disparador. Con el asistente abierto: el centro de «Menú» y del sidebar devuelve el scrim, no el control. | pass/fail |
| M-8 por vista | Base y asistente abierto: contar `.glass-surface`/`.glass-hero` visibles (no `glass-card`, no velos) y blobs. Esperado 1/0 → 2/0 a 1440×900 y 375×812; drawer/Cuenta 2/0; detalle 1/0. | pass/fail |
| Contraste | Cuentagotas del navegador sobre el píxel compuesto: texto del disparador sobre `bg-emerald-primary`; texto del panel sobre `bg-bg-cream/95` + scrim `bg-bg-dark/70`; anillo de foco sobre `bg-dark`. AA 4,5:1 texto y 3:1 UI. | pass/fail |
| Teclado | Tab hasta el disparador, Enter, foco en el panel, Tab cíclico, Esc, foco de vuelta al disparador. Repetir con «X» y clic en el scrim. | pass/fail |
| Teclado virtual | A 375×812, enfocar `#asistente-entrada`; comprobar que el pie y el campo son visibles. Limitación heredada de la 014: sin `visualViewport`. | pass/limitación |
| Gesto | Deslizar hacia abajo en el panel a 375×812; cierra una vez. | pass/fail |
| Área segura | Registrar `getComputedStyle(trigger).bottom`; con inset 0 mide 76 px. **La reserva real queda pendiente**: no se declara verde. | **pendiente** |

**Registro:** cada celda se anota `pass`, `fail` o `no realizado/pendiente` con el parámetro usado. Si
no hay navegador, **todo** lo manual se declara **no realizado** con el motivo; no se convierte en
verde. El nodo saliente del detalle (~0,2 s) se acepta como límite (DP-18) y no se intenta eliminar.

---

## 8. Fuera de alcance y no cambios

- Motor, guion, texto libre, máquina de estados, persistencia, IA, backend, red y dependencias: no.
- Migración global de hexadecimales: no; solo se audita el código nuevo (RF-09).
- `viewport-fit=cover`: no; la reserva del área segura queda pendiente (D-5/DP-19).
- Cambios en `AsistenteAyuda`, su suite, `index.css`, hooks, cromo de 010, navegación de 007/008/009,
  `App.jsx`, `config`, `index.html`, `package.json`: no.
- Nuevas rutas, páginas, datos o formatos: no.
- `soporte@finapp.com`: no se añade al asistente; el reverso de `MiTarjetaVirtual` no se toca.
- Otras specs, incluida `specs/016/`: no se abren ni se modifican.

---

## 9. Preguntas abiertas

**Ninguna.** El desplazamiento exacto queda fijado en PD-02 y no hay contradicciones entre la spec y
el código para el alcance aprobado. Las únicas limitaciones son las ya declaradas por la spec:
reserva real del área segura **pendiente** (D-5/DP-19) y coexistencia de ~0,2 s del nodo saliente del
detalle (**aceptada**, D-4/DP-18).
