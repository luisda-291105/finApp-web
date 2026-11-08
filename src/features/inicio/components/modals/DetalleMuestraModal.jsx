import { useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import MuestraVisual from "../cards/MuestraVisual";
import { FUENTES_DEMO, SEGMENTOS_CONTABLES, TIPOS_VISUALIZACION, TEXTO_SIN_DATOS, normalizarFuente, obtenerValorMuestra, formatearMonto } from "../../utils/inicioHelpers";

const opcionesTrampa = (panelRef) => ({
  allowOutsideClick: true,
  escapeDeactivates: false,
  initialFocus: () => panelRef.current,
  returnFocusOnDeactivate: false,
});

/** Modal de detalle, navegación a la fuente y acciones sobre una muestra. */
export default function DetalleMuestraModal({
  muestra, temaOscuro, triggerRef, confirmandoEliminacion, eliminando, error,
  alCerrar, alCrear, alEditar, alEliminar, alCancelarEliminacion, alIrAFuente,
}) {
  const panelRef = useRef(null);
  const abierto = Boolean(muestra);
  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });
  if (!muestra) return null;

  const fuenteDemo = FUENTES_DEMO.find((fuente) => fuente.valor === normalizarFuente(muestra.fuente));
  const etiquetaFuente = fuenteDemo?.etiqueta || muestra.fuente;
  const segmento = SEGMENTOS_CONTABLES.find((opcion) => opcion.valor === (muestra.segmentoContable || "todos"));
  const tipoDemo = TIPOS_VISUALIZACION.find((opcion) => opcion.valor === muestra.tipo);
  const etiquetaTipo = tipoDemo?.etiqueta || muestra.tipo;
  const valor = obtenerValorMuestra(muestra);
  const tipoValido = TIPOS_VISUALIZACION.some((opcion) => opcion.valor === muestra.tipo);
  const valorFormateado = valor && tipoValido ? formatearMonto(valor) : TEXTO_SIN_DATOS;
  const nombreFuente = `${etiquetaFuente}${segmento ? ` · ${segmento.etiqueta}` : ""}`;
  const focoTrap = { ...opcionesTrampa(panelRef), initialFocus: () => panelRef.current };
  const cerrarDesdeFondo = (evento) => { if (evento.target === evento.currentTarget) alCerrar(); };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-bg-dark/80 backdrop-blur-sm" onClick={cerrarDesdeFondo} aria-hidden="true" />
      <AnimatePresence>
        <FocusTrap focusTrapOptions={focoTrap}>
          <motion.div
            ref={panelRef}
            id="modal-detalle-muestra-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-detalle-muestra-titulo"
            tabIndex={-1}
            className="fixed left-1/2 top-1/2 z-60 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border-line/30 bg-bg-cream/95 outline-none glass-surface shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <header className="flex items-center justify-between border-b border-border-line/30 px-5 py-4">
              <h2 id="modal-detalle-muestra-titulo" className="font-display text-lg font-semibold text-bg-dark">Detalle de muestra</h2>
              <BotonCerrar ariaLabel="Cerrar detalle de muestra" alCerrar={alCerrar} className="text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark focus-visible:ring-emerald-primary" />
            </header>

            <div className="px-5 py-4">
              <section aria-label="Vista previa de la muestra" className="mb-5 overflow-hidden rounded-2xl border border-border-line/30 bg-bg-cream/75 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border-line/20 px-4 py-3">
                  <h3 className="font-display font-semibold text-bg-dark">{muestra.titulo}</h3>
                  <span className="shrink-0 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-medium text-slate-text">{etiquetaTipo}</span>
                </div>
                <div className="flex min-h-28 flex-col justify-center gap-2 px-4 py-4"><MuestraVisual muestra={muestra} temaOscuro={temaOscuro} /></div>
                <div className="grid grid-cols-2 gap-3 border-t border-border-line/20 px-4 py-3">
                  <div><p className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Fuente</p><p className="text-sm text-bg-dark">{nombreFuente}</p></div>
                  <div><p className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Valor</p><p className="text-sm text-bg-dark">{valorFormateado}</p></div>
                </div>
              </section>

              <dl className="mb-6 grid grid-cols-2 gap-x-5 gap-y-4">
                <div><dt className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Título</dt><dd className="mt-0.5 break-words text-sm text-bg-dark">{muestra.titulo}</dd></div>
                <div><dt className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Fuente</dt><dd className="mt-0.5 text-sm text-bg-dark">{nombreFuente}</dd></div>
                <div><dt className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Tipo</dt><dd className="mt-0.5 text-sm text-bg-dark">{etiquetaTipo}</dd></div>
                <div><dt className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Valor</dt><dd className="mt-0.5 text-sm text-bg-dark">{valorFormateado}</dd></div>
              </dl>

              <section aria-label="Ir a la fuente de la muestra" className={`mb-5 rounded-xl border border-border-line/40 p-4 ${temaOscuro ? "bg-bg-dark/60" : "bg-bg-cream/60"}`}>
                <p className="mb-2 text-sm text-slate-text">Continuar en {etiquetaFuente}</p>
                <button type="button" onClick={() => alIrAFuente(muestra.fuente)} className="w-full rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-mint-accent">Ir a la fuente</button>
              </section>

              {confirmandoEliminacion && <div role="alert" className="mb-4 rounded-xl border border-red-300/50 bg-red-50/60 p-3 text-sm text-bg-dark">¿Eliminar esta muestra? Esta acción no se puede deshacer.</div>}
              <div className="grid grid-cols-2 gap-2 border-t border-border-line/20 pt-4">
                <button type="button" onClick={alCrear} className="rounded-xl border border-border-line/40 px-3 py-2.5 text-sm font-medium text-bg-dark hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">Nueva muestra</button>
                <button type="button" onClick={alEditar} className="rounded-xl border border-border-line/40 px-3 py-2.5 text-sm font-medium text-bg-dark hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">Editar</button>
                <button type="button" onClick={alEliminar} disabled={eliminando} className="rounded-xl border border-red-300/60 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">{eliminando ? "Eliminando…" : confirmandoEliminacion ? "Confirmar eliminación" : "Eliminar"}</button>
                {confirmandoEliminacion && <button type="button" onClick={alCancelarEliminacion} className="rounded-xl border border-border-line/40 px-3 py-2.5 text-sm font-medium text-bg-dark hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">Cancelar</button>}
              </div>
              {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
            </div>
          </motion.div>
        </FocusTrap>
      </AnimatePresence>
    </>,
    document.body,
  );
}
