/**
 * @uso        Operaciones HTTP de las conexiones de almacenamiento
 * @funciones  obtenerConexiones, desconectarCuenta
 * @datos      Delega transporte y rutas en httpServicio y api.config
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage
 */
import { getEndpoint } from "../../../config/api.config";
import { eliminar, obtener } from "../../../services/httpServicio";

export async function obtenerConexiones() {
  const respuesta = await obtener(getEndpoint("almacenamiento.conexiones"));
  return Array.isArray(respuesta) ? respuesta : respuesta?.datos || [];
}

export async function desconectarCuenta(id) {
  return eliminar(`${getEndpoint("almacenamiento.desconectar")}/${encodeURIComponent(id)}`);
}
