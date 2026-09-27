/**
 * @uso        Componente raíz que orquesta la landing page de FinApp y el estado del modal
 * @funciones  App()
 * @datos      N/A
 * @eventos    Apertura y cierre del modal de autenticación
 * @estados    modalAbierto (boolean), modoAuth ('login' | 'registro')
 * @usadoPor   main.jsx
 */
import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

/**
 * App
 * Componente principal que estructura todas las secciones de la aplicación.
 */
export default function App() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoAuth, setModoAuth] = useState("registro");

  const manejarAbrirAuth = (modo) => {
    setModoAuth(modo);
    setModalAbierto(true);
  };

  const manejarCerrarAuth = () => {
    setModalAbierto(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#0f1117] flex flex-col font-body">
      {/* Navbar principal */}
      <Navbar alAbrirAuth={manejarAbrirAuth} />

      <main className="flex-1">
        {/* Hero editorial oscuro */}
        <Hero alAbrirAuth={manejarAbrirAuth} />

        {/* Barra de estadísticas esmeralda */}
        <StatsBar />

        {/* Sección de funcionalidades sobre fondo crema */}
        <Features />

        {/* Cómo funciona con números 01/02/03 */}
        <HowItWorks />

        {/* Bloque CTA final */}
        <CtaSection alAbrirAuth={manejarAbrirAuth} />
      </main>

      {/* Pie de página */}
      <Footer />

      {/* Modal flotante de autenticación */}
      <AuthModal
        abierto={modalAbierto}
        modoInicial={modoAuth}
        alCerrar={manejarCerrarAuth}
      />

      {/* Botón flotante de ayuda / feedback (visible en esquina inferior derecha de la demo) */}
      <button
        type="button"
        aria-label="Ayuda y preguntas frecuentes"
        onClick={() => manejarAbrirAuth("login")}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#0f1117]/80 hover:bg-[#1a7a5e] text-white border border-white/20 backdrop-blur-md flex items-center justify-center text-sm font-bold shadow-xl transition-all cursor-pointer hover:scale-105"
      >
        ?
      </button>
    </div>
  );
}
