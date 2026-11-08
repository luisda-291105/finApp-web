const PREFIJO_CONTACTOS_GOOGLE = "GOOGLE_CONTACTS:";

/** Devuelve el correo Gmail desde el que se importó, cuando está disponible. */
export function obtenerCorreoOrigenContacto(contacto, cuentasGmail = []) {
  const origen = String(contacto?.origen || "");
  if (contacto?.correoOrigen) return contacto.correoOrigen;
  if (!origen.startsWith(PREFIJO_CONTACTOS_GOOGLE)) return "";
  const cuentaId = origen.slice(PREFIJO_CONTACTOS_GOOGLE.length).split(":")[0];
  return cuentasGmail.find((cuenta) => String(cuenta.id) === cuentaId)?.email || "";
}

/** Devuelve la categoría de origen del contacto. */
export function obtenerOrigenContacto(contacto) {
  return String(contacto?.origen || "").startsWith(PREFIJO_CONTACTOS_GOOGLE) ? "Google Contacts" : "FinApp";
}

/** Clasifica si el contacto llegó desde correo o se creó directamente en FinApp. */
export function obtenerTipoOrigenContacto(contacto) {
  return String(contacto?.origen || "").startsWith(PREFIJO_CONTACTOS_GOOGLE) ? "Correo" : "Manual";
}
