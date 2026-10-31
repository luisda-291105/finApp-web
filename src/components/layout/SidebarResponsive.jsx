import clsx from "clsx";
import SidebarNavContenido from "./SidebarNavContenido";
import { useTema } from "../../context/TemaContext";

/** SidebarResponsive
 * @uso        Navegación lateral permanente de pantallas grandes (≥768px), colapsable, con logo toggle y avatar
 * @funciones  SidebarResponsive({ colapsada, alToggleColapso, alAbrirUserModal })
 * @datos      5 enlaces compartidos; avatar desde SidebarNavContenido; el cierre de sesión vive en DashboardUserModal
 * @eventos    click en enlaces, click en logo toggle, click en avatar
 * @estados    colapsada (boolean, controlada desde padre via useBreakpoint)
 * @usadoPor   DashboardLayout
 * 
 * Navegación lateral fija de pantallas grandes (≥768px), colapsable, con fondo dark glass y navegación compartida.
 * El estado colapsado/expandido se controla desde el padre (DashboardLayout via useBreakpoint).
 * El logo no navega: solo alterna colapso.
 *
 * @param {Object} props
 * @param {boolean} props.colapsada - Si la sidebar está colapsada (solo iconos)
 * @param {() => void} props.alToggleColapso - Callback al click en el área del logo
 * @param {() => void} props.alAbrirUserModal - Callback al click en el avatar de usuario
 */

export default function SidebarResponsive({ colapsada, alToggleColapso, alAbrirUserModal }) {
  const { tema } = useTema();
  const temaClaro = tema === "claro";
  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-screen z-40 transition-all duration-300",
        temaClaro ? "bg-bg-cream/95 glass-surface border-r border-border-line/70 shadow-lg" : "bg-bg-dark/80 glass-surface border-r border-border-line/20",
        "flex flex-col overflow-hidden",
        colapsada ? "w-[72px]" : "w-64",
      )}
      role="navigation"
      aria-label="Navegación principal del dashboard"
      data-collapsed={colapsada}
    >
      {/* Área del logo / toggle colapso */}
      <div className={clsx("flex items-center px-3 py-4 border-b min-h-[64px] overflow-hidden", temaClaro ? "border-border-line/70" : "border-border-line/20")}>
        <button
          type="button"
          onClick={alToggleColapso}
          className={clsx(
            "flex items-center w-full min-w-0 rounded-lg transition-colors",
            "hover:bg-emerald-primary/10 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-mint-accent/50 focus-visible:ring-offset-2",
            temaClaro ? "focus-visible:ring-offset-bg-cream" : "focus-visible:ring-offset-bg-dark",
            colapsada ? "justify-center" : "justify-start gap-0",
          )}
          aria-expanded={!colapsada}
          aria-label={colapsada ? "Expandir navegación" : "Colapsar navegación"}
        >
          {colapsada ? (
            <span className="font-display text-xl font-medium text-emerald-primary" aria-hidden="true">
              F
            </span>
          ) : (
            <span className={clsx("flex items-center whitespace-nowrap font-display text-xl font-medium", temaClaro ? "text-bg-dark" : "text-bg-cream")}>
              <span className="text-emerald-primary">Fin</span>
              <span>App</span>
            </span>
          )}
        </button>
      </div>

      {/* Enlaces desplazables y avatar separado al pie */}
      <div className="flex-1 min-h-0 flex flex-col">
        <SidebarNavContenido
          alAbrirUserModal={alAbrirUserModal}
          colapsada={colapsada}
          avatarSeparado
          temaClaro={temaClaro}
        />
      </div>
    </aside>
  );
}
