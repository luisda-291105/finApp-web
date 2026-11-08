import { useEffect } from "react";
import { Search, X } from "lucide-react";
import ModalDetalleRegistro from "../../../components/domain/modales/ModalDetalleRegistro";
import { formatearTelefonoColombia } from "../../../utils/formatoTelefono";
import { obtenerCorreoOrigenContacto, obtenerOrigenContacto } from "../utils/origenContacto";

export default function BuscarContactosModal({ abierto, alCerrar, triggerRef, inputRef, busqueda, alCambiarBusqueda, contactos, cuentasGmail, alSeleccionar }) {
  useEffect(() => {
    if (!abierto) return undefined;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [abierto, inputRef]);

  return <ModalDetalleRegistro abierto={abierto} titulo="Buscar contactos" alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-md">
    <div className="space-y-4">
      <label className="block space-y-1.5"><span className="text-sm font-semibold text-bg-dark">Nombre, correo, teléfono, cargo o empresa</span><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-text" aria-hidden="true" /><input ref={inputRef} type="search" value={busqueda} onChange={(evento) => alCambiarBusqueda(evento.target.value)} placeholder="Buscar contactos" aria-label="Buscar contactos por nombre, correo, teléfono, cargo o empresa" className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream pl-10 pr-10 text-sm text-bg-dark placeholder:text-slate-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" />{busqueda && <button type="button" onClick={() => alCambiarBusqueda("")} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-text hover:text-bg-dark"><X className="h-4 w-4" aria-hidden="true" /></button>}</div></label>
      <p role="status" className="text-sm text-slate-text">{contactos.length} {contactos.length === 1 ? "contacto encontrado" : "contactos encontrados"}</p>
      {contactos.length > 0 ? <ul aria-label="Resultados de búsqueda" className="max-h-[42vh] space-y-2 overflow-y-auto">
        {contactos.map((contacto) => <li key={contacto.idContacto}><button type="button" onClick={() => alSeleccionar(contacto)} className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-3 text-left transition-colors hover:border-emerald-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><span className="block truncate text-sm font-semibold text-bg-dark">{contacto.nombre || "Contacto sin nombre"}</span><span className="mt-1 block truncate text-xs text-slate-text">{contacto.correo || formatearTelefonoColombia(contacto.telefono) || "Sin correo ni teléfono"}</span><span className="mt-1 block truncate text-[11px] text-emerald-primary">{obtenerCorreoOrigenContacto(contacto, cuentasGmail) || obtenerOrigenContacto(contacto)}</span></button></li>)}
      </ul> : <p className="rounded-xl border border-border-line/60 bg-bg-cream/60 p-3 text-sm text-slate-text">No hay contactos que coincidan con la búsqueda.</p>}
    </div>
  </ModalDetalleRegistro>;
}
