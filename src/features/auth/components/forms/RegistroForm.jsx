import { CLASE_ENTRADA } from "./authFormStyles";

export default function RegistroForm({ idUsuario, nombre, correo, telefono, contrasena, alCambiarIdUsuario, alCambiarNombre, alCambiarCorreo, alCambiarTelefono, alCambiarContrasena, alEnviar, cargando, mensaje }) {
  return (
    <form onSubmit={alEnviar} className="space-y-5">
      <input id="auth-registro-identificacion" type="text" required autoComplete="username" aria-label="Cédula o identificación" value={idUsuario} onChange={(evento) => alCambiarIdUsuario(evento.target.value)} placeholder="Identificación" className={CLASE_ENTRADA} />
      <input id="auth-registro-nombre" type="text" required autoComplete="name" aria-label="Nombre completo" value={nombre} onChange={(evento) => alCambiarNombre(evento.target.value)} placeholder="Nombre completo" className={CLASE_ENTRADA} />
      <input id="auth-registro-correo" type="email" autoComplete="email" aria-label="Correo electrónico" value={correo} onChange={(evento) => alCambiarCorreo(evento.target.value)} placeholder="Correo electrónico" className={CLASE_ENTRADA} />
      <input id="auth-registro-telefono" type="tel" autoComplete="tel" aria-label="Teléfono" value={telefono} onChange={(evento) => alCambiarTelefono(evento.target.value)} placeholder="Teléfono" className={CLASE_ENTRADA} />
      <p className="-mt-3 text-xs text-white/70">Correo y teléfono son opcionales; puedes agregarlos más adelante desde tu perfil.</p>
      <div>
        <input id="auth-contrasena" type="password" required autoComplete="new-password" aria-label="Contraseña" aria-describedby="auth-contrasena-ayuda" value={contrasena} onChange={(evento) => alCambiarContrasena(evento.target.value)} placeholder="Ingresa tu contraseña" minLength={8} className={CLASE_ENTRADA} />
        <p id="auth-contrasena-ayuda" className="mt-2 text-xs text-white/70">Mínimo 8 caracteres</p>
      </div>
      {mensaje && <p role="alert" className="rounded-xl border border-[#1a7a5e]/50 bg-[#1a7a5e]/20 p-3 text-xs text-[#6ee7c0]">{mensaje}</p>}
      <button type="submit" disabled={cargando} className="mt-4 w-full rounded-xl bg-[#1a7a5e] py-3 font-medium text-white shadow-lg transition-all hover:bg-[#15634c] disabled:opacity-50">
        {cargando ? "Procesando..." : "Crear cuenta"}
      </button>
    </form>
  );
}
