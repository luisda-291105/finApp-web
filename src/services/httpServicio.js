/**
 * @uso        Servicio HTTP base reutilizable para consumir el backend con sesión access/refresh
 * @funciones  obtener, crear, actualizar, patch, eliminar, subir, descargar, renovarSesion
 * @datos      Cookies HttpOnly FINAPP_AUTH (15 min) y FINAPP_REFRESH (30 min de inactividad)
 * @eventos    finapp:sesion-requerida (con detail.motivo = "inactividad" u otro),
 *             finapp:refresh-ok para coordinar pestañas
 * @estados    Renovación single-flight por pestaña y bloqueo navigator.locks entre pestañas
 * @usadoPor   Servicios de entidad
 */
import { API_BASE_URL } from "../config/api.config";

/** El access expira en 15 min; renovamos a los 13 min solo si hubo actividad. */
const RENOVACION_PROACTIVA_MS = 13 * 60 * 1000;
/** El refresh expira a los 30 min de inactividad; dejamos margen antes de avisar. */
const UMBRAL_INACTIVIDAD_MS = 25 * 60 * 1000;
/** Ventana para considerar que otra pestaña ya renovó la cookie compartida. */
const VENTANA_REFRESCO_COMPARTIDO_MS = 3000;

const RUTA_REFRESH = "/usuario/refresh";
const RUTAS_SIN_RENOVACION = [
  "/usuario/login",
  RUTA_REFRESH,
  "/usuario/logout",
  "/usuario/admin-login",
];
const CLAVE_MENSAJE_SESION = "finapp_mensaje_sesion";
const CANAL_SESION = "finapp-sesion";

let renovacionEnCurso = null;
let temporizadorProactivo = null;
let ultimaActividad = 0;
let ultimoRefrescoLocal = 0;
let ultimoRefrescoCompartido = 0;
let canalSesion = null;

/** Normaliza una URL absoluta o relativa a su pathname sin barra final. */
function rutaDe(url) {
  try {
    return new URL(url, window.location.origin).pathname.replace(/\/$/, "");
  } catch {
    return String(url).split("?")[0].replace(/\/$/, "");
  }
}

function esRutaSinRenovacion(url) {
  const ruta = rutaDe(url);
  return RUTAS_SIN_RENOVACION.some(
    (excluida) => ruta === excluida || ruta.endsWith(excluida),
  );
}

function construirUrl(rutaRelativa) {
  if (!rutaRelativa) return API_BASE_URL;
  if (
    rutaRelativa.startsWith("http://") ||
    rutaRelativa.startsWith("https://")
  ) {
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

/** En Vitest el canal se desactiva: BroadcastChannel cruza archivos de prueba. */
const esEntornoDePrueba =
  typeof process !== "undefined" && Boolean(process.env?.VITEST);

function publicar(tipo, datos = {}) {
  if (esEntornoDePrueba || typeof BroadcastChannel === "undefined") return;
  try {
    if (!canalSesion) canalSesion = new BroadcastChannel(CANAL_SESION);
    canalSesion.postMessage({ tipo, en: Date.now(), ...datos });
  } catch {
    /* La coordinación entre pestañas es una mejora, no un requisito. */
  }
}

if (!esEntornoDePrueba && typeof BroadcastChannel !== "undefined") {
  try {
    canalSesion = new BroadcastChannel(CANAL_SESION);
    canalSesion.onmessage = (evento) => {
      if (evento.data?.tipo === "refresh-ok") {
        ultimoRefrescoCompartido = evento.data.en || Date.now();
        programarRenovacionProactiva();
      }
      if (evento.data?.tipo === "refresh-fallo") {
        notificarSesionRequerida(evento.data.motivo || "inactividad");
      }
    };
  } catch {
    canalSesion = null;
  }
}

/** Avisa a la UI y guarda el motivo para mostrarlo al reabrir el modal de acceso. */
function notificarSesionRequerida(motivo = "otro") {
  const mensaje =
    motivo === "inactividad"
      ? "Tu sesión expiró por inactividad. Inicia sesión de nuevo para continuar."
      : "Tu sesión expiró o se cerró. Inicia sesión de nuevo para continuar.";
  try {
    window.sessionStorage.setItem(CLAVE_MENSAJE_SESION, mensaje);
  } catch {
    /* Almacenamiento opcional. */
  }
  window.dispatchEvent(
    new CustomEvent("finapp:sesion-requerida", {
      detail: { motivo, mensaje },
    }),
  );
}

/** Devuelve y limpia el aviso de sesión pendiente (lo consume AuthModal). */
export function consumirMensajeSesion() {
  try {
    const mensaje = window.sessionStorage.getItem(CLAVE_MENSAJE_SESION);
    if (mensaje) window.sessionStorage.removeItem(CLAVE_MENSAJE_SESION);
    return mensaje || "";
  } catch {
    return "";
  }
}

function registrarRefrescoCorrecto(esInicioDeSesion = false) {
  const ahora = Date.now();
  ultimoRefrescoLocal = ahora;
  ultimoRefrescoCompartido = ahora;
  // En login no hay actividad previa: la marca ahora como punto de partida.
  if (esInicioDeSesion) ultimaActividad = ahora;
  publicar("refresh-ok", { en: ahora });
  programarRenovacionProactiva();
}

/** Llama al endpoint de refresh sin body; todas las pestañas comparten las cookies. */
async function ejecutarRefresh() {
  const url = construirUrl(RUTA_REFRESH);
  const respuesta = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!respuesta.ok) {
    const datos = await obtenerJson(respuesta);
    const motivo = respuesta.status === 401 ? "inactividad" : "otro";
    publicar("refresh-fallo", { motivo });
    notificarSesionRequerida(motivo);
    const error = new Error(
      datos?.mensaje ||
        "Tu sesión expiró por inactividad. Inicia sesión de nuevo para continuar.",
    );
    error.motivoSesion = motivo;
    throw error;
  }
  registrarRefrescoCorrecto();
  return respuesta;
}

/**
 * Renueva la sesión una sola vez aunque fallen varias peticiones a la vez.
 * `navigator.locks` evita que varias pestañas roten el mismo refresh simultáneamente.
 * @returns {Promise<void>}
 */
export function renovarSesion() {
  if (renovacionEnCurso) return renovacionEnCurso;

  const ejecutar = async () => {
    // Otra pestaña pudo renovar mientras esperábamos el bloqueo.
    if (Date.now() - ultimoRefrescoCompartido < VENTANA_REFRESCO_COMPARTIDO_MS) {
      return;
    }
    const locks = typeof navigator !== "undefined" ? navigator.locks : null;
    if (!locks?.request) {
      await ejecutarRefresh();
      return;
    }
    await locks.request("finapp-refresh", async () => {
      if (Date.now() - ultimoRefrescoCompartido < VENTANA_REFRESCO_COMPARTIDO_MS) {
        return;
      }
      await ejecutarRefresh();
    });
  };

  renovacionEnCurso = ejecutar().finally(() => {
    renovacionEnCurso = null;
  });
  return renovacionEnCurso;
}

/** Programa la renovación proactiva solo si la pestaña registró actividad reciente. */
export function programarRenovacionProactiva() {
  if (temporizadorProactivo) clearTimeout(temporizadorProactivo);
  temporizadorProactivo = null;
  if (typeof window === "undefined") return;

  temporizadorProactivo = window.setTimeout(async () => {
    temporizadorProactivo = null;
    const inactivo =
      ultimaActividad <= ultimoRefrescoLocal ||
      Date.now() - ultimaActividad > UMBRAL_INACTIVIDAD_MS;
    if (inactivo) return;
    try {
      await renovarSesion();
    } catch {
      /* El error ya se notificó desde ejecutarRefresh. */
    }
  }, RENOVACION_PROACTIVA_MS);
}

function registrarActividad() {
  ultimaActividad = Date.now();
  programarRenovacionProactiva();
}

/**
 * Ejecuta una petición y, si recibe 401, renueva la sesión una sola vez y la repite.
 * Nunca intenta renovar en login/refresh/logout para evitar bucles.
 */
async function peticion(metodo, url, opciones = {}, reintentada = false) {
  const respuesta = await fetch(url, { method: metodo, credentials: "include", ...opciones });

  if (respuesta.status === 401 && !reintentada && !esRutaSinRenovacion(url)) {
    try {
      await renovarSesion();
      return await peticion(metodo, url, opciones, true);
    } catch (error) {
      if (error?.motivoSesion) {
        // El evento de sesión ya se emitió; devolvemos la respuesta original para
        // que leerRespuesta conserve el mensaje concreto del backend.
        return respuesta;
      }
      throw error;
    }
  }

  if (respuesta.ok) {
    if (rutaDe(url).endsWith("/usuario/login")) registrarRefrescoCorrecto(true);
    else registrarActividad();
  }
  return respuesta;
}

/**
 * leerRespuesta
 * Lee el cuerpo y lanza un error con el mensaje del backend cuando el estado no es correcto.
 * @param {Response} respuesta - Respuesta de `fetch`
 * @param {string} url - URL solicitada (para el log)
 * @param {string} metodo - Método HTTP (para el log)
 * @returns {Promise<any>} Cuerpo interpretado
 */
async function leerRespuesta(respuesta, url, metodo) {
  if (respuesta.ok) return obtenerJson(respuesta);

  const ruta = rutaDe(url);
  const rutaNormalizada = ruta.replace(/\/$/, "");
  const solicitudAutenticacion =
    rutaNormalizada.endsWith("/usuario/login") ||
    (metodo === "POST" && rutaNormalizada.endsWith("/usuario")) ||
    rutaNormalizada.includes("/api/auth/");
  const consultaSesionSinSesion =
    respuesta.status === 401 && ruta === "/usuario/activo";
  if (
    respuesta.status === 401 &&
    esRutaSinRenovacion(url) &&
    !url.includes("/usuario/login")
  ) {
    notificarSesionRequerida("inactividad");
  }

  const datos = await obtenerJson(respuesta);
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
      ? datos.mensaje ||
        datos.message ||
        datos.error ||
        `Error HTTP ${respuesta.status}`
      : datos || `Error HTTP ${respuesta.status}`;

  throw new Error(mensaje);
}

/** Cabeceras por defecto: JSON salvo que el llamador indique lo contrario (FormData). */
function cabecerasJson(encabezadosExtra) {
  return { "Content-Type": "application/json", ...(encabezadosExtra || {}) };
}

export async function obtener(rutaRelativa, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const { headers: encabezadosExtra, body, method, ...resto } = opciones;
  const respuesta = await peticion("GET", url, {
    headers: cabecerasJson(encabezadosExtra),
    ...resto,
  });
  return leerRespuesta(respuesta, url, "GET");
}

export async function subir(rutaRelativa, formData, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const { headers: encabezadosExtra, ...resto } = opciones;
  const respuesta = await peticion("POST", url, {
    headers: { ...(encabezadosExtra || {}) },
    body: formData,
    ...resto,
  });
  return leerRespuesta(respuesta, url, "POST");
}

export async function descargar(rutaRelativa, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const { headers: encabezadosExtra, ...resto } = opciones;
  const respuesta = await peticion(
    "GET",
    url,
    { headers: { ...(encabezadosExtra || {}) }, ...resto },
    false,
  );
  if (respuesta.ok) return respuesta.blob();
  const datos = await obtenerJson(respuesta);
  if (respuesta.status === 401 && esRutaSinRenovacion(url)) {
    notificarSesionRequerida("inactividad");
  }
  const mensaje =
    datos && typeof datos === "object"
      ? datos.mensaje || datos.message || datos.error || `Error HTTP ${respuesta.status}`
      : datos || `Error HTTP ${respuesta.status}`;
  throw new Error(mensaje);
}

export async function crear(rutaRelativa, cuerpo, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const { headers: encabezadosExtra, ...resto } = opciones;
  const respuesta = await peticion("POST", url, {
    headers: cabecerasJson(encabezadosExtra),
    body: JSON.stringify(cuerpo),
    ...resto,
  });
  return leerRespuesta(respuesta, url, "POST");
}

export async function actualizar(rutaRelativa, cuerpo, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const { headers: encabezadosExtra, ...resto } = opciones;
  const respuesta = await peticion("PUT", url, {
    headers: cabecerasJson(encabezadosExtra),
    body: JSON.stringify(cuerpo),
    ...resto,
  });
  return leerRespuesta(respuesta, url, "PUT");
}

export async function patch(rutaRelativa, cuerpo, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const { headers: encabezadosExtra, ...resto } = opciones;
  const respuesta = await peticion("PATCH", url, {
    headers: cabecerasJson(encabezadosExtra),
    body: JSON.stringify(cuerpo),
    ...resto,
  });
  return leerRespuesta(respuesta, url, "PATCH");
}

export async function eliminar(rutaRelativa, opciones = {}) {
  const url = construirUrl(rutaRelativa);
  const { headers: encabezadosExtra, ...resto } = opciones;
  const respuesta = await peticion("DELETE", url, {
    headers: cabecerasJson(encabezadosExtra),
    ...resto,
  });
  return leerRespuesta(respuesta, url, "DELETE");
}

export { obtenerJson };
