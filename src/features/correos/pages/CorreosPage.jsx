/**
 * @uso        Bandeja de correo Gmail por fuentes y cuentas conectadas
 * @funciones  CorreosPage()
 * @datos      Coordina useCorreos, usePapelera, notificaciones Gmail, tarjetas y bandejas modales
 * @eventos    Abrir bandeja de notificaciones, marcar como leída al abrir su detalle, abrir la papelera, seleccionar dirección y filtrar mensajes
 * @estados    bandejaNotificacionesAbierta, papeleraAbierta y referencias de foco/disparadores
 * @usadoPor   App.jsx mediante la API pública de features/correos
 */
import { useMemo, useRef, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui";
import { useCorreos } from "../hooks/useCorreos";
import { useNotificacionesCorreos } from "../hooks/useNotificacionesCorreos";
import { usePapelera } from "../hooks/usePapelera";
import CorreoCuentaCard from "../components/cards/CorreoCuentaCard";
import BandejaCorreosModal from "../components/modals/BandejaCorreosModal";
import BandejaNotificacionesModal from "../components/modals/BandejaNotificacionesModal";
import PapeleraCorreosModal from "../components/modals/PapeleraCorreosModal";
import { AlertaGlobal } from "../../../features/error";

/** Renderiza las direcciones y entrega las acciones de datos a su hook. */
export default function CorreosPage() {
  const estado = useCorreos();
  const disparadorFuenteRef = useRef(null);
  const disparadorNotificacionesRef = useRef(null);
  const disparadorPapeleraRef = useRef(null);
  const [bandejaNotificacionesAbierta, setBandejaNotificacionesAbierta] =
    useState(false);
  const [papeleraAbierta, setPapeleraAbierta] = useState(false);
  const papelera = usePapelera({ activo: papeleraAbierta });
  const mensajesFinancieros = useMemo(
    () => [
      ...new Map(
        Object.values(estado.mensajesPorFuente)
          .flat()
          .map((correo) => [correo.id, correo]),
      ).values(),
    ],
    [estado.mensajesPorFuente],
  );
  const notificaciones = useNotificacionesCorreos({
    gmailConectado: estado.gmailConectado,
    cuentasGmail: estado.cuentasGmail,
    mensajes: mensajesFinancieros,
  });
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">
            FinApp / Panel
          </p>
          <h1
            id="dashboard-title"
            className="mt-1 font-display text-3xl font-medium text-bg-dark"
          >
            Correos
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Consulta los mensajes de cada fuente registrada y cuenta Gmail
            conectada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {estado.gmailConectado && (
            <button
              ref={disparadorPapeleraRef}
              type="button"
              onClick={() => setPapeleraAbierta(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border-line bg-bg-cream/70 px-4 py-2.5 text-sm font-medium text-bg-dark transition-colors hover:border-emerald-primary/50 hover:text-emerald-primary"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">Papelera</span>
            </button>
          )}
          {estado.gmailConectado ? (
            <button
              ref={disparadorNotificacionesRef}
              type="button"
              onClick={() => setBandejaNotificacionesAbierta(true)}
              aria-label={
                notificaciones.noLeidas > 0
                  ? `Abrir notificaciones, ${notificaciones.noLeidas} sin leer`
                  : "Abrir notificaciones"
              }
              className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border-line bg-bg-cream/70 px-4 py-2.5 text-sm font-medium text-bg-dark transition-colors hover:border-emerald-primary/50 hover:text-emerald-primary"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">Notificaciones</span>
              {notificaciones.noLeidas > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                  {notificaciones.noLeidas > 99
                    ? "99+"
                    : notificaciones.noLeidas}
                </span>
              )}
            </button>
          ) : (
            <Link
              to="/dashboard/configuracion"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover"
            >
              Ir a Configuración para conectar Gmail
            </Link>
          )}
        </div>
      </div>

      {notificaciones.toast && (
        <div
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[1200] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0"
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            onClick={() => {
              notificaciones.cerrarToast();
              setBandejaNotificacionesAbierta(true);
            }}
            className="flex w-full items-start gap-3 rounded-2xl border border-emerald-primary/30 bg-bg-cream/95 p-4 text-left shadow-xl glass-surface"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-bg-dark">
                Nueva notificación
              </span>
              <span className="mt-0.5 block truncate text-sm text-slate-text">
                {notificaciones.toast.mensaje}
              </span>
            </span>
          </button>
        </div>
      )}

      <Card className="space-y-3 p-5">
        <h2 className="font-display text-base font-semibold text-bg-dark">
          Fuentes y cuentas para consultar
        </h2>
        {estado.cuentaGmail && (
          <p className="text-xs text-emerald-primary">
            Consulta automática desde {estado.cuentaGmail}
          </p>
        )}
        {estado.cargandoFuentes && (
          <p role="status" className="text-sm text-slate-text">
            Cargando fuentes...
          </p>
        )}
        {!estado.cargandoFuentes && !estado.usuario?.idUsuario && (
          <p className="text-sm text-slate-text">
            Inicia sesión para conectar tus fuentes.
          </p>
        )}
        {estado.noHayFuentes && (
          <p className="text-sm text-slate-text">
            Conecta una cuenta Gmail o registra una fuente de correo para
            consultar mensajes.
          </p>
        )}
        {!estado.cargandoFuentes && estado.tarjetasCorreo.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {estado.tarjetasCorreo.map((fuente) => (
              <CorreoCuentaCard
                key={fuente.idFuente}
                fuente={fuente}
                seleccionada={
                  estado.fuenteSeleccionada?.idFuente === fuente.idFuente
                }
                cantidadMensajes={
                  estado.mensajesPorFuente[fuente.idFuente]?.length || 0
                }
                alAbrir={(evento) => {
                  disparadorFuenteRef.current = evento.currentTarget;
                  estado.seleccionarFuente(fuente);
                }}
              />
            ))}
          </div>
        )}
        {estado.fuentes.length > 0 && !estado.gmailConectado && (
          <p className="text-xs text-slate-text">
            Al conectar Gmail, Google solicitará permiso de solo lectura para
            toda la bandeja. FinApp limitará sus búsquedas a mensajes recibidos
            en estas direcciones y no guardará los mensajes.
          </p>
        )}
      </Card>

      <AlertaGlobal
        tipo="error"
        mensaje={estado.error}
        idBase="CorreosPage-estado-error"
      />

      <BandejaCorreosModal
        fuente={estado.fuenteSeleccionada}
        gmailConectado={estado.gmailConectado}
        cuentaId={estado.cuentaSeleccionadaId}
        mensajesFuente={estado.mensajesFuente}
        cargandoMensajes={estado.cargandoMensajes}
        triggerRef={disparadorFuenteRef}
        alCerrar={estado.cerrarBandeja}
        alMover={estado.moverCorreoAPapelera}
        alAutorizarPermiso={(cuentaId) =>
          papelera.autorizarPermiso(cuentaId).catch(() => {})
        }
      />
      <PapeleraCorreosModal
        abierto={papeleraAbierta}
        alCerrar={() => setPapeleraAbierta(false)}
        triggerRef={disparadorPapeleraRef}
        gmailConectado={estado.gmailConectado}
        secciones={papelera.secciones}
        cargando={papelera.cargando}
        restaurando={papelera.restaurando}
        autorizando={papelera.autorizando}
        aviso={papelera.aviso}
        alRestaurar={papelera.restaurar}
        alAutorizar={(cuentaId) =>
          papelera.autorizarPermiso(cuentaId).catch(() => {})
        }
        alReintentar={papelera.reintentarCuenta}
        alCerrarAviso={papelera.cerrarAviso}
      />
      <BandejaNotificacionesModal
        abierto={bandejaNotificacionesAbierta}
        alCerrar={() => setBandejaNotificacionesAbierta(false)}
        triggerRef={disparadorNotificacionesRef}
        notificaciones={notificaciones.notificaciones}
        alMarcarTodasLeidas={notificaciones.marcarTodasLeidas}
        alMarcarLeida={notificaciones.marcarComoLeida}
        alLimpiar={notificaciones.limpiarBandeja}
        sincronizando={notificaciones.sincronizando}
        errorSincronizacion={notificaciones.errorSincronizacion}
        estadoCorreos={estado.gmailConectado ? estado.estadoCorreos : null}
      />
    </section>
  );
}
