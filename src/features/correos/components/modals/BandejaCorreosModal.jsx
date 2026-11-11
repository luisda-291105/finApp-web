/**
 * @uso        Bandeja modal con filtros y mensajes de una dirección
 * @funciones  BandejaCorreosModal({ fuente, mensajesFuente, ... })
 * @datos      Presenta mensajes ya consultados, categorizados por Gmail
 * @eventos    Filtrar, abrir un mensaje en Gmail y cerrar
 * @estados    Categoría de filtro
 * @usadoPor   CorreosPage
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../../components/ui";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import DetalleCorreoModal from "./DetalleCorreoModal";
import { CATEGORIAS_CORREO, coincideCategoria, fechaLegible, separarRemitente } from "../../utils/correoHelpers";

const TONOS_FILTRO = {
  TODOS: { boton: "correo-tono-todos", barra: "correo-barra-contable" },
  IMPORTANTES: { boton: "correo-tono-importante", barra: "correo-barra-importante" },
  NO_IMPORTANTES: { boton: "correo-tono-no-importante", barra: "correo-barra-no-importante" },
  CONTABLES: { boton: "correo-tono-contable", barra: "correo-barra-contable" },
  ESTUDIOS: { boton: "correo-tono-estudios", barra: "correo-barra-estudios" },
  ENTRETENIMIENTO: { boton: "correo-tono-entretenimiento", barra: "correo-barra-entretenimiento" },
  OTROS: { boton: "correo-tono-otros", barra: "correo-barra-otros" },
};

function barraParaCorreo(correo, filtro) {
  if (filtro !== "TODOS") return TONOS_FILTRO[filtro]?.barra || TONOS_FILTRO.TODOS.barra;
  if (correo.esImportante) return TONOS_FILTRO.IMPORTANTES.barra;
  if (correo.esContable) return TONOS_FILTRO.CONTABLES.barra;
  if (correo.esEstudios) return TONOS_FILTRO.ESTUDIOS.barra;
  if (correo.esEntretenimiento) return TONOS_FILTRO.ENTRETENIMIENTO.barra;
  return TONOS_FILTRO.OTROS.barra;
}

function inicialesRemitente(remitente) {
  const visible = separarRemitente(remitente).nombre;
  const nombre = visible.includes("@") ? visible.split("@")[0] : visible;
  return nombre.split(/[\s._-]+/).filter(Boolean).slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase()).join("") || "?";
}

/** Filtra y muestra cada correo en una tarjeta independiente con sus datos clave. */
export default function BandejaCorreosModal({ fuente, gmailConectado, cuentaId, cuentaGmail, mensajesFuente, cargandoMensajes, triggerRef, alCerrar }) {
  const [categoria, setCategoria] = useState("TODOS");
  const [correoDetalle, setCorreoDetalle] = useState(null);
  const detalleTriggerRef = useRef(null);
  useEffect(() => { setCategoria("TODOS"); }, [fuente?.idFuente]);
  useEffect(() => { setCorreoDetalle(null); }, [fuente?.idFuente]);
  const mensajesVisibles = mensajesFuente.filter((correo) => coincideCategoria(correo, categoria));

  return <>
    <ModalDetalleRegistro abierto={Boolean(fuente)} titulo={fuente ? `Correos de ${fuente.contenido}` : "Correos"} alCerrar={alCerrar} triggerRef={triggerRef}>
    {fuente && !gmailConectado && <div className="mb-4 space-y-3"><p className="text-sm text-slate-text">{fuente.estado === false ? "Esta fuente está inactiva hasta que conectes Gmail." : "Conecta Gmail para consultar los mensajes recibidos por esta dirección."}</p><Link to="/dashboard/configuracion" className="inline-flex min-h-10 items-center rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream">Ir a Configuración</Link></div>}
    {gmailConectado && fuente?.estado === false && <div className="mb-4 space-y-3"><p className="text-sm text-slate-text">Esta dirección está registrada, pero inactiva. Revisa su estado en Configuración → Fuentes registradas.</p><Link to="/dashboard/configuracion" className="inline-flex min-h-10 items-center rounded-lg border border-emerald-primary px-4 text-sm font-medium text-emerald-primary">Abrir Configuración</Link></div>}
    {gmailConectado && fuente && fuente.estado !== false && <Card className="min-w-0 max-w-full overflow-hidden p-0">
      <div className="flex flex-wrap gap-2 bg-transparent px-4 pb-2 pt-4" role="group" aria-label="Filtrar correos por categoría">
        {CATEGORIAS_CORREO.map((item) => {
          const seleccionada = categoria === item.id;
          const cantidad = mensajesFuente.filter((correo) => coincideCategoria(correo, item.id)).length;
          const tono = TONOS_FILTRO[item.id] || TONOS_FILTRO.TODOS;
          return <button key={item.id} type="button" aria-pressed={seleccionada} onClick={() => setCategoria(item.id)} className={`inline-flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${tono.boton} ${seleccionada ? "correo-filtro-activo" : ""}`}>
            <span>{item.etiqueta}</span><span className="correo-contador inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold leading-none tabular-nums">{cantidad}</span>
          </button>;
        })}
      </div>
      {cargandoMensajes && <p role="status" className="p-6 text-sm text-slate-text">Consultando Gmail...</p>}
      {!cargandoMensajes && mensajesVisibles.length === 0 && <div className="space-y-2 p-6 text-sm text-slate-text"><p>{categoria === "TODOS" ? `No encontramos mensajes recibidos para ${fuente.contenido} en la cuenta conectada (${cuentaGmail || "Gmail"}).` : "No hay mensajes en esta categoría para esta fuente."}</p>{categoria === "TODOS" && <p>La cuenta conectada debe recibir estos mensajes o tener configurado el reenvío/alias de esa dirección. Se incluyen mensajes archivados.</p>}</div>}
      {!cargandoMensajes && mensajesVisibles.length > 0 && <ul className="grid min-w-0 gap-3 p-3 sm:gap-4 sm:p-4">
        {mensajesVisibles.map((correo) => {
          const acento = barraParaCorreo(correo, categoria);
          const remitente = separarRemitente(correo.remitente);
          return <li key={correo.id} className={`min-w-0 max-w-full space-y-3 rounded-2xl border border-border-line/70 border-l-4 ${acento} bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5`}>
            <div className="flex min-w-0 items-start gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-sm font-semibold text-emerald-primary">{inicialesRemitente(correo.remitente)}</span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <h3 className="min-w-0 break-words text-sm font-semibold leading-snug text-bg-dark sm:text-base">{correo.asunto}</h3>
                  <time dateTime={correo.fecha} className="shrink-0 text-xs text-slate-text">{fechaLegible(correo.fecha)}</time>
                </div>
                {remitente.email
                  ? <a href={`mailto:${remitente.email}`} title={`${remitente.nombre} <${remitente.email}>`} className="block min-w-0 max-w-full break-all text-xs font-medium text-emerald-primary underline-offset-2 hover:underline">{remitente.nombre} · {remitente.email}</a>
                  : <p className="truncate text-xs font-medium text-slate-text">{remitente.nombre}</p>}
              </div>
            </div>
            <p className="line-clamp-3 break-words rounded-xl bg-bg-cream px-3 py-2.5 text-sm leading-relaxed text-slate-text [overflow-wrap:anywhere]">{correo.fragmento || "Este mensaje no incluye una vista previa."}</p>
            <div className="flex flex-wrap items-center gap-2 border-t border-border-line/40 pt-3">
              <button type="button" onClick={(evento) => { detalleTriggerRef.current = evento.currentTarget; setCorreoDetalle(correo); }} className="ml-auto inline-flex min-h-9 items-center rounded-lg border border-border-line px-3 text-xs font-semibold text-bg-dark transition-colors hover:border-emerald-primary hover:text-emerald-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" aria-label={`Ver detalles del correo: ${correo.asunto}`}>Ver detalles</button>
              <a href={`https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(correo.id)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-lg border border-emerald-primary/40 px-3 text-xs font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary hover:text-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">Abrir en Gmail</a>
            </div>
          </li>;
        })}
      </ul>}
      {!cargandoMensajes && mensajesFuente.length > 0 && <p className="border-t border-border-line/20 px-5 py-3 text-xs text-slate-text">Se muestran hasta 10 mensajes recientes para esta dirección. Las categorías se calculan en esta vista a partir del asunto, remitente, fragmento y etiquetas de Gmail.</p>}
    </Card>}
    </ModalDetalleRegistro>
    <DetalleCorreoModal abierto={Boolean(fuente && correoDetalle)} correo={correoDetalle} fuente={fuente} cuentaId={cuentaId} triggerRef={detalleTriggerRef} alCerrar={() => setCorreoDetalle(null)} />
  </>;
}
