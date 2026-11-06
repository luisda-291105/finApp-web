/**
 * @uso        Capa de rutas pura de FinApp: mapa de navegación de la app
 * @funciones  App()
 * @datos      Define rutas públicas y protegidas con guards de sesión
 * @eventos    Navegación entre landing (/), /login y /dashboard/*
 * @estados    N/A
 * @usadoPor   main.jsx
 */
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./components/auth";
import PaginaInicio from "./pages/PaginaInicio";
import PaginaLogin from "./pages/PaginaLogin";
import PaginaError from "./pages/PaginaError";
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
import { GmailProvider } from "./context/GmailContext";

/**
 * App
 * Solo define el mapa de rutas; las vistas viven en src/pages/.
 */
export default function App() {
  return (
    <TemaProvider>
      <UsuarioActivoProvider>
        <GmailProvider>
          <Routes>
            <Route path="/" element={<PublicRoute><PaginaInicio /></PublicRoute>} />
            <Route path="/inicio" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<PublicRoute><PaginaLogin /></PublicRoute>} />

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<PaginaDashboardInicio />} />
              <Route path="/dashboard/tarjetas" element={<PaginaDashboardTarjetas />} />
              <Route path="/dashboard/configuracion" element={<PaginaDashboardConfiguracion />} />
              <Route path="/dashboard/bolsillos" element={<Navigate to="/dashboard/grupos" replace />} />
              <Route path="/dashboard/grupos" element={<PaginaDashboardBolsillos />} />
              <Route path="/dashboard/contactos" element={<PaginaDashboardContactos />} />
              <Route path="/dashboard/correos" element={<PaginaDashboardCorreos />} />
              <Route path="/dashboard/contabilidad" element={<PaginaDashboardContabilidad />} />
              <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={<PaginaError />} />
          </Routes>
        </GmailProvider>
      </UsuarioActivoProvider>
    </TemaProvider>
  );
}
