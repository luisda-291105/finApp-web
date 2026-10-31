/**
 * @uso        Envía preguntas al asistente a través de finApp-backend
 * @funciones  conversarConAsistente(peticion, signal)
 * @datos      Mensaje e historial breve en memoria; devuelve respuesta y fuentes
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   AsistenteAyuda.jsx
 */
import { getEndpoint } from "../config/api.config";

/** Llama al endpoint del asistente sin exponer credenciales de proveedores en el navegador. */
export async function conversarConAsistente(peticion, signal) {
  let respuesta;
  try {
    respuesta = await fetch(getEndpoint("asistente.chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(peticion),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("No se pudo conectar con FinApp. Comprueba que el backend esté disponible.");
  }

  const texto = await respuesta.text().catch(() => "");
  let datos = {};
  try {
    datos = JSON.parse(texto);
  } catch {
    datos = { mensaje: texto };
  }
  console.error("[Asistente][Error respuesta]", respuesta.status, datos);

  if (!respuesta.ok) {
    const detalle = datos.mensaje || datos.error || datos.message || texto || `Error HTTP ${respuesta.status}`;
    throw new Error(detalle);
  }
  return datos;
}
