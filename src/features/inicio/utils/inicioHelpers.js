export const FUENTES_DEMO = [
  { valor: "bolsillos", etiqueta: "Grupos", destino: "/dashboard/grupos" },
  { valor: "contabilidad", etiqueta: "Contabilidad", destino: "/dashboard/contabilidad" },
  { valor: "ingresos", etiqueta: "Ingresos", destino: "/dashboard/contabilidad" },
  { valor: "gastos", etiqueta: "Gastos", destino: "/dashboard/contabilidad" },
  { valor: "tarjetas", etiqueta: "Tarjetas", destino: "/dashboard/tarjetas" },
];

export const SEGMENTOS_CONTABLES = [
  { valor: "todos", etiqueta: "Todos los movimientos" },
  { valor: "ingresos", etiqueta: "Ingresos" },
  { valor: "gastos", etiqueta: "Gastos" },
  { valor: "otros", etiqueta: "Otros (ahorros)" },
];

export const TIPOS_VISUALIZACION = [
  { valor: "tarjeta", etiqueta: "Tarjeta" },
  { valor: "grafica", etiqueta: "Gráfica" },
  { valor: "metrica", etiqueta: "Métrica" },
  { valor: "mapa_calor", etiqueta: "Mapa de calor" },
];

export const VALORES_DEMO = {
  bolsillos: 2300,
  contabilidad: 3473000,
  transacciones: 5800,
  ingresos: 4250,
  gastos: 1820.75,
  tarjetas: 890.4,
};

export const VARIACION_METRICA_DEMO = "+12.4 %";
export const TEXTO_SIN_DATOS = "Sin datos disponibles";
export const SERIE_GRAFICA_DEMO = [
  { etiqueta: "L", altura: 35 }, { etiqueta: "M", altura: 60 }, { etiqueta: "X", altura: 45 },
  { etiqueta: "J", altura: 85 }, { etiqueta: "V", altura: 55 },
];
export const INTENSIDADES_MAPA_DEMO = [
  [1, 2, 0, 3, 4], [0, 1, 2, 2, 1], [3, 0, 1, 4, 2], [2, 2, 1, 0, 3],
  [1, 3, 2, 4, 0], [4, 1, 0, 2, 2], [0, 2, 3, 1, 4],
];
export const CLASES_INTENSIDAD = [
  "bg-emerald-primary/10", "bg-emerald-primary/30", "bg-emerald-primary/50",
  "bg-emerald-primary/70", "bg-emerald-primary/90",
];
export const BORRADOR_VACIO = { titulo: "", fuente: "", tipo: "", segmentoContable: "todos" };

export const normalizarTitulo = (titulo = "") => titulo.trim();
export const normalizarFuente = (fuente) => fuente === "transacciones" ? "contabilidad" : fuente;

export function esBorradorCompleto(borrador) {
  return normalizarTitulo(borrador.titulo) !== "" && borrador.fuente !== "" && borrador.tipo !== "";
}

export function esMuestraDuplicada(muestras, titulo, fuente, tipo, segmentoContable) {
  return muestras.some((muestra) =>
    normalizarTitulo(muestra.titulo) === titulo &&
    normalizarFuente(muestra.fuente) === fuente &&
    muestra.tipo === tipo &&
    (fuente !== "contabilidad" || (muestra.segmentoContable || "todos") === segmentoContable)
  );
}

export function obtenerFuente(fuente) {
  return FUENTES_DEMO.find((item) => item.valor === normalizarFuente(fuente));
}

export function obtenerValorMuestra(muestra) {
  const fuente = obtenerFuente(muestra.fuente);
  return muestra.valor ?? (fuente ? VALORES_DEMO[fuente.valor] : null);
}

export function formatearMonto(valor) {
  return `$${valor.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}
