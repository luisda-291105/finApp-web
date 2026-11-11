import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card } from "../../../../components/ui";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function dinero(valor) {
  const numero = Number(valor ?? 0);
  return formatoCOP.format(Number.isFinite(numero) ? numero : 0);
}

export default function ResumenGlobalCards({ resumen, mes, alCambiarMes, cargando = false, error = "" }) {
  return <section aria-labelledby="resumen-global-titulo" className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-primary">Resumen mensual</p>
        <h2 id="resumen-global-titulo" className="font-display text-xl font-semibold text-bg-dark">Tu contabilidad</h2>
      </div>
      <label className="text-sm font-medium text-bg-dark">Mes
        <input type="month" value={mes} onChange={(evento) => alCambiarMes(evento.target.value)}
          className="mt-1 block min-h-10 rounded-xl border border-border-line bg-white px-3 text-sm text-bg-dark outline-none focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20" />
      </label>
    </div>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4" aria-busy={cargando}>
      <Card como="article" className="p-5">
        <h3 className="text-sm font-semibold text-slate-text">Ingresos y gastos</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-sm font-medium text-slate-text">Ingresos</p>
              <p className="mt-2 font-display text-2xl font-semibold text-bg-dark">{cargando ? "—" : dinero(resumen?.ingresos)}</p></div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ArrowDownLeft aria-hidden="true" className="h-5 w-5" /></span>
          </div>
          <div className="flex items-start justify-between gap-3 border-t border-border-line/60 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <div><p className="text-sm font-medium text-slate-text">Gastos</p>
              <p className="mt-2 font-display text-2xl font-semibold text-bg-dark">{cargando ? "—" : dinero(resumen?.gastos)}</p>
              <p className="mt-2 text-sm text-slate-text">+ {cargando ? "—" : dinero(resumen?.montoPorRevisar)} por revisar</p></div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><ArrowUpRight aria-hidden="true" className="h-5 w-5" /></span>
          </div>
        </div>
      </Card>
    </div>
    <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border-line/60 bg-white/60 px-4 py-3 text-sm text-slate-text" aria-label="Información adicional del mes">
      <p>Transferencias: <strong className="text-bg-dark">{cargando ? "—" : dinero(resumen?.transferencias)}</strong></p>
      <p>Movimientos por revisar: <strong className="text-bg-dark">{cargando ? "—" : Number(resumen?.porRevisar ?? 0)}</strong></p>
    </div>
  </section>;
}
