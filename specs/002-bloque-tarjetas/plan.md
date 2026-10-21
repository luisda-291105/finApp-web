# Plan 002 — Bloque de tarjetas en la sección "tarjetas"

`Estado: listo para implementación`

## Arquitectura

Cambio confinado a la capa de interfaz del dashboard, sin nuevas dependencias,
sin CSS nuevo y sin datos externos:

- **Componente nuevo de presentación** `PanelTarjetas` en `src/components/`:
  puro, sin estado ni efectos ni props. Los datos de demostración viven en una
  constante `tarjetasDemo` del propio archivo (patrón de la constante
  `secciones` de `Dashboard.jsx`), que se mapea a un grid de `glass-card`.
- **Integración en `DashboardSection`** (`src/App.jsx`): la rama
  `seccion === "tarjetas"` renderiza `<PanelTarjetas />` en lugar del texto de
  marcador. La sección inicio conserva su grid inline y transacciones y
  configuración conservan su placeholder sin cambios.
- **Estilos**: color/tipografía solo con tokens y clases existentes de
  `src/styles/index.css` (`glass-card`, `text-slate-text`, `text-bg-dark`,
  `font-display`); layout y espaciado con utilidades estándar de Tailwind,
  espejo del grid de inicio (`grid gap-4 sm:grid-cols-3`).
- Sin backend, sin persistencia, sin animaciones nuevas y sin cambios en
  `src/styles/index.css` ni en `src/config/`.

## Archivos afectados

- `src/components/PanelTarjetas.jsx` (nuevo, header JSDoc de
  `.agents/file-header-template.md`) — RF1, RF2, RF3, RF4, RF5
- `src/components/PanelTarjetas.test.jsx` (nuevo, prueba colocada) —
  RF6a, RF6b
- `src/App.jsx` (modificación de `DashboardSection`: import y rama
  `tarjetas`) — RF1, RF6d
- `src/App.test.jsx` (nuevos casos de ruta con el helper `renderRuta`
  existente) — RF6a, RF6c, RF6d
- `MEMORY.md` (actualización de cierre; sin datos sensibles)

## Datos demo (fijados aquí para determinismo)

| # | nombre            | últimos 4 | saldo      |
|---|-------------------|-----------|------------|
| 1 | Tarjeta Oro       | 4242      | $2,340.00  |
| 2 | Tarjeta Platino   | 5300      | $980.25    |
| 3 | Débito Nómina     | 7841      | $5,120.75  |

Formato de saldo idéntico al de inicio (`$X,XXX.XX`). Valores y nombres
ficticios, sin correspondencia con tarjetas o cuentas reales.

## Decisiones justificadas

- **Componente nuevo con array interno** (vinculado por la spec): los datos
  demo viven en `tarjetasDemo` dentro de `PanelTarjetas.jsx`. Sin props:
  hay un único consumidor y ninguna fuente de datos externa aprobada; pasar
  los datos desde `DashboardSection` añadiría una superficie sin requisito.
- **Texto exacto de la nota**: `<p className="text-sm text-slate-text">Datos
  de demostración</p>` inmediatamente bajo el grid; así RF6(b) es
  determinista.
- **Estructura de cada tarjeta**: `article.glass-card.p-5` como en inicio;
  nombre y "•••• XXXX" en `text-sm text-slate-text`, saldo en
  `mt-3 text-2xl font-semibold text-bg-dark`. No se usa
  `text-emerald-primary` porque no hay semántica de ingreso que lo justifique.
- **Grid responsive**: `grid gap-4 sm:grid-cols-3` idéntico a inicio: una
  columna por debajo de 640px y tres columnas desde 640px (CA4), sin CSS
  nuevo.
- **Integración mínima en `App.jsx`**: condicional existente ampliado con
  `seccion === "tarjetas" ? <PanelTarjetas /> : ...`; el resto de ramas no se
  toca.
- **Header JSDoc** en `PanelTarjetas.jsx` según la plantilla; no se requiere
  en archivos de pruebas (regla de `AGENTS.md`).

## Alternativas descartadas

- Inline en `DashboardSection` (como inicio): descartada por la spec
  (decisión vinculante); dejaría el bloque sin prueba propia y engordaría
  `App.jsx`.
- Datos demo en `src/config/`: no es configuración de aplicación ni de API;
  un único consumidor no justifica un módulo de datos nuevo.
- Saldos con colores distintos por tarjeta (`text-emerald-primary`):
  sin requisito que lo pida; se evita ruido visual y decisiones arbitrarias.
- Botón "añadir tarjeta" o cualquier CRUD: fuera de alcance de la spec.
- Animar la entrada del bloque (reveal / Framer Motion): fuera de alcance; el
  bloque debe verse también sin JavaScript.

## Pruebas con Vitest

- `PanelTarjetas.test.jsx` (unitarias, patrón `describe("PanelTarjetas")`
  como `Hero.test.jsx` / `Navbar.test.jsx` / `Features.test.jsx`):
  - renderiza exactamente 3 tarjetas; cada una muestra su nombre,
    "•••• XXXX" y saldo;
  - la nota "Datos de demostración" es visible.
- `App.test.jsx` (integración por ruta, reutilizando `renderRuta` con
  `MemoryRouter`):
  - `/dashboard/tarjetas`: 3 tarjetas demo con nombre, dígitos y saldo, la
    nota (RF6a, RF6b) y ausencia del placeholder "Administra tus tarjetas y
    revisa sus saldos." (RF6d);
  - `/dashboard` (inicio): sigue mostrando sus 3 cifras (Balance disponible,
    Ingresos del mes, Gastos del mes) (RF6c);
  - `/dashboard/transacciones`: muestra "Consulta y organiza tus movimientos
    recientes." (RF6c);
  - `/dashboard/configuracion`: muestra "Ajusta tus preferencias de cuenta y
    seguridad." (RF6c).
- Validación: `npx vitest run <ruta>` por tarea; cierre con `npm test` (suite
  completa sin regresiones) y `npm run build`.

## Revisión visual (manual, no automatizada)

- Los límites de capas/blobs y el contraste no tienen pruebas automáticas
  (`rules.md`): revisión en navegador (escritorio y móvil < 640px) del grid,
  la nota y las superficies; si no hay navegador disponible, registrar
  explícitamente la revisión como no realizada.

## Relación cambios ↔ RF

| RF  | Cambio |
|-----|--------|
| RF1 | `PanelTarjetas` + rama `tarjetas` en `DashboardSection`; placeholder eliminado en esa sección |
| RF2 | Array `tarjetasDemo` (3 tarjetas: nombre, últimos 4, saldo) mapeado a 3 `glass-card` |
| RF3 | Saldos con el formato de inicio `$X,XXX.XX`, ficticios |
| RF4 | Nota exacta "Datos de demostración" bajo el grid |
| RF5 | Tokens solo en color/tipografía; utilidades Tailwind estándar; `grid gap-4 sm:grid-cols-3` |
| RF6 | `PanelTarjetas.test.jsx` + casos nuevos en `App.test.jsx`; cierre con `npm test` y `npm run build` |
