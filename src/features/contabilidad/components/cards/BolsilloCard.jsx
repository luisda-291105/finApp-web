import { PiggyBank, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { Card } from "../../../../components/ui";
import { formatoMoneda } from "../../utils/contabilidadHelpers";

const iconoPorTipo = { GASTO: ReceiptText, INGRESO: TrendingUp, AHORRO: PiggyBank };
const campoPorTipo = { GASTO: "gastos", INGRESO: "ingresos", AHORRO: "ahorros" };

/** Tarjeta resumida de bolsillo. Al activarla se abre su detalle. */
export default function BolsilloCard({ bolsillo, resumen = {}, cargandoResumen, errorResumen, onDetalle }) {
  const tipo = String(bolsillo.tipo || "").trim().toUpperCase();
  const Icono = iconoPorTipo[tipo] || Wallet;
  const movimiento = Number(resumen[campoPorTipo[tipo] || "otros"]) || 0;
  const monto = movimiento;
  const meta = Number(bolsillo.montoObjetivo) || 0;
  const avance = meta > 0 ? Math.min(100, Math.max(0, monto) / meta * 100) : 0;

  return (
    <Card
      como="button"
      type="button"
      onClick={onDetalle}
      className="flex min-h-52 w-full flex-col justify-between gap-5 border border-border-line/40 p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
      aria-label={`Abrir bolsillo ${bolsillo.nombre}, ${formatoMoneda.format(monto)}, tipo ${bolsillo.tipo}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary"><Icono className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-display text-lg font-semibold text-bg-dark">{bolsillo.nombre}</h3>
          <span className="mt-2 inline-flex rounded-full bg-bg-cream px-2.5 py-1 text-xs font-semibold text-slate-text">{bolsillo.tipo || "Sin tipo"}</span>
        </div>
      </div>
      <div>
        {cargandoResumen ? <p role="status" className="text-sm text-slate-text">Cargando monto…</p> : errorResumen ? <p className="text-sm text-slate-text">Monto no disponible</p> : <p className="font-display text-2xl font-semibold tabular-nums text-bg-dark">{formatoMoneda.format(monto)}</p>}
        <div className="mt-3 flex items-center justify-between gap-2 text-xs"><span className="text-slate-text">Meta</span><span className="font-medium text-bg-dark">{formatoMoneda.format(meta)}</span></div>
        {meta > 0 && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border-line/30" role="progressbar" aria-label={`Avance de la meta de ${bolsillo.nombre}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(avance)}><div className="h-full rounded-full bg-emerald-primary transition-[width]" style={{ width: `${avance}%` }} /></div>}
      </div>
    </Card>
  );
}
