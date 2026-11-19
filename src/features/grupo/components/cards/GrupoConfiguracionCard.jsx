/**
 * @uso        Configuración de grupos (transicional): datos del grupo, invitaciones, fuentes y vínculo con Telegram
 * @funciones  GrupoConfiguracionCard()
 * @datos      Grupos y fuentes del usuario; Telegram vía telegramServicio
 * @eventos    Seleccionar grupo, editar/eliminar el grupo, preparar invitación, registrar/vincular/desvincular fuentes y vincular/desvincular Telegram
 * @estados    grupos, idGrupoSeleccionado, fuentes, telegram, formularios y avisos
 * @usadoPor   ConfiguracionPage
 */
import { useEffect, useMemo, useState } from "react";
import { Card } from "../../../../components/ui";
import EditarGrupoForm from "../forms/EditarGrupoForm";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";
import {
  actualizarGrupo,
  desvincularFuenteDeGrupo,
  eliminarGrupo,
  obtenerGruposPorUsuario,
  vincularFuenteAGrupo,
} from "../../services/gruposService";
import {
  crearFuente,
  obtenerFuentesPorUsuario,
} from "../../../../services/fuenteServicio";
import {
  crearEnlaceTelegram,
  desvincularTelegram,
  obtenerEstadoTelegram,
} from "../../../../services/telegramServicio";
import { AlertaGlobal } from "../../../../features/error";

function listaRespuesta(respuesta) {
  const datos = respuesta?.datos ?? respuesta?.data ?? respuesta?.content;
  return Array.isArray(respuesta)
    ? respuesta
    : Array.isArray(datos)
      ? datos
      : [];
}

function datosRespuesta(respuesta) {
  return respuesta?.datos ?? respuesta?.data ?? respuesta ?? {};
}

function normalizarGrupo(grupo, index) {
  return {
    id: grupo.idGrupo || grupo.id || `grupo-${index}`,
    nombre: grupo.nombre || "Grupo sin nombre",
    descripcion: grupo.descripcion || grupo.detalle || "Sin descripción",
    fuentes: Array.isArray(grupo.fuentes) ? grupo.fuentes : [],
  };
}

function fechaLocalISO() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function generarId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `fuente-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

/** Contenedor «Grupo» de la página Configuración con las funciones antes dentro del modal del grupo. */
export default function GrupoConfiguracionCard() {
  const { usuario } = useUsuarioActivo();
  const [grupos, setGrupos] = useState([]);
  const [idGrupoSeleccionado, setIdGrupoSeleccionado] = useState(null);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [fuentes, setFuentes] = useState([]);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState("");
  const [tipoNuevaFuente, setTipoNuevaFuente] = useState("CORREO");
  const [contenidoNuevaFuente, setContenidoNuevaFuente] = useState("");
  const [estadoTelegram, setEstadoTelegram] = useState(null);
  const [enlaceTelegram, setEnlaceTelegram] = useState("");
  const [cargandoTelegram, setCargandoTelegram] = useState(false);
  const [correoInvitacion, setCorreoInvitacion] = useState("");
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [nombreEditado, setNombreEditado] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");

  const grupo = grupos.find(
    (item) => String(item.id) === String(idGrupoSeleccionado),
  );
  const fuentesVinculadas = grupo?.fuentes || [];
  const idsVinculados = useMemo(
    () => new Set(fuentesVinculadas.map((fuente) => fuente.idFuente)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grupo?.fuentes],
  );
  const fuentesDisponibles = useMemo(
    () => fuentes.filter((fuente) => !idsVinculados.has(fuente.idFuente)),
    [fuentes, idsVinculados],
  );

  useEffect(() => {
    if (!usuario?.idUsuario) return undefined;
    let vigente = true;
    setCargandoGrupos(true);
    obtenerGruposPorUsuario(usuario.idUsuario)
      .then((respuesta) => {
        if (vigente) {
          const lista = listaRespuesta(respuesta).map(normalizarGrupo);
          setGrupos(lista);
          setIdGrupoSeleccionado((actual) =>
            lista.some((item) => String(item.id) === String(actual))
              ? actual
              : lista[0]?.id ?? null,
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (vigente) setCargandoGrupos(false);
      });
    obtenerFuentesPorUsuario(usuario.idUsuario)
      .then((respuesta) => {
        if (vigente) setFuentes(listaRespuesta(respuesta));
      })
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, [usuario?.idUsuario]);

  useEffect(() => {
    setEditando(false);
    setConfirmarBorrado(false);
    setFuenteSeleccionada("");
    setContenidoNuevaFuente("");
    setAviso("");
    setError("");
    setNombreEditado(grupo?.nombre || "");
    setDescripcionEditada(grupo?.descripcion || "");
    if (!grupo) return undefined;
    let vigente = true;
    obtenerEstadoTelegram()
      .then((respuesta) => {
        if (vigente) setEstadoTelegram(datosRespuesta(respuesta));
      })
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, [idGrupoSeleccionado]);

  const actualizarGrupoEnVista = (actualizado) => {
    const datos = actualizado?.data || actualizado;
    if (datos?.idGrupo || datos?.id) {
      setGrupos((actuales) =>
        actuales.map((item) =>
          String(item.id) === String(datos.idGrupo || datos.id)
            ? normalizarGrupo({ ...item, ...datos, fuentes: datos.fuentes ?? item.fuentes }, 0)
            : item,
        ),
      );
    }
  };
  const guardarGrupo = async (evento) => {
    evento.preventDefault();
    const nombre = nombreEditado.trim();
    const descripcion = descripcionEditada.trim();
    if (!nombre || !descripcion || !usuario?.idUsuario || !grupo) {
      setError("Nombre y descripción son obligatorios.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const respuesta = await actualizarGrupo(
        grupo.id,
        { nombre, descripcion },
        usuario.idUsuario,
      );
      actualizarGrupoEnVista(
        respuesta?.data || { ...grupo, nombre, descripcion },
      );
      setEditando(false);
      setAviso("Grupo actualizado.");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo actualizar el grupo.");
    } finally {
      setCargando(false);
    }
  };
  const borrarGrupo = async () => {
    if (!usuario?.idUsuario || cargando || !grupo) return;
    setCargando(true);
    setError("");
    try {
      await eliminarGrupo(grupo.id, usuario.idUsuario);
      setGrupos((actuales) => actuales.filter((item) => item.id !== grupo.id));
      setIdGrupoSeleccionado(null);
      setAviso("Grupo eliminado.");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo eliminar el grupo.");
    } finally {
      setCargando(false);
    }
  };
  const vincular = async (fuente) => {
    if (!usuario?.idUsuario || !fuente?.idFuente || !grupo) return;
    setCargando(true);
    setError("");
    setAviso("");
    try {
      const respuesta = await vincularFuenteAGrupo(
        grupo.id,
        fuente.idFuente,
        usuario.idUsuario,
      );
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
    if (!usuario?.idUsuario || !fuente?.idFuente || !grupo) return;
    setCargando(true);
    setError("");
    setAviso("");
    try {
      const respuesta = await desvincularFuenteDeGrupo(
        grupo.id,
        fuente.idFuente,
        usuario.idUsuario,
      );
      actualizarGrupoEnVista(respuesta);
      setAviso(`“${fuente.contenido}” se desvinculó del grupo.`);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo desvincular la fuente.");
    } finally {
      setCargando(false);
    }
  };
  const registrarYVincular = async (evento) => {
    evento.preventDefault();
    if (!contenidoNuevaFuente.trim() || !usuario?.idUsuario || !grupo) return;
    setCargando(true);
    setError("");
    setAviso("");
    const fuente = {
      idFuente: generarId(),
      tipo: tipoNuevaFuente,
      contenido: contenidoNuevaFuente.trim(),
      fechaCreacion: fechaLocalISO(),
      usuario: { idUsuario: usuario.idUsuario },
    };
    try {
      const respuesta = await crearFuente(fuente);
      const fuenteGuardada = respuesta?.data || respuesta || fuente;
      await vincularFuenteAGrupo(
        grupo.id,
        fuenteGuardada.idFuente,
        usuario.idUsuario,
      );
      setFuentes((actuales) => [...actuales, fuenteGuardada]);
      setGrupos((actuales) =>
        actuales.map((item) =>
          item.id === grupo.id
            ? { ...item, fuentes: [...fuentesVinculadas, fuenteGuardada] }
            : item,
        ),
      );
      setContenidoNuevaFuente("");
      setAviso("La fuente quedó registrada y vinculada al grupo.");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo registrar y vincular la fuente.");
    } finally {
      setCargando(false);
    }
  };
  const vincularTelegram = async () => {
    setCargandoTelegram(true);
    setError("");
    setAviso("");
    try {
      const respuesta = await crearEnlaceTelegram();
      const datos = datosRespuesta(respuesta);
      if (!datos.enlace)
        throw new Error("No se recibió un enlace de Telegram válido.");
      setEnlaceTelegram(datos.enlace);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo crear el enlace de Telegram.");
    } finally {
      setCargandoTelegram(false);
    }
  };
  const quitarVinculoTelegram = async () => {
    setCargandoTelegram(true);
    setError("");
    setAviso("");
    try {
      await desvincularTelegram();
      setEstadoTelegram((estado) => ({
        ...estado,
        conectado: false,
        usuarioTelegram: "",
      }));
      setEnlaceTelegram("");
      setAviso("La cuenta de Telegram se desvinculó.");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo desvincular Telegram.");
    } finally {
      setCargandoTelegram(false);
    }
  };
  const prepararInvitacion = (evento) => {
    evento.preventDefault();
    if (!correoInvitacion.trim()) return;
    setAviso(
      `Invitación preparada para ${correoInvitacion.trim()}. El envío estará disponible al conectar el servicio de grupos.`,
    );
    setCorreoInvitacion("");
  };

  return (
    <Card como="section" aria-labelledby="grupo-configuracion-titulo" className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="grupo-configuracion-titulo" className="font-display text-lg font-semibold text-bg-dark">
            Grupo
          </h2>
          <p className="mt-1 text-xs text-slate-text">
            Datos del grupo, invitaciones, fuentes y el vínculo con Telegram.
          </p>
        </div>
        {grupos.length > 1 && (
          <label className="block shrink-0 text-xs text-slate-text">
            Grupo a configurar
            <select
              value={idGrupoSeleccionado ?? ""}
              onChange={(evento) => setIdGrupoSeleccionado(evento.target.value)}
              className="mt-1 block w-full max-w-xs rounded-lg border border-border-line bg-bg-cream px-2 py-1.5 text-sm text-bg-dark"
            >
              {grupos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {cargandoGrupos && <p role="status" className="text-sm text-slate-text">Cargando tus grupos…</p>}
      {!cargandoGrupos && grupos.length === 0 && (
        <p className="rounded-2xl border border-border-line/50 bg-bg-cream/70 p-4 text-sm text-slate-text">
          Aún no tienes grupos. Crea el primero desde «Grupos» en el panel.
        </p>
      )}

      {grupo && (
        <>
          <section className="rounded-2xl border border-border-line/40 p-4">
            <h3 className="font-semibold">Datos del grupo</h3>
            <p className="mt-1 text-sm text-slate-text">
              Actualiza el nombre y la descripción o elimina este grupo.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={cargando}
                onClick={() => {
                  setEditando((actual) => !actual);
                  setNombreEditado(grupo.nombre || "");
                  setDescripcionEditada(grupo.descripcion || "");
                  setConfirmarBorrado(false);
                }}
                className="min-h-10 rounded-xl border border-emerald-primary/40 px-4 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50"
              >
                {editando ? "Cancelar edición" : "Editar grupo"}
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={() => {
                  setConfirmarBorrado(true);
                  setEditando(false);
                }}
                className="min-h-10 rounded-xl border border-red-700/30 px-4 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:opacity-50"
              >
                Eliminar grupo
              </button>
            </div>
            {editando && (
              <EditarGrupoForm
                nombre={nombreEditado}
                descripcion={descripcionEditada}
                alCambiarNombre={setNombreEditado}
                alCambiarDescripcion={setDescripcionEditada}
                alGuardar={guardarGrupo}
                cargando={cargando}
              />
            )}
            {confirmarBorrado && (
              <div
                role="alertdialog"
                aria-label="Confirmar eliminación de grupo"
                className="mt-4 rounded-xl border border-red-700/30 bg-red-50 p-4"
              >
                <p className="text-sm text-red-900">
                  ¿Eliminar el grupo {grupo.nombre}? Las fuentes vinculadas
                  seguirán registradas en tu cuenta.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={cargando}
                    onClick={borrarGrupo}
                    className="min-h-10 rounded-lg bg-red-700 px-4 text-sm font-medium text-white"
                  >
                    Confirmar eliminación
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmarBorrado(false)}
                    className="min-h-10 rounded-lg px-3 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border-line/40 p-4">
            <h3 className="font-semibold">Invitaciones</h3>
            <p className="mt-1 text-sm text-slate-text">
              El envío de invitaciones estará disponible al conectar el servicio
              de grupos.
            </p>
            <form
              onSubmit={prepararInvitacion}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <label className="sr-only" htmlFor="grupo-invitacion-correo">
                Correo de la persona
              </label>
              <input
                id="grupo-invitacion-correo"
                type="email"
                required
                value={correoInvitacion}
                onChange={(evento) => setCorreoInvitacion(evento.target.value)}
                placeholder="persona@correo.com"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              />
              <button
                type="submit"
                className="min-h-11 rounded-xl border border-emerald-primary/40 px-4 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
              >
                Preparar invitación
              </button>
            </form>
          </section>

          <details className="rounded-2xl border border-border-line/40 p-4">
            <summary className="cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">
              Registrar una fuente nueva para este grupo
            </summary>
            <form
              onSubmit={registrarYVincular}
              className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="grupo-nueva-fuente-tipo" className="text-sm font-medium">
                  Tipo
                </label>
                <select
                  id="grupo-nueva-fuente-tipo"
                  value={tipoNuevaFuente}
                  onChange={(evento) => setTipoNuevaFuente(evento.target.value)}
                  disabled={cargando}
                  className="min-h-11 rounded-xl border border-border-line bg-bg-cream px-3 text-sm"
                >
                  <option value="CORREO">Correo electrónico</option>
                  <option value="TELEFONO">Teléfono</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="grupo-nueva-fuente-contenido" className="text-sm font-medium">
                  Contenido
                </label>
                <input
                  id="grupo-nueva-fuente-contenido"
                  value={contenidoNuevaFuente}
                  onChange={(evento) => setContenidoNuevaFuente(evento.target.value)}
                  maxLength={255}
                  required
                  disabled={cargando}
                  className="min-h-11 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
                />
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="min-h-11 rounded-xl border border-emerald-primary/40 px-4 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50"
              >
                {cargando ? "Guardando…" : "Registrar y vincular"}
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-text">
              La fuente se registra a tu usuario y luego se asocia al grupo.
            </p>
          </details>

          <section aria-labelledby="vincular-fuente-titulo">
            <h3 id="vincular-fuente-titulo" className="font-semibold">
              Vincular una fuente registrada
            </h3>
            {fuentesDisponibles.length ? (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="grupo-fuente-existente">
                  Fuente registrada
                </label>
                <select
                  id="grupo-fuente-existente"
                  value={fuenteSeleccionada}
                  onChange={(evento) => setFuenteSeleccionada(evento.target.value)}
                  disabled={cargando}
                  className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
                >
                  <option value="">Selecciona una fuente</option>
                  {fuentesDisponibles.map((fuente) => (
                    <option key={fuente.idFuente} value={fuente.idFuente}>
                      {fuente.tipo}: {fuente.contenido}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!fuenteSeleccionada || cargando}
                  onClick={() =>
                    vincular(
                      fuentesDisponibles.find(
                        (fuente) => fuente.idFuente === fuenteSeleccionada,
                      ),
                    )
                  }
                  className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50"
                >
                  Vincular fuente
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-text">
                No hay otras fuentes registradas para vincular.
              </p>
            )}
          </section>

          <section
            aria-label="Vínculo de Telegram"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-line/50 bg-bg-cream/50 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Chat privado de Telegram</p>
              {estadoTelegram?.conectado ? (
                <p className="text-xs text-slate-text">
                  Conectado
                  {estadoTelegram.usuarioTelegram
                    ? ` como @${estadoTelegram.usuarioTelegram}`
                    : ""}{" "}
                  · @{estadoTelegram.nombreBot}
                </p>
              ) : (
                <p className="text-xs text-slate-text">
                  Vincula tu cuenta para enviar y recibir mensajes con el bot.
                </p>
              )}
            </div>
            {estadoTelegram?.conectado ? (
              <button
                type="button"
                disabled={cargandoTelegram}
                onClick={quitarVinculoTelegram}
                className="min-h-9 rounded-lg border border-border-line/60 px-3 text-xs font-medium text-slate-text hover:bg-bg-cream disabled:opacity-50"
              >
                Desvincular
              </button>
            ) : (
              <button
                type="button"
                disabled={cargandoTelegram || !estadoTelegram?.configurado}
                onClick={vincularTelegram}
                className="min-h-9 rounded-lg bg-emerald-primary px-3 text-xs font-semibold text-bg-cream hover:bg-emerald-hover disabled:opacity-50"
              >
                {cargandoTelegram ? "Preparando…" : "Vincular Telegram"}
              </button>
            )}
            {enlaceTelegram && !estadoTelegram?.conectado && (
              <p className="w-full text-xs text-slate-text">
                Abre el bot y pulsa <strong>Iniciar</strong> para completar el
                vínculo.{" "}
                <a
                  href={enlaceTelegram}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald-primary underline"
                >
                  Abrir @{estadoTelegram?.nombreBot || "bot"} en Telegram
                </a>
              </p>
            )}
            {estadoTelegram && !estadoTelegram.configurado && (
              <p
                role="alert"
                className="w-full rounded-xl border border-amber-300/60 bg-amber-100/70 p-3 text-xs text-amber-900"
              >
                Telegram no está configurado en el backend. Revisa
                TELEGRAM_BOT_TOKEN y NOMBRE_BOT_TELEGRAM.
              </p>
            )}
          </section>
        </>
      )}

      <AlertaGlobal tipo="error" mensaje={error} idBase="GrupoConfiguracionCard-error" />
      {aviso && (
        <p
          role="status"
          className="rounded-xl border border-emerald-primary/20 bg-emerald-primary/10 p-3 text-sm text-bg-dark"
        >
          {aviso}
        </p>
      )}
    </Card>
  );
}
