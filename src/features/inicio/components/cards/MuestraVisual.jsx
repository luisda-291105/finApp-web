import {
  CLASES_INTENSIDAD,
  TEXTO_SIN_DATOS,
  formatearCantidad,
  formatearMonto,
  obtenerFuente,
  obtenerValorMuestra,
  tieneValorMuestra,
} from "../../utils/inicioHelpers";

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
      {muestra.tipo === "tarjeta" && <p className={`text-2xl font-bold ${texto}`}>{valorFormateado}</p>}
      {muestra.tipo === "grafica" && (serie.length
        ? <div role="img" aria-label={`Gráfica de ${fuente.etiqueta} basada en datos guardados`} className="flex h-24 items-end gap-1">
          {serie.map((barra, indice) => <div key={`${barra.etiqueta}-${indice}`} data-testid="barra-grafica" className="flex min-w-0 flex-1 flex-col items-center justify-end" title={`${barra.etiqueta}: ${muestra.unidad === "moneda" ? formatearMonto(barra.valor) : formatearCantidad(barra.valor)}`}>
            <div className="w-full rounded-t-sm bg-emerald-primary" style={{ height: `${barra.altura}%` }} />
            <span className={`mt-1 max-w-full truncate text-center text-xs ${etiqueta}`}>{barra.etiqueta}</span>
          </div>)}
        </div>
        : <p className={`text-sm ${etiqueta}`}>No hay datos suficientes para crear esta gráfica.</p>)}
      {muestra.tipo === "metrica" && <div className="flex items-baseline gap-2"><span className={`text-3xl font-bold ${texto}`}>{valorFormateado}</span>{muestra.variacion && <span className="text-sm font-medium text-emerald-primary">{muestra.variacion}</span>}</div>}
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
