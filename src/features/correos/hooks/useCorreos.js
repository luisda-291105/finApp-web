/**
 * @uso        Estado y acciones de la bandeja por fuentes/cuentas Gmail
 * @funciones  useCorreos()
 * @datos      Carga fuentes y mensajes; refresca cada cinco minutos con sesión activa
 * @eventos    Selección de dirección, cambio de cuenta, actualización y cierre de bandeja
 * @estados    fuentes, tarjetasCorreo, mensajes, categoría, errores y estados de carga
 * @usadoPor   CorreosPage
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { useGmail } from "../../../context/GmailContext";
import { obtenerFuentesPorUsuario } from "../../../services/fuenteServicio";
import { consultarCorreosDeFuente, consultarCorreosDeFuentes } from "../services/correosService";
import { combinarTarjetasCorreo, extraerLista, normalizarDireccion, quitarFuentesDuplicadas } from "../utils/correoHelpers";

const INTERVALO_CONSULTA_MS = 5 * 60 * 1000;

/** Encapsula la sincronización de fuentes, cuentas conectadas y mensajes recibidos. */
export function useCorreos() {
  const { usuario } = useUsuarioActivo();
  const { gmailConectado, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, seleccionarCuentaGmail, conexionCargando, desconectarGmail } = useGmail();
  const [fuentes, setFuentes] = useState([]);
  const [categoria, setCategoria] = useState("TODOS");
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  const [mensajesFuente, setMensajesFuente] = useState([]);
  const [mensajesPorFuente, setMensajesPorFuente] = useState({});
  const [ultimaConsulta, setUltimaConsulta] = useState(null);
  const [cargandoFuentes, setCargandoFuentes] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [error, setError] = useState("");
  const tarjetasCorreo = useMemo(() => combinarTarjetasCorreo(fuentes, cuentasGmail, cuentaSeleccionadaId), [fuentes, cuentasGmail, cuentaSeleccionadaId]);
  const noHayFuentes = !cargandoFuentes && fuentes.length === 0 && cuentasGmail.length === 0;

  const cargarFuentes = useCallback(async () => {
    if (!usuario?.idUsuario) { setFuentes([]); setCargandoFuentes(false); return []; }
    try {
      setCargandoFuentes(true); setError("");
      const lista = extraerLista(await obtenerFuentesPorUsuario(usuario.idUsuario));
      const correos = quitarFuentesDuplicadas(lista.filter((fuente) => fuente.tipo === "CORREO"));
      setFuentes(correos);
      return correos;
    } catch (fallo) {
      setFuentes([]); setError(fallo?.message || "No se pudieron cargar tus fuentes de correo.");
      return [];
    } finally { setCargandoFuentes(false); }
  }, [usuario?.idUsuario]);

  const cargarMensajesFuente = useCallback(async (fuente, cuentaId = cuentaSeleccionadaId) => {
    if (!fuente || !gmailConectado || !cuentaId || fuente.estado === false) return;
    try {
      setCargandoMensajes(true); setError("");
      const recibidos = await consultarCorreosDeFuente(cuentaId, fuente);
      setMensajesPorFuente((actuales) => ({ ...actuales, [fuente.idFuente]: recibidos }));
      setMensajesFuente(recibidos);
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron consultar los mensajes de Gmail.");
      if (/autorización de Gmail venció/i.test(fallo?.message || "")) desconectarGmail(false);
    } finally { setCargandoMensajes(false); }
  }, [gmailConectado, cuentaSeleccionadaId, desconectarGmail]);

  const consultarFuentesRegistradas = useCallback(async (fuentesParaConsultar = []) => {
    if (!gmailConectado || !cuentaSeleccionadaId) return;
    const activas = fuentesParaConsultar.filter((fuente) => fuente.estado !== false);
    const cuentaActual = cuentasGmail.find((cuenta) => String(cuenta.id) === String(cuentaSeleccionadaId));
    const destinosPorDireccion = new Map(activas.map((fuente) => [normalizarDireccion(fuente.contenido), fuente]));
    if (cuentaActual) {
      const claveCuenta = normalizarDireccion(cuentaActual.email);
      if (!destinosPorDireccion.has(claveCuenta)) destinosPorDireccion.set(claveCuenta, { idFuente: `gmail-${cuentaActual.id}`, contenido: cuentaActual.email, estado: true });
    }
    const destinos = [...destinosPorDireccion.values()];
    if (destinos.length === 0) return;
    try {
      setCargandoMensajes(true); setError("");
      const nuevosMensajes = Object.fromEntries(await consultarCorreosDeFuentes(cuentaSeleccionadaId, destinos));
      setMensajesPorFuente((actuales) => ({ ...actuales, ...nuevosMensajes }));
      setUltimaConsulta(new Date());
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron actualizar las fuentes de correo.");
      if (/autorización de Gmail venció/i.test(fallo?.message || "")) desconectarGmail(false);
    } finally { setCargandoMensajes(false); }
  }, [gmailConectado, cuentasGmail, cuentaSeleccionadaId, desconectarGmail]);

  const seleccionarFuente = useCallback(async (fuente) => {
    setFuenteSeleccionada(fuente); setCategoria("TODOS"); setError("");
    const mensajesEnCache = mensajesPorFuente[fuente.idFuente];
    setMensajesFuente(mensajesEnCache || []);
    if (fuente.cuentaGmailId && String(fuente.cuentaGmailId) !== String(cuentaSeleccionadaId)) {
      seleccionarCuentaGmail(fuente.cuentaGmailId);
      return;
    }
    if (!mensajesEnCache && gmailConectado && fuente.estado !== false) await cargarMensajesFuente(fuente, cuentaSeleccionadaId);
  }, [mensajesPorFuente, cuentaSeleccionadaId, seleccionarCuentaGmail, gmailConectado, cargarMensajesFuente]);

  const cerrarBandeja = useCallback(() => { setFuenteSeleccionada(null); setMensajesFuente([]); }, []);
  useEffect(() => {
    if (!fuenteSeleccionada) return;
    const mensajesActualizados = mensajesPorFuente[fuenteSeleccionada.idFuente];
    if (mensajesActualizados) setMensajesFuente(mensajesActualizados);
  }, [fuenteSeleccionada?.idFuente, mensajesPorFuente]);
  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario) { cargarFuentes(); return () => { vigente = false; }; }
    const sincronizar = async () => {
      const fuentesActuales = await cargarFuentes();
      if (!vigente || !gmailConectado || !cuentaSeleccionadaId || (fuentesActuales.length === 0 && cuentasGmail.length === 0)) return;
      await consultarFuentesRegistradas(fuentesActuales);
    };
    sincronizar();
    if (!gmailConectado || !cuentaSeleccionadaId) return () => { vigente = false; };
    const temporizador = window.setInterval(sincronizar, INTERVALO_CONSULTA_MS);
    return () => { vigente = false; window.clearInterval(temporizador); };
  }, [gmailConectado, cuentaSeleccionadaId, usuario?.idUsuario, cuentasGmail, cargarFuentes, consultarFuentesRegistradas]);

  return { usuario, gmailConectado, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, conexionCargando, fuentes, tarjetasCorreo, categoria, setCategoria, fuenteSeleccionada, mensajesFuente, mensajesPorFuente, ultimaConsulta, cargandoFuentes, cargandoMensajes, error, noHayFuentes, seleccionarFuente, consultarFuentesRegistradas, cerrarBandeja };
}
