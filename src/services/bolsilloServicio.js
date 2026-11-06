import { getEndpoint } from "../config/api.config";
import { crear, obtener, actualizar, eliminar } from "./httpServicio";

const rutaBase = getEndpoint("bolsillo.base");

export function listarBolsillos() {
  return obtener(rutaBase);
}

export function crearBolsillo(bolsillo) {
  return crear(rutaBase, bolsillo);
}

export function actualizarBolsillo(idBolsillo, bolsillo) {
  return actualizar(`${rutaBase}/${encodeURIComponent(idBolsillo)}`, bolsillo);
}

export function eliminarBolsillo(idBolsillo) {
  return eliminar(`${rutaBase}/${encodeURIComponent(idBolsillo)}`);
}
