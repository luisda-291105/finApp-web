/**
 * @uso        Modal de demostración para reunir correo y teléfono sin enviar ni guardar datos
 * @funciones  ModalFuentes({ abierto, alCerrar, triggerRef })
 * @datos      Recibe visibilidad, cierre y ref opcional del disparador; los campos son estado efímero
 * @eventos    Botón de cierre, clic exterior y Escape → alCerrar; el botón demo no ejecuta acciones
 * @estados    correo y telefono (estado local, descartado al cerrar o desmontar)
 * @usadoPor   PaginaDashboardConfiguracion
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";

const TITULO = "Registro de fuentes";
const NOTA_DEMO =
  "Reúne información relacionada con conectar correos y registrar números telefónicos. Esta demostración no envía ni guarda los datos.";

/**
 * Opciones de la trampa de foco existentes en las superficies modales del proyecto.
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
 * ModalFuentes
 * - Expone un diálogo modal accesible con campos de texto temporales para correo y teléfono.
 * - El botón de demostración es deliberadamente inerte: no envía datos ni confirma operaciones.
 * - Cerrar limpia los valores; desmontar el componente descarta todo su estado.
 *
 * @param {Object} props
 * @param {boolean} props.abierto - Controla la visibilidad del diálogo.
 * @param {() => void} props.alCerrar - Notifica el cierre al componente que controla su montaje.
 * @param {React.RefObject<HTMLElement>} [props.triggerRef] - Disparador al que devolver el foco.
 * @returns {JSX.Element | null} Diálogo abierto o `null` cuando está cerrado.
 */
export default function ModalFuentes({ abierto, alCerrar, triggerRef }) {
  const panelRef = useRef(null);
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  const cerrar = () => {
    setCorreo("");
    setTelefono("");
    alCerrar();
  };

  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar: cerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  useEffect(() => {
    if (!abierto) {
      setCorreo("");
      setTelefono("");
    }
  }, [abierto]);

  if (!abierto) return null;

  const manejarClicExterior = (evento) => {
    if (evento.target === evento.currentTarget) {
      cerrar();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/70"
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
            <div className="flex flex-col gap-2">
              <h2
                id="fuentes-titulo"
                className="font-display text-lg font-semibold text-bg-dark"
              >
                {TITULO}
              </h2>
              <span className="self-start rounded-full bg-emerald-primary px-2.5 py-1 text-xs font-medium text-bg-cream">
                Demostración
              </span>
              <p id="fuentes-descripcion" className="text-sm text-slate-text">
                {NOTA_DEMO}
              </p>
            </div>
            <BotonCerrar
              ariaLabel="Cerrar registro de fuentes"
              alCerrar={cerrar}
              className="shrink-0 text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
            />
          </header>

          <div className="flex flex-col gap-4 px-5 py-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fuentes-correo" className="text-sm font-medium text-bg-dark">
                Correo electrónico
              </label>
              <input
                id="fuentes-correo"
                type="text"
                value={correo}
                onChange={(evento) => setCorreo(evento.target.value)}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fuentes-telefono" className="text-sm font-medium text-bg-dark">
                Teléfono
              </label>
              <input
                id="fuentes-telefono"
                type="text"
                value={telefono}
                onChange={(evento) => setTelefono(evento.target.value)}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              />
            </div>

            <button
              type="button"
              className="self-start rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2"
            >
              Botón de demostración
            </button>
          </div>
        </section>
      </FocusTrap>
    </div>
  );
}
