/**
 * @uso        Icono de archivo con tono por tipo (PDF, imagen, hoja, documento, presentación, comprimido)
 * @funciones  AlmacenamientoArchivoIcono({ item, className })
 * @datos      item ({ nombre, tipo, mime }) del gestor; la clave de color sale de la extensión
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoArchivoItem
 */
import { File, FileSpreadsheet, FileText, Folder, Image as IconoImagen, Presentation } from "lucide-react";
import { iconoArchivo } from "../../utils/archivos";

const ICONOS_POR_CLAVE = {
  pdf: FileText,
  imagen: IconoImagen,
  hoja: FileSpreadsheet,
  documento: FileText,
  presentacion: Presentation,
  archivo: File,
};

const COLORES_POR_CLAVE = {
  pdf: "bg-red-500/10 text-red-500",
  imagen: "bg-emerald-primary/10 text-emerald-primary",
  hoja: "bg-emerald-primary/10 text-emerald-primary",
  documento: "bg-blue-500/10 text-blue-500",
  presentacion: "bg-amber-500/10 text-amber-500",
  archivo: "bg-slate-500/10 text-slate-500",
};

/**
 * AlmacenamientoArchivoIcono
 * Representa un archivo o carpeta con el icono legible por su extensión.
 * @param {Object} props
 * @param {Object} props.item - Item del gestor ({ nombre, tipo, mime })
 * @param {string} [props.className] - Clases adicionales del contenedor
 * @returns {JSX.Element}
 */
export default function AlmacenamientoArchivoIcono({ item, className = "" }) {
  const clave = item?.tipo === "carpeta" ? "carpeta" : iconoArchivo(item?.nombre || "");
  const Icono = clave === "carpeta" ? Folder : ICONOS_POR_CLAVE[clave] || File;
  const clases = clave === "carpeta"
    ? "bg-emerald-primary/10 text-emerald-primary"
    : COLORES_POR_CLAVE[clave] || COLORES_POR_CLAVE.archivo;
  return (
    <span
      aria-hidden="true"
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${clases} ${className}`}
    >
      <Icono className="h-6 w-6" />
    </span>
  );
}
