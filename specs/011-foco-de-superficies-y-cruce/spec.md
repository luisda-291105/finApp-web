# Spec 011 — Devolución de foco de las cuatro superficies modales y traslado de foco al cruzar el corte de 768px (corrección del hueco de la spec 010)

**Estado: borrador**
**Carpeta:** `specs/011-foco-de-superficies-y-cruce/` (renombrada el 2026-10-16 desde
`specs/011-retorno-de-foco-drawer/`, nombre que quedó estrecho al ampliarse el alcance a las cuatro
superficies modales y al cruce del corte).
**Fecha:** 2026-10-16 (revisión de alcance por respuestas del usuario a Q1–Q5; **cierre de decisiones
Q-01–Q-04**). **Revisión del reviewer (2026-10-17):** veredicto «**cambios necesarios**» con
**18 hallazgos** (6 bloqueantes y 12 no bloqueantes); **todos aplicados** en esta versión. Los
bloqueantes 1, 5 y 6 se aplicaron como se indicó; los hallazgos **2, 3, 4 y 12** quedaron cerrados por
**decisión del usuario** (tabla siguiente).
**Origen:** hueco de la **spec 010** (finalizada el 2026-10-16) en el comportamiento de foco de las
superficies modales y en el traslado de foco del cruce de versión de vista. Esta spec **no reabre**
la 010: corrige el defecto y la referencia como origen.
**Basada en:** Spec 010 (regla de retorno de foco: **RF-08**, **RF-16**, **DP-05** y
**AC-02/AC-08**; plan §2.3-**M4**), Spec 009 (dos versiones de vista y cruce del corte de 768px:
**RF-09**, **AC-10/AC-11**), Spec 007 (creó `DashboardDrawer` y `DashboardUserModal`), Spec 004
(`ModalTarjeta`, retorno de foco propio y trampa manual), Spec 005/006 (ubicación actual de los
componentes).
**Petición inicial del usuario:** «Race condition en `DashboardDrawer.jsx` (pérdida de foco si
`triggerRef` no está asignado)». Instrucción: «especifica la corrección».

**Decisiones del usuario — alcance (2026-10-16, no se vuelven a preguntar):**

| Pregunta | Respuesta aplicada |
|---|---|
| **Q1 — Alcance** | **(c) LAS CUATRO SUPERFICIES**: `DashboardDrawer`, `DashboardUserModal` (patrón M4 como referencia), **`AuthModal`** (hoy sin retorno de foco pese a RF-08 de la 010) y **`ModalTarjeta`** (restaura el foco sin validar `isConnected`/`body`). |
| **Q2 — Cruce del corte de 768px** | **La 011 DEBE garantizar el traslado de foco** cuando la ventana cruza en cualquier sentido con una superficie/panel en uso. Amplía el alcance al **efecto de cruce de `DashboardLayout.jsx`**. **(Precisado por el hallazgo 5 → DP-05: con panel abierto, el traslado es incondicional; sin panel, lectura simétrica.)** |
| **Q3 — Pruebas** | **Ampliar las suites existentes** de cada superficie, `DashboardLayout.test.jsx` (cruce) y la transversal `cierreDeModales.test.jsx`. La 011 **amplía**; no reemplaza ni reescribe esas suites. |
| **Q4** | **Subsumida por Q1**: `AuthModal` y `ModalTarjeta` entran. |
| **Q5 — Trazabilidad** | **NO se toca la 010** (finalizada). La relación con la 010 se documenta **dentro de la 011**. |

**Decisiones del usuario — cierre de esta revisión (2026-10-16, no se vuelven a preguntar):**

| Pregunta | Respuesta aplicada | Dónde se refleja |
|---|---|---|
| **Q-01 — Respaldo de `AuthModal` en el área pública** | **Opción (b): primer control enfocable de la vista** cuando no exista disparador al que volver, **en la vista pública persistente (la landing)**. En `/login` **no aplica** (su vista no tiene ningún control enfocable): ver **H2**. | RF-05 (respaldo por versión de vista), RF-10, CL-01, CL-16, AC-06 |
| **Q-02 — `/login`** | **NO exento.** Al cerrar, el foco debe acabar en la **vista de destino**, con la lista ordenada de RF-15 (**control estable por versión de vista**; si el destino no es el dashboard, el primer control enfocable), tras la navegación. | RF-15, CL-04, CL-17, AC-22, AC-23 |
| **Q-03 — Chequeo de `focus()`** | **Se comprueba el resultado y la cadena continúa**: si `document.activeElement` no es el candidato, se pasa al siguiente hasta lograr el foco o agotar la cadena. | RF-04, RF-05, CL-09, AC-24 |
| **Q-04 — Alcance del cruce** | **Lectura simétrica**, precisada por el hallazgo 5 en **dos caminos**: (a) con panel abierto, el traslado al control lateral es **incondicional**; (b) sin panel abierto, se traslada si el elemento enfocado pertenecía a la navegación de la versión que se desmonta. En ambos sentidos. | RF-12, RF-13, RF-14, CL-07, AC-12, AC-13 |
| **Renombrado** | Carpeta renombrada a `specs/011-foco-de-superficies-y-cruce/`. | Cabecera de esta spec |

**Decisiones del usuario — revisión del reviewer (2026-10-17, no se vuelven a preguntar):**

| Hallazgo | Decisión aplicada | Dónde se refleja |
|---|---|---|
| **H2 — Respaldo «primer control enfocable» en `/login`** | El respaldo «primer control enfocable» se **limita** a la **vista pública persistente (la landing)**. En `/login` **no existe** ningún control enfocable fuera del modal (`PaginaLogin.jsx:20-31`): rige la **limitación explícita** de RF-05 y manda el destino de RF-15. | RF-05, RF-10, CL-01, CL-04(a), CL-16, AC-06, AC-22, §4.3 |
| **H3 — Destino del cierre que navega** | **Criterio único: control estable por versión de vista** (móvil → botón «Menú» del `BottomNav`; ≥768px → control de la navegación lateral) y, si la vista de destino no es el dashboard, el **primer control enfocable** de esa vista. Lista de preferencia **ordenada**; unifica RF-15, §4.6 y AC-22. | RF-05, RF-15, §4.6, AC-22, AC-23 |
| **H4 — Respaldo por versión de vista (`useBreakpoint`) + coordinación con la 012** | El respaldo usa la **versión de vista del hook `useBreakpoint` ya existente** (**sin props ni refs nuevos**, sin una lectura nueva de `matchMedia`) y la **012 amplía su alcance** para dejar **coherente** el **stub local** de `DashboardUserModal.test.jsx` (`innerWidth=1024` en `:48` con `matches=false` en `:49`, bloque `:34-44`/`:47-50`). **Dependencia bidireccional** (§3.4 de la 012) con **orden acordado: 012 primero y la 011 se re-mide después**. La **011 no reescribe** esa suite. | RF-05, RF-09, §3, §8, §9, §10, AC-06, AC-17 |
| **H12 — `ModalTarjeta` migra al patrón M4** | `ModalTarjeta` pasa a la **transición abierta → cerrada** con marca `estuvoAbiertoRef` (sin `focus()` indeseado por los efectos dobles de `StrictMode`). | RF-06, RF-11, §4.4, CL-11, CL-14 |

**Preguntas abiertas: ninguna.** Todas las decisiones de comportamiento están cerradas (§11). Lo único
que depende del plan son los **mecanismos** (§2.3); si alguno exigiera props o refs nuevos, se
devuelve como pregunta antes de cerrar el plan.

**Re-verificación (DP-21):** todas las referencias `archivo:línea` de esta spec se re-comprobaron
contra el estado real del repositorio el **2026-10-16** (incluidas las nuevas: mapa de rutas de
`App.jsx:26-50`, cierre con navegación de `PaginaLogin.jsx:26-30`, `StrictMode` de `src/main.jsx:16`,
controles de destino `SidebarResponsive.jsx:26-35,39-61`, `BottomNav.jsx:39-82`,
`Header.jsx:42,56-73`). El usuario edita a mano: las referencias del borrador anterior que estaban
desfasadas se corrigieron (§4) y **deben volver a re-verificarse antes de escribir el plan y antes de
implementar**.

**Re-verificación tras la revisión del reviewer (2026-10-17):** se volvieron a comprobar las
referencias cuyo sentido cambia en esta versión: `PaginaLogin.jsx:20-31` (**sin** controles enfocables
fuera del modal: un `<main>` con dos `<p>` y el `AuthModal`), `DashboardLayout.jsx:115` y `:127`
(drawer y modal de cuenta reciben **el mismo** `bottomNavMenuRef`), `DashboardLayout.test.jsx:316-329`
(el test vigente abre el menú **programáticamente**, con el foco en `body`, y aun así espera el control
lateral), `DashboardUserModal.test.jsx:34-44,:48-49` (stub local incoherente: `innerWidth=1024` con
`matches=false`) y `:265-290` (caso del respaldo lateral), `DashboardUserModal.jsx:83-99` (cadena M4 y
respaldo lateral en `:96`), `ModalTarjeta.jsx:49-61` (restauración en la **limpieza** del efecto),
`vitest.setup.js:14-26,:29-33` (stub global incoherente) y `DashboardDrawer.jsx:72-78,:81-90,:92`.
También se re-verificaron las suites citadas: `DashboardDrawer.test.jsx:341-384` («restauración de foco
al cerrar», casos en `:342` y `:363`), `PanelTarjetas.test.jsx:138-165` (los dos casos «devuelve el
foco al activador»), `cierreDeModales.test.jsx:312-337` («abrir «Cuenta» desde el menú…») y
`DashboardLayout.test.jsx:294-312` (firmas de props).

**Re-verificación de la coordinación con la 012 (2026-10-17, coherencia interna):** el stub **local**
del modal de cuenta es `mockMatchMedia` en `:34-44`, el default «pantallas grandes» en `:47-50`
(`innerWidth = 1024` en `:48`, `matchMedia = mockMatchMedia(false)` en `:49`), el comentario
«pantallas grandes (≥768px)» en `:46` y los ganchos `beforeEach`/`afterEach` en `:52`/`:54-57`; el
**stub global** es `:14-26` y su `innerWidth` `:28-33`. **Convención de citas cruzadas (2026-10-17):**
las referencias a la **012** se hacen por **sección, RF, DP y AC** (p. ej. «§3.4 de la 012», «§7.1-B de
la 012», «DP-12 de la 012», «AC-13 de la 012»), porque los números de línea de ambos documentos se
desplazan en cada revisión (DP-21); las citas con líneas se reservan a **archivos de código y pruebas**.

---

## 1. Propósito

El comportamiento de foco de las superficies modales del proyecto se escribió de forma **no
uniforme**: una superficie (el modal de cuenta) recibió la corrección completa de la spec 010 y las
otras tres quedaron con variantes incompletas del mismo problema, mientras que el cruce del corte de
768px garantiza el traslado de foco **solo en una dirección**. Hay cinco defectos y un hueco, con dos
causas comunes:

1. **No hay marca de «estuvo abierto» + captura condicional + cadena sin validar (drawer).** En
   `DashboardDrawer` la lógica de devolución se ejecuta al **montarse cerrado** y no valida el estado
   del candidato: el dashboard monta el drawer cerrado en móvil y el foco acaba en el botón «Menú»
   **sin interacción del usuario** (dos veces en desarrollo por `StrictMode`), mientras que el mismo
   estado «cerrado» es un **no-op silencioso** si `triggerRef.current` no está asignado. Esa
   asimetría según una condición de orden/tiempo es lo que el usuario describe como *race condition*.
2. **Retorno de foco ausente (modal de autenticación).** `AuthModal` **no captura** el elemento
   activo al abrir ni lo **restaura** al cerrar, pese a que RF-08 de la 010 cubre las cuatro
   superficies: al cerrarlo, el foco queda donde el navegador lo deje (habitualmente `body`).
3. **Restauración sin validación (detalle de tarjeta).** `ModalTarjeta` restaura el activador con
   `.focus()` **sin** comprobar si sigue conectado al documento ni excluir `body`: si el activador ya
   no existe, el foco se pierde sin respaldo.
4. **Respaldo estable atado a una sola versión de vista (modal de cuenta).** Su respaldo es el
   control de la **navegación lateral**, que **no existe en móvil**: si fallan los dos candidatos
   principales, en móvil no se enfoca nada.
5. **Cruce del corte sin garantía en un sentido.** El efecto de cruce del layout **solo** cubre
   «móvil → pantallas grandes con el menú abierto». Al cruzar **«pantallas grandes → móvil»**, si el
   elemento enfocado pertenecía a la navegación lateral (que se desmonta), el foco queda en `body`.
   Hoy ese hueco está **enmascarado** por el robo de foco del punto 1 (el drawer enfocaba el botón
   «Menú» por accidente).
6. **Cierre que cambia de ruta sin destino de foco.** En `/login`, `AuthModal` se monta **abierto** y
   su cierre **navega** a `/dashboard` o `/` (`PaginaLogin.jsx:26-30`): nadie sitúa el foco en la
   vista de destino y el foco queda en `body`.

**Propósito de esta spec:** que la devolución de foco sea **una sola regla, determinista, única por
cierre y nunca al vacío** en **las cuatro superficies modales**; que **ninguna** toque el foco cuando
no ha estado abierta; que la cadena de candidatos **compruebe el resultado real del foco** y
**continúe** si el candidato no quedó enfocado; que el **cierre que cambia de ruta** deje el foco en
la **vista de destino**; y que el **cruce del corte de 768px traslade el foco sin pérdida en ambos
sentidos** —sin cambios visuales, sin props nuevas y sin dependencias nuevas.

**Qué NO es esta spec:** no es un rediseño de las superficies, ni una limpieza de sus hexadecimales
heredados (excluidos por la 010, DP-03), ni un refactor de la navegación, ni la implementación de la
animación de salida pendiente (DP-07 de la 010), ni una gestión de foco de la navegación ordinaria
(§2.2).

---

## 2. Alcance

### 2.1 Incluido

- **Regla común de devolución de foco** aplicable a las **cuatro superficies modales**
  (`DashboardDrawer`, `DashboardUserModal`, `AuthModal`, `ModalTarjeta`): guarda de «no actuar en el
  montaje cerrado», captura **incondicional** del elemento activo al abrir y **cadena determinista de
  candidatos validados** al cerrar —con **comprobación del resultado** del `.focus()` (Q-03): si el
  candidato no queda enfocado, la cadena **continúa**— y **control estable equivalente** según la
  versión de vista.
- **Respaldo por versión de vista** (Q-01, H4): botón **«Menú»** en móvil del dashboard, control de la
  **navegación lateral** en ≥768px y **primer control enfocable de la vista** en la **landing** (vista
  pública **persistente**) cuando no exista disparador al que volver. En **`/login`** no hay ningún
  control enfocable fuera del modal, así que ese respaldo **no aplica** y rige la **limitación
  explícita** (H2). La **versión de vista** se obtiene del hook **`useBreakpoint` ya existente**, sin
  props ni refs nuevos.
- **`DashboardDrawer`**: paridad funcional con el patrón **M4** ya vigente en `DashboardUserModal`
  (misma semántica, mismas exclusiones, mismo respaldo estable).
- **`DashboardUserModal`**: respaldo estable **válido también en móvil** (hoy solo contempla la
  navegación lateral de ≥768px). Sin cambios de firma.
- **`AuthModal`**: incorporación de la **captura y la devolución de foco** que hoy no existen
  (RF-08 de la 010), con el respaldo del punto anterior (Q-01), **sin** props nuevas, **sin** cambios
  de aspecto ni de hexadecimales.
- **`ModalTarjeta`**: migración al **patrón M4** (H12): devolución de foco gobernada por la
  **transición abierta → cerrada** (marca `estuvoAbiertoRef`), validación de candidato (`isConnected`,
  exclusión de `body`, resultado efectivo del foco) y **respaldo** cuando el activador ya no existe,
  conservando su trampa manual, sus props y su contenido.
- **Cierre que cambia de ruta** (Q-02, H3): colocación del foco en la **vista de destino** una vez
  renderizada la nueva vista, con la **lista ordenada de preferencia** de RF-15 (**control estable por
  versión de vista** primero; si la vista de destino no es el dashboard, el **primer control
  enfocable** de esa vista) y comportamiento definido si no existe ninguno.
- **Traslado de foco en el cruce del corte de 768px** en **ambos sentidos** (Q-04), incluido el efecto
  de cruce de `DashboardLayout.jsx`: en el camino «**panel abierto ⇒ se cierra**» el traslado al
  control lateral es **incondicional**; **sin** panel abierto rige la **lectura simétrica** (solo si el
  elemento enfocado pertenecía a la navegación que se desmonta).
- **Las pruebas** de todo lo anterior, **ampliando** las suites existentes de cada superficie, la del
  layout y la transversal `cierreDeModales.test.jsx` (Q3), con la **trampa de foco real**.
- La **cabecera JSDoc** de los archivos de producto tocados (contrato de foco documentado).
- La **trazabilidad** con la spec 010 y la 009, **dentro de esta spec** (Q5: la 010 no se toca).

### 2.2 Fuera de alcance (explícito)

- **Reabrir o modificar la spec 010** (finalizada): no se tocan sus `spec.md`, `plan.md`, `tasks.md`
  ni se añaden notas dentro de `specs/010-*/` (Q5). La relación se documenta aquí (§3).
- **Cambiar el aspecto, el marcado visual, las animaciones, los tokens, los hexadecimales heredados
  o las superficies de vidrio de las cuatro superficies.** La corrección es **solo de foco y teclado**
  (la 010 ya dejó el aspecto y los hex fuera de alcance, DP-03). Los hexadecimales heredados de
  `AuthModal` **no se migran**.
- **Implementar la animación de salida** del drawer o de cualquier superficie (observación ya
  registrada en la 010, DP-07).
- **Gestión de foco de la navegación ordinaria:** la colocación de foco en la vista de destino se
  limita al **cierre de una superficie modal que navega** (RF-15). Las navegaciones ordinarias del
  usuario (enlaces del `Header`, ítems del `BottomNav`, enlaces de la navegación lateral, redirección
  «no encontrado») **NO** reciben gestión de foco en esta spec.
- **Reescribir las suites existentes.** La 011 **amplía**; los **ajustes de stub** ya decididos
  (`DashboardUserModal.test.jsx`, H4) son de la **012** (`specs/012-correcciones-menores/spec.md`
  §7.1-B y DP-12). La 011 **NO** modifica esa suite, ni sus stubs, ni ningún caso vigente para
  «hacerlo pasar».
- **Cambiar contratos de props**: `{ abierto, alCerrar, children, triggerRef? }` (drawer),
  `{ abierto, alCerrar, triggerRef? }` (modal de cuenta), `{ abierto, modoInicial, alCerrar }`
  (`AuthModal`), `{ tarjeta, onCerrar }` (`ModalTarjeta`). **Sin props nuevas** y **sin** refs nuevas
  desde los consumidores.
- **Rutas, contenido de páginas, datos (`src/data/tarjetasDemo.js`), `TRIAL_ACTIVO`, endpoints,
  backend y autenticación.** El mapa de rutas de `App.jsx:26-50` **no se modifica** (solo se usa como
  contexto del destino del foco) y **no** se añaden controles ni marcado a `PaginaLogin` para fabricar
  un destino de foco: en `/login` la falta de controles enfocables se declara como **limitación**
  (H2, RF-05).
- **El corte de 768px, el contrato de dos versiones de vista de la spec 009** (dos versiones, 4
  props, partición complementaria), la composición del layout, el orden de montaje de las
  superficies y el contenido de la navegación (3 enlaces + «Menú»).
- **Dependencias nuevas** y cualquier librería de foco o de animación.
- **Superficies del área pública** distintas de `AuthModal`; **`BottomNav`, `SidebarResponsive`,
  `SidebarNavContenido` y la navegación** no se modifican (solo se reutilizan como destino de foco
  estable).

### 2.3 Puntos que el plan debe resolver sin cambiar el alcance

- **Forma de implementación de la regla común** (pieza compartida vs. repetición controlada en las
  cuatro superficies): es decisión del plan. En cualquiera de las dos formas, el **comportamiento
  observable debe ser el mismo** (RF-06) y **no se añaden props ni cambios de firma**.
- **Mecanismo del traslado en el cruce «pantallas grandes → móvil»** sin props nuevas: el layout
  necesita saber si el elemento con el foco pertenecía a la navegación de la versión que se desmonta
  **antes** de que el navegador lo sustituya por `body`. El mecanismo (p. ej. recordar el último
  control enfocado dentro de la navegación de la versión que desaparece) se fija en el plan; si el
  plan concluye que hace falta una prop, un `ref` adicional desde los consumidores o cualquier cambio
  de contrato, **debe devolverse como pregunta antes de cerrar el plan**, no asumirse (constitución
  §2). De la **estabilidad de ese mecanismo en jsdom** depende la verificabilidad de **AC-12(ii)** y
  **AC-13** (si no es estable, se registran como revisión no realizada).
- **Mecanismo de la colocación del foco en la ruta de destino** (RF-15): debe resolverse **después**
  del render de la nueva vista y **una sola vez** por cierre-navegación. El plan debe **elegir y
  justificar** uno de los **mecanismos admisibles** (todos sin props ni refs nuevos y sin cambiar el
  mapa de rutas): **(a)** un **módulo/utilidad compartida** que registre la intención de colocar el
  foco y la consuma la vista de destino al montarse; **(b)** un **efecto de nivel de ruta**
  (página/layout de destino) que lea esa marca; **(c)** un **estado de navegación** (`location.state`)
  escrito por el cierre y leído por la vista de destino. Si el elegido exigiera props, refs o cambios
  de contrato, **debe devolverse como pregunta antes de cerrar el plan**.
- **Versión de vista del respaldo** (H4): se toma del hook **`useBreakpoint` ya existente**; el plan
  decide si cada superficie lo consume directo o a través de una utilidad interna, **sin** props
  nuevas ni cambios de firma.
- **Forma de la migración de `ModalTarjeta` al patrón M4** (H12): el plan decide cómo mover la
  devolución de foco de la **limpieza del efecto** (`ModalTarjeta.jsx:57-60`) a un efecto gobernado por
  la **transición abierta → cerrada**, conservando captura al abrir, foco inicial en el contenedor,
  bloqueo de scroll y trampa manual, y garantizando que los casos vigentes
  (`PanelTarjetas.test.jsx:138-165`, suite de `ModalTarjeta`) sigan verdes.
- **Selectores concretos**: el del respaldo estable por versión de vista (DP-04) y el del **primer
  control enfocable** (definido en RF-05/RF-15 como «primer control enfocable en el orden del
  documento, excluida la superficie que se cierra y el contenedor del diálogo») se fijan en el plan,
  sin añadir marcado ni atributos nuevos a los componentes.

---

## 3. Relación con specs anteriores

| Spec | Relación |
|---|---|
| **010** (finalizada, **no se toca**) | **Origen del hueco.** Su **RF-08** exige devolver el foco al disparador o a un control estable equivalente y prohíbe dejarlo en `body` o en un nodo desmontado; su **DP-05** fija los controles estables («Menú» en móvil; control lateral en ≥768px); su plan **§2.3-M4** define la cadena que **solo** se aplicó a `DashboardUserModal`. Su **AC-08** es el criterio objetivo. Esta spec escribe el requisito que la 010 dejó incompleto en tres superficies y en un respaldo. |
| **009** | Fija las dos versiones de vista, el corte único de 768px y el traslado de foco **sin pérdida** en las recomposiciones (**RF-09**, **AC-10** móvil → pantallas grandes con el menú abierto; **AC-11** pantallas grandes → móvil con el modal de cuenta abierto). La 011 **no altera** ese contrato y lo **completa** en la dirección no cubierta y en los cruces sin panel abierto (§5.C, Q-04). |
| **007** | Creó `DashboardDrawer` y `DashboardUserModal`; de ahí viene el `triggerRef` **opcional** del drawer. |
| **004** | `ModalTarjeta` gestiona su propio retorno de foco (hoy sin validación) y su trampa manual de Tab (que **se conserva**). |
| **012** (borrador; **coordinación acordada el 2026-10-17**) | Toca `useBreakpoint` (una sola fuente de medición), `AuthModal` (una clase muerta), `LogMovimientos` y —**ampliación decidida por el usuario**— deja **coherente** el **stub local** de `DashboardUserModal.test.jsx` (`innerWidth=1024` en `:48` con `matches=false` en `:49`; bloque `:34-44`/`:47-50`) y el **stub global** de `vitest.setup.js` (`matches` derivado de `innerWidth`, `:14-26`/`:28-33`). **Dependencia bidireccional (H4), no una dependencia de una sola dirección:** **(011 → 012)** la 011 resuelve el respaldo **por versión de vista** con `useBreakpoint` (RF-05/RF-09), así que necesita que exista **una sola** fuente de medición: si el hook midiera dos cosas distintas según el momento, el respaldo podría elegir el control equivocado en el primer render y sus suites no podrían afirmar una versión de vista única. **(012 → 011)** la 012 deja coherente ese entorno de medición (hook + stub global) y alinea el **stub local** del modal de cuenta, que la 011 necesita para poder afirmar el respaldo en ≥768px. **Orden acordado: se implementa la 012 primero y la 011 se re-mide después** contra el estado resultante (no se implementa ni se planifica antes). Registrado en la **012**: su **§3.4** (coordinación con la 011), su **§7.1-B** (infraestructura de pruebas), su **DP-12** y su **AC-13**. **Resolución de la contradicción:** el enunciado anterior de esta tabla —que la 011 «no depende» de la 012— queda **sustituido** por esta dependencia bidireccional, y la **012** deja constancia recíproca en su **§3.4** («Contradicción ya resuelta por la 011»). Las citas cruzadas entre ambas specs se hacen por **sección/RF/DP/AC**, no por números de línea. **La 011 no toca `specs/012-*/` ni el código de la 012**, y la 011 **no reescribe** la suite del modal de cuenta. |
| **011 (esta)** | Corrige el foco de las cuatro superficies, el cierre que navega y el traslado del cruce; **no** cambia ninguna API pública, ni rutas, ni datos, ni el aspecto. |

---

## 4. Diagnóstico y causa raíz (evidencia re-verificada)

> Las líneas se comprobaron el **2026-10-16** contra el repositorio. El usuario sigue editando
> código: **re-verificar antes de implementar**. Las referencias del borrador anterior eran
> aproximadas en `AuthModal` y `ModalTarjeta` y se han corregido.

### 4.1 `DashboardDrawer` — montaje cerrado que roba el foco y cadena sin validar

`src/components/layout/DashboardDrawer.jsx` (159 líneas):

```text
:59      @param {React.RefObject<HTMLElement>} [props.triggerRef]   // prop OPCIONAL
:72-78   useLayoutEffect(() => {
:73       if (!abierto) return;
:75       if (!triggerRef?.current) { previousActiveElementRef.current = document.activeElement; }
:78     }, [abierto, triggerRef]);                                  // captura CONDICIONAL
:81-90   useEffect(() => {
:82       if (abierto) return;                                      // «solo al cerrar» (no distingue «nunca abierto»)
:85       if (triggerRef?.current) { triggerRef.current.focus(); }
:87       else if (previousActiveElementRef.current instanceof HTMLElement) { ...focus(); }
:90     }, [abierto, triggerRef]);
:92      if (!abierto) return null;                                  // el early return va DESPUÉS de los efectos
```

Hechos:

- **No hay marca de «estuvo abierto»**: `if (abierto) return` confunde «nunca se abrió» con «se acaba
  de cerrar». En el **montaje cerrado** (caso real del dashboard) el efecto **sí** actúa.
- **Captura condicional** (`:75`): si el disparador está asignado no se guarda nada; si desaparece, no
  hay segundo candidato.
- **Sin validación del candidato**: no hay `isConnected` ni exclusión de `body`, y **tampoco** se
  comprueba el resultado del `.focus()` (Q-03); un nodo desconectado o inerte hace que `.focus()` sea
  un no-op silencioso.
- **Sin respaldo estable**: si ningún candidato sirve, no se enfoca nada.

**Contexto real:** `DashboardLayout.jsx:111-119` monta el drawer **siempre** que `isMobile`, con
`abierto={mobileMenuAbierto}` (`:113`) y `triggerRef={bottomNavMenuRef}` (`:115`); `mobileMenuAbierto`
arranca en `false` (`:44`); `BottomNav.jsx:70-82` monta el botón «Menú» (`ref={menuTriggerRef}` `:72`,
`aria-label="Abrir menú"` `:78`) **antes** que el drawer, así que su `ref` ya está asignado cuando
corre el efecto. Con `StrictMode` (`src/main.jsx:16`) el efecto se ejecuta dos veces en desarrollo.

### 4.2 `DashboardUserModal` — patrón M4 correcto salvo el respaldo en móvil

`src/components/layout/DashboardUserModal.jsx`:

```text
:60      const estuvoAbiertoRef = useRef(false);                    // guarda de «estuvo abierto»
:69-72   useLayoutEffect(() => { if (!abierto) return; previousActiveElementRef.current =
         document.activeElement; }, [abierto]);                     // captura SIEMPRE
:75-100  useEffect(() => { ... if (!estuvoAbiertoRef.current) return;
:83-93     candidatos = [triggerRef?.current, previousActiveElementRef.current] validados
           (instanceof HTMLElement, !== document.body, isConnected)
:96        const controlEstable = document.querySelector('aside[role="navigation"] button');
:97-99     if (controlEstable instanceof HTMLElement) controlEstable.focus();
:102     if (!abierto) return null;
```

**Defecto:** el respaldo de `:96` es el control de la **navegación lateral**, que **no existe en
móvil** (en móvil se monta `BottomNav`, no el `aside`). Si fallan los dos candidatos principales en
móvil, no se enfoca nada y el foco queda donde esté (habitualmente `body`), incumpliendo el «control
estable equivalente: botón «Menú» en móvil» de DP-05 de la 010. Es la **misma familia de hueco** que
el drawer, con otro síntoma; también carece de la comprobación del resultado del `.focus()` (Q-03).

### 4.3 `AuthModal` — retorno de foco ausente (referencias corregidas)

`src/components/domain/modales/AuthModal.jsx` (243 líneas). El borrador anterior citaba `:48-68` de
forma aproximada; el estado real es:

```text
:49      const panelRef = useRef(null);                 // ÚNICO ref del componente
:58      useCierreConEsc({ activo: abierto, zIndex: 50, alCerrar })
:61      useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar })
:63-66   useEffect(() => { setModo(modoInicial); setMensaje(""); }, [modoInicial, abierto])
:68      if (!abierto) return null;
:123-126 capa exterior (backdrop con guarda de destino)
:138-147 botón «X» con aria-label «Cerrar ventana de acceso»
```

**Hecho:** **no existe** captura de `document.activeElement` ni devolución de foco en ningún punto
del componente: no hay `previousActiveElementRef`, ni `estuvoAbiertoRef`, ni llamada a `.focus()` al
cerrar. Al cerrarse, el navegador coloca el foco en `body` (o donde lo deje la navegación del
cierre). **Incumple RF-08 de la 010**, que cubre las cuatro superficies.

**Contextos de uso verificados:**

- `PaginaInicio.jsx:37-41` lo monta cerrado y **permanece montado**: el disparador (botones del
  `Header` `:56-73`, de `Hero`/`CtaSection`, o el botón flotante «?» de `:44-51`) sigue en el DOM al
  cerrar → la cadena acaba en el disparador. **Respaldo del área pública (Q-01):** si el disparador
  ya no existe, el destino es el **primer control enfocable de la vista** (en la landing, el enlace
  del logotipo `Header.jsx:42` o las acciones de `:56-73`).
- **`PaginaLogin.jsx:26-30` lo monta siempre abierto y su vista no tiene ningún control enfocable.**
  La página es un `<main>` con dos `<p>` y el propio `AuthModal` (`PaginaLogin.jsx:20-31`,
  re-verificado el 2026-10-17): **no hay** ningún enlace, botón ni campo fuera del modal. Su cierre
  **navega** (`navigate(TRIAL_ACTIVO ? "/dashboard" : "/")`). Por tanto (**H2**): no hay disparador al
  que volver, el elemento capturado al montar no es útil (el activo es el propio documento) y el
  respaldo «primer control enfocable de la vista» **no aplica en `/login`** (no existe tal control):
  se declara la **limitación explícita** de RF-05 y **manda el destino** de la navegación
  (RF-15/AC-22).
- **En la landing sí existe ese respaldo** (Q-01): el enlace del logotipo `Header.jsx:42` y las
  acciones de `:56-73` están fuera del modal y permanecen montados.

### 4.4 `ModalTarjeta` — restauración sin validar (referencias corregidas)

`src/components/domain/modales/ModalTarjeta.jsx` (171 líneas). El borrador citaba `:59` como
«restauración»; el bloque real es `:49-61`:

```text
:44-45   refDialogo, refActivador
:49      useEffect(() => {
:50        if (!tarjeta) return undefined;              // cerrado ⇒ no captura
:51        refActivador.current = document.activeElement;   // captura al abrir
:55        refDialogo.current?.focus();                     // foco inicial al contenedor
:57-60     return () => { document.body.style.overflow = ""; refActivador.current?.focus?.(); };
:61      }, [tarjeta]);
:71-84   atraparTab (trampa MANUAL de Tab/Shift+Tab, RF-12 de la 010: se conserva)
```

**Hecho:** la restauración de `:59` invoca `.focus()` sobre el activador **sin** comprobar
`isConnected`, **sin** excluir `document.body`, **sin** comprobar el resultado del foco (Q-03) y
**sin respaldo** alguno. Si el activador se desmontó entre la apertura y el cierre, el foco se
pierde. Además, el efecto depende de `[tarjeta]`: un cambio de tarjeta activa (hoy no alcanzable
desde la interfaz, porque la trampa cubre el conjunto de tarjetas) volvería a ejecutar la
restauración como si fuera un cierre.

**Foco indeseado en el montaje y en `StrictMode` (H12, migración decidida).** La restauración vive en
la **limpieza** del efecto (`ModalTarjeta.jsx:57-60`). Con `StrictMode` (`src/main.jsx:16`) el montaje
ejecuta `setup → cleanup → setup`, de modo que un `ModalTarjeta` montado **con tarjeta activa** dispara
un `.focus()` sobre el activador **en la limpieza de prueba**: un foco que nadie pidió. Por eso el
usuario decidió que `ModalTarjeta` **migre al patrón M4**: la devolución se gobierna por la
**transición abierta → cerrada** (marca `estuvoAbiertoRef`), no por la limpieza del efecto ni por un
cambio de la dependencia `[tarjeta]`; la captura al abrir, el foco inicial en el contenedor y el
bloqueo de scroll se conservan.

### 4.5 Cruce del corte de 768px — garantía en una sola dirección

`src/layout/DashboardLayout.jsx`:

```text
:62-72   useEffect(() => {
:63        if (isMobile || !mobileMenuAbierto) return;      // SOLO móvil → pantallas grandes, SOLO con el menú abierto
:64        setMobileMenuAbierto(false);
:66-68     const controlNavegacionLateral = document.querySelector('aside[role="navigation"] button');
:70        controlNavegacionLateral.focus();
:72      }, [isMobile, mobileMenuAbierto]);
```

Hechos:

- **Móvil → pantallas grandes** (menú abierto): el efecto cierra el menú y traslada el foco al
  control lateral. Cubierto por la 009 (RF-09/AC-10) y por la prueba real
  `DashboardLayout.test.jsx:316-329`, que abre el menú **programáticamente**
  (`propsDe(BottomNav).alAbrirMenu()`) con el foco en `body` y **aun así** espera el control lateral:
  el traslado de ese camino es **incondicional** (no depende de dónde estuviera el foco) y así queda en
  RF-12(a). El drawer, al desmontarse, **no** interviene.
- **Móvil → pantallas grandes sin el menú abierto**: si el foco estaba en la **navegación inferior**
  (un ítem del `BottomNav` o el propio botón «Menú»), esa barra **se desmonta** y ningún efecto
  traslada el foco: queda en `body`. Requerido por la lectura simétrica de Q-04 (RF-12).
- **Pantallas grandes → móvil**: no hay ningún efecto que traslade el foco. Si el elemento enfocado
  pertenecía a la `SidebarResponsive` (`aside` `:26`, `role="navigation"` `:33`, botón de
  logo/colapso `:39-61`), al desmontarse el foco queda en `body`. Hoy ese hueco está **enmascarado**
  por el robo de foco del drawer (§4.1): al montarse cerrado, el drawer coloca el foco en el botón
  «Menú» «por accidente». Al aplicar RF-01, el enmascaramiento desaparece y el hueco se vuelve
  observable.
- **La 009 exige que el modal de cuenta permanezca** al cruzar en cualquier sentido (RF-09), con su
  foco y su trampa intactos (`DashboardLayout.test.jsx:331-343`): el traslado del cruce **no debe**
  interferir con un modal abierto.
- **Con el foco en el contenido principal**, el cruce no desmonta el elemento enfocado: no hay nada
  que trasladar y moverlo sería **robar el foco al usuario**.

### 4.6 Cierre que cambia de ruta (`/login`) — foco sin destino

`src/pages/PaginaLogin.jsx:26-30` monta `AuthModal` **abierto** y su `alCerrar` es
`() => navigate(TRIAL_ACTIVO ? "/dashboard" : "/")`. El mapa de rutas (`App.jsx:26-50`) resuelve
`/dashboard` con `DashboardLayout` (guardia `TRIAL_ACTIVO`) y `/` con `PaginaInicio`.

**Hecho:** el cierre navega y **nadie** sitúa el foco en la vista de destino: el foco queda en `body`.

**Criterio único de destino (H3).** El foco se coloca en la **vista de destino** con la **lista
ordenada** de RF-15 —la misma de RF-05 aplicada a la vista nueva—, sin dos criterios en competencia:

1. **Control estable por versión de vista** de la vista de destino: en `/dashboard`, botón **«Menú»**
   de la navegación inferior en móvil (`BottomNav.jsx:70-82`) o control de la **navegación lateral** en
   ≥768px (`SidebarResponsive.jsx:39-61`).
2. Si la vista de destino **no** es el dashboard (p. ej. `/`, la landing), el **primer control
   enfocable** de esa vista (enlace del logotipo `Header.jsx:42` o acciones de `:56-73`; también el
   botón flotante `PaginaInicio.jsx:44-51`).
3. Si no existiera ninguno **o** ninguno quedara enfocado: **limitación explícita** de RF-05, sin
   marcado ficticio.

Como las dos rutas de destino del cierre de `/login` (según `TRIAL_ACTIVO`) ofrecen destino por (1) o
por (2), la colocación del foco es **exigible** (Q-02) y el caso **no** se declara exento.

### 4.7 Causa raíz

**Dos causas, seis síntomas.** (1) La devolución de foco se escribió **por superficie** y no como una
regla única: `DashboardDrawer` la implementó como «efecto sobre `abierto`» con captura condicional y
sin validación; `AuthModal` no la implementó en absoluto; `ModalTarjeta` la implementó sin validar el
candidato; solo `DashboardUserModal` recibió el patrón completo (M4) en la T4/T5 de la 010, y su
respaldo no contempla la versión móvil. (2) El **traslado de foco** se implementó solo para la
dirección en la que un panel superpuesto se cierra (móvil → pantallas grandes), y **solo con el menú
abierto**; la dirección contraria, los cruces sin panel abierto y el **cierre que navega** quedaron
sin garantía (y el primer caso, enmascarado por el robo de foco del síntoma 1).

### 4.8 Honestidad de alcanzabilidad (sin exagerar)

| Defecto | ¿Reproducible hoy en la app? | Alcance honesto |
|---|---|---|
| **D1** robo de foco del drawer al montarse cerrado | **Sí**: el dashboard monta el drawer cerrado con `triggerRef` asignado; se ve al cargar el dashboard en móvil. Dos `focus()` en desarrollo (`StrictMode`), uno en producción | Defecto **real** |
| **D2** pérdida de foco del drawer si el disparador desaparece | **No reproducible desde el dashboard actual** (el botón «Menú» vive mientras el drawer está montado); **real por contrato del componente** (`triggerRef` es opcional y el disparador puede desmontarse con el drawer montado: cerrar el menú al abrir «Cuenta» desmonta el avatar) | Defecto **latente** |
| **D3** `AuthModal` sin retorno de foco | **Sí**, en la landing: cerrar el modal con Esc, «X» o clic fuera deja el foco en `body`; el disparador sigue en el DOM y podía recuperarlo | Defecto **real** |
| **D4** `ModalTarjeta` restaura sin validar | **Real por contrato**; hoy el activador (tarjeta del grid/acordeón) sigue montado, así que no se reproduce en la app; sí es reproducible en prueba (nodo retirado) | Defecto **latente** |
| **D5** respaldo en móvil del modal de cuenta | **Solo alcanzable** si `triggerRef.current` y el elemento previo capturado son inválidos a la vez (hoy el layout siempre pasa el botón «Menú») | Defecto **latente** |
| **D6** cruce con el foco en la navegación de la versión que se desmonta (ambos sentidos, con o sin panel abierto) | **Sí**, pero **hoy enmascarado** por D1 en la dirección escritorio → móvil; en móvil → escritorio sin menú abierto no hay enmascaramiento (se ve directo) | Defecto **real** |
| **D7** `/login`: el cierre navega y el foco queda en `body` | **Sí** (ruta `/login` con el modal abierto), en móvil y en escritorio | Defecto **real** |

No se declara ninguna reproducción en navegador en esta fase: la evidencia es **lectura de código** y
comportamiento de jsdom (que ya permite la trampa real gracias al andamiaje de la 010,
`vitest.setup.js:47-83`).

---

## 5. Requisitos Funcionales (EARS)

### A. Regla común de devolución de foco (las cuatro superficies)

- **RF-01 — Evento — Sin tocar el foco en el montaje cerrado.** **CUANDO** una superficie modal se
  monte **cerrada** —o se vuelva a renderizar cerrada **sin haber estado abierta antes**—
  **EL SISTEMA NO DEBE** cambiar `document.activeElement` ni invocar `focus()` sobre ningún elemento.
  En particular, **NO DEBE** enfocar el disparador al montarse cerrada, y el mismo estado («cerrado»)
  **NO DEBE** producir resultados distintos según si el disparador está asignado o no.

- **RF-02 — Estado — Una única devolución por cierre, y ninguna mientras permanezca cerrada.**
  **CUANDO** una superficie pase de **abierta a cerrada** **EL SISTEMA DEBE** ejecutar la devolución
  de foco **exactamente una vez** por transición. **MIENTRAS** permanezca cerrada **EL SISTEMA NO
  DEBE** volver a mover el foco, aunque el componente se re-renderice o cambie la **identidad** de su
  disparador o de su callback de cierre. El doble montaje de efectos de `StrictMode`
  (`src/main.jsx:16`) **NO DEBE** producir dos devoluciones ni dos robos de foco.

- **RF-03 — Evento — Captura incondicional al abrir.** **CUANDO** una superficie pase de cerrada a
  **abierta** **EL SISTEMA DEBE** guardar `document.activeElement` **siempre** (con independencia de
  si el disparador está asignado), de forma **sincrónica respecto al commit** (antes de que la trampa
  de foco enfoque el contenedor del panel). La captura **NO DEBE** depender de que falte el
  disparador, y el valor capturado **NO DEBE** usarse como destino único ni saltarse la validación de
  RF-04.

- **RF-04 — Ubicuo — Cadena determinista de candidatos, con comprobación del resultado del foco.**
  Al cerrarse, **EL SISTEMA DEBE** resolver el destino del foco con una **cadena determinista y
  siempre en el mismo orden**: **(1)** el disparador (el `ref` del disparador cuando exista, o el
  control que abrió la superficie); **(2)** el elemento activo capturado al abrir (RF-03); **(3)** un
  **control estable equivalente** de la **versión de vista actual** (RF-05). El sistema **DEBE**
  intentar el `.focus()` de cada candidato en ese orden y **DEBE** detenerse en el **primer** que
  cumpla **todas** estas condiciones: ser `instanceof HTMLElement`, **no** ser `document.body`, estar
  **conectado** (`isConnected === true`) **y quedar efectivamente enfocado** tras el intento
  (`document.activeElement === candidato`). **SI** un candidato conectado **no** queda enfocado (nodo
  **`disabled`**, elemento dentro de un subárbol **`inert`**, o cualquier otro caso en que `.focus()`
  no deje el foco en él) **EL SISTEMA DEBE** continuar con el siguiente candidato hasta lograr el foco
  o agotar la cadena (Q-03). El orden **NO DEBE** depender del tiempo ni de qué
  candidato esté asignado en un momento dado más allá de estas condiciones.

- **RF-05 — Ubicuo — Nunca `body` ni un nodo desconectado; respaldo por versión de vista.**
  **EL SISTEMA NO DEBE** dejar el foco en `document.body` ni invocar `focus()` sobre un nodo
  **desconectado**. **SI** ningún candidato de RF-04 logra el foco **EL SISTEMA DEBE** trasladarlo a
  un **control estable equivalente de la versión de vista actual**, en este orden de preferencia:

  | Versión de vista | Control estable equivalente |
  |---|---|
  | **Dashboard móvil** | Botón **«Menú»** de la navegación inferior (`BottomNav.jsx:70-82`) |
  | **Dashboard ≥768px** | Control de la **navegación lateral** (`SidebarResponsive.jsx:39-61`) |
  | **Área pública con vista persistente (la landing)** | **Primer control enfocable de la vista** (Q-01) |

  **En `/login` este respaldo NO aplica (H2):** su vista no tiene ningún control enfocable fuera del
  modal (`PaginaLogin.jsx:20-31`), así que se declara la **limitación explícita** y manda el destino de
  la navegación (RF-15). **EL SISTEMA NO DEBE** inventar un control ni añadir marcado para cumplir con
  el respaldo.

  El «primer control enfocable» **DEBE** entenderse como el primer elemento enfocable en el orden del
  documento, **excluida** la superficie que se cierra y el contenedor del diálogo (selectores reales
  de foco: enlaces, botones, campos y elementos con `tabindex` ≥ 0). **SI** la vista no ofreciera
  **ningún** control estable (p. ej. una vista que desaparece al cerrar, §6.1 CL-17) **EL SISTEMA
  DEBE** registrarlo como limitación explícita y **NO DEBE** crear marcado, controles ni atributos
  ficticios para simular un destino. El respaldo **NO DEBE** depender de la identidad del disparador
  y **NO DEBE** introducir props nuevas ni cambiar la firma de ningún componente: la **versión de
  vista** se obtiene del hook **`useBreakpoint` ya existente** (H4), sin props ni refs nuevos.

- **RF-06 — Ubicuo — Una sola regla para las cuatro superficies.** Las devoluciones de foco de
  `DashboardDrawer`, `DashboardUserModal`, `AuthModal` y `ModalTarjeta` **DEBEN** ser funcionalmente
  **equivalentes** (guarda de «estuvo abierta», captura incondicional, cadena validada con
  comprobación del resultado y respaldo estable), de modo que dos superficies del mismo tipo **NO**
  resuelvan el mismo problema de dos maneras distintas. **`ModalTarjeta` DEBE** migrar al mismo
  contrato (H12): su devolución de foco se gobierna por la **transición abierta → cerrada** (marca
  `estuvoAbiertoRef`), no por la limpieza de su efecto. La forma de implementación (pieza compartida
  o repetición controlada) es decisión del plan (§2.3); el comportamiento observable **DEBE** ser el
  mismo en cualquiera de las dos.

- **RF-07 — Ubicuo — Sin props nuevas ni cambios de firma.** La corrección **NO DEBE** añadir props a
  ninguna de las cuatro superficies, ni `refs` nuevas desde sus consumidores, ni cambiar la firma de
  `DashboardLayout`, `PanelTarjetas`, `PaginaInicio` ni `PaginaLogin`. **NO DEBE** modificarse el
  corte de 768px, el contrato de dos versiones de vista de la 009 (RF-09/AC-11) ni el mapa de rutas.

### B. Aplicación por superficie

- **RF-08 — Ubicuo — `DashboardDrawer` con paridad M4.** `DashboardDrawer` **DEBE** cumplir RF-01 a
  RF-05: guarda de «estuvo abierto» (el cierre no actúa si nunca se abrió), captura **siempre** del
  elemento activo al abrir (hoy es condicional, §4.1) y cadena **validada con comprobación del
  resultado** y respaldo estable. El respaldo en móvil **DEBE** ser el **mismo control estable que ya
  fija la 010** —el botón **«Menú»** de la navegación inferior; en el dashboard disparador y respaldo
  son **el mismo nodo**, porque `DashboardLayout.jsx:115` y `:127` pasan el mismo `bottomNavMenuRef` al
  drawer y al modal de cuenta—. Que ese control exista **NO DEBE** reintroducir el enfoque en el
  **montaje cerrado** (RF-01) ni convertir la devolución en un no-op silencioso cuando el disparador no
  está asignado: el respaldo es un **destino de la cadena**, no una excusa para actuar sin transición.

- **RF-09 — Ubicuo — `DashboardUserModal` con respaldo válido en ambas versiones de vista.** El modal
  de cuenta **DEBE** mantener el patrón M4 y, además, **DEBE** resolver su respaldo estable según la
  **versión de vista actual** (hook `useBreakpoint` ya existente, H4) y **DEBE** comprobar el resultado
  de cada intento de foco (RF-04), de modo que en **móvil** el respaldo sea el botón **«Menú»** de la
  navegación inferior (hoy solo contempla el control de la navegación lateral, `:96`, inexistente en
  móvil). Su firma **NO DEBE** cambiar y el caso «`triggerRef` ausente o vacío» **DEBE** seguir
  funcionando.

  **Estabilidad de su suite (coordinación con la 012, H4 — dependencia bidireccional).**
  `DashboardUserModal.test.jsx` fija su propio `matchMedia` con un **stub local incoherente**
  (`innerWidth=1024` en `:48` con `matches=false` en `:49`), de modo que su medición real es «móvil».
  Con RF-09, su caso de respaldo (`:265-290`, que espera el control de la navegación **lateral**) exige
  que ese stub sea **coherente**. Ese ajuste **no** lo hace esta spec: forma parte del **alcance
  ampliado de la 012** (§7.1-B y DP-12 de `specs/012-correcciones-menores/spec.md`) y el **orden
  acordado es 012 primero, la 011 se re-mide después** (§3.4 de la 012). Con él, el caso queda
  **verde**; la 011 **NO DEBE** reescribir esa suite ni tocar su stub.

- **RF-10 — Evento — `AuthModal` con captura y devolución de foco (cierre del hueco de RF-08 de la
  010).** **CUANDO** `AuthModal` se abra **EL SISTEMA DEBE** capturar el elemento activo (RF-03) y
  **CUANDO** se cierre **EL SISTEMA DEBE** devolver el foco al control que lo abrió, con la misma
  cadena y las mismas validaciones (RF-04/RF-05). **SI** el control que lo abrió ya no existe, el
  respaldo **DEBE** ser el correspondiente a la **vista pública persistente**: el **primer control
  enfocable de la vista** (Q-01; en la landing). **SI** la vista **no** ofrece ningún control enfocable
  —caso de `/login`, `PaginaLogin.jsx:20-31`, **H2**— **EL SISTEMA NO DEBE** inventar un destino: se
  declara la **limitación explícita** de RF-05 y, **CUANDO** ese cierre **cambie de ruta** (caso de
  `/login`) **EL SISTEMA DEBE** aplicar RF-15. Todo ello **SIN** props nuevas (el componente no recibe `triggerRef`), **sin**
  cambiar su contrato `{ abierto, modoInicial, alCerrar }`, **sin** alterar su aspecto, su marcado ni
  sus hexadecimales heredados, y **sin** afectar al reinicio de tab activo y mensaje que ya realiza al
  abrir (RF-11/AC-22 de la 010 se conservan).

- **RF-11 — Ubicuo — `ModalTarjeta` con candidato validado y patrón M4.** La restauración de foco de
  `ModalTarjeta` **DEBE** gobernarse por la **transición abierta → cerrada** (marca `estuvoAbiertoRef`,
  H12) —**no** por la limpieza del efecto ni por un cambio de la dependencia `[tarjeta]`—, **DEBE**
  validar cada candidato antes de darlo por bueno (`instanceof HTMLElement`, **no** `document.body`,
  `isConnected` **y** resultado efectivo del foco) y **DEBE** disponer de respaldo estable si el
  activador ya no existe (RF-04/RF-05). **EL SISTEMA NO DEBE** mover el foco en un **montaje con la
  tarjeta ya activa** ni en los efectos dobles de `StrictMode`: la captura al abrir y el foco inicial
  en el contenedor del diálogo se conservan, pero la devolución **solo** ocurre en un cierre real.
  **DEBEN** conservarse intactos su contrato `{ tarjeta, onCerrar }`, su contenido, su
  **trampa manual** de Tab/Shift+Tab (RF-12 de la 010) y su comportamiento de cierre por «X», Esc,
  clic fuera y gesto en móvil.

### C. Traslado de foco: cruce del corte de 768px y cierre que navega (Q2, Q-02, H3)

- **RF-12 — Evento — Móvil → pantallas grandes: dos caminos.** **CUANDO** la ventana cruce de móvil a
  pantallas grandes **EL SISTEMA DEBE** garantizar que el foco no se pierda, según el camino:

  **(a) Con panel superpuesto abierto (el menú):** **EL SISTEMA DEBE** cerrar el menú y **DEBE**
  trasladar el foco al **control equivalente de la versión de destino** (el control de la navegación
  lateral) **de forma incondicional**, con independencia de dónde estuviera el foco al cruzar (el caso
  vigente `DashboardLayout.test.jsx:316-329` abre el menú **programáticamente** y el foco está en
  `body`, y aun así espera el control lateral).

  **(b) Sin panel abierto:** **SI** el elemento que tenía el foco pertenecía a un control de la
  **versión de vista que se desmonta** (la navegación inferior: ítems del `BottomNav` o el botón
  «Menú») **EL SISTEMA DEBE** trasladarlo igualmente al control de la navegación lateral (lectura
  simétrica, Q-04). **SI** el elemento enfocado **sobrevive** al cruce, rige RF-14 y **NO DEBE** moverse
  el foco.

  La corrección del drawer **NO DEBE** alterar ninguno de los dos caminos y el drawer, al desmontarse,
  **NO DEBE** devolver el foco por su cuenta (el traslado pertenece al layout).

- **RF-13 — Evento — Pantallas grandes → móvil.** **CUANDO** la ventana cruce de pantallas grandes a
  móvil **EL SISTEMA DEBE** garantizar que el foco **no se pierda**: **SI** el elemento que tenía el
  foco pertenecía a un control de la versión de vista que se desmonta (la navegación lateral)
  **EL SISTEMA DEBE** trasladarlo al **control equivalente de la versión de destino** (en móvil, el
  botón **«Menú»** de la navegación inferior), **haya o no** un panel abierto **siempre que** el
  elemento enfocado pertenezca a esa navegación (Q-04). **SI** el foco está **dentro de una superficie
  que permanece abierta** al cruzar (el modal de cuenta, que sobrevive) rige **RF-14** y el traslado
  **NO DEBE** robarle el foco. **SI** el elemento destino no existe en ese momento **EL SISTEMA DEBE**
  usar otro control estable de la versión de destino y, en su defecto, aplicar la limitación explícita
  de RF-05. **EL SISTEMA NO DEBE** dejar el foco en `body` ni en un nodo desmontado.

- **RF-14 — Ubicuo — El cruce no roba el foco.** **MIENTRAS** el elemento que tiene el foco
  **sobreviva** al cruce —foco en el contenido principal, en un campo de formulario, o en una
  superficie **global** que permanece abierta con su propia trampa (el modal de cuenta, RF-09/AC-11 de
  la 009)— **EL SISTEMA NO DEBE** mover el foco. El traslado **solo DEBE** activarse por el
  **desmontaje** del elemento enfocado a causa del cruce (o por el cierre de un panel superpuesto que
  ya no aplica a la versión de destino), nunca por el mero cambio de versión de vista.

- **RF-15 — Evento — Cierre que cambia de ruta: el foco acaba en la vista de destino (Q-02, H3).**
  **CUANDO** el cierre de una superficie modal **cambie de ruta** (caso verificado: `AuthModal` en
  `/login`, cuyo cierre navega a `/dashboard` o `/`) **EL SISTEMA DEBE** colocar el foco en la **vista
  de destino**, **después del render de la nueva vista** y **una sola vez** por cierre-navegación,
  según esta **lista ordenada de preferencia** —la misma de RF-05 aplicada a la vista nueva: **un solo
  criterio, sin ambigüedad**—:

  1. **Control estable por versión de vista** de la vista de destino: en `/dashboard`, botón «Menú»
     de la navegación inferior en móvil (`BottomNav.jsx:70-82`) o control de la **navegación lateral**
     en ≥768px (`SidebarResponsive.jsx:39-61`).
  2. Si la vista de destino **no** es el dashboard (p. ej. `/`, la landing), el **primer control
     enfocable** de esa vista (§4.6).
  3. Si no existiera ninguno **o** ninguno quedara enfocado: **limitación explícita** de RF-05, sin
     crear marcado ni controles ficticios.

  **EL SISTEMA NO DEBE** intentarlo antes de que la vista de destino exista, **NO DEBE** repetirlo en
  re-renders posteriores y **NO DEBE** aplicarse a navegaciones ordinarias sin cierre de superficie
  (§2.2). **Mecanismos admisibles** para lograr «una sola vez y solo tras un cierre» **sin props ni
  refs nuevos**: **(a)** un **módulo/utilidad compartida** que registre la intención de colocar el foco
  y la consuma la vista de destino al montarse; **(b)** un **efecto de nivel de ruta**
  (página/layout de destino) que lea esa marca; **(c)** un **estado de navegación** (`location.state`)
  escrito por el cierre y leído por la vista de destino. El plan elige y justifica uno; si el elegido
  exigiera una prop o un `ref` nuevo, **debe devolverse como pregunta antes de cerrar el plan**
  (§2.3). Cuando la vista de origen **desaparece** al navegar, la cadena de RF-04/RF-05 **NO DEBE**
  dejar el foco en un nodo de esa vista (por tanto nunca en la superficie que se cierra): manda la
  colocación del destino. El caso **NO DEBE** declararse exento.

### D. Alcance, no-regresión, pruebas y documentación

- **RF-16 — Ubicuo — Sin cambios de contrato, rutas, contenido, datos ni diseño.** Las firmas de las
  cuatro superficies y del layout **DEBEN** mantenerse; las rutas, el contenido de las páginas,
  `TRIAL_ACTIVO`, los endpoints y los datos **NO DEBEN** cambiar; **NO DEBEN** introducirse
  hexadecimales, superficies translúcidas ni blobs nuevos; **NO DEBEN** añadirse dependencias; y
  **NO DEBE** alterarse el corte de 768px, el contrato de dos versiones de vista (009) ni el contenido
  de la navegación.

- **RF-17 — Ubicuo — Sin animaciones nuevas (`prefers-reduced-motion`).** La corrección **NO DEBE**
  añadir ni modificar animaciones, transiciones ni movimientos. **SI** al implementar se tocara alguna
  animación —hoy **no aplica**— **EL SISTEMA DEBE** respetar `prefers-reduced-motion` con
  `useReducedMotion` o el bloque CSS existente, sin añadir librerías.

- **RF-18 — Ubicuo — Pruebas que amplían las suites existentes, con la trampa real.** Las pruebas de
  esta corrección **DEBEN** añadirse a las suites **ya existentes** de cada superficie
  (`DashboardDrawer.test.jsx`, `DashboardUserModal.test.jsx`, `AuthModal.test.jsx`,
  `ModalTarjeta.test.jsx`), a `DashboardLayout.test.jsx` (cruce), a la transversal
  `cierreDeModales.test.jsx` y, para el cierre que navega, a `AuthModal.test.jsx` con `MemoryRouter`
  (origen → destino) o a `App.test.jsx` (ruta real `/login` → `/dashboard`), según dónde sitúe el plan
  la garantía; **ampliar sí, reescribir no**: se **añaden** casos y los casos vigentes **no** se
  modifican ni se debilitan (**criterio único**). La **única** excepción prevista —el **ajuste de
  stub** de `DashboardUserModal.test.jsx`— **no** la hace esta spec, sino la **012** (H4). Los stubs
  locales de las demás suites (`DashboardDrawer.test.jsx:34-54`, `AuthModal.test.jsx:20-43`,
  `ModalTarjeta.test.jsx:39-61`, `cierreDeModales.test.jsx:50-73`) **no** se tocan por esta corrección.
  Las
  suites **DEBEN** ejercer la **trampa de foco real** (sin sustituir `focus-trap-react`, sin `tabbable`
  mockeado y sin `displayCheck`), apoyándose en el andamiaje de geometría ya existente
  (`vitest.setup.js:47-83`), y **DEBEN** cubrir como mínimo: (a) el montaje cerrado no roba el foco en
  las cuatro superficies; (b) **una** devolución por cierre y **ninguna** repetición mientras
  permanezcan cerradas (incluido `StrictMode`); (c) la cadena con disparador **desconectado**,
  candidato **`body`**, candidato **`null`** y candidato **`disabled`/`inert`** → respaldo estable,
  nunca `body`, en las cuatro superficies; (d) `AuthModal` devolviendo el foco al disparador y, sin
  disparador, al **primer control enfocable de la vista** (landing); (e) `ModalTarjeta` con activador
  desconectado y **sin `focus()` indeseado en el montaje con tarjeta activa ni en `StrictMode`**;
  (f) el cruce del corte en **ambos** sentidos, **con** panel abierto (traslado incondicional) y **sin**
  él (lectura simétrica); (g) el cierre de `AuthModal` que **navega** → foco en la vista de destino;
  (h) la convivencia «Cuenta» desde el menú (010 AC-02).

- **RF-19 — Ubicuo — Documentación y trazabilidad.** Las cabeceras JSDoc de los archivos de producto
  tocados **DEBEN** reflejar el contrato de foco corregido (`@eventos`/`@estados`). La relación con la
  spec 010 **DEBE** documentarse **dentro de esta spec** (§3) y **NO DEBE** añadirse ninguna nota ni
  modificación en `specs/010-*/` (Q5). Antes de citar la convención de plantillas de cabecera, tener en
  cuenta la inconsistencia registrada en §8.

---

## 6. Casos Límite y Decisiones

### 6.1 Casos límite

- **CL-01 — Disparador ausente al cerrar (`triggerRef.current === null`).** La captura **DEBE**
  producirse igualmente (RF-03); al cerrar, la cadena cae al elemento capturado si es válido y, si no,
  al respaldo estable de la versión de vista (en la **landing**: el **primer control enfocable**, p. ej.
  el enlace del logotipo `Header.jsx:42`). Hoy, en el drawer, esta situación termina en un **no-op
  silencioso**. **En `/login` no hay respaldo posible** (su vista no tiene controles enfocables, H2):
  se declara la limitación y, al **cerrar navegando**, manda el destino (RF-15).
- **CL-02 — El disparador desaparece entre la apertura y el cierre.** Candidato **desconectado**: se
  descarta por `isConnected` **antes** de invocar `focus()` (RF-04/RF-05) y la cadena continúa. Casos
  reales: cerrar el menú al abrir «Cuenta» desmonta el avatar (CL-05); el activador de `ModalTarjeta`
  desmontado.
- **CL-03 — `triggerRef.current === document.body`.** `body` es un `HTMLElement` y su `focus()` es un
  no-op: **DEBE** excluirse explícitamente (RF-04/RF-05) y continuar la cadena. Es el caso que más
  fácilmente reaparece si se copia la lógica sin la condición `!== document.body`.
- **CL-04 — Apertura/cierre programáticos.** (a) `AuthModal` montado **abierto** desde el primer
  render (`PaginaLogin.jsx:26-30`): la captura ocurre al montar y el candidato capturado (`body` o
  vacío) **no** es válido; como la vista de `/login` **no** tiene controles enfocables (H2), el
  respaldo del área pública **no aplica** (queda la **limitación explícita**) y, al **navegar** el
  cierre, manda la colocación en la **vista de destino** (Q-02/RF-15, con su lista ordenada de
  preferencia). El caso **no** se declara exento, pero **tampoco** se le inventa un respaldo. (b) El drawer montado cerrado y abierto por un
  `setState` del padre: se rige por RF-01/RF-02. (c) El modal de tarjeta montado con una tarjeta ya
  activa: captura al montar y devolución al cerrar. (d) `AuthModal` montado cerrado en la landing y
  abierto por `setState`: se rige por RF-01/RF-03.
- **CL-05 — Convivencia con la apertura de «Cuenta» (010 T6/RF-13).** Al abrir «Cuenta» desde el menú,
  el layout cierra el menú (`DashboardLayout.jsx:52-55`) y el avatar disparador **se desmonta**.
  Cadena esperada del drawer: avatar **desconectado** → elemento previo capturado (si es válido) →
  **respaldo estable** (botón «Menú»). Mientras el modal está abierto, el foco pertenece **al modal**
  (010 RF-16) y el drawer **NO DEBE** robárselo (RF-08/RF-14).
- **CL-06 — Doble cierre (X + Esc) y cierres consecutivos.** Una segunda llamada al callback de cierre
  mientras la superficie sigue cerrada **NO DEBE** producir una segunda devolución de foco, ni errores,
  ni reactivar nada (RF-02). Con un callback controlado por el padre, la segunda pulsación ni siquiera
  encuentra la superficie montada; la prueba **DEBE** cubrir también el caso de un callback que **no**
  cambia el estado de apertura.
- **CL-07 — Cruce del corte, ambos sentidos y con o sin panel abierto (Q-04).** (a) **móvil →
  pantallas grandes** con el menú abierto: el drawer **se desmonta**; el cierre y el traslado al
  control lateral los hace el layout (`DashboardLayout.jsx:62-72`) y **no** el drawer, con traslado
  **incondicional** (RF-12(a); el caso vigente tiene el foco en `body` y aun así espera el control
  lateral). (b) **móvil → pantallas grandes sin el menú abierto** pero con el foco en la navegación
  inferior (botón «Menú» o un ítem): la barra **se desmonta** → traslado al control lateral
  (RF-12(b)). (c) **pantallas grandes → móvil con el foco en la navegación lateral y sin ningún panel
  abierto**: traslado al botón **«Menú»** (RF-13); hoy el foco quedaría en `body` (enmascarado por D1).
  (d) Cruce con el **modal de cuenta abierto** (que sobrevive al cruce): permanece con su foco y su
  trampa (009 AC-11) y el traslado **NO DEBE** robarle el foco (RF-14); **este** es el subcaso de
  convivencia, **no** el (c). El subcaso «panel abierto **con el foco fuera del modal**» **no existe
  hoy** (el modal acapara el foco con su trampa) y **no** se especifica. (e) Cruce con el foco en el
  **contenido principal** o en un **campo de formulario**: **no** se mueve el foco.
- **CL-08 — Re-ejecución del efecto con disparador de identidad nueva.** Si el consumidor entrega un
  objeto `ref` nuevo en cada render, el efecto se re-ejecuta con la superficie cerrada: **NO DEBE**
  mover el foco (RF-02). Hoy el drawer sí lo haría.
- **CL-09 — Candidato conectado pero no enfocable (Q-03, cerrado).** Un `HTMLElement` conectado puede
  aceptar la invocación de `.focus()` **sin** quedar enfocado. Casos **afirmados** (los únicos que se
  prometen): `disabled` y elementos dentro de un subárbol **`inert`**. **Regla exigida:** tras el
  intento, si `document.activeElement` **no** es ese candidato, la cadena **DEBE** continuar con el
  siguiente candidato (RF-04) y **SÓLO** si se agota la cadena se aplica el respaldo estable (RF-05);
  el foco **NO DEBE** terminar en `body`. Este caso **ya no queda abierto**. **Honestidad de alcance:**
  **no** se promete la variante «oculto/`aria-hidden`»: en jsdom un elemento oculto por CSS **sí**
  resulta enfocable (no hay layout), así que esa variante **no** es verificable aquí y **no** se
  aserta.
- **CL-10 — El elemento capturado vive dentro del panel que se desmonta.** El foco capturado pudo
  pertenecer al propio panel (p. ej. el avatar del menú): al desmontarse queda desconectado → mismo
  tratamiento que CL-02 (nunca `.focus()` sobre él).
- **CL-11 — Cambio de tarjeta activa sin cierre y montaje con tarjeta activa (`ModalTarjeta`, H12).**
  Hoy el efecto depende de `[tarjeta]` y la restauración vive en su **limpieza** (`ModalTarjeta.jsx:57-60`),
  así que (i) un cambio de tarjeta y (ii) los efectos dobles de `StrictMode` en un montaje **con
  tarjeta activa** ejecutarían la restauración como si fuera un cierre (foco indeseado en el
  activador). Con la migración al **patrón M4**, **NI** el cambio de tarjeta **NI** el
  montaje/desmontaje de prueba **DEBEN** producir una devolución de foco: solo la **transición real
  abierta → cerrada** (RF-11). El cambio de tarjeta no es alcanzable desde la interfaz actual (la
  trampa cubre el conjunto); el **montaje con tarjeta activa sí ocurre** en pruebas.
- **CL-12 — Ausencia de candidato de respaldo.** Si ni el disparador, ni el elemento capturado, ni el
  control estable equivalente son válidos (o no quedan enfocados tras los intentos), **EL SISTEMA NO
  DEBE** crear controles ficticios ni dejar el foco sobre un nodo desmontado; la limitación **DEBE**
  registrarse y probarse de forma explícita (RF-05).
- **CL-13 — `prefers-reduced-motion`.** **No aplica** por defecto: no se toca ninguna animación y la
  corrección **NO DEBE** añadir ninguna (RF-17). Se revisa solo si el plan decidiera tocar animación,
  lo que hoy no se prevé.
- **CL-14 — `StrictMode` (efectos dobles).** En desarrollo el montaje ejecuta los efectos dos veces:
  con la corrección, **cero** robo de foco en el montaje cerrado y **una** devolución por cierre en las
  cuatro superficies (RF-01/RF-02), verificable con un espía sobre `focus()` y el componente envuelto
  en `<StrictMode>`.
- **CL-15 — Código en movimiento.** El usuario edita a mano: si al implementar alguno de los defectos
  ya no está presente, se registra como «ya no aplicable» en lugar de recrearlo.
- **CL-16 — Respaldo del área pública = primer control enfocable (**solo en la landing**, Q-01/H2).**
  En la landing, ese control
  es el enlace del logotipo (`Header.jsx:42`) o la primera acción del `Header` (`:56-73`); si el
  candidato capturado (el disparador real: `Header`, `Hero`/`CtaSection` o el botón flotante
  `PaginaInicio.jsx:44-51`) **ya es** el primer control enfocable, la cadena lo usa como candidato
  (1)/(2) y no se produce doble efecto. El respaldo **NO DEBE** apuntar a un nodo de la superficie que
  se cierra ni al contenedor del diálogo, y **NO DEBE** desplazar el scroll de la vista para enfocar.
  **En `/login` este respaldo no existe** (la vista no tiene ningún control enfocable,
  `PaginaLogin.jsx:20-31`): se declara la **limitación** y **no** se inventa marcado (H2).
- **CL-17 — Ruta de destino sin controles enfocables (Q-02).** Si la ruta de destino no ofrece ningún
  control enfocable, la colocación de RF-15 **NO DEBE** simular un destino: se registra la limitación
  explícita (RF-05) y **NO DEBE** crearse marcado ni atributos nuevos. Hoy **no ocurre** en las dos
  rutas de destino verificadas (`/dashboard` y `/`, §4.6), así que el caso se cubre como borde
  documentado y, si el plan lo considera estable, con una prueba de la variante (AC-23). La vista de
  **origen** `/login`, que tampoco tiene controles enfocables, se cubre en CL-04(a) y CL-16.
- **CL-18 — Cierre que navega y captura del destino.** La colocación del foco en la vista de destino
  (RF-15) **NO DEBE** usar como candidato ningún nodo de la vista de origen (ni el disparador de la
  landing, ni el contenedor del diálogo que se cierra) y **NO DEBE** competir con la cadena de RF-04:
  cuando la vista de origen desaparece, sólo se resuelve el destino.
- **CL-19 — La marca `location.state.focoEnDestino` no se limpia al consumirse (limitación explícita;
  deuda para una spec futura).** *Añadida al cerrar la 011 (2026-10-17); **no** cambia RF ni AC y **no**
  cambia el comportamiento.*
  La colocación de RF-15 viaja **en la entrada de historial** (`PaginaLogin.jsx` escribe la marca en
  `location.state`; `useFocoEnVistaDestino.js` la consume una sola vez **por entrada**, guardando
  `location.key` en una `ref`). La marca **no se elimina** del estado de la ruta al consumirse, así que
  **al volver a montar la misma entrada de historial** la pieza la vuelve a encontrar y **vuelve a
  colocar el foco**, **sin ningún cierre de superficie**:
  **(a)** `/login` → cerrar → `/dashboard`, navegar fuera del dashboard y **volver** a esa misma entrada
  de `/dashboard` (se re-monta la vista de destino con la marca todavía en su `location.state`);
  **(b)** navegar **atrás** (o adelante) hasta una entrada marcada; **(c)** cualquier navegación
  **ordinaria** que aterrice en una entrada que aún lleve la marca.
  **Por qué no queda cubierto:** RF-15 delimita la colocación al **cierre de una superficie modal que
  navega** («una sola vez por cierre-navegación») y AC-25 sólo exige que **no** mueva el foco la
  navegación ordinaria **sin** cierre; **ninguno de los dos define la navegación «atrás»** ni el
  re-montaje de una entrada ya marcada. Esta spec **no** lo corrige (haría falta decidir la limpieza de
  la marca o una clave de consumo que sobreviva al re-montaje, con su propio criterio y sus pruebas):
  se registra como **limitación explícita** y **deuda para una spec futura**. Alcance honesto: el
  defecto **no se reproduce en las rutas verificadas** durante la validación (los casos de AC-22/AC-25
  usan entradas de historial nuevas en cada escenario), pero **sí es alcanzable** con «atrás» o con el
  re-montaje de la entrada marcada descritos arriba.

### 6.2 Decisiones

| ID | Decisión | Estado |
|---|---|---|
| **DP-01** | **Alcance: las cuatro superficies modales** (Q1=(c)): `DashboardDrawer`, `DashboardUserModal`, `AuthModal` y `ModalTarjeta`. | Aprobada por el usuario |
| **DP-02** | **La devolución de foco es responsabilidad de cada superficie**, no del layout: la superficie conoce su disparador, su transición de apertura/cierre y su propio panel. El layout aporta el `triggerRef` (ya lo hace), el traslado del cruce y —con el cierre que navega— la colocación en la vista de destino. | Propuesta |
| **DP-03** | **Se reutiliza el patrón M4 de la 010** (guarda de «estuvo abierto» + captura incondicional + cadena validada + respaldo estable) como contrato funcional de referencia, **sin reabrir la 010**, añadiendo la **comprobación del resultado del foco** (Q-03). | Propuesta |
| **DP-04** | **El respaldo estable depende de la versión de vista actual**: botón **«Menú»** en móvil del dashboard; control de la **navegación lateral** en ≥768px; **primer control enfocable de la vista** en la **vista pública persistente (la landing)** (Q-01). **En `/login` no aplica** (H2: su vista no tiene controles enfocables) y rige la limitación explícita. **Sin props nuevas ni cambio de firma**; la versión de vista se toma del hook `useBreakpoint` (H4) y los selectores concretos se fijan en el plan. | Aprobada por el usuario (Q-01, revisada por H2/H4) |
| **DP-05** | **El cruce del corte traslada el foco en ambos sentidos** (Q-04), con dos caminos: **(a)** con panel superpuesto abierto, el traslado al control lateral es **incondicional**; **(b)** sin panel abierto, solo se traslada si el elemento enfocado pertenecía a la navegación de la versión que se desmonta. No se mueve el foco si el elemento enfocado sobrevive al cruce. | Aprobada por el usuario (Q-04, precisada por el hallazgo 5) |
| **DP-06** | **La forma de implementación de la regla común** (pieza compartida o repetición controlada) la decide el plan; el comportamiento observable es único (RF-06). Si exigiera props o refs nuevos, se pregunta antes de cerrar el plan (§2.3). | Propuesta |
| **DP-07** | **Sin cambios visuales, de marcado ni de animación**: la corrección se observa solo por el foco y el teclado. `prefers-reduced-motion` no aplica (CL-13). Los hexadecimales heredados de `AuthModal` **no se migran** (DP-03 de la 010). | Propuesta |
| **DP-08** | **Pruebas: se amplían las suites existentes** (Q3) —cuatro de superficie, la del layout, la transversal y, para el cierre que navega, `AuthModal.test.jsx`/`App.test.jsx`— **sin reemplazarlas**; la trampa de foco se ejerce real (RF-18). | Aprobada por el usuario |
| **DP-09** | **La spec 010 no se toca** (Q5): ni `spec.md`, ni `plan.md`, ni `tasks.md`, ni notas de trazabilidad dentro de su carpeta. La relación se documenta en §3 de esta spec. | Aprobada por el usuario |
| **DP-10** | **La pregunta Q4 del primer borrador quedó subsumida por Q1**: `AuthModal` y `ModalTarjeta` entran en el alcance. | Aprobada por el usuario |
| **DP-11** | **Chequeo del resultado del foco (Q-03)**: la cadena avanza solo cuando el candidato **queda** enfocado; un candidato conectado pero no enfocable no la detiene. | Aprobada por el usuario |
| **DP-12** | **Cierre que navega (Q-02)**: el foco se coloca en la **vista de destino**, tras su render, una sola vez por cierre-navegación; **no** se declara exento y **no** se aplica a navegaciones ordinarias. | Aprobada por el usuario |
| **DP-13** | **La carpeta se renombra** a `specs/011-foco-de-superficies-y-cruce/`, coherente con el alcance revisado. | Aprobada por el usuario |
| **DP-14** | **H2 — el respaldo «primer control enfocable» se limita a la landing.** En `/login` no hay controles enfocables fuera del modal (`PaginaLogin.jsx:20-31`): se declara la **limitación** y manda el destino de RF-15; **no** se añade marcado para fabricar un destino. | Aprobada por el usuario (2026-10-17) |
| **DP-15** | **H3 — un único criterio de destino para el cierre que navega:** la lista **ordenada** de RF-15 (control estable por versión de vista → primer control enfocable si el destino no es el dashboard → limitación). Unifica RF-15, §4.6 y AC-22. | Aprobada por el usuario (2026-10-17) |
| **DP-16** | **H4 — respaldo por versión de vista con el hook `useBreakpoint` ya existente** (sin props ni refs nuevos) **y coordinación con la 012**, que amplía su alcance para dejar **coherente** el stub local de `DashboardUserModal.test.jsx`. La 011 **no reescribe** esa suite. | Aprobada por el usuario (2026-10-17) |
| **DP-17** | **H12 — `ModalTarjeta` migra al patrón M4**: devolución gobernada por la **transición abierta → cerrada**, sin `focus()` indeseado en el montaje con tarjeta activa ni en `StrictMode`. | Aprobada por el usuario (2026-10-17) |

**Puntos que el plan debe resolver sin cambiar el alcance** (además de §2.3): los **mecanismos** del
respaldo estable (DP-04), del recuerdo del foco del cruce (DP-05) y de la colocación en la vista de
destino (DP-12) deben lograrse **sin props nuevas ni cambios de firma**; si el plan concluye que hace
falta una prop, un `ref` adicional desde los consumidores o cualquier cambio de contrato, **debe
devolverse como pregunta antes de cerrar el plan**, no asumirse (constitución §2).

---

## 7. Pruebas de Aceptación (criterios verificables)

| ID | Escenario | Esperado | Verificación |
|---|---|---|---|
| **AC-01** | Montaje **cerrado** de las cuatro superficies, con disparador **conectado** cuando exista (drawer en el dashboard real). **Cómo se mide:** se espía `focus()` con `.spyOn(nodo, "focus")` en los **candidatos** (el disparador y los controles estables de la versión de vista) **antes** de montar y se compara `document.activeElement` antes y después; el recuento se acota al **acto de montaje cerrado** (no incluye los `focus()` que hace la trampa al abrir) | `document.activeElement` **no cambia** tras el montaje cerrado; **0** llamadas a `focus()` sobre los candidatos. **Hoy el drawer falla** (enfoca el botón «Menú») | Suites de cada superficie (espía sobre `focus()` + `document.activeElement`) |
| **AC-02** | Montaje cerrado con `StrictMode` (efectos dobles) | **0** robos de foco; ninguna llamada duplicada | Prueba con el componente envuelto en `<StrictMode>` |
| **AC-03** | Re-render **cerrado** (identidad nueva del disparador, cambio de `children`) tras el montaje | **NO** se mueve el foco mientras la superficie permanece cerrada | Suite de la superficie |
| **AC-04** | Apertura y cierre de cada superficie con disparador conectado | Exactamente **1** devolución por cierre; `document.activeElement` **es** el disparador (casos vigentes: `DashboardDrawer.test.jsx:341-384`, `DashboardUserModal.test.jsx:218-290` —describe del retorno de foco, casos en `:242-263` y `:265-290`—, `PanelTarjetas.test.jsx:138-165`) | Suites existentes **ampliadas, no reescritas** (criterio único de RF-18): los casos vigentes **no se modifican** y el recuento **crece** con los casos nuevos; aserto de recuento (`toHaveBeenCalledTimes(1)`). El caso del respaldo lateral de `DashboardUserModal.test.jsx` (`:265-290`) queda verde **con el ajuste de stub de la 012** (H4) |
| **AC-05** | Cierre con el disparador **desconectado** (nodo retirado del DOM) en las cuatro superficies | La cadena continúa: destino = elemento previo capturado si está conectado; **nunca** `.focus()` sobre el nodo desconectado ni foco final en `body` | Prueba nueva en la suite de cada superficie |
| **AC-06** | Cierre sin disparador válido ni elemento previo válido (candidatos `null`, `body`, `disabled`/`inert` o desconectados), en **móvil**, en **≥768px** y en la **landing** | `document.activeElement` **es** el control estable de la versión de vista: botón **«Menú»** en móvil; control de la **navegación lateral** en ≥768px (caso vigente: `DashboardUserModal.test.jsx:265-290`, que queda verde **tras el ajuste de stub de la 012**, H4); **primer control enfocable de la vista** en la **landing** (Q-01); **nunca** `document.body`. **En `/login` no hay respaldo** (H2): se aserta la **limitación** (no se crea ningún destino) y, al cerrar navegando, manda AC-22 | Prueba nueva, parametrizada por versión de vista y por vista, en cada superficie afectada |
| **AC-07** | Apertura con el disparador ausente y cierre | Se capturó el elemento activo al abrir (RF-03) y el foco vuelve a un candidato válido; sin no-op silencioso. **Hoy el drawer falla** (acaba sin enfocar nada si no hay captura) | Suite de la superficie |
| **AC-08** | Apertura **programática** (superficie montada ya abierta: `AuthModal` en `/login`, `ModalTarjeta` con tarjeta activa al montar) y cierre | **La captura no altera el foco**: al montar abierta, el foco acaba en el contenedor del diálogo (contrato de la trampa; no contradice el RF-16 de la 010) sin robar el foco a nada más y **sin `focus()` indeseado** en `ModalTarjeta` (H12). Al cerrar, el foco **nunca** queda en `body` estable. En `/login`, el aserto se hace **tras completarse la navegación** (AC-22); el paso intermedio por `body` es una **limitación documentada** de esa ruta (no hay control de origen al que volver, H2) | Suite de la superficie |
| **AC-09** | Doble cierre (X **y** Esc con un callback que **no** cambia el estado de apertura) | **1** sola devolución de foco, sin errores y sin reactivar la superficie | Suite de la superficie |
| **AC-10** | **Paridad de la regla común**: el mismo escenario (disparador desconectado / candidatos inválidos) en las **cuatro** superficies | La **misma regla observable** (una sola transición, misma cadena de validaciones, mismo respaldo relativo a la versión de vista) en las cuatro | Pruebas equivalentes por superficie (**hoy el drawer y `AuthModal` fallan**) |
| **AC-11** | Abrir «Cuenta» desde el menú (móvil) y cerrarla | Al abrir: el menú se cierra, queda **una** superficie y el foco pertenece al modal (010 AC-02/AC-06; `cierreDeModales.test.jsx:312-337`); al cerrar Cuenta: el foco acaba en el botón **«Menú»**; en ningún paso queda en `body` | Prueba de integración existente (transversal) **ampliada** |
| **AC-12** | Cruce **móvil → pantallas grandes**: (i) **con** el menú abierto; (ii) **sin** el menú abierto, con el foco en la navegación inferior (botón «Menú» o un ítem del `BottomNav`) | En (i): el menú se cierra y el foco pasa al control de la navegación lateral **de forma incondicional**, con independencia de dónde estuviera el foco (test existente `DashboardLayout.test.jsx:316-329` **verde, sin cambios**). En (ii): el foco pasa igualmente al control de la navegación lateral y **nunca** queda en `body` (**hoy falla**) | Suite del layout **ampliada** (caso nuevo para (ii)). **Verificabilidad de (ii) condicionada al mecanismo**: depende de que el plan fije cómo se detecta que el elemento enfocado pertenecía a la barra que se desmonta (§2.3); si esa detección no fuera estable en jsdom, se registra como revisión **no realizada**, nunca como verde |
| **AC-13** | Cruce **pantallas grandes → móvil** **sin ningún panel abierto**, con el foco en la navegación lateral (`SidebarResponsive.jsx:39-61`) | El foco acaba en el botón **«Menú»** de la navegación inferior; **nunca** en `body` ni en un nodo desmontado. **Hoy falla** (queda en `body`, enmascarado por AC-01). La convivencia con el **modal abierto** **no** se cubre aquí: es **AC-14**/CL-07(d) | Prueba nueva en `DashboardLayout.test.jsx`. **Verificabilidad condicionada al mecanismo** del traslado (§2.3): si detectar el origen del foco no fuera estable en jsdom, se registra como revisión **no realizada** |
| **AC-14** | Cruce con el elemento enfocado **sobrevive** (modal de cuenta abierto; foco en el contenido principal; foco en un campo) | El foco **no** se mueve: el modal conserva foco/trampa (010 AC-11; `DashboardLayout.test.jsx:331-343`) y el contenido principal no se ve alterado | Prueba nueva en `DashboardLayout.test.jsx` |
| **AC-15** | Cruce con el control equivalente de destino **no disponible** | Se aplica la **lista ordenada de preferencia** de RF-05 aplicada a la versión de destino: (1) control estable de esa versión; (2) **otro** control estable de la versión de destino; (3) **limitación** registrada y asertada (CL-12). El foco **nunca** queda en `body` si existe (2) | Prueba de la variante (si el plan la considera estable en jsdom) o revisión registrada (**no realizada**, nunca verde) |
| **AC-16** | Pruebas con la **trampa real** | Las suites de esta corrección **no** contienen `vi.mock("focus-trap-react"` ni `displayCheck` en código de producto (patrón de auditoría de la 010 AC-19, `grep` **sin paréntesis de cierre**) y siguen apoyándose en `vitest.setup.js:47-83` | Revisión + `grep` |
| **AC-17** | **No-regresión de las suites ampliadas** | `DashboardDrawer.test.jsx`, `DashboardUserModal.test.jsx`, `AuthModal.test.jsx`, `ModalTarjeta.test.jsx`, `DashboardLayout.test.jsx`, `cierreDeModales.test.jsx`, `PanelTarjetas.test.jsx` y `App.test.jsx` **no empeoran** frente a la **línea base medida**; los contratos de props se mantienen. **Línea base (H4):** como la 011 depende del ajuste de stub de la **012**, se mide **después** de esa corrección; para `DashboardUserModal.test.jsx` se compara contra su estado **post-012** (el caso `:265-290` queda verde) | Ejecución focalizada + comparación con la línea base medida (atribución **suite por suite**, pass/fail/no ejecutado) |
| **AC-18** | **Contrato, datos y diseño intactos** | Firmas `{ abierto, alCerrar, children, triggerRef? }`, `{ abierto, alCerrar, triggerRef? }`, `{ abierto, modoInicial, alCerrar }`, `{ tarjeta, onCerrar }`; mapa de rutas sin cambios; sin contenido/datos/`TRIAL_ACTIVO`/endpoints nuevos; **sin** hexadecimales, superficies translúcidas, blobs ni dependencias nuevas; sin animaciones nuevas | `grep` + `App.test.jsx` + `npm run build` (en la tarea final) |
| **AC-19** | **La 010 no se toca (Q5)** | Los **documentos** de `specs/010-cierre-de-modales/` (`spec.md`, `plan.md`, `tasks.md`) **sin modificaciones**; la relación con la 010 está documentada **dentro** de la 011 (§3). **No** se refiere a `cierreDeModales.test.jsx` (creada por la 010), que **Q3 sí autoriza ampliar** | Como `specs/010-*/` está **sin trackear** en git (estado verificado por el reviewer), `git diff` **no** la cubre: se compara **hash/mtime** (p. ej. `sha256sum` o `stat` de los tres archivos antes/después) o `git status --porcelain --untracked-files=all` con comparación explícita, + revisión de esta spec |
| **AC-20** | **Cabeceras JSDoc** de los archivos de producto tocados | Describen el contrato de foco corregido (`@eventos`/`@estados`) sin citar rutas inexistentes de plantillas (§8) | Revisión de archivos |
| **AC-21** | **`prefers-reduced-motion`** | **No aplica** (no se toca animación). Si el plan acabara tocando alguna, **DEBE** respetar la preferencia | Inspección del diff; test solo si aplica |
| **AC-22** | **`/login`: cierre que navega (Q-02, H3)** | Tras cerrar `AuthModal` (X, Esc o clic fuera) y **completarse la navegación**, `document.activeElement` **es** el destino de la **lista ordenada** de RF-15: en `/dashboard`, botón **«Menú»** (móvil) o control de la **navegación lateral** (≥768px); en `/`, el **primer control enfocable** de la landing (enlace del logotipo `Header.jsx:42`). Colocado **después** del render de la nueva vista, **una sola vez**; **nunca** `body` ni un nodo de la vista de origen. **Hoy falla** | Prueba con `MemoryRouter` (origen `/login` → destino) en `AuthModal.test.jsx` o `App.test.jsx`, **parametrizada por ruta de destino y por versión de vista** |
| **AC-23** | **Ruta de destino sin controles enfocables (CL-17)** | La limitación se registra de forma explícita y **NO** se crea ningún control ficticio; no se lanza error | Prueba de la variante (si el plan la considera estable en jsdom) o caso documentado con revisión registrada |
| **AC-24** | **Candidato conectado pero no enfocable (Q-03)** | Tras intentar el `.focus()` sin éxito, la cadena **continúa** hasta lograr el foco en un candidato válido (o agotar la cadena → respaldo); el foco final **no** es `body`. Candidatos **afirmados**: `disabled` y dentro de un subárbol **`inert`** (la variante «oculto/`aria-hidden`» **no** se aserta: en jsdom un nodo oculto **sí** es enfocable, CL-09) | Prueba nueva por superficie (candidato intermedio `disabled` o `inert`) |
| **AC-25** | **La colocación en el destino no invade la navegación ordinaria** | Navegar entre secciones sin cerrar ninguna superficie **no** mueve el foco de forma gestionada por esta spec (RF-15/§2.2) | Prueba de no-regresión sobre `App.test.jsx` y suite del layout |

> **Honestidad de la validación.** Los criterios **AC-01 a AC-11 y AC-14, AC-16 a AC-20, AC-22, AC-24 y
> AC-25** son verificables con Vitest/jsdom (la trampa real ya es viable en este proyecto). **AC-12(ii)**
> y **AC-13** lo son **si** el mecanismo que fije el plan (§2.3) permite detectar de forma estable el
> origen del foco; **AC-15** y **AC-23** dependen de que sus variantes sean estables en jsdom. Los tres
> casos, si no lo fueran, se registran como revisión manual **no realizada** (nunca como verde).
> **AC-05/AC-06 en `DashboardUserModal`** presuponen el **ajuste de stub de la 012** (H4): sin él, la
> medición de esa suite es «móvil» y su caso de respaldo lateral no puede pasar. **No** se aserta la
> variante «oculto/`aria-hidden`» de AC-24 (en jsdom un nodo oculto **sí** es enfocable, CL-09).
> **AC-18** se completa con `npm test` y `npm run build`, reservados para la **tarea final del plan**.
> Ninguna comprobación no ejecutada se reportará como aprobada.

---

## 8. Dependencias Técnicas

- **`focus-trap-react` 10.2.3 y `focus-trap` + `tabbable`**, ya instalados (`package.json`); sin
  dependencias nuevas. El retorno de foco es **manual** en este proyecto
  (`returnFocusOnDeactivate: false` en `DashboardDrawer.jsx:41-48`, `DashboardUserModal.jsx:28-35`,
  `AuthModal.jsx:25-32`): la corrección **no** cambia las opciones de la trampa ni usa `displayCheck`.
- **Andamiaje de geometría de `vitest.setup.js:47-83`** (spec 010, DP-10): permite ejercer la trampa
  **real** en jsdom. Es el soporte de las pruebas de esta spec; **no** se modifica aquí.
- **`StrictMode`** (`src/main.jsx:16`): determina el doble montaje de efectos en desarrollo y, con
  ello, la observabilidad de D1 (CL-14).
- **Patrón M4 de la spec 010** (`DashboardUserModal.jsx:60,69-72,75-100`; plan §2.3-M4, líneas
  143-156): contrato de referencia de la corrección, sin reabrir la 010.
- **`useBreakpoint` (hook existente) y la spec 012 — dependencia bidireccional (H4):** la **versión de
  vista** del respaldo se obtiene del hook `useBreakpoint` (`src/hooks/useBreakpoint.js:38-73`,
  contrato de 4 props) **sin props nuevas** y **sin una lectura nueva de `matchMedia`**.
  **(011 → 012)** el respaldo exige **una sola** fuente de medición: si el hook midiera dos versiones
  distintas según el momento, el respaldo podría elegir el control equivocado en el primer render.
  **(012 → 011)** la 012 hace coherente el **stub global** de `vitest.setup.js` (`:14-26`/`:28-33`) y el
  **stub local** de `DashboardUserModal.test.jsx` (`:34-44`/`:47-50`), de modo que esa suite mida
  «pantallas grandes» como declara su comentario (`:46`) y pueda afirmar el respaldo estable de RF-09.
  **Orden acordado: 012 primero; la 011 se re-mide después** contra el estado resultante (AC-17):
  la **012**: **§3.4** (coordinación con la 011), **§7.1-B** (infraestructura de pruebas) y **DP-12**.
- **Mapa de rutas** (`App.jsx:26-50`) y **cierre con navegación** (`PaginaLogin.jsx:26-30`): contexto
  del cierre que cambia de ruta (RF-15). **`PaginaLogin.jsx:20-31` no tiene ningún control enfocable**
  fuera del modal (solo dos `<p>`): es la evidencia de H2.
- **Controles de destino del foco**, ya existentes y sin cambios:
  - **Móvil del dashboard**: `BottomNav.jsx:39-67` (3 ítems) y `:70-82` (botón «Menú», control estable
    de DP-05 de la 010).
  - **≥768px del dashboard**: `SidebarResponsive.jsx:26-35` (`aside role="navigation"`) y `:39-61`
    (botón de logo/colapso).
  - **Área pública**: `Header.jsx:42` (enlace del logotipo) y `:56-73` (acciones de acceso);
    `PaginaInicio.jsx:44-51` (botón flotante de ayuda).
  Precedente de selector DOM con `role`/atributo: `DashboardLayout.jsx:66-68` y
  `DashboardUserModal.jsx:96`.
- **Efecto de cruce del corte** (`DashboardLayout.jsx:62-72`): garantía actual del traslado
  móvil → pantallas grandes (solo con el menú abierto); su ampliación a la dirección contraria y a los
  cruces sin panel abierto es parte del alcance (RF-12/RF-13).
- **Contratos de props verificados en pruebas**: `DashboardLayout.test.jsx:294-312` exige que el
  drawer reciba exactamente `abierto`, `alCerrar`, `children`, `triggerRef` y que el modal reciba
  `abierto`, `alCerrar`, `triggerRef`; cualquier prop nueva **rompe** esa prueba y exige aprobación
  previa.
- **Inconsistencia de documentación (no se resuelve aquí):** `AGENTS.md:38`, `doc/constitution.md:39`
  y `.agents/rules/rules.md:21` citan `.agents/file-header-template.md`, que **no existe**; la
  plantilla real está en `.agents/skills/file-hearder-template.md/SKILL.md` (con el typo «hearder»).
  Si la implementación toca cabeceras, **avisar** de la inconsistencia antes de seguirla.

---

## 9. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Suprimir el robo de foco del montaje (RF-01) **expone** la pérdida de foco del cruce hacia móvil (D6) | Regresión percibida como «peor que antes» | RF-13/AC-13 entran en el mismo alcance (Q2/Q-04): el traslado se garantiza **antes** de dar por cerrada la corrección |
| El traslado del cruce **roba el foco** al usuario (contenido principal, campo o modal abierto) | Peor usabilidad que el defecto corregido | RF-14 + AC-14: solo se traslada si el elemento enfocado se desmonta |
| La colocación del foco en la vista de destino se aplica a **cualquier** navegación | El foco «salta» en la navegación ordinaria de la app | RF-15 + §2.2 + AC-25: se limita al cierre de una superficie que navega, una vez por cierre |
| El recuerdo del foco del cruce o la colocación en el destino exigen props o refs nuevos | Rompe contratos verificados (`DashboardLayout.test.jsx:294-312`) y excede el alcance | §2.3: si el plan lo considera imprescindible, **preguntar antes de cerrar el plan** |
| Copiar la cadena de M4 sin las validaciones (`!== document.body`, `isConnected`, resultado del foco) | Reaparece el foco en `body` o sobre un nodo desconectado/no enfocable (CL-02/CL-03/CL-09) | RF-04/RF-05 + AC-05/AC-06/AC-24 en las **cuatro** superficies |
| Generalizar la regla común y tocar superficies hoy verdes | Regresión en `DashboardUserModal` y `ModalTarjeta` | RF-06/DP-06 + AC-10/AC-17: comportamiento idéntico y suites existentes verdes |
| **Dependencia bidireccional con la 012** (H4; §3.4 de la 012): **(a)** si la **012 no se implementa antes**, la 011 se mide con el entorno antiguo, `DashboardUserModal.test.jsx` sigue midiendo «móvil» y su caso de respaldo lateral (`:265-290`) **no** puede quedar verde; **(b)** si la **011** cambiara el contrato del hook `useBreakpoint` o introdujera una **lectura nueva de `matchMedia`**, rompería la **fuente única de medición** que la 012 garantiza | Fallo atribuido a la spec equivocada; mediciones obsoletas; tentación de «arreglar» el stub desde la 011 | §3 y §8 (dependencia **bidireccional** con citas a §3.4, §7.1-B y DP-12), §10-1 (**orden acordado: 012 primero, la 011 se re-mide después**) y AC-17 (línea base medida **después** de la 012); el hook se usa **sin** cambios de contrato (§2.3) y §2.2 confirma que la 011 **no** reescribe esa suite |
| Interpretar «verde sin cambios» como «recuento congelado» | Se rechazan casos nuevos legítimos o se reescriben suites | Criterio único **ampliar sí, reescribir no** (RF-18/AC-04): los casos vigentes no se modifican y el recuento **crece** |
| El mecanismo del traslado del cruce (RF-12(b)/RF-13) o el de la vista de destino (RF-15) resulta inestable en jsdom | Criterios que no se pueden verificar y podrían declararse «verdes» sin serlo | AC-12(ii)/AC-13/AC-15/AC-23 se registran como revisión **no realizada** si el mecanismo no es estable; si exigiera props o refs nuevos, se pregunta **antes** de cerrar el plan (§2.3) |
| En `/login` se intenta «cumplir» el respaldo añadiendo un control | Marcado nuevo no autorizado y cambio de una página fuera de alcance | H2 + §2.2 + RF-05: en `/login` rige la **limitación explícita**; el destino lo pone RF-15 |
| El respaldo del área pública (primer control enfocable) desplaza el scroll o enfoca algo no interactivo | Mala experiencia al cerrar el modal de la landing | CL-16: el respaldo usa selectores reales de foco y **no** debe desplazar el scroll |
| Aprovechar la corrección para **rediseñar** `AuthModal` o migrar sus hex | Cambio visual no pedido (excluido por la 010, DP-03) | §2.2 + RF-16 + AC-18; CL-13 |
| Debilitar las pruebas mockeando la trampa para «pasar» | Se oculta el defecto que motiva la spec (lección de la 010) | RF-18 + AC-16 (auditoría por `grep` y revisión) |
| Cifras de la suite tomadas de MEMORY | Conclusiones de regresión falsas (MEMORY registra 253/21, 257/22 y 348/27) | Medir la **línea base** antes de tocar nada y reportar pass/fail/no ejecutado |
| Añadir o modificar archivos dentro de `specs/010-*/` | Reabre una spec finalizada (prohibido por Q5) | DP-09 + AC-19 |
| Solapamiento con la spec 012 en `AuthModal` | Conflictos de edición | §3: la 012 no toca el foco; si se solapan, se coordina el orden y se re-mide |
| Ediciones manuales del usuario durante la implementación | Referencias y supuestos obsoletos | Re-verificar `archivo:línea` antes de planificar y antes de implementar; CL-15 |

---

## 10. Verificación propuesta (para el plan y las tareas)

1. **Antes de tocar código (orden acordado con la 012, H4):** se implementa la **012 primero**
   (§3.4 de la 012), incluido el ajuste del stub local de `DashboardUserModal.test.jsx`; después se
   **mide la línea base de la 011** contra ese estado —la 011 se **re-mide**, nunca antes— y se
   registra, sin declarar verde nada que no se mida:
   `npx vitest run src/components/layout/DashboardDrawer.test.jsx src/components/layout/DashboardUserModal.test.jsx src/components/layout/cierreDeModales.test.jsx src/layout/DashboardLayout.test.jsx src/components/domain/modales/AuthModal.test.jsx src/components/ModalTarjeta.test.jsx src/pages/PanelTarjetas.test.jsx src/App.test.jsx`
2. **Pruebas que deben fallar primero (TDD):**
   - **AC-01** en el drawer (montaje cerrado con disparador conectado → el foco no se mueve). Hoy
     **falla**; es la evidencia de D1.
   - **AC-10** en `AuthModal` (cierre → el foco vuelve al disparador; sin disparador → primer control
     enfocable de la vista). Hoy **falla**; es la evidencia de D3 y Q-01.
   - **AC-13** en el layout (cruce pantallas grandes → móvil con el foco en la navegación lateral).
     Hoy **falla**.
   - **AC-12 (ii)** en el layout (cruce móvil → pantallas grandes **sin** el menú abierto, con el foco
     en la navegación inferior). Hoy **falla** (Q-04).
   - **AC-22** (`/login`: tras el cierre con navegación, el foco está en el destino de la lista
     ordenada de RF-15 —«Menú» o navegación lateral en `/dashboard`; primer control enfocable en `/`—,
     según la ruta de destino y la versión de vista). Hoy **falla** (Q-02).
   - **AC-24** (candidato `disabled`/`inert`: la cadena **continúa**). Hoy **falla** (el drawer no
     recorre candidatos). Q-03.
3. **Tras la corrección:** volver a ejecutar el comando del punto 1 y comprobar que las pruebas de foco
   **vigentes** siguen **pasando** sin modificarse —criterio **ampliar sí, reescribir no** (RF-18): los
   casos no se tocan y el recuento **crece**— (`DashboardDrawer.test.jsx:341-384`,
   `DashboardUserModal.test.jsx:218-290`, `DashboardLayout.test.jsx:294-312` y `:316-329`,
   `PanelTarjetas.test.jsx:138-165`).
4. **AC-19 (la 010 no se toca):** como `specs/010-*/` está **sin trackear**, comparar **hash/mtime** de
   sus tres documentos antes y después (o `git status --porcelain --untracked-files=all` con
   comparación explícita).
5. **Tarea final del plan:** `npm test` (suite completa) y `npm run build`, con comparación contra la
   línea base medida y reporte **pass/fail/no ejecutado** por validación.
6. **Validación visual:** **no aplicable** (la corrección no cambia aspecto, marcado ni movimiento; el
   foco de un control no es un cambio visual en sí). Si el plan detectara efecto visual, se registraría
   como excepción y se revisaría en navegador.
7. **Sin commit ni staging** en las fases de spec/plan.

---

## 11. Estado de decisiones (sin preguntas abiertas)

Las cinco preguntas de alcance del primer borrador (Q1–Q5), las cuatro preguntas de la revisión de
alcance (Q-01–Q-04) y los cuatro hallazgos con decisión del usuario de la revisión del reviewer
(**H2, H3, H4, H12**) están **cerradas** y se reflejan en los requisitos de esta spec. **No queda
ninguna pregunta abierta** que cambie el comportamiento. Los otros catorce hallazgos del reviewer
(bloqueantes 1, 5 y 6; no bloqueantes 7–11 y 13–18, con la aclaración opcional de AC-19) se
aplicaron como se indicó, sin cambiar el alcance.

| Pregunta | Resolución | Requisitos y criterios afectados |
|---|---|---|
| **Q1** | Alcance: las cuatro superficies modales | RF-06, RF-08, RF-09, RF-10, RF-11; AC-01, AC-05, AC-10 |
| **Q2** | El cruce del corte garantiza el traslado de foco (se amplía el alcance al efecto de cruce) | RF-12, RF-13, RF-14; AC-12, AC-13, AC-14, AC-15 |
| **Q3** | Pruebas: se amplían las suites existentes | RF-18; AC-17 |
| **Q4** | Subsumida por Q1 | RF-10, RF-11 |
| **Q5** | La 010 no se toca; la trazabilidad vive en la 011 | RF-19; AC-19 |
| **Q-01** | Respaldo de la vista pública = **primer control enfocable de la vista**, **solo en la landing** (vista pública persistente); en `/login` **no aplica** (H2) | RF-05 (tabla de respaldos), RF-10; CL-01, CL-16, AC-06 |
| **Q-02** | `/login` **no exento**: el foco acaba en la **vista de destino**, con la **lista ordenada** de RF-15 (**control estable por versión de vista**; si el destino no es el dashboard, el primer control enfocable), tras el render de la nueva vista y una sola vez; si no existe destino, limitación explícita | RF-15, RF-05; CL-04, CL-17, CL-18; AC-08, AC-22, AC-23 |
| **Q-03** | Se comprueba el resultado del `.focus()` y, si el candidato no queda enfocado, **la cadena continúa** (casos afirmados: `disabled`/`inert`) | RF-04, RF-05, RF-06; CL-09; AC-24 |
| **Q-04** | Lectura **simétrica** del cruce, **precisada en dos caminos**: (a) con panel abierto, traslado **incondicional** al control lateral; (b) sin panel, se traslada si el elemento enfocado pertenecía a la navegación de la versión que se desmonta. En ambos sentidos y nunca si el elemento sobrevive | RF-12, RF-13, RF-14; CL-07; AC-12, AC-13, AC-14 |
| **Renombrado** | Carpeta `specs/011-foco-de-superficies-y-cruce/` | Cabecera de esta spec |
| **H2** | El respaldo «primer control enfocable» **no aplica en `/login`** (no hay controles); se declara la **limitación** y no se inventa destino | RF-05, RF-10; CL-01, CL-04(a), CL-16, CL-17; AC-06, AC-22 |
| **H3** | **Un solo criterio de destino** para el cierre que navega: lista ordenada de RF-15, alineada con §4.6 y AC-22 | RF-05, RF-15; AC-22, AC-23 |
| **H4** | Respaldo por **versión de vista del hook `useBreakpoint`** (sin props ni refs nuevos) **+ dependencia bidireccional con la 012** (stub local de `DashboardUserModal.test.jsx`; §3.4, §7.1-B y DP-12 de la 012), con **orden acordado: 012 primero y la 011 se re-mide después**; la 011 no reescribe esa suite | RF-05, RF-09; §3, §8, §9, §10; AC-06, AC-17 |
| **H12** | **`ModalTarjeta` migra al patrón M4** (transición abierta → cerrada, sin `focus()` indeseado en `StrictMode`) | RF-06, RF-11; §4.4; CL-11, CL-14 |

> **Lo que sigue pendiente y NO es una pregunta de comportamiento:** los **mecanismos** de
> implementación (§2.3) los fija el plan. Si alguno exigiera props, refs o cambios de contrato, debe
> devolverse como pregunta **antes de cerrar el plan**.
