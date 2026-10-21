# Plan – Spec 021: Bolsillos Grupales y Reasignación de Icono de Contactos

## 1. Arquitectura y resumen del cambio

La feature introduce una nueva sección en el Dashboard de FinApp: **Bolsillos Grupales** (`/dashboard/bolsillos`). En esta vista, los equipos pueden visualizar y gestionar fondos compartidos, fuentes vinculadas y entradas colaborativas.

Además, por especificación de diseño:
1. El icono del destino «Contactos» se actualiza de `Users` a `Contact` (icono de libreta/lista de contactos móviles de `lucide-react`), tanto en la navegación lateral como en la barra inferior adaptable (`BottomNav`).
2. El icono `Users` se reasigna al nuevo destino «Bolsillos» en la navegación lateral, representando fielmente la naturaleza de equipos y bolsillos colectivos.
3. Se crea la página `PaginaDashboardBolsillos.jsx` con diseño coherente a las vistas del dashboard (Fluid Glass, tarjetas de bolsillo, resumen métrico y botón de compartir entrada).

## 2. Archivos afectados

| Archivo | Rol en el cambio |
|---|---|
| `src/pages/PaginaDashboardBolsillos.jsx` | Nueva página del Dashboard con tarjetas de bolsillos de equipo, resumen métrico colectivo y acción de compartir. |
| `src/App.jsx` | Registro de la ruta `bolsillos` dentro de la jerarquía de `/dashboard`. |
| `src/components/layout/SidebarNavContenido.jsx` | Actualización de icono de Contactos a `Contact` y adición del enlace a `/dashboard/bolsillos` con icono `Users`. |
| `src/components/layout/BottomNav.jsx` | Actualización del icono de Contactos en el elemento responsive (`Contact`). |
| `src/test/pages/PaginaDashboardBolsillos.test.jsx` | Suite de pruebas unitarias para la nueva vista de bolsillos grupales. |
| `src/test/components/layout/SidebarNavContenido.test.jsx` | Actualización de pruebas unitarias para reflejar los 6 enlaces y la nueva iconografía. |
| `src/test/components/layout/BottomNav.test.jsx` | Verificación de icono `Contact` en el 4.º ítem adaptativo. |
| `MEMORY.md` | Registro de cambios y cierre de la Spec 021. |

## 3. Decisiones técnicas justificadas y alternativas descartadas

- **Decisión 1 — Iconografía (`Contact` y `Users`):**
  - *Justificación:* El usuario solicitó explícitamente sustituir el icono de Contactos por uno similar a lista de contactos móviles (`https://iconscout.com/es/icons/lista-de-contactos-moviles`), y reutilizar el icono actual de personas (`Users`) para Bolsillos. `lucide-react` dispone del icono nativo `Contact`, que representa una tarjeta/libreta de contactos personales.
  - *Alternativa descartada:* Usar `Smartphone` o un SVG inline externo. Descartada para mantener consistencia tipográfica e iconográfica de `lucide-react` en todo el proyecto.

- **Decisión 2 — Datos simulados enriquecidos para Bolsillos Grupales:**
  - *Justificación:* En línea con las páginas `PaginaDashboardContactos`, `PaginaDashboardCorreos` y `PanelTarjetas`, la vista presenta 3 bolsillos de equipo estructurados («Gastos Operativos», «Viaje y Retiro de Equipo», «Fondo Común de Innovación»), mostrando métricas de aporte, balance, fuentes compartidas y avatares agrupados.
  - *Alternativa descartada:* Página vacía con un solo párrafo de texto. Descartada porque no aporta valor de demostración ni permite validar la experiencia de compartir entradas solicitada por el usuario.

- **Decisión 3 — Interacción de compartir accesible con fallback:**
  - *Justificación:* Al hacer click en «Compartir entrada» o «Copiar enlace», se intenta usar `navigator.clipboard.writeText` con captura de excepciones para entornos de test (jsdom) o navegadores sin permisos, mostrando un estado temporal de confirmación visual («¡Enlace copiado!»).
  - *Alternativa descartada:* Forzar modales pesados o redirecciones externas.

## 4. Pruebas y validaciones (Vitest)

1. `PaginaDashboardBolsillos.test.jsx`:
   - Renderiza encabezado, resumen colectivo y tarjetas de bolsillos grupales.
   - Valida la interacción del botón «Compartir entrada» y su estado de confirmación.
   - Verifica atributos de accesibilidad (`aria-label`, contraste y roles).
2. `SidebarNavContenido.test.jsx`:
   - Valida el renderizado de los 6 enlaces (`Inicio`, `Transacciones`, `Tarjetas`, `Bolsillos`, `Contactos`, `Correos`).
   - Verifica que `Contactos` use la clase/icono de `Contact` y `Bolsillos` use `Users`.
3. `BottomNav.test.jsx`:
   - Valida que en pantallas entre 470px y 750px el 4.º ítem muestre `Contactos` con el icono actualizado.
4. Regresión completa:
   - `npm test` (todas las pruebas del proyecto).
   - `npm run build` (compilación correcta de Vite).

## 5. Trazabilidad con Requisitos Funcionales

| Requisito Funcional | Implementación | Verificación |
|---|---|---|
| **RF-01** (Ruta Bolsillos) | `App.jsx` ruta `/dashboard/bolsillos` | Test de renderizado y navegación |
| **RF-02** (Iconografía) | `SidebarNavContenido.jsx` y `BottomNav.jsx` | Tests unitarios de componentes |
| **RF-03** (Resumen métrico) | `PaginaDashboardBolsillos.jsx` | Test unitario de contenido y métricas |
| **RF-04** (Tarjetas de equipo) | `PaginaDashboardBolsillos.jsx` | Test unitario de bolsillos y miembros |
| **RF-05** (Compartir entrada) | Botón interactivo con estado de feedback | Test unitario con evento click |
| **RF-06** (Accesibilidad WCAG AA) | Tokens, safe-area y roles semánticos | Tests ARIA y visuales |
