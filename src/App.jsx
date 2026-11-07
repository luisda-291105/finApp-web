/**
 * @uso        Capa de rutas de FinApp con carga diferida de las vistas no iniciales
 * @funciones  App(), CargandoRuta(), envolver()
 * @datos      Define rutas públicas y protegidas con guards de sesión; la landing se carga de
 *             forma eager y el resto de vistas por chunks
 * @eventos    Navegación entre landing (/), /login y /dashboard/*
 * @estados    N/A
 * @usadoPor   main.jsx
 */
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./components/auth";
import PaginaInicio from "./pages/PaginaInicio";
import PaginaError from "./pages/PaginaError";
import LimiteDeError from "./components/ui/LimiteDeError";
import { UsuarioActivoProvider } from "./context/UsuarioActivoContext";
import { TemaProvider } from "./context/TemaContext";
import { GmailProvider } from "./context/GmailContext";

const PaginaLogin = lazy(() => import("./pages/PaginaLogin"));
const DashboardLayout = lazy(() => import("./layout/DashboardLayout"));
const PaginaDashboardInicio = lazy(() => import("./pages/PaginaDashboardInicio"));
const PaginaDashboardTarjetas = lazy(() => import("./features/tarjetas").then(({ TarjetasPage }) => ({ default: TarjetasPage })));
const PaginaDashboardConfiguracion = lazy(() => import("./pages/PaginaDashboardConfiguracion"));
const PaginaDashboardBolsillos = lazy(() => import("./features/grupo").then(({ GruposPage }) => ({ default: GruposPage })));
const PaginaDashboardContactos = lazy(() => import("./pages/PaginaDashboardContactos"));
const PaginaDashboardCorreos = lazy(() => import("./pages/PaginaDashboardCorreos"));
const PaginaDashboardContabilidad = lazy(() => import("./pages/PaginaDashboardContabilidad"));
const PaginaDashboardSuscripciones = lazy(() => import("./pages/PaginaDashboardSuscripciones"));

/**
 * CargandoRuta
 * Indicador accesible mientras se descarga el chunk de una vista.
 * @param {Object} props
 * @param {boolean} [props.compacto=false] - Versión dentro del área de contenido del dashboard
 */
function CargandoRuta({ compacto = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        compacto
          ? "flex min-h-[40vh] items-center justify-center text-sm text-slate-text"
          : "grid min-h-screen place-items-center bg-bg-cream text-sm text-slate-text"
      }
    >
      Cargando…
    </div>
  );
}

/**
 * envolver
 * Envuelve el elemento de una ruta en su propio Suspense para que el layout del dashboard
 * permanezca visible mientras se descarga la página.
 * @param {React.ReactNode} elemento
 * @param {boolean} [compacto=true]
 * @returns {JSX.Element}
 */
function envolver(elemento, compacto = true) {
  return <Suspense fallback={<CargandoRuta compacto={compacto} />}>{elemento}</Suspense>;
}

/**
 * App
 * Solo define el mapa de rutas; las vistas viven en src/pages/. La landing es la única
 * vista eager para que la primera pintura no dependa de ningún chunk adicional.
 */
export default function App() {
  return (
    <TemaProvider>
      <UsuarioActivoProvider>
        <GmailProvider>
          <LimiteDeError>
            <Routes>
              <Route path="/" element={<PublicRoute><PaginaInicio /></PublicRoute>} />
              <Route path="/inicio" element={<Navigate to="/" replace />} />
              <Route path="/login" element={<PublicRoute>{envolver(<PaginaLogin />, false)}</PublicRoute>} />

              <Route element={<ProtectedRoute>{envolver(<DashboardLayout />, false)}</ProtectedRoute>}>
                <Route path="/dashboard" element={envolver(<PaginaDashboardInicio />)} />
                <Route path="/dashboard/tarjetas" element={envolver(<PaginaDashboardTarjetas />)} />
                <Route path="/dashboard/configuracion" element={envolver(<PaginaDashboardConfiguracion />)} />
                <Route path="/dashboard/bolsillos" element={<Navigate to="/dashboard/grupos" replace />} />
                <Route path="/dashboard/grupos" element={envolver(<PaginaDashboardBolsillos />)} />
                <Route path="/dashboard/contactos" element={envolver(<PaginaDashboardContactos />)} />
                <Route path="/dashboard/correos" element={envolver(<PaginaDashboardCorreos />)} />
                <Route path="/dashboard/contabilidad" element={envolver(<PaginaDashboardContabilidad />)} />
                <Route path="/dashboard/suscripciones" element={envolver(<PaginaDashboardSuscripciones />)} />
                <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
              </Route>

              <Route path="*" element={<PaginaError />} />
            </Routes>
          </LimiteDeError>
        </GmailProvider>
      </UsuarioActivoProvider>
    </TemaProvider>
  );
}
