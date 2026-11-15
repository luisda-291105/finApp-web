/**
 * @uso        Transformaciones y filtros puros de los datos de correo
 * @funciones  extraerLista, normalizarDireccion, quitarFuentesDuplicadas, fechaLegible, coincideCategoria, coincideTipoMovimiento, tipoMovimientoCorreo, coincideDestino, combinarTarjetasCorreo
 * @datos      Respuestas de fuente, cuentas Gmail y mensajes
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   useCorreos, CorreoCuentaCard y BandejaCorreosModal
 */
import { clasificarMovimientoCorreo } from "./correoFinancieroHelpers";

export const CATEGORIAS_CORREO = [
  { id: "TODOS", etiqueta: "Todos" },
  { id: "IMPORTANTES", etiqueta: "Importantes" },
  { id: "NO_IMPORTANTES", etiqueta: "No importantes" },
  { id: "CONTABLES", etiqueta: "Contables" },
  { id: "ESTUDIOS", etiqueta: "Estudios" },
  { id: "ENTRETENIMIENTO", etiqueta: "Entretenimiento" },
  { id: "OTROS", etiqueta: "Otros" },
];

/** Filtros de tipo de movimiento: mismo vocabulario que contabilidad (TIPOS_BASE) sin AHORRO, que nunca se deriva de correos. */
export const FILTROS_TIPO_MOVIMIENTO = [
  { valor: "TODOS", etiqueta: "Todos" },
  { valor: "INGRESO", etiqueta: "Ingresos" },
  { valor: "GASTO", etiqueta: "Gastos" },
];

export function extraerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.data || respuesta?.content || [];
}

export function normalizarDireccion(direccion) {
  return String(direccion || "").trim().toLocaleLowerCase("es");
}

export function separarRemitente(remitente) {
  const texto = String(remitente || "").trim();
  const direccion = texto.match(/<?([^<>\s]+@[^<>\s]+)>?/);
  const nombre = direccion ? texto.replace(direccion[0], "").replace(/[\"']/g, "").trim() : "";
  return { nombre: nombre || (direccion ? direccion[1].split("@")[0] : texto), email: direccion?.[1] || "" };
}

export function separarDestinatarios(destinatarios, respaldo = "") {
  const texto = `${destinatarios || ""} ${respaldo || ""}`;
  const encontrados = texto.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+/g) || [];
  const unicos = new Map(encontrados.map((correo) => [correo.toLowerCase(), correo]));
  return [...unicos.values()];
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
  const tieneClasificacion = Boolean(correo.esContable || correo.esEstudios || correo.esEntretenimiento);
  switch (categoria) {
    case "IMPORTANTES": return correo.esImportante;
    case "NO_IMPORTANTES": return !correo.esImportante && tieneClasificacion;
    case "CONTABLES": return correo.esContable;
    case "ESTUDIOS": return correo.esEstudios;
    case "ENTRETENIMIENTO": return correo.esEntretenimiento;
    case "OTROS": return !correo.esImportante && !tieneClasificacion;
    default: return true;
  }
}

const PATRON_INGRESO = /nomina|salario|abono|consignacion|deposito|transferencia recibida|ingreso|reembolso|devolucion|income|payroll|refund|credited/;
const PATRON_GASTO = /compra|compras|factura|recibo|pago|cobro|debito|retiro|retiraste|consumo|suscrip|subscription|invoice|receipt|payment|purchase|category.?purchases|cargo/;

/** Deriva el tipo de movimiento (INGRESO/GASTO) de un correo contable, igual que la clasificación usada al sugerir movimientos. */
export function tipoMovimientoCorreo(correo) {
  const clasificacion = clasificarMovimientoCorreo(correo);
  if (clasificacion?.tipo) return clasificacion.tipo;
  const texto = `${correo.asunto || ""} ${correo.remitente || ""} ${correo.fragmento || ""} ${(correo.nombresEtiquetas || []).join(" ")}`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-CO");
  if (PATRON_INGRESO.test(texto)) return "INGRESO";
  return "GASTO";
}

/** Aplica el filtro de tipo de movimiento: solo restringe a los correos contables; TODOS deja pasar todo. */
export function coincideTipoMovimiento(correo, tipo) {
  if (!tipo || tipo === "TODOS") return true;
  if (!correo.esContable) return false;
  return tipoMovimientoCorreo(correo) === tipo;
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
