# Tareas 017 — Asistente de ayuda en el dashboard (solo diseño)

**Spec:** [`spec.md`](spec.md) — **aprobada por el usuario el 2026-10-20**.
**Plan:** [`plan.md`](plan.md) · **Orden:** T1 → T10.
**Regla de orden:** cada tarea deja la suite **en verde**. Por eso el filtro de foco (T2) va **antes**
del disparador (T3), y las pruebas nuevas se añaden **después** de la implementación que prueban.
**Reglas de ejecución:** leer `AGENTS.md`, `doc/constitution.md`, `.agents/rules/rules.md` y
`MEMORY.md` antes de empezar; **re-verificar cada `archivo:línea` antes de editar** (el usuario edita
a mano; CL-09); no tocar `src/` fuera de lo que dice la tarea; **sin dependencias nuevas, sin tokens
nuevos, sin hexadecimales nuevos**; sin staging ni commit salvo indicación del usuario.
**Línea base aportada:** `HEAD` `dadc119`; `npm test` **518/518 en 33 archivos**; `npm run build`
verde, CSS **61,13 kB** · JS **389,45 kB**. **El CSS no es criterio de aceptación**; se re-mide en T1.
**Proyección de la 017:** **+18** casos en **1** archivo nuevo ⇒ **536/536 en 34 archivos**. Si T1
mide otra base, el esperado es **base + 18**.

---

## T1 — Línea base y sondeo de referencias

**Etapa 0 · Depende de:** nada.
**Alcance:** medir y sondear antes de tocar código. **Sin cambios de archivos.**
**Archivos:** ninguno.
**Cubre:** soporte de §9.1 (línea base) y DP-19; sin RF propio.

**Comandos**

```bash
git rev-parse --short HEAD
git status --short
npm test                 # esperado hoy: 518/518 en 33 archivos
npm run build            # esperado: verde; registrar CSS y JS (no criterio)
```

**Sondeo (registrar veredicto por punto; lo que ya no exista se marca «ya no aplicable» y NO se corrige):**

| # | Referencia | Qué se comprueba |
|---|---|---|
| 1 | `src/layout/DashboardLayout.jsx:16-24` | `SELECTOR_ENFOCABLE` incluye `button`; selectores del cruce |
| 2 | `src/layout/DashboardLayout.jsx:46-54` | `esCandidatoDeCruce` con `isConnected`, `disabled` y `closest(SELECTOR_DIALOGO)` |
| 3 | `src/layout/DashboardLayout.jsx:72-81` | Los tres escalones de `trasladarFocoDeCruce` |
| 4 | `src/layout/DashboardLayout.jsx:118-119`, `:136-139` | Estados de superficie y patrón de cierre previo de Cuenta |
| 5 | `src/layout/DashboardLayout.jsx:196-231` | `Container`/`main`/`Outlet`, BottomNav, drawer y Cuenta |
| 6 | `src/layout/DashboardLayout.test.jsx:427-451` | Prueba cerrada del «primer control enfocable» |
| 7 | `src/pages/PanelTarjetas.jsx:31`, `:43-46` | `tarjetaActiva` y montaje de `ModalTarjeta` |
| 8 | `src/pages/PanelTarjetas.test.jsx:72-254` | **12** pruebas sin router/Outlet |
| 9 | `src/components/domain/modales/ModalTarjeta.jsx:71`, `:96`, `:102-111`, `:106`, `:119` | Foco, `AnimatePresence`, velo y panel |
| 10 | `src/components/domain/modales/AsistenteAyuda.jsx:85-227`; `:90`, `:105`, `:116` | Props, ids, ARIA, scrim sin blur, capas |
| 11 | `src/components/domain/modales/AsistenteAyuda.test.jsx:15-41` | Literales verbatim y suite cerrada |
| 12 | `src/styles/index.css:15-28`, `:30`, `:34-36`, `:79-82`, `:88-94` | Tokens, radio, `.safe-bottom` (padding) y superficies |
| 13 | `src/components/layout/BottomNav.jsx:39`, `:69-81`; `DashboardDrawer.jsx:79`, `:108`, `:138`; `DashboardUserModal.jsx:78`, `:109`, `:161` | Altura/clases del nav, capas y retornos `null` |
| 14 | `src/pages/PaginaInicio.jsx:72-80`, `:75`, `:77` | Control de robot, literal accesible y hex heredados |
| 15 | `node_modules/react-router/dist/index.js:245-254` | `useOutletContext` sin proveedor devuelve `null` |
| 16 | `package.json:15-34`; `src/App.jsx:29-49` | Dependencias y rutas del dashboard |
| 17 | `MEMORY.md:31-32`, `:37` | Texto de hex y línea de ajenos que **no** se tocan |

**Hecho cuando:** la línea base (commit, casos, archivos, build y tamaños) está registrada; los 17
puntos tienen veredicto; las desviaciones se reportan **sin corregirlas**; `git status --short` no
muestra archivos nuevos del cambio.

---

## T2 — Layout: exclusión del disparador del respaldo de foco (D-6)

**Etapa 1 · Depende de:** T1.
**Alcance:** preparar el filtro **antes** de que exista el disparador, para no romper la prueba
cerrada. Sin UI nueva.
**Archivos:** `src/layout/DashboardLayout.jsx`.
**Cubre:** RF-13; AC-15 (fuente parcial), AC-11; D-6/DP-20.

**Cambios exactos**

1. Junto a los selectores del cruce (`:16-24`):
   ```js
   /** Marca estable de los controles que NO son candidatos del respaldo del cruce (D-6). */
   const SELECTOR_EXCLUIDO_RESPALDO = '[data-respaldo-foco="excluir"]';
   ```
2. En `esCandidatoDeCruce` (`:46-54`), añadir a la conjunción:
   ```js
   !nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)
   ```
3. **No** tocar `useRetornoDeFoco`, `useCierreConEsc` ni `trasladarFocoDeCruce`. **No** añadir todavía
   el atributo al marcado (llega en T3).
4. Actualizar la JSDoc de `esCandidatoDeCruce`/cabecera para mencionar la exclusión, sin reformatear.

**Prueba que queda en verde:** `DashboardLayout.test.jsx` completo, sin editar.
**Comandos**

```bash
npx vitest run src/layout/DashboardLayout.test.jsx
npm test
grep -n 'SELECTOR_EXCLUIDO_RESPALDO' src/layout/DashboardLayout.jsx          # >= 2
grep -n 'nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)' src/layout/DashboardLayout.jsx  # 1
```

**Hecho cuando:** la constante y el filtro existen; la prueba cerrada `:427-451` sigue verde; el
resto de la suite sigue en 518/518; no hay atributo `data-respaldo-foco` todavía.

---

## T3 — Layout: estado, montaje único, disparador y apertura/cierre

**Etapa 2 · Depende de:** T2.
**Alcance:** integrar el asistente y el control flotante. Sin cerrar todavía el detalle (T6).
**Archivos:** `src/layout/DashboardLayout.jsx`.
**Cubre:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-07, RF-08, RF-09, RF-10, RF-11, RF-12, RF-14;
AC-02, AC-03, AC-04, AC-05, AC-07, AC-08, AC-09, AC-10, AC-12, AC-13, AC-14; CL-03, CL-06, CL-08,
CL-11, CL-13; DP-01/DP-02/DP-03/DP-04/DP-08/DP-11/DP-12/DP-13/DP-16.

**Cambios exactos**

1. Imports: `useCallback` **no** todavía (llega en T6); sí `AsistenteAyuda` desde
   `../components/domain/modales/AsistenteAyuda` y `BotMessageSquare` desde `lucide-react`.
2. Estados/refs:
   ```js
   const [ayudaAbierta, setAyudaAbierta] = useState(false);
   const asistenteTriggerRef = useRef(null);
   const cierreDetalleRef = useRef(null); // se cablea en T6
   ```
3. Único punto de apertura y cierre:
   ```js
   const alAbrirAsistente = () => {
     cierreDetalleRef.current?.();
     setMobileMenuAbierto(false);
     setUserModalAbierto(false);
     setAyudaAbierta(true);
   };
   const alCerrarAsistente = () => setAyudaAbierta(false);
   ```
4. Montaje **después** de `BottomNav` y de `DashboardUserModal`:
   ```jsx
   <AsistenteAyuda
     abierto={ayudaAbierta}
     estadoVisual="vacio"
     alCerrar={alCerrarAsistente}
     triggerRef={asistenteTriggerRef}
   />
   ```
5. Disparador **inline al final del fragmento**, con esta clase exacta:
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
   **No** añadir `hover:`, `scale-`, `transform`, `transition`, `duration-`, `backdrop-*`,
   `glass-surface`, `glass-card`, `aria-haspopup` ni `aria-expanded`.
6. No añadir `Outlet context` todavía (T6). No tocar el `<Outlet />` existente.
7. Actualizar la cabecera JSDoc del layout: `@funciones`, `@eventos`, `@estados` y `@usadoPor`
   mencionan el asistente, el disparador y el único punto de apertura.

**Prueba que queda en verde:** suites existentes del layout y de los modales, sin editar. No hay
pruebas nuevas todavía; la verificación funcional llega en T4/T5.
**Comandos**

```bash
npx vitest run src/layout/DashboardLayout.test.jsx \
  src/components/layout/cierreDeModales.test.jsx
npm test
npm run build
grep -n 'data-respaldo-foco="excluir"' src/layout/DashboardLayout.jsx \
  | grep -v 'const SELECTOR_EXCLUIDO_RESPALDO' \
  | grep -Ev '^[0-9]+:[[:space:]]*(\*|//|/\*)'                # exactamente 1
grep -o 'safe-area-inset-bottom' dist/assets/*.css | head     # la clase se emite
```

**Hecho cuando:** el disparador y el asistente están montados una sola vez; la apertura cierra
drawer y Cuenta; Esc/«X»/scrim cierran; el foco vuelve al disparador en una prueba manual rápida; las
suites existentes siguen verdes; el build emite la geometría con `env()`.

---

## T4 — Pruebas: arnés, montaje, alcance, capas y disparador

**Etapa 3 · Depende de:** T3.
**Alcance:** crear el archivo nuevo con el arnés y **8** casos de montaje/alcance/disparador.
**Archivos:** **crear** `src/layout/AsistenteDashboard.test.jsx`.
**Cubre:** RF-02, RF-07, RF-09, RF-12, RF-14; AC-02, AC-07, AC-12, AC-14; CL-03, CL-07, CL-13;
DP-03/DP-08/DP-12/DP-16.

**Arnés y mocks (fijos para todo el archivo)**

- `MemoryRouter` + `Routes` con `/dashboard/*` → `DashboardLayout`; hijas `index`, `transacciones`,
  `tarjetas` (`<PanelTarjetas />`) y `configuracion`.
- `vi.mock("../hooks/useBreakpoint")` con `useBreakpoint: vi.fn()`; por defecto devuelve
  `{ isMobile: true, isDesktop: false, sidebarColapsada: false, toggleSidebar: vi.fn() }`. El mock es
  mutable (`mockReturnValue` + `rerender`) **solo** para AC-15 en T7.
- `vi.mock("framer-motion")`: `motion.div` con `forwardRef`, `useReducedMotion: () => false`
  (mismo patrón que las suites cerradas).
- `vi.mock("../components/layout/SidebarResponsive")`: `aside role="navigation"` con un botón por
  defecto; `mockImplementationOnce` sin botón solo para AC-15 (T7).
- No se mockea `focus-trap-react`; `cleanup` en `afterEach`.

**Casos (8)**

| # | Caso | AC | Asertos |
|---|---|---|---|
| 1 | Un solo nodo, ids únicos y una trampa | AC-02 | Abrir; `document.querySelectorAll("#asistente-titulo").length === 1`; `getAllByRole("dialog").length === 1`; `dialogo.contains(document.activeElement)`. |
| 2 | Scrim después del BottomNav y sin blur/superficie | AC-07 | `nav.compareDocumentPosition(scrim) & Node.DOCUMENT_POSITION_FOLLOWING`; scrim `z-50`; `className` sin `backdrop-(blur|filter)`, `[backdrop`, `glass-surface`. |
| 3 | Disparador: nombre, icono, área, capa y tokens | AC-12 | `getByRole("button", { name: "Abrir el asistente de ayuda", exact: true })`; `type="button"`; sin `aria-haspopup`/`aria-expanded`; `svg` `aria-hidden`, `width/height=20`, `lucide-bot-message-square`; `w-11 h-11 z-40`; `focus-visible:ring-2` + `focus-visible:ring-mint-accent/60`; sin `hover:`, `scale-`, `transform`, `transition`, `duration-`, `#`, `backdrop-*`, `glass-*`; sin paleta nombrada. |
| 4 | Disparador: geometría | AC-12 | `className` contiene `right-6` y `bottom-[calc(60px_+_env(safe-area-inset-bottom,0px)_+_16px)]`; no contiene `safe-bottom`; `style` vacío o solo `bottom` (sin color/backdrop). |
| 5-8 | Cuatro rutas | AC-14 / CL-07 | Para `/dashboard`, `/dashboard/transacciones`, `/dashboard/tarjetas`, `/dashboard/configuracion`: disparador presente; `await user.click`; un solo diálogo `Asistente de ayuda`; `#asistente-titulo` ×1; en transacciones/configuración, sin `console.error` (CL-14). |

**Prueba que queda en verde:** 8/8 del archivo nuevo; suite total **526/526 en 34 archivos**
(proyección).
**Comandos**

```bash
npx vitest run src/layout/AsistenteDashboard.test.jsx   # 8/8
npm test                                                # 526/526 en 34 archivos
grep -n "AsistenteAyuda" src/pages/PaginaDashboard*.jsx # sin coincidencias
```

**Hecho cuando:** el archivo nuevo existe con cabecera JSDoc; los 8 casos pasan; la suite completa
queda en 526/526; ninguna suite cerrada se ha editado.

---

## T5 — Pruebas: literales, estado vacío, ARIA y retorno de foco

**Etapa 4 · Depende de:** T4.
**Alcance:** añadir **6** casos al archivo nuevo.
**Archivos:** `src/layout/AsistenteDashboard.test.jsx` (solo añadir casos).
**Cubre:** RF-01, RF-03, RF-04, RF-05, RF-13; AC-01, AC-03, AC-04, AC-05, AC-13; CL-04, CL-10,
CL-12; DP-01/DP-02/DP-09.

**Casos (6)**

| # | Caso | AC | Asertos |
|---|---|---|---|
| 9 | Literales verbatim | AC-03 | Dentro del diálogo: `Asistente de ayuda`, `Demostración · No es una IA real`, `Vista de diseño: contenido de ejemplo; aún no responde preguntas.`, `Aún no hay mensajes. …`, las cuatro sugerencias, `Cuando la ayuda esté activa, si tu pregunta no coincide verás una respuesta de reserva.`, label `Tu pregunta`, placeholder `Escribe una pregunta…`, `Enviar`, `Cerrar asistente de ayuda`, `Mensajes del asistente`; `queryByText("Conversación de ejemplo")` ausente. |
| 10 | Estado `vacio` | AC-04 | `getByText(TEXTO_VACIO)`; sin `Conversación de ejemplo`; sin control de cambio de variante. |
| 11 | ARIA, «X» y foco inicial | AC-05 | `aria-modal="true"`, `aria-labelledby="asistente-titulo"`, `aria-describedby="asistente-marca asistente-nota asistente-reserva"`; `role="log"` con `aria-live="polite"`, `aria-relevant="additions"`, `aria-atomic="false"`, `aria-label="Mensajes del asistente"`; input `#asistente-entrada`; «Enviar» `aria-disabled="true"`; foco inicial en el panel y **no** en la «X»; `fireEvent.keyDown(document, { key: "Escape" })` cierra y deja de haber diálogo. |
| 12 | Retorno por «X» | AC-13 | Abrir, click «Cerrar asistente de ayuda», `await waitFor(() => expect(document.activeElement).toBe(disparador))`. |
| 13 | Retorno por Esc | AC-13 | Abrir, `fireEvent.keyDown(document, { key: "Escape" })`, `waitFor` foco en el disparador. |
| 14 | Retorno por scrim | AC-13 | Abrir, `fireEvent.click(scrim)`, `waitFor` foco en el disparador. |

**Prueba que queda en verde:** 14/14 del archivo nuevo; suite total **532/532 en 34 archivos**.
**Comandos**

```bash
npx vitest run src/layout/AsistenteDashboard.test.jsx   # 14/14
npm test                                                # 532/532 en 34 archivos
npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx  # 014 verde sin editar
```

**Hecho cuando:** los 14 casos pasan; los literales coinciden carácter a carácter con la 014; el
retorno de foco usa `waitFor` (sin asertos síncronos); la suite de la 014 sigue verde sin editarse.

---

## T6 — Cierre del detalle de tarjeta desde su dueño (D-1)

**Etapa 5 · Depende de:** T5.
**Alcance:** cablear la señal de cierre por `Outlet context`; sin tocar `ModalTarjeta`.
**Archivos:** `src/layout/DashboardLayout.jsx` (registro y contexto) y `src/pages/PanelTarjetas.jsx`.
**Cubre:** RF-06, RF-11; AC-06 (comportamiento), AC-11; CL-02, CL-14; D-1/DP-15.

**Cambios exactos**

1. En `DashboardLayout`:
   ```js
   const registrarCierreDetalle = useCallback((cerrar) => {
     cierreDetalleRef.current = cerrar;
   }, []);
   ```
   y `<Outlet context={{ registrarCierreDetalle }} />` (sustituye al `<Outlet />`).
   `alAbrirAsistente` ya llama a `cierreDetalleRef.current?.()` desde T3.
2. En `PanelTarjetas`:
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
   **No** cambiar marcado, props, estado, datos ni clases. `ModalTarjeta` sigue igual.
3. Cabecera JSDoc de `PanelTarjetas`: una línea en `@eventos`/`@usadoPor` sobre el cierre registrado;
   cabecera del layout: mencionar el contexto.
4. **No** tocar `ModalTarjeta.jsx`, su trampa, su `useCierreConEsc`, su `useRetornoDeFoco` ni su
   `AnimatePresence`.

**Prueba que queda en verde:** `PanelTarjetas.test.jsx` (12/12) sin editar; suite total 532/532.
**Comandos**

```bash
npx vitest run src/pages/PanelTarjetas.test.jsx         # 12/12
npx vitest run src/components/ModalTarjeta.test.jsx      # verde sin editar
npm test                                                 # 532/532
git diff HEAD --stat -- src/components/domain/modales/ModalTarjeta.jsx  # vacío
```

**Hecho cuando:** el registro se crea y se limpia; fuera de `/dashboard/tarjetas` la señal es
`no-op`; `PanelTarjetas` sigue funcionando sin `Outlet`; `ModalTarjeta` no tiene diff.

---

## T7 — Pruebas: una sola superficie y defensa del cruce

**Etapa 6 · Depende de:** T6.
**Alcance:** añadir **4** casos al archivo nuevo: drawer, Cuenta, detalle y exclusión del respaldo.
**Archivos:** `src/layout/AsistenteDashboard.test.jsx` (solo añadir casos/helpers).
**Cubre:** RF-06, RF-13; AC-06, AC-15; CL-01, CL-02, CL-14; D-4/DP-18, D-6/DP-20.

**Casos (4)**

| # | Caso | AC | Asertos |
|---|---|---|---|
| 15 | Drawer abierto | AC-06(a) | `user.click("Abrir menú")`; `fireEvent.click(disparador)`; `await waitFor`: `getAllByRole("dialog").length === 1`, diálogo = asistente, `queryByRole("dialog", { name: "Menú de navegación" })` ausente, `dialogo.contains(document.activeElement)`. |
| 16 | Cuenta abierta | AC-06(b) | Drawer → avatar `Cuenta de …`; `fireEvent.click(disparador)`; `waitFor`: un solo diálogo, `queryByRole("dialog", { name: "Cuenta" })` ausente, foco dentro. |
| 17 | Detalle abierto | AC-06(c) | `/dashboard/tarjetas`; `abrirDetalleDeTarjeta()` = `within(lista del grid)`, es decir la `role="list"` con `hidden` + `sm:grid`, `getByRole("button", { name: "Ver detalle de la tarjeta de MARÍA GARCÍA" })`; **nunca** `getByRole` global (el acordeón repite el nombre); `fireEvent.click(disparador)`; `waitFor`: un solo diálogo, `queryByRole("dialog", { name: /^Tarjeta de / })` ausente, foco dentro. **`waitFor` obligatorio**; no se rebaja a síncrono. |
| 18 | Exclusión del respaldo | AC-15 | `SidebarResponsive.mockImplementationOnce(() => <aside role="navigation" />)`; arrancar móvil, enfocar «Abrir menú», crear un `button` de contenido en `body`, `useBreakpoint.mockReturnValue({ isMobile: false, isDesktop: true, sidebarColapsada: false, toggleSidebar: vi.fn() })` y `rerender`; `expect(document.activeElement).toBe(contenido)` y **no** el disparador. |

**Nota:** la activación con el velo encima se hace con `fireEvent.click` (simulada). El *hit test* real
es manual (T9). El nodo saliente del detalle (~0,2 s) se absorbe con `waitFor`; no se suprime la
animación ni se toca `ModalTarjeta` (DP-18).

**Prueba que queda en verde:** 18/18 del archivo nuevo; suite total **536/536 en 34 archivos**.
**Comandos**

```bash
npx vitest run src/layout/AsistenteDashboard.test.jsx   # 18/18
npm test                                                # 536/536 en 34 archivos
npx vitest run src/layout/DashboardLayout.test.jsx      # cerrada, verde sin editar
```

**Hecho cuando:** los tres casos de una sola superficie pasan con `waitFor`; el caso del cruce deja
el foco en el contenido; la suite cerrada `:427-451` sigue verde sin editarse.

---

## T8 — Auditoría de fuente, tokens y regresión

**Etapa 7 · Depende de:** T7.
**Alcance:** verificar por fuente lo que no se prueba en jsdom. **Sin cambios de código.**
**Archivos:** ninguno.
**Cubre:** RF-01, RF-05, RF-09, RF-10, RF-11, RF-13; AC-01, AC-09, AC-10, AC-11, AC-15; DP-02/DP-10.

**Comandos y criterios**

```bash
# 014 intacta y verde sin editar
git diff HEAD --stat -- src/components/domain/modales/AsistenteAyuda.jsx \
  src/components/domain/modales/AsistenteAyuda.test.jsx             # vacío
npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx

# Suites cerradas sin editar
git diff HEAD --stat -- src/layout/DashboardLayout.test.jsx \
  src/pages/PanelTarjetas.test.jsx src/components/layout/cierreDeModales.test.jsx \
  src/components/ModalTarjeta.test.jsx src/components/layout/DashboardDrawer.test.jsx \
  src/components/layout/DashboardUserModal.test.jsx                 # vacío

# Sin lógica/red/config/dependencias
git diff HEAD --stat -- package.json src/config src/App.jsx src/hooks \
  src/styles/index.css src/styles/index.css.test.js                 # vacío
grep -n "AsistenteAyuda" src/pages/PaginaDashboard*.jsx             # sin coincidencias

# D-6 (AC-15)
grep -n 'data-respaldo-foco="excluir"' src/layout/DashboardLayout.jsx \
  | grep -v 'const SELECTOR_EXCLUIDO_RESPALDO' \
  | grep -Ev '^[0-9]+:[[:space:]]*(\*|//|/\*)'                      # exactamente 1
grep -n 'SELECTOR_EXCLUIDO_RESPALDO' src/layout/DashboardLayout.jsx # >= 2
grep -n 'nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)' src/layout/DashboardLayout.jsx # 1

# Tokens/hex en líneas añadidas de producción
git diff HEAD --unified=0 -- src ':!src/**/*.test.js' ':!src/**/*.test.jsx' \
  | grep '^+' | grep -v '^+++'
```

Las líneas `^+` deben pasar las cuatro comprobaciones de spec §3.4 (sin `#`/`rgb(`/`hsl(`/`oklch(`;
sin valores arbitrarios de color; sin paleta nombrada en familias de color; sin `style` con
color/fondo/borde ni `fill`/`stroke` literales). El `style` del disparador, si se usara como
contingencia, solo puede declarar `bottom`.

**Build y CSS**

```bash
npm test             # 536/536 en 34 archivos
npm run build        # verde; registrar CSS/JS (no criterio)
grep -o 'safe-area-inset-bottom' dist/assets/*.css | head   # la geometría se emite
```

**Hecho cuando:** los `diff --stat` indicados están vacíos; los greps de D-6 dan 1/≥2/1; no hay
literales de color fuera de tokens en producción; `npm test` y `npm run build` pasan; la geometría
`env()` aparece en el CSS compilado.

---

## T9 — Validación manual (navegador) y registro de pendientes

**Etapa 8 · Depende de:** T8.
**Alcance:** ejecutar y registrar lo que jsdom no mide. **Sin cambios de código.**
**Archivos:** ninguno.
**Cubre:** RF-06, RF-08, RF-12, RF-13; AC-06 (hit test), AC-08, AC-12 (geometría), AC-13 (gesto);
CL-03, CL-06, CL-11, CL-12; DP-18/DP-19.

**Parámetros**

- `npm run dev`; **Chromium** (versión registrada) y Firefox si está disponible; sistema y zoom.
- Viewports: **1440×900**, **375×812**, **320×568**; apaisado **812×375**; zoom **100 %** y **200 %**.
- Preferencias: `prefers-reduced-motion: reduce` y `prefers-reduced-transparency: reduce`.
- Rutas: `/dashboard`, `/dashboard/transacciones`, `/dashboard/tarjetas`, `/dashboard/configuracion`.

**Bloque manual (marcar cada celda pass / fail / pendiente / no realizado)**

| # | Qué | Procedimiento | Esperado |
|---|---|---|---|
| 1 | Geometría 375×812 | `getBoundingClientRect()` del disparador y del nav; `getComputedStyle(trigger).bottom/right`. | `bottom=76px` (inset 0), `right=24px`, 44×44; `trigger.bottom <= nav.top - 8`. |
| 2 | Geometría 320×568 | Igual. | Sin solape con «Menú» ni desborde. |
| 3 | Geometría 1440×900 | Igual; comprobar que no invade la sidebar. | `right=24px`; sidebar intacta. |
| 4 | Zoom 200 % | 1440×900 al 200 % (viewport CSS 720×450). | Disparador y panel alcanzables. |
| 5 | *Hit test* con drawer | `document.elementFromPoint(centro del disparador)`. | Devuelve el velo/backdrop, **no** el disparador. |
| 6 | *Hit test* con Cuenta | Igual. | Velo, no disparador. |
| 7 | *Hit test* con detalle | Igual en `/dashboard/tarjetas`. | Velo, no disparador. |
| 8 | *Hit test* con asistente | `elementFromPoint` del centro de «Menú» y del sidebar. | Scrim/panel, no los controles. |
| 9 | M-8 base/asistente | Contar `.glass-surface`/`.glass-hero` visibles (sin `glass-card` ni velos) y blobs. | 1/0 → 2/0 a 1440×900 y 375×812. |
| 10 | M-8 drawer/Cuenta/detalle | Igual con cada superficie. | 2/0, 2/0, 1/0; sin blobs. |
| 11 | Contraste disparador | Cuentagotas sobre el píxel compuesto. | Texto/icono sobre `bg-emerald-primary` ≥4,5:1; anillo ≥3:1. |
| 12 | Contraste panel | Texto sobre `bg-bg-cream/95` + scrim `bg-bg-dark/70`. | AA 4,5:1. |
| 13 | Teclado | Tab, Enter, Tab cíclico, Esc, «X», scrim. | Foco entra, cicla y vuelve al disparador. |
| 14 | Teclado virtual | 375×812, enfocar `#asistente-entrada`. | Campo/pie visibles; si no, **limitación heredada** de la 014. |
| 15 | Gesto | Deslizar hacia abajo en el panel. | Cierra una vez. |
| 16 | Área segura | Registrar `bottom` computado; inset real. | `env()` aplicado; **reserva real pendiente** (inset 0), nunca verde. |

**Hecho cuando:** cada celda tiene veredicto con el parámetro usado; lo no medible se declara **no
realizado** con motivo; el área segura se registra como **aplicada + pendiente**; el nodo saliente del
detalle se registra como **límite aceptado ~0,2 s**; nada pendiente se reporta como verde.

---

## T10 — Cierre: `MEMORY.md` y validación final

**Etapa 9 · Depende de:** T8 y T9.
**Alcance:** añadir la referencia de la 017 y cerrar con la suite/build. **Sin cambios de código.**
**Archivos:** `MEMORY.md` (**solo una línea**).
**Cubre:** D-3/DP-17; §9, §9.1; sin RF propio.

**Cambio exacto**

En «Referencias a specs», añadir **una sola** línea:

```md
- `specs/017-asistente-en-dashboard/` — asistente de ayuda en el dashboard (solo diseño). Aprobada (2026-10-20); implementada y validada.
```

No se toca el texto de hexadecimales (`MEMORY.md:31-32`) ni la línea de archivos ajenos sin
commitear (`MEMORY.md:37`).

**Comandos**

```bash
npm test                 # 536/536 en 34 archivos (proyección)
npm run build            # verde
git diff --numstat -- MEMORY.md   # 1 0 MEMORY.md
git diff -- MEMORY.md             # solo la línea añadida
git status --short                # sin archivos inesperados
```

**Hecho cuando:** `MEMORY.md` tiene **solo** la línea nueva; la suite y el build pasan; el informe
final declara pass/fail/no realizado de T9 y mantiene «reserva del área segura pendiente» y «nodo
saliente ~0,2 s aceptado»; no se hace staging ni commit salvo indicación del usuario.

---

## Resumen de cobertura

| Tarea | RF | AC | CL/DP | Suite esperada |
|---|---|---|---|---|
| T1 | — | — | DP-19/§9.1 | 518/518 (medida) |
| T2 | RF-13 | AC-11, AC-15 (fuente) | DP-20 | 518/518 |
| T3 | RF-01/02/03/04/05/07/08/09/10/11/12/14 | AC-02/03/04/05/07/08/09/10/12/13/14 | DP-01/02/03/04/08/11/12/13/16 | 518/518 |
| T4 | RF-02/07/09/12/14 | AC-02/07/12/14 | CL-03/07/13 | 526/526 |
| T5 | RF-01/03/04/05/13 | AC-01/03/04/05/13 | CL-04/10/12 | 532/532 |
| T6 | RF-06/11 | AC-06/11 | CL-02/14; DP-15 | 532/532 |
| T7 | RF-06/13 | AC-06/15 | CL-01/02/14; DP-18/20 | 536/536 |
| T8 | RF-01/05/09/10/11/13 | AC-01/09/10/11/15 | DP-02/10 | 536/536 + build |
| T9 | RF-06/08/12/13 | AC-06/08/12/13 | CL-03/06/11/12; DP-18/19 | Sin cambios |
| T10 | — | — | DP-17 | 536/536 + build |
