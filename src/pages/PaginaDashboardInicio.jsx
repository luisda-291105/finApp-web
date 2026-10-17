/**
 * @uso        Página de inicio del dashboard: cifras de ejemplo de la cuenta
 * @funciones  PaginaDashboardInicio()
 * @datos      Cifras de demostración fijas en JSX; sin backend ni persistencia
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard)
 */
import { Card } from "../components/ui/Card";

export default function PaginaDashboardInicio() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          Tu dinero, en equilibrio.
        </h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card como="article" className="p-5">
          <p className="text-sm text-slate-text">Balance disponible</p>
          <p className="mt-3 text-2xl font-semibold text-bg-dark">$12,480.50</p>
        </Card>
        <Card como="article" className="p-5">
          <p className="text-sm text-slate-text">Ingresos del mes</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-primary">$4,250.00</p>
        </Card>
        <Card como="article" className="p-5">
          <p className="text-sm text-slate-text">Gastos del mes</p>
          <p className="mt-3 text-2xl font-semibold text-bg-dark">$1,820.75</p>
        </Card>
      </div>
    </section>
  );
}
