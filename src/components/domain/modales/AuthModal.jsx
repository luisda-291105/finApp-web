/**
 * @uso        Modal de autenticación con tabs Iniciar Sesión / Registrarse y backdrop blur; cumple
 *             las CUATRO formas de cierre (spec 010): «X» superior, Esc, toque/clic fuera y
 *             deslizar hacia abajo (solo móvil)
 * @funciones  AuthModal({ abierto, modoInicial, alCerrar })
 * @datos      Lee endpoints mediante getEndpoint() de src/config/api.config.js
 * @eventos    onSubmit en formulario, click en tabs, click en la «X», Esc (useCierreConEsc),
 *             clic fuera (overlay con guarda de destino) y gesto (useDeslizarParaCerrar) → alCerrar
 * @estados    modo ('login' | 'registro'), formulario (objeto), cargando (boolean), mensaje (string)
 * @usadoPor   PaginaInicio, PaginaLogin
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { getEndpoint } from "../../../config/api.config";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";

/**
 * Opciones REALES de `focus-trap` (spec 010 §2.2). `allowOutsideClick: true` hace efectivo el
 * clic exterior (la trampa no cancela ni consume el evento) SIN desactivarse; `escapeDeactivates:
 * false` deja Esc al único manejador común (`useCierreConEsc`); el foco inicial va al contenedor
 * del diálogo y el retorno de foco es manual (`returnFocusOnDeactivate: false`).
 * Solo se pasan opciones existentes de la API: no se desactiva la trampa con el clic exterior.
 */
function crearOpcionesTrampa(refPanel) {
  return {
    allowOutsideClick: true,
    escapeDeactivates: false,
    initialFocus: () => refPanel.current,
    returnFocusOnDeactivate: false,
  };
}

/**
 * AuthModal
 * Despliega formulario modal para inicio de sesión o creación de cuenta nueva.
 * - Cuatro formas de cierre: «X» superior, Esc (mecanismo único por capa), toque/clic fuera
 *   (overlay con guarda de destino) y deslizar hacia abajo solo en móvil.
 * - Una sola trampa de foco (la del panel) y **un solo** control visible de cierre; el foco
 *   inicial va al contenedor del diálogo (`tabIndex={-1}`, fuera del ciclo de Tab).
 * - Cerrar NO borra los campos del formulario (RF-11/AC-22): el componente permanece montado y
 *   solo reinicia el tab activo y el mensaje.
 * @param {Object} props
 * @param {boolean} props.abierto - Control de visibilidad
 * @param {'login' | 'registro'} props.modoInicial - Tab activo al abrir
 * @param {() => void} props.alCerrar - Callback de cierre
 */
export default function AuthModal({ abierto, modoInicial = "login", alCerrar }) {
  const panelRef = useRef(null);
  const [modo, setModo] = useState(modoInicial);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Esc: mecanismo único compartido; la capa de este panel es 50 (plan §2.3-M1)
  useCierreConEsc({ activo: abierto, zIndex: 50, alCerrar });

  // Gesto de deslizar hacia abajo (solo móvil, con punteros nativos)
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });

  useEffect(() => {
    setModo(modoInicial);
    setMensaje("");
  }, [modoInicial, abierto]);

  if (!abierto) return null;

  const manejarClicExterior = (evento) => {
    // Solo cierra si el clic cae directamente en la capa exterior (no en el panel)
    if (evento.target === evento.currentTarget) {
      alCerrar();
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const rutaEndpoint = modo === "login" ? "auth.login" : "auth.registro";
      const url = getEndpoint(rutaEndpoint);

      let respuesta;
      try {
        respuesta = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            modo === "login"
              ? { correo, contrasena }
              : { nombre, correo, contrasena }
          ),
        });
      } catch (error) {
        setMensaje(
          "No se pudo conectar con el backend. El servicio aún no está disponible."
        );
        setCargando(false);
        return;
      }

      if (respuesta.ok) {
        setMensaje("¡Operación exitosa!");
        setTimeout(() => alCerrar(), 1200);
      } else {
        setMensaje(
          modo === "login"
            ? "Error al iniciar sesión. Verifica tus credenciales."
            : "Error al crear la cuenta. Intenta de nuevo."
        );
      }
    } catch (error) {
      setMensaje("Error al procesar la solicitud: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={manejarClicExterior}
    >
      <FocusTrap focusTrapOptions={crearOpcionesTrampa(panelRef)}>
        {/* Tarjeta Modal Fluid Glass */}
        <div
          ref={panelRef}
          className="relative w-full max-w-md max-h-[85vh] overflow-y-auto outline-none bg-[#0f1117]/95 border border-white/15 rounded-3xl p-7 md:p-8 shadow-2xl text-white backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Ventana de acceso"
          tabIndex={-1}
        >
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar ventana de acceso"
            className="absolute top-5 right-5 text-white/50 hover:text-white p-1 rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
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
      </FocusTrap>
    </div>
  );
}