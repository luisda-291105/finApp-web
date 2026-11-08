import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { formatoFecha, formatoMoneda } from "../../utils/contabilidadHelpers";

/** Fila de un movimiento con su importe, bolsillo y acciones disponibles. */
export default function MovimientoItem({ movimiento, onEditar, onEliminar }) {
  const tipo = String(movimiento.tipo || "").toUpperCase();
  const ingreso = tipo === "INGRESO";
  const IconoMovimiento = ingreso ? ArrowUpRight : ArrowDownRight;
  const tono = ingreso ? "text-cat-income" : tipo === "AHORRO" ? "text-emerald-primary" : tipo === "GASTO" ? "text-cat-expense" : "text-slate-text";
  const monto = Number(movimiento.monto) || 0;
  const fecha = movimiento.fecha ? new Date(`${movimiento.fecha}T00:00:00Z`) : null;

  return (
    <li className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-cream ${tono}`}><IconoMovimiento className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0">
          <p className="truncate font-medium text-bg-dark">{movimiento.concepto?.trim() || movimiento.categoria}</p>
          <p className="truncate text-xs text-emerald-primary">{movimiento.nombreBolsillo}</p>
          {movimiento.concepto?.trim() && <p className="truncate text-xs text-slate-text">{movimiento.categoria}</p>}
          {movimiento.origenNombre && <p className="truncate text-xs text-slate-text">Origen: {movimiento.origenNombre}</p>}
          <time className="text-sm text-slate-text" dateTime={movimiento.fecha}>{fecha && !Number.isNaN(fecha.getTime()) ? formatoFecha.format(fecha) : movimiento.fecha}</time>
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-2 pl-[52px] sm:items-end sm:pl-0">
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-medium text-slate-text">{tipo}</span>
          <span className={`min-w-28 text-right font-medium tabular-nums ${tono}`}>{ingreso ? "+" : "−"}{formatoMoneda.format(monto)}</span>
        </div>
        <div className="flex justify-end gap-1.5">
          <button type="button" onClick={onEditar} aria-label={`Editar movimiento ${movimiento.concepto || movimiento.categoria}`} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Editar</button>
          <button type="button" onClick={onEliminar} aria-label={`Eliminar movimiento ${movimiento.concepto || movimiento.categoria}`} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Eliminar</button>
        </div>
      </div>
    </li>
  );
}
