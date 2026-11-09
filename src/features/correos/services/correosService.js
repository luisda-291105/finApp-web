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
export async function consultarCorreosDeFuente(cuentaId, fuente) {
  const respuesta = await obtenerCorreosGmail(cuentaId, [fuente]);
  return respuesta.filter((correo) => coincideDestino(correo, fuente.contenido));
}

/** Consulta una vez y reparte los mensajes encontrados entre sus fuentes. */
export async function consultarCorreosDeFuentes(cuentaId, fuentes) {
  if (!fuentes?.length) return [];
  const correos = await obtenerCorreosGmail(cuentaId, fuentes);
  return fuentes.map((fuente) => [fuente.idFuente, correos.filter((correo) => coincideDestino(correo, fuente.contenido))]);
}
