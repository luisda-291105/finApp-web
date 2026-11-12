/**
 * @uso        Listado filtrable y estados visibles de movimientos contables
 * @funciones  MovimientosContablesSection({ movimientos, filtros, ... })
 * @datos      Recibe movimientos, filtro activo y estados de consulta
 * @eventos    Cambia el filtro y abre el detalle de un movimiento
 * @estados    Ninguno
 * @usadoPor   ContabilidadPage
 */
import { Card } from "../../../../components/ui";
import MovimientoItem from "../cards/MovimientoItem";

/** Sección de movimientos con filtros y condiciones de carga, error o vacío. */
export default function MovimientosContablesSection({ movimientos, filtros, filtroActivo, cargando, error, alCambiarFiltro, alAbrirDetalle }) {
  return <Card como="section" aria-labelledby="movimientos-titulo" className="overflow-hidden">
    <div className="flex flex-col gap-4 border-b border-border-line/60 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
      <div><h2 id="movimientos-titulo" className="font-display text-xl font-semibold text-bg-dark">Movimientos de todos los bolsillos</h2><p className="mt-1 text-sm text-slate-text">Filtra por tipo para ver ingresos, gastos o ahorros sin importar el bolsillo.</p></div>
    </div>
    <div className="flex flex-wrap gap-2 border-b border-border-line/30 px-5 py-3" role="group" aria-label="Filtrar movimientos por tipo">
      {filtros.map((filtro) => <button key={filtro.valor} type="button" aria-pressed={filtroActivo === filtro.valor} onClick={() => alCambiarFiltro(filtro.valor)} className={`min-h-9 rounded-full px-3 text-sm font-medium transition-colors ${filtroActivo === filtro.valor ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark"}`}>{filtro.valor === "TODOS" ? "Todos" : filtro.etiqueta}</button>)}
    </div>
    {error && <p role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {cargando && <p role="status" className="px-5 py-8 text-center text-sm text-slate-text">Cargando movimientos...</p>}
    {!cargando && !error && (movimientos.length > 0 ? <ul aria-label="Movimientos de todos los bolsillos" className="divide-y divide-border-line/50 px-5">
      {movimientos.map((movimiento) => <MovimientoItem key={movimiento.idMovimiento} movimiento={movimiento} onDetalle={(evento) => alAbrirDetalle(movimiento, evento)} />)}
    </ul> : <p className="px-5 py-10 text-center text-slate-text">Sin movimientos registrados en este filtro.</p>)}
  </Card>;
}
