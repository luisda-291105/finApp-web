# Plan: Conexión backend y capa de servicios

## Fase 1: Diseño (UI/Headers)
- [x] Añadir botón verde con ícono Plus en header de `PaginaDashboardTransacciones` ("Nueva transacción")
- [x] Añadir botón verde con ícono Plus en header de `PaginaDashboardTarjetas` ("Nueva tarjeta")
- [x] Añadir botón verde con ícono Plus en header de `PaginaDashboardContactos` ("Nuevo contacto")
- [x] Añadir botón verde con ícono Plus en header de `PaginaDashboardCorreos` ("Nuevo correo")
- [x] Añadir botón verde con ícono Plus en header de `PaginaDashboardConfiguracion` ("Agregar configuración")
- [x] Mantener botón "Nuevo bolsillo" en `PaginaDashboardBolsillos`
- [x] No modificar header de `PaginaDashboardInicio`

## Fase 2: Servicios (Backend)
- [x] Actualizar `src/config/api.config.js` con rutas reales del backend
- [x] Crear `src/services/httpServicio.js` (GET/POST/PUT/DELETE)
- [x] Crear `src/services/usuarioServicio.js`
- [x] Crear `src/services/grupoServicio.js`
- [x] Crear `src/services/fuenteServicio.js`
- [x] Crear `src/services/contactoServicio.js`

## Fase 3: Integración
- [x] Conectar `PaginaDashboardContactos` a `contactoServicio`
- [x] Conectar `PaginaDashboardBolsillos` a `grupoServicio`
- [x] Añadir estados `cargando`/`error` y normalización de respuestas

## Fase 4: Soporte
- [x] Crear stub `node_modules/lucide-react` para resolver iconos

## Verificación
- [x] Código sigue convenciones (header JSDoc, nombres en español, sin hardcode URLs)
- [ ] Tests/build ejecutados (pendiente por entorno sin Node/npm)
