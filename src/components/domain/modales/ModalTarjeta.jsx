/**
 * @uso        Presenta el detalle de una tarjeta registrada
 * @funciones  ModalTarjeta({ tarjeta, onCerrar, triggerRef })
 * @datos      Recibe una tarjeta; enmascara el número y omite el CVV
 * @eventos    Cierre delegado a ModalDetalleRegistro; flip en MiTarjetaVirtual
 * @estados    Tarjeta seleccionada controlada por la página; giro local de la tarjeta
 * @usadoPor   PaginaDashboardTarjetas
 */
import MiTarjetaVirtual from "../dashboard/MiTarjetaVirtual";
import ModalDetalleRegistro from "./ModalDetalleRegistro";

export default function ModalTarjeta({ tarjeta, onCerrar, triggerRef }) {
  const numeroEnmascarado = tarjeta
    ? `•••• ${String(tarjeta.numero || "").replace(/\D/g, "").slice(-4)}`
    : "";

  return (
    <ModalDetalleRegistro
      abierto={Boolean(tarjeta)}
      titulo={`Tarjeta de ${tarjeta?.titular || "Titular"}`}
      alCerrar={onCerrar}
      triggerRef={triggerRef}
      ancho="max-w-md"
    >
      {tarjeta && (
        <>
          <MiTarjetaVirtual
            titular={tarjeta.titular}
            numero={numeroEnmascarado}
            expiracion={tarjeta.expiracion}
            cvv=""
            entidad={tarjeta.entidad}
          />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs uppercase tracking-wider text-slate-text">Titular</dt><dd>{tarjeta.titular}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-slate-text">Número</dt><dd className="font-mono">{numeroEnmascarado}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-slate-text">Expira</dt><dd>{tarjeta.expiracion}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-slate-text">Entidad</dt><dd>{tarjeta.entidad || "Sin entidad"}</dd></div>
          </dl>
          <h3 className="mt-6 mb-2 font-display text-base font-semibold">Movimientos</h3>
          <p className="rounded-xl border border-border-line/40 p-4 text-sm text-slate-text">
            Esta tarjeta todavía no tiene movimientos registrados.
          </p>
        </>
      )}
    </ModalDetalleRegistro>
  );
}
