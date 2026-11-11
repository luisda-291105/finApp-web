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
import { LandingPage } from "./features/landing";
import { ErrorPage } from "./features/error";
import { LimiteDeError } from "./components/ui";
import { UsuarioActivoProvider } from "./context/UsuarioActivoContext";
import { TemaProvider } from "./context/TemaContext";
import { GmailProvider } from "./context/GmailContext";

const PaginaLogin = lazy(() => import("./features/auth").then(({ LoginPage }) => ({ default: LoginPage })));
const DashboardLayout = lazy(() => import("./layout/DashboardLayout"));
const PaginaDashboardInicio = lazy(() => import("./features/inicio").then(({ InicioPage }) => ({ default: InicioPage })));
const PaginaDashboardTarjetas = lazy(() => import("./features/tarjetas").then(({ TarjetasPage }) => ({ default: TarjetasPage })));
const PaginaDashboardConfiguracion = lazy(() => import("./features/configuracion").then(({ ConfiguracionPage }) => ({ default: ConfiguracionPage })));
const PaginaDashboardBolsillos = lazy(() => import("./features/grupo").then(({ GruposPage }) => ({ default: GruposPage })));
const PaginaDashboardContactos = lazy(() => import("./features/contactos").then(({ ContactosPage }) => ({ default: ContactosPage })));
const PaginaDashboardCorreos = lazy(() => import("./features/correos").then(({ CorreosPage }) => ({ default: CorreosPage })));
const PaginaDashboardContabilidad = lazy(() => import("./features/contabilidad").then(({ ContabilidadPage }) => ({ default: ContabilidadPage })));
const PaginaDashboardSuscripciones = lazy(() => import("./features/suscripciones").then(({ SuscripcionesPage }) => ({ default: SuscripcionesPage })));

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
  return (
    <LimiteDeError>
      <Suspense fallback={<CargandoRuta compacto={compacto} />}>
        {elemento}
      </Suspense>
    </LimiteDeError>
  );
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
          <Routes>
            <Route path="/" element={<PublicRoute><LimiteDeError><LandingPage /></LimiteDeError></PublicRoute>} />
            <Route path="/inicio" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<PublicRoute>{envolver(<PaginaLogin />, false)}</PublicRoute>} />

            <Route element={<ProtectedRoute>{envolver(<DashboardLayout />, false)}</ProtectedRoute>}>
              <Route path="/dashboard" element={<PaginaDashboardInicio />} />
              <Route path="/dashboard/tarjetas" element={<PaginaDashboardTarjetas />} />
              <Route path="/dashboard/configuracion" element={<PaginaDashboardConfiguracion />} />
              <Route path="/dashboard/bolsillos" element={<Navigate to="/dashboard/grupos" replace />} />
              <Route path="/dashboard/grupos" element={<PaginaDashboardBolsillos />} />
              <Route path="/dashboard/contactos" element={<PaginaDashboardContactos />} />
              <Route path="/dashboard/correos" element={<PaginaDashboardCorreos />} />
              <Route path="/dashboard/contabilidad" element={<PaginaDashboardContabilidad />} />
              <Route path="/dashboard/suscripciones" element={<PaginaDashboardSuscripciones />} />
              <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={<LimiteDeError><ErrorPage /></LimiteDeError>} />
          </Routes>
        </GmailProvider>
      </UsuarioActivoProvider>
    </TemaProvider>
  );
}
