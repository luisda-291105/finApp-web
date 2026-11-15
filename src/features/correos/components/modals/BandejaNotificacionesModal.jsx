/**
 * @uso        Bandeja modal de notificaciones de movimientos y sincronización Gmail
 * @funciones  BandejaNotificacionesModal({ abierto, alCerrar, triggerRef, notificaciones, alMarcarTodasLeidas, alLimpiar, sincronizando, errorSincronizacion })
 * @datos      Lista de notificaciones persistidas con asunto, fecha, origen y estado de lectura
 * @eventos    Cerrar modal, marcar todas como leídas y limpiar bandeja
 * @estados    Ninguno (controlado por props)
 * @usadoPor   CorreosPage
 */
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

function formatearFecha(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(fecha);
}

export default function BandejaNotificacionesModal({
  abierto,
  alCerrar,
  triggerRef,
  notificaciones,
  alMarcarTodasLeidas,
  alLimpiar,
  sincronizando,
  errorSincronizacion,
}) {
  return (
    <ModalDetalleRegistro
      abierto={abierto}
      titulo="Notificaciones"
      alCerrar={alCerrar}
      triggerRef={triggerRef}
      ancho="max-w-lg"
      icono={Bell}
      etiquetaCerrar="Cerrar notificaciones"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-text">
            Bandeja de mensajes de movimientos y sincronización Gmail.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={alMarcarTodasLeidas}
              disabled={!notificaciones.some((n) => !n.leida)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line px-3 text-xs font-medium text-bg-dark hover:border-emerald-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Marcar leídas
            </button>
            <button
              type="button"
              onClick={alLimpiar}
              disabled={notificaciones.length === 0}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line px-3 text-xs font-medium text-bg-dark hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </div>

        {sincronizando && (
          <p role="status" className="text-sm text-slate-text">Analizando correos financieros…</p>
        )}
        {errorSincronizacion && (
          <p role="alert" className="rounded-xl border border-red-300/40 bg-red-50 p-3 text-sm text-red-700">
            {errorSincronizacion}
          </p>
        )}

        {notificaciones.length === 0 ? (
          <p className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-4 text-sm text-slate-text">
            No hay notificaciones guardadas.
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Notificaciones guardadas">
            {notificaciones.map((notificacion) => (
              <li
                key={notificacion.id}
                className={`rounded-xl border p-3 ${notificacion.leida ? "border-border-line/50 bg-bg-cream/40" : "border-emerald-primary/30 bg-emerald-primary/5"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className={`min-w-0 break-words text-sm ${notificacion.leida ? "text-slate-text" : "font-medium text-bg-dark"}`}>
                    {notificacion.asunto}
                  </p>
                  {!notificacion.leida && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-primary" aria-label="No leída" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-text">
                  {formatearFecha(notificacion.fecha)}
                  {notificacion.cuentaGmail ? ` · ${notificacion.cuentaGmail}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ModalDetalleRegistro>
  );
}
