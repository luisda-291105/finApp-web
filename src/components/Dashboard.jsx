/**
 * @uso        Layout navegable para el panel de control FinApp
 * @funciones  Dashboard()
 * @datos      Renderiza la ruta hija mediante Outlet
 * @eventos    Navegación entre secciones del panel
 * @estados    N/A
 * @usadoPor   App.jsx
 */
import { NavLink, Outlet } from "react-router-dom";

const secciones = [
  { ruta: "/dashboard", etiqueta: "Resumen", exacta: true },
  { ruta: "/dashboard/transacciones", etiqueta: "Transacciones" },
  { ruta: "/dashboard/tarjetas", etiqueta: "Tarjetas" },
  { ruta: "/dashboard/configuracion", etiqueta: "Configuración" },
];

/**
 * Dashboard
 * Proporciona navegación persistente y el contenedor del contenido interno.
 */
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-bg-cream text-bg-dark md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="bg-bg-dark px-5 py-6 text-white md:min-h-screen md:px-6">
        <NavLink
          to="/dashboard"
          className="inline-flex items-center gap-2 font-display text-2xl"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-primary font-body text-sm font-bold">
            F
          </span>
          FinApp
        </NavLink>
        <p className="mb-3 mt-9 text-xs font-semibold uppercase text-white/45">
          Finanzas
        </p>
        <nav aria-label="Secciones del dashboard" className="flex gap-2 overflow-x-auto md:flex-col">
          {secciones.map(({ ruta, etiqueta, exacta }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={exacta}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              {etiqueta}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/login"
          className="mt-8 hidden rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/8 hover:text-white md:block"
        >
          Cerrar sesión
        </NavLink>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b border-border-line bg-white px-5 sm:px-8">
          <span className="text-sm font-medium text-slate-text">Panel de control</span>
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-primary/10 text-emerald-primary">M</span>
            María
          </span>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}