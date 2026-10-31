# Tasks — Spec 006: Capa layout y componentes reutilizables

Orden lógico: estructura carpetas → mover componentes → crear nuevos (Card, Container, Sidebar, layouts) → refactor páginas → refactor 10 Card uses → tests → validación final.

Cada tarea es atómica y completable en una sesión de implementer. **RF** = requisito funcional de la spec (EARS).

---

## T1 — Crear estructura de directorios atómica/molecular ✅

**Descripción**: Crear los directorios destino en `src/components/` y `src/layout/`.

**Archivos a crear (directorios)**:
- `src/components/ui/`
- `src/components/layout/`
- `src/components/domain/landing/`
- `src/components/domain/modales/`
- `src/components/domain/dashboard/`
- `src/layout/`

**RF cubiertos**: RF-01, RF-04

**Prueba focalizada**: `ls -la src/components/ src/layout/` (verificar existencia)

**Validaciones**:
- `npm run build` (estructura vacía no rompe build) ✅
- `ls` confirma 6 directorios nuevos ✅

**Hecho cuando**: Los 6 directorios existen y `npm run build` pasa.

**Dependencias**: Ninguna (tarea inicial).

**Resultado**: Pass — 6 directorios creados y `npm run build` en verde.

---

## T2 — Mover y renombrar Navbar → Header y Footer a components/layout/ ✅

**Descripción**:
1. `src/components/Navbar.jsx` → `src/components/layout/Header.jsx` (renombrar export y nombre de componente)
2. `src/components/Footer.jsx` → `src/components/layout/Footer.jsx` (mover sin renombrar)
3. Actualizar header JSDoc en ambos (`@usadoPor`, `@uso`, nombre)
4. Mover test: `src/components/Navbar.test.jsx` → `src/components/layout/Header.test.jsx`; actualizar import y `describe("Header", ...)`.

**Archivos a modificar/crear/mover/borrar**:
- **Borrar**: `src/components/Navbar.jsx`, `src/components/Footer.jsx`, `src/components/Navbar.test.jsx`
- **Crear**: `src/components/layout/Header.jsx`, `src/components/layout/Footer.jsx`, `src/components/layout/Header.test.jsx`

**RF cubiertos**: RF-02, RF-08

**Prueba focalizada**: `npx vitest run src/components/layout/Header.test.jsx`

**Validaciones**:
- `npx vitest run src/components/layout/Header.test.jsx` → pass ✅
- `npm test` → verde (98/98) ✅
- `npm run build` → verde ✅
- `grep -r "components/Navbar" src/` → sin resultados ✅
- `grep -r "components/Footer" src/` → solo nueva ruta ✅

**Hecho cuando**: Header/Footer en `components/layout/`, test renombrado y pasa, suite completa verde, build verde, cero referencias a rutas antiguas. ✅

**Dependencias**: T1.

**Resultado**: Pass — Header/Footer en `components/layout/`, Header.test.jsx pasa (2/2), `npm test` 98/98, `npm run build` verde, cero referencias antiguas.

---

## T3 — Mover componentes de landing a components/domain/landing/ ✅

**Descripción**: Mover 5 componentes a `src/components/domain/landing/` con nombres PascalCase (ya lo son). Actualizar header JSDoc en cada uno (`@usadoPor` → `LandingLayout` / páginas que los compongan).

**Archivos a mover**:
- `src/components/Hero.jsx` → `src/components/domain/landing/Hero.jsx`
- `src/components/StatsBar.jsx` → `src/components/domain/landing/StatsBar.jsx`
- `src/components/Features.jsx` → `src/components/domain/landing/Features.jsx`
- `src/components/HowItWorks.jsx` → `src/components/domain/landing/HowItWorks.jsx`
- `src/components/CtaSection.jsx` → `src/components/domain/landing/CtaSection.jsx`

**Archivos a modificar**: Los 5 archivos (header JSDoc `@usadoPor`). Además actualizar imports en `src/pages/PaginaInicio.jsx` y tests `src/components/Hero.test.jsx`, `src/components/Features.test.jsx`.

**RF cubiertos**: RF-01, RF-08

**Prueba focalizada**: `npx vitest run src/components/Hero.test.jsx src/components/Features.test.jsx`

**Validaciones**:
- `npm run build` → verde ✅
- `grep -r "components/Hero\|components/StatsBar\|components/Features\|components/HowItWorks\|components/CtaSection" src/` → sin resultados (solo rutas nuevas en `domain/landing/`) ✅
- Headers JSDoc actualizados en los 5 archivos (`@usadoPor LandingLayout`) ✅
- `npm test` → verde (98/98) ✅

**Hecho cuando**: 5 componentes en `domain/landing/`, headers actualizados, build verde, cero imports rotos, tests pasan.

**Dependencias**: T1.

**Resultado**: Pass — 5 componentes movidos, headers JSDoc actualizados a `@usadoPor LandingLayout`, `npm run build` verde, `npm test` 98/98, grep confirma cero referencias a rutas antiguas.

---

## T4 — Mover componentes de modales a components/domain/modales/ ✅

**Descripción**: Mover 2 componentes a `src/components/domain/modales/`. Actualizar header JSDoc (`@usadoPor`).

**Archivos a mover**:
- `src/components/AuthModal.jsx` → `src/components/domain/modales/AuthModal.jsx`
- `src/components/ModalTarjeta.jsx` → `src/components/domain/modales/ModalTarjeta.jsx`

**Archivos a modificar**: Los 2 archivos (header JSDoc `@usadoPor`). Además actualizar imports en `src/pages/PaginaInicio.jsx`, `src/pages/PaginaLogin.jsx`, `src/pages/PanelTarjetas.jsx`, `src/components/ModalTarjeta.test.jsx`.

**RF cubiertos**: RF-01, RF-08

**Validaciones**:
- `npm run build` → verde ✅
- `grep -r "components/AuthModal\|components/ModalTarjeta" src/` → sin resultados (solo rutas nuevas en `domain/modales/`) ✅
- Headers JSDoc actualizados (`@usadoPor PaginaInicio, PaginaLogin` y `@usadoPor PanelTarjetas`) ✅
- `npm test` → verde (98/98) ✅

**Hecho cuando**: 2 componentes en `domain/modales/`, headers actualizados, build verde, suite completa verde, cero referencias a rutas antiguas.

**Dependencias**: T1.

**Resultado**: Pass — 2 componentes movidos a `domain/modales/`, headers JSDoc actualizados (`AuthModal: @usadoPor PaginaInicio, PaginaLogin`; `ModalTarjeta: @usadoPor PanelTarjetas`), `npm run build` verde, `npm test` 98/98, grep confirma cero referencias a rutas antiguas en `components/`.

---

## T5 — Mover componentes de dashboard a components/domain/dashboard/

**Descripción**: Mover 4 componentes a `src/components/domain/dashboard/`. Actualizar header JSDoc (`@usadoPor`).

**Archivos a mover**:
- `src/components/AcordeonTarjetas.jsx` → `src/components/domain/dashboard/AcordeonTarjetas.jsx`
- `src/components/GridTarjetas.jsx` → `src/components/domain/dashboard/GridTarjetas.jsx`
- `src/components/MiTarjetaVirtual.jsx` → `src/components/domain/dashboard/MiTarjetaVirtual.jsx`
- `src/components/LogMovimientos.jsx` → `src/components/domain/dashboard/LogMovimientos.jsx`

**Archivos a modificar**: Los 4 archivos (header JSDoc `@usadoPor`). Además, `ModalTarjeta.jsx` (ya movido en T4) importa `MiTarjetaVirtual` y `LogMovimientos` desde `../components/` → actualizar a `../domain/dashboard/`.

**RF cubiertos**: RF-01, RF-08

**Validaciones**:
- `npm run build` → verde
- `grep -r "components/AcordeonTarjetas\|components/GridTarjetas\|components/MiTarjetaVirtual\|components/LogMovimientos" src/` → solo rutas nuevas en `domain/dashboard/`
- `ModalTarjeta.jsx` importa desde rutas nuevas
- Headers JSDoc actualizados en los 4 archivos

**Hecho cuando**: 4 componentes en `domain/dashboard/`, imports corregidos en `ModalTarjeta`, headers actualizados, build verde.

**Dependencias**: T1, T4 (para import en ModalTarjeta).

**Resultado**: Pass — 4 componentes movidos a `domain/dashboard/` (`AcordeonTarjetas`, `GridTarjetas`, `MiTarjetaVirtual`, `LogMovimientos`), headers JSDoc actualizados (`@usadoPor`: PanelTarjetas / AcordeonTarjetas, GridTarjetas, ModalTarjeta / ModalTarjeta), `ModalTarjeta.jsx` imports corregidos a `../dashboard/`, `PanelTarjetas.jsx` imports actualizados, tests movidos y sus imports corregidos, `npm run build` verde, `npm test` **98/98 en 12 archivos**, `grep` confirma cero referencias a rutas antiguas en `components/`.

---

## T6 — Crear componente Card (átomo UI)

**Descripción**: Crear `src/components/ui/Card.jsx` según spec:
- Props: `children` (obligatorio), `className` (string, default `""`), `como` (string o componente, default `"div"`)
- Renderiza `<Tag className={"glass-card " + className}>{children}</Tag>` donde `Tag = como`
- Header JSDoc según plantilla
- Sin interacción, sin animación, sin hex, solo `.glass-card` + `className`

**Archivos a crear**: `src/components/ui/Card.jsx`

**RF cubiertos**: RF-03

**Prueba focalizada**: Crear `src/components/ui/Card.test.jsx` (ver T12) y ejecutar `npx vitest run src/components/ui/Card.test.jsx`

**Validaciones**:
- `npm run build` → verde
- Test focalizado pasa (ver T12)

**Hecho cuando**: `Card.jsx` existe con API correcta, header JSDoc, build verde.

**Dependencias**: T1.

**Resultado**: Pass — `Card.jsx` creado en `src/components/ui/Card.jsx` con props `children`, `className`, `como` (default `"div"`), header JSDoc correcto, `npm run build` verde, `npm test` 98/98 verde.

---

## T7 — Crear Container y Sidebar (moléculas layout) ✅

**Descripción**: Crear dos componentes en `src/components/layout/`:
1. `Container.jsx`: `<div className="mx-auto max-w-6xl px-4">{children}</div>` (clases exactas que ya usan las páginas)
2. `Sidebar.jsx`: Placeholder mínimo `<aside>` vacío (para uso futuro en DashboardLayout)

Ambos con header JSDoc según plantilla.

**Archivos a crear**:
- `src/components/layout/Container.jsx`
- `src/components/layout/Sidebar.jsx`

**RF cubiertos**: RF-01, RF-04 (parte)

**Validaciones**:
- `npm run build` → verde ✅
- `Container.jsx` renderiza `children` con clases exactas ✅
- `Sidebar.jsx` renderiza `<aside>` vacío ✅

**Hecho cuando**: Ambos archivos existen con header JSDoc, build verde. ✅

**Dependencias**: T1, T2 (Header/Footer ya en layout/).

**Resultado**: Pass — Ambos archivos creados con headers JSDoc correctos, `npm run build` verde, `npm test` 98/98 verde.

---

## T8 — Crear LandingLayout (organismo) ✅

**Descripción**: Crear `src/layout/LandingLayout.jsx` que compone:
- `Header` (de `components/layout/`)
- `Hero`, `StatsBar`, `Features`, `HowItWorks`, `CtaSection` (de `components/domain/landing/`)
- `Footer` (de `components/layout/`)
- Recibe `children` opcional para contenido extra (p.ej. `AuthModal`, botón flotante)
- Header JSDoc según plantilla (`@usadoPor PaginaInicio`)

**Archivos a crear**: `src/layout/LandingLayout.jsx`

**RF cubiertos**: RF-04, RF-06 (parte)

**Validaciones**:
- `npm run build` → verde ✅
- Compose correctamente los 7 componentes hijos ✅

**Hecho cuando**: `LandingLayout.jsx` existe, compone los 7 componentes, header JSDoc, build verde. ✅

**Dependencias**: T2, T3, T7.

**Resultado**: Pass — `LandingLayout.jsx` existe en `src/layout/`, compone Header, Hero, StatsBar, Features, HowItWorks, CtaSection, Footer (7 componentes), recibe `alAbrirAuth` y `children`, header JSDoc correcto con `@usadoPor PaginaInicio`, `npm run build` verde, `npm test` 98/98 verde.

---

## T9 — Crear DashboardLayout (esqueleto) y AuthLayout ✅

**Descripción**: Crear dos layouts en `src/layout/`:

1. **DashboardLayout.jsx** (esqueleto):
   - Compone: `Header` (`components/layout/`), `Sidebar` (`components/layout/`), `Container` (`components/layout/`), `main{children}`
   - Estructura: `<div className="min-h-screen bg-bg-cream text-bg-dark md:grid md:grid-cols-[240px_minmax(0,1fr)]">` con `Sidebar` en aside, `Header` + `Container` + `main{children}` en área principal
   - Header JSDoc (`@usadoPor PaginaDashboardInicio, PaginaDashboardTransacciones, PaginaDashboardTarjetas, PaginaDashboardConfiguracion`)

2. **AuthLayout.jsx**:
   - Chrome mínimo: centra `children` vertical/horizontal, fondo `bg-bg-dark`, sin Header/Footer
   - Estructura: `<main className="grid min-h-screen place-items-center bg-bg-dark px-5">{children}</main>`
   - Header JSDoc (`@usadoPor PaginaLogin`)

**Archivos a crear**:
- `src/layout/DashboardLayout.jsx`
- `src/layout/AuthLayout.jsx`

**RF cubiertos**: RF-04

**Validaciones**:
- `npm run build` → verde ✅
- `DashboardLayout` usa `Sidebar` (placeholder), `Container`, `Header`, y `Outlet` ✅
- `AuthLayout` centra children sin chrome extra ✅

**Hecho cuando**: Ambos archivos existen con header JSDoc, build verde. ✅

**Dependencias**: T2, T7.

**Resultado**: Pass — Ambos archivos creados con headers JSDoc correctos, `DashboardLayout` compone Header, Sidebar (placeholder), Container y Outlet; `AuthLayout` centra children con `grid min-h-screen place-items-center bg-bg-dark px-5`; `npm run build` verde, `npm test` **98/98 en 12 archivos**.

---

## T10 — Refactorizar PaginaInicio para usar LandingLayout ✅

**Descripción**: Modificar `src/pages/PaginaInicio.jsx`:
- Eliminar imports directos de `Navbar`, `Hero`, `StatsBar`, `Features`, `HowItWorks`, `CtaSection`, `Footer`
- Importar `LandingLayout` desde `../layout/LandingLayout`
- Importar `AuthModal` desde `../components/domain/modales/AuthModal` (ruta actualizada)
- Renderizar `<LandingLayout>` envolviendo `AuthModal` y botón flotante "?" como `children` (o slots si se prefiere; spec dice `children`)
- Actualizar header JSDoc (`@usadoPor App.jsx (ruta /)`, `@funciones` actualizado)

**Archivos a modificar**: `src/pages/PaginaInicio.jsx`

**RF cubiertos**: RF-06, RF-08

**Prueba focalizada**: `npx vitest run src/App.test.jsx` (ruta `/`)

**Validaciones**:
- `npx vitest run src/App.test.jsx` → pass (tests de ruta `/`) ✅
- `npm test` → verde ✅
- `npm run build` → verde ✅
- `grep -r "components/Navbar\|components/Hero\|components/StatsBar\|components/Features\|components/HowItWorks\|components/CtaSection\|components/Footer" src/pages/PaginaInicio.jsx` → sin resultados ✅

**Hecho cuando**: `PaginaInicio` usa `LandingLayout`, imports limpios, header actualizado, tests de ruta `/` pasan, suite completa verde, build verde. ✅

**Dependencias**: T2, T3, T8.

**Resultado**: Pass — `PaginaInicio.jsx` usa `LandingLayout`, imports limpios (solo `LandingLayout` y `AuthModal`), header JSDoc actualizado (`@usadoPor App.jsx (ruta /)`, `@funciones PaginaInicio()`, `@datos/@eventos/@estados` reflejan nuevo uso), tests de ruta `/` pasan (10/10), suite completa **98/98 en 12 archivos**, `npm run build` verde, grep confirma cero referencias a componentes sueltos en `PaginaInicio.jsx`.

---

## T11 — Refactorizar páginas de dashboard para usar DashboardLayout

**Descripción**:
1. **Eliminar** `src/pages/PaginaDashboard.jsx` (layout antiguo)
2. Modificar `src/App.jsx`: cambiar ruta `/dashboard` para usar `DashboardLayout` en lugar de `PaginaDashboard`
3. Modificar `src/pages/PaginaDashboardInicio.jsx`: envolver contenido en `DashboardLayout` (o hacer que `DashboardLayout` use `Outlet` y las páginas sean hijos de ruta; **decisión**: `DashboardLayout` usa `Outlet` para que las subrutas sigan funcionando sin cambios en cada página)
   - Opción A: `DashboardLayout` tiene `<Outlet />` dentro de `Container` → `App.jsx` anida subrutas bajo `/dashboard` con `element={<DashboardLayout />}` (igual que antes con `PaginaDashboard`). Las 4 páginas de sección **no cambian**.
   - Opción B: Cada página importa `DashboardLayout` y envuelve su contenido. **Spec dice**: `PaginaDashboardInicio.jsx` SHALL usar `DashboardLayout` (esqueleto). Para coherencia con `Outlet`, usar Opción A.
4. Actualizar `src/pages/PaginaDashboardInicio.jsx`: header JSDoc (`@usadoPor App.jsx (ruta /dashboard)`)
5. `PaginaDashboardTransacciones`, `PaginaDashboardTarjetas`, `PaginaDashboardConfiguracion` **no cambian** (ya funcionan con Outlet).

**Archivos a modificar/borrar**:
- **Borrar**: `src/pages/PaginaDashboard.jsx`
- **Modificar**: `src/App.jsx` (import `DashboardLayout`, ruta `/dashboard` usa `element={<DashboardLayout />}`), `src/pages/PaginaDashboardInicio.jsx` (header JSDoc)

**RF cubiertos**: RF-04, RF-06, RF-08

**Prueba focalizada**: `npx vitest run src/App.test.jsx` (rutas `/dashboard/*`)

**Validaciones**:
- `npx vitest run src/App.test.jsx` → pass (todas las rutas dashboard)
- `npm test` → verde
- `npm run build` → verde
- `PaginaDashboard.jsx` eliminado
- `App.jsx` importa y usa `DashboardLayout`

**Hecho cuando**: `PaginaDashboard.jsx` borrado, `App.jsx` usa `DashboardLayout` con `Outlet`, subrutas dashboard funcionan, suite completa verde, build verde.

**Dependencias**: T9.

**Resultado**: Pass — `PaginaDashboard.jsx` eliminado, `App.jsx` importa `DashboardLayout` y usa `element={<DashboardLayout />}` en la ruta `/dashboard`, `PaginaDashboardInicio.jsx` actualiza `@usadoPor App.jsx (ruta /dashboard)`, subrutas dashboard funcionan vía `Outlet` en `DashboardLayout` (Opción A), `npx vitest run src/App.test.jsx` **10/10 pass**, `npm test` **98/98 en 12 archivos**, `npm run build` **verde**. RF-04, RF-06, RF-08 cubiertos. Sin commit ni staging.

---

## T12 — Refactorizar 10 usos de glass-card → Card

**Descripción**: Reemplazar exactamente las 10 ocurrencias listadas en la spec (tabla líneas 76-82) por `<Card>`:

| Archivo | Antes | Después |
|---------|-------|---------|
| `PaginaDashboardInicio.jsx` | `<article className="glass-card p-5">` ×3 | `<Card como="article" className="p-5">` |
| `Features.jsx` (ahora en `domain/landing/`) | `<div className="glass-card p-7 sm:p-8 flex flex-col justify-between">` ×5 | `<Card className="p-7 sm:p-8 flex flex-col justify-between">` |
| `PaginaDashboardTransacciones.jsx` | `<div className="glass-card p-6">` | `<Card className="p-6">` |
| `PaginaDashboardConfiguracion.jsx` | `<div className="glass-card p-6">` | `<Card className="p-6">` |

**Archivos a modificar**:
- `src/pages/PaginaDashboardInicio.jsx` (3 ocurrencias)
- `src/components/domain/landing/Features.jsx` (5 ocurrencias)
- `src/pages/PaginaDashboardTransacciones.jsx` (1 ocurrencia)
- `src/pages/PaginaDashboardConfiguracion.jsx` (1 ocurrencia)

**Importar** `Card` desde `../../components/ui/Card` (o ruta relativa correcta según ubicación).

**RF cubiertos**: RF-03, RF-05, RF-07

**Prueba focalizada**: `npx vitest run src/components/ui/Card.test.jsx` (ver T13), `npx vitest run src/components/domain/landing/Features.test.jsx`, `npx vitest run src/App.test.jsx`

**Validaciones**:
- `grep -r "glass-card" src/pages/PaginaDashboardInicio.jsx src/components/domain/landing/Features.jsx src/pages/PaginaDashboardTransacciones.jsx src/pages/PaginaDashboardConfiguracion.jsx` → **0 resultados**
- `grep -r "<Card" src/pages/PaginaDashboardInicio.jsx src/components/domain/landing/Features.jsx src/pages/PaginaDashboardTransacciones.jsx src/pages/PaginaDashboardConfiguracion.jsx` → 10 ocurrencias totales
- `npm test` → verde
- `npm run build` → verde

**Hecho cuando**: 0 `glass-card` en los 4 archivos, 10 `<Card>` correctos, tests pasan, build verde.

**Dependencias**: T6 (Card existe), T3 (Features movido), T10 (PaginaDashboardInicio ya refactorizado), T11 (páginas dashboard en su lugar).

**Resultado**: Pass — 0 `glass-card` en los 4 archivos (grep 0 resultados), 10 `<Card>` correctos (3 en `PaginaDashboardInicio.jsx` con `como="article"`, 5 en `Features.jsx` vía map, 1 en `PaginaDashboardTransacciones.jsx`, 1 en `PaginaDashboardConfiguracion.jsx`), `npm test` **98/98 en 12 archivos** verde, `npm run build` verde. RF-03, RF-05, RF-07 cubiertos.

---

## T13 — Crear y ejecutar tests nuevos/actualizados ✅

**Descripción**: Tests requeridos por la spec:

1. **`src/components/ui/Card.test.jsx`** (nuevo):
   - Renderiza `children`
   - Aplica clase base `.glass-card`
   - Respeta `como="article"` (renderiza `<article>`)
   - Combina `className` pasada

2. **`src/components/layout/Header.test.jsx`** (ya creado en T2, verificar que pasa)

3. **`src/components/domain/landing/Features.test.jsx`** (actualizar):
   - Verificar que renderiza 5 tarjetas vía `Card` (misma clase efectiva `.glass-card` presente en DOM)

4. **`src/layout/LandingLayout.test.jsx`** (nuevo):
   - Compone Header, Hero, StatsBar, Features, HowItWorks, CtaSection, Footer correctamente

5. **`src/App.test.jsx`** (regresión de rutas, ya existe; debe seguir en verde)

**Archivos a crear/modificar**:
- **Crear**: `src/components/ui/Card.test.jsx`, `src/layout/LandingLayout.test.jsx`
- **Modificar**: `src/components/domain/landing/Features.test.jsx` (actualizar aserciones)
- **Eliminar**: `src/components/Features.test.jsx` (duplicado antiguo tras mover componente)

**RF cubiertos**: RF-09, pruebas afectadas (spec líneas 127-133)

**Pruebas focales**:
- `npx vitest run src/components/ui/Card.test.jsx` → pass (4/4)
- `npx vitest run src/components/layout/Header.test.jsx` → pass (2/2)
- `npx vitest run src/components/domain/landing/Features.test.jsx` → pass (1/1)
- `npx vitest run src/layout/LandingLayout.test.jsx` → pass (3/3)
- `npx vitest run src/App.test.jsx` → pass (10/10)

**Validaciones**:
- Cada prueba focalizada → **pass**
- `npm test` → **100% verde** (105/105 tests, 14 archivos)
- `npm run build` → **verde**

**Hecho cuando**: 5 pruebas focales pasan, `npm test` verde completo, `npm run build` verde. ✅

**Dependencias**: T2 (Header.test), T3/T6/T8 (Features, Card, LandingLayout existen), T10/T11/T12 (páginas refactorizadas).

**Resultado**: Pass — 5 pruebas focales pasan (20 tests totales), `npm test` 105/105 verde, `npm run build` verde, archivo duplicado `src/components/Features.test.jsx` eliminado.

---

## T14 — Validación final y limpieza ✅

**Descripción**: Verificaciones finales de integridad:

1. `grep -r "components/Navbar\|components/Footer\|components/Hero\|components/StatsBar\|components/Features\|components/HowItWorks\|components/CtaSection\|components/AuthModal\|components/ModalTarjeta\|components/AcordeonTarjetas\|components/GridTarjetas\|components/MiTarjetaVirtual\|components/LogMovimientos" src/` → **solo rutas nuevas en `domain/` o `layout/`**
2. `grep -r "glass-card" src/pages/PaginaDashboardInicio.jsx src/components/domain/landing/Features.jsx src/pages/PaginaDashboardTransacciones.jsx src/pages/PaginaDashboardConfiguracion.jsx` → **0 resultados**
3. `npm test` → verde (suite completa)
4. `npm run build` → verde
5. Actualizar `MEMORY.md` con resumen de spec 006 completada (estado, validaciones, decisiones)

**Archivos a modificar**: `MEMORY.md` (append al final)

**RF cubiertos**: RF-07, RF-09

**Validaciones**: Todas las anteriores pasan.

**Hecho cuando**: Cero referencias antiguas, 0 `glass-card` en archivos refactorizados, suite completa verde, build verde, `MEMORY.md` actualizado.

**Dependencias**: T13 (tests pasan), T12 (refactor Card completo), T11 (dashboard layout), T10 (landing layout).

**Resultado**: Pass — Validación 1: 0 referencias antiguas (grep sin resultados). Validación 2: 0 `glass-card` en 4 archivos refactorizados. Validación 3: `npm test` **105/105 en 14 archivos** verde. Validación 4: `npm run build` **verde**. Validación 5: `MEMORY.md` actualizado con resumen final de spec 006 (estado FINALIZADA, 4 validaciones pass, decisiones clave, arquitectura entregada, RF-01 a RF-09 cubiertos). Spec 006 completada al 100%.

---

## Resumen de dependencias entre tareas

```
T1
├── T2 (mover Header/Footer + test)
├── T3 (mover landing 5)
├── T4 (mover modales 2)
├── T5 (mover dashboard 4 + fix imports ModalTarjeta)
├── T6 (crear Card)
└── T7 (crear Container, Sidebar)
    ├── T8 (LandingLayout) ← T2, T3, T7
    ├── T9 (DashboardLayout, AuthLayout) ← T2, T7
    │   ├── T10 (PaginaInicio → LandingLayout) ← T2, T3, T8
    │   └── T11 (Dashboard pages → DashboardLayout) ← T9
    │       └── T12 (10 glass-card → Card) ← T6, T3, T10, T11
    │           └── T13 (tests) ← T2, T3, T6, T8, T10, T11, T12
    │               └── T14 (validación final + MEMORY) ← T13, T12, T11, T10
```

**Total**: 14 tareas atómicas.