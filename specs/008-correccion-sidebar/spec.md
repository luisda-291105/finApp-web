# Spec 008 — Corrección Sidebar: Layout sin Header, Sidebar Full-Height, Logo como Toggle

**Estado:** borrador
**Fecha:** 2026-10-15
**Basada en:** Spec 007 (navegación responsive completa)

---

## 1. Propósito

Ajustar la navegación del dashboard tras la eliminación del `DashboardHeader` (ya comentado en `DashboardLayout.jsx`). El sidebar y drawer deben ocupar todo el alto de la viewport (`top-0`, `h-screen`), el logo "FinApp" pasa a ser el único control de colapso/expandido (sin chevron), y el contenido principal pierde el `pt-[var(--header-height)]`.

---

## 2. Alcance

**Componentes afectados:**
- `src/components/layout/SidebarResponsive.jsx` — Cambios mayores
- `src/components/layout/DashboardDrawer.jsx` — Cambios menores (altura)
- `src/layout/DashboardLayout.jsx` — Eliminación Header, ajustes de márgenes/main
- `src/styles/index.css` — Posible limpieza de `--header-height` si ya no se usa

**Fuera de alcance:**
- `SidebarNavContenido.jsx` (sin cambios, ya funciona)
- `BottomNav.jsx` (sin cambios)
- `DashboardUserModal.jsx` (sin cambios)
- `useBreakpoint.js` (sin cambios en API, solo consumo)
- Páginas de dashboard (`src/pages/PaginaDashboard*.jsx`)

---

## 3. Cambios vs Spec 007

| Aspecto | Spec 007 (actual) | Spec 008 (nuevo) |
|---------|-------------------|------------------|
| **DashboardHeader** | Renderizado siempre (fijo, `h-[var(--header-height)]`) | **Eliminado** del layout (ya comentado) |
| **SidebarResponsive posición** | `top-[var(--header-height)]`, `h-[calc(100vh-var(--header-height))]` | `top-0`, `h-screen` (o `h-[100vh]`) |
| **Logo en Sidebar** | Botón con logo + chevron `<`/`>`; `NavLink` a `/dashboard` | **Solo logo "FinApp" / "F"**; click → toggle colapso; **NO navega** |
| **Chevron toggle** | Presente (`ChevronLeft`/`ChevronRight`) | **Eliminado** |
| **DashboardDrawer altura** | `top-[var(--header-height)]`, `h-[calc(100vh-var(--header-height))]` | `top-0`, `h-screen` |
| **Main content padding-top** | `pt-[var(--header-height)]` | **Eliminado** (solo `pb-20` para BottomNav mobile) |
| **Tablet: apertura drawer** | Hamburger en `DashboardHeader` | **Sin header → sin hamburguesa**; definir alternativa (ver §5.10) |
| **Token `--header-height`** | Usado en Sidebar, Drawer, Main, Header | **Solo si lo usa otro componente**; si no, eliminar |

---

## 4. Requisitos Funcionales (EARS)

### RF-01: SidebarResponsive full-height sin header
**CUANDO** la viewport es desktop (≥1024px) **EL SISTEMA DEBE** renderizar `SidebarResponsive` con `top-0` y `h-screen` (o `h-[100vh]`), sin referenciar `--header-height`.

### RF-02: Logo como único toggle de colapso
**CUANDO** el usuario hace click en el área del logo en `SidebarResponsive` **EL SISTEMA DEBE** alternar el estado `colapsada` (expandido ↔ colapsado) vía callback `alToggleColapso`.

### RF-03: Logo expandido muestra "FinApp"
**CUANDO** `colapsada === false` **EL SISTEMA DEBE** renderizar el logo completo: `<span className="text-emerald-primary">Fin</span><span>App</span>` (o equivalente visual), sin chevron.

### RF-04: Logo colapsado muestra "F" o icono
**CUANDO** `colapsada === true` **EL SISTEMA DEBE** renderizar solo la inicial "F" (estilo coherente con la marca) o un icono representativo, sin texto "App", sin chevron.

### RF-05: Logo NO navega a `/dashboard`
**CUANDO** el usuario hace click en el logo **EL SISTEMA NO DEBE** navegar a `/dashboard` (el `NavLink` se elimina/sustituye por `button` puro). La navegación a inicio sigue disponible en el menú lateral (enlace "Inicio").

### RF-06: DashboardDrawer full-height
**CUANDO** se abre el drawer (tablet o mobile menú) **EL SISTEMA DEBE** renderizar el panel con `top-0` y `h-screen`, sin restar `--header-height`.

### RF-07: Main content sin padding-top de header
**CUANDO** se renderiza el área principal en `DashboardLayout` **EL SISTEMA DEBE** aplicar solo `pb-20` (para BottomNav mobile), **SIN** `pt-[var(--header-height)]`.

### RF-08: Avatar/modal en SidebarNavContenido (sin cambios)
**DADO QUE** `SidebarNavContenido` ya incluye el avatar al final **EL SISTEMA DEBE** mantenerlo funcionando igual (abre `DashboardUserModal`).

### RF-09: Tablet — apertura de drawer sin hamburguesa en header
**CUANDO** la viewport es tablet (640–1023px) **EL SISTEMA DEBE** proveer una forma de abrir el drawer de navegación. Como no hay header ni hamburguesa, se requiere decisión (ver §5.10).

### RF-10: Persistencia de estado colapsado
**EL SISTEMA DEBE** mantener la persistencia en `localStorage` (`sidebarCollapsed`) tal como la gestiona `useBreakpoint` (sin cambios).

---

## 5. Casos Límite y Decisiones Pendientes

### 5.1 Tablet: ¿Cómo se abre el drawer? (RF-09)
**Opciones:**
- **A) Botón flotante (FAB)** en esquina inferior derecha del main content (estilo "menú"), solo visible en tablet.
- **B) Gestura swipe desde borde izquierdo** (edge swipe) — requiere librería o implementación custom.
- **C) El logo "FinApp" en el sidebar no existe en tablet** (el sidebar no se renderiza fijo), así que no aplica.
- **D) BottomNav item "Menú" también en tablet** — extender BottomNav a tablet.
- **E) No hay drawer en tablet** — la navegación en tablet sería solo vía BottomNav (si se extiende) o enlaces directos.

**Recomendación inicial:** Opción A (FAB) o D (BottomNav en tablet). **Decisión pendiente del usuario.**

### 5.2 Logo colapsado: "F" vs Icono (RF-04)
- **Solo "F"** (texto): coherente con "FinApp", simple, accesible.
- **Icono** (ej. `Home`, `Wallet`, `Gem`): más visual, pero requiere decidir cuál.
- **Recomendación:** "F" con mismo estilo tipográfico que "FinApp" (font-display, emerald-primary).

### 5.3 Accesibilidad del logo-toggle (RF-02)
- El botón debe tener `aria-label` dinámico: `"Expandir navegación"` / `"Colapsar navegación"`.
- `aria-expanded` refleja `!colapsada`.
- Focus visible obligatorio (ya implementado en spec 007, mantener).

### 5.4 Transición de ancho (ya existe)
- `transition-all duration-300` en `aside` — mantener.
- El logo no debe "saltar" durante la transición (usar `min-width` o `overflow-hidden` en el contenedor del logo).

### 5.5 `--header-height` en CSS
- Si **ningún** componente lo usa tras esta spec, **eliminar** la variable de `src/styles/index.css` (línea 33).
- Verificar uso en `Header.jsx` (landing), `Container.jsx`, etc. antes de borrar.

### 5.6 Mobile: BottomNav + Drawer menú (sin cambios)
- BottomNav sigue fijo `bottom-0`, `z-50`.
- Drawer menú (5º item) sigue funcionando igual.
- Main content `pb-20` cubre BottomNav.

### 5.7 Desktop: Margen lateral del main (sin cambios)
- `lg:ml-64` (expandida) / `lg:ml-[72px]` (colapsada) — ya correcto en `DashboardLayout`.

---

## 6. API Actualizada

### SidebarResponsive.jsx
```jsx
// Props (sin cambios en firma, cambia comportamiento interno)
SidebarResponsive({
  colapsada: boolean,           // controlada desde useBreakpoint
  alToggleColapso: () => void,  // click en logo → toggle
  alAbrirUserModal: () => void  // pasa a SidebarNavContenido
})
```
**Cambio interno:** El botón del logo ya no es `NavLink` a `/dashboard`; es `button` que solo llama a `alToggleColapso`. Se elimina `ChevronLeft`/`ChevronRight`.

### DashboardDrawer.jsx
```jsx
// Props (sin cambios)
DashboardDrawer({
  abierto: boolean,
  alCerrar: () => void,
  children: ReactNode,        // SidebarNavContenido
  triggerRef?: RefObject<HTMLElement>
})
```
**Cambio interno:** Clases `top-0 h-screen` en lugar de `top-[var(--header-height)] h-[calc(100vh-var(--header-height))]`.

### DashboardLayout.jsx
```jsx
// Composición (sin DashboardHeader)
- Elimina import y render de DashboardHeader
- Main: className solo "pb-20" (quita pt-[var(--header-height)])
- Tablet: resolver apertura drawer (ver §5.1)
```

---

## 7. Pruebas de Aceptación (Criterios Verificables)

| ID | Escenario | Esperado |
|----|-----------|----------|
| AC-01 | Desktop, sidebar expandida | Sidebar `top-0 h-screen w-64`, logo "FinApp" visible, sin chevron |
| AC-02 | Desktop, click en logo "FinApp" | Sidebar colapsa a `w-[72px]`, logo muestra "F" |
| AC-03 | Desktop, sidebar colapsada, click en "F" | Sidebar expande a `w-64`, logo muestra "FinApp" |
| AC-04 | Desktop, click en logo | **NO** navega a `/dashboard` (URL no cambia) |
| AC-05 | Tablet, drawer abierto | Panel `top-0 h-screen w-[85vw] max-w-sm` |
| AC-06 | Mobile, main content | Sin `pt-[var(--header-height)]`, solo `pb-20` |
| AC-07 | Cualquier breakpoint, avatar en sidebar/drawer | Abre `DashboardUserModal` |
| AC-08 | Resize desktop→tablet | Drawer tablet se cierra (efecto existente), sidebar desaparece |
| AC-09 | Recarga página | Estado `colapsada` persistido en localStorage se respeta |

---

## 8. Dependencias Técnicas

- `lucide-react`: `Home`, `Receipt`, `CreditCard`, `Settings` (sin cambios), **eliminar** `ChevronLeft`, `ChevronRight` de `SidebarResponsive`.
- `clsx`, `react-router-dom` (`NavLink`), `focus-trap-react`, `react-dom` (portal) — sin cambios.
- Tailwind tokens: `bg-bg-dark`, `backdrop-blur-md`, `border-border-line`, `text-emerald-primary`, `text-bg-cream`, `text-slate-text`, `font-display` — sin cambios.

---

## 9. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Tablet sin forma de abrir drawer | Navegación inaccesible en tablet | Definir y implementar opción en §5.1 antes de cerrar spec |
| Logo "F" colapsado no es obvio como toggle | UX confusa | `aria-label` claro, tooltip opcional, focus visible fuerte |
| `--header-height` usado en otros layouts | Regression en landing/login | Grepear todo el codebase antes de eliminar variable CSS |
| Transición de ancho "salta" el logo | Glitch visual | Test manual en navegador; `overflow-hidden` en contenedor logo |

---

## 10. Próximos Pasos

1. **Usuario decide** opción para tablet (§5.1).
2. **Aprobar spec** → generar `plan.md` + `tasks.md`.
3. **Implementar** en orden: SidebarResponsive → DashboardDrawer → DashboardLayout → limpieza CSS.
4. **Validar**: `npm test`, `npm run build`, prueba visual en desktop/tablet/mobile.