/**
 * @uso        Modal de detalle del grupo (fuentes vinculadas y chat entre miembros)
 * @funciones  GrupoDetalleModal({ grupo, abierto, alCerrar, triggerRef, alGrupoActualizado })
 * @datos      Gestiona los datos del grupo mediante servicios de dominio
 * @eventos    Cambios de pestaña, desvincular fuente, administrar integrantes, enviar mensaje y cierre
 * @estados    Estado local del detalle
 * @usadoPor   GruposPage
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, UserRoundX } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";
import {
  desvincularFuenteDeGrupo,
  listarMensajesGrupo,
  enviarMensajeGrupo,
  listarMiembrosGrupo,
  buscarUsuariosGrupo,
  agregarMiembroGrupo,
  eliminarMiembroGrupo,
} from "../../services/gruposService";
import { AlertaGlobal } from "../../../../features/error";

const PESTANAS = ["Fuentes", "Chat"];
const RETRASO_BUSQUEDA_MS = 300;

function listaRespuesta(respuesta) {
  const datos = respuesta?.datos ?? respuesta?.data ?? respuesta?.content;
  return Array.isArray(respuesta)
    ? respuesta
    : Array.isArray(datos)
      ? datos
      : [];
}

/** Presenta los detalles, las fuentes vinculadas y el chat del grupo. */
export default function GrupoDetalleModal({
  grupo,
  abierto,
  alCerrar,
  triggerRef,
  alGrupoActualizado,
}) {
  const { usuario } = useUsuarioActivo();
  const [pestana, setPestana] = useState("Fuentes");
  const [mensajes, setMensajes] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [cargandoChat, setCargandoChat] = useState(false);
  const [cargandoMiembros, setCargandoMiembros] = useState(false);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [borrador, setBorrador] = useState("");
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [busquedaMiembro, setBusquedaMiembro] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscandoMiembro, setBuscandoMiembro] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [agregandoMiembro, setAgregandoMiembro] = useState("");
  const [quitarMiembroId, setQuitarMiembroId] = useState("");
  const temporizadorRef = useRef(null);
  const listaRef = useRef(null);

  const fuentesVinculadas = useMemo(
    () => grupo?.fuentes || [],
    [grupo?.fuentes],
  );
  const esPropietario = useMemo(
    () =>
      Boolean(
        usuario?.idUsuario &&
          miembros.some(
            (miembro) =>
              String(miembro.idUsuario) === String(usuario.idUsuario) &&
              String(miembro.rol).toUpperCase() === "DUENO",
          ),
      ),
    [miembros, usuario?.idUsuario],
  );

  useEffect(() => {
    if (!abierto) return undefined;
    setPestana("Fuentes");
    setMensajes([]);
    setMiembros([]);
    setBusquedaMiembro("");
    setResultadosBusqueda([]);
    setErrorBusqueda("");
    setAviso("");
    setError("");
    return undefined;
  }, [abierto, grupo?.id]);

  useEffect(() => {
    if (!abierto || !grupo?.id) return undefined;
    let vigente = true;
    setCargandoMiembros(true);
    listarMiembrosGrupo(grupo.id)
      .then((respuesta) => {
        if (vigente) setMiembros(listaRespuesta(respuesta));
      })
      .catch((fallo) => {
        if (vigente)
          setError(fallo?.message || "No se pudieron cargar los integrantes.");
      })
      .finally(() => {
        if (vigente) setCargandoMiembros(false);
      });
    return () => {
      vigente = false;
    };
  }, [abierto, grupo?.id]);

  useEffect(() => {
    if (!abierto || pestana !== "Chat" || !grupo?.id || !usuario?.idUsuario)
      return undefined;
    let vigente = true;
    setCargandoChat(true);
    listarMensajesGrupo(grupo.id)
      .then((respuesta) => {
        if (vigente) setMensajes(listaRespuesta(respuesta));
      })
      .catch((fallo) => {
        if (vigente)
          setError(fallo?.message || "No se pudo cargar la conversación.");
      })
      .finally(() => {
        if (vigente) setCargandoChat(false);
      });
    return () => {
      vigente = false;
    };
  }, [abierto, pestana, grupo?.id, usuario?.idUsuario]);

  // Baja la consulta de integrantes al final de la lista
  useEffect(() => {
    if (pestana === "Chat" && listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [mensajes, pestana]);

  // Busqueda de usuarios para añadir integrantes (con retaso)
  useEffect(() => {
    const consulta = busquedaMiembro.trim();
    if (temporizadorRef.current) window.clearTimeout(temporizadorRef.current);
    if (consulta.length < 2) {
      setResultadosBusqueda([]);
      setErrorBusqueda("");
      setBuscandoMiembro(false);
      return undefined;
    }
    setBuscandoMiembro(true);
    setErrorBusqueda("");
    temporizadorRef.current = window.setTimeout(() => {
      buscarUsuariosGrupo(consulta)
        .then((respuesta) => {
          setResultadosBusqueda(listaRespuesta(respuesta));
          setErrorBusqueda("");
        })
        .catch((fallo) =>
          setErrorBusqueda(
            fallo?.message || "No se pudo buscar usuarios.",
          ),
        )
        .finally(() => setBuscandoMiembro(false));
    }, RETRASO_BUSQUEDA_MS);
    return () => {
      if (temporizadorRef.current) window.clearTimeout(temporizadorRef.current);
    };
  }, [busquedaMiembro]);

  if (!abierto || !grupo) return null;

  const actualizarGrupoEnVista = (respuesta) => {
    const grupoActualizado = respuesta?.data || respuesta;
    if (grupoActualizado?.idGrupo || grupoActualizado?.id)
      alGrupoActualizado?.(grupoActualizado);
  };

  const desvincular = async (fuente) => {
    if (!usuario?.idUsuario || !fuente?.idFuente) return;
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

  const enviarMensaje = async (evento) => {
    evento.preventDefault();
    const texto = borrador.trim();
    if (!texto || enviandoMensaje || !grupo?.id || !usuario?.idUsuario) return;
    setEnviandoMensaje(true);
    setError("");
    setAviso("");
    try {
      const mensaje = await enviarMensajeGrupo(grupo.id, texto);
      const nuevos = listaRespuesta([mensaje]);
      setMensajes((actuales) => [...actuales, ...nuevos]);
      setBorrador("");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo enviar el mensaje.");
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const agregarMiembroDesdeResultados = async (candidato) => {
    if (!grupo?.id || !candidato?.idUsuario) return;
    setAgregandoMiembro(candidato.idUsuario);
    setError("");
    setAviso("");
    try {
      const respuesta = await agregarMiembroGrupo(grupo.id, candidato.idUsuario);
      setMiembros(listaRespuesta(respuesta));
      setResultadosBusqueda((actuales) =>
        actuales.filter((item) => item.idUsuario !== candidato.idUsuario),
      );
      setAviso(`${candidato.nombre} se unió al grupo.`);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo añadir el integrante.");
    } finally {
      setAgregandoMiembro("");
    }
  };

  const quitarMiembro = async (miembro) => {
    if (!grupo?.id || !miembro?.idUsuario) return;
    setQuitarMiembroId(miembro.idUsuario);
    setError("");
    setAviso("");
    try {
      const respuesta = await eliminarMiembroGrupo(grupo.id, miembro.idUsuario);
      setMiembros(listaRespuesta(respuesta));
      setAviso(`${miembro.nombre} se quitó del grupo.`);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo quitar el integrante.");
    } finally {
      setQuitarMiembroId("");
    }
  };

  const cerrar = () => {
    if (!cargando) alCerrar();
  };

  return (
    <ModalDetalleRegistro
      abierto={abierto}
      titulo={grupo.nombre}
      etiquetaCerrar={`Cerrar grupo ${grupo.nombre}`}
      alCerrar={cerrar}
      triggerRef={triggerRef}
    >
      <p className="mb-4 min-w-0 text-sm text-slate-text">
        {grupo.descripcion}
      </p>
      <div
        className="flex flex-wrap gap-2 border-b border-border-line/40"
        role="tablist"
        aria-label={`Secciones de ${grupo.nombre}`}
      >
        {PESTANAS.map((nombre) => (
          <button
            key={nombre}
            type="button"
            role="tab"
            aria-selected={pestana === nombre}
            onClick={() => {
              setPestana(nombre);
              setError("");
              setAviso("");
            }}
            className={`min-h-10 rounded-t-lg border-b-2 px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${pestana === nombre ? "border-emerald-primary text-emerald-primary" : "border-transparent text-slate-text hover:text-bg-dark"}`}
          >
            {nombre}
          </button>
        ))}
      </div>
      <AlertaGlobal
        tipo="error"
        mensaje={error}
        idBase="GrupoDetalleModal-error"
      />
      {aviso && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-emerald-primary/20 bg-emerald-primary/10 p-3 text-sm text-bg-dark"
        >
          {aviso}
        </p>
      )}
      {pestana === "Fuentes" ? (
        <div className="mt-5 space-y-6">
          <section aria-labelledby="fuentes-vinculadas-titulo">
            <h3 id="fuentes-vinculadas-titulo" className="font-semibold">
              Fuentes vinculadas
            </h3>
            {fuentesVinculadas.length ? (
              <ul className="mt-3 space-y-2">
                {fuentesVinculadas.map((fuente) => (
                  <li
                    key={fuente.idFuente}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-line/50 bg-bg-cream/70 p-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs uppercase tracking-wide text-slate-text">
                        {fuente.tipo}
                      </span>
                      <span className="break-all text-sm font-medium">
                        {fuente.contenido}
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={cargando}
                      onClick={() => desvincular(fuente)}
                      className="min-h-9 rounded-lg px-3 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50"
                    >
                      Desvincular
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-text">
                Este grupo aún no tiene fuentes vinculadas.
              </p>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {/* Miembros del grupo */}
          <section aria-labelledby="integrantes-titulo">
            <h3 id="integrantes-titulo" className="font-semibold text-sm text-bg-dark">
              Integrantes del grupo
            </h3>
            {cargandoMiembros && (
              <p role="status" className="mt-2 text-xs text-slate-text">
                Cargando integrantes…
              </p>
            )}
            {!cargandoMiembros && (
              <ul className="mt-2 flex flex-wrap gap-2" aria-label="Integrantes">
                {miembros.map((miembro) => {
                  const esDueno = String(miembro.rol).toUpperCase() === "DUENO";
                  const esYo = String(miembro.idUsuario) === String(usuario?.idUsuario);
                  return (
                    <li
                      key={miembro.idUsuario}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border-line/40 bg-bg-cream/70 py-1 pl-3 pr-1.5 text-xs font-medium text-bg-dark"
                    >
                      <span className="max-w-44 truncate" title={miembro.correo || miembro.telefono || miembro.nombre}>
                        {miembro.nombre}
                        {esYo ? " (tú)" : ""}
                      </span>
                      <span className="rounded-full bg-emerald-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-primary">
                        {esDueno ? "Propietario" : "Miembro"}
                      </span>
                      {esPropietario && !esDueno && (
                        <button
                          type="button"
                          disabled={quitarMiembroId === miembro.idUsuario}
                          aria-label={`Quitar a ${miembro.nombre} del grupo`}
                          onClick={() => quitarMiembro(miembro)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-text transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50"
                        >
                          <UserRoundX className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {esPropietario && (
              <div className="relative mt-3">
                <label className="sr-only" htmlFor="buscar-integrante">
                  Buscar usuario para agregar al grupo
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border-line bg-bg-cream px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-primary">
                  <Search className="h-4 w-4 shrink-0 text-slate-text" aria-hidden="true" />
                  <input
                    id="buscar-integrante"
                    value={busquedaMiembro}
                    onChange={(evento) => setBusquedaMiembro(evento.target.value)}
                    placeholder="Buscar por nombre, correo, teléfono o identificación…"
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-text"
                    aria-label="Buscar integrante"
                  />
                  {buscandoMiembro && (
                    <span className="text-[11px] text-slate-text">Buscando…</span>
                  )}
                </div>
                {resultadosBusqueda.length > 0 && (
                  <ul
                    role="listbox"
                    aria-label="Usuarios encontrados"
                    className="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-border-line/50 bg-white shadow-lg ring-1 ring-slate-900/10"
                  >
                    {resultadosBusqueda.map((candidato) => {
                      const yaMiembro = miembros.some(
                        (miembro) => String(miembro.idUsuario) === String(candidato.idUsuario),
                      );
                      return (
                        <li key={candidato.idUsuario}>
                          <button
                            type="button"
                            disabled={yaMiembro || agregandoMiembro === candidato.idUsuario}
                            onClick={() => agregarMiembroDesdeResultados(candidato)}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-bg-cream disabled:opacity-60"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-bg-dark">
                                {candidato.nombre}
                              </span>
                              <span className="block truncate text-xs text-slate-text">
                                {candidato.correo || candidato.telefono || candidato.idUsuario}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-emerald-primary">
                              {yaMiembro ? "Ya miembro" : "Añadir"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {errorBusqueda && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errorBusqueda}
                  </p>
                )}
              </div>
            )}
            {esPropietario && (
              <p className="mt-2 text-[11px] leading-relaxed text-slate-text">
                Puedes añadir usuarios registrados: busca por nombre, correo,
                teléfono o identificación. Solo tú (el propietario)
                administra integrantes.
              </p>
            )}
          </section>

          {/* Chat del grupo */}
          <section
            aria-label="Mensajes del grupo"
            aria-busy={cargandoChat}
            ref={listaRef}
            className="max-h-72 min-h-36 space-y-2 overflow-y-auto rounded-2xl border border-border-line/50 bg-bg-cream/60 p-4"
          >
            {mensajes.length ? (
              mensajes.map((mensaje) => {
                const esMio = String(mensaje.idUsuario) === String(usuario?.idUsuario);
                return (
                  <article
                    key={mensaje.idMensaje}
                    className={`w-fit max-w-[90%] break-words rounded-xl px-3 py-2 text-sm ${esMio ? "ml-auto bg-emerald-primary text-bg-cream" : "bg-white text-bg-dark"}`}
                  >
                    <p
                      className={`mb-0.5 text-[10px] font-semibold ${esMio ? "text-bg-cream/80" : "text-emerald-primary"}`}
                    >
                      {esMio ? "Tú" : mensaje.nombreAutor}
                    </p>
                    <p>{mensaje.texto}</p>
                    <time
                      className={`mt-1 block text-right text-[10px] ${esMio ? "text-bg-cream/70" : "text-slate-text"}`}
                      dateTime={mensaje.fecha}
                    >
                      {new Date(mensaje.fecha).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-slate-text">
                {cargandoChat
                  ? "Cargando la conversación…"
                  : "Aún no hay mensajes. Escribe el primero."}
              </p>
            )}
          </section>
          <form onSubmit={enviarMensaje} className="flex gap-2">
            <label className="sr-only" htmlFor="grupo-chat-mensaje">
              Mensaje
            </label>
            <input
              id="grupo-chat-mensaje"
              value={borrador}
              onChange={(evento) => setBorrador(evento.target.value)}
              maxLength={2000}
              disabled={enviandoMensaje}
              placeholder="Escribe un mensaje"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!borrador.trim() || enviandoMensaje}
              className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviandoMensaje ? "Enviando…" : "Enviar"}
            </button>
          </form>
        </div>
      )}
    </ModalDetalleRegistro>
  );
}
