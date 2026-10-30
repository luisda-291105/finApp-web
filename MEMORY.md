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
- `specs/014-asistente-de-ayuda/spec.md` — aprobada (2026-10-19); plan y tareas escritos (10 tareas): botón «?» de `PaginaInicio`, «Usuario» del Header del dashboard, hex de JSX → tokens.
- `specs/016/` — aprobada y cerrada (2026-10-20); T1–T6 completas. Regresión final: 554/554 pruebas en 39 archivos, build correcto y revisión visual responsive; T6 corrigió contraste/nombres accesibles de la navegación lateral.
- `specs/017-asistente-en-dashboard/` — implementada; 536 pruebas y build correctos; revisión visual realizada, área segura real pendiente.
- `specs/021-bolsillos-grupales/` — bolsillos grupales (`/dashboard/bolsillos`), fuentes compartidas, métricas colectivas, simulación de compartir entrada/invitación y reasignación de icono de Contactos (`Contact`) y Bolsillos (`Users`). Cerrada (2026-10-21).
- `specs/024-perfil-modal/` — modal de perfil (spec aprobada 2026-10-27). Reutiliza `ModalCrearUsuario` como perfil, activa el bloque «Perfil» en Configuración y muestra nombre dinámico/correo no registrado en `DashboardUserModal`. Implementada; validación pendiente de suites ajenas.
- `specs/026-mostar-ya-registrados/` — registros existentes por usuario; tarjetas y contactos en tarjetas visuales, correos Gmail en filas y fuentes renombradas en Configuración. Transacciones fuera de alcance por falta de endpoint/modelo.
- `specs/027-fuente-grupo/` — asociación persistente grupo-fuente, modal de detalle, chat/invitaciones de demostración, pestaña de solicitudes y edición/eliminación de fuentes registradas.
- `specs/028-corregir-tests-fallidos/` — corrige las expectativas obsoletas y los mocks incompletos encontrados en la suite completa del 2026-10-29.
- `specs/029-mostrar/` — implementada: modal común para grupo, correo, tarjeta y perfil; validación Luhn/vencimiento/CVV, edición/eliminación de grupos por usuario, consulta Gmail por una sola fuente, PUT de perfil con campos autorizados y fuentes apiladas en móvil. Movimientos muestran estado vacío; validación visual de navegador pendiente.

## Tareas faltantes

- **Spec 026:** implementación lista y build correcto; `npm run test` reporta 9 archivos fallidos, 13 tests fallidos y una suite que no carga. La corrección queda en spec 028. Revisión visual en navegador pendiente.
- **Spec 028:** corregidos mocks y expectativas, y restaurado el contrato AC-22 de `AuthModal` (los campos persisten al cerrar). Validado con 81/81 tests focalizados, 583/583 en 43 archivos y build correcto.
- **Spec 027:** completada. Relación grupo-fuente persistente con validación de usuario; Configuración permite editar/eliminar fuentes; el modal de grupo muestra fuentes y chat/invitaciones de demostración, y Solicitudes usa ejemplos claramente rotulados. Validado: 589/589 frontend, build y 7/7 pruebas Maven. Revisión visual pendiente porque Computer Use no pudo determinar la URL de la ventana.
- **Spec 029:** implementada. Validación: suite frontend 595/595 en 43 archivos, build correcto y backend 10/10. `git diff --check` limpio. Revisión visual realizada a 320 px: tarjetas, Configuración y modal de perfil se adaptan al viewport.

- **Spec 024:** implementada (2026-10-27). `ModalCrearUsuario` pasa a ser modal de perfil (lectura + «Modificar» limitado a cédula, nombre y contraseña; correo/teléfono «No registrado»), `PaginaDashboardConfiguracion` muestra «Perfil» con botón «Ver perfil», y `DashboardUserModal` usa nombre dinámico con respaldo «Cuenta de Usuario Demo» y correo «No registrado». Se añadió default seguro a `useUsuarioActivo` (usuario null y funciones no-op sin provider). Validado: ModalPerfil, DashboardUserModal, Configuración y AsistenteDashboard en verde; build correcto. `npm test` sigue con 36 fallos ajenos (AuthModal sin Router, placeholders de App y textos de Bolsillos/Correos/Contactos/Sidebar) ya presentes antes del cambio; `cierreDeModales` mantiene sus 8 fallos previos de AuthModal.

- **Spec 021:** cerrada (2026-10-21); T1–T6 completadas. Se creó la vista `/dashboard/bolsillos` con tarjetas de equipo, fuentes compartidas, balance total y botón con feedback de copiado. Se reasignó el icono de Contactos a `Contact` (sidebar y bottom nav responsivo) y se asignó `Users` a Bolsillos. Validación con 561/561 pruebas pasando en 40 suites y build exitoso sin errores.
- **Spec 014:** aprobada (2026-10-19); plan y tareas escritos (10 tareas): botón «?» de `PaginaInicio`, «Usuario» del Header en modo dashboard, migración de hex de JSX a tokens: 72 clases en 10 archivos. T1–T10 hechas (2026-10-19); resultado **518/518 en 33 archivos**; cerrada (2026-10-19) con el commit de cierre `7018cfa`.
- **Spec 020:** cerrada (2026-10-21); T1–T4 completadas. Homogeneización del botón disparador del asistente en el Dashboard con la landing (`cursor-pointer`, `hover:scale-105`, `transition-all`, `hover:bg-emerald-hover`). Validación con 556/556 pruebas pasando y build exitoso.
- **Spec 018:** cerrada (2026-10-21); T1–T7 completadas. Ocultamiento de la barra de scroll (`.sidebar-scroll`), cierre automático en sidebar móvil vía `alCerrarSidebar`, adaptación dinámica en `BottomNav` mostrando el 4.º ítem del sidebar (Contactos) de 470px a 750px (grid-cols-5). Validación con 556/556 pruebas pasando y build exitoso.
- **Spec 019:** cerrada (2026-10-20); T1–T9 completadas. Se centralizaron las 39 suites bajo
  `src/test/` y se actualizaron las guías; validación final: 554/554 pruebas y build correctos.
- **Spec 016:** cerrada (2026-10-20), T1–T6 hechas. Los cinco destinos viven en `SidebarNavContenido`; `BottomNav` de producción permanece sin cambios. T3/T4 integran ModalFuentes con estado temporal y patrones existentes de cierre/foco. T5 separa enlaces desplazables y avatar desktop, manteniendo avatar tras enlaces en Drawer. T6: 110/110 focalizadas, 554/554 en 39 archivos, build correcto y revisión visual desktop (768/1280 px expandida/colapsada), móvil y modal. Ajustó contraste AA y nombres accesibles de enlaces colapsados. Seguimiento visual ronda 1/2: se añadió highlight superior inset a ModalFuentes; focal 4/4, suite 554/554, build y `git diff --check` correctos; revisión en navegador a 1280 px y 390 px.
- **Spec futura (P1):** compatibilidad de prefijos CSS en el build — se pierde el `backdrop-filter` sin prefijo en las **seis** superficies (hero + cinco `glass-surface`) y en `preview` computa `none`. Requiere reconstruir y medir el CSS resultante (013 §4.1).
- **Deuda 013 — área segura:** `.safe-bottom` está aplicada, pero sin `viewport-fit=cover` el inset resuelve 0 y no hay efecto visible; una spec futura debe decidir el modo a sangre completa (013 CL-15/DP-27).
- **Deuda CL-19 (spec 011):** la marca `location.state.focoEnDestino` no se limpia al consumirse; al volver «atrás» a una entrada marcada el foco se recoloca sin cierre. Requiere spec futura.
- **Deuda DP-07 (spec 010):** animación de salida de los modales, pendiente.
- **Backend real:** conectar autenticación y datos financieros (hoy demo: `TRIAL_ACTIVO = true`, sin persistencia). Definir contratos, manejo de errores y seguridad antes.
- **Sin commitear (ajenos):** `analicis-completo-cambios.md`, `specs/016/`.

## Preguntas por resolver

- **Spec 014 — aprobada (2026-10-19):** intención del botón «?» de `PaginaInicio`, propósito del «Usuario» del Header en modo dashboard, y si se migran los hex de JSX a tokens.
