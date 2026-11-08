# Feature: Landing

Contiene la página pública de inicio `/` y las secciones que explican la aplicación.

## Estructura

- `pages/LandingPage`: coordina la apertura del modal de autenticación, el asistente y el foco de destino.
- `components/layouts/LandingLayout`: ensambla navegación, secciones y pie de página.
- `components/sections`: Hero, estadísticas, funcionalidades, pasos, CTA y footer.
- `index.js`: entrada pública usada por la ruta `/`.

El Header, el modal de autenticación, el asistente, los hooks y componentes UI compartidos se conservan en sus ubicaciones comunes porque se usan desde otras áreas.
