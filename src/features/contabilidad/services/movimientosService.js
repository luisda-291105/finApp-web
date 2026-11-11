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
const rutaResumenGlobal = getEndpoint("movimiento.resumenGlobal");
const rutaRecurrentes = getEndpoint("movimiento.recurrentes");

/** Consulta todos los movimientos o los de un bolsillo opcional y aplica el filtro de tipo. */
export function listarMovimientos(idBolsillo, tipo = "TODOS", estadoRevision = "") {
  const parametros = new URLSearchParams({ tipo });
  if (idBolsillo) parametros.set("idBolsillo", idBolsillo);
  if (estadoRevision) parametros.set("estadoRevision", estadoRevision);
  return obtener(`${rutaBase}?${parametros.toString()}`);
}

/** Registra un movimiento financiero en un bolsillo propio. */
export function crearMovimiento(movimiento) {
  return crear(rutaBase, movimiento);
}

/** Guarda una sugerencia Gmail en estado POR_REVISAR sin asignarla a un bolsillo de ahorro. */
export function guardarCorreoPorRevisar(movimiento) {
  return crear(`${rutaBase}/gmail/por-revisar`, movimiento);
}

/** Confirma un movimiento Gmail revisado como ingreso o gasto global. */
export function confirmarMovimientoGmailGlobal(idMovimiento) {
  return crear(`${rutaBase}/${encodeURIComponent(idMovimiento)}/confirmar-global`, {});
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

/** Consulta el resumen global de contabilidad para un mes (YYYY-MM). */
export function obtenerResumenGlobal(mes) {
  const parametros = new URLSearchParams();
  if (mes) parametros.set("mes", mes);
  const query = parametros.toString();
  return obtener(query ? `${rutaResumenGlobal}?${query}` : rutaResumenGlobal);
}

/** Detecta servicios de cobro periódico a partir de gastos reales confirmados. */
export function listarSuscripcionesRecurrentes() {
  return obtener(rutaRecurrentes);
}
