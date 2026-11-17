# Feature: Almacenamiento

## Qué hace

Administra las cuentas de almacenamiento conectadas (Google Drive, OneDrive, Nextcloud) y
ofrece un navegador de archivos tipo Google Drive para gestionar archivos desde la app.

## Componentes

- `pages/AlmacenamientoPage`: selector multicuenta con estado (ACTIVA/REQUIERE_RECONEXION), reconexión, navegación de archivos y acciones en lote.
- `components/files/AlmacenamientoSidebar`: vistas Mi unidad, Recientes, Compartidos conmigo, Destacados y Papelera.
- `components/files/AlmacenamientoToolbar`: búsqueda, modo lista/cuadrícula, crear y subir con progreso; en móvil el interruptor queda forzado a lista.
- `components/alert/AlertaVistaMovil`: aviso temporal (4 s) top-right que aparece al intentar cambiar de vista en móvil.
- `components/files/AlmacenamientoCrumbs`: migas de pan navegables.
- `components/files/AlmacenamientoArchivos`: listado y estados de carga, vacío y error por vista.
- `components/files/AlmacenamientoArchivoItem`: fila/carta con selección, apertura y renombrado.
- `components/files/ContextoMenuArchivos`: acciones (abrir, descargar, copiar, mover, renombrar, compartir, eliminar/restaurar).
- `components/modals/ModalPrevisualizacion`: previsualización inline (imagen/PDF) o enlace externo, edición inline del nombre (y acción «Eliminar» dentro de la edición); descarga real.
- `components/modals/ModalCompartir`: gestión de permisos, roles y enlace.
- `components/modals/ModalMover`: selección de carpeta destino para mover/copiar.
- `components/modals/ModalGoogleDrive`: acceso al Drive y mensaje de reconexión/scope.

## Hook y servicio

- `hooks/useGestorArchivos`: estado por cuenta/vista/carpeta, búsqueda, orden, selección y acciones remotas.
- `services/almacenamientoServicio`: conexiones, archivos, contenido, permisos y operaciones por lote vía backend.

## API pública

`index.js` expone `AlmacenamientoPage` y `ModalGoogleDrive`.
