/**
 * @uso        Página de tarjetas del dashboard
 * @funciones  PaginaDashboardTarjetas()
 * @datos      Sin datos propios; PanelTarjetas lee TARJETAS_DEMO del fixture
 * @eventos    click en Nueva tarjeta
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/tarjetas)
 */

import { Plus } from "lucide-react";
import PanelTarjetas from "./PanelTarjetas";

export default function PaginaDashboardTarjetas() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">
            Tus tarjetas
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Administra tus tarjetas y revisa sus saldos.
          </p>
        </div>

        <button
          type="button"
          aria-label="Agregar nueva tarjeta"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nueva tarjeta</span>
        </button>
      </div>
      <PanelTarjetas />
    </section>
  );
}
