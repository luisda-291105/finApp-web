/**
 * @uso        Gestionar una suscripción detectada en una cuenta Gmail
 * @funciones  DetalleSuscripcionModal({ suscripcion, triggerRef, alCerrar })
 * @datos      Muestra el remitente, cuenta de origen y opciones de baja
 * @eventos    Solicita la baja solo después de confirmación explícita
 * @estados    Confirmación y resultado de la solicitud de baja
 * @usadoPor   SuscripcionesPage
 */
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, LoaderCircle, Mail, PlusCircle, Tag } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import {
  obtenerContenidoCorreoGmail,
  obtenerMensajesSuscripcionGmail,
  iniciarImportacionLoteGmail,
  obtenerEstadoImportacionLoteGmail,
  REMITENTE_MOVIMIENTOS_BANCOLOMBIA,
} from "../../../../services/gmailServicio";
import { clasificarMovimientoCorreo, extraerMovimientoSugerido } from "../../../correos/utils/correoFinancieroHelpers";
import { crearMovimiento, listarCorreosImportados } from "../../../contabilidad/services/movimientosService";
import { listarBolsillos } from "../../../contabilidad/services/bolsillosService";
import ModalCrearMovimientoContable from "../../../contabilidad/components/modals/ModalCrearMovimientoContable";

function textoActividad(cantidad) {
  if (cantidad == null) return "Actividad reciente no disponible";
  if (cantidad > 20) return "Recientemente, más de 20 correos electrónicos";
  if (cantidad >= 10) return "Recientemente, entre 10 y 20 correos electrónicos";
  return "Recientemente, 10 correos electrónicos o menos";
}

function bolsilloActivo(bolsillo) {
  return bolsillo?.estado !== false && bolsillo?.estado !== 0 && String(bolsillo?.estado).toLowerCase() !== "false";
}

function tipoBolsillo(bolsillo) {
  return String(bolsillo?.tipo || "").trim().toUpperCase();
}

/** Detalle centrado en el remitente, como la lista de Suscripciones de Gmail. */
export default function DetalleSuscripcionModal({ suscripcion, triggerRef, alCerrar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultadoBaja, setResultadoBaja] = useState("");
  const [errorBaja, setErrorBaja] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [errorMensajes, setErrorMensajes] = useState("");
  const [mensajesImportados, setMensajesImportados] = useState({});
  const [mensajeImportando, setMensajeImportando] = useState("");
  const [errorImportacion, setErrorImportacion] = useState("");
  const [avisoImportacion, setAvisoImportacion] = useState("");
  const [importandoTodos, setImportandoTodos] = useState(false);
  const [progresoLote, setProgresoLote] = useState(null);
  const [modalContabilidadAbierto, setModalContabilidadAbierto] = useState(false);
  const [bolsillos, setBolsillos] = useState([]);
  const [valoresMovimiento, setValoresMovimiento] = useState(null);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const triggerContabilidadRef = useRef(null);

  useEffect(() => {
    setConfirmando(false);
    setEnviando(false);
    setResultadoBaja("");
    setErrorBaja("");
    setMensajesImportados({});
    setMensajeImportando("");
    setErrorImportacion("");
    setAvisoImportacion("");
    setProgresoLote(null);
    setModalContabilidadAbierto(false);
    setMovimientoSeleccionado(null);
    setValoresMovimiento(null);
  }, [suscripcion?.id, suscripcion?.cuentaGmailId]);

  useEffect(() => {
    if (!suscripcion?.cuentaGmailId || !suscripcion?.correoRemitente) {
      setMensajes([]);
      return undefined;
    }
    let vigente = true;
    setCargandoMensajes(true);
    setErrorMensajes("");
    obtenerMensajesSuscripcionGmail(suscripcion.cuentaGmailId, suscripcion.correoRemitente)
      .then((resultado) => { if (vigente) setMensajes(resultado); })
      .catch((fallo) => { if (vigente) setErrorMensajes(fallo?.message || "No se pudieron cargar los mensajes de esta suscripción."); })
      .finally(() => { if (vigente) setCargandoMensajes(false); });
    return () => { vigente = false; };
  }, [suscripcion?.id, suscripcion?.cuentaGmailId, suscripcion?.correoRemitente]);

  useEffect(() => {
    if (!mensajes.length || bolsillos.length) return;
    let vigente = true;
    listarBolsillos().then((respuesta) => {
      if (vigente) setBolsillos(Array.isArray(respuesta) ? respuesta : respuesta?.datos || respuesta?.data || []);
    }).catch((fallo) => {
      if (vigente) setErrorImportacion(fallo?.message || "No se pudieron cargar los bolsillos.");
    });
    return () => { vigente = false; };
  }, [mensajes, bolsillos.length]);

  if (!suscripcion) return null;
  const correo = encodeURIComponent(suscripcion.cuentaGmail || "");
  const urlAdministrar = `https://mail.google.com/mail/u/?authuser=${correo}#sub`;
  const etiquetas = (suscripcion.categorias || []).map((categoria) => categoria === "CATEGORY_PROMOTIONS" ? "Promociones" : "Actualizaciones");
  const tieneOpcionBaja = Boolean(suscripcion.urlBaja || suscripcion.mailtoBaja);
  const mensajesPorRevisar = mensajes.filter((mensaje) => !mensajesImportados[mensaje.id]);

  const agregarTodos = async () => {
    if (importandoTodos || !mensajesPorRevisar.length
      || suscripcion.correoRemitente?.trim().toLowerCase() !== REMITENTE_MOVIMIENTOS_BANCOLOMBIA) return;
    setImportandoTodos(true);
    setErrorImportacion("");
    setAvisoImportacion("");
    try {
      const inicio = await iniciarImportacionLoteGmail(suscripcion.cuentaGmailId);
      let estado = null;
      do {
        estado = await obtenerEstadoImportacionLoteGmail(suscripcion.cuentaGmailId, inicio.loteId);
        setProgresoLote(estado);
        if (!estado.terminado) await new Promise((resolver) => window.setTimeout(resolver, 1000));
      } while (!estado.terminado);

      const procesados = (estado.mensajes || []).filter(({ estado: resultado }) => resultado !== "ERROR");
      if (procesados.length) {
        setMensajesImportados((actuales) => ({
          ...actuales,
          ...Object.fromEntries(procesados.map(({ mensajeId }) => [mensajeId, true])),
        }));
      }
      setAvisoImportacion(`Lote terminado: ${estado.importados} importados, ${estado.porRevisar} por revisar, ${estado.duplicados} duplicados y ${estado.errores} errores.`);
      const errores = (estado.mensajes || []).filter(({ estado: resultado }) => resultado === "ERROR");
      if (errores.length) {
        setErrorImportacion(`Errores: ${errores.slice(0, 3).map(({ asunto, motivo }) => `${asunto || "Mensaje"}: ${motivo}`).join(" · ")}${errores.length > 3 ? " · …" : ""}`);
      }
    } catch (fallo) {
      setErrorImportacion(fallo?.message || "No se pudo iniciar o consultar la importación por lote.");
    } finally {
      setImportandoTodos(false);
    }
  };

  const solicitarBaja = async () => {
    if (!suscripcion.urlBaja || !suscripcion.bajaConUnClic) return;
    setEnviando(true);
    setErrorBaja("");
    try {
      // Gmail exige una petición POST One-Click para este tipo de baja.
      // no-cors impide leer la respuesta: solo confirmamos que el navegador la envió.
      await fetch(suscripcion.urlBaja, {
        method: "POST",
        mode: "no-cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "List-Unsubscribe=One-Click",
      });
      setResultadoBaja("Solicitud enviada. El remitente puede tardar unos días en dejar de enviar mensajes; no es posible confirmar desde FinApp si ya la procesó.");
      setConfirmando(false);
    } catch {
      setErrorBaja("No se pudo enviar la solicitud. Puedes administrar esta baja directamente desde Gmail.");
    } finally {
      setEnviando(false);
    }
  };

  const prepararMovimiento = async (mensaje, evento) => {
    triggerContabilidadRef.current = evento.currentTarget;
    const idOrigen = `${suscripcion.cuentaGmailId}:${mensaje.id}`.slice(0, 180);
    setMensajeImportando(mensaje.id);
    setErrorImportacion("");
    setAvisoImportacion("");
    try {
      const yaImportados = await listarCorreosImportados([idOrigen]);
      const idsImportados = Array.isArray(yaImportados) ? yaImportados : yaImportados?.data || [];
      if (idsImportados.includes(idOrigen)) {
        setMensajesImportados((actuales) => ({ ...actuales, [mensaje.id]: true }));
        setAvisoImportacion("Este correo ya está registrado en Contabilidad.");
        return;
      }

      const [contenido, respuestaBolsillos] = await Promise.all([
        obtenerContenidoCorreoGmail(suscripcion.cuentaGmailId, mensaje.id),
        listarBolsillos(),
      ]);
      const disponibles = Array.isArray(respuestaBolsillos)
        ? respuestaBolsillos
        : respuestaBolsillos?.datos || respuestaBolsillos?.data || [];
      const sugerencia = extraerMovimientoSugerido({
        ...mensaje,
        contenido,
        cuentaGmailId: suscripcion.cuentaGmailId,
      });
      const tipoSugerido = sugerencia?.tipo;
      const bolsillosCompatibles = tipoSugerido
        ? disponibles.filter((bolsillo) => bolsilloActivo(bolsillo) && tipoBolsillo(bolsillo) === tipoSugerido)
        : [];
      const instante = new Date(mensaje.fecha);
      const fecha = sugerencia?.fecha || (Number.isNaN(instante.getTime())
        ? new Date().toISOString().slice(0, 10)
        : instante.toISOString().slice(0, 10));

      setBolsillos(disponibles);
      setValoresMovimiento({
        tipo: tipoSugerido || "",
        idBolsillo: bolsillosCompatibles.length === 1 ? bolsillosCompatibles[0].idBolsillo : "",
        fecha,
        monto: sugerencia?.monto == null ? "" : String(sugerencia.monto),
        categoria: sugerencia?.categoria || "Suscripciones",
        concepto: sugerencia?.concepto || mensaje.asunto || "Correo de suscripción",
        origenTipo: "GMAIL",
        origenId: idOrigen,
        origenNombre: mensaje.remitente || suscripcion.correoRemitente,
      });
      setMovimientoSeleccionado(mensaje);
      setModalContabilidadAbierto(true);
    } catch (fallo) {
      setErrorImportacion(fallo?.message || "No se pudo preparar el movimiento para Contabilidad.");
    } finally {
      setMensajeImportando("");
    }
  };

  const guardarMovimiento = async (movimiento) => {
    if (!movimientoSeleccionado) return;
    await crearMovimiento({
      ...movimiento,
      origenTipo: "GMAIL",
      origenId: `${suscripcion.cuentaGmailId}:${movimientoSeleccionado.id}`.slice(0, 180),
      origenNombre: movimientoSeleccionado.remitente || suscripcion.correoRemitente,
    });
    setMensajesImportados((actuales) => ({ ...actuales, [movimientoSeleccionado.id]: true }));
    setAvisoImportacion("Movimiento agregado a Contabilidad.");
    setModalContabilidadAbierto(false);
    setMovimientoSeleccionado(null);
  };

  return <>
    <ModalDetalleRegistro abierto={Boolean(suscripcion) && !modalContabilidadAbierto} titulo={`Suscripción: ${suscripcion.nombre || "Remitente"}`} alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-lg">
    <div className="space-y-4">
      <div className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-4">
        <dl className="space-y-4">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Remitente</dt><dd className="mt-1 break-all text-sm font-medium text-bg-dark">{suscripcion.nombre || "Remitente desconocido"}</dd><dd className="mt-1 break-all text-sm text-slate-text">{suscripcion.correoRemitente || "Dirección no disponible"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Cuenta Gmail</dt><dd className="mt-1 break-all text-sm text-bg-dark">{suscripcion.cuentaGmail}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Actividad reciente</dt><dd className="mt-1 text-sm text-bg-dark">{textoActividad(suscripcion.correosRecientes)}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Categorías detectadas</dt><dd className="mt-2 flex flex-wrap gap-2">{etiquetas.length ? etiquetas.map((etiqueta) => <span key={etiqueta} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-medium text-emerald-primary"><Tag className="h-3 w-3" aria-hidden="true" />{etiqueta}</span>) : <span className="text-sm text-slate-text">Sin categoría disponible</span>}</dd></div>
        </dl>
      </div>

      <section aria-labelledby="mensajes-suscripcion-titulo" className="space-y-3 rounded-2xl border border-border-line/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="mensajes-suscripcion-titulo" className="font-semibold text-bg-dark">Mensajes de este remitente</h3>
          {!cargandoMensajes && !errorMensajes && <span className="rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary">{mensajes.length}</span>}
        </div>
        {!cargandoMensajes && !errorMensajes && mensajes.length > 0
          && suscripcion.correoRemitente?.trim().toLowerCase() === REMITENTE_MOVIMIENTOS_BANCOLOMBIA
          && <div className="space-y-3 rounded-xl border border-emerald-primary/20 bg-emerald-primary/5 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-bg-dark">Agregar mensajes reconocidos</p><p className="text-xs text-slate-text">Se procesarán en segundo plano los mensajes del remitente oficial; puedes consultar el avance y los resultados por mensaje.</p></div><button type="button" disabled={importandoTodos || !mensajesPorRevisar.length} onClick={agregarTodos} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-primary px-3 text-xs font-semibold text-white hover:bg-emerald-hover disabled:cursor-not-allowed disabled:opacity-60">{importandoTodos ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlusCircle className="h-4 w-4" aria-hidden="true" />}{importandoTodos ? "Importando…" : "Agregar todos"}</button></div>
          <p className="text-xs text-slate-text">El backend aplica las reglas persistidas y, si no coinciden, el clasificador. Los movimientos ambiguos quedan en «Por revisar». Pagos de nómina recibidos y transferencias recibidas se clasifican como ingresos.</p>
          {progresoLote && <p role="status" className="text-xs text-slate-text">Progreso: {progresoLote.completados}/{progresoLote.total} · {progresoLote.importados} importados · {progresoLote.porRevisar} por revisar · {progresoLote.duplicados} duplicados · {progresoLote.errores} errores</p>}
        </div>}
        {cargandoMensajes && <p role="status" className="text-sm text-slate-text">Cargando mensajes recientes…</p>}
        {(errorMensajes || errorImportacion) && <p role="alert" className="rounded-xl border border-red-300/40 bg-red-50 p-3 text-sm text-red-700">{errorMensajes || errorImportacion}</p>}
        {avisoImportacion && <p role="status" className="rounded-xl border border-emerald-300/40 bg-emerald-50 p-3 text-sm text-emerald-800">{avisoImportacion}</p>}
        {!cargandoMensajes && !errorMensajes && mensajes.length === 0 && <p className="text-sm text-slate-text">No hay mensajes recientes de este remitente en la cuenta seleccionada.</p>}
        {!cargandoMensajes && mensajes.length > 0 && <ul aria-label={`Mensajes de ${suscripcion.correoRemitente}`} className="max-h-80 space-y-2 overflow-y-auto">
          {mensajes.map((mensaje) => <li key={mensaje.id} className="rounded-xl border border-border-line/50 bg-bg-cream/70 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2"><span className="min-w-0 flex-1 break-words text-sm font-semibold text-bg-dark">{mensaje.asunto || "(Sin asunto)"}</span><time className="shrink-0 text-xs text-slate-text">{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(mensaje.fecha))}</time></div>
            {clasificarMovimientoCorreo(mensaje) && <p className="mt-1 text-xs font-medium text-emerald-primary">{clasificarMovimientoCorreo(mensaje).categoria} · {({ GASTO: "Gasto", INGRESO: "Ingreso" })[clasificarMovimientoCorreo(mensaje).tipo]}</p>}
            <p className="mt-1 line-clamp-2 break-words text-sm text-slate-text">{mensaje.fragmento || "Sin vista previa"}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <a href={`https://mail.google.com/mail/u/?authuser=${correo}#all/${encodeURIComponent(mensaje.id)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-emerald-primary underline-offset-2 hover:underline"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />Abrir en Gmail</a>
              <button type="button" disabled={Boolean(mensajesImportados[mensaje.id]) || mensajeImportando === mensaje.id} onClick={(evento) => prepararMovimiento(mensaje, evento)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-primary px-3 text-xs font-semibold text-white hover:bg-emerald-hover disabled:cursor-not-allowed disabled:opacity-60">
                {mensajeImportando === mensaje.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                {mensajesImportados[mensaje.id] ? "Agregado a Contabilidad" : mensajeImportando === mensaje.id ? "Preparando…" : "Agregar a Contabilidad"}
              </button>
            </div>
          </li>)}
        </ul>}
        <p className="text-xs text-slate-text">Se muestran los mensajes de este remitente guardados en FinApp durante los últimos 90 días.</p>
      </section>

      <section aria-labelledby="opciones-baja-titulo" className="space-y-3 rounded-2xl border border-border-line/50 p-4">
        <h3 id="opciones-baja-titulo" className="font-semibold text-bg-dark">Anular suscripción</h3>
        {!tieneOpcionBaja && <p className="text-sm text-slate-text">Este remitente no incluyó un enlace de baja detectable. Puedes gestionarlo en Gmail.</p>}
        {suscripcion.bajaConUnClic && suscripcion.urlBaja && !resultadoBaja && <>
          <p className="text-sm text-slate-text">El remitente admite la baja con un clic. FinApp enviará la solicitud solo cuando la confirmes.</p>
          {confirmando ? <div className="space-y-3 rounded-xl bg-red-50 p-3 text-sm text-red-800"><p>¿Quieres enviar la solicitud para anular esta suscripción?</p><div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setConfirmando(false)} disabled={enviando} className="min-h-10 rounded-lg border border-border-line px-3 font-medium text-bg-dark">Cancelar</button><button type="button" onClick={solicitarBaja} disabled={enviando} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-red-700 px-3 font-semibold text-white disabled:opacity-60">{enviando && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{enviando ? "Enviando…" : "Confirmar anulación"}</button></div></div> : <button type="button" onClick={() => setConfirmando(true)} className="min-h-10 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800">Anular suscripción</button>}
        </>}
        {!suscripcion.bajaConUnClic && suscripcion.urlBaja && <a href={suscripcion.urlBaja} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-bg-dark hover:border-emerald-primary"><ExternalLink className="h-4 w-4" aria-hidden="true" />Abrir página para anular</a>}
        {suscripcion.mailtoBaja && <a href={suscripcion.mailtoBaja} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-bg-dark hover:border-emerald-primary"><Mail className="h-4 w-4" aria-hidden="true" />Preparar correo de baja</a>}
        {resultadoBaja && <p role="status" className="flex gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{resultadoBaja}</p>}
        {errorBaja && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{errorBaja}</p>}
      </section>

      <p className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-3 text-xs leading-relaxed text-slate-text">FinApp detecta remitentes suscritos en Gmail y muestra aquí sus mensajes de los últimos 90 días. Desde cada mensaje puedes abrir el original en Gmail.</p>
      <div className="flex justify-end border-t border-border-line/40 pt-4"><a href={urlAdministrar} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white"><ExternalLink className="h-4 w-4" aria-hidden="true" />Administrar en Gmail</a></div>
    </div>
    </ModalDetalleRegistro>
    <ModalCrearMovimientoContable abierto={modalContabilidadAbierto} valoresPredeterminados={valoresMovimiento} bolsillos={valoresMovimiento?.tipo ? bolsillos.filter((bolsillo) => String(bolsillo.tipo).toUpperCase() === valoresMovimiento.tipo) : bolsillos} triggerRef={triggerContabilidadRef} alCerrar={() => { setModalContabilidadAbierto(false); setMovimientoSeleccionado(null); }} alGuardar={guardarMovimiento} />
  </>;
}
