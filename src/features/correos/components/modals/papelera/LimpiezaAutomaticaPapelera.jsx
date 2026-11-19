/**
 * @uso        Configuración de la limpieza automática de la papelera de Gmail (cuenta, categorías, vista previa, limpieza y lista blanca)
 * @funciones  LimpiezaAutomaticaPapelera({ cuentas, gestion, accionesGestion, autorizando, aviso, alAutorizar, alCerrarAviso })
 * @datos      Recibe las cuentas Gmail conectadas y el subestado de gestión desde usePapelera
 * @eventos    Seleccionar cuenta, autorizar el permiso ampliado, guardar configuración, generar vista previa, confirmar limpieza y gestionar la lista blanca
 * @estados    Ninguno propio; el estado en curso llega por props
 * @usadoPor   ConfiguracionPage
 */
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Card } from "../../../../../components/ui";
import AvisoPermisoPapelera from "./AvisoPermisoPapelera";
import ConfiguracionPapelera from "./ConfiguracionPapelera";
import ListaBlancaRemitentes from "./ListaBlancaRemitentes";
import VistaPreviaLimpieza from "./VistaPreviaLimpieza";

const ESTILOS_AVISO = {
  exito:
    "border-emerald-primary/40 bg-emerald-primary/10 text-emerald-primary",
  info: "border-sky-300/70 bg-sky-50 text-sky-900",
  error: "border-red-300/70 bg-red-50 text-red-800",
};

/** Sección «Limpieza automática de la papelera» de la página Configuración. */
export default function LimpiezaAutomaticaPapelera({
  cuentas = [],
  gestion = {},
  accionesGestion = {},
  autorizando,
  aviso,
  alAutorizar,
  alCerrarAviso,
}) {
  const cuentaSeleccionada = String(gestion.cuentaId || "");
  const cuentaGestion =
    cuentas.find((cuenta) => String(cuenta.cuentaId) === cuentaSeleccionada) ||
    null;
  const [minimizada, setMinimizada] = useState(false);

  return (
    <Card
      como="section"
      aria-labelledby="limpieza-papelera-titulo"
      className="space-y-3 p-6"
    >
      <h2
        id="limpieza-papelera-titulo"
        className="font-display text-lg font-semibold text-bg-dark"
      >
        <button
          type="button"
          onClick={() => setMinimizada((actual) => !actual)}
          aria-expanded={!minimizada}
          aria-label={`${minimizada ? "Expandir" : "Minimizar"} la limpieza automática de la papelera`}
          className="flex w-full items-center justify-between gap-2 rounded-lg text-left transition-colors hover:bg-bg-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
        >
          <span>Limpieza automática de la papelera</span>
          <ChevronDown
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 text-slate-text transition-transform ${minimizada ? "-rotate-90" : ""}`}
          />
        </button>
      </h2>

      {!minimizada && (
        <>
          <p className="mt-1 text-xs text-slate-text">
            Elige qué correos recibidos se mueven solos a la papelera, revisa
            cuántos se moverían y gestiona los remitentes que nunca se mueven.
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

      {cuentas.length === 0 && (
        <p className="rounded-2xl border border-border-line/50 bg-bg-cream/70 p-4 text-sm text-slate-text">
          Conecta una cuenta Gmail para configurar la limpieza automática de su
          papelera.
        </p>
      )}

      {cuentas.length > 1 && (
        <label className="block text-xs text-slate-text">
          Cuenta a configurar
          <select
            value={cuentaSeleccionada}
            onChange={(evento) =>
              accionesGestion.alSeleccionarCuenta?.(evento.target.value)
            }
            className="mt-1 block w-full max-w-xs rounded-lg border border-border-line bg-bg-cream px-2 py-1.5 text-sm text-bg-dark"
          >
            {cuentas.map((cuenta) => (
              <option key={cuenta.cuentaId} value={cuenta.cuentaId}>
                {cuenta.email || cuenta.cuentaId}
              </option>
            ))}
          </select>
        </label>
      )}

      {cuentas.length > 0 &&
        (gestion.requierePermiso ? (
          <AvisoPermisoPapelera
            cuentaId={gestion.cuentaId}
            email={cuentaGestion?.email}
            autorizando={String(autorizando) === String(gestion.cuentaId)}
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
        ))}
        </>
      )}
    </Card>
  );
}
