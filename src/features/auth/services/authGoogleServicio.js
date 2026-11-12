import { getEndpoint } from "../../../config/api.config";
import { crear, obtener } from "../../../services/httpServicio";

const URL_BIBLIOTECA_GOOGLE = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const REDIRECT_URI_CONFIGURADO = import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URI || "";
const ALCANCES = "openid email profile";
let cargaBiblioteca;

export const GOOGLE_AUTH_CONFIGURADO = Boolean(CLIENT_ID);

function cargarBibliotecaGoogle() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!cargaBiblioteca) {
    cargaBiblioteca = new Promise((resolver, rechazar) => {
      const existente = document.querySelector(`script[src="${URL_BIBLIOTECA_GOOGLE}"]`);
      const script = existente || document.createElement("script");
      const alCargar = () => window.google?.accounts?.oauth2
        ? resolver()
        : rechazar(new Error("Google Identity Services no está disponible."));
      script.addEventListener("load", alCargar, { once: true });
      script.addEventListener("error", () => rechazar(new Error("No se pudo cargar el servicio de inicio de sesión de Google.")), { once: true });
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
  }
  return cargaBiblioteca;
}

export async function iniciarLoginGoogle(modo = "") {
  if (!CLIENT_ID) throw new Error("Falta configurar VITE_GOOGLE_CLIENT_ID para habilitar Google.");
  const rutaBase = getEndpoint("googleAuth.state");
  const urlEstado = modo ? `${rutaBase}?modo=${encodeURIComponent(modo)}` : rutaBase;
  const resultado = await obtener(urlEstado);
  const state = resultado?.datos?.state;
  if (!state) throw new Error("No se pudo preparar la verificación segura de Google.");
  await cargarBibliotecaGoogle();

  const redirectUri = REDIRECT_URI_CONFIGURADO || getEndpoint("googleAuth.callback");
  const cliente = window.google.accounts.oauth2.initCodeClient({
    client_id: CLIENT_ID,
    scope: ALCANCES,
    ux_mode: "redirect",
    redirect_uri: redirectUri,
    state,
    select_account: true,
  });
  cliente.requestCode();
}

export async function obtenerRegistroGooglePendiente() {
  const respuesta = await obtener(getEndpoint("googleAuth.registroPendiente"));
  return respuesta?.datos || respuesta;
}

export async function completarRegistroGoogle(datos) {
  return crear(getEndpoint("googleAuth.completarRegistro"), datos);
}

