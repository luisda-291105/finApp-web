# Spec 013 — Calidad CSS y Fluid Glass: revelado, superficies de vidrio, área segura, tokens y contraste

**Estado: aprobado** (2026-10-18) · **plan y tareas:** [`plan.md`](plan.md) y [`tasks.md`](tasks.md)
**Fecha:** 2026-10-17 · **Última revisión:** 2026-10-18 (reparto 013/015, mejoras M1–M5 y los cuatro
detalles que el reviewer dejó abiertos)
**Petición del usuario (cinco puntos originales, citados literalmente):**
(1) «Eliminar CSS muerto (.reveal*) en `src/styles/index.css`»; (2) «Corregir warnings
`initial={false}`, `whileHover`, `whileTap` en `MiTarjetaVirtual.jsx` y `BottomNav.jsx`»;
(3) «Quitar wrapper innecesario en `GridTarjetas.jsx`»; (4) «Mover `PanelTarjetas.jsx` a
`src/components/domain/dashboard/` o documentar excepción»; (5) «Renombrar/documentar prop `como`
de `Card.jsx`».
**Reparto entre specs (decisión del usuario, 2026-10-18):** esta spec se queda con lo **visual/CSS**
(revelado y preferencias, superficies de vidrio, radios, área segura, barra inferior, literales y
tokens del CSS global y contraste). La **higiene de código, los dobles de prueba y la documentación**
—y, con ella, los puntos (2), (3), (4) y (5) de la petición— viven en la **Spec 015**
(`specs/015-higiene-y-dobles/spec.md`). Tabla de correspondencia completa: **§8.3** (y la equivalente
en §8.3 de la 015). Nada del borrador anterior se pierde.

**Resoluciones del usuario (2026-10-18) que se aplican en esta spec:**
- **R4 (defecto del artefacto de build) = (b):** el defecto que el informe del reviewer llama **P1**
  —el CSS **compilado** pierde el `backdrop-filter` sin prefijo de `.glass-hero`— queda **FUERA** del
  alcance; se documenta como hallazgo con su evidencia (§4.1) y se remite a una **spec futura de
  compatibilidad de prefijos CSS**. **No** genera requisito ni criterio de aceptación.
- **R5 (archivo de la petición) = sin objeto:** el archivo que la spec citaba fue **eliminado** por el
  usuario; los cinco puntos quedan citados **aquí**, en la cabecera.
- **R6 (H-1) = EN ALCANCE, confirmado:** el ajuste de blur de `@media (max-width: 640px)` **deja de
  pisar** el `backdrop-filter: none` de `@media (prefers-reduced-transparency: reduce)`:
  **reordenar o blindar la cascada, sin cambiar ningún valor** (§4.2, RF-04).
- **R7 (blur ≤640px) = se extiende a todas las superficies de vidrio con blur:** la reducción a
  **12–16px** en ≤640px pasa a aplicarse a **hero y resto** (header, sidebar, barra inferior y los
  dos paneles modales), tal como **ya fija la Spec 001 en su RF5** (`specs/001-…/spec.md:89-91`). La
  001 **no se enmienda**: la 013 **implementa** lo que la 001 declara y hoy solo se cumple para
  `.glass-hero`. Afecta **solo a ≤640px**; la saturación no se altera.
- **R8 (tokens sin consumidor) = decidido:** se **retiran** `--color-bg-dark-mid`,
  `--color-bg-dark-end` y `--header-height`; `--color-cat-savings` **se conserva** como **reserva
  documentada** de la paleta de categorías (no se retira y **no** se marca como muerto).
- **Las resoluciones R1 (avisos en los dobles), R2 (envoltorio conservado) y R3 (`@param` de `como`)**
  se aplican en la **Spec 015**; aquí solo se referencian.

**Mejoras de esta revisión (M1–M5):**
- **M1 — Criterios de blur por contexto, sin ambigüedad:** **ancho normal (>640px) ⇒ 20–30px con
  saturación 160–200 %**; **≤640px ⇒ 12–16px con la saturación intacta**. Explícito en RF-05, RF-06,
  AC-05, AC-06, AC-07, CL-06 y la matriz de §5-B.
- **M2 — Transparencia reducida en ambos contextos + matriz:** RF-04 y AC-04 exigen y verifican el
  efecto `none` **en ancho normal y en ≤640px**, y §5-B incluye una **matriz ancho × preferencia**.
- **M3 — Validaciones manuales reproducibles:** §9 fija un **protocolo** (navegador y versión,
  tamaños de ventana, estado exacto de la preferencia y **valores concretos a registrar**).
- **M4 — «Peor caso» de contraste verificable:** RF-14, AC-15 y §4.7 definen la **regla de
  composición** y los **fondos de prueba** de la barra inferior.
- **M5 — Menos repetición y tabla compacta:** cada decisión vive en **un único** sitio y se
  referencia; §7 es la **tabla compacta requisito ↔ criterio ↔ verificación** (una fila por RF).

**Basada en:** Spec 001 (contrato de `src/styles/index.css`: fallback `@supports`, transparencia y
movimiento reducidos, `hover: hover`, **RF5**: blur 12–16px en ≤640px para «`.glass-hero` **y el resto
de superficies con blur**» (`spec.md:89-91`), escalonado `--i`, puerta `.js` de `index.html`,
`:focus-visible`), Spec 007 (declaró el área segura «resuelto (`pb-safe`)»), Spec 009 (RF-15:
exenciones y **deuda** de `index.css`/`--header-height`; contraste 3,58:1 de la navegación lateral),
Spec 014 (hexadecimales en JSX y el «Usuario» del `Header` del dashboard).
**Coordinada con:** Spec 011 (**cerrada**, commit `944542c`) y Spec 012 (**cerrada**, commit
`8aa9f0f`) —ambas tocan suites y entorno de medición—; sus `spec.md` pueden decir «borrador», pero
los trabajos están **cerrados**. Esta spec **no** reimplementa ni reescribe esos trabajos, **no**
cambia stubs de `matchMedia` ni de `focus-trap-react`, y **no** invalida sus líneas base. La **Spec
015** (higiene y dobles) es su hermana: **no** se solapan (§8.3).
**Re-verificación:** todas las referencias `archivo:línea` de §4 se comprobaron el **2026-10-17** y
las del inventario de blur y de los puntos trasladados, el **2026-10-18**. El usuario sigue editando
a mano: **deben volver a re-verificarse** antes del plan y antes de implementar; lo que ya no aplique
se registra como «ya no aplicable» (CL-10) y **no** se recrea.
**Nota de formato:** esta spec define **el QUÉ y el POR QUÉ**. Las referencias `archivo:línea` de §4
son **evidencia del estado medido**, no una propuesta de solución; los mecanismos, archivos y pruebas
concretas son del **plan**.
**Línea base:** aportada por el orquestador/reviewer — `npm test` **455/455 en 30 archivos** y
`npm run build` verde. **No re-medida por el planner**; debe re-medirse **antes de tocar código**.

---

## 1. Propósito

El proyecto **declara** un sistema Fluid Glass pero varias de sus piezas **no lo cumplen ni lo
demuestran**. Esta spec corrige los defectos **visuales/CSS** medidos (P1–P6, P8 y el hallazgo H-1) y
la parte visual de la petición original:

1. **El movimiento reducido no llega a la landing.** `index.css` define
   `@media (prefers-reduced-motion: reduce)` sobre `html.js .reveal`, `.reveal-left` y
   `.reveal-stagger > *`, pero **ninguna de las cinco secciones de la landing usa esas clases**:
   animan con utilidades en línea (`transition-all duration-700` con `opacity-0` y un desplazamiento
   de **8** unidades en `Hero.jsx:37`, `Features.jsx:105` y `CtaSection.jsx:27`; de **6** en
   `StatsBar.jsx:30`; y **horizontal** en `HowItWorks.jsx:51`, `-translate-x-8`). El CSS no está
   «muerto»: está **huérfano** (RF-01/AC-01).
2. **El ajuste de blur de ≤640px pisa la transparencia reducida (H-1).** El bloque
   `@media (max-width: 640px)` **re-declara** `backdrop-filter` **después** del bloque
   `@media (prefers-reduced-transparency: reduce)`: en ≤640px con transparencia reducida el blur
   reaparece (misma especificidad, gana el último de la hoja). Es un defecto de la hoja **fuente**
   (§4.2), distinto de P1, que es del compilado.
3. **El área segura de la barra inferior no se aplica.** `BottomNav` usa `pb-safe`, pero el CSS
   global solo define `.safe-bottom` —**sin consumidores**: el `env(safe-area-inset-bottom)` no
   llega a ningún elemento. La prueba que lo «cubre» solo comprueba el **nombre de la clase** (P2).
4. **La barra inferior tiene cinco pistas para cuatro controles.** `grid-cols-5` deja una pista
   vacía y la prueba **aserta la clase equivocada** (P8).
5. **Hay literales de color que ya tienen token y tokens que ya no tienen consumidor.** La deuda de
   limpieza la registró la Spec 009 y **nadie la ha pagado** (P3). Decisión (R8): **tres se retiran**
   y **uno se conserva como reserva documentada** (RF-12).
6. **El vidrio no está dentro de la guía, y las pruebas lo asertan al revés.** Cinco superficies con
   blur usan **12px** en ancho normal (la guía pide **20–30px**), una superficie queda con radio de
   16px (fuera de 20–28px) y las esquinas anidadas de la tarjeta virtual no coinciden con su
   contenedor; las suites **asertan las clases actuales**, de modo que el defecto está «protegido»
   por prueba (P5). Además, la reducción a ≤640px que la **Spec 001 RF5** declara para «`.glass-hero`
   **y el resto de superficies con blur**» **hoy solo está implementada para el hero**
   (`index.css:124-129`): es un **hueco frente a la 001** que esta spec cierra (R7).
7. **Hay texto por debajo de AA.** La etiqueta secundaria de la franja de métricas queda en 3,98:1;
   las etiquetas de la barra inferior, en 3,16:1 sobre fondo oscuro y **mucho peor** sobre el fondo
   real del dashboard (crema); el indicador activo, en 3,58:1 (P4).

**Qué NO es esta spec:** no es un rediseño visual, ni una migración de los hexadecimales de los
componentes (Spec 014), ni un refactor, ni un cambio de contratos públicos, ni una revisión de
accesibilidad completa. **No** es tampoco la spec de higiene de código ni de dobles de prueba: eso es
la **Spec 015**.

---

## 2. Alcance

### 2.1 Incluido

- **Revelado de la landing:** que las cinco secciones (Hero, StatsBar, Features, HowItWorks,
  CtaSection) queden **gobernadas por las reglas de revelado del CSS global**, conservando los
  movimientos actuales de cada sección, de modo que el movimiento reducido y la ausencia de JS
  vuelvan a tener efecto observable.
- **Superficies de vidrio (conjunto cerrado de seis):** `.glass-hero` y las cinco superficies con
  `backdrop-blur-md` (header, sidebar, barra inferior y los dos paneles modales), con **dos
  contextos de blur** explícitos: **>640px ⇒ 20–30px + saturación 160–200 %**; **≤640px ⇒ 12–16px
  con la saturación intacta** (M1), y con la **prevalencia de la transparencia reducida** sobre el
  ajuste de ≤640px en **ambos** contextos (R6).
- **Radios** de las superficies **con esquinas** del conjunto declarado y criterio explícito para las
  **esquinas anidadas**.
- **Declaración documentada** de la superficie sólida que hoy se llama `glass-card`.
- **Área segura y barra inferior:** que la reserva del área segura inferior **se aplique de verdad**
  (no solo se nombre) y que la barra distribuya sus **cuatro** controles en cuatro columnas.
- **Tokens y literales del CSS global:** que los literales que ya tienen token equivalente se
  expresen con token (sin hexadecimales ni tokens nuevos) y que **todo** token sin consumidor tenga
  una decisión registrada: **retirada** o **reserva motivada** (R8).
- **Contraste:** que la etiqueta secundaria de la franja de métricas y las etiquetas/indicadores de
  la barra inferior alcancen **AA** con **tokens existentes**, incluido el **peor caso de fondo
  efectivo** definido por regla de composición y fondos de prueba (M4).
- Las **pruebas** de lo anterior y la **no-regresión** de las suites afectadas (RF-15).

### 2.2 Fuera de alcance (explícito)

- **Higiene de código, dobles de prueba y documentación de cabeceras:** clase fantasma `my-`,
  importaciones sin uso, recuentos de enlaces, los **siete dobles** de `framer-motion`, el envoltorio
  `role="listitem"`, el `@param` de `como` y la verificación de la excepción de `PanelTarjetas`
  ⇒ **Spec 015** (§8.3). Aquí solo se referencian.
- **Rediseño visual y cambios de composición:** no se cambian jerarquías, textos, estructura ni
  aspecto más allá de lo que exigen estos requisitos (radios, blur, contraste y posición de la barra).
- **Hexadecimales en JSX/JS:** Spec 014. En particular, el gradiente del Hero y el texto «Usuario»
  del `Header` en modo dashboard (`Header.jsx:80`, 4,47:1) **no** se tocan aquí.
- **Aspecto y estructura de los modales** más allá del **valor de blur** de sus superficies del
  conjunto: su cromo, su **radio**, su animación de salida y su comportamiento de cierre pertenecen a
  las specs 010/011 y **no se reabren** (DP-16, DP-17).
- **Entorno de medición de pruebas:** no se tocan `vitest.setup.js`, los stubs de `matchMedia` ni
  los de `focus-trap-react`, ni la configuración de Vitest (specs 011/012, **cerradas**).
- **Renombrados de contrato público:** la clase `glass-card`, props, clases consumidas y nombres de
  eventos **no** se renombran.
- **Cambios de datos, rutas, endpoints, autenticación y `TRIAL_ACTIVO`.**
- **Dependencias nuevas** (incluidas librerías de contraste, de CSS o de animación) y cambios de
  build.
- **El defecto del artefacto de build (P1) y la compatibilidad de prefijos del CSS compilado (R4):**
  se documenta el hallazgo (§4.1) y se remite a una **spec futura**. La 013 **no** valida `dist/`,
  **no** cambia la configuración de build y **no** añade prefijos ni herramientas. La prevalencia de
  la transparencia reducida (§4.2) **sí** entra: es un defecto de la hoja fuente, no del compilado.
- **Reescritura o saneamiento de los documentos de las specs 001, 005, 006, 007, 009, 010, 011, 012,
  014 y 015:** solo se citan.
- **`src/components/Hero.test.jsx`**: se registra como observación (§4.9) pero **no** entra.
- **Los límites de capas de vidrio y de blobs:** se declaran como validación **no automatizada**
  (§9), no como requisito de prueba nueva.

### 2.3 Relación con los cinco puntos originales

| Punto original (literal) | Encuadre | Dónde |
|---|---|---|
| (1) «Eliminar CSS muerto (`.reveal*`) de `index.css`» | **Corregido en su intención (D-B):** el CSS **no se borra**; se **re-adopta** en las cinco secciones para que el movimiento reducido y la ausencia de JS vuelvan a aplicar. El bloque escalonado queda como contrato sin consumidor. | 013 (RF-01…RF-03) |
| (2) «Corregir warnings `initial={false}`, `whileHover`, `whileTap`…» | **Corregido en su origen:** los avisos nacen en los **dobles de prueba** de siete suites, no en los componentes. | **015** (R1, RF-04) |
| (3) «Quitar wrapper innecesario en `GridTarjetas.jsx`» | El envoltorio sostiene `role="listitem"` dentro de `role="list"`; se **conserva y documenta**. | **015** (R2, RF-05) |
| (4) «Mover `PanelTarjetas.jsx`… o documentar excepción» | **Ya cumplido:** solo se **verifica**. | **015** (RF-07) |
| (5) «Renombrar/documentar prop `como` de `Card.jsx`» | Se **documenta** (falta el `@param`); **no** se renombra. | **015** (R3, RF-06) |

Los cinco puntos quedan **cerrados** el 2026-10-18 (R1–R5). El defecto del **artefacto de build
(P1, R4)** **no** entra en ninguna de las dos specs: se documenta en §4.1 y se remite a una spec
futura.

---

## 3. Relación con specs anteriores

| Spec | Qué fija ahí que **condiciona** esta spec |
|---|---|
| **001** | El contrato de `src/styles/index.css` está **probado**: `index.css.test.js` aserta de forma **literal** `rgba(15, 17, 23, 0.92)` (`:19`) y `rgba(15, 17, 23, 0.88)` (`:125`), el blur 12–16px en ≤640px **de `.glass-hero`** (`:63-69`), el escalonado `--i` (`:72-82`), la puerta `.js` (`:84-100`) y las reglas de `.bottom-nav-label` (`:144-157`). Esta spec **no** reescribe esas pruebas ni la 001; **amplía** `index.css.test.js` con asertos nuevos (RF-15, AC-04/AC-07/AC-12/AC-13, CL-13). Su **RF5** (`spec.md:89-91`) ya declara el blur 12–16px a ≤640px para «`.glass-hero` **y el resto de superficies con blur**»: la 013 **implementa** esa parte, que hoy solo está cubierta para el hero (R7). |
| **007** | Declaró el área segura «resuelto (`pb-safe`)». La evidencia de §4.4 muestra que **no se aplica**; esta spec lo corrige. |
| **009 (RF-15)** | Declaró **exenciones** (`index.css`, `--header-height`, `my-`, `Settings` sin uso, `text-white`, recuento «4 enlaces») y **deudas** («pasada de limpieza de `index.css`/`--header-height`», contraste 3,58:1 de la navegación lateral). Esta spec **paga la deuda de tokens y literales** (RF-11/RF-12). Las otras exenciones (`my-`, `Settings`, recuentos) las **revierte la Spec 015** (allí está su justificación). |
| **011 / 012 (cerradas)** | **Cerradas** (commits `944542c` y `8aa9f0f`), aunque sus `spec.md` puedan decir «borrador». Tocan foco y medición. Esta spec **no** toca sus dobles ni los casos de foco: donde una suite cerrada aserta un **valor de estilo** que esta spec corrige (`DashboardUserModal.test.jsx:443` y `DashboardDrawer.test.jsx:151`, `backdrop-blur-md`; `SidebarResponsive.test.jsx:58, :63`; `BottomNav.test.jsx:52, :56, :62, :110, :120, :122`), solo se ajusta **esa expectativa de estilo** (CL-12, DP-19). |
| **014** | Es la dueña de los hexadecimales en JSX y del «Usuario» del `Header`; allí se remite el caso `Header.jsx:80`. |
| **015** | Hermana de esta spec: **higiene de código, dobles de prueba y documentación** (R1–R3 y los puntos (2)–(5)). No hay solape: **007** queda aquí, **005** y **006** allí. |

---

## 4. Evidencia medida (re-verificada el 2026-10-17; inventario de blur, 2026-10-18)

> Todo lo de este apartado es **diagnóstico**: describe lo que hay, no lo que se debe hacer. Lo
> **medido en navegador** o sobre el **artefacto construido** proviene del reviewer y se señala como
> tal; el planner **no** reprodujo esas mediciones. Los contrastes los **recalculó** el planner a
> partir de los tokens y **coinciden** con los del reviewer. **H-1** (§4.2) es un **hallazgo propio**
> del planner.

### 4.1 P1 (informe del reviewer) — El CSS **compilado** pierde el `backdrop-filter` sin prefijo de `.glass-hero` — **FUERA DE ALCANCE (R4)**

- **Hallazgo, tal como lo midió el reviewer:** en el CSS construido, la declaración
  `backdrop-filter` **sin prefijo** de `.glass-hero` **no sobrevive** al build (queda solo la
  variante `-webkit-`), de modo que en los navegadores que ya no leen el prefijo la superficie del
  hero **pierde el desenfoque** en el artefacto de producción, aunque la hoja fuente la declare.
- **Evidencia:** artefacto `dist/assets/index-B0_ZOIQp.css`. El planner **no** verificó su contenido
  ni reconstruyó el build: es **medición del reviewer**, sobre una **instantánea** de una
  construcción anterior.
- **Hipótesis de causa (no verificada):** el par de declaraciones `index.css:71-72`
  (`backdrop-filter` + `-webkit-backdrop-filter`) y sus **re-declaraciones parciales**
  —`backdrop-filter: none` en `:107-108` y `blur(14px) saturate(180%)` en `:126-127`— pueden llevar
  al **minificador de CSS** a colapsar el par conservando solo la variante prefijada. **Debe
  confirmarse** midiendo el CSS resultante en la spec futura; el planner **no** lo afirma. El bloque
  **`@supports not`** de `:96-101` **no** redeclara el par: solo fija
  `background: rgba(15, 17, 23, 0.88)` en `:99`.
- **Decisión (R4 = b):** **FUERA** de la 013. Se remite a una **spec futura de build / compatibilidad
  de prefijos CSS**, que deberá reconstruir, inspeccionar el CSS resultante y fijar el mecanismo.
- **Consecuencia de alcance:** la 013 **no** incluye requisito ni AC para el CSS compilado, **no**
  valida `dist/` (§9) y **no** cambia la configuración de build ni añade dependencias.
- **Actualización post-implementación (2026-10-18, sin cambiar RF/AC ni el alcance):** la
  comprobación sobre el artefacto construido (`npm run build` + `npm run preview`) confirma que el
  defecto **no se limita a `.glass-hero`**: el `backdrop-filter` sin prefijo se pierde también en las
  **cinco** superficies `.glass-surface` (header, sidebar, barra inferior y los dos paneles modales),
  es decir, en **las seis superficies del conjunto**. En la vista previa,
  `getComputedStyle(…).backdropFilter` computa **`none`** en las seis. Se mantiene **FUERA DE
  ALCANCE** (R4/DP-14) y se remite a la **spec futura de compatibilidad de prefijos**, que deberá
  cubrir las seis superficies, no solo el hero.

### 4.2 H-1 (hallazgo propio del planner) — El ajuste de ≤640px pisa la transparencia reducida

- Declaraciones del par `backdrop-filter`/`-webkit-backdrop-filter` en la hoja:
  `index.css:71-72` (`.glass-hero`, `blur(24px) saturate(180%)`), **`:107-108`** (transparencia
  reducida, valor `none`) y **`:126-127`** (≤640px, `blur(14px) saturate(180%)`). El bloque
  `@supports not` de `:96-101` **no** declara el par.
- **Defecto verificado por lectura y por orden de la hoja:** el bloque
  `@media (prefers-reduced-transparency: reduce)` está en `:104-110` y el bloque
  `@media (max-width: 640px)` en `:124-129`. Ambos seleccionan `.glass-hero` (misma especificidad) y
  el segundo **re-declara** `backdrop-filter: blur(14px) saturate(180%)`: en ≤640px **con
  transparencia reducida, el blur vuelve a aplicarse** (el `none` de `:107` queda pisado). El fondo
  semisólido sí sobrevive (el bloque de ≤640px no lo toca).
- **Alcance del defecto tras R7:** hoy la única superficie alcanzada por el ajuste de ≤640px es
  `.glass-hero`, así que el choque es de una superficie; cuando la reducción se extienda a **todas**
  las superficies con blur (R7), la precedencia debe quedar garantizada para **todas**.
- **Es un defecto de la hoja fuente, no del build:** por eso **sí** entra (RF-04/AC-04), a diferencia
  de P1. **Resuelto por R6: EN ALCANCE.** El arreglo **no cambia valores**: reordena o blinda la
  cascada (mecanismo → plan).
- **Relación con P1:** comparten zona de código —el par de `backdrop-filter` y sus
  re-declaraciones— pero son **dos defectos distintos**: P1 se manifiesta en el CSS **compilado**
  (fuera de alcance) y H-1 en la **prevalencia de preferencias** de la hoja **fuente** (en alcance).

### 4.3 P5 — Blur, radios y esquinas anidadas

- **Cinco superficies con `backdrop-blur-md` (12px, por debajo de la guía de 20–30px):**
  `Header.jsx:36` (`bg-[#f7f6f2]/92 backdrop-blur-md`), `SidebarResponsive.jsx:29`
  (`bg-bg-dark/80 backdrop-blur-md`), `BottomNav.jsx:40` (`bg-bg-dark/80 backdrop-blur-md`),
  `DashboardUserModal.jsx:109` (`bg-bg-cream/95 backdrop-blur-md`) y
  `DashboardDrawer.jsx:108` (`bg-bg-dark/95 backdrop-blur-md`). Con `.glass-hero`
  (`index.css:71-72`: `blur(24px) saturate(180%)`, **ya conforme**) el conjunto de vidrio tiene
  **seis** superficies.
- **Inventario completo de `backdrop-blur*` en `src/` (13 sitios, verificado el 2026-10-18):**

  | # | Sitio | Utilidad | Rol |
  |---|---|---|---|
  | 1 | `Header.jsx:36` | `backdrop-blur-md` | superficie (conjunto) |
  | 2 | `SidebarResponsive.jsx:29` | `backdrop-blur-md` | superficie (conjunto) |
  | 3 | `BottomNav.jsx:40` | `backdrop-blur-md` | superficie (conjunto) |
  | 4 | `DashboardUserModal.jsx:109` | `backdrop-blur-md` | superficie (conjunto) |
  | 5 | `DashboardDrawer.jsx:108` | `backdrop-blur-md` | superficie (conjunto) |
  | 6 | `PaginaInicio.jsx:55` | `backdrop-blur-md` | **control** (botón «?» redondo de 44px) |
  | 7 | `DashboardDrawer.jsx:138` | `backdrop-blur-sm` | velo/overlay |
  | 8 | `DashboardUserModal.jsx:161` | `backdrop-blur-sm` | velo/overlay |
  | 9 | `ModalTarjeta.jsx:106` | `backdrop-blur-sm` | velo/overlay |
  | 10 | `AuthModal.jsx:134` | `backdrop-blur-sm` | velo/overlay (`bg-black/70`) |
  | 11 | `MiTarjetaVirtual.jsx:216` | `backdrop-blur-sm` | **control** (píldora) |
  | 12 | `Hero.jsx:68` | `backdrop-blur-xs` | **control** (enlace-botón «Ver funciones») |
  | 13 | `AuthModal.jsx:141` | `backdrop-blur-xl` | panel modal (exento de saturación, DP-17) |

  Son **seis** los usos de `backdrop-blur-md` en `src/` (cinco superficies **+** el botón «?»), y la
  sexta superficie del conjunto —`.glass-hero`— no usa utilidad: declara el blur en la hoja.
- **Fuera del conjunto, con motivo:** los **velos/overlays** (7–10) no son superficies (son scrims) y
  los **controles** (6, 11, 12) tampoco: RF-05/RF-06 **NO DEBEN** cambiar su blur ni su saturación.
  **`AuthModal.jsx:141` queda exento, además, de la saturación** (DP-17). La exención es
  **explícita**, no un olvido del barrido.
- **`.glass-card` (`index.css:81-87`) es blanca y opaca** (`background: #ffffff` en `:82`), sin blur
  y sin highlight de borde superior: se llama «glass» pero es una **tarjeta sólida**. La consumen
  `Card` (**seis** usos en producción —tres en `PaginaDashboardInicio.jsx:21, :25, :29`, uno en
  `PaginaDashboardConfiguracion.jsx:20`, uno en `PaginaDashboardTransacciones.jsx:20` y uno en
  `Features.jsx:109`, que renderiza cinco tarjetas—, más **cuatro** apariciones en
  `Card.test.jsx:15, :21, :29, :37`), `MiTarjetaVirtual.jsx:115`, `ModalTarjeta.jsx:119` y
  `AcordeonTarjetas.jsx:47`.
- **Radios:** `--radius-glass: 24px` (`index.css:31`) está dentro del rango 20–28px, pero
  `AcordeonTarjetas.jsx:47` aplica `glass-card rounded-2xl` — el 16px de la utilidad **pisa** el
  radio de vidrio. Quedan además cuatro esquinas anidadas a 16px dentro de contenedores de 24px:
  `Hero.jsx:81, :87, :93, :99`; `MiTarjetaVirtual.jsx:124, :164` (las caras de la tarjeta, con
  `overflow-hidden`, dentro de la superficie de `:115`); y `GridTarjetas.jsx:33` (envoltorio
  transparente, solo afecta al anillo de foco).
- **Conjunto de RF-07 (radios), explícito para no ampliar el alcance por interpretación:** entran las
  superficies con **esquinas visibles dentro del viewport** de la familia tarjeta/hero:
  `.glass-hero` (`index.css:77`, 24px ✓), `.glass-card` (`:84`, 24px ✓) y sus consumidores **en la
  medida en que el radio se aplique en el elemento**: `MiTarjetaVirtual.jsx:115` ✓,
  `ModalTarjeta.jsx:119` ✓, y `AcordeonTarjetas.jsx:47` ✗ (16px, el defecto). **No aplica** (no
  tienen esquinas): las barras y paneles a sangre `Header.jsx:36`, `SidebarResponsive.jsx:29`,
  `BottomNav.jsx:40` y `DashboardDrawer.jsx:108` (`border-l`, pegado al borde). **Queda excluido** el
  **cromo modal**: `DashboardUserModal.jsx:109` (`rounded-2xl`, 16px) y `AuthModal.jsx:141`
  (`rounded-3xl`, 24px), por §2.2/DP-16.

### 4.4 P2 — El área segura no se aplica

- El CSS global define **una sola** utilidad de área segura: `.safe-bottom` (`index.css:37-39`,
  `padding-bottom: env(safe-area-inset-bottom, 1rem)`) y **no tiene ningún consumidor**.
- `BottomNav.jsx:40` usa **`pb-safe`**, que **no está definido en ningún sitio del proyecto** (barrido
  de `safe` en `src/`: solo `.safe-bottom` en `index.css:37`, la mención en el comentario
  `BottomNav.jsx:29` y las aserciones de `BottomNav.test.jsx:86, :90`). Sin token ni utilidad que lo
  genere, la clase no produce ninguna regla.
- **La prueba es tautológica:** `BottomNav.test.jsx:86-90` comprueba que el componente lleva la clase
  que el componente escribe; no comprueba que la reserva exista.
- **No verificado por el planner:** el contenido del CSS compilado; **fuera de alcance** por R4. La
  comprobación se hace sobre la **fuente** (RF-09/AC-10) y por **medición en navegador** del relleno
  computado (§9, protocolo M-5).
- **Estado post-implementación (2026-10-18):** `BottomNav` ya usa `.safe-bottom` y la utilidad declara
  `padding-bottom: env(safe-area-inset-bottom, 1rem)`; la reserva **existe** y tiene consumidor
  (RF-09/AC-10 sobre la fuente). **Limitación registrada:** el documento **no** declara
  `viewport-fit=cover`, así que el `env()` resuelve **0** y **no hay efecto observable** en el estado
  actual (ver CL-15/DP-27). No cambia RF/AC.

### 4.5 P8 — Cinco pistas para cuatro controles

- `BottomNav.jsx:40` declara `grid grid-cols-5` con **cuatro** controles (los `items` de `:19-23`
  más el botón «Menú» de `:70-82`); la quinta pista queda vacía.
- `BottomNav.test.jsx:110-125` **aserta** `grid-cols-5` (`:120`) y `backdrop-blur-md` (`:122`): el
  defecto de grilla y el blur fuera de guía están **fijados por prueba**; ambas aserciones deberán
  cambiar con esta spec (solo la aserción, nunca el comportamiento para que la prueba pase).

### 4.6 P3 — Literales con token disponible y tokens sin consumidor

- **Literales en el CSS global con token equivalente:** `index.css:83` (`rgba(224, 221, 216, 0.8)` ↔
  `--color-border-line: #e0ddd8`), `index.css:85` (`rgba(15, 17, 23, 0.04)` ↔
  `--color-bg-dark: #0f1117`) y `index.css:92` (`rgba(26, 122, 94, 0.12)` ↔
  `--color-emerald-primary: #1a7a5e`).
- **Excepciones que hay que dejar como están (hallazgo propio):** `rgba(15, 17, 23, 0.88)`
  (`index.css:99`) y `rgba(15, 17, 23, 0.92)` (`:106`) están **asertados literalmente** por
  `index.css.test.js:125` y `:19` (contrato de la 001 RF1/RF2): migrarlos **rompería** esa prueba. Y
  `#ffffff` (`:82`) **no tiene token equivalente** en `@theme` (el más claro es
  `--color-bg-cream: #f7f6f2`, que **no es** el mismo color).
- **Tokens del `@theme` sin consumidor hoy** (barrido en `src/`), con la decisión de RF-12 (R8):
  - `--color-bg-dark-mid` (`index.css:16`) y `--color-bg-dark-end` (`:17`): **legado de una pasada
    anterior**; además **no describen** el gradiente real del Hero (`Hero.jsx:23` usa
    `#0f1117`/`#142820`/`#12362b`) ⇒ **se retiran**.
  - `--header-height` (`:33`): sin consumidor; su único rastro es una **aserción de ausencia**
    (`DashboardLayout.test.jsx:267`) ⇒ **se retira**.
  - `--color-cat-savings` (`:28`): **sin consumidor hoy**, pero es una **reserva documentada** de la
    paleta de categorías declarada del producto ⇒ **se conserva** y **no** se marca como muerto
    (no es código muerto: es una reserva con motivo escrito).

### 4.7 P4 — Contraste por debajo de AA

Valores medidos por el reviewer y **recalculados por el planner** (coinciden):

| Caso | Texto | Fondo asumido | Ratio | AA (texto normal) |
|---|---|---|---|---|
| `StatsBar.jsx:38` (etiqueta de métrica) | `text-white/80` | `#1a7a5e` (`StatsBar.jsx:26`) | **3,98:1** | No alcanza |
| `BottomNav.jsx:53` (etiqueta inactiva) | `text-slate-text` (`#5a6475`) | `#0f1117` | **3,16:1** | No alcanza |
| `BottomNav.jsx:52` (control activo) | `text-emerald-primary` (`#1a7a5e`) | `#0f1117` | **3,58:1** | No alcanza |
| `Header.jsx:80` («Usuario», modo dashboard) | `text-[#6b7280]` | `#f7f6f2` | **4,47:1** | No alcanza ⇒ **Spec 014** |

- **La franja de métricas tiene fondo opaco** (`#1a7a5e`): su peor caso **no** necesita composición;
  basta el cálculo contra ese fondo.
- **La barra inferior es translúcida y fija** (`BottomNav.jsx:40`, `bg-bg-dark/80`) sobre el
  contenido del dashboard (crema, `DashboardLayout.jsx:192`, `bg-bg-cream`): su fondo **efectivo**
  depende de lo que quede detrás. Para que el umbral sea verificable (M4), esta spec fija la **regla
  de composición** de §6.1-CL-08 y los **fondos de prueba** de AC-15:

  | Fondo de prueba detrás | Origen en el proyecto | Fondo efectivo compuesto (0,80 × `#0f1117` + 0,20 × fondo) |
  |---|---|---|
  | F1 `#f7f6f2` | cuerpo del dashboard (`--color-bg-cream`) | ≈ `#3d3f43` |
  | F2 `#ffffff` | tarjeta sólida `.glass-card` (`index.css:82`) | ≈ `#3f4145` |
  | F3 `#0f1117` | contenido oscuro extremo (`--color-bg-dark`) | `#0f1117` |
  | F4 `#1a7a5e` | bloque de acento (`--color-emerald-primary`) | ≈ `#112625` |

  Con F1, el fondo efectivo actual (≈`#3d3f43`) deja la etiqueta inactiva en **≈1,8:1** y el activo
  en **≈2,0:1** (cálculo del planner; **no** medido en navegador). El fondo efectivo **no** es un
  valor fijo: por eso el umbral se exige contra **los cuatro** fondos de prueba (equivale al peor
  caso) y el supuesto se declara.
- **Distinción necesaria:** las **etiquetas** son texto (umbral 4,5:1); la barra indicadora del activo
  (`BottomNav.jsx:61-66`) es un elemento **decorativo** (`aria-hidden`) y el estado ya se comunica con
  `aria-current="page"` (`:55`), así que su umbral es el de objeto gráfico (**3:1**).

### 4.8 P6 — Capas de vidrio y blobs

- Blobs visibles: **1** (`Hero.jsx:30`, `blur-[120px]`), dentro del máximo de 2. No se añade ninguno.
- Superficies translúcidas superpuestas: el reviewer las contó **≤3** en los casos extremos (Spec 009,
  AC-19: menú móvil abierto y modal de cuenta abierto) sobre el **build de producción**. **Sin prueba
  automática dedicada** (así lo declara la guía del proyecto): validación **manual** (§9, M-8).
- **Interacción que hay que vigilar:** una solución de contraste que **suba la opacidad** de la barra
  acerca esa superficie al límite de tres superficies y reduce su condición de vidrio ⇒ se registra
  como riesgo (§9) y se revisa en la validación manual.

### 4.9 Observaciones registradas (sin requisito derivado)

- `src/components/Hero.test.jsx:11` importa `./domain/landing/Hero`: la suite vive **fuera** de la
  carpeta de su componente. Funciona; moverla **no** está autorizado por esta spec.
- El artefacto de `dist/` es **instantánea** de una construcción anterior; cualquier afirmación sobre
  el CSS compilado exige **reconstruir y volver a medir** (fuera de alcance por R4).
- El número de suites ha crecido con los trabajos **cerrados** (011/012): la línea base debe
  re-medirse **inmediatamente antes** de tocar nada.
- `AcordeonTarjetas.jsx:35, :43` repite el patrón `role="list"`/`role="listitem"` de `GridTarjetas`:
  es la misma semántica de lista; su descarte documentado vive en la **Spec 015** (R2).

### 4.10 Evidencia trasladada a la Spec 015

La evidencia de los puntos (2), (3), (4) y (5) —los **siete dobles** de `framer-motion` con su
recuento y su lista verificados por `grep`, el envoltorio de `GridTarjetas`, la excepción de
`PanelTarjetas` y el `@param` de `como`—, junto con la de P7 (clase fantasma, importaciones sin uso y
recuentos documentados), **vive ahora en la Spec 015 §4**. Aquí solo queda la referencia.

---

## 5. Requisitos Funcionales (EARS)

### A — Revelado de la landing y preferencias del usuario

- **RF-01 — Ubicuo — Revelado gobernado por el CSS global.** El contenido de las **cinco** secciones
  de la landing (Hero, StatsBar, Features, HowItWorks, CtaSection) **DEBE** quedar gobernado por las
  **reglas de revelado del CSS global** (`reveal`, `reveal-left` y su estado revelado), en lugar de
  por clases de utilidad en línea equivalentes, de modo que las reglas globales de movimiento
  reducido y de ausencia de JS vuelvan a aplicarse. **EL SISTEMA DEBE** conservar el **sentido de
  movimiento** que hoy tiene cada sección (vertical en Hero, StatsBar, Features y CtaSection;
  horizontal en HowItWorks) y **NO DEBE** cambiar el momento en que cada sección se revela.
- **RF-02 — Evento — Movimiento reducido respetado.** **CUANDO** `prefers-reduced-motion: reduce`
  esté activo, **EL SISTEMA DEBE** mostrar el contenido de esas secciones **sin transformación y sin
  transición** (opacidad final, sin desplazamiento, sin animación de entrada), y **NO DEBE** dejar
  contenido permanentemente oculto ni a medio revelar. **El comportamiento DEBE** ser observable sin
  leer código (estado computado en un navegador real, §9 M-1).
- **RF-03 — Estado — Sin JS.** **CUANDO** la página no ejecute JavaScript (clase `js` ausente en el
  elemento raíz), **EL SISTEMA NO DEBE** ocultar ni desplazar el contenido de esas secciones: el
  ocultamiento previo al revelado **solo** puede depender de la marca de JS activo (contrato de la
  Spec 001).

### B — Superficies de vidrio

- **RF-04 — Estado — La transparencia reducida manda en los dos contextos (H-1, R6).** **CUANDO**
  `prefers-reduced-transparency: reduce` esté activo, **EL SISTEMA DEBE** desactivar el desenfoque de
  fondo de **todas las superficies del conjunto** (RF-05) **tanto en ancho normal (>640px) como en
  ≤640px**; **EL SISTEMA NO DEBE** reintroducir blur desde el ajuste de pantallas pequeñas (**la
  preferencia prevalece por cascada, no por accidente de orden**). **El resultado DEBE** ser
  observable (efecto computado `none`) en un navegador real **en ambos contextos** (§9 M-2) y **DEBE**
  además comprobarse sobre la **fuente**. **Los valores de las declaraciones NO DEBEN cambiar** para
  lograrlo. Matriz de contextos: §5-B.
- **RF-05 — Ubicuo — Blur y saturación en ancho normal (>640px), en el conjunto declarado.** **MIENTRAS**
  el ancho sea **mayor que 640px**, las superficies del conjunto —`.glass-hero` y las **cinco**
  superficies con `backdrop-blur-md`: `Header.jsx:36`, `SidebarResponsive.jsx:29`,
  `BottomNav.jsx:40`, `DashboardUserModal.jsx:109` y `DashboardDrawer.jsx:108`— **DEBEN** usar
  desenfoque de fondo de **20–30px** con saturación de **160–200 %** (hoy cinco usan 12px y ninguna
  saturación en ancho normal). **Quedan FUERA del conjunto**, y por tanto **NO DEBEN** cambiar por
  este requisito: los **velos/overlays** (scrims), los **controles** translúcidos (botón «?» de
  `PaginaInicio.jsx:55`, píldora de `MiTarjetaVirtual.jsx:216`, enlace-botón de `Hero.jsx:68`) y el
  panel de `AuthModal.jsx:141`, **exento también de la saturación** (DP-17).
- **RF-06 — Estado — Blur reducido en ≤640px para todo el vidrio con blur (R7).** **CUANDO** el ancho
  sea **de 640px o menos**, **TODAS** las superficies del conjunto de RF-05 **DEBEN** usar un
  desenfoque de fondo de **12–16px** con la **saturación sin alterar** respecto del valor de ancho
  normal, tal como el contrato de la Spec 001 RF5 declara para «`.glass-hero` **y el resto de
  superficies con blur**» (`specs/001-…/spec.md:89-91`); hoy la hoja solo lo implementa para
  `.glass-hero` (`index.css:124-129`). **EL SISTEMA NO DEBE** inventar otro umbral de ancho ni
  cambiar los valores de saturación, y **NO DEBE** aplicar la reducción a los **controles** ni a los
  **velos**. La Spec 001 **no se enmienda**: se implementa lo que declara. **El mecanismo es libre**
  (DP-25): lo exigido es el **efecto por superficie**, no que se implemente sobrescribiendo una
  utilidad compartida.

  **Matriz ancho × preferencia (los dos contextos, sin ambigüedad):**

  | Ancho | `prefers-reduced-transparency: normal` | `prefers-reduced-transparency: reduce` |
  |---|---|---|
  | **>640px** | blur **20–30px** + saturación **160–200 %** (RF-05) | **sin desenfoque** (`none`) + fondo semisólido (RF-04); la saturación es irrelevante sin blur |
  | **≤640px** | blur **12–16px**, saturación **intacta** (RF-06) | **sin desenfoque** (`none`) + fondo semisólido (RF-04); el ajuste de ≤640px **NO** reintroduce blur |

  Fuera de la matriz: entornos **sin soporte** de `backdrop-filter` ⇒ fondo semisólido de respaldo
  (CL-04).
- **RF-07 — Ubicuo — Radios de vidrio, en el conjunto declarado.** Las superficies **con esquinas
  visibles** del conjunto **DEBEN** presentar radios de **20–28px** (hoy `AcordeonTarjetas.jsx:47`
  queda en 16px porque la utilidad `rounded-2xl` pisa el radio de vidrio). **EL SISTEMA NO DEBE**
  aplicar ese rango fuera del conjunto declarado —barras y paneles a sangre **sin esquinas**
  (`Header`, `SidebarResponsive`, `BottomNav`, `DashboardDrawer`), **cromo modal**
  (`DashboardUserModal.jsx:109`, `AuthModal.jsx:141`) y botones o controles— y **DEBE** dejar
  explícito y coherente el criterio de las **esquinas anidadas** dentro de una superficie de vidrio
  (incluidas las dos caras de la tarjeta virtual, que hoy no coinciden con el radio de su contenedor
  y dejan ver el fondo de este en las esquinas).
- **RF-08 — Ubicuo — La tarjeta sólida, documentada.** La superficie que hoy se llama `glass-card`
  **DEBE** quedar **declarada documentalmente como tarjeta sólida** (opaca, sin desenfoque de fondo y
  sin highlight de borde superior) con la razón de su forma y de su nombre, **sin** renombrar la
  clase, **sin** volverla translúcida y **sin** cambiar su aspecto. **EL SISTEMA NO DEBE** añadir
  superficies translúcidas, hexadecimales ni tokens nuevos para lograrlo.

### C — Área segura y barra inferior

- **RF-09 — Ubicuo — La reserva del área segura se aplica.** La barra de navegación inferior **DEBE**
  reservar el área segura inferior con el mecanismo que el CSS global ya declara, de modo que el
  espacio se reserve **en la práctica** y no solo por el nombre de una clase. **La reserva DEBE**
  conservar un valor de respaldo cuando el entorno no reporte área segura.
- **RF-10 — Ubicuo — Cuatro controles, cuatro columnas.** La barra inferior **DEBE** distribuir sus
  **cuatro** controles en **cuatro** columnas equidistantes (hoy hay cinco pistas para cuatro
  controles). **EL SISTEMA NO DEBE** alterar el número de controles, su orden, sus etiquetas ni sus
  acciones.

### D — Tokens y literales del CSS global

- **RF-11 — Ubicuo — Literales con token disponible.** Los literales de color del CSS global que
  correspondan a **tokens existentes** **DEBEN** expresarse mediante esos tokens (hoy tres casos),
  conservando el **color computado** que tienen hoy. **EL SISTEMA NO DEBE** introducir hexadecimales
  nuevos, tokens nuevos ni alterar el aspecto; **las excepciones** (los dos literales de fondo oscuro
  que el contrato probado de la Spec 001 aserta de forma literal, y el blanco sin token equivalente)
  **DEBEN** quedar **documentadas con su motivo**.
- **RF-12 — Estado — Tokens sin consumidor, con decisión (R8).** **SI** un token del tema no tiene
  ningún consumidor, **EL SISTEMA DEBE** resolverlo de forma explícita: **retirarlo** o **declararlo
  reservado con motivo escrito**. Decisión: **se retiran** `--color-bg-dark-mid`,
  `--color-bg-dark-end` y `--header-height` (tras re-verificar el barrido de consumidores) y **se
  conserva como reserva documentada** `--color-cat-savings`, por formar parte de la paleta de
  categorías declarada del producto (**NO DEBE** marcarse como muerto ni retirarse). **EL SISTEMA NO
  DEBE** dejar tokens sin decisión ni añadir tokens nuevos.

### E — Contraste

- **RF-13 — Ubicuo — Contraste de la franja de métricas.** La etiqueta secundaria de la franja de
  métricas **DEBE** alcanzar el contraste **AA** de texto normal (**4,5:1**) sobre el fondo de su
  superficie (opaco), usando **exclusivamente** tokens ya existentes (hoy queda en 3,98:1). **EL
  SISTEMA NO DEBE** cambiar el color del fondo de la franja ni su contenido.
- **RF-14 — Ubicuo — Contraste de la barra inferior, contra fondos de prueba.** Las **etiquetas** de
  la barra inferior (estado activo e inactivo) **DEBEN** alcanzar AA de texto normal (**4,5:1**) y el
  **indicador** del control activo **DEBE** alcanzar al menos el umbral de objeto gráfico (**3:1**),
  en ambos casos contra el **fondo efectivo compuesto** según la regla de composición de CL-08 y
  **contra cada uno de los cuatro fondos de prueba** de AC-15 (equivale al peor caso). **EL SISTEMA
  DEBE** resolverlo con tokens existentes y **NO DEBE** apoyarse solo en el color para comunicar el
  estado (debe conservarse la información no cromática del activo).

### F — Transversal de esta spec

- **RF-15 — Ubicuo — Pruebas y no-regresión.** Los cambios **DEBEN** llevar pruebas en el patrón
  vigente (Vitest y Testing Library, pruebas junto al código) y **NO DEBEN** degradar ninguna suite
  existente. Las aserciones que hoy fijan un valor corregido por esta spec **DEBEN** actualizarse
  **solo** en su expectativa, nunca relajarse ni cambiarse para que una prueba pase: **blur**
  (`BottomNav.test.jsx:122`, `SidebarResponsive.test.jsx:58, :63`,
  `DashboardUserModal.test.jsx:439, :443`, `DashboardDrawer.test.jsx:144, :151`), **grilla**
  (`BottomNav.test.jsx:110, :120`) y **clase de área segura** (`BottomNav.test.jsx:86-90`).
  **También DEBEN revisarse, solo en su expectativa, las aserciones de color que fija el cambio de
  contraste (RF-14):** `BottomNav.test.jsx:52` (`text-emerald-primary`), `:56` (indicador con
  `bg-emerald-primary`) y `:62` (`text-slate-text`). La suite del contrato del CSS global
  (`index.css.test.js`) **DEBE ampliarse, NO reescribirse**: sus asertos se conservan y se **añaden**
  los nuevos, que **DEBEN ser agnósticos al mecanismo** (CL-13/DP-25).
- **RF-16 — Ubicuo — Validaciones no automatizadas declaradas.** El sistema de calidad **DEBE**
  declarar como **no automatizadas** —y nunca afirmadas como «verdes» sin medición— las
  comprobaciones que el entorno de pruebas no puede evaluar: contraste real medido, efecto real de
  las preferencias de movimiento y de transparencia (en ambos contextos), **blur computado a ≤640px**,
  fallback sin soporte de desenfoque, reserva real del área segura, apariencia y **límites de capas de
  vidrio y de blobs**. Cada una **DEBE** reportarse como medida, no aplicable o pendiente, siguiendo
  el protocolo de §9.
- **RF-17 — Ubicuo — Alcance mínimo.** Los cambios **NO DEBEN** introducir dependencias, cambios de
  build, rutas, datos, endpoints, autenticación, `TRIAL_ACTIVO`, contratos públicos (props, clases
  consumidas, nombres de eventos) ni superficies de vidrio adicionales; **NO DEBEN** migrar
  hexadecimales de componentes ni tocar nada del alcance de la Spec 015.

---

## 6. Casos Límite y Decisiones

> Cada decisión vive **en un único sitio** (M5): las demás secciones la referencian por su ID.

### 6.1 Casos límite

- **CL-01 — Sin JavaScript.** Sin la marca de JS activo, nada del contenido de la landing puede quedar
  oculto: el ocultamiento previo al revelado solo existe bajo esa marca. (No se introduce render en
  servidor.)
- **CL-02 — `prefers-reduced-motion: reduce`.** El contenido se pinta en su estado final sin
  transformación ni transición. **NO DEBE** quedar oculto ni desplazado si el revelado dependía del
  movimiento para completarse.
- **CL-03 — `prefers-reduced-transparency: reduce` en ancho normal y en ≤640px.** Fondo semisólido y
  sin desenfoque en **todas** las superficies del conjunto, **en los dos contextos**: la preferencia
  por transparencia **prevalece** sobre el ajuste de ancho (H-1/R6, RF-04).
- **CL-04 — Entorno sin soporte de desenfoque.** El fallback de fondo semisólido sigue vigente y la
  legibilidad no depende del efecto: sin desenfoque, el texto debe seguir cumpliendo contraste.
- **CL-05 — Dispositivo táctil sin hover (`hover: none`).** Ninguna información puede depender
  únicamente del hover: los efectos de hover permanecen bajo la condición de que el dispositivo lo
  soporte, y el estado de la barra inferior sigue siendo perceptible sin hover.
- **CL-06 — Frontera de ancho (los dos contextos de blur).** En **>640px** el conjunto usa 20–30px con
  saturación 160–200 % (RF-05); en **≤640px** usa 12–16px con la saturación intacta (RF-06). El único
  umbral del contrato es **640px** y **NO DEBE** introducirse otro; la reserva del área segura, la
  barra de cuatro columnas y el contraste AA siguen aplicando en el ancho mínimo.
- **CL-07 — Combinación de preferencias en vista estrecha.** Con transparencia reducida **y** ancho
  ≤640px simultáneos, gana la transparencia reducida (sin desenfoque) en todas las superficies del
  conjunto y se conserva el fondo semisólido; el orden de prevalencia debe quedar **definido por la
  hoja, no accidental** (es el defecto H-1).
- **CL-08 — Fondo efectivo de la barra inferior: regla de composición.** El fondo de la barra es
  `bg-bg-dark/80`; su **fondo efectivo** se obtiene componiendo el color de la barra sobre el color
  que quede **inmediatamente detrás**, con la fórmula estándar
  `efectivo = 0,80 × rgb(15, 17, 23) + 0,20 × fondo_detrás` (composición alfa sobre sRGB, sin ajuste
  de gamma). El umbral se exige contra **cada** fondo de prueba de AC-15 (F1–F4) y **el supuesto
  usado DEBE declararse**. Cuando el fondo efectivo no pueda garantizarse, la solución **no** puede
  depender de él.
- **CL-09 — Anchos fraccionarios o zoom alto.** Ninguna regla nueva puede introducir un umbral de
  ancho distinto del ya existente: no debe haber anchos con reglas contradictorias de blur o de
  distribución.
- **CL-10 — Código en movimiento.** El usuario edita a mano: si al implementar un defecto ya no
  existe (clase ya retirada, literal ya migrado, token ya usado), se registra como «ya no aplicable»
  y **no** se recrea ni se revierte la edición. (Espejo de la 015 CL-01.)
- **CL-11 — La prueba del contrato del CSS global.** Los asertos literales de la Spec 001 sobre
  valores del CSS no se relajan: si un requisito chocara con uno de ellos, el conflicto se eleva en
  lugar de resolverse cambiando la prueba.
- **CL-12 — Suites compartidas con las specs 011/012 (cerradas).** Si un mismo archivo de prueba
  necesita ajustes por esta spec y pertenece a esos trabajos, el ajuste se limita a la **expectativa
  de estilo** que esta spec corrige —`DashboardUserModal.test.jsx:439, :443` y
  `DashboardDrawer.test.jsx:144, :151` (blur), `SidebarResponsive.test.jsx:58, :63` (blur),
  `BottomNav.test.jsx:52, :56, :62, :110, :120, :122` (color, grilla y blur)— y **nunca** toca los
  dobles de `framer-motion`, la configuración de Vitest, los stubs de `matchMedia` ni los casos de
  foco (espejo en la 015 CL-02).
- **CL-13 — La suite del CSS global se amplía, no se reescribe.** `index.css.test.js` es contrato de la
  Spec 001: los asertos nuevos se **añaden** y **DEBEN** expresar el **efecto exigido** (prevalencia
  de la transparencia reducida, cobertura de ≤640px, tokens), **no** un mecanismo concreto: no puede
  exigirse que la cobertura viva en `index.css` si el plan la implementa con utilidades de los
  componentes (DP-25).
- **CL-14 — Secciones sin suite propia.** De las cinco secciones de la landing solo `Features` tiene
  suite (`Features.test.jsx`) y `Hero` cuenta con `src/components/Hero.test.jsx` fuera de su carpeta;
  `StatsBar`, `HowItWorks` y `CtaSection` **no** tienen suite. Su verificación es de **fuente** (lectura
  del componente + contrato global probado por `index.css.test.js` y `useReveal.test.js`); añadir
  suites nuevas es **opcional** para el plan y **no** se exige como criterio de aceptación (DP-18).
- **CL-15 — Área segura sin `viewport-fit=cover` (limitación registrada, post-implementación).** La
  barra inferior usa `.safe-bottom` (`padding-bottom: env(safe-area-inset-bottom, 1rem)`), pero el
  documento **no** declara `viewport-fit=cover`; sin ese modo a sangre completa el inset resuelto es
  **0** y la reserva **no tiene efecto observable** en el estado actual. Se mantiene el cambio (RF-09
  se cumple sobre la fuente y conserva el respaldo) y se anota como **deuda** para una spec que decida
  el modo a sangre completa. No cambia RF/AC.

### 6.2 Decisiones

| ID | Decisión |
|---|---|
| **DP-01** | **Encuadre y reparto:** esta spec es la de **calidad visual/CSS** (superficies, preferencias, área segura, barra, tokens, literales y contraste). La **higiene de código, los dobles de prueba y la documentación** se trasladan a la **Spec 015** por decisión del usuario; ninguna de las dos reabre la otra (RF-17). |
| **DP-02** | **D-B (punto 1):** se **re-adoptan** las clases de revelado del CSS global en las cinco secciones. **No** se borra el bloque de revelado, **no** se enmienda la Spec 001 y **no** se toca `index.html`: se restaura el respeto a la preferencia de movimiento que la Spec 001 ya dejó probado. |
| **DP-03** | **Mapeo de movimientos:** vertical para Hero, StatsBar, Features y CtaSection; horizontal para HowItWorks (el único que hoy se mueve en horizontal). El bloque **escalonado** queda **sin consumidor** y **se conserva**: es contrato sancionado por la Spec 001, no CSS muerto que borrar. |
| **DP-04** | **Sin tokens nuevos:** contraste y literales se resuelven con los tokens existentes; añadir un hexadecimal o un token está prohibido por el alcance. |
| **DP-05** | **`.glass-card` no se renombra ni se vuelve translúcida:** renombrar rompería el contrato de la Spec 006/001 y las aserciones de `Card`, `Features` y `MiTarjetaVirtual`; volverla translúcida subiría el recuento de superficies de vidrio (límite ya ajustado) y degradaría el contraste sobre fondo crema (RF-08). |
| **DP-06** | **Excepciones de literales del CSS, documentadas:** `#ffffff` (sin token equivalente) y los dos fondos oscuros `rgba(15, 17, 23, 0.88)` / `0.92`, **asertados literalmente** por el contrato de la 001 ⇒ **no** se tocan. Los tres literales equivalentes a token (`:83`, `:85`, `:92`) **sí** se migran, conservando el color computado. |
| **DP-07** | **No se «arreglan» las pruebas del contrato:** si un requisito chocara con un aserto de la Spec 001, se eleva el conflicto; no se relaja la prueba (CL-11). |
| **DP-08** | **Tokens sin consumidor — CERRADO (R8):** se **retiran** `--color-bg-dark-mid` (`index.css:16`), `--color-bg-dark-end` (`:17`) y `--header-height` (`:33`), previa re-verificación del barrido de consumidores; se **conserva** `--color-cat-savings` (`:28`) como **reserva documentada** de la paleta de categorías (**no** se retira y **no** se marca como muerto). **Ningún** token queda sin decisión y no se añade ninguno. |
| **DP-09** | **Blur a ≤640px — CERRADO (R7) + M1:** la reducción a **12–16px** con saturación intacta se **extiende a todas las superficies del conjunto** en ≤640px, y en **>640px** el valor es **20–30px con saturación 160–200 %**. La **001 no se enmienda**; el umbral es **uno solo** (640px) y la saturación **no** cambia entre contextos. Riesgo aceptado y registrado: el coste de repintado en móvil se revisa en navegador (§9 M-3) y, si aparece, se registra como hallazgo **sin** inventar un umbral nuevo. |
| **DP-10** | **Contraste de la barra inferior — M4:** se exige AA contra el fondo efectivo compuesto (CL-08) y contra **los cuatro fondos de prueba** (F1–F4 de AC-15), y se conserva la información no cromática del estado activo. La solución no puede depender del contenido detrás. |
| **DP-11** | **`Header.jsx:80` y los hexadecimales de componentes:** fuera de alcance (Spec 014). |
| **DP-12** | **Límites de capas y blobs, y contraste real:** no hay prueba automática dedicada (así lo declara la guía del proyecto). Se declaran validaciones **no automatizadas** (RF-16, §9) y se reportan como medidas o pendientes; nunca como verdes. |
| **DP-13** | **Alcance de pruebas:** toda corrección de valor CSS que hoy esté fijada por una aserción (blur, grilla, clase de área segura) obliga a actualizar **esa** expectativa; **no** se añaden pruebas de valores que el entorno no puede computar (se compensa con prueba sobre la **fuente** y con medición en navegador, §9). |
| **DP-14** | **Artefacto de build (P1) — FUERA DE ALCANCE (R4):** **no** entra como requisito, criterio ni paso de validación. Se **documenta** con su evidencia y su hipótesis de causa (§4.1) y se **remite** a una **spec futura de build / compatibilidad de prefijos CSS**. |
| **DP-15** | **H-1 — CERRADO (R6), EN ALCANCE:** el ajuste de `@media (max-width: 640px)` **deja de pisar** el `backdrop-filter: none` de `@media (prefers-reduced-transparency: reduce)`: la cascada se reordena o se blinda, **sin cambiar ningún valor**. Aplica a **todas** las superficies del conjunto y a **los dos contextos** (RF-04, AC-04). |
| **DP-16** | **Conjunto cerrado de RF-07 (radios):** entran las superficies **con esquinas visibles** de la familia tarjeta/hero (`.glass-hero`, `.glass-card` y sus consumidores con radio en el elemento, más las esquinas anidadas). **No aplica** a superficies sin esquinas (barras y paneles a sangre). **Excluido** el **cromo modal** (`DashboardUserModal.jsx:109`, `rounded-2xl`; `AuthModal.jsx:141`, `rounded-3xl`), por §2.2 y specs 010/011. La exclusión es **explícita**, no una interpretación del alcance. |
| **DP-17** | **`AuthModal.jsx:141`, exento también de la saturación:** su blur ya está en **24px** (dentro del rango) y **no** lleva `saturate()`. Se le exime de RF-05 porque (a) no hay **defecto medido** (P5 no lo incluye y esta spec solo corrige defectos medidos), (b) su cromo pertenece a las specs 010/011 y (c) añadir saturación cambiaría su aspecto sin requisito que lo respalde. Queda **fuera del conjunto**. |
| **DP-18** | **Secciones sin suite (CL-14):** su criterio de aceptación (AC-01) se verifica sobre la **fuente** y con las suites existentes; añadir suites nuevas es **opcional** y **no** se exige. Nada se declara verde sin haberse medido. |
| **DP-19** | **Suites de 011/012 (cerradas) que asertan estilo:** solo se ajusta **la expectativa de estilo** señalada en CL-12/RF-15; dobles, stubs de `matchMedia`, configuración de Vitest y casos de foco quedan **intactos**. |
| **DP-20** | **Nota no bloqueante:** el panel de `DashboardUserModal` mantiene `rounded-2xl` (16px) por DP-16. Alinearlo con 20–28px sería un cambio de **cromo modal** (010/011) y requeriría decisión del usuario y spec propia; **no** se asume aquí. |
| **DP-21** | **Contextos de blur (M1):** los dos criterios son **disjuntos y exhaustivos** respecto del ancho: **>640px ⇒ 20–30px + saturación 160–200 %**; **≤640px ⇒ 12–16px + saturación intacta**. El punto de corte es **640px** inclusive en el segundo caso. Ningún AC puede leerse como «20–30px en cualquier ancho». |
| **DP-22** | **Matriz de preferencias (M2):** la combinación de ancho y preferencia se resuelve como en la matriz de §5-B; la transparencia reducida **gana siempre** y el ajuste de ≤640px **nunca** reintroduce blur. La matriz es la **referencia única** para RF-04, RF-05, RF-06, CL-03, CL-06 y CL-07. |
| **DP-23** | **Protocolo de validación manual (M3):** toda medición «en navegador» de esta spec se hace con el protocolo **§9-P** (navegador y versión declarados, tamaños concretos, estado exacto de la preferencia y valores a registrar). Sin ese protocolo, la validación admite interpretaciones distintas y **no** se acepta. |
| **DP-24** | **Fondos de prueba del contraste (M4):** F1 `#f7f6f2`, F2 `#ffffff`, F3 `#0f1117` y F4 `#1a7a5e`, compuestos con la regla de CL-08. El umbral se cumple contra **todos**; si la solución depende de un fondo distinto, **no** vale. |
| **DP-25** | **≤640px agnóstico al mecanismo (detalle del reviewer):** lo exigido es el **efecto por superficie**, no la forma de lograrlo. Queda **prohibido** resolverlo sobrescribiendo la utilidad compartida `backdrop-blur-md` en el media query: afectaría también al **control excluido** `PaginaInicio.jsx:55` (prohibido por RF-05/RF-06). Los asertos nuevos de `index.css.test.js` **DEBEN** verificar el efecto exigido y **no** presuponer dónde vive la regla (CL-13). |
| **DP-26** | **Barrido de blur corregido (detalle del reviewer):** el inventario de §4.3 es la **referencia única** de sitios con `backdrop-blur*`: **cinco** superficies `md` + el botón «?» (sexto uso de `md`) + velos en `DashboardDrawer.jsx:138`, `DashboardUserModal.jsx:161`, `ModalTarjeta.jsx:106` y **`AuthModal.jsx:134`** + píldora `MiTarjetaVirtual.jsx:216` (**`sm`**, no `xs`) + `Hero.jsx:68` (`xs`) + `AuthModal.jsx:141` (`xl`). Cualquier cifra distinta en el cuerpo del documento es un error y prevalece este inventario. |
| **DP-27** | **Área segura: deuda de `viewport-fit=cover` (post-implementación):** se conserva `.safe-bottom` con respaldo `1rem`; sin `viewport-fit=cover` el `env()` resuelve **0** y el efecto no es observable (CL-15). Decidir el modo a sangre completa y su impacto en el resto del layout queda para una **spec futura**; la 013 **no** cambia `index.html` ni añade configuración de viewport. |

---

## 7. Criterios de aceptación — tabla compacta requisito ↔ criterio ↔ verificación (M5)

> Una fila por requisito funcional. «Estado observable» se enuncia sobre lo que se puede **ver o
> medir** (DOM, clase aplicada, valor computado, texto de la hoja). «Auto» = verificable por la
> suite; «Manual» = protocolo §9-P; «Fuente» = lectura del código/hoja.

| AC | RF | Estado observable esperado | Verificación | Tipo |
|---|---|---|---|---|
| **AC-01** | RF-01 — revelado gobernado por el CSS global | Las cinco secciones aplican las clases de revelado del CSS global (y su estado revelado cuando el contenido ya es visible); ninguna conserva las utilidades en línea equivalentes | **Prueba DOM** donde hay suite (`Features.test.jsx`, `src/components/Hero.test.jsx`) y **verificación de fuente** en `StatsBar`, `HowItWorks` y `CtaSection` (CL-14/DP-18); las pruebas de `index.css` que ya nombran esas clases siguen verdes | Auto + Fuente |
| **AC-02** | RF-02 — movimiento reducido | Con la preferencia activa: opacidad final, sin transformación y sin transición en las cinco secciones, y **ningún** contenido oculto | Fuente (reglas globales apuntando a esas clases) + **M-1** (§9-P) | Manual |
| **AC-03** | RF-03 — sin JS | Sin la marca de JS: las reglas que ocultan el contenido no aplican y el contenido queda visible | **Solo fuente** sobre la hoja y `index.html`: la puerta `.js` es la **única** condición de ocultamiento (CL-01). **No** se usa «navegador con JS desactivado»: sin JS la SPA no pinta contenido y la comprobación **no es medible** | Fuente |
| **AC-04** | RF-04 — transparencia reducida en **los dos contextos** (H-1, R6, M2) | El desenfoque de **todas** las superficies del conjunto = **`none`** con la preferencia activa, **tanto a 1440×900 (>640px) como a 375×812 (≤640px)** (hoy el hero lo recupera en ≤640px) | Fuente (orden/blindaje de los bloques, **sin cambiar valores**) + **M-2** con los dos tamaños | Fuente + Manual |
| **AC-05** | RF-05 — blur y saturación en **>640px** (M1) | A 1440×900 las **seis** superficies del conjunto declaran blur en **20–30px** y saturación **160–200 %**; ninguna conserva 12px; velos y controles no cambian | Fuente (valor por superficie según el inventario de §4.3) + **M-3a**; las aserciones de estilo afectadas se actualizan (RF-15) | Fuente + Manual |
| **AC-06** | RF-06 — contrato de la Spec 001 en ≤640px | La reducción a 12–16px sin alterar la saturación sigue declarada para `.glass-hero`, y el aserto de `index.css.test.js:63-69` sigue pasando **sin modificar** | Suite del CSS global **ampliada, no reescrita**: sus asertos actuales se conservan tal cual (CL-13) | Auto |
| **AC-07** | RF-06 — **≤640px en las seis superficies** (R7, M1, agnóstico al mecanismo) | A 640×900 y a 375×812 las **seis** superficies del conjunto tienen blur computado en **12–16px** con la saturación **intacta**; el **control** `PaginaInicio.jsx:55` **no** cambia su blur; ningún otro uso de `backdrop-blur-md` fuera del conjunto se ve afectado | Fuente (efecto por superficie, **sin** presuponer el mecanismo; DP-25) + **M-3b**; asertos nuevos de `index.css.test.js` **agnósticos** al mecanismo y sin exigir que la regla viva en la hoja | Fuente + Manual |
| **AC-08** | RF-07 — radios del conjunto declarado | Las superficies **con esquinas** del conjunto tienen radio de 20–28px (hoy `AcordeonTarjetas.jsx:47` queda en 16px); las barras/paneles sin esquinas y el **cromo modal** (`DashboardUserModal.jsx:109`, `AuthModal.jsx:141`) **no** cambian; las esquinas anidadas quedan documentadas con criterio y las caras de la tarjeta virtual coinciden con el radio de su contenedor | Fuente (radio por superficie) + `grep` del radio del cromo modal (sin cambios) + **M-4** | Fuente + Manual |
| **AC-09** | RF-08 — tarjeta sólida documentada | Existe la declaración documental de su naturaleza sólida y su motivo; la clase **no** se renombra, **no** gana desenfoque y su aspecto no cambia | Inspección del comentario/JSDoc + `grep` de desenfoque en esa regla + suites de `Card`, `Features` y `MiTarjetaVirtual` verdes | Auto + Fuente |
| **AC-10** | RF-09 — área segura aplicada | La clase que usa la barra inferior **existe** en el CSS global (y la utilidad declarada tiene consumidor): no queda ninguna de las dos huérfana | Fuente cruzando hoja y componente + **M-5** (`paddingBottom` computado) | Fuente + Manual |
| **AC-11** | RF-10 — cuatro columnas | La barra declara **cuatro** pistas para sus **cuatro** controles y la prueba lo aserta (hoy aserta cinco) | `BottomNav.test.jsx` actualizado en la expectativa + aserción de recuento de controles | Auto |
| **AC-12** | RF-11 — literales con token | Los tres literales con token equivalente ya no aparecen como literales; los tres casos exceptuados **siguen** con su valor literal y su motivo documentado; ningún hexadecimal nuevo | `index.css.test.js` **ampliado, no reescrito** (asertos nuevos de ausencia/presencia) + inspección del diff | Auto + Fuente |
| **AC-13** | RF-12 — tokens sin consumidor (R8) | Ninguno de los tres tokens retirados (`--color-bg-dark-mid`, `--color-bg-dark-end`, `--header-height`) queda declarado, y `--color-cat-savings` **sigue** declarado como reserva documentada, sin marcarse como muerto; ningún token sin decisión y ninguno nuevo | Inspección del diff + barrido de consumidores; la decisión queda escrita | Fuente |
| **AC-14** | RF-13 — contraste de la franja de métricas | El contraste calculado de la etiqueta secundaria sobre el fondo **opaco** de su superficie es **≥4,5:1**, con tokens existentes | **Cálculo** desde los tokens + **M-6** (color computado); sin prueba automática ⇒ se reporta como medida | Manual |
| **AC-15** | RF-14 — contraste de la barra inferior (M4) | Contra **cada** fondo de prueba F1 `#f7f6f2`, F2 `#ffffff`, F3 `#0f1117` y F4 `#1a7a5e` (compuestos con CL-08): etiquetas activa e inactiva **≥4,5:1** e indicador **≥3:1**; el estado activo conserva información no cromática; el supuesto usado queda declarado | **Cálculo** con la regla de composición + **M-7** (medición en el dashboard sobre los cuatro fondos representables, varios anchos); sin prueba automática | Manual |
| **AC-16** | RF-15/RF-16/RF-17 — cierre | Sin fallos **nuevos** frente a la **línea base re-medida antes de tocar código**, **suite por suite**; sin dependencias, sin cambios de datos/rutas/contratos, sin hexadecimales nuevos, sin superficies ni blobs nuevos; `index.css.test.js` solo **ampliado**; y con la lista de validaciones no realizadas declarada explícitamente | `npm test` + `npm run build` (tarea final del plan) + inspección del diff (incluidos los asertos de color, grilla y blur de CL-12) + declaración de validaciones no realizadas (§9) | Auto + Fuente |

> **Honestidad de la validación.** AC-14, AC-15, AC-02, AC-04, AC-05, AC-07, AC-08 y AC-10 **no** tienen
> prueba automática en este proyecto: se calculan o se miden con el protocolo **§9-P** y se reportan
> como **medidas**, **no aplicables** o **pendientes**, nunca como «verdes». AC-03 se verifica **solo
> sobre la fuente**. AC-01 se verifica en **DOM** donde hay suite y en **fuente** en las tres
> secciones sin suite. AC-16 compara **contra la línea base medida inmediatamente antes** del cambio;
> sin esa medición no puede declararse nada.

---

## 8. Trazabilidad

### 8.1 Defectos medidos → requisitos

| Defecto | Requisito | Criterio |
|---|---|---|
| **P1 — el CSS compilado pierde el `backdrop-filter` sin prefijo de `.glass-hero`** | **Fuera de alcance (R4):** documentado en §4.1 y remitido a una **spec futura de build/compatibilidad de prefijos** | — (no genera AC; DP-14) |
| **H-1 — el ajuste de ≤640px pisa la transparencia reducida** | RF-04 | AC-04 |
| P2 — área segura no aplicada; prueba tautológica | RF-09 | AC-10 |
| P3 — literales con token disponible; tokens sin consumidor | RF-11, RF-12 | AC-12, AC-13 |
| P4 — contraste bajo AA (franja, barra, `Header`) | RF-13, RF-14 (y remisión a la Spec 014) | AC-14, AC-15 |
| P5 — blur de 12px en ancho normal, radio de 16px y esquinas anidadas; aserciones que fijan el defecto | RF-05, RF-06, RF-07, RF-08 | AC-05, AC-06, AC-07, AC-08 |
| **Hueco frente a la Spec 001 RF5** — la reducción de ≤640px solo estaba implementada para `.glass-hero` | RF-06 (R7) | AC-07, AC-06 |
| P6 — límites de capas y blobs sin prueba | RF-16 | AC-16 (declaración) |
| P8 — cinco pistas para cuatro controles | RF-10 | AC-11 |
| P7 — clase fantasma, importaciones sin uso, recuentos *(trasladado)* | **015** RF-01…RF-03 | 015 AC-01…AC-03 |
| Puntos (2)–(5) de la petición *(trasladados)* | **015** RF-04…RF-07 | 015 AC-04…AC-07 |

### 8.2 Los cinco puntos originales → dónde quedan

| Punto | Requisito | Criterio |
|---|---|---|
| (1) eliminar CSS muerto `.reveal*` | 013 RF-01, RF-02, RF-03 | 013 AC-01, AC-02, AC-03 |
| (2) avisos `initial`/`whileHover`/`whileTap` | 015 RF-04 (R1) | 015 AC-04 |
| (3) quitar envoltorio en `GridTarjetas` | 015 RF-05 (R2) | 015 AC-05 |
| (4) mover `PanelTarjetas` o documentar excepción | 015 RF-07 | 015 AC-07 |
| (5) renombrar/documentar `como` | 015 RF-06 (R3) | 015 AC-06 |
| Transversal a los cinco | 013 RF-15/RF-16/RF-17 + 015 RF-08/RF-09/RF-10 | 013 AC-16 + 015 AC-08 |
| **P1 (artefacto de build)** | **Fuera de alcance (R4)** | — (remisión a spec futura, §4.1) |

### 8.3 Correspondencia con la numeración previa (nada se pierde)

> Versión de referencia: el borrador revisado por el reviewer (RF-01…RF-24, AC-01…AC-23,
> CL-01…CL-14, DP-01…DP-24). **Los 24 RF, 23 AC, 14 CL y 24 DP están en esta tabla**: ninguna fila
> queda sin destino.

**Requisitos funcionales**

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| RF-01 | 013 RF-01 | RF-13 | 013 RF-13 |
| RF-02 | 013 RF-02 | RF-14 | 013 RF-14 |
| RF-03 | 013 RF-03 | RF-15 | **015 RF-01** |
| RF-04 | 013 RF-04 (ampliado: dos contextos) | RF-16 | **015 RF-02** |
| RF-05 | 013 RF-05 (contexto >640px explícito) | RF-17 | **015 RF-03** |
| RF-06 | 013 RF-06 (contexto ≤640px explícito) | RF-18 | **015 RF-04** (R1) |
| RF-07 | 013 RF-07 | RF-19 | **015 RF-05** (R2) |
| RF-08 | 013 RF-08 | RF-20 | **015 RF-06** (R3) |
| RF-09 | 013 RF-09 | RF-21 | **015 RF-07** |
| RF-10 | 013 RF-10 | RF-22 | 013 RF-15 **+** 015 RF-08 (repartido por ámbito) |
| RF-11 | 013 RF-11 | RF-23 | 013 RF-16 **+** 015 RF-09 (repartido) |
| RF-12 | 013 RF-12 | RF-24 | 013 RF-17 **+** 015 RF-10 (repartido) |

**Criterios de aceptación**

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| AC-01 | 013 AC-01 | AC-13 | 013 AC-14 |
| AC-02 | 013 AC-02 | AC-14 | 013 AC-15 |
| AC-03 | 013 AC-03 | AC-15 | **015 AC-01** |
| AC-04 | 013 AC-04 (ampliado: dos contextos) | AC-16 | **015 AC-02** |
| AC-05 | 013 AC-05 | AC-17 | **015 AC-03** |
| AC-06 | 013 AC-06 | AC-18 | **015 AC-04** |
| AC-07 | 013 AC-08 | AC-19 | **015 AC-05** |
| AC-08 | 013 AC-09 | AC-20 | **015 AC-06** |
| AC-09 | 013 AC-10 | AC-21 | **015 AC-07** |
| AC-10 | 013 AC-11 | AC-22 | 013 AC-16 **+** 015 AC-08 (repartido) |
| AC-11 | 013 AC-12 | AC-23 | 013 AC-07 (reescrito **agnóstico al mecanismo**) |
| AC-12 | 013 AC-13 | | |

**Casos límite**

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| CL-01 | 013 CL-01 | CL-08 | 013 CL-08 (con regla de composición) |
| CL-02 | 013 CL-02 | CL-09 | 013 CL-09 |
| CL-03 | 013 CL-03 (dos contextos) | CL-10 | 013 CL-10 **+** 015 CL-01 (espejo) |
| CL-04 | 013 CL-04 | CL-11 | 013 CL-11 |
| CL-05 | 013 CL-05 | CL-12 | 013 CL-12 **+** 015 CL-02 (espejo) |
| CL-06 | 013 CL-06 (dos contextos de blur) | CL-13 | 013 CL-13 (agnóstico al mecanismo) |
| CL-07 | 013 CL-07 | CL-14 | 013 CL-14 |

**Decisiones**

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| DP-01 | 013 DP-01 **+** 015 DP-01 (encuadre en cada spec) | DP-13 | 013 DP-09 (cerrada por R7 + M1) |
| DP-02 | 013 DP-02 | DP-14 | 013 DP-10 |
| DP-03 | 013 DP-03 | DP-15 | 013 DP-11 |
| DP-04 | 013 DP-04 | DP-16 | 013 DP-12 |
| DP-05 | 013 DP-05 | DP-17 | 013 DP-13 |
| DP-06 | 013 DP-06 | DP-18 | 013 DP-14 |
| DP-07 | 013 DP-07 | DP-19 | 013 DP-15 |
| DP-08 | **015 DP-02** (R1) | DP-20 | 013 DP-16 |
| DP-09 | **015 DP-03** (R2) | DP-21 | 013 DP-17 |
| DP-10 | **015 DP-04** | DP-22 | 013 DP-18 |
| DP-11 | **015 DP-05** (R3) | DP-23 | 013 DP-19 |
| DP-12 | 013 DP-08 (cerrada por R8) | DP-24 | 013 DP-20 |

**Nuevas decisiones de esta revisión:** 013 DP-21 (contextos de blur), DP-22 (matriz de
preferencias), DP-23 (protocolo de validación manual), DP-24 (fondos de prueba), DP-25 (≤640px
agnóstico al mecanismo), DP-26 (inventario de blur corregido); 015 DP-06…DP-09 (ver su §6.2).

---

## 9. Validaciones: protocolo manual, comandos y lo no automatizable

### 9-P. Protocolo de validación manual (M3, DP-23) — obligatorio para toda medición «en navegador»

1. **Navegador y versión:** cualquier navegador de motor **Chromium ≥ 120** o **Firefox ≥ 121**
   disponible en la máquina. Se **registra** nombre y versión exactos y la cadena de
   `navigator.userAgent`. Si se usa un motor distinto (WebKit/Safari), se declara igualmente.
2. **Tamaños de ventana (siempre estos cinco):** **1440×900** (ancho normal), **1024×768** (ancho
   normal intermedio), **640×900** (frontera exacta del contrato), **639×900** (un píxel por debajo)
   y **375×812** (móvil). Para cada medición se **declara** el ancho CSS real del viewport
   (`window.innerWidth`).
3. **Estado de la preferencia:** se activa de forma **explícita** con las herramientas del navegador
   (DevTools → *Rendering* → *Emulate CSS media feature*): `prefers-reduced-transparency: reduce` y
   `prefers-reduced-motion: reduce`. Se **verifica** que la emulación está activa con
   `matchMedia("(prefers-reduced-transparency: reduce)").matches` → `true` (y análogamente para
   movimiento). Se declara el estado de **cada** preferencia en **cada** medición.
4. **Valores a registrar** (siempre por elemento medido, con su selector o `data-*`):
   `getComputedStyle(el).backdropFilter`, `getComputedStyle(el).webkitBackdropFilter`,
   `getComputedStyle(el).borderRadius`, `getComputedStyle(el).paddingBottom`,
   `getComputedStyle(el).color` y `getComputedStyle(el).backgroundColor`; en contraste, además, el
   **ratio calculado** y el **fondo efectivo** supuesto (CL-08). Se adjunta **captura** de pantalla
   por celda.
5. **Registro del resultado:** una fila por celda medida, con **tamaño, preferencia, valor esperado,
   valor obtenido y veredicto** (`pasa` / `falla` / `no aplicable` / `pendiente`). Sin esa fila, la
   validación **no** se considera hecha.

### 9.1 Mediciones manuales (cada una se ejecuta con §9-P)

| ID | Qué se mide | Tamaños | Preferencia | Valor a registrar | AC |
|---|---|---|---|---|---|
| **M-1** | Revelado con movimiento reducido: las cinco secciones en su estado final | 1440×900 y 375×812 | `reduced-motion: reduce` | `opacity`, `transform`, `transitionDuration` de cada sección; ausencia de contenido oculto | AC-02 |
| **M-2** | Transparencia reducida: sin desenfoque en las seis superficies | 1440×900, 1024×768, 640×900, 639×900, 375×812 | `reduced-transparency: reduce` | `backdropFilter` (= `none`) y `backgroundColor` (fondo semisólido) por superficie | AC-04 |
| **M-3a** | Blur y saturación en ancho normal | 1440×900, 1024×768 | normal | `backdropFilter` de cada superficie (>640px: `blur(20–30px) saturate(160–200 %)`) | AC-05 |
| **M-3b** | Blur reducido en ≤640px, saturación intacta y control sin cambios | 640×900, 639×900, 375×812 | normal | `backdropFilter` de cada superficie (12–16px, **misma** saturación que en ancho normal) **y** del botón «?» de `PaginaInicio.jsx:55` (sin cambios) | AC-07 |
| **M-4** | Radios y esquinas anidadas | 1440×900 | normal | `borderRadius` por superficie y por esquina anidada; sin artefactos visibles en las esquinas de la tarjeta virtual | AC-08 |
| **M-5** | Reserva del área segura | 375×812 (con y sin *safe area* simulada) | normal | `paddingBottom` computado de la barra y `env(safe-area-inset-bottom)` resuelto | AC-10 |
| **M-6** | Contraste de la franja de métricas | 1440×900 | normal | `color` de la etiqueta, `backgroundColor` de la franja y **ratio calculado** | AC-14 |
| **M-7** | Contraste de la barra inferior contra los cuatro fondos de prueba | 1440×900 y 375×812 | normal | `color` de cada etiqueta, fondo efectivo compuesto por F1–F4 (CL-08) y **ratio calculado** (peor de los cuatro) | AC-15 |
| **M-8** | Capas de vidrio y blobs visibles | 1440×900, 375×812 (con menú y modal abiertos) | normal | número de superficies translúcidas superpuestas (≤3) y blobs visibles (≤2) | RF-16 |
| **M-9** | Fallback sin soporte de desenfoque *(opcional)* | el que se declare | normal | fondo semisólido aplicado y legibilidad del texto | CL-04 |

**Estado de ejecución (T9, 2026-10-18).** Ejecutadas y registradas: M-1, M-2, M-3a, M-3b, M-4, M-6,
M-7 y M-8. **No realizadas — declaradas pendientes, no verdes:** **M-5 con *safe area*** — el
navegador usado (Chromium por CDP) no expone `setSafeAreaInsets`, así que no se pudo simular un inset
positivo (sin notch, `padding-bottom` = 16px, respaldo `1rem`); **M-9** — no hay en la máquina un motor sin
soporte de `backdrop-filter` para forzar el fallback.

### 9.2 Bloques de comandos

> Ninguna validación se declara verde sin haberse ejecutado. La **línea base** (455/455 en 30
> archivos, aportada por el orquestador) **debe re-medirse** antes de tocar código; la comparación es
> **suite por suite**.

| Bloque | Alcance | Comando / método |
|---|---|---|
| **A — Landing y revelado** | Secciones de la landing, hook de revelado y hoja global | `npx vitest run src/components/domain/landing src/components/Hero.test.jsx src/hooks/useReveal.test.js src/styles/index.css.test.js` |
| **B — Superficies, blur y radios** | Hoja global y componentes con superficies de vidrio | `npx vitest run src/styles/index.css.test.js` + prueba de fuente por superficie según el inventario de §4.3 + **M-2, M-3a, M-3b, M-4** |
| **C — Barra inferior y área segura** | Barra inferior y sus superficies vecinas | `npx vitest run src/components/layout/BottomNav.test.jsx src/components/layout/SidebarResponsive.test.jsx` + **M-5** |
| **D — Tokens y literales del CSS** | Hoja global | `npx vitest run src/styles/index.css.test.js` + inspección del diff y barrido de consumidores |
| **E — Contraste** | Franja de métricas y barra inferior | **Cálculo** + **M-6, M-7**; **sin** prueba automática |
| **F — Cierre** | Todo el proyecto | `npm test` y `npm run build`, comparados **suite por suite** con la línea base re-medida |
| **Artefacto construido — FUERA DE ALCANCE (R4)** | CSS compilado (`dist/`) | **No se valida aquí.** El hallazgo P1 se documenta en §4.1 y se remite a una **spec futura de build/compatibilidad de prefijos**. El planner **no** verificó hoy el contenido del artefacto |

**Bloque trasladado a la Spec 015:** la ejecución **suite por suite** de las **siete** suites con
dobles de `framer-motion` (antes «bloque G») vive en la **015 §9**, porque es allí donde se corrigen
esos dobles (R1); esta spec **no** ejecuta ese bloque y **no** responde por la ausencia de avisos.

### 9.3 Ampliación de `index.css.test.js` y suites compartidas

- **`src/styles/index.css.test.js` se amplía, no se reescribe** (CL-13/DP-19). Asertos nuevos a
  añadir, **sin tocar los existentes** y **agnósticos al mecanismo** (DP-25): (a) **prevalencia** de
  `@media (prefers-reduced-transparency: reduce)` sobre `@media (max-width: 640px)` (H-1/R6), (b) el
  **efecto exigido** de la reducción a ≤640px en las superficies del conjunto (sin exigir que la
  regla viva en la hoja ni que se sobrescriba una utilidad compartida), (c) los **tres tokens
  retirados** ausentes y `--color-cat-savings` presente como reserva (R8/AC-13).
- **Suites de 011/012 (cerradas) que solo cambian de expectativa de estilo (CL-12/DP-19):**
  `DashboardUserModal.test.jsx:439, :443`, `DashboardDrawer.test.jsx:144, :151`,
  `SidebarResponsive.test.jsx:58, :63`, `BottomNav.test.jsx:52, :56, :62, :110, :120, :122`. **No** se
  tocan sus dobles de `framer-motion`, los stubs de `matchMedia`, la configuración de Vitest ni sus
  casos de foco (esto último es competencia de la 015).

**Validaciones declaradas NO automatizadas** (deben reportarse como medidas, no aplicables o
pendientes, con §9-P): (1) contraste real de la franja y de la barra contra los fondos de prueba
(M-6, M-7); (2) efecto real del movimiento reducido (M-1); (3) efecto real de la transparencia
reducida en **los dos contextos** (M-2); (4) **blur computado a ≤640px** en las seis superficies
(M-3b); (5) fallback sin soporte de desenfoque (M-9); (6) reserva real del área segura (M-5);
(7) aspecto tras el cambio de blur y radios y ausencia de artefactos en las esquinas anidadas (M-4);
(8) límites Fluid Glass —tres superficies y dos blobs— (M-8); (9) gráfico decorativo del control
activo (umbral de objeto gráfico), incluido el caso sin hover; (10) **«sin JS»**: no medible en
navegador (la SPA no pinta sin JS) ⇒ solo fuente (AC-03); (11) **contenido del CSS compilado**: fuera
de alcance (R4).

**Riesgos registrados:** (a) la reducción de blur a ≤640px cubre ahora **todas** las superficies del
conjunto (R7): el coste de repintado en móvil se revisa con M-3b y, si aparece, se registra como
hallazgo sin inventar un umbral nuevo (DP-09); (b) subir la opacidad de la barra para ganar contraste
**reduce** su condición de vidrio y acerca el recuento de superficies al límite de tres (M-8, §4.8);
(c) las suites **cerradas** de 011/012 comparten archivos con las aserciones de estilo que esta spec
actualiza (CL-12/DP-19); (d) mover el valor de contraste sin tocar el fondo puede exigir elegir entre
varios tokens válidos: la elección debe conservar el estado no cromático del activo; (e) el arreglo de
H-1 debe **reordenar o blindar** la cascada **sin cambiar valores** (DP-15); (f) el mecanismo elegido
para ≤640px (DP-25) debe **no** tocar el control excluido `PaginaInicio.jsx:55`.

---

## 10. Preguntas de alcance — **RESUELTAS** (2026-10-18)

| Pregunta | Respuesta del usuario | Efecto |
|---|---|---|
| **Q1 — ¿Dónde se corrigen los avisos de consola?** (a) dobles de las **siete** suites; (b) solo suites no tocadas por 011/012; (c) fuera | **(a)**, con orden explícito de **confirmar por `grep`** recuento y lista antes de fijar el alcance | **R1** ⇒ **015 RF-04/AC-04** (§4.2 de la 015 con el recuento y la lista verificados) |
| **Q2 — ¿Envoltorio de `GridTarjetas`?** (a) conservarlo y documentar el descarte; (b) retirarlo | **(a)** | **R2** ⇒ **015 RF-05/AC-05**, sin cambio de código |
| **Q3 — ¿Alcance de `como`?** (a) solo el `@param`; (b) renombrar; (c) fuera | **(a)** | **R3** ⇒ **015 RF-06/AC-06**; Spec 006 RF-03 y `Card.test.jsx` intactos |
| **Q4 — ¿Entra el artefacto de build (P1)?** (a) como paso de validación; (b) spec propia | **(b)** | **R4** ⇒ §4.1, DP-14; no genera RF/AC ni validación de `dist/` |
| **Q5 — Destino del archivo de la petición** | **Sin objeto:** el usuario lo eliminó | **R5** ⇒ la spec no referencia ningún archivo de petición |
| **Q6 — H-1 (transparencia reducida a ≤640px)** | **EN ALCANCE**, confirmado: reordenar/blindar la cascada **sin cambiar valores** | **R6** ⇒ RF-04, AC-04, CL-03/CL-07, DP-15 |
| **Q7 — Alcance del blur reducido a ≤640px** | Se **extiende a todas las superficies de vidrio con blur**; la Spec 001 **no se enmienda** | **R7** ⇒ RF-06, AC-06/AC-07, CL-06, DP-09 |
| **Q8 — Tokens sin consumidor** | Se retiran tres; `--color-cat-savings` queda como reserva documentada | **R8** ⇒ RF-12, AC-13, DP-08 |
| **Q9 — Reparto de la petición** | **Separar la higiene en otra spec** | **Reparto 013/015** (§8.3): visual/CSS aquí; higiene, dobles y documentación en la 015 |

**Estado:** `borrador` **por aprobación pendiente**, no por falta de información. Las **M1–M5** y los
**cuatro detalles** que el reviewer dejó abiertos están aplicados (§4.3 inventario y barrido
corregidos, §4.6 redacción de `--color-cat-savings`, §8.1 sin la fila duplicada de H-1, AC-07/CL-13
agnósticos al mecanismo). **Preguntas abiertas: ninguna**; la única anotación es la **nota no
bloqueante DP-20**.
