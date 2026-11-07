/**
 * @uso        Campos del formulario de creación de grupo
 * @funciones  GrupoForm({ valores, alCambiar, deshabilitado })
 * @datos      Edita nombre y descripción
 * @eventos    Cambio de campos
 * @estados    Controlados por el modal padre
 * @usadoPor   CrearGrupoModal
 */
/** Renderiza los campos controlados del grupo. */
export default function GrupoForm({ valores, alCambiar, deshabilitado }) {
  return (
    <>
      <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="registro-grupo-nombre">Nombre del grupo
        <input id="registro-grupo-nombre" required maxLength={100} value={valores.nombre} placeholder="Ej. Viaje a la medellin" onChange={(evento) => alCambiar("nombre", evento.target.value)} disabled={deshabilitado} className="w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="registro-grupo-descripcion">Descripción
        <textarea id="registro-grupo-descripcion" required maxLength={255} value={valores.descripcion} placeholder="¿Para qué usarás este grupo?" onChange={(evento) => alCambiar("descripcion", evento.target.value)} disabled={deshabilitado} className="min-h-24 w-full min-w-0 resize-y rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
      </label>
    </>
  );
}
