/**
 * @uso        Modal para registrar un movimiento en un bolsillo
 * @funciones  ModalCrearMovimientoContable({ abierto, bolsillos, triggerRef, alCerrar, alGuardar })
 * @datos      Bolsillo, tipo, fecha, monto, categoría y concepto del movimiento
 * @eventos    Submit del formulario y cierre por Escape, botón, clic exterior o deslizar
 * @estados    valores, respuesta, ocupado
 * @usadoPor   PaginaDashboardContabilidad
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import RespuestaModal from "../../ui/RespuestaModal";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import { desagruparPesos, formatearPesos, limpiarEntradaPesos, parsearPesos } from "../../../utils/formatoPesos";

function fechaLocal() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

function valoresIniciales() {
  return { tipo: "GASTO", fecha: fechaLocal(), monto: "", categoria: "", concepto: "" };
}

const opcionesTrampa = (ref) => ({
  allowOutsideClick: true,
  escapeDeactivates: false,
  initialFocus: () => ref.current,
  returnFocusOnDeactivate: false,
});

/** Permite crear movimientos, que se asignan al bolsillo del tipo elegido. */
export default function ModalCrearMovimientoContable({ abierto, modo = "crear", movimiento = null, bolsillos = [], triggerRef, alCerrar, alGuardar }) {
  const panelRef = useRef(null);
  const [valores, setValores] = useState(() => valoresIniciales());
  const [respuesta, setRespuesta] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (abierto) {
      setValores(modo === "editar" && movimiento ? {
        tipo: movimiento.tipo || bolsillos[0]?.tipo || "GASTO",
        fecha: movimiento.fecha || fechaLocal(),
        monto: formatearPesos(movimiento.monto ?? ""),
        categoria: movimiento.categoria || "",
        concepto: movimiento.concepto || "",
      } : { ...valoresIniciales(), tipo: bolsillos[0]?.tipo || "GASTO" });
      setRespuesta(null);
      setOcupado(false);
    }
  }, [abierto, modo, movimiento?.idMovimiento]);

  useCierreConEsc({ activo: abierto, zIndex: 70, alCerrar: () => !ocupado && alCerrar() });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar: () => !ocupado && alCerrar() });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  if (!abierto) return null;

  const cambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setRespuesta(null);
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const requeridos = ["tipo", "fecha", "monto", "categoria", "concepto"];
    const faltante = requeridos.find((campo) => !String(valores[campo] ?? "").trim());
    const monto = parsearPesos(valores.monto);

    if (faltante || !Number.isFinite(monto) || monto <= 0) {
      setRespuesta({
        tipo: "error",
        campo: faltante || "monto",
        mensaje: faltante ? "Completa todos los campos requeridos." : "El monto debe ser mayor que cero.",
      });
      const campoFoco = faltante || "monto";
      document.getElementById(`nuevo-movimiento-${campoFoco}`)?.focus();
      return;
    }

    setOcupado(true);
    setRespuesta(null);
    try {
      await alGuardar?.({
        ...valores,
        monto,
        categoria: valores.categoria.trim(),
        concepto: valores.concepto.trim(),
      });
      alCerrar();
    } catch (fallo) {
      setRespuesta({ tipo: "error", mensaje: fallo?.message || "No se pudo guardar el movimiento." });
    } finally {
      setOcupado(false);
    }
  };

  const cerrar = () => { if (!ocupado) alCerrar(); };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bg-dark/70 p-4" onClick={(evento) => evento.target === evento.currentTarget && cerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="crear-movimiento-titulo" tabIndex={-1} className="glass-surface relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-primary">Registro contable</p>
              <h2 id="crear-movimiento-titulo" className="mt-1 font-display text-2xl font-semibold">{modo === "editar" ? "Editar movimiento" : "Nuevo movimiento"}</h2>
              <p className="mt-1 text-sm text-slate-text">El tipo asigna el movimiento al bolsillo correspondiente.</p>
            </div>
            <BotonCerrar ariaLabel="Cerrar nuevo movimiento" alCerrar={cerrar} className="text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary" />
          </header>

          <form onSubmit={enviar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-tipo">Tipo de movimiento</label>
                <select id="nuevo-movimiento-tipo" required value={valores.tipo} onChange={(evento) => cambiar("tipo", evento.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3">
                  {Array.from(new Set(bolsillos.map((bolsillo) => bolsillo.tipo).filter(Boolean))).map((tipo) => <option key={tipo} value={tipo}>{tipo === "INGRESO" ? "Ingreso" : tipo === "AHORRO" ? "Ahorro" : tipo === "GASTO" ? "Gasto" : tipo}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-fecha">Fecha</label>
                <input id="nuevo-movimiento-fecha" required type="date" value={valores.fecha} onChange={(evento) => cambiar("fecha", evento.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-monto">Monto (COP)</label>
                <input id="nuevo-movimiento-monto" required type="text" inputMode="decimal" placeholder="12.000,00" value={valores.monto} onFocus={() => cambiar("monto", desagruparPesos(valores.monto))} onChange={(evento) => cambiar("monto", limpiarEntradaPesos(evento.target.value))} onBlur={() => { const numero = parsearPesos(valores.monto); cambiar("monto", numero === null ? valores.monto : formatearPesos(numero)); }} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3 placeholder:text-slate-text/70" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-categoria">Categoría</label>
                <input id="nuevo-movimiento-categoria" required maxLength={80} placeholder="Ej. Alimentación" value={valores.categoria} onChange={(evento) => cambiar("categoria", evento.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3 placeholder:text-slate-text/70" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-concepto">Concepto</label>
              <input id="nuevo-movimiento-concepto" required maxLength={160} placeholder="Ej. Compra semanal del hogar" value={valores.concepto} onChange={(evento) => cambiar("concepto", evento.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3 placeholder:text-slate-text/70" />
            </div>
            <RespuestaModal respuesta={respuesta} />
            <div className="flex justify-end gap-2">
              <button type="button" disabled={ocupado} onClick={cerrar} className="min-h-11 rounded-xl border border-border-line px-4 text-sm font-medium hover:bg-white disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={ocupado || bolsillos.length === 0 || !bolsillos.some((bolsillo) => bolsillo.tipo?.toLocaleUpperCase("es-CO") === valores.tipo?.toLocaleUpperCase("es-CO"))} className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50">{ocupado ? "Guardando…" : modo === "editar" ? "Guardar cambios" : "Guardar movimiento"}</button>
            </div>
          </form>
        </section>
      </FocusTrap>
    </div>
  );
}
