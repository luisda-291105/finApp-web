/**
 * @uso        Capa de rutas pura de FinApp: mapa de navegación de la app
 * @funciones  App()
 * @datos      Usa TRIAL_ACTIVO desde ./config/app.config para la guardia de /dashboard
 * @eventos    Navegación entre landing (/), /login y /dashboard/*
 * @estados    N/A
 * @usadoPor   main.jsx
 */
import { Navigate, Route, Routes } from "react-router-dom";
import { TRIAL_ACTIVO } from "./config/app.config";
import PaginaInicio from "./pages/PaginaInicio";
import PaginaLogin from "./pages/PaginaLogin";
import DashboardLayout from "./layout/DashboardLayout";
import PaginaDashboardInicio from "./pages/PaginaDashboardInicio";
import PaginaDashboardTransacciones from "./pages/PaginaDashboardTransacciones";
import PaginaDashboardTarjetas from "./pages/PaginaDashboardTarjetas";
import PaginaDashboardConfiguracion from "./pages/PaginaDashboardConfiguracion";
import PaginaDashboardBolsillos from "./pages/PaginaDashboardBolsillos";
import PaginaDashboardContactos from "./pages/PaginaDashboardContactos";
import PaginaDashboardCorreos from "./pages/PaginaDashboardCorreos";
import { UsuarioActivoProvider } from "./context/UsuarioActivoContext";

/**
 * App
 * Solo define el mapa de rutas; las vistas viven en src/pages/.
 */
export default function App() {
  return (
    <UsuarioActivoProvider>
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/inicio" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<PaginaLogin />} />
        <Route
          path="/dashboard"
          element={
            TRIAL_ACTIVO ? <DashboardLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<PaginaDashboardInicio />} />
          <Route
            path="transacciones"
            element={<PaginaDashboardTransacciones />}
          />
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UsuarioActivoProvider>
  );
}
