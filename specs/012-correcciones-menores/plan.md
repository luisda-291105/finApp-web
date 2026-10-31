# Plan 012 — Correcciones menores: medición inicial de `useBreakpoint`, clase muerta de `AuthModal` y fecha inválida en `LogMovimientos`

**Estado:** borrador
**Spec base:** `specs/012-correcciones-menores/spec.md` (aprobada por el usuario; **Q1/Q2/Q3 cerradas** el
2026-10-16 y **alcance de pruebas ampliado** el 2026-10-17 por coordinación con la spec 011: stub
**global** coherente + stub **local** de `DashboardUserModal.test.jsx`, con la **excepción única** del
mock incoherente de AC-02)
**Tareas:** `specs/012-correcciones-menores/tasks.md`
**Fecha:** 2026-10-17

---

## 0. Condiciones de ejecución (leer antes de tocar nada)

1. **Paso 0 dentro de cada tarea: re-leer el código real.** El usuario edita a mano (DP-21, regla
   heredada de la spec 010): toda referencia `archivo:línea` de este plan **debe** re-verificarse antes
   de editar. Si un artefacto que el plan espera ya no existe (la clase ya retirada, el helper ya
   validado, el stub ya coherente), se registra como **«ya no aplicable»** y **no** se recrea
   (CL-12). Las líneas de este plan se verificaron leyendo el repositorio el **2026-10-17**.
2. **Cambios mínimos y localizados**, sin reformatear líneas ajenas al objetivo y sin reordenar nada.
3. **Orden obligatorio: la 012 se implementa PRIMERO** (la 011 depende de ella y se **re-mide**
   después). La carpeta de la 011 **no se toca** (§3.4 y §7 de la spec; §9 de este plan).
4. **Validación por tarea:** `npx vitest run <ruta>` focalizado al cerrar cada tarea; se reporta
   **pass / fail / no ejecutado**. Nada se declara verde sin medirse. `npm test` y `npm run build`
   quedan **reservados** a la Tarea 9.
5. **Sin dependencias nuevas, sin hexadecimales nuevos, sin animaciones, superficies ni blobs**
   (RF-11); nombres en español; sin `git add -A`; **sin commit ni staging** en esta fase ni en la
   implementación de las tareas.
6. **Prohibido tocar producción para hacer pasar una prueba** (§7.2-6 de la spec): los únicos cambios
   de código de producción son los de §3.1 de este plan. Los ajustes de pruebas se limitan a **stubs y
   aserciones**, y cada ajuste se justifica por **lo que la suite mide**.
7. **Navegador:** no aplica a ninguna tarea. La validación visual es **no aplicable** para (2) y (3) y
   **no declarada como realizada** para (1) (solo observable en el borde de 768px, §10-6 de la spec).
8. **AC-04 se reporta «no ejecutado»**, nunca verde (jsdom siempre tiene `window`).

---

## 1. Resumen de cambios

| # | Cambio | Archivo(s) | Tipo |
|---|---|---|---|
| 1 | El snapshot inicial del hook se mide con la **misma fuente** que la suscripción (las `matchMedia`), sin cambiar el contrato | `src/hooks/useBreakpoint.js` | Producción |
| 2 | Se retira la clase muerta `animate-fadeIn` de la capa exterior | `src/components/domain/modales/AuthModal.jsx` | Producción (1 línea) |
| 3 | `formatearFechaCorta` valida **mes (1–12)** y formato **estricto** `AAAA-MM-DD`; toda entrada inválida ⇒ **«—»** (U+2014); se conserva el `TypeError` con entradas no-cadena | `src/components/domain/dashboard/LogMovimientos.jsx` | Producción |
| 4 | Stub **global** de `matchMedia` coherente con `innerWidth` (`matches = innerWidth >= min-width de la consulta`) + suite dedicada que lo verifica | `vitest.setup.js`; **nuevo** `src/entornoDeMedicion.test.js` | Infra de pruebas (Q1 = b) |
| 5 | Stub **local** de `matchMedia` coherente con `innerWidth` (mismo criterio que el global) | `src/components/layout/DashboardUserModal.test.jsx` | Infra de pruebas (coordinación con la 011, DP-12) |
| 6 | Casos nuevos de la corrección (1) y (3) y del stub local; cabeceras JSDoc solo de los archivos cuyo contrato cambia; `MEMORY.md` | `src/hooks/useBreakpoint.test.js`, `src/components/domain/dashboard/LogMovimientos.test.jsx`, `src/components/layout/DashboardUserModal.test.jsx`, `MEMORY.md` | Pruebas y documentación |

Ninguna corrección habilita rediseño, refactor, migración de color ni cambios de datos (§2.2 de la
spec).

---

## 2. Arquitectura objetivo y enfoque técnico

### 2.1 Corrección (1) — fuente única del snapshot inicial en `useBreakpoint.js`

**Mecanismo que fija este plan (diferencial, sin refactor):**

- Los dos inicializadores actuales leen `window.innerWidth` (`useBreakpoint.js:28-31` y `:33-36`,
  usados en `:40-41`). Pasan a leer **la misma consulta** que usa la suscripción:
  `window.matchMedia(QUERY_PANTALLAS_GRANDES).matches` para la versión de vista y
  `window.matchMedia(QUERY_ANCHO_GRANDE).matches` para el estado por defecto de banda.
- Se **conservan** la forma del `useState` con inicializador diferido (la función existente se sigue
  pasando, sin invocarla en cada render), el nombre y la firma de las dos funciones de medición, la
  guarda `typeof window === "undefined"` ⇒ `true` (`:29`, `:34`; RF-04/CL-05 de la 009), las
  constantes `:12` y `:14`, el efecto `:43-59` **sin cambios** (suscripción `change` `:50-51`, sync
  inicial `:52-53`, limpieza `:55-58`), el default de banda `:62`, `toggleSidebar` `:64-71` y el
  retorno de 4 props `:73`.
- **Resultado observable:** el primer render comprometido **ya** es el valor medido, así que el sync
  inicial del efecto (`:52-53`) es **no-op** (mismo valor ⇒ sin segunda composición) y la partición
  sigue siendo complementaria porque ambas versiones derivan de la **misma** consulta (CL-02).
- **Sin efectos en el inicializador (CL-04):** leer `.matches` **no** suscribe listeners, no escribe
  `localStorage` y no provoca la persistencia: el caso existente `useBreakpoint.test.js:211-216`
  (montar no escribe) sigue verde sin cambios.
- **StrictMode (CL-05):** el doble render solo repite una lectura pura; el doble montaje de efectos
  sincroniza el mismo valor ⇒ estados idénticos entre pasadas (`main.jsx:9,15-16`).
- **Tipo del valor inicial (CL-06):** `.matches` es booleano ⇒ se mantiene booleano en todos los
  casos.
- **Cabecera JSDoc (`:1-8`)** (RF-12): se actualizan `@datos` (la medición del primer render sale de
  las `matchMedia` del corte de 768px y del umbral de 1024px, **una sola fuente**) y `@estados`, sin
  citar rutas de plantilla inexistentes (§8 de la spec: la plantilla real es
  `.agents/skills/file-hearder-template.md/SKILL.md`).

**Inventario de consumidores (verificado por `grep`, §7.1/§7.2 de la spec):** directo
`src/layout/DashboardLayout.jsx:4,40`; indirecto `src/hooks/useDeslizarParaCerrar.js:10,48` (lo usan
`AuthModal.jsx:61`, `ModalTarjeta.jsx:69` y `DashboardUserModal.jsx:66`). Por eso el cambio del
**valor inicial** del hook puede afectar a cualquier suite que monte esas superficies: de ahí el orden
del plan (infraestructura **antes** que el hook, §7.2) y el barrido de no-regresión (Tarea 7).

### 2.2 Corrección (2) — retirada de la clase muerta en `AuthModal.jsx`

- Único cambio: se retira `animate-fadeIn` del listado de clases de la capa exterior
  (`AuthModal.jsx:123-126`, clase en `:124`). El resto de clases de esa capa y del panel, el marcado,
  el rol/`aria-modal`/nombre accesible, la «X», la altura y el scroll del panel quedan **idénticos**
  (RF-07).
- **No** se migran hexadecimales ni se toca ninguna otra clase (DP-03, exclusión heredada de la spec
  010: `AuthModal.jsx:131` conserva sus literales heredados tal cual). **No** se crea la animación
  (RF-06/CL-11).
- **Sin cambios en su cabecera JSDoc** (`:1-11` no menciona `animate-fadeIn`) y **sin casos nuevos**
  en `AuthModal.test.jsx`: AC-05 exige que sus **15 casos existentes** no se modifiquen y que el
  recuento **no** cambie (DP-06). La verificación es `grep` + inspección: `0` coincidencias de
  `fadeIn` en `src/` y la capa exterior conservando `fixed`, `inset-0`, `z-50`, `bg-black/70` y
  `backdrop-blur-sm` (aserción que ya existe en `AuthModal.test.jsx:66-71` y que **no** se toca).

### 2.3 Corrección (3) — `formatearFechaCorta` estricto y neutro

**Mecanismo que fija este plan:**

- **Orden de evaluación obligatorio:** el primer paso del helper sigue siendo `fechaISO.split("-")`,
  antes de cualquier comprobación, para **conservar el `TypeError`** con entradas no-cadena (Q3 =
  opción (b), RF-09, CL-08). **No** se añade guarda de tipo, conversión, `String(...)`, `trim` ni
  `try/catch` (AC-12; el diff no debe contener `typeof`).
- **Formato estricto:** una única prueba de patrón **anclada de inicio a fin** con **exactamente**
  4/2/2 dígitos separados por guiones (RF-09: sin espacios, sin otros separadores, sin caracteres
  extra). Mientras `split` se conserva, la validación textual es la que decide: `"2026-10-1"`,
  `"2026-1-12"`, `"26-10-12"`, `" 2026-10-12"`, `"12-10-2026"` y `""` fallan el patrón ⇒ «—».
- **Mes validado (1–12):** `Number(mes)` fuera de rango se descarta **antes** de indexar
  `MESES_ES` (`:12-15`) ⇒ «—»; nunca se interpola `undefined`/`NaN` (RF-09).
- **Día y año NO validados** (Q2/DP-07): el día se imprime con `Number(dia)` (sin cero a la izquierda,
  CL-09) ⇒ `"2026-10-99"` ⇒ `"99 oct 2026"`; el año se imprime con `Number(anio)` ⇒ `"0000-01-01"`
  ⇒ `"1 ene 0"` (CL-07).
- **Idempotencia del neutro (CL-10):** **todas** las salidas inválidas devuelven **una sola
  constante** con el guion largo U+2014 (`"—"`), para que el texto sea idéntico en todos los casos
  (mes 0, mes 13, `"2026-XX-12"`, cadena vacía, formato ajeno). Es un valor de datos en español, sin
  token ni i18n.
- **Salida válida intacta** (RF-08): `"12 oct 2026"`, `"1 oct 2026"`, `"1 ene 2026"`, `"31 dic 2026"`.
- **Sin cambios colaterales** (RF-10): no se toca `MESES_ES`, ni `formatearMonto`, ni el orden
  descendente, ni los tokens de ingreso/gasto, ni la fuente tabular, ni el estado vacío, ni el `<li>`
  del log (el neutro ocupa el mismo lugar en la línea, `:54`).
- **JSDoc** (RF-12): se actualizan la cabecera (`:1-10`, `@datos`/`@funciones`: formato estricto,
  neutro «—» y contrato de **cadena**) y el comentario del helper (`:17-20`), sin citar plantillas
  inexistentes.

### 2.4 Entorno de medición: stub global y stub local

**Una sola fórmula** (RF-13, §7.2-1 de la spec): `matches = innerWidth >= min-width de la consulta`.

- **Global (`vitest.setup.js:14-26`):** el stub deja de devolver `matches: false` fijo y pasa a
  **derivar** `matches` del `innerWidth` vigente **en el momento de la consulta** (no se captura al
  instalar), extrayendo el `min-width` de la propia consulta. Se conserva el ancho por defecto
  `1024` (`:28-33`, «pantallas grandes») y se documentan en los comentarios (`:13`, `:28`) la
  coherencia y el default. Las consultas que **no** son de ancho (p. ej.
  `(prefers-reduced-motion: reduce)`) siguen dando `matches: false`. El stub sigue **asignable** por
  las suites (hoy `writable` sin `configurable`: se añade `configurable: true`, como ya tiene
  `innerWidth` en `:29-33`). **`vitest.config.js` no se toca.**
- **Local (`DashboardUserModal.test.jsx:34-50`):** el default (`:47-50`) deja de fijar
  `innerWidth = 1024` con `matches: false` y pasa a instalar un `matchMedia` **derivado** de
  `innerWidth` con el mismo criterio, cumpliendo el comentario `:46` («pantallas grandes ≥768px»).
  Los **casos existentes** y el `describe` del gesto (`:292-345`) **no cambian de contenido**: sus dos
  viewports explícitos (`:293-296` móvil 375; `:298-301` pantallas grandes) se conservan tal como la
  spec ordena (AC-13, §7.1-B).
- **Excepción única (RF-13):** el mock **deliberadamente incoherente** de AC-02 (`innerWidth = 1024`
  con `matches = false`) vive **solo** dentro de ese caso nuevo de `useBreakpoint.test.js` y no se
  propaga al stub global ni a ninguna otra suite.
- **Línea base:** las cifras de `MEMORY.md` **no coinciden** entre sí (`:46` 257/257 en 22 archivos;
  `:1241` 348/348 en 27; `:1350` 260/260 en 23). **No se adopta ninguna**: se mide antes de tocar
  código (Tarea 1) y se registra, con atribución **suite por suite**.

---

## 3. Archivos afectados y límites

### 3.1 Se modifican / se crean (solo estos)

| Archivo | Qué cambia | RF/AC |
|---|---|---|
| `src/hooks/useBreakpoint.js` | Cuerpo de las dos funciones de medición (`:28-36`) ⇒ `matchMedia(...).matches`; cabecera `:1-8`. **Nada más** | RF-01, RF-03, RF-04, RF-05, RF-12; AC-01, AC-02, AC-03 |
| `src/components/domain/modales/AuthModal.jsx:124` | Se retira `animate-fadeIn` del listado de clases (nada más, ni la cabecera) | RF-06, RF-07; AC-05 |
| `src/components/domain/dashboard/LogMovimientos.jsx` | `formatearFechaCorta` (`:21-24`) con formato estricto, mes 1–12 y neutro U+2014; cabecera `:1-10` y comentario `:17-20` | RF-08, RF-09, RF-10, RF-12; AC-06, AC-07, AC-08, AC-12 |
| `vitest.setup.js` | `matchMedia` (`:14-26`) deriva `matches` de `innerWidth`; comentarios `:13`, `:28`; `configurable: true` | RF-13; AC-11 |
| `src/entornoDeMedicion.test.js` (**nuevo**) | Suite dedicada que verifica el stub global sin reemplazarlo. Justificación de la ruta: `vitest.config.js:9` recolecta `src/**/*.test.{js,jsx}`, así que un archivo hermano en la raíz **no** se ejecutaría | RF-13; AC-11 |
| `src/components/layout/DashboardUserModal.test.jsx` | Default (`:47-50`) deriva `matches` de `innerWidth`; **1 caso nuevo** que aserta la coherencia del stub local; casos existentes y gesto intactos | RF-13, DP-12; AC-13 |
| `src/hooks/useBreakpoint.test.js` | **2 casos nuevos** (sondas de composición: AC-01 y AC-02, esta última con el mock incoherente); 27 casos intactos | RF-01, RF-02; AC-01, AC-02, AC-03 |
| `src/components/domain/dashboard/LogMovimientos.test.jsx` | **Casos nuevos** del helper (tablas de válidos e inválidos); 6 casos intactos | RF-08, RF-09; AC-06, AC-07, AC-08 |
| `MEMORY.md` | Entrada de la spec 012: cambios, decisiones (Q1/Q2/Q3, DP-12), cifras medidas y orden «012 primero» | RF-11, RF-12 (documentación) |

### 3.2 NO se tocan (exenciones explícitas)

- **Contrato del hook y de la preferencia:** nombres de props, corte 768px, umbral 1024px, clave
  `sidebarCollapsed`, cuándo se escribe, firma de `toggleSidebar` (RF-03), `leerPreferencia`
  (`:18-26`) y el efecto (`:43-59`) salvo lo dicho en §2.1.
- **Aspecto y estructura de `AuthModal`** (hexadecimales incluidos), su cabecera JSDoc y su suite.
- **`src/data/tarjetasDemo.js`**, `TRIAL_ACTIVO`, endpoints, rutas, contenido de páginas.
- **`vitest.config.js`**, `vite.config.js`, `package.json` y cualquier dependencia.
- **Suites ya coherentes que solo se vigilan:** `useDeslizarParaCerrar.test.js` (`:88-95`,
  `configurarAncho` `:62-66`), `AuthModal.test.jsx` (`:20-33`, `:36-43`), `ModalTarjeta.test.jsx`
  (`:39-52`, `:54-61`), `cierreDeModales.test.jsx` (`:50-63`, `:66-73`), `DashboardDrawer.test.jsx`
  (`:34-44`, `:47-54`) y `DashboardLayout.test.jsx:24-25` (sustituye el hook).
- **Las specs 004, 009, 010 y 011** (la 011 sigue en borrador y **no** se toca; solo se coordina el
  entorno de pruebas).

---

## 4. Alternativas descartadas

| Alternativa | Por qué se descarta |
|---|---|
| **`useRef` con las `matchMedia` creadas en render y reutilizadas por el efecto** (una sola instancia por montaje, menos llamadas a `matchMedia`) | Más superficie de cambio (creación durante el render + ref) para un beneficio no pedido; la aserción existente `useBreakpoint.test.js:93-104` usa `toContain`, así que las llamadas extra **no** rompen nada. Se conserva el diff mínimo |
| **`useSyncExternalStore`** (snapshot del cliente desde la media query) | Sería funcionalmente correcto, pero reescribe la forma del hook (suscripción + snapshot por consulta + preferencia) y tensiona el contrato de 4 props de la 009: es refactor, prohibido aquí (RF-03/RF-11, DP-02) |
| **Caché a nivel de módulo de las `MediaQueryList`** | Congelaría la medición entre suites (cada suite reemplaza `window.matchMedia`) y rompería el aislamiento de las pruebas: incoherencia garantizada |
| **Calcular la medida solo una vez** (quitar el sync inicial o el efecto) | Viola RF-05/CL-03: el hook debe seguir escuchando `change`; medir una vez es justo el defecto que se corrige |
| **`matches` derivado en un `getter` del stub global** (o un objeto compartido) | No aporta nada frente a derivar en cada consulta y complica la lectura; la fórmula única ya garantiza la coherencia |
| **Añadir un caso nuevo en `AuthModal.test.jsx`** (`classList.contains("animate-fadeIn") === false`) | AC-05 exige que el recuento **no** cambie y DP-06 fija la verificación por `grep`/inspección; un aserto de estilo calculado en jsdom no probaría nada (no se evalúan animaciones) |
| **Normalizar la entrada del helper** (`trim`, otros separadores, ceros de más) o validar el **día**/**año** | Fuera de alcance (Q2/DP-07, §2.2 de la spec): cambiaría el resultado especificado |
| **Guarda de tipo / `String(fechaISO)` en el helper** | Rompería Q3 (se debe **mantener** el `TypeError`) y AC-12 |
| **Suite de AC-11 en la raíz (`vitest.setup.test.js`)** | `vitest.config.js:9` solo recolecta `src/**/*.test.{js,jsx}`: el archivo **no se ejecutaría**. Se crea `src/entornoDeMedicion.test.js` (el único desvío respecto a la sugerencia «hermana de `vitest.setup.js`», que la propia AC-11 admite como «p. ej.») |
| **Coherencia del stub local aplicada también a los dos viewports del `describe` del gesto (`:293-301`)** | La spec ordena expresamente conservarlo (AC-13, §7.1-B). Además el caso de `:298-301` solo mide `isMobile`, que con `innerWidth = 1024` es coherente con su propio viewport («pantallas grandes» ⇒ `isMobile: false`); su predicado no decide nada del estado por defecto de banda, que ese caso no aserta |

---

## 5. Decisiones del plan (no reabren la spec)

- **DP-P1.** La fuente única de (1) se implementa **cambiando el cuerpo de las dos funciones de
  medición existentes** (sin renombrarlas, sin helper nuevo) ⇒ diff mínimo y contrato intacto.
- **DP-P2.** Se **conserva** la guarda `typeof window === "undefined"` ⇒ `true` tal cual: **no** se
  añade ninguna guarda nueva (ni para `window.matchMedia` ausente), porque sería comportamiento no
  pedido y AC-04 sigue **no ejecutado** (jsdom siempre tiene `window`). El `describe` nominal
  «primer render sin medición disponible (SSR)» (`useBreakpoint.test.js:273-284`) **no se toca**.
- **DP-P3.** El aserto de AC-02 usa una **sonda de renders**: el callback de `renderHook` acumula
  cada composición en un array y se comprueba **la primera** (`registros[0]`) **y** que **ninguna**
  composición registrada contradiga la medida de la media query (equivale a «no hay segunda
  composición» y es robusto ante un render extra con el mismo valor). **No** se usa `result.current`
  (post-efecto, nacería verde) ni `result.all` (no existe en `@testing-library/react` 16.3.3).
- **DP-P4.** Se añade además un caso **coherente** con sonda (375 y 1200) para fijar AC-01 sobre el
  **primer render comprometido**. Es **verde sin cambios** (no discrimina el defecto: hoy el
  inicializador de `innerWidth` coincide con la consulta) y se documenta como tal; el caso que
  **falla hoy** es el de AC-02.
- **DP-P5.** Los casos nuevos del helper viven en `LogMovimientos.test.jsx` (DP-06) e importan el
  helper exportado (`:21`), que hoy **no** tiene prueba directa. **No** se añaden casos de entradas
  no-cadena (CL-08).
- **DP-P6.** La suite de AC-11 se crea en `src/entornoDeMedicion.test.js` (colocación justificada en
  §3.1) y **no** reemplaza `window.matchMedia`; verifica además que el stub sigue siendo
  **reemplazable** (RF-13) y que las consultas sin `min-width` mantienen `matches: false`.
- **DP-P7.** El único cambio de `DashboardUserModal.test.jsx` es el **stub** (default + 1 caso de
  coherencia); el `describe` del gesto se conserva literal (justificación en §4).
- **DP-P8.** Las cabeceras JSDoc se actualizan **solo** en `useBreakpoint.js` y
  `LogMovimientos.jsx` (RF-12), siguiendo la plantilla real
  `.agents/skills/file-hearder-template.md/SKILL.md`; `AuthModal.jsx` queda excluido.

---

## 6. Relación entre cambios y requisitos

| RF (spec 012) | Cambio que lo cumple | Prueba / evidencia |
|---|---|---|
| RF-01, RF-02 | §2.1: inicializadores ⇒ `matchMedia(...).matches` | `useBreakpoint.test.js`: caso AC-02 (sonda, mock incoherente) + caso AC-01 (sonda con mock coherente) |
| RF-03, RF-04, RF-05 | §2.1: contrato, guarda `window` y efecto intactos | 27 casos existentes de `useBreakpoint.test.js` **sin modificar**; AC-04 **no ejecutado** |
| RF-06, RF-07 | §2.2: retirada de la clase | `grep` de `fadeIn` ⇒ 0 en `src/`; `AuthModal.test.jsx` (15 casos, recuento igual) |
| RF-08 | §2.3: patrón estricto + `Number(dia)`/`Number(anio)` | Casos nuevos válidos de AC-06 (+ los existentes de `LogMovimientos.test.jsx:37-39`) |
| RF-09 | §2.3: patrón anclado, mes 1–12, constante U+2014 y `split` primero | Casos nuevos inválidos de AC-07; inspección del diff (AC-12) |
| RF-10 | §2.3: nada más del log se toca | 6 casos existentes de `LogMovimientos.test.jsx` intactos |
| RF-11 | §3.1/§3.2 + Tarea 9 | `npm test` + `npm run build` + `git diff --stat` + `grep` de hexadecimales/dependencias |
| RF-12 | §2.1 y §2.3 (cabeceras) | `git diff` limitado a las cabeceras indicadas |
| RF-13 | §2.4 (global y local) + caso AC-02 como excepción | `src/entornoDeMedicion.test.js` (AC-11) y caso nuevo de AC-13 |

---

## 7. Pruebas con Vitest (enfoque)

### 7.1 Casos nuevos y dónde viven

| Suite | Casos nuevos | Contenido |
|---|---|---|
| `src/hooks/useBreakpoint.test.js` | +2 | (a) **AC-02**: mock incoherente (`innerWidth` 1024 / `matches` false) + sonda ⇒ `registros[0]` = `isMobile: true`, `sidebarColapsada: true` y ninguna composición contradictoria (**hoy falla**); (b) **AC-01**: mock coherente en 375 y 1200 + sonda ⇒ primer render medido (**hoy ya pasa**) |
| `src/components/domain/dashboard/LogMovimientos.test.jsx` | +2 tablas | **AC-06** (7 filas válidas, incluida `"2026-10-99"` y `"0000-01-01"`) y **AC-07** (11 filas inválidas ⇒ «—», sin `undefined`/`NaN`); `it.each` para atribuir el fallo fila por fila |
| `src/components/layout/DashboardUserModal.test.jsx` | +1 | **AC-13**: tras el `beforeEach`, `innerWidth` 1024 ⇒ `"(min-width: 768px)"` y `"(min-width: 1024px)"` dan `matches: true` |
| `src/entornoDeMedicion.test.js` (**nuevo**) | 4 | **AC-11**: default 1024 coherente (`true`/`true`), `(prefers-reduced-motion: reduce)` ⇒ `false`, coherencia dinámica al cambiar `innerWidth` (375 ⇒ `false`/`false`; 800 ⇒ `true`/`false`) y stub **reemplazable** (se asigna y se restituye) |

**TDD:** se escriben primero los casos que **deben fallar** (AC-02, AC-11, AC-13 y AC-07) y se
ejecutan para dejar constancia del rojo; después se aplica el cambio de producción/infraestructura y
se repite. En todas las sesiones, las suites que sustituyen `window.matchMedia`
(`useBreakpoint.test.js:33-37`, `DashboardUserModal.test.jsx:34-50`) queda claro que **no** sirven
para AC-11.

**Restauración:** la suite nueva y los casos que fijan `innerWidth` restauran el descriptor original
en `afterEach` (`Object.getOwnPropertyDescriptor`), como ya hacen `useBreakpoint.test.js:47-54` y
`useDeslizarParaCerrar.test.js:98-104`.

### 7.2 Orden de pruebas (evita falsos positivos)

1. **Infraestructura primero** (Tareas 2 y 3): con el stub global coherente y el hook todavía
   midiendo con `innerWidth`, el primer render y la medición coinciden ⇒ **no** hay cambio de
   comportamiento en las suites que usan el stub global.
2. **Hook después** (Tarea 4): el cambio deja de introducir una segunda composición bajo cualquier
   stub coherente.
3. **No-regresión por suite** (Tarea 7) con la línea base de la Tarea 1 al lado; cualquier cambio de
   resultado se justifica por lo que la suite mide y se registra el hallazgo (§7.2-5 de la spec).
4. **Cierre** (Tarea 9): `npm test` completo + `npm run build` + comparación contra la línea base.

### 7.3 Qué **no** es verificable aquí

- **AC-04** (sin `window`): jsdom siempre tiene `window` ⇒ **no ejecutado**, nunca verde.
- **Validación visual** de (1): solo en el borde de 768px; **no declarada como realizada** (§10-6).
- **Entradas no-cadena** del helper: fuera de alcance (CL-08).

---

## 8. Validación final y atribución (Tarea 9)

- `npm test` (suite completa) y `npm run build`; además, la ejecución focalizada del inventario para
  atribuir **suite por suite** contra la línea base medida en la Tarea 1.
- Formato de reporte por suite: **casos antes → casos después** y **pass / fail / no ejecutado**.
- Deltas **esperados** (a confirmar midiendo; §7.2 de la spec): `useBreakpoint.test.js` **27 → 29**,
  `LogMovimientos.test.jsx` **6 → 24** (2 tablas: 7 + 11), `DashboardUserModal.test.jsx`
  **+1 caso** (la spec cita 20; el archivo declara **26** `it(` al 2026-10-17, así que el recuento real
  lo fija la Tarea 1), `src/entornoDeMedicion.test.js` **nuevo (4)**, `AuthModal.test.jsx`
  **15 → 15**. Sobre la línea base medida (p. ej. `348/27` ⇒ `373/28` si la base fuese 348, cifra que
  **no** se adopta como cierta hasta medirla).
- **Criterio de cierre:** ninguna suite empeora; los tests que cambien de resultado se explican por el
  cambio de medición y solo se ajustan **stubs/aserciones**; AC-04 se reporta **no ejecutado**.

---

## 9. Riesgos y no-regresión

| Riesgo | Mitigación |
|---|---|
| El cambio del **primer render** del hook altera suites que miden con el stub global (`App.test.jsx:12,16-22`, `src/pages/PanelTarjetas.test.jsx:121,196`) | Infraestructura antes que el hook (§7.2) + medición **antes y después** por suite; si algo cambia, se ajusta **solo la aserción** y se registra el hallazgo |
| El stub **local** del modal de cuenta se deja incoherente y la 011 no puede fijar la versión de vista | DP-12/AC-13: default derivado de `innerWidth`; casos existentes y gesto intactos |
| El mock incoherente de AC-02 se propaga | RF-13: excepción única, local al caso; se revisa por `grep` que no haya otro stub incoherente |
| Suites de las specs 004/009/010/011 que dependen del stub global o del gesto (`useDeslizarParaCerrar.test.js`, `cierreDeModales.test.jsx`, `DashboardDrawer.test.jsx`, `ModalTarjeta.test.jsx`, `AuthModal.test.jsx`, `DashboardLayout.test.jsx`) | Se vigilan en la Tarea 7 sin tocarlas salvo stub/aserción justificada; `DashboardLayout.test.jsx` sustituye el hook ⇒ no depende del stub |
| Se «aprovecha» para refactorizar el hook o limpiar `AuthModal` | §3.2 + RF-03/RF-07 + revisión del diff por tarea |
| El helper pierde el `TypeError` al validar con patrón | §2.3: `split` **primero**; AC-12 (inspección del diff: sin `typeof` ni conversiones) |
| Cifras de regresión tomadas de `MEMORY.md` (`:46` vs `:1241` vs `:1350`) | Línea base **medida** en la Tarea 1 y reporte pass/fail/no ejecutado |
| El usuario edita a mano durante la implementación | Paso 0 por tarea + re-verificación por `grep`; CL-12 («ya no aplicable») |
| La 011 se implementa con el entorno antiguo | Orden «012 primero» (§3.4 de la spec); la 011 **no** se toca; al cerrar la 012 se deja constancia en `MEMORY.md` |

---

## 10. Observaciones (no bloquean)

1. **Coordinación:** al terminar la 012, la 011 debe **re-medirse** contra el estado resultante
   (medición única + entorno coherente); la 012 no la modifica. La 011 cita esta spec por **números de
   línea** (`§3.4 :232-265`, `§7.1-B :541-550`, `DP-12 :458`, `AC-13 :492`): esas cifras pueden haber
   derivado con las ediciones de esta fase y **no** se corrigen aquí (fuera de alcance).
2. **Cita frágil heredada** `specs/010-cierre-de-modales/spec.md:693` (DP-21): se mantiene tal cual
   porque la spec 010 no se toca; se re-verifica al implementar.
3. **Etiqueta de la fila Q2** en `§5.3` de la spec («estricta de `formatearFechaCorta`») parece
   truncada; la decisión es inequívoca y **no** se toca en esta fase.
4. **Carpeta `specs/011-retorno-de-foco-drawer/`** contiene solo la nota de traslado; su borrado
   **no** es parte de esta spec (requiere una orden explícita del usuario).
5. **Recuento de casos del modal de cuenta:** la spec cita **20** casos en `DashboardUserModal.test.jsx`
   (§7.1-B y AC-13, cifra heredada de `MEMORY.md`, 2026-10-16), pero el archivo declara **26** `it(`
   (9 `describe` anidados) al **2026-10-17**. Es deriva por edición manual (DP-21): la Tarea 1 mide el
   recuento real y todas las tareas se refieren a él, sin asumir 20. La spec **no** se reabre por esto.
6. **Preguntas abiertas de comportamiento: ninguna.** Las tres correcciones y el alcance de pruebas
   quedaron cerrados por el usuario (Q1/Q2/Q3 + coordinación con la 011); este plan no decide nada
   nuevo sobre comportamiento observable.
