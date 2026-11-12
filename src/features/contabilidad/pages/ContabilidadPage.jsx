/**
 * @uso        Contabilidad con bolsillos persistidos y movimientos
 * @funciones  PaginaDashboardContabilidad()
 * @datos      Consulta bolsillos y movimientos del usuario mediante los servicios de dominio
 * @eventos    CRUD de bolsillos, registro de movimientos y filtros por tipo
 * @estados    bolsillos, resúmenes, movimientos, filtros y modales
 * @usadoPor   App.jsx (ruta /dashboard/contabilidad)
 */
import { useState } from "react";
import { ClipboardCheck, Plus, Wallet } from "lucide-react";
import { Card } from "../../../components/ui";
import RespuestaMovimiento from "../components/feedback/RespuestaMovimiento";
import ModalCrearMovimientoContable from "../components/modals/ModalCrearMovimientoContable";
import ModalBolsillo from "../components/modals/ModalBolsillo";
import DetalleBolsilloModal from "../components/modals/DetalleBolsilloModal";
import DetalleMovimientoModal from "../components/modals/DetalleMovimientoModal";
import ModalMovimientosPorRevisar from "../components/modals/ModalMovimientosPorRevisar";
import ResumenGlobalCards from "../components/cards/ResumenGlobalCards";
import ModalDetalleRegistro from "../../../components/domain/modales/ModalDetalleRegistro";
import useContabilidad from "../hooks/useContabilidad";
import BolsilloCard from "../components/cards/BolsilloCard";
import BolsillosFijosCard from "../components/cards/BolsillosFijosCard";
import MovimientoItem from "../components/cards/MovimientoItem";
import { agregarSaldoDisponible, crearFiltrosMovimiento, esBolsilloFijo } from "../utils/contabilidadHelpers";

/** Página de bolsillos persistidos y movimientos contables. */
export default function PaginaDashboardContabilidad() {
  const [bolsilloDetalle, setBolsilloDetalle] = useState(null);
  const [movimientoDetalle, setMovimientoDetalle] = useState(null);
  const [valoresPredeterminados, setValoresPredeterminados] = useState(null);
  const [bandejaRevisionAbierta, setBandejaRevisionAbierta] = useState(false);
  const [recargaRevision, setRecargaRevision] = useState(0);
  const {
    navigate, usuario, movimientos, filtroMovimiento, setFiltroMovimiento, cargandoMovimientos, errorMovimientos,
    resumenesBolsillos, cargandoResumenes, errorResumenes, crearMovimientoAbierto, setCrearMovimientoAbierto,
    resumenGlobal, cargandoResumenGlobal, errorResumenGlobal, mesResumenGlobal, setMesResumenGlobal,
    movimientoEditando, setMovimientoEditando, movimientoEliminando, setMovimientoEliminando,
    eliminandoMovimiento, errorEliminarMovimiento, setErrorEliminarMovimiento, respuesta, setRespuesta, bolsillos, tarjetas,
    cargandoBolsillos, errorBolsillos, modalBolsillo, setModalBolsillo,
    disparadorBolsilloRef, disparadorMovimientoRef, abrirModalBolsillo, guardarBolsillo,
    borrarBolsillo, guardarMovimiento, confirmarEliminarMovimiento, recargarMovimientos,
  } = useContabilidad();

  const guardarMovimientoYActualizarRevision = async (movimiento) => {
    await guardarMovimiento(movimiento);
    setRecargaRevision((actual) => actual + 1);
  };

  const bolsillosActivos = bolsillos.filter((bolsillo) => bolsillo.estado !== false);
  const bolsillosConSaldo = agregarSaldoDisponible(bolsillos, resumenesBolsillos);
  const bolsillosMovimiento = movimientoEditando ? bolsillosConSaldo : bolsillosConSaldo.filter((bolsillo) => bolsillo.estado !== false);
  const filtrosMovimiento = crearFiltrosMovimiento(bolsillos);
  const cantidadPorRevisar = Number(resumenGlobal?.porRevisar ?? 0);

  return (
    <section aria-labelledby="contabilidad-titulo" className="space-y-6 pt-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="contabilidad-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">Contabilidad</h1>
          <p className="mt-1 text-sm text-slate-text">Revisa tus gastos, ahorros y balance disponible.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setBandejaRevisionAbierta(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-600 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />Por revisar <span aria-label={`${cantidadPorRevisar} movimientos pendientes`}>({cantidadPorRevisar})</span>
          </button>
          <button ref={disparadorMovimientoRef} type="button" disabled={bolsillosActivos.length === 0} onClick={() => { if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; } setRespuesta(null); setMovimientoEditando(null); setCrearMovimientoAbierto(true); }} title={bolsillosActivos.length === 0 ? "Crea y activa un bolsillo para registrar movimientos" : undefined} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-semibold text-bg-cream shadow-sm transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50">
            <Plus className="h-4 w-4" aria-hidden="true" />Nuevo movimiento
          </button>
          <button ref={disparadorBolsilloRef} type="button" onClick={(evento) => { if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; } abrirModalBolsillo("crear", null, evento); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-primary px-4 py-2.5 text-sm font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />Nuevo bolsillo
          </button>
        </div>
      </header>
      <ResumenGlobalCards resumen={resumenGlobal} mes={mesResumenGlobal} alCambiarMes={setMesResumenGlobal}
        cargando={cargandoResumenGlobal} error={errorResumenGlobal} />
      <section aria-labelledby="bolsillos-contables-titulo" className="space-y-4">
        <div>
          <h2 id="bolsillos-contables-titulo" className="font-display text-xl font-semibold text-bg-dark">Bolsillos</h2>
          <p className="mt-1 text-sm text-slate-text">Organiza tu dinero en espacios con nombre y estado propio.</p>
        </div>
        {errorBolsillos && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorBolsillos}</p>}
        {cargandoBolsillos && <p role="status" className="text-sm text-slate-text">Cargando bolsillos…</p>}
        {!cargandoBolsillos && !errorBolsillos && bolsillos.length === 0 && <Card className="p-8 text-center"><Wallet className="mx-auto h-8 w-8 text-emerald-primary" aria-hidden="true" /><p className="mt-3 font-medium text-bg-dark">Todavía no tienes bolsillos</p><p className="mt-1 text-sm text-slate-text">Crea uno para empezar a organizar tu contabilidad.</p></Card>}
        {!cargandoBolsillos && bolsillos.length > 0 && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(() => {
            const fijos = bolsillos.filter(esBolsilloFijo);
            const propios = bolsillos.filter((bolsillo) => !esBolsilloFijo(bolsillo));
            return (<>
              {fijos.length > 0 && <BolsillosFijosCard
                fijos={fijos}
                resumenes={resumenesBolsillos}
                cargando={cargandoResumenes}
                alRegistrar={(bolsillo, evento) => {
                  if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; }
                  setRespuesta(null); setMovimientoEditando(null);
                  setValoresPredeterminados({ idBolsillo: bolsillo.idBolsillo });
                  setCrearMovimientoAbierto(true);
                  disparadorMovimientoRef.current = evento.currentTarget;
                }}
              />}
              {propios.map((bolsillo) => <BolsilloCard
                key={bolsillo.idBolsillo}
                bolsillo={bolsillo}
                resumen={resumenesBolsillos[bolsillo.idBolsillo]}
                cargandoResumen={cargandoResumenes}
                errorResumen={errorResumenes}
                onDetalle={(evento) => { disparadorBolsilloRef.current = evento.currentTarget; setBolsilloDetalle(bolsillo); }}
              />)}
            </>);
          })()}
        </div>}
      </section>

      <Card como="section" aria-labelledby="movimientos-titulo" className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border-line/60 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 id="movimientos-titulo" className="font-display text-xl font-semibold text-bg-dark">Movimientos de todos los bolsillos</h2><p className="mt-1 text-sm text-slate-text">Filtra por tipo para ver ingresos, gastos o ahorros sin importar el bolsillo.</p></div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border-line/30 px-5 py-3" role="group" aria-label="Filtrar movimientos por tipo">
          {filtrosMovimiento.map((filtro) => <button key={filtro.valor} type="button" aria-pressed={filtroMovimiento === filtro.valor} onClick={() => setFiltroMovimiento(filtro.valor)} className={`min-h-9 rounded-full px-3 text-sm font-medium transition-colors ${filtroMovimiento === filtro.valor ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark"}`}>{filtro.valor === "TODOS" ? "Todos" : filtro.etiqueta}</button>)}
        </div>
        {errorMovimientos && <p role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMovimientos}</p>}
        {cargandoMovimientos && <p role="status" className="px-5 py-8 text-center text-sm text-slate-text">Cargando movimientos...</p>}
        {!cargandoMovimientos && !errorMovimientos && (movimientos.length > 0 ? <ul aria-label="Movimientos de todos los bolsillos" className="divide-y divide-border-line/50 px-5">
          {movimientos.map((movimiento) => <MovimientoItem
            key={movimiento.idMovimiento}
            movimiento={movimiento}
            onDetalle={(evento) => { disparadorMovimientoRef.current = evento.currentTarget; setMovimientoDetalle(movimiento); }}
          />)}
        </ul> : <p className="px-5 py-10 text-center text-slate-text">Sin movimientos registrados en este filtro.</p>)}
      </Card>

      <RespuestaMovimiento respuesta={respuesta} className="fixed right-4 top-20 z-40 w-[min(calc(100vw-2rem),24rem)] border-emerald-700 bg-emerald-700 px-5 py-4 text-base font-semibold text-white shadow-xl" />

      <ModalBolsillo abierto={modalBolsillo.abierto} modo={modalBolsillo.modo} bolsillo={modalBolsillo.bolsillo} bolsillos={bolsillos} triggerRef={disparadorBolsilloRef} alCerrar={() => setModalBolsillo({ abierto: false, modo: "crear", bolsillo: null })} alGuardar={guardarBolsillo} alEliminar={borrarBolsillo} />
      <DetalleBolsilloModal abierto={Boolean(bolsilloDetalle)} bolsillo={bolsilloDetalle} resumen={resumenesBolsillos[bolsilloDetalle?.idBolsillo]} triggerRef={disparadorBolsilloRef} alCerrar={() => setBolsilloDetalle(null)} alEditar={() => { setModalBolsillo({ abierto: true, modo: "editar", bolsillo: bolsilloDetalle }); setBolsilloDetalle(null); }} alEliminar={() => { setModalBolsillo({ abierto: true, modo: "eliminar", bolsillo: bolsilloDetalle }); setBolsilloDetalle(null); }} />
      <DetalleMovimientoModal
        movimiento={movimientoDetalle}
        triggerRef={disparadorMovimientoRef}
        alCerrar={() => setMovimientoDetalle(null)}
        alEditar={() => { setMovimientoDetalle(null); setMovimientoEditando(movimientoDetalle); setCrearMovimientoAbierto(true); }}
        alEliminar={() => { setMovimientoDetalle(null); setErrorEliminarMovimiento(""); setMovimientoEliminando(movimientoDetalle); }}
      />
      <ModalCrearMovimientoContable abierto={crearMovimientoAbierto} modo={movimientoEditando ? "editar" : "crear"} movimiento={movimientoEditando} valoresPredeterminados={valoresPredeterminados} bolsillos={bolsillosMovimiento} tarjetas={tarjetas} triggerRef={disparadorMovimientoRef} alCerrar={() => { setCrearMovimientoAbierto(false); setMovimientoEditando(null); setValoresPredeterminados(null); }} alGuardar={guardarMovimientoYActualizarRevision} />
      <ModalMovimientosPorRevisar abierto={bandejaRevisionAbierta} bolsillos={bolsillos} recarga={recargaRevision}
        triggerRef={disparadorMovimientoRef} alCerrar={() => setBandejaRevisionAbierta(false)}
        alEditar={(movimiento) => { setBandejaRevisionAbierta(false); setMovimientoEditando(movimiento); setCrearMovimientoAbierto(true); }}
        alConfirmar={recargarMovimientos} />
      <ModalDetalleRegistro abierto={Boolean(movimientoEliminando)} titulo="Eliminar movimiento" triggerRef={disparadorMovimientoRef} alCerrar={() => !eliminandoMovimiento && setMovimientoEliminando(null)} ancho="max-w-md">
        <p className="mb-4 text-sm text-slate-text">¿Eliminar definitivamente el movimiento <strong className="text-bg-dark">{movimientoEliminando?.concepto || movimientoEliminando?.categoria}</strong>? Esta acción no se puede deshacer.</p>
        {errorEliminarMovimiento && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorEliminarMovimiento}</p>}
        <div className="flex justify-end gap-2"><button type="button" disabled={eliminandoMovimiento} onClick={() => setMovimientoEliminando(null)} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream disabled:opacity-50">Cancelar</button><button type="button" disabled={eliminandoMovimiento} onClick={confirmarEliminarMovimiento} className="min-h-10 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">{eliminandoMovimiento ? "Eliminando…" : "Eliminar movimiento"}</button></div>
      </ModalDetalleRegistro>
    </section>
  );
}
