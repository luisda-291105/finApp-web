/**
 * @uso        Composición y mapeo de la vista Papelera de correos (multi-cuenta)
 * @funciones  normalizarCorreoPapelera, listarPapeleraDeCuenta, listarPapeleraPorCuentas, moverCorreoAPapelera, restaurarCorreoDePapelera
 * @datos      DTOs de la papelera en vivo por cuenta (mensaje_id, eliminacion_estimada_en, movido_automaticamente...)
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   usePapelera y useCorreos
 */
import {
  listarPapeleraGmail,
  moverMensajeAPapeleraGmail,
  restaurarMensajeDePapeleraGmail,
} from "../../../services/gmailServicio";

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
