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

const CLASE_ENTRADA = "min-h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-emerald-primary focus-visible:ring-2 focus-visible:ring-mint-accent/60";

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
        const idUsuarioLimpio = idUsuario.trim();

        if (!idUsuarioLimpio) {
          setMensaje("Ingresa tu identificación o correo.");
          setCargando(false);
          return;
        }

        if (contrasena.length < 1) {
          setMensaje("Ingresa tu contraseña.");
          setCargando(false);
          return;
        }

        try {
          const respuestaLogin = await iniciarSesion({ idUsuario: idUsuarioLimpio, contrasena });
          const usuario = respuestaLogin?.datos || respuestaLogin;
          if (usuario?.idUsuario) {
            guardarUsuario(usuario);
            console.log("Login con idUsuario:", usuario);
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
      if (!correoLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
        setMensaje("Ingresa un correo electrónico válido.");
        setCargando(false);
        return;
      }
      if (contrasena.length < 8) {
        setMensaje("La contraseña debe tener al menos 8 caracteres.");
        setCargando(false);
        return;
      }

      const fechaCreacion = new Date().toISOString().split("T")[0];

      const respuesta = await crearUsuario({
        idUsuario: idUsuarioLimpio,
        nombre: nombreLimpio,
        correo: correoLimpio,
        contrasena,
        fechaCreacion,
      });

      const respuestaLogin = await iniciarSesion({ idUsuario: idUsuarioLimpio, contrasena });
      const usuarioAutenticado = respuestaLogin?.datos || respuestaLogin;

      console.log("Registro desde AuthModal:", respuesta);

      if (usuarioAutenticado?.idUsuario) {
        guardarUsuario(usuarioAutenticado);
      }

      setMensaje("¡Usuario creado correctamente!");
      setCargando(false);
      alCerrar();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error en registro desde AuthModal:", error);
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
              Registrarse con correo
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
                    placeholder="Ej. 1234567890"
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
                    placeholder="Ej. Juan Pérez"
                    className={CLASE_ENTRADA}
                  />
                </div>
                <div>
                  <input
                    id="auth-registro-correo"
                    type="email"
                    required
                    autoComplete="email"
                    aria-label="Correo electrónico"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Ej. tu@correo.com"
                    className={CLASE_ENTRADA}
                  />
                </div>
              </>
            )}

            {modo === "login" && (
              <div>
                <input
                  id="auth-login-identificacion"
                  type="text"
                  required
                  autoComplete="username"
                  aria-label="Identificación o correo electrónico"
                  value={idUsuario}
                  onChange={(e) => setIdUsuario(e.target.value)}
                  placeholder="Correo o número de identificación"
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
                <p id="auth-contrasena-ayuda" className="mt-2 text-xs text-white/50">Mínimo 8 caracteres</p>
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

          <div className="my-5 flex items-center gap-3 text-xs text-white/40" aria-hidden="true">
            <span className="h-px flex-1 bg-white/10" />
            <span>{modo === "registro" ? "o regístrate con" : "o continúa con"}</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <button
            type="button"
            onClick={manejarLoginGoogle}
            disabled={cargando || !GOOGLE_AUTH_CONFIGURADO}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border-line bg-bg-cream px-4 py-3 text-sm font-medium text-bg-dark transition-colors hover:bg-bg-cream/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true" className="font-bold text-lg text-[#4285f4]">G</span>
            {cargando
              ? "Conectando con Google…"
              : modo === "registro" ? "Registrarse con Google" : "Iniciar sesión con Google"}
          </button>
          {modo === "registro" && (
            <p className="mt-2 text-center text-xs text-white/50">
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
