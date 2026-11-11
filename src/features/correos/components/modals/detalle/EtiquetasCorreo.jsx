import CampoDetalle from "./CampoDetalle";

const ETIQUETAS_GMAIL = {
  CATEGORY_PERSONAL: ["Personal", "correo-tono-todos"],
  CATEGORY_SOCIAL: ["Social", "correo-tono-entretenimiento"],
  CATEGORY_PROMOTIONS: ["Promociones", "correo-tono-importante"],
  CATEGORY_UPDATES: ["Actualizaciones", "correo-tono-no-importante"],
  CATEGORY_FORUMS: ["Foros", "correo-tono-entretenimiento"],
  CATEGORY_PRIMARY: ["Principal", "correo-tono-contable"],
  INBOX: ["Recibidos", "correo-tono-contable"],
  UNREAD: ["No leído", "correo-tono-no-importante"],
  STARRED: ["Destacado", "correo-tono-importante"],
  IMPORTANT: ["Importante", "correo-tono-importante"],
  SENT: ["Enviados", "correo-tono-todos"],
  DRAFT: ["Borradores", "correo-tono-no-importante"],
  SPAM: ["Spam", "correo-tono-otros"],
  TRASH: ["Papelera", "correo-tono-otros"],
};

function obtenerEtiqueta(etiqueta) {
  const clave = String(etiqueta || "").toUpperCase().replace(/[\s-]+/g, "_");
  const [nombre, tono] = ETIQUETAS_GMAIL[clave] || [String(etiqueta).replace(/^CATEGORY_/, ""), "correo-tono-otros"];
  return { clave, nombre, tono };
}

export default function EtiquetasCorreo({ etiquetas }) {
  const lista = (etiquetas || []).map(obtenerEtiqueta);
  return <CampoDetalle titulo="Etiquetas">
    {lista.length ? <div className="flex flex-wrap gap-2">{lista.map((etiqueta, indice) => <span key={`${etiqueta.clave}-${indice}`} className={`correo-etiqueta ${etiqueta.tono}`}>{etiqueta.nombre}</span>)}</div> : "Sin etiquetas"}
  </CampoDetalle>;
}
