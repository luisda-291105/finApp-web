/**
 * @uso        Mantiene las sesiones del asistente personal en el navegador
 * @funciones  useAsistenteHistorial(idUsuario)
 * @datos      Guarda sesiones locales por usuario, con un límite de mensajes y sesiones
 * @eventos    Crear, abrir, actualizar y cerrar sesiones
 * @estados    sesiones, sesionActualId, mensajes
 * @usadoPor   AsistenteAyudaModal
 */
import { useCallback, useEffect, useRef, useState } from "react";

const CLAVE_HISTORIAL_ANTERIOR = "finapp_asistente_historial";
const MAX_MENSAJES = 20;
const MAX_SESIONES = 30;
const LIMITE_TITULO = 72;

function claveSesiones(idUsuario) {
  return `finapp_asistente_sesiones_${idUsuario}`;
}

function crearId() {
  return globalThis.crypto?.randomUUID?.() || `sesion-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function leerSesiones(idUsuario) {
  if (!idUsuario) return [];
  try {
    const datos = JSON.parse(localStorage.getItem(claveSesiones(idUsuario)) || "[]");
    return Array.isArray(datos) ? datos.slice(0, MAX_SESIONES) : [];
  } catch {
    return [];
  }
}

function limpiarMensaje(mensaje) {
  return {
    rol: mensaje.rol,
    contenido: String(mensaje.contenido || "").slice(0, 2000),
    ...(mensaje.fuentes ? { fuentes: mensaje.fuentes } : {}),
    ...(mensaje.aviso ? { aviso: mensaje.aviso } : {}),
    // Los tokens de confirmación son temporales y no se guardan en el historial.
  };
}

function titular(mensajes) {
  const texto = mensajes.find((mensaje) => mensaje.rol === "user")?.contenido?.trim() || "Nueva conversación";
  return texto.length > LIMITE_TITULO ? `${texto.slice(0, LIMITE_TITULO - 1)}…` : texto;
}

export function limpiarHistorialAsistente() {
  try { sessionStorage.removeItem(CLAVE_HISTORIAL_ANTERIOR); } catch { /* almacenamiento opcional */ }
}

export function useAsistenteHistorial(idUsuario) {
  const usuarioId = idUsuario ? String(idUsuario) : "";
  const [estadoSesiones, setEstadoSesiones] = useState(() => ({ usuarioId, sesiones: leerSesiones(usuarioId) }));
  const [mensajes, setMensajesInterno] = useState([]);
  const [sesionActualId, setSesionActualId] = useState(null);
  const mensajesRef = useRef([]);
  const sesionActualRef = useRef(null);

  useEffect(() => { limpiarHistorialAsistente(); }, []);

  useEffect(() => {
    mensajesRef.current = [];
    sesionActualRef.current = null;
    setMensajesInterno([]);
    setSesionActualId(null);
    setEstadoSesiones({ usuarioId, sesiones: leerSesiones(usuarioId) });
  }, [usuarioId]);

  useEffect(() => {
    if (!usuarioId || estadoSesiones.usuarioId !== usuarioId) return;
    try { localStorage.setItem(claveSesiones(usuarioId), JSON.stringify(estadoSesiones.sesiones.slice(0, MAX_SESIONES))); }
    catch { /* La conversación se mantiene activa aunque el almacenamiento esté bloqueado o lleno. */ }
  }, [estadoSesiones, usuarioId]);

  const sesiones = estadoSesiones.usuarioId === usuarioId ? estadoSesiones.sesiones : [];

  const setMensajes = useCallback((actualizador) => {
    const actuales = mensajesRef.current;
    const nuevos = (typeof actualizador === "function" ? actualizador(actuales) : actualizador).slice(-MAX_MENSAJES);
    const mensajesGuardados = nuevos.map(limpiarMensaje);
    mensajesRef.current = nuevos;
    setMensajesInterno(nuevos);
    if (!usuarioId || nuevos.length === 0) return;

    const id = sesionActualRef.current || crearId();
    sesionActualRef.current = id;
    setSesionActualId(id);
    setEstadoSesiones((estado) => {
      if (estado.usuarioId !== usuarioId) return estado;
      const sesion = {
        id,
        titulo: titular(nuevos),
        actualizadaEn: new Date().toISOString(),
        mensajes: mensajesGuardados,
      };
      return {
        ...estado,
        sesiones: [sesion, ...estado.sesiones.filter((item) => item.id !== id)].slice(0, MAX_SESIONES),
      };
    });
  }, [usuarioId]);

  const nuevaSesion = useCallback(() => {
    mensajesRef.current = [];
    sesionActualRef.current = null;
    setMensajesInterno([]);
    setSesionActualId(null);
  }, []);

  const abrirSesion = useCallback((id) => {
    const sesion = sesiones.find((item) => item.id === id);
    if (!sesion) return false;
    const nuevos = Array.isArray(sesion.mensajes) ? sesion.mensajes.slice(-MAX_MENSAJES).map(limpiarMensaje) : [];
    mensajesRef.current = nuevos;
    sesionActualRef.current = sesion.id;
    setMensajesInterno(nuevos);
    setSesionActualId(sesion.id);
    return true;
  }, [sesiones]);

  return { mensajes, setMensajes, sesiones, sesionActualId, nuevaSesion, abrirSesion };
}
