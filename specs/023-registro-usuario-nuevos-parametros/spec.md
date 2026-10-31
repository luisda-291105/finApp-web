# Especificación: Ajuste registro de usuario con nuevos parámetros

## Estado
aprobada

## Objetivo
Ajustar el envío del formulario de registro del frontend al contrato de creación de usuario del backend (`MUsuario`): enviar solo los campos que el cliente está autorizado a proporcionar, con la fecha de creación calculada por la web como fecha local del día en formato `YYYY-MM-DD`, sin `null` y sin claves que el backend gestiona por su cuenta.

## Modelo backend (referencia)
`MUsuario`:
- `idUsuario` (String, 36) - PK, generada por el backend; el frontend NO la envía
- `nombre` (String, 100) - obligatorio; el frontend SÍ lo envía en el registro
- `contacto` (String, 150) - obligatorio y único **según el backend**; el frontend NO lo envía (la clave queda fuera del payload)
- `contrasena` (String, 255) - obligatorio; el frontend SÍ lo envía en el registro
- `propiedad` (String, 255) - opcional **según el backend**; el frontend NO lo envía (la clave queda fuera del payload)
- `fechaCreacion` (LocalDate) - obligatoria; el frontend SÍ la envía, calculada automáticamente como fecha local del día en formato `YYYY-MM-DD` (sin hora)

Nota: el modelo es la referencia del backend, no la forma del payload del frontend. Que un campo admita `null` en el modelo no autoriza al cliente a enviarlo. `fechaCreacion` es la excepción en cuanto a origen: el backend la recibe ya calculada por la web.

## Alcance
- En modo registro, el payload es exactamente `{ nombre, contrasena, fechaCreacion }`.
- `fechaCreacion` la calcula la web en el momento del envío: fecha local del dispositivo, sin hora y en formato `YYYY-MM-DD`.
- No se envían `correo`, `contacto`, `propiedad` ni `idUsuario`: sin claves, sin `null` y sin valores vacíos o sustitutivos.
- El campo de correo electrónico no se muestra ni se valida en modo registro; solo existe en modo login.
- El modo login conserva sus campos visibles, sus validaciones y su payload actual `{ correo, contrasena }` sin cambios.
- `idUsuario` y, en su caso, el valor inicial de `contacto` y `propiedad` los gestiona el backend.
- La fecha de creación no se pide al usuario: no hay control editable ni validación manual de la misma.
- Se mantiene el resto del comportamiento del modal de acceso (tabs, mensajes, estado de carga, cierre y foco).

## Fuera de alcance
- Cambios en backend, incluida la obligatoriedad y unicidad de `contacto` y el carácter opcional de `propiedad`.
- Enviar `null`, cadenas vacías o valores por defecto para cualquier campo no autorizado.
- Validaciones nuevas más allá de las validaciones HTML ya existentes.
- Campo, selector o calendario de fecha de creación visible para el usuario, y cualquier validación manual de esa fecha.
- Zona horaria configurable, conversión de la fecha a UTC o sincronización con la zona horaria del backend.
- Cambios en el tipo o el formato de fecha que espera el backend más allá de `YYYY-MM-DD`.
- Cambios de estilo, textos o estructura del modal ajenos al ocultamiento del campo de correo en registro.

## Requisitos funcionales (EARS)
- **RF-01 — Payload mínimo en registro:** CUANDO el usuario envíe el formulario en modo registro, EL SISTEMA DEBE enviar únicamente las claves `nombre`, `contrasena` y `fechaCreacion`.
- **RF-02 — Sin claves nulas ni vacías:** CUANDO se construya el payload de registro, EL SISTEMA NO DEBE incluir `correo`, `contacto`, `propiedad` ni `idUsuario`, ni representar ningún campo como `null`, cadena vacía u otro valor sustitutivo.
- **RF-03 — Correo solo en login:** MIENTRAS el formulario esté en modo registro, EL SISTEMA NO DEBE mostrar ni exigir el campo de correo electrónico; CUANDO el formulario esté en modo login, EL SISTEMA DEBE mostrarlo y validarlo como hasta ahora.
- **RF-04 — Login sin cambios:** CUANDO el usuario envíe el formulario en modo login, EL SISTEMA DEBE enviar `{ correo, contrasena }` y mantener el comportamiento actual.
- **RF-05 — Identificador generado por el backend:** SI el backend genera `idUsuario`, EL SISTEMA NO DEBE enviarlo ni asumir que el cliente debe calcularlo.
- **RF-06 — Fecha de creación calculada por la web:** CUANDO el usuario envíe el formulario en modo registro, EL SISTEMA DEBE calcular `fechaCreacion` en ese mismo momento, a partir de la fecha local del dispositivo, y enviarla con formato `YYYY-MM-DD` (sin hora).
  - CUANDO el formulario se abra o se cambie de pestaña sin enviarse, EL SISTEMA NO DEBE fijar todavía `fechaCreacion`: el cálculo ocurre solo en el envío.
  - MIENTRAS el formulario esté en modo registro, EL SISTEMA NO DEBE ofrecer un control editable de `fechaCreacion` ni solicitar su valor al usuario.
  - EL SISTEMA NO DEBE obtener el día mediante una serialización en UTC que pueda desplazar la fecha local.

## Casos límite
- Registro con nombre vacío: se mantiene la validación HTML existente del campo.
- Registro con contraseña vacía: se mantiene la validación HTML existente del campo.
- Registro con el campo de correo vacío o inexistente en pantalla: no bloquea el envío, porque en modo registro no se muestra ni se valida.
- Cambio de pestaña con un correo ya escrito: el valor no viaja en el payload de registro; al volver a login se reutiliza el estado existente.
- Registro con nombre o contraseña que contengan espacios: se envían tal cual, sin recortes ni transformaciones nuevas.
- Modal abierto antes de medianoche y enviado después: se envía el día del envío, no el de la apertura del modal.
- Envío cerca de la medianoche en una zona horaria con desfase respecto a UTC: se envía el día local del dispositivo; la fecha no se adelanta ni se retrasa por una conversión a UTC.
- Dispositivo con reloj o zona horaria mal configurados: se envía la fecha local que reporta el dispositivo; el cliente no corrige esa configuración ni la valida contra el backend.
- Reintento tras un error de red o del backend: cada envío recalcula la fecha del día.
- Formato invariable: la fecha se envía como cuatro dígitos de año, dos de mes y dos de día separados por guiones (`YYYY-MM-DD`), sin hora, sin zona horaria y sin sufijos.
- No existe campo de fecha en el formulario: el usuario no puede editarla ni introducir otro formato u otra fecha.
- Backend asigna `idUsuario` y, si corresponde, el valor inicial de `contacto` y `propiedad`: el cliente no los replica.
- Si el backend rechaza la creación por ausencia de `contacto`, el formulario muestra el mensaje de error existente, sin añadir ese campo en el cliente.

## Criterios de aceptación
- [ ] En modo registro el payload es exactamente `{ nombre, contrasena, fechaCreacion }`
- [ ] El payload de registro no contiene `correo`, `contacto`, `propiedad` ni `idUsuario`, ni claves con `null` o vacías
- [ ] `fechaCreacion` corresponde a la fecha local del día del envío, con formato `YYYY-MM-DD`, sin hora y sin desfase por UTC
- [ ] La fecha se calcula en el envío: abrir el modal o cambiar de pestaña no fija el valor
- [ ] No existe campo de fecha visible ni editable para el usuario
- [ ] En modo registro no se muestra ni se exige el campo de correo electrónico
- [ ] En modo login se muestran correo y contraseña y el payload sigue siendo `{ correo, contrasena }`
- [ ] No se rompen estilos ni funcionalidad existente (tabs, mensajes, estado de carga, cierre y foco)

## Verificación
- Revisar el cuerpo de la petición de registro: exactamente `nombre`, `contrasena` y `fechaCreacion`, sin claves extra ni `null`
- Comprobar que `fechaCreacion` coincide con la fecha local del día y cumple el patrón `YYYY-MM-DD`
- Probar con una zona horaria distinta de UTC (y en un horario próximo a la medianoche) para confirmar que el día no se desplaza
- Revisar el cuerpo de la petición de login: `{ correo, contrasena }` sin cambios
- Comprobar compatibilidad con `CUsuario.adicionarUsuario` en el backend, incluido el tipo de fecha esperado
- Confirmar con el backend si la creación de usuario sin la clave `contacto` es aceptada pese a ser obligatoria y única en el modelo (punto abierto)
