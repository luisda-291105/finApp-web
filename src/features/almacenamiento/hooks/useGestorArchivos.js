/**
 * @uso        Gestor del árbol de archivos del feature almacenamiento (demo local)
 * @funciones  useGestorArchivos()
 * @datos      Items planos con padreId; vistas unidad, recientes, compartidos y papelera
 * @eventos    Navegación, creación, subida, selección, contexto, copiar/mover/eliminar
 * @estados    items, carpetaId, vista, busqueda, seleccion, menuContexto, archivoActivoId, subiendo, progreso, cargando, error
 * @usadoPor   AlmacenamientoPage
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { crearId, esArchivo, esRecienteArchivo, TIPO_ARCHIVO, TIPO_CARPETA } from "../utils/archivos";

/** Identificador de la carpeta raíz demo: «Mi unidad». */
const ID_RAIZ = "arch-unidad";

const VISTA_UNIDAD = "unidad";
const VISTA_RECIENTES = "recientes";
const VISTA_COMPARTIDOS = "compartidos";
const VISTA_PAPELERA = "papelera";

function crearArbolDemo() {
  const ahora = Date.now();
  const dia = 24 * 60 * 60 * 1000;
  const item = (id, nombre, tipo, padreId, diasModificacion, tamanio = 0, extra = {}) => ({
    id,
    nombre,
    tipo,
    padreId,
    fechaModificacion: new Date(ahora - (diasModificacion ?? 0) * dia).toISOString(),
    tamanio,
    ...extra,
  });
  return [
    item(ID_RAIZ, "Mi unidad", TIPO_CARPETA, null, 0, 0),
    item("arch-finanzas", "Finanzas", TIPO_CARPETA, ID_RAIZ, 2, 0),
    item("arch-personal", "Personal", TIPO_CARPETA, ID_RAIZ, 5, 0),
    item("arch-facturas", "Facturas", TIPO_CARPETA, "arch-finanzas", 1, 0),
    item("arch-presupuestos", "Presupuestos", TIPO_CARPETA, "arch-finanzas", 3, 0),
    item("arch-contrato", "contrato-personal.pdf", TIPO_ARCHIVO, "arch-personal", 6, 148_520, {
      mime: "application/pdf",
      compartido: false,
      eliminado: false,
    }),
    item("arch-factura-2026-03", "factura-2026-03.pdf", TIPO_ARCHIVO, "arch-facturas", 0.2, 248_120, {
      mime: "application/pdf",
      compartido: false,
      eliminado: false,
    }),
    item("arch-factura-2026-04", "factura-2026-04.pdf", TIPO_ARCHIVO, "arch-facturas", 1.2, 231_980, {
      mime: "application/pdf",
      compartido: false,
      eliminado: false,
    }),
    item("arch-presupuesto-2026", "presupuesto-2026.xlsx", TIPO_ARCHIVO, "arch-presupuestos", 3.5, 88_430, {
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      compartido: false,
      eliminado: false,
    }),
  ];
}

/** Devuelve los hijos directos de una carpeta (carpetas primero, luego archivos). */
function hijosDe(items, carpetaId) {
  const hijos = items.filter((item) => item.padreId === carpetaId && !item.eliminado);
  const carpetas = hijos
    .filter((item) => item.tipo === TIPO_CARPETA)
    .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es", { sensitivity: "base" }));
  const archivos = hijos
    .filter((item) => item.tipo === TIPO_ARCHIVO)
    .sort((a, b) => String(b.nombre).localeCompare(String(a.nombre), "es", { sensitivity: "base" }));
  return [...carpetas, ...archivos];
}

/** Construye la miga de pan: la ruta desde «Mi unidad» hasta la carpeta activa. */
function construirRuta(items, carpetaId) {
  const ruta = [];
  let actual = items.find((item) => item.id === carpetaId) || null;
  let guardado = 0;
  while (actual && guardado < 24) {
    ruta.unshift({ id: actual.id, nombre: actual.nombre });
    actual = actual.padreId ? items.find((item) => item.id === actual.padreId) || null : null;
    guardado += 1;
  }
  return ruta;
}

export function useGestorArchivos() {
  const [items, setItems] = useState(crearArbolDemo);
  const [carpetaId, setCarpetaId] = useState(ID_RAIZ);
  const [vista, setVista] = useState(VISTA_UNIDAD);
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(() => new Set());
  const [menuContexto, setMenuContexto] = useState(null);
  const [archivoActivoId, setArchivoActivoId] = useState(null);
  const [modoMover, setModoMover] = useState(null);
  const [portapapeles, setPortapapeles] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [renombrandoId, setRenombrandoId] = useState(null);
  const [nombreEditando, setNombreEditando] = useState("");

  useEffect(() => {
    const temporador = setTimeout(() => setCargando(false), 200);
    return () => clearTimeout(temporador);
  }, []);

  const carpetaActual = useMemo(
    () => items.find((item) => item.id === carpetaId) || items.find((item) => item.id === ID_RAIZ) || null,
    [items, carpetaId]
  );

  const itemsVisibles = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase();
    let resultado = [];
    if (vista === VISTA_UNIDAD) {
      resultado = carpetaActual?.tipo === TIPO_CARPETA ? hijosDe(items, carpetaActual.id) : [];
    } else if (vista === VISTA_RECIENTES) {
      resultado = items.filter((item) => item.tipo === TIPO_ARCHIVO && !item.eliminado && esRecienteArchivo(item.fechaModificacion));
    } else if (vista === VISTA_COMPARTIDOS) {
      resultado = items.filter((item) => item.compartido && !item.eliminado);
    } else if (vista === VISTA_PAPELERA) {
      resultado = items.filter((item) => item.eliminado);
    }
    const filtrado = consulta ? resultado.filter((item) => item.nombre.toLowerCase().includes(consulta)) : resultado;
    return [...filtrado].sort((a, b) => String(b.nombre).localeCompare(String(a.nombre), "es", { sensitivity: "base" }));
  }, [items, vista, busqueda, carpetaActual]);

  const ruta = useMemo(() => construirRuta(items, carpetaId), [items, carpetaId]);

  const seleccionIds = useMemo(() => Array.from(seleccion), [seleccion]);

  const abrirCarpeta = useCallback((id) => {
    setCarpetaId(id);
    setVista(VISTA_UNIDAD);
    setBusqueda("");
    setSeleccion(new Set());
  }, []);

  const seleccionarVista = useCallback((nuevaVista) => {
    setVista(nuevaVista);
    if (nuevaVista !== VISTA_UNIDAD) setCarpetaId(ID_RAIZ);
    setBusqueda("");
    setSeleccion(new Set());
  }, []);

  const seleccionarId = useCallback((id, evento) => {
    setSeleccion((previo) => {
      const siguiente = new Set(previo);
      if (evento?.ctrlKey || evento?.metaKey) {
        if (siguiente.has(id)) siguiente.delete(id);
        else siguiente.add(id);
        return siguiente;
      }
      siguiente.clear();
      siguiente.add(id);
      return siguiente;
    });
  }, []);

  const limpiarSeleccion = useCallback(() => setSeleccion(new Set()), []);

  const abrirMenuContextual = useCallback((evento, ids) => {
    evento.preventDefault();
    evento.stopPropagation();
    setMenuContexto({ ids, x: evento.clientX, y: evento.clientY });
  }, []);

  const cerrarMenu = useCallback(() => setMenuContexto(null), []);

  const abrirArchivo = useCallback((id) => {
    setArchivoActivoId(id);
  }, []);

  const cerrarArchivo = useCallback(() => setArchivoActivoId(null), []);

  const iniciarRenombrado = useCallback((id) => {
    setArchivoActivoId(null);
    setMenuContexto(null);
    setRenombrandoId(id);
    const item = items.find((itemActual) => itemActual.id === id);
    setNombreEditando(item?.nombre || "");
  }, [items]);

  const confirmarRenombrado = useCallback(() => {
    const id = renombrandoId;
    const nombre = String(nombreEditando || "").trim();
    if (id && nombre) {
      setItems((previo) => previo.map((item) => (item.id === id ? { ...item, nombre } : item)));
    }
    setRenombrandoId(null);
    setNombreEditando("");
  }, [renombrandoId, nombreEditando]);

  const cancelarRenombrado = useCallback(() => {
    setRenombrandoId(null);
    setNombreEditando("");
  }, []);

  const iniciarModoMover = useCallback((ids) => {
    setMenuContexto(null);
    setSeleccion(new Set(ids));
    setModoMover({ ids });
  }, []);

  const cancelarModoMover = useCallback(() => setModoMover(null), []);

  const copiar = useCallback((ids) => {
    setModoMover(null);
    setPortapapeles({ ids, corte: false });
  }, []);

  const mover = useCallback((ids) => {
    setModoMover(null);
    setPortapapeles({ ids, corte: true });
  }, []);

  const pegar = useCallback(() => {
    if (!portapapeles || portapapeles.ids.length === 0) return;
    const idsOrigen = portapapeles.ids;
    const corte = portapapeles.corte;
    const destino = carpetaId;
    if (corte) {
      setItems((previo) => previo.filter((item) => !idsOrigen.includes(item.id)));
    }
    idsOrigen.forEach((idOrigen) => {
      const origen = items.find((item) => item.id === idOrigen);
      if (!origen) return;
      setItems((previo) => [
        ...previo,
        {
          id: crearId(),
          nombre: origen.nombre,
          tipo: origen.tipo,
          padreId: destino,
          mime: origen.mime,
          tamanio: origen.tamanio,
          fechaModificacion: new Date().toISOString(),
          compartido: false,
          eliminado: false,
        },
      ]);
    });
    setPortapapeles(null);
  }, [portapapeles, items, carpetaId]);

  const crearCarpeta = useCallback(() => {
    const existentes = items.filter((item) => item.padreId === carpetaId && !item.eliminado && item.tipo === TIPO_CARPETA);
    const nombre = `Nueva carpeta ${existentes.length + 1}`;
    const nuevo = {
      id: crearId(),
      nombre,
      tipo: TIPO_CARPETA,
      padreId: carpetaId,
      fechaModificacion: new Date().toISOString(),
      tamanio: 0,
      compartido: false,
      eliminado: false,
    };
    setItems((previo) => [...previo, nuevo]);
    setSeleccion(new Set([nuevo.id]));
    setRenombrandoId(nuevo.id);
    setNombreEditando(nombre);
    return nuevo.id;
  }, [items, carpetaId]);

  const subirArchivos = useCallback(async (archivos) => {
    if (!archivos || archivos.length === 0) return;
    setSubiendo(true);
    setProgreso(0);
    try {
      for (const archivo of archivos) {
        setProgreso((valor) => Math.min(100, valor + 20));
        await new Promise((resolver) => setTimeout(resolver, 40));
        setItems((previo) => [
          ...previo,
          {
            id: crearId(),
            nombre: archivo.name || "archivo",
            tipo: TIPO_ARCHIVO,
            padreId: carpetaId,
            mime: archivo.type || "application/octet-stream",
            tamanio: Number(archivo.size) || 0,
            fechaModificacion: new Date(archivo.lastModified || Date.now()).toISOString(),
            compartido: false,
            eliminado: false,
          },
        ]);
      }
      setProgreso(100);
    } finally {
      setSubiendo(false);
    }
  }, [carpetaId]);

  const eliminarItems = useCallback((ids) => {
    const lista = Array.isArray(ids) ? ids : [ids];
    setItems((previo) => previo.map((item) => (lista.includes(item.id) ? { ...item, eliminado: true } : item)));
    setSeleccion(new Set());
  }, []);

  const renombrarItem = useCallback((id, nombre) => {
    const valor = String(nombre || "").trim();
    if (!id || !valor) return;
    setItems((previo) => previo.map((item) => (item.id === id ? { ...item, nombre: valor } : item)));
  }, []);

  const compartirItem = useCallback((id) => {
    setItems((previo) => previo.map((item) => (item.id === id ? { ...item, compartido: !item.compartido } : item)));
  }, []);

  const archivoActivo = useMemo(() => items.find((item) => item.id === archivoActivoId) || null, [items, archivoActivoId]);

  return {
    items,
    carpetaActual,
    itemsVisibles,
    ruta,
    carpetaId,
    vista,
    setVista,
    busqueda,
    setBusqueda,
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
    pegar,
    crearCarpeta,
    subirArchivos,
    subiendo,
    progreso,
    eliminarItems,
    renombrarItem,
    compartirItem,
    seleccionarVista,
    abrirCarpeta,
    cargando,
    error,
  };
}
