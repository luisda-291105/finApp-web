import { CalendarDays, Repeat, Wallet } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { formatoMoneda } from "../../utils/suscripcionesData";

/** Tarjetas con gasto mensual, cantidad activa y próximo cobro. */
export default function ResumenSuscripciones({ resumen, totalSuscripciones }) {
  const { activas, totalMensual, proximoCobro } = resumen;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="p-5"><div className="flex items-center gap-2 text-emerald-primary"><Wallet className="h-5 w-5" aria-hidden="true" /><h2 className="text-sm font-medium">Gasto mensual activo</h2></div><p className="mt-3 font-display text-2xl font-semibold text-bg-dark" data-testid="total-mensual">{formatoMoneda.format(totalMensual)}</p><p className="mt-1 text-xs text-slate-text">Suma de las suscripciones activas.</p></Card>
      <Card className="p-5"><div className="flex items-center gap-2 text-emerald-primary"><Repeat className="h-5 w-5" aria-hidden="true" /><h2 className="text-sm font-medium">Suscripciones activas</h2></div><p className="mt-3 font-display text-2xl font-semibold text-bg-dark" data-testid="total-activas">{activas.length} de {totalSuscripciones}</p><p className="mt-1 text-xs text-slate-text">Puedes pausar las que no estés usando.</p></Card>
      <Card className="p-5"><div className="flex items-center gap-2 text-emerald-primary"><CalendarDays className="h-5 w-5" aria-hidden="true" /><h2 className="text-sm font-medium">Próximo cobro</h2></div><p className="mt-3 font-display text-2xl font-semibold text-bg-dark">{proximoCobro ? `Día ${proximoCobro.diaCobro}` : "Sin cobros"}</p><p className="mt-1 text-xs text-slate-text">{proximoCobro ? proximoCobro.nombre : "No hay suscripciones activas."}</p></Card>
    </div>
  );
}
