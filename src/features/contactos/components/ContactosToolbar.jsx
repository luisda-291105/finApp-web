import { Plus, RefreshCw, Search } from "lucide-react";

function IconoFiltrar() {
  return <svg aria-hidden="true" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <rect width="320" height="32" x="96" y="197.333" />
    <rect width="176" height="32" x="168" y="298.667" />
    <rect width="80" height="32" x="216" y="400" />
    <rect width="416" height="32" x="48" y="96" />
  </svg>;
}

export default function ContactosToolbar({ busqueda, alCambiarBusqueda, origenFiltro, alBuscar, alFiltrarOrigen, alActualizar, alCrear, refs }) {
  const botonOrigen = <button ref={refs.origen} type="button" onClick={alFiltrarOrigen} aria-label={origenFiltro === "TODOS" ? "Filtrar contactos por origen" : `Origen seleccionado: ${origenFiltro}`} title={origenFiltro === "TODOS" ? "Filtrar por origen" : `Origen: ${origenFiltro}`} aria-pressed={origenFiltro !== "TODOS"} className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${origenFiltro === "TODOS" ? "border-border-line bg-bg-cream text-bg-dark hover:border-emerald-primary" : "border-emerald-primary bg-emerald-primary/10 text-emerald-primary"}`}><IconoFiltrar /></button>;

  return <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div><p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p><h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Contactos</h1><p className="mt-1 text-sm text-slate-text">Organiza tus contactos relacionados con finanzas.</p></div>
    <div className="grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
      <label className="relative hidden min-w-0 sm:block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-text" aria-hidden="true" /><input type="search" value={busqueda} onChange={(evento) => alCambiarBusqueda(evento.target.value)} placeholder="Buscar contactos" aria-label="Buscar contactos por nombre, correo, teléfono, cargo o empresa" className="min-h-10 w-56 rounded-lg border border-border-line bg-bg-cream pl-9 pr-3 text-sm text-bg-dark placeholder:text-slate-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" /></label>
      <button ref={refs.busqueda} type="button" onClick={alBuscar} aria-label="Buscar contactos" title="Buscar contactos" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border-line bg-bg-cream text-bg-dark hover:border-emerald-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent sm:hidden"><Search className="h-5 w-5" aria-hidden="true" /></button>
      {botonOrigen}
      <button ref={refs.actualizar} type="button" onClick={alActualizar} aria-label="Actualizar contactos desde Google" title="Actualizar contactos desde Google" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-primary/40 px-3 text-sm font-medium text-emerald-primary transition-colors hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent sm:px-4"><RefreshCw className="h-5 w-5" aria-hidden="true" /><span className="hidden sm:inline">Actualizar</span></button>
      <button ref={refs.crear} type="button" onClick={alCrear} aria-label="Agregar nuevo contacto" title="Nuevo contacto" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-3 text-sm font-medium text-bg-cream shadow-md transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent sm:px-4"><Plus className="h-5 w-5" aria-hidden="true" /><span className="hidden sm:inline">Nuevo contacto</span></button>
    </div>
  </header>;
}
