# Feature: Autenticación

Agrupa la entrada `/login` y el modal de acceso compartido con la landing `/`.

## Estructura

- `pages/LoginPage`: procesa el retorno OAuth de Google, valida la sesión recibida y presenta el acceso en modo login.
- `components/modals/AuthModal`: administra el modal, las pestañas, el estado compartido y el acceso con Google.
- `components/forms/LoginForm`: presenta los campos y el envío para iniciar sesión.
- `components/forms/RegistroForm`: presenta los campos y el envío para crear una cuenta.
- `index.js`: publica la página y el modal para las rutas y la landing.

Los servicios de usuario y Google, el contexto de sesión y los hooks de foco/cierre continúan en sus ubicaciones comunes porque otras partes de la app los consumen.
