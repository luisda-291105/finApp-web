# Especificación: Modal de perfil en Configuración

## Estado
aprobada

## Objetivo
Crear un modal de perfil que muestre y permita modificar la información básica del usuario activo, accesible desde la página de Configuración del dashboard. Se utilizan los componentes y patrones ya existentes.

## Alcance
- Mantener `UsuarioActivoContext` como fuente del usuario activo tras login o registro.
- Mostrar el nombre del usuario activo de forma dinámica en el encabezado del modal, con respaldo «Cuenta de Usuario Demo».
- Mostrar el correo como «No registrado» en la vista del modal.
- En `PaginaDashboardConfiguracion`, sustituir el bloque «Usuarios» por un bloque «Perfil» con un único botón «Ver perfil», eliminando el botón «Crear usuario».
- Reutilizar el componente `src/components/domain/modales/ModalCrearUsuario.jsx` (renombrado a `ModalPerfilUsuario`) como modal de perfil, reemplazando sus campos por los del perfil.
- Mostrar en el modal: Cédula/Identificación (`idUsuario`), Nombre, Contraseña, Correo y Teléfono; Correo y Teléfono aparecen como «No registrado».
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

## Test del Bloque Perfil
1. Renderizar el bloque con encabezado «Perfil» y botón «Ver perfil».
2. Al pulsar el botón, se abre el único modal `ModalPerfilUsuario` con los datos del usuario activo.

## Test de Cierre del Modal
1. Cerrar el modal pulsando Escape (patrón `useCierreConEsc`).
2. Cerrar el modal haciendo clic fuera del área de la ventana.
3. Confirmar que el modal desaparece sin cambios no guardados.

## Modal Único
Solo existe un componente `ModalPerfilUsuario` que alterna entre vista y edición sin clonar componentes.

## Tareas — Spec 024: Modal de perfil

| # | Tarea | RF | Hecho cuando |
|---|-------|----|---------------|
| 1 | **Crear `ModalPerfilUsuario.jsx`** | RF‑05 | Archivo con modal de presentación y edición sujeta a FocusTrap y `aria-modal="true"`. |
| 2 | **Configurar cierre y focus** | RF‑07 | Modal responde a Esc, clic fuera y gestos con `useDeslizarParaCerrar`, `useCierreConEsc`. |
| 3 | **Agregar estado `modalPerfilAbierto` en `PaginaDashboardConfiguracion.jsx`** | RF‑04 | Estado local para controlar la apertura del modal. |
| 4 | **Agregar estado `modalPerfilEditAbierto` y `handleModificar`** | RF‑06 | Al pulsar «Modificar», cambia al modo edición. |
| 5 | **Actualizar import de `ModalPerfilUsuario`** | RF‑06 | `import ModalPerfilUsuario from “…/domain/modales/ModalPerfilUsuario”`. |
| 6 | **Llenar props de `ModalPerfilUsuario`** | RF‑06 | `abierto`, `onCerrar`, `usuario`, `onModificar`. |
| 7 | **Crear test de apertura del modal** | RF‑07 | Vitest+Testing‑Library: verifica título, datos y botón «Modificar». |
| 8 | **Test de interacción “Modificar”** | RF‑07 | Verifica que la vista cambia a edición. |
| 9 | **Test de envío en `ModalPerfilUsuario`** | RF‑08 | Simula cambios, dispara submit, valida llamada a `actualizarUsuario`, mock de respuesta y sync context. |
|10 | **Test de cierre (Esc, clic fuera)** | RF‑09 | Para ambos modos de modal. |
|   |
*Horas estimadas por tarea: ≈2 h → total 20 h.*
*Responsable estándar: Implementer.*