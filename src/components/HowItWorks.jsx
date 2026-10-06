/**
 * @uso        Sección de pasos guiados 01, 02 y 03 con números decorativos
 * @funciones  HowItWorks()
 * @datos      Lista de 3 pasos con número, título y descripción
 * @eventos    Ninguno
 * @estados    Usa useReveal para animación slide-left
 * @usadoPor   App.jsx
 */
import { useReveal } from "../hooks/useReveal";

const PASOS = [
  {
    numero: "01",
    titulo: "Crea tu cuenta en minutos",
    descripcion: "Regístrate de forma simple y segura. Sin tarjetas de crédito ni costos ocultos.",
  },
  {
    numero: "02",
    titulo: "Registra tus movimientos",
    descripcion: "Categoriza ingresos, salidas y ahorros con una interfaz ágil pensada para tu día a día.",
  },
  {
    numero: "03",
    titulo: "Toma el control financiero",
    descripcion: "Monitorea tu resumen mensual y toma decisiones con datos claros y actualizados.",
  },
];

/**
 * HowItWorks
 * Explica en 3 pasos simples el funcionamiento de FinApp.
 */
export default function HowItWorks() {
  const { ref, visible } = useReveal();

  return (
    <section className="bg-white py-24 px-6 border-b border-[#e0ddd8]/60">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-[#1a7a5e] text-xs font-semibold tracking-widest uppercase block mb-3">
            PASO A PASO
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-[#0f1117] font-normal tracking-tight">
            Cómo funciona
          </h2>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-10 transition-all duration-700 ${
            visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          {PASOS.map((paso) => (
            <div key={paso.numero} className="relative flex flex-col justify-between pt-6">
              <div className="font-display text-6xl sm:text-7xl font-bold text-[#e0ddd8]/70 select-none mb-3">
                {paso.numero}
              </div>
              <h3 className="text-xl font-bold text-[#0f1117] mb-2.5 tracking-tight">
                {paso.titulo}
              </h3>
              <p className="text-[#5a6475] text-sm sm:text-base leading-relaxed font-normal">
                {paso.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
