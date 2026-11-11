export default function AccionesDetalleCorreo({ idCorreo, alCerrar }) {
  return <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 pt-0.5 sm:pt-1">
    <button type="button" onClick={alCerrar} className="flex min-h-11 min-w-0 items-center justify-center rounded-lg border border-border-line px-1.5 py-2 text-center text-[11px] font-medium leading-tight text-slate-text hover:bg-bg-cream sm:px-2 sm:text-sm">Volver a los correos</button>
    <a href={`https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(idCorreo)}`} target="_blank" rel="noreferrer" className="flex min-h-11 min-w-0 items-center justify-center rounded-lg bg-emerald-primary px-1.5 py-2 text-center text-[11px] font-medium leading-tight text-bg-cream hover:bg-emerald-hover sm:px-2 sm:text-sm">Abrir correo en Gmail</a>
  </div>;
}
