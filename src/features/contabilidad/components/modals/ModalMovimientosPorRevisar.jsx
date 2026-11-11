/** Bandeja para revisar y confirmar movimientos Gmail pendientes. */
import { useEffect, useState } from "react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { actualizarMovimiento, confirmarMovimientoGmailGlobal, listarMovimientos } from "../../services/movimientosService";

function listaDe(respuesta) {
  return Array.isArray(respuesta) ? respuesta : respuesta?.datos || respuesta?.data || [];
}

function tipoMovimiento(movimiento) {
  return String(movimiento?.tipo || "").trim().toUpperCase();
}

/** Permite editar un pendiente o confirmar Gmail como movimiento global sin alterar bolsillos AHORRO. */
export default function ModalMovimientosPorRevisar({ abierto, bolsillos = [], triggerRef, recarga = 0, alCerrar, alEditar, alConfirmar }) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [ocupado, setOcupado] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto) return undefined;
    let vigente = true;
    setCargando(true);
    setError("");
    listarMovimientos(null, "TODOS", "POR_REVISAR")
      .then((respuesta) => { if (vigente) setMovimientos(listaDe(respuesta)); })
      .catch((fallo) => { if (vigente) setError(fallo?.message || "No se pudieron cargar los movimientos pendientes."); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [abierto, recarga]);

  const confirmar = async (movimiento) => {
    const compatibles = bolsillos.filter((bolsillo) => bolsillo.estado !== false
      && String(bolsillo.estado).toLowerCase() !== "false"
      && tipoMovimiento(bolsillo) === tipoMovimiento(movimiento));
    if (movimiento.origenTipo === "GMAIL" && ["GASTO", "INGRESO"].includes(tipoMovimiento(movimiento))) {
      setOcupado(movimiento.idMovimiento);
      setError("");
      try {
        await confirmarMovimientoGmailGlobal(movimiento.idMovimiento);
        setMovimientos((actuales) => actuales.filter((item) => item.idMovimiento !== movimiento.idMovimiento));
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
      else setError("No hay un único bolsillo activo compatible. Edita el movimiento para elegir uno.");
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
      setMovimientos((actuales) => actuales.filter((item) => item.idMovimiento !== movimiento.idMovimiento));
      alConfirmar?.(movimiento);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo confirmar el movimiento.");
    } finally {
      setOcupado("");
    }
  };

  return <ModalDetalleRegistro abierto={abierto} titulo="Movimientos por revisar" triggerRef={triggerRef}
    alCerrar={() => !ocupado && alCerrar()} ancho="max-w-2xl">
    <div className="space-y-4">
      <p className="text-sm text-slate-text">Confirma los ingresos y gastos de Gmail como movimientos globales. Los demás movimientos pendientes pueden asignarse a un bolsillo compatible.</p>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {cargando && <p role="status" className="text-sm text-slate-text">Cargando movimientos…</p>}
      {!cargando && !error && movimientos.length === 0 && <p className="rounded-xl bg-bg-cream p-4 text-sm text-slate-text">No hay movimientos pendientes de revisión.</p>}
      <ul className="max-h-[55vh] space-y-3 overflow-y-auto">
        {movimientos.map((movimiento) => <li key={movimiento.idMovimiento} className="rounded-xl border border-border-line/50 p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <div><p className="font-semibold text-bg-dark">{movimiento.concepto || movimiento.categoria || "Movimiento Gmail"}</p>
              <p className="mt-1 text-xs text-slate-text">{movimiento.tipo} · {movimiento.fecha} · {movimiento.origenNombre || "Gmail"}</p></div>
            <p className="font-semibold text-bg-dark">{Number(movimiento.monto).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" disabled={Boolean(ocupado)} onClick={() => alEditar(movimiento)}
              className="min-h-9 rounded-lg border border-border-line px-3 text-sm font-medium">Editar</button>
            <button type="button" disabled={Boolean(ocupado)} onClick={() => confirmar(movimiento)}
              className="min-h-9 rounded-lg bg-emerald-primary px-3 text-sm font-semibold text-white disabled:opacity-60">
              {ocupado === movimiento.idMovimiento ? "Confirmando…" : "Confirmar"}
            </button>
          </div>
        </li>)}
      </ul>
    </div>
  </ModalDetalleRegistro>;
}
