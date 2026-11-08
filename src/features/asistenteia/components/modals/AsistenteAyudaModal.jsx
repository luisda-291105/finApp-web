/**
 * @uso        Asistente de chat del dashboard con respuestas basadas en fuentes
 * @funciones  AsistenteAyuda({ abierto, alCerrar, triggerRef })
 * @datos      Mantiene mensajes temporales en memoria y consulta la guía informativa del backend
 * @eventos    Enviar pregunta o sugerencia, cancelar petición, limpiar historial y cerrar el diálogo
 * @estados    mensajes (persistidos), entrada, cargando, error, consultaFallida
 * @usadoPor   DashboardLayout
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotMessageSquare, History, Plus } from "lucide-react";
import { BotonCerrar } from "../../../../components/ui/BotonCerrar";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import { useAsistenteHistorial } from "../../hooks/useAsistenteHistorial";
import { conversarConAsistente, conversarConAsistentePublico, confirmarAccionAsistente } from "../../services/asistenteServicio";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";

const SUGERENCIAS = [
  "¿Para qué sirven los bolsillos?",
  "¿Cómo registro un gasto?",
  "¿Cómo conecto Gmail?",
  "¿Dónde administro mis tarjetas?",
];
const MAX_CARACTERES_PREGUNTA = 2000;

function crearOpcionesTrampa(refPanel) {
  return {
    allowOutsideClick: true,
    escapeDeactivates: false,
    initialFocus: () => refPanel.current,
    returnFocusOnDeactivate: false,
  };
}

export default function AsistenteAyudaModal({ abierto, alCerrar, triggerRef }) {
  const { usuario } = useUsuarioActivo();
  const esPersonal = Boolean(usuario?.idUsuario);
  const panelRef = useRef(null);
  const logRef = useRef(null);
  const peticionRef = useRef(null);
  const { mensajes, setMensajes, sesiones, nuevaSesion, abrirSesion } = useAsistenteHistorial(usuario?.idUsuario);
  const [vista, setVista] = useState("conversacion");
  const [entrada, setEntrada] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [consultaFallida, setConsultaFallida] = useState("");

  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  useEffect(() => {
    if (!abierto) {
      peticionRef.current?.abort();
      peticionRef.current = null;
      setCargando(false);
    }
  }, [abierto]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [mensajes, cargando, error]);

  if (!abierto) return null;

  const enviarMensaje = async (texto, incluirEnConversacion = true) => {
    const pregunta = String(texto || "").trim();
    if (!pregunta || cargando || pregunta.length > MAX_CARACTERES_PREGUNTA) return;

    const historial = mensajes.slice(-20).map(({ rol, contenido }) => ({ rol, contenido }));
    if (incluirEnConversacion) {
      setMensajes((actuales) => [...actuales, { rol: "user", contenido: pregunta }]);
    }
    setEntrada("");
    setError("");
    setConsultaFallida("");
    setCargando(true);

    const controlador = new AbortController();
    peticionRef.current = controlador;
    try {
      const consultar = esPersonal ? conversarConAsistente : conversarConAsistentePublico;
      const datos = await consultar({ mensaje: pregunta, historial }, controlador.signal);
      setMensajes((actuales) => [...actuales, {
        rol: "assistant",
        contenido: datos.respuesta,
        fuentes: datos.fuentes || [],
        aviso: datos.aviso || "",
        accionPendiente: datos.accionPendiente || null,
      }]);
    } catch (fallo) {
      if (fallo.name !== "AbortError") {
        setError(fallo.message || "No se pudo obtener una respuesta.");
        setConsultaFallida(pregunta);
      }
    } finally {
      if (peticionRef.current === controlador) {
        peticionRef.current = null;
        setCargando(false);
      }
    }
  };

  const confirmarAccion = async (token, indice) => {
    if (!esPersonal || cargando) return;
    setCargando(true);
    setError("");
    try {
      const resultado = await confirmarAccionAsistente(token);
      setMensajes((actuales) => actuales.map((mensaje, i) => i === indice
        ? { ...mensaje, contenido: resultado.respuesta || "Operación completada.", accionPendiente: null }
        : mensaje));
    } catch (fallo) {
      const detalle = fallo.message || "No se pudo confirmar la operación.";
      setMensajes((actuales) => actuales.map((mensaje, i) => i === indice
        ? { ...mensaje, contenido: detalle, accionPendiente: null }
        : mensaje));
      setError("");
    } finally {
      setCargando(false);
    }
  };

  const enviarFormulario = (evento) => {
    evento.preventDefault();
    void enviarMensaje(entrada);
  };

  const iniciarNuevaSesion = () => {
    if (cargando) return;
    nuevaSesion();
    setEntrada("");
    setError("");
    setConsultaFallida("");
    setVista("conversacion");
  };

  const mostrarFechaSesion = (fecha) => {
    const valor = new Date(fecha);
    return Number.isNaN(valor.getTime()) ? "Fecha desconocida" : valor.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/70 p-4"
      onClick={(evento) => evento.target === evento.currentTarget && !cargando && alCerrar()}
    >
      <FocusTrap focusTrapOptions={crearOpcionesTrampa(panelRef)}>
        <section
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="asistente-titulo"
          aria-describedby="asistente-aviso"
          tabIndex={-1}
          className="asistente-modal glass-surface relative flex max-h-[85vh] w-[90vw] max-w-md flex-col overflow-hidden rounded-3xl border border-border-line/30 bg-bg-cream/95 text-bg-dark shadow-xl outline-none"
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border-line/30 px-5 py-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 id="asistente-titulo" className="font-display text-lg font-semibold">Asistente de FinApp</h2>
              <p className="text-xs text-slate-text">{esPersonal ? "Consulta tus datos y administra FinApp con tu sesión." : "Pregunta cómo funciona FinApp y cómo usar sus funciones."}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {mensajes.length > 0 && vista === "conversacion" && (
                <button
                  type="button"
                  onClick={iniciarNuevaSesion}
                  disabled={cargando}
                  aria-label="Iniciar nueva conversación"
                  title="Nueva conversación"
                  className="rounded-full p-2 text-slate-text outline-none hover:bg-red-100 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <BotonCerrar
                ariaLabel="Cerrar asistente de ayuda"
                alCerrar={alCerrar}
                className="text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
              />
            </div>
          </header>

          {esPersonal && <nav aria-label="Vistas del asistente" className="flex shrink-0 gap-2 border-b border-border-line/30 px-5 py-2">
            <button type="button" role="tab" aria-selected={vista === "conversacion"} onClick={() => setVista("conversacion")} className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold ${vista === "conversacion" ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10"}`}>Conversación</button>
            <button type="button" role="tab" aria-selected={vista === "sesiones"} onClick={() => setVista("sesiones")} className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold ${vista === "sesiones" ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10"}`}><History className="h-3.5 w-3.5" aria-hidden="true" />Sesiones pasadas ({sesiones.length})</button>
          </nav>}

          <div
            ref={logRef}
            role={vista === "sesiones" ? "region" : "log"}
            aria-live={vista === "sesiones" ? undefined : "polite"}
            aria-relevant={vista === "sesiones" ? undefined : "additions"}
            aria-atomic={vista === "sesiones" ? undefined : "false"}
            aria-label={vista === "sesiones" ? "Sesiones anteriores del asistente" : "Mensajes del asistente"}
            className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
          >
            {vista === "sesiones" && esPersonal ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3"><p className="text-sm text-slate-text">Tus conversaciones guardadas en este dispositivo.</p><button type="button" onClick={iniciarNuevaSesion} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-emerald-primary px-3 text-xs font-semibold text-bg-cream"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Nueva</button></div>
                {sesiones.length ? <ul className="space-y-2">{sesiones.map((sesion) => <li key={sesion.id}><button type="button" onClick={() => { abrirSesion(sesion.id); setVista("conversacion"); setError(""); setConsultaFallida(""); }} className="w-full rounded-xl border border-border-line/60 bg-bg-cream/70 p-3 text-left hover:border-emerald-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><span className="block truncate text-sm font-semibold text-bg-dark">{sesion.titulo || "Conversación"}</span><span className="mt-1 flex flex-wrap justify-between gap-2 text-[11px] text-slate-text"><time dateTime={sesion.actualizadaEn}>{mostrarFechaSesion(sesion.actualizadaEn)}</time><span>{sesion.mensajes?.length || 0} mensajes</span></span></button></li>)}</ul>
                  : <p className="rounded-xl border border-border-line/50 p-4 text-sm text-slate-text">Todavía no tienes conversaciones guardadas.</p>}
              </div>
            ) : (
            <>
            {mensajes.length === 0 ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-text">
                  {esPersonal
                    ? "Consulta tus contactos, movimientos, bolsillos, grupos y fuentes. Puedes pedir cambios; el asistente te mostrará cada operación para que la confirmes."
                    : "Pregunta cómo funciona FinApp y cómo usar sus secciones. El asistente público no consulta datos personales ni realiza cambios."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGERENCIAS.map((sugerencia) => (
                    <button
                      key={sugerencia}
                      type="button"
                      disabled={cargando}
                      onClick={() => void enviarMensaje(sugerencia)}
                      className="rounded-full border border-border-line/60 bg-bg-cream px-3 py-1.5 text-left text-xs text-bg-dark hover:border-emerald-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {mensajes.map((mensaje, indice) => (
                  <div key={`${mensaje.rol}-${indice}`} className={mensaje.rol === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={mensaje.rol === "user"
                      ? "max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-emerald-primary px-3.5 py-2.5 text-sm text-bg-cream shadow-sm"
                      : "asistente-mensaje-ia max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-border-line/70 bg-white px-3.5 py-2.5 text-sm text-bg-dark shadow-sm"}>
                      {mensaje.rol !== "user" && (
                        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-primary">
                          <BotMessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                          Asistente
                        </p>
                      )}
                      <p className="whitespace-pre-line leading-relaxed">
                        {mensaje.rol === "user" && <span className="sr-only">Tú: </span>}
                        {mensaje.contenido}
                      </p>
                      {mensaje.accionPendiente && esPersonal && (
                        <div className="mt-3 rounded-xl border border-emerald-primary/30 bg-emerald-primary/5 p-3">
                          <p className="text-xs font-semibold text-emerald-primary">Revisa antes de confirmar</p>
                          <p className="mt-1 text-sm">{mensaje.accionPendiente.descripcion}</p>
                          <button type="button" disabled={cargando} onClick={() => void confirmarAccion(mensaje.accionPendiente.token, indice)} className="mt-2 rounded-lg bg-emerald-primary px-3 py-2 text-sm font-semibold text-bg-cream disabled:opacity-50">Confirmar operación</button>
                        </div>
                      )}
                      {mensaje.aviso && <p className="mt-2 text-xs text-slate-text">{mensaje.aviso}</p>}
                    </div>
                  </div>
                ))}
                {cargando && <p role="status" className="text-sm text-slate-text">Preparando respuesta…</p>}
              </div>
            )}
            </>
            )}
          </div>

          <footer className="flex shrink-0 flex-col gap-2 border-t border-border-line/30 px-5 py-4">
            <p id="asistente-aviso" className="text-xs text-slate-text">
              {esPersonal
                ? "Asistente personal: consulta y administra tus datos. Los cambios solo se aplican después de tu confirmación."
                : "Asistente informativo: explica las funciones de FinApp y cómo usarlas. No consulta datos personales ni realiza cambios."}
            </p>
            {error && (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <span>{error}</span>
                {consultaFallida && <button type="button" onClick={() => void enviarMensaje(consultaFallida, false)} className="font-semibold underline">Reintentar</button>}
              </div>
            )}
            <form onSubmit={enviarFormulario} className="flex items-center gap-2">
              <label htmlFor="asistente-entrada" className="sr-only">Tu pregunta</label>
              <input
                id="asistente-entrada"
                type="text"
                value={entrada}
                maxLength={MAX_CARACTERES_PREGUNTA}
                onChange={(evento) => setEntrada(evento.target.value)}
                placeholder={esPersonal ? "Pregunta por tus datos o pide una operación…" : "Escribe una pregunta sobre FinApp…"}
                disabled={cargando}
                className="min-w-0 flex-1 rounded-xl border border-border-line/60 bg-bg-cream px-3 py-2 text-sm text-bg-dark placeholder:text-slate-text outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={cargando || !entrada.trim()}
                className="shrink-0 rounded-xl bg-emerald-primary px-4 py-2 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50"
              >
                {cargando ? "Enviando…" : "Enviar"}
              </button>
            </form>
            <p className="text-right text-[11px] text-slate-text">{entrada.length}/{MAX_CARACTERES_PREGUNTA}</p>
          </footer>
        </section>
      </FocusTrap>
    </div>
  );
}
