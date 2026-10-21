# Spec 018 — Sidebar Mobile Enhancements

**Estado:** borrador (2026-10-21)

## 1. Propósito

Mejorar la experiencia de la barra lateral (sidebar) en dispositivos móviles, garantizando un comportamiento coherente con la versión de escritorio y abordando aspectos de usabilidad y accesibilidad.

## 2. Alcance

### Incluido

- El sidebar debe abrirse desde el mismo lado (lado izquierdo) tanto en desktop como en móvil.
- Al seleccionar una página desde el sidebar, este se debe cerrar automáticamente.
- En la barra de navegación inferior (BottomNav) el número de iconos visibles debe adaptarse al ancho disponible.
- En vistas con contenido extenso, la barra de scroll lateral debe ocultarse visualmente en todas las pantallas.

### Fuera de alcance

- Cambios al diseño visual del sidebar más allá de los comportamientos descritos.
- Soporte para gestos de arrastre que no estén especificados en los requisitos.
- Implementación de nuevas rutas o páginas que no estén relacionadas con el sidebar.

## 3. Convenciones existentes y compatibilidad

- La aplicación ya utiliza `src/components/layout/SidebarResponsive` para el sidebar.
- La barra de navegación inferior está implementada en `src/components/layout/BottomNav`.
- Los tests existentes usan Vitest y siguen la convención `*.test.jsx` bajo `src/test/`.

## 4. Casos límite

- **Ancho muy reducido:** cuando el ancho de pantalla es menor a 320 px, el sidebar se colapsará completamente y sólo mostrará un ícono de menú.
- **Contenido dinámico:** si una página carga contenido después de la renderización inicial, el scroll del sidebar sigue oculto.
- **Accesibilidad:** el foco debe regresar al botón de apertura del sidebar al cerrarse.

## 5. Requisitos funcionales

- **RF‑01 — Apertura lateral:** El sidebar se abre desde el lado izquierdo en ambas plataformas.
- **RF‑02 — Cierre automático:** Al hacer click en cualquier enlace del sidebar, éste se cierra.
- **RF‑03 — Adaptación BottomNav:** El número de iconos mostrados en `BottomNav` se ajusta dinámicamente al ancho disponible, con un mínimo de 3 y un máximo de 5.
- **RF‑04 — Ocultar scroll:** La barra de scroll del sidebar está oculta visualmente mediante CSS (`::-webkit-scrollbar { display: none; }`) sin afectar la capacidad de desplazamiento via teclado o touch.
- **RF‑05 — Persistencia del estado:** El estado abierto/cerrado del sidebar persiste mientras el usuario navega dentro de la misma sesión.
- **RF‑06 — Tests:** Se deberán crear/actualizar suites de pruebas Vitest que cubran los comportamientos anteriores y asegurar que `npm test` sigue pasando.

## 6. Guía de implementación

1. Añadir una prop `autoClose` al componente `SidebarResponsive` que, al detectarse un click en un enlace interno, invoque el cierre.
2. Implementar lógica en `BottomNav` para calcular el número máximo de iconos basándose en `window.innerWidth`.
3. Aplicar estilos CSS para ocultar la barra de scroll sin eliminar la función de desplazamiento.
4. Actualizar los tests existentes y añadir nuevas pruebas para los nuevos comportamientos.
5. Documentar los cambios en `AGENTS.md` y `.agents/rules/rules.md` para reflejar la nueva convención del sidebar.

## 7. Validación

- Ejecutar `npm test` y confirmar que todas las pruebas actuales y nuevas pasan.
- Verificar manualmente en dispositivos móviles (simulador) que el sidebar se comporta según RF‑01 a RF‑05.
- Revisar que `npm run build` genera el bundle sin errores.

---

*Esta spec será revisada por el `reviewer` antes de avanzar a la fase de planificación.*