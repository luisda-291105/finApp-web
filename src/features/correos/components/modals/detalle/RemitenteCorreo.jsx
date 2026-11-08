import CampoDetalle from "./CampoDetalle";
import { fechaLegible, separarRemitente } from "../../../utils/correoHelpers";

export default function RemitenteCorreo({ remitente, fecha }) {
  const datos = separarRemitente(remitente);
  return <CampoDetalle titulo="Remitente">
    <div className="divide-y divide-border-line/50">
      <p className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-2 first:pt-0"><span className="text-slate-text">Nombre</span><span className="font-medium">{datos.nombre || "No disponible"}</span></p>
      <p className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-2"><span className="text-slate-text">Correo</span><span className="break-all font-medium">{datos.email || "No disponible"}</span></p>
      <p className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-2 last:pb-0"><span className="text-slate-text">Fecha</span><span>{fechaLegible(fecha)}</span></p>
    </div>
  </CampoDetalle>;
}
