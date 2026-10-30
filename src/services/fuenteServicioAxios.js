/**
 * @uso        Referencia de consumo de fuentes mediante Axios (para futura refactorización)
 * @funciones  crearFuenteAxios, obtenerFuentesAxios, obtenerFuentePorIdAxios, actualizarFuenteAxios, eliminarFuenteAxios, obtenerFuentePorTipoAxios
 * @datos      Payloads directos JSON, cliente Axios configurado con API_BASE_URL
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Documentación y migración de servicios HTTP
 */

import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "../config/api.config";

/**
 * Cliente Axios centralizado para unificar interceptores, encabezados y manejo de errores.
 */
export const clienteHttp = axios.create({
  baseURL: API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

const rutaBase = ENDPOINTS.fuente.base;

/**
 * Registra una nueva fuente.
 * @param {Object} fuente - { idFuente, tipo, contenido, estado, fechaCreacion }
 * @returns {Promise<Object>} Datos de la fuente creada
 */
export async function crearFuenteAxios(fuente) {
  const { data } = await clienteHttp.post(rutaBase, fuente);
  return data;
}

/**
 * Obtiene todas las fuentes registradas.
 * @returns {Promise<Array>} Lista de fuentes
 */
export async function obtenerFuentesAxios() {
  const { data } = await clienteHttp.get(rutaBase);
  return data;
}

/**
 * Obtiene una fuente por su identificador.
 * @param {string} idFuente
 * @returns {Promise<Object>} Datos de la fuente
 */
export async function obtenerFuentePorIdAxios(idFuente) {
  const { data } = await clienteHttp.get(`${ENDPOINTS.fuente.porId}/${idFuente}`);
  return data;
}

/**
 * Obtiene fuentes filtradas por tipo.
 * @param {string} tipo
 * @returns {Promise<Array>} Lista de fuentes del tipo solicitado
 */
export async function obtenerFuentePorTipoAxios(tipo) {
  const { data } = await clienteHttp.get(`${ENDPOINTS.fuente.porTipo}/${tipo}`);
  return data;
}

/**
 * Actualiza una fuente existente.
 * @param {string} idFuente
 * @param {Object} fuente
 * @returns {Promise<Object>} Fuente actualizada
 */
export async function actualizarFuenteAxios(idFuente, fuente) {
  const { data } = await clienteHttp.put(`${rutaBase}/${idFuente}`, fuente);
  return data;
}

/**
 * Elimina una fuente por su identificador.
 * @param {string} idFuente
 * @returns {Promise<void>}
 */
export async function eliminarFuenteAxios(idFuente) {
  await clienteHttp.delete(`${rutaBase}/${idFuente}`);
}

