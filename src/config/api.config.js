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
    porTelefono: "/contacto/contacto",
  },
  asistente: {
    chat: "/asistente/chat",
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
