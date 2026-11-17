/**
 * @uso        Gestiona el navegador de archivos del feature almacenamiento
 * @funciones  AlmacenamientoPage()
 * @datos      Conexiones de almacenamiento y árbol de archivos remoto vía useGestorArchivos
 * @eventos    Selección de cuenta, reconexión, navegación, subida, descarga, compartir, mover, restaurar y eliminación
 * @estados    conexiones, cuentaActivaId, cargandoCuentas, errorCuentas, arrastrandoSobre, modalCompartir, modalMover, procesandoMover, reconectando
 * @usadoPor   App.jsx mediante la API pública de features/almacenamiento
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Trash2, Upload } from "lucide-react";
import { useAlertas } from "../../../context/AlertasContext";
import { obtenerConexiones, conectarGoogleDrive } from "../services/almacenamientoServicio";
import AlmacenamientoSidebar from "../components/files/AlmacenamientoSidebar";
import AlmacenamientoToolbar from "../components/files/AlmacenamientoToolbar";
import AlmacenamientoCrumbs from "../components/files/AlmacenamientoCrumbs";
import AlmacenamientoArchivos from "../components/files/AlmacenamientoArchivos";
import ContextoMenuArchivos from "../components/files/ContextoMenuArchivos";
import ModalPrevisualizacion from "../components/modals/ModalPrevisualizacion";
import ModalCompartir from "../components/modals/ModalCompartir";
import ModalMover from "../components/modals/ModalMover";
import { useGestorArchivos } from "../hooks/useGestorArchivos";

const ETIQUETAS_ESTADO = { ACTIVA: "Activa", REQUIERE_RECONEXION: "Requiere reconexión", DESCONECTADA: "Desconectada" };
const ETIQUETAS_PROVEEDOR = { GOOGLE_DRIVE: "Google Drive", ONEDRIVE: "OneDrive", NEXTCLOUD: "Nextcloud" };
const CLASES_ESTADO = {
  ACTIVA: "bg-emerald-primary/10 text-emerald-primary border-emerald-primary/30",
  REQUIERE_RECONEXION: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  DESCONECTADA: "bg-slate-500/10 text-slate-600 border-slate-400/30",
};

function nombreCuenta(cuenta) {
  return cuenta?.etiquetaCuenta || cuenta?.correo || cuenta?.identificadorExterno || cuenta?.nombre || "Cuenta";
}

function nombreProveedor(proveedor) {
  return ETIQUETAS_PROVEEDOR[proveedor] || proveedor || "";
}

export default function AlmacenamientoPage() {
  const alertas = useAlertas();
  const STORAGE_KEY = "finapp:almacenamiento:cuentaActivaId";
  const [conexiones, setConexiones] = useState([]);
  const [cuentaActivaId, setCuentaActivaId] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY) || "";
  });
  const [cargandoCuentas, setCargandoCuentas] = useState(true);
  const [errorCuentas, setErrorCuentas] = useState("");
  const [arrastrandoSobre, setArrastrandoSobre] = useState(false);
  const [itemCompartir, setItemCompartir] = useState(null);
  const [modalMover, setModalMover] = useState({ abierto: false, ids: [], accion: "mover" });
  const [procesandoMover, setProcesandoMover] = useState(false);
  const [reconectando, setReconectando] = useState(false);

  const gestor = useGestorArchivos({ cuentaId: cuentaActivaId });
  const cuentaActiva = useMemo(() => conexiones.find((c) => String(c.id) === String(cuentaActivaId)) || null, [conexiones, cuentaActivaId]);
  const puedeOperar = Boolean(cuentaActivaId) && cuentaActiva?.estado === "ACTIVA";
  const esPapelera = gestor.vista === "papelera";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (cuentaActivaId) {
      localStorage.setItem(STORAGE_KEY, cuentaActivaId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [cuentaActivaId]);

  const cargarConexiones = useCallback(async () => {
    setCargandoCuentas(true);
    setErrorCuentas("");
    try {
      const lista = await obtenerConexiones();
      const normalizadas = Array.isArray(lista) ? lista : [];
      setConexiones(normalizadas);
      setCuentaActivaId((actual) => {
        if (actual && normalizadas.some((c) => String(c.id) === String(actual))) return actual;
        return normalizadas[0]?.id ? String(normalizadas[0].id) : "";
      });
    } catch (error) {
      const mensaje = error?.message || "No pudimos cargar tus cuentas de almacenamiento.";
      setErrorCuentas(mensaje);
    } finally {
      setCargandoCuentas(false);
    }
  }, []);

  useEffect(() => { cargarConexiones(); }, [cargarConexiones]);

  const notificar = useCallback((tipo, mensaje, duracionMs) => {
    if (alertas?.mostrarAlerta) alertas.mostrarAlerta(mensaje, { tipo, duracionMs });
  }, [alertas]);

  const mostrarError = useCallback((error, titulo = "") => {
    const mensaje = error?.message || String(error || "Ocurrió un error inesperado.");
    const texto = /^error http/i.test(mensaje) ? "Algo no salió bien. Inténtalo de nuevo." : mensaje;
    notificar("error", titulo ? `${titulo}. ${texto}` : texto);
  }, [notificar]);

  const mostrarExito = useCallback((mensaje, titulo = "Listo") => {
    notificar("exito", titulo && titulo !== "Listo" ? `${titulo}. ${mensaje}` : mensaje, 4000);
  }, [notificar]);

  useEffect(() => {
    if (!gestor.error) return;
    notificar("error", gestor.error, 6000);
    gestor.limpiarError();
  }, [gestor.error, gestor.limpiarError, notificar]);

  useEffect(() => {
    if (!gestor.aviso) return;
    notificar("advertencia", gestor.aviso, 6000);
    gestor.limpiarAviso();
  }, [gestor.aviso, gestor.limpiarAviso, notificar]);

  const alAbrir = useCallback((id) => {
    const item = gestor.items.find((itemActual) => itemActual.id === id);
    if (!item) return;
    if (item.tipo === "carpeta") gestor.abrirCarpeta(id);
    else gestor.abrirArchivo(id);
  }, [gestor]);

  const alDescargar = useCallback(async (id) => {
    const item = gestor.items.find((itemActual) => itemActual.id === id);
    if (!item || item.tipo !== "archivo") return;
    try {
      const blob = await gestor.descargar(id);
      if (!blob) throw new Error("No pudimos descargar el archivo. Inténtalo de nuevo.");
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = item.nombre || "archivo";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      mostrarExito(`Descarga iniciada: ${item.nombre}`);
    } catch (error) {
      mostrarError(error, "No se pudo descargar el archivo");
    }
  }, [gestor, mostrarError, mostrarExito]);

  const eliminarArchivoActivo = useCallback(async (id) => {
    if (!id) return;
    const enPapelera = gestor.vista === "papelera";
    if (window.confirm(enPapelera ? "¿Eliminar definitivamente el elemento? Esta acción no se puede deshacer." : "¿Enviar el elemento a la papelera?")) {
      try {
        await gestor.eliminarItems([id]);
        gestor.cerrarArchivo();
        mostrarExito(enPapelera ? "Elemento eliminado definitivamente." : "Elemento enviado a la papelera.");
      } catch (e) { mostrarError(e, "No se pudo eliminar el elemento"); }
    }
  }, [gestor, mostrarError, mostrarExito]);

  const alArrastrarSobre = (evento) => { if (!puedeOperar) return; evento.preventDefault(); setArrastrandoSobre(true); };
  const alArrastrarFuera = (evento) => { evento.preventDefault(); setArrastrandoSobre(false); };

  const [arrastreItem, setArrastreItem] = useState({ ids: [] });
  const [carpetaSobreId, setCarpetaSobreId] = useState(null);

  const alSoltar = async (evento) => {
    evento.preventDefault();
    setArrastrandoSobre(false);
    if (!puedeOperar) return;
    // Si hay un arrastre interno pendiente, no es una subida
    if (arrastreItem.ids.length > 0) {
      setArrastreItem({ ids: [] });
      return;
    }
    const dataTransfer = evento.dataTransfer;
    const archivos = Array.from(dataTransfer?.files || []);
    const esArrastreInterno = dataTransfer?.types?.includes("text/plain");
    if (!archivos.length || esArrastreInterno) return;
    await gestor.subirArchivos(archivos);
  };

  const iniciarArrastre = useCallback((item) => { setArrastreItem({ ids: item?.id ? [item.id] : [] }); }, []);
  const alArrastrarSobreCarpeta = useCallback((evento, destinoId) => { if (!puedeOperar) return; evento.preventDefault(); evento.stopPropagation(); try { evento.dataTransfer.dropEffect = "move"; } catch {} setCarpetaSobreId(destinoId); }, [puedeOperar]);
  const alCancelarArrastre = useCallback(() => { setCarpetaSobreId(null); setArrastreItem({ ids: [] }); }, []);

  const alSoltarEnCarpeta = useCallback(async (evento, destinoId) => {
    evento.preventDefault();
    evento.stopPropagation();
    setCarpetaSobreId(null);
    const ids = arrastreItem?.ids || [];
    setArrastreItem({ ids: [] });
    if (!puedeOperar || !ids.length || !destinoId) return;
    const esSujetoDeArrastre = (id) => {
      let actual = items.find((itemActual) => String(itemActual.id) === String(id));
      const visitados = new Set();
      while (actual && actual.padreId && actual.padreId !== "root") {
        const clave = String(actual.id);
        if (visitados.has(clave)) return false;
        visitados.add(clave);
        if (String(actual.padreId) === String(destinoId)) return true;
        actual = items.find((itemActual) => String(itemActual.id) === String(actual.padreId)) || null;
      }
      return false;
    };
    if (ids.some((id) => String(id) === String(destinoId) || esSujetoDeArrastre(id))) return;
    try {
      await gestor.mover(ids);
      await gestor.pegar(destinoId);
      mostrarExito("Elementos movidos.");
    } catch (error) { mostrarError(error, "No se pudo completar la operación"); }
  }, [arrastreItem, gestor, gestor.items, puedeOperar, mostrarError, mostrarExito]);

  const alReconectar = async () => {
    setReconectando(true);
    try {
      await conectarGoogleDrive();
      await cargarConexiones();
      mostrarExito("Cuenta reconectada. Ya puedes continuar.");
    } catch (error) {
      mostrarError(error, "No se pudo reconectar la cuenta");
    } finally {
      setReconectando(false);
    }
  };

  const confirmarVaciarPapelera = async () => {
    if (!window.confirm("¿Vaciar la papelera? Esta acción eliminará definitivamente todos los elementos y no se puede deshacer.")) return;
    try {
      await gestor.vaciarPapelera();
      mostrarExito("La papelera se vació correctamente.");
    } catch (error) { mostrarError(error, "No se pudo vaciar la papelera"); }
  };

  const eliminarDefinitivo = async (ids) => {
    if (!window.confirm("¿Eliminar definitivamente los elementos seleccionados? Esta acción no se puede deshacer.")) return;
    try {
      await gestor.eliminarItems(ids, { definitivo: true });
      mostrarExito("Elementos eliminados definitivamente.");
    } catch (error) { mostrarError(error, "No se pudieron eliminar los elementos"); }
  };

  const alRestaurar = async (ids) => {
    try {
      await gestor.restaurarItems(ids);
      mostrarExito("Elementos restaurados.");
    } catch (error) { mostrarError(error, "No se pudieron restaurar los elementos"); }
  };

  const abrirMover = (ids, accion = "mover") => setModalMover({ abierto: true, ids: Array.from(new Set(ids || [])), accion });
  const alCortar = useCallback((ids) => { if (!ids?.length) return; gestor.cortar(ids); }, [gestor]);
  const confirmarMover = async (destinoId) => {
    setProcesandoMover(true);
    try {
      if (modalMover.accion === "copiar") {
        await gestor.copiar(modalMover.ids);
        await gestor.pegar(destinoId);
      } else {
        await gestor.mover(modalMover.ids);
        await gestor.pegar(destinoId);
      }
      mostrarExito(modalMover.accion === "copiar" ? "Elementos copiados." : "Elementos movidos.");
      setModalMover({ abierto: false, ids: [], accion: "mover" });
    } catch (error) { mostrarError(error, "No se pudo completar la operación"); }
    finally { setProcesandoMover(false); }
  };

  const carpetasDestino = useMemo(() => gestor.items.filter((item) => item.tipo === "carpeta"), [gestor.items]);
  const mostrarCrumbs = gestor.vista === "unidad";
  const sinCuenta = !cargandoCuentas && conexiones.length === 0;
  const cuentaRequiereReconexion = cuentaActiva?.estado === "REQUIERE_RECONEXION";

  return (
    <section aria-labelledby="almacenamiento-title" className="space-y-6 pt-6 pb-10" onDragOver={alArrastrarSobre} onDragLeave={alArrastrarFuera} onDrop={alSoltar}>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="almacenamiento-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Almacenamiento</h1>
          <p className="mt-1 text-sm text-slate-text">Explora y gestiona tus archivos en la nube.</p>
        </div>
        <div className={`w-full max-w-md space-y-2 rounded-2xl border p-3 ${sinCuenta ? "border-amber-500/40 bg-amber-500/10" : "border-border-line/50 bg-bg-cream/60"}`}>
          <label htmlFor="selector-cuenta-almacenamiento" className="block text-xs font-semibold uppercase tracking-wide text-slate-text">Cuenta conectada</label>
          {cargandoCuentas ? <p role="status" className="text-sm text-slate-text">Cargando cuentas…</p> : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                id="selector-cuenta-almacenamiento"
                value={cuentaActivaId}
                onChange={(e) => setCuentaActivaId(e.target.value)}
                disabled={conexiones.length === 0}
                className={`min-h-11 w-full appearance-none rounded-xl border px-3 pr-10 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${conexiones.length === 0 ? "cursor-not-allowed border-amber-500/50 bg-bg-cream text-bg-dark" : "border-border-line/60 bg-bg-cream text-bg-dark"}`}
              >
                {conexiones.length === 0 && <option value="">Sin cuentas conectadas</option>}
                {conexiones.map((cuenta) => <option key={cuenta.id} value={String(cuenta.id)}>{nombreCuenta(cuenta)}{cuenta.proveedor ? ` · ${nombreProveedor(cuenta.proveedor)}` : ""}</option>)}
              </select>
              {cuentaActiva && <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${CLASES_ESTADO[cuentaActiva.estado] || CLASES_ESTADO.DESCONECTADA}`}>{ETIQUETAS_ESTADO[cuentaActiva.estado] || cuentaActiva.estado || "Estado desconocido"}</span>}
              {sinCuenta && <span className="inline-flex shrink-0 items-center rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-800">Sin conexión</span>}
            </div>
          )}
          {cuentaRequiereReconexion && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
              <p className="text-sm text-amber-800">La cuenta requiere reconexión para actualizar permisos y continuar.</p>
              <button type="button" onClick={alReconectar} disabled={reconectando} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-600 px-3 text-sm font-semibold text-white disabled:opacity-50">
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />{reconectando ? "Reconectando…" : "Reconectar"}
              </button>
            </div>
          )}
          {errorCuentas && <p role="alert" className="text-sm text-red-700">{errorCuentas}</p>}
          {sinCuenta && <p className="text-sm text-slate-text">Conecta una cuenta desde Configuración para administrar tus archivos.</p>}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AlmacenamientoSidebar vista={gestor.vista} alSeleccionarVista={gestor.seleccionarVista} />
        <div className="min-w-0 space-y-4">
          <AlmacenamientoToolbar
            busqueda={gestor.busqueda}
            alCambiarBusqueda={gestor.setBusqueda}
            modoVista={gestor.modoVista}
            alCambiarModoVista={gestor.setModoVista}
            subiendo={gestor.subiendo}
            progreso={gestor.progreso}
            alCrearCarpeta={gestor.crearCarpeta}
            alSubirArchivos={gestor.subirArchivos}
            deshabilitado={!puedeOperar}
          />

          {mostrarCrumbs && <AlmacenamientoCrumbs ruta={gestor.ruta} alNavegar={gestor.abrirCarpeta} />}

          {esPapelera && gestor.itemsVisibles.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border-line/50 bg-bg-cream/60 p-3">
              <p className="text-sm text-slate-text">Los elementos en la papelera se pueden restaurar o eliminar definitivamente.</p>
              <button type="button" onClick={confirmarVaciarPapelera} disabled={!puedeOperar} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-300/40 px-3 text-sm font-medium text-red-700 hover:bg-red-500/10 disabled:opacity-50">
                <Trash2 className="h-4 w-4" aria-hidden="true" />Vaciar papelera
              </button>
            </div>
          )}

          <AlmacenamientoArchivos
            items={gestor.itemsVisibles}
            modoVista={gestor.modoVista}
            vistaActual={gestor.vista}
            busqueda={gestor.busqueda}
            cargando={gestor.cargando || cargandoCuentas}
            error={!puedeOperar && cuentaRequiereReconexion ? "La cuenta requiere reconexión para listar archivos." : (!cuentaActivaId && !cargandoCuentas ? "" : "")}
            onReintentar={gestor.recargar}
            seleccion={gestor.seleccion}
            renombrandoId={gestor.renombrandoId}
            nombreEditando={gestor.nombreEditando}
            alSeleccionar={gestor.seleccionarId}
            alAbrir={alAbrir}
            alContexto={gestor.abrirMenuContextual}
            alCambiarNombre={gestor.renombrarItem}
            alConfirmarRenombrado={gestor.confirmarRenombrado}
            alCancelarRenombrado={gestor.cancelarRenombrado}
            arrastrandoId={arrastreItem?.ids?.[0] || null}
            carpetaSobreId={carpetaSobreId}
            portapapeles={gestor.portapapeles}
            alArrastrarInicio={iniciarArrastre}
            alCancelarArrastre={alCancelarArrastre}
            alSoltarEnCarpeta={alSoltarEnCarpeta}
            alArrastrarSobreCarpeta={alArrastrarSobreCarpeta}
          />
        </div>
      </div>

      {arrastrandoSobre && puedeOperar && (
        <div className="pointer-events-none fixed inset-0 z-[1500] flex items-center justify-center bg-bg-dark/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-dashed border-emerald-primary/60 bg-bg-cream/90 p-8 text-center">
            <Upload className="mx-auto h-10 w-10 text-emerald-primary" aria-hidden="true" />
            <p className="mt-3 font-medium text-bg-dark">Suelta los archivos para subirlos</p>
            <p className="mt-1 text-sm text-slate-text">Se subirán a la carpeta actual.</p>
          </div>
        </div>
      )}

      {gestor.menuContexto && (
        <ContextoMenuArchivos
          menu={gestor.menuContexto}
          items={gestor.items}
          vistaActual={gestor.vista}
          alCerrar={gestor.cerrarMenu}
          alAbrir={alAbrir}
          alDescargar={alDescargar}
          alCopiar={(ids) => abrirMover(ids, "copiar")}
          alMover={(ids) => abrirMover(ids, "mover")}
          alCortar={alCortar}
          alCompartir={(id) => setItemCompartir(gestor.items.find((i) => i.id === id) || null)}
          alEliminar={async (ids) => { if (window.confirm("¿Mover los elementos seleccionados a la papelera?")) { try { await gestor.eliminarItems(ids); mostrarExito("Elementos enviados a la papelera."); } catch (e) { mostrarError(e); } } }}
          alRestaurar={alRestaurar}
          alEliminarDefinitivo={eliminarDefinitivo}
          alRenombrar={gestor.iniciarRenombrado}
        />
      )}

      <ModalPrevisualizacion
        abierto={Boolean(gestor.archivoActivo)}
        item={gestor.archivoActivo}
        cuentaId={cuentaActivaId}
        obtenerUrlContenido={gestor.obtenerUrlContenido}
        obtenerUrlPrevisualizacion={gestor.obtenerUrlPrevisualizacion}
        alDescargar={alDescargar}
        alRenombrar={(id, nombre) => gestor.confirmarRenombrado(id, nombre)}
        alEliminar={eliminarArchivoActivo}
        cargarContenido={gestor.descargar}
        alCerrar={gestor.cerrarArchivo}
      />

      <ModalCompartir
        abierto={Boolean(itemCompartir)}
        item={itemCompartir}
        cuentaId={cuentaActivaId}
        alCerrar={() => setItemCompartir(null)}
        alExito={(msg) => mostrarExito(msg)}
        alError={(e) => mostrarError(e, "No se pudo actualizar el uso compartido")}
      />

      <ModalMover
        abierto={modalMover.abierto}
        ids={modalMover.ids}
        accion={modalMover.accion}
        carpetas={carpetasDestino}
        cargando={procesandoMover}
        alCerrar={() => setModalMover({ abierto: false, ids: [], accion: "mover" })}
        alConfirmar={confirmarMover}
      />
    </section>
  );
}
