# Spec 001 — Cumplimiento de la skill fluid-glass

`Estado: aprobada`

## Propósito

Alinear el código de estilos y del hook `useReveal` de finApp-web con los
requisitos explícitos de la skill `fluid-glass`, que hoy se incumplen en varios
puntos. El objetivo es garantizar accesibilidad (reducción de transparencia y
de movimiento), comportamiento correcto en dispositivos con y sin hover, buen
rendimiento en móvil y un scroll-reveal robusto sin dependencias nuevas.

## Alcance

En alcance:

1. El fallback `@supports not` de `.glass-hero` cubre el caso en que NINGUNO
   de los dos prefijos (`backdrop-filter`, `-webkit-backdrop-filter`) está
   soportado.
2. Existe el bloque `@media (prefers-reduced-transparency: reduce)` para
   `.glass-hero`, con fondo semisólido y sin backdrop-filter.
3. El hover de `.glass-card` solo se aplica en dispositivos con capacidad de
   hover (`@media (hover: hover)`).
4. Existe `@media (prefers-reduced-motion: reduce)` que desactiva la animación
   y muestra el contenido de `.reveal`, `.reveal-left` y `.reveal-stagger > *`.
5. En pantallas de hasta 640px, el blur de las superficies de vidrio se reduce
   a 12–16px.
6. `useReveal` usa `threshold: 0.15` y `rootMargin: "0px 0px -8% 0px"`, y deja
   de observar el elemento tras revelarlo.
7. `.reveal-stagger` escalonará sus hijos mediante la variable `--i` en lugar de
   reglas `nth-child` fijas. El mecanismo CSS (`--i`/`calc(var(--i, 0) * 90ms)`)
   queda disponible y cubierto por pruebas; la adopción en componentes (asignar
   `--i` inline) queda fuera de alcance hasta que un componente use
   `.reveal-stagger`.
8. El contenido con clases de reveal será visible sin JavaScript o si este
   falla (fallback sin JS a nivel de especificación).
9. Los elementos interactivos afectados por los estilos Fluid Glass tendrán un
   indicador de `:focus-visible` coherente con la skill.
10. El cambio incluye cobertura de pruebas con Vitest y validación con
    `npm test` y `npm run build`.

Fuera de alcance:

- Dependencia `framer-motion`: la contradicción entre las skills `react-vite` y
  `fluid-glass` ya está resuelta (ver "Contradicciones detectadas") gracias a la
  actualización de la skill `react-vite`; por tanto queda fuera del alcance de
  cambios de código de esta spec (no se añade ni se elimina la dependencia).
- Migraciones generales de literales hex heredados, nuevas funcionalidades,
  cambios de datos o de persistencia.

## Casos límite

- Navegador sin soporte de `backdrop-filter` ni de su prefijo `-webkit-`:
  `.glass-hero` debe seguir siendo legible con el fondo de fallback.
  El fallback solo se activa cuando ambos prefijos carecen de soporte; si al
  menos uno funciona, se mantiene el efecto de vidrio.
- Usuario con `prefers-reduced-transparency: reduce`: el vidrio se sustituye por
  una superficie semisólida legible y sin blur.
- Usuario con `prefers-reduced-motion: reduce`: todo el contenido con clases de
  reveal debe ser visible sin animación, aunque el IntersectionObserver no
  llegue a dispararse.
- Dispositivo táctil sin hover (`@media (hover: none)`): el hover de
  `.glass-card` no debe activarse ni por toque ni por estados pegados.
- Pantalla ≤ 640px: el blur debe bajar a 12–16px para preservar rendimiento.
- `useReveal` con contenido ya visible al montar: el elemento debe revelarse
  inmediatamente al intersectar (el observer lo detecta en el primer callback);
  `rootMargin` se aplica normalmente y no se desactiva por estar visible al
  montar. Con más de 5 hijos en `.reveal-stagger`: el escalonado con `--i`
  debe cubrir cualquier número de hijos sin CSS manual adicional.
- Sin JavaScript o con JS deshabilitado: el contenido de reveal debe ser
  visible (no quedar oculto indefinidamente).

## Requisitos funcionales (EARS)

- RF1. Cuando el navegador no soporte ni `backdrop-filter` ni
  `-webkit-backdrop-filter` (fallback activo solo si ninguno está soportado),
  el sistema deberá aplicar el fondo semisólido de fallback a `.glass-hero`.
- RF2. Si el usuario tiene activada la preferencia `prefers-reduced-transparency: reduce`,
  el sistema deberá mostrar `.glass-hero` con fondo `rgba(15, 17, 23, 0.92)`
  (o el fondo semisólido de fallback equivalente), `backdrop-filter` y
  `-webkit-backdrop-filter` desactivados, y contraste AA respecto a la
  tipografía sobre ese fondo.
- RF3. Cuando el dispositivo disponga de puntero con hover (`@media (hover: hover)`),
  el sistema deberá aplicar el desplazamiento y la sombra al pasar el cursor sobre
  `.glass-card`; en caso contrario no deberá aplicar ese efecto.
- RF4. Si el usuario tiene activada la preferencia `prefers-reduced-motion: reduce`,
  el sistema deberá mostrar `.reveal`, `.reveal-left` y `.reveal-stagger > *`
  visibles, sin transformaciones ni transiciones.
- RF5. Cuando el viewport sea de 640px o menos, el sistema deberá aplicar a
  `.glass-hero` y al resto de superficies con blur un blur de 12 a 16px;
  solo cambia el valor de blur, sin modificar `saturate()`.
- RF6. El sistema deberá inicializar `useReveal` con `threshold: 0.15` y
  `rootMargin: "0px 0px -8% 0px"`, deberá desconectar el observer tras la
  primera intersección, deberá limpiar el observer al desmontar el componente
  y deberá contemplar elementos que nunca intersectan (sin error ni fuga).
- RF7. El sistema deberá escalonar `.reveal-stagger` con la variable CSS
  `--i`, aplicada a la propiedad `transition-delay`
  (`calc(var(--i, 0) * 90ms)`), sin reglas `nth-child` limitadas a cinco hijos.
  El mecanismo queda disponible y verificado por pruebas; asignar `--i` a cada
  hijo (p. ej. mediante estilo inline en el componente) queda fuera de alcance
  hasta que un componente use `.reveal-stagger`.
- RF8. El sistema deberá mantener el contenido con clases de reveal visible
  cuando no haya JavaScript o cuando este falle, de modo que dicho contenido
  no quede oculto indefinidamente (contenido visible por defecto con fallback
  sin JS).
- RF9. El sistema deberá garantizar que los elementos interactivos afectados
  por los estilos Fluid Glass expongan un `:focus-visible` coherente con la
  skill (anillo visible según la superficie, sin eliminar el indicador).
- RF10. El sistema deberá incorporar pruebas con Vitest que cubran, al menos,
  el ajuste de `useReveal` con `rootMargin` (incluida la limpieza del
  observer) y las nuevas reglas de CSS mediante lectura del archivo fuente o
  un snapshot razonable en jsdom; el cambio se validará con `npm test` y
  `npm run build`.

## Contradicciones detectadas

- La contradicción entre `react-vite` (que prohibía librerías de animación
  externas) y `framer-motion` (instalado y admitido parcialmente por
  `fluid-glass`) está resuelta: se ajustó la skill `react-vite` (ambas copias
  `.agents/skills/react-vite/SKILL.md` y `.opencode/skills/react-vite/SKILL.md`)
  para permitir Framer Motion únicamente en hover/tap, modales, `layoutId` y
  contadores, respetando `useReducedMotion`; el scroll-reveal sigue con CSS +
  IntersectionObserver. El ajuste corresponde a la skill, fuera del alcance de
  código de esta spec.
