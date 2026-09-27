/**
 * @uso        Punto único de acceso a endpoints del backend (aún no listo)
 * @funciones  getEndpoint(nombre), API_BASE_URL
 * @datos      Lee de variables de entorno (import.meta.env), sin transformación
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Cualquier componente/hook que necesite hacer fetch al backend
 */

// Cambiar solo esta URL cuando el backend esté disponible
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Registrar aquí cada endpoint nuevo (nombre -> ruta relativa)
export const ENDPOINTS = {
  usuarios: "/api/usuarios",
  contabilidad: "/api/contabilidad",
  gastos: "/api/gastos",
  ingresos: "/api/ingresos",
  clasificaciones: "/api/clasificaciones",
  auth: {
    login: "/api/auth/login",
    registro: "/api/auth/registro",
  },
};

/**
 * getEndpoint
 * Devuelve la URL completa de un endpoint registrado.
 * @param {string} path - clave simple ("usuarios") o punteada ("auth.login")
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
