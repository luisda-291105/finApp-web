# Spec 016 — Contactos, correos y registro de fuentes

**Estado: aprobada (2026-10-20)**

## 1. Propósito

Incorporar al dashboard vistas informativas de demostración para Contactos y Correos, ofrecer en
Configuración un modal de registro de fuentes con campos para correo y teléfono, y ubicar el avatar
al pie de la navegación lateral en escritorio.

La experiencia debe dejar claro que es una demostración: el modal no envía ni guarda la información
introducida y no confirma registros ni conexiones. Contactos y Correos deben poder alcanzarse desde
la navegación del dashboard sin alterar la estructura actual de la navegación inferior móvil.

## 2. Alcance

### 2.1 Incluido

- Secciones **Contactos** y **Correos** como vistas informativas del dashboard, cada una con una
  descripción breve de su propósito en FinApp. No incluyen listas ni ejemplos ficticios.
- Acceso a ambas secciones desde la navegación lateral de escritorio y desde el menú móvil.
- La navegación inferior móvil conserva sus tres destinos actuales y el control «Menú»; Contactos y
  Correos no se agregan como controles a esa barra.
- En **Configuración**, un punto de acceso a un modal de registro de fuentes con un campo de correo,
  un campo de teléfono y un botón de demostración sin envío. Su propósito visible es reunir
  información relacionada con conectar correos y registrar números telefónicos.
- El modal y las secciones se identifican como demostración; el modal no guarda ni envía datos, borra
  lo escrito al cerrarse y no presenta un registro o una conexión como completados.
- En escritorio (desde el corte actual de 768 px), el avatar queda anclado a la parte inferior de la
  sidebar y separado visualmente de los enlaces de navegación.
- En el menú móvil, el avatar permanece al final, después de todos los enlaces, sin anclaje al fondo;
  su posición vertical puede cambiar cuando se agreguen enlaces.

### 2.2 Fuera de alcance

- Conexión efectiva con proveedores de correo, agendas, servicios externos o backend.
- Envío, almacenamiento, persistencia o sincronización de datos del modal.
- Acciones para crear, editar, eliminar, importar, exportar, buscar o contactar elementos en las
  vistas de Contactos y Correos.
- Cambios en la cantidad, el orden o el propósito de los controles de la navegación inferior móvil.
- Especificación de nombres, formatos o reglas de validación exactos de los campos, así como flujos
  de envío, confirmación o recuperación de errores. El botón acordado es solo demostrativo y no
  envía información.

## 3. Estado actual relevante

- El dashboard ya tiene una sección de Configuración accesible desde la opción «Configuración» de
  Cuenta; su contenido actual es informativo y de demostración.
- Contactos y Correos aún no están definidos como secciones del dashboard ni aparecen en su
  navegación.
- En móvil, la barra inferior tiene tres destinos y un botón «Menú»; el menú abre la navegación
  lateral compartida con escritorio.
- El avatar se renderiza con la navegación compartida, después de los enlaces; en escritorio no está
  anclado al borde inferior. El menú móvil también usa ese contenido compartido.
- La aplicación identifica el modo del dashboard como demostración y no dispone de persistencia de
  datos financieros verificada.

## 4. Requisitos funcionales

### RF-01 — Vista informativa de Contactos

Cuando una persona navegue a **Contactos** desde el dashboard, el sistema deberá mostrar una sección
identificable como «Contactos», presentada como demostración e informativa, sin controles que
ejecuten acciones sobre contactos.

**Criterios de aceptación**

- La sección muestra el encabezado «Contactos» y comunica que su contenido es de demostración.
- Incluye una descripción breve del propósito de Contactos en FinApp, sin listas ni ejemplos
  ficticios.
- Se puede llegar a la sección desde la navegación de escritorio y desde el menú móvil.
- La vista no muestra listas ni ejemplos ficticios, no ofrece acciones sobre contactos y no afirma
  que existan datos o acciones reales.

### RF-02 — Vista informativa de Correos

Cuando una persona navegue a **Correos** desde el dashboard, el sistema deberá mostrar una sección
identificable como «Correos», presentada como demostración e informativa, sin controles que ejecuten
acciones sobre correos.

**Criterios de aceptación**

- La sección muestra el encabezado «Correos» y comunica que su contenido es de demostración.
- Incluye una descripción breve del propósito de Correos en FinApp, sin listas ni ejemplos
  ficticios.
- Se puede llegar a la sección desde la navegación de escritorio y desde el menú móvil.
- La vista no muestra listas ni ejemplos ficticios, no ofrece acciones sobre correos y no afirma
  que existan datos o acciones reales.

### RF-03 — Navegación móvil sin cambios estructurales

Cuando la persona use el dashboard en móvil, el sistema deberá conservar la barra inferior actual
con sus tres destinos y el botón «Menú»; Contactos y Correos se alcanzarán desde ese menú, sin añadir
un control a la barra.

**Criterios de aceptación**

- La barra inferior continúa mostrando tres controles de destino y un control «Menú».
- Al abrir el menú móvil, se puede navegar a Contactos y a Correos.
- Contactos y Correos no sustituyen ni añaden destinos a la barra inferior.

### RF-04 — Registro de fuentes desde Configuración

Cuando la persona active el acceso al registro de fuentes dentro de **Configuración**, el sistema
deberá abrir un modal de demostración con campos para correo y teléfono y un botón de demostración
sin envío. Su propósito será reunir información relacionada con conectar correos y registrar números
telefónicos.

**Criterios de aceptación**

- El acceso al modal está disponible dentro de Configuración.
- Al activarlo, se presenta una superficie modal identificable como registro de fuentes y su
  propósito incluye la conexión de correos y el registro de números telefónicos.
- El modal contiene un campo para correo, un campo para teléfono y un botón de demostración.
- Los campos permiten introducir texto, pero el botón no envía datos ni inicia una conexión o un
  registro efectivo.
- La interfaz no confirma una conexión, un registro efectivo ni una operación externa.
- No se presuponen nombres, formatos ni reglas de validación más específicos para los campos.

### RF-05 — Sin envío ni persistencia de datos

Cuando una persona interactúe con el modal de registro de fuentes, el sistema deberá mantener el
alcance en modo demostración: el botón no enviará los datos y el sistema no los guardará; al cerrar
el modal, borrará lo escrito.

**Criterios de aceptación**

- Al activar el botón de demostración no se produce envío de datos ni solicitud de conexión.
- Al cerrar el modal, se borran los valores introducidos; al abrirlo de nuevo, los campos están
  vacíos.
- Ningún mensaje de éxito presenta una conexión de correo o un registro telefónico como realizado.

### RF-06 — Avatar al pie de la sidebar de escritorio

Cuando el dashboard se presente en escritorio (ancho de 768 px o más), el sistema deberá mantener
el avatar separado de los enlaces y anclado a la parte inferior de la sidebar, tanto expandida como
colapsada.

**Criterios de aceptación**

- En escritorio, el avatar permanece en la zona inferior de la sidebar y separado del grupo de
  enlaces, incluso cuando la lista de enlaces no llena el alto disponible.
- La posición inferior se conserva en los estados expandido y colapsado de la sidebar.
- En móvil, el avatar aparece después de todos los enlaces y no queda anclado al fondo de la
  pantalla o del menú; su posición vertical puede cambiar al añadir enlaces.

## 5. Casos límite y riesgos

- **Contenido sin datos reales:** las vistas deben seguir comunicándose como demostración y no
  insinuar que muestran contactos o correos recuperados de una cuenta.
- **Uso del modal:** activar el botón o cerrar el modal no puede confundirse con un registro o
  conexión completados; el botón no envía datos y los valores escritos se borran al cerrar.
- **Navegación en pantallas estrechas:** Contactos y Correos deben seguir siendo accesibles desde el
  menú móvil sin alterar los cuatro controles actuales de la barra inferior.
- **Sidebar colapsada:** la posición inferior del avatar en escritorio debe conservarse aunque se
  oculten las etiquetas de los enlaces.
- **Menú móvil con más enlaces:** el avatar permanece al final del contenido de navegación, pero no
  necesariamente en la parte inferior visible del menú.

## 6. Límites acordados y detalles no especificados

Quedan definidos los dos tipos de campo (correo y teléfono), el botón de demostración sin envío y el
borrado de los valores al cerrar. No se han acordado etiquetas o formatos exactos, reglas de
validación ni texto literal de las descripciones de Contactos y Correos; esos detalles no deben
convertirse en listas, ejemplos ficticios, flujos de envío ni afirmaciones de operaciones reales.
