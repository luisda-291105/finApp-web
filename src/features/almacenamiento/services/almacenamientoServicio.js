/**
 * @uso        Operaciones HTTP de conexiones y archivos de almacenamiento en la nube
 * @funciones  obtenerConexiones, desconectarCuenta, conectarGoogleDrive, iniciarConexion, completarConexion, conectarNextcloud, listarArchivos, obtenerArchivo, urlContenido, urlPrevisualizacion, crearCarpeta, subirArchivo, renombrar, mover, copiar, enviarAPapelera, restaurar, vaciarPapelera, listarPermisos, compartir, revocarPermiso, operacionLote
 * @datos      Delega transporte y rutas en httpServicio y api.config; el navegador solo recibe metadatos y contenido/URLs provistos por backend
 * @eventos    Popup de Google Identity Services (Drive) y redirección al proveedor (OneDrive)
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage, useGestorArchivos y CuentasAlmacenamientoCard
 */
import { API_BASE_URL, getEndpoint } from "../../../config/api.config";
import { actualizar, crear, descargar, eliminar, obtener, subir } from "../../../services/httpServicio";
import { prepararGoogleIdentityServices } from "../../../services/gmailServicio";

const ENCABEZADOS_SOLICITUD = { "X-Requested-With": "XmlHttpRequest" };
const ALCANCE_GOOGLE_DRIVE = "openid email profile https://www.googleapis.com/auth/drive";

const baseCuenta = (cuentaId) => `${getEndpoint("almacenamiento.conexiones")}/${encodeURIComponent(cuentaId)}`;
const baseArchivos = (cuentaId) => `${baseCuenta(cuentaId)}/archivos`;

function conQuery(ruta, params = {}) {
  const consulta = new URLSearchParams();
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor === undefined || valor === null || valor === "") return;
    if (Array.isArray(valor)) valor.forEach((item) => consulta.append(clave, String(item)));
    else consulta.set(clave, String(valor));
  });
  const qs = consulta.toString();
  return qs ? `${ruta}?${qs}` : ruta;
}

function urlAbsoluta(ruta) {
  if (!ruta) return "";
  if (/^https?:\/\//i.test(ruta)) return ruta;
  if (API_BASE_URL.endsWith("/") && ruta.startsWith("/")) return `${API_BASE_URL}${ruta.slice(1)}`;
  if (!API_BASE_URL.endsWith("/") && !ruta.startsWith("/")) return `${API_BASE_URL}/${ruta}`;
  return `${API_BASE_URL}${ruta}`;
}

export async function obtenerConexiones() {
  const respuesta = await obtener(getEndpoint("almacenamiento.conexiones"));
  return Array.isArray(respuesta) ? respuesta : respuesta?.datos || respuesta?.data || [];
}

export async function desconectarCuenta(id) {
  return eliminar(`${getEndpoint("almacenamiento.desconectar")}/${encodeURIComponent(id)}`);
}

export async function iniciarConexion(proveedor) {
  const inicio = await crear(getEndpoint("almacenamiento.iniciar"), { proveedor }, { headers: ENCABEZADOS_SOLICITUD });
  const url = inicio?.url || inicio?.datos?.url;
  if (typeof url === "string" && /^https:\/\/accounts\.google\.com\/o\/oauth2\//i.test(url)) window.location.href = url;
  return inicio;
}

export function completarConexion(code, state) {
  return crear(getEndpoint("almacenamiento.callback"), { proveedor: "", code, state }, { headers: ENCABEZADOS_SOLICITUD });
}

export async function listarArchivos(cuentaId, params = {}) {
  if (!cuentaId) throw new Error("Selecciona una cuenta de almacenamiento.");
  const respuesta = await obtener(conQuery(baseArchivos(cuentaId), params));
  return respuesta?.datos || respuesta?.data || respuesta || [];
}

export async function obtenerArchivo(cuentaId, archivoId) {
  const respuesta = await obtener(`${baseArchivos(cuentaId)}/${encodeURIComponent(archivoId)}`);
  return respuesta?.datos || respuesta?.data || respuesta;
}

export function urlContenido(cuentaId, archivoId) {
  return urlAbsoluta(`${baseArchivos(cuentaId)}/${encodeURIComponent(archivoId)}/contenido`);
}

export function urlPrevisualizacion(cuentaId, archivoId) {
  return urlAbsoluta(`${baseArchivos(cuentaId)}/${encodeURIComponent(archivoId)}/previsualizacion`);
}

export async function crearCarpeta(cuentaId, datos) {
  const respuesta = await crear(`${baseArchivos(cuentaId)}/carpeta`, datos, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function subirArchivo(cuentaId, formData) {
  const respuesta = await subir(baseArchivos(cuentaId), formData, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function renombrar(cuentaId, archivoId, nombre) {
  const respuesta = await actualizar(`${baseArchivos(cuentaId)}/${encodeURIComponent(archivoId)}/renombrar`, { nombre }, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function mover(cuentaId, datos) {
  const respuesta = await actualizar(`${baseArchivos(cuentaId)}/mover`, datos, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function copiar(cuentaId, datos) {
  const respuesta = await crear(`${baseArchivos(cuentaId)}/copiar`, datos, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function enviarAPapelera(cuentaId, datos) {
  const respuesta = await actualizar(`${baseArchivos(cuentaId)}/papelera`, datos, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function restaurar(cuentaId, datos) {
  const respuesta = await actualizar(`${baseArchivos(cuentaId)}/restaurar`, datos, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function vaciarPapelera(cuentaId) {
  const respuesta = await eliminar(`${baseArchivos(cuentaId)}/papelera`, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function listarPermisos(cuentaId, archivoId) {
  const respuesta = await obtener(`${baseArchivos(cuentaId)}/${encodeURIComponent(archivoId)}/permisos`);
  return respuesta?.datos || respuesta?.data || respuesta || [];
}

export async function compartir(cuentaId, archivoId, datos) {
  const respuesta = await crear(`${baseArchivos(cuentaId)}/${encodeURIComponent(archivoId)}/permisos`, datos, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function revocarPermiso(cuentaId, archivoId, permisoId) {
  const respuesta = await eliminar(`${baseArchivos(cuentaId)}/${encodeURIComponent(archivoId)}/permisos/${encodeURIComponent(permisoId)}`, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function operacionLote(cuentaId, datos) {
  const respuesta = await crear(`${baseArchivos(cuentaId)}/lote`, datos, { headers: ENCABEZADOS_SOLICITUD });
  return respuesta?.datos || respuesta?.data || respuesta;
}

export async function descargarArchivo(cuentaId, archivoId) {
  return descargar(`${baseArchivos(cuentaId)}/${encodeURIComponent(archivoId)}/contenido`);
}

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

export function conectarNextcloud(datos) {
  return crear(getEndpoint("almacenamiento.nextcloud"), datos, { headers: ENCABEZADOS_SOLICITUD });
}

// Compatibilidad temporal con código que aún espera obtenerArchivos.
export async function obtenerArchivos(cuentaId) {
  return listarArchivos(cuentaId);
}

