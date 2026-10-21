# Plan 007 — Navegación Responsive Dashboard

**Estado:** borrador
**Spec base:** `specs/007-navegacion-responsive-dashboard/spec.md`
**Fecha:** 2026-10-14

---

## 1. Arquitectura general

### 1.1 Diagrama de composición (DashboardLayout)

```
DashboardLayout (organismo, src/layout/)
├─ DashboardHeader (molécula, src/components/layout/) — SIEMPRE renderizado
│   ├─ Desktop: logo link + toggle sidebar
│   ├─ Tablet: botón hamburguesa → DashboardDrawer
│   └─ Avatar → DashboardUserModal
├─ SidebarResponsive (molécula, src/components/layout/) — SOLO desktop
│   └─ SidebarNavContenido (molécula, src/components/layout/) — contenido expandido
├─ DashboardDrawer (molécula, src/components/layout/) — CONDICIONAL tablet/mobile
│   ├─ Tablet: abierto desde hamburguesa DashboardHeader
│   └─ Mobile (menú): abierto desde 5º item BottomNav
│   └─ SidebarNavContenido (compartido) — 4 enlaces + avatar
├─ Container + Outlet (área principal)
│   ├─ Margin-left condicional: lg:ml-64 / lg:ml-[72px] / ml-0
│   └─ Padding-top: pt-[var(--header-height)]
├─ BottomNav (molécula, src/components/layout/) — SOLO mobile
│   └─ 5 items: Inicio, Transacciones, Tarjetas, Configuración, Menú (→ drawer)
└─ DashboardUserModal (molécula, src/components/layout/) — GLOBAL (portal)
    └─ Slots fijos: Configuración + "Salir del demo"
```

### 1.2 Flujo de estado y breakpoints

| Breakpoint | `useBreakpoint` | Componentes visibles | Estado clave |
|---|---|---|---|
| **Desktop (≥1024px / lg)** | `isDesktop=true` | DashboardHeader, SidebarResponsive, Container+Outlet, DashboardUserModal | `sidebarColapsada` (persistida) |
| **Tablet (640–1023px / md–lg)** | `isTablet=true` | DashboardHeader (hamburguesa), DashboardDrawer (condicional), Container+Outlet, DashboardUserModal | `drawerAbierto` |
| **Mobile (<640px / sm)** | `isMobile=true` | DashboardHeader (solo avatar), BottomNav, DashboardDrawer (menú condicional), Container+Outlet, DashboardUserModal | `mobileMenuAbierto` |

**Transiciones de resize** (ver spec §Casos límite 13):
- `tablet → desktop`: cierra drawer tablet
- `desktop → tablet`: abre drawer si estaba abierto
- `mobile → tablet`: abre drawer tablet si `drawerAbierto`; cierra menú mobile
- Cualquier → modal abierto: no afecta drawers, foco en modal

### 1.3 Z-index scale (Fluid Glass ≤3 superficies)

| Capa | z-index | Qué incluye | Superficies translúcidas concurrentes |
|---|---|---|---|
| Header (dashboard) | 40 | `bg-bg-cream/92` (opaco enough) | 0 (no translúcido) |
| Sidebar | 40 | `bg-bg-dark/80 backdrop-blur-md` | 1 |
| BottomNav | 50 | `bg-bg-dark/80 backdrop-blur-md` | 1 (mobile) |
| Drawer overlay | 55 | `bg-bg-dark/50 backdrop-blur-sm` | 1 |
| Drawer panel | 60 | `bg-bg-dark/95 backdrop-blur-md` | 1 |
| Modal overlay | 60 | `bg-bg-dark/50 backdrop-blur-sm` | 1 |
| Modal panel | 65 | `bg-bg-cream/95 backdrop-blur-md` | 1 |

**Conteo máx por viewport:**
- Desktop: Header (0) + Sidebar (1) + Modal (1) = **2** ✓
- Tablet: Header (0) + Drawer overlay (1) + Drawer panel (1) + Modal (1) = **3** ✓ (overlay+panel = 1 conceptual)
- Mobile: BottomNav (1) + Drawer overlay (1) + Drawer panel (1) + Modal (1) = **3** ✓ (BottomNav + Drawer panel + Modal)

---

## 2. Archivos a crear / modificar

### 2.1 Archivos nuevos (12)

| Archivo | Tipo | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `src/hooks/useBreakpoint.js` | Hook | Breakpoints unificados, persistencia sidebar, listeners matchMedia | RF-04 |
| `src/components/layout/SidebarNavContenido.jsx` | Molécula | 4 NavLink + avatar → modal (stateless, compartido 3×) | RF-14 |
| `src/components/layout/SidebarResponsive.jsx` | Molécula | Sidebar desktop colapsable, logo toggle, avatar, full-height dark glass | RF-01 |
| `src/components/layout/DashboardDrawer.jsx` | Molécula | Drawer tablet/mobile slide-in, portal, focus trap, ancho responsive | RF-02 |
| `src/components/layout/BottomNav.jsx` | Molécula | Barra mobile 5 items, safe-area, active indicator, landscape labels | RF-03 |
| `src/components/layout/DashboardUserModal.jsx` | Molécula | Modal usuario portal, slots fijos, Framer Motion, focus trap | RF-11 |
| `src/components/layout/DashboardHeader.jsx` | Molécula | Header exclusivo dashboard, tokens puros, hamburguesa/toggle/avatar | RF-05 |
| `src/components/layout/SidebarResponsive.test.jsx` | Test | Reescritura completa (no migración) | RF-01, RF-07 |
| `src/components/layout/DashboardHeader.test.jsx` | Test | Modo dashboard: hamburguesa, toggle, avatar→modal, logout | RF-05, RF-07 |
| `src/components/layout/DashboardDrawer.test.jsx` | Test | Portal, overlay/ESC close, focus trap, ancho responsive | RF-02, RF-07 |
| `src/components/layout/BottomNav.test.jsx` | Test | 5 items, active indicator, navigate, pb-safe, landscape | RF-03, RF-07 |
| `src/components/layout/DashboardUserModal.test.jsx` | Test | Portal, slots fijos, focus trap, Framer Motion, foco retorno | RF-11, RF-07 |

### 2.2 Archivos modificados (5)

| Archivo | Cambio | RF cubiertos |
|---|---|---|
| `src/styles/index.css` | Añadir `--header-height` en `@theme`, utilidad `safe-bottom` (`pb-safe`), tokens existentes | RF-12, RF-08 |
| `src/config/app.config.js` | Añadir `getUsuarioMock()` retornando `{ nombre, iniciales, email }` | RF-15 |
| `src/layout/DashboardLayout.jsx` | Reescritura completa: composición DashboardHeader + SidebarResponsive/Drawer/BottomNav + Container+Outlet + UserModal global, márgenes/padding condicionales | RF-06, RF-10 |
| `src/hooks/useBreakpoint.test.js` | Nuevo (reemplaza cualquier test previo si existía) | RF-04 |
| `src/layout/DashboardLayout.test.jsx` | Nuevo (reemplaza esqueleto): composición por breakpoint, márgenes, padding, resize | RF-06, RF-10 |

### 2.3 Archivos eliminados (1)

| Archivo | Acción | Justificación |
|---|---|---|
| `src/components/layout/Sidebar.jsx` | **Eliminar** (legacy) | Reemplazado por `SidebarResponsive.jsx`; no se mantiene compatibilidad |

### 2.4 Archivos sin cambios (verificados)

| Archivo | Nota |
|---|---|
| `src/components/layout/Header.jsx` | Solo modo landing; prop `modo="landing" | "dashboard"` queda para landing |
| `src/components/ui/*` | Átomos no tocados |
| `src/pages/PaginaDashboard*.jsx` | Páginas de dashboard sin cambios |
| `src/components/layout/Container.jsx` | No se toca |
| `src/App.jsx` | Rutas `/dashboard/*` siguen usando `DashboardLayout` |

---

## 3. Dependencias nuevas (package.json)

| Paquete | Tipo | Versión | Justificación (traceable a RF) |
|---|---|---|---|
| `lucide-react` | `dependencies` | ^0.4.x | **RF-13**: 11 iconos estándar, tree-shakeable, consistencia diseño |
| `clsx` | `dependencies` | ^2.1.x | **RF-09**: utilidad classNames condicionales <1kb, estándar Tailwind |
| `focus-trap-react` | `dependencies` | ^10.x | **RF-02, RF-11**: focus trap accesible para drawer y modal, requerido por RF-07 |

> **Nota:** `framer-motion` ya está instalado (spec 006). Se usa solo en `DashboardUserModal` (entrada/salida scale/opacity) — permitido por constitución (modales).

---

## 4. Decisiones de diseño y alternativas descartadas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| **DashboardHeader separado de Header.jsx** | Reutilizar Header.jsx con `modo="dashboard"` complejo | Separación de responsabilidades: landing vs dashboard; Header.jsx sin cambios (RF-05, alcance acotado) |
| **SidebarNavContenido componente compartido** | Duplicar 4 enlaces + avatar en SidebarResponsive, DashboardDrawer tablet, mobile drawer | DRY crítico; usado en 3 sitios; tests propios (RF-14) |
| **Drawer ancho `w-[85vw] max-w-sm`** | `w-72` fijo (288px) | Responsive real en tablet; evita overflow en pantallas pequeñas |
| **BottomNav `pb-safe` con `env(safe-area-inset-bottom)`** | `pb-4` fijo / posponer | Resuelto en spec; utilidad `safe-bottom` en `index.css` |
| **Modal slots fijos (sin `children`)** | `children` prop para flexibilidad | Slots fijos = "Configuración" + "Salir del demo"; evita misuse; RF-11 |
| **Logout = "Salir del demo" → `/` (replace)** | Link directo `/logout` o botón en sidebar | Trial mode: semántica clara, redirect a home público (RF-11, caso límite 7) |
| **Avatar via `getUsuarioMock()` centralizado** | Hardcodear "UD" en cada componente | Única fuente; preparado para auth real futuro (RF-15) |
| **Breakpoints Tailwind v4 nativo (`sm:640`, `md:768`, `lg:1024`)** | Breakpoints custom / `md` como desktop | Alineado con `@theme` nativo; `isDesktop = lg+` (RF-04) |
| **Token `--header-height` en `@theme` (Tailwind v4)** | `variables.css` + CSS custom props | Eliminado `variables.css` (RF-12 original redundante); única fuente `@theme` |
| **Z-index scale rediseñada** | Valores heredados / ad-hoc | Coherencia Fluid Glass ≤3 superficies; evita solapamientos (caso límite 9) |
| **Framer Motion solo en DashboardUserModal** | Framer Motion en drawer, sidebar, bottom nav | Constitución: solo hover/tap, modales, layoutId, contadores (RF-11, nota 18) |
| **`clsx` para classNames condicionales** | Template literals / `classnames` lib | <1kb, estándar Tailwind docs, tree-shakeable (RF-09) |
| **Tests: Sidebar.test.jsx → SidebarResponsive.test.jsx (reescritura)** | Migrar/extendir test existente | API y comportamiento completamente distintos; reescritura limpia |
| **SSR pattern en useBreakpoint: `useState(() => ...) + useEffect`** | `useSyncExternalStore` / leer localStorage en render | Patrón simple, compatible React 18, evita mismatch SSR (RF-04, caso límite 1) |

---

## 5. Estrategia de pruebas (Vitest + Testing Library)

### 5.1 Cobertura por componente

| Componente | Archivo test | Qué verifica (traceable a RF) |
|---|---|---|
| `useBreakpoint` | `useBreakpoint.test.js` | Breakpoints sm/md/lg nativos; persistencia localStorage; cleanup listeners; patrón SSR `useState(() => ...) + useEffect` (RF-04) |
| `SidebarNavContenido` | `SidebarNavContenido.test.jsx` | 4 NavLink + avatar render; click avatar → `alAbrirUserModal`; sin lógica navegación propia (RF-14) |
| `SidebarResponsive` | `SidebarResponsive.test.jsx` | Logo toggle (link expandida / icono Home+tooltip colapsada); 4 enlaces + avatar + modal trigger; estado colapsada/expandida; `aria-expanded`; tooltips; `top-[var(--header-height)]` (RF-01, RF-07) |
| `DashboardDrawer` | `DashboardDrawer.test.jsx` | Portal render; overlay click cierra; ESC cierra; focus trap Tab ciclo; foco retorna a trigger; ancho `w-[85vw] max-w-sm`; `top-[var(--header-height)]` (RF-02, RF-07) |
| `BottomNav` | `BottomNav.test.jsx` | 5 items render; item activo con indicador; click navega; `pb-safe` clase; `alAbrirMenu` abre drawer; etiquetas ocultas en landscape via media query (RF-03, RF-07) |
| `DashboardUserModal` | `DashboardUserModal.test.jsx` | Portal render; overlay click cierra; ESC cierra; focus trap; slots fijos (Configuración navega, "Salir del demo" → `/`); foco retorna a avatar; Framer Motion entrada/salida (RF-11, RF-07) |
| `DashboardHeader` | `DashboardHeader.test.jsx` | Modo dashboard: hamburguesa tablet, toggle sidebar desktop, avatar → modal, logout "Salir del demo" en modal, tokens puros sin hex (RF-05, RF-07, RF-08) |
| `DashboardLayout` | `DashboardLayout.test.jsx` | Composición completa por breakpoint: desktop (sidebar+header), tablet (header+hamburguesa+drawer), mobile (header+bottomnav+drawer menú); márgenes `lg:ml-64`/`lg:ml-[72px]`; padding `pt-[var(--header-height)]`; Outlet renderizado; DashboardUserModal global; transiciones resize (RF-06, RF-10) |
| `App` (regresión) | `App.test.jsx` | Rutas `/dashboard/*` siguen funcionando con nuevo layout (RF-10) |

### 5.2 Pruebas de integración / visuales (manuales, no automatizadas)

| Validación | Cómo verificar |
|---|---|
| Fluid Glass ≤3 superficies | DevTools: inspeccionar elementos con `backdrop-blur` simultáneos por breakpoint |
| Z-index correctos | DevTools: verificar stacking context; modal sobre drawer sobre bottom nav |
| Safe area mobile | Chrome DevTools device toolbar: iPhone con notch; BottomNav no tapado |
| Transiciones resize | Redimensionar ventana: drawer tablet ↔ desktop, mobile ↔ tablet sin errores |
| Focus trap Tab/Shift+Tab | Navegación teclado en drawer y modal; foco retorna a trigger |
| Tokens sin hex legacy | `grep -r "#[0-9a-fA-F]\{3,8\}" src/components/layout/` → solo comentarios/tokens CSS |

---

## 6. Trazabilidad RF → Cambios de código

| RF | Archivos afectados | Validación |
|---|---|---|
| **RF-01** | `SidebarResponsive.jsx`, `SidebarResponsive.test.jsx` | Render colapsada/expandida, logo toggle, avatar→modal, dark glass, `top-[var(--header-height)]` |
| **RF-02** | `DashboardDrawer.jsx`, `DashboardDrawer.test.jsx` | Portal, overlay, focus trap, ancho responsive, `top-[var(--header-height)]`, ESC, foco retorno |
| **RF-03** | `BottomNav.jsx`, `BottomNav.test.jsx` | 5 items, active indicator, `pb-safe`, landscape media query, `alAbrirMenu` |
| **RF-04** | `useBreakpoint.js`, `useBreakpoint.test.js` | Breakpoints sm/md/lg, localStorage, matchMedia cleanup, SSR pattern |
| **RF-05** | `DashboardHeader.jsx`, `DashboardHeader.test.jsx` | Logo link, toggle/hamburguesa, avatar→modal, tokens puros, `--header-height` |
| **RF-06** | `DashboardLayout.jsx`, `DashboardLayout.test.jsx` | Composición completa, márgenes condicionales, padding header, Outlet, UserModal global |
| **RF-07** | Todos los componentes + tests | ARIA roles, focus visible mint/emerald, focus trap, Tab orden, tooltips, `aria-expanded` |
| **RF-08** | Todos los componentes JSX | Grep hex legacy → 0 resultados en nuevos archivos |
| **RF-09** | Todos los archivos nuevos (excepto tests) | Header JSDoc con `@uso`, `@funciones`, `@datos`, `@eventos`, `@estados`, `@usadoPor` |
| **RF-10** | `DashboardLayout.jsx`, `DashboardLayout.test.jsx`, `App.test.jsx` | Rutas preservadas, navegación mobile complementaria, TRIAL_ACTIVO sin cambios |
| **RF-11** | `DashboardUserModal.jsx`, `DashboardUserModal.test.jsx` | Portal, slots fijos, "Salir del demo" → `/`, Framer Motion, focus trap |
| **RF-12** | `src/styles/index.css` | `--header-height` en `@theme`; `variables.css` eliminado |
| **RF-13** | Todos los componentes con iconos | `lucide-react` imports, `flex-shrink-0 w-6 h-6` |
| **RF-14** | `SidebarNavContenido.jsx`, `SidebarNavContenido.test.jsx` | 4 enlaces + avatar, stateless, reutilizado 3×, tests propios |
| **RF-15** | `app.config.js`, componentes que usan avatar | `getUsuarioMock()` centralizado, sin "UD" hardcoded |

---

## 7. Checklist de validación final (pre-commit)

- [ ] `npm install` con 3 dependencias nuevas pasa sin warnings
- [ ] `grep -r "#[0-9a-fA-F]\{3,8\}" src/components/layout/` → solo en comentarios o `index.css` tokens
- [ ] `grep -r "variables\.css" src/` → 0 resultados (eliminado)
- [ ] `npm test` → **todas las pruebas en verde** (9 suites nuevas/modificadas + regresión)
- [ ] `npm run build` → build producción sin errores
- [ ] `DashboardLayout` renderiza sin warnings consola (React, portal, focus-trap)
- [ ] Flujo manual desktop: sidebar colapsa/expande, avatar abre modal, "Salir del demo" → `/`
- [ ] Flujo manual tablet: hamburguesa abre drawer, ESC cierra, foco retorna, links navegan
- [ ] Flujo manual mobile: bottom nav 5 items, activo con indicador, "Menú" abre drawer con avatar→modal, landscape oculta labels
- [ ] Resize transiciones: mobile↔tablet↔desktop sin errores consola, drawers/modal consistentes
- [ ] `MEMORY.md` actualizado con decisiones (logout, usuario mock, iconos, z-index, slots fijos, avatar, breakpoints, Header separado, SidebarNavContenido, safe-area, Fluid Glass)
- [ ] Commit: staging limitado a archivos del cambio, mensaje imperativo español corto

---

## 8. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Focus trap `focus-trap-react` rompe en portal + Framer Motion | Media | Alto | Test unitario `DashboardUserModal.test.jsx` cubre focus trap + animación; probar manualmente |
| `localStorage` SSR mismatch en `useBreakpoint` | Baja | Medio | Patrón `useState(() => ...) + useEffect` especificado; test SSR mock |
| Z-index conflicts en resize rápido | Media | Medio | Escala documentada; `DashboardLayout` cierra drawers en efectos con dependencia `isTablet`/`isMobile` |
| `lucide-react` tree-shaking falla (bundle size) | Baja | Bajo | Importar iconos individualmente: `import { Home } from 'lucide-react'` |
| Safe area `env()` no funciona en algunos navegadores | Baja | Bajo | Fallback `pb-4` en `safe-bottom` utility class; test visual device toolbar |
| `Sidebar.jsx` legacy referenciado en imports olvidadas | Media | Medio | Grep `from.*Sidebar` antes de commit; eliminar archivo solo tras confirmar |

---

## 9. Estimación de esfuerzo (referencial)

| Fase | Tareas | Complejidad |
|---|---|---|
| Setup (deps, tokens, config) | 3 | Baja |
| Hook + componentes base (Modal, NavContenido) | 2 | Media |
| Componentes navegación (Sidebar, Drawer, BottomNav, Header) | 4 | Alta |
| Layout + integración + limpieza | 2 | Media |
| Tests (9 suites) | 9 | Alta |
| Validación + commit | 2 | Baja |
| **Total** | **~22 tareas atómicas** | **~3-4 días** |

> El `tasks.md` desglosa en ≤10 tareas agrupadas para ejecución práctica.