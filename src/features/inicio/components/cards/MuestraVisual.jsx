/**
 * @uso        Coordina la presentación visual según el tipo de muestra
 * @funciones  MuestraVisual({ muestra, temaOscuro })
 * @datos      Valida los datos comunes y delega a la carpeta del tipo correspondiente
 * @eventos    Delegados al componente específico de cada muestra
 * @estados    Ninguno
 * @usadoPor   MuestraCard y DetalleMuestraModal
 */
import { formatearCantidad, formatearMonto, obtenerFuente, obtenerValorMuestra, tieneValorMuestra, TEXTO_SIN_DATOS } from "../../utils/inicioHelpers";
import TarjetaMuestra from "../muestras/tarjeta/TarjetaMuestra";
import GraficaMuestra from "../muestras/grafica/GraficaMuestra";
import MetricaMuestra from "../muestras/metrica/MetricaMuestra";
import MapaCalorMuestra from "../muestras/mapa-calor/MapaCalorMuestra";

/** Presenta una muestra delegando el diseño al componente de su tipo. */
export default function MuestraVisual({ muestra, temaOscuro = false }) {
  const texto = temaOscuro ? "text-bg-cream" : "text-bg-dark";
  const etiqueta = temaOscuro ? "text-bg-cream/70" : "text-slate-text";
  const fuente = obtenerFuente(muestra.fuente);
  const valor = obtenerValorMuestra(muestra);
  const tiposValidos = ["tarjeta", "grafica", "metrica", "mapa_calor"];
  const detalles = Array.isArray(muestra.detalles) ? muestra.detalles : [];

  if (muestra.cargando) return <p role="status" className={`text-sm ${etiqueta}`}>Cargando datos de {fuente?.etiqueta || "la fuente"}…</p>;
  if (muestra.error) return <p role="alert" className="text-sm text-red-700">{muestra.error}</p>;

  const detallesMarkup = detalles.length > 0 && <dl aria-label="Detalles de la muestra" className={`grid w-full grid-cols-1 gap-2 border-t border-border-line/20 pt-3 sm:grid-cols-2 ${etiqueta}`}>
    {detalles.map((detalle) => <div key={detalle.etiqueta} className="min-w-0"><dt className="text-xs">{detalle.etiqueta}</dt><dd className={`break-words text-sm font-medium ${texto}`}>{detalle.valor}</dd></div>)}
  </dl>;

  if (!tieneValorMuestra(valor) || !fuente || !tiposValidos.includes(muestra.tipo)) return <><p className={`text-sm ${etiqueta}`}>{TEXTO_SIN_DATOS}</p>{detallesMarkup}</>;

  const valorFormateado = muestra.unidad === "moneda" ? formatearMonto(valor) : formatearCantidad(valor);
  const serie = Array.isArray(muestra.serie) ? muestra.serie : [];
  let visualizacion;
  switch (muestra.tipo) {
    case "tarjeta": visualizacion = <TarjetaMuestra muestra={muestra} fuente={fuente} temaOscuro={temaOscuro} valorFormateado={valorFormateado} />; break;
    case "grafica": visualizacion = <GraficaMuestra serie={serie} fuente={fuente} unidad={muestra.unidad} etiqueta={etiqueta} />; break;
    case "metrica": visualizacion = <MetricaMuestra muestra={muestra} fuente={fuente} temaOscuro={temaOscuro} valorFormateado={valorFormateado} />; break;
    case "mapa_calor": visualizacion = <MapaCalorMuestra muestra={muestra} etiqueta={etiqueta} />; break;
    default: visualizacion = null;
  }

  return <>{visualizacion}{detallesMarkup}</>;
}
