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
import { obtenerUsuarioActivo } from "../services/usuarioServicio";
import { obtenerRegistroGooglePendiente } from "../services/authGoogleServicio";

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
  const [modoInicial, setModoInicial] = useState("login");
  const [datosGooglePendiente, setDatosGooglePendiente] = useState(null);
  const resultadoGoogleProcesado = useRef("");

  useEffect(() => {
    const resultado = new URLSearchParams(location.search).get("google");
    if (!resultado || resultadoGoogleProcesado.current === resultado) return;
    resultadoGoogleProcesado.current = resultado;

    if (resultado === "cancelled") {
      navigate("/login", { replace: true });
      setMensajeGoogle("Cancelaste el inicio de sesión con Google.");
      setModoInicial("login");
      return;
    }

    if (resultado === "not_registered") {
      navigate("/login", { replace: true });
      setMensajeGoogle("No existe una cuenta registrada con este correo de Google. Por favor, regístrate.");
      setModoInicial("registro");
      return;
    }

    if (resultado === "already_registered") {
      navigate("/login", { replace: true });
      setMensajeGoogle("Esta cuenta de Google ya está registrada. Por favor inicia sesión.");
      setModoInicial("login");
      return;
    }

    if (resultado === "email_exists") {
      navigate("/login", { replace: true });
      setMensajeGoogle("Ya existe una cuenta con este correo de Google. Inicia sesión con tus credenciales.");
      setModoInicial("login");
      return;
    }

    if (resultado === "pending_registration") {
      navigate("/login", { replace: true });
      setVerificandoGoogle(true);
      obtenerRegistroGooglePendiente()
        .then((datos) => {
          setDatosGooglePendiente(datos);
          setModoInicial("completar_google");
          setMensajeGoogle("");
        })
        .catch((error) => {
          setMensajeGoogle(error?.message || "No se pudo recuperar la verificación de Google. Inténtalo de nuevo.");
          setModoInicial("registro");
        })
        .finally(() => setVerificandoGoogle(false));
      return;
    }

    if (resultado !== "success") {
      navigate("/login", { replace: true });
      setMensajeGoogle("No se pudo completar el acceso con Google. Intenta de nuevo.");
      setModoInicial("login");
      return;
    }

    setVerificandoGoogle(true);
    navigate("/login", { replace: true });
    try { localStorage.setItem("finapp_sesion_autenticada", "activa"); } catch { /* El JWT HttpOnly sigue validándose en el servidor. */ }
    obtenerUsuarioActivo()
      .then((respuesta) => {
        const usuario = respuesta?.datos || respuesta;
        if (!usuario?.idUsuario) throw new Error("Google inició sesión, pero FinApp no recibió el usuario activo.");
        guardarUsuario(usuario);
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        try { localStorage.removeItem("finapp_sesion_autenticada"); } catch { /* Almacenamiento opcional. */ }
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
          modoInicial={modoInicial}
          datosGooglePendiente={datosGooglePendiente}
          alCancelarGoogle={() => {
            setDatosGooglePendiente(null);
            setModoInicial("registro");
          }}
          mensajeExterno={mensajeGoogle}
          alCerrar={() => navigate(TRIAL_MODE ? "/dashboard" : "/", { state: { focoEnDestino: true } })}
        />
      )}
    </main>
  );
}
