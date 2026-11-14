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

/**
 * Header
 * Muestra el logotipo de FinApp y las acciones de acceso rápido con transición dinámica según scroll.
 * @param {Object} props
 * @param {(modo: 'login' | 'registro') => void} [props.alAbrirAuth] - Callback para abrir modal (requerido en modo landing)
 * @param {'landing' | 'dashboard'} [props.modo='landing'] - Modo de visualización
 */
export default function Header({ alAbrirAuth, modo = "landing" }) {
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    const manejarScroll = () => {
      setDesplazado(window.scrollY > 20);
    };

    manejarScroll();
    window.addEventListener("scroll", manejarScroll, { passive: true });
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-400 ease-in-out ${
        desplazado
          ? "bg-[#f7f6f2]/92 glass-surface border-b border-[#e0ddd8] py-3.5 shadow-sm"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logotipo FinApp */}
        <Link to="/" className="flex items-center gap-2" aria-label="Ir al inicio de FinApp">
          <picture>
            <source type="image/webp" srcSet="/logo.webp" />
            <img src="/logo.png" alt="FinApp" className="h-9 w-9 rounded-lg object-contain" />
          </picture>
          <span
            className={`hidden sm:inline font-display text-xl font-semibold tracking-tight transition-colors duration-400 ${
              desplazado ? "text-[#0f1117]" : "text-white"
            }`}
          >
            FinApp
          </span>
        </Link>

        {/* Acciones de autenticación (solo en modo landing) */}
        {modo === "landing" && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => alAbrirAuth?.("login")}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-400 cursor-pointer ${
                desplazado
                  ? "text-[#0f1117] hover:text-[#1a7a5e] bg-white/80 hover:bg-white"
                  : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20"
              }`}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {/* Placeholder para menú de usuario futuro (modo dashboard) */}
        {modo === "dashboard" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6b7280]">Usuario</span>
          </div>
        )}
      </div>
    </header>
  );
}
