/**
 * @uso        Guardia de rutas públicas: evita que usuarios autenticados vuelvan a landing/login
 * @funciones  PublicRoute({ children })
 * @datos      Lee usuario y estadoSesion desde UsuarioActivoContext
 * @eventos    Redirige a /dashboard cuando ya hay sesión autenticada
 * @estados    usuario, estadoSesion (verificando | autenticado | sin-sesion)
 * @usadoPor   App.jsx (rutas / y /login)
 */
import { Navigate } from "react-router-dom";
import { useUsuarioActivo } from "../../context/UsuarioActivoContext";

export function PublicRoute({ children }) {
  const { usuario, estadoSesion } = useUsuarioActivo();

  if (estadoSesion === "verificando") {
    return (
      <div className="min-h-screen grid place-items-center bg-bg-cream text-slate-text" role="status" aria-live="polite">
        Verificando sesión…
      </div>
    );
  }

  if (usuario && estadoSesion === "autenticado") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
