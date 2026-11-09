import { listarMovimientos } from "../../contabilidad/services/movimientosService";
import { obtenerContactosPorUsuario } from "../../contactos/services/contactosService";
import { listarCuentasGmail, listarSuscripcionesGmail, obtenerCorreosGmail } from "../../../services/gmailServicio";

const extraerLista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.datos || respuesta?.data || respuesta?.content || [];
};

function fechaValida(valor) {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function valorNumerico(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function construirSeriePorCategorias(categorias) {
  const principales = categorias
    .filter((item) => item.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
  const maximo = Math.max(...principales.map((item) => item.valor), 0);
  return principales.map((item) => ({
    ...item,
    altura: maximo ? Math.max(8, Math.round((item.valor / maximo) * 100)) : 0,
  }));
}

function construirDatosTemporales(registros, obtenerValor) {
  const ahora = new Date();
  const primerMes = new Date(ahora.getFullYear(), ahora.getMonth() - 4, 1);
  const meses = Array.from({ length: 5 }, (_, indice) =>
    new Date(primerMes.getFullYear(), primerMes.getMonth() + indice, 1)
  );
  const valoresPorMes = new Map(meses.map((mes) => [`${mes.getFullYear()}-${mes.getMonth()}`, 0]));
  const valoresHeatmap = new Map();
  const lunesEstaSemana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - ((ahora.getDay() + 6) % 7));
  const inicioHeatmap = new Date(lunesEstaSemana.getFullYear(), lunesEstaSemana.getMonth(), lunesEstaSemana.getDate() - 28);
  const fechaClave = (fecha) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
  let total = 0;
  let cantidadConFecha = 0;

  registros.forEach((registro) => {
    const valor = obtenerValor(registro);
    total += valor;
    const fecha = fechaValida(registro.fecha);
    if (!fecha) return;
    cantidadConFecha++;
    const claveMes = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    if (valoresPorMes.has(claveMes)) valoresPorMes.set(claveMes, valoresPorMes.get(claveMes) + valor);

    const fechaDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const diferenciaDias = Math.floor((fechaDia.getTime() - inicioHeatmap.getTime()) / 86400000);
    if (diferenciaDias < 0 || diferenciaDias >= 35) return;
    const claveDia = fechaClave(fechaDia);
    valoresHeatmap.set(claveDia, (valoresHeatmap.get(claveDia) || 0) + valor);
  });

  const serie = meses.map((mes) => ({
    etiqueta: mes.toLocaleDateString("es-CO", { month: "short" }).replace(".", ""),
    valor: valoresPorMes.get(`${mes.getFullYear()}-${mes.getMonth()}`),
  }));
  const maximo = Math.max(...serie.map((item) => item.valor), 0);
  const normalizada = serie.map((item) => ({
    ...item,
    altura: maximo ? Math.max(8, Math.round((item.valor / maximo) * 100)) : 0,
  }));
  const anteriores = serie.at(-2)?.valor || 0;
  const actuales = serie.at(-1)?.valor || 0;
  const variacion = anteriores > 0
    ? `${actuales >= anteriores ? "+" : ""}${(((actuales - anteriores) / anteriores) * 100).toFixed(1)} %`
    : null;
  const dias = Array.from({ length: 35 }, (_, indice) => {
    const dia = new Date(inicioHeatmap.getFullYear(), inicioHeatmap.getMonth(), inicioHeatmap.getDate() + indice);
    return { fecha: fechaClave(dia), valor: valoresHeatmap.get(fechaClave(dia)) || 0 };
  });
  const maximoHeatmap = Math.max(...dias.map((dia) => dia.valor), 0);
  const diasHeatmap = cantidadConFecha > 0
    ? Array.from({ length: 5 }, (_, fila) => dias.slice(fila * 7, fila * 7 + 7).map((dia) => ({
      ...dia,
      intensidad: maximoHeatmap ? Math.min(4, Math.ceil((dia.valor / maximoHeatmap) * 4)) : 0,
    })))
    : undefined;
  const intensidades = diasHeatmap?.map((fila) => fila.map((dia) => dia.intensidad));

  return { valor: registros.length ? total : null, serie: normalizada, variacion, intensidades, diasHeatmap };
}

function datosContabilidad(movimientos, segmento) {
  const tipoPorSegmento = {
    ingresos: "INGRESO",
    gastos: "GASTO",
    otros: "AHORRO",
  };
  const tipo = tipoPorSegmento[segmento];
  const filtrados = movimientos.filter((movimiento) =>
    !tipo || String(movimiento.tipo || "").toUpperCase() === tipo
  );
  return {
    ...construirDatosTemporales(filtrados, (movimiento) => valorNumerico(movimiento.monto)),
    detalles: [
      { etiqueta: "Movimientos incluidos", valor: String(filtrados.length) },
      { etiqueta: "Tipo de movimiento", valor: segmento === "todos" ? "Todos" : tipo },
    ],
    unidad: "moneda",
  };
}

function datosSuscripciones(respuesta) {
  const lista = extraerLista(respuesta?.suscripciones || respuesta);
  const serie = construirSeriePorCategorias(lista.map((suscripcion) => ({
    etiqueta: suscripcion.nombre || suscripcion.correoRemitente || "Suscripción",
    valor: valorNumerico(suscripcion.correosRecientes),
  })));
  const actividad = construirDatosTemporales(lista
    .filter((suscripcion) => suscripcion.ultimaActividad)
    .map((suscripcion) => ({ fecha: suscripcion.ultimaActividad, valor: 1 })), (suscripcion) => suscripcion.valor);
  const conActividad = lista.filter((suscripcion) => valorNumerico(suscripcion.correosRecientes) > 0);
  return {
    valor: lista.length || null,
    serie,
    detalles: [
      { etiqueta: "Con actividad reciente", valor: String(conActividad.length) },
      ...conActividad.slice(0, 1).map((suscripcion) => ({
        etiqueta: "Más reciente",
        valor: suscripcion.nombre || suscripcion.correoRemitente || "Remitente",
      })),
    ],
    intensidades: actividad.intensidades,
    diasHeatmap: actividad.diasHeatmap,
    unidad: "cantidad",
  };
}

function datosContactos(contactos) {
  const grupos = new Map();
  contactos.forEach((contacto) => {
    const etiqueta = contacto.empresa || contacto.origen || contacto.cargo || "Contactos";
    grupos.set(etiqueta, (grupos.get(etiqueta) || 0) + 1);
  });
  const serie = construirSeriePorCategorias([...grupos].map(([etiqueta, valor]) => ({ etiqueta, valor })));
  return {
    valor: contactos.length || null,
    serie,
    detalles: [
      { etiqueta: "Grupos identificados", valor: String(grupos.size) },
      ...serie.slice(0, 1).map((grupo) => ({
        etiqueta: "Grupo principal",
        valor: `${grupo.etiqueta} (${grupo.valor})`,
      })),
    ],
    unidad: "cantidad",
  };
}

async function datosCorreo(cuentaSeleccionada = "todas") {
  const cuentas = extraerLista(await listarCuentasGmail());
  const cuentasFiltradas = cuentaSeleccionada === "todas"
    ? cuentas
    : cuentas.filter((cuenta) => String(cuenta.id) === String(cuentaSeleccionada));
  if (cuentaSeleccionada !== "todas" && cuentasFiltradas.length === 0) {
    throw new Error("La cuenta de correo seleccionada ya no está disponible.");
  }
  const resultados = await Promise.all(cuentasFiltradas.map(async (cuenta) => ({
    cuenta,
    mensajes: extraerLista(await obtenerCorreosGmail(cuenta.id, [])),
  })));
  const totalMensajes = resultados.reduce((total, resultado) => total + resultado.mensajes.length, 0);
  const serie = resultados.map(({ cuenta, mensajes }) => ({
    etiqueta: cuenta.email || "Cuenta de correo",
    valor: mensajes.length,
  }));
  const mensajes = resultados.flatMap((resultado) => resultado.mensajes);
  const temporal = mensajes.length
    ? construirDatosTemporales(mensajes, () => 1)
    : { serie: [], intensidades: undefined, diasHeatmap: undefined };
  const ultimoMensaje = mensajes
    .map((mensaje) => fechaValida(mensaje.fecha || mensaje.fechaInterna || mensaje.fecha_interna))
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  return {
    valor: totalMensajes || null,
    serie: construirSeriePorCategorias(serie),
    intensidades: temporal.intensidades,
    diasHeatmap: temporal.diasHeatmap,
    cuentaCorreoEtiqueta: cuentaSeleccionada === "todas"
      ? "Todas las cuentas"
      : (cuentasFiltradas[0]?.email || "Cuenta de correo"),
    detalles: [
      { etiqueta: "Cuentas incluidas", valor: String(cuentasFiltradas.length) },
      ...(ultimoMensaje ? [{
        etiqueta: "Mensaje más reciente",
        valor: ultimoMensaje.toLocaleDateString("es-CO"),
      }] : []),
    ],
    unidad: "cantidad",
  };
}

export async function obtenerDatosMuestra(fuente, idUsuario, segmento = "todos", cuentaCorreo = "todas") {
  switch (fuente) {
    case "suscripciones":
      return datosSuscripciones(await listarSuscripcionesGmail());
    case "contabilidad":
      return datosContabilidad(extraerLista(await listarMovimientos(null)), segmento);
    case "correo":
      return datosCorreo(cuentaCorreo);
    case "contactos":
      return datosContactos(extraerLista(await obtenerContactosPorUsuario(idUsuario)));
    default:
      throw new Error(`No se reconoce la fuente «${fuente}» para esta muestra.`);
  }
}
