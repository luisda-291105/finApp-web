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
  const { tokenGmail, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, seleccionarCuentaGmail, conexionCargando, desconectarGmail } = useGmail();
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

  const cargarMensajesFuente = useCallback(async (fuente, token = tokenGmail) => {
    if (!fuente || !token || fuente.estado === false) return;
    try {
      setCargandoMensajes(true); setError("");
      const recibidos = await consultarCorreosDeFuente(token, fuente);
      setMensajesPorFuente((actuales) => ({ ...actuales, [fuente.idFuente]: recibidos }));
      setMensajesFuente(recibidos);
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron consultar los mensajes de Gmail.");
      if (/autorización de Gmail venció/i.test(fallo?.message || "")) desconectarGmail(false);
    } finally { setCargandoMensajes(false); }
  }, [tokenGmail, desconectarGmail]);

  const consultarFuentesRegistradas = useCallback(async () => {
    if (!tokenGmail) return;
    const activas = fuentes.filter((fuente) => fuente.estado !== false);
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
      const nuevosMensajes = Object.fromEntries(await consultarCorreosDeFuentes(tokenGmail, destinos));
      setMensajesPorFuente((actuales) => ({ ...actuales, ...nuevosMensajes }));
      if (fuenteSeleccionada && nuevosMensajes[fuenteSeleccionada.idFuente]) setMensajesFuente(nuevosMensajes[fuenteSeleccionada.idFuente]);
      setUltimaConsulta(new Date());
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron actualizar las fuentes de correo.");
      if (/autorización de Gmail venció/i.test(fallo?.message || "")) desconectarGmail(false);
    } finally { setCargandoMensajes(false); }
  }, [tokenGmail, fuentes, cuentasGmail, cuentaSeleccionadaId, fuenteSeleccionada, desconectarGmail]);

  const seleccionarFuente = useCallback(async (fuente) => {
    setFuenteSeleccionada(fuente); setCategoria("TODOS"); setMensajesFuente([]); setError("");
    if (fuente.cuentaGmailId && String(fuente.cuentaGmailId) !== String(cuentaSeleccionadaId)) {
      seleccionarCuentaGmail(fuente.cuentaGmailId);
      return;
    }
    if (tokenGmail && fuente.estado !== false) await cargarMensajesFuente(fuente, tokenGmail);
  }, [cuentaSeleccionadaId, seleccionarCuentaGmail, tokenGmail, cargarMensajesFuente]);

  const cerrarBandeja = useCallback(() => { setFuenteSeleccionada(null); setMensajesFuente([]); }, []);
  useEffect(() => { cargarFuentes(); }, [cargarFuentes]);
  useEffect(() => {
    if (fuenteSeleccionada && tokenGmail && fuenteSeleccionada.estado !== false) cargarMensajesFuente(fuenteSeleccionada, tokenGmail);
  }, [tokenGmail]);
  useEffect(() => {
    if (!tokenGmail || !usuario?.idUsuario || (fuentes.length === 0 && cuentasGmail.length === 0)) return undefined;
    consultarFuentesRegistradas();
    const temporizador = window.setInterval(() => { cargarFuentes(); consultarFuentesRegistradas(); }, INTERVALO_CONSULTA_MS);
    return () => window.clearInterval(temporizador);
  }, [tokenGmail, usuario?.idUsuario, fuentes, cuentasGmail, cargarFuentes, consultarFuentesRegistradas]);

  return { usuario, tokenGmail, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, conexionCargando, fuentes, tarjetasCorreo, categoria, setCategoria, fuenteSeleccionada, mensajesFuente, mensajesPorFuente, ultimaConsulta, cargandoFuentes, cargandoMensajes, error, noHayFuentes, seleccionarFuente, consultarFuentesRegistradas, cerrarBandeja };
}
