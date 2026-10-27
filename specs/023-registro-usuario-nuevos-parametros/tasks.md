# Tasks — Spec 023: Ajuste registro de usuario con nuevos parámetros

Máximo 10 tareas, en orden. Sin cambios de código en esta fase de planificación.
El commit queda fuera de la lista: lo decide el usuario al revisar las validaciones.
Spec aprobada: `specs/023-registro-usuario-nuevos-parametros/spec.md`. Plan:
`specs/023-registro-usuario-nuevos-parametros/plan.md`.

## T1 — Fecha local y payload de registro en `AuthModal.jsx`

- **Descripción:** añadir al módulo `src/components/domain/modales/AuthModal.jsx` un helper
  local no exportado `crearFechaCreacionLocal(fecha = new Date())` que devuelva
  `YYYY-MM-DD` usando `getFullYear()`, `getMonth() + 1` y `getDate()` con relleno a dos dígitos
  (`padStart(2, "0")`), sin `toISOString()`, `toJSON()` ni `toLocaleDateString()`. En
  `manejarEnvio`, construir el cuerpo por ramas: login `{ correo, contrasena }` (intacto) y
  registro `{ nombre, contrasena, fechaCreacion: crearFechaCreacionLocal() }`, calculado dentro
  del envío.
- **RF cubiertos:** RF-01, RF-02, RF-05, RF-06
- **Dependencias:** Ninguna
- **Hecho cuando:**
  - La rama de registro envía exactamente `nombre`, `contrasena` y `fechaCreacion`; no aparecen
    `correo`, `contacto`, `propiedad` ni `idUsuario`, ni valores `null` o vacíos sustitutivos.
  - La fecha sale de los componentes locales de `Date` y nunca de una serialización UTC; no hay
    estado ni `useMemo` que fije la fecha al abrir o renderizar.
  - El manejo de `cargando`, `mensaje`, error de red, mensaje de éxito y `setTimeout(1200)`
    permanece igual.

## T2 — Correo solo en login y cabecera JSDoc

- **Descripción:** en `AuthModal.jsx`, condicionar el bloque del correo (label + `input`) a
  `modo === "login"`, conservando `type="email"` y `required` dentro de esa rama. Mantener el
  estado `correo` y `setCorreo` para login y para conservar lo escrito al cambiar de pestaña.
  Actualizar la cabecera JSDoc: `@estados` con los estados reales (`modo`, `nombre`, `correo`,
  `contrasena`, `cargando`, `mensaje`) y nota de que el correo solo existe en login y de que el
  registro envía la fecha calculada en el envío.
- **RF cubiertos:** RF-03, RF-04
- **Dependencias:** T1
- **Hecho cuando:**
  - En registro no existe en el DOM ni el label ni el `input` de correo; en login ambos existen
    con `type="email"` y `required`.
  - `correo` no se limpia al cambiar de pestaña y el payload de login sigue siendo
    `{ correo, contrasena }`.
  - No cambian textos, clases, orden de campos ni estructura del modal más allá de ocultar el
    bloque del correo; la firma de props no cambia y `PaginaInicio.jsx`/`PaginaLogin.jsx` no se
    tocan.

## T3 — Infraestructura de pruebas y casos de payload y fecha

- **Descripción:** en `src/test/components/domain/modales/AuthModal.test.jsx` añadir un
  `describe` propio con `vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))` en
  `beforeEach`, `vi.unstubAllGlobals()` y `vi.useRealTimers()` en `afterEach`, URL esperada vía
  `getEndpoint("auth.registro")`/`getEndpoint("auth.login")` y cuerpo leído de
  `fetch.mock.calls[0][1].body` con `JSON.parse`. Congelar el reloj con
  `vi.useFakeTimers({ toFake: ["Date"] })` + `vi.setSystemTime(...)`. Añadir los casos: payload
  exacto de registro, formato `YYYY-MM-DD` derivado de la fecha congelada, fecha del envío con
  apertura antes de medianoche y envío después, y envío sin fijar fecha al abrir/cerrar/cambiar
  de pestaña.
- **RF cubiertos:** RF-01, RF-02, RF-05, RF-06
- **Dependencias:** T1
- **Hecho cuando:**
  - Se verifica que las claves del cuerpo son exactamente `nombre`, `contrasena` y
    `fechaCreacion`, sin `correo`, `contacto`, `propiedad` ni `idUsuario`, sin `null` y sin
    cadenas vacías.
  - Se verifica que la fecha cumple `/^\d{4}-\d{2}-\d{2}$/` y coincide con el día local del
    reloj congelado; el caso de medianoche envía el día del envío y no el de la apertura.
  - Las pruebas no dependen de fake timers completos (solo `Date`), por lo que `userEvent` y el
    foco diferido de `focus-trap` siguen funcionando, y no hay temporizadores pendientes del
    camino de éxito.

## T4 — Casos de visibilidad del correo, login intacto y validación HTML

- **Descripción:** completar el `describe` de T3 con: correo ausente en registro y presente en
  login; payload de login exactamente `{ correo, contrasena }`; conservación del correo escrito
  al pasar a registro y volver a login; y bloqueo del envío por validación HTML cuando nombre o
  contraseña están vacíos (sin llamar a `fetch`), sin añadir mensajes nuevos.
- **RF cubiertos:** RF-03, RF-04
- **Dependencias:** T2, T3
- **Hecho cuando:**
  - En registro `queryByPlaceholderText("tu@correo.com")` es `null` y el envío se completa sin
    correo.
  - En login el campo existe con `type="email"` y `required`, y el cuerpo enviado no incluye
    `nombre` ni `fechaCreacion`.
  - Tras volver de registro a login el correo escrito sigue en el campo y viaja en el payload.
  - Con nombre o contraseña vacíos `fetch` no se llama (jsdom aplica la validación interactiva
    de `required` y no dispara `submit`).

## T5 — Ajustar la suite AC-22 y revisar el resto de la suite

- **Descripción:** reescribir los helpers `escribirCampos`/`comprobarCamposConservados` de
  `AC-22: cerrar NO borra lo escrito` (`:274-324`) para que en registro escriban y comprueben
  solo nombre y contraseña, y afirmen que el correo no existe; añadir un caso equivalente en
  login que conserve correo y contraseña. Revisar el resto del archivo y actualizar su cabecera
  JSDoc mínimamente para reflejar la cobertura nueva.
- **RF cubiertos:** RF-03, RF-04
- **Dependencias:** T2
- **Hecho cuando:**
  - Los dos casos AC-22 de registro (cierre con «X» y con Esc) pasan conservando nombre y
    contraseña y comprobando que el correo no está en el DOM; el aserto de ausencia de errores
    en consola se mantiene.
  - Existe un caso de login que conserva correo y contraseña al cerrar y reabrir.
  - Los casos de Esc con el foco en un campo (`:170-185`) y de arrastre sobre un campo
    (`:245-257`) siguen usando el correo en login y pasan sin cambios.

## T6 — Validación focalizada, suite completa, build y revisión visual

- **Descripción:** ejecutar las validaciones del plan y registrar el resultado de cada una como
  pass/fail o como no realizada.
- **RF cubiertos:** Todos
- **Dependencias:** T1, T2, T3, T4, T5
- **Hecho cuando:**
  - `npx vitest run src/test/components/domain/modales/AuthModal.test.jsx` pasa.
  - `npx vitest run src/test/cierreDeModales.test.jsx` y `npx vitest run src/test/App.test.jsx`
    pasan (montan el modal en login y no deben sufrir regresiones por el cambio de DOM).
  - `npm test` pasa sin regresiones en toda la suite y `npm run build` termina sin errores.
  - Revisión visual registrada: en `/` con «Registrarse» no aparece correo y sí nombre y
    contraseña; en `/login` aparece correo. Si no hay navegador disponible, se informa
    explícitamente como **no realizada**.
  - `git diff --check` no reporta problemas.

## T7 — Registrar estado y decisiones en `MEMORY.md`

- **Descripción:** añadir la referencia de `specs/023-registro-usuario-nuevos-parametros/` y el
  estado final (tareas completadas, validaciones ejecutadas) con las decisiones clave: registro
  sin `contacto`, `propiedad`, `correo` ni `idUsuario`; fecha local `YYYY-MM-DD` calculada en el
  envío; correo solo en login. Sin credenciales, tokens ni datos sensibles.
- **RF cubiertos:** N/A (documentación)
- **Dependencias:** T6
- **Hecho cuando:**
  - `MEMORY.md` referencia la spec 023 con su estado y resume las decisiones y el resultado de
    las validaciones, sin duplicar el contenido de la spec.
  - Figuran como pendientes los riesgos declarados: `contacto` obligatorio/único no enviado,
    identidad para el login posterior y confirmación del formato de fecha en el backend.
