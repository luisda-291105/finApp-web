import ModalDetalleRegistro from "../../../components/domain/modales/ModalDetalleRegistro";

export default function FiltrarContactosOrigenModal({ abierto, alCerrar, triggerRef, origenFiltro, opciones, alSeleccionar }) {
  return <ModalDetalleRegistro abierto={abierto} titulo="Filtrar por origen" alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-md">
    <div role="group" aria-label="Selecciona el origen de los contactos" className="space-y-2">
      {opciones.map((opcion) => {
        const seleccionado = origenFiltro === opcion.valor;
        return <button key={opcion.valor} type="button" aria-pressed={seleccionado} onClick={() => alSeleccionar(opcion.valor)} className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${seleccionado ? "border-emerald-primary bg-emerald-primary/10 text-emerald-primary" : "border-border-line bg-bg-cream text-bg-dark hover:border-emerald-primary/50"}`}><span className="min-w-0 break-all text-sm font-medium">{opcion.etiqueta}</span><span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold tabular-nums">{opcion.cantidad}</span></button>;
      })}
    </div>
  </ModalDetalleRegistro>;
}
