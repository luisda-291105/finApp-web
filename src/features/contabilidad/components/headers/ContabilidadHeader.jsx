/**
 * @uso        Encabezado y acciones principales de Contabilidad
 * @funciones  ContabilidadHeader({ cantidadPorRevisar, hayBolsillosActivos, disparadorMovimientoRef, alAbrirRevision, alAbrirMovimiento })
 * @datos      Recibe la cantidad pendiente, disponibilidad de bolsillos y refs de disparadores
 * @eventos    Abre revisión y creación de movimiento
 * @estados    Ninguno
 * @usadoPor   ContabilidadPage
 */
import { ClipboardCheck, Plus } from "lucide-react";

/** Encabezado que concentra las acciones globales de la página contable. */
export default function ContabilidadHeader({
  cantidadPorRevisar,
  hayBolsillosActivos,
  disparadorMovimientoRef,
  alAbrirRevision,
  alAbrirMovimiento,
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-primary">
          FinApp / Panel
        </p>
        <h1
          id="contabilidad-titulo"
          className="mt-1 font-display text-3xl font-medium text-bg-dark"
        >
          Contabilidad
        </h1>
        <p className="mt-1 text-sm text-slate-text">
          Revisa tus gastos, ahorros y balance disponible.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={alAbrirRevision}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-600 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
        >
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          <span className="sm:hidden">Revisar</span>
          <span className="hidden sm:inline">Por revisar</span>
          <span aria-label={`${cantidadPorRevisar} movimientos pendientes`}>
            ({cantidadPorRevisar})
          </span>
        </button>
        <button
          ref={disparadorMovimientoRef}
          type="button"
          disabled={!hayBolsillosActivos}
          onClick={alAbrirMovimiento}
          title={
            !hayBolsillosActivos
              ? "Crea y activa un bolsillo para registrar movimientos"
              : undefined
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-semibold text-bg-cream shadow-sm transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="min-[1000px]:hidden">Movimiento</span>
          <span className="hidden min-[1000px]:inline">Nuevo movimiento</span>
        </button>
      </div>
    </header>
  );
}
