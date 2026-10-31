/**
 * @uso        Asistente de chat del dashboard con respuestas basadas en fuentes
 * @funciones  AsistenteAyuda({ abierto, alCerrar, triggerRef })
 * @datos      Mantiene mensajes solo en memoria; consulta el backend para generar respuestas
 * @eventos    Enviar pregunta o sugerencia, cancelar petición y cerrar el diálogo
 * @estados    mensajes, entrada, cargando, error, consultaFallida
 * @usadoPor   DashboardLayout
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import { conversarConAsistente } from "../../../services/asistenteServicio";

const SUGERENCIAS = [
  "¿Dónde veo mis tarjetas?",
  "¿Cómo cambio la apariencia?",
  "¿Qué datos consulta este chat?",
];

function crearOpcionesTrampa(refPanel) {
  return {
    allowOutsideClick: true,
    escapeDeactivates: false,
    initialFocus: () => refPanel.current,
    returnFocusOnDeactivate: false,
  };
}

export default function AsistenteAyuda({ abierto, alCerrar, triggerRef }) {
  const panelRef = useRef(null);
  const logRef = useRef(null);
  const peticionRef = useRef(null);
  const [mensajes, setMensajes] = useState([]);
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
    if (!pregunta || cargando || pregunta.length > 500) return;

    const historial = mensajes.slice(-8).map(({ rol, contenido }) => ({ rol, contenido }));
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
      const datos = await conversarConAsistente({ mensaje: pregunta, historial }, controlador.signal);
      setMensajes((actuales) => [...actuales, {
        rol: "assistant",
        contenido: datos.respuesta,
        fuentes: datos.fuentes || [],
        aviso: datos.aviso || "",
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

  const enviarFormulario = (evento) => {
    evento.preventDefault();
    void enviarMensaje(entrada);
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
          className="glass-surface relative flex max-h-[85vh] w-[90vw] max-w-md flex-col overflow-hidden rounded-3xl border border-border-line/30 bg-bg-cream/95 text-bg-dark shadow-xl outline-none"
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border-line/30 px-5 py-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 id="asistente-titulo" className="font-display text-lg font-semibold">Asistente de FinApp</h2>
              <p className="text-xs text-slate-text">Respuestas con documentación y búsqueda pública.</p>
            </div>
            <BotonCerrar
              ariaLabel="Cerrar asistente de ayuda"
              alCerrar={alCerrar}
              className="shrink-0 text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
            />
          </header>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-atomic="false"
            aria-label="Mensajes del asistente"
            className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
          >
            {mensajes.length === 0 ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-text">
                  Pregunta sobre cómo usar FinApp o solicita información pública actual.
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
                      ? "max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-emerald-primary px-3.5 py-2.5 text-sm text-bg-cream"
                      : "max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-border-line/40 bg-bg-cream px-3.5 py-2.5 text-sm text-bg-dark"}
                    >
                      <p>{mensaje.contenido}</p>
                      {mensaje.fuentes?.length > 0 && (
                        <div className="mt-3 border-t border-border-line/50 pt-2 text-xs">
                          <p className="mb-1 font-semibold">Fuentes</p>
                          <ul className="flex flex-col gap-1">
                            {mensaje.fuentes.map((fuente) => (
                              <li key={fuente.id}>
                                {fuente.url ? (
                                  <a href={fuente.url} target="_blank" rel="noreferrer" className="text-emerald-primary underline underline-offset-2">
                                    [{fuente.id}] {fuente.titulo}
                                  </a>
                                ) : (
                                  <span>[{fuente.id}] {fuente.titulo}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {mensaje.aviso && <p className="mt-2 text-xs text-slate-text">{mensaje.aviso}</p>}
                    </div>
                  </div>
                ))}
                {cargando && <p role="status" className="text-sm text-slate-text">Buscando fuentes y preparando respuesta…</p>}
              </div>
            )}
          </div>

          <footer className="flex shrink-0 flex-col gap-2 border-t border-border-line/30 px-5 py-4">
            <p id="asistente-aviso" className="text-xs text-slate-text">
              No escribas datos personales, números de tarjeta, CVV ni contraseñas. El chat no consulta tu cuenta.
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
                maxLength={500}
                onChange={(evento) => setEntrada(evento.target.value)}
                placeholder="Escribe una pregunta…"
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
          </footer>
        </section>
      </FocusTrap>
    </div>
  );
}
