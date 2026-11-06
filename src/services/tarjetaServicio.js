/**
 * @uso        Servicio para gestionar tarjetas propias en el backend
 * @funciones  crearTarjeta, obtenerTarjetasPorUsuario, actualizarTarjeta, eliminarTarjeta
 * @datos      Usa rutas de api.config y httpServicio
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   ModalRegistroEntidad y páginas del dashboard
 */
import { getEndpoint } from "../config/api.config";
import { crear, obtener, actualizar, eliminar } from "./httpServicio";

export function crearTarjeta(tarjeta) {
  return crear(getEndpoint("tarjeta.base"), tarjeta);
}

export function obtenerTarjetasPorUsuario(idUsuario) {
  return obtener(`${getEndpoint("tarjeta.porUsuario")}/${encodeURIComponent(idUsuario)}`);
}

export function actualizarTarjeta(idTarjeta, tarjeta) {
  return actualizar(`${getEndpoint("tarjeta.base")}/${encodeURIComponent(idTarjeta)}`, tarjeta);
}

export function eliminarTarjeta(idTarjeta) {
  return eliminar(`${getEndpoint("tarjeta.base")}/${encodeURIComponent(idTarjeta)}`);
}
