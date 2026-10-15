# Tasks 007 — Navegación Responsive Dashboard

**Estado:** borrador
**Plan base:** `specs/007-navegacion-responsive-dashboard/plan.md`
**Máx. 10 tareas** — orden de ejecución, cada una con RF cubiertos y criterios verificables.

---

## Tarea 1 — Setup: dependencias, tokens CSS y config usuario mock

**RF cubiertos:** RF-08, RF-12, RF-13, RF-15
**Archivos:**
- `package.json` (añadir deps)
- `src/styles/index.css` (tokens)
- `src/config/app.config.js` (getUsuarioMock)

**Pasos:**
1. `npm install lucide-react@^0.4 clsx@^2.1 focus-trap-react@^10 --save`
2. En `src/styles/index.css` → `@theme`:
   - `--header-height: 64px` (o valor medido real)
   - Utilidad `.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 1rem); }` → clase `pb-safe`
   - Verificar tokens existentes: `bg-bg-dark`, `bg-bg-cream`, `border-border-line`, `emerald-primary`, `mint-accent`, `slate-text`
3. En `src/config/app.config.js`:
   ```js
   export const getUsuarioMock = () => ({
     nombre: 'Usuario Demo',
     iniciales: 'UD',
     email: 'demo@finapp.local'
   });
   ```
4. Aplicar header JSDoc (`.agents/file-header-template.md`) a archivos modificados/nuevos

**Hecho cuando:**
- [ ] `npm install` completa sin warnings de peer deps
- [ ] `--header-height` usable como `h-[var(--header-height)]` y `pt-[var(--header-height)]`
- [ ] Clase `pb-safe` aplica `env(safe-area-inset-bottom)` con fallback
- [ ] `getUsuarioMock()` exportada y retorna objeto exacto especificado
- [ ] No hay hexadecimales nuevos en `index.css` (solo tokens `@theme`)

---

## Tarea 2 — Hook `useBreakpoint` (breakpoints unificados + persistencia sidebar)

**RF cubiertos:** RF-04
**Archivos:**
- `src/hooks/useBreakpoint.js` (nuevo)
- `src/hooks/useBreakpoint.test.js` (nuevo)

**Implementación (patrón SSR exacto):**
```js
// useBreakpoint.js
import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [sidebarColapsada, setSidebarColapsada] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return JSON.parse(localStorage.getItem('sidebarCollapsed')) ?? false; }
    catch { return false; }
  });

  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === 'undefined') return { isMobile: false, isTablet: false, isDesktop: true };
    const w = window.innerWidth;
    return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
  });

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 639px)');
    const mqTablet = window.matchMedia('(min-width: 640px) and (max-width: 1023px)');
    const mqDesktop = window.matchMedia('(min-width: 1024px)');

    const handler = () => setBreakpoint({
      isMobile: mqMobile.matches,
      isTablet: mqTablet.matches,
      isDesktop: mqDesktop.matches,
    });

    mqMobile.addEventListener('change', handler);
    mqTablet.addEventListener('change', handler);
    mqDesktop.addEventListener('change', handler);
    handler(); // sync inicial

    return () => {
      mqMobile.removeEventListener('change', handler);
      mqTablet.removeEventListener('change', handler);
      mqDesktop.removeEventListener('change', handler);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarColapsada));
  }, [sidebarColapsada]);

  const toggleSidebar = () => setSidebarColapsada(c => !c);

  return { ...breakpoint, sidebarColapsada, toggleSidebar };
}
```

**Tests (`useBreakpoint.test.js`):**
- Mock `window.innerWidth` + `matchMedia` → verifica `isMobile`/`isTablet`/`isDesktop` en 3 rangos
- Persistencia: `localStorage.setItem` llamado al cambiar `sidebarColapsada`
- Cleanup: listeners removidos en unmount
- SSR: `useState` initializer no accede `window`/`localStorage` en servidor

**Hecho cuando:**
- [ ] `useBreakpoint()` retorna 5 props exactas tipadas
- [ ] Breakpoints: `<640` → mobile, `640–1023` → tablet, `≥1024` → desktop
- [ ] `sidebarColapsada` persiste en `localStorage` y se restaura (SSR-safe)
- [ ] `toggleSidebar` alterna estado
- [ ] Test suite `npx vitest run src/hooks/useBreakpoint.test.js` → **PASS**

---

## Tarea 3 — `DashboardUserModal` (modal global, portal, slots fijos, Framer Motion)

**RF cubiertos:** RF-11, RF-07, RF-08, RF-09
**Archivos:**
- `src/components/layout/DashboardUserModal.jsx` (nuevo)
- `src/components/layout/DashboardUserModal.test.jsx` (nuevo)

**Props:** `{ abierto: boolean, alCerrar: () => void }` — **sin `children`**

**Estructura:**
- Portal: `createPortal(..., document.body)`
- Overlay: `fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-60` + click → `alCerrar`
- Panel: `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-bg-cream/95 backdrop-blur-md border border-border-line/30 rounded-2xl shadow-xl z-65`
- Focus trap: `focus-trap-react` (FocusTrap wrapper) → foco en primer botón, Tab cicla, ESC → `alCerrar`
- Al cerrar: `alCerrar()` + devolver foco al avatar trigger (pasado via `ref` o `onClose` callback)
- Animación: `motion.div` (Framer Motion) `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}`
- Slots fijos:
  - Header: "Cuenta"
  - Profile: botón "Configuración" → `navigate('/dashboard/configuracion')` + `alCerrar()`
  - Logout: botón "Salir del demo" → `navigate('/', { replace: true })` + `alCerrar()`
- Accesibilidad: `role="dialog" aria-modal="true" aria-labelledby="user-modal-title"`

**Tests:**
- Portal render en `document.body`
- Overlay click / ESC → `alCerrar`
- Focus trap: Tab cicla dentro, no escapa
- Slots: "Configuración" navega, "Salir del demo" → `/` (replace)
- Foco retorna a avatar trigger (mock ref)
- Framer Motion: clases/animación presentes

**Hecho cuando:**
- [ ] Componente renderiza sin errores consola (portal, focus-trap, motion)
- [ ] `alCerrar` llamado en overlay click, ESC, y ambos botones
- [ ] Navegación correcta: Configuración → `/dashboard/configuracion`, Salir demo → `/` (replace)
- [ ] Focus trap funcional (test + manual Tab)
- [ ] Test suite `npx vitest run src/components/layout/DashboardUserModal.test.jsx` → **PASS**
- [ ] Header JSDoc completo

---

## Tarea 4 — `SidebarNavContenido` (contenido navegación compartido, stateless)

**RF cubiertos:** RF-14, RF-07, RF-08, RF-15
**Archivos:**
- `src/components/layout/SidebarNavContenido.jsx` (nuevo)
- `src/components/layout/SidebarNavContenido.test.jsx` (nuevo)

**Props:** `{ alAbrirUserModal: () => void }`

**Estructura:**
- 4 `NavLink` (react-router) con icono `lucide-react` + etiqueta:
  1. `/dashboard` — `Home` — "Inicio"
  2. `/dashboard/transacciones` — `Receipt` — "Transacciones"
  3. `/dashboard/tarjetas` — `CreditCard` — "Tarjetas"
  4. `/dashboard/configuracion` — `Settings` — "Configuración"
- Separador `<hr className="border-border-line/20 my-3" />`
- Avatar: círculo `w-10 h-10 rounded-full bg-emerald-primary flex items-center justify-center text-bg-cream font-medium` con `getUsuarioMock().iniciales` → click → `alAbrirUserModal()`
- Iconos: `flex-shrink-0 w-6 h-6`
- Etiquetas: `truncate` + `min-w-0` en contenedor
- Sin estado propio, sin lógica navegación (delega a `NavLink`)

**Tests:**
- 4 `NavLink` renderizados con href e iconos correctos
- Avatar renderizado con iniciales de `getUsuarioMock()`
- Click avatar → `alAbrirUserModal` llamado
- Sin lógica propia de navegación (no llama `navigate`)

**Hecho cuando:**
- [ ] Componente stateless, solo props `alAbrirUserModal`
- [ ] 4 enlaces + avatar + separador renderizados
- [ ] Iconos `lucide-react` con `flex-shrink-0 w-6 h-6`
- [ ] Click avatar dispara callback
- [ ] Test suite `npx vitest run src/components/layout/SidebarNavContenido.test.jsx` → **PASS**
- [ ] Header JSDoc completo

---

## Tarea 5 — `SidebarResponsive` (sidebar desktop colapsable, dark glass, logo toggle)

**RF cubiertos:** RF-01, RF-07, RF-08, RF-09, RF-13
**Archivos:**
- `src/components/layout/SidebarResponsive.jsx` (nuevo, reemplaza Sidebar.jsx)
- `src/components/layout/SidebarResponsive.test.jsx` (nuevo, reescritura completa)

**Props:** `{ colapsada: boolean, alToggleColapso: () => void, alAbrirUserModal: () => void }`

**Estructura:**
- `<aside className="fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] z-40 transition-all duration-300 bg-bg-dark/80 backdrop-blur-md border-r border-border-line/20" style={{ width: colapsada ? '72px' : '256px' }} role="navigation" aria-label="Navegación principal del dashboard">`
- Logo area (click → `alToggleColapso`):
  - Expandida: `<NavLink to="/dashboard">FinApp</NavLink>` + `ChevronLeft` icon
  - Colapsada: `<NavLink to="/dashboard" title="Inicio"><Home className="w-6 h-6" /></NavLink>` + `ChevronRight` icon
  - `aria-expanded={!colapsada}` en botón toggle
- Navegación: usa `SidebarNavContenido` (expandida) — **solo si `!colapsada` renderiza etiquetas** (lógica interna o CSS `hidden` en colapsada)
  - Opción CSS: `.sidebar-collapsed .nav-label { display: none; }` + clase condicional en aside
- Avatar: parte inferior (sticky bottom), usa `SidebarNavContenido` avatar o replicado
- Tooltip nativo: `title="Inicio"` en icono Home colapsada

**Tests (reescritura completa — NO migración):**
- Render colapsada/expandida (props controladas)
- Logo toggle: expandida = link "FinApp", colapsada = icono Home + tooltip + chevron right
- 4 enlaces + avatar renderizados (expandida)
- Estado colapsada oculta etiquetas (CSS o condicional)
- `aria-expanded` correcto en toggle
- `top-[var(--header-height)]` y height calc aplicados
- Fondo dark glass tokens

**Hecho cuando:**
- [ ] Sidebar fija desktop, altura completa bajo header (`top-[var(--header-height)]`)
- [ ] Colapsada 72px / expandida 256px (w-64), transición 300ms
- [ ] Logo toggle funciona: link Home expandida, icono Home+tooltip colapsada
- [ ] `alToggleColapso` llamado al click logo/chevron
- [ ] Avatar → `alAbrirUserModal`
- [ ] Fondo `bg-bg-dark/80 backdrop-blur-md` (tokens)
- [ ] Test suite `npx vitest run src/components/layout/SidebarResponsive.test.jsx` → **PASS**
- [ ] Header JSDoc completo

---

## Tarea 6 — `DashboardDrawer` (drawer tablet/mobile, portal, focus trap, ancho responsive)

**RF cubiertos:** RF-02, RF-07, RF-08, RF-09
**Archivos:**
- `src/components/layout/DashboardDrawer.jsx` (nuevo)
- `src/components/layout/DashboardDrawer.test.jsx` (nuevo)

**Props:** `{ abierto: boolean, alCerrar: () => void, children: ReactNode }`

**Estructura:**
- Portal: `createPortal(..., document.body)`
- Overlay: `fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-55` + click → `alCerrar`
- Panel: `fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-[85vw] max-w-sm bg-bg-dark/95 backdrop-blur-md border-r border-border-line/20 z-60 transform transition-transform duration-300 ease-out`
  - Abierto: `translate-x-0`
  - Cerrado: `-translate-x-full`
- Focus trap: `FocusTrap` (focus-trap-react) wrapea panel
  - `onActivate`: foco en primer enlace (`children` primer `NavLink` o focusable)
  - `onDeactivate`: `alCerrar()` + devolver foco a trigger (pasar `returnFocusRef` via context o prop)
- ESC → `alCerrar` (FocusTrap maneja o handler propio)
- `children` renderizado dentro (esperado: `SidebarNavContenido`)

**Tests:**
- Portal render en `document.body`
- `abierto=false` → no renderiza nada (o renderiza oculto)
- Overlay click → `alCerrar`
- ESC → `alCerrar`
- Focus trap: Tab cicla dentro de `children`, no escapa
- Foco retorna a trigger (mock ref)
- Ancho: `w-[85vw] max-w-sm` (computed style)
- `top-[var(--header-height)]` y height calc

**Hecho cuando:**
- [ ] Drawer slide-in/out suave (transform + transition)
- [ ] Overlay backdrop-blur, click cierra
- [ ] Focus trap funcional (Tab/Shift+Tab dentro, ESC cierra, foco retorno)
- [ ] Ancho responsive `85vw` máx `max-w-sm` (384px)
- [ ] `top-[var(--header-height)]` correcto
- [ ] Test suite `npx vitest run src/components/layout/DashboardDrawer.test.jsx` → **PASS**
- [ ] Header JSDoc completo

---

## Tarea 7 — `BottomNav` (barra mobile 5 items, safe-area, active indicator, landscape)

**RF cubiertos:** RF-03, RF-07, RF-08, RF-09, RF-13
**Archivos:**
- `src/components/layout/BottomNav.jsx` (nuevo)
- `src/components/layout/BottomNav.test.jsx` (nuevo)

**Props:** `{ itemActivo: string, alNavegar: (ruta: string) => void, alAbrirMenu: () => void }`

**Items (orden fijo):**
| Ruta | Etiqueta | Icono | Nota |
|---|---|---|---|
| `/dashboard` | Inicio | `Home` | |
| `/dashboard/transacciones` | Transacciones | `Receipt` | |
| `/dashboard/tarjetas` | Tarjetas | `CreditCard` | |
| `/dashboard/configuracion` | Configuración | `Settings` | **Único acceso Config en mobile** |
| (acción) | Menú | `MoreHorizontal` | `onClick={alAbrirMenu}` |

**Estilo:**
- `fixed bottom-0 left-0 right-0 z-50 bg-bg-dark/80 backdrop-blur-md border-t border-border-line/20 pb-safe`
- `grid grid-cols-5` items equidistantes
- Item: `flex flex-col items-center gap-1 px-2 py-2 min-w-0`
  - Icono: `flex-shrink-0 w-6 h-6`
  - Etiqueta: `text-xs font-medium truncate bottom-nav-label`
- Activo: `text-emerald-primary` + indicador `absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-primary rounded-full`
- Inactivo: `text-slate-text hover:text-emerald-primary/70`
- Landscape: `@media (orientation: landscape) { .bottom-nav-label { display: none; } }` (clase en etiqueta)

**Tests:**
- 5 items renderizados con iconos/etiquetas correctos
- Item activo muestra indicador superior + color emerald
- Click item 1-4 → `alNavegar(ruta)`
- Click item 5 (Menú) → `alAbrirMenu()`
- Clase `pb-safe` presente
- Media query landscape oculta etiquetas (test con `window.matchMedia` mock)

**Hecho cuando:**
- [ ] 5 items fijos renderizados, orden correcto
- [ ] Item activo: color emerald + barra superior
- [ ] Navegación items 1-4 funciona
- [ ] Item 5 "Menú" llama `alAbrirMenu`
- [ ] `pb-safe` aplica safe-area (visual device toolbar)
- [ ] Landscape oculta etiquetas (media query, no `hidden lg:flex`)
- [ ] Test suite `npx vitest run src/components/layout/BottomNav.test.jsx` → **PASS**
- [ ] Header JSDoc completo

---

## Tarea 8 — `DashboardHeader` (header exclusivo dashboard, tokens puros, hamburguesa/toggle/avatar)

**RF cubiertos:** RF-05, RF-07, RF-08, RF-09, RF-12, RF-13, RF-15
**Archivos:**
- `src/components/layout/DashboardHeader.jsx` (nuevo)
- `src/components/layout/DashboardHeader.test.jsx` (nuevo)

**Props:**
```js
{
  alAbrirDrawer: () => void,        // tablet: hamburguesa
  alToggleSidebar: () => void,      // desktop: toggle colapso
  sidebarColapsada: boolean,        // desktop: estado para chevron
  usuario: { nombre, iniciales, email }, // getUsuarioMock()
  alAbrirUserModal: () => void      // avatar click
}
```

**Comportamiento (modo dashboard):**
- Fondo: `bg-bg-cream/92 backdrop-blur-md border-b border-border-line py-3.5 shadow-sm` (fijo, **sin transición scroll**)
- Altura: `h-[var(--header-height)]` (define/usa CSS custom prop)
- Izquierda:
  - Desktop (`!isMobile`): logo "FinApp" (link `/dashboard`) + botón toggle sidebar (`ChevronLeft`/`ChevronRight` según `sidebarColapsada`) → `alToggleSidebar`
  - Tablet (`isTablet`): botón hamburguesa (`Menu`) → `alAbrirDrawer`
  - Mobile: nada (logo en bottom nav)
- Derecha: avatar círculo `w-8 h-8 bg-emerald-primary text-bg-cream font-medium` con `usuario.iniciales` → click → `alAbrirUserModal`
- **100% tokens** — eliminar cualquier hex legacy (`#...`, `rgb(...)` hardcoded)
- `Header.jsx` (landing) **sin cambios**

**Tests:**
- Desktop: logo link + toggle sidebar render, chevron correcto según `sidebarColapsada`
- Tablet: hamburguesa render, click → `alAbrirDrawer`
- Avatar render con iniciales `getUsuarioMock()`, click → `alAbrirUserModal`
- Fondo tokens puros (grep hex → 0)
- Altura `h-[var(--header-height)]`
- Modal slots: "Configuración" navega, "Salir del demo" → `/` (via `DashboardUserModal` integration test o mock)

**Hecho cuando:**
- [ ] Header renderiza modo dashboard según breakpoint (props controladas)
- [ ] Desktop: logo link + toggle; Tablet: hamburguesa; Mobile: solo avatar
- [ ] Avatar usa `getUsuarioMock()` (iniciales dinámicas)
- [ ] Click avatar abre `DashboardUserModal` (integración)
- [ ] **Cero hexadecimales** en JSX/JS del componente
- [ ] Test suite `npx vitest run src/components/layout/DashboardHeader.test.jsx` → **PASS**
- [ ] Header JSDoc completo

---

## Tarea 9 — `DashboardLayout` (composición completa, márgenes/padding condicionales, integración global)

**RF cubiertos:** RF-06, RF-10, RF-07, RF-08
**Archivos:**
- `src/layout/DashboardLayout.jsx` (reescritura completa)
- `src/layout/DashboardLayout.test.jsx` (nuevo, reemplaza esqueleto)

**Composición (ver spec pseudocódigo):**
- `useBreakpoint()` → `isMobile`, `isTablet`, `isDesktop`, `sidebarColapsada`, `toggleSidebar`
- Estados locales: `drawerAbierto`, `mobileMenuAbierto`, `userModalAbierto`
- `useNavigate`, `useLocation` para `BottomNav`
- Render condicional:
  - `DashboardHeader` (siempre, props según breakpoint)
  - `SidebarResponsive` (si `isDesktop`)
  - `DashboardDrawer` (si `isTablet` → `drawerAbierto`; children: `SidebarNavContenido`)
  - Área principal: `div` con `className={cn("min-h-screen bg-bg-cream transition-all duration-300", isDesktop && sidebarColapsada ? "lg:ml-[72px]" : "lg:ml-64", !isDesktop && "ml-0")}`
    - `Container` > `main` con `pt-[var(--header-height)]` + `pb-20` (mobile bottom nav space)
    - `Outlet`
  - `BottomNav` (si `isMobile`)
  - `DashboardDrawer` mobile menú (si `isMobile` → `mobileMenuAbierto`; children: `SidebarNavContenido`)
  - `DashboardUserModal` (global, siempre al final, `abierto={userModalAbierto}`)
- Efectos resize:
  - `useEffect(() => { if (isDesktop) setDrawerAbierto(false); }, [isDesktop])`
  - `useEffect(() => { if (isMobile) setDrawerAbierto(false); }, [isMobile])`

**Tests:**
- Desktop: SidebarResponsive + DashboardHeader + Container+Outlet + UserModal; margen `lg:ml-64`/`lg:ml-[72px]`
- Tablet: DashboardHeader (hamburguesa) + DashboardDrawer (condicional) + Container+Outlet; margen `ml-0`
- Mobile: DashboardHeader (avatar) + BottomNav + DashboardDrawer menú (condicional) + Container+Outlet; padding `pt-[var(--header-height)]` + `pb-20`
- Outlet renderizado en todos
- `DashboardUserModal` global (portal) presente
- Transiciones resize: tablet→desktop cierra drawer, etc. (verificar calls a setters)

**Hecho cuando:**
- [ ] Composición correcta en 3 breakpoints (verificado test + visual)
- [ ] Márgenes laterales: desktop `lg:ml-64` expandida / `lg:ml-[72px]` colapsada; tablet/mobile `ml-0`
- [ ] Padding superior: `pt-[var(--header-height)]` en main
- [ ] Padding inferior mobile: `pb-20` para BottomNav
- [ ] `DashboardUserModal` global al final (z-index correcto)
- [ ] Resize transiciones: efectos cierran drawers apropiados
- [ ] Test suite `npx vitest run src/layout/DashboardLayout.test.jsx` → **PASS**
- [ ] Header JSDoc completo

---

## Tarea 10 — Limpieza, tests regresión, validación final y commit

**RF cubiertos:** RF-08, RF-09, RF-10, RF-12 (eliminación), todos (integración)
**Archivos:**
- `src/components/layout/Sidebar.jsx` (eliminar)
- `src/App.test.jsx` (regresión rutas)
- Suite completa `npm test`
- Build `npm run build`
- `MEMORY.md` actualización

**Pasos:**
1. **Eliminar `Sidebar.jsx` legacy:**
   - `rm src/components/layout/Sidebar.jsx`
   - `grep -r "from.*Sidebar" src/` → 0 resultados (excepto tests nuevos)
   - `grep -r "Sidebar" src/App.jsx src/layout/` → solo `SidebarResponsive`
2. **Test regresión `App.test.jsx`:**
   - Render `<App />` con `MemoryRouter`
   - Navegar `/dashboard`, `/dashboard/transacciones`, `/dashboard/tarjetas`, `/dashboard/configuracion`
   - Verificar `DashboardLayout` monta sin errores
3. **Suite completa:** `npm test` → **todas PASS** (9 suites nuevas/modificadas + regresión)
4. **Build producción:** `npm run build` → sin errores, bundle size razonable
5. **Validaciones manuales (checklist plan §7):**
   - Grep hex legacy en `src/components/layout/` → 0
   - Grep `variables.css` → 0
   - Flujo desktop/tablet/mobile manual
   - Resize transiciones
   - Fluid Glass ≤3 superficies (DevTools)
   - Safe area mobile (device toolbar)
6. **Actualizar `MEMORY.md`** con decisiones:
   - Logout "Salir del demo" → `/` (replace)
   - Usuario mock centralizado `getUsuarioMock()`
   - Iconos `lucide-react` (11)
   - Z-index scale documentada
   - Slots fijos modal (Configuración + Salir demo)
   - Avatar SVG inline via `getUsuarioMock()`
   - Breakpoints Tailwind nativo (sm/md/lg)
   - Header separado `DashboardHeader`
   - `SidebarNavContenido` compartido
   - Safe-area resuelto `pb-safe`
   - Fluid Glass ≤3 superficies por viewport
   - `variables.css` eliminado, solo `@theme`
   - Framer Motion solo en modal
7. **Commit:**
   - `git add` solo archivos del cambio (listar)
   - Mensaje: `feat: navegación responsive dashboard completa (spec 007)`

**Hecho cuando:**
- [ ] `Sidebar.jsx` eliminado sin referencias rotas
- [ ] `npm test` → **100% PASS** (incluye regresión App)
- [ ] `npm run build` → **SUCCESS**
- [ ] Grep hex legacy en layout → 0 resultados
- [ ] Grep `variables.css` → 0 resultados
- [ ] Validaciones manuales checklist §7 → todas OK
- [ ] `MEMORY.md` actualizado con 12+ decisiones documentadas
- [ ] Commit realizado, mensaje imperativo español, staging limpio

---

## Resumen de orden y dependencias

```
T1 (Setup) 
  → T2 (useBreakpoint) 
    → T3 (DashboardUserModal) 
      → T4 (SidebarNavContenido) 
        → T5 (SidebarResponsive) 
          → T6 (DashboardDrawer) 
            → T7 (BottomNav) 
              → T8 (DashboardHeader) 
                → T9 (DashboardLayout) 
                  → T10 (Limpieza + Validación + Commit)
```

**Tiempo estimado total:** 3-4 días (22 subtareas atómicas agrupadas en 10 tareas ejecutables)