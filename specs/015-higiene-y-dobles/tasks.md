# Tareas 015 — Higiene de código, dobles de prueba y documentación

**Spec:** `specs/015-higiene-y-dobles/spec.md` (aprobada 2026-10-18) · **Plan:** `specs/015-higiene-y-dobles/plan.md`
**Orden:** T1 → T10. Cada tarea deja la suite **en verde** (o con el contador de avisos a 0) y es
verificable por separado.
**Reglas de ejecución:** leer `AGENTS.md` y `.agents/rules/rules.md` antes de empezar; **re-verificar
cada `archivo:línea`** antes de editar (el usuario edita a mano; CL-01); no tocar `src/` fuera de lo
que dice la tarea; sin dependencias, sin lint, sin hexadecimales, nombres en español; **sin staging
ni commit**.
**Línea base medida en T1 (2026-10-18):** 478/478 en 31 archivos, build verde y **JS 384,24 kB**.
La cifra 455/30 de la spec es anterior a la 013. **El tamaño del CSS no es criterio de aceptación**
(Tailwind escanea Markdown; plan §9.6).
**Avisos de consola (AC-04):** se mide con la salida de **una ejecución por suite**:
`npx vitest run <suite> 2>&1 | grep -cE "does not recognize|for a non-boolean attribute|Invalid value for prop|Invalid prop"`.
Es una **medición**, no una aserción: se declara como tal (RF-09).

---

## T1 — Línea base y sondeo de referencias

**Etapa 1 · Depende de:** nada. **Estado: ejecutada el 2026-10-18** (resultados medidos abajo).
**Alcance:** medir el punto de partida y confirmar que las referencias de la spec siguen vigentes.
**Archivos:** ninguno (solo lectura y ejecución).

**Pasos**

1. `npm test` → **medido: 478/478 en 31 archivos, 0 fallos**.
2. `npm run build` → **verde**; **JS 384,24 kB** como referencia estable. El tamaño del CSS se anota
   pero **no** es criterio de aceptación (plan §9.6: varía con los Markdown que escanea Tailwind).
3. Ejecutar **una vez cada** suite y anotar `Tests N passed` y el **contador de avisos**:

   | Suite | Avisos medidos |
   |---|---|
   | `src/components/domain/dashboard/MiTarjetaVirtual.test.jsx` | **3** |
   | `src/components/domain/dashboard/AcordeonTarjetas.test.jsx` | **3** |
   | `src/components/ModalTarjeta.test.jsx` | **3** |
   | `src/components/layout/cierreDeModales.test.jsx` | **3** |
   | `src/components/layout/DashboardDrawer.test.jsx` | **0** |
   | `src/components/layout/DashboardUserModal.test.jsx` | **0** |
   | `src/pages/PanelTarjetas.test.jsx` | **3** |

   Patrón de los tres avisos: `initial={false}` + `whileHover` + `whileTap`. Las cinco suites con
   avisos montan `MiTarjetaVirtual` de forma directa o transitiva; las dos sin avisos no lo montan.
   **Total medido: 15.** También se miden (sin avisos)
   `SidebarNavContenido.test.jsx`, `BottomNav.test.jsx`, `SidebarResponsive.test.jsx`,
   `ui/Card.test.jsx` y `GridTarjetas.test.jsx`, y su `Tests N passed`.
4. Re-verificar con `read`/`grep`:
   - `SidebarNavContenido.jsx:2, :4, :11, :18, :29-34, :38, :64`
   - `BottomNav.jsx:15` (y confirmar que `:2` dice «4 controles», que es **correcto**)
   - `SidebarResponsive.jsx:4`
   - `GridTarjetas.jsx:24-25, :28`
   - `Card.jsx:1-9`
   - `PanelTarjetas.jsx:3-4`
   - Los siete `vi.mock("framer-motion")` y su forma (parcial/completo, `forwardRef`,
     `AnimatePresence`, `useReducedMotion`).
5. `grep -rnE '(^|["[:space:]])my-(["[:space:]]|$)' src --include='*.jsx'` (esperado: `:64`),
   `grep -n "Settings" src/components/layout/SidebarNavContenido.jsx src/components/layout/BottomNav.jsx`
   (esperado: `:11` y `:15`), `grep -rnE "4 enlaces|4 NavLink|enlaces fijos \(4\)" src` (esperado: 5).
6. Registrar lo que ya no exista como «ya no aplicable» (CL-01) y **no** recrearlo.

**Cubre:** CL-01, DP-07, AC-08 (punto de partida).
**Prueba:** no hay cambio de código; el «verde» es la línea base registrada.
**Hecho cuando:** existe una tabla con **casos y avisos por suite** y el estado (existe / ya no
aplicable) de **cada** referencia, sin haber editado ningún archivo.

---

## T2 — Higiene: clase fantasma e importaciones sin uso

**Etapa 2 · Depende de:** T1. **Estado: ejecutada el 2026-10-18** (rojo-antes/verde-después;
`npm test` 478/478 en 31 archivos; build verde, JS 384,23 kB).
**Alcance:** retirar `my-` y las dos importaciones de `Settings`, sin sustituirlos por nada.
**Archivos y líneas**

| Archivo | Cambio |
|---|---|
| `src/components/layout/SidebarNavContenido.jsx:64` | quitar el token `my-` de la cadena de clases (queda `flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors hover:bg-emerald-primary/5`) |
| `src/components/layout/SidebarNavContenido.jsx:11` | `import { Home, Receipt, CreditCard } from "lucide-react";` |
| `src/components/layout/BottomNav.jsx:15` | eliminar la línea `Settings,` del bloque de iconos |
| `src/components/layout/SidebarNavContenido.test.jsx:91-96` | añadir, en el caso del avatar: `expect(avatarButton.classList.contains("my-")).toBe(false);` |

**No se toca:** `my-3` del separador (`:58`, asertado en `:88`), el uso legítimo de `Settings` en
`DashboardUserModal.jsx:20/:134`, el orden de los demás iconos ni el resto de las importaciones.

**Cubre:** RF-01, RF-02 · AC-01, AC-02 · CL-01 · DP-01 · P7.
**Prueba (roja-antes/verde-después):** la aserción nueva **falla antes** (`classList.contains("my-")`
es `true`) y pasa después. Las suites ya estaban verdes y siguen verdes.
**Comandos:**
`npx vitest run src/components/layout/SidebarNavContenido.test.jsx src/components/layout/BottomNav.test.jsx`
y
`grep -n "Settings" src/components/layout/SidebarNavContenido.jsx src/components/layout/BottomNav.jsx`
(esperado: sin coincidencias) + `grep -n "Settings" src/components/layout/DashboardUserModal.jsx`
(esperado: `:20` y `:134`).
**Inspección:** `grep -rnE '(^|["[:space:]])my-(["[:space:]]|$)' src --include='*.jsx'` → sin
coincidencias (no confunde `my-3`).
**Hecho cuando:** no queda ningún token `my-`, `Settings` solo aparece en `DashboardUserModal`, la
aserción nueva pasa, las dos suites están verdes y el diff no añade clases ni imports.

---

## T3 — Recuentos documentados: cuatro → tres

**Etapa 2 · Depende de:** T1. **Estado: ejecutada el 2026-10-18** (solo documentación; `npm test`
478/478 en 31 archivos; build verde, JS 384,23 kB; `grep` sin coincidencias del recuento antiguo).
**Alcance:** corregir la documentación de cabeceras y comentarios; **no** cambia el conjunto de
enlaces ni las rutas.
**Archivos y líneas**

| Archivo | Antes | Después |
|---|---|---|
| `SidebarNavContenido.jsx:2` | «4 enlaces + avatar → modal» | «3 enlaces + avatar → modal» |
| `SidebarNavContenido.jsx:4` | «4 NavLink fijos + avatar via getUsuarioMock()» | «3 NavLink fijos + avatar via getUsuarioMock()» |
| `SidebarNavContenido.jsx:18` | «4 enlaces con icono + etiqueta…» | «3 enlaces con icono + etiqueta…» |
| `SidebarNavContenido.jsx:38` | `{/* 4 enlaces de navegación */}` | `{/* 3 enlaces de navegación */}` |
| `SidebarResponsive.jsx:4` | «enlaces fijos (4), usuario desde getUsuarioMock(), logout action» | «enlaces fijos (3); avatar de usuario desde el contenido compartido; el cierre de sesión vive en DashboardUserModal» |

**No se toca:** `BottomNav.jsx:2` («4 controles: 3 ítems + Menú») es correcto; el array
`SidebarNavContenido.jsx:29-34` (tres entradas) y las rutas.

**Cubre:** RF-03 · AC-03 · CL-01 · DP-01.
**Prueba:** las suites de navegación siguen verdes; el conjunto ya está fijado por
`SidebarNavContenido.test.jsx:32-37` (`getAllByRole("link")` + `toHaveLength(3)`). No se añaden
casos.
**Comandos:**
`npx vitest run src/components/layout/SidebarNavContenido.test.jsx src/components/layout/SidebarResponsive.test.jsx src/components/layout/BottomNav.test.jsx`
y `grep -rnE "4 enlaces|4 NavLink|enlaces fijos \(4\)" src` (esperado: sin coincidencias).
**Inspección:** `grep -c "ruta:" src/components/layout/SidebarNavContenido.jsx` → `3`.
**Hecho cuando:** las cinco líneas dicen tres, el conjunto y las rutas no cambian, no hay ninguna
coincidencia del recuento antiguo y las tres suites están verdes.

---

## T4 — Dobles de animación (1–3): suites no compartidas

**Etapa 3 · Depende de:** T1. **Estado: ejecutada el 2026-10-18** (3 → 0 avisos en las tres suites,
mismo recuento de casos: 17, 9 y 23; `npm test` 478/478 en 31 archivos; build verde, JS 384,23 kB).
**Alcance:** aplicar el filtro de props de animación (plan §2 D4) a tres dobles, conservando su forma.
**Archivos y líneas**

| Suite | Mock | Forma | Edición |
|---|---|---|---|
| `src/components/domain/dashboard/MiTarjetaVirtual.test.jsx` | `:16` | parcial, sin `ref` | añadir `PROPS_DE_ANIMACION` + `propsDom` **dentro de la fábrica**; `div: ({ children, ...props }) => <div {...propsDom(props)}>{children}</div>` |
| `src/components/domain/dashboard/AcordeonTarjetas.test.jsx` | `:17` | parcial, sin `ref` | idem |
| `src/components/ModalTarjeta.test.jsx` | `:20` | parcial + `forwardRef` | idem conservando `ref` |

**No se toca:** `useReducedMotion`, `AnimatePresence`, `...actual`, los `import` de
`framer-motion`, las aserciones ni los componentes.

**Cubre:** RF-04 · AC-04 · CL-03, CL-04 · DP-02, DP-07, DP-09.
**Prueba (medición 3 → 0):** las tres suites **ya están verdes**; el criterio es el **contador de
avisos**: **3** antes de T4 (patrón `initial={false}` + `whileHover` + `whileTap`), **0** después, con
`Tests N passed` **idéntico**.
**Comandos:** uno por suite, con su contador:
`npx vitest run src/components/domain/dashboard/MiTarjetaVirtual.test.jsx`,
`… src/components/domain/dashboard/AcordeonTarjetas.test.jsx`,
`… src/components/ModalTarjeta.test.jsx`;
después, sobre la salida de cada uno:
`grep -cE "does not recognize|for a non-boolean attribute|Invalid value for prop|Invalid prop"`.
**Inspección:** `git diff --stat` no debe listar `MiTarjetaVirtual.jsx`, `AcordeonTarjetas.jsx` ni
`ModalTarjeta.jsx`.
**Hecho cuando:** las tres suites pasan con el **mismo número de casos**, su contador de avisos es
**0** y el diff de los componentes es **vacío**.

---

## T5 — Dobles de animación (4–6): suites compartidas con 011/012

**Etapa 3 · Depende de:** T4. **Estado: ejecutada el 2026-10-18** (3 → 0 avisos en
`cierreDeModales`; 0 → 0 en `DashboardDrawer` y `DashboardUserModal`; mismo recuento de casos: 32,
29 y 34; `npm test` 478/478 en 31 archivos; build verde, JS 384,23 kB).
**Alcance:** mismo filtro en las tres suites de las specs cerradas, **sin tocar nada más** del
archivo (CL-02).
**Archivos y líneas**

| Suite | Mock | Forma | Edición |
|---|---|---|---|
| `src/components/layout/cierreDeModales.test.jsx` | `:33` | parcial + `AnimatePresence` + `forwardRef` | filtro; conservar `ref`, `useReducedMotion` y `AnimatePresence` |
| `src/components/layout/DashboardDrawer.test.jsx` | `:21` | **completo** (`__esModule`, sin `...actual`) + `forwardRef` + `AnimatePresence` | filtro; conservar la forma completa y `AnimatePresence`; **no** añadir `useReducedMotion` |
| `src/components/layout/DashboardUserModal.test.jsx` | `:18` | parcial + `AnimatePresence` + `forwardRef` | filtro; conservar `AnimatePresence` **tal cual**: es `({ children, ...props }) => React.createElement(React.Fragment, props, children)` y hoy ningún componente le pasa props |

**Avisos medidos (T1):** `cierreDeModales` **3** (patrón `initial={false}` + `whileHover` +
`whileTap`, por la tarjeta virtual que monta); `DashboardDrawer` **0**; `DashboardUserModal` **0**.

**No se toca:** `mockMatchMedia`, `crearMockMatchMedia`, `fijarViewport`, los casos de foco, los
stubs de `focus-trap-react` (no existen: la trampa es real), la configuración de Vitest ni las
expectativas de estilo de `:439/:443`, `:144/:151` (013, DP-06).

**Cubre:** RF-04 · AC-04 · CL-02, CL-03 · DP-02, DP-06, DP-08.
**Prueba (medición):** `cierreDeModales` **3 → 0**; `DashboardDrawer` y `DashboardUserModal`
**0 → 0** (cambio **preventivo**: se filtra el spread aunque hoy no avise). `Tests N passed`
**idéntico** en las tres.
**Comandos:** uno por suite + contador:
`npx vitest run src/components/layout/cierreDeModales.test.jsx`,
`… src/components/layout/DashboardDrawer.test.jsx`,
`… src/components/layout/DashboardUserModal.test.jsx`.
**Inspección:** `git diff -U3 <archivo>` muestra **un solo hunk** (el bloque del mock) en cada uno;
ningún cambio en `matchMedia`, foco ni expectativas.
**Hecho cuando:** las tres suites pasan con el mismo recuento, contador **0** en las tres (en 5 y 6
ya era 0) y el diff de cada archivo se limita al bloque `vi.mock("framer-motion")`.

---

## T6 — Doble de animación (7): integración `PanelTarjetas`

**Etapa 3 · Depende de:** T5. **Estado: ejecutada el 2026-10-18** (3 → 0 avisos, mismo recuento de
casos: 12; `npm test` 478/478 en 31 archivos; build verde, JS 384,23 kB).
**Alcance:** aplicar el filtro al doble de la suite de integración, que monta la página completa.
**Archivos y líneas**

| Suite | Mock | Forma | Edición |
|---|---|---|---|
| `src/pages/PanelTarjetas.test.jsx` | `:18` | parcial + `forwardRef` | filtro; conservar `useReducedMotion` y `ref` |

**No se toca:** `PanelTarjetas.jsx` (ni su ubicación ni su cabecera), los casos de la suite ni los
helpers de breakpoint.

**Cubre:** RF-04 · AC-04 · CL-03 · DP-02, DP-07, DP-09.
**Prueba (medición 3 → 0):** contador **3 → 0** (patrón `initial={false}` + `whileHover` +
`whileTap`, por la tarjeta virtual que monta la página); `Tests N passed` idéntico.
**Comandos:** `npx vitest run src/pages/PanelTarjetas.test.jsx` + contador de avisos.
**Inspección:** `git diff --stat` no lista `src/pages/PanelTarjetas.jsx`.
**Hecho cuando:** la suite pasa con el mismo recuento, el contador es **0** y la página no cambió.

---

## T7 — `@param` de `como` en `Card`

**Etapa 4 · Depende de:** T1. **Estado: ejecutada el 2026-10-18** (solo JSDoc: un `@param` añadido
entre `@estados` y `@usadoPor`; firma `como: Tag = "div"` intacta; `Card.test.jsx` 4/4; `npm test`
478/478 en 31 archivos; build verde, JS 384,23 kB).
**Alcance:** documentar la prop en el JSDoc; **no** renombrarla ni cambiar comportamiento.
**Archivos y líneas:** `src/components/ui/Card.jsx` (entre `:6` `@estados` y `:7` `@usadoPor`).

```js
 * @param {string|React.ElementType} [props.como="div"] - Etiqueta o componente con el que se
 *   renderiza el contenedor (por defecto, `div`).
```

**No se toca:** la firma (`:9`), el valor por defecto, `Card.test.jsx`, los consumidores
(`PaginaDashboardInicio.jsx:21/:25/:29` con `como="article"`, `Features.jsx:109` y las otras dos
páginas con el valor por defecto) ni el `@datos`.

**Cubre:** RF-06 · AC-06 · DP-05 · R3.
**Prueba:** `Card.test.jsx` sigue verde sin cambios (incluido `como="article"`, `:28-34`).
**Comandos:** `npx vitest run src/components/ui/Card.test.jsx` y
`grep -n "@param.*como" src/components/ui/Card.jsx` (esperado: una línea con tipo, defecto y efecto).
**Inspección:** `grep -n "como" src/components/ui/Card.jsx` confirma que la firma no se renombró.
**Hecho cuando:** el JSDoc declara tipo, valor por defecto y efecto; la firma y el comportamiento no
cambian; `Card.test.jsx` pasa.

---

## T8 — `GridTarjetas`: roles fijados y descarte documentado

**Etapa 4 · Depende de:** T1. **Estado: ejecutada el 2026-10-18** (caso guardia añadido con
`within`; `GridTarjetas.test.jsx` 6 → 7 casos; `npm test` 479/479 en 31 archivos; build verde,
JS 384,23 kB; `GridTarjetas.jsx` intacto).
**Alcance:** **cero cambios** en el componente; una prueba-guardia de la semántica de lista.
**Archivos y líneas**

| Archivo | Cambio |
|---|---|
| `src/components/domain/dashboard/GridTarjetas.test.jsx` | añadir `within` al import de `@testing-library/react` y un caso nuevo: lista `role="list"` con nombre «Tarjetas de demostración» y `getAllByRole("listitem")` de longitud `TARJETAS_DEMO.length` |
| — | **No** se modifica `GridTarjetas.jsx` (ni el marcado ni comentarios) |

**Cubre:** RF-05 · AC-05 · DP-03 · R2.
**Prueba (guardia, verde antes y después):** el caso pasa ya; su función es impedir que una limpieza
futura retire el envoltorio. Se declara como **guardia**, no como rojo→verde.
**Comandos:** `npx vitest run src/components/domain/dashboard/GridTarjetas.test.jsx`.
**Inspección:** `sed -n '22,30p' src/components/domain/dashboard/GridTarjetas.jsx` muestra
`role="list"` y `role="listitem"`; el motivo del descarte está en la spec §4.3/DP-03 y en el plan §2 D6.
**Hecho cuando:** el componente sigue idéntico, el caso nuevo pasa y la documentación del descarte es
localizable (spec + plan + título del caso).

---

## T9 — Verificación de la excepción de `PanelTarjetas`

**Etapa 4 · Depende de:** T1. **Estado: ejecutada el 2026-10-18** (solo lectura; las cuatro
comprobaciones dan lo esperado; `PanelTarjetas.test.jsx` 12/12; `npm test` 479/479 en 31 archivos;
build verde, JS 384,23 kB).
**Alcance:** comprobar documentación, ubicación y referencias; no se mueve ni se duplica nada.
**Archivos:** ninguno.

**Comprobaciones**

1. `sed -n '1,12p' src/pages/PanelTarjetas.jsx` → la excepción («Alojado en src/pages/ por decisión
   del usuario (excepción documentada, spec 005)») sigue presente.
2. `test -f src/pages/PanelTarjetas.jsx` y `test ! -f src/components/domain/dashboard/PanelTarjetas.jsx`
   → el archivo está donde debe y no hay duplicado.
3. `grep -rn "from .*PanelTarjetas" src` → solo `PaginaDashboardTarjetas.jsx:9` y
   `PanelTarjetas.test.jsx:13` (ambos `./PanelTarjetas`).
4. `npx vitest run src/pages/PanelTarjetas.test.jsx` → verde.

**Evidencia registrada (2026-10-18)**

| # | Comando | Resultado medido |
|---|---|---|
| 1 | `sed -n '1,12p' src/pages/PanelTarjetas.jsx` | `PanelTarjetas.jsx:4` (dentro del bloque `:3-4` que cita la spec): «Alojado en src/pages/ por decisión del usuario (excepción documentada, spec 005)» |
| 2 | `test -f src/pages/PanelTarjetas.jsx`; `test ! -f src/components/domain/dashboard/PanelTarjetas.jsx`; `find src -name 'PanelTarjetas*'` | Existe en `src/pages/`; **no** existe en `domain/dashboard/`; el `find` solo devuelve `src/pages/PanelTarjetas.jsx` y `src/pages/PanelTarjetas.test.jsx` (sin duplicado en ninguna otra ruta) |
| 3 | `grep -rn "PanelTarjetas" src \| grep -E "from\|import"` | Solo dos importadores, ambos `./PanelTarjetas`: `src/pages/PaginaDashboardTarjetas.jsx:9` y `src/pages/PanelTarjetas.test.jsx:13` |
| 4 | Lectura de `src/App.jsx` + `grep -n` | `App.jsx:16` importa `PaginaDashboardTarjetas`; la ruta `path="tarjetas"` (`:41-42`) monta `PaginaDashboardTarjetas`, que usa `PanelTarjetas` en `PaginaDashboardTarjetas.jsx:9` (import) y `:20` (render). Sin import roto ni huérfano |
| 5 | `grep -n "PanelTarjetas" specs/015-higiene-y-dobles/spec.md` | Excepción documentada en la spec: `:242-243` (§4.4, cita `PanelTarjetas.jsx:3-4`); RF-07 en `:303-304`, AC-07 en `:380`; plan §2 D7 en `plan.md:168-174` |
| 6 | `npx vitest run src/pages/PanelTarjetas.test.jsx` | **12/12** en 1 archivo |

**Cubre:** RF-07 · AC-07 · DP-04.
**Prueba:** la suite de la página es la verificación automática; el resto es **inspección**
reproducible con los comandos de arriba.
**Hecho cuando:** las cuatro comprobaciones dan el resultado esperado y no se editó ningún archivo.

---

## T10 — Cierre: no-regresión y declaración

**Etapa 5 · Depende de:** T2–T9. **Estado: ejecutada el 2026-10-18** (`npm test` **479/479 en 31
archivos** —línea base T1: 478/478; **+1** caso guardia de T8—; `npm run build` verde, **JS 384,23 kB**;
**avisos 0 en las siete suites**). Las suites `DashboardDrawer` y `DashboardUserModal` fueron
**0 → 0 preventivo** (se filtró el spread aunque no avisaban), **no** rojo→verde.
**Alcance:** comparar con la línea base y declarar lo medido y lo no medido.
**Archivos:** ninguno.

**Pasos**

1. `npm test` → comparar **archivo por archivo** con T1: mismo recuento en las siete suites de
   dobles y en las suites de navegación; `GridTarjetas.test.jsx` gana **un caso** (declarado);
   `SidebarNavContenido.test.jsx` gana **una aserción dentro de un caso existente** (recuento igual).
   Comparar también los avisos: **0** en las siete (T1: 3 en 1–4 y 7; 0 en 5 y 6).
2. `npm run build` → verde, con **JS 384,23 kB** como referencia. **No se compara el tamaño CSS**
   (Tailwind escanea Markdown; plan §9.6).
3. Revisar `git diff` completo: solo los **4** archivos de código y **9** de prueba del plan §4; sin
   cambios en los cinco componentes animados, `GridTarjetas.jsx`, `PanelTarjetas.jsx`,
   `vitest.setup.js`, stubs, configuración, expectativas de estilo ni `src/styles/`.
4. Declarar como **no automatizadas / de inspección**: ausencia de avisos (salida por suite), higiene
   sin lint (`grep`), fidelidad del doble frente a la librería real y excepción de `PanelTarjetas`.

**Cubre:** RF-08, RF-09, RF-10 · AC-08 · DP-09 · CL-02, CL-03.
**Prueba:** suite completa y build verdes frente a la línea base re-medida en T1.
**Comandos:** `npm test`, `npm run build`, `git diff --stat`.

**Resultado medido (2026-10-18)**

| Suite | Casos (T1 → T10) | Avisos (T1 → T10) |
|---|---|---|
| `src/components/domain/dashboard/MiTarjetaVirtual.test.jsx` | 17 → **17** | 3 → **0** |
| `src/components/domain/dashboard/AcordeonTarjetas.test.jsx` | 9 → **9** | 3 → **0** |
| `src/components/ModalTarjeta.test.jsx` | 23 → **23** | 3 → **0** |
| `src/components/layout/cierreDeModales.test.jsx` | 32 → **32** | 3 → **0** |
| `src/components/layout/DashboardDrawer.test.jsx` | 29 → **29** | 0 → **0** (preventivo) |
| `src/components/layout/DashboardUserModal.test.jsx` | 34 → **34** | 0 → **0** (preventivo) |
| `src/pages/PanelTarjetas.test.jsx` | 12 → **12** | 3 → **0** |
| **Total del proyecto** | **478 → 479** en 31 archivos | — |

El único caso nuevo es el guardia de `GridTarjetas.test.jsx` (T8); `SidebarNavContenido.test.jsx`
ganó una **aserción** dentro de un caso existente (recuento igual). Build verde con **JS 384,23 kB**;
el tamaño del CSS **no** se compara (plan §9.6).
**No automatizadas / de inspección (declaradas):** ausencia de avisos (salida de una ejecución por
suite), higiene sin lint (`grep`), fidelidad del doble frente a la librería real y excepción de
`PanelTarjetas`.

**Hecho cuando:** están registrados los recuentos por archivo y los avisos (**0** en las siete), el
build está verde, el diff solo contiene los archivos previstos y la lista de validaciones no
realizadas está declarada.
