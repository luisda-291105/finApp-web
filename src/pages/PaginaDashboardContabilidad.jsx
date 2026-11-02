/**
 * @uso        Resúmenes contables demostrativos con detalle por periodo (spec 042)
 * @funciones  PaginaDashboardContabilidad({ movimientos })
 * @datos      Datos de demostración en memoria; no consulta servicios ni persiste cambios
 * @eventos    Apertura/cierre de modales y creación de resúmenes de demostración
 * @estados    movimientos, detalle activo, modal de creación y respuesta
 * @usadoPor   App.jsx (ruta /dashboard/contabilidad)
 */
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Plus, Wallet } from "lucide-react";
import { Card } from "../components/ui/Card";
import RespuestaModal from "../components/ui/RespuestaModal";
import ModalDetalleResumenContable from "../components/domain/modales/ModalDetalleResumenContable";
import ModalCrearResumenContable from "../components/domain/modales/ModalCrearResumenContable";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";

const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

function fechaDeMes(desfase, dia) {
  const hoy = new Date();
  const fecha = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth() + desfase, dia));
  return fecha.toISOString().slice(0, 10);
}

const MOVIMIENTOS_DEMO = [
  { id: "actual-ingreso", fecha: fechaDeMes(0, 13), concepto: "Pago de nómina", categoria: "Salario", monto: 3800000, tipo: "Ingreso" },
  { id: "actual-mercado", fecha: fechaDeMes(0, 12), concepto: "Mercado semanal", categoria: "Alimentación", monto: -185000, tipo: "Gasto" },
  { id: "actual-servicios", fecha: fechaDeMes(0, 10), concepto: "Servicios del hogar", categoria: "Hogar", monto: -92000, tipo: "Gasto" },
  { id: "actual-ahorro", fecha: fechaDeMes(0, 5), concepto: "Aporte a ahorros", categoria: "Ahorro", monto: -450000, tipo: "Ahorro" },
  { id: "anterior-ingreso", fecha: fechaDeMes(-1, 15), concepto: "Pago de nómina", categoria: "Salario", monto: 3600000, tipo: "Ingreso" },
  { id: "anterior-mercado", fecha: fechaDeMes(-1, 12), concepto: "Compras del hogar", categoria: "Alimentación", monto: -210000, tipo: "Gasto" },
  { id: "anterior-ahorro", fecha: fechaDeMes(-1, 8), concepto: "Ahorro programado", categoria: "Ahorro", monto: -400000, tipo: "Ahorro" },
];

const indicadores = [
  { tipo: "gastos", etiqueta: "Gastos", icono: ArrowDownRight, tono: "text-cat-expense", fondo: "bg-cat-expense/10" },
  { tipo: "ahorros", etiqueta: "Ahorros", icono: PiggyBank, tono: "text-emerald-primary", fondo: "bg-emerald-primary/10" },
  { tipo: "balance", etiqueta: "Balance disponible", icono: Wallet, tono: "text-cat-income", fondo: "bg-cat-income/10" },
];

/** Página de resúmenes contables y movimientos de ejemplo. */
export default function PaginaDashboardContabilidad({ movimientos: movimientosIniciales = MOVIMIENTOS_DEMO }) {
  const navigate = useNavigate();
  const { usuario } = useUsuarioActivo();
  const [movimientos, setMovimientos] = useState(movimientosIniciales);
  const [detalle, setDetalle] = useState(null);
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [respuesta, setRespuesta] = useState(null);
  const disparadorRef = useRef(null);
  const movimientosDelMes = useMemo(() => {
    const hoy = new Date();
    const mes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    return movimientos.filter((m) => m.fecha.slice(0, 7) === mes);
  }, [movimientos]);
  const gastos = movimientosDelMes.filter((m) => m.tipo.toLowerCase() === "gasto").reduce((total, m) => total + Math.abs(m.monto), 0);
  const ahorros = movimientosDelMes.filter((m) => m.tipo.toLowerCase() === "ahorro").reduce((total, m) => total + Math.abs(m.monto), 0);
  const balance = movimientosDelMes.reduce((total, m) => total + m.monto, 0);
  const importes = { gastos, ahorros, balance };

  const agregarResumen = (resumen) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; }
    const tipo = resumen.tipoMovimiento === "gasto" ? "Gasto" : resumen.tipoMovimiento === "ahorro" ? "Ahorro" : "Ingreso";
    const monto = resumen.tipoMovimiento === "gasto" || resumen.tipoMovimiento === "ahorro" ? -resumen.monto : resumen.monto;
    const fecha = `${resumen.periodo}-${resumen.fecha.slice(-2)}`;
    setMovimientos((actuales) => [{ id: resumen.id, fecha, concepto: resumen.concepto, categoria: resumen.categoria, monto, tipo }, ...actuales]);
    setRespuesta({ tipo: "exito", mensaje: "Resumen agregado a esta demostración." });
  };

  return (
    <section aria-labelledby="contabilidad-titulo" className="space-y-6 pt-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="contabilidad-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">Contabilidad</h1>
          <p className="mt-1 text-sm text-slate-text">Revisa tus gastos, ahorros y balance disponible.</p>
        </div>
        <button type="button" disabled aria-describedby="movimientos-demo-aviso" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream opacity-50 shadow-sm cursor-not-allowed">
          <Plus className="h-4 w-4" aria-hidden="true" />Nuevo movimiento
        </button>
      </header>
      <p id="movimientos-demo-aviso" className="sr-only">El registro de movimientos no está disponible en esta demostración.</p>

      <section aria-labelledby="resumen-contable-titulo" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="resumen-contable-titulo" className="font-display text-xl font-semibold text-bg-dark">Resumen contable</h2>
            <p className="mt-1 text-xs text-slate-text">Selecciona una tarjeta para ver el detalle por periodo.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-primary/10 px-3 py-1 text-xs font-medium text-emerald-primary">Datos de demostración</span>
            <button ref={disparadorRef} type="button" onClick={(evento) => { if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; } disparadorRef.current = evento.currentTarget; setRespuesta(null); setCrearAbierto(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-primary px-3 py-2 text-sm font-semibold text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />Agregar nuevo resumen
            </button>
          </div>
        </div>
        <RespuestaModal respuesta={respuesta} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {indicadores.map(({ tipo, etiqueta, icono: Icono, tono, fondo }) => (
            <Card key={tipo} como="button" type="button" aria-label={`Ver detalle de ${etiqueta}`} aria-haspopup="dialog" onClick={(evento) => { disparadorRef.current = evento.currentTarget; setDetalle(tipo); }} className="group w-full cursor-pointer p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="text-sm font-medium text-slate-text">{etiqueta}</h3><p className="mt-2 font-display text-2xl font-semibold tabular-nums text-bg-dark">{formatoMoneda.format(importes[tipo])}</p><span className="mt-3 inline-block text-xs font-medium text-emerald-primary">Ver detalle →</span></div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${fondo} ${tono}`}><Icono className="h-5 w-5" aria-hidden="true" /></span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card como="section" aria-labelledby="movimientos-titulo" className="overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-border-line/60 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="movimientos-titulo" className="font-display text-xl font-semibold text-bg-dark">Movimientos recientes</h2><p className="mt-1 text-sm text-slate-text">Actividad de ejemplo para la vista previa contable.</p></div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-text">Demostración</span>
        </div>
        {movimientos.length ? <ul aria-label="Movimientos de demostración" className="divide-y divide-border-line/50 px-5">
          {movimientos.map((movimiento) => {
            const ingreso = movimiento.monto > 0;
            const IconoMovimiento = ingreso ? ArrowUpRight : ArrowDownRight;
            const tono = ingreso ? "text-cat-income" : movimiento.tipo === "Ahorro" ? "text-emerald-primary" : "text-cat-expense";
            return <li key={movimiento.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-cream ${tono}`}><IconoMovimiento className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate font-medium text-bg-dark">{movimiento.concepto}</p><time className="text-sm text-slate-text" dateTime={movimiento.fecha}>{formatoFecha.format(new Date(`${movimiento.fecha}T00:00:00Z`))}</time></div></div>
              <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0"><span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-medium text-slate-text">{movimiento.tipo}</span><span className={`min-w-28 text-right font-medium tabular-nums ${tono}`}>{ingreso ? "+" : "−"}{formatoMoneda.format(Math.abs(movimiento.monto))}</span></div>
            </li>;
          })}
        </ul> : <p className="px-5 py-10 text-center text-slate-text">Sin movimientos registrados</p>}
      </Card>

      <ModalDetalleResumenContable abierto={Boolean(detalle)} tipo={detalle} movimientos={movimientos} triggerRef={disparadorRef} alCerrar={() => setDetalle(null)} />
      <ModalCrearResumenContable abierto={crearAbierto} triggerRef={disparadorRef} alCerrar={() => setCrearAbierto(false)} alGuardar={agregarResumen} />
    </section>
  );
}
