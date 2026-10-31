# Spec 009 — Eliminar la versión tablet: dos versiones de vista (pantallas grandes y móvil)

**Estado:** aprobada
**Fecha:** 2026-10-16
**Última revisión:** 2026-10-16 (DP-06: ajuste de las pruebas de conteo de enlaces a la fuente, sin tocar la fuente; línea base medida 236/21 y corrección de hechos en §3/§8)
**Aprobación:** aprobada por el usuario el 2026-10-16, sin cambios funcionales respecto al borrador revisado (paso a la fase de plan y tareas: `plan.md`, `tasks.md`)
**Basada en:** Spec 007 (navegación responsive dashboard) y Spec 008 (corrección sidebar, **no se aborda en esta spec**)

> **Nota de volatilidad:** el usuario sigue editando el código a mano mientras se especifica e
> implementa este cambio. Por eso este documento define **comportamiento y contratos objetivo**,
> no un diff línea a línea: los detalles del estado actual (ramas existentes, nombres de clases,
> número de pruebas, artefactos pendientes de limpieza) deben re-verificarse antes de tocarlos
> («según el estado real al implementar»). De la línea base medida (2026-10-16) se sabe que hoy
> **fallan 10 pruebas** por aserciones desfasadas de conteo de enlaces laterales y que
> `DashboardLayout.test.jsx` no compila: ambos se corrigen dentro del alcance de pruebas de esta
> spec (DP-06, §3). La validación diferida se detalla en §7 (AC-16, AC-18 y AC-19) y §8.

---

## 1. Propósito

La navegación responsive del dashboard se diseñó con **tres** versiones de vista (escritorio,
tablet, móvil). La versión tablet nunca llegó a funcionar: no existe un control que la abra y la
banda intermedia renderiza la variante de escritorio sin reservar el espacio de la navegación,
por lo que el contenido queda tapado. Mantener tres ramas multiplica estados, componentes y
pruebas sin aportar valor.

El propósito de esta spec es **reducir el dashboard a dos versiones de vista —«pantallas
grandes» y «móvil»—**, con un único **corte de versión de vista en 768px**: todo lo que hoy
corresponde a la versión tablet (banda 768–1023px) pasa a «pantallas grandes» con la navegación
lateral colapsada por defecto, y la banda estrecha (640–767px) pasa a ser **móvil**, con
navegación inferior y menú como cualquier móvil. Con ello no queda ninguna banda en la que la
navegación sea inaccesible y desaparecen los artefactos que quedan sin uso.

**Dos conceptos que no deben confundirse** (ver RF-02 y RF-06):

| Concepto | Valor | Para qué sirve |
|---|---|---|
| **Corte de versión de vista** | **768px** | Decide si la interfaz es «móvil» o «pantallas grandes» (único corte) |
| **Umbral del estado por defecto de la navegación lateral** | **1024px** | Decide únicamente cuál es el estado inicial (colapsada/expandida) **cuando no hay preferencia guardada**; no cambia de versión de vista |

---

## 2. Alcance

**Incluido (solo dashboard):**

- Reclasificación de las versiones de vista del dashboard: de tres (móvil / tablet / pantallas
  grandes) a dos (móvil <768px / pantallas grandes ≥768px).
- La **lógica de versión de vista** del dashboard (`useBreakpoint`): contrato de 4 props, sin
  flag de tablet, con los dos valores por defecto por banda y el contrato de preferencia válida.
- El **layout del dashboard** (`DashboardLayout`): composición por rango, márgenes/padding y
  estados.
- Los **componentes de layout exclusivos del dashboard** dentro de `src/components/layout/`:
  navegación lateral, menú lateral superpuesto, navegación inferior, contenido de navegación
  compartido y modal de cuenta. **`Header.jsx` y `Footer.jsx` son de la landing y quedan fuera.**
- **Limpieza de los artefactos de la composición tablet que quedan sin uso** dentro de los
  archivos del alcance, **excepto `src/styles/index.css`** (ver RF-15 y §8).
- Actualización de las **cabeceras JSDoc** de los archivos del alcance, que hoy documentan el
  contrato viejo (flag de tablet / banda tablet).
- Recomposición al cruzar el corte y cierre de paneles superpuestos que dejen de aplicar.
- Las pruebas del alcance: contrato de la lógica de versión de vista, composición del layout,
  navegación lateral, menú superpuesto, navegación inferior, modal de cuenta y regresión de rutas.
- **Ajuste de las pruebas del alcance desfasadas en el recuento de enlaces laterales:** las suites
  que hoy afirman «4 enlaces» (y sus conteos de focos derivados: 5) se actualizan a «3» (y 4),
  **sin modificar el código fuente** (decisión DP-06, §5).

**Fuera de alcance (explícitamente):**

- **Landing** (`Header`, `Hero`, `StatsBar`, `Features`, `HowItWorks`, `CtaSection`, `Footer`):
  sus breakpoints actuales se quedan como están.
- **Panel de tarjetas / acordeón** (`PanelTarjetas`, `AcordeonTarjetas`, `GridTarjetas`) y
  cualquier vista que alterna presentaciones con sus propias clases de breakpoint: sin cambios.
- **`src/styles/index.css` y la variable de altura del header** (`--header-height` o
  equivalente): quedan para una **pasada de limpieza posterior**, fuera de esta spec.
- **El conjunto de enlaces de la navegación (código fuente).** La ausencia de un enlace directo a
  Configuración en la navegación lateral es **intencionada** (decisión del usuario: «yo quité
  configuración como link directo, deja solo los links que están»). No se añade ese enlace ni se
  trata su ausencia como defecto. El número de enlaces vigente es el que ya existe (**3** en la
  navegación lateral) y **no debe recontarse ni «corregirse»** en el código, en cabeceras ni en
  documentación dentro de esta spec.
- **La vía de acceso a Configuración.** En pantallas grandes, la sección Configuración se alcanza
  desde el **modal/banner del perfil del usuario** (`DashboardUserModal`), que ya navega a
  `/dashboard/configuracion` y **no se modifica** en esta spec. Esa vía **no** se traslada al
  sidebar: no se restituye el enlace lateral. (El ajuste de las **pruebas** que cuentan enlaces
  laterales sí entra en el alcance: DP-06, §2 «Incluido» y §5.)
- **El nombre accesible de los enlaces de la navegación lateral en estado colapsado.** Hoy, en
  estado colapsado solo se muestra el icono, sin nombre accesible específico. Es una **deuda
  preexistente** que se registra para abordarla más adelante: **no forma parte de esta spec** y su
  ausencia **no** se considera incumplimiento de los criterios de aceptación. Esta spec mantiene la
  accesibilidad **donde ya existe** (estado expandido y navegación de móvil) y **no modifica** el
  componente de contenido de navegación compartido por esta causa.
- **El mock global de preferencia de la configuración de pruebas** (raíz del repositorio, fuera de
  `src/`): **no requiere cambios**. Su valor actual (`undefined`) ya se interpreta como «sin
  preferencia» con el contrato de RF-07. Solo se tocaría si la implementación lo hace necesario, y
  entonces se registraría como parte del alcance de pruebas.
- **Spec 008**: no se sanea, no se planifica su cierre, no se tocan sus `spec.md`, `plan.md` ni
  `tasks.md` (obsolescencia declarada en §3).
- Rediseño visual, paleta, tokens nuevos, hex heredados, modo oscuro.
- Rutas, datos, autenticación (`TRIAL_ACTIVO` sin cambios), endpoints y backend.
- Nuevas dependencias, librerías de animación o cambios de build.

---

## 3. Cambios vs Spec anterior

| Aspecto | Spec 007 (diseño vigente) | Spec 009 (esta spec) |
|---|---|---|
| Versiones de vista | 3: móvil <640, tablet 640–1023, escritorio ≥1024 | **2: móvil <768 y pantallas grandes ≥768** |
| Banda 640–767px | Tablet | **Móvil** (navegación inferior + menú, como cualquier móvil) |
| Banda 768–1023px | Tablet (menú lateral superpuesto) | **Pantallas grandes** con navegación lateral permanente **colapsada** por defecto |
| Navegación tablet | Menú superpuesto + overlay | **Eliminada como categoría** |
| `useBreakpoint` | `{ isMobile, isTablet, isDesktop, sidebarColapsada, toggleSidebar }` | **`{ isMobile, isDesktop, sidebarColapsada, toggleSidebar }`**; `isDesktop` = ≥768px |
| Valor por defecto sin preferencia guardada | Expandida (una sola regla) | **Depende de la banda: colapsada en 768–1023px, expandida en ≥1024px** |
| «Sin preferencia guardada» | `null` cae en «expandida» (`?? false`) | **Solo un booleano tras `JSON.parse` cuenta como preferencia**; resto ⇒ sin preferencia |
| Estado del layout ligado a tablet | `drawerAbierto` | **Se retira (queda sin uso)** |
| Artefactos tablet en los archivos del alcance | Presentes | **Se limpian, excepto `index.css` / `--header-height`** (RF-15) |
| Conjunto de enlaces de la navegación | Con enlace directo a Configuración | **Sin enlace directo a Configuración** en la navegación lateral (intencionado; no se restaura); Configuración se alcanza desde el modal/banner del perfil (`DashboardUserModal`), que no se modifica |
| Pruebas que cuentan enlaces laterales | Asertan **4** enlaces (y 5 focos) frente a un código con 3 | Las del alcance se ajustan a **3** enlaces (y los focos derivados), **sin tocar la fuente** (DP-06) |
| Modal de cuenta, rutas, contenido de páginas | Sin cambios | **Sin cambios** |

**Obsolescencia explícita de la spec 008.** Quedan **superados** por esta spec, dentro de
`specs/008-correccion-sidebar/`:

| Elemento de la 008 | Por qué queda obsoleto |
|---|---|
| §5.1 y **RF-09** (formas de abrir el drawer en tablet) | Sin versión tablet no hay menú de tablet que abrir |
| **RF-06** (drawer tablet full-height) | La rama no-móvil del menú superpuesto se retira (RF-15) |
| **RF-07** (main sin `pt-[var(--header-height)]`) | Ese padding sobrante se retira aquí como parte de la limpieza (RF-15) |
| **§5.5 y §2** (`--header-height`) | La variable queda para una limpieza posterior; la 009 no la toca, pero tampoco depende de ella |
| **§5.7** (márgenes `lg:ml-*` «ya correcto») | Deja de serlo: el espacio de la navegación debe reservarse desde 768px, no desde 1024px |
| **AC-05 y AC-06** de la 008 (drawer tablet / main sin padding) | Describen comportamientos que esta spec elimina o reubica |
| `plan.md` y `tasks.md` de la 008 (título desalineado) | Su **Tarea 2** introduce la prop `esMobile` que aquí se retira |

Esa obsolescencia queda declarada aquí; anotarla en los documentos de la 008 se hará cuando se
aborda esa spec (§10), ya que la 008 no forma parte de este trabajo.

**Línea base medida (2026-10-16) y discrepancia de fuentes.** La Tarea 1 del plan ya se ejecutó y
los hechos están medidos:

| Hecho medido | Valor |
|---|---|
| `npm test` | **4 archivos fallan / 17 pasan (21)**; **10 tests fallan / 226 pasan (236)** |
| Archivo que no compila | `src/layout/DashboardLayout.test.jsx` (importa `../components/layout/DashboardHeader`, ya eliminado) |
| Fallos de aserción | **10**, repartidos en `DashboardDrawer.test.jsx` (5), `SidebarNavContenido.test.jsx` (2) y `SidebarResponsive.test.jsx` (3) |
| Causa común de esos 10 fallos | Cuentan **4 enlaces** de navegación lateral (y sus focos derivados) cuando el código tiene **3**: desfase de aserciones, no defecto del código |
| Ediciones manuales del usuario | Ya están **en HEAD** (commit `b61286a`); **no hay cambios sin commitear en `src/`** |
| `src/App.test.jsx` (AC-17) | No figura entre los archivos que fallan ⇒ pasa |
| `MEMORY.md` (cierre de la spec 007) | **Desfasado**: afirma `273/273 en 22 archivos`; lo medido es 236/21 |

Los 10 fallos por recuento de enlaces **entran en el alcance de pruebas de esta spec**: se corrigen
actualizando las aserciones (4→3 y 5→4 focos), **sin tocar el código fuente** (DP-06, §5). El archivo
que no compila se reescribe en la Tarea 4. Esta spec sigue sin declarar verde nada que no se haya
medido, y la atribución de fallos se hace siempre contra esta línea base.

---

## 4. Requisitos Funcionales (EARS)

### RF-01: Dos versiones de vista, sin categoría intermedia
**UNA VEZ** medida la viewport **EL SISTEMA DEBE** clasificarla en exactamente una de dos versiones
de vista —«móvil» o «pantallas grandes»— sin que exista una versión tablet observable por la
interfaz.

### RF-02: Corte de versión de vista único en 768px
**CUANDO** el ancho de la viewport sea **menor que 768px** **EL SISTEMA DEBE** aplicar la versión
«móvil»; **CUANDO** sea **igual o mayor que 768px** **EL SISTEMA DEBE** aplicar la versión
«pantallas grandes». El borde de 768px pertenece a «pantallas grandes». La partición **DEBE** ser
complementaria: para cualquier ancho —incluidos valores fraccionarios y con zoom— **exactamente
uno** de los dos valores de versión de vista está activo (RF-11).

### RF-03: La banda 768–1023px pasa a pantallas grandes
**CUANDO** el ancho esté entre 768px y 1023px **EL SISTEMA DEBE** aplicar la composición de
«pantallas grandes», sin ninguna composición específica de tablet. El hecho de que el estado por
defecto de la navegación lateral cambie en 1024px **NO** es un cambio de versión de vista: la
banda 768–1023px y la banda ≥1024px son la **misma** versión de vista, con distinto estado
inicial (RF-06).

### RF-04: Eliminación de la composición tablet
**EL SISTEMA NO DEBE** presentar la navegación lateral superpuesta que se activaba desde un control
de la banda intermedia, ni el estado asociado a esa composición.

### RF-05: Navegación lateral permanente en pantallas grandes
**CUANDO** la viewport pertenezca a «pantallas grandes» **EL SISTEMA DEBE** mostrar la navegación
lateral permanente y colapsable, reservando el espacio correspondiente en el contenido de modo que
navegación y contenido **no se solapen** en **toda** la banda ≥768px (no solo a partir de 1024px).

### RF-06: Estado por defecto según la banda cuando NO hay preferencia guardada
**CUANDO** la viewport pertenezca a la banda **768–1023px** y **NO exista una preferencia
guardada válida** del estado de la navegación lateral **EL SISTEMA DEBE** mostrarla **colapsada**
(solo iconos). **CUANDO** la viewport sea **≥1024px** y **NO exista una preferencia guardada
válida** **EL SISTEMA DEBE** mostrarla **expandida**. En ambos casos el usuario **DEBE** poder
alternar el estado con el control que ya existe. El umbral de 1024px de este requisito es **solo
el umbral del estado por defecto**, no una frontera de versión de vista.

### RF-07: La preferencia guardada manda siempre
**CUANDO** exista una **preferencia guardada válida** del estado de la navegación lateral **EL
SISTEMA DEBE** aplicarla en **cualquier** ancho de pantallas grandes, con independencia de la
banda, y **DEBE** restaurarla al recargar. La alternancia del usuario **DEBE** guardarse y **NO
DEBE** sustituirse por un valor por defecto derivado de la banda. **EL SISTEMA NO DEBE**
materializar como preferencia guardada un valor que el usuario no haya elegido.

**Contrato de «preferencia guardada válida»:** la preferencia es válida **si y solo si**, tras
leer la clave de persistencia y deserializarla, el valor es de tipo **booleano**. Cualquier otro
caso —clave ausente, valor `null`, valor de otro tipo, o error de deserialización— significa **sin
preferencia**, y por tanto se aplica RF-06. En particular, un valor `null` **no** equivale a
«expandida».

### RF-08: Navegación de móvil (sin cambios funcionales)
**CUANDO** la viewport sea «móvil» (<768px, incluida la banda 640–767px) **EL SISTEMA DEBE** mostrar
la navegación inferior fija y el menú superpuesto desplegable, sin navegación lateral permanente,
manteniendo el comportamiento actual. En móvil la navegación lateral no se muestra; la preferencia
guardada **NO DEBE** perder ni sobrescribirse.

### RF-09: Recomposición al cruzar el corte
**CUANDO** la viewport cruce los 768px en cualquier dirección **EL SISTEMA DEBE** recomponer la
vista sin recargar la página y cerrar automáticamente los paneles superpuestos que ya no apliquen
a la nueva versión (p. ej. el menú desplegable de móvil al pasar a pantallas grandes). El modal de
cuenta **DEBE permanecer** abierto, conservando foco y trampa de foco.

Al recomponer, el estado de la navegación lateral se resuelve así: **si existe preferencia
guardada válida, manda la preferencia; si no existe, aplica el estado por defecto de la banda de
destino** (RF-06). Cruzar el corte **NO DEBE** forzar el colapso cuando hay preferencia guardada.

Al cerrarse automáticamente el menú de móvil, el foco **NO DEBE** quedar perdido: **EL SISTEMA
DEBE** trasladarlo a un elemento estable y significativo de la nueva versión (el control de la
navegación lateral que la sustituye), en lugar de dejarlo en un elemento que se desmonta. Si esa
condición no puede verificarse de forma estable en el entorno de pruebas, se comprueba en la
revisión manual y se registra como tal.

### RF-10: Acceso visible a la navegación en ambas versiones
**MIENTRAS** se muestre el dashboard **EL SISTEMA DEBE** ofrecer, en ambas versiones de vista, una
vía visible y accesible por teclado para llegar a **las secciones que la navegación ofrece
actualmente**. El conjunto de enlaces vigente es el que existe hoy por decisión del usuario (sin
enlace directo a Configuración en la navegación lateral): este requisito **NO** exige añadir
secciones ni restituir enlaces retirados. En pantallas grandes, la sección Configuración se alcanza
desde el **modal/banner del perfil** (`DashboardUserModal`), que ya navega a ella y no se modifica.

### RF-11: Contrato de la lógica de versión de vista
**EL SISTEMA DEBE** exponer exactamente cuatro valores desde la lógica de versión de vista del
dashboard: `isMobile`, `isDesktop`, `sidebarColapsada` y `toggleSidebar`; **NO DEBE** existir
`isTablet`. `isMobile` es `true` por debajo de 768px e `isDesktop` es `true` a partir de 768px,
siempre con **exactamente uno** de los dos activo para cualquier ancho, incluidos valores
fraccionarios y con zoom (partición complementaria derivada de una única fuente de verdad; el
mecanismo concreto se fija en el plan).

### RF-12: Accesibilidad equivalente en ambas versiones, donde ya existe
**EL SISTEMA DEBE** mantener, **en los puntos donde hoy ya existe**, la accesibilidad de la
navegación en las dos versiones de vista: semántica de navegación con nombre accesible en el estado
**expandido** y en la **navegación de móvil**, indicación de sección activa, foco visible, orden de
tabulación lógico, trampa de foco y retorno de foco en paneles superpuestos, cierre por teclado, y
traslado de foco sin pérdida en las recomposiciones descritas en RF-09.

**Deuda preexistente fuera de alcance:** el **nombre accesible de los enlaces de la navegación
lateral en estado colapsado** no existe hoy y **no se añade en esta spec**; queda registrado como
deuda preexistente para abordarla más adelante. Su ausencia **no** debe interpretarse como
incumplimiento de los criterios de aceptación de esta spec, y esta spec **no** modifica el
contenido de navegación compartido por esta causa.

### RF-13: Rutas y contenido de secciones sin cambios
**EL SISTEMA DEBE** preservar las rutas del dashboard y sus secciones, sin añadir ni eliminar rutas
y sin cambiar el contenido de las páginas.

### RF-14: Límites Fluid Glass
**EL SISTEMA NO DEBE** aumentar el número de superficies translúcidas simultáneas por vista (máximo
tres) ni el de blobs visibles (máximo dos) al unificar la banda intermedia en pantallas grandes. En
el dashboard el límite relevante es el de **superficies translúcidas** (en pantallas grandes, como
máximo dos simultáneas: navegación lateral + modal de cuenta); **no hay blobs** en el dashboard, por
lo que ese límite es trivial aquí. La unificación no habilita añadir capas de vidrio nuevas.

### RF-15: Limpieza de los artefactos de la composición tablet sin uso
**EL SISTEMA NO DEBE** conservar, dentro de los archivos del alcance, artefactos que solo existían
para la composición tablet: la **rama no-móvil del menú lateral superpuesto**, el **estado del
layout asociado a tablet**, la **altura restada a un header que ya no existe** y el **padding
superior sobrante del contenido principal**. La retirada **DEBE** hacerse **según el estado real
del código al implementar** y **NO DEBE** dejar referencias colgantes, props sin uso **de la
composición tablet** (p. ej. `esMobile`) ni pruebas que sigan validando el comportamiento eliminado.

**Contrato objetivo del menú lateral superpuesto tras la limpieza:** al desaparecer la rama
no-móvil, la rama móvil pasa a ser **incondicional** (el componente ya no bifurca por modo), se
**retira la prop `esMobile`** y el layout del dashboard **deja de pasarla**. Las props que se
mantienen son las que el comportamiento móvil necesita: `abierto`, `alCerrar`, `children` y
`triggerRef`.

**Qué NO se toca (para no «limpiar de más»):** quedan fuera de esta limpieza, salvo que estén
directamente causados por la versión tablet, y siempre según el estado real al implementar:
`src/styles/index.css` y la variable de altura del header; la variable `usuario = getUsuarioMock()`
y su import en el layout; la clase inválida `my-`, el color `text-white` en lugar de token y el
import `Settings` sin usar en el contenido de navegación compartido; el panel duplicado y la
animación de salida del menú superpuesto; y los enlaces de la navegación (sin restituir
Configuración).

**Sobre el contenido de navegación compartido:** no se modifica en esta spec — ni el número de
enlaces vigente (3), ni el nombre accesible en estado colapsado (deuda preexistente, RF-12), ni su
cabecera JSDoc por el recuento de enlaces. **Sus pruebas sí se ajustan** al recuento real (de 4 a 3
enlaces y de 5 a 4 focos), sin tocar el componente (DP-06). La actualización de cabeceras de RF-15 se
limita a retirar lo relativo a **tablet y al flag del hook** en la lógica de versión de vista y en el
layout; si una cabecera menciona un número de enlaces distinto del vigente, **no se «corrige»**
dentro de esta spec: se registra como observación fuera de alcance.

**Cabeceras JSDoc:** las cabeceras de los archivos del alcance (`useBreakpoint.js`,
`DashboardLayout.jsx` y los componentes de layout afectados) **DEBEN** actualizarse para dejar de
documentar la banda tablet y el flag eliminado. Antes de seguir la convención de rutas que cita
`AGENTS.md`, ver §8 (inconsistencia de documentación).

---

## 5. Casos Límite y Decisiones

### Decisiones aprobadas (referencia)

| ID | Decisión |
|---|---|
| DP-01 | Alcance: **solo dashboard** (lógica de versión de vista, layout y componentes de layout del dashboard). Landing y panel de tarjetas intactos. |
| DP-02 (revisada) | Corte de versión de vista: **768px** (`md`). Móvil <768px; pantallas grandes ≥768px. |
| DP-03 | Composición de 768–1023px: **igual que ≥1024px → navegación lateral permanente colapsable**. |
| DP-03b | La navegación lateral **arranca colapsada** en 768–1023px cuando no hay preferencia guardada válida; el usuario puede expandirla. |
| DP-04 | Contrato de la lógica de versión de vista: **4 props**, se **elimina `isTablet`**, `isDesktop` pasa a significar ≥768px. |
| DP-05 | **Solo esta spec.** La 008 no se sanea ni se planifica aquí; su contenido superado se declara obsoleto en esta spec (§3). |
| DP-06 | **Ajuste de pruebas, no de fuente (2026-10-16).** La navegación lateral mantiene sus **3** enlaces (Configuración no se restituye en el sidebar; se alcanza desde el modal/banner del perfil, `DashboardUserModal`, sin cambios). Las **pruebas del alcance** que cuentan «4 enlaces» y sus focos derivados se actualizan a «3»/«4» para que queden verdes, sin tocar el código fuente. |
| CL-01 | Resuelto como **opción (i)**: la preferencia guardada válida manda siempre; el estado por defecto de la banda solo aplica cuando **no hay preferencia válida**. |
| CL-03 | Resuelto: la banda 640–767px es **móvil** (navegación inferior + menú). Se asignó así para que esa parte de la banda estrecha use el comportamiento de móvil. |
| CL-05 | Resuelto: sin medición disponible se mantiene el valor por defecto actual («pantallas grandes» / `isDesktop`). |
| Enlaces | La navegación lateral no incluye enlace directo a Configuración **por decisión del usuario**; no se restituye. Configuración se alcanza en pantallas grandes desde el modal/banner del perfil (`DashboardUserModal`), sin cambios. Las pruebas del alcance que cuentan «4 enlaces» se actualizan a «3» (código fuente intacto) — DP-06. |
| Validación | La **validación diferida** (AC-16, AC-18 y AC-19) se aplaza a después de que el usuario confirme que terminó sus ediciones manuales (ver §7 y §8); AC-17 ya es ejecutable y pasa. |

### Casos límite

**CL-01 — Convivencia entre el estado por defecto de la banda y la preferencia guardada (RESUELTO,
opción i).** Comportamiento esperado; «sin preferencia» significa que **no hay preferencia
guardada válida** según el contrato de RF-07 (clave ausente, `null`, tipo no booleano o error):

| Situación | 768–1023px | ≥1024px | <768px (móvil) |
|---|---|---|---|
| Sin preferencia guardada válida | Colapsada | Expandida | No se muestra la navegación lateral |
| Preferencia válida = colapsada | Colapsada | Colapsada | Se conserva el valor |
| Preferencia válida = expandida | Expandida | Expandida | Se conserva el valor |
| Tras alternar el estado | Se guarda y persiste | Se guarda y persiste | No aplica (no se muestra) |

Sub-cuestiones resueltas: tras recargar se respeta siempre lo guardado y, si no hay nada válido, se
aplica el estado por defecto de la banda; al cruzar el corte con la navegación expandida **no** se
fuerza el colapso cuando hay preferencia guardada (pero sí se aplica el estado por defecto si no
la hay, ver CL-04); al volver de 800px a 1200px se conserva la preferencia única; existe **una
sola** preferencia guardada (sin estados por banda).

**CL-02 — Móvil en horizontal.** Con el corte en 768px, la banda de móvil llega hasta 767px, de
modo que los teléfonos en horizontal de hasta 767px de ancho usan la **navegación de móvil**, como
el usuario pretendía. Los teléfonos grandes en horizontal con 768px o más (p. ej. 812–932px) caen
en «pantallas grandes» y verán la navegación lateral **colapsada** (salvo preferencia guardada):
consecuencia aceptada de DP-02/DP-03b, a validar visualmente.

**CL-03 — Banda estrecha 640–767px (RESUELTO).** Es **móvil**: usa navegación inferior + menú, sin
navegación lateral permanente. Deja de ser un riesgo de compresión de contenido en pantallas
grandes. Único efecto a comprobar: que la navegación inferior y el menú se comportan igual que en
el resto de la banda móvil.

**CL-04 — Cruce del corte sin intervención del usuario.** Cargar en 1200px sin preferencia
(expandida por defecto de banda) y pasar a 800–1023px aplica el **estado por defecto de la banda
de destino** (**colapsada**), aunque el usuario no haya intervenido. Si hubiera preferencia
guardada válida, se conservaría en ambas direcciones. Bordes exactos: 767px es «móvil»; 768px es
«pantallas grandes» en estado colapsado por defecto; 1023px es colapsada por defecto; 1024px es
expandida por defecto. No hay doble pertenencia ni saltos de un píxel.

**CL-05 — Primer render sin medición disponible (RESUELTO).** Se mantiene el valor por defecto
actual: «pantallas grandes» (`isDesktop`). El estado por defecto de banda de RF-06 se aplica una vez
se puede medir el ancho, sin provocar saltos de composición perceptibles.

**CL-06 — Zoom del navegador.** El zoom cambia el ancho efectivo y debe producir la misma
recomposición que un resize, sin estados intermedios inconsistentes y sin que se puedan activar las
dos versiones de vista a la vez ni ninguna de ellas (RF-02, RF-11).

**CL-07 — Resize con paneles abiertos.** Menú de móvil abierto + paso a pantallas grandes ⇒ se
cierra y el foco se traslada conforme a RF-09. Modal de cuenta abierto ⇒ **permanece** con su foco y
su trampa de foco intactos. Navegación lateral expandida + cruce del corte ⇒ manda la preferencia
guardada si existe; si no, el estado por defecto de la banda de destino.

**CL-08 — Anchos extremos y fraccionarios.** Viewports muy estrechas (<320px), muy anchas (>1920px)
y anchos fraccionarios (p. ej. 767,5px) no deben romper la composición, producir desbordamiento ni
dejar la versión de vista indeterminada.

**CL-09 — Doble render por clases en el alcance.** Si algún componente del alcance alterna
presentaciones solo con clases de breakpoint, tras esta spec debe quedar **una única frontera de
presentación** coherente con el corte de 768px, sin que ambas presentaciones sean visibles a la vez
en ninguna banda. El **umbral de 1024px del estado por defecto** (RF-06, AC-15) no contradice esta
regla: decide el estado inicial de la misma presentación, no alterna presentaciones. No aplica a
landing ni al panel de tarjetas, fuera de alcance.

**CL-10 — Limpieza con código cambiando.** Los artefactos a retirar por RF-15 pueden haber cambiado
o desaparecido por las ediciones manuales del usuario (hoy ya en HEAD `b61286a`, y seguirán
cambiando). El implementer **re-verifica primero** el código real; si un artefacto ya no existe, se
registra como «ya no aplicable» en lugar de buscarlo o recrearlo. Lo mismo aplica a las pruebas: si
una aserción ya está ajustada, se registra como «ya no aplicable» y no se toca de nuevo.

### Puntos abiertos

**Ninguno.** DP-01..DP-06 (DP-02 revisada a 768px; DP-06 añadida el 2026-10-16), CL-01, CL-03,
CL-05, la decisión sobre los enlaces, la validación diferida y la limpieza acotada están resueltos.
Cualquier detalle que cambie por las ediciones manuales se trata como CL-10 y se re-verifica al
implementar, sin reabrir la spec.

---

## 6. API afectada

### Lógica de versión de vista (`src/hooks/useBreakpoint.js`)

| Aspecto | Hoy | Objetivo (DP-04 + CL-01 + RF-07) |
|---|---|---|
| Props expuestas | `isMobile`, `isTablet`, `isDesktop`, `sidebarColapsada`, `toggleSidebar` | **`isMobile`, `isDesktop`, `sidebarColapsada`, `toggleSidebar`** |
| `isTablet` | `true` en 640–1023px | **No existe** |
| `isMobile` | `true` si <640px | **`true` si <768px** |
| `isDesktop` | `true` si ≥1024px | **`true` si ≥768px** (absorbe la banda intermedia) |
| Partición | Tres queries independientes: con un ancho fraccionario (p. ej. 767,5px, que no coincide con ningún borde) las tres pueden dar `false` | **Complementaria por construcción**: exactamente uno de los dos activo para cualquier ancho (fuente única de verdad; mecanismo a fijar en plan) |
| `sidebarColapsada` (sin preferencia válida) | `false` (expandida) en todas las bandas | **`true` en 768–1023px; `false` en ≥1024px** |
| `sidebarColapsada` (con preferencia válida) | Se restaura tal cual | Se restaura tal cual **en cualquier banda** |
| Contrato de preferencia válida | `null` cae en «expandida» por `?? false` (materializa un valor no elegido) | **Válida ⇔ booleano tras deserializar**; clave ausente, `null`, tipo no booleano o error ⇒ sin preferencia (RF-06) |
| Escritura de la preferencia | Se persiste el estado actual del hook | Se persiste **solo** la elección del usuario; no se materializa un estado por defecto de banda no elegido (RF-07) |
| Clave de persistencia | Una única clave | **Una única clave** (sin preferencias por banda) |
| Valor por defecto sin medición | `isDesktop = true` | sin cambios (CL-05) |
| `toggleSidebar` | Alterna el estado | Sin cambio de firma |

**Consumidores y pruebas a actualizar (según el estado real al implementar):**

| Elemento | Cambio esperado |
|---|---|
| `src/layout/DashboardLayout.jsx` | Deja de usar `isTablet` y el estado del menú de tablet; la banda 768–1023px cae en la rama de pantallas grandes; reserva el espacio de la navegación **desde 768px** (hoy el margen usa `lg:` = 1024px, dependencia de implementación de RF-05) y aplica los estados por defecto de RF-06 |
| `src/components/layout/*` (solo dashboard) | Ámbito de render por versión: navegación lateral en pantallas grandes; navegación inferior y menú superpuesto solo en móvil. `Header.jsx`/`Footer.jsx` quedan fuera |
| `src/hooks/useBreakpoint.test.js` | Dos versiones, contrato de exactamente 4 props, ausencia de `isTablet`, partición complementaria (incluido ancho fraccionario), estados por defecto de banda sin preferencia, contrato de preferencia válida (`null`/no booleano/error ⇒ sin preferencia), precedencia de la preferencia, no materializar defaults, cleanup de listeners |
| `src/layout/DashboardLayout.test.jsx` | Mocks de la lógica de versión de vista (sin `isTablet`), composición por rango, estado colapsado por defecto en 768–1023px, margen desde 768px, transiciones de resize, reutilización del mismo mock de preferencia |
| Pruebas de los componentes de layout | Ámbito de render por versión, no aparición de la composición tablet, retirada de la rama no-móvil del menú superpuesto y de su prop, **y corrección de los conteos de enlaces/focos de «4»/«5» a «3»/«4»** en las suites de layout (el código mantiene 3 enlaces; DP-06) |
| `src/App.test.jsx` | Regresión de rutas (sin cambios esperados de comportamiento) — prueba de RF-13 |
| Mock global de preferencia en la configuración de pruebas | **Sin cambios**: está en la raíz del repositorio (fuera de `src/`) y su valor actual (`undefined`) ya se interpreta como «sin preferencia» con el contrato de RF-07. Solo se tocaría si la implementación lo exige, y entonces se registra en §2 |

### Componentes de layout (props y estados)

| Componente | Props / estados | Efecto de esta spec |
|---|---|---|
| Navegación lateral (variante de escritorio) | `colapsada`, `alToggleColapso`, `alAbrirUserModal` | **Sin cambios de firma.** Cambia su ámbito: cubre toda la banda ≥768px y recibe el estado por defecto de la banda |
| Menú lateral superpuesto (drawer) | Hoy: `abierto`, `alCerrar`, `children`, `triggerRef`, `esMobile` | **Objetivo tras la limpieza:** rama móvil **incondicional**, se **retira `esMobile`**, el layout deja de pasarla. Se mantienen `abierto`, `alCerrar`, `children`, `triggerRef`. *(Retirar `esMobile` colisiona con la Tarea 2 de `plan.md`/`tasks.md` de la 008: se anota al abordar la 008.)* |
| Navegación inferior (móvil) | `itemActivo`, `alNavegar`, `alAbrirMenu`, `menuTriggerRef` | **Sin cambios**; exclusiva de móvil (ahora también en 640–767px) |
| Contenido de navegación compartido | `alAbrirUserModal`, `colapsada` | **No se modifica en esta spec**: ni el conjunto de enlaces vigente (3 en la navegación lateral), ni el nombre accesible en estado colapsado (deuda preexistente, RF-12), ni su cabecera JSDoc por el recuento de enlaces. **Sus pruebas sí se ajustan** al recuento real de 3 enlaces (DP-06) |
| Modal de cuenta | `abierto`, `alCerrar`, `triggerRef` | **Sin cambios.** En pantallas grandes es la **vía de acceso a Configuración** (ya navega a `/dashboard/configuracion`) |
| Layout del dashboard (estados) | `drawerAbierto` (tablet), `mobileMenuAbierto`, `userModalAbierto` | El estado ligado a tablet **se retira**; los otros dos permanecen |
| Contenido principal del layout | Clases de margen/padding/altura | Margen reservado **desde 768px**; se retira el padding superior sobrante y la altura restada a un header inexistente (RF-15, sin tocar `index.css`) |

---

## 7. Pruebas de Aceptación (criterios verificables)

> **Condición de validación (decisión del usuario):** las tareas se implementan mientras el usuario
> sigue editando código a mano. La **línea base ya está medida** (2026-10-16): **4 archivos fallan y
> 10 tests fallan** —9 de ellos por el desfase de conteo de enlaces laterales (4 vs 3)— y
> `DashboardLayout.test.jsx` no compila porque importa un módulo eliminado. Los cambios manuales
> previos del usuario ya están en HEAD (`b61286a`). Al completar **cada** tarea, el implementer
> informa la prueba relevante que haya podido ejecutar y marca explícitamente como **«pendiente de
> la validación diferida»** lo aplazado, sin duplicar registros. Quedan en la validación diferida
> **AC-16, AC-18 y AC-19**; **AC-17 (rutas) ya es ejecutable y pasa en la línea base**, y **no debe
> registrarse como pendiente**. La validación diferida se realiza **después de que el usuario
> confirme que terminó**, siempre contra esa línea base para atribuir fallos.
>
> **Nota sobre los 10 fallos de aserciones:** se corrigen dentro del alcance de pruebas de esta spec
> (DP-06) actualizando los conteos de enlaces/focos, **sin tocar el código fuente**; sus suites
> (`DashboardDrawer.test.jsx`, `SidebarNavContenido.test.jsx`, `SidebarResponsive.test.jsx`) deben
> quedar verdes al cerrar las tareas 3 y 5.

> **Qué es automatizable y qué no (matiz importante):** en jsdom no se calcula el layout real, así
> que los criterios de «sin solape», «sin desplazamiento horizontal» y «sin compresión» **no son
> automatizables**: se comprueban por **estructura/clases** en las pruebas y por **revisión visual**
> en el navegador. Los criterios sobre la lógica de versión de vista, la precedencia de la
> preferencia y la composición por versión sí lo son.

| ID | Escenario | Esperado | Verificación |
|---|---|---|---|
| AC-01 | Ancho 768px y 1023px, sin preferencia guardada válida | Versión «pantallas grandes» con navegación lateral **colapsada**; sin composición tablet | Test (estructura/clases) |
| AC-02 | Ancho 767px, 700px y 375px | Versión «móvil»; navegación inferior + menú; sin navegación lateral permanente | Test |
| AC-03 | Ancho 800px, sin preferencia guardada válida | Navegación lateral **presente y colapsada**; contenido sin solape (lo segundo, solo visual) | Test (presencia/clases) + revisión visual (solape) |
| AC-04 | Ancho 1024px y 1440px, sin preferencia guardada válida | Navegación lateral **expandida**; sin regresión | Test |
| AC-05 | Expansión manual en 768–1023px y recarga posterior | Se expande; la preferencia se guarda y **se respeta tras recargar** (CL-01, opción i) | Test (persistencia) + revisión visual (reacomodo sin solape) |
| AC-06 | Preferencia válida = colapsada, en 768–1023px y en ≥1024px | En ambas bandas manda la preferencia: colapsada | Test |
| AC-07 | Cargar en 1200px sin preferencia y pasar a 800–1023px | Se muestra **colapsada** (estado por defecto de la banda de destino), sin intervención del usuario (CL-04) | Test |
| AC-08 | Cargar en 800px sin preferencia y pasar a 1200px | Se muestra **expandida**; el estado por defecto de banda no se materializa como preferencia (RF-07) | Test |
| AC-09 | Preferencia ausente, `null`, de otro tipo o ilegible | Se trata como **sin preferencia** y se aplica el estado por defecto de la banda (`null` **no** equivale a expandida) | Test |
| AC-10 | Resize móvil → pantallas grandes con el menú superpuesto abierto | El menú se cierra; el foco **no se pierde** (se traslada al control de la navegación lateral) | Test (si es estable) o revisión manual registrada |
| AC-11 | Resize pantallas grandes → móvil con modal de cuenta abierto | El modal **permanece** con foco y trampa de foco intactos; la preferencia guardada no se altera | Test |
| AC-12 | Recorrido del **conjunto vigente de secciones** en ambas versiones | En pantallas grandes: los **3 enlaces actuales** de la navegación lateral; la sección Configuración (no enlazada en la lateral) se alcanza desde el **modal/banner del perfil** (`DashboardUserModal`, que no se modifica). En móvil: los **4 enlaces actuales** de la navegación inferior más el acceso a «Menú». Existe vía visible y accesible por teclado para esos destinos; no se espera ni se exige ningún enlace nuevo en la navegación lateral | Test (destinos concretos, sin tautología) |
| AC-13 | Navegación por teclado en ambas versiones (Tab, Enter/Espacio, Esc) | Foco visible, orden lógico, trampa de foco y retorno de foco correctos, **en los puntos donde ya existen**. El nombre accesible de los enlaces en estado colapsado queda **fuera de alcance** (deuda preexistente, RF-12) y no se evalúa aquí. Los conteos de elementos enfocables de las pruebas se ajustan al contenido real (3 enlaces + avatar = **4**), sin cambios de comportamiento (DP-06) | Test |
| AC-14 | Contrato de la lógica de versión de vista | Exactamente `isMobile`, `isDesktop`, `sidebarColapsada`, `toggleSidebar`; `isTablet` no existe; **exactamente uno** de los dos valores de versión activo en cualquier ancho, incluido fraccionario | Test |
| AC-15 | Umbrales vigentes en el dashboard | Solo existen dos umbrales y con roles distintos: el **corte de versión de vista (768px)** y el **umbral del estado por defecto de la navegación lateral (1024px)**; ninguna regla asigna la banda 768–1023px a una versión tablet | Test (inspección de clases/reglas) |
| AC-16 | Limpieza (RF-15), según el estado real al implementar | No quedan la rama no-móvil del menú superpuesto, el estado del layout ligado a tablet, la altura restada a un header inexistente ni el padding superior sobrante; no hay referencias colgantes ni **props sin uso de la composición tablet** (p. ej. `esMobile`); las pruebas que validaban lo eliminado están retiradas o actualizadas; se respetan las exenciones de RF-15 (`index.css`/**variable de altura**, contenido de navegación compartido y recuento de enlaces **intactos**) | Inspección de código; se reporta dentro de la validación diferida |
| AC-17 | Rutas del dashboard (RF-13) | Rutas y secciones preservadas, sin añadir ni eliminar. **Ejecutable antes**: no entra en la validación diferida; en la línea base medida (2026-10-16) `src/App.test.jsx` **pasa** (no figura entre los archivos que fallan) | `src/App.test.jsx` |
| AC-18 | **Validación diferida**, tras el aviso del usuario | Escaneo del diff, `npm test` y `npm run build`, contra la **línea base medida antes de tocar código**; cada resultado se reporta como pass/fail o **no ejecutado**; incluye la comprobación visual/Fluid Glass de AC-19 (si no hay navegador, se registra como «no ejecutado»); la línea base de la suite global queda **abierta a lo que se mida** (la 008 no se sanea aquí) y no se exige «suite completa en verde» como requisito inventado | Reporte explícito |
| AC-19 | Revisión visual manual en navegador (768px, 800px, 1023px, 1024px, 1440px, móvil y móvil en horizontal) | Sin solape ni desplazamiento horizontal; superficies translúcidas ≤3 por vista (en pantallas grandes, 2: navegación lateral + modal); sin blobs en el dashboard; contraste legible con y sin blur | Revisión manual (no automatizable) |

> `MEMORY.md` se actualiza **después** de la validación diferida, sin declarar verde nada que no se
> haya medido.

---

## 8. Dependencias Técnicas

- **Breakpoints nativos del proyecto** (`sm` 640px, `md` 768px, `lg` 1024px en Tailwind v4). El
  **corte de versión de vista** es **768px** (DP-02 revisada) y el **umbral del estado por defecto**
  es **1024px**; ambos deben quedar declarados con roles distintos (RF-02, RF-06, AC-15).
- **Partición complementaria de la versión de vista** (RF-02, RF-11): hoy son tres consultas
  independientes y un ancho fraccionario puede dejarlas todas en `false`. Debe derivarse de una
  única fuente de verdad; el mecanismo concreto se fija en el plan.
- **Espacio reservado de la navegación lateral desde 768px** (RF-05): hoy el margen del contenido
  usa `lg:` (1024px); debe reservarse desde 768px sin solape ni desplazamiento horizontal.
- **Lógica de versión de vista existente y sus consumidores**, que hoy trabajan con tres bandas y un
  flag de tablet; hay que reducirla a dos, añadir los estados por defecto de banda sin
  materializarlos como preferencia y actualizar pruebas y mocks (DP-04, CL-01, RF-07).
- **Persistencia única de la preferencia** (una sola clave), hoy leída en el inicializador del hook
  y escrita al cambiar el estado; el contrato de «preferencia válida» (RF-07) **debe sobrevivir al
  primer render** para que RF-06 y RF-07 sean observables (AC-08, AC-09).
- **Configuración de pruebas**: el mock global de preferencia está en la raíz del repositorio
  (fuera de `src/`) y devuelve `undefined`, que con el contrato de RF-07 significa «sin
  preferencia»; **no requiere cambios**.
- **Artefactos a limpiar (RF-15), según el estado real al implementar:** rama no-móvil del menú
  lateral superpuesto (y su prop), estado del layout ligado a tablet, altura restada a un header
  inexistente y padding superior sobrante del contenido principal. **`src/styles/index.css` y la
  variable de altura quedan fuera**: pasada de limpieza posterior.
- **Acceso a Configuración en pantallas grandes:** el **modal/banner del perfil**
  (`DashboardUserModal`), que ya navega a `/dashboard/configuracion` y **no se modifica**. Es la vía
  que sustituye al enlace lateral retirado por el usuario; el sidebar mantiene 3 enlaces (DP-06).
- **Exenciones de limpieza**: el contenido de navegación compartido (conjunto de enlaces vigente y
  nombre accesible en estado colapsado) y el recuento de enlaces de su cabecera JSDoc no se tocan;
  la actualización de cabeceras se limita a retirar tablet y el flag eliminado en la lógica de
  versión de vista y en el layout. **Sus pruebas sí se ajustan** al recuento real (3 enlaces;
  DP-06).
- **Cabeceras JSDoc del alcance** (`useBreakpoint.js`, `DashboardLayout.jsx` y componentes de layout
  afectados), que hoy documentan el contrato viejo (flag de tablet / banda tablet).
- **Inconsistencia de documentación a registrar (no resolver aquí):** `AGENTS.md` cita
  `.agents/response-rules.md` y `.agents/file-header-template.md` y esas rutas **no existen**; las
  reales están bajo `.agents/skills/...` (con el typo «hearder» en el nombre de la plantilla). Si la
  implementación toca cabeceras, hay que **avisar de esta inconsistencia antes de seguirla**.
- **Línea base medida y validación diferida.** Medida el 2026-10-16 antes de tocar código:
  **4 archivos fallan / 17 pasan (21)** y **10 tests fallan / 226 pasan (236)**. Fallan
  `DashboardLayout.test.jsx` (no compila: importa `DashboardHeader`, eliminado) y, por aserciones
  desfasadas de conteo de enlaces laterales (4 vs 3), `DashboardDrawer.test.jsx` (5),
  `SidebarNavContenido.test.jsx` (2) y `SidebarResponsive.test.jsx` (3). Los cambios manuales del
  usuario ya están en HEAD (`b61286a`) y **seguirá editando**. Por eso: cada tarea informa la prueba
  relevante que pueda ejecutar; los 10 fallos de aserciones se corrigen en el alcance de pruebas
  (DP-06) sin tocar la fuente; y la validación diferida (AC-16, AC-18 y AC-19) se aplaza hasta que el
  usuario confirme que terminó. AC-17 (rutas) ya es ejecutable y pasa, y no se registra como
  pendiente.
- **Fuera de dependencia:** la spec 008 no se sanea ni se cierra aquí (DP-05).
- **Sin dependencias nuevas:** no se añaden librerías, frameworks de animación ni herramientas de
  build.

---

## 9. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Materializar el estado por defecto de banda como preferencia guardada | Se rompe CL-01: el usuario vería el estado equivocado en la otra banda | RF-07 + AC-08/AC-09; escribir la preferencia solo ante una elección del usuario y tratar `null`/no booleano como «sin preferencia» |
| Partición de versión no complementaria (anchos fraccionarios, zoom) | Ninguna versión activa o ambas a la vez: composición rota o duplicada | RF-02/RF-11; derivar de una única fuente de verdad (dependencia de §8) y cubrir con AC-14 |
| Margen del contenido sin reservar desde 768px | Solape navegación/contenido en 768–1023px (el fallo que se quiere cerrar) | RF-05 + dependencia de §8; comprobación visual en AC-19 |
| Teléfonos grandes en horizontal caen en «pantallas grandes» (≥768px) | Navegación lateral en un dispositivo móvil | Consecuencia aceptada (CL-02); con el estado colapsado por defecto y preferencia respetada, validar visualmente |
| Ediciones manuales del usuario (ya en HEAD `b61286a`) y en curso durante la implementación | Conflictos, artefactos ya retirados o renombrados, pruebas duplicadas; tests en rojo ajenos a esta spec | Re-leer el código antes de cada cambio; cambios mínimos y localizados; CL-10; atribución contra la línea base medida (236/21) |
| Fallos preexistentes atribuidos a esta spec | Conclusiones falsas sobre regresiones | Línea base medida el 2026-10-16 (4 archivos / 10 tests en rojo: 1 archivo que no compila y 10 aserciones de conteo de enlaces); reporte pass/fail/no ejecutado (AC-18) |
| El ajuste de aserciones (4→3) se confunde con permiso para tocar la fuente | Se cambiaría la navegación por una decisión no aprobada | DP-06: el ajuste es **solo de pruebas**; el código del sidebar mantiene 3 enlaces y no se restituye Configuración |
| Validación diferida aplazada se pierde | Cambios sin verificar | Registrar en cada tarea lo «pendiente de la validación diferida» (sin duplicar) y ejecutar AC-16, AC-18 y AC-19 al recibir el aviso del usuario; AC-17 se ejecuta antes y no se aplaza |
| El nombre accesible en estado colapsado se toma como incumplimiento de esta spec | Expectativas falsas sobre los criterios de aceptación y cambios no aprobados en el contenido de navegación | RF-12 y §2 declaran esa carencia **deuda preexistente fuera de alcance** (registrada para abordarla más adelante); AC-13 excluye ese punto de su evaluación |
| Limpieza (RF-15) se extiende a lo que el usuario está tocando o a `index.css` | Conflictos y cambios fuera de alcance | Lista explícita de «qué NO se toca» en RF-15; exclusión de `index.css`/**variable de altura**; CL-10 |
| La limpieza se interpreta como permiso para refactorizar | Cambios no pedidos, regresiones fuera de alcance | Limitar la limpieza a lo que queda sin uso por eliminar la versión tablet |
| Se «restaura» el enlace de Configuración por considerarlo un defecto | Se contradice una decisión del usuario | RF-10/AC-12 y §2 declaran el conjunto de enlaces vigente; la ausencia es intencionada y Configuración se alcanza desde el modal de perfil |
| Las pruebas siguen afirmando «4 enlaces» y se «arreglan» tocando la fuente | Se modifica la navegación para que pase un test | DP-06: se ajustan solo las aserciones (4→3 y 5→4 focos); las suites del alcance deben quedar verdes al cerrar las tareas 3 y 5 |
| Se sigue la convención de cabeceras citada en `AGENTS.md` sin verificarla | Cabeceras creadas en rutas inexistentes o inconsistentes | Registrar la inconsistencia (§8) y avisar antes de seguirla |
| Estado real distinto de lo documentado (MEMORY vs análisis vs ediciones) | Decisiones sobre supuestos falsos | Tratar el código como fuente de verdad al implementar; registrar la discrepancia (§3) sin asumir |
| Alcance del dashboard "contamina" landing o tarjetas | Regresiones en vistas fuera de alcance | Alcance cerrado en §2 (incluido excluir `Header.jsx`/`Footer.jsx`); cualquier ajuste ajeno exige spec propia |
| La unificación se interpreta como permiso para añadir superficies | Se superan los límites Fluid Glass | RF-14 (superficies ≤2 en pantallas grandes del dashboard) y AC-19 |

---

## 10. Próximos Pasos

1. **Revisión de esta spec: aprobada** por el usuario el 2026-10-16, con la decisión **DP-06** registrada ese mismo día (ajuste de pruebas 4→3 sin tocar la fuente; Configuración se alcanza desde el modal de perfil). No quedan puntos abiertos.
2. **Generación de `plan.md` + `tasks.md`** desde esta spec aprobada, con: corte de 768px, umbral de estado por defecto de 1024px, contrato de 4 props y partición complementaria, contrato de preferencia válida, estados por defecto de banda, espacio reservado desde 768px y tareas de limpieza (RF-15, sin `index.css`).
3. **Línea base medida** (Tarea 1, 2026-10-16): **4 archivos fallan / 17 pasan (21)** y **10 tests fallan / 226 pasan (236)**; los 10 fallos de aserciones son de conteo de enlaces laterales, y `DashboardLayout.test.jsx` no compila. Es la referencia de atribución.
4. **Implementación** en orden, informando en cada tarea la prueba relevante ejecutada (incluida AC-17, que no se aplaza) y marcando como «pendiente de la validación diferida» lo aplazado, sin interferir con las ediciones manuales del usuario. Incluye el ajuste de aserciones 4→3 (DP-06), que debe dejar verdes las suites de layout.
5. **Validación diferida** (AC-16, AC-18 y AC-19) cuando el usuario avise que terminó: escaneo del diff, `npm test`, `npm run build` y revisión visual en 768px, 800px, 1023px, 1024px, 1440px, móvil y móvil en horizontal; reporte pass/fail/no ejecutado, con `MEMORY.md` actualizado después.
6. **Posterior (fuera de esta spec):** cuando se aborde la 008, anotar en sus documentos la obsolescencia declarada en §3 (incluidas las Tareas con `esMobile` en su `plan.md`/`tasks.md`) y hacer la pasada de limpieza de `index.css`/`--header-height`.
