# Spec 004 — Grid fluido de tarjetas con modal, flip y movimientos

`Estado: aprobada`

## Propósito

Reorganizar `/dashboard/tarjetas` en un **único conjunto fluido de 5 tarjetas
virtuales de demostración** con layout responsivo (acordeón vertical en móvil,
grid de 3 columnas en tablet y grid de 5 columnas en desktop), de modo que al
activar cualquier tarjeta se abra un **modal accesible** que muestra la tarjeta
completa con **flip 3D** y el **log de sus movimientos bancarios del periodo
demo fijo (octubre 2026)**, con datos 100 % ficticios.

## Alcance

En alcance:

1. **Conjunto único de 5 tarjetas demo**: las existentes azul (MARÍA GARCÍA),
   menta (ANA MARTÍNEZ) y morado (CARLOS RUIZ), reutilizando
   `MiTarjetaVirtual` (spec 003), más 2 tarjetas nuevas con datos ficticios
   coherentes (titular, número enmascarado, expiración, CVV, entidad y un
   `colorTema` entre los soportados; si se necesita un tema nuevo se definirá
   solo con tokens existentes de `src/styles/index.css`).
2. **Layout responsivo del conjunto**:
   - Móvil (`<640px`, por defecto de Tailwind): **acordeón vertical** con las
     5 tarjetas apiladas; cada elemento muestra un encabezado con
     titular/resumen y, expandido, la tarjeta (sin flip en el acordeón).
     Comportamiento **exclusivo** (una expandida a la vez), con una expandida
     por defecto al cargar (la primera).
   - Tablet (`sm` y `md`, ≥640px y <1024px): grid de **3 columnas**; el grid
     fluye las 5 tarjetas (3 + 2).
   - Desktop (`lg+`, ≥1024px): grid de **5 columnas**, repartiendo las 5
     tarjetas en una fila mostradas completas.
   - En grid (tablet/desktop) cada tarjeta muestra su **frente completo**
     (chip, número enmascarado, titular, expiración, entidad) pero **sin flip
     3D**: el flip solo ocurre dentro del modal.
3. **Modal de detalle por tarjeta**: al activar cualquier tarjeta del conjunto
   se abre un modal accesible que muestra:
   - la tarjeta virtual completa **con flip 3D** (frente/reverso con CVV),
     reutilizando `MiTarjetaVirtual`;
   - los datos de la tarjeta (titular, número enmascarado, expiración,
     entidad);
   - el **log de movimientos bancarios del periodo demo (octubre 2026)**
     asociados a esa tarjeta.
   - **Formas de activación del modal**:
     - En grid (tablet/desktop): un solo clic/tap (o Enter/Espacio con teclado)
       sobre la tarjeta abre el modal.
     - En acordeón (móvil): el **primer toque** sobre el encabezado o la
       tarjeta colapsada expande ese elemento del acordeón (y colapsa el
       anterior); el **segundo toque** sobre la tarjeta **ya expandida** abre
       el modal. El flip **no funciona** en el acordeón expandido.
4. **Accesibilidad del modal**: `role="dialog"` (o `<dialog>`),
   `aria-modal="true"`, `aria-labelledby` apuntando al título (nombre de la
   tarjeta/titular), cierre con `Esc`, con botón de cierre con nombre
   accesible **y al pulsar el fondo (backdrop)**, focus trap mientras está
   abierto y devolución del foco al elemento que lo abrió.
5. **Log de movimientos dentro del modal**:
   - Solo movimientos del **periodo demo fijo: octubre 2026**, por tarjeta,
     ordenados del más reciente al más antiguo.
   - Cada entrada muestra: fecha en formato legible corto **"12 oct 2026"**,
     descripción, categoría y monto con signo (positivos/negativos
     diferenciados con tokens existentes, p. ej. `cat-income` / `cat-expense`,
     y fuente numérica tabular).
   - Los datos demo son **estáticos con fechas de octubre 2026**: el filtrado
     del log es por coincidencia con ese periodo fijo, no por cálculo del mes
     en curso en cliente.
   - Datos 100 % ficticios en el cliente; sin backend ni persistencia. Si una
     tarjeta no tiene movimientos en el periodo, se muestra un mensaje vacío
     claro ("Sin movimientos este mes").
6. **Reorganización de secciones existentes**: los bloques actuales "Mi Tarjeta
   Virtual" destacada, "Ejemplos de diseño" y "Tus otras tarjetas" se
   **fusionan** en el conjunto fluido de 5 tarjetas; no se mantienen como
   secciones separadas ni se duplican tarjetas.
7. Mantener la nota **"Datos de demostración"** visible en la sección.
8. **Animaciones**: el acordeón, el modal y el flip 3D podrán animarse con CSS
   nativo y/o Framer Motion (instalado y permitido para modales, flips e
   interacción); los reveal/entrada por scroll quedan fuera. Toda animación
   respeta `prefers-reduced-motion`.
9. Estilos solo con tokens de `src/styles/index.css` (sin hexadecimales
   nuevos).
10. Pruebas con Vitest + Testing Library y validación con `npm test` y
    `npm run build`.

Fuera de alcance: backend/persistencia, CRUD de tarjetas o de movimientos,
autenticación real, tokens o reglas nuevas en `index.css` (salvo lo
estrictamente requerido y aprobado para respetar `prefers-reduced-motion`),
migración de hexadecimales heredados, scroll-reveal (`useReveal`/`reveal`),
paginación, búsqueda o filtros del log por otros períodos, y cualquier dato
fuera del periodo demo (octubre 2026).

## Decisiones del usuario

1. **Modo/diseño**: acordeón en versión móvil; en pantallas grandes un grid que
   reparte las tarjetas mostrándolas completas; al presionar cada tarjeta se
   abre un modal con la información de la tarjeta y sus movimientos.
2. **Flip 3D**: solo dentro del modal.
3. **Secciones**: se mantiene la disposición en grid organizada con cantidad
   fija de tarjetas según pantalla: tablet 3 columnas, móvil acordeón,
   desktop 5 columnas; los tres bloques previos se fusionan en ese conjunto.
4. **Movimientos**: solo dentro del modal; los datos del log son **demo fijos
   de octubre 2026** (sin cálculo del mes en curso en cliente).
5. **Interacción móvil (acordeón)**: primer toque sobre encabezado/tarjeta
   colapsada expande el elemento (exclusivo, una a la vez); **segundo toque
   sobre la tarjeta ya expandida abre el modal**. El flip no funciona en el
   acordeón expandido.
6. **Tarjetas en grid/acordeón sin flip**: en grid (y en el acordeón móvil) la
   tarjeta muestra su frente completo sin flip interactivo.
   `MiTarjetaVirtual` se reutiliza, pero el flip queda **deshabilitado por
   prop** en ese contexto (modo no interactivo, p. ej. `flipDeshabilitado` o
   `modo="vista"`), de modo que el clic sobre la tarjeta abre el modal en su
   lugar. El detalle de la prop la detallará el plan.
7. **Cierre del modal**: además de `Esc` y del botón de cierre, el modal se
   cierra al hacer clic en el backdrop.

Decisiones de diseño fijadas en esta spec (supuestos declarados, no nuevas
preguntas al usuario):

- Breakpoints Tailwind estándar: móvil `<640px`; tablet `sm`/`md`
  (640–1023px, `grid-cols-3`); desktop `lg+` (≥1024px, `lg:grid-cols-5`).
- En móvil el acordeón es exclusivo y con la primera tarjeta expandida por
  defecto.
- Se usan exactamente 5 tarjetas: las 3 existentes + 2 nuevas ficticias.
- Formato de fecha del log: "12 oct 2026".
- El periodo demo es **octubre 2026 fijo y estático**: los movimientos demo se
  declaran con fechas de ese mes y el log lista únicamente los de ese
  periodo; no hay cálculo del mes en curso en cliente.

## Casos límite

- Acceso directo a `/dashboard/tarjetas` con `TRIAL_ACTIVO = true`: visible
  sin interacción; en móvil la primera tarjeta del acordeón expandida, en
  tablet/desktop el grid completo sin tarjetas destacadas extra.
- **Móvil, doble gesto**: tarjeta colapsada → toque = expandir (y colapsar la
  otra); tarjeta expandida → toque sobre ella = abrir modal. El flip no se
  activa en el acordeón.
- Apertura del modal en grid con un solo clic/tap; desde teclado
  (Enter/Espacio) tanto en grid como sobre la tarjeta expandida del acordeón.
  El foco entra al modal, queda atrapado, `Esc` **o clic en el backdrop**
  cierra y el foco vuelve al elemento activador.
- `prefers-reduced-motion: reduce`: sin animación de expansión del acordeón,
  de apertura/cierre del modal ni de flip 3D (delegando en
  `MiTarjetaVirtual`, que ya lo respeta vía `useReducedMotion`).
- Tarjeta sin movimientos en octubre 2026: mensaje "Sin movimientos este mes"
  en lugar de una lista vacía.
- Solo un modal abierto a la vez; el contenido de fondo no es interactuable
  mientras el modal está abierto (`aria-modal`).
- Límites Fluid Glass: el modal usa superficies existentes (`glass-card` /
  `glass-hero` contados dentro del límite de 3 superficies translúcidas y 2
  blobs por viewport); no se añaden blobs nuevos.
- Datos ficticios: tarjetas y movimientos no corresponden a datos reales; la
  nota "Datos de demostración" permanece visible.

## Requisitos funcionales (EARS)

- **RF1**. Cuando el usuario acceda a `/dashboard/tarjetas` durante el trial,
  el sistema deberá mostrar un único conjunto de 5 tarjetas virtuales de
  demostración (las 3 existentes reutilizando `MiTarjetaVirtual` más 2 nuevas
  con datos ficticios coherentes), sin las secciones separadas "Mi Tarjeta
  Virtual", "Ejemplos de diseño" ni "Tus otras tarjetas".
- **RF2**. Mientras el ancho de viewport sea menor de 640px, el sistema deberá
  presentar el conjunto como acordeón vertical exclusivo (una tarjeta
  expandida a la vez), con la primera expandida por defecto y encabezados con
  titular y resumen identificativo; la tarjeta expandida no tendrá flip 3D.
- **RF3**. Mientras el ancho de viewport esté entre 640px y 1023px, el sistema
  deberá presentar el conjunto en un grid de 3 columnas; y mientras sea de
  1024px o más, en un grid de 5 columnas, mostrando en ambos casos el frente
  completo de cada tarjeta (chip, número enmascarado, titular, expiración,
  entidad) sin flip 3D en el grid.
- **RF4**. El sistema deberá renderizar `MiTarjetaVirtual` en el
  acordeón/grid con el flip deshabilitado mediante una prop explícita
  (p. ej. `flipDeshabilitado` o `modo="vista"`), de modo que esa instancia
  sea de solo lectura visual y libere el clic para abrir el modal; dentro del
  modal la misma tarjeta deberá conservar el flip 3D funcional.
- **RF5**. Mientras el ancho de viewport sea menor de 640px, cuando el usuario
  toque un encabezado o tarjeta colapsada del acordeón el sistema deberá
  expandir ese elemento y colapsar el resto; y cuando toque la tarjeta **ya
  expandida** el sistema deberá abrir el modal (sin que el toque active flip
  alguno).
- **RF6**. Cuando el usuario active una tarjeta del grid (clic/tap con un solo
  gesto, o Enter/Espacio con teclado) o la tarjeta expandida del acordeón
  (segundo toque), el sistema deberá abrir un modal que muestre la tarjeta
  completa con flip 3D funcional, sus datos (titular, número enmascarado,
  expiración, entidad) y su log de movimientos.
- **RF7**. Mientras el modal esté abierto, el sistema deberá exponer
  `role="dialog"`/`aria-modal="true"`, `aria-labelledby` apuntando al título
  del modal, atrapar el foco dentro del modal, cerrar con `Esc`, con un botón
  de cierre con nombre accesible **y al hacer clic en el backdrop**, y
  devolver el foco al elemento activador al cerrar.
- **RF8**. El log del modal deberá listar únicamente los movimientos (demo) de
  la tarjeta seleccionada pertenecientes al **periodo demo fijo (octubre
  2026)**, ordenados del más reciente al más antiguo, y cada entrada incluirá
  fecha en formato legible ("12 oct 2026"), descripción, categoría y monto
  con signo.
- **RF9**. Si la tarjeta seleccionada no tiene movimientos en el periodo
  octubre 2026, el sistema deberá mostrar en el modal el mensaje "Sin
  movimientos este mes" en lugar de la lista.
- **RF10**. El sistema deberá diferenciar visualmente los montos positivos y
  negativos usando únicamente tokens existentes de `src/styles/index.css`
  (sin hexadecimales nuevos) y fuente numérica tabular para los importes.
- **RF11**. Con `prefers-reduced-motion: reduce`, el sistema deberá desactivar
  las animaciones de apertura/cierre del modal, de expansión/colapso del
  acordeón y de flip 3D.
- **RF12**. El sistema deberá mantener visible la nota "Datos de demostración"
  en la sección `/dashboard/tarjetas` y tratar todos los datos de tarjetas y
  movimientos como ficticios y **estáticos** en cliente (fechas fijas de
  octubre 2026): sin backend, sin persistencia, sin cálculo del mes en curso
  y sin afirmar operaciones reales.
- **RF13**. El acordeón móvil deberá exponer semántica de acordeón:
  `aria-expanded` en cada encabezado, asociación encabezado↔panel
  (`aria-controls`/`id`), foco visible y ausencia de controles interactivos
  dentro de paneles colapsados.
- **RF14**. El sistema deberá incluir pruebas Vitest + Testing Library del
  acordeón (exclusividad, primer toque expande, segundo toque sobre la
  expandida abre el modal, click/teclado, ARIA, reduced-motion), del grid
  responsivo (clases de columnas por breakpoint, frente completo visible, un
  solo clic abre el modal), del modal (apertura, foco, `Esc`, botón de
  cierre, **clic en backdrop**, ARIA, flip) y del log (solo movimientos de
  octubre 2026, orden, campos, signos, estado vacío), además de la
  integración en la ruta `/dashboard/tarjetas`.

## Criterios de aceptación

1. `/dashboard/tarjetas` muestra las 5 tarjetas en acordeón exclusivo en
   móvil, grid de 3 columnas en tablet y grid de 5 columnas en desktop; ya no
   existen las secciones separadas previas y la nota "Datos de demostración"
   sigue visible (RF1–RF3, RF12).
2. En móvil, el primer toque expande el elemento del acordeón y el segundo
   toque sobre la tarjeta expandida abre el modal; en grid, un solo clic/tap
   abre el modal. En ambos casos el modal es accesible (focus trap, `Esc`,
   botón de cierre, clic en backdrop, `aria-modal`, `aria-labelledby`, foco
   devuelto al cerrar) y muestra la tarjeta completa con flip 3D solo dentro
   del modal, mientras que en grid/acordeón el flip queda deshabilitado por
   prop y se muestra el frente completo (RF4–RF7).
3. El modal lista únicamente los movimientos del periodo demo fijo
   (octubre 2026, datos estáticos) de la tarjeta, ordenados de más reciente a
   más antigua, con fecha legible "12 oct 2026", descripción, categoría y
   monto con signo diferenciado por tokens; tarjetas sin movimientos en ese
   periodo muestran "Sin movimientos este mes" (RF8–RF10, RF12).
4. Sin hexadecimales nuevos, sin librerías nuevas (Framer Motion ya instalado
   permite animar modal, acordeón y flip), sin scroll-reveal;
   `prefers-reduced-motion` respetado en acordeón, modal y flip;
   `npm test` y `npm run build` en verde (RF10–RF14).

## Relación con specs anteriores y contradicciones detectadas

- **Spec 002** define `PanelTarjetas` con el grid de 3 `glass-card` simples
  ("Tus otras tarjetas") y la nota "Datos de demostración". Esta spec
  **deroga la presentación de la spec 002**: el grid simple desaparece al
  fusionarse en el conjunto fluido de 5 tarjetas. La nota "Datos de
  demostración" se conserva. La documentación de spec 002 quedará marcada
  como superada por esta spec.
- **Spec 003** define `MiTarjetaVirtual` (flip 3D, temas, a11y) y la sección
  "Ejemplos de diseño". Esta spec **reutiliza el componente** dentro del
  modal (con flip) y en el conjunto (con flip deshabilitado por prop), y
  **supera la sección** "Ejemplos de diseño": las tarjetas menta y morado
  pasan al conjunto único. Decisión de spec: el componente admitirá un modo
  no interactivo de flip controlado por prop (p. ej. `flipDeshabilitado` o
  `modo="vista"`); el plan detallará la implementación mínima de esa prop.
- La disposición "tarjeta principal destacada" de spec 003 desaparece: ninguna
  tarjeta tiene destacado visual jerárquico fuera del conjunto.
- **Fuera de alcance de scroll-reveal**: igual que en spec 003, esta spec no
  introduce `useReveal`/clases `reveal` (ya causaron un bug de invisibilidad
  al usarse sin hook). Framer Motion sí está permitido para modal, acordeón y
  flip, conforme a AGENTS.md (reservado a hover/tap, modales, `layoutId` y
  contadores).
- **Contradicción con la redacción anterior de esta spec**: el borrador
  previo (acordeón siempre + log global debajo del panel, "mes en curso
  calculado en cliente") queda reemplazado por completo por las decisiones
  del usuario: acordeón solo móvil, grid en pantallas grandes, modal con flip
  y log por tarjeta con datos demo **fijos de octubre 2026**.
- Límites Fluid Glass verificados: el modal añade a lo sumo una superficie
  translúcida; debe comprobarse el total por viewport (≤3 superficies, ≤2
  blobs) al integrarse en el dashboard.

## Preguntas abiertas

Ninguna. Las tres ambigüedades marcadas por el reviewer quedaron resueltas por
decisión del usuario: periodo demo fijo de octubre 2026 con datos estáticos,
segundo toque sobre la tarjeta expandida abre el modal en móvil, y
`MiTarjetaVirtual` con flip deshabilitado por prop en grid/acordeón (detalle
de la prop a cargo del plan).
