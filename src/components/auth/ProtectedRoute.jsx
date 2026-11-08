/**
 * @uso        Guardia de rutas protegidas: requiere sesión autenticada
 * @funciones  ProtectedRoute({ children })
 * @datos      Lee usuario y estadoSesion desde UsuarioActivoContext
 * @eventos    Redirige a / si no hay sesión válida; preserva ubicación en state
 * @estados    usuario, estadoSesion (verificando | autenticado | sin-sesion)
 * @usadoPor   App.jsx (wrapper de rutas /dashboard/*)
 */
import { Navigate, useLocation } from "react-router-dom";
import { useUsuarioActivo } from "../../context/UsuarioActivoContext";

export function ProtectedRoute({ children }) {
  const { usuario, estadoSesion } = useUsuarioActivo();
  const location = useLocation();

  if (estadoSesion === "verificando") {
    return (
      <div className="min-h-screen grid place-items-center bg-bg-cream text-slate-text" role="status" aria-live="polite">
        Verificando sesión…
      </div>
    );
  }

  if (!usuario || estadoSesion !== "autenticado") {
    return <Navigate to="/" replace state={{
      from: location,
      focoEnDestino: location.state?.focoEnDestino === true,
    }} />;
  }

  return children;
}
