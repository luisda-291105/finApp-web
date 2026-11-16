/**
 * @uso        Barra de navegación con efecto transparente en Hero y transición a blur al scroll
 * @funciones  Header({ alAbrirAuth, modo })
 * @datos      Recibe alAbrirAuth y modo como props
 * @eventos    scroll en window, click en botones de login/registro
 * @estados    desplazado (boolean)
 * @usadoPor   features/landing y DashboardLayout.jsx
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoClaro from "../../assets/logo-claro.webp";
import logoOscuro from "../../assets/logo-oscuro.webp";

/**
 * Header
 * Muestra el logotipo de FinApp y las acciones de acceso rápido con transición dinámica según scroll.
 * @param {Object} props
 * @param {(modo: 'login' | 'registro') => void} [props.alAbrirAuth] - Callback para abrir modal (requerido en modo landing)
 * @param {'landing' | 'dashboard'} [props.modo='landing'] - Modo de visualización
 * @param {boolean} [props.oculto=false] - Oculta el header (p. ej. mientras el modal de acceso está abierto)
 */
export default function Header({ alAbrirAuth, modo = "landing", oculto = false }) {
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    const manejarScroll = () => {
      setDesplazado(window.scrollY > 20);
    };

    manejarScroll();
    window.addEventListener("scroll", manejarScroll, { passive: true });
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  if (oculto) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1100] w-full transition-all duration-400 ease-in-out ${
        desplazado
          ? "glass-surface border-b border-border-line bg-bg-cream/95 py-3.5 shadow-sm"
          : "border-b border-transparent bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logotipo FinApp */}
        <Link to="/" className="flex items-center" aria-label="FinApp">
          <img src={logoClaro} alt="FinApp" className="logo-tema-claro h-8 w-auto sm:h-9" />
          <img src={logoOscuro} alt="" aria-hidden="true" className="logo-tema-oscuro h-8 w-auto sm:h-9" />
        </Link>

        {/* Acciones de autenticación (solo en modo landing) */}
        {modo === "landing" && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => alAbrirAuth?.("login")}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-400 cursor-pointer ${
                desplazado
                  ? "bg-bg-cream/80 text-bg-dark hover:bg-bg-cream hover:text-emerald-primary"
                  : "bg-bg-cream/10 text-bg-cream/90 hover:bg-bg-cream/20 hover:text-bg-cream"
              }`}
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
