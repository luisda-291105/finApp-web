/**
 * @uso        Proveedor global de alertas/notificaciones laterales (éxito, advertencia, error)
 * @funciones  AlertasProvider({ children }), useAlertas()
 * @datos      Mantiene una pila de alertas activas con id, tipo y mensaje
 * @eventos    mostrarAlerta, cerrarAlerta y limpiarAlertas; Esc cierra la alerta superior
 * @estados    alertas (lista de notificaciones activas)
 * @usadoPor   App y componentes que deben mostrar errores/notificaciones globales
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { NotificacionLateral, PilaNotificacionesLaterales } from "../features/error";

const alertasNoOp = Object.freeze({
  __sinProveedor: true,
  alertas: [],
  mostrarAlerta: () => null,
  cerrarAlerta: () => {},
  limpiarAlertas: () => {},
});

const AlertasContext = createContext(alertasNoOp);

let contadorId = 0;
function crearId() {
  contadorId += 1;
  return `alerta-${Date.now()}-${contadorId}`;
}

/** Provee y renderiza la pila global de alertas en el lado derecho superior. */
export function AlertasProvider({ children }) {
  const [alertas, setAlertas] = useState([]);
  const temporizadoresRef = useRef(new Map());

  const limpiarTemporizador = useCallback((id) => {
    const temporizador = temporizadoresRef.current.get(id);
    if (temporizador) {
      window.clearTimeout(temporizador);
      temporizadoresRef.current.delete(id);
    }
  }, []);

  const cerrarAlerta = useCallback((id) => {
    limpiarTemporizador(id);
    setAlertas((actuales) => {
      const alerta = actuales.find((item) => item.id === id);
      alerta?.alCerrar?.();
      return actuales.filter((item) => item.id !== id);
    });
  }, [limpiarTemporizador]);

  const mostrarAlerta = useCallback((mensaje, opciones = {}) => {
    const texto = typeof mensaje === "string" ? mensaje : mensaje?.message || String(mensaje || "");
    if (!texto) return null;
    const id = opciones.id || crearId();
    const alerta = {
      id,
      tipo: opciones.tipo || "error",
      mensaje: texto,
      alCerrar: opciones.alCerrar,
    };
    setAlertas((actuales) => {
      const sinDuplicada = opciones.id ? actuales.filter((item) => item.id !== opciones.id) : actuales;
      return [...sinDuplicada, alerta];
    });
    limpiarTemporizador(id);
    if (Number.isFinite(opciones.duracionMs) && opciones.duracionMs > 0) {
      const temporizador = window.setTimeout(() => cerrarAlerta(id), opciones.duracionMs);
      temporizadoresRef.current.set(id, temporizador);
    }
    return id;
  }, [cerrarAlerta, limpiarTemporizador]);

  const limpiarAlertas = useCallback(() => {
    temporizadoresRef.current.forEach((temporizador) => window.clearTimeout(temporizador));
    temporizadoresRef.current.clear();
    setAlertas([]);
  }, []);

  const valor = useMemo(
    () => ({ alertas, mostrarAlerta, cerrarAlerta, limpiarAlertas }),
    [alertas, mostrarAlerta, cerrarAlerta, limpiarAlertas],
  );

  return (
    <AlertasContext.Provider value={valor}>
      {children}
      <PilaNotificacionesLaterales>
        {alertas.map((alerta, indice) => (
          <NotificacionLateral
            key={alerta.id}
            tipo={alerta.tipo}
            mensaje={alerta.mensaje}
            alCerrar={() => cerrarAlerta(alerta.id)}
            cerrarConEsc={indice === alertas.length - 1}
          />
        ))}
      </PilaNotificacionesLaterales>
    </AlertasContext.Provider>
  );
}

/** Hook para mostrar y cerrar alertas globales laterales. */
export function useAlertas() {
  return useContext(AlertasContext);
}
