# Plan de Implementación — Spec 008: Modales Bloqueantes (Backdrop + Focus Trap)

## Resumen de Cambios

| Componente | Cambio Principal | Archivos Afectados |
|------------|------------------|-------------------|
| `DashboardUserModal` | Ajustar backdrop a `bg-bg-dark/80 z-50`, panel a `z-60` (ya tiene focus trap, ESC, click backdrop) | `src/components/layout/DashboardUserModal.jsx`, `src/components/layout/DashboardUserModal.test.jsx` |
| `DashboardDrawer` | Añadir backdrop + focus trap **condicional** vía prop `esMobile` | `src/components/layout/DashboardDrawer.jsx`, `src/components/layout/DashboardDrawer.test.jsx` |
| `DashboardLayout` | Pasar `esMobile={isMobile}` al drawer mobile (5º item BottomNav) | `src/layout/DashboardLayout.jsx` |

---

## Estrategia de Implementación (Ordenada)

### 1. DashboardUserModal — Ajuste de Z-index y Backdrop
- Cambiar overlay: `bg-bg-dark/50 z-60` → `bg-bg-dark/80 z-50`
- Cambiar panel: `z-65` → `z-60`
- Mantener todo lo demás (portal, FocusTrap, ESC, click backdrop, focus restoration, ARIA)
- Actualizar tests para reflejar nuevos valores

### 2. DashboardDrawer — Backdrop + Focus Trap Condicional Mobile
- Añadir prop `esMobile` (boolean)
- Si `esMobile && abierto`: renderizar backdrop (`fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50`) + FocusTrap + panel `z-55` via portal
- Si `!esMobile`: comportamiento actual (solo panel slide-in, sin backdrop, `z-60`)
- Añadir `triggerRef` al drawer mobile para focus restoration (5º item BottomNav)
- Manejar resize breakpoint: cerrar drawer al cruzar 640px (ya existe en DashboardLayout)

### 3. DashboardLayout — Pasar `esMobile` y `triggerRef`
- Obtener ref del 5º item BottomNav (necesario para focus restoration)
- Pasar `esMobile={isMobile}` y `triggerRef={bottomNavMenuRef}` al drawer mobile
- El drawer tablet (`isTablet`) recibe `esMobile={false}` (implícito)

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Focus trap en mobile drawer rompe navegación por teclado | Tests unitarios AC-04..08 + validación manual en navegador |
| Z-index conflict con BottomNav (`z-50`) | Backdrop `z-50`, panel mobile `z-55` > BottomNav; modal `z-60` > drawer mobile |
| Resize 640px deja drawer abierto en estado incorrecto | DashboardLayout ya cierra drawers en `isMobile`/`isDesktop` effects; añadir effect para cerrar mobile drawer al salir de mobile |
| Portal doble (overlay + panel) en mobile drawer | Un solo `createPortal` con fragment `<>overlay + panel</>` igual que DashboardUserModal |
| Tests existentes fallen por cambio de clases | Actualizar assertions en tests existentes; añadir nuevos tests para condicional mobile |

---

## Criterios de Done

1. **DashboardUserModal**: Backdrop `bg-bg-dark/80 z-50`, panel `z-60`; todos los tests AC-01,02,03,08 pasan
2. **DashboardDrawer**: Con `esMobile=true` renderiza backdrop + FocusTrap + panel `z-55` en portal; con `esMobile=false` sin backdrop, panel `z-60`; tests AC-04..08 pasan
3. **DashboardLayout**: Pasa `esMobile={isMobile}` y `triggerRef` al drawer mobile; build y test suite completa pasan
4. **Validación manual**: En navegador, mobile (<640px) abre drawer desde 5º item → backdrop oscurece, focus trap cicla, ESC/click backdrop cierra, foco vuelve a 5º item; tablet (≥640px) abre drawer → sin backdrop, panel slide-in lateral

---

## Comandos de Validación

```bash
# Tests específicos
npx vitest run src/components/layout/DashboardUserModal.test.jsx
npx vitest run src/components/layout/DashboardDrawer.test.jsx
npx vitest run src/layout/DashboardLayout.test.jsx

# Suite completa + build
npm test
npm run build
```