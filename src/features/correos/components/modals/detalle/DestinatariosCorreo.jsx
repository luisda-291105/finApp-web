import CampoDetalle from "./CampoDetalle";
import { separarDestinatarios } from "../../../utils/correoHelpers";

export default function DestinatariosCorreo({ destinatarios, direccionFuente }) {
  const lista = separarDestinatarios(destinatarios, direccionFuente);
  return <CampoDetalle titulo="Para">
    {lista.length ? <div className="flex min-w-0 flex-wrap gap-2">{lista.map((email) => <span key={email} className="max-w-full break-all rounded-lg bg-bg-cream px-3 py-1.5">{email}</span>)}</div> : "No disponible"}
  </CampoDetalle>;
}
