/**
 * @uso        Operaciones HTTP de las conexiones de almacenamiento
 * @funciones  obtenerConexiones, desconectarCuenta, iniciarConexion, completarConexion, conectarNextcloud
 * @datos      Delega transporte y rutas en httpServicio y api.config
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage y ConectarAlmacenamientoCard
 */
import { getEndpoint } from "../../../config/api.config";
import { crear, eliminar, obtener } from "../../../services/httpServicio";

const ENCABEZADOS_SOLICITUD = { "X-Requested-With": "XmlHttpRequest" };

export async function obtenerConexiones() {
  const respuesta = await obtener(getEndpoint("almacenamiento.conexiones"));
  return Array.isArray(respuesta) ? respuesta : respuesta?.datos || [];
}

export async function desconectarCuenta(id) {
  return eliminar(`${getEndpoint("almacenamiento.desconectar")}/${encodeURIComponent(id)}`);
}

/** Pide al backend la URL de autorización del proveedor y redirige el navegador. */
export async function iniciarConexion(proveedor) {
  const inicio = await crear(getEndpoint("almacenamiento.iniciar"), { proveedor }, { headers: ENCABEZADOS_SOLICITUD });
  if (inicio?.url) window.location.href = inicio.url;
  return inicio;
}

/** Canjea el código OAuth devuelto por el proveedor en la URL de retorno. */
export function completarConexion(code, state) {
  return crear(getEndpoint("almacenamiento.callback"), { code, state }, { headers: ENCABEZADOS_SOLICITUD });
}

/** Conecta una cuenta Nextcloud con URL, usuario y contraseña de aplicación. */
export function conectarNextcloud(datos) {
  return crear(getEndpoint("almacenamiento.nextcloud"), datos, { headers: ENCABEZADOS_SOLICITUD });
}
