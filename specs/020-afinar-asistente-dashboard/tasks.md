# Tasks – Spec 020: Afinación del botón del asistente en el Dashboard

## T1 – Aplicar animación y microinteracciones al botón del asistente en el Dashboard
- **Descripción:** Modificar el botón flotante del asistente en `src/layout/DashboardLayout.jsx` para incluir `transition-all cursor-pointer hover:scale-105 hover:bg-emerald-hover`, preservando todos los estilos de foco, coordenadas y área segura actuales.
- **RF cubiertos:** RF-01, RF-02, RF-03, RF-05
- **Responsable:** implementer
- **Dependencias:** Ninguna
- **Hecho cuando:**
  - El botón `<button ref={asistenteTriggerRef} ...>` en `DashboardLayout.jsx` incluye las clases `transition-all`, `cursor-pointer`, `hover:scale-105` y `hover:bg-emerald-hover`.
  - Mantiene los atributos `aria-label="Abrir el asistente de ayuda"`, `data-respaldo-foco="excluir"` y el cálculo del safe-area.

## T2 – Actualizar pruebas unitarias en AsistenteDashboard.test.jsx
- **Descripción:** Añadir o actualizar aserciones en `src/test/layout/AsistenteDashboard.test.jsx` para verificar que el disparador del asistente expone las clases de microinteracción y animación requeridas.
- **RF cubiertos:** RF-01, RF-02, RF-03, RF-05
- **Responsable:** implementer
- **Dependencias:** T1
- **Hecho cuando:**
  - La suite `AsistenteDashboard.test.jsx` comprueba explícitamente las clases `hover:scale-105`, `transition-all`, `cursor-pointer` y `hover:bg-emerald-hover` en el disparador del asistente.
  - La prueba unitaria pasa exitosamente con `npm test -- src/test/layout/AsistenteDashboard.test.jsx`.

## T3 – Validación global del proyecto y build
- **Descripción:** Ejecutar la suite completa de tests de Vitest y verificar la compilación en producción con Vite.
- **RF cubiertos:** RF-04, RF-05
- **Responsable:** implementer / reviewer
- **Dependencias:** T2
- **Hecho cuando:**
  - `npm test` ejecuta y aprueba todas las pruebas de la suite sin regresiones.
  - `npm run build` genera el bundle de producción exitosamente sin errores de sintaxis ni assets rotos.

## T4 – Documentación y cierre en MEMORY.md
- **Descripción:** Registrar el cierre y las decisiones tomadas para la Spec 020 en `MEMORY.md`.
- **RF cubiertos:** N/A (documentación)
- **Responsable:** reviewer
- **Dependencias:** T3
- **Hecho cuando:**
  - `MEMORY.md` contiene la entrada de la Spec 020 con su estado cerrado y resumen de cambios.
