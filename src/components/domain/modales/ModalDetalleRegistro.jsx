/**
 * @uso        Contenedor accesible compartido para detalles de registros
 * @funciones  ModalDetalleRegistro({ abierto, titulo, alCerrar, triggerRef, children })
 * @datos      Recibe el contenido de detalle de cada módulo sin modificarlo
 * @eventos    Cierre con Escape, botón o clic en el fondo; devuelve el foco al disparador
 * @estados    Ninguno; la apertura es controlada por el módulo consumidor
 * @usadoPor   Detalles de correo, grupo, tarjeta y perfil
 */
import { useEffect, useRef } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";

/** Contenedor común para los modales de lectura de registros. */
export default function ModalDetalleRegistro({ abierto, titulo, alCerrar, triggerRef, children, ancho = "max-w-2xl", etiquetaCerrar }) {
  const panelRef = useRef(null);
  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });
  useEffect(() => { if (abierto) panelRef.current?.focus(); }, [abierto]);
  if (!abierto) return null;
  const cerrarDesdeFondo = (evento) => { if (evento.target === evento.currentTarget) alCerrar(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/70 p-3 sm:p-5" onMouseDown={cerrarDesdeFondo}>
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: false, initialFocus: () => panelRef.current, returnFocusOnDeactivate: false }}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="detalle-registro-titulo" tabIndex={-1} className={`glass-surface relative max-h-[90vh] w-full ${ancho} overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-5 text-bg-dark shadow-xl outline-none sm:p-7`}>
          <header className="mb-5 flex items-start justify-between gap-4 border-b border-border-line/30 pb-4"><h2 id="detalle-registro-titulo" className="font-display text-xl font-semibold">{titulo}</h2><BotonCerrar ariaLabel={etiquetaCerrar || `Cerrar ${titulo}`} alCerrar={alCerrar} /></header>
          {children}
        </section>
      </FocusTrap>
    </div>
  );
}
