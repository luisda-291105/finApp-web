/**
 * @uso        Presenta el detalle de un movimiento vinculado a la tarjeta registrada
 * @funciones  MovimientoTarjetaModal({ movimiento, triggerRef, alCerrar })
 * @datos      Recibe el movimiento seleccionado desde DetalleTarjetaModal; no consulta servicios
 * @eventos    Cierre con Escape, botón o clic en el fondo; devuelve el foco al disparador
 * @estados    Ninguno; la selección y apertura son controladas por DetalleTarjetaModal
 * @usadoPor   DetalleTarjetaModal
 */
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleDollarSign, Tag, TrendingUp, Wallet } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const formatoFechaLarga = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function fechaLarga(fecha) {
  if (!fecha) return "Fecha no disponible";
  const valor = new Date(`${fecha}T00:00:00Z`);
  return Number.isNaN(valor.getTime()) ? fecha : formatoFechaLarga.format(valor);
}

/** Modal con información detallada del movimiento seleccionado de la tarjeta. */
export default function MovimientoTarjetaModal({ movimiento, triggerRef, alCerrar }) {
  const tipo = String(movimiento?.tipo || "").trim().toUpperCase();
  const ingreso = tipo === "INGRESO";
  const tono = ingreso ? "text-cat-income" : tipo === "AHORRO" ? "text-emerald-primary" : "text-cat-expense";
  const Icono = ingreso ? ArrowUpRight : tipo === "AHORRO" ? TrendingUp : ArrowDownRight;
  const nombre = movimiento?.concepto?.trim() || movimiento?.categoria || "Movimiento";
  const porRevisar = String(movimiento?.estadoRevision || "").toUpperCase() === "POR_REVISAR";

  return (
    <ModalDetalleRegistro
      abierto={Boolean(movimiento)}
      titulo="Detalle del movimiento"
      triggerRef={triggerRef}
      alCerrar={alCerrar}
      ancho="max-w-xl"
    >
      {movimiento && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-5 text-center">
            <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-cream ${tono}`}>
              <Icono className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm text-slate-text">{tipo || "MOVIMIENTO"}</p>
            <h3 className="mt-1 break-words font-display text-xl font-semibold text-bg-dark">{nombre}</h3>
            <p className={`mt-3 font-display text-3xl font-semibold tabular-nums ${tono}`}>
              {ingreso ? "+" : "−"}{formatoMoneda.format(Number(movimiento.monto) || 0)}
            </p>
            {porRevisar && (
              <p className="mt-2 text-xs font-medium text-amber-800" role="status">
                Por revisar
              </p>
            )}
          </section>
          <dl className="grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><Tag className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Categoría</dt><dd className="mt-1 break-words text-sm font-medium text-bg-dark">{movimiento.categoria || "Sin categoría"}</dd></div>
            <div className="min-w-0 rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><CircleDollarSign className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Origen</dt><dd className="mt-1 break-words text-sm font-medium text-bg-dark">{movimiento.origenNombre || "No especificado"}</dd></div>
            <div className="min-w-0 rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><CalendarDays className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Fecha</dt><dd className="mt-1 text-sm font-medium text-bg-dark">{fechaLarga(movimiento.fecha)}</dd></div>
            <div className="min-w-0 rounded-xl border border-border-line/40 p-3"><dt className="flex items-center gap-2 text-xs text-slate-text"><Wallet className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Estado</dt><dd className="mt-1 text-sm font-medium text-bg-dark">{porRevisar ? "Por revisar" : "Confirmado"}</dd></div>
          </dl>
          {movimiento.concepto?.trim() && <p className="rounded-xl border border-border-line/40 p-3 text-sm text-slate-text"><span className="font-medium text-bg-dark">Concepto: </span>{movimiento.concepto}</p>}
          <footer className="flex justify-end border-t border-border-line/40 pt-4">
            <button type="button" onClick={alCerrar} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">Cerrar</button>
          </footer>
        </div>
      )}
    </ModalDetalleRegistro>
  );
}
