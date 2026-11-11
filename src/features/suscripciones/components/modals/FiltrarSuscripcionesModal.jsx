/**
 * @uso        Filtrar suscripciones detectadas por cuenta, categoría y baja
 * @funciones  FiltrarSuscripcionesModal({ abierto, filtros, cuentas, ... })
 * @datos      Recibe cuentas autorizadas y cantidades calculadas por la página
 * @eventos    Alterna casillas y aplica o limpia los filtros
 * @estados    Ninguno; filtros controlados externamente
 * @usadoPor   SuscripcionesPage
 */
import { Check, RotateCcw } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

function GrupoCasillas({ titulo, campo, opciones, seleccionadas, alCambiar }) {
  return <fieldset className="rounded-xl border border-border-line/60 p-3">
    <legend className="px-1 text-sm font-semibold text-bg-dark">{titulo}</legend>
    <div className="mt-1 space-y-1">
      {opciones.map(({ id, texto, cantidad }) => <label key={id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm text-bg-dark transition-colors hover:bg-emerald-primary/5">
        <input type="checkbox" checked={seleccionadas.includes(id)} onChange={() => alCambiar(campo, id)} className="h-4 w-4 shrink-0 accent-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" />
        <span className="min-w-0 flex-1 break-all">{texto}</span>
        <span className="rounded-full bg-bg-cream/70 px-2 py-0.5 text-xs tabular-nums text-slate-text">{cantidad}</span>
      </label>)}
    </div>
  </fieldset>;
}

/** Panel de filtros con selección múltiple mediante casillas. */
export default function FiltrarSuscripcionesModal({ abierto, alCerrar, triggerRef, filtros, alCambiarFiltro, alLimpiar, cuentas, cantidades }) {
  const opcionesCuentas = cuentas.map((cuenta) => ({ id: String(cuenta.id), texto: cuenta.email, cantidad: cantidades.cuenta[String(cuenta.id)] || 0 }));
  const opcionesCategorias = [
    { id: "CATEGORY_PROMOTIONS", texto: "Promociones", cantidad: cantidades.categoria.CATEGORY_PROMOTIONS || 0 },
    { id: "CATEGORY_UPDATES", texto: "Actualizaciones", cantidad: cantidades.categoria.CATEGORY_UPDATES || 0 },
  ];
  const opcionesBaja = [
    { id: "SI", texto: "Con opción de baja", cantidad: cantidades.baja.SI || 0 },
    { id: "NO", texto: "Sin opción de baja", cantidad: cantidades.baja.NO || 0 },
  ];

  return <ModalDetalleRegistro abierto={abierto} titulo="Filtrar suscripciones" alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-md">
    <div className="space-y-3">
      <p className="text-sm text-slate-text">Marca una o varias opciones. Si dejas un grupo sin marcar, se incluyen todas sus opciones.</p>
      {opcionesCuentas.length > 0 && <GrupoCasillas titulo="Cuenta Gmail" campo="cuentas" opciones={opcionesCuentas} seleccionadas={filtros.cuentas} alCambiar={alCambiarFiltro} />}
      <GrupoCasillas titulo="Categoría" campo="categorias" opciones={opcionesCategorias} seleccionadas={filtros.categorias} alCambiar={alCambiarFiltro} />
      <GrupoCasillas titulo="Disponibilidad de baja" campo="baja" opciones={opcionesBaja} seleccionadas={filtros.baja} alCambiar={alCambiarFiltro} />
      <div className="flex justify-between gap-2 border-t border-border-line/40 pt-3">
        <button type="button" onClick={alLimpiar} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-line px-3 text-sm font-medium text-slate-text hover:text-bg-dark"><RotateCcw className="h-4 w-4" aria-hidden="true" />Limpiar</button>
        <button type="button" onClick={alCerrar} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white"><Check className="h-4 w-4" aria-hidden="true" />Ver resultados</button>
      </div>
    </div>
  </ModalDetalleRegistro>;
}
