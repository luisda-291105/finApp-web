/**
 * @uso        Modal de detalle, fuentes y conversación del grupo
 * @funciones  GrupoDetalleModal({ grupo, abierto, alCerrar, triggerRef, alGrupoActualizado })
 * @datos      Gestiona datos del grupo mediante servicios de dominio
 * @eventos    Cambios de pestaña, vinculación, edición y cierre
 * @estados    Estado local del detalle
 * @usadoPor   GruposPage
 */
import { useEffect, useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import EditarGrupoForm from "../forms/EditarGrupoForm";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";
import { crearFuente, obtenerFuentesPorUsuario } from "../../../../services/fuenteServicio";
import { actualizarGrupo, eliminarGrupo, desvincularFuenteDeGrupo, vincularFuenteAGrupo } from "../../services/gruposService";
import { crearEnlaceTelegram, desvincularTelegram, enviarMensajeTelegram, obtenerEstadoTelegram, obtenerMensajesTelegram } from "../../../../services/telegramServicio";

const PESTANAS = ["Fuentes", "Chat grupal"];
function fechaLocalISO() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}
function generarId() {
  return globalThis.crypto?.randomUUID?.() || `fuente-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function listaRespuesta(respuesta) {
  const datos = respuesta?.datos ?? respuesta?.data ?? respuesta?.content;
  return Array.isArray(respuesta) ? respuesta : Array.isArray(datos) ? datos : [];
}

function datosRespuesta(respuesta) { return respuesta?.datos ?? respuesta?.data ?? respuesta ?? {}; }

/** Presenta los detalles y permite gestionar fuentes vinculadas al grupo. */
export default function GrupoDetalleModal({ grupo, abierto, alCerrar, triggerRef, alGrupoActualizado }) {
  const { usuario } = useUsuarioActivo();
  const [fuentes, setFuentes] = useState([]);
  const [pestana, setPestana] = useState("Fuentes");
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState("");
  const [tipoNuevaFuente, setTipoNuevaFuente] = useState("CORREO");
  const [contenidoNuevaFuente, setContenidoNuevaFuente] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [estadoTelegram, setEstadoTelegram] = useState(null);
  const [enlaceTelegram, setEnlaceTelegram] = useState("");
  const [cargandoTelegram, setCargandoTelegram] = useState(false);
  const [enviandoTelegram, setEnviandoTelegram] = useState(false);
  const [borrador, setBorrador] = useState("");
  const [correoInvitacion, setCorreoInvitacion] = useState("");
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [nombreEditado, setNombreEditado] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");
  const [configuracionAbierta, setConfiguracionAbierta] = useState(false);
  const fuentesVinculadas = useMemo(() => grupo?.fuentes || [], [grupo?.fuentes]);
  const idsVinculados = useMemo(() => new Set(fuentesVinculadas.map((fuente) => fuente.idFuente)), [fuentesVinculadas]);
  const fuentesDisponibles = useMemo(() => fuentes.filter((fuente) => !idsVinculados.has(fuente.idFuente)), [fuentes, idsVinculados]);

  useEffect(() => {
    if (!abierto || !grupo?.id || !usuario?.idUsuario) return undefined;
    let vigente = true;
    setPestana("Fuentes");
    setConfiguracionAbierta(false);
    setEditando(false);
    setConfirmarBorrado(false);
    setNombreEditado(grupo.nombre || "");
    setDescripcionEditada(grupo.descripcion || "");
    setError("");
    setAviso("");
    obtenerFuentesPorUsuario(usuario.idUsuario).then((respuesta) => {
      if (vigente) setFuentes(listaRespuesta(respuesta));
    }).catch((fallo) => {
      if (vigente) setError(fallo?.message || "No se pudieron cargar tus fuentes.");
    });
    return () => { vigente = false; };
  }, [abierto, grupo?.id, usuario?.idUsuario]);

  useEffect(() => {
    if (!abierto || configuracionAbierta || pestana !== "Chat grupal" || !usuario?.idUsuario) return undefined;
    let vigente = true;
    let consultando = false;
    const consultar = async () => {
      if (consultando) return;
      consultando = true;
      try {
        const [estado, conversacion] = await Promise.all([obtenerEstadoTelegram(), obtenerMensajesTelegram()]);
        if (!vigente) return;
        setEstadoTelegram(datosRespuesta(estado));
        setMensajes(listaRespuesta(conversacion));
        setError("");
      } catch (fallo) {
        if (vigente) setError(fallo?.message || "No se pudo consultar el chat de Telegram.");
      } finally {
        consultando = false;
        if (vigente) setCargandoTelegram(false);
      }
    };
    setCargandoTelegram(true);
    consultar();
    const intervalo = window.setInterval(consultar, 3000);
    return () => { vigente = false; window.clearInterval(intervalo); };
  }, [abierto, configuracionAbierta, pestana, usuario?.idUsuario]);

  if (!abierto || !grupo) return null;
  const actualizarGrupoEnVista = (respuesta) => {
    const grupoActualizado = respuesta?.data || respuesta;
    if (grupoActualizado?.idGrupo || grupoActualizado?.id) alGrupoActualizado?.(grupoActualizado);
  };
  const guardarGrupo = async (evento) => {
    evento.preventDefault();
    const nombre = nombreEditado.trim();
    const descripcion = descripcionEditada.trim();
    if (!nombre || !descripcion || !usuario?.idUsuario) { setError("Nombre y descripción son obligatorios."); return; }
    setCargando(true); setError("");
    try {
      const respuesta = await actualizarGrupo(grupo.id, { nombre, descripcion }, usuario.idUsuario);
      actualizarGrupoEnVista(respuesta?.data || respuesta || { ...grupo, nombre, descripcion });
      setEditando(false); setAviso("Grupo actualizado.");
    } catch (fallo) { setError(fallo?.message || "No se pudo actualizar el grupo."); }
    finally { setCargando(false); }
  };
  const borrarGrupo = async () => {
    if (!usuario?.idUsuario || cargando) return;
    setCargando(true); setError("");
    try {
      await eliminarGrupo(grupo.id, usuario.idUsuario);
      alGrupoActualizado?.({ idGrupo: grupo.id, eliminado: true });
      alCerrar();
    } catch (fallo) { setError(fallo?.message || "No se pudo eliminar el grupo."); }
    finally { setCargando(false); }
  };
  const vincular = async (fuente) => {
    if (!usuario?.idUsuario || !fuente?.idFuente) return;
    setCargando(true); setError(""); setAviso("");
    try {
      const respuesta = await vincularFuenteAGrupo(grupo.id, fuente.idFuente, usuario.idUsuario);
      actualizarGrupoEnVista(respuesta);
      setFuenteSeleccionada(""); setAviso(`“${fuente.contenido}” quedó vinculada al grupo.`);
    } catch (fallo) { setError(fallo?.message || "No se pudo vincular la fuente."); }
    finally { setCargando(false); }
  };
  const desvincular = async (fuente) => {
    if (!usuario?.idUsuario || !fuente?.idFuente) return;
    setCargando(true); setError(""); setAviso("");
    try {
      const respuesta = await desvincularFuenteDeGrupo(grupo.id, fuente.idFuente, usuario.idUsuario);
      actualizarGrupoEnVista(respuesta);
      setAviso(`“${fuente.contenido}” se desvinculó del grupo.`);
    } catch (fallo) { setError(fallo?.message || "No se pudo desvincular la fuente."); }
    finally { setCargando(false); }
  };
  const registrarYVincular = async (evento) => {
    evento.preventDefault();
    if (!contenidoNuevaFuente.trim() || !usuario?.idUsuario) return;
    setCargando(true); setError(""); setAviso("");
    const fuente = { idFuente: generarId(), tipo: tipoNuevaFuente, contenido: contenidoNuevaFuente.trim(), fechaCreacion: fechaLocalISO(), usuario: { idUsuario: usuario.idUsuario } };
    try {
      const respuesta = await crearFuente(fuente);
      const fuenteGuardada = respuesta?.data || respuesta || fuente;
      await vincularFuenteAGrupo(grupo.id, fuenteGuardada.idFuente, usuario.idUsuario);
      setFuentes((actuales) => [...actuales, fuenteGuardada]);
      actualizarGrupoEnVista({ ...grupo, fuentes: [...fuentesVinculadas, fuenteGuardada] });
      setContenidoNuevaFuente(""); setAviso("La fuente quedó registrada y vinculada al grupo.");
    } catch (fallo) { setError(fallo?.message || "No se pudo registrar y vincular la fuente."); }
    finally { setCargando(false); }
  };
  const vincularTelegram = async () => {
    setCargandoTelegram(true); setError(""); setAviso("");
    try {
      const respuesta = await crearEnlaceTelegram();
      const datos = datosRespuesta(respuesta);
      if (!datos.enlace) throw new Error("No se recibió un enlace de Telegram válido.");
      setEnlaceTelegram(datos.enlace);
    } catch (fallo) { setError(fallo?.message || "No se pudo crear el enlace de Telegram."); }
    finally { setCargandoTelegram(false); }
  };
  const quitarVinculoTelegram = async () => {
    setCargandoTelegram(true); setError(""); setAviso("");
    try {
      await desvincularTelegram();
      setEstadoTelegram((estado) => ({ ...estado, conectado: false, usuarioTelegram: "" }));
      setEnlaceTelegram("");
      setAviso("La cuenta de Telegram se desvinculó.");
    } catch (fallo) { setError(fallo?.message || "No se pudo desvincular Telegram."); }
    finally { setCargandoTelegram(false); }
  };
  const enviarMensaje = async (evento) => {
    evento.preventDefault();
    const texto = borrador.trim();
    if (!texto || enviandoTelegram || !estadoTelegram?.conectado) return;
    setEnviandoTelegram(true); setError(""); setAviso("");
    try {
      await enviarMensajeTelegram(texto, grupo.nombre);
      setBorrador("");
      setAviso("Mensaje enviado al chat privado de Telegram.");
      const respuesta = await obtenerMensajesTelegram();
      setMensajes(listaRespuesta(respuesta));
    } catch (fallo) { setError(fallo?.message || "No se pudo enviar el mensaje por Telegram."); }
    finally { setEnviandoTelegram(false); }
  };
  const prepararInvitacion = (evento) => {
    evento.preventDefault();
    if (!correoInvitacion.trim()) return;
    setAviso(`Invitación preparada para ${correoInvitacion.trim()}. El envío estará disponible al conectar el servicio de grupos.`);
    setCorreoInvitacion("");
  };
  const cerrar = () => { if (!cargando) alCerrar(); };

  return (
    <ModalDetalleRegistro abierto={abierto} titulo={grupo.nombre} etiquetaCerrar={`Cerrar grupo ${grupo.nombre}`} alCerrar={cerrar} triggerRef={triggerRef}>
      <div className="mb-4 flex items-center justify-between gap-3"><p className="min-w-0 text-sm text-slate-text">{grupo.descripcion}</p><button type="button" aria-pressed={configuracionAbierta} onClick={() => { setConfiguracionAbierta((actual) => !actual); setError(""); setAviso(""); }} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${configuracionAbierta ? "border-emerald-primary bg-emerald-primary/10 text-emerald-primary" : "border-border-line/50 text-slate-text hover:bg-emerald-primary/5 hover:text-bg-dark"}`}><Settings2 className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Configuración</span></button></div>
      {!configuracionAbierta && <div className="flex flex-wrap gap-2 border-b border-border-line/40" role="tablist" aria-label={`Secciones de ${grupo.nombre}`}>{PESTANAS.map((nombre) => <button key={nombre} type="button" role="tab" aria-selected={pestana === nombre} onClick={() => { setPestana(nombre); setError(""); setAviso(""); }} className={`min-h-10 rounded-t-lg border-b-2 px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${pestana === nombre ? "border-emerald-primary text-emerald-primary" : "border-transparent text-slate-text hover:text-bg-dark"}`}>{nombre}</button>)}</div>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</p>}
      {aviso && <p role="status" className="mt-4 rounded-xl border border-emerald-primary/20 bg-emerald-primary/10 p-3 text-sm text-bg-dark">{aviso}</p>}
      {configuracionAbierta ? (
        <div className="mt-5 space-y-5">
          <section className="rounded-2xl border border-border-line/40 p-4"><h3 className="font-semibold">Datos del grupo</h3><p className="mt-1 text-sm text-slate-text">Actualiza el nombre y la descripción o elimina este grupo.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={cargando} onClick={() => { setEditando((actual) => !actual); setNombreEditado(grupo.nombre || ""); setDescripcionEditada(grupo.descripcion || ""); setConfirmarBorrado(false); }} className="min-h-10 rounded-xl border border-emerald-primary/40 px-4 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/5">{editando ? "Cancelar edición" : "Editar grupo"}</button><button type="button" disabled={cargando} onClick={() => { setConfirmarBorrado(true); setEditando(false); }} className="min-h-10 rounded-xl border border-red-700/30 px-4 text-sm font-medium text-red-700 hover:bg-red-50">Eliminar grupo</button></div>
            {editando && <EditarGrupoForm nombre={nombreEditado} descripcion={descripcionEditada} alCambiarNombre={setNombreEditado} alCambiarDescripcion={setDescripcionEditada} alGuardar={guardarGrupo} cargando={cargando} />}
            {confirmarBorrado && <div role="alertdialog" aria-label="Confirmar eliminación de grupo" className="mt-4 rounded-xl border border-red-700/30 bg-red-50 p-4"><p className="text-sm text-red-900">¿Eliminar el grupo {grupo.nombre}? Las fuentes vinculadas seguirán registradas en tu cuenta.</p><div className="mt-3 flex gap-2"><button type="button" disabled={cargando} onClick={borrarGrupo} className="min-h-10 rounded-lg bg-red-700 px-4 text-sm font-medium text-white">Confirmar eliminación</button><button type="button" onClick={() => setConfirmarBorrado(false)} className="min-h-10 rounded-lg px-3 text-sm">Cancelar</button></div></div>}
          </section>
          <section className="rounded-2xl border border-border-line/40 p-4"><h3 className="font-semibold">Invitaciones</h3><p className="mt-1 text-sm text-slate-text">El envío de invitaciones estará disponible al conectar el servicio de grupos.</p><form onSubmit={prepararInvitacion} className="mt-3 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="grupo-invitacion-correo">Correo de la persona</label><input id="grupo-invitacion-correo" type="email" required value={correoInvitacion} onChange={(evento) => setCorreoInvitacion(evento.target.value)} placeholder="persona@correo.com" className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" /><button type="submit" className="min-h-11 rounded-xl border border-emerald-primary/40 px-4 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10">Preparar invitación</button></form></section>
          <details className="rounded-2xl border border-border-line/40 p-4"><summary className="cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">Registrar una fuente nueva para este grupo</summary><form onSubmit={registrarYVincular} className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end"><div className="flex flex-col gap-1.5"><label htmlFor="grupo-nueva-fuente-tipo" className="text-sm font-medium">Tipo</label><select id="grupo-nueva-fuente-tipo" value={tipoNuevaFuente} onChange={(evento) => setTipoNuevaFuente(evento.target.value)} disabled={cargando} className="min-h-11 rounded-xl border border-border-line bg-bg-cream px-3 text-sm"><option value="CORREO">Correo electrónico</option><option value="TELEFONO">Teléfono</option><option value="OTRO">Otro</option></select></div><div className="flex flex-col gap-1.5"><label htmlFor="grupo-nueva-fuente-contenido" className="text-sm font-medium">Contenido</label><input id="grupo-nueva-fuente-contenido" value={contenidoNuevaFuente} onChange={(evento) => setContenidoNuevaFuente(evento.target.value)} maxLength={255} required disabled={cargando} className="min-h-11 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" /></div><button type="submit" disabled={cargando} className="min-h-11 rounded-xl border border-emerald-primary/40 px-4 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">{cargando ? "Guardando…" : "Registrar y vincular"}</button></form><p className="mt-2 text-xs text-slate-text">La fuente se registra a tu usuario y luego se asocia al grupo.</p></details>
        </div>
      ) : pestana === "Fuentes" ? (
        <div className="mt-5 space-y-6"><section aria-labelledby="fuentes-vinculadas-titulo"><h3 id="fuentes-vinculadas-titulo" className="font-semibold">Fuentes vinculadas</h3>{fuentesVinculadas.length ? <ul className="mt-3 space-y-2">{fuentesVinculadas.map((fuente) => <li key={fuente.idFuente} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-line/50 bg-bg-cream/70 p-3"><span className="min-w-0"><span className="block text-xs uppercase tracking-wide text-slate-text">{fuente.tipo}</span><span className="break-all text-sm font-medium">{fuente.contenido}</span></span><button type="button" disabled={cargando} onClick={() => desvincular(fuente)} className="min-h-9 rounded-lg px-3 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">Desvincular</button></li>)}</ul> : <p className="mt-2 text-sm text-slate-text">Este grupo aún no tiene fuentes vinculadas.</p>}</section>
          <section aria-labelledby="vincular-fuente-titulo" className="rounded-2xl border border-border-line/50 p-4"><h3 id="vincular-fuente-titulo" className="font-semibold">Vincular una fuente registrada</h3>{fuentesDisponibles.length ? <div className="mt-3 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="grupo-fuente-existente">Fuente registrada</label><select id="grupo-fuente-existente" value={fuenteSeleccionada} onChange={(evento) => setFuenteSeleccionada(evento.target.value)} disabled={cargando} className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><option value="">Selecciona una fuente</option>{fuentesDisponibles.map((fuente) => <option key={fuente.idFuente} value={fuente.idFuente}>{fuente.tipo}: {fuente.contenido}</option>)}</select><button type="button" disabled={!fuenteSeleccionada || cargando} onClick={() => vincular(fuentesDisponibles.find((fuente) => fuente.idFuente === fuenteSeleccionada))} className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">Vincular fuente</button></div> : <p className="mt-2 text-sm text-slate-text">No hay otras fuentes registradas para vincular.</p>}</section></div>
      ) : (
        <div className="mt-5 space-y-4">
          <section aria-label="Vínculo de Telegram" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-line/50 bg-bg-cream/50 p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Chat privado de Telegram</p>
              {estadoTelegram?.conectado
                ? <p className="text-xs text-slate-text">Conectado{estadoTelegram.usuarioTelegram ? ` como @${estadoTelegram.usuarioTelegram}` : ""} · @{estadoTelegram.nombreBot}</p>
                : <p className="text-xs text-slate-text">Vincula tu cuenta para enviar y recibir mensajes con el bot.</p>}
            </div>
            {estadoTelegram?.conectado
              ? <button type="button" disabled={cargandoTelegram} onClick={quitarVinculoTelegram} className="min-h-9 rounded-lg border border-border-line/60 px-3 text-xs font-medium text-slate-text hover:bg-bg-cream disabled:opacity-50">Desvincular</button>
              : <button type="button" disabled={cargandoTelegram || !estadoTelegram?.configurado} onClick={vincularTelegram} className="min-h-9 rounded-lg bg-emerald-primary px-3 text-xs font-semibold text-bg-cream hover:bg-emerald-hover disabled:opacity-50">{cargandoTelegram ? "Preparando…" : "Vincular Telegram"}</button>}
          </section>
          {estadoTelegram && !estadoTelegram.configurado && <p role="alert" className="rounded-xl border border-amber-300/60 bg-amber-100/70 p-3 text-sm text-amber-900">Telegram no está configurado en el backend. Revisa TELEGRAM_BOT_TOKEN y NOMBRE_BOT_TELEGRAM.</p>}
          {estadoTelegram?.errorRecepcion && <p role="alert" className="rounded-xl border border-amber-300/60 bg-amber-100/70 p-3 text-sm text-amber-900">{estadoTelegram.errorRecepcion}</p>}
          {enlaceTelegram && !estadoTelegram?.conectado && <p className="text-sm text-slate-text">Abre el bot y pulsa <strong>Iniciar</strong> para completar el vínculo. <a href={enlaceTelegram} target="_blank" rel="noreferrer" className="font-semibold text-emerald-primary underline">Abrir @{estadoTelegram?.nombreBot || "bot"} en Telegram</a></p>}

          <section aria-label="Mensajes del chat grupal" aria-busy={cargandoTelegram} className="max-h-72 min-h-36 space-y-2 overflow-y-auto rounded-2xl border border-border-line/50 bg-bg-cream/60 p-4">
            {mensajes.length ? mensajes.map((mensaje) => <article key={mensaje.id} className={`w-fit max-w-[90%] break-words rounded-xl px-3 py-2 text-sm ${mensaje.rol === "assistant" ? "bg-white text-bg-dark" : "ml-auto bg-emerald-primary text-bg-cream"}`}>
              {mensaje.grupo && <p className={`mb-1 text-[11px] font-semibold ${mensaje.rol === "assistant" ? "text-emerald-primary" : "text-bg-cream/80"}`}>{mensaje.grupo}</p>}
              <p>{mensaje.texto}</p>
              <time className={`mt-1 block text-right text-[10px] ${mensaje.rol === "assistant" ? "text-slate-text" : "text-bg-cream/70"}`} dateTime={mensaje.fecha}>{new Date(mensaje.fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</time>
            </article>) : <p className="text-sm text-slate-text">{cargandoTelegram ? "Conectando con Telegram…" : "Aún no hay mensajes en esta conversación."}</p>}
          </section>
          <form onSubmit={enviarMensaje} className="flex gap-2">
            <label className="sr-only" htmlFor="grupo-chat-mensaje">Mensaje</label>
            <input id="grupo-chat-mensaje" value={borrador} onChange={(evento) => setBorrador(evento.target.value)} maxLength={3500} disabled={!estadoTelegram?.conectado || enviandoTelegram} placeholder={estadoTelegram?.conectado ? "Escribe un mensaje" : "Vincula Telegram para escribir"} className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-60" />
            <button type="submit" disabled={!estadoTelegram?.conectado || !borrador.trim() || enviandoTelegram} className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:cursor-not-allowed disabled:opacity-50">{enviandoTelegram ? "Enviando…" : "Enviar"}</button>
          </form>
        </div>
      )}
    </ModalDetalleRegistro>
  );
}
