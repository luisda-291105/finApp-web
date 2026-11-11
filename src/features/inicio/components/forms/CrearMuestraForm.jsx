import { FUENTES_MUESTRAS, SEGMENTOS_CONTABLES, TIPOS_VISUALIZACION } from "../../utils/inicioHelpers";

/** Campos controlados para crear o editar una muestra. */
export default function CrearMuestraForm({
  borrador, indiceEditando, guardando, error, cuentasCorreo = [], cargandoCuentasCorreo = false,
  errorCuentasCorreo = "", alCambiar, alGuardar,
}) {
  const fuenteSeleccionada = borrador.fuente || "";
  const cuentasSeleccionadas = Array.isArray(borrador.cuentasCorreo)
    ? borrador.cuentasCorreo
    : [borrador.cuentaCorreo || "todas"];
  const cuentasGuardadasNoDisponibles = cuentasSeleccionadas
    .filter((id) => id !== "todas" && !cuentasCorreo.some((cuenta) => String(cuenta.id) === String(id)));

  return (
    <form className="space-y-4 px-5 py-4" onSubmit={(evento) => { evento.preventDefault(); alGuardar(); }}>
      <label htmlFor="muestra-titulo" className="flex flex-col gap-1.5 text-sm font-medium text-bg-dark">
        Título de la muestra
        <input id="muestra-titulo" placeholder="Ej. Mis gastos de la semana" type="text" maxLength={255} value={borrador.titulo} onChange={(evento) => alCambiar("titulo", evento.target.value)} className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" />
      </label>

      <label htmlFor="muestra-fuente" className="flex flex-col gap-1.5 text-sm font-medium text-bg-dark">
        Fuente de la muestra
        <select id="muestra-fuente" value={fuenteSeleccionada} onChange={(evento) => alCambiar("fuente", evento.target.value)} className="w-full cursor-pointer rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
          <option value="" disabled>Elegir fuente</option>
          {FUENTES_MUESTRAS.map((fuente) => <option key={fuente.valor} value={fuente.valor}>{fuente.etiqueta}</option>)}
        </select>
      </label>

      {fuenteSeleccionada === "contabilidad" && <label htmlFor="muestra-segmento-contable" className="flex flex-col gap-1.5 text-sm font-medium text-bg-dark">
        Qué mostrar de Contabilidad
        <select id="muestra-segmento-contable" value={borrador.segmentoContable || "todos"} onChange={(evento) => alCambiar("segmentoContable", evento.target.value)} className="w-full cursor-pointer rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
          {SEGMENTOS_CONTABLES.map((segmento) => <option key={segmento.valor} value={segmento.valor}>{segmento.etiqueta}</option>)}
        </select>
      </label>}

      {fuenteSeleccionada === "correo" && <>
        <fieldset className="space-y-2" disabled={cargandoCuentasCorreo}>
          <legend className="mb-1 text-sm font-medium text-bg-dark">Cuentas de correo</legend>
          <p className="text-xs text-slate-text">Selecciona una o más cuentas para incluir sus correos.</p>
          <div className="grid gap-2">
            <label className="flex min-h-10 items-center gap-2 rounded-lg border border-border-line/60 bg-bg-cream px-3 py-2 text-sm text-bg-dark">
              <input
                type="checkbox"
                checked={cuentasSeleccionadas.includes("todas")}
                onChange={(evento) => alCambiar("cuentasCorreo", evento.target.checked ? ["todas"] : [])}
                className="accent-emerald-primary"
              />
              Todos los correos
            </label>
            {cuentasGuardadasNoDisponibles.map((id) => <label key={id} className="flex min-h-10 items-center gap-2 rounded-lg border border-border-line/60 bg-bg-cream px-3 py-2 text-sm text-bg-dark">
              <input type="checkbox" checked disabled className="accent-emerald-primary" />
              Cuenta guardada no disponible
            </label>)}
            {cuentasCorreo.map((cuenta) => {
              const id = String(cuenta.id);
              return <label key={id} className="flex min-h-10 items-center gap-2 rounded-lg border border-border-line/60 bg-bg-cream px-3 py-2 text-sm text-bg-dark">
                <input
                  type="checkbox"
                  checked={cuentasSeleccionadas.includes("todas") || cuentasSeleccionadas.includes(id)}
                  onChange={(evento) => {
                    const seleccionadas = evento.target.checked
                      ? [...cuentasSeleccionadas.filter((valor) => valor !== "todas"), id]
                      : cuentasSeleccionadas.includes("todas")
                        ? cuentasCorreo.map((item) => String(item.id)).filter((valor) => valor !== id)
                        : cuentasSeleccionadas.filter((valor) => valor !== id);
                    alCambiar("cuentasCorreo", seleccionadas);
                  }}
                  className="accent-emerald-primary"
                />
                {cuenta.email || "Cuenta de correo"}
              </label>;
            })}
          </div>
        </fieldset>
        {cargandoCuentasCorreo && <p role="status" className="text-sm text-slate-text">Cargando cuentas de correo…</p>}
        {errorCuentasCorreo && <p role="alert" className="text-sm text-red-700">{errorCuentasCorreo}</p>}
        {!cargandoCuentasCorreo && !errorCuentasCorreo && cuentasCorreo.length === 0 && <p className="text-sm text-slate-text">No hay cuentas de correo disponibles.</p>}
      </>}

      <label htmlFor="muestra-tipo" className="flex flex-col gap-1.5 text-sm font-medium text-bg-dark">
        Tipo de visualización
        <select id="muestra-tipo" value={borrador.tipo} onChange={(evento) => alCambiar("tipo", evento.target.value)} className="w-full cursor-pointer rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
          <option value="" disabled>Elegir tipo</option>
          {TIPOS_VISUALIZACION.map((tipo) => <option key={tipo.valor} value={tipo.valor}>{tipo.etiqueta}</option>)}
        </select>
      </label>

      <button type="submit" disabled={guardando} className="w-full cursor-pointer rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-60">
        {guardando ? "Guardando…" : indiceEditando === null ? "guardar muestra" : "guardar cambios"}
      </button>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
    </form>
  );
}
