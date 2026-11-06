/**
 * @uso        Acceso a movimientos contables asociados a bolsillos
 * @funciones  listarMovimientos, crearMovimiento
 * @datos      Envía filtros de bolsillo/tipo y solicitudes de registro al backend
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   PaginaDashboardContabilidad
 */
import { getEndpoint } from "../config/api.config";
import { crear, obtener } from "./httpServicio";

const rutaBase = getEndpoint("movimiento.base");

/** Consulta los movimientos de un bolsillo y aplica el filtro seleccionado. */
export function listarMovimientos(idBolsillo, tipo = "TODOS") {
  const parametros = new URLSearchParams({ idBolsillo, tipo });
  return obtener(`${rutaBase}?${parametros.toString()}`);
}

/** Registra un movimiento financiero en un bolsillo propio. */
export function crearMovimiento(movimiento) {
  return crear(rutaBase, movimiento);
}
