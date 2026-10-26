/**
 * @uso        Servicio HTTP base reutilizable para consumir el backend
 * @funciones  obtener, crear, actualizar, eliminar, obtenerJson
 * @datos      Usa fetch nativo con encabezados JSON
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Servicios de entidad
 */
import { API_BASE_URL } from "../config/api.config";

function construirUrl(rutaRelativa) {
  if (!rutaRelativa) return API_BASE_URL;
  if (rutaRelativa.startsWith("http://") || rutaRelativa.startsWith("https://")) {
    return rutaRelativa;
  }
  if (API_BASE_URL.endsWith("/") && rutaRelativa.startsWith("/")) {
    return `${API_BASE_URL}${rutaRelativa.slice(1)}`;
  }
  if (!API_BASE_URL.endsWith("/") && !rutaRelativa.startsWith("/")) {
    return `${API_BASE_URL}/${rutaRelativa}`;
  }
  return `${API_BASE_URL}${rutaRelativa}`;
}

async function obtenerJson(respuesta) {
  const texto = await respuesta.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

/**
 * obtener
 * Realiza petición GET a una ruta relativa o URL completa.
 * @param {string} rutaRelativa
 * @param {RequestInit} opciones
 * @returns {Promise<any>}
 */
export async function obtener(rutaRelativa, opciones = {}) {
  const respuesta = await fetch(construirUrl(rutaRelativa), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    ...opciones,
  });
  return obtenerJson(respuesta);
}

/**
 * crear
 * Realiza petición POST con cuerpo JSON.
 * @param {string} rutaRelativa
 * @param {any} cuerpo
 * @param {RequestInit} opciones
 * @returns {Promise<any>}
 */
export async function crear(rutaRelativa, cuerpo, opciones = {}) {
  const respuesta = await fetch(construirUrl(rutaRelativa), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    body: JSON.stringify(cuerpo),
    ...opciones,
  });
  return obtenerJson(respuesta);
}

/**
 * actualizar
 * Realiza petición PUT con cuerpo JSON.
 * @param {string} rutaRelativa
 * @param {any} cuerpo
 * @param {RequestInit} opciones
 * @returns {Promise<any>}
 */
export async function actualizar(rutaRelativa, cuerpo, opciones = {}) {
  const respuesta = await fetch(construirUrl(rutaRelativa), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    body: JSON.stringify(cuerpo),
    ...opciones,
  });
  return obtenerJson(respuesta);
}

/**
 * eliminar
 * Realiza petición DELETE.
 * @param {string} rutaRelativa
 * @param {RequestInit} opciones
 * @returns {Promise<any>}
 */
export async function eliminar(rutaRelativa, opciones = {}) {
  const respuesta = await fetch(construirUrl(rutaRelativa), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    ...opciones,
  });
  return obtenerJson(respuesta);
}

export { obtenerJson };
