/**
 * @uso        Identifica movimientos sugeridos a partir de correos Gmail
 * @funciones  extraerMovimientoSugerido(correo)
 * @datos      Recibe metadatos y texto temporal del mensaje; nunca persiste el cuerpo
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   ImportarCorreosFinancieros
 */

/** Evita pedir el cuerpo de mensajes sin señales de una transacción o etiqueta financiera. */
export function esCandidatoFinanciero(correo) {
  const texto = `${correo.asunto || ""} ${correo.remitente || ""} ${correo.fragmento || ""} ${(correo.nombresEtiquetas || []).join(" ")}`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-CO");
  return /compra|compras|factura|recibo|pago|cobro|debito|consumo|suscrip|subscription|invoice|receipt|payment|purchase|category.?purchases|nomina|salario|abono|consignacion|deposito|transferencia recibida|reembolso|devolucion|payroll|refund|credited/.test(texto);
}

/** Convierte un correo con monto y tipo reconocibles en una sugerencia para revisión. */
export function extraerMovimientoSugerido(correo) {
  const texto = `${correo.asunto || ""} ${correo.remitente || ""} ${correo.fragmento || ""} ${correo.contenido || ""}`;
  const normalizado = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-CO");
  const clasificacionSolicitada = clasificarMovimientoCorreo(correo);
  const etiquetas = (correo.nombresEtiquetas || []).join(" ").toLocaleLowerCase("es-CO");
  const gasto = /compra|compras|factura|recibo|pago|cobro|debito|retiro|retiraste|consumo|suscrip|subscription|invoice|receipt|payment|purchase|category.?purchases|cargo/.test(`${normalizado} ${etiquetas}`);
  const ingreso = /nomina|salario|abono|consignacion|deposito|transferencia recibida|ingreso|reembolso|devolucion|income|payroll|refund|credited/.test(normalizado);
  if (!clasificacionSolicitada && gasto === ingreso) return null;

  const lineas = texto.split(/[\r\n]+/);
  const patronesMonto = [
    /(?:total|valor|monto|pagaste|recibiste|transferiste|compraste|retiraste|amount)\D{0,30}(?:COP\s*)?\$?\s*([\d.,]+)/i,
    /(?:COP|\$)\s*([\d.,]+)/i,
  ];
  let monto = null;
  for (const patron of patronesMonto) {
    const coincidencia = lineas.map((linea) => linea.match(patron)).find(Boolean);
    if (coincidencia) {
      let numero = coincidencia[1].replace(/[.,]+$/, "");
      const ultimaComa = numero.lastIndexOf(",");
      const ultimoPunto = numero.lastIndexOf(".");
      if (ultimaComa >= 0 && ultimoPunto >= 0) {
        numero = ultimaComa > ultimoPunto ? numero.replace(/\./g, "").replace(",", ".") : numero.replace(/,/g, "");
      } else if (ultimaComa >= 0) {
        numero = numero.slice(ultimaComa + 1).length <= 2 ? numero.replace(/,/g, ".") : numero.replace(/,/g, "");
      } else if (ultimoPunto >= 0 && numero.slice(ultimoPunto + 1).length === 3) {
        numero = numero.replace(/\./g, "");
      }
      monto = Number(numero);
      if (Number.isFinite(monto) && monto > 0) break;
      monto = null;
    }
  }
  if (!monto) return null;

  const instante = new Date(correo.fecha);
  const fecha = Number.isNaN(instante.getTime()) ? new Date().toISOString().slice(0, 10) : instante.toISOString().slice(0, 10);
  const asunto = (correo.asunto || "Movimiento desde Gmail").replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    idCorreo: correo.id,
    origenId: `${correo.cuentaGmailId || "gmail"}:${correo.id}`.slice(0, 180),
    tipo: clasificacionSolicitada?.tipo || (ingreso ? "INGRESO" : "GASTO"),
    monto,
    fecha,
    categoria: clasificacionSolicitada?.categoria || (ingreso ? "Ingreso desde Gmail" : /suscrip|subscription|netflix|spotify|youtube|disney|prime video/.test(normalizado) ? "Suscripciones" : etiquetas.includes("compra") ? "Compras" : "Compras y pagos"),
    concepto: asunto,
    remitente: (correo.remitente || "Cuenta Gmail").slice(0, 120),
    etiquetas: correo.nombresEtiquetas || [],
  };
}

/** Reglas de clasificación solicitadas para los correos de movimientos. */
export function clasificarMovimientoCorreo(correo) {
  const normalizar = (valor) => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-CO");
  const campos = [correo.asunto, correo.fragmento, correo.contenido].map(normalizar);
  // El remitente ya está limitado por la suscripción seleccionada. Algunos
  // correos agregan una frase de notificación antes de la línea Bancolombia.
  if (!campos.some((campo) => /bancolombia\s*:/i.test(campo))) return null;
  const texto = `${campos.join(" ")} ${normalizar(correo.remitente)}`;
  if (/recibiste\s+un\s+pago\s+de\s+nomina/.test(texto)) return { categoria: "Nómina", tipo: "INGRESO" };
  if (/retiraste|retiro/.test(texto)) return { categoria: "Retiros", tipo: "GASTO" };
  if (/transferiste/.test(texto)) return { categoria: "Transferencia", tipo: "GASTO" };
  if (/compraste|pagaste/.test(texto)) return { categoria: "Compras", tipo: "GASTO" };
  if (/recibiste\s+(?:una\s+)?transferencia/.test(texto)) return { categoria: "Transferencia", tipo: "INGRESO" };
  return null;
}
