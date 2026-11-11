import { GripVertical } from "lucide-react";
import { obtenerFuente, SEGMENTOS_CONTABLES, TIPOS_VISUALIZACION, normalizarFuente } from "../../utils/inicioHelpers";
import MuestraVisual from "./MuestraVisual";

/** Tarjeta accesible que muestra una vista guardada y abre su detalle. */
export default function MuestraCard({ muestra, idItemDashboard = muestra.id, indice, cantidad, temaOscuro, alAbrir, alMover, alIniciarArrastre, alFinalizarArrastre, arrastrable = true, reordenable = true, mostrarBarraOrden = true, arrastrando = false, soltarSobre = false, reordenando = false }) {
  const { titulo, fuente, tipo } = muestra;
  const fuenteNormalizada = normalizarFuente(fuente);
  const fuenteDemo = obtenerFuente(fuenteNormalizada);
  const tipoValido = TIPOS_VISUALIZACION.some((opcion) => opcion.valor === tipo);
  const etiquetaFuente = fuenteDemo?.etiqueta || fuente;
  const segmento = fuenteNormalizada === "contabilidad" ? SEGMENTOS_CONTABLES.find((item) => item.valor === (muestra.segmentoContable || "todos")) : null;
  const etiquetaTipo = TIPOS_VISUALIZACION.find((opcion) => opcion.valor === tipo)?.etiqueta || tipo;
  const cuentaCorreo = fuenteNormalizada === "correo" ? (muestra.cuentaCorreoEtiqueta || "") : "";
  const nombreAccesible = `${titulo}, fuente ${etiquetaFuente}${segmento ? `, ${segmento.etiqueta}` : ""}${cuentaCorreo ? `, ${cuentaCorreo}` : ""}, tipo ${tipo}`;
  const translucida = indice < 3;
  const superficie = temaOscuro
    ? translucida ? "glass-surface border border-border-line/50 bg-bg-dark/90" : "border border-border-line/50 bg-bg-dark"
    : "border border-slate-300 bg-slate-100 shadow-md";
  const badge = temaOscuro ? "bg-mint-accent/15 text-bg-cream" : "bg-emerald-primary/10 text-slate-text";

  return (
    <li
      data-muestra-id={muestra.id}
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
        className="grid h-full w-full flex-1 cursor-pointer grid-rows-[auto_minmax(7rem,1fr)_auto] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-primary"
        aria-label={nombreAccesible}
      >
        <header className="flex min-w-0 items-center justify-between gap-3 border-b border-border-line/20 px-4 py-3">
          <h2 className={`min-w-0 break-words font-display font-semibold ${temaOscuro ? "text-bg-cream" : "text-bg-dark"}`}>{titulo}</h2>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}>{etiquetaTipo}</span>
        </header>
        <section aria-label="Datos actuales" className="flex min-w-0 flex-col justify-center gap-2 px-4 py-4">
          <MuestraVisual muestra={muestra} temaOscuro={temaOscuro} />
        </section>
        <footer className="border-t border-border-line/20 px-4 py-3">
          <div className="min-w-0"><p className={`text-[0.65rem] font-medium uppercase tracking-wide ${temaOscuro ? "text-bg-cream/70" : "text-slate-text"}`}>Fuente</p><p className={`break-words text-sm ${temaOscuro ? "text-bg-cream" : "text-bg-dark"}`}>{`${etiquetaFuente}${segmento ? ` · ${segmento.etiqueta}` : ""}${cuentaCorreo ? ` · ${cuentaCorreo}` : ""}`}</p></div>
        </footer>
      </article>
    </li>
  );
}
