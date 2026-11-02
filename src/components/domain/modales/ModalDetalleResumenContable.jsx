import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import RespuestaModal from "../../ui/RespuestaModal";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";

const TITULOS = { gastos: "Gastos", ahorros: "Ahorros", balance: "Balance disponible" };
const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const formatoMes = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" });
const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const opcionesTrampa = (ref) => ({ allowOutsideClick: true, escapeDeactivates: false, initialFocus: () => ref.current, returnFocusOnDeactivate: false });

function tipoCoincide(tipoResumen, movimiento) {
  if (tipoResumen === "gastos") return movimiento.tipo.toLowerCase() === "gasto";
  if (tipoResumen === "ahorros") return movimiento.tipo.toLowerCase() === "ahorro";
  return true;
}

export default function ModalDetalleResumenContable({ abierto, tipo, movimientos, triggerRef, alCerrar }) {
  const panelRef = useRef(null);
  const [periodo, setPeriodo] = useState("actual");
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  useEffect(() => { if (abierto) { setPeriodo("actual"); setMesSeleccionado(""); } }, [abierto, tipo]);
  useCierreConEsc({ activo: abierto, zIndex: 70, alCerrar });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });
  if (!abierto || !tipo) return null;

  const hoy = new Date();
  const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const registrosTipo = movimientos.filter((m) => tipoCoincide(tipo, m));
  const mesesPasados = [...new Set(registrosTipo.map((m) => m.fecha.slice(0, 7)).filter((mes) => mes < periodoActual))].sort().reverse();
  const mesMostrado = periodo === "actual" ? periodoActual : (mesSeleccionado || mesesPasados[0] || "");
  const datos = registrosTipo.filter((m) => m.fecha.slice(0, 7) === mesMostrado);
  const saldo = movimientos.filter((m) => m.fecha.slice(0, 7) === mesMostrado).reduce((total, m) => total + m.monto, 0);
  const titulo = TITULOS[tipo];
  const moverTab = (evento) => {
    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
    evento.preventDefault();
    const siguiente = periodo === "actual" ? "pasados" : "actual";
    setPeriodo(siguiente);
    setMesSeleccionado("");
    requestAnimationFrame(() => document.getElementById(`tab-periodo-${siguiente}`)?.focus());
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bg-dark/70 p-4" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="detalle-resumen-titulo" tabIndex={-1} className="glass-surface relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-primary">Resumen de demostración</p>
              <h2 id="detalle-resumen-titulo" className="mt-1 font-display text-2xl font-semibold">{titulo}</h2>
              <p className="mt-1 text-sm text-slate-text">Consulta el detalle por periodo.</p>
            </div>
            <BotonCerrar ariaLabel={`Cerrar detalle de ${titulo.toLowerCase()}`} alCerrar={alCerrar} className="text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary" />
          </header>
          <div className="mb-5 flex gap-2 border-b border-border-line/60" role="tablist" aria-label="Periodo del resumen">
            {[['actual', 'Mes actual'], ['pasados', 'Meses pasados']].map(([valor, etiqueta]) => (
              <button key={valor} id={`tab-periodo-${valor}`} type="button" role="tab" aria-controls="panel-periodo-resumen" aria-selected={periodo === valor} tabIndex={periodo === valor ? 0 : -1} onKeyDown={moverTab} onClick={() => { setPeriodo(valor); setMesSeleccionado(""); }} className={`border-b-2 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${periodo === valor ? "border-emerald-primary text-emerald-primary" : "border-transparent text-slate-text"}`}>
                {etiqueta}
              </button>
            ))}
          </div>
          <div id="panel-periodo-resumen" role="tabpanel" aria-labelledby={`tab-periodo-${periodo}`}>
          {periodo === "pasados" && (
            <label className="mb-4 block text-sm font-medium" htmlFor="resumen-mes-pasado">
              Selecciona un mes
              <select id="resumen-mes-pasado" value={mesMostrado} onChange={(e) => setMesSeleccionado(e.target.value)} disabled={!mesesPasados.length} className="mt-1 block min-h-11 w-full rounded-xl border border-border-line bg-white px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
                {!mesesPasados.length && <option value="">Sin meses anteriores</option>}
                {mesesPasados.map((mes) => <option key={mes} value={mes}>{formatoMes.format(new Date(`${mes}-01T00:00:00Z`))}</option>)}
              </select>
            </label>
          )}
          <RespuestaModal respuesta={{ tipo: "advertencia", mensaje: "Datos de demostración; no provienen de tu cuenta bancaria." }} className="mb-4" />
          {tipo === "balance" && (
            <div className="mb-5 rounded-2xl bg-white p-4">
              <p className="text-sm text-slate-text">Balance del periodo</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{formatoMoneda.format(saldo)}</p>
            </div>
          )}
          {datos.length ? <ul aria-label={`Detalle de ${titulo.toLowerCase()}`} className="divide-y divide-border-line/50">
            {datos.map((m) => <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div><p className="font-medium">{m.concepto}</p><p className="text-sm text-slate-text">{m.categoria || m.tipo} · {formatoFecha.format(new Date(`${m.fecha}T00:00:00Z`))}</p></div>
              <span className="font-semibold tabular-nums">{m.monto < 0 ? "−" : "+"}{formatoMoneda.format(Math.abs(m.monto))}</span>
            </li>)}
          </ul> : <p className="rounded-xl border border-border-line/60 px-4 py-6 text-center text-sm text-slate-text">No hay datos para este periodo.</p>}
          </div>
        </section>
      </FocusTrap>
    </div>
  );
}
