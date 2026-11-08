import { useEffect, useState } from "react";
import { BotonServicioExterno } from "../../../../components/ui";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import EstadoFuente from "../cards/EstadoFuente";

const claseCampo = "min-h-11 w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 text-sm text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary";

export default function FuenteDetalleModal({ abierto, fuente, triggerRef, cuenta, gmailConectado, gmailConfigurado, gisListo, conexionCargando, errorGmail, alReconectarGmail, cuentaSeleccionadaId, seleccionarCuentaGmail, desconectarGmail, alCerrar, alGuardarEdicion, alEliminar, operacionFuente, errorOperacionFuente }) {
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false);
  const [tipo, setTipo] = useState(fuente?.tipo || "OTRO");
  const [contenido, setContenido] = useState(fuente?.contenido || "");
  const [estado, setEstado] = useState(fuente?.estado !== false);

  useEffect(() => {
    if (abierto && fuente) {
      setTipo(fuente.tipo || "OTRO");
      setContenido(fuente.contenido || "");
      setEstado(fuente.estado !== false);
      setEditando(false);
      setConfirmandoEliminacion(false);
    }
  }, [abierto, fuente]);

  if (!fuente) return null;

  const guardar = async (evento) => {
    evento.preventDefault();
    const guardado = await alGuardarEdicion({ ...fuente, tipo, contenido, estado });
    if (guardado) setEditando(false);
  };

  const eliminar = async () => {
    const eliminado = await alEliminar(fuente);
    if (eliminado) alCerrar();
  };
  const cuentaConectada = Boolean(cuenta && gmailConectado && String(cuenta.id) === String(cuentaSeleccionadaId));

  return (
    <ModalDetalleRegistro abierto={abierto} titulo="Detalle de fuente" alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-lg">
      {editando ? (
        <form className="space-y-4" onSubmit={guardar}>
          {errorOperacionFuente && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorOperacionFuente}</p>}
          {errorGmail && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorGmail}</p>}
          <label className="block space-y-1.5 text-sm font-medium text-bg-dark">Tipo
            <select className={claseCampo} value={tipo} onChange={(evento) => setTipo(evento.target.value)}>
              <option value="CORREO">Correo</option><option value="TELEFONO">Teléfono</option><option value="OTRO">Otro</option>
            </select>
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-bg-dark">Contenido
            <input className={claseCampo} value={contenido} maxLength={255} required onChange={(evento) => setContenido(evento.target.value)} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-bg-dark">Estado
            <select className={claseCampo} value={String(estado)} onChange={(evento) => setEstado(evento.target.value === "true")}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </select>
          </label>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border-line/30 pt-4">
            <button type="button" disabled={operacionFuente} onClick={() => setEditando(false)} className="min-h-10 rounded-xl border border-border-line px-4 text-sm">Cancelar</button>
            <button type="submit" disabled={operacionFuente || !contenido.trim()} className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white disabled:opacity-50">{operacionFuente ? "Guardando…" : "Guardar cambios"}</button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          {errorOperacionFuente && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorOperacionFuente}</p>}
          {errorGmail && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorGmail}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-lg bg-emerald-primary/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-primary">{fuente.tipo || "OTRO"}</span>
            <EstadoFuente activo={fuente.estado !== false} />
          </div>
          <dl className="grid min-w-0 gap-4 rounded-2xl border border-border-line/40 bg-bg-cream/50 p-4">
            <div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Contenido</dt><dd className="mt-1 break-all text-sm font-medium text-bg-dark">{fuente.contenido || "-"}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Fecha registrada</dt><dd className="mt-1 text-sm text-bg-dark">{fuente.fechaCreacion || "-"}</dd></div>
          </dl>
          {cuenta && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-line/40 p-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-text">Cuenta Gmail</p><p className="mt-1 break-all text-sm text-bg-dark">{cuenta.email}</p></div><div className="flex flex-wrap gap-2">{cuentaConectada ? <><button type="button" onClick={() => seleccionarCuentaGmail(cuenta.id)} className="min-h-9 rounded-lg px-3 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10">Seleccionada</button><button type="button" onClick={() => desconectarGmail(true, cuenta.id)} className="min-h-9 rounded-lg px-3 text-xs font-medium text-red-700 hover:bg-red-100">Desconectar</button></> : <BotonServicioExterno onClick={alReconectarGmail} disabled={!gmailConfigurado || !gisListo || conexionCargando}>{conexionCargando ? "Conectando con Google…" : "Conectar Gmail con Google"}</BotonServicioExterno>}</div></div>}
          {!cuenta && fuente.tipo?.toUpperCase() === "CORREO" && <BotonServicioExterno onClick={alReconectarGmail} disabled={!gmailConfigurado || !gisListo || conexionCargando}>{conexionCargando ? "Conectando con Google…" : "Conectar Gmail con Google"}</BotonServicioExterno>}
          {confirmandoEliminacion ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3"><p className="text-sm font-medium text-red-800">¿Eliminar esta fuente?</p><div className="mt-3 flex justify-end gap-2"><button type="button" disabled={operacionFuente} onClick={() => setConfirmandoEliminacion(false)} className="min-h-10 rounded-lg px-3 text-sm">Cancelar</button><button type="button" disabled={operacionFuente} onClick={eliminar} className="min-h-10 rounded-lg bg-red-700 px-3 text-sm font-semibold text-white disabled:opacity-50">{operacionFuente ? "Eliminando…" : "Confirmar eliminación"}</button></div></div> : <div className="flex flex-wrap justify-end gap-2 border-t border-border-line/30 pt-4"><button type="button" onClick={() => setEditando(true)} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-dark/5">Editar</button><button type="button" onClick={() => setConfirmandoEliminacion(true)} className="min-h-10 rounded-xl border border-red-700/30 px-4 text-sm font-medium text-red-700 hover:bg-red-50">Eliminar</button></div>}
        </div>
      )}
    </ModalDetalleRegistro>
  );
}
