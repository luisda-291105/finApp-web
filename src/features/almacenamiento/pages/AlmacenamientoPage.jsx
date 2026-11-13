/**
 * @uso        Lista las cuentas de almacenamiento conectadas y gestiona archivos del usuario
 * @funciones  AlmacenamientoPage()
 * @datos      Conexiones del backend vía almacenamientoServicio; árbol de archivos demo vía useGestorArchivos
 * @eventos    Cierre del modal de Drive, desconectar cuenta, acciones del gestor (abrir, subir, eliminar, mover)
 * @estados    conexiones, cargando, error, cuentaDesconectando, modalDriveAbierto, cuentaSeleccionadaDrive, parametros
 * @usadoPor   App.jsx mediante la API pública de features/almacenamiento
 */
import { useCallback, useEffect, useState } from "react";
import { Cloud, ExternalLink, HardDrive, RefreshCw, Trash2, Unplug, Upload } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../../components/ui";
import { completarConexion, desconectarCuenta, obtenerConexiones } from "../services/almacenamientoServicio";
import ModalGoogleDrive from "../components/modals/ModalGoogleDrive";
import AlmacenamientoSidebar from "../components/files/AlmacenamientoSidebar";
import AlmacenamientoToolbar from "../components/files/AlmacenamientoToolbar";
import AlmacenamientoCrumbs from "../components/files/AlmacenamientoCrumbs";
import AlmacenamientoArchivos from "../components/files/AlmacenamientoArchivos";
import ContextoMenuArchivos from "../components/files/ContextoMenuArchivos";
import ModalPrevisualizacion from "../components/files/ModalPrevisualizacion";
import { useGestorArchivos } from "../hooks/useGestorArchivos";

const ETIQUETAS_PROVEEDOR = { GOOGLE_DRIVE: "Google Drive", ONEDRIVE: "OneDrive", NEXTCLOUD: "Nextcloud" };
const ETIQUETAS_ESTADO = { ACTIVA: "Conectada", REQUIERE_RECONEXION: "Requiere reconexión", DESCONECTADA: "Desconectada" };

/**
 * AlmacenamientoPage
 * Rediseño tipo Google Drive del listado de archivos, sobre el contexto de cuentas conectadas.
 */
export default function AlmacenamientoPage() {
  const gestor = useGestorArchivos();
  const [conexiones, setConexiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cuentaDesconectando, setCuentaDesconectando] = useState(null);
  const [modalDriveAbierto, setModalDriveAbierto] = useState(false);
  const [cuentaSeleccionadaDrive, setCuentaSeleccionadaDrive] = useState(null);
  const [parametros, setParametros] = useSearchParams();
  const [arrastrandoSobre, setArrastrandoSobre] = useState(false);

  const cargarConexiones = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setConexiones(await obtenerConexiones()); }
    catch { setError("No se pudieron cargar las cuentas. Inténtalo de nuevo más tarde."); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarConexiones(); }, [cargarConexiones]);

  useEffect(() => {
    const code = parametros.get("code");
    const state = parametros.get("state");
    if (!code || !state) return;
    setParametros({}, { replace: true });
    completarConexion(code, state)
      .then(() => cargarConexiones())
      .catch(() => { setError("No se pudo completar la conexión con el proveedor. Inténtalo de nuevo."); });
  }, [parametros, setParametros, cargarConexiones]);

  const alDesconectar = async (cuenta) => {
    setCuentaDesconectando(cuenta.id);
    setError("");
    try { await desconectarCuenta(cuenta.id); await cargarConexiones(); }
    catch { setError("No se pudo desconectar la cuenta. Inténtalo de nuevo."); }
    finally { setCuentaDesconectando(null); }
  };

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

  const alSeleccionar = useCallback((id, evento) => gestor.seleccionarId(id, evento), [gestor]);

  const alContexto = useCallback((evento, ids) => gestor.abrirMenuContextual(evento, ids), [gestor]);

  const alCerrarPrevisualizacion = useCallback(() => gestor.cerrarArchivo(), [gestor]);

  const alSubirArchivos = useCallback((archivos) => { gestor.subirArchivos(archivos); }, [gestor]);

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
    const archivos = Array.from(evento.dataTransfer?.files || []);
    gestor.subirArchivos(archivos);
  };

  const alReintentar = useCallback(() => { cargarConexiones(); }, [cargarConexiones]);

  return (
    <section
      aria-labelledby="dashboard-title"
      className="space-y-6 pt-6 pb-10"
      onDragOver={alArrastrarSobre}
      onDragLeave={alArrastrarFuera}
      onDrop={alSoltar}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p><h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Almacenamiento</h1><p className="mt-1 text-sm text-slate-text">Administra tus cuentas de almacenamiento en la nube.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { setCuentaSeleccionadaDrive(conexiones.find((c) => c.proveedor === "GOOGLE_DRIVE") || null); setModalDriveAbierto(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-line/60 px-4 py-2 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"><ExternalLink className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Google Drive</button>
          <button type="button" onClick={cargarConexiones} disabled={cargando} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-line/60 px-4 py-2 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5 disabled:opacity-50"><RefreshCw className="h-4 w-4" aria-hidden="true" />Actualizar</button>
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
                <button type="button" onClick={() => gestor.copiar(gestor.seleccionIds)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"><Copy className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Copiar</button>
                <button type="button" onClick={() => gestor.iniciarModoMover(gestor.seleccionIds)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"><HardDrive className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Mover</button>
                <button type="button" onClick={() => gestor.compartirItem(gestor.seleccionIds[0])} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"><ExternalLink className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Compartir</button>
                <button type="button" onClick={() => gestor.eliminarItems(gestor.seleccionIds)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-300/40 px-3 text-sm font-medium text-red-700 hover:bg-red-500/10"><Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar</button>
              </div>
            </div>
          )}
          <AlmacenamientoArchivos
            items={gestor.itemsVisibles}
            vista={gestor.vista}
            busqueda={gestor.busqueda}
            cargando={gestor.cargando}
            error={gestor.error}
            onReintentar={alReintentar}
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

      <ModalPrevisualizacion abierto={Boolean(gestor.archivoActivo)} item={gestor.archivoActivo} alCerrar={alCerrarPrevisualizacion} />

      <ModalGoogleDrive abierto={modalDriveAbierto} alCerrar={() => setModalDriveAbierto(false)} cuenta={cuentaSeleccionadaDrive} />

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-3"><HardDrive className="h-5 w-5 text-emerald-primary" aria-hidden="true"/><h2 className="font-display text-lg font-semibold text-bg-dark">Cuentas conectadas</h2></div>
        {cargando && <p role="status" className="text-sm text-slate-text">Cargando cuentas…</p>}
        {!cargando && error && <div role="alert" className="space-y-3"><p className="text-sm text-red-700">{error}</p><button type="button" onClick={cargarConexiones} className="text-sm font-semibold text-emerald-primary underline">Reintentar</button></div>}
        {!cargando && !error && conexiones.length === 0 && <div className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-6 text-center"><Cloud className="mx-auto h-8 w-8 text-emerald-primary" aria-hidden="true"/><p className="mt-3 font-medium text-bg-dark">Aún no tienes cuentas conectadas</p><p className="mt-1 text-sm text-slate-text">Conecta Google Drive, OneDrive o Nextcloud desde Configuración.</p><a href="/dashboard/configuracion" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover">Ir a Configuración</a></div>}
        {!cargando && conexiones.length > 0 && <ul className="divide-y divide-border-line/40">{conexiones.map((cuenta) => <li key={cuenta.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="font-semibold text-bg-dark">{ETIQUETAS_PROVEEDOR[cuenta.proveedor] || cuenta.proveedor}</p><p className="truncate text-sm text-slate-text">{cuenta.etiquetaCuenta || cuenta.urlServidor || "Cuenta de almacenamiento"}</p><p className="mt-1 text-xs text-slate-text">{ETIQUETAS_ESTADO[cuenta.estado] || cuenta.estado}</p></div><div className="flex items-center gap-2">{cuenta.proveedor === "GOOGLE_DRIVE" && <button type="button" onClick={() => { setCuentaSeleccionadaDrive(cuenta); setModalDriveAbierto(true); }} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"><ExternalLink className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Abrir Drive</button>}<button type="button" onClick={() => alDesconectar(cuenta)} disabled={cuentaDesconectando === cuenta.id} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-line/60 px-3 text-sm text-slate-text hover:bg-red-50 hover:text-red-700 disabled:opacity-50"><Unplug className="h-4 w-4" aria-hidden="true" />{cuentaDesconectando === cuenta.id ? "Desconectando…" : "Desconectar"}</button></div></li>)}</ul>}
      </Card>
    </section>
  );
}
