# Spec 012 — Correcciones menores: medición inicial de `useBreakpoint`, clase muerta de `AuthModal` y fecha inválida en `LogMovimientos`

**Estado: borrador**
**Fecha:** 2026-10-16
**Última revisión:** 2026-10-16 (las tres preguntas del borrador quedaron **cerradas por el usuario**:
**Q1 = opción (b)** — se permite ajustar `vitest.setup.js` y las suites afectadas para que el mock de
`matchMedia` sea coherente con `innerWidth`; **Q2 = opción (a)** — formato estricto `AAAA-MM-DD` con
dos dígitos por campo, mes validado (1–12) y **día no validado**; **Q3 = opción (b)** — se **mantiene
el `TypeError`** actual: `formatearFechaCorta` espera una **cadena** y **no** es una función total.
Además, la detección de la fecha desde un «mensaje de ingreso» y cualquier calendario/selector de
fecha de respaldo los hará el **backend** ⇒ **fuera de alcance** del frontend.)
**Revisión del reviewer (2026-10-17):** veredicto «cambios necesarios» con 12 hallazgos; **todos
aplicados** en esta versión: AC-02 se verifica sobre el **primer render comprometido** mediante una
**sonda de renders** (`result.current` es post-efecto y nacería verde; `result.all` no existe en RTL
16.3.3), RF-13 admite **una única excepción** (el mock incoherente del caso TDD), y se precisan
RF-09, RF-12, CL-07 (año no validado), CL-08 (supuesto de fecha), CL-10 (dato del carácter U+2014) y
AC-04 (no ejecutado).
**Ampliación por coordinación con la 011 (2026-10-17):** el stub **local** de
`DashboardUserModal.test.jsx` **entra en alcance** (ya no es opcional) y el apartado que lo excluía se
integra en §7.1-B, porque la 011 elige el **respaldo de foco por versión de vista** vía
`useBreakpoint` (§3.4, RF-13, DP-12, AC-13). Q1/Q2/Q3 y el resto del inventario **no** cambian. La 011
ya documenta la **dependencia bidireccional** y el **orden** («012 primero, la 011 se re-mide
después») en su **§3**, **§8**, **§9**, **§10** y **§11-H4**.
**Limpieza de citas cruzadas (2026-10-17):** las referencias de esta spec a la 011 dejan de usar
números de línea (frágiles ante las ediciones manuales del usuario, DP-21) y pasan a ser **estables por
sección/RF** («011 §5.A / RF-05», «011 §5.B / RF-09», «011 §2.2», «§3 de la 011»…); la contradicción
que esta spec señalaba ya está **resuelta** por la 011 (§3.4).
**Petición del usuario:** tres correcciones puntuales que van juntas en esta única spec:
(1) «Mismatch de hidratación en `useBreakpoint.js`»; (2) «Quitar clase inexistente `animate-fadeIn`
de `AuthModal.jsx`»; (3) «Validar mes inválido en `formatearFechaCorta` de `LogMovimientos.jsx`».
**Decisión ya tomada por el usuario (no se reabre):** en `formatearFechaCorta`, ante **mes inválido**
(fuera de 1–12) o una entrada que **no cumpla estrictamente** el formato `AAAA-MM-DD` (dos dígitos por
campo), el resultado es el **texto neutro «—»** (criterio formal en RF-08/RF-09, §4).
**Basada en:** Spec 009 (dos versiones de vista, corte único 768px, contrato de 4 props y defaults por
banda), Spec 010 (T7: `AuthModal`; aspecto y hexadecimales heredados quedaron **fuera de alcance**),
Spec 004 (T2: `LogMovimientos` y `formatearFechaCorta`); **coordinada con** la Spec 011
(`specs/011-foco-de-superficies-y-cruce/spec.md`, borrador: respaldo de foco por versión de vista).
**Re-verificación:** todas las referencias `archivo:línea` de esta spec se comprobaron contra el estado
real del repositorio el **2026-10-16** y se **re-verificaron el 2026-10-17** (incluido el traslado de
la spec 011 a `specs/011-foco-de-superficies-y-cruce/`). El usuario sigue editando a mano (DP-21,
regla heredada de la spec 010: `specs/010-cierre-de-modales/spec.md:693`): deben **volver a
re-verificarse** antes de escribir el plan y antes de implementar.
**Alcance:** tres correcciones puntuales y **limitadas**. Ninguna habilita rediseño, refactor ni
cambios de datos.

---

## 1. Propósito

Tres defectos pequeños, independientes entre sí, que ensucian el comportamiento observable del
proyecto. Se especifican juntos **solo** porque el usuario lo pidió así; cada uno se corrige por su
cuenta y ninguno depende de los otros.

1. **`useBreakpoint` mide dos veces con dos fuentes distintas.** El estado inicial se calcula con
   `window.innerWidth` y el efecto de suscripción lo sobrescribe con `matchMedia`. Cuando ambas
   medidas no coinciden, el primer render comprometido muestra una composición distinta de la
   medida y el consumidor (`DashboardLayout`) vuelve a renderizar: en jsdom la discrepancia es
   **determinista** y en navegador es **condicional** (borde de 768px, zoom, barra de
   desplazamiento clásica). El usuario lo llamó «mismatch de hidratación»; **no hay SSR ni
   hidratación** en el proyecto, así que el propósito se formula como lo que realmente es: una
   **única fuente de verdad del snapshot inicial**.
2. **Una clase que no existe.** `AuthModal` declara `animate-fadeIn` en la capa exterior, pero esa
   utilidad no existe en el proyecto ni en Tailwind: es una clase muerta que no produce ninguna regla
   CSS. Su retirada es inocua y deja el marcado sin referencias fantasma.
3. **Una fecha inválida se imprime en pantalla.** `formatearFechaCorta` indexa el mapa de meses sin
   validar el mes, de modo que un mes fuera de rango o una fecha no parseable se muestran como
   «12 undefined 2026» en lugar de un valor neutro. Debe devolver **«—»**.

**Qué NO es esta spec:** no es una reintroducción de SSR, ni un refactor del hook, ni una limpieza de
la deuda técnica de `AuthModal`, ni una validación completa de fechas. Tampoco cubre la **obtención**
de la fecha (ni su detección desde un texto, ni un calendario/selector de respaldo): eso es del
**backend** (§2.2).

---

## 2. Alcance

### 2.1 Incluido

- **Corrección (1) — medición inicial de `useBreakpoint`:** que el valor inicial de la medida de
  versión de vista y del estado por defecto de banda provenga de la **misma fuente** que usa la
  suscripción posterior (las `matchMedia` del corte de 768px y del umbral de 1024px), de modo que el
  **primer render comprometido** coincida con el valor medido y no existan dos fuentes de la misma
  medida. **Sin** cambios de contrato (4 props), **sin** cambios de los defaults por banda, **sin**
  cambios del corte único de 768px y **sin** tocar `toggleSidebar` ni la persistencia.
- **Corrección (2) — clase muerta de `AuthModal`:** retirar `animate-fadeIn` del listado de clases de
  la capa exterior de `src/components/domain/modales/AuthModal.jsx`. Nada más de ese archivo.
- **Corrección (3) — `formatearFechaCorta` de `LogMovimientos`:** devolver el texto neutro «—» ante
  **mes fuera de 1–12** o ante una entrada que **no cumpla estrictamente** el formato `AAAA-MM-DD`
  (dos dígitos por campo), conservando intacto el resultado para las fechas válidas.
- Las **pruebas** de las tres correcciones y la no-regresión de las suites afectadas.
- **Ajuste de la infraestructura de pruebas (Q1, opción (b) aprobada):** el stub global de
  `matchMedia` de `vitest.setup.js` pasa a ser **coherente** con `innerWidth`, y se ajustan las
  suites que hoy dependen de ese stub incoherente (inventario de archivos y garantías de medición en
  §7.1 y §7.2).
- **Ampliación de alcance acordada por coordinación con la 011 (2026-10-17, no viene de Q1):** el
  stub **local** de `matchMedia` de `src/components/layout/DashboardUserModal.test.jsx` (`:34-50`)
  pasa a ser **coherente** con `innerWidth` con el **mismo criterio** que el stub global, porque la
  011 resuelve el respaldo de foco **por versión de vista** y esa suite debe medir **una única**
  versión de vista. Detalle y criterio en §7.1-B; dependencia en §3.4 y §9.
- La **actualización de la cabecera JSDoc** de los archivos tocados, para que no documenten el
  contrato corregido de forma incompleta (medición / texto neutro / contrato de cadena).

### 2.2 Fuera de alcance (explícito)

- **SSR, hidratación y `hydrateRoot`.** El proyecto no tiene SSR (hechos en §3.1) y esta spec **no**
  lo introduce. La corrección (1) es de fuente única, no de renderizado en servidor.
- **Refactor o rediseño de `useBreakpoint`:** no se cambian nombres de props, ni el corte, ni los
  umbrales, ni el contrato de preferencia, ni la clave de persistencia, ni cuándo se escribe.
- **Aspecto, hexadecimales heredados y estructura de `AuthModal`.** La spec 010 ya dejó su aspecto
  fuera de alcance; aquí **no** se migran colores ni se tocan clases distintas de la retirada.
- **Crear la animación que falta.** No se añade `@keyframes`, ni un token `--animate-*`, ni
  `animate-fadeIn` con CSS propio: la clase es muerta y se retira, no se implementa.
- **Validaciones de fecha no pedidas:** rango del **día** (`"2026-10-99"`), fechas futuras/pasadas,
  zonas horarias, `Date`/`Intl`, formatos alternativos (con o sin hora) y **normalización de la
  entrada** (espacios, otros separadores, ceros de más). Solo entran el **mes** (1–12) y el
  **cumplimiento estricto del formato `AAAA-MM-DD`** (Q2, opción (a) confirmada).
- **Guardas de tipo en `formatearFechaCorta`:** la función espera una **cadena** y **no** es una
  función total; con una entrada de otro tipo se **mantiene** el `TypeError` actual (Q3, opción (b)).
  No se añade guarda de tipo, ni conversión, ni valor por defecto.
- **Otras superficies:** `ModalTarjeta`, `DashboardDrawer`, `DashboardUserModal`, layout, navegación.
- **Rutas, contenido de páginas, datos** (`src/data/tarjetasDemo.js`), `TRIAL_ACTIVO`, endpoints,
  backend y autenticación.
- **Detección de la fecha a partir de un «mensaje de ingreso» y cualquier calendario o selector de
  fecha de respaldo.** Los hará el **backend**: quedan **expresamente fuera de alcance** del frontend
  y de esta spec. El frontend solo **presenta** una fecha ya recibida (hoy, `AAAA-MM-DD` del fixture):
  no infiere fechas desde texto libre, no completa campos de fecha y no ofrece alternativas de
  selección. **Supuesto declarado:** el backend entrega **siempre** una cadena de fecha; el caso
  «fecha ausente/no determinada» se define en la spec del backend, no aquí (CL-08).
- **Los documentos de las specs 004, 009, 010 y 011:** no se reabren ni se sanean. La 011
  (`specs/011-foco-de-superficies-y-cruce/spec.md`, **borrador**, ya no se llama «retorno de foco del
  drawer») trata el foco de las cuatro superficies y el traslado al cruzar el corte de 768px: **no se
  toca**; solo se **coordina** con ella el entorno de pruebas (§3.4).
- **Dependencias nuevas**, librerías de animación, cambios de build y superficies/animaciones nuevas.
- **Cambios de la infraestructura de pruebas más allá de lo acordado:** el alcance se limita a
  `vitest.setup.js`, a las suites que dependen de su stub incoherente y al **stub local** de
  `DashboardUserModal.test.jsx` (ampliación por coordinación con la 011, §7.1-B), más el **caso TDD**
  de AC-02 (excepción única de RF-13). `vitest.config.js` y el resto de la configuración **no** se
  tocan.

---

## 3. Diagnóstico (evidencia re-verificada el 2026-10-16)

### 3.1 Corrección (1) — dos fuentes para la misma medida

Hechos verificados:

- **No hay SSR ni hidratación.** `src/main.jsx:10` importa `createRoot` de `react-dom/client` y
  `src/main.jsx:15` monta con `createRoot(document.getElementById("root")).render(...)`. En todo
  `src/` hay **0** coincidencias de `hydrateRoot` y **0** de `renderToString`. Por tanto
  «hidratación» **no** es literal: no existe un HTML servido que React hidrate.
- **Dos fuentes de la misma medida.** El estado inicial se calcula con `window.innerWidth`:
  `src/hooks/useBreakpoint.js:28-36` (`medirEsDesktop()` → `window.innerWidth >= 768`;
  `medirAnchoGrande()` → `window.innerWidth >= 1024`), usadas como inicializadores en
  `src/hooks/useBreakpoint.js:40-41`. El efecto, en cambio, crea las dos `matchMedia`
  (`:44-45`), se suscribe a `change` (`:50-51`) y hace un **sync inicial** inmediato
  (`:52-53`: `sincronizarVersion()` / `sincronizarAnchoGrande()`).
- **Consecuencia.** El primer render comprometido usa `innerWidth`; el efecto —que corre **después**
  del commit— lo sobrescribe con `.matches`. Si ambas medidas discrepan, el consumidor
  (`DashboardLayout`) renderiza **dos veces** con composiciones distintas (una de ellas, la de
  móvil, monta `BottomNav` y el drawer). En navegador, la primera pasada puede llegar a pintarse
  (efecto tras pintado) ⇒ parpadeo/«flash» de la composición equivocada.
- **Contrato que hay que preservar** (spec 009): 4 props exactas —`isMobile`, `isDesktop`,
  `sidebarColapsada`, `toggleSidebar`— devueltas en `:73`; corte único de 768px en
  `QUERY_PANTALLAS_GRANDES` (`:12`); umbral de 1024px **solo** como default de banda en
  `QUERY_ANCHO_GRANDE` (`:14`); default por banda en `:61-62`
  (`sidebarColapsada = preferencia !== null ? preferencia : !anchoGrande`); sin `window` ⇒
  ambos `true` (`:29`, `:34`; CL-05 de la 009).
- **El hook tiene un consumidor indirecto muy repartido.** `src/hooks/useDeslizarParaCerrar.js:10`
  importa el hook y lo usa en `:48` (`const { isMobile } = useBreakpoint();`) para decidir si el
  gesto de deslizar aplica; ese hook lo usan `AuthModal.jsx:61`, `ModalTarjeta.jsx:69` y
  `DashboardUserModal.jsx:66`. Por tanto, además de `DashboardLayout.jsx:4,40`, **cualquier** suite
  que monte una de esas superficies ejerce la medición del hook: es la razón por la que la
  coherencia del stub de pruebas (global o local) importa y por la que se inventaría en §7.1.

**Honestidad de evidencia (¿reproducible en navegador o solo teórica?).**

- **En el entorno de pruebas: reproducible de forma determinista.** El stub global
  `vitest.setup.js:14-26` devuelve `matchMedia(...).matches === false` para **cualquier** query,
  mientras que `vitest.setup.js:28-33` fija `innerWidth = 1024`. Con esos dos valores, el primer
  render del hook dice «pantallas grandes y expandida» (desde `innerWidth`) y la medición del
  efecto dice «móvil y colapsada» (desde `matches`): la firma del defecto, observable en una
  prueba.
- **En navegador: no reproducido en esta fase.** Requiere que la medida de `innerWidth` y la de la
  media query discrepen, y eso solo ocurre en condiciones de borde: ventana justo en
  `[768, 768 + ancho de barra de desplazamiento clásica)` en escritorio (`innerWidth` incluye la
  barra; la media query evalúa el viewport de layout, que la excluye), y anchos fraccionarios o
  zoom en el corte (p. ej. 767,5px). Es un **riesgo real de borde**, no una reproducción medida:
  se registra como tal y **no** se declara verificado en navegador.

### 3.2 Corrección (2) — `animate-fadeIn` no existe

- `src/components/domain/modales/AuthModal.jsx:124` declara en la capa exterior
  (`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm
  animate-fadeIn`) la clase `animate-fadeIn`.
- **La clase es muerta.** Un barrido de `fadeIn`, `fade-in`, `fade_in`, `@keyframes` y
  `--animate` en el repositorio devuelve **una sola** coincidencia: esa línea. En
  `src/styles/index.css` no hay ningún `@keyframes` ni ningún token `--animate-*` en su bloque
  `@theme` (`:11`), **no hay `tailwind.config.*` en la raíz** (la configuración de Tailwind v4 vive
  en ese `@theme`) y `vite.config.js:13-15` solo registra `react()` y `tailwindcss()`. En Tailwind v4
  una utilidad
  `animate-<nombre>` solo se genera si existe un token `--animate-<nombre>` (o si es una de las
  utilidades integradas; ninguna se llama `fadeIn`) ⇒ **no se genera ninguna regla**: la clase no
  tiene efecto visual alguno.
- **Nada la aserta.** `src/components/domain/modales/AuthModal.test.jsx:66-71` comprueba la capa
  exterior solo por `fixed` e `inset-0`; ninguna prueba del repositorio menciona `fadeIn`.
- **Relación con la spec 010.** Su T7 trabajó `AuthModal` (cuatro formas de cierre y su suite) y dejó
  **fuera de alcance** su aspecto y sus hexadecimales heredados: esta corrección **no** debe migrar
  colores ni tocar nada más de esa superficie.

### 3.3 Corrección (3) — mes inválido interpolado como `undefined`

- El archivo real es `src/components/domain/dashboard/LogMovimientos.jsx`. El helper exportado está
  en `:21-24`:

  `const [anio, mes, dia] = fechaISO.split("-").map(Number); return `${dia} ${MESES_ES[mes - 1]} ${anio}`;`

  con el mapa de 12 meses en español en `:12-15`.
- **Fallo real:** si `mes - 1` no es un índice de 0 a 11, la indexación devuelve `undefined` y el
  valor se interpola en el texto. Ejemplos verificados leyendo el código:

  | Entrada | `mes` | Resultado actual |
  |---|---|---|
  | `"2026-10-12"` | 10 | `"12 oct 2026"` (**correcto**) |
  | `"2026-00-12"` | 0 | `"12 undefined 2026"` |
  | `"2026-13-12"` | 13 | `"12 undefined 2026"` |
  | `"2026-XX-12"` | `NaN` | `"12 undefined 2026"` |
  | `""` | `undefined` | `"undefined undefined 0"` |

- **Caso válido intacto:** el formato real de los datos es `AAAA-MM-DD` con relleno a dos dígitos
  (`src/data/tarjetasDemo.js:65-82`) y el día se imprime sin cero a la izquierda:
  `LogMovimientos.test.jsx:37-39` aserta `"12 oct 2026"`, `"1 oct 2026"` y `"8 oct 2026"`.
- **Consumidor y cobertura:** el único uso es la propia lista (`:54`); el helper está exportado
  (`:21`) pero **no tiene prueba directa**: se cubre de forma indirecta al renderizar el componente.
  Relación: spec 004, T2 (creación del componente y del helper).

### 3.4 Coordinación con la spec 011 (dependencia bidireccional)

**Hecho acordado con el usuario (2026-10-17):** la **011** —hoy
`specs/011-foco-de-superficies-y-cruce/spec.md`, **borrador**, cuyo alcance pasó de «solo el drawer»
a las **cuatro superficies modales** y al **traslado de foco al cruzar el corte de 768px**— resuelve
el **respaldo de foco por versión de vista**: su **RF-05** (011, §5.A) fija el mapa de controles
estables por versión (móvil/≥768px/área pública) y su **RF-09** (011, §5.B) exige que
`DashboardUserModal` resuelva su respaldo «según la **versión de vista** actual»; la forma acordada
de obtener esa versión es **`useBreakpoint()`** (la fuente única de la versión de vista de la spec
009), no una lectura nueva de `matchMedia`.

**Por qué cruza con esta spec (bidireccional):**

- **011 → 012.** Si `useBreakpoint` midiera dos cosas distintas según el momento (la corrección (1)),
  el respaldo «por versión de vista» de la 011 podría elegir el control equivocado en el primer
  render; y las suites de la 011 (`DashboardUserModal.test.jsx` entre ellas) solo pueden afirmar
  **una** versión de vista si su entorno de pruebas mide **una sola** (§7.1-B). Por eso la coherencia
  del stub **local** de `DashboardUserModal.test.jsx` deja de ser opcional (**ampliación de alcance
  de esta spec**, no una consecuencia de Q1).
- **012 → 011.** La 011 **no** debe cambiar el contrato del hook ni la medición: esta spec lo
  preserva (RF-03) y deja la medición en **una sola fuente** (RF-01/RF-02), que es justo lo que la
  011 necesita para un respaldo estable por versión.

**Orden acordado:** se implementa la **012 primero** (medición y entorno de pruebas) y después la
011 se **re-mide** contra el estado resultante (mismo orden que registra la 011 en su §10). La 011
queda como documento **no tocado** por esta spec. Nota de rutas: la carpeta antigua
`specs/011-retorno-de-foco-drawer/` contiene solo una nota de **traslado**, no la spec vigente.

**Contradicción ya resuelta por la 011 (2026-10-17):** la redacción anterior de la 011 («no depende
de la 012») quedó **sustituida** por la **dependencia bidireccional** en su **§3** (tabla «Relación
con specs anteriores», entrada **012**), en su **§11-H4** y en su **§9** (riesgos), con el mismo
**orden acordado** («012 primero, la 011 se re-mide después»; §10 de la 011). Esta spec **no**
mantiene ninguna discrepancia abierta y **no cita líneas** de la 011: solo referencia sus secciones
y sus RF.

---

## 4. Requisitos Funcionales (EARS)

### Corrección (1) — medición inicial de `useBreakpoint`

- **RF-01 — Ubicuo — Fuente única del snapshot inicial.** **EL SISTEMA DEBE** obtener el valor
  inicial de la medida de versión de vista y del estado por defecto de banda de la **misma fuente**
  que la suscripción posterior (las media queries del corte de 768px y del umbral de 1024px), de
  modo que el **primer render comprometido** ya sea el valor medido y no existan dos fuentes
  independientes de la misma medida. El mecanismo concreto se fija en el plan.
- **RF-02 — Evento — Sin discrepancia entre el primer render y la medición.** **CUANDO** un
  consumidor monte la lógica de versión de vista **EL SISTEMA NO DEBE** producir una segunda
  composición por diferencia entre el valor inicial y el valor medido; en particular, **SI**
  `window.innerWidth` y `matchMedia(...).matches` discrepan **EL SISTEMA DEBE** usar la medición de
  la media query (la misma que decide la composición) y **NO DEBE** usar la de `innerWidth`.
  **Observable (el mismo que fija AC-02):** con la discrepancia forzada, el consumidor **NO DEBE**
  registrar una composición adicional por el sincronizado inicial del efecto
  (`useBreakpoint.js:52-53`): hoy registra **dos** (desktop y luego móvil) y tras la corrección
  **una sola** (móvil). **Cómo se mide (re-verificado):** en `@testing-library/react` **16.3.3**
  `renderHook` devuelve un **ref** (`result.current`; `dist/pure.js:335` y `:341`) y **no** expone
  `result.all`, así que las composiciones se registran con una **sonda**: el callback de `renderHook`
  se invoca en cada render (`pure.js:339`) y puede acumular cada valor en un array, o bien un
  componente sonda anotarlos. **No** basta `result.current`, que ya refleja el estado **posterior**
  al efecto (que corre dentro de `act`) y haría nacer verde la prueba.
- **RF-03 — Ubicuo — Contrato de la spec 009 intacto.** **EL SISTEMA DEBE** conservar exactamente
  cuatro valores (`isMobile`, `isDesktop`, `sidebarColapsada`, `toggleSidebar`), el corte único de
  768px, la partición complementaria (exactamente uno de `isMobile`/`isDesktop` activo en cualquier
  ancho), los defaults por banda sin preferencia válida (colapsada en 768–1023px, expandida en
  ≥1024px) y el contrato de preferencia guardada de la spec 009. **EL SISTEMA NO DEBE** alterar la
  clave de persistencia, ni el momento ni la condición en que se escribe, ni la firma de
  `toggleSidebar`.
- **RF-04 — Estado — Sin medición disponible.** **CUANDO** no exista entorno de medición (sin
  `window`) **EL SISTEMA DEBE** mantener los valores por defecto actuales (ambos `true`: «pantallas
  grandes» y ancho grande) y **NO DEBE** lanzar errores (CL-05 de la spec 009). La resolución de la
  medida **NO DEBE** suscribirse a nada ni escribir en la preferencia.
- **RF-05 — Ubicuo — La suscripción se conserva.** **EL SISTEMA DEBE** seguir escuchando los cambios
  de ambas media queries después del montaje: obtener la medición inicial de una fuente única **NO
  DEBE** convertir la medida en un valor calculado una sola vez.

### Corrección (2) — clase muerta de `AuthModal`

- **RF-06 — Ubicuo — Sin clases inexistentes.** **EL SISTEMA NO DEBE** declarar en la capa exterior
  de `AuthModal` la clase `animate-fadeIn` (ni ninguna otra utilidad de animación inexistente), y
  **NO DEBE** introducir la animación que falta.
- **RF-07 — Ubicuo — Aspecto y estructura sin cambios.** Al retirar la clase, **EL SISTEMA DEBE**
  conservar idénticos el resto de clases de la capa exterior y del panel, el marcado, la
  accesibilidad del diálogo (rol, `aria-modal`, nombre accesible, control de cierre, altura y scroll
  del panel) y los hexadecimales heredados. **EL SISTEMA NO DEBE** migrar colores ni reordenar
  clases por esta corrección; el aspecto observable **DEBE** permanecer igual (la clase retirada no
  generaba ninguna regla).

### Corrección (3) — `formatearFechaCorta`

- **RF-08 — Evento — Formato válido intacto.** **CUANDO** `formatearFechaCorta` reciba una cadena
  `AAAA-MM-DD` con **dos dígitos por campo** y un mes entre 1 y 12 **EL SISTEMA DEBE** devolver el
  formato corto actual (`"12 oct 2026"`), con el mes abreviado en español y el día sin cero a la
  izquierda (`"1 oct 2026"`). El **día no se valida**: `"2026-10-99"` es una entrada válida para esta
  función y devuelve `"99 oct 2026"` (Q2, opción (a)).
- **RF-09 — Evento — Mes inválido o formato incumplido.** **CUANDO** la entrada tenga un mes fuera
  de 1–12 (0, 13, 99, negativo, no numérico) **o** no cumpla **estrictamente** el formato
  `AAAA-MM-DD` —**exactamente** cuatro dígitos de año, dos de mes y dos de día, unidos por guiones,
  **con la cadena completa casando el patrón de inicio a fin** (sin espacios, sin otros separadores
  y sin caracteres extra)— **EL SISTEMA DEBE** devolver el **texto neutro «—»** (guion largo,
  U+2014). **EL SISTEMA NO DEBE** interpolar `undefined`, `NaN` ni un mes vacío en el resultado.
  **Contrato de entrada (Q3, opción (b)):** la función espera una **cadena** y **no** es total; con
  una entrada de otro tipo **EL SISTEMA DEBE** seguir comportándose como hoy (el `TypeError` de
  `fechaISO.split`): **NO DEBE** añadirse guarda de tipo ni conversión, y el tipo queda garantizado
  por los llamadores.
- **RF-10 — Ubicuo — Sin cambios colaterales en el log.** **EL SISTEMA NO DEBE** alterar el orden
  descendente por fecha, el formato del monto con signo, los tokens de ingreso/gasto, la fuente
  tabular, el estado vacío («Sin movimientos este mes») ni el contenido de los datos de
  demostración. La salida de RF-09 **DEBE** ocupar el lugar de la fecha en la misma línea, sin
  `<li>` ni estructura nuevas.

### Transversal

- **RF-11 — Ubicuo — Alcance mínimo y no-regresión.** Las tres correcciones **NO DEBEN** cambiar
  rutas, contenido de páginas, datos, `TRIAL_ACTIVO`, endpoints ni autenticación; **NO DEBEN**
  introducir dependencias, hexadecimales, animaciones, superficies de vidrio ni blobs; y **NO
  DEBEN** degradar ninguna suite existente (`useBreakpoint`, `LogMovimientos`, `AuthModal`, layout,
  `App` ni la global).
- **RF-12 — Ubicuo — Documentación de los archivos cuyo contrato cambia.** Las cabeceras JSDoc
  **solo** se actualizan en los archivos cuyo contrato documentado cambia: `useBreakpoint.js`
  (cabecera `:1-8`, fuente única de la medición) y `LogMovimientos.jsx` (cabecera `:1-10` y
  `:17-20`, texto neutro para mes/formato inválidos y contrato de **cadena**). **NO DEBEN** citar
  rutas de plantilla inexistentes (ver §8). **`AuthModal.jsx` queda excluido:** su cabecera
  (`:1-11`) no menciona `animate-fadeIn`, así que retirar la clase no cambia nada documentado y el
  archivo se toca **solo** en esa clase (RF-07).
- **RF-13 — Ubicuo — Coherencia de la medición en el entorno de pruebas (Q1, opción (b)).**
  El stub global de `matchMedia` de `vitest.setup.js` (`:14-26`) **DEBE** derivar `matches` de la
  misma fuente que `innerWidth` (`:28-33`) —`matches = innerWidth >= min-width de la consulta`—, de
  modo que ninguna suite que **afirme un viewport** mida dos versiones de vista distintas según el
  momento; **DEBE** conservarse un ancho por defecto explícito (hoy `1024`, «pantallas grandes»);
  las consultas que **no** son de ancho (p. ej. `(prefers-reduced-motion: reduce)`) **DEBEN**
  mantener `matches: false`; y el stub **DEBE** seguir siendo reemplazable por las suites
  (hoy `writable` pero **no** `configurable`: se mantiene asignable y es preferible añadir
  `configurable: true`, como ya tiene `innerWidth`).
  **Única excepción permitida:** el **caso TDD de precedencia de la fuente** (AC-02), que usa a
  propósito un mock **incoherente** (`innerWidth` 1024 con `matches` false) para probar que manda la
  media query. Esa incoherencia es deliberada, vive **solo** dentro de ese caso y **no** se propaga
  al stub global ni a ninguna otra suite.
  **Stubs locales (ampliación por coordinación con la 011, §3.4):** todo stub **local** de
  `matchMedia` de una suite que **afirme una versión de vista** **DEBE** cumplir el **mismo criterio**
  de coherencia que el global (`matches = innerWidth >= min-width`). En particular, el de
  `src/components/layout/DashboardUserModal.test.jsx` (`:34-50`) **DEBE** dejar de fijar
  `innerWidth = 1024` con `matches: false` (`:48-49`) y **DEBE** pasar a un default coherente
  («pantallas grandes» **de verdad**, como declara su comentario en `:46`), conservando su
  `describe` del gesto con sus dos viewports explícitos (`:293-301`) y **sin** cambiar lo que cada
  caso mide. Esta parte **no** procede de Q1: procede de que la 011 elige el respaldo de foco por
  versión de vista a través de `useBreakpoint` (§3.4), de modo que un entorno incoherente haría
  indeterminable la versión de vista de la suite.
  Las suites que hoy dependen del stub **DEBEN** seguir midiendo lo que afirman medir (§7.2) y los
  ajustes se limitan a stubs y aserciones: **NO DEBEN** modificarse componentes ni comportamiento
  para que una prueba pase.

---

## 5. Casos Límite y Decisiones

### 5.1 Casos límite

- **CL-01 — Sin medición (`window` ausente).** Se mantienen los defaults actuales (`isDesktop` y
  ancho grande en `true`). Hoy la suite del hook tiene un `describe` llamado «primer render sin
  medición disponible (SSR)» (`useBreakpoint.test.js:273-284`) que **no** simula la ausencia de
  `window`: es cobertura nominal. Corregir eso es decisión del plan, no un requisito nuevo.
- **CL-02 — Ancho fraccionario en el corte (767,5px).** La partición sigue siendo complementaria
  porque ambas versiones derivan de la **misma** consulta; no debe existir un ancho con las dos
  activas o con ninguna.
- **CL-03 — Cambio de `matches` sin `change`.** El efecto sigue haciendo el sync inicial y
  escuchando `change` (RF-05). La fuente única no debe convertirse en una medida «congelada» al
  primer render.
- **CL-04 — El inicializador no debe tener efectos.** Resolver la medida en el primer render **NO
  DEBE** suscribir listeners, escribir `localStorage` ni provocar el efecto de persistencia: montar
  el hook sigue sin escribir (contrato vigente de la spec 009 y caso existente en
  `useBreakpoint.test.js:211-216`).
- **CL-05 — `StrictMode`.** La app se monta dentro de `<StrictMode>` (`src/main.jsx:16`): el doble
  montaje de efectos **NO DEBE** producir estados distintos entre pasadas ni dos mediciones
  contradictorias.
- **CL-06 — Tipo del valor inicial.** El valor inicial **DEBE** ser un booleano en todos los casos
  (nunca `undefined`), para que la partición y los defaults de banda sigan siendo observables desde
  el primer render.
- **CL-07 — Formato y límites de la fecha (Q2, opción (a) confirmada; ya no es provisional).**
  Válidas: `"2026-10-12"` ⇒ `"12 oct 2026"`, `"2026-10-01"` ⇒ `"1 oct 2026"`, `"2026-01-01"` ⇒
  `"1 ene 2026"`, `"2026-12-31"` ⇒ `"31 dic 2026"`. El **día no se valida**: `"2026-10-99"` ⇒
  `"99 oct 2026"`. **El año tampoco se valida**: `"0000-01-01"` ⇒ `"1 ene 0"`
  (`Number("0000") === 0`), y cualquier año de cuatro dígitos se acepta sin comprobar rango
  (DP-07). Inválidas (⇒ «—»): `"2026-00-12"`, `"2026-13-12"`, `"2026-99-12"`,
  `"2026-XX-12"`, `"2026-10-1"` (un solo dígito de día), `"2026-1-12"`, `"26-10-12"`,
  `" 2026-10-12"` (espacio), `"12-10-2026"`, `"no-es-fecha"` y `""`.
- **CL-08 — Entrada que no es cadena (Q3, opción (b) confirmada).** `formatearFechaCorta` espera una
  **cadena** y **no** es una función total: con `undefined`, `null`, número u objeto se **mantiene**
  el `TypeError` actual (`fechaISO.split` no existe) y **no** se añade guarda de tipo. El tipo lo
  garantizan los llamadores (`LogMovimientos.jsx:54` pasa siempre `mov.fecha`). No se añaden pruebas
  de entradas no-cadena: el contrato de esta corrección es «cadena de fecha».
  **Supuesto declarado:** aguas arriba, el proveedor de los datos **siempre** entrega una cadena de
  fecha —hoy el fixture lo hace (`src/data/tarjetasDemo.js:65-82`)—; qué hacer si la fecha **falta**
  (ausente, `null`, cadena vacía como «sin fecha») **no** se decide en esta spec: se define en la
  spec del **backend** que provee los datos (§2.2). El plan **no debe** inventar ese caso.
- **CL-09 — Día sin cero a la izquierda.** Comportamiento vigente que se conserva:
  `"2026-10-01"` ⇒ `"1 oct 2026"`.
- **CL-10 — «—» no es `-`, `undefined` ni `Invalid Date`.** El texto neutro debe ser el guion largo
  U+2014 exacto, idéntico para todos los casos inválidos (mes 0, mes 13, `"2026-XX-12"`, cadena
  vacía, formato ajeno). **Dato re-verificado (2026-10-16):** el carácter U+2014 **sí** existe ya en
  el proyecto —18 líneas de `src/` lo contienen, casi todas en nombres de `describe` de pruebas y
  comentarios, y **una como texto de interfaz**: `src/components/domain/landing/Hero.jsx:77`
  («RESUMEN — SEPTIEMBRE 2026»)—; como **literal de valor** en JSX/JS (`"—"`) hay **0**
  coincidencias. Por tanto **no** se afirma que el carácter sea nuevo ni único: solo se adopta como
  **valor de datos** de esta corrección, en español, sin token ni i18n y sin colisión con el uso
  existente de Hero (que es texto estático de la landing).
- **CL-11 — Clase muerta.** Retirar `animate-fadeIn` no altera el CSS generado por el build ni el
  aspecto. **No** se debe «arreglar» creando la animación (prohibido por RF-06 y por el alcance).
- **CL-12 — Código en movimiento.** El usuario edita a mano: si al implementar la clase ya no está,
  o el helper ya valida, se registra como «ya no aplicable» en lugar de recrear el defecto.

### 5.2 Decisiones

| ID | Decisión |
|---|---|
| **DP-01** | La corrección (1) es de **fuente única del snapshot inicial**, no de SSR/hidratación: no se introduce SSR (hechos en §3.1). |
| **DP-02** | Se preservan el contrato de 4 props, el corte de 768px, los defaults por banda y el contrato de preferencia de la spec 009. Nada de eso se reabre. |
| **DP-03** | La corrección (2) retira **solo** la clase muerta; **no** se migran hexadecimales ni se toca el aspecto de `AuthModal` (exclusión heredada de la spec 010). |
| **DP-04** | La corrección (3) devuelve «—» ante mes inválido (fuera de 1–12) o formato incumplido (no estricto `AAAA-MM-DD`), según Q2 = opción (a). El caso válido no cambia y el día no se valida. |
| **DP-05** | Las tres correcciones van juntas en una spec por petición del usuario, pero son **independientes**: ninguna autoriza cambios adicionales en su archivo ni en otros. |
| **DP-06** | La cobertura se añade donde corresponde (`useBreakpoint.test.js`, suite de `LogMovimientos`); la corrección (2) se verifica por inspección/`grep`. `npm test` y `npm run build` quedan para la tarea final del plan. |
| **DP-07** | No se añaden validaciones no pedidas (rango del día, `Date`/`Intl`, zonas horarias, formatos alternativos, normalización de la entrada). |
| **DP-08** | **Q1 = opción (b):** el alcance de pruebas incluye `useBreakpoint.js` + su suite + el **stub global coherente** de `vitest.setup.js` + las suites que hoy dependen de ese stub (§7.1-B). Además —y **no** por Q1— entra el **stub local** de `DashboardUserModal.test.jsx`, por coordinación con la 011 (DP-12, §3.4). Excepción única a la coherencia: el mock deliberadamente incoherente de AC-02. El ajuste se limita a stubs y aserciones. |
| **DP-09** | **Q2 = opción (a):** se implementa la validación **estricta** `AAAA-MM-DD` (dos dígitos por campo) y la del **mes** (1–12). El **día no se valida**. |
| **DP-10** | **Q3 = opción (b):** `formatearFechaCorta` espera **cadena** y **no** es total; se mantiene el `TypeError` actual y **no** se añade guarda de tipo. |
| **DP-11** | **La obtención de la fecha es del backend:** la detección de la fecha desde un «mensaje de ingreso» y cualquier calendario o selector de fecha de respaldo quedan **fuera de alcance** del frontend y de esta spec (§2.2). |
| **DP-12** | **Ampliación de alcance por coordinación con la 011 (2026-10-17):** el stub **local** de `matchMedia` de `DashboardUserModal.test.jsx` pasa a ser **coherente** con `innerWidth` (mismo criterio que el global) porque la 011 resuelve el respaldo de foco **por versión de vista** vía `useBreakpoint` (**RF-05**, 011 §5.A, y **RF-09**, 011 §5.B; la **bidireccionalidad y el orden** están en 011 §3, §9 y §11-H4). Orden acordado: **012 primero** y la 011 se re-mide después. **No** cambia Q1/Q2/Q3, ni el contrato del hook, ni el inventario de código de producción. |

### 5.3 Decisiones cerradas por el usuario (2026-10-16)

| Pregunta del borrador | Respuesta del usuario | Efecto en esta spec |
|---|---|---|
| **Q1** — alcance de pruebas del hook | **Opción (b):** se permite ajustar `vitest.setup.js` y las suites afectadas para que `matches` sea **coherente** con `innerWidth` | Alcance y garantías en §7.1 y §7.2; RF-13; DP-08 |
| **Q2** — estricta de `formatearFechaCorta` | **Opción (a):** formato **estricto** de dos dígitos por campo; mes validado (1–12); **día no validado** | RF-08/RF-09, CL-07, AC-06/AC-07; DP-09 |
| **Q3** — entradas no-cadena | **Opción (b):** se **mantiene** el `TypeError` actual; contrato de **cadena**, no función total | RF-09 (contrato de entrada), CL-08; DP-10 |
| **Precisión de alcance** | La detección de fecha desde un «mensaje de ingreso» y cualquier calendario/selector de fecha de respaldo los hará el **backend** | §2.2 (fuera de alcance explícito); §1; DP-11 |
| **Coordinación con la 011 (2026-10-17)** | El **respaldo de foco por versión de vista** de la 011 se apoya en `useBreakpoint`; para no romper suites, la 012 **amplía** su alcance al **stub local** de `DashboardUserModal.test.jsx` y deja **una sola** fuente de medición | §3.4, §7.1-B, §7, RF-13, DP-12, AC-13; orden «012 primero, 011 se re-mide» |

**Puntos abiertos: ninguno.** Las tres decisiones están cerradas y la precisión de alcance queda
registrada. Cualquier detalle que cambie por las ediciones manuales del usuario se trata como CL-12
(«ya no aplicable») y se re-verifica al planificar y al implementar, sin reabrir la spec.

---

## 6. Pruebas de Aceptación (criterios verificables)

| ID | Escenario | Esperado | Verificación |
|---|---|---|---|
| **AC-01** | `useBreakpoint` con `matchMedia` coherente con el ancho: 375 / 800 / 1200px, **sin** ejecutar ningún `change` | El valor del **primer render** ya es el medido: 375 ⇒ `isMobile`; 800 ⇒ `isDesktop` y `sidebarColapsada`; 1200 ⇒ `isDesktop` y **no** colapsada | Test del hook (con el mock coherente no hay segunda composición, así que el aserto puede ir sobre `result.current` tras `renderHook`) |
| **AC-02** | Mock **deliberadamente incoherente** (`innerWidth = 1024` con `matchMedia(...).matches = false`) — **firma del defecto** y **única excepción** de RF-13 | El **primer render comprometido** usa **la media query**: `isMobile: true` y `sidebarColapsada: true`, y **no** se registra una segunda composición con los valores contrarios (RF-02). **Hoy falla**: la primera composición dice desktop (`isMobile: false`, expandida) y hay **dos** composiciones contradictorias | Test del hook con mock incoherente y **sonda que registre cada composición** (caso nuevo; TDD): el propio callback de `renderHook` acumulando los valores, o un componente sonda. `result.current` **no** vale (post-efecto, nacería verde) y `result.all` **no existe** en la versión instalada (`@testing-library/react` 16.3.3, `dist/pure.js:335,341`) |
| **AC-03** | Contrato de RF-03/CL-04 | Exactamente 4 props, sin `isTablet`; partición en 767 / 767,5 / 768 / 800 / 1023 / 1024 / 1440; defaults por banda; contrato de preferencia (`null`/no booleano/JSON corrupto ⇒ sin preferencia); montar **no** escribe; `toggleSidebar` alterna y escribe; `change` mueve el estado; listeners retirados al desmontar | `src/hooks/useBreakpoint.test.js`: los **27 casos existentes no se modifican** («verde sin cambios» = intactos, no congelados: el recuento **crece** con los casos nuevos de AC-02/AC-11, DP-06) |
| **AC-04** | RF-04 (sin `window`) | No lanza y devuelve booleanos con los defaults actuales (`true`/`true`) | **No ejecutado**: jsdom siempre tiene `window`, así que no es verificable; se declara **no cubierto**, nunca «verde» (el `describe` nominal de `useBreakpoint.test.js:273-284` no simula su ausencia) |
| **AC-05** | `AuthModal.jsx` (RF-06/RF-07) | `grep` de `fadeIn` ⇒ **0** coincidencias en `src/`; la capa exterior conserva `fixed`, `inset-0`, `z-50`, `bg-black/70` y `backdrop-blur-sm`; marcado, diálogo y hexadecimales heredados sin cambios | `grep` + revisión + `AuthModal.test.jsx`: los **15 casos existentes no se modifican** y su recuento **no** cambia (esta corrección no añade casos nuevos) |
| **AC-06** | `formatearFechaCorta` con entradas **válidas** (RF-08) | `"2026-10-12"` ⇒ `"12 oct 2026"`; `"2026-10-01"` ⇒ `"1 oct 2026"`; `"2026-01-01"` ⇒ `"1 ene 2026"`; `"2026-03-31"` ⇒ `"31 mar 2026"`; `"2026-12-31"` ⇒ `"31 dic 2026"`; `"2026-10-99"` ⇒ `"99 oct 2026"` (día no validado, consecuencia documentada) | Test directo del helper exportado |
| **AC-07** | `formatearFechaCorta` con entradas **inválidas** (RF-09, formato estricto) | `"2026-00-12"`, `"2026-13-12"`, `"2026-99-12"`, `"2026-XX-12"`, `"2026-10-1"`, `"2026-1-12"`, `"26-10-12"`, `" 2026-10-12"`, `"12-10-2026"`, `"no-es-fecha"` y `""` ⇒ **«—»** exactamente; **ningún** resultado contiene `undefined`/`NaN` | Test directo del helper (hoy los inválidos fallan) |
| **AC-08** | `LogMovimientos` sin cambios colaterales (RF-10) | Render, orden descendente, formato, tokens, estado vacío (`[]` y `undefined`) y datos del fixture intactos | `LogMovimientos.test.jsx`: los **6 casos existentes no se modifican**; el recuento **crece** con los casos nuevos de AC-06/AC-07 si se alojan en este archivo (DP-06) |
| **AC-09** | No-regresión (RF-11) | Sin fallos **nuevos** frente a la **línea base medida antes de tocar código**, **suite por suite** (§7.1); se reporta pass/fail/no ejecutado por validación | `npm test` + `npm run build` (tarea final del plan) |
| **AC-10** | Alcance y limpieza (RF-11/RF-12) | Sin rutas, contenido, datos, endpoints, dependencias, hexadecimales, animaciones, superficies ni blobs nuevos; cabeceras JSDoc actualizadas **solo** en los archivos cuyo contrato cambia (`useBreakpoint.js`, `LogMovimientos.jsx`; **no** `AuthModal.jsx`) | `grep` + `git diff --stat` + suites focalizadas |
| **AC-11** | **Coherencia del stub global de pruebas (RF-13, Q1 = b)** | Con el stub de `vitest.setup.js` (`innerWidth` por defecto `1024`), `matchMedia("(min-width: 768px)").matches` y `matchMedia("(min-width: 1024px)").matches` son `true` (y `"(prefers-reduced-motion: reduce)"` sigue `false`): una suite que **no** fije su propio `matchMedia` mide **una sola** versión de vista (pantallas grandes) y no dos según el momento. El **stub local** de `DashboardUserModal.test.jsx` se verifica aparte (AC-13) | Aserción directa sobre el stub global del setup **en un archivo que no reemplace `window.matchMedia`** (p. ej. una suite dedicada hermana de `vitest.setup.js`, o un `describe` cuyo `beforeEach` restaure el mock global). **No** vale dentro de `useBreakpoint.test.js` ni de `DashboardUserModal.test.jsx`, que lo sustituyen (`:33-37` y `:34-50`) |
| **AC-12** | **Contrato de cadena del helper (Q3 = b)** | No se añade guarda de tipo: con `undefined`/`null` sigue lanzando; el diff del helper **no** contiene comprobaciones de `typeof` ni conversiones | Inspección del diff + `LogMovimientos.test.jsx` verde |
| **AC-13** | **Coherencia del stub local del modal de cuenta (RF-13; ampliación por coordinación con la 011, §3.4 — no viene de Q1)** | El default de `beforeEach`/`afterEach` de `DashboardUserModal.test.jsx` (`:47-57`) instala un `matchMedia` **derivado** de `innerWidth` (`matches = innerWidth >= min-width`): con `innerWidth = 1024`, `"(min-width: 768px)"` y `"(min-width: 1024px)"` devuelven `true`, así que la suite mide **una sola** versión de vista (pantallas grandes, como declara su comentario `:46`) y no dos según el momento. El `describe` del gesto conserva sus dos viewports explícitos (`:293-296` móvil 375; `:298-301` pantallas grandes 1024) | Aserción sobre el stub **local** tras el `beforeEach` (p. ej. `matchMedia("(min-width: 768px)").matches === true`) + `npx vitest run src/components/layout/DashboardUserModal.test.jsx` con los **20 casos existentes intactos**; si alguno dependía del default incoherente, se registra el hallazgo y se ajusta solo su aserción |

> **Honestidad de la validación.** AC-01 a AC-03, AC-05 a AC-08 y AC-10 a AC-13 son verificables con
> Vitest/jsdom, salvo las partes «de aspecto» de AC-05, que se comprueban por inspección (la clase
> retirada no generaba reglas). **AC-04 queda «no ejecutado»** (jsdom siempre tiene `window`), nunca
> «verde». AC-09 se reserva a la tarea final del plan, con atribución **suite por suite** contra la
> línea base medida (§7.1). AC-02 se verifica sobre el **primer render comprometido**
> (`registros[0]` de la sonda de renders), no sobre `result.current`: `renderHook` envuelve en `act`,
> el efecto ya sincronizó al retornar, y un aserto sobre `result.current` **nacería verde** sin
> probar nada (además, `result.all` **no existe** en `@testing-library/react` 16.3.3). **No** se declara reproducido en navegador el defecto de AC-02 (§3.1); si el plan quisiera
> observarlo, solo sería visible en el borde de 768px y se registraría como revisión manual, no como
> prueba. **No** se añaden pruebas de entradas no-cadena (Q3: el contrato es «cadena de fecha»).

---

## 7. Regresión y no-regresión

**Suites que no deben empeorar** (verificación focalizada, con la línea base medida antes de tocar
nada):

| Suite | Casos conocidos (MEMORY, 2026-10-16) | Por qué se vigila |
|---|---|---|
| `src/hooks/useBreakpoint.test.js` | 27 | Es la suite de la corrección (1): contrato, partición, defaults, preferencia, persistencia y listeners |
| `src/components/domain/dashboard/LogMovimientos.test.jsx` | 6 | Es la suite de la corrección (3) |
| `src/components/domain/modales/AuthModal.test.jsx` | 15 | Es la suite de la corrección (2) **y** mide la versión de vista (vía `useDeslizarParaCerrar`) |
| `src/layout/DashboardLayout.test.jsx` | 21 | Consumidor directo del hook (sustituye el hook por un mock) |
| `src/components/layout/cierreDeModales.test.jsx` | — | Monta el `DashboardLayout` **real** con su propio stub coherente |
| `src/components/layout/DashboardUserModal.test.jsx` | 20 | Stub **local** propio (no depende del global): su **coherencia sí entra en el alcance**, por coordinación con la 011 (§7.1-B, AC-13) |
| `src/pages/PanelTarjetas.test.jsx` | 12 | Monta `ModalTarjeta` ⇒ ejerce el hook con el stub global |
| `src/components/ModalTarjeta.test.jsx` | 11 | Gesto de móvil con stub propio coherente |
| `src/App.test.jsx` | 11 | Regresión de rutas; **usa el stub global** (§7.1-B) |
| `src/main.test.jsx` | 1 | Montaje real con `StrictMode` (`:15-21`) |
| `npm test` global | Línea base a **medir** | AC-09 |

### 7.1 Inventario de archivos del ajuste de medición (Q1 = opción (b) + coordinación con la 011)

> Re-verificado el **2026-10-16** y **el 2026-10-17**. El usuario sigue editando a mano (DP-21): el
> plan **debe** re-verificar este inventario por `grep` (`useBreakpoint`, `useDeslizarParaCerrar`,
> `window.matchMedia`) antes de tocar nada, y tratar lo que ya no aplique como «ya no aplicable»
> (CL-12).

**A. Código de producción (la corrección en sí):**

| Archivo | Qué cambia |
|---|---|
| `src/hooks/useBreakpoint.js` | El snapshot inicial (`:28-36` y su uso en `:40-41`) pasa a la **misma fuente** que la suscripción (`:44-53`); cabecera JSDoc (`:1-8`). **Sin** cambios de contrato (`:73`), ni del corte/umbral (`:12`, `:14`), ni de los defaults de banda (`:61-62`) |
| `src/components/domain/modales/AuthModal.jsx:124` | Se retira la clase muerta `animate-fadeIn` (nada más) |
| `src/components/domain/dashboard/LogMovimientos.jsx:21-24` | `formatearFechaCorta` valida mes (1–12) y formato estricto `AAAA-MM-DD` ⇒ «—»; cabecera JSDoc |

**B. Infraestructura de pruebas y suites en alcance:** el **stub global** incoherente y las suites
que hoy dependen de él (aprobado por **Q1 = opción (b)**), más el **stub local** del modal de cuenta
(**ampliación por coordinación con la 011**, §3.4; **no** procede de Q1):

| Archivo | Estado verificado hoy | Ajuste previsto |
|---|---|---|
| `vitest.setup.js` (`matchMedia` `:14-26`; `innerWidth` `:28-33` y comentario `:13`) | `matches: false` para **cualquier** query con `innerWidth = 1024`: dos fuentes incoherentes | Pasa a derivar `matches` del `innerWidth` vigente y del `min-width` de la query (**una sola fuente**); se conserva `1024` como ancho por defecto («pantallas grandes») y se documenta en el comentario |
| `src/App.test.jsx` (`:12`, `:16-22`) | **No** fija `matchMedia`: mide con el stub global. Renderiza `App` ⇒ `DashboardLayout` real (`useBreakpoint`) y `PanelTarjetas` ⇒ `ModalTarjeta` ⇒ `useDeslizarParaCerrar` ⇒ hook | Medir **antes** y **después**; si algún resultado cambia, ajustar **solo aserciones** (nunca código) y registrar el hallazgo |
| `src/pages/PanelTarjetas.test.jsx` (`:121`, `:196`) | **No** fija `matchMedia`: monta `ModalTarjeta` (hook vía `useDeslizarParaCerrar`) contra el stub global | Igual: medir primero; ajustar solo aserciones si procede |
| `src/components/layout/DashboardUserModal.test.jsx` (`mockMatchMedia` `:34-44`; default `:47-50`; `beforeEach` `:52`; `afterEach` `:54-57`) | Stub **local** (no usa el global) e **incoherente consigo mismo**: el comentario declara «pantallas grandes (≥768px)» (`:46`) y el default deja `matches:false` (`:49`) con `innerWidth = 1024` (`:48`) | **Ampliación por coordinación con la 011 (§3.4, DP-12):** el default pasa a un `matchMedia` **derivado** de `innerWidth` (mismo criterio que el global: con 1024 ⇒ `true` en 768 y 1024), de modo que la suite mida **una sola** versión de vista. El `describe` del gesto (`:292-345`) **no** cambia: fija sus propios viewports (`:293-301`). Los **20 casos existentes se conservan**; si alguno cambiara por el default, se registra el hallazgo y se ajusta solo su aserción (AC-13) |

**C. Suites que ya fijan su propio `matchMedia` coherente (no dependen del stub global; solo
verificación de que siguen midiendo lo mismo):**

| Archivo | Dónde | Coherencia |
|---|---|---|
| `src/hooks/useBreakpoint.test.js` | mock `:33-37`; `configurarAncho` `:57-65` | `matches` derivado de `innerWidth` en cada caso |
| `src/hooks/useDeslizarParaCerrar.test.js` | mock `:88-95`; `configurarAncho` `:62-66`; default 375 en `:95` | `matches` derivado del ancho |
| `src/components/domain/modales/AuthModal.test.jsx` | `crearMockMatchMedia` `:20-33`; `fijarViewport(1024)` `:36-43`, `:47` | `matches = ancho >= min-width` |
| `src/components/ModalTarjeta.test.jsx` | `crearMockMatchMedia` `:39-52`; `fijarViewport` `:54-61` | igual |
| `src/components/layout/cierreDeModales.test.jsx` | `crearMockMatchMedia` `:50-63`; `fijarViewport(1024)` `:66-73`, `:77` | igual; su comentario ya declara «sin depender del mock global de `vitest.setup.js` (CL-18)» |
| `src/components/layout/DashboardDrawer.test.jsx` | `mockMatchMedia` `:34-44`; `configurarViewport(375)` `:47-54` | `matches` derivado del ancho (el drawer **no** consume el hook) |

**D. Suite que sustituye el hook (no mide la medición):** `src/layout/DashboardLayout.test.jsx:24-25`
mockea `useBreakpoint` con 4 props ⇒ no depende del stub global.

**E. El resto de suites** (landing, tarjetas, layout no-dashboard, hooks de scroll y de Esc, CSS y
montaje) no consume el hook hoy; el plan **debe** confirmarlo con el `grep` del inventario antes de
concluir que no aplican.

### 7.2 Cómo se garantiza que cada suite sigue midiendo lo que debe

1. **Una sola fórmula en el stub global:** `matches = innerWidth >= min-width de la consulta`
   (la misma que ya usan las suites coherentes, p. ej. `cierreDeModales.test.jsx:50-63`), evaluada
   en el momento de la consulta ⇒ ninguna suite que afirme un viewport puede volver a medir dos
   versiones distintas según el momento (AC-11). **Única excepción:** el mock deliberadamente
   incoherente del caso TDD de AC-02 (RF-13), que vive solo dentro de ese caso.
2. **Ancho por defecto explícito y documentado** en el propio stub (`1024` = pantallas grandes).
3. **Cada suite que necesite otro ancho lo fija explícitamente** con el patrón ya existente
   `fijarViewport(ancho)` (`AuthModal.test.jsx:36-43`, `cierreDeModales.test.jsx:66-73`) o su
   equivalente `defineProperty` + `mockMatchMedia(ancho)` (`DashboardDrawer.test.jsx:47-52`), que
   fijan `innerWidth` y `matchMedia` en la **misma** llamada ⇒ coherencia por construcción.
4. **Las suites que afirman móvil fijan móvil** (`DashboardUserModal.test.jsx:293-296` y
   `DashboardDrawer.test.jsx:54` con 375; `useDeslizarParaCerrar.test.js:95` con 375) y **las que
   afirman pantallas grandes fijan ≥768** (`AuthModal.test.jsx:47`), sin depender del default.
   **Todo stub local que afirme una versión de vista cumple el mismo criterio de coherencia que el
   global** (AC-13): tras el arreglo, el default de `DashboardUserModal.test.jsx:47-50` deriva
   `matches` de `innerWidth` (1024 ⇒ pantallas grandes de verdad) y deja de contradecir su comentario
   (`:46`), sin cambiar lo que cada caso mide.
5. **Ninguna suite se ajusta «para que pase»:** cada tarea mide **antes y después** por suite y
   reporta pass/fail/no ejecutado; cualquier cambio de aserción se justifica por lo que la suite mide.
6. **Prohibido tocar producción para hacer pasar una prueba:** los únicos cambios de código son los
   de la tabla A (§7.1); el stub y las aserciones no alteran el comportamiento del producto (RF-13).


**Línea base:** `MEMORY.md` registra cifras que **no coinciden** entre sí (257/257 en 22 archivos en
la T1 de la spec 010 y 348/348 en 27 archivos en su cierre). No se adopta ninguna como válida:
**se mide antes de tocar código y se registra**, y cada tarea informa pass/fail/no ejecutado. El
usuario sigue editando a mano (DP-21), así que las referencias `archivo:línea` de esta spec deben
re-verificarse al planificar y al implementar.

**No-regresión explícita:** rutas y secciones del dashboard, contenido de las páginas, datos de
`src/data/tarjetasDemo.js`, `TRIAL_ACTIVO`, endpoints, contrato de props del hook y de `AuthModal`,
contrato de preferencia guardada, corte de 768px y umbral de 1024px con roles distintos.

**Riesgo principal:** la corrección (1) cambia el **primer render** del hook y, por tanto, el de
cualquier suite que mida con el stub global. Con **Q1 = opción (b)** el ajuste está autorizado, pero
**acotado**: primero se mide cada suite (§7.1), y solo después se ajustan el stub global y las
aserciones de las suites afectadas, nunca el comportamiento de producción (§7.2, RF-13).

**Dependencia bidireccional con la spec 011 (borrador,
`specs/011-foco-de-superficies-y-cruce/spec.md`):** la 011 corrige el foco de las cuatro superficies
y el traslado al cruzar el corte de 768px, y resuelve su **respaldo de foco por versión de vista**
(**RF-05**, 011 §5.A; **RF-09**, 011 §5.B) apoyándose en `useBreakpoint()` —la fuente única de la
versión de vista de la 009—. La **bidireccionalidad** y el **orden** («012 primero, la 011 se
re-mide después») están documentados en la 011: **§3** (tabla «Relación con specs anteriores»,
entrada **012**), **§8**, **§9** y **§11-H4**, y en su **§2.2** (la 011 **no** reescribe la suite del
modal de cuenta). De ahí: (a) la 011 necesita que esta spec deje **una sola** fuente de medición
(RF-01/RF-02) y un entorno de pruebas que mida **una sola** versión de vista, que es lo que amplía el
§7.1-B sobre el stub **local** del modal de cuenta; y (b) esta spec **no** cambia el contrato del hook
(RF-03), del que la 011 depende. **Orden acordado:** se implementa la **012 primero** y la 011 se
**re-mide** contra el estado resultante. La 011 **no se toca** (sigue en borrador).

---

## 8. Dependencias Técnicas y Notas

- **Sin dependencias nuevas.** Todo se resuelve con lo instalado (React 18, Vite 5, Tailwind v4,
  Vitest + Testing Library en jsdom).
- **`matchMedia` como fuente de medición** ya se usa en el hook (`useBreakpoint.js:44-45`); la
  corrección reutiliza esa misma fuente para el valor inicial. No se añade ninguna API nueva.
- **Tailwind v4 y clases de animación:** `animate-<nombre>` solo existe con un token `--animate-*`
  en `@theme` o como utilidad integrada. No hay ningún `@keyframes` ni token de animación en
  `src/styles/index.css` (§3.2) ⇒ `animate-fadeIn` es muerta.
- **Infraestructura de pruebas (alcance aprobado: Q1 = opción (b) + coordinación con la 011):**
  `vitest.setup.js:14-26` (`matchMedia` siempre `false`) con `vitest.setup.js:28-33`
  (`innerWidth = 1024`) es la incoherencia que hace determinista el defecto; se corrige a **una sola
  fuente** (`matches` derivado del `innerWidth` vigente) y se ajustan las suites de §7.1-B, incluido
  el **stub local** de `DashboardUserModal.test.jsx` (§3.4, DP-12). `vitest.config.js` no se toca.
  Detalles: el stub es hoy `writable` pero **no** `configurable` (`:14-16`) y las queries ajenas al
  ancho —p. ej. `(prefers-reduced-motion: reduce)`— deben seguir devolviendo `matches: false`.
  **Excepción única:** el mock deliberadamente incoherente del caso TDD de AC-02 (RF-13).
- **Consumidores del hook:** `src/layout/DashboardLayout.jsx:4,40` (directo) y
  `src/hooks/useDeslizarParaCerrar.js:10,48` (indirecto, usado por `AuthModal.jsx:61`,
  `ModalTarjeta.jsx:69` y `DashboardUserModal.jsx:66`) ⇒ cualquier suite que monte esas superficies
  ejerce la medición (§7.1). **Coordinación con la 011:** el respaldo de foco por versión de vista de
  la 011 se apoyará en esa misma medición (`useBreakpoint`), así que esta spec deja la fuente única
  (RF-01/RF-02) y el entorno coherente (§7.1-B) sin cambiar el contrato del hook (RF-03, §3.4).
- **Documentación inconsistente (registrada, no se corrige aquí):** `AGENTS.md:38`,
  `doc/constitution.md:39` y `.agents/rules/rules.md:21` citan `.agents/file-header-template.md`,
  que **no existe**; la plantilla real está en `.agents/skills/file-hearder-template.md/SKILL.md`
  (con el typo «hearder»). Si la implementación toca cabeceras JSDoc (RF-12), se usa la ruta real y
  se deja constancia.
- **`«—»`** es el guion largo U+2014, texto de interfaz en español; no requiere token ni i18n.

---

## 9. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El defecto de (1) no es de hidratación y se implementa «como si hubiera SSR» | Cambio de alcance no aprobado | DP-01 + §3.1: no se introduce SSR; solo fuente única |
| Cambiar el valor inicial altera el primer render de suites que miden con el stub global | Fallos atribuidos erróneamente a la corrección | Medir la línea base **suite por suite** (§7.1); ajustar **solo** stub y aserciones (§7.2, RF-13); atribución contra esa línea base |
| El ajuste del stub o de las aserciones se convierte en un cambio de componentes «para que pase» | Se altera comportamiento no pedido | RF-13 + §7.2-6: los únicos cambios de producción son la tabla A de §7.1 |
| La corrección (1) deriva en refactor del hook (renombrar props, mover umbrales) | Regresión del contrato de la spec 009 | RF-03 + AC-03; DP-02 |
| Quitar `animate-fadeIn` «de paso» limpia hexadecimales o clases de `AuthModal` | Cambio visual no autorizado | DP-03 + RF-07 + AC-05 |
| Crear la animación faltante para «arreglar» la clase | Trabajo no pedido y animación nueva | RF-06 + CL-11 |
| Se exige validar el **día** o normalizar la entrada y el helper «no cumple» | Expectativa falsa sobre AC-07 | CL-07 (Q2 = a): día no validado; estricto sin normalización |
| Se añade una guarda de tipo al helper «por robustez» | Cambio de contrato no pedido | CL-08 + RF-09 + AC-12 (Q3 = b: se mantiene el `TypeError`) |
| La presentación de la fecha asume tareas del **backend** (detección desde un mensaje, calendario de respaldo) | Alcance inventado | §1 + §2.2 + DP-11 |
| AC-02 se asertaría sobre `result.current` y **nacería verde** | Falso TDD: la corrección (1) quedaría sin prueba real | AC-02 + RF-02: el observable es el **primer render comprometido** (`registros[0]` de una **sonda** de renders), nunca `result.current` (post-efecto); `result.all` no existe en RTL 16.3.3 |
| El mock incoherente del caso TDD se extiende a otras suites o al stub global | Se reintroduce la incoherencia que Q1 corrige | RF-13: excepción **única** y local a AC-02; §2.2, §7.2-1 y DP-08 |
| El stub **local** del modal de cuenta se deja incoherente y la 011 no puede fijar la versión de vista de su respaldo | El respaldo «por versión de vista» de la 011 queda indeterminable en esa suite | DP-12 + RF-13 (párrafo de stubs locales) + AC-13: coherencia obligatoria con el mismo criterio que el global |
| La 011 se implementa o se planifica **antes** que la 012 y mide con el entorno antiguo | Mediciones y aserciones de foco obsoletas | §3.4 y §7: orden acordado **012 primero**; la 011 se re-mide después; la 011 no se toca |
| Esta spec «aprovecha» la coordinación con la 011 para tocar el foco o el layout | Alcance invadido | §2.2 + §3.4: la ampliación se limita al **stub local** de una suite; nada de componentes |
| Afirmar que el carácter «—» es nuevo o único en el proyecto | Dato falso: ya hay 18 líneas con U+2014 en `src/`, una de ellas interfaz (`Hero.jsx:77`) | CL-10 re-verificado: solo se adopta como **valor de datos** |
| Validar el **año** por iniciativa propia (`"0000-01-01"`) | Alcance no pedido y resultado distinto del especificado | CL-07 + DP-07: el año **no** se valida |
| Inventar el caso «fecha ausente/no determinada» | Se asume alcance del backend | CL-08 (supuesto declarado) + §2.2 + DP-11 |
| Cifras de la suite tomadas de MEMORY (`257/22` vs `348/27`) | Conclusiones de regresión falsas | Medir la línea base y reportar pass/fail/no ejecutado |
| El usuario edita a mano durante la implementación | Referencias y supuestos obsoletos | Re-verificar `archivo:línea` e inventario por `grep`; CL-12 |

---

## 10. Verificación propuesta (para el plan y las tareas)

1. **Paso 0 — inventario y línea base, sin tocar nada:**
   - Re-verificar el inventario de §7.1 por `grep` (`useBreakpoint`, `useDeslizarParaCerrar`,
     `window.matchMedia`) y anotar lo que ya no aplique (CL-12).
   - Medir la línea base **suite por suite** y registrarla sin declarar verde nada que no se mida:
     `npx vitest run src/hooks/useBreakpoint.test.js src/components/domain/dashboard/LogMovimientos.test.jsx src/components/domain/modales/AuthModal.test.jsx src/layout/DashboardLayout.test.jsx src/components/layout src/pages/PanelTarjetas.test.jsx src/components/ModalTarjeta.test.jsx src/App.test.jsx`
     (incluye `src/components/layout/DashboardUserModal.test.jsx`, cuyo stub local entra en alcance)
     y, como referencia global, `npm test`. La suite **nueva** del stub global (AC-11) entrará por la
     referencia global.
2. **Pruebas que deben fallar primero (TDD):**
   - (1) **AC-02** (mock incoherente: `innerWidth` 1024 con `matches` false → el **primer render
     comprometido** debe seguir la media query). El aserto va sobre la **primera composición
     registrada por una sonda** (`registros[0]`) y sobre la ausencia de una segunda composición
     contradictoria, **nunca** sobre `result.current` (post-efecto: nacería verde); `result.all`
     **no** existe en `@testing-library/react` 16.3.3 (`dist/pure.js:335,341`). Hoy falla: la primera
     composición dice desktop y hay dos contradictorias.
   - (1) **AC-11** (coherencia del stub global: `matches` derivado de `innerWidth`). Hoy falla. La
     verificación vive en un archivo que **no** sustituya `window.matchMedia` (suite dedicada al
     stub global, o `beforeEach` que lo restaure); **no** vale dentro de `useBreakpoint.test.js`
     (`:33-37` lo reemplaza).
   - (1) **AC-13** (coherencia del **stub local** de `DashboardUserModal.test.jsx`: `innerWidth` 1024
     debe dar `matches: true` en las dos queries). Hoy falla (el default deja `matches:false`, contra
     su propio comentario).
   - (3) **AC-07** (helper directo con mes 0, mes 13, `"2026-XX-12"`, `"2026-10-1"` y cadena vacía
     → «—»). Hoy falla (devuelve `undefined` interpolado).
   - (2) verificación por `grep` (no requiere prueba nueva); si se añade un aserto, que sea
     `classList.contains("animate-fadeIn") === false` sobre la capa exterior, nunca una prueba de
     estilo calculado (jsdom no evalúa animaciones).
3. **Ajuste de la infraestructura (Q1 = b + coordinación con la 011):** hacer coherente el stub
   global, volver a medir las suites de §7.1-B y ajustar **solo aserciones** si alguna cambió de
   resultado, con el hallazgo registrado (ningún cambio de producción: §7.2-6). El stub **local** de
   `DashboardUserModal.test.jsx` se hace coherente con el mismo criterio (AC-13, DP-12): su
   `describe` del gesto y sus 20 casos no cambian de contenido.
4. **Tras las correcciones:** repetir el comando del punto 1 y comprobar que AC-03 y AC-05..AC-08
   siguen verdes **en sus casos existentes** (el recuento crece con los casos nuevos, DP-06), que
   AC-11, AC-12 y AC-13 se cumplen, que **AC-04 se reporta como no ejecutado** (no verde) y que
   `AuthModal.test.jsx`, `LogMovimientos.test.jsx`, `DashboardUserModal.test.jsx` y `App.test.jsx` no
   cambian de resultado sin justificación; el resto de casos del hook no se altera. La **011** se
   re-mide **después**, contra este estado (§3.4 y §7).
5. **Tarea final del plan:** `npm test` (suite completa) y `npm run build`, con comparación explícita
   contra la línea base medida y reporte **pass/fail/no ejecutado** por validación.
6. **Validación visual:** **no aplicable** a (2) (la clase no generaba reglas) ni a (3) (mismo
   marcado). Para (1) solo sería observable en el borde de 768px; **no se declara realizada** y, si
   se hiciera, se registraría como revisión manual con su medida.
7. **Sin commit ni staging** en las fases de spec y plan.
