/**
 * @uso        Autoriza y consulta mensajes de Gmail directamente desde el navegador
 * @funciones  iniciarCodigoAutorizacionGmail, canjearCodigoGmail, obtenerCorreosGmail
 * @datos      Token activo en memoria del navegador; backend conserva la conexión cifrada por usuario
 * @eventos    Abre el selector y consentimiento OAuth de Google
 * @estados    Ninguno
 * @usadoPor   GmailContext y features/configuracion, features/correos
 */
import { getEndpoint } from "../config/api.config";

const URL_BIBLIOTECA_GOOGLE = "https://accounts.google.com/gsi/client";
const URL_API_GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const ALCANCE_GMAIL_LECTURA = "https://www.googleapis.com/auth/gmail.readonly";
const ID_CLIENTE_GOOGLE = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const GMAIL_CONFIGURADO = Boolean(ID_CLIENTE_GOOGLE);
const MENSAJE_ACCESO_DENEGADO =
  "Google denegó el acceso (403 access_denied). Si la app está en modo de prueba, agrega tu cuenta a Usuarios de prueba en Google Cloud Console y vuelve a intentar.";
const MAX_CORREOS_POR_CONSULTA = 10;
const CACHE_CONSULTA_MS = 45 * 1000;
const CACHE_CONTENIDO_MS = 5 * 60 * 1000;

let cargaBiblioteca;
const consultasEnCurso = new Map();
const cacheEtiquetas = new Map();
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

/** Solicita un código OAuth con popup GIS y lo devuelve mediante la respuesta JavaScript. */
export async function iniciarCodigoAutorizacionGmail() {
  if (!ID_CLIENTE_GOOGLE) {
    throw new Error("Falta configurar VITE_GOOGLE_CLIENT_ID para conectar Gmail.");
  }
  await prepararGoogleIdentityServices();

  return new Promise((resolver, rechazar) => {
    const cliente = window.google.accounts.oauth2.initCodeClient({
      client_id: ID_CLIENTE_GOOGLE,
      scope: ALCANCE_GMAIL_LECTURA,
      ux_mode: "popup",
      prompt: "consent",
      select_account: true,
      callback: (respuesta) => {
        if (respuesta.error || !respuesta.code) {
          rechazar(new Error(
            respuesta.error === "access_denied"
              ? MENSAJE_ACCESO_DENEGADO
              : respuesta.error_description || "Google no autorizó la lectura de Gmail."
          ));
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

/** Canjea el código recibido por redirección usando el endpoint del backend. */
export async function canjearCodigoGmail(code) {
  if (!code) throw new Error("Google no devolvió un código de autorización.");
  const respuesta = await fetch(getEndpoint("gmail.callback"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XmlHttpRequest",
    },
    body: JSON.stringify({ code }),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.message || datos.error || "El servidor no pudo completar la conexión con Gmail.");
  }
  const token = datos.access_token || datos.accessToken || datos.token;
  if (!token || !datos.account_id) {
    throw new Error("El servidor respondió sin un token de acceso de Gmail.");
  }
  return { token, email: datos.email || "Cuenta de Gmail", accountId: datos.account_id };
}

export async function listarCuentasGmail() {
  const respuesta = await fetch(getEndpoint("gmail.cuentas"), { credentials: "include" });
  const datos = await respuesta.json().catch(() => []);
  if (!respuesta.ok) throw new Error(datos.message || "No se pudieron cargar las cuentas Gmail.");
  return Array.isArray(datos) ? datos : [];
}

export async function obtenerConexionCuentaGmail(accountId) {
  const ruta = `${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}/conexion`;
  const respuesta = await fetch(ruta, { credentials: "include" });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.message || "No se pudo restaurar esta cuenta Gmail.");
  return datos;
}

export async function eliminarCuentaGmail(accountId) {
  const ruta = `${getEndpoint("gmail.cuentas")}/${encodeURIComponent(accountId)}`;
  const respuesta = await fetch(ruta, { method: "DELETE", credentials: "include" });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new Error(datos.message || "No se pudo desconectar esta cuenta Gmail.");
  }
}

/** Recupera del backend la conexión cifrada asociada a la sesión de FinApp. */
export async function obtenerConexionGmail() {
  const respuesta = await fetch(getEndpoint("gmail.conexion"), { credentials: "include" });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.message || "No se pudo restaurar la conexión con Gmail.");
  return datos;
}

/** Elimina del backend la conexión persistida al desconectar Gmail. */
export async function eliminarConexionGmail() {
  const respuesta = await fetch(getEndpoint("gmail.conexion"), { method: "DELETE", credentials: "include" });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new Error(datos.message || "No se pudo eliminar la conexión guardada de Gmail.");
  }
}

function validarDireccion(valor) {
  const direccion = String(valor || "").trim();
  return /^[^\s@{}]+@[^\s@{}]+\.[^\s@{}]+$/.test(direccion) ? direccion : null;
}

async function llamarGmail(token, recurso, parametros = {}) {
  const url = new URL(`${URL_API_GMAIL}/${recurso}`);
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (Array.isArray(valor)) valor.forEach((item) => url.searchParams.append(clave, item));
    else url.searchParams.set(clave, valor);
  });
  const respuesta = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    if (respuesta.status === 401) throw new Error("La autorización de Gmail venció. Conecta Gmail de nuevo.");
    const mensaje = datos.error?.message || `Gmail respondió con error ${respuesta.status}.`;
    if (respuesta.status === 429 || /quota exceeded|user.?rate.?limit|rate limit/i.test(mensaje)) {
      throw new Error("Gmail alcanzó el límite temporal de consultas. Espera unos minutos antes de actualizar de nuevo.");
    }
    throw new Error(mensaje);
  }
  return datos;
}

function encabezado(mensaje, nombre) {
  return mensaje.payload?.headers?.find((item) => item.name?.toLowerCase() === nombre.toLowerCase())?.value || "";
}

/** Recupera hasta 10 mensajes recientes dirigidos o entregados a las fuentes registradas. */
export async function obtenerCorreosGmail(token, fuentes) {
  const direcciones = [...new Set((fuentes || []).map((fuente) => validarDireccion(fuente.contenido)).filter(Boolean))];
  if (direcciones.length === 0) return [];

  const destino = direcciones.flatMap((direccion) => [
    `to:${direccion}`,
    `cc:${direccion}`,
    `deliveredto:${direccion}`,
  ]).join(" ");
  // Sin `in:inbox`: Gmail puede archivar automáticamente mensajes que siguen siendo relevantes.
  const consulta = `{${destino}}`;
  const claveConsulta = `${token}:${consulta}`;
  const consultaPrev = consultasEnCurso.get(claveConsulta);
  if (consultaPrev && (!consultaPrev.terminadaEn || Date.now() - consultaPrev.terminadaEn < CACHE_CONSULTA_MS)) return consultaPrev.promesa;

  const promesa = (async () => {
    // Limitar el lote y reutilizar etiquetas evita agotar la cuota de Gmail con lecturas repetidas.
    const listado = await llamarGmail(token, "messages", { q: consulta, maxResults: String(MAX_CORREOS_POR_CONSULTA) });
    const ids = listado.messages || [];
    let nombresEtiquetas = cacheEtiquetas.get(token);
    if (!nombresEtiquetas) {
      const respuestaEtiquetas = await llamarGmail(token, "labels");
      nombresEtiquetas = new Map((respuestaEtiquetas.labels || []).map((etiqueta) => [etiqueta.id, etiqueta.name]));
      cacheEtiquetas.set(token, nombresEtiquetas);
    }
    const mensajes = [];
    // Leer en serie reduce los picos de consultas por usuario que generan errores 429.
    for (const { id } of ids) {
      const mensaje = await llamarGmail(token, `messages/${encodeURIComponent(id)}`, {
        format: "metadata",
        metadataHeaders: ["From", "To", "Cc", "Delivered-To", "X-Original-To", "Subject", "Date"],
      });
      mensajes.push({
        id: mensaje.id,
        remitente: encabezado(mensaje, "From"),
        destinatario: ["To", "Cc", "Delivered-To", "X-Original-To"]
          .map((nombre) => encabezado(mensaje, nombre)).filter(Boolean).join(", "),
        asunto: encabezado(mensaje, "Subject") || "(Sin asunto)",
        fecha: encabezado(mensaje, "Date"),
        fragmento: mensaje.snippet || "",
        etiquetas: mensaje.labelIds || [],
        nombresEtiquetas: (mensaje.labelIds || []).map((idEtiqueta) => nombresEtiquetas.get(idEtiqueta)).filter(Boolean),
      });
    }
    return mensajes.map(clasificarCorreo);
  })();
  const registroConsulta = { promesa, terminadaEn: null };
  consultasEnCurso.set(claveConsulta, registroConsulta);
  try {
    const resultado = await promesa;
    registroConsulta.terminadaEn = Date.now();
    window.setTimeout(() => {
      if (consultasEnCurso.get(claveConsulta)?.promesa === promesa) consultasEnCurso.delete(claveConsulta);
    }, CACHE_CONSULTA_MS);
    return resultado;
  } catch (error) {
    if (consultasEnCurso.get(claveConsulta)?.promesa === promesa) consultasEnCurso.delete(claveConsulta);
    throw error;
  }
}

function decodificarBase64Url(valor) {
  if (!valor) return "";
  try {
    const binario = atob(valor.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch { return ""; }
}

function extraerTextoMensaje(payload) {
  const normalizarTexto = (texto) => texto
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    // Gmail HTML suele producir varios saltos por cada bloque anidado.
    // Conservamos la separación de párrafos, pero evitamos grandes huecos en móvil.
    .replace(/\n{2,}/g, "\n")
    .trim()
    .slice(0, 12000);
  const html = [];
  const tiposImagen = [];
  const recorrerImagenes = (parte) => {
    if (parte?.mimeType?.startsWith("image/")) tiposImagen.push(parte.mimeType);
    (parte?.parts || []).forEach(recorrerImagenes);
  };
  recorrerImagenes(payload);
  const recorrerHtml = (parte) => {
    if (parte?.mimeType === "text/html" && parte.body?.data) html.push(decodificarBase64Url(parte.body.data));
    (parte?.parts || []).forEach(recorrerHtml);
  };
  recorrerHtml(payload);
  if (html.length) return normalizarTexto(html.join(" ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<img\b[^>]*>/gi, () => {
      const tipo = tiposImagen.shift() || "image/*";
      return `\n[Imagen ${tipo}: no se puede renderizar en FinApp.]\n`;
    })
    .replace(/<a\b[^>]*href\s*=\s*([\"'])(.*?)\1[^>]*>([\s\S]*?)<\/a\s*>/gi, (_match, _quote, href, textoEnlace) => {
      const destino = String(href).replace(/&amp;/gi, "&").trim();
      const etiqueta = String(textoEnlace).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || destino;
      try {
        const url = new URL(destino);
        if (!["http:", "https:", "mailto:"].includes(url.protocol)) return etiqueta;
        return `[[[MAIL_LINK:${encodeURIComponent(etiqueta)}|${encodeURIComponent(destino)}]]]`;
      } catch { return etiqueta; }
    })
    .replace(/<\/(?:p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'"));
  const partes = [];
  const recorrer = (parte) => {
    if (parte?.mimeType === "text/plain" && parte.body?.data) partes.push(decodificarBase64Url(parte.body.data));
    (parte?.parts || []).forEach(recorrer);
  };
  recorrer(payload);
  const texto = partes.join("\n\n");
  const avisoImagenes = tiposImagen.length
    ? `\n${tiposImagen.map((tipo) => `[Imagen ${tipo}: no se puede renderizar en FinApp.]`).join("\n")}`
    : "";
  return normalizarTexto(`${texto}${avisoImagenes}`);
}

async function obtenerContenidoCompleto(token, messageId) {
  const clave = `${token}:${messageId}`;
  const almacenado = cacheContenido.get(clave);
  if (almacenado && Date.now() - almacenado.fecha < CACHE_CONTENIDO_MS) return almacenado.promesa;

  const promesa = llamarGmail(token, `messages/${encodeURIComponent(messageId)}`, { format: "full" })
    .then((mensaje) => extraerTextoMensaje(mensaje.payload));
  cacheContenido.set(clave, { fecha: Date.now(), promesa });
  window.setTimeout(() => {
    if (cacheContenido.get(clave)?.promesa === promesa) cacheContenido.delete(clave);
  }, CACHE_CONTENIDO_MS);
  try {
    return await promesa;
  } catch (error) {
    if (cacheContenido.get(clave)?.promesa === promesa) cacheContenido.delete(clave);
    throw error;
  }
}

/** Recupera el contenido completo de un correo al abrir su vista de detalle. */
export async function obtenerContenidoCorreoGmail(token, messageId) {
  return obtenerContenidoCompleto(token, messageId);
}

/** Lee en serie el cuerpo solo de los mensajes financieros candidatos. */
export async function obtenerContenidoCorreosFinancierosGmail(token, correosCandidatos) {
  const resultados = [];
  for (const correo of (correosCandidatos || []).slice(0, 5)) {
    resultados.push({ ...correo, contenido: await obtenerContenidoCompleto(token, correo.id) });
  }
  return resultados;
}

/** Indica qué cuenta de Google autorizó la consulta. */
export async function obtenerPerfilGmail(token) {
  const perfil = await llamarGmail(token, "profile");
  return perfil.emailAddress || "Cuenta de Gmail";
}

function clasificarCorreo(correo) {
  const texto = `${correo.remitente} ${correo.asunto} ${correo.fragmento}`.toLocaleLowerCase("es");
  const esContable = /factura|recibo|extracto|estado de cuenta|pago|transacci[oó]n|compra|saldo|cobro|invoice|receipt|statement|payment|transaction/.test(texto);
  const esEstudios = /estudio|estudios|universidad|colegio|escuela|academia|curso|curs[oó]s|capacitaci[oó]n|formaci[oó]n|lecci[oó]n|clase|educaci[oó]n|educativo|learning|education|course|class|lesson|training|school|university|academy|coursera|udemy|edx|platzi|codecademy/.test(texto);
  const esEntretenimiento = /netflix|spotify|youtube|disney|prime video|hbo|cine|concierto|juego|gaming|entretenimiento|streaming|music|movie/.test(texto);
  const esImportante = correo.etiquetas.includes("IMPORTANT") || /urgente|importante|acci[oó]n requerida|vencimiento|alerta de seguridad|verifica tu cuenta/.test(texto);
  return { ...correo, esContable, esEstudios, esEntretenimiento, esImportante };
}
