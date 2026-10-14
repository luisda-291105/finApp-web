/**
 * @uso        Página de tarjetas del dashboard: compone el panel de tarjetas demo
 * @funciones  PaginaDashboardTarjetas()
 * @datos      Sin datos propios; PanelTarjetas lee TARJETAS_DEMO del fixture
 * @eventos    Ninguno (el modal de detalle lo gestiona PanelTarjetas)
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/tarjetas)
 */
import PanelTarjetas from "./PanelTarjetas";

export default function PaginaDashboardTarjetas() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          Tus tarjetas
        </h1>
      </div>
      <PanelTarjetas />
    </section>
  );
}
