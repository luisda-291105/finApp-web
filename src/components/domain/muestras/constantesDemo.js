/**
 * @uso        Constantes de datos demostrativos para el dashboard
 * @funciones  Valores fijos, series, intensidades, clases de estilo
 * @datos      Números de maqueta, no datos financieros reales
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   components/domain/muestras/*, pages/PaginaDashboardInicio.jsx
 */

// Formato de moneda del repo: $ + toLocaleString("es-MX", { minimumFractionDigits: 2 })
export const FORMATO_MONEDA = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Valores demostrativos fijos por fuente (decisión 5 de la spec 037, AC-31):
 * el número que muestra cada muestra según su fuente.
 * Números de maqueta, no datos financieros reales.
 */
export const VALORES_DEMO = {
  bolsillos: 2300,
  contabilidad: 3473000,
  transacciones: 5800,
  ingresos: 4250,
  gastos: 1820.75,
  tarjetas: 890.4,
};

/** Variación demostrativa del tipo métrica (decisiones 13 y 14 de la spec 037). */
export const VARIACION_METRICA_DEMO = "+12.4 %";

/** Único texto de estado vacío de la spec: muestra sin valor válido (RF-14). */
export const TEXTO_SIN_DATOS = "Sin datos disponibles";

/**
 * Serie fija de la gráfica demostrativa (RF-08, AC-13):
 * 5 barras con alturas porcentuales fijas sobre la caja de la gráfica
 * y una etiqueta mínima simulada por barra.
 */
export const SERIE_GRAFICA_DEMO = [
  { etiqueta: "L", altura: 35 },
  { etiqueta: "M", altura: 60 },
  { etiqueta: "X", altura: 45 },
  { etiqueta: "J", altura: 85 },
  { etiqueta: "V", altura: 55 },
];

/**
 * Intensidades simuladas del mapa de calor demostrativo (RF-08, AC-15):
 * 7 filas de días × 5 franjas horarias, con niveles de 0 a 4 fijos.
 */
export const INTENSIDADES_MAPA_DEMO = [
  [1, 2, 0, 3, 4],
  [0, 1, 2, 2, 1],
  [3, 0, 1, 4, 2],
  [2, 2, 1, 0, 3],
  [1, 3, 2, 4, 0],
  [4, 1, 0, 2, 2],
  [0, 2, 3, 1, 4],
];

/** Clases de token por cada nivel de intensidad del mapa de calor (0 a 4). */
export const CLASES_INTENSIDAD = [
  "bg-emerald-primary/10",
  "bg-emerald-primary/30",
  "bg-emerald-primary/50",
  "bg-emerald-primary/70",
  "bg-emerald-primary/90",
];

/** Borrador inicial del formulario: los tres campos vacíos muestran su placeholder. */
export const BORRADOR_VACIO = {
  titulo: "",
  fuente: "",
  tipo: "",
  segmentoContable: "todos",
};