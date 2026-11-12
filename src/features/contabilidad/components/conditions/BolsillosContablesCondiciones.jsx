/**
 * @uso        Estados de carga, error, vacío y contenido de bolsillos
 * @funciones  BolsillosContablesCondiciones({ bolsillos, ... })
 * @datos      Recibe el estado de consulta y los datos para la cuadrícula
 * @eventos    Reenvía la apertura del detalle de cada bolsillo
 * @estados    Ninguno
 * @usadoPor   ContabilidadPage
 */
import { Wallet } from "lucide-react";
import { Card } from "../../../../components/ui";
import BolsillosContablesCards from "../cards/BolsillosContablesCards";

/** Sección de bolsillos que decide qué estado visible presentar. */
export default function BolsillosContablesCondiciones({ bolsillos, cargandoBolsillos, errorBolsillos, resumenes, resumenMensual, cargandoResumenes, cargandoResumenMensual, errorResumenes, alAbrirDetalle }) {
  return <section aria-labelledby="bolsillos-contables-titulo" className="space-y-4">
    <div>
      <h2 id="bolsillos-contables-titulo" className="font-display text-xl font-semibold text-bg-dark">Bolsillos</h2>
      <p className="mt-1 text-sm text-slate-text">Organiza tu dinero en espacios con nombre y estado propio.</p>
    </div>
    {errorBolsillos && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorBolsillos}</p>}
    {cargandoBolsillos && <p role="status" className="text-sm text-slate-text">Cargando bolsillos…</p>}
    {!cargandoBolsillos && !errorBolsillos && bolsillos.length === 0 && <Card className="p-8 text-center"><Wallet className="mx-auto h-8 w-8 text-emerald-primary" aria-hidden="true" /><p className="mt-3 font-medium text-bg-dark">Todavía no tienes bolsillos</p><p className="mt-1 text-sm text-slate-text">Crea uno para empezar a organizar tu contabilidad.</p></Card>}
    {!cargandoBolsillos && bolsillos.length > 0 && <BolsillosContablesCards
      bolsillos={bolsillos}
      resumenes={resumenes}
      resumenMensual={resumenMensual}
      cargandoResumenes={cargandoResumenes}
      cargandoResumenMensual={cargandoResumenMensual}
      errorResumenes={errorResumenes}
      alAbrirDetalle={alAbrirDetalle}
    />}
  </section>;
}
