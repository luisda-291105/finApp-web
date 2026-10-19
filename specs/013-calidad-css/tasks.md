# Tareas 013 — Calidad CSS y Fluid Glass (visual/CSS)

**Spec:** `specs/013-calidad-css/spec.md` (aprobada 2026-10-18) · **Plan:** `specs/013-calidad-css/plan.md`
**Orden:** T1 → T10. Cada tarea deja la suite **en verde** y es verificable por separado.
**Reglas de ejecución:** leer `AGENTS.md` y `.agents/rules/rules.md` antes de empezar; **re-verificar
cada `archivo:línea` antes de editar** (el usuario edita a mano; CL-10); no tocar `src/` fuera de lo
que dice la tarea; sin dependencias, sin tokens nuevos, sin hexadecimales nuevos; **sin staging ni
commit**.
**Manual:** toda medición de navegador sigue el protocolo §9-P (navegador y versión exactos, ancho
CSS real, preferencia verificada con `matchMedia`, valores de `getComputedStyle` y veredicto por
celda). Navegador de partida: **Chromium ≥ 120** o **Firefox ≥ 121**; se registra la versión.
**Tamaños de referencia:** 1440×900 · 1024×768 · 640×900 · 639×900 · 375×812.
**Preferencias:** normal · `prefers-reduced-motion: reduce` · `prefers-reduced-transparency: reduce`.

---

## T1 — Línea base y sondeo de referencias

**Etapa 1 · Depende de:** nada.
**Alcance:** medir el punto de partida y confirmar que todo lo que la spec cita sigue existiendo.
**Archivos:** ninguno (solo lectura y ejecución).

**Pasos**

1. `npm test` → registrar **nº de casos, nº de archivos y 0 fallos** (esperado: 455/455 en 30).
2. `npm run build` → registrar verde/rojo.
3. Re-verificar con `read`/`grep`:
   - `src/styles/index.css`: `:16`, `:17`, `:28`, `:31`, `:33`, `:37-39`, `:71-72`, `:81-87`, `:92`,
     `:96-101`, `:107-108`, `:124-129`.
   - Landing: `Hero.jsx:36-38`, `StatsBar.jsx:29-31`, `Features.jsx:104-106`,
     `HowItWorks.jsx:50-52`, `CtaSection.jsx:26-28`.
   - Superficies: `Header.jsx:36`, `SidebarResponsive.jsx:29`, `BottomNav.jsx:40`,
     `DashboardUserModal.jsx:109`, `DashboardDrawer.jsx:108`.
   - Radios: `AcordeonTarjetas.jsx:47`, `MiTarjetaVirtual.jsx:124`, `:164`.
   - Tokens: `grep -rn "bg-dark-mid\|bg-dark-end\|header-height" src` (solo `index.css` y la
     aserción de ausencia `DashboardLayout.test.jsx:267`).
   - `grep -rn "pb-safe" src` (1), `grep -rn "grid-cols-5" src` (2: componente y suite),
     `grep -rn "backdrop-blur" src` (13 sitios + suites).
4. Registrar lo que ya **no** exista como «ya no aplicable» (CL-10) y **no** recrearlo.

**Cubre:** CL-10, DP-13, AC-16 (parte de partida).
**Prueba:** no hay cambio de código; el «verde» es la línea base registrada.
**Comandos:** `npm test`, `npm run build`.
**Hecho cuando:** están registrados los números de línea base y el estado (existe / ya no aplicable)
de **cada** referencia de la lista, sin haber editado ningún archivo.

**Resultado (2026-10-18, medición previa a tocar código):** `npm test` **455/455 en 30 archivos**
(0 fallos) · `npm run build` **verde**.

---

## T2 — Revelado y preferencias en las cinco secciones ✅

**Etapa 2 · Depende de:** T1.
**Alcance:** sustituir las utilidades en línea por las clases de revelado del CSS global.
**Archivos y líneas**

| Archivo | Cambio |
|---|---|
| `src/components/domain/landing/Hero.jsx:34-38` | `className` con `reveal` + `revealed` condicional (plantilla: `reveal ${visible ? "revealed" : ""}`), conservando `relative z-10 max-w-5xl mx-auto`; se retiran `transition-all duration-700` y el par `opacity-100/opacity-0 translate-y-*` |
| `src/components/domain/landing/StatsBar.jsx:27-31` | idem (`reveal`), conservando `grid grid-cols-2 md:grid-cols-4 gap-8 text-center` |
| `src/components/domain/landing/Features.jsx:102-106` | idem, conservando las clases de grilla |
| `src/components/domain/landing/HowItWorks.jsx:48-52` | **`reveal-left`** (movimiento horizontal) + `revealed` |
| `src/components/domain/landing/CtaSection.jsx:24-28` | idem (`reveal`), conservando `relative z-10 max-w-3xl mx-auto` |
| `src/components/Hero.test.jsx` | añadir: `expect(document.querySelector(".reveal")).not.toBeNull()` y `expect(document.querySelector(".opacity-0")).toBeNull()` |
| `src/components/domain/landing/Features.test.jsx` | idem |

No se toca `ref`, ni `useReveal`, ni `index.html`, ni `index.css`, ni `reveal-stagger`.

**Cubre:** RF-01, RF-02, RF-03 · AC-01, AC-02, AC-03 · CL-01, CL-02, CL-14 · DP-02, DP-03, DP-18.
**Prueba (roja-antes/verde-después):** las dos aserciones nuevas fallan antes del cambio de los
componentes (no existe `.reveal`, sí `.opacity-0`) y pasan después.
**Comandos:**
`npx vitest run src/components/domain/landing src/components/Hero.test.jsx src/hooks/useReveal.test.js src/styles/index.css.test.js`
**Manual M-1 (navegador/versión, 1440×900 y 375×812, `reduced-motion: reduce`):** registrar
`opacity`, `transform` y `transition-duration` de las cinco secciones (esperado `1`, `none`, `0s`) y
confirmar que ninguna queda oculta. Con preferencia normal, confirmar que el revelado ocurre al
entrar en viewport y que el sentido es vertical salvo **HowItWorks** (horizontal).
**Hecho cuando:** las cinco secciones usan `reveal`/`reveal-left` (+ `revealed` al revelarse), no
queda ninguna utilidad en línea equivalente, las suites del bloque A pasan y M-1 está registrada.

---

## T3 — Hoja global: `.glass-surface`, dos contextos y precedencia (H-1) ✅

**Etapa 3 · Depende de:** T1.
**Alcance:** crear la clase de superficie con el contrato de blur/saturación, extenderla a la
transparencia reducida y **reordenar** los bloques para que la preferencia prevalezca. **Sin cambiar
ningún valor existente.**
**Archivos y líneas:** `src/styles/index.css` y `src/styles/index.css.test.js`.

**Cambios en la hoja**

1. **Después de `.glass-hero` (cierre en `:78`)** añadir:
   ```css
   /* Superficies de vidrio del conjunto (header, sidebar, barra inferior y paneles modales).
      Mismo contrato que .glass-hero: spec 001 RF5 y spec 013 RF-05/RF-06. */
   .glass-surface {
     backdrop-filter: blur(24px) saturate(180%);
     -webkit-backdrop-filter: blur(24px) saturate(180%);
   }
   ```
2. **Mover** el bloque `@media (max-width: 640px)` (hoy `:124-129`) para que quede **después** de
   `@supports not` (`:96-101`) y **antes** de `@media (prefers-reduced-transparency: reduce)`
   (hoy `:104-110`). Añadir dentro `.glass-surface` con:
   `backdrop-filter: blur(14px) saturate(180%)` y `-webkit-backdrop-filter: blur(14px) saturate(180%)`.
   **No** se modifica la regla de `.glass-hero` de ese bloque.
3. **Añadir** al bloque de transparencia reducida:
   ```css
   .glass-surface {
     backdrop-filter: none;
     -webkit-backdrop-filter: none;
   }
   ```
   Sin `background` (cada superficie ya tiene fondo semisólido). `.glass-hero` conserva su
   `rgba(15, 17, 23, 0.92)`.
4. **No** se toca `@supports not`, ni `.glass-card`, ni los revelados, ni `:focus-visible`.

**Asertos nuevos (añadir un `describe` al final; no editar los existentes)**

```js
describe("013 — superficies de vidrio y H-1", () => {
  it(".glass-surface declara blur 20–30px y saturación 160–200%", ...);
  it("en ≤640px .glass-surface reduce a 12–16px manteniendo saturate(180%)", ...);
  it("la transparencia reducida se declara después del ajuste de ≤640px (prevalece)", () => {
    expect(css.indexOf("@media (max-width: 640px)"))
      .toBeLessThan(css.indexOf("@media (prefers-reduced-transparency: reduce)"));
  });
  it("la transparencia reducida desactiva el blur de .glass-surface", ...);
});
```

**Cubre:** RF-04, RF-05 (parte de hoja), RF-06 (parte de hoja) · AC-04, AC-05, AC-06 ·
CL-03, CL-07, CL-13 · DP-15, DP-21, DP-22, DP-25.
**Prueba (roja-antes/verde-después):** los cuatro asertos nuevos fallan antes de tocar la hoja
(no existe `.glass-surface`; el orden es el actual) y pasan después. **Los asertos existentes no se
modifican y deben seguir verdes** (incluidos `:19`, `:63-69`, `:125`).
**Comandos:** `npx vitest run src/styles/index.css.test.js`
**Manual M-2 (hero), M-3a (hero):** a 1440×900 y 375×812, con y sin `reduced-transparency: reduce`,
registrar `getComputedStyle(.glass-hero).backdropFilter`: **`none`** con la preferencia (en ambos
anchos), `blur(24px) saturate(1.8)` en >640px y `blur(14px) saturate(1.8)` en ≤640px sin ella.
**Hecho cuando:** existe `.glass-surface` con los tres contextos, la preferencia se declara después
del ajuste de ancho, los asertos nuevos pasan, **todos** los anteriores siguen verdes y M-2/M-3a del
hero están registradas.

---

## T4 — Adopción de `.glass-surface` en las cinco superficies ✅

**Etapa 4 · Depende de:** T3.
**Alcance:** las cinco superficies de componente pasan de `backdrop-blur-md` a `glass-surface`; se
actualizan **solo** las expectativas de estilo de sus suites.
**Archivos y líneas**

| Archivo | Cambio |
|---|---|
| `src/components/layout/Header.jsx:36` | `backdrop-blur-md` → `glass-surface` **solo** en la rama con scroll (`bg-[#f7f6f2]/92 …`); la rama transparente no lleva filtro |
| `src/components/layout/SidebarResponsive.jsx:29` | `backdrop-blur-md` → `glass-surface` |
| `src/components/layout/BottomNav.jsx:40` | idem |
| `src/components/layout/DashboardUserModal.jsx:109` | idem (mantiene `rounded-2xl`) |
| `src/components/layout/DashboardDrawer.jsx:108` | idem |
| `src/components/layout/BottomNav.test.jsx:122` | esperar `glass-surface`; no `backdrop-blur-md` (el título de `:110` se ajusta en T6) |
| `src/components/layout/SidebarResponsive.test.jsx:58, :63` | idem (+ título) |
| `src/components/layout/DashboardUserModal.test.jsx:439, :443` | idem (+ título); `rounded-2xl` **intacto** (`:445`) |
| `src/components/layout/DashboardDrawer.test.jsx:144, :151` | idem (+ título) |

**No se tocan:** `PaginaInicio.jsx:55`, `AuthModal.jsx:141`, `ModalTarjeta.jsx:106`,
`MiTarjetaVirtual.jsx:216`, `Hero.jsx:68` (controles y velos), ni dobles/stubs/config/foco.

**Cubre:** RF-05, RF-06 · AC-05, AC-06, AC-07 · CL-06, CL-12 · DP-09, DP-19, DP-25, DP-26.
**Prueba (roja-antes/verde-después):** cambiar el componente deja las cuatro suites **en rojo** en la
línea de `backdrop-blur-md`; actualizar la expectativa (y solo esa línea) las deja verdes.
**Comandos:**
`npx vitest run src/components/layout/BottomNav.test.jsx src/components/layout/SidebarResponsive.test.jsx src/components/layout/DashboardUserModal.test.jsx src/components/layout/DashboardDrawer.test.jsx`
**Manual M-2, M-3a, M-3b (seis superficies):** en 1440×900, 1024×768, 640×900, 639×900 y 375×812,
registrar `backdropFilter` por superficie:
- normal >640px → `blur(24px) saturate(1.8)` en las seis;
- normal ≤640px → `blur(14px) saturate(1.8)` en las seis;
- `reduced-transparency: reduce` → **`none`** en las seis, en ambos anchos.
Registrar además el botón «?» de `PaginaInicio.jsx:55`: debe seguir en `blur(12px)` (sin cambios).
**Hecho cuando:** las cinco superficies usan `glass-surface`, ninguna conserva `backdrop-blur-md` en
el conjunto, las cuatro suites pasan con la expectativa actualizada, M-2/M-3a/M-3b están registradas
y el control excluido no cambió.

---

## T5 — Radios del conjunto y esquinas anidadas ✅

**Etapa 5 · Depende de:** T1.
**Alcance:** quitar el 16px que pisa el radio de vidrio y alinear las caras de la tarjeta virtual con
su contenedor. Criterio del plan §10.1: **hereda si comparte caja; inset conserva ≤ el de la
superficie**.
**Archivos y líneas**

| Archivo | Cambio |
|---|---|
| `src/components/domain/dashboard/AcordeonTarjetas.jsx:47` | retirar `rounded-2xl` (queda `glass-card`, 24px) |
| `src/components/domain/dashboard/MiTarjetaVirtual.jsx:124` | `rounded-2xl` → `rounded-[inherit]` |
| `src/components/domain/dashboard/MiTarjetaVirtual.jsx:164` | idem |
| `src/components/domain/dashboard/AcordeonTarjetas.test.jsx` | añadir: el botón `.glass-card` **no** tiene `rounded-2xl` |
| `src/components/domain/dashboard/MiTarjetaVirtual.test.jsx` | añadir: las dos caras (`tarjeta-frente` y su hermana) tienen `rounded-[inherit]` y no `rounded-2xl` |

**No se tocan:** `Hero.jsx:81, :87, :93, :99` (fichas **inset**: 16px ≤ 24px, sin borde compartido),
`GridTarjetas.jsx:33`, `DashboardUserModal.jsx:109` ni `AuthModal.jsx:141` (DP-16/DP-20).

**Cubre:** RF-07 · AC-08 · DP-16, DP-20 · P5.
**Prueba (roja-antes/verde-después):** las aserciones nuevas fallan antes (hay `rounded-2xl`) y pasan
después.
**Comandos:**
`npx vitest run src/components/domain/dashboard/AcordeonTarjetas.test.jsx src/components/domain/dashboard/MiTarjetaVirtual.test.jsx src/components/domain/modales/ModalTarjeta.test.jsx src/components/domain/landing/Features.test.jsx`
**Manual M-4 (1440×900, normal):** registrar `border-radius` de `.glass-hero`, `.glass-card`,
acordeón, modal de tarjeta y tarjeta virtual (**24px**), y de las dos caras (24px); captura de las
esquinas de la tarjeta virtual sin fondo blanco visible.
**Hecho cuando:** el acordeón y las caras tienen 24px, el cromo modal y las fichas del Hero siguen
igual, las suites del bloque C pasan y M-4 está registrada.

---

## T6 — Área segura aplicada y cuatro columnas — **parcial** (área segura pendiente)

**Etapa 6 · Depende de:** T4.
**Alcance:** usar la clase de área segura que ya existe y corregir la grilla; actualizar las
expectativas de la barra.
**Archivos y líneas**

| Archivo | Cambio |
|---|---|
| `src/components/layout/BottomNav.jsx:40` | `pb-safe` → `safe-bottom`; `grid-cols-5` → `grid-cols-4` |
| `src/components/layout/BottomNav.jsx:2, :29` | comentarios: `pb-safe` → `safe-bottom` |
| `src/components/layout/BottomNav.test.jsx:86-91` | esperar `safe-bottom` (y no `pb-safe`), título coherente |
| `src/components/layout/BottomNav.test.jsx:110, :120` | `grid-cols-4` (y título) |
| `src/styles/index.css.test.js` | añadir `describe("013 — área segura")` con un aserto: `.safe-bottom` contiene `env(safe-area-inset-bottom` y respaldo `1rem` |

**Cubre:** RF-09, RF-10 · AC-10, AC-11 · P2, P8.
**Prueba (roja-antes/verde-después):** la barra queda en rojo (`pb-safe`, `grid-cols-5`) al cambiar el
componente y verde al actualizar la expectativa; el aserto nuevo de la hoja pasa con el CSS actual
(utilidad ya existente) y protege contra su retirada.
**Comandos:** `npx vitest run src/components/layout/BottomNav.test.jsx src/styles/index.css.test.js`
**Manual M-5 (375×812, normal):** con *safe area* simulada (dispositivo con notch) registrar
`padding-bottom` ≈ **34px** — **pendiente**: el navegador por CDP no permite simular el inset; sin
*safe area*, el computado es **`0px`** (sin `viewport-fit=cover`, `env()` resuelve 0 y el respaldo
`1rem` **no** se aplica; §4.4, CL-15, DP-27). Registrar también que los cuatro controles ocupan
cuatro columnas iguales (`93.75px` cada una a 375px).
**Hecho cuando:** la barra usa `safe-bottom` y `grid-cols-4`, la suite y el aserto nuevo pasan y M-5
está registrada.

**Resultado (2026-10-18):** la barra usa `safe-bottom` y `grid-cols-4`; a 375px las cuatro columnas
miden **`93.75px`** y el `padding-bottom` computado es **`0px`** (sin `viewport-fit=cover`). La
mitad de **área segura con inset simulado** queda **pendiente, no verde** (M-5), porque el navegador
usado no expone `setSafeAreaInsets`.

---

## T7 — Tokens y literales del CSS global ✅

**Etapa 7 · Depende de:** T3.
**Alcance:** migrar los tres literales con token equivalente y resolver los tokens sin consumidor
(R8).
**Archivos y líneas:** `src/styles/index.css` (`:16`, `:17`, `:28`, `:33`, `:83`, `:85`, `:92`) y
`src/styles/index.css.test.js`.

**Cambios**

1. `:83` → `border: 1px solid color-mix(in srgb, var(--color-border-line) 80%, transparent);`
2. `:85` → `box-shadow: 0 4px 20px -2px color-mix(in srgb, var(--color-bg-dark) 4%, transparent);`
3. `:92` → `box-shadow: 0 16px 32px -4px color-mix(in srgb, var(--color-emerald-primary) 12%, transparent);`
4. Retirar `--color-bg-dark-mid` (`:16`), `--color-bg-dark-end` (`:17`) y `--header-height` (`:33`).
5. Sobre `--color-cat-savings` (`:28`): añadir el comentario
   `/* Reserva documentada de la paleta de categorías: sin consumidor hoy; no retirar. */`
6. **No** se tocan `:99` (`rgba(…,0.88)`), `:106` (`rgba(…,0.92)`) ni `#ffffff` de `:82`.

**Asertos nuevos (`describe("013 — tokens, literales y tarjeta sólida")`)**

- los tres literales migrados ya no aparecen;
- `--color-bg-dark-mid`, `--color-bg-dark-end` y `--header-height` no aparecen;
- `--color-cat-savings` aparece con su comentario de reserva;
- la regla `.glass-card` declara `#ffffff` y **no** contiene `backdrop-filter`.

**Cubre:** RF-08, RF-11, RF-12 · AC-09, AC-12, AC-13 · DP-05, DP-06, DP-08 · P3.
**Prueba (roja-antes/verde-después):** los asertos de literales/tokens fallan antes y pasan después;
el de `.glass-card` pasa ya y protege la decisión de RF-08.
**Comandos:** `npx vitest run src/styles/index.css.test.js`
**Manual:** no aplica (verificación de fuente). Se revisa el diff para confirmar que no hay
hexadecimales nuevos ni cambios de color computado.
**Hecho cuando:** los tres literales usan token, los tres tokens están fuera, `--color-cat-savings`
sigue documentado, la suite del CSS global pasa (antiguos + nuevos) y el diff no tiene hex nuevos.

---

## T8 — Contraste de la franja y de la barra inferior ✅

**Etapa 8 · Depende de:** T6.
**Alcance:** llevar a AA la etiqueta de métricas y las etiquetas/indicador de la barra con tokens
existentes, conservando la información no cromática del activo.
**Archivos y líneas**

| Archivo | Cambio |
|---|---|
| `src/components/domain/landing/StatsBar.jsx:38` | `text-white/80` → `text-white` |
| `src/components/layout/BottomNav.jsx:52-53` | activo `text-mint-accent`; inactivo `text-bg-cream hover:text-mint-accent` |
| `src/components/layout/BottomNav.jsx:63` | indicador `bg-emerald-primary` → `bg-mint-accent` |
| `src/components/layout/BottomNav.jsx:76` | Menú: `text-bg-cream hover:text-mint-accent` |
| `src/components/layout/BottomNav.test.jsx:47, :52, :56, :62` | expectativas: `text-mint-accent`, selector con `bg-mint-accent`, `text-bg-cream` (+ título) |

**No se toca:** `aria-current="page"` (`:55`), el `span` indicador (`aria-hidden`), el número de
controles ni el fondo de la franja.

**Cubre:** RF-13, RF-14 · AC-14, AC-15 · CL-08 · DP-10, DP-24 · P4.
**Prueba (roja-antes/verde-después):** las tres expectativas de color quedan rojas al cambiar el
componente y verdes al actualizarlas; el resto de casos de la barra sigue verde (mismo recuento).
**Comandos:** `npx vitest run src/components/layout/BottomNav.test.jsx`
**Manual M-6 y M-7 (1440×900 y 375×812, normal):**
- M-6: `color` de la etiqueta de `StatsBar` = `rgb(255, 255, 255)`, fondo `rgb(26, 122, 94)`,
  ratio **5,26:1**.
- M-7: `color` de etiquetas = `rgb(247, 246, 242)` (inactiva) y `rgb(110, 231, 192)` (activa);
  indicador `rgb(110, 231, 192)`. Calcular contra **F1–F4** con
  `efectivo = 0,80 × rgb(15,17,23) + 0,20 × fondo` y registrar el **peor** de los cuatro:
  esperado **9,46:1** etiqueta clara, **6,75:1** mint e indicador.
**Hecho cuando:** AA calculado en los cuatro fondos para etiquetas e indicador, estado activo con
indicador + `aria-current`, suite de la barra verde y M-6/M-7 registradas.

---

## T9 — Validación manual integral (§9-P) ✅

**Etapa 9 · Depende de:** T2–T8.
**Alcance:** ejecutar y registrar **todas** las mediciones no automatizadas.
**Archivos:** ninguno (registro en el informe de la tarea).

**Ejecución:** M-1, M-2, M-3a, M-3b, M-4, M-5, M-6, M-7, M-8 y M-9 (opcional) del plan §6.2, con
navegador y versión declarados, los cinco tamaños, el estado de la preferencia verificado y una fila
por celda (tamaño, preferencia, esperado, obtenido, veredicto).

**Cubre:** RF-16 · AC-02, AC-04, AC-05, AC-07, AC-08, AC-10, AC-14, AC-15 · CL-04.
**Prueba:** no automatizable; el «veredicto» es la fila registrada. Lo no ejecutado se declara
**pendiente**, nunca verde.
**Manual:** es la tarea completa.
**Hecho cuando:** existe la tabla de M-1…M-9 con veredicto por celda, y cada validación no realizada
aparece como **pendiente** con su motivo.

**Resultado (2026-10-18):** tabla completa **M-1…M-9** registrada en `spec.md` §9.1.1 (navegador
Brave 155.1.97.59 / `HeadlessChrome 155.0.8059.85`, anchos reales 1440/1024/640/639/375,
preferencias verificadas con `matchMedia`). Verdes: M-1 (**pasa con nota**), M-2, M-3a, M-3b, M-4,
M-6, M-7 y M-8 (≤2 superficies y ≤1 blob); de M-5 pasa la grilla de cuatro columnas. Pendientes, no
verdes: **M-5 con *safe area*** (sin `viewport-fit=cover`, `padding-bottom` computado `0px`) y
**M-9** (sin motor sin `backdrop-filter`).

---

## T10 — Cierre técnico y declaración de validaciones ✅

**Etapa 10 · Depende de:** T9.
**Alcance:** comparar con la línea base y declarar el resultado real.
**Archivos:** ninguno.

**Pasos**

1. `npm test` → comparar **archivo por archivo** con T1; registrar el total nuevo (base 455 + los
   casos añadidos) y confirmar 0 fallos.
2. `npm run build` → verde.
3. Revisar el diff completo: sin dependencias, sin cambios de datos/rutas/contratos, sin hex nuevos,
   sin superficies ni blobs nuevos, `index.css.test.js` **solo ampliado**, suites de 011/012 con
   **solo** la línea de estilo corregida.
4. Declarar la lista de validaciones **no realizadas** y las **no automatizables** (§9 de la spec).

**Cubre:** RF-15, RF-16, RF-17 · AC-16 · DP-13, DP-19.
**Prueba:** suite completa y build verdes frente a la línea base re-medida en T1.
**Comandos:** `npm test`, `npm run build`.
**Hecho cuando:** están registrados los recuentos por archivo, build verde, diff revisado y la lista
de validaciones no realizadas declarada explícitamente.

**Resultado (2026-10-18):** `npm test` **478/478 en 31 archivos** (0 fallos; +23 casos y +1 archivo
frente a la línea base de 455/30) · `npm run build` **verde** (CSS 58,74 kB · JS 384,24 kB).
**No realizadas, declaradas pendientes:** M-5 con *safe area* (el navegador usado no expone
`setSafeAreaInsets`) y M-9 (sin motor sin `backdrop-filter`), en `spec.md` §9.1. **Limitaciones
registradas:** P1 afecta a las **seis** superficies (hero + cinco `.glass-surface`) y el área segura no
tiene efecto observable sin `viewport-fit=cover` (`spec.md` §4.1, §4.4, CL-15 y DP-27).
**Mantenimiento documental (aprobado por el usuario):** el commit de implementación actualizó
`.agents/skills/fluid-glass/SKILL.md` para retirar los tokens `bg-dark-mid`/`bg-dark-end` y describir
el gradiente del hero sin ellos; es mantenimiento documental, no cambio de código ni de alcance.
