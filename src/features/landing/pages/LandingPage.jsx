/**
 * @uso        Página landing pública de FinApp (ruta /)
 * @funciones  LandingPage()
 * @datos      Sin datos externos; usa LandingLayout y provee AuthModal + asistente de ayuda como children
 * @eventos    manejarAbrirAuth(modo) desde LandingLayout (Header/Hero/CtaSection);
 *             manejarCerrarAuth desde AuthModal; manejarAbrirAyuda/manejarCerrarAyuda desde el
 *             disparador y el asistente. Es vista de destino del cierre que navega: con la
 *             marca `focoEnDestino` coloca el foco una vez (useFocoEnVistaDestino, RF-15)
 * @estados    modalAbierto (boolean), modoAuth ("login" | "registro"), ayudaAbierta (boolean)
 * @usadoPor   App.jsx (ruta /)
 */
import { lazy, Suspense, useRef, useState } from "react";
import { BotMessageSquare } from "lucide-react";
import LandingLayout from "../components/layouts/LandingLayout";
import { useFocoEnVistaDestino } from "../../../hooks/useFocoEnVistaDestino";

// Los modales no forman parte de la primera pintura: se descargan al abrirse por primera vez
// y permanecen montados después para conservar el foco y los campos (AC-22).
const AuthModal = lazy(() => import("../../auth").then(({ AuthModal }) => ({ default: AuthModal })));
const AsistenteAyuda = lazy(() => import("../../../components/domain/modales/AsistenteAyuda"));

/**
 * LandingPage
 * Landing de la demo. Usa LandingLayout como organismo que compone Header, Hero,
 * StatsBar, Features, HowItWorks, CtaSection y Footer. Los literales hex heredados
 * (bg-[#0f1117], etc.) se conservan tal cual por decisión del usuario; su migración
 * a tokens es deuda técnica fuera del alcance de spec 005.
 */
export default function LandingPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoAuth, setModoAuth] = useState("registro");
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const [authMontado, setAuthMontado] = useState(false);
  const [ayudaMontada, setAyudaMontada] = useState(false);
  const triggerRef = useRef(null);

  // Vista de destino del cierre que navega (RF-15): si la entrada de historial trae la marca,
  // coloca el foco una sola vez con la lista ordenada (control estable por versión de vista →
  // primer control enfocable de la landing, que es el enlace del logotipo).
  useFocoEnVistaDestino();

  const manejarAbrirAuth = (modo) => {
    setAuthMontado(true);
    setModoAuth(modo);
    setModalAbierto(true);
  };

  const manejarCerrarAuth = () => {
    setModalAbierto(false);
  };

  const manejarAbrirAyuda = () => {
    setAyudaMontada(true);
    setAyudaAbierta(true);
  };

  const manejarCerrarAyuda = () => {
    setAyudaAbierta(false);
  };

  return (
    <LandingLayout alAbrirAuth={manejarAbrirAuth}>
      {/* Modal flotante de autenticación: se descarga al abrirse por primera vez */}
      {authMontado && (
        <Suspense fallback={null}>
          <AuthModal
            abierto={modalAbierto}
            modoInicial={modoAuth}
            alCerrar={manejarCerrarAuth}
          />
        </Suspense>
      )}

      {/* Asistente de ayuda (solo diseño, spec 014): abre desde el robot flotante */}
      {ayudaMontada && (
        <Suspense fallback={null}>
          <AsistenteAyuda
            abierto={ayudaAbierta}
            estadoVisual="vacio"
            alCerrar={manejarCerrarAyuda}
            triggerRef={triggerRef}
          />
        </Suspense>
      )}

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
