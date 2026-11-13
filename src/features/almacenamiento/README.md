# Feature: Almacenamiento

## Qué hace

Administra las cuentas de almacenamiento conectadas (Google Drive, OneDrive, Nextcloud) y
ofrece un navegador de archivos tipo Google Drive para gestionar archivos directamente desde
la app.

## Componentes

- `pages/AlmacenamientoPage`: listado de cuentas conectadas y vista de gestor de archivos.
- `components/files/AlmacenamientoSidebar`: navegación por vistas (Mi unidad, Recientes,
  Compartidos conmigo, Papelera).
- `components/files/AlmacenamientoToolbar`: búsqueda, alternancia de vista, crear y subir.
- `components/files/AlmacenamientoCrumbs`: migas de pan.
- `components/files/AlmacenamientoArchivos`: listado (cuadrícula/lista) y estados vacíos.
- `components/files/AlmacenamientoArchivoItem`: fila/carta de archivo o carpeta.
- `components/files/ContextoMenuArchivos`: acciones sobre selección (abrir, descargar, copiar,
  mover, renombrar, compartir, eliminar).
- `components/files/ModalPrevisualizacion`: previsualización y descarga de archivo.
- `components/modals/ModalGoogleDrive`: acceso al Drive conectado.

## Hook y servicio

- `hooks/useGestorArchivos`: estado del árbol de archivos y acciones (navegar, crear, subir,
  seleccionar, contexto, copiar/mover/eliminar).
- `services/almacenamientoServicio`: conexiones y OAuth con proveedores.

## API pública

`index.js` expone `AlmacenamientoPage` y `ModalGoogleDrive`.
