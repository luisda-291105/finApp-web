/**
 * @uso        Lista de movimientos de un bolsillo agrupada por año y mes, en un modal propio
 * @funciones  MovimientosBolsilloModal({ abierto, nombre, tipo, gruposPorMes, alCerrar })
 * @datos      Recibe los grupos por mes ya calculados desde DetalleBolsilloModal
 * @eventos    Cierre con Escape, botón «X» o clic en el fondo
 * @estados    Ninguno; la apertura es controlada por DetalleBolsilloModal
 * @usadoPor   DetalleBolsilloModal
 */
import { Wallet } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { formatoFecha, formatoMoneda } from "../../utils/contabilidadHelpers";

function fechaLegible(fecha) {
  if (!fecha) return "Fecha no disponible";
  const valor = new Date(`${fecha}T00:00:00Z`);
  return Number.isNaN(valor.getTime()) ? fecha : formatoFecha.format(valor);
}

function etiquetaCorta(clave) {
  const [anio, mes] = String(clave || "").split("-");
  return mes && anio ? `${mes}/${anio}` : clave;
}

/** Modal con el listado completo de movimientos de un bolsillo, agrupado por mes. */
export default function MovimientosBolsilloModal({ abierto, nombre, tipo, gruposPorMes, alCerrar }) {
  const esGasto = String(tipo || "").toUpperCase() === "GASTO";
  const hayMovimientos = Array.isArray(gruposPorMes) && gruposPorMes.length > 0;

  return (
    <ModalDetalleRegistro
      abierto={abierto}
      titulo={`Movimientos de ${nombre || "bolsillo"}`}
      alCerrar={alCerrar}
      ancho="max-w-2xl"
    >
      {!hayMovimientos ? (
        <p className="rounded-xl border border-border-line/40 p-4 text-sm text-slate-text">
          Todavía no hay movimientos asociados a este bolsillo.
        </p>
      ) : (
        <div className="max-h-[65vh] space-y-4 overflow-y-auto rounded-xl border border-border-line/40 p-3">
          {gruposPorMes.map((grupo) => (
            <section key={grupo.clave} aria-label={grupo.etiqueta} className="space-y-2">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-lg bg-bg-cream/95 px-2 py-1 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-bg-dark">
                  <span className="hidden sm:inline">{grupo.etiqueta}</span>
                  <span className="sm:hidden">{etiquetaCorta(grupo.clave)}</span>
                </h4>
                <span className="text-xs font-semibold tabular-nums text-slate-text">
                  Total: {formatoMoneda.format(grupo.total)}
                </span>
              </div>
              <ul className="divide-y divide-border-line/40">
                {grupo.movimientos.map((movimiento) => (
                  <li key={movimiento.idMovimiento} className="flex items-center gap-3 py-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${esGasto ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                      <Wallet className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-bg-dark">
                        {movimiento.concepto?.trim() || movimiento.categoria || "Movimiento"}
                      </p>
                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-text">
                        <span className="truncate">{movimiento.origenNombre || "Movimiento del bolsillo"}</span>
                        <time className="shrink-0 whitespace-nowrap" dateTime={movimiento.fecha}>
                          · {fechaLegible(movimiento.fecha)}
                        </time>
                      </div>
                    </div>
                    <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-bg-dark">
                      {formatoMoneda.format(Number(movimiento.monto) || 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </ModalDetalleRegistro>
  );
}
