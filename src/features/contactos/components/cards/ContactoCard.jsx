/**
 * @uso        Resumen seleccionable de un contacto
 * @funciones  ContactoCard({ contacto, alAbrir })
 * @datos      Presenta nombre, teléfono, correo y notas
 * @eventos    Click, Enter o espacio para abrir detalle
 * @estados    Ninguno
 * @usadoPor   ContactosPage
 */
import { Mail, Phone, StickyNote, UserRound } from "lucide-react";
import { formatearTelefonoColombia } from "../../../../utils/formatoTelefono";

/** Presenta el resumen del contacto y delega su apertura. */
export default function ContactoCard({ contacto, alAbrir }) {
  return (
    <article role="button" tabIndex={0} onClick={alAbrir} onKeyDown={(evento) => { if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); alAbrir(evento); } }} aria-label={`Ver contacto ${contacto.nombre || "sin nombre"}`} className="h-full cursor-pointer rounded-xl border border-border-line/30 bg-bg-cream/70 p-5 text-left transition-colors hover:border-emerald-primary/40 hover:bg-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
      <div className="flex flex-col items-center gap-2 text-center"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-primary/10 text-emerald-primary"><UserRound className="h-6 w-6" aria-hidden="true" /></span><h2 className="max-w-full truncate font-display text-lg font-semibold text-bg-dark">{contacto.nombre || "Contacto sin nombre"}</h2></div>
      {(contacto.cargo || contacto.empresa) && <p className="mt-1 text-center text-xs text-emerald-primary">{[contacto.cargo, contacto.empresa].filter(Boolean).join(" · ")}</p>}
      <dl className="mt-4 space-y-3 text-sm"><div className="flex items-start gap-2 text-slate-text"><Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><div><dt className="sr-only">Teléfono</dt><dd>{formatearTelefonoColombia(contacto.telefono) || "Sin teléfono"}</dd></div></div>
        {contacto.correo && <div className="flex items-start gap-2 text-slate-text"><Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><div><dt className="sr-only">Correo</dt><dd className="break-all">{contacto.correo}</dd></div></div>}
        <div className="flex items-start gap-2 text-slate-text"><StickyNote className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><div><dt className="sr-only">Notas</dt><dd>{contacto.notas || "Sin notas"}</dd></div></div></dl>
    </article>
  );
}
