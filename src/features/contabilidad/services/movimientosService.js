/**
 * @uso        Acceso a movimientos contables asociados a bolsillos
 * @funciones  listarMovimientos, listarCorreosImportados, crearMovimiento, obtenerResumenesBolsillos
 * @datos      Envía filtros y solicitudes de registro al backend y consulta totales por bolsillo
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   PaginaDashboardContabilidad
 */
import { getEndpoint } from "../../../config/api.config";
import { crear, obtener, actualizar, eliminar } from "../../../services/httpServicio";

const rutaBase = getEndpoint("movimiento.base");
const rutaResumen = getEndpoint("movimiento.resumen");

/** Consulta todos los movimientos o los de un bolsillo opcional y aplica el filtro de tipo. */
export function listarMovimientos(idBolsillo, tipo = "TODOS") {
  const parametros = new URLSearchParams({ tipo });
  if (idBolsillo) parametros.set("idBolsillo", idBolsillo);
  return obtener(`${rutaBase}?${parametros.toString()}`);
}

/** Registra un movimiento financiero en un bolsillo propio. */
export function crearMovimiento(movimiento) {
  return crear(rutaBase, movimiento);
}

/** Consulta cuáles referencias Gmail ya se registraron para el usuario activo. */
export function listarCorreosImportados(ids) {
  if (!ids?.length) return Promise.resolve([]);
  const parametros = new URLSearchParams();
  ids.forEach((id) => parametros.append("ids", id));
  return obtener(`${rutaBase}/correos?${parametros.toString()}`);
}

/** Actualiza un movimiento propio del usuario activo. */
export function actualizarMovimiento(idMovimiento, movimiento) {
  return actualizar(`${rutaBase}/${encodeURIComponent(idMovimiento)}`, movimiento);
}

/** Elimina un movimiento propio del usuario activo. */
export function eliminarMovimiento(idMovimiento) {
  return eliminar(`${rutaBase}/${encodeURIComponent(idMovimiento)}`);
}

/** Consulta cantidad y totales por cada bolsillo del usuario activo. */
export function obtenerResumenesBolsillos() {
  return obtener(rutaResumen);
}
