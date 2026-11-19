import { ArrowDownRight, ArrowUpRight, PiggyBank } from "lucide-react";
import {
  entidadMovimiento,
  fechaMovimiento,
  formatoMoneda,
  nombreMovimiento,
} from "../../utils/contabilidadHelpers";

/** Fila resumida de un movimiento que abre su modal de detalle. */
export default function MovimientoItem({ movimiento, onDetalle }) {
  const tipo = String(movimiento.tipo || "").toUpperCase();
  const ingreso = tipo === "INGRESO";
  const IconoMovimiento = ingreso
    ? ArrowUpRight
    : tipo === "AHORRO"
      ? PiggyBank
      : ArrowDownRight;
  const tono = ingreso
    ? "text-emerald-primary"
    : tipo === "AHORRO"
      ? "text-cat-income"
      : tipo === "GASTO"
        ? "text-cat-expense"
        : "text-slate-text";
  const titulo = nombreMovimiento(movimiento);
  const monto = Number(movimiento.monto) || 0;
  const fechaTexto = fechaMovimiento(movimiento.fecha);
  const entidad = entidadMovimiento(movimiento);
  const contexto = [movimiento.nombreBolsillo, movimiento.categoria]
    .filter(Boolean)
    .join(" · ");
  const fechaLinea = [fechaTexto, entidad].filter(Boolean).join(" · ");

  return (
    <li className="py-3">
      <button
        type="button"
        onClick={onDetalle}
        aria-label={`Ver detalle del movimiento ${titulo}`}
        className="group grid w-full gap-3 rounded-xl p-2 text-left transition-colors hover:bg-bg-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-cream ${tono}`}
          >
            <IconoMovimiento className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-bg-dark">
              {titulo}
            </p>
            {contexto && (
              <p className="mt-0.5 truncate text-sm font-medium text-slate-text">
                {contexto}
              </p>
            )}
            {fechaLinea && (
              <p className="mt-0.5 truncate text-xs text-slate-text">
                {fechaLinea}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0">
          <span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-medium text-slate-text">
            {tipo}
          </span>
          <span
            className={`min-w-28 text-right font-medium tabular-nums ${tono}`}
          >
            {ingreso ? "+" : "−"}
            {formatoMoneda.format(monto)}
          </span>
        </div>
      </button>
    </li>
  );
}
