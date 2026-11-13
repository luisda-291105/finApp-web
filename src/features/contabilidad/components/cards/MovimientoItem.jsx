import { ArrowDownRight, ArrowUpRight, Eye } from "lucide-react";
import { formatoFecha, formatoMoneda } from "../../utils/contabilidadHelpers";

/** Fila resumida de un movimiento que abre su modal de detalle. */
export default function MovimientoItem({ movimiento, onDetalle }) {
  const tipo = String(movimiento.tipo || "").toUpperCase();
  const ingreso = tipo === "INGRESO";
  const IconoMovimiento = ingreso ? ArrowUpRight : ArrowDownRight;
  const tono = ingreso ? "text-cat-income" : tipo === "AHORRO" ? "text-emerald-primary" : tipo === "GASTO" ? "text-cat-expense" : "text-slate-text";
  const monto = Number(movimiento.monto) || 0;
  const fecha = movimiento.fecha ? new Date(`${movimiento.fecha}T00:00:00Z`) : null;
  const fechaTexto = fecha && !Number.isNaN(fecha.getTime()) ? formatoFecha.format(fecha) : movimiento.fecha || "Fecha no disponible";
  const entidad = movimiento.entidad || movimiento.remitente || movimiento.origenNombre || "";
  const contexto = [movimiento.nombreBolsillo, movimiento.categoria].filter(Boolean).join(" · ");
  const fechaLinea = [fechaTexto, entidad].filter(Boolean).join(" · ");

  return (
    <li className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <button type="button" onClick={onDetalle} aria-label={`Ver detalle del movimiento ${movimiento.concepto || movimiento.categoria}`} className="group flex min-w-0 items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-bg-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-cream ${tono}`}><IconoMovimiento className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-bg-dark">{movimiento.concepto?.trim() || movimiento.categoria}</p>
          {contexto && <p className="mt-0.5 truncate text-sm font-medium text-slate-text">{contexto}</p>}
          {fechaLinea && <p className="mt-0.5 truncate text-xs text-slate-text">{fechaLinea}</p>}
        </div>
        <span className="hidden items-center gap-1 text-xs font-medium text-emerald-primary sm:inline-flex"><Eye className="h-4 w-4" aria-hidden="true" />Detalle</span>
      </button>
      <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0">
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-medium text-slate-text">{tipo}</span>
          <span className={`min-w-28 text-right font-medium tabular-nums ${tono}`}>{ingreso ? "+" : "−"}{formatoMoneda.format(monto)}</span>
        </div>
      </div>
    </li>
  );
}
