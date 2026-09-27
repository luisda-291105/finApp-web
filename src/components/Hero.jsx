/**
 * @uso        Sección Hero principal con estética editorial oscura y mini-dashboard Fluid Glass
 * @funciones  Hero({ alAbrirAuth })
 * @datos      Recibe alAbrirAuth como prop
 * @eventos    click en botones CTA
 * @estados    Usa hook useReveal para animación de scroll
 * @usadoPor   App.jsx
 */
import { useReveal } from "../hooks/useReveal";

/**
 * Hero
 * Renderiza el titular editorial de FinApp y el card resumen estilo visionOS.
 * @param {Object} props
 * @param {(modo: 'login' | 'registro') => void} props.alAbrirAuth - Callback para abrir modal
 */
export default function Hero({ alAbrirAuth }) {
  const { ref, visible } = useReveal({ threshold: 0.1 });

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-[#0f1117] via-[#142820] to-[#12362b] pt-28 md:pt-32 pb-24 px-6 text-center"
    >
      {/* Capa de grilla técnica de fondo */}
      <div className="hero-grid absolute inset-0 pointer-events-none opacity-40" aria-hidden="true" />

      {/* Sutil halo orgánico de color esmeralda */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1a7a5e]/25 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-5xl mx-auto transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1a7a5e]/70 bg-[#1a7a5e]/20 text-[#6ee7c0] text-xs font-semibold tracking-wider uppercase mb-8 shadow-xs">
          FINANZAS PERSONALES SIMPLES
        </div>

        {/* Titular principal en Fraunces */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-white tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
          Controla tu dinero,<br />
          <span className="italic text-[#6ee7c0] font-light">decide tu futuro</span>
        </h1>

        {/* Subtítulo ligero */}
        <p className="text-white/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Registra ahorros, gastos, ingresos y movimientos varios en un solo lugar.<br className="hidden sm:inline" />
          Sin complicaciones, sin costos ocultos.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            type="button"
            onClick={() => alAbrirAuth("registro")}
            className="w-full sm:w-auto bg-[#1a7a5e] hover:bg-[#15634c] text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-900/50 cursor-pointer flex items-center justify-center gap-2"
          >
            Crear cuenta gratis <span>→</span>
          </button>
          <a
            href="#funcionalidades"
            className="w-full sm:w-auto border border-white/20 hover:border-white/40 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center backdrop-blur-xs"
          >
            Ver funciones
          </a>
        </div>

        {/* Mini-dashboard card (Fluid Glass) */}
        <div className="glass-hero max-w-xl mx-auto p-6 md:p-8 text-left shadow-2xl">
          <div className="text-[11px] font-semibold tracking-widest text-[#6ee7c0]/80 uppercase mb-4">
            RESUMEN — SEPTIEMBRE 2026
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {/* Ingresos */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 transition-colors hover:bg-white/[0.08]">
              <div className="text-xs text-white/60 font-medium mb-1">Ingresos</div>
              <div className="text-xl md:text-2xl font-bold text-[#60a5fa]">$ 3,200</div>
            </div>

            {/* Gastos */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 transition-colors hover:bg-white/[0.08]">
              <div className="text-xs text-white/60 font-medium mb-1">Gastos</div>
              <div className="text-xl md:text-2xl font-bold text-[#f87171]">$ 1,480</div>
            </div>

            {/* Ahorro */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 transition-colors hover:bg-white/[0.08]">
              <div className="text-xs text-white/60 font-medium mb-1">Ahorro</div>
              <div className="text-xl md:text-2xl font-bold text-[#6ee7c0]">$ 900</div>
            </div>

            {/* Otro */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 transition-colors hover:bg-white/[0.08]">
              <div className="text-xs text-white/60 font-medium mb-1">Otro</div>
              <div className="text-xl md:text-2xl font-bold text-[#c084fc]">$ 120</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
