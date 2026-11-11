import { useEffect, useRef, useState } from "react";
import { useTema } from "../../../context/TemaContext";
import { ChevronDown, ChevronRight, FolderPlus, Pencil } from "lucide-react";
import useMuestras from "../hooks/useMuestras";
import MuestraCard from "../components/cards/MuestraCard";
import CrearMuestraModal from "../components/modals/CrearMuestraModal";
import AgruparMuestrasModal from "../components/modals/AgruparMuestrasModal";
import DetalleMuestraModal from "../components/modals/DetalleMuestraModal";
import { BORRADOR_VACIO, normalizarFuente, obtenerFuente } from "../utils/inicioHelpers";
import { listarCuentasGmail } from "../../../services/gmailServicio";

/** Compone Inicio y coordina los modales con el hook de muestras. */
export default function InicioPage() {
  const { tema } = useTema();
  const temaOscuro = tema === "oscuro";
  const {
    usuario, navigate, muestras, datosMuestras, cargandoMuestras, guardandoMuestra, eliminandoMuestra,
    errorPersistencia, setErrorPersistencia, guardarMuestra, reordenarMuestras, reordenandoMuestras, eliminarMuestraPersistida, crearAgrupacion, editarAgrupacion, separarAgrupacion,
  } = useMuestras();
  const [borrador, setBorrador] = useState(BORRADOR_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalAgrupacionAbierto, setModalAgrupacionAbierto] = useState(false);
  const [agrupacionEditando, setAgrupacionEditando] = useState(null);
  const [agrupacionesContraidas, setAgrupacionesContraidas] = useState({});
  const [preferenciasAgrupacionCargadas, setPreferenciasAgrupacionCargadas] = useState("");
  const [muestraDetalle, setMuestraDetalle] = useState(null);
  const [indiceMuestraEditando, setIndiceMuestraEditando] = useState(null);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [cuentasCorreo, setCuentasCorreo] = useState([]);
  const [cargandoCuentasCorreo, setCargandoCuentasCorreo] = useState(false);
  const [errorCuentasCorreo, setErrorCuentasCorreo] = useState("");
  const [idMuestraArrastrada, setIdMuestraArrastrada] = useState(null);
  const [idMuestraDestino, setIdMuestraDestino] = useState(null);
  const [anuncioReordenamiento, setAnuncioReordenamiento] = useState("");
  const triggerRef = useRef(null);
  const triggerAgrupacionRef = useRef(null);
  const detalleTriggerRef = useRef(null);
  const fuentesCorreoBorrador = borrador.fuente === "correo";
  const clavePreferenciasAgrupacion = usuario?.idUsuario ? `finapp:dashboard:agrupaciones-contraidas:${usuario.idUsuario}` : "";

  useEffect(() => {
    if (!clavePreferenciasAgrupacion) return;
    try {
      setAgrupacionesContraidas(JSON.parse(localStorage.getItem(clavePreferenciasAgrupacion) || "{}"));
    } catch {
      setAgrupacionesContraidas({});
    }
    setPreferenciasAgrupacionCargadas(clavePreferenciasAgrupacion);
  }, [clavePreferenciasAgrupacion]);

  useEffect(() => {
    if (clavePreferenciasAgrupacion && preferenciasAgrupacionCargadas === clavePreferenciasAgrupacion) {
      try { localStorage.setItem(clavePreferenciasAgrupacion, JSON.stringify(agrupacionesContraidas)); } catch { /* Mantiene el estado de la sesión aunque el almacenamiento esté bloqueado. */ }
    }
  }, [agrupacionesContraidas, clavePreferenciasAgrupacion, preferenciasAgrupacionCargadas]);

  useEffect(() => {
    let vigente = true;
    if (!modalAbierto || !fuentesCorreoBorrador || !usuario?.idUsuario) {
      setCargandoCuentasCorreo(false);
      setErrorCuentasCorreo("");
      return () => { vigente = false; };
    }

    setCargandoCuentasCorreo(true);
    setErrorCuentasCorreo("");
    listarCuentasGmail()
      .then((cuentas) => { if (vigente) setCuentasCorreo(cuentas); })
      .catch((error) => { if (vigente) setErrorCuentasCorreo(error?.message || "No se pudieron cargar las cuentas de correo."); })
      .finally(() => { if (vigente) setCargandoCuentasCorreo(false); });
    return () => { vigente = false; };
  }, [modalAbierto, fuentesCorreoBorrador, usuario?.idUsuario]);

  const exigirUsuario = () => {
    if (usuario?.idUsuario) return true;
    navigate("/", { replace: true });
    return false;
  };

  const alCrearMuestra = () => {
    if (!exigirUsuario()) return;
    setErrorPersistencia("");
    setIndiceMuestraEditando(null);
    setConfirmarEliminacion(false);
    setBorrador(BORRADOR_VACIO);
    setMuestraDetalle(null);
    setModalAbierto(true);
  };

  const alCerrarModal = () => {
    setModalAbierto(false);
    setBorrador(BORRADOR_VACIO);
    setIndiceMuestraEditando(null);
  };

  const alAbrirDetalle = (muestra, evento) => {
    detalleTriggerRef.current = evento?.currentTarget || null;
    setErrorPersistencia("");
    setMuestraDetalle(muestra);
  };

  const alCerrarDetalle = () => {
    setMuestraDetalle(null);
    setConfirmarEliminacion(false);
    setErrorPersistencia("");
  };

  const alCambiarBorrador = (campo, valor) => {
    setErrorPersistencia("");
    setBorrador((previo) => {
      if (campo === "cuentasCorreo") {
        return { ...previo, cuentasCorreo: valor, cuentaCorreo: valor.length === 1 ? valor[0] : "todas" };
      }
      return { ...previo, [campo]: valor };
    });
  };

  const alGuardarMuestra = async () => {
    if (!exigirUsuario()) return;
    if (await guardarMuestra(borrador, indiceMuestraEditando)) alCerrarModal();
  };

  const alEditarMuestra = () => {
    if (!exigirUsuario()) return;
    setErrorPersistencia("");
    const indice = muestras.findIndex((muestra) => String(muestra.id) === String(muestraDetalle.id));
    if (indice < 0) return;
    setIndiceMuestraEditando(indice);
    setBorrador({
      titulo: muestraDetalle.titulo,
      fuente: normalizarFuente(muestraDetalle.fuente),
      tipo: muestraDetalle.tipo,
      segmentoContable: muestraDetalle.segmentoContable || "todos",
      cuentaCorreo: muestraDetalle.cuentaCorreo || "todas",
      cuentasCorreo: muestraDetalle.cuentasCorreo || [muestraDetalle.cuentaCorreo || "todas"],
    });
    setConfirmarEliminacion(false);
    setMuestraDetalle(null);
    setModalAbierto(true);
  };

  const alEliminarMuestra = async () => {
    if (!exigirUsuario()) return;
    if (!confirmarEliminacion || !muestraDetalle) {
      setConfirmarEliminacion(true);
      return;
    }
    if (await eliminarMuestraPersistida(muestraDetalle)) {
      setConfirmarEliminacion(false);
      setMuestraDetalle(null);
    }
  };

  const alGuardarAgrupacion = (nombre, ids, idExistente) => {
    if (!exigirUsuario()) return false;
    return idExistente ? editarAgrupacion(idExistente, nombre, ids) : crearAgrupacion(nombre, ids);
  };

  const alEditarAgrupacion = (item) => {
    setErrorPersistencia("");
    setAgrupacionEditando(item);
    setModalAgrupacionAbierto(true);
  };

  const alActivarMuestra = (fuente) => {
    const origen = obtenerFuente(normalizarFuente(fuente));
    if (origen?.destino) navigate(origen.destino);
  };

  const alGuardarNuevoOrden = async (nuevosItems, claveMovida) => {
    const nuevasMuestras = nuevosItems.flatMap((item) => item.muestras);
    if (!await reordenarMuestras(nuevasMuestras)) return;
    const posicion = nuevosItems.findIndex((item) => item.clave === claveMovida);
    setAnuncioReordenamiento(`${nuevosItems[posicion]?.nombre || nuevosItems[posicion]?.muestras[0]?.titulo} está en la posición ${posicion + 1} de ${nuevosItems.length}.`);
  };

  const alMoverItemDashboard = (clave, desplazamiento) => {
    const origen = itemsDashboard.findIndex((item) => item.clave === String(clave));
    const destino = origen + desplazamiento;
    if (origen < 0 || destino < 0 || destino >= itemsDashboard.length) return;
    const siguientes = [...itemsDashboard];
    const [item] = siguientes.splice(origen, 1);
    siguientes.splice(destino, 0, item);
    alGuardarNuevoOrden(siguientes, String(clave));
  };

  const alIniciarArrastre = (evento, clave) => {
    evento.dataTransfer.effectAllowed = "move";
    evento.dataTransfer.setData("text/plain", String(clave));
    setIdMuestraArrastrada(String(clave));
  };

  const alSoltarMuestra = (evento) => {
    evento.preventDefault();
    const claveOrigen = evento.dataTransfer.getData("text/plain");
    const destino = evento.target instanceof Element ? evento.target.closest("[data-dashboard-item]") : null;
    const claveDestino = destino?.dataset.dashboardItem;
    setIdMuestraDestino(null);
    if (!claveOrigen || !claveDestino) return;
    const origen = itemsDashboard.findIndex((item) => item.clave === claveOrigen);
    const indiceDestino = itemsDashboard.findIndex((item) => item.clave === claveDestino);
    if (origen < 0 || indiceDestino < 0 || origen === indiceDestino) return;
    const rectangulo = destino.getBoundingClientRect();
    const insertarDespues = evento.clientY >= rectangulo.top + rectangulo.height / 2;
    const siguientes = [...itemsDashboard];
    const [item] = siguientes.splice(origen, 1);
    const posicionDestino = indiceDestino > origen ? indiceDestino - 1 : indiceDestino;
    siguientes.splice(posicionDestino + (insertarDespues ? 1 : 0), 0, item);
    alGuardarNuevoOrden(siguientes, claveOrigen);
  };

  const muestrasBaseConDatos = muestras.map((muestra) => {
    const fuentes = [normalizarFuente(muestra.fuente)];
    const cuentas = [...new Set((Array.isArray(muestra.cuentasCorreo) ? muestra.cuentasCorreo : [muestra.cuentaCorreo || "todas"]).map(String))].sort();
    const clave = `${fuentes.join(",")}:${muestra.segmentoContable || "todos"}:${cuentas.join(",")}`;
    const datos = datosMuestras[clave];
    return { ...muestra, ...(datos || {}), cargando: datos ? datos.cargando === true : true };
  });
  const muestrasConDatos = muestrasBaseConDatos;
  const idsAgrupacionesVistas = new Set();
  const itemsDashboard = [];
  muestrasConDatos.forEach((muestra) => {
    if (!muestra.agrupacionId) {
      itemsDashboard.push({ clave: String(muestra.id), tipo: "muestra", muestras: [muestra] });
      return;
    }
    const idAgrupacion = String(muestra.agrupacionId);
    if (idsAgrupacionesVistas.has(idAgrupacion)) return;
    idsAgrupacionesVistas.add(idAgrupacion);
    const miembros = muestrasConDatos.filter((item) => String(item.agrupacionId) === idAgrupacion);
    itemsDashboard.push({
      clave: `agrupacion:${idAgrupacion}`,
      tipo: "agrupacion",
      nombre: muestra.agrupacionNombre || "Agrupación",
      idAgrupacion,
      contraida: Boolean(agrupacionesContraidas[idAgrupacion]),
      muestras: miembros,
    });
  });
  const muestrasDisponiblesParaAgrupar = muestrasConDatos.filter((muestra) => !muestra.agrupacionId);

  return (
    <>
      <section aria-labelledby="dashboard-title" className="dashboard-content-container space-y-6 pt-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
            <h1 id="dashboard-title" className="font-display text-3xl font-medium text-bg-dark">dashboard</h1>
            <p className="text-sm text-slate-text/80">Tus muestras y vistas guardadas, en un solo lugar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button ref={triggerAgrupacionRef} type="button" onClick={() => { setErrorPersistencia(""); setModalAgrupacionAbierto(true); }} className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${temaOscuro ? "border-gray-500 bg-gray-800 text-gray-200 hover:bg-gray-700" : "border-emerald-primary/40 text-emerald-primary hover:bg-emerald-primary/10"}`}><FolderPlus className="h-4 w-4" aria-hidden="true" />Crear agrupación</button>
            <button ref={triggerRef} type="button" onClick={alCrearMuestra} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">crear muestra</button>
          </div>
        </header>

        {errorPersistencia && !modalAbierto && !muestraDetalle && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errorPersistencia}</p>}
        {cargandoMuestras && <p role="status" className="text-sm text-slate-text">Cargando tus muestras guardadas…</p>}
        <ul
          data-testid="lista-muestras"
          id="lista-muestras"
          aria-busy={reordenandoMuestras}
          onDragOver={(evento) => {
            evento.preventDefault();
            const destino = evento.target instanceof Element ? evento.target.closest("[data-dashboard-item]") : null;
            setIdMuestraDestino(destino?.dataset.dashboardItem || null);
          }}
          onDrop={alSoltarMuestra}
          className="dashboard-card-grid grid gap-4"
        >
          {itemsDashboard.map((item, indice) => {
            const alFinalizarArrastre = () => {
              setIdMuestraArrastrada(null);
              setIdMuestraDestino(null);
            };
            if (item.tipo === "muestra") {
              const muestra = item.muestras[0];
              return <MuestraCard
                key={item.clave}
                muestra={muestra}
                idItemDashboard={item.clave}
                indice={indice}
                cantidad={itemsDashboard.length}
                temaOscuro={temaOscuro}
                alAbrir={alAbrirDetalle}
                alMover={alMoverItemDashboard}
                alIniciarArrastre={alIniciarArrastre}
                alFinalizarArrastre={alFinalizarArrastre}
                arrastrable={itemsDashboard.length > 1}
                arrastrando={item.clave === idMuestraArrastrada}
                soltarSobre={item.clave === idMuestraDestino && item.clave !== idMuestraArrastrada}
                reordenando={reordenandoMuestras}
              />;
            }
            return <li
              key={item.clave}
              data-dashboard-item={item.clave}
              className={`dashboard-group-container col-span-full min-w-0 rounded-2xl border p-3 shadow-sm ${temaOscuro ? "border-border-line/50 bg-bg-dark/70" : "border-slate-300 bg-slate-200/60"} ${item.clave === idMuestraArrastrada ? "opacity-50" : ""} ${item.clave === idMuestraDestino && item.clave !== idMuestraArrastrada ? "ring-2 ring-dashed ring-emerald-primary" : ""}`}
            >
              <header className={`mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${temaOscuro ? "border-border-line/70 bg-bg-dark text-bg-cream" : "border-border-line/50 bg-bg-cream text-bg-dark"}`}>
                <span draggable={itemsDashboard.length > 1 && !reordenandoMuestras} onDragStart={(evento) => alIniciarArrastre(evento, item.clave)} onDragEnd={alFinalizarArrastre} className={`cursor-grab select-none active:cursor-grabbing ${temaOscuro ? "text-bg-cream/70" : "text-slate-text"}`}>⠿ Arrastra la agrupación</span>
                <span className="min-w-0 flex-1 truncate text-center font-semibold">{item.nombre} · {item.muestras.length} muestras</span>
                <div className="flex items-center gap-1" role="group" aria-label={`Cambiar posición de ${item.nombre}`}>
                  <button type="button" disabled={indice === 0 || reordenandoMuestras} onClick={() => alMoverItemDashboard(item.clave, -1)} aria-label="Mover agrupación antes" className="rounded px-2 py-1 text-current hover:bg-emerald-primary/10 disabled:opacity-40">↑</button>
                  <button type="button" disabled={indice >= itemsDashboard.length - 1 || reordenandoMuestras} onClick={() => alMoverItemDashboard(item.clave, 1)} aria-label="Mover agrupación después" className="rounded px-2 py-1 text-current hover:bg-emerald-primary/10 disabled:opacity-40">↓</button>
                  <button type="button" onClick={() => setAgrupacionesContraidas((actuales) => ({ ...actuales, [item.idAgrupacion]: !actuales[item.idAgrupacion] }))} aria-expanded={!item.contraida} aria-label={`${item.contraida ? "Mostrar muestras de" : "Ocultar muestras de"} ${item.nombre}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-primary/40 bg-emerald-primary/10 px-2.5 text-xs font-semibold text-emerald-primary hover:bg-emerald-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
                    {item.contraida ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                    <span>{item.contraida ? "Mostrar muestras" : "Ocultar muestras"}</span>
                  </button>
                  <button type="button" disabled={guardandoMuestra} onClick={() => alEditarAgrupacion(item)} aria-label={`Editar agrupación ${item.nombre}`} className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border-line/70 px-2 text-current hover:bg-emerald-primary/10 disabled:opacity-50"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only sm:not-sr-only">Editar</span></button>
                  <button type="button" disabled={guardandoMuestra} onClick={() => separarAgrupacion(item.idAgrupacion)} className={`ml-1 min-h-8 rounded-lg border px-2 text-xs disabled:opacity-50 ${temaOscuro ? "border-border-line text-bg-cream hover:bg-emerald-primary/20" : "border-border-line/70 text-bg-dark hover:bg-emerald-primary/10"}`}>Separar</button>
                </div>
              </header>
              {!item.contraida && <ul className="dashboard-group-grid grid gap-3">
                {item.muestras.map((miembro, indiceMiembro) => <MuestraCard
                  key={miembro.id}
                  muestra={miembro}
                  indice={indiceMiembro}
                  cantidad={item.muestras.length}
                  temaOscuro={temaOscuro}
                  alAbrir={alAbrirDetalle}
                  alMover={() => {}}
                  alIniciarArrastre={() => {}}
                  alFinalizarArrastre={() => {}}
                  arrastrable={false}
                  reordenable={false}
                  mostrarBarraOrden={false}
                />)}
              </ul>}
            </li>;
          })}
        </ul>
        <p className="sr-only" aria-live="polite">{reordenandoMuestras ? "Guardando el nuevo orden de las muestras." : anuncioReordenamiento}</p>
      </section>

      <CrearMuestraModal
        abierto={modalAbierto}
        borrador={borrador}
        indiceEditando={indiceMuestraEditando}
        guardando={guardandoMuestra}
        error={errorPersistencia}
        cuentasCorreo={cuentasCorreo}
        cargandoCuentasCorreo={cargandoCuentasCorreo}
        errorCuentasCorreo={errorCuentasCorreo}
        triggerRef={triggerRef}
        alCambiar={alCambiarBorrador}
        alGuardar={alGuardarMuestra}
        alCerrar={alCerrarModal}
      />
      <AgruparMuestrasModal
        abierto={modalAgrupacionAbierto}
        muestras={agrupacionEditando
          ? muestrasConDatos.filter((muestra) => !muestra.agrupacionId || String(muestra.agrupacionId) === String(agrupacionEditando.idAgrupacion))
          : muestrasDisponiblesParaAgrupar}
        agrupacion={agrupacionEditando}
        guardando={guardandoMuestra}
        error={errorPersistencia}
        triggerRef={triggerAgrupacionRef}
        alCerrar={() => { setModalAgrupacionAbierto(false); setAgrupacionEditando(null); }}
        alGuardar={alGuardarAgrupacion}
      />
      <DetalleMuestraModal
        muestra={muestraDetalle ? muestrasConDatos.find((item) => String(item.id) === String(muestraDetalle.id)) || muestraDetalle : null}
        temaOscuro={temaOscuro}
        triggerRef={detalleTriggerRef}
        confirmandoEliminacion={confirmarEliminacion}
        eliminando={eliminandoMuestra}
        error={errorPersistencia}
        alCerrar={alCerrarDetalle}
        alCrear={alCrearMuestra}
        alEditar={alEditarMuestra}
        alEliminar={alEliminarMuestra}
        alCancelarEliminacion={() => setConfirmarEliminacion(false)}
        alIrAFuente={alActivarMuestra}
      />
    </>
  );
}
