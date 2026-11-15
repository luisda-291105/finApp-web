import { CLASE_ENTRADA } from "./authFormStyles";
import { AlertaGlobal } from "../../../../components/ui/alertas";

export default function LoginForm({ idUsuario, contrasena, alCambiarIdUsuario, alCambiarContrasena, alEnviar, cargando, mensaje }) {
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
      <div>
        <input
          id="auth-contrasena"
          type="password"
          required
          autoComplete="current-password"
          aria-label="Contraseña"
          value={contrasena}
          onChange={(evento) => alCambiarContrasena(evento.target.value)}
          placeholder="Ingresa tu contraseña"
          minLength={8}
          className={CLASE_ENTRADA}
        />
      </div>
      <AlertaGlobal tipo="error" mensaje={mensaje} idBase="LoginForm-mensaje" />
      <button type="submit" disabled={cargando} className="mt-4 w-full rounded-xl bg-[#1a7a5e] py-3 font-medium text-white shadow-lg transition-all hover:bg-[#15634c] disabled:opacity-50">
        {cargando ? "Procesando..." : "Entrar a mi cuenta"}
      </button>
    </form>
  );
}
