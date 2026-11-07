/**
 * @uso        Bandeja modal con filtros y mensajes de una dirección
 * @funciones  BandejaCorreosModal({ fuente, mensajesFuente, ... })
 * @datos      Presenta mensajes ya consultados, categorizados por Gmail
 * @eventos    Filtrar, abrir un mensaje en Gmail y cerrar
 * @estados    Categoría de filtro
 * @usadoPor   CorreosPage
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../../components/ui/Card";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { CATEGORIAS_CORREO, coincideCategoria, fechaLegible } from "../../utils/correoHelpers";

/** Filtra y muestra los mensajes de la fuente seleccionada. */
export default function BandejaCorreosModal({ fuente, tokenGmail, cuentaGmail, mensajesFuente, cargandoMensajes, triggerRef, alCerrar }) {
  const [categoria, setCategoria] = useState("TODOS");
  useEffect(() => { setCategoria("TODOS"); }, [fuente?.idFuente]);
  const mensajesVisibles = mensajesFuente.filter((correo) => coincideCategoria(correo, categoria));
  return <ModalDetalleRegistro abierto={Boolean(fuente)} titulo={fuente ? `Correos de ${fuente.contenido}` : "Correos"} alCerrar={alCerrar} triggerRef={triggerRef}>
    {fuente && !tokenGmail && <div className="mb-4 space-y-3"><p className="text-sm text-slate-text">{fuente.estado === false ? "Esta fuente está inactiva hasta que conectes Gmail." : "Conecta Gmail para consultar los mensajes recibidos por esta dirección."}</p><Link to="/dashboard/configuracion" className="inline-flex min-h-10 items-center rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream">Ir a Configuración</Link></div>}
    {tokenGmail && fuente?.estado === false && <div className="mb-4 space-y-3"><p className="text-sm text-slate-text">Esta dirección está registrada, pero inactiva. Revisa su estado en Configuración → Fuentes registradas.</p><Link to="/dashboard/configuracion" className="inline-flex min-h-10 items-center rounded-lg border border-emerald-primary px-4 text-sm font-medium text-emerald-primary">Abrir Configuración</Link></div>}
    {tokenGmail && fuente && fuente.estado !== false && <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap gap-2 border-b border-border-line/30 p-4" role="group" aria-label="Filtrar correos por categoría">{CATEGORIAS_CORREO.map((item) => <button key={item.id} type="button" aria-pressed={categoria === item.id} onClick={() => setCategoria(item.id)} className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${categoria === item.id ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark"}`}>{item.etiqueta} ({mensajesFuente.filter((correo) => coincideCategoria(correo, item.id)).length})</button>)}</div>
      {cargandoMensajes && <p role="status" className="p-6 text-sm text-slate-text">Consultando Gmail...</p>}
      {!cargandoMensajes && mensajesVisibles.length === 0 && <div className="space-y-2 p-6 text-sm text-slate-text"><p>{categoria === "TODOS" ? `No encontramos mensajes recibidos para ${fuente.contenido} en la cuenta conectada (${cuentaGmail || "Gmail"}).` : "No hay mensajes en esta categoría para esta fuente."}</p>{categoria === "TODOS" && <p>La cuenta conectada debe recibir estos mensajes o tener configurado el reenvío/alias de esa dirección. Se incluyen mensajes archivados.</p>}</div>}
      {!cargandoMensajes && mensajesVisibles.length > 0 && <ul className="divide-y divide-border-line/20">{mensajesVisibles.map((correo) => <li key={correo.id} className="space-y-2 p-4 sm:p-5"><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold text-bg-dark">{correo.asunto}</p><p className="truncate text-xs text-slate-text">{correo.remitente}</p></div><time className="shrink-0 text-xs text-slate-text">{fechaLegible(correo.fecha)}</time></div><p className="text-sm leading-relaxed text-slate-text">{correo.fragmento}</p><div className="flex flex-wrap gap-1.5">{correo.esImportante && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Importante</span>}{correo.esContable && <span className="rounded-full bg-emerald-primary/10 px-2 py-0.5 text-xs font-medium text-emerald-primary">Contable</span>}{correo.esEntretenimiento && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900">Entretenimiento</span>}{!correo.esImportante && <span className="rounded-full bg-border-line/20 px-2 py-0.5 text-xs font-medium text-slate-text">No importante</span>}<a href={`https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(correo.id)}`} target="_blank" rel="noreferrer" className="ml-auto text-xs font-medium text-emerald-primary underline-offset-2 hover:underline">Abrir en Gmail</a></div></li>)}</ul>}
      {!cargandoMensajes && mensajesFuente.length > 0 && <p className="border-t border-border-line/20 px-5 py-3 text-xs text-slate-text">Se muestran hasta 50 mensajes recientes para esta dirección. Las categorías se calculan en esta vista a partir del asunto, remitente, fragmento y etiquetas de Gmail.</p>}
    </Card>}
  </ModalDetalleRegistro>;
}
