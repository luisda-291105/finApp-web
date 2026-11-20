import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { listarMovimientos } from "../services/movimientosService";
import { claveMesMovimiento, esBolsilloFijo, mesActual } from "../utils/contabilidadHelpers";

const MovimientosBolsilloContext = createContext(null);

const listaDe = (respuesta) =>
  Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];

export function perteneceAlBolsillo(movimiento, bolsillo) {
  const id = (valor) => String(valor ?? "");
  const bolsilloDestino = id(movimiento.idBolsillo) === id(bolsillo.idBolsillo);
  const bolsilloOrigen =
    String(movimiento.origenTipo || "").toUpperCase() === "BOLSILLO" &&
    id(movimiento.origenId) === id(bolsillo.idBolsillo);
  if (bolsilloDestino || bolsilloOrigen) return true;
  return false;
}

export function MovimientosBolsilloProvider({ children, bolsillos = [], revision = 0 }) {
  const [movimientosPorBolsillo, setMovimientosPorBolsillo] = useState({});
  const claveMesActual = useMemo(() => mesActual(), []);

  useEffect(() => {
    let vigente = true;
    const fijos = bolsillos.filter(esBolsilloFijo);
    if (fijos.length === 0) return undefined;
    listarMovimientos(null, "TODOS")
      .then((respuesta) => {
        if (!vigente) return;
        const lista = listaDe(respuesta);
        setMovimientosPorBolsillo((actuales) => ({
          ...actuales,
          ...Object.fromEntries(fijos.map((bolsillo) => [
            bolsillo.idBolsillo,
            lista.filter((movimiento) => perteneceAlBolsillo(movimiento, bolsillo))
              .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || ""))),
          ])),
        }));
      })
      .catch(() => {});
    return () => { vigente = false; };
  }, [bolsillos, revision]);

  const guardarMovimientos = useCallback((idBolsillo, movimientos) => {
    if (!idBolsillo) return;
    setMovimientosPorBolsillo((actuales) => ({
      ...actuales,
      [idBolsillo]: Array.isArray(movimientos) ? movimientos : [],
    }));
  }, []);

  const movimientosDe = useCallback((idBolsillo) =>
    movimientosPorBolsillo[idBolsillo] || [], [movimientosPorBolsillo]);
  const tieneDatosDe = useCallback(
    (idBolsillo) => Object.prototype.hasOwnProperty.call(movimientosPorBolsillo, idBolsillo),
    [movimientosPorBolsillo],
  );
  const totalMesDe = useCallback((idBolsillo) =>
    movimientosDe(idBolsillo)
      .filter((movimiento) => claveMesMovimiento(movimiento.fecha) === claveMesActual)
      .reduce((total, movimiento) => total + (Number(movimiento.monto) || 0), 0),
    [movimientosDe, claveMesActual]);

  const value = useMemo(
    () => ({ guardarMovimientos, movimientosDe, tieneDatosDe, totalMesDe, claveMesActual }),
    [guardarMovimientos, movimientosDe, tieneDatosDe, totalMesDe, claveMesActual],
  );

  return (
    <MovimientosBolsilloContext.Provider value={value}>
      {children}
    </MovimientosBolsilloContext.Provider>
  );
}

export function useMovimientosBolsillo() {
  const contexto = useContext(MovimientosBolsilloContext);
  if (!contexto) {
    throw new Error("useMovimientosBolsillo debe usarse dentro de MovimientosBolsilloProvider");
  }
  return contexto;
}
