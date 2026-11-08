# UI compartida

Esta carpeta reúne componentes visuales y accesibles que usan varias áreas de FinApp. Las funcionalidades deben importar desde `src/components/ui`, usando el `index.js` como entrada pública.

## Componentes

- `Card`: superficie visual reutilizable para agrupar contenido.
- `BotonCerrar`: control accesible de cierre para modales y paneles.
- `BotonServicioExterno`: botón blanco a ancho completo, con la marca de Google por defecto y opción de icono para otro proveedor. Conserva el mismo formato entre inicio de sesión y conexiones externas.
- `LimiteDeError`: límite de errores de renderizado y carga de rutas.

Mantén aquí solo piezas realmente compartidas. Los controles específicos de una funcionalidad van en su propio `src/features/<feature>/components`.
