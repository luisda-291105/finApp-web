/**
 * @uso        Menú contextual del navegador de archivos del feature almacenamiento
 * @funciones  ContextoMenuArchivos({ menu, items, alCerrar, alAbrir, alDescargar, alCopiar, alMover, alCompartir, alEliminar, alRenombrar })
 * @datos      Posición { x, y } y selección de ids; acciones delegadas por capa
 * @eventos    Clic en acciones, clic exterior o Escape para cerrar
 * @estados    Ninguno
 * @usadoPor   AlmacenamientoPage
 */
import { Copy, Download, FolderOpen, HardDrive, Pencil, Share2, Trash2 } from "lucide-react";

/**
 * ContextoMenuArchivos
 * Menú flotante con las acciones de archivo: abrir, descargar, copiar, mover, renombrar, compartir y eliminar.
 * @param {Object} props
 * @param {{ ids: string[], x: number, y: number } | null} props.menu - { ids, x, y } o null
 * @param {Array} props.items - Items del gestor para resolver nombres y tipos
 * @param {() => void} props.alCerrar - Cierra el menú
 * @param {(id: string) => void} props.alAbrir - Abre carpeta (entrar) o archivo (previsualizar)
 * @param {(id: string) => void} props.alDescargar - Descarga el archivo
 * @param {(ids: string[]) => void} props.alCopiar - Copia los items
 * @param {(ids: string[]) => void} props.alMover - Marca los items como a mover
 * @param {(id: string) => void} props.alCompartir - Alterna compartido
 * @param {(ids: string[]) => void} props.alEliminar - Mueve a la papelera
 * @param {(id: string) => void} props.alRenombrar - Inicia renombrado
 * @returns {JSX.Element | null}
 */
export default function ContextoMenuArchivos({
  menu,
  items = [],
  alCerrar,
  alAbrir,
  alDescargar,
  alCopiar,
  alMover,
  alCompartir,
  alEliminar,
  alRenombrar,
}) {
  if (!menu) return null;

  const idsUnicos = Array.from(new Set(menu.ids || []));
  const itemActivo = items.find((item) => item.id === idsUnicos[0]) || null;

  const ejecutar = (accion) => {
    alCerrar();
    accion();
  };

  const acciones = [
    { clave: "abrir", etiqueta: "Abrir", Icono: FolderOpen, ejecutar: () => alAbrir(itemActivo?.id), deshabilitar: false },
    { clave: "descargar", etiqueta: "Descargar", Icono: Download, ejecutar: () => alDescargar(itemActivo?.id), deshabilitar: itemActivo?.tipo === "carpeta" },
    { clave: "copiar", etiqueta: "Copiar", Icono: Copy, ejecutar: () => alCopiar(idsUnicos), deshabilitar: false },
    { clave: "mover", etiqueta: "Mover", Icono: HardDrive, ejecutar: () => alMover(idsUnicos), deshabilitar: false },
    { clave: "renombrar", etiqueta: "Cambiar nombre", Icono: Pencil, ejecutar: () => itemActivo && alRenombrar(itemActivo.id), deshabilitar: idsUnicos.length !== 1 },
    { clave: "compartir", etiqueta: "Compartir", Icono: Share2, ejecutar: () => itemActivo && alCompartir(itemActivo.id), deshabilitar: idsUnicos.length !== 1 },
    { clave: "eliminar", etiqueta: "Eliminar", Icono: Trash2, ejecutar: () => alEliminar(idsUnicos), deshabilitar: false },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[1200]" onClick={alCerrar} onContextMenu={(evento) => { evento.preventDefault(); alCerrar(); }} />
      <div
        role="menu"
        className="fixed z-[1201] min-w-52 rounded-2xl border border-border-line/60 bg-bg-cream p-2 shadow-2xl"
        style={{ left: Math.max(8, Math.min(menu.x, window.innerWidth - 260)), top: Math.max(8, Math.min(menu.y, window.innerHeight - 340)) }}
      >
        {acciones.map((accion) => {
          const Icono = accion.Icono;
          return (
            <button
              key={accion.clave}
              type="button"
              role="menuitem"
              disabled={accion.deshabilitar}
              onClick={accion.ejecutar}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-bg-dark transition-colors hover:bg-emerald-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icono className="h-4 w-4 text-emerald-primary" aria-hidden="true" />
              <span>{accion.etiqueta}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
