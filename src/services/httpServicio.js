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

  const ruta = new URL(url, window.location.origin).pathname;
  const rutaNormalizada = ruta.replace(/\/$/, "");
  const solicitudAutenticacion = rutaNormalizada.endsWith("/usuario/login")
    || (metodo === "POST" && rutaNormalizada.endsWith("/usuario"))
    || rutaNormalizada.includes("/api/auth/");
  const consultaSesionSinSesion = respuesta.status === 401 && ruta === "/usuario/activo";
  if (respuesta.status === 401 && !url.includes("/usuario/login") && !url.includes("/api/gmail/")) {
    window.dispatchEvent(new CustomEvent("finapp:sesion-requerida"));
  }

  const datos = await obtenerJson(respuesta);
  // La consulta de sesión responde 401 cuando la pestaña ya no tiene sesión;
  // ese resultado es parte del flujo normal de inicio, no un error de aplicación.
  if (!consultaSesionSinSesion && !solicitudAutenticacion) {
    console.error("[HTTP][ERROR]", {
      url,
      metodo,
      status: respuesta.status,
      statusText: respuesta.statusText,
      datos,
    });
  }

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
    credentials: "include",
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
    credentials: "include",
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
    credentials: "include",
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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    ...opciones,
  });
  return leerRespuesta(respuesta, url, "DELETE");
}

export { obtenerJson };
