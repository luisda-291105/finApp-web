/**
 * @uso        Servicio para consumir endpoints de contacto
 * @funciones  crearContacto, obtenerContactos, obtenerContactoPorId, obtenerContactoPorNombre, obtenerContactoPorNota, obtenerContactoPorTelefono, eliminarContacto, actualizarContacto
 * @datos      Usa httpServicio y rutas definidas en config/api.config
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Componentes y hooks que gestionen contactos
 */
import { getEndpoint } from "../config/api.config";
import { crear, obtener, actualizar, eliminar } from "./httpServicio";

const rutaBase = getEndpoint("contacto.base");

/**
 * crearContacto
 * Crea un nuevo contacto.
 * @param {Object} contacto
 * @returns {Promise<any>}
 */
export async function crearContacto(contacto) {
  return crear(rutaBase, contacto);
}

/**
 * obtenerContactos
 * Consulta todos los contactos.
 * @returns {Promise<any>}
 */
export async function obtenerContactos() {
  return obtener(rutaBase);
}

/** Consulta únicamente los contactos asociados al usuario indicado. */
export async function obtenerContactosPorUsuario(idUsuario) {
  return obtener(`${rutaBase}/usuario/${encodeURIComponent(idUsuario)}`);
}

/**
 * obtenerContactoPorId
 * Consulta un contacto por su id.
 * @param {string} idContacto
 * @returns {Promise<any>}
 */
export async function obtenerContactoPorId(idContacto) {
  const ruta = `${getEndpoint("contacto.porId")}/${idContacto}`;
  return obtener(ruta);
}

/**
 * obtenerContactoPorNombre
 * Consulta contactos por nombre.
 * @param {string} nombre
 * @returns {Promise<any>}
 */
export async function obtenerContactoPorNombre(nombre) {
  const ruta = `${getEndpoint("contacto.porNombre")}/${nombre}`;
  return obtener(ruta);
}

/**
 * obtenerContactoPorNota
 * Consulta contactos por nota.
 * @param {string} nota
 * @returns {Promise<any>}
 */
export async function obtenerContactoPorNota(nota) {
  const ruta = `${getEndpoint("contacto.porNota")}/${nota}`;
  return obtener(ruta);
}

/**
 * obtenerContactoPorTelefono
 * Consulta contactos por teléfono.
 * @param {string} telefono
 * @returns {Promise<any>}
 */
export async function obtenerContactoPorTelefono(telefono) {
  const ruta = `${getEndpoint("contacto.porTelefono")}/${telefono}`;
  return obtener(ruta);
}

/**
 * eliminarContacto
 * Elimina un contacto por id.
 * @param {string} idContacto
 * @returns {Promise<any>}
 */
export async function eliminarContacto(idContacto) {
  const ruta = `${rutaBase}/${idContacto}`;
  return eliminar(ruta);
}

/**
 * actualizarContacto
 * Actualiza un contacto por id.
 * @param {string} idContacto
 * @param {Object} contacto
 * @returns {Promise<any>}
 */
export async function actualizarContacto(idContacto, contacto) {
  const ruta = `${rutaBase}/${idContacto}`;
  return actualizar(ruta, contacto);
}
