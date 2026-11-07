/**
 * @uso        Autoriza y consulta mensajes de Gmail directamente desde el navegador
 * @funciones  iniciarCodigoAutorizacionGmail, canjearCodigoGmail, obtenerCorreosGmail
 * @datos      Token activo en memoria del navegador; backend conserva la conexión cifrada por usuario
 * @eventos    Abre el selector y consentimiento OAuth de Google
 * @estados    Ninguno
 * @usadoPor   GmailContext, PaginaDashboardConfiguracion y features/correos
 */
import { getEndpoint } from "../config/api.config";

const URL_BIBLIOTECA_GOOGLE = "https://accounts.google.com/gsi/client";
const URL_API_GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const ALCANCE_GMAIL_LECTURA = "https://www.googleapis.com/auth/gmail.readonly";
const ID_CLIENTE_GOOGLE = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const GMAIL_CONFIGURADO = Boolean(ID_CLIENTE_GOOGLE);
const MENSAJE_ACCESO_DENEGADO =
  "Google denegó el acceso (403 access_denied). Si la app está en modo de prueba, agrega tu cuenta a Usuarios de prueba en Google Cloud Console y vuelve a intentar.";

let cargaBiblioteca;

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
    throw new Error(datos.error?.message || `Gmail respondió con error ${respuesta.status}.`);
  }
  return datos;
}

function encabezado(mensaje, nombre) {
  return mensaje.payload?.headers?.find((item) => item.name?.toLowerCase() === nombre.toLowerCase())?.value || "";
}

/** Recupera los 20 mensajes más recientes dirigidos o entregados a las fuentes registradas. */
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
  // Gmail ya devuelve primero los mensajes recientes; no se reordena localmente.
  const listado = await llamarGmail(token, "messages", { q: consulta, maxResults: "20" });
  const ids = listado.messages || [];
  const mensajes = [];
  for (let inicio = 0; inicio < ids.length; inicio += 8) {
    const bloque = await Promise.all(ids.slice(inicio, inicio + 8).map(async ({ id }) => {
      const mensaje = await llamarGmail(token, `messages/${encodeURIComponent(id)}`, {
        format: "metadata",
        metadataHeaders: ["From", "To", "Cc", "Delivered-To", "X-Original-To", "Subject", "Date"],
      });
      return {
        id: mensaje.id,
        remitente: encabezado(mensaje, "From"),
        destinatario: ["To", "Cc", "Delivered-To", "X-Original-To"]
          .map((nombre) => encabezado(mensaje, nombre))
          .filter(Boolean)
          .join(", "),
        asunto: encabezado(mensaje, "Subject") || "(Sin asunto)",
        fecha: encabezado(mensaje, "Date"),
        fragmento: mensaje.snippet || "",
        etiquetas: mensaje.labelIds || [],
      };
    }));
    mensajes.push(...bloque);
  }

  return mensajes.map(clasificarCorreo);
}

/** Indica qué cuenta de Google autorizó la consulta. */
export async function obtenerPerfilGmail(token) {
  const perfil = await llamarGmail(token, "profile");
  return perfil.emailAddress || "Cuenta de Gmail";
}

function clasificarCorreo(correo) {
  const texto = `${correo.remitente} ${correo.asunto} ${correo.fragmento}`.toLocaleLowerCase("es");
  const esContable = /factura|recibo|extracto|estado de cuenta|pago|transacci[oó]n|compra|saldo|cobro|invoice|receipt|statement|payment|transaction/.test(texto);
  const esEntretenimiento = /netflix|spotify|youtube|disney|prime video|hbo|cine|concierto|juego|gaming|entretenimiento|streaming|music|movie/.test(texto);
  const esImportante = correo.etiquetas.includes("IMPORTANT") || /urgente|importante|acci[oó]n requerida|vencimiento|alerta de seguridad|verifica tu cuenta/.test(texto);
  return { ...correo, esContable, esEntretenimiento, esImportante };
}
