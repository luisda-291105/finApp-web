import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  LoaderCircle,
  Pencil,
  PiggyBank,
  ReceiptText,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { listarMovimientos } from "../../services/movimientosService";
import {
  esBolsilloFijo,
  formatoFecha,
  formatoMoneda,
  obtenerOrigenes,
  agruparPorAnioYMes,
  etiquetaMesMovimientoCorta,
} from "../../utils/contabilidadHelpers";
import { AlertaGlobal } from "../../../../features/error";

const iconoPorTipo = {
  GASTO: ReceiptText,
  INGRESO: TrendingUp,
  AHORRO: PiggyBank,
};
const campoPorTipo = {
  GASTO: "gastos",
  INGRESO: "ingresos",
  AHORRO: "ahorros",
};
const listaDe = (respuesta) =>
  Array.isArray(respuesta)
    ? respuesta
    : respuesta?.data || respuesta?.content || [];

function fechaLegible(fecha) {
  if (!fecha) return "Fecha no disponible";
  const valor = new Date(`${fecha}T00:00:00Z`);
  return Number.isNaN(valor.getTime()) ? fecha : formatoFecha.format(valor);
}

function perteneceAlBolsillo(movimiento, bolsillo) {
  const bolsilloDestino = movimiento.idBolsillo === bolsillo.idBolsillo;
  const bolsilloOrigen =
    String(movimiento.origenTipo || "").toUpperCase() === "BOLSILLO" &&
    movimiento.origenId === bolsillo.idBolsillo;
  return bolsilloDestino || bolsilloOrigen;
}

/** Detalle financiero del bolsillo con total de movimientos agrupado por año y mes. */
export default function DetalleBolsilloModal({
  abierto,
  bolsillo,
  resumen = {},
  triggerRef,
  alCerrar,
  alEditar,
  alEliminar,
}) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const tipo = String(bolsillo?.tipo || "")
    .trim()
    .toUpperCase();
  const Icono = iconoPorTipo[tipo] || Wallet;
  const monto = Number(resumen[campoPorTipo[tipo]]) || 0;
  const esGasto = tipo === "GASTO";

  useEffect(() => {
    if (!abierto || !bolsillo?.idBolsillo) return undefined;
    let vigente = true;
    setCargando(true);
    setError("");
    listarMovimientos(null, "TODOS")
      .then((respuesta) => {
        if (!vigente) return;
        const lista = listaDe(respuesta)
          .filter((movimiento) => perteneceAlBolsillo(movimiento, bolsillo))
          .sort((a, b) =>
            String(b.fecha || "").localeCompare(String(a.fecha || "")),
          );
        setMovimientos(lista);
      })
      .catch((fallo) => {
        if (vigente)
          setError(
            fallo?.message ||
              "No se pudieron cargar los movimientos de este bolsillo.",
          );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [abierto, bolsillo?.idBolsillo]);

  const reciente = movimientos[0];
  const totalMovimientos = useMemo(
    () =>
      movimientos.reduce(
        (total, movimiento) => total + (Number(movimiento.monto) || 0),
        0,
      ),
    [movimientos],
  );
  const gruposPorAnioYMes = useMemo(
    () => agruparPorAnioYMes(movimientos),
    [movimientos],
  );
  const [aniosAbiertos, setAniosAbiertos] = useState(() => new Set());
  const [mesesAbiertos, setMesesAbiertos] = useState(() => new Set());

  // Abre por defecto el año más reciente y su primer mes
  useEffect(() => {
    setAniosAbiertos((actuales) => {
      if (actuales.size > 0) return actuales;
      return new Set(
        gruposPorAnioYMes[0]?.anio ? [gruposPorAnioYMes[0].anio] : [],
      );
    });
    setMesesAbiertos((actuales) => {
      if (actuales.size > 0) return actuales;
      const primerMes = gruposPorAnioYMes[0]?.meses?.[0]?.clave;
      return new Set(primerMes ? [primerMes] : []);
    });
  }, [gruposPorAnioYMes]);

  const alternarAnio = (anio) =>
    setAniosAbiertos((actuales) => {
      const siguiente = new Set(actuales);
      if (siguiente.has(anio)) siguiente.delete(anio);
      else siguiente.add(anio);
      return siguiente;
    });

  const alternarMes = (clave) =>
    setMesesAbiertos((actuales) => {
      const siguiente = new Set(actuales);
      if (siguiente.has(clave)) siguiente.delete(clave);
      else siguiente.add(clave);
      return siguiente;
    });

  return (
    <>
      <ModalDetalleRegistro
        abierto={abierto}
        titulo={bolsillo?.nombre || "Detalle del bolsillo"}
        triggerRef={triggerRef}
        alCerrar={alCerrar}
        ancho="max-w-4xl"
      >
        {bolsillo && (
          <div className="space-y-5">
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
              <section className="min-w-0 rounded-2xl border border-border-line/50 bg-bg-cream/60 p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${esGasto ? "bg-red-100 text-red-700" : "bg-emerald-primary/10 text-emerald-primary"}`}
                  >
                    <Icono className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-display text-xl font-semibold text-bg-dark">
                      {bolsillo.nombre}
                    </h3>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${esGasto ? "bg-red-100 text-red-700" : "bg-emerald-primary/10 text-emerald-primary"}`}
                    >
                      {bolsillo.tipo}
                    </span>
                  </div>
                </div>
                {bolsillo.descripcion?.trim() && (
                  <p className="mt-4 break-words text-sm text-slate-text">
                    {bolsillo.descripcion}
                  </p>
                )}
                {obtenerOrigenes(bolsillo).length > 0 && (
                  <ul
                    className="mt-3 flex flex-wrap gap-2"
                    aria-label="Orígenes del bolsillo"
                  >
                    {obtenerOrigenes(bolsillo).map((origen, indice) => (
                      <li
                        key={`${origen}-${indice}`}
                        className="rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary"
                      >
                        {origen}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-text">
                    Monto del bolsillo
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-bg-dark">
                    {formatoMoneda.format(monto)}
                  </p>
                </div>
                <div className="mt-4 space-y-3 border-t border-border-line/40 pt-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-text">
                      Origen reciente
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-bg-dark">
                      {reciente?.origenNombre || "Sin origen registrado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-text">
                      Fecha del último movimiento
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-bg-dark">
                      <CalendarDays
                        className={`h-4 w-4 ${esGasto ? "text-red-700" : "text-emerald-primary"}`}
                        aria-hidden="true"
                      />
                      {fechaLegible(reciente?.fecha)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3 border-t border-border-line/40 pt-4">
                  <div
                    className={`rounded-xl p-3 ${esGasto ? "bg-rose-100/80" : "bg-emerald-100/70"}`}
                  >
                    <p
                      className={`text-xs ${esGasto ? "text-rose-900" : "text-emerald-800"}`}
                    >
                      Total de los movimientos
                    </p>
                    <p
                      className={`mt-1 text-sm font-semibold tabular-nums ${esGasto ? "text-rose-900" : "text-emerald-800"}`}
                    >
                      {formatoMoneda.format(totalMovimientos)}
                    </p>
                    <p
                      className={`mt-1 text-xs ${esGasto ? "text-rose-900/80" : "text-emerald-800/80"}`}
                    >
                      {movimientos.length} movimiento
                      {movimientos.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </section>

              <section
                aria-labelledby="movimientos-bolsillo-titulo"
                className="min-w-0 space-y-3 mb-6 lg:mb-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      id="movimientos-bolsillo-titulo"
                      className="font-semibold text-bg-dark"
                    >
                      Movimientos
                    </h3>
                    <p className="text-xs text-slate-text">
                      Total por año y mes
                    </p>
                  </div>
                </div>
                {cargando && (
                  <p
                    role="status"
                    className="flex items-center gap-2 py-5 text-sm text-slate-text"
                  >
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Cargando movimientos…
                  </p>
                )}
                {!cargando && (
                  <div className="max-h-96 space-y-2 overflow-y-auto" aria-label="Movimientos agrupados por año y mes">
                    {gruposPorAnioYMes.length === 0 ? (
                      <p className="rounded-xl border border-border-line/40 p-4 text-sm text-slate-text">
                        Sin movimientos registrados.
                      </p>
                    ) : (
                      gruposPorAnioYMes.map((grupoAnio) => {
                        const anioAbierto = aniosAbiertos.has(grupoAnio.anio);
                        const cantidadAnio = grupoAnio.meses.reduce(
                          (total, mes) => total + mes.movimientos.length,
                          0,
                        );
                        return (
                          <div
                            key={grupoAnio.anio}
                            className="overflow-hidden rounded-xl border border-border-line/40 bg-bg-cream/60"
                          >
                            <button
                              type="button"
                              onClick={() => alternarAnio(grupoAnio.anio)}
                              aria-expanded={anioAbierto}
                              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-bg-cream/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
                            >
                              <span className="flex items-center gap-2 text-sm font-semibold text-bg-dark">
                                <ChevronDown
                                  aria-hidden="true"
                                  className={`h-4 w-4 text-slate-text transition-transform ${anioAbierto ? "" : "-rotate-90"}`}
                                />
                                <span>
                                  {grupoAnio.anio === "sin-fecha"
                                    ? "Sin fecha"
                                    : grupoAnio.anio}{" "}
                                  <span className="font-normal text-slate-text">
                                    · {cantidadAnio} movimiento
                                    {cantidadAnio === 1 ? "" : "s"}
                                  </span>
                                </span>
                              </span>
                              <span className="text-sm font-semibold tabular-nums text-bg-dark">
                                {formatoMoneda.format(grupoAnio.total)}
                              </span>
                            </button>
                            <div
                              className={
                                anioAbierto
                                  ? "divide-y divide-border-line/40 border-t border-border-line/40"
                                  : "hidden"
                              }
                            >
                              {grupoAnio.meses.map((grupo) => {
                                const mesAbierto = mesesAbiertos.has(
                                  grupo.clave,
                                );
                                return (
                                  <section key={grupo.clave}>
                                    <button
                                      type="button"
                                      onClick={() => alternarMes(grupo.clave)}
                                      aria-expanded={mesAbierto}
                                      className="flex w-full items-center justify-between gap-3 bg-bg-cream/40 px-3 py-2 text-left transition-colors hover:bg-bg-cream/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
                                    >
                                      <span className="flex items-center gap-2 text-sm font-medium text-bg-dark">
                                        <ChevronDown
                                          aria-hidden="true"
                                          className={`h-4 w-4 text-slate-text transition-transform ${mesAbierto ? "" : "-rotate-90"}`}
                                        />
                                        <span className="hidden sm:inline">
                                          {grupo.etiqueta}
                                        </span>
                                        <span className="sm:hidden">
                                          {etiquetaMesMovimientoCorta(
                                            grupo.clave,
                                          )}
                                        </span>
                                        <span className="font-normal text-slate-text">
                                          · {grupo.movimientos.length}mov
                                        </span>
                                      </span>
                                      <span className="text-xs font-semibold tabular-nums text-slate-text">
                                        Total: {formatoMoneda.format(grupo.total)}
                                      </span>
                                    </button>
                                    <ul
                                      className={
                                        mesAbierto
                                          ? "divide-y divide-border-line/40 border-t border-border-line/40 bg-white/60"
                                          : "hidden"
                                      }
                                    >
                                      {grupo.movimientos.map((movimiento) => (
                                        <li
                                          key={movimiento.idMovimiento}
                                          className="flex items-center gap-3 py-2 pl-11 pr-3"
                                        >
                                          <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${esGasto ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                                          >
                                            <Wallet
                                              className="h-4 w-4"
                                              aria-hidden="true"
                                            />
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-bg-dark">
                                              {movimiento.concepto?.trim() ||
                                                movimiento.categoria ||
                                                "Movimiento"}
                                            </p>
                                            <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-text">
                                              <span className="truncate">
                                                {movimiento.origenNombre ||
                                                  "Movimiento del bolsillo"}
                                              </span>
                                              <time
                                                className="shrink-0 whitespace-nowrap"
                                                dateTime={movimiento.fecha}
                                              >
                                                · {fechaLegible(movimiento.fecha)}
                                              </time>
                                            </div>
                                          </div>
                                          <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-bg-dark">
                                            {formatoMoneda.format(
                                              Number(movimiento.monto) || 0,
                                            )}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </section>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
                <AlertaGlobal
                  tipo="error"
                  mensaje={error}
                  idBase="DetalleBolsilloModal-error"
                />
                {!cargando && !error && movimientos.length === 0 && (
                  <p className="rounded-xl border border-border-line/40 p-4 text-sm text-slate-text">
                    Todavía no hay movimientos asociados a este bolsillo.
                  </p>
                )}
              </section>
            </div>

            {!esBolsilloFijo(bolsillo) && (
              <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border-line/40 pt-4">
                <button
                  type="button"
                  onClick={alEliminar}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={alEditar}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-primary px-4 text-sm font-semibold text-white hover:bg-emerald-hover"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar bolsillo
                </button>
              </footer>
            )}
          </div>
        )}
      </ModalDetalleRegistro>
    </>
  );
}
