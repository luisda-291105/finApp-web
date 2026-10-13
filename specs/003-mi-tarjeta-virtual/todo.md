# Spec 003 — Material retirado de la spec (todo.md)

Creado el 2026-10-12 al simplificar `spec.md`. Conserva todo lo retirado para no
perder conocimiento. Cada entrada indica por qué sale de la spec.

## Estilos y valores exactos (ya implementados y validados)

Estos detalles se eliminaron de la spec por ser sobre-especificación: el código
los fija y las pruebas los verifican; mantenerlos duplicados en la spec añade
fricción de sincronización sin valor de requisito.

- Lista literal de tokens permitidos: `glass-card`, `bg-bg-cream`,
  `text-bg-dark`, `text-slate-text`, `emerald-primary`, `mint-accent`,
  `cat-other`, `border-line`, `radius-glass`, `font-display`, `font-body`,
  `font-mono`, `tabular-nums`. → Resuelto; verificable en código/pruebas.
- Sombra hover exacta: `0 20px 40px -10px rgba(26, 122, 94, 0.15)`. → Resuelto.
- Hex de referencia `#6ee7c0` (verde menta) y `#FFFFFF` (fondo). → Resueltos;
  ya mapeados a tokens.
- Detalle de etiquetas del frente ("TITULAR" + `font-display`, "EXPIRA" +
  `font-mono`). → Resuelto.
- Especificación de Framer Motion (`whileHover`, `whileTap`, `animate`).
  → Es decisión de implementación del plan, no requisito de producto.

## Casos límite retirados (triviales o cubiertos por otras reglas)

- Dispositivo sin hover: `whileHover` de Framer Motion respeta `hover: hover`
  internamente; el caso de `.glass-card` ya está limitado por spec 001.
  → Redundante con RF4 y spec 001.
- Navegador sin soporte de transform 3D: fallback visual (frente o caras
  apiladas). → Pendiente futuro; no implementado como requisito verificable.
- jsdom / sin JavaScript: renderiza el frente por defecto sin errores.
  → Redundante: cubierto por las pruebas de RF8 y la regla `.js` de spec 001.

## Correcciones aplicadas (2026-10-12, hallazgos resueltos)

Se documentaron en `MEMORY.md` y se retiran del cuerpo de la spec por ser
historial de implementación, no requisitos:

1. `aspect-[8/5]` (+ `min-h-[200px]`) para evitar altura 0 con caras
   `absolute inset-0`.
2. Clase `group` en el motion.div interactivo para el indicador
   "Toca para ver CVV" (overlay solo `pointer-events-none`).
3. `onFlip` refactorizado a `useEffect` sobre `volteada` con ref de montaje;
   una sola llamada por giro (StrictMode). Su garantía permanece en RF6.
4. `mx-auto` junto a `max-w-xs` para centrado móvil.
5. Temas homologados a tokens: azul con opacidades de `cat-income`, morado de
   `cat-other`, menta `from-emerald-primary via-emerald-hover
   to-emerald-primary/80`. Su garantía permanece en RF7.

## Notas de contexto retiradas

- Explicación de la relación con spec 002 y la constitución (nota de demo):
  condensada en una sola sección breve al final de la spec simplificada.
- Foco visible: anillo `mint-accent` sobre oscuro / `emerald-primary` sobre
  crema. → Detalle heredado de `:focus-visible` global en `index.css`
  (spec 001), no requiere trabajo propio en esta spec.
- Estado anterior `borrador` → ahora `implementada`.

## Pendiente futuro

- Validación visual interactiva en navegador del hover, flip y
  `prefers-reduced-motion` (hoy sin navegador disponible; ver `MEMORY.md`).
- Si alguna vez hay soporte requerido para navegadores sin transform 3D,
  definir el fallback como requisito nuevo.
