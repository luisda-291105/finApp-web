# Spec 013 — Calidad CSS y Fluid Glass: revelado de la landing, superficies de vidrio, área segura, tokens, contraste e higiene

**Estado: borrador**
**Fecha:** 2026-10-17
**Petición del usuario (stub literal `specs/013/spec-calidad.md`, cinco puntos):**
(1) «Eliminar CSS muerto (.reveal*) en `src/styles/index.css`»; (2) «Corregir warnings
`initial={false}`, `whileHover`, `whileTap` en `MiTarjetaVirtual.jsx` y `BottomNav.jsx`»;
(3) «Quitar wrapper innecesario en `GridTarjetas.jsx`»; (4) «Mover `PanelTarjetas.jsx` a
`src/components/domain/dashboard/` o documentar excepción»; (5) «Renombrar/documentar prop `como`
de `Card.jsx`».
**Decisión de encuadre (Fase 1, 2026-10-17):** esta spec se redacta como **spec de calidad CSS /
Fluid Glass** y sustituye a los cinco puntos **en su intención**, no literalmente: el
«CSS muerto» es **CSS huérfano** y su corrección real re-para el movimiento reducido (D-B); los
avisos de consola (2) no nacen en los componentes sino en los **stubs de prueba**; el envoltorio
(3) es **semántica** que no debe retirarse; (4) ya está cumplido y solo se verifica; (5) se limita
a **documentar** la prop. Se absorben además los defectos CSS medidos P1–P8 (§4).
**Basada en:** Spec 001 (contrato de `src/styles/index.css`: fallback `@supports`, transparencia y
movimiento reducidos, `hover: hover`, blur 12–16px en ≤640px, escalonado `--i`, puerta `.js` de
`index.html`, `:focus-visible`), Spec 005 (excepción documentada de `PanelTarjetas`), Spec 006
RF-03 (contrato de la prop `como` de `Card`), Spec 007 (declaró el área segura «resuelto»),
Spec 009 (RF-15: exenciones de limpieza y **deuda registrada** de `index.css`/`--header-height`;
contraste 3,58:1 de la navegación lateral), Spec 010 (§2.2: deuda de `SidebarNavContenido`).
**Coordinada con:** Spec 011 (**borrador**) y Spec 012 (**borrador**) — ambas tocan suites y
entorno de medición; esta spec **no** reimplementa ni reescribe esos trabajos y **no** cambia
stubs de `matchMedia` ni de `focus-trap-react`. Spec 014 (hexadecimales en JSX y el «Usuario» del
`Header` del dashboard salen de aquí).
**Re-verificación:** todas las referencias `archivo:línea` de §4 se comprobaron contra el estado
real del repositorio el **2026-10-17** (lectura directa de los archivos citados). El usuario sigue
editando a mano: **deben volver a re-verificarse** antes de escribir el plan y antes de implementar;
lo que ya no aplique se registrará como «ya no aplicable» (CL-10) y **no** se recreará.
**Nota de formato:** esta spec define **el QUÉ y el POR QUÉ**. Las referencias `archivo:línea` de
§4 son **evidencia del estado medido** (formato de las specs 010–012), no una propuesta de
solución; la elección de mecanismos, archivos y pruebas concretas corresponde al **plan**.
**Línea base:** aportada por el orquestador/reviewer — `npm test` **455/455 en 30 archivos** y
`npm run build` verde. **No re-medida por el planner**; debe re-medirse **antes de tocar código**.
**Alcance:** calidad de la hoja de estilos global y del acabado Fluid Glass, con correcciones
**acotadas**. No habilita rediseño, refactor de componentes, cambios de datos, de rutas ni de
contratos públicos.

---

## 1. Propósito

Ocho defectos medidos (P1–P8) y cinco peticiones del usuario giran alrededor de lo mismo: el
proyecto **declara** un sistema Fluid Glass pero varias de sus piezas **no lo cumplen ni lo
demuestran**. Se especifican juntas porque viven en el mismo sistema visual y se verifican con los
mismos comandos.

1. **El movimiento reducido no llega a la landing.** `index.css` define el bloque
   `@media (prefers-reduced-motion: reduce)` sobre `html.js .reveal`, `.reveal-left` y
   `.reveal-stagger > *`, pero **ninguna de las cinco secciones de la landing usa esas clases**:
   animan con utilidades en línea (`transition-all duration-700` + `opacity-0 translate-y-8`). El
   CSS no está «muerto»: está **huérfano**, y el efecto real es que la preferencia de movimiento
   reducido **no se respeta** en la vista pública. La petición «eliminar el CSS muerto» se corrige
   re-adoptando el contrato de la Spec 001 (D-B), que además restaura el respeto probado de la
   preferencia y la visibilidad sin JS.
2. **El ajuste de blur en pantallas pequeñas pisa la transparencia reducida.** El bloque
   `@media (max-width: 640px)` **vuelve a declarar** `backdrop-filter` **después** del bloque
   `@media (prefers-reduced-transparency: reduce)`: en ≤640px con transparencia reducida el blur
   reaparece (misma especificidad, gana el último de la hoja). El orden de prevalencia entre
   preferencias está invertido (P1).
3. **El área segura de la barra inferior no se aplica.** `BottomNav` usa `pb-safe`, pero el CSS
   global solo define `.safe-bottom` — **sin consumidores**: el `env(safe-area-inset-bottom)` no
   llega a ningún elemento y la barra puede solaparse con la zona de gestos. La prueba que lo
   «cubre» solo comprueba el **nombre de la clase** (P2).
4. **La barra inferior tiene cinco pistas para cuatro controles.** `grid-cols-5` deja una pista
   vacía: los cuatro controles no quedan equidistantes y el botón «Menú» no toca el borde. La
   prueba **aserta la clase equivocada** (P8).
5. **Hay literales de color que ya tienen token y tokens que ya no tienen consumidor.** El CSS
   global mantiene `rgba(...)` allí donde existe un token equivalente, y el `@theme` declara
   tokens que nadie usa (legado de una pasada anterior). La deuda de limpieza la registró la
   Spec 009 y **nadie la ha pagado** (P3).
6. **Hay texto por debajo de AA.** La etiqueta secundaria de la franja de métricas queda en
   3,98:1; las etiquetas de la barra inferior, en 3,16:1 sobre fondo oscuro y **mucho peor**
   sobre el fondo real del dashboard (crema); el indicador activo, en 3,58:1 (P4).
7. **El vidrio no está dentro de la guía y las pruebas lo asertan al revés.** Cinco superficies
   usan blur de **12px** (la guía pide 20–30px), los radios no siguen el rango 20–28px en una
   superficie y las esquinas anidadas de la tarjeta virtual no coinciden con su contenedor. Las
   suites **asertan las clases actuales** de blur, de modo que el defecto está «protegido» por
   prueba (P5).
8. **Higiene pendiente.** Una clase inválida (`my-`) que no genera ninguna regla, dos
   importaciones sin uso, y cabeceras que documentan un recuento de enlaces que ya no es el real
   (P7). A esto se suman los **avisos de consola** de siete suites, que nacen de los stubs de
   animación, no de los componentes (punto 2 de la petición).

**Qué NO es esta spec:** no es un rediseño visual, ni una migración de todos los hexadecimales
del proyecto (los de JSX son de la **Spec 014**), ni un refactor de componentes, ni un cambio de
contratos públicos (props, rutas, datos), ni una revisión de accesibilidad completa.

---

## 2. Alcance

### 2.1 Incluido

- **Revelado de la landing (punto 1 / D-B):** que las cinco secciones (Hero, StatsBar, Features,
  HowItWorks, CtaSection) queden **gobernadas por las reglas de revelado del CSS global**, de modo
  que el movimiento reducido y la ausencia de JS vuelvan a tener efecto observable, conservando
  los movimientos actuales de cada sección.
- **Superficies de vidrio:** prevalencia de la transparencia reducida sobre el ajuste de ≤640px;
  blur dentro de **20–30px** con saturación 160–200 %; radios de vidrio dentro de **20–28px**;
  criterio explícito para las **esquinas anidadas**; y declaración documentada de la superficie
  sólida que hoy se llama `glass-card`.
- **Área segura y barra inferior:** que la reserva del área segura inferior **se aplique de
  verdad** (no solo se nombre) y que la barra distribuya sus **cuatro** controles en cuatro
  columnas.
- **Tokens y literales del CSS global:** que los literales que ya tienen token equivalente se
  expresen con token (sin hexadecimales ni tokens nuevos) y que **todo** token sin consumidor
  tenga una decisión registrada (retirada o reserva motivada).
- **Contraste:** que la etiqueta secundaria de la franja de métricas y las etiquetas/indicadores
  de la barra inferior alcancen **AA** con los **tokens existentes**, incluido el **peor caso de
  fondo efectivo**.
- **Higiene:** retirada de la clase inválida y de las importaciones sin uso; corrección de los
  recuentos documentados; **desaparición de los avisos de consola** de las suites implicadas
  corrigiendo su origen (los stubs de prueba).
- **Puntos 3, 4 y 5 de la petición:** conservación documentada del envoltorio semántico, mera
  verificación de la excepción de `PanelTarjetas` y documentación de la prop `como`.
- Las **pruebas** de todo lo anterior y la **no-regresión** de las suites afectadas.

### 2.2 Fuera de alcance (explícito)

- **Rediseño visual y cambios de composición:** no se cambian jerarquías, textos, estructura ni
  aspecto más allá de lo que exigen los requisitos de esta spec (radios, blur, contraste y
  posición de la barra).
- **Hexadecimales en JSX/JS y migración general de literales de componente:** es la **Spec 014**.
  En particular, el gradiente del Hero y el texto «Usuario» del `Header` en modo dashboard
  (`Header.jsx:80`, 4,47:1) **no** se tocan aquí.
- **Aspecto y estructura de los modales** (`AuthModal`, `ModalTarjeta`, `DashboardUserModal`,
  `DashboardDrawer`) más allá del valor de blur de sus superficies ya incluidas: su cromo, su
  animación de salida y su comportamiento de cierre pertenecen a las specs 010/011 y **no se
  reabren**.
- **Entorno de medición de pruebas:** no se tocan `vitest.setup.js`, los stubs de `matchMedia` ni
  los de `focus-trap-react`, ni la configuración de Vitest (specs 011/012).
- **Renombrados de contrato público:** la clase `glass-card`, la prop `como`, las props de los
  componentes y los nombres de eventos **no** se renombran.
- **Cambios de datos, rutas, endpoints, autenticación y `TRIAL_ACTIVO`.**
- **Dependencias nuevas** (incluidas librerías de contraste, de CSS o de animación) y cambios de
  build.
- **Retirada del envoltorio `role="listitem"`** y **movimiento** de `PanelTarjetas.jsx`.
- **Reescritura o saneamiento de los documentos de las specs 001, 005, 006, 009, 010, 011, 012 y
  014:** solo se citan.
- **`src/components/Hero.test.jsx`**: se registra como observación (§4.10) —vive fuera de la
  carpeta de su componente— pero **no** entra en el alcance.
- **Los límites de capas de vidrio y de blobs** y el **contraste real medido en navegador**:
  se declaran como validaciones **no automatizadas** (§9), no como requisitos de prueba nueva.

### 2.3 Relación con los cinco puntos originales

| Punto original (literal) | Encuadre en esta spec |
|---|---|
| (1) «Eliminar CSS muerto (`.reveal*`) de `index.css`» | **Corregido en su intención (D-B):** el CSS **no se borra**; se **re-adopta** en las cinco secciones para que el movimiento reducido y la ausencia de JS vuelvan a aplicar. El bloque escalonado queda como contrato sin consumidor. |
| (2) «Corregir warnings `initial={false}`, `whileHover`, `whileTap` en `MiTarjetaVirtual.jsx` y `BottomNav.jsx`» | **Corregido en su origen:** los avisos provienen de los **stubs de animación de siete suites**, que reenvían props de movimiento a un `<div>`. `BottomNav` **no usa** la librería de animación; `initial={false}` del componente es API legítima y no se cambia. |
| (3) «Quitar wrapper innecesario en `GridTarjetas.jsx`» | **Corregido en su intención:** el envoltorio existe para sostener `role="listitem"` dentro de `role="list"`; quitarlo **degradaría** la semántica. Se **conserva y documenta**. |
| (4) «Mover `PanelTarjetas.jsx` a `…/domain/dashboard/` o documentar excepción» | **Ya cumplido:** la excepción está documentada (`PanelTarjetas.jsx:4` + Spec 005). Solo se **verifica**. |
| (5) «Renombrar/documentar prop `como` de `Card.jsx`» | **Se documenta** (falta el `@param` de `como`). **No se renombra**: la prop es contrato de la Spec 006 RF-03 y está asertada. |

---

## 3. Relación con specs anteriores

| Spec | Qué fija ahí que **condiciona** esta spec |
|---|---|
| **001** | El contrato de `src/styles/index.css` está **probado**: `index.css.test.js` aserta de forma **literal** `rgba(15, 17, 23, 0.92)` (`:19`) y `rgba(15, 17, 23, 0.88)` (`:125`), el blur 12–16px en ≤640px (`:63-69`), el escalonado `--i` (`:72-82`), la puerta `.js` (`:84-100`) y las reglas de `.bottom-nav-label` (`:144-157`). Esta spec **no** reescribe esas pruebas ni la 001; cuando cita un valor, es para **no romperlo**. |
| **005** | `PanelTarjetas` vive en `src/pages/` por **decisión del usuario** (excepción documentada). No se mueve. |
| **006 (RF-03)** | `Card` expone `como` (string o componente, por defecto `div`) y varias páginas lo consumen. Renombrar la prop rompería ese contrato. |
| **007** | Declaró el área segura «resuelto (`pb-safe`)». La evidencia de §4.3 muestra que **no se aplica**; esta spec lo corrige y deja el registro. |
| **009 (RF-15)** | Declaró **exenciones** (`index.css`, `--header-height`, `my-`, `Settings` sin uso, `text-white`, recuento «4 enlaces») y **deudas** («pasada de limpieza de `index.css`/`--header-height`», contraste 3,58:1 de la navegación lateral). Esta spec es la que puede **pagar** parte de esa deuda; se hace sin cambiar ningún contrato de la 009 (dos versiones de vista, corte 768px, cuatro props). |
| **010 (§2.2)** | Dejó **fuera de alcance** el aspecto de los modales, la migración de sus hexadecimales y la deuda de `SidebarNavContenido` (`my-`, `text-white`, `Settings` sin uso, nombre accesible de los enlaces colapsados). Esta spec toma **solo** la clase inválida y las importaciones sin uso; el **nombre accesible de los enlaces colapsados** sigue **fuera**. |
| **011 / 012 (borradores)** | Tocan foco y medición. Esta spec **no** toca stubs de `matchMedia`, `vitest.setup.js` ni las suites de foco; si algún ajuste de aserción por cambio de blur o de grilla coincide con ellas, se hará **solo** sobre la aserción de estilo y se registrará el solapamiento al planificar. |
| **014** | Es la dueña de los hexadecimales en JSX y del «Usuario» del `Header`; allí se remite el caso `Header.jsx:80`. |

---

## 4. Evidencia medida (re-verificada el 2026-10-17)

> Todo lo de este apartado es **diagnóstico**: describe lo que hay, no lo que se debe hacer.
> Lo **medido en navegador** o sobre el **artefacto construido** proviene del reviewer y se señala
> como tal; el planner **no** reprodujo esas mediciones. Los **contrastes** los recalculó el
> planner a partir de los valores de token y **coinciden** con los del reviewer.

### 4.1 P1 — Orden y duplicación de declaraciones de `backdrop-filter`

- `.glass-hero` declara el par de prefijos: `index.css:71-72` (`backdrop-filter` y
  `-webkit-backdrop-filter`, `blur(24px) saturate(180%)`), y el fallo del prefijo se compensa
  «por parejas» en `:98-100` (fallback), `:107-108` (transparencia reducida) y `:126-127`
  (≤640px).
- **Defecto verificado por lectura y por orden de la hoja:** el bloque
  `@media (prefers-reduced-transparency: reduce)` está en `:104-110` y el bloque
  `@media (max-width: 640px)` en `:124-129`. Ambos seleccionan `.glass-hero` (misma
  especificidad) y el segundo **re-declara** `backdrop-filter: blur(14px) saturate(180%)`: en
  ≤640px **con transparencia reducida, el blur vuelve a aplicarse** (el `backdrop-filter: none`
  de `:107` queda pisado). El fondo semisólido sí sobrevive (el bloque de ≤640px no lo toca).
- El **artefacto construido** `dist/assets/index-B0_ZOIQp.css` existe; su **contenido no fue
  verificado por el planner** (solo consta como medición del reviewer). Por eso la verificación
  del CSS **compilado** se exige como paso separado (§9) y su inclusión en esta spec es objeto de
  la **pregunta Q4**.

### 4.2 P5 — Blur, radios y esquinas anidadas

- **Blur de 12px (por debajo de la guía de 20–30px)** en cinco superficies translúcidas:
  `Header.jsx:36` (`bg-[#f7f6f2]/92 backdrop-blur-md`), `SidebarResponsive.jsx:29`
  (`bg-bg-dark/80 backdrop-blur-md`), `BottomNav.jsx:40` (`bg-bg-dark/80 backdrop-blur-md`),
  `DashboardUserModal.jsx:109` (`bg-bg-cream/95 backdrop-blur-md`),
  `DashboardDrawer.jsx:108` (`bg-bg-dark/95 backdrop-blur-md`).
- **Fuera del alcance de blur (no son superficies de vidrio):** los velos/overlays
  (`DashboardDrawer.jsx:138`, `DashboardUserModal.jsx:161`, `ModalTarjeta.jsx:106`:
  `backdrop-blur-sm`), la píldora de `MiTarjetaVirtual.jsx:216` y el botón de `Hero.jsx:68`
  (`backdrop-blur-xs`); y `AuthModal.jsx:141`, que ya usa `backdrop-blur-xl`.
- **`.glass-card` (`index.css:81-87`) es blanca y opaca** (`background: #ffffff` en `:82`), sin
  blur y sin highlight de borde superior: se llama «glass» pero es una **tarjeta sólida**. La
  consumen `Card` (diez usos), `MiTarjetaVirtual.jsx:115`, `ModalTarjeta.jsx:119` y
  `AcordeonTarjetas.jsx:47`.
- **Radios:** `--radius-glass: 24px` (`index.css:31`) están dentro del rango 20–28px, pero
  `AcordeonTarjetas.jsx:47` aplica `glass-card rounded-2xl` — el 16px de la utilidad **pisa** el
  radio de vidrio (está fuera de 20–28px). Quedan además cuatro esquinas anidadas a 16px dentro de
  contenedores de 24px: `Hero.jsx:81, :87, :93, :99`; `MiTarjetaVirtual.jsx:124, :164` (las caras
  de la tarjeta, con `overflow-hidden`, dentro de la superficie de `:115`); y
  `GridTarjetas.jsx:33` (envoltorio transparente, solo afecta al anillo de foco).

### 4.3 P2 — El área segura no se aplica

- El CSS global define **una sola** utilidad de área segura: `.safe-bottom` (`index.css:37-39`,
  `padding-bottom: env(safe-area-inset-bottom, 1rem)`) y **no tiene ningún consumidor**.
- `BottomNav.jsx:40` usa **`pb-safe`**, que **no está definido en ningún sitio del proyecto**
  (barrido de `safe` en `src/`: solo `.safe-bottom` en `index.css:37`, la mención en el comentario
  `BottomNav.jsx:29` y las aserciones de `BottomNav.test.jsx:86, :90`). Sin token ni utilidad que
  lo genere, la clase no produce ninguna regla.
- **La prueba es tautológica:** `BottomNav.test.jsx:86-90` comprueba
  `expect(nav).toHaveClass("pb-safe")`, es decir, que el componente lleva la clase que el
  componente escribe; no comprueba que la reserva exista.
- **No verificado por el planner:** el contenido del CSS compilado (si `pb-safe` no aparece en él,
  queda confirmado también en el artefacto). Se exige como paso de §9 y depende de **Q4**.

### 4.4 P8 — Cinco pistas para cuatro controles

- `BottomNav.jsx:40` declara `grid grid-cols-5` con **cuatro** controles (§ `items` de `:19-23` más
  el botón «Menú» de `:70-82`); la quinta pista queda vacía.
- `BottomNav.test.jsx:110-125` **aserta** `grid-cols-5` (`:120`) y `backdrop-blur-md` (`:122`): el
  defecto de grilla y el blur fuera de guía están **fijados por prueba**; ambas aserciones deberán
  cambiar con esta spec (solo la aserción, nunca el comportamiento para que la prueba pase).

### 4.5 P3 — Literales con token disponible y tokens sin consumidor

- **Literales en el CSS global con token equivalente:**
  `index.css:83` (`rgba(224, 221, 216, 0.8)` ↔ `--color-border-line: #e0ddd8`),
  `index.css:85` (`rgba(15, 17, 23, 0.04)` ↔ `--color-bg-dark: #0f1117`) y
  `index.css:92` (`rgba(26, 122, 94, 0.12)` ↔ `--color-emerald-primary: #1a7a5e`).
- **Excepciones que hay que dejar como están (hallazgo propio):** `rgba(15, 17, 23, 0.88)`
  (`index.css:99`) y `rgba(15, 17, 23, 0.92)` (`:106`) están **asertados literalmente** por
  `index.css.test.js:125` y `:19` (contrato de la 001 RF1/RF2): migrarlos a token **rompería** esa
  prueba. Y `#ffffff` (`:82`) **no tiene token equivalente** en `@theme` (el más claro es
  `--color-bg-cream: #f7f6f2`, que **no es** el mismo color).
- **Tokens sin consumidor** (barrido en `src/`): `--color-bg-dark-mid` (`:16`),
  `--color-bg-dark-end` (`:17`) y `--color-cat-savings` (`:28`) —los tres sin ninguna aparición
  fuera del `@theme`— y `--header-height` (`:33`), cuyo único rastro es una **aserción de
  ausencia** (`DashboardLayout.test.jsx:267`). Los tres primeros son legado de una pasada
  anterior: el gradiente real del Hero (`Hero.jsx:23`) usa otros valores
  (`#0f1117`/`#142820`/`#12362b`), así que los tokens no describen ese gradiente.

### 4.6 P4 — Contraste por debajo de AA

Valores medidos por el reviewer y **recalculados por el planner** (coinciden):

| Caso | Texto | Fondo asumido | Ratio | AA (texto normal) |
|---|---|---|---|---|
| `StatsBar.jsx:38` (etiqueta de métrica) | `text-white/80` | `#1a7a5e` (`StatsBar.jsx:26`) | **3,98:1** | No alcanza |
| `BottomNav.jsx:53` (etiqueta inactiva) | `text-slate-text` (`#5a6475`) | `#0f1117` | **3,16:1** | No alcanza |
| `BottomNav.jsx:52` (control activo) | `text-emerald-primary` (`#1a7a5e`) | `#0f1117` | **3,58:1** | No alcanza |
| `Header.jsx:80` («Usuario», modo dashboard) | `text-[#6b7280]` | `#f7f6f2` | **4,47:1** | No alcanza ⇒ **Spec 014** |

- **Hallazgo propio (peor caso, no medido en navegador):** la barra inferior es fija y translúcida
  (`BottomNav.jsx:40`, `bg-bg-dark/80`) sobre el contenido del dashboard, que es **crema**
  (`DashboardLayout.jsx:192`, `bg-bg-cream`). Compuesto el 80 % del token oscuro sobre crema, el
  fondo efectivo es ≈`#3d3f43` y la etiqueta inactiva cae a **≈1,8:1** y el activo a **≈2,0:1**.
  Además, `bg-bg-dark/80` **no es fondo absoluto**: el ratio depende del contenido que quede
  detrás. El valor exacto exige medición en navegador (validación no automatizada, §9).
- **Distinción necesaria:** las **etiquetas** son texto (umbral 4,5:1); la barra indicadora del
  activo (`BottomNav.jsx:61-66`) es un elemento **decorativo** (`aria-hidden`) y el estado ya se
  comunica con `aria-current="page"` (`:55`), así que su umbral es el de objeto gráfico (3:1) y no
  el de texto.

### 4.7 P6 — Capas de vidrio y blobs

- Blobs visibles: **1** (`Hero.jsx:30`, `blur-[120px]`), dentro del máximo de 2. No se añade
  ninguno.
- Superficies translúcidas superpuestas: el reviewer las contó **≤3** en los casos extremos
  (Spec 009, AC-19: menú móvil abierto y modal de cuenta abierto) sobre el **build de producción**.
  **Sin prueba automática dedicada** (así lo declara la guía del proyecto): se queda como
  validación **manual** y condiciona cualquier añadido de superficie.

### 4.8 P7 — Higiene

- `SidebarNavContenido.jsx:64` declara la clase **`my-`**, sintácticamente inválida: **no genera
  ninguna regla** (clase fantasma).
- **Importaciones sin uso:** `SidebarNavContenido.jsx:11` importa `Settings` (no se usa en el
  archivo) y **`BottomNav.jsx:15` importa `Settings` sin usarlo tampoco** (hallazgo propio, no
  citado en el informe del reviewer: `Settings` solo se consume en `DashboardUserModal.jsx:134`).
- **Recuentos documentados que no son el real:** `SidebarNavContenido.jsx` documenta «4 enlaces»
  (`:2`, `:18`, `:38`) y tiene **3**; `SidebarResponsive.jsx:4` documenta «enlaces fijos (4)» con 3
  en el código (y atribuye a esta capa el usuario y el cierre de sesión, que los renderiza el
  contenido compartido). La Spec 009 los **eximió** (RF-15); esta spec **sí** los corrige como
  higiene de documentación, sin tocar el conjunto de enlaces.

### 4.9 Puntos (2), (3), (4) y (5) de la petición

- **(2) Origen de los avisos de consola:** en siete suites el stub de animación reenvía **todas**
  las props al `<div>`, incluidas las de movimiento; React avisa por atributos no booleanos/como
  props desconocidas. Patrón confirmado en `MiTarjetaVirtual.test.jsx:16-25`
  (`motion: { div: ({ children, ...props }) => <div {...props}>…`), y con la misma forma en
  `AcordeonTarjetas.test.jsx:17-26`, `ModalTarjeta.test.jsx:20-33`, `PanelTarjetas.test.jsx:18-30`,
  `cierreDeModales.test.jsx:33-46`, `DashboardDrawer.test.jsx:21-32` y
  `DashboardUserModal.test.jsx:18-31`. **Los componentes no son la causa:**
  `MiTarjetaVirtual.jsx:219` usa `initial={false}`, que es API legítima de la librería (y
  `:119-120` usan `whileHover`/`whileTap` igualmente legítimos), y **`BottomNav` no usa ninguna
  librería de animación** (§ `BottomNav.jsx`, sin import de `motion`).
- **(3) El envoltorio de `GridTarjetas`:** `GridTarjetas.jsx:28` envuelve cada tarjeta con
  `role="listitem"` dentro del contenedor `role="list"` de `:24-25`. Es **semántica de lista**, no
  un `div` decorativo: retirarlo dejaría un `role="list"` sin elementos de lista.
- **(4) `PanelTarjetas`:** la excepción está documentada en `PanelTarjetas.jsx:4` (y registrada en
  la Spec 005). **Ya cumplido.**
- **(5) `Card`:** la cabecera declara las tres props en `@funciones`/`@datos` (`Card.jsx:1-8`)
  pero **no incluye ningún `@param`**, así que el contrato de `como` (tipo, valor por defecto
  `div`, efecto sobre la etiqueta renderizada) queda **sin documentar** en el punto donde la guía
  del proyecto lo pide; la firma está en `Card.jsx:9`. Renombrar `como` rompería la Spec 006
  RF-03 y las suites que la consumen.

### 4.10 Observaciones registradas (sin requisito derivado)

- `src/components/Hero.test.jsx:11` importa `./domain/landing/Hero`: la suite vive **fuera** de la
  carpeta de su componente. Funciona; es una inconsistencia de ubicación, **fuera de alcance**
  (moverla no está autorizado por esta spec).
- El artefacto de `dist/` es **instantánea** de una construcción anterior; cualquier afirmación
  sobre el CSS compilado exige **reconstruir y volver a medir**.
- El número de suites de prueba ha crecido con los trabajos en curso (011/012): la línea base debe
  re-medirse **inmediatamente antes** de tocar nada.

---

## 5. Requisitos Funcionales (EARS)

### A — Revelado de la landing y preferencias del usuario

- **RF-01 — Ubicuo — Revelado gobernado por el CSS global.** El contenido de las **cinco**
  secciones de la landing (Hero, StatsBar, Features, HowItWorks, CtaSection) **DEBE** quedar
  gobernado por las **reglas de revelado del CSS global** (`reveal`, `reveal-left` y su estado
  revelado), en lugar de por clases de utilidad en línea equivalentes, de modo que las reglas
  globales de movimiento reducido y de ausencia de JS vuelvan a aplicarse. **EL SISTEMA DEBE**
  conservar el **sentido de movimiento** que hoy tiene cada sección (desplazamiento vertical en
  Hero, StatsBar, Features y CtaSection; horizontal en HowItWorks) y **NO DEBE** cambiar el
  momento en que cada sección se revela.
- **RF-02 — Evento — Movimiento reducido respetado.** **CUANDO** `prefers-reduced-motion: reduce`
  esté activo, **EL SISTEMA DEBE** mostrar el contenido de esas secciones **sin transformación y sin
  transición** (opacidad final, sin desplazamiento, sin animación de entrada), y **NO DEBE** dejar
  contenido permanentemente oculto ni a medio revelar por haber desactivado el movimiento. **El
  comportamiento DEBE** ser observable sin leer código (estado computado en un navegador real).
- **RF-03 — Estado — Sin JS.** **CUANDO** la página no ejecute JavaScript (clase `js` ausente en el
  elemento raíz), **EL SISTEMA NO DEBE** ocultar ni desplazar el contenido de esas secciones: el
  ocultamiento previo al revelado **solo** puede depender de la marca de JS activo (contrato de la
  Spec 001).

### B — Superficies de vidrio

- **RF-04 — Estado — La transparencia reducida manda.** **CUANDO** `prefers-reduced-transparency:
  reduce` esté activo, **EL SISTEMA DEBE** desactivar el efecto de desenfoque de fondo de la
  superficie del hero **en cualquier ancho de ventana**, incluido ≤640px; **EL SISTEMA NO DEBE**
  reintroducir blur desde el ajuste de pantallas pequeñas. **El resultado DEBE** ser observable
  (efecto computado `none`) en un navegador real a ≤640px con la preferencia activa.
- **RF-05 — Ubicuo — Blur dentro de la guía.** Toda superficie translúcida **DEBE** usar desenfoque
  de fondo en el rango de **20–30px** con saturación de **160–200 %** (hoy cinco superficies usan
  12px). Los **velos/overlays** de los modales y los controles translúcidos **no** son superficies
  de vidrio y **NO DEBEN** cambiar por este requisito.
- **RF-06 — Estado — Pantallas pequeñas.** **CUANDO** el ancho sea ≤640px, la superficie del hero
  **DEBE** mantener el blur reducido del contrato vigente (**12–16px**, sin alterar la saturación),
  tal como está probado hoy; **EL SISTEMA NO DEBE** extender esa reducción al resto de superficies
  ni inventar otro umbral de ancho.
- **RF-07 — Ubicuo — Radios de las superficies de vidrio.** Las superficies de vidrio **DEBEN**
  presentar radios dentro de **20–28px** (hoy una superficie queda en 16px porque una utilidad pisa
  el radio de vidrio). **EL SISTEMA NO DEBE** aplicar ese rango a botones o controles que no son
  superficies de vidrio, y **DEBE** dejar explícito y coherente el criterio de las **esquinas
  anidadas** dentro de una superficie de vidrio (incluidas las dos caras de la tarjeta virtual, que
  hoy no coinciden con el radio de su contenedor y dejan ver el fondo del contenedor en las
  esquinas).
- **RF-08 — Ubicuo — La tarjeta sólida, documentada.** La superficie que hoy se llama `glass-card`
  **DEBE** quedar **declarada documentalmente como tarjeta sólida** (opaca, sin desenfoque de fondo
  y sin highlight de borde superior) con la razón de su forma y de su nombre, **sin** renombrar la
  clase, **sin** volverla translúcida y **sin** cambiar su aspecto. **EL SISTEMA NO DEBE** añadir
  superficies translúcidas nuevas ni hexadecimales ni tokens nuevos para lograrlo.

### C — Área segura y barra inferior

- **RF-09 — Ubicuo — La reserva del área segura se aplica.** La barra de navegación inferior
  **DEBE** reservar el área segura inferior con el mecanismo que el CSS global ya declara, de modo
  que el espacio se reserve **en la práctica** y no solo por el nombre de una clase. **La reserva
  DEBE** conservar un valor de respaldo cuando el entorno no reporte área segura.
- **RF-10 — Ubicuo — Cuatro controles, cuatro columnas.** La barra inferior **DEBE** distribuir
  sus **cuatro** controles en **cuatro** columnas equidistantes (hoy hay cinco pistas para cuatro
  controles). **EL SISTEMA NO DEBE** alterar el número de controles, su orden, sus etiquetas ni sus
  acciones.

### D — Tokens y literales del CSS global

- **RF-11 — Ubicuo — Literales con token disponible.** Los literales de color del CSS global que
  correspondan a **tokens existentes** **DEBEN** expresarse mediante esos tokens (hoy tres casos),
  conservando el **color computado** que tienen hoy. **EL SISTEMA NO DEBE** introducir hexadecimales
  nuevos, tokens nuevos ni alterar el aspecto; **las excepciones** (los dos literales de fondo
  oscuro que el contrato probado de la Spec 001 aserta de forma literal, y el blanco sin token
  equivalente) **DEBEN** quedar **documentadas con su motivo**.
- **RF-12 — Estado — Tokens sin consumidor.** **SI** un token del tema no tiene ningún consumidor,
  **EL SISTEMA DEBE** resolverlo de forma explícita: **retirarlo** o **declararlo reservado con
  motivo escrito**. **EL SISTEMA NO DEBE** dejar tokens sin decisión, ni retirar tokens que hagan
  parte de una paleta declarada del producto, ni añadir tokens nuevos.

### E — Contraste

- **RF-13 — Ubicuo — Contraste de la franja de métricas.** La etiqueta secundaria de la franja de
  métricas **DEBE** alcanzar el contraste **AA** de texto normal (4,5:1) sobre el fondo de su
  superficie, usando **exclusivamente** tokens ya existentes (hoy queda en 3,98:1). **EL SISTEMA NO
  DEBE** cambiar el color del fondo de la franja ni su contenido.
- **RF-14 — Ubicuo — Contraste de la barra inferior.** Las **etiquetas** de la barra inferior
  (estado activo e inactivo) **DEBEN** alcanzar AA de texto normal (4,5:1) sobre el **peor caso de
  fondo efectivo** —entendido como el compuesto de la barra translúcida sobre el contenido que
  queda detrás (hoy el contenido del dashboard es crema)— y el **indicador** del control activo
  **DEBE** alcanzar al menos el umbral de objeto gráfico (3:1). **EL SISTEMA DEBE** resolverlo con
  tokens existentes y **NO DEBE** apoyarse solo en el color para comunicar el estado (debe
  conservarse la información no cromática del estado activo). Medición requerida en navegador
  (§9): el valor exacto depende del contenido detrás.

### F — Higiene

- **RF-15 — Ubicuo — Sin clases fantasma.** **EL SISTEMA NO DEBE** declarar en los componentes
  clases que no generen ninguna regla (hoy una clase de margen malformada en la navegación
  lateral), ni sustituirlas por valores arbitrarios nuevos.
- **RF-16 — Ubicuo — Sin importaciones sin uso.** Los archivos del alcance **NO DEBEN** conservar
  importaciones que no se usan (hoy dos, ambas del mismo icono).
- **RF-17 — Ubicuo — Documentación fiel.** Las cabeceras del alcance **DEBEN** describir el
  **recuento real** de enlaces de la navegación compartida (hoy dicen cuatro y hay tres) y el uso
  real de lo que documentan. **EL SISTEMA NO DEBE** cambiar el conjunto de enlaces ni las rutas por
  este requisito.

### G — Puntos restantes de la petición

- **RF-18 — Estado — Avisos de consola de las suites.** **CUANDO** se ejecuten las suites del
  alcance **EL SISTEMA NO DEBE** emitir los avisos derivados de reenviar props de animación a
  elementos del DOM. La corrección **DEBE** hacerse en el **doble de prueba** (que deje de reenviar
  las props de movimiento, conservando lo que la suite mide) y **NO DEBE** cambiar el
  comportamiento ni las props legítimas de los componentes.
- **RF-19 — Ubicuo — El envoltorio semántico se conserva.** El contenedor con
  `role="listitem"` de la grilla de tarjetas **DEBE** conservarse (la lista mantiene sus elementos),
  y la retirada deberá documentarse como **descartada** con su motivo.
- **RF-20 — Ubicuo — La prop `como` documentada.** La prop `como` de `Card` **DEBE** quedar
  documentada en el JSDoc del componente (tipo, valor por defecto y efecto), **sin** renombrarla y
  **sin** cambiar su comportamiento ni sus valores admitidos.
- **RF-21 — Ubicuo — Excepción de `PanelTarjetas` verificada.** La excepción documentada de la
  ubicación de `PanelTarjetas` **DEBE** comprobarse (documentación presente, archivo sin mover y
  sin referencias rotas). **EL SISTEMA NO DEBE** mover ni duplicar el archivo.

### H — Transversal

- **RF-22 — Ubicuo — Pruebas y no-regresión.** Los cambios **DEBEN** llevar pruebas en el patrón
  vigente (Vitest y Testing Library, pruebas junto al código, configuración de rutas sin servidor)
  y **NO DEBEN** degradar ninguna suite existente. Las aserciones que hoy fijan un valor corregido
  por esta spec (blur de las superficies, grilla de la barra, clase de área segura) **DEBEN**
  actualizarse **solo** en su expectativa, nunca relajarse ni cambiarse para que una prueba pase.
  Las suites de la Spec 001 sobre el CSS global **DEBEN** seguir pasando **sin** que se reescriba
  su contrato.
- **RF-23 — Ubicuo — Validaciones no automatizables declaradas.** El sistema de calidad **DEBE**
  declarar como **no automatizadas** —y por tanto nunca afirmadas como «verdes» sin medición— las
  comprobaciones que el entorno de pruebas no puede evaluar: contraste real medido, efecto real de
  las preferencias de movimiento/transparencia, fallback sin soporte de desenfoque, reserva real
  del área segura, apariencia y **límites de capas de vidrio y de blobs**. Cada una **DEBE**
  reportarse como medida, no aplicable o pendiente.
- **RF-24 — Ubicuo — Alcance mínimo.** Los cambios **NO DEBEN** introducir dependencias, cambios de
  build, rutas, datos, endpoints, autenticación, `TRIAL_ACTIVO`, contratos públicos (props, clases
  consumidas por terceros, nombres de eventos) ni superficies de vidrio adicionales; **NO DEBEN**
  migrar hexadecimales de componentes ni tocar el aspecto declarado fuera de alcance.

---

## 6. Casos Límite y Decisiones

### 6.1 Casos límite

- **CL-01 — Sin JavaScript.** Sin la marca de JS activo, nada del contenido de la landing puede
  quedar oculto: el ocultamiento previo al revelado solo existe bajo esa marca. (No se introduce
  render en servidor.)
- **CL-02 — `prefers-reduced-motion: reduce`.** El contenido se pinta en su estado final sin
  transformación ni transición. **NO DEBE** quedar oculto ni desplazado si el revelado dependía del
  movimiento para completarse.
- **CL-03 — `prefers-reduced-transparency: reduce`.** Fondo semisólido y sin desenfoque, **también
  a ≤640px**: la preferencia por transparencia **prevalece** sobre el ajuste de ancho.
- **CL-04 — Entorno sin soporte de desenfoque.** El fallback de fondo semisólido sigue vigente y la
  legibilidad no depende del efecto: sin desenfoque, el texto debe seguir cumpliendo contraste.
- **CL-05 — Dispositivo táctil sin hover (`hover: none`).** Ninguna información puede depender
  únicamente del hover: los efectos de hover permanecen bajo la condición de que el dispositivo lo
  soporte, y el estado de la barra inferior sigue siendo perceptible sin hover.
- **CL-06 — ≤640px.** Blur reducido en la superficie del hero (12–16px), reserva del área segura,
  barra de cuatro columnas y contraste AA siguen aplicando con el ancho mínimo. La reducción de
  blur **no** se generaliza a las demás superficies (riesgo de rendimiento registrado en §9).
- **CL-07 — Combinación de preferencias en vista estrecha.** Con transparencia reducida **y** ancho
  ≤640px simultáneos, gana la transparencia reducida (sin desenfoque) y se conserva el fondo
  semisólido; el orden de prevalencia debe quedar **definido**, no accidental.
- **CL-08 — Contraste dependiente del fondo.** La barra inferior es translúcida y fija: su fondo
  efectivo es el compuesto con el contenido que quede detrás. El contraste exigido se mide contra
  el **peor caso** de ese compuesto y se declara el supuesto usado. Cuando el fondo efectivo no
  pueda garantizarse, la solución no puede depender de él.
- **CL-09 — Anchos fraccionarios o zoom alto.** Ninguna regla nueva puede introducir un umbral de
  ancho distinto del ya existente: no debe haber anchos con reglas contradictorias de blur o de
  distribución.
- **CL-10 — Código en movimiento.** El usuario edita a mano: si al implementar un defecto ya no
  existe (clase ya retirada, literal ya migrado, token ya usado), se registra como «ya no
  aplicable» y **no** se recrea ni se revierte la edición.
- **CL-11 — La prueba del contrato del CSS global.** Los asertos literales de la Spec 001 sobre
  valores del CSS no se relajan: si un requisito chocara con uno de ellos, el conflicto se eleva en
  lugar de resolverse cambiando la prueba.
- **CL-12 — Suites compartidas con las specs 011/012.** Si un mismo archivo de prueba necesita
  ajustes por esta spec y por las que están en curso, el ajuste se limita a la aserción de estilo
  de esta spec y el solapamiento se registra.

### 6.2 Decisiones

| ID | Decisión |
|---|---|
| **DP-01** | **Encuadre (D-A):** esta spec es de **calidad CSS / Fluid Glass** y sustituye los cinco puntos de la petición **en su intención**: no borra el CSS de revelado, no cambia componentes por los avisos de consola, no retira el envoltorio semántico, no mueve `PanelTarjetas` y no renombra `como`. |
| **DP-02** | **D-B (punto 1):** se **re-adoptan** las clases de revelado del CSS global en las cinco secciones de la landing. **No** se borra el bloque de revelado, **no** se enmienda la Spec 001 y **no** se toca `index.html`: se restaura el respeto a la preferencia de movimiento que la Spec 001 ya dejó probado. |
| **DP-03** | **Mapeo de movimientos:** desplazamiento vertical para Hero, StatsBar, Features y CtaSection; horizontal para HowItWorks (único que hoy se mueve en horizontal). El bloque **escalonado** queda **sin consumidor** y **se conserva**: es contrato sancionado por la Spec 001, no CSS muerto que borrar; si una sección lo necesitara, cada hijo debe declarar su índice (capacidad ya probada por la Spec 001). |
| **DP-04** | **Sin tokens nuevos para el contraste (ni en general):** los requisitos de contraste y de literales se resuelven con los tokens existentes; añadir un hexadecimal o un token está prohibido por el alcance. |
| **DP-05** | **`.glass-card` no se renombra ni se vuelve translúcida:** renombrar rompería el contrato de la Spec 006/001 y las aserciones de `Card`, `Features` y `MiTarjetaVirtual`; volverla translúcida subiría el recuento de superficies de vidrio (límite ya ajustado) y degradaría el contraste sobre fondo crema. Se **documenta** su naturaleza sólida. |
| **DP-06** | **Excepciones de literales del CSS, documentadas:** `#ffffff` (sin token equivalente: el más claro es crema, que **no** es el mismo color) y los dos fondos oscuros `rgba(15, 17, 23, 0.88)` y `0.92`, **asertados literalmente** por el contrato probado de la Spec 001. Migrarlos rompería esa suite ⇒ **no** se tocan. Los tres literales equivalentes a token (`:83`, `:85`, `:92`) **sí** se migran, conservando el color computado. |
| **DP-07** | **No se «arreglan» las pruebas del contrato:** si un requisito chocara con un aserto de la Spec 001, se eleva el conflicto; no se relaja la prueba (CL-11). |
| **DP-08** | **Punto 2 (avisos):** se corrigen en el **doble de prueba** de las siete suites; `initial={false}` del componente es API legítima y **no** se cambia; `BottomNav` **no** está implicado (no usa la librería de animación). Sujeto a **Q1**. |
| **DP-09** | **Punto 3 (envoltorio):** el contenedor con `role="listitem"` **se conserva**: es la semántica de la lista. Sujeto a **Q2**. |
| **DP-10** | **Punto 4:** la comprobación es **solo de verificación**; no se mueve ni se duplica `PanelTarjetas`. |
| **DP-11** | **Punto 5:** se añade la documentación que falta de `como` y **no** se renombra (Spec 006 RF-03). Sujeto a **Q3**. |
| **DP-12** | **Tokens sin consumidor (criterio uniforme):** se **retiran** los dos tokens de gradiente legados (que no describen el gradiente real del Hero) y el token de altura de cabecera (deuda de limpieza registrada por la Spec 009), previa re-verificación del barrido de consumidores; se **declara reservado con motivo** el token de categoría «ahorro», que forma parte de la paleta de categorías declarada del producto. Alternativa admitida: declarar reservado cualquier token para el que el plan documente un uso previsto. **Ningún** token puede quedar sin decisión. |
| **DP-13** | **Blur de la barra inferior en móvil (riesgo aceptado y registrado):** la reducción de blur a ≤640px se mantiene **solo** para la superficie del hero (contrato de la Spec 001); las superficies fijas conservan su blur a cualquier ancho. Si la revisión visual detecta coste perceptible en móvil, se registra como hallazgo y **no** se inventa un umbral nuevo (CL-09). |
| **DP-14** | **Contraste de la barra inferior:** se exige AA contra el **peor caso** de fondo efectivo y se conserva la información no cromática del estado activo; la solución no puede depender del color del contenido detrás (CL-08). Esta decisión es de esta spec y no reabre ningún aspecto de las specs 010/011: de las superficies modales solo se toca el valor de blur de sus superficies de vidrio (RF-05). |
| **DP-15** | **`Header.jsx:80` y los hexadecimales de componentes:** fuera de alcance (Spec 014). |
| **DP-16** | **Límites de capas y blobs, y contraste real:** no hay prueba automática dedicada (así lo declara la guía del proyecto). Se declaran validaciones **no automatizadas** y se reportan como medidas o pendientes; nunca como verdes. |
| **DP-17** | **Alcance de pruebas:** toda corrección de valor CSS que hoy esté fijada por una aserción (blur, grilla, clase de área segura) obliga a actualizar **esa** expectativa; no se añaden pruebas de valores que el entorno no puede computar (se compensa con prueba sobre la **fuente** y con medición en navegador). |
| **DP-18** | **Artefacto de build:** si **Q4** decide incluirlo, la verificación del CSS compilado entra como paso de validación (reconstruir, buscar las clases implicadas, confirmar su ausencia o su valor) y **no** como requisito de comportamiento nuevo. |

### 6.3 Puntos abiertos

Los cinco puntos abiertos de §10. **Ninguno** de ellos cambia los requisitos de intent: los cinco
son **de alcance** (qué entra, qué se corrige y dónde). Hasta que se respondan, esta spec queda
como **borrador** y el plan no debe cerrarse.

---

## 7. Pruebas de Aceptación (criterios verificables)

> «Estado observable» significa que el criterio se enuncia sobre lo que se puede **ver o medir**
> (DOM, clase aplicada, valor computado, texto de la hoja), no sobre la intención del autor.

| ID | Escenario | Estado observable esperado | Verificación |
|---|---|---|---|
| **AC-01** | RF-01 — revelado gobernado por el CSS global | Las cinco secciones aplican las clases de revelado del CSS global (y su estado revelado cuando el contenido ya es visible); ninguna conserva las utilidades en línea equivalentes | Prueba de componente (DOM) + lectura de las cinco fuentes; las pruebas de `index.css` que ya nombran esas clases siguen verdes |
| **AC-02** | RF-02 — movimiento reducido | Con la preferencia activa: opacidad final, sin transformación y sin transición en las cinco secciones, y **ningún** contenido oculto | Prueba de fuente (las reglas globales siguen apuntando a esas clases) + **medición en navegador** con la preferencia activada (efecto computado). La parte de efecto **no** es automatizable en el entorno de pruebas: se declara no automatizada |
| **AC-03** | RF-03 — sin JS | Sin la marca de JS: las reglas que ocultan el contenido no aplican y el contenido queda visible | Prueba de fuente sobre la hoja (la puerta de JS sigue siendo la única condición de ocultamiento) + navegador con JS desactivado |
| **AC-04** | RF-04 — transparencia reducida a ≤640px | Efecto de desenfoque de la superficie del hero = **ninguno** a ≤640px con la preferencia activa (hoy vuelve a aplicarse) | Prueba de fuente: el orden/alcance de los bloques garantiza la prevalencia; **medición en navegador** del efecto computado |
| **AC-05** | RF-05 — blur de las superficies | Las cinco superficies declaran blur en 20–30px con saturación 160–200 %; ninguna conserva el valor de 12px | Prueba de **fuente** (patrón ya usado por la suite del CSS: leer el origen y comprobar el valor de la clase/usos por superficie) + medición en navegador; las aserciones de estilo afectadas se actualizan (RF-22) |
| **AC-06** | RF-06 — blur reducido a ≤640px | La superficie del hero mantiene blur 12–16px sin alterar la saturación en ≤640px | Suite existente del CSS global **sin reescribir su contrato** |
| **AC-07** | RF-07 — radios | Toda superficie de vidrio tiene radio en 20–28px; las esquinas anidadas quedan documentadas con criterio; las caras de la tarjeta virtual coinciden con el radio de su contenedor | Prueba de fuente (valores de radio por superficie) + medición en navegador del radio computado |
| **AC-08** | RF-08 — tarjeta sólida documentada | Existe la declaración documental de su naturaleza sólida y su motivo; la clase **no** se renombra, **no** gana desenfoque y su aspecto no cambia | Inspección del comentario/JSDoc + `grep` de desenfoque en esa regla + suites de `Card`, `Features` y `MiTarjetaVirtual` verdes |
| **AC-09** | RF-09 — área segura aplicada | La clase que usa la barra inferior **existe** en el CSS global (y la utilidad declarada tiene consumidor): no queda ninguna de las dos huérfana | Prueba de fuente cruzando la hoja y el componente + **medición en navegador** del relleno inferior computado (no automatizable) |
| **AC-10** | RF-10 — cuatro columnas | La barra declara **cuatro** pistas para sus **cuatro** controles y la prueba lo aserta (hoy aserta cinco) | `BottomNav.test.jsx` actualizado en la expectativa + aserción de recuento de controles |
| **AC-11** | RF-11 — literales con token | Los tres literales con token equivalente ya no aparecen como literales; los tres casos exceptuados **siguen** con su valor literal y su motivo documentado; ningún hexadecimal nuevo | Suite del CSS global (aserción de ausencia/presencia) + inspección del diff |
| **AC-12** | RF-12 — tokens sin consumidor | Cada token del tema tiene consumidor **o** decisión registrada (retirado o reservado con motivo); ningún token queda sin decisión y no se añade ninguno | Inspección del diff + barrido de consumidores en el código; la decisión queda escrita |
| **AC-13** | RF-13 — contraste de la franja de métricas | El contraste calculado de la etiqueta secundaria sobre el fondo de su superficie es ≥4,5:1, con tokens existentes | **Cálculo** a partir de los valores de token + medición en navegador; **sin** prueba automática ⇒ se reporta como medida |
| **AC-14** | RF-14 — contraste de la barra inferior | Etiquetas (activa e inactiva) ≥4,5:1 y el indicador ≥3:1 sobre el **peor caso** de fondo efectivo compuesto con el contenido detrás; el estado activo conserva información no cromática | **Cálculo** del peor caso + **medición en navegador** sobre el dashboard (varios anchos y con contenido detrás); **sin** prueba automática |
| **AC-15** | RF-15 — clases fantasma | La clase malformada ya no aparece en el componente y no se introdujo ningún valor arbitrario en su lugar | `grep` + prueba de fuente (clases presentes) |
| **AC-16** | RF-16 — importaciones sin uso | Las dos importaciones sin uso ya no están; ninguna importación nueva queda sin uso | `grep` del icono y lectura de las cabeceras; sin herramienta de lint en el proyecto, la comprobación es de inspección |
| **AC-17** | RF-17 — documentación fiel | Las cabeceras del alcance ya no afirman un recuento de enlaces distinto del real; el conjunto de enlaces y las rutas no cambian | `grep` del recuento en las cabeceras + suites de navegación lateral verdes |
| **AC-18** | RF-18 — avisos de consola | Las siete suites del alcance se ejecutan **sin** los avisos por props de animación reenviadas al DOM, y **sin** cambios en el comportamiento de los componentes | Ejecución de las siete suites; el recuento de casos **no** baja (solo cambia el doble); inspección del diff de los componentes (debe ser vacío) |
| **AC-19** | RF-19 — envoltorio semántico | La grilla mantiene su lista y sus elementos (`role="list"` con `role="listitem"` por tarjeta) | Suite de la grilla + aserción de roles |
| **AC-20** | RF-20 — prop `como` documentada | El JSDoc declara `como` (tipo, valor por defecto, efecto); la prop **no** se renombra y su comportamiento no cambia | Inspección del JSDoc + suite de `Card` verde + `grep` del nombre de la prop |
| **AC-21** | RF-21 — excepción de `PanelTarjetas` | La excepción está documentada en el archivo y el archivo sigue en su sitio, sin referencias rotas | Inspección + suite de la página verde |
| **AC-22** | RF-22/RF-23/RF-24 — cierre | Sin fallos **nuevos** frente a la **línea base re-medida antes de tocar código**, **suite por suite**; sin dependencias, sin cambios de datos/rutas/contratos, sin hexadecimales nuevos, sin superficies ni blobs nuevos; y con la lista de validaciones no realizadas declarada explícitamente | `npm test` + `npm run build` (tarea final del plan) + inspección del diff + declaración de validaciones no realizadas (§9) |

> **Honestidad de la validación.** AC-13, AC-14, AC-09 (efecto real), AC-02 (efecto real),
> AC-04 (efecto computado), AC-05/AC-07 (aspecto medido) y los **límites de capas y blobs** **no**
> tienen prueba automática en este proyecto: se calculan o se miden en navegador y se reportan como
> **medidas**, **no aplicables** o **pendientes**, nunca como «verdes». AC-22 compara **contra la
> línea base medida inmediatamente antes** del cambio; sin esa medición no puede declararse nada.

---

## 8. Trazabilidad

### 8.1 P1–P8 → requisitos

| Defecto medido | Requisito | Criterio |
|---|---|---|
| P1 — orden/duplicación de `backdrop-filter`; ≤640px pisa la transparencia reducida | RF-04 | AC-04 |
| P2 — área segura no aplicada; prueba tautológica | RF-09 | AC-09 |
| P3 — literales con token disponible; tokens sin consumidor | RF-11, RF-12 | AC-11, AC-12 |
| P4 — contraste bajo AA (franja, barra, `Header`) | RF-13, RF-14 (y remisión a la Spec 014) | AC-13, AC-14 |
| P5 — blur de 12px, radios y esquinas anidadas; aserciones que fijan el defecto | RF-05, RF-06, RF-07, RF-08 | AC-05, AC-06, AC-07, AC-08 |
| P6 — límites de capas y blobs sin prueba | RF-23 | AC-22 (declaración) |
| P7 — clase fantasma, importaciones sin uso, recuentos | RF-15, RF-16, RF-17 | AC-15, AC-16, AC-17 |
| P8 — cinco pistas para cuatro controles | RF-10 | AC-10 |

### 8.2 Los cinco puntos originales → requisitos

| Punto | Requisito | Criterio |
|---|---|---|
| (1) eliminar CSS muerto `.reveal*` | RF-01, RF-02, RF-03 | AC-01, AC-02, AC-03 |
| (2) avisos `initial`/`whileHover`/`whileTap` | RF-18 | AC-18 |
| (3) quitar envoltorio en `GridTarjetas` | RF-19 | AC-19 |
| (4) mover `PanelTarjetas` o documentar excepción | RF-21 | AC-21 |
| (5) renombrar/documentar `como` | RF-20 | AC-20 |
| Transversal a los cinco | RF-22, RF-23, RF-24 | AC-22 |

---

## 9. Validaciones y comandos

> Ninguna validación se declara verde sin haberse ejecutado. La **línea base** (455/455 en 30
> archivos, aportada por el orquestador) **debe re-medirse** antes de tocar código; la comparación
> es **suite por suite**.

| Bloque | Alcance | Comando / método |
|---|---|---|
| **A — Landing y revelado** | Secciones de la landing, hook de revelado y hoja global | `npx vitest run src/components/domain/landing src/components/Hero.test.jsx src/hooks/useReveal.test.js src/styles/index.css.test.js` |
| **B — Superficies y radios** | Hoja global y componentes con superficies de vidrio | `npx vitest run src/styles/index.css.test.js` + pruebas de fuente de los componentes + **navegador** (efecto computado de desenfoque, radio y saturación) |
| **C — Barra inferior y área segura** | Barra inferior y sus superficies vecinas | `npx vitest run src/components/layout/BottomNav.test.jsx src/components/layout/SidebarResponsive.test.jsx` + **navegador** (relleno inferior computado) |
| **D — Tokens y literales del CSS** | Hoja global | `npx vitest run src/styles/index.css.test.js` + inspección del diff y barrido de consumidores |
| **E — Contraste** | Franja de métricas, barra inferior y navegación lateral (solo observación) | **Cálculo** + **navegador** (`getComputedStyle` + fondo compuesto detrás); **sin** prueba automática |
| **F — Higiene y documentación** | Navegación lateral, barra inferior y `Card` | `npx vitest run src/components/layout src/components/ui src/layout` + `grep` |
| **G — Suites con stubs de animación** | Las siete suites del punto 2 y los componentes implicados | `npx vitest run src/components/domain/dashboard src/components/domain/modales src/components/ModalTarjeta.test.jsx src/pages/PanelTarjetas.test.jsx src/components/layout/cierreDeModales.test.jsx` |
| **H — Cierre** | Todo el proyecto | `npm test` y `npm run build`, comparados **suite por suite** con la línea base re-medida |
| **Artefacto construido (según Q4)** | CSS compilado | Reconstruir y buscar en el CSS resultante las clases implicadas (área segura y blur), confirmando su presencia/valor; **no** verificado por el planner hoy |

**Validaciones declaradas NO automatizadas** (deben reportarse como medidas, no aplicables o
pendientes):

1. **Contraste real** (franja, barra inferior y estado activo) contra el **fondo efectivo**
   compuesto con el contenido detrás (AC-13, AC-14).
2. **Efecto real de `prefers-reduced-motion`** en las cinco secciones (AC-02).
3. **Efecto real de `prefers-reduced-transparency`**, también a ≤640px (AC-04).
4. **Fallback sin soporte de desenfoque** (legibilidad sin efecto).
5. **Reserva real del área segura** (`env()` no se resuelve en el entorno de pruebas) (AC-09).
6. **Aspecto** de las superficies tras el cambio de blur y de radios, y ausencia de artefactos en
   las esquinas anidadas (AC-05, AC-07).
7. **Límites Fluid Glass**: máximo tres superficies translúcidas superpuestas y dos blobs visibles
   por vista (la guía del proyecto declara que **no** hay prueba automática) (RF-23).
8. **Gráfico decorativo del control activo** de la barra inferior (umbral de objeto gráfico),
   incluido el caso sin hover (CL-05).
9. **Contenido del CSS compilado** mientras **Q4** no lo incorpore como paso formal.

**Riesgos registrados:** (a) subir el blur de las superficies fijas puede tener coste perceptible
en móvil y no existe un umbral nuevo autorizado (DP-13); (b) el contraste de la barra inferior
depende del contenido detrás (CL-08): la solución no puede depender de él; (c) las suites de
foco de las specs 011/012 comparten archivos con las aserciones de estilo que esta spec actualiza
(CL-12); (d) mover valor de contraste sin tocar el fondo puede exigir elegir entre varios tokens
válidos: la elección debe conservar el estado no cromático del activo.

---

## 10. Preguntas al usuario (5, priorizadas)

Todas son **de alcance**. Con la respuesta se cierra el borrador; sin ella, el plan no debe
cerrarse.

1. **Q1 — Punto 2: ¿dónde se corrigen los avisos de consola?**
   (a) **Recomendado:** en el **doble de prueba** de las **siete** suites, para que dejen de
   reenviar las props de animación al DOM, **sin** tocar los componentes.
   (b) Solo en las suites que **no** están siendo tocadas por las specs 011/012.
   (c) Dejarlo **fuera** de la 013.
   *Impacto:* siete suites y su recuento de casos; tocar (b) evita solapamiento con 011/012.

2. **Q2 — Punto 3: ¿qué hacemos con el envoltorio de `GridTarjetas`?**
   (a) **Recomendado:** **conservarlo** y documentar que su retirada se descarta (es la semántica de
   la lista).
   (b) Retirarlo aceptando el cambio de semántica (la lista perdería sus elementos).
   *Impacto:* accesibilidad de la grilla y aserciones de roles.

3. **Q3 — Punto 5: ¿alcance de la prop `como`?**
   (a) **Recomendado:** añadir **solo** el `@param` que falta (documentación).
   (b) **Renombrarla** a un nombre en español (rompe el contrato de la Spec 006 RF-03 y las
   aserciones actuales).
   (c) Dejarlo **fuera** de la 013.
   *Impacto:* contrato público de `Card` y sus consumidores.

4. **Q4 — ¿Entra el artefacto de build (P1) en la 013?**
   (a) **Recomendado:** **sí**, como **paso de validación** de cierre (reconstruir y comprobar en el
   CSS resultante la clase de área segura y los valores de blur), sin convertirlo en requisito de
   comportamiento nuevo.
   (b) **No**: separarlo en una spec propia de build.
   *Impacto:* alcance de la validación de cierre y de los comandos de §9.

5. **Q5 — ¿Qué hacemos con el archivo de la petición `specs/013/spec-calidad.md`?**
   (a) **Recomendado:** **dejarlo tal cual**, como petición original (esta spec nace en
   `specs/013-calidad-css/spec.md` y lo cita).
   (b) Añadirle una **nota** de «superado por esta spec».
   (c) **Eliminarlo**.
   *Impacto:* trazabilidad de la petición; no afecta al código.
