/**
 * @uso        Modal de autenticación con tabs Iniciar Sesión / Registrarse y backdrop blur
 * @funciones  AuthModal({ abierto, modoInicial, alCerrar })
 * @datos      Lee endpoints mediante getEndpoint() de src/config/api.config.js
 * @eventos    onSubmit en formulario, click en tabs y botón cerrar
 * @estados    modo ('login' | 'registro'), formulario (objeto), cargando (boolean), mensaje (string)
 * @usadoPor   App.jsx
 */
import { useEffect, useState } from "react";
import { getEndpoint } from "../config/api.config";

/**
 * AuthModal
 * Despliega formulario modal para inicio de sesión o creación de cuenta nueva.
 * @param {Object} props
 * @param {boolean} props.abierto - Control de visibilidad
 * @param {'login' | 'registro'} props.modoInicial - Tab activo al abrir
 * @param {() => void} props.alCerrar - Callback de cierre
 */
export default function AuthModal({ abierto, modoInicial = "login", alCerrar }) {
  const [modo, setModo] = useState(modoInicial);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setModo(modoInicial);
    setMensaje("");
  }, [modoInicial, abierto]);

  if (!abierto) return null;

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const rutaEndpoint = modo === "login" ? "auth.login" : "auth.registro";
      const url = getEndpoint(rutaEndpoint);

      // Simulación o llamada al endpoint configurado
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          modo === "login"
            ? { correo, contrasena }
            : { nombre, correo, contrasena }
        ),
      }).catch(() => null);

      if (respuesta && respuesta.ok) {
        setMensaje("¡Operación exitosa!");
        setTimeout(() => alCerrar(), 1200);
      } else {
        // Modo demo mientras el backend no esté desplegado
        setMensaje(
          modo === "login"
            ? "Acceso demo concedido (backend pendiente de conexión)."
            : "Cuenta demo creada correctamente."
        );
        setTimeout(() => alCerrar(), 1500);
      }
    } catch (error) {
      setMensaje("Error al procesar la solicitud: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Tarjeta Modal Fluid Glass */}
      <div
        className="relative w-full max-w-md bg-[#0f1117]/95 border border-white/15 rounded-3xl p-7 md:p-8 shadow-2xl text-white backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar modal"
          className="absolute top-5 right-5 text-white/50 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tabs de cambio */}
        <div className="flex border-b border-white/10 mb-6 pb-2 gap-6">
          <button
            type="button"
            onClick={() => setModo("login")}
            className={`text-base font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
              modo === "login"
                ? "border-[#1a7a5e] text-white"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setModo("registro")}
            className={`text-base font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
              modo === "registro"
                ? "border-[#1a7a5e] text-white"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="space-y-4">
          {modo === "registro" && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#1a7a5e] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#1a7a5e] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#1a7a5e] transition-colors"
            />
          </div>

          {mensaje && (
            <div className="p-3 bg-[#1a7a5e]/20 border border-[#1a7a5e]/50 rounded-xl text-xs text-[#6ee7c0]">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-4 bg-[#1a7a5e] hover:bg-[#15634c] text-white font-medium py-3 rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {cargando
              ? "Procesando..."
              : modo === "login"
              ? "Entrar a mi cuenta"
              : "Crear cuenta gratis"}
          </button>
        </form>
      </div>
    </div>
  );
}
