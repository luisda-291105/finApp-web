/**
 * @uso        Sidebar desktop colapsable con navegación, logo toggle, usuario y logout
 * @funciones  SidebarResponsive({ colapsada, alToggleColapso, alAbrirUserModal })
 * @datos      enlaces fijos (4), usuario desde getUsuarioMock(), logout action
 * @eventos    click en enlaces, click en logo toggle, click en avatar
 * @estados    colapsada (boolean, controlada desde padre via useBreakpoint)
 * @usadoPor   DashboardLayout
 */

import { NavLink } from "react-router-dom";
import { Home, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import SidebarNavContenido from "./SidebarNavContenido";

/**
 * SidebarResponsive
 * Sidebar desktop fija, colapsable, con fondo dark glass y navegación compartida.
 * El estado colapsado/expandido se controla desde el padre (DashboardLayout via useBreakpoint).
 *
 * @param {Object} props
 * @param {boolean} props.colapsada - Si la sidebar está colapsada (solo iconos)
 * @param {() => void} props.alToggleColapso - Callback al click en el área del logo
 * @param {() => void} props.alAbrirUserModal - Callback al click en el avatar de usuario
 */
export default function SidebarResponsive({ colapsada, alToggleColapso, alAbrirUserModal }) {
  const usuario = { nombre: "Usuario Demo", iniciales: "UD", email: "demo@finapp.local" };

  return (
    <aside
      className={clsx(
        "fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] z-40 transition-all duration-300",
        "bg-bg-dark/80 backdrop-blur-md border-r border-border-line/20",
        "flex flex-col overflow-hidden",
        colapsada ? "w-[72px]" : "w-64",
      )}
      role="navigation"
      aria-label="Navegación principal del dashboard"
      data-collapsed={colapsada}
    >
      {/* Área del logo / toggle colapso */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-border-line/20 min-h-[64px]">
        <button
          type="button"
          onClick={alToggleColapso}
          className={clsx(
            "flex items-center gap-2 w-full transition-colors rounded-lg",
            "hover:bg-emerald-primary/10 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-mint-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark",
          )}
          aria-expanded={!colapsada}
          aria-label={colapsada ? "Expandir navegación" : "Colapsar navegación"}
        >
          {colapsada ? (
            <>
              <NavLink
                to="/dashboard"
                title="Inicio"
                className="flex items-center justify-center"
                aria-label="Inicio"
              >
                <Home className="w-6 h-6 flex-shrink-0 text-emerald-primary" aria-hidden="true" />
              </NavLink>
              <ChevronRight className="w-5 h-5 flex-shrink-0 text-slate-text" aria-hidden="true" />
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                className="flex items-center gap-1 font-display text-xl font-medium text-bg-cream truncate"
                aria-label="FinApp - Inicio"
              >
                <span className="text-emerald-primary">Fin</span>
                <span>App</span>
              </NavLink>
              <ChevronLeft className="w-5 h-5 flex-shrink-0 text-slate-text" aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {/* Navegación principal - usa SidebarNavContenido */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <SidebarNavContenido alAbrirUserModal={alAbrirUserModal} colapsada={colapsada} />
      </div>
    </aside>
  );
}