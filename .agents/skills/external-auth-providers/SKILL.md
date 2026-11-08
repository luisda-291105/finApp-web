---
name: external-auth-providers
description: Patrón de armado y edición para proveedores externos de autenticación (Google, Facebook, Apple, etc.) en finApp-web. Úsala al añadir, quitar o modificar un botón social, un servicio OAuth, el callback de login, la conexión de una cuenta externa o sus pruebas; conserva el divisor, el botón, los estados, la configuración, el flujo state/callback y la fidelidad visual al bloque original de Google.
---

# SKILL: external-auth-providers (finApp-web)

Contrato para integrar servicios externos sin romper el ensamblado del modal de acceso.
La referencia actual es Google en `features/auth`; Facebook, Apple o GitHub deben
reutilizar la misma estructura, el mismo orden y la misma caja visual.

La fidelidad al bloque original es parte del contrato: un proveedor nuevo no debe verse
como un rediseño, sino como el mismo botón con otro logo.

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

## Fidelidad al original

El original es el bloque de Google del `AuthModal`: formulario, divisor, botón blanco,
ayuda de registro, aviso de configuración y error externo. Al añadir otro proveedor se
conserva **todo** salvo el logo y el nombre.

### Medidas y clases que no cambian

| Pieza | Valor de referencia |
|---|---|
| Separación vertical del divisor | `my-5` (20px arriba y abajo) |
| Divisor | `flex items-center gap-3 text-xs text-white/60`; líneas `h-px flex-1 bg-white/10` |
| Texto del divisor | 12px; login «o continúa con», registro «o regístrate con» |
| Contenedor de proveedores | `flex flex-col gap-2`; una sola columna |
| Botón | `flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium` |
| Radio del botón | `rounded-xl` (12px) |
| Alto implícito | `py-3` + texto de 14px + icono de 20px |
| Icono | `h-5 w-5 shrink-0`, `aria-hidden="true"` |
| Superficie por defecto | Blanca, igual que Google |
| Ayuda de registro | `mt-2 text-center text-xs text-white/70` |
| Aviso sin configurar | `mt-2 text-xs text-amber-200`, `role="status"` |
| Error externo | `mt-3 rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-xs text-red-100` |

### Botón de Google: valores exactos

```css
.google-auth-button {
  border-color: #dadce0;
  background-color: #ffffff;
  color: #3c4043;
  box-shadow: 0 1px 2px rgb(60 64 67 / 20%);
}
.google-auth-button:hover:not(:disabled) {
  border-color: #c6c9ce;
  background-color: #f8f9fa;
  box-shadow: 0 2px 5px rgb(60 64 67 / 25%);
}
.google-auth-button:disabled {
  background-color: #ffffff;
  color: #5f6368;
  opacity: 0.85;
}
```

- El logo de Google son sus cuatro trazos oficiales; no se recolorea, no se mete en un
  círculo y no se cambia por un icono genérico.
- No añadas `bg-white` al botón: el fondo lo pone la clase del proveedor.
- No cambies `text-sm` por `text-xs` ni el `py-3` para “que quepa mejor”.

### Regla para Facebook, Apple y otros

Por defecto, el botón mantiene la **misma superficie blanca, borde, texto oscuro,
sombra y medidas** que Google. El único cambio es el logo oficial y el nombre del
proveedor.

- Facebook no se pinta azul y Apple no se pinta negro por defecto: eso rompe la
  fidelidad del bloque.
- Si la guía de marca del proveedor exige un color de fondo, pide aprobación explícita y
  conserva las medidas; documenta la excepción en el `README.md` del feature.
- Cualquier variante de color debe cumplir contraste AA y mantener el foco visible.

### Lo que no se toca al añadir un proveedor

- El orden: formulario → divisor → proveedores → ayudas.
- El texto del divisor y su `aria-hidden="true"`.
- El ancho completo y la altura del botón.
- El icono de 20×20 y el gap de 12px.
- La posición de la ayuda de registro y del aviso de configuración.
- El estilo del modal oscuro: `max-w-md`, `p-7 md:p-8`, `rounded-3xl`,
  `bg-[#0f1117]/95`, `border-white/15`, `text-white`, `backdrop-blur-xl`.
- El fondo y la tipografía del resto del modal.

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
    className="google-auth-button flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:cursor-not-allowed"
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
- La superficie por defecto es la de Google: fondo blanco, borde `#dadce0`, texto
  `#3c4043` y sombra suave. Ese es el patrón que se replica.
- El color de marca **no** se usa como fondo por defecto. El proveedor se identifica por
  su logo oficial, no por pintar el botón de otro color.
- Si una guía de marca exige fondo propio, la excepción va en una clase dedicada del CSS
  global, no en hexadecimales sueltos dentro del JSX, y requiere aprobación.
- Google conserva `.google-auth-button`; Facebook/Apple pueden compartir la misma clase
  base visual o una clase de marca que replique exactamente sus valores.
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
- Pintar Facebook de azul o Apple de negro sin aprobación, rompiendo el bloque blanco
  original.
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

## Validación visual

Antes de cerrar un proveedor nuevo, compara el bloque con el original de Google:

- El divisor queda a la misma distancia del formulario y del botón.
- El botón ocupa el mismo ancho, tiene el mismo alto, radio, padding y gap.
- El icono mide lo mismo y el texto arranca en la misma posición.
- La ayuda de registro y el aviso de configuración no cambian de sitio.
- El modal mantiene `max-w-md`, `p-7 md:p-8`, `rounded-3xl` y el fondo oscuro.
- Revisa 375px y escritorio; si no hay navegador disponible, informa que la validación
  visual no se realizó.

Si el resultado se ve como una tarjeta, una fila o un botón distinto, no es fiel al
original: vuelve a las clases de referencia.

## Checklist

- [ ] El divisor y el botón conservan la estructura y el orden canónicos.
- [ ] El botón usa las clases base compartidas y la superficie blanca del original.
- [ ] El nombre accesible incluye acción y proveedor.
- [ ] El icono es el oficial, 20×20 y `aria-hidden`.
- [ ] Los estados configurado/cargando/error/cancelado están cubiertos.
- [ ] El servicio pide `state`, carga el SDK una vez y no canjea tokens.
- [ ] Los endpoints y variables están registrados; el secreto solo en backend.
- [ ] El callback procesa el resultado una sola vez y limpia la URL.
- [ ] El backend valida state, verifica correo y rota la sesión.
- [ ] La validación visual confirma que el bloque se ve igual que el de Google.
- [ ] Pruebas focales, suite y build en verde.

## Referencias actuales

- `src/features/auth/components/modals/AuthModal.jsx` — divisor, botón Google, estados.
- `src/features/auth/services/authGoogleServicio.js` — state + SDK + redirect.
- `src/features/auth/pages/LoginPage.jsx` — callback `?google=`.
- `src/styles/index.css` — `.google-auth-button`.
- `src/config/api.config.js` — `googleAuth`.
- `finApp-backend/.../CAuthGoogle.java` y `SAuthGoogle.java` — state, canje y sesión.
- `src/services/gmailServicio.js` y `CGmail.java` — variante de cuenta conectada.
