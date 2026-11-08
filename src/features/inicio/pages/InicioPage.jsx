import { useRef, useState } from "react";
import { useTema } from "../../../context/TemaContext";
import useMuestras from "../hooks/useMuestras";
import MuestraCard from "../components/cards/MuestraCard";
import CrearMuestraModal from "../components/modals/CrearMuestraModal";
import DetalleMuestraModal from "../components/modals/DetalleMuestraModal";
import { BORRADOR_VACIO, normalizarFuente } from "../utils/inicioHelpers";

/** Compone Inicio y coordina los modales con el hook de muestras. */
export default function InicioPage() {
  const { tema } = useTema();
  const temaOscuro = tema === "oscuro";
  const {
    usuario, navigate, muestras, cargandoMuestras, guardandoMuestra, eliminandoMuestra,
    errorPersistencia, setErrorPersistencia, guardarMuestra, eliminarMuestraPersistida,
  } = useMuestras();
  const [borrador, setBorrador] = useState(BORRADOR_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [muestraDetalle, setMuestraDetalle] = useState(null);
  const [indiceMuestraEditando, setIndiceMuestraEditando] = useState(null);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const triggerRef = useRef(null);
  const detalleTriggerRef = useRef(null);

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
    setBorrador((previo) => ({ ...previo, [campo]: valor }));
  };

  const alGuardarMuestra = async () => {
    if (!exigirUsuario()) return;
    if (await guardarMuestra(borrador, indiceMuestraEditando)) alCerrarModal();
  };

  const alEditarMuestra = () => {
    if (!exigirUsuario()) return;
    setErrorPersistencia("");
    const indice = muestras.indexOf(muestraDetalle);
    if (indice < 0) return;
    setIndiceMuestraEditando(indice);
    setBorrador({
      titulo: muestraDetalle.titulo,
      fuente: normalizarFuente(muestraDetalle.fuente),
      tipo: muestraDetalle.tipo,
      segmentoContable: muestraDetalle.segmentoContable || "todos",
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

  const alActivarMuestra = (fuente) => {
    const origen = normalizarFuente(fuente);
    const destino = {
      bolsillos: "/dashboard/grupos",
      contabilidad: "/dashboard/contabilidad",
      ingresos: "/dashboard/contabilidad",
      gastos: "/dashboard/contabilidad",
      tarjetas: "/dashboard/tarjetas",
    }[origen];
    if (destino) navigate(destino);
  };

  return (
    <>
      <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
            <h1 id="dashboard-title" className="font-display text-3xl font-medium text-bg-dark">dashboard</h1>
            <p className="text-sm text-slate-text/80">Tus muestras y vistas guardadas, en un solo lugar.</p>
          </div>
          <button ref={triggerRef} type="button" onClick={alCrearMuestra} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">crear muestra</button>
        </header>

        {errorPersistencia && !modalAbierto && !muestraDetalle && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errorPersistencia}</p>}
        {cargandoMuestras && <p role="status" className="text-sm text-slate-text">Cargando tus muestras guardadas…</p>}
        <ul data-testid="lista-muestras" id="lista-muestras" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {muestras.map((muestra, indice) => <MuestraCard key={muestra.id || indice} muestra={muestra} indice={indice} temaOscuro={temaOscuro} alAbrir={alAbrirDetalle} />)}
        </ul>
      </section>

      <CrearMuestraModal
        abierto={modalAbierto}
        borrador={borrador}
        indiceEditando={indiceMuestraEditando}
        guardando={guardandoMuestra}
        error={errorPersistencia}
        triggerRef={triggerRef}
        alCambiar={alCambiarBorrador}
        alGuardar={alGuardarMuestra}
        alCerrar={alCerrarModal}
      />
      <DetalleMuestraModal
        muestra={muestraDetalle}
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
