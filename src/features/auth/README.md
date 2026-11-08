# Feature: Autenticación

Agrupa la entrada `/login` y el modal de acceso compartido con la landing `/`.

## Estructura

- `pages/LoginPage`: procesa el retorno OAuth de Google, valida la sesión recibida y presenta el acceso en modo login.
- `components/modals/AuthModal`: administra el modal, las pestañas, el estado compartido y el acceso con Google.
- `components/forms/LoginForm`: presenta los campos y el envío para iniciar sesión.
- `components/forms/RegistroForm`: presenta los campos y el envío para crear una cuenta.
- `services/usuarioServicio`: administra registro, inicio y cierre de sesión, consulta de sesión activa y operaciones del perfil de usuario.
- `services/authGoogleServicio`: prepara y procesa el inicio de sesión con Google.
- `index.js`: publica la página y el modal para las rutas y la landing.

El contexto de sesión global consume los servicios desde el punto de entrada público del feature. El transporte HTTP compartido sigue en `src/services/httpServicio`.
