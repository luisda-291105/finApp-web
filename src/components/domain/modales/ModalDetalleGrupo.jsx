/**
 * @uso        Detalle accesible de un grupo con fuentes persistidas y espacios colaborativos de demostración
 * @funciones  ModalDetalleGrupo({ grupo, abierto, alCerrar, triggerRef, alGrupoActualizado })
 * @datos      Lee fuentes del usuario y persiste su vínculo al grupo; chat e invitaciones son locales
 * @eventos    Cambiar pestaña, asociar/desasociar fuente, enviar mensaje e invitar usuario
 * @estados    fuentes, fuenteSeleccionada, mensajes, invitacion, cargando, error, aviso
 * @usadoPor   PaginaDashboardBolsillos
 */
import { useEffect, useMemo, useRef, useState } from "react";
import ModalDetalleRegistro from "./ModalDetalleRegistro";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { crearFuente, obtenerFuentesPorUsuario } from "../../../services/fuenteServicio";
import { actualizarGrupo, eliminarGrupo, desvincularFuenteDeGrupo, vincularFuenteAGrupo } from "../../../services/grupoServicio";

const PESTANAS = ["Fuentes", "Chat grupal"];

function fechaLocalISO() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function generarId() {
  return globalThis.crypto?.randomUUID?.() || `fuente-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function listaRespuesta(respuesta) {
  return Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
}

export default function ModalDetalleGrupo({ grupo, abierto, alCerrar, triggerRef, alGrupoActualizado }) {
  const { usuario } = useUsuarioActivo();
  const [fuentes, setFuentes] = useState([]);
  const [pestana, setPestana] = useState("Fuentes");
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState("");
  const [tipoNuevaFuente, setTipoNuevaFuente] = useState("CORREO");
  const [contenidoNuevaFuente, setContenidoNuevaFuente] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [borrador, setBorrador] = useState("");
  const [correoInvitacion, setCorreoInvitacion] = useState("");
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [nombreEditado, setNombreEditado] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");

  const fuentesVinculadas = useMemo(() => grupo?.fuentes || [], [grupo?.fuentes]);
  const idsVinculados = useMemo(() => new Set(fuentesVinculadas.map((fuente) => fuente.idFuente)), [fuentesVinculadas]);
  const fuentesDisponibles = useMemo(() => fuentes.filter((fuente) => !idsVinculados.has(fuente.idFuente)), [fuentes, idsVinculados]);

  useEffect(() => {
    if (!abierto || !grupo?.id || !usuario?.idUsuario) return;
    let vigente = true;
    setPestana("Fuentes");
    setEditando(false);
    setConfirmarBorrado(false);
    setNombreEditado(grupo.nombre || "");
    setDescripcionEditada(grupo.descripcion || "");
    setError("");
    setAviso("");
    obtenerFuentesPorUsuario(usuario.idUsuario)
      .then((respuesta) => {
        if (vigente) setFuentes(listaRespuesta(respuesta));
      })
      .catch((fallo) => {
        if (vigente) setError(fallo?.message || "No se pudieron cargar tus fuentes.");
      });
    return () => { vigente = false; };
  }, [abierto, grupo?.id, usuario?.idUsuario]);

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
      setEditando(false);
      setAviso("Grupo actualizado.");
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
    setCargando(true);
    setError("");
    setAviso("");
    try {
      const respuesta = await vincularFuenteAGrupo(grupo.id, fuente.idFuente, usuario.idUsuario);
      actualizarGrupoEnVista(respuesta);
      setFuenteSeleccionada("");
      setAviso(`“${fuente.contenido}” quedó vinculada al grupo.`);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo vincular la fuente.");
    } finally {
      setCargando(false);
    }
  };

  const desvincular = async (fuente) => {
    if (!usuario?.idUsuario) return;
    setCargando(true);
    setError("");
    try {
      const respuesta = await desvincularFuenteDeGrupo(grupo.id, fuente.idFuente, usuario.idUsuario);
      actualizarGrupoEnVista(respuesta);
      setAviso(`“${fuente.contenido}” se desvinculó; sigue registrada en tu cuenta.`);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo desvincular la fuente.");
    } finally {
      setCargando(false);
    }
  };

  const registrarYVincular = async (evento) => {
    evento.preventDefault();
    if (!usuario?.idUsuario) {
      setError("Inicia sesión para registrar una fuente.");
      return;
    }
    const contenido = contenidoNuevaFuente.trim();
    if (!contenido) return;
    const duplicada = fuentes.some((fuente) => fuente.tipo?.toUpperCase() === tipoNuevaFuente && fuente.contenido?.trim().toLocaleLowerCase("es") === contenido.toLocaleLowerCase("es"));
    if (duplicada) {
      setError("Esta fuente ya está registrada en tu cuenta. Selecciónala en la lista para vincularla.");
      return;
    }

    setCargando(true);
    setError("");
    setAviso("");
    const payload = {
      idFuente: generarId(),
      tipo: tipoNuevaFuente,
      contenido,
      estado: true,
      fechaCreacion: fechaLocalISO(),
      usuario: { idUsuario: usuario.idUsuario },
    };
    let fuenteRegistrada = false;
    try {
      const respuestaFuente = await crearFuente(payload);
      const fuente = respuestaFuente?.data || respuestaFuente || payload;
      fuenteRegistrada = true;
      setFuentes((actuales) => [fuente, ...actuales.filter((item) => item.idFuente !== fuente.idFuente)]);
      const respuestaGrupo = await vincularFuenteAGrupo(grupo.id, fuente.idFuente, usuario.idUsuario);
      actualizarGrupoEnVista(respuestaGrupo);
      setContenidoNuevaFuente("");
      setAviso(`“${fuente.contenido}” se registró y quedó vinculada al grupo.`);
    } catch (fallo) {
      setError(fuenteRegistrada
        ? `La fuente se registró en tu cuenta, pero no se pudo vincular: ${fallo?.message || "intenta de nuevo"}.`
        : fallo?.message || "No se pudo registrar o vincular la fuente.");
    } finally {
      setCargando(false);
    }
  };

  const enviarMensaje = (evento) => {
    evento.preventDefault();
    const texto = borrador.trim();
    if (!texto) return;
    setMensajes((actuales) => [...actuales, { id: `${Date.now()}`, texto }]);
    setBorrador("");
  };

  const prepararInvitacion = (evento) => {
    evento.preventDefault();
    if (!correoInvitacion.trim()) return;
    setAviso(`Invitación preparada para ${correoInvitacion.trim()}. El envío estará disponible al conectar el servicio de grupos.`);
    setCorreoInvitacion("");
  };

  const cerrar = () => {
    if (!cargando) alCerrar();
  };

  return (
    <ModalDetalleRegistro abierto={abierto} titulo={grupo.nombre} etiquetaCerrar={`Cerrar grupo ${grupo.nombre}`} alCerrar={cerrar} triggerRef={triggerRef}>
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-primary">Contenido del grupo</p>
              <h2 id="detalle-grupo-titulo" className="mt-1 font-display text-2xl font-semibold">{grupo.nombre}</h2>
              <p className="mt-1 text-sm text-slate-text">{grupo.descripcion}</p>
            </div>
          </header>

          <div className="mb-4 flex flex-wrap gap-2"><button type="button" disabled={cargando} onClick={() => { setEditando((actual) => !actual); setNombreEditado(grupo.nombre || ""); setDescripcionEditada(grupo.descripcion || ""); }} className="min-h-10 rounded-lg border border-emerald-primary/40 px-3 text-sm font-medium text-emerald-primary">{editando ? "Cancelar edición" : "Editar grupo"}</button><button type="button" disabled={cargando} onClick={() => setConfirmarBorrado(true)} className="min-h-10 rounded-lg border border-red-700/30 px-3 text-sm font-medium text-red-700">Eliminar grupo</button></div>
          {editando && <form onSubmit={guardarGrupo} className="mb-4 grid gap-3 rounded-xl border border-border-line/40 p-4"><label className="grid gap-1 text-sm">Nombre<input required value={nombreEditado} maxLength={100} onChange={(evento) => setNombreEditado(evento.target.value)} className="min-h-10 rounded-lg border border-border-line bg-bg-cream px-3" /></label><label className="grid gap-1 text-sm">Descripción<textarea required value={descripcionEditada} maxLength={255} onChange={(evento) => setDescripcionEditada(evento.target.value)} className="min-h-20 rounded-lg border border-border-line bg-bg-cream px-3" /></label><button type="submit" disabled={cargando} className="min-h-10 justify-self-start rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream disabled:opacity-50">Guardar cambios</button></form>}
          {confirmarBorrado && <div role="alertdialog" aria-label="Confirmar eliminación de grupo" className="mb-4 rounded-xl border border-red-700/30 bg-red-50 p-4"><p className="text-sm text-red-900">¿Eliminar el grupo {grupo.nombre}? Las fuentes vinculadas seguirán registradas en tu cuenta.</p><div className="mt-3 flex gap-2"><button type="button" disabled={cargando} onClick={borrarGrupo} className="min-h-10 rounded-lg bg-red-700 px-4 text-sm font-medium text-white">Confirmar eliminación</button><button type="button" onClick={() => setConfirmarBorrado(false)} className="min-h-10 rounded-lg px-3 text-sm">Cancelar</button></div></div>}
          <div className="mt-5 flex flex-wrap gap-2 border-b border-border-line/40" role="tablist" aria-label={`Secciones de ${grupo.nombre}`}>
            {PESTANAS.map((nombre) => (
              <button key={nombre} type="button" role="tab" aria-selected={pestana === nombre} onClick={() => { setPestana(nombre); setError(""); setAviso(""); }} className={`min-h-10 rounded-t-lg border-b-2 px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${pestana === nombre ? "border-emerald-primary text-emerald-primary" : "border-transparent text-slate-text hover:text-bg-dark"}`}>
                {nombre}
              </button>
            ))}
          </div>

          {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</p>}
          {aviso && <p role="status" className="mt-4 rounded-xl border border-emerald-primary/20 bg-emerald-primary/10 p-3 text-sm text-bg-dark">{aviso}</p>}

          {pestana === "Fuentes" ? (
            <div className="mt-5 space-y-6">
              <section aria-labelledby="fuentes-vinculadas-titulo">
                <h3 id="fuentes-vinculadas-titulo" className="font-semibold">Fuentes vinculadas</h3>
                {fuentesVinculadas.length ? (
                  <ul className="mt-3 space-y-2">
                    {fuentesVinculadas.map((fuente) => (
                      <li key={fuente.idFuente} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-line/50 bg-bg-cream/70 p-3">
                        <span className="min-w-0"><span className="block text-xs uppercase tracking-wide text-slate-text">{fuente.tipo}</span><span className="break-all text-sm font-medium">{fuente.contenido}</span></span>
                        <button type="button" disabled={cargando} onClick={() => desvincular(fuente)} className="min-h-9 rounded-lg px-3 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">Desvincular</button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-sm text-slate-text">Este grupo aún no tiene fuentes vinculadas.</p>}
              </section>

              <section aria-labelledby="vincular-fuente-titulo" className="rounded-2xl border border-border-line/50 p-4">
                <h3 id="vincular-fuente-titulo" className="font-semibold">Vincular una fuente registrada</h3>
                {fuentesDisponibles.length ? (
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <label className="sr-only" htmlFor="grupo-fuente-existente">Fuente registrada</label>
                    <select id="grupo-fuente-existente" value={fuenteSeleccionada} onChange={(evento) => setFuenteSeleccionada(evento.target.value)} disabled={cargando} className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
                      <option value="">Selecciona una fuente</option>
                      {fuentesDisponibles.map((fuente) => <option key={fuente.idFuente} value={fuente.idFuente}>{fuente.tipo}: {fuente.contenido}</option>)}
                    </select>
                    <button type="button" disabled={!fuenteSeleccionada || cargando} onClick={() => vincular(fuentesDisponibles.find((fuente) => fuente.idFuente === fuenteSeleccionada))} className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">Vincular fuente</button>
                  </div>
                ) : <p className="mt-2 text-sm text-slate-text">No hay otras fuentes registradas para vincular.</p>}
              </section>

              <details className="rounded-2xl border border-border-line/50 p-4">
                <summary className="cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">Registrar una fuente nueva para este grupo</summary>
                <form onSubmit={registrarYVincular} className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
                  <div className="flex flex-col gap-1.5"><label htmlFor="grupo-nueva-fuente-tipo" className="text-sm font-medium">Tipo</label><select id="grupo-nueva-fuente-tipo" value={tipoNuevaFuente} onChange={(evento) => setTipoNuevaFuente(evento.target.value)} disabled={cargando} className="min-h-11 rounded-xl border border-border-line bg-bg-cream px-3 text-sm"><option value="CORREO">Correo electrónico</option><option value="TELEFONO">Teléfono</option><option value="OTRO">Otro</option></select></div>
                  <div className="flex flex-col gap-1.5"><label htmlFor="grupo-nueva-fuente-contenido" className="text-sm font-medium">Contenido</label><input id="grupo-nueva-fuente-contenido" value={contenidoNuevaFuente} onChange={(evento) => setContenidoNuevaFuente(evento.target.value)} maxLength={255} required disabled={cargando} className="min-h-11 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" /></div>
                  <button type="submit" disabled={cargando} className="min-h-11 rounded-xl border border-emerald-primary/40 px-4 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">{cargando ? "Guardando…" : "Registrar y vincular"}</button>
                </form>
                <p className="mt-2 text-xs text-slate-text">La fuente se registra a tu usuario y luego se asocia al grupo.</p>
              </details>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <p className="rounded-xl bg-amber-100/70 p-3 text-sm text-amber-900">El chat y las invitaciones son una vista de demostración; todavía no se guardan ni se envían.</p>
              <section aria-label="Mensajes del chat grupal" className="max-h-56 min-h-28 space-y-2 overflow-y-auto rounded-2xl border border-border-line/50 bg-bg-cream/60 p-4">
                {mensajes.length ? mensajes.map((mensaje) => <p key={mensaje.id} className="w-fit max-w-full break-words rounded-xl bg-emerald-primary/10 px-3 py-2 text-sm">{mensaje.texto}</p>) : <p className="text-sm text-slate-text">Aún no hay mensajes en esta demostración.</p>}
              </section>
              <form onSubmit={enviarMensaje} className="flex gap-2"><label className="sr-only" htmlFor="grupo-chat-mensaje">Mensaje</label><input id="grupo-chat-mensaje" value={borrador} onChange={(evento) => setBorrador(evento.target.value)} maxLength={500} placeholder="Escribe un mensaje" className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" /><button type="submit" className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">Enviar</button></form>
              <form onSubmit={prepararInvitacion} className="rounded-2xl border border-border-line/50 p-4"><h3 className="font-semibold">Invitar usuarios</h3><div className="mt-3 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="grupo-invitacion-correo">Correo de la persona</label><input id="grupo-invitacion-correo" type="email" required value={correoInvitacion} onChange={(evento) => setCorreoInvitacion(evento.target.value)} placeholder="persona@correo.com" className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" /><button type="submit" className="min-h-11 rounded-xl border border-emerald-primary/40 px-4 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">Preparar invitación</button></div></form>
            </div>
          )}
      </ModalDetalleRegistro>
  );
}
