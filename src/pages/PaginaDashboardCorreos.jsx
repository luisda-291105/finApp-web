/**
 * @uso        Página informativa de Correos del dashboard, limitada a contenido de demostración
 * @funciones  PaginaDashboardCorreos()
 * @datos      Texto estático; sin correos reales, backend ni persistencia
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/correos)
 */
import { Card } from "../components/ui/Card";

export default function PaginaDashboardCorreos() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          Correos
        </h1>
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
