/**
 * @uso        Punto único de acceso a endpoints del backend
 * @funciones  getEndpoint(nombre), getEndpointConParametros(nombre, parametros), API_BASE_URL
 * @datos      Lee de variables de entorno (import.meta.env), sin transformación
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Servicios HTTP y componentes que necesiten hacer fetch al backend
 */

// Cambiar solo esta URL cuando el backend esté disponible
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Registrar aquí cada endpoint nuevo (nombre -> ruta relativa)
export const ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    registro: "/api/auth/registro",
  },
  usuario: {
    base: "/usuario",
    porId: "/usuario/id",
    porNombre: "/usuario/nombre",
    porContacto: "/usuario/contacto",
  },
  grupo: {
    base: "/grupo",
    porUsuario: "/grupo/usuario",
    porNombre: "/grupo/nombre",
    porId: "/grupo/id",
  },
  bolsillo: {
    base: "/bolsillo",
  },
  movimiento: {
    base: "/movimiento",
    resumen: "/movimiento/resumen",
    resumenGlobal: "/movimiento/resumen-global",
    recurrentes: "/movimiento/recurrentes",
  },
  tarjeta: {
    base: "/tarjeta",
    porUsuario: "/tarjeta/usuario",
    porId: "/tarjeta/id",
  },
  fuente: {
    base: "/fuente",
    porUsuario: "/fuente/usuario",
    porTipo: "/fuente/tipo",
    porId: "/fuente/id",
  },
  contacto: {
    base: "/contacto",
    porId: "/contacto/id",
    porNombre: "/contacto/nombre",
    porNota: "/contacto/nota",
    porTelefono: "/contacto/telefono",
  },
  asistente: {
    chat: "/asistente/chat",
    publico: "/asistente/publico",
    confirmar: "/asistente/confirmar",
  },
  gmail: {
    callback: "/api/gmail/callback",
    conexion: "/api/gmail/conexion",
    cuentas: "/api/gmail/cuentas",
    suscripciones: "/api/gmail/suscripciones",
    movimientosNotificaciones: "/api/gmail/movimientos/notificaciones",
    papelera: "/api/gmail/cuentas/{cuentaId}/papelera",
    papeleraMensaje: "/api/gmail/cuentas/{cuentaId}/mensajes/{mensajeId}/papelera",
    restaurarMensaje:
      "/api/gmail/cuentas/{cuentaId}/mensajes/{mensajeId}/restaurar",
  },
  indicadores: {
    trm: "/api/indicadores/trm",
  },
  telegram: {
    base: "/api/telegram",
  },
  suscripcion: {
    base: "/suscripcion",
    recurrentes: "/suscripcion/recurrentes",
  },
  almacenamiento: {
    conexiones: "/api/almacenamiento/conexiones",
    desconectar: "/api/almacenamiento/conexiones",
    iniciar: "/api/almacenamiento/conexiones/iniciar",
    callback: "/api/almacenamiento/conexiones/callback",
    nextcloud: "/api/almacenamiento/conexiones/nextcloud",
  },
};

/**
 * getEndpoint
 * Devuelve la URL completa de un endpoint registrado.
 * @param {string} path - clave simple o punteada
 * @returns {string} URL completa lista para fetch()
 */
export function getEndpoint(path) {
  const parts = path.split(".");
  let value = ENDPOINTS;
  for (const part of parts) {
    value = value?.[part];
  }
  if (!value) {
    throw new Error(`Endpoint no registrado: "${path}"`);
  }
  return `${API_BASE_URL}${value}`;
}

/**
 * getEndpointConParametros
 * Devuelve la URL completa de un endpoint registrado, sustituyendo y codificando
 * los marcadores `{parametro}` presentes en su ruta.
 * @param {string} path - clave simple o punteada
 * @param {Record<string, string|number>} parametros - valores de los marcadores
 * @returns {string} URL completa lista para fetch()
 */
export function getEndpointConParametros(path, parametros = {}) {
  return getEndpoint(path).replace(
    /\{([a-zA-Z0-9_]+)\}/g,
    (coincidencia, clave) =>
      clave in parametros
        ? encodeURIComponent(String(parametros[clave]))
        : coincidencia,
  );
}
