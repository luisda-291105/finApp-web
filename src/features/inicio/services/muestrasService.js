import { crear, obtener, actualizar, eliminar } from "../../../services/httpServicio";

const ruta = "/api/muestras";
const tipoAApi = { tarjeta: "TARJETA", grafica: "GRAFICA", metrica: "METRICA", mapa_calor: "MAPA_CALOR" };
const tipoAUi = Object.fromEntries(Object.entries(tipoAApi).map(([ui, api]) => [api, ui]));

function prepararPayload(muestra) {
  const tipo = tipoAApi[muestra.tipo] || muestra.tipo;
  const fuente = muestra.fuente;
  const segmentoContable = fuente === "contabilidad" ? (muestra.segmentoContable || "todos") : null;
  const cuentaCorreo = fuente === "correo" ? (muestra.cuentaCorreo || "todas") : null;
  return {
    tipo,
    titulo: muestra.titulo.trim(),
    datos: JSON.stringify({ fuente, segmentoContable, cuentaCorreo }),
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
    cuentaCorreo: datos.cuentaCorreo || "todas",
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
