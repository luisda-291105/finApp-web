/**
 * @uso        Header exclusivo del dashboard (fijo, sin transición scroll)
 * @funciones  DashboardHeader({ alAbrirDrawer, alToggleSidebar, sidebarColapsada, usuario, alAbrirUserModal, isMobile, isTablet, isDesktop })
 * @datos      Recibe props de callbacks, estado de sidebar y datos de usuario; breakpoints vía props
 * @eventos    Click en logo, toggle sidebar, hamburguesa (drawer), avatar (modal usuario)
 * @estados    Ninguno (componente controlado por props)
 * @usadoPor   DashboardLayout
 */

import { Link } from "react-router-dom";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

/**
 * DashboardHeader
 * Barra superior fija del dashboard con logo, toggle de sidebar (desktop), hamburguesa (tablet)
 * y avatar de usuario. Sin transición por scroll; usa tokens puros del tema.
 * @param {Object} props
 * @param {() => void} props.alAbrirDrawer - Callback para abrir drawer en tablet (hamburguesa)
 * @param {() => void} props.alToggleSidebar - Callback para colapsar/expandir sidebar en desktop
 * @param {boolean} props.sidebarColapsada - Estado actual del sidebar (desktop) para icono chevron
 * @param {{ nombre: string, iniciales: string, email: string }} props.usuario - Datos del usuario (getUsuarioMock())
 * @param {() => void} props.alAbrirUserModal - Callback al click en avatar para abrir modal de usuario
 * @param {boolean} props.isMobile - True en breakpoint mobile (< 640px)
 * @param {boolean} props.isTablet - True en breakpoint tablet (640px - 1023px)
 * @param {boolean} props.isDesktop - True en breakpoint desktop (>= 1024px)
 */
export default function DashboardHeader({
  alAbrirDrawer,
  alToggleSidebar,
  sidebarColapsada,
  usuario,
  alAbrirUserModal,
  isMobile,
  isTablet,
  isDesktop,
}) {
  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 w-full",
        "bg-bg-cream/92 backdrop-blur-md border-b border-border-line py-3.5 shadow-sm",
        "h-[var(--header-height)]",
      )}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Lado izquierdo: logo + toggle sidebar (desktop) / hamburguesa (tablet) / nada (mobile) */}
        <div className="flex items-center gap-4">
          {/* Desktop: logo + botón toggle sidebar */}
          {isDesktop && (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-0.5 text-2xl font-display font-bold tracking-tight text-bg-dark"
                aria-label="FinApp - Inicio del dashboard"
              >
                <span className="text-emerald-primary">Fin</span>
                <span>App</span>
              </Link>
              <button
                type="button"
                onClick={alToggleSidebar}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  "hover:bg-emerald-primary/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary/50",
                )}
                aria-label={sidebarColapsada ? "Expandir barra lateral" : "Colapsar barra lateral"}
                aria-expanded={!sidebarColapsada}
              >
                {sidebarColapsada ? (
                  <ChevronRight className="w-5 h-5 text-bg-dark" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-bg-dark" aria-hidden="true" />
                )}
              </button>
            </>
          )}

          {/* Tablet: solo botón hamburguesa para abrir drawer */}
          {isTablet && (
            <button
              type="button"
              onClick={alAbrirDrawer}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                "hover:bg-emerald-primary/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary/50",
              )}
              aria-label="Abrir menú de navegación"
              aria-expanded="false"
              aria-controls="sidebar-drawer"
            >
              <Menu className="w-5 h-5 text-bg-dark" aria-hidden="true" />
            </button>
          )}

          {/* Mobile: nada en el header (logo va en bottom nav) */}
        </div>

        {/* Lado derecho: avatar de usuario */}
        <button
          type="button"
          onClick={alAbrirUserModal}
          className={clsx(
            "relative w-8 h-8 rounded-full bg-emerald-primary text-bg-cream font-medium",
            "flex items-center justify-center",
            "transition-colors hover:bg-emerald-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-cream",
          )}
          aria-label={`Menú de usuario: ${usuario.nombre}`}
          aria-expanded="false"
          aria-haspopup="dialog"
        >
          {usuario.iniciales}
        </button>
      </div>
    </header>
  );
}