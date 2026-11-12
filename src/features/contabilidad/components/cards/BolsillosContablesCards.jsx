/**
 * @uso        Cuadrícula de tarjetas de bolsillos fijos y propios
 * @funciones  BolsillosContablesCards({ bolsillos, ... })
 * @datos      Recibe bolsillos, resúmenes y el total mensual para presentarlos
 * @eventos    Abre el detalle del bolsillo seleccionado
 * @estados    Ninguno
 * @usadoPor   BolsillosContablesCondiciones
 */
import BolsilloCard from "./BolsilloCard";
import BolsillosFijosCard from "./BolsillosFijosCard";
import { esBolsilloFijo } from "../../utils/contabilidadHelpers";

/** Presenta las tarjetas separando los bolsillos fijos de los propios. */
export default function BolsillosContablesCards({ bolsillos, resumenes, resumenMensual, cargandoResumenes, cargandoResumenMensual, errorResumenes, alAbrirDetalle }) {
  const fijos = bolsillos.filter(esBolsilloFijo);
  const propios = bolsillos.filter((bolsillo) => !esBolsilloFijo(bolsillo));

  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {fijos.length > 0 && <BolsillosFijosCard
      fijos={fijos}
      resumenMensual={resumenMensual}
      cargando={cargandoResumenMensual}
      alDetalle={alAbrirDetalle}
    />}
    {propios.map((bolsillo) => <BolsilloCard
      key={bolsillo.idBolsillo}
      bolsillo={bolsillo}
      resumen={resumenes[bolsillo.idBolsillo]}
      cargandoResumen={cargandoResumenes}
      errorResumen={errorResumenes}
      onDetalle={(evento) => alAbrirDetalle(bolsillo, evento)}
    />)}
  </div>;
}
