import { CalendarDays, CreditCard, Repeat } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { formatoFechaPago, formatoMoneda } from "../../utils/suscripcionesData";

/** Detalle informativo de una suscripción y su historial de pagos de demostración. */
export default function DetalleSuscripcionModal({ suscripcion, triggerRef, onCerrar }) {
  if (!suscripcion) return null;
  const { nombre, categoria, monto, diaCobro, activa, fuente, pagosPasados = [], Icono } = suscripcion;
  const ultimoPago = pagosPasados[0] || null;

  return (
    <ModalDetalleRegistro abierto={Boolean(suscripcion)} titulo={`Detalle de ${nombre}`} alCerrar={onCerrar} triggerRef={triggerRef} ancho="max-w-lg" icono={Icono}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-sm text-slate-text">{categoria}</p><p className="mt-1 font-display text-2xl font-semibold text-bg-dark">{formatoMoneda.format(monto)} <span className="text-sm font-normal text-slate-text">/ mes</span></p></div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${activa ? "bg-emerald-primary/10 text-emerald-primary" : "bg-border-line/40 text-slate-text"}`}>{activa ? "Activa" : "Pausada"}</span>
        </div>

        <dl className="grid gap-3 rounded-2xl bg-bg-cream/70 p-4 sm:grid-cols-2">
          <div className="flex items-start gap-3"><CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-emerald-primary" aria-hidden="true" /><div><dt className="text-xs text-slate-text">Fuente de pago</dt><dd className="mt-1 text-sm font-medium text-bg-dark">{fuente || "Sin fuente registrada"}</dd></div></div>
          <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-primary" aria-hidden="true" /><div><dt className="text-xs text-slate-text">Último pago</dt><dd className="mt-1 text-sm font-medium text-bg-dark">{ultimoPago ? formatoFechaPago.format(new Date(`${ultimoPago.fecha}T00:00:00Z`)) : "Sin pagos registrados"}</dd></div></div>
          <div className="flex items-start gap-3"><Repeat className="mt-0.5 h-4 w-4 shrink-0 text-emerald-primary" aria-hidden="true" /><div><dt className="text-xs text-slate-text">Frecuencia</dt><dd className="mt-1 text-sm font-medium text-bg-dark">Mensual · día {diaCobro}</dd></div></div>
        </dl>

        <section aria-labelledby="pagos-pasados-titulo">
          <h3 id="pagos-pasados-titulo" className="font-display text-lg font-semibold text-bg-dark">Pagos pasados</h3>
          {pagosPasados.length ? <ul className="mt-2 divide-y divide-border-line/40 rounded-xl border border-border-line/40 px-4">
            {pagosPasados.map((pago) => <li key={pago.fecha} className="flex items-center justify-between gap-4 py-3 text-sm"><time className="text-slate-text" dateTime={pago.fecha}>{formatoFechaPago.format(new Date(`${pago.fecha}T00:00:00Z`))}</time><span className="font-semibold tabular-nums text-bg-dark">{formatoMoneda.format(pago.monto)}</span></li>)}
          </ul> : <p className="mt-2 text-sm text-slate-text">Todavía no hay pagos pasados.</p>}
        </section>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border-line/40 pt-4">
          <button type="button" disabled title="Edición disponible próximamente" className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-slate-text opacity-60">Editar</button>
          <button type="button" disabled title="Eliminación disponible próximamente" className="min-h-10 rounded-xl border border-red-200 px-4 text-sm font-medium text-red-700 opacity-60">Eliminar</button>
        </div>

        <p className="rounded-xl border border-border-line/50 bg-bg-cream/60 p-3 text-xs text-slate-text">Fuente e historial de ejemplo; esta demostración no representa transacciones reales.</p>
      </div>
    </ModalDetalleRegistro>
  );
}
