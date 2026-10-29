/**
 * @uso        Autoriza y consulta mensajes de Gmail directamente desde el navegador
 * @funciones  solicitarTokenGmail, obtenerCorreosGmail
 * @datos      Acceso temporal en memoria; no persiste tokens ni mensajes en FinApp
 * @eventos    Abre el selector y consentimiento OAuth de Google
 * @estados    Ninguno
 * @usadoPor   PaginaDashboardCorreos
 */
const URL_BIBLIOTECA_GOOGLE = "https://accounts.google.com/gsi/client";
const URL_API_GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const ALCANCE_GMAIL_LECTURA = "https://www.googleapis.com/auth/gmail.readonly";
const ID_CLIENTE_GOOGLE = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const GMAIL_CONFIGURADO = Boolean(ID_CLIENTE_GOOGLE);

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

/** Pide al usuario un token temporal de solo lectura para Gmail. */
export async function solicitarTokenGmail() {
  if (!ID_CLIENTE_GOOGLE) {
    throw new Error("Falta configurar VITE_GOOGLE_CLIENT_ID para conectar Gmail.");
  }
  await cargarBibliotecaGoogle();

  return new Promise((resolver, rechazar) => {
    const cliente = window.google.accounts.oauth2.initTokenClient({
      client_id: ID_CLIENTE_GOOGLE,
      scope: ALCANCE_GMAIL_LECTURA,
      callback: (respuesta) => {
        if (respuesta.error || !respuesta.access_token) {
          rechazar(new Error(respuesta.error_description || "Google no autorizó la lectura de Gmail."));
          return;
        }
        resolver(respuesta.access_token);
      },
      error_callback: (respuesta) => rechazar(new Error(respuesta.message || "No se completó la autorización de Gmail.")),
    });
    cliente.requestAccessToken();
  });
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

/** Recupera hasta 50 mensajes recientes de la bandeja dirigidos a las fuentes registradas. */
export async function obtenerCorreosGmail(token, fuentes) {
  const direcciones = [...new Set((fuentes || []).map((fuente) => validarDireccion(fuente.contenido)).filter(Boolean))];
  if (direcciones.length === 0) return [];

  const destino = direcciones.map((direccion) => `to:${direccion}`).join(" ");
  const consulta = `in:inbox {${destino}}`;
  const listado = await llamarGmail(token, "messages", { q: consulta, maxResults: "50" });
  const ids = listado.messages || [];
  const mensajes = [];
  for (let inicio = 0; inicio < ids.length; inicio += 8) {
    const bloque = await Promise.all(ids.slice(inicio, inicio + 8).map(async ({ id }) => {
      const mensaje = await llamarGmail(token, `messages/${encodeURIComponent(id)}`, {
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject", "Date"],
      });
      return {
        id: mensaje.id,
        remitente: encabezado(mensaje, "From"),
        destinatario: encabezado(mensaje, "To"),
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
