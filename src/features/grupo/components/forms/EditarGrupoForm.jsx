/**
 * @uso        Formulario de edición de los datos básicos del grupo
 * @funciones  EditarGrupoForm({ nombre, descripcion, alCambiarNombre, alCambiarDescripcion, alGuardar, cargando })
 * @datos      Presenta valores controlados por el modal de detalle
 * @eventos    Submit y cambios de nombre/descripción
 * @estados    Ninguno
 * @usadoPor   GrupoDetalleModal
 */
/** Renderiza y valida los campos de edición del grupo. */
export default function EditarGrupoForm({ nombre, descripcion, alCambiarNombre, alCambiarDescripcion, alGuardar, cargando }) {
  return (
    <form onSubmit={alGuardar} className="mt-4 grid gap-3 border-t border-border-line/30 pt-4">
      <label className="grid gap-1 text-sm font-medium">Nombre
        <input required value={nombre} maxLength={100} placeholder="Nombre del grupo" onChange={(evento) => alCambiarNombre(evento.target.value)} disabled={cargando} className="min-h-10 w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">Descripción
        <textarea required value={descripcion} maxLength={255} placeholder="Descripción del grupo" onChange={(evento) => alCambiarDescripcion(evento.target.value)} disabled={cargando} className="min-h-20 w-full min-w-0 resize-y rounded-xl border border-border-line bg-bg-cream px-3 py-2 font-normal" />
      </label>
      <button type="submit" disabled={cargando} className="min-h-10 justify-self-start rounded-xl bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover disabled:opacity-50">{cargando ? "Guardando…" : "Guardar cambios"}</button>
    </form>
  );
}
