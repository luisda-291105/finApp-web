/**
 * @uso        Filtro rápido de categorías de suscripciones Gmail
 * @funciones  FiltroCategoriasSuscripciones({ seleccionadas, cantidades, alAlternar })
 * @datos      Conteos de remitentes por categoría Gmail
 * @eventos    Alterna una o varias categorías
 * @estados    Ninguno; controlado por SuscripcionesPage
 * @usadoPor   SuscripcionesPage
 */
import { Layers3, Plus, Tag } from "lucide-react";
import { Card } from "../../../../components/ui";

const CATEGORIAS = [
  { id: "CATEGORY_PROMOTIONS", nombre: "Promociones" },
  { id: "CATEGORY_UPDATES", nombre: "Actualizaciones" },
];

/** Tarjeta compacta con selección múltiple y acceso a todas las categorías. */
export default function FiltroCategoriasSuscripciones({ seleccionadas, cantidades, total, categoriasPersonalizadas = [], alAlternar, alCrearCategoria }) {
  const todasActivas = seleccionadas.length === 0;
  return <Card className="p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <button type="button" onClick={alCrearCategoria} className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-emerald-primary/50 bg-emerald-primary/10 px-3 text-sm font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Plus className="h-4 w-4" aria-hidden="true" />Crear categoría</button>
      <div className="flex w-full min-w-0 flex-wrap gap-2 sm:flex-1" role="group" aria-label="Filtrar suscripciones por categoría">
        <button type="button" aria-pressed={todasActivas} onClick={() => alAlternar("TODAS")} className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${todasActivas ? "border-emerald-primary bg-emerald-primary text-white" : "border-border-line text-slate-text hover:border-emerald-primary/50"}`}><Layers3 className="h-4 w-4" aria-hidden="true" />Todas<span className="rounded-full bg-black/10 px-2 py-0.5 text-xs tabular-nums">{total}</span></button>
        {CATEGORIAS.map(({ id, nombre }) => {
          const activa = seleccionadas.includes(id);
          return <button key={id} type="button" aria-pressed={activa} onClick={() => alAlternar(id)} className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${activa ? "border-emerald-primary bg-emerald-primary text-white shadow-sm" : "border-border-line bg-bg-cream/40 text-bg-dark hover:border-emerald-primary hover:bg-emerald-primary/10"}`}><Tag className="h-4 w-4" aria-hidden="true" />{nombre}<span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${activa ? "bg-white/20 text-white" : "bg-bg-cream/70 text-slate-text"}`}>{cantidades[id] || 0}</span></button>;
        })}
        {categoriasPersonalizadas.map(({ nombre, cantidad }) => <button key={nombre} type="button" aria-pressed={seleccionadas.includes(nombre)} onClick={() => alAlternar(nombre)} className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${seleccionadas.includes(nombre) ? "border-emerald-primary bg-emerald-primary text-white" : "border-border-line bg-bg-cream/40 text-bg-dark hover:border-emerald-primary hover:bg-emerald-primary/10"}`}><Tag className="h-4 w-4" aria-hidden="true" />{nombre}<span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${seleccionadas.includes(nombre) ? "bg-white/20 text-white" : "bg-bg-cream/70 text-slate-text"}`}>{cantidad}</span></button>)}
      </div>
    </div>
  </Card>;
}
