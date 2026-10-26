/**
 * @uso        Página de Correos del dashboard
 * @funciones  PaginaDashboardCorreos()
 * @datos      Texto estático; sin correos reales, backend ni persistencia
 * @eventos    click en Nuevo correo
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/correos)
 */

import { Plus } from "lucide-react";
import { Card } from "../components/ui/Card";

export default function PaginaDashboardCorreos() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">
            Correos
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Reúne correos relacionados con tu actividad financiera.
          </p>
        </div>

        <button
          type="button"
          aria-label="Agregar nuevo correo"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nuevo correo</span>
        </button>
      </div>
      <Card className="space-y-2 p-6">
        <p className="text-slate-text">
          Esta sección de FinApp está pensada para reunir correos relacionados con tu actividad
          financiera.
        </p>
        <p className="text-sm text-slate-text">
          Vista de demostración. No muestra correos reales ni se conecta a cuentas.
        </p>
      </Card>
    </section>
  );
}
