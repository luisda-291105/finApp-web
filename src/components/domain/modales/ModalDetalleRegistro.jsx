/**
 * @uso        Contenedor accesible compartido para detalles de registros
 * @funciones  ModalDetalleRegistro({ abierto, titulo, alCerrar, triggerRef, children })
 * @datos      Recibe el contenido de detalle de cada módulo sin modificarlo
 * @eventos    Cierre con Escape, botón, clic en el fondo o gesto de deslizar en móvil; devuelve el foco al disparador
 * @estados    Ninguno; la apertura es controlada por el módulo consumidor
 * @usadoPor   Detalles de correo, grupo, tarjeta, perfil y suscripciones
 */
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";

/** Contenedor común para los modales de lectura de registros. Se monta via portal en document.body
 *  para que el overlay `fixed inset-0` quede relativo al viewport (sin ancestros con transform). */
export default function ModalDetalleRegistro({ abierto, titulo, alCerrar, triggerRef, children, ancho = "max-w-2xl", etiquetaCerrar, icono: Icono }) {
  const panelRef = useRef(null);
  const idTitulo = useId();
  useCierreConEsc({ activo: abierto, zIndex: 80, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });
  useEffect(() => { if (abierto) panelRef.current?.focus(); }, [abierto]);
  if (!abierto) return null;
  const cerrarDesdeFondo = (evento) => { if (evento.target === evento.currentTarget) alCerrar(); };
  // El overlay se monta vía portal en document.body. En el dashboard queda encuadrada al contenido
  // (usa --dashboard-sidebar-width), sin cubrir la navegación lateral; en el resto del sitio ocupa el viewport.
  return createPortal(
    <div
      className="modal-overlay-dashboard z-[100] flex items-end justify-center bg-bg-dark/70 p-0 transition-[left] duration-300 sm:items-center sm:p-5"
      onClick={cerrarDesdeFondo}
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
          aria-labelledby={idTitulo}
          tabIndex={-1}
          className={`glass-surface modal-sheet-mobile relative max-h-[85dvh] w-full ${ancho} overflow-y-auto rounded-t-[1.75rem] border border-border-line/30 bg-bg-cream/95 p-5 mb-[var(--bottom-nav-alto)] text-bg-dark shadow-xl outline-none sm:mb-0 sm:max-h-[90vh] sm:rounded-3xl sm:p-7 sm:pb-7`}
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border-line/60 sm:hidden" aria-hidden="true" />
          <header className="mb-5 flex items-start justify-between gap-4 border-b border-border-line/30 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              {Icono && (
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary"
                >
                  <Icono className="h-5 w-5" />
                </span>
              )}
              <h2 id={idTitulo} className="font-display text-xl font-semibold">
                {titulo}
              </h2>
            </div>
            <BotonCerrar ariaLabel={etiquetaCerrar || `Cerrar ${titulo}`} alCerrar={alCerrar} />
          </header>
          {children}
        </section>
      </FocusTrap>
    </div>,
    document.body,
  );
}
