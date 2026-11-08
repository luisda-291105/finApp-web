import { Repeat } from "lucide-react";
import { Card } from "../../../components/ui";
import useSuscripciones from "../hooks/useSuscripciones";
import ResumenSuscripciones from "../components/cards/ResumenSuscripciones";
import SuscripcionCard from "../components/cards/SuscripcionCard";
import DetalleSuscripcionModal from "../components/modals/DetalleSuscripcionModal";

/** Vista principal de suscripciones, compone el resumen, filtros y lista. */
export default function SuscripcionesPage() {
  const {
    suscripciones, filtro, setFiltro, visibles, filtros, alternarEstado, abrirDetalle,
    suscripcionDetalle, setSuscripcionDetalle, detalleTriggerRef, ...resumen
  } = useSuscripciones();

  return (
    <section aria-labelledby="suscripciones-titulo" className="space-y-6 pt-6 pb-12">
      <header>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="suscripciones-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">Suscripciones</h1>
        <p className="mt-1 text-sm text-slate-text">Revisa tus cobros recurrentes y el peso que tienen en tu presupuesto mensual.</p>
      </header>

      <p role="note" className="rounded-xl border border-border-line/60 bg-bg-cream/70 p-3 text-sm text-slate-text">Datos de demostración. Pausar o activar una suscripción no se guarda ni se envía al backend.</p>
      <ResumenSuscripciones resumen={resumen} totalSuscripciones={suscripciones.length} />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar suscripciones por estado">
        {filtros.map(({ valor, etiqueta }) => <button key={valor} type="button" aria-pressed={filtro === valor} onClick={() => setFiltro(valor)} className={`min-h-9 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${filtro === valor ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark"}`}>{etiqueta}</button>)}
      </div>

      <section aria-labelledby="lista-suscripciones-titulo" className="space-y-4">
        <h2 id="lista-suscripciones-titulo" className="font-display text-xl font-semibold text-bg-dark">Mis suscripciones</h2>
        {visibles.length === 0 ? <Card className="p-8 text-center"><Repeat className="mx-auto h-8 w-8 text-emerald-primary" aria-hidden="true" /><p className="mt-3 font-medium text-bg-dark">Sin suscripciones en este filtro</p><p className="mt-1 text-sm text-slate-text">Cambia el filtro para ver las demás.</p></Card> : <ul aria-label="Suscripciones" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibles.map((suscripcion) => <SuscripcionCard key={suscripcion.id} suscripcion={suscripcion} onAlternarEstado={alternarEstado} onVerDetalle={(evento) => abrirDetalle(suscripcion, evento)} />)}</ul>}
      </section>

      <DetalleSuscripcionModal suscripcion={suscripcionDetalle} triggerRef={detalleTriggerRef} onCerrar={() => setSuscripcionDetalle(null)} />
    </section>
  );
}
