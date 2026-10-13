/**
 * @uso        Log de movimientos demo de una tarjeta dentro del modal (spec 004, RF8-RF10)
 * @funciones  LogMovimientos(), formatearFechaCorta(fechaISO)
 * @datos      Props: `movimientos` (array {id, fecha ISO, descripcion, categoria, monto});
 *              ordena descendente por fecha ISO (lexicográfica) y formatea la fecha en
 *              la capa UI ("12 oct 2026") con meses en español sin Intl
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   ModalTarjeta (spec 004)
 */

const MESES_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/**
 * Convierte una fecha ISO "AAAA-MM-DD" al formato corto "12 oct 2026"
 * usando un mapa de meses en español (sin depender de Intl ni del locale del SO).
 */
export function formatearFechaCorta(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  return `${dia} ${MESES_ES[mes - 1]} ${anio}`;
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
