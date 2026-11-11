/**
 * @uso        Presenta una serie de datos como barras
 * @funciones  GraficaMuestra({ serie, fuente, unidad, etiqueta })
 * @datos      Recibe los puntos agrupados y normalizados de una muestra
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   MuestraVisual
 */
import { formatearCantidad, formatearMonto } from "../../../utils/inicioHelpers";

/** Gráfica de barras con etiqueta y valor accesibles en cada punto. */
export default function GraficaMuestra({ serie, fuente, unidad, etiqueta }) {
  if (!serie.length) return <p className={`text-sm ${etiqueta}`}>No hay datos suficientes para crear esta gráfica.</p>;
  return <div role="img" aria-label={`Gráfica de ${fuente.etiqueta} basada en datos guardados`} className="flex h-24 items-end gap-1">
    {serie.map((barra, indice) => <div key={`${barra.etiqueta}-${indice}`} data-testid="barra-grafica" className="flex min-w-0 flex-1 flex-col items-center justify-end" title={`${barra.etiqueta}: ${unidad === "moneda" ? formatearMonto(barra.valor) : formatearCantidad(barra.valor)}`}>
      <div className="w-full rounded-t-sm bg-emerald-primary" style={{ height: `${barra.altura}%` }} />
      <span className={`mt-1 max-w-full truncate text-center text-xs ${etiqueta}`}>{barra.etiqueta}</span>
    </div>)}
  </div>;
}
