# Tareas — Spec 005: Arquitectura, capa de páginas (`src/pages/`) ✅ COMPLETADA

Cada tarea es atómica (movimiento + referencias en el mismo paso; nunca quedan
duplicados ni imports rotos) y termina con sus validaciones. Orden fijo.

---

## T1 — Mover `PanelTarjetas` a `src/pages/` ✅

**RF:** RF-01, RF-07 (parcial), RF-09, RF-10.

- Mover `src/components/PanelTarjetas.jsx` → `src/pages/PanelTarjetas.jsx`
  sin cambios internos de comportamiento; ajustar imports relativos a
  `../components/...` y `../data/tarjetasDemo`; añadir/actualizar header
  JSDoc según plantilla (`@usadoPor PaginaDashboardTarjetas`).
- Mover `src/components/PanelTarjetas.test.jsx` →
  `src/pages/PanelTarjetas.test.jsx` (sin header JSDoc, exento según RF-10);
  ajustar imports relativos.
- Actualizar en `src/App.jsx` el import de `PanelTarjetas` a
  `./pages/PanelTarjetas`.
- Eliminar los archivos originales de `src/components/`.

**Hecho cuando:** `grep -r "components/PanelTarjetas" src` no devuelve
resultados; `npx vitest run src/pages/PanelTarjetas.test.jsx`,
`npm test` y `npm run build` en verde.

---

## T2 — Crear las cuatro páginas de sección del dashboard ✅

**RF:** RF-01, RF-07, RF-08 (parcial).

- Extraer el contenido de `DashboardSection` (hoy en `App.jsx`) en:
  - `src/pages/PaginaDashboardInicio.jsx` — título "Tu dinero, en equilibrio."
    + tres tarjetas de cifras.
  - `src/pages/PaginaDashboardTransacciones.jsx` — placeholder de
    transacciones.
  - `src/pages/PaginaDashboardTarjetas.jsx` — título "Tus tarjetas" +
    `<PanelTarjetas />` (import `./PanelTarjetas`).
  - `src/pages/PaginaDashboardConfiguracion.jsx` — placeholder de
    configuración.
- Cada una conserva el bloque "FinApp / Panel", el
  `<h1 id="dashboard-title">` y `aria-labelledby`; cada una con header JSDoc
  según plantilla.
- `App.jsx`: las cuatro subrutas pasan a usar las páginas; eliminar la
  función local `DashboardSection` y el import de `PanelTarjetas`.

**Hecho cuando:** `App.jsx` ya no define `DashboardSection`; pruebas de
rutas existentes (secciones inicio/transacciones/tarjetas/configuracion)
pasan; `npm test` y `npm run build` en verde.

---

## T3 — Mover `Dashboard` → `PaginaDashboard` ✅

**RF:** RF-01, RF-06, RF-10.

- Mover `src/components/Dashboard.jsx` → `src/pages/PaginaDashboard.jsx`
  renombrando el export a `PaginaDashboard`; contenido (sidebar, NavLinks,
  header, `<Outlet />`) sin cambios.
- Header JSDoc actualizado (`@uso` layout del panel, `@usadoPor App.jsx`
  como ruta `/dashboard`).
- `App.jsx`: import desde `./pages/PaginaDashboard` y uso en la ruta
  `/dashboard`. Eliminar `src/components/Dashboard.jsx`.

**Hecho cuando:** `grep -r "components/Dashboard" src` sin resultados; la
rama `/dashboard` de `App.jsx` ya solo importa desde `./pages/`;
`npx vitest run src/App.test.jsx`, `npm test` y `npm run build` en verde
(comportamiento de rutas aún sin cambiar).

---

## T4 — Mover `LoginPage` → `PaginaLogin` y corregir navegación a `/` ✅

**RF:** RF-01, RF-03, RF-10.

- Mover `src/components/LoginPage.jsx` → `src/pages/PaginaLogin.jsx`
  renombrando el export; header JSDoc actualizado.
- Cambiar `alCerrar={() => navigate(TRIAL_ACTIVO ? "/dashboard" : "/inicio")}`
  a destino `"/"` en la rama sin trial (alias eliminado).
- `App.jsx`: import desde `./pages/PaginaLogin`. Eliminar
  `src/components/LoginPage.jsx`.

**Hecho cuando:** `grep -rn '"/inicio"' src` solo encuentra la ruta alias en
`App.jsx` (pendiente de T5); `npx vitest run src/App.test.jsx`, `npm test` y
`npm run build` en verde.

---

## T5 — Crear `PaginaInicio`, reescribir `App.jsx` como capa de rutas pura y
adaptar `App.test.jsx` (TDD) ✅

**RF:** RF-02, RF-04, RF-05, RF-08, RF-09.

- **Test primero:** en `src/App.test.jsx`, renombrar la prueba
  `"redirige la raíz al dashboard durante el trial"` (líneas 33-38) por una
  que verifique que `/` muestra la landing (p. ej. contenido del `Hero`);
  añadir prueba de redirección `/inicio` → `/` (landing). Deben fallar contra
  el código actual. Sin mocks nuevos (`useReveal` ya guarda jsdom).
- Crear `src/pages/PaginaInicio.jsx` extrayendo `LandingPage` de `App.jsx`
  con estado y manejadores intactos (`modalAbierto`, `modoAuth`, botón "?"),
  **conservando los hex heredados tal cual** (`bg-[#0f1117]`,
  `hover:bg-[#1a7a5e]`, `text-[#0f1117]`); header JSDoc según plantilla.
- Reescribir `src/App.jsx` como capa de rutas pura: imports de páginas,
  `Routes`/`Route`/`Navigate` y la guardia `TRIAL_ACTIVO` en `/dashboard`;
  mapa final: `/` = `PaginaInicio`; `/inicio` → `<Navigate to="/" replace />`;
  `/login`; `/dashboard/*` con guardia; `*` → `/`. Sin `LandingPage` ni
  `DashboardSection`. Header JSDoc de `App.jsx` actualizado (ya no cita
  `/inicio`).
- Verificar que las pruebas nuevas pasan y toda la suite sigue en verde.

**Hecho cuando:** `App.jsx` no contiene composición de vistas ni JSX de
landing/sections; `grep -rn '"/inicio"' src` solo aparece en la redirección
de `App.jsx`; las pruebas TDD pasan; `npm test` y `npm run build` en verde.

---

## T6 — Actualizar `Navbar.test.jsx` ✅

**RF:** RF-09.

- Cambiar `initialEntries={["/inicio"]}` por `["/"]` (la ruta alias ya no es
  ubicación válida de contexto).

**Hecho cuando:** `npx vitest run src/components/Navbar.test.jsx` en verde;
`npm test` y `npm run build` en verde.

---

## T7 — Actualizar `MEMORY.md` ✅

**RF:** alcance documental de la spec (actualizar "Estado actual").

- Añadir entrada de cierre de spec 005: capa `src/pages/` creada, páginas
  migradas, eliminación de `/inicio`, `/` siempre landing, `App.jsx` como
  capa de rutas pura, hex heredados conservados (fuera de alcance su
  limpieza), `LoginPage`/`Dashboard`/`PanelTarjetas` eliminados de
  `src/components/`.
- Actualizar la sección "Estado actual": mapa de rutas nuevo y estructura
  (rutas ya no residen en `App.jsx` con vistas embebidas).

**Hecho cuando:** `MEMORY.md` refleja el mapa de rutas y la estructura
nuevos sin contradicciones con el código; `npm test` y `npm run build` en
verde (sanidad final).

---

Validaciones transversales de cada tarea: pruebas relevantes focalizadas,
`npm test` completo y `npm run build`. La validación visual Fluid Glass en
navegador se reporta como ejecutada o no realizada (sin cambios visuales en
esta spec, se espera "no requerida / pendiente honesta").
