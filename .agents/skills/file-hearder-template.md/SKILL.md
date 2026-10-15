# .agents/file-header-template.md

Todo archivo nuevo (componente, hook, config) inicia con este bloque,
resumido al máximo (1 línea por campo cuando sea posible):

```js
/** doc  
 * @uso        Qué problema resuelve este archivo (1 línea)
 * @funciones  Lista corta de funciones/exports principales
 * @datos      Cómo entra/sale la data (props, fetch, transformaciones)
 * @eventos    Eventos que dispara o escucha (onClick, onSubmit, etc.)
 * @estados    useState/useReducer relevantes que maneja
 * @usadoPor   Componentes/páginas que lo consumen
 */
```

## Ejemplo — hook
```js
/**doc 
 * @uso        Detecta si un elemento entró al viewport para animar reveal
 * @funciones  useReveal(ref, options)
 * @datos      Recibe un ref de DOM, no transforma data externa
 * @eventos    IntersectionObserver -> agrega clase "revealed"
 * @estados    isVisible (boolean)
 * @usadoPor   Hero, Stats, Features, ComoFunciona
 */
```

## Ejemplo — config de endpoints
```js
/**doc 
 * @uso        Punto único de acceso a endpoints del backend
 * @funciones  getEndpoint(nombre), API_BASE_URL
 * @datos      Lee de variables de entorno (import.meta.env)
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Cualquier componente/hook que haga fetch
 */
```

## Ejemplo — completo con crecimiento 
```js

/** doc
 * @uso        Layout completo del dashboard (composición global responsive)
 * @funciones  DashboardLayout()
 * @datos      Orquesta DashboardHeader, SidebarResponsive, DashboardDrawer (tablet + mobile), BottomNav, Container, Outlet, DashboardUserModal
 * @eventos    Resize breakpoints (cierra drawers), navegación BottomNav, apertura modal usuario
 * @estados    drawerAbierto (tablet), mobileMenuAbierto (mobile menú), userModalAbierto (global)
 * @usadoPor   App.jsx (rutas /dashboard/*)

 * DashboardLayout
 * Composición raíz del área autenticada (dashboard). Integra header, navegación lateral
 * (sidebar desktop / drawer tablet / drawer mobile menú), navegación inferior (mobile),
 * área de contenido con Outlet y modal de usuario global.
 *
 * Breakpoints (vía useBreakpoint):
 * - Desktop (≥1024px): SidebarResponsive fija + Header con toggle + Container con margen lateral
 * - Tablet (640–1023px): Header con hamburguesa + Drawer condicional + Container sin margen
 * - Mobile (<640px): Header solo avatar + BottomNav + Drawer menú condicional + Container con padding inferior
 *
 * Márgenes/padding condicionales:
 * - Desktop expandida: lg:ml-64 | colapsada: lg:ml-[72px]
 * - Tablet/Mobile: ml-0
 * - Main: pb-20 (bottom nav mobile)
 *
 * @returns {JSX.Element} Layout completo del dashboard
 */

Regla: si el archivo crece y el header deja de ser un resumen (>6-7 líneas
de contenido real por campo), el archivo probablemente debe dividirse.
