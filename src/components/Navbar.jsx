/**
 * @uso        Barra de navegación principal sticky con efecto blur y accesos de autenticación
 * @funciones  Navbar({ alAbrirAuth })
 * @datos      Recibe alAbrirAuth como prop
 * @eventos    scroll en window, click en botones de login/registro
 * @estados    desplazado (boolean)
 * @usadoPor   App.jsx
 */
import { useEffect, useState } from "react";

/**
 * Navbar
 * Muestra el logotipo de FinApp y las acciones de acceso rápido.
 * @param {Object} props
 * @param {(modo: 'login' | 'registro') => void} props.alAbrirAuth - Callback para abrir modal
 */
export default function Navbar({ alAbrirAuth }) {
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    const manejarScroll = () => {
      setDesplazado(window.scrollY > 20);
    };

    window.addEventListener("scroll", manejarScroll, { passive: true });
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        desplazado
          ? "bg-[#f7f6f2]/90 backdrop-blur-md border-b border-[#e0ddd8] py-3 shadow-sm"
          : "bg-[#f7f6f2] border-b border-[#e0ddd8]/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-0.5 text-2xl font-bold tracking-tight">
          <span className="text-[#1a7a5e]">Fin</span>
          <span className="text-[#0f1117]">App</span>
        </a>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => alAbrirAuth("login")}
            className="text-sm font-medium text-[#0f1117] hover:text-[#1a7a5e] px-3 py-1.5 transition-colors cursor-pointer"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => alAbrirAuth("registro")}
            className="bg-[#1a7a5e] hover:bg-[#15634c] text-white text-sm font-medium px-5 py-2 rounded-lg transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
          >
            Registrarse
          </button>
        </div>
      </div>
    </header>
  );
}
