/**
 * @uso        Dibuja la tendencia interactiva de una muestra métrica
 * @funciones  LineaMetrica({ serie, fuente, unidad, texto, etiqueta })
 * @datos      Convierte puntos de tendencia a posiciones SVG y muestra el punto activo
 * @eventos    Selección, hover y foco de cada punto
 * @estados    indiceActivo
 * @usadoPor   MetricaMuestra
 */
import { useId, useState } from "react";
import { formatearCantidad, formatearMonto } from "../../../utils/inicioHelpers";

/** Línea de tendencia con área, puntos seleccionables y valor enfocado. */
export default function LineaMetrica({ serie, fuente, unidad, texto, etiqueta }) {
  const idMetrica = useId().replace(/:/g, "");
  const [indiceActivo, setIndiceActivo] = useState(Math.max(0, serie.length - 1));
  const puntos = serie.map((dato, indice) => {
    const x = serie.length === 1 ? 160 : 18 + (indice * 284) / (serie.length - 1);
    const intensidad = Number.isFinite(Number(dato.altura)) ? Math.min(100, Math.max(8, Number(dato.altura))) : 50;
    const y = 88 - intensidad * 0.58;
    return { ...dato, x, y, left: `${(x / 320) * 100}%`, top: `${(y / 120) * 100}%` };
  });
  const puntoActivo = puntos[indiceActivo];
  const linea = puntos.map((punto) => `${punto.x},${punto.y}`).join(" ");
  const area = puntos.length > 1 ? `M ${puntos[0].x},104 L ${puntos.map((punto) => `${punto.x},${punto.y}`).join(" L ")} L ${puntos[puntos.length - 1].x},104 Z` : "";
  const formatear = (valor) => unidad === "moneda" ? formatearMonto(valor) : formatearCantidad(valor);
  const superficie = texto === "text-bg-cream" ? "border-white/10 bg-bg-dark/50" : "border-border-line/40 bg-white/70";
  const tooltipX = puntoActivo ? Math.min(76, Math.max(2, (puntoActivo.x / 320) * 100)) : 2;
  const gradientId = `metrica-area-${idMetrica}`;

  return <section aria-label={`Métrica de ${fuente?.etiqueta || "la fuente"}`} className={`min-w-0 space-y-3 rounded-2xl border p-4 ${superficie}`}>
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0"><p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${etiqueta}`}>Tendencia</p><p className={`mt-0.5 truncate text-sm font-semibold ${texto}`}>{fuente?.etiqueta || "Fuente"}</p></div>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-primary"><span className="h-1.5 w-1.5 rounded-full bg-emerald-primary" aria-hidden="true" />{serie.length} puntos</span>
    </div>
    <div className="relative h-36 w-full rounded-xl bg-gradient-to-b from-emerald-primary/[0.07] to-transparent px-1" aria-label={`Línea interactiva de ${fuente?.etiqueta || "la fuente"}`}>
      <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity="0.24" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
        {[24, 48, 72, 96].map((y) => <line key={y} x1="12" y1={y} x2="308" y2={y} stroke="currentColor" strokeOpacity="0.10" strokeWidth="1" strokeDasharray="3 5" />)}
        {puntos.length > 1 && <path d={area} fill={`url(#${gradientId})`} className="text-emerald-primary" />}
        {puntos.length > 1 && <polyline points={linea} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-primary" />}
        {puntoActivo && <circle cx={puntoActivo.x} cy={puntoActivo.y} r="9" fill="currentColor" fillOpacity="0.15" className="text-emerald-primary" />}
        {puntos.map((punto, indice) => <circle key={`${punto.etiqueta}-${indice}`} cx={punto.x} cy={punto.y} r={indice === indiceActivo ? 5 : 3.5} fill="currentColor" stroke="currentColor" strokeWidth={indice === indiceActivo ? 2 : 0} className={indice === indiceActivo ? "text-emerald-primary stroke-bg-cream" : "text-emerald-primary/60"} />)}
      </svg>
      {puntos.map((punto, indice) => <button key={`${punto.etiqueta}-selector-${indice}`} type="button" onClick={(evento) => { evento.stopPropagation(); setIndiceActivo(indice); }} onKeyDown={(evento) => evento.stopPropagation()} onMouseEnter={() => setIndiceActivo(indice)} onFocus={() => setIndiceActivo(indice)} aria-label={`${fuente?.etiqueta || "Fuente"}, ${punto.etiqueta}: ${formatear(punto.valor)}`} aria-pressed={indice === indiceActivo} title={`${punto.etiqueta}: ${formatear(punto.valor)}`} className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2" style={{ left: punto.left, top: punto.top }} />)}
      {puntoActivo && <div className="pointer-events-none absolute z-20 -translate-y-1/2 rounded-lg border border-border-line/50 bg-bg-cream px-2.5 py-1.5 shadow-lg" style={{ left: `${tooltipX}%`, top: puntoActivo.top }}><p className="whitespace-nowrap text-[10px] font-medium text-slate-text">{puntoActivo.etiqueta}</p><p className="whitespace-nowrap text-xs font-bold text-bg-dark">{formatear(puntoActivo.valor)}</p></div>}
    </div>
    <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border-line/30 pt-2">
      <p className={`min-w-0 truncate text-[10px] ${etiqueta}`}>{puntos[0]?.etiqueta || "Sin puntos"}</p>
      {puntoActivo && <p className={`shrink-0 text-xs font-semibold ${texto}`} aria-live="polite">{indiceActivo + 1}/{serie.length} · {formatear(puntoActivo.valor)}</p>}
      <p className={`min-w-0 truncate text-right text-[10px] ${etiqueta}`}>{puntos[puntos.length - 1]?.etiqueta || ""}</p>
    </div>
  </section>;
}
