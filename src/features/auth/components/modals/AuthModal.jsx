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
 * @usadoPor   PaginaInicio y LoginPage
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FocusTrap from "focus-trap-react";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import { BotonServicioExterno } from "../../../../components/ui";
import { crearUsuario, iniciarSesion } from "../../services/usuarioServicio";
import { GOOGLE_AUTH_CONFIGURADO, iniciarLoginGoogle, completarRegistroGoogle } from "../../services/authGoogleServicio";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";
import LoginForm from "../forms/LoginForm";
import RegistroForm from "../forms/RegistroForm";
import CompletarRegistroGoogleForm from "../forms/CompletarRegistroGoogleForm";


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
export default function AuthModal({
  abierto,
  modoInicial = "login",
  alCerrar,
  mensajeExterno = "",
  datosGooglePendiente = null,
  alCancelarGoogle = null,
}) {
  const panelRef = useRef(null);
  const punteroFondoRef = useRef({ inicioEnFondo: false, finEnFondo: false });
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
  useRetornoDeFoco({ activo: abierto });

  useEffect(() => {
    if (datosGooglePendiente) {
      setModo("completar_google");
      if (datosGooglePendiente.nombre) setNombre(datosGooglePendiente.nombre);
      if (datosGooglePendiente.correo) setCorreo(datosGooglePendiente.correo);
    } else {
      setModo(modoInicial);
    }
    setMensaje("");
  }, [modoInicial, abierto, datosGooglePendiente]);

  if (!abierto) return null;

  const manejarClicExterior = (evento) => {
    // Evita cerrar si una selección empezó dentro de un campo y terminó sobre el fondo.
    const { inicioEnFondo, finEnFondo } = punteroFondoRef.current;
    punteroFondoRef.current = { inicioEnFondo: false, finEnFondo: false };
    if (inicioEnFondo && finEnFondo && evento.target === evento.currentTarget) {
      alCerrar();
    }
  };

  const registrarInicioPuntero = (evento) => {
    punteroFondoRef.current = {
      inicioEnFondo: evento.target === evento.currentTarget,
      finEnFondo: false,
    };
  };

  const registrarFinPuntero = (evento) => {
    punteroFondoRef.current.finEnFondo = evento.target === evento.currentTarget;
  };

  const manejarLoginGoogle = async () => {
    setCargando(true);
    setMensaje("");
    try {
      await iniciarLoginGoogle(modo === "registro" ? "registro" : "login");
    } catch (error) {
      setMensaje(error?.message || "No se pudo conectar con Google.");
      setCargando(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      if (modo === "completar_google") {
        const idUsuarioLimpio = idUsuario.trim();
        const nombreLimpio = nombre.trim();
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
        if (contrasena.length < 8) {
          setMensaje("La contraseña debe tener al menos 8 caracteres.");
          setCargando(false);
          return;
        }

        const respuestaRegistro = await completarRegistroGoogle({
          idUsuario: idUsuarioLimpio,
          contrasena,
          nombre: nombreLimpio,
          telefono: telefonoLimpio,
        });

        const usuarioAutenticado = respuestaRegistro?.datos || respuestaRegistro;
        if (usuarioAutenticado?.idUsuario) {
          guardarUsuario(usuarioAutenticado);
        }

        setMensaje("¡Cuenta creada correctamente!");
        setCargando(false);
        alCerrar();
        navigate("/dashboard");
        return;
      }

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
      onPointerDown={registrarInicioPuntero}
      onPointerUp={registrarFinPuntero}
      onPointerCancel={() => { punteroFondoRef.current = { inicioEnFondo: false, finEnFondo: false }; }}
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

          {/* Tabs de cambio - solo si no estamos en completar_google */}
          {modo !== "completar_google" ? (
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
          ) : (
            <div className="border-b border-white/10 mb-5 pb-3">
              <h2 className="text-lg font-semibold text-white">Completar registro</h2>
              <p className="text-xs text-white/60">Paso final para crear y vincular tu cuenta con Google</p>
            </div>
          )}

          {modo === "completar_google" ? (
            <CompletarRegistroGoogleForm
              datosGoogle={datosGooglePendiente}
              idUsuario={idUsuario}
              nombre={nombre}
              telefono={telefono}
              contrasena={contrasena}
              alCambiarIdUsuario={setIdUsuario}
              alCambiarNombre={setNombre}
              alCambiarTelefono={setTelefono}
              alCambiarContrasena={setContrasena}
              alEnviar={manejarEnvio}
              cargando={cargando}
              mensaje={mensaje}
              alCancelar={() => {
                if (alCancelarGoogle) alCancelarGoogle();
                setModo("registro");
              }}
            />
          ) : modo === "login" ? (
            <LoginForm
              idUsuario={idUsuario}
              contrasena={contrasena}
              alCambiarIdUsuario={setIdUsuario}
              alCambiarContrasena={setContrasena}
              alEnviar={manejarEnvio}
              cargando={cargando}
              mensaje={mensaje}
            />
          ) : (
            <RegistroForm
              idUsuario={idUsuario}
              nombre={nombre}
              correo={correo}
              telefono={telefono}
              contrasena={contrasena}
              alCambiarIdUsuario={setIdUsuario}
              alCambiarNombre={setNombre}
              alCambiarCorreo={setCorreo}
              alCambiarTelefono={setTelefono}
              alCambiarContrasena={setContrasena}
              alEnviar={manejarEnvio}
              cargando={cargando}
              mensaje={mensaje}
            />
          )}

          {modo !== "completar_google" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-white/60" aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" />
                <span>{modo === "registro" ? "o regístrate con" : "o continúa con"}</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <BotonServicioExterno
                onClick={manejarLoginGoogle}
                disabled={cargando || !GOOGLE_AUTH_CONFIGURADO}
              >
                {cargando
                  ? "Conectando con Google…"
                  : modo === "registro" ? "Registrarse con Google" : "Iniciar sesión con Google"}
              </BotonServicioExterno>
              {modo === "registro" && (
                <p className="mt-2 text-center text-xs text-white/70">
                  Google verificará tu identidad y luego te pedirá crear tu identificación y contraseña.
                </p>
              )}
              {!GOOGLE_AUTH_CONFIGURADO && (
                <p role="status" className="mt-2 text-xs text-amber-200">Google no está configurado para este entorno.</p>
              )}
            </>
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
