/**
 * @uso        Presenta actividad diaria en una cuadrícula de calor
 * @funciones  MapaCalorMuestra({ muestra, etiqueta })
 * @datos      Lee días o intensidades y formatea la cantidad por celda
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   MuestraVisual
 */
import { CLASES_INTENSIDAD, formatearCantidad, formatearMonto } from "../../../utils/inicioHelpers";

/** Mapa de los últimos días de actividad de la fuente. */
export default function MapaCalorMuestra({ muestra, etiqueta }) {
  const tieneDiasHeatmap = Array.isArray(muestra.diasHeatmap);
  const filas = tieneDiasHeatmap
    ? muestra.diasHeatmap
    : Array.isArray(muestra.intensidades) ? muestra.intensidades.map((fila) => fila.map((intensidad) => ({ intensidad, valor: 0 }))) : null;
  if (!filas) return <p className={`text-sm ${etiqueta}`}>Esta fuente no incluye fechas para construir un mapa de actividad.</p>;

  return <div className="space-y-1.5" data-testid="mapa-calor">
    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-text" aria-hidden="true">{["L", "M", "M", "J", "V", "S", "D"].map((dia, indice) => <span key={`${dia}-${indice}`}>{dia}</span>)}</div>
    <div role="img" aria-label="Mapa de actividad de los últimos 35 días" className="grid grid-cols-7 gap-1">
      {filas.flatMap((fila, filaIndice) => fila.map((dia, columnaIndice) => {
        const fechaDia = dia.fecha ? new Date(`${dia.fecha}T00:00:00`) : null;
        const fechaTexto = fechaDia ? new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(fechaDia) : "Fecha no disponible";
        const cantidad = muestra.unidad === "moneda" ? formatearMonto(dia.valor) : formatearCantidad(dia.valor);
        return <div key={`${filaIndice}-${columnaIndice}`} data-testid="celda-mapa-calor" title={`${fechaTexto}: ${cantidad}`} aria-label={`${fechaTexto}: ${cantidad}`} className={`aspect-square min-h-3 rounded-sm ${CLASES_INTENSIDAD[dia.intensidad]}`} />;
      }))}
    </div>
    <div className="flex items-center justify-between text-[10px] text-slate-text"><span>Hace 5 semanas</span><span>Esta semana</span></div>
  </div>;
}
