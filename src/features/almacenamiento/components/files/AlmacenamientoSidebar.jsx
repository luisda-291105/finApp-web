/**
 * @uso        Navegación lateral del navegador de archivos del feature almacenamiento
 * @funciones  AlmacenamientoSidebar({ vista, alSeleccionarVista })
 * @datos      Opciones de vista (clave, etiqueta, icono); la vista activa se resalta
 * @eventos    Selección de vista
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoArchivos
 */
import { Clock, HardDrive, Trash2, Users } from "lucide-react";

const OPCIONES_VISTA = [
  { clave: "unidad", etiqueta: "Mi unidad", icono: HardDrive },
  { clave: "recientes", etiqueta: "Recientes", icono: Clock },
  { clave: "compartidos", etiqueta: "Compartidos conmigo", icono: Users },
  { clave: "papelera", etiqueta: "Papelera", icono: Trash2 },
];

/**
 * AlmacenamientoSidebar
 * Lista las vistas del gestor de archivos con su icono y estado activo.
 * @param {Object} props
 * @param {string} props.vista - Vista activa
 * @param {(clave: string) => void} props.alSeleccionarVista - Callback de selección
 * @returns {JSX.Element}
 */
export default function AlmacenamientoSidebar({ vista, alSeleccionarVista }) {
  return (
    <nav aria-label="Navegación de archivos" className="w-full shrink-0 space-y-1">
      {OPCIONES_VISTA.map((opcion) => {
        const Icono = opcion.icono;
        const activo = vista === opcion.clave;
        return (
          <button
            key={opcion.clave}
            type="button"
            onClick={() => alSeleccionarVista(opcion.clave)}
            aria-current={activo ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${
              activo
                ? "bg-emerald-primary/10 text-emerald-primary"
                : "text-slate-text hover:bg-emerald-primary/5 hover:text-bg-dark"
            }`}
          >
            <Icono className="h-5 w-5" aria-hidden="true" />
            <span>{opcion.etiqueta}</span>
          </button>
        );
      })}
    </nav>
  );
}
