import { useRef, useState } from "react";
import { FILTROS_SUSCRIPCIONES, SUSCRIPCIONES_DEMO, filtrarSuscripciones, resumirSuscripciones } from "../utils/suscripcionesData";

/** Estado local de demostración para filtros y pausa/activación. */
export default function useSuscripciones() {
  const [suscripciones, setSuscripciones] = useState(SUSCRIPCIONES_DEMO);
  const [filtro, setFiltro] = useState("todas");
  const [suscripcionDetalle, setSuscripcionDetalle] = useState(null);
  const detalleTriggerRef = useRef(null);
  const visibles = filtrarSuscripciones(suscripciones, filtro);
  const resumen = resumirSuscripciones(suscripciones);

  const alternarEstado = (id) => {
    setSuscripciones((actuales) => actuales.map((item) => item.id === id ? { ...item, activa: !item.activa } : item));
  };

  const abrirDetalle = (suscripcion, evento) => {
    detalleTriggerRef.current = evento?.currentTarget || null;
    setSuscripcionDetalle(suscripcion);
  };

  return {
    suscripciones, filtro, setFiltro, visibles, ...resumen,
    filtros: FILTROS_SUSCRIPCIONES, alternarEstado, abrirDetalle,
    suscripcionDetalle, setSuscripcionDetalle, detalleTriggerRef,
  };
}
