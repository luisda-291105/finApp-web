/**
 * @uso        Organismo que compone la landing pública completa (Header + Hero + StatsBar + Features + HowItWorks + CtaSection + Footer)
 * @funciones  LandingLayout({ alAbrirAuth, children })
 * @datos      Recibe callback alAbrirAuth para propagar a Header, Hero, CtaSection; children para contenido flotante (AuthModal, botón ayuda)
 * @eventos    Ninguno propio; delega eventos a componentes hijos
 * @estados    Ninguno
 * @usadoPor   PaginaInicio
 */
import Header from "../components/layout/Header";
import Hero from "../components/domain/landing/Hero";
import StatsBar from "../components/domain/landing/StatsBar";
import Features from "../components/domain/landing/Features";
import HowItWorks from "../components/domain/landing/HowItWorks";
import CtaSection from "../components/domain/landing/CtaSection";
import Footer from "../components/layout/Footer";

/**
 * LandingLayout
 * Componente de layout que ensambla todas las secciones de la landing pública.
 * @param {Object} props
 * @param {(modo: 'login' | 'registro') => void} props.alAbrirAuth - Callback para abrir modal de autenticación
 * @param {React.ReactNode} [props.children] - Contenido extra opcional (p.ej. AuthModal, botón flotante)
 */
export default function LandingLayout({ alAbrirAuth, children }) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#0f1117] flex flex-col font-body">
      {/* Header principal */}
      <Header alAbrirAuth={alAbrirAuth} modo="landing" />

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