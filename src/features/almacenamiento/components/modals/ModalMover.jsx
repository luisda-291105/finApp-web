/**
 * @uso        Modal para seleccionar carpeta destino y mover/copiar elementos
 * @funciones  ModalMover({ abierto, ids, accion, carpetas, alCerrar, alConfirmar, cargando })
 * @datos      Recibe lista de carpetas candidatas y ids a operar
 * @eventos    Selección de destino y confirmación
 * @estados    destinoId
 * @usadoPor   AlmacenamientoPage
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";
import { Folder, MoveRight } from "lucide-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";

export default function ModalMover({
  abierto,
  ids = [],
  accion = "mover",
  carpetas = [],
  alCerrar,
  alConfirmar,
  cargando = false,
}) {
  const [destinoId, setDestinoId] = useState("root");

  useCierreConEsc({ activo: abierto, zIndex: 140, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef: null });

  useEffect(() => {
    if (abierto) setDestinoId("root");
  }, [abierto]);

  if (!abierto) return null;
  const titulo = accion === "copiar" ? "Copiar a" : "Mover a";

  return createPortal(
    <div
      className="modal-overlay-dashboard z-[100] flex items-end justify-center bg-bg-dark/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) alCerrar();
      }}
    >
      <FocusTrap
        focusTrapOptions={{
          allowOutsideClick: true,
          escapeDeactivates: false,
          returnFocusOnDeactivate: false,
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-mover-titulo"
          className="glass-surface modal-sheet-mobile mb-[var(--bottom-nav-alto)] max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] border border-border-line/30 bg-bg-cream/95 p-5 text-bg-dark shadow-2xl outline-none sm:mb-0 sm:rounded-3xl"
        >
          <header className="mb-4 flex items-start justify-between gap-4 border-b border-border-line/30 pb-4">
            <div>
              <h2
                id="modal-mover-titulo"
                className="font-display text-lg font-semibold"
              >
                {titulo}
              </h2>
              <p className="text-xs text-slate-text">
                {ids.length} elemento(s) seleccionado(s)
              </p>
            </div>
            <BotonCerrar
              ariaLabel={`Cerrar ${titulo.toLowerCase()}`}
              alCerrar={alCerrar}
            />
          </header>
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setDestinoId("root")}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${destinoId === "root" ? "bg-emerald-primary/10 text-emerald-primary" : "hover:bg-emerald-primary/5 text-bg-dark"}`}
            >
              <Folder className="h-4 w-4" aria-hidden="true" />
              Mi unidad
            </button>
            {carpetas
              .filter((c) => c.id && c.id !== "root" && !ids.includes(c.id))
              .map((carpeta) => (
                <button
                  key={carpeta.id}
                  type="button"
                  onClick={() => setDestinoId(carpeta.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${destinoId === carpeta.id ? "bg-emerald-primary/10 text-emerald-primary" : "hover:bg-emerald-primary/5 text-bg-dark"}`}
                >
                  <Folder className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate">{carpeta.nombre}</span>
                </button>
              ))}
          </div>
          <footer className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border-line/30 pt-4">
            <button
              type="button"
              onClick={alCerrar}
              className="inline-flex min-h-11 items-center rounded-xl border border-border-line/60 px-4 text-sm font-medium text-slate-text hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => alConfirmar?.(destinoId)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              <MoveRight className="h-4 w-4" aria-hidden="true" />
              {cargando ? "Procesando…" : "Confirmar"}
            </button>
          </footer>
        </section>
      </FocusTrap>
    </div>,
    document.body,
  );
}
