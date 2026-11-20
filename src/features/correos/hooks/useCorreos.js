/**
 * @uso        Estado y acciones de la bandeja por fuentes/cuentas Gmail
 * @funciones  useCorreos()
 * @datos      Carga fuentes y mensajes; refresca cada cinco minutos y consulta el estado de la cola cada 15 s
 * @eventos    Selección de dirección, cambio de cuenta, actualización, mover a la papelera, sincronización tras restaurar y cierre de bandeja
 * @estados    fuentes, tarjetasCorreo, mensajes, categoría, estadoCorreos, errores y estados de carga
 * @usadoPor   CorreosPage
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { useGmail } from "../../../context/GmailContext";
import { obtenerFuentesPorUsuario } from "../../../services/fuenteServicio";
import { invalidarCacheConsultasGmail } from "../../../services/gmailServicio";
import {
  consultarCorreosDeFuente,
  consultarCorreosDeFuentes,
  consultarEstadoCorreos,
} from "../services/correosService";
import { moverCorreoAPapelera as moverCorreoAPapeleraEnGmail } from "../services/papeleraService";
import {
  agruparFuentesPorCuenta,
  combinarTarjetasCorreo,
  extraerLista,
  normalizarDireccion,
  quitarFuentesDuplicadas,
} from "../utils/correoHelpers";

const INTERVALO_CONSULTA_MS = 5 * 60 * 1000;
const INTERVALO_ESTADO_MS = 15 * 1000;

/** Encapsula la sincronización de fuentes, cuentas conectadas y mensajes recibidos. */
export function useCorreos() {
  const { usuario } = useUsuarioActivo();
  const {
    gmailConectado,
    cuentaGmail,
    cuentasGmail,
    cuentaSeleccionadaId,
    seleccionarCuentaGmail,
    conexionCargando,
    desconectarGmail,
  } = useGmail();
  const [fuentes, setFuentes] = useState([]);
  const [categoria, setCategoria] = useState("TODOS");
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  const [mensajesFuente, setMensajesFuente] = useState([]);
  const [mensajesPorFuente, setMensajesPorFuente] = useState({});
  const [ultimaConsulta, setUltimaConsulta] = useState(null);
  const [cargandoFuentes, setCargandoFuentes] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [error, setError] = useState("");
  const [estadosCuenta, setEstadosCuenta] = useState({});
  const referenciaColaRef = useRef(null);
  const consultandoEstadoRef = useRef(false);
  const tarjetasCorreo = useMemo(
    () => combinarTarjetasCorreo(fuentes, cuentasGmail, cuentaSeleccionadaId),
    [fuentes, cuentasGmail, cuentaSeleccionadaId],
  );
  const noHayFuentes =
    !cargandoFuentes && fuentes.length === 0 && cuentasGmail.length === 0;
  const estadoCorreos = useMemo(() => {
    const valores = Object.values(estadosCuenta).filter(Boolean);
    const enEspera = valores.reduce(
      (total, actual) => total + (Number(actual.en_espera) || 0),
      0,
    );
    const procesando = valores.reduce(
      (total, actual) => total + (Number(actual.procesando) || 0),
      0,
    );
    const errores = valores.reduce(
      (total, actual) => total + (Number(actual.errores) || 0),
      0,
    );
    const ultimaSincronizacion =
      valores
        .map((actual) => actual.ultima_sincronizacion)
        .filter(Boolean)
        .sort()
        .pop() || "";
    const ultimoError =
      valores
        .map((actual) => actual.ultimo_error)
        .filter(Boolean)
        .pop() || "";
    return {
      enEspera,
      procesando,
      errores,
      actualizando: enEspera + procesando > 0,
      ultimaSincronizacion,
      ultimoError,
    };
  }, [estadosCuenta]);

  const cargarFuentes = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setFuentes([]);
      setCargandoFuentes(false);
      return [];
    }
    try {
      setCargandoFuentes(true);
      setError("");
      const lista = extraerLista(
        await obtenerFuentesPorUsuario(usuario.idUsuario),
      );
      const correos = quitarFuentesDuplicadas(
        lista.filter((fuente) => fuente.tipo === "CORREO"),
      );
      setFuentes(correos);
      return correos;
    } catch (fallo) {
      setFuentes([]);
      setError(
        fallo?.message || "No se pudieron cargar tus fuentes de correo.",
      );
      return [];
    } finally {
      setCargandoFuentes(false);
    }
  }, [usuario?.idUsuario]);

  const cargarMensajesFuente = useCallback(
    async (fuente, cuentaId = cuentaSeleccionadaId) => {
      if (!fuente || !gmailConectado || !cuentaId || fuente.estado === false)
        return;
      try {
        setCargandoMensajes(true);
        setError("");
        const recibidos = await consultarCorreosDeFuente(cuentaId, fuente);
        setMensajesPorFuente((actuales) => ({
          ...actuales,
          [fuente.idFuente]: recibidos,
        }));
        setMensajesFuente(recibidos);
      } catch (fallo) {
        setError(
          fallo?.message || "No se pudieron consultar los mensajes de Gmail.",
        );
        if (/autorización de Gmail venció/i.test(fallo?.message || ""))
          desconectarGmail(false);
      } finally {
        setCargandoMensajes(false);
      }
    },
    [gmailConectado, cuentaSeleccionadaId, desconectarGmail],
  );

  const consultarFuentesRegistradas = useCallback(
    async (fuentesParaConsultar = [], cuentaId = cuentaSeleccionadaId) => {
      if (!gmailConectado || !cuentaId) return;
      const activas = fuentesParaConsultar.filter(
        (fuente) => fuente.estado !== false,
      );
      const cuentaActual = cuentasGmail.find(
        (cuenta) => String(cuenta.id) === String(cuentaId),
      );
      const destinosPorDireccion = new Map(
        activas.map((fuente) => [
          normalizarDireccion(fuente.contenido),
          fuente,
        ]),
      );
      if (cuentaActual) {
        const claveCuenta = normalizarDireccion(cuentaActual.email);
        if (!destinosPorDireccion.has(claveCuenta))
          destinosPorDireccion.set(claveCuenta, {
            idFuente: `gmail-${cuentaActual.id}`,
            contenido: cuentaActual.email,
            estado: true,
          });
      }
      const destinos = [...destinosPorDireccion.values()];
      if (destinos.length === 0) return;
      try {
        setCargandoMensajes(true);
        setError("");
        const pares = await consultarCorreosDeFuentes(cuentaId, destinos);
        const nuevosMensajes = Object.fromEntries(
          pares.map(([idFuente, mensajes]) => [
            idFuente,
            mensajes.map((correo) => ({ ...correo, cuentaGmailId: cuentaId })),
          ]),
        );
        setMensajesPorFuente((actuales) => ({
          ...actuales,
          ...nuevosMensajes,
        }));
        setUltimaConsulta(new Date());
      } catch (fallo) {
        setError(
          fallo?.message || "No se pudieron actualizar las fuentes de correo.",
        );
        if (/autorización de Gmail venció/i.test(fallo?.message || ""))
          desconectarGmail(false);
      } finally {
        setCargandoMensajes(false);
      }
    },
    [gmailConectado, cuentasGmail, cuentaSeleccionadaId, desconectarGmail],
  );

  /**
   * Consulta cada cuenta Gmail solo con las fuentes que le pertenecen. Evita que el
   * resultado de una cuenta sobrescriba `mensajesPorFuente` de las demás con listas
   * vacías (el backend devuelve los mensajes cacheados de la cuenta consultada).
   */
  const consultarTodasLasCuentas = useCallback(
    async (fuentesParaConsultar = []) => {
      if (!gmailConectado || cuentasGmail.length === 0) return;
      const grupos = agruparFuentesPorCuenta(
        fuentesParaConsultar,
        cuentasGmail,
        cuentaSeleccionadaId,
      );
      for (const grupo of grupos) {
        await consultarFuentesRegistradas(grupo.fuentes, grupo.cuentaId);
      }
    },
    [
      gmailConectado,
      cuentasGmail,
      cuentaSeleccionadaId,
      consultarFuentesRegistradas,
    ],
  );

  /**
   * Consulta el estado de la cola de cada cuenta. Cuando la cola drena o cambia la
   * última sincronización, invalida la caché y recarga los mensajes de inmediato.
   */
  const consultarEstadosCorreos = useCallback(async () => {
    if (consultandoEstadoRef.current) return;
    consultandoEstadoRef.current = true;
    try {
      if (!gmailConectado || cuentasGmail.length === 0) {
        setEstadosCuenta({});
        referenciaColaRef.current = null;
        return;
      }
      const pares = await Promise.all(
        cuentasGmail.map(async (cuenta) => {
          if (!cuenta?.id) return null;
          try {
            return [cuenta.id, await consultarEstadoCorreos(cuenta.id)];
          } catch {
            return null;
          }
        }),
      );
      const porCuenta = Object.fromEntries(pares.filter(Boolean));
      setEstadosCuenta(porCuenta);
      const valores = Object.values(porCuenta);
      const pendientes = valores.reduce(
        (total, actual) =>
          total +
          (Number(actual?.en_espera) || 0) +
          (Number(actual?.procesando) || 0),
        0,
      );
      const sincronizaciones = Object.fromEntries(
        Object.entries(porCuenta).map(([id, actual]) => [
          id,
          actual?.ultima_sincronizacion || "",
        ]),
      );
      const previa = referenciaColaRef.current;
      referenciaColaRef.current = { pendientes, sincronizaciones };
      if (!previa) return;
      const drenó = previa.pendientes > 0 && pendientes === 0;
      const sincronizó = Object.entries(sincronizaciones).some(
        ([id, valor]) =>
          Boolean(valor) && valor !== (previa.sincronizaciones?.[id] || ""),
      );
      if (!drenó && !sincronizó) return;
      invalidarCacheConsultasGmail();
      const fuentesActuales = await cargarFuentes();
      await consultarTodasLasCuentas(fuentesActuales);
    } finally {
      consultandoEstadoRef.current = false;
    }
  }, [gmailConectado, cuentasGmail, cargarFuentes, consultarTodasLasCuentas]);

  useEffect(() => {
    if (!gmailConectado || cuentasGmail.length === 0) {
      setEstadosCuenta({});
      referenciaColaRef.current = null;
      return undefined;
    }
    const consultar = () => {
      consultarEstadosCorreos();
    };
    consultar();
    const temporizador = window.setInterval(consultar, INTERVALO_ESTADO_MS);
    return () => window.clearInterval(temporizador);
  }, [gmailConectado, cuentasGmail, consultarEstadosCorreos]);

  const seleccionarFuente = useCallback(
    async (fuente) => {
      setFuenteSeleccionada(fuente);
      setCategoria("TODOS");
      setError("");
      const mensajesEnCache = mensajesPorFuente[fuente.idFuente];
      setMensajesFuente(mensajesEnCache || []);
      const cuentaDestino = fuente.cuentaGmailId || cuentaSeleccionadaId;
      if (
        fuente.cuentaGmailId &&
        String(fuente.cuentaGmailId) !== String(cuentaSeleccionadaId)
      ) {
        seleccionarCuentaGmail(fuente.cuentaGmailId);
      }
      if (
        !mensajesEnCache &&
        gmailConectado &&
        fuente.estado !== false &&
        cuentaDestino
      ) {
        await cargarMensajesFuente(fuente, cuentaDestino);
      }
    },
    [
      mensajesPorFuente,
      cuentaSeleccionadaId,
      seleccionarCuentaGmail,
      gmailConectado,
      cargarMensajesFuente,
    ],
  );

  const cerrarBandeja = useCallback(() => {
    setFuenteSeleccionada(null);
    setMensajesFuente([]);
  }, []);

  /** Tras restaurar en Gmail, invalida la caché y vuelve a consultar la bandeja de inmediato. */
  const sincronizarTrasRestaurar = useCallback(async () => {
    if (!gmailConectado || cuentasGmail.length === 0) return;
    invalidarCacheConsultasGmail();
    const fuentesActuales = await cargarFuentes();
    await consultarTodasLasCuentas(fuentesActuales);
  }, [gmailConectado, cuentasGmail, cargarFuentes, consultarTodasLasCuentas]);

  /**
   * Mueve un correo a la papelera con reflejo optimista: desaparece de la bandeja
   * de inmediato y se revierte si Gmail rechaza el movimiento. Vuelve a lanzar el
   * error para que el detalle muestre el motivo y no se cierre.
   */
  const moverCorreoAPapelera = useCallback(
    async ({ id, cuentaId } = {}) => {
      const cuentaDestino = cuentaId || cuentaSeleccionadaId;
      if (!id) throw new Error("Falta el correo para mover a la papelera.");
      if (!cuentaDestino)
        throw new Error("Selecciona una cuenta Gmail para mover el correo.");
      const respaldoPorFuente = mensajesPorFuente;
      const respaldoFuente = mensajesFuente;
      setMensajesPorFuente((actuales) =>
        Object.fromEntries(
          Object.entries(actuales).map(([clave, lista]) => [
            clave,
            lista.filter((correo) => correo.id !== id),
          ]),
        ),
      );
      setMensajesFuente((actuales) =>
        actuales.filter((correo) => correo.id !== id),
      );
      try {
        await moverCorreoAPapeleraEnGmail(cuentaDestino, id);
        invalidarCacheConsultasGmail();
        return { id, cuentaId: cuentaDestino };
      } catch (fallo) {
        setMensajesPorFuente(respaldoPorFuente);
        setMensajesFuente(respaldoFuente);
        throw fallo;
      }
    },
    [mensajesPorFuente, mensajesFuente, cuentaSeleccionadaId],
  );
  useEffect(() => {
    if (!fuenteSeleccionada) return;
    const mensajesActualizados = mensajesPorFuente[fuenteSeleccionada.idFuente];
    if (mensajesActualizados) setMensajesFuente(mensajesActualizados);
  }, [fuenteSeleccionada?.idFuente, mensajesPorFuente]);
  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario) {
      cargarFuentes();
      return () => {
        vigente = false;
      };
    }
    const sincronizar = async () => {
      const fuentesActuales = await cargarFuentes();
      if (!vigente || !gmailConectado || cuentasGmail.length === 0) return;
      await consultarTodasLasCuentas(fuentesActuales);
    };
    sincronizar();
    if (!gmailConectado || cuentasGmail.length === 0)
      return () => {
        vigente = false;
      };
    const temporizador = window.setInterval(sincronizar, INTERVALO_CONSULTA_MS);
    return () => {
      vigente = false;
      window.clearInterval(temporizador);
    };
  }, [
    gmailConectado,
    usuario?.idUsuario,
    cuentasGmail,
    cargarFuentes,
    consultarTodasLasCuentas,
  ]);

  return {
    usuario,
    gmailConectado,
    cuentaGmail,
    cuentasGmail,
    cuentaSeleccionadaId,
    conexionCargando,
    fuentes,
    tarjetasCorreo,
    categoria,
    setCategoria,
    fuenteSeleccionada,
    mensajesFuente,
    mensajesPorFuente,
    ultimaConsulta,
    estadoCorreos,
    cargandoFuentes,
    cargandoMensajes,
    error,
    noHayFuentes,
    seleccionarFuente,
    consultarFuentesRegistradas,
    consultarTodasLasCuentas,
    sincronizarTrasRestaurar,
    moverCorreoAPapelera,
    cerrarBandeja,
  };
}
