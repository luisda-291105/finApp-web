import { GripVertical } from "lucide-react";
import { obtenerFuente, normalizarFuente } from "../../utils/inicioHelpers";
import MuestraVisual from "./MuestraVisual";

/** Tarjeta accesible que muestra la gráfica de una vista guardada y abre su detalle. */
export default function MuestraCard({ muestra, idItemDashboard = muestra.id, indice, cantidad, temaOscuro, alAbrir, alMover, alIniciarArrastre, alFinalizarArrastre, arrastrable = true, reordenable = true, mostrarBarraOrden = true, arrastrando = false, soltarSobre = false, reordenando = false }) {
  const { titulo, fuente } = muestra;
  const fuenteNormalizada = normalizarFuente(fuente);
  const fuenteDemo = obtenerFuente(fuenteNormalizada);
  const etiquetaFuente = fuenteDemo?.etiqueta || fuente;
  const nombreAccesible = `${titulo}, fuente ${etiquetaFuente}, tipo ${muestra.tipo}`;
  const translucida = indice < 3;
  const superficie = temaOscuro
    ? translucida ? "glass-surface border border-border-line/50 bg-bg-dark/90" : "border border-border-line/50 bg-bg-dark"
    : "border border-slate-300 bg-slate-100 shadow-md";

  return (
    <li
      data-muestra-id={muestra.id}
      data-dashboard-item={String(idItemDashboard)}
      className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl shadow-sm ${superficie} col-span-1 ${arrastrando ? "opacity-50" : ""} ${soltarSobre ? "ring-2 ring-dashed ring-emerald-primary" : ""}`}
    >
      {mostrarBarraOrden && <div className={`flex items-center justify-between gap-2 border-b border-border-line/20 px-3 py-1.5 ${temaOscuro ? "text-bg-cream/70" : "text-slate-text"}`}>
        <span
          draggable={arrastrable && !reordenando}
          onDragStart={(evento) => alIniciarArrastre(evento, idItemDashboard)}
          onDragEnd={alFinalizarArrastre}
          className={`cursor-grab select-none text-sm active:cursor-grabbing ${arrastrable ? "" : "invisible"}`}
          aria-label={`Arrastra ${titulo} para cambiar su posición`}
          title="Arrastra para cambiar la posición"
        ><GripVertical size={18} aria-hidden="true" /><span className="text-xs">Arrastra</span></span>
        {reordenable && <div role="group" aria-label={`Cambiar posición de ${titulo}`} className="flex items-center gap-1">
          <button type="button" disabled={indice === 0 || reordenando} onClick={() => alMover(muestra.id, -1)} aria-label="Mover antes" className="rounded px-2 py-1 text-sm hover:bg-emerald-primary/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">↑</button>
          <button type="button" disabled={indice >= cantidad - 1 || reordenando} onClick={() => alMover(muestra.id, 1)} aria-label="Mover después" className="rounded px-2 py-1 text-sm hover:bg-emerald-primary/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">↓</button>
        </div>}
      </div>}
      <article
        role="button"
        tabIndex={0}
        onClick={(evento) => alAbrir(muestra, evento)}
        onKeyDown={(evento) => {
          if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            alAbrir(muestra, evento);
          }
        }}
        className="flex h-full w-full flex-1 cursor-pointer flex-col justify-center px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-primary"
        aria-label={nombreAccesible}
      >
        <MuestraVisual muestra={muestra} temaOscuro={temaOscuro} />
      </article>
    </li>
  );
}
