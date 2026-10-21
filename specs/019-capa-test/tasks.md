# Tareas — Spec 019: Centralización de las pruebas

Las tareas están ordenadas por la dependencia real: medir e inventariar primero, alinear las guías
antes de migrar, completar lotes independientes y validar el resultado al final. Los archivos
enumerados son suites actuales; si cambian antes de implementar, se revalida el inventario de T1.
Los requisitos RF-01–RF-09 remiten a [`spec.md`](spec.md).

## T1 — Medir línea base e inventariar destinos

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-01, RF-02, RF-03, RF-05, RF-06, RF-07
**Depende de:** ninguna.

Registrar el estado de las 39 suites `.test.js`/`.test.jsx` actuales y asociar cada una con su
módulo probado o con su categoría transversal/infraestructura. Medir la línea base real de pruebas
y build antes de editar o mover archivos. No usar como sustituto los números históricos de
`MEMORY.md`.

**Hecho cuando:**

- El inventario confirma número y extensiones de los tests; con el estado actual debe contar 39:
  31 `.test.jsx` y 8 `.test.js`.
- Cada archivo del inventario tiene un destino único conforme al espejo del origen probado; la
  suite transversal y la de infraestructura están identificadas para la raíz de `src/test/`.
- Se ejecutan y registran `npm test` y `npm run build` como línea base, incluyendo resultados y
  conteo de archivos reportado por Vitest.
- Las suites que ya fallen en la línea base quedan identificadas sin cambiar expectativas ni
  archivos.

## T2 — Alinear guías y verificar descubrimiento

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-05, RF-06, RF-08, RF-09
**Depende de:** T1.

Actualizar `AGENTS.md` y `.agents/rules/rules.md` para indicar la ubicación `src/test/`, la regla
espejo, la ubicación raíz para suites transversales sin capa principal clara e infraestructura, y
el alcance de Vitest `*.test.js`/`*.test.jsx`. Confirmar que
`src/**/*.test.{js,jsx}` descubre también rutas debajo de `src/test/`.

**Validación T2 (2026-10-20):** una prueba temporal bajo `src/test/` fue descubierta y
ejecutada por `npx vitest run src/test/__glob_probe.test.js` (1/1); se eliminó después de
la comprobación. `npm test`: 39 archivos y 554/554 pruebas aprobados. `npm run build`:
correcto. No se modificaron `vitest.config.js`, `vitest.setup.js` ni `package.json`.

**Hecho cuando:**

- Ambas guías ya no instruyen colocar estas suites junto al código productivo y describen la misma
  convención centralizada.
- La guía limita el alcance de esta convención a los formatos y herramienta fijados por la spec.
- El patrón actual de `vitest.config.js` se confirma compatible con `src/test/`; si no lo fuera,
  solo se ajusta el patrón de inclusión, sin patrones duplicados ni cambios de entorno.
- `vitest.setup.js`, `jsdom`, globals, los stubs y las declaraciones actuales de `setupFiles`
  permanecen sin cambios.

## T3 — Migrar suites de entrada e infraestructura

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07
**Depende de:** T2.

Mover `App.test.jsx`, `App016.test.jsx` y `main.test.jsx` a la raíz de `src/test/`, conservando su
asociación espejo con `App`/`main`. Mover `entornoDeMedicion.test.js` también a esa raíz por ser
una suite de infraestructura sin capa de producción homóloga. Actualizar imports relativos y el
import dinámico de `main.jsx` que corresponda.

**Hecho cuando:**

- Las cuatro suites existen una sola vez en `src/test/` con los mismos nombres y extensiones.
- Imports, mocks e import dinámico resuelven los mismos módulos que antes.
- `npx vitest run` sobre las cuatro rutas nuevas pasa, o cualquier fallo coincide con uno anotado
  en la línea base de T1.
- Se mantienen intactos los objetivos y aserciones de las cuatro suites.

**Validación T3 (2026-10-20):** `npx vitest run src/test/App.test.jsx
src/test/App016.test.jsx src/test/main.test.jsx src/test/entornoDeMedicion.test.js`:
4 archivos y 24/24 pruebas aprobados. `npm test`: 39 archivos y 554/554 pruebas
aprobados. `npm run build`: correcto. Imports ajustados a `../App` y `../main.jsx`;
la suite de infraestructura no requirió cambios internos.

## T4 — Migrar suites de hooks

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07, RF-08
**Depende de:** T2.

Mover a `src/test/hooks/` `useBreakpoint.test.js`, `useCierreConEsc.test.js`,
`useDeslizarParaCerrar.test.js`, `useFocoEnVistaDestino.test.js`, `useRetornoDeFoco.test.js` y
`useReveal.test.js`. Corregir únicamente las rutas de imports y mocks que cambien de profundidad.

**Hecho cuando:**

- Las seis suites tienen su ruta espejo en `src/test/hooks/` y no quedan copias en `src/hooks/`.
- `npx vitest run src/test/hooks` pasa y conserva los objetivos/aserciones vigentes.
- Los hooks importados y los mocks siguen resolviendo los mismos módulos.

**Validación T4 (2026-10-20):** `npx vitest run src/test/hooks`: 6 archivos y
100/100 pruebas aprobados. `npm test`: 39 archivos y 554/554 pruebas aprobados.
`npm run build`: correcto. `git diff --check` y `git diff --cached --check`:
correctos. Los seis imports a hooks productivos se ajustaron a `../../hooks/...`;
no quedan suites de hooks en `src/hooks/`.

## T5 — Migrar suites de dashboard, UI y componentes con origen profundo

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07, RF-08
**Depende de:** T2.

Mover las cuatro suites de dashboard (`AcordeonTarjetas`, `GridTarjetas`, `LogMovimientos`,
`MiTarjetaVirtual`) a `src/test/components/domain/dashboard/`; `BotonCerrar.test.jsx` y
`Card.test.jsx` a `src/test/components/ui/`. Reubicar además `Hero.test.jsx` en
`src/test/components/domain/landing/` y `ModalTarjeta.test.jsx` en
`src/test/components/domain/modales/`, conforme a los módulos que prueban y no a sus carpetas
históricas.

**Hecho cuando:**

- Las ocho suites quedan en los destinos espejo determinados por sus imports a módulos productivos
  y no permanecen copias en sus rutas anteriores.
- Imports de componentes y datos de demo siguen apuntando a los mismos módulos.
- `npx vitest run` sobre los destinos de este lote pasa, salvo fallos que ya estuvieran en T1.
- No cambian aserciones ni objetivos actuales.

**Validación T5 (2026-10-20):** `npx vitest run` sobre las ocho rutas destino: 8 archivos y
91/91 pruebas aprobados. `npm test`: 39 archivos y 554/554 pruebas aprobados.
`npm run build`: correcto (2036 módulos transformados). `git diff --check` y
`git diff --cached --check`: correctos. Las ocho suites existen una vez en sus destinos y no
permanecen en las rutas anteriores. Imports de los componentes y fixtures ajustados a la nueva
profundidad; sin cambios en aserciones ni código productivo. T6 no iniciada.

## T6 — Migrar suites de landing y modales

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07, RF-08
**Depende de:** T2.

Mover `Features.test.jsx` y `StatsBar.test.jsx` a `src/test/components/domain/landing/`, y
`AsistenteAyuda.test.jsx`, `AuthModal.test.jsx` y `ModalFuentes.test.jsx` a
`src/test/components/domain/modales/`. Revisar mocks, incluidos los mocks de configuración y los
imports a páginas.

**Hecho cuando:**

- Las cinco suites aparecen una sola vez bajo sus rutas espejo y no permanecen junto al código
  productivo.
- Los imports y mocks de módulos de modales, páginas y configuración resuelven el mismo objetivo.
- `npx vitest run` sobre ambos directorios destino pasa, salvo fallos anotados en T1.
- Las aserciones y objetivos funcionales se mantienen sin cambios.

**Validación T6 (2026-10-20):** `npx vitest run
src/test/components/domain/landing src/test/components/domain/modales`: 7 archivos y
87/87 pruebas aprobados (incluye Hero y ModalTarjeta, migrados en T5; las cinco suites de T6
suman 62/62). `npm test`: 39 archivos y 554/554 pruebas aprobados. `npm run build`:
correcto (2036 módulos transformados). `git diff --check` y `git diff --cached --check`:
correctos. Las cinco suites están una sola vez en sus destinos y ya no existen en las rutas de
origen. Se ajustaron imports a los módulos de landing y modales, imports a páginas y el mock de
`config/app.config`; sin cambios en aserciones, objetivos ni código productivo. T7 no iniciada.

## T7 — Migrar navegación y ubicar la suite transversal

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08
**Depende de:** T2.

Mover `BottomNav.test.jsx`, `DashboardDrawer.test.jsx`, `DashboardUserModal.test.jsx`,
`Header.test.jsx`, `SidebarNavContenido.test.jsx` y `SidebarResponsive.test.jsx` a
`src/test/components/layout/`. Mover `cierreDeModales.test.jsx` a la raíz de `src/test/`, porque
cubre varias superficies y no tiene una capa principal clara. Actualizar todos sus imports
relativos sin cambiar módulos mockeados.

**Hecho cuando:**

- Las seis suites de navegación/layout quedan en el espejo de `components/layout/`.
- La suite transversal queda una sola vez en la raíz de `src/test/`.
- `npx vitest run` sobre las siete rutas destino pasa, salvo fallos preexistentes documentados.
- Se conservan la trampa real de foco, sus mocks deliberados y los mismos objetivos de prueba.

**Validación T7 (2026-10-20):** las siete rutas destino pasaron en la ejecución focalizada:
7 archivos y 170/170 pruebas. `npm test`: 39 archivos y 554/554 pruebas aprobados.
`npm run build`: correcto (2036 módulos transformados). `git diff --check` y
`git diff --cached --check`: correctos. Se verificaron los siete destinos y la ausencia de sus
rutas anteriores. Se ajustaron únicamente imports relativos; se mantuvieron los módulos
mockeados, la trampa real de foco, sus mocks deliberados y las aserciones. T8 no iniciada.

## T8 — Migrar suites de layout y páginas

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07, RF-08
**Depende de:** T2.

Mover `AsistenteDashboard.test.jsx`, `DashboardLayout.test.jsx` y `LandingLayout.test.jsx` a
`src/test/layout/`. Mover `PaginaDashboardConfiguracion.test.jsx`,
`PaginaDashboardContactos.test.jsx`, `PaginaDashboardCorreos.test.jsx`, `PaginaInicio.test.jsx` y
`PanelTarjetas.test.jsx` a `src/test/pages/`. Revisar imports y mocks cruzados entre layout,
componentes, hooks y páginas.

**Hecho cuando:**

- Las ocho suites tienen su ruta espejo dentro de `src/test/layout/` o `src/test/pages/`, sin
  duplicados en las ubicaciones anteriores.
- Imports y mocks siguen refiriéndose a los mismos módulos de producción.
- `npx vitest run src/test/layout src/test/pages` pasa, salvo fallos preexistentes identificados
  en T1.
- No cambia el conjunto de aserciones ni el objetivo de ninguna suite.

**Validación T8 (2026-10-20):** `npx vitest run src/test/layout src/test/pages`: 8 archivos y
70/70 pruebas aprobados. `npm test`: 39 archivos y 554/554 pruebas aprobados.
`npm run build`: correcto (2036 módulos transformados). `git diff --check` y
`git diff --cached --check`: correctos. Se confirmaron los ocho destinos y cero suites en las
rutas anteriores. Se ajustaron únicamente imports y mocks relativos de layout, componentes,
hooks, páginas, configuración y datos de demo; aserciones y código productivo sin cambios.
T9 no iniciada.

## T9 — Migrar estilos y cerrar la regresión

**Estado:** completada (2026-10-20).

**RF cubiertos:** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09
**Depende de:** T3, T4, T5, T6, T7 y T8.

Mover `styles/index.css.test.js` a `src/test/styles/index.css.test.js` y actualizar las rutas
calculadas para que siga leyendo `src/styles/index.css` e `index.html`. Auditar las guías, la
configuración, todos los destinos y el descubrimiento final antes de ejecutar la regresión.

**Hecho cuando:**

- `npx vitest run src/test/styles/index.css.test.js` pasa y la suite sigue leyendo el CSS y HTML
  originales.
- La búsqueda final encuentra todas las suites Vitest cubiertas bajo `src/test/`, sin
  `*.test.js`/`*.test.jsx` fuera de esa carpeta y sin copias duplicadas.
- `npm test` descubre y ejecuta todas las suites del inventario actualizado: deben ser 39 si no
  hubo cambios desde T1; el resumen no muestra archivos omitidos ni duplicados.
- `npm run build` termina correctamente.
- Los stubs globales y el setup compartido siguen activos; no se trasladaron ni duplicaron.
- `git diff --check` pasa y la revisión confirma que no se modificó ningún archivo de producción
  ni el contenido funcional de las pruebas.

**Validación T9 (2026-10-20):** `npx vitest run src/test/styles/index.css.test.js`: 1 archivo,
37/37 pruebas aprobadas. Tras mover la suite, la ejecución focalizada inicialmente falló al
intentar leer el CSS desde la nueva ubicación; se ajustaron únicamente las rutas calculadas:
CSS a `../../styles/index.css` e HTML a `../../../index.html`. `npm test`: 39 archivos,
554/554 pruebas aprobadas. `npm run build`: correcto (2036 módulos transformados).
La auditoría encontró exactamente las 39 rutas del inventario (31 `.test.jsx`, 8 `.test.js`),
cero suites fuera de `src/test/` y ningún destino omitido o duplicado; confirmó los recursos
originales, la suite de infraestructura, el setup global, `jsdom`, globals y el patrón de
descubrimiento. Aserciones y archivos productivos/configuración sin cambios. `git diff --check`
y `git diff --cached --check`: correctos.
