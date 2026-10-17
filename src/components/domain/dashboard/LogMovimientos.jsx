/**
 * @uso        Log de movimientos demo de una tarjeta dentro del modal (spec 004, RF8-RF10)
 * @funciones  LogMovimientos(), formatearFechaCorta(fechaISO)
 * @datos      Props: `movimientos` (array {id, fecha ISO, descripcion, categoria, monto});
 *              ordena descendente por fecha ISO (lexicográfica) y formatea la fecha en
 *              la capa UI ("12 oct 2026") con meses en español sin Intl.
 *              `formatearFechaCorta` exige el formato estricto "AAAA-MM-DD" (4/2/2
 *              dígitos), valida el mes (1-12) y devuelve el texto neutro "—" ante
 *              cualquier entrada inválida; su contrato es una cadena (sin guarda de tipo).
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   ModalTarjeta
 */

const MESES_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Texto neutro (guion largo U+2014) para toda entrada de fecha inválida. */
const FECHA_NEUTRA = "—";

/**
 * Convierte una fecha ISO "AAAA-MM-DD" (exactamente 4/2/2 dígitos) al formato corto
 * "12 oct 2026" usando un mapa de meses en español (sin depender de Intl ni del locale
 * del SO). Valida el mes (1-12); el día y el año no se validan. Ante un mes fuera de
 * rango o un formato incumplido devuelve el texto neutro "—". Espera una cadena: con
 * otro tipo se mantiene el TypeError de `split`.
 */
export function formatearFechaCorta(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
    return FECHA_NEUTRA;
  }

  const numeroMes = Number(mes);

  if (numeroMes < 1 || numeroMes > 12) {
    return FECHA_NEUTRA;
  }

  return `${Number(dia)} ${MESES_ES[numeroMes - 1]} ${Number(anio)}`;
}

/**
 * Formatea el monto con signo explícito y dos decimales (fuente tabular vía clase).
 */
function formatearMonto(monto) {
  const valor = Math.abs(monto).toFixed(2);
  return monto >= 0 ? `+${valor}` : `-${valor}`;
}

export default function LogMovimientos({ movimientos }) {
  if (!movimientos || movimientos.length === 0) {
    return (
      <p className="text-sm text-slate-text">Sin movimientos este mes</p>
    );
  }

  const ordenados = [...movimientos].sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
  );

  return (
    <ul className="space-y-2">
      {ordenados.map((mov) => (
        <li
          key={mov.id}
          className="flex items-center justify-between gap-3 py-2 border-b border-border-line last:border-b-0"
        >
          <div className="min-w-0">
            <p className="text-xs text-slate-text tabular-nums">
              {formatearFechaCorta(mov.fecha)}
            </p>
            <p className="text-sm font-medium text-bg-dark truncate">
              {mov.descripcion}
            </p>
            <p className="text-xs text-slate-text">{mov.categoria}</p>
          </div>
          <span
            className={`text-sm font-semibold tabular-nums shrink-0 ${
              mov.monto >= 0 ? "text-cat-income" : "text-cat-expense"
            }`}
          >
            {formatearMonto(mov.monto)}
          </span>
        </li>
      ))}
    </ul>
  );
}
