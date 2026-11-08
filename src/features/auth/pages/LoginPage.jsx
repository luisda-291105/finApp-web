/**
 * @uso        Página de inicio de sesión en una ruta propia
 * @funciones  PaginaLogin()
 * @datos      Abre AuthModal en modo login
 * @eventos    Cierre o acceso demo navega a /dashboard durante el trial; sin trial navega a /.
 *             El cierre que navega escribe la marca `focoEnDestino` en el estado de la ruta para
 *             que la vista de destino coloque el foco ahí (RF-15, spec 011)
 * @estados    N/A
 * @usadoPor   App.jsx (ruta /login)
 */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TRIAL_MODE } from "../../../config/app.config";
import { AuthModal } from "../components/modals";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { obtenerUsuarioActivo } from "../../../services/usuarioServicio";

/**
 * PaginaLogin
 * Reutiliza el formulario de autenticación existente como vista de ruta.
 */
export default function PaginaLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { guardarUsuario } = useUsuarioActivo();
  const [mensajeGoogle, setMensajeGoogle] = useState("");
  const [verificandoGoogle, setVerificandoGoogle] = useState(false);
  const resultadoGoogleProcesado = useRef("");

  useEffect(() => {
    const resultado = new URLSearchParams(location.search).get("google");
    if (!resultado || resultadoGoogleProcesado.current === resultado) return;
    resultadoGoogleProcesado.current = resultado;

    if (resultado === "cancelled") {
      navigate("/login", { replace: true });
      setMensajeGoogle("Cancelaste el inicio de sesión con Google.");
      return;
    }
    if (resultado !== "success") {
      navigate("/login", { replace: true });
      setMensajeGoogle("No se pudo completar el inicio de sesión con Google. Intenta de nuevo.");
      return;
    }

    setVerificandoGoogle(true);
    navigate("/login", { replace: true });
    try { sessionStorage.setItem("finapp_sesion_pestana", "activa"); } catch { /* El servidor sigue validando la cookie. */ }
    obtenerUsuarioActivo()
      .then((respuesta) => {
        const usuario = respuesta?.datos || respuesta;
        if (!usuario?.idUsuario) throw new Error("Google inició sesión, pero FinApp no recibió el usuario activo.");
        guardarUsuario(usuario);
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        try { sessionStorage.removeItem("finapp_sesion_pestana"); } catch { /* Almacenamiento opcional. */ }
        setMensajeGoogle(error?.message || "No se pudo verificar la sesión de FinApp.");
      })
      .finally(() => setVerificandoGoogle(false));
  }, [location.search, guardarUsuario, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-bg-dark px-5 text-white">
      <div className="text-center">
        <p className="font-display text-3xl">FinApp</p>
        <p className="mt-2 text-sm text-white/60">Tu vida financiera, más clara.</p>
      </div>
      {verificandoGoogle ? (
        <p role="status" className="text-sm text-white/70">Verificando tu cuenta de Google…</p>
      ) : (
        <AuthModal
          abierto
          modoInicial="login"
          mensajeExterno={mensajeGoogle}
          alCerrar={() => navigate(TRIAL_MODE ? "/dashboard" : "/", { state: { focoEnDestino: true } })}
        />
      )}
    </main>
  );
}
