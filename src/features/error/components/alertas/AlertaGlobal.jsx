/**
 * @uso        Puente declarativo para mostrar una alerta en la pila lateral global
 * @funciones  AlertaGlobal({ tipo, mensaje, idBase })
 * @datos      Mensaje y tipo; se sincroniza con el proveedor global de alertas
 * @eventos    Registra/cierra la alerta según el mensaje recibido
 * @estados    Ninguno propio; delega en AlertasContext
 * @usadoPor   Componentes que renderizan errores/avisos como estado y deben mostrarlos a la derecha
 */
import { useEffect, useRef } from "react";
import { useAlertas } from "../../../../context/AlertasContext";

/** Muestra una alerta global lateral mientras exista mensaje. */
export default function AlertaGlobal({
  tipo = "error",
  mensaje,
  idBase,
  alCerrar,
  duracionMs,
}) {
  const contextoAlertas = useAlertas();
  const { mostrarAlerta, cerrarAlerta, __sinProveedor } = contextoAlertas;
  const idRef = useRef(
    idBase || `alerta-global-${Math.random().toString(36).slice(2)}`,
  );

  useEffect(() => {
    const id = idRef.current;
    const texto = typeof mensaje === "string" ? mensaje : "";
    if (texto) {
      mostrarAlerta(texto, { tipo, id, alCerrar, duracionMs });
    } else {
      cerrarAlerta(id);
    }
    return () => cerrarAlerta(id);
  }, [mensaje, tipo, mostrarAlerta, cerrarAlerta, alCerrar, duracionMs]);

  const texto = typeof mensaje === "string" ? mensaje : "";
  if (__sinProveedor && texto) {
    return <div role="alert">{texto}</div>;
  }
  return null;
}
