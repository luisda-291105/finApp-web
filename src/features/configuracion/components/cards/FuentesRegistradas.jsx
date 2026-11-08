import { useRef, useState } from "react";
import { Card } from "../../../../components/ui";
import { FuenteDetalleModal } from "../modals";
import FuenteItem from "./FuenteItem";
import EstadoFuente from "./EstadoFuente";

export default function FuentesRegistradas({ disparadorFuentesRef, abrirModalFuentes, alReconectarGmail, gmailConfigurado, gisListo, conexionCargando, errorGmail, avisoGmail, tokenGmail, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, seleccionarCuentaGmail, desconectarGmail, cargandoFuentes, errorFuentes, fuentes, guardarEdicionFuente, confirmarEliminacionFuente, operacionFuente, errorOperacionFuente }) {
  const [fuenteSeleccionadaId, setFuenteSeleccionadaId] = useState(null);
  const fuenteTriggerRef = useRef(null);
  const gmailConectado = Boolean(tokenGmail && !errorGmail && !conexionCargando);
  const fuenteSeleccionada = fuentes.find((fuente) => fuente.idFuente === fuenteSeleccionadaId) || null;
  const cuentaVinculada = (fuente) => fuente.tipo?.toUpperCase() === "CORREO"
    ? cuentasGmail.find((cuenta) => cuenta.email?.trim().toLowerCase() === fuente.contenido?.trim().toLowerCase())
    : null;
  const cuentasSinFuente = cuentasGmail.filter((cuenta) => !fuentes.some((fuente) => fuente.tipo?.toUpperCase() === "CORREO" && cuenta.email?.trim().toLowerCase() === fuente.contenido?.trim().toLowerCase()));

  const abrirDetalle = (fuente, trigger) => {
    fuenteTriggerRef.current = trigger;
    setFuenteSeleccionadaId(fuente.idFuente);
  };
  const cerrarDetalle = () => setFuenteSeleccionadaId(null);

  return (
    <>
      <Card className="space-y-4 p-6">
        <div className="flex flex-col gap-4 border-t border-border-line/60 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-bg-dark">Fuentes registradas</h2>
            <p className="mt-1 text-sm text-slate-text">Consulta y administra las fuentes asociadas a tu usuario.</p>
          </div>
          <button ref={disparadorFuentesRef} type="button" className="min-h-11 rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2" onClick={abrirModalFuentes}>Registrar fuentes</button>
        </div>

        {errorGmail && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorGmail}</p>}
        {avisoGmail && <p role="status" className="text-sm text-emerald-primary">{avisoGmail}</p>}

        <div className="space-y-3 pt-2" aria-label="Fuentes registradas">
          {cargandoFuentes && <p role="status" className="text-sm text-slate-text">Cargando fuentes...</p>}
          {!cargandoFuentes && errorFuentes && <p role="alert" className="text-xs text-red-600">{errorFuentes}</p>}
          {!cargandoFuentes && !errorFuentes && fuentes.length === 0 && cuentasGmail.length === 0 && <p className="text-sm text-slate-text">No hay fuentes registradas actualmente.</p>}
          {!cargandoFuentes && !errorFuentes && fuentes.map((fuente) => (
            <FuenteItem
              key={fuente.idFuente}
              fuente={fuente}
              gmailConectado={gmailConectado}
              cuentaVinculada={Boolean(cuentaVinculada(fuente))}
              alAbrir={(evento) => abrirDetalle(fuente, evento.currentTarget)}
            />
          ))}
          {!cargandoFuentes && !errorFuentes && cuentasSinFuente.map((cuenta) => (
            <div key={`gmail-${cuenta.id}`} className="flex min-h-16 min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-border-line/40 bg-bg-cream/60 p-4">
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-primary">Cuenta Gmail</p><p className="mt-1 break-all text-sm font-medium text-bg-dark">{cuenta.email}</p></div>
              <div className="flex flex-wrap items-center gap-2"><EstadoFuente activo={gmailConectado} /><button type="button" onClick={() => seleccionarCuentaGmail(cuenta.id)} className="min-h-9 rounded-lg px-3 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10">{String(cuenta.id) === String(cuentaSeleccionadaId) ? "Seleccionada" : "Consultar"}</button><button type="button" onClick={() => desconectarGmail(true, cuenta.id)} className="min-h-9 rounded-lg px-3 text-xs font-medium text-red-700 hover:bg-red-100">Desconectar</button></div>
            </div>
          ))}
        </div>
      </Card>

      <FuenteDetalleModal
        abierto={Boolean(fuenteSeleccionada)}
        fuente={fuenteSeleccionada}
        triggerRef={fuenteTriggerRef}
        cuenta={fuenteSeleccionada ? cuentaVinculada(fuenteSeleccionada) : null}
        gmailConectado={gmailConectado}
        gmailConfigurado={gmailConfigurado}
        gisListo={gisListo}
        conexionCargando={conexionCargando}
        errorGmail={errorGmail}
        alReconectarGmail={alReconectarGmail}
        cuentaSeleccionadaId={cuentaSeleccionadaId}
        seleccionarCuentaGmail={seleccionarCuentaGmail}
        desconectarGmail={desconectarGmail}
        alCerrar={cerrarDetalle}
        alGuardarEdicion={guardarEdicionFuente}
        alEliminar={confirmarEliminacionFuente}
        operacionFuente={operacionFuente}
        errorOperacionFuente={errorOperacionFuente}
      />
    </>
  );
}
