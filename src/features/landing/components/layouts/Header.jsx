/**
 * @uso        Barra de acceso de la landing: logo, título de la sección actual y acceso, sin fijarse ni efectos de scroll
 * @funciones  Header({ alAbrirAuth, modo, seccionActiva })
 * @datos      Recibe alAbrirAuth, modo y seccionActiva como props
 * @eventos    click en botones de login/registro
 * @estados    Ninguno
 * @usadoPor   LandingLayout
 */
import { Link } from "react-router-dom";
import logoOscuro from "../../../../assets/logo-oscuro.webp";

/**
 * Header
 * Muestra el logotipo de FinApp y las acciones de acceso rápido. Posición absoluta en la parte
 * superior: no permanece fija al hacer scroll.
 * @param {Object} props
 * @param {(modo: 'login' | 'registro') => void} [props.alAbrirAuth] - Callback para abrir modal (requerido en modo landing)
 * @param {'landing' | 'dashboard'} [props.modo='landing'] - Modo de visualización
 * @param {string} [props.seccionActiva='Inicio'] - Título de la sección actual, mostrado junto al logo
 * @param {boolean} [props.oculto=false] - Oculta el header (p. ej. mientras el modal de acceso está abierto)
 */
export default function Header({
  alAbrirAuth,
  modo = "landing",
  oculto = false,
  seccionActiva = "Inicio",
}) {
  if (oculto) return null;

  return (
    <header className="absolute top-0 left-0 right-0 z-[1100] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logotipo FinApp */}
        <Link to="/" className="flex items-center" aria-label="FinApp">
          <img
            src={logoOscuro}
            alt="FinApp"
            className="h-7 w-auto sm:h-8"
          />
          <span className="hidden gap-0 font-display text-lg sm:inline">
            <span className="text-mint-accent">Fin</span>
            <span className="text-white">App</span>
          </span>
        </Link>

        {/* Título de la sección actual */}
        <span
          key={seccionActiva}
          id="titulo-seccion"
          aria-live="polite"
          className="titulo-seccion border-l border-white/10 pl-3 sm:pl-4 text-[11px] sm:text-xs font-semibold uppercase leading-none tracking-[0.18em] text-white/70 whitespace-nowrap"
        >
          {seccionActiva}
        </span>

        {/* Acciones de autenticación (solo en modo landing) */}
        {modo === "landing" && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => alAbrirAuth?.("login")}
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-white/20 bg-emerald-primary text-white shadow-sm hover:bg-emerald-hover hover:border-emerald-primary transition-colors duration-400 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {/* Placeholder para menú de usuario futuro (modo dashboard) */}
        {modo === "dashboard" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-text">Usuario</span>
          </div>
        )}
      </div>
    </header>
  );
}
