# Plan 014 — Diseño visual del asistente de ayuda de la landing

**Spec:** `specs/014-asistente-de-ayuda/spec.md` — **aprobada por el usuario el 2026-10-19**.
**Fecha del plan:** 2026-10-19 · **Estado:** listo para ejecutar `tasks.md`.
**Alcance:** solo diseño (RF-01…RF-12). **No** incluye motor de coincidencia, guion, texto libre
procesado, máquina de estados, reinicio/persistencia, IA, backend ni red (spec §2.2, DP-01); **no**
incluye la migración de hexadecimales (DP-04) ni el «Usuario» del `Header` (DP-03).
**Fase:** planificación. **Este documento no modifica `src/`**; define qué se creará, con qué
mecanismo y cómo se verificará.

**Línea base de partida:** `HEAD` en `cfdd1af`; `npm test` **479/479 en 31 archivos**; `npm run build`
verde, **re-medidos en T1**. Resultado final del cierre: **518/518 en 33 archivos** y build verde
(DP-12, AC-12).

**Referencias `archivo:línea`:** re-verificadas por el planner el **2026-10-19** sobre el árbol
actual. El usuario edita a mano: **T1 las re-verifica** y lo que ya no exista se registra como «ya no
aplicable» (CL-01/CL-12) **sin recrearlo**.

**Reutilización verificada hoy por el planner** (no se asume nada):

| Pieza | Estado verificado | Uso en la 014 |
|---|---|---|
| `useRetornoDeFoco({ activo, triggerRef })` (`src/hooks/useRetornoDeFoco.js:94`) | Existe; sin candidato válido **no** llama a `focus()` (`:88`) | Retorno al disparador (RF-02, CL-10) |
| `useCierreConEsc({ activo, zIndex, alCerrar })` (`src/hooks/useCierreConEsc.js:3`) | Existe; cierra solo la capa superior | Esc (RF-02) |
| `useDeslizarParaCerrar({ activo, refPanel, alCerrar })` (`src/hooks/useDeslizarParaCerrar.js:3`) | Existe; umbral 96 px y no arranca sobre controles | Deslizar en móvil (RF-02) |
| `BotonCerrar({ ariaLabel, alCerrar, className })` (`src/components/ui/BotonCerrar.jsx:22-30`) | Existe; sin hexadecimales | «X» del header (RF-03) |
| `.glass-surface` (`src/styles/index.css:79-82`) y `.safe-bottom` (`:34-36`) | Existen | `glass-surface` se reutiliza; **`safe-bottom` no aplica** (panel centrado, ver D9) |
| `BotMessageSquare` (`lucide-react ^0.454.0`, `package.json:19`) | Exportado: `node_modules/lucide-react/dist/lucide-react.d.ts:2741` | Disparador (RF-01) |
| Stub de geometría (`vitest.setup.js:73-91`) | Hace viable la **trampa real** en jsdom | Cromo (CL-14) |
| `LandingLayout` renderiza `children` **al final** (`src/layout/LandingLayout.jsx:51`) | El logotipo sigue siendo el primer enfocable | No rompe `AuthModal.test.jsx:469-493` (ver R4) |

**Ningún test vigente asertá el disparador actual**: `Ayuda y preguntas frecuentes` y el glifo `?`
solo aparecen en `src/pages/PaginaInicio.jsx` (grep de hoy, 1 coincidencia). El cambio de nombre
accesible **no** rompe ninguna suite existente.

---

## 1. Estrategia

Se resuelve **por capas y con el cromo delante**, de modo que cada tarea deje la suite **en verde** y
sea verificable por separado:

1. **Medir** la línea base y re-verificar referencias (T1). Sin números no se declara nada.
2. **Crear el componente de diseño** `AsistenteAyuda` en cuatro pasos pequeños y acumulativos:
   panel/cabecera (T2) → estado vacío con chips (T3) → estado conversación con log (T4) → pie
   presentacional (T5). Cada paso añade sus asertos a la suite nueva; nada queda huérfano.
3. **Montar el cromo** sobre la estructura ya verificada: trampa real, Esc, clic fuera, deslizar y
   retorno de foco (T6); después **cablear el disparador** en `PaginaInicio` (T7).
4. **Auditar la fuente** (T8): cero hexadecimales nuevos, cero lógica/red/dependencias y specs
   cerradas intactas.
5. **Medir a mano** lo que jsdom no puede: altura, scroll, teclado virtual, contraste compuesto,
   gesto y presupuesto Fluid Glass (T9).
6. **Cerrar**: suite completa, build y `MEMORY.md` por §15 (T10).

**Principio de compatibilidad:** no se añaden dependencias ni tokens; se reutilizan las cuatro piezas
comunes del cromo (010/011), `BotonCerrar`, `.glass-surface` y el patrón de `AuthModal`
(`if (!abierto) return null`, hooks antes del retorno, scrim con guarda `target === currentTarget`).

---

## 2. Decisiones del plan

### D1 — Componente nuevo: `src/components/domain/modales/AsistenteAyuda.jsx`

- **Qué:** un componente presentacional con la firma
  `AsistenteAyuda({ abierto, estadoVisual = "vacio", alCerrar, triggerRef })`, export por defecto.
- **Por qué:** `specs/014` es una superficie modal de la landing y el directorio
  `src/components/domain/modales/` ya alberga `AuthModal.jsx` y `ModalTarjeta.jsx`; mantiene los
  límites de capas de `.agents/rules/rules.md:12-13`.
- **Sin `createPortal`:** `AuthModal` y `ModalTarjeta` renderizan inline con `fixed` y no hay
  ancestro con `transform` en la landing; el portal es innecesario y añadiría un nodo extra.
- **Cabecera `@uso/@funciones/…` obligatoria** (`.agents/rules/rules.md:20-22`); se copia el patrón
  de `AuthModal.jsx:1-14`.

### D2 — Estructura: scrim flex que **contiene** al panel (no portal, sin `aria-hidden`)

```
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/70"
     onClick={manejarClicExterior}>            ← scrim, SIN backdrop-blur (AC-11)
  <FocusTrap focusTrapOptions={crearOpcionesTrampa(panelRef)}>
    <div ref={panelRef} role="dialog" aria-modal="true"
         aria-labelledby="asistente-titulo"
         aria-describedby="asistente-marca asistente-nota asistente-reserva"
         tabIndex={-1}
         className="relative z-60 w-[90vw] max-w-md max-h-[85vh] overflow-hidden outline-none
                    bg-bg-cream/95 glass-surface border border-border-line/30 rounded-3xl shadow-xl
                    flex flex-col">
      <header className="shrink-0 …">…</header>
      <div className="min-h-0 flex-1 overflow-y-auto …">…</div>   ← ÚNICO scroll (DP-06)
      <footer className="shrink-0 …">…</footer>
    </div>
  </FocusTrap>
</div>
```

- **Por qué así:** el `role="dialog"` va en el panel (el nombre accesible sale del `h2`), la
  descripción enlaza marca/nota/reserva, y el scrim **no** lleva `aria-hidden` porque contiene al
  diálogo (a diferencia del scrim portalizado de `DashboardUserModal.jsx:160-164`).
- **Ops de la trampa:** se replica `crearOpcionesTrampa` (`allowOutsideClick: true`,
  `escapeDeactivates: false`, `initialFocus: () => refPanel.current`,
  `returnFocusOnDeactivate: false`), igual que `AuthModal.jsx:29-36`.
- **Foco inicial en el panel:** `tabIndex={-1}`, fuera del ciclo de Tab (cromo 010).

### D3 — Cabecera, cuerpo y pie (clases concretas)

| Bloque | Clases / contenido |
|---|---|
| `header` | `shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-border-line/30` |
| Título | `<h2 id="asistente-titulo" className="font-display text-lg font-semibold text-bg-dark">Asistente de ayuda</h2>` |
| Marca | `<span id="asistente-marca" className="self-start rounded-full bg-emerald-primary px-2.5 py-1 text-xs font-medium text-bg-cream">Demostración · No es una IA real</span>` |
| Nota | `<p id="asistente-nota" className="text-xs text-slate-text">Vista de diseño: contenido de ejemplo; aún no responde preguntas.</p>` |
| «X» | `<BotonCerrar ariaLabel="Cerrar asistente de ayuda" alCerrar={alCerrar} className="shrink-0 text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary" />` |
| Body | `min-h-0 flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4` |
| Chips (fila) | `flex flex-wrap gap-2` |
| Chip | `<button type="button" aria-disabled="true" className="rounded-full border border-border-line/60 bg-bg-cream px-3 py-1.5 text-left text-xs text-bg-dark">…</button>` |
| Log | `<div role="log" aria-live="polite" aria-relevant="additions" aria-atomic="false" aria-label="Mensajes del asistente" className="flex flex-col gap-3">…</div>` |
| Footer | `shrink-0 px-5 py-4 border-t border-border-line/30 flex flex-col gap-2` |

**Marca en píldora sólida (`bg-emerald-primary text-bg-cream`) y no translúcida:** además de leer
como aviso, es la única pareja esmeralda/crema del diseño y **medida** en 4,87:1 (≥ 4,5, AA). Una
píldora `bg-emerald-primary/10 text-emerald-primary` daría ≈3,9:1 y **fallaría**; queda descartada
(§3-A4). La píldora **no cuenta** como superficie translúcida (fondo opaco).

### D4 — Burbujas: contenedor por remitente + etiqueta `sr-only`

- Datos estáticos: `const CONVERSACION = [{ remitente: "tu", texto: … }, { remitente: "asistente", texto: … }, …]` (cuatro entradas, literales de la spec §4.3).
- Usuario: contenedor `flex justify-end`; burbuja
  `max-w-[85%] rounded-2xl rounded-br-md bg-emerald-primary px-3.5 py-2.5 text-sm text-bg-cream`.
- Asistente: contenedor `flex justify-start`; burbuja
  `max-w-[85%] rounded-2xl rounded-bl-md border border-border-line/40 bg-bg-cream px-3.5 py-2.5 text-sm text-bg-dark`.
- Cada burbuja abre con `<span className="sr-only">Tú</span>` / `<span className="sr-only">Asistente</span>`.
  **Por qué `sr-only` y no `aria-hidden`:** el texto debe existir en el DOM para que AC-07 lo asierte
  (`getByText` + `toHaveClass("sr-only")`); `display:none`/`aria-hidden` lo sacarían del árbol.
- **Sin avatares ni imágenes** (spec §4.2).

### D5 — `role="log"` solo con mensajes; `TEXTO_VACIO`/`TEXTO_EJEMPLO`/chips fuera

- En `vacio`, el log se renderiza **siempre** (`AC-08`: existe desde la apertura) y queda **sin
  hijos**: `{estadoVisual === "conversacion" && …}` no produce nodos → `childElementCount === 0`.
- `TEXTO_VACIO` (vacío) y `TEXTO_EJEMPLO` (conversación) son **hermanos previos** al log.
- **Por qué:** hace decidible AC-08 sin `queryByText` ambiguo y evita que `aria-live` anuncie texto
  no-mensaje.

### D6 — Chips y «Enviar» con `aria-disabled="true"` y **sin handlers**; campo sin estado

- Chips: `<button type="button" aria-disabled="true">` sin `onClick`.
- «Enviar»: `<button type="button" aria-disabled="true">` sin `onClick`, sin `<form>`, sin `onSubmit`.
- Campo: `<label htmlFor="asistente-entrada" className="sr-only">Tu pregunta</label>` +
  `<input id="asistente-entrada" type="text" placeholder="Escribe una pregunta…" />`
  **sin `value` ni `onChange`** (no controlado, editable, sin estado); recibe foco para revisar el
  teclado virtual (CL-06, diferido a la spec de comportamiento).
- **Por qué `aria-disabled` y no `disabled`:** deben seguir siendo localizables por rol/nombre (AC-06,
  AC-08, AC-09) y el diseño declara la ausencia de respuesta sin deshabilitar el foco.
- **Por qué `sr-only` en el label:** mantiene la fila del pie compacta a 320 px y sigue siendo
  asertable con `getByLabelText("Tu pregunta")` (AC-09). **Confirmado por el usuario el 2026-10-19**
  (antes Q2): el label va `sr-only`, asociado por `for`/`id`.

### D7 — Dos estados por prop, sin máquina de estados

- `estadoVisual` es **prop presentacional** con dos valores (`"vacio"` por defecto, `"conversacion"`).
- **Sin** `useState`/`useReducer` de conversación, sin botón de cambio y sin transición (DP-07).
- `PaginaInicio` monta el componente **siempre** con `estadoVisual="vacio"`; `"conversacion"` solo lo
  pasan las pruebas y la revisión de diseño.
- **Por qué:** AC-12 acota su `grep` al componente nuevo; el único `useState` es el de apertura/cierre
  de la página (cromo).

### D8 — Cromo: `useCierreConEsc` con `zIndex: 60`, deslizar sobre el panel, retorno con `triggerRef`

- `useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar })` — la capa coincide con el `z-60` del
  panel (mismo criterio que `DashboardUserModal.jsx:65-66`).
- `useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar })` — el gesto vive en el panel.
- `useRetornoDeFoco({ activo: abierto, triggerRef })` — disparador → elemento capturado → cadena estable.
- Los tres hooks se invocan **antes** del `if (!abierto) return null` (regla de hooks).
- **No coexistencia con `AuthModal`:** el disparador vive en `z-40`, por debajo del scrim `z-50` del
  `AuthModal`; no se abren a la vez (CL-11).
- **Sin animación de entrada:** se descarta Framer Motion (ver §3-A2). Así CL-09 se cumple por
  construcción (no hay transición que reducir) y `.agents/rules/rules.md:41` (animaciones CSS) queda
  respetado.

### D9 — `safe-bottom` **no** se aplica; `p-4` del scrim se mantiene

- **Verificado:** `.safe-bottom` (`src/styles/index.css:34-36`) inyecta
  `padding-bottom: env(safe-area-inset-bottom, 1rem)` y está pensada para superficies ancladas al
  borde inferior (`BottomNav`). El panel del asistente está **centrado** y la spec §4.1 fija el scrim
  como `flex items-center justify-center p-4`.
- **Decisión:** se reutiliza `.glass-surface` y **no** `.safe-bottom`; a 320–375 px el `p-4` ya deja
  ≥16 px de margen. Aplicarla desalinearía el centrado respecto del diseño aprobado.
- **Nota para el usuario:** es la única pieza que su instrucción de reutilización proponía y que la
  spec aprobada no admite; se declara en vez de cambiarla sin requisito.

### D10 — Pruebas: dos suites nuevas y **ningún cambio** en las existentes

- `src/components/domain/modales/AsistenteAyuda.test.jsx` — estructura, literales, ARIA, estados,
  cromo (T2–T6).
- `src/pages/PaginaInicio.test.jsx` — disparador e integración (T7): `MemoryRouter`, stub de
  `IntersectionObserver` y `vi.stubGlobal("fetch", vi.fn())`.
- **Ninguna suite existente se edita**: `Ayuda y preguntas frecuentes`/`?` no se asertan en ninguna
  prueba (grep de hoy), y `AuthModal.test.jsx:469-493` (logotipo = primer enfocable) sigue verde
  porque el disparador ya existía y `children` siguen al final (`LandingLayout.jsx:51`).
- **Asertos de literales con cadenas literales** (no importadas del componente) para que la prueba no
  sea tautológica.
- Los casos de AC-05/AC-07/AC-08 renderizan **solo** `AsistenteAyuda` (no `PaginaInicio`), para que
  `getAllByText(/IA/)` cuente únicamente la marca y no textos de la landing.

### D11 — Trazabilidad a `MEMORY.md` sin editar rutas de otros temas

- El planner **no puede** editar `MEMORY.md` (solo escribe en `specs/`); DP-13. La corrección la
  aplica el implementer en T10 con la tabla línea por línea de la spec §15: **solo ruta y estado**,
  texto de hexadecimales **verbatim**, `MEMORY.md:37` **intacto**.
- **Se corrige por contenido, no por número**: la fila `:27` queda como línea de referencia y no se
  inserta una línea nueva, así que `:31` y `:41` mantienen su número.

### D12 — El barrido de hexadecimales se acota a producción (decisión del usuario, 2026-10-19)

- **Qué:** el `grep` de literales `#` se ejecuta **solo sobre los JS/JSX de producción** tocados
  (`src/**/*.js` y `src/**/*.jsx`), **excluyendo las suites** `*.test.jsx` y `*.test.js`:

  ```bash
  git diff --unified=0 -- '*.js' '*.jsx' ':(exclude)*.test.jsx' ':(exclude)*.test.js' \
    | grep '^+' | grep -v '^+++' | grep '#'
  ```

- **Por qué:** AC-01 exige la **comparación literal** del `className` del disparador y ese literal
  contiene `#0f1117` y `#1a7a5e`; la suite lo copia **verbatim** (es un valor heredado, no un
  hexadecimal nuevo). Sin la exclusión, el barrido daría un **falso positivo garantizado** y AC-01 y
  AC-10 no podrían satisfacerse a la vez.
- **AC-01 sigue intacto:** la comparación **literal** del `className` es obligatoria y no se relaja.
- Resuelve la antigua **Q1**; el plan ya no declara ningún falso positivo.

---

## 3. Alternativas descartadas

| # | Alternativa | Por qué se descarta |
|---|---|---|
| A1 | Reutilizar `AuthModal` con un `modo="ayuda"` | Mezcla dos propósitos en una superficie congelada por 010/011, obliga a tocar una suite verde y contradice DP-05 (el `AuthModal` **no** se toca). |
| A2 | Animación de entrada/salida con Framer Motion (patrón `DashboardUserModal`/`ModalTarjeta`) | Añade movimiento sin requisito, exige duplicar el `useReducedMotion` y crear el puente de desmontaje; `.agents/rules/rules.md:41` prefiere CSS y CL-09 exige que, si se añade, sea instantánea. Sin animación, CL-09 se cumple por construcción. |
| A3 | `createPortal` como `DashboardUserModal` | Nodo extra y scrim separado con `aria-hidden` que **no puede** envolver al diálogo; el patrón inline de `AuthModal`/`ModalTarjeta` ya funciona y simplifica el clic fuera. |
| A4 | Píldora de la marca `bg-emerald-primary/10 text-emerald-primary` | ≈3,9:1 sobre el fondo compuesto: **falla AA** para texto de 12 px (RF-10). |
| A5 | Píldora translúcida `bg-emerald-primary/15 text-bg-dark` | Pasa contraste pero introduce una superficie/velo extra en el conteo Fluid Glass sin necesidad; la sólida de D3 no cuenta. |
| A6 | Scrim con `backdrop-blur-sm` (como los otros tres modales) | Sería la **cuarta** superficie translúcida con el modal abierto y el scroll y rompería el límite 3/1 (DP-10, AC-11). |
| A7 | Extraer `crearOpcionesTrampa` a un helper compartido | Tocaría `AuthModal.jsx`, `DashboardUserModal.jsx` y sus suites: fuera de alcance (la 014 solo añade el componente nuevo y su cableado). Se duplica la función de 7 líneas. |
| A8 | Esc con `zIndex: 50` «como `AuthModal`» | El panel es `z-60`; declarar 50 dejaría a Esc cerrando la capa equivocada si en el futuro convivieran capas. Se alinea con el `z-60` del panel (D8). |
| A9 | Un único `estadoVisual` implícito sin prop | AC-07 exige renderizar `"conversacion"`; sin prop la variante no sería revisable ni asertable. |
| A10 | Comparar el `className` del disparador contra subcadenas sin `#` | AC-01 exige comparación **literal**; las subcadenas no probarían que el `className` no cambió. Se conserva el literal y el barrido de hexadecimales se acota a producción (D12). |

---

## 4. Archivos afectados

**Creados (3):**

| Archivo | Contenido | Tareas |
|---|---|---|
| `src/components/domain/modales/AsistenteAyuda.jsx` | Componente de diseño: scrim, panel, cabecera, estados, log, pie y cromo | T2–T6 |
| `src/components/domain/modales/AsistenteAyuda.test.jsx` | Suites de estructura, literales, ARIA, estados y cromo | T2–T6 |
| `src/pages/PaginaInicio.test.jsx` | Suite del disparador y de la integración (abre la ayuda, no el `AuthModal`) | T7 |

**Modificados (2):**

| Archivo | Cambio exacto | Tareas |
|---|---|---|
| `src/pages/PaginaInicio.jsx` | `useState` `ayudaAbierta` + `useRef` `triggerRef`; `manejarAbrirAyuda`/`manejarCerrarAyuda`; monta `<AsistenteAyuda abierto={ayudaAbierta} estadoVisual="vacio" alCerrar={manejarCerrarAyuda} triggerRef={triggerRef} />`; disparador: `ref={triggerRef}`, `aria-label="Abrir el asistente de ayuda"`, `onClick={manejarAbrirAyuda}` e icono `<BotMessageSquare size={20} aria-hidden="true" />`; import `BotMessageSquare`; **línea del `className` intacta**; cabecera JSDoc actualizada | T7 |
| `MEMORY.md` | Solo ruta/estado de §15 (`:27`, `:31`, `:41` + línea de referencia); hex **verbatim**; `:37` **intacto** | T10 |

**No se tocan:** `src/components/domain/modales/AuthModal.jsx` y `ModalTarjeta.jsx`;
`src/components/layout/*`; `src/components/ui/BotonCerrar.jsx`; `src/hooks/*`; `src/styles/index.css`
y `src/styles/index.css.test.js`; `src/layout/LandingLayout.jsx`; `src/App.jsx`;
`src/components/domain/modales/AuthModal.test.jsx`; `package.json`; `vitest.config`/`vitest.setup.js`;
`specs/013-calidad-css/*`; `specs/015-higiene-y-dobles/*`; `specs/016-*`; `index.html`;
`.agents/*`; `AGENTS.md`.

---

## 5. Orden por etapas (mapa a `tasks.md`)

| Etapa | Tareas | Resultado |
|---|---|---|
| 1 — Línea base y sondeo | T1 | Números de partida y referencias confirmadas |
| 2 — Componente y estados estáticos | T2, T3, T4, T5 | Panel, cabecera, vacío, conversación y pie sobre tokens |
| 3 — Disparador e integración con el cromo | T6, T7 | Las cuatro formas de cierre, foco y el robot que abre la ayuda |
| 4 — Accesibilidad, foco y contraste | T8 | Auditoría de fuente: hex, lógica, dependencias y specs cerradas |
| 5 — Validaciones manuales | T9 | M-14-1…M-14-7 registradas |
| 6 — Cierre y documentación | T10 | Suite y build verdes frente a la línea base; `MEMORY.md` al día |

---

## 6. Validación

### 6.1 Automatizada (Vitest + Testing Library)

| Bloque | Comando | Qué prueba |
|---|---|---|
| A — Estructura y literales | `npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx` | Panel/clases/scroll, cabecera, literales, `AC-04`, `AC-05` |
| B — Estados y log | idem | `AC-06`, `AC-07`, `AC-08` |
| C — Pie y ARIA | idem | `AC-03` (ARIA del diálogo), `AC-09` |
| D — Cromo | idem | `AC-02`, `AC-03` (trampa): `Tab` circular contenido en el panel, Esc con foco en el campo, «X», clic fuera, una acción = una llamada, retorno de foco, caso sin candidato |
| E — Disparador | `npx vitest run src/pages/PaginaInicio.test.jsx` | `AC-01`: icono, `aria-label`, `className`, ausencia de `aria-haspopup`/`aria-expanded`/`?`, abre la ayuda, no «Ventana de acceso», `fetch` no llamado |
| F — No regresión | `npm test` · `npm run build` | **518/518 en 33 archivos** (479 de la línea base + 39 nuevas); build verde |

**Casos nuevos previstos:** ≈22 en `AsistenteAyuda.test.jsx` y ≈5 en `PaginaInicio.test.jsx`
(≈27 en total). T10 compara **archivo por archivo** contra los 479/31 de la línea base, no solo el total;
resultado real: **39 nuevas (518/518 en 33)**.

**Roja-antes/verde-después:**

- **T2–T5:** cada suite se escribe **en la misma tarea** que el bloque que prueba; antes del bloque el
  archivo no compila/importa (rojo) y después pasa (verde). No hay ventana en que la suite quede roja
  entre tareas.
- **T6:** los casos de Esc/«X»/clic fuera/deslizar/retorno nacen rojos (la estructura no tiene cromo)
  y quedan verdes al añadir los tres hooks, la trampa y la guarda de clic.
- **T7:** `PaginaInicio.test.jsx` queda **rojo** al escribirlo (el `aria-label` sigue siendo
  `Ayuda y preguntas frecuentes` y el `onClick` abre el `AuthModal`) y **verde** con el cambio de
  `PaginaInicio.jsx`.
- **Regresión:** ninguna suite existente cambia de rojo a verde ni se edita (D10).

**Herramientas de prueba (sin tocar `vitest.setup.js`, CL-14):** `MemoryRouter` para rutas (regla del
proyecto); stub **local** de `IntersectionObserver` en `PaginaInicio.test.jsx` (patrón de
`src/layout/LandingLayout.test.jsx:26-29`); `vi.stubGlobal("fetch", vi.fn())` +
`vi.unstubAllGlobals()`; `vi.fn()` para `alCerrar`; `userEvent` para clic/teclado; punteros nativos
para el gesto (o `manual`, ver 6.2). **No** se simula `scrollIntoView` ni layout.

### 6.2 Manual (protocolo §9-P de la spec 013)

Toda medición declara **navegador y versión** (`navigator.userAgent`), **ancho CSS real**
(`window.innerWidth`), **preferencia verificada con `matchMedia(...).matches`** y los valores de
`getComputedStyle` por elemento. Navegador de partida: **Chromium ≥ 120** o **Firefox ≥ 121**; se
registra nombre y versión exactos. Tamaños: **320×812 · 375×812 · 1024×768 · 1440×900** y **zoom 200 %**.
Preferencias: **normal · `prefers-reduced-motion: reduce` · `prefers-reduced-transparency: reduce`**.

| ID | Qué | Tamaños / preferencia | Valor esperado | AC |
|---|---|---|---|---|
| **M-14-1** | Altura real y scroll | 320×812, 375×812, 1024×768, 1440×900; normal; zoom 200 % | Panel ≤ `85vh` (≤690 px a 375×812); **solo** el body scrollea; header y pie siempre visibles; sin desbordamiento horizontal | AC-04, CL-04, CL-08 |
| **M-14-2** | Contraste AA sobre fondo compuesto | 375×812 y 1440×900; normal | Panel compuesto (scrim `bg-bg-dark/70` + panel `bg-bg-cream/95`) ≈ `rgb(236,235,232)` sobre el hero y ≈ `rgb(239,238,234)` sobre las secciones crema; peor caso esperado: **slate/panel ≈5,0:1**, **esmeralda/crema ≈4,87:1**, **bg-dark/panel ≈15,8:1**; el scrim no tiene texto | AC-10, CL-13 |
| **M-14-3** | Teclado virtual en móvil | 375×812 en dispositivo o emulación | Con el campo enfocado, el pie y el aviso de reserva siguen alcanzables haciendo scroll del body; la estrategia de *visualViewport* queda **diferida** a la spec de comportamiento; registrar si el teclado tapa el campo | CL-06 |
| **M-14-4** | Fluid Glass | 1440×900 y 375×812, con y sin scroll del body | Sin modal: **1/1** en el tope y **2/1** con scroll; con modal: **2/1** y **3/1**; el scrim **no** tiene `backdrop-filter`; **sin blobs nuevos** | AC-11, DP-10 |
| **M-14-5** | Marca y nota visibles y persistentes | 375×812 y 1440×900, en `vacio` y `conversacion` | `Asistente de ayuda`, la marca y la nota visibles **sin scroll** en ambos estados y en ambos anchos | AC-05 |
| **M-14-6** | Gesto de deslizar | 375×812 (viewport táctil real) | Un arrastre vertical > 96 px sobre el panel cierra **una sola vez**; un arrastre que empieza en chip/input/**«X»** no cierra | AC-02, CL-05 |
| **M-14-7** *(opcional)* | M-3b del disparador | 640×900, 639×900, 375×812; normal | El disparador sigue en `blur(12px)`: `backdrop-blur-md` sin cambios. **No se re-mide** salvo constancia voluntaria | AC-01 (nota) |

**Contextos de contraste (transcripción):** fondo compuesto = `0,95 × #f7f6f2 + 0,05 × (0,70 ×
#0f1117 + 0,30 × fondo de la sección)`. Se registra **una fila por celda**: tamaño, preferencia,
esperado, obtenido y veredicto. Los ratios de M-14-2 son **cálculo del planner**, no mediciones.

---

## 7. Riesgos y mitigación

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Tocar sin querer el `className` del disparador e invalidar M-3b de la 013 | Baja | Alto | Solo se editan las líneas del `aria-label` y del `onClick`; el `className` de `PaginaInicio.jsx:55` no aparece en el diff (`git diff --unified=0`); AC-01 lo compara literal y M-14-7 lo constata de forma opcional |
| R2 | El scrim se implementa con `backdrop-blur` por copiar otro modal | Media | Alto | D2 fija `bg-bg-dark/70` sin filtro; AC-11 y M-14-4 lo cuentan y lo inspeccionan; texto del plan explícito |
| R3 | El panel scrollea completo y el pie se pierde | Media | Medio | DP-06/D2: `overflow-hidden` + `flex flex-col` en el panel, `min-h-0 flex-1 overflow-y-auto` solo en el body, `shrink-0` en header y pie; AC-04 y M-14-1 |
| R4 | El disparador nuevo altera el orden de foco de la landing y rompe `AuthModal.test.jsx:469-493` | Baja | Alto | El disparador ya existía y `children` van al final (`LandingLayout.jsx:51`): el logotipo sigue siendo el primer enfocable; `npm test` en T7 y T10 |
| R5 | Se añaden `aria-haspopup`/`aria-expanded` al disparador | Baja | Medio | D8/AC-01: solo icono, `aria-label`, `onClick` y `ref`; aserto explícito de ausencia |
| R6 | Se cuela un hexadecimal nuevo | Media | Medio | T8: `git diff --unified=0 -- '*.js' '*.jsx' ':(exclude)*.test.jsx' ':(exclude)*.test.js'` con las líneas `^+` revisadas (**solo producción**, D12); el archivo nuevo de producción se lee completo por no estar trackeado |
| R7 | El contraste real de la píldora o del texto secundario baja de 4,5:1 | Baja | Medio | D3 elige la píldora sólida (4,87:1) y `text-slate-text` sin alfa (≈5,0:1); si M-14-2 midiera < 4,5:1, el cambio es **solo de clases** a `bg-emerald-primary/10 text-bg-dark` (13,9:1) sin hexadecimales ni tokens |
| R8 | El teclado virtual tapa el campo | Media | Medio | CL-06/M-14-3: pie fijo + body con scroll; la estrategia de viewport está **diferida** por la spec (no se inventa aquí, D6) |
| R9 | El gesto de deslizar cierra al tocar un control | Baja | Bajo | `useDeslizarParaCerrar` no arranca sobre controles interactivos (`useDeslizarParaCerrar.js:16-18`); M-14-6 lo constata |
| R10 | La prueba del disparador arrastra el `#` del `className` al diff y colisiona con AC-10 | Baja | Bajo | **Resuelto (D12, decisión del usuario 2026-10-19):** el barrido excluye las suites, así que el literal heredado de `PaginaInicio.test.jsx` **no** se audita como hex nuevo y no hay falso positivo que declarar; AC-01 mantiene la comparación literal |
| R11 | Se toca `MEMORY.md` más allá de ruta/estado | Baja | Alto | T10 reproduce la tabla §15 palabra por palabra (hex **verbatim**), `:37` intacto y `git diff -- MEMORY.md` revisado |
| R12 | Se introduce lógica o dependencias sin querer | Baja | Alto | T8: `grep` de `fetch`/`api.config`/`onSubmit`/`onChange`/`useState`/`useReducer`/`localStorage`/`soporte@finapp.com` **en el componente nuevo**; `package.json` sin cambios |

---

## 8. Relación cambios ↔ requisitos funcionales

| RF | Requisito (resumen) | Cambio que lo cumple | Tarea | AC |
|---|---|---|---|---|
| **RF-01** | Disparador de robot: icono `BotMessageSquare`, `aria-label` literal, `className` y tamaño intactos, abre la ayuda | `PaginaInicio.jsx`: icono/label/onClick/ref | T7 | AC-01 |
| **RF-02** | Cuatro formas de cierre, una acción = una llamada, foco inicial en el panel y retorno al disparador | `useCierreConEsc` (60), clic fuera con guarda, `useDeslizarParaCerrar`, `useRetornoDeFoco` | T6 | AC-02 |
| **RF-03** | Diálogo accesible: rol, `aria-modal`, `aria-labelledby`, `aria-describedby`, «X» con nombre, trampa real | Panel ARIA + `BotonCerrar` (T2) + `FocusTrap` (T6) | T2, T6 | AC-03 |
| **RF-04** | Panel claro, centrado, `max-h-[85vh]`, un solo scroll, ancho `90vw max-w-md` | D2/D3 | T2, T3, T4, T5 | AC-04 |
| **RF-05** | Cabecera con título, marca y nota visibles sin scroll en ambos estados | D3 + `shrink-0` | T2 | AC-05 |
| **RF-06** | `TEXTO_VACIO`, cuatro sugerencias y `AVISO_RESERVA` | Vacío/chips (T3) + pie (T5) | T3, T5 | AC-06 |
| **RF-07** | Estado `conversacion`: `TEXTO_EJEMPLO` y cuatro burbujas con etiquetas `sr-only`, sin chips | D4, D7 | T4 | AC-07 |
| **RF-08** | `role="log"` solo con mensajes, `aria-live`, sin hijos en vacío | D5 | T3, T4 | AC-08 |
| **RF-09** | Chips, campo y «Enviar» presentacionales (`aria-disabled`, sin handlers ni estado) | D6 | T3, T5 | AC-06, AC-09 |
| **RF-10** | Todo el color nuevo con tokens; 0 hexadecimales nuevos; contraste AA | D3 (tokens) + T8 (diff) + M-14-2 | T2–T5, T8, T9 | AC-10 |
| **RF-11** | Presupuesto Fluid Glass 2/1 y 3/1; scrim sin filtro; sin blobs nuevos | D2 (scrim sin blur, panel única superficie) | T8, T9 | AC-11 |
| **RF-12** | Sin motor, guion, texto libre, estados, persistencia, IA, red ni dependencias | D7 + T8 | T8 | AC-12 |

**Cobertura de casos límite:** CL-04 y CL-06 en T2/T9; CL-05 y CL-10 en T6; CL-07 en T3/T5; CL-08 en
T9; CL-09 en T8/T9; CL-11 y CL-12 en T7; CL-13 en T9; CL-14 en T6; CL-15 en T5. **CL-01** es
transversal (T1) y **CL-02/CL-03** los cubren los estados de T3/T4.

---

## 9. Decisiones del usuario que cierran las preguntas del plan

**No hay preguntas abiertas.** Los dos puntos que el plan dejó abiertos los resolvió el usuario el
**2026-10-19**; el plan ya no declara falso positivo alguno.

- **Q1 — cerrada: el barrido de hexadecimales se acota a producción.** El `grep` de `#` se limita a
  `src/**/*.js` y `src/**/*.jsx` **excluyendo** `*.test.jsx` y `*.test.js` (D12), porque las suites
  copian **verbatim** el `className` heredado que AC-01 exige comparar **literalmente**; sin la
  exclusión el barrido daría un falso positivo garantizado. **AC-01 queda intacto** (la comparación
  literal del `className` sigue siendo obligatoria) y **AC-10 queda coherente** con él: ya no se
  contradicen. Reflejado en la spec (**RF-10**, **AC-10**, **§9**, **§12**), en **D12**, en **R10** y
  en **T8**.
- **Q2 — cerrada: la etiqueta `Tu pregunta` va `sr-only`.** Confirmado explícitamente en la spec
  (§4.1, §4.3 `LABEL_ENTRADA`, §4.4, RF-09, AC-09), en **D6** y en **T5**: label asociado por
  `for`/`id`, asertable con `getByLabelText("Tu pregunta")` y sin cambio de alcance.

**Observaciones (no requieren decisión):**

- `MEMORY.md:37` conserva la ruta obsoleta `specs/014/spec-ambiguedades.md`, pero la spec lo excluye
  expresamente (§15): es el registro de archivos ajenos sin commitear y **no se toca**.
- `.safe-bottom` queda sin uso en esta spec por diseño (D9): el panel está centrado y la spec §4.1
  fija `p-4`.

---

## 10. Cierre

- **Suite y build:** `npm test` y `npm run build` verdes frente a la línea base (479/479 en 31
  archivos); resultado final **518/518 en 33 archivos**; T10 compara archivo por archivo. Ninguna
  suite existente se edita.
- **`MEMORY.md`:** §15 aplicada entre `cfdd1af` y T10 (solo ruta/estado; hex verbatim; `:37`
  intacto); la fila `:27` queda como línea de referencia, sin añadir una línea nueva ni desplazar
  `:31`/`:41`.
- **Sin staging ni commit** desde el flujo de planificación; el commit lo decide el usuario tras las
  validaciones (regla de `AGENTS.md`).
- **Fuera de alcance declarado:** la lógica del asistente, el teclado virtual/`visualViewport` y la
  migración de hexadecimales quedan para specs futuras (spec §10, DP-04).
