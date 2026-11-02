import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import RespuestaModal from "../../ui/RespuestaModal";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";

const MES_ACTUAL = () => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}`; };
const VACIO = () => ({ tipo: "gasto", periodo: MES_ACTUAL(), monto: "", categoria: "", descripcion: "" });
const opcionesTrampa = (ref) => ({ allowOutsideClick: true, escapeDeactivates: false, initialFocus: () => ref.current, returnFocusOnDeactivate: false });

export default function ModalCrearResumenContable({ abierto, triggerRef, alCerrar, alGuardar }) {
  const panelRef = useRef(null);
  const [valores, setValores] = useState(VACIO);
  const [respuesta, setRespuesta] = useState(null);
  useEffect(() => { if (abierto) { setValores(VACIO()); setRespuesta(null); } }, [abierto]);
  useCierreConEsc({ activo: abierto, zIndex: 70, alCerrar });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });
  if (!abierto) return null;

  const cambiar = (campo, valor) => { setValores((prev) => ({ ...prev, [campo]: valor })); setRespuesta(null); };
  const enviar = (evento) => {
    evento.preventDefault();
    const requeridos = ["tipo", "periodo", "monto", "categoria", "descripcion"];
    const faltante = requeridos.find((campo) => !String(valores[campo] ?? "").trim());
    if (faltante || Number(valores.monto) <= 0) {
      setRespuesta({ tipo: "error", campo: faltante || "monto", mensaje: faltante ? "Completa todos los campos requeridos." : "El monto debe ser mayor que cero." });
      return;
    }
    alGuardar({ ...valores, monto: Number(valores.monto), id: `resumen-${Date.now()}`, fecha: `${valores.periodo}-15`, concepto: valores.descripcion.trim(), categoria: valores.categoria.trim(), tipoMovimiento: valores.tipo });
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bg-dark/70 p-4" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="crear-resumen-titulo" tabIndex={-1} className="glass-surface relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div><p className="text-xs font-medium uppercase tracking-wide text-emerald-primary">Datos de demostración</p><h2 id="crear-resumen-titulo" className="mt-1 font-display text-2xl font-semibold">Agregar nuevo resumen</h2><p className="mt-1 text-sm text-slate-text">El resumen se guardará solo en esta vista.</p></div>
            <BotonCerrar ariaLabel="Cerrar nuevo resumen" alCerrar={alCerrar} className="text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary" />
          </header>
          <form onSubmit={enviar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium" htmlFor="nuevo-resumen-tipo">Tipo de resumen</label><select id="nuevo-resumen-tipo" required value={valores.tipo} onChange={(e) => cambiar("tipo", e.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3"><option value="gasto">Gasto</option><option value="ahorro">Ahorro</option><option value="balance">Balance</option></select></div>
              <div><label className="mb-1 block text-sm font-medium" htmlFor="nuevo-resumen-periodo">Periodo</label><input id="nuevo-resumen-periodo" required type="month" value={valores.periodo} onChange={(e) => cambiar("periodo", e.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3" /></div>
              <div><label className="mb-1 block text-sm font-medium" htmlFor="nuevo-resumen-monto">Monto (COP)</label><input id="nuevo-resumen-monto" required type="number" min="1" step="1" value={valores.monto} onChange={(e) => cambiar("monto", e.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3" /></div>
              <div><label className="mb-1 block text-sm font-medium" htmlFor="nuevo-resumen-categoria">Categoría</label><input id="nuevo-resumen-categoria" required maxLength={80} value={valores.categoria} onChange={(e) => cambiar("categoria", e.target.value)} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3" /></div>
            </div>
            <div><label className="mb-1 block text-sm font-medium" htmlFor="nuevo-resumen-descripcion">Descripción</label><textarea id="nuevo-resumen-descripcion" required maxLength={240} rows={3} value={valores.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} className="w-full rounded-xl border border-border-line bg-white px-3 py-2" /></div>
            <RespuestaModal respuesta={respuesta} />
            <div className="flex justify-end gap-2"><button type="button" onClick={alCerrar} className="min-h-11 rounded-xl border border-border-line px-4 text-sm font-medium hover:bg-white">Cancelar</button><button type="submit" className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">Guardar resumen</button></div>
          </form>
        </section>
      </FocusTrap>
    </div>
  );
}
