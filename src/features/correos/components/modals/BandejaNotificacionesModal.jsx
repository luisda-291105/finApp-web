/**
 * @uso        Bandeja modal de notificaciones de movimientos y sincronización Gmail
 * @funciones  BandejaNotificacionesModal({ abierto, alCerrar, triggerRef, notificaciones, alMarcarTodasLeidas, alMarcarLeida, alLimpiar, sincronizando, errorSincronizacion, estadoCorreos })
 * @datos      Lista de notificaciones persistidas con asunto, fecha, origen, cuenta y estado de lectura
 * @eventos    Cerrar modal, marcar todas como leídas, marcar como leída al abrir el detalle, limpiar bandeja y abrir detalle de notificación
 * @estados    idNotificacionSeleccionada (identificador de la notificación abierta en detalle)
 * @usadoPor   CorreosPage
 */
import { useRef, useState } from "react";
import { Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { fechaLegible } from "../../utils/correoHelpers";

function formatearFecha(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

function textoOrigen(origen) {
  if (origen === "movimiento-gmail") return "Movimiento Gmail";
  if (origen === "sincronizacion") return "Sincronización";
  return origen || "Notificación";
}

export default function BandejaNotificacionesModal({
  abierto,
  alCerrar,
  triggerRef,
  notificaciones,
  alMarcarTodasLeidas,
  alMarcarLeida,
  alLimpiar,
  sincronizando,
  errorSincronizacion,
  estadoCorreos,
}) {
  const [idNotificacionSeleccionada, setIdNotificacionSeleccionada] =
    useState(null);
  const notificacionSeleccionada =
    notificaciones.find((n) => n.id === idNotificacionSeleccionada) || null;
  const triggerDetalleRef = useRef(null);

  const cerrarBandeja = () => {
    setIdNotificacionSeleccionada(null);
    alCerrar();
  };

  return (
    <>
      <ModalDetalleRegistro
        abierto={abierto && !notificacionSeleccionada}
        titulo="Notificaciones"
        alCerrar={cerrarBandeja}
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

          {estadoCorreos && (
            <div
              className="rounded-xl border border-border-line/70 bg-bg-cream/60 px-4 py-3"
              aria-live="polite"
            >
              {estadoCorreos.actualizando ? (
                <p
                  role="status"
                  className="flex items-center gap-2 text-sm font-medium text-emerald-primary"
                >
                  <RefreshCw
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Actualizando correos…{" "}
                  {estadoCorreos.enEspera + estadoCorreos.procesando} en espera
                </p>
              ) : (
                <p className="text-sm font-medium text-bg-dark">
                  Correos al día.
                </p>
              )}
              {estadoCorreos.errores > 0 && (
                <p className="mt-1 text-sm text-red-700">
                  {estadoCorreos.errores} correo
                  {estadoCorreos.errores === 1 ? "" : "s"} con error de
                  sincronización.
                  {estadoCorreos.ultimoError
                    ? ` ${estadoCorreos.ultimoError}`
                    : ""}
                </p>
              )}
              {estadoCorreos.ultimaSincronizacion && (
                <p className="mt-1 text-xs text-slate-text">
                  Última sincronización Gmail:{" "}
                  {fechaLegible(estadoCorreos.ultimaSincronizacion)}
                </p>
              )}
            </div>
          )}

          {sincronizando && (
            <p role="status" className="text-sm text-slate-text">
              Analizando correos financieros…
            </p>
          )}
          {errorSincronizacion && (
            <p
              role="alert"
              className="rounded-xl border border-red-300/40 bg-red-50 p-3 text-sm text-red-700"
            >
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
                <li key={notificacion.id}>
                  <button
                    type="button"
                    onClick={(evento) => {
                      triggerDetalleRef.current = evento.currentTarget;
                      setIdNotificacionSeleccionada(notificacion.id);
                      alMarcarLeida(notificacion.id);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-colors hover:border-emerald-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${notificacion.leida ? "border-border-line/50 bg-bg-cream/40" : "border-emerald-primary/30 bg-emerald-primary/5"}`}
                    aria-label={`Ver detalle de notificación: ${notificacion.asunto}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`min-w-0 break-words text-sm ${notificacion.leida ? "text-slate-text" : "font-medium text-bg-dark"}`}
                      >
                        {notificacion.asunto}
                      </p>
                      {!notificacion.leida && (
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-primary"
                          aria-label="No leída"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-text">
                      {formatearFecha(notificacion.fecha)}
                      {notificacion.cuentaGmail
                        ? ` · ${notificacion.cuentaGmail}`
                        : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ModalDetalleRegistro>

      <ModalDetalleRegistro
        abierto={abierto && Boolean(notificacionSeleccionada)}
        titulo="Detalle de notificación"
        alCerrar={() => setIdNotificacionSeleccionada(null)}
        triggerRef={triggerDetalleRef}
        ancho="max-w-lg"
        icono={Bell}
        etiquetaCerrar="Cerrar detalle de notificación"
      >
        {notificacionSeleccionada && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-text">
                Asunto
              </p>
              <p className="mt-1 text-sm font-medium text-bg-dark break-words">
                {notificacionSeleccionada.asunto}
              </p>
            </div>
            {notificacionSeleccionada.mensaje ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-text">
                  Mensaje
                </p>
                <p className="mt-1 text-sm text-bg-dark break-words">
                  {notificacionSeleccionada.mensaje}
                </p>
              </div>
            ) : null}
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-text">
                  Fecha
                </dt>
                <dd className="mt-1 text-sm text-bg-dark">
                  {formatearFecha(notificacionSeleccionada.fecha) ||
                    "Sin fecha"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-text">
                  Estado
                </dt>
                <dd className="mt-1 text-sm text-bg-dark">
                  {notificacionSeleccionada.leida ? "Leída" : "No leída"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-text">
                  Origen
                </dt>
                <dd className="mt-1 text-sm text-bg-dark">
                  {textoOrigen(notificacionSeleccionada.origen)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-text">
                  Cuenta
                </dt>
                <dd className="mt-1 text-sm text-bg-dark break-all">
                  {notificacionSeleccionada.cuentaGmail || "No disponible"}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </ModalDetalleRegistro>
    </>
  );
}
