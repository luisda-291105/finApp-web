/**
 * @uso        Define las rutas públicas y protegidas de FinApp
 * @funciones  App()
 * @datos      Usa el estado de trial desde la configuración
 * @eventos    Navegación entre login, landing y dashboard
 * @estados    N/A
 * @usadoPor   main.jsx
 */
import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TRIAL_ACTIVO } from "./config/app.config";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
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
 * Renderiza la vista de landing conservada en /inicio.
 */
function LandingPage() {
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

/**
 * App
 * Registra las rutas de acceso y la jerarquía de secciones del dashboard.
 */
export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={TRIAL_ACTIVO ? "/dashboard" : "/login"} replace />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/inicio" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          TRIAL_ACTIVO ? <Dashboard /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<DashboardSection seccion="inicio" />} />
        <Route
          path="transacciones"
          element={<DashboardSection seccion="transacciones" />}
        />
        <Route
          path="tarjetas"
          element={<DashboardSection seccion="tarjetas" />}
        />
        <Route
          path="configuracion"
          element={<DashboardSection seccion="configuracion" />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardSection({ seccion }) {
  const titulos = {
    inicio: "Tu dinero, en equilibrio.",
    transacciones: "Transacciones",
    tarjetas: "Tus tarjetas",
    configuracion: "Configuración",
  };

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          {titulos[seccion]}
        </h1>
      </div>
      {seccion === "inicio" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="glass-card p-5">
            <p className="text-sm text-slate-text">Balance disponible</p>
            <p className="mt-3 text-2xl font-semibold text-bg-dark">$12,480.50</p>
          </article>
          <article className="glass-card p-5">
            <p className="text-sm text-slate-text">Ingresos del mes</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-primary">$4,250.00</p>
          </article>
          <article className="glass-card p-5">
            <p className="text-sm text-slate-text">Gastos del mes</p>
            <p className="mt-3 text-2xl font-semibold text-bg-dark">$1,820.75</p>
          </article>
        </div>
      ) : (
        <div className="glass-card p-6">
          <p className="text-slate-text">
            {seccion === "transacciones" && "Consulta y organiza tus movimientos recientes."}
            {seccion === "tarjetas" && "Administra tus tarjetas y revisa sus saldos."}
            {seccion === "configuracion" && "Ajusta tus preferencias de cuenta y seguridad."}
          </p>
        </div>
      )}
    </section>
  );
}
