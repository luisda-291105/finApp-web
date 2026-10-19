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
- `specs/013-calidad-css/spec.md` — visual/CSS (revelado, vidrio, radios, área segura, tokens y contraste). Cerrada (2026-10-18).
- `specs/015-higiene-y-dobles/spec.md` — higiene de código, dobles de prueba y documentación. Cerrada (2026-10-18).
- `specs/014/spec-ambiguedades.md` — sin planificar (botón «?» de `PaginaInicio`, «Usuario» del Header del dashboard, hex de JSX → tokens).

## Tareas faltantes

- **Spec 014:** redactar spec y planificar (botón «?» de `PaginaInicio`, «Usuario» del Header en modo dashboard, migración de hex de JSX a tokens: 72 clases en 10 archivos).
- **Spec futura (P1):** compatibilidad de prefijos CSS en el build — se pierde el `backdrop-filter` sin prefijo en las **seis** superficies (hero + cinco `glass-surface`) y en `preview` computa `none`. Requiere reconstruir y medir el CSS resultante (013 §4.1).
- **Deuda 013 — área segura:** `.safe-bottom` está aplicada, pero sin `viewport-fit=cover` el inset resuelve 0 y no hay efecto visible; una spec futura debe decidir el modo a sangre completa (013 CL-15/DP-27).
- **Deuda CL-19 (spec 011):** la marca `location.state.focoEnDestino` no se limpia al consumirse; al volver «atrás» a una entrada marcada el foco se recoloca sin cierre. Requiere spec futura.
- **Deuda DP-07 (spec 010):** animación de salida de los modales, pendiente.
- **Backend real:** conectar autenticación y datos financieros (hoy demo: `TRIAL_ACTIVO = true`, sin persistencia). Definir contratos, manejo de errores y seguridad antes.
- **Sin commitear (ajenos):** `analicis-completo-cambios.md`, `specs/014/spec-ambiguedades.md`.

## Preguntas por resolver

- **Spec 014 — sin spec redactada:** intención del botón «?» de `PaginaInicio`, propósito del «Usuario» del Header en modo dashboard, y si se migran los hex de JSX a tokens.
