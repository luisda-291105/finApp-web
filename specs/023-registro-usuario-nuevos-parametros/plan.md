# Plan: Ajuste registro de usuario con nuevos parámetros

Spec de referencia: `specs/023-registro-usuario-nuevos-parametros/spec.md` (estado: **aprobada**).
Solo el **qué** está en la spec; este documento fija el **cómo** y el alcance técnico mínimo.

## 1. Estado real verificado (punto de partida)

- `src/components/domain/modales/AuthModal.jsx:87-130` — `manejarEnvio` ya distingue modo y
  construye el cuerpo en línea: login `{ correo, contrasena }`; registro
  `{ nombre, correo, contrasena }`. **No** envía `contacto`, `propiedad`, `fechaCreacion` ni
  `idUsuario`.
- `AuthModal.jsx:203-215` — el bloque del correo (label + `input type="email" required`) se
  renderiza en ambos modos; solo el bloque de nombre (`:187-201`) está condicionado a `registro`.
- Estados actuales (`:54-59`): `modo`, `nombre`, `correo`, `contrasena`, `cargando`, `mensaje`.
  `correo` se conserva entre pestañas porque el componente no se desmonta al cambiar `modo`.
- Endpoint `auth.registro` ya existe en `src/config/api.config.js:14-18`; **no** hay que tocar
  configuración, backend ni servicios.
- `src/test/components/domain/modales/AuthModal.test.jsx` — la suite **no** prueba hoy el
  payload ni el `fetch`: todos los casos son de cierre, foco y conservación de campos. Los
  casos de las líneas 175 y 251 usan el placeholder `tu@correo.com` en modo **login** (por
  defecto), así que siguen siendo válidos. La suite `AC-22: cerrar NO borra lo escrito`
  (`:274-324`) sí asume correo visible en `modoInicial="registro"` y hay que ajustarla.
- Cabecera JSDoc del componente: `@estados` dice `formulario (objeto)`, que **no** corresponde
  al código actual (seis estados separados). Se corrige en el mismo cambio porque la cabecera
  debe describir props/estados/eventos reales.

## 2. Arquitectura del cambio

Un único componente de producción y su suite. Sin componentes, hooks, servicios ni endpoints
nuevos. Sin cambios de formato de datos persistidos.

### 2.1 Fecha local de creación (`AuthModal.jsx`)

- Helper **local** al módulo (no exportado), con JSDoc breve, p. ej.
  `crearFechaCreacionLocal(fecha = new Date())`.
- Implementación con componentes locales explícitos:
  `getFullYear()`, `getMonth() + 1`, `getDate()`, y relleno a dos dígitos con
  `String(valor).padStart(2, "0")`; se concatenan con `-`.
- Prohibido en este cálculo: `toISOString()`, `toJSON()`, `toLocaleDateString()` y cualquier
  conversión a UTC o dependiente de locale.
- El helper se invoca **dentro** de `manejarEnvio`, en la rama de registro, justo al construir
  el cuerpo. No se calcula al abrir, al cambiar de pestaña ni en render.

### 2.2 Payload de registro

- Sustituir el cuerpo en línea por una construcción por ramas que conserve la forma actual:
  - `login` → `{ correo, contrasena }` (sin cambios).
  - `registro` → `{ nombre, contrasena, fechaCreacion: crearFechaCreacionLocal() }`.
- Sin claves extra, sin `null`, sin cadenas vacías sustitutivas, sin `contacto`, `propiedad`,
  `correo` ni `idUsuario`. No se aplican recortes (`trim`) ni transformaciones a `nombre` o
  `contrasena`.
- No se toca `setCargando`, `setMensaje`, el manejo de error de red, el mensaje de éxito ni el
  `setTimeout(..., 1200)`.

### 2.3 Campo de correo solo en login

- Condicionar el bloque completo (label + `input`) a `modo === "login"`, igual que el bloque de
  nombre ya está condicionado a `modo === "registro"`.
- El `input` conserva `type="email"` y `required` **dentro** de la rama de login: en registro no
  existe en el DOM y, por tanto, no se valida ni bloquea el envío.
- El estado `correo` y `setCorreo` se mantienen: login los usa y el valor escrito sobrevive al
  cambio de pestaña (spec, caso límite «Cambio de pestaña con un correo ya escrito»). No se
  limpia ni se envía en registro.
- No se cambian textos, estilos, orden de los campos ni estructura del modal más allá de ocultar
  ese bloque en registro.

### 2.4 Cabecera JSDoc

- Mantener el formato de bloque existente (`@uso`, `@funciones`, `@datos`, `@eventos`,
  `@estados`, `@usadoPor`).
- Corregir `@estados` a los estados reales (`modo`, `nombre`, `correo`, `contrasena`, `cargando`,
  `mensaje`) y precisar en `@datos`/descripción que el correo solo se muestra y se envía en
  login, y que el registro envía `nombre`, `contrasena` y `fechaCreacion` calculada en el envío.
- No cambia la firma `AuthModal({ abierto, modoInicial, alCerrar })`; `PaginaInicio.jsx` y
  `PaginaLogin.jsx` no se tocan.

## 3. Decisiones y alternativas descartadas

| Decisión | Justificación | Alternativa descartada |
| --- | --- | --- |
| Helper local no exportado | Un solo consumidor; se verifica por el cuerpo de la petición, que es el contrato observable | Exportar el helper para probarlo aislado: añade superficie pública sin necesidad |
| `getFullYear`/`getMonth`/`getDate` + `padStart` | Requisito explícito de fecha local sin desfase; el formato queda garantizado por construcción | `toISOString().slice(0,10)`: puede desplazar el día local (RF-06, último punto) |
| `Intl.DateTimeFormat("sv-SE")` o `toLocaleDateString("en-CA")` | — | Dependen de convenciones de locale y de disponibilidad de ICU; menos explícito que el formateo manual |
| Fecha calculada en la rama de registro de `manejarEnvio` | Cumple «solo en el envío» y recalcula en cada reintento | Estado `fechaCreacion` en `useState` o `useMemo`: fijaría el valor al abrir/renderizar y añadiría estado innecesario |
| Mantener `correo` en `useState` aunque no se muestre en registro | Conserva el valor al volver a login sin lógica extra | Limpiar `correo` al pasar a registro: rompe la conservación ya cubierta por AC-22 y añade un efecto |
| Correo condicionado con el mismo patrón que el nombre | Coherencia con el código existente, sin `hidden` ni `display` | Ocultar con CSS: el campo seguiría en el DOM, sería validado por `required` y seguiría siendo enfocable |
| Pruebas con `vi.useFakeTimers({ toFake: ["Date"] })` | Congela el reloj sin falsear `setTimeout`/`setInterval`, que usan `focus-trap` (foco inicial diferido), `userEvent` y el cierre con `setTimeout` del propio modal | Fake timers completos: obligan a `advanceTimers` en cada interacción y hacen frágil la suite |
| `fetch` simulado resolviendo `{ ok: false }` en las pruebas de payload | Evita el `setTimeout(1200)` del camino de éxito y sus temporizadores pendientes entre casos | `{ ok: true }`: deja un cierre programado que puede dispararse en otro caso |

## 4. Archivos afectados

| Archivo | Cambio |
| --- | --- |
| `src/components/domain/modales/AuthModal.jsx` | Helper de fecha local, payload de registro, correo solo en login, cabecera JSDoc |
| `src/test/components/domain/modales/AuthModal.test.jsx` | Suite nueva de payload/fecha/visibilidad del correo y ajuste de la suite AC-22 |
| `MEMORY.md` | Estado y decisiones de la spec 023 (sin datos sensibles) |

Sin cambios en: `src/config/api.config.js`, `src/pages/PaginaInicio.jsx`,
`src/pages/PaginaLogin.jsx`, `src/test/cierreDeModales.test.jsx`, `src/test/App.test.jsx`
(estos dos montan el modal en modo login por defecto y no dependen del correo en registro),
backend ni dependencias de `package.json`.

## 5. Pruebas (Vitest + Testing Library)

Ruta: `src/test/components/domain/modales/AuthModal.test.jsx` (la suite existente se amplía; no
se crea archivo nuevo). Comandos: `npx vitest run src/test/components/domain/modales/AuthModal.test.jsx`,
`npx vitest run src/test/cierreDeModales.test.jsx`, `npx vitest run src/test/App.test.jsx`,
`npm test`, `npm run build`.

Infraestructura de pruebas que se añade (una sola vez, en un `describe` propio):

- `beforeEach`: `vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))`.
- `afterEach`: `vi.unstubAllGlobals()` y `vi.useRealTimers()`.
- URL esperada calculada con `getEndpoint("auth.registro")` / `getEndpoint("auth.login")`, sin
  hardcodear rutas.
- Cuerpo leído de `fetch.mock.calls[0][1].body` con `JSON.parse`.
- El envío se dispara escribiendo los campos y pulsando el botón de envío
  (`userEvent.click` sobre el `button[type="submit"]`), con `await waitFor` hasta que `fetch`
  se haya llamado: `manejarEnvio` es asíncrono.

Casos nuevos:

1. **Payload exacto de registro (RF-01, RF-02, RF-05)** — en `modoInicial="registro"`, escribir
   nombre y contraseña y enviar: el cuerpo tiene exactamente las claves `nombre`, `contrasena`,
   `fechaCreacion` (`Object.keys(...).sort()` u orden equivalente), no tiene `correo`,
   `contacto`, `propiedad` ni `idUsuario`, ningún valor es `null` y ninguna cadena es vacía.
   Verifica además que la URL y el método son los de `auth.registro`.
2. **Formato `YYYY-MM-DD` (RF-06)** — con el reloj congelado, la fecha del cuerpo cumple
   `/^\d{4}-\d{2}-\d{2}$/` y equivale a los componentes locales de la fecha congelada
   (año de 4 dígitos, mes y día con relleno a dos dígitos).
3. **Sin conversión UTC (RF-06)** — con `vi.setSystemTime(new Date(2026, 2, 5, 23, 30))` se
   envía `2026-03-05`; complementariamente, con `Date.prototype.toISOString` espiado para lanzar,
   el envío no falla (evidencia de que no se serializa en UTC).
4. **La fecha se calcula en el envío (RF-06, casos límite «medianoche»)** — abrir el modal y
   escribir con el reloj en `2026-03-05 23:50`; avanzar el reloj a `2026-03-06 00:10` antes de
   enviar; el cuerpo lleva `2026-03-06`. Un segundo caso cubre abrir/cerrar/reabrir y cambiar de
   pestaña sin enviar: no se envía nada hasta el envío y el valor usado es el del momento del
   envío.
5. **Correo ausente en registro y presente en login (RF-03, RF-04)** — en registro
   `queryByPlaceholderText("tu@correo.com")` es `null` y el envío funciona sin correo; en login
   el campo existe, conserva `type="email"` y `required`, y el cuerpo es exactamente
   `{ correo, contrasena }` (sin `nombre` ni `fechaCreacion`).
6. **Conservación del correo al cambiar de pestaña (caso límite)** — empezar en login, escribir
   correo, pasar a registro (campo ausente) y volver a login: el valor sigue en el campo y el
   envío de login lo incluye.
7. **Validación HTML (casos límite nombre/contraseña vacíos)** — con nombre o contraseña vacíos,
   pulsar enviar no llama a `fetch` (jsdom aplica la validación interactiva de `required` y no
   dispara `submit`). No se añaden mensajes de error nuevos.

Casos ajustados:

8. **AC-22 (registro)** — `escribirCampos` deja de escribir el correo en registro: escribe nombre
   y contraseña, comprueba que el campo de correo no existe, cierra («X» y Esc) y reabre
   verificando que se conservan nombre y contraseña. Se mantiene el aserto de que no hay errores
   en consola en el caso de Esc.
9. **AC-22 (login, cobertura nueva de la conservación del correo)** — escribir correo y
   contraseña en login, cerrar y reabrir: ambos se conservan.
10. **Revisión del resto de la suite** — los casos de Esc con el foco en un campo (`:170-185`) y
    de arrastre iniciado sobre un campo (`:245-257`) usan el correo en login y **no** cambian;
    ningún otro caso depende de la visibilidad del correo en registro (verificado por `grep`).

## 6. Relación cambio ↔ requisito funcional

| Requisito | Cambio técnico | Prueba |
| --- | --- | --- |
| RF-01 Payload mínimo en registro | Rama de registro con `{ nombre, contrasena, fechaCreacion }` | Caso 1 |
| RF-02 Sin claves nulas ni vacías | Objeto literal sin claves opcionales ni valores sustitutos | Caso 1 |
| RF-03 Correo solo en login | Bloque del correo condicionado a `modo === "login"` | Casos 5, 8 |
| RF-04 Login sin cambios | Rama de login intacta; `correo` sigue en estado | Casos 5, 6, 9 |
| RF-05 `idUsuario` del backend | El payload no incluye la clave | Caso 1 |
| RF-06 Fecha calculada en el envío, local, `YYYY-MM-DD` | `crearFechaCreacionLocal()` invocado dentro de `manejarEnvio` | Casos 2, 3, 4 |
| Casos límite de validación HTML | Se conserva `required`; el correo no existe en registro | Casos 5, 7 |

## 7. Validaciones de cierre

1. `npx vitest run src/test/components/domain/modales/AuthModal.test.jsx` — pass/fail.
2. `npx vitest run src/test/cierreDeModales.test.jsx` y `npx vitest run src/test/App.test.jsx`
   — sin regresiones por el cambio de DOM.
3. `npm test` — suite completa.
4. `npm run build` — build de producción.
5. Revisión visual (cambio visible): en `/` abrir «Registrarse» y comprobar que no aparece
   correo, que sí aparecen nombre y contraseña, y en `/login` que aparece correo. Los límites
   Fluid Glass no cambian. Reportar como **no realizada** si no hay navegador disponible.
6. `git diff --check` antes de cerrar.

## 8. Riesgos y pendientes declarados (no se resuelven en este cambio)

- **`contacto` obligatorio y único sin enviar:** el backend declara `contacto` obligatorio y
  único, pero la spec aprobada lo excluye del payload. Si `CUsuario.adicionarUsuario` lo exige,
  el registro fallará con el mensaje de error ya existente. Requiere confirmación del backend;
  el cliente **no** añadirá el campo por iniciativa propia.
- **Identidad para el login posterior:** sin `contacto` no está definido con qué identificador
  podrá iniciar sesión después el usuario creado (hoy el login usa `correo`). Es una decisión de
  backend/producto, fuera del alcance.
- **Tipo esperado por el backend:** falta confirmar que el backend acepte `LocalDate` como
  `"YYYY-MM-DD"`. Se asume el formato ISO de fecha sin hora que pide la spec; no se envía hora,
  zona ni sufijo.
- **Confianza en el reloj del dispositivo:** la fecha la aporta el cliente; un reloj o zona mal
  configurados producen una fecha local incorrecta y el frontend no la corrige (spec, caso
  límite).
- **Sin prueba de contrato con backend:** no hay pruebas de integración ni backend disponible en
  esta fase; las pruebas verifican solo el cuerpo que construye el cliente.

## 9. Contradicciones documentales detectadas

- `AGENTS.md` (sección «Reglas de trabajo»), `doc/constitution.md` §3 y
  `.agents/rules/rules.md` remiten a `.agents/file-header-template.md`, pero ese archivo **no
  existe** en el repositorio (`.agents/` solo contiene `rules/` y `skills/`). Para este cambio se
  mantiene el estilo de cabecera ya usado por `AuthModal.jsx`; conviene reponer la plantilla o
  corregir las referencias en una tarea aparte.
- `AGENTS.md` remite a `.agents/response-rules.md`, que tampoco existe.
- La cabecera de `AuthModal.jsx` ya estaba desactualizada antes de este cambio (`@estados`
  menciona `formulario (objeto)`); se corrige aquí y no se propaga.
