---
name: fluid-glass
description: Sistema de diseño Fluid Glass (visionOS/iOS 18+) para finApp-web con React + Tailwind v4 + Framer Motion. Úsala al crear o modificar hero, cards, navbar, modales, paneles o secciones con animaciones de entrada. Define tokens, utilidades, reglas de movimiento, accesibilidad y checklist.
---

# SKILL: fluid-glass (finApp-web)

Identidad: **hero oscuro con vidrio** sobre **páginas crema con tarjetas limpias**. El vidrio es un acento de marca, no el estilo de toda la página.

## Contexto del proyecto
- Tailwind v4: tokens en `@theme` dentro del CSS global (`@import "tailwindcss"`), NO `tailwind.config.js`.
- Fuentes: `font-display` = Fraunces (títulos, cifras grandes), `font-body` = Outfit (UI, texto).
- Paleta (usar siempre los tokens, nunca hex sueltos):
  - Oscuros: `bg-dark #0f1117`, `bg-dark-mid #1a3a2e`, `bg-dark-end #1a7a5e`
  - Claros: `bg-cream #f7f6f2`, `border-line #e0ddd8`, `slate-text #5a6475`
  - Marca: `emerald-primary #1a7a5e`, `emerald-hover #15634c`, `mint-accent #6ee7c0`
  - Categorías: `cat-income` azul, `cat-expense` rojo, `cat-savings` menta, `cat-other` violeta
- Radio de marca: `--radius-glass: 24px`.
- Los componentes llevan cabecera JSDoc (`@uso, @funciones, @datos, @eventos, @estados, @usadoPor`). Mantenerla en componentes nuevos.

## Dónde va cada superficie

| Zona | Superficie | Clase |
|---|---|---|
| Hero, CTA final, navbar sobre fondo oscuro | Vidrio real | `.glass-hero` |
| Features, listas, pricing sobre crema | Tarjeta blanca limpia | `.glass-card` |
| Modales / paneles flotantes | Vidrio oscuro nivel 3 | `.glass-hero` + overlay |

Regla: el vidrio SOLO funciona sobre fondo oscuro con gradiente/grilla. Sobre crema usar `.glass-card` (blanca). Nunca `backdrop-filter` sobre fondo plano claro: no se ve y cuesta rendimiento.

## Fondo del hero
- Gradiente `bg-dark → bg-dark-mid → bg-dark-end` + `.hero-grid` (grilla 36px al 5%).
- Máx. 2 manchas de luz radiales (mint al 15-25%, esmeralda). Sin `filter: blur()` grandes: usar `radial-gradient`.

## Reglas de vidrio (`.glass-hero`)
- `backdrop-filter: blur(20-30px) saturate(160-200%)` con prefijo `-webkit-`.
- Borde 1px `rgba(255,255,255,.15)` + highlight superior inset `rgba(255,255,255,.25)` obligatorio.
- Radio 24px (`--radius-glass`); en elementos pequeños (chips, inputs) 14-16px.
- Máx. **3 capas** de vidrio por vista; nunca vidrio dentro de vidrio.
- Fallback con `@supports not` debe cubrir ambos prefijos:

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-hero { background: rgba(15, 17, 23, 0.88); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass-hero { background: rgba(15, 17, 23, 0.92); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
```

## Reglas de `.glass-card` (sobre crema)
- Fondo blanco, borde `border-line` al 80%, sombra muy suave, radio 24px.
- Hover: `translateY(-4px)` + sombra teñida de esmeralda. Aplicarlo solo en dispositivos con hover:

```css
@media (hover: hover) { .glass-card:hover { transform: translateY(-4px); } }
```
- Estructura de card de métrica: label (`slate-text`, 13-14px) → cifra (`font-display`, 28-36px, `tabular-nums`) → delta con icono y color de categoría.
- Dinero siempre con `tabular-nums` y formato `Intl.NumberFormat` (COP: sin decimales).

## Tipografía
- Títulos y cifras destacadas: Fraunces, peso 600-700, tracking ligeramente negativo.
- UI, párrafos, botones: Outfit 400/500/600.
- Mínimo 16px en párrafos; 14px solo en labels/metadata.

## Botones
- Primario: `emerald-primary` sólido, hover `emerald-hover`, texto blanco, radio 14-999px, alto mínimo 44px. No es vidrio: debe destacar.
- Sobre hero oscuro: primario `mint-accent` con texto `bg-dark`, secundario vidrio con borde.
- `:focus-visible` siempre: anillo 3px `mint-accent` al 50% (sobre oscuro) o `emerald-primary` al 40% (sobre crema).
- Estados disabled: opacidad .5 + `cursor-not-allowed`.

## Animaciones de entrada (`.reveal`)
Clases existentes: `.reveal` (sube), `.reveal-left` (entra desde la izquierda), `.reveal-stagger` (hijos escalonados), todas activadas añadiendo `.revealed` con `IntersectionObserver`.

Reglas:
- Observer con `threshold: 0.15` y `rootMargin: "0px 0px -8% 0px"`; **dejar de observar** (`unobserve`) tras revelar.
- Crear el hook `useReveal` una sola vez y reutilizarlo; no duplicar observers por componente.
- `.reveal-stagger` soporta 5 hijos: si hay más, no añadir CSS manual; usar variable `--i`:

```css
.reveal-stagger > * { transition-delay: calc(var(--i, 0) * 90ms); }
```
- Contenido sin JS o con `prefers-reduced-motion` debe verse siempre:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-left, .reveal-stagger > * {
    opacity: 1; transform: none; transition: none;
  }
}
```
- Easing de marca: `cubic-bezier(0.22, 1, 0.36, 1)`. Duraciones: micro 150-250ms, reveal 600-700ms. Nada > 800ms.
- Solo animar `transform` y `opacity`. Nunca animar `backdrop-filter`, `blur` ni sombras grandes.

## Framer Motion (interacciones, no reveal de scroll)
- Para scroll-reveal usar las clases CSS de arriba (más barato). Framer Motion queda para: hover/tap, modales (`AnimatePresence`), indicador activo con `layoutId`, contadores animados.
- Spring base: `{ type: "spring", stiffness: 260, damping: 24, mass: 0.8 }`.
- Modal: entrada `scale .96 → 1` + fade; salida más rápida que la entrada.
- Respetar `useReducedMotion()`.

## Accesibilidad
- Contraste WCAG AA medido contra el peor punto del fondo bajo el vidrio: texto ≥ 90% blanco sobre `.glass-hero`; secundario nunca por debajo de 60%.
- `mint-accent` sobre crema NO cumple contraste: solo usarlo sobre fondos oscuros.
- No indicar estado solo con color (ingreso/gasto): añadir icono (`ArrowUp/ArrowDown`) o signo +/−.
- Modales: focus trap, cerrar con Esc, `aria-modal`, devolver el foco al cerrar.
- Inputs con `<label>` visible, no solo placeholder.

## Rendimiento
- `backdrop-filter` solo en elementos estáticos y pocos; evitar en listas largas o en elementos que animan continuamente.
- En móvil bajar blur a 12-16px (`@media (max-width: 640px)`).
- `will-change: transform` solo mientras anima.
- Imágenes con `loading="lazy"` y dimensiones explícitas (evita CLS).
- Fuentes: `font-display: swap` y precargar solo Fraunces 600 y Outfit 400/600.

## Seguridad de UI (finApp-web)
- Nunca renderizar con `dangerouslySetInnerHTML` datos de usuario.
- No mostrar cifras o datos sensibles en el DOM si el usuario no está autenticado; los estados de trial/permiso no se confían solo al cliente.

## Anti-patrones
- Vidrio sobre fondo crema o blanco.
- Hex sueltos en vez de tokens `@theme`.
- Mezclar más de un acento fuerte por sección (esmeralda + mint ya son suficientes).
- Bordes de 2px, sombras negras duras, radios < 12px.
- Reveal que deja contenido invisible si falla el JS.
- Hover con movimiento en pantallas táctiles.
- Gráficas con colores fuera de los `cat-*`.

## Checklist antes de entregar
- [ ] Vidrio solo sobre fondo oscuro con gradiente/grilla.
- [ ] Todo color/radio sale de tokens `@theme`.
- [ ] `.glass-hero` con highlight superior, fallback `@supports` y `prefers-reduced-transparency`.
- [ ] Máx. 3 capas de vidrio, sin anidar.
- [ ] Reveal con `unobserve` y regla `prefers-reduced-motion`.
- [ ] Contraste AA y estados no dependientes solo del color.
- [ ] Focus visible y alto táctil ≥ 44px.
- [ ] Probado a 375px y 1440px.
- [ ] Cabecera JSDoc en componentes nuevos.