# Spec 020 — Afinación del botón del asistente en el Dashboard (Animación y microinteracciones)

**Estado:** aprobada e implementada (2026-10-21) · **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

## 1. Propósito

Homogeneizar la experiencia interactiva del botón flotante del asistente de ayuda en el Dashboard con la del botón existente en la landing page (`PaginaInicio`), incorporando sus transiciones y microanimaciones de interacción (`hover:scale-105`, `transition-all`, cursor interactivo y respuesta visual de hover), manteniendo la coherencia con los tokens de diseño y las reglas de accesibilidad del sistema.

## 2. Alcance

### Incluido
- Replicar en el botón disparador del asistente en el Dashboard la microanimación de escala suave al pasar el cursor (`hover:scale-105`) y la transición fluida (`transition-all`).
- Asegurar el cursor interactivo (`cursor-pointer`) y la retroalimentación de color/iluminación al hacer hover/active coherente con la paleta de tokens.
- Respetar la accesibilidad para usuarios con preferencia de movimiento reducido (`prefers-reduced-motion`).
- Mantener intactas las propiedades existentes de accesibilidad, cromo, posición fija, área segura y exclusión del respaldo de foco (`data-respaldo-foco="excluir"`).

### Fuera de alcance
- Modificaciones al contenido, lógica o estados internos del asistente modal (`AsistenteAyuda.jsx`).
- Cambios a la posición base o cálculo de safe-area del botón disparador.
- Nuevas dependencias o librerías de animación externas.

## 3. Convenciones existentes y compatibilidad
- El botón disparador en la landing page (`PaginaInicio.jsx`) cuenta con `transition-all cursor-pointer hover:scale-105`.
- En `DashboardLayout.jsx`, el botón disparador tiene tokens semánticos de FinApp (`bg-emerald-primary`, `text-bg-cream`, foco visible).
- Las pruebas automáticas de `AsistenteDashboard.test.jsx` y `DashboardLayout.test.jsx` validan atributos clave (como `data-respaldo-foco="excluir"` y `aria-label`).

## 4. Casos límite
- **Preferencia de movimiento reducido (`prefers-reduced-motion: reduce`):** La escala no debe ser abrupta ni ejecutarse si el usuario tiene activada la reducción de movimiento en el sistema operativo.
- **Dispositivos táctiles / móvil:** En pantallas táctiles donde no hay hover, el botón debe responder al toque sin quedar bloqueado en estado escalado.
- **Foco por teclado:** Al recibir foco por teclado, el anillo de foco (`focus-visible`) debe permanecer nítido y visible sin interferencia de la transformación de escala.

## 5. Requisitos funcionales (EARS)

- **RF-01 — Animación al cursor (Hover Scale):** CUANDO el usuario sitúa el puntero sobre el botón flotante del asistente en el dashboard, EL SISTEMA DEBE aplicar una microanimación de escala proporcional suave (`hover:scale-105`) con transición fluida (`transition-all`).
- **RF-02 — Cursor interactivo:** CUANDO el usuario interactúa con el botón, EL SISTEMA DEBE indicar claramente la interactividad mostrando el cursor de puntero (`cursor-pointer`).
- **RF-03 — Transición de color en hover:** CUANDO el botón entra en estado hover, EL SISTEMA DEBE realizar una transición suave entre el color de fondo base y el color de hover (`hover:bg-emerald-hover`), manteniendo el contraste accesible.
- **RF-04 — Compatibilidad con movimiento reducido:** CUANDO el entorno del usuario tiene activo `prefers-reduced-motion: reduce`, EL SISTEMA DEBE suprimir o minimizar la transformación de escala conforme a los estándares de accesibilidad globales de la aplicación.
- **RF-05 — Preservación de atributos y foco:** MIENTRAS el botón mantenga la animación, EL SISTEMA DEBE conservar `data-respaldo-foco="excluir"`, `aria-label="Abrir el asistente de ayuda"`, y los estilos de `focus-visible`.

## 6. Validación
- Pruebas unitarias de clases y presencia de atributos en `AsistenteDashboard.test.jsx` / `DashboardLayout.test.jsx`.
- Ejecución completa de `npm test` verificando cero regresiones.
- Verificación con `npm run build`.
