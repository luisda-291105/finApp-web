# Tareas — Spec 004: Grid fluido de tarjetas con modal, flip y movimientos

Spec: `specs/004-tarjetas-acordeon-y-movimientos/spec.md` (aprobada).
Plan: `plan.md` de esta misma carpeta. Validación común por tarea:
tests focalizados (`npx vitest run <ruta>`), `npm test` y `npm run build`.

---

## Tarea 1 — Aprobar spec y datos demo

**Objetivo.** Marcar la spec como aprobada y crear la fuente de datos
estáticos de demostración (5 tarjetas + movimientos fijos de octubre 2026).

**Archivos.**
- `specs/004-tarjetas-acordeon-y-movimientos/spec.md` (solo línea de estado:
  `Estado: borrador` → `Estado: aprobada`).
- `src/data/tarjetasDemo.js` (nuevo; header de `.agents/file-header-template.md`).

**RF cubiertos:** RF1, RF8, RF9 (datos), RF12.

**Contenido clave.** `TARJETAS_DEMO` (5 tarjetas: azul/MARÍA GARCÍA,
menta/ANA MARTÍNEZ, morado/CARLOS RUIZ + 2 nuevas ficticias con `colorTema`
existente), `MOVIMIENTOS_DEMO` con fechas fijas "2026-10-DD", mezcla de
signos, al menos una tarjeta sin movimientos en el periodo y una con entradas
desordenadas en la fuente. Exportar `PERIODO_DEMO = { anio: 2026, mes: 10 }`.

**Hecho cuando:**
- `spec.md` muestra `Estado: aprobada`.
- `tarjetasDemo.js` exporta 5 tarjetas con todos los campos
  (`id, titular, numero, expiracion, cvv, entidad, colorTema`) y un mapa de
  movimientos por `id`; todas las fechas pertenecen a octubre 2026; hay al
  menos una tarjeta sin movimientos; ningún hexadecimal nuevo.
- `npm test` y `npm run build` en verde (sin tests nuevos aún).

---

## Tarea 2 — LogMovimientos y formato de fecha ✅

**Objetivo.** Componente de log con formato "12 oct 2026", signos por tokens
y estado vacío.

**Archivos.**
- `src/components/LogMovimientos.jsx` (nuevo).
- `src/components/LogMovimientos.test.jsx` (nuevo).

**RF cubiertos:** RF8, RF9, RF10, RF14 (parcial).

**Hecho cuando:**
- Las pruebas verifican: solo entradas del periodo pasado por props, orden
  descendente (incluso con fuente desordenada), formato exacto "12 oct 2026",
  presencia de descripción/categoría/monto con signo, clases con tokens
  (`cat-income`/`cat-expense`, `tabular-nums`) y mensaje "Sin movimientos este
  mes" en estado vacío. Las pruebas fallan antes de implementar (TDD).
- `npx vitest run src/components/LogMovimientos.test.jsx`, `npm test` y
  `npm run build` en verde.

---

## Tarea 3 — Prop `flipDeshabilitado` en MiTarjetaVirtual ✅

**Objetivo.** Modo solo-vista: sin flip, sin interactivos internos, sin pill.

**Archivos.**
- `src/components/MiTarjetaVirtual.jsx` (modificado).
- `src/components/MiTarjetaVirtual.test.jsx` (ampliado).

**RF cubiertos:** RF4, RF14 (parcial).

**Hecho cuando:**
- Con `flipDeshabilitado`: clic y Enter/Espacio **no** giran la tarjeta; la
  cara ya no expone `role="button"`, `tabIndex` ni `aria-pressed`; la pill
  "Toca para ver CVV" no se renderiza.
- Sin la prop: comportamiento y las 15+ pruebas existentes de spec 003 pasan
  sin cambios.
- Pruebas nuevas fallan antes de implementar. `npx vitest run
  src/components/MiTarjetaVirtual.test.jsx`, `npm test` y `npm run build`
  en verde.

---

## Tarea 4 — AcordeonTarjetas (móvil)

**Objetivo.** Acordeón vertical exclusivo, visible solo `<640px`, con gesto de
doble toque y semántica ARIA.

**Archivos.**
- `src/components/AcordeonTarjetas.jsx` (nuevo).
- `src/components/AcordeonTarjetas.test.jsx` (nuevo).

**RF cubiertos:** RF2, RF4 (uso), RF5, RF11 (parcial), RF13, RF14 (parcial).

**Hecho cuando:**
- Contenedor con clase `sm:hidden`; primera tarjeta expandida por defecto;
  cada encabezado es `button` con `aria-expanded` y `aria-controls` ↔ panel
  con `id`; paneles colapsados no montan contenido interactivo.
- user-event: clic en encabezado colapsado expande y colapsa la anterior
  (exclusivo); clic sobre la tarjeta ya expandida dispara `onAbrirTarjeta`
  con la tarjeta correcta; `MiTarjetaVirtual` interno usa
  `flipDeshabilitado`.
- Test con `useReducedMotion` mockeado a `true`: expansión sin animación.
- Focalizadas, `npm test` y `npm run build` en verde.

---

## Tarea 5 — GridTarjetas (tablet/desktop)

**Objetivo.** Grid responsivo de 3/5 columnas, un solo gesto abre el modal.

**Archivos.**
- `src/components/GridTarjetas.jsx` (nuevo).
- `src/components/GridTarjetas.test.jsx` (nuevo).

**RF cubiertos:** RF3, RF4 (uso), RF6 (apertura), RF14 (parcial).

**Hecho cuando:**
- Contenedor con clases `hidden sm:grid sm:grid-cols-3 lg:grid-cols-5`
  (verificadas como atributo); 5 celdas con frente completo visible y
  `MiTarjetaVirtual` en `flipDeshabilitado`.
- Cada celda es activable con un clic, Enter o Espacio (wrapper
  `role="button"` con `aria-label` identificativo) y llama a
  `onAbrirTarjeta(tarjeta)` exactamente una vez por gesto.
- Focalizadas, `npm test` y `npm run build` en verde.

---

## Tarea 6 — ModalTarjeta accesible

**Objetivo.** Modal con `role="dialog"`, focus trap, Esc, backdrop, tarjeta
con flip y log integrado. (Puede desarrollarse en paralelo a tareas 4–5, pero
se cierra después de ellas.)

**Archivos.**
- `src/components/ModalTarjeta.jsx` (nuevo; integra `MiTarjetaVirtual` con
  flip y `LogMovimientos`).
- `src/components/ModalTarjeta.test.jsx` (nuevo).

**RF cubiertos:** RF6, RF7, RF8, RF9, RF10, RF11 (parcial), RF14 (parcial).

**Hecho cuando:**
- Renderiza `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al título
  (titular); foco inicial dentro del modal; `Tab` cicla sin salir; `Esc`
  cierra; botón "Cerrar detalle de tarjeta" cierra; clic en backdrop cierra y
  clic en el contenido no cierra.
- La tarjeta dentro del modal conserva flip 3D funcional (sin
  `flipDeshabilitado`); el log lista los movimientos de la tarjeta y muestra
  el estado vacío cuando corresponde.
- Test con reduced-motion: entrada/salida sin animación.
- Focalizadas, `npm test` y `npm run build` en verde.

---

## Tarea 7 — Refactor de PanelTarjetas e integración de ruta

**Objetivo.** Fusionar las tres secciones actuales en el conjunto fluido,
conectar acordeón/grid con el modal, mantener la nota demo y devolver el foco
al activador. Actualizar tests de ruta.

**Archivos.**
- `src/components/PanelTarjetas.jsx` (refactor total; usa
  `AcordeonTarjetas` + `GridTarjetas` + `ModalTarjeta`, estado
  `tarjetaActiva` y ref del activador para devolver el foco).
- `src/components/PanelTarjetas.test.jsx` (reescrito).
- `src/App.test.jsx` (ajustado: sin secciones antiguas, conjunto presente,
  nota visible; con `MemoryRouter`).

**RF cubiertos:** RF1, RF6, RF7 (retorno de foco), RF12, RF14 (integración).

**Hecho cuando:**
- No existen en el DOM los textos "Mi Tarjeta Virtual", "Ejemplos de diseño"
  ni "Tus otras tarjetas" como secciones; hay 5 tarjetas en cada
  presentación; "Datos de demostración" sigue visible.
- Integración: abrir modal desde grid y desde acordeón (segundo toque),
  cerrar con Esc/botón/backdrop y verificar que el foco vuelve al elemento
  activador.
- Solo un modal abierto a la vez.
- Focalizadas (`PanelTarjetas`, `App`), `npm test` y `npm run build` en
  verde. Verificación visual Fluid Glass en navegador si hay herramienta;
  registrar explícitamente si no se realiza.

---

## Tarea 8 — Cierre: MEMORY.md y revisión final

**Objetivo.** Documentar la spec 004 en la memoria del proyecto y cerrar
validaciones globales.

**Archivos.**
- `MEMORY.md` (nueva sección "Spec 004 — completada": componentes nuevos,
  prop `flipDeshabilitado`, decisión de doble render CSS por breakpoints,
  datos demo fijos oct 2026, conteo de tests, estado de validación visual).
- `specs/002-bloque-tarjetas/spec.md` y `specs/003-*/spec.md` (opcional, solo
  anotación "superada por spec 004" según lo previsto en la sección
  "Relación con specs anteriores" de spec 004).

**RF cubiertos:** RF14 (cierre), documentación.

**Hecho cuando:**
- `MEMORY.md` refleja el estado final con cifras reales de tests y build, y
  marca honestamente lo no verificado (p. ej. revisión visual).
- `npm test` y `npm run build` finales en verde.
- Staging/commit limitado a los archivos del cambio, mensaje corto en
  español.
