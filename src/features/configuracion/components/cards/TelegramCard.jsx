import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, MessageCircle, RefreshCw, Settings, Unlink } from "lucide-react";
import { Card } from "../../../../components/ui";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { crearEnlaceTelegram, desvincularTelegram, obtenerEstadoTelegram } from "../../../../services/telegramServicio";

function datosRespuesta(respuesta) {
  return respuesta?.datos ?? respuesta?.data ?? respuesta ?? {};
}

export default function TelegramCard() {
  const [estado, setEstado] = useState(null);
  const [enlace, setEnlace] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [abierto, setAbierto] = useState(true);
  const [configuracionAbierta, setConfiguracionAbierta] = useState(false);
  const disparadorTelegramRef = useRef(null);

  const cargarEstado = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const actualizado = datosRespuesta(await obtenerEstadoTelegram());
      setEstado(actualizado);
      if (actualizado.conectado) setEnlace("");
      setError("");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo consultar el estado de Telegram.");
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEstado();
    const intervalo = window.setInterval(() => cargarEstado(true), 10000);
    return () => window.clearInterval(intervalo);
  }, [cargarEstado]);

  const vincular = async () => {
    setCargando(true); setError(""); setAviso("");
    try {
      const datos = datosRespuesta(await crearEnlaceTelegram());
      if (!datos.enlace) throw new Error("No se recibió un enlace de Telegram válido.");
      setEnlace(datos.enlace);
      setAviso("Abre el bot y pulsa Iniciar para terminar el vínculo.");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo generar el enlace de Telegram.");
    } finally { setCargando(false); }
  };

  const desvincular = async () => {
    setCargando(true); setError(""); setAviso("");
    try {
      await desvincularTelegram();
      setEstado((actual) => ({ ...actual, conectado: false, usuarioTelegram: "" }));
      setEnlace("");
      setAviso("Telegram se desvinculó de tu cuenta.");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo desvincular Telegram.");
    } finally { setCargando(false); }
  };

  const conectado = estado?.conectado === true;
  const configurado = estado?.configurado === true;

  return <Card className="space-y-4 p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="rounded-xl bg-emerald-primary/10 p-2 text-emerald-primary"><MessageCircle className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0">
          <h2><button type="button" aria-expanded={abierto} aria-controls="mensajeria-contenido" onClick={() => setAbierto((actual) => !actual)} className="flex min-h-10 items-center gap-2 text-left font-display text-xl font-semibold text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
            <span>Mensajería</span><ChevronDown aria-hidden="true" className={`h-5 w-5 transition-transform ${abierto ? "rotate-180" : ""}`} />
          </button></h2>
          {abierto && <p className="mt-1 text-sm text-slate-text">Administra los servicios de mensajería conectados a tu cuenta.</p>}
        </div>
      </div>
    </div>

    <div id="mensajeria-contenido" hidden={!abierto}>
      <button ref={disparadorTelegramRef} type="button" onClick={() => setConfiguracionAbierta(true)} className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-border-line/50 bg-bg-cream/50 p-3 text-left hover:bg-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
        <span className="flex min-w-0 items-center gap-3"><span className="rounded-xl bg-emerald-primary/10 p-2 text-emerald-primary"><MessageCircle className="h-5 w-5" aria-hidden="true" /></span><span className="font-semibold">Telegram</span></span>
        <span className="flex items-center gap-2 text-sm text-slate-text">{conectado ? "Conectado" : "Configurar"}<Settings className="h-4 w-4" aria-hidden="true" /></span>
      </button>
    </div>
    <ModalDetalleRegistro abierto={configuracionAbierta} titulo="Configurar Telegram" alCerrar={() => setConfiguracionAbierta(false)} triggerRef={disparadorTelegramRef} ancho="max-w-lg">
      <div className="space-y-4">
    <div className={`flex flex-wrap items-center gap-2 rounded-xl border p-3 text-sm ${conectado ? "border-emerald-primary/30 bg-emerald-primary/5 text-emerald-primary" : "border-border-line/50 bg-bg-cream/50 text-slate-text"}`}>
      {conectado ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> : <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${estado?.errorRecepcion ? "bg-amber-500" : "bg-slate-text/50"}`} aria-hidden="true" />}
      <span className="font-semibold">{cargando && !estado ? "Consultando estado…" : conectado ? "Conectado" : "No conectado"}</span>
      {conectado && <span>{estado.usuarioTelegram ? `como @${estado.usuarioTelegram}` : `a @${estado.nombreBot}`}</span>}
      {!configurado && estado && <span>El backend necesita TELEGRAM_BOT_TOKEN y NOMBRE_BOT_TELEGRAM.</span>}
    </div>

    <div className="flex flex-wrap items-center gap-2">
      {conectado
        ? <button type="button" disabled={cargando} onClick={desvincular} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-line/60 px-4 text-sm font-medium text-slate-text hover:bg-bg-cream/80 disabled:opacity-50"><Unlink className="h-4 w-4" aria-hidden="true" />Desvincular</button>
        : <button type="button" disabled={cargando || !configurado} onClick={vincular} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover disabled:cursor-not-allowed disabled:opacity-50">{cargando ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MessageCircle className="h-4 w-4" aria-hidden="true" />}{enlace ? "Generar otro enlace" : "Vincular Telegram"}</button>}
      <button type="button" disabled={cargando} onClick={() => cargarEstado()} aria-label="Actualizar estado de Telegram" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-line/60 text-slate-text hover:bg-bg-cream/80 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} aria-hidden="true" /></button>
    </div>

    {enlace && !conectado && <div className="rounded-xl border border-emerald-primary/20 bg-emerald-primary/5 p-3 text-sm text-bg-dark">
      <p className="mb-2">Abre el enlace y pulsa <strong>Iniciar</strong> para completar la conexión:</p>
      <a href={enlace} target="_blank" rel="noreferrer" className="break-all font-semibold text-emerald-primary underline">Abrir @{estado?.nombreBot || "bot"} en Telegram</a>
    </div>}
    {estado?.errorRecepcion && <p role="alert" className="rounded-xl border border-amber-300/60 bg-amber-100/70 p-3 text-sm text-amber-900">{estado.errorRecepcion}</p>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {aviso && <p role="status" className="text-sm text-emerald-primary">{aviso}</p>}
      </div>
    </ModalDetalleRegistro>
  </Card>;
}
