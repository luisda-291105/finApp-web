/**
 * @uso        Mostrar y gestionar suscripciones registradas manualmente
 * @funciones  SuscripcionesManualesSection({ suscripciones, cargando, alAlternarImportancia, alAbrirDetalle, formatoMoneda, formatoFecha })
 * @datos      Lista de suscripciones manuales con nombre, apodo, categoría, fecha de cobro, monto, importancia y prioridad
 * @eventos    Alternar importancia (subir/bajar), abrir detalle de la suscripción y minimizar/expandir bloque
 * @estados    colapsado (boolean)
 * @usadoPor   SuscripcionesPage
 */
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Card } from "../../../../components/ui";

export default function SuscripcionesManualesSection({
  suscripciones,
  cargando = false,
  alAlternarImportancia,
  alAbrirDetalle,
  formatoMoneda,
  formatoFecha,
}) {
  const [colapsado, setColapsado] = useState(false);

  return (
    <section
      aria-labelledby="suscripciones-manuales-titulo"
      className="space-y-4"
    >
      <Card className="space-y-4 p-5">
        <button
          type="button"
          onClick={() => setColapsado((actual) => !actual)}
          aria-expanded={!colapsado}
          aria-controls="suscripciones-manuales-contenido"
          className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
        >
          <h2
            id="suscripciones-manuales-titulo"
            className="font-display text-xl font-semibold text-bg-dark"
          >
            Suscripciones registradas
          </h2>
          <span className="inline-flex items-center gap-3 text-sm text-slate-text">
            {suscripciones.length} manuales
            <ChevronRight
              aria-hidden="true"
              className={`h-5 w-5 shrink-0 transition-transform ${colapsado ? "" : "rotate-90"}`}
            />
          </span>
        </button>
        {!colapsado && (
          <div id="suscripciones-manuales-contenido" className="space-y-4">
            {cargando ? (
              <p role="status" className="text-sm text-slate-text">
                Cargando suscripciones registradas…
              </p>
            ) : suscripciones.length === 0 ? (
              <p className="text-sm text-slate-text">
                Registra suscripciones de cobros o importantes para hacerles
                seguimiento manual.
              </p>
            ) : (
              <ul
                className="space-y-3"
                aria-label="Suscripciones registradas manualmente"
              >
                {suscripciones.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-line/50 bg-bg-cream/60 p-4 text-left cursor-pointer"
                    onClick={() => alAbrirDetalle?.(item)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className="truncate font-semibold text-bg-dark"
                          title={item.apodo ? item.nombre : undefined}
                        >
                          {item.apodo || item.nombre}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.importancia === "Alta"
                              ? "bg-emerald-primary/10 text-emerald-primary"
                              : item.importancia === "Media"
                                ? "bg-amber-500/10 text-amber-800"
                                : "bg-border-line/40 text-slate-text"
                          }`}
                        >
                          {item.importancia === "Alta"
                            ? "Importante"
                            : item.importancia === "Media"
                              ? "Media importancia"
                              : "Baja importancia"}
                        </span>
                        {item.prioridad && item.prioridad !== "Media" && (
                          <span className="shrink-0 rounded-full bg-border-line/40 px-2.5 py-1 text-xs font-semibold text-slate-text">
                            Prioridad {item.prioridad}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-text">
                        {item.categoria} · Cobro:{" "}
                        {formatoFecha.format(
                          new Date(`${item.fechaCobro}T00:00:00`),
                        )}
                      </p>
                      <p className="mt-1 font-semibold tabular-nums text-bg-dark">
                        {formatoMoneda.format(item.monto)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(evento) => {
                        evento.stopPropagation();
                        alAlternarImportancia(item.id);
                      }}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line px-3 text-xs font-medium text-bg-dark hover:border-emerald-primary/50 hover:text-emerald-primary"
                    >
                      {item.importancia === "Baja" ? (
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {item.importancia === "Baja"
                        ? "Subir importancia"
                        : "Bajar importancia"}
                    </button>
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
