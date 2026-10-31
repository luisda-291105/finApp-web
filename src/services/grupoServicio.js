/**
 * @uso        Servicio para consumir endpoints de grupo
 * @funciones  crearGrupo, obtenerGrupos, obtenerGrupoPorUsuario, obtenerGrupoPorNombre, obtenerGrupoPorId, eliminarGrupo, actualizarGrupo
 * @datos      Usa httpServicio y rutas definidas en config/api.config
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Componentes y hooks que gestionen grupos
 */
import { getEndpoint } from "../config/api.config";
import { crear, obtener, actualizar, eliminar } from "./httpServicio";

const rutaBase = getEndpoint("grupo.base");

/**
 * crearGrupo
 * Crea un nuevo grupo.
 * @param {Object} grupo
 * @returns {Promise<any>}
 */
export async function crearGrupo(grupo) {
  return crear(rutaBase, grupo);
}

/**
 * obtenerGrupos
 * Consulta todos los grupos.
 * @returns {Promise<any>}
 */
export async function obtenerGrupos() {
  return obtener(rutaBase);
}

/** Consulta únicamente los grupos asociados al usuario indicado. */
export async function obtenerGruposPorUsuario(idUsuario) {
  return obtener(`${rutaBase}/usuario/${encodeURIComponent(idUsuario)}`);
}

/** Vincula una fuente del usuario activo a uno de sus grupos. */
export async function vincularFuenteAGrupo(idGrupo, idFuente, idUsuario) {
  const ruta = `${rutaBase}/${encodeURIComponent(idGrupo)}/fuentes/${encodeURIComponent(idFuente)}?idUsuario=${encodeURIComponent(idUsuario)}`;
  return actualizar(ruta, {});
}

/** Desvincula una fuente de un grupo sin borrar el registro de la cuenta. */
export async function desvincularFuenteDeGrupo(idGrupo, idFuente, idUsuario) {
  const ruta = `${rutaBase}/${encodeURIComponent(idGrupo)}/fuentes/${encodeURIComponent(idFuente)}?idUsuario=${encodeURIComponent(idUsuario)}`;
  return eliminar(ruta);
}

/**
 * obtenerGrupoPorUsuario
 * Consulta grupos por id de usuario.
 * @param {string} idUsuario
 * @returns {Promise<any>}
 */
export async function obtenerGrupoPorUsuario(idUsuario) {
  const ruta = `${getEndpoint("grupo.porUsuario")}/${idUsuario}`;
  return obtener(ruta);
}

/**
 * obtenerGrupoPorNombre
 * Consulta grupos por nombre.
 * @param {string} nombre
 * @returns {Promise<any>}
 */
export async function obtenerGrupoPorNombre(nombre) {
  const ruta = `${getEndpoint("grupo.porNombre")}/${nombre}`;
  return obtener(ruta);
}

/**
 * obtenerGrupoPorId
 * Consulta un grupo por su id.
 * @param {string} idGrupo
 * @returns {Promise<any>}
 */
export async function obtenerGrupoPorId(idGrupo) {
  const ruta = `${getEndpoint("grupo.porId")}/${idGrupo}`;
  return obtener(ruta);
}

/**
 * eliminarGrupo
 * Elimina un grupo por id.
 * @param {string} idGrupo
 * @returns {Promise<any>}
 */
export async function eliminarGrupo(idGrupo, idUsuario) {
  const ruta = `${rutaBase}/${encodeURIComponent(idGrupo)}?idUsuario=${encodeURIComponent(idUsuario)}`;
  return eliminar(ruta);
}

/**
 * actualizarGrupo
 * Actualiza un grupo por id.
 * @param {string} idGrupo
 * @param {Object} grupo
 * @returns {Promise<any>}
 */
export async function actualizarGrupo(idGrupo, grupo, idUsuario) {
  const ruta = `${rutaBase}/${encodeURIComponent(idGrupo)}?idUsuario=${encodeURIComponent(idUsuario)}`;
  return actualizar(ruta, grupo);
}
