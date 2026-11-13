/**
 * @uso        Modal de previsualización de archivo del feature almacenamiento
 * @funciones  ModalPrevisualizacion({ abierto, item, alCerrar })
 * @datos      item ({ nombre, tipo, mime, tamanio, fechaModificacion }) o null
 * @eventos    Cierre con Escape, botón «X», clic exterior; acción de descarga desde el modal
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";
import { Download } from "lucide-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import AlmacenamientoArchivoIcono from "./AlmacenamientoArchivoIcono";

/**
 * ModalPrevisualizacion
 * Previsualiza un archivo seleccionado: muestra icono, metadatos y permite descargarlo.
 * @param {Object} props
 * @param {boolean} props.abierto - Control de visibilidad
 * @param {Object | null} props.item - Item del gestor a previsualizar
 * @param {() => void} props.alCerrar - Callback de cierre
 * @returns {JSX.Element | null}
 */
export default function ModalPrevisualizacion({ abierto, item, alCerrar }) {
  const panelRef = useRef(null);

  useCierreConEsc({ activo: abierto, zIndex: 130, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef: null });

  useEffect(() => {
    if (abierto) panelRef.current?.focus();
  }, [abierto]);

  if (!abierto || !item) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-bg-dark/70 p-3 backdrop-blur-sm"
      onClick={(evento) => { if (evento.target === evento.currentTarget) alCerrar(); }}
    >
      <FocusTrap
        focusTrapOptions={{
          allowOutsideClick: true,
          escapeDeactivates: false,
          initialFocus: () => panelRef.current,
          returnFocusOnDeactivate: false,
        }}
      >
        <section
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-previsualizacion-titulo"
          aria-describedby="modal-previsualizacion-descripcion"
          tabIndex={-1}
          className="glass-surface relative w-full max-w-md rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-2xl outline-none"
        >
          <header className="mb-4 flex items-start justify-between gap-4 border-b border-border-line/30 pb-4">
            <div className="min-w-0">
              <h2 id="modal-previsualizacion-titulo" className="truncate font-display text-lg font-semibold">{item.nombre}</h2>
              <p id="modal-previsualizacion-descripcion" className="text-xs text-slate-text">{item.mime || "Archivo"} · {item.tamanio ? `${Math.round(item.tamanio / 1024)} KB` : ""}</p>
            </div>
            <BotonCerrar ariaLabel="Cerrar previsualización" alCerrar={alCerrar} className="text-slate-text hover:text-bg-dark" />
          </header>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlmacenamientoArchivoIcono item={item} className="h-16 w-16" />
            <p className="text-sm text-slate-text">Vista previa no disponible para este tipo de archivo en la demo.</p>
            <button
              type="button"
              onClick={() => alCerrar()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Descargar
            </button>
          </div>
        </section>
      </FocusTrap>
    </div>,
    document.body
  );
}
