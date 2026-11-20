# MEMORY.md — FinApp

Registro mínimo de trabajo. Contiene **solo** las tareas faltantes, las preguntas por resolver y la
**referencia** a las specs. El contenido de cada spec vive en `specs/` (`spec.md`, `plan.md`,
`tasks.md`) y el historial en git. No duplicar aquí lo que ya está en la spec, en `AGENTS.md` o en
`.agents/rules/rules.md`.

Nota operativa: el usuario edita archivos a mano; **re-verificar las referencias `archivo:línea`
antes de tocar código** y no revertir sus ediciones.

## Referencias a specs

- **Tarea suelta (opción 2: reclasificación real de transferencias propias):** se sustituye la
  corrección solo del resumen por un cambio de datos. El backend ya no resta
  `montoTransferenciasCuentaPropia` en `SMovimientoContable.resumenGlobal` ni usa
  `listarTransferenciasCuentaPorMes`; el `tipo` persistido es la única fuente de verdad. Nueva
  migración idempotente `finApp-backend/sql/076_reclasificar_transferencias_cuenta_propia.sql`
  convierte los GASTO de Gmail confirmados hacia `*25310487123` en `TRANSFERENCIA` global
  (`id_bolsillo = NULL`, conservando `id_usuario` y categoría `Transferencia`). Para que no vuelvan
  a entrar mal: `crearGmailPorRevisar` y `crearAutomaticamenteDesdeGmail` consultan el fragmento del
  correo por `origenId` (`findFragmentoPorOrigenId`) y aplican el mismo regex/config de cuentas
  propias; `confirmarGmailGlobal` ya acepta `TRANSFERENCIA`; `resolverOrigen` permite origen Gmail
  para transferencias globales. Los pagos a terceros siguen siendo GASTO. Efecto esperado: resumen
  `$2.382.337` de gastos / `$1.000.000` de transferencias / balance `$603.652` sin compensación, y
  `DetalleBolsilloModal` de Gastos baja de `$2.464.212` a `$1.464.212` porque la fila ya no
  pertenece al bolsillo (no hizo falta tocar el componente). Validación: suite backend completa en
  verde (368/368 en el árbol con cambios concurrentes) con 5 pruebas nuevas en
  `SMovimientoContableTest`. Nota: se corrigó de paso un cambio
  ajeno y sin commitear que bloqueaba la compilación (`countByCuenta_IdFuenteAndEstado` devolvía
  `String` en `IGmailEntradaPendiente` y `SGmailEntradas`); solo se ajustó ese tipo a `long`, con
  autorización del usuario. Suites web focales 65/65; suite web completa 794/814 con solo los 16
  fallos preexistentes de `PaginaDashboardInicio`; `npm run build` correcto. También se arreglaron
  dos aserciones del test concurrente `BolsilloCard.test.jsx` (typo «emergencies» y espacio no
  separable en el nombre accesible), previa autorización. La migración `076` **no se ha ejecutado**
  contra MySQL; queda pendiente de aplicación manual.
