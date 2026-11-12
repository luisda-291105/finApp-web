/**
 * @uso        Orquesta bolsillos, movimientos y modales de Contabilidad
 * @funciones  ContabilidadPage()
 * @datos      Coordina useContabilidad y los componentes de encabezado, cards y condiciones
 * @eventos    Crear, consultar, editar y eliminar bolsillos o movimientos
 * @estados    Selecciones de detalle, revisión y refs de foco
 * @usadoPor   App.jsx mediante la API pública de features/contabilidad
 */
import { useState } from "react";
import ModalDetalleRegistro from "../../../components/domain/modales/ModalDetalleRegistro";
import RespuestaMovimiento from "../components/feedback/RespuestaMovimiento";
import ContabilidadHeader from "../components/headers/ContabilidadHeader";
import BolsillosContablesCondiciones from "../components/conditions/BolsillosContablesCondiciones";
import ModalBolsillo from "../components/modals/ModalBolsillo";
import DetalleBolsilloModal from "../components/modals/DetalleBolsilloModal";
import DetalleMovimientoModal from "../components/modals/DetalleMovimientoModal";
import ModalCrearMovimientoContable from "../components/modals/ModalCrearMovimientoContable";
import ModalMovimientosPorRevisar from "../components/modals/ModalMovimientosPorRevisar";
import MovimientosContablesSection from "../components/sections/MovimientosContablesSection";
import useContabilidad from "../hooks/useContabilidad";
import { agregarSaldoDisponible, crearFiltrosMovimiento } from "../utils/contabilidadHelpers";

/** Página de bolsillos persistidos y movimientos contables. */
export default function ContabilidadPage() {
  const [bolsilloDetalle, setBolsilloDetalle] = useState(null);
  const [movimientoDetalle, setMovimientoDetalle] = useState(null);
  const [bandejaRevisionAbierta, setBandejaRevisionAbierta] = useState(false);
  const [recargaRevision, setRecargaRevision] = useState(0);
  const {
    navigate, usuario, movimientos, filtroMovimiento, setFiltroMovimiento, cargandoMovimientos, errorMovimientos,
    resumenesBolsillos, cargandoResumenes, errorResumenes, crearMovimientoAbierto, setCrearMovimientoAbierto,
    resumenMensual, cargandoResumenMensual, movimientoEditando, setMovimientoEditando,
    movimientoEliminando, setMovimientoEliminando, eliminandoMovimiento, errorEliminarMovimiento,
    setErrorEliminarMovimiento, respuesta, setRespuesta, bolsillos, tarjetas, cargandoBolsillos,
    errorBolsillos, modalBolsillo, setModalBolsillo, disparadorBolsilloRef, disparadorMovimientoRef,
    abrirModalBolsillo, guardarBolsillo, borrarBolsillo, guardarMovimiento, confirmarEliminarMovimiento,
    recargarMovimientos,
  } = useContabilidad();

  const bolsillosActivos = bolsillos.filter((bolsillo) => bolsillo.estado !== false);
  const bolsillosConSaldo = agregarSaldoDisponible(bolsillos, resumenesBolsillos);
  const bolsillosMovimiento = movimientoEditando ? bolsillosConSaldo : bolsillosConSaldo.filter((bolsillo) => bolsillo.estado !== false);
  const filtrosMovimiento = crearFiltrosMovimiento(bolsillos);
  const cantidadPorRevisar = Number(resumenMensual?.porRevisar ?? 0);

  const guardarMovimientoYActualizarRevision = async (movimiento) => {
    await guardarMovimiento(movimiento);
    setRecargaRevision((actual) => actual + 1);
  };
  const abrirMovimiento = () => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; }
    setRespuesta(null); setMovimientoEditando(null); setCrearMovimientoAbierto(true);
  };
  const abrirBolsillo = (evento) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; }
    abrirModalBolsillo("crear", null, evento);
  };
  const abrirDetalleBolsillo = (bolsillo, evento) => {
    disparadorBolsilloRef.current = evento.currentTarget;
    setBolsilloDetalle(bolsillo);
  };
  const abrirDetalleMovimiento = (movimiento, evento) => {
    disparadorMovimientoRef.current = evento.currentTarget;
    setMovimientoDetalle(movimiento);
  };

  return <section aria-labelledby="contabilidad-titulo" className="space-y-6 pt-6">
    <ContabilidadHeader cantidadPorRevisar={cantidadPorRevisar} hayBolsillosActivos={bolsillosActivos.length > 0} disparadorMovimientoRef={disparadorMovimientoRef} disparadorBolsilloRef={disparadorBolsilloRef} alAbrirRevision={() => setBandejaRevisionAbierta(true)} alAbrirMovimiento={abrirMovimiento} alAbrirBolsillo={abrirBolsillo} />
    <BolsillosContablesCondiciones bolsillos={bolsillos} cargandoBolsillos={cargandoBolsillos} errorBolsillos={errorBolsillos} resumenes={resumenesBolsillos} resumenMensual={resumenMensual} cargandoResumenes={cargandoResumenes} cargandoResumenMensual={cargandoResumenMensual} errorResumenes={errorResumenes} alAbrirDetalle={abrirDetalleBolsillo} />
    <MovimientosContablesSection movimientos={movimientos} filtros={filtrosMovimiento} filtroActivo={filtroMovimiento} cargando={cargandoMovimientos} error={errorMovimientos} alCambiarFiltro={setFiltroMovimiento} alAbrirDetalle={abrirDetalleMovimiento} />

    <RespuestaMovimiento respuesta={respuesta} className="fixed right-4 top-20 z-40 w-[min(calc(100vw-2rem),24rem)] border-emerald-700 bg-emerald-700 px-5 py-4 text-base font-semibold text-white shadow-xl" />
    <ModalBolsillo abierto={modalBolsillo.abierto} modo={modalBolsillo.modo} bolsillo={modalBolsillo.bolsillo} bolsillos={bolsillos} triggerRef={disparadorBolsilloRef} alCerrar={() => setModalBolsillo({ abierto: false, modo: "crear", bolsillo: null })} alGuardar={guardarBolsillo} alEliminar={borrarBolsillo} />
    <DetalleBolsilloModal abierto={Boolean(bolsilloDetalle)} bolsillo={bolsilloDetalle} resumen={resumenesBolsillos[bolsilloDetalle?.idBolsillo]} triggerRef={disparadorBolsilloRef} alCerrar={() => setBolsilloDetalle(null)} alEditar={() => { setModalBolsillo({ abierto: true, modo: "editar", bolsillo: bolsilloDetalle }); setBolsilloDetalle(null); }} alEliminar={() => { setModalBolsillo({ abierto: true, modo: "eliminar", bolsillo: bolsilloDetalle }); setBolsilloDetalle(null); }} />
    <DetalleMovimientoModal movimiento={movimientoDetalle} triggerRef={disparadorMovimientoRef} alCerrar={() => setMovimientoDetalle(null)} alEditar={() => { setMovimientoDetalle(null); setMovimientoEditando(movimientoDetalle); setCrearMovimientoAbierto(true); }} alEliminar={() => { setMovimientoDetalle(null); setErrorEliminarMovimiento(""); setMovimientoEliminando(movimientoDetalle); }} />
    <ModalCrearMovimientoContable abierto={crearMovimientoAbierto} modo={movimientoEditando ? "editar" : "crear"} movimiento={movimientoEditando} bolsillos={bolsillosMovimiento} tarjetas={tarjetas} triggerRef={disparadorMovimientoRef} alCerrar={() => { setCrearMovimientoAbierto(false); setMovimientoEditando(null); }} alGuardar={guardarMovimientoYActualizarRevision} />
    <ModalMovimientosPorRevisar abierto={bandejaRevisionAbierta} bolsillos={bolsillos} recarga={recargaRevision} triggerRef={disparadorMovimientoRef} alCerrar={() => setBandejaRevisionAbierta(false)} alEditar={(movimiento) => { setBandejaRevisionAbierta(false); setMovimientoEditando(movimiento); setCrearMovimientoAbierto(true); }} alConfirmar={recargarMovimientos} />
    <ModalDetalleRegistro abierto={Boolean(movimientoEliminando)} titulo="Eliminar movimiento" triggerRef={disparadorMovimientoRef} alCerrar={() => !eliminandoMovimiento && setMovimientoEliminando(null)} ancho="max-w-md">
      <p className="mb-4 text-sm text-slate-text">¿Eliminar definitivamente el movimiento <strong className="text-bg-dark">{movimientoEliminando?.concepto || movimientoEliminando?.categoria}</strong>? Esta acción no se puede deshacer.</p>
      {errorEliminarMovimiento && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorEliminarMovimiento}</p>}
      <div className="flex justify-end gap-2"><button type="button" disabled={eliminandoMovimiento} onClick={() => setMovimientoEliminando(null)} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream disabled:opacity-50">Cancelar</button><button type="button" disabled={eliminandoMovimiento} onClick={confirmarEliminarMovimiento} className="min-h-10 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">{eliminandoMovimiento ? "Eliminando…" : "Eliminar movimiento"}</button></div>
    </ModalDetalleRegistro>
  </section>;
}
