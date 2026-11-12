/**
 * @uso        Card única dividida de los bolsillos fijos «Ingresos» y «Gastos» del feature contabilidad
 * @funciones  BolsillosFijosCard({ fijos, resumenes, cargando, alRegistrar })
 * @datos      Recibe los bolsillos fijos y sus resúmenes; no consulta servicios
 * @eventos    alRegistrar(bolsillo): cada mitad registra un movimiento del bolsillo correspondiente
 * @estados    Ninguno
 * @usadoPor   ContabilidadPage
 */
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";
import { Card } from "../../../../components/ui";
import { formatoMoneda } from "../../utils/contabilidadHelpers";

const mitades = [
  { nombre: "Ingresos", etiqueta: "Ingresos", campo: "ingresos", tono: "text-emerald-primary", fondo: "bg-emerald-50", Icono: ArrowUpRight },
  { nombre: "Gastos", etiqueta: "Gastos", campo: "gastos", tono: "text-cat-expense", fondo: "bg-rose-50", Icono: ArrowDownLeft },
];

/** Card dividida «Ingresos | Gastos»: cada mitad registra un movimiento en su bolsillo fijo. */
export default function BolsillosFijosCard({ fijos = [], resumenes = {}, cargando = false, alRegistrar }) {
  return (
    <Card como="article" aria-label="Bolsillos fijos" className="min-h-52 w-full p-5">
      <div className="flex items-center justify-between">
        <h3 className="break-words font-display text-lg font-semibold text-bg-dark">Ingresos y gastos</h3>
        <span className="rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary">Fijos</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {mitades.map((mitad) => {
          const bolsillo = fijos.find((fijo) => fijo.nombre === mitad.nombre);
          const monto = Number(resumenes[bolsillo?.idBolsillo]?.[mitad.campo]) || 0;
          return (
            <button
              key={mitad.nombre}
              type="button"
              disabled={!bolsillo}
              onClick={(evento) => alRegistrar(bolsillo, evento)}
              aria-label={`Registrar movimiento en ${mitad.etiqueta}`}
              className="group flex min-h-24 flex-col justify-between rounded-xl border border-border-line/40 bg-bg-cream/60 p-3 text-left transition-colors hover:border-emerald-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50 sm:min-h-28"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-text">{mitad.etiqueta}</p>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${mitad.fondo} ${mitad.tono}`}>
                  <mitad.Icono className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className={`font-display text-xl font-semibold ${mitad.tono}`}>
                {cargando ? "—" : formatoMoneda.format(Number.isFinite(monto) ? monto : 0)}
              </p>
              <p className="inline-flex items-center gap-1 text-xs font-medium text-slate-text group-hover:text-emerald-primary">
                <Plus className="h-3 w-3" aria-hidden="true" />Registrar movimiento
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
