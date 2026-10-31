# Especificación: Conexión backend y capa de servicios

## Objetivo
Dividir lo implementado por tipo: diseño y servicio. Crear capa de servicios para consumir los endpoints del backend `finApp-backend` desde `finApp-web`, y aplicar ajustes de diseño en las páginas del dashboard.

## Alcance
- Configuración centralizada de endpoints en `src/config/api.config.js`
- Nueva capa de servicios: `src/services/httpServicio.js`, `usuarioServicio.js`, `grupoServicio.js`, `fuenteServicio.js`, `contactoServicio.js`
- Conexión de datos: `PaginaDashboardContactos` usa `contactoServicio`, `PaginaDashboardBolsillos` usa `grupoServicio`
- Ajustes de diseño: botón verde con ícono Plus en header de páginas del dashboard (excepto Inicio) con texto relacional
- Soporte a iconos: stub local `node_modules/lucide-react` para resolver imports

## Fuera de alcance
- Autenticación funcional completa
- Persistencia/transacciones reales
- Cambios en backend

## Componentes afectados
### Diseño
- `src/pages/PaginaDashboardTransacciones.jsx`
- `src/pages/PaginaDashboardTarjetas.jsx`
- `src/pages/PaginaDashboardContactos.jsx`
- `src/pages/PaginaDashboardCorreos.jsx`
- `src/pages/PaginaDashboardConfiguracion.jsx`
- `src/pages/PaginaDashboardBolsillos.jsx`

### Servicios
- `src/config/api.config.js`
- `src/services/httpServicio.js`
- `src/services/usuarioServicio.js`
- `src/services/grupoServicio.js`
- `src/services/fuenteServicio.js`
- `src/services/contactoServicio.js`

## Criterios de aceptación
- [ ] Endpoints mapeados correctamente a rutas del backend (`/usuario`, `/grupo`, `/fuente`, `/contacto`)
- [ ] Servicios exportan métodos CRUD/filtros según controladores
- [ ] Contactos se cargan desde backend con estados `cargando`/`error`
- [ ] Bolsillos/Grupos se cargan desde backend con estados `cargando`/`error`
- [ ] Botón verde con Plus aparece en headers de Transacciones, Tarjetas, Contactos, Correos, Configuración, Bolsillos (no en Inicio)
- [ ] Texto del botón es relacional a la página
- [ ] No se añaden dependencias nuevas
- [ ] Se sigue estructura, nombres en español y header JSDoc

## Verificación
- Revisar imports y uso de `getEndpoint`
- Verificar normalización de respuestas
- Confirmar estilos del botón coinciden con Bolsillos
