# Plan 001 — Cumplimiento de la skill fluid-glass

`Estado: listo para implementación`

## Arquitectura

Cambio confinado a dos capas existentes, sin nuevas dependencias ni formatos de
datos:

- **Estilos Fluid Glass** en `src/styles/index.css`: corrección de media queries,
  fallbacks y escalonado. No se tocan tokens de color.
- **Hook** en `src/hooks/useReveal.js`: valores por defecto y ciclo de vida del
  `IntersectionObserver`.
- **Componentes consumidores** (`Hero`, `StatsBar`, `Features`, `HowItWorks`,
  `CtaSection`): ajustar llamadas a `useReveal` para usar los valores por defecto
  de la spec y asignar `--i` a los hijos de `.reveal-stagger`.
- **Fallback sin JS**: se invierte el estado por defecto. El contenido de reveal
  es visible salvo que una clase de habilitación añadida por JS (p. ej. `js` en
  `<html>`) active las reglas de ocultamiento. Sin JS el contenido se ve.

## Archivos afectados

- `src/styles/index.css` (RF1, RF2, RF3, RF4, RF5, RF7, RF8, RF9)
- `src/hooks/useReveal.js` (RF6) y `src/hooks/useReveal.test.js` (RF10)
- `src/components/*.jsx` que usan `useReveal` / `.reveal-stagger` (RF6, RF7, RF8)
- `index.html` o punto de entrada para la clase `js` (RF8)
- Nuevo test de reglas CSS, p. ej. `src/styles/index.css.test.js` (RF10)

## Decisiones justificadas

- **RF6**: `useReveal` usa `threshold: 0.15`, `rootMargin: "0px 0px -8% 0px"`,
  `observer.disconnect()` tras la primera intersección y en el cleanup. Los
  componentes dejan de pasar `options` propios conflictivos (0.1/0.2) para
  unificar comportamiento.
- **RF7**: `transition-delay: calc(var(--i, 0) * 90ms)` en `.reveal-stagger.revealed > *`;
  cada hijo recibe `style={{ "--i": índice }}`. Elimina las reglas `nth-child`.
- **RF8**: el contenido es visible por defecto; las clases `.reveal*` solo ocultan
  cuando `html.js` está presente. Así, sin JS o con fallo, no queda oculto.
- **RF9**: `:focus-visible` con anillo usando tokens (`--color-emerald-primary`,
  `--color-mint-accent`) en elementos interactivos con superficies Glass.
- **RF10**: tests de CSS leyendo el archivo fuente (existencia de bloques
  `@media`, `@supports`, `calc(var(--i`)) más ajustes al test del hook.

## Alternativas descartadas

- Mantener `nth-child` fijas: limita a 5 hijos (rechazo por RF7).
- Ocultar con CSS por defecto y confiar en JS para revelar: viola RF8.
- Añadir librería de animación para escalonado: sin justificación aprobada.
- Testear CSS con snapshot de jsdom: jsdom no aplica media queries; se prefiere
  lectura del fuente.

## Pruebas con Vitest

- `useReveal.test.js`: mock de `IntersectionObserver`; verifica `threshold 0.15`,
  `rootMargin "0px 0px -8% 0px"`, `disconnect` tras revelar y al desmontar, y
  caso de nunca intersectar.
- `index.css.test.js` (o similar): el fuente contiene `@supports not` cubriendo
  ambos prefijos, `@media (prefers-reduced-transparency: reduce)`,
  `@media (hover: hover)` envolviendo `.glass-card:hover`,
  `@media (prefers-reduced-motion: reduce)`, blur 12–16px en `@media (max-width: 640px)`,
  `calc(var(--i, 0) * 90ms)` y `:focus-visible`.
- Validación: `npm test` y `npm run build` deben pasar.

## Relación cambios ↔ RF

| RF | Cambio |
|----|--------|
| RF1 | `@supports not` anidado para `backdrop-filter` y `-webkit-backdrop-filter` |
| RF2 | `@media (prefers-reduced-transparency: reduce)` con `rgba(15,17,23,0.92)` y sin blur |
| RF3 | `.glass-card:hover` dentro de `@media (hover: hover)` |
| RF4 | `@media (prefers-reduced-motion: reduce)` visible y sin transiciones |
| RF5 | `@media (max-width: 640px)` con blur 12–16px, sin tocar `saturate()` |
| RF6 | `useReveal.js` con defaults y desconexión |
| RF7 | `--i` inline + `calc(var(--i, 0) * 90ms)` |
| RF8 | Inversión de visibilidad: ocultar solo con clase `js` |
| RF9 | Reglas `:focus-visible` con tokens |
| RF10 | Tests nuevos y ajustados + `npm test`/`npm run build` |
