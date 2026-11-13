/**
 * @uso        Utilidades puras del gestor de archivos del feature almacenamiento
 * @funciones  esCarpeta, esArchivo, extensionDe, iconoArchivo, formatearBytes, esRecienteArchivo
 * @datos      Recibe items crudos del gestor y devuelve tipo/valor listo para presentación
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   useGestorArchivos y AlmacenamientoArchivoItem
 */

/** Tipo interno de un elemento: carpeta o archivo. */
export const TIPO_CARPETA = "carpeta";
export const TIPO_ARCHIVO = "archivo";

/** Extensiones por icono de archivo (clave de presentación). */
const ICONOS_POR_EXTENSION = {
  pdf: "pdf",
  png: "imagen",
  jpg: "imagen",
  jpeg: "imagen",
  gif: "imagen",
  webp: "imagen",
  svg: "imagen",
  heic: "imagen",
  xls: "hoja",
  xlsx: "hoja",
  csv: "hoja",
  doc: "documento",
  docx: "documento",
  txt: "documento",
  md: "documento",
  ppt: "presentacion",
  pptx: "presentacion",
  key: "presentacion",
  zip: "archivo",
  rar: "archivo",
  "7z": "archivo",
};

/**
 * iconoArchivo
 * Clave de icono legible por el presentador según la extensión del nombre.
 * @param {string} nombre
 * @returns {string}
 */
export function iconoArchivo(nombre = "") {
  const extension = extensionDe(nombre);
  return ICONOS_POR_EXTENSION[extension] || "archivo";
}

/**
 * extensionDe
 * Devuelve la extensión (minúscula, sin punto) de un nombre; cadena vacía si no hay.
 * @param {string} nombre
 * @returns {string}
 */
export function extensionDe(nombre = "") {
  const partes = String(nombre).split(".");
  return partes.length > 1 ? (partes.pop() || "").toLowerCase() : "";
}

/**
 * esCarpeta
 * Indica si el item del gestor es una carpeta.
 * @param {Object} item
 * @returns {boolean}
 */
export function esCarpeta(item) {
  return item?.tipo === TIPO_CARPETA;
}

/**
 * esArchivo
 * Indica si el item del gestor es un archivo.
 * @param {Object} item
 * @returns {boolean}
 */
export function esArchivo(item) {
  return item?.tipo === TIPO_ARCHIVO;
}

/**
 * formatearBytes
 * Formatea un tamaño en bytes a una etiqueta corta (B, KB, MB, GB).
 * @param {number} bytes
 * @returns {string}
 */
export function formatearBytes(bytes) {
  const valor = Number(bytes) || 0;
  if (valor < 1024) return `${valor} B`;
  const unidades = ["KB", "MB", "GB", "TB"];
  let escala = 1024;
  let resultado = valor / 1024;
  let indice = 0;
  while (resultado >= 1024 && indice < unidades.length - 1) {
    resultado /= 1024;
    escala *= 1024;
    indice += 1;
  }
  const redondeado = Number(resultado.toFixed(1));
  return `${Number.isInteger(redondeado) ? redondeado : redondeado.toFixed(1)} ${unidades[indice]}`;
}

/**
 * esRecienteArchivo
 * Indica si una fecha ISO de modificación está dentro de los últimos `dias`.
 * @param {string} fechaModificacion
 * @param {number} dias
 * @returns {boolean}
 */
export function esRecienteArchivo(fechaModificacion, dias = 30) {
  const fecha = new Date(fechaModificacion);
  if (Number.isNaN(fecha.getTime())) return false;
  const limite = Date.now() - dias * 24 * 60 * 60 * 1000;
  return fecha.getTime() >= limite;
}

/**
 * crearId
 * Identificador interno corto y único para items del gestor.
 * @returns {string}
 */
export function crearId() {
  return `arch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
