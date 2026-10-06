# MEMORY.md — FinApp

Memoria breve del estado del proyecto, decisiones y aprendizajes entre sesiones.

## Estado actual
- App React de finanzas personales con landing, login/modal y dashboard de demostración.
- Stack activo: React 18, Vite 5, Tailwind CSS v4 y React Router 6.
- Rutas: `/inicio`, `/login` y `/dashboard` con secciones de inicio, transacciones,
  tarjetas y configuración. `/` redirige según `TRIAL_ACTIVO`.
- `TRIAL_ACTIVO = true`: el dashboard está abierto como demo, no hay autenticación real.
- El dashboard muestra importes de ejemplo; no hay persistencia financiera en `src/`.
- `AuthModal` usa endpoints centralizados, pero el backend no está listo; el fallback
  actual muestra mensajes demo y no confirma persistencia real.
- Pruebas: Vitest + Testing Library en jsdom; 6 archivos de test cubren rutas,
  componentes, `useReveal` y reglas de `index.css`.
- RF6 (tarea 1 de spec 001): `useReveal` inicializa por defecto con
  `threshold: 0.15` y `rootMargin: "0px 0px -8% 0px"`; Hero, StatsBar,
  Features, HowItWorks y CtaSection ya no sobreescriben opciones.
- RF6 (tarea 2 de spec 001): `useReveal.test.js` verifica disconnect tras la
  primera intersección, disconnect en el cleanup al desmontar y ejecución sin
  error cuando nunca intersecta. El hook ya implementaba ese ciclo de vida, así
  que las pruebas nuevas pasaron al añadirse (no hubo cambio en `useReveal.js`);
  quedan como cobertura. `npm test` (13) y `npm run build` en verde.
- RF1 (tarea 3 de spec 001): el fallback de `.glass-hero` usa
  `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`,
  así el fondo semisólido solo aplica cuando ningún prefijo tiene soporte y el
  caso "solo uno soportado" conserva el vidrio. Nuevo test
  `src/styles/index.css.test.js` (lectura del CSS) lo verifica; `npm test` (15)
  y `npm run build` en verde.
- RF2 (tarea 4 de spec 001): `index.css` incluye
  `@media (prefers-reduced-transparency: reduce)` con `.glass-hero` usando fondo
  `rgba(15, 17, 23, 0.92)` y `backdrop-filter`/`-webkit-backdrop-filter: none`.
  Dos pruebas nuevas en `index.css.test.js` lo verifican; `npm test` (17) y
  `npm run build` en verde.
- RF3 (tarea 5 de spec 001): el hover de `.glass-card` vive únicamente dentro de
  `@media (hover: hover)`; no queda `.glass-card:hover` suelto. Dos pruebas en
  `index.css.test.js` lo verifican (prueba primero, falló antes del cambio);
  `npm test` (19) y `npm run build` en verde. Validación visual no realizada.
- RF4 (tarea 6 de spec 001): `index.css` incluye
  `@media (prefers-reduced-motion: reduce)` que fija `.reveal`, `.reveal-left` y
  `.reveal-stagger > *` con `opacity: 1; transform: none; transition: none;`.
  Dos pruebas nuevas en `index.css.test.js` (primero fallaron); `npm test` (21)
  y `npm run build` en verde. Validación visual no realizada.
- RF5 (tarea 7 de spec 001): `index.css` incluye
  `@media (max-width: 640px)` con `.glass-hero` usando
  `blur(14px) saturate(180%)` (solo cambia el blur a 12–16px, `saturate()`
  intacto). Dos pruebas nuevas en `index.css.test.js` (primero fallaron);
  `npm test` (23) y `npm run build` en verde. Validación visual no realizada.
- RF7 (tarea 8 de spec 001): las cinco reglas `nth-child` del stagger se
  sustituyeron por una única regla
  `.reveal-stagger.revealed > *` con
  `transition-delay: calc(var(--i, 0) * 90ms)`. Dos pruebas nuevas en
  `index.css.test.js` (primero fallaron). `npm test` (25) y
  `npm run build` en verde. Nota: ningún componente usa hoy la clase
  `.reveal-stagger` (los componentes animan con Tailwind en línea), así que no
  hubo hijo al que asignar `--i`; cuando un componente lo use, cada hijo debe
  llevar `style={{ "--i": índice }}`. Validación visual no realizada.
- RF8 y RF9 (tarea 9 de spec 001): las reglas de ocultamiento de `.reveal`,
  `.reveal-left` y `.reveal-stagger > *` ahora viven bajo `.js` (clase
  añadida por script inline en `index.html` vía
  `document.documentElement.classList.add("js")`), así sin JS el contenido
  es visible. El bloque de `prefers-reduced-motion` usa `html.js ...` para
  ganar especificidad al ocultamiento. Se añadió `:focus-visible` con anillo
  `outline: 3px` usando tokens (`var(--color-mint-accent)` al 50% sobre
  `.glass-hero`/oscuro y `var(--color-emerald-primary)` al 40% sobre
  `.glass-card`/crema, vía `color-mix`). Cinco pruebas nuevas en
  `index.css.test.js` (primero fallaron). `npm test` (30) y `npm run build`
  en verde. Validación visual no realizada.
- RF10 (tarea 10 de spec 001): nuevo describe "RF10 — bloques presentes en
  index.css" en `src/styles/index.css.test.js` que verifica la presencia de
  `@supports`, las media queries relevantes (`prefers-reduced-transparency`,
  `prefers-reduced-motion`, `hover: hover`, `max-width: 640px`),
  `calc(var(--i, 0) * 90ms)` y `:focus-visible`. El resto de bloques ya
  quedaba cubierto por los describes RF1..RF9. Tras esta tarea la revisión
  falló: `App.test.jsx > redirige la raíz al dashboard durante el trial`
  lanzaba `ReferenceError: IntersectionObserver is not defined` en jsdom y,
  además, la raíz redirigía a `/inicio` en lugar de `/dashboard` durante el
  trial, contradiciendo la prueba. No se declaró aprobada esa validación.
- Corrección post-review: `useReveal` comprueba
  `typeof IntersectionObserver === "undefined"` y marca `visible = true` sin
  lanzar error (caso jsdom); prueba nueva en `useReveal.test.js` (primero
  falló). `App.jsx` ahora redirige `/` a `/dashboard` cuando
  `TRIAL_ACTIVO = true` (a `/login` en caso contrario). `npm test` (33) y
  `npm run build` en verde. Validación visual no realizada. RF7 no se tocó;
  su alcance quedó solo CSS para `--i`.

## Decisiones (y por qué)
- Endpoints centralizados en `src/config/api.config.js`: permite configurar la base URL
  y evita distribuir rutas del backend por la interfaz.
- `TRIAL_ACTIVO` en `src/config/app.config.js`: habilita revisar el dashboard sin login
  mientras se desarrolla la integración de autenticación.
- Tokens de color y utilidades compartidas en `src/styles/index.css`: mantienen una
  fuente visual común para Fluid Glass.
- Pruebas junto al código y `MemoryRouter` para rutas: coincide con la estructura actual
  y permite comprobar la navegación sin servidor.
- Especificaciones y cambios deben respetar el alcance aprobado; consultar
  `doc/constitution.md`, `AGENTS.md` y `.agents/rules/rules.md`.

## Aprendizajes y errores a evitar
- No tratar FinApp como una app estática ni usar `node --test`: el proyecto usa React,
  Vite y `npm test` (Vitest).
- No presentar cifras, login ni mensajes de éxito del fallback como datos guardados u
  operaciones reales; verificar backend y persistencia antes de afirmarlo.
- No añadir colores hexadecimales a JSX/JS: existen literales heredados, pero los nuevos
  estilos deben usar tokens de `src/styles/index.css`.
- No añadir librerías de animación; las animaciones siguen CSS y APIs nativas.
- Los límites Fluid Glass de capas y blobs son reglas manuales; no hay pruebas
  automáticas dedicadas que deban darse por ejecutadas.

## Próximos pasos
- Conectar autenticación y datos financieros a un backend operativo; definir antes
  contratos, manejo de errores, seguridad y persistencia.
- Sustituir progresivamente cifras de demostración por datos reales cuando exista API.
- Añadir cobertura para flujos de autenticación y casos de error al implementar el
  backend; considerar pruebas verificables para límites de diseño.
