# Spec 029 — Mostrar registros y detalles

**Estado:** implementada y validada

## Propósito

Hacer que los registros del usuario se puedan explorar desde sus páginas: abrir el detalle al seleccionar una tarjeta, correo o grupo; presentar tarjetas y movimientos en un modal; mostrar fuentes de correo como accesos a sus mensajes; permitir editar y eliminar grupos; y mantener Configuración legible en móvil. Los detalles usarán una experiencia modal común, con contenido específico por tipo de registro.

## Alcance

### Grupos y fuentes vinculadas

- Al pulsar cualquier zona de la tarjeta de un grupo, se abre su modal de detalle.
- El detalle muestra las fuentes vinculadas con su tipo y contenido, incluidos correos y números de teléfono. Los valores pertenecen al usuario del grupo conforme a la relación de la spec 027.
- El detalle ofrece acciones **Editar** y **Eliminar**. Editar permite cambiar nombre y descripción. Eliminar pide confirmación y no elimina las fuentes vinculadas del usuario.
- Los botones de acción de la tarjeta no deben disparar también su apertura.

### Correos por fuente

- Cada fuente activa de tipo `CORREO` se presenta como una tarjeta individual en la página Correos.
- Al pulsar una tarjeta de fuente, se abre el detalle de esa dirección y se muestran solo los mensajes recibidos por ella.
- Los filtros de categoría existentes (importantes, no importantes, contables, entretenimiento y otros) se aplican dentro de la fuente seleccionada.
- La vista conserva estados de conexión Gmail, carga, error y bandeja vacía. Una fuente sin mensajes no debe mostrar mensajes de otra dirección.

### Tarjetas registradas

- Los campos de alta validan tipo y formato antes del envío: titular obligatorio; número de 13 a 19 dígitos que supera la comprobación Luhn; vencimiento válido y futuro; CVV de 3 o 4 dígitos. Los errores se muestran junto al formulario y no se envía el registro si algún campo falla.
- Al seleccionar una tarjeta registrada, se abre la misma presentación visual de vista previa ya utilizada por FinApp, adaptada a los datos registrados del usuario.
- El detalle presenta los datos visuales de la tarjeta y una sección de movimientos asociados a esa tarjeta. Nunca muestra CVV; el número se mantiene enmascarado salvo los últimos cuatro dígitos.
- Como esta spec no incorpora persistencia ni endpoint de movimientos, el modal presenta un estado vacío honesto para las tarjetas registradas. No usa movimientos de demostración como si pertenecieran al usuario.

### Perfil

- **Ver perfil** abre el modal con una tarjeta de lectura que muestra los datos disponibles del usuario activo.
- **Modificar** cambia esa tarjeta por un formulario que solo permite editar identificación, nombre y contraseña.
- Los tres campos editables son obligatorios. La contraseña actual nunca se muestra; el campo corresponde a la nueva contraseña requerida para guardar.
- Guardar usa `PUT` enviando únicamente identificación, nombre y contraseña. El backend conserva los demás datos del usuario sin modificarlos. Fuentes, correo y teléfono no son editables desde este flujo.
- Ante error del `PUT`, el formulario conserva lo escrito y muestra el error; ante éxito, el modal vuelve a la tarjeta de lectura con los datos actualizados.

### Fuentes registradas en móvil

- La lista «Fuentes registradas» se adapta a pantallas móviles estrechas sin cortar contenido ni acciones.
- En móvil, cada registro puede presentarse como una tarjeta compacta o una fila apilada; tipo, contenido, estado, fecha y acciones Editar/Eliminar deben seguir disponibles y legibles.
- La vista de escritorio puede conservar la tabla actual.

### Modal común de detalle

- Se implementa un contenedor modal reutilizable para presentar el detalle de un registro seleccionado en los distintos módulos.
- El contenedor comparte encabezado, superficie visual, accesibilidad, foco inicial, trampa de foco, cierre con Escape/botón/clic exterior y devolución del foco. Cada módulo aporta sus secciones de contenido y acciones propias.
- Se adapta a móvil y escritorio, mantiene scroll dentro del diálogo y no excede los límites Fluid Glass del proyecto.

## Requisitos funcionales

- **RF-01 — Detalle de grupo:** abrir el detalle pulsando la tarjeta y presentar las fuentes vinculadas con tipo y contenido.
- **RF-02 — Gestión de grupo:** permitir editar nombre/descripción y eliminar con confirmación, conservando las fuentes del usuario.
- **RF-03 — Correo segmentado por fuente:** mostrar una tarjeta por fuente de correo y consultar únicamente los mensajes dirigidos a la fuente seleccionada; conservar los filtros de categoría.
- **RF-04 — Validación de tarjetas:** impedir envíos con datos de tarjeta mal formados y asociar cada error con su campo.
- **RF-05 — Detalle de tarjeta:** abrir el modal de vista previa para la tarjeta registrada y mostrar sus movimientos asociados, respetando el enmascaramiento.
- **RF-06 — Modal de perfil:** mostrar los datos registrados y permitir modificar exclusivamente identificación, nombre y contraseña mediante `PUT`.
- **RF-07 — Diseño responsive de fuentes:** presentar todos los datos y acciones de fuentes registradas sin desbordamiento horizontal en móvil.
- **RF-08 — Contenedor modal común:** reutilizar estructura y comportamiento accesible para el detalle de registros de todas las páginas incluidas.
- **RF-09 — Seguridad y propiedad:** las consultas y operaciones de cada módulo se limitan a los registros del usuario activo; no exponen CVV ni contraseña almacenada.
- **RF-10 — Estados:** los modales y listados muestran carga, error y estados vacíos sin presentar datos de demostración como datos persistidos.

## Datos y compatibilidad

- La relación grupo-fuente persistente introducida en la spec 027 se reutiliza; desvincular o eliminar un grupo no borra las fuentes de la cuenta.
- Las tarjetas registradas permanecen enmascaradas, en continuidad con la spec 026.
- El backend no tiene actualmente un modelo/endpoint de movimientos asociados a una tarjeta. Esta spec muestra el estado vacío; la persistencia y consulta de movimientos quedan para una spec futura.
- El `PUT` de perfil debe preservar los campos no enviados. Si el backend reemplaza el registro completo, debe adaptar el servicio para actualizar solo los campos autorizados antes de completar el flujo.

## Fuera de alcance

- Lectura, envío o persistencia de chat grupal, invitaciones y solicitudes, que siguen en el alcance de sus propias specs.
- Mostrar números completos de tarjeta o CVV.
- Editar fuentes/correo/teléfono desde el modal de perfil.
- Clasificar o persistir correos de Gmail; esta spec solo segmenta por fuente y presenta los mensajes obtenidos.
- Crear movimientos financieros o cambiar el flujo general de registro de transacciones.

## Criterios de aceptación

1. Cada tarjeta de grupo abre su detalle con las fuentes del mismo grupo, y Editar/Eliminar funcionan con confirmación y manejo de error.
2. En Correos, elegir una fuente muestra únicamente sus mensajes y los filtros de categoría operan sobre ese conjunto.
3. Una tarjeta registrada abre la vista de previa compartida y no expone CVV ni número completo.
4. El formulario de tarjeta impide enviar datos de formato inválido y enfoca/informa el campo con error.
5. El perfil solo permite editar identificación, nombre y contraseña; el payload del `PUT` contiene esos campos, y los valores restantes del usuario se conservan.
6. La sección de fuentes es operable a 320 px y conserva las acciones de editar y eliminar.
7. Los modales pueden operarse con teclado y devuelven el foco al disparador al cerrarse.
8. Las suites focalizadas, `npm test` y `npm run build` pasan; las operaciones backend incluidas tienen pruebas de propiedad/actualización.
9. El detalle de tarjeta muestra el estado vacío de movimientos sin presentar fixtures como datos registrados.

## Decisión resuelta: movimientos de tarjeta

La aplicación no cuenta con un endpoint ni un modelo que relacione movimientos con tarjetas. Por decisión del usuario, 029 no implementará esa persistencia: el modal mostrará el estado vacío y los movimientos persistidos se abordarán en otra spec. No usar los fixtures de `TARJETAS_DEMO` para aparentar movimientos reales de tarjetas registradas.
