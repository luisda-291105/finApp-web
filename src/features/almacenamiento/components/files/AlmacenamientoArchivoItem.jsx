/**
 * @uso        Fila/carta de archivo o carpeta dentro del navegador de archivos
 * @funciones  AlmacenamientoArchivoItem({ item, vista, seleccion, renombrando, nombreEditando, alSeleccionar, alAbrir, alContexto, alRenombrar })
 * @datos      Presenta nombre, fecha y tamaño; emite selección, apertura, contexto y renombrado
 * @eventos    Click (selección), Ctrl/Cmd+click (alternar), doble clic (abrir), clic derecho (contexto), Enter/Escape en renombrado
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoArchivos
 */
import { Check } from "lucide-react";
import AlmacenamientoArchivoIcono from "./AlmacenamientoArchivoIcono";

/**
 * AlmacenamientoArchivoItem
 * Representa un archivo o carpeta con icono, nombre, fecha de modificación y tamaño.
 * - Clic simple: selecciona (Ctrl/Cmd+clic alterna).
 * - Doble clic: abre carpeta (entrar) o archivo (previsualizar).
 * - Clic derecho: abre el menú contextual sobre la selección.
 * - Al confirmar renombrado muestra el input con el valor editado.
 * @param {Object} props
 * @param {Object} props.item - Item del gestor ({ nombre, tipo, mime, tamanio, fechaModificacion })
 * @param {"grid" | "lista"} props.vista - Vista activa
 * @param {Set<string>} props.seleccion - Ids seleccionados
 * @param {boolean} props.renombrando - Indica si el item está en modo renombrado
 * @param {string} props.nombreEditando - Nombre temporal en renombrado
 * @param {(id: string, evento?: Object) => void} props.alSeleccionar - Selección del ítem
 * @param {(id: string) => void} props.alAbrir - Apertura (carpeta o archivo)
 * @param {(evento: Object, ids: string[]) => void} props.alContexto - Clic derecho sobre la selección
 * @param {(id: string, nombre: string) => void} props.alRenombrar - Confirma renombrado
 * @returns {JSX.Element}
 */
export default function AlmacenamientoArchivoItem({
  item,
  vista,
  seleccion,
  renombrando = false,
  nombreEditando = "",
  alSeleccionar,
  alAbrir,
  alContexto,
  alRenombrar,
}) {
  const esSeleccionado = Boolean(seleccion?.has?.(item.id));
  const esCarpeta = item?.tipo === "carpeta";
  const etiqueta = esCarpeta ? `Carpeta ${item?.nombre}` : `Archivo ${item?.nombre}`;

  const manejarClick = (evento) => alSeleccionar(item.id, evento);

  const manejarDobleClick = () => alAbrir(item.id);

  const manejarContexto = (evento) => alContexto(evento, [item.id]);

  const manejarKey = (evento) => {
    if (evento.key === "Enter") alAbrir(item.id);
    if (evento.key === "Escape") alRenombrar(item.id, item?.nombre || "");
  };

  const clasesContenedor = vista === "grid"
    ? "group flex min-h-24 w-full flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
    : "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent";

  const clasesVista = esSeleccionado
    ? `${clasesContenedor} border-emerald-primary bg-emerald-primary/10`
    : `${clasesContenedor} border-transparent hover:border-emerald-primary/50 hover:bg-emerald-primary/5`;

  const contenido = (
    <>
      <AlmacenamientoArchivoIcono item={item} />
      {renombrando ? (
        <input
          type="text"
          value={nombreEditando}
          onChange={(evento) => alRenombrar(item.id, evento.target.value)}
          onBlur={(evento) => alRenombrar(item.id, evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") alRenombrar(item.id, evento.target.value);
            if (evento.key === "Escape") alRenombrar(item.id, item?.nombre || "");
          }}
          className="w-full min-w-0 rounded-lg border border-emerald-primary/60 bg-bg-dark px-2 py-1 text-sm text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
          aria-label="Renombrar"
        />
      ) : (
        <p className="w-full truncate text-sm font-medium text-bg-dark" title={item?.nombre}>{item?.nombre}</p>
      )}
      <p className="text-xs text-slate-text">
        {esCarpeta ? "Carpeta" : `${item?.mime?.split("/")[1]?.toUpperCase() || "Archivo"}${item?.tamanio ? ` · ${Math.round(item.tamanio / 1024)} KB` : ""} · ${new Date(item?.fechaModificacion || Date.now()).toLocaleDateString("es-ES")}`}
      </p>
    </>
  );

  if (vista === "grid") {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={etiqueta}
        aria-pressed={esSeleccionado}
        onClick={manejarClick}
        onDoubleClick={manejarDobleClick}
        onContextMenu={manejarContexto}
        onKeyDown={(evento) => { if (evento.key === "Enter") alAbrir(item.id); }}
        className={clasesVista}
      >
        {contenido}
      </div>
    );
  }

  return (
    <div
      role="row"
      tabIndex={0}
      aria-label={etiqueta}
      aria-selected={esSeleccionado}
      onClick={manejarClick}
      onDoubleClick={manejarDobleClick}
      onContextMenu={manejarContexto}
      onKeyDown={manejarKey}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 ${clasesVista}`}
    >
      <AlmacenamientoArchivoIcono item={item} />
      <div className="min-w-0 flex-1">
        {renombrando ? (
          <input
            type="text"
            value={nombreEditando}
            onChange={(evento) => alRenombrar(item.id, evento.target.value)}
            onBlur={(evento) => alRenombrar(item.id, evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === "Enter") alRenombrar(item.id, evento.target.value);
              if (evento.key === "Escape") alRenombrar(item.id, item?.nombre || "");
            }}
            className="w-full min-w-0 rounded-lg border border-emerald-primary/60 bg-bg-dark px-2 py-1 text-sm text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
            aria-label="Renombrar"
          />
        ) : (
          <p className="truncate text-sm font-medium text-bg-dark">{item?.nombre}</p>
        )}
      </div>
      <p className="w-32 shrink-0 text-right text-xs text-slate-text">{esCarpeta ? "Carpeta" : `${item?.tamanio ? `${Math.round(item.tamanio / 1024)} KB` : ""}`}</p>
      <p className="w-36 shrink-0 text-right text-xs text-slate-text">{new Date(item?.fechaModificacion || Date.now()).toLocaleDateString("es-ES")}</p>
    </div>
  );
}
