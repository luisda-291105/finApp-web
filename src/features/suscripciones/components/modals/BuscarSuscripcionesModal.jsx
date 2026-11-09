/**
 * @uso        Buscar remitentes detectados en Gmail
 * @funciones  BuscarSuscripcionesModal({ abierto, busqueda, alCambiarBusqueda, resultados, ... })
 * @datos      Recibe resultados ya filtrados por búsqueda y cuenta
 * @eventos    Escribe, selecciona un resultado y cierra
 * @estados    Ninguno; control de búsqueda externo
 * @usadoPor   SuscripcionesPage
 */
import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

/** Modal de búsqueda con acceso directo al detalle de cada remitente. */
export default function BuscarSuscripcionesModal({ abierto, alCerrar, triggerRef, busqueda, alCambiarBusqueda, resultados, alSeleccionar }) {
  const campoRef = useRef(null);
  useEffect(() => {
    if (!abierto) return undefined;
    const frame = window.requestAnimationFrame(() => campoRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [abierto]);

  return <ModalDetalleRegistro abierto={abierto} titulo="Buscar suscripciones de correo" alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-lg">
    <div className="space-y-4">
      <label className="block space-y-1.5"><span className="text-sm font-semibold text-bg-dark">Remitente, dirección o cuenta</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-text" aria-hidden="true" /><input ref={campoRef} type="search" value={busqueda} onChange={(evento) => alCambiarBusqueda(evento.target.value)} placeholder="Buscar remitentes" className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream pl-10 pr-3 text-sm text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" /></span></label>
      <p role="status" className="text-sm text-slate-text">{resultados.length} {resultados.length === 1 ? "remitente encontrado" : "remitentes encontrados"}</p>
      {resultados.length ? <ul aria-label="Resultados de búsqueda de suscripciones" className="max-h-[45vh] space-y-2 overflow-y-auto">{resultados.map((item) => <li key={`${item.cuentaGmailId}:${item.id}`}><button type="button" onClick={() => alSeleccionar(item)} className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-3 text-left hover:border-emerald-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><span className="block truncate text-sm font-semibold text-bg-dark">{item.nombre}</span><span className="mt-1 block truncate text-xs text-slate-text">{item.correoRemitente || "Dirección no disponible"}</span><span className="mt-1 block truncate text-[11px] text-emerald-primary">{item.cuentaGmail}</span></button></li>)}</ul> : <p className="rounded-xl border border-border-line/60 bg-bg-cream/60 p-3 text-sm text-slate-text">No se encontraron remitentes con ese texto.</p>}
    </div>
  </ModalDetalleRegistro>;
}
