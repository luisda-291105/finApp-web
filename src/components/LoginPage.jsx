/**
 * @uso        Presenta el inicio de sesión en una ruta propia
 * @funciones  LoginPage()
 * @datos      Abre AuthModal en modo login
 * @eventos    Cierre o acceso demo navega al dashboard durante el trial
 * @estados    N/A
 * @usadoPor   App.jsx
 */
import { useNavigate } from "react-router-dom";
import { TRIAL_ACTIVO } from "../config/app.config";
import AuthModal from "./AuthModal";

/**
 * LoginPage
 * Reutiliza el formulario de autenticación existente como vista de ruta.
 */
export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="grid min-h-screen place-items-center bg-bg-dark px-5 text-white">
      <div className="text-center">
        <p className="font-display text-3xl">FinApp</p>
        <p className="mt-2 text-sm text-white/60">Tu vida financiera, más clara.</p>
      </div>
      <AuthModal
        abierto
        modoInicial="login"
        alCerrar={() => navigate(TRIAL_ACTIVO ? "/dashboard" : "/inicio")}
      />
    </main>
  );
}