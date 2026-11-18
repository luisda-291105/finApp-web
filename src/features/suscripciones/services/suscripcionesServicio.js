/**
 * @uso        Acceso al CRUD de suscripciones del usuario activo y a sus ajustes de organización
 * @funciones  listarSuscripcionesManuales, crearSuscripcionManual, actualizarSuscripcionManual, cambiarEstadoSuscripcionManual, eliminarSuscripcionManual, actualizarAjustesSuscripcion
 * @datos      Envía nombre, monto, fecha de cobro, categoría, importancia, prioridad, apodo y activa; normaliza la respuesta del backend
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   SuscripcionesPage, DetalleSuscripcionModal
 */
import { getEndpoint } from "../../../config/api.config";
import { actualizar, crear, eliminar, obtener, patch } from "../../../services/httpServicio";

const ruta = getEndpoint("suscripcion.base");

const extraerLista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.datos || respuesta?.data || respuesta?.content || [];
};

/** Normaliza un nivel (importancia o prioridad) a Alta, Media, Baja o "" («No definido») para la interfaz. */
export const normalizarNivelUi = (valor, porDefecto = "") => {
  const normalizado = String(valor ?? "").trim().toUpperCase();
  if (normalizado === "ALTA" || normalizado === "ALTO" || normalizado === "IMPORTANTE") return "Alta";
  if (normalizado === "MEDIA" || normalizado === "MEDIO") return "Media";
  if (normalizado === "BAJA" || normalizado === "BAJO") return "Baja";
  return porDefecto;
};

/** Normaliza un nivel (importancia o prioridad) a ALTA, MEDIA o BAJA para el backend. */
export const normalizarNivelApi = (valor, porDefecto = "MEDIA") => {
  const normalizado = String(valor ?? "").trim().toUpperCase();
  if (normalizado === "ALTA" || normalizado === "ALTO" || normalizado === "IMPORTANTE") return "ALTA";
  if (normalizado === "MEDIA" || normalizado === "MEDIO") return "MEDIA";
  if (normalizado === "BAJA" || normalizado === "BAJO") return "BAJA";
  return porDefecto;
};

const normalizarImportanciaApi = (valor) => normalizarNivelApi(valor, "ALTA");

const normalizarApodo = (valor) => String(valor ?? "").trim();

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
    importancia: normalizarNivelUi(suscripcion.importancia),
    prioridad: normalizarNivelUi(suscripcion.prioridad),
    apodo: normalizarApodo(suscripcion.apodo) || "",
    activa: suscripcion.activa !== false,
  };
}

const prepararPayload = (suscripcion) => ({
  nombre: String(suscripcion.nombre || "").trim(),
  monto: numeroSeguro(suscripcion.monto),
  fechaCobro: fechaSeguro(suscripcion.fechaCobro),
  categoria: String(suscripcion.categoria || "").trim(),
  importancia: normalizarImportanciaApi(suscripcion.importancia),
  prioridad: normalizarNivelApi(suscripcion.prioridad, "MEDIA"),
  apodo: normalizarApodo(suscripcion.apodo) || null,
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

/**
 * Actualiza los ajustes de organización (importancia, prioridad, apodo) de cualquier
 * suscripción del usuario, manual o detectada en Gmail. "" en importancia/prioridad
 * guarda NULL en el backend (opción «No definido» del detalle).
 */
export function actualizarAjustesSuscripcion(id, { importancia, prioridad, apodo } = {}) {
  const cuerpo = {};
  if (importancia !== undefined) cuerpo.importancia = String(importancia).trim() === "" ? "" : normalizarNivelApi(importancia, "ALTA");
  if (prioridad !== undefined) cuerpo.prioridad = String(prioridad).trim() === "" ? "" : normalizarNivelApi(prioridad, "MEDIA");
  if (apodo !== undefined) cuerpo.apodo = normalizarApodo(apodo) || null;
  return patch(`${ruta}/${encodeURIComponent(String(id))}/ajustes`, cuerpo);
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
