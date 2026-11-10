/**
 * @uso        Presenta el valor y la tendencia de una muestra métrica
 * @funciones  MetricaMuestra({ muestra, fuente, temaOscuro, valorFormateado })
 * @datos      Recibe el valor agregado y la serie temporal de una fuente
 * @eventos    Delegados a los puntos interactivos de LineaMetrica
 * @estados    Ninguno
 * @usadoPor   MuestraVisual
 */
import LineaMetrica from "./LineaMetrica";
import { formatearCantidad, formatearMonto } from "../../../utils/inicioHelpers";

/** Muestra el valor actual junto a su serie interactiva por fuente. */
export default function MetricaMuestra({ muestra, fuente, temaOscuro, valorFormateado }) {
  const texto = temaOscuro ? "text-bg-cream" : "text-bg-dark";
  const etiqueta = temaOscuro ? "text-bg-cream/70" : "text-slate-text";
  const serie = Array.isArray(muestra.serie) ? muestra.serie : [];
  const serieSemanal = Array.isArray(muestra.serieSemanal) ? muestra.serieSemanal : [];
  const maximoSemanal = Math.max(1, ...serieSemanal.map((semana) => Number(semana.valor) || 0));
  const formatearSemana = (valor) => muestra.unidad === "moneda" ? formatearMonto(valor) : formatearCantidad(valor);

  return <div className="w-full space-y-3">
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className={`text-3xl font-bold ${texto}`}>{valorFormateado}</span>{muestra.variacion && <span className="text-sm font-medium text-emerald-primary">{muestra.variacion}</span>}</div>
    {serie.length > 0 ? <LineaMetrica serie={serie} fuente={fuente} unidad={muestra.unidad} texto={texto} etiqueta={etiqueta} /> : <p className={`text-sm ${etiqueta}`}>Esta fuente todavía no tiene puntos de tendencia.</p>}
    {serieSemanal.length > 0 ? <details onClick={(evento) => evento.stopPropagation()} onKeyDown={(evento) => evento.stopPropagation()} className={`group overflow-hidden rounded-xl border ${temaOscuro ? "border-white/10 bg-bg-dark/40" : "border-border-line/40 bg-white/60"}`}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-primary">
        <span className={`text-xs font-semibold ${texto}`}>Detalle semanal</span><span className="flex items-center gap-2"><span className={`text-[10px] ${etiqueta}`}>Último mes · {serieSemanal.length} semanas</span><span aria-hidden="true" className="text-emerald-primary transition-transform group-open:rotate-180">⌄</span></span>
      </summary>
      <ul aria-label="Detalle de datos por semana" className="max-h-56 space-y-2 overflow-y-auto border-t border-border-line/30 px-3 py-3">
        {[...serieSemanal].reverse().map((semana) => {
          const porcentaje = Math.min(100, Math.max(0, ((Number(semana.valor) || 0) / maximoSemanal) * 100));
          return <li key={semana.fecha} className="grid grid-cols-[minmax(5.5rem,auto)_minmax(2rem,1fr)_auto] items-center gap-2">
            <time dateTime={semana.fecha} className={`truncate text-[10px] ${etiqueta}`}>{semana.etiqueta}</time>
            <span className={`h-1.5 overflow-hidden rounded-full ${temaOscuro ? "bg-white/10" : "bg-border-line/30"}`}><span className="block h-full rounded-full bg-emerald-primary" style={{ width: `${porcentaje}%` }} /></span>
            <span className={`min-w-16 text-right text-[10px] font-semibold tabular-nums ${texto}`}>{formatearSemana(semana.valor)}</span>
          </li>;
        })}
      </ul>
    </details> : <p className={`rounded-xl border border-border-line/30 px-3 py-2 text-xs ${etiqueta}`}>No hay fechas disponibles para agrupar esta fuente por semanas.</p>}
  </div>;
}
