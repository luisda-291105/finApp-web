/**
 * @uso        Lista de correos de la papelera de una cuenta con restaurar por fila
 * @funciones  ListaPapeleraCorreos({ seccion, restaurando, alRestaurar, alReintentar })
 * @datos      Correos de la papelera en vivo; cada fila muestra el remitente arriba
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
    <ul
      aria-label="Correos en la papelera"
      className="divide-y divide-border-line/40 overflow-hidden rounded-2xl border border-border-line/50 bg-white shadow-sm"
    >
      {seccion.correos.map((correo) => {
        const enCurso = Boolean(
          restaurando[`${seccion.cuentaId}:${correo.mensajeId}`],
        );
        const remitente = separarRemitente(correo.remitente);
        return (
          <li
            key={correo.mensajeId}
            className="flex min-w-0 items-center gap-2 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-text">
                {remitente.email
                  ? `${remitente.nombre} · ${remitente.email}`
                  : remitente.nombre}
              </p>
              <h4 className="mt-0.5 break-words text-sm font-semibold text-bg-dark">
                {correo.asunto}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-text">
                {correo.fecha && (
                  <time dateTime={correo.fecha}>
                    {fechaLegible(correo.fecha)}
                  </time>
                )}
                {correo.movidoAutomaticamente && (
                  <span className="inline-flex rounded-full bg-emerald-primary/10 px-2 py-0.5 font-medium text-emerald-primary">
                    Movido automáticamente
                    {correo.motivoAutomatico
                      ? ` · ${correo.motivoAutomatico}`
                      : ""}
                  </span>
                )}
                {correo.eliminacionEstimadaEn && (
                  <span className="text-amber-700">
                    Se eliminará el {fechaLegible(correo.eliminacionEstimadaEn)}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              title={`Restaurar ${correo.asunto}`}
              onClick={() => alRestaurar?.(correo)}
              disabled={enCurso}
              aria-busy={enCurso}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 self-center rounded-lg border border-emerald-primary/40 px-2.5 text-xs font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary hover:text-bg-cream disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {enCurso ? "Restaurando..." : "Restaurar"}
              </span>
            </button>
          </li>
        );
      })}
      <li className="border-t-0 bg-bg-cream/40 px-4 py-2 text-[11px] text-slate-text">
        Gmail elimina definitivamente los correos de la papelera después de
        unos 30 días desde que se movieron.
      </li>
    </ul>
  );
}
