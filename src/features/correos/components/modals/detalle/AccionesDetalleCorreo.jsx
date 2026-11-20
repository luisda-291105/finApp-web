/**
 * @uso        Acciones del detalle de un correo (volver, abrir en Gmail y mover a la papelera)
 * @funciones  AccionesDetalleCorreo({ idCorreo, cuentaId, alCerrar, alMover, alAutorizarPermiso })
 * @datos      Identificador y cuenta del correo mostrado; no muta los mensajes directamente
 * @eventos    Mover a la papelera (única vía manual), autorizar el permiso ampliado y cerrar el detalle
 * @estados    moviendo, error, requierePermiso y autorizando
 * @usadoPor   DetalleCorreoModal
 */
import { useState } from "react";
import { Trash2 } from "lucide-react";

/** Ofrece las acciones de lectura y la de mover a la papelera con su permiso ampliado. */
export default function AccionesDetalleCorreo({
  idCorreo,
  cuentaId,
  alCerrar,
  alMover,
  alAutorizarPermiso,
}) {
  const [moviendo, setMoviendo] = useState(false);
  const [error, setError] = useState("");
  const [requierePermiso, setRequierePermiso] = useState(false);
  const [autorizando, setAutorizando] = useState(false);

  const mover = async () => {
    if (!alMover || moviendo) return;
    setMoviendo(true);
    setError("");
    setRequierePermiso(false);
    try {
      await alMover({ id: idCorreo, cuentaId });
      alCerrar?.();
    } catch (fallo) {
      if (fallo?.requires_scope_authorization) {
        // RF-23: el permiso ampliado se pide con una acción explícita.
        setRequierePermiso(true);
        setError(
          fallo?.message ||
            "Falta el permiso para modificar tus correos en esa cuenta.",
        );
      } else {
        setError(fallo?.message || "No se pudo mover el correo a la papelera.");
      }
    } finally {
      setMoviendo(false);
    }
  };

  const autorizar = async () => {
    if (!alAutorizarPermiso || autorizando) return;
    setAutorizando(true);
    setError("");
    try {
      await alAutorizarPermiso(cuentaId);
      setRequierePermiso(false);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo autorizar el permiso.");
    } finally {
      setAutorizando(false);
    }
  };

  return (
    <div className="space-y-3 pt-0.5 sm:pt-1">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        <button
          type="button"
          onClick={alCerrar}
          className="flex min-h-11 min-w-0 items-center justify-center rounded-lg border border-border-line px-1.5 py-2 text-center text-[11px] font-medium leading-tight text-slate-text hover:bg-bg-cream sm:px-2 sm:text-sm"
        >
          Volver a los correos
        </button>
        <a
          href={`https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(idCorreo)}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 min-w-0 items-center justify-center rounded-lg bg-emerald-primary px-1.5 py-2 text-center text-[11px] font-medium leading-tight text-bg-cream hover:bg-emerald-hover sm:px-2 sm:text-sm"
        >
          Abrir correo en Gmail
        </a>
      </div>
      {alMover && (
        <button
          type="button"
          onClick={mover}
          disabled={moviendo}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          {moviendo ? "Moviendo..." : "Mover a la papelera"}
        </button>
      )}
      {requierePermiso ? (
        <div
          role="status"
          className="space-y-2 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={autorizar}
            disabled={autorizando}
            className="inline-flex min-h-10 items-center rounded-lg bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {autorizando ? "Autorizando..." : "Autorizar permiso"}
          </button>
        </div>
      ) : error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-300/70 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
