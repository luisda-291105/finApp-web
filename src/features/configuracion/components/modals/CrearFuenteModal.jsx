/**
 * @uso        Modal para registrar fuentes de datos (correos, teléfonos, etc.) según spec 025
 * @funciones  CrearFuenteModal({ abierto, alCerrar, triggerRef, alGuardar })
 * @datos      tipo, contenido, estado (true por defecto), fechaCreacion (YYYY-MM-DD local), idFuente (UUID generado), idUsuario (del usuario activo)
 * @eventos    Submit del formulario para crearFuente(), selección de tipo, input de contenido, cierre con «X», Escape y clic exterior
 * @estados    tipo, contenido, idUsuarioInput, cargando, error
 * @usadoPor   ConfiguracionPage
 */

import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar, BotonServicioExterno } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import { crearFuente } from "../../../../services/fuenteServicio";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";

const TITULO = "Registro de fuentes";
const DESCRIPCION =
  "Selecciona el tipo de fuente e ingresa su contenido para registrarla en el sistema.";

const TIPOS_FUENTE = [
  { valor: "CORREO", etiqueta: "Correo electrónico" },
  { valor: "TELEFONO", etiqueta: "Teléfono" },
  { valor: "OTRO", etiqueta: "Otro" },
];

/** Fecha local en formato YYYY-MM-DD sin desfase UTC. */
function fechaLocalISO() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/** Genera un UUID v4 seguro para idFuente local. */
function generarId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Opciones para la trampa de foco accesible. */
function crearOpcionesTrampa(refPanel) {
  return {
    allowOutsideClick: true,
    escapeDeactivates: false,
    initialFocus: () => refPanel.current,
    returnFocusOnDeactivate: false,
  };
}

/**
 * CrearFuenteModal
 * Componente modal accesible para crear y registrar nuevas fuentes financieras (spec 025).
 *
 * @param {Object} props
 * @param {boolean} props.abierto - Controla la visibilidad del diálogo.
 * @param {() => void} props.alCerrar - Notifica el cierre del modal.
 * @param {React.RefObject<HTMLElement>} [props.triggerRef] - Elemento al cual devolver el foco.
 * @param {(fuente: Object) => void} [props.alGuardar] - Callback invocado tras crear exitosamente la fuente.
 */
export default function CrearFuenteModal({ abierto, alCerrar, triggerRef, alGuardar, fuentesExistentes = [], tipoInicial = "CORREO", tiposPermitidos = TIPOS_FUENTE.map((opcion) => opcion.valor), estadoInicial = true, alConectarGmail, gmailConfigurado, gmailListo, conexionGmailCargando, gmailConectado }) {
  const panelRef = useRef(null);
  const { usuario } = useUsuarioActivo();
  const [tipo, setTipo] = useState(tipoInicial);
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const reiniciarFormulario = () => {
    setTipo(tipoInicial);
    setContenido("");
    setError("");
    setCargando(false);
  };

  const cerrar = () => {
    if (cargando) return;
    reiniciarFormulario();
    alCerrar();
  };

  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar: cerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  useEffect(() => {
    if (!abierto) {
      reiniciarFormulario();
    }
  }, [abierto, usuario, tipoInicial]);

  if (!abierto) return null;

  const manejarClicExterior = (evento) => {
    if (evento.target === evento.currentTarget) {
      cerrar();
    }
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    if (cargando) return;

    const idUsuarioFinal = usuario?.idUsuario;
    if (!idUsuarioFinal) {
      setError("Inicia sesión para registrar una fuente en tu cuenta.");
      return;
    }

    const contenidoLimpio = contenido.trim();
    if (!contenidoLimpio) {
      setError("El contenido de la fuente es obligatorio.");
      return;
    }

    const contenidoNormalizado = contenidoLimpio.toLocaleLowerCase("es");
    const existeFuente = fuentesExistentes.some((fuente) =>
      fuente.tipo?.toLocaleUpperCase("es") === tipo.toLocaleUpperCase("es") &&
      fuente.contenido?.trim().toLocaleLowerCase("es") === contenidoNormalizado
    );
    if (existeFuente) {
      setError(tipo === "CORREO" ? "Este correo ya está registrado en tu cuenta." : "Esta fuente ya está registrada en tu cuenta.");
      return;
    }

    try {
      setCargando(true);
      setError("");

      const nuevaFuente = {
        idFuente: generarId(),
        usuario: { idUsuario: idUsuarioFinal },
        tipo,
        contenido: contenidoLimpio,
        estado: tipo === "CORREO" ? estadoInicial : true,
        fechaCreacion: fechaLocalISO(),
      };

      const resultado = await crearFuente(nuevaFuente);
      const fuenteGuardada = resultado || nuevaFuente;

      if (alGuardar) {
        await alGuardar(fuenteGuardada);
      }

      reiniciarFormulario();
      alCerrar();
    } catch (err) {
      setError(err?.message || "Error al registrar la fuente en el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerPlaceholder = () => {
    switch (tipo) {
      case "CORREO":
        return "ejemplo@correo.com";
      case "TELEFONO":
        return "+52 55 1234 5678";
      default:
        return "Ingrese el identificador o detalle de la fuente";
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/70"
      onClick={manejarClicExterior}
    >
      <FocusTrap focusTrapOptions={crearOpcionesTrampa(panelRef)}>
        <section
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fuentes-titulo"
          aria-describedby="fuentes-descripcion"
          tabIndex={-1}
          className="relative z-60 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto outline-none bg-bg-cream/95 glass-surface border border-border-line/30 rounded-3xl shadow-xl inset-shadow-[0_1px_1px_0_rgba(255,255,255,0.25)]"
        >
          <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border-line/30">
            <div className="flex flex-col gap-1">
              <h2
                id="fuentes-titulo"
                className="font-display text-lg font-semibold text-bg-dark"
              >
                {TITULO}
              </h2>
              <p id="fuentes-descripcion" className="text-sm text-slate-text">
                {DESCRIPCION}
              </p>
            </div>
            <BotonCerrar
              ariaLabel="Cerrar registro de fuentes"
              alCerrar={cerrar}
              className="shrink-0 text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
            />
          </header>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4 px-5 py-5">
            {error && (
              <div
                role="alert"
                className="p-3 text-xs font-medium text-red-700 bg-red-100 rounded-xl border border-red-200"
              >
                {error}
              </div>
            )}

            {usuario?.nombre && <p className="text-xs font-medium text-emerald-primary">Usuario activo: {usuario.nombre}</p>}

            {/* Selector de Tipo de Fuente */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fuentes-tipo" className="text-sm font-medium text-bg-dark">
                Tipo de fuente
              </label>
              <select
                id="fuentes-tipo"
                value={tipo}
                onChange={(evento) => setTipo(evento.target.value)}
                disabled={cargando}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50 cursor-pointer"
              >
                {TIPOS_FUENTE.filter((opcion) => tiposPermitidos.includes(opcion.valor)).map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            {/* Input de Contenido de la Fuente */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fuentes-contenido" className="text-sm font-medium text-bg-dark">
                Contenido de la fuente
              </label>
              <input
                id="fuentes-contenido"
                type="text"
                maxLength={255}
                value={contenido}
                onChange={(evento) => setContenido(evento.target.value)}
                placeholder={obtenerPlaceholder()}
                disabled={cargando}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50"
              />
            </div>

            {/* Nota de estado activo */}
            <p className="text-xs text-slate-text">
              {tipo === "CORREO" && !estadoInicial
                ? "El correo se registrará inactivo hasta que conectes Gmail."
                : "La fuente se registrará activa con la fecha actual vinculada al usuario."}
            </p>

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 min-h-11 rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2 disabled:opacity-50 cursor-pointer"
            >
              {cargando ? "Registrando..." : "Registrar fuente"}
            </button>
          </form>
          {tipo === "CORREO" && (
            <div className="flex flex-col gap-2 px-5 pb-5">
              <div className="flex items-center gap-3 text-xs text-slate-text" aria-hidden="true">
                <span className="h-px flex-1 bg-border-line" />
                <span>o conecta con</span>
                <span className="h-px flex-1 bg-border-line" />
              </div>
              <BotonServicioExterno
                onClick={alConectarGmail}
                disabled={!gmailConfigurado || !gmailListo || conexionGmailCargando}
              >
                {!gmailConfigurado ? "Configura Gmail" : conexionGmailCargando ? "Conectando con Google…" : !gmailListo ? "Preparando Google…" : gmailConectado ? "Conectar otra cuenta de Gmail" : "Conectar Gmail con Google"}
              </BotonServicioExterno>
              {gmailConectado && <p className="text-center text-xs text-slate-text">Puedes agregar otra cuenta sin desconectar la actual.</p>}
              {gmailConfigurado === false && <p role="status" className="text-center text-xs text-slate-text">Google no está configurado para este entorno.</p>}
            </div>
          )}
        </section>
      </FocusTrap>
    </div>
  );
}

