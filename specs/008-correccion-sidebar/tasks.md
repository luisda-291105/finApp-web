# Tasks — Spec 008: Modales Bloqueantes (Backdrop + Focus Trap)

## Tasks

### Tarea 1: DashboardUserModal — Ajustar Backdrop y Z-index + Tests
- **Archivos:** `src/components/layout/DashboardUserModal.jsx`, `src/components/layout/DashboardUserModal.test.jsx`
- **Descripción:**
  - Cambiar overlay: `className="fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-60"` → `bg-bg-dark/80 backdrop-blur-sm z-50`
  - Cambiar panel: `z-65` → `z-60`
  - Mantener: portal, FocusTrap, ESC, click backdrop, focus restoration, ARIA (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)
  - Actualizar tests: assertions de clases overlay (`z-50`, `bg-bg-dark/80`) y panel (`z-60`)
- **Test:** AC-01 (render portal + FocusTrap + backdrop), AC-02 (click backdrop → alCerrar), AC-03 (Escape → alCerrar), AC-08 (focus restoration a triggerRef)
- **Validación:** `npx vitest run src/components/layout/DashboardUserModal.test.jsx` + `npm test` + `npm run build`

### Tarea 2: DashboardDrawer — Backdrop + Focus Trap Condicional (esMobile)
- **Archivos:** `src/components/layout/DashboardDrawer.jsx`, `src/components/layout/DashboardDrawer.test.jsx`
- **Descripción:**
  - Añadir prop `esMobile` (boolean, default false) a la signatura
  - Si `esMobile && abierto`:
    - Renderizar via `createPortal` un fragment con: backdrop (`fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50`, `onClick={alCerrar}`, `aria-hidden="true"`) + panel envuelto en `FocusTrap` + `AnimatePresence`/`motion.div` (o CSS transition) con `z-55`
    - Panel: `fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-bg-dark/95 backdrop-blur-md border-l border-border-line/20 z-55` (slide desde derecha en mobile)
    - Manejar ESC (ya existe), click backdrop → `alCerrar`, focus restoration a `triggerRef`
  - Si `!esMobile` (tablet/desktop):
    - Comportamiento actual: solo panel slide-in lateral (`left-0`, `z-60`, sin backdrop, sin FocusTrap en portal)
  - Añadir `AnimatePresence` + `motion.div` de Framer Motion para animación entrada/salida en mobile (consistente con DashboardUserModal)
  - ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label="Menú de navegación"` (mobile) / mantener `aria-label="Navegación del dashboard"` (tablet)
- **Test:** AC-04 (mobile: renderiza FocusTrap + backdrop en portal), AC-05 (mobile: click backdrop → alCerrar), AC-06 (mobile: Escape → alCerrar), AC-07 (tablet: NO backdrop ni FocusTrap), AC-08 (focus restoration a triggerRef)
- **Validación:** `npx vitest run src/components/layout/DashboardDrawer.test.jsx` + `npm test` + `npm run build`

### Tarea 3: DashboardLayout — Pasar esMobile y triggerRef al Drawer Mobile
- **Archivos:** `src/layout/DashboardLayout.jsx`
- **Descripción:**
  - Crear `bottomNavMenuRef = useRef(null)` para el 5º item del BottomNav (trigger del drawer mobile)
  - Pasar `ref={bottomNavMenuRef}` al BottomNav en el item correspondiente (requiere cambio mínimo en BottomNav o pasar ref via props — *ver nota abajo*)
  - En drawer mobile (`isMobile`): `<DashboardDrawer abierto={mobileMenuAbierto} alCerrar={() => setMobileMenuAbierto(false)} triggerRef={bottomNavMenuRef} esMobile={true}>` 
  - En drawer tablet (`isTablet`): mantener `<DashboardDrawer abierto={drawerAbierto} alCerrar={() => setDrawerAbierto(false)} triggerRef={undefined} esMobile={false}>` (explícito por claridad)
  - Añadir effect para cerrar mobile drawer al salir de mobile: `useEffect(() => { if (!isMobile) setMobileMenuAbierto(false); }, [isMobile])`
- **Nota sobre BottomNav:** El 5º item es interno a BottomNav. Opción A: BottomNav expone ref via `forwardRef` + `useImperativeHandle`; Opción B: DashboardLayout pasa `alAbrirMenu` que setea estado y BottomNav maneja ref internamente. *Recomendación: Opción B más simple — BottomNav recibe `menuTriggerRef` prop y lo adjunta al 5º item.*
- **Test:** Integración — verificar que prop `esMobile` y `triggerRef` pasan correctamente (snapshot/render test)
- **Validación:** `npm test` + `npm run build`

---

## Orden de Ejecución

1. **Tarea 1** → DashboardUserModal (cambio mínimo, tests existentes cubren mayormente)
2. **Tarea 2** → DashboardDrawer (cambio principal, nueva lógica condicional)
3. **Tarea 3** → DashboardLayout (wiring final, integra todo)

---

## Notas de Implementación

- **Tokens Tailwind**: Usar `bg-bg-dark/80`, `backdrop-blur-sm`, `z-50`, `z-55`, `z-60` desde `@theme` en `src/styles/index.css` (no hardcodear valores)
- **FocusTrap**: Ya instalado (`focus-trap-react`). Configuración igual que DashboardUserModal: `clickDeactivates: false`, `escapeDeactivates: false`
- **Framer Motion**: Ya instalado. Usar `motion.div` + `AnimatePresence` para animación mobile drawer (fade + slide)
- **Resize handler**: DashboardLayout ya tiene effects para `isDesktop` e `isMobile`; añadir uno para cerrar mobile menu al dejar de ser mobile
- **Z-index stacking**: 
  - BottomNav: `z-50` (existente)
  - Mobile drawer backdrop: `z-50`
  - Mobile drawer panel: `z-55`
  - Modal backdrop: `z-50`
  - Modal panel: `z-60`
  - Tablet drawer panel: `z-60` (sin backdrop)