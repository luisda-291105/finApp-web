/**
 * @uso        Grid de tarjetas de demostración para la sección "tarjetas" del dashboard
 * @funciones  PanelTarjetas()
 * @datos      Constante interna tarjetasDemo (nombre, últimos 4 dígitos, saldo)
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx (DashboardSection)
 */

const tarjetasDemo = [
  { nombre: "Tarjeta Oro", ultimos4: "4242", saldo: "$2,340.00" },
  { nombre: "Tarjeta Platino", ultimos4: "5300", saldo: "$980.25" },
  { nombre: "Débito Nómina", ultimos4: "7841", saldo: "$5,120.75" },
];

/**
 * PanelTarjetas
 * Muestra el grid de tarjetas de demostración con nombre, número enmascarado
 * y saldo, equivalente al grid de la sección inicio, con la nota "Datos de
 * demostración" bajo el grid. Datos ficticios.
 */
export default function PanelTarjetas() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {tarjetasDemo.map(({ nombre, ultimos4, saldo }) => (
          <article key={nombre} className="glass-card p-5">
            <p className="text-sm text-slate-text">{nombre}</p>
            <p className="text-sm text-slate-text">•••• {ultimos4}</p>
            <p className="mt-3 text-2xl font-semibold text-bg-dark">{saldo}</p>
          </article>
        ))}
      </div>
      <p className="text-sm text-slate-text">Datos de demostración</p>
    </div>
  );
}
