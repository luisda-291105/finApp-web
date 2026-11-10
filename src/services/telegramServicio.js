import { getEndpoint } from "../config/api.config";
import { crear, eliminar, obtener } from "./httpServicio";

const rutaBase = getEndpoint("telegram.base");

export function obtenerEstadoTelegram() {
  return obtener(`${rutaBase}/estado`);
}

export function obtenerMensajesTelegram() {
  return obtener(`${rutaBase}/mensajes`);
}

export function crearEnlaceTelegram() {
  return crear(`${rutaBase}/enlace`, {});
}

export function desvincularTelegram() {
  return eliminar(`${rutaBase}/enlace`);
}

export function enviarMensajeTelegram(texto, grupo) {
  return crear(`${rutaBase}/mensajes`, { texto, grupo });
}
