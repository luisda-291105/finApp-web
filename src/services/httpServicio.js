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
 * leerRespuesta
 * Lee el cuerpo de la respuesta y lanza un error con el mensaje del backend cuando el estado
 * HTTP no es correcto (4xx/5xx). Los errores quedan registrados en consola.
 * @param {Response} respuesta - Respuesta de `fetch`
 * @param {string} url - URL solicitada (para el log)
 * @param {string} metodo - Método HTTP (para el log)
 * @returns {Promise<any>} Cuerpo ya interpretado
 * @throws {Error} Con el mensaje del backend o `Error HTTP <status>`
 */
async function leerRespuesta(respuesta, url, metodo) {
  if (respuesta.ok) return obtenerJson(respuesta);

  const datos = await obtenerJson(respuesta);
  console.error("[HTTP][ERROR]", {
    url,
    metodo,
    status: respuesta.status,
    statusText: respuesta.statusText,
    datos,
  });

  const mensaje =
    datos && typeof datos === "object"
      ? datos.mensaje || datos.message || datos.error || `Error HTTP ${respuesta.status}`
      : datos || `Error HTTP ${respuesta.status}`;

  throw new Error(mensaje);
}

/**
 * obtener
 * Realiza petición GET a una ruta relativa o URL completa.
 * @param {string} rutaRelativa
 * @param {RequestInit} opciones
 * @returns {Promise<any>}
 */
export async function obtener(rutaRelativa, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const respuesta = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    ...opciones,
  });
  return leerRespuesta(respuesta, url, "GET");
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
  const url = construirUrl(rutaRelativa);
  const respuesta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    body: JSON.stringify(cuerpo),
    ...opciones,
  });
  return leerRespuesta(respuesta, url, "POST");
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
  const url = construirUrl(rutaRelativa);
  const respuesta = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    body: JSON.stringify(cuerpo),
    ...opciones,
  });
  return leerRespuesta(respuesta, url, "PUT");
}

/**
 * eliminar
 * Realiza petición DELETE.
 * @param {string} rutaRelativa
 * @param {RequestInit} opciones
 * @returns {Promise<any>}
 */
export async function eliminar(rutaRelativa, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const respuesta = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    ...opciones,
  });
  return leerRespuesta(respuesta, url, "DELETE");
}

export { obtenerJson };
