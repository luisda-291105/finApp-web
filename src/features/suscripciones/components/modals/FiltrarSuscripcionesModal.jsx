/**
 * @uso        Filtrar suscripciones detectadas por cuenta, categoría y baja
 * @funciones  FiltrarSuscripcionesModal({ abierto, filtros, cuentas, ... })
 * @datos      Recibe cuentas autorizadas, cantidades y categorías (incluidas personalizadas)
 * @eventos    Alterna filtros, crea categoría y aplica o limpia
 * @estados    Ninguno; filtros controlados externamente
 * @usadoPor   SuscripcionesPage
 */
import { Check, Layers3, Plus, RotateCcw, Tag } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

const CATEGORIAS_BASE = [
  { id: "CATEGORY_PROMOTIONS", nombre: "Promociones" },
  { id: "CATEGORY_UPDATES", nombre: "Actualizaciones" },
];

function GrupoCasillas({ titulo, campo, opciones, seleccionadas, alCambiar }) {
  return (
    <fieldset className="rounded-xl border border-border-line/60 p-3">
      <legend className="px-1 text-sm font-semibold text-bg-dark">
        {titulo}
      </legend>
      <div className="mt-1 space-y-1">
        {opciones.map(({ id, texto, cantidad }) => (
          <label
            key={id}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm text-bg-dark transition-colors hover:bg-emerald-primary/5"
          >
            <input
              type="checkbox"
              checked={seleccionadas.includes(id)}
              onChange={() => alCambiar(campo, id)}
              className="h-4 w-4 shrink-0 accent-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            />
            <span className="min-w-0 flex-1 break-all">{texto}</span>
            <span className="rounded-full bg-bg-cream/70 px-2 py-0.5 text-xs tabular-nums text-slate-text">
              {cantidad}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Panel de filtros con categorías, cuentas y baja. */
export default function FiltrarSuscripcionesModal({
  abierto,
  alCerrar,
  triggerRef,
  filtros,
  alCambiarFiltro,
  alLimpiar,
  cuentas,
  cantidades,
  totalCategorias = 0,
  categoriasPersonalizadas = [],
  alCrearCategoria,
}) {
  const opcionesCuentas = cuentas.map((cuenta) => ({
    id: String(cuenta.id),
    texto: cuenta.email,
    cantidad: cantidades.cuenta[String(cuenta.id)] || 0,
  }));
  const opcionesBaja = [
    {
      id: "SI",
      texto: "Con opción de baja",
      cantidad: cantidades.baja.SI || 0,
    },
    {
      id: "NO",
      texto: "Sin opción de baja",
      cantidad: cantidades.baja.NO || 0,
    },
  ];
  const todasActivas = filtros.categorias.length === 0;

  return (
    <ModalDetalleRegistro
      abierto={abierto}
      titulo="Filtrar suscripciones"
      alCerrar={alCerrar}
      triggerRef={triggerRef}
      ancho="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-text">
          Marca una o varias opciones. Si dejas un grupo sin marcar, se incluyen
          todas sus opciones.
        </p>

        <section
          aria-label="Categorías"
          className="rounded-xl border border-border-line/60 p-3"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-bg-dark">Categorías</h3>
            <button
              type="button"
              onClick={alCrearCategoria}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-primary/50 bg-emerald-primary/10 px-3 text-sm font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary hover:text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Crear categoría
            </button>
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filtrar suscripciones por categoría"
          >
            <button
              type="button"
              aria-pressed={todasActivas}
              onClick={() => alCambiarFiltro("categorias", "TODAS")}
              className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${todasActivas ? "border-emerald-primary bg-emerald-primary text-white" : "border-border-line text-slate-text hover:border-emerald-primary/50"}`}
            >
              <Layers3 className="h-4 w-4" aria-hidden="true" />
              Todas
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs tabular-nums">
                {totalCategorias}
              </span>
            </button>
            {CATEGORIAS_BASE.map(({ id, nombre }) => {
              const activa = filtros.categorias.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => alCambiarFiltro("categorias", id)}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors ${activa ? "border-emerald-primary bg-emerald-primary text-white" : "border-border-line bg-bg-cream/40 text-bg-dark hover:border-emerald-primary/50"}`}
                >
                  <Tag className="h-4 w-4" aria-hidden="true" />
                  {nombre}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${activa ? "bg-white/20 text-white" : "bg-bg-cream/70 text-slate-text"}`}
                  >
                    {cantidades.categoria[id] || 0}
                  </span>
                </button>
              );
            })}
            {categoriasPersonalizadas.map(({ nombre, cantidad }) => {
              const activa = filtros.categorias.includes(nombre);
              return (
                <button
                  key={nombre}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => alCambiarFiltro("categorias", nombre)}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors ${activa ? "border-emerald-primary bg-emerald-primary text-white" : "border-border-line bg-bg-cream/40 text-bg-dark hover:border-emerald-primary/50"}`}
                >
                  <Tag className="h-4 w-4" aria-hidden="true" />
                  {nombre}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${activa ? "bg-white/20 text-white" : "bg-bg-cream/70 text-slate-text"}`}
                  >
                    {cantidad}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {opcionesCuentas.length > 0 && (
          <GrupoCasillas
            titulo="Cuenta Gmail"
            campo="cuentas"
            opciones={opcionesCuentas}
            seleccionadas={filtros.cuentas}
            alCambiar={alCambiarFiltro}
          />
        )}
        <GrupoCasillas
          titulo="Disponibilidad de baja"
          campo="baja"
          opciones={opcionesBaja}
          seleccionadas={filtros.baja}
          alCambiar={alCambiarFiltro}
        />
        <div className="flex justify-between gap-2 border-t border-border-line/40 pt-3">
          <button
            type="button"
            onClick={alLimpiar}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-line px-3 text-sm font-medium text-slate-text hover:text-bg-dark"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Limpiar
          </button>
          <button
            type="button"
            onClick={alCerrar}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Ver resultados
          </button>
        </div>
      </div>
    </ModalDetalleRegistro>
  );
}
