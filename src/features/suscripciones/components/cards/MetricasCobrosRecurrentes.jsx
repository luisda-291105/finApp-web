/**
 * @uso        Mostrar el resumen de cobros recurrentes (suscripciones con monto y fecha de cobro y pagos repetidos de Contabilidad)
 * @funciones  MetricasCobrosRecurrentes({ datos, cargando })
 * @datos      DTOs de cobros recurrentes de /suscripcion/recurrentes y /movimiento/recurrentes
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   SuscripcionesPage
 */
import { CalendarClock, CircleDollarSign, Repeat } from "lucide-react";
import { Card } from "../../../../components/ui";

const moneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const fecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Tarjetas de métricas; viven fuera de la sección "Todas las suscripciones". */
export default function MetricasCobrosRecurrentes({ datos, cargando }) {
  const mensualEstimado = datos.reduce(
    (total, item) =>
      total +
      (Number(item.monto || 0) * 30) /
        Math.max(1, Number(item.intervaloDias || 30)),
    0,
  );
  const proximo = datos
    .filter((item) => item.proximoCobro)
    .sort((a, b) => a.proximoCobro.localeCompare(b.proximoCobro))[0];

  return (
    <section
      aria-label="Resumen de cobros recurrentes"
      className="grid grid-cols-3 gap-2 sm:gap-3"
    >
      <Card className="min-w-0 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-text sm:gap-2 sm:text-sm">
          <CircleDollarSign
            className="h-4 w-4 shrink-0 text-emerald-primary"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">
            Gasto recurrente estimado / mes
          </span>
        </div>
        <p className="mt-1.5 break-words font-display text-base font-semibold tabular-nums text-bg-dark sm:mt-2 sm:text-xl">
          {moneda.format(mensualEstimado)}
        </p>
      </Card>
      <Card className="min-w-0 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-text sm:gap-2 sm:text-sm">
          <Repeat
            className="h-4 w-4 shrink-0 text-emerald-primary"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">Servicios detectados</span>
        </div>
        <p className="mt-1.5 font-display text-base font-semibold tabular-nums text-bg-dark sm:mt-2 sm:text-xl">
          {datos.length}
        </p>
      </Card>
      <Card className="min-w-0 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-text sm:gap-2 sm:text-sm">
          <CalendarClock
            className="h-4 w-4 shrink-0 text-emerald-primary"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">Próximo cobro estimado</span>
        </div>
        <p className="mt-1.5 break-words font-display text-[11px] font-semibold leading-snug text-bg-dark sm:mt-2 sm:text-lg">
          {proximo
            ? `${proximo.nombre} · ${fecha.format(new Date(`${proximo.proximoCobro}T00:00:00Z`))}`
            : "Sin cobros previstos"}
        </p>
      </Card>
      {cargando && (
        <p role="status" className="text-sm text-slate-text sm:col-span-3">
          Revisando tus suscripciones y gastos registrados…
        </p>
      )}
      {!cargando && datos.length === 0 && (
        <p className="text-xs leading-relaxed text-slate-text sm:col-span-3">
          Los cobros recurrentes salen de tus suscripciones con monto y fecha de
          cobro y de los pagos repetidos del mismo servicio en Contabilidad.
        </p>
      )}
    </section>
  );
}
