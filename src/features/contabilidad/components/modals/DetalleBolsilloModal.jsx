import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, LoaderCircle, Pencil, PiggyBank, ReceiptText, Trash2, TrendingUp, Wallet } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { listarMovimientos } from "../../services/movimientosService";
import { esBolsilloFijo, formatoFecha, formatoMoneda } from "../../utils/contabilidadHelpers";

const iconoPorTipo = { GASTO: ReceiptText, INGRESO: TrendingUp, AHORRO: PiggyBank };
const campoPorTipo = { GASTO: "gastos", INGRESO: "ingresos", AHORRO: "ahorros" };
const listaDe = (respuesta) => Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];

function fechaLegible(fecha) {
  if (!fecha) return "Fecha no disponible";
  const valor = new Date(`${fecha}T00:00:00Z`);
  return Number.isNaN(valor.getTime()) ? fecha : formatoFecha.format(valor);
}

function movimientoDelBolsillo(movimiento, bolsillo) {
  const bolsilloDestino = movimiento.idBolsillo === bolsillo.idBolsillo;
  const bolsilloOrigen = String(movimiento.origenTipo || "").toUpperCase() === "BOLSILLO"
    && movimiento.origenId === bolsillo.idBolsillo;
  if (!bolsilloDestino && !bolsilloOrigen) return null;
  if (bolsilloOrigen) return "SALIDA";
  return String(movimiento.tipo || "").toUpperCase() === "GASTO" ? "SALIDA" : "ENTRADA";
}

/** Detalle financiero con movimientos que entraron o salieron del bolsillo. */
export default function DetalleBolsilloModal({ abierto, bolsillo, resumen = {}, triggerRef, alCerrar, alEditar, alEliminar }) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const tipo = String(bolsillo?.tipo || "").trim().toUpperCase();
  const Icono = iconoPorTipo[tipo] || Wallet;
  const monto = Number(resumen[campoPorTipo[tipo]]) || 0;
  const totalEntradas = movimientos.filter((movimiento) => movimiento.direccion === "ENTRADA").reduce((total, movimiento) => total + (Number(movimiento.monto) || 0), 0);
  const totalSalidas = movimientos.filter((movimiento) => movimiento.direccion === "SALIDA").reduce((total, movimiento) => total + (Number(movimiento.monto) || 0), 0);

  useEffect(() => {
    if (!abierto || !bolsillo?.idBolsillo) return undefined;
    let vigente = true;
    setCargando(true);
    setError("");
    listarMovimientos(null, "TODOS").then((respuesta) => {
      if (!vigente) return;
      const lista = listaDe(respuesta)
        .map((movimiento) => ({ ...movimiento, direccion: movimientoDelBolsillo(movimiento, bolsillo) }))
        .filter((movimiento) => movimiento.direccion)
        .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
      setMovimientos(lista);
    }).catch((fallo) => {
      if (vigente) setError(fallo?.message || "No se pudieron cargar los movimientos de este bolsillo.");
    }).finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [abierto, bolsillo?.idBolsillo]);

  const reciente = movimientos[0];

  return <ModalDetalleRegistro abierto={abierto} titulo={bolsillo?.nombre || "Detalle del bolsillo"} triggerRef={triggerRef} alCerrar={alCerrar} ancho="max-w-4xl">
    {bolsillo && <div className="space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
      <section className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary"><Icono className="h-6 w-6" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1"><h3 className="break-words font-display text-xl font-semibold text-bg-dark">{bolsillo.nombre}</h3><span className="mt-1 inline-flex rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary">{bolsillo.tipo}</span></div>
        </div>
        <div className="mt-5"><p className="text-xs font-medium uppercase tracking-wide text-slate-text">Monto del bolsillo</p><p className="mt-1 font-display text-3xl font-semibold tabular-nums text-bg-dark">{formatoMoneda.format(monto)}</p></div>
        <div className="mt-4 space-y-3 border-t border-border-line/40 pt-4">
          <div><p className="text-xs font-medium uppercase tracking-wide text-slate-text">Origen reciente</p><p className="mt-1 break-words text-sm font-medium text-bg-dark">{reciente?.origenNombre || "Sin origen registrado"}</p></div>
          <div><p className="text-xs font-medium uppercase tracking-wide text-slate-text">Fecha del último movimiento</p><p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-bg-dark"><CalendarDays className="h-4 w-4 text-emerald-primary" aria-hidden="true" />{fechaLegible(reciente?.fecha)}</p></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border-line/40 pt-4">
          <div className="rounded-xl bg-emerald-100/70 p-3"><p className="text-xs text-emerald-800">Entró al bolsillo</p><p className="mt-1 text-sm font-semibold tabular-nums text-emerald-800">{formatoMoneda.format(totalEntradas)}</p></div>
          <div className="rounded-xl bg-red-50 p-3"><p className="text-xs text-red-700">Salió del bolsillo</p><p className="mt-1 text-sm font-semibold tabular-nums text-red-700">{formatoMoneda.format(totalSalidas)}</p></div>
        </div>
      </section>

      <section aria-labelledby="movimientos-bolsillo-titulo" className="min-w-0 space-y-3">
        <div className="flex items-center justify-between gap-3"><div><h3 id="movimientos-bolsillo-titulo" className="font-semibold text-bg-dark">Movimientos</h3><p className="text-xs text-slate-text">Entradas y salidas de este bolsillo</p></div><span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-semibold text-slate-text">{movimientos.length}</span></div>
        {cargando && <p role="status" className="flex items-center gap-2 py-5 text-sm text-slate-text"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />Cargando movimientos…</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!cargando && !error && movimientos.length === 0 && <p className="rounded-xl border border-border-line/40 p-4 text-sm text-slate-text">Todavía no hay movimientos asociados a este bolsillo.</p>}
        {!cargando && movimientos.length > 0 && <ul className="max-h-[55vh] divide-y divide-border-line/40 overflow-y-auto rounded-xl border border-border-line/40 px-3">
          {movimientos.map((movimiento) => {
            const entro = movimiento.direccion === "ENTRADA";
            const FlujoIcono = entro ? ArrowDownLeft : ArrowUpRight;
            return <li key={movimiento.idMovimiento} className="flex items-center gap-3 py-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${entro ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-700"}`}><FlujoIcono className="h-5 w-5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-bg-dark">{movimiento.concepto?.trim() || movimiento.categoria || "Movimiento"}</p><p className="truncate text-xs text-slate-text">{entro ? "Entró al bolsillo" : "Salió del bolsillo"}{movimiento.origenNombre ? ` · ${movimiento.origenNombre}` : ""}</p><time className="text-xs text-slate-text" dateTime={movimiento.fecha}>{fechaLegible(movimiento.fecha)}</time></div>
              <span className={`shrink-0 text-right text-sm font-semibold tabular-nums ${entro ? "text-cat-income" : "text-cat-expense"}`}>{entro ? "+" : "−"}{formatoMoneda.format(Number(movimiento.monto) || 0)}</span>
            </li>;
          })}
        </ul>}
      </section>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-border-line/40 pt-4">
        {esBolsilloFijo(bolsillo) ? <p className="text-sm text-slate-text">Bolsillo fijo: siempre está disponible para registrar movimientos y no se puede editar ni eliminar.</p> : <>
          <button type="button" onClick={alEliminar} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar</button>
          <button type="button" onClick={alEditar} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-primary px-4 text-sm font-semibold text-white hover:bg-emerald-hover"><Pencil className="h-4 w-4" aria-hidden="true" />Editar bolsillo</button>
        </>}
      </footer>
    </div>}
  </ModalDetalleRegistro>;
}
