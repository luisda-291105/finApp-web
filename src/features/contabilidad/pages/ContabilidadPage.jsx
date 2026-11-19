/**
 * @uso        Orquesta bolsillos, movimientos y modales de Contabilidad
 * @funciones  ContabilidadPage()
 * @datos      Coordina useContabilidad y los componentes de encabezado, cards y condiciones
 * @eventos    Crear, consultar, editar y eliminar bolsillos o movimientos
 * @estados    Selecciones de detalle, revisión y refs de foco
 * @usadoPor   App.jsx mediante la API pública de features/contabilidad
 */
import { useState, useRef, useEffect } from "react";
import ModalDetalleRegistro from "../../../components/domain/modales/ModalDetalleRegistro";
import RespuestaMovimiento from "../components/feedback/RespuestaMovimiento";
import ContabilidadHeader from "../components/headers/ContabilidadHeader";
import BolsillosContablesCondiciones from "../components/conditions/BolsillosContablesCondiciones";
import ModalBolsillo from "../components/modals/ModalBolsillo";
import DetalleBolsilloModal from "../components/modals/DetalleBolsilloModal";
import DetalleBalanceModal from "../components/modals/DetalleBalanceModal";
import DetalleMovimientoModal from "../components/modals/DetalleMovimientoModal";
import ModalCrearMovimientoContable from "../components/modals/ModalCrearMovimientoContable";
import ModalMovimientosPorRevisar from "../components/modals/ModalMovimientosPorRevisar";
import MovimientosContablesSection from "../components/sections/MovimientosContablesSection";
import useContabilidad from "../hooks/useContabilidad";
import { actualizarMovimiento } from "../services/movimientosService";
import { useGmail } from "../../../context/GmailContext";
import {
  agregarSaldoDisponible,
  crearFiltrosMovimiento,
  esBolsilloFijo,
  referenciaGmailMovimiento,
} from "../utils/contabilidadHelpers";
import {
  importarMovimientosGmailPendientes,
  sincronizarOrigenesMovimientosGmail,
} from "../../suscripciones/services/suscripcionesServicio";
import { AlertaGlobal } from "../../../features/error";

/** Página de bolsillos persistidos y movimientos contables. */
export default function ContabilidadPage() {
  const [bolsilloDetalle, setBolsilloDetalle] = useState(null);
  const [movimientoDetalle, setMovimientoDetalle] = useState(null);
  const [balanceAbierto, setBalanceAbierto] = useState(false);
  const [bandejaRevisionAbierta, setBandejaRevisionAbierta] = useState(false);
  const [recargaRevision, setRecargaRevision] = useState(0);
  const [movimientoEliminadoBandeja, setMovimientoEliminadoBandeja] = useState(null);
  const {
    navigate,
    usuario,
    movimientos,
    filtroMovimiento,
    setFiltroMovimiento,
    cargandoMovimientos,
    errorMovimientos,
    resumenesBolsillos,
    cargandoResumenes,
    errorResumenes,
    crearMovimientoAbierto,
    setCrearMovimientoAbierto,
    resumenMensual,
    cargandoResumenMensual,
    movimientoEditando,
    setMovimientoEditando,
    movimientoEliminando,
    setMovimientoEliminando,
    eliminandoMovimiento,
    errorEliminarMovimiento,
    setErrorEliminarMovimiento,
    respuesta,
    setRespuesta,
    bolsillos,
    tarjetas,
    cargandoBolsillos,
    errorBolsillos,
    modalBolsillo,
    setModalBolsillo,
    disparadorBolsilloRef,
    disparadorMovimientoRef,
    abrirModalBolsillo,
    guardarBolsillo,
    borrarBolsillo,
    guardarMovimiento,
    confirmarEliminarMovimiento,
    recargarMovimientos,
  } = useContabilidad();

  const sincronizacionHechaRef = useRef(false);
  const disparadorBalanceRef = useRef(null);
  const recargarMovimientosRef = useRef(recargarMovimientos);
  recargarMovimientosRef.current = recargarMovimientos;
  const [sincronizandoApodos, setSincronizandoApodos] = useState(false);
  const [sincronizandoMovimientos, setSincronizandoMovimientos] = useState(false);
  const importacionHechaRef = useRef(false);
  const { gmailConectado, cuentasGmail } = useGmail();

  useEffect(() => {
    let vigente = true;
    if (sincronizacionHechaRef.current || !usuario?.idUsuario || cargandoMovimientos)
      return () => {
        vigente = false;
      };
    const ejecutar = async () => {
      sincronizacionHechaRef.current = true;
      setSincronizandoApodos(true);
      try {
        const resultado = await sincronizarOrigenesMovimientosGmail();
        if (vigente && resultado.actualizados > 0) {
          setRespuesta({
            tipo: "exito",
            mensaje: `${resultado.actualizados} movimiento(s) actualizado(s) con el apodo de la suscripción como origen.`,
          });
          recargarMovimientosRef.current();
        }
      } catch {
        if (vigente)
          setRespuesta({
            tipo: "error",
            mensaje: "No se pudieron sincronizar los orígenes de las suscripciones.",
          });
      } finally {
        if (vigente) setSincronizandoApodos(false);
      }
    };
    ejecutar();
    return () => {
      vigente = false;
    };
  }, [usuario?.idUsuario, cargandoMovimientos]);

  // Importa los movimientos financieros de Gmail todavía no cargados a Contabilidad.
  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario || !gmailConectado || cuentasGmail.length === 0) return () => { vigente = false; };
    if (importacionHechaRef.current) return () => { vigente = false; };
    const ejecutar = async () => {
      importacionHechaRef.current = true;
      setSincronizandoMovimientos(true);
      try {
        const resultado = await importarMovimientosGmailPendientes(cuentasGmail);
        if (vigente && resultado?.creados > 0) {
          recargarMovimientosRef.current();
        }
      } catch {
        // Importación de Gmails silenciosa en este paso
      } finally {
        if (vigente) setSincronizandoMovimientos(false);
      }
    };
    ejecutar();
    return () => {
      vigente = false;
    };
  }, [usuario?.idUsuario, gmailConectado, cuentasGmail]);

  const bolsillosActivos = bolsillos.filter(
    (bolsillo) => bolsillo.estado !== false,
  );
  /** Devuelve el bolsillo fijo compatible para devolver un movimiento (Ingresos/Gastos según tipo). */
  const bolsilloPorDefecto = (movimiento) => {
    const tipo = String(movimiento?.tipo || "").toUpperCase();
    const esIngreso = tipo === "INGRESO";
    const fijo = bolsillos.find(
      (bolsillo) =>
        esBolsilloFijo(bolsillo) &&
        (esIngreso
          ? String(bolsillo.tipo || "").toUpperCase() === "INGRESO"
          : String(bolsillo.tipo || "").toUpperCase() === "GASTO"),
    );
    return fijo?.idBolsillo ?? null;
  };
  const bolsillosConSaldo = agregarSaldoDisponible(
    bolsillos,
    resumenesBolsillos,
  );
  const bolsillosMovimiento = movimientoEditando
    ? bolsillosConSaldo
    : bolsillosConSaldo.filter((bolsillo) => bolsillo.estado !== false);
  const filtrosMovimiento = crearFiltrosMovimiento(bolsillos);
  const cantidadPorRevisar = Number(resumenMensual?.porRevisar ?? 0);

  const guardarMovimientoYActualizarRevision = async (movimiento) => {
    await guardarMovimiento(movimiento);
    setRecargaRevision((actual) => actual + 1);
  };
  const abrirMovimiento = () => {
    if (!usuario?.idUsuario) {
      navigate("/", { replace: true });
      return;
    }
    setRespuesta(null);
    setMovimientoEditando(null);
    setCrearMovimientoAbierto(true);
  };
  const abrirBolsillo = (evento) => {
    if (!usuario?.idUsuario) {
      navigate("/", { replace: true });
      return;
    }
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
  const abrirDetalleBalance = (evento) => {
    disparadorBalanceRef.current = evento?.currentTarget || null;
    setBalanceAbierto(true);
  };

  return (
    <section aria-labelledby="contabilidad-titulo" className="space-y-6 pt-6">
      <ContabilidadHeader
        cantidadPorRevisar={cantidadPorRevisar}
        hayBolsillosActivos={bolsillosActivos.length > 0}
        disparadorMovimientoRef={disparadorMovimientoRef}
        alAbrirRevision={() => {
          setMovimientoEliminadoBandeja(null);
          setBandejaRevisionAbierta(true);
        }}
        alAbrirMovimiento={abrirMovimiento}
      />
      <BolsillosContablesCondiciones
        bolsillos={bolsillos}
        cargandoBolsillos={cargandoBolsillos}
        errorBolsillos={errorBolsillos}
        resumenes={resumenesBolsillos}
        resumenMensual={resumenMensual}
        cargandoResumenes={cargandoResumenes}
        cargandoResumenMensual={cargandoResumenMensual}
        errorResumenes={errorResumenes}
        alAbrirDetalle={abrirDetalleBolsillo}
        alAbrirBalance={abrirDetalleBalance}
        alAbrirBolsillo={abrirBolsillo}
        disparadorBolsilloRef={disparadorBolsilloRef}
      />
      <MovimientosContablesSection
        movimientos={movimientos}
        filtros={filtrosMovimiento}
        filtroActivo={filtroMovimiento}
        cargando={cargandoMovimientos}
        error={errorMovimientos}
        alCambiarFiltro={setFiltroMovimiento}
        alAbrirDetalle={abrirDetalleMovimiento}
      />

      <RespuestaMovimiento
        respuesta={respuesta}
        className="fixed right-4 top-20 z-40 w-[min(calc(100vw-2rem),24rem)] border-emerald-700 bg-emerald-700 px-5 py-4 text-base font-semibold text-white shadow-xl"
      />
      <ModalBolsillo
        abierto={modalBolsillo.abierto}
        modo={modalBolsillo.modo}
        bolsillo={modalBolsillo.bolsillo}
        bolsillos={bolsillos}
        movimientos={movimientos}
        triggerRef={disparadorBolsilloRef}
        alCerrar={() =>
          setModalBolsillo({ abierto: false, modo: "crear", bolsillo: null })
        }
        alGuardar={guardarBolsillo}
        alEliminar={borrarBolsillo}
        alAlternarMovimiento={async (movimiento, bolsillo) => {
          if (!bolsillo?.idBolsillo) return;
          const estabaAsignado =
            String(movimiento?.idBolsillo) === String(bolsillo.idBolsillo);
          try {
            const destino = estabaAsignado
              ? bolsilloPorDefecto(movimiento)
              : bolsillo.idBolsillo;
            if (!destino) {
              setRespuesta({
                tipo: "error",
                mensaje: "No hay un bolsillo fijo compatible para devolver este movimiento.",
              });
              return;
            }
            await actualizarMovimiento(movimiento.idMovimiento, {
              idBolsillo: destino,
              tipo: movimiento.tipo,
              fecha: movimiento.fecha,
              monto: movimiento.monto,
              categoria: movimiento.categoria,
              concepto: movimiento.concepto,
              origenTipo: movimiento.origenTipo,
              origenId: movimiento.origenId,
              origenNombre: movimiento.origenNombre,
            });
            recargarMovimientosRef.current?.();
          } catch {
            setRespuesta({
              tipo: "error",
              mensaje: "No se pudo mover el movimiento. Revisa qué bolsillos están disponibles.",
            });
          }
        }}
      />
      <DetalleBolsilloModal
        abierto={Boolean(bolsilloDetalle)}
        bolsillo={bolsilloDetalle}
        triggerRef={disparadorBolsilloRef}
        alCerrar={() => setBolsilloDetalle(null)}
        alEditar={() => {
          setModalBolsillo({
            abierto: true,
            modo: "editar",
            bolsillo: bolsilloDetalle,
          });
          setBolsilloDetalle(null);
        }}
        alEliminar={() => {
          setModalBolsillo({
            abierto: true,
            modo: "eliminar",
            bolsillo: bolsilloDetalle,
          });
          setBolsilloDetalle(null);
        }}
      />
      <DetalleBalanceModal
        abierto={balanceAbierto}
        resumenMensual={resumenMensual}
        triggerRef={disparadorBalanceRef}
        alCerrar={() => setBalanceAbierto(false)}
      />
      <DetalleMovimientoModal
        movimiento={movimientoDetalle}
        triggerRef={disparadorMovimientoRef}
        alCerrar={() => setMovimientoDetalle(null)}
        alEditar={() => {
          setMovimientoDetalle(null);
          setMovimientoEditando(movimientoDetalle);
          setCrearMovimientoAbierto(true);
        }}
        alEliminar={() => {
          setMovimientoDetalle(null);
          setErrorEliminarMovimiento("");
          setMovimientoEliminando(movimientoDetalle);
        }}
      />
      <ModalCrearMovimientoContable
        abierto={crearMovimientoAbierto}
        modo={movimientoEditando ? "editar" : "crear"}
        movimiento={movimientoEditando}
        bolsillos={bolsillosMovimiento}
        tarjetas={tarjetas}
        triggerRef={disparadorMovimientoRef}
        alCerrar={() => {
          setCrearMovimientoAbierto(false);
          setMovimientoEditando(null);
        }}
        alGuardar={guardarMovimientoYActualizarRevision}
      />
      <ModalMovimientosPorRevisar
        abierto={bandejaRevisionAbierta}
        bolsillos={bolsillos}
        recarga={recargaRevision}
        triggerRef={disparadorMovimientoRef}
        alCerrar={() => setBandejaRevisionAbierta(false)}
        alEditar={(movimiento) => {
          setBandejaRevisionAbierta(false);
          setMovimientoEditando(movimiento);
          setCrearMovimientoAbierto(true);
        }}
        alConfirmar={recargarMovimientos}
        movimientoEliminado={movimientoEliminadoBandeja}
        alEliminar={(movimiento) => {
          // La bandeja se mantiene abierta: al confirmar, la fila desaparece de la lista.
          setErrorEliminarMovimiento("");
          setMovimientoEliminando(movimiento);
        }}
      />
      <ModalDetalleRegistro
        abierto={Boolean(movimientoEliminando)}
        titulo="Eliminar movimiento"
        triggerRef={disparadorMovimientoRef}
        alCerrar={() => !eliminandoMovimiento && setMovimientoEliminando(null)}
        ancho="max-w-md"
      >
        <p className="mb-4 text-sm text-slate-text">
          ¿Eliminar el movimiento{" "}
          <strong className="text-bg-dark">
            {movimientoEliminando?.concepto || movimientoEliminando?.categoria}
          </strong>
          ?{" "}
          {referenciaGmailMovimiento(movimientoEliminando)
            ? "El correo asociado se moverá a la papelera de Gmail y podrás restaurarlo desde allí."
            : "Esta acción no se puede deshacer."}
        </p>
        <AlertaGlobal
          tipo="error"
          mensaje={errorEliminarMovimiento}
          idBase="ContabilidadPage-errorEliminarMovimiento"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={eliminandoMovimiento}
            onClick={() => setMovimientoEliminando(null)}
            className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={eliminandoMovimiento}
            onClick={async () => {
              const idEliminado = movimientoEliminando?.idMovimiento;
              const confirmado = await confirmarEliminarMovimiento();
              if (confirmado && idEliminado)
                setMovimientoEliminadoBandeja(idEliminado);
            }}
            className="min-h-10 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {eliminandoMovimiento ? "Eliminando…" : "Eliminar movimiento"}
          </button>
        </div>
      </ModalDetalleRegistro>
    </section>
  );
}
