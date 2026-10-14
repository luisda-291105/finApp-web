/**
 * @uso        Página de configuración del dashboard: placeholder de preferencias
 * @funciones  PaginaDashboardConfiguracion()
 * @datos      Texto placeholder fijo; sin backend ni persistencia
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/configuracion)
 */
export default function PaginaDashboardConfiguracion() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          Configuración
        </h1>
      </div>
      <div className="glass-card p-6">
        <p className="text-slate-text">
          Ajusta tus preferencias de cuenta y seguridad.
        </p>
      </div>
    </section>
  );
}
