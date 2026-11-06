/**
 * @uso        Página de bandeja Gmail asociada a las fuentes de correo activas
 * @funciones  PaginaDashboardCorreos()
 * @datos      Lee direcciones de fuentes FinApp y mensajes en vivo desde Gmail
 * @eventos    Autorizar Gmail, actualizar bandeja, filtrar categorías y registrar una fuente
 * @estados    fuentes, mensajes, categoria, token, cargando, error, modalAbierto
 * @usadoPor   App.jsx (/dashboard/correos)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card } from "../components/ui/Card";
import ModalDetalleRegistro from "../components/domain/modales/ModalDetalleRegistro";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { useGmail } from "../context/GmailContext";
import { obtenerFuentesPorUsuario } from "../services/fuenteServicio";
import {
  obtenerCorreosGmail,
} from "../services/gmailServicio";
import { Link } from "react-router-dom";

const CATEGORIAS = [
  { id: "TODOS", etiqueta: "Todos" },
  { id: "IMPORTANTES", etiqueta: "Importantes" },
  { id: "NO_IMPORTANTES", etiqueta: "No importantes" },
  { id: "CONTABLES", etiqueta: "Contables" },
  { id: "ENTRETENIMIENTO", etiqueta: "Entretenimiento" },
  { id: "OTROS", etiqueta: "Otros" },
];
const INTERVALO_CONSULTA_MS = 5 * 60 * 1000;

function extraerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.data || respuesta?.content || [];
}

function normalizarDireccion(direccion) {
  return String(direccion || "").trim().toLocaleLowerCase("es");
}

function quitarFuentesDuplicadas(fuentes) {
  const unicas = new Map();
  fuentes.forEach((fuente) => {
    const clave = normalizarDireccion(fuente.contenido);
    if (!clave) return;
    const existente = unicas.get(clave);
    if (!existente || (existente.estado === false && fuente.estado !== false)) {
      unicas.set(clave, fuente);
    }
  });
  return [...unicas.values()];
}

function fechaLegible(fecha) {
  const instante = new Date(fecha);
  if (Number.isNaN(instante.getTime())) return fecha || "";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(instante);
}

function coincideCategoria(correo, categoria) {
  switch (categoria) {
    case "IMPORTANTES": return correo.esImportante;
    case "NO_IMPORTANTES": return !correo.esImportante;
    case "CONTABLES": return correo.esContable;
    case "ENTRETENIMIENTO": return correo.esEntretenimiento;
    case "OTROS": return !correo.esContable && !correo.esEntretenimiento && !correo.esImportante;
    default: return true;
  }
}

function coincideDestino(correo, direccion) {
  return String(correo.destinatario || "").toLocaleLowerCase("es").split(/[;,]/).some((destino) => {
    const direccionEncontrada = destino.match(/<?([^<>\s,;]+@[^<>\s,;]+)>?/);
    return direccionEncontrada?.[1] === direccion.trim().toLocaleLowerCase("es");
  });
}

export default function PaginaDashboardCorreos() {
  const { usuario } = useUsuarioActivo();
  const { tokenGmail, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, seleccionarCuentaGmail, conexionCargando, desconectarGmail } = useGmail();
  const [fuentes, setFuentes] = useState([]);
  const [categoria, setCategoria] = useState("TODOS");
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  const [mensajesFuente, setMensajesFuente] = useState([]);
  const [mensajesPorFuente, setMensajesPorFuente] = useState({});
  const [ultimaConsulta, setUltimaConsulta] = useState(null);
  const disparadorFuenteRef = useRef(null);
  const [cargandoFuentes, setCargandoFuentes] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [error, setError] = useState("");

  const cargarFuentes = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setFuentes([]);
      return;
    }
    try {
      setCargandoFuentes(true);
      setError("");
      const lista = extraerLista(await obtenerFuentesPorUsuario(usuario.idUsuario));
      const correos = quitarFuentesDuplicadas(lista.filter((fuente) => fuente.tipo === "CORREO"));
      setFuentes(correos);
      return correos;
    } catch (fallo) {
      setFuentes([]);
      setError(fallo?.message || "No se pudieron cargar tus fuentes de correo.");
      return [];
    } finally {
      setCargandoFuentes(false);
    }
  }, [usuario?.idUsuario]);

  useEffect(() => {
    cargarFuentes();
  }, [cargarFuentes]);

  const cargarMensajesFuente = useCallback(async (fuente, token = tokenGmail) => {
    if (!fuente || !token || fuente.estado === false) return;
    try {
      setCargandoMensajes(true);
      setError("");
      const respuesta = await obtenerCorreosGmail(token, [fuente]);
      const recibidos = respuesta.filter((correo) => coincideDestino(correo, fuente.contenido));
      setMensajesPorFuente((actuales) => ({ ...actuales, [fuente.idFuente]: recibidos }));
      setMensajesFuente(recibidos);
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron consultar los mensajes de Gmail.");
      if (/autorización de Gmail venció/i.test(fallo?.message || "")) {
        desconectarGmail(false);
      }
    } finally {
      setCargandoMensajes(false);
    }
  }, [tokenGmail, desconectarGmail]);

  const tarjetasPorDireccion = new Map();
  fuentes.forEach((fuente) => {
    const clave = normalizarDireccion(fuente.contenido);
    if (clave) tarjetasPorDireccion.set(clave, { ...fuente, tipoTarjeta: "FUENTE" });
  });
  cuentasGmail.forEach((cuenta) => {
    const clave = normalizarDireccion(cuenta.email);
    if (!clave) return;
    const fuenteExistente = tarjetasPorDireccion.get(clave);
    if (fuenteExistente) {
      const debePreferirse = String(cuenta.id) === String(cuentaSeleccionadaId);
      tarjetasPorDireccion.set(clave, {
        ...fuenteExistente,
        cuentaGmailId: debePreferirse || !fuenteExistente.cuentaGmailId ? cuenta.id : fuenteExistente.cuentaGmailId,
      });
      return;
    }
    tarjetasPorDireccion.set(clave, {
      idFuente: `gmail-${cuenta.id}`,
      contenido: cuenta.email,
      tipo: "CORREO",
      estado: true,
      tipoTarjeta: "CUENTA_GMAIL",
      cuentaGmailId: cuenta.id,
    });
  });
  const tarjetasCorreo = [...tarjetasPorDireccion.values()];

  const consultarFuentesRegistradas = useCallback(async () => {
    if (!tokenGmail) return;
    const activas = fuentes.filter((fuente) => fuente.estado !== false);
    const cuentaActual = cuentasGmail.find((cuenta) => String(cuenta.id) === String(cuentaSeleccionadaId));
    const destinosPorDireccion = new Map(activas.map((fuente) => [normalizarDireccion(fuente.contenido), fuente]));
    if (cuentaActual) {
      const claveCuenta = normalizarDireccion(cuentaActual.email);
      if (!destinosPorDireccion.has(claveCuenta)) {
        destinosPorDireccion.set(claveCuenta, { idFuente: `gmail-${cuentaActual.id}`, contenido: cuentaActual.email, estado: true });
      }
    }
    const destinos = [...destinosPorDireccion.values()];
    if (destinos.length === 0) return;
    try {
      setCargandoMensajes(true);
      setError("");
      const resultados = await Promise.all(destinos.map(async (fuente) => {
        const respuesta = await obtenerCorreosGmail(tokenGmail, [fuente]);
        return [fuente.idFuente, respuesta.filter((correo) => coincideDestino(correo, fuente.contenido))];
      }));
      const nuevosMensajes = Object.fromEntries(resultados);
      setMensajesPorFuente((actuales) => ({ ...actuales, ...nuevosMensajes }));
      if (fuenteSeleccionada && nuevosMensajes[fuenteSeleccionada.idFuente]) {
        setMensajesFuente(nuevosMensajes[fuenteSeleccionada.idFuente]);
      }
      setUltimaConsulta(new Date());
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron actualizar las fuentes de correo.");
      if (/autorización de Gmail venció/i.test(fallo?.message || "")) desconectarGmail(false);
    } finally {
      setCargandoMensajes(false);
    }
  }, [tokenGmail, fuentes, cuentasGmail, cuentaSeleccionadaId, fuenteSeleccionada, desconectarGmail]);

  const seleccionarFuente = async (fuente, evento) => {
    disparadorFuenteRef.current = evento.currentTarget;
    setFuenteSeleccionada(fuente);
    setCategoria("TODOS");
    setMensajesFuente([]);
    setError("");
    if (fuente.cuentaGmailId && String(fuente.cuentaGmailId) !== String(cuentaSeleccionadaId)) {
      seleccionarCuentaGmail(fuente.cuentaGmailId);
      return;
    }
    if (tokenGmail && fuente.estado !== false) await cargarMensajesFuente(fuente, tokenGmail);
  };

  useEffect(() => {
    if (fuenteSeleccionada && tokenGmail && fuenteSeleccionada.estado !== false) {
      cargarMensajesFuente(fuenteSeleccionada, tokenGmail);
    }
  }, [tokenGmail]);

  useEffect(() => {
    if (!tokenGmail || !usuario?.idUsuario || (fuentes.length === 0 && cuentasGmail.length === 0)) return undefined;
    consultarFuentesRegistradas();
    const temporizador = window.setInterval(() => {
      cargarFuentes();
      consultarFuentesRegistradas();
    }, INTERVALO_CONSULTA_MS);
    return () => window.clearInterval(temporizador);
  }, [tokenGmail, usuario?.idUsuario, fuentes, cuentasGmail, cargarFuentes, consultarFuentesRegistradas]);

  const mensajesVisibles = mensajesFuente.filter((correo) => coincideCategoria(correo, categoria));
  const noHayFuentes = !cargandoFuentes && fuentes.length === 0 && cuentasGmail.length === 0;

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Correos</h1>
          <p className="mt-1 text-sm text-slate-text">Consulta los mensajes de cada fuente registrada y cuenta Gmail conectada.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tokenGmail ? (
              <button type="button" onClick={consultarFuentesRegistradas} disabled={cargandoMensajes || noHayFuentes} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover disabled:opacity-50">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /><span>{cargandoMensajes ? "Actualizando..." : "Actualizar"}</span>
              </button>
          ) : <Link to="/dashboard/configuracion" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover">Ir a Configuración para conectar Gmail</Link>}
        </div>
      </div>

      <Card className="space-y-3 p-5">
        <h2 className="font-display text-base font-semibold text-bg-dark">Fuentes y cuentas para consultar</h2>
        {cuentaGmail && <p className="text-xs text-emerald-primary">Consulta automática desde {cuentaGmail}</p>}
        {cargandoFuentes && <p role="status" className="text-sm text-slate-text">Cargando fuentes...</p>}
        {!cargandoFuentes && !usuario?.idUsuario && <p className="text-sm text-slate-text">Inicia sesión para conectar tus fuentes.</p>}
        {noHayFuentes && <p className="text-sm text-slate-text">Conecta una cuenta Gmail o registra una fuente de correo para consultar mensajes.</p>}
        {!cargandoFuentes && tarjetasCorreo.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tarjetasCorreo.map((fuente) => {
              const esCuenta = fuente.tipoTarjeta === "CUENTA_GMAIL";
              const cuentaSeleccionada = fuente.cuentaGmailId && String(fuente.cuentaGmailId) === String(cuentaSeleccionadaId);
              const inactiva = fuente.estado === false || (!tokenGmail && !conexionCargando) || (Boolean(fuente.cuentaGmailId) && !cuentaSeleccionada);
              const estado = esCuenta
                ? conexionCargando && cuentaSeleccionada ? "Conectando" : cuentaSeleccionada && tokenGmail ? "Activa" : "Conectada · abrir para consultar"
                : fuente.estado === false ? "Inactiva · deshabilitada" : fuente.cuentaGmailId && !cuentaSeleccionada ? "Conectada · abrir para consultar" : !tokenGmail ? "Inactiva · conecta Gmail" : "Activa · consulta automática";
              return (
                <button
                  key={fuente.idFuente}
                  type="button"
                  disabled={conexionCargando && Boolean(fuente.cuentaGmailId)}
                  onClick={(evento) => seleccionarFuente(fuente, evento)}
                  aria-label={`Ver correos de ${fuente.contenido}`}
                  className={`rounded-2xl border p-4 text-left transition-colors hover:border-emerald-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-60 ${fuenteSeleccionada?.idFuente === fuente.idFuente ? "border-emerald-primary bg-emerald-primary/10" : "border-border-line/40 bg-bg-cream/60"}`}
                >
                  <span className="block text-xs uppercase tracking-wide text-slate-text">{esCuenta ? "Cuenta Gmail" : "Fuente registrada"}</span>
                  <span className="mt-1 block break-all font-medium text-bg-dark">{fuente.contenido}</span>
                  <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${inactiva ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-800"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${inactiva ? "bg-slate-500" : "animate-pulse bg-emerald-600"}`} aria-hidden="true" />
                    {estado}
                  </span>
                  {mensajesPorFuente[fuente.idFuente]?.length > 0 && <span className="mt-2 block text-xs text-slate-text">{mensajesPorFuente[fuente.idFuente].length} mensajes consultados</span>}
                  <span className="mt-2 block text-xs font-medium text-emerald-primary">Abrir consultas</span>
                </button>
              );
            })}
          </div>
        )}
        {fuentes.length > 0 && !tokenGmail && <p className="text-xs text-slate-text">Al conectar Gmail, Google solicitará permiso de solo lectura para toda la bandeja. FinApp limitará sus búsquedas a mensajes recibidos en estas direcciones y no guardará los mensajes.</p>}
        {ultimaConsulta && <p className="text-xs text-slate-text">Última consulta: {fechaLegible(ultimaConsulta.toISOString())} · actualización cada 5 minutos mientras esta página esté abierta.</p>}
      </Card>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <ModalDetalleRegistro abierto={Boolean(fuenteSeleccionada)} titulo={fuenteSeleccionada ? `Correos de ${fuenteSeleccionada.contenido}` : "Correos"} alCerrar={() => { setFuenteSeleccionada(null); setMensajesFuente([]); }} triggerRef={disparadorFuenteRef}>
      {fuenteSeleccionada && !tokenGmail && <div className="mb-4 space-y-3"><p className="text-sm text-slate-text">{fuenteSeleccionada.estado === false ? "Esta fuente está inactiva hasta que conectes Gmail." : "Conecta Gmail para consultar los mensajes recibidos por esta dirección."}</p><Link to="/dashboard/configuracion" className="inline-flex min-h-10 items-center rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream">Ir a Configuración</Link></div>}
      {tokenGmail && fuenteSeleccionada?.estado === false && <div className="mb-4 space-y-3"><p className="text-sm text-slate-text">Esta dirección está registrada, pero inactiva. Revisa su estado en Configuración → Fuentes registradas.</p><Link to="/dashboard/configuracion" className="inline-flex min-h-10 items-center rounded-lg border border-emerald-primary px-4 text-sm font-medium text-emerald-primary">Abrir Configuración</Link></div>}
      {tokenGmail && fuenteSeleccionada && fuenteSeleccionada.estado !== false && (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap gap-2 border-b border-border-line/30 p-4" role="group" aria-label="Filtrar correos por categoría">
            {CATEGORIAS.map((item) => (
              <button key={item.id} type="button" aria-pressed={categoria === item.id} onClick={() => setCategoria(item.id)} className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${categoria === item.id ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark"}`}>
                {item.etiqueta} ({mensajesFuente.filter((correo) => coincideCategoria(correo, item.id)).length})
              </button>
            ))}
          </div>
          {cargandoMensajes && <p role="status" className="p-6 text-sm text-slate-text">Consultando Gmail...</p>}
          {!cargandoMensajes && mensajesVisibles.length === 0 && (
            <div className="space-y-2 p-6 text-sm text-slate-text">
              <p>{categoria === "TODOS" ? `No encontramos mensajes recibidos para ${fuenteSeleccionada.contenido} en la cuenta conectada (${cuentaGmail || "Gmail"}).` : "No hay mensajes en esta categoría para esta fuente."}</p>
              {categoria === "TODOS" && <p>La cuenta conectada debe recibir estos mensajes o tener configurado el reenvío/alias de esa dirección. Se incluyen mensajes archivados.</p>}
            </div>
          )}
          {!cargandoMensajes && mensajesVisibles.length > 0 && (
            <ul className="divide-y divide-border-line/20">
              {mensajesVisibles.map((correo) => (
                <li key={correo.id} className="space-y-2 p-4 sm:p-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-bg-dark">{correo.asunto}</p>
                      <p className="truncate text-xs text-slate-text">{correo.remitente}</p>
                    </div>
                    <time className="shrink-0 text-xs text-slate-text">{fechaLegible(correo.fecha)}</time>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-text">{correo.fragmento}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {correo.esImportante && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Importante</span>}
                    {correo.esContable && <span className="rounded-full bg-emerald-primary/10 px-2 py-0.5 text-xs font-medium text-emerald-primary">Contable</span>}
                    {correo.esEntretenimiento && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900">Entretenimiento</span>}
                    {!correo.esImportante && <span className="rounded-full bg-border-line/20 px-2 py-0.5 text-xs font-medium text-slate-text">No importante</span>}
                    <a href={`https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(correo.id)}`} target="_blank" rel="noreferrer" className="ml-auto text-xs font-medium text-emerald-primary underline-offset-2 hover:underline">Abrir en Gmail</a>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!cargandoMensajes && mensajesFuente.length > 0 && <p className="border-t border-border-line/20 px-5 py-3 text-xs text-slate-text">Se muestran hasta 50 mensajes recientes para esta dirección. Las categorías se calculan en esta vista a partir del asunto, remitente, fragmento y etiquetas de Gmail.</p>}
        </Card>
      )}

      </ModalDetalleRegistro>
    </section>
  );
}
