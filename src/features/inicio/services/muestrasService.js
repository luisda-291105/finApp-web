import { crear, obtener, actualizar, eliminar } from "../../../services/httpServicio";

const ruta = "/api/muestras";
const tipoAApi = { tarjeta: "TARJETA", grafica: "GRAFICA", metrica: "METRICA", mapa_calor: "MAPA_CALOR" };
const tipoAUi = Object.fromEntries(Object.entries(tipoAApi).map(([ui, api]) => [api, ui]));

function prepararPayload(muestra) {
  const tipo = tipoAApi[muestra.tipo] || muestra.tipo;
  const fuente = muestra.fuente;
  const segmentoContable = fuente === "contabilidad" ? (muestra.segmentoContable || "todos") : null;
  const cuentasCorreo = fuente === "correo"
    ? [...new Set((Array.isArray(muestra.cuentasCorreo) ? muestra.cuentasCorreo : [muestra.cuentaCorreo || "todas"]).map(String))]
    : null;
  const cuentaCorreo = cuentasCorreo?.length === 1 ? cuentasCorreo[0] : (cuentasCorreo ? "todas" : null);
  return {
    tipo,
    titulo: muestra.titulo.trim(),
    datos: JSON.stringify({
      fuente,
      segmentoContable,
      cuentaCorreo,
      cuentasCorreo,
      ...(muestra.agrupacionId ? { agrupacionId: String(muestra.agrupacionId), agrupacionNombre: muestra.agrupacionNombre || "Agrupación" } : {}),
      ...(Number.isSafeInteger(Number(muestra.ordenDashboard)) ? { ordenDashboard: Number(muestra.ordenDashboard) } : {}),
    }),
  };
}

function normalizarRespuesta(muestra) {
  let datos = {};
  try { datos = typeof muestra.datos === "string" ? JSON.parse(muestra.datos) : (muestra.datos || {}); }
  catch { datos = {}; }
  const fuenteGuardada = datos.fuente || "contabilidad";
  return {
    id: String(muestra.id),
    titulo: muestra.titulo,
    tipo: tipoAUi[String(muestra.tipo).toUpperCase()] || "tarjeta",
    fuente: fuenteGuardada === "transacciones" ? "contabilidad" : fuenteGuardada,
    segmentoContable: datos.segmentoContable || "todos",
    cuentaCorreo: datos.cuentaCorreo || "todas",
    cuentasCorreo: Array.isArray(datos.cuentasCorreo) ? datos.cuentasCorreo : undefined,
    ordenDashboard: Number.isSafeInteger(Number(datos.ordenDashboard)) ? Number(datos.ordenDashboard) : undefined,
    agrupacionId: datos.agrupacionId ? String(datos.agrupacionId) : undefined,
    agrupacionNombre: datos.agrupacionNombre || undefined,
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

export async function actualizarOrdenMuestras(ids) {
  return actualizar(`${ruta}/orden`, { ids });
}

export async function eliminarMuestra(id) {
  return eliminar(`${ruta}/${id}`);
}
