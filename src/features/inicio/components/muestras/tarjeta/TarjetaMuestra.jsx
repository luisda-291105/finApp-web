/**
 * @uso        Presenta el valor actual de una muestra tipo tarjeta
 * @funciones  TarjetaMuestra({ muestra, fuente, temaOscuro, valorFormateado })
 * @datos      Recibe el valor y la variación calculados para su fuente
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   MuestraVisual
 */
/** Resumen actual del valor de una fuente. */
export default function TarjetaMuestra({ muestra, fuente, temaOscuro, valorFormateado }) {
  const texto = temaOscuro ? "text-bg-cream" : "text-bg-dark";
  const etiqueta = temaOscuro ? "text-bg-cream/70" : "text-slate-text";

  return <section aria-label={`Resumen de ${fuente.etiqueta}`} className={`w-full rounded-xl border p-4 ${temaOscuro ? "border-border-line/40 bg-bg-dark/50" : "border-border-line/40 bg-white/70"}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><p className={`text-xs font-medium uppercase tracking-wide ${etiqueta}`}>Resumen actual</p><p className={`mt-1 break-words text-3xl font-bold leading-tight ${texto}`}>{valorFormateado}</p></div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${temaOscuro ? "bg-mint-accent/15 text-mint-accent" : "bg-emerald-primary/10 text-emerald-primary"}`}>{muestra.unidad === "moneda" ? "COP" : "registros"}</span>
    </div>
    {muestra.variacion && <p className="mt-3 text-sm font-medium text-emerald-primary">{muestra.variacion} <span className={`font-normal ${etiqueta}`}>frente al periodo anterior</span></p>}
  </section>;
}
