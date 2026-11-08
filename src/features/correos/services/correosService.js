/**
 * @uso        Consultas de mensajes asociadas a las fuentes de correo
 * @funciones  consultarCorreosDeFuente, consultarCorreosDeFuentes
 * @datos      Delegan la lectura Gmail al servicio compartido y filtran cada destino
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   useCorreos
 */
import { obtenerCorreosGmail } from "../../../services/gmailServicio";
import { coincideDestino } from "../utils/correoHelpers";

/** Recupera y filtra los mensajes destinados a una fuente específica. */
export async function consultarCorreosDeFuente(token, fuente) {
  const respuesta = await obtenerCorreosGmail(token, [fuente]);
  return respuesta.filter((correo) => coincideDestino(correo, fuente.contenido));
}

/** Consulta fuentes por separado y devuelve pares [idFuente, mensajes]. */
export async function consultarCorreosDeFuentes(token, fuentes) {
  return Promise.all(fuentes.map(async (fuente) => [fuente.idFuente, await consultarCorreosDeFuente(token, fuente)]));
}
