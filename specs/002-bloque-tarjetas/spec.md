# Spec 002 — Bloque de tarjetas en la sección "tarjetas"

`Estado: en revisión`

## Propósito

Sustituir el texto de marcador de la sección "tarjetas" del dashboard
(`/dashboard/tarjetas`) por un bloque con un grid de tarjetas de demostración,
equivalente al grid de `glass-card` de la sección inicio: una tarjeta por cada
medio de pago de la demo, con nombre, número enmascarado (últimos 4 dígitos) y
saldo. El objetivo es que la sección sea coherente visualmente con el resto del
panel, muestre contenido representativo en el trial y mantenga el carácter de
demostración (sin backend ni persistencia), según lo acordado por el usuario
("Grid de glass-cards como inicio").

## Alcance

En alcance:

1. Nuevo bloque de contenido para la sección "tarjetas" del dashboard: un grid
   de exactamente 3 tarjetas de demostración, cada una con nombre, número
   enmascarado con los últimos 4 dígitos y saldo.
2. En color y tipografía, el bloque usa los tokens y clases existentes de
   `src/styles/index.css` (`glass-card`, `text-slate-text`,
   `text-emerald-primary`, `text-bg-dark`, `font-display`), sin hexadecimales
   nuevos en JSX/JS ni CSS nuevo; las utilidades estándar de Tailwind para
   layout y espaciado están permitidas, igual que en la sección inicio.
3. Diseño utilizable en móvil (una columna) y escritorio (hasta tres columnas),
   equivalente al grid de la sección inicio.
4. Los saldos se muestran con el mismo formato de moneda de la sección inicio
   (p. ej. `$1,234.56`), con valores ficticios.
5. El texto de marcador actual ("Administra tus tarjetas y revisa sus saldos.")
   deja de mostrarse en esta sección.
6. Cobertura de pruebas con Vitest + Testing Library (componente y ruta con
   `MemoryRouter`) y validación con `npm test` y `npm run build`.

Fuera de alcance:

- Backend, API, persistencia ni datos financieros reales; tampoco alta, edición
  ni eliminación de tarjetas (CRUD).
- Cambios en la sección inicio ni refactor de `DashboardSection` o de las
  secciones transacciones y configuración (conservan su comportamiento actual).
- Autenticación real y cambios en `TRIAL_ACTIVO` (`src/config/app.config.js`).
- Tokens, blobs o reglas nuevas en `src/styles/index.css`; animaciones nuevas
  (con CSS o Framer Motion); migración de hexadecimales heredados.
- Conexión futura a datos reales: quedará regida por una spec propia.

## Decisiones previas del usuario

1. Contenido: grid de `glass-card` como la sección inicio (nombre, últimos
   4 dígitos y saldo por tarjeta).
2. Flujo: SDD completo (spec → clarificación → plan/tareas → implementación →
   validación).
3. Nota de demostración: el usuario confirma mostrar junto al grid una nota
   visible de "datos de demostración" (RF4 queda como requisito definitivo).

## Decisión de implementación (vinculante para el plan)

El bloque se implementará como **componente nuevo en `src/components/`**
(nombre propuesto: `PanelTarjetas`) con los datos de demostración en un array,
integrado desde `DashboardSection` cuando `seccion === "tarjetas"`, más su
prueba colocada junto al componente.

Justificación:

- `DashboardSection` (en `src/App.jsx`) es un helper privado de rutas que hoy
  mezcla composición con contenido; añadir un segundo grid con una lista de
  datos lo engordaría. Un componente pequeño con los datos en un array respeta
  el principio de componentes pequeños de la constitución.
- La estructura del repo separa componentes en `src/components/` con pruebas
  colocadas; un componente nuevo permite prueba unitaria propia además de la
  de integración por ruta, sin romper la prueba existente de `App.test.jsx`.
- El bloque es guiño por datos (`.map` sobre tarjetas demo), no un trío de
  cifras fijas como inicio, lo que justifica abstraerlo.

Alternativa descartada: insertar el grid inline en `DashboardSection` (como
"inicio"). Sería el cambio mínimo, pero duplicaría el patrón con datos en
lista dentro de `App.jsx` y dejaría el bloque sin prueba propia. El grid de
inicio **no** se refactoriza a componente (fuera de alcance).

El componente nuevo debe llevar el header JSDoc de
`.agents/file-header-template.md` (no aplica a Markdown ni a tests).

## Casos límite

- Acceso directo a `/dashboard/tarjetas` con `TRIAL_ACTIVO = true`: el bloque
  se muestra sin interacción previa, con el encabezado existente de la sección
  ("FinApp / Panel" + título "Tus tarjetas") intacto.
- Viewport móvil (< 640px, breakpoint `sm:`): el grid se ve en una columna,
  sin desbordes ni texto recortado; desde 640px, hasta tres columnas.
- Dispositivo sin hover (táctil): las tarjetas no aplican estados hover
  pegados; la clase `.glass-card` ya limita su hover a `@media (hover: hover)`
  (spec 001, RF3), esta spec no añade CSS.
- Navegador sin soporte de `backdrop-filter` o con
  `prefers-reduced-transparency: reduce`: las `glass-card` deben seguir
  legibles mediante los fallbacks ya existentes (spec 001, RF1–RF2); no hay
  trabajo nuevo de estilos.
- jsdom / sin JavaScript: el bloque se renderiza sin depender de
  `IntersectionObserver` ni de librerías de animación; no se añaden
  animaciones ni clases de reveal.
- Naturaleza de los datos: nombres, dígitos y saldos son ficticios y no deben
  corresponder a cuentas ni números de tarjeta reales.

## Requisitos funcionales (EARS)

- RF1. Cuando el usuario acceda a la sección "tarjetas" del dashboard
  (`/dashboard/tarjetas`) durante el trial, el sistema deberá mostrar un grid
  de tarjetas de demostración en el área de contenido, conservando el
  encabezado existente de la sección y sin mostrar el texto de marcador
  "Administra tus tarjetas y revisa sus saldos.".
- RF2. El sistema deberá renderizar exactamente 3 tarjetas de demostración en
  el grid, y cada una deberá exponer de forma legible (texto accesible): el
  nombre de la tarjeta, su número enmascarado con los últimos 4 dígitos
  (p. ej. "•••• 4242") y su saldo. El número 3 iguala al grid de inicio.
- RF3. El sistema deberá mostrar los saldos con el mismo formato de moneda
  empleado en la sección inicio, con valores ficticios que no representen
  cuentas ni tarjetas reales.
- RF4. Cuando la sección "tarjetas" muestre el bloque, el sistema deberá
  indicar junto al grid, con el texto exacto "Datos de demostración", que los
  datos mostrados no son información financiera real (constitución §§1 y 4:
  "No presentes datos de demostración... como información financiera
  persistida" / "comunica con claridad el estado de demostración").
- RF5. En color y tipografía, el sistema deberá usar únicamente los tokens y
  clases existentes de `src/styles/index.css` (`glass-card`,
  `text-slate-text`, `text-emerald-primary`, `text-bg-dark`,
  `font-display`), sin hexadecimales en JSX/JS ni CSS nuevo; las utilidades
  estándar de Tailwind para layout, espaciado y tamaño (p. ej. `grid`,
  `gap-4`, `sm:grid-cols-3`, `p-5`, `mt-3`, `text-2xl`, `font-semibold`,
  `text-sm`) están permitidas, igual que en el grid de la sección inicio. El
  sistema no deberá superar los límites Fluid Glass vigentes (máx. 3
  superficies translúcidas superpuestas, 2 blobs por viewport) y el layout
  deberá ser utilizable en móvil y escritorio.
- RF6. El sistema deberá incluir pruebas con Vitest + Testing Library que
  verifiquen, como mínimo: (a) la ruta `/dashboard/tarjetas` renderizada con
  `MemoryRouter` muestra 3 tarjetas demo, cada una con nombre, últimos
  4 dígitos y saldo; (b) la nota exacta "Datos de demostración" junto al grid
  (RF4); (c) que las secciones inicio, transacciones y configuración
  conservan su comportamiento actual: el grid de inicio muestra sus 3 cifras
  (Balance disponible, Ingresos del mes, Gastos del mes) y transacciones y
  configuración siguen mostrando sus textos de marcador; (d) que el texto de
  marcador "Administra tus tarjetas y revisa sus saldos." no aparece en
  `/dashboard/tarjetas`. El cambio se validará con `npm test` y
  `npm run build`.

## Criterios de aceptación

1. En `/dashboard/tarjetas` se ve un grid de 3 `glass-card` con nombre,
   "••••" + 4 dígitos y saldo en formato `$X,XXX.XX` (RF1–RF3).
2. La nota exacta "Datos de demostración" es visible junto al grid (RF4).
3. `npm test` y `npm run build` pasan en verde, incluida la prueba nueva del
   bloque y la suite existente de `App.test.jsx` sin regresiones (RF6).
4. En móvil (< 640px, breakpoint `sm:`) el grid se ve en una columna y sin
   desbordes; desde 640px en adelante, hasta 3 columnas (RF5).
5. No aparecen hexadecimales nuevos en JSX/JS ni cambios en
   `src/styles/index.css` (RF5).

## Contradicciones detectadas

No se detectaron contradicciones entre `doc/constitution.md`, `AGENTS.md`,
`.agents/rules/rules.md`, `MEMORY.md`, `package.json` y el código actual
(`src/App.jsx`, `src/components/Dashboard.jsx`, `src/styles/index.css`).
La única tensión menor es intencional y está resuelta en RF4, confirmada por
el usuario (ver "Decisiones previas", punto 3): la sección inicio muestra
cifras demo sin etiqueta, mientras la constitución exige comunicar el estado
de demostración; se aplica la exigencia constitucional al bloque nuevo sin
retocar la sección inicio.
