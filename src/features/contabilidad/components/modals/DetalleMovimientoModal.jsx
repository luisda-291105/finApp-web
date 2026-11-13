/**
 * @uso        Presenta la información completa de un movimiento contable
 * @funciones  DetalleMovimientoModal({ movimiento, triggerRef, alCerrar, alEditar, alEliminar })
 * @datos      Recibe el movimiento seleccionado desde ContabilidadPage
 * @eventos    Editar, eliminar y cerrar con Escape, botón o clic en el fondo
 * @estados    Ninguno; la selección y apertura son controladas por la página
 * @usadoPor   ContabilidadPage
 */
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleDollarSign, Landmark, Pencil, Tag, Trash2, Wallet } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { formatoFecha, formatoMoneda } from "../../utils/contabilidadHelpers";

function fechaLegible(fecha) {
  if (!fecha) return "Fecha no disponible";
  const valor = new Date(`${fecha}T00:00:00Z`);
  return Number.isNaN(valor.getTime()) ? fecha : formatoFecha.format(valor);
}

/** Modal con información y acciones del movimiento seleccionado. */
export default function DetalleMovimientoModal({ movimiento, triggerRef, alCerrar, alEditar, alEliminar }) {
  const tipo = String(movimiento?.tipo || "").toUpperCase();
  const ingreso = tipo === "INGRESO";
  const tono = ingreso ? "text-cat-income" : tipo === "AHORRO" ? "text-emerald-primary" : "text-cat-expense";
  const Icono = ingreso ? ArrowUpRight : ArrowDownRight;
  const nombre = movimiento?.concepto?.trim() || movimiento?.categoria || "Movimiento";

  return <ModalDetalleRegistro abierto={Boolean(movimiento)} titulo="Detalle del movimiento" triggerRef={triggerRef} alCerrar={alCerrar} ancho="max-w-xl">
    {movimiento && <div className="space-y-5">
      <section className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-5 text-center">
        <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-cream ${tono}`}><Icono className="h-6 w-6" aria-hidden="true" /></span>
        <p className="mt-3 text-sm text-slate-text">{tipo || "MOVIMIENTO"}</p>
        <h3 className="mt-1 break-words font-display text-xl font-semibold text-bg-dark">{nombre}</h3>
        <p className={`mt-3 font-display text-3xl font-semibold tabular-nums ${tono}`}>{ingreso ? "+" : "−"}{formatoMoneda.format(Number(movimiento.monto) || 0)}</p>
      </section>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><Tag className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Categoría</dt><dd className="mt-1 break-words text-sm font-medium text-bg-dark">{movimiento.categoria || "Sin categoría"}</dd></div>
        <div className="rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><Wallet className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Bolsillo</dt><dd className="mt-1 break-words text-sm font-medium text-bg-dark">{movimiento.nombreBolsillo || movimiento.bolsillo?.nombre || "Sin bolsillo"}</dd></div>
        <div className="rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><CalendarDays className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Fecha</dt><dd className="mt-1 text-sm font-medium text-bg-dark">{fechaLegible(movimiento.fecha)}</dd></div>
        <div className="rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><CircleDollarSign className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Origen</dt><dd className="mt-1 break-words text-sm font-medium text-bg-dark">{movimiento.origenNombre || "No especificado"}</dd></div>
        <div className="rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><Landmark className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Entidad</dt><dd className="mt-1 break-words text-sm font-medium text-bg-dark">{movimiento.entidad || movimiento.remitente || "No especificado"}</dd></div>
      </dl>
      {movimiento.descripcion && <p className="rounded-xl border border-border-line/40 p-3 text-sm text-slate-text"><span className="font-medium text-bg-dark">Descripción: </span>{movimiento.descripcion}</p>}
      <footer className="flex flex-wrap justify-between gap-2 border-t border-border-line/40 pt-4">
        <button type="button" onClick={alEliminar} aria-label={`Eliminar movimiento ${nombre}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar</button>
        <div className="flex gap-2">
          <button type="button" onClick={alCerrar} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">Cerrar</button>
          <button type="button" onClick={alEditar} aria-label={`Editar movimiento ${nombre}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Pencil className="h-4 w-4" aria-hidden="true" />Editar</button>
        </div>
      </footer>
    </div>}
  </ModalDetalleRegistro>;
}
