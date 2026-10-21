# Tasks – Spec 021: Bolsillos Grupales y Reasignación de Icono de Contactos

## T1 – Actualizar iconografía y enlace de Bolsillos en la navegación [COMPLETADA]
- **Descripción:**
  - En `src/components/layout/SidebarNavContenido.jsx`, cambiar el icono de «Contactos» por `Contact` (de `lucide-react`) y agregar el nuevo enlace «Bolsillos» (`/dashboard/bolsillos`) con el icono `Users`.
  - En `src/components/layout/BottomNav.jsx`, cambiar el icono de «Contactos» por `Contact`.
- **RF cubiertos:** RF-01, RF-02
- **Responsable:** implementer
- **Dependencias:** Ninguna
- **Hecho cuando:**
  - `SidebarNavContenido.jsx` tiene 6 enlaces, con «Bolsillos» apuntando a `/dashboard/bolsillos` con `Users`, y «Contactos» usando `Contact`.
  - `BottomNav.jsx` usa el icono `Contact` para el elemento adaptativo de Contactos.

## T2 – Actualizar pruebas unitarias de navegación [COMPLETADA]
- **Descripción:** Actualizar las pruebas en `src/test/components/layout/SidebarNavContenido.test.jsx` y `src/test/components/layout/BottomNav.test.jsx` para reflejar los 6 enlaces y la nueva iconografía.
- **RF cubiertos:** RF-02
- **Responsable:** implementer
- **Dependencias:** T1
- **Hecho cuando:**
  - `SidebarNavContenido.test.jsx` valida los 6 enlaces, el icono `Contact` en Contactos y el icono `Users` en Bolsillos.
  - `npm test -- src/test/components/layout/SidebarNavContenido.test.jsx` y `npm test -- src/test/components/layout/BottomNav.test.jsx` pasan al 100%.

## T3 – Implementar la nueva página de Bolsillos Grupales y registrar ruta [COMPLETADA]
- **Descripción:**
  - Crear `src/pages/PaginaDashboardBolsillos.jsx` con el diseño completo de bolsillos de equipo, resumen métrico colectivo, fuentes compartidas, avatares agrupados y acción de compartir entrada.
  - Registrar la ruta `bolsillos` en `src/App.jsx` dentro del layout `DashboardLayout`.
- **RF cubiertos:** RF-01, RF-03, RF-04, RF-05, RF-06
- **Responsable:** implementer
- **Dependencias:** T1
- **Hecho cuando:**
  - La ruta `/dashboard/bolsillos` se renderiza dentro del dashboard autenticado.
  - La página expone el balance total grupal, las tarjetas de equipo y el botón funcional de «Compartir entrada» con retroalimentación visual accesible.

## T4 – Crear suite de pruebas para PaginaDashboardBolsillos [COMPLETADA]
- **Descripción:** Crear `src/test/pages/PaginaDashboardBolsillos.test.jsx` con pruebas de estructura, métricas, contenido, accesibilidad (ARIA) e interacción del botón de compartir.
- **RF cubiertos:** RF-01, RF-03, RF-04, RF-05, RF-06
- **Responsable:** implementer
- **Dependencias:** T3
- **Hecho cuando:**
  - Las pruebas unitarias cubren el montaje, títulos, métricas, tarjetas de equipo y feedback al compartir.
  - `npm test -- src/test/pages/PaginaDashboardBolsillos.test.jsx` pasa al 100%.

## T5 – Validación global del proyecto y build [COMPLETADA]
- **Descripción:** Ejecutar la suite completa de pruebas con Vitest y la compilación de producción con Vite.
- **RF cubiertos:** Todos
- **Responsable:** implementer / reviewer
- **Dependencias:** T2, T4
- **Hecho cuando:**
  - `npm test` pasa sin ninguna regresión en todas las suites de prueba (561/561 pruebas en 40 archivos).
  - `npm run build` genera el bundle sin errores.

## T6 – Documentación y cierre en MEMORY.md [COMPLETADA]
- **Descripción:** Registrar el estado y las decisiones de la Spec 021 en `MEMORY.md`.
- **RF cubiertos:** N/A (documentación)
- **Responsable:** reviewer
- **Dependencias:** T5
- **Hecho cuando:**
  - `MEMORY.md` refleja la Spec 021 como cerrada y documenta los cambios implementados.
