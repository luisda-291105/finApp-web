/**
 * @uso        Fila/carta de archivo o carpeta dentro del navegador de archivos
 * @funciones  AlmacenamientoArchivoItem({ item, vista, seleccion, renombrandoId, nombreEditando, alSeleccionar, alAbrir, alContexto, alCambiarNombre, alConfirmarRenombrado, alCancelarRenombrado })
 * @datos      Presenta nombre, fecha y tamaño; emite selección, apertura, contexto y renombrado
 * @eventos    Click, Ctrl/Cmd+click, doble clic, clic derecho, Enter/Escape/blur en renombrado
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoArchivos
 */
import { Check, MoreVertical } from "lucide-react";
import AlmacenamientoArchivoIcono from "./AlmacenamientoArchivoIcono";

export default function AlmacenamientoArchivoItem({
  item,
  vista = "grid",
  seleccion,
  renombrando = false,
  renombrandoId = null,
  nombreEditando = "",
  alSeleccionar,
  alAbrir,
  alContexto,
  alRenombrar,
  alCambiarNombre,
  alConfirmarRenombrado,
  alCancelarRenombrado,
}) {
  const esSeleccionado = Boolean(seleccion?.has?.(item.id));
  const esCarpeta = item?.tipo === "carpeta";
  const enRenombre = renombrandoId === item.id || (renombrando && renombrandoId === "__activo__");
  const etiqueta = esCarpeta ? `Carpeta ${item?.nombre}` : `Archivo ${item?.nombre}`;

  const confirmar = () => (alConfirmarRenombrado ? alConfirmarRenombrado(item.id, nombreEditando) : alRenombrar?.(item.id, nombreEditando));
  const cancelar = () => (alCancelarRenombrado ? alCancelarRenombrado() : alRenombrar?.(item.id, item?.nombre || ""));
  const cambiar = (valor) => (alCambiarNombre ? alCambiarNombre(item.id, valor) : alRenombrar?.(item.id, valor));

  const idsParaAccion = esSeleccionado && seleccion?.size > 1 ? Array.from(seleccion) : [item.id];
  const abrirAcciones = (evento) => {
    evento.stopPropagation();
    const rect = evento.currentTarget.getBoundingClientRect();
    alContexto?.({ preventDefault: () => {}, stopPropagation: () => {}, clientX: rect.right, clientY: rect.bottom }, idsParaAccion);
  };

  const alternarSeleccion = (evento) => {
    evento.stopPropagation();
    alSeleccionar?.(item.id, { alternar: true });
  };

  const inputRenombre = enRenombre ? (
    <input
      type="text"
      value={nombreEditando}
      autoFocus
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onChange={(evento) => cambiar(evento.target.value)}
      onBlur={confirmar}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") { evento.preventDefault(); confirmar(); }
        if (evento.key === "Escape") { evento.preventDefault(); cancelar(); }
      }}
      className="w-full min-w-0 rounded-lg border border-emerald-primary/60 bg-white/80 px-2 py-1 text-sm text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
      aria-label="Renombrar"
    />
  ) : (
    <p className="w-full truncate text-sm font-medium text-bg-dark" title={item?.nombre}>{item?.nombre}</p>
  );

  const base = "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent";
  const seleccionado = esSeleccionado ? "border-emerald-primary bg-emerald-primary/10" : "border-transparent hover:border-emerald-primary/50 hover:bg-emerald-primary/5";

  if (vista === "lista") {
    return (
      <li
        role="row"
        tabIndex={0}
        aria-label={etiqueta}
        aria-selected={esSeleccionado}
        onClick={(e) => alSeleccionar?.(item.id, e)}
        onDoubleClick={() => !enRenombre && alAbrir?.(item.id)}
        onContextMenu={(e) => alContexto?.(e, esSeleccionado && seleccion?.size > 1 ? Array.from(seleccion) : [item.id])}
        onKeyDown={(e) => { if (e.key === "Enter" && !enRenombre) alAbrir?.(item.id); }}
        className={`${base} flex w-full items-center gap-3 border-b px-3 py-2 last:border-b-0 ${seleccionado}`}
      >
        <button type="button" onClick={alternarSeleccion} aria-label={esSeleccionado ? `Quitar selección de ${item?.nombre}` : `Seleccionar ${item?.nombre}`} className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${esSeleccionado ? "border-emerald-primary bg-emerald-primary text-white" : "border-border-line/60 text-slate-text hover:border-emerald-primary/50 hover:text-emerald-primary"}`}>
          {esSeleccionado ? <Check className="h-4 w-4" aria-hidden="true" /> : <span className="h-3.5 w-3.5 rounded-sm border border-current/40" aria-hidden="true" />}
        </button>
        <AlmacenamientoArchivoIcono item={item} />
        <div className="min-w-0 flex-1">{inputRenombre}</div>
        <p className="hidden w-28 shrink-0 text-right text-xs text-slate-text sm:block">{esCarpeta ? "Carpeta" : item?.tamanio ? `${Math.round(item.tamanio / 1024)} KB` : ""}</p>
        <p className="hidden w-32 shrink-0 text-right text-xs text-slate-text md:block">{item?.fechaModificacion ? new Date(item.fechaModificacion).toLocaleDateString("es-ES") : ""}</p>
        <button type="button" onClick={abrirAcciones} aria-label={`Acciones de ${item?.nombre}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-text hover:bg-emerald-primary/10 hover:text-emerald-primary">
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </li>
    );
  }

  return (
    <li
      role="button"
      tabIndex={0}
      aria-label={etiqueta}
      aria-pressed={esSeleccionado}
      onClick={(e) => alSeleccionar?.(item.id, e)}
      onDoubleClick={() => !enRenombre && alAbrir?.(item.id)}
      onContextMenu={(e) => alContexto?.(e, esSeleccionado && seleccion?.size > 1 ? Array.from(seleccion) : [item.id])}
      onKeyDown={(e) => { if (e.key === "Enter" && !enRenombre) alAbrir?.(item.id); }}
      className={`${base} group relative flex min-h-32 w-full flex-col items-center gap-2 rounded-2xl border p-4 pt-10 text-center ${seleccionado}`}
    >
      <button type="button" onClick={alternarSeleccion} aria-label={esSeleccionado ? `Quitar selección de ${item?.nombre}` : `Seleccionar ${item?.nombre}`} className={`absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border ${esSeleccionado ? "border-emerald-primary bg-emerald-primary text-white" : "border-border-line/60 bg-bg-cream/80 text-slate-text hover:border-emerald-primary/50 hover:text-emerald-primary"}`}>
        {esSeleccionado ? <Check className="h-4 w-4" aria-hidden="true" /> : <span className="h-3.5 w-3.5 rounded-sm border border-current/40" aria-hidden="true" />}
      </button>
      <button type="button" onClick={abrirAcciones} aria-label={`Acciones de ${item?.nombre}`} className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-text hover:bg-emerald-primary/10 hover:text-emerald-primary">
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      <AlmacenamientoArchivoIcono item={item} />
      {inputRenombre}
      <p className="text-xs text-slate-text">{esCarpeta ? "Carpeta" : `${item?.tamanio ? `${Math.round(item.tamanio / 1024)} KB · ` : ""}${item?.fechaModificacion ? new Date(item.fechaModificacion).toLocaleDateString("es-ES") : ""}`}</p>
    </li>
  );
}
