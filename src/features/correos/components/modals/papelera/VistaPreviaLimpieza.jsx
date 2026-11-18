/**
 * @uso        Vista previa y confirmación de la limpieza explícita de correos ya recibidos
 * @funciones  VistaPreviaLimpieza({ configuracion, vistaPrevia, generando, limpiando, desactualizada, lote, alGenerarVistaPrevia, alConfirmarLimpieza, alRefrescarLote })
 * @datos      Conteo estimado, muestra de remitentes por categoría, excluidos por motivo y estado del lote
 * @eventos    Generar la vista previa, confirmar y ejecutar la limpieza y refrescar el lote
 * @estados    confirmado (casilla de confirmación obligatoria) local
 * @usadoPor   PapeleraCorreosModal
 */
import { useEffect, useState } from "react";
import { ListChecks, Play } from "lucide-react";
import {
  MOTIVOS_EXCLUSION,
  etiquetaCategoriaPapelera,
} from "../../../services/papeleraService";

/** Presenta el conteo, los remitentes y los excluidos, y exige confirmar antes de limpiar. */
export default function VistaPreviaLimpieza({
  configuracion = null,
  vistaPrevia = null,
  generando = false,
  limpiando = false,
  desactualizada = false,
  lote = null,
  alGenerarVistaPrevia,
  alConfirmarLimpieza,
  alRefrescarLote,
}) {
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    setConfirmado(false);
  }, [vistaPrevia]);

  const categoriasActivas = (configuracion?.categorias || [])
    .filter((categoria) => categoria.activa)
    .map((categoria) => categoria.categoria);
  const antiguedadMinimaDias = configuracion?.antiguedadMinimaDias ?? 0;

  return (
    <div className="space-y-3 rounded-2xl border border-border-line/50 bg-bg-cream/70 p-4">
      <h4 className="font-display text-sm font-semibold text-bg-dark">
        Limpieza de correos ya recibidos
      </h4>
      <p className="text-xs text-slate-text">
        La limpieza es una acción aparte de la activación y exige una vista
        previa y tu confirmación antes de mover nada.
      </p>

      <button
        type="button"
        onClick={() =>
          alGenerarVistaPrevia?.({ categorias: categoriasActivas, antiguedadMinimaDias })
        }
        disabled={generando || categoriasActivas.length === 0}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border-line bg-bg-cream px-4 py-2 text-sm font-medium text-bg-dark transition-colors hover:border-emerald-primary/50 hover:text-emerald-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ListChecks className="h-4 w-4" aria-hidden="true" />
        {generando ? "Calculando..." : "Generar vista previa"}
      </button>

      {desactualizada && (
        <p role="status" className="text-xs text-amber-900">
          El conteo cambió desde la vista previa. Genera una nueva y confirma de
          nuevo.
        </p>
      )}

      {vistaPrevia && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-bg-dark">
            Se moverían {vistaPrevia.totalEstimado} correo(s)
          </p>

          {vistaPrevia.porCategoria.length > 0 && (
            <ul className="space-y-1">
              {vistaPrevia.porCategoria.map((categoria) => (
                <li key={categoria.categoria} className="text-xs text-slate-text">
                  <p className="font-medium text-bg-dark">
                    {etiquetaCategoriaPapelera(categoria.categoria)}:{" "}
                    {categoria.cantidad}
                  </p>
                  {categoria.remitentes.length > 0 && (
                    <ul className="ml-3 list-disc">
                      {categoria.remitentes.map((remitente) => (
                        <li key={`${categoria.categoria}-${remitente.remitente}`}>
                          {remitente.remitente} ({remitente.cantidad})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}

          {vistaPrevia.excluidosPorMotivo.length > 0 && (
            <div>
              <p className="text-xs font-medium text-bg-dark">
                Excluidos por motivo
              </p>
              <ul className="ml-3 list-disc text-xs text-slate-text">
                {vistaPrevia.excluidosPorMotivo.map((excluido) => (
                  <li key={excluido.motivo}>
                    {MOTIVOS_EXCLUSION[excluido.motivo] || excluido.motivo}:{" "}
                    {excluido.cantidad}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-bg-dark">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(evento) => setConfirmado(evento.target.checked)}
            />
            Confirmo mover {vistaPrevia.totalEstimado} correo(s) a la papelera
          </label>

          <button
            type="button"
            onClick={() => alConfirmarLimpieza?.()}
            disabled={!confirmado || limpiando}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {limpiando ? "Ejecutando..." : "Ejecutar limpieza"}
          </button>
        </div>
      )}

      {lote && (
        <div role="status" className="space-y-1 text-xs text-slate-text">
          <p>
            Estado de la limpieza: <strong>{lote.estado}</strong>
          </p>
          <p>
            Movidos: {lote.movidos} · Omitidos: {lote.omitidos} · Fallidos:{" "}
            {lote.fallidos}
          </p>
          {lote.limiteEjecucionAlcanzado && (
            <p className="text-amber-900">
              Se alcanzó el límite por ejecución; la siguiente ejecución retoma
              el remanente.
            </p>
          )}
          {lote.estado === "EN_PROCESO" && alRefrescarLote && (
            <button
              type="button"
              onClick={() => alRefrescarLote()}
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border-line bg-bg-cream px-3 py-1.5 text-xs font-medium text-bg-dark transition-colors hover:border-emerald-primary/50 hover:text-emerald-primary"
            >
              Actualizar estado
            </button>
          )}
        </div>
      )}
    </div>
  );
}
