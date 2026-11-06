import { useEffect, useState } from "react";
import { Pencil, Phone, Share2, StickyNote, Trash2, UserRound } from "lucide-react";
import ModalDetalleRegistro from "./ModalDetalleRegistro";

export default function ModalContacto({ contacto, onCerrar, triggerRef, onGuardar, onEliminar }) {
  const [modo, setModo] = useState("detalle");
  const [valores, setValores] = useState({ nombre: "", telefono: "", notas: "" });
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    setModo("detalle");
    setError("");
    setValores({ nombre: contacto?.nombre || "", telefono: contacto?.telefono || "", notas: contacto?.notas || "" });
  }, [contacto]);

  const actualizarCampo = (campo, valor) => setValores((actuales) => ({ ...actuales, [campo]: valor }));
  const guardar = async (evento) => {
    evento.preventDefault();
    if (!contacto?.idContacto || !valores.nombre.trim() || !valores.telefono.trim()) {
      setError("El nombre y el teléfono son obligatorios.");
      return;
    }
    setOcupado(true);
    setError("");
    try {
      await onGuardar(contacto.idContacto, { nombre: valores.nombre.trim(), telefono: valores.telefono.trim(), notas: valores.notas.trim() });
      setModo("detalle");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo actualizar el contacto.");
    } finally { setOcupado(false); }
  };
  const eliminar = async () => {
    setOcupado(true);
    setError("");
    try { await onEliminar(contacto.idContacto); }
    catch (fallo) { setError(fallo?.message || "No se pudo eliminar el contacto."); }
    finally { setOcupado(false); }
  };

  const titulo = modo === "editar" ? "Editar contacto" : modo === "eliminar" ? "Eliminar contacto" : `Contacto: ${contacto?.nombre || ""}`;
  return (
    <ModalDetalleRegistro abierto={Boolean(contacto)} titulo={titulo} alCerrar={onCerrar} triggerRef={triggerRef} ancho="max-w-md">
      {contacto && modo === "detalle" && <>
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-primary/10 text-emerald-primary"><UserRound className="h-8 w-8" aria-hidden="true" /></span>
          <h3 className="font-display text-xl font-semibold">{contacto.nombre}</h3>
        </div>
        <dl className="space-y-4 border-y border-border-line/30 py-4 text-sm">
          <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-emerald-primary" aria-hidden="true" /><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Teléfono</dt><dd className="mt-1">{contacto.telefono || "Sin teléfono"}</dd></div></div>
          <div className="flex items-start gap-3"><StickyNote className="mt-0.5 h-4 w-4 text-emerald-primary" aria-hidden="true" /><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Notas</dt><dd className="mt-1 whitespace-pre-wrap">{contacto.notas || "Sin notas"}</dd></div></div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setError(""); setModo("editar"); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Pencil className="h-4 w-4" aria-hidden="true" />Editar</button>
          <button type="button" onClick={() => { setError(""); setModo("eliminar"); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-line/60 bg-white/5 px-4 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar</button>
          <button type="button" onClick={() => setModo("compartir")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-line/60 bg-white/5 px-4 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Share2 className="h-4 w-4" aria-hidden="true" />Compartir</button>
        </div>
      </>}
      {contacto && modo === "editar" && <form onSubmit={guardar} className="space-y-4">
        {[["nombre", "Nombre", "Nombre del contacto"], ["telefono", "Teléfono", "Número de teléfono"]].map(([campo, etiqueta, placeholder]) => <label key={campo} className="block text-sm font-medium">{etiqueta}<input required maxLength={campo === "nombre" ? 100 : 30} value={valores[campo]} placeholder={placeholder} onChange={(evento) => actualizarCampo(campo, evento.target.value)} disabled={ocupado} className="mt-1.5 w-full rounded-xl border border-border-line/60 bg-bg-cream px-3.5 py-3 text-sm text-bg-dark outline-none placeholder:text-slate-text/70 focus:border-emerald-primary/70 focus:ring-2 focus:ring-emerald-primary/20 disabled:opacity-50" /></label>)}
        <label className="block text-sm font-medium">Notas<textarea maxLength={1000} rows={3} value={valores.notas} placeholder="Añade notas sobre este contacto" onChange={(evento) => actualizarCampo("notas", evento.target.value)} disabled={ocupado} className="mt-1.5 w-full resize-y rounded-xl border border-border-line/60 bg-bg-cream px-3.5 py-3 text-sm text-bg-dark outline-none placeholder:text-slate-text/70 focus:border-emerald-primary/70 focus:ring-2 focus:ring-emerald-primary/20 disabled:opacity-50" /></label>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-border-line/30 pt-4"><button type="button" disabled={ocupado} onClick={() => setModo("detalle")} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium transition-colors hover:bg-bg-cream">Cancelar</button><button type="submit" disabled={ocupado} className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover disabled:opacity-50">{ocupado ? "Guardando…" : "Guardar cambios"}</button></div>
      </form>}
      {contacto && modo === "eliminar" && <div><p className="mb-4">¿Eliminar definitivamente el contacto de <strong>{contacto.nombre}</strong>? Esta acción no se puede deshacer.</p>{error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-2"><button type="button" disabled={ocupado} onClick={() => setModo("detalle")} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium hover:bg-bg-cream">Cancelar</button><button type="button" disabled={ocupado} onClick={eliminar} className="min-h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{ocupado ? "Eliminando…" : "Eliminar definitivamente"}</button></div></div>}
      {contacto && modo === "compartir" && <div><p className="mb-4 rounded-xl border border-border-line/40 p-4 text-sm text-slate-text">La opción para compartir contactos no está disponible por el momento.</p><div className="flex justify-end"><button type="button" onClick={() => setModo("detalle")} className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream hover:bg-emerald-hover">Entendido</button></div></div>}
    </ModalDetalleRegistro>
  );
}
