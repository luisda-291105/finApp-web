# Plan — Spec 006: Capa layout y componentes reutilizables

## 1. Enfoque general

Reorganizar el código en arquitectura atómica/molecular sin cambios visuales ni de comportamiento:

- **src/components/** → átomos/moleculares (UI primitivas, piezas de layout, dominio)
- **src/layout/** → organismos/plantillas que componen desde components/
- **src/pages/** → páginas que usan layouts de src/layout/

El trabajo se ejecuta en una secuencia lógica: crear estructura de carpetas → mover componentes existentes → crear nuevos componentes base (Card, Container, Sidebar, layouts) → refactorizar páginas para usar layouts → refactorizar 10 usos de `glass-card` a `Card` → actualizar/crear tests → validación final.

## 2. Arquitectura y decisiones

### 2.1 Estructura de directorios final

```
src/
├── components/
│   ├── ui/                      # Átomos UI (Button, Input, Badge, Card, Icon…)
│   │   └── Card.jsx
│   ├── layout/                  # Moléculas de layout (Header, Footer, Container, Grid, Stack, Sidebar)
│   │   ├── Header.jsx           # ← Navbar.jsx renombrado
│   │   ├── Footer.jsx           # ← Footer.jsx movido
│   │   ├── Container.jsx        # ← nuevo: <div className="mx-auto max-w-6xl px-4">
│   │   └── Sidebar.jsx          # ← nuevo: <aside> vacío (placeholder)
│   └── domain/                  # UI de dominio financiero
│       ├── landing/
│       │   ├── Hero.jsx
│       │   ├── StatsBar.jsx
│       │   ├── Features.jsx
│       │   ├── HowItWorks.jsx
│       │   └── CtaSection.jsx
│       ├── modales/
│       │   ├── AuthModal.jsx
│       │   └── ModalTarjeta.jsx
│       └── dashboard/
│           ├── AcordeonTarjetas.jsx
│           ├── GridTarjetas.jsx
│           ├── MiTarjetaVirtual.jsx
│           └── LogMovimientos.jsx
├── layout/                      # Organismos/plantillas
│   ├── LandingLayout.jsx        # Header + Hero + StatsBar + Features + HowItWorks + CtaSection + Footer
│   ├── DashboardLayout.jsx      # Header + Sidebar + Container + main{children} (esqueleto)
│   └── AuthLayout.jsx           # Chrome mínimo, centra children, sin Header/Footer
└── pages/
    ├── PaginaInicio.jsx         # Usa LandingLayout
    ├── PaginaLogin.jsx          # Usa AuthLayout (ya funciona; no se toca)
    ├── PaginaDashboard.jsx      # Se elimina: DashboardLayout lo reemplaza
    ├── PaginaDashboardInicio.jsx     # Usa DashboardLayout
    ├── PaginaDashboardTransacciones.jsx  # Usa DashboardLayout (vía Outlet)
    ├── PaginaDashboardTarjetas.jsx       # Usa DashboardLayout (vía Outlet)
    └── PaginaDashboardConfiguracion.jsx  # Usa DashboardLayout (vía Outlet)
```

### 2.2 Decisiones clave confirmadas en la spec

| Decisión | Detalle |
|----------|---------|
| **DashboardLayout** | Esqueleto en `src/layout/`: compone `Header` (de `components/layout/`), `Sidebar` (placeholder), `Container` (wrapper), `main{children}`. La navegación responsive (sidebar desktop + drawer tablet + bottom nav mobile) es spec posterior. |
| **Sidebar** | Placeholder mínimo: `<aside>` vacío en `components/layout/Sidebar.jsx`. |
| **Container** | `components/layout/Container.jsx` → `<div className="mx-auto max-w-6xl px-4">` (clases exactas que ya usan las páginas). |
| **AuthLayout** | En `src/layout/`: chrome mínimo propio, centra `children`, sin Header/Footer. |
| **Card** | `components/ui/Card.jsx`: props `children`, `className`, `como` (string libre, default `"div"`). Aplica solo `.glass-card` + `className`. Sin interacción, sin animación, sin hex. |
| **Features** | En `components/domain/landing/`: usa 5 `<Card>` directas con CSS grid interno; **no** usa `GridTarjetas`. |
| **Nomenclatura** | PascalCase en `components/domain/landing/`, `modales/`, `dashboard/`. |
| **Refactor Card** | Exacto 10 usos (tabla spec líneas 76-82). Fuera: `MiTarjetaVirtual`/`GridTarjetas` (flip 3D), `AcordeonTarjetas` (botón interactivo), `ModalTarjeta` (dialog con focus trap). |
| **Headers JSDOC** | Archivos movidos/tocados (`Features`, `Hero`, `StatsBar`, `HowItWorks`, `CtaSection`, `PaginaInicio`, `PaginaDashboardInicio`) actualizan `@usadoPor` y header según `.agents/file-header-template.md`. Tests exentos. |
| **Tests** | `Navbar.test.jsx` → `Header.test.jsx` (mover a `components/layout/`). `Features.test.jsx` verifica 5 tarjetas vía `Card`. Nuevo `Card.test.jsx`. Nuevo `LandingLayout.test.jsx`. `App.test.jsx` como regresión de rutas. |

### 2.3 Alternativas descartadas

| Alternativa | Motivo de descarte |
|-------------|-------------------|
| Crear `GridTarjetas` genérico en `components/layout/` | Spec dice: Features usa 5 `<Card>` directas con CSS grid interno; no `GridTarjetas`. |
| Migrar hex heredados a tokens | Fuera de alcance (deuda técnica en MEMORY). |
| Extraer modal genérico (`Modal.jsx`) | Fuera de alcance (solo `Card` en esta spec). |
| DashboardLayout completo con responsive | Spec posterior explícita. |
| Cambiar `className` exactas de Container | Deben ser idénticas a lo que ya usan las páginas (`mx-auto max-w-6xl px-4`). |

## 3. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Romper imports al mover/renombrar 11 componentes | Alto | Mover en bloque con `git mv` (o copiar+borrar), luego `grep -r` para verificar ausencia de referencias antiguas; actualizar imports en cascada: componentes → layouts → páginas. |
| `Navbar.test.jsx` falla tras renombrar/mover | Medio | Renombrar test a `Header.test.jsx` en mismo commit, actualizar `describe` e import. |
| `Features.test.jsx` espera clases `glass-card` directas | Medio | Actualizar test para verificar que renderiza 5 `<Card>` con la clase efectiva (no comprobar implementación interna). |
| `PaginaDashboard.jsx` actual elimina tras crear `DashboardLayout` | Medio | Crear `DashboardLayout` primero, cambiar `App.jsx` a usarlo, luego borrar `PaginaDashboard.jsx`. |
| `className` conflictivas en `Card` (p.ej. padding duplicado) | Bajo | Spec: `className` vacío → solo clase base; sin padding por defecto. Consumidor controla todo. |
| `como="article"` no respetado en `Card` | Bajo | Implementar `const Tag = como; return <Tag className={...}>{children}</Tag>`. |
| Suite de tests no pasa tras refactor | Alto | Ejecutar `npm test` tras cada tarea atómica; corregir antes de avanzar. |

## 4. Criterios de aceptación (definición de "hecho")

1. **Estructura**: Existen `src/components/ui/`, `src/components/layout/`, `src/components/domain/{landing,modales,dashboard}/`, `src/layout/`.
2. **Componentes movidos/renombrados**: `Header.jsx`, `Footer.jsx` en `components/layout/`; 5 landing + 2 modales + 4 dashboard en `components/domain/` con nombres PascalCase.
3. **Nuevos componentes**: `Card.jsx`, `Container.jsx`, `Sidebar.jsx`, `LandingLayout.jsx`, `DashboardLayout.jsx`, `AuthLayout.jsx` con headers JSDoc correctos.
4. **Páginas refactorizadas**: `PaginaInicio` usa `LandingLayout`; `PaginaDashboardInicio` usa `DashboardLayout`; rutas dashboard siguen funcionando vía `Outlet` en `DashboardLayout`.
5. **Refactor Card**: 10 ocurrencias exactas de `glass-card` → `Card` (tabla spec); cero referencias a `glass-card` en los 4 archivos afectados.
6. **Tests**: `Header.test.jsx` (ex-`Navbar.test.jsx`) pasa; `Features.test.jsx` verifica 5 `<Card>`; nuevo `Card.test.jsx` pasa; nuevo `LandingLayout.test.jsx` pasa; `npm test` **100% verde**; `npm run build` en verde.
7. **Sin regresiones visuales/comportamiento**: Mismos textos, clases efectivas, rutas, semántica de accesibilidad.
8. **MEMORY.md** actualizado al cierre.

## 5. Validaciones por tarea

Cada tarea incluye:
- Prueba focalizada (`npx vitest run <archivo>`)
- `npm test` completo
- `npm run build`
- `grep` de verificación donde corresponda (imports rotos, referencias antiguas)

La validación visual en navegador **no se realiza** (sin cambios visuales; sin navegador disponible en el entorno).