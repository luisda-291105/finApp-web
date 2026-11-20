/**
 * @uso        Menú contextual del navegador de archivos
 * @funciones  ContextoMenuArchivos({ menu, items, vistaActual, alCerrar, alAbrir, alDescargar, alCopiar, alMover, alCompartir, alEliminar, alRestaurar, alEliminarDefinitivo, alRenombrar })
 * @datos      Posición { x, y } y selección de ids; acciones según vista (unidad vs papelera)
 * @eventos    Clic en acciones, clic exterior para cerrar
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage
 */
import {
  Copy,
  Download,
  FolderOpen,
  HardDrive,
  Pencil,
  RotateCcw,
  Scissors,
  Share2,
  Trash2,
} from "lucide-react";

export default function ContextoMenuArchivos({
  menu,
  items = [],
  vistaActual = "unidad",
  alCerrar,
  alAbrir,
  alDescargar,
  alCopiar,
  alMover,
  alCortar,
  alCompartir,
  alEliminar,
  alRestaurar,
  alEliminarDefinitivo,
  alRenombrar,
}) {
  if (!menu) return null;

  const idsUnicos = Array.from(new Set(menu.ids || []));
  const itemActivo = items.find((item) => item.id === idsUnicos[0]) || null;
  const esCarpeta = itemActivo?.tipo === "carpeta";

  const ejecutar = (accion) => () => {
    alCerrar?.();
    accion?.();
  };

  const accionesUnidad = [
    {
      clave: "abrir",
      etiqueta: "Abrir",
      Icono: FolderOpen,
      onClick: ejecutar(() => alAbrir?.(itemActivo?.id)),
      disabled: false,
    },
    {
      clave: "descargar",
      etiqueta: "Descargar",
      Icono: Download,
      onClick: ejecutar(() => alDescargar?.(itemActivo?.id)),
      disabled: esCarpeta || !itemActivo,
    },
    {
      clave: "copiar",
      etiqueta: "Copiar",
      Icono: Copy,
      onClick: ejecutar(() => alCopiar?.(idsUnicos)),
      disabled: idsUnicos.length === 0,
    },
    {
      clave: "mover",
      etiqueta: "Mover",
      Icono: HardDrive,
      onClick: ejecutar(() => alMover?.(idsUnicos)),
      disabled: idsUnicos.length === 0,
    },
    {
      clave: "cortar",
      etiqueta: "Cortar",
      Icono: Scissors,
      onClick: ejecutar(() => alCortar?.(idsUnicos)),
      disabled: idsUnicos.length === 0,
    },
    {
      clave: "renombrar",
      etiqueta: "Cambiar nombre",
      Icono: Pencil,
      onClick: ejecutar(() => itemActivo && alRenombrar?.(itemActivo.id)),
      disabled: idsUnicos.length !== 1,
    },
    {
      clave: "compartir",
      etiqueta: "Compartir",
      Icono: Share2,
      onClick: ejecutar(() => itemActivo && alCompartir?.(itemActivo.id)),
      disabled: idsUnicos.length !== 1,
    },
    {
      clave: "eliminar",
      etiqueta: "Mover a papelera",
      Icono: Trash2,
      onClick: ejecutar(() => alEliminar?.(idsUnicos)),
      disabled: idsUnicos.length === 0,
    },
  ];

  const accionesPapelera = [
    {
      clave: "restaurar",
      etiqueta: "Restaurar",
      Icono: RotateCcw,
      onClick: ejecutar(() => alRestaurar?.(idsUnicos)),
      disabled: idsUnicos.length === 0,
    },
    {
      clave: "eliminarDef",
      etiqueta: "Eliminar definitivamente",
      Icono: Trash2,
      onClick: ejecutar(() => alEliminarDefinitivo?.(idsUnicos)),
      disabled: idsUnicos.length === 0,
    },
  ];

  const acciones =
    vistaActual === "papelera" ? accionesPapelera : accionesUnidad;

  return (
    <>
      <div
        className="fixed inset-0 z-[1200]"
        onClick={alCerrar}
        onContextMenu={(evento) => {
          evento.preventDefault();
          alCerrar?.();
        }}
      />
      <div
        role="menu"
        className="fixed z-[1201] min-w-56 rounded-2xl border border-border-line/60 bg-bg-cream p-2 shadow-2xl"
        style={{
          left: Math.max(
            8,
            Math.min(
              menu.x,
              (typeof window !== "undefined" ? window.innerWidth : 800) - 260,
            ),
          ),
          top: Math.max(
            8,
            Math.min(
              menu.y,
              (typeof window !== "undefined" ? window.innerHeight : 600) - 360,
            ),
          ),
        }}
      >
        {acciones.map((accion) => {
          const Icono = accion.Icono;
          return (
            <button
              key={accion.clave}
              type="button"
              role="menuitem"
              disabled={accion.disabled}
              onClick={accion.onClick}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-bg-dark transition-colors hover:bg-emerald-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icono
                className="h-4 w-4 text-emerald-primary"
                aria-hidden="true"
              />
              <span>{accion.etiqueta}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
