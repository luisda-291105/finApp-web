/**
 * @uso        Página de bandeja Gmail asociada a las fuentes de correo activas
 * @funciones  PaginaDashboardCorreos()
 * @datos      Lee direcciones de fuentes FinApp y mensajes en vivo desde Gmail
 * @eventos    Autorizar Gmail, actualizar bandeja, filtrar categorías y registrar una fuente
 * @estados    fuentes, mensajes, categoria, token, cargando, error, modalAbierto
 * @usadoPor   App.jsx (/dashboard/correos)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Card } from "../components/ui/Card";
import ModalDetalleRegistro from "../components/domain/modales/ModalDetalleRegistro";
import ModalFuentes from "../components/domain/modales/ModalFuentes";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { obtenerFuentesPorUsuario } from "../services/fuenteServicio";
import { GMAIL_CONFIGURADO, obtenerCorreosGmail, obtenerPerfilGmail, solicitarTokenGmail } from "../services/gmailServicio";

const CATEGORIAS = [
  { id: "TODOS", etiqueta: "Todos" },
  { id: "IMPORTANTES", etiqueta: "Importantes" },
  { id: "NO_IMPORTANTES", etiqueta: "No importantes" },
  { id: "CONTABLES", etiqueta: "Contables" },
  { id: "ENTRETENIMIENTO", etiqueta: "Entretenimiento" },
  { id: "OTROS", etiqueta: "Otros" },
];

function extraerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.data || respuesta?.content || [];
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

export default function PaginaDashboardCorreos() {
  const { usuario } = useUsuarioActivo();
  const [fuentes, setFuentes] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [categoria, setCategoria] = useState("TODOS");
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  const [mensajesFuente, setMensajesFuente] = useState([]);
  const disparadorFuenteRef = useRef(null);
  const [tokenGmail, setTokenGmail] = useState("");
  const [cuentaGmail, setCuentaGmail] = useState("");
  const [cargandoFuentes, setCargandoFuentes] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const disparadorRef = useRef(null);

  const cargarFuentes = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setFuentes([]);
      setMensajes([]);
      setTokenGmail("");
      return;
    }
    try {
      setCargandoFuentes(true);
      setError("");
      const lista = extraerLista(await obtenerFuentesPorUsuario(usuario.idUsuario));
      setFuentes(lista.filter((fuente) => fuente.tipo === "CORREO" && fuente.estado !== false));
    } catch (fallo) {
      setFuentes([]);
      setError(fallo?.message || "No se pudieron cargar tus fuentes de correo.");
    } finally {
      setCargandoFuentes(false);
    }
  }, [usuario?.idUsuario]);

  useEffect(() => {
    setTokenGmail("");
    setCuentaGmail("");
    setMensajes([]);
    cargarFuentes();
  }, [cargarFuentes]);

  const cargarMensajes = useCallback(async (token = tokenGmail, listaFuentes = fuentes) => {
    if (!token || listaFuentes.length === 0) {
      setMensajes([]);
      return;
    }
    try {
      setCargandoMensajes(true);
      setError("");
      const respuesta = await obtenerCorreosGmail(token, listaFuentes);
      setMensajes(respuesta);
      setMensajesFuente(respuesta);
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron consultar los mensajes de Gmail.");
      if (/autorización de Gmail venció/i.test(fallo?.message || "")) {
        setTokenGmail("");
        setCuentaGmail("");
      }
    } finally {
      setCargandoMensajes(false);
    }
  }, [fuentes, tokenGmail, fuenteSeleccionada]);

  const conectarGmail = async () => {
    try {
      setError("");
      const token = await solicitarTokenGmail();
      const cuenta = await obtenerPerfilGmail(token);
      setTokenGmail(token);
      setCuentaGmail(cuenta);
      setMensajes([]);
      setMensajesFuente([]);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo conectar Gmail.");
    }
  };

  const seleccionarFuente = async (fuente, evento) => {
    disparadorFuenteRef.current = evento.currentTarget;
    setFuenteSeleccionada(fuente);
    setCategoria("TODOS");
    setMensajesFuente([]);
    if (!tokenGmail) return;
    try {
      setCargandoMensajes(true);
      setError("");
      const respuesta = await obtenerCorreosGmail(tokenGmail, [fuente]);
      setMensajes(respuesta);
      const direccion = fuente.contenido.trim().toLocaleLowerCase("es");
      setMensajesFuente(respuesta.filter((correo) => String(correo.destinatario || "").toLocaleLowerCase("es").split(/[;,]/).some((destino) => {
        const direccionEncontrada = destino.match(/<?([^<>\s,;]+@[^<>\s,;]+)>?/);
        return direccionEncontrada?.[1] === direccion;
      })));
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron consultar los mensajes de esta fuente.");
    } finally {
      setCargandoMensajes(false);
    }
  };

  const alGuardarFuente = (fuente) => {
    if (fuente.tipo !== "CORREO") return;
    const actualizadas = [fuente, ...fuentes.filter((item) => item.idFuente !== fuente.idFuente)];
    setFuentes(actualizadas);
    if (tokenGmail) cargarMensajes(tokenGmail, actualizadas);
  };

  const mensajesVisibles = mensajesFuente.filter((correo) => coincideCategoria(correo, categoria));
  const noHayFuentes = !cargandoFuentes && fuentes.length === 0;

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Correos</h1>
          <p className="mt-1 text-sm text-slate-text">Mensajes recibidos por tus fuentes de correo, organizados por categoría.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button ref={disparadorRef} type="button" onClick={() => setModalAbierto(true)} aria-label="Agregar fuente de correo" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-primary/30 px-4 py-2.5 text-sm font-medium text-emerald-primary transition-colors hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">
            <Plus className="h-4 w-4" aria-hidden="true" /><span>Agregar fuente</span>
          </button>
          {tokenGmail ? (
            <>
              <button type="button" onClick={() => fuenteSeleccionada ? cargarMensajes(tokenGmail, [fuenteSeleccionada]) : setError("Selecciona una fuente para actualizar sus correos.")} disabled={cargandoMensajes || noHayFuentes} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover disabled:opacity-50">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /><span>{cargandoMensajes ? "Actualizando..." : "Actualizar"}</span>
              </button>
              <button type="button" onClick={() => { setTokenGmail(""); setCuentaGmail(""); setMensajes([]); }} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-slate-text hover:bg-border-line/20">Desconectar Gmail</button>
            </>
          ) : (
            <button type="button" onClick={conectarGmail} disabled={cargandoFuentes || noHayFuentes || !GMAIL_CONFIGURADO} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover disabled:opacity-50">
              Conectar Gmail
            </button>
          )}
        </div>
      </div>

      <Card className="space-y-3 p-5">
        <h2 className="font-display text-base font-semibold text-bg-dark">Fuentes vigiladas</h2>
        {cargandoFuentes && <p role="status" className="text-sm text-slate-text">Cargando fuentes...</p>}
        {!cargandoFuentes && !usuario?.idUsuario && <p className="text-sm text-slate-text">Inicia sesión para conectar tus fuentes.</p>}
        {noHayFuentes && <p className="text-sm text-slate-text">Agrega una fuente de tipo correo para elegir a qué direcciones entrantes buscar mensajes.</p>}
        {!cargandoFuentes && fuentes.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fuentes.map((fuente) => <button key={fuente.idFuente} type="button" onClick={(evento) => seleccionarFuente(fuente, evento)} aria-label={`Ver correos de ${fuente.contenido}`} className={`rounded-2xl border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${fuenteSeleccionada?.idFuente === fuente.idFuente ? "border-emerald-primary bg-emerald-primary/10" : "border-border-line/40 bg-bg-cream/60"}`}><span className="block text-xs uppercase tracking-wide text-slate-text">Fuente de correo</span><span className="mt-1 block break-all font-medium text-bg-dark">{fuente.contenido}</span><span className="mt-2 block text-xs text-emerald-primary">{fuenteSeleccionada?.idFuente === fuente.idFuente ? `${mensajesFuente.length} mensajes` : tokenGmail ? "Selecciona para consultar" : "Conecta Gmail para consultar"}</span></button>)}</div>}
        {fuentes.length > 0 && !tokenGmail && <p className="text-xs text-slate-text">Al conectar Gmail, Google solicitará permiso de solo lectura para toda la bandeja. FinApp limitará sus búsquedas a mensajes recibidos en estas direcciones y no guardará los mensajes.</p>}
        {fuentes.length > 0 && !GMAIL_CONFIGURADO && <p role="status" className="text-sm text-amber-800">Configura <code>VITE_GOOGLE_CLIENT_ID</code> en el archivo `.env` para habilitar la conexión.</p>}
        {cuentaGmail && <p className="text-xs text-emerald-primary">Conectado a Gmail como {cuentaGmail}</p>}
      </Card>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <ModalDetalleRegistro abierto={Boolean(fuenteSeleccionada)} titulo={fuenteSeleccionada ? `Correos de ${fuenteSeleccionada.contenido}` : "Correos"} alCerrar={() => { setFuenteSeleccionada(null); setMensajesFuente([]); }} triggerRef={disparadorFuenteRef}>
      {fuenteSeleccionada && !tokenGmail && <div className="mb-4 space-y-3"><p className="text-sm text-slate-text">Conecta Gmail para consultar únicamente los mensajes recibidos por esta dirección.</p><button type="button" onClick={conectarGmail} disabled={!GMAIL_CONFIGURADO} className="min-h-10 rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream disabled:opacity-50">Conectar Gmail</button></div>}
      {tokenGmail && fuenteSeleccionada && (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap gap-2 border-b border-border-line/30 p-4" role="group" aria-label="Filtrar correos por categoría">
            {CATEGORIAS.map((item) => (
              <button key={item.id} type="button" aria-pressed={categoria === item.id} onClick={() => setCategoria(item.id)} className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${categoria === item.id ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark"}`}>
                {item.etiqueta} ({mensajesFuente.filter((correo) => coincideCategoria(correo, item.id)).length})
              </button>
            ))}
          </div>
          {cargandoMensajes && <p role="status" className="p-6 text-sm text-slate-text">Consultando Gmail...</p>}
          {!cargandoMensajes && mensajesVisibles.length === 0 && <p className="p-6 text-sm text-slate-text">No hay mensajes en esta categoría para las fuentes seleccionadas.</p>}
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
          {!cargandoMensajes && mensajes.length > 0 && <p className="border-t border-border-line/20 px-5 py-3 text-xs text-slate-text">Se muestran hasta 50 mensajes recientes. Las categorías se calculan en esta vista a partir del asunto, remitente, fragmento y etiquetas de Gmail.</p>}
        </Card>
      )}

      </ModalDetalleRegistro>
      <ModalFuentes abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorRef} alGuardar={alGuardarFuente} fuentesExistentes={fuentes} tipoInicial="CORREO" tiposPermitidos={["CORREO"]} />
    </section>
  );
}
