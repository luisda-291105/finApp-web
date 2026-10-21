# Plan – Spec 020: Afinación del botón del asistente en el Dashboard

## 1. Arquitectura y resumen del cambio

El botón flotante disparador del asistente en el Dashboard se encuentra renderizado en `src/layout/DashboardLayout.jsx`. Actualmente dispone de estilos base, tokens y área segura, pero carece de las microinteracciones presentes en el disparador homólogo de `PaginaInicio.jsx` (`hover:scale-105`, `transition-all`, `cursor-pointer` y transición de color con `hover:bg-emerald-hover`).

El plan aborda la integración directa de estas clases y utilidades de Tailwind v4 en el botón disparador de `DashboardLayout.jsx`, asegurando:
1. Coherencia visual e interactiva idéntica a la landing page.
2. Preservación del cálculo de safe-area, accesibilidad de foco (`focus-visible`) y exclusión de respaldo (`data-respaldo-foco="excluir"`).
3. Cobertura con pruebas unitarias en `src/test/layout/AsistenteDashboard.test.jsx`.

## 2. Archivos afectados

| Archivo | Rol en el cambio |
|---|---|
| `src/layout/DashboardLayout.jsx` | Incorporar `transition-all cursor-pointer hover:scale-105 hover:bg-emerald-hover` al botón disparador del asistente. |
| `src/test/layout/AsistenteDashboard.test.jsx` | Verificar la presencia de las clases de microinteracción y animación sin romper contratos de accesibilidad. |
| `MEMORY.md` | Actualizar el registro del proyecto con el cierre de la Spec 020. |

## 3. Decisiones técnicas justificadas y alternativas descartadas

- **Decisión 1 — Utilidades Tailwind nativas (`hover:scale-105 transition-all`):**
  - *Justificación:* Coincide exactamente con la implementación en `PaginaInicio.jsx` (`cursor-pointer hover:scale-105 transition-all`). No agrega overhead de JavaScript ni librerías adicionales.
  - *Alternativa descartada:* Envolver el botón en un `motion.button` de `framer-motion`. Descartada porque `PaginaInicio.jsx` no utiliza framer-motion para el botón flotante; introducirlo añadiría complejidad innecesaria y posibles problemas de hidratación o render tests.

- **Decisión 2 — Token `hover:bg-emerald-hover`:**
  - *Justificación:* El botón en el dashboard utiliza el token semántico `--color-emerald-primary` (`bg-emerald-primary`). Al pasar el ratón, la transición debe usar su token de hover `--color-emerald-hover` (`hover:bg-emerald-hover`), cumpliendo con la regla de tokens semánticos del proyecto.
  - *Alternativa descartada:* Hexadecimal plano `#1a7a5e` (utilizado en landing). Descartada para cumplir con la política de tokens de FinApp en la capa autenticada (Spec 014 / 017).

- **Decisión 3 — Preservar posición y área segura:**
  - *Justificación:* El botón ya cuenta con `bottom-[calc(60px_+_env(safe-area-inset-bottom,0px)_+_16px)]` para convivir armoniosamente con `BottomNav` en móvil y con el layout en pantallas grandes. Las clases de animación no deben alterar ni desplazar esta coordenada.

## 4. Pruebas y validaciones (Vitest)

- Test focalizado en `AsistenteDashboard.test.jsx`:
  - Comprobar que el elemento obtenido con `obtenerDisparador()` contiene `hover:scale-105`, `transition-all`, `cursor-pointer`, `hover:bg-emerald-hover`.
  - Asegurar que mantiene `data-respaldo-foco="excluir"` y `aria-label="Abrir el asistente de ayuda"`.
- Validación general:
  - Ejecución de `npm test` garantizando 556+ pruebas pasando.
  - Ejecución de `npm run build` sin errores de compilación ni empaquetado.

## 5. Trazabilidad con Requisitos Funcionales

| Requisito Funcional | Implementación | Verificación |
|---|---|---|
| **RF-01** (Hover Scale) | `hover:scale-105 transition-all` | Test unitario de clases en `AsistenteDashboard.test.jsx` |
| **RF-02** (Cursor interactivo) | `cursor-pointer` | Test unitario de clases |
| **RF-03** (Transición de color) | `hover:bg-emerald-hover` | Test unitario de clases |
| **RF-04** (Movimiento reducido) | CSS global index.css `@media (prefers-reduced-motion)` | Inspección visual y reglas globales |
| **RF-05** (Preservación atributos) | Conservación de atributos existentes | Tests de integración existentes en `AsistenteDashboard.test.jsx` |
