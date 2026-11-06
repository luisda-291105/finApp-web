/**
 * @uso        Parseo y formato de importes en pesos colombianos
 * @funciones  formatearPesos, desagruparPesos, parsearPesos, limpiarEntradaPesos
 * @datos      Cadenas locales como «12.000,00» y valores numéricos
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Formularios de bolsillo y movimientos
 */
const formatoPesos = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Devuelve un importe numérico con separadores colombianos y dos decimales. */
export function formatearPesos(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? formatoPesos.format(numero) : "";
}

/** Quita separadores de miles para dejar el importe listo para edición. */
export function desagruparPesos(valor) {
  const numero = parsearPesos(valor);
  return numero === null ? "" : numero.toLocaleString("es-CO", { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Convierte una cadena local colombiana a número o null si no es válida. */
export function parsearPesos(valor) {
  const texto = String(valor ?? "").trim().replace(/\s/g, "");
  if (!texto) return null;
  let normalizado = texto;
  if (normalizado.includes(",")) {
    normalizado = normalizado.replace(/\./g, "").replace(",", ".");
  } else if ((normalizado.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(normalizado)) {
    normalizado = normalizado.replace(/\./g, "");
  }
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

/** Mantiene dígitos y una coma decimal durante la escritura. */
export function limpiarEntradaPesos(valor) {
  const texto = String(valor ?? "").replace(/\./g, "").replace(/[^\d,]/g, "");
  const [entero, ...fracciones] = texto.split(",");
  const parteEntera = entero || "";
  if (fracciones.length === 0) return parteEntera;
  return `${parteEntera},${fracciones.join("").slice(0, 2)}`;
}

/** Agrega separadores de miles mientras se escribe, conservando la coma decimal. */
export function agruparEntradaPesos(valor) {
  const limpio = limpiarEntradaPesos(valor);
  const [entero = "", ...fracciones] = limpio.split(",");
  const enteroAgrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return fracciones.length ? `${enteroAgrupado},${fracciones.join("")}` : enteroAgrupado;
}
