/**
 * @uso        Transformaciones y filtros puros de los datos de correo
 * @funciones  extraerLista, normalizarDireccion, quitarFuentesDuplicadas, fechaLegible, coincideCategoria, coincideDestino, combinarTarjetasCorreo
 * @datos      Respuestas de fuente, cuentas Gmail y mensajes
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   useCorreos, CorreoCuentaCard y BandejaCorreosModal
 */
export const CATEGORIAS_CORREO = [
  { id: "TODOS", etiqueta: "Todos" },
  { id: "IMPORTANTES", etiqueta: "Importantes" },
  { id: "NO_IMPORTANTES", etiqueta: "No importantes" },
  { id: "CONTABLES", etiqueta: "Contables" },
  { id: "ENTRETENIMIENTO", etiqueta: "Entretenimiento" },
  { id: "OTROS", etiqueta: "Otros" },
];

export function extraerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.data || respuesta?.content || [];
}

export function normalizarDireccion(direccion) {
  return String(direccion || "").trim().toLocaleLowerCase("es");
}

export function quitarFuentesDuplicadas(fuentes) {
  const unicas = new Map();
  fuentes.forEach((fuente) => {
    const clave = normalizarDireccion(fuente.contenido);
    if (!clave) return;
    const existente = unicas.get(clave);
    if (!existente || (existente.estado === false && fuente.estado !== false)) unicas.set(clave, fuente);
  });
  return [...unicas.values()];
}

export function fechaLegible(fecha) {
  const instante = new Date(fecha);
  if (Number.isNaN(instante.getTime())) return fecha || "";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(instante);
}

export function coincideCategoria(correo, categoria) {
  switch (categoria) {
    case "IMPORTANTES": return correo.esImportante;
    case "NO_IMPORTANTES": return !correo.esImportante;
    case "CONTABLES": return correo.esContable;
    case "ENTRETENIMIENTO": return correo.esEntretenimiento;
    case "OTROS": return !correo.esContable && !correo.esEntretenimiento && !correo.esImportante;
    default: return true;
  }
}

export function coincideDestino(correo, direccion) {
  return String(correo.destinatario || "").toLocaleLowerCase("es").split(/[;,]/).some((destino) => {
    const direccionEncontrada = destino.match(/<?([^<>\s,;]+@[^<>\s,;]+)>?/);
    return direccionEncontrada?.[1] === normalizarDireccion(direccion);
  });
}

export function combinarTarjetasCorreo(fuentes, cuentasGmail, cuentaSeleccionadaId) {
  const tarjetasPorDireccion = new Map();
  fuentes.forEach((fuente) => {
    const clave = normalizarDireccion(fuente.contenido);
    if (clave) tarjetasPorDireccion.set(clave, { ...fuente, tipoTarjeta: "FUENTE" });
  });
  cuentasGmail.forEach((cuenta) => {
    const clave = normalizarDireccion(cuenta.email);
    if (!clave) return;
    const fuenteExistente = tarjetasPorDireccion.get(clave);
    if (fuenteExistente) {
      const debePreferirse = String(cuenta.id) === String(cuentaSeleccionadaId);
      tarjetasPorDireccion.set(clave, { ...fuenteExistente, cuentaGmailId: debePreferirse || !fuenteExistente.cuentaGmailId ? cuenta.id : fuenteExistente.cuentaGmailId });
      return;
    }
    tarjetasPorDireccion.set(clave, { idFuente: `gmail-${cuenta.id}`, contenido: cuenta.email, tipo: "CORREO", estado: true, tipoTarjeta: "CUENTA_GMAIL", cuentaGmailId: cuenta.id });
  });
  return [...tarjetasPorDireccion.values()];
}
