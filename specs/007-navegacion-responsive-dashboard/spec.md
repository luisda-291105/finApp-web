# Spec 007 — Navegación Responsive Dashboard

**Estado: borrador**

## Contexto

Tras la **spec 006**, el proyecto tiene arquitectura atómica/molecular consolidada:

- `src/components/ui/` — Átomos (Button, Input, Card, Icon...)
- `src/components/layout/` — Moléculas de layout (Header, Footer, Container, **Sidebar**)
- `src/components/domain/` — UI de dominio (landing/, modales/, dashboard/)
- `src/layout/` — Organismos/plantillas que componen desde `components/`
  - `DashboardLayout.jsx` (esqueleto actual: Sidebar + Container + Outlet)
- `src/pages/` — Páginas que usan layouts

La **spec 006 dejó expresamente fuera de alcance** la navegación responsive completa del dashboard. Esta spec la aborda.

Estado actual relevante:
- `src/layout/DashboardLayout.jsx`: usa `<Sidebar />` solo en desktop (`hidden md:block`), sin Header, sin drawer, sin bottom nav.
- `src/components/layout/Sidebar.jsx`: navegación básica 4 enlaces, fondo blanco (`bg-white`), sin toggle colapso, sin logout, sin usuario.
- `src/components/layout/Header.jsx`: tiene prop `modo="landing" | "dashboard"` con placeholder de usuario; preparado para modo dashboard.
- `TRIAL_ACTIVO = true` en `app.config.js`: dashboard accesible sin login real.
- Tokens Fluid Glass en `src/styles/index.css`: `bg-bg-dark`, `backdrop-blur`, `glass-hero`, `glass-card`.

## Objetivo

Implementar navegación responsive **completa** del dashboard con tres breakpoints, respetando Fluid Glass y arquitectura actual. El logout y el perfil de usuario se gestionan mediante **avatar + modal** (`DashboardUserModal`) en todos los breakpoints, no mediante menú nativo ni links directos.

```
Desktop (≥1024px / md):  Sidebar fija colapsable (240px expandida / 72px colapsada)
                         Logo toggle expande/colapsa, fondo bg-bg-dark/80 backdrop-blur
                         Avatar al fondo → click abre DashboardUserModal
                         Modal: "Configuración" → /dashboard/configuracion, "Cerrar sesión" → /

Tablet (640px–1023px / sm–md): Drawer lateral slide-in (overlay + backdrop)
                         Mismo contenido que sidebar expandida (avatar → modal)
                         Se abre desde botón hamburguesa en Header

Mobile (<640px / sm):    Bottom navigation bar (5 iconos + etiqueta)
                         Fijo en bottom, bg-bg-dark/80 backdrop-blur
                         5º item "Menú" abre drawer con avatar → modal
                         Logout y perfil dentro del modal, no en bottom nav
```

**Alcance exacto — componentes a crear/modificar:**

| Componente | Ubicación | Tipo | Descripción |
|---|---|---|---|
| `SidebarResponsive` | `src/components/layout/` | Molécula | Sidebar desktop colapsable (reemplaza `Sidebar.jsx` actual) |
| `DashboardDrawer` | `src/components/layout/` | Molécula | Drawer tablet slide-in (overlay, portal, focus trap) |
| `BottomNav` | `src/components/layout/` | Molécula | Barra inferior mobile (5 items) |
| `useBreakpoint` | `src/hooks/` | Hook | Hook unificado de breakpoints (reutiliza lógica `useReveal`/media queries) |
| `Header` (modo dashboard) | `src/components/layout/Header.jsx` | Molécula | Extender para botón hamburguesa + avatar/menú usuario |
| `DashboardLayout` | `src/layout/DashboardLayout.jsx` | Organismo | Componer todo: Header + SidebarResponsive + DashboardDrawer + BottomNav + Container + Outlet |

**No se toca**: páginas de dashboard (`PaginaDashboard*`), `Container`, `app.config.js`, `api.config.js`.

---

## Inventario de componentes y destino

| Componente actual | Destino | Tipo | Justificación |
|---|---|---|---|
| `src/components/layout/Sidebar.jsx` | `src/components/layout/SidebarResponsive.jsx` (nuevo, reemplaza) | Molécula layout | Sidebar desktop colapsable con logo toggle, fondo dark glass, avatar → modal |
| (nuevo) | `src/components/layout/DashboardDrawer.jsx` | Molécula layout | Drawer tablet reutilizable (slide-in, overlay, focus trap, portal) |
| (nuevo) | `src/components/layout/BottomNav.jsx` | Molécula layout | Bottom bar mobile fija, 5 iconos + labels, safe-area-inset |
| (nuevo) | `src/components/layout/DashboardUserModal.jsx` | Molécula layout | Modal usuario (portal, overlay, focus trap, ESC): Configuración + Cerrar sesión |
| (nuevo) | `src/hooks/useBreakpoint.js` | Hook | Breakpoints unificados (`isMobile`, `isTablet`, `isDesktop`, `sidebarCollapsed`) |
| `src/components/layout/Header.jsx` | `src/components/layout/Header.jsx` (extendido) | Molécula layout | Añadir `modo="dashboard"`: hamburguesa tablet, avatar → modal, toggle sidebar |
| `src/layout/DashboardLayout.jsx` | `src/layout/DashboardLayout.jsx` (completo) | Organismo | Componer Header + SidebarResponsive + DashboardDrawer + BottomNav + DashboardUserModal + Container + Outlet |

---

## API de componentes (contrato)

### `SidebarResponsive` (`src/components/layout/SidebarResponsive.jsx`)

```jsx
/**
 * @uso        Sidebar desktop colapsable con navegación, logo toggle, usuario y logout
 * @funciones  SidebarResponsive({ colapsada, alToggleColapso, alCerrarDrawer })
 * @datos      enlaces fijos (4), usuario desde contexto/auth (futuro), logout action
 * @eventos    click en enlaces, click en logo toggle, click en logout
 * @estados    colapsada (boolean, controlada desde padre via useBreakpoint)
 * @usadoPor   DashboardLayout
 */
```

**Props:**

| Prop | Tipo | Obligatoria | Por defecto | Descripción |
|---|---|---|---|---|
| `colapsada` | boolean | sí | — | Estado colapsado (icons only) |
| `alToggleColapso` | function | sí | — | Callback `() => void` al click logo |
| `alAbrirUserModal` | function | sí | — | Callback `() => void` al click avatar |
| `alCerrarDrawer` | function | no | `() => {}` | Callback para cerrar drawer en tablet (si se usa compartido) |

**Estructura visual (desktop):**
- `aside` fijo: `fixed left-0 top-0 h-full z-40 transition-all duration-300`
- Ancho: `w-64` expandida / `w-[72px]` colapsada
- Fondo: `bg-bg-dark/80 backdrop-blur-md border-r border-border-line/20`
- Logo toggle: click en área logo → `alToggleColapso()`
  - Expandida: "FinApp" completo + chevron left
  - Colapsada: solo icono "F" + chevron right
- Navegación: 4 `NavLink` con icono + etiqueta (etiqueta oculta si colapsada)
- Usuario (parte inferior): avatar/iniciales → click abre `DashboardUserModal` (via `alAbrirUserModal`)
- Sin botón logout en sidebar (va dentro del modal)

**Accesibilidad:**
- `role="navigation" aria-label="Navegación principal del dashboard"`
- Focus visible con tokens `color-mix(var(--color-mint-accent)...)`
- `aria-expanded` en logo toggle
- Tooltip nativo (`title`) en iconos cuando colapsada

---

### `DashboardDrawer` (`src/components/layout/DashboardDrawer.jsx`)

```jsx
/**
 * @uso        Drawer lateral slide-in para tablet (overlay + backdrop + focus trap)
 * @funciones  DashboardDrawer({ abierto, alCerrar, children })
 * @datos      Recibe children (navegación idéntica a Sidebar expandida)
 * @eventos    click en overlay, ESC, click en enlaces → alCerrar
 * @estados    abierto (controlado desde padre)
 * @usadoPor   DashboardLayout (condicional tablet)
 */
```

**Props:**

| Prop | Tipo | Obligatoria | Por defecto | Descripción |
|---|---|---|---|---|
| `abierto` | boolean | sí | — | Visibilidad del drawer |
| `alCerrar` | function | sí | — | Callback `() => void` |
| `children` | node | sí | — | Contenido (navegación, usuario, logout) |

**Comportamiento:**
- Portal en `document.body` (`createPortal`)
- Overlay: `fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-40` + click → `alCerrar`
- Panel: `fixed left-0 top-0 h-full w-72 bg-bg-dark/95 backdrop-blur-md border-r border-border-line/20 z-50 transform transition-transform duration-300 ease-out`
  - Abierto: `translate-x-0`
  - Cerrado: `-translate-x-full`
- Focus trap: al abrir, foco en primer enlace; Tab cicla dentro; ESC → `alCerrar`
- Al cerrar, devuelve foco al botón hamburguesa en Header

**Contenido (children recomendado):**
- Mismo array `enlaces` que SidebarResponsive
- Usuario (avatar/iniciales) → click abre `DashboardUserModal` (via `alAbrirUserModal`)
- Sin botón logout (va dentro del modal)

---

### `BottomNav` (`src/components/layout/BottomNav.jsx`)

```jsx
/**
 * @uso        Barra de navegación inferior fija para mobile (5 items)
 * @funciones  BottomNav({ itemActivo, alNavegar })
 * @datos      5 items fijos: Inicio, Transacciones, Tarjetas, Configuración, Menú (⋮)
 * @eventos    click en item → alNavegar(ruta)
 * @estados    itemActivo (string ruta)
 * @usadoPor   DashboardLayout (condicional mobile)
 */
```

**Props:**

| Prop | Tipo | Obligatoria | Por defecto | Descripción |
|---|---|---|---|---|
| `itemActivo` | string | sí | — | Ruta activa (`/dashboard`, `/dashboard/transacciones`, ...) |
| `alNavegar` | function | sí | — | Callback `(ruta: string) => void` |

**Items (orden fijo):**

| Ruta | Etiqueta | Icono (lucide-react) | Notas |
|---|---|---|---|
| `/dashboard` | Inicio | `Home` | Índice |
| `/dashboard/transacciones` | Transacciones | `Receipt` | |
| `/dashboard/tarjetas` | Tarjetas | `CreditCard` | |
| `/dashboard/configuracion` | Configuración | `Settings` | Usuario/perfil aquí |
| (acción) | Menú | `MoreHorizontal` | Abre `DashboardDrawer` en mobile (ver más abajo) |

**Estilo:**
- `fixed bottom-0 left-0 right-0 z-50 bg-bg-dark/80 backdrop-blur-md border-t border-border-line/20`
- `safe-area-inset-bottom` (env-safe)
- Grid `grid grid-cols-5` items equidistantes
- Item: `flex flex-col items-center gap-1 px-2 py-2`
  - Icono `w-6 h-6`
  - Etiqueta `text-xs font-medium` (oculta en landscape opcional)
- Activo: `text-emerald-primary` + indicador superior `absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-primary rounded-full`
- Inactivo: `text-slate-text hover:text-emerald-primary/70`

**Nota mobile:** El 5º item "Menú" abre `DashboardDrawer` (reutilizado) para avatar → modal. Ver `DashboardLayout` composición.

---

### `DashboardUserModal` (`src/components/layout/DashboardUserModal.jsx`)

```jsx
/**
 * @uso        Modal de usuario (portal) con slots: Configuración + Cerrar sesión
 * @funciones  DashboardUserModal({ abierto, alCerrar, children })
 * @datos      Slots por defecto: header "Cuenta", auth (vacío), profile → Configuración, logout → redirect /
 * @eventos    click overlay, ESC → alCerrar; click slots → navegación + alCerrar
 * @estados    abierto (controlado desde padre DashboardLayout)
 * @usadoPor   DashboardLayout (global, portal)
 */
```

**Props:**

| Prop | Tipo | Obligatoria | Por defecto | Descripción |
|---|---|---|---|---|
| `abierto` | boolean | sí | — | Visibilidad del modal |
| `alCerrar` | function | sí | — | Callback `() => void` |
| `children` | node | no | slots por defecto | Slots personalizables (header, auth, profile, logout) |

**Comportamiento:**
- Portal en `document.body` (`createPortal`)
- Overlay: `fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-50` + click → `alCerrar`
- Panel: `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-bg-cream/95 backdrop-blur-md border border-border-line/30 rounded-2xl shadow-xl z-60`
- Focus trap: al abrir, foco en primer elemento accionable; Tab cicla dentro; ESC → `alCerrar`
- Al cerrar, devuelve foco al avatar que lo abrió (Header o Sidebar)
- Animación entrada/salida: `transition-opacity duration-200` + `scale-95` a `scale-100`

**Slots por defecto (si no se pasan `children`):**
- Header: "Cuenta"
- Auth: (vacío — preparado para futuro contexto real)
- Profile: botón "Configuración" → `navigate('/dashboard/configuracion')` + `alCerrar()`
- Logout: botón "Cerrar sesión" → `navigate('/', { replace: true })` + `alCerrar()` (en trial: redirect a `/`)

**Accesibilidad:**
- `role="dialog" aria-modal="true" aria-labelledby="user-modal-title"`
- Focus trap completo, `aria-describedby` para descripción opcional
- Focus visible con tokens `color-mix(var(--color-mint-accent)...)`

---

### `useBreakpoint` (`src/hooks/useBreakpoint.js`)

```jsx
/**
 * @uso        Hook unificado de breakpoints y estado sidebar para navegación responsive
 * @funciones  useBreakpoint() → { isMobile, isTablet, isDesktop, sidebarColapsada, toggleSidebar }
 * @datos      Usa matchMedia listeners (cleanup en unmount)
 * @eventos    resize, change en media queries
 * @estados    sidebarColapsada (persistida en localStorage 'sidebarCollapsed')
 * @usadoPor   DashboardLayout, Header (modo dashboard)
 */
```

**Retorno:**

| Prop | Tipo | Descripción |
|---|---|---|
| `isMobile` | boolean | `<640px` (Tailwind `sm`) |
| `isTablet` | boolean | `640px–1023px` (`sm` ≤ x < `md`) |
| `isDesktop` | boolean | `≥1024px` (`md`+) |
| `sidebarColapsada` | boolean | Estado colapsado (persistido) |
| `toggleSidebar` | function | `() => void` alterna `sidebarColapsada` |

**Breakpoints (alineados con Tailwind v4 `@theme`):**
- `sm`: 640px
- `md`: 1024px
- `lg`: 1280px (no usado directamente)

**Persistencia:** `localStorage.setItem('sidebarCollapsed', JSON.stringify(valor))` + lectura inicial. SSR-safe: valor por defecto `false` hasta hidratación.

---

### `Header` — modo dashboard (extensión de `src/components/layout/Header.jsx`)

**Props existentes:** `alAbrirAuth`, `modo='landing' | 'dashboard'`

**Nuevas props (modo dashboard):**

| Prop | Tipo | Obligatoria | Descripción |
|---|---|---|---|
| `alAbrirDrawer` | function | sí (tablet) | `() => void` abre `DashboardDrawer` |
| `alToggleSidebar` | function | sí (desktop) | `() => void` alterna colapso sidebar |
| `sidebarColapsada` | boolean | sí (desktop) | Para mostrar chevron correcto |
| `usuario` | object | no | `{ nombre, iniciales, email? }` — futuro auth real |
| `alAbrirUserModal` | function | sí | `() => void` abre `DashboardUserModal` al click avatar |

**Comportamiento modo dashboard:**
- Fondo: siempre `bg-bg-cream/92 backdrop-blur-md border-b border-border-line py-3.5 shadow-sm` (sin transición scroll)
- Izquierda:
  - Desktop: logo "FinApp" (link a `/dashboard`) + botón toggle sidebar (chevron left/right) — solo si `!isMobile`
  - Tablet: botón hamburguesa → `alAbrirDrawer()` — solo si `isTablet`
  - Mobile: nada (logo en bottom nav o drawer)
- Derecha: avatar/iniciales usuario → click abre `DashboardUserModal` (`alAbrirUserModal()`)
  - Modal slots por defecto:
    - "Configuración" → `/dashboard/configuracion`
    - "Cerrar sesión" → redirect `/`

**Nota:** `Header` no gestiona breakpoints; los recibe vía props desde `DashboardLayout` que usa `useBreakpoint`.

---

### `DashboardLayout` (`src/layout/DashboardLayout.jsx` — completo)

```jsx
/**
 * @uso        Layout completo del dashboard: Header + navegación responsive + contenido
 * @funciones  DashboardLayout({ children })
 * @datos      Usa useBreakpoint, compone Header, SidebarResponsive, DashboardDrawer, BottomNav, Container, Outlet
 * @eventos    Coordina estado colapso, drawer, navegación
 * @estados    Ninguno propio (delega en hooks/componentes)
 * @usadoPor   App.jsx (ruta /dashboard/*)
 */
```

**Composición (pseudocódigo):**

```jsx
const { isMobile, isTablet, isDesktop, sidebarColapsada, toggleSidebar } = useBreakpoint();
const [drawerAbierto, setDrawerAbierto] = useState(false);
const [mobileMenuAbierto, setMobileMenuAbierto] = useState(false);
const [userModalAbierto, setUserModalAbierto] = useState(false);

const alAbrirUserModal = () => setUserModalAbierto(true);
const alCerrarUserModal = () => setUserModalAbierto(false);

return (
  <>
    {/* Header: siempre renderizado, adapta contenido según breakpoint */}
    <Header
      modo="dashboard"
      alAbrirDrawer={isTablet ? () => setDrawerAbierto(true) : undefined}
      alToggleSidebar={isDesktop ? toggleSidebar : undefined}
      sidebarColapsada={isDesktop ? sidebarColapsada : false}
      usuario={/* TODO: contexto auth futuro */}
      alAbrirUserModal={alAbrirUserModal}
    />

    {/* Desktop: Sidebar fija colapsable */}
    {isDesktop && (
      <SidebarResponsive
        colapsada={sidebarColapsada}
        alToggleColapso={toggleSidebar}
        alAbrirUserModal={alAbrirUserModal}
      />
    )}

    {/* Tablet: Drawer (portal) */}
    {isTablet && (
      <DashboardDrawer
        abierto={drawerAbierto}
        alCerrar={() => setDrawerAbierto(false)}
      >
        <SidebarNavContenido alAbrirUserModal={alAbrirUserModal} />
      </DashboardDrawer>
    )}

    {/* Área principal: margin-left condicional para sidebar desktop */}
    <div className={cn(
      "min-h-screen bg-bg-cream transition-all duration-300",
      isDesktop && sidebarColapsada ? "md:ml-[72px]" : "md:ml-64",
      !isDesktop && "ml-0"
    )}>
      <Container>
        <main className={cn(
          "pb-20",           // espacio bottom nav mobile
          isDesktop && "pt-16", // espacio header fijo
          !isDesktop && "pt-16"
        )}>
          <Outlet />
        </main>
      </Container>
    </div>

    {/* Mobile: BottomNav fija */}
    {isMobile && (
      <BottomNav
        itemActivo={location.pathname}
        alNavegar={(ruta) => navigate(ruta)}
        alAbrirMenu={() => setMobileMenuAbierto(true)}
      />
    )}

    {/* Mobile: Drawer para menú (5º item bottom nav) */}
    {isMobile && (
      <DashboardDrawer
        abierto={mobileMenuAbierto}
        alCerrar={() => setMobileMenuAbierto(false)}
      >
        <SidebarNavContenido alAbrirUserModal={alAbrirUserModal} />
      </DashboardDrawer>
    )}

    {/* Global: DashboardUserModal (portal) - siempre al final para z-index */}
    <DashboardUserModal
      abierto={userModalAbierto}
      alCerrar={alCerrarUserModal}
    >
      {/* Slots por defecto inyectados por el modal */}
    </DashboardUserModal>
  </>
);
```

**Notas de implementación:**
- `SidebarNavContenido` = componente interno (o extraído a `components/layout/SidebarNavContenido.jsx`) con los 4 enlaces + usuario + logout, reutilizado por SidebarResponsive (expandida), DashboardDrawer (tablet), y mobile drawer.
- `navigate` de `useNavigate` para `BottomNav.alNavegar`.
- `location` de `useLocation` para `itemActivo`.
- `cn` = `clsx` o similar (ya en proyecto o añadir).

---

## Requisitos funcionales (EARS)

- **RF-01**: Ubicuo — El sistema SHALL proporcionar `SidebarResponsive` en `src/components/layout/` con props `colapsada`, `alToggleColapso`, `alAbrirUserModal`, aplicando fondo `bg-bg-dark/80 backdrop-blur-md`, logo toggle, 4 enlaces con iconos, avatar al fondo → click abre `DashboardUserModal`, sin botón logout.
- **RF-02**: Ubicuo — El sistema SHALL proporcionar `DashboardDrawer` en `src/components/layout/` con props `abierto`, `alCerrar`, `children`, usando portal, overlay con backdrop-blur, panel slide-in, focus trap, ESC para cerrar, devolución de foco.
- **RF-03**: Ubicuo — El sistema SHALL proporcionar `BottomNav` en `src/components/layout/` con props `itemActivo`, `alNavegar`, `alAbrirMenu`, 5 items fijos (Inicio, Transacciones, Tarjetas, Configuración, Menú), fondo `bg-bg-dark/80 backdrop-blur-md`, safe-area-inset, indicador activo superior.
- **RF-04**: Ubicuo — El sistema SHALL proporcionar `useBreakpoint` en `src/hooks/` retornando `isMobile`, `isTablet`, `isDesktop`, `sidebarColapsada`, `toggleSidebar` con persistencia `localStorage` y listeners `matchMedia` limpios.
- **RF-05**: Evento — Cuando `Header` recibe `modo="dashboard"`, el sistema SHALL renderizar: logo + toggle sidebar (desktop), hamburguesa (tablet), avatar → click abre `DashboardUserModal` con slots "Configuración" → `/dashboard/configuracion` y "Cerrar sesión" → `/`, sin transición de scroll.
- **RF-06**: Evento — Cuando `DashboardLayout` se monta, el sistema SHALL componer: Header + (SidebarResponsive si desktop) + (DashboardDrawer si tablet/mobile) + Container + Outlet + (BottomNav si mobile) + `DashboardUserModal` global (portal), con márgenes y padding correctos por breakpoint.
- **RF-07**: Ubicuo — La navegación SHALL mantener accesibilidad: roles ARIA, focus visible con tokens mint/emerald, focus trap en drawer y modal, orden Tab lógico, tooltips en iconos colapsados, `aria-expanded` en toggles.
- **RF-08**: Ubicuo — El sistema SHALL usar tokens de `src/styles/index.css` (`bg-bg-dark`, `bg-bg-cream`, `border-border-line`, `emerald-primary`, `mint-accent`, `slate-text`) y **no** introducir hexadecimales nuevos en JSX/JS.
- **RF-09**: Ubicuo — Los componentes nuevos (`SidebarResponsive`, `DashboardDrawer`, `BottomNav`, `DashboardUserModal`, `useBreakpoint`) SHALL incluir header JSDoc con `@uso`, `@funciones`, `@datos`, `@eventos`, `@estados`, `@usadoPor` siguiendo `.agents/file-header-template.md`.
- **RF-10**: Ubicuo — La reorganización SHALL preservar rutas existentes (`/dashboard`, `/dashboard/transacciones`, `/dashboard/tarjetas`, `/dashboard/configuracion`) y `TRIAL_ACTIVO = true` sin cambios de comportamiento observable en páginas de dashboard.
- **RF-11**: Ubicuo — El sistema SHALL proporcionar `DashboardUserModal` en `src/components/layout/` con props `abierto`, `alCerrar`, `children`, usando portal, overlay, focus trap, ESC, devolución foco, slots por defecto: header "Cuenta", profile → `/dashboard/configuracion`, logout → `/`.

---

## Casos límite

1. **Hidratación SSR `useBreakpoint`**: `sidebarColapsada` leer `localStorage` solo en cliente; valor inicial `false` en servidor para evitar mismatch. Usar `useEffect` + `useState` patrón estándar.
2. **Cambio de breakpoint en runtime** (resize ventana): `useBreakpoint` actualiza reactivamente; `DashboardLayout` re-renderiza y muestra/oculta componentes correctos. Sidebar desktop colapsada persiste preferencia.
3. **Drawer abierto + resize a desktop**: `DashboardLayout` detecta `isDesktop` → cierra drawer automáticamente (`setDrawerAbierto(false)` en effect con dependencia `isTablet`).
4. **Drawer abierto + resize a mobile**: Similar, cierra drawer tablet; bottom nav aparece; menú mobile usa drawer separado (`mobileMenuAbierto`).
5. **Focus trap accesibilidad**: `DashboardDrawer` debe atrapar Tab/Shift+Tab; probar con `axe-core` o manual. Al cerrar, foco vuelve a trigger (hamburguesa o bottom nav menú).
6. **Safe area mobile**: `BottomNav` debe usar `pb-env-safe` / `safe-area-inset-bottom` para notch/home indicator. Verificar en iOS Safari.
7. **Logout sin auth real (`TRIAL_ACTIVO=true`)**: "Cerrar sesión" en `DashboardUserModal` → `navigate('/', { replace: true })`. En trial no discrimina acceso; simplemente redirige a home público.
8. **Usuario/perfil sin auth real**: Avatar simple "Usuario Demo" / iniciales "UD". Click → abre `DashboardUserModal`. Sin contexto auth real; el modal contiene slots por defecto (Configuración + Cerrar sesión).
9. **Iconos**: Usar `lucide-react` (ya en deps? verificar). Si no, añadir como dep. Iconos: `Home`, `Receipt`, `CreditCard`, `Settings`, `MoreHorizontal`, `ChevronLeft`, `ChevronRight`, `Menu`, `X`, `LogOut`, `User`.
10. **Tests existentes**: `Sidebar.test.jsx` debe actualizarse/migrarse a `SidebarResponsive.test.jsx`. `Header.test.jsx` añadir casos `modo="dashboard"`. `DashboardLayout.test.jsx` nuevo (composición).

---

## Fuera de alcance

- **Autenticación real / contexto de usuario**: `TRIAL_ACTIVO=true` se mantiene; avatar/perfil son placeholders visuales. Auth real es spec posterior.
- **Persistencia de preferencias beyond sidebar**: Solo `sidebarCollapsed` en localStorage.
- **Animaciones Framer Motion complejas**: Solo CSS transitions (`duration-300 ease-out`). Framer Motion reservado para modales/hover/tap/layoutId (constitución).
- **Internacionalización (i18n)**: Textos en español hardcoded.
- **Notificaciones / badges en bottom nav**: Solo navegación base.
- **Theming / modo oscuro**: Tokens actuales son light-only; dark mode es deuda técnica.
- **Testing E2E / Playwright**: Solo unitarias Vitest + Testing Library.
- **Migración de `Sidebar.jsx` antiguo**: Se elimina/reemplaza; no se mantiene compatibilidad.

---

## Pruebas afectadas

| Archivo | Acción | Qué verifica |
|---|---|---|
| `src/components/layout/Sidebar.test.jsx` | **Renombrar/migrar** → `SidebarResponsive.test.jsx` | Renderiza logo toggle, 4 enlaces + avatar + modal trigger, estado colapsada/expandida, aria-expanded, tooltips |
| `src/components/layout/Header.test.jsx` | **Extender** | Modo dashboard: hamburguesa tablet, toggle sidebar desktop, avatar → modal, logout en modal |
| `src/components/layout/DashboardDrawer.test.jsx` | **Nuevo** | Portal render, overlay click cierra, ESC cierra, focus trap Tab ciclo, foco retorna a trigger |
| `src/components/layout/BottomNav.test.jsx` | **Nuevo** | 5 items renderizados, item activo con indicador, click navega, safe-area clase, alAbrirMenu abre drawer |
| `src/components/layout/DashboardUserModal.test.jsx` | **Nuevo** | Portal render, overlay click cierra, ESC cierra, focus trap, slots por defecto (Configuración navega, Cerrar sesión → /), foco retorna a avatar |
| `src/hooks/useBreakpoint.test.js` | **Nuevo** | Breakpoints correctos según innerWidth mock, persistencia localStorage, cleanup listeners |
| `src/layout/DashboardLayout.test.jsx` | **Nuevo (reemplaza esqueleto)** | Composición completa por breakpoint: desktop (sidebar+header), tablet (header+hamburguesa+drawer), mobile (header+bottomnav+drawer menú), márgenes/padding correctos, Outlet renderizado, DashboardUserModal global |
| `src/App.test.jsx` | **Regresión** | Rutas `/dashboard/*` siguen funcionando con nuevo layout |
| Suite completa `npm test` | **Obligatorio** | Todas las pruebas en verde |
| `npm run build` | **Obligatorio** | Build de producción sin errores |

---

## Notas de implementación (para plan posterior)

1. **Orden sugerido de tareas**:
   1. `useBreakpoint` hook (base para todo)
   2. `DashboardUserModal` (componente global portal, slots por defecto)
   3. `SidebarNavContenido` componente compartido (enlaces + avatar → modal)
   4. `SidebarResponsive` (desktop)
   5. `DashboardDrawer` (tablet + mobile menú)
   6. `BottomNav` (mobile)
   7. `Header` extender modo dashboard
   8. `DashboardLayout` componer todo
   9. Tests + build + validación visual

2. **Dependencias**: Verificar `lucide-react` en `package.json`. Si no está, añadir en plan.

3. **Tokens CSS**: Si faltan utilidades (ej. `backdrop-blur-md` ya existe en Tailwind v4), usar clases estándar. No añadir CSS custom salvo necesidad justificada.

4. **Archivo header template**: Aplicar `.agents/file-header-template.md` a todos los archivos nuevos/modificados (excepto tests).

5. **MEMORY.md**: Actualizar al cierre con decisiones tomadas (logout behavior, usuario mock, iconos).