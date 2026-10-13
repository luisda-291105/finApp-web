# Plan 003 — Mi Tarjeta Virtual (componente interactivo con flip 3D)

`Estado: listo para implementación`

## Arquitectura

Cambio confinado a la capa de interfaz del dashboard, sin nuevas dependencias (Framer Motion ya instalado), sin CSS nuevo y sin datos externos:

- **Componente nuevo de presentación + interacción** `MiTarjetaVirtual` en `src/components/`:
  - Props tipadas (JSDoc) para datos de tarjeta y configuración visual.
  - Estado interno `volteada` (boolean) para controlar cara visible.
  - Framer Motion para: `whileHover` (elevación solo escritorio), `whileTap` (scale 0.99), `animate` (rotateY 0/180°), `transition` (duración 600ms, easing marca).
  - `useReducedMotion()` para respetar `prefers-reduced-motion`.
  - Accesibilidad completa: `role="button"`, `tabIndex={0}`, `aria-label` dinámico, `aria-pressed`, `onKeyDown` (Enter/Espacio), foco visible.
  - Variaciones de color via prop `colorTema` (`azul` | `menta` | `morado`) mapeadas a tokens del tema.
  - Callback `onFlip(volteada)` opcional disparado tras animación (setTimeout 600ms).
  - Header JSDoc según `.agents/file-header-template.md`.

- **Integración en `PanelTarjetas`** (spec 002):
  - Importar `MiTarjetaVirtual` y renderizarla como primera sección destacada (`max-w-xs mx-auto sm:mx-0`), con `className="reveal"` para entrada escalonada.
  - Mantener grid de 3 tarjetas demo existente (spec 002) como sección secundaria "Tus otras tarjetas" con `reveal-stagger`.
  - Nota "Datos de demostración" conservada al final.

- **Estilos**: solo tokens/clases existentes de `src/styles/index.css`:
  - Contenedor tarjeta: `glass-card` (blanca, borde `border-line`, radio `radius-glass`, sombra suave).
  - Gradientes de color via clases Tailwind arbitrarias que usan tokens (`from-blue-600`, `from-emerald-primary`, `from-purple-600`, etc.) — **sin hex en JSX**.
  - Texto: `text-bg-dark`, `text-slate-text`, `text-white` (sobre gradientes), `font-display` (títulos/cifras), `font-body` (UI), `font-mono` + `tabular-nums` (números).
  - Acentos: `mint-accent` (verde menta), `emerald-primary`, `cat-other` (morado), `cat-income` (azul), `cat-expense` (rojo).
  - Sombra hover: `rgba(26, 122, 94, 0.15)` derivado de `emerald-primary` — permitido como valor inline en Framer Motion (no CSS nuevo).
  - Layout responsive: tarjeta principal `max-w-xs` centrada; grid secundario `grid gap-4 sm:grid-cols-3`.

- **Pruebas**:
  - `src/components/MiTarjetaVirtual.test.jsx`: unitarias (render, flip click/teclado, props, callback, accesibilidad).
  - `src/App.test.jsx`: ampliar casos de ruta `/dashboard/tarjetas` para verificar presencia del componente.

- **Validación**: `npm test` (suite completa sin regresiones) y `npm run build`.

## Archivos afectados

1. `src/components/MiTarjetaVirtual.jsx` (nuevo, header JSDoc) — RF1–RF7, RF9
2. `src/components/MiTarjetaVirtual.test.jsx` (nuevo, prueba colocada) — RF8
3. `src/components/PanelTarjetas.jsx` (modificación: import + render principal) — RF1
4. `src/App.test.jsx` (ampliación: casos de ruta tarjetas) — RF8
5. `MEMORY.md` (actualización de cierre) — sin datos sensibles

## Datos demo (fijados para determinismo)

| Campo        | Valor                          |
|--------------|--------------------------------|
| titular      | "MARÍA GARCÍA"                 |
| numero       | "4242 4242 4242 4242"          |
| expiracion   | "12/28"                        |
| cvv          | "847"                          |
| entidad      | "FinApp"                       |
| colorTema    | "azul"                         |

Valores ficticios, sin correspondencia con tarjetas reales.

## Decisiones justificadas

- **Framer Motion para interacciones** (hover, tap, flip): permitido por `react-vite` skill y `fluid-glass` skill ("Framer Motion queda para: hover/tap, modales, layoutId, contadores"). No se usa para scroll-reveal.
- **`useReducedMotion()`** de Framer Motion: respeta `prefers-reduced-motion` automáticamente; en modo reducido las animaciones `whileHover`/`whileTap`/`animate` se desactivan.
- **Gradientes via clases Tailwind arbitrarias** (`from-blue-600`, etc.): los colores base (blue-600, emerald-primary, purple-600) están en la paleta de tokens del tema Tailwind v4 (`@theme` en `index.css`); usar clases utilitarias evita CSS nuevo y hex en JSX.
- **`glass-card` como contenedor base**: respeta límites Fluid Glass (superficie blanca, no translúcida). El gradiente de color va **dentro** del contenedor como fondo del contenido, no como superficie de vidrio.
- **`max-w-xs` para tarjeta principal**: ancho fijo tipo tarjeta bancaria realista (~320px), centrado en móvil, alineado izquierda en escritorio (`sm:mx-0`).
- **Flip 3D con `rotateY` en Framer Motion**: más performante y accesible que CSS manual; `transform-style: preserve-3d` en contenedor padre.
- **Callback `onFlip` con setTimeout 600ms**: Framer Motion no expone `onAnimationComplete` directo en `animate`; patrón estándar es `setTimeout` igual a duración de transición.
- **Datos demo en `PanelTarjetas` (no en config)**: único consumidor; spec 002 ya fija este patrón.

## Alternativas descartadas

- **CSS puro para flip** (`.flip-card` con `:hover`/`:focus` + checkbox hack): descartado por accesibilidad (teclado complejo), falta de control de duración/easing, y no poder disparar callback fiable.
- **`transform-style: preserve-3d` + CSS `transition`**: Framer Motion gestiona mejor `prefers-reduced-motion`, `whileHover`/`whileTap` condicionales, y coordinación de estados.
- **Datos demo en `src/config/`**: no es configuración de app ni API; un consumidor no justifica módulo nuevo.
- **Animar entrada del bloque (reveal)**: fuera de alcance; spec 002 no lo requiere y este componente debe verse sin JS.
- **Props para cada campo visual (chip, logo, franja)**: sobre-ingeniería; los elementos visuales fijos (chip svg, franja magnética, logotipos) son parte del diseño de tarjeta bancaria estándar.

## Pruebas con Vitest

- **`MiTarjetaVirtual.test.jsx`** (unitarias, patrón `describe("MiTarjetaVirtual")`):
  - Renderiza frente con todos los campos (titular, número, expiración, chip, entidad, acento mint).
  - Click invierte `volteada` y muestra reverso (CVV, franja, texto legal).
  - Teclado Enter/Espacio dispara flip.
  - Callback `onFlip` recibe `true` tras flip y `false` al volver.
  - Props `colorTema` aplica gradiente correcto (comprobar clase en contenedor).
  - `prefers-reduced-motion` (mock) desactiva animaciones.
  - Accesibilidad: `role="button"`, `tabIndex={0}`, `aria-label` dinámico, `aria-pressed`, foco visible.

- **`App.test.jsx`** (integración por ruta, reutilizando `renderRuta` con `MemoryRouter`):
  - `/dashboard/tarjetas`: renderiza `MiTarjetaVirtual` con datos demo + grid 3 tarjetas + nota.
  - Verificar ausencia de regresiones en `/dashboard`, `/dashboard/transacciones`, `/dashboard/configuracion`.

- **Validación por tarea**: `npx vitest run <ruta>`; cierre con `npm test` y `npm run build`.

## Revisión visual (manual, no automatizada)

- En navegador, escritorio y móvil (< 640px):
  - Tarjeta principal: frente visible, flip suave 3D, reverso con CVV legible.
  - Hover escritorio: elevación + sombra esmeralda; móvil: sin hover.
  - Grid secundario: 1 col móvil, 3 col escritorio.
  - Contraste legible (blanco sobre gradientes, texto oscuro sobre blanco).
  - Sin nuevas superficies translúcidas superpuestas ni blobs (límite Fluid Glass).
- Si no hay navegador: registrar explícitamente como "no realizada".

## Relación cambios ↔ RF

| RF  | Cambio |
|-----|--------|
| RF1 | `MiTarjetaVirtual` en `PanelTarjetas` (sección principal) con datos demo |
| RF2 | Componente renderiza frente: chip, número, titular, expiración, entidad, acento mint |
| RF3 | Componente renderiza reverso: franja, CVV, texto legal, logotipos |
| RF4 | `whileHover` en Framer Motion con `translateY(-4px)` + sombra esmeralda; condicional a hover nativo |
| RF5 | `animate={{ rotateY: volteada ? 180 : 0 }}` + `transition` 600ms easing marca; click/teclado toggle |
| RF6 | `setTimeout(() => onFlip?.(nuevoEstado), 600)` en handler |
| RF7 | Tokens via clases Tailwind (`from-blue-600`, `emerald-primary`, `mint-accent`, `cat-other`, `cat-income`, `cat-expense`, `slate-text`, `bg-dark`, `bg-cream`, `border-line`, `radius-glass`, `font-display`, `font-body`, `font-mono`, `tabular-nums`) |
| RF8 | `MiTarjetaVirtual.test.jsx` + casos ruta en `App.test.jsx` |
| RF9 | `useReducedMotion()` de Framer Motion + `whileHover`/`whileTap`/`animate` respetan automáticamente |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Flip 3D no funciona en navegador antiguo | `transform-style: preserve-3d` + `backface-visibility: hidden` en caras; fallback: si no soporta 3D, mostrar solo frente (detectar con `@supports (transform-style: preserve-3d)` en CSS si necesario) |
| Framer Motion `whileHover` activa en táctil | Framer Motion usa `window.matchMedia('(hover: hover)')` internamente; verificar en test móvil |
| `prefers-reduced-motion` no desactiva `whileHover` | `useReducedMotion()` retorna `true` → Framer Motion omite animaciones; probar con mock |
| Sombra hover con valor rgba inline | Valor derivado de token `emerald-primary` (#1a7a5e → rgba(26,122,94,0.15)); documentado en plan, no es CSS nuevo |
| Accesibilidad foco visible en gradiente | `focus-visible` ya definido en `index.css` para `.glass-card` con anillo `emerald-primary` 40%; componente usa `glass-card` como base |