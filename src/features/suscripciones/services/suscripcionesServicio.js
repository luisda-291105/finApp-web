/**
 * @uso        Acceso al CRUD de suscripciones manuales del usuario activo
 * @funciones  listarSuscripcionesManuales, crearSuscripcionManual, actualizarSuscripcionManual, cambiarEstadoSuscripcionManual, eliminarSuscripcionManual
 * @datos      Envía nombre, monto, fecha de cobro, categoría, importancia y activa; normaliza la respuesta del backend
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   SuscripcionesPage
 */
import { getEndpoint } from "../../../config/api.config";
import { actualizar, crear, eliminar, obtener, patch } from "../../../services/httpServicio";

const ruta = getEndpoint("suscripcion.base");

const extraerLista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.datos || respuesta?.data || respuesta?.content || [];
};

const normalizarImportanciaUi = (valor) => {
  const normalizado = String(valor ?? "ALTA").trim().toUpperCase();
  return normalizado === "BAJA" || normalizado === "BAJO" ? "Baja" : "Alta";
};

const normalizarImportanciaApi = (valor) =>
  normalizarImportanciaUi(valor) === "Baja" ? "BAJA" : "ALTA";

const numeroSeguro = (valor) => {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  const texto = String(valor ?? "").trim().replace(/\s/g, "");
  if (!texto) return 0;
  const normalizado = texto.includes(",") && texto.includes(".")
    ? texto.replace(/\./g, "").replace(/,/g, ".")
    : texto.replace(/,/g, ".");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
};

const fechaSeguro = (valor) => (valor ? String(valor).slice(0, 10) : "");

/** Normaliza la suscripción que llega del backend al modelo usado en la interfaz. */
export function normalizarSuscripcionManual(respuesta) {
  const suscripcion = respuesta?.datos || respuesta?.data || respuesta || {};
  return {
    id: String(suscripcion.id ?? ""),
    origen: suscripcion.origen || "MANUAL",
    nombre: String(suscripcion.nombre || ""),
    categoria: String(suscripcion.categoria || "Otros"),
    monto: numeroSeguro(suscripcion.monto),
    fechaCobro: fechaSeguro(suscripcion.fechaCobro),
    importancia: normalizarImportanciaUi(suscripcion.importancia),
    activa: suscripcion.activa !== false,
  };
}

const prepararPayload = (suscripcion) => ({
  nombre: String(suscripcion.nombre || "").trim(),
  monto: numeroSeguro(suscripcion.monto),
  fechaCobro: fechaSeguro(suscripcion.fechaCobro),
  categoria: String(suscripcion.categoria || "").trim(),
  importancia: normalizarImportanciaApi(suscripcion.importancia),
  ...(typeof suscripcion.activa === "boolean" ? { activa: suscripcion.activa } : {}),
});

/** Consulta las suscripciones manuales, ordenadas en el backend por fecha de cobro. */
export async function listarSuscripcionesManuales() {
  const respuesta = await obtener(`${ruta}?origen=MANUAL`);
  return extraerLista(respuesta).map(normalizarSuscripcionManual);
}

/** Registra una suscripción manual del usuario activo. */
export async function crearSuscripcionManual(suscripcion) {
  const creada = await crear(ruta, prepararPayload(suscripcion));
  return normalizarSuscripcionManual(creada);
}

/** Reemplaza los datos editables de una suscripción manual. */
export async function actualizarSuscripcionManual(id, suscripcion) {
  const actualizada = await actualizar(`${ruta}/${encodeURIComponent(String(id))}`, prepararPayload(suscripcion));
  return normalizarSuscripcionManual(actualizada);
}

/** Activa o pausa una suscripción manual. */
export async function cambiarEstadoSuscripcionManual(id, activa) {
  const actualizada = await patch(`${ruta}/${encodeURIComponent(String(id))}/estado`, { activa: Boolean(activa) });
  return normalizarSuscripcionManual(actualizada);
}

/** Elimina una suscripción manual del usuario activo. */
export function eliminarSuscripcionManual(id) {
  return eliminar(`${ruta}/${encodeURIComponent(String(id))}`);
}
