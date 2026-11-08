---
name: external-auth-providers
description: Patrón de armado y edición para proveedores externos de autenticación (Google, Facebook, Apple, etc.) en finApp-web. Úsala al añadir, quitar o modificar un botón social, un servicio OAuth, el callback de login, la conexión de una cuenta externa o sus pruebas; conserva el divisor, el botón, los estados, la configuración y el flujo state/callback.
---

# SKILL: external-auth-providers (finApp-web)

Contrato para integrar servicios externos sin romper el ensamblado del modal de acceso.
La referencia actual es Google en `features/auth`; Facebook, Apple o GitHub deben
reutilizar la misma estructura y el mismo orden visual.

## Cuándo usarla

- Añadir un proveedor social al modal de login/registro.
- Modificar el botón, el divisor «o continúa con», el estado de carga o el error de un
  proveedor existente.
- Crear un servicio OAuth de proveedor y su callback.
- Conectar una cuenta externa ya autenticada (por ejemplo Gmail).
- Revisar que un proveedor nuevo no rompa el patrón de Google.

No la uses para botones genéricos ni para servicios internos de FinApp.

## Regla de oro

El proveedor cambia; el ensamblado no. Todo proveedor conserva:

1. Formulario de FinApp.
2. Divisor «o continúa con» / «o regístrate con».
3. Botón de proveedor a ancho completo, con el mismo alto, radio, gap y tipografía.
4. Ayuda contextual del modo.
5. Aviso de configuración ausente.
6. Mensaje de error externo, si lo hay.

No muevas el divisor encima del formulario, no pongas el botón dentro del `<form>` y no
cambies el orden por proveedor.

## Estructura visual canónica

```jsx
<form>{/* LoginForm o RegistroForm */}</form>

<div className="my-5 flex items-center gap-3 text-xs text-white/60" aria-hidden="true">
  <span className="h-px flex-1 bg-white/10" />
  <span>{modo === "registro" ? "o regístrate con" : "o continúa con"}</span>
  <span className="h-px flex-1 bg-white/10" />
</div>

<div className="flex flex-col gap-2">
  <button
    type="button"
    onClick={manejarProveedor}
    disabled={cargando || !PROVEEDOR_CONFIGURADO}
    className="provider-button flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:cursor-not-allowed"
  >
    <IconoProveedor className="h-5 w-5 shrink-0" aria-hidden="true" />
    {cargando ? "Conectando con Proveedor…" : "Iniciar sesión con Proveedor"}
  </button>
</div>
```

- El divisor es decorativo: `aria-hidden="true"` y sin rol de botón.
- El botón va fuera del formulario, después del divisor y antes de las ayudas.
- Con varios proveedores, se apilan dentro de `flex flex-col gap-2`; todos usan el mismo
  ancho, alto, radio y separación.
- El icono mide 20×20, no se recolorea y lleva `aria-hidden="true"`.
- El nombre accesible del botón incluye acción y proveedor:
  - Login: `Iniciar sesión con Google`.
  - Registro: `Registrarse con Google`.
  - Carga: `Conectando con Google…`.
- Nunca uses solo el logo como etiqueta accesible.

## Estilo por proveedor

- El botón base es estructural y compartido: `w-full`, `rounded-xl`, `px-4`, `py-3`,
  `text-sm`, `font-medium`, icono + texto centrados.
- El color de marca es una excepción permitida, pero va en una clase dedicada del CSS
  global, no en hexadecimales sueltos dentro del JSX.
- Google conserva `.google-auth-button` (fondo blanco, borde `#dadce0`, texto `#3c4043`,
  hover gris claro). Es la referencia visual del modal oscuro.
- Facebook, Apple u otro proveedor deben mantener la misma caja y solo cambiar la
  superficie/logo oficial. Si el fondo de marca no alcanza contraste AA, usa una
  superficie clara con el logo oficial y texto oscuro; no sacrifiques legibilidad.
- No uses `.glass-*` para el botón del proveedor: no es una superficie Fluid Glass.
- No agregues sombras, alturas ni radios distintos por proveedor.

## Estados

- `configurado`: el botón se habilita solo si el proveedor tiene su variable pública
  (`VITE_<PROVEEDOR>_CLIENT_ID` o equivalente).
- `sin configurar`: el botón queda `disabled` y aparece un `role="status"`:
  «Proveedor no está configurado para este entorno.». No lo ocultes sin explicación.
- `cargando`: se deshabilitan todos los proveedores para evitar dobles clics; el label
  cambia a «Conectando con Proveedor…» sin alterar el alto.
- `error`: se muestra en el `role="alert"` existente del modal (`mensajeExterno`) o en el
  mensaje del formulario, con texto en español y sin detalles internos.
- `cancelado`: se informa como cancelación, no como fallo genérico.

## Servicio del proveedor

Ubicación: `src/features/auth/services/auth<Proveedor>Servicio.js`.

```js
import { getEndpoint } from "../../../config/api.config";
import { obtener } from "../../../services/httpServicio";

export const PROVEEDOR_AUTH_CONFIGURADO = Boolean(import.meta.env.VITE_PROVEEDOR_CLIENT_ID);

export async function iniciarLoginProveedor() {
  if (!PROVEEDOR_AUTH_CONFIGURADO) {
    throw new Error("Falta configurar VITE_PROVEEDOR_CLIENT_ID para habilitar Proveedor.");
  }
  const respuesta = await obtener(getEndpoint("proveedorAuth.state"));
  const state = respuesta?.datos?.state;
  if (!state) throw new Error("No se pudo preparar la verificación segura de Proveedor.");
  await cargarSdkProveedor();
  // initCodeClient / FB.login / AppleID.auth según el SDK.
  // El canje del código y los secretos viven en el backend.
}
```

Reglas:

- El cliente solo inicia el flujo y recibe el código; **nunca** canjea tokens con el
  secreto ni guarda tokens en `localStorage`.
- El SDK se carga una sola vez y se reutiliza si ya está en `window`.
- El cargador debe detectar un `<script>` existente, resolver la promesa una vez y
  reiniciar la caché si falla.
- El `state` se pide al backend y se envía al proveedor.
- El `redirect_uri` sale de `getEndpoint("<proveedor>Auth.callback")` o de una variable
  explícita; no se hardcodea.
- Los alcances se declaran en el servicio, no en el componente.
- No copies la API de Google para Facebook/Apple: conserva el contrato (state, código,
  callback), no la implementación del SDK.

## Endpoints y configuración

Registra el proveedor en `src/config/api.config.js`:

```js
proveedorAuth: {
  state: "/api/auth/proveedor/state",
  callback: "/api/auth/proveedor/callback",
},
```

Variables:

- Frontend: `VITE_<PROVEEDOR>_CLIENT_ID` (pública) y, si aplica,
  `VITE_<PROVEEDOR>_AUTH_REDIRECT_URI`.
- Backend: `<PROVEEDOR>_CLIENT_ID`, `<PROVEEDOR>_CLIENT_SECRET` y
  `<PROVEEDOR>_AUTH_REDIRECT_URI`.
- Un secreto nunca lleva prefijo `VITE_` ni se escribe en `.env` versionado.

## Flujo OAuth canónico

1. El usuario pulsa el botón.
2. El frontend pide `state` al backend.
3. Carga el SDK del proveedor (una sola vez).
4. Inicia la autorización con `client_id`, alcances, `redirect_uri` y `state`.
5. El proveedor redirige al callback del backend con `code` y `state`.
6. El backend valida `state` contra la sesión, consume el código, verifica el perfil y
   crea o vincula la cuenta.
7. El backend rota la sesión (`changeSessionId`) y redirige a la web con un resultado
   (`?proveedor=success|cancelled|failed`).
8. `LoginPage` procesa el resultado una sola vez, limpia la query, verifica la sesión
   activa y navega al dashboard.

## Callback en el frontend

En `LoginPage`, reutiliza el patrón de Google:

- Lee el parámetro una vez y guárdalo en un `ref` para no repetir la verificación.
- `cancelled` → mensaje de cancelación, sin llamar a `obtenerUsuarioActivo`.
- `failed` o valor desconocido → mensaje genérico y `navigate(..., { replace: true })`.
- `success` → marca la pestaña como activa, llama a `obtenerUsuarioActivo`, guarda el
  usuario y navega al dashboard; si falla, limpia la marca y muestra el error.
- No dejes el parámetro en la URL.

## Seguridad del backend

- `state` impredecible, guardado en la sesión y comparado en tiempo constante.
- Consumir y borrar el `state` una sola vez.
- Canje del código y `client_secret` solo en el servidor.
- Verificar correo del proveedor antes de crear/vincular.
- Resolver conflictos de correo con un mensaje explícito; no auto-vincular cuentas por
  email sin decisión de producto.
- Validar origen permitido y, en conexiones autenticadas, la cabecera
  `X-Requested-With`.
- No registrar tokens, códigos, secretos ni perfiles completos.
- Errores al cliente genéricos; el detalle va al log del servidor.

## Conexión de cuenta ya autenticada

Si el servicio no crea sesión sino que conecta una cuenta (Gmail, calendario, etc.):

- Exige usuario FinApp autenticado.
- Usa popup si el proveedor lo permite y prepara el SDK antes del gesto.
- Guarda el refresh token cifrado en el backend; mantén el access token en memoria.
- Ofrece desconectar y borrar la conexión.
- Reutiliza el patrón visual de botón de proveedor, pero en la pantalla de configuración,
  no en el modal de login.

## Cómo añadir Facebook (o cualquier proveedor)

1. Define nombre, scopes, redirect URI y variables de entorno.
2. Registra `facebookAuth.state` y `facebookAuth.callback` en `api.config`.
3. Crea `authFacebookServicio.js` con el contrato de `authGoogleServicio`.
4. Añade el botón al bloque de proveedores del `AuthModal`, con el mismo ensamblado.
5. Añade el manejo de `?facebook=...` en `LoginPage` sin duplicar la lógica de Google;
   extrae un helper si el callback se repite.
6. Implementa state + canje + sesión en el backend.
7. Añade pruebas de botón, servicio y callback.
8. Actualiza el `README.md` del feature.

Si hay dos o más proveedores, considera un registro local en el modal:

```js
const PROVEEDORES_EXTERNOS = [
  { id: "google", etiqueta: "Google", Icono: GoogleIcon, configurado: GOOGLE_AUTH_CONFIGURADO, iniciar: iniciarLoginGoogle },
  { id: "facebook", etiqueta: "Facebook", Icono: FacebookIcon, configurado: FACEBOOK_AUTH_CONFIGURADO, iniciar: iniciarLoginFacebook },
];
```

Renderiza el mismo bloque para todos; no escribas una rama JSX distinta por proveedor.

## Pruebas mínimas

- **Componente:** el botón tiene el nombre accesible correcto en login y registro; al
  hacer clic llama al servicio una sola vez; sin configuración está deshabilitado y
  muestra el aviso; en carga cambia el label y se deshabilita.
- **Servicio:** pide `state`, carga el SDK una vez, usa el `redirect_uri` y los scopes
  correctos; sin `state` o sin configuración rechaza.
- **Callback:** `success` verifica sesión y navega; `cancelled` y `failed` muestran el
  mensaje; el parámetro se procesa una sola vez.
- **Backend:** state inválido/expirado, error de canje, correo no verificado, conflicto de
  cuenta y rotación de sesión.
- Ejecuta `npx vitest run <ruta>`, `npm test` y `npm run build`.

## Antipatrones

- Añadir Facebook con otro alto, otro radio, otro gap u otro orden.
- Poner el botón dentro del formulario o antes del divisor.
- Ocultar el botón sin configurar en vez de explicar el estado.
- Usar solo el logo, sin nombre accesible.
- Recolorear el logo oficial o inventar la marca.
- Duplicar el cargador del SDK en cada proveedor.
- Canjear el código o guardar el secreto en el frontend.
- Guardar tokens en `localStorage` o imprimirlos en consola.
- Procesar el callback dos veces por no limpiar la query.
- Crear una cuenta nueva sin comprobar el conflicto de correo.
- Cambiar el flujo de Google al añadir otro proveedor.

## Checklist

- [ ] El divisor y el botón conservan la estructura y el orden canónicos.
- [ ] El botón usa las clases base compartidas y una clase de marca dedicada.
- [ ] El nombre accesible incluye acción y proveedor.
- [ ] El icono es el oficial, 20×20 y `aria-hidden`.
- [ ] Los estados configurado/cargando/error/cancelado están cubiertos.
- [ ] El servicio pide `state`, carga el SDK una vez y no canjea tokens.
- [ ] Los endpoints y variables están registrados; el secreto solo en backend.
- [ ] El callback procesa el resultado una sola vez y limpia la URL.
- [ ] El backend valida state, verifica correo y rota la sesión.
- [ ] Pruebas focales, suite y build en verde.

## Referencias actuales

- `src/features/auth/components/modals/AuthModal.jsx` — divisor, botón Google, estados.
- `src/features/auth/services/authGoogleServicio.js` — state + SDK + redirect.
- `src/features/auth/pages/LoginPage.jsx` — callback `?google=`.
- `src/styles/index.css` — `.google-auth-button`.
- `src/config/api.config.js` — `googleAuth`.
- `finApp-backend/.../CAuthGoogle.java` y `SAuthGoogle.java` — state, canje y sesión.
- `src/services/gmailServicio.js` y `CGmail.java` — variante de cuenta conectada.
