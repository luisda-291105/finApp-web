/**
 * @uso        Cargar cobros recurrentes inferidos desde movimientos reales
 * @funciones  useSuscripcionesRecurrentes()
 * @datos      DTOs de gastos periódicos del backend
 * @eventos    Consulta al abrir la página de suscripciones
 * @estados    suscripciones, cargando, error
 * @usadoPor   SuscripcionesPage
 */
import { useEffect, useState } from "react";
import { listarSuscripcionesRecurrentes } from "../../contabilidad/services/movimientosService";

export default function useSuscripcionesRecurrentes() {
  const [suscripciones, setSuscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;
    listarSuscripcionesRecurrentes()
      .then((datos) => { if (vigente) setSuscripciones(Array.isArray(datos) ? datos : []); })
      .catch((fallo) => { if (vigente) setError(fallo?.message || "No se pudieron consultar los cobros recurrentes."); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);

  return { suscripciones, cargando, error };
}
