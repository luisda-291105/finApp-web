/**
 * @uso        Resumen seleccionable de un grupo
 * @funciones  GrupoCard({ grupo, alAbrir })
 * @datos      Presenta nombre, descripción y fuentes vinculadas
 * @eventos    Click, Enter o espacio para abrir el grupo
 * @estados    Ninguno
 * @usadoPor   GruposPage
 */
import { MessageCircle, WalletCards } from "lucide-react";
import { Card } from "../../../../components/ui";

/** Presenta un resumen del grupo y delega su apertura a la página. */
export default function GrupoCard({ grupo, alAbrir }) {
  return (
    <Card role="button" tabIndex={0} aria-label={`Abrir grupo ${grupo.nombre}`} onClick={alAbrir} onKeyDown={(evento) => {
      if (evento.target === evento.currentTarget && (evento.key === "Enter" || evento.key === " ")) {
        evento.preventDefault();
        alAbrir(evento);
      }
    }} className="cursor-pointer border border-border-line/40 p-5 transition hover:border-emerald-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="font-display text-lg font-semibold text-bg-dark">{grupo.nombre}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-text">{grupo.descripcion}</p></div>
        <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-emerald-primary" aria-hidden="true" />
      </div>
      <div className="mt-4 border-t border-border-line/30 pt-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-text"><WalletCards className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Fuentes · {grupo.fuentes.length}</div>
        {grupo.fuentes.length ? <ul className="space-y-1.5">{grupo.fuentes.slice(0, 2).map((fuente) => <li key={fuente.idFuente} className="truncate text-sm text-bg-dark">{fuente.contenido}</li>)}</ul> : <p className="text-sm text-slate-text">Sin fuentes vinculadas</p>}
        {grupo.fuentes.length > 2 && <p className="mt-1 text-xs text-emerald-primary">y {grupo.fuentes.length - 2} más</p>}
      </div>
      <p className="mt-4 text-xs font-medium text-emerald-primary">Abrir fuentes y chat</p>
    </Card>
  );
}
