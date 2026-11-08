/**
 * @uso        Operaciones HTTP propias de contactos
 * @funciones  crearContacto, obtenerContactosPorUsuario, actualizarContacto, eliminarContacto
 * @datos      Delega transporte y rutas en capas compartidas
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   useContactos y CrearContactoModal
 */
import { getEndpoint } from "../../../config/api.config";
import { crear, obtener, actualizar, eliminar } from "../../../services/httpServicio";
const rutaBase = getEndpoint("contacto.base");

/** @param {object} contacto */
export function crearContacto(contacto) { return crear(rutaBase, contacto); }
/** Importa en lote los contactos de Google; el backend evita duplicados por resourceName. */
export function importarContactosGoogle(contactos) { return crear(`${rutaBase}/importar-google`, contactos); }
/** @param {string|number} idUsuario */
export function obtenerContactosPorUsuario(idUsuario) { return obtener(`${rutaBase}/usuario/${encodeURIComponent(idUsuario)}`); }
/** @param {string|number} idContacto */
export function eliminarContacto(idContacto) { return eliminar(`${rutaBase}/${encodeURIComponent(idContacto)}`); }
/** @param {string|number} idContacto @param {object} contacto */
export function actualizarContacto(idContacto, contacto) { return actualizar(`${rutaBase}/${encodeURIComponent(idContacto)}`, contacto); }
/** @param {object} contacto */
export function obtenerContactos() { return obtener(rutaBase); }
/** @param {string|number} idContacto */
export function obtenerContactoPorId(idContacto) { return obtener(`${getEndpoint("contacto.porId")}/${encodeURIComponent(idContacto)}`); }
/** @param {string} nombre */
export function obtenerContactoPorNombre(nombre) { return obtener(`${getEndpoint("contacto.porNombre")}/${encodeURIComponent(nombre)}`); }
/** @param {string} nota */
export function obtenerContactoPorNota(nota) { return obtener(`${getEndpoint("contacto.porNota")}/${encodeURIComponent(nota)}`); }
/** @param {string} telefono */
export function obtenerContactoPorTelefono(telefono) { return obtener(`${getEndpoint("contacto.porTelefono")}/${encodeURIComponent(telefono)}`); }
