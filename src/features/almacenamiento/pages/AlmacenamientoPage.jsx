/**
 * @uso        Gestiona el navegador de archivos del feature almacenamiento
 * @funciones  AlmacenamientoPage()
 * @datos      Árbol de archivos demo vía useGestorArchivos
 * @eventos    Acciones del gestor (abrir, subir, eliminar, mover, contexto), descarga, arrastre
 * @estados    Arrastre sobre el área de archivos, menú contextual, previsualización
 * @usadoPor   App.jsx mediante la API pública de features/almacenamiento
 */
import { useCallback, useState } from "react";
import { Copy, ExternalLink, HardDrive, Trash2, Upload } from "lucide-react";
import AlmacenamientoSidebar from "../components/files/AlmacenamientoSidebar";
import AlmacenamientoToolbar from "../components/files/AlmacenamientoToolbar";
import AlmacenamientoCrumbs from "../components/files/AlmacenamientoCrumbs";
import AlmacenamientoArchivos from "../components/files/AlmacenamientoArchivos";
import ContextoMenuArchivos from "../components/files/ContextoMenuArchivos";
import ModalPrevisualizacion from "../components/files/ModalPrevisualizacion";
import { useGestorArchivos } from "../hooks/useGestorArchivos";

/**
 * AlmacenamientoPage
 * Rediseño tipo Google Drive del listado de archivos. La gestión de cuentas conectadas vive
 * en Configuración; aquí se administra el contenido del almacenamiento activo.
 */
export default function AlmacenamientoPage() {
  const gestor = useGestorArchivos();
  const [arrastrandoSobre, setArrastrandoSobre] = useState(false);

  const alAbrir = useCallback((id) => {
    const item = gestor.items.find((itemActual) => itemActual.id === id);
    if (!item) return;
    if (item.tipo === "carpeta") gestor.abrirCarpeta(id);
    else gestor.abrirArchivo(id);
  }, [gestor]);

  const alDescargar = useCallback((id) => {
    const item = gestor.items.find((itemActual) => itemActual.id === id);
    if (!item || item.tipo !== "archivo") return;
    const blob = new Blob([`Contenido demo de ${item.nombre}`], { type: item.mime || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = item.nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }, [gestor.items]);

  const alArrastrarSobre = (evento) => {
    evento.preventDefault();
    setArrastrandoSobre(true);
  };

  const alArrastrarFuera = (evento) => {
    evento.preventDefault();
    setArrastrandoSobre(false);
  };

  const alSoltar = (evento) => {
    evento.preventDefault();
    setArrastrandoSobre(false);
    gestor.subirArchivos(Array.from(evento.dataTransfer?.files || []));
  };

  return (
    <section
      aria-labelledby="dashboard-title"
      className="space-y-6 pt-6 pb-10"
      onDragOver={alArrastrarSobre}
      onDragLeave={alArrastrarFuera}
      onDrop={alSoltar}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Almacenamiento</h1>
          <p className="mt-1 text-sm text-slate-text">Explora y gestiona tus archivos en la nube.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AlmacenamientoSidebar vista={gestor.vista} alSeleccionarVista={gestor.seleccionarVista} />
        <div className="min-w-0 space-y-4">
          <AlmacenamientoToolbar
            busqueda={gestor.busqueda}
            alCambiarBusqueda={gestor.setBusqueda}
            vista={gestor.vista}
            alCambiarVista={gestor.setVista}
            subiendo={gestor.subiendo}
            progreso={gestor.progreso}
            alCrearCarpeta={gestor.crearCarpeta}
            alSubirArchivos={gestor.subirArchivos}
          />
          <AlmacenamientoCrumbs ruta={gestor.ruta} alNavegar={gestor.abrirCarpeta} />
          {gestor.seleccionIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-primary/40 bg-emerald-primary/10 p-3">
              <p className="text-sm font-medium text-bg-dark">{gestor.seleccionIds.length} elemento(s) seleccionado(s)</p>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => gestor.copiar(gestor.seleccionIds)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5">
                  <Copy className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Copiar
                </button>
                <button type="button" onClick={() => gestor.iniciarModoMover(gestor.seleccionIds)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5">
                  <HardDrive className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Mover
                </button>
                <button type="button" onClick={() => gestor.compartirItem(gestor.seleccionIds[0])} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5">
                  <ExternalLink className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Compartir
                </button>
                <button type="button" onClick={() => gestor.eliminarItems(gestor.seleccionIds)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-300/40 px-3 text-sm font-medium text-red-700 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar
                </button>
              </div>
            </div>
          )}
          <AlmacenamientoArchivos
            items={gestor.itemsVisibles}
            vista={gestor.vista}
            busqueda={gestor.busqueda}
            cargando={gestor.cargando}
            error={gestor.error}
            onReintentar={() => {}}
            seleccion={gestor.seleccion}
            renombrando={Boolean(gestor.renombrandoId)}
            nombreEditando={gestor.nombreEditando}
            alSeleccionar={gestor.seleccionarId}
            alAbrir={alAbrir}
            alContexto={gestor.abrirMenuContextual}
            alRenombrar={gestor.renombrarItem}
          />
        </div>
      </div>

      {arrastrandoSobre && (
        <div className="pointer-events-none fixed inset-0 z-[1500] flex items-center justify-center bg-bg-dark/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-dashed border-emerald-primary/60 bg-bg-cream/90 p-8 text-center">
            <Upload className="mx-auto h-10 w-10 text-emerald-primary" aria-hidden="true" />
            <p className="mt-3 font-medium text-bg-dark">Suelta los archivos para subirlos a esta carpeta</p>
            <p className="mt-1 text-sm text-slate-text">Se descargarán y se conservarán en el gestor de archivos.</p>
          </div>
        </div>
      )}

      {gestor.menuContexto && (
        <ContextoMenuArchivos
          menu={gestor.menuContexto}
          items={gestor.items}
          alCerrar={gestor.cerrarMenu}
          alAbrir={alAbrir}
          alDescargar={alDescargar}
          alCopiar={gestor.copiar}
          alMover={gestor.iniciarModoMover}
          alCompartir={gestor.compartirItem}
          alEliminar={gestor.eliminarItems}
          alRenombrar={gestor.iniciarRenombrado}
        />
      )}

      <ModalPrevisualizacion abierto={Boolean(gestor.archivoActivo)} item={gestor.archivoActivo} alCerrar={gestor.cerrarArchivo} />
    </section>
  );
}
