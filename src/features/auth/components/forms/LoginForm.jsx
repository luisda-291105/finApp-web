import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CLASE_ENTRADA } from "./authFormStyles";
import { AlertaGlobal } from "../../../../features/error";

export default function LoginForm({
  idUsuario,
  contrasena,
  alCambiarIdUsuario,
  alCambiarContrasena,
  alEnviar,
  cargando,
  mensaje,
}) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  return (
    <form onSubmit={alEnviar} className="space-y-5">
      <input
        id="auth-login-identificacion"
        type="text"
        required
        autoComplete="username"
        aria-label="Nombre, identificación, correo o teléfono"
        value={idUsuario}
        onChange={(evento) => alCambiarIdUsuario(evento.target.value)}
        placeholder="Nombre, identificación, correo o teléfono"
        className={CLASE_ENTRADA}
      />
      <div className="relative">
        <input
          id="auth-contrasena"
          type={mostrarContrasena ? "text" : "password"}
          required
          autoComplete="current-password"
          aria-label="Contraseña"
          value={contrasena}
          onChange={(evento) => alCambiarContrasena(evento.target.value)}
          placeholder="Ingresa tu contraseña"
          minLength={8}
          className={`${CLASE_ENTRADA} pr-11`}
        />
        <button
          type="button"
          onClick={() => setMostrarContrasena((visible) => !visible)}
          aria-label={
            mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"
          }
          aria-pressed={mostrarContrasena}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent/60"
        >
          {mostrarContrasena ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <AlertaGlobal tipo="error" mensaje={mensaje} idBase="LoginForm-mensaje" />
      <button
        type="submit"
        disabled={cargando}
        className="mt-4 w-full rounded-xl bg-[#1a7a5e] py-3 font-medium text-white shadow-lg transition-all hover:bg-[#15634c] disabled:opacity-50"
      >
        {cargando ? "Procesando..." : "Entrar a mi cuenta"}
      </button>
    </form>
  );
}
