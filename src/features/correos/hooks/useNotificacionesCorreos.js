/**
 * @uso        Gestionar notificaciones temporales y bandeja de mensajes de movimientos Gmail
 * @funciones  useNotificacionesCorreos({ gmailConectado, cuentaSeleccionadaId, cuentaGmail, mensajes })
 * @datos      Consulta alertas Gmail, sincroniza sugerencias financieras y persiste notificaciones en localStorage
 * @eventos    Polling periódico de alertas, llegada de nuevas notificaciones y marcado como visto
 * @estados    notificaciones, toast, sincronizando, errorSincronizacion
 * @usadoPor   CorreosPage
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { guardarCorreoPorRevisar, listarCorreosImportados } from "../../contabilidad/services/movimientosService";
import {
  confirmarNotificacionesMovimientosGmail,
  listarNotificacionesMovimientosGmail,
  obtenerContenidoCorreosFinancierosGmail,
} from "../../../services/gmailServicio";
import { esCandidatoFinanciero, extraerMovimientoSugerido } from "../utils/correoFinancieroHelpers";

const CLAVE_BANDEJA = "finapp_bandeja_notificaciones_correos";
const LIMITE_BANDEJA = 100;

function leerBandeja() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_BANDEJA) || "[]");
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardarBandeja(notificaciones) {
  try {
    localStorage.setItem(CLAVE_BANDEJA, JSON.stringify(notificaciones.slice(0, LIMITE_BANDEJA)));
  } catch {
    // Sin almacenamiento disponible: se mantiene solo en memoria.
  }
}

export function useNotificacionesCorreos({ gmailConectado, cuentaSeleccionadaId, cuentaGmail, mensajes = [] }) {
  const [notificaciones, setNotificaciones] = useState(() => leerBandeja());
  const [toast, setToast] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [errorSincronizacion, setErrorSincronizacion] = useState("");
  const idsConocidosRef = useRef(new Set(leerBandeja().map((n) => n.id)));
  const toastTimerRef = useRef(null);

  const agregarNotificaciones = useCallback((nuevas, origen = "gmail") => {
    if (!nuevas.length) return;
    setNotificaciones((actuales) => {
      const existentes = new Set(actuales.map((n) => n.id));
      const entrantes = nuevas
        .filter((n) => n && n.id && !existentes.has(n.id))
        .map((n) => ({
          id: n.id,
          asunto: n.asunto || n.mensaje || "Notificación Gmail",
          mensaje: n.mensaje || "",
          fecha: n.fecha || new Date().toISOString(),
          leida: false,
          origen,
          cuentaGmail: cuentaGmail || "",
        }));
      if (!entrantes.length) return actuales;
      entrantes.forEach((n) => idsConocidosRef.current.add(n.id));
      const actualizadas = [...entrantes, ...actuales].slice(0, LIMITE_BANDEJA);
      guardarBandeja(actualizadas);
      const textoToast =
        entrantes.length === 1
          ? entrantes[0].asunto
          : `${entrantes.length} nuevas notificaciones de movimientos Gmail`;
      window.clearTimeout(toastTimerRef.current);
      setToast({ mensaje: textoToast, cantidad: entrantes.length });
      toastTimerRef.current = window.setTimeout(() => setToast(null), 5000);
      return actualizadas;
    });
  }, [cuentaGmail]);

  const cerrarToast = useCallback(() => {
    window.clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  // Polling de alertas/notificaciones automáticas de movimientos Gmail
  useEffect(() => {
    if (!gmailConectado) return undefined;
    let vigente = true;
    const consultarAlertas = async () => {
      try {
        const respuesta = await listarNotificacionesMovimientosGmail();
        if (!vigente) return;
        const alertas = Array.isArray(respuesta) ? respuesta : [];
        const nuevas = alertas.filter((a) => a?.id && !idsConocidosRef.current.has(a.id));
        if (nuevas.length) agregarNotificaciones(nuevas, "movimiento-gmail");
      } catch {
        // Error silencioso en polling; la bandeja conserva lo ya guardado.
      }
    };
    consultarAlertas();
    const temporizador = window.setInterval(consultarAlertas, 30_000);
    return () => {
      vigente = false;
      window.clearInterval(temporizador);
    };
  }, [gmailConectado, agregarNotificaciones]);

  // Sincronización de sugerencias financieras (lógica preservada sin UI de tarjeta)
  useEffect(() => {
    if (!gmailConectado || !cuentaSeleccionadaId) return undefined;
    let vigente = true;
    const sincronizar = async () => {
      setSincronizando(true);
      setErrorSincronizacion("");
      try {
        const respuestaCorreos = await obtenerContenidoCorreosFinancierosGmail(
          cuentaSeleccionadaId,
          mensajes
            .filter(esCandidatoFinanciero)
            .slice(0, 5)
            .map((correo) => ({ ...correo, cuentaGmailId: cuentaSeleccionadaId })),
        );
        if (!vigente) return;
        const cuentas = new Map(
          (respuestaCorreos || []).map((correo) => [correo.id, { ...correo, cuentaGmailId: cuentaSeleccionadaId }]),
        );
        const candidatas = [...cuentas.values()].map(extraerMovimientoSugerido).filter(Boolean);
        if (!candidatas.length) return;
        const importados = await listarCorreosImportados(candidatas.map((item) => item.origenId));
        const origenesImportados = new Set(Array.isArray(importados) ? importados : importados?.data || []);
        let guardados = 0;
        for (const item of candidatas.filter((candidata) => !origenesImportados.has(candidata.origenId))) {
          try {
            await guardarCorreoPorRevisar({
              idBolsillo: null,
              tipo: item.tipo,
              fecha: item.fecha,
              monto: item.monto,
              categoria: item.categoria,
              concepto: item.concepto,
              origenTipo: "GMAIL",
              origenId: item.origenId,
              origenNombre: item.remitente,
            });
            guardados += 1;
          } catch {
            // Continúa con el resto de candidatos.
          }
        }
        if (vigente && guardados > 0) {
          agregarNotificaciones(
            [{
              id: `sync-${cuentaSeleccionadaId}-${Date.now()}`,
              asunto: `${guardados} movimiento${guardados === 1 ? "" : "s"} enviado${guardados === 1 ? "" : "s"} a Contabilidad · Por revisar`,
              fecha: new Date().toISOString(),
            }],
            "sincronizacion",
          );
        }
      } catch (fallo) {
        if (vigente) setErrorSincronizacion(fallo?.message || "No se pudo analizar Gmail.");
      } finally {
        if (vigente) setSincronizando(false);
      }
    };
    sincronizar();
    return () => {
      vigente = false;
    };
  }, [gmailConectado, cuentaGmail, cuentaSeleccionadaId, mensajes, agregarNotificaciones]);

  const marcarTodasLeidas = useCallback(async () => {
    const idsGmail = notificaciones
      .filter((n) => !n.leida && n.origen === "movimiento-gmail" && !String(n.id).startsWith("sync-"))
      .map((n) => n.id);
    if (idsGmail.length) {
      try {
        await confirmarNotificacionesMovimientosGmail(idsGmail);
      } catch {
        // Se marca localmente aunque falle la confirmación remota.
      }
    }
    setNotificaciones((actuales) => {
      const actualizadas = actuales.map((n) => ({ ...n, leida: true }));
      guardarBandeja(actualizadas);
      return actualizadas;
    });
  }, [notificaciones]);

  const limpiarBandeja = useCallback(() => {
    setNotificaciones([]);
    guardarBandeja([]);
  }, []);

  const noLeidas = useMemo(() => notificaciones.filter((n) => !n.leida).length, [notificaciones]);

  return {
    notificaciones,
    noLeidas,
    toast,
    cerrarToast,
    marcarTodasLeidas,
    limpiarBandeja,
    sincronizando,
    errorSincronizacion,
  };
}
