/**
 * @uso        Servicio para consumir endpoints de fuente
 * @funciones  crearFuente, obtenerFuentes, obtenerFuentePorUsuario, obtenerFuentePorTipo, obtenerFuentePorId, eliminarFuente, actualizarFuente
 * @datos      Usa httpServicio y rutas definidas en config/api.config
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Componentes y hooks que gestionen fuentes
 */
import { getEndpoint } from "../config/api.config";
import { crear, obtener, actualizar, eliminar } from "./httpServicio";

const rutaBase = getEndpoint("fuente.base");

/**
 * crearFuente
 * Crea una nueva fuente.
 * @param {Object} fuente
 * @returns {Promise<any>}
 */
export async function crearFuente(fuente) {
  return crear(rutaBase, fuente);
}

/**
 * obtenerFuentes
 * Consulta todas las fuentes.
 * @returns {Promise<any>}
 */
export async function obtenerFuentes() {
  return obtener(rutaBase);
}

/**
 * obtenerFuentePorUsuario
 * Consulta fuentes por id de usuario.
 * @param {string} usuario
 * @returns {Promise<any>}
 */
export async function obtenerFuentePorUsuario(usuario) {
  const ruta = `${getEndpoint("fuente.porUsuario")}/${usuario}`;
  return obtener(ruta);
}

/**
 * obtenerFuentePorTipo
 * Consulta fuentes por tipo.
 * @param {string} tipo
 * @returns {Promise<any>}
 */
export async function obtenerFuentePorTipo(tipo) {
  const ruta = `${getEndpoint("fuente.porTipo")}/${tipo}`;
  return obtener(ruta);
}

/**
 * obtenerFuentePorId
 * Consulta una fuente por su id.
 * @param {string} idFuente
 * @returns {Promise<any>}
 */
export async function obtenerFuentePorId(idFuente) {
  const ruta = `${getEndpoint("fuente.porId")}/${idFuente}`;
  return obtener(ruta);
}

/**
 * eliminarFuente
 * Elimina una fuente por id.
 * @param {string} idFuente
 * @returns {Promise<any>}
 */
export async function eliminarFuente(idFuente) {
  const ruta = `${rutaBase}/${idFuente}`;
  return eliminar(ruta);
}

/**
 * actualizarFuente
 * Actualiza una fuente por id.
 * @param {string} idFuente
 * @param {Object} fuente
 * @returns {Promise<any>}
 */
export async function actualizarFuente(idFuente, fuente) {
  const ruta = `${rutaBase}/${idFuente}`;
  return actualizar(ruta, fuente);
}
