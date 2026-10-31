/**
 * @uso        Página landing pública de FinApp (ruta /)
 * @funciones  PaginaInicio()
 * @datos      Sin datos externos; usa LandingLayout y provee AuthModal + asistente de ayuda como children
 * @eventos    manejarAbrirAuth(modo) desde LandingLayout (Header/Hero/CtaSection);
 *             manejarCerrarAuth desde AuthModal; manejarAbrirAyuda/manejarCerrarAyuda desde el
 *             disparador y el asistente. Es vista de destino del cierre que navega: con la
 *             marca `focoEnDestino` coloca el foco una vez (useFocoEnVistaDestino, RF-15)
 * @estados    modalAbierto (boolean), modoAuth ("login" | "registro"), ayudaAbierta (boolean)
 * @usadoPor   App.jsx (ruta /)
 */
import { useRef, useState } from "react";
import { BotMessageSquare } from "lucide-react";
import LandingLayout from "../layout/LandingLayout";
import AuthModal from "../components/domain/modales/AuthModal";
import AsistenteAyuda from "../components/domain/modales/AsistenteAyuda";
import { useFocoEnVistaDestino } from "../hooks/useFocoEnVistaDestino";

/**
 * PaginaInicio
 * Landing de la demo. Usa LandingLayout como organismo que compone Header, Hero,
 * StatsBar, Features, HowItWorks, CtaSection y Footer. Los literales hex heredados
 * (bg-[#0f1117], etc.) se conservan tal cual por decisión del usuario; su migración
 * a tokens es deuda técnica fuera del alcance de spec 005.
 */
export default function PaginaInicio() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoAuth, setModoAuth] = useState("registro");
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const triggerRef = useRef(null);

  // Vista de destino del cierre que navega (RF-15): si la entrada de historial trae la marca,
  // coloca el foco una sola vez con la lista ordenada (control estable por versión de vista →
  // primer control enfocable de la landing, que es el enlace del logotipo).
  useFocoEnVistaDestino();

  const manejarAbrirAuth = (modo) => {
    setModoAuth(modo);
    setModalAbierto(true);
  };

  const manejarCerrarAuth = () => {
    setModalAbierto(false);
  };

  const manejarAbrirAyuda = () => {
    setAyudaAbierta(true);
  };

  const manejarCerrarAyuda = () => {
    setAyudaAbierta(false);
  };

  return (
    <LandingLayout alAbrirAuth={manejarAbrirAuth}>
      {/* Modal flotante de autenticación */}
      <AuthModal
        abierto={modalAbierto}
        modoInicial={modoAuth}
        alCerrar={manejarCerrarAuth}
      />

      {/* Asistente de ayuda (solo diseño, spec 014): abre desde el robot flotante */}
      <AsistenteAyuda
        abierto={ayudaAbierta}
        estadoVisual="vacio"
        alCerrar={manejarCerrarAyuda}
        triggerRef={triggerRef}
      />

      {/* Botón flotante del asistente de ayuda (visible en esquina inferior derecha de la demo) */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="Abrir el asistente de ayuda"
        onClick={manejarAbrirAyuda}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#0f1117]/80 hover:bg-[#1a7a5e] text-white border border-white/20 backdrop-blur-md flex items-center justify-center text-sm font-bold shadow-xl transition-all cursor-pointer hover:scale-105"
      >
        <BotMessageSquare size={20} aria-hidden="true" />
      </button>
    </LandingLayout>
  );
}
