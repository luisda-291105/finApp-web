import { CLASE_ENTRADA } from "./authFormStyles";

export default function CompletarRegistroGoogleForm({
  datosGoogle,
  idUsuario,
  nombre,
  telefono,
  contrasena,
  alCambiarIdUsuario,
  alCambiarNombre,
  alCambiarTelefono,
  alCambiarContrasena,
  alEnviar,
  cargando,
  mensaje,
  alCancelar,
}) {
  return (
    <form onSubmit={alEnviar} className="space-y-4">
      {/* Resumen de la cuenta verificada por Google */}
      <div className="rounded-2xl border border-white/15 bg-white/5 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-white/60">Correo verificado por Google</p>
            <p className="truncate text-sm font-semibold text-white">{datosGoogle?.correo || "Cuenta Google"}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-[#6ee7c0]">
            Verificado
          </span>
        </div>
      </div>

      <p className="text-xs text-white/70">
        Ingresa tu identificación y una contraseña para completar la creación de tu cuenta en FinApp.
      </p>

      <div>
        <label htmlFor="google-registro-identificacion" className="mb-1.5 block text-xs font-medium text-white/80">
          Identificación o cédula *
        </label>
        <input
          id="google-registro-identificacion"
          type="text"
          required
          autoComplete="username"
          aria-label="Cédula o identificación"
          value={idUsuario}
          onChange={(evento) => alCambiarIdUsuario(evento.target.value)}
          placeholder="Ej: 1234567890"
          className={CLASE_ENTRADA}
        />
      </div>

      <div>
        <label htmlFor="google-registro-nombre" className="mb-1.5 block text-xs font-medium text-white/80">
          Nombre completo *
        </label>
        <input
          id="google-registro-nombre"
          type="text"
          required
          autoComplete="name"
          aria-label="Nombre completo"
          value={nombre}
          onChange={(evento) => alCambiarNombre(evento.target.value)}
          placeholder="Tu nombre completo"
          className={CLASE_ENTRADA}
        />
      </div>

      <div>
        <label htmlFor="google-registro-contrasena" className="mb-1.5 block text-xs font-medium text-white/80">
          Crea tu contraseña *
        </label>
        <input
          id="google-registro-contrasena"
          type="password"
          required
          autoComplete="new-password"
          aria-label="Contraseña"
          aria-describedby="google-contrasena-ayuda"
          value={contrasena}
          onChange={(evento) => alCambiarContrasena(evento.target.value)}
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          className={CLASE_ENTRADA}
        />
        <p id="google-contrasena-ayuda" className="mt-1 text-xs text-white/60">
          Mínimo 8 caracteres. Podrás usarla para entrar sin Google.
        </p>
      </div>

      <div>
        <label htmlFor="google-registro-telefono" className="mb-1.5 block text-xs font-medium text-white/80">
          Teléfono (opcional)
        </label>
        <input
          id="google-registro-telefono"
          type="tel"
          autoComplete="tel"
          aria-label="Teléfono"
          value={telefono}
          onChange={(evento) => alCambiarTelefono(evento.target.value)}
          placeholder="+573001234567"
          className={CLASE_ENTRADA}
        />
      </div>

      {mensaje && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/20 p-3 text-xs text-red-200">
          {mensaje}
        </p>
      )}

      <div className="pt-2 flex flex-col gap-2">
        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-xl bg-[#1a7a5e] py-3 font-semibold text-white shadow-lg transition-all hover:bg-[#15634c] disabled:opacity-50"
        >
          {cargando ? "Creando cuenta…" : "Finalizar registro y acceder"}
        </button>
        {alCancelar && (
          <button
            type="button"
            onClick={alCancelar}
            disabled={cargando}
            className="w-full rounded-xl border border-white/15 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
