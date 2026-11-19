/**
 * @uso        Modal de detalle y chat del grupo (fuentes vinculadas y asistente IA por Telegram)
 * @funciones  GrupoDetalleModal({ grupo, abierto, alCerrar, triggerRef, alGrupoActualizado })
 * @datos      Gestiona los datos del grupo mediante servicios de dominio
 * @eventos    Cambios de pestaña, desvincular fuente, enviar mensaje y cierre
 * @estados    Estado local del detalle
 * @usadoPor   GruposPage
 */
import { useEffect, useMemo, useState } from "react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";
import {
  desvincularFuenteDeGrupo,
} from "../../services/gruposService";
import {
  enviarMensajeTelegram,
  obtenerEstadoTelegram,
  obtenerMensajesTelegram,
} from "../../../../services/telegramServicio";
import { AlertaGlobal } from "../../../../features/error";

const PESTANAS = ["Fuentes", "Asistente IA Telegram"];

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

/** Presenta los detalles y las fuentes vinculadas al grupo. */
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
  const [estadoTelegram, setEstadoTelegram] = useState(null);
  const [cargandoTelegram, setCargandoTelegram] = useState(false);
  const [enviandoTelegram, setEnviandoTelegram] = useState(false);
  const [borrador, setBorrador] = useState("");
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const fuentesVinculadas = useMemo(
    () => grupo?.fuentes || [],
    [grupo?.fuentes],
  );

  useEffect(() => {
    if (!abierto) return undefined;
    setPestana("Fuentes");
    setError("");
    setAviso("");
    return undefined;
  }, [abierto, grupo?.id]);

  useEffect(() => {
    if (
      !abierto ||
      pestana !== "Asistente IA Telegram" ||
      !usuario?.idUsuario
    )
      return undefined;
    let vigente = true;
    let consultando = false;
    const consultar = async () => {
      if (consultando) return;
      consultando = true;
      try {
        const [estado, conversacion] = await Promise.all([
          obtenerEstadoTelegram(),
          obtenerMensajesTelegram(),
        ]);
        if (!vigente) return;
        setEstadoTelegram(datosRespuesta(estado));
        setMensajes(listaRespuesta(conversacion));
        setError("");
      } catch (fallo) {
        if (vigente)
          setError(
            fallo?.message || "No se pudo consultar el chat de Telegram.",
          );
      } finally {
        consultando = false;
        if (vigente) setCargandoTelegram(false);
      }
    };
    setCargandoTelegram(true);
    consultar();
    const intervalo = window.setInterval(consultar, 3000);
    return () => {
      vigente = false;
      window.clearInterval(intervalo);
    };
  }, [abierto, pestana, usuario?.idUsuario]);

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
    if (!texto || enviandoTelegram || !estadoTelegram?.conectado) return;
    setEnviandoTelegram(true);
    setError("");
    setAviso("");
    try {
      await enviarMensajeTelegram(texto, grupo.nombre);
      setBorrador("");
      setAviso("Mensaje enviado al asistente por Telegram.");
      const respuesta = await obtenerMensajesTelegram();
      setMensajes(listaRespuesta(respuesta));
    } catch (fallo) {
      setError(fallo?.message || "No se pudo enviar el mensaje por Telegram.");
    } finally {
      setEnviandoTelegram(false);
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
          {estadoTelegram && !estadoTelegram.configurado && (
            <p
              role="alert"
              className="rounded-xl border border-amber-300/60 bg-amber-100/70 p-3 text-sm text-amber-900"
            >
              Telegram no está configurado en el backend. Revisa
              TELEGRAM_BOT_TOKEN y NOMBRE_BOT_TELEGRAM.
            </p>
          )}
          {estadoTelegram?.errorRecepcion && (
            <p
              role="alert"
              className="rounded-xl border border-amber-300/60 bg-amber-100/70 p-3 text-sm text-amber-900"
            >
              {estadoTelegram.errorRecepcion}
            </p>
          )}
          <section
            aria-label="Mensajes con el asistente de IA por Telegram"
            aria-busy={cargandoTelegram}
            className="max-h-72 min-h-36 space-y-2 overflow-y-auto rounded-2xl border border-border-line/50 bg-bg-cream/60 p-4"
          >
            {mensajes.length ? (
              mensajes.map((mensaje) => (
                <article
                  key={mensaje.id}
                  className={`w-fit max-w-[90%] break-words rounded-xl px-3 py-2 text-sm ${mensaje.rol === "assistant" ? "bg-white text-bg-dark" : "ml-auto bg-emerald-primary text-bg-cream"}`}
                >
                  {mensaje.grupo && (
                    <p
                      className={`mb-1 text-[11px] font-semibold ${mensaje.rol === "assistant" ? "text-emerald-primary" : "text-bg-cream/80"}`}
                    >
                      {mensaje.grupo}
                    </p>
                  )}
                  <p>{mensaje.texto}</p>
                  <time
                    className={`mt-1 block text-right text-[10px] ${mensaje.rol === "assistant" ? "text-slate-text" : "text-bg-cream/70"}`}
                    dateTime={mensaje.fecha}
                  >
                    {new Date(mensaje.fecha).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-text">
                {cargandoTelegram
                  ? "Conectando con Telegram…"
                  : estadoTelegram?.conectado
                    ? "Aún no hay mensajes en esta conversación."
                    : "Vincula Telegram en Configuración para hablar con el asistente de IA de FinApp."}
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
              maxLength={3500}
              disabled={!estadoTelegram?.conectado || enviandoTelegram}
              placeholder={
                estadoTelegram?.conectado
                  ? "Escribe un mensaje"
                  : "Vincula Telegram en Configuración para escribir"
              }
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={
                !estadoTelegram?.conectado ||
                !borrador.trim() ||
                enviandoTelegram
              }
              className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviandoTelegram ? "Enviando…" : "Enviar"}
            </button>
          </form>
        </div>
      )}
    </ModalDetalleRegistro>
  );
}
