/** Bandeja para revisar y confirmar movimientos Gmail pendientes. */
import { useEffect, useRef, useState } from "react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import DetalleMovimientoModal from "./DetalleMovimientoModal";
import {
  actualizarMovimiento,
  confirmarMovimientoGmailGlobal,
  listarMovimientos,
} from "../../services/movimientosService";
import {
  entidadMovimiento,
  fechaMovimiento,
  formatoMoneda,
  nombreMovimiento,
} from "../../utils/contabilidadHelpers";
import { AlertaGlobal } from "../../../../features/error";

function listaDe(respuesta) {
  return Array.isArray(respuesta)
    ? respuesta
    : respuesta?.datos || respuesta?.data || [];
}

function tipoMovimiento(movimiento) {
  return String(movimiento?.tipo || "")
    .trim()
    .toUpperCase();
}

/** Permite ver el detalle de un pendiente, editarlo o confirmar Gmail como movimiento global sin alterar bolsillos AHORRO. */
export default function ModalMovimientosPorRevisar({
  abierto,
  bolsillos = [],
  triggerRef,
  recarga = 0,
  alCerrar,
  alEditar,
  alConfirmar,
  alEliminar,
}) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [ocupado, setOcupado] = useState("");
  const [error, setError] = useState("");
  const [movimientoDetalle, setMovimientoDetalle] = useState(null);
  const disparadorDetalleRef = useRef(null);

  const abrirDetalle = (movimiento, evento) => {
    disparadorDetalleRef.current = evento?.currentTarget || null;
    setMovimientoDetalle(movimiento);
  };

  useEffect(() => {
    if (!abierto) return undefined;
    let vigente = true;
    setCargando(true);
    setError("");
    listarMovimientos(null, "TODOS", "POR_REVISAR")
      .then(async (pendientesEstado) => {
        let combinado = [...listaDe(pendientesEstado)];
        try {
          const pendientesTipo = await listarMovimientos(null, "POR_REVISAR");
          combinado = combinado.concat(listaDe(pendientesTipo));
        } catch {
          // Sin tipo POR_REVISAR adicional; se muestran solo los estadoRevision pendientes.
        }
        if (!vigente) return;
        const porId = new Map();
        for (const movimiento of combinado) {
          if (movimiento?.idMovimiento && !porId.has(movimiento.idMovimiento)) {
            porId.set(movimiento.idMovimiento, movimiento);
          }
        }
        setMovimientos([...porId.values()]);
      })
      .catch((fallo) => {
        if (vigente)
          setError(
            fallo?.message ||
              "No se pudieron cargar los movimientos pendientes.",
          );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [abierto, recarga]);

  const confirmar = async (movimiento) => {
    const compatibles = bolsillos.filter(
      (bolsillo) =>
        bolsillo.estado !== false &&
        String(bolsillo.estado).toLowerCase() !== "false" &&
        tipoMovimiento(bolsillo) === tipoMovimiento(movimiento),
    );
    if (
      movimiento.origenTipo === "GMAIL" &&
      ["GASTO", "INGRESO"].includes(tipoMovimiento(movimiento))
    ) {
      setOcupado(movimiento.idMovimiento);
      setError("");
      try {
        await confirmarMovimientoGmailGlobal(movimiento.idMovimiento);
        setMovimientos((actuales) =>
          actuales.filter(
            (item) => item.idMovimiento !== movimiento.idMovimiento,
          ),
        );
        alConfirmar?.(movimiento);
      } catch (fallo) {
        setError(fallo?.message || "No se pudo confirmar el movimiento Gmail.");
      } finally {
        setOcupado("");
      }
      return;
    }
    if (compatibles.length !== 1) {
      if (compatibles.length > 1) alEditar(movimiento);
      else
        setError(
          "No hay un único bolsillo activo compatible. Edita el movimiento para elegir uno.",
        );
      return;
    }
    setOcupado(movimiento.idMovimiento);
    setError("");
    try {
      await actualizarMovimiento(movimiento.idMovimiento, {
        idBolsillo: compatibles[0].idBolsillo,
        tipo: movimiento.tipo,
        fecha: movimiento.fecha,
        monto: movimiento.monto,
        categoria: movimiento.categoria,
        concepto: movimiento.concepto,
        origenTipo: movimiento.origenTipo,
        origenId: movimiento.origenId,
        origenNombre: movimiento.origenNombre,
      });
      setMovimientos((actuales) =>
        actuales.filter(
          (item) => item.idMovimiento !== movimiento.idMovimiento,
        ),
      );
      alConfirmar?.(movimiento);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo confirmar el movimiento.");
    } finally {
      setOcupado("");
    }
  };

  return (
    <>
      <ModalDetalleRegistro
        abierto={abierto}
        titulo="Movimientos por revisar"
        triggerRef={triggerRef}
        alCerrar={() => !ocupado && alCerrar()}
        ancho="max-w-2xl"
      >
        <div className="space-y-4">
          <AlertaGlobal
            tipo="error"
            mensaje={error}
            idBase="ModalMovimientosPorRevisar-error"
          />
          {cargando && (
            <p role="status" className="text-sm text-slate-text">
              Cargando movimientos…
            </p>
          )}
          {!cargando && !error && movimientos.length === 0 && (
            <p className="rounded-xl bg-bg-cream p-4 text-sm text-slate-text">
              No hay movimientos pendientes de revisión.
            </p>
          )}
          <ul className="max-h-[55vh] space-y-3 overflow-y-auto">
            {movimientos.map((movimiento) => {
              const titulo = nombreMovimiento(movimiento);
              const contexto = [
                movimiento.tipo,
                fechaMovimiento(movimiento.fecha),
                entidadMovimiento(movimiento),
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <li
                  key={movimiento.idMovimiento}
                  className="rounded-xl border border-border-line/50 p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <button
                      type="button"
                      onClick={(evento) => abrirDetalle(movimiento, evento)}
                      aria-label={`Ver detalle del movimiento ${titulo}`}
                      className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
                    >
                      <p className="font-semibold text-bg-dark">{titulo}</p>
                      <p className="mt-1 text-xs text-slate-text">{contexto}</p>
                    </button>
                    <p className="font-semibold text-bg-dark">
                      {formatoMoneda.format(Number(movimiento.monto) || 0)}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => alEliminar?.(movimiento)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line px-3 text-xs font-medium text-bg-dark hover:border-red-300 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(ocupado)}
                      onClick={() => alEditar(movimiento)}
                      className="min-h-9 rounded-lg border border-border-line px-3 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(ocupado)}
                      onClick={() => confirmar(movimiento)}
                      className="min-h-9 rounded-lg bg-emerald-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {ocupado === movimiento.idMovimiento
                        ? "Confirmando…"
                        : "Confirmar"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </ModalDetalleRegistro>
      <DetalleMovimientoModal
        movimiento={movimientoDetalle}
        triggerRef={disparadorDetalleRef}
        alCerrar={() => setMovimientoDetalle(null)}
        alEditar={() => alEditar(movimientoDetalle)}
        alEliminar={() => alEliminar(movimientoDetalle)}
      />
    </>
  );
}
