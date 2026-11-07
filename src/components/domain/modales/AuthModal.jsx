/**
 * @uso        Modal de autenticación con tabs Iniciar Sesión / Registrarse y backdrop blur; cumple
 *             las CUATRO formas de cierre (spec 010): «X» superior, Esc, toque/clic fuera y
 *             deslizar hacia abajo (solo móvil)
 * @funciones  AuthModal({ abierto, modoInicial, alCerrar })
 * @datos      Lee endpoints mediante getEndpoint() de src/config/api.config.js
 * @eventos    onSubmit en formulario, click en tabs, click en la «X», Esc (useCierreConEsc),
 *             clic fuera (overlay con guarda de destino) y gesto (useDeslizarParaCerrar) → alCerrar;
 *             al abrir se captura el elemento activo y al cerrar se devuelve el foco con la pieza
 *             común (useRetornoDeFoco: captura + devolución)
 * @estados    modo ('login' | 'registro'), formulario (objeto), cargando (boolean), mensaje (string);
 *             la captura y la devolución del foco no usan estado de React (viven en useRetornoDeFoco)
 * @usadoPor   PaginaInicio, PaginaLogin
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FocusTrap from "focus-trap-react";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import { crearUsuario, iniciarSesion } from "../../../services/usuarioServicio";
import { GOOGLE_AUTH_CONFIGURADO, iniciarLoginGoogle } from "../../../services/authGoogleServicio";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";

const CLASE_ENTRADA = "min-h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/70 focus:border-emerald-primary focus-visible:ring-2 focus-visible:ring-mint-accent/60";

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
export default function AuthModal({ abierto, modoInicial = "login", alCerrar, mensajeExterno = "" }) {
  const panelRef = useRef(null);
  // Obtener navigate de React Router si está disponible; de lo contrario usar función no‑op para evitar errores en entornos de pruebas sin router.
let navigate;
try {
  navigate = useNavigate();
} catch {
  navigate = () => {};
}
  const { guardarUsuario } = useUsuarioActivo();
  const [modo, setModo] = useState(modoInicial);
  const [idUsuario, setIdUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Esc: mecanismo único compartido; la capa de este panel es 50 (plan §2.3-M1)
  useCierreConEsc({ activo: abierto, zIndex: 50, alCerrar });

  // Gesto de deslizar hacia abajo (solo móvil, con punteros nativos)
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });

  // Captura al abrir y devolución del foco al cerrar con la pieza compartida (RF-10, spec 011).
  // Sin `triggerRef` propio: el respaldo es la cadena común (elemento capturado → control de la
  // versión de vista → primer control enfocable); en `/login` no hay candidato y la pieza devuelve
  // `null` (limitación explícita, H2).
  useRetornoDeFoco({ activo: abierto });

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

  const manejarLoginGoogle = async () => {
    setCargando(true);
    setMensaje("");
    try {
      await iniciarLoginGoogle();
    } catch (error) {
      setMensaje(error?.message || "No se pudo iniciar sesión con Google.");
      setCargando(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      if (modo === "login") {
        const identificadorLimpio = idUsuario.trim();

        if (!identificadorLimpio) {
          setMensaje("Ingresa tu nombre, identificación, correo o teléfono.");
          setCargando(false);
          return;
        }

        if (contrasena.length < 1) {
          setMensaje("Ingresa tu contraseña.");
          setCargando(false);
          return;
        }

        try {
          const respuestaLogin = await iniciarSesion({ identificador: identificadorLimpio, contrasena });
          const usuario = respuestaLogin?.datos || respuestaLogin;
          if (usuario?.idUsuario) {
            guardarUsuario(usuario);
            setMensaje("¡Inicio de sesión exitoso!");
            setCargando(false);
            alCerrar();
            navigate("/dashboard");
            return;
          }
        } catch (error) {
          setMensaje(error?.message || "No fue posible iniciar sesión.");
          setCargando(false);
          return;
        }

        setMensaje("No se encontró una cuenta con esa identificación o correo.");
        setCargando(false);
        return;
      }

      const idUsuarioLimpio = idUsuario.trim();
      const nombreLimpio = nombre.trim();
      const correoLimpio = correo.trim().toLocaleLowerCase("es");
      const telefonoLimpio = telefono.trim();

      if (!idUsuarioLimpio) {
        setMensaje("Ingresa tu cédula o identificación.");
        setCargando(false);
        return;
      }
      if (!nombreLimpio) {
        setMensaje("Ingresa tu nombre.");
        setCargando(false);
        return;
      }
      if (correoLimpio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
        setMensaje("Ingresa un correo electrónico válido.");
        setCargando(false);
        return;
      }
      if (telefonoLimpio && (!/^\+?[\d\s().-]{7,20}$/.test(telefonoLimpio) || telefonoLimpio.replace(/\D/g, "").length < 7)) {
        setMensaje("Ingresa un teléfono válido con al menos 7 dígitos.");
        setCargando(false);
        return;
      }
      if (contrasena.length < 8) {
        setMensaje("La contraseña debe tener al menos 8 caracteres.");
        setCargando(false);
        return;
      }

      const fechaCreacion = new Date().toISOString().split("T")[0];

      await crearUsuario({
        idUsuario: idUsuarioLimpio,
        nombre: nombreLimpio,
        correo: correoLimpio,
        telefono: telefonoLimpio,
        contrasena,
        fechaCreacion,
      });

      const respuestaLogin = await iniciarSesion({ identificador: idUsuarioLimpio, contrasena });
      const usuarioAutenticado = respuestaLogin?.datos || respuestaLogin;

      if (usuarioAutenticado?.idUsuario) {
        guardarUsuario(usuarioAutenticado);
      }

      setMensaje("¡Usuario creado correctamente!");
      setCargando(false);
      alCerrar();
      navigate("/dashboard");
    } catch (error) {
      setMensaje(error?.message || "Error al crear la cuenta. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
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
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
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
                  : "border-transparent text-white/70 hover:text-white/80"
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
                  : "border-transparent text-white/70 hover:text-white/80"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarEnvio} className="space-y-5">
            {modo === "registro" && (
              <>
                <div>
                  <input
                    id="auth-registro-identificacion"
                    type="text"
                    required
                    autoComplete="username"
                    aria-label="Cédula o identificación"
                    value={idUsuario}
                    onChange={(e) => setIdUsuario(e.target.value)}
                    placeholder="Identificación"
                    className={CLASE_ENTRADA}
                  />
                </div>
                <div>
                  <input
                    id="auth-registro-nombre"
                    type="text"
                    required
                    autoComplete="name"
                    aria-label="Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre completo"
                    className={CLASE_ENTRADA}
                  />
                </div>
                <div>
                  <input
                    id="auth-registro-correo"
                    type="email"
                    autoComplete="email"
                    aria-label="Correo electrónico"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Correo electrónico"
                    className={CLASE_ENTRADA}
                  />
                </div>
                <div>
                  <input
                    id="auth-registro-telefono"
                    type="tel"
                    autoComplete="tel"
                    aria-label="Teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Teléfono"
                    className={CLASE_ENTRADA}
                  />
                </div>
                <p className="-mt-3 text-xs text-white/70">Correo y teléfono son opcionales; puedes agregarlos más adelante desde tu perfil.</p>
              </>
            )}

            {modo === "login" && (
              <div>
                <input
                  id="auth-login-identificacion"
                  type="text"
                  required
                  autoComplete="username"
                  aria-label="Nombre, identificación, correo o teléfono"
                  value={idUsuario}
                  onChange={(e) => setIdUsuario(e.target.value)}
                  placeholder="Nombre, identificación, correo o teléfono"
                  className={CLASE_ENTRADA}
                />
              </div>
            )}

            <div>
              <input
                id="auth-contrasena"
                type="password"
                required
                autoComplete={modo === "registro" ? "new-password" : "current-password"}
                aria-label="Contraseña"
                aria-describedby={modo === "registro" ? "auth-contrasena-ayuda" : undefined}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña"
                minLength={8}
                className={CLASE_ENTRADA}
              />
              {modo === "registro" && (
                <p id="auth-contrasena-ayuda" className="mt-2 text-xs text-white/70">Mínimo 8 caracteres</p>
              )}
            </div>

            {mensaje && (
              <div
                role="alert"
                className="p-3 bg-[#1a7a5e]/20 border border-[#1a7a5e]/50 rounded-xl text-xs text-[#6ee7c0]"
              >
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
                : "Crear cuenta"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-white/60" aria-hidden="true">
            <span className="h-px flex-1 bg-white/10" />
            <span>{modo === "registro" ? "o regístrate con" : "o continúa con"}</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <button
            type="button"
            onClick={manejarLoginGoogle}
            disabled={cargando || !GOOGLE_AUTH_CONFIGURADO}
            className="google-auth-button flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:cursor-not-allowed"
          >
            <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.75 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.44.34-2.1V7.06H2.15A11 11 0 0 0 1 12c0 1.78.43 3.46 1.15 4.94l3.69-2.84z" />
              <path fill="#EA4335" d="M12 5.37c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.1 14.97 1 12 1a11 11 0 0 0-9.85 6.06L5.84 9.9C6.71 7.3 9.14 5.37 12 5.37z" />
            </svg>
            {cargando
              ? "Conectando con Google…"
              : modo === "registro" ? "Registrarse con Google" : "Iniciar sesión con Google"}
          </button>
          {modo === "registro" && (
            <p className="mt-2 text-center text-xs text-white/70">
              Google completará tus datos y abrirá tu cuenta automáticamente. Para entrar con identificación y contraseña, regístrate con correo.
            </p>
          )}
          {!GOOGLE_AUTH_CONFIGURADO && (
            <p role="status" className="mt-2 text-xs text-amber-200">Google no está configurado para este entorno.</p>
          )}
          {mensajeExterno && (
            <p role="alert" className="mt-3 rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-xs text-red-100">
              {mensajeExterno}
            </p>
          )}
        </div>
      </FocusTrap>
    </div>
  );
}
