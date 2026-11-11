export const FUENTES_MUESTRAS = [
  { valor: "suscripciones", etiqueta: "Suscripciones", destino: "/dashboard/suscripciones" },
  { valor: "contabilidad", etiqueta: "Contabilidad", destino: "/dashboard/contabilidad" },
  { valor: "correo", etiqueta: "Correo", destino: "/dashboard/correos" },
  { valor: "contactos", etiqueta: "Contactos", destino: "/dashboard/contactos" },
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

export const TEXTO_SIN_DATOS = "Sin datos disponibles";
export const CLASES_INTENSIDAD = [
  "bg-emerald-primary/10", "bg-emerald-primary/30", "bg-emerald-primary/50",
  "bg-emerald-primary/70", "bg-emerald-primary/90",
];
export const BORRADOR_VACIO = {
  titulo: "", fuente: "", tipo: "", segmentoContable: "todos", cuentaCorreo: "todas", cuentasCorreo: ["todas"],
};

export const normalizarTitulo = (titulo = "") => titulo.trim();
export const normalizarFuente = (fuente) => fuente === "transacciones" ? "contabilidad" : fuente;
export function esBorradorCompleto(borrador) {
  const fuenteValida = Boolean(borrador.fuente);
  const cuentasCorreo = Array.isArray(borrador.cuentasCorreo) ? borrador.cuentasCorreo : [borrador.cuentaCorreo || "todas"];
  const cuentaCorreoValida = borrador.fuente !== "correo" || cuentasCorreo.length > 0;
  return normalizarTitulo(borrador.titulo) !== "" && fuenteValida && cuentaCorreoValida && borrador.tipo !== "";
}

export function esMuestraDuplicada(muestras, titulo, fuente, tipo, segmentoContable, cuentaCorreo = "todas", cuentasCorreoSeleccionadas = []) {
  const cuentasOrdenadas = (valores, cuenta) => [...new Set((Array.isArray(valores) ? valores : [cuenta || "todas"]).map(String))].sort();
  const cuentasActuales = cuentasOrdenadas(cuentasCorreoSeleccionadas, cuentaCorreo);
  return muestras.some((muestra) =>
    normalizarTitulo(muestra.titulo) === titulo &&
    muestra.tipo === tipo &&
    normalizarFuente(muestra.fuente) === normalizarFuente(fuente) &&
    (normalizarFuente(fuente) !== "contabilidad" || (muestra.segmentoContable || "todos") === segmentoContable) &&
    (normalizarFuente(fuente) !== "correo" || JSON.stringify(cuentasOrdenadas(muestra.cuentasCorreo, muestra.cuentaCorreo)) === JSON.stringify(cuentasActuales))
  );
}

export function obtenerFuente(fuente) {
  return FUENTES_MUESTRAS.find((item) => item.valor === normalizarFuente(fuente));
}

export function obtenerValorMuestra(muestra) {
  return muestra.valor ?? null;
}

export function tieneValorMuestra(valor) {
  return valor !== null && valor !== undefined && valor !== "" && Number.isFinite(Number(valor));
}

export function formatearMonto(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero)
    ? `$${numero.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : TEXTO_SIN_DATOS;
}

export function formatearCantidad(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero.toLocaleString("es-CO") : TEXTO_SIN_DATOS;
}
