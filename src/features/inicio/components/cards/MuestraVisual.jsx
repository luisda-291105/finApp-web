import {
  CLASES_INTENSIDAD,
  INTENSIDADES_MAPA_DEMO,
  SERIE_GRAFICA_DEMO,
  TEXTO_SIN_DATOS,
  VARIACION_METRICA_DEMO,
  formatearMonto,
  obtenerFuente,
  obtenerValorMuestra,
} from "../../utils/inicioHelpers";

/** Representa el contenido de una muestra con tarjeta, gráfica, métrica o mapa de calor. */
export default function MuestraVisual({ muestra, temaOscuro = false }) {
  const texto = temaOscuro ? "text-bg-cream" : "text-bg-dark";
  const etiqueta = temaOscuro ? "text-bg-cream/70" : "text-slate-text";
  const fuente = obtenerFuente(muestra.fuente);
  const valor = obtenerValorMuestra(muestra);
  const tipoValido = ["tarjeta", "grafica", "metrica", "mapa_calor"].includes(muestra.tipo);
  if (!valor || !fuente || !tipoValido) return <p className={`text-sm ${etiqueta}`}>{TEXTO_SIN_DATOS}</p>;

  const valorFormateado = formatearMonto(valor);
  return (
    <>
      {muestra.tipo === "tarjeta" && <p className={`text-2xl font-bold ${texto}`}>{valorFormateado}</p>}
      {muestra.tipo === "grafica" && <div role="img" aria-label="Gráfica de demostración con serie fija" className="flex h-24 items-end gap-1">
        {(muestra.serie || SERIE_GRAFICA_DEMO).map((barra, indice) => <div key={indice} data-testid="barra-grafica" className="w-full rounded-t-sm bg-emerald-primary" style={{ height: `${barra.altura}%` }} title={barra.etiqueta}><span className={`mt-1 block text-center text-xs ${etiqueta}`}>{barra.etiqueta}</span></div>)}
      </div>}
      {muestra.tipo === "metrica" && <div className="flex items-baseline gap-1"><span className={`text-3xl font-bold ${texto}`}>{valorFormateado}</span><span className="text-sm font-medium text-emerald-primary">{muestra.variacion || VARIACION_METRICA_DEMO}</span></div>}
      {muestra.tipo === "mapa_calor" && <div role="img" aria-label="Mapa de calor de demostración (7 días × 5 franjas)" className="grid h-24 grid-cols-5 grid-rows-7 gap-1" data-testid="mapa-calor">
        {(muestra.intensidades || INTENSIDADES_MAPA_DEMO).flatMap((fila, filaIndice) => fila.map((intensidad, columnaIndice) => <div key={`${filaIndice}-${columnaIndice}`} data-testid="celda-mapa-calor" className={`min-h-0 rounded-sm ${CLASES_INTENSIDAD[intensidad]}`} />))}
      </div>}
    </>
  );
}
