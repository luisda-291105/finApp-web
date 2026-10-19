/**
 * @uso        Superficie modal de diseño del asistente de ayuda de la landing (solo diseño, spec 014)
 * @funciones  AsistenteAyuda({ abierto, estadoVisual, alCerrar, triggerRef })
 * @datos      Literales fijos de la spec 014 §4.3 y la conversación de muestra (estática); sin datos externos
 * @eventos    Sin eventos propios de lógica; cierra por «X», Esc, clic fuera y deslizar (cromo 010/011)
 * @estados    Ninguno propio: `estadoVisual` es una prop presentacional ('vacio' | 'conversacion')
 * @usadoPor   PaginaInicio
 */
import { useRef } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";

const TITULO = "Asistente de ayuda";
const MARCA_DEMO = "Demostración · No es una IA real";
const NOTA_DISENO = "Vista de diseño: contenido de ejemplo; aún no responde preguntas.";
const TEXTO_VACIO =
  "Aún no hay mensajes. Cuando la ayuda esté activa, podrás elegir una sugerencia o escribir una pregunta.";
const SUGERENCIAS = [
  "¿Cómo entro al panel?",
  "¿Dónde veo mis tarjetas?",
  "¿Se guardan mis datos?",
  "¿Cómo salgo del demo?",
];
const TEXTO_EJEMPLO = "Conversación de ejemplo";
const CONVERSACION = [
  { remitente: "tu", texto: "¿Cómo entro al panel?" },
  {
    remitente: "asistente",
    texto:
      "En esta demo el panel se abre directamente desde la portada. Dentro, la barra lateral te permite ir a Inicio, Transacciones y Tarjetas.",
  },
  { remitente: "tu", texto: "¿Se guardan mis datos?" },
  {
    remitente: "asistente",
    texto:
      "Esta es una demostración: no hay backend ni datos financieros reales. Las cifras y las tarjetas que ves son de ejemplo.",
  },
];
const ARIA_CERRAR = "Cerrar asistente de ayuda";
const ARIA_LOG = "Mensajes del asistente";
const AVISO_RESERVA =
  "Cuando la ayuda esté activa, si tu pregunta no coincide verás una respuesta de reserva.";
const LABEL_ENTRADA = "Tu pregunta";
const PLACEHOLDER = "Escribe una pregunta…";
const BOTON_ENVIAR = "Enviar";

/**
 * Opciones REALES de `focus-trap` (spec 010 §2.2; mismo patrón que `AuthModal.jsx:29-36`).
 * `allowOutsideClick: true` hace efectivo el clic exterior (la trampa no cancela ni consume el
 * evento) SIN desactivarse; `escapeDeactivates: false` deja Esc al único manejador común
 * (`useCierreConEsc`); el foco inicial va al contenedor del diálogo y el retorno de foco es manual
 * (`returnFocusOnDeactivate: false`, lo gobierna `useRetornoDeFoco`).
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
 * AsistenteAyuda
 * - Solo diseño (spec 014): no hay motor, guion, estado de conversación ni red. `abierto` es el
 *   único control; `estadoVisual` ('vacio' por defecto | 'conversacion') es presentacional.
 * - `abierto === false` → no renderiza nada (mismo patrón que `AuthModal`).
 * - Accesibilidad: `role="dialog"` + `aria-modal` en el panel, nombre accesible por
 *   `aria-labelledby="asistente-titulo"` y descripción por
 *   `aria-describedby="asistente-marca asistente-nota asistente-reserva"`; foco inicial en el
 *   contenedor del diálogo (`tabIndex={-1}`, fuera del ciclo de Tab).
 * - El scrim NO lleva `backdrop-filter` (no cuenta como superficie Fluid Glass; spec 014 DP-10) y no
 *   se marca `aria-hidden` porque contiene al diálogo.
 * - Único color por tokens de `src/styles/index.css`; sin hexadecimales nuevos.
 * @param {Object} props
 * @param {boolean} props.abierto - Control de visibilidad
 * @param {'vacio' | 'conversacion'} [props.estadoVisual] - Variante estática de diseño
 * @param {() => void} props.alCerrar - Callback de cierre
 * @param {React.RefObject<HTMLElement>} [props.triggerRef] - Disparador al que devolver el foco
 * @returns {JSX.Element | null} Superficie modal o `null` si está cerrada
 */
export default function AsistenteAyuda({ abierto, estadoVisual = "vacio", alCerrar, triggerRef }) {
  const panelRef = useRef(null);

  // Cromo congelado de 010/011, registrado antes del retorno condicional (regla de hooks).
  // Esc: capa del panel (z-60); gesto: solo móvil y sobre el panel; foco: transición abierta → cerrada.
  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  if (!abierto) return null;

  const manejarClicExterior = (evento) => {
    // Solo cierra si el clic cae directamente en la capa exterior (no en el panel)
    if (evento.target === evento.currentTarget) {
      alCerrar();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/70"
      onClick={manejarClicExterior}
    >
      <FocusTrap focusTrapOptions={crearOpcionesTrampa(panelRef)}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="asistente-titulo"
          aria-describedby="asistente-marca asistente-nota asistente-reserva"
          tabIndex={-1}
          className="relative z-60 w-[90vw] max-w-md max-h-[85vh] overflow-hidden outline-none bg-bg-cream/95 glass-surface border border-border-line/30 rounded-3xl shadow-xl flex flex-col"
        >
          {/* Cabecera fija, fuera del área scrolleable (marca y nota siempre visibles) */}
          <header className="shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-border-line/30">
            <div className="flex flex-col gap-1.5">
              <h2
                id="asistente-titulo"
                className="font-display text-lg font-semibold text-bg-dark"
              >
                {TITULO}
              </h2>
              <span
                id="asistente-marca"
                className="self-start rounded-full bg-emerald-primary px-2.5 py-1 text-xs font-medium text-bg-cream"
              >
                {MARCA_DEMO}
              </span>
              <p id="asistente-nota" className="text-xs text-slate-text">
                {NOTA_DISENO}
              </p>
            </div>
            <BotonCerrar
              ariaLabel={ARIA_CERRAR}
              alCerrar={alCerrar}
              className="shrink-0 text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
            />
          </header>
          {/* Único scroll: el panel es overflow-hidden y solo este body scrollea (DP-06) */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {estadoVisual === "vacio" && (
              <>
                <p className="text-sm text-slate-text">{TEXTO_VACIO}</p>
                <div className="flex flex-wrap gap-2">
                  {SUGERENCIAS.map((sugerencia) => (
                    <button
                      key={sugerencia}
                      type="button"
                      aria-disabled="true"
                      className="rounded-full border border-border-line/60 bg-bg-cream px-3 py-1.5 text-left text-xs text-bg-dark"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </>
            )}
            {estadoVisual === "conversacion" && (
              <p className="text-xs font-medium uppercase tracking-wider text-slate-text">
                {TEXTO_EJEMPLO}
              </p>
            )}
            {/* Log solo de mensajes: fuera quedan el aviso y las sugerencias (RF-08) */}
            <div
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-atomic="false"
              aria-label={ARIA_LOG}
              className="flex flex-col gap-3"
            >
              {estadoVisual === "conversacion" &&
                CONVERSACION.map(({ remitente, texto }, indice) => (
                  <div
                    key={indice}
                    className={remitente === "tu" ? "flex justify-end" : "flex justify-start"}
                  >
                    <p
                      className={
                        remitente === "tu"
                          ? "max-w-[85%] rounded-2xl rounded-br-md bg-emerald-primary px-3.5 py-2.5 text-sm text-bg-cream"
                          : "max-w-[85%] rounded-2xl rounded-bl-md border border-border-line/40 bg-bg-cream px-3.5 py-2.5 text-sm text-bg-dark"
                      }
                    >
                      <span className="sr-only">
                        {remitente === "tu" ? "Tú" : "Asistente"}
                      </span>{" "}
                      {texto}
                    </p>
                  </div>
                ))}
            </div>
          </div>
          {/* Pie fijo, fuera del área scrolleable: aviso, campo y «Enviar» (T5) */}
          <footer className="shrink-0 px-5 py-4 border-t border-border-line/30 flex flex-col gap-2">
            <p id="asistente-reserva" className="text-xs text-slate-text">
              {AVISO_RESERVA}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="asistente-entrada" className="sr-only">
                {LABEL_ENTRADA}
              </label>
              {/* Campo no controlado: editable solo para foco y teclado, sin estado ni envío */}
              <input
                id="asistente-entrada"
                type="text"
                placeholder={PLACEHOLDER}
                className="min-w-0 flex-1 rounded-xl border border-border-line/60 bg-bg-cream px-3 py-2 text-sm text-bg-dark placeholder:text-slate-text outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              />
              <button
                type="button"
                aria-disabled="true"
                className="shrink-0 rounded-xl bg-emerald-primary px-4 py-2 text-sm font-medium text-bg-cream"
              >
                {BOTON_ENVIAR}
              </button>
            </div>
          </footer>
        </div>
      </FocusTrap>
    </div>
  );
}
