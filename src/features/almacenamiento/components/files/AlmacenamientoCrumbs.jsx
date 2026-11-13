/**
 * @uso        Migas de pan del navegador de archivos del feature almacenamiento
 * @funciones  AlmacenamientoCrumbs({ ruta, alNavegar })
 * @datos      Ruta [{ id, nombre }] desde «Mi unidad» hasta la carpeta activa
 * @eventos    Navegación entre niveles
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage
 */
import { ChevronRight } from "lucide-react";

/**
 * AlmacenamientoCrumbs
 * Muestra la ruta actual con clic para navegar entre carpetas.
 * @param {Object} props
 * @param {Array<{id: string, nombre: string}>} props.ruta - [{ id, nombre }]
 * @param {(id: string) => void} props.alNavegar - Callback de navegación a un nivel
 * @returns {JSX.Element}
 */
export default function AlmacenamientoCrumbs({ ruta = [], alNavegar }) {
  return (
    <nav aria-label="Migas de pan" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
      {ruta.map((nivel, indice) => (
        <span key={`${nivel.id}-${indice}`} className="flex min-w-0 items-center gap-1">
          {indice > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-text" aria-hidden="true" />}
          <button
            type="button"
            onClick={() => alNavegar(nivel.id)}
            className={`truncate rounded-lg px-2 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${
              indice === ruta.length - 1
                ? "text-emerald-primary"
                : "text-slate-text hover:bg-emerald-primary/5 hover:text-bg-dark"
            }`}
          >
            {nivel.nombre}
          </button>
        </span>
      ))}
    </nav>
  );
}
