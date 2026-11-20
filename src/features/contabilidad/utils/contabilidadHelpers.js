export const TIPOS_BASE = ["INGRESO", "GASTO", "AHORRO"];

/** Tipos con los que un movimiento cuenta en los totales; «POR_REVISAR» no es uno de ellos. */
export const TIPOS_CLASIFICABLES = ["GASTO", "INGRESO", "AHORRO", "TRANSFERENCIA"];

/** Indica si un tipo (o el tipo de un bolsillo) puede clasificar un movimiento. */
export function esTipoClasificable(tipo) {
  return TIPOS_CLASIFICABLES.includes(
    String(tipo || "")
      .trim()
      .toUpperCase(),
  );
}

/** Indica si un bolsillo puede ser destino de un movimiento clasificado. */
export function esBolsilloClasificable(bolsillo) {
  return esTipoClasificable(bolsillo?.tipo);
}

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

/** Referencia Gmail de un movimiento importado: `origenId` = `cuentaId:mensajeId`. */
export function referenciaGmailMovimiento(movimiento) {
  if (
    String(movimiento?.origenTipo || "")
      .trim()
      .toUpperCase() !== "GMAIL"
  )
    return null;
  const origen = String(movimiento?.origenId || "");
  const separador = origen.indexOf(":");
  if (separador <= 0 || separador === origen.length - 1) return null;
  return {
    cuentaId: origen.slice(0, separador),
    mensajeId: origen.slice(separador + 1),
  };
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

/** Lee los orígenes del bolsillo: acepta array, JSON serializado o texto plano separado por comas. */
export function obtenerOrigenes(bolsillo) {
  const raw = bolsillo?.origenes;
  if (Array.isArray(raw)) {
    return raw.map((valor) => String(valor || "").trim()).filter(Boolean);
  }
  if (raw == null) return [];
  const texto = String(raw).trim();
  if (!texto) return [];
  if (texto.startsWith("[")) {
    try {
      const parsed = JSON.parse(texto);
      if (Array.isArray(parsed)) {
        return parsed
          .map((valor) => String(valor || "").trim())
          .filter(Boolean);
      }
    } catch {
      // Ponte en fallback de texto plano si el JSON es inválido
    }
  }
  return texto
    .split(/[,\n]/)
    .map((valor) => valor.trim())
    .filter(Boolean);
}

/** Mes local actual en formato "YYYY-MM", igual al que consulta el resumen global. */
export function mesActual() {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
}

/** Normaliza una fecha en "YYYY-MM"; inválida o vacía → "sin-fecha". */
export function claveMesMovimiento(fecha) {
  const texto = String(fecha || "");
  if (/^\d{4}-\d{2}/.test(texto)) return texto.slice(0, 7);
  const valor = new Date(texto);
  if (Number.isNaN(valor.getTime())) return "sin-fecha";
  const mes = String(valor.getUTCMonth() + 1).padStart(2, "0");
  return `${valor.getUTCFullYear()}-${mes}`;
}

/** Etiqueta larga es-CO para "YYYY-MM"; "sin-fecha" como fallback. */
export function etiquetaMesMovimiento(clave) {
  if (clave === "sin-fecha") return "Sin fecha";
  const [anio, mes] = clave.split("-").map(Number);
  const valor = new Date(Date.UTC(anio || 0, (mes || 1) - 1, 1));
  if (Number.isNaN(valor.getTime())) return clave;
  return new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(valor);
}

/** Etiqueta corta "MM/AAAA". */
export function etiquetaMesMovimientoCorta(clave) {
  const [anio, mes] = String(clave || "").split("-");
  return anio && mes ? `${mes}/${anio}` : clave;
}

/** Agrupa movimientos por año y mes (más recientes primero). */
export function agruparPorAnioYMes(movimientos) {
  const porAnio = new Map();
  if (!Array.isArray(movimientos)) return [];
  for (const movimiento of movimientos) {
    const clave = claveMesMovimiento(movimiento.fecha);
    const anio = clave === "sin-fecha" ? "sin-fecha" : clave.slice(0, 4);
    if (!porAnio.has(anio)) {
      porAnio.set(anio, { anio, total: 0, meses: [] });
    }
    const grupoAnio = porAnio.get(anio);
    let grupoMes = grupoAnio.meses.find((m) => m.clave === clave);
    if (!grupoMes) {
      grupoMes = {
        clave,
        etiqueta: etiquetaMesMovimiento(clave),
        total: 0,
        movimientos: [],
      };
      grupoAnio.meses.push(grupoMes);
    }
    const monto = Number(movimiento.monto) || 0;
    grupoMes.total += monto;
    grupoMes.movimientos.push(movimiento);
  }
  return [...porAnio.values()]
    .map((grupoAnio) => {
      grupoAnio.total = grupoAnio.meses.reduce(
        (total, mes) => total + mes.total,
        0,
      );
      grupoAnio.meses.sort((a, b) => b.clave.localeCompare(a.clave));
      grupoAnio.mesMasReciente = grupoAnio.meses[0]?.clave || "";
      return grupoAnio;
    })
    .sort((a, b) => b.anio.localeCompare(a.anio));
}
