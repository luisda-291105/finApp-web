/**
 * @uso        Bandeja de correo Gmail por fuentes y cuentas conectadas
 * @funciones  CorreosPage()
 * @datos      Coordina useCorreos, tarjetas y bandeja modal
 * @eventos    Actualizar, seleccionar dirección y filtrar mensajes
 * @estados    Referencia al disparador para devolver el foco
 * @usadoPor   App.jsx mediante la API pública de features/correos
 */
import { useRef } from "react";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { useCorreos } from "../hooks/useCorreos";
import CorreoCuentaCard from "../components/cards/CorreoCuentaCard";
import BandejaCorreosModal from "../components/modals/BandejaCorreosModal";
import { fechaLegible } from "../utils/correoHelpers";

/** Renderiza las direcciones y entrega las acciones de datos a su hook. */
export default function CorreosPage() {
  const estado = useCorreos();
  const disparadorFuenteRef = useRef(null);
  return <section aria-labelledby="dashboard-title" className="space-y-6 pt-6 pb-10">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p><h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Correos</h1><p className="mt-1 text-sm text-slate-text">Consulta los mensajes de cada fuente registrada y cuenta Gmail conectada.</p></div>
      <div className="flex flex-wrap gap-2">{estado.tokenGmail ? <button type="button" onClick={estado.consultarFuentesRegistradas} disabled={estado.cargandoMensajes || estado.noHayFuentes} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover disabled:opacity-50"><RefreshCw className="h-4 w-4" aria-hidden="true" /><span>{estado.cargandoMensajes ? "Actualizando..." : "Actualizar"}</span></button> : <Link to="/dashboard/configuracion" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover">Ir a Configuración para conectar Gmail</Link>}</div>
    </div>
    <Card className="space-y-3 p-5"><h2 className="font-display text-base font-semibold text-bg-dark">Fuentes y cuentas para consultar</h2>
      {estado.cuentaGmail && <p className="text-xs text-emerald-primary">Consulta automática desde {estado.cuentaGmail}</p>}
      {estado.cargandoFuentes && <p role="status" className="text-sm text-slate-text">Cargando fuentes...</p>}
      {!estado.cargandoFuentes && !estado.usuario?.idUsuario && <p className="text-sm text-slate-text">Inicia sesión para conectar tus fuentes.</p>}
      {estado.noHayFuentes && <p className="text-sm text-slate-text">Conecta una cuenta Gmail o registra una fuente de correo para consultar mensajes.</p>}
      {!estado.cargandoFuentes && estado.tarjetasCorreo.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{estado.tarjetasCorreo.map((fuente) => <CorreoCuentaCard key={fuente.idFuente} fuente={fuente} tokenGmail={estado.tokenGmail} cuentaSeleccionadaId={estado.cuentaSeleccionadaId} conexionCargando={estado.conexionCargando} seleccionada={estado.fuenteSeleccionada?.idFuente === fuente.idFuente} cantidadMensajes={estado.mensajesPorFuente[fuente.idFuente]?.length || 0} alAbrir={(evento) => { disparadorFuenteRef.current = evento.currentTarget; estado.seleccionarFuente(fuente); }} />)}</div>}
      {estado.fuentes.length > 0 && !estado.tokenGmail && <p className="text-xs text-slate-text">Al conectar Gmail, Google solicitará permiso de solo lectura para toda la bandeja. FinApp limitará sus búsquedas a mensajes recibidos en estas direcciones y no guardará los mensajes.</p>}
      {estado.ultimaConsulta && <p className="text-xs text-slate-text">Última consulta: {fechaLegible(estado.ultimaConsulta.toISOString())} · actualización cada 5 minutos mientras esta página esté abierta.</p>}
    </Card>
    {estado.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{estado.error}</p>}
    <BandejaCorreosModal fuente={estado.fuenteSeleccionada} tokenGmail={estado.tokenGmail} cuentaGmail={estado.cuentaGmail} mensajesFuente={estado.mensajesFuente} cargandoMensajes={estado.cargandoMensajes} triggerRef={disparadorFuenteRef} alCerrar={estado.cerrarBandeja} />
  </section>;
}
