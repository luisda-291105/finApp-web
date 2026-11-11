/**
 * @uso        Mostrar cobros recurrentes inferidos de movimientos reales
 * @funciones  CobrosRecurrentesReales({ datos, cargando, error })
 * @datos      DTOs del endpoint movimiento/recurrentes
 * @eventos    Ninguno
 * @estados    Renderiza carga, error, métricas y resultados
 * @usadoPor   SuscripcionesPage
 */
import { CalendarClock, CircleDollarSign, Repeat } from "lucide-react";
import { Card } from "../../../../components/ui";

const moneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const fecha = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Sección con resumen mensual y próxima fecha prevista. */
export default function CobrosRecurrentesReales({ datos, cargando, error }) {
  const mensualEstimado = datos.reduce((total, item) => total + Number(item.montoPromedio || 0) * 30 / Math.max(1, Number(item.intervaloDias || 30)), 0);
  const proximo = datos.filter((item) => item.proximoCobro).sort((a, b) => a.proximoCobro.localeCompare(b.proximoCobro))[0];

  return <section aria-labelledby="cobros-recurrentes-titulo" className="space-y-4">
    <div><h2 id="cobros-recurrentes-titulo" className="font-display text-xl font-semibold text-bg-dark">Cobros recurrentes detectados</h2><p className="mt-1 text-sm text-slate-text">Estimación basada en tus gastos registrados; confirma los servicios y montos.</p></div>
    {error && <p role="alert" className="rounded-xl border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="p-4"><div className="flex items-center gap-2 text-sm text-slate-text"><CircleDollarSign className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Gasto recurrente estimado / mes</div><p className="mt-2 font-display text-xl font-semibold text-bg-dark">{moneda.format(mensualEstimado)}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-sm text-slate-text"><Repeat className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Servicios detectados</div><p className="mt-2 font-display text-xl font-semibold text-bg-dark">{datos.length}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-sm text-slate-text"><CalendarClock className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Próximo cobro estimado</div><p className="mt-2 font-display text-lg font-semibold text-bg-dark">{proximo ? `${proximo.nombre} · ${fecha.format(new Date(`${proximo.proximoCobro}T00:00:00Z`))}` : "Sin cobros previstos"}</p></Card>
    </div>
    {cargando && <p role="status" className="text-sm text-slate-text">Analizando tus gastos registrados…</p>}
    {!cargando && !error && datos.length === 0 && <Card className="p-5 text-sm text-slate-text">Aún no hay suficientes gastos periódicos registrados para detectar suscripciones. Registra al menos dos cobros del mismo servicio con una frecuencia regular.</Card>}
    {!cargando && datos.length > 0 && <ul aria-label="Cobros recurrentes detectados" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{datos.map((item) => <li key={item.id}><Card className="h-full space-y-3 p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-display text-lg font-semibold text-bg-dark">{item.nombre}</h3><p className="text-sm text-slate-text">{item.categoria}</p></div><span className="shrink-0 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary">{item.frecuencia}</span></div>
      <p className="font-semibold tabular-nums text-bg-dark">{moneda.format(Number(item.montoPromedio || 0))} <span className="text-xs font-normal text-slate-text">promedio</span></p>
      <div className="space-y-1 border-t border-border-line/40 pt-3 text-xs text-slate-text"><p>{item.cobrosDetectados} cobros registrados · último: {fecha.format(new Date(`${item.ultimoCobro}T00:00:00Z`))}</p><p>Próximo estimado: {fecha.format(new Date(`${item.proximoCobro}T00:00:00Z`))}</p></div>
    </Card></li>)}</ul>}
  </section>;
}
