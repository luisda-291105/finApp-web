/**
 * @uso        Barra lateral de navegación del dashboard (desktop)
 * @funciones  Sidebar()
 * @datos      Sin props; usa NavLink para estado activo
 * @eventos    Navegación vía react-router-dom
 * @estados    Ninguno
 * @usadoPor   DashboardLayout
 */

import { NavLink } from "react-router-dom";

const enlaces = [
  { ruta: "/dashboard", etiqueta: "Inicio" },
  { ruta: "/dashboard/transacciones", etiqueta: "Transacciones" },
  { ruta: "/dashboard/tarjetas", etiqueta: "Tarjetas" },
  { ruta: "/dashboard/configuracion", etiqueta: "Configuración" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-border-line p-4 space-y-2">
      {/* Logo compacto */}
      <NavLink to="/dashboard" className="flex items-center gap-2 px-3 py-2 font-display text-xl font-medium text-bg-dark hover:text-emerald-primary transition-colors" aria-label="FinApp - Inicio">
        <span className="text-emerald-primary">Fin</span><span>App</span>
      </NavLink>

      {/* Navegación principal */}
      <nav className="space-y-1" aria-label="Navegación principal del dashboard">
        {enlaces.map(({ ruta, etiqueta }) => (
          <NavLink
            key={ruta}
            to={ruta}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-emerald-primary/10 text-emerald-primary font-medium"
                  : "text-slate-text hover:bg-emerald-primary/5"
              }`
            }
          >
            {etiqueta}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}