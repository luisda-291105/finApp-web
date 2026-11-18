/**
 * @uso        Contenido del listado de archivos y estados de carga, vacío, aviso y error
 * @funciones  AlmacenamientoArchivos({ items, modoVista, vistaActual, busqueda, cargando, error, aviso, onReintentar, seleccion, renombrandoId, nombreEditando, alSeleccionar, alAbrir, alContexto, alCambiarNombre, alConfirmarRenombrado, alCancelarRenombrado, arrastrandoId, carpetaSobreId, alArrastrarInicio, alCancelarArrastre, alSoltarEnCarpeta, alArrastrarSobreCarpeta })
 * @datos      Items filtrados por vista/carpeta/búsqueda; mensajes vacíos o informativos por vista
 * @eventos    Reintento de carga
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage
 */
import { Cloud } from "lucide-react";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import AlmacenamientoArchivoItem from "./AlmacenamientoArchivoItem";

const MENSAJES_VACIO = {
  unidad:
    "Esta carpeta está vacía. Sube un archivo o crea una carpeta para empezar.",
  recientes: "No hay archivos recientes para mostrar.",
  compartidos: "No tienes archivos compartidos contigo.",
  destacados: "No tienes elementos destacados.",
  papelera: "La papelera está vacía.",
};

export default function AlmacenamientoArchivos({
  items = [],
  modoVista = "grid",
  vista,
  vistaActual,
  busqueda = "",
  cargando = false,
  error = "",
  aviso = "",
  onReintentar,
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
  arrastrandoId = null,
  carpetaSobreId = null,
  portapapeles = null,
  alArrastrarInicio,
  alCancelarArrastre,
  alSoltarEnCarpeta,
  alArrastrarSobreCarpeta,
}) {
  const { isMobile } = useBreakpoint();
  const modo =
    modoVista || (vista === "lista" || vista === "grid" ? vista : "grid");
  const vistaNombre =
    vistaActual ||
    (vista && !["lista", "grid"].includes(vista) ? vista : "unidad");
  const idRenombrando = renombrandoId || (renombrando ? "__activo__" : null);
  const modoEfectivo = isMobile ? "lista" : modo;

  if (cargando) {
    return (
      <p
        role="status"
        className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-8 text-center text-sm text-slate-text"
      >
        Cargando archivos…
      </p>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-300/30 bg-red-500/10 p-6 text-center"
      >
        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="mt-3 text-sm font-semibold text-emerald-primary underline"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-8 text-center">
        <Cloud
          className="mx-auto h-10 w-10 text-emerald-primary"
          aria-hidden="true"
        />
        <p className="mt-3 font-medium text-bg-dark">
          {busqueda ? "No hay coincidencias" : "Sin elementos"}
        </p>
        <p className="mt-1 text-sm text-slate-text">
          {busqueda
            ? `No se encontró nada para “${busqueda}”.`
            : MENSAJES_VACIO[vistaNombre] || MENSAJES_VACIO.unidad}
        </p>
      </div>
    );
  }

  const propsComunes = (item) => ({
    item,
    seleccion,
    renombrandoId: idRenombrando,
    nombreEditando,
    alSeleccionar,
    alAbrir,
    alContexto,
    alRenombrar: alRenombrar,
    alCambiarNombre: alCambiarNombre || alRenombrar,
    alConfirmarRenombrado,
    alCancelarRenombrado,
    arrastrandoId,
    carpetaSobreId,
    portapapeles,
    alArrastrarInicio,
    alCancelarArrastre,
    alSoltarEnCarpeta,
    alArrastrarSobreCarpeta,
  });

  if (modoEfectivo === "lista") {
    return (
      <ul className="divide-y divide-border-line/40 rounded-2xl border border-border-line/50 bg-bg-cream/60">
        {items.map((item) => (
          <AlmacenamientoArchivoItem
            key={item.id}
            {...propsComunes(item)}
            vista="lista"
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
          {...propsComunes(item)}
          vista="grid"
        />
      ))}
    </ul>
  );
}
