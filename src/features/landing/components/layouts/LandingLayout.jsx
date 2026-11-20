/**
 * @uso        Organismo que compone la landing pública completa (Header + Regla + Hero + StatsBar + Features + HowItWorks + CtaSection + Footer)
 * @funciones  LandingLayout({ alAbrirAuth, ocultarRegla, children })
 * @datos      Recibe callback alAbrirAuth para propagar a Header, Hero, CtaSection; ocultarRegla desmonta Regla con el modal abierto; children para contenido flotante (AuthModal, botón ayuda); comparte seccionActiva entre Regla y Header
 * @eventos    alCambiarSeccion desde Regla (scroll-spy)
 * @estados    seccionActiva (string, título de la sección posicionada)
 * @usadoPor   LandingPage
 */
import { useState } from "react";
import Header from "./Header";
import Regla from "./Regla";
import Hero from "../sections/Hero";
import StatsBar from "../sections/StatsBar";
import Features from "../sections/Features";
import HowItWorks from "../sections/HowItWorks";
import CtaSection from "../sections/CtaSection";
import Footer from "../sections/Footer";

/**
 * LandingLayout
 * Componente de layout que ensambla todas las secciones de la landing pública.
 * El header muestra la sección posicionada como título; la regla la oculta de su lista.
 * @param {Object} props
 * @param {(modo: 'login' | 'registro') => void} props.alAbrirAuth - Callback para abrir modal de autenticación
 * @param {boolean} [props.ocultarHeader=false] - Oculta el header mientras el modal de acceso está abierto
 * @param {boolean} [props.ocultarRegla=false] - Oculta la regla mientras un modal de la landing está abierto (su capa es superior a la de los modales)
 * @param {React.ReactNode} [props.children] - Contenido extra opcional (p.ej. AuthModal, botón flotante)
 */
export default function LandingLayout({
  alAbrirAuth,
  ocultarHeader = false,
  ocultarRegla = false,
  children,
}) {
  const [seccionActiva, setSeccionActiva] = useState("Inicio");

  return (
    <div
      data-testid="landing-theme"
      className="landing-theme min-h-screen bg-[#0f1117] text-[#0f1117] flex flex-col font-body"
    >
      {/* Header principal */}
      <Header
        alAbrirAuth={alAbrirAuth}
        modo="landing"
        oculto={ocultarHeader}
        seccionActiva={seccionActiva}
      />

      {/* Regla de medición al borde derecho, centrada verticalmente */}
      <Regla alCambiarSeccion={setSeccionActiva} oculta={ocultarRegla} />

      <main className="flex-1">
        {/* Hero editorial oscuro */}
        <Hero alAbrirAuth={alAbrirAuth} />

        {/* Barra de estadísticas esmeralda */}
        <StatsBar />

        {/* Sección de funcionalidades sobre fondo crema */}
        <Features />

        {/* Cómo funciona con números 01/02/03 */}
        <HowItWorks />

        {/* Bloque CTA final */}
        <CtaSection alAbrirAuth={alAbrirAuth} />
      </main>

      {/* Pie de página */}
      <Footer />

      {/* Contenido extra: AuthModal, botón flotante, etc. */}
      {children}
    </div>
  );
}
