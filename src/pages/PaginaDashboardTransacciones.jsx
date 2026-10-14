/**
 * @uso        Página de transacciones del dashboard: placeholder de movimientos
 * @funciones  PaginaDashboardTransacciones()
 * @datos      Texto placeholder fijo; sin backend ni persistencia
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/transacciones)
 */
export default function PaginaDashboardTransacciones() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          Transacciones
        </h1>
      </div>
      <div className="glass-card p-6">
        <p className="text-slate-text">
          Consulta y organiza tus movimientos recientes.
        </p>
      </div>
    </section>
  );
}
