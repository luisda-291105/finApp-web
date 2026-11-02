/**
 * @uso        Capa de rutas pura de FinApp: mapa de navegación de la app
 * @funciones  App()
 * @datos      Usa TRIAL_ACTIVO desde ./config/app.config para la guardia de /dashboard
 * @eventos    Navegación entre landing (/), /login y /dashboard/*
 * @estados    N/A
 * @usadoPor   main.jsx
 */
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { TRIAL_ACTIVO } from "./config/app.config";
import PaginaInicio from "./pages/PaginaInicio";
import PaginaLogin from "./pages/PaginaLogin";
import DashboardLayout from "./layout/DashboardLayout";
import PaginaDashboardInicio from "./pages/PaginaDashboardInicio";
import PaginaDashboardTarjetas from "./pages/PaginaDashboardTarjetas";
import PaginaDashboardConfiguracion from "./pages/PaginaDashboardConfiguracion";
import PaginaDashboardBolsillos from "./pages/PaginaDashboardBolsillos";
import PaginaDashboardContactos from "./pages/PaginaDashboardContactos";
import PaginaDashboardCorreos from "./pages/PaginaDashboardCorreos";
import PaginaDashboardContabilidad from "./pages/PaginaDashboardContabilidad";
import { UsuarioActivoProvider } from "./context/UsuarioActivoContext";
import { TemaProvider } from "./context/TemaContext";
import { useUsuarioActivo } from "./context/UsuarioActivoContext";

function RedireccionSesion() {
  const navigate = useNavigate();
  useEffect(() => {
    const redirigir = () => navigate("/", { replace: true });
    window.addEventListener("finapp:sesion-requerida", redirigir);
    return () => window.removeEventListener("finapp:sesion-requerida", redirigir);
  }, [navigate]);
  return null;
}

function DashboardProtegido() {
  const { usuario, estadoSesion } = useUsuarioActivo();
  if (estadoSesion === "verificando") {
    return <div className="min-h-screen grid place-items-center bg-bg-cream text-slate-text" role="status" aria-live="polite">Verificando sesión…</div>;
  }
  if (!usuario || estadoSesion !== "autenticado") return <Navigate to="/" replace />;
  return <DashboardLayout />;
}

/**
 * App
 * Solo define el mapa de rutas; las vistas viven en src/pages/.
 */
export default function App() {
  return (
    <TemaProvider>
      <UsuarioActivoProvider>
        <RedireccionSesion />
        <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/inicio" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<PaginaLogin />} />
        <Route
          path="/dashboard"
          element={
            TRIAL_ACTIVO ? <DashboardProtegido /> : <Navigate to="/" replace />
          }
        >
          <Route index element={<PaginaDashboardInicio />} />
          <Route
            path="tarjetas"
            element={<PaginaDashboardTarjetas />}
          />
          <Route
            path="configuracion"
            element={<PaginaDashboardConfiguracion />}
          />
          <Route path="bolsillos" element={<PaginaDashboardBolsillos />} />
          <Route path="contactos" element={<PaginaDashboardContactos />} />
          <Route path="correos" element={<PaginaDashboardCorreos />} />
          <Route path="contabilidad" element={<PaginaDashboardContabilidad />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UsuarioActivoProvider>
    </TemaProvider>
  );
}
