/**
 * @uso        Detalle del balance mensual de los bolsillos fijos
 * @funciones  DetalleBalanceModal({ abierto, resumenMensual, triggerRef, alCerrar })
 * @datos      Recibe ingresos, gastos y transferencias del resumen global del mes actual
 * @eventos    Cierra el modal devolviendo el foco al disparador
 * @estados    Ninguno; la apertura es controlada por ContabilidadPage
 * @usadoPor   ContabilidadPage
 */
import { ArrowDownLeft, ArrowUpRight, Equal, Scale } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import {
  etiquetaMesMovimiento,
  formatoMoneda,
  mesActual,
} from "../../utils/contabilidadHelpers";

const numero = (valor) => Number(valor) || 0;

/** Muestra de dónde sale el «Balance del mes» de la card de ingresos y gastos. */
export default function DetalleBalanceModal({
  abierto,
  resumenMensual = {},
  triggerRef,
  alCerrar,
}) {
  const ingresos = numero(resumenMensual?.ingresos);
  const gastos = numero(resumenMensual?.gastos);
  const saldo = ingresos - gastos;
  const negativo = saldo < 0;
  const claveMes = mesActual();

  const filas = [
    {
      etiqueta: "Ingresos del mes",
      detalle: "Todo lo que entró a tus bolsillos fijos",
      valor: ingresos,
      Icono: ArrowUpRight,
      clase: "text-emerald-primary",
    },
    {
      etiqueta: "Gastos del mes",
      detalle: "Compras y pagos confirmados del periodo",
      valor: gastos,
      Icono: ArrowDownLeft,
      clase: "text-cat-expense",
    },
  ];

  return (
    <ModalDetalleRegistro
      abierto={abierto}
      titulo="Detalle del balance"
      triggerRef={triggerRef}
      alCerrar={alCerrar}
      ancho="max-w-xl"
      icono={Scale}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-text">
          {etiquetaMesMovimiento(claveMes)} · Ingresos menos gastos confirmados.
        </p>
        <div
          className={`rounded-2xl border p-4 ${negativo ? "border-rose-200 bg-rose-0" : "border-emerald-primary/20 bg-emerald-0"}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-bg-black">
            Balance del mes
          </p>
          <p
            className={`mt-1 font-display text-3xl font-semibold tabular-nums ${negativo ? "text-cat-expense" : "text-emerald-primary"}`}
            data-testid="detalle-balance-total"
          >
            {formatoMoneda.format(saldo)}
          </p>
        </div>
        <ul className="space-y-2" aria-label="Componentes del balance">
          {filas.map(({ etiqueta, detalle, valor, Icono, clase }) => (
            <li
              key={etiqueta}
              className="flex items-center gap-3 rounded-xl border border-border-line/40 bg-bg-cream/60 p-3"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/70 ${clase}`}
              >
                <Icono className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-bg-dark">{etiqueta}</p>
                <p className="text-xs text-slate-text">{detalle}</p>
              </div>
              <span className={`shrink-0 font-semibold tabular-nums ${clase}`}>
                {formatoMoneda.format(valor)}
              </span>
            </li>
          ))}
        </ul>
      
      </div>
    </ModalDetalleRegistro>
  );
}
