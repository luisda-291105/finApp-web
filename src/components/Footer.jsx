/**
 * @uso        Pie de página con logotipo, copyright y enlaces legales
 * @funciones  Footer()
 * @datos      N/A
 * @eventos    click en enlaces de navegación
 * @estados    N/A
 * @usadoPor   App.jsx
 */

/**
 * Footer
 * Renderiza el cierre de página y derechos de autor.
 */
export default function Footer() {
  return (
    <footer className="bg-[#0f1117] border-t border-white/10 py-12 px-6 text-white/60 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-0.5 text-xl font-bold tracking-tight">
          <span className="text-[#1a7a5e]">Fin</span>
          <span className="text-white">App</span>
        </div>

        <p className="text-center sm:text-left text-xs text-white/50">
          © {new Date().getFullYear()} FinApp. Todos los derechos reservados. Finanzas personales simples.
        </p>

        <div className="flex items-center gap-6 text-xs text-white/60">
          <a href="#inicio" className="hover:text-white transition-colors">
            Inicio
          </a>
          <a href="#funcionalidades" className="hover:text-white transition-colors">
            Funcionalidades
          </a>
          <a href="#privacidad" className="hover:text-white transition-colors">
            Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}
