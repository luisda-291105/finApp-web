/**
 * @uso        Página de transacciones del dashboard
 * @funciones  PaginaDashboardTransacciones()
 * @datos      Texto placeholder fijo; sin backend ni persistencia
 * @eventos    click en Nueva transacción
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/transacciones)
 */

import { Plus } from "lucide-react";
import { Card } from "../components/ui/Card";

export default function PaginaDashboardTransacciones() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">
            Transacciones
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Consulta y organiza tus movimientos recientes.
          </p>
        </div>

        <button
          type="button"
          aria-label="Agregar nueva transacción"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nueva transacción</span>
        </button>
      </div>
      <Card className="p-6">
        <p className="text-slate-text">
          Consulta y organiza tus movimientos recientes.
        </p>
      </Card>
    </section>
  );
}
