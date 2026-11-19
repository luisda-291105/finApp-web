/**
 * @uso        Acceso al CRUD de suscripciones del usuario activo y a sus ajustes de organización
 * @funciones  listarSuscripcionesManuales, crearSuscripcionManual, actualizarSuscripcionManual, cambiarEstadoSuscripcionManual, eliminarSuscripcionManual, actualizarAjustesSuscripcion, listarCobrosRecurrentes
 * @datos      Envía nombre, monto, fecha de cobro, categoría, importancia, prioridad, apodo y activa; normaliza la respuesta del backend
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   SuscripcionesPage, DetalleSuscripcionModal, useSuscripcionesRecurrentes
 */
import { getEndpoint } from "../../../config/api.config";
import {
  actualizar,
  crear,
  eliminar,
  obtener,
  patch,
} from "../../../services/httpServicio";
import { listarSuscripcionesGmail } from "../../../services/gmailServicio";
import { listarMovimientos, actualizarMovimiento } from "../../contabilidad/services/movimientosService";
import {
  obtenerCorreosGmail,
  obtenerContenidoCorreosFinancierosGmail,
} from "../../../services/gmailServicio";
import {
  correoEnPapelera,
  esCandidatoFinanciero,
  extraerMovimientoSugerido,
} from "../../correos/utils/correoFinancieroHelpers";
import {
  guardarCorreoPorRevisar,
  listarCorreosImportados,
} from "../../contabilidad/services/movimientosService";

const ruta = getEndpoint("suscripcion.base");
const rutaRecurrentes = getEndpoint("suscripcion.recurrentes");

const listaDeMovimientos = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.datos || respuesta?.data || respuesta?.content || [];
};

const extraerLista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.datos || respuesta?.data || respuesta?.content || [];
};

/** Normaliza un nivel (importancia o prioridad) a Alta, Media, Baja o "" («No definido») para la interfaz. */
export const normalizarNivelUi = (valor, porDefecto = "") => {
  const normalizado = String(valor ?? "")
    .trim()
    .toUpperCase();
  if (
    normalizado === "ALTA" ||
    normalizado === "ALTO" ||
    normalizado === "IMPORTANTE"
  )
    return "Alta";
  if (normalizado === "MEDIA" || normalizado === "MEDIO") return "Media";
  if (normalizado === "BAJA" || normalizado === "BAJO") return "Baja";
  return porDefecto;
};

/** Normaliza un nivel (importancia o prioridad) a ALTA, MEDIA o BAJA para el backend. */
export const normalizarNivelApi = (valor, porDefecto = "MEDIA") => {
  const normalizado = String(valor ?? "")
    .trim()
    .toUpperCase();
  if (
    normalizado === "ALTA" ||
    normalizado === "ALTO" ||
    normalizado === "IMPORTANTE"
  )
    return "ALTA";
  if (normalizado === "MEDIA" || normalizado === "MEDIO") return "MEDIA";
  if (normalizado === "BAJA" || normalizado === "BAJO") return "BAJA";
  return porDefecto;
};

const normalizarImportanciaApi = (valor) => normalizarNivelApi(valor, "ALTA");

const normalizarApodo = (valor) => String(valor ?? "").trim();

const numeroSeguro = (valor) => {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  const texto = String(valor ?? "")
    .trim()
    .replace(/\s/g, "");
  if (!texto) return 0;
  const normalizado =
    texto.includes(",") && texto.includes(".")
      ? texto.replace(/\./g, "").replace(/,/g, ".")
      : texto.replace(/,/g, ".");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
};

const fechaSeguro = (valor) => (valor ? String(valor).slice(0, 10) : "");

/** Normaliza la suscripción que llega del backend al modelo usado en la interfaz. */
export function normalizarSuscripcionManual(respuesta) {
  const suscripcion = respuesta?.datos || respuesta?.data || respuesta || {};
  return {
    id: String(suscripcion.id ?? ""),
    origen: suscripcion.origen || "MANUAL",
    nombre: String(suscripcion.nombre || ""),
    categoria: String(suscripcion.categoria || "Otros"),
    monto: numeroSeguro(suscripcion.monto),
    fechaCobro: fechaSeguro(suscripcion.fechaCobro),
    importancia: normalizarNivelUi(suscripcion.importancia),
    prioridad: normalizarNivelUi(suscripcion.prioridad),
    apodo: normalizarApodo(suscripcion.apodo) || "",
    activa: suscripcion.activa !== false,
  };
}

const prepararPayload = (suscripcion) => ({
  nombre: String(suscripcion.nombre || "").trim(),
  monto: numeroSeguro(suscripcion.monto),
  fechaCobro: fechaSeguro(suscripcion.fechaCobro),
  categoria: String(suscripcion.categoria || "").trim(),
  importancia: normalizarImportanciaApi(suscripcion.importancia),
  prioridad: normalizarNivelApi(suscripcion.prioridad, "MEDIA"),
  apodo: normalizarApodo(suscripcion.apodo) || null,
  ...(typeof suscripcion.activa === "boolean"
    ? { activa: suscripcion.activa }
    : {}),
});

/** Consulta las suscripciones manuales, ordenadas en el backend por fecha de cobro. */
export async function listarSuscripcionesManuales() {
  const respuesta = await obtener(`${ruta}?origen=MANUAL`);
  return extraerLista(respuesta).map(normalizarSuscripcionManual);
}

/** Registra una suscripción manual del usuario activo. */
export async function crearSuscripcionManual(suscripcion) {
  const creada = await crear(ruta, prepararPayload(suscripcion));
  return normalizarSuscripcionManual(creada);
}

/**
 * Actualiza los ajustes de organización (importancia, prioridad, apodo) de cualquier
 * suscripción del usuario, manual o detectada en Gmail. "" en importancia/prioridad
 * guarda NULL en el backend (opción «No definido» del detalle).
 */
export function actualizarAjustesSuscripcion(
  id,
  { importancia, prioridad, apodo } = {},
) {
  const cuerpo = {};
  if (importancia !== undefined)
    cuerpo.importancia =
      String(importancia).trim() === ""
        ? ""
        : normalizarNivelApi(importancia, "ALTA");
  if (prioridad !== undefined)
    cuerpo.prioridad =
      String(prioridad).trim() === ""
        ? ""
        : normalizarNivelApi(prioridad, "MEDIA");
  if (apodo !== undefined) cuerpo.apodo = normalizarApodo(apodo) || null;
  return patch(`${ruta}/${encodeURIComponent(String(id))}/ajustes`, cuerpo);
}

/** Reemplaza los datos editables de una suscripción manual. */
export async function actualizarSuscripcionManual(id, suscripcion) {
  const actualizada = await actualizar(
    `${ruta}/${encodeURIComponent(String(id))}`,
    prepararPayload(suscripcion),
  );
  return normalizarSuscripcionManual(actualizada);
}

/** Activa o pausa una suscripción manual. */
export async function cambiarEstadoSuscripcionManual(id, activa) {
  const actualizada = await patch(
    `${ruta}/${encodeURIComponent(String(id))}/estado`,
    { activa: Boolean(activa) },
  );
  return normalizarSuscripcionManual(actualizada);
}

/** Elimina una suscripción manual del usuario activo. */
export function eliminarSuscripcionManual(id) {
  return eliminar(`${ruta}/${encodeURIComponent(String(id))}`);
}

/** Normaliza un cobro recurrente (de una suscripción o de un movimiento) al modelo de la interfaz. */
export function normalizarCobroRecurrente(cobro = {}) {
  const intervalo = Number(cobro.intervaloDias);
  return {
    id: String(cobro.id ?? ""),
    nombre: String(cobro.nombre ?? ""),
    categoria: String(cobro.categoria ?? ""),
    monto: numeroSeguro(cobro.monto),
    frecuencia: String(cobro.frecuencia ?? ""),
    intervaloDias: Number.isFinite(intervalo) && intervalo > 0 ? intervalo : 30,
    ultimoCobro: fechaSeguro(cobro.ultimoCobro),
    proximoCobro: fechaSeguro(cobro.proximoCobro),
    cobrosDetectados: Number(cobro.cobrosDetectados) || 0,
    origen: String(cobro.origen ?? ""),
  };
}

/**
 * Lista los cobros recurrentes del usuario: los de sus suscripciones activas
 * que tienen monto y fecha de cobro.
 */
export async function listarCobrosRecurrentes() {
  const respuesta = await obtener(rutaRecurrentes);
  return extraerLista(respuesta).map(normalizarCobroRecurrente);
}

/**
 * Sincroniza el origen (origenNombre) de los movimientos GMAIL ya registrados
 * en Contabilidad usando el apodo de cada suscripción.
 * Solo actualiza los movimientos que todavía usan el remitente/correo en lugar
 * del apodo (ej. "Alertas y Notificaciones" -> "bamcolombia").
 * @returns {Promise<{total:number,actualizados:number,errores:number,detalles:Array}>}
 */
export async function sincronizarOrigenesMovimientosGmail() {
  // 1. Suscripciones Gmail con apodo, cuenta y remitente.
  const respuesta = await listarSuscripcionesGmail();
  const suscripciones = (Array.isArray(respuesta?.suscripciones)
    ? respuesta.suscripciones
    : []
  ).map((s) => ({
    cuentaGmailId: String(s.cuentaGmailId ?? ""),
    correoRemitente: String(s.correoRemitente ?? ""),
    apodo: String(s.apodo ?? "").trim(),
  }));

  // Índice por cuenta Gmail para hacer match del movimiento.
  const porCuenta = new Map();
  for (const s of suscripciones) {
    if (!s.apodo) continue;
    if (!porCuenta.has(s.cuentaGmailId)) porCuenta.set(s.cuentaGmailId, []);
    porCuenta.get(s.cuentaGmailId).push(s);
  }

  // 2. Movimientos GMAIL confirmados en Contabilidad con bolsillo asignado. Los pendientes
  // de revisión se excluyen: su bolsillo es «Por revisar» y reasignarlo con actualizar los
  // degradaría a tipo POR_REVISAR, dejándolos fuera de los totales.
  const respuestaMovimientos = await listarMovimientos(null, "TODOS");
  const movimientos = listaDeMovimientos(respuestaMovimientos).filter(
    (m) =>
      String(m.origenTipo || "").toUpperCase() === "GMAIL" &&
      String(m.estadoRevision || "").toUpperCase() !== "POR_REVISAR" &&
      typeof m.idBolsillo === "string" &&
      m.idBolsillo.trim() !== "",
  );

  // 3. Actualizar los que coincidan y aún no lleven el apodo como origen.
  let actualizados = 0;
  let errores = 0;
  const detalles = [];
  for (const movimiento of movimientos) {
    const cuentaGmailId = String(movimiento.origenId || "").split(":")[0];
    const candidatos = porCuenta.get(cuentaGmailId) || [];
    const origenActual = String(movimiento.origenNombre || "");
    const candidato = candidatos.find((s) => {
      if (origenActual === s.apodo) return false; // ya actualizado
      return (
        s.correoRemitente &&
        (movimiento.remitente === s.correoRemitente ||
          movimiento.origenNombre === s.correoRemitente)
      );
    });
    if (!candidato) continue;

    try {
      await actualizarMovimiento(movimiento.idMovimiento, {
        idBolsillo: movimiento.idBolsillo,
        tipo: movimiento.tipo,
        fecha: movimiento.fecha,
        monto: movimiento.monto,
        categoria: movimiento.categoria,
        concepto: movimiento.concepto,
        origenTipo: movimiento.origenTipo,
        origenId: movimiento.origenId,
        origenNombre: candidato.apodo,
        ...(movimiento.entidad ? { entidad: movimiento.entidad } : {}),
        ...(movimiento.remitente ? { remitente: movimiento.remitente } : {}),
        ...(movimiento.descripcion ? { descripcion: movimiento.descripcion } : {}),
      });
      actualizados++;
      detalles.push({
        idMovimiento: movimiento.idMovimiento,
        concepto: movimiento.concepto || movimiento.categoria,
        origenAnterior: origenActual,
        apodo: candidato.apodo,
      });
    } catch {
      errores++;
    }
  }
  return { total: movimientos.length, actualizados, errores, detalles };
}

/** Importa como pendientes desde Gmail los movimientos financieros no detectados aún. */
export async function importarMovimientosGmailPendientes(cuentasGmail = []) {
  const activos = (cuentasGmail || [])
    .map((cuenta) => ({
      id: String(cuenta?.id ?? ""),
      email: String(cuenta?.email ?? "").trim(),
    }))
    .filter((cuenta) => cuenta.id && cuenta.email);
  if (!activos.length) return { total: 0, creados: 0 };

  let total = 0;
  let creados = 0;
  for (const cuenta of activos) {
    try {
      const respuestaCorreos = await obtenerCorreosGmail(cuenta.id, [
        {
          idFuente: `gmail-${cuenta.id}`,
          contenido: cuenta.email,
          estado: true,
        },
      ]);
      const correos = (Array.isArray(respuestaCorreos) ? respuestaCorreos : [])
        .filter((correo) => !correoEnPapelera(correo))
        .filter(esCandidatoFinanciero)
        .slice(0, 5)
        .map((correo) => ({ ...correo, cuentaGmailId: cuenta.id }));
      total += correos.length;
      if (!correos.length) continue;

      const conContenido = await obtenerContenidoCorreosFinancierosGmail(
        cuenta.id,
        correos,
      );
      const sugerencias = (conContenido || [])
        .map(extraerMovimientoSugerido)
        .filter(Boolean);
      if (!sugerencias.length) continue;

      const importadosRespuesta = await listarCorreosImportados(
        sugerencias.map((item) => item.origenId),
      );
      const yaImportados = new Set(
        Array.isArray(importadosRespuesta)
          ? importadosRespuesta
          : importadosRespuesta?.data || [],
      );
      for (const item of sugerencias) {
        if (yaImportados.has(String(item.origenId))) continue;
        try {
          await guardarCorreoPorRevisar({
            idBolsillo: null,
            tipo: item.tipo,
            fecha: item.fecha,
            monto: item.monto,
            categoria: item.categoria,
            concepto: item.concepto,
            origenTipo: "GMAIL",
            origenId: item.origenId,
            origenNombre: item.remitente,
          });
          creados += 1;
        } catch {
          // Continúa con el resto de candidatos.
        }
      }
    } catch {
      // La cuenta falló; no cancela el resto.
    }
  }
  return { total, creados };
}
