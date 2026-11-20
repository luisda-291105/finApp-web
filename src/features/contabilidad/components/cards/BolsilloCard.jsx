import {
  PiggyBank,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card } from "../../../../components/ui";
import {
  esBolsilloFijo,
  formatoMoneda,
  obtenerOrigenes,
} from "../../utils/contabilidadHelpers";

const iconoPorTipo = {
  GASTO: ReceiptText,
  INGRESO: TrendingUp,
  AHORRO: PiggyBank,
};
const campoPorTipo = {
  GASTO: "gastos",
  INGRESO: "ingresos",
  AHORRO: "ahorros",
};
const etiquetaTotalPorTipo = {
  GASTO: "Total gastado",
  INGRESO: "Total ingresado",
  AHORRO: "Total ahorrado",
};

/** Tarjeta resumida de bolsillo. Al activarla se abre su detalle. */
export default function BolsilloCard({
  bolsillo,
  resumen = {},
  cargandoResumen,
  errorResumen,
  onDetalle,
}) {
  const tipo = String(bolsillo.tipo || "")
    .trim()
    .toUpperCase();
  const Icono = iconoPorTipo[tipo] || Wallet;
  const movimiento = Number(resumen[campoPorTipo[tipo] || "otros"]) || 0;
  const monto = movimiento;
  const cantidad = Number(resumen.cantidad) || 0;
  const meta = Number(bolsillo.montoObjetivo) || 0;
  const avance =
    meta > 0 ? Math.min(100, (Math.max(0, monto) / meta) * 100) : 0;
  const progreso = Math.round(avance);
  const restante = Math.max(meta - Math.max(0, monto), 0);
  const descripcion = String(bolsillo.descripcion || "").trim();
  const origenes = obtenerOrigenes(bolsillo);
  const etiquetaTotal = etiquetaTotalPorTipo[tipo] || "Total registrado";
  const etiquetaMovimientos =
    cantidad === 1 ? "1 movimiento" : `${cantidad} movimientos`;

  return (
    <Card
      como="button"
      type="button"
      onClick={onDetalle}
      className="flex min-h-64 w-full flex-col justify-between gap-4 border border-border-line/40 p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
      aria-label={`Abrir bolsillo ${bolsillo.nombre}, ${formatoMoneda.format(monto)}, tipo ${bolsillo.tipo || tipo}, ${etiquetaMovimientos}, ${meta > 0 ? `meta ${formatoMoneda.format(meta)}` : "sin meta definida"}`}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary">
            <Icono className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-display text-lg font-semibold text-bg-dark">
              {bolsillo.nombre}
            </h3>
            <span className="mt-2 inline-flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-semibold text-slate-text">
                {bolsillo.tipo || "Sin tipo"}
              </span>
              {esBolsilloFijo(bolsillo) && (
                <span className="rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary">
                  Fijo
                </span>
              )}
            </span>
          </div>
        </div>
        {descripcion && (
          <p className="line-clamp-2 text-sm leading-5 text-slate-text">
            {descripcion}
          </p>
        )}
        {origenes.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-text">
              Fondeos
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {origenes.map((origen, indice) => (
                <li
                  key={`${origen}-${indice}`}
                  className="max-w-full truncate rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-medium text-emerald-primary"
                >
                  {origen}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-text">
              {etiquetaTotal}
            </p>
            {!cargandoResumen && !errorResumen && (
              <span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-medium text-slate-text">
                {etiquetaMovimientos}
              </span>
            )}
          </div>
          {cargandoResumen ? (
            <p role="status" className="mt-1 text-sm text-slate-text">
              Cargando monto…
            </p>
          ) : errorResumen ? (
            <p className="mt-1 text-sm text-slate-text">Monto no disponible</p>
          ) : (
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-bg-dark">
              {formatoMoneda.format(monto)}
            </p>
          )}
        </div>

        <div className="border-t border-border-line/40 pt-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-text">Meta</span>
            <span className="font-medium text-bg-dark">
              {meta > 0 ? formatoMoneda.format(meta) : "Sin definir"}
            </span>
          </div>
          {meta > 0 ? (
            <>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-border-line/30"
                role="progressbar"
                aria-label={`Avance de la meta de ${bolsillo.nombre}`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progreso}
              >
                <div
                  className="h-full rounded-full bg-emerald-primary transition-[width]"
                  style={{ width: `${avance}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-text">
                {restante === 0
                  ? `Meta alcanzada · ${progreso}%`
                  : `${progreso}% completado · Faltan ${formatoMoneda.format(restante)}`}
              </p>
            </>
          ) : (
            <p className="mt-1.5 text-xs text-slate-text">
              Define una meta desde el detalle para seguir tu progreso.
            </p>
          )}
        </div>

      </div>
    </Card>
  );
}
