/**
 * @uso        Mostrar y gestionar suscripciones registradas manualmente
 * @funciones  SuscripcionesManualesSection({ suscripciones, cargando, alAlternarImportancia, formatoMoneda, formatoFecha })
 * @datos      Lista de suscripciones manuales con nombre, categoría, fecha de cobro, monto e importancia
 * @eventos    Alternar importancia (subir/bajar) y minimizar/expandir bloque
 * @estados    colapsado (boolean)
 * @usadoPor   SuscripcionesPage
 */
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import { Card } from "../../../../components/ui";

export default function SuscripcionesManualesSection({
  suscripciones,
  cargando = false,
  alAlternarImportancia,
  formatoMoneda,
  formatoFecha,
}) {
  const [colapsado, setColapsado] = useState(false);

  return (
    <section aria-labelledby="suscripciones-manuales-titulo" className="space-y-4">
      <Card className="space-y-4 p-5">
        <button
          type="button"
          onClick={() => setColapsado((actual) => !actual)}
          aria-expanded={!colapsado}
          aria-controls="suscripciones-manuales-contenido"
          className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
        >
          <h2 id="suscripciones-manuales-titulo" className="font-display text-xl font-semibold text-bg-dark">
            Suscripciones registradas
          </h2>
          <span className="inline-flex items-center gap-2 text-sm text-slate-text">
            {suscripciones.length} manuales
            <ChevronDown
              aria-hidden="true"
              className={`h-5 w-5 transition-transform ${colapsado ? "" : "rotate-180"}`}
            />
          </span>
        </button>
        {!colapsado && (
          <div id="suscripciones-manuales-contenido" className="space-y-4">
            {cargando ? (
              <p role="status" className="text-sm text-slate-text">Cargando suscripciones registradas…</p>
            ) : suscripciones.length === 0 ? (
              <p className="text-sm text-slate-text">
                Registra suscripciones de cobros o importantes para hacerles seguimiento manual.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Suscripciones registradas manualmente">
                {suscripciones.map((item) => (
                  <li key={item.id} className="rounded-xl border border-border-line/50 bg-bg-cream/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-bg-dark">{item.nombre}</p>
                        <p className="text-sm text-slate-text">
                          {item.categoria} · Cobro: {formatoFecha.format(new Date(`${item.fechaCobro}T00:00:00`))}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.importancia === "Alta"
                            ? "bg-emerald-primary/10 text-emerald-primary"
                            : "bg-border-line/40 text-slate-text"
                        }`}
                      >
                        {item.importancia === "Alta" ? "Importante" : "Baja importancia"}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold tabular-nums text-bg-dark">{formatoMoneda.format(item.monto)}</p>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => alAlternarImportancia(item.id)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line px-3 text-xs font-medium text-bg-dark hover:border-emerald-primary/50 hover:text-emerald-primary"
                      >
                        {item.importancia === "Alta" ? (
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {item.importancia === "Alta" ? "Bajar importancia" : "Subir importancia"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
