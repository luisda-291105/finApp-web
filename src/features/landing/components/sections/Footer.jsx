/**
 * @uso        Pie de página con logotipo, copyright y enlaces legales
 * @funciones  Footer()
 * @datos      N/A
 * @eventos    click en enlaces de navegación
 * @estados    N/A
 * @usadoPor   LandingLayout
 */

import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

/**
 * Footer
 * Renderiza el cierre de página y derechos de autor.
 */
export default function Footer() {
  const volverAlInicio = () => {
    const reducirMovimiento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducirMovimiento ? "auto" : "smooth" });
  };

  return (
    <footer className="bg-[#0f1117] border-t border-white/10 py-12 px-6 text-white/60 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <button
          type="button"
          onClick={volverAlInicio}
          aria-label="Volver al inicio de la página"
          className="inline-flex items-center gap-2 rounded-lg text-xl font-bold tracking-tight text-white transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0f1117]"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
          <span><span className="text-[#1a7a5e]">Fin</span>App</span>
        </button>
        <p className="text-center sm:text-left text-xs text-white/50">
          © {new Date().getFullYear()} FinApp. Todos los derechos reservados. Finanzas personales simples.
        </p>

        <div className="flex items-center gap-6 text-xs text-white/60">
          <Link to="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <Link to="#funcionalidades" className="hover:text-white transition-colors">
            Funcionalidades
          </Link>
          <Link to="#privacidad" className="hover:text-white transition-colors">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
