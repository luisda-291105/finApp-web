# Plan 011 — Devolución de foco de las cuatro superficies modales y traslado de foco al cruzar el corte de 768px

**Estado:** borrador
**Spec base:** `specs/011-foco-de-superficies-y-cruce/spec.md` (**aprobada por el usuario** el
2026-10-17; verificada por el reviewer: «SPEC OK PARA PLANIFICAR»)
**Tareas:** `specs/011-foco-de-superficies-y-cruce/tasks.md`
**Fecha:** 2026-10-17
**Alcance aprobado (no se reabre):** cuatro superficies (`DashboardDrawer`, `DashboardUserModal`,
`AuthModal`, `ModalTarjeta`) + traslado de foco al cruzar 768px + cierre que navega. Decisiones
**H2/H3/H4/H12** cerradas. Sin cambios de aspecto, sin hex nuevos, **sin props nuevas**, sin `refs`
nuevas desde los consumidores, sin dependencias nuevas.

---

## 0. Condiciones de ejecución (leer antes de tocar nada)

1. **Orden con la 012 (crítico, H4).** La **012 se implementa PRIMERO**
   (`specs/012-correcciones-menores/spec.md` §3.4/§7.1-B/DP-12; 011 §3, §9, §10-1 y §11-H4) y la 011
   se **re-mide después** contra el estado resultante: la 011 **no se implementa ni se planifica
   antes**. La Tarea 1 **comprueba en el primer paso** que el stub **local** de
   `DashboardUserModal.test.jsx` ya es **coherente** (post-012: `matchMedia` derivado de
   `innerWidth`, `:38-48` `mockMatchMedia`/`:56-62` `restaurarViewportEscritorio`). **Si no lo es,
   se PARA y se avisa**: sin ese ajuste, el caso
   `:285-309` (respaldo lateral) mide «móvil» y no puede quedar verde.
2. **Paso 0 dentro de cada tarea: re-leer el código real.** El usuario edita a mano y toda referencia
   `archivo:línea` **debe** re-verificarse antes de editar (DP-21); si un artefacto que este plan
   espera ya no existe, se registra como «ya no aplicable» (CL-15), no se recrea. Las líneas citadas
   aquí se verificaron leyendo los archivos el **2026-10-17**.
3. **Cambios mínimos y localizados**, sin reformatear líneas ajenas al objetivo y sin migraciones
   generales.
4. **Validación por tarea:** `npx vitest run <ruta>` al cerrar cada tarea; `npm test` y
   `npm run build` en la Tarea 10. Nada se declara verde sin medirse: cada criterio se reporta
   **pass / fail / no ejecutado**.
5. **Límites duros:** **sin props nuevas ni cambios de firma** (RF-07/RF-16), sin `refs` nuevas desde
   los consumidores, sin dependencias, sin hexadecimales nuevos, sin superficies translúcidas ni blobs
   nuevos (≤3 / ≤2), **sin animaciones ni transiciones nuevas** (AC-21). El corte de 768px, el
   contrato de 4 props de `useBreakpoint` (009) y el mapa de rutas **no se tocan**.
6. **La 010 no se toca** (DP-09/AC-19): ni `spec.md`, ni `plan.md`, ni `tasks.md`, ni notas dentro de
   `specs/010-*/`. La 012 tampoco se toca (`specs/012-*/` es de otra fase).
7. **Cabeceras JSDoc.** `AGENTS.md`/`doc/constitution.md`/`.agents/rules/rules.md` citan
   `.agents/file-header-template.md`, **ruta que no existe**: la plantilla real es
   `.agents/skills/file-hearder-template.md/SKILL.md` (typo «hearder»). Se avisa de la inconsistencia
   antes de seguirla (§9 de la spec, §8). Los archivos **nuevos** de este plan llevan esa cabecera.
8. **Sin commit ni staging** en las fases de spec/plan; no usar `git add -A`. La única operación de
   git permitida es de **lectura** (`git status --porcelain --untracked-files=all`, `git diff --stat`).
9. **Dónde vive la configuración de pruebas (hecho de la 010).** El bloque `test` **ya no está** en
   `vite.config.js`: la configuración vive en un **`vitest.config.js`** y en `package.json`
   (`"vitest": { "setupFiles": ["vitest.setup.js"] }`), edición manual del usuario que **no se
   revierte**. Ninguna tarea de este plan edita `vitest.config.js`, `vite.config.js` ni
   `package.json`; el andamiaje de geometría de `vitest.setup.js:55-91` **se reutiliza tal cual** y
   **no se modifica** (RF-18/AC-16).

---

## 1. Resumen de cambios

| Archivo | Cambio principal | RF |
|---|---|---|
| `src/hooks/useRetornoDeFoco.js` **(nuevo)** + `useRetornoDeFoco.test.js` **(nuevo)** | **Pieza compartida** de la regla común: guarda de «estuvo abierta», captura incondicional, cadena validada con **comprobación del resultado** y **respaldo por versión de vista**. Exporta además el resolutor puro `resolverControlDeVista` que consume el cierre que navega | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-16, RF-18 |
| `src/hooks/useFocoEnVistaDestino.js` **(nuevo)** + `useFocoEnVistaDestino.test.js` **(nuevo)** | Pieza del **cierre que navega**: lee la marca de `location.state` y coloca el foco en la **vista de destino** una sola vez, con la lista ordenada de RF-15 | RF-15, RF-16, RF-18 |
| `src/components/layout/DashboardDrawer.jsx` + su test | **Paridad M4**: se retira la lógica propia (captura condicional y cadena sin validar) y se usa la pieza compartida; respaldo móvil = botón «Menú» (el mismo nodo que el `triggerRef`) | RF-06, RF-08, RF-16, RF-19 |
| `src/components/layout/DashboardUserModal.jsx` + su test | Respaldo estable **por versión de vista** (`useBreakpoint`, sin props nuevas) y comprobación del resultado del foco; se conserva M4 y la firma `{ abierto, alCerrar, triggerRef? }` | RF-06, RF-09, RF-16, RF-19 |
| `src/components/domain/modales/AuthModal.jsx` + `AuthModal.test.jsx` | **Captura y devolución de foco** que hoy no existen (hueco de RF-08 de la 010), con la pieza compartida; respaldo = primer control enfocable **solo en la landing**; en `/login`, **limitación explícita** (H2). Aspecto, marcado y hex heredados **intactos** | RF-06, RF-10, RF-16, RF-19 |
| `src/components/domain/modales/ModalTarjeta.jsx` + `src/components/ModalTarjeta.test.jsx` | **Migración al patrón M4** (H12): la devolución se gobierna por la **transición abierta → cerrada**, no por la limpieza del efecto; se conservan captura, foco inicial al contenedor, bloqueo de scroll, **trampa manual** y contrato `{ tarjeta, onCerrar }` | RF-06, RF-11, RF-16, RF-19 |
| `src/layout/DashboardLayout.jsx` + `DashboardLayout.test.jsx` | **Cruce del corte en ambos sentidos**: (a) con el menú abierto, traslado **incondicional** al control lateral; (b) sin panel, traslado **solo** si el elemento enfocado pertenecía a la navegación que se desmonta (registro interno por `focusin`); el cruce **no** roba el foco a quien sobrevive | RF-12, RF-13, RF-14, RF-16, RF-19 |
| `src/pages/PaginaLogin.jsx` | El cierre que navega **declara la intención** de colocar el foco en el destino (`navigate(ruta, { state: { focoEnDestino: true } })`). **Una línea**; sin tocar rutas, contenido ni marcado | RF-15, RF-19 |
| `src/pages/PaginaInicio.jsx` | Consume la pieza del destino (una línea) para colocar el foco en la landing al llegar desde un cierre que navega | RF-15, RF-19 |
| `src/App.test.jsx`, `src/components/domain/modales/AuthModal.test.jsx`, `src/components/layout/cierreDeModales.test.jsx`, `src/pages/PanelTarjetas.test.jsx` | **Ampliación** de las suites existentes (casos nuevos; los vigentes **no se modifican**): cierre que navega, paridad, convivencia y no-regresión | RF-18, RF-15, RF-06 |
| `MEMORY.md` | Registro del estado **medido** y de las decisiones tras la validación final | — |

**Ningún archivo cambia de ruta ni de nombre.** El test de `ModalTarjeta` sigue hoy en
`src/components/ModalTarjeta.test.jsx` (fuera de la carpeta del componente, herencia de la 004): se
edita **en su sitio**, no se mueve.

### 1.1 Lo que NO se toca (exenciones explícitas)

`src/components/layout/BottomNav.jsx`, `SidebarResponsive.jsx`, `SidebarNavContenido.jsx` (solo se
**reutilizan** como destino de foco: la 011 no los modifica), `src/components/ui/BotonCerrar.jsx`,
`src/hooks/useCierreConEsc.js`, `src/hooks/useDeslizarParaCerrar.js`, `src/hooks/useBreakpoint.js`
(se consume, **no** se cambia su contrato), `vitest.setup.js`, `vitest.config.js`, `vite.config.js`,
`package.json`, `src/config/*`, `src/data/tarjetasDemo.js`, `src/App.jsx` (mapa de rutas),
`specs/010-*/`, `specs/012-*/`, y **todo** caso vigente de las suites implicadas.

---

## 2. Arquitectura objetivo

### 2.1 Piezas y flujo

```
src/hooks/useRetornoDeFoco.js          ← LA regla común (una sola implementación)
   ├─ useRetornoDeFoco({ activo, triggerRef })      ← la usan las CUATRO superficies
   │     1) useLayoutEffect: captura SIEMPRE document.activeElement al abrir   (RF-03)
   │     2) guarda `estuvoAbiertoRef`: el cierre solo actúa si llegó a abrirse  (RF-01/RF-02)
   │     3) cadena validada: disparador → capturado → control estable de la
   │        versión de vista → primer control enfocable; con COMPROBACIÓN del
   │        resultado (`document.activeElement === candidato`)                  (RF-04/RF-05)
   └─ resolverControlDeVista(esMovil)  ← resolutor puro (compartido, sin hooks)

src/hooks/useFocoEnVistaDestino.js     ← el cierre que navega (RF-15)
   ├─ lee `location.state.focoEnDestino` (marca escrita por el cierre)
   ├─ espera al render de la vista de destino (efecto de nivel de ruta)
   ├─ una sola vez por entrada de historial (`location.key` + ref)
   └─ aplica la MISMA lista ordenada: control estable por versión → primer
      control enfocable → limitación explícita

DashboardLayout
   ├─ [móvil]     DashboardDrawer       → useRetornoDeFoco (respaldo: botón «Menú»)
   ├─ [siempre]   DashboardUserModal    → useRetornoDeFoco (respaldo: «Menú» en móvil;
   │                                       control lateral en ≥768px)
   ├─ cruce 768px (ambos sentidos)      → efecto bidireccional + registro `focusin`
   └─ [destino]   useFocoEnVistaDestino → foco en la vista de destino tras el cierre que navega

PaginaInicio (landing)  → useFocoEnVistaDestino (destino «primer control enfocable»)
AuthModal / ModalTarjeta → useRetornoDeFoco (respaldo del área pública / del dashboard real)
```

**La regla común se implementa UNA vez** (pieza compartida, DP-06): RF-06 exige que las cuatro
superficies resuelvan el mismo problema **de la misma manera**; una sola implementación probada hace
esa equivalencia **estructural** y no una coincidencia entre cuatro copias (que es justo la causa raíz
§4.7 de la spec). Es la misma forma con la que la 010 resolvió su maquinaria común
(`useCierreConEsc`, `useDeslizarParaCerrar`). **La pieza no recibe props nuevas de los consumidores**:
su contrato son dos valores locales que cada superficie ya tiene (`activo` y su `triggerRef` opcional)
y la versión de vista la obtiene del hook `useBreakpoint` **dentro** de la pieza (H4).

### 2.2 Contrato de la pieza compartida

| Aspecto | Contrato |
|---|---|
| Firma | `useRetornoDeFoco({ activo, triggerRef })` — `triggerRef` **opcional** (RF-07) |
| Marca de apertura | `useLayoutEffect(() => { if (activo) previoRef.current = document.activeElement }, [activo])` → sincrónica al commit, **antes** de que la trampa enfoque el contenedor (RF-03) |
| Guarda de transición | `estuvoAbiertoRef`: se marca en `activo === true`; el cierre solo corre si estaba marcada; se **desmarca** al ejecutar. Con esto el montaje cerrado y los re-renders cerrados no mueven el foco (RF-01/RF-02), el doble montaje de `StrictMode` (`src/main.jsx:16`) no produce dos devoluciones (CL-14) y `ModalTarjeta` deja de actuar en la limpieza de su efecto (H12) |
| Cadena | `[triggerRef?.current, previoRef.current]` y después el **control estable de la versión de vista**; cada candidato se acepta solo si es `instanceof HTMLElement`, **no** es `document.body`, está `isConnected` **y** queda enfocado tras el intento (`document.activeElement === candidato`); si no queda, la cadena **continúa** (Q-03/RF-04, CL-02/CL-03/CL-09) |
| Respaldo | `resolverControlDeVista(esMovil)`: (1) control de la **versión actual**; (2) **otro** control estable; (3) **primer control enfocable de la vista**; (4) `null` = **limitación explícita** (sin marcado ficticio). `esMovil` viene de `useBreakpoint()` **dentro** de la pieza (H4) |
| Nunca | `document.body` ni un nodo desconectado; nunca `focus()` sobre un nodo que se está desmontando (RF-05/CL-10) |

### 2.3 Mecanismos que fija este plan (§2.3 de la spec)

**M1 — Forma de la regla común: pieza compartida `useRetornoDeFoco` (DP-06, RF-06).** Los cuatro
consumidores llaman a la pieza y **retiran** su lógica propia de foco (el drawer la tiene completa en
`:72-90`; `ModalTarjeta` la tiene en la limpieza de `:57-60`; `AuthModal` no la tiene). Comportamiento
observable idéntico en las cuatro (AC-10). **Decisión:** pieza compartida, no repetición controlada
(la repetición es la causa raíz que esta spec corrige y volvería a divergir).

**M2 — Captura incondicional y guarda de transición (RF-01/RF-02/RF-03).** Ambas viven en M1. Para
`DashboardDrawer` el efecto actual (`:72-78`, captura **condicional**) y su devolución (`:81-90`, sin
marca y con `if (abierto) return`, que confunde «nunca abierto» con «recién cerrado») **se retiran**:
la pieza los sustituye. El `if (!abierto) return null` de `:92` **se conserva** (los hooks se
declaran antes; el componente sigue montado mientras `DashboardLayout.jsx:111-119` lo monte).

**M3 — Control estable por versión de vista, sin props nuevas (DP-04, H4, RF-05/RF-09).**
`useBreakpoint()` (`src/hooks/useBreakpoint.js:38-73`, 4 props, corte único en `:12`) es la fuente de
la versión de vista. **No** se añade ninguna lectura nueva de `matchMedia` (H4: si el hook midiera dos
cosas distintas según el momento, el respaldo elegiría el control equivocado en el primer render).
Coste aceptado: cada superficie abierta llama al hook (dos `matchMedia` por montaje); `ModalTarjeta`,
`AuthModal` y `DashboardUserModal` ya lo hacen vía `useDeslizarParaCerrar` (`:48`). El drawer pasa a
consumirlo (antes no lo necesitaba) y **sigue sin recibir props nuevas**.

**M4 — Respaldo del área pública: primer control enfocable, solo en la landing (Q-01, H2).**
`resolverControlDeVista` termina en el **primer control enfocable en orden de documento** con los
selectores reales de foco (`a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])`,
el mismo estilo que `ModalTarjeta.jsx:22-23`), **excluyendo** los subárboles `[role="dialog"]` (la
superficie que se cierra y su contenedor) y los `disabled`. En la landing eso da el enlace del
logotipo (`Header.jsx:42`); **en `/login` no existe ningún candidato** (`PaginaLogin.jsx:20-31`), así
que la pieza devuelve `null` y rige la **limitación explícita**: no se inventa marcado (H2). El
respaldo **no** desplaza el scroll (no se usa `scrollIntoView`).

**M5 — Cruce del corte en ambos sentidos (RF-12/RF-13/RF-14).** El efecto actual
(`DashboardLayout.jsx:62-72`) solo cubre «móvil → pantallas grandes **con** el menú abierto». Se
sustituye por un efecto **bidireccional** que detecta la dirección con un `ref` de la versión previa
(el primer render no actúa) y aplica **dos caminos**:

- **(a) Panel superpuesto abierto ⇒ se cierra.** Cruzando a pantallas grandes con `mobileMenuAbierto`:
  `setMobileMenuAbierto(false)` y traslado **incondicional** al control lateral
  (`aside[role="navigation"] button`), **con independencia de dónde estuviera el foco**. Es el camino
  vigente y su prueba (`DashboardLayout.test.jsx:316-329`) queda **verde sin cambios** (abre el menú
  programáticamente, con el foco en `body`, y aun así espera el control lateral).
- **(b) Sin panel abierto, lectura simétrica.** Solo si el elemento enfocado **pertenecía a la
  navegación de la versión que se desmonta**: móvil → pantallas grandes ⇒ destino el control lateral;
  pantallas grandes → móvil ⇒ destino el botón **«Menú»** (`BottomNav.jsx:70-82`). Si el elemento
  enfocado **sobrevive** (contenido principal, un campo, o el modal de cuenta con su trampa) **no se
  mueve el foco** (RF-14).

**Detección del origen del foco (§2.3 de la spec; AC-12(ii)/AC-13).** Para saber si el elemento
enfocado pertenecía a la navegación que se desmonta hay que leerlo **antes** del cruce: cuando React
desmonta el nodo, el navegador ya lo ha sustituido por `body`. Mecanismo fijado:

- Un **único** listener `focusin` sobre `document` (registrado una vez en `DashboardLayout`, en un
  efecto de montaje; precedente de escucha global: `useCierreConEsc`) mantiene un `ref` con la
  **procedencia del último foco**:
  - dentro de `aside[role="navigation"]` ⇒ `"escritorio"` (la navegación lateral,
    `SidebarResponsive.jsx:26-36`);
  - dentro de un `nav` y **fuera** de un `aside` ⇒ `"movil"` (la navegación inferior,
    `BottomNav.jsx:39-43`; el `nav` interno de la lateral queda excluido porque vive dentro del
    `aside`);
  - cualquier otro destino (contenido principal, campos, **o cualquier nodo dentro de
    `[role="dialog"]`**) ⇒ `null`, que **borra** el recuerdo.
- En el cruce, el camino (b) actúa solo si el recuerdo **no es `null`** y **no** corresponde a la
  versión actual (`"escritorio"` al cruzar a móvil; `"movil"` al cruzar a pantallas grandes) **y** el
  nodo recordado ya **no** está conectado (`isConnected === false`): las tres condiciones juntas
  significan «lo desmontó este cruce». El borrado por foco ajeno es lo que hace cumplir RF-14 (foco en
  el contenido o en el modal abierto ⇒ sin traslado).
- **Verificabilidad:** `focusin` es un evento que jsdom despacha en `.focus()` y en el clic de
  `userEvent`, así que el mecanismo es **estable en jsdom** y AC-12(ii)/AC-13 quedan **verificables**.
  La Tarea 7 empieza con un **canario** que lo comprueba; si no lo estuviera, AC-12(ii) y AC-13 se
  registran como revisión **no realizada** (nunca verdes) y **no** se rediseña el mecanismo dentro de
  esta spec. Alternativa tolerada si el canario fallara: registrar también `focus`/`blur` en fase de
  captura sobre `document` (mismo recuerdo, sin props ni refs nuevas).
- `BottomNav`, `SidebarResponsive` y `SidebarNavContenido` **no se tocan**: la clasificación se hace
  por `role`/etiqueta ya existentes, igual que el selector DOM que la 010 ya usa
  (`DashboardLayout.jsx:66-68`, `DashboardUserModal.jsx:96`).

**M6 — Colocación del foco en la vista de destino (RF-15, DP-12, H3).** Mecanismo elegido:
**(c) estado de navegación (`location.state`)**.

- El **cierre que navega** (`PaginaLogin.jsx:26-30`, el único punto que sabe que se cambia de ruta)
  escribe la marca: `navigate(TRIAL_ACTIVO ? "/dashboard" : "/", { state: { focoEnDestino: true } })`.
  Un cambio de **una línea**, sin tocar el mapa de rutas (`App.jsx:26-50`), sin marcado y sin props.
- La **vista de destino** (`DashboardLayout` para `/dashboard`; `PaginaInicio` para `/`) consume la
  pieza `useFocoEnVistaDestino()`, que en un efecto de nivel de ruta —por tanto **después** del render
  de la nueva vista— aplica la lista ordenada de RF-15 (M3/M4) y **una sola vez** por entrada de
  historial (`location.key` + `ref`). El `location.state` viaja **solo** con esa entrada, así que una
  navegación ordinaria posterior no lo lleva: **AC-25 se cumple por construcción**, sin bandera global
  que limpiar.
- **Nunca** se usa como candidato un nodo de la vista de origen (CL-18): la pieza corre en el destino,
  con el DOM del destino, y descarta subárboles `[role="dialog"]`.
- Cuando el destino no ofrece candidatos: limitación explícita (AC-23), sin marcado ficticio.

**M7 — Forma de la migración de `ModalTarjeta` al patrón M4 (H12, RF-11).** El efecto único de
`:49-61` se **divide**:

- **Apertura** (`useEffect` sobre `[tarjeta]`): si `tarjeta` está activa, `document.body.style.overflow
  = "hidden"` y foco inicial al contenedor (`refDialogo.current?.focus()`, `tabIndex={-1}` en `:108`);
  su **limpieza solo restaura el scroll** (`overflow = ""`) y **nunca** devuelve el foco. Se retira
  `refActivador` (`:44-45`): la captura la hace M1.
- **Devolución**: la gobierna `useRetornoDeFoco({ activo: Boolean(tarjeta) })` —transición abierta →
  cerrada—, con lo que (i) un cambio de tarjeta y (ii) el doble montaje de `StrictMode` con tarjeta
  activa **no** producen `focus()` sobre el activador (CL-11/CL-14). Se conservan intactos el
  contrato `{ tarjeta, onCerrar }`, la **trampa manual** `atraparTab` (`:71-84`), el Esc
  (`useCierreConEsc`, `:65`), el gesto (`useDeslizarParaCerrar`, `:69`), el clic fuera y el contenido.

**M8 — Selectores concretos (DP-04, §2.3 de la spec).**

| Rol | Selector | Por qué |
|---|---|---|
| Control estable en **móvil del dashboard** | `button[aria-label="Abrir menú"]` (`BottomNav.jsx:70-82`, `aria-label` en `:78`) | Nombre accesible estable y único en la app; el mismo nodo que el layout pasa como `triggerRef` (`:115`/`:127`) ⇒ disparador y respaldo son el mismo control (RF-08) |
| Control estable en **≥768px del dashboard** | `aside[role="navigation"] button` (`SidebarResponsive.jsx:26-36`, `:39-61`) | **Idéntico** al que ya fija la 010 (DP-05) y usa `DashboardUserModal.jsx:96`: no se inventa un selector nuevo |
| **Primer control enfocable** (landing) | `a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])` en orden de documento, excluyendo subárboles `[role="dialog"]` y `disabled` | Mismo estilo de selector ya usado en el producto (`ModalTarjeta.jsx:22-23`) y en las suites; en la landing resuelve al enlace del logotipo (`Header.jsx:42`) |
| Botón **«Menú»** como destino del cruce a móvil | `button[aria-label="Abrir menú"]` | Mismo control estable de la versión de destino (RF-13/AC-13) |

---

## 3. Archivos afectados y límites

### 3.1 Se crean (solo estos)

| Archivo | Contenido | Cabecera |
|---|---|---|
| `src/hooks/useRetornoDeFoco.js` | `useRetornoDeFoco({ activo, triggerRef })` + `resolverControlDeVista(esMovil)` (exportado, resolutor puro sin hooks) | Plantilla real (§0.7) |
| `src/hooks/useFocoEnVistaDestino.js` | `useFocoEnVistaDestino()` (lee `location.state` y aplica la lista ordenada) | Plantilla real (§0.7) |
| `src/hooks/useRetornoDeFoco.test.js` | Suite de la pieza (sin cabecera, §0.7/`AGENTS.md`) | — |
| `src/hooks/useFocoEnVistaDestino.test.js` | Suite de la pieza del destino | — |

Ambas piezas viven en `src/hooks/` porque son **reutilizables** y se consumen desde varios sitios
(`.agents/rules/rules.md`). No se introduce ninguna carpeta nueva (`src/utils/` no existe hoy en el
proyecto y no se crea): el resolutor puro se exporta desde el módulo de la regla común y lo importa la
pieza del destino, que es su único otro consumidor.

### 3.2 Se modifican

Los de la tabla de §1: `DashboardDrawer.jsx`, `DashboardUserModal.jsx`, `AuthModal.jsx`,
`ModalTarjeta.jsx`, `DashboardLayout.jsx`, `PaginaLogin.jsx`, `PaginaInicio.jsx` y sus suites
(`DashboardDrawer.test.jsx`, `DashboardUserModal.test.jsx`, `AuthModal.test.jsx`,
`ModalTarjeta.test.jsx`, `DashboardLayout.test.jsx`, `cierreDeModales.test.jsx`,
`PanelTarjetas.test.jsx`, `App.test.jsx`). Rutas y nombres **sin cambios**.

### 3.3 Superficies translúcidas y blobs

La corrección **no** crea superficies ni blobs: no hay cambios de marcado. Se conservan los límites
Fluid Glass (≤3 superficies / ≤2 blobs). `PaginaInicio` y `PaginaLogin` ganan **cero** elementos.

---

## 4. Decisiones y alternativas descartadas

| # | Decisión | Alternativa descartada y por qué |
|---|---|---|
| **D-01** | **Regla común = pieza compartida `useRetornoDeFoco`** (M1) | *Repetición controlada en las cuatro superficies*: es exactamente la causa raíz (§4.7) que produce la divergencia actual; cuatro copias no garantizan la equivalencia observable que exige RF-06 y cada edición manual futura volvería a desalinearlas. *Copiar el bloque de M4 en cada archivo*: mismo problema |
| **D-02** | La pieza obtiene la versión de vista con **`useBreakpoint()` dentro de la pieza** (M3) | *Pasar `isMobile` como parámetro desde cada superficie*: obligaría a cada superficie a consumir el hook por su cuenta (mismo coste) y abriría la puerta a que una lo mida distinto; *una lectura nueva de `matchMedia`*: prohibida por H4/RF-05 y rompería la fuente única de la 012 |
| **D-03** | **Respaldo público = primer control enfocable excluyendo `[role="dialog"]`** (M4) | *Pasar un `ref` del panel que se cierra a la pieza*: sería un **ref nuevo** (prohibido, RF-07). La exclusión por `[role="dialog"]` consigue lo mismo con el marcado existente: las cuatro superficies son `role="dialog"` |
| **D-04** | **Cruce: efecto bidireccional con `ref` de la versión previa** (M5) | *Un efecto por dirección*: duplicaría la decisión y el orden de ejecución; *leer `document.activeElement` dentro del efecto*: **demasiado tarde** (React ya desmontó el nodo y el navegador ya puso `body`). Hace falta el recuerdo previo |
| **D-05** | **Detección del origen = registro por `focusin` en `document`** (M5) | *`onFocus`/`onBlur` como props de `BottomNav`/`SidebarResponsive`*: exigiría tocar componentes fuera de alcance y añadir props (prohibido); *un listener propio de `matchMedia`*: nueva lectura de `matchMedia`, prohibida (H4); *`querySelector` del nodo enfocado en el propio efecto*: no distingue «pertenecía a la navegación que se desmonta» de «sobrevivió» |
| **D-06** | **Destino del cierre que navega = `location.state` (mecanismo (c))** (M6) | *(a) módulo/utilidad con bandera global*: una bandera que sobrevive a la navegación puede dispararse en una navegación ordinaria posterior y **romper AC-25**; exige limpieza manual. *(b) efecto de nivel de ruta que lea esa marca*: mismo riesgo más una indirección. El `state` viaja **con la entrada de historial**, así que caduca solo |
| **D-07** | **La marca la escribe `PaginaLogin` (el cierre que navega)** (M6) | *Que la escriba `AuthModal`*: la superficie **no sabe** si su `alCerrar` navega (su callback es opaco) y añadirle acceso al router sería cambiar su contrato. *Que la escriba el destino*: el destino no puede saber que hubo un cierre |
| **D-08** | **`ModalTarjeta`: dividir el efecto en «apertura» + pieza compartida** (M7) | *Mantener la restauración en la limpieza y añadir la validación*: **no** cumple H12 (el doble efecto de `StrictMode` con tarjeta activa seguiría enfocando al activador) |
| **D-09** | **Selectores M8** (reutilizar los de la 010 y el estilo de selector «enfocable» ya presente) | *Clases CSS o `data-*`*: introduciría marcado nuevo (prohibido) y sería frágil; *encapsular los controles en refs*: props/refs nuevas (prohibido) |
| **D-10** | **Las pruebas amplían; los casos vigentes no se tocan** (criterio único de RF-18) | *Reescribir las suites de foco*: lo prohíbe la spec y ocultaría regresiones. El **único** ajuste de stub previsto (local de `DashboardUserModal.test.jsx`) lo hace la **012**, no este plan |
| **D-11** | **La convivencia con el modal abierto al cruzar (AC-14) se verifica en `cierreDeModales.test.jsx`** (superficies **reales**) además del caso vigente de `DashboardLayout.test.jsx:331-343` | *Añadir un `button` dentro del mock de `DashboardUserModal` en `DashboardLayout.test.jsx`*: modificaría la fixture compartida por casos vigentes (criterio D-10). Se prefiere el sitio donde las superficies son reales |

---

## 5. Relación entre los cambios y los requisitos funcionales

| RF | Dónde se cumple | Cómo se verifica |
|---|---|---|
| **RF-01** (nada en el montaje cerrado) | Pieza (M2) + las cuatro superficies | Casos nuevos por superficie (espía `focus()` + `activeElement`) + `StrictMode` (AC-01/AC-02/AC-03) |
| **RF-02** (una devolución por cierre; ninguna mientras está cerrada) | Pieza (M2) | Casos nuevos + `StrictMode`; casos vigentes de retorno intactos (AC-04/AC-09/AC-14) |
| **RF-03** (captura incondicional al abrir) | Pieza (`useLayoutEffect`, M2) | Casos de AC-05/AC-07 con disparador ausente o desconectado |
| **RF-04** (cadena determinista con comprobación del resultado) | Pieza (M2) | Suite de la pieza con candidato `disabled`/`inert` (AC-24) + casos por superficie (AC-05/AC-06) |
| **RF-05** (nunca `body`/desconectado; respaldo por versión de vista; limitación) | Pieza + M4 + M8 | Suite de la pieza parametrizada por versión de vista y por vista (AC-06/AC-15/AC-23); `/login` sin respaldo (AC-06/AC-22) |
| **RF-06** (una sola regla para las cuatro) | M1 (pieza única) | Suite transversal ampliada: mismo escenario en las cuatro (AC-10) |
| **RF-07** (sin props nuevas ni cambios de firma) | Todo el plan | Caso vigente de firmas `DashboardLayout.test.jsx:294-312` **sin cambios** (AC-18) |
| **RF-08** (`DashboardDrawer` con paridad M4) | Tarea 3 | Casos nuevos en `DashboardDrawer.test.jsx` (AC-01/AC-07/AC-10/AC-24) |
| **RF-09** (`DashboardUserModal` con respaldo válido en ambas versiones) | Tarea 4 | Caso nuevo de respaldo móvil + casos vigentes `:239-260`, `:262-283`, `:285-309` **sin cambios** (AC-05/AC-06) |
| **RF-10** (`AuthModal` con captura y devolución) | Tarea 5 | Casos nuevos en `AuthModal.test.jsx` (AC-06/AC-10) |
| **RF-11** (`ModalTarjeta` con candidato validado y M4) | Tarea 6 (M7) | Casos nuevos (activador desconectado, montaje con tarjeta activa, `StrictMode`) + casos vigentes `ModalTarjeta.test.jsx:263-301` y `PanelTarjetas.test.jsx:138-165` **sin cambios** (AC-08/AC-11) |
| **RF-12** (móvil → pantallas grandes, dos caminos) | Tarea 7 (M5) | Caso vigente `:316-329` sin cambios (i) + caso nuevo (ii) (AC-12) |
| **RF-13** (pantallas grandes → móvil) | Tarea 7 (M5) | Caso nuevo (AC-13) |
| **RF-14** (el cruce no roba el foco) | Tarea 7 (M5) | Casos nuevos: contenido principal y modal abierto (AC-14) |
| **RF-15** (cierre que navega: foco en el destino) | Tarea 8 (M6) | `App.test.jsx` (`/login` → `/dashboard`, ambas versiones) + `AuthModal.test.jsx` (`/login` → `/`), **tras** la navegación (AC-22) |
| **RF-16** (contratos, rutas, contenido, datos y diseño intactos) | Todo el plan | `grep` + `App.test.jsx` + caso de firmas + `npm run build` (AC-18) |
| **RF-17** (sin animaciones nuevas) | No aplica (CL-13) | Inspección del diff (AC-21) |
| **RF-18** (pruebas que amplían con la trampa real) | Tareas 3-9 | Criterio «ampliar sí, reescribir no»; auditoría de `grep` (AC-16/AC-17) |
| **RF-19** (documentación y trazabilidad) | Cabeceras de los archivos tocados; relación con la 010 **dentro** de la 011 | Revisión (AC-20); la 010 intacta (AC-19) |

---

## 6. Pruebas con Vitest

### 6.1 Criterio único y trampa real

- **Ampliar sí, reescribir no** (RF-18/AC-04): se **añaden** casos; **ningún** caso vigente se
  modifica ni se debilita. El recuento **crece**. La **única** excepción prevista (stub local de
  `DashboardUserModal.test.jsx`) pertenece a la **012** (H4) y la 011 **no** toca esa suite.
- La trampa se ejerce **real** (sin `vi.mock("focus-trap-react"` —patrón de auditoría **sin** el
  paréntesis de cierre— y sin `displayCheck`), apoyada en el andamiaje de geometría ya existente
  (`vitest.setup.js:55-91`, **sin modificarlo**). Se conservan los mocks de `framer-motion` (no es la
  librería bajo prueba y evita animaciones en jsdom).
- Las suites que necesiten una versión de vista fijan su **propio** `matchMedia` coherente con
  `innerWidth` (patrón ya usado: `AuthModal.test.jsx:20-43`, `cierreDeModales.test.jsx:50-73`,
  `DashboardDrawer.test.jsx:34-54`, `ModalTarjeta.test.jsx:39-61`) y **no** dependen del stub global.

### 6.2 Qué añade cada suite

| Suite | Casos nuevos (resumen) | AC |
|---|---|---|
| `src/hooks/useRetornoDeFoco.test.js` **(nueva)** | Montaje cerrado con y sin disparador (0 `focus()`); transición abre→cierra con disparador conectado (1 llamada, `activeElement` = disparador); disparador desconectado → capturado; candidatos `null`/`body`/`disabled`/`inert` → la cadena **continúa**; candidato conectado que **no** queda enfocado → continúa; respaldo **móvil** («Menú»), **≥768px** (control lateral), **landing** (primer enfocable, excluyendo `[role="dialog"]`); **sin** candidato estable → `null` (limitación, sin `body`); sin `matchMedia` disponible no lanza | AC-05, AC-06, AC-15, AC-23, AC-24 |
| `src/hooks/useFocoEnVistaDestino.test.js` **(nueva)** | Con la marca: foco en el control estable de la versión de vista y en el primer enfocable de la landing, **una vez** por entrada de historial (re-renders posteriores no repiten); **sin** marca: **no** mueve el foco (AC-25); destino sin candidatos → limitación, sin error | AC-22, AC-23, AC-25 |
| `DashboardDrawer.test.jsx` | Montaje **cerrado** con disparador conectado → 0 `focus()` y `activeElement` sin cambios (hoy **falla**: enfoca «Menú»); `StrictMode` sin robo; disparador desconectado → respaldo «Menú»; candidato `disabled` → la cadena continúa | AC-01, AC-02, AC-05, AC-07, AC-24 |
| `DashboardUserModal.test.jsx` | Respaldo **móvil** = botón «Menú» (con `innerWidth` móvil y un `button[aria-label="Abrir menú"]` en el DOM); candidato `disabled`/`inert` → continúa; montaje cerrado sin robo | AC-05, AC-06, AC-24 |
| `AuthModal.test.jsx` | Cierre → foco de vuelta al disparador (hoy **falla**, D3); sin disparador → **primer control enfocable** de la vista (landing); cierre de la landing sin candidato → limitación; montaje cerrado sin robo | AC-06, AC-08, AC-10 |
| `ModalTarjeta.test.jsx` | Activador **desconectado** → respaldo estable (no `body`); **montaje con tarjeta activa**: el foco acaba en el contenedor y el activador **no** recibe `focus()`; `StrictMode` con tarjeta activa → 0 devoluciones; cambio de tarjeta sin cierre → 0 devoluciones | AC-05, AC-08, AC-11 |
| `DashboardLayout.test.jsx` | **Canario** del registro `focusin`; cruce **móvil → ≥768px sin menú** con el foco en la navegación inferior → control lateral (hoy **falla**); cruce **≥768px → móvil** con el foco en la navegación lateral → botón «Menú» (hoy **falla**); cruce con el foco en el contenido principal → **no** se mueve; destino sin control disponible → limitación (variante) | AC-12, AC-13, AC-14, AC-15 |
| `App.test.jsx` | `/login`: cerrar el modal (X o Esc) → tras completarse la navegación, `activeElement` es el destino de la lista ordenada (hoy **falla**); parametrizado por versión de vista (móvil y ≥768px); caso de la marca con destino `/` (foco en el primer control enfocable); navegación ordinaria sin cierre → el foco **no** se gestiona | AC-22, AC-23, AC-25 |
| `cierreDeModales.test.jsx` | Paridad de la **misma regla** en las cuatro superficies reales (disparador desconectado → respaldo, nunca `body`); ampliación del caso de convivencia «Cuenta» → al cerrar Cuenta el foco acaba en «Menú»; cruce con el modal **real** abierto → el foco **no** se roba | AC-10, AC-11, AC-14 |
| `PanelTarjetas.test.jsx` | No-regresión: los dos casos vigentes de retorno al activador (`:138-165`) siguen verdes; caso de activador desmontado (si resulta estable en jsdom) | AC-17 |

### 6.3 Pruebas que deben **fallar primero** (TDD)

Antes de la corrección, y medidas en la Tarea 1 contra el estado **post-012**: **AC-01** en el drawer
(robo de foco en el montaje cerrado), **AC-10** en `AuthModal` (sin devolución de foco), **AC-13** y
**AC-12(ii)** en el layout (cruce sin traslado), **AC-22** (`/login` deja el foco en `body`) y
**AC-24** (la cadena no recorre candidatos). Las suites **nuevas** de las dos piezas se escriben
**con** las piezas (no tienen un «rojo» previo: la pieza no existe hoy).

### 6.4 Comandos

- Por tarea: `npx vitest run <ruta>` (§ de cada tarea en `tasks.md`).
- Alcance completo de la 011 (línea base de AC-17, §10-1 de la spec):
  `npx vitest run src/components/layout/DashboardDrawer.test.jsx src/components/layout/DashboardUserModal.test.jsx src/components/layout/cierreDeModales.test.jsx src/layout/DashboardLayout.test.jsx src/components/domain/modales/AuthModal.test.jsx src/components/ModalTarjeta.test.jsx src/pages/PanelTarjetas.test.jsx src/App.test.jsx src/hooks/useRetornoDeFoco.test.js src/hooks/useFocoEnVistaDestino.test.js`
- Tarea final: `npm test` y `npm run build`.

---

## 7. Riesgos y no-regresión

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **La 012 no está implementada antes** | La 011 se mide con el entorno antiguo: `DashboardUserModal.test.jsx` mide «móvil» y su caso de respaldo lateral (`:285-309`) **no** puede quedar verde | §0.1: la Tarea 1 **comprueba** el stub local coherente antes de tocar nada y **para** si no lo está; orden 012 → 011 (H4) |
| **`focusin` no resulta estable en jsdom** | AC-12(ii)/AC-13 no verificables | Canario al inicio de la Tarea 7; si falla, se registran como revisión **no realizada** (nunca verdes) y se documenta; alternativa tolerada: `focus`/`blur` en fase de captura |
| **Generalizar la regla toca superficies hoy verdes** | Regresión en `DashboardUserModal` (M4) y `ModalTarjeta` | Pieza única con las **mismas** validaciones; casos vigentes **sin modificar**; ejecución focalizada por superficie tras cada tarea |
| **Retirar la lógica propia del drawer** | Se pierden sus dos casos vigentes de retorno (`:341-384`) | La pieza cubre los dos caminos (disparador conectado y elemento previo) **antes** de retirar nada: se ejecuta la suite tras la Tarea 3 y se comparan los recuentos |
| **Meseta `triggerRef`/respaldo son el mismo nodo en móvil** | El respaldo podría reintroducir el enfoque en el montaje cerrado (RF-08) | La guarda de transición (M2) se ejecuta antes de cualquier candidato; caso nuevo de AC-01 con `triggerRef` **conectado** |
| **Split del efecto de `ModalTarjeta`** | Se pierde el bloqueo/restauración del scroll o el foco inicial | La limpieza conserva `overflow = ""`; casos vigentes de `ModalTarjeta.test.jsx:263-301` y `PanelTarjetas.test.jsx:138-165` se ejecutan **sin cambios** |
| **La pieza consume `useBreakpoint` en cada superficie** | Dos pares de `matchMedia` por superficie abierta | Coste ya aceptado en la spec (§2.3/d); no hay lectura nueva de `matchMedia` (H4) y el hook no escribe `localStorage` salvo en `toggleSidebar`, que estas superficies no usan |
| **`StrictMode` en el destino** | La colocación podría ejecutarse dos veces en desarrollo | Guarda por `location.key` + `ref`; el aserto de las pruebas es sobre `document.activeElement` (el mismo nodo), no sobre el recuento de llamadas; se documenta como límite conocido |
| **El cruce roba el foco a quien sobrevive** | Peor usabilidad que el defecto corregido | El camino (b) exige las **tres** condiciones (recuerdo no nulo, versión distinta, nodo desconectado) y el recuerdo se **borra** al enfocar contenido, campos o `[role="dialog"]`; casos nuevos de AC-14 |
| **El respaldo público desplaza el scroll** | Mala experiencia al cerrar en la landing | El resolutor **no** usa `scrollIntoView` ni `preventScroll`; solo `.focus()` sobre controles ya presentes |
| **Cifras de la suite tomadas de `MEMORY.md`** | Conclusiones de regresión falsas (MEMORY registra 253/21, 257/22 y 348/27) | Medir la línea base **post-012** en la Tarea 1 y reportar **pass/fail/no ejecutado**, suite por suite |
| **Ediciones manuales del usuario durante la implementación** | Referencias y supuestos obsoletos | Paso 0 en cada tarea (DP-21/CL-15); lo que ya no exista se registra como «ya no aplicable» |
| **Tocar sin querer `specs/010-*/`** | Reabre una spec finalizada (prohibido por Q5) | DP-09 + AC-19: `sha256sum`/`stat` de los tres documentos antes y después + `git status --porcelain --untracked-files=all` |

**Suites de no-regresión vigiladas (004/009/010):** `DashboardDrawer.test.jsx`,
`DashboardUserModal.test.jsx`, `AuthModal.test.jsx`, `ModalTarjeta.test.jsx`,
`DashboardLayout.test.jsx`, `cierreDeModales.test.jsx`, `PanelTarjetas.test.jsx`, `App.test.jsx`,
`useBreakpoint.test.js`, `useDeslizarParaCerrar.test.js` (esta última **no** se toca: la pieza no
cambia el hook), `SidebarResponsive.test.jsx`, `SidebarNavContenido.test.jsx`,
`BottomNav.test.jsx` y `hero`/`landing` que montan `PaginaInicio`. Se comparan **contra la línea base
medida**, con atribución suite por suite.

---

## 8. Verificación final (reserva a la Tarea 10)

1. `npm test` completo contra la **línea base post-012** medida en la Tarea 1 (nunca contra las cifras
   de `MEMORY.md`): reporte **archivo por archivo**, confirmando que los criterios que hoy fallan
   (AC-01, AC-10, AC-12(ii), AC-13, AC-22, AC-24) pasan y que **ningún** recuento de la línea base
   empeora.
2. `npm run build` (verde en la línea base).
3. **AC-19**: `sha256sum` (o `stat`) de `specs/010-cierre-de-modales/{spec,plan,tasks}.md` comparado
   con la Tarea 1, + `git status --porcelain --untracked-files=all`.
4. **AC-16/AC-18**: `grep` de `vi.mock("focus-trap-react"` (sin paréntesis de cierre) ⇒ **0**;
   `displayCheck` en `src/` ⇒ **0**; `min-width` solo en `useBreakpoint.js` y en pruebas;
   `package.json` sin dependencias nuevas; sin hex nuevos en el diff.
5. **Validación visual: no aplicable** (la corrección no cambia aspecto, marcado ni movimiento; el
   foco de un control no es un cambio visual por sí mismo). Si al implementar apareciera algún efecto
   visual, se registraría como excepción y se revisaría en navegador (AC-21).
6. `MEMORY.md`: entrada con el estado **medido** (pass/fail/no ejecutado), las decisiones (M1-M8) y la
   línea base post-012, sin datos sensibles.

---

## 9. Orden de ejecución y dependencias

```
T1 (Paso 0 post-012 + limpieza del puntero antiguo `specs/011-retorno-de-foco-drawer/`)
  → T2 (pieza compartida `useRetornoDeFoco` + suite)
    → T3 (DashboardDrawer: paridad M4)      ─┐
    → T4 (DashboardUserModal: respaldo)      │  superficies
    → T5 (AuthModal: captura/devolución)     │  (orden interno libre)
    → T6 (ModalTarjeta: migración M4)       ─┘
      → T7 (DashboardLayout: cruce bidireccional + registro `focusin`)
        → T8 (cierre que navega: `PaginaLogin` + `useFocoEnVistaDestino` + destinos)
          → T9 (suite transversal, greps, cabeceras, AC-19)
            → [aviso del usuario: terminó sus ediciones manuales]
              → T10 (validación final, `npm test`, `npm run build`, `MEMORY.md`)
```

**Acoplamientos a respetar:**

- **T3-T6 dependen de T2** (la pieza debe existir y estar verde antes de tocar superficies).
- **T6 y T7 no comparten archivos**, pero T7 depende de que las superficies ya no roben foco en el
  montaje (RF-01): el hueco del cruce hacia móvil está hoy **enmascarado** por ese robo (§4.5), así que
  T7 se cierra **después** de T3-T6.
- **T8 toca `DashboardLayout.jsx`** (ya tocado por T7): va **después** para no editar el mismo archivo
  dos veces a la vez.
- **T9 depende de T3-T8**: la suite transversal monta las cuatro superficies **reales** y el layout
  real.
- **T10 depende de todo** y del aviso del usuario de que terminó sus ediciones manuales.

---

## 10. Preguntas devueltas

**Ninguna.** Los seis mecanismos que la spec dejó al plan (§2.3) se resuelven **sin props nuevas, sin
`refs` nuevas desde los consumidores, sin dependencias y sin cambios de comportamiento**: (a) pieza
compartida (M1); (b) registro por `focusin` en `document` (M5); (c) `location.state` (M6);
(d) `useBreakpoint()` dentro de la pieza (M3); (e) división del efecto de `ModalTarjeta` (M7);
(f) selectores de M8. Las dos únicas decisiones que **añaden** un archivo de producto son las dos
piezas de `src/hooks/` (§3.1): son la forma elegida para que la equivalencia observable de RF-06 y la
política de destino de RF-15 tengan **una sola** implementación, y **no** cambian ninguna firma
existente. Lo único que este plan **avisa** (sin resolver, por no ser su alcance, §0.7) es la
inconsistencia documental `AGENTS.md:38` / `doc/constitution.md:39` / `.agents/rules/rules.md:21`
frente a la plantilla real `.agents/skills/file-hearder-template.md/SKILL.md`.
