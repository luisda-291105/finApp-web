export const TIPOS_BASE = ["INGRESO", "GASTO", "AHORRO"];

export const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const ETIQUETAS_TIPO = {
  INGRESO: "Ingresos",
  GASTO: "Gastos",
  AHORRO: "Ahorros",
};

export function etiquetaTipo(tipo) {
  return ETIQUETAS_TIPO[tipo] || tipo;
}

export function crearFiltrosMovimiento(bolsillos = []) {
  return [
    { valor: "TODOS", etiqueta: "Todos" },
    ...Array.from(
      new Set([
        ...TIPOS_BASE,
        ...bolsillos.map((bolsillo) => bolsillo.tipo).filter(Boolean),
      ]),
    ).map((tipo) => ({ valor: tipo, etiqueta: etiquetaTipo(tipo) })),
  ];
}

export function agregarSaldoDisponible(bolsillos = [], resumenes = {}) {
  return bolsillos.map((bolsillo) => ({
    ...bolsillo,
    saldoDisponible: Number(resumenes[bolsillo.idBolsillo]?.saldo) || 0,
  }));
}

/** Fecha legible de un movimiento (YYYY-MM-DD → «05 nov 2026»). */
export function fechaMovimiento(fecha) {
  if (!fecha) return "Fecha no disponible";
  const valor = new Date(`${fecha}T00:00:00Z`);
  return Number.isNaN(valor.getTime()) ? fecha : formatoFecha.format(valor);
}

/** El apodo de la suscripción (origen_nombre) es un nombre; un correo no lo es. */
function esApodo(valor) {
  const limpio = String(valor ?? "").trim();
  return Boolean(limpio) && !limpio.includes("@");
}

/** Título visible del movimiento: apodo de la suscripción, concepto o categoría. */
export function nombreMovimiento(movimiento) {
  return esApodo(movimiento?.origenNombre)
    ? movimiento.origenNombre.trim()
    : movimiento?.concepto?.trim() ||
        movimiento?.categoria ||
        "Movimiento";
}

/** Entidad de referencia del movimiento: banco, remitente u origen. */
export function entidadMovimiento(movimiento) {
  return (
    movimiento?.entidad ||
    movimiento?.remitente ||
    movimiento?.origenNombre ||
    ""
  );
}

/** Regla compartida con el backend: «Ingresos»/INGRESO y «Gastos»/GASTO son bolsillos fijos del usuario. */
export function esBolsilloFijo(bolsillo) {
  const nombre = String(bolsillo?.nombre || "")
    .trim()
    .toLowerCase();
  const tipo = String(bolsillo?.tipo || "")
    .trim()
    .toUpperCase();
  return (
    (nombre === "ingresos" && tipo === "INGRESO") ||
    (nombre === "gastos" && tipo === "GASTO")
  );
}
