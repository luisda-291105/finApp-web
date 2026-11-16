/**
 * @uso        Dibuja la tendencia interactiva de una muestra métrica con detalles tipo trading
 * @funciones  LineaMetrica({ serie, fuente, unidad, texto, etiqueta })
 * @datos      Convierte puntos de tendencia a posiciones SVG, escala Y, estadísticas y punto activo
 * @eventos    Selección, hover y foco de cada punto
 * @estados    indiceActivo
 * @usadoPor   MetricaMuestra
 */
import { useId, useMemo, useState } from "react";
import { formatearCantidad, formatearMonto } from "../../../utils/inicioHelpers";

function formatearCompacto(valor, unidad) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "—";
  if (unidad === "moneda") {
    if (Math.abs(numero) >= 1_000_000) return `$${(numero / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })}M`;
    if (Math.abs(numero) >= 1_000) return `$${(numero / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })}k`;
    return `$${numero.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
  }
  if (Math.abs(numero) >= 1_000_000) return `${(numero / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })}M`;
  if (Math.abs(numero) >= 1_000) return `${(numero / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })}k`;
  return numero.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

/** Línea de tendencia estilo trading: escala, cruce, estadísticas y valor enfocado. */
export default function LineaMetrica({ serie, fuente, unidad, texto, etiqueta }) {
  const idMetrica = useId().replace(/:/g, "");
  const [indiceActivo, setIndiceActivo] = useState(Math.max(0, serie.length - 1));
  const formatear = (valor) => unidad === "moneda" ? formatearMonto(valor) : formatearCantidad(valor);

  const valores = useMemo(() => serie.map((dato) => Number(dato.valor)).filter(Number.isFinite), [serie]);
  const minimo = valores.length ? Math.min(...valores) : 0;
  const maximo = valores.length ? Math.max(...valores) : 0;
  const rango = maximo - minimo || Math.max(Math.abs(maximo), 1);
  const primero = valores[0] ?? 0;
  const ultimo = valores[valores.length - 1] ?? 0;
  const cambio = ultimo - primero;
  const cambioPct = primero ? (cambio / Math.abs(primero)) * 100 : 0;
  const tendenciaPositiva = cambio >= 0;
  const colorTendencia = tendenciaPositiva ? "text-emerald-primary" : "text-red-500";
  const colorTendenciaFondo = tendenciaPositiva ? "bg-emerald-primary/10 text-emerald-primary" : "bg-red-500/10 text-red-600";

  const chart = { left: 58, right: 308, top: 12, bottom: 96 };
  const xDe = (indice) => serie.length === 1 ? (chart.left + chart.right) / 2 : chart.left + (indice * (chart.right - chart.left)) / (serie.length - 1);
  const yDe = (valor) => chart.bottom - ((Number(valor) - minimo) / rango) * (chart.bottom - chart.top);

  const puntos = serie.map((dato, indice) => {
    const x = xDe(indice);
    const y = yDe(dato.valor);
    return { ...dato, x, y, left: `${(x / 320) * 100}%`, top: `${(y / 120) * 100}%` };
  });
  const puntoActivo = puntos[indiceActivo];
  const puntoPrevio = indiceActivo > 0 ? puntos[indiceActivo - 1] : null;
  const deltaActivo = puntoPrevio ? Number(puntoActivo?.valor || 0) - Number(puntoPrevio.valor || 0) : null;
  const linea = puntos.map((punto) => `${punto.x},${punto.y}`).join(" ");
  const area = puntos.length > 1 ? `M ${puntos[0].x},${chart.bottom} L ${puntos.map((punto) => `${punto.x},${punto.y}`).join(" L ")} L ${puntos[puntos.length - 1].x},${chart.bottom} Z` : "";

  const ticksY = [0, 1, 2, 3].map((i) => {
    const valor = minimo + (rango * (3 - i)) / 3;
    return { valor, y: chart.top + (i * (chart.bottom - chart.top)) / 3 };
  });

  const superficie = texto === "text-bg-cream" ? "border-white/10 bg-bg-dark/50" : "border-border-line/40 bg-white/70";
  const tooltipX = puntoActivo ? Math.min(72, Math.max(10, (puntoActivo.x / 320) * 100)) : 10;
  const gradientId = `metrica-area-${idMetrica}`;

  return <section aria-label={`Métrica de ${fuente?.etiqueta || "la fuente"}`} className={`min-w-0 space-y-3 rounded-2xl border p-4 ${superficie}`}>
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${etiqueta}`}>Tendencia</p>
        <p className={`mt-0.5 truncate text-sm font-semibold ${texto}`}>{fuente?.etiqueta || "Fuente"}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${colorTendenciaFondo}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tendenciaPositiva ? "bg-emerald-primary" : "bg-red-500"}`} aria-hidden="true" />
          {cambio >= 0 ? "+" : ""}{formatear(cambio)} ({cambioPct >= 0 ? "+" : ""}{cambioPct.toFixed(2)}%)
        </span>
        <span className={`text-[10px] ${etiqueta}`}>{serie.length} puntos</span>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-2">
      {[
        { l: "Mín", v: minimo },
        { l: "Máx", v: maximo },
        { l: "Primero", v: primero },
        { l: "Último", v: ultimo },
      ].map((item) => (
        <div key={item.l} className="rounded-lg border border-border-line/30 px-2 py-1.5">
          <p className={`text-[10px] uppercase tracking-wide ${etiqueta}`}>{item.l}</p>
          <p className={`truncate text-[11px] font-semibold tabular-nums ${texto}`}>{formatear(item.v)}</p>
        </div>
      ))}
    </div>

    <div className="relative h-44 w-full rounded-xl bg-gradient-to-b from-emerald-primary/[0.05] to-transparent px-1" aria-label={`Línea interactiva de ${fuente?.etiqueta || "la fuente"}`}>
      <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={tendenciaPositiva ? "0.22" : "0.18"} />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticksY.map((tick) => <line key={tick.y} x1={chart.left} y1={tick.y} x2={chart.right} y2={tick.y} stroke="currentColor" strokeOpacity="0.10" strokeWidth="1" strokeDasharray="3 5" />)}
        {puntoActivo && <line x1={puntoActivo.x} y1={chart.top} x2={puntoActivo.x} y2={chart.bottom} stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 4" className={colorTendencia} />}
        {puntoActivo && <line x1={chart.left} y1={puntoActivo.y} x2={chart.right} y2={puntoActivo.y} stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 4" className={colorTendencia} />}
        {puntos.length > 1 && <path d={area} fill={`url(#${gradientId})`} className={colorTendencia} />}
        {puntos.length > 1 && <polyline points={linea} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={colorTendencia} />}
        {Number.isFinite(ultimo) && <line x1={chart.left} y1={yDe(ultimo)} x2={chart.right} y2={yDe(ultimo)} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="4 4" className={colorTendencia} />}
        {puntoActivo && <circle cx={puntoActivo.x} cy={puntoActivo.y} r="8" fill="currentColor" fillOpacity="0.15" className={colorTendencia} />}
        {puntos.map((punto, indice) => <circle key={`${punto.etiqueta}-${indice}`} cx={punto.x} cy={punto.y} r={indice === indiceActivo ? 4.5 : 3} fill="currentColor" stroke="currentColor" strokeWidth={indice === indiceActivo ? 2 : 0} className={indice === indiceActivo ? `${colorTendencia} stroke-bg-cream` : `${colorTendencia} opacity-70`} />)}
        {ticksY.map((tick, i) => (
          <text key={`ty-${i}`} x={chart.left - 4} y={tick.y + 3} textAnchor="end" fontSize="6.5" fill="currentColor" opacity="0.6" className={etiqueta}>
            {formatear(tick.valor)}
          </text>
        ))}
      </svg>
      {puntos.map((punto, indice) => <button key={`${punto.etiqueta}-selector-${indice}`} type="button" onClick={(evento) => { evento.stopPropagation(); setIndiceActivo(indice); }} onKeyDown={(evento) => evento.stopPropagation()} onMouseEnter={() => setIndiceActivo(indice)} onFocus={() => setIndiceActivo(indice)} aria-label={`${fuente?.etiqueta || "Fuente"}, ${punto.etiqueta}: ${formatear(punto.valor)}`} aria-pressed={indice === indiceActivo} title={`${punto.etiqueta}: ${formatear(punto.valor)}`} className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2" style={{ left: punto.left, top: punto.top }} />)}
      {puntoActivo && <div className="pointer-events-none absolute z-20 min-w-[8rem] -translate-y-1/2 rounded-lg border border-border-line/50 bg-bg-cream/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm" style={{ left: `${tooltipX}%`, top: `${Math.min(78, Math.max(18, (puntoActivo.y / 120) * 100))}%` }}>
        <p className="whitespace-nowrap text-[10px] font-medium text-slate-text">{puntoActivo.etiqueta}</p>
        <p className="whitespace-nowrap text-xs font-bold text-bg-dark">{formatear(puntoActivo.valor)}</p>
        {deltaActivo !== null && <p className={`whitespace-nowrap text-[10px] font-semibold ${deltaActivo >= 0 ? "text-emerald-primary" : "text-red-600"}`}>{deltaActivo >= 0 ? "▲" : "▼"} {formatear(Math.abs(deltaActivo))}</p>}
      </div>}
      <div className={`pointer-events-none absolute right-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${tendenciaPositiva ? "bg-emerald-primary text-white" : "bg-red-500 text-white"}`}>
        {formatearCompacto(ultimo, unidad)}
      </div>
    </div>

    <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border-line/30 pt-2">
      <p className={`min-w-0 truncate text-[10px] ${etiqueta}`}>{puntos[0]?.etiqueta || "Sin puntos"}</p>
      {puntoActivo && <p className={`shrink-0 text-xs font-semibold ${texto}`} aria-live="polite">Punto {indiceActivo + 1}/{serie.length} · {formatear(puntoActivo.valor)}</p>}
      <p className={`min-w-0 truncate text-right text-[10px] ${etiqueta}`}>{puntos[puntos.length - 1]?.etiqueta || ""}</p>
    </div>
  </section>;
}
