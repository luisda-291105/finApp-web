/**
 * @uso        Punto único de acceso a endpoints del backend
 * @funciones  getEndpoint(nombre), API_BASE_URL
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
  googleAuth: {
    state: "/api/auth/google/state",
    callback: "/api/auth/google/callback",
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
  },
  telegram: {
    base: "/api/telegram",
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
