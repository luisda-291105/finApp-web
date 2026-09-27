# .agents/rules.md — FinApp (Fluid Glass)

## stack
- React + Vite + Tailwind CSS v4
- Sin frameworks de animación externos (solo CSS + IntersectionObserver)

## tools
- Tailwind CSS v4 (utilidades custom blur/backdrop)
- Google Fonts / `-apple-system` fallback stack (SF Pro Display/Text)
- Hook `useReveal` (IntersectionObserver, reutilizable)
- Config centralizada de endpoints: `src/config/api.config.js`

## skills
- Arquitectura de componentes React (Vite)
- Glassmorphism / Fluid Glass (estilo visionOS / iOS 18+)
- Gradientes orgánicos y animaciones CSS puras de alto rendimiento
- Contraste accesible sobre fondos translúcidos

## limits
- `backdrop-filter` con fallback de color sólido semitransparente
- Blobs animados solo con CSS (sin canvas/WebGL)
- Máximo 3 capas de vidrio superpuestas por vista
- Máximo 2 blobs de color visibles por viewport

## reglas de diseño
- Nunca sacrificar legibilidad por el blur (mínimo contraste AA)
- Todo elemento de vidrio lleva borde con highlight superior
- Sin bordes cuadrados ni sombras duras — `border-radius` 20–28px
- Usar únicamente paleta y guía "Fluid Glass" definida en el proyecto

## validación Fluid Glass
- Paleta/tokens: fuente única `src/styles/index.css` (`@theme`), prohibido
  hardcodear hex fuera de ahí
- Automático (vitest): conteo de capas `.glass` anidadas por vista, conteo
  de blobs por viewport, si un componente expone estos como props testeables
- Manual (checklist antes de commit): contraste AA en navegador,
  inspección visual de blur/highlight/radius
- Si un límite no es testeable automáticamente, queda como check manual
  obligatorio en el paso "terminal"

## reglas de arquitectura
- Todo componente/hook/archivo de config debe usar el header documental de
  `.agents/file-header-template.md`
- Ninguna llamada a backend hardcodeada dentro de componentes: siempre pasar
  por `src/config/api.config.js`
- Cada función exportada se documenta con JSDoc breve (qué hace, entradas,
  salidas) directamente sobre la función
- Nombres de eventos, estados y props en español, consistentes con el resto
  del proyecto
