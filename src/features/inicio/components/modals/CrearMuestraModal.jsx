import { useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import CrearMuestraForm from "../forms/CrearMuestraForm";

const opcionesTrampa = (panelRef) => ({
  allowOutsideClick: true,
  escapeDeactivates: false,
  initialFocus: () => panelRef.current,
  returnFocusOnDeactivate: false,
});

/** Marco modal accesible para el formulario de creación/edición de muestras. */
export default function CrearMuestraModal({
  abierto, borrador, indiceEditando, guardando, error, triggerRef,
  cuentasCorreo, cargandoCuentasCorreo, errorCuentasCorreo,
  alCambiar, alGuardar, alCerrar,
}) {
  const panelRef = useRef(null);
  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });
  if (!abierto) return null;

  const cerrarDesdeFondo = (evento) => {
    if (evento.target === evento.currentTarget) alCerrar();
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-bg-dark/80 backdrop-blur-sm" onClick={cerrarDesdeFondo} aria-hidden="true" />
      <AnimatePresence>
        <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
          <motion.div
            ref={panelRef}
            id="modal-crear-muestra-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-crear-muestra-titulo"
            tabIndex={-1}
            className="fixed left-1/2 top-1/2 z-60 max-h-[85vh] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border-line/30 bg-bg-cream/95 outline-none glass-surface shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <header className="flex items-center justify-between border-b border-border-line/30 px-5 py-4">
              <h2 id="modal-crear-muestra-titulo" className="font-display text-lg font-semibold text-bg-dark">
                {indiceEditando === null ? "Crear muestra" : "Editar muestra"}
              </h2>
              <BotonCerrar ariaLabel={indiceEditando === null ? "Cerrar creación de muestra" : "Cerrar edición de muestra"} alCerrar={alCerrar} className="text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark focus-visible:ring-emerald-primary" />
            </header>

            <CrearMuestraForm borrador={borrador} indiceEditando={indiceEditando} guardando={guardando} error={error} cuentasCorreo={cuentasCorreo} cargandoCuentasCorreo={cargandoCuentasCorreo} errorCuentasCorreo={errorCuentasCorreo} alCambiar={alCambiar} alGuardar={alGuardar} />
          </motion.div>
        </FocusTrap>
      </AnimatePresence>
    </>,
    document.body,
  );
}
