# Spec 006 — Capa layout y componentes reutilizables (Arquitectura Atómica/Molecular)

**Estado: borrador**

## Contexto

Tras la spec 005, el proyecto tiene `src/pages/` (páginas), `src/components/` (piezas reutilizables) y rutas en `src/App.jsx`. Sin embargo, `src/components/` mezcla piezas de distinta granularidad y no existe un patrón reutilizable de tarjeta: el marcado `glass-card` está duplicado en 10 vistas.

El usuario ha decidido adoptar **arquitectura atómica/molecular**:

- `src/components/` = **capa atómica/molecular** (piezas pequeñas, reutilizables, agnósticas de dominio)
- `src/layout/` = **capa de organismos/plantillas** (componen diseños completos desde `components/`)
- `src/pages/` = páginas que usan layouts de `src/layout/`

La navegación responsive del dashboard (`DashboardLayout`: sidebar desktop + drawer tablet + bottom nav mobile) queda **expresamente fuera de alcance** y será una spec posterior.

## Objetivo

Reorganizar el código en arquitectura atómica/molecular y crear un componente `Card` reutilizable, **sin cambios visuales ni de comportamiento**:

```
src/
├── components/                    # Átomos y moléculas
│   ├── ui/                        # Primitivas UI (Button, Input, Badge, Card, Icon...)
│   ├── layout/                    # Piezas de layout (Header, Footer, Container, Grid, Stack, Sidebar)
│   └── domain/                    # UI de dominio financiero (MiTarjetaVirtual, AcordeonTarjetas, LogMovimientos...)
├── layout/                        # Organismos/plantillas que COMPONEN desde components/
│   ├── LandingLayout.jsx          # Header + Hero + Features + HowItWorks + CtaSection + Footer
│   ├── DashboardLayout.jsx        # Header + Sidebar + Container + áreas de contenido (spec posterior)
│   └── AuthLayout.jsx             # Estructura genérica para login/registro
└── pages/                         # Páginas que usan layouts
    ├── PaginaInicio.jsx           # Usa LandingLayout
    ├── PaginaDashboardInicio.jsx  # Usa DashboardLayout
    └── ...
```

---

## Inventario de componentes y destino

| Componente actual | Destino | Tipo | Justificación |
|---|---|---|---|
| `src/components/Navbar.jsx` | `src/components/layout/Header.jsx` (renombrado) | Molécula layout | Pieza de chrome reutilizable |
| `src/components/Footer.jsx` | `src/components/layout/Footer.jsx` | Molécula layout | Pieza de chrome reutilizable |
| `src/components/ui/Card.jsx` (nuevo) | `src/components/ui/Card.jsx` | Átomo UI | Patrón base `.glass-card` unificado |
| `Hero.jsx`, `StatsBar.jsx`, `Features.jsx`, `HowItWorks.jsx`, `CtaSection.jsx` | `src/components/domain/landing/` | Moléculas dominio | Contenido específico de landing |
| `AuthModal.jsx`, `ModalTarjeta.jsx` | `src/components/domain/modales/` | Moléculas dominio | Modales de dominio |
| `AcordeonTarjetas.jsx`, `GridTarjetas.jsx`, `MiTarjetaVirtual.jsx`, `LogMovimientos.jsx` | `src/components/domain/dashboard/` | Moléculas dominio | UI financiera del dashboard |
| `src/layout/LandingLayout.jsx` (nuevo) | `src/layout/LandingLayout.jsx` | Organismo | Compone Header, Hero, Features, Footer... |
| `src/layout/DashboardLayout.jsx` (nuevo, esqueleto) | `src/layout/DashboardLayout.jsx` | Organismo | Compone Header, Sidebar, Container... (solo estructura base) |
| `src/layout/AuthLayout.jsx` (nuevo) | `src/layout/AuthLayout.jsx` | Organismo | Estructura genérica auth |

**Nota**: `DashboardLayout` completo (sidebar responsive, drawer, bottom nav) es spec posterior. Aquí solo se crea el esqueleto compositivo.

---

## Componente Card — API (átomo en `components/ui/`)

`src/components/ui/Card.jsx`: envoltorio presentacional que aplica la superficie `.glass-card` (definida en `src/styles/index.css`) y delega el contenido en `children`.

Props (en español, siguiendo convenciones del proyecto):

| Prop | Tipo | Obligatoria | Por defecto | Descripción |
|---|---|---|---|---|
| `children` | node | sí | — | Contenido interno de la tarjeta |
| `className` | string | no | `""` | Clases adicionales (padding, layout flex, etc.) |
| `como` | string o componente | no | `"div"` | Elemento a renderizar (`"article"`, `"section"`, etc.) |

Restricciones (igual que spec original):
- **No** gestiona interacción (no `onClick`); quien necesite tarjeta interactiva envuelve sus listeners.
- **No** añade hexadecimales ni colores: solo `.glass-card` + `className`.
- **No** introduce animación ni `useReveal`; scroll-reveal vive en consumidores.

### Refactor hacia Card (alcance exacto, 10 usos)

| Archivo | Antes | Después |
|---------|-------|---------|
| `PaginaDashboardInicio.jsx` | `<article className="glass-card p-5">` ×3 | `<Card como="article" className="p-5">` |
| `Features.jsx` | `<div className="glass-card p-7 sm:p-8 flex flex-col justify-between">` ×5 | `<Card className="p-7 sm:p-8 flex flex-col justify-between">` |
| `PaginaDashboardTransacciones.jsx` | `<div className="glass-card p-6">` | `<Card className="p-6">` |
| `PaginaDashboardConfiguracion.jsx` | `<div className="glass-card p-6">` | `<Card className="p-6">` |

**Fuera del refactor** (mismo criterio que spec original):
- `MiTarjetaVirtual` / `GridTarjetas`: flip 3D, temas, lógica propia
- `AcordeonTarjetas`: botón interactivo con `glass-card`
- `ModalTarjeta`: dialog con focus trap, `AnimatePresence`
- Secciones landing que no usan `glass-card`

---

## Requisitos funcionales (EARS)

- **RF-01**: Ubicuo — El sistema SHALL proporcionar `src/components/` con subdirectorios `ui/`, `layout/`, `domain/` (este último con subcarpetas `landing/`, `modales/`, `dashboard/`).
- **RF-02**: Ubicuo — El sistema SHALL ubicar `Header.jsx` y `Footer.jsx` en `src/components/layout/` (renombrados desde `Navbar`/`Footer` en `components/` raíz).
- **RF-03**: Ubicuo — El sistema SHALL proporcionar `Card` en `src/components/ui/Card.jsx` con props `children`, `className`, `como`, aplicando `.glass-card` base y renderizando `<div>` por defecto.
- **RF-04**: Ubicuo — El sistema SHALL proporcionar `src/layout/` con `LandingLayout.jsx`, `DashboardLayout.jsx` (esqueleto), `AuthLayout.jsx` que **componen** desde `components/`.
- **RF-05**: Evento — Cuando `PaginaDashboardInicio` y `Features` renderizan tarjetas, el sistema SHALL componerlas con `Card` de `components/ui` en lugar de repetir `glass-card`.
- **RF-06**: Evento — `PaginaInicio.jsx` SHALL usar `LandingLayout` en lugar de importar secciones sueltas; `PaginaDashboardInicio.jsx` SHALL usar `DashboardLayout` (esqueleto).
- **RF-07**: Ubicuo — La reorganización SHALL preservar comportamiento y apariencia: mismos textos, clases efectivas, rutas, semántica de accesibilidad.
- **RF-08**: Ubicuo — Al mover componentes, el sistema SHALL actualizar imports, anotaciones `@usadoPor` y headers JSDoc (tests exentos). Archivos tocados (`Features`, `Hero`, `StatsBar`, `HowItWorks`, `CtaSection`, `PaginaInicio`, `PaginaDashboardInicio`) SHALL corregir su header JSDoc.
- **RF-09**: Ubicuo — Cada tarea SHALL validarse con prueba focalizada, `npm test` completo y `npm run build` en verde; actualización de `MEMORY.md` al cierre.

---

## Casos límite

- `Navbar.jsx` → `Header.jsx` en `components/layout/`: actualizar import en `PaginaInicio.jsx` (y futuro `LandingLayout`), renombrar `Navbar.test.jsx` → `Header.test.jsx` y mover a `components/layout/`.
- Verificar con grep que no quede referencia a `Navbar` ni `components/Navbar` ni `components/Footer` en `src/`.
- `Footer.jsx` no tiene test propio; no se crea cobertura nueva.
- `Card` con `como="article"` conserva semántica de `PaginaDashboardInicio`.
- En `Features`, clases `p-7 sm:p-8 flex flex-col justify-between` pasan por `className`; hex heredados se conservan (deuda técnica).
- `className` vacío → solo clase base; sin padding por defecto ni clases conflictivas.
- Renombrado no debe romper `App.test.jsx` ni tests de `PaginaInicio`.

---

## Fuera de alcance

- **Navegación responsive completa del dashboard** (`DashboardLayout` con sidebar desktop + drawer tablet + bottom nav mobile): spec posterior.
- Migración de hexadecimales heredados a tokens (deuda técnica en MEMORY).
- Extracción de otros patrones (modales genéricos, secciones, grids): solo `Card`.
- Cobertura de test nueva para `Footer`.
- Cualquier cambio visual o de comportamiento observable.

---

## Pruebas afectadas

- `src/components/Navbar.test.jsx` → `src/components/layout/Header.test.jsx` (movido; actualizar import y describe).
- `src/components/Features.test.jsx`: actualizar para verificar grid renderiza 5 tarjetas vía `Card` (misma clase efectiva).
- Tests de `PaginaDashboardInicio` (vía `App.test.jsx`): deben seguir en verde tras refactor a `Card`.
- Nueva prueba focalizada `src/components/ui/Card.test.jsx`: renderiza `children`, aplica clase base, respeta `como="article"`, combina `className`.
- `src/App.test.jsx` y suite completa (`npm test`) como regresión de rutas.
- Prueba focalizada `src/layout/LandingLayout.test.jsx`: compone Header, Hero, Features, Footer correctamente.