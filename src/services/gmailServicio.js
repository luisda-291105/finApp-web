/**
 * @uso        Autoriza Google y consulta Gmail/Contacts por medio del backend
 * @funciones  iniciarCodigoAutorizacionGmail, canjearCodigoGmail, obtenerCorreosGmail
 * @datos      El backend conserva y usa las credenciales; el navegador solo recibe datos de consulta
 * @eventos    Abre el selector y consentimiento OAuth de Google
 * @estados    Ninguno
 * @usadoPor   GmailContext y features/configuracion, features/contactos, features/correos
 */
import { getEndpoint } from "../config/api.config";

const URL_BIBLIOTECA_GOOGLE = "https://accounts.google.com/gsi/client";
const ALCANCE_GMAIL_LECTURA = "https://www.googleapis.com/auth/gmail.readonly";
const ALCANCE_CONTACTOS_LECTURA = "https://www.googleapis.com/auth/contacts.readonly";
const ID_CLIENTE_GOOGLE = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const GMAIL_CONFIGURADO = Boolean(ID_CLIENTE_GOOGLE);
const MENSAJE_ACCESO_DENEGADO =
  "Google denegó el acceso (403 access_denied). Si la app está en modo de prueba, agrega tu cuenta a Usuarios de prueba en Google Cloud Console y vuelve a intentar.";
const CACHE_CONSULTA_MS = 45 * 1000;
const CACHE_CONTENIDO_MS = 5 * 60 * 1000;
export const REMITENTE_MOVIMIENTOS_BANCOLOMBIA = "alertasynotificaciones@ayn.notificacionesbancolombia.com";

let cargaBiblioteca;
const cacheConsultas = new Map();
const cacheContenido = new Map();

function cargarBibliotecaGoogle() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (cargaBiblioteca) return cargaBiblioteca;

  cargaBiblioteca = new Promise((resolver, rechazar) => {
    const existente = document.querySelector(`script[src="${URL_BIBLIOTECA_GOOGLE}"]`);
    const script = existente || document.createElement("script");
    const alCargar = () => window.google?.accounts?.oauth2
      ? resolver()
      : rechazar(new Error("Google Identity Services no está disponible."));
    script.addEventListener("load", alCargar, { once: true });
    script.addEventListener("error", () => rechazar(new Error("No se pudo cargar la autorización de Google.")), { once: true });
    if (!existente) {
      script.src = URL_BIBLIOTECA_GOOGLE;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    cargaBiblioteca = null;
    throw error;
  });

  return cargaBiblioteca;
}

/** Prepara GIS antes del gesto del usuario para que el popup no sea bloqueado. */
export async function prepararGoogleIdentityServices() {
  if (!ID_CLIENTE_GOOGLE) throw new Error("Falta configurar VITE_GOOGLE_CLIENT_ID para conectar Gmail.");
  await cargarBibliotecaGoogle();
}

/** Solicita un código OAuth con popup GIS; las llamadas a las APIs se hacen en el backend. */
export async function iniciarCodigoAutorizacionGmail({ incluirContactos = false, cuentaEsperada = "" } = {}) {
  if (!ID_CLIENTE_GOOGLE) {
    throw new Error("Falta configurar VITE_GOOGLE_CLIENT_ID para conectar Gmail.");
  }
  await prepararGoogleIdentityServices();

  return new Promise((resolver, rechazar) => {
    const cliente = window.google.accounts.oauth2.initCodeClient({
      client_id: ID_CLIENTE_GOOGLE,
      scope: incluirContactos ? `${ALCANCE_GMAIL_LECTURA} ${ALCANCE_CONTACTOS_LECTURA}` : ALCANCE_GMAIL_LECTURA,
      include_granted_scopes: true,
      ux_mode: "popup",
      ...(!incluirContactos ? { prompt: "consent" } : {}),
      select_account: !cuentaEsperada,
      ...(cuentaEsperada ? { login_hint: cuentaEsperada } : {}),
      callback: (respuesta) => {
        if (respuesta.error || !respuesta.code) {
          rechazar(new Error(
            respuesta.error === "access_denied"
              ? MENSAJE_ACCESO_DENEGADO
              : respuesta.error_description || "Google no autorizó la lectura de Gmail."
          ));
          return;
        }
        if (incluirContactos && respuesta.scope
          && !respuesta.scope.split(/\s+/).includes(ALCANCE_CONTACTOS_LECTURA)) {
          rechazar(new Error("Google no concedió el permiso de lectura de Contactos. Vuelve a autorizarlo desde el detalle de la fuente Gmail."));
          return;
        }
        resolver(respuesta.code);
      },
      error_callback: (respuesta) => {
        const mensaje = respuesta.type === "popup_closed"
          ? `La autorización de Google se cerró antes de terminar. ${MENSAJE_ACCESO_DENEGADO}`
          : respuesta.type === "popup_failed_to_open"
            ? "El navegador bloqueó la ventana de Google. Permite ventanas emergentes para localhost y vuelve a intentar."
            : respuesta.message || "No se completó la autorización de Gmail.";
        rechazar(new Error(mensaje));
      },
    });
    try {
      cliente.requestCode();
    } catch (error) {
      rechazar(error);
    }
  });
}

async function solicitarBackend(url, opciones = {}) {
  const respuesta = await fetch(url, { credentials: "include", ...opciones });
  const datos = await respuesta.json().catch(() => ({}));
  if (respuesta.status === 401) {
    cacheConsultas.clear();
    cacheContenido.clear();
    window.dispatchEvent(new CustomEvent("finapp:sesion-requerida"));
  }
  if (!respuesta.ok) throw new Error(datos.message || "No se pudo completar la consulta de Google.");
  return datos;
}

function consultarConCache(cache, clave, duracionMs, consultar) {
  const ahora = Date.now();
  for (const [key, registro] of cache) {
    if (ahora - registro.creadoEn >= duracionMs) cache.delete(key);
  }
  const actual = cache.get(clave);
  if (actual) return actual.promesa;
  const registro = { creadoEn: ahora, promesa: Promise.resolve().then(consultar) };
  cache.set(clave, registro);
  if (cache.size > 100) cache.delete(cache.keys().next().value);
  registro.promesa.catch(() => {
    if (cache.get(clave) === registro) cache.delete(clave);
  });
  return registro.promesa;
}

/** Canjea el código OAuth en el backend; no recibe ni expone tokens de Google. */
export async function canjearCodigoGmail(code, cuentaEsperadaId = "") {
  if (!code) throw new Error("Google no devolvió un código de autorización.");
  const datos = await solicitarBackend(getEndpoint("gmail.callback"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XmlHttpRequest",
    },
    body: JSON.stringify({ code, expected_account_id: cuentaEsperadaId || undefined }),
  });
  if (!datos.account_id) throw new Error("El servidor respondió sin identificar la cuenta Gmail.");
  return {
    email: datos.email || "Cuenta de Gmail",
    accountId: datos.account_id,
    pushWarning: datos.push_warning || "",
  };
}

export async function listarCuentasGmail() {
  const datos = await solicitarBackend(getEndpoint("gmail.cuentas"));
  return Array.isArray(datos) ? datos : [];
}

/** Obtiene del backend los remitentes suscritos ya agrupados y filtrados por usuario. */
export async function listarSuscripcionesGmail() {
  return solicitarBackend(getEndpoint("gmail.suscripciones"));
}

/** Recupera los mensajes recientes guardados para el remitente de una suscripción activa. */
export async function obtenerMensajesSuscripcionGmail(accountId, correoRemitente) {
  if (!accountId || !correoRemitente) throw new Error("Selecciona una suscripción para consultar sus mensajes.");
  const url = `${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/suscripciones/mensajes?correo=${encodeURIComponent(correoRemitente)}`;
  const mensajes = await solicitarBackend(url);
  return (Array.isArray(mensajes) ? mensajes : []).map(clasificarCorreo);
}

/** Inicia la importación asíncrona de mensajes del remitente oficial de movimientos. */
export async function iniciarImportacionLoteGmail(accountId) {
  if (!accountId) throw new Error("Selecciona una cuenta Gmail para importar mensajes.");
  return solicitarBackend(`${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/suscripciones/importar-lote`, {
    method: "POST",
  });
}

/** Consulta el progreso y los resultados por mensaje de un lote Gmail. */
export async function obtenerEstadoImportacionLoteGmail(accountId, loteId) {
  if (!accountId || !loteId) throw new Error("Falta la cuenta o el identificador del lote Gmail.");
  return solicitarBackend(`${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/suscripciones/lotes/${encodeURIComponent(loteId)}`);
}

export async function listarNotificacionesMovimientosGmail() {
  return solicitarBackend(getEndpoint("gmail.movimientosNotificaciones"));
}

export async function confirmarNotificacionesMovimientosGmail(ids) {
  if (!ids?.length) return;
  await solicitarBackend(`${getEndpoint("gmail.movimientosNotificaciones")}/confirmar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

export async function obtenerConexionCuentaGmail(accountId) {
  return solicitarBackend(`${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/conexion`);
}

export async function eliminarCuentaGmail(accountId) {
  await solicitarBackend(`${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}`, { method: "DELETE" });
}

/** Consulta los contactos de una cuenta Google vinculada por medio del backend. */
export async function obtenerContactosGoogle(accountId) {
  if (!accountId) throw new Error("Selecciona una cuenta Gmail para consultar sus contactos.");
  return solicitarBackend(`${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/contactos`);
}

export async function verificarPermisoContactosGoogle(accountId) {
  if (!accountId) return false;
  const datos = await solicitarBackend(`${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/contactos/permiso`);
  return datos.autorizado === true;
}

/** Recupera los mensajes destinados a fuentes propias, sin exponer el token al navegador. */
export async function obtenerCorreosGmail(accountId, fuentes) {
  if (!accountId) throw new Error("Selecciona una cuenta Gmail para consultar los mensajes.");
  const fuentesIds = [...new Set((fuentes || []).map((fuente) => fuente.idFuente)
    .filter((id) => id && !String(id).startsWith("gmail-")))];
  const clave = `${accountId}:${fuentesIds.slice().sort().join(",")}`;
  return consultarConCache(cacheConsultas, clave, CACHE_CONSULTA_MS, async () => {
    const mensajes = await solicitarBackend(`${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/mensajes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fuentes_ids: fuentesIds }),
    });
    return (Array.isArray(mensajes) ? mensajes : []).map(clasificarCorreo);
  });
}

/** Recupera del backend el cuerpo de un correo de la cuenta seleccionada. */
export async function obtenerContenidoCorreoGmail(accountId, messageId) {
  const clave = `${accountId}:${messageId}`;
  return consultarConCache(cacheContenido, clave, CACHE_CONTENIDO_MS, async () => {
    const datos = await solicitarBackend(`${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/mensajes/${encodeURIComponent(messageId)}/contenido`);
    return datos.content || "";
  });
}

/** Lee en serie el cuerpo solo de los mensajes financieros candidatos. */
export async function obtenerContenidoCorreosFinancierosGmail(accountId, correosCandidatos) {
  const resultados = [];
  for (const correo of (correosCandidatos || []).slice(0, 5)) {
    resultados.push({ ...correo, contenido: await obtenerContenidoCorreoGmail(accountId, correo.id) });
  }
  return resultados;
}

function clasificarCorreo(correo) {
  const texto = `${correo.remitente} ${correo.asunto} ${correo.fragmento}`.toLocaleLowerCase("es");
  const esContable = /factura|recibo|extracto|estado de cuenta|pago|transacci[oó]n|compra|saldo|cobro|invoice|receipt|statement|payment|transaction/.test(texto);
  const esEstudios = /estudio|estudios|universidad|colegio|escuela|academia|curso|curs[oó]s|capacitaci[oó]n|formaci[oó]n|lecci[oó]n|clase|educaci[oó]n|educativo|learning|education|course|class|lesson|training|school|university|academy|coursera|udemy|edx|platzi|codecademy/.test(texto);
  const esEntretenimiento = /netflix|spotify|youtube|disney|prime video|hbo|cine|concierto|juego|gaming|entretenimiento|streaming|music|movie/.test(texto);
  const etiquetas = Array.isArray(correo.etiquetas) ? correo.etiquetas : [];
  const esImportante = etiquetas.includes("IMPORTANT") || /urgente|importante|acci[oó]n requerida|vencimiento|alerta de seguridad|verifica tu cuenta/.test(texto);
  return { ...correo, esContable, esEstudios, esEntretenimiento, esImportante };
}
