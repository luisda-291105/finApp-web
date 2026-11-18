/**
 * @uso        Cargar los cobros recurrentes del usuario (suscripciones con monto y fecha de cobro y pagos repetidos de Contabilidad)
 * @funciones  useSuscripcionesRecurrentes()
 * @datos      DTOs de cobros recurrentes del backend
 * @eventos    Consulta al abrir la página de suscripciones
 * @estados    suscripciones, cargando, error
 * @usadoPor   SuscripcionesPage
 */
import { useEffect, useState } from "react";
import { listarSuscripcionesRecurrentes } from "../../contabilidad/services/movimientosService";
import {
  listarCobrosRecurrentes,
  normalizarCobroRecurrente,
} from "../services/suscripcionesServicio";

/** Compara nombres sin acentos ni signos para no repetir el mismo servicio. */
function claveNombre(nombre) {
  return String(nombre ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export default function useSuscripcionesRecurrentes() {
  const [suscripciones, setSuscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;
    let desdeSuscripciones = [];
    let desdeMovimientos = [];

    // Cada fuente se aplica apenas llega: el resumen no espera a la más lenta.
    const aplicar = () => {
      if (!vigente) return;
      // La suscripción manda: los pagos repetidos con el mismo nombre no se suman dos veces.
      const yaRegistrados = new Set(
        desdeSuscripciones.map((item) => claveNombre(item.nombre)),
      );
      setSuscripciones([
        ...desdeSuscripciones,
        ...desdeMovimientos.filter(
          (item) => !yaRegistrados.has(claveNombre(item.nombre)),
        ),
      ]);
    };

    const peticiones = [
      Promise.resolve()
        .then(() => listarCobrosRecurrentes())
        .then((datos) => {
          desdeSuscripciones = (Array.isArray(datos) ? datos : []).map(
            normalizarCobroRecurrente,
          );
          aplicar();
        }),
      Promise.resolve()
        .then(() => listarSuscripcionesRecurrentes())
        .then((datos) => {
          desdeMovimientos = (Array.isArray(datos) ? datos : []).map(
            normalizarCobroRecurrente,
          );
          aplicar();
        }),
    ];

    Promise.allSettled(peticiones)
      .then((resultados) => {
        const fallos = resultados
          .filter((resultado) => resultado.status === "rejected")
          .map((resultado) => resultado.reason?.message)
          .filter(Boolean);
        if (fallos.length && vigente) setError(fallos.join(" · "));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  return { suscripciones, cargando, error };
}
