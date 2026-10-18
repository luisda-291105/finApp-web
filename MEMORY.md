# MEMORY.md — FinApp

Registro mínimo de trabajo. Contiene **solo** las tareas faltantes, las preguntas por resolver y la
**referencia** a las specs. El contenido de cada spec vive en `specs/` (`spec.md`, `plan.md`,
`tasks.md`) y el historial en git. No duplicar aquí lo que ya está en la spec, en `AGENTS.md` o en
`.agents/rules/rules.md`.

Nota operativa: el usuario edita archivos a mano; **re-verificar las referencias `archivo:línea`
antes de tocar código** y no revertir sus ediciones.

## Referencias a specs

- `specs/001-fluid-glass-cumplimiento/` — contrato de `src/styles/index.css` (fallback `@supports`, transparencia y movimiento reducidos, `hover: hover`, blur 12–16px en ≤640px, escalonado `--i`, puerta `.js`, `:focus-visible`). Cerrada.
- `specs/002-bloque-tarjetas/` — bloque de tarjetas de demostración. Cerrada.
- `specs/003-mi-tarjeta-virtual/` — Mi Tarjeta Virtual. Cerrada.
- `specs/004-tarjetas-acordeon-y-movimientos/` — tarjetas, acordeón y movimientos. Cerrada.
- `specs/005-arquitectura-capa-pages/` — capa `src/pages/`; excepción documentada de `PanelTarjetas`. Cerrada.
- `specs/006-capa-layout-componentes-reutilizables/` — capa layout y reutilizables (RF-03: prop `como` de `Card`). Cerrada.
- `specs/007-navegacion-responsive-dashboard/` — header, sidebar responsive y tarjeta cuenta; declaró el área segura «resuelto». Cerrada.
- `specs/008-correccion-sidebar/` — corrección del sidebar. Cerrada.
- `specs/009-eliminar-vista-tablet/` — dos versiones de vista (corte 768px). Cerrada.
- `specs/010-cierre-de-modales/` — cierre de las cuatro superficies modales. Finalizada (commit `c341f17`).
- `specs/011-foco-de-superficies-y-cruce/` — devolución de foco de las cuatro superficies y traslado al cruzar 768px. Cerrada (commit `944542c`).
- `specs/012-correcciones-menores/` — medición de `useBreakpoint`, clase muerta de `AuthModal`, fecha inválida en `LogMovimientos`. Cerrada (commit `8aa9f0f`).
- `specs/013-calidad-css/spec.md` — **borrador** de calidad CSS / Fluid Glass. Sin plan ni tareas.
- `specs/013/spec-calidad.md` — stub original del usuario (5 puntos); destino por decidir.
- `specs/014/spec-ambiguedades.md` — sin planificar (botón «?» de `PaginaInicio`, «Usuario» del Header del dashboard, hex de JSX → tokens).

## Tareas faltantes

- **Spec 013 (calidad CSS):** cerrar sus preguntas → `plan.md` + `tasks.md` → implementar. Alcance fijado: absorbe los defectos P1–P8 y los 5 puntos del stub; **re-adoptar `.reveal*`** en las 5 secciones de landing (sin borrar CSS, sin enmendar la 001 y sin tocar `index.html`). Los hex de JSX quedan fuera (spec 014).
  - **Antes de tocar código, re-medir la línea base.** Última medida: `npm test` **455/455 en 30 archivos** y `npm run build` verde (2026-10-17).
  - Defectos a corregir (evidencia `archivo:línea` en `specs/013-calidad-css/spec.md` §4): **P1** el build pierde el `backdrop-filter` sin prefijo de `.glass-hero` · **P2** `.safe-bottom` sin consumidores y `pb-safe` que no genera CSS · **P3** deriva de tokens dentro de `index.css` · **P4** contraste AA (3,98 / 3,16 / 3,58 / 4,47:1) · **P5** blur < 20px y radios internos de 16px · **P6** capas/blobs (sin prueba automatizada) · **P7** clase inválida `my-`, import `Settings` sin uso y JSDoc «4 enlaces» en `SidebarNavContenido.jsx` · **P8** `grid-cols-5` con 4 controles en `BottomNav`.
- **Spec 014:** redactar spec y planificar (botón «?» de `PaginaInicio`, «Usuario» del Header en modo dashboard, migración de hex de JSX a tokens: 72 clases en 10 archivos).
- **Deuda CL-19 (spec 011):** la marca `location.state.focoEnDestino` no se limpia al consumirse; al volver «atrás» a una entrada marcada el foco se recoloca sin cierre. Requiere spec futura.
- **Deuda DP-07 (spec 010):** animación de salida de los modales, pendiente.
- **Backend real:** conectar autenticación y datos financieros (hoy demo: `TRIAL_ACTIVO = true`, sin persistencia). Definir contratos, manejo de errores y seguridad antes.
- **Sin commitear (ajenos):** `analicis-completo-cambios.md`, `specs/013/spec-calidad.md`, `specs/014/spec-ambiguedades.md`.

## Preguntas por resolver

- **Spec 013 — bloquean el plan:**
  1. Punto 2 (avisos `initial`/`whileHover`/`whileTap`, que nacen en los stubs de prueba, no en los componentes): (a) corregir los stubs sin tocar componentes —recomendado—; (b) solo las suites que no tocan 011/012; (c) fuera. Recuento a confirmar: 5 suites (reviewer) vs 7 (planner).
  2. Punto 3 (`GridTarjetas`): (a) conservar el `role="listitem"` y documentar el descarte —recomendado—; (b) retirarlo.
  3. Punto 5 (`Card`): (a) añadir solo el `@param` que falta —recomendado—; (b) renombrar (rompe RF-03 de la 006); (c) fuera.
  4. P1 (artefacto de build): (a) incluir el CSS construido (`dist`) como validación de la spec —recomendado—; (b) separarlo en otra spec.
  5. Stub `specs/013/spec-calidad.md`: (a) dejarlo tal cual —recomendado—; (b) anotar «superado»; (c) eliminarlo.
- **Spec 014 — sin spec redactada:** intención del botón «?» de `PaginaInicio`, propósito del «Usuario» del Header en modo dashboard, y si se migran los hex de JSX a tokens.
