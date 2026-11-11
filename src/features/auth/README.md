# Feature: Autenticación

Agrupa la entrada `/login` y el modal de acceso compartido con la landing `/`.

## Estructura

- `pages/LoginPage`: procesa el retorno OAuth de Google, valida el JWT recibido como cookie HttpOnly y presenta el acceso en modo login.
- `components/modals/AuthModal`: administra el modal, las pestañas, el estado compartido y el acceso con Google.
- `components/forms/LoginForm`: presenta los campos y el envío para iniciar sesión.
- `components/forms/RegistroForm`: presenta los campos y el envío para crear una cuenta.
- `services/usuarioServicio`: administra registro, inicio y cierre de sesión JWT, consulta de usuario activo y operaciones del perfil.
- `services/authGoogleServicio`: prepara y procesa el inicio de sesión con Google.
- `index.js`: publica la página y el modal para las rutas y la landing.

El backend entrega el JWT en una cookie `FINAPP_AUTH` HttpOnly y valida cada operación protegida. El navegador no guarda el token en `localStorage` ni en `sessionStorage`; el indicador local solo evita consultar `/usuario/activo` cuando no se ha iniciado sesión en la aplicación. La cookie transitoria de sesión del servidor se usa únicamente para validar el `state` del flujo OAuth de Google. Configura `FINAPP_JWT_SECRET` en el backend con una clave aleatoria Base64 de al menos 256 bits y activa `FINAPP_JWT_COOKIE_SECURE` en producción. El contexto global consume los servicios desde el punto de entrada público del feature; el transporte HTTP compartido sigue en `src/services/httpServicio`.
