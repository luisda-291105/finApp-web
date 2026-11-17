/**
 * @uso        Gestor del árbol de archivos del feature almacenamiento conectado a backend
 * @funciones  useGestorArchivos({ cuentaId })
 * @datos      Items remotos por cuenta/vista/carpeta; rutas, búsqueda, orden y selección múltiple
 * @eventos    Navegación, carga, creación, subida, selección, contexto, copiar/mover/eliminar/compartir
 * @estados    items, itemsPorVista, carpetaId, ruta, vista, busqueda, orden, seleccion, menuContexto, archivoActivoId, subiendo, progreso, cargando, error, modoMover, portapapeles, renombrandoId, nombreEditando
 * @usadoPor   AlmacenamientoPage
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  copiar as copiarRemoto,
  crearCarpeta as crearCarpetaRemota,
  descargarArchivo,
  enviarAPapelera,
  listarArchivos,
  mover as moverRemoto,
  operacionLote,
  renombrar as renombrarRemoto,
  restaurar as restaurarRemoto,
  subirArchivo,
  urlContenido,
  urlPrevisualizacion,
  vaciarPapelera as vaciarPapeleraRemota,
} from "../services/almacenamientoServicio";

const VISTAS = ["unidad", "recientes", "compartidos", "destacados", "papelera"];
const normalizarVista = (vista) => (VISTAS.includes(vista) ? vista : "unidad");
const extraerLista = (respuesta) => Array.isArray(respuesta) ? respuesta : respuesta?.items || respuesta?.archivos || respuesta?.datos || respuesta?.data || [];
const extraerRuta = (respuesta, carpetaDestino, carpetas = {}, rutaAnterior = []) => {
  const ruta = Array.isArray(respuesta?.ruta) ? respuesta.ruta : Array.isArray(respuesta?.breadcrumbs) ? respuesta.breadcrumbs : null;
  if (ruta?.length) return ruta.map((n) => ({ id: n.id || "root", nombre: n.nombre || "Carpeta" }));
  if (!carpetaDestino || carpetaDestino === "root") return [{ id: "root", nombre: "Mi unidad" }];
  const indice = rutaAnterior.findIndex((n) => String(n.id) === String(carpetaDestino));
  if (indice >= 0) return rutaAnterior.slice(0, indice + 1);
  const conocida = carpetas[carpetaDestino];
  if (rutaAnterior.length) return [...rutaAnterior, { id: carpetaDestino, nombre: conocida?.nombre || "Carpeta" }];
  return [{ id: "root", nombre: "Mi unidad" }, { id: carpetaDestino, nombre: conocida?.nombre || "Carpeta" }];
};

function normalizarItem(item = {}) {
  return {
    ...item,
    id: item.id ?? item.archivoId ?? item.idArchivo ?? "",
    nombre: item.nombre ?? item.name ?? "Sin nombre",
    tipo: item.tipo === "CARPETA" || item.tipo === "carpeta" || item.esCarpeta ? "carpeta" : "archivo",
    padreId: item.padreId ?? item.parentId ?? item.carpetaId ?? null,
    mime: item.mime ?? item.mimeType ?? item.tipoMime ?? "",
    tamanio: Number(item.tamanio ?? item.size ?? 0) || 0,
    fechaModificacion: item.fechaModificacion ?? item.updatedAt ?? item.fechaActualizacion ?? item.modifiedTime ?? item.fecha ?? null,
    compartido: Boolean(item.compartido ?? item.shared),
    destacado: Boolean(item.destacado ?? item.starred),
    eliminado: Boolean(item.eliminado ?? item.trashed),
    enlaceExterno: item.enlaceExterno ?? item.webViewLink ?? item.urlExterna ?? "",
    proveedor: item.proveedor ?? item.provider ?? "",
  };
}

function esErrorSinContenido(error) {
  const mensaje = String(error?.message || error || "");
  return /no hay contenido|sin contenido|contenido vacío|contenido vacio|vac(í|i)o|no soportad[ao]|vista no soportada/i.test(mensaje);
}

function esErrorNoEncontrado(error) {
  const mensaje = String(error?.message || error || "");
  return /recurso solicitado no existe|no existe|no encontrad/i.test(mensaje);
}

function mensajeAccionable(error) {
  const mensaje = String(error?.message || error || "");
  if (/401|sesión|sesion|caduc|inicia sesi/i.test(mensaje)) {
    return "Tu sesión se cerró. Vuelve a iniciar sesión para continuar.";
  }
  if (/403|permiso|denegad|autoriz/i.test(mensaje)) {
    return "No tienes permiso para hacer esto.";
  }
  if (/quota|cuota|espacio|almacen/i.test(mensaje)) {
    return "No hay espacio disponible en esta cuenta.";
  }
  if (/409|conflic|reconex|reaut|token|scope|alcance|invalid_grant|desconect|expir|drive/i.test(mensaje)) {
    return "Necesitamos volver a conectar esta cuenta para continuar.";
  }
  if (/red|network|fetch|timeout|conexi|servidor|5\d\d/i.test(mensaje)) {
    return "No pudimos conectarnos en este momento. Inténtalo de nuevo.";
  }
  if (/^error http/i.test(mensaje)) {
    return "Algo no salió bien. Inténtalo de nuevo.";
  }
  return mensaje || "Algo no salió bien. Inténtalo de nuevo.";
}

function ordenarItems(items, orden) {
  const copia = [...items];
  const criterio = orden?.campo || "nombre";
  const direccion = orden?.direccion === "asc" ? 1 : -1;
  copia.sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === "carpeta" ? -1 : 1;
    if (criterio === "fecha") return ((new Date(a.fechaModificacion || 0)).getTime() - (new Date(b.fechaModificacion || 0)).getTime()) * direccion;
    if (criterio === "tamanio") return ((a.tamanio || 0) - (b.tamanio || 0)) * direccion;
    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", { sensitivity: "base" }) * direccion;
  });
  return copia;
}

export function useGestorArchivos({ cuentaId = "" } = {}) {
  const [itemsPorVista, setItemsPorVista] = useState({ unidad: [], recientes: [], compartidos: [], destacados: [], papelera: [] });
  const [carpetas, setCarpetas] = useState({ root: { id: "root", nombre: "Mi unidad", padreId: null } });
  const [carpetaId, setCarpetaId] = useState("root");
  const [ruta, setRuta] = useState([{ id: "root", nombre: "Mi unidad" }]);
  const [vista, setVista] = useState("unidad");
  const [modoVista, setModoVista] = useState("grid");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ campo: "nombre", direccion: "asc" });
  const [seleccion, setSeleccion] = useState(() => new Set());
  const [menuContexto, setMenuContexto] = useState(null);
  const [archivoActivoId, setArchivoActivoId] = useState(null);
  const [modoMover, setModoMover] = useState(null);
  const [portapapeles, setPortapapeles] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [renombrandoId, setRenombrandoId] = useState(null);
  const [nombreEditando, setNombreEditando] = useState("");
  const cuentaRef = useRef(cuentaId);
  const cuentaAnteriorRef = useRef(cuentaId);

  useEffect(() => { cuentaRef.current = cuentaId; }, [cuentaId]);

  useEffect(() => {
    setCarpetaId("root");
    setRuta([{ id: "root", nombre: "Mi unidad" }]);
    setSeleccion(new Set());
    setMenuContexto(null);
    setArchivoActivoId(null);
    setModoMover(null);
    setPortapapeles(null);
    setRenombrandoId(null);
    setNombreEditando("");
    setBusqueda("");
  }, [cuentaId]);

  const cargarVista = useCallback(async (vistaDestino = vista, carpetaDestino = carpetaId, busquedaDestino = busqueda) => {
    if (!cuentaRef.current) {
      setItemsPorVista({ unidad: [], recientes: [], compartidos: [], destacados: [], papelera: [] });
      setRuta([{ id: "root", nombre: "Mi unidad" }]);
      setCargando(false);
      setError("");
      setAviso("");
      return;
    }
    setCargando(true);
    setError("");
    setAviso("");
    if (vistaDestino === "unidad") {
      setRuta((previa) => extraerRuta(null, carpetaDestino, carpetas, previa));
    }
    try {
      const respuesta = await listarArchivos(cuentaRef.current, {
        vista: vistaDestino,
        carpetaId: vistaDestino === "unidad" ? carpetaDestino : undefined,
        busqueda: busquedaDestino || undefined,
        ordenCampo: orden.campo,
        ordenDireccion: orden.direccion,
      });
      const lista = extraerLista(respuesta).map(normalizarItem).filter((item) => item.id);
      setItemsPorVista((previo) => ({ ...previo, [vistaDestino]: lista }));
      if (vistaDestino === "unidad") {
        const rutaRespuesta = extraerRuta(respuesta, carpetaDestino, carpetas, [{ id: "root", nombre: "Mi unidad" }]);
        setRuta((previa) => extraerRuta(respuesta, carpetaDestino, carpetas, previa.length ? previa : rutaRespuesta));
        setCarpetas((previo) => {
          const siguiente = { ...previo };
          lista.filter((item) => item.tipo === "carpeta").forEach((item) => { siguiente[item.id] = { id: item.id, nombre: item.nombre, padreId: item.padreId ?? carpetaDestino }; });
          (extraerRuta(respuesta, carpetaDestino, carpetas, rutaRespuesta)).forEach((nodo) => { siguiente[nodo.id] = { ...(siguiente[nodo.id] || {}), id: nodo.id, nombre: nodo.nombre }; });
          return siguiente;
        });
      }
    } catch (fallo) {
      setItemsPorVista((previo) => ({ ...previo, [vistaDestino]: [] }));
      if (esErrorSinContenido(fallo)) {
        setError("");
        setAviso("");
      } else if (esErrorNoEncontrado(fallo)) {
        setError("");
        setAviso("No pudimos abrir esta carpeta. Puede que ya no exista o que no tengas acceso.");
      } else {
        setError(mensajeAccionable(fallo));
        setAviso("");
      }
    } finally {
      setCargando(false);
    }
  }, [busqueda, carpetaId, carpetas, orden.campo, orden.direccion, vista]);

  useEffect(() => {
    setSeleccion(new Set());
    setMenuContexto(null);
    const cambioCuenta = cuentaAnteriorRef.current !== cuentaId;
    cuentaAnteriorRef.current = cuentaId;
    if (cambioCuenta) {
      cargarVista(vista, "root", "");
      return;
    }
    cargarVista(vista, carpetaId, busqueda);
  }, [cuentaId, vista, carpetaId, busqueda, orden.campo, orden.direccion]); // eslint-disable-line react-hooks/exhaustive-deps

  const itemsBase = itemsPorVista[normalizarVista(vista)] || [];
  const itemsVisibles = useMemo(() => {
    const filtrados = busqueda ? itemsBase : itemsBase;
    return ordenarItems(filtrados, orden);
  }, [itemsBase, orden, busqueda]);

  const items = useMemo(() => Object.values(itemsPorVista).flat(), [itemsPorVista]);
  const seleccionIds = useMemo(() => Array.from(seleccion), [seleccion]);
  const archivoActivo = useMemo(() => items.find((item) => item.id === archivoActivoId) || null, [items, archivoActivoId]);

  const abrirCarpeta = useCallback((id) => {
    setCarpetaId(id || "root");
    setVista("unidad");
    setBusqueda("");
    setSeleccion(new Set());
  }, []);

  const seleccionarVista = useCallback((nuevaVista) => {
    const destino = normalizarVista(nuevaVista);
    setVista(destino);
    if (destino !== "unidad") setCarpetaId("root");
    setBusqueda("");
    setSeleccion(new Set());
  }, []);

  const seleccionarId = useCallback((id, evento) => {
    setSeleccion((previo) => {
      const siguiente = new Set(previo);
      if (evento?.ctrlKey || evento?.metaKey || evento?.alternar) {
        if (siguiente.has(id)) siguiente.delete(id); else siguiente.add(id);
        return siguiente;
      }
      siguiente.clear();
      siguiente.add(id);
      return siguiente;
    });
  }, []);

  const limpiarSeleccion = useCallback(() => setSeleccion(new Set()), []);
  const abrirMenuContextual = useCallback((evento, ids) => { evento.preventDefault(); evento.stopPropagation(); setMenuContexto({ ids, x: evento.clientX, y: evento.clientY }); }, []);
  const cerrarMenu = useCallback(() => setMenuContexto(null), []);
  const abrirArchivo = useCallback((id) => setArchivoActivoId(id), []);
  const cerrarArchivo = useCallback(() => setArchivoActivoId(null), []);

  const recargar = useCallback(() => cargarVista(vista, carpetaId, busqueda), [cargarVista, vista, carpetaId, busqueda]);
  const limpiarError = useCallback(() => setError(""), []);
  const limpiarAviso = useCallback(() => setAviso(""), []);

  const ejecutarAccion = useCallback(async (accion) => {
    if (!cuentaId) return;
    setError("");
    setAviso("");
    try {
      await accion();
      await recargar();
    } catch (fallo) {
      setError(mensajeAccionable(fallo));
      throw fallo;
    }
  }, [cuentaId, recargar]);

  const iniciarRenombrado = useCallback((id) => {
    setArchivoActivoId(null); setMenuContexto(null); setRenombrandoId(id);
    const item = items.find((itemActual) => itemActual.id === id);
    setNombreEditando(item?.nombre || "");
  }, [items]);

  const confirmarRenombrado = useCallback(async (id = renombrandoId, nombre = nombreEditando) => {
    const valor = String(nombre || "").trim();
    if (!id || !valor || !cuentaId) { setRenombrandoId(null); setNombreEditando(""); return; }
    await ejecutarAccion(() => renombrarRemoto(cuentaId, id, valor));
    setRenombrandoId(null); setNombreEditando("");
  }, [cuentaId, ejecutarAccion, nombreEditando, renombrandoId]);

  const cancelarRenombrado = useCallback(() => { setRenombrandoId(null); setNombreEditando(""); }, []);

  const renombrarItem = useCallback((id, nombre) => {
    setRenombrandoId(id);
    setNombreEditando(nombre ?? "");
  }, []);

  const iniciarModoMover = useCallback((ids) => { setMenuContexto(null); setSeleccion(new Set(ids)); setModoMover({ ids }); }, []);
  const cancelarModoMover = useCallback(() => setModoMover(null), []);
  const copiar = useCallback((ids) => { setModoMover(null); setPortapapeles({ ids, corte: false }); }, []);
  const mover = useCallback((ids) => { setModoMover(null); setPortapapeles({ ids, corte: true }); }, []);
  const cortar = useCallback((ids) => { setModoMover(null); setPortapapeles({ ids, corte: true }); }, []);

  const pegar = useCallback(async (destinoId = carpetaId) => {
    if (!portapapeles || portapapeles.ids.length === 0 || !cuentaId) return;
    const idsOrigen = portapapeles.ids;
    if (portapapeles.corte) await ejecutarAccion(() => moverRemoto(cuentaId, { ids: idsOrigen, destinoId }));
    else await ejecutarAccion(() => copiarRemoto(cuentaId, { ids: idsOrigen, destinoId }));
    setPortapapeles(null); setModoMover(null);
  }, [carpetaId, cuentaId, ejecutarAccion, portapapeles]);

  const crearCarpeta = useCallback(async () => {
    if (!cuentaId) return null;
    const nombre = "Nueva carpeta";
    const creada = await ejecutarAccion(async () => {
      const resultado = await crearCarpetaRemota(cuentaId, { nombre, padreId: vista === "unidad" ? carpetaId : "root" });
      if (resultado?.id) { setRenombrandoId(resultado.id); setNombreEditando(resultado.nombre || nombre); }
      return resultado;
    }).then(() => null).catch(() => null);
    return creada;
  }, [carpetaId, cuentaId, ejecutarAccion, vista]);

  const subirArchivos = useCallback(async (archivos) => {
    const lista = Array.from(archivos || []);
    if (!cuentaId || lista.length === 0) return;
    setSubiendo(true); setProgreso(0); setError("");
    try {
      let completados = 0;
      for (const archivo of lista) {
        const form = new FormData();
        form.append("archivo", archivo);
        form.append("padreId", vista === "unidad" ? carpetaId : "root");
        await subirArchivo(cuentaId, form);
        completados += 1;
        setProgreso(Math.round((completados / lista.length) * 100));
      }
      await recargar();
    } catch (fallo) {
      setError(mensajeAccionable(fallo));
    } finally {
      setSubiendo(false);
      setTimeout(() => setProgreso(0), 400);
    }
  }, [carpetaId, cuentaId, recargar, vista]);

  const eliminarItems = useCallback(async (ids, { definitivo = false } = {}) => {
    const lista = Array.isArray(ids) ? ids : [ids];
    if (!lista.length || !cuentaId) return;
    if (vista === "papelera" || definitivo) {
      await ejecutarAccion(() => operacionLote(cuentaId, { accion: "eliminar_definitivo", ids: lista }));
    } else {
      await ejecutarAccion(() => enviarAPapelera(cuentaId, { ids: lista }));
    }
    setSeleccion(new Set());
  }, [cuentaId, ejecutarAccion, vista]);

  const restaurarItems = useCallback(async (ids) => {
    const lista = Array.isArray(ids) ? ids : [ids];
    if (!lista.length || !cuentaId) return;
    await ejecutarAccion(() => restaurarRemoto(cuentaId, { ids: lista }));
    setSeleccion(new Set());
  }, [cuentaId, ejecutarAccion]);

  const vaciarPapelera = useCallback(async () => {
    if (!cuentaId) return;
    await ejecutarAccion(() => vaciarPapeleraRemota(cuentaId));
    setSeleccion(new Set());
  }, [cuentaId, ejecutarAccion]);

  const compartirItem = useCallback((id) => id, []);

  const obtenerUrlContenido = useCallback((archivoId = archivoActivoId) => (cuentaId && archivoId ? urlContenido(cuentaId, archivoId) : ""), [archivoActivoId, cuentaId]);
  const obtenerUrlPrevisualizacion = useCallback((archivoId = archivoActivoId) => (cuentaId && archivoId ? urlPrevisualizacion(cuentaId, archivoId) : ""), [archivoActivoId, cuentaId]);
  const descargar = useCallback(async (archivoId) => {
    if (!cuentaId || !archivoId) return null;
    return descargarArchivo(cuentaId, archivoId);
  }, [cuentaId]);

  const listarCarpetasDestino = useCallback(() => items.filter((item) => item.tipo === "carpeta"), [items]);

  return {
    cuentaId,
    items,
    carpetaActual: carpetas[carpetaId] || { id: "root", nombre: "Mi unidad" },
    itemsVisibles,
    ruta,
    carpetaId,
    vista,
    setVista,
    modoVista,
    setModoVista,
    busqueda,
    setBusqueda,
    orden,
    setOrden,
    seleccion,
    seleccionIds,
    seleccionarId,
    limpiarSeleccion,
    menuContexto,
    abrirMenuContextual,
    cerrarMenu,
    archivoActivoId,
    archivoActivo,
    abrirArchivo,
    cerrarArchivo,
    renombrandoId,
    nombreEditando,
    iniciarRenombrado,
    confirmarRenombrado,
    cancelarRenombrado,
    modoMover,
    iniciarModoMover,
    cancelarModoMover,
    portapapeles,
    copiar,
    mover,
    cortar,
    pegar,
    crearCarpeta,
    subirArchivos,
    subiendo,
    progreso,
    eliminarItems,
    restaurarItems,
    vaciarPapelera,
    renombrarItem,
    compartirItem,
    seleccionarVista,
    abrirCarpeta,
    cargando,
    error,
    aviso,
    limpiarError,
    limpiarAviso,
    recargar,
    obtenerUrlContenido,
    obtenerUrlPrevisualizacion,
    descargar,
    listarCarpetasDestino,
  };
}
