/**
 * @uso        Operaciones HTTP propias de tarjetas
 * @funciones  crearTarjeta, obtenerTarjetasPorUsuario, actualizarTarjeta, eliminarTarjeta
 * @datos      Delega transporte y rutas en capas compartidas
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   useTarjetas y CrearTarjetaModal
 */
import { getEndpoint } from "../../../config/api.config";
import { crear, obtener, actualizar, eliminar } from "../../../services/httpServicio";

/** @param {object} tarjeta */
export function crearTarjeta(tarjeta) {
  return crear(getEndpoint("tarjeta.base"), tarjeta);
}

/** @param {string|number} idUsuario */
export function obtenerTarjetasPorUsuario(idUsuario) {
  return obtener(`${getEndpoint("tarjeta.porUsuario")}/${encodeURIComponent(idUsuario)}`);
}

/** @param {string|number} idTarjeta @param {object} tarjeta */
export function actualizarTarjeta(idTarjeta, tarjeta) {
  return actualizar(`${getEndpoint("tarjeta.base")}/${encodeURIComponent(idTarjeta)}`, tarjeta);
}

/** @param {string|number} idTarjeta */
export function eliminarTarjeta(idTarjeta) {
  return eliminar(`${getEndpoint("tarjeta.base")}/${encodeURIComponent(idTarjeta)}`);
}
