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
Desktop (≥1024px / lg):    Sidebar fija colapsable (240px expandida / 72px colapsada)
                           Logo toggle expande/colapsa, fondo bg-bg-dark/80 backdrop-blur
                           Avatar al fondo → click abre DashboardUserModal
                           Modal: "Configuración" → /dashboard/configuracion, "Salir del demo" → /

Tablet (640px–1023px / md): Drawer lateral slide-in (overlay + backdrop)
                           Mismo contenido que sidebar expandida (avatar → modal)
                           Se abre desde botón hamburguesa en DashboardHeader

Mobile (<640px / sm):      Bottom navigation bar (5 iconos + etiqueta)
                           Fijo en bottom, bg-bg-dark/80 backdrop-blur
                           5º item "Menú" abre drawer con avatar → modal
                           Logout y perfil dentro del modal, no en bottom nav
```

**Alcance exacto — componentes a crear/modificar:**

| Componente | Ubicación | Tipo | Descripción |
|---|---|---|---|
| `SidebarResponsive` | `src/components/layout/` | Molécula | Sidebar desktop colapsable (reemplaza `Sidebar.jsx` actual) |
| `DashboardDrawer` | `src/components/layout/` | Molécula | Drawer tablet/mobile slide-in (overlay, portal, focus trap) |
| `BottomNav` | `src/components/layout/` | Molécula | Barra inferior mobile (5 items) |
| `useBreakpoint` | `src/hooks/` | Hook | Hook unificado de breakpoints (matchMedia puro) |
| `DashboardHeader` | `src/components/layout/` | Molécula | **NUEVO** — Header exclusivo dashboard (hamburguesa, avatar, toggle sidebar). `Header.jsx` queda solo para landing. |
| `DashboardLayout` | `src/layout/DashboardLayout.jsx` | Organismo | Componer todo: DashboardHeader + SidebarResponsive + DashboardDrawer + BottomNav + Container + Outlet |
| `SidebarNavContenido` | `src/components/layout/` | Molécula | **NUEVO** — Contenido compartido (4 enlaces + avatar) reutilizado en SidebarResponsive, DashboardDrawer (tablet), mobile drawer |

**No se toca**: páginas de dashboard (`PaginaDashboard*`), `Container`, `app.config.js`, `api.config.js`.

---

## CAMBIO: Inventario de componentes y destino

| Componente actual | Destino | Tipo | Justificación |
|---|---|---|---|
| `src/components/layout/Sidebar.jsx` | `src/components/layout/SidebarResponsive.jsx` (nuevo, reemplaza) | Molécula layout | Sidebar desktop colapsable con logo toggle, fondo dark glass, avatar → modal |
| `src/components/layout/Header.jsx` | **Sin cambios** (solo modo landing) | Molécula layout | Se separa responsabilidad: `DashboardHeader.jsx` nuevo para dashboard |
| (nuevo) | `src/components/layout/DashboardHeader.jsx` | Molécula layout | Header exclusivo dashboard: hamburguesa tablet, avatar → modal, toggle sidebar, tokens puros |
| (nuevo) | `src/components/layout/DashboardDrawer.jsx` | Molécula layout | Drawer tablet/mobile reutilizable (slide-in, overlay, focus trap, portal) |
| (nuevo) | `src/components/layout/BottomNav.jsx` | Molécula layout | Bottom bar mobile fija, 5 iconos + labels, safe-area-inset |
| (nuevo) | `src/components/layout/DashboardUserModal.jsx` | Molécula layout | Modal usuario (portal, overlay, focus trap, ESC): Configuración + Salir del demo |
| (nuevo) | `src/components/layout/SidebarNavContenido.jsx` | Molécula layout | Contenido navegación compartido (4 enlaces + avatar) — usado en SidebarResponsive, DashboardDrawer tablet, mobile drawer |
| (nuevo) | `src/hooks/useBreakpoint.js` | Hook | Breakpoints unificados (`isMobile`, `isTablet`, `isDesktop`, `sidebarColapsada`) |
| `src/layout/DashboardLayout.jsx` | `src/layout/DashboardLayout.jsx` (completo) | Organismo | Componer DashboardHeader + SidebarResponsive + DashboardDrawer + BottomNav + DashboardUserModal + Container + Outlet |

---

## API de componentes (contrato)

### `SidebarResponsive` (`src/components/layout/SidebarResponsive.jsx`)

```jsx
/**
 * @uso        Sidebar desktop colapsable con navegación, logo toggle, usuario y logout
 * @funciones  SidebarResponsive({ colapsada, alToggleColapso, alAbrirUserModal })
 * @datos      enlaces fijos (4), usuario desde contexto/auth (futuro), logout action
 * @eventos    click en enlaces, click en logo toggle, click en avatar
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

---

## CAMBIO: Prop `alCerrarDrawer` eliminada (era innecesaria en componente desktop-only)

**Estructura visual (desktop):**
- `aside` fijo: `fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] z-40 transition-all duration-300`
- Ancho: `w-64` expandida / `w-[72px]` colapsada
- Fondo: `bg-bg-dark/80 backdrop-blur-md border-r border-border-line/20`
- Logo toggle: click en área logo → `alToggleColapso()`
  - Expandida: "FinApp" completo (link a `/dashboard`) + chevron left
  - Colapsada: solo icono "F" + chevron right + **tooltip nativo `title="Inicio"` en icono Home**
- Navegación: 4 `NavLink` con icono + etiqueta (etiqueta oculta si colapsada)
- Usuario (parte inferior): avatar/iniciales SVG inline (usa `getUsuarioMock()` de `app.config.js`) → click abre `DashboardUserModal` (via `alAbrirUserModal`)
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
 * @uso        Drawer lateral slide-in para tablet/mobile (overlay + backdrop + focus trap)
 * @funciones  DashboardDrawer({ abierto, alCerrar, children })
 * @datos      Recibe children (navegación idéntica a Sidebar expandida)
 * @eventos    click en overlay, ESC, click en enlaces → alCerrar
 * @estados    abierto (controlado desde padre)
 * @usadoPor   DashboardLayout (condicional tablet/mobile)
 */
```

**Props:**

| Prop | Tipo | Obligatoria | Por defecto | Descripción |
|---|---|---|---|---|
| `abierto` | boolean | sí | — | Visibilidad del drawer |
| `alCerrar` | function | sí | — | Callback `() => void` |
| `children` | node | sí | — | Contenido (navegación, usuario) |

**Comportamiento:**
- Portal en `document.body` (`createPortal`)
- Overlay: `fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-55` + click → `alCerrar`
- Panel: `fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-[85vw] max-w-sm bg-bg-dark/95 backdrop-blur-md border-r border-border-line/20 z-60 transform transition-transform duration-300 ease-out`
  - Abierto: `translate-x-0`
  - Cerrado: `-translate-x-full`
- Focus trap: al abrir, foco en primer enlace; Tab cicla dentro; ESC → `alCerrar` (usar `focus-trap-react`)
- Al cerrar, devuelve foco al botón hamburguesa en DashboardHeader (tablet) o item Menú en BottomNav (mobile)

**Contenido (children recomendado):**
- `SidebarNavContenido` (componente compartido con 4 enlaces + avatar)
- Usuario (avatar/iniciales via `getUsuarioMock()`) → click abre `DashboardUserModal` (via `alAbrirUserModal`)
- Sin botón logout (va dentro del modal)

---

### `BottomNav` (`src/components/layout/BottomNav.jsx`)

```jsx
/**
 * @uso        Barra de navegación inferior fija para mobile (5 items)
 * @funciones  BottomNav({ itemActivo, alNavegar, alAbrirMenu })
 * @datos      5 items fijos: Inicio, Transacciones, Tarjetas, Configuración, Menú (⋮)
 * @eventos    click en item → alNavegar(ruta), click en Menú → alAbrirMenu()
 * @estados    itemActivo (string ruta)
 * @usadoPor   DashboardLayout (condicional mobile)
 */
```

**Props:**

| Prop | Tipo | Obligatoria | Por defecto | Descripción |
|---|---|---|---|---|
| `itemActivo` | string | sí | — | Ruta activa (`/dashboard`, `/dashboard/transacciones`, ...) |
| `alNavegar` | function | sí | — | Callback `(ruta: string) => void` |
| `alAbrirMenu` | function | sí | — | Callback `() => void` para abrir drawer menú (5º item) |

**Items (orden fijo):**

| Ruta | Etiqueta | Icono (lucide-react) | Notas |
|---|---|---|---|
| `/dashboard` | Inicio | `Home` | Índice |
| `/dashboard/transacciones` | Transacciones | `Receipt` | |
| `/dashboard/tarjetas` | Tarjetas | `CreditCard` | |
| `/dashboard/configuracion` | Configuración | `Settings` | **Único acceso a Configuración en mobile** (ver nota) |
| (acción) | Menú | `MoreHorizontal` | Abre `DashboardDrawer` en mobile |

---

## CAMBIO: BottomNav — "Configuración" aparece SOLO como item 4 (no duplicada en modal)

En mobile, el item "Configuración" navega a `/dashboard/configuracion`. El drawer del 5º item "Menú" contiene **solo avatar → modal con "Salir del demo"**. Esto evita duplicación. Decisión: **Configuración accesible vía bottom nav item 4; perfil/logout solo en modal desde avatar (drawer menú).**

**Estilo:**
- `fixed bottom-0 left-0 right-0 z-50 bg-bg-dark/80 backdrop-blur-md border-t border-border-line/20`
- `pb-safe` (usa `env(safe-area-inset-bottom)` via clase utilitaria `safe-bottom` en `index.css` — **resuelto, no pospuesto**)
- Grid `grid grid-cols-5` items equidistantes
- Item: `flex flex-col items-center gap-1 px-2 py-2`
  - Icono `flex-shrink-0 w-6 h-6`
  - Etiqueta `text-xs font-medium truncate` (oculta en landscape: `@media (orientation: landscape) { .bottom-nav-label { display: none; } }` — **no `hidden lg:flex`**)
- Activo: `text-emerald-primary` + indicador superior `absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-primary rounded-full`
- Inactivo: `text-slate-text hover:text-emerald-primary/70`
- Contenedores con `min-w-0` para evitar deformación

**Nota mobile:** El 5º item "Menú" abre `DashboardDrawer` (reutilizado) para avatar → modal con "Salir del demo". Ver `DashboardLayout` composición.

---

### `DashboardUserModal` (`src/components/layout/DashboardUserModal.jsx`)

```jsx
/**
 * @uso        Modal de usuario (portal) con slots fijos: Configuración + Salir del demo
 * @funciones  DashboardUserModal({ abierto, alCerrar })
 * @datos      Slots fijos por defecto: header "Cuenta", profile → Configuración, logout → redirect /
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

---

## CAMBIO: Prop `children` eliminada (no se usa — slots fijos inyectados internamente)

**Comportamiento:**
- Portal en `document.body` (`createPortal`)
- Overlay: `fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-60` + click → `alCerrar`
- Panel: `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-bg-cream/95 backdrop-blur-md border border-border-line/30 rounded-2xl shadow-xl z-65`
- Focus trap: al abrir, foco en primer elemento accionable; Tab cicla dentro; ESC → `alCerrar` (usar `focus-trap-react`)
- Al cerrar, devuelve foco al avatar que lo abrió (DashboardHeader o Sidebar)
- Animación entrada/salida: `transition-opacity duration-200` + `scale-95` a `scale-100` (Framer Motion **permitido** en modales por constitución — ver RF-18)

**Slots fijos por defecto (sin `children` override):**
- Header: "Cuenta"
- Auth: (vacío — preparado para futuro contexto real)
- Profile: botón "Configuración" → `navigate('/dashboard/configuracion')` + `alCerrar()`
- Logout: botón **"Salir del demo"** → `navigate('/', { replace: true })` + `alCerrar()` (en trial: redirect a `/`)

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
 * @datos      Usa matchMedia listeners (cleanup en unmount), sin dependencia de useReveal
 * @eventos    resize, change en media queries
 * @estados    sidebarColapsada (persistida en localStorage 'sidebarCollapsed')
 * @usadoPor   DashboardLayout, DashboardHeader (modo dashboard)
 */
```

**Retorno:**

| Prop | Tipo | Descripción |
|---|---|---|
| `isMobile` | boolean | `<640px` (Tailwind `sm`) |
| `isTablet` | boolean | `640px–1023px` (`sm` ≤ x < `lg`) |
| `isDesktop` | boolean | `≥1024px` (`lg`+) |
| `sidebarColapsada` | boolean | Estado colapsado (persistido) |
| `toggleSidebar` | function | `() => void` alterna `sidebarColapsada` |

---

## CAMBIO: Breakpoints alineados con Tailwind v4 nativo (@theme)

**Breakpoints (alineados con Tailwind v4 `@theme` nativo):**
- `sm`: 640px
- `md`: 768px (Tailwind nativo)
- `lg`: 1024px (Tailwind nativo) — **usado como breakpoint desktop**
- `xl`: 1280px (no usado directamente)

**Lógica de breakpoints en hook:**
- `isMobile`: `< 640px` (sm)
- `isTablet`: `640px ≤ x < 1024px` (sm ≤ x < lg)
- `isDesktop`: `≥ 1024px` (lg+)

**Persistencia:** `localStorage.setItem('sidebarCollapsed', JSON.stringify(valor))` + lectura inicial. SSR-safe: valor por defecto `false` hasta hidratación.

---

## CAMBIO: Patrón SSR exacto en useBreakpoint

```js
const [sidebarColapsada, setSidebarColapsada] = useState(() => {
  if (typeof window === 'undefined') return false;
  try { return JSON.parse(localStorage.getItem('sidebarCollapsed')) ?? false; }
  catch { return false; }
});
useEffect(() => {
  // listeners matchMedia + sync localStorage
}, []);
```

---

### `DashboardHeader` (`src/components/layout/DashboardHeader.jsx`)

---

## CAMBIO: Componente NUEVO separado de Header.jsx (landing)

**Props:**

| Prop | Tipo | Obligatoria | Descripción |
|---|---|---|---|
| `alAbrirDrawer` | function | sí (tablet) | `() => void` abre `DashboardDrawer` |
| `alToggleSidebar` | function | sí (desktop) | `() => void` alterna colapso sidebar |
| `sidebarColapsada` | boolean | sí (desktop) | Para mostrar chevron correcto |
| `usuario` | object | no | `{ nombre, iniciales, email? }` — futuro auth real (usa `getUsuarioMock()`) |
| `alAbrirUserModal` | function | sí | `() => void` abre `DashboardUserModal` al click avatar |

**Comportamiento modo dashboard:**
- Fondo: siempre `bg-bg-cream/92 backdrop-blur-md border-b border-border-line py-3.5 shadow-sm` (sin transición scroll, **100% tokens, elimina hex legacy** — **alcance: solo modo dashboard; Header.jsx landing sin cambios**)
- Altura: define CSS custom property `--header-height` en `@theme` (ver RF-12) y usa `h-[var(--header-height)]`
- Izquierda:
  - Desktop: logo "FinApp" (link a `/dashboard`) + botón toggle sidebar (chevron left/right) — solo si `!isMobile`
  - Tablet: botón hamburguesa → `alAbrirDrawer()` — solo si `isTablet`
  - Mobile: nada (logo en bottom nav o drawer)
- Derecha: avatar/iniciales usuario (SVG inline via `getUsuarioMock()`, círculo emerald, 32px) → click abre `DashboardUserModal` (`alAbrirUserModal()`)
  - Modal slots fijos:
    - "Configuración" → `/dashboard/configuracion`
    - **"Salir del demo"** → redirect `/`

**Nota:** `DashboardHeader` no gestiona breakpoints; los recibe vía props desde `DashboardLayout` que usa `useBreakpoint`.

---

### `SidebarNavContenido` (`src/components/layout/SidebarNavContenido.jsx`)

---

## CAMBIO: Componente NUEVO crítico (usado en 3 sitios) — añadido a inventario y con API/tests propios

```jsx
/**
 * @uso        Contenido de navegación compartido: 4 enlaces + avatar → modal
 * @funciones  SidebarNavContenido({ alAbrirUserModal })
 * @datos      4 NavLink fijos + avatar via getUsuarioMock()
 * @eventos    click enlaces (navegan), click avatar → alAbrirUserModal
 * @estados    Ninguno (stateless)
 * @usadoPor   SidebarResponsive (expandida), DashboardDrawer (tablet), DashboardDrawer (mobile menú)
 */
```

**Props:**

| Prop | Tipo | Obligatoria | Descripción |
|---|---|---|---|
| `alAbrirUserModal` | function | sí | Callback `() => void` al click avatar |

**Estructura:**
- 4 `NavLink` con icono + etiqueta: Inicio, Transacciones, Tarjetas, Configuración
- Separador `hr`
- Avatar/iniciales (usa `getUsuarioMock()` de `app.config.js`) → click abre `DashboardUserModal`

---

### `DashboardLayout` (`src/layout/DashboardLayout.jsx` — completo)

```jsx
/**
 * @uso        Layout completo del dashboard: DashboardHeader + navegación responsive + contenido
 * @funciones  DashboardLayout({ children })
 * @datos      Usa useBreakpoint, compone DashboardHeader, SidebarResponsive, DashboardDrawer, BottomNav, Container, Outlet
 * @eventos    Coordena estado colapso, drawer, navegación
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
    {/* DashboardHeader: siempre renderizado, adapta contenido según breakpoint */}
    <DashboardHeader
      alAbrirDrawer={isTablet ? () => setDrawerAbierto(true) : undefined}
      alToggleSidebar={isDesktop ? toggleSidebar : undefined}
      sidebarColapsada={isDesktop ? sidebarColapsada : false}
      usuario={getUsuarioMock()}
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

    {/* Área principal: margin-left condicional para sidebar desktop + padding header */}
    <div className={cn(
      "min-h-screen bg-bg-cream transition-all duration-300",
      isDesktop && sidebarColapsada ? "lg:ml-[72px]" : "lg:ml-64",
      !isDesktop && "ml-0"
    )}>
      <Container>
        <main className={cn(
          "pb-20",                    // espacio bottom nav mobile
          "pt-[var(--header-height)]" // espacio header fijo (token, no magic number)
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
    />
  </>
);
```

**Notas de implementación:**
- `navigate` de `useNavigate` para `BottomNav.alNavegar`.
- `location` de `useLocation` para `itemActivo`.
- `cn` = `clsx` (añadir como dependencia — justificación: utilidad estándar para classNames condicionales, <1kb, usado en Tailwind docs).
- **z-index scale coherente (resuelto Fluid Glass ≤3 superficies):**
  - DashboardHeader: 40 (fijo, no translúcido completo — fondo `bg-bg-cream/92` opaque-enough)
  - Sidebar: 40
  - DashboardDrawer overlay: 55
  - DashboardDrawer panel: 60
  - BottomNav: 50 (mobile only, no coexiste con drawer panel en mismo viewport)
  - Modal overlay: 60
  - Modal panel: 65
- **Fluid Glass límite 3 superficies por viewport:**
  - Desktop: Header (opaco) + Sidebar (translúcida) + Modal (cuando abierto) = máx 3
  - Tablet: Header (opaco) + Drawer overlay (translúcida) + Drawer panel (translúcida) + Modal (cuando abierto) = 3 simultáneas (drawer panel cuenta como 1, overlay como 1)
  - Mobile: Header (no renderizado) + BottomNav (translúcida) + Drawer overlay (translúcida) + Drawer panel (translúcida) + Modal = máx 3 (BottomNav + Drawer panel + Modal)

---

## CAMBIO: Requisitos funcionales (EARS) actualizados

- **RF-01**: Ubicuo — El sistema SHALL proporcionar `SidebarResponsive` en `src/components/layout/` con props `colapsada`, `alToggleColapso`, `alAbrirUserModal`, aplicando fondo `bg-bg-dark/80 backdrop-blur-md`, logo toggle (expandida: link `/dashboard`, colapsada: icono Home con tooltip), 4 enlaces con iconos, avatar SVG inline via `getUsuarioMock()` al fondo → click abre `DashboardUserModal`, sin botón logout.
- **RF-02**: Ubicuo — El sistema SHALL proporcionar `DashboardDrawer` en `src/components/layout/` con props `abierto`, `alCerrar`, `children`, usando portal, overlay con backdrop-blur (z-55), panel slide-in responsive `w-[85vw] max-w-sm` (z-60), focus trap con `focus-trap-react`, ESC para cerrar, devolución de foco, `top-[var(--header-height)]` y `h-[calc(100vh-var(--header-height))]`.
- **RF-03**: Ubicuo — El sistema SHALL proporcionar `BottomNav` en `src/components/layout/` con props `itemActivo`, `alNavegar`, `alAbrirMenu`, 5 items fijos (Inicio, Transacciones, Tarjetas, Configuración, Menú), fondo `bg-bg-dark/80 backdrop-blur-md` (z-50), `pb-safe` con `env(safe-area-inset-bottom)`, indicador activo superior, etiquetas ocultas en landscape via `@media (orientation: landscape)`.
- **RF-04**: Ubicuo — El sistema SHALL proporcionar `useBreakpoint` en `src/hooks/` retornando `isMobile`, `isTablet`, `isDesktop`, `sidebarColapsada`, `toggleSidebar` con persistencia `localStorage` y listeners `matchMedia` puros (sin `useReveal`), patrón SSR `useState(() => ...) + useEffect`, breakpoints `sm:640`, `md:768`, `lg:1024` (Tailwind v4 nativo).
- **RF-05**: Evento — Cuando `DashboardHeader` se renderiza, el sistema SHALL renderizar: logo link `/dashboard` + toggle sidebar (desktop), hamburguesa (tablet), avatar SVG inline via `getUsuarioMock()` → click abre `DashboardUserModal` con slots fijos "Configuración" → `/dashboard/configuracion` y "Salir del demo" → `/`, sin transición de scroll, **100% tokens (sin hex legacy)**, altura `h-[var(--header-height)]` con token en `@theme`.
- **RF-06**: Evento — Cuando `DashboardLayout` se monta, el sistema SHALL componer: DashboardHeader + (SidebarResponsive si desktop) + (DashboardDrawer si tablet/mobile) + Container + Outlet + (BottomNav si mobile) + `DashboardUserModal` global (portal), con márgenes condicionales (`lg:ml-64`/`lg:ml-[72px]`) + padding correctos por breakpoint usando `pt-[var(--header-height)]`.
- **RF-07**: Ubicuo — La navegación SHALL mantener accesibilidad: roles ARIA, focus visible con tokens mint/emerald, focus trap en drawer y modal (`focus-trap-react`), orden Tab lógico, tooltips en iconos colapsados, `aria-expanded` en toggles.
- **RF-08**: Ubicuo — El sistema SHALL usar tokens de `src/styles/index.css` (`bg-bg-dark`, `bg-bg-cream`, `border-border-line`, `emerald-primary`, `mint-accent`, `slate-text`) y **no** introducir hexadecimales nuevos en JSX/JS.
- **RF-09**: Ubicuo — Los componentes nuevos (`SidebarResponsive`, `DashboardDrawer`, `BottomNav`, `DashboardUserModal`, `DashboardHeader`, `SidebarNavContenido`, `useBreakpoint`) SHALL incluir header JSDoc con `@uso`, `@funciones`, `@datos`, `@eventos`, `@estados`, `@usadoPor` siguiendo `.agents/file-header-template.md`.
- **RF-10**: Ubicuo — La reorganización SHALL preservar rutas existentes (`/dashboard`, `/dashboard/transacciones`, `/dashboard/tarjetas`, `/dashboard/configuracion`) y `TRIAL_ACTIVO = true` sin cambios de comportamiento observable en páginas de dashboard. **Navegación mobile complementaria**: BottomNav + drawer menú replican rutas desktop; no añaden rutas nuevas.
- **RF-11**: Ubicuo — El sistema SHALL proporcionar `DashboardUserModal` en `src/components/layout/` con props `abierto`, `alCerrar` (sin `children`), usando portal, overlay (z-60), focus trap (`focus-trap-react`), ESC, devolución foco, slots fijos por defecto: header "Cuenta", profile → `/dashboard/configuracion`, logout → **"Salir del demo"** → `/`.
- **RF-12**: Ubicuo — El sistema SHALL definir token `--header-height` en `@theme` de `src/styles/index.css` (Tailwind v4) como única fuente; **eliminar `variables.css` y RF-12 original** (redundante con `@theme`).
- **RF-13**: Ubicuo — Los iconos SHALL usar `lucide-react` (11 iconos: Home, Receipt, CreditCard, Settings, MoreHorizontal, ChevronLeft, ChevronRight, Menu, X, LogOut, User) con `flex-shrink-0 w-6 h-6` para evitar deformación.
- **RF-14**: Ubicuo — El sistema SHALL proporcionar `SidebarNavContenido` en `src/components/layout/` con prop `alAbrirUserModal`, stateless, reutilizado en SidebarResponsive (expandida), DashboardDrawer tablet y mobile drawer; con tests propios.
- **RF-15**: Ubicuo — El avatar SHALL usar `getUsuarioMock()` centralizado en `src/config/app.config.js` retornando `{ nombre: 'Usuario Demo', iniciales: 'UD', email: 'demo@finapp.local' }`; sin hardcodear "UD" en componentes.

---

## CAMBIO: RF-12, RF-14, RF-15 nuevos; RF-12 original (variables.css) eliminado; RF-13 iconos justificado

---

## Casos límite

1. **Hidratación SSR `useBreakpoint`**: `sidebarColapsada` leer `localStorage` solo en cliente; valor inicial `false` en servidor para evitar mismatch. Usar patrón exacto `useState(() => ...) + useEffect` (ver RF-04).
2. **Cambio de breakpoint en runtime** (resize ventana): `useBreakpoint` actualiza reactivamente; `DashboardLayout` re-renderiza y muestra/oculta componentes correctos. Sidebar desktop colapsada persiste preferencia.
3. **Drawer abierto + resize a desktop**: `DashboardLayout` detecta `isDesktop` → cierra drawer automáticamente (`setDrawerAbierto(false)` en effect con dependencia `isTablet`).
4. **Drawer abierto + resize a mobile**: Similar, cierra drawer tablet; bottom nav aparece; menú mobile usa drawer separado (`mobileMenuAbierto`).
5. **Focus trap accesibilidad**: `DashboardDrawer` y `DashboardUserModal` deben atrapar Tab/Shift+Tab con `focus-trap-react`; probar con `axe-core` o manual. Al cerrar, foco vuelve a trigger (hamburguesa o bottom nav menú / avatar).
6. **Safe area mobile**: `BottomNav` usa `pb-safe` con `env(safe-area-inset-bottom)` via utilidad `safe-bottom` en `index.css` (**resuelto, no pospuesto**).
7. **Logout sin auth real (`TRIAL_ACTIVO=true`)**: **"Salir del demo"** en `DashboardUserModal` → `navigate('/', { replace: true })`. En trial no discrimina acceso; simplemente redirige a home público.
8. **Usuario/perfil sin auth real**: Avatar via `getUsuarioMock()` (centralizado en `app.config.js`). Click → abre `DashboardUserModal`. Sin contexto auth real; el modal contiene slots fijos (Configuración + Salir del demo).
9. **Iconos**: Usar `lucide-react` (añadir como dep). Iconos: `Home`, `Receipt`, `CreditCard`, `Settings`, `MoreHorizontal`, `ChevronLeft`, `ChevronRight`, `Menu`, `X`, `LogOut`, `User`. Justificación: librería estándar, tree-shakeable, consistente con diseño.
10. **Tests existentes**: `Sidebar.test.jsx` → **reescritura completa** como `SidebarResponsive.test.jsx` (no migración). `Header.test.jsx` añadir casos `modo="dashboard"` → **ahora tests para `DashboardHeader.test.jsx`**. `DashboardLayout.test.jsx` nuevo (composición).
11. **Formas sin deformación**: `flex-shrink-0 w-6 h-6` iconos, `truncate` labels, `min-w-0` contenedores en todos los componentes.
12. **Footer en dashboard**: **No se usa** — `DashboardLayout` no renderiza Footer. Landing usa su propio Header/Footer.
13. **Resize transitions — matriz de estados drawer/modal:**

| Transición | Drawer Tablet | Drawer Mobile (menú) | Modal Usuario |
|---|---|---|---|
| mobile → tablet | se abre si `drawerAbierto` | se cierra | se mantiene |
| tablet → desktop | se cierra (force) | N/A | se mantiene |
| tablet → mobile | se cierra | se abre si `mobileMenuAbierto` | se mantiene |
| desktop → tablet | se abre si `drawerAbierto` | N/A | se mantiene |
| desktop → mobile | N/A | se abre si `mobileMenuAbierto` | se mantiene |
| Cualquier → modal abierto | no afecta | no afecta | foco en modal, backdrop bloquea |

---

## Fuera de alcance

- **Autenticación real / contexto de usuario**: `TRIAL_ACTIVO=true` se mantiene; avatar/perfil son placeholders visuales vía `getUsuarioMock()`. Auth real es spec posterior.
- **Persistencia de preferencias beyond sidebar**: Solo `sidebarCollapsed` en localStorage.
- **Animaciones Framer Motion complejas**: Solo CSS transitions (`duration-300 ease-out`). Framer Motion **permitido solo en modales** (entrada/salida scale/opacity) por constitución (hover/tap, modales, layoutId, contadores).
- **Internacionalización (i18n)**: Textos en español hardcoded.
- **Notificaciones / badges en bottom nav**: Solo navegación base.
- **Theming / modo oscuro**: Tokens actuales son light-only; dark mode es deuda técnica.
- **Testing E2E / Playwright**: Solo unitarias Vitest + Testing Library.
- **Migración de `Sidebar.jsx` antiguo**: Se elimina/reemplaza; no se mantiene compatibilidad.

---

## Pruebas afectadas

| Archivo | Acción | Qué verifica |
|---|---|---|
| `src/components/layout/Sidebar.test.jsx` | **Eliminar** → nuevo `SidebarResponsive.test.jsx` (reescritura completa) | Renderiza logo toggle (link expandida, icono Home colapsada), 4 enlaces + avatar + modal trigger, estado colapsada/expandida, aria-expanded, tooltips, `top-[var(--header-height)]` |
| `src/components/layout/Header.test.jsx` | **Sin cambios** (solo landing) | Modo landing sigue funcionando |
| `src/components/layout/DashboardHeader.test.jsx` | **Nuevo** | Modo dashboard: hamburguesa tablet, toggle sidebar desktop, avatar → modal, logout "Salir del demo" en modal |
| `src/components/layout/DashboardDrawer.test.jsx` | **Nuevo** | Portal render, overlay click cierra, ESC cierra, focus trap Tab ciclo, foco retorna a trigger, ancho responsive `w-[85vw] max-w-sm`, `top-[var(--header-height)]` |
| `src/components/layout/BottomNav.test.jsx` | **Nuevo** | 5 items renderizados, item activo con indicador, click navega, `pb-safe` clase, alAbrirMenu abre drawer, etiquetas ocultas en landscape (media query) |
| `src/components/layout/DashboardUserModal.test.jsx` | **Nuevo** | Portal render, overlay click cierra, ESC cierra, focus trap, slots fijos (Configuración navega, "Salir del demo" → /), foco retorna a avatar, Framer Motion en entrada/salida |
| `src/components/layout/SidebarNavContenido.test.jsx` | **Nuevo** | 4 enlaces + avatar renderizados, click avatar llama alAbrirUserModal, sin lógica propia de navegación |
| `src/hooks/useBreakpoint.test.js` | **Nuevo** | Breakpoints correctos según innerWidth mock (sm/md/lg nativos), persistencia localStorage, cleanup listeners, patrón SSR `useState(() => ...) + useEffect` |
| `src/layout/DashboardLayout.test.jsx` | **Nuevo (reemplaza esqueleto)** | Composición completa por breakpoint: desktop (sidebar+header), tablet (header+hamburguesa+drawer), mobile (header+bottomnav+drawer menú), márgenes/padding correctos (`lg:ml-64`/`lg:ml-[72px]`, `pt-[var(--header-height)]`), Outlet renderizado, DashboardUserModal global, transiciones resize |
| `src/App.test.jsx` | **Regresión** | Rutas `/dashboard/*` siguen funcionando con nuevo layout |
| Suite completa `npm test` | **Obligatorio** | Todas las pruebas en verde |
| `npm run build` | **Obligatorio** | Build de producción sin errores |

---

## Notas de implementación (para plan posterior)

1. **Orden sugerido de tareas** (actualizado según decisiones finales):
    1. Instalar dependencias (`lucide-react`, `clsx`, `focus-trap-react`) — **justificadas en RF-13, RF-09, RF-02/11**
    2. Actualizar `src/styles/index.css`: añadir `--header-height` en `@theme`, utilidad `safe-bottom`, tokens existentes
    3. Añadir `getUsuarioMock()` en `src/config/app.config.js`
    4. `useBreakpoint` hook (patrón SSR exacto)
    5. `DashboardUserModal` (estructura, slots fijos, Framer Motion permitido)
    6. `SidebarNavContenido` (compartido: 4 links + avatar + click → modal)
    7. `SidebarResponsive` (desktop: colapsable, logo toggle con link Home expandida, avatar, full height dark glass, `top-[var(--header-height)]`)
    8. `DashboardDrawer` (tablet/mobile: portal, overlay, focus trap, focus-trap-react, ancho responsive)
    9. `BottomNav` (mobile: 5 items, `pb-safe`, active indicator, media query landscape)
    10. `DashboardHeader` (tokens puros, logo `/dashboard`, toggle sidebar, avatar → modal, **solo modo dashboard**)
    11. `DashboardLayout` componer todo (DashboardHeader + SidebarResponsive/Drawer/BottomNav + Container + Outlet + UserModal global)
    12. **Eliminar `Sidebar.jsx` legacy** (tarea explícita)
    13. Tests: SidebarResponsive, DashboardHeader, DashboardDrawer, BottomNav, DashboardUserModal, SidebarNavContenido, useBreakpoint, DashboardLayout, App.test.jsx regresión
    14. Validación final: grep hex legacy, suite verde, build verde, MEMORY.md

2. **Dependencias nuevas** (todas en `dependencies`, no devDependencies):
    - `lucide-react`: iconos estándar, tree-shakeable, 11 iconos necesarios — **justificado RF-13**
    - `clsx`: utilidad classNames condicionales <1kb, estándar Tailwind — **justificado RF-09**
    - `focus-trap-react`: focus trap accesible para drawer/modal, requerido por RF-07 — **justificado RF-02/11**

3. **Tokens CSS**: **Solo `@theme` en `src/styles/index.css`** (Tailwind v4). Añadir `--header-height: 64px` (o valor real medido). Eliminar `variables.css` y RF-12 original.

4. **Archivo header template**: Aplicar `.agents/file-header-template.md` a todos los archivos nuevos/modificados (excepto tests).

5. **MEMORY.md**: Actualizar al cierre con decisiones tomadas (logout "Salir del demo", usuario mock centralizado, iconos lucide-react, z-index scale, slots fijos modal, avatar SVG inline via getUsuarioMock(), breakpoints Tailwind nativo, Header separado DashboardHeader, SidebarNavContenido compartido, safe-area resuelto, Fluid Glass ≤3 superficies).

---

## Resumen de cambios clave vs versión anterior (para el revisor)

| Hallazgo | Resolución en spec |
|---|---|
| 1. Fluid Glass ≤3 superficies | Rediseño z-index + capas: Header opaco (no cuenta), Sidebar/Drawer/BottomNav/Modal máx 3 simultáneas por breakpoint |
| 2. Breakpoints Tailwind v4 | `sm:640`, `md:768`, `lg:1024` nativos; `isDesktop = lg+` |
| 3. Header compartido | Nuevo `DashboardHeader.jsx`; `Header.jsx` solo landing |
| 4. Sidebar top-0 solapamiento | `top-[var(--header-height)]` + `h-[calc(100vh-var(--header-height))]` |
| 5. Logo toggle elimina Home | Expandida: link "FinApp" → `/dashboard`; Colapsada: icono Home + tooltip |
| 6. Drawer w-72 fijo | `w-[85vw] max-w-sm` responsive |
| 7. Configuración duplicada | Solo en BottomNav item 4; modal solo "Salir del demo"; safe-area resuelto con `pb-safe` |
| 8. pt-16 magic number | Token `--header-height` en `@theme` + `pt-[var(--header-height)]` |
| 9. Z-index drawer < BottomNav | Nueva escala: Header 40, Sidebar 40, BottomNav 50, Drawer overlay 55, Drawer panel 60, Modal overlay 60, Modal panel 65 |
| 10. SidebarNavContenido sin API/tests | Añadido a inventario, API propia, tests propios |
| 11. Alcance limpieza hex Header | Solo modo dashboard (DashboardHeader); Header.jsx landing sin cambios |
| 12. alCerrarDrawer innecesaria | Eliminada de SidebarResponsive |
| 13. Dependencias justificadas | lucide-react, clsx, focus-trap-react con justificación en RF/notas |
| 14. variables.css redundante | Eliminado RF-12 original; usar solo `@theme` |
| 15. Avatar UD hardcoded | `getUsuarioMock()` en app.config.js |
| 16. DashboardUserModal children contradicción | Prop `children` eliminada; pseudocode sin children |
| 17. Logout semántica trial | "Salir del demo" / "Volver al inicio" |
| 18. Framer Motion modales | Permitido por constitución → aclarado en RF-11 y notas |
| 19. BottomNav landscape labels | `@media (orientation: landscape)` no `hidden lg:flex` |
| 20. Tests Sidebar → SidebarResponsive | Reescritura completa, no migración |
| 21. Eliminar Sidebar.jsx legacy | Tarea explícita en plan |
| 22. RF-10 aclarado | "Preservar rutas + navegación mobile complementaria" |
| 23. Resize transitions matriz | Tabla añadida en casos límite |
| 24. Footer dashboard | Explícito: "No se usa" |
| 25. useBreakpoint SSR patrón | `useState(() => ...) + useEffect` especificado |