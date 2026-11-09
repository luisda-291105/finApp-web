import { obtenerFuente, SEGMENTOS_CONTABLES, TIPOS_VISUALIZACION, normalizarFuente } from "../../utils/inicioHelpers";
import MuestraVisual from "./MuestraVisual";

/** Tarjeta accesible que muestra una vista guardada y abre su detalle. */
export default function MuestraCard({ muestra, indice, temaOscuro, alAbrir }) {
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
    : translucida ? "glass-surface border border-border-line/30 bg-bg-cream/95" : "border border-border-line/20 bg-bg-cream/90";
  const badge = temaOscuro ? "bg-mint-accent/15 text-bg-cream" : "bg-emerald-primary/10 text-slate-text";

  return (
    <li className={`h-full overflow-hidden rounded-2xl shadow-sm ${superficie}`}>
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
        className="grid h-full w-full cursor-pointer grid-rows-[auto_minmax(7rem,1fr)_auto] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-primary"
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
          <div className="min-w-0"><p className={`text-[0.65rem] font-medium uppercase tracking-wide ${temaOscuro ? "text-bg-cream/70" : "text-slate-text"}`}>Fuente</p><p className={`break-words text-sm ${temaOscuro ? "text-bg-cream" : "text-bg-dark"}`}>{etiquetaFuente}{segmento ? ` · ${segmento.etiqueta}` : ""}{cuentaCorreo ? ` · ${cuentaCorreo}` : ""}</p></div>
        </footer>
      </article>
    </li>
  );
}
