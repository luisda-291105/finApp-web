# Spec 014 — Diseño visual del asistente de ayuda de la landing

**Estado: aprobada** (2026-10-19) · **plan y tareas:** [`plan.md`](plan.md) y [`tasks.md`](tasks.md)
**Fecha:** 2026-10-18 · **Última revisión:** 2026-10-18 (reencuadre a **solo diseño**; sustituye la
versión de lógica y guion)
**Origen:** [`spec-ambiguedades.md`](spec-ambiguedades.md) (3 líneas, sin trackear; **copiada sin
modificar una sola línea**). El punto 2 de la nota —el «Usuario» del `Header`— queda **descartado**
por decisión del usuario; el punto 1 es el origen del modal.

**Decisión de alcance del usuario (literal):**
> «por el momento solo el diseño» → **Solo el diseño ahora, sin lógica ni guion.**

El diseño **se conecta al disparador de robot** y muestra sus estados con **contenido de ejemplo estático**.
Esta spec **no** diseña el motor de respuestas, el guion, el manejo de texto libre ni la máquina de
estados de la conversación: eso queda para una spec futura.

**Decisiones del usuario que enmarcan esta fase:**
1. El disparador de `src/pages/PaginaInicio.jsx:51-58` **abre este modal en vez del `AuthModal`** y
   deja de ser el glifo «?»: pasa a ser el icono **`BotMessageSquare`** de `lucide-react`, ya
   instalado (import exacto: `import { BotMessageSquare } from "lucide-react";`).
2. El botón **conserva su `className`** (`src/pages/PaginaInicio.jsx:55`), tamaño 44×44 px y filtro;
   solo cambian el icono, el `aria-label` (literal `Abrir el asistente de ayuda`), el `onClick` y el
   `ref` (`triggerRef`). **No se añaden `aria-haspopup` ni `aria-expanded`.** **No se cambian sus
   clases**: sigue siendo el control excluido de **M-3b** de la Spec 013, que **no se reabre**.
3. El **«Usuario» del `Header` no se toca** (decisión tomada y descartada; DP-03).
4. La **migración de hexadecimales en JSX no está decidida**; queda fuera de esta spec y las
   referencias de `MEMORY.md` y de las cabeceras de 013/015 que la atribuyen a la 014 siguen
   **desalineadas** (DP-04).
5. El correo `soporte@finapp.com` **no es real**: **no se muestra** en el diseño (DP-08).
6. Carpeta: `specs/014-asistente-de-ayuda/`. La nota original permanece aquí.

**Basada en / coordinada con:**
- **Spec 001** (Fluid Glass): blur de 12–16 px en ≤640 px, fallback sin blur, transparencia y
  movimiento reducidos (`specs/001-fluid-glass-cumplimiento/spec.md:26-27`, `:89-91`; reglas vivas en
  `src/styles/index.css:66-135`).
- **Spec 010** (cromo modal congelado): «X», Esc, clic fuera, deslizar en móvil, una sola superficie,
  foco inicial en el panel, `aria-modal` y altura con scroll
  (`specs/010-cierre-de-modales/spec.md:386-456`, `:508-515`, `:536-544`).
- **Spec 011** (foco): captura, cadena de candidatos y una única devolución de foco
  (`specs/011-foco-de-superficies-y-cruce/spec.md:484-510`; piezas vivas en
  `src/hooks/useRetornoDeFoco.js` y `src/hooks/useCierreConEsc.js`).
- **Spec 013** (calidad CSS): el disparador —que la 013 llama «botón ?»— es el **control** excluido
  de **M-3b** y el único `backdrop-blur-md` que queda en `src/`
  (`specs/013-calidad-css/spec.md:283`, `:292`, `:852`, `:672`; alternativa A2 en
  `specs/013-calidad-css/plan.md:177`). La cita `013 spec.md:292` es el inventario **previo** de seis
  `backdrop-blur-md`; después de la 013 solo queda este control. Su `className` **no cambia**; el
  glifo se sustituye por el robot y el nombre accesible cambia, pero el control y su filtro son los
  mismos.
- **Specs 008/009** (header del dashboard): no se reintroduce el header ni se toca la rama «Usuario»
  (`specs/008-correccion-sidebar/spec.md:1`, `:11`, `:36`; `specs/009-eliminar-vista-tablet/spec.md:56`,
  `:427`).
- **Reglas vivas:** tokens y prohibición de hexadecimales nuevos (`AGENTS.md:41-44`;
  `.agents/rules/rules.md:26-29`); límites Fluid Glass (`AGENTS.md:43-44`;
  `.agents/rules/rules.md:37-38`).

**Re-verificación:** las referencias `archivo:línea` de §3 y §4 se comprobaron el **2026-10-18**. El
usuario edita a mano: deben volver a verificarse antes del plan y de la implementación; lo que ya no
aplique se registra como «ya no aplicable» y **no se recrea** (CL-01).

**Nota de formato:** esta spec define **solo el diseño** (estructura, estados visuales, literales,
tokens, accesibilidad y presupuesto visual). Las decisiones de implementación concreta son del plan.

**Línea base:** `HEAD` de partida `cfdd1af`; `npm test` **479/479 en 31 archivos** y `npm run build`
verde, aportados por el orquestador y **re-medidos en T1**. Resultado final: **518/518 en 33 archivos**
y build verde.

---

## 1. Propósito

El botón flotante de ayuda de la portada se anuncia hoy como `Ayuda y preguntas frecuentes` y abre el
formulario de acceso (`src/pages/PaginaInicio.jsx:53-54` → `:32-35` →
`src/components/domain/modales/AuthModal.jsx:52-54`). La portada no tiene una ayuda propia. Esta fase
convierte el control en la entrada a un **modal de asistente de ayuda**: pasa a mostrar el icono
`BotMessageSquare` y a anunciarse como `Abrir el asistente de ayuda`, pero **solo define su diseño
visual**: panel claro, cabecera, marca de demostración, mensajes de ejemplo, sugerencias, campo y pie.
**No hay motor, guion ni respuestas generadas**; los estados son maquetas estáticas.

El objetivo es revisar y aprobar el diseño —jerarquía, medidas, tokens, contraste, accesibilidad y
presupuesto Fluid Glass— sin comprometer la lógica que se especificará después. El disparador
conserva su tamaño y sus clases para no reabrir M-3b de la 013. El «Usuario» del `Header` queda fuera
(DP-03) y la migración de hexadecimales sigue sin decidir (DP-04).

---

## 2. Alcance

### 2.1 Dentro del alcance

- **Estructura y diseño visual** del modal: panel claro (`bg-bg-cream/95` + `glass-surface`, como
  `src/components/layout/DashboardUserModal.jsx:109`), cabecera/título, **marca de demostración**,
  zona de mensajes, chips de sugerencias, campo de entrada y footer/acciones.
- **Dos estados visuales estáticos**: (1) **vacío** con aviso y sugerencias; (2) **conversación de
  muestra** con burbujas de ejemplo. El contenido es fijo; **no** se genera ni se transforma.
- **Tokens, medidas, radios, contraste y jerarquía**; límites Fluid Glass; reutilización del **cromo
  congelado de 010/011**: trampa y retorno de foco, `Escape`, clic en scrim, `aria-modal`,
  `aria-labelledby` y `role="log"` para los mensajes.
- **Conexión del disparador**: el botón de robot abre el modal de ayuda en vez del `AuthModal`,
  conservando `className` y tamaño; solo cambian el icono (`BotMessageSquare`), el `aria-label`
  literal `Abrir el asistente de ayuda`, el `onClick` y el `ref`.
- **Accesibilidad**: foco inicial en el panel, retorno al disparador, recorrido con teclado,
  etiquetas, `aria-live`/`role="log"`, contraste AA del texto sobre el panel.
- **Qué se prueba con Vitest** (estructura, atributos ARIA, apertura/cierre, foco y disparador) y
  **qué es revisión manual** (aspecto, altura real, viewports, contraste medido, teclado virtual).

### 2.2 Fuera del alcance (con su spec futura)

| Fuera de esta fase | Dónde se decide |
|---|---|
| **Motor de coincidencia** (normalización, palabras clave, puntuación, desempate) | Spec futura de lógica del asistente |
| **Guion de respuestas** y contenido dinámico | Spec futura de lógica/contenido |
| **Manejo de texto libre** (envío, validación, eco del mensaje) | Spec futura de lógica |
| **Máquina de estados de la conversación** y transición vacío ↔ conversación | Spec futura de lógica |
| **Reinicio o conservación al cerrar**, historial persistente | Spec futura de lógica |
| **Persistencia, IA real, backend, claves, red, servicios externos** | Prohibido en esta línea; no hay spec que lo autorice |
| **Dependencias nuevas** | No se autorizan |
| **Buzón `soporte@finapp.com`** | No se muestra: es un texto de ejemplo, no un canal (DP-08) |
| **Migración de hexadecimales en JSX** | Sin decidir; fuera de alcance (DP-04) |
| **«Usuario» del `Header`** | No se toca (DP-03) |
| **Integración del asistente en el dashboard** | No; solo la landing |
| **Cambios en `AuthModal`, cromo de 010/011 o cualquier modal existente** | No |

> **Nota de alcance:** el modal **sí** se abre, se cierra y mueve el foco (es el cromo). Lo que no
> existe es la **lógica de conversación**: ni motor, ni guion, ni respuestas, ni estados que cambien
> solos. Los chips, el campo y el botón de envío son **presentacionales** (RF-09).

---

## 3. Contexto y evidencia

### 3.1 El disparador y el login que abría

- `src/pages/PaginaInicio.jsx:51-58`: `<button type="button">` flotante, 44×44 px (`w-11 h-11`),
  `fixed bottom-6 right-6 z-40`; hoy contiene el glifo «?» (`:57`) y se anuncia como
  `Ayuda y preguntas frecuentes` (`:53`), con `onClick={() => manejarAbrirAuth("login")}` (`:54`).
  En el diseño, el glifo se sustituye por `BotMessageSquare` de `lucide-react` (`size={20}`,
  `aria-hidden="true"`) y el nombre accesible pasa a `Abrir el asistente de ayuda`.
- `src/pages/PaginaInicio.jsx:55`: `backdrop-blur-md` y literales heredados
  (`bg-[#0f1117]/80`, `hover:bg-[#1a7a5e]`). Es el **único `backdrop-blur-md` que queda en `src/`**
  tras la 013 y el **control excluido** de M-3b (`src/styles/index.css` ya no lo necesita para las
  cinco superficies; 013 `spec.md:283`, `:292`).
- `src/pages/PaginaInicio.jsx:32-35`: `manejarAbrirAuth(modo)` fija `modoAuth` y abre `modalAbierto`.
  El `AuthModal` está **siempre montado** (`:44-48`) y devuelve `null` cuando `abierto` es falso
  (`src/components/domain/modales/AuthModal.jsx:78`). **No se afirma que no se monte**: se afirma que
  **su diálogo no se abre** y que **su `fetch` no se ejecuta** al abrir la ayuda.
- `src/components/domain/modales/AuthModal.jsx:98`: el `fetch` vive en el envío del formulario; si el
  diálogo no se abre, no hay envío. El modo demo está en `src/config/app.config.js:13`
  (`TRIAL_ACTIVO = true`) y la guardia de ruta en `src/App.jsx:29-33`; esta spec **no** cambia el
  login ni lo usa como prueba de nada.

### 3.2 Cromo modal que se reutiliza

La Spec 010 fija para las superficies modales: «X» superior (RF-02), Esc con un único mecanismo
(RF-04), clic fuera (RF-05), deslizar en móvil (RF-06), una sola superficie y una sola trampa
(RF-07), retorno de foco (RF-08), `role="dialog"` + `aria-modal` + nombre accesible + foco inicial
en el contenedor (RF-16) y altura con scroll interno (RF-22)
(`specs/010-cierre-de-modales/spec.md:386-456`, `:508-515`, `:536-544`). La Spec 011 añade la captura
y la devolución de foco (`specs/011-foco-de-superficies-y-cruce/spec.md:484-510`). El diseño
**reutiliza** estas piezas; no crea un cromo paralelo.

### 3.3 Presupuesto Fluid Glass

Regla: **máximo 3 superficies translúcidas superpuestas y 2 blobs visibles por viewport**
(`AGENTS.md:43-44`; `.agents/rules/rules.md:37-38`). La 013 distingue expresamente **superficies**
(`glass-hero` y `glass-surface`) de **velos/overlays** y **controles**:
`specs/013-calidad-css/spec.md:275-300` (inventario; `:292` es el inventario **previo** de seis
`backdrop-blur-md`, hoy solo queda el disparador) y `:284-297` (los velos 7–10 no son superficies; los
controles 6, 11 y 12 tampoco). **El scrim de este diseño no lleva `backdrop-filter`, así que no
cuenta como superficie.**

| Estado | Superficies translúcidas | Blobs | Evidencia |
|---|---|---|---|
| Tope, sin modal | **1**: `glass-hero` | **1**: halo del Hero | `src/components/domain/landing/Hero.jsx:75`, `:30` |
| Con scroll, sin modal | **2**: header `glass-surface` + `glass-hero` | **1** | `src/components/layout/Header.jsx:36`, `Hero.jsx:75` |
| Tope, modal abierto | **2**: hero + panel | **1** | panel nuevo + `Hero.jsx:75` |
| Con scroll, modal abierto | **3**: header + hero + panel | **1** | `Header.jsx:36` + `Hero.jsx:75` + panel |
| Disparador (robot) | **0** (es **control**, no superficie) | 0 | 013 `spec.md:283`; diseño §4.5 |
| Scrim | **0** (sin `backdrop-filter`) | 0 | 013 `spec.md:284-297`; diseño §4.1 |

**Impacto declarado en la 013:** su texto habla del «botón ?» porque así se llamaba el control cuando
se cerró. El control y su filtro son los mismos: el botón de 44×44 px, `backdrop-blur-md` y blur de
12 px en ≤640 px. A efectos de M-3b solo cambia el glifo por `BotMessageSquare` y el nombre accesible;
`onClick` y `ref` son cableado y no alteran el filtro. Por tanto **M-3b sigue vigente, no se re-mide y
la 013 no se modifica**.

**No se añade ningún blob.** El panel es la única superficie nueva. El scrim **queda fuera del
conteo**: se pinta como velo semisólido `bg-bg-dark/70` y no tiene blur. Si en el plan se optara por
un panel opaco (`glass-card`/fondo sólido), el conteo bajaría y seguiría cumpliendo; no es necesario.

### 3.4 Tokens y contraste

Los colores salen de `src/styles/index.css:15-22` (`bg-dark`, `bg-cream`, `emerald-primary`,
`slate-text`, `border-line`) y el radio de `--radius-glass: 24px` (`:30`). El panel claro usa
`bg-bg-cream/95` sobre el scrim oscuro; el texto principal es `text-bg-dark` y el secundario
`text-slate-text`. **No se añaden hexadecimales nuevos en las líneas añadidas por el diff de los
JS/JSX de producción tocados** —patrón `src/**/*.js` y `src/**/*.jsx` **excluyendo** las suites
`*.test.jsx`/`*.test.js`, por decisión del usuario (2026-10-19): las pruebas copian **verbatim** el
`className` heredado para el aserto literal de AC-01— (`AGENTS.md:41-44`;
`.agents/rules/rules.md:26-29`); el disparador es un archivo existente y solo conserva sus literales
heredados. El contraste AA se mide en navegador con el
**protocolo de medición de la 013** (fondo compuesto incluido; manual): el scrim no lleva texto
directo; el panel es el fondo de todo el texto.

---

## 4. Diseño visual

### 4.1 Anatomía y medidas

```
Scrim: fixed inset-0 z-50 bg-bg-dark/70 flex items-center justify-center p-4, sin backdrop-blur
└─ Panel: relative z-60 w-[90vw] max-w-md max-h-[85vh] overflow-hidden
   bg-bg-cream/95 glass-surface border border-border-line/30 rounded-3xl shadow-xl
   flex flex-col
   ├─ Header (shrink-0) px-5 py-4 border-b border-border-line/30
   │  ├─ Título «Asistente de ayuda» + marca «Demostración · No es una IA real»
   │  ├─ NOTA_DISENO «Vista de diseño: contenido de ejemplo; aún no responde preguntas.»
   │  │  (`id="asistente-nota"`)
   │  └─ BotonCerrar («Cerrar asistente de ayuda»)
   ├─ Body (min-h-0 flex-1 overflow-y-auto) px-5 py-4
   │  ├─ Contenido de estado, fuera del log: TEXTO_VACIO o TEXTO_EJEMPLO
   │  ├─ Sugerencias (solo vacío), fuera del log
   │  └─ Log de mensajes (`role="log"`, `aria-label="Mensajes del asistente"`)
   │     ├─ vacío: sin hijos
   │     └─ conversación: solo las cuatro burbujas
   └─ Footer (shrink-0) px-5 py-4 border-t border-border-line/30
      ├─ Aviso de reserva
      └─ Label `sr-only` «Tu pregunta» + input + botón «Enviar»
```

- **Una sola estructura de scroll:** el panel no scrollea (`overflow-hidden`); scrollea **solo el
  body** (`overflow-y-auto`), con header y footer fijos. No hay dos contenedores con scroll.
- **Centrado:** el scrim usa `flex items-center justify-center p-4`; el panel va centrado con
  `relative z-60`, sin `top/left` ni `transform`. A 375 px quedan al menos 16 px de margen lateral.
- **Log solo de mensajes:** `role="log"` envuelve **exclusivamente** las burbujas. `TEXTO_VACIO`,
  `TEXTO_EJEMPLO` y las sugerencias son **hermanos fuera del log**; en `vacio` el log no tiene hijos y
  en `conversacion` contiene solo las cuatro burbujas. Esto hace decidible AC-08.
- **Ancho:** `90vw` con tope `max-w-md` (28rem). A 375×812 mide 337,5 px; a 1440×900, 448 px.
- **Alto:** `max-h-[85vh]`; el body absorbe el desbordamiento. A 375×812 el panel no supera 690 px.
  La estrategia de viewport visible del teclado virtual queda **diferida** a la spec de comportamiento;
  `max-h-[85vh]` es el diseño aprobado y se valida manualmente.
- **Radio:** 24 px (`rounded-3xl`, token `--radius-glass`). Borde `border-border-line/30`, sombra
  `shadow-xl`.
- **Cabecera:** título `font-display text-lg font-semibold text-bg-dark`; la marca va debajo, en una
  píldora; `NOTA_DISENO` va bajo la marca; la «X» a la derecha.
- **Pie:** el aviso de reserva es texto pequeño `text-xs text-slate-text`; el campo y el botón van en
  una fila con `gap-2`.
- **Iconos:** la «X» reutiliza `BotonCerrar`; el disparador usa `BotMessageSquare` de
  `lucide-react`, ya instalado. No se requiere una librería adicional.

### 4.2 Estados visuales (estáticos)

El componente de diseño acepta una prop presentacional `estadoVisual` con dos valores; **no hay
transición, ni estado de React de conversación, ni forma de cambiar de uno a otro en producción**:

- `estadoVisual="vacio"` (**por defecto y siempre en la app**): aviso de vacío, sugerencias y aviso de
  reserva.
- `estadoVisual="conversacion"`: conversación de muestra con cuatro burbujas; sin sugerencias.
- `PaginaInicio` monta el modal con `estadoVisual="vacio"`. La variante `"conversacion"` existe para
  revisión de diseño y pruebas de estructura; **no** es una máquina de estados ni tiene control en
  producción. Las pruebas y la revisión la pasan explícitamente.
- **Dónde vive el estado de UI:** el estado de apertura/cierre del modal vive en `PaginaInicio`
  (mismo patrón que el resto del cromo, p. ej. `src/pages/PaginaInicio.jsx:24-25`); el componente del
  asistente **no** tiene estado propio de conversación. Por eso AC-12 acota su `grep` al componente
  nuevo y no cuenta el `useState` de apertura de la página como lógica del asistente.

**Burbujas:**
- Usuario: alineadas a la derecha, `bg-emerald-primary text-bg-cream`, `rounded-2xl rounded-br-md`,
  `px-3.5 py-2.5`, `text-sm`.
- Asistente: alineadas a la izquierda, `bg-bg-cream text-bg-dark border border-border-line/40`,
  `rounded-2xl rounded-bl-md`, `px-3.5 py-2.5`, `text-sm`.
- Cada burbuja lleva una etiqueta de remitente visualmente oculta con la utilidad `sr-only`:
  `<span className="sr-only">Tú</span>` o `<span className="sr-only">Asistente</span>`. No se usa
  `display:none` ni `aria-hidden`: el texto existe en el DOM y es asertable con `getByText` y
  `toHaveClass("sr-only")`. No se usan avatares ni imágenes.

### 4.3 Literales exactos

Estos textos son **fijos** y se asertan literalmente. No se presentan como IA real. No incluyen
`soporte@finapp.com` ni ningún correo.

| Constante | Texto exacto | Dónde |
|---|---|---|
| `TITULO` | `Asistente de ayuda` | `<h2 id="asistente-titulo">` |
| `MARCA_DEMO` | `Demostración · No es una IA real` | Píldora del header, `id="asistente-marca"` |
| `NOTA_DISENO` | `Vista de diseño: contenido de ejemplo; aún no responde preguntas.` | Header, bajo la marca, `id="asistente-nota"` |
| `AVISO_RESERVA` | `Cuando la ayuda esté activa, si tu pregunta no coincide verás una respuesta de reserva.` | Footer, `id="asistente-reserva"` |
| `TEXTO_VACIO` | `Aún no hay mensajes. Cuando la ayuda esté activa, podrás elegir una sugerencia o escribir una pregunta.` | Body, fuera del log; estado vacío |
| `TEXTO_EJEMPLO` | `Conversación de ejemplo` | Body, fuera del log; estado conversación |
| `SUGERENCIAS[0]` | `¿Cómo entro al panel?` | Chip 1, fuera del log |
| `SUGERENCIAS[1]` | `¿Dónde veo mis tarjetas?` | Chip 2, fuera del log |
| `SUGERENCIAS[2]` | `¿Se guardan mis datos?` | Chip 3, fuera del log |
| `SUGERENCIAS[3]` | `¿Cómo salgo del demo?` | Chip 4, fuera del log |
| `ARIA_CERRAR` | `Cerrar asistente de ayuda` | `BotonCerrar` |
| `ARIA_LOG` | `Mensajes del asistente` | `role="log"`, solo mensajes |
| `LABEL_ENTRADA` | `Tu pregunta` | `<label for="asistente-entrada">` del campo, **visualmente oculto con `sr-only`** |
| `PLACEHOLDER` | `Escribe una pregunta…` | `placeholder` del campo |
| `BOTON_ENVIAR` | `Enviar` | Botón del footer |

**Conversación de muestra (estado `conversacion`):**

| Remitente | Texto exacto |
|---|---|
| Tú | `¿Cómo entro al panel?` |
| Asistente | `En esta demo el panel se abre directamente desde la portada. Dentro, la barra lateral te permite ir a Inicio, Transacciones y Tarjetas.` |
| Tú | `¿Se guardan mis datos?` |
| Asistente | `Esta es una demostración: no hay backend ni datos financieros reales. Las cifras y las tarjetas que ves son de ejemplo.` |

**Definición de «visible y persistente» para la marca:** `MARCA_DEMO` y `NOTA_DISENO` viven en la
cabecera **fuera del área scrolleable**; se ven **sin scroll** a 375×812 y a 1440×900, y permanecen
en **ambos** estados visuales. No se ocultan al hacer scroll del body.

### 4.4 Controles presentacionales (sin lógica)

- **Chips:** cuatro `<button type="button" aria-disabled="true">`; **sin `onClick`**, sin estado y
  sin transición. Se muestran como sugerencias, pero no ejecutan nada.
- **Campo:** `<input type="text">` con
  `<label for="asistente-entrada" className="sr-only">Tu pregunta</label>` (asociado, asertable y
  **visualmente oculto**) y `placeholder`; **sin `onChange`, sin `value` controlado, sin `onSubmit` ni estado de conversación
  (`useState`/`useReducer`)**. Es editable **solo para revisar foco y teclado virtual**; escribir no
  genera mensajes ni respuestas. La interfaz lo declara con `NOTA_DISENO` y `AVISO_RESERVA`.
- **Botón «Enviar»:** `<button type="button" aria-disabled="true">`; **sin `onClick`**, sin `form`,
  sin envío. El aviso de diseño explica que aún no responde.
- **Sin formulario:** el footer no es un `<form>`; no hay `onSubmit`, ni Enter que envíe, ni `fetch`.
- **Estados:** solo cambian por la prop `estadoVisual`; no hay botón, gesto o temporizador que los
  altere.

### 4.5 Disparador (botón de robot)

- **Icono elegido:** `BotMessageSquare` de `lucide-react` (robot con burbuja de conversación), ya
  instalado en `^0.454.0`.
- **Import exacto:** `import { BotMessageSquare } from "lucide-react";`
- **Uso:** `<BotMessageSquare size={20} aria-hidden="true" />` dentro del botón; el icono es
  decorativo y el nombre accesible lo aporta el `aria-label`.
- **Nombre accesible literal:** `Abrir el asistente de ayuda`.
- **Superficie:** el `className` del botón **no cambia**; el icono hereda `currentColor` y no
  introduce hexadecimales.
- **Sin ARIA extra:** no se añaden `aria-haspopup` ni `aria-expanded`; solo cambian icono,
  `aria-label`, `onClick` y `ref`.
- **Declaración de alcance:** la interfaz no promete respuesta; el campo editable sirve solo para
  revisar foco y teclado virtual, y la nota de diseño/aviso de reserva lo dicen.

---

## 5. Requisitos funcionales (EARS)

- **RF-01 — Ubicuo — Disparador de robot conectado sin tocar su forma.** El botón flotante **DEBE**
  mostrar el icono `BotMessageSquare` de `lucide-react` (import exacto:
  `import { BotMessageSquare } from "lucide-react";`, `size={20}`, `aria-hidden="true"`) en lugar del
  glifo anterior. **DEBE** conservar **exactamente** su `className`
  (`src/pages/PaginaInicio.jsx:55`), tamaño 44×44 px, `type="button"` y `backdrop-blur-md`; **NO DEBE**
  introducir hexadecimales nuevos. **DEBE** tener el `aria-label` literal `Abrir el asistente de
  ayuda`; **NO DEBE** conservar `Ayuda y preguntas frecuentes`. Solo **DEBEN** cambiar el icono, el
  `aria-label`, el `onClick` y el `ref` (`triggerRef`);
  **NO DEBE** añadirse `aria-haspopup` ni `aria-expanded`. Al activarse **DEBE** abrir el modal de
  ayuda y **NO DEBE** abrir el diálogo del `AuthModal` ni navegar a `/login`. **NO DEBE** cambiar
  M-3b: el blur sigue siendo `blur(12px)` en ≤640 px, no se re-mide y la 013 **no se reabre ni se
  modifica**.
- **RF-02 — Evento — Apertura, cierre y foco.** **CUANDO** se active el disparador, **DEBE** abrirse
  **una única** superficie modal y el foco inicial **DEBE** quedar en el contenedor del panel
  (`tabindex="-1"`), no en la «X» ni en el campo. **MIENTRAS** esté abierta, **DEBE** poder cerrarse
  por la «X», Esc (con el foco donde esté, incluido el campo), clic/toque en el scrim y deslizar
  hacia abajo en móvil, con **una sola** llamada de cierre por acción. Al cerrar, **DEBE** devolver
  el foco al disparador mediante `triggerRef`; si el disparador ya no existe, **DEBE** usar la cadena
  estable de 011. Si la cadena no encuentra candidato válido, **NO DEBE** llamar a `focus()` sobre
  `body` ni sobre un nodo desconectado; el foco puede quedar donde estaba (limitación documentada en
  `src/hooks/useRetornoDeFoco.js:88`; caso reproducido en
  `src/components/domain/modales/AuthModal.test.jsx:423`). **NO DEBE** abrirse el diálogo «Ventana de acceso»
  ni ejecutarse su `fetch`; el `AuthModal` puede seguir montado cerrado
  (`src/pages/PaginaInicio.jsx:44-48`; `AuthModal.jsx:78`).
- **RF-03 — Ubicuo — Cromo congelado de 010/011.** El modal **DEBE** exponer `role="dialog"`,
  `aria-modal="true"`, `aria-labelledby="asistente-titulo"` y
  `aria-describedby="asistente-marca asistente-nota asistente-reserva"`; **DEBE** usar la trampa de
  foco real, la «X» de `BotonCerrar` dentro del panel, el mecanismo único de Esc por capas, el cierre
  por clic en scrim y el gesto de 010 en móvil. **NO DEBE** modificar el cromo de `AuthModal`,
  `DashboardUserModal`, `DashboardDrawer` ni `ModalTarjeta`. La «X» **NO DEBE** ser el foco inicial y
  **DEBE** tener el nombre `Cerrar asistente de ayuda`.
- **RF-04 — Ubicuo — Panel y una sola zona de scroll.** El panel **DEBE** ser claro
  (`bg-bg-cream/95` + `glass-surface`), con borde `border-border-line/30`, radio de 24 px
  (`rounded-3xl`, token `--radius-glass`), `shadow-xl`, ancho `90vw` con tope `max-w-md` y
  `max-h-[85vh]`. **DEBE** estar centrado por el scrim (`flex items-center justify-center p-4`) con
  `relative z-60`, sin `top/left` ni `transform`. **DEBE** ser `flex flex-col` y `overflow-hidden`;
  header y footer **DEBEN** ser `shrink-0`; **solo** el body **DEBE** scrollear
  (`min-h-0 flex-1 overflow-y-auto`). **NO DEBE** haber dos contenedores con scroll ni un panel que
  scrollee completo.
- **RF-05 — Ubicuo — Cabecera y marca de demostración.** La cabecera **DEBE** mostrar el título
  `Asistente de ayuda`, la marca exacta `Demostración · No es una IA real`, la nota exacta
  `Vista de diseño: contenido de ejemplo; aún no responde preguntas.` y la «X» a la derecha. La marca
  y la nota **DEBEN** estar fuera del área scrolleable y **DEBEN** verse sin scroll a 375×812 y a
  1440×900, en ambos estados visuales. **NO DEBE** haber ningún otro texto que presente el asistente
  como IA real, con comprensión del lenguaje, aprendizaje o acceso a datos: fuera de `MARCA_DEMO` y
  `NOTA_DISENO`, AC-05 asertará la ausencia de `inteligencia artificial`, `modelo de lenguaje`,
  `aprendo`, `entiendo` y `asistente inteligente`; la única aparición de «IA» es la marca
  `No es una IA real`.
- **RF-06 — Evento — Estado vacío, sugerencias y aviso de reserva.** En `estadoVisual="vacio"`, el
  body **DEBE** mostrar el texto exacto de `TEXTO_VACIO`, las cuatro sugerencias exactas de §4.3 y el
  footer **DEBE** mostrar el texto exacto de `AVISO_RESERVA`. Las sugerencias **DEBEN** ser chips
  presentacionales con `aria-disabled="true"` y sin `onClick`. **NO DEBE** generarse ningún mensaje
  al pulsarlas.
- **RF-07 — Evento — Conversación de muestra estática.** En `estadoVisual="conversacion"`, el body
  **DEBE** mostrar la etiqueta `Conversación de ejemplo` y las cuatro burbujas exactas de §4.3, en
  orden, con las etiquetas de remitente `Tú`/`Asistente` en `span.sr-only`. **NO DEBE** mostrar
  sugerencias. **NO DEBE** existir una transición automática desde el estado vacío, ni un botón para
  provocarla, ni lógica de conversación: es una variante de diseño.
- **RF-08 — Ubicuo — Región de mensajes.** El contenedor de mensajes **DEBE** existir desde la
  apertura, incluso vacío, con `role="log"`, `aria-live="polite"`, `aria-relevant="additions"`,
  `aria-atomic="false"` y `aria-label="Mensajes del asistente"`. El log **DEBE** contener **solo
  mensajes**: `TEXTO_VACIO`, `TEXTO_EJEMPLO` y las sugerencias **DEBEN** ser hermanos fuera del log.
  En el estado vacío el log **NO DEBE** tener hijos; en conversación **DEBE** contener **solo** las
  cuatro burbujas. **NO DEBE** usar `aria-live="assertive"` ni reanunciar todo el historial.
- **RF-09 — Ubicuo — Pie y controles presentacionales.** El footer **DEBE** contener el aviso de
  reserva, un `<label>` asociado con el texto exacto `Tu pregunta` **visualmente oculto con `sr-only`**, un `<input type="text">` con
  `placeholder="Escribe una pregunta…"` y un botón `Enviar` con `aria-disabled="true"`. En el
  componente del asistente **NO DEBE** haber `<form>`, `onSubmit`, `onClick` de envío, `onChange`,
  `value` controlado, `useState`/`useReducer`, estado de conversación ni llamada de red. El campo
  **DEBE** poder recibir foco y ser
  editable **solo para revisar foco y teclado virtual**; escribir **NO DEBE** añadir mensajes ni
  prometer respuesta, y la interfaz **DEBE** declararlo con `NOTA_DISENO` y `AVISO_RESERVA`.
- **RF-10 — Ubicuo — Tokens, contraste y cero hexadecimales nuevos.** Todo el color **del código
  nuevo** **DEBE** salir de los tokens de `src/styles/index.css` (`bg-bg-cream`, `bg-bg-dark`,
  `text-bg-dark`, `text-slate-text`, `border-border-line`, `emerald-primary`); **NO DEBE** añadirse
  ningún literal `#` en las **líneas añadidas del diff de los JS/JSX de producción tocados**
  (`src/**/*.js` y `src/**/*.jsx`, **excluyendo las suites** `*.test.jsx` y `*.test.js`). El barrido se
  acota a producción por **decisión del usuario (2026-10-19)**: las suites copian **verbatim** el
  `className` heredado del control porque AC-01 exige compararlo **literalmente**, de modo que
  incluirlas daría un **falso positivo garantizado**. El disparador, que es un archivo existente,
  conserva sus literales heredados del `className` y **NO DEBE** copiarlos a código nuevo. El texto
  sobre el panel **DEBE** cumplir
  contraste WCAG AA (4.5:1 para texto normal; 3:1 para texto grande) medido en navegador con el
  **protocolo de la 013** (fondo compuesto incluido). **NO DEBE** haber texto directo sobre el scrim.
- **RF-11 — Ubicuo — Presupuesto Fluid Glass.** Sin modal, la landing **DEBE** mostrar **1**
  superficie/1 blob en el tope y **2**/1 con scroll. Con el modal abierto, **2**/1 en el tope y
  **3**/1 con scroll. El scrim **NO DEBE** llevar `backdrop-filter` y **NO DEBE** contarse como
  superficie (013 `spec.md:284-297`); el panel **DEBE** ser la única superficie nueva; **NO DEBE**
  añadirse ningún blob. El disparador de robot sigue siendo **control** y no cuenta.
- **RF-12 — Ubicuo — Solo diseño, sin lógica ni red.** Esta fase **NO DEBE** implementar motor de
  coincidencia, guion, manejo de texto libre, máquina de estados, reinicio/conservación, persistencia,
  IA, backend, `fetch`, claves, rutas, endpoints, dependencias nuevas ni el correo
  `soporte@finapp.com`. **NO DEBE** cambiar `AuthModal`, `Header`, `app.config`, `api.config`,
  `index.html`, `MEMORY.md` (salvo la corrección de ruta/estado de §15: `:27`, `:31`, `:41`, con el
  texto de hex **verbatim** y sin tocar `:37`), `specs/013-calidad-css/`
  ni `specs/015-higiene-y-dobles/`; las referencias de hexadecimales desalineadas se **declaran**, no
  se corrigen. El único comportamiento nuevo es **abrir/cerrar** el modal de diseño y devolver el
  foco.

---

## 6. Casos límite

- **CL-01 — Código en movimiento.** Si al implementar el `className` del disparador ya cambió, el
  `AuthModal` ya no está montado o el `Header` ya no existe, se registra «ya no aplicable» y **no** se
  recrea ni se revierte la edición.
- **CL-02 — Una sola superficie.** El disparador está en `z-40` (`src/pages/PaginaInicio.jsx:55`); el
  scrim del `AuthModal` en `z-50` (`AuthModal.jsx:134`). Con el login abierto, el disparador queda
  detrás y no se alcanza; con la ayuda abierta, el login del `Header` queda detrás del scrim. No hay
  coexistencia. Si un caso no previsto las apilara, Esc cierra solo la capa superior (010
  RF-04/RF-07).
- **CL-03 — Viewport bajo, zoom o apaisado.** A 320×568, 375×812, 1440×900, 200 % de zoom y
  apaisado, el header (marca incluida), el body y el footer quedan alcanzables con **un solo** scroll
  del body; nada esencial se corta sin scroll. La comprobación de altura real es manual.
- **CL-04 — Scroll del body frente a footer.** Si la conversación de muestra o el estado vacío
  desbordan, scrollea el body; header y footer no se mueven. El aviso de reserva y el campo siguen
  visibles en el footer. No se permite un segundo scroll en el panel.
- **CL-05 — `Escape` con el foco en el campo.** Con el foco en el `<input>` (o en cualquier control),
  Esc **DEBE** cerrar el modal una sola vez y devolver el foco al disparador; no debe quedar atrapado
  en el campo ni enviar nada.
- **CL-06 — Teclado virtual en móvil.** Se valida manualmente en 375×812 que el campo y el botón no
  quedan tapados con el panel dentro de `max-h-[85vh]` y el body scrolleable. La estrategia de
  viewport visible queda **diferida** a la spec de comportamiento; jsdom no simula teclado virtual ni
  layout.
- **CL-07 — Controles presentacionales.** Pulsar un chip o «Enviar», o escribir en el campo, **NO
  DEBE** añadir mensajes, cambiar de estado ni llamar a red. No es un defecto: es el alcance de
  diseño; `NOTA_DISENO` y `AVISO_RESERVA` lo declaran.
- **CL-08 — Conversación de muestra larga.** Con textos largos o a 320 px, las burbujas envuelven sin
  desbordar el panel; el body scrollea y el pie permanece fijo. La altura real se valida a mano.
- **CL-09 — Movimiento y transparencia reducidos.** Si el plan añade una animación de entrada, con
  `prefers-reduced-motion` **DEBE** ser instantánea o de duración 0. Con
  `prefers-reduced-transparency`, `glass-surface` computa `none` y el panel sigue legible por su
  fondo `bg-bg-cream/95` (`src/styles/index.css:117-135`).
- **CL-10 — Foco y desmontaje.** Al cerrar, el foco vuelve al disparador; si el disparador ya no
  existe, se usa la cadena estable de 011. Si no hay candidato válido, el hook no llama a `focus()`
  sobre `body` ni sobre un nodo desconectado y no mueve el foco; puede quedar en `body` si no había
  origen (limitación de `src/hooks/useRetornoDeFoco.js:88`; reproducida en
  `AuthModal.test.jsx:423`).
- **CL-11 — `AuthModal` montado y cerrado.** El `AuthModal` sigue en el árbol (`PaginaInicio.jsx:44-48`)
  pero su diálogo no existe cuando `abierto` es falso (`AuthModal.jsx:78`). Abrir la ayuda no debe
  disparar su `fetch` (`:98`) ni mostrar «Ventana de acceso».
- **CL-12 — Reemplazo o desaparición del disparador/icono.** Si el botón se elimina o cambia de
  propósito en una edición posterior, quedan **no aplicables**: RF-01, RF-02 (apertura/retorno) y
  RF-11 (conteo con el modal abierto), y sus AC-01, AC-02 y AC-11. Si **solo desaparece el icono
  `BotMessageSquare`** o se sustituye por otro glifo, RF-01/AC-01 fallan como regresión visual: el
  `aria-label` literal se mantiene y el botón sigue operativo, pero ya no muestra el robot; se
  registra y **no se reintroduce el glifo anterior**. Si el botón cambia de propósito, el modal
  queda sin entrada y no se justifica en la landing; no se recrea.
- **CL-13 — Contraste real.** El panel es `bg-bg-cream/95` sobre `bg-bg-dark/70`; el texto se mide
  sobre el color compuesto resultante, no sobre el token aislado. El scrim no tiene texto. La
  medición es manual (navegador/lector de contraste), no jsdom.
- **CL-14 — Entorno de pruebas.** La trampa de foco es la real (`focus-trap-react`); si la prueba
  necesita geometría, se usa un **stub local** y **no** se toca `vitest.setup.js`. No se prueba
  `scrollIntoView` ni altura real en jsdom; eso es manual.
- **CL-15 — Sin soporte ni correo.** Ningún texto del diseño menciona `soporte@finapp.com` ni promete
  un canal humano. El aviso de reserva habla de una respuesta guionizada futura, no de soporte.

---

## 7. Decisiones y descartes

| ID | Decisión |
|---|---|
| **DP-01** | **Solo diseño, sin lógica ni guion.** El modal se abre/cierra y muestra dos variantes estáticas; no hay motor, guion, texto libre procesado, máquina de estados, reinicio/conservación ni persistencia. La lógica se especifica en una spec futura. |
| **DP-02** | **Disparador de robot:** se conserva el `className` byte a byte, 44×44 px y `backdrop-blur-md`; solo cambian el icono (`BotMessageSquare`), el `aria-label` a `Abrir el asistente de ayuda`, el `onClick` y el `ref` (`triggerRef`). Import exacto: `import { BotMessageSquare } from "lucide-react";`; uso `size={20}` y `aria-hidden="true"`. **No** se conserva el nombre anterior `Ayuda y preguntas frecuentes`. **No** se añaden `aria-haspopup` ni `aria-expanded`: el disparador no gana estado y el diálogo se identifica con `role="dialog"`/`aria-modal`. M-3b no se reabre, no se re-mide y la 013 no se modifica; su «botón ?» es este mismo control. |
| **DP-03** | **«Usuario» del `Header`: sin cambio.** Es una rama inalcanzable desde la 008; `Header` solo se monta en la landing (`src/layout/LandingLayout.jsx:28`) y la 009 lo fijó como solo landing. La identidad ya está en el sidebar/drawer (`src/components/layout/SidebarNavContenido.jsx:61-77`). **No genera RF ni AC.** |
| **DP-04** | **Hexadecimales: sin decidir.** No se migran ni se inventan. La 014 **no los cubre**. Referencias que remiten hex/contraste a la 014 y quedan **desalineadas**: `MEMORY.md:27`, `:31` y `:41` (en esas líneas solo se corrige ruta/estado y el texto de hex **sobrevive verbatim**, §15), 013 `spec.md:59`, `:155`, `:378`, `:658` y 015 `spec.md:48`, `:134`, `:162`. `MEMORY.md:37` **no se toca** (registro de ajenos sin commitear). La deuda permanece declarada, **sin atribuirle cobertura** a esta spec. |
| **DP-05** | **`AuthModal` no se toca.** Sigue siempre montado (`src/pages/PaginaInicio.jsx:44-48`) y devuelve `null` cerrado (`AuthModal.jsx:78`). El AC observable es que su diálogo no se abre y su `fetch` (`:98`) no se ejecuta; **no** se afirma que no se monte. |
| **DP-06** | **Una sola estructura de scroll:** panel `overflow-hidden` + body `overflow-y-auto`; header y footer `shrink-0`. Se descarta el panel con scroll completo y el doble scroll. |
| **DP-07** | **Dos variantes estáticas por prop `estadoVisual`:** `vacio` (por defecto y siempre en la app) y `conversacion` (revisión/pruebas). Sin transición, sin botón de cambio, sin estado de conversación ni control en producción. |
| **DP-08** | **Literales fijos:** `Demostración · No es una IA real`, `Vista de diseño: contenido de ejemplo; aún no responde preguntas.` y `Cuando la ayuda esté activa, si tu pregunta no coincide verás una respuesta de reserva.` Se descarta cualquier texto que prometa IA, respuestas reales o soporte. `soporte@finapp.com` **no se muestra**: no es un canal real. |
| **DP-09** | **Controles presentacionales:** chips y «Enviar» con `aria-disabled="true"` y sin handlers; campo editable sin `onChange`, sin `value` controlado, sin estado ni envío, solo para revisar foco y teclado virtual. Se descarta hacerlos funcionales en esta fase. |
| **DP-10** | **Fluid Glass:** el scrim no es superficie (sin `backdrop-filter`; 013 `spec.md:284-297`); el panel es la única superficie nueva; no hay blobs nuevos. Conteo 2/1 y 3/1. Se descarta el scrim con `backdrop-blur-sm` y cualquier frase que lo cuente como capa. |
| **DP-11** | **Panel claro:** `bg-bg-cream/95` + `glass-surface`, borde, radio 24 px, `max-w-md`, `max-h-[85vh]`. Se reutiliza el lenguaje de `DashboardUserModal.jsx:109`, pero con el radio del token `--radius-glass` (24 px) en vez de 16 px. |
| **DP-12** | **Pruebas:** Vitest solo para estructura, literales, ARIA, apertura/cierre, foco y disparador. Altura, scroll real, contraste (protocolo 013), teclado virtual y presupuesto visual son manuales; M-3b no se re-mide (si se constata, manual opcional). No se toca `vitest.setup.js` ni se simula `scrollIntoView`. |
| **DP-13** | **MEMORY:** el planner no puede editar `MEMORY.md` (solo escribe en `specs/`). La tabla línea por línea de §15 y la línea de referencia final las aplica el implementer en el cierre. Solo se autoriza corregir **ruta y estado**; el texto de hexadecimales sobrevive **verbatim** y la deuda queda **sin decidir y no cubierta** por esta spec. |

---

## 8. Criterios de aceptación

| AC | RF | Estado observable esperado | Verificación | Tipo |
|---|---|---|---|---|
| **AC-01** | RF-01 | El disparador muestra el icono `BotMessageSquare` (svg 20×20, `aria-hidden="true"`), tiene `aria-label="Abrir el asistente de ayuda"`, conserva el `className`/tamaño y **no** tiene `aria-haspopup` ni `aria-expanded`; no conserva `Ayuda y preguntas frecuentes` ni el glifo `?`; abre la ayuda, no «Ventana de acceso» | Test DOM de `PaginaInicio` con `MemoryRouter`; `getByRole("button", {name: "Abrir el asistente de ayuda"})`; `queryByRole("button", {name: "Ayuda y preguntas frecuentes"})` ausente; `within(disparador).queryByText("?")` ausente; `disparador.querySelector("svg")` (no `within(...).querySelector`, que no existe); comparación literal del `className`; aserto de ausencia de `aria-haspopup`/`aria-expanded`; `ref` por fuente o por retorno de foco en AC-02, sin aserto directo; `await userEvent.click(disparador)` y `getByRole("dialog", {name: "Asistente de ayuda"})`; `queryByRole("dialog", {name: "Ventana de acceso"})` ausente; espía de `fetch` sin llamadas | Auto + Fuente |
| **AC-02** | RF-02 | Abre y cierra por «X», Esc con foco en el campo, scrim y deslizar en móvil; una acción = una llamada; foco inicial en el panel y retorno al disparador; sin candidato no se fuerza `focus()` en `body`; no coexiste con `AuthModal` | Test DOM con `userEvent` y punteros; espías de `alCerrar`; `document.activeElement`; caso Esc con foco en el input; prueba de retorno; caso sin candidato (limitación de `useRetornoDeFoco.js:88`) | Auto + Manual (gesto) |
| **AC-03** | RF-03 | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="asistente-titulo"`, `aria-describedby` con marca/nota/reserva; «X» dentro del panel con nombre `Cerrar asistente de ayuda`; trampa real; no enfoque inicial en «X» | Test de estructura y foco; `getByRole("dialog")`; `getByRole("button", {name: "Cerrar asistente de ayuda"})`; inspección de `FocusTrap` | Auto + Manual (trampa) |
| **AC-04** | RF-04 | Panel `bg-bg-cream/95 glass-surface border-border-line/30 rounded-3xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col`; centrado por scrim `flex items-center justify-center p-4` con `relative z-60`; header/body/footer; **solo** body `overflow-y-auto`; ancho `90vw max-w-md` | Asertos de clases y estructura (centrado y z-index incluidos); revisión manual de altura, scroll real y aspecto a 375/1440 | Auto + Manual |
| **AC-05** | RF-05 | Se ven `Asistente de ayuda`, `Demostración · No es una IA real` y `Vista de diseño: contenido de ejemplo; aún no responde preguntas.`; la marca está en el header, fuera del scroll, visible a 375×812 sin scroll, en ambos estados; fuera de `MARCA_DEMO`/`NOTA_DISENO` no hay textos de IA real (`inteligencia artificial`, `modelo de lenguaje`, `aprendo`, `entiendo`, `asistente inteligente`); la única «IA» es la marca | `getByText` literales; `getByRole("heading", {name: "Asistente de ayuda"})`; `queryByText(/inteligencia artificial/)`, `queryByText(/modelo de lenguaje/)`, `queryByText(/aprendo/)`, `queryByText(/entiendo/)` y `queryByText(/asistente inteligente/)` ausentes; `const ia = getAllByText(/IA/); expect(ia).toHaveLength(1); expect(getByText("Demostración · No es una IA real")).toContainElement(ia[0]);` inspección de que el header es `shrink-0` y la marca no está en el body scrolleable; revisión visual | Auto + Manual |
| **AC-06** | RF-06 | En vacío: `TEXTO_VACIO` exacto, las cuatro sugerencias exactas y `AVISO_RESERVA` exacto; los chips tienen `aria-disabled="true"` y no añaden mensajes al pulsarlos | `getByText` literales; chips aislados **por rol y nombre**: `getByRole("button", {name: <cada SUGERENCIA>})` para los cuatro (no `getAllByRole("button")` a pelo, que incluiría `Cerrar asistente de ayuda` y `Enviar`); aserto de `aria-disabled="true"` en cada chip; `fireEvent.click` sobre cada uno y aserto de que el log sigue vacío | Auto |
| **AC-07** | RF-07 | En `conversacion`: `Conversación de ejemplo` y las cuatro burbujas exactas en orden, con etiquetas `Tú`/`Asistente` en `span.sr-only`; **no hay chips de sugerencia**; no hay transición desde vacío ni botón de cambio | Render con `estadoVisual="conversacion"`; `getByText` de cada literal de burbuja; **orden DOM** verificado con `compareDocumentPosition` sobre los cuatro nodos en secuencia (`expect(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()`); con el arreglo evaluado elemento a elemento: `const etiquetasTu = getAllByText("Tú"); expect(etiquetasTu).toHaveLength(2); etiquetasTu.forEach((nodo) => expect(nodo).toHaveClass("sr-only"));` e igual para `Asistente`; ausencia de chips comprobada **por rol de botón**, no por texto: `queryByRole("button", {name: "¿Cómo entro al panel?"})`, `... {name: "¿Dónde veo mis tarjetas?"}`, `... {name: "¿Se guardan mis datos?"}` y `... {name: "¿Cómo salgo del demo?"}` ausentes (dos burbujas repiten literalmente `SUGERENCIAS[0]` y `SUGERENCIAS[2]`, así que `queryByText` daría falso positivo); `within(log).queryByText("Conversación de ejemplo")` ausente; aserto de ausencia de control de cambio; source check de que no hay máquina de estados | Auto + Fuente |
| **AC-08** | RF-08 | El log existe desde la apertura con `role="log"`, `aria-live="polite"`, `aria-relevant="additions"`, `aria-atomic="false"`, `aria-label="Mensajes del asistente"`; contiene **solo mensajes**: en `vacio` no tiene hijos y `TEXTO_VACIO`/chips quedan fuera; en `conversacion` contiene solo las cuatro burbujas y `TEXTO_EJEMPLO` queda fuera | `getByRole("log")`; asertos de atributos; `expect(log.childElementCount).toBe(0)` en vacío; `within(log).queryByText(TEXTO_VACIO)` ausente y ausencia de chips **por rol de botón** dentro del log: `within(log).queryByRole("button", {name: <cada SUGERENCIA>})` ausentes (no `queryByText`: `SUGERENCIAS[0]`/`[2]` coinciden literalmente con dos burbujas); en conversación, `within(log).getByText(<cada texto de burbuja>)` para los cuatro literales y `within(log).queryByText(TEXTO_EJEMPLO)` ausente | Auto |
| **AC-09** | RF-09 | Footer con `AVISO_RESERVA`, label `Tu pregunta` **visualmente oculto con `sr-only`** y asociado por `for`/`id`, input con `placeholder`, botón `Enviar` con `aria-disabled="true"`; no hay `<form>`, `onSubmit`/`onClick` de envío, `onChange`, `value` controlado, `useState`/`useReducer` ni estado de conversación; el input recibe foco y es editable solo para revisar foco/teclado; escribir no cambia el log; `NOTA_DISENO` y `AVISO_RESERVA` declaran que no hay respuesta | `getByLabelText("Tu pregunta")`; aserto de que no tiene `onChange` ni `value` (débil en jsdom: la evidencia real es el `grep`, porque React no refleja props como atributos); `userEvent.type` y aserto de que el log sigue vacío; `getByRole("button", {name: "Enviar"})`; aserto de `aria-disabled`; `querySelector("form")` ausente; `grep -n "onChange\|value=\|useState\|useReducer\|setMensajes"` **solo en el componente nuevo del asistente**, sin coincidencias; manual con teclado virtual | Auto + Manual |
| **AC-10** | RF-10 | Todo el color del código nuevo usa tokens; el disparador conserva su `className` heredado (con sus literales) y el icono no añade `#`; **0** literales `#` en las **líneas añadidas del diff de los JS/JSX de producción tocados** (`src/**/*.js` y `src/**/*.jsx`, **excluyendo las suites** `*.test.jsx`/`*.test.js`); el barrido se acota a producción por **decisión del usuario (2026-10-19)** porque las pruebas copian **verbatim** el `className` heredado que AC-01 exige comparar **literalmente** (incluirlas daría un falso positivo garantizado); si el `className` heredado del disparador aparece en el diff, es un fallo; contraste AA del texto sobre el panel; sin texto sobre el scrim. **AC-01 queda intacto:** la comparación **literal** del `className` del disparador sigue siendo obligatoria | `git status --porcelain`; `git diff --unified=0 -- '*.js' '*.jsx' ':(exclude)*.test.jsx' ':(exclude)*.test.js'` y revisión de las líneas añadidas (`^+`, excluyendo `+++`): **0** con `#`; ojo: `git diff` **no** ve archivos nuevos sin trackear → el componente nuevo **de producción** se lee completo o se registra con `git add -N` antes del diff (las suites quedan fuera del barrido y **no** se auditan por hex); si el `className` heredado del disparador aparece en el diff, fallo; medición manual con el protocolo de la 013 (fondo compuesto incluido) | Fuente + Manual |
| **AC-11** | RF-11 | Sin modal 1/1 en el tope y 2/1 con scroll; con modal 2/1 y 3/1; el scrim no tiene `backdrop-filter` y no se cuenta; no hay blobs nuevos | Conteo manual tipo M-8 a 1440×900 y 375×812, con/sin scroll; inspección de clases (sin `backdrop-blur` en el scrim) | Manual + Fuente |
| **AC-12** | RF-12 | No hay motor, guion, texto libre procesado, máquina de estados, persistencia, IA, backend, red, rutas, endpoints, dependencias ni `soporte@finapp.com`; `AuthModal`, `Header`, configs e `index.html` intactos; 013 y 015 intactas; en `MEMORY.md` solo cambia ruta/estado (`:27`, `:31`, `:41`, con el texto de hex verbatim) y la deuda de hex **sigue declarada, sin cobertura** por la 014 | `grep` de `fetch`, `api.config`, `onSubmit`, `onChange`, `useState`, `useReducer`, `localStorage`, `soporte@finapp.com` **en el componente nuevo del asistente** (no en `PaginaInicio`, donde vive el estado de apertura/cierre de la página); `git diff --stat`; `git status`; inspección de `package.json` sin cambios; `git diff --stat -- specs/013-calidad-css/spec.md specs/015-higiene-y-dobles/spec.md` vacío; `git diff -- MEMORY.md` limitado a ruta/estado en `:27`, `:31`, `:41`, hex verbatim y `:37` intacto; comprobar que DP-04/§10/§13/§15 siguen declarando la deuda | Fuente + Auto |

**M-3b:** no se re-mide. AC-01 solo verifica `className`/fuente; el blur de 12 px del disparador es
una constancia **manual opcional** con el protocolo de la 013, no un AC automático.

---

## 9. Matriz de validación (auto / manual)

| Qué | Cómo | Tipo |
|---|---|---|
| Estructura del panel, header/body/footer, clases de scroll y ancho | Vitest con `render` y asertos de clases/estructura; sin medir layout | **Auto** |
| Literales exactos de marca, nota, aviso de reserva, vacío, sugerencias y burbujas | `getByText`/`getByRole` con los textos de §4.3 | **Auto** |
| ARIA del diálogo, log, cierre, campo y botón | Asertos de `role`, `aria-*`, `aria-disabled`, label | **Auto** |
| Apertura/cierre por «X», Esc (foco en campo), scrim y retorno de foco | Vitest + `userEvent` + punteros; espías de cierre y `document.activeElement` | **Auto** |
| Gesto de deslizar en móvil | Requiere punteros y viewport; si no se simula con fidelidad, **manual** | **Manual** |
| Disparador: icono `BotMessageSquare`, `aria-label="Abrir el asistente de ayuda"`, `className`, `ref` (fuente o retorno observable), `onClick`; sin `aria-haspopup`/`aria-expanded`; sin glifo `?`; no abre `AuthModal`; `fetch` no se llama | Vitest + `MemoryRouter` + espía de `fetch`; comparación literal; `disparador.querySelector("svg")` (no `within(...).querySelector`); `within(disparador).queryByText("?")` ausente | **Auto + Fuente** |
| Altura real, `max-h-[85vh]`, scroll del body, footer fijo, 320/375/1440 y zoom 200 % | Navegador; jsdom no calcula layout ni implementa `scrollIntoView` | **Manual** |
| Contraste AA del texto sobre el panel compuesto | Protocolo de medición de la 013, con fondo compuesto incluido | **Manual** |
| Teclado virtual en móvil | Dispositivo/emulación; `max-h-[85vh]` es el diseño aprobado; estrategia de viewport visible diferida a la spec de comportamiento | **Manual** |
| Marcas visible/persistente a 375×812 sin scroll | Navegador; el header `shrink-0` y la marca/nota fuera del body scrolleable se revisan a ojo | **Manual** |
| Fluid Glass: 2/1 y 3/1; scrim sin blur; sin blobs nuevos | Conteo manual tipo M-8 + inspección de clases | **Manual + Fuente** |
| Cero hexadecimales nuevos (solo **producción**) | `git status --porcelain`; `git diff --unified=0 -- '*.js' '*.jsx' ':(exclude)*.test.jsx' ':(exclude)*.test.js'` y revisión de las líneas añadidas (`^+`, excluyendo `+++`): 0 con `#`; el barrido **excluye las suites** porque copian **verbatim** el `className` heredado que AC-01 exige comparar **literalmente** (incluirlas daría un falso positivo garantizado; decisión del usuario 2026-10-19); los archivos nuevos **de producción** sin trackear no aparecen en `git diff`: se leen completos o se registran con `git add -N`; el `className` heredado del disparador no debe aparecer en el diff | **Fuente** |
| M-3b (blur 12 px del disparador) | No se re-mide; si se constata, protocolo manual de la 013 | **Manual opcional** |
| Cero lógica/red/dependencias | `grep` de motores, `fetch`, `api.config`, `onSubmit`, `onChange`, `useState`, `useReducer`, `localStorage`, `soporte@finapp.com` **en el componente nuevo del asistente** (no en `PaginaInicio`, que alberga el estado de apertura/cierre del cromo); `package.json` sin cambios; 013/015 sin cambios | **Fuente + Auto** |
| No regresión | `npm test` **518/518 en 33 archivos** (479 de la línea base + 39 nuevas) y `npm run build` verde | **Auto + build** |

**Comandos previstos:** `npx vitest run <suite-nueva>`; `npm test`; `npm run build`;
`git status --porcelain`; `git diff --unified=0 -- '*.js' '*.jsx' ':(exclude)*.test.jsx' ':(exclude)*.test.js' | grep '^+' | grep -v '^+++' | grep '#'` (sin coincidencias; el barrido **excluye las suites**, que copian verbatim el `className` heredado que AC-01 compara **literal**; `git diff` no ve archivos nuevos sin trackear: los de producción se leen completos o se registra con `git add -N`); `grep -n "onChange\|value=\|useState\|useReducer"` **en el componente nuevo del asistente**.
No se declara una validación como superada sin ejecutarla.

---

## 10. Fuera de alcance / pendiente

- **Motor de coincidencia, guion de respuestas, texto libre procesado, máquina de estados,
  reinicio/conservación, persistencia, IA, backend, red, dependencias nuevas:** spec futura de lógica
  del asistente; **nada** de esto se implementa aquí.
- **Buzón `soporte@finapp.com`:** no es real; **no se muestra**.
- **Hexadecimales en JSX:** **sin decidir**. La deuda **no está cubierta** por esta spec. Solo se
  corrige ruta/estado en `MEMORY.md:27`, `:31`, `:41` (§15) y el texto de hex sobrevive **verbatim**;
  `MEMORY.md:37` no se toca. Referencias desalineadas: 013 `spec.md:59`, `:155`, `:378`, `:658` y 015
  `spec.md:48`, `:134`, `:162`; quedan declaradas, no corregidas.
- **«Usuario» del `Header`:** no se toca (DP-03).
- **Integración en el dashboard u otras rutas:** no.
- **Cambios en `AuthModal`, cromo de 010/011 o modales existentes:** no.
- **Nuevas rutas, páginas, endpoints, datos o formatos:** no.
- **Corrección de `MEMORY.md` (salvo ruta/estado de §15), 013/015 o specs cerradas:** no.

---

## 11. Impacto en specs cerradas

| Spec | Relación | Impacto y resolución |
|---|---|---|
| **010** | Cromo modal congelado. | El asistente es una **nueva** superficie modal (la quinta del cromo de 010) y **DEBE** cumplir RF-01..RF-08, RF-16 y RF-22. No se modifica ninguna existente; la «X» reutiliza `BotonCerrar`; Esc, scrim, gesto y foco reutilizan las piezas comunes. |
| **011** | Retorno de foco y trampa. | `triggerRef` apunta al disparador de robot; si desaparece, cadena estable de 011. Sin candidato válido no llama a `focus()` sobre `body` ni sobre un nodo desconectado (`useRetornoDeFoco.js:88`); el foco puede quedar en `body` si no había origen. No se toca el cruce de 768 px. |
| **013** | El control excluido de M-3b y único `backdrop-blur-md` restante; su texto lo llama «botón ?». | **Impacto declarado:** `className` intacto; el mismo botón 44×44 y blur 12 px en ≤640 px; a efectos de M-3b solo cambia el glifo por `BotMessageSquare` y el nombre accesible (el `onClick`/`ref` no alteran el filtro). M-3b sigue vigente **sin re-medir M-3b ni el inventario de seis superficies** y **sin reabrir ni modificar** la 013. El panel nuevo no pertenece al conjunto de la 013. |
| **008/009** | Eliminaron el header del dashboard. | No se reintroduce header, no se toca `Header`, no se reabre la rama «Usuario». |
| **015** | Higiene de cabeceras. | No se tocan cabeceras ajenas ni dobles; las suites cerradas no se modifican ni se corrigen sus referencias de hex. |
| **001** | Contrato Fluid Glass. | Panel 24 px, fallback, transparencia y movimiento; scrim sin blur; sin blobs nuevos. |
| **005/006/007** | Capas y navegación. | Sin impacto: no se mueven archivos, no se cambian props de `Card` ni la navegación. |

---

## 12. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El modal añade una **tercera** superficie al hacer scroll | Alcanza el límite (3/1), no lo supera | El conteo correcto es **3** (header + hero + panel); el scrim queda fuera. Solo si el scrim llevara `backdrop-filter` sería la cuarta y sí se superaría; panel como única superficie nueva; conteo §3.3; AC-11 manual |
| Se confunde el diseño con lógica real | Expectativa falsa de respuestas | Marca `Demostración · No es una IA real`, nota `Vista de diseño…`, controles `aria-disabled` y RF-12 |
| El scrim se implementa con blur por copiar otro modal | Sube el conteo y rompe el presupuesto | El diseño fija `bg-bg-dark/70` sin blur; la 013 ya excluye velos; AC-11 |
| El panel scrollea completo y el footer se pierde | El campo/aviso dejan de estar visibles | DP-06: panel `overflow-hidden`, body único scroll, footer `shrink-0`; AC-04 y CL-04 |
| El `aria-label` del disparador no es el literal | Se altera el nombre accesible obligatorio | DP-02: `Abrir el asistente de ayuda`; AC-01 lo compara literal |
| Se añaden `aria-haspopup`/`aria-expanded` sin estar autorizados | Semántica/estado extra en el disparador | DP-02: solo icono, `aria-label`, `onClick` y `ref`; AC-01 verifica ausencia |
| Se toca el `className` del disparador | Se invalida M-3b de la 013 | RF-01/AC-01: comparación literal; solo icono, label, handler y ref |
| Se cuela un hexadecimal nuevo | Rompe la regla de tokens | RF-10/AC-10: revisar el diff de líneas añadidas de los JS/JSX **de producción** tocados (`src/**/*.js` y `src/**/*.jsx`), **excluyendo las suites** `*.test.jsx`/`*.test.js` (decisión del usuario 2026-10-19); el `className` heredado del disparador no debe aparecer en el diff |
| El teclado virtual tapa el campo | El diseño no es usable en móvil | CL-06 manual; panel `85vh`, footer fijo, body scrolleable; estrategia de viewport diferida a la spec de comportamiento |
| El foco se pierde al cerrar | Accesibilidad rota | `triggerRef`, `useRetornoDeFoco`, cadena 011; AC-02 |

---

## 13. Trazabilidad

| Fuente | Decisión / requisito | Dónde |
|---|---|---|
| `spec-ambiguedades.md:2` | El disparador deja de abrir login y pasa a la ayuda | Cabecera, §1, RF-01, RF-02 |
| Decisión del usuario — «por el momento solo el diseño» | Sin lógica ni guion; dos estados estáticos | §2.2, RF-06, RF-07, RF-12, DP-01, DP-07 |
| Decisión del usuario — robot + nombre accesible | `BotMessageSquare`, `Abrir el asistente de ayuda`, `onClick` y `ref`; M-3b no se reabre | RF-01, DP-02, AC-01 |
| Decisión del usuario — «Usuario» no se toca | Descartado, sin RF ni AC | DP-03, §10 |
| Decisión del usuario — hex sin decidir | Fuera de alcance; referencias desalineadas, sin cobertura | DP-04, §10, §13, §15 |
| Decisión del usuario — correo no real | `soporte@finapp.com` no se muestra | DP-08, §10, RF-12 |
| `src/pages/PaginaInicio.jsx:44-48`, `:51-58` | `AuthModal` montado cerrado; disparador actual | §3.1, RF-01, RF-02, AC-01/02 |
| `src/components/domain/modales/AuthModal.jsx:78`, `:98` | `null` cerrado; `fetch` en el envío | §3.1, DP-05, CL-11 |
| `specs/010-cierre-de-modales/spec.md:386-456`, `:508-515`, `:536-544` | Cromo congelado | §3.2, RF-02/03, AC-02/03 |
| `specs/011-foco-de-superficies-y-cruce/spec.md:484-510`; `src/hooks/useRetornoDeFoco.js` | Retorno de foco y trampa | RF-02/03, CL-10 |
| `specs/013-calidad-css/spec.md:275-300`, `:283`, `:852`, `:672` | Scrim/controles no son superficies; M-3b | §3.3, RF-01, RF-11, DP-02, AC-01/11 |
| `src/components/layout/DashboardUserModal.jsx:109`, `:161`; `src/components/ui/BotonCerrar.jsx:22-30` | Panel claro, scrim y «X» | §4.1, RF-03/04, AC-03/04 |
| `src/styles/index.css:15-22`, `:30`; `AGENTS.md:41-44`; `.agents/rules/rules.md:26-29` | Tokens, radio y prohibición de hex nuevos | §3.4, RF-10, AC-10 |
| `src/components/domain/landing/Hero.jsx:30`, `:75`; `src/components/layout/Header.jsx:36` | Superficies/blobs de la landing | §3.3, RF-11, AC-11 |
| `AGENTS.md:43-44`; `.agents/rules/rules.md:37-38` | Límite 3 superficies / 2 blobs | RF-11 |
| `MEMORY.md:27`, `:31`, `:41`; 013 `spec.md:59`, `:155`, `:378`, `:658`; 015 `spec.md:48`, `:134`, `:162` | Hex/contraste atribuidos a la 014, desalineados; la deuda sigue declarada y **sin cobertura** por la 014. `MEMORY.md:37` no se toca | DP-04, §10, §15, AC-12 |

---

## 14. Preguntas abiertas

**No hay preguntas abiertas.** Las decisiones de §7 —icono `BotMessageSquare`, `aria-label` literal,
solo icono/label/onClick/ref, controles presentacionales y gesto de 010—, las resoluciones de la
revalidación —M-3b no se re-mide; teclado virtual manual; `conversacion` solo por prop; `ref` por
efecto observable o fuente; sin candidato no se fuerza `body`; contraste con protocolo 013— y las
**dos decisiones del usuario del 2026-10-19** —el barrido de hexadecimales se **acota a producción**
(excluye las suites `*.test.jsx`/`*.test.js`, con AC-01 intacto) y la etiqueta `Tu pregunta` va
`sr-only`— son **vinculantes** para esta fase.

---

## 15. Cambios autorizados en `MEMORY.md` (los aplica el implementer)

Regla autorizada: **solo ruta y estado**. La ruta obsoleta `specs/014/` pasa a
`specs/014-asistente-de-ayuda/` donde aparezca, y el estado de la 014 queda en
**«aprobada (2026-10-19)»**: la aprobación fue anterior a la implementación (commit `cfdd1af`). El
texto sobre hexadecimales se conserva **verbatim** en las líneas donde esté: la deuda de hex sigue
**sin decidir** y esta spec **no la cubre**.

| Línea | Contenido inicial (extracto) | Acción aplicada | Resultado real |
|---|---|---|---|
| `MEMORY.md:27` | `- \`specs/014/spec-ambiguedades.md\` — sin planificar (botón «?» de \`PaginaInicio\`, «Usuario» del Header del dashboard, hex de JSX → tokens).` | Corregida **ruta y estado** en `cfdd1af`; quedó como línea de referencia de la 014 (no se añadió otra) | `- \`specs/014-asistente-de-ayuda/spec.md\` — aprobada (2026-10-19); plan y tareas escritos (10 tareas): botón «?» de \`PaginaInicio\`, «Usuario» del Header del dashboard, hex de JSX → tokens.` (las palabras sobre hex **sobreviven verbatim**) |
| `MEMORY.md:31` | `- **Spec 014:** redactar spec y planificar (botón «?» de \`PaginaInicio\`, «Usuario» del Header en modo dashboard, migración de hex de JSX a tokens: 72 clases en 10 archivos).` | `cfdd1af` fijó el estado **«aprobada (2026-10-19)»**; T10 añadió el estado de cierre | `- **Spec 014:** aprobada (2026-10-19); plan y tareas escritos (10 tareas): botón «?» de \`PaginaInicio\`, «Usuario» del Header en modo dashboard, migración de hex de JSX a tokens: 72 clases en 10 archivos. T1–T10 hechas (2026-10-19); resultado **518/518 en 33 archivos**; pendiente el commit de cierre.` (hex **verbatim**) |
| `MEMORY.md:37` | `- **Sin commitear (ajenos):** \`analicis-completo-cambios.md\`, \`specs/014/spec-ambiguedades.md\`.` | **No se tocó** | Igual: es el registro de archivos ajenos sin commitear; no es ruta/estado de la 014. |
| `MEMORY.md:41` | `- **Spec 014 — sin spec redactada:** intención del botón «?» de \`PaginaInicio\`, propósito del «Usuario» del Header en modo dashboard, y si se migran los hex de JSX a tokens.` | Corregida **estado** en `cfdd1af` | `- **Spec 014 — aprobada (2026-10-19):** intención del botón «?» de \`PaginaInicio\`, propósito del «Usuario» del Header en modo dashboard, y si se migran los hex de JSX a tokens.` (hex **verbatim**) |

**Sin línea de referencia adicional:** la fila `:27` ya ejerce esa función desde `cfdd1af`; por eso
no se insertó una línea nueva ni se desplazaron las antiguas `:31` y `:41`.
