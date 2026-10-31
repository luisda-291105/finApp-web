# Plan — Spec 005: Arquitectura, capa de páginas (`src/pages/`)

**Spec aprobada:** `specs/005-arquitectura-capa-pages/spec.md`

## Enfoque técnico

Migración tipo *move, no duplicate*: cada vista pasa de `src/components/` (o
de estar embebida en `src/App.jsx`) a `src/pages/`, y los archivos originales
se eliminan en la misma tarea que actualiza sus referencias, de modo que el
repositorio nunca convive con dos copias ni con rutas rotas.

Decisiones:

1. **Orden de dependencias: hojas primero, raíz al final.** Se migran las
   páginas de menor dependencia primero: `PanelTarjetas` (T1), las cuatro
   secciones del dashboard (T2), el layout `PaginaDashboard` (T3),
   `PaginaLogin` (T4) y, al final, la landing junto con la reescritura de
   `App.jsx` (T5). En cada tarea se ajusta el import correspondiente de
   `App.jsx` en el mismo paso (move-no-duplication: el original se elimina
   dentro de la misma tarea, nunca hay dos copias ni imports rotos).
   *Verificación de dependencias reales:* `Dashboard.jsx` solo importa
   `NavLink` y `Outlet` de react-router-dom: **no tiene dependencia de
   importación sobre `DashboardSection`** (la comunicación layout ↔ secciones
   es vía `<Outlet />` y el árbol de rutas que define `App.jsx`). Por tanto
   ambos órdenes entre "extraer secciones" y "mover Dashboard" compilarían;
   se elige secciones primero (T2 antes que T3) para respetar el principio
   hojas-primero-raíz-al-final de forma estricta: cuando `PaginaDashboard` se
   mueve en T3, sus subrutas ya apuntan a páginas en `src/pages/` y la rama
   `/dashboard` de `App.jsx` queda pura de golpe. Además, T2 vacía
   `DashboardSection` de `App.jsx` antes de la reescritura final, reduciendo
   el tamaño y el riesgo de T5.
   *Alternativa descartada:* mover `Dashboard` primero (orden original del
   plan): es técnicamente válido (no rompe imports, dado que `Dashboard` no
   importa las secciones), pero deja un estado intermedio asimétrico — layout
   ya en `pages/` con secciones aún embebidas en `App.jsx` — y carga más
   cambios a T5. También descartada: reescribir todo `App.jsx` primero con
   imports a páginas inexistentes (rompe build/tests entre tareas) o migrar
   todo en una única tarea (no atómica).
2. **Pruebas junto al código:** `PanelTarjetas.test.jsx` se mueve con su
   página (RF-09); los tests de rutas viven en `src/App.test.jsx` y las
   aserciones por texto/rol se conservan (los elementos no cambian).
3. **Cambio de comportamiento acotado a `App.jsx` + `LoginPage`:** el nuevo
   mapa de rutas (`/` siempre landing, `/inicio` → `/`, cierre de login →
   `/` sin trial) solo toca la capa de rutas y una línea de navegación.
   Ningún componente visual cambia.
4. **Headers e imports relativos:** cada archivo movido recibe header según
   `.agents/file-header-template.md` (tests exentos, RF-10), corrige
   `@usadoPor` (p. ej. `Dashboard.jsx`/`LoginPage.jsx` pasan de
   `@usadoPor App.jsx` a páginas/rutas) y actualiza imports relativos
   (`../components/...`, `../config/...`).
5. **Hex heredados conservados** tal cual al mover el JSX de la landing a
   `PaginaInicio.jsx` (RF-02); sin migración a tokens (fuera de alcance).
6. **TDD donde aplica:** los tests de ruta nuevos/modificados (`/` muestra
   landing, `/inicio` → `/`) se escriben primero dentro de su tarea y fallan
   contra el código viejo; las pruebas de componentes movidas son
   reubicaciones que deben pasar sin cambios semánticos.

## Archivos afectados

| Acción | Archivo |
| ------ | ------- |
| Mover + header + imports | `src/components/PanelTarjetas.jsx` → `src/pages/PanelTarjetas.jsx` |
| Mover test (sin header) | `src/components/PanelTarjetas.test.jsx` → `src/pages/PanelTarjetas.test.jsx` |
| Mover + header | `src/components/Dashboard.jsx` → `src/pages/PaginaDashboard.jsx` |
| Mover + header + navigate (`/inicio`→`/`) | `src/components/LoginPage.jsx` → `src/pages/PaginaLogin.jsx` |
| Crear (extracción de `DashboardSection`) | `src/pages/PaginaDashboardInicio.jsx`, `PaginaDashboardTransacciones.jsx`, `PaginaDashboardTarjetas.jsx`, `PaginaDashboardConfiguracion.jsx` |
| Crear (extracción de `LandingPage`, hex intactos) | `src/pages/PaginaInicio.jsx` |
| Reescribir como capa de rutas pura | `src/App.jsx` |
| Actualizar | `src/App.test.jsx`, `src/components/Navbar.test.jsx`, `MEMORY.md` |
| Eliminar originales | `src/components/LoginPage.jsx`, `Dashboard.jsx`, `PanelTarjetas.jsx` (tras su movimiento) |

`src/pages/PaginaDashboardTarjetas.jsx` compondrá `PanelTarjetas` (mismo
directorio). Los componentes `AcordeonTarjetas`, `GridTarjetas`,
`ModalTarjeta`, `LogMovimientos`, `MiTarjetaVirtual` y el fixture
`tarjetasDemo.js` permanecen en su sitio; `PanelTarjetas.jsx` ajusta sus
imports relativos a `../components/...` y `../data/...`.

## Pruebas (Vitest + Testing Library, jsdom)

- `npx vitest run <ruta>` focalizado por tarea; `npm test` y `npm run build`
  al final de cada tarea (requisito del proyecto).
- Tests de rutas con `MemoryRouter` en `App.test.jsx`.
- No se necesitan mocks nuevos: `useReveal` ya guarda contra
  `IntersectionObserver` indefinido en jsdom (MEMORY.md, spec 001); los
  tests existentes de framer-motion usan los mocks con `forwardRef` ya
  establecidos.

## Relación cambios ↔ RF

- T1 (mover `PanelTarjetas` + test) → RF-01, RF-07 (parcial), RF-09, RF-10.
- T2 (4 páginas de sección, elimina `DashboardSection`) → RF-01, RF-07, RF-08 (parcial).
- T3 (mover `Dashboard` → `PaginaDashboard`) → RF-01, RF-06, RF-10.
- T4 (mover `LoginPage` → `PaginaLogin`, navigate a `/`) → RF-01, RF-03.
- T5 (`PaginaInicio` + reescritura de `App.jsx` + mapa final) → RF-02, RF-04, RF-05, RF-08.
- T6 (`Navbar.test.jsx`) → RF-09.
- T7 (`App.test.jsx`: raíz/landing y `/inicio` → `/`) → RF-04, RF-09.
- T8 (`MEMORY.md`) → alcance documental de la spec.

## Riesgos y mitigaciones

- **Tests rotos entre tareas (raíz `/`):** el test actual espera `/` →
  `/dashboard`. La reescritura del mapa se hace TDD dentro de T5/T7 de forma
  contigua; si T5 cierra antes de T7, `App.test.jsx` ya se adapta en T5.
  Decisión del plan: T5 incluye la adaptación completa de `App.test.jsx`
  (raíz, `/inicio` → `/`) y T7 queda como verificación/refuerzo... se
  consolida: la adaptación de `App.test.jsx` vive **íntegra en T5** (TDD: el
  test nuevo falla antes), y T7 desaparece. (10 tareas máx. sigue cumplido.)
- **Imports relativos olvidados al mover:** mitigado con `npm run build` por
  tarea (falla rápido) y grep de imports a `./components`/`./config` desde
  `src/pages/`.
- **Selectores frágiles en tests de tarjetas** (`within(grid)`, clases de
  breakpoint): no cambian, `PanelTarjetas` se mueve sin tocar internos.
- **Hex heredados:** mover JSX literal sin "mejorar" estilos (tentación de
  limpiar); la spec lo prohíbe expresamente.
- **Estado visual entre breakpoints:** sin cambios de CSS ni de render;
  riesgo nulo por construcción. Validación visual en navegador se reporta
  como ejecutada o no realizada.
