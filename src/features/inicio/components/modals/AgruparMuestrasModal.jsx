/**
 * @uso        Modal para crear una agrupación con muestras existentes
 * @funciones  AgruparMuestrasModal({ abierto, muestras, guardando, error, triggerRef, alCerrar, alGuardar })
 * @datos      Recibe las muestras disponibles y devuelve el nombre e identificadores elegidos
 * @eventos    Selección de muestras, creación y cierre
 * @estados    nombre, idsSeleccionados
 * @usadoPor   InicioPage
 */
import { useEffect, useState } from "react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

/** Permite elegir entre dos y cuatro muestras para una agrupación. */
export default function AgruparMuestrasModal({ abierto, muestras = [], guardando = false, error = "", triggerRef, alCerrar, alGuardar }) {
  const [nombre, setNombre] = useState("");
  const [idsSeleccionados, setIdsSeleccionados] = useState([]);

  useEffect(() => {
    if (!abierto) return;
    setNombre("");
    setIdsSeleccionados([]);
  }, [abierto]);

  const cambiarSeleccion = (id, seleccionado) => {
    const idTexto = String(id);
    setIdsSeleccionados((actuales) => seleccionado
      ? actuales.length < 4 ? [...new Set([...actuales, idTexto])] : actuales
      : actuales.filter((actual) => actual !== idTexto));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    if (nombre.trim().length < 2 || idsSeleccionados.length < 2 || idsSeleccionados.length > 4 || guardando) return;
    if (await alGuardar(nombre.trim(), idsSeleccionados)) alCerrar();
  };

  return <ModalDetalleRegistro abierto={abierto} titulo="Crear agrupación" etiquetaCerrar="Cerrar creación de agrupación" triggerRef={triggerRef} alCerrar={alCerrar}>
    <form onSubmit={enviar} className="space-y-4">
      <label htmlFor="agrupacion-nombre" className="flex flex-col gap-1.5 text-sm font-medium text-bg-dark">Nombre de la agrupación
        <input id="agrupacion-nombre" value={nombre} onChange={(evento) => setNombre(evento.target.value)} minLength={2} maxLength={100} required placeholder="Ej. Resumen mensual" className="min-h-11 rounded-xl border border-border-line bg-bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" />
      </label>
      <fieldset className="space-y-2">
        <legend className="font-semibold">Selecciona muestras ({idsSeleccionados.length}/4)</legend>
        <p className="text-sm text-slate-text">Elige entre 2 y 4 muestras. Cada tarjeta conservará su formato.</p>
        {muestras.length ? <div className="max-h-72 space-y-2 overflow-y-auto">{muestras.map((muestra) => {
          const id = String(muestra.id);
          const marcada = idsSeleccionados.includes(id);
          return <label key={id} className="flex min-h-12 items-center gap-3 rounded-xl border border-border-line/40 bg-bg-cream/70 px-3 py-2 text-sm">
            <input type="checkbox" checked={marcada} disabled={guardando || (!marcada && idsSeleccionados.length >= 4)} onChange={(evento) => cambiarSeleccion(id, evento.target.checked)} className="accent-emerald-primary" />
            <span className="min-w-0"><span className="block truncate font-medium text-bg-dark">{muestra.titulo}</span><span className="text-xs text-slate-text">{muestra.tipo.replaceAll("_", " ")} · {muestra.fuente}</span></span>
          </label>;
        })}</div> : <p className="rounded-xl border border-border-line/40 p-3 text-sm text-slate-text">No hay muestras sin agrupar disponibles.</p>}
      </fieldset>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      <button type="submit" disabled={guardando || nombre.trim().length < 2 || idsSeleccionados.length < 2 || idsSeleccionados.length > 4} className="min-h-11 w-full rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">{guardando ? "Creando…" : "Crear agrupación"}</button>
    </form>
  </ModalDetalleRegistro>;
}
