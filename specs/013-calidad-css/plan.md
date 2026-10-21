# Plan 013 — Calidad CSS y Fluid Glass (visual/CSS)

**Spec:** `specs/013-calidad-css/spec.md` — **aprobada por el usuario el 2026-10-18**.
**Fecha del plan:** 2026-10-18 · **Estado:** listo para ejecutar `tasks.md`.
**Alcance:** solo lo visual/CSS de la 013 (RF-01…RF-17). **No** incluye higiene, dobles ni
documentación (Spec 015), ni P1/`dist/` (spec futura), ni hexadecimales de JSX (Spec 014), ni cromo
modal (010/011).
**Fase:** planificación. **Este documento no modifica `src/`**; define qué se cambiará, con qué
mecanismo y cómo se verificará.

**Línea base de partida (aportada, no re-medida por el planner):** `npm test` **455/455 en 30
archivos** y `npm run build` verde (2026-10-17). **La primera tarea (T1) la re-mide antes de tocar
código**; sin esa medición no se declara nada (RF-15/RF-16, AC-16).

**Referencias `archivo:línea`:** verificadas el **2026-10-18** sobre el árbol actual. El usuario
edita a mano: **T1 las re-verifica** y lo que ya no exista se registra como «ya no aplicable»
(CL-10) sin recrearlo.

---

## 1. Estrategia

Se resuelve **por capas y de abajo arriba**, para que cada tarea deje la suite en verde y no haya
estados intermedios que incumplan un requisito ya implementado:

1. **Medir** (T1) — línea base y re-verificación de referencias.
2. **Comportamiento de revelado** (T2) — las cinco secciones pasan a usar las clases globales.
3. **Hoja global: superficies y preferencias** (T3) — nace la clase de superficie, se fijan los dos
   contextos de blur y se blinda H-1 **antes** de que ningún componente la use.
4. **Adopción en componentes** (T4) — las cinco superficies cambian de utilidad a la clase, con las
   expectativas de estilo actualizadas.
5. **Radios** (T5), **área segura y columnas** (T6), **tokens y literales** (T7), **contraste** (T8).
6. **Validación manual integral** (T9) y **cierre** (T10).

Principios:

- **Una sola fuente de verdad por valor.** El blur/saturación del conjunto vive en la hoja global;
  ningún componente lo repite.
- **Nada de `!important` ni de estilos en línea** para ganar precedencia: la cascada se resuelve por
  orden y especificidad (H-1).
- **Los valores existentes no cambian** salvo donde un requisito lo pide (radios, contraste, blur).
- **Compatibilidad con el contrato de la 001:** `index.css.test.js` **se amplía**; ningún aserto
  existente se edita.
- **Sin dependencias, sin tokens nuevos, sin hexadecimales nuevos, sin superficies nuevas.**

---

## 2. Decisiones de mecanismo

> Cada decisión indica **qué cambia**, **por qué** y **qué alternativa se descartó** (§3).

### D1 — Revelado: re-adoptar `reveal` / `reveal-left` + `revealed`

- **Qué:** en las cinco secciones se sustituye el par de utilidades en línea
  (`transition-all duration-700` + `opacity-0 translate-y-8|translate-y-6|-translate-x-8`) por
  `reveal` (vertical) o `reveal-left` (horizontal) y se añade `revealed` cuando `useReveal()`
  devuelve `visible`.
- **Por qué:** es la única forma de que vuelvan a aplicar la puerta `.js` (RF-03), el movimiento
  reducido (RF-02) y el contrato probado de la 001, conservando el **sentido** de cada movimiento
  (RF-01).
- **Efecto colateral aceptado y medido:** las distancias pasan a las del contrato global —36px
  vertical (hoy 32px en Hero/Features/Cta y 24px en StatsBar) y −40px horizontal (hoy −32px)— y la
  duración sigue en 700 ms. No cambia **cuándo** se revela (mismo `useReveal`).

### D2 — Superficies: una clase `.glass-surface` en la hoja global

- **Qué:** se añade en `src/styles/index.css` una clase de superficie con el **mismo contrato** que
  `.glass-hero`:
  - base (>640px): `backdrop-filter: blur(24px) saturate(180%)` + `-webkit-`;
  - ≤640px: `blur(14px) saturate(180%)` + `-webkit-` (saturación **intacta**);
  - transparencia reducida: `none` + `-webkit-…: none`.
  Las cinco superficies con `backdrop-blur-md` (`Header`, `SidebarResponsive`, `BottomNav`,
  `DashboardUserModal`, `DashboardDrawer`) sustituyen esa utilidad por `glass-surface`.
- **Por qué:** (a) RF-05 y RF-06 piden **20–30px + 160–200 %** y **12–16px con la saturación
  intacta** en seis superficies; (b) DP-25 prohíbe tocar la utilidad compartida `backdrop-blur-md`
  (afectaría al control `PaginaInicio.jsx:55`); (c) una sola declaración evita cinco copias y hace
  verificable el efecto por superficie; (d) 24px/180 % ya es el valor del hero, así que el conjunto
  queda homogéneo **sin tocar** `.glass-hero`.
- **No cambia:** velos (`backdrop-blur-sm`), controles (`PaginaInicio.jsx:55`,
  `MiTarjetaVirtual.jsx:216`, `Hero.jsx:68`) ni `AuthModal.jsx:141` (`backdrop-blur-xl`, DP-17).

### D3 — H-1: reordenar (sin cambiar valores) y extender la preferencia

- **Qué:** el bloque `@media (max-width: 640px)` se **mueve** para quedar **antes** del bloque
  `@media (prefers-reduced-transparency: reduce)`, y este último incorpora `.glass-surface` con
  `backdrop-filter: none` (y `-webkit-`). El bloque `@supports not` no se toca.
- **Por qué:** hoy el ajuste de ≤640px re-declara el filtro **después** de la preferencia y la pisa
  (H-1). Con el orden invertido, la preferencia gana por cascada en **ambos** contextos (RF-04), y
  al extenderla a `.glass-surface` la prevalencia vale para las seis superficies. **Ningún valor
  existente cambia**: solo el orden y una regla nueva.
- **`background`:** no se toca. Las cinco superficies ya tienen fondo semisólido (`/80`, `/95`,
  `/92`) y `.glass-hero` conserva su `rgba(15,17,23,0.92)`.

### D4 — Radios: quitar el 16px que pisa el radio de vidrio y heredar en las caras

- **Qué:**
  - `AcordeonTarjetas.jsx:47`: se retira `rounded-2xl` (el `glass-card` ya aporta 24px).
  - `MiTarjetaVirtual.jsx:124` y `:164`: `rounded-2xl` → **`rounded-[inherit]`** (24px, el mismo
    radio que su contenedor).
- **Por qué:** RF-07 exige 20–28px en las superficies con esquinas y coherencia en las anidadas. Las
  caras de la tarjeta comparten la caja del contenedor (`absolute inset-0` + `overflow-hidden`): con
  16px dejaban ver el fondo blanco del `glass-card` en las esquinas; `inherit` las alinea exactamente.
- **Criterio de esquinas anidadas (queda escrito aquí):** si el hijo **comparte la caja** de la
  superficie (misma caja, `inset-0`, `overflow-hidden`), **hereda** su radio; si está **inset** por
  padding, conserva su radio propio **siempre que sea ≤ el de la superficie**.
- **No se toca:** las cuatro fichas del Hero (`Hero.jsx:81, :87, :93, :99`, 16px **inset** dentro de
  24px, sin borde compartido), `GridTarjetas.jsx:33` (envoltorio transparente, solo anillo de foco) y
  el cromo modal (`DashboardUserModal.jsx:109` `rounded-2xl`, `AuthModal.jsx:141` `rounded-3xl`;
  DP-16/DP-20).

### D5 — Área segura: usar la clase que existe

- **Qué:** `BottomNav.jsx:40` usa **`safe-bottom`** en lugar de `pb-safe` (clase que **no está
  definida**).
- **Por qué:** `index.css:37-39` ya declara `.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 1rem) }`
  y no tiene consumidores. Es el mecanismo que el CSS global **ya** declara (RF-09) y conserva el
  respaldo de `1rem`. No se añade ninguna utilidad nueva.
- **Comentarios del componente** (`:2`, `:29`) se actualizan a `safe-bottom` para no documentar una
  clase inexistente.

### D6 — Barra inferior: cuatro pistas

- **Qué:** `grid-cols-5` → **`grid-cols-4`** en `BottomNav.jsx:40`.
- **Por qué:** hay cuatro controles (tres ítems + «Menú»); RF-10 exige cuatro columnas equidistantes
  sin tocar controles, orden, etiquetas ni acciones.

### D7 — Literales del CSS: `color-mix` con los tokens existentes

- **Qué:** los tres literales con token equivalente pasan a `color-mix(in srgb, <token> <n>%, transparent)`:
  - `index.css:83` `rgba(224, 221, 216, 0.8)` → `var(--color-border-line)` al 80 %;
  - `index.css:85` `rgba(15, 17, 23, 0.04)` → `var(--color-bg-dark)` al 4 %;
  - `index.css:92` `rgba(26, 122, 94, 0.12)` → `var(--color-emerald-primary)` al 12 %.
- **Por qué:** `color-mix` en sRGB produce el **mismo** color con alfa (no hay cambio computado),
  usa tokens existentes y el proyecto ya lo emplea en los anillos `:focus-visible` (`:166`, `:172`).
- **No se migran:** `rgba(15,17,23,0.88)` (`:99`) y `rgba(15,17,23,0.92)` (`:106`) —asertados
  literalmente por `index.css.test.js:125` y `:19`— ni `#ffffff` (`:82`), sin token equivalente.

### D8 — Tokens sin consumidor

- **Qué:** se retiran `--color-bg-dark-mid` (`:16`), `--color-bg-dark-end` (`:17`) y
  `--header-height` (`:33`); `--color-cat-savings` (`:28`) se conserva con un **comentario de
  reserva** («sin consumidor hoy; paleta de categorías; no retirar»).
- **Por qué:** R8. El barrido (`grep`) confirma que los tres primeros no tienen consumidor (el único
  rastro de `--header-height` es una **aserción de ausencia** en `DashboardLayout.test.jsx:267`) y
  que `--color-cat-savings` es una reserva motivada. No se añade ningún token.

### D9 — Contraste: tokens existentes y estado no cromático

- **Qué:**
  - `StatsBar.jsx:38`: `text-white/80` → **`text-white`** (fondo opaco `#1a7a5e`).
  - `BottomNav.jsx:52-53`: activo → **`text-mint-accent`**; inactivo →
    **`text-bg-cream hover:text-mint-accent`**.
  - `BottomNav.jsx:63`: indicador → **`bg-mint-accent`**.
  - `BottomNav.jsx:76` (Menú): `text-bg-cream hover:text-mint-accent`.
- **Por qué:** con el fondo efectivo real (barra `/80` sobre crema) las etiquetas actuales quedan en
  ≈1,8:1 y ≈2,0:1; con los tokens elegidos, el peor caso de los cuatro fondos de prueba es **9,46:1**
  (etiqueta clara) y **6,75:1** (mint e indicador). El estado activo conserva su información **no
  cromática** (`aria-current="page"` + barra indicadora), como exige RF-14.
- **No se usa alfa** (`text-white/80`, etc.) en las etiquetas: la composición haría ambiguo el valor
  a registrar en M-7.

### D10 — Pruebas: ampliar la hoja y actualizar solo expectativas

- **Qué:** `index.css.test.js` recibe un `describe` **nuevo** al final (no se edita ningún aserto
  existente); las suites de superficies/barra actualizan **solo la expectativa de estilo** que la
  spec corrige; se añaden aserciones mínimas de radio y de revelado en las suites existentes.
- **Por qué:** RF-15, CL-12, CL-13, DP-19. No se tocan dobles de `framer-motion`, stubs de
  `matchMedia`, configuración de Vitest ni casos de foco (011/012 y 015).

---

## 3. Alternativas descartadas

| # | Alternativa | Por qué se descarta |
|---|---|---|
| A1 | Utilidades por componente (`backdrop-blur-[24px] backdrop-saturate-[1.8]`) + clase de override para ≤640px | Duplica el valor cinco veces, exige una regla con mayor especificidad para el override y multiplica los puntos donde el valor puede divergir. |
| A2 | Sobrescribir `.backdrop-blur-md` dentro de `@media (max-width: 640px)` | **Prohibido** por DP-25: afectaría al control excluido `PaginaInicio.jsx:55`. |
| A3 | `!important` o estilos en línea para el blur de ≤640px | El estilo en línea gana a la transparencia reducida y **rompería H-1**; `!important` haría la cascada inmanejable. |
| A4 | Cambiar clases por JS (`useBreakpoint`) según el ancho | Mete JS en un asunto de CSS, rompe la puerta `.js`/preferencias y añade renders. |
| A5 | Solo reordenar los bloques (sin `.glass-surface`) | Arregla H-1 en el hero, pero **no cubre** las cinco superficies de componente, que no tienen regla que reducir. |
| A6 | Poner 20px fijos en las caras de la tarjeta virtual | No coincide con el radio real del contenedor (24px) ni se adapta si `--radius-glass` cambia; `inherit` es exacto. |
| A7 | Etiquetas con alfa (`text-white/80`) para suavizar | La composición sobre fondo translúcido hace ambiguo el ratio y el valor a registrar; se prefieren colores sólidos. |
| A8 | Añadir tokens `--color-*-soft` para los literales | Prohibido: RF-11/RF-17 no admiten tokens nuevos. |
| A9 | Migrar `#ffffff` de `.glass-card` a `--color-bg-cream` | No es el mismo color; cambiaría el aspecto (DP-06). |

---

## 4. Archivos afectados

**Código (13 archivos):**

| Archivo | Cambio | Tarea |
|---|---|---|
| `src/styles/index.css` | `.glass-surface`; reordenar ≤640px; `.glass-surface` en preferencia y en ≤640px; 3 literales → `color-mix`; retirar 3 tokens; comentario de reserva | T3, T7 |
| `src/components/domain/landing/Hero.jsx` | `reveal` + `revealed` (retira utilidades en línea) | T2 |
| `src/components/domain/landing/StatsBar.jsx` | idem; etiqueta `text-white` | T2, T8 |
| `src/components/domain/landing/Features.jsx` | idem | T2 |
| `src/components/domain/landing/HowItWorks.jsx` | `reveal-left` + `revealed` | T2 |
| `src/components/domain/landing/CtaSection.jsx` | `reveal` + `revealed` | T2 |
| `src/components/layout/Header.jsx` | `backdrop-blur-md` → `glass-surface` (rama con scroll) | T4 |
| `src/components/layout/SidebarResponsive.jsx` | idem | T4 |
| `src/components/layout/BottomNav.jsx` | `glass-surface`; `safe-bottom`; `grid-cols-4`; colores/indicador; comentarios | T4, T6, T8 |
| `src/components/layout/DashboardUserModal.jsx` | `glass-surface` (mantiene `rounded-2xl`) | T4 |
| `src/components/layout/DashboardDrawer.jsx` | `glass-surface` | T4 |
| `src/components/domain/dashboard/AcordeonTarjetas.jsx` | retirar `rounded-2xl` | T5 |
| `src/components/domain/dashboard/MiTarjetaVirtual.jsx` | `rounded-[inherit]` en las dos caras | T5 |

**Pruebas (9 archivos):**

| Archivo | Cambio | Tarea |
|---|---|---|
| `src/styles/index.css.test.js` | **Añadir** un `describe` nuevo (≈8 asertos); no se edita nada existente | T3, T6, T7 |
| `src/components/Hero.test.jsx` | Aserción de `reveal` y ausencia de `opacity-0` | T2 |
| `src/components/domain/landing/Features.test.jsx` | idem | T2 |
| `src/components/domain/dashboard/AcordeonTarjetas.test.jsx` | `glass-card` sin `rounded-2xl` | T5 |
| `src/components/domain/dashboard/MiTarjetaVirtual.test.jsx` | caras con `rounded-[inherit]` | T5 |
| `src/components/layout/BottomNav.test.jsx` | expectativas: `glass-surface`, `safe-bottom`, `grid-cols-4`, colores; título de un caso | T4, T6, T8 |
| `src/components/layout/SidebarResponsive.test.jsx` | expectativa: `glass-surface` (+ título) | T4 |
| `src/components/layout/DashboardUserModal.test.jsx` | expectativa: `glass-surface` (+ título); `rounded-2xl` **intacto** | T4 |
| `src/components/layout/DashboardDrawer.test.jsx` | expectativa: `glass-surface` (+ título) | T4 |

**No se toca:** `PaginaInicio.jsx`, `AuthModal.jsx`, `ModalTarjeta.jsx` (salvo su suite, que no
cambia), `GridTarjetas.jsx`, `PanelTarjetas.jsx`, `Card.jsx`, `SidebarNavContenido.jsx`,
`DashboardLayout.jsx`, `index.html`, `vitest.setup.js`, configuración de Vitest, stubs ni specs.

---

## 5. Orden por etapas (mapa a `tasks.md`)

| Etapa | Tareas | Resultado |
|---|---|---|
| 1 — Línea base y sondeo | T1 | Números de partida y referencias confirmadas |
| 2 — Revelado y preferencias | T2 | Las cinco secciones gobernadas por `.reveal*` |
| 3 — Hoja: superficies y H-1 | T3 | `.glass-surface`, dos contextos y precedencia blindada |
| 4 — Adopción en superficies | T4 | Las cinco superficies usan `.glass-surface` |
| 5 — Radios | T5 | Conjunto con 20–28px y caras heredando |
| 6 — Área segura y columnas | T6 | Reserva real y cuatro pistas |
| 7 — Tokens y literales | T7 | Deuda de la 009 pagada |
| 8 — Contraste | T8 | Franja y barra en AA |
| 9 — Validación manual | T9 | M-1…M-9 registradas |
| 10 — Cierre | T10 | Suite y build verdes frente a la línea base |

---

## 6. Validación

### 6.1 Automatizada (Vitest)

| Bloque | Comando | Qué prueba |
|---|---|---|
| A — Landing | `npx vitest run src/components/domain/landing src/components/Hero.test.jsx src/hooks/useReveal.test.js src/styles/index.css.test.js` | Revelado en DOM y contrato global |
| B — Superficies | `npx vitest run src/styles/index.css.test.js src/components/layout/BottomNav.test.jsx src/components/layout/SidebarResponsive.test.jsx src/components/layout/DashboardUserModal.test.jsx src/components/layout/DashboardDrawer.test.jsx` | `.glass-surface`, contextos, precedencia, expectativas de estilo |
| C — Radios | `npx vitest run src/components/domain/dashboard/AcordeonTarjetas.test.jsx src/components/domain/dashboard/MiTarjetaVirtual.test.jsx src/components/domain/modales/ModalTarjeta.test.jsx src/components/domain/landing/Features.test.jsx` | Radios y no-regresión de las superficies con esquinas |
| D — Barra | `npx vitest run src/components/layout/BottomNav.test.jsx src/styles/index.css.test.js` | Área segura, columnas y contraste |
| E — Cierre | `npm test` y `npm run build` | No-regresión completa |

**Asertos nuevos en `index.css.test.js` (se añaden, no se reescriben):**

1. `.glass-surface` base: `backdrop-filter` y `-webkit-` con `blur(2[0-9]|30)px) saturate(1[6-9][0-9]%|200%)`
   (expresado como rango 20–30px / 160–200 %).
2. Bloque `@media (max-width: 640px)`: contiene `.glass-surface` con `blur(1[2-6])px) saturate(180%)`.
3. **Precedencia (H-1):** `css.indexOf("@media (max-width: 640px)") < css.indexOf("@media (prefers-reduced-transparency: reduce)")`.
4. El bloque de transparencia reducida incluye `.glass-surface` con `backdrop-filter: none` y `-webkit-`.
5. Los tres literales migrados (`rgba(224, 221, 216, 0.8)`, `rgba(15, 17, 23, 0.04)`,
   `rgba(26, 122, 94, 0.12)`) ya no aparecen.
6. Ausencia de `--color-bg-dark-mid`, `--color-bg-dark-end` y `--header-height`.
7. Presencia de `--color-cat-savings` y de su comentario de reserva.
8. `.glass-card` sigue siendo sólida: su regla **no** contiene `backdrop-filter` y declara `#ffffff`.
9. `.safe-bottom` existe con `env(safe-area-inset-bottom` y un respaldo (`1rem`).

**Roja-antes/verde-después:** los nueve asertos nuevos fallan antes del cambio de hoja (1–5, 8, 9)
o antes de retirar tokens (6); el 7 pasa ya (se conserva). En componentes, las expectativas de
`glass-surface`/`safe-bottom`/`grid-cols-4`/colores quedan **rojas** al cambiar el componente y
**verdes** al actualizar la expectativa en la misma tarea.

**Recuento:** la línea base son 455 casos en 30 archivos; el plan **añade** ≈13 casos (9 en la hoja,
2 en landing, 2 en radios). T10 compara **archivo por archivo**, no solo el total.

### 6.2 Manual (protocolo §9-P de la spec)

Toda medición declara: **navegador y versión** (`navigator.userAgent`), **ancho CSS real**
(`window.innerWidth`), **estado de la preferencia** verificado con `matchMedia(...).matches`, y los
valores de `getComputedStyle` por elemento. Navegador de partida: **Chromium ≥ 120** (o Firefox
≥ 121) disponible en la máquina; se registra el nombre y la versión exactos.

| ID | Tamaños | Preferencia | Valor esperado (tras el plan) | Tarea |
|---|---|---|---|---|
| **M-1** | 1440×900, 375×812 | `reduced-motion: reduce` | `opacity: 1`; `transform: none`; `transition-duration: 0s` en las cinco secciones | T2 / T9 |
| **M-2** | 1440×900, 1024×768, 640×900, 639×900, 375×812 | `reduced-transparency: reduce` | `backdropFilter` = **`none`** en las seis superficies; fondo semisólido intacto | T3, T4 / T9 |
| **M-3a** | 1440×900, 1024×768 | normal | `blur(24px) saturate(1.8)` en las seis superficies | T3, T4 / T9 |
| **M-3b** | 640×900, 639×900, 375×812 | normal | `blur(14px) saturate(1.8)` en las seis; el botón «?» de `PaginaInicio.jsx:55` **sin cambios** (`blur(12px)`) | T4 / T9 |
| **M-4** | 1440×900 | normal | `border-radius: 24px` en `.glass-hero`, `.glass-card`, acordeón, modal de tarjeta y tarjeta virtual; caras a 24px; sin fondo blanco en las esquinas | T5 / T9 |
| **M-5** | 375×812 (con *safe area* simulada y sin ella) | normal | `padding-bottom` = **34px** con notch y **16px** (1rem) sin *safe area* | T6 / T9 |
| **M-6** | 1440×900 | normal | etiqueta `rgb(255, 255, 255)` sobre `rgb(26, 122, 94)` ⇒ **5,26:1** | T8 / T9 |
| **M-7** | 1440×900, 375×812 | normal | etiquetas `rgb(247, 246, 242)` / `rgb(110, 231, 192)` e indicador `rgb(110, 231, 192)`; peor caso de F1–F4: **9,46:1** / **6,75:1** / **6,75:1** | T8 / T9 |
| **M-8** | 1440×900, 375×812 (menú y modal abiertos) | normal | ≤3 superficies translúcidas superpuestas, ≤2 blobs | T9 |
| **M-9** *(opcional)* | el que se declare | normal | fallback semisólido legible sin `backdrop-filter` | T9 |

**Contextos y fondos de contraste (transcripción operativa de la spec):**

- >640px ⇒ `blur(24px) saturate(1.8)`; ≤640px ⇒ `blur(14px) saturate(1.8)`; reduce ⇒ `none`.
- Fondos de prueba de la barra: **F1** `#f7f6f2`, **F2** `#ffffff`, **F3** `#0f1117`, **F4** `#1a7a5e`;
  fondo efectivo `0,80 × rgb(15,17,23) + 0,20 × fondo`.
- Se registra una fila por celda: tamaño, preferencia, valor esperado, valor obtenido, veredicto.

### 6.3 Valores de contraste que el plan espera (cálculo del planner, a confirmar en M-6/M-7)

| Elemento | Color | F1 `#3d3f43` | F2 `#3f4145` | F3 `#0f1117` | F4 `#112625` |
|---|---|---|---|---|---|
| Etiqueta inactiva | `#f7f6f2` (crema) | 9,76:1 | **9,46:1** | 17,45:1 | 14,62:1 |
| Etiqueta activa | `#6ee7c0` (mint) | 6,96:1 | **6,75:1** | 12,45:1 | 10,43:1 |
| Indicador | `#6ee7c0` | 6,96:1 | **6,75:1** | 12,45:1 | 10,43:1 |
| Antes: inactiva | `#5a6475` | **1,77:1** | 1,72:1 | 3,16:1 | 2,85:1 |
| Antes: activa | `#1a7a5e` | **2,00:1** | 1,95:1 | 3,58:1 | 3,23:1 |

Los ratios son **cálculos** del planner sobre los tokens; no se declaran medidos hasta ejecutar M-6/M-7.

---

## 7. Riesgos y mitigación

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Reordenar bloques rompe el contrato de la 001 | Media | Alto | Solo se **mueve** el bloque; valores y asertos existentes intactos; `npx vitest run src/styles/index.css.test.js` en T3 antes de seguir. |
| R2 | `.glass-surface` (CSS sin capa) pisa alguna utilidad de filtro | Baja | Medio | Solo declara `backdrop-filter`; se retira `backdrop-blur-*` de las cinco superficies (T4) y se verifica con `grep` que ningún otro elemento del conjunto lo conserva. |
| R3 | El control `PaginaInicio.jsx:55` cambia sin querer | Baja | Alto | No se toca; M-3b lo mide explícitamente (debe seguir en `blur(12px)`). |
| R4 | La tarjeta `rounded-[inherit]` no compila | Baja | Bajo | Verificar el build; si no compila, `style={{ borderRadius: "inherit" }}` (sin dependencias) y se registra. |
| R5 | Subir el contraste altera el aspecto de la barra | Media | Medio | Se conserva el indicador y `aria-current`; M-7 con captura; si el usuario prefiere otra pareja de tokens, se cambia solo D9. |
| R6 | El blur de 24px en móvil reduce rendimiento | Media | Bajo | En ≤640px queda en 14px; M-3b revisa repintado; si aparece coste, se registra como hallazgo (no se inventa otro umbral, DP-09). |
| R7 | Las expectativas de 011/012 se tocan de más | Baja | Alto | Solo la línea de estilo indicada (CL-12); dobles, stubs, config y foco intactos; diff revisado en T4. |
| R8 | `color-mix` no soportado en el objetivo | Baja | Bajo | Ya se usa en `:focus-visible` (`:166`, `:172`); M-4/M-6 lo confirman visualmente. |
| R9 | Retirar un token usado en un sitio no detectado | Baja | Medio | `grep` en T1 y T7; `npm run build` en T10. |
| R10 | Estado intermedio con blur de 24px en móvil | Baja | Bajo | T3 deja la hoja completa **antes** de T4 (adopción); no hay ventana con 24px por defecto. |

---

## 8. Relación cambios ↔ requisitos

| RF | Cambio | Tarea | AC | Verificación |
|---|---|---|---|---|
| RF-01 | `reveal`/`reveal-left` en las cinco secciones | T2 | AC-01 | DOM (`Hero`, `Features`) + fuente (3 sin suite) |
| RF-02 | Movimiento reducido por reglas globales | T2 | AC-02 | Fuente + M-1 |
| RF-03 | Puerta `.js` (sin reglas que oculten sin JS) | T2 | AC-03 | Fuente |
| RF-04 | Precedencia de transparencia reducida (H-1) | T3 | AC-04 | Aserto de orden + M-2 |
| RF-05 | 24px/180 % en >640px en seis superficies | T3, T4 | AC-05 | Aserto base + M-3a |
| RF-06 | 14px/180 % en ≤640px en seis superficies | T3, T4 | AC-06, AC-07 | Aserto ≤640 (existente intacto) + M-3b |
| RF-07 | Radios 20–28px y esquinas anidadas | T5 | AC-08 | Aserciones de clase + M-4 |
| RF-08 | `.glass-card` sólida documentada | T7 | AC-09 | Aserto (sin `backdrop-filter`, `#ffffff`) |
| RF-09 | `safe-bottom` aplicado | T6 | AC-10 | Aserto en hoja + M-5 |
| RF-10 | `grid-cols-4` | T6 | AC-11 | Suite de la barra |
| RF-11 | 3 literales → `color-mix` | T7 | AC-12 | Asertos de ausencia/presencia |
| RF-12 | 3 tokens retirados; 1 reservado | T7 | AC-13 | Asertos + `grep` |
| RF-13 | Franja de métricas en AA | T8 | AC-14 | M-6 |
| RF-14 | Barra inferior en AA (4 fondos) | T8 | AC-15 | M-7 |
| RF-15 | Pruebas y no-regresión | todas | AC-16 | Bloques A–E |
| RF-16 | Validaciones no automatizadas declaradas | T9, T10 | AC-16 | Registro §9-P |
| RF-17 | Alcance mínimo | todas | AC-16 | Diff revisado en T10 |

---

## 9. Fronteras (lo que este plan **no** hace)

- **P1 / `dist/`** (R4): no se valida el CSS compilado ni se toca el build.
- **Spec 015:** no se tocan dobles de `framer-motion`, clase `my-`, `Settings`, recuentos, envoltorio
  `role="listitem"`, `@param` de `como` ni la excepción de `PanelTarjetas`.
- **Spec 014:** no se migran hexadecimales de JSX (`Header.jsx:80` incluido).
- **010/011:** no se toca el cromo modal, sus radios, su animación ni su foco.
- **Datos, rutas, endpoints, `TRIAL_ACTIVO`, dependencias, tokens nuevos, superficies nuevas.**

---

## 10. Notas no bloqueantes (decisiones de plan, no preguntas)

1. **Criterio de esquinas anidadas (D4):** se aplica «hereda si comparte caja; si está inset,
   conserva ≤ el radio de la superficie». Con ese criterio las fichas del Hero quedan en 16px **sin
   cambio**. Si el usuario quisiera homogeneizarlas a 20px, sería un cambio visual adicional no
   exigido por RF-07.
2. **Colores de la barra (D9):** la pareja crema/mint cumple AA con tokens y conserva el indicador.
   Alternativa si se prefiere más contraste entre estados: activo `text-white` + `font-semibold`
   (cambio tipográfico menor). Impacto: solo `BottomNav` y su suite.
3. **Distancias del revelado (D1):** 36px/40px son las del contrato global; antes eran 32px/24px/32px.
   Es consecuencia de RF-01 y no se compensa con estilos en línea.
4. **`DashboardUserModal` (RF-05):** recibe `saturate(180%)` sobre fondo crema; el efecto es
   inapreciable pero el requisito es explícito para las seis superficies.

**Preguntas abiertas para el usuario: ninguna.** Las cuatro notas anteriores son decisiones de plan
dentro de lo aprobado; ninguna bloquea T1–T10.
