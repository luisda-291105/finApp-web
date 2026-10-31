/**
 * @uso        Servicio para consumir endpoints de usuario
 * @funciones  crearUsuario, obtenerUsuarios, obtenerUsuarioPorId, obtenerUsuarioPorNombre, obtenerUsuarioPorContacto, eliminarUsuario, actualizarUsuario
 * @datos      Usa httpServicio y rutas definidas en config/api.config
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Componentes y hooks que gestionen usuarios
 */
import { getEndpoint } from "../config/api.config";
import { crear, obtener, actualizar, eliminar } from "./httpServicio";

const rutaBase = getEndpoint("usuario.base");

/**
 * crearUsuario
 * Crea un nuevo usuario.
 * @param {Object} usuario
 * @returns {Promise<any>}
 */
export async function crearUsuario(usuario) {
  return crear(rutaBase, usuario);
}

/**
 * obtenerUsuarios
 * Consulta todos los usuarios.
 * @returns {Promise<any>}
 */
export async function obtenerUsuarios() {
  return obtener(rutaBase);
}

/**
 * obtenerUsuarioPorId
 * Consulta un usuario por su id.
 * @param {string} idUsuario
 * @returns {Promise<any>}
 */
export async function obtenerUsuarioPorId(idUsuario) {
  const ruta = `${getEndpoint("usuario.porId")}/${idUsuario}`;
  return obtener(ruta);
}

/**
 * obtenerUsuarioPorNombre
 * Consulta usuarios por nombre.
 * @param {string} nombre
 * @returns {Promise<any>}
 */
export async function obtenerUsuarioPorNombre(nombre) {
  const ruta = `${getEndpoint("usuario.porNombre")}/${nombre}`;
  return obtener(ruta);
}

/**
 * obtenerUsuarioPorContacto
 * Consulta usuarios por contacto.
 * @param {string} contacto
 * @returns {Promise<any>}
 */
export async function obtenerUsuarioPorContacto(contacto) {
  const ruta = `${getEndpoint("usuario.porContacto")}/${contacto}`;
  return obtener(ruta);
}

/**
 * eliminarUsuario
 * Elimina un usuario por id.
 * @param {string} idUsuario
 * @returns {Promise<any>}
 */
export async function eliminarUsuario(idUsuario) {
  const ruta = `${rutaBase}/${idUsuario}`;
  return eliminar(ruta);
}

/**
 * actualizarUsuario
 * Actualiza un usuario por id.
 * @param {string} idUsuario
 * @param {Object} usuario
 * @returns {Promise<any>}
 */
export async function actualizarUsuario(idUsuario, usuario) {
  const ruta = `${rutaBase}/${idUsuario}`;
  return actualizar(ruta, usuario);
}
