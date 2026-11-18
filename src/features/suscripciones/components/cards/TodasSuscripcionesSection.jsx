/**
 * @uso        Agrupar todas las suscripciones (Gmail, manuales y cobros detectados) en una sola cuadrícula con divisiones por prioridad
 * @funciones  TodasSuscripcionesSection({ suscripcionesGmail, cargandoGmail, cantidadCuentas, manuales, cargandoManuales, recurrentes, cargandoRecurrentes, filtrosActivos, alLimpiarFiltros, alAbrirDetalle, formatoMoneda, formatoFecha })
 * @datos      Items de tres fuentes; los de Gmail ya vienen filtrados por búsqueda y filtros; se dividen en bloques Alta/Media/Baja/Sin prioridad y dentro de cada bloque se ordenan por importancia (Alta primero) con orden estable
 * @eventos    Abrir detalle (gmail/manual), limpiar filtros y minimizar/expandir cada bloque de prioridad
 * @estados    bloquesColapsados (Set<string>): bloques minimizados, persistido en localStorage bajo `finapp:suscripciones:bloques-colapsados`
 * @usadoPor   SuscripcionesPage
 */
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../../../components/ui";
import SuscripcionUnificadaCard from "./SuscripcionUnificadaCard";

/** Rango de orden por nivel (prioridad o importancia); sin valor reconocido («No definido»), queda al final. */
function rangoNivel(valor) {
  const normal = String(valor ?? "")
    .trim()
    .toLocaleLowerCase();
  if (normal === "alta" || normal === "alto" || normal === "importante")
    return 0;
  if (normal === "media" || normal === "medio") return 1;
  if (normal === "baja" || normal === "bajo") return 2;
  return 3;
}

const GRUPOS_PRIORIDAD = [
  { valor: "Alta", etiqueta: "Prioridad Alta", rango: 0 },
  { valor: "Media", etiqueta: "Prioridad Media", rango: 1 },
  { valor: "Baja", etiqueta: "Prioridad Baja", rango: 2 },
  { valor: "SinPrioridad", etiqueta: "Sin prioridad", rango: 3 },
];

/** Clave de localStorage con los bloques de prioridad minimizados (persiste entre sesiones). */
const CLAVE_BLOQUES_COLAPSADOS = "finapp:suscripciones:bloques-colapsados";
const VALORES_PRIORIDAD = GRUPOS_PRIORIDAD.map((grupo) => grupo.valor);

function leerBloquesColapsados() {
  try {
    const crudo = window.localStorage.getItem(CLAVE_BLOQUES_COLAPSADOS);
    const datos = crudo ? JSON.parse(crudo) : [];
    return new Set(
      Array.isArray(datos)
        ? datos.filter((valor) => VALORES_PRIORIDAD.includes(valor))
        : [],
    );
  } catch {
    return new Set();
  }
}

/** Sección única con estados de carga, estado vacío y la cuadrícula combinada dividida por prioridad. */
export default function TodasSuscripcionesSection({
  suscripcionesGmail,
  cargandoGmail,
  cantidadCuentas,
  manuales,
  cargandoManuales,
  recurrentes,
  cargandoRecurrentes,
  filtrosActivos,
  alLimpiarFiltros,
  alAbrirDetalle,
  formatoMoneda,
  formatoFecha,
}) {
  const cargando = cargandoGmail || cargandoManuales || cargandoRecurrentes;
  const [bloquesColapsados, setBloquesColapsados] = useState(
    leerBloquesColapsados,
  );

  // Un cobro tomados de una suscripción ya se muestra en su propia tarjeta.
  const cobrosSinDuplicar = useMemo(() => {
    const yaListadas = new Set([
      ...manuales.map((item) => String(item.id || "")),
      ...suscripcionesGmail.map((item) =>
        String(item.idSuscripcion || item.id || ""),
      ),
    ]);
    return recurrentes.filter((item) => !yaListadas.has(String(item.id || "")));
  }, [manuales, suscripcionesGmail, recurrentes]);

  const alternarBloque = (valor) => {
    setBloquesColapsados((actuales) => {
      const siguientes = new Set(actuales);
      if (siguientes.has(valor)) siguientes.delete(valor);
      else siguientes.add(valor);
      try {
        window.localStorage.setItem(
          CLAVE_BLOQUES_COLAPSADOS,
          JSON.stringify([...siguientes]),
        );
      } catch {
        // La preferencia no se pudo guardar; el estado en memoria se mantiene igual.
      }
      return siguientes;
    });
  };
  // `fuente` distingue el origen sin pisar el campo `origen` del backend (p. ej. "MANUAL").
  const grupos = useMemo(() => {
    const todos = [
      ...manuales.map((item) => ({
        ...item,
        fuente: "manual",
        _prioridad: item.prioridad || "",
        _importancia: item.importancia || "",
      })),
      ...suscripcionesGmail.map((item) => ({
        ...item,
        fuente: "gmail",
        _prioridad: item.prioridad || "",
        _importancia: item.importancia || "",
      })),
      ...cobrosSinDuplicar.map((item) => ({
        ...item,
        fuente: "recurrente",
        prioridad: item.prioridad || "",
        _prioridad: item.prioridad || "",
        _importancia: item.importancia || "",
      })),
    ];
    // Bloques por prioridad; dentro de cada bloque, orden estable por importancia (Alta primero).
    return GRUPOS_PRIORIDAD.map((grupo) => ({
      ...grupo,
      items: todos
        .filter((item) => rangoNivel(item._prioridad) === grupo.rango)
        .sort(
          (a, b) => rangoNivel(a._importancia) - rangoNivel(b._importancia),
        ),
    })).filter((grupo) => grupo.items.length > 0);
  }, [manuales, suscripcionesGmail, cobrosSinDuplicar]);

  const total =
    suscripcionesGmail.length + manuales.length + cobrosSinDuplicar.length;

  return (
    <section aria-labelledby="todas-suscripciones-titulo" className="space-y-4">
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="todas-suscripciones-titulo"
            className="font-display text-xl font-semibold text-bg-dark"
          >
            Todas las suscripciones
          </h2>
          <span className="inline-flex items-center gap-2 text-sm text-slate-text">
            {total} en total
          </span>
        </div>

        {cantidadCuentas === 0 && (
          <p className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-3 text-sm text-slate-text">
            Conecta Gmail desde{" "}
            <Link
              to="/dashboard/configuracion"
              className="font-semibold text-emerald-primary underline"
            >
              Configuración → Fuentes
            </Link>{" "}
            para consultar las suscripciones.
          </p>
        )}
        {cargandoGmail && (
          <p role="status" className="text-sm text-slate-text">
            Consultando las suscripciones recientes por cuenta Gmail…
          </p>
        )}
        {cargandoManuales && (
          <p role="status" className="text-sm text-slate-text">
            Cargando suscripciones registradas…
          </p>
        )}

        {total > 0 && (
          <ul
            aria-label="Todas las suscripciones"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {grupos.flatMap((grupo) => {
              const colapsado = bloquesColapsados.has(grupo.valor);
              return [
                <li
                  key={`divisor-${grupo.valor}`}
                  role="presentation"
                  className="col-span-full pt-2 first:pt-0"
                >
                  <button
                    type="button"
                    onClick={() => alternarBloque(grupo.valor)}
                    aria-expanded={!colapsado}
                    aria-label={`${colapsado ? "Expandir" : "Minimizar"} bloque ${grupo.etiqueta}`}
                    className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary rounded-lg"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-text">
                      {grupo.etiqueta}
                    </span>
                    <span className="rounded-full bg-border-line/40 px-2 py-0.5 text-[10px] font-semibold text-slate-text">
                      {grupo.items.length}
                    </span>
                    <span className="h-px flex-1 bg-border-line/50" />
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 text-slate-text transition-transform ${colapsado ? "-rotate-90" : ""}`}
                    />
                  </button>
                </li>,
                ...(!colapsado
                  ? grupo.items.map((item) => (
                      <SuscripcionUnificadaCard
                        key={`${item.fuente}:${item.cuentaGmailId || ""}:${item.id || item.fechaCobro || ""}:${item.correoRemitente || ""}`}
                        item={item}
                        alAbrir={(evento) => alAbrirDetalle?.(item, evento)}
                        formatoMoneda={formatoMoneda}
                        formatoFecha={formatoFecha}
                      />
                    ))
                  : []),
              ];
            })}
          </ul>
        )}

        {total === 0 &&
          !cargando &&
          (filtrosActivos ? (
            <div className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-4 text-sm text-slate-text">
              <p>
                No hay suscripciones que coincidan con la búsqueda y los filtros
                seleccionados.
              </p>
              <button
                type="button"
                onClick={alLimpiarFiltros}
                className="mt-2 font-semibold text-emerald-primary underline"
              >
                Limpiar filtros y búsqueda
              </button>
            </div>
          ) : (
            <p className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-4 text-sm text-slate-text">
              Aún no hay suscripciones por mostrar. Conecta Gmail para
              detectarlas o regístralas manualmente con el botón «Registrar
              suscripción».
            </p>
          ))}
        {cantidadCuentas > 0 && (
          <p className="text-xs leading-relaxed text-slate-text">
            Las suscripciones de Gmail se detectan en mensajes de Promociones y
            Actualizaciones. Para exactitud y administrar bajas, Gmail mantiene
            su administrador de suscripciones.
          </p>
        )}
      </Card>
    </section>
  );
}
