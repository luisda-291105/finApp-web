/**
 * @uso        Modal para agregar un movimiento a la demostración contable
 * @funciones  ModalCrearMovimientoContable({ abierto, triggerRef, alCerrar, alGuardar })
 * @datos      Tipo, fecha, monto, categoría y concepto del movimiento
 * @eventos    Submit del formulario y cierre por Escape, botón, clic exterior o deslizar
 * @estados    valores, respuesta de validación
 * @usadoPor   PaginaDashboardContabilidad
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import RespuestaModal from "../../ui/RespuestaModal";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";

function fechaLocal() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

const VALORES_INICIALES = () => ({
  tipo: "gasto",
  fecha: fechaLocal(),
  monto: "",
  categoria: "",
  concepto: "",
});

const opcionesTrampa = (ref) => ({
  allowOutsideClick: true,
  escapeDeactivates: false,
  initialFocus: () => ref.current,
  returnFocusOnDeactivate: false,
});

/** Modal demostrativo para registrar un movimiento contable en la vista actual. */
export default function ModalCrearMovimientoContable({ abierto, triggerRef, alCerrar, alGuardar }) {
  const panelRef = useRef(null);
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [respuesta, setRespuesta] = useState(null);

  useEffect(() => {
    if (abierto) {
      setValores(VALORES_INICIALES());
      setRespuesta(null);
    }
  }, [abierto]);

  useCierreConEsc({ activo: abierto, zIndex: 70, alCerrar });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  if (!abierto) return null;

  const cambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setRespuesta(null);
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const requeridos = ["fecha", "monto", "categoria", "concepto"];
    const faltante = requeridos.find((campo) => !String(valores[campo] ?? "").trim());
    const monto = Number(valores.monto);

    if (faltante || !Number.isFinite(monto) || monto <= 0) {
      setRespuesta({
        tipo: "error",
        campo: faltante || "monto",
        mensaje: faltante ? "Completa todos los campos requeridos." : "El monto debe ser mayor que cero.",
      });
      document.getElementById(`nuevo-movimiento-${faltante || "monto"}`)?.focus();
      return;
    }

    const tipo = valores.tipo === "ingreso" ? "Ingreso" : valores.tipo === "ahorro" ? "Ahorro" : "Gasto";
    const montoConSigno = tipo === "Ingreso" ? monto : -monto;

    alGuardar?.({
      id: `movimiento-${Date.now()}`,
      fecha: valores.fecha,
      concepto: valores.concepto.trim(),
      categoria: valores.categoria.trim(),
      monto: montoConSigno,
      tipo,
    });
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bg-dark/70 p-4" onClick={(evento) => evento.target === evento.currentTarget && alCerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="crear-movimiento-titulo" aria-describedby="nuevo-movimiento-aviso" tabIndex={-1} className="glass-surface relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-primary">Datos de demostración</p>
              <h2 id="crear-movimiento-titulo" className="mt-1 font-display text-2xl font-semibold">Agregar nuevo movimiento</h2>
              <p id="nuevo-movimiento-aviso" className="mt-1 text-sm text-slate-text">El movimiento se guardará solo en esta vista.</p>
            </div>
            <BotonCerrar ariaLabel="Cerrar nuevo movimiento" alCerrar={alCerrar} className="text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary" />
          </header>

          <form onSubmit={enviar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-tipo">Tipo de movimiento</label>
                <select id="nuevo-movimiento-tipo" required value={valores.tipo} onChange={(evento) => cambiar("tipo", evento.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3">
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                  <option value="ahorro">Ahorro</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-fecha">Fecha</label>
                <input id="nuevo-movimiento-fecha" required type="date" value={valores.fecha} onChange={(evento) => cambiar("fecha", evento.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-monto">Monto (COP)</label>
                <input id="nuevo-movimiento-monto" required type="number" min="1" step="1" placeholder="Ej. 125000" value={valores.monto} onChange={(evento) => cambiar("monto", evento.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3 placeholder:text-slate-text/70" />
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
              <button type="button" onClick={alCerrar} className="min-h-11 rounded-xl border border-border-line px-4 text-sm font-medium hover:bg-white">Cancelar</button>
              <button type="submit" className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">Guardar movimiento</button>
            </div>
          </form>
        </section>
      </FocusTrap>
    </div>
  );
}
