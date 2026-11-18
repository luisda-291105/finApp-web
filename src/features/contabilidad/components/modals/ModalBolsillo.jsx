import { useEffect, useMemo, useState } from "react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import {
  agruparEntradaPesos,
  desagruparPesos,
  formatearPesos,
  parsearPesos,
} from "../../../../utils/formatoPesos";
import { AlertaGlobal } from "../../../../features/error";
import { obtenerOrigenes } from "../../utils/contabilidadHelpers";

export default function ModalBolsillo({
  abierto,
  modo = "crear",
  bolsillo = null,
  bolsillos = [],
  movimientos = [],
  alAlternarMovimiento,
  triggerRef,
  alCerrar,
  alGuardar,
  alEliminar,
}) {
  const [nombre, setNombre] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState("0");
  const [estado, setEstado] = useState(true);
  const [descripcion, setDescripcion] = useState("");
  const [origenes, setOrigenes] = useState([]);
  const [nuevoOrigen, setNuevoOrigen] = useState("");
  const [confirmarConversion, setConfirmarConversion] = useState(false);
  const [editandoObjetivo, setEditandoObjetivo] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setNombre(bolsillo?.nombre || "");
    setMontoObjetivo(formatearPesos(bolsillo?.montoObjetivo ?? 0));
    setConfirmarConversion(false);
    setEditandoObjetivo(false);
    setEstado(bolsillo?.estado !== false);
    setDescripcion(bolsillo?.descripcion ?? "");
    setOrigenes(obtenerOrigenes(bolsillo));
    setNuevoOrigen("");
    setError("");
  }, [abierto, bolsillo, modo]);

  const movimientosCandidatos = useMemo(
    () =>
      [...movimientos]
        .sort((a, b) => String(b?.fecha || "").localeCompare(String(a?.fecha || "")))
        .slice(0, 200),
    [movimientos],
  );
  const movimientosAsociados = useMemo(
    () =>
      movimientosCandidatos.filter(
        (movimiento) => String(movimiento?.idBolsillo) === String(bolsillo?.idBolsillo),
      ),
    [movimientosCandidatos, bolsillo?.idBolsillo],
  );

  const guardar = async (evento) => {
    evento.preventDefault();
    if (!nombre.trim()) {
      setError("Escribe el nombre del bolsillo.");
      return;
    }
    const tipoActual = String(bolsillo?.tipo || "")
      .trim()
      .toUpperCase();
    const requiereConversion = modo === "editar" && tipoActual !== "AHORRO";
    if (requiereConversion && !confirmarConversion) {
      setError(
        "Confirma la conversión de este bolsillo a AHORRO para continuar.",
      );
      return;
    }
    const objetivo = parsearPesos(montoObjetivo);
    if (objetivo === null || objetivo < 0) {
      setError("El monto objetivo debe ser cero o mayor.");
      return;
    }
    setOcupado(true);
    setError("");
    try {
      await alGuardar({
        nombre: nombre.trim(),
        tipo: "AHORRO",
        montoObjetivo: objetivo,
        ...(modo === "editar"
          ? {
              estado,
              descripcion: descripcion.trim() || null,
              origenes,
            }
          : {}),
      });
      alCerrar();
    } catch (fallo) {
      setError(fallo?.message || "No se pudo guardar el bolsillo.");
    } finally {
      setOcupado(false);
    }
  };

  const bolsilloLegado =
    modo === "editar" &&
    String(bolsillo?.tipo || "")
      .trim()
      .toUpperCase() !== "AHORRO";

  const eliminar = async () => {
    setOcupado(true);
    setError("");
    try {
      await alEliminar(bolsillo.idBolsillo);
      alCerrar();
    } catch (fallo) {
      setError(fallo?.message || "No se pudo eliminar el bolsillo.");
    } finally {
      setOcupado(false);
    }
  };

  const titulo =
    modo === "crear"
      ? "Nuevo bolsillo"
      : modo === "editar"
        ? "Editar bolsillo"
        : "Eliminar bolsillo";
  return (
    <ModalDetalleRegistro
      abierto={abierto}
      titulo={titulo}
      alCerrar={() => !ocupado && alCerrar()}
      triggerRef={triggerRef}
      ancho="max-w-md"
    >
      {modo === "eliminar" ? (
        <div>
          <p className="mb-4 text-sm text-slate-text">
            ¿Eliminar definitivamente el bolsillo{" "}
            <strong className="text-bg-dark">{bolsillo?.nombre}</strong>? Esta
            acción no se puede deshacer.
          </p>
          <AlertaGlobal
            tipo="error"
            mensaje={error}
            idBase="ModalBolsillo-error"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={ocupado}
              onClick={alCerrar}
              className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={eliminar}
              className="min-h-10 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
            >
              {ocupado ? "Eliminando…" : "Eliminar bolsillo"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={guardar} className="space-y-4">
          <label className="block text-sm font-medium text-bg-dark">
            Nombre del bolsillo
            <input
              autoFocus
              required
              maxLength={100}
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              placeholder="Ej. Fondo para viajes"
              disabled={ocupado}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3.5 text-sm text-bg-dark outline-none placeholder:text-slate-text focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20 disabled:opacity-50"
            />
          </label>
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            Tipo del bolsillo: <strong>AHORRO</strong>
          </p>
          {bolsilloLegado && (
            <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              <p role="status">
                Este bolsillo es de tipo {String(bolsillo?.tipo).toUpperCase()}.
                Debe convertirse a AHORRO para poder guardar cambios.
              </p>
              <label className="flex items-start gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={confirmarConversion}
                  onChange={(evento) => {
                    setConfirmarConversion(evento.target.checked);
                    setError("");
                  }}
                  disabled={ocupado}
                  className="mt-0.5 h-4 w-4 accent-amber-700"
                />
                <span>Confirmo convertir este bolsillo a AHORRO.</span>
              </label>
            </div>
          )}
          <label className="block text-sm font-medium text-bg-dark">
            Monto objetivo (COP)
            <input
              type="text"
              inputMode="decimal"
              value={montoObjetivo}
              onFocus={() => {
                if (!editandoObjetivo) {
                  setMontoObjetivo(desagruparPesos(montoObjetivo));
                  setEditandoObjetivo(true);
                }
              }}
              onChange={(evento) =>
                setMontoObjetivo(agruparEntradaPesos(evento.target.value))
              }
              onBlur={() => {
                const numero = parsearPesos(montoObjetivo);
                setMontoObjetivo(numero === null ? "" : formatearPesos(numero));
                setEditandoObjetivo(false);
              }}
              placeholder="12.000,00"
              disabled={ocupado}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3.5 text-sm text-bg-dark outline-none placeholder:text-slate-text focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20 disabled:opacity-50"
            />
          </label>
          {modo === "editar" && (
            <>
              <label className="block text-sm font-medium text-bg-dark">
                Descripción del bolsillo
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(evento) => setDescripcion(evento.target.value)}
                  disabled={ocupado}
                  placeholder="Opcional. Qué representa este bolsillo para ti."
                  className="mt-1.5 min-h-11 w-full resize-y rounded-xl border border-border-line bg-bg-cream px-3.5 py-3 text-sm text-bg-dark outline-none placeholder:text-slate-text focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20 disabled:opacity-50"
                />
              </label>
              <fieldset className="rounded-xl border border-border-line/50 p-3">
                <legend className="px-1 text-sm font-medium text-bg-dark">
                  Orígenes
                </legend>
                <p className="text-xs text-slate-text">
                  Etiquetas que describen de dónde sale el dinero del bolsillo.
                </p>
                {origenes.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2" aria-label="Orígenes del bolsillo">
                    {origenes.map((origen, indice) => (
                      <li
                        key={`${origen}-${indice}`}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary"
                      >
                        {origen}
                        <button
                          type="button"
                          onClick={() =>
                            setOrigenes((actuales) =>
                              actuales.filter((item, i) => i !== indice),
                            )
                          }
                          aria-label={`Quitar origen ${origen}`}
                          className="rounded-full p-0.5 text-emerald-primary hover:bg-emerald-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={nuevoOrigen}
                    onChange={(evento) => setNuevoOrigen(evento.target.value)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" || evento.key === ",") {
                        evento.preventDefault();
                        const limpio = nuevoOrigen.trim();
                        if (limpio && !origenes.includes(limpio)) {
                          setOrigenes((actuales) => [...actuales, limpio]);
                        }
                        setNuevoOrigen("");
                      }
                    }}
                    disabled={ocupado}
                    placeholder="Ej. Bancolombia"
                    aria-label="Añadir un origen"
                    className="min-h-10 flex-1 rounded-lg border border-border-line bg-bg-cream px-3 text-sm text-bg-dark outline-none placeholder:text-slate-text focus:border-emerald-primary disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const limpio = nuevoOrigen.trim();
                      if (!limpio) return;
                      setOrigenes((actuales) =>
                        actuales.includes(limpio)
                          ? actuales
                          : [...actuales, limpio],
                      );
                      setNuevoOrigen("");
                    }}
                    disabled={ocupado || !nuevoOrigen.trim()}
                    className="min-h-10 rounded-lg border border-emerald-primary/40 px-3 text-xs font-semibold text-emerald-primary hover:bg-emerald-primary/10 disabled:opacity-50"
                  >
                    Añadir
                  </button>
                </div>
              </fieldset>
              <section
                aria-labelledby="editar-bolsillo-movimientos-titulo"
                className="rounded-xl border border-border-line/50 p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3
                    id="editar-bolsillo-movimientos-titulo"
                    className="text-sm font-medium text-bg-dark"
                  >
                    Movimientos que pertenecen a este bolsillo
                  </h3>
                  <span className="text-xs text-slate-text tabular-nums">
                    {movimientosAsociados.length} seleccionados
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-text">
                  Marca los gastos e ingresos que quieres que se asocien a este
                  bolsillo. Desmarca para sacarlos.
                </p>
                <ul
                  className="mt-2 max-h-48 space-y-1.5 overflow-y-auto"
                  aria-label="Movimientos asignados o asignables"
                >
                  {movimientosCandidatos.length === 0 && (
                    <li className="py-3 text-center text-xs text-slate-text">
                      No hay movimientos cargados.
                    </li>
                  )}
                  {movimientosCandidatos.map((movimiento) => {
                    const asignado =
                      String(movimiento?.idBolsillo) ===
                      String(bolsillo?.idBolsillo);
                    const tituloMovimiento =
                      movimiento?.concepto?.trim() ||
                      movimiento?.categoria ||
                      "Movimiento";
                    return (
                      <li
                        key={movimiento.idMovimiento}
                        className="flex items-center gap-3 rounded-lg border border-border-line/40 bg-bg-cream/50 p-2"
                      >
                        <label className="flex flex-1 items-center gap-2 text-left">
                          <input
                            type="checkbox"
                            checked={asignado}
                            disabled={ocupado}
                            onChange={() =>
                              alAlternarMovimiento?.(movimiento, bolsillo)
                            }
                            aria-label={`${asignado ? "Sacar" : "Asignar"} el movimiento ${tituloMovimiento} del bolsillo`}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium text-bg-dark">
                              {tituloMovimiento}
                            </span>
                            <span className="block text-[11px] text-slate-text tabular-nums">
                              {
                                new Date(
                                  `${movimiento.fecha}T00:00:00Z`,
                                ).toISOString().slice(0, 10)
                              }
                              {" · "}
                              {Number(movimiento.monto).toLocaleString(
                                "es-CO",
                                {
                                  style: "currency",
                                  currency: "COP",
                                  maximumFractionDigits: 0,
                                },
                              )}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
          {modo === "editar" && (
            <label className="flex items-center gap-3 rounded-xl border border-border-line/50 p-3 text-sm">
              <input
                type="checkbox"
                checked={estado}
                onChange={(evento) => setEstado(evento.target.checked)}
                disabled={ocupado}
                className="h-4 w-4 accent-emerald-700"
              />
              <span>
                <span className="block font-medium text-bg-dark">
                  Bolsillo activo
                </span>
                <span className="text-xs text-slate-text">
                  Los bolsillos inactivos se conservan y puedes activarlos
                  nuevamente.
                </span>
              </span>
            </label>
          )}
          <AlertaGlobal
            tipo="error"
            mensaje={error}
            idBase="ModalBolsillo-error"
          />
          <div className="flex justify-end gap-2 border-t border-border-line/30 pt-4">
            <button
              type="button"
              disabled={ocupado}
              onClick={alCerrar}
              className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={ocupado}
              className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream hover:bg-emerald-hover disabled:opacity-50"
            >
              {ocupado
                ? "Guardando…"
                : modo === "crear"
                  ? "Crear bolsillo"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}
    </ModalDetalleRegistro>
  );
}
