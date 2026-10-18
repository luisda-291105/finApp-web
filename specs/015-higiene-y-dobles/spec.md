# Spec 015 — Higiene de código, dobles de prueba y documentación

**Estado: borrador** (aprobación del usuario pendiente) · **listo para aprobación**
**Fecha:** 2026-10-18 · **Última revisión:** 2026-10-18 (spec nueva, nacida del reparto de la 013)
**Origen:** la revisión del borrador de la **Spec 013** partió su alcance en dos por decisión del
usuario (2026-10-18). Esta spec recoge **todo lo que no es visual/CSS**: higiene de código, **dobles
de prueba** de animación y **documentación** de cabeceras. Su hermana —`specs/013-calidad-css/spec.md`—
conserva superficies de vidrio, preferencias, radios, área segura, barra inferior, tokens, literales
y contraste. Tabla de correspondencia completa: **§8.3** (y la equivalente en 013 §8.3). **Nada del
borrador anterior se pierde.**
**Petición del usuario (puntos que aterrizan aquí, citados literalmente del encargo original):**
(2) «Corregir warnings `initial={false}`, `whileHover`, `whileTap` en `MiTarjetaVirtual.jsx` y
`BottomNav.jsx`»; (3) «Quitar wrapper innecesario en `GridTarjetas.jsx`»; (4) «Mover
`PanelTarjetas.jsx` a `src/components/domain/dashboard/` o documentar excepción»;
(5) «Renombrar/documentar prop `como` de `Card.jsx`»; más el punto 8 del diagnóstico (P7: **higiene
pendiente**), que en la Spec 013 era el punto 8 de su §1.
*(Los puntos (1) «Eliminar CSS muerto (`.reveal*`)…» y el resto de lo visual/CSS quedan en la 013.)*

**Resoluciones del usuario (2026-10-18) que se aplican en esta spec:**
- **R1 (punto 2) = (a):** los avisos de consola se corrigen en los **dobles de prueba** de las
  **siete** suites verificadas por recuento y lista (§4.2); los **componentes no se tocan**.
- **R2 (punto 3) = (a):** se **conserva** el envoltorio `role="listitem"` y la spec **documenta el
  descarte** de retirarlo. Punto cerrado **sin cambio de código**.
- **R3 (punto 5) = (a):** se añade **solo** el `@param` que falta de la prop `como`. **No** se
  renombra.
- **Reparto (Q9) = separar la higiene en otra spec:** esta.
- **Las resoluciones R4 (P1 fuera de alcance), R5 (archivo de la petición inexistente), R6 (H-1), R7
  (blur a ≤640px) y R8 (tokens)** se aplican en la **Spec 013**; aquí solo se referencian.

**Basada en / coordinada con:**
- **Spec 009 (RF-15):** declaró las **exenciones** que esta spec **sí revierte** —la clase inválida
  `my-`, el import `Settings` sin uso y los recuentos documentados—, con la justificación de que son
  defectos medidos de higiene dominables **sin** cambiar el comportamiento ni el contrato de la 009
  (dos versiones de vista, corte 768px, cuatro props). Lo que **no** se reabre de la 009 es la
  exención de `text-white`.
- **Spec 010 (§2.2):** dejó **fuera de alcance** el aspecto de los modales, la migración de sus
  hexadecimales y la deuda de `SidebarNavContenido`. Esta spec toma **solo** la clase inválida y las
  importaciones sin uso; el **nombre accesible de los enlaces colapsados** sigue **fuera**.
- **Spec 005:** `PanelTarjetas` vive en `src/pages/` por decisión del usuario (excepción documentada).
  Aquí solo se **verifica**.
- **Spec 006 (RF-03):** `Card` expone `como` (string o componente, por defecto `div`). Renombrar la
  prop rompería ese contrato.
- **Specs 011 (cerrada, `944542c`) y 012 (cerrada, `8aa9f0f`):** tocaron foco y entorno de medición.
  Esta spec **no** reimplementa esos trabajos, **no** invalida sus líneas base y **no** toca
  `vitest.setup.js`, los stubs de `matchMedia` ni los de `focus-trap-react` (CL-02, DP-08).
- **Spec 013 (hermana):** dueña de las **expectativas de estilo** de las suites compartidas; el
  reparto está en §8.3 y no se solapan (DP-06).
- **Spec 014:** dueña de los hexadecimales en JSX y del «Usuario» del `Header`.

**Re-verificación:** las referencias `archivo:línea` de §4 se comprobaron el **2026-10-17** y el
**2026-10-18**. El usuario sigue editando a mano: **deben volver a re-verificarse** antes del plan y
antes de implementar; lo que ya no aplique se registra como «ya no aplicable» (CL-01) y **no** se
recrea.
**Nota de formato:** esta spec define **el QUÉ y el POR QUÉ**. Las referencias `archivo:línea` de §4
son **evidencia del estado medido**, no una propuesta de solución; mecanismos, archivos y pruebas
concretas son del **plan**.
**Línea base:** aportada por el orquestador/reviewer — `npm test` **455/455 en 30 archivos** y
`npm run build` verde. **No re-medida por el planner**; debe re-medirse **antes de tocar código**.

---

## 1. Propósito

Cuatro defectos de **higiene** y las cuatro peticiones de la parte no visual de la petición original:

1. **Una clase fantasma.** `SidebarNavContenido.jsx:64` declara la clase **`my-`**, sintácticamente
   inválida: **no genera ninguna regla** (RF-01).
2. **Dos importaciones sin uso.** `SidebarNavContenido.jsx:11` y `BottomNav.jsx:15` importan
   `Settings` (icono que solo se consume en `DashboardUserModal.jsx:134`) sin usarlo (RF-02).
3. **Cabeceras que documentan un recuento que ya no es el real.** `SidebarNavContenido.jsx` documenta
   «4 enlaces» y tiene **3**; `SidebarResponsive.jsx:4` documenta «enlaces fijos (4)» con 3 en el
   código (RF-03).
4. **Avisos de consola en siete suites.** Los **dobles de prueba** de `framer-motion` reenvían al
   `<div>` todas las props que reciben, incluidas las de movimiento, y React avisa (RF-04). Nacen en
   los **dobles**, no en los componentes: `BottomNav` **no usa** ninguna librería de animación y el
   `initial={false}`/`whileHover`/`whileTap` de los componentes es API legítima.
5. **Un envoltorio semántico que no debe retirarse.** `GridTarjetas.jsx:28` envuelve cada tarjeta con
   `role="listitem"` dentro del contenedor `role="list"` de `:24-25`: quitarlo dejaría una lista sin
   elementos de lista (RF-05, R2).
6. **Una prop sin documentar en su punto de uso habitual.** La prop `como` de `Card` aparece en la
   cabecera del archivo pero **no** como `@param`, donde la guía del proyecto lo pide (RF-06, R3).
7. **Una excepción que solo hay que verificar.** La ubicación de `PanelTarjetas.jsx` está documentada
   en el propio archivo (`:3-4`) y registrada por la Spec 005 (RF-07).

**Qué NO es esta spec:** no es un refactor, ni una pasada de lint, ni un cambio de contratos públicos,
ni una limpieza visual (blur, radios, contraste, tokens y literales del CSS son de la **013**), ni un
retoque de la lógica de los componentes o de sus pruebas más allá del **doble de prueba** y sus
expectativas mínimas.

---

## 2. Alcance

### 2.1 Incluido

- **Retirada de la clase fantasma** `my-` en `SidebarNavContenido.jsx:64`, sin sustituirla por ningún
  valor arbitrario nuevo (el espaciado que ya aporta el contexto del componente se conserva).
- **Retirada de las dos importaciones sin uso** de `Settings` (`SidebarNavContenido.jsx:11`,
  `BottomNav.jsx:15`), sin tocar el resto del bloque de importaciones ni el icono donde **sí** se usa
  (`DashboardUserModal.jsx:134`).
- **Corrección de los recuentos documentados** de enlaces en `SidebarNavContenido.jsx` (`:2`, `:4`,
  `:18`, `:38`) y en `SidebarResponsive.jsx:4`, sin cambiar el conjunto de enlaces ni las rutas.
- **Corrección de los siete dobles de prueba** de `framer-motion` para que dejen de reenviar al DOM
  las props de movimiento, **conservando** lo que cada suite mide (§4.2 y RF-04).
- **Conservación documentada** del envoltorio semántico de `GridTarjetas` (R2), sin cambio de código.
- **Documentación del `@param` de `como`** en `Card` (R3), sin renombrarla ni cambiar su
  comportamiento.
- **Verificación** de la excepción documentada de `PanelTarjetas` (sin mover ni duplicar el archivo).
- Las **pruebas** de lo anterior y la **no-regresión** de las suites afectadas (RF-08).

### 2.2 Fuera de alcance (explícito)

- **Todo lo visual/CSS:** revelado de la landing y preferencias, superficies de vidrio (blur,
  saturación, radios), área segura y columnas de la barra inferior, tokens y literales del CSS global
  y contraste ⇒ **Spec 013** (§8.3). Esta spec **no** modifica hojas de estilo ni
  clases de presentación más allá de retirar la clase inválida.
- **Comportamiento y props de los componentes animados:** `initial={false}`, `whileHover`,
  `whileTap`, `variants`, `layoutId` y las transiciones **se mantienen**: son API legítima. El diff de
  los componentes **debe ser vacío** (salvo la retirada de la clase fantasma y de los imports sin uso
  que fija esta spec).
- **Entorno de medición:** no se tocan `vitest.setup.js`, los stubs de `matchMedia`, los de
  `focus-trap-react`, la configuración de Vitest ni los **casos de foco** de las specs 011/012
  (cerradas); tampoco sus **líneas base**.
- **Retirada del envoltorio `role="listitem"`** y **movimiento** de `PanelTarjetas.jsx`.
- **Renombrado de la prop `como`** y de cualquier otro contrato público (props, clases consumidas,
  nombres de eventos).
- **Nombre accesible de los enlaces colapsados** de la navegación lateral (lo dejó fuera la Spec 010
  §2.2; sigue fuera).
- **Pasada general de lint o de formato:** no se añaden herramientas ni dependencias; no se reformatea
  lo que no se toca.
- **Cambios de datos, rutas, endpoints, autenticación, `TRIAL_ACTIVO`, build o dependencias.**
- **Hexadecimales en JSX/JS:** Spec 014.
- **El defecto del artefacto de build (P1, R4)** y la compatibilidad de prefijos del CSS compilado:
  documentado y remitido en la Spec 013 §4.1; aquí **no** se aborda.
- **Reescritura o saneamiento** de los documentos de las specs 001, 005, 006, 007, 009, 010, 011, 012,
  013 y 014: solo se citan.

### 2.3 Relación con los puntos de la petición que aterrizan aquí

| Punto | Encuadre |
|---|---|
| (2) «Corregir warnings `initial={false}`, `whileHover`, `whileTap` en `MiTarjetaVirtual.jsx` y `BottomNav.jsx`» | **Corregido en su origen:** los avisos provienen de los **dobles de prueba** de **siete** suites (§4.2), que reenvían props de movimiento a un `<div>`. `BottomNav` **no usa** la librería de animación; `initial={false}` es API legítima y no se cambia. **Cerrado (R1): se corrigen los dobles.** |
| (3) «Quitar wrapper innecesario en `GridTarjetas.jsx`» | **Corregido en su intención:** el envoltorio sostiene `role="listitem"` dentro de `role="list"`; quitarlo **degradaría** la semántica. **Cerrado (R2): descarte documentado, sin cambio de código.** |
| (4) «Mover `PanelTarjetas.jsx`… o documentar excepción» | **Ya cumplido:** la excepción está documentada en el archivo (`PanelTarjetas.jsx:3-4`, Spec 005). Solo se **verifica**. |
| (5) «Renombrar/documentar prop `como` de `Card.jsx`» | **Se documenta** (falta el `@param`). **No se renombra:** es contrato de la Spec 006 RF-03. **Cerrado (R3).** |
| (8/P7) «Higiene pendiente» (clase fantasma, importaciones sin uso, recuentos) | **Se corrige** aquí (RF-01…RF-03), con la decisión registrada de **revertir exenciones explícitas de la Spec 009** (§3 de la 013 y DP-01). |

---

## 3. Relación con specs anteriores

| Spec | Qué fija ahí que **condiciona** esta spec |
|---|---|
| **005** | `PanelTarjetas` vive en `src/pages/` por **decisión del usuario** (excepción documentada). No se mueve (RF-07). |
| **006 (RF-03)** | `Card` expone `como` (string o componente, por defecto `div`) y varias páginas lo consumen. Renombrar la prop rompería ese contrato (RF-06). |
| **009 (RF-15)** | Declaró **exenciones** explícitas: `my-`, `Settings` sin uso y recuentos («4 enlaces»). Esta spec **sí las corrige** ⇒ **revierte exenciones de la 009 por decisión de esta spec**, con la justificación de que son defectos medidos de higiene, dominables sin cambiar el comportamiento ni el contrato de la 009 (dos versiones de vista, corte 768px, cuatro props). La exención de `text-white` **no** se reabre. |
| **010 (§2.2)** | Dejó **fuera de alcance** el aspecto de los modales, la migración de sus hexadecimales y la deuda de `SidebarNavContenido` (`my-`, `text-white`, `Settings` sin uso, nombre accesible de los enlaces colapsados). Esta spec toma **solo** la clase inválida y las importaciones sin uso; el **nombre accesible** sigue **fuera**. |
| **011 / 012 (cerradas)** | **Cerradas** (commits `944542c` y `8aa9f0f`), aunque sus `spec.md` puedan decir «borrador». Esta spec **no** toca los **casos de foco**, la configuración de Vitest ni los stubs de `matchMedia`; donde una de sus suites incluye un **doble de `framer-motion`** que hay que corregir (§4.2: `cierreDeModales.test.jsx`, `DashboardDrawer.test.jsx`, `DashboardUserModal.test.jsx`), el cambio se limita **al doble** y **no** al caso de foco correspondiente (CL-02, DP-08). |
| **013 (hermana)** | Dueña de las **expectativas de estilo** de las suites compartidas (`DashboardUserModal.test.jsx:439, :443`, `DashboardDrawer.test.jsx:144, :151`, `SidebarResponsive.test.jsx:58, :63`, `BottomNav.test.jsx:52, :56, :62, :110, :120, :122`) y de todo lo visual/CSS. Esta spec **no** las modifica (DP-06). |
| **014** | Dueña de los hexadecimales en JSX y del «Usuario» del `Header` del dashboard. |

---

## 4. Evidencia medida (re-verificada el 2026-10-17 y el 2026-10-18)

> Todo lo de este apartado es **diagnóstico**: describe lo que hay, no lo que se debe hacer.

### 4.1 P7 — Higiene pendiente

- **Clase fantasma:** `SidebarNavContenido.jsx:64` declara la clase **`my-`** en el botón del avatar
  (`"flex items-center gap-3 px-3 py-2 my- rounded-lg w-full …"`), sintácticamente inválida: **no
  genera ninguna regla**.
- **Importaciones sin uso:** `SidebarNavContenido.jsx:11` importa `Settings` junto a `Home`, `Receipt`
  y `CreditCard` (los tres sí se usan en el array de `:29-34`) y **`Settings` no se usa en el
  archivo**. Hallazgo propio (no citado en el informe del reviewer): **`BottomNav.jsx:15`** importa
  `Settings` en su bloque de iconos y **tampoco lo usa**. `Settings` solo se consume en
  `DashboardUserModal.jsx:134`.
- **Recuentos documentados que no son el real:**
  - `SidebarNavContenido.jsx` documenta «4 enlaces» en `:2` («4 enlaces + avatar → modal»), `:4`
    («4 NavLink fijos + avatar»), `:18` («4 enlaces con icono + etiqueta») y `:38` (comentario
    «4 enlaces de navegación»), y el array real (`:29-34`) declara **3** entradas (`Home`, `Receipt`
    y `CreditCard`).
  - `SidebarResponsive.jsx:4` documenta «enlaces fijos (4)» y atribuye a esa capa el usuario y el
    cierre de sesión, que los renderiza el contenido compartido; el código tiene **3** enlaces.
  - La Spec 009 los **eximió** (RF-15); esta spec **sí** los corrige como higiene de documentación,
    **sin** tocar el conjunto de enlaces ni las rutas.

### 4.2 Punto (2) — Los avisos de consola: los siete dobles (recuento y lista verificados por `grep` el 2026-10-18)

**Siete** suites contienen el `vi.mock("framer-motion", …)`. El informe del reviewer contaba
**cinco**; la lectura directa confirma **siete** (lista con línea exacta del mock):

| # | Suite (archivo:línea del mock) | Forma del doble |
|---|---|---|
| 1 | `src/components/domain/dashboard/MiTarjetaVirtual.test.jsx:16` | parcial (`...actual`), `motion.div` con spread de props |
| 2 | `src/components/domain/dashboard/AcordeonTarjetas.test.jsx:17` | parcial (`...actual`), `motion.div` con spread de props |
| 3 | `src/components/ModalTarjeta.test.jsx:20` | parcial (`...actual`), `motion.div` con `forwardRef` y spread |
| 4 | `src/components/layout/cierreDeModales.test.jsx:33` | parcial (`...actual`) + `AnimatePresence`, `motion.div` con `forwardRef` y spread |
| 5 | `src/components/layout/DashboardDrawer.test.jsx:21` | **completo** (sin `...actual`, con `__esModule: true`), `motion.div` con `forwardRef` y spread |
| 6 | `src/components/layout/DashboardUserModal.test.jsx:18` | parcial (`...actual`) + `AnimatePresence`, `motion.div` con `forwardRef` y spread |
| 7 | `src/pages/PanelTarjetas.test.jsx:18` | parcial (`...actual`), `motion.div` con `forwardRef` y spread |

**Defecto común a los siete dobles:** el patrón
`({ children, ...props }) => <div {...props}>{children}</div>` **reenvía al nodo del DOM todas las
props restantes**, incluidas las de movimiento (`initial`, `animate`, `exit`, `transition`,
`whileHover`, `whileTap`, `variants`, `layoutId`…); React avisa por atributos no booleanos y por props
desconocidas.

**Componentes que hoy pasan props de movimiento a un elemento animado** (verificado por lectura;
**cinco**): `MiTarjetaVirtual.jsx:117-120` (`animate`, `transition`, `whileHover`, `whileTap`) y
`:217-219` (`initial={false}`), `AcordeonTarjetas.jsx:76-78`, `ModalTarjeta.jsx:108-111` y `:122-125`,
`DashboardDrawer.jsx:110-113` y `DashboardUserModal.jsx:110-113`. De modo que **las suites que montan
cualquiera de ellos** (1, 2, 3, 4, 5, 6 y 7 — `PanelTarjetas.test.jsx` monta la página, que a su vez
monta esos componentes) son las que pueden emitirlos hoy. El planner **no** ejecutó la suite: la
**ausencia** de avisos por suite se mide en el bloque G de §9, **no** se afirma aquí.

**Qué cambia en cada doble (R1):** el doble debe **dejar de reenviar las props de movimiento al
`<div>`** y **conservar exactamente** lo que la suite mide:

- (a) los hijos renderizados;
- (b) el `forwardRef` hacia el nodo donde las suites 3, 4, 5, 6 y 7 apoyan la trampa de foco;
- (c) `AnimatePresence` renderizando hijos en 4 y 6;
- (d) `useReducedMotion` controlable en 1, 2, 3, 4, 6 y 7 (el 5, al ser doble **completo**, **no** lo
  expone: debe seguir cubriendo lo que su componente importa);
- (e) el paso al DOM de las props **válidas** (`className`, `style`, `role`, `id`, `aria-*`,
  manejadores).

El **recuento de casos** de cada suite **no** baja y **ningún componente** se modifica (RF-04/AC-04).
`BottomNav` **no** está implicado: **no usa ninguna librería de animación** (`BottomNav.jsx`, sin
import de `motion`).

### 4.3 Punto (3) — El envoltorio de `GridTarjetas`

`GridTarjetas.jsx:28` envuelve cada tarjeta con `role="listitem"` dentro del contenedor `role="list"`
de `:24-25`. Es **semántica de lista**, no un `div` decorativo: retirarlo dejaría un `role="list"` sin
elementos de lista. **Cerrado por R2:** la spec **documenta el descarte** de retirarlo; **no** hay
cambio de código. *(Observación: `AcordeonTarjetas.jsx:35` y `:43` repiten el mismo patrón
`role="list"`/`role="listitem"`; esta spec no lo toca.)*

### 4.4 Punto (4) — `PanelTarjetas`

La excepción está documentada en el propio archivo (`PanelTarjetas.jsx:3-4`: «Alojado en src/pages/
por decisión del usuario (excepción documentada, spec 005)») y registrada por la Spec 005. **Ya
cumplido**: solo se verifica (RF-07).

### 4.5 Punto (5) — `Card`

La cabecera declara las props en `@funciones` (`Card.jsx:3`) y `@datos` (`:4`), pero **no incluye
ningún `@param`**, así que el contrato de `como` (tipo, valor por defecto `div`, efecto sobre la
etiqueta renderizada) queda **sin documentar** en el punto donde la guía del proyecto lo pide; la
firma está en `Card.jsx:9` (`export function Card({ children, className = "", como: Tag = "div" })`).
Se consume en `Features.jsx:109`, `PaginaDashboardInicio.jsx:21, :25, :29`,
`PaginaDashboardTransacciones.jsx:20` y `PaginaDashboardConfiguracion.jsx:20`. Renombrar `como`
rompería la Spec 006 RF-03 y `Card.test.jsx`. **Cerrado por R3:** se añade **solo** el `@param` que
falta; **no** se renombra y `Card.test.jsx` mantiene su contrato.

### 4.6 Observaciones registradas (sin requisito derivado)

- `src/components/Hero.test.jsx:11` importa `./domain/landing/Hero`: la suite vive **fuera** de la
  carpeta de su componente. Funciona; moverla **no** está autorizado por esta spec (es visual, de la
  013).
- El número de suites ha crecido con los trabajos **cerrados** (011/012): la línea base debe
  re-medirse **inmediatamente antes** de tocar nada.

---

## 5. Requisitos Funcionales (EARS)

### A — Higiene de código

- **RF-01 — Ubicuo — Sin clases fantasma.** **EL SISTEMA NO DEBE** declarar en los componentes del
  alcance clases que no generen ninguna regla (hoy `my-` en `SidebarNavContenido.jsx:64`), ni
  sustituirlas por valores arbitrarios nuevos; el espaciado que ya aporta el contexto se conserva.
- **RF-02 — Ubicuo — Sin importaciones sin uso.** Los archivos del alcance **NO DEBEN** conservar
  importaciones que no se usan (hoy dos, `Settings` en `SidebarNavContenido.jsx:11` y en
  `BottomNav.jsx:15`), **sin** alterar el resto del bloque de importaciones ni el uso legítimo del
  mismo icono en `DashboardUserModal.jsx:134`.
- **RF-03 — Ubicuo — Documentación fiel.** Las cabeceras del alcance **DEBEN** describir el
  **recuento real** de enlaces de la navegación compartida (hoy dicen cuatro y hay tres) y el uso
  real de lo que documentan, en `SidebarNavContenido.jsx` (`:2`, `:4`, `:18`, `:38`) y
  `SidebarResponsive.jsx:4`. **EL SISTEMA NO DEBE** cambiar el conjunto de enlaces ni las rutas por
  este requisito.

### B — Dobles de prueba de animación

- **RF-04 — Estado — Avisos de consola de las suites (R1).** **CUANDO** se ejecuten las **siete**
  suites verificadas en §4.2, **EL SISTEMA NO DEBE** emitir los avisos derivados de reenviar props de
  animación a elementos del DOM. La corrección **DEBE** hacerse en el **doble de prueba** de cada
  suite (que deje de reenviar las props de movimiento y conserve lo que la suite mide: hijos,
  `forwardRef`, `AnimatePresence` y `useReducedMotion` donde existan) y **NO DEBE** cambiar el
  comportamiento ni las props legítimas de los componentes (`initial={false}`, `whileHover` y
  `whileTap` siguen siendo API válida y **no** se tocan). El **recuento de casos** de cada suite **NO
  DEBE** bajar y el diff de los componentes del alcance **DEBE** limitarse a RF-01/RF-02/RF-03.

### C — Documentación y verificación de decisiones

- **RF-05 — Ubicuo — El envoltorio semántico se conserva (R2).** El contenedor con `role="listitem"`
  de la grilla de tarjetas **DEBE** conservarse (la lista mantiene sus elementos) y el **descarte** de
  retirarlo **DEBE** quedar documentado con su motivo. **EL SISTEMA NO DEBE** cambiar el marcado.
- **RF-06 — Ubicuo — La prop `como` documentada (R3).** La prop `como` de `Card` **DEBE** quedar
  documentada en el JSDoc del componente (tipo, valor por defecto y efecto), **sin** renombrarla y
  **sin** cambiar su comportamiento ni sus valores admitidos.
- **RF-07 — Ubicuo — Excepción de `PanelTarjetas` verificada.** La excepción documentada de la
  ubicación de `PanelTarjetas` **DEBE** comprobarse (documentación presente, archivo sin mover y sin
  referencias rotas). **EL SISTEMA NO DEBE** mover ni duplicar el archivo.

### D — Transversal de esta spec

- **RF-08 — Ubicuo — Pruebas y no-regresión.** Los cambios **DEBEN** llevar pruebas en el patrón
  vigente (Vitest y Testing Library) y **NO DEBEN** degradar ninguna suite existente. La corrección de
  los dobles **NO DEBE** cambiar el recuento de casos ni el significado de ninguna aserción; si alguna
  expectativa necesitara ajuste por el nuevo doble, se ajusta **solo** la expectativa y se registra,
  sin relajarla ni cambiarla para que la prueba pase. `Card.test.jsx` mantiene su contrato.
- **RF-09 — Ubicuo — Validaciones declaradas.** El sistema de calidad **DEBE** declarar como **no
  automatizadas** —y nunca afirmarlas como «verdes» sin medición— las comprobaciones que el entorno de
  pruebas no puede evaluar (apariencia del DOM del doble frente al comportamiento real de la librería
  de animación) y **DEBE** dejar constancia de las que solo se comprueban por inspección (`grep`,
  lectura de cabeceras) por no existir herramienta de *lint* en el proyecto.
- **RF-10 — Ubicuo — Alcance mínimo.** Los cambios **NO DEBEN** introducir dependencias, herramientas
  de lint, cambios de build, rutas, datos, endpoints, autenticación, `TRIAL_ACTIVO` ni contratos
  públicos; **NO DEBEN** tocar el entorno de medición (configuración de Vitest, stubs de `matchMedia`
  y de `focus-trap-react`) ni los casos de foco de las specs 011/012, ni nada del alcance visual de la
  Spec 013.

---

## 6. Casos Límite y Decisiones

> Cada decisión vive **en un único sitio**; las demás secciones la referencian por su ID.

### 6.1 Casos límite

- **CL-01 — Código en movimiento.** El usuario edita a mano: si al implementar un defecto ya no existe
  (clase ya retirada, import ya limpiado, recuento ya corregido, doble ya ajustado), se registra como
  «ya no aplicable» y **no** se recrea ni se revierte la edición. (Espejo de la 013 CL-10.)
- **CL-02 — Suites compartidas con las specs 011/012 (cerradas).** Cuando el archivo de prueba
  pertenezca a esos trabajos (`cierreDeModales.test.jsx`, `DashboardDrawer.test.jsx`,
  `DashboardUserModal.test.jsx`), el cambio se limita **al doble de `framer-motion`**; **nunca** toca
  los casos de foco, los stubs de `matchMedia`, la configuración de Vitest ni las **expectativas de
  estilo** (esas son de la 013, DP-06). Cualquier solapamiento se registra en §9. (Espejo de la 013
  CL-12.)
- **CL-03 — Recuento de casos y cobertura del doble.** El doble nuevo **NO DEBE** reducir el número de
  casos ni la cobertura efectiva de la suite: si un caso dejaba de pasar por reenviar props al DOM, la
  respuesta **no** es borrar el caso sino ajustar el doble. El **recuento de las siete suites** es el
  de §4.2 y cualquier cifra distinta debe justificarse con un `grep` nuevo fechado.
- **CL-04 — Doble completo frente a doble parcial.** El doble de `DashboardDrawer.test.jsx` es
  **completo** (`__esModule: true`, sin `...actual`, sin `useReducedMotion`); los otros seis son
  **parciales** (`...actual`) y cuatro de ellos usan `forwardRef`, y dos mockean `AnimatePresence`. El
  ajuste **DEBE** respetar la forma de cada uno y seguir cubriendo lo que su componente importa.

### 6.2 Decisiones

| ID | Decisión |
|---|---|
| **DP-01** | **Encuadre y reparto:** esta spec es la de **higiene de código, dobles de prueba y documentación**; sustituye a los puntos (2), (3), (4), (5) y (8/P7) del encargo original **en su intención** (no cambia componentes por los avisos, no retira el envoltorio semántico, no mueve `PanelTarjetas` y no renombra `como`). Todo lo visual/CSS vive en la 013; ninguna de las dos reabre la otra (RF-10). |
| **DP-02** | **Punto 2 (avisos) — CERRADO (R1 = a):** se corrigen los **dobles de prueba** de las **siete** suites verificadas (§4.2: recuento y lista confirmados por `grep`; el informe del reviewer decía cinco). El doble deja de reenviar las props de movimiento al `<div>` y conserva lo que la suite mide. `initial={false}`, `whileHover` y `whileTap` de los componentes son API legítima y **no** se cambian; `BottomNav` **no** está implicado. **Ningún componente se modifica** por los avisos. |
| **DP-03** | **Punto 3 (envoltorio) — CERRADO (R2 = a), sin cambio de código:** el contenedor con `role="listitem"` **se conserva** (es la semántica de la lista) y la spec **documenta el descarte** de retirarlo. No se toca el marcado de la grilla. |
| **DP-04** | **Punto 4:** la comprobación es **solo de verificación**; no se mueve ni se duplica `PanelTarjetas`. |
| **DP-05** | **Punto 5 — CERRADO (R3 = a):** se añade **solo** el `@param` que falta de `como` (tipo, valor por defecto `div`, efecto sobre la etiqueta) y **no** se renombra (Spec 006 RF-03). `Card.test.jsx` mantiene su contrato. |
| **DP-06** | **Frontera con la 013:** las **expectativas de estilo** que otra spec corrige (`DashboardUserModal.test.jsx:439, :443`; `DashboardDrawer.test.jsx:144, :151`; `SidebarResponsive.test.jsx:58, :63`; `BottomNav.test.jsx:52, :56, :62, :110, :120, :122`) **no** se tocan aquí. Si una suite necesitara ambos cambios, se aplican en el mismo archivo pero por **dos requisitos distintos** y con trazabilidad separada. |
| **DP-07** | **Recuento de las siete suites:** la lista de §4.2 es la **referencia única** (verificada por `grep` el 2026-10-18). El informe del reviewer contaba cinco; la lectura directa confirma siete. Cualquier cifra distinta en el cuerpo del documento es un error y prevalece §4.2. |
| **DP-08** | **Entorno de medición intacto:** no se tocan `vitest.setup.js`, los stubs de `matchMedia` ni los de `focus-trap-react`, ni la configuración de Vitest (specs 011/012, **cerradas**), ni sus casos de foco. Las líneas base de 010/011/012 **no** se invalidan. |
| **DP-09** | **Pruebas:** no se exige crear suites nuevas. `Card.test.jsx` conserva su contrato; las suites de la navegación lateral y de la barra inferior deben seguir verdes con las cabeceras corregidas; la ausencia de avisos se comprueba ejecutando las siete suites (bloque G de §9) y **no** se declara sin ejecutarlas. |

---

## 7. Criterios de aceptación — tabla compacta requisito ↔ criterio ↔ verificación

> Una fila por requisito funcional. «Auto» = verificable por la suite; «Inspección» = `grep`/lectura
> (no hay herramienta de *lint* en el proyecto).

| AC | RF | Estado observable esperado | Verificación | Tipo |
|---|---|---|---|---|
| **AC-01** | RF-01 — clases fantasma | La clase malformada `my-` ya no aparece en el componente y no se introdujo ningún valor arbitrario en su lugar | `grep` + prueba de fuente (clases presentes) + suite del componente verde | Auto + Inspección |
| **AC-02** | RF-02 — importaciones sin uso | Las dos importaciones de `Settings` ya no están en `SidebarNavContenido.jsx:11` ni en `BottomNav.jsx:15`; el uso legítimo en `DashboardUserModal.jsx:134` sigue intacto y ninguna importación nueva queda sin uso | `grep` del icono y lectura de las cabeceras; **sin** lint en el proyecto, la comprobación es de inspección | Inspección |
| **AC-03** | RF-03 — documentación fiel | Las cabeceras del alcance ya no afirman un recuento de enlaces distinto del real (tres); el conjunto de enlaces y las rutas no cambian | `grep` del recuento en las cabeceras (`SidebarNavContenido.jsx:2, :4, :18, :38`; `SidebarResponsive.jsx:4`) + suites de navegación lateral verdes | Auto + Inspección |
| **AC-04** | RF-04 — avisos de consola (R1) | Las **siete** suites de §4.2 se ejecutan **sin** los avisos por props de animación reenviadas al DOM, con el **mismo recuento de casos** y con el **diff de los componentes vacío** (salvo RF-01/RF-02/RF-03) | Ejecución **suite por suite** de las siete rutas (bloque G de §9) + inspección del diff de los componentes (debe ser vacío) | Auto + Inspección |
| **AC-05** | RF-05 — envoltorio semántico (R2) | La grilla mantiene su lista y sus elementos (`role="list"` con `role="listitem"` por tarjeta) y el descarte queda documentado con su motivo | Suite de la grilla + aserción de roles + inspección de la documentación | Auto + Inspección |
| **AC-06** | RF-06 — prop `como` documentada (R3) | El JSDoc declara `como` (tipo, valor por defecto, efecto); la prop **no** se renombra y su comportamiento no cambia | Inspección del JSDoc + suite de `Card` verde + `grep` del nombre de la prop | Auto + Inspección |
| **AC-07** | RF-07 — excepción de `PanelTarjetas` | La excepción está documentada en el archivo (`:3-4`) y el archivo sigue en su sitio, sin referencias rotas | Inspección + suite de la página verde | Auto + Inspección |
| **AC-08** | RF-08/RF-09/RF-10 — cierre | Sin fallos **nuevos** frente a la **línea base re-medida antes de tocar código**, **suite por suite**; sin dependencias, sin lint nuevo, sin cambios de datos/rutas/contratos ni del entorno de medición; con las validaciones no realizadas declaradas explícitamente | `npm test` + `npm run build` (tarea final del plan) + inspección del diff + declaración de validaciones no realizadas (§9) | Auto + Inspección |

> **Honestidad de la validación.** AC-04 se declara sobre las **siete ejecuciones** de §9: si una
> suite no se ejecuta, su ausencia de avisos **no** puede afirmarse. AC-01, AC-02, AC-03 y AC-06 se
> apoyan en inspección (`grep`/lectura) porque el proyecto **no** tiene *lint*; esa limitación se
> declara. AC-08 compara **contra la línea base medida inmediatamente antes** del cambio.

---

## 8. Trazabilidad

### 8.1 Defectos y puntos → requisitos

| Origen | Requisito | Criterio |
|---|---|---|
| **P7 — clase fantasma, importaciones sin uso, recuentos** | RF-01, RF-02, RF-03 | AC-01, AC-02, AC-03 |
| **Punto (2) — avisos `initial`/`whileHover`/`whileTap`** | RF-04 (R1) | AC-04 |
| **Punto (3) — envoltorio de `GridTarjetas`** | RF-05 (R2) | AC-05 |
| **Punto (4) — excepción de `PanelTarjetas`** | RF-07 | AC-07 |
| **Punto (5) — prop `como`** | RF-06 (R3) | AC-06 |
| Transversal a todos | RF-08, RF-09, RF-10 | AC-08 |

### 8.2 Frontera con la Spec 013 (no hay solape)

| Tema | Spec | Por qué |
|---|---|---|
| Revelado de la landing, movimiento reducido, sin JS | **013** | Es CSS visual |
| Blur, saturación, radios, transparencia reducida (H-1), área segura, columnas de la barra, tokens, literales, contraste | **013** | Es CSS visual |
| **Expectativas de estilo** de las suites de blur/color/grilla | **013** | Corrigen un valor visual |
| Clase fantasma, importaciones sin uso, recuentos documentados | **015** | Higiene de código |
| **Dobles de `framer-motion`** y sus avisos de consola | **015** | Dobles de prueba |
| Envoltorio `role="listitem"`, `@param` de `como`, verificación de `PanelTarjetas` | **015** | Documentación y decisiones |
| P1 (CSS compilado) | **ninguna** | Fuera de alcance (R4); remitido a spec futura (013 §4.1) |

### 8.3 Correspondencia con la numeración previa (nada se pierde)

> Versión de referencia: el borrador de la Spec 013 revisado por el reviewer (RF-01…RF-24,
> AC-01…AC-23, CL-01…CL-14, DP-01…DP-24). **Los 24 RF, 23 AC, 14 CL y 24 DP están en esta tabla**:
> ninguna fila queda sin destino.

**Requisitos funcionales**

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| RF-01 | 013 RF-01 | RF-13 | 013 RF-13 |
| RF-02 | 013 RF-02 | RF-14 | 013 RF-14 |
| RF-03 | 013 RF-03 | RF-15 | **015 RF-01** |
| RF-04 | 013 RF-04 | RF-16 | **015 RF-02** |
| RF-05 | 013 RF-05 | RF-17 | **015 RF-03** |
| RF-06 | 013 RF-06 | RF-18 | **015 RF-04** (R1) |
| RF-07 | 013 RF-07 | RF-19 | **015 RF-05** (R2) |
| RF-08 | 013 RF-08 | RF-20 | **015 RF-06** (R3) |
| RF-09 | 013 RF-09 | RF-21 | **015 RF-07** |
| RF-10 | 013 RF-10 | RF-22 | 013 RF-15 **+** 015 RF-08 (repartido) |
| RF-11 | 013 RF-11 | RF-23 | 013 RF-16 **+** 015 RF-09 (repartido) |
| RF-12 | 013 RF-12 | RF-24 | 013 RF-17 **+** 015 RF-10 (repartido) |

**Criterios de aceptación**

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| AC-01 | 013 AC-01 | AC-13 | 013 AC-14 |
| AC-02 | 013 AC-02 | AC-14 | 013 AC-15 |
| AC-03 | 013 AC-03 | AC-15 | **015 AC-01** |
| AC-04 | 013 AC-04 | AC-16 | **015 AC-02** |
| AC-05 | 013 AC-05 | AC-17 | **015 AC-03** |
| AC-06 | 013 AC-06 | AC-18 | **015 AC-04** |
| AC-07 | 013 AC-08 | AC-19 | **015 AC-05** |
| AC-08 | 013 AC-09 | AC-20 | **015 AC-06** |
| AC-09 | 013 AC-10 | AC-21 | **015 AC-07** |
| AC-10 | 013 AC-11 | AC-22 | 013 AC-16 **+** 015 AC-08 (repartido) |
| AC-11 | 013 AC-12 | AC-23 | 013 AC-07 (agnóstico al mecanismo) |
| AC-12 | 013 AC-13 | | |

**Casos límite**

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| CL-01 | 013 CL-01 | CL-08 | 013 CL-08 |
| CL-02 | 013 CL-02 | CL-09 | 013 CL-09 |
| CL-03 | 013 CL-03 | CL-10 | 013 CL-10 **+** 015 CL-01 (espejo) |
| CL-04 | 013 CL-04 | CL-11 | 013 CL-11 |
| CL-05 | 013 CL-05 | CL-12 | 013 CL-12 **+** 015 CL-02 (espejo) |
| CL-06 | 013 CL-06 | CL-13 | 013 CL-13 |
| CL-07 | 013 CL-07 | CL-14 | 013 CL-14 |

**Decisiones**

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| DP-01 | 013 DP-01 **+** 015 DP-01 | DP-13 | 013 DP-09 |
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
| DP-12 | 013 DP-08 (R8) | DP-24 | 013 DP-20 |

**Casos límite y decisiones nuevos de la 015:** CL-03 (recuento de casos y cobertura del doble),
CL-04 (doble completo frente a parcial); DP-06 (frontera con la 013), DP-07 (recuento de las siete
suites), DP-08 (entorno de medición intacto), DP-09 (pruebas). Los nuevos de la 013 son DP-21…DP-26.

---

## 9. Validaciones y comandos

> Ninguna validación se declara verde sin haberse ejecutado. La **línea base** (455/455 en 30
> archivos, aportada por el orquestador) **debe re-medirse** antes de tocar código; la comparación es
> **suite por suite**.

| Bloque | Alcance | Comando / método |
|---|---|---|
| **F — Higiene y documentación** | `SidebarNavContenido`, `SidebarResponsive`, `BottomNav`, `Card` | `npx vitest run src/components/layout src/components/ui` + `grep` de `my-`, del icono `Settings` y de los recuentos documentados |
| **G — Suites con dobles de animación (R1)** | Las **siete** suites de §4.2 y los componentes implicados | Una ejecución **por suite**: `npx vitest run src/components/domain/dashboard/MiTarjetaVirtual.test.jsx src/components/domain/dashboard/AcordeonTarjetas.test.jsx src/components/ModalTarjeta.test.jsx src/pages/PanelTarjetas.test.jsx src/components/layout/cierreDeModales.test.jsx src/components/layout/DashboardDrawer.test.jsx src/components/layout/DashboardUserModal.test.jsx` — se **registra**, por suite, la ausencia de avisos y el recuento de casos |
| **H — Cierre** | Todo el proyecto | `npm test` y `npm run build`, comparados **suite por suite** con la línea base re-medida |

**Validaciones declaradas NO automatizadas o solo de inspección:**

1. **Ausencia de avisos de consola (AC-04):** se comprueba **leyendo la salida** de cada una de las
   siete ejecuciones del bloque G; no hay aserción que la mida. Si una suite no se ejecuta, no puede
   afirmarse.
2. **Higiene sin *lint* (AC-01, AC-02, AC-03, AC-06):** la comprobación es `grep` + lectura de
   cabeceras; el proyecto no tiene herramienta de *lint* y esta spec **no** la añade.
3. **Fidelidad del doble respecto de la librería real:** el doble corregido **no** reproduce el
   comportamiento de `framer-motion`; se declara que su función es **no** ensuciar el DOM y seguir
   cubriendo lo que la suite mide (CL-04).
4. **Conveniencia de la clase retirada (`my-`)**: se comprueba por lectura de las clases heredadas del
   contexto; no se mide el espaciado computado (es visual y de la 013 si se quisiera medir).
5. **Excepción de `PanelTarjetas`:** verificación documental y de ubicación, sin prueba específica más
   allá de la suite de la página.

**Riesgos registrados:** (a) las suites de las specs **cerradas** 011/012 comparten archivos con esta
spec (`cierreDeModales.test.jsx`, `DashboardDrawer.test.jsx`, `DashboardUserModal.test.jsx`): el
ajuste se limita **al doble** y **no** toca casos de foco ni stubs (CL-02/DP-08); (b) si el doble nuevo
dejara de reenviar alguna prop que una aserción usa, el ajuste se hace **en la expectativa**, nunca
relajándola (RF-08/CL-03); (c) la corrección de las cabeceras puede chocar con las aserciones de
recuento de las suites de navegación: si existiera tal aserción sobre el **texto** de la cabecera, se
eleva el conflicto antes de cambiarla; (d) el planner **no** ha ejecutado la suite, de modo que la
lista de siete suites con avisos es una **predicción** basada en el montaje de los componentes y se
confirma en el bloque G.

---

## 10. Preguntas de alcance — **RESUELTAS** (2026-10-18)

| Pregunta | Respuesta del usuario | Efecto |
|---|---|---|
| **Q1 — ¿Dónde se corrigen los avisos de consola?** (a) dobles de las **siete** suites; (b) solo suites no tocadas por 011/012; (c) fuera | **(a)**, con orden explícito de **confirmar por `grep`** recuento y lista antes de fijar el alcance | **R1** ⇒ RF-04/AC-04; §4.2 con el recuento y la lista **verificados**; bloque G con una ejecución por suite |
| **Q2 — ¿Envoltorio de `GridTarjetas`?** (a) conservarlo y documentar el descarte; (b) retirarlo | **(a)** | **R2** ⇒ RF-05/AC-05, sin cambio de código |
| **Q3 — ¿Alcance de `como`?** (a) solo el `@param`; (b) renombrar; (c) fuera | **(a)** | **R3** ⇒ RF-06/AC-06; Spec 006 RF-03 y `Card.test.jsx` intactos |
| **Q4 — Reparto de la petición** | **Separar la higiene en otra spec** | Esta spec (015): higiene, dobles y documentación. El resto (visual/CSS) queda en la 013 (§8.3) |
| **(traslado)** P1 (artefacto de build), H-1, blur a ≤640px y tokens (R4–R8) | — | **No** se tratan aquí; viven en la **013** (§4.1, §4.2, RF-06 y RF-12) |

**Estado:** `borrador` **por aprobación pendiente**, no por falta de información. **Preguntas
abiertas: ninguna**; las decisiones que podrían requerir al usuario (radio del cromo modal) están
registradas como notas no bloqueantes en la 013 (DP-20).
