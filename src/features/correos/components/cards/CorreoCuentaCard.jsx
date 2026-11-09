/**
 * @uso        Tarjeta de fuente de correo o cuenta Gmail seleccionable
 * @funciones  CorreoCuentaCard({ fuente, gmailConectado, ... })
 * @datos      Presenta estado y cantidad de mensajes consultados
 * @eventos    Click para abrir la bandeja de esa dirección
 * @estados    Ninguno
 * @usadoPor   CorreosPage
 */
/** Presenta una dirección y su estado de conexión. */
export default function CorreoCuentaCard({ fuente, gmailConectado, cuentaSeleccionadaId, conexionCargando, seleccionada, cantidadMensajes, alAbrir }) {
  const esCuenta = fuente.tipoTarjeta === "CUENTA_GMAIL";
  const cuentaSeleccionada = fuente.cuentaGmailId && String(fuente.cuentaGmailId) === String(cuentaSeleccionadaId);
  const inactiva = fuente.estado === false || (!gmailConectado && !conexionCargando) || (Boolean(fuente.cuentaGmailId) && !cuentaSeleccionada);
  const estado = esCuenta
    ? conexionCargando && cuentaSeleccionada ? "Conectando" : cuentaSeleccionada && gmailConectado ? "Activa" : "Conectada · abrir para consultar"
    : fuente.estado === false ? "Inactiva · deshabilitada" : fuente.cuentaGmailId && !cuentaSeleccionada ? "Conectada · abrir para consultar" : !gmailConectado ? "Inactiva · conecta Gmail" : "Activa · consulta automática";
  return <button type="button" disabled={conexionCargando && Boolean(fuente.cuentaGmailId)} onClick={alAbrir} aria-label={`Ver correos de ${fuente.contenido}`} className={`rounded-2xl border p-4 text-left transition-colors hover:border-emerald-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-60 ${seleccionada ? "border-emerald-primary bg-emerald-primary/10" : "border-border-line/40 bg-bg-cream/60"}`}>
    <span className="block text-xs uppercase tracking-wide text-slate-text">{esCuenta ? "Cuenta Gmail" : "Fuente registrada"}</span>
    <span className="mt-1 block break-all font-medium text-bg-dark">{fuente.contenido}</span>
    <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${inactiva ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-800"}`}><span className={`h-1.5 w-1.5 rounded-full ${inactiva ? "bg-slate-500" : "animate-pulse bg-emerald-600"}`} aria-hidden="true" />{estado}</span>
    {cantidadMensajes > 0 && <span className="mt-2 block text-xs text-slate-text">{cantidadMensajes} mensajes consultados</span>}
    <span className="mt-2 block text-xs font-medium text-emerald-primary">Abrir consultas</span>
  </button>;
}
