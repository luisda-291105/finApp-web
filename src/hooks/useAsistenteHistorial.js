/**
 * @uso        Persiste el historial de mensajes del asistente en sessionStorage
 * @funciones  useAsistenteHistorial()
 * @datos      Lee/escribe en sessionStorage bajo la clave CLAVE_SESION
 * @eventos    Ninguno
 * @estados    mensajes (array de turnos), limpiar (fn para borrar el historial)
 * @usadoPor   AsistenteAyuda
 */

const CLAVE_SESION = "finapp_asistente_historial";
const MAX_MENSAJES = 20;

function cargarHistorial() {
  try {
    const raw = sessionStorage.getItem(CLAVE_SESION);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Solo mensajes con estructura válida
    return parsed
      .filter(
        (m) =>
          m &&
          typeof m.rol === "string" &&
          typeof m.contenido === "string" &&
          ["user", "assistant"].includes(m.rol)
      )
      .slice(-MAX_MENSAJES);
  } catch {
    return [];
  }
}

function guardarHistorial(mensajes) {
  try {
    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify(mensajes.slice(-MAX_MENSAJES))
    );
  } catch {
    // sessionStorage lleno o bloqueado — falla silenciosa
  }
}

export function limpiarHistorialAsistente() {
  try {
    sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // ignore
  }
}

import { useState, useCallback } from "react";

export function useAsistenteHistorial() {
  const [mensajes, setMensajesInterno] = useState(() => cargarHistorial());

  const setMensajes = useCallback((actualizador) => {
    setMensajesInterno((actuales) => {
      const nuevos =
        typeof actualizador === "function" ? actualizador(actuales) : actualizador;
      guardarHistorial(nuevos);
      return nuevos;
    });
  }, []);

  const limpiar = useCallback(() => {
    limpiarHistorialAsistente();
    setMensajesInterno([]);
  }, []);

  return { mensajes, setMensajes, limpiar };
}

