# Especificación: Perfil modal

## Estado
aprobada

## Objetivo
Crear un modal de perfil que muestre y permita modificar la información básica del usuario activo, accesible desde la página de Configuración del dashboard. El nombre del usuario debe mostrarse de forma dinámica en el modal de cuenta del dashboard tras el acceso. Correo y teléfono quedan como «No registrado» y se gestionarán en otra especificación mediante el registro de fuentes.

## Alcance
- Mantener `UsuarioActivoContext` como fuente del usuario activo tras login o registro.
- Mostrar el nombre del usuario activo de forma dinámica en `DashboardUserModal` (encabezado), con respaldo «Cuenta de Usuario Demo».
- Mostrar el correo como «No registrado» en `DashboardUserModal`.
- En `PaginaDashboardConfiguracion`, sustituir el bloque «Usuarios» por un bloque «Perfil» con un único botón que abre el modal; eliminar el botón «Crear usuario».
- Reutilizar `src/components/domain/modales/ModalCrearUsuario.jsx` como modal de perfil, reemplazando sus campos por los del perfil.
- Mostrar en el modal: Cédula/Identificación (`idUsuario`), Nombre, Contraseña, Correo («No registrado») y Teléfono («No registrado»).
- Incluir al final del modal un botón «Modificar» que habilite la edición solo de Cédula/Identificación, Nombre y Contraseña.
- Al guardar, actualizar con `usuarioServicio.actualizarUsuario` (PUT /usuario/{idUsuario}) y sincronizar `UsuarioActivoContext`.

## Fuera de alcance
- Validaciones de campos (formato, obligatoriedad, longitud). Sin validación por ahora.
- Edición de correo y teléfono; se hará en otra spec con registro de fuentes.
- Cambios en el flujo, payloads o endpoints de login y registro.
- Autenticación real, recuperación de contraseña, sesiones, roles o foto de perfil.
- Cambios de estilo ajenos al patrón Fluid Glass existente.

## Requisitos funcionales (EARS)
- **RF-01 — Nombre dinámico en cuenta:** CUANDO exista usuario activo, EL SISTEMA DEBE mostrar su `nombre` en el encabezado de `DashboardUserModal`; SI no existe, DEBE mostrar «Cuenta de Usuario Demo».
- **RF-02 — Correo no registrado en cuenta:** EL SISTEMA DEBE mostrar el correo como «No registrado» en `DashboardUserModal`, sin permitir su edición.
- **RF-03 — Configuración con bloque Perfil:** EN `PaginaDashboardConfiguracion`, EL SISTEMA DEBE sustituir el bloque «Usuarios» por «Perfil» con un único botón, y NO DEBE mostrar el botón «Crear usuario».
- **RF-04 — Apertura del modal:** AL pulsar el botón del bloque «Perfil», EL SISTEMA DEBE abrir el modal de perfil con los datos del usuario activo.
- **RF-05 — Datos mostrados:** EL MODAL DE PERFIL DEBE mostrar Cédula/Identificación, Nombre, Contraseña, Correo y Teléfono; Correo y Teléfono DEBEN mostrarse como «No registrado».
- **RF-06 — Modo modificación limitado:** AL pulsar «Modificar», EL SISTEMA DEBE habilitar únicamente Cédula/Identificación, Nombre y Contraseña; Correo y Teléfono NO DEBEN ser editables.
- **RF-07 — Guardado:** AL guardar en modo modificación, EL SISTEMA DEBE llamar a `actualizarUsuario` con el `idUsuario` original y enviar `idUsuario`, `nombre`, `contrasena` y `fechaCreacion`, sin validaciones.
- **RF-08 — Sincronización:** TRAS un guardado exitoso, EL SISTEMA DEBE actualizar `UsuarioActivoContext` (y `localStorage`) y reflejar el nuevo nombre en el dashboard.
- **RF-09 — Errores por consola:** SI falla la actualización, EL SISTEMA DEBE registrar el error por consola y mantener el modal abierto.
- **RF-10 — Comportamiento modal:** EL MODAL DEBE mantener las formas de cierre del proyecto («X», Escape, clic fuera), `FocusTrap`, `useCierreConEsc`, `useRetornoDeFoco` y tokens Fluid Glass.

## Casos límite
- Usuario activo sin nombre: mostrar «Cuenta de Usuario Demo» sin romper el render.
- Mantener el mismo `idUsuario`: permitido.
- Cambiar `idUsuario`: se envía tal cual y el contexto queda con el nuevo valor.
- Error 400/404/409/500 del backend: se registra por consola y el modal permanece abierto.
- Reabrir el modal tras cancelar: vuelve a solo lectura con los datos del contexto.
- Cambiar de página tras guardar: el nombre actualizado se conserva.
- Contraseña vacía al guardar: se envía el valor tal cual, sin validación.

## Criterios de aceptación
- [ ] `DashboardUserModal` muestra el nombre del usuario activo o «Cuenta de Usuario Demo».
- [ ] `DashboardUserModal` muestra el correo como «No registrado».
- [ ] Configuración muestra «Perfil» con un botón y ya no muestra «Crear usuario».
- [ ] El modal muestra Cédula/Identificación, Nombre, Contraseña, Correo y Teléfono («No registrado» los dos últimos).
- [ ] «Modificar» solo habilita Cédula/Identificación, Nombre y Contraseña.
- [ ] Guardar realiza PUT /usuario/{idUsuario} con los campos indicados.
- [ ] Tras guardar, el contexto y el nombre del dashboard se actualizan.
- [ ] Los errores se registran por consola.
- [ ] Se conservan accesibilidad y formas de cierre.

## Verificación
- Revisar en Network la petición PUT y su payload.
- Modificar el nombre y comprobar el cambio en el encabezado del modal de cuenta.
- Confirmar que Correo y Teléfono no son editables.
- Probar cierre por «X», Escape y clic fuera.
- Probar con y sin usuario activo para validar el respaldo.
