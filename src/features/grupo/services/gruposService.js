/**
 * @uso        Operaciones HTTP propias de grupos
 * @funciones  crearGrupo, obtenerGruposPorUsuario, actualizarGrupo, eliminarGrupo
 * @datos      Delega el transporte en httpServicio y las rutas en api.config
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   useGrupos y componentes del detalle de grupo
 */
import { getEndpoint } from "../../../config/api.config";
import { crear, obtener, actualizar, eliminar } from "../../../services/httpServicio";

const rutaBase = getEndpoint("grupo.base");

/** @param {object} grupo */
export async function crearGrupo(grupo) {
  return crear(rutaBase, grupo);
}

/** @param {string|number} idUsuario */
export async function obtenerGruposPorUsuario(idUsuario) {
  return obtener(`${rutaBase}/usuario/${encodeURIComponent(idUsuario)}`);
}

/** Consulta todos los grupos. */
export async function obtenerGrupos() {
  return obtener(rutaBase);
}

/** @param {string|number} idUsuario */
export async function obtenerGrupoPorUsuario(idUsuario) {
  return obtener(`${getEndpoint("grupo.porUsuario")}/${encodeURIComponent(idUsuario)}`);
}

/** @param {string} nombre */
export async function obtenerGrupoPorNombre(nombre) {
  return obtener(`${getEndpoint("grupo.porNombre")}/${encodeURIComponent(nombre)}`);
}

/** @param {string|number} idGrupo */
export async function obtenerGrupoPorId(idGrupo) {
  return obtener(`${getEndpoint("grupo.porId")}/${encodeURIComponent(idGrupo)}`);
}

/** @param {string|number} idGrupo @param {object} grupo @param {string|number} idUsuario */
export async function actualizarGrupo(idGrupo, grupo, idUsuario) {
  return actualizar(`${rutaBase}/${encodeURIComponent(idGrupo)}?idUsuario=${encodeURIComponent(idUsuario)}`, grupo);
}

/** @param {string|number} idGrupo @param {string|number} idUsuario */
export async function eliminarGrupo(idGrupo, idUsuario) {
  return eliminar(`${rutaBase}/${encodeURIComponent(idGrupo)}?idUsuario=${encodeURIComponent(idUsuario)}`);
}

/** @param {string|number} idGrupo @param {string|number} idFuente @param {string|number} idUsuario */
export async function vincularFuenteAGrupo(idGrupo, idFuente, idUsuario) {
  const ruta = `${rutaBase}/${encodeURIComponent(idGrupo)}/fuentes/${encodeURIComponent(idFuente)}?idUsuario=${encodeURIComponent(idUsuario)}`;
  return actualizar(ruta, {});
}

/** @param {string|number} idGrupo @param {string|number} idFuente @param {string|number} idUsuario */
export async function desvincularFuenteDeGrupo(idGrupo, idFuente, idUsuario) {
  const ruta = `${rutaBase}/${encodeURIComponent(idGrupo)}/fuentes/${encodeURIComponent(idFuente)}?idUsuario=${encodeURIComponent(idUsuario)}`;
  return eliminar(ruta);
}
