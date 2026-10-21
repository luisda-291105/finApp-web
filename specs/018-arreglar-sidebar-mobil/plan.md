# Plan – Spec 018: Sidebar Mobile Enhancements

## Objetivo
Implementar los cambios descritos en la spec 018 para mejorar el comportamiento del sidebar y del BottomNav en dispositivos móviles, asegurando que se cumplan los requisitos funcionales RF‑01 a RF‑06.

## Estrategia de implementación
1. **Componentes** – Modificar  y  en .
2. **Estilos** – Añadir CSS para ocultar la barra de scroll del sidebar.
3. **Persistencia** – Gestionar el estado abierto/cerrado mediante Context o estado local con  opcional.
4. **Tests** – actualizar/añadir suites Vitest para cubrir los nuevos comportamientos.
5. **Documentación** – Reflejar los cambios en  y .

## Timeline (aprox.)
| Sprint | Tarea | Responsable |
|-------|-------|--------------|
| 1 | Implementar  y lógica de cierre del sidebar (RF‑02) | implementer |
| 2 | Implementar adaptación dinámica de  (RF‑03) | implementer |
| 3 | Añadir CSS para ocultar scroll (RF‑04) y persistencia del estado (RF‑05) | implementer |
| 4 | Escribir/actualizar tests Vitest (RF‑06) | implementer |
| 5 | Actualizar guías y reglas en  y  | reviewer |

## Criterios de aceptación
- El sidebar se abre desde el lado izquierdo en mobile y desktop.
- Al hacer click en un enlace del sidebar, este se cierra automáticamente.
-  muestra entre 3 y 5 iconos según el ancho disponible.
- La barra de scroll del sidebar está oculta visualmente pero sigue siendo operable.
- El estado del sidebar persiste durante la sesión del usuario.
- Todas las pruebas () pasan y la compilación () es exitosa.

---

*Este plan será revisado por el  antes de iniciar la fase de implementación.*
