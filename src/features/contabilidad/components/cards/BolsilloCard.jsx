import { Pencil, Trash2, Wallet } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { formatearPesos } from "../../../../utils/formatoPesos";
import { formatoMoneda } from "../../utils/contabilidadHelpers";

/** Plantilla reutilizable para mostrar los datos, saldo y acciones de un bolsillo. */
export default function BolsilloCard({ bolsillo, resumen = {}, cargandoResumen, errorResumen, onEditar, onEliminar }) {
  const objetivo = Number(bolsillo.montoObjetivo) || 0;
  const saldo = Number(resumen.saldo) || 0;
  const avance = objetivo > 0 ? Math.min(100, Math.max(0, saldo) / objetivo * 100) : 0;

  return (
    <Card className="flex flex-col justify-between gap-5 border border-border-line/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary">
          <Wallet className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="break-words font-display text-lg font-semibold text-bg-dark">{bolsillo.nombre}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-bg-cream px-2.5 py-1 text-xs font-semibold text-slate-text">{bolsillo.tipo || "Sin tipo"}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${bolsillo.estado === false ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-800"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${bolsillo.estado === false ? "bg-slate-500" : "bg-emerald-600"}`} aria-hidden="true" />
              {bolsillo.estado === false ? "Inactivo" : "Activo"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl bg-bg-cream/70 p-3">
        {cargandoResumen ? <p role="status" className="text-xs text-slate-text">Cargando actividad…</p> : errorResumen ? <p role="status" className="text-xs text-slate-text">{errorResumen}</p> : <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-slate-text">Movimientos</p><p className="mt-0.5 font-semibold text-bg-dark">{resumen.cantidad ?? 0}</p></div>
          <div><p className="text-xs text-slate-text">Saldo</p><p className="mt-0.5 font-semibold text-bg-dark">{formatoMoneda.format(saldo)}</p></div>
          <div><p className="text-xs text-slate-text">Ingresos</p><p className="mt-0.5 text-sm font-medium text-cat-income">{formatoMoneda.format(Number(resumen.ingresos) || 0)}</p></div>
          <div><p className="text-xs text-slate-text">Gastos</p><p className="mt-0.5 text-sm font-medium text-cat-expense">{formatoMoneda.format(Number(resumen.gastos) || 0)}</p></div>
          <div><p className="text-xs text-slate-text">Ahorros descontados</p><p className="mt-0.5 text-sm font-medium text-emerald-primary">{formatoMoneda.format(Number(resumen.ahorros) || 0)}</p></div>
          {Number(resumen.otros) > 0 && <div><p className="text-xs text-slate-text">Otros descuentos</p><p className="mt-0.5 text-sm font-medium text-cat-expense">{formatoMoneda.format(Number(resumen.otros) || 0)}</p></div>}
        </div>}
        <div className="border-t border-border-line/30 pt-2">
          <div className="flex justify-between gap-2 text-xs"><span className="text-slate-text">Objetivo (COP)</span><span className="font-medium text-bg-dark">{formatearPesos(objetivo)}</span></div>
          {objetivo > 0 && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border-line/30" role="progressbar" aria-label={`Avance del objetivo de ${bolsillo.nombre}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(avance)}><div className="h-full rounded-full bg-emerald-primary transition-[width]" style={{ width: `${avance}%` }} /></div>}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border-line/30 pt-3">
        <button type="button" onClick={onEditar} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Pencil className="h-4 w-4" aria-hidden="true" />Editar</button>
        <button type="button" onClick={onEliminar} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar</button>
      </div>
    </Card>
  );
}
