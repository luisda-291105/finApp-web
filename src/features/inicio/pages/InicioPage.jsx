import { useEffect, useRef, useState } from "react";
import { useTema } from "../../../context/TemaContext";
import useMuestras from "../hooks/useMuestras";
import MuestraCard from "../components/cards/MuestraCard";
import CrearMuestraModal from "../components/modals/CrearMuestraModal";
import DetalleMuestraModal from "../components/modals/DetalleMuestraModal";
import { BORRADOR_VACIO, normalizarFuente, obtenerFuente } from "../utils/inicioHelpers";
import { listarCuentasGmail } from "../../../services/gmailServicio";

/** Compone Inicio y coordina los modales con el hook de muestras. */
export default function InicioPage() {
  const { tema } = useTema();
  const temaOscuro = tema === "oscuro";
  const {
    usuario, navigate, muestras, datosMuestras, cargandoMuestras, guardandoMuestra, eliminandoMuestra,
    errorPersistencia, setErrorPersistencia, guardarMuestra, eliminarMuestraPersistida,
  } = useMuestras();
  const [borrador, setBorrador] = useState(BORRADOR_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [muestraDetalle, setMuestraDetalle] = useState(null);
  const [indiceMuestraEditando, setIndiceMuestraEditando] = useState(null);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [cuentasCorreo, setCuentasCorreo] = useState([]);
  const [cargandoCuentasCorreo, setCargandoCuentasCorreo] = useState(false);
  const [errorCuentasCorreo, setErrorCuentasCorreo] = useState("");
  const triggerRef = useRef(null);
  const detalleTriggerRef = useRef(null);

  useEffect(() => {
    let vigente = true;
    if (!modalAbierto || normalizarFuente(borrador.fuente) !== "correo" || !usuario?.idUsuario) {
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
  }, [modalAbierto, borrador.fuente, usuario?.idUsuario]);

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
    const indice = muestras.findIndex((muestra) => String(muestra.id) === String(muestraDetalle.id));
    if (indice < 0) return;
    setIndiceMuestraEditando(indice);
    setBorrador({
      titulo: muestraDetalle.titulo,
      fuente: normalizarFuente(muestraDetalle.fuente),
      tipo: muestraDetalle.tipo,
      segmentoContable: muestraDetalle.segmentoContable || "todos",
      cuentaCorreo: muestraDetalle.cuentaCorreo || "todas",
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
    const origen = obtenerFuente(normalizarFuente(fuente));
    if (origen?.destino) navigate(origen.destino);
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
        <ul data-testid="lista-muestras" id="lista-muestras" className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {muestras.map((muestra, indice) => {
            const clave = `${normalizarFuente(muestra.fuente)}:${muestra.segmentoContable || "todos"}:${muestra.cuentaCorreo || "todas"}`;
            const datos = datosMuestras[clave];
            const muestraActualizada = {
              ...muestra,
              ...(datos || {}),
              cargando: datos ? datos.cargando === true : true,
            };
            return <MuestraCard key={muestra.id || indice} muestra={muestraActualizada} indice={indice} temaOscuro={temaOscuro} alAbrir={alAbrirDetalle} />;
          })}
        </ul>
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
