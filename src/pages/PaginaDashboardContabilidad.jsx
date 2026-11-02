/**
 * @uso        Resumen contable demostrativo para consultar saldos y movimientos
 * @funciones  PaginaDashboardContabilidad({ movimientos })
 * @datos      Usa movimientos de demostración fijos; admite una lista vacía para su estado vacío
 * @eventos    Ninguno; «Nuevo movimiento» está deshabilitado en esta demostración
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/contabilidad)
 */

import { ArrowDownRight, ArrowUpRight, PiggyBank, Plus, Wallet } from "lucide-react";
import { Card } from "../components/ui/Card";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const indicadores = [
  { etiqueta: "Gastos", monto: 277000, icono: ArrowDownRight, tono: "text-cat-expense", fondo: "bg-cat-expense/10" },
  { etiqueta: "Ahorros", monto: 450000, icono: PiggyBank, tono: "text-emerald-primary", fondo: "bg-emerald-primary/10" },
  { etiqueta: "Balance disponible", monto: 3073000, icono: Wallet, tono: "text-cat-income", fondo: "bg-cat-income/10" },
];

const MOVIMIENTOS_DEMO = [
  { id: "movimiento-1", fecha: "2025-02-13", concepto: "Pago de nómina", monto: 3800000, tipo: "Ingreso" },
  { id: "movimiento-2", fecha: "2025-02-12", concepto: "Mercado semanal", monto: -185000, tipo: "Gasto" },
  { id: "movimiento-3", fecha: "2025-02-10", concepto: "Servicios del hogar", monto: -92000, tipo: "Gasto" },
  { id: "movimiento-4", fecha: "2025-02-05", concepto: "Aporte a ahorros", monto: -450000, tipo: "Ahorro" },
];

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Muestra el resumen contable y movimientos de demostración sin conexión a servicios.
 * @param {Object} props
 * @param {Array<{id: string, fecha: string, concepto: string, monto: number, tipo: string}>} [props.movimientos]
 * @returns {JSX.Element}
 */
export default function PaginaDashboardContabilidad({ movimientos = MOVIMIENTOS_DEMO }) {
  return (
    <section aria-labelledby="contabilidad-titulo" className="space-y-6 pt-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="contabilidad-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">
            Contabilidad
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Revisa tus gastos, ahorros y balance disponible.
          </p>
        </div>
        <button
          type="button"
          disabled
          aria-describedby="movimientos-demo-aviso"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream opacity-50 shadow-sm cursor-not-allowed"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo movimiento
        </button>
      </header>

      <p id="movimientos-demo-aviso" className="sr-only">
        El registro de movimientos no está disponible en esta demostración.
      </p>

      <section aria-labelledby="resumen-contable-titulo" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="resumen-contable-titulo" className="font-display text-xl font-semibold text-bg-dark">
            Resumen contable
          </h2>
          <span className="rounded-full bg-emerald-primary/10 px-3 py-1 text-xs font-medium text-emerald-primary">
            Datos de demostración
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {indicadores.map(({ etiqueta, monto, icono: Icono, tono, fondo }) => (
            <Card key={etiqueta} como="article" aria-labelledby={`indicador-${etiqueta.toLowerCase().replaceAll(" ", "-")}`} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 id={`indicador-${etiqueta.toLowerCase().replaceAll(" ", "-")}`} className="text-sm font-medium text-slate-text">
                    {etiqueta}
                  </h3>
                  <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-bg-dark">
                    {formatoMoneda.format(monto)}
                  </p>
                </div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${fondo} ${tono}`}>
                  <Icono className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card como="section" aria-labelledby="movimientos-titulo" className="overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-border-line/60 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="movimientos-titulo" className="font-display text-xl font-semibold text-bg-dark">
              Movimientos recientes
            </h2>
            <p className="mt-1 text-sm text-slate-text">Actividad de ejemplo para la vista previa contable.</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-text">Demostración</span>
        </div>

        {movimientos.length > 0 ? (
          <ul aria-label="Movimientos de demostración" className="divide-y divide-border-line/50 px-5">
            {movimientos.map((movimiento) => {
              const esIngreso = movimiento.monto > 0;
              const IconoMovimiento = esIngreso ? ArrowUpRight : ArrowDownRight;
              const tonoMovimiento = esIngreso ? "text-cat-income" : movimiento.tipo === "Ahorro" ? "text-emerald-primary" : "text-cat-expense";
              const fecha = new Date(`${movimiento.fecha}T00:00:00Z`);

              return (
                <li key={movimiento.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-cream ${tonoMovimiento}`}>
                      <IconoMovimiento className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-bg-dark">{movimiento.concepto}</p>
                      <time className="text-sm text-slate-text" dateTime={movimiento.fecha}>
                        {formatoFecha.format(fecha)}
                      </time>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0">
                    <span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-medium text-slate-text">
                      {movimiento.tipo}
                    </span>
                    <span className={`min-w-28 text-right font-medium tabular-nums ${tonoMovimiento}`}>
                      {esIngreso ? "+" : "−"}{formatoMoneda.format(Math.abs(movimiento.monto))}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-slate-text">Sin movimientos registrados</p>
        )}
      </Card>
    </section>
  );
}
