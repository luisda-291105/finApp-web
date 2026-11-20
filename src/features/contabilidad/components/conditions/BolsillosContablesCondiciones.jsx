/**
 * @uso        Estados de carga, error, vacío y contenido de bolsillos
 * @funciones  BolsillosContablesCondiciones({ bolsillos, ..., alAbrirBolsillo, disparadorBolsilloRef })
 * @datos      Recibe el estado de consulta y los datos para la cuadrícula
 * @eventos    Reenvía la apertura del detalle de cada bolsillo y abre el modal de nuevo bolsillo
 * @estados    Ninguno
 * @usadoPor   ContabilidadPage
 */
import { Plus, Wallet } from "lucide-react";
import { Card } from "../../../../components/ui";
import BolsillosContablesCards from "../cards/BolsillosContablesCards";
import { AlertaGlobal } from "../../../../features/error";

/** Sección de bolsillos que decide qué estado visible presentar. */
export default function BolsillosContablesCondiciones({
  bolsillos,
  cargandoBolsillos,
  errorBolsillos,
  resumenes,
  resumenMensual,
  cargandoResumenes,
  cargandoResumenMensual,
  errorResumenes,
  alAbrirDetalle,
  alAbrirBalance,
  alAbrirBolsillo,
  disparadorBolsilloRef,
}) {
  return (
    <section aria-labelledby="bolsillos-contables-titulo" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="bolsillos-contables-titulo"
            className="font-display text-xl font-semibold text-bg-dark"
          >
            Bolsillos
          </h2>
        </div>
        <button
          ref={disparadorBolsilloRef}
          type="button"
          onClick={alAbrirBolsillo}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-primary px-4 py-2.5 text-sm font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="sm:hidden">Bolsillo</span>
          <span className="hidden sm:inline">Nuevo bolsillo</span>
        </button>
      </div>
      <AlertaGlobal
        tipo="error"
        mensaje={errorBolsillos}
        idBase="BolsillosContablesCondiciones-errorBolsillos"
      />
      {cargandoBolsillos && (
        <p role="status" className="text-sm text-slate-text">
          Cargando bolsillos…
        </p>
      )}
      {!cargandoBolsillos && !errorBolsillos && bolsillos.length === 0 && (
        <Card className="p-8 text-center">
          <Wallet
            className="mx-auto h-8 w-8 text-emerald-primary"
            aria-hidden="true"
          />
          <p className="mt-3 font-medium text-bg-dark">
            Todavía no tienes bolsillos
          </p>
          <p className="mt-1 text-sm text-slate-text">
            Crea uno para empezar a organizar tu contabilidad.
          </p>
        </Card>
      )}
      {!cargandoBolsillos && bolsillos.length > 0 && (
        <BolsillosContablesCards
          bolsillos={bolsillos}
          resumenes={resumenes}
          resumenMensual={resumenMensual}
          cargandoResumenes={cargandoResumenes}
          cargandoResumenMensual={cargandoResumenMensual}
          errorResumenes={errorResumenes}
          alAbrirDetalle={alAbrirDetalle}
          alAbrirBalance={alAbrirBalance}
        />
      )}
    </section>
  );
}
