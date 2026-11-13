/**
 * @uso        Operaciones HTTP de las conexiones de almacenamiento
 * @funciones  obtenerConexiones, desconectarCuenta, conectarGoogleDrive, iniciarConexion, completarConexion, conectarNextcloud
 * @datos      Delega transporte y rutas en httpServicio y api.config; el navegador solo recibe metadatos
 * @eventos    Popup de Google Identity Services (Drive) y redirección al proveedor (OneDrive)
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage y CuentasAlmacenamientoCard
 */
import { getEndpoint } from "../../../config/api.config";
import { crear, eliminar, obtener } from "../../../services/httpServicio";
import { prepararGoogleIdentityServices } from "../../../services/gmailServicio";

const ENCABEZADOS_SOLICITUD = { "X-Requested-With": "XmlHttpRequest" };
const ALCANCE_GOOGLE_DRIVE = "openid email profile";

/** Solo redirige a endpoints reales de autorización de Google (evita URLs de origen inválido). */
const ES_URL_AUTORIZACION_VALIDA = (url) => typeof url === "string" && /^https:\/\/accounts\.google\.com\/o\/oauth2\//i.test(url);

export async function obtenerConexiones() {
  const respuesta = await obtener(getEndpoint("almacenamiento.conexiones"));
  return Array.isArray(respuesta) ? respuesta : respuesta?.datos || [];
}

export async function desconectarCuenta(id) {
  return eliminar(`${getEndpoint("almacenamiento.desconectar")}/${encodeURIComponent(id)}`);
}

/** Pide al backend la URL de autorización del proveedor y redirige el navegador (OneDrive). */
export async function iniciarConexion(proveedor) {
  const inicio = await crear(getEndpoint("almacenamiento.iniciar"), { proveedor }, { headers: ENCABEZADOS_SOLICITUD });
  const url = inicio?.url;
  if (ES_URL_AUTORIZACION_VALIDA(url)) window.location.href = url;
  return inicio;
}

/** Canjea el código OAuth devuelto por el proveedor en la URL de retorno (OneDrive). */
export function completarConexion(code, state) {
  return crear(getEndpoint("almacenamiento.callback"), { proveedor: "", code, state }, { headers: ENCABEZADOS_SOLICITUD });
}

/** Conecta Google Drive con popup de Google Identity Services y canje en el backend. */
export function conectarGoogleDrive() {
  return new Promise(async (resolver, rechazar) => {
    try {
      await prepararGoogleIdentityServices();
      const cliente = window.google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: ALCANCE_GOOGLE_DRIVE,
        include_granted_scopes: false,
        ux_mode: "popup",
        prompt: "consent",
        callback: (respuesta) => {
          if (respuesta.error || !respuesta.code) {
            rechazar(new Error(
              respuesta.error === "access_denied"
                ? "Google denegó la autorización. Si la app está en modo de prueba, agrega tu cuenta como usuario de prueba y vuelve a intentar."
                : respuesta.error_description || "Google no autorizó la conexión de Drive."
            ));
            return;
          }
          resolver(crear(getEndpoint("almacenamiento.callback"),
            { proveedor: "GOOGLE_DRIVE", code: respuesta.code, state: "" }, { headers: ENCABEZADOS_SOLICITUD }));
        },
        error_callback: (respuesta) => {
          rechazar(new Error(
            respuesta.type === "popup_closed"
              ? "La ventana de Google se cerró antes de terminar. Vuelve a intentarlo."
              : respuesta.type === "popup_failed_to_open"
                ? "El navegador bloqueó la ventana de Google. Permite ventanas emergentes y vuelve a intentar."
                : respuesta.message || "No se completó la autorización de Google."
          ));
        },
      });
      cliente.requestCode();
    } catch (error) {
      rechazar(error instanceof Error ? error : new Error("No se pudo iniciar la autorización de Google."));
    }
  });
}

/** Conecta una cuenta Nextcloud con URL, usuario y contraseña de aplicación. */
export function conectarNextcloud(datos) {
  return crear(getEndpoint("almacenamiento.nextcloud"), datos, { headers: ENCABEZADOS_SOLICITUD });
}

