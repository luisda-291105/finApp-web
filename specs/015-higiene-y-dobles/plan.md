# Plan 015 — Higiene de código, dobles de prueba y documentación

**Spec:** `specs/015-higiene-y-dobles/spec.md` — **aprobada por el usuario el 2026-10-18**.
**Fecha del plan:** 2026-10-18 · **Estado:** implementada y cerrada el 2026-10-18 (T1–T10 ejecutadas).
**Alcance:** RF-01…RF-10 (higiene, dobles de `framer-motion`, documentación y verificación).
**Fase:** planificación. **Este documento no modifica `src/`**: define qué se cambia, cómo y cómo se
verifica.

**Línea base medida en T1 (2026-10-18, post-013):** `npm test` **478/478 en 31 archivos**,
`npm run build` verde y **JS 384,24 kB**. La spec cita **455/455 en 30 archivos**: es la cifra
anterior a la 013 (cerrada en `2784c48`, `217fe15`, `eb68e70`). La comparación es **suite por
suite**, no solo el total. **El tamaño del CSS no es criterio de aceptación** (ver §9.6).

**Referencias:** re-verificadas el **2026-10-18** sobre el árbol post-013. Todas las de la spec
siguen vigentes salvo las que se anotan en §9. El usuario edita a mano: **T1 las comprobó** y lo que
ya no exista se registra como «ya no aplicable» (CL-01) sin recrearlo.

---

## 1. Estrategia

La 015 toca tres cosas distintas y de riesgo desigual; se ejecutan **de menor a mayor riesgo**, para
que cada tarea deje la suite en verde y las suites compartidas con las specs 011/012 se toquen al
final y con el diff más pequeño posible:

1. **Medir** (T1): línea base, recuento de casos por suite y **presencia de avisos** por suite.
2. **Higiene y documentación sin efecto en pruebas** (T2, T3): clase fantasma, imports y recuentos.
3. **Dobles de animación** (T4, T5, T6): primero las suites no compartidas, después las de 011/012 y
   al final la de integración.
4. **Documentación de contratos** (T7, T8, T9): `@param` de `como`, roles de la grilla y verificación
   de `PanelTarjetas`.
5. **Cierre** (T10): suite completa, build y declaración de lo no automatizado.

Principios:

- **Un solo cambio por causa.** El diff de los cinco componentes animados debe ser **vacío**
  (RF-04): los avisos se corrigen en los dobles.
- **El doble conserva lo que la suite mide:** hijos, `forwardRef`, `AnimatePresence` y
  `useReducedMotion` donde exista (CL-04).
- **Nada de lint ni dependencias nuevas:** la comprobación de higiene es `grep` + lectura (RF-09).
- **No se toca el entorno de medición:** ni `vitest.setup.js`, ni stubs de `matchMedia`/`focus-trap`,
  ni la configuración (DP-08), ni los casos de foco de 011/012 (CL-02).
- **Honestidad:** ningún resultado se declara verde sin haberse medido.

---

## 2. Decisiones de mecanismo

### D1 — Clase fantasma: retirar `my-`, sin sustituirla

- **Qué:** en `SidebarNavContenido.jsx:64` se elimina el token `my-` de la cadena de clases; la cadena
  queda `flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors hover:bg-emerald-primary/5`.
- **Por qué:** `my-` no genera ninguna regla (RF-01) y no hay ningún valor arbitrario que la spec
  autorice añadir. El espaciado vertical útil ya lo aporta `py-2` y el contexto del `<nav>`.
- **Precaución:** no confundir con el `my-3` del separador (`:58`), que **sí** es válido y está
  asertado en `SidebarNavContenido.test.jsx:88`. La comprobación es **por token exacto**
  (`classList.contains("my-")`), nunca por subcadena.

### D2 — Importaciones sin uso: quitar `Settings` de dos sitios

- **Qué:**
  - `SidebarNavContenido.jsx:11`: `import { Home, Receipt, CreditCard } from "lucide-react";`
  - `BottomNav.jsx:15`: se elimina la línea `Settings,` del bloque de iconos.
- **Por qué:** RF-02. `Settings` solo se consume en `DashboardUserModal.jsx:20` (import) y `:134`
  (uso); ese uso **no se toca**.
- **No cambia:** el resto del bloque de importaciones, el orden de los demás iconos ni el componente.

### D3 — Recuentos documentados: cuatro → tres

- **Qué (cinco líneas, sin tocar rutas ni enlaces):**
  - `SidebarNavContenido.jsx:2` → «3 enlaces + avatar → modal».
  - `:4` → «3 NavLink fijos + avatar via getUsuarioMock()».
  - `:18` → «3 enlaces con icono + etiqueta, separador, y avatar…».
  - `:38` → `{/* 3 enlaces de navegación */}`.
  - `SidebarResponsive.jsx:4` → «enlaces fijos (3); el avatar lo aporta el contenido compartido y el
    cierre de sesión vive en `DashboardUserModal`» (hoy atribuye a esta capa cosas que no renderiza).
- **Por qué:** RF-03. El array real (`SidebarNavContenido.jsx:29-34`) tiene **tres** entradas y no se
  toca. La suite ya fija el conjunto con `getAllByRole("link")` y `toHaveLength(3)`
  (`SidebarNavContenido.test.jsx:32-37`), así que la corrección no requiere prueba nueva.
- **No se toca:** `BottomNav.jsx:2` («4 controles: 3 ítems + Menú») es **correcto** y pertenece a otro
  componente; corregirlo sería un error de alcance.

### D4 — Dobles de `framer-motion`: filtrar solo las props de animación

- **Qué:** en las **siete** fábricas de `vi.mock("framer-motion", …)` se define, **dentro de la
  fábrica**, un filtro de props de animación y se aplica al `<div>` que sustituye a `motion.div`:

  ```js
  const PROPS_DE_ANIMACION = new Set([
    "initial", "animate", "exit", "transition", "variants", "custom",
    "whileHover", "whileTap", "whileFocus", "whileDrag", "whileInView",
    "layout", "layoutId", "layoutDependency", "layoutScroll",
    "drag", "dragConstraints", "dragElastic", "dragMomentum", "dragPropagation",
    "dragDirectionLock", "dragControls",
    "onDragStart", "onDrag", "onDragEnd", "onAnimationStart", "onAnimationComplete",
    "onUpdate", "transformTemplate", "viewport", "inherit",
  ]);
  const propsDom = (props) =>
    Object.fromEntries(Object.entries(props).filter(([clave]) => !PROPS_DE_ANIMACION.has(clave)));
  ```

  - Sin `ref`: `div: ({ children, ...props }) => <div {...propsDom(props)}>{children}</div>`
  - Con `ref`: `div: React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...propsDom(props)}>{children}</div>)`
- **Por qué:** RF-04. Los avisos nacen del spread indiscriminado; filtrar en el doble deja el
  componente intacto y **conserva** las props válidas (`className`, `style`, `role`, `id`, `aria-*`,
  `tabIndex`, `data-testid`, manejadores), que es lo que las suites consultan.
- **Por qué un denylist y no un allowlist:** un allowlist tendría que enumerar todas las props de DOM
  que usan cinco componentes y siete suites (con riesgo de tirar alguna que una aserción mide); el
  denylist solo excluye lo que nunca debe llegar al DOM. Los props realmente emitidos hoy son
  `initial`, `animate`, `exit`, `transition`, `whileHover` y `whileTap` (verificado por lectura); el
  resto del conjunto es previsión acotada a API de movimiento.
- **Por qué dentro de la fábrica y no en un helper compartido:** las fábricas de `vi.mock` se elevan
  y no pueden cerrar sobre variables del módulo; además, un archivo nuevo de utilidades no está
  contemplado por la spec y añadiría un contrato de pruebas nuevo. Cada suite queda autocontenida.
- **Qué se conserva en cada una (CL-04):**

| # | Suite (mock en) | Forma actual | Qué se conserva | Avisos hoy (T1) |
|---|---|---|---|---|
| 1 | `domain/dashboard/MiTarjetaVirtual.test.jsx:16` | parcial (`...actual`), sin `ref` | `useReducedMotion` | **3** |
| 2 | `domain/dashboard/AcordeonTarjetas.test.jsx:17` | parcial, sin `ref` | `useReducedMotion` | **3** |
| 3 | `ModalTarjeta.test.jsx:20` | parcial + `forwardRef` | `ref`, `useReducedMotion` | **3** |
| 4 | `layout/cierreDeModales.test.jsx:33` | parcial + `AnimatePresence` + `forwardRef` | `ref`, `useReducedMotion`, `AnimatePresence` | **3** |
| 5 | `layout/DashboardDrawer.test.jsx:21` | **completo** (`__esModule`, sin `...actual`) + `forwardRef` + `AnimatePresence` | forma completa y `AnimatePresence`; **no** se le añade `useReducedMotion` (no lo importa) | **0** |
| 6 | `layout/DashboardUserModal.test.jsx:18` | parcial + `AnimatePresence` + `forwardRef` | todo tal cual; **no** se toca el `AnimatePresence`, que es `({ children, ...props }) => React.createElement(React.Fragment, props, children)` (hoy ningún componente le pasa props, así que no avisa) | **0** |
| 7 | `pages/PanelTarjetas.test.jsx:18` | parcial + `forwardRef` | `ref`, `useReducedMotion` | **3** |

- **Distribución medida (T1):** **3** avisos en las suites **1, 2, 3, 4 y 7** (las cinco montan
  `MiTarjetaVirtual` de forma directa o transitiva) con el patrón idéntico `initial={false}` +
  `whileHover` + `whileTap`; **0** en las suites **5 y 6** (medido; no montan `MiTarjetaVirtual`).
  Total: **15**.
- **Consecuencia para el criterio:** en 1–4 y 7 es **3 → 0**; en 5 y 6 es **preventivo, 0 → 0** (se
  filtra igual el spread, sin aviso previo que retirar).

- **No se toca:** el `AnimatePresence` de ningún doble, los `import { useReducedMotion }` de las
  suites, los `vi.fn` de `matchMedia`, `vitest.setup.js` ni un solo componente.

### D5 — `como` documentada con un único `@param`

- **Qué:** en `Card.jsx`, entre `@estados` (`:6`) y `@usadoPor` (`:7`), añadir:
  ```js
   * @param {string|React.ElementType} [props.como="div"] - Etiqueta o componente con el que se
   *   renderiza el contenedor (por defecto, `div`).
  ```
- **Por qué:** RF-06/R3. El `@datos` ya menciona la prop, pero la guía del proyecto pide el `@param`
  en el punto de uso. **No** se renombra: es contrato de la Spec 006 RF-03 y `Card.test.jsx:28-34`
  lo prueba con `como="article"`.
- **No se añaden** `@param` de `children` ni de `className` (R3 dice «solo el que falta de `como`»).

### D6 — `GridTarjetas`: el envoltorio se conserva y se fija con una aserción

- **Qué:**
  - **Cero cambios** en `GridTarjetas.jsx` (ni marcado ni comentarios): `role="list"` en `:24-25` y
    `role="listitem"` en `:28` se quedan.
  - En `GridTarjetas.test.jsx` se añade `within` al import y **un caso** que fija la semántica:
    ```js
    it("conserva la semántica de lista: role=list con un listitem por tarjeta (spec 015, R2)", () => {
      render(<GridTarjetas tarjetas={TARJETAS_DEMO} onSeleccionarTarjeta={vi.fn()} />);
      const lista = screen.getByRole("list", { name: "Tarjetas de demostración" });
      expect(within(lista).getAllByRole("listitem")).toHaveLength(TARJETAS_DEMO.length);
    });
    ```
- **Por qué:** RF-05/DP-03. La decisión (no retirar el envoltorio) queda escrita en la spec (§4.3,
  DP-03), en este plan y en el título del caso; la aserción impide que una limpieza futura vuelva a
  plantear el defecto. Es una **prueba-guardia**: pasa antes y después (no hay cambio de código).
- **Documentación:** no se añade comentario al componente porque §2.1 de la spec cierra el punto
  «sin cambio de código»; el motivo vive en la spec y en la prueba.

### D7 — `PanelTarjetas`: solo verificación

- **Qué:** comprobar que la excepción sigue documentada (`PanelTarjetas.jsx:3-4`), que el archivo
  sigue en `src/pages/` y que no hay referencias rotas (`PaginaDashboardTarjetas.jsx:9` y
  `PanelTarjetas.test.jsx:13` importan `./PanelTarjetas`).
- **Por qué:** RF-07/DP-04. No se mueve, no se duplica y no se crea una prueba nueva: la suite de la
  página ya lo cubre.

### D8 — Pruebas: mínima intervención

- **Qué:** se añaden **dos** aserciones (una en `SidebarNavContenido.test.jsx` para `my-`, otra en
  `GridTarjetas.test.jsx` para los roles) y se modifican **solo los bloques de mock** de las siete
  suites. No se añaden casos a las suites de 011/012 ni se toca ninguna expectativa de estilo (DP-06).
- **Por qué:** RF-08/DP-09. El recuento de casos de las siete suites **no baja** (CL-03).

---

## 3. Alternativas descartadas

| # | Alternativa | Por qué se descarta |
|---|---|---|
| A1 | Cambiar los componentes (`initial={false}`, `whileHover`, `whileTap`) | Es API legítima de `framer-motion`; RF-04/DP-02 lo prohíben y `BottomNav` ni siquiera usa la librería. |
| A2 | Un helper compartido en `src/…` para los siete dobles | Archivo nuevo no contemplado; siete imports nuevos y un contrato de pruebas adicional. |
| A3 | Aserción de `console.error` en cada suite | En `cierreDeModales`, `DashboardDrawer` y `DashboardUserModal` (011/012) el cambio dejaría de ser «solo el doble» (CL-02). Se usa **salida limpia** como prueba (permitido por el encargo). |
| A4 | Allowlist de props DOM en el doble | Riesgo de tirar props que alguna aserción mide (`style`, `data-testid`, `tabIndex`, `aria-*`); mantener el paso de lo válido es requisito (RF-04 e). |
| A5 | Sustituir `my-` por `my-2` | RF-01 prohíbe sustituirla por un valor arbitrario nuevo; cambiaría el espaciado sin requisito. |
| A6 | Retirar el `role="listitem"` | R2/DP-03: dejaría una lista sin elementos; degrada semántica. |
| A7 | Renombrar `como` a `etiqueta`/`as` | R3/DP-05: rompe Spec 006 RF-03 y `Card.test.jsx`. |
| A8 | Añadir ESLint o una pasada de formato | RF-09/RF-10: sin herramientas ni dependencias nuevas; el proyecto no tiene lint. |
| A9 | Añadir un comentario en `GridTarjetas.jsx` | §2.1 cierra el punto «sin cambio de código»; la documentación va a la spec/plan y a la prueba. |

---

## 4. Archivos afectados

**Código (4 archivos; ninguno de los cinco componentes animados):**

| Archivo | Cambio | Tarea |
|---|---|---|
| `src/components/layout/SidebarNavContenido.jsx` | quitar `my-` (`:64`), quitar `Settings` (`:11`), recuentos (`:2, :4, :18, :38`) | T2, T3 |
| `src/components/layout/BottomNav.jsx` | quitar `Settings` (`:15`) | T2 |
| `src/components/layout/SidebarResponsive.jsx` | recuento y uso real (`:4`) | T3 |
| `src/components/ui/Card.jsx` | `@param` de `como` (`:6-7`) | T7 |

**Pruebas (9 archivos):**

| Archivo | Cambio | Tarea |
|---|---|---|
| `src/components/layout/SidebarNavContenido.test.jsx` | aserción `my-` en el caso del avatar (`:91-96`) | T2 |
| `src/components/domain/dashboard/MiTarjetaVirtual.test.jsx` | filtro en el doble (`:16`) | T4 |
| `src/components/domain/dashboard/AcordeonTarjetas.test.jsx` | filtro (`:17`) | T4 |
| `src/components/ModalTarjeta.test.jsx` | filtro + `forwardRef` (`:20`) | T4 |
| `src/components/layout/cierreDeModales.test.jsx` | filtro + `forwardRef` + `AnimatePresence` (`:33`) | T5 |
| `src/components/layout/DashboardDrawer.test.jsx` | filtro en el doble **completo** (`:21`) | T5 |
| `src/components/layout/DashboardUserModal.test.jsx` | filtro + `forwardRef` + `AnimatePresence` (`:18`) | T5 |
| `src/pages/PanelTarjetas.test.jsx` | filtro + `forwardRef` (`:18`) | T6 |
| `src/components/domain/dashboard/GridTarjetas.test.jsx` | `within` + caso de roles | T8 |

**No se toca (explícito):** `MiTarjetaVirtual.jsx`, `AcordeonTarjetas.jsx`, `ModalTarjeta.jsx`,
`DashboardDrawer.jsx`, `DashboardUserModal.jsx` (**diff vacío**), `GridTarjetas.jsx`,
`PanelTarjetas.jsx`, `DashboardUserModal.jsx:20/:134` (uso de `Settings`), `vitest.setup.js`, stubs
de `matchMedia` y de `focus-trap-react`, configuración de Vitest, casos de foco de 011/012,
expectativas de estilo (013), `src/styles/index.css` y `index.css.test.js`.

---

## 5. Validación

### 5.1 Automatizada (Vitest)

| Bloque | Comando | Qué prueba |
|---|---|---|
| A — Higiene | `npx vitest run src/components/layout/SidebarNavContenido.test.jsx src/components/layout/BottomNav.test.jsx src/components/layout/SidebarResponsive.test.jsx` | Navegación intacta y guarda de `my-` |
| B — Dobles no compartidos | `npx vitest run src/components/domain/dashboard/MiTarjetaVirtual.test.jsx src/components/domain/dashboard/AcordeonTarjetas.test.jsx src/components/ModalTarjeta.test.jsx` | Suites verdes y sin avisos |
| C — Dobles compartidos | `npx vitest run src/components/layout/cierreDeModales.test.jsx src/components/layout/DashboardDrawer.test.jsx src/components/layout/DashboardUserModal.test.jsx` | Ídem, con foco intacto |
| D — Integración | `npx vitest run src/pages/PanelTarjetas.test.jsx` | Ídem, montando la página completa |
| E — Contratos | `npx vitest run src/components/ui/Card.test.jsx src/components/domain/dashboard/GridTarjetas.test.jsx` | `como` y roles |
| F — Cierre | `npm test` y `npm run build` | No-regresión completa |

**Prueba de ausencia de avisos (AC-04, por suite):**

```bash
npx vitest run <ruta-de-la-suite> 2>&1 | tee /tmp/015-<suite>.log >/dev/null
grep -cE "does not recognize|for a non-boolean attribute|Invalid value for prop|Invalid prop" /tmp/015-<suite>.log || true
```

- **Antes** (T1, medido): **3** en las suites 1, 2, 3, 4 y 7 (patrón `initial={false}` +
  `whileHover` + `whileTap`) y **0** en las suites 5 y 6 (medido; no montan `MiTarjetaVirtual`).
  Total medido: **15**.
- **Después** (T4–T6): **0** en las siete. El criterio es **3 → 0** en 1–4 y 7, y **0 → 0**
  preventivo en 5 y 6.
- Además se registra, por suite, la línea `Tests  N passed` **antes y después**: **N no cambia**
  (CL-03). Las dos únicas excepciones previstas son `SidebarNavContenido.test.jsx` y
  `GridTarjetas.test.jsx`, que ganan **aserciones dentro de casos existentes** (la primera) o **un
  caso** (la segunda); se documenta en T10.

### 5.2 Inspección (no automatizable, RF-09)

| Qué | Cómo se hace reproducible | Esperado |
|---|---|---|
| Clase fantasma | `grep -rnE '(^|["[:space:]])my-(["[:space:]]|$)' src --include='*.jsx'` | Sin coincidencias (no confunde `my-3`) |
| `Settings` sin uso | `grep -n "Settings" src/components/layout/SidebarNavContenido.jsx src/components/layout/BottomNav.jsx` | Sin coincidencias |
| Uso legítimo intacto | `grep -n "Settings" src/components/layout/DashboardUserModal.jsx` | `:20` y `:134` |
| Recuentos | `grep -rnE "4 enlaces|4 NavLink|enlaces fijos \(4\)" src` | Sin coincidencias |
| Conjunto de enlaces | `grep -c "ruta:" src/components/layout/SidebarNavContenido.jsx` + suite `:32-37` | `3` y verde |
| `@param` | `grep -n "@param.*como" src/components/ui/Card.jsx` | Una línea con tipo, defecto y efecto |
| Excepción de `PanelTarjetas` | `sed -n '1,12p' src/pages/PanelTarjetas.jsx`; `test -f src/pages/PanelTarjetas.jsx`; `test ! -f src/components/domain/dashboard/PanelTarjetas.jsx` | Texto presente, archivo en su sitio, sin duplicado |
| Referencias | `grep -rn "from .*PanelTarjetas" src` | Solo `PaginaDashboardTarjetas.jsx:9` y `PanelTarjetas.test.jsx:13` |
| Diff de componentes animados | `git diff --stat` y `git diff` de los cinco archivos | **Vacío** |

**Declaración obligatoria:** el proyecto **no tiene lint**; las filas de esta tabla son
**inspección**, no pruebas. La fidelidad del doble respecto de la librería real **no se mide** (solo
se comprueba que no ensucia el DOM y que la suite sigue midiendo lo mismo).

---

## 6. Riesgos y mitigación

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | El denylist omite una prop que sí llega al DOM y el aviso persiste | Media | Alto | El **oráculo** es la salida por suite, ya medida (3 en 1–4 y 7; 0 en 5 y 6); se itera hasta 0. Los props reales están verificados por lectura (`initial`, `animate`, `exit`, `transition`, `whileHover`, `whileTap`). |
| R2 | El filtro tira una prop que una aserción mide | Baja | Alto | Solo se excluyen props de animación; si una suite falla, se revisa **qué** prop falta antes de tocar la expectativa (RF-08: nunca relajar). |
| R3 | Se toca un caso de foco o un stub en las suites de 011/012 | Baja | Alto | En T5 el diff se revisa **hunk por hunk**: solo el bloque `vi.mock("framer-motion")`. Los `mockMatchMedia` y los casos de foco quedan intactos (CL-02/DP-08). |
| R4 | Baja el recuento de casos de alguna suite | Baja | Alto | Comparación `Tests N passed` de T1 contra T10, suite por suite (CL-03). |
| R5 | Se «arregla» `my-` con `my-2` | Baja | Medio | Prohibido por RF-01; el grep final exige token exacto y el diff no debe añadir clases. |
| R6 | Se corrige el «4 controles» de `BottomNav` por error | Media | Bajo | La lista de líneas a tocar es cerrada (D3); `BottomNav.jsx:2` **no** está en ella. |
| R7 | Los recuentos ya están editados a mano | Media | Bajo | T1 re-verifica; lo que ya no aplique se registra «ya no aplicable» (CL-01) y no se recrea. |
| R8 | React deduplica avisos y oculta una segunda fuente | Media | Medio | Se mide **una ejecución por suite** (no una conjunta) y se revisan también los `AnimatePresence` de los dobles (D4). |
| R9 | La línea base real difiere de 478/31 | Media | Medio | T1 la re-mide **antes** de tocar; la comparación usa esa medición, no la cifra de la spec. |
| R10 | El caso nuevo de `GridTarjetas` rompe por `within` mal importado | Baja | Bajo | Import explícito desde `@testing-library/react`; la suite se ejecuta en T8. |

---

## 7. Trazabilidad requisito ↔ tarea

| RF | AC | Tarea(s) | Verificación |
|---|---|---|---|
| RF-01 — sin clases fantasma | AC-01 | T2 | Aserción `classList.contains("my-")` (roja→verde) + `grep` por token |
| RF-02 — sin imports sin uso | AC-02 | T2 | `grep` de `Settings` (0 en dos archivos; `:20`/`:134` intactos) |
| RF-03 — documentación fiel | AC-03 | T3 | `grep` de recuentos + `toHaveLength(3)` existente + suites |
| RF-04 — avisos de las siete suites | AC-04 | T4, T5, T6 | Contador por suite (**3 → 0** en cinco; **0 → 0** preventivo en dos) + `Tests N` constante + diff vacío de componentes |
| RF-05 — envoltorio conservado | AC-05 | T8 | Caso de roles (guardia) + documentación en spec/plan |
| RF-06 — `como` documentada | AC-06 | T7 | `grep` del `@param` + `Card.test.jsx` verde |
| RF-07 — excepción verificada | AC-07 | T9 | `sed`/`test`/`grep` + suite de la página |
| RF-08 — pruebas y no-regresión | AC-08 | T4–T6, T10 | Suites + comparación por archivo |
| RF-09 — validaciones declaradas | AC-08 | T10 | Tabla de no automatizadas en el informe |
| RF-10 — alcance mínimo | AC-08 | todas | Diff revisado (solo 4 + 9 archivos) |

**CL/DP cubiertos:** CL-01 (T1–T3), CL-02 (T5), CL-03 (T4–T6, T10), CL-04 (T4–T6);
DP-01 (T2, T3), DP-02 (T4–T6), DP-03 (T8), DP-04 (T9), DP-05 (T7), DP-06 (T5), DP-07 (T1, T4–T6),
DP-08 (T5), DP-09 (todos).

---

## 8. Fronteras (lo que este plan no hace)

- **Componentes animados:** no se tocan (`initial={false}`, `whileHover`, `whileTap`, `variants`,
  `layoutId` y transiciones se mantienen). Diff vacío.
- **011/012:** no se tocan casos de foco, `vitest.setup.js`, stubs de `matchMedia` ni
  `focus-trap-react`; no se reimplementa nada de esas specs.
- **013:** no se tocan expectativas de estilo, ni `index.css`, ni `index.css.test.js`.
- **014:** no se tocan hexadecimales de JSX.
- **Datos, rutas, endpoints, autenticación, `TRIAL_ACTIVO`, build, dependencias, lint.**
- **`PanelTarjetas`:** no se mueve ni se duplica.

---

## 9. Notas y discrepancias detectadas (no bloqueantes)

1. **Línea base de la spec obsoleta:** la spec (§9 y cabecera) dice 455/455 en 30 archivos; T1 midió
   **478/478 en 31**, build verde y **JS 384,24 kB**. **No se edita la spec** (solo su cabecera de
   estado): la comparación usa la medición real.
2. **Estado de la spec ya corregido:** la nota original decía que §10 seguiría en «borrador»; **ya no
   aplica**. La pasada documental de cierre (2026-10-18) actualizó la cabecera y la nota final, y
   `spec.md` §10 registra «aprobado e implementado» (nota retirada por obsoleta).
3. **Documentación del descarte de `GridTarjetas`:** la spec pide documentarlo y, a la vez, cerró el
   punto «sin cambio de código» (§2.1). Se documenta en spec §4.3/DP-03, en el plan y en el título
   del caso nuevo; **no** se añade comentario al componente. Si el usuario prefiere el comentario en
   el código, es un cambio de una línea y no altera el marcado.
4. **`ModalTarjeta.test.jsx` vive en `src/components/`**, no junto al componente
   (`domain/modales/`). La ruta de la spec §4.2 es la correcta; cualquier comando con
   `domain/modales/ModalTarjeta.test.jsx` sería erróneo.
5. **`SidebarNavContenido.jsx:33`** contiene una línea en blanco con espacios dentro del array; es
   formato y **no** se toca (RF-10: no reformatear).
6. **El tamaño del CSS no es criterio de aceptación.** Tailwind v4 escanea también Markdown, de modo
   que el CSS compilado varía con documentos sin trackear: **58,68 kB** con `git archive HEAD`,
   **58,74 kB** con los untracked previos (`analicis-completo-cambios.md` + `specs/014/`) y
   **58,78 kB** con `specs/015/plan.md`+`tasks.md` y `specs/016/`. La referencia estable es **build
   verde + JS 384,24 kB**; el CSS se anota, no se compara.

**Preguntas abiertas para el usuario: ninguna.** La única decisión de forma es la nota 3, con
recomendación ya aplicada (documentar fuera del componente).

---

## 10. Definición de done

1. Las suites **1–4 y 7** pasan de **3 a 0** avisos; las **5 y 6** siguen en **0** (filtrado
   preventivo), con el **mismo recuento de casos** (salvo el caso nuevo de `GridTarjetas`,
   declarado).
2. `my-` y las dos importaciones de `Settings` ya no existen; el uso legítimo sigue en
   `DashboardUserModal.jsx:20/:134`.
3. Los cinco recuentos documentados dicen **tres**.
4. `Card` documenta `como` sin renombrarla; `Card.test.jsx` verde.
5. `GridTarjetas` conserva `role="list"`/`role="listitem"` y una prueba lo fija.
6. `PanelTarjetas` sigue en `src/pages/` con su excepción documentada y referencias correctas.
7. `npm test` y `npm run build` verdes frente a la línea base de T1; **JS 384,24 kB** como
   referencia y **sin comparar el tamaño del CSS** (§9.6); ninguna validación no ejecutada se
   declara verde.
