import { crear, obtener, actualizar, eliminar } from "./httpServicio";

const ruta = "/api/muestras";
const tipoAApi = { tarjeta: "TARJETA", grafica: "GRAFICA", metrica: "METRICA", mapa_calor: "MAPA_CALOR" };
const tipoAUi = Object.fromEntries(Object.entries(tipoAApi).map(([ui, api]) => [api, ui]));
const valoresDemo = { bolsillos: 2300, ingresos: 3800000, gastos: 277000, otros: 450000, todos: 3473000, tarjetas: 890.4 };
const serieDemo = [
  { etiqueta: "L", altura: 35 }, { etiqueta: "M", altura: 60 }, { etiqueta: "X", altura: 45 },
  { etiqueta: "J", altura: 85 }, { etiqueta: "V", altura: 55 },
];
const intensidadesDemo = [
  [1, 2, 0, 3, 4], [0, 1, 2, 2, 1], [3, 0, 1, 4, 2], [2, 2, 1, 0, 3],
  [1, 3, 2, 4, 0], [4, 1, 0, 2, 2], [0, 2, 3, 1, 4],
];

function prepararPayload(muestra) {
  const tipo = tipoAApi[muestra.tipo] || muestra.tipo;
  const fuente = muestra.fuente === "transacciones" ? "contabilidad" : muestra.fuente;
  const segmentoContable = fuente === "contabilidad" ? (muestra.segmentoContable || "todos") : null;
  const valor = fuente === "contabilidad" ? valoresDemo[segmentoContable] : valoresDemo[fuente];
  return {
    tipo,
    titulo: muestra.titulo.trim(),
    datos: JSON.stringify({
      fuente,
      segmentoContable,
      valor: valor ?? null,
      variacion: "+12.4 %",
      serie: serieDemo,
      intensidades: intensidadesDemo,
    }),
  };
}

function normalizarRespuesta(muestra) {
  let datos = {};
  try { datos = typeof muestra.datos === "string" ? JSON.parse(muestra.datos) : (muestra.datos || {}); }
  catch { datos = {}; }
  return {
    id: String(muestra.id),
    titulo: muestra.titulo,
    tipo: tipoAUi[String(muestra.tipo).toUpperCase()] || "tarjeta",
    fuente: datos.fuente === "transacciones" || !datos.fuente ? "contabilidad" : datos.fuente,
    segmentoContable: datos.segmentoContable || "todos",
    valor: datos.valor,
    variacion: datos.variacion,
    serie: Array.isArray(datos.serie) ? datos.serie : undefined,
    intensidades: Array.isArray(datos.intensidades) ? datos.intensidades : undefined,
  };
}

export async function listarMuestras() {
  const respuesta = await obtener(ruta);
  const datos = respuesta?.datos || [];
  return Array.isArray(datos) ? datos.map(normalizarRespuesta) : [];
}

export async function crearMuestra(muestra) {
  const respuesta = await crear(ruta, prepararPayload(muestra));
  return normalizarRespuesta(respuesta?.datos || respuesta);
}

export async function actualizarMuestra(id, muestra) {
  const respuesta = await actualizar(`${ruta}/${id}`, prepararPayload(muestra));
  return normalizarRespuesta(respuesta?.datos || respuesta);
}

export async function eliminarMuestra(id) {
  return eliminar(`${ruta}/${id}`);
}
