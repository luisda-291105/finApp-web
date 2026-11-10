import { useState } from "react";
import {
  CLASES_INTENSIDAD,
  TEXTO_SIN_DATOS,
  formatearCantidad,
  formatearMonto,
  obtenerFuente,
  obtenerValorMuestra,
  tieneValorMuestra,
} from "../../utils/inicioHelpers";

function LineaMetrica({ serie, fuente, unidad, texto, etiqueta }) {
  const [indiceActivo, setIndiceActivo] = useState(Math.max(0, serie.length - 1));
  const puntos = serie.map((dato, indice) => {
    const x = serie.length === 1 ? 160 : 18 + (indice * 284) / (serie.length - 1);
    const intensidad = Number.isFinite(Number(dato.altura)) ? Math.min(100, Math.max(8, Number(dato.altura))) : 50;
    const y = 88 - intensidad * 0.58;
    return { ...dato, x, y, left: `${(x / 320) * 100}%`, top: `${(y / 120) * 100}%` };
  });
  const puntoActivo = puntos[indiceActivo];
  const linea = puntos.map((punto) => `${punto.x},${punto.y}`).join(" ");
  const formatear = (valor) => unidad === "moneda" ? formatearMonto(valor) : formatearCantidad(valor);

  return <section aria-label={`Métrica de ${fuente?.etiqueta || "la fuente"}`} className="min-w-0 space-y-1">
    <div className="flex items-center justify-between gap-2">
      <p className={`truncate text-xs font-medium ${etiqueta}`}>Tendencia · {fuente?.etiqueta || "Fuente"}</p>
      <span className="shrink-0 text-xs text-emerald-primary">{serie.length} puntos</span>
    </div>
    <div className="relative h-28 w-full overflow-hidden" aria-label={`Línea interactiva de ${fuente?.etiqueta || "la fuente"}`}>
      <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <line x1="12" y1="88" x2="308" y2="88" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
        {puntos.length > 1 && <polyline points={linea} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-primary" />}
        {puntos.map((punto, indice) => <circle key={`${punto.etiqueta}-${indice}`} cx={punto.x} cy={punto.y} r={indice === indiceActivo ? 5 : 3.5} fill="currentColor" className={indice === indiceActivo ? "text-emerald-primary" : "text-emerald-primary/60"} />)}
      </svg>
      {puntos.map((punto, indice) => <button
        key={`${punto.etiqueta}-selector-${indice}`}
        type="button"
        onClick={() => setIndiceActivo(indice)}
        onMouseEnter={() => setIndiceActivo(indice)}
        onFocus={() => setIndiceActivo(indice)}
        aria-label={`${fuente?.etiqueta || "Fuente"}, ${punto.etiqueta}: ${formatear(punto.valor)}`}
        aria-pressed={indice === indiceActivo}
        title={`${punto.etiqueta}: ${formatear(punto.valor)}`}
        className="absolute z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none after:absolute after:left-1/2 after:top-1/2 after:h-2.5 after:w-2.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-emerald-primary focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2"
        style={{ left: punto.left, top: punto.top }}
      />)}
    </div>
    <div className="flex min-w-0 items-center justify-between gap-3">
      <p className={`min-w-0 truncate text-xs ${etiqueta}`}>{puntoActivo?.etiqueta || "Sin puntos"}</p>
      {puntoActivo && <p className={`shrink-0 text-sm font-semibold ${texto}`} aria-live="polite">{formatear(puntoActivo.valor)}</p>}
    </div>
  </section>;
}

/** Representa una muestra con los datos actuales obtenidos de su fuente. */
export default function MuestraVisual({ muestra, temaOscuro = false }) {
  const texto = temaOscuro ? "text-bg-cream" : "text-bg-dark";
  const etiqueta = temaOscuro ? "text-bg-cream/70" : "text-slate-text";
  const fuente = obtenerFuente(muestra.fuente);
  const valor = obtenerValorMuestra(muestra);
  const tipoValido = ["tarjeta", "grafica", "metrica", "mapa_calor"].includes(muestra.tipo);
  const detalles = Array.isArray(muestra.detalles) ? muestra.detalles : [];
  if (muestra.cargando) return <p role="status" className={`text-sm ${etiqueta}`}>Cargando datos de {fuente?.etiqueta || "la fuente"}…</p>;
  if (muestra.error) return <p role="alert" className="text-sm text-red-700">{muestra.error}</p>;
  const detallesMarkup = detalles.length > 0 && <dl aria-label="Detalles de la muestra" className={`grid w-full grid-cols-1 gap-2 border-t border-border-line/20 pt-3 sm:grid-cols-2 ${etiqueta}`}>
    {detalles.map((detalle) => <div key={detalle.etiqueta} className="min-w-0">
      <dt className="text-xs">{detalle.etiqueta}</dt>
      <dd className={`break-words text-sm font-medium ${texto}`}>{detalle.valor}</dd>
    </div>)}
  </dl>;
  if (!tieneValorMuestra(valor) || !fuente || !tipoValido) return <><p className={`text-sm ${etiqueta}`}>{TEXTO_SIN_DATOS}</p>{detallesMarkup}</>;

  const valorFormateado = muestra.unidad === "moneda" ? formatearMonto(valor) : formatearCantidad(valor);
  const serie = Array.isArray(muestra.serie) ? muestra.serie : [];
  const tieneDiasHeatmap = Array.isArray(muestra.diasHeatmap);
  const filasHeatmap = tieneDiasHeatmap
    ? muestra.diasHeatmap
    : Array.isArray(muestra.intensidades) ? muestra.intensidades.map((fila) => fila.map((intensidad) => ({ intensidad, valor: 0 }))) : null;
  return (
    <>
      {muestra.tipo === "tarjeta" && <section aria-label={`Resumen de ${fuente.etiqueta}`} className={`w-full rounded-xl border p-4 ${temaOscuro ? "border-border-line/40 bg-bg-dark/50" : "border-border-line/40 bg-white/70"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs font-medium uppercase tracking-wide ${etiqueta}`}>Resumen actual</p>
            <p className={`mt-1 break-words text-3xl font-bold leading-tight ${texto}`}>{valorFormateado}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${temaOscuro ? "bg-mint-accent/15 text-mint-accent" : "bg-emerald-primary/10 text-emerald-primary"}`}>
            {muestra.unidad === "moneda" ? "COP" : "registros"}
          </span>
        </div>
        {muestra.variacion && <p className="mt-3 text-sm font-medium text-emerald-primary">{muestra.variacion} <span className={`font-normal ${etiqueta}`}>frente al periodo anterior</span></p>}
      </section>}
      {muestra.tipo === "grafica" && (serie.length
        ? <div role="img" aria-label={`Gráfica de ${fuente.etiqueta} basada en datos guardados`} className="flex h-24 items-end gap-1">
          {serie.map((barra, indice) => <div key={`${barra.etiqueta}-${indice}`} data-testid="barra-grafica" className="flex min-w-0 flex-1 flex-col items-center justify-end" title={`${barra.etiqueta}: ${muestra.unidad === "moneda" ? formatearMonto(barra.valor) : formatearCantidad(barra.valor)}`}>
            <div className="w-full rounded-t-sm bg-emerald-primary" style={{ height: `${barra.altura}%` }} />
            <span className={`mt-1 max-w-full truncate text-center text-xs ${etiqueta}`}>{barra.etiqueta}</span>
          </div>)}
        </div>
        : <p className={`text-sm ${etiqueta}`}>No hay datos suficientes para crear esta gráfica.</p>)}
      {muestra.tipo === "metrica" && <div className="w-full space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className={`text-3xl font-bold ${texto}`}>{valorFormateado}</span>{muestra.variacion && <span className="text-sm font-medium text-emerald-primary">{muestra.variacion}</span>}</div>
        {serie.length > 0 ? <LineaMetrica serie={serie} fuente={fuente} unidad={muestra.unidad} texto={texto} etiqueta={etiqueta} /> : <p className={`text-sm ${etiqueta}`}>Esta fuente todavía no tiene puntos de tendencia.</p>}
      </div>}
      {muestra.tipo === "mapa_calor" && (filasHeatmap
        ? <div className="space-y-1.5" data-testid="mapa-calor">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-text" aria-hidden="true">{["L", "M", "M", "J", "V", "S", "D"].map((dia, indice) => <span key={`${dia}-${indice}`}>{dia}</span>)}</div>
          <div role="img" aria-label={tieneDiasHeatmap ? "Mapa de actividad de los últimos 35 días" : "Mapa de actividad de los últimos 35 días"} className="grid grid-cols-7 gap-1">
            {filasHeatmap.flatMap((fila, filaIndice) => fila.map((dia, columnaIndice) => {
              const fechaDia = dia.fecha ? new Date(`${dia.fecha}T00:00:00`) : null;
              const fechaTexto = fechaDia ? new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(fechaDia) : "Fecha no disponible";
              const cantidad = muestra.unidad === "moneda" ? formatearMonto(dia.valor) : formatearCantidad(dia.valor);
              return <div key={`${filaIndice}-${columnaIndice}`} data-testid="celda-mapa-calor" title={`${fechaTexto}: ${cantidad}`} aria-label={`${fechaTexto}: ${cantidad}`} className={`aspect-square min-h-3 rounded-sm ${CLASES_INTENSIDAD[dia.intensidad]}`} />;
            }))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-text"><span>Hace 5 semanas</span><span>Esta semana</span></div>
        </div>
        : <p className={`text-sm ${etiqueta}`}>Esta fuente no incluye fechas para construir un mapa de actividad.</p>)}
      {detallesMarkup}
    </>
  );
}
