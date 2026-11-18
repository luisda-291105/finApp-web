/**
 * @uso        Vista modal de la Papelera de Gmail (multi-cuenta) con restaurar por fila y limpieza automática
 * @funciones  PapeleraCorreosModal({ abierto, alCerrar, secciones, gestion, accionesGestion, ... })
 * @datos      Secciones por cuenta con los correos en vivo de la papelera, configuración de limpieza, vista previa, lote y lista blanca
 * @eventos    Restaurar por fila, autorizar el permiso ampliado, reintentar una cuenta, guardar la configuración, previsualizar, limpiar y gestionar la lista blanca
 * @estados    Ninguno propio; recibe el estado de usePapelera por props
 * @usadoPor   CorreosPage
 */
import { Trash2, X } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import AvisoPermisoPapelera from "./papelera/AvisoPermisoPapelera";
import ConfiguracionPapelera from "./papelera/ConfiguracionPapelera";
import ListaBlancaRemitentes from "./papelera/ListaBlancaRemitentes";
import ListaPapeleraCorreos from "./papelera/ListaPapeleraCorreos";
import VistaPreviaLimpieza from "./papelera/VistaPreviaLimpieza";

const ESTILOS_AVISO = {
  exito:
    "border-emerald-primary/40 bg-emerald-primary/10 text-emerald-primary",
  info: "border-sky-300/70 bg-sky-50 text-sky-900",
  error: "border-red-300/70 bg-red-50 text-red-800",
};

/** Presenta la papelera de cada cuenta conectada, distinguiendo vacío, error y permiso. */
export default function PapeleraCorreosModal({
  abierto,
  alCerrar,
  triggerRef,
  gmailConectado = false,
  secciones = [],
  cargando = false,
  restaurando = {},
  autorizando = null,
  aviso = null,
  alRestaurar,
  alAutorizar,
  alReintentar,
  alCerrarAviso,
  gestion = {},
  accionesGestion = {},
}) {
  const hayProblema = secciones.some(
    (seccion) =>
      Boolean(seccion.error) ||
      seccion.requierePermiso ||
      seccion.requiereReconexion,
  );
  const hayCorreos = secciones.some(
    (seccion) => (seccion.correos?.length || 0) > 0,
  );
  // El estado vacío es propio de la papelera y NO se confunde con un error ni
  // con la falta de permiso de una cuenta.
  const vaciaGlobal =
    gmailConectado && !cargando && !hayProblema && !hayCorreos;
  const seccionGestion = secciones.find(
    (seccion) => String(seccion.cuentaId) === String(gestion.cuentaId),
  );

  return (
    <ModalDetalleRegistro
      abierto={abierto}
      titulo="Papelera de correos"
      alCerrar={alCerrar}
      triggerRef={triggerRef}
      ancho="max-w-3xl"
      etiquetaCerrar="Cerrar la papelera de correos"
      icono={Trash2}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-text">
          Correos movidos a la Papelera de Gmail. Puedes restaurarlos a la
          bandeja mientras Gmail no los haya eliminado definitivamente.
        </p>

        {aviso && (
          <div
            role={aviso.tipo === "error" ? "alert" : "status"}
            className={`flex items-start justify-between gap-3 rounded-2xl border p-3 text-sm ${ESTILOS_AVISO[aviso.tipo] || ESTILOS_AVISO.info}`}
          >
            <span>{aviso.mensaje}</span>
            {alCerrarAviso && (
              <button
                type="button"
                onClick={alCerrarAviso}
                aria-label="Cerrar aviso"
                className="shrink-0 rounded-lg p-1 hover:bg-black/5"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {!gmailConectado && (
          <p className="rounded-2xl border border-border-line/50 bg-bg-cream/70 p-4 text-sm text-slate-text">
            Conecta una cuenta Gmail para ver su papelera.
          </p>
        )}

        {gmailConectado && cargando && secciones.length === 0 && (
          <p role="status" className="text-sm text-slate-text">
            Consultando la papelera de Gmail...
          </p>
        )}

        {vaciaGlobal && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border-line/50 bg-bg-cream/70 px-6 py-8 text-center">
            <Trash2
              aria-hidden="true"
              className="h-8 w-8 text-slate-text"
              strokeWidth={1.5}
            />
            <p className="text-sm font-semibold text-bg-dark">
              La papelera está vacía
            </p>
            <p className="max-w-sm text-xs text-slate-text">
              Cuando muevas un correo a la papelera aparecerá aquí, listo para
              restaurarlo.
            </p>
          </div>
        )}

        {gmailConectado &&
          !vaciaGlobal &&
          secciones.map((seccion) => (
            <section key={seccion.cuentaId} className="space-y-2">
              {seccion.email && (
                <h3 className="font-display text-sm font-semibold text-bg-dark">
                  {seccion.email}
                </h3>
              )}
              {seccion.requierePermiso || seccion.requiereReconexion ? (
                <AvisoPermisoPapelera
                  cuentaId={seccion.cuentaId}
                  email={seccion.email}
                  requiereReconexion={seccion.requiereReconexion}
                  autorizando={
                    String(autorizando) === String(seccion.cuentaId)
                  }
                  alAutorizar={alAutorizar}
                />
              ) : (
                <ListaPapeleraCorreos
                  seccion={seccion}
                  restaurando={restaurando}
                  alRestaurar={alRestaurar}
                  alReintentar={alReintentar}
                />
              )}
            </section>
          ))}

        {gmailConectado && (
          <section className="space-y-3 rounded-2xl border border-border-line/50 bg-bg-cream/40 p-4">
            <h3 className="font-display text-sm font-semibold text-bg-dark">
              Limpieza automática de la papelera
            </h3>
            <p className="text-xs text-slate-text">
              Elige qué correos recibidos se mueven solos a la papelera, revisa
              cuántos se moverían y gestiona los remitentes que nunca se mueven.
            </p>

            {secciones.length > 1 && (
              <label className="block text-xs text-slate-text">
                Cuenta a configurar
                <select
                  value={gestion.cuentaId || ""}
                  onChange={(evento) =>
                    accionesGestion.alSeleccionarCuenta?.(evento.target.value)
                  }
                  className="mt-1 block w-full max-w-xs rounded-lg border border-border-line bg-bg-cream px-2 py-1.5 text-sm text-bg-dark"
                >
                  {secciones.map((seccion) => (
                    <option key={seccion.cuentaId} value={seccion.cuentaId}>
                      {seccion.email || seccion.cuentaId}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {gestion.requierePermiso ? (
              <AvisoPermisoPapelera
                cuentaId={gestion.cuentaId}
                email={seccionGestion?.email}
                autorizando={
                  String(autorizando) === String(gestion.cuentaId)
                }
                alAutorizar={alAutorizar}
              />
            ) : (
              <>
                <ConfiguracionPapelera
                  configuracion={gestion.configuracion}
                  guardando={gestion.guardandoConfiguracion}
                  previsualizando={gestion.generandoVistaPrevia}
                  vistaPreviaInformativa={gestion.vistaPreviaInformativa}
                  alGuardar={accionesGestion.alGuardarConfiguracion}
                  alPrevisualizar={accionesGestion.alPrevisualizar}
                />
                <VistaPreviaLimpieza
                  configuracion={gestion.configuracion}
                  vistaPrevia={gestion.vistaPreviaLimpieza}
                  generando={gestion.generandoVistaPrevia}
                  limpiando={gestion.limpiando}
                  desactualizada={gestion.vistaPreviaDesactualizada}
                  lote={gestion.lote}
                  alGenerarVistaPrevia={accionesGestion.alGenerarVistaPrevia}
                  alConfirmarLimpieza={accionesGestion.alConfirmarLimpieza}
                  alRefrescarLote={accionesGestion.alRefrescarLote}
                />
                <ListaBlancaRemitentes
                  remitentes={gestion.listaBlanca}
                  cargando={gestion.cargandoListaBlanca}
                  agregando={gestion.agregandoRemitente}
                  eliminandoId={gestion.eliminandoRemitenteId}
                  alAgregar={accionesGestion.alAgregarRemitente}
                  alEliminar={accionesGestion.alEliminarRemitente}
                />
              </>
            )}
          </section>
        )}
      </div>
    </ModalDetalleRegistro>
  );
}
