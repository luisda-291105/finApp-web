# Tasks – Spec 018: Sidebar Mobile Enhancements

## T1 – Cierre automático del sidebar
- **Descripción**: Añadir la prop `autoClose` a `SidebarResponsive`. Detectar clicks en enlaces internos y cerrar el sidebar.
- **Responsable**: implementer
- **Dependencias**: Ninguna
- **Criterio de aceptación**: Al hacer click en cualquier enlace del sidebar, este se cierra y el foco vuelve al botón de apertura.

## T2 – Adaptación dinámica de BottomNav
- **Descripción**: Implementar lógica que ajuste el número de iconos mostrados en `BottomNav` según `window.innerWidth` (mínimo 3, máximo 5).
- **Responsable**: implementer
- **Dependencias**: Ninguna
- **Criterio de aceptación**: `BottomNav` muestra entre 3‑5 iconos y se adapta al redimensionar la ventana.

## T3 – Ocultar barra de scroll del sidebar
- **Descripción**: Aplicar CSS `::-webkit-scrollbar { display:none; }` y su equivalente para Firefox para ocultar visualmente el scroll sin perder la capacidad de desplazamiento.
- **Responsable**: implementer
- **Dependencias**: Ninguna
- **Criterio de aceptación**: El scroll no es visible pero sigue funcionando con teclado, touch y wheel.

## T4 – Persistencia del estado del sidebar
- **Descripción**: Guardar el estado abierto/cerrado en `localStorage` o mediante un Context React para que persista durante la sesión.
- **Responsable**: implementer
- **Dependencias**: T1
- **Criterio de aceptación**: Al navegar entre páginas, el sidebar mantiene su estado anterior.

## T5 – Tests Vitest
- **Descripción**: Crear/actualizar suites de pruebas que cubran RF‑01 – RF‑06 (cierre automático, adaptación BottomNav, ocultar scroll, persistencia y comportamiento general).
- **Responsable**: implementer
- **Dependencias**: T1, T2, T3, T4
- **Criterio de aceptación**: `npm test` pasa todas las pruebas, sin regresiones.

## T6 – Actualización de documentación
- **Descripción**: Documentar los cambios en `AGENTS.md` y `.agents/rules/rules.md` reflejando la nueva convención del sidebar.
- **Responsable**: reviewer
- **Dependencias**: T5
- **Criterio de aceptación**: La guía y reglas describen la ubicación `src/test/` y el comportamiento del sidebar.

## T7 – Revisión final
- **Descripción**: Verificar manualmente en dispositivos móviles que el sidebar y BottomNav cumplen RF‑01 – RF‑05; confirmar que `npm run build` genera el bundle sin errores.
- **Responsable**: reviewer
- **Dependencias**: T5, T6
- **Criterio de aceptación**: Todo funciona, pruebas pasan y la compilación es exitosa.
