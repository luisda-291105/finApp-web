# Tasks — Spec 024: Modal de perfil

| # | Tarea | RF | Hecho cuando |
|---|-------|----|--------------|
| 1 | **Crear y configurar `ModalPerfilUsuario.jsx`** | RF‑05 | Archivo con modal de presentación y edición con FocusTrap y `aria-modal="true"`. |
| 2 | **Actualizar referencias en `PaginaDashboardConfiguracion.jsx`** | RF‑04 | Estado local `modalPerfilAbierto`, botón “Ver perfil” y eliminación del botón “Crear usuario”. |
| 3 | **Agregar test de apertura e interacción del modal** | RF‑04 y RF‑06 | Vitest+Testing‑Library verifica título, datos y botón “Modificar”. |
| 4 | **Agregar test de cierre del modal** | RF‑10 | Confirma cierre por Escape, clic fuera y mantenidas accesibilidad. |
| 5 | **Agregar test de guardado** | RF‑07 y RF‑08 | Simula cambios, envía formulario y valida llamada a `actualizarUsuario` y sincronización de contexto. |
| 6 | **Ejecutar Vitest** | RF‑07, RF‑08, RF‑09 | Corroborar que la suite completa pasa sin errores. |
| 7 | **Validar build** | RF‑07 | Ejecutar `npm run build` y verificar salida sin fallos.|