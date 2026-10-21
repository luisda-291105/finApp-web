/**
 * @uso        Página informativa de Contactos del dashboard, limitada a contenido de demostración
 * @funciones  PaginaDashboardContactos()
 * @datos      Texto estático; sin contactos reales, backend ni persistencia
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx (ruta /dashboard/contactos)
 */
import { Card } from "../components/ui/Card";

export default function PaginaDashboardContactos() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          Contactos
        </h1>
      </div>
      <Card className="space-y-2 p-6">
        <p className="text-slate-text">
          Esta sección de FinApp está destinada a organizar información de contactos relacionada
          con tus finanzas.
        </p>
        <p className="text-sm text-slate-text">
          Vista de demostración. No muestra datos de contactos reales.
        </p>
      </Card>
    </section>
  );
}
