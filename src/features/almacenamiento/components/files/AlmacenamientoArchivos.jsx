/**
 * @uso        Contenido del listado de archivos (vista de cuadrícula o lista) y estados vacíos
 * @funciones  AlmacenamientoArchivos({ items, vista, busqueda, cargando, error, onReintentar, seleccion, renombrando, nombreEditando, alSeleccionar, alAbrir, alContexto, alRenombrar })
 * @datos      Items filtrados por vista/carpeta/búsqueda; estados de carga, vacío y error
 * @eventos    Reintento de carga
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage
 */
import { Cloud } from "lucide-react";
import AlmacenamientoArchivoItem from "./AlmacenamientoArchivoItem";

/**
 * AlmacenamientoArchivos
 * Renderiza los items del gestor según la vista (grid o lista), con estados de carga, vacío y error.
 * @param {Object} props
 * @param {Array} props.items - Items visibles ya filtrados
 * @param {string} props.vista - Vista activa ("grid" | "lista")
 * @param {string} props.busqueda - Búsqueda activa
 * @param {boolean} props.cargando - Indica carga inicial
 * @param {string} props.error - Mensaje de error actual
 * @param {() => void} props.onReintentar - Recarga de datos
 * @param {Set<string>} props.seleccion - Ids seleccionados
 * @param {boolean} props.renombrando - Indica si algún item está en modo renombrado
 * @param {string} props.nombreEditando - Nombre temporal en renombrado
 * @param {(id: string, evento?: Object) => void} props.alSeleccionar - Selección del ítem
 * @param {(id: string) => void} props.alAbrir - Apertura (carpeta o archivo)
 * @param {(evento: Object, ids: string[]) => void} props.alContexto - Clic derecho sobre la selección
 * @param {(id: string, nombre: string) => void} props.alRenombrar - Confirma renombrado
 * @returns {JSX.Element}
 */
export default function AlmacenamientoArchivos({
  items = [],
  vista = "grid",
  busqueda = "",
  cargando = false,
  error = "",
  onReintentar,
  seleccion,
  renombrando = false,
  nombreEditando = "",
  alSeleccionar,
  alAbrir,
  alContexto,
  alRenombrar,
}) {
  if (cargando) {
    return <p role="status" className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-8 text-center text-sm text-slate-text">Cargando archivos…</p>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-300/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-100">{error}</p>
        <button type="button" onClick={onReintentar} className="mt-3 text-sm font-semibold text-emerald-primary underline">Reintentar</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-8 text-center">
        <Cloud className="mx-auto h-10 w-10 text-emerald-primary" aria-hidden="true" />
        <p className="mt-3 font-medium text-bg-dark">{busqueda ? "No hay coincidencias" : "Esta carpeta está vacía"}</p>
        <p className="mt-1 text-sm text-slate-text">{busqueda ? `No se encontró nada para “${busqueda}”.` : "Sube un archivo o crea una carpeta para empezar."}</p>
      </div>
    );
  }

  if (vista === "lista") {
    return (
      <ul className="divide-y divide-border-line/40 rounded-2xl border border-border-line/50 bg-bg-cream/60">
        {items.map((item) => (
          <AlmacenamientoArchivoItem
            key={item.id}
            item={item}
            vista="lista"
            seleccion={seleccion}
            renombrando={renombrando}
            nombreEditando={nombreEditando}
            alSeleccionar={alSeleccionar}
            alAbrir={alAbrir}
            alContexto={alContexto}
            alRenombrar={alRenombrar}
          />
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <AlmacenamientoArchivoItem
          key={item.id}
          item={item}
          vista="grid"
          seleccion={seleccion}
          renombrando={renombrando}
          nombreEditando={nombreEditando}
          alSeleccionar={alSeleccionar}
          alAbrir={alAbrir}
          alContexto={alContexto}
          alRenombrar={alRenombrar}
        />
      ))}
    </ul>
  );
}
