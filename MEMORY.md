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
- `specs/038-google-identity-services/` — migración de Gmail de popup a redirect (error COOP `window.closed`); `plan.md` y `tasks.md` escritos, pendiente de implementación.
- `specs/039-migrarTrasacciones-contabilidad/` — página demo de Contabilidad implementada en `/dashboard/contabilidad`, con resumen, movimientos y acceso en navegación; T1–T4 completas. Build y pruebas focales pasan; suite completa 529/588, revisión visual y análisis de línea base pendientes.
- `specs/014-asistente-de-ayuda/spec.md` — aprobada (2026-10-19); plan y tareas escritos (10 tareas): botón «?» de `PaginaInicio`, «Usuario» del Header del dashboard, hex de JSX → tokens.
- `specs/016/` — aprobada y cerrada (2026-10-20); T1–T6 completas. Regresión final: 554/554 pruebas en 39 archivos, build correcto y revisión visual responsive; T6 corrigió contraste/nombres accesibles de la navegación lateral.
- `specs/017-asistente-en-dashboard/` — implementada; 536 pruebas y build correctos; revisión visual realizada, área segura real pendiente.
- `specs/021-bolsillos-grupales/` — bolsillos grupales (`/dashboard/bolsillos`), fuentes compartidas, métricas colectivas, simulación de compartir entrada/invitación y reasignación de icono de Contactos (`Contact`) y Bolsillos (`Users`). Cerrada (2026-10-21).
- `specs/024-perfil-modal/` — modal de perfil (spec aprobada 2026-10-27). Reutiliza `ModalCrearUsuario` como perfil, activa el bloque «Perfil» en Configuración y muestra nombre dinámico/correo no registrado en `DashboardUserModal`. Implementada; validación pendiente de suites ajenas.
- `specs/026-mostar-ya-registrados/` — registros existentes por usuario; tarjetas y contactos en tarjetas visuales, correos Gmail en filas y fuentes renombradas en Configuración. Transacciones fuera de alcance por falta de endpoint/modelo.
- `specs/027-fuente-grupo/` — asociación persistente grupo-fuente, modal de detalle, chat/invitaciones de demostración, pestaña de solicitudes y edición/eliminación de fuentes registradas.
- `specs/028-corregir-tests-fallidos/` — corrige las expectativas obsoletas y los mocks incompletos encontrados en la suite completa del 2026-10-29.
- `specs/029-mostrar/` — implementada: modal común para grupo, correo, tarjeta y perfil; validación Luhn/vencimiento/CVV, edición/eliminación de grupos por usuario, consulta Gmail por una sola fuente, PUT de perfil con campos autorizados y fuentes apiladas en móvil. Movimientos muestran estado vacío; validación visual de navegador pendiente.
- `specs/030-arreglo-animaciones-tarjetas/` — aplicada elevación hover y compresión tap a tarjetas registradas con `prefers-reduced-motion`.
- `specs/031-integridad-tarjetas/` — corrige validación del alta a titular textual, número de 14–19 dígitos, vencimiento MM/AA compatible con `LocalDate` y CVV de 3 dígitos; retira el selector de tema visual y mantiene el flip en el detalle registrado sin exponer CVV.
- `specs/032-limpieza-codigo/` — implementada: retirados módulos sin uso y flujo demo antiguo de tarjetas; simplificados modal, API de `MiTarjetaVirtual` y comentarios, preservando el flip registrado. Build correcto; pruebas no ejecutadas.
- `specs/033-validacion-tarjetas/` — vencimiento `MM/AA` con cero y `/` automáticos; entrada numérica para número/CVV, CVV de 3 dígitos; `colorTema` retirado del contrato frontend/backend y script SQL manual para eliminar la columna persistente.
- `specs/034-temas-y-tarjetas/` — implementada: el vencimiento agrega el cero al perder foco; tarjetas con frente transparente y borde, sidebar con estilo por tema; Configuración ofrece modo claro/oscuro persistente. Build correcto; revisión en navegador y pruebas pendientes.
- `specs/035-agente-chat/` — implementada: chat del dashboard conectado a `finApp-backend`, documentación local, NVIDIA NIM y búsqueda pública Tavily opcional; claves solo en el entorno backend. El usuario obtendrá las claves; acceso trial de NVIDIA no garantiza uso estable ni licencia de producción. Build frontend/compilación backend pendientes de validación; pruebas no ejecutadas.

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

## Estado implementación (spec 037 — contenido de inicio)

- **T1 — Header de página y estado base:** `PaginaDashboardInicio.jsx` reescrito con header exclusivo (título "dashboard" + botón "crear muestra" a la derecha, clases de tokens sin hex nuevos), 3 cards fijas eliminadas, estado local `contenidosConfigurados` (`{}` vacío) y `modalAbierto` para que el botón funcione en T2/T3. Prueba nueva `src/test/pages/PaginaDashboardInicio.test.jsx` (4/4, `MemoryRouter`). `App.test.jsx` actualizado a las nuevas aserciones del spec (título "dashboard", sin las 3 cards). `npm run build` OK; `npm test` vuelve a la línea base de fallos preexistentes (0 fallos nuevos introducidos).
- **T2 — Marco del modal de configuración:** añadido el contenedor del modal inline en `PaginaDashboardInicio.jsx` siguiendo el patrón de `DashboardUserModal`: portal a `document.body` con overlay (`z-50`, clic fuera cierra), `BotonCerrar` ("X") superior como único control de cierre, `useCierreConEsc` (capa 60), `useDeslizarParaCerrar` (deslizar abajo solo móvil), `FocusTrap` con opciones spec 010 (`allowOutsideClick: true`, `escapeDeactivates: false`, `initialFocus` en el panel, `returnFocusOnDeactivate: false`), y `useRetornoDeFoco` con `triggerRef` al botón "crear muestra". Pruebas T2: 20/20 (4 T1 + 16 T2) con `MemoryRouter`. `npm run build` OK. Sin fallos nuevos introducidos (fallos preexistentes en `AsistenteAyuda.test.jsx` ajenos).
- **T3 — Formulario del modal («Crear muestra»):** retirado el modelo antiguo (`CONTENIDOS_CONFIGURABLES`, `FORMATOS`, `contenidosConfigurados`, `alCambiarFormato`, título «Configurar contenidos»). El modal queda con título «Crear muestra» (ids `modal-crear-muestra-panel` / `modal-crear-muestra-titulo`; `BotonCerrar` con aria-label «Cerrar creación de muestra»), input de título controlado, `<select>` de fuente con placeholder deshabilitado «Elegir fuente» + exactamente 5 opciones demo con destino de redirección asociado (`FUENTES_DEMO`: Bolsillos→`/dashboard/bolsillos`; Transacciones/Ingresos/Gastos→`/dashboard/transacciones`; Tarjetas→`/dashboard/tarjetas`; la redirección se usa en T8) y `<select>` de tipo con placeholder deshabilitado «Elegir tipo» + 4 tipos (`TIPOS_VISUALIZACION`; valores sin acentos: `tarjeta`, `grafica`, `metrica`, `mapa_calor` — etiquetas visibles con acento como el patrón antiguo). Botón «guardar muestra» presente sin ciclo (llega en T4); sin `<form>` ni submit para evitar recarga por Enter. Estado nuevo: `muestras` (inicialmente `[]`) y `borrador` (`{ titulo, fuente, tipo }` con `""` inicial, un solo objeto para que el reset de T4/T5 sea trivial). Zona de decisión menor: etiquetas de tipos capitalizadas («Tarjeta», «Gráfica», «Métrica», «Mapa de calor») siguiendo el patrón del `<select>` antiguo; las pruebas asertan los textos del DOM con ese formato. Marco T2 intacto con los nuevos textos accesibles. Suite focal 29/29 (4 T1 + 16 T2 con textos actualizados + 9 T3 nuevas; sustituidas las 6 pruebas obsoletas del describe antiguo, que eran 6 y no 7 según decía T3). `npm run build` OK. `npm test`: 53 fallos en 9 suites preexistentes y ajenos (`index.css.test.js`, `DashboardLayout`, `SidebarNavContenido`, `SidebarResponsive`, `AsistenteAyuda`, `cierreDeModales`, `AsistenteDashboard`, `MiTarjetaVirtual`, `PaginaInicio`); ninguna importa los archivos de T3 (verificado por grep), por lo que no hay regresión atribuible. La edición manual del usuario en `SidebarNavContenido.jsx` (teléfono en el avatar) sigue sin commitear y probablemente explica sus fallos de texto; no se tocó. Build correcto y commit `17d6d9c` (el diff de la página incluye el estado T1/T2 pendiente de estos archivos). Revisión visual en navegador: no realizada (sin navegador disponible en esta sesión).
- **T4 — Ciclo de guardado (añadir, validar, cerrar y descartar):** implementado el handler
  `alGuardarMuestra` del botón «guardar muestra» con helpers de módulo en el propio archivo:
  `BORRADOR_VACIO` (también `useState` inicial), `normalizarTitulo` (`trim()`),
  `esBorradorCompleto` (título con contenido tras `trim()` y fuente/tipo fuera del placeholder `""`)
  y `esMuestraDuplicada` (triple título normalizado + fuente + tipo con `some`, RF-10). Ciclo
  completo (RF-07): añade `{ titulo, fuente, tipo }` AL FINAL de `muestras` (orden de creación, sin
  reemplazar), cierra el modal y restablece el borrador a `BORRADOR_VACIO` (placeholders en la
  próxima apertura). RF-09 (incompleto) y RF-10 (duplicado): retorno temprano SIN cerrar ni resetear
  ni añadir, sin mensajes; el borrador se conserva para reintentar. RF-11: `alCerrarModal` (única vía
  de cierre, usada por X/Esc/clic fuera/deslizar) ahora resetea el borrador, de modo que el descarte
  ocurre al cerrar y la próxima apertura está vacía (decisión aprobada: el borrador NO se conserva).
  Sin persistencia ni endpoints (llega en T5). Suite focal 42/42: 29 previas intactas + 13 nuevas
  (3 guardado válido AC-8/AC-11 + 4 incompleto AC-16 + 1 duplicado/reintento AC-17 + 5 descarte
  AC-18). Cobertura de «añade al final / anteriores intactas» antes de T6 (sin render aún): se
  verifica por mecánica de duplicados (un guardado posterior del mismo triple rechaza ⇒ la muestra
  sigue en la lista). TDD: fase roja 9/13 (las 4 de incompleto pasaban trivialmente sin handler).
  `npm test`: mismos 53 fallos preexistentes en las 9 suites ajenas de la línea base (verificado por
  grep: ninguna importa `PaginaDashboardInicio`); `npm run build` OK. Revisión visual en navegador:
  no aplicable a esta tarea (solo lógica, sin cambios visuales).
- **T5 — Persistencia simulada en localStorage (RF-15, AC-27/28/29/30):** añadidos en
  `PaginaDashboardInicio.jsx` la constante `CLAVE_ALMACEN` (`finapp_muestras_dashboard`) y los
  helpers de módulo `leerMuestrasPersistidas` (JSON + validación `Array.isArray` + `try/catch`
  con `console.error`, patrón de `UsuarioActivoContext`; JSON inválido/no-array → `null` =
  lista vacía sin crash) y `persistirMuestras` (escritura de la lista COMPLETA tras cada
  guardado válido, no delta). `alGuardarMuestra` ahora añade al final, persiste la lista
  completa y cierra; el `useEffect` de montar restaura en el orden guardado. Fallback: solo
  el acceso a localStorage va dentro del try/catch — si el almacén falta o falla, la página
  funciona en memoria y al «recargar» no hay persistencia; sin endpoints (AC-30). Suite focal
  54/54: 42 previas + 12 nuevas (escritura completa/normalizada y acumulada AC-27; restauración
  por estado y orden vía duplicados + escritura posterior AC-28; JSON inválido/no-array;
  setItem/getItem lanzando y localStorage ausente ac-29, incluida la verificación de
  «al recargar no persiste»; RF-11 sin escribir al cerrar/duplicado; AC-30 sin fetch). TDD:
  fase roja 9/12 (3 guardes triviales de «no escribir» y AC-30 pasaban sin implementar).
  `npm test`: mismos 53 fallos en las 9 suites ajenas de la línea base; `npm run build` OK;
  `git diff --check` limpio. Nota de entorno: `vitest.setup.js` reemplaza `window.localStorage`
  por un mock global con métodos `vi.fn()` (`getItem` devuelve `undefined` y `setItem` no
  persiste), por lo que las pruebas siembran con `getItem.mockReturnValue(...)` y verifican la
  escritura con `vi.spyOn(window.localStorage, "setItem")` (patrón ya usado por
  `PaginaDashboardConfiguracion`/`ModalPerfil`); decisión: un intento de escritura fallida NO
  corrompe el guardado (se añade en memoria), y una lectura fallida sustituye el dato previo
  por lista vacía en la siguiente escritura. Revisión visual no aplicable (solo lógica).
  Commit `dc3776e`.
