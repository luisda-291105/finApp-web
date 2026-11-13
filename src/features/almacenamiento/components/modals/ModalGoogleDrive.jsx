/**
 * @uso        Modal con acceso directo e información para ir a Google Drive
 * @funciones  ModalGoogleDrive({ abierto, alCerrar, cuenta, triggerRef })
 * @datos      cuenta (opcional: { etiquetaCuenta, identificadorExterno, estado })
 * @eventos    Cierre con Escape, botón «X», clic exterior; botón «Ir a Google Drive» abre en nueva pestaña
 * @estados    Ninguno
 * @usadoPor   CuentasAlmacenamientoCard
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";
import { CheckCircle2, ExternalLink, HardDrive } from "lucide-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";

export default function ModalGoogleDrive({
  abierto,
  alCerrar,
  cuenta = null,
  triggerRef = null,
}) {
  const panelRef = useRef(null);

  useCierreConEsc({ activo: abierto, zIndex: 80, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  useEffect(() => {
    if (abierto) panelRef.current?.focus();
  }, [abierto]);

  if (!abierto) return null;

  const cerrarDesdeFondo = (evento) => {
    if (evento.target === evento.currentTarget) alCerrar();
  };

  const correoCuenta = cuenta?.etiquetaCuenta || cuenta?.identificadorExterno || "";
  const urlDrive = correoCuenta
    ? `https://drive.google.com/drive/u/${encodeURIComponent(correoCuenta)}`
    : "https://drive.google.com";

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-bg-dark/70 p-3 sm:p-5"
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
          aria-labelledby="modal-google-drive-titulo"
          aria-describedby="modal-google-drive-descripcion"
          tabIndex={-1}
          className="glass-surface relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-5 text-bg-dark shadow-xl outline-none sm:p-7"
        >
          {/* Encabezado */}
          <header className="mb-5 flex items-start justify-between gap-4 border-b border-border-line/30 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-primary/10 text-emerald-primary"
              >
                <svg
                  className="h-6 w-6 shrink-0"
                  viewBox="0 0 87.3 78"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                    fill="#0066da"
                  />
                  <path
                    d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a8.9 8.9 0 0 0 -1.2 4.5h27.5z"
                    fill="#00ac47"
                  />
                  <path
                    d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                    fill="#ea4335"
                  />
                  <path
                    d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                    fill="#00832d"
                  />
                  <path
                    d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                    fill="#2684fc"
                  />
                  <path
                    d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                    fill="#ffba00"
                  />
                </svg>
              </span>
              <div>
                <h2
                  id="modal-google-drive-titulo"
                  className="font-display text-xl font-semibold text-bg-dark"
                >
                  Google Drive
                </h2>
                <p className="text-xs text-slate-text">Almacenamiento en la nube</p>
              </div>
            </div>
            <BotonCerrar
              ariaLabel="Cerrar ventana de Google Drive"
              alCerrar={alCerrar}
            />
          </header>

          {/* Cuerpo informativo */}
          <div className="space-y-4">
            <p
              id="modal-google-drive-descripcion"
              className="text-sm leading-relaxed text-slate-text"
            >
              Accede a tus hojas de cálculo, respaldos y documentos financieros
              directamente desde tu unidad en la nube.
            </p>

            {correoCuenta ? (
              <div className="rounded-2xl border border-border-line/40 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-text">Cuenta vinculada</p>
                    <p className="truncate font-semibold text-bg-dark">{correoCuenta}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Conectada
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border-line/40 bg-white/70 p-4">
                <div className="flex items-center gap-3 text-slate-text">
                  <HardDrive className="h-5 w-5 shrink-0 text-emerald-primary" aria-hidden="true" />
                  <p className="text-xs">
                    Se abrirá la aplicación web de Google Drive en una nueva pestaña.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          <footer className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={alCerrar}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-line/60 px-4 py-2.5 text-sm font-medium text-slate-text transition-colors hover:bg-slate-100 hover:text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
            >
              Cerrar
            </button>
            <a
              href={urlDrive}
              target="_blank"
              rel="noopener noreferrer"
              onClick={alCerrar}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span>Ir a Google Drive</span>
            </a>
          </footer>
        </section>
      </FocusTrap>
    </div>,
    document.body
  );
}
