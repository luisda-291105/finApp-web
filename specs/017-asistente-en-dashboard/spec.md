# Spec 017 — Asistente de ayuda en el dashboard (reutilización del diseño de la 014)

**Estado: aprobada** (2026-10-20) · **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)
**Fecha:** 2026-10-19 · **Revisión:** 2026-10-20 (D-1…D-6 + correcciones del revisor + cierre de
bloqueantes). Las cinco preguntas P-01…P-05 (2026-10-19) y las seis decisiones D-1…D-6 (2026-10-20)
quedaron **resueltas**; no hay cláusulas condicionadas ni preguntas abiertas.
**Origen:** petición literal del usuario «mismo chat para el dashboard», acotada por él mismo a
**el mismo asistente en el dashboard, SOLO DISEÑO** — reutilizando el componente que ya diseñó la
**Spec 014**, **sin motor, sin guion y sin lógica**, con los **estados de ejemplo estáticos** que ya
existen.

**Revisión 2026-10-20:** se incorporan las **tres decisiones nuevas** del usuario (D-1/D-2/D-3, §16) y
las correcciones del revisor. El **detalle de tarjeta** entra en la regla de «una sola superficie»
(RF-06/CL-02/AC-06) con el mecanismo de §4.5; el disparador se fija en **`z-40`, solo tokens y sin
hover ni escala** (D-2, RF-12); «solo tokens» pasa a ser **decidible por familias** (RF-09/AC-09/
AC-12); y se precisan AC-01/AC-02/AC-05/AC-12/AC-13/AC-14. **Aprobada** el 2026-10-20 con el plan y
las tareas enlazados; sin requisitos condicionados y sin lógica.

**Cierre de la revisión (D-4/D-5):** se **acepta y documenta** el nodo saliente del detalle de tarjeta
(~0,2 s, no operable; DP-18) y se fija que el disparador **aplica** la reserva del área segura
(`env(safe-area-inset-bottom, 0px)` en su `bottom` calculado) aunque la reserva real queda **pendiente**
por la deuda de `viewport-fit=cover` de la 013 (DP-19). El desplazamiento exacto del disparador (px de
`bottom` y margen lateral) se decide **en el plan**, dentro del rango de §4.4. Ninguna de las dos
decisiones cambia el alcance.

**Cierre de bloqueantes (D-6):** el disparador queda **excluido de los candidatos del respaldo de foco**
del layout —marca estable `data-respaldo-foco="excluir"` + filtro en `esCandidatoDeCruce`
(`src/layout/DashboardLayout.jsx:16-24`, `:46-54`)— **sin tocar `useRetornoDeFoco` y sin editar ninguna
suite** (§4.5, DP-20, AC-15). Así la prueba cerrada `DashboardLayout.test.jsx:427-451` sigue
cumpliéndose sin editarse: los controles de contenido y de navegación siguen siendo candidatos. Además,
la capa del scrim se corrige a lo **verificable**: gana al BottomNav (`z-50`) y al sidebar (`z-40`) y
**no coexiste** con el drawer (RF-06 lo cierra en el punto de apertura); **no** se declara por encima
del panel del drawer (`z-55`), porque eso es imposible por CSS y contradice §3.2/§3.3 (RF-07/AC-07).

**Pasada de verificabilidad (2026-10-20, sin cambio de alcance):** AC-15 pasa a contar **2** apariciones
del literal `data-respaldo-foco="excluir"` (la constante obligatoria de §4.5 + el `<button>`) en vez de 1,
y comprueba `SELECTOR_EXCLUIDO_RESPALDO` **≥2** veces (declaración + uso); AC-12 usa la **misma frontera
de regex que §3.4** (`[\s"']` … `\s|"|'|$`), que **no** rechaza los tokens admitidos con guion
(`ring-emerald-primary`, `bg-emerald-primary`, `text-slate-text`) y **sí** rechaza `text-white`,
`bg-black/70` y `text-slate-800`; AC-12 añade `type="button"`, ausencia de `aria-haspopup`/`aria-expanded`,
ausencia de `glass-card`/`glass-surface`/`backdrop-filter` (clase o `style`) y el prefijo de variante de
§3.4; §12 precisa que el cruce de 768px no cambia **salvo el filtro local autorizado por D-6**; y la línea
base registra **CSS 61,13 kB** (no 60,02), a **re-medir** en la primera tarea del plan y **no** criterio de
aceptación.

**Basada en / coordinada con:**

- **Spec 014** (asistente de ayuda de la landing) — **aprobada e implementada**; es el **contrato de
  diseño que se reutiliza**. Componente vivo:
  [`src/components/domain/modales/AsistenteAyuda.jsx`](../../src/components/domain/modales/AsistenteAyuda.jsx)
  y su suite
  [`AsistenteAyuda.test.jsx`](../../src/components/domain/modales/AsistenteAyuda.test.jsx).
  **No se modifica ninguna de las dos** (DP-02). Literales, marca de demostración, dos estados
  estáticos, cromo y presupuesto: `specs/014-asistente-de-ayuda/spec.md:90-126` (alcance), `:206-276`
  (anatomía/states/burbujas), `:277-311` (literales exactos), `:313-341` (controles presentacionales y
  disparador), `:345-444` (RF), `:448-503` (CL), `:506-522` (DP).
- **Spec 010** (cromo modal congelado): «X», Esc con un **único mecanismo por superficie**, clic
  fuera, deslizar en móvil, **una sola superficie y una sola trampa por diseño**, una única devolución
  de foco, `role="dialog"` + `aria-modal` + foco inicial en el panel
  (`specs/010-cierre-de-modales/spec.md:386-456`, aplicación por superficie en `:458-464`).
- **Spec 011** (foco): captura incondicional al abrir, cadena determinista
  (disparador → elemento capturado → control estable de la versión de vista), **nunca `body` ni un
  nodo desconectado**, y **respaldo por versión de vista** en el dashboard
  (`specs/011-foco-de-superficies-y-cruce/spec.md:484-520`; piezas vivas en
  `src/hooks/useRetornoDeFoco.js:66-75`, `:100-125` y `src/hooks/useCierreConEsc.js:17-31`).
- **Spec 013** (calidad CSS): **condiciona y no se reabre**. De ella se toman (a) la convención
  **velos y controles no son superficies** y **el scrim no cuenta** porque no lleva
  `backdrop-filter` (`specs/013-calidad-css/spec.md:274-297`), (b) que **`glass-card` es una tarjeta
  sólida opaca** y no consume presupuesto de vidrio (`:298-304`), (c) la **excepción de M-3b** que
  cubre **solo el control de `PaginaInicio.jsx`** (`:283`, `:292-297`, `:852`), y (d) las **medidas
  M-8 por estado** sobre el dashboard real: base **1 superficie / 0 blobs**, drawer **2 / 0**,
  modal **2 / 0** (`:914-919`, `:925-926`). `src/styles/index.css` y `src/styles/index.css.test.js`
  **no se tocan**.
- **Specs 008/009** (navegación del dashboard): **no se reintroduce el header** ni se toca la rama
  «Usuario»; el dashboard sigue siendo **sidebar (≥768px) + navegación inferior y drawer (<768px)**
  (`specs/009-eliminar-vista-tablet/spec.md:56`, `:427`; `specs/008-correccion-sidebar/spec.md:36`).
- **Reglas vivas:** tokens y prohibición de hexadecimales nuevos (`AGENTS.md:41-44`;
  `.agents/rules/rules.md:26-29`); **máximo tres superficies translúcidas y dos blobs por viewport**
  (`AGENTS.md:43-44`; `.agents/rules/rules.md:37-38`); límites de capas y blobs **sin prueba
  automática dedicada** (`.agents/rules/rules.md:62-65`).

**Specs cerradas que NO se reabren:** 001, 005, 006, 009, 010, 011, 012, **013**, **014** y **015**.

**Re-verificación:** las referencias `archivo:línea` de §3 y §4 se comprobaron el **2026-10-19**. El
usuario edita archivos a mano: **deben volver a verificarse antes del plan y antes de la
implementación**, y lo que ya no aplique se registra como «ya no aplicable» sin recrearlo (CL-09).

**Línea base (aportada por el orquestador, no asumida):** `HEAD` de partida **`dadc119`**;
`npm test` **518/518 en 33 archivos**; `npm run build` verde (CSS **61,13 kB** · JS **389,45 kB**). La
primera tarea del plan **debe re-medirla** antes de tocar código; esta spec no la declara verificada.
El **CSS no es criterio de aceptación**: la cifra solo se registra como referencia y se **re-mide** en
esa primera tarea, igual que el JS y la suite.

**Nota de formato:** esta spec define **solo el diseño y su ubicación** (reutilización del componente,
estados estáticos, literales, capas, presupuesto visual y accesibilidad). Las decisiones de
implementación concreta son del plan. Las **cinco decisiones del usuario** (§15, P-01…P-05) y las
**seis decisiones de la revisión** (§16, D-1…D-6) están tomadas y sus requisitos son **firmes**
(RF-06, RF-09, RF-12/RF-13/RF-14 y AC-06/AC-09/AC-12/AC-13/AC-14/AC-15): **no queda ninguna cláusula
condicionada**.

**Re-verificación de la revisión (2026-10-20):** se comprobaron `src/pages/PanelTarjetas.jsx:31`,
`:43-46`, `src/components/domain/modales/ModalTarjeta.jsx:71`, `:106`, `:119`,
`src/layout/DashboardLayout.jsx:16-24`, `:46-54`, `:72-81`, `:118-139`, `:196-231`,
`src/layout/DashboardLayout.test.jsx:427-451`, `src/pages/PanelTarjetas.test.jsx:72-254`,
`src/hooks/useRetornoDeFoco.js:66-75`, `:100-125`, `src/styles/index.css:34-36`,
`src/pages/PaginaInicio.jsx:72-80` y `node_modules/react-router/dist/index.js:245-254` (el `Outlet
context` sin proveedor devuelve `null`, no lanza).

---

## 1. Propósito

La landing ya tiene un asistente de ayuda **solo de diseño** (Spec 014): un panel claro con marca
`Demostración · No es una IA real`, una nota de diseño, dos estados estáticos, chips y campo
presentacionales, y el cromo congelado de 010/011. **El dashboard no lo tiene**: su única navegación
es el sidebar/drawer y no hay ningún punto de entrada a la ayuda
(`src/components/layout/SidebarNavContenido.jsx:29-34`, `:58-77`; `src/components/layout/BottomNav.jsx:18-22`,
`:69-81`).

El objetivo de esta fase es **ofrecer el mismo asistente, con el mismo diseño, dentro del dashboard de
demostración**, sin escribir ni una línea de motor, guion, coincidencia o estado de conversación, y
**sin tocar el componente de la 014**: se reutiliza tal cual (`src/components/domain/modales/AsistenteAyuda.jsx:85-227`),
se monta en un **segundo punto de uso** y los estados siguen siendo **maquetas estáticas** (DP-01).

Lo que esta spec **sí** tiene que resolver con evidencia es la **integración**: dónde vive el
disparador (§15 P-01 → DP-11), en cuántas vistas se ofrece (P-02 → DP-12), que el componente no
necesite cambios por el `zIndex` de Esc ni por el orden de capas (§3.2), y que el presupuesto Fluid
Glass del dashboard **medido por vista** siga dentro de los límites (§3.3).

**Las cinco decisiones están tomadas** por el usuario el 2026-10-19 (§15): el disparador es un
**control flotante de robot** con el mismo icono y el mismo nombre accesible que la portada, pero con
solo tokens y **sin `backdrop-filter`** (P-01/P-05); el asistente se ofrece en **todo el dashboard**
con **un único montaje** en el layout (P-02); no hay **convivencia** de capas (P-03); y **no se toca**
`AsistenteAyuda.jsx` (P-04). Sus requisitos son **firmes** (RF-12/RF-13/RF-14) y no hay cláusulas
condicionadas.

**La revisión del 2026-10-20 añade seis decisiones firmes (§16):** el **detalle de tarjeta** también
se cierra al abrir el asistente, sin tocar `ModalTarjeta.jsx` ni el cromo de 010 y con el mecanismo
declarado en §4.5 (D-1 → DP-15, RF-06); el control flotante vive en **`z-40`** (bajo los velos
`z-50`), con **solo tokens** y **sin hover ni escala**, y se coloca por encima del BottomNav aplicando
`env(safe-area-inset-bottom, 0px)` en su `bottom` calculado (D-2 → DP-16, RF-12); y el cierre de la spec
añadirá **solo su línea** en `MEMORY.md` (D-3 → DP-17). El cierre de la revisión **acepta** el nodo
saliente del detalle (~0,2 s, no operable; D-4 → DP-18) y declara que la reserva real del área segura
queda **pendiente** aunque el disparador **aplique** el `env(...)` (D-5 → DP-19). El **cierre de
bloqueantes** fija que el disparador **no es candidato del respaldo de foco** del layout, sin tocar el
hook ni las suites (D-6 → DP-20, RF-13/AC-15).

---

## 2. Alcance

### 2.1 Dentro del alcance

- **Reutilización literal** del componente de diseño de la 014 (`AsistenteAyuda`) en el dashboard:
  mismo panel (`bg-bg-cream/95` + `glass-surface`, `border-border-line/30`, `rounded-3xl`,
  `shadow-xl`), misma cabecera con título, marca de demostración y nota de diseño, mismos dos estados
  estáticos (`vacio` / `conversacion`), mismo `role="log"` **solo para mensajes**, mismos chips y
  mismo «Enviar» con `aria-disabled="true"` **sin handlers**, mismo campo editable sin lógica y mismo
  cromo congelado (`useCierreConEsc`, `useDeslizarParaCerrar`, `useRetornoDeFoco`, `FocusTrap`) con el
  **scrim sin `backdrop-filter`** (`AsistenteAyuda.jsx:103-226`).
- **Un segundo punto de uso** del componente dentro de `/dashboard/*`: **un solo montaje** por render
  del dashboard, con el estado de apertura/cierre en el layout (RF-02), y el **control flotante de
  robot** como disparador (RF-12, P-01 a).
- **Capas y foco**: convivencia con el cromo del dashboard sin reabrir 010/011; Esc sigue siendo el
  **único mecanismo** (`useCierreConEsc`), con **una sola superficie** abierta por diseño.
- **Una sola superficie, incluido el detalle de tarjeta**: abrir el asistente cierra también el
  detalle abierto desde `/dashboard/tarjetas` (D-1), **sin** tocar `ModalTarjeta.jsx` ni el cromo de
  010: se apaga su estado dueño (`tarjetaActiva` en `PanelTarjetas`) con la señal de §4.5.
- **Aspecto del disparador**: capa `z-40`, colores y borde solo desde tokens, **sin hover ni escala**
  (ninguna animación al pasar el puntero) y geometría por encima del BottomNav (~60 px) con la
  reserva de área segura (D-2, RF-12). El control **aplica** `env(safe-area-inset-bottom, 0px)` en su
  **desplazamiento** (`bottom` calculado), **no** la utilidad `.safe-bottom` (que aplica `padding` con
  fallback `1rem`); como el inset resuelve **0** sin `viewport-fit=cover`, la reserva real se registra
  como **pendiente** (D-5/DP-19).
- **Presupuesto Fluid Glass por vista**, con el conteo **medido hoy** de base (1 superficie / 0 blobs)
  y el **conteo esperado** con el asistente abierto (2 / 0), por versión de vista (§3.3, AC-08).
- **Accesibilidad**: nombre accesible del disparador, orden de tabulación, foco inicial en el panel,
  retorno de foco **exacto** al disparador flotante (el respaldo estable de 011 queda solo como
  defensa y el disparador **no** es candidato de ese respaldo, D-6/DP-20), y contraste AA del
  asistente sobre el fondo del dashboard.
- **Qué se prueba con Vitest** (montaje único, literales, ARIA, apertura/cierre, foco, scrim, una sola
  superficie, cierre del detalle) y **qué es revisión manual** (orden de pintado real, *hit test* de
  capas, geometría en móvil, área segura, teclado virtual, contraste medido, presupuesto visual,
  gesto).

### 2.2 Fuera de alcance

| Fuera de esta fase | Por qué / dónde se decide |
|---|---|
| **Motor de coincidencia** (normalización, palabras clave, puntuación, desempate) | Spec futura de lógica del asistente (014 §2.2) |
| **Guion de respuestas** y contenido dinámico | Spec futura de lógica/contenido |
| **Texto libre procesado** (envío, validación, eco del mensaje) | Spec futura de lógica |
| **Máquina de estados de la conversación** y transición `vacio` ↔ `conversacion` | Spec futura de lógica; aquí la variante se elige **solo por prop** (014 DP-07) |
| **Persistencia, historial, reinicio o conservación al cerrar** | Spec futura; nada de esto se implementa |
| **IA, backend, red, `fetch`, claves, endpoints, servicios externos** | Prohibido en esta línea |
| **Dependencias nuevas** | No se autorizan |
| **Buzón `soporte@finapp.com`** | No es real; **no se muestra en el asistente** (014 DP-08). En el dashboard **sí** aparece en el reverso de la tarjeta virtual (`src/components/domain/dashboard/MiTarjetaVirtual.jsx:188`); esta spec **no** lo toca |
| **Migración de hexadecimales en JSX** | **Sin decidir**; sigue fuera y **no la cubre** esta spec (014 DP-04). El código **nuevo** de la 017 queda sujeto a RF-09 |
| **Modificar `AsistenteAyuda.jsx` o su suite** | No: se reutiliza tal cual (DP-02) |
| **Modificar `src/styles/index.css` o `src/styles/index.css.test.js`** | No: 013 cerrada |
| **Modificar el cromo de `DashboardDrawer`, `DashboardUserModal`, `ModalTarjeta` o `AuthModal`** | No. **Sí** se autoriza tocar `src/pages/PanelTarjetas.jsx` (estado del detalle) y el layout para cerrar el detalle (D-1/DP-15) |
| **Mover el estado del detalle de tarjeta al layout o a un contexto nuevo** | No: se queda en `PanelTarjetas`; el layout solo recibe un registro de cierre (§4.5) |
| **Reintroducir el header del dashboard o cambiar la navegación (sidebar/drawer/BottomNav)** | No: 008/009 cerradas |
| **Reabrir o re-medir M-3b / reabrir la 013** | No |
| **Rutas, páginas, datos o formatos nuevos** | No |

> **Nota de alcance:** el asistente **sí** se abre, se cierra y mueve el foco (eso es el cromo, ya
> diseñado y probado en la 014). Lo que no existe es la **lógica de conversación**: ni motor, ni
> guion, ni respuestas, ni transiciones. Los chips, el campo y «Enviar» siguen siendo
> **presentacionales** (014 RF-09/DP-09).

### 2.3 Decisiones de alcance tomadas (P-01…P-05 y D-1…D-6 → DP)

Las cinco cuestiones se **resolvieron** el 2026-10-19 (§15) y las seis de la revisión el 2026-10-20
(§16). No hay dependencias de decisión: **ningún requisito queda condicionado** y **no queda ninguna
pregunta abierta**.

| Pregunta | Decisión tomada | DP | Requisitos / criterios que fija |
|---|---|---|---|
| **P-01** — dónde vive el disparador | **Control flotante de robot** (opción a) | DP-11 | RF-12, RF-13, AC-12, AC-13, CL-03, CL-06, CL-08 |
| **P-02** — alcance por vista | **Todo el dashboard** (opción a) | DP-12 | RF-14, AC-14, CL-07 |
| **P-03** — ¿convivencia de capas? | **Sin convivencia**: se cierran el drawer, el modal de Cuenta **y el detalle de tarjeta** en el **único punto de apertura** | DP-05 (confirmado) + DP-15 | RF-06, CL-01, CL-02, CL-14, AC-06 |
| **P-04** — ¿tocar `AsistenteAyuda.jsx`? | **No se toca**: si apareciera un problema **real** de capas o de `Escape`, es un **bloqueo que se reporta** | DP-02 (confirmado) + DP-14 | RF-01, RF-05 |
| **P-05** — nombre accesible | **Literal exacto `Abrir el asistente de ayuda`**, idéntico al de la portada | DP-13 | RF-03, RF-12, AC-12 |
| **D-1** — ¿y el detalle de tarjeta? | **Entra en la regla**: abrir el asistente cierra el detalle **sin tocar `ModalTarjeta`**, con señal explícita por `Outlet context` (§4.5) | DP-15 | RF-06, CL-02, CL-14, AC-06 |
| **D-2** — aspecto del control flotante | **`z-40`**, solo tokens, **sin hover ni escala**, geometría sobre el BottomNav (~60 px) + reserva de área segura aplicada en el `bottom` (`env(..., 0px)`), no con `.safe-bottom` (reserva real **pendiente**, D-5) | DP-16 | RF-09, RF-12, AC-09, AC-12, CL-03, CL-11 |
| **D-3** — `MEMORY.md` al cierre | **Solo la línea** de referencia de la 017 (ruta y estado); no se toca el texto de hex ni la línea de ajenos | DP-17 | §9, cierre |
| **D-4** — nodo saliente del detalle | **Se acepta y se documenta**: durante ~0,2 s coexisten dos nodos de diálogo en el DOM y el saliente **no es operable**; los asertos usan `waitFor`; **no** se suprime la animación ni se toca `ModalTarjeta.jsx` | DP-18 | RF-06, CL-02, AC-06, §4.5, §9 |
| **D-5** — reserva del área segura | El disparador **aplica** `env(safe-area-inset-bottom, 0px)` en su desplazamiento (`bottom` calculado), **no** la utilidad `.safe-bottom`; con el inset en **0** (deuda de `viewport-fit=cover` de la 013) la reserva real **no está resuelta**: se registra como **pendiente**, **nunca como verde** | DP-19 | RF-12, CL-03, AC-12, §4.4, §9, §10 |
| **D-6** — respaldo de foco del cruce | **El disparador queda excluido de los candidatos del respaldo** del layout: marca estable `data-respaldo-foco="excluir"` + filtro `!nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)` en `esCandidatoDeCruce`; controles de navegación y contenido siguen siendo candidatos; `useRetornoDeFoco` y las suites **no** se tocan | DP-20 | RF-13, AC-11, AC-15, §4.5 |

---

## 3. Contexto y evidencia

### 3.1 El dashboard: layout compartido, rutas y ausencia de disparador

- **Rutas:** `src/App.jsx:29-49` define **una sola** ruta contenedora `/dashboard` con el elemento
  `DashboardLayout` y **cuatro hijas** (`index`, `transacciones`, `tarjetas`, `configuracion`), más el
  comodín `*` que redirige a `/dashboard` (`:48`). La guardia es
  `TRIAL_ACTIVO ? <DashboardLayout /> : <Navigate to="/login" />` (`src/App.jsx:32`) y el modo demo
  está declarado en `src/config/app.config.js:13` (`TRIAL_ACTIVO = true`).
- **Hay layout compartido:** `src/layout/DashboardLayout.jsx:113-234` es el **único** sitio donde se
  componen sidebar, contenido (`Container` + `<main className="pb-20">` + `Outlet`, `:196-200`),
  navegación inferior (`:204-211`), drawer (`:214-222`) y modal de Cuenta (`:227-231`). **Por tanto
  hay un punto natural de montaje único**: cualquier cosa montada aquí cubre **las cuatro** rutas sin
  tocar ninguna página.
- **Las páginas se componen sueltas y no tienen disparador:** cada una es una `<section>` propia con
  su título (`src/pages/PaginaDashboardInicio.jsx:13-19`, `PaginaDashboardTransacciones.jsx:13-19`,
  `PaginaDashboardTarjetas.jsx:13-19`, `PaginaDashboardConfiguracion.jsx:13-19`). **No hay header** ni
  zona común: 008/009 lo retiraron (cabecera de la 014 §«Basada en», `specs/009-...:56`, `:427`).
- **Navegación actual, sin ayuda:** `src/components/layout/SidebarNavContenido.jsx:29-34` declara
  **tres** enlaces (Inicio, Transacciones, Tarjetas) y `:58-77` el botón del avatar que abre el modal
  de Cuenta. Ese contenido se comparte: sidebar (`SidebarResponsive.jsx:66`) y drawer
  (`DashboardLayout.jsx:220`). La navegación inferior tiene **cuatro** controles
  (`src/components/layout/BottomNav.jsx:18-22` + `:69-81`) sobre una grilla **`grid grid-cols-4`**
  (`BottomNav.jsx:39`): la 013 **ordenó corregir** la grilla de cinco pistas y su §4.5 documenta el
  hallazgo (`specs/013-calidad-css/spec.md:340-347`); el código ya está en `grid-cols-4`.
- **Configuración solo es alcanzable desde el modal de Cuenta:** `DashboardUserModal.jsx:81`
  (`navigate("/dashboard/configuracion")`); **no** está en los tres enlaces del sidebar
  (`SidebarNavContenido.jsx:29-34`). Es relevante para el **alcance total** decidido
  (RF-14/DP-12): el asistente debe cubrir también esta ruta.
- **El estado de la UI de la landing**: `src/pages/PaginaInicio.jsx:29` (`ayudaAbierta`),
  `:64-69` (montaje del asistente con `estadoVisual="vacio"` y `triggerRef`) y `:72-80` (el control
  flotante de robot, 44×44, `fixed bottom-6 right-6 z-40`, con el `aria-label` literal
  `Abrir el asistente de ayuda` en `:75` y `BotMessageSquare` en `:79`).

### 3.2 Capas reales del dashboard y del asistente (verificado 2026-10-19)

| Capa | `z-index` | Mecanismo | Evidencia |
|---|---|---|---|
| Control de robot de la **portada** | `z-40` | control flotante | `src/pages/PaginaInicio.jsx:77` |
| **Sidebar** (≥768px) | `z-40` | `glass-surface` a sangre | `src/components/layout/SidebarResponsive.jsx:28-29` |
| **BottomNav** (<768px) | `z-50` | `glass-surface`, `safe-bottom`, `grid-cols-4` | `src/components/layout/BottomNav.jsx:39` |
| **Drawer**: backdrop | `z-50` | velo `bg-bg-dark/80 backdrop-blur-sm` (portal a `body`) | `src/components/layout/DashboardDrawer.jsx:134-141` |
| **Drawer**: panel | `z-55` | `glass-surface`; **capa de Esc = 55** | `DashboardDrawer.jsx:108`, `:37`, `:71` |
| **Cuenta**: overlay | `z-50` | velo `bg-bg-dark/80 backdrop-blur-sm` (portal) | `src/components/layout/DashboardUserModal.jsx:157-164` |
| **Cuenta**: panel | `z-60` | `bg-bg-cream/95 glass-surface`; **capa de Esc = 60** | `DashboardUserModal.jsx:109`, `:66` |
| **Detalle de tarjeta**: backdrop | `z-50` | velo `bg-bg-dark/60 backdrop-blur-sm` | `src/components/domain/modales/ModalTarjeta.jsx:106` |
| **Detalle de tarjeta**: panel | sin `z` | `glass-card` (**sólida**) | `ModalTarjeta.jsx:119`; 013 `:298-304` |
| **Asistente**: scrim | `z-50` | `bg-bg-dark/70`, **sin `backdrop-filter`**; gana al BottomNav (`z-50`) por orden de documento; **no** se compara con el panel del drawer (`z-55`) porque no coexisten (RF-06) | `AsistenteAyuda.jsx:105` |
| **Asistente**: panel | `relative z-60` | `bg-bg-cream/95 glass-surface` | `AsistenteAyuda.jsx:116` |
| **Asistente**: capa de Esc | `zIndex: 60` | `useCierreConEsc` | `AsistenteAyuda.jsx:90` |
| **Disparador del asistente en el dashboard** (nuevo) | `z-40` | control flotante, solo tokens, **sin hover ni escala** | D-2/DP-16, RF-12 |

**Lectura correcta de las capas (corrección del cierre de bloqueantes):** el scrim del asistente
(`z-50`) **no puede** quedar por encima del panel del drawer (`z-55`) por CSS; **no se exige**. La
garantía verificable de RF-07 es (a) que el scrim gane al **BottomNav** (`z-50`, empate resuelto por
orden de documento: el asistente se monta después) y al **sidebar** (`z-40`), y (b) que **no
coexista** con el drawer ni con el detalle de tarjeta porque RF-06 los cierra en el mismo punto de
apertura (AC-06). Si por un defecto coexistieran, el panel del drawer (`z-55`) taparía al asistente y
se registraría como **defecto** (CL-01), no como comportamiento aceptable.

**Hallazgos que condicionan la integración (esto es lo que la spec debe dejar explícito):**

1. **El scrim del asistente (`z-50`) empata con el BottomNav (`z-50`) y con los velos del drawer y de
   Cuenta.** Un empate de `z-index` se resuelve **por orden de documento**: el que va después pinta
   encima. El panel del asistente es `relative z-60` **dentro** del scrim, así que no puede superar la
   capa del scrim respecto de sus hermanos de `body`. Consecuencia directa: **el asistente debe
   montarse después del BottomNav en el orden del DOM** (en el layout, no dentro de `<main>`/páginas);
   si se montara antes, el BottomNav quedaría **por encima del scrim y seguiría siendo clicable** con
   el asistente abierto, lo que rompería «una sola superficie» (010 RF-07).
2. **El panel del drawer (`z-55`) está por encima del scrim del asistente (`z-50`).** Si el asistente
   se abriera **con el drawer abierto**, el drawer taparía al asistente. Por eso abrir el asistente
   **debe cerrar el drawer** en el mismo punto de apertura —patrón ya usado para Cuenta
   (`DashboardLayout.jsx:136-139`)— y **no** coexisten (010 RF-07/RF-13). Esto es **P-03, resuelto
   así** (DP-05, RF-06).
3. **Empate de capa de Esc a 60 con el modal de Cuenta.** `useCierreConEsc` cierra **solo la capa
   superior**: mayor `zIndex` y, **en empate, la registrada más tarde**
   (`src/hooks/useCierreConEsc.js:17-31`). Como **no coexisten** (una sola superficie), no hay empate
   real; **SI** ocurriera, Esc cerraría **una sola** capa y la segunda pulsación cerraría la otra
   (010 RF-04, defensa de `specs/010-cierre-de-modales/spec.md:414-420`). No se toca el `zIndex: 60`
   del componente: se resuelve por diseño, no por número (DP-06).
4. **Retorno de foco:** `useRetornoDeFoco` recorre **disparador → elemento capturado al abrir →
   control estable de la versión de vista** (`src/hooks/useRetornoDeFoco.js:114-125`), y el respaldo
   del dashboard ya es «botón `Abrir menú`» en móvil y «control de la navegación lateral» en ≥768px
   (`:66-75`). Con el **control flotante** (P-01 a, DP-11) el disparador **sigue montado** al abrir
   el asistente, así que el foco vuelve **exactamente** a él (RF-13); el respaldo de 011 queda solo
   como defensa por si el control desapareciera por una edición posterior (CL-05), no como camino
   esperado. **Matiz del cruce de 768px (D-6/DP-20):** el respaldo **del layout**
   (`trasladarFocoDeCruce`, `DashboardLayout.jsx:72-81`) usa como último escalón el **primer control
   enfocable** del documento (`:79`), y `SELECTOR_ENFOCABLE` (`:23-24`) incluye cualquier `button`; el
   disparador nuevo, al ser un `button` del layout, ganaría ese escalón y cambiaría el destino que fija
   la prueba cerrada `DashboardLayout.test.jsx:427-451`. Por eso el disparador lleva
   `data-respaldo-foco="excluir"` y `esCandidatoDeCruce` (`:46-54`) lo descarta (§4.5); el hook no se
   modifica y los controles reales de navegación y de contenido siguen siendo candidatos.
5. **El detalle de tarjeta también es una superficie del dashboard, y su estado vive fuera del
   layout.** `tarjetaActiva` es estado local de `src/pages/PanelTarjetas.jsx:31`; `ModalTarjeta` se
   monta en esa página (`:43-46`) con backdrop `z-50` (`ModalTarjeta.jsx:106`) y panel `glass-card`
   sin `z` (`:119`). Su velo (`z-50`) cubre el disparador (`z-40`), así que con el detalle abierto el
   control **no es clicable** (igual que con el drawer o Cuenta: CL-01/CL-02). Para garantizar «una
   sola superficie» aunque la activación sea programática, abrir el asistente **debe cerrar el
   detalle desde su dueño** (§4.5, RF-06), **sin tocar** `ModalTarjeta`: recibe `tarjeta={null}`,
   exactamente el mismo cierre que ya produce su `onCerrar` (`PanelTarjetas.jsx:45`).

### 3.3 Presupuesto Fluid Glass **por vista**, medido sobre el dashboard real

Convención de la 013 que se respeta: **velos y overlays no son superficies** y **los controles
tampoco**; **`glass-card` es sólida y opaca**; **el scrim del asistente no lleva `backdrop-filter` y no
cuenta** (`specs/013-calidad-css/spec.md:274-304`).

**Punto de partida medido (013, M-8, dashboard real):** base **1 superficie / 0 blobs**; drawer
**2 / 0**; modal **2 / 0**; a 1440×900 y a 375×812 (`specs/013-calidad-css/spec.md:914-919`, `:925-926`).
El dashboard **no tiene blobs** (no hay ningún elemento tipo blob en `src/`: barrido de `blob`,
`radial-gradient`, `blur-[…]` sin coincidencias fuera del halo del `Hero` de la landing,
`src/components/domain/landing/Hero.jsx:29-32`).

| Vista / estado | Superficies translúcidas | Blobs | Composición (evidencia) |
|---|---|---|---|
| `/dashboard` (o cualquier hija), ≥768px, **base** | **1** | **0** | sidebar `glass-surface` (`SidebarResponsive.jsx:29`); `Card` es `glass-card` **opaca** (`Card.jsx:13`; 013 `:298-304`) |
| `/dashboard/*`, ≥768px, **Cuenta abierta** | **2** | **0** | sidebar + panel de Cuenta (`DashboardUserModal.jsx:109`); el overlay es velo, no cuenta (`:161`) |
| `/dashboard/*`, ≥768px, **asistente abierto** (esperado) | **2** | **0** | sidebar + panel del asistente (`AsistenteAyuda.jsx:116`); el scrim no cuenta (`:105`) |
| `/dashboard/tarjetas`, **detalle abierto** | **1** | **0** | sidebar; panel `glass-card` **opaca** (`ModalTarjeta.jsx:119`) y backdrop = velo (`:106`) |
| `/dashboard/*`, <768px, **base** | **1** | **0** | BottomNav `glass-surface` (`BottomNav.jsx:39`) |
| `/dashboard/*`, <768px, **drawer abierto** | **2** | **0** | BottomNav + panel del drawer (`DashboardDrawer.jsx:108`); su backdrop es velo (`:138`) |
| `/dashboard/*`, <768px, **asistente abierto** (esperado) | **2** | **0** | BottomNav + panel del asistente; el scrim no cuenta |
| `/dashboard/*`, **drawer + asistente** | **3** | 0 | **No debe ocurrir**: el control flotante (`z-40`) queda **bajo** el velo del drawer (`z-50`) y no es clicable, y RF-06 cierra el drawer en el único punto de apertura; si ocurriera, el panel del drawer (`z-55`) **taparía** al asistente |
| `/dashboard/tarjetas`, **detalle + asistente** | **2** | **0** | **No debe ocurrir**: el disparador (`z-40`) queda bajo el velo del detalle (`z-50`) y RF-06 lo cierra en el mismo commit; si ocurriera, el scrim del asistente (`z-50`, más tarde en el DOM) cubre el detalle, pero convivirían dos diálogos modales (010 RF-07) y, durante ~0,2 s, el nodo saliente del detalle —no operable— (DP-18) |
| Disparador flotante del asistente | **0** | **0** | Es **control**, no superficie (013 `:283`, `:294-297`) y **no lleva `backdrop-filter`** (DP-04) |

**Conclusión:** con el asistente abierto el dashboard pasa de **1 / 0** a **2 / 0** por vista, **muy
por debajo** del límite 3/2, y **no se añade ningún blob**. La superficie nueva es **solo el panel**.

**Excepción que hay que respetar:** la exención de M-3b de la 013 cubre **únicamente el control de
`src/pages/PaginaInicio.jsx:72-80`** (su `className` con `backdrop-blur-md` está en `:77`; `:55` es
`<LandingLayout>`, no el control) (`specs/013-calidad-css/spec.md:283`, `:292-297`, `:852`). Un
**control nuevo con `backdrop-blur`** en el dashboard sería un uso **fuera del inventario** de la 013
y obligaría a reabrirla ⇒ **el disparador del dashboard no debe llevar `backdrop-filter`** (DP-04).

### 3.4 Tokens, radios y contraste

- Paleta y radio: `src/styles/index.css:15-22` (`bg-dark`, `bg-cream`, `emerald-primary`,
  `emerald-hover`, `mint-accent`, `slate-text`, `border-line`), `:24-28` (`cat-*`) y `:30`
  (`--radius-glass: 24px`).
- **Familias de tokens admitidas para el código nuevo** (lista cerrada que hace decidible «solo
  tokens»): colores `bg-dark`, `bg-cream`, `emerald-primary`, `emerald-hover`, `mint-accent`,
  `slate-text`, `border-line`, `cat-income`, `cat-expense`, `cat-savings`, `cat-other`, con
  modificador de opacidad `/NN` (`bg-bg-dark/80`, `border-border-line/30`, `text-bg-cream`); radio
  `--radius-glass`/`rounded-3xl`; y las utilidades `glass-surface`, `glass-card`, `safe-bottom` según
  su inventario (el **disparador no usa ninguna de las tres**).
  **No** se admiten: colores de la paleta nombrada de Tailwind (`white`, `black`, `slate-800`,
  `emerald-500`, `transparent`…), valores arbitrarios **de color** (`bg-[…]`, `text-[…]`,
  `border-[…]`) ni literales `#`, `rgb(`, `hsl(` u `oklch(`. Los valores arbitrarios de **geometría**
  (`bottom-[…]`) sí se admiten.
  **Chequeo decidible (AC-09/AC-12):** en el `className` del disparador y en las líneas añadidas del
  diff de producción se comprueba (1) que no aparece `#`, `rgb(`, `hsl(` ni `oklch(`; (2) que no hay
  valores arbitrarios en familias de color (`(?:bg|text|border|ring|ring-offset|fill|stroke|placeholder|outline|decoration|caret|accent|divide|from|via|to|shadow)-\[`); (3) que ninguna utilidad
  de familia que acepta color casa con la paleta nombrada:
  `(?:^|[\s"'])(?:[a-z-]+:)*(?:bg|text|border|ring|ring-offset|fill|stroke|placeholder|outline|decoration|caret|accent|divide|from|via|to|shadow)-(?:white|black|transparent|current|inherit|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{1,3})?(?:\/\d{1,3})?(?:\s|"|'|$)`
  (los sufijos de tamaño, ancho o estilo como `text-sm`, `border-2`, `ring-2`, `outline-none` no
  casan y se admiten; la frontera incluye **espacios y comillas** —`[\s"']` al inicio y `\s|"|'|$` al
  final— para que una utilidad pegada a la comilla del `className` no se escape, y **no** casa con los
  nombres de token con guion que §3.4 admite —`ring-emerald-primary`, `text-slate-text`— porque tras
  `emerald`/`slate` sigue `-`, que no es frontera válida; `text-white`, `bg-black/70` y `text-slate-800`
  **sí** casan); y (4) que no hay `style` en línea con color/fondo/borde ni `fill`/`stroke`
  literales, con estas dos regex explícitas:
  `/style=\{\{[^}]*(?:\bcolor\b|\bbackground(?:Color)?\b|\bborder(?:Color|TopColor|RightColor|BottomColor|LeftColor)?\b|\boutline(?:Color)?\b|\bfill\b|\bstroke\b)\s*:/i`
  y `/\b(?:fill|stroke)="(?:#|rgb|hsl|oklch)/i` (`fill="currentColor"` y `fill="none"` no casan).
  Con (1)–(4), cualquier color restante solo puede venir de los once tokens.
- Superficies: `:79-82` (`glass-surface`, solo el filtro), `:88-94` (`glass-card`, blanca opaca),
  `:111-121` (blur 14px en ≤640px) y `:124-135` (`prefers-reduced-transparency` desactiva el filtro).
- Área segura: `src/styles/index.css:34-36` (`.safe-bottom` = `padding-bottom:
  env(safe-area-inset-bottom, 1rem)`; **padding**, no desplazamiento, y su fallback es `1rem`). El
  disparador **no** usa esa utilidad: aplica `env(safe-area-inset-bottom, 0px)` dentro de su
  **desplazamiento** (`bottom: calc(<altura del BottomNav> + env(safe-area-inset-bottom, 0px) +
  <margen>)`, §4.4; D-5/DP-19), de modo que el offset **suma** la reserva. **Limitación heredada de
  la 013**: sin `viewport-fit=cover` el `env()` **resuelve 0** y no hay efecto observable
  (`specs/013-calidad-css/spec.md:321-338`, `:909`; `MEMORY.md:33`). Por eso la reserva real se
  registra como **pendiente** y **nunca como verde**; esta spec **no** añade `viewport-fit` ni reabre
  la 013.
- El contenido del dashboard es **fondo sólido** `bg-bg-cream` (`DashboardLayout.jsx:192`), así que el
  contraste del panel claro del asistente se mide sobre el mismo fondo compuesto que ya usa la 014
  (panel `bg-bg-cream/95` sobre scrim `bg-bg-dark/70`, 014 §3.4/CL-13) — protocolo de la 013 (manual).
- **Cero hexadecimales nuevos** en las líneas añadidas del diff de **producción**
  (`src/**/*.js`, `src/**/*.jsx`, excluyendo suites), mismo criterio que el usuario fijó el
  2026-10-19 para la 014 (014 DP-04/§9). La migración global de hex sigue **sin decidir**; RF-09 solo
  gobierna el código **nuevo** de esta spec.

### 3.5 Lo que **no** se toca (y por qué)

| Archivo | Motivo |
|---|---|
| `src/components/domain/modales/AsistenteAyuda.jsx` y `AsistenteAyuda.test.jsx` | Es el diseño **aprobado e implementado** de la 014; se reutiliza tal cual (DP-02). La suite prueba los literales copiados carácter a carácter (`AsistenteAyuda.test.jsx:15-41`) |
| `src/styles/index.css` y `src/styles/index.css.test.js` | 013 **cerrada**; M-3b y el inventario **no se re-miden** |
| `src/components/layout/DashboardDrawer.jsx`, `DashboardUserModal.jsx`, `src/components/domain/modales/ModalTarjeta.jsx`, `AuthModal.jsx` | Cromo congelado de 010/011; **no se modifica**. El **estado** que abre `ModalTarjeta` se cierra desde su dueño (`PanelTarjetas`, D-1/DP-15), no desde el modal |
| `src/components/layout/SidebarResponsive.jsx`, `SidebarNavContenido.jsx`, `BottomNav.jsx` | Navegación cerrada por 007/008/009; **no cambian** estructura, grilla (`grid-cols-4`) ni clases: el disparador es un **control flotante** fuera de la navegación (P-01 a, DP-11) |
| `src/pages/PaginaInicio.jsx` y su control de robot | La landing **no se toca**; su `className` con literales hex y su exención de M-3b siguen intactos |
| `src/config/app.config.js`, `src/config/api.config.js`, `index.html` | Sin cambios |
| `MEMORY.md` | El planner **solo escribe en `specs/`**. El **cierre de la 017 sí añadirá su línea** de referencia (ruta y estado), **solo esa línea**, sin tocar el texto de hexadecimales ni la línea de archivos ajenos (D-3/DP-17) |

**Sí se tocan (D-1/D-6), y solo para esto:** `src/layout/DashboardLayout.jsx` (estado, señal de cierre,
montaje, control flotante con la marca `data-respaldo-foco="excluir"` y el filtro del respaldo de foco)
y `src/pages/PanelTarjetas.jsx` (registro del cierre del detalle). Se añade **un archivo de pruebas
nuevo** (`src/layout/AsistenteDashboard.test.jsx`); **ninguna** suite cerrada se edita (AC-11/AC-15).

---

## 4. Diseño de la reutilización

### 4.1 Montaje único, estado en el layout (RF-02)

El asistente se monta **una sola vez** por render del dashboard. El estado `ayudaAbierta` vive junto a
los otros dos estados de superficie del layout (`mobileMenuAbierto`, `userModalAbierto`,
`DashboardLayout.jsx:118-119`), y el cierre de las otras superficies se hace en el **único punto de
apertura**, con el mismo patrón que ya existe para Cuenta (`:136-139`).

El **detalle de tarjeta** no lo controla el layout: `tarjetaActiva` vive en `PanelTarjetas`, así que
el punto de apertura no puede apagarlo con un `setState` local. Se resuelve con una **señal explícita
de cierre** por `Outlet context` (§4.5): el layout invoca el cierre registrado por `PanelTarjetas` en
el mismo manejador, y el detalle se apaga en el **mismo commit** que enciende el asistente.

Esto evita dos defectos concretos: (a) **ids duplicados** — el componente usa ids fijos
(`asistente-titulo`, `asistente-marca`, `asistente-nota`, `asistente-reserva`, `asistente-entrada`,
`AsistenteAyuda.jsx:113-114`, `:122`, `:128`, `:133`, `:200`, `:209`) y `aria-labelledby`/`for`
apuntarían al primer nodo del documento; y (b) **dos trampas de foco** activas, prohibidas por 010
RF-07.

### 4.2 Lo que **comparte** con la 014 (idéntico, verbatim)

| Compartido | Valor / comportamiento | Evidencia |
|---|---|---|
| Título | `Asistente de ayuda` | `AsistenteAyuda.jsx:16`; 014 §4.3 |
| Marca de demostración | `Demostración · No es una IA real` | `:17` |
| Nota de diseño | `Vista de diseño: contenido de ejemplo; aún no responde preguntas.` | `:18` |
| Estado vacío | `Aún no hay mensajes. …` + las cuatro sugerencias + aviso de reserva | `:19-26`, `:44-45` |
| Conversación de muestra | `Conversación de ejemplo` + las cuatro burbujas con etiquetas `Tú`/`Asistente` en `sr-only` | `:27-41`, `:162-196` |
| Pie | `Tu pregunta` (label `sr-only`), `Escribe una pregunta…`, `Enviar` con `aria-disabled="true"` | `:46-48`, `:199-222` |
| Región de mensajes | `role="log"` **solo** para mensajes, `aria-live="polite"`, `aria-relevant="additions"`, `aria-atomic="false"`, `aria-label="Mensajes del asistente"` | `:168-175` |
| Cierre | `Cerrar asistente de ayuda` en `BotonCerrar`; Esc (capa 60), clic en scrim, gesto en móvil | `:42`, `:90-101`, `:137-141` |
| Panel | `bg-bg-cream/95` + `glass-surface`, borde `border-border-line/30`, `rounded-3xl`, `shadow-xl`, `max-h-[85vh]`, `flex flex-col`, **un solo scroll** (body) | `:116`, `:144` |
| Scrim | `bg-bg-dark/70` **sin `backdrop-filter`** | `:105` |
| Estados | Prop presentacional `estadoVisual` (`'vacio'` por defecto) | `:80`, `:85` |
| Sin lógica | Chips y «Enviar» sin `onClick`; campo sin `onChange`/`value`/`onSubmit`; sin `useState`/`useReducer`; sin red | `:149-157`, `:208-220` |

### 4.3 Lo que **diverge** (y hay que declararlo)

| Divergencia | Detalle | Estado |
|---|---|---|
| **Punto de uso** | La landing monta el asistente en la página (`PaginaInicio.jsx:64-69`); el dashboard lo monta en el **layout** (RF-02/RF-14, P-02 a) | Decidido (DP-12) |
| **Disparador** | En la portada es **un** botón flotante de robot (`PaginaInicio.jsx:72-80`); en el dashboard es **el mismo** control flotante —mismo icono `BotMessageSquare` y mismos atributos— con **nombre accesible literal idéntico** y geometría propia por encima del BottomNav (RF-12) | Decidido (DP-11/DP-13) |
| **Clases del disparador** | El control de la portada conserva literales hex (`bg-[#0f1117]/80`, `hover:bg-[#1a7a5e]`, `text-white`, `border-white/20`) y `backdrop-blur-md` (`PaginaInicio.jsx:77`). **No se copian jamás**: el del dashboard usa **solo tokens**, va **sin `backdrop-filter`** y **sin hover, sin escala ni transición** (RF-09/RF-12/DP-04/DP-16) | Decidido |
| **Cierre previo de superficies** | El layout cierra drawer y Cuenta con `setState` local (patrón `:136-139`); el detalle de tarjeta se cierra con la señal registrada por `PanelTarjetas` (§4.5) | Decidido (DP-15) |
| **Presupuesto Fluid Glass** | En la portada el chrome es `glass-hero` + header; en el dashboard es **sidebar o BottomNav** (§3.3). El conteo esperado con el asistente abierto es **2 / 0** por vista | Medido/derivado |
| **Respaldo del retorno de foco** | El dashboard tiene los controles estables de 011 (`Abrir menú` / navegación lateral); la portada cae a su primer control enfocable. En el dashboard, el disparador se **excluye** del respaldo del layout (`data-respaldo-foco="excluir"`, D-6/DP-20) para que el escalón «primer control enfocable» siga apuntando al contenido; el hook no se modifica | Heredado + D-6 |
| **Fallback y transparencia reducida** | Idénticos al componente reutilizado (no se tocan) | Heredado |

### 4.4 El disparador flotante: invariantes (RF-12, P-01 a, D-2, D-5)

- **Alcanzable por teclado y por toque**, con **área táctil ≥44×44 px** (`w-11 h-11`) y **foco
  visible** con tokens: `focus-visible:outline-none` + `focus-visible:ring-2` + un color de anillo de
  la lista cerrada de §3.4 (`ring-mint-accent/50` o `ring-emerald-primary`) + `ring-offset-2
  ring-offset-bg-dark`, el mismo patrón que ya usa el control de la sidebar (`SidebarResponsive.jsx:44-45`)
  y el cromo congelado (`ModalTarjeta.jsx:131`, `AsistenteAyuda.jsx:140`). **No** se cita como
  evidencia el contorno nativo del navegador de `BottomNav.jsx:73-77` ni de
  `SidebarNavContenido.jsx:44-50`: esos controles **no** declaran `focus-visible:*`. **Sin hover, sin
  escala y sin transición**: ninguna animación al pasar el puntero (D-2).
- **Nombre accesible** estable y en español: el literal **exacto** `Abrir el asistente de ayuda`
  (`PaginaInicio.jsx:75`) es **también** el del dashboard, sin divergencia (P-05/DP-13); el icono es
  `BotMessageSquare` `size={20}` con `aria-hidden="true"` (014 §4.5).
- **Capa `z-40`**, por debajo de los velos `z-50` (drawer, Cuenta, detalle y scrim del asistente) y
  en empate con el sidebar sin solaparse (el sidebar va a la izquierda, el control a la derecha).
- **Aspecto solo desde tokens** (familias de §3.4): color de fondo, texto y borde con tokens y
  modificador de opacidad; **sin** paleta nombrada (`text-white`, `bg-black/70`, `slate-800`), **sin**
  valores arbitrarios de color y **sin** hexadecimales. **Sin `backdrop-filter`** (no añade usos
  fuera del inventario de la 013; DP-04) y **sin** `glass-surface`/`glass-card` (es control, no
  superficie).
- **Sin tapar ni quedar tapado por el cromo**: en móvil el control va **por encima** del BottomNav
  (altura ≈60 px, `BottomNav.jsx:39`) **más la reserva de área segura** **más un margen**, sin
  desbordar el viewport ni tapar el 4.º control «Menú»; geometría revisada a 375×812; en ≥768px, sin
  invadir la sidebar (`w-64`/`w-[72px]`, `DashboardLayout.jsx:193`). **Mecanismo del offset (fijado
  aquí, D-5/DP-19):** el control **DEBE** aplicar `env(safe-area-inset-bottom, 0px)` dentro de su
  **`bottom` calculado**, p. ej. la clase de geometría
  `bottom-[calc(<altura del BottomNav>_+_env(safe-area-inset-bottom,0px)_+_<margen>)]` (o un
  `style={{ bottom: "calc(...)" }}` que solo declare `bottom`: geometría, no color; AC-09), **no**
  con la utilidad `.safe-bottom`: esa utilidad (`src/styles/index.css:34-36`) aplica
  `padding-bottom` —padding, no desplazamiento— y su fallback es `1rem`, no `0px`. Con `calc(...)`
  sobre `bottom` la reserva **se suma** al offset; con `.safe-bottom` no. **Límite declarado
  (D-5/DP-19):** con el inset en **0** la reserva real **no está resuelta** y se registra como
  **pendiente** (§9, §10), nunca como verde.
- **No es candidato del respaldo de foco del layout (D-6/DP-20):** el `<button>` lleva la marca
  estable `data-respaldo-foco="excluir"` y `esCandidatoDeCruce` la descarta con
  `!nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)` (`DashboardLayout.jsx:16-24`, `:46-54`). Así el último
  escalón de `trasladarFocoDeCruce` (`:72-81`) sigue apuntando a los controles de contenido, como
  espera la prueba cerrada `DashboardLayout.test.jsx:427-451`, que **no se edita** (§4.5, AC-15).
- **Desplazamiento exacto: se decide en el plan, sin preguntas abiertas.** Los **px de `bottom`** y el
  **margen lateral** del control se fijan en `plan.md` dentro de este rango: por encima de ≈60 px de
  BottomNav **+** la reserva de área segura **+** un margen, sin tapar «Menú» ni desbordar a 375×812,
  y sin invadir la sidebar en ≥768px. Esta spec **no** fija la cifra; el plan **debe** declararla y
  justificarla, y AC-12 la revisa en navegador.
- **Sin semántica de estado añadida**: nada de `aria-haspopup`/`aria-expanded` (014 DP-02 mantiene ese
  criterio en la portada).
- **NO es un quinto control del BottomNav**: eso obligaría a cambiar `grid-cols-4`
  (`BottomNav.jsx:39`; la 013 ordenó corregir la grilla y documenta el hallazgo en
  `specs/013-calidad-css/spec.md:340-347`) o la navegación cerrada de 007/009 — **descarte
  declarado** (DP-11).

### 4.5 Cierre del detalle de tarjeta al abrir el asistente (D-1, D-4) y respaldo de foco (D-6)

**Problema.** La regla de «una sola superficie» (010 RF-07/RF-13) incluye el detalle de tarjeta
(`ModalTarjeta`, abierto desde `/dashboard/tarjetas`), pero su estado **no vive en el layout**:
`tarjetaActiva` es estado local de `src/pages/PanelTarjetas.jsx:31` y `ModalTarjeta` se monta en esa
página (`:43-46`). El layout no puede apagarlo con un `setState` propio.

**Mecanismo elegido: señal explícita de cierre por `Outlet context`.** Es el mínimo que (a) no toca
`ModalTarjeta.jsx` ni su cromo, (b) no mueve el estado ni el marcado de la página, (c) apaga el estado
del detalle en el **mismo commit** que abre el asistente (su nodo saliente se anima aparte, §4.5) y
(d) se verifica desde una prueba del layout.

- **Archivos exactos (3):**
  - `src/layout/DashboardLayout.jsx` — añade el estado `ayudaAbierta`, el `triggerRef` del control
    flotante y el manejador único `alAbrirAsistente`, que en **una sola llamada** invoca el cierre
    registrado del detalle, cierra drawer y Cuenta y abre el asistente; expone el registro mediante
    `<Outlet context={{ registrarCierreDetalle }} />`; monta `AsistenteAyuda` **después** del
    BottomNav en el árbol del layout y el **control flotante inline** al final del fragmento (sin
    archivo de componente nuevo, actualizando la cabecera JSDoc del layout); añade la constante
    `SELECTOR_EXCLUIDO_RESPALDO = '[data-respaldo-foco="excluir"]'` junto a los selectores del cruce
    (`:16-24`) y la condición `!nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)` en `esCandidatoDeCruce`
    (`:46-54`), y marca el `<button>` del disparador con `data-respaldo-foco="excluir"` (D-6).
  - `src/pages/PanelTarjetas.jsx` — registra en el contexto, al montar y con limpieza al desmontar,
    el callback `() => setTarjetaActiva(null)`; **no** cambia su marcado, sus props, su estado ni los
    datos. La lectura del contexto **tolera `null`**, porque sus **12** pruebas montan
    `<PanelTarjetas />` fuera de un `Outlet` (`PanelTarjetas.test.jsx:72-254`) y deben seguir verdes
    sin editarlas (`useOutletContext` sin proveedor devuelve `null`, no lanza:
    `node_modules/react-router/dist/index.js:245-254`).
  - `src/layout/AsistenteDashboard.test.jsx` — **archivo nuevo** de pruebas de la 017 (AC-02,
    AC-06, AC-12, AC-13, AC-14, AC-15 y las comprobaciones de fuente que se indiquen). No se edita
    ninguna suite cerrada (AC-11).
- **Secuencia.** El clic en el control flotante ejecuta `alAbrirAsistente`; dentro del mismo manejador
  se llama al cierre registrado (`setTarjetaActiva(null)`), `setMobileMenuAbierto(false)`,
  `setUserModalAbierto(false)` y `setAyudaAbierta(true)`. React 18 **agrupa** las cuatro
  actualizaciones: detalle, drawer y Cuenta dejan de estar **abiertos** en el **mismo commit** en que
  se monta el asistente. Drawer y Cuenta devuelven `null` al cerrarse (`DashboardDrawer.jsx:79`,
  `DashboardUserModal.jsx:78`), así que desaparecen en ese commit. El detalle **no**: `ModalTarjeta`
  envuelve su rama en `AnimatePresence` (`ModalTarjeta.jsx:102-111`) y conserva el nodo saliente
  durante su transición de salida (0,2 s; `:96`, `:122-125`), de modo que su `role="dialog"` puede
  seguir en el DOM **mientras se anima a desaparecer**. Ese nodo saliente **no es operable**: el foco
  está en el panel del asistente (`FocusTrap`, `AsistenteAyuda.jsx:108-117`), el scrim del asistente lo
  cubre (`z-50`, montado después) y la trampa del detalle es un `onKeyDown` **local** al panel
  (`ModalTarjeta.jsx:81-94`), no un `FocusTrap` global. Por eso AC-06 comprueba la unicidad **con
  `waitFor`** (hasta que termina la salida), no de forma síncrona.
- **Límite declarado y aceptado: nodo saliente del detalle (D-4/DP-18).** Se **acepta** que durante
  ~0,2 s coexistan **dos nodos de diálogo** en el DOM: el del asistente —operable, con el foco y por
  encima del scrim— y el **saliente** del detalle, que deja de ser **operable** en el mismo commit
  (sin foco por el `FocusTrap` del asistente, `AsistenteAyuda.jsx:108-117`; cubierto por el scrim
  `z-50` montado después; su trampa de Tab es **local** al panel, `ModalTarjeta.jsx:81-94`).
  **Justificación:** suprimirlo exigiría desactivar `AnimatePresence` o tocar `ModalTarjeta`, prohibido
  por D-1/010; el nodo no admite interacción ni recibe foco, así que «una sola superficie» se cumple
  en el **plano operable** y la unicidad **estricta** del DOM se alcanza al terminar la salida.
  **Límite:** el intervalo depende de la transición del modal (0,2 s hoy, `ModalTarjeta.jsx:96`,
  `:122-125`; **0** con `prefers-reduced-motion`); si una edición posterior la alargara, AC-06 lo
  absorbe con `waitFor` y **no** se relaja a un aserto síncrono. **No** se suprime la animación, **no**
  se toca `ModalTarjeta.jsx` y **no** se añade una espera artificial al cierre.
- **Foco.** El cierre del detalle dispara el retorno de foco de `useRetornoDeFoco` de `ModalTarjeta`
  (`ModalTarjeta.jsx:71`), que intenta enfocar la tarjeta que lo abrió; la trampa del asistente,
  montada en el mismo commit (`AsistenteAyuda.jsx:108-117`), mantiene el foco **dentro del panel**.
  AC-06 comprueba `dialogo.contains(document.activeElement)` tras la apertura. Al cerrar el
  asistente, el foco vuelve al control flotante (RF-13), no a la tarjeta.
- **Por qué no reabre la 010.** La 010 congela el **cromo** de cada superficie (un único mecanismo de
  cierre, una trampa, una devolución de foco). Aquí **no** se añade un mecanismo de cierre a
  `ModalTarjeta` ni se modifican sus props, su `useCierreConEsc`, su trampa ni su `useRetornoDeFoco`:
  se apaga **el estado del dueño** (`tarjetaActiva`), que es exactamente lo que ya hace su `onCerrar`
  (`PanelTarjetas.jsx:45`). No hay segundo listener de Esc, ni cambio de capas, ni dos superficies
  vivas.
- **Descartes:** (a) **elevar `tarjetaActiva` al layout** — rompe las **12** pruebas que montan
  `<PanelTarjetas />` sin router y cambia la propiedad del estado (004/005); (b) **contexto nuevo en
  archivo aparte** — añade un archivo sin necesidad, `Outlet context` ya existe; (c) **contador en el
  contexto + efecto en `PanelTarjetas`** — deja un commit con dos diálogos y dos trampas montadas
  antes del efecto, contra 010 RF-07; (d) **evento DOM a medida** — mecanismo implícito, sin dueño
  claro y difícil de verificar; (e) **tocar `ModalTarjeta`** — prohibido por D-1/010.
- **Sin registro (defensa).** Fuera de `/dashboard/tarjetas` no hay callback registrado y la señal es
  un **no-op** (`?.()`); al desmontar `PanelTarjetas` se limpia el registro, de modo que nunca se
  llama a `setState` de un componente desmontado (CL-14).

**Exclusión del disparador del respaldo de foco (D-6 → DP-20).** El cruce de 768px usa
`trasladarFocoDeCruce` (`src/layout/DashboardLayout.jsx:72-81`), cuyo último escalón es
`primerCandidatoDeCruce(document.querySelectorAll(SELECTOR_ENFOCABLE))` (`:79`), y
`SELECTOR_ENFOCABLE` (`:23-24`) incluye **cualquier** `button`. El disparador nuevo es un `button` del
layout y, en orden de documento, precede al botón de contenido que añade la prueba cerrada
`DashboardLayout.test.jsx:427-451` (ese botón se inserta en `body` **después** del contenedor de
React), así que **ganaría el respaldo** y rompería la prueba, que esta spec prohíbe editar (AC-11).

- **Mecanismo mínimo y exacto (3 piezas, solo en el layout):**
  1. **Marca estable** en el `<button>` del disparador inline, al final del fragmento del layout
     (después de `DashboardUserModal`, `DashboardLayout.jsx:227-231`):
     `data-respaldo-foco="excluir"`.
  2. **Constante** junto a los selectores del cruce (`DashboardLayout.jsx:16-24`):
     `const SELECTOR_EXCLUIDO_RESPALDO = '[data-respaldo-foco="excluir"]';`.
  3. **Filtro** en `esCandidatoDeCruce` (`DashboardLayout.jsx:46-54`): añadir
     `!nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)` a la conjunción. Como `primerCandidatoDeCruce`
     (`:57-62`) valida con esa función, la exclusión cubre el escalón preferido, el alterno y el
     «primer control enfocable».
- **`useRetornoDeFoco` no se toca.** `resolverControlDeVista` (`useRetornoDeFoco.js:66-75`), su
  `SELECTOR_ENFOCABLE` (`:17-18`) y `esControlDeRespaldo` (`:43-45`) quedan **idénticos**. El retorno
  de foco de cada superficie sigue intentando primero `triggerRef` (`:114-118`), que para el asistente
  es el propio disparador (RF-13); el filtro del layout solo afecta al respaldo del **cruce de
  versión de vista**.
- **No debilita la 011.** La garantía de 011 (control estable de la versión de vista → el otro control
  estable → primer control enfocable, nunca `body` ni un nodo desconectado) sigue vigente para todos
  los controles **reales** de navegación y de contenido: los pasos 1 y 2 no cambian, y el paso 3
  sigue eligiendo el primer control enfocable **de contenido** porque solo se descarta el nodo nuevo,
  que no existía en 011 y no es un control de navegación. La prueba cerrada
  `DashboardLayout.test.jsx:427-451` se cumple **sin editarla**: al excluir el disparador, el
  `document.activeElement` vuelve a ser el botón de contenido que la prueba añade.
- **Verificación de fuente (AC-15).** `DashboardLayout.jsx` marca el `<button>` del disparador con
  `data-respaldo-foco="excluir"` —y la constante `SELECTOR_EXCLUIDO_RESPALDO` contiene el mismo
  literal—, de modo que el **total** de apariciones **no es criterio**: la cabecera JSDoc (§4.5) puede
  mencionarlo. La comprobación decisiva es la partición de AC-15, que descarta la declaración y las
  líneas de comentario y exige **1** línea, la del atributo; `SELECTOR_EXCLUIDO_RESPALDO` aparece en la
  declaración y en `esCandidatoDeCruce`;
  `DashboardLayout.test.jsx` queda con `git diff HEAD --stat` **vacío** y verde.

---

## 5. Requisitos funcionales (EARS)

### 5.1 Requisitos del diseño reutilizado (firmes)

- **RF-01 — Ubicuo — Reutilización sin cambios del diseño de la 014.** El dashboard **DEBE** montar el
  componente existente `AsistenteAyuda` (`src/components/domain/modales/AsistenteAyuda.jsx`) **tal
  cual**: **NO DEBE** modificarse ese archivo ni su suite, **NO DEBE** copiarse su marcado a otro
  archivo ni duplicarse el componente, y **NO DEBEN** cambiarse sus props (`abierto`, `estadoVisual`,
  `alCerrar`, `triggerRef`), sus literales, su ARIA, sus clases de panel/scrim, su `zIndex: 60` de Esc
  (`:90`) ni el `z-50`/`z-60` de scrim y panel (`:105`, `:116`). El **único** cambio admitido es un
  **punto de uso nuevo** en el dashboard. *(Firmado por P-04/DP-14: si un problema **real** de capas o
  de `Escape` exigiera tocar el componente, es un **bloqueo que se reporta**; no se resuelve tocando
  la 014.)*
- **RF-02 — Ubicuo — Montaje único y estado en un solo punto.** El estado de apertura/cierre
  **DEBE** vivir en el layout del dashboard (`DashboardLayout`) junto a los demás estados de
  superficie (`:118-119`), y el componente **DEBE** montarse **exactamente una vez** por render del
  dashboard, **NO** una vez por página: **NO DEBEN** existir dos nodos con los ids
  `asistente-titulo`/`asistente-marca`/`asistente-nota`/`asistente-reserva`/`asistente-entrada` ni
  **dos trampas de foco** simultáneas.
- **RF-03 — Ubicuo — Literales idénticos a la 014 (verbatim).** Todos los textos visibles y los
  nombres accesibles **DEBEN** ser **exactamente** los de la 014 §4.3 — incluidos
  `Asistente de ayuda`, `Demostración · No es una IA real`,
  `Vista de diseño: contenido de ejemplo; aún no responde preguntas.`,
  `Cuando la ayuda esté activa, si tu pregunta no coincide verás una respuesta de reserva.`,
  `Aún no hay mensajes. …`, las **cuatro** sugerencias, `Tu pregunta`, `Escribe una pregunta…`,
  `Enviar`, `Cerrar asistente de ayuda` y `Mensajes del asistente`. **NO DEBE** introducirse ningún
  texto nuevo, ninguna variante ni ningún guion adaptado al dashboard.
- **RF-04 — Evento — El dashboard usa el estado `vacio`.** En la aplicación, el asistente del
  dashboard **DEBE** montarse con `estadoVisual="vacio"` (el valor por defecto del componente), igual
  que la portada (`PaginaInicio.jsx:66`). La variante `conversacion` **DEBE** seguir existiendo **solo**
  para revisión de diseño y pruebas; **NO DEBE** haber en el dashboard control, gesto, transición ni
  temporizador que la provoque (014 RF-07/DP-07).
- **RF-05 — Ubicuo — Cromo de 010/011 intacto.** La superficie **DEBE** conservar `role="dialog"`,
  `aria-modal="true"`, `aria-labelledby="asistente-titulo"`,
  `aria-describedby="asistente-marca asistente-nota asistente-reserva"`, la trampa de foco **real**
  con foco inicial en el panel (`tabIndex={-1}`), la «X» `Cerrar asistente de ayuda` como **único**
  control visible de cierre, el cierre por Esc con el **único mecanismo** (`useCierreConEsc`), el clic
  en el scrim y el gesto de deslizar en móvil. **NO DEBEN** modificarse `DashboardDrawer`,
  `DashboardUserModal`, `ModalTarjeta` ni `AuthModal`.
- **RF-06 — Estado — Una sola superficie modal en el dashboard.** **MIENTRAS** el asistente esté
  abierto **NO DEBE** existir ninguna otra superficie modal del dashboard abierta, interactiva **ni
  operable**: en el **único punto de apertura** del asistente **DEBEN** cerrarse el drawer, el modal de
  Cuenta **y el detalle de tarjeta** —el drawer y Cuenta con el patrón de
  `DashboardLayout.jsx:136-139`; el detalle con la señal registrada de §4.5 (DP-15)— y **NO DEBE**
  existir otra llamada de apertura. El cierre del detalle **NO DEBE** modificar `ModalTarjeta.jsx` ni
  su cromo: se apaga su estado dueño (`tarjetaActiva` en `PanelTarjetas`). El único nodo de diálogo
  tolerado además del asistente es el **saliente** del detalle, que deja de ser **operable** en el
  mismo commit durante su animación de salida (**límite aceptado D-4/DP-18**, §4.5). El scrim **DEBE**
  cubrir todo el viewport, de modo que el BottomNav, el sidebar, el drawer y el disparador **NO DEBEN**
  ser clicables con el asistente abierto.
- **RF-07 — Ubicuo — El asistente pinta por encima del cromo del dashboard.** El punto de montaje
  **DEBE** quedar **después** del chrome del dashboard en el orden del documento (después del
  `BottomNav` de `DashboardLayout.jsx:204-211`), nunca dentro de `<main>`/`Container` ni en una página;
  **NO DEBE** portalizarse desde el componente reutilizado (eso lo modificaría). Con el asistente
  abierto, el scrim (`z-50`) **DEBE** quedar por encima del BottomNav (`z-50`, empate resuelto por
  orden de documento) y del sidebar (`z-40`), y el panel del asistente (`relative z-60` **dentro** del
  scrim) **DEBE** quedar visible por encima del contenido y del cromo. **NO DEBE** coexistir con el
  drawer ni con el detalle de tarjeta: RF-06 los cierra en el mismo punto de apertura (DP-05/DP-15), y
  por eso **no se exige** —ni es posible por CSS— que el scrim (`z-50`) quede por encima del panel del
  drawer (`z-55`); si coexistieran por un defecto, el panel del drawer taparía al asistente y se
  registraría como **defecto** (CL-01).
- **RF-08 — Ubicuo — Presupuesto Fluid Glass por vista.** En el dashboard, sin el asistente, cada vista
  **DEBE** mostrar **1 superficie translúcida y 0 blobs** (≥768px: sidebar; <768px: BottomNav) y, con
  el asistente abierto, **2 superficies y 0 blobs** (chrome + panel). El panel **DEBE** ser la **única**
  superficie nueva; el scrim **NO DEBE** llevar `backdrop-filter` y **NO DEBE** contarse como
  superficie; **NO DEBE** añadirse ningún blob ni ninguna superficie nueva con blur; `glass-card`
  **DEBE** seguir siendo la tarjeta sólida de la 013 (`specs/013-calidad-css/spec.md:298-304`) y
  **NO DEBE** contarse.
- **RF-09 — Ubicuo — Tokens decidibles y cero hexadecimales nuevos.** Todo el color del **código
  nuevo** del dashboard (disparador incluido) **DEBE** salir de las **familias de tokens** de §3.4
  (los once colores `--color-*` de `src/styles/index.css:15-28`, con modificador de opacidad `/NN`);
  **NO DEBEN** usarse colores de la paleta nombrada de Tailwind (`white`, `black`, `slate-800`,
  `emerald-500`…), ni valores arbitrarios de color (`bg-[…]`, `text-[…]`, `border-[…]`), ni
  `#`/`rgb(`/`hsl(`/`oklch(`; **NO DEBEN** copiarse los literales hex del control de la portada ni su
  `backdrop-blur-md` (`PaginaInicio.jsx:77`). La comprobación se hace sobre las **líneas añadidas del
  diff de producción** (`src/**/*.js`, `src/**/*.jsx`, excluyendo las suites
  `*.test.jsx`/`*.test.js`), con el mismo criterio que el usuario fijó el 2026-10-19 para la 014. La
  migración global de hex sigue **sin decidir**; este RF solo gobierna el código nuevo.
- **RF-10 — Ubicuo — Solo diseño, sin lógica ni red.** Esta fase **NO DEBE** implementar motor de
  coincidencia, guion, manejo de texto libre, máquina de estados, reinicio/conservación, persistencia,
  IA, backend, `fetch`, claves, rutas, endpoints, dependencias nuevas ni el correo
  `soporte@finapp.com`. **NO DEBEN** cambiar `app.config`, `api.config`, `index.html`, la guardia de
  `/dashboard` (`src/App.jsx:32`) ni el login. El **único** comportamiento nuevo es **abrir y cerrar**
  el asistente de diseño y **devolver el foco**.
- **RF-11 — Ubicuo — Regresión cero en el dashboard.** La navegación existente **DEBE** seguir
  funcionando igual: los tres enlaces del sidebar/drawer, el cruce de 768px, el drawer, el modal de
  Cuenta y el detalle de tarjeta **NO DEBEN** alterar su comportamiento, sus textos ni sus clases.

### 5.2 Disparador, foco y alcance (firmes)

- **RF-12 — Ubicuo — Disparador flotante de robot (P-01 a / P-05 / D-2 / D-5 / DP-11 / DP-13 / DP-16 /
  DP-19).** El
  dashboard **DEBE** ofrecer un **control flotante** de tipo `button` con el **mismo icono** que la
  portada (`BotMessageSquare` de `lucide-react`, ya instalado, `size={20}` y `aria-hidden="true"`,
  014 §4.5) y sus **mismos atributos** (`type="button"`), con el **nombre accesible literal exacto**
  `Abrir el asistente de ayuda` (idéntico al de `PaginaInicio.jsx:75`, sin divergencia) y **área
  táctil ≥44×44 px** (`w-11 h-11`, `rounded-full`) con foco visible por tokens
  (`focus-visible:ring-2` + color de anillo de §3.4). Su aspecto **DEBE**
  salir **solo de tokens** (familias de §3.4): **NO DEBEN** copiarse los literales heredados
  `bg-[#0f1117]/80`, `hover:bg-[#1a7a5e]`, `text-white` ni `border-white/20` (ni ningún otro hex,
  color nombrado o valor arbitrario del control de la portada), y **NO DEBE** llevar `backdrop-filter`,
  `glass-surface` ni `glass-card` (DP-04). Su capa **DEBE** ser **`z-40`**, por debajo de los velos
  `z-50`. **NO DEBE** tener **hover, escala ni transición** alguna: **NO DEBEN** aparecer `hover:`,
  `active:scale`, `scale-`, `transform`, `transition` ni `duration-` en su `className` (ninguna
  animación al pasar el puntero, D-2). **NO DEBE** usar `aria-haspopup`/`aria-expanded` ni ser un
  quinto control del BottomNav (eso obligaría a cambiar `grid-cols-4`; descarte declarado, DP-11). En
  móvil su geometría **DEBE** quedar **por encima** del BottomNav (≈60 px) **más la reserva de área
  segura** —el control **DEBE aplicar** `env(safe-area-inset-bottom, 0px)` dentro de su **`bottom`
  calculado** (`bottom: calc(...)`), **no** la utilidad `.safe-bottom` (padding con fallback `1rem`),
  D-5/DP-19—, sin tapar el control «Menú» ni desbordar el viewport; en ≥768px, sin
  invadir la sidebar. **Registro del área segura (D-5/DP-19):** aplicarla **no resuelve** la reserva,
  porque sin `viewport-fit=cover` el inset **resuelve 0** (deuda de la 013); la reserva real queda
  **pendiente** y **NO DEBE** reportarse como verde. El **desplazamiento exacto** (px de `bottom` y
  margen lateral) lo fija el **plan** dentro del rango de §4.4; esta spec no lo cifra. Una **única**
  acción de apertura: activar el control **DEBE** poner el estado de apertura en `true` con el mismo
  efecto que en la portada.
- **RF-13 — Evento — Retorno de foco exacto al disparador (P-01 a / P-03 / D-6 / DP-11 / DP-20).**
  **CUANDO** el asistente se cierra —por «X», Esc, clic en el scrim o gesto—, el foco **DEBE** volver
  **exactamente** al control flotante mediante `triggerRef` (014 RF-02), porque el control **sigue
  montado** al abrir y cerrar (no vive en el drawer). **NO DEBE** quedar en `body` ni en un nodo
  desconectado. El respaldo de 011 (control estable de la versión de vista: `Abrir menú` en móvil;
  control de la navegación lateral en ≥768px) queda como **defensa** documentada por si el control
  desapareciera por una edición posterior; **no es un camino esperado** y nunca fuerza `focus()` sobre
  `body` (`src/hooks/useRetornoDeFoco.js:114-125`; limitación de `:88`). Para que el respaldo **del
  layout** no cambie de destino por el nodo nuevo, el disparador **NO DEBE** ser candidato del
  respaldo de foco del cruce: lleva `data-respaldo-foco="excluir"` y `esCandidatoDeCruce` lo descarta
  (`DashboardLayout.jsx:16-24`, `:46-54`; §4.5, AC-15). Los controles reales de navegación y de
  contenido **siguen siendo candidatos** y `useRetornoDeFoco` **no** se modifica.
- **RF-14 — Ubicuo — Alcance: todo el dashboard con un solo montaje (P-02 a / DP-12).** El asistente
  **DEBE** estar disponible en las **cuatro** rutas hijas —`index` (Inicio), `transacciones`,
  `tarjetas` y `configuracion` (esta última alcanzable solo desde el modal de Cuenta)— mediante **un
  único** montaje en el layout del dashboard; **NO DEBE** montarse en ninguna página ni existir un
  condicional por ruta, **NO DEBE** haber ruta excluida, y el montaje **DEBE** seguir siendo único por
  render, sin duplicar ids ni trampas de foco (AC-02).

---

## 6. Criterios de aceptación

### 6.1 Criterios del diseño reutilizado (firmes)

| AC | RF | Estado observable esperado | Verificación | Tipo |
|---|---|---|---|---|
| **AC-01** | RF-01 | `AsistenteAyuda.jsx` y `AsistenteAyuda.test.jsx` **sin cambios**; no existe una segunda copia del marcado del asistente en el dashboard; sus props y literales no cambian | `git add -N` de los archivos nuevos —altera el índice: **aceptable aquí** si se restaura con `git reset` al terminar; alternativa neutra, sin tocar el índice: `git ls-files -o --exclude-standard` + `git diff --no-index /dev/null <archivo>`— y, después, `git diff HEAD --stat -- src/components/domain/modales/AsistenteAyuda.jsx src/components/domain/modales/AsistenteAyuda.test.jsx` **vacío** (`HEAD` cubre lo preparado y lo no preparado); `npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx` **verde sin editar la suite**; búsqueda de `AsistenteAyuda` fuera del componente y del nuevo punto de uso | Fuente + Auto |
| **AC-02** | RF-02 | Un **solo** nodo del asistente por render del dashboard; ids únicos; una sola trampa a la vez; el estado vive en el layout, no en las páginas | Render del dashboard en cada ruta con `MemoryRouter` y **apertura previa del asistente** (con el componente cerrado `#asistente-titulo` vale 0): `await user.click(disparador)` y entonces `document.querySelectorAll("#asistente-titulo").length === 1`; `getAllByRole("dialog").length === 1`; `grep -n "AsistenteAyuda" src/pages/PaginaDashboard*.jsx` sin coincidencias | Auto + Fuente |
| **AC-03** | RF-03 | Con el asistente abierto se leen **literalmente** los textos de la 014 §4.3 y **ninguno** distinto | `getByRole("dialog", { name: "Asistente de ayuda" })`; `getByText` de marca, nota, reserva, texto vacío y las cuatro sugerencias; `getByRole("button", { name: "Cerrar asistente de ayuda" })`; ausencia de textos alternativos | Auto |
| **AC-04** | RF-04 | En la aplicación el estado es `vacio`; no existe control que muestre `Conversación de ejemplo` | Render del dashboard: `getByText(TEXTO_VACIO)`; `queryByText("Conversación de ejemplo")` **ausente**; sin control de cambio | Auto |
| **AC-05** | RF-05 | ARIA y cromo idénticos a la 014 en la instancia del dashboard; foco inicial en el panel; «X» no es el foco inicial; el cierre por Esc es **observable** y no deja el diálogo montado | Asertos de `role`/`aria-*`; `fireEvent.keyDown(document, { key: "Escape" })` y después `queryByRole("dialog", { name: "Asistente de ayuda" })` **ausente** (y foco de vuelta, AC-13); `document.activeElement` tras abrir; `git diff HEAD --stat` de las cuatro superficies vacío. La **unicidad de la llamada** de cierre por Esc (1 sola) se remite a la suite de la 014, que la prueba sobre el mismo componente; aquí **no** se añade una costura de espía | Auto + Fuente |
| **AC-06** | RF-06 | Abrir el asistente deja **una sola** superficie (`role="dialog"`) y la otra **cerrada** en los tres casos: (a) drawer abierto → drawer cerrado; (b) modal de Cuenta abierto → Cuenta cerrada; (c) detalle de tarjeta abierto (`Tarjeta de …`) → detalle cerrado. El foco queda **dentro** del diálogo del asistente. El disparador es `z-40`, por debajo de los velos `z-50` | En el archivo nuevo, con el layout real y `MemoryRouter`: en cada caso, abrir la superficie, activar el disparador y, **con `await waitFor(...)`**, comprobar que `document.querySelectorAll('[role="dialog"]')` queda en **1**, que el único diálogo es `getByRole("dialog", { name: "Asistente de ayuda" })`, que `queryByRole("dialog", { name: "Menú de navegación" })` / `{ name: "Cuenta" }` / `{ name: /^Tarjeta de / }` está **ausente** y que `dialogo.contains(document.activeElement)`. El `waitFor` es **obligatorio en (c)**, no un lujo: el `AnimatePresence` de `ModalTarjeta` mantiene el nodo saliente durante su animación de salida (`ModalTarjeta.jsx:102-111`, `:96`); en (a) y (b) el cierre es inmediato porque ambos devuelven `null` (`DashboardDrawer.jsx:79`, `DashboardUserModal.jsx:78`), pero se usa el mismo patrón en los tres. Esa coexistencia de **~0,2 s** (dos nodos de diálogo en el DOM, uno **no operable**) es un **límite aceptado y declarado** (D-4/DP-18): **no** se suprime la animación, **no** se toca `ModalTarjeta` y **no** se rebaja el aserto a una comprobación síncrona. **La activación con el velo encima es simulada** (`fireEvent.click`): con el disparador en `z-40` y el velo en `z-50`, el ratón no lo alcanza y las trampas impiden llegar por teclado; se prueba igualmente porque RF-06 es una **defensa** que debe cumplirse si una edición futura cambia capas u orden, o si una API/AT activa el control. `z-40` se comprueba en **fuente** (`className`); el *hit test* real (el velo recibe el clic, no el disparador) es **manual** a 375×812 y 1440×900 | Auto + Fuente + Manual |
| **AC-07** | RF-07 | El nodo del scrim del asistente va **después** del `nav` del BottomNav en el orden del documento; el scrim gana el empate al BottomNav (`z-50`) y queda por encima del sidebar (`z-40`); **no** se declara por encima del panel del drawer (`z-55`) porque **no coexisten** (RF-06); el scrim no tiene blur ni superficie | `expect(bottomNav.compareDocumentPosition(scrim) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()`; `expect(scrim.className).toContain("z-50")`; `expect(scrim.className).not.toMatch(/backdrop-(?:blur|filter)|glass-surface/)`; lectura del punto de montaje en `DashboardLayout` y de que RF-06 cierra el drawer en el punto de apertura (AC-06). **No** se comprueba el scrim contra el panel del drawer: esa comparación es imposible por CSS y la garantía es la no coexistencia | Auto + Fuente |
| **AC-08** | RF-08 | Base **1 / 0** y con el asistente **2 / 0** por vista (≥768px y <768px); scrim sin blur ni superficie; disparador sin blur ni superficie; sin blobs ni superficies nuevas | Conteo manual tipo **M-8** de la 013 a 1440×900 y 375×812, base y con el asistente; inspección de clases: ni el scrim ni el disparador llevan `backdrop-blur`, `backdrop-filter`, `[backdrop` ni `glass-surface`; `glass-card` sigue opaca por fuente | Manual + Fuente |
| **AC-09** | RF-09 | **0** literales `#` y **0** colores fuera de tokens en las líneas añadidas del diff de producción; los literales del control de la portada **no** aparecen en el diff; contraste AA del disparador | `git add -N` de archivos nuevos (mismo criterio de índice que AC-01) y `git diff HEAD --unified=0 -- '*.js' '*.jsx' ':(exclude)*.test.jsx' ':(exclude)*.test.js'`: las líneas `^+` (sin `^+++`) pasan las cuatro comprobaciones de §3.4 —(1) sin `#`/`rgb(`/`hsl(`/`oklch(`; (2) sin valores arbitrarios de color; (3) sin paleta nombrada en familias de color; (4) sin `style` en línea con color/fondo/borde ni `fill`/`stroke` literales, con `^\+.*` filtrado por `/style=\{\{[^}]*(?:\bcolor\b|\bbackground(?:Color)?\b|\bborder(?:Color|TopColor|RightColor|BottomColor|LeftColor)?\b|\boutline(?:Color)?\b|\bfill\b|\bstroke\b)\s*:/i` y por `/\b(?:fill|stroke)="(?:#|rgb|hsl|oklch)/i`—; medición manual de contraste con el protocolo de la 013 | Fuente + Manual |
| **AC-10** | RF-10 | Sin motor, guion, texto libre procesado, estado de conversación, persistencia, IA, red (`fetch`), endpoints, dependencias ni correo; configs y rutas intactos; el código **nuevo** de la 017 tampoco introduce lógica | `grep` de `fetch`, `api.config`, `onSubmit`, `onChange`, `useReducer`, `localStorage`, `soporte@finapp.com` **en el componente reutilizado y en las líneas `^+` del diff de `src/layout/DashboardLayout.jsx` y `src/pages/PanelTarjetas.jsx`** (`git diff HEAD --unified=0 --`); **excepción declarada:** el `useState` de apertura/cierre del layout (`ayudaAbierta` y los estados de superficie) y el registro de cierre de `PanelTarjetas` **sí** se admiten y no cuentan como lógica de conversación; `git diff HEAD --stat -- package.json src/config src/App.jsx` vacío | Fuente + Auto |
| **AC-11** | RF-11 | La navegación, el drawer, el modal de Cuenta y el detalle de tarjeta conservan clases, textos y comportamiento; la prueba cerrada del respaldo de foco (`DashboardLayout.test.jsx:427-451`) **sigue verde sin editarse** porque el disparador está excluido del respaldo (D-6/DP-20) | Suites existentes del dashboard y de los modales **sin editar** y verdes: `npx vitest run src/layout src/components/layout src/components/domain/modales`; `git diff HEAD --stat -- src/layout/DashboardLayout.test.jsx src/pages/PanelTarjetas.test.jsx` **vacío**. **No prohíbe crear** el archivo nuevo de pruebas de la 017: prohíbe **editar** las suites cerradas (`DashboardLayout.test.jsx`, `PanelTarjetas.test.jsx`, las de los modales y la de la 014) | Auto + Fuente |

### 6.2 Disparador, foco y alcance (firmes)

| AC | RF | Estado observable esperado | Verificación | Tipo |
|---|---|---|---|---|
| **AC-12** | RF-12 | Existe **un** botón con nombre accesible **exacto** `Abrir el asistente de ayuda`; su `svg` es `BotMessageSquare` (`aria-hidden="true"`, `width="20"`, `height="20"`, clase `lucide-bot-message-square`); área ≥44×44 (`w-11` y `h-11`); `type="button"`; `z-40`; foco visible por tokens (`focus-visible:ring-2` + anillo de la lista de §3.4); **sin** `aria-haspopup`/`aria-expanded`; **sin** hover, escala ni transición; **sin** `backdrop-blur`/`backdrop-filter`/`glass-surface`/`glass-card` ni `#`; colores solo de §3.4; en móvil queda por encima del BottomNav **aplicando** `env(safe-area-inset-bottom, 0px)` en el `bottom` calculado (no `.safe-bottom`), sin taparlo ni desbordar el viewport; **la reserva real queda pendiente** (inset 0, D-5/DP-19), no verde | `getByRole("button", { name: "Abrir el asistente de ayuda", exact: true })` (y `const boton` es ese nodo); `expect(boton).toHaveAttribute("type", "button")`; `expect(boton).not.toHaveAttribute("aria-haspopup")` y `expect(boton).not.toHaveAttribute("aria-expanded")`; `const svg = boton.querySelector("svg")`: `aria-hidden="true"`, `width="20"`, `height="20"`, `class` contiene `lucide-bot-message-square`; `boton.className` contiene `w-11`, `h-11` y `z-40`; `toMatch(/focus-visible:ring-2/)` y `toMatch(/focus-visible:ring-(?:mint-accent|emerald-primary)(?:\/\d{1,3})?/)`; `not.toMatch(/hover:|active:scale|scale-|transform|transition|duration-/)`; `not.toMatch(/#|backdrop-blur|backdrop-filter|\[backdrop|glass-(?:surface|card)/)` y `expect(boton.getAttribute("style") ?? "").not.toMatch(/backdrop|color/i)` (el `style` solo puede declarar la geometría del `bottom`: ni color ni `backdrop-filter`); `not.toMatch(/(?:^|[\s"'])(?:[a-z-]+:)*(?:bg|text|border|ring|ring-offset|fill|stroke|placeholder|outline|decoration|caret|accent|divide|from|via|to|shadow)-(?:white|black|transparent|current|inherit|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{1,3})?(?:\/\d{1,3})?(?:\s|"|'|$)/)` (la frontera de §3.4: **no** rechaza los tokens admitidos con guion —`ring-emerald-primary`, `bg-emerald-primary`, `text-slate-text`— y **sí** rechaza `text-white`, `bg-black/70` y `text-slate-800`; `focus-visible:ring-white` tampoco se escapa porque el prefijo de variante está en la regex) y `not.toMatch(/(?:bg|text|border|ring|fill|stroke|from|via|to|shadow)-\[/)` (comprobaciones de §3.4); **fuente:** el `className` o el `style` del control contiene `env(safe-area-inset-bottom` (y **no** `.safe-bottom`) dentro de la geometría del `bottom`, y el plan declara los px de `bottom` y el margen lateral de §4.4; **manual:** geometría, superposición con el BottomNav y contraste en navegador a 375×812 y 1440×900, con el **área segura reportada como pendiente** porque el `env()` resuelve 0 (D-5/DP-19) | Auto + Fuente + Manual |
| **AC-13** | RF-13 | Tras abrir y cerrar el asistente —por «X», por Esc **y por clic en el scrim**—, `document.activeElement` es el botón flotante; nunca `body` | `await user.click(disparador)`; en cada cierre `await waitFor(() => expect(document.activeElement).toBe(disparador))` (la 014 lo hace así, `AsistenteAyuda.test.jsx:528`), sin asertos síncronos sobre el foco; cierres: «X», `fireEvent.keyDown(document, { key: "Escape" })` y `fireEvent.click(scrim)`. El **gesto** de deslizar no se re-prueba aquí: se remite a la suite de la 014 (mismo componente y mismo hook) y a la revisión manual en móvil | Auto |
| **AC-14** | RF-14 | El disparador está en las **cuatro** rutas y, al **abrir** el asistente en cada una, aparece **un solo** diálogo y un solo nodo de `#asistente-titulo`; ninguna página monta `AsistenteAyuda` | Render de cada hija (`/dashboard`, `/dashboard/transacciones`, `/dashboard/tarjetas`, `/dashboard/configuracion`) con `MemoryRouter`: `getByRole("button", { name: "Abrir el asistente de ayuda" })` presente; `await user.click(disparador)` y `getByRole("dialog", { name: "Asistente de ayuda" })`; `document.querySelectorAll("#asistente-titulo").length === 1` **con el asistente abierto**; `grep -n "AsistenteAyuda" src/pages/PaginaDashboard*.jsx` **sin coincidencias** | Auto + Fuente |
| **AC-15** | RF-13 | El disparador **no es candidato** del respaldo de foco del layout: `data-respaldo-foco="excluir"` está en su `<button>` y `SELECTOR_EXCLUIDO_RESPALDO` se aplica en `esCandidatoDeCruce`; la prueba cerrada `DashboardLayout.test.jsx:427-451` sigue verde **sin editarse** | **Fuente — una sola condición ejecutable (la marca en el marcado):** `grep -n 'data-respaldo-foco="excluir"' src/layout/DashboardLayout.jsx | grep -v 'const SELECTOR_EXCLUIDO_RESPALDO' | grep -Ev '^[0-9]+:[[:space:]]*(\*|//|/\*)'` devuelve **exactamente 1** línea, y esa línea es la del atributo `data-respaldo-foco="excluir"` del `<button>` del disparador (si devuelve **≥2**, hay una segunda marca y el AC falla; si devuelve **0**, falta la marca o está en otra forma). Las tres etapas son explícitas: `grep -n` numera con prefijo `N:` —de ahí el ancla `^[0-9]+:` del último filtro—, la segunda descarta la declaración `const SELECTOR_EXCLUIDO_RESPALDO = '[data-respaldo-foco="excluir"]';` (contiene el mismo literal) y la tercera descarta las **líneas de comentario** (`//`, `/* … */` y `* …` de un JSDoc). Esas líneas **no cuentan** y **el total de coincidencias deja de ser criterio** (no se exige 2 ni 3): §4.5 **obliga** a actualizar la cabecera JSDoc del layout, donde es natural que el literal aparezca, y una mención documental no es una marca. **Caso fijado:** si el JSDoc dice «… se marca con `data-respaldo-foco="excluir"` y …», el tercer filtro elimina esa línea y el comando sigue devolviendo **1**; una implementación **conforme** nunca falla este AC por documentar el literal. Además, `grep -n 'SELECTOR_EXCLUIDO_RESPALDO' src/layout/DashboardLayout.jsx` devuelve **≥2** líneas (declaración + uso) y `grep -n 'nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)' src/layout/DashboardLayout.jsx` devuelve **1** línea: el filtro dentro de `esCandidatoDeCruce`, la conjunción que valida `primerCandidatoDeCruce`. **Auto:** `npx vitest run src/layout/DashboardLayout.test.jsx` verde; `git diff HEAD --stat -- src/layout/DashboardLayout.test.jsx` **vacío**. **Prueba funcional en el archivo nuevo:** render del layout móvil, foco en `Abrir menú`, cruce a ≥768px con el `aside` sin botones y un botón de contenido añadido a `body`; `document.activeElement` es el botón de contenido, **no** el disparador | Fuente + Auto |

---

## 7. Casos límite

- **CL-01 — Drawer abierto.** Con el drawer abierto, el control flotante (`z-40`) queda **debajo** del
  velo del drawer (`z-50`, `DashboardDrawer.jsx:134-141`) y **NO DEBE** ser clicable, de modo que el
  asistente **no puede abrirse** con el drawer abierto. Como defensa, el **único punto de apertura**
  **DEBE** cerrar el drawer antes de abrir (RF-06). Si por un fallo ambos coexistieran, el panel del
  drawer (`z-55`, `DashboardDrawer.jsx:108`) **taparía** al asistente y Esc (60 > 55) cerraría el
  asistente dejando el drawer abierto: se registra como **defecto**, no como comportamiento aceptable.
- **CL-02 — Modal de Cuenta o detalle de tarjeta abiertos.** Con el modal de Cuenta abierto el control
  flotante (`z-40`) queda **debajo** de su overlay (`z-50`) y el asistente **NO DEBE** poder abrirse
  (overlay + trampa); lo mismo con el **detalle de tarjeta** (`z-50`, `ModalTarjeta.jsx:106`) en
  `/dashboard/tarjetas`. En ambos casos la activación con el velo encima es **simulada** (no hay camino
  real de ratón ni de teclado) y **DEBE** dejar una sola superficie por RF-06: se cierra Cuenta por el
  patrón del layout o el detalle por la señal de §4.5. Como defensa, si un caso no previsto los
  apilara: con Cuenta, Esc cierra **solo una** capa —empate a 60 resuelto por la registrada más tarde
  (`useCierreConEsc.js:17-31`)— y una segunda pulsación cierra la otra (010 RF-04, defensa de
  `:414-420`); con el detalle, su capa de Esc es 50 y el asistente 60, así que Esc cerraría el
  asistente primero. En el caso del detalle —el (c) de AC-06, previsto por RF-06— el modal **deja de
  estar operativo** en
  el mismo commit, pero su nodo saliente puede seguir en el DOM **~0,2 s** mientras se anima a
  desaparecer: **límite aceptado y declarado** (D-4/DP-18, §4.5); los asertos de unicidad usan
  `waitFor` (AC-06).
- **CL-03 — Móvil con área segura.** A 375×812 el control flotante **DEBE** quedar por encima del
  BottomNav y del área segura, sin solapar el cuarto control («Menú», `BottomNav.jsx:69-81`) ni
  desbordar el viewport. El control **aplica** `env(safe-area-inset-bottom, 0px)` dentro de su
  `bottom` calculado —**no** la utilidad `.safe-bottom`, que es padding con fallback `1rem`— (D-5/
  DP-19), pero la reserva real **no está resuelta**: sin `viewport-fit=cover` el `env()` resuelve **0**
  (013 `:909`, `CL-15`), así que se reporta como **pendiente**, **nunca como verde**, y no se añade
  `viewport-fit` ni se reabre la 013.
- **CL-04 — `Escape` en capas apiladas.** Esc **DEBE** producir **una sola** llamada de cierre y cerrar
  **solo** la capa superior; el mecanismo es el de 010 (`useCierreConEsc`) y **NO DEBE** añadirse un
  segundo listener ni combinarse con `escapeDeactivates: true` (la trampa ya usa `false`,
  `AsistenteAyuda.jsx:57-64`).
- **CL-05 — Sin candidato de retorno de foco (defensa).** Con P-01 (a) el control flotante vive fuera
  del drawer y **sigue montado**, así que el foco vuelve **exactamente** a él (RF-13). Solo si el
  control hubiera desaparecido por una edición posterior, la cadena de 011 cae al control estable de
  la versión de vista y **NO** llama a `focus()` sobre `body` ni sobre un nodo desconectado
  (`src/hooks/useRetornoDeFoco.js:114-125`; limitación de `:88`). El disparador tampoco participa en
  el respaldo del layout (`data-respaldo-foco="excluir"`, D-6/DP-20), así que su desaparición no
  altera el destino del cruce. Se documenta, no se inventa marcado.
- **CL-06 — Vista estrecha, baja, apaisada o con teclado virtual.** A 320×568, 375×812, 1440×900,
  200 % de zoom, apaisado y **con el teclado virtual abierto** (375×812), el disparador y el panel
  **DEBEN** quedar alcanzables; el panel conserva `max-w-md`, `max-h-[85vh]` y su único scroll interno
  (`AsistenteAyuda.jsx:116`, `:144`). **Limitación heredada de la 014:** el panel no escucha
  `visualViewport` ni se redimensiona con el teclado, así que el pie y el campo pueden quedar tapados
  en pantallas bajas; se comprueba **manual**, se reporta como limitación y **no** se corrige aquí
  (tocaría el componente de la 014). La comprobación de altura real es **manual**.
- **CL-07 — Alcance por vista (completo).** Las **cuatro** rutas hijas **DEBEN** mostrar el
  disparador y, al abrirlo, el asistente, con **un** nodo; **NO DEBE** existir ninguna ruta excluida
  ni un montaje por página (eso duplicaría ids y trampas; CL-13). Se verifica por ruta, no en
  abstracto.
- **CL-08 — Disparador ausente o desmontado por edición posterior (defensa).** Es una **defensa** ante
  ediciones posteriores, **no** una cláusula condicionada: no condiciona ningún RF ni AC de esta spec.
  Si el disparador desapareciera en una edición futura, sus requisitos y AC quedarían **no
  aplicables**; el asistente **NO DEBE** recrearse ni duplicarse en otro sitio para «compensar», y la
  navegación cerrada (007/008/009) **NO DEBE** reabrirse.
- **CL-09 — Código en movimiento (defensa).** También es una **defensa**, no una cláusula
  condicionada. El usuario edita a mano: si al planificar ya no existen el `BottomNav` o el drawer tal
  como se citan aquí, o el componente de la 014 cambió, se registra «ya no aplicable» y **no** se
  revierte la edición ni se reescribe el componente ajeno.
- **CL-10 — Controles presentacionales.** Pulsar un chip o «Enviar», o escribir en el campo, **NO DEBE**
  añadir mensajes, cambiar de estado ni llamar a red (014 CL-07). Es alcance de diseño y la interfaz lo
  declara con `NOTA_DISENO` y `AVISO_RESERVA`.
- **CL-11 — Movimiento y transparencia reducidos.** El componente reutilizado ya es instantáneo con
  `prefers-reduced-motion` y pierde el filtro con `prefers-reduced-transparency`
  (`src/styles/index.css:124-135`). El **disparador no añade hover, escala ni transición** (D-2), así
  que no hay animación que reducir; su único estado visual es el foco visible por tokens.
- **CL-12 — Contraste del disparador y del asistente.** El contraste se mide **en navegador** con el
  protocolo de la 013 (fondo compuesto incluido): el disparador sobre el fondo real del dashboard y el
  texto del panel sobre `bg-bg-cream/95` con el scrim `bg-bg-dark/70` detrás. jsdom no mide contraste.
- **CL-13 — Duplicación por montaje.** Si alguien montara el asistente también en una página, habría
  **ids duplicados** y **dos** trampas: es el defecto que RF-02/AC-02 previenen; se registra como
  regresión, no se «arregla» renombrando ids del componente (no se toca).
- **CL-14 — Señal de cierre sin dueño (defensa).** Fuera de `/dashboard/tarjetas` no hay detalle
  abierto ni callback registrado: la señal de §4.5 es un **no-op**. Al desmontar `PanelTarjetas`
  (cambio de ruta) se limpia el registro; la señal **NO DEBE** llamar a `setState` de un componente
  desmontado ni cerrar otra superficie. Se verifica abriendo el asistente desde
  `/dashboard/transacciones` y `/dashboard/configuracion` (AC-14) sin errores de consola.

---

## 8. Decisiones y descartes

| ID | Decisión |
|---|---|
| **DP-01** | **Solo diseño, como la 014.** Se reutiliza el componente tal cual; no hay motor, guion, coincidencia, texto libre procesado, máquina de estados, reinicio/conservación, persistencia ni red. Los estados son los de la 014 y en la aplicación se usa `vacio`. |
| **DP-02** | **El componente de la 014 no se toca (P-04, confirmado).** `AsistenteAyuda.jsx`, sus literales, su ARIA, sus clases y su suite quedan **intactos** —su `diff` **vacío** y su suite verde **sin editarse**—; el único cambio es un **punto de uso nuevo**. Se descarta clonar el componente, duplicar el archivo o extraer un envoltorio nuevo. **Declaración expresa:** si en la implementación apareciera un problema **real** de capas o de `Escape` que exigiera tocar el componente, es un **bloqueo que se reporta**, no se resuelve tocando la 014 (ver DP-14). |
| **DP-03** | **Montaje único en el layout** del dashboard (P-02 a, DP-12): evita ids duplicados, una sola trampa y cubre las cuatro rutas sin tocar páginas. Se descarta el montaje por página (duplicación) y el montaje en cada superficie existente. |
| **DP-04** | **El disparador no lleva `backdrop-filter`.** Un control nuevo con blur quedaría **fuera** del inventario de la 013 y obligaría a reabrirla (`specs/013-calidad-css/spec.md:283`, `:292-297`); su color sale de tokens (nada de copiar los hex del control de la portada). |
| **DP-05** | **Una sola superficie (P-03, confirmado):** abrir el asistente cierra el drawer, el modal de Cuenta **y el detalle de tarjeta** en el **único punto de apertura** (drawer y Cuenta con el patrón de `DashboardLayout.jsx:136-139`; detalle con la señal de §4.5; 010 RF-07/RF-13). Se descarta la coexistencia y se descarta cualquier ruta alternativa de apertura. |
| **DP-06** | **Esc sin cambios:** sigue siendo el mecanismo único de 010 con la capa **60** del componente; no se añade listener propio, no se cambia el número y no se reabre 010. El empate teórico con el modal de Cuenta se resuelve por diseño (no coexisten) y, si ocurriera, por la regla de capas de `useCierreConEsc`. |
| **DP-07** | **Scrim sin blur y sin contar como superficie** (014 DP-10; 013 `:294-297`). Se descarta copiar el velo con `backdrop-blur-sm` de `DashboardDrawer`/`DashboardUserModal`. |
| **DP-08** | **Orden de documento como contrato de capas:** el asistente se monta **después** del chrome del dashboard (después del `BottomNav`) y **nunca** dentro de `<main>`/páginas, para que el `z-50` del scrim gane el empate con el `z-50` del BottomNav. Se descarta portalizar desde dentro del componente reutilizado (lo modificaría) y se descarta subir `z` por encima de 60 (tocaría el componente y el cromo de 010). |
| **DP-09** | **Literales verbatim:** nada de textos nuevos ni adaptados al dashboard; el guion de muestra de la 014 se conserva tal cual y solo se usa en pruebas/revisión (014 DP-07/DP-08). |
| **DP-10** | **Fuera:** hexadecimales sin decidir en su conjunto (014 DP-04) —el código **nuevo** sí queda sujeto a RF-09—, motor/guion/IA/red/persistencia, dependencias y reapertura de 013/014/015. `MEMORY.md` no lo edita el planner; el **cierre** añadirá **solo** la línea de la 017 (D-3/DP-17). |
| **DP-11** | **Disparador: control flotante de robot (P-01 a).** Decisión del usuario: mismo icono `BotMessageSquare` (`size={20}`) y mismos atributos que la portada, nombre accesible idéntico, **solo tokens**, **`z-40`**, **sin hover ni escala** y **sin `backdrop-filter`**; geometría móvil por encima del BottomNav aplicando `env(safe-area-inset-bottom, 0px)` en su `bottom` (no `.safe-bottom`), sin taparlo ni desbordar el viewport (§4.4, RF-12). Se descartan: (b) **entrada de navegación** —dos pasos en móvil, el disparador se desmonta al cerrarse el drawer (el foco caería a «Abrir menú») y toca la navegación cerrada de 007/009—; (c) **acción en el modal de Cuenta** —mezcla ayuda y cuenta, dos pasos, toca el cromo de 010/011—; y (d) **quinto control del BottomNav** —obligaría a cambiar `grid-cols-4` (`BottomNav.jsx:39`; la 013 ordenó corregir esa grilla y su §4.5 documenta el hallazgo, `specs/013-calidad-css/spec.md:340-347`), **descarte declarado**—. |
| **DP-12** | **Alcance: todo el dashboard, un único montaje (P-02 a).** El asistente se ofrece en las **cuatro** rutas hijas con **un solo** montaje en `DashboardLayout`; evita ids duplicados y dos trampas, y no toca páginas (RF-14). Se descartan el montaje por página y el subconjunto de rutas (solo Inicio, o las tres de la navegación sin Configuración), que además dejarían el asistente **antes** del BottomNav en el orden del documento. |
| **DP-13** | **Nombre accesible: literal exacto (P-05).** El disparador del dashboard usa **el mismo** nombre accesible que la portada, `Abrir el asistente de ayuda` (`PaginaInicio.jsx:75`), sin divergencia y sin etiqueta visible distinta; así se cumple «etiqueta en el nombre» (WCAG 2.5.3) y el aserto del nombre accesible es idéntico (RF-03/RF-12, AC-12). Se descartan variantes como «Asistente de ayuda» o literales nuevos. |
| **DP-14** | **Tocar el componente de la 014 es un bloqueo, no una salida (P-04).** `AsistenteAyuda.jsx` y su suite son **intocables**: si la implementación encontrara un problema **real** de capas o de `Escape` que exigiera modificarlos, se **reporta como bloqueo** y se detiene, sin tocar la 014 ni subir capas por número. Esta spec confirma que **no hace falta** con el montaje en el layout después del chrome (RF-07) y el cierre previo de drawer/Cuenta/detalle (RF-06). |
| **DP-15** | **D-1 — El detalle de tarjeta se cierra al abrir el asistente, sin tocar `ModalTarjeta`.** Mecanismo: **señal explícita de cierre por `Outlet context`** (§4.5). Archivos exactos: `src/layout/DashboardLayout.jsx` (estado, manejador único, `Outlet context` y montaje) y `src/pages/PanelTarjetas.jsx` (registro del `setTarjetaActiva(null)`), más el archivo **nuevo** de pruebas `src/layout/AsistenteDashboard.test.jsx`. **No reabre la 010** porque no añade un mecanismo de cierre a la superficie: apaga el estado de su dueño, el mismo que ya usa `onCerrar`; el cromo, las props, la trampa y el retorno de foco de `ModalTarjeta` quedan intactos. Se descartan elevar el estado (rompe las pruebas existentes de `PanelTarjetas`), el contexto en archivo aparte (innecesario), el contador + efecto (deja un commit con dos trampas), el evento DOM a medida y tocar `ModalTarjeta`. |
| **DP-16** | **D-2 — Aspecto del control flotante.** Capa **`z-40`** (por debajo de los velos `z-50` y de `z-55`/`z-60`), **colores y borde solo desde las familias de tokens de §3.4**, y **sin hover, sin escala y sin transición** (ninguna animación al pasar el puntero). Geometría en móvil por encima del BottomNav (~60 px) **más** la reserva de área segura aplicada con `env(safe-area-inset-bottom, 0px)` en el `bottom` calculado **más** margen (reserva **aplicada**; su efecto real queda **pendiente**, DP-19); en ≥768px, sin invadir la sidebar. Se fija en RF-09/RF-12 y se comprueba en AC-09/AC-12 (y el `z-index` también en AC-06). |
| **DP-17** | **D-3 — `MEMORY.md` en el cierre.** El cierre de la 017 **sí** añadirá su referencia (ruta `specs/017-asistente-en-dashboard/` y estado), **solo esa línea**. **No** se toca el texto de hexadecimales ni la línea de archivos ajenos sin commitear (`MEMORY.md:37`). El planner no edita `MEMORY.md`; lo hará el implementer al cerrar. |
| **DP-18** | **D-4 — Nodo saliente del detalle: aceptado y documentado.** Al abrir el asistente con el detalle abierto, el nodo saliente de `ModalTarjeta` permanece en el DOM **~0,2 s** por la animación de salida de `AnimatePresence` (`ModalTarjeta.jsx:96`, `:102-111`, `:122-125`) y **deja de ser operable** en el mismo commit. **Justificación:** suprimirlo exigiría desactivar `AnimatePresence` o tocar `ModalTarjeta`, prohibido por D-1/010; el nodo no recibe foco (trampa del asistente), queda cubierto por el scrim `z-50` montado después y su trampa de Tab es **local** al panel, así que «una sola superficie» se cumple en el plano **operable**. **Límite declarado:** durante ~0,2 s coexisten **dos nodos de diálogo** en el DOM, uno no operable; con `prefers-reduced-motion` la transición es **0**. Los asertos de unicidad usan **`waitFor`** (AC-06) y **no** se rebajan a síncronos; **no** se suprime la animación ni se añade espera artificial al cierre. |
| **DP-19** | **D-5 — Área segura: se aplica y se declara pendiente.** El disparador **aplica** `env(safe-area-inset-bottom, 0px)` **dentro de su `bottom` calculado** (`calc(...)`; RF-12, §4.4) y **no** la utilidad `.safe-bottom`, que aplica `padding-bottom` con fallback `1rem` (`src/styles/index.css:34-36`) y no desplaza el control. Como el inset vale **0** sin `viewport-fit=cover` (deuda ya declarada por la 013, `specs/013-calidad-css/spec.md:321-338`, `:909`; `MEMORY.md:33`) la **reserva real no está resuelta**: se registra como **pendiente** en §9/§10 y **nunca como verde** (AC-12). Esta spec **no** añade `viewport-fit=cover`, **no** toca `index.html` ni reabre la 013. |
| **DP-20** | **D-6 — El disparador no es candidato del respaldo de foco del layout.** El respaldo del cruce (`trasladarFocoDeCruce`, `DashboardLayout.jsx:72-81`) cae al primer control enfocable (`:79`) y el disparador nuevo, al ser un `button` del layout, ganaría ese escalón y rompería la prueba cerrada `DashboardLayout.test.jsx:427-451`. Mecanismo mínimo, solo en el layout: (1) `data-respaldo-foco="excluir"` en el `<button>` del disparador; (2) constante `SELECTOR_EXCLUIDO_RESPALDO` junto a los selectores del cruce (`:16-24`); (3) `!nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)` en `esCandidatoDeCruce` (`:46-54`). **No** se toca `useRetornoDeFoco` ni ninguna suite y **no se debilita la 011**: los controles reales de navegación y contenido siguen siendo candidatos; solo se excluye el nodo nuevo, que no existía en 011. Se descartan editar la prueba, tocar el hook o añadir una excepción por selector de nombre accesible. |

---

## 9. Fuera de alcance / pendiente

- **Motor de coincidencia, guion, texto libre procesado, máquina de estados, reinicio/conservación,
  persistencia, IA, backend, red, dependencias:** spec futura de lógica del asistente; **nada** de esto
  se implementa aquí.
- **Migración de hexadecimales en JSX:** **sin decidir**; no la cubre esta spec (014 DP-04).
- **Reapertura de 013/014/015 y de cualquier spec cerrada:** no.
- **`MEMORY.md`:** el planner no lo edita. Al **cierre**, el implementer añadirá **solo la línea** de
  referencia de la 017 (ruta `specs/017-asistente-en-dashboard/` y estado), sin tocar el texto de
  hexadecimales ni la línea de archivos ajenos sin commitear (D-3/DP-17).
- **`soporte@finapp.com`:** no se muestra **en el asistente**. En el dashboard **sí** aparece en el
  reverso de la tarjeta virtual (`MiTarjetaVirtual.jsx:188`); no se toca (fuera de alcance).
- **Nuevas rutas, páginas, datos, formatos o endpoints:** no.
- **Cambios en el cromo de 010/011, en la navegación de 007/008/009, en `index.css` o en el archivo de
  la 014:** no.

### 9.1 Pendientes heredados que asume la aprobación

Lista cerrada de lo que **queda pendiente al aprobar** la 017 (nada de esto se declara verde):

1. **Reserva real del área segura (D-5/DP-19).** El disparador **aplica**
   `env(safe-area-inset-bottom, 0px)` en su `bottom` calculado (no `.safe-bottom`), pero sin
   `viewport-fit=cover` el inset resuelve **0**: la reserva **no está resuelta**. Es la **deuda ya
   declarada** por la 013 (`specs/013-calidad-css/spec.md:321-338`, `:909`; `MEMORY.md:33`) y la
   aprobación la **hereda**; esta spec no añade `viewport-fit` ni reabre la 013 (CL-03, AC-12, §10).
2. **Coexistencia de ~0,2 s de dos nodos de diálogo (D-4/DP-18).** Al abrir el asistente con el
   detalle de tarjeta abierto, el nodo saliente sigue en el DOM **sin ser operable** durante la
   animación de salida; es un **límite aceptado y declarado**, no un requisito resuelto: los asertos
   usan `waitFor` y **no** se suprime la animación ni se toca `ModalTarjeta.jsx` (§4.5, CL-02, AC-06).
3. **Mediciones manuales aún no ejecutadas:** *hit test* de capas, geometría a 375×812/320×568,
   contraste AA, presupuesto M-8 y teclado virtual (CL-06/CL-12, §10). Se reportan como **manual** o
   **manual (pendiente parcial)**; nunca como automáticas. La línea base (518/518 y build) se
   **re-mide** en la primera tarea del plan.

> **Regla de registro:** `env(safe-area-inset-bottom, 0px)` **aplicado en el offset** y **reserva
> pendiente** se anotan **juntas**; el nodo saliente **aceptado** y su **límite de ~0,2 s** también. Ni
> uno ni otro se reportan como «resuelto» ni como «verde».

---

## 10. Matriz de validación (auto / manual)

| Qué | Cómo | Tipo |
|---|---|---|
| Montaje único, ids únicos, una sola trampa, estado en el layout | Render del dashboard por ruta con `MemoryRouter`, **abrir** el asistente y asertos de unicidad; `grep` en las páginas | **Auto + Fuente** |
| Literales idénticos a la 014 §4.3 y estado `vacio` | `getByText`/`getByRole` con los textos copiados de la 014; ausencia de `Conversación de ejemplo` | **Auto** |
| ARIA del diálogo, «X», log, campo y «Enviar» | Asertos de `role`, `aria-*`, `aria-disabled` y nombres accesibles | **Auto** |
| Apertura/cierre (X, Esc, scrim), foco inicial y retorno | Vitest + `userEvent` + `document.activeElement` con `waitFor`; la unicidad de la llamada de Esc se remite a la suite de la 014 | **Auto** |
| Disparador flotante: nombre accesible exacto, icono `BotMessageSquare` (`size={20}`), área, atributos y foco visible | `getByRole("button", { name: "Abrir el asistente de ayuda", exact: true })`; `svg` con `aria-hidden`, `width/height=20`; `w-11 h-11`; sin `aria-haspopup`/`aria-expanded`; `focus-visible:ring-2` + anillo de tokens | **Auto** |
| Disparador: `z-40`, solo tokens, sin hover/escala, sin blur ni superficie | `className` sin `hover:`, `scale-`, `transform`, `transition`, `duration-`, `backdrop-*`, `glass-surface` ni `#`; utilidades de color dentro de las familias de §3.4; fuente del `z-40` | **Auto + Fuente** |
| Retorno de foco exacto al disparador al cerrar (X, Esc y scrim) | `await waitFor(() => expect(document.activeElement).toBe(disparador))`; el gesto se remite a la 014 | **Auto** |
| El disparador no es candidato del respaldo de foco del layout | Fuente: `data-respaldo-foco="excluir"` + `SELECTOR_EXCLUIDO_RESPALDO` en `esCandidatoDeCruce`; `npx vitest run src/layout/DashboardLayout.test.jsx` verde y `git diff HEAD --stat` de esa suite vacío; prueba funcional del cruce en el archivo nuevo | **Fuente + Auto** |
| Alcance en las cuatro rutas con un solo montaje | Render de las cuatro hijas con `MemoryRouter`, abrir el asistente en cada una, + `grep` en `src/pages/PaginaDashboard*.jsx` | **Auto + Fuente** |
| Una sola superficie con drawer, Cuenta o detalle de tarjeta abiertos | Test del layout con las tres superficies: `waitFor` hasta un solo `role="dialog"` y la otra ausente; activación **simulada**. En (c) el nodo saliente (~0,2 s, no operable) es **límite aceptado** (DP-18) | **Auto + Fuente** |
| Orden de documento y ausencia de blur/superficie en el scrim | `compareDocumentPosition` del scrim frente al `nav`; `className` con `z-50`; aserto de clase; lectura del punto de montaje. **No** se compara el scrim con el panel del drawer (`z-55`): la garantía es la no coexistencia (RF-06) | **Auto + Fuente** |
| El chrome (BottomNav/sidebar) y el disparador no son clicables bajo los velos | *Hit test* en navegador a 375×812 y 1440×900 (con drawer, Cuenta y detalle abiertos) | **Manual** |
| Presupuesto Fluid Glass por vista (1/0 → 2/0; sin blobs) | Conteo tipo **M-8** de la 013 + inspección de clases | **Manual + Fuente** |
| Geometría del disparador en móvil (sobre el BottomNav; `env(..., 0px)` **aplicado** en el `bottom`, reserva **pendiente**) | Navegador a 375×812 (y 320×568); fuente: el control incluye `env(safe-area-inset-bottom, 0px)` en su geometría de `bottom` (no `.safe-bottom`) con los px y el margen lateral que declare el plan (§4.4); la reserva real queda **pendiente** porque el inset resuelve 0 (013 `:909`, D-5/DP-19) | **Manual (pendiente parcial)** |
| Contraste AA del disparador y del panel | Protocolo de medición de la 013, con fondo compuesto | **Manual** |
| Gesto de deslizar en móvil | Se remite a la suite de la 014 (mismo componente) y a punteros/viewport en navegador | **Auto (014) + Manual** |
| Teclado virtual y campo editable en móvil | Foco del campo y visibilidad del panel con el teclado abierto a 375×812; limitación heredada de la 014 | **Manual (limitación)** |
| Cero hexadecimales y cero colores fuera de tokens (solo producción) | `git add -N` + `git diff HEAD --unified=0` con el filtro de suites y revisión de líneas `^+` contra las familias de §3.4 | **Fuente** |
| Componente y suite de la 014 intactos | `git add -N` + `git diff HEAD --stat` de esos dos archivos vacío + suite verde sin editar | **Fuente + Auto** |
| Pruebas nuevas sin editar suites cerradas | Archivo nuevo `src/layout/AsistenteDashboard.test.jsx`; `git diff HEAD --stat` de `DashboardLayout.test.jsx` (incluida su prueba del respaldo `:427-451`), `PanelTarjetas.test.jsx` y de las suites de modales **vacío** | **Fuente + Auto** |
| Cero lógica/red/dependencias | `grep` en el componente reutilizado y en las líneas `^+` de `src/layout/DashboardLayout.jsx` y `src/pages/PanelTarjetas.jsx` (se admite el `useState` de apertura/cierre); `package.json`, `src/config` y `src/App.jsx` sin cambios | **Fuente + Auto** |
| No regresión | `npm test` (línea base **518/518 en 33 archivos**, a **re-medir** en la primera tarea del plan) y `npm run build` verde | **Auto + build** |

---

## 11. Trazabilidad RF ↔ AC ↔ verificación

| RF | AC | Verificación principal | Estado |
|---|---|---|---|
| RF-01 | AC-01 | Diff vacío del componente y de su suite; suite verde sin editar | Vigente |
| RF-02 | AC-02 | Unicidad de nodo/ids/trampa; `grep` en páginas | Vigente |
| RF-03 | AC-03 | Literales verbatim | Vigente |
| RF-04 | AC-04 | Estado `vacio` y ausencia de control de cambio | Vigente |
| RF-05 | AC-05 | ARIA, «X», Esc observable, foco inicial; diff de las cuatro superficies. La unicidad de la llamada de Esc queda en la suite de la 014 | Vigente |
| RF-06 | AC-06 | Una sola superficie con drawer, Cuenta **o detalle de tarjeta** abiertos; activación simulada + lectura del `z-40`; `waitFor` obligatorio en (c); *hit test* manual | Vigente (D-1/DP-15; coexistencia ~0,2 s aceptada, D-4/DP-18) |
| RF-07 | AC-07 | `compareDocumentPosition` + `z-50` del scrim + lectura del punto de montaje + *hit test*; la capa frente al drawer (`z-55`) no se exige porque no coexisten (RF-06) | Vigente |
| RF-08 | AC-08 | Conteo M-8 por vista; scrim y disparador sin blur ni `glass-surface` | Vigente |
| RF-09 | AC-09 | `#` y utilidades de color fuera de las familias de tokens en líneas añadidas de producción | Vigente (D-2/DP-16) |
| RF-10 | AC-10 | `grep` de lógica/red en el componente y en las líneas nuevas del layout/panel + configs y rutas sin cambios | Vigente |
| RF-11 | AC-11 | Suites existentes del dashboard y los modales verdes sin editar; respaldo de foco `:427-451` verde sin editar (D-6) | Vigente |
| RF-12 | AC-12 | Nombre accesible exacto, icono `BotMessageSquare` `size={20}`, `w-11 h-11`, `z-40`, foco visible por tokens, sin paleta nombrada, sin hover/escala, sin blur/hex; geometría manual con `env(..., 0px)` **aplicado** en el `bottom` y reserva **pendiente** | Vigente (P-01 a/DP-11, P-05/DP-13, D-2/DP-16, D-5/DP-19) |
| RF-13 | AC-13, AC-15 | Destino del foco al cerrar (X, Esc, scrim), con `waitFor`; gesto en la 014; exclusión del disparador del respaldo del layout (fuente + prueba cerrada sin editar) | Vigente (P-01 a/DP-11, D-6/DP-20) |
| RF-14 | AC-14 | Las cuatro rutas, **abriendo** el asistente en cada una, con un solo montaje | Vigente (P-02 a/DP-12) |

---

## 12. Impacto en specs cerradas

| Spec | Relación | Impacto y resolución |
|---|---|---|
| **014** | Es el **diseño reutilizado**; aprobada e implementada. | **No se modifica** ni su componente ni su suite ni su spec. Esta spec **añade un punto de uso** y declara lo compartido (§4.2) y lo divergente (§4.3). Los literales son los mismos: si un literal cambiara, fallaría la suite de la 014, que los copia verbatim (`AsistenteAyuda.test.jsx:15-41`). |
| **013** | Convención de superficies/velos/controles, `glass-card` opaca y **excepción de M-3b** limitada al control de `PaginaInicio.jsx`. | **No se reabre ni se re-mide.** El asistente añade **una** superficie (el panel) y **0 blobs**, y su scrim no cuenta: el dashboard pasa de **1/0** a **2/0** con el asistente abierto, dentro del límite 3/2 (013 M-8 `:914-919`). El disparador **no lleva blur** para no crear un uso fuera del inventario. `index.css` y su prueba no se tocan. |
| **010** | Cromo congelado (X, Esc único, clic fuera, gesto, **una sola superficie y una trampa**, retorno de foco). | El asistente del dashboard **reutiliza** el cromo ya conforme; se garantiza **una sola superficie** cerrando drawer, Cuenta y **detalle de tarjeta** en el único punto de apertura (RF-06). El detalle se apaga desde su **estado dueño** (`tarjetaActiva`), no desde su cromo: `ModalTarjeta` no cambia (§4.5, D-1/DP-15). **No** se cambia ninguna de las cuatro superficies existentes ni se añade un segundo mecanismo de cierre. |
| **004/005** | El detalle de tarjeta vive en `PanelTarjetas` (excepción de la capa `pages`) y su estado es `tarjetaActiva`. | **Sin impacto de propiedad:** el estado sigue en `PanelTarjetas`; solo se añade el **registro** de un cierre que ya existe (`setTarjetaActiva(null)`) por `Outlet context`. `ModalTarjeta`, `AcordeonTarjetas`, `GridTarjetas` y los datos no cambian. |
| **011** | Cadena determinista de retorno de foco y respaldo por versión de vista. | `triggerRef` apunta al control flotante del dashboard y el foco vuelve **exactamente** a él (RF-13); el respaldo estable (`Abrir menú` / navegación lateral) queda solo como defensa por si el control desapareciera. La cadena del cruce de 768px **se conserva con sus tres escalones** (`trasladarFocoDeCruce`); solo cambia el **conjunto de candidatos** (filtro local de `esCandidatoDeCruce` autorizado por D-6), y no se tocan `useRetornoDeFoco`/`useCierreConEsc`. El único ajuste está en el **respaldo local del layout**: el disparador lleva `data-respaldo-foco="excluir"` y `esCandidatoDeCruce` lo descarta (D-6/DP-20), sin cambiar los escalones de 011 ni la prueba cerrada `DashboardLayout.test.jsx:427-451`. |
| **008/009** | Retiraron el header y fijaron sidebar + BottomNav/drawer. | **No** se reintroduce header, **no** se cambia la navegación ni su grilla `grid-cols-4` (`BottomNav.jsx:39`): el disparador es un **control flotante fuera** de la navegación (P-01 a, DP-11), así que 007/008/009 quedan **sin tocar**. |
| **001** | Contrato Fluid Glass (blur, fallback, transparencia y movimiento reducidos). | Sin impacto: no se toca la hoja ni se añaden superficies con filtro; el panel reutilizado ya cumple. |
| **005/006/007/012/015** | Arquitectura de capas, `Card`, navegación responsive, correcciones y higiene. | Sin impacto: no se mueven archivos, no se cambian props ni textos existentes y no se tocan cabeceras ni dobles. |

---

## 13. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El scrim (`z-50`) empata con el **BottomNav** (`z-50`) y el nav queda por encima y clicable | Se rompe «una sola superficie» (010 RF-07) | DP-08/RF-07: montar **después** del chrome en el orden del documento; AC-07 (`compareDocumentPosition`) + *hit test* manual |
| Se intenta exigir que el scrim (`z-50`) quede por encima del panel del drawer (`z-55`) | Cláusula imposible por CSS y contradictoria con §3.2/§3.3 | RF-07/AC-07: la garantía es ganar al BottomNav (`z-50`) y al sidebar (`z-40`) y **no coexistir** con el drawer (RF-06); si coexistieran por un defecto, se registra como defecto (CL-01) |
| El **disparador nuevo** gana el respaldo de foco del cruce y rompe `DashboardLayout.test.jsx:427-451` | Se incumple AC-11 sin poder editar la suite | D-6/DP-20: `data-respaldo-foco="excluir"` + filtro en `esCandidatoDeCruce` (`DashboardLayout.jsx:16-24`, `:46-54`); AC-15 (fuente + suite cerrada verde sin editar) |
| El **panel del drawer** (`z-55`) tapa al asistente si se abre con el drawer abierto | El asistente queda inalcanzable | RF-06/CL-01: cerrar el drawer en el único punto de apertura (patrón `DashboardLayout.jsx:136-139`) |
| Abrir el asistente con el **detalle de tarjeta** abierto deja dos superficies | Se rompe «una sola superficie» (010 RF-07) | RF-06/CL-02/§4.5: señal de cierre por `Outlet context` en el mismo commit; AC-06 (un solo `role="dialog"` y foco dentro del asistente) |
| El **nodo saliente** del detalle (`AnimatePresence`, 0,2 s) hace fallar un aserto síncrono de unicidad | AC-06 intermitente o mal declarado | §4.5/DP-18: **límite aceptado** (~0,2 s, dos nodos, uno no operable); la unicidad se comprueba con `waitFor` y **no** se rebaja a síncrona; no se suprime la animación ni se toca `ModalTarjeta` |
| El registro de cierre del detalle queda huérfano o llama a un componente desmontado | Error de React / cierre inesperado | §4.5: el layout llama con `?.()` y `PanelTarjetas` limpia el registro al desmontar; CL-14/AC-14 |
| El retorno de foco de `ModalTarjeta` roba el foco al asistente al cerrarse el detalle | El foco queda fuera del diálogo | §4.5: cierre en el mismo commit y trampa del asistente activa; AC-06 exige `dialogo.contains(document.activeElement)` |
| Empate de capa de Esc a **60** con el modal de Cuenta | Esc cerraría la capa equivocada | No coexisten (RF-06); regla de `useCierreConEsc` (`:17-31`) y defensa de 010 RF-04 documentada en CL-02. **No** se toca el `zIndex` del componente |
| Se **copia** el `className` con hex del control de la portada | Rompe la regla de tokens | RF-09/AC-09: 0 `#` y utilidades de color solo de las familias de §3.4 en líneas añadidas de producción |
| «Solo tokens» se cumple con `text-white`/`bg-black/70`/`slate-800` | La regla quedaría sin efecto | RF-09/AC-09/AC-12: lista cerrada de familias y rechazo de paleta nombrada y valores arbitrarios |
| El disparador nuevo lleva `backdrop-blur` o `glass-surface` | Uso fuera del inventario de la 013 ⇒ reabriría M-3b; superficie extra | DP-04/RF-12: prohibido; AC-08/AC-12 inspeccionan clases |
| El disparador añade hover/escala o se pinta sobre un velo | Incumple D-2 o deja el control clicable bajo la superficie | RF-12/AC-12: `hover:`/`scale-`/`transition` prohibidos y `z-40` en fuente; *hit test* manual (AC-06) |
| Se **modifica** el componente de la 014 «para encajarlo» | Se rompe la 014 y su suite verbatim | DP-02/DP-14/AC-01: diff vacío + suite verde sin editar; si un problema **real** exigiera tocarlo, es **bloqueo**; CL-13 |
| Montar el asistente en cada página | Ids duplicados y dos trampas | RF-02/AC-02: montaje único; `grep` en `src/pages/PaginaDashboard*.jsx` |
| El disparador flotante tapa el control «Menú» del BottomNav en móvil | La navegación deja de ser usable | §4.4/RF-12: geometría por encima del BottomNav + `env(safe-area-inset-bottom, 0px)` **aplicado en el `bottom`**; el desplazamiento exacto lo fija el plan; CL-03 manual con la reserva real **pendiente** (D-5/DP-19), nunca verde |
| Se confunde el diseño con ayuda real | Expectativa falsa de respuestas | Marca `Demostración · No es una IA real` + `NOTA_DISENO` + controles `aria-disabled` (heredados) |
| Se «arregla» la deuda de hexadecimales en JSX de paso | Fuera de alcance y sin decidir | DP-10: se declara, no se corrige |
| Se reabre 013/014/015 para «alinear» textos | Trabajo ajeno al alcance | §12: se declara el impacto y no se tocan |

---

## 14. Trazabilidad de fuentes

| Fuente | Decisión / requisito | Dónde |
|---|---|---|
| Petición del usuario: «mismo chat para el dashboard» + acotación «solo diseño» | Reutilizar el diseño de la 014 en el dashboard, sin lógica | §1, §2.1, RF-01, RF-04, DP-01 |
| Decisiones del usuario 2026-10-19 (P-01 a, P-02 a, P-03, P-04, P-05) | Disparador flotante con tokens y sin blur; alcance total con un montaje; sin convivencia de capas; no tocar el componente (bloqueo si hiciera falta); nombre accesible literal exacto | §15, §2.3, DP-11, DP-12, DP-13, DP-14, RF-12, RF-13, RF-14 |
| Decisiones del usuario 2026-10-20 (D-1, D-2, D-3) | Detalle de tarjeta en «una sola superficie» sin tocar `ModalTarjeta`; disparador `z-40`, tokens, sin hover/escala, sobre el BottomNav con `env(..., 0px)` en el `bottom`; `MEMORY.md` solo con la línea de la 017 | §16, §2.3, DP-15, DP-16, DP-17, RF-06, RF-09, RF-12, AC-06, AC-09, AC-12 |
| Decisiones finales 2026-10-20 (D-4, D-5) | Nodo saliente del detalle **aceptado y documentado** (~0,2 s, no operable, `waitFor`; sin tocar `ModalTarjeta`); área segura **aplicada y pendiente** (inset 0 por falta de `viewport-fit=cover`); desplazamiento exacto **en el plan** dentro de §4.4 | §16, §2.3, DP-18, DP-19, §4.4, §4.5, §9.1, RF-06, RF-12, AC-06, AC-12 |
| Decisión de cierre de bloqueantes 2026-10-20 (D-6) | Disparador **excluido del respaldo de foco** del layout (`data-respaldo-foco="excluir"` + filtro en `esCandidatoDeCruce`), sin tocar `useRetornoDeFoco` ni suites; corrección de RF-07 a lo verificable (scrim sobre BottomNav/sidebar, sin coexistencia con drawer) | §4.5, DP-20, RF-07, RF-13, AC-07, AC-11, AC-15 |
| `src/pages/PanelTarjetas.jsx:31`, `:43-46`; `src/components/domain/modales/ModalTarjeta.jsx:71`, `:106`, `:119` | Estado `tarjetaActiva` fuera del layout; cierre del detalle desde su dueño; cromo del detalle intacto | §3.2, §4.5, RF-06, CL-02, CL-14 |
| `node_modules/react-router/dist/index.js:245-254` | `Outlet context` sin proveedor devuelve `null` (no lanza): las pruebas de `PanelTarjetas` sin router siguen válidas | §4.5, AC-11 |
| `src/layout/DashboardLayout.jsx:113-234` | Layout compartido: chrome, `Outlet`, estados de superficie y patrón de cierre previo | §3.1, §4.1, RF-02, RF-06, DP-05 |
| `src/layout/DashboardLayout.jsx:16-24`, `:46-54`, `:72-81`; `src/layout/DashboardLayout.test.jsx:427-451` | Selectores del cruce, validación del respaldo y prueba cerrada del «primer control enfocable»: base de D-6/DP-20 | §3.2, §4.5, RF-13, AC-11, AC-15 |
| `src/pages/PanelTarjetas.test.jsx:72-254` | Suite cerrada de `PanelTarjetas` (**12** pruebas) que monta el panel sin `Outlet`: obliga a tolerar `null` | §4.5, AC-11 |
| `src/styles/index.css:34-36` | `.safe-bottom` aplica `padding-bottom` con fallback `1rem`: no sirve como offset; el disparador usa `env(..., 0px)` en el `bottom` | §3.4, §4.4, RF-12, AC-12, DP-19 |
| `specs/014-asistente-de-ayuda/spec.md:90-126`, `:206-311`, `:313-341` | Diseño, estados, literales y controles presentacionales que se reutilizan | §4.2, RF-03, RF-04, AC-03, AC-04 |
| `src/components/domain/modales/AsistenteAyuda.jsx:85-227` | Componente vivo: props, capas, ARIA, scrim sin blur, ids | §3.2, §4.1, §4.2, RF-01, RF-05, RF-07 |
| `AsistenteAyuda.test.jsx:15-41` | Literales copiados verbatim: cambiarlos rompería la 014 | AC-01, §12 |
| `src/App.jsx:29-49`, `src/config/app.config.js:13` | Rutas del dashboard y guardia demo | §3.1, RF-10 |
| `src/components/layout/BottomNav.jsx:39`, `src/components/layout/DashboardDrawer.jsx:37`, `:71`, `:108`, `:138`, `src/components/layout/DashboardUserModal.jsx:66`, `:109`, `:161`, `src/components/domain/modales/ModalTarjeta.jsx:75`, `:106`, `:119` | Capas reales y velos (`z-40/50/55/60`) | §3.2, CL-01, CL-02, CL-04 |
| `src/hooks/useCierreConEsc.js:17-31`, `src/hooks/useRetornoDeFoco.js:66-75`, `:114-125` | Capa superior y cadena de retorno con respaldo por versión de vista | §3.2, RF-13, CL-05 |
| `src/components/layout/SidebarNavContenido.jsx:29-34`, `:58-77`; `BottomNav.jsx:18-22`, `:39`, `:69-81` | Navegación actual del dashboard, sin ayuda | §3.1, §4.4, CL-08 |
| `src/components/ui/Card.jsx:13`; 013 `spec.md:298-304` | `glass-card` es sólida: no cuenta como superficie | §3.3, RF-08 |
| 013 `spec.md:274-297`, `:914-919`, `:925-926`, `:340-347`, `:321-338`, `:909` | Convención velos/controles; M-8 por vista; **hallazgo P8** sobre la grilla del BottomNav (la 013 ordenó corregirla; el código ya está en `grid-cols-4`); deuda del área segura | §3.3, §3.4, RF-08, CL-03, AC-08 |
| 010 `spec.md:386-456`, `:458-464` | Cromo congelado y defensa de capas apiladas | RF-05, RF-06, CL-02, §12 |
| 011 `spec.md:484-520` | Captura al abrir, cadena y respaldo | RF-13, CL-05, §12 |
| `src/components/domain/dashboard/MiTarjetaVirtual.jsx:188` | `soporte@finapp.com` **sí** se muestra en el reverso del dashboard; por eso el fuera de alcance se acota al asistente | §2.2, §9 |
| `src/styles/index.css:15-28`, `:30`, `:34-36`, `:79-82`, `:88-94`, `:124-135`; `AGENTS.md:41-44`; `.agents/rules/rules.md:26-29`, `:37-38`, `:62-65` | Tokens (once colores), radio, área segura, superficies y límite 3/2 (sin prueba automática) | §3.4, RF-09, AC-08, AC-09 |
| `src/pages/PaginaInicio.jsx:29`, `:64-69`, `:72-80` | Punto de uso y control de la portada que **no** se copia (`:72-80` es el control; `:77` su `className` con blur; `:55` es `<LandingLayout>`) | §3.1, §3.3, §4.3, RF-09, DP-04 |
| `MEMORY.md:33`, `:37` | Deudas registradas (área segura y registro de archivos ajenos sin commitear) | §3.4, §9 |

> **Nota:** el registro de archivos ajenos sin commitear de `MEMORY.md` queda **fuera** de esta spec:
> **no se toca** y no se propone ninguna edición sobre esas líneas. Lo **único** que cambia en
> `MEMORY.md` al cerrar es la **línea de referencia de la 017** (D-3/DP-17).

---

## 15. Decisiones del usuario (P-01…P-05) — cerradas

Las cinco preguntas quedaron **resueltas** por el usuario el 2026-10-19. **No queda ninguna pregunta
abierta**: el plan y las tareas pueden escribirse cuando el usuario los pida.

| ID | Decisión tomada | DP | Realizan |
|---|---|---|---|
| **P-01** | **Disparador: control flotante de robot** (opción a). Mismo icono `BotMessageSquare` y **mismos atributos** que la portada; **sin `backdrop-filter`**; aspecto **solo de tokens** (nunca los literales `bg-[#0f1117]/80` ni `hover:bg-[#1a7a5e]`); geometría móvil **por encima del BottomNav** (~60 px) aplicando `env(safe-area-inset-bottom, 0px)` en el `bottom`, sin taparlo ni desbordar el viewport | DP-11 | RF-12, RF-13, CL-01…CL-03, CL-06, CL-08 |
| **P-02** | **Alcance: todo el dashboard** (opción a). **Un único montaje** en el layout, cubriendo las cuatro rutas (Inicio, Transacciones, Tarjetas y Configuración, esta última desde el modal de Cuenta); nada de montaje por página | DP-12 | RF-14, CL-07 |
| **P-03** | **Sin convivencia de capas.** Al abrir el asistente se **cierran** el drawer, el modal de Cuenta **y el detalle de tarjeta** en el **único punto de apertura** (patrón ya existente + señal de §4.5); no se apila | DP-05 (confirmado), DP-15 | RF-06, CL-01, CL-02, CL-14, AC-06 |
| **P-04** | **No tocar `AsistenteAyuda.jsx`.** Componente y suite **intactos** (`diff` **vacío**, suite verde **sin editarse**). Si un problema **real** de capas o de `Escape` exigiera tocarlo, es un **bloqueo que se reporta** | DP-02 (confirmado), DP-14 | RF-01, RF-05 |
| **P-05** | **Nombre accesible: literal exacto `Abrir el asistente de ayuda`**, idéntico al de la portada (sin divergencia) | DP-13 | RF-03, RF-12, AC-12 |

**Descarte declarado:** el **quinto control del BottomNav** queda descartado mientras obligue a cambiar
la grilla `grid-cols-4` (`BottomNav.jsx:39`; la 013 **ordenó corregir** la grilla de cinco pistas y su
§4.5 documenta el hallazgo, `specs/013-calidad-css/spec.md:340-347`) o la navegación cerrada de
007/009 (DP-11). El resto de opciones descartadas de P-01 (b/c/d) y de P-02 (b/c/d) consta, con su
motivo, en DP-11 y DP-12.

---

## 16. Decisiones de la revisión y de cierre de bloqueantes (D-1…D-6) — cerradas

Las seis decisiones se tomaron el **2026-10-20**. **No queda ninguna pregunta abierta**: el plan y las
tareas pueden escribirse cuando el usuario los pida.

| ID | Decisión tomada | DP | Realizan |
|---|---|---|---|
| **D-1** | **El detalle de tarjeta entra en la regla de «una sola superficie».** Abrir el asistente **cierra también** `ModalTarjeta` (abierto desde `/dashboard/tarjetas`), con el mecanismo de **señal explícita por `Outlet context`** (§4.5). **No** se toca `ModalTarjeta.jsx` ni el cromo de 010; **sí** se toca `src/pages/PanelTarjetas.jsx` y el layout. Archivos exactos: `DashboardLayout.jsx`, `PanelTarjetas.jsx` y el archivo nuevo de pruebas `AsistenteDashboard.test.jsx` | DP-15 | RF-06, CL-02, CL-14, AC-06 |
| **D-2** | **Aspecto del control flotante:** capa **`z-40`** (bajo los velos `z-50`), colores y borde **solo desde tokens**, **sin hover ni escala** (ninguna animación al pasar el puntero), geometría **por encima del BottomNav (~60 px) + `env(safe-area-inset-bottom, 0px)` en el `bottom`** | DP-16 | RF-09, RF-12, AC-06, AC-09, AC-12, CL-03, CL-11 |
| **D-3** | **`MEMORY.md`:** el cierre de la 017 **sí** añadirá su referencia (ruta y estado), **solo esa línea**; no se toca el texto de hex ni la línea de ajenos | DP-17 | §9, cierre |
| **D-4** | **Nodo saliente del detalle de tarjeta: aceptado y documentado.** Al abrir el asistente con el detalle abierto, el nodo saliente permanece **~0,2 s** por la animación de salida de `AnimatePresence`, **deja de ser operable** y los asertos usan **`waitFor`**. **No** se suprime la animación ni se toca `ModalTarjeta.jsx` (D-1/010 sigue vigente). Límite declarado: durante ~0,2 s coexisten **dos nodos de diálogo** en el DOM, uno no operable | DP-18 | RF-06, CL-02, AC-06, §4.5, §9.1 |
| **D-5** | **Área segura: aplicar y declarar pendiente.** El disparador **aplica** `env(safe-area-inset-bottom, 0px)` **en su `bottom` calculado** (no la utilidad `.safe-bottom`, que es padding con fallback `1rem`); como el inset vale **0** sin `viewport-fit=cover` (deuda de la 013), la reserva real **no está resuelta** y se registra como **pendiente**, **nunca como verde**. Se ajusta el RF/AC manual a «aplica + pendiente» y entra en la lista de pendientes que hereda la aprobación | DP-19 | RF-12, CL-03, AC-12, §4.4, §9.1, §10 |
| **D-6** | **El disparador no es candidato del respaldo de foco del layout.** Marca estable `data-respaldo-foco="excluir"` en el `<button>` + constante `SELECTOR_EXCLUIDO_RESPALDO` + `!nodo.closest(...)` en `esCandidatoDeCruce` (`DashboardLayout.jsx:16-24`, `:46-54`). **No** se toca `useRetornoDeFoco` ni ninguna suite; la prueba cerrada `DashboardLayout.test.jsx:427-451` sigue verde sin editarse. Los controles reales de navegación y contenido siguen siendo candidatos | DP-20 | RF-13, AC-11, AC-15, §4.5 |

**Nota de cierre:** la spec queda **aprobada** (2026-10-20); el **plan** y las **tareas** están
escritos en [plan.md](plan.md) y [tasks.md](tasks.md). No hay cláusulas condicionadas: RF-06, RF-09 y
RF-12/RF-13/RF-14 con AC-06/AC-09/AC-12/AC-13/AC-14/AC-15 son **exigibles**. El **desplazamiento
exacto** del disparador (px de `bottom` y margen lateral) queda fijado **en el plan** dentro del rango
de §4.4, sin preguntas abiertas: `bottom` de **60 px + `env(safe-area-inset-bottom, 0px)` + 16 px** y
margen lateral **24 px** (`right-6`).

**Pendientes heredados que asume la aprobación** (detalle y regla de registro en §9.1):
(a) **reserva real del área segura** — `env(..., 0px)` **aplicado en el offset**, inset **0**, reserva **pendiente**
(D-5/DP-19); (b) **coexistencia de ~0,2 s** del nodo saliente del detalle, **aceptada** con su límite
declarado y asertos con `waitFor` (D-4/DP-18); (c) las **mediciones manuales** de §10 (*hit test*,
geometría, contraste, M-8, teclado virtual) y la **re-medición de la línea base** en la primera tarea
del plan. Ninguno se reporta como verde.
