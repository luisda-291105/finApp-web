/**
 * @uso        Mantiene el historial temporal del chat informativo en memoria
 * @funciones  useAsistenteHistorial()
 * @datos      Mensajes de la conversación actual; no persiste datos del chat
 * @eventos    Ninguno
 * @estados    mensajes (array de turnos), limpiar (fn para borrar el historial)
 * @usadoPor   AsistenteAyudaModal
 */
import { useCallback, useEffect, useState } from "react";

// Elimina el historial de versiones anteriores, que se guardaba en sessionStorage.
const CLAVE_HISTORIAL_ANTERIOR = "finapp_asistente_historial";
const MAX_MENSAJES = 20;

export function limpiarHistorialAsistente() {
  try {
    sessionStorage.removeItem(CLAVE_HISTORIAL_ANTERIOR);
  } catch {
    // El chat sigue siendo temporal aunque el almacenamiento esté bloqueado.
  }
}

export function useAsistenteHistorial() {
  const [mensajes, setMensajesInterno] = useState([]);

  useEffect(() => {
    limpiarHistorialAsistente();
  }, []);

  const setMensajes = useCallback((actualizador) => {
    setMensajesInterno((actuales) => {
      const nuevos = typeof actualizador === "function" ? actualizador(actuales) : actualizador;
      return nuevos.slice(-MAX_MENSAJES);
    });
  }, []);

  const limpiar = useCallback(() => setMensajesInterno([]), []);

  return { mensajes, setMensajes, limpiar };
}
