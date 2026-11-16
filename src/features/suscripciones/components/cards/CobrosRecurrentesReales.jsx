/**
 * @uso        Mostrar cobros recurrentes inferidos de movimientos reales
 * @funciones  CobrosRecurrentesReales({ datos, cargando, error })
 * @datos      DTOs del endpoint movimiento/recurrentes
 * @eventos    Ninguno (las notificaciones de error se muestran en la pila lateral de la página)
 * @estados    Renderiza carga, métricas y resultados; colapsable en móvil
 * @usadoPor   SuscripcionesPage
 */
import { useState } from "react";
import { CalendarClock, ChevronDown, CircleDollarSign, Repeat } from "lucide-react";
import { Card } from "../../../../components/ui";
import { AlertaGlobal } from "../../../../components/ui/alertas";

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

/** Sección con resumen mensual y próxima fecha prevista. */
export default function CobrosRecurrentesReales({ datos, cargando, error }) {
  const [colapsadoMovil, setColapsadoMovil] = useState(true);
  const mensualEstimado = datos.reduce(
    (total, item) =>
      total +
      (Number(item.montoPromedio || 0) * 30) /
        Math.max(1, Number(item.intervaloDias || 30)),
    0,
  );
  const proximo = datos
    .filter((item) => item.proximoCobro)
    .sort((a, b) => a.proximoCobro.localeCompare(b.proximoCobro))[0];

  return (
    <section aria-labelledby="cobros-recurrentes-titulo" className="space-y-4">
      <button
        type="button"
        onClick={() => setColapsadoMovil((actual) => !actual)}
        aria-expanded={!colapsadoMovil}
        aria-controls="cobros-recurrentes-contenido"
        className="flex w-full items-start justify-between gap-3 text-left sm:cursor-default"
      >
        <div className="min-w-0">
          <h2
            id="cobros-recurrentes-titulo"
            className="font-display text-xl font-semibold text-bg-dark"
          >
            Cobros recurrentes detectados
          </h2>
          <p className="mt-1 text-sm text-slate-text">
            Estimación basada en tus gastos registrados; confirma los servicios y
            montos.
          </p>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={`mt-1 h-5 w-5 shrink-0 text-slate-text transition-transform sm:hidden ${colapsadoMovil ? "" : "rotate-180"}`}
        />
      </button>

      <div id="cobros-recurrentes-contenido" className={`${colapsadoMovil ? "hidden" : "block"} space-y-4 sm:block`}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-slate-text">
              <CircleDollarSign className="h-4 w-4 text-emerald-primary" aria-hidden="true" />
              <span className="hidden sm:inline">Gasto recurrente estimado / mes</span>
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
            <p className="mt-2 font-display text-xl font-semibold text-bg-dark">{datos.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-slate-text">
              <CalendarClock className="h-4 w-4 text-emerald-primary" aria-hidden="true" />
              <span className="hidden sm:inline">Próximo cobro estimado</span>
            </div>
            <p className="mt-2 font-display text-lg font-semibold text-bg-dark">
              {proximo
                ? `${proximo.nombre} · ${fecha.format(new Date(`${proximo.proximoCobro}T00:00:00Z`))}`
                : "Sin cobros previstos"}
            </p>
          </Card>
        </div>
        {cargando && (
          <p role="status" className="text-sm text-slate-text">
            Analizando tus gastos registrados…
          </p>
        )}
        {!cargando && !error && datos.length === 0 && (
          <AlertaGlobal
            tipo="advertencia"
            duracionMs={6000}
            idBase="cobros-recurrentes-sin-datos"
            mensaje="Aún no hay suficientes gastos periódicos registrados para detectar suscripciones. Registra al menos dos cobros del mismo servicio con una frecuencia regular."
          />
        )}
        {!cargando && datos.length > 0 && (
          <ul
            aria-label="Cobros recurrentes detectados"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {datos.map((item) => (
              <li key={item.id}>
                <Card className="h-full space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-semibold text-bg-dark">
                        {item.nombre}
                      </h3>
                      <p className="text-sm text-slate-text">{item.categoria}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary">
                      {item.frecuencia}
                    </span>
                  </div>
                  <p className="font-semibold tabular-nums text-bg-dark">
                    {moneda.format(Number(item.montoPromedio || 0))}{" "}
                    <span className="text-xs font-normal text-slate-text">promedio</span>
                  </p>
                  <div className="space-y-1 border-t border-border-line/40 pt-3 text-xs text-slate-text">
                    <p>
                      {item.cobrosDetectados} cobros registrados · último:{" "}
                      {fecha.format(new Date(`${item.ultimoCobro}T00:00:00Z`))}
                    </p>
                    <p>
                      Próximo estimado:{" "}
                      {fecha.format(new Date(`${item.proximoCobro}T00:00:00Z`))}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
