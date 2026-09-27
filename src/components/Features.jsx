/**
 * @uso        Sección de funcionalidades con grid de 5 tarjetas y paleta crema/esmeralda
 * @funciones  Features()
 * @datos      Lista estática de 5 funcionalidades con títulos, descripciones e íconos
 * @eventos    hover sobre tarjetas
 * @estados    Usa useReveal para animación al hacer scroll
 * @usadoPor   App.jsx
 */
import { useReveal } from "../hooks/useReveal";

const FUNCIONALIDADES = [
  {
    id: "registro",
    titulo: "Registro personal",
    descripcion:
      "Crea tu perfil con nombre, correo y contraseña. Accede desde cualquier dispositivo de forma segura.",
    colorIcono: "text-[#1a7a5e]",
    fondoIcono: "bg-[#e8f5e9]",
    icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "ahorro",
    titulo: "Ahorro",
    descripcion:
      "Registra lo que reservas cada mes y visualiza tu progreso hacia tus metas de ahorro.",
    colorIcono: "text-[#1a7a5e]",
    fondoIcono: "bg-[#e6f9f2]",
    icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id: "gastos",
    titulo: "Gastos",
    descripcion:
      "Controla cada salida de dinero: comida, transporte, entretenimiento y más categorías.",
    colorIcono: "text-[#d94838]",
    fondoIcono: "bg-[#fdeeed]",
    icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
      </svg>
    ),
  },
  {
    id: "ingresos",
    titulo: "Ingresos",
    descripcion:
      "Anota tu sueldo, freelances o cualquier entrada de dinero para tener el panorama completo.",
    colorIcono: "text-[#2563eb]",
    fondoIcono: "bg-[#eff6ff]",
    icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: "otro",
    titulo: "Otro",
    descripcion:
      "Categoría flexible para préstamos, reembolsos, regalos o cualquier movimiento atípico.",
    colorIcono: "text-[#7c3aed]",
    fondoIcono: "bg-[#f5f3ff]",
    icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

/**
 * Features
 * Muestra el catálogo de módulos de finanzas personales sobre fondo crema.
 */
export default function Features() {
  const { ref, visible } = useReveal({ threshold: 0.1 });

  return (
    <section id="funcionalidades" className="bg-[#f7f6f2] py-24 px-6 border-b border-[#e0ddd8]/60">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera de sección */}
        <div className="mb-14">
          <span className="text-[#1a7a5e] text-xs font-semibold tracking-widest uppercase block mb-3">
            FUNCIONALIDADES
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#0f1117] font-normal tracking-tight leading-[1.15]">
            Todo lo que necesitas,<br />
            nada que no uses
          </h2>
        </div>

        {/* Grid de 5 tarjetas */}
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {FUNCIONALIDADES.map((func) => (
            <div
              key={func.id}
              className="glass-card p-7 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-xl ${func.fondoIcono} ${func.colorIcono} flex items-center justify-center mb-6 shadow-xs`}
                >
                  {func.icono}
                </div>
                <h3 className="text-xl font-bold text-[#0f1117] mb-2.5 tracking-tight">
                  {func.titulo}
                </h3>
                <p className="text-[#5a6475] text-sm leading-relaxed font-normal">
                  {func.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
