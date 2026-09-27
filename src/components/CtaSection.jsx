/**
 * @uso        Llamada a la acción final con gradiente editorial oscuro y botón de registro
 * @funciones  CtaSection({ alAbrirAuth })
 * @datos      Recibe alAbrirAuth como prop
 * @eventos    click en botón de comenzar
 * @estados    Usa useReveal para animación
 * @usadoPor   App.jsx
 */
import { useReveal } from "../hooks/useReveal";

/**
 * CtaSection
 * Bloque final que motiva al usuario a crear su cuenta gratuita.
 * @param {Object} props
 * @param {(modo: 'login' | 'registro') => void} props.alAbrirAuth
 */
export default function CtaSection({ alAbrirAuth }) {
  const { ref, visible } = useReveal({ threshold: 0.2 });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#12362b] to-[#0f1117] py-24 px-6 text-center text-white">
      <div className="hero-grid absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

      <div
        ref={ref}
        className={`relative z-10 max-w-3xl mx-auto transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <span className="text-[#6ee7c0] text-xs font-semibold tracking-widest uppercase block mb-4">
          EMPIEZA HOY
        </span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight mb-6 leading-[1.15]">
          Toma el control de tu dinero,<br />
          <span className="italic text-[#6ee7c0]">sin complicaciones</span>
        </h2>
        <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          Únete a miles de personas que organizan su futuro financiero de forma simple y transparente.
        </p>

        <button
          type="button"
          onClick={() => alAbrirAuth("registro")}
          className="bg-[#1a7a5e] hover:bg-[#15634c] text-white font-medium text-base px-9 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-emerald-900/60 cursor-pointer inline-flex items-center gap-2"
        >
          Comenzar ahora gratis <span>→</span>
        </button>
      </div>
    </section>
  );
}
