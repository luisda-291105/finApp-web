/**
 * @uso        Lista de correos de la papelera de una cuenta con restaurar por fila
 * @funciones  ListaPapeleraCorreos({ seccion, restaurando, alRestaurar, alReintentar })
 * @datos      Correos de la papelera en vivo con fecha estimada de eliminación definitiva
 * @eventos    Restaurar una fila y reintentar la consulta cuando falla
 * @estados    Ninguno propio; el estado en curso llega por props
 * @usadoPor   PapeleraCorreosModal
 */
import { RotateCcw } from "lucide-react";
import { fechaLegible, separarRemitente } from "../../../utils/correoHelpers";

/** Presenta el estado de error, el estado vacío o las filas restaurables de una cuenta. */
export default function ListaPapeleraCorreos({
  seccion,
  restaurando = {},
  alRestaurar,
  alReintentar,
}) {
  if (seccion.error) {
    return (
      <div
        role="alert"
        className="space-y-2 rounded-2xl border border-red-300/70 bg-red-50 p-4 text-sm text-red-800"
      >
        <p>{seccion.error}</p>
        <button
          type="button"
          onClick={() => alReintentar?.(seccion.cuentaId)}
          className="inline-flex min-h-10 items-center rounded-lg border border-red-400 px-4 text-sm font-medium text-red-800"
        >
          Reintentar
        </button>
      </div>
    );
  }
  if (seccion.correos.length === 0) {
    return (
      <p className="rounded-2xl border border-border-line/50 bg-bg-cream/70 p-4 text-sm text-slate-text">
        No hay correos en la papelera de {seccion.email || "esta cuenta"}.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="rounded-xl border border-border-line/40 bg-bg-cream/70 px-3 py-2 text-xs text-slate-text">
        Gmail elimina definitivamente los correos de la papelera después de unos
        30 días desde que se movieron.
      </p>
      <ul className="grid min-w-0 gap-3">
        {seccion.correos.map((correo) => {
          const enCurso = Boolean(
            restaurando[`${seccion.cuentaId}:${correo.mensajeId}`],
          );
          const remitente = separarRemitente(correo.remitente);
          return (
            <li
              key={correo.mensajeId}
              className="min-w-0 space-y-2 rounded-2xl border border-border-line/70 bg-white p-4 shadow-sm"
            >
              <h4 className="min-w-0 break-words text-sm font-semibold text-bg-dark">
                {correo.asunto}
              </h4>
              <p className="min-w-0 break-words text-xs text-slate-text">
                {remitente.email
                  ? `${remitente.nombre} · ${remitente.email}`
                  : remitente.nombre}
              </p>
              {correo.fecha && (
                <time
                  dateTime={correo.fecha}
                  className="block text-xs text-slate-text"
                >
                  {fechaLegible(correo.fecha)}
                </time>
              )}
              {correo.movidoAutomaticamente && (
                <p className="inline-flex rounded-full bg-emerald-primary/10 px-2 py-0.5 text-xs font-medium text-emerald-primary">
                  Movido automáticamente
                  {correo.motivoAutomatico
                    ? ` · ${correo.motivoAutomatico}`
                    : ""}
                </p>
              )}
              {correo.eliminacionEstimadaEn && (
                <p className="text-xs text-amber-700">
                  Se eliminará definitivamente el{" "}
                  {fechaLegible(correo.eliminacionEstimadaEn)}.
                </p>
              )}
              <div className="flex justify-end border-t border-border-line/40 pt-2">
                <button
                  type="button"
                  title={`Restaurar ${correo.asunto}`}
                  onClick={() => alRestaurar?.(correo)}
                  disabled={enCurso}
                  aria-busy={enCurso}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-primary/40 px-3 text-xs font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary hover:text-bg-cream disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                  {enCurso ? "Restaurando..." : "Restaurar"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
