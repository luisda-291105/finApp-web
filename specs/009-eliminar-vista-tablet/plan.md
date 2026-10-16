# Plan 009 — Eliminar la versión tablet: dos versiones de vista

**Estado:** borrador
**Spec base:** `specs/009-eliminar-vista-tablet/spec.md` (aprobada por el usuario el 2026-10-16)
**Tareas:** `specs/009-eliminar-vista-tablet/tasks.md`
**Fecha:** 2026-10-16

---

## 0. Condiciones de ejecución (leer antes de tocar nada)

Este plan describe **contratos objetivo y mecanismos**, no un diff línea a línea. El repositorio
está en estado volátil (§3 de la spec) y estas condiciones son obligatorias:

1. **Paso 0 dentro de cada tarea: re-leer el código real.** Antes de editar cualquier archivo del
   alcance, leerlo con la herramienta de lectura y compararlo con lo que describe este plan. Si un
   artefacto a retirar ya no existe (o cambió de nombre), se registra como **«ya no aplicable»** en
   lugar de recrearlo (CL-10).
2. **El usuario sigue editando código a mano en paralelo.** Los cambios manuales previos **ya están
   en HEAD (commit `b61286a`)** y **no hay cambios sin commitear en `src/`** (hecho verificado el
   2026-10-16): no existe `DashboardHeader.jsx`, la sidebar navega a `top-0`, la navegación lateral
   tiene 3 enlaces y el layout no renderiza header. Aun así, el usuario seguirá editando, así que no
   hay archivo del alcance que pueda considerarse «solo nuestro»: cambios mínimos, sin reformatear,
   sin tocar líneas ajenas al objetivo, y aviso al usuario si un símbolo que este plan espera ya no
   está.
3. **Validación diferida.** La **línea base ya está medida** (Tarea 1, 2026-10-16): `npm test` →
   **4 archivos fallan / 17 pasan (21)** y **10 tests fallan / 226 pasan (236)**. Fallan
   `DashboardLayout.test.jsx` (no compila: importa `DashboardHeader`, eliminado) y 10 aserciones de
   conteo de enlaces laterales (4 vs 3) en `DashboardDrawer.test.jsx` (5),
   `SidebarNavContenido.test.jsx` (2) y `SidebarResponsive.test.jsx` (3). Esa línea es la referencia
   para atribuir fallos. Al cerrar cada tarea se ejecuta la prueba relevante (`npx vitest run <ruta>`)
   y lo que no se pueda verificar todavía se marca como **«pendiente de la validación diferida»**,
   sin duplicar registros. **No se declara verde ninguna suite que la línea base deje en rojo**: se
   reporta pass/fail/«no ejecutado». AC-17 (rutas) **es ejecutable ya y pasa** en la línea base, y no
   se aparca. Los 10 fallos de aserciones **se corrigen dentro de este plan** (DP-06), sin tocar el
   código fuente.
4. **Cabeceras JSDoc.** `AGENTS.md` cita `.agents/response-rules.md` y
   `.agents/file-header-template.md`, y esas rutas **no existen**; las reales están bajo
   `.agents/skills/...` (la plantilla, además, con el typo `file-hearder-template.md`). Si la
   implementación necesita seguir esa plantilla, **avisar de la inconsistencia antes de seguirla**
   en vez de asumir. Este plan no crea archivos nuevos, así que solo aplica a la actualización de
   cabeceras existentes (Tarea 6).

---

## 1. Resumen de cambios

| Archivo | Cambio principal | RF |
|---|---|---|
| `src/hooks/useBreakpoint.js` | Dos versiones de vista, contrato de 4 props sin `isTablet`, partición complementaria, estados por defecto por banda y contrato de «preferencia válida» | RF-01, RF-02, RF-06, RF-07, RF-11 |
| `src/hooks/useBreakpoint.test.js` | Reescribir casos: dos bandas, 4 props, fraccionarios, defaults por banda, preferencia válida/no válida, no materialización | AC-14, AC-01, AC-04, AC-06..AC-09 |
| `src/components/layout/DashboardDrawer.jsx` | Rama móvil **incondicional**: se retira la rama no-móvil y la prop `esMobile`; se retira el código que queda colgando de esa rama | RF-04, RF-15 |
| `src/components/layout/DashboardDrawer.test.jsx` | Retirar todos los casos `esMobile=false` (composición tablet) **y ajustar los conteos: enlaces 4→3 y enfocables 5→4**, sin tocar el componente (DP-06). Arregla 5 fallos de la línea base | AC-13, AC-16 |
| `src/layout/DashboardLayout.jsx` | Composición de dos versiones, espacio de la navegación reservado **desde 768px**, retirada del estado ligado a tablet y del padding superior sobrante, wiring del drawer sin `esMobile` | RF-03, RF-04, RF-05, RF-08, RF-09, RF-15 |
| `src/layout/DashboardLayout.test.jsx` | Reescritura completa (hoy no compila: importa `../components/layout/DashboardHeader`, módulo eliminado) | AC-01..AC-11 |
| `src/components/layout/SidebarResponsive.jsx` + test | Sin cambios de firma ni de fuente; se verifica su ámbito (toda la banda ≥768px), se actualiza la cabecera JSDoc y **su test ajusta los conteos de enlaces de 4 a 3** (3 fallos de la línea base) | RF-05, RF-12, RF-15 |
| `src/components/layout/BottomNav.jsx` + test | Sin cambios funcionales; se verifica su ámbito (exclusivo de móvil, ahora también 640–767px) y cabecera. **Su test mantiene 4 enlaces + «Menú»** (sigue siendo correcto) | RF-08 |
| `src/components/layout/SidebarNavContenido.jsx` | **Solo cabecera `@usadoPor`**: sin tocar enlaces, recuento (3) ni nombre accesible en colapsado. **Su test sí ajusta el recuento de 4 a 3** (2 fallos de la línea base) | RF-12, RF-15 |
| `MEMORY.md` | Registro de estado y decisiones **tras** la validación diferida | — |

---

## 2. Arquitectura objetivo

### 2.1 Composición por versión de vista

```
DashboardLayout
├─ [esDesktop]  SidebarResponsive             → navegación lateral permanente (colapsada | expandida)
│                 └─ SidebarNavContenido      → 3 enlaces vigentes + avatar (sin cambios)
├─ Área principal (siempre)
│   └─ div  margen: esDesktop ? (colapsada ? "ml-[72px]" : "ml-64") : "ml-0"
│        └─ Container > main > Outlet
├─ [isMobile]   BottomNav                     → 4 enlaces + «Menú» (menuTriggerRef)
├─ [isMobile]   DashboardDrawer               → menú superpuesto (portal + backdrop + focus trap)
└─ DashboardUserModal                         → global, portal, sin cambios
```

- **Desaparece** la rama/estado de tablet: el segundo bloque `isTablet && <SidebarResponsive/>`,
  el estado `drawerAbierto` y los efectos que lo cerraban (RF-04, RF-15).
- **No existe** `DashboardHeader` (ya fue retirado a mano): el layout no lo renderiza ni lo importa,
  y el test que lo importaba se reescribe (Tarea 4).
- La banda 768–1023px entra por la rama `esDesktop` (RF-03) con `sidebarColapsada = true` por
  defecto (RF-06).

### 2.2 Contrato de la lógica de versión de vista (4 props)

| Prop | Origen | Regla |
|---|---|---|
| `isDesktop` | media query `(min-width: 768px)` | **única fuente de verdad** de la versión de vista |
| `isMobile` | negación de la anterior | `!isDesktop` ⇒ partición complementaria por construcción |
| `sidebarColapsada` | preferencia válida o estado por defecto de banda | `preferencia ?? (!anchoGrande)` |
| `toggleSidebar` | elección del usuario | alterna y **persiste solo entonces** |

`isTablet` **no existe** (RF-11). El umbral de 1024px no aparece como versión de vista: solo como
`anchoGrande` para el estado por defecto (RF-03, RF-06, AC-15).

### 2.3 Mecanismos que fija este plan

**M1 — Partición complementaria (RF-02, RF-11, AC-14).**
Una **única** media query de versión de vista, `(min-width: 768px)`:

```js
const esDesktop = mq768.matches;      // única fuente de verdad
const isMobile = !esDesktop;          // complementaria por construcción
```

- Estado inicial (cliente): `window.innerWidth >= 768`.
- Sin `window` (SSR / primer render sin medición): `isDesktop = true` (CL-05, sin cambios).
- Se eliminan `mqMobile`, `mqTablet` y el flag `isTablet`. Desaparece así el hueco actual en anchos
  fraccionarios (p. ej. 767,5px puede dejar las tres consultas en `false`).

**M2 — Estado por defecto por banda sin materializarlo como preferencia (RF-06, RF-07, AC-06..AC-09).**

- Estado interno del hook: `preferencia` (`boolean | null`) y `anchoGrande` (media query propia
  `(min-width: 1024px)`, con su `change` listener).
- Derivación: `sidebarColapsada = preferencia !== null ? preferencia : !anchoGrande`
  (colapsada en 768–1023px; expandida en ≥1024px).
- Lectura inicial: `JSON.parse(localStorage.getItem("sidebarCollapsed"))` dentro de `try/catch`;
  **válida ⇔ `typeof valor === "boolean"`**. `null`, otro tipo o error ⇒ `preferencia = null`
  (hoy, con `?? false`, `null` se materializa como «expandida»).
- `toggleSidebar`: `const siguiente = !sidebarColapsada; setPreferencia(siguiente); localStorage.setItem("sidebarCollapsed", JSON.stringify(siguiente));`
- **Se elimina el `useEffect` que hoy persiste el estado en cada cambio**: es exactamente lo que
  materializa un estado por defecto que el usuario no eligió (rompe CL-01 y AC-08).
- Al cruzar 1024px con `preferencia === null`, el estado por defecto de la banda de destino se
  aplica solo (AC-07); con preferencia válida, manda la preferencia en cualquier banda (AC-06).
- En móvil el hook no se usa para composición y la preferencia **no se toca ni se sobrescribe**
  (RF-08).

**M3 — Espacio de la navegación reservado desde 768px (RF-05, AC-03).**

- El wrapper del área principal pasa de clases con prefijo `lg:` (1024px) a clases derivadas del
  estado JS, **sin prefijo de breakpoint**:
  `esDesktop ? (sidebarColapsada ? "ml-[72px]" : "ml-64") : "ml-0"`.
- Motivo: hoy `lg:ml-*` no reserva nada en 768–1023px (el fallo que se quiere cerrar) y añadir
  `md:ml-*` duplicaría la frontera en CSS frente a la del hook (CL-09/AC-15). Con una sola fuente
  de verdad no hay divergencia posible.
- `pb-20` (espacio de la navegación inferior) **se conserva tal cual**: acotarlo a móvil no está
  autorizado por la spec (ver §9).

**M4 — Traslado de foco al cruzar el corte (RF-09, AC-10).**

- Al pasar de móvil a pantallas grandes con el menú abierto, el layout cierra `mobileMenuAbierto`
  (efecto ya existente sobre `isMobile`) y **mueve el foco a un elemento estable de la nueva
  versión**: el control de la navegación lateral, localizado por un selector estable
  (`aside[role="navigation"] button`), que es el toggle que ya existe.
- Hoy el foco se perdería: `triggerRef` es el ítem «Menú» del BottomNav, que se desmonta al salir
  de móvil, y el retorno de foco del drawer no se ejecuta en un desmontaje.
- No se añaden props ni `forwardRef` a la sidebar ni al drawer: §6 de la spec mantiene su contrato
  (`abierto`, `alCerrar`, `children`, `triggerRef`) y no autoriza cambios de firma. Se usa un
  selector de DOM sobre el control ya existente.
- Verificación: test si resulta estable en jsdom; si no, **revisión manual registrada** (la propia
  RF-09 lo contempla).

**M5 — DP-06: ajuste de aserciones (4→3 enlaces, 5→4 focos), sin tocar la fuente.**

- **Alcance:** solo pruebas. El código de `SidebarNavContenido.jsx` conserva sus **3** enlaces y el
  enlace directo a Configuración **no** se restituye en el sidebar.
- **Vía de acceso a Configuración en pantallas grandes:** el **modal/banner del perfil**
  (`DashboardUserModal`), que ya navega a `/dashboard/configuracion` y **no se modifica**.
- **Aserciones a corregir (línea base: 10 fallos):**
  | Archivo | Aserción hoy | Objetivo |
  |---|---|---|
  | `SidebarNavContenido.test.jsx` | 4 enlaces (`getAllByRole("link")`) y 4 iconos | **3** enlaces y 3 iconos |
  | `SidebarResponsive.test.jsx` | 4 enlaces y 4 iconos de navegación | **3** enlaces y 3 iconos |
  | `DashboardDrawer.test.jsx` | 4 enlaces dentro del panel; 5 elementos enfocables | **3** enlaces; **4** enfocables (3 enlaces + botón de avatar) |
- **Lo que NO cambia:** `BottomNav` mantiene **4 enlaces + «Menú»** (correcto); no se toca la fuente
  de ninguna navegación; no se «corrige» el recuento de la cabecera JSDoc de `SidebarNavContenido`.
- **Criterio de cierre:** las tres suites quedan **verdes** en la ejecución de su tarea (3 y 5), sin
  tocar el código de producción.

---

## 3. Archivos afectados y límites

### 3.1 Se modifican (solo estos)

Los de la tabla de §1. Ninguno cambia de ruta ni de nombre.

### 3.2 NO se tocan (exenciones explícitas)

- `src/styles/index.css` y la variable `--header-height` (pasada de limpieza posterior).
- `Header.jsx` y `Footer.jsx` (landing), `Hero`, `StatsBar`, `Features`, `HowItWorks`,
  `CtaSection`, `PaginaInicio`.
- `PanelTarjetas`, `AcordeonTarjetas`, `GridTarjetas` y sus pruebas.
- `SidebarNavContenido`: enlaces vigentes (3), recuento en su cabecera JSDoc (dice «4 enlaces»: **no
  se corrige**), nombre accesible de los enlaces en estado colapsado (deuda preexistente, RF-12),
  `my-`, `text-white`, import `Settings`. **Sus pruebas sí se ajustan** en el conteo (DP-06, M5):
  «no tocar la fuente» nunca significa «no tocar la aserción desfasada».
- `DashboardUserModal.jsx` (modal/banner del perfil): es la vía de acceso a Configuración en
  pantallas grandes y **no se modifica**.
- `src/App.jsx`, `src/App.test.jsx`, `src/config/*`, `vitest.setup.js`.
- `specs/008-*` (ni siquiera para anotar su obsolescencia: se hará cuando se aborde esa spec).

---

## 4. Alternativas descartadas

| Alternativa | Por qué se descarta |
|---|---|
| Corte en 640px (mantener la banda 640–767px como tablet) | DP-02 revisada: esa banda debe ser móvil, como el usuario pidió |
| Dos media queries independientes (`max-width: 767px` + `min-width: 768px`) | Deja la complementariedad a merced de los solapamientos/huecos con anchos fraccionarios y zoom; una query + negación la garantiza por construcción (RF-11) |
| Mantener `isTablet` como alias interno | Contrato aprobado de 4 props; un alias es una categoría tablet observable (RF-01/RF-11) |
| Guardar el estado por defecto de banda en `localStorage` | Materializa una preferencia no elegida y rompe CL-01/AC-08 |
| Mantener el `useEffect` que persiste el estado en cada cambio | Misma razón: persiste defaults en el primer render |
| Calcular el default de banda solo en el primer render | Rompería AC-07 (cargar en 1200px y pasar a 800px debe mostrar colapsada sin intervención) |
| Reservar el margen con clases `md:ml-64` / `md:ml-[72px]` | Duplica la frontera de 768px en CSS y puede divergir del estado JS (CL-09/AC-15) |
| Mantener `pt-[var(--header-height)]` en `main` y la altura restada en el drawer | El header ya no existe: RF-15 los declara artefactos a retirar |
| Pedir `forwardRef`/prop nueva a la sidebar para el foco de AC-10 | Cambio de contrato no autorizado por §6 de la spec |
| Rehacer el panel duplicado y la animación de salida del drawer | Exención explícita de RF-15; solo se retira el código que queda **colgando** de la rama no-móvil |
| Aprovechar para limpiar `index.css`, `my-`, `text-white`, `Settings` o el `usuario` sin uso del layout | Fuera de alcance: RF-15 lista expresamente «qué NO se toca» |
| Aliviar el «doble render» de tarjetas de la sección `tarjetas` | Fuera de alcance (§2 de la spec) |
| Corregir el desfase 4→3 **tocando la fuente** (restituir Configuración en el sidebar) | Contradice la decisión del usuario (DP-06): se ajustan las aserciones, no la navegación. Configuración se alcanza desde el modal de perfil |
| Rehacer por completo las tres suites solo por el conteo | Cambio desproporcionado: basta corregir las aserciones de enlaces/focos indicadas en M5 |

---

## 5. Relación entre cambios y requisitos

| RF | Cambio que lo implementa | AC |
|---|---|---|
| RF-01 | Hook con dos versiones; sin `isTablet`; sin rama de tablet en el layout | AC-14 |
| RF-02 | Una sola media query de 768px + negación | AC-03, AC-14 |
| RF-03 | Banda 768–1023px cae en `esDesktop` con default colapsado | AC-01, AC-03 |
| RF-04 | Retirada del bloque `isTablet`, de `drawerAbierto` y de su rama en el drawer | AC-16 |
| RF-05 | Margen sin prefijo `lg:` desde el estado `esDesktop` (≥768px) | AC-03 (clases) + AC-19 (visual) |
| RF-06 | `preferencia ?? !anchoGrande` con query de 1024px | AC-01, AC-03, AC-04, AC-07 |
| RF-07 | Escritura solo en `toggleSidebar`; validez ⇔ booleano; una sola clave | AC-05, AC-06, AC-08, AC-09 |
| RF-08 | Ramas de móvil intactas (BottomNav + drawer) y preferencia preservada | AC-02 |
| RF-09 | Efecto de recomposición + M4 (traslado de foco) | AC-10, AC-11 |
| RF-10 | Navegación visible en ambas versiones (sin enlaces nuevos); Configuración alcanzable desde el modal de perfil en pantallas grandes | AC-12 |
| RF-11 | Contrato de 4 props y partición complementaria | AC-14 |
| RF-12 | Sin cambios de accesibilidad donde ya existe; deuda colapsada fuera de alcance; conteos de focos de las pruebas ajustados a 4 (DP-06) | AC-12, AC-13 |
| RF-13 | Sin tocar rutas ni páginas | AC-17 |
| RF-14 | Sin superficies nuevas (en pantallas grandes: sidebar + modal; sin blobs) | AC-19 |
| RF-15 | Limpieza acotada con exenciones; cabeceras actualizadas; aserciones de enlaces alineadas con la fuente (3) | AC-12, AC-13, AC-16 |

---

## 6. Pruebas con Vitest (enfoque)

**Convenciones**: `*.test.js` para hooks, `*.test.jsx` para componentes; `MemoryRouter` para rutas;
pruebas junto al código (reglas del repo). Comando por tarea: `npx vitest run <ruta>`.

**Mocking de `matchMedia`.** Tras M1, el hook consulta dos queries: `(min-width: 768px)` (versión de
vista) y `(min-width: 1024px)` (estado por defecto). Las pruebas deben mapear ambas y fijar
`matches` de forma **coherente** (p. ej. 800px ⇒ 768:true, 1024:false; 375px ⇒ 768:false). El mock
global de `vitest.setup.js` devuelve `matches: false` para todo: con la nueva implementación eso
significa **móvil**, así que hay que revisar que las suites que renderizan el layout/`App` de verdad
no dependan del comportamiento anterior (tres queries en `false` ⇒ ninguna versión).

**`src/hooks/useBreakpoint.test.js`** (reescritura):
- Contrato: exactamente 4 claves `isMobile, isDesktop, sidebarColapsada, toggleSidebar`; sin
  `isTablet`.
- Partición complementaria en 767, 767,5, 768, 800, 1023, 1024, 1440: exactamente uno activo.
- Default por banda sin preferencia: 800px ⇒ colapsada; 1200px ⇒ expandida.
- Preferencia válida (`"true"`/`"false"`) manda en ambas bandas y se restaura.
- Sin preferencia real: `null`, `"null"`, `"1"`, `"invalid-json"` ⇒ default de banda (`null` **no**
  equivale a expandida).
- `toggleSidebar` alterna **y** escribe en `localStorage`; el montaje **no** escribe (no
  materializa defaults).
- Sin preferencia + cruce 1200px→800px por `change` ⇒ colapsada sin escribir nada.
- Cleanup de listeners (ambas queries) y patrón SSR sin `window`.

**`src/layout/DashboardLayout.test.jsx`** (reescritura completa; hoy no compila):
- Mock de `useBreakpoint` con 4 props (sin `isTablet`) y mocks de hijos sin `DashboardHeader`.
- 768px/800px/1023px: `SidebarResponsive` presente, `colapsada=true`, sin composición tablet, sin
  `BottomNav`, margen `ml-[72px]`, `main` **sin** `pt-[var(--header-height)]`.
- 1024px/1440px: `SidebarResponsive` `colapsada=false`, margen `ml-64`.
- 375px/700px/767px: `BottomNav` + drawer de menú, sin navegación lateral permanente, margen
  `ml-0`; el drawer recibe `abierto/alCerrar/children/triggerRef` y **no** `esMobile`.
- `DashboardUserModal` global en todas las versiones; `Outlet` presente.
- Transiciones: móvil→pantallas grandes cierra el menú y traslada el foco (si el test es estable;
  si no, se registra para la revisión manual de AC-10); pantallas grandes→móvil con modal abierto
  no altera el modal ni la preferencia.

**`src/components/layout/DashboardDrawer.test.jsx`**: se retiran los casos de la composición tablet
(`esMobile=false`); se conservan y refuerzan los de la rama móvil (portal, backdrop, ESC, click en
backdrop, focus trap, `role="dialog"`, `aria-label="Menú de navegación"`, retorno de foco a
`triggerRef`), sin la prop `esMobile`; y se corrigen los conteos **4→3 enlaces** y **5→4 elementos
enfocables** (3 enlaces + botón de avatar), sin tocar la fuente (M5/DP-06).

**Pruebas de los demás componentes del alcance**: `SidebarNavContenido.test.jsx` (2 fallos) y
`SidebarResponsive.test.jsx` (3 fallos) se ajustan **solo** en los conteos de enlaces/iconos de
navegación lateral (4→3), sin cambiar firmas, enlaces ni el componente (M5/DP-06). `BottomNav`
mantiene 4 enlaces + «Menú» y `DashboardUserModal` no se toca (es la vía de acceso a Configuración
en pantallas grandes). Se ajusta cualquier otra aserción que cuente 4 enlaces laterales.

**`src/App.test.jsx`**: regresión de rutas (AC-17), ejecutable desde ya, **no** forma parte de la
validación diferida.

**Línea base esperada (medida el 2026-10-16):** 4 archivos fallan / 17 pasan (21) y 10 tests fallan /
226 pasan (236). Al cerrar las tareas 2–5, el archivo que no compila y los 10 fallos de aserciones
(4→3 enlaces, 5→4 focos) quedan resueltos **solo con cambios en las pruebas**; la expectativa es
**21 archivos / 236 tests en verde**, siempre que no aparezcan fallos ajenos. Si algo no sube a
verde, se reporta pass/fail/no ejecutado y se atribuye contra la línea base.

**Límite conocido**: jsdom no calcula layout, así que «sin solape» / «sin desplazamiento horizontal»
no son automatizables: se comprueban por estructura y clases en las pruebas y por revisión visual en
el navegador (AC-19).

---

## 7. Validación

| Fase | Qué se ejecuta | Cuándo |
|---|---|---|
| **Paso 0 (línea base)** | ✅ **Ejecutado (Tarea 1, 2026-10-16):** `npm test` → **4 archivos fallan / 17 pasan (21)**; **10 tests fallan / 226 pasan (236)**. Fallan `DashboardLayout.test.jsx` (no compila) y las aserciones de conteo de enlaces de `DashboardDrawer.test.jsx` (5), `SidebarNavContenido.test.jsx` (2) y `SidebarResponsive.test.jsx` (3). Sin cambios sin commitear (`b61286a`) | Hecho, antes de tocar código |
| **Por tarea** | `npx vitest run <ruta relevante>`; lo no verificable se marca «pendiente de la validación diferida». Las suites ajustadas por DP-06 (tareas 3 y 5) **deben quedar verdes** al cerrar su tarea | Al cerrar cada tarea |
| **Ejecutable antes** | `src/App.test.jsx` (AC-17, pasa en la línea base) y auditoría de referencias/umbrales (AC-15) | Tarea 7, sin esperar al usuario |
| **Diferida (AC-16, AC-18, AC-19)** | Escaneo del diff, `npm test`, `npm run build` y revisión visual en 768, 800, 1023, 1024, 1440, móvil y móvil horizontal | Tras el aviso del usuario de que terminó (Tarea 8) |
| **Cierre** | `MEMORY.md` con estado y decisiones, sin declarar verde nada no medido | Tarea 9 |

**Regla de reporte**: cada resultado se informa como **pass / fail / no ejecutado**, siempre contra la
línea base. Ninguna suite en rojo hoy se declara verde por esta spec.

---

## 8. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El usuario ya cambió/renombró artefactos que este plan espera (p. ej. `esMobile` ya no existe) | Trabajo perdido o ediciones sobre líneas ajenas | Paso 0 por tarea; CL-10: «ya no aplicable» en lugar de recrear |
| Conflicto de ediciones simultáneas en los mismos archivos | Diffs rotos, código perdido | Cambios mínimos y localizados; re-leer justo antes de editar; no reformatear; informar al usuario del archivo tocado |
| Tareas 3 y 4 acopladas (el layout pasa `esMobile` al drawer) | Estado intermedio que no compila | Orden fijo: drawer primero con la prop ignorada de forma tolerante, layout después; o ambas en la misma sesión de trabajo sin cerrar tarea intermedia |
| El retorno de foco al cruzar el corte no es estable en jsdom | AC-10 sin prueba automatizada | Implementar con selector estable y, si el test no es fiable, registrarlo como revisión manual (RF-09 lo contempla) |
| Las suites que renderizan layout/App de verdad cambian de composición (mock global `matches:false` ⇒ ahora móvil) | Fallos aparentes de regresión | Revisar esas suites en la Tarea 1 y atribuirlas contra la línea base |
| Atribuir a esta spec fallos preexistentes (ya medidos: 1 archivo que no compila + 10 aserciones de conteo) | Conclusiones falsas sobre regresiones | Línea base medida (236/21); los 10 fallos de aserciones se corrigen en tareas 3 y 5 sin tocar la fuente; reporte pass/fail/no ejecutado |
| Confundir «no tocar la fuente» con «no tocar la aserción desfasada» | O bien se modifica la navegación (no aprobado) o bien la suite queda en rojo | M5/DP-06 fija qué se corrige (aserciones) y qué no (código); criterio de cierre: suites verdes |
| Que la limpieza (RF-15) se extienda a `index.css`, `my-`, `text-white`, `Settings` o a refactorizar el drawer | Cambios fuera de alcance y conflictos | Lista explícita de «qué NO se toca» (§3.2) y CL-10 |
| Cerrar la tarea 6 «corrigiendo» el recuento de enlaces de una cabecera | Contradice una decisión del usuario | RF-15: el recuento vigente no se corrige; se registra como observación |
| Seguir la convención de cabeceras citada en `AGENTS.md` sin verificarla | Cabeceras creadas bajo rutas inexistentes | Avisar de la inconsistencia antes de seguirla (§0.4) |
| La unificación se lee como permiso para añadir capas de vidrio | Se superan los límites Fluid Glass | RF-14 y AC-19: mismas superficies que hoy |

---

## 9. Observaciones (no bloquean la implementación)

1. **`pb-20` se conserva incondicional** en `main`, aunque solo sea necesario con navegación
   inferior: acotarlo a móvil sería un cambio de comportamiento no autorizado por la spec. Si el
   usuario lo quiere, requiere su propio requisito.
2. **M4 (foco en el cruce del corte)** usa un selector de DOM sobre el toggle ya existente. Si en la
   implementación se prefiere un mecanismo por prop/ref, es un cambio de contrato de la sidebar que
   §6 no autoriza: habría que consultarlo antes.
3. **`usuario = getUsuarioMock()` sin uso en el layout** (y su import) queda exento por RF-15: no se
   retira.
4. **Cabecera de `SidebarNavContenido.jsx`** dice «4 enlaces» y hay 3: se registra como observación y
   **no** se «corrige» dentro de esta spec (lo que sí se ajusta es la **prueba**, DP-06/M5).
5. **Vía de acceso a Configuración (pantallas grandes):** el **modal/banner del perfil**
   (`DashboardUserModal`), que ya navega a `/dashboard/configuracion` y no se modifica. No se
   restituye el enlace en el sidebar.
6. **`specs/008-*`**: su obsolescencia ya está declarada en §3 de la spec 009; anotarla en los
   documentos de la 008 queda para cuando se aborde esa spec.
7. **`MEMORY.md`** afirma hoy `273/273 en 22 archivos`, en contradicción con lo medido (**236/21**):
   no se toca hasta la Tarea 9 y solo con lo medido.
