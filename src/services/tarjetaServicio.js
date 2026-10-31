/**
 * @uso        Servicio para registrar y consultar tarjetas del backend
 * @funciones  crearTarjeta, obtenerTarjetasPorUsuario
 * @datos      Usa rutas de api.config y httpServicio
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   ModalRegistroEntidad y páginas del dashboard
 */
import { getEndpoint } from "../config/api.config";
import { crear, obtener } from "./httpServicio";

export function crearTarjeta(tarjeta) {
  return crear(getEndpoint("tarjeta.base"), tarjeta);
}

export function obtenerTarjetasPorUsuario(idUsuario) {
  return obtener(`${getEndpoint("tarjeta.porUsuario")}/${encodeURIComponent(idUsuario)}`);
}
