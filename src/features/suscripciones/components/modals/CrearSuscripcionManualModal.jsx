/**
 * @uso        Registrar manualmente una suscripción de cobro o importante
 * @funciones  CrearSuscripcionManualModal({ abierto, alCerrar, triggerRef, valores, alCambiar, alGuardar, categorias, guardando })
 * @datos      Formulario controlado con nombre, monto, fecha de cobro, categoría, importancia, prioridad y apodo
 * @eventos    Cambio de campos, submit para guardar y cierre del modal
 * @estados    Ninguno (controlado por props)
 * @usadoPor   SuscripcionesPage
 */
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

export default function CrearSuscripcionManualModal({
  abierto,
  alCerrar,
  triggerRef,
  valores,
  alCambiar,
  alGuardar,
  categorias,
  guardando = false,
}) {
  return (
    <ModalDetalleRegistro
      abierto={abierto}
      titulo="Registrar suscripción"
      alCerrar={alCerrar}
      triggerRef={triggerRef}
      ancho="max-w-md"
    >
      <form className="space-y-4" onSubmit={alGuardar}>
        <p className="text-sm text-slate-text">
          Registra manualmente una suscripción de cobro o importante y ajústale
          importancia, prioridad y apodo.
        </p>
        <label className="block space-y-2 text-sm font-medium text-bg-dark">
          Nombre
          <input
            required
            maxLength={60}
            value={valores.nombre}
            onChange={(e) => alCambiar("nombre", e.target.value)}
            placeholder="Ej. Netflix, Internet"
            className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-bg-dark">
            Monto (COP)
            <input
              required
              type="text"
              inputMode="decimal"
              value={valores.monto}
              onChange={(e) => alCambiar("monto", e.target.value)}
              placeholder="Ej. 47.068,11"
              className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-bg-dark">
            Fecha de cobro
            <input
              required
              type="date"
              value={valores.fechaCobro}
              onChange={(e) => alCambiar("fechaCobro", e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-bg-dark">
            Categoría
            <select
              value={valores.categoria}
              onChange={(e) => alCambiar("categoria", e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-bg-dark">
            Importancia
            <select
              value={valores.importancia}
              onChange={(e) => alCambiar("importancia", e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-bg-dark">
            Prioridad
            <select
              value={valores.prioridad ?? "Media"}
              onChange={(e) => alCambiar("prioridad", e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-bg-dark">
            Apodo (opcional)
            <input
              type="text"
              maxLength={120}
              value={valores.apodo ?? ""}
              onChange={(e) => alCambiar("apodo", e.target.value)}
              placeholder="Ej. Alertas del banco"
              className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border-line/40 pt-3">
          <button
            type="button"
            onClick={alCerrar}
            disabled={guardando}
            className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar suscripción"}
          </button>
        </div>
      </form>
    </ModalDetalleRegistro>
  );
}
