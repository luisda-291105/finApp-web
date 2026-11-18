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
      className="grid gap-3 sm:grid-cols-3"
    >
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-slate-text">
          <CircleDollarSign
            className="h-4 w-4 text-emerald-primary"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">
            Gasto recurrente estimado / mes
          </span>
        </div>
        <p className="mt-2 font-display text-xl font-semibold text-bg-dark">
          {moneda.format(mensualEstimado)}
        </p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-slate-text">
          <Repeat className="h-4 w-4 text-emerald-primary" aria-hidden="true" />
          <span className="hidden sm:inline">Servicios detectados</span>
        </div>
        <p className="mt-2 font-display text-xl font-semibold text-bg-dark">
          {datos.length}
        </p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-slate-text">
          <CalendarClock
            className="h-4 w-4 text-emerald-primary"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">Próximo cobro estimado</span>
        </div>
        <p className="mt-2 font-display text-lg font-semibold text-bg-dark">
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
