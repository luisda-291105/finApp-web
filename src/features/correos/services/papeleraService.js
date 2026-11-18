/**
 * @uso        Composición y mapeo de la vista Papelera de correos (multi-cuenta)
 * @funciones  normalizarCorreoPapelera, listarPapeleraDeCuenta, listarPapeleraPorCuentas, moverCorreoAPapelera, restaurarCorreoDePapelera, normalizarConfiguracionPapelera, normalizarVistaPreviaPapelera, normalizarLoteLimpieza, obtenerConfiguracionPapelera, guardarConfiguracionPapelera, generarVistaPreviaPapelera, iniciarLimpiezaPapelera, obtenerEstadoLimpiezaPapelera, listarListaBlanca, agregarRemitenteListaBlanca, eliminarRemitenteListaBlanca
 * @datos      DTOs de la papelera en vivo por cuenta (mensaje_id, eliminacion_estimada_en, movido_automaticamente...), de la configuración de limpieza, de la vista previa, del lote y de la lista blanca
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   usePapelera y useCorreos
 */
import {
  agregarRemitenteListaBlancaGmail,
  eliminarRemitenteListaBlancaGmail,
  generarVistaPreviaPapeleraGmail,
  guardarConfiguracionPapeleraGmail,
  iniciarLimpiezaPapeleraGmail,
  listarListaBlancaGmail,
  listarPapeleraGmail,
  moverMensajeAPapeleraGmail,
  obtenerConfiguracionPapeleraGmail,
  obtenerEstadoLimpiezaPapeleraGmail,
  restaurarMensajeDePapeleraGmail,
} from "../../../services/gmailServicio";

/** Categorías de Gmail configurables para la limpieza automática, en el orden del contrato. */
export const CATEGORIAS_PAPELERA = [
  { id: "CATEGORY_PROMOTIONS", etiqueta: "Promociones" },
  { id: "CATEGORY_SOCIAL", etiqueta: "Social" },
  { id: "CATEGORY_FORUMS", etiqueta: "Foros" },
  { id: "CATEGORY_UPDATES", etiqueta: "Actualizaciones" },
  { id: "SPAM", etiqueta: "Spam" },
];

/** Motivos de exclusión de la vista previa, con su descripción legible. */
export const MOTIVOS_EXCLUSION = {
  STARRED: "Correos destacados",
  IMPORTANT: "Marcados como importantes",
  ETIQUETA_PERSONALIZADA: "Con etiquetas personalizadas",
  HILO_CON_ENVIADOS: "Hilos con mensajes enviados",
  REMITENTE_PRIORITARIO: "De remitentes prioritarios",
  REMITENTE_SUSCRITO: "De remitentes suscritos",
  MOVIMIENTO_REGISTRADO: "Con movimiento contable registrado",
  ALERTA_PENDIENTE: "Con una alerta pendiente",
  ESTADO_BOLSILLO_DUPLICADO_ERROR: "En estado pendiente, duplicado o error",
  EXENTO: "Marcados como exentos",
  LISTA_BLANCA: "En tu lista blanca",
};

/** Etiqueta legible de una categoría de Gmail de la papelera. */
export function etiquetaCategoriaPapelera(categoria) {
  return (
    CATEGORIAS_PAPELERA.find((entrada) => entrada.id === categoria)?.etiqueta ||
    categoria ||
    "Categoría"
  );
}

/** Traduce un correo del DTO de la papelera al modelo que consume la interfaz. */
export function normalizarCorreoPapelera(correo = {}, cuentaId = "") {
  const mensajeId = correo.mensaje_id || "";
  return {
    id: mensajeId,
    mensajeId,
    cuentaId,
    remitente: correo.remitente || "",
    asunto: correo.asunto || "(Sin asunto)",
    fecha: correo.fecha || "",
    eliminacionEstimadaEn: correo.eliminacion_estimada_en || "",
    movidoAutomaticamente: correo.movido_automaticamente === true,
    motivoAutomatico: correo.motivo_automatico || null,
    categoria: correo.categoria || null,
  };
}

/** Lista la papelera en vivo de una cuenta, normalizando el DTO y la paginación. */
export async function listarPapeleraDeCuenta(cuentaId, pageToken = "") {
  const datos = pageToken
    ? await listarPapeleraGmail(cuentaId, pageToken)
    : await listarPapeleraGmail(cuentaId);
  return {
    cuentaId,
    correos: (Array.isArray(datos?.correos) ? datos.correos : []).map((correo) =>
      normalizarCorreoPapelera(correo, cuentaId),
    ),
    total: Number(datos?.total) || 0,
    siguientePageToken: datos?.siguiente_page_token || null,
  };
}

/**
 * Compone la vista Papelera: una petición por cuenta conectada y agrupación por
 * cuenta. Una cuenta sin permiso ampliado o con la conexión revocada no rompe la
 * vista: se marca la sección para mostrar su aviso y se listan las demás.
 */
export async function listarPapeleraPorCuentas(cuentas = []) {
  return Promise.all(
    (cuentas || []).map(async (cuenta) => {
      const base = {
        cuentaId: cuenta?.id,
        email: cuenta?.email || "",
        correos: [],
        total: 0,
        siguientePageToken: null,
        error: "",
        requierePermiso: false,
        requiereReconexion: false,
      };
      if (!cuenta?.id) {
        return { ...base, error: "La cuenta no tiene identificador." };
      }
      try {
        const datos = await listarPapeleraDeCuenta(cuenta.id);
        return { ...base, ...datos };
      } catch (fallo) {
        const requierePermiso = fallo?.requires_scope_authorization === true;
        const requiereReconexion = fallo?.requires_reconnect === true;
        return {
          ...base,
          error:
            requierePermiso || requiereReconexion
              ? ""
              : fallo?.message || "No se pudo consultar la papelera de Gmail.",
          requierePermiso,
          requiereReconexion,
        };
      }
    }),
  );
}

/** Mueve a la Papelera de Gmail un correo concreto (única vía manual). */
export async function moverCorreoAPapelera(cuentaId, mensajeId) {
  return moverMensajeAPapeleraGmail(cuentaId, mensajeId);
}

/** Restaura a la bandeja un correo que está en la Papelera de Gmail. */
export async function restaurarCorreoDePapelera(cuentaId, mensajeId) {
  return restaurarMensajeDePapeleraGmail(cuentaId, mensajeId);
}

/** Traduce el DTO de configuración de la papelera al modelo de la interfaz. */
export function normalizarConfiguracionPapelera(datos = {}) {
  return {
    categorias: (Array.isArray(datos.categorias) ? datos.categorias : []).map(
      (categoria) => ({
        categoria: categoria.categoria,
        activa: categoria.activa === true,
        requiereAdvertencia: categoria.requiere_advertencia === true,
        advertenciaAceptada: categoria.advertencia_aceptada === true,
      }),
    ),
    antiguedadMinimaDias: Number(datos.antiguedad_minima_dias) || 0,
    limitePorEjecucion: Number(datos.limite_por_ejecucion) || 0,
    scopeAutorizado: datos.scope_autorizado === true,
  };
}

/** Traduce el DTO de la vista previa al modelo de la interfaz. */
export function normalizarVistaPreviaPapelera(datos = {}) {
  return {
    vistaPreviaId: datos.vista_previa_id || "",
    totalEstimado: Number(datos.total_estimado) || 0,
    porCategoria: (Array.isArray(datos.por_categoria) ? datos.por_categoria : []).map(
      (categoria) => ({
        categoria: categoria.categoria,
        cantidad: Number(categoria.cantidad) || 0,
        remitentes: (Array.isArray(categoria.remitentes)
          ? categoria.remitentes
          : []
        ).map((remitente) => ({
          remitente: remitente.remitente || "",
          cantidad: Number(remitente.cantidad) || 0,
        })),
      }),
    ),
    excluidosPorMotivo: (
      Array.isArray(datos.excluidos_por_motivo) ? datos.excluidos_por_motivo : []
    ).map((excluido) => ({
      motivo: excluido.motivo,
      cantidad: Number(excluido.cantidad) || 0,
    })),
  };
}

/** Traduce el DTO de seguimiento del lote de limpieza al modelo de la interfaz. */
export function normalizarLoteLimpieza(datos = {}) {
  return {
    loteId: datos.lote_id || "",
    estado: datos.estado || "",
    total: Number(datos.total) || 0,
    movidos: Number(datos.movidos) || 0,
    omitidos: Number(datos.omitidos) || 0,
    fallidos: Number(datos.fallidos) || 0,
    limiteEjecucionAlcanzado: datos.limite_ejecucion_alcanzado === true,
  };
}

/** Traduce un remitente de la lista blanca al modelo de la interfaz. */
export function normalizarRemitenteListaBlanca(remitente = {}) {
  return {
    id: remitente.id || "",
    remitente: remitente.remitente || "",
  };
}

/** Lee la configuración de la limpieza automática de una cuenta. */
export async function obtenerConfiguracionPapelera(cuentaId) {
  return normalizarConfiguracionPapelera(
    await obtenerConfiguracionPapeleraGmail(cuentaId),
  );
}

/** Guarda la configuración de la limpieza automática y devuelve la resultante. */
export async function guardarConfiguracionPapelera(cuentaId, configuracion) {
  return normalizarConfiguracionPapelera(
    await guardarConfiguracionPapeleraGmail(cuentaId, configuracion),
  );
}

/** Genera una vista previa de la limpieza con los parámetros indicados. */
export async function generarVistaPreviaPapelera(cuentaId, parametros) {
  return normalizarVistaPreviaPapelera(
    await generarVistaPreviaPapeleraGmail(cuentaId, parametros),
  );
}

/** Inicia la limpieza explícita según la vista previa confirmada. */
export async function iniciarLimpiezaPapelera(cuentaId, parametros) {
  const datos = await iniciarLimpiezaPapeleraGmail(cuentaId, parametros);
  return { loteId: datos?.lote_id || "", estado: datos?.estado || "" };
}

/** Consulta el estado de un lote de limpieza. */
export async function obtenerEstadoLimpiezaPapelera(cuentaId, loteId) {
  return normalizarLoteLimpieza(
    await obtenerEstadoLimpiezaPapeleraGmail(cuentaId, loteId),
  );
}

/** Lista los remitentes de la lista blanca de una cuenta. */
export async function listarListaBlanca(cuentaId) {
  const datos = await listarListaBlancaGmail(cuentaId);
  return (Array.isArray(datos?.remitentes) ? datos.remitentes : []).map(
    normalizarRemitenteListaBlanca,
  );
}

/** Añade un remitente a la lista blanca de una cuenta. */
export async function agregarRemitenteListaBlanca(cuentaId, remitente) {
  return normalizarRemitenteListaBlanca(
    await agregarRemitenteListaBlancaGmail(cuentaId, remitente),
  );
}

/** Quita un remitente de la lista blanca de una cuenta. */
export async function eliminarRemitenteListaBlanca(cuentaId, remitenteId) {
  await eliminarRemitenteListaBlancaGmail(cuentaId, remitenteId);
}
