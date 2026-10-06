# Tasks 001 — Cumplimiento de la skill fluid-glass

1. **Actualizar defaults de `useReveal`** (RF6) — ✅ hecho
   - Eliminar `options` propios (0.1/0.2) en Hero, StatsBar, Features, HowItWorks, CtaSection para usar el default del hook.
   - Hecho cuando: el hook se inicializa con `threshold: 0.15` y `rootMargin: "0px 0px -8% 0px"`, y los componentes no sobreescriben esos valores.

2. **Ciclo de vida del observer** (RF6) — ✅ hecho
   - `useReveal` desconecta tras la primera intersección, limpia al desmontar y no falla si nunca intersecta.
   - Hecho cuando: `useReveal.test.js` verifica disconnect tras revelar, disconnect en cleanup y ejecución sin error al nunca intersectar.

3. **Fallback `@supports not`** (RF1) — ✅ hecho
   - Ajustar el bloque para que solo cubra el caso en que ni `backdrop-filter` ni `-webkit-backdrop-filter` tienen soporte.
   - Hecho cuando: en `index.css` el fallback aplica fondo semisólido solo si ambos prefijos fallan, y el caso "solo uno soportado" mantiene el vidrio.

4. **`prefers-reduced-transparency`** (RF2) — ✅ hecho
   - Añadir `@media (prefers-reduced-transparency: reduce)` con fondo `rgba(15, 17, 23, 0.92)` y backdrop-filter desactivado.
   - Hecho cuando: el bloque existe en `index.css` y desactiva `backdrop-filter`/`-webkit-backdrop-filter` manteniendo contraste legible.

5. **Hover de glass-card solo en dispositivos con hover** (RF3) — ✅ hecho
   - Envolver `.glass-card:hover` en `@media (hover: hover)`.
   - Hecho cuando: en `index.css` el hover existe únicamente dentro de esa media query.

6. **`prefers-reduced-motion`** (RF4) — ✅ hecho
   - Añadir `@media (prefers-reduced-motion: reduce)` que muestra `.reveal`, `.reveal-left` y `.reveal-stagger > *` sin transformaciones ni transiciones.
   - Hecho cuando: el bloque existe y fija `opacity: 1`, `transform: none` y `transition: none`.

7. **Blur reducido ≤ 640px** (RF5) — ✅ hecho
   - En `@media (max-width: 640px)` ajustar el blur de las superficies a 12–16px sin tocar `saturate()`.
   - Hecho cuando: el bloque existe, los valores de blur están en 12–16px y los `saturate()` quedan intactos.

8. **Mecanismo de escalonado con `--i`** (RF7) — ✅ hecho
   - Sustituir las reglas `nth-child` por `transition-delay: calc(var(--i, 0) * 90ms)`; el mecanismo CSS queda disponible y cubierto por pruebas. La asignación de `--i` a los hijos (adopción en componentes) queda fuera de alcance hasta que un componente use `.reveal-stagger`.
   - Hecho cuando: no quedan `nth-child` de stagger, `calc(var(--i, 0) * 90ms)` está presente y cubierto por el test de CSS, y ningún componente queda obligado a asignar `--i`.

9. **Fallback sin JS y `:focus-visible`** (RF8, RF9)
   - ✅ hecho: visibilidad de reveal por defecto visible salvo `html.js`;
     `:focus-visible` con tokens en interactivos Glass.
   - Hecho cuando: sin JS el contenido de reveal es visible y existe `:focus-visible` coherente; sin errores al no haber JS.

10. **Pruebas CSS y validación** (RF10) — ✅ hecho
   - Crear test que lea `index.css` y verifique bloques: `@supports`, las tres media queries, `calc(var(--i, 0) * 90ms)` y `:focus-visible`.
   - Hecho cuando: `npm test` y `npm run build` pasan.
