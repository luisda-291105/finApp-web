/**
 * @uso        Barra de estadísticas clave con fondo esmeralda sólido
 * @funciones  StatsBar()
 * @datos      Métricas fijas de impacto y satisfacción
 * @eventos    Ninguno
 * @estados    Usa useReveal para animación al entrar en pantalla
 * @usadoPor   App.jsx
 */
import { useReveal } from "../hooks/useReveal";

const METRICAS = [
  { valor: "12 k+", etiqueta: "Usuarios activos" },
  { valor: "98 %", etiqueta: "Satisfacción" },
  { valor: "$2.4 M", etiqueta: "Gestionados" },
  { valor: "0 costo", etiqueta: "Para empezar" },
];

/**
 * StatsBar
 * Muestra 4 métricas destacadas de la plataforma en franja esmeralda.
 */
export default function StatsBar() {
  const { ref, visible } = useReveal();

  return (
    <section className="bg-[#1a7a5e] text-white py-12 px-6 border-y border-[#15634c]">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {METRICAS.map((m, i) => (
          <div key={i} className="flex flex-col items-center justify-center">
            <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-1 text-white">
              {m.valor}
            </div>
            <div className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
              {m.etiqueta}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
