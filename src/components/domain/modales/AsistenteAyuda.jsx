/**
 * @uso        Asistente de chat del dashboard con respuestas basadas en fuentes
 * @funciones  AsistenteAyuda({ abierto, alCerrar, triggerRef })
 * @datos      Persiste mensajes en sessionStorage; consulta el backend para generar respuestas
 * @eventos    Enviar pregunta o sugerencia, cancelar petición, limpiar historial y cerrar el diálogo
 * @estados    mensajes (persistidos), entrada, cargando, error, consultaFallida
 * @usadoPor   DashboardLayout
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import { useAsistenteHistorial } from "../../../hooks/useAsistenteHistorial";
import { conversarConAsistente } from "../../../services/asistenteServicio";

const SUGERENCIAS = [
  "¿Qué contactos tengo registrados?",
  "¿Qué correos están activos?",
  "¿Cuáles son mis grupos activos?",
  "¿Dónde veo mis tarjetas?",
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

export default function AsistenteAyuda({ abierto, alCerrar, triggerRef }) {
  const panelRef = useRef(null);
  const logRef = useRef(null);
  const peticionRef = useRef(null);
  const { mensajes, setMensajes, limpiar } = useAsistenteHistorial();
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
              <p className="text-xs text-slate-text">Consulta tus datos o pregunta sobre cómo usar la app.</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {mensajes.length > 0 && (
                <button
                  type="button"
                  onClick={limpiar}
                  disabled={cargando}
                  aria-label="Limpiar conversación"
                  title="Limpiar conversación"
                  className="rounded-full p-2 text-slate-text outline-none hover:bg-red-100 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-40"
                >
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              )}
              <BotonCerrar
                ariaLabel="Cerrar asistente de ayuda"
                alCerrar={alCerrar}
                className="text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
              />
            </div>
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
                  Pregunta por tus contactos, grupos, correos o tarjetas, o sobre cómo usar la app.
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
                      <p className="whitespace-pre-line leading-relaxed">{mensaje.contenido}</p>
                      {mensaje.aviso && <p className="mt-2 text-xs text-slate-text">{mensaje.aviso}</p>}
                    </div>
                  </div>
                ))}
                {cargando && <p role="status" className="text-sm text-slate-text">Preparando respuesta…</p>}
              </div>
            )}
          </div>

          <footer className="flex shrink-0 flex-col gap-2 border-t border-border-line/30 px-5 py-4">
            <p id="asistente-aviso" className="text-xs text-slate-text">
              Puedes preguntar por tus contactos, grupos, correos y tarjetas. El asistente conserva los últimos 20 mensajes para dar continuidad. No escribas contraseñas ni CVV.
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
                placeholder="Escribe una pregunta con el contexto que necesites…"
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
