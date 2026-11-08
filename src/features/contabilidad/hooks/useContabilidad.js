import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { actualizarBolsillo, crearBolsillo, eliminarBolsillo, listarBolsillos } from "../services/bolsillosService";
import { actualizarMovimiento, crearMovimiento, eliminarMovimiento, listarMovimientos, obtenerResumenesBolsillos } from "../services/movimientosService";
import { obtenerTarjetasPorUsuario } from "../../tarjetas/services/tarjetasService";

const listaDe = (respuesta) => Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];

export default function useContabilidad() {
  const navigate = useNavigate();
  const { usuario } = useUsuarioActivo();
  const [movimientos, setMovimientos] = useState([]);
  const [filtroMovimiento, setFiltroMovimiento] = useState("TODOS");
  const [cargandoMovimientos, setCargandoMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState("");
  const [revisionMovimientos, setRevisionMovimientos] = useState(0);
  const [resumenesBolsillos, setResumenesBolsillos] = useState({});
  const [cargandoResumenes, setCargandoResumenes] = useState(false);
  const [errorResumenes, setErrorResumenes] = useState("");
  const [crearMovimientoAbierto, setCrearMovimientoAbierto] = useState(false);
  const [movimientoEditando, setMovimientoEditando] = useState(null);
  const [movimientoEliminando, setMovimientoEliminando] = useState(null);
  const [eliminandoMovimiento, setEliminandoMovimiento] = useState(false);
  const [errorEliminarMovimiento, setErrorEliminarMovimiento] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [bolsillos, setBolsillos] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [cargandoBolsillos, setCargandoBolsillos] = useState(true);
  const [errorBolsillos, setErrorBolsillos] = useState("");
  const [modalBolsillo, setModalBolsillo] = useState({ abierto: false, modo: "crear", bolsillo: null });
  const disparadorBolsilloRef = useRef(null);
  const disparadorMovimientoRef = useRef(null);

  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario) { setBolsillos([]); setCargandoBolsillos(false); return () => { vigente = false; }; }
    setCargandoBolsillos(true);
    listarBolsillos().then((data) => { if (vigente) { setBolsillos(listaDe(data)); setErrorBolsillos(""); } })
      .catch((fallo) => { if (vigente) { setBolsillos([]); setErrorBolsillos(fallo?.message || "No se pudieron cargar los bolsillos."); } })
      .finally(() => { if (vigente) setCargandoBolsillos(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario]);

  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario) { setTarjetas([]); return () => { vigente = false; }; }
    obtenerTarjetasPorUsuario(usuario.idUsuario).then((data) => { if (vigente) setTarjetas(listaDe(data)); })
      .catch(() => { if (vigente) setTarjetas([]); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario]);

  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario || cargandoBolsillos) {
      setMovimientos([]); setCargandoMovimientos(Boolean(usuario?.idUsuario && cargandoBolsillos));
      return () => { vigente = false; };
    }
    setCargandoMovimientos(true);
    listarMovimientos(null, filtroMovimiento).then((data) => { if (vigente) { setMovimientos(listaDe(data)); setErrorMovimientos(""); } })
      .catch((fallo) => { if (vigente) { setMovimientos([]); setErrorMovimientos(fallo?.message || "No se pudieron cargar los movimientos."); } })
      .finally(() => { if (vigente) setCargandoMovimientos(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario, cargandoBolsillos, filtroMovimiento, revisionMovimientos]);

  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario || bolsillos.length === 0) {
      setResumenesBolsillos({}); setErrorResumenes(""); setCargandoResumenes(false);
      return () => { vigente = false; };
    }
    setCargandoResumenes(true);
    obtenerResumenesBolsillos().then((data) => {
      if (vigente) { setResumenesBolsillos(Object.fromEntries(listaDe(data).map((resumen) => [resumen.idBolsillo, resumen]))); setErrorResumenes(""); }
    }).catch(() => { if (vigente) { setResumenesBolsillos({}); setErrorResumenes("No se pudieron cargar las métricas de este bolsillo."); } })
      .finally(() => { if (vigente) setCargandoResumenes(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario, bolsillos, revisionMovimientos]);

  useEffect(() => {
    if (respuesta?.tipo !== "exito") return undefined;
    const temporizador = window.setTimeout(() => setRespuesta(null), 4000);
    return () => window.clearTimeout(temporizador);
  }, [respuesta]);

  const abrirModalBolsillo = (modo, bolsillo, evento) => {
    if (evento?.currentTarget) disparadorBolsilloRef.current = evento.currentTarget;
    setErrorBolsillos(""); setModalBolsillo({ abierto: true, modo, bolsillo });
  };
  const guardarBolsillo = async (datos) => {
    if (modalBolsillo.modo === "crear") {
      const creado = await crearBolsillo(datos); setBolsillos((actuales) => [creado?.data || creado, ...actuales]);
    } else {
      const actualizado = await actualizarBolsillo(modalBolsillo.bolsillo.idBolsillo, datos);
      const bolsillo = actualizado?.data || actualizado || { ...modalBolsillo.bolsillo, ...datos };
      setBolsillos((actuales) => actuales.map((item) => item.idBolsillo === bolsillo.idBolsillo ? { ...item, ...bolsillo } : item));
    }
  };
  const borrarBolsillo = async (idBolsillo) => {
    await eliminarBolsillo(idBolsillo); setBolsillos((actuales) => actuales.filter((item) => item.idBolsillo !== idBolsillo));
  };
  const guardarMovimiento = async (movimiento) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; }
    if (movimientoEditando) await actualizarMovimiento(movimientoEditando.idMovimiento, movimiento);
    else await crearMovimiento(movimiento);
    setRespuesta({ tipo: "exito", mensaje: movimientoEditando ? "Movimiento actualizado correctamente." : "Movimiento guardado correctamente en el bolsillo." });
    setRevisionMovimientos((revision) => revision + 1);
  };
  const editarMovimiento = (movimiento, evento) => {
    disparadorMovimientoRef.current = evento.currentTarget; setMovimientoEditando(movimiento); setCrearMovimientoAbierto(true);
  };
  const confirmarEliminarMovimiento = async () => {
    if (!movimientoEliminando) return;
    setEliminandoMovimiento(true); setErrorEliminarMovimiento("");
    try {
      await eliminarMovimiento(movimientoEliminando.idMovimiento);
      setRespuesta({ tipo: "exito", mensaje: "Movimiento eliminado." }); setMovimientoEliminando(null);
      setRevisionMovimientos((revision) => revision + 1);
    } catch (fallo) { setErrorEliminarMovimiento(fallo?.message || "No se pudo eliminar el movimiento."); }
    finally { setEliminandoMovimiento(false); }
  };

  return {
    navigate, usuario, movimientos, filtroMovimiento, setFiltroMovimiento, cargandoMovimientos, errorMovimientos,
    resumenesBolsillos, cargandoResumenes, errorResumenes, crearMovimientoAbierto, setCrearMovimientoAbierto,
    movimientoEditando, setMovimientoEditando, movimientoEliminando, setMovimientoEliminando,
    eliminandoMovimiento, errorEliminarMovimiento, setErrorEliminarMovimiento, respuesta, setRespuesta, bolsillos, tarjetas,
    cargandoBolsillos, errorBolsillos, modalBolsillo, setModalBolsillo,
    disparadorBolsilloRef, disparadorMovimientoRef, abrirModalBolsillo, guardarBolsillo,
    borrarBolsillo, guardarMovimiento, editarMovimiento, confirmarEliminarMovimiento,
  };
}
