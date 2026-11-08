import { CirclePause, Play } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { formatoMoneda } from "../../utils/suscripcionesData";

/** Tarjeta individual de suscripción demo y control de su estado. */
export default function SuscripcionCard({ suscripcion, onAlternarEstado, onVerDetalle }) {
  const { id, nombre, categoria, monto, diaCobro, activa, Icono } = suscripcion;
  return (
    <Card como="li" className="flex flex-col justify-between gap-4 p-5">
      <button type="button" onClick={onVerDetalle} aria-label={`Ver detalle de ${nombre}`} className="flex w-full flex-col gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary"><Icono className="h-5 w-5" aria-hidden="true" /></span>
          <div className="min-w-0"><h3 className="truncate font-display text-lg font-semibold text-bg-dark">{nombre}</h3><p className="truncate text-sm text-slate-text">{categoria}</p></div>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div><p className="font-semibold text-bg-dark">{formatoMoneda.format(monto)}</p><p className="text-xs text-slate-text">Cada mes · día {diaCobro}</p></div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${activa ? "bg-emerald-primary/10 text-emerald-primary" : "bg-border-line/40 text-slate-text"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${activa ? "bg-emerald-primary" : "bg-slate-text"}`} aria-hidden="true" />{activa ? "Activa" : "Pausada"}
          </span>
        </div>
      </button>
      <button type="button" onClick={() => onAlternarEstado(id)} aria-label={`${activa ? "Pausar" : "Activar"} ${nombre}`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-primary px-3 text-sm font-medium text-emerald-primary transition-colors hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
        {activa ? <CirclePause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}{activa ? "Pausar" : "Activar"}
      </button>
    </Card>
  );
}
