# Tareas 014 — Diseño visual del asistente de ayuda de la landing

**Spec:** `specs/014-asistente-de-ayuda/spec.md` (aprobada 2026-10-19) · **Plan:**
`specs/014-asistente-de-ayuda/plan.md`
**Orden:** T1 → T10. Cada tarea deja la suite **en verde** y es verificable por separado.
**Reglas de ejecución:** leer `AGENTS.md`, `doc/constitution.md`, `.agents/rules/rules.md` y
`MEMORY.md` antes de empezar; **re-verificar cada `archivo:línea` antes de editar** (el usuario edita a
mano; CL-01/CL-12); no tocar `src/` fuera de lo que dice la tarea; **sin dependencias nuevas, sin
tokens nuevos, sin hexadecimales nuevos**; sin staging ni commit.
**Literales:** se copian **carácter a carácter** de la spec §4.3 (el `·` de la marca es U+00B7, los
`…` de `TEXTO_VACIO`/`PLACEHOLDER` son U+2026, y `¿…?` llevan signos de apertura).
**Manual:** toda medición sigue el protocolo §9-P de la 013 (navegador y versión, ancho CSS real,
preferencia verificada con `matchMedia`, valores de `getComputedStyle`, veredicto por celda).
**Decisiones del usuario (2026-10-19):** el barrido de `#` se **acota a producción** (excluye las
suites, D12 de `plan.md`) y la etiqueta `Tu pregunta` va **`sr-only`**. Afectan a T8 y T5; **ya no hay
ratificaciones pendientes**.

---

## T1 — Línea base y sondeo de referencias

**Etapa 1 · Depende de:** nada.
**Alcance:** medir la línea base y re-verificar todas las referencias del plan antes de tocar código.
Sin cambios de archivos.
**Comandos**

```bash
git rev-parse --short HEAD
npm test                 # esperado: 479/479 en 31 archivos
npm run build            # esperado: verde
```

**Sondeo (registrar el resultado de cada punto; el que ya no exista se marca «ya no aplicable»):**

| # | Referencia | Qué se comprueba |
|---|---|---|
| 1 | `src/pages/PaginaInicio.jsx:51-58` | El disparador sigue siendo el `<button type="button">` flotante; `:53` `aria-label="Ayuda y preguntas frecuentes"`, `:54` `onClick={() => manejarAbrirAuth("login")}`, `:55` el `className` heredado con `backdrop-blur-md`; `:57` el glifo `?` |
| 2 | `src/pages/PaginaInicio.jsx:24-25`, `:44-48` | `useState` (`modalAbierto`/`modoAuth`) y el `AuthModal` montado |
| 3 | `grep -rn "Ayuda y preguntas frecuentes\|preguntas frecuentes" src` | Debe seguir apareciendo **solo** en `PaginaInicio.jsx:53` (ninguna suite lo asierta) |
| 4 | `src/components/domain/modales/AuthModal.jsx:29-36`, `:52-54`, `:78`, `:132-146` | `crearOpcionesTrampa`, firma de props, `if (!abierto) return null`, overlay + `FocusTrap` + panel |
| 5 | `src/components/layout/DashboardUserModal.jsx:33-40`, `:60`, `:65-66`, `:69`, `:76` | `crearOpcionesTrampa`, firma, `useCierreConEsc` con `zIndex: 60`, `useDeslizarParaCerrar`, `useRetornoDeFoco` |
| 6 | `src/hooks/useRetornoDeFoco.js:88`, `:94`; `src/hooks/useCierreConEsc.js:3`; `src/hooks/useDeslizarParaCerrar.js:3`, `:13`, `:16-18` | Firmas vigentes; sin candidato **no** hay `focus()`; umbral 96 px |
| 7 | `src/components/ui/BotonCerrar.jsx:22-30` | Firma `{ ariaLabel, alCerrar, className }` |
| 8 | `src/styles/index.css:79-82`, `:34-36`, `:11-31` | `.glass-surface`, `.safe-bottom`, tokens de color y `--radius-glass` |
| 9 | `src/layout/LandingLayout.jsx:51` | `children` se renderizan al final (el logotipo sigue siendo el primer enfocable) |
| 10 | `src/components/domain/modales/AuthModal.test.jsx:469-493` | Caso que exige logotipo = primer enfocable (guardia de no regresión) |
| 11 | `node_modules/lucide-react/dist/lucide-react.d.ts` | `BotMessageSquare` exportado; `package.json:19` mantiene `lucide-react ^0.454.0` |
| 12 | `vitest.setup.js:73-91` · `src/layout/LandingLayout.test.jsx:26-29` | Stub de geometría (trampa real en jsdom) y patrón de stub de `IntersectionObserver` |

**Cubre:** soporte de DP-12/CL-14; sin requisito propio.
**Hecho cuando:** la línea base (commit, número de casos, archivos y estado del build) está
registrada; los 12 puntos del sondeo tienen veredicto y los que ya no apliquen están marcados «ya no
aplicable» sin recrearse; **no se ha editado ningún archivo**.

---

## T2 — Componente `AsistenteAyuda`: scrim, panel, cabecera y ARIA del diálogo

**Etapa 2 · Depende de:** T1.
**Alcance:** crear el componente de diseño con el estado por defecto y solo la estructura
(scrim + panel + cabecera). Sin cuerpo, sin pie y sin cromo todavía.
**Archivos:** **crear** `src/components/domain/modales/AsistenteAyuda.jsx` y
`src/components/domain/modales/AsistenteAyuda.test.jsx`.

**Esqueleto del componente**

```jsx
/**
 * @uso        Superficie modal de diseño del asistente de ayuda de la landing (solo diseño, spec 014)
 * @funciones  AsistenteAyuda({ abierto, estadoVisual, alCerrar, triggerRef })
 * @datos      Literales fijos de la spec 014 §4.3 y la conversación de muestra (estática); sin datos externos
 * @eventos    Sin eventos propios de lógica; cierra por «X», Esc, clic fuera y deslizar (cromo 010/011)
 * @estados    Ninguno propio: `estadoVisual` es una prop presentacional ('vacio' | 'conversacion')
 * @usadoPor   PaginaInicio
 */
import { useRef } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";

const TITULO = "Asistente de ayuda";
const MARCA_DEMO = "Demostración · No es una IA real";
const NOTA_DISENO = "Vista de diseño: contenido de ejemplo; aún no responde preguntas.";
const AVISO_RESERVA = "Cuando la ayuda esté activa, si tu pregunta no coincide verás una respuesta de reserva.";
const TEXTO_VACIO = "Aún no hay mensajes. Cuando la ayuda esté activa, podrás elegir una sugerencia o escribir una pregunta.";
const TEXTO_EJEMPLO = "Conversación de ejemplo";
const SUGERENCIAS = ["¿Cómo entro al panel?", "¿Dónde veo mis tarjetas?", "¿Se guardan mis datos?", "¿Cómo salgo del demo?"];
const ARIA_CERRAR = "Cerrar asistente de ayuda";
const ARIA_LOG = "Mensajes del asistente";
const LABEL_ENTRADA = "Tu pregunta";
const PLACEHOLDER = "Escribe una pregunta…";
const BOTON_ENVIAR = "Enviar";

function crearOpcionesTrampa(refPanel) { /* idéntico a AuthModal.jsx:29-36 */ }

export default function AsistenteAyuda({ abierto, estadoVisual = "vacio", alCerrar, triggerRef }) {
  const panelRef = useRef(null);
  if (!abierto) return null;
  /* …scrim + FocusTrap + panel + header… */
}
```

**Markup de esta tarea** (clases exactas, ver plan §2-D2/D3):

```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/70"
     onClick={manejarClicExterior}>
  <FocusTrap focusTrapOptions={crearOpcionesTrampa(panelRef)}>
    <div ref={panelRef} role="dialog" aria-modal="true"
         aria-labelledby="asistente-titulo"
         aria-describedby="asistente-marca asistente-nota asistente-reserva"
         tabIndex={-1}
         className="relative z-60 w-[90vw] max-w-md max-h-[85vh] overflow-hidden outline-none bg-bg-cream/95 glass-surface border border-border-line/30 rounded-3xl shadow-xl flex flex-col">
      <header className="shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-border-line/30">
        {/* título + píldora de marca + nota + «X» */}
      </header>
      {/* cuerpo y pie: T3, T4 y T5 */}
    </div>
  </FocusTrap>
</div>
```

`manejarClicExterior` con la guarda `if (evento.target === evento.currentTarget) alCerrar();`
(patrón `AuthModal.jsx:80-85`). La «X» usa `BotonCerrar` con
`ariaLabel="Cerrar asistente de ayuda"` y `className="shrink-0 text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"`.
**No** se pone `aria-hidden` en el scrim (contiene al diálogo) y **no** se añade
`backdrop-blur`/`backdrop-filter`.

**Cubre:** RF-03 (diálogo: rol, `aria-modal`, `aria-labelledby`, `aria-describedby`, «X»), RF-04
(panel, centrado, clases y alto), RF-05 (título, marca y nota) · AC-03 (parte ARIA + «X»), AC-04,
AC-05 · CL-04, CL-09 · DP-02, DP-06, DP-10, DP-11.
**Prueba (roja-antes/verde-después):** el archivo de pruebas se crea en esta tarea y no compila antes
del componente (rojo); después pasa. Asertos: `getByRole("dialog", { name: "Asistente de ayuda" })`;
`aria-modal`; `aria-labelledby`/`aria-describedby` con los tres ids; `getByRole("heading", { name:
"Asistente de ayuda" })`; `getByText` de `MARCA_DEMO` y `NOTA_DISENO`; `getByRole("button", { name:
"Cerrar asistente de ayuda" })`; clases del panel y del scrim por `className` (incluido que el scrim
**no** contenga `backdrop-blur`); `getAllByText(/IA/)` con longitud 1 y contenida en la marca; ausencia
de `/inteligencia artificial/`, `/modelo de lenguaje/`, `/aprendo/`, `/entiendo/` y
`/asistente inteligente/`; la marca está fuera del contenedor con `overflow-y-auto`. Se renderiza
**solo** `AsistenteAyuda` (no la landing) para que el conteo de «IA» no capture otros textos.
**Comandos:** `npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx`
**Hecho cuando:** el componente existe con la cabecera, el diálogo accesible y el panel con las clases
de la spec; los asertos de T2 pasan; el scrim no tiene filtro; no hay ningún `#` en el archivo nuevo.

---

## T3 — Estado vacío: `TEXTO_VACIO`, sugerencias y chips

**Etapa 2 · Depende de:** T2.
**Alcance:** añadir el cuerpo del estado `"vacio"` (por defecto): aviso, cuatro chips
presentacionales y el **log vacío** (existe desde la apertura y queda sin hijos).
**Archivos:** `src/components/domain/modales/AsistenteAyuda.jsx`,
`src/components/domain/modales/AsistenteAyuda.test.jsx`.

**Markup**

```jsx
<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
  {estadoVisual === "vacio" && (
    <>
      <p className="text-sm text-slate-text">{TEXTO_VACIO}</p>
      <div className="flex flex-wrap gap-2">
        {SUGERENCIAS.map((sugerencia) => (
          <button key={sugerencia} type="button" aria-disabled="true"
                  className="rounded-full border border-border-line/60 bg-bg-cream px-3 py-1.5 text-left text-xs text-bg-dark">
            {sugerencia}
          </button>
        ))}
      </div>
    </>
  )}
  <div role="log" aria-live="polite" aria-relevant="additions" aria-atomic="false"
       aria-label="Mensajes del asistente" className="flex flex-col gap-3">
    {/* T4 añade aquí las burbujas solo en 'conversacion' */}
  </div>
</div>
```

**Cubre:** RF-06 (texto de vacío y cuatro sugerencias), RF-08 (log presente y sin hijos), RF-09 (chips
`aria-disabled` sin handlers) · AC-06 (parte `TEXTO_VACIO` + chips), AC-08 (parte vacío) · CL-07 ·
DP-05, DP-08, DP-09.
**Prueba (roja-antes/verde-después):** los asertos nuevos de T3 fallan antes del bloque (no hay
`TEXTO_VACIO` ni chips) y pasan después. Asertos: `getByText(TEXTO_VACIO)`; los cuatro
`getByRole("button", { name: <cada SUGERENCIA> })` con `aria-disabled="true"`; `getByRole("log")` con
sus cuatro atributos; `expect(log.childElementCount).toBe(0)`; `within(log).queryByText(TEXTO_VACIO)`
ausente; `within(log).queryByRole("button", { name: <cada SUGERENCIA> })` ausentes (**por rol y
nombre**, no por `queryByText`); `fireEvent.click` sobre cada chip y aserto de que
`log.childElementCount` sigue en 0.
**Comandos:** `npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx`
**Hecho cuando:** en `vacio`, el log existe vacío y `TEXTO_VACIO` y los cuatro chips quedan **fuera**
de él; los chips no ejecutan nada al pulsarlos; los asertos de T2 siguen verdes.

---

## T4 — Estado conversación: `TEXTO_EJEMPLO` y burbujas

**Etapa 2 · Depende de:** T3.
**Alcance:** añadir la variante `estadoVisual="conversacion"`: `TEXTO_EJEMPLO` fuera del log y las
cuatro burbujas **dentro** del log, con etiqueta de remitente `sr-only`. Sin chips en este estado.
**Archivos:** `src/components/domain/modales/AsistenteAyuda.jsx`,
`src/components/domain/modales/AsistenteAyuda.test.jsx`.

**Datos y markup**

```jsx
const CONVERSACION = [
  { remitente: "tu", texto: "¿Cómo entro al panel?" },
  { remitente: "asistente", texto: "En esta demo el panel se abre directamente desde la portada. Dentro, la barra lateral te permite ir a Inicio, Transacciones y Tarjetas." },
  { remitente: "tu", texto: "¿Se guardan mis datos?" },
  { remitente: "asistente", texto: "Esta es una demostración: no hay backend ni datos financieros reales. Las cifras y las tarjetas que ves son de ejemplo." },
];
```

- `{estadoVisual === "conversacion" && <p className="text-xs font-medium uppercase tracking-wider text-slate-text">{TEXTO_EJEMPLO}</p>}` **antes** del log.
- Dentro del log: `{estadoVisual === "conversacion" && CONVERSACION.map(({ remitente, texto }, i) => (…))}`.
- Contenedor y burbuja (plan §2-D4):

```jsx
<div key={i} className={remitente === "tu" ? "flex justify-end" : "flex justify-start"}>
  <p className={remitente === "tu"
    ? "max-w-[85%] rounded-2xl rounded-br-md bg-emerald-primary px-3.5 py-2.5 text-sm text-bg-cream"
    : "max-w-[85%] rounded-2xl rounded-bl-md border border-border-line/40 bg-bg-cream px-3.5 py-2.5 text-sm text-bg-dark"}>
    <span className="sr-only">{remitente === "tu" ? "Tú" : "Asistente"}</span> {texto}
  </p>
</div>
```

**Cubre:** RF-07 (estado conversación), RF-08 (log solo con mensajes) · AC-07, AC-08 · CL-02, CL-03 ·
DP-07.
**Prueba (roja-antes/verde-después):** con `estadoVisual="conversacion"` los asertos fallan antes del
bloque y pasan después. Asertos: `getByText(TEXTO_EJEMPLO)` **fuera** del log
(`within(log).queryByText(TEXTO_EJEMPLO)` ausente); los cuatro textos de burbuja presentes y los
cuatro también `within(log)`; **orden DOM** de las cuatro burbujas con `compareDocumentPosition`
(`& Node.DOCUMENT_POSITION_FOLLOWING`); etiquetas: `const etiquetasTu = getAllByText("Tú")`,
`expect(etiquetasTu).toHaveLength(2)` y `forEach((nodo) => expect(nodo).toHaveClass("sr-only"))`, e
igual para `"Asistente"`; **ausencia de chips por rol y nombre** (los cuatro
`queryByRole("button", { name: <cada SUGERENCIA> })` ausentes; **no** usar `queryByText`: dos burbujas
repiten literalmente `SUGERENCIAS[0]` y `SUGERENCIAS[2]`); ausencia de control de cambio de estado
(no hay botón/gesto/temporizador que altere `estadoVisual`).
**Comandos:** `npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx`
**Hecho cuando:** `conversacion` muestra `TEXTO_EJEMPLO` fuera del log y exactamente cuatro burbujas
dentro, con dos etiquetas `Tú` y dos `Asistente` en `span.sr-only`, sin chips; los asertos de T2/T3
siguen verdes.

---

## T5 — Pie: aviso de reserva, campo y botón «Enviar» presentacionales

**Etapa 2 · Depende de:** T4.
**Alcance:** añadir el pie con `AVISO_RESERVA`, la etiqueta, el campo editable sin estado y el botón
«Enviar» sin handler. Ni `<form>` ni envío.
**Archivos:** `src/components/domain/modales/AsistenteAyuda.jsx`,
`src/components/domain/modales/AsistenteAyuda.test.jsx`.

**Markup**

```jsx
<footer className="shrink-0 px-5 py-4 border-t border-border-line/30 flex flex-col gap-2">
  <p id="asistente-reserva" className="text-xs text-slate-text">{AVISO_RESERVA}</p>
  <div className="flex items-center gap-2">
    <label htmlFor="asistente-entrada" className="sr-only">{LABEL_ENTRADA}</label>
    <input id="asistente-entrada" type="text" placeholder={PLACEHOLDER}
           className="min-w-0 flex-1 rounded-xl border border-border-line/60 bg-bg-cream px-3 py-2 text-sm text-bg-dark placeholder:text-slate-text outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" />
    <button type="button" aria-disabled="true"
            className="shrink-0 rounded-xl bg-emerald-primary px-4 py-2 text-sm font-medium text-bg-cream">
      {BOTON_ENVIAR}
    </button>
  </div>
</footer>
```

El `<input>` va **sin `value` y sin `onChange`** (no controlado, editable) y el botón **sin `onClick`**;
no se usa `<form>`. **Decisión del usuario (2026-10-19):** el `label` va **`sr-only`**, asociado por
`for`/`id` (confirmado en la spec §4.1/§4.4/RF-09/AC-09 y en el plan D6), sin cambio de alcance.
**Cubre:** RF-06 (`AVISO_RESERVA` en el pie), RF-09 (campo y «Enviar» presentacionales) · AC-06 (parte
aviso), AC-09 · CL-06, CL-07, CL-15 · DP-08, DP-09.
**Prueba (roja-antes/verde-después):** los asertos nuevos fallan antes del pie y pasan después.
Asertos: `getByText(AVISO_RESERVA)`; `getByLabelText("Tu pregunta")`; el input tiene el `placeholder`
y **no** recibe `value` controlado; `getByRole("button", { name: "Enviar" })` con
`aria-disabled="true"`; `querySelector("form")` ausente; `userEvent.type` sobre el campo y aserto de
que el log sigue con 0 hijos; `grep -n "onChange\|value=\|useState\|useReducer\|setMensajes"` **en
`AsistenteAyuda.jsx`** sin coincidencias.
**Comandos:** `npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx` y
`grep -n "onChange\|value=\|onSubmit\|useState\|useReducer\|fetch\|localStorage\|soporte@finapp.com" src/components/domain/modales/AsistenteAyuda.jsx`
**Manual (M-14-3):** en 375×812 con teclado virtual, enfocar el campo y comprobar que el pie y el
aviso siguen alcanzables con el scroll del body. **Hecho cuando:** el pie está completo, escribir no
genera mensajes ni estado, no hay `<form>` ni handler de envío, y el `grep` no devuelve coincidencias.

---

## T6 — Cromo modal: trampa, Esc, clic fuera, deslizar y retorno de foco

**Etapa 3 · Depende de:** T5.
**Alcance:** dotar a la superficie del cromo congelado de 010/011 reutilizando las piezas comunes.
**Archivos:** `src/components/domain/modales/AsistenteAyuda.jsx`,
`src/components/domain/modales/AsistenteAyuda.test.jsx`.

**Cambios**

1. Importar y usar los tres hooks, **antes** del `if (!abierto) return null`:

   ```jsx
   useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar });
   useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });
   useRetornoDeFoco({ activo: abierto, triggerRef });
   ```

2. `FocusTrap` ya está en T2 con `crearOpcionesTrampa(panelRef)` (foco inicial en el panel,
   `escapeDeactivates: false`, `allowOutsideClick: true`, `returnFocusOnDeactivate: false`).
3. La guarda de clic fuera y la «X» ya están en T2; aquí se **verifican** contra los cuatro cierres.
4. **No** se añade `aria-haspopup`/`aria-expanded` en ningún control.

**Cubre:** RF-02 (cuatro formas de cierre, una acción = una llamada, foco inicial y retorno), RF-03
(trampa real) · AC-02, AC-03 (parte trampa) · CL-05, CL-10, CL-14 · DP-12.
**Prueba (roja-antes/verde-después):** los casos nacen rojos (la superficie no cierra ni devuelve el
foco) y quedan verdes al añadir los hooks.

- **Cierre:** «X» (`getByRole("button", { name: "Cerrar asistente de ayuda" })`), Esc, clic en el
  scrim (`mouseDown`/`click` sobre el scrim) y clic **dentro** del panel (no cierra); cada uno con
  `expect(alCerrar).toHaveBeenCalledTimes(1)`.
- **Esc con el foco en el campo:** enfocar `asistente-entrada`, `keyboard("{Escape}")` y aserto de
  una sola llamada.
- **Foco inicial:** `await waitFor(() => expect(document.activeElement).toBe(panel))` con
  `getByRole("dialog")`.
- **Retorno:** arnés con un `<button>` + `triggerRef`; abrir, cerrar y
  `await waitFor(() => expect(document.activeElement).toBe(disparador))`.
- **Sin candidato:** sin `triggerRef` y sin otros enfocables fuera del diálogo, cerrar **no** llama a
  `focus()` sobre `body` (`vi.spyOn(document.body, "focus")`) y no lanza (CL-10,
  `useRetornoDeFoco.js:88`).
- **Gesto:** en `useDeslizarParaCerrar` la simulación de punteros en jsdom no es fiel → el gesto queda
  en **manual (M-14-6)**; en jsdom solo se asierta que el cierre por «X»/Esc/clic fuera funciona.

**Comandos:** `npx vitest run src/components/domain/modales/AsistenteAyuda.test.jsx`
**Manual (M-14-6):** en 375×812 táctil, un arrastre vertical > 96 px sobre el panel cierra una sola
vez; un arrastre que empieza sobre un chip, el campo o la «X» **no** cierra.
**Hecho cuando:** las cuatro formas de cierre están operativas con una sola llamada cada una, el foco
inicial va al panel, el retorno devuelve el foco al disparador y sin candidato no se fuerza `body`;
`focus-trap-react` se ejecuta real (sin mock) y `vitest.setup.js` no se toca.

---

## T7 — Disparador de robot e integración en `PaginaInicio`

**Etapa 3 · Depende de:** T6.
**Alcance:** convertir el disparador en la entrada del asistente y montar el modal con
`estadoVisual="vacio"`. **Solo** se editan el `aria-label`, el `onClick`, el `ref`, el icono y el
estado nuevo; el `className` de `PaginaInicio.jsx:55` **no cambia**.
**Archivos:** `src/pages/PaginaInicio.jsx`; **crear** `src/pages/PaginaInicio.test.jsx`.

**Cambios en `PaginaInicio.jsx`**

1. Imports: `import { useRef, useState } from "react";`,
   `import { BotMessageSquare } from "lucide-react";`,
   `import AsistenteAyuda from "../components/domain/modales/AsistenteAyuda";`.
2. Estado y ref: `const [ayudaAbierta, setAyudaAbierta] = useState(false);` y
   `const triggerRef = useRef(null);`; `manejarAbrirAyuda` / `manejarCerrarAyuda`. El
   `manejarAbrirAuth`/`manejarCerrarAuth` y el `AuthModal` (`:44-48`) **se conservan**.
3. Montaje (hermano del `AuthModal`):

   ```jsx
   <AsistenteAyuda abierto={ayudaAbierta} estadoVisual="vacio"
                   alCerrar={manejarCerrarAyuda} triggerRef={triggerRef} />
   ```

4. Disparador (la línea del `className` **no se toca**):

   ```jsx
   <button
     ref={triggerRef}
     type="button"
     aria-label="Abrir el asistente de ayuda"
     onClick={manejarAbrirAyuda}
     className="…"   {/* ← idéntico a hoy */}
   >
     <BotMessageSquare size={20} aria-hidden="true" />
   </button>
   ```

5. Actualizar la cabecera JSDoc de la página (`@eventos`/`@estados`) para reflejar la ayuda y el nuevo
   estado. **No** añadir `aria-haspopup`/`aria-expanded`.

**`src/pages/PaginaInicio.test.jsx`:** `render(<MemoryRouter initialEntries={["/"]}><PaginaInicio /></MemoryRouter>)`,
stub local de `IntersectionObserver` (patrón `LandingLayout.test.jsx:26-29`) y
`vi.stubGlobal("fetch", vi.fn())` + `vi.unstubAllGlobals()` en `afterEach`.

**Cubre:** RF-01 · AC-01 · CL-11, CL-12 · DP-02, DP-05.
**Prueba (roja-antes/verde-después):** la suite queda **roja** al escribirla (el botón sigue siendo
`Ayuda y preguntas frecuentes` y abre «Ventana de acceso») y **verde** con el cambio de
`PaginaInicio.jsx`. Asertos: `getByRole("button", { name: "Abrir el asistente de ayuda" })`;
`queryByRole("button", { name: "Ayuda y preguntas frecuentes" })` ausente;
`disparador.querySelector("svg")` con `width`/`height` 20 y `aria-hidden="true"` (**no**
`within(...).querySelector`, que no existe); `within(disparador).queryByText("?")` ausente; el
`className` del disparador comparado **literalmente** con el valor heredado; `aria-haspopup` y
`aria-expanded` ausentes; `await userEvent.click(disparador)` y
`getByRole("dialog", { name: "Asistente de ayuda" })` presente;
`queryByRole("dialog", { name: "Ventana de acceso" })` ausente; espía de `fetch` sin llamadas;
`within(disparador).queryByRole("button")` no aplica (el disparador no anida botones).
**Comandos:** `npx vitest run src/pages/PaginaInicio.test.jsx src/components/domain/modales/AuthModal.test.jsx`
(la segunda es la guardia de no regresión de foco de la landing).
**Hecho cuando:** el robot abre el asistente y no el `AuthModal`; el `className` del disparador es
byte a byte el de hoy (no aparece en `git diff --unified=0 -- src/pages/PaginaInicio.jsx`); no hay
`aria-haspopup`/`aria-expanded` ni glifo `?`; `fetch` no se llama; `AuthModal.test.jsx` sigue verde.

---

## T8 — Auditoría de fuente: hexadecimales, lógica, dependencias y specs cerradas

**Etapa 4 · Depende de:** T7.
**Alcance:** verificación de fuente (sin cambios funcionales). Si aparece un hallazgo, se corrige en la
tarea que corresponda y se re-ejecuta.
**Archivos:** ninguno (solo lectura y comandos).

**Comandos y criterios**

| # | Comando | Criterio |
|---|---|---|
| 1 | `git status --porcelain` | Solo los 3 archivos nuevos y `src/pages/PaginaInicio.jsx`; nada más |
| 2 | `git diff --unified=0 -- '*.js' '*.jsx' ':(exclude)*.test.jsx' ':(exclude)*.test.js' \| grep '^+' \| grep -v '^+++' \| grep '#'` | **0** coincidencias (barrido **solo de producción**, D12); el `className` heredado del disparador **no** aparece en el diff |
| 3 | `git add -N src/components/domain/modales/AsistenteAyuda.jsx` y repetir el punto 2 leyendo además el componente completo | **0** `#` en `AsistenteAyuda.jsx`; las suites quedan **fuera** del barrido y **no** se auditan por hex (el literal del `className` heredado de `PaginaInicio.test.jsx` no genera falso positivo) |
| 4 | `grep -n "fetch\|api.config\|onSubmit\|onChange\|useState\|useReducer\|localStorage\|soporte@finapp.com" src/components/domain/modales/AsistenteAyuda.jsx` | **0** coincidencias (AC-12; el `useState` de apertura vive en `PaginaInicio`) |
| 5 | `git diff --stat -- package.json src/styles/index.css src/styles/index.css.test.js` | Vacío: sin dependencias ni tokens |
| 6 | `git diff --stat -- specs/013-calidad-css/spec.md specs/015-higiene-y-dobles/spec.md src/components/domain/modales/AuthModal.jsx src/components/layout/DashboardUserModal.jsx src/hooks src/components/ui/BotonCerrar.jsx vitest.setup.js` | Vacío: 013/015 cerradas y cromo intactos |
| 7 | Inspección del código | `estadoVisual` solo cambia por prop; sin motor, guion, texto libre procesado, máquina de estados ni persistencia; `BotonCerrar` reutilizado |
| 8 | `grep -n "backdrop-blur" src/components/domain/modales/AsistenteAyuda.jsx` | **0** coincidencias (scrim sin filtro) |

**Cubre:** RF-10 (parte de fuente), RF-11 (parte de fuente), RF-12 · AC-10 (parte de fuente), AC-11
(parte de fuente), AC-12 · CL-09 · DP-04, DP-13.
**Prueba:** verificación de fuente (no hay aserto nuevo de Vitest).
**Hecho cuando:** los ocho puntos tienen veredicto; los puntos 2, 5, 6 y 8 dan **0**/vacío; el punto 4
da 0; el punto 3 da **0** `#` en el componente de producción y **ninguna** suite se audita por hex
(el barrido acotado de D12 evita el falso positivo del `className` heredado).

---

## T9 — Validación manual en navegador

**Etapa 5 · Depende de:** T8.
**Alcance:** medir en navegador lo que jsdom no puede. **Sin cambios de código** salvo que una medición
lo exija (entonces se corrige en su tarea y se repite).
**Archivos:** ninguno.

**Protocolo:** navegador **Chromium ≥ 120** o **Firefox ≥ 121** (registrar `navigator.userAgent` y
versión), ancho CSS real (`window.innerWidth`), preferencia verificada con `matchMedia(...).matches` y
valores de `getComputedStyle` por elemento; una fila por celda con esperado/obtenido/veredicto.

**Celdas (plan §6.2):**

| ID | Tamaños / preferencia | Qué se registra |
|---|---|---|
| **M-14-1** | 320×812, 375×812, 1024×768, 1440×900; normal; zoom 200 % | Alto real del panel (≤ 690 px a 375×812), `overflow-y-auto` **solo** en el body, header y pie visibles siempre, sin desbordamiento horizontal |
| **M-14-2** | 375×812 y 1440×900; normal | `backgroundColor` compuesto del panel y `color` del texto; ratios: slate/panel ≈ 5,0:1, esmeralda/crema ≈ 4,87:1, bg-dark/panel ≈ 15,8:1; el scrim no lleva texto |
| **M-14-3** | 375×812 en dispositivo/emulación | Teclado virtual: pie y aviso alcanzables con scroll del body; se registrará si el teclado tapa el campo (estrategia diferida, CL-06) |
| **M-14-4** | 1440×900 y 375×812, con y sin scroll | Superficies/blobs: sin modal 1/1 (tope) y 2/1 (scroll); con modal 2/1 y **3/1**; `backdropFilter` del scrim = `none`; sin blobs nuevos |
| **M-14-5** | 375×812 y 1440×900, en `vacio` y `conversacion` | Título, marca y nota visibles **sin scroll** en ambos estados |
| **M-14-6** | 375×812 táctil | Un arrastre > 96 px sobre el panel cierra una vez; sobre chip/campo/«X» no cierra |
| **M-14-7** *(opcional)* | 640×900, 639×900, 375×812; normal | `getComputedStyle(disparador).backdropFilter` = `blur(12px)` (M-3b); **no se re-mide** salvo constancia voluntaria |

**Cubre:** RF-04, RF-05, RF-10, RF-11 (partes manuales) · AC-02 (gesto), AC-04, AC-05, AC-10
(contraste), AC-11 · CL-04, CL-06, CL-08, CL-09, CL-13 · DP-10.
**Hecho cuando:** M-14-1…M-14-6 están registradas con veredicto por celda; M-14-7 queda como no
realizada si no se constata; cualquier celda en rojo abre una corrección en su tarea y se repite la
medición.

---

## T10 — Cierre: suite, build y `MEMORY.md`

**Etapa 6 · Depende de:** T9.
**Alcance:** cierre del cambio con la suite completa, el build y la corrección autorizada de
`MEMORY.md` (§15). Solo ruta y estado; el texto de hexadecimales sobrevive **verbatim**.
**Archivos:** `MEMORY.md`.

**Comandos**

```bash
npm test          # 479 existentes + las nuevas (comparar archivo por archivo con la línea base)
npm run build     # verde
git diff --stat
```

**Correcciones en `MEMORY.md` (spec §15; localizar por contenido, no por número):**

| Línea (hoy) | Acción | Resultado |
|---|---|---|
| `:27` | Corregir **ruta y estado** | ``- `specs/014-asistente-de-ayuda/spec-ambiguedades.md` — en revisión (solo diseño): botón «?» de `PaginaInicio`, «Usuario» del Header del dashboard, hex de JSX → tokens.`` |
| `:31` | Corregir **estado** | ``- **Spec 014:** en revisión (solo diseño); botón «?» de `PaginaInicio`, «Usuario» del Header en modo dashboard, migración de hex de JSX a tokens: 72 clases en 10 archivos.`` |
| `:41` | Corregir **estado** | ``- **Spec 014 — en revisión (solo diseño):** intención del botón «?» de `PaginaInicio`, propósito del «Usuario» del Header en modo dashboard, y si se migran los hex de JSX a tokens.`` |
| `:37` | **No se toca** | El registro «Sin commitear (ajenos)» queda intacto aunque contenga la ruta obsoleta |
| — | **Añadir** la línea de referencia final, tras el `:27` corregido | ``- `specs/014-asistente-de-ayuda/spec.md` — en revisión (solo diseño).`` |

Las palabras sobre hex (`hex de JSX → tokens`, `migración de hex de JSX a tokens: 72 clases en 10
archivos`) se conservan **carácter a carácter**. Al insertar la línea nueva, las antiguas `:31` y
`:41` pasan a `:32` y `:42`.

**Cubre:** no regresión y §15 · AC-12 (parte `MEMORY.md` y specs cerradas) · CL-01, CL-12 · DP-04,
DP-13.
**Prueba:** `npm test` y `npm run build` verdes; recuento comparado **archivo por archivo** con la
línea base de T1; `git diff -- MEMORY.md` limitado a las cuatro filas de la tabla (ruta/estado en
`:27`, `:31`, `:41` + línea de referencia), con el hex **verbatim** y `:37` sin hunk.
**Hecho cuando:** `npm test` y `npm run build` pasan frente a la línea base; ninguna suite existente
está editada (`git diff --stat` no las lista); `granularidad` de `MEMORY.md` coincide con la tabla
§15; no se ha hecho staging ni commit.

---

## Resumen

| # | Tarea | Etapa | Validación |
|---|---|---|---|
| T1 | Línea base y sondeo de referencias | 1 | Automática (medición) + fuente |
| T2 | Componente: scrim, panel, cabecera y ARIA del diálogo | 2 | Automática |
| T3 | Estado vacío: aviso, sugerencias y chips | 2 | Automática |
| T4 | Estado conversación: `TEXTO_EJEMPLO` y burbujas | 2 | Automática |
| T5 | Pie: aviso de reserva, campo y «Enviar» | 2 | Automática + manual (teclado virtual) |
| T6 | Cromo: trampa, Esc, clic fuera, deslizar y retorno de foco | 3 | Automática + manual (gesto) |
| T7 | Disparador de robot e integración en `PaginaInicio` | 3 | Automática + fuente |
| T8 | Auditoría de fuente: hex, lógica, dependencias y specs cerradas | 4 | Fuente |
| T9 | Validación manual en navegador (M-14-1…M-14-7) | 5 | Manual |
| T10 | Cierre: suite, build y `MEMORY.md` | 6 | Automática + fuente |

**Total: 10 tareas.**
