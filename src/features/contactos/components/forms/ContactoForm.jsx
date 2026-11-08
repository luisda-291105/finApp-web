/**
 * @uso        Campos del formulario para crear un contacto
 * @funciones  ContactoForm({ valores, alCambiar, deshabilitado })
 * @datos      Controla nombre, teléfono y notas
 * @eventos    Cambios de campos
 * @estados    Controlados por el modal padre
 * @usadoPor   CrearContactoModal
 */
/** Renderiza los campos controlados del contacto. */
export default function ContactoForm({ valores, alCambiar, deshabilitado }) {
  return <>
    <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="registro-contacto-nombre">Nombre
      <input id="registro-contacto-nombre" required maxLength={255} value={valores.nombre} placeholder="Ej. Laura Gómez" onChange={(evento) => alCambiar("nombre", evento.target.value)} disabled={deshabilitado} className="w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="registro-contacto-telefono">Teléfono
      <input id="registro-contacto-telefono" type="tel" maxLength={64} value={valores.telefono} placeholder="Ej. 300 123 4567" onChange={(evento) => alCambiar("telefono", evento.target.value)} disabled={deshabilitado} className="w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="registro-contacto-correo">Correo electrónico
      <input id="registro-contacto-correo" type="email" maxLength={254} value={valores.correo || ""} placeholder="Ej. contacto@correo.com" onChange={(evento) => alCambiar("correo", evento.target.value)} disabled={deshabilitado} className="w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="registro-contacto-cargo">Cargo
      <input id="registro-contacto-cargo" maxLength={150} value={valores.cargo || ""} placeholder="Ej. Analista financiero" onChange={(evento) => alCambiar("cargo", evento.target.value)} disabled={deshabilitado} className="w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="registro-contacto-empresa">Empresa
      <input id="registro-contacto-empresa" maxLength={150} value={valores.empresa || ""} placeholder="Ej. FinApp" onChange={(evento) => alCambiar("empresa", evento.target.value)} disabled={deshabilitado} className="w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="registro-contacto-notas">Notas
      <input id="registro-contacto-notas" type="text" maxLength={255} value={valores.notas} placeholder="Añade notas sobre este contacto" onChange={(evento) => alCambiar("notas", evento.target.value)} disabled={deshabilitado} className="w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
    </label>
  </>;
}
