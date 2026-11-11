/** Utilidades para mostrar y comparar teléfonos colombianos. */
const INDICATIVO_COLOMBIA = "57";

function soloDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

/** Devuelve los diez dígitos nacionales, quitando +57 o 0057 cuando está presente. */
export function normalizarTelefonoColombia(valor) {
  let digitos = soloDigitos(valor);
  if (digitos.startsWith("00")) digitos = digitos.slice(2);
  if (digitos.startsWith(INDICATIVO_COLOMBIA) && digitos.length === 12) return digitos.slice(2);
  return digitos;
}

/** Muestra teléfonos colombianos de diez dígitos como +57 300 123 4567. */
export function formatearTelefonoColombia(valor) {
  const original = String(valor ?? "").trim();
  if (!original) return "";
  const nacional = normalizarTelefonoColombia(original);
  if (nacional.length !== 10) return original;
  return `+57 ${nacional.slice(0, 3)} ${nacional.slice(3, 6)} ${nacional.slice(6)}`;
}
