import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { actualizarMuestra, actualizarOrdenMuestras, crearMuestra, eliminarMuestra, listarMuestras } from "../services/muestrasService";
import { obtenerDatosMuestra } from "../services/datosMuestrasService";
import { esBorradorCompleto, esMuestraDuplicada, normalizarFuente, normalizarTitulo } from "../utils/inicioHelpers";

const fuenteDeMuestra = (muestra) => normalizarFuente(muestra.fuente);
const cuentasCorreoDeMuestra = (muestra) => [...new Set(
  (Array.isArray(muestra.cuentasCorreo) ? muestra.cuentasCorreo : [muestra.cuentaCorreo || "todas"]).map(String)
)].sort();
const claveDatos = (muestra) => `${fuenteDeMuestra(muestra)}:${muestra.segmentoContable || "todos"}:${cuentasCorreoDeMuestra(muestra).join(",")}`;

/** Carga y persistencia de muestras del usuario activo. */
export default function useMuestras() {
  const navigate = useNavigate();
  const { usuario } = useUsuarioActivo();
  const [muestras, setMuestras] = useState([]);
  const [cargandoMuestras, setCargandoMuestras] = useState(true);
  const [guardandoMuestra, setGuardandoMuestra] = useState(false);
  const [reordenandoMuestras, setReordenandoMuestras] = useState(false);
  const [eliminandoMuestra, setEliminandoMuestra] = useState(false);
  const [errorPersistencia, setErrorPersistencia] = useState("");
  const [datosMuestras, setDatosMuestras] = useState({});
  const [ordenEnCurso, setOrdenEnCurso] = useState(false);

  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario) {
      navigate("/", { replace: true });
      return () => { vigente = false; };
    }
    setCargandoMuestras(true);
    setErrorPersistencia("");
    listarMuestras()
      .then((guardadas) => {
        if (!vigente) return;
        setMuestras(guardadas
          .map((muestra, indice) => ({ muestra, indice }))
          .sort((a, b) => (a.muestra.ordenDashboard ?? a.indice) - (b.muestra.ordenDashboard ?? b.indice) || a.indice - b.indice)
          .map(({ muestra }) => muestra));
      })
      .catch((error) => { if (vigente) setErrorPersistencia(error?.message || "No se pudieron cargar las muestras."); })
      .finally(() => { if (vigente) setCargandoMuestras(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario, navigate]);

  useEffect(() => {
    let vigente = true;
    const consultas = [...new Map(muestras.map((muestra) => [
      claveDatos(muestra),
      {
        fuente: fuenteDeMuestra(muestra),
        segmento: muestra.segmentoContable || "todos",
        cuentaCorreo: muestra.cuentaCorreo || "todas",
        cuentasCorreo: cuentasCorreoDeMuestra(muestra),
      },
    ])).entries()];
    if (!usuario?.idUsuario || consultas.length === 0) {
      setDatosMuestras({});
      return () => { vigente = false; };
    }

    setDatosMuestras(Object.fromEntries(consultas.map(([clave]) => [clave, { cargando: true }])));
    consultas.forEach(([clave, { fuente, segmento, cuentaCorreo, cuentasCorreo }]) => {
      const consulta = fuente === "correo"
        ? obtenerDatosMuestra(fuente, usuario.idUsuario, segmento, cuentaCorreo, cuentasCorreo)
        : obtenerDatosMuestra(fuente, usuario.idUsuario, segmento, cuentaCorreo);
      consulta
        .then((datos) => { if (vigente) setDatosMuestras((actuales) => ({ ...actuales, [clave]: datos })); })
        .catch((error) => {
          if (vigente) setDatosMuestras((actuales) => ({
            ...actuales,
            [clave]: { valor: null, error: error?.message || `No se pudieron cargar los datos de ${fuente}.` },
          }));
        });
    });
    return () => { vigente = false; };
  }, [muestras, usuario?.idUsuario]);

  const guardarMuestra = async (borrador, indiceEditando) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return false; }
    if (guardandoMuestra || !esBorradorCompleto(borrador)) return false;
    const titulo = normalizarTitulo(borrador.titulo);
    const fuente = normalizarFuente(borrador.fuente);
    const segmentoContable = borrador.segmentoContable || "todos";
    const cuentasCorreo = [...new Set((Array.isArray(borrador.cuentasCorreo)
      ? borrador.cuentasCorreo
      : [borrador.cuentaCorreo || "todas"]).map(String))];
    const cuentaCorreo = cuentasCorreo.length === 1 ? cuentasCorreo[0] : "todas";
    const paraComparar = indiceEditando === null ? muestras : muestras.filter((_, indice) => indice !== indiceEditando);
    if (esMuestraDuplicada(paraComparar, titulo, fuente, borrador.tipo, segmentoContable, cuentaCorreo, cuentasCorreo)) return false;

    setErrorPersistencia("");
    setGuardandoMuestra(true);
    try {
      const datos = {
        titulo,
        fuente,
        tipo: borrador.tipo,
        segmentoContable,
        ...(fuente === "correo" ? { cuentaCorreo } : {}),
        ...(fuente === "correo" ? { cuentasCorreo } : {}),
        ordenDashboard: indiceEditando === null
          ? muestras.length
          : (muestras[indiceEditando]?.ordenDashboard ?? indiceEditando),
        agrupacionId: muestras[indiceEditando]?.agrupacionId,
        agrupacionNombre: muestras[indiceEditando]?.agrupacionNombre,
      };
      const guardada = indiceEditando === null
        ? await crearMuestra(datos)
        : await actualizarMuestra(muestras[indiceEditando]?.id, datos);
      setMuestras((actuales) => indiceEditando === null
        ? [...actuales, guardada]
        : actuales.map((muestra, indice) => indice === indiceEditando ? guardada : muestra));
      return true;
    } catch (error) {
      setErrorPersistencia(error?.message || "No se pudo guardar la muestra. Intenta de nuevo.");
      return false;
    } finally { setGuardandoMuestra(false); }
  };

  const reordenarMuestras = async (nuevasMuestras) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return false; }
    if (ordenEnCurso || nuevasMuestras.length !== muestras.length) return false;
    const ids = nuevasMuestras.map((muestra) => Number(muestra.id));
    if (ids.some((id) => !Number.isSafeInteger(id)) || new Set(ids).size !== muestras.length) return false;

    const originales = muestras;
    const ordenadas = nuevasMuestras.map((muestra, ordenDashboard) => ({ ...muestra, ordenDashboard }));
    setErrorPersistencia("");
    setMuestras(ordenadas);
    setOrdenEnCurso(true);
    setReordenandoMuestras(true);
    try {
      await actualizarOrdenMuestras(ids);
      return true;
    } catch (error) {
      setMuestras(originales);
      setErrorPersistencia(error?.message || "No se pudo guardar el orden de las muestras. Intenta de nuevo.");
      return false;
    } finally {
      setOrdenEnCurso(false);
      setReordenandoMuestras(false);
    }
  };

  const eliminarMuestraPersistida = async (muestra) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return false; }
    setErrorPersistencia(""); setEliminandoMuestra(true);
    try {
      await eliminarMuestra(muestra.id);
      setMuestras((actuales) => actuales.filter((item) => item.id !== muestra.id));
      return true;
    } catch (error) {
      setErrorPersistencia(error?.message || "No se pudo eliminar la muestra. Intenta de nuevo.");
      return false;
    } finally { setEliminandoMuestra(false); }
  };

  const actualizarMembresiaAgrupacion = async (idAgrupacion, nombreAgrupacion, idsMuestra, agrupar = true) => {
    if (!usuario?.idUsuario || guardandoMuestra) return false;
    const seleccionadas = muestras.filter((muestra) => idsMuestra.includes(String(muestra.id)));
    if (!idAgrupacion || seleccionadas.length !== idsMuestra.length) return false;
    setErrorPersistencia("");
    setGuardandoMuestra(true);
    const original = seleccionadas;
    const actualizadas = [];
    try {
      for (const muestra of seleccionadas) {
        const cambios = agrupar
          ? { agrupacionId: idAgrupacion, agrupacionNombre: nombreAgrupacion }
          : { agrupacionId: undefined, agrupacionNombre: undefined };
        actualizadas.push(await actualizarMuestra(muestra.id, { ...muestra, ...cambios }));
      }
      setMuestras((actuales) => actuales.map((muestra) => {
        const actualizada = actualizadas.find((item) => String(item.id) === String(muestra.id));
        return actualizada ? { ...muestra, ...actualizada, ...(
          agrupar ? { agrupacionId: idAgrupacion, agrupacionNombre: nombreAgrupacion } : { agrupacionId: undefined, agrupacionNombre: undefined }
        ) } : muestra;
      }));
      return true;
    } catch (error) {
      // Revierte los cambios parciales para no dejar una agrupación incompleta guardada.
      await Promise.allSettled(actualizadas.map((muestra) => {
        const anterior = original.find((item) => String(item.id) === String(muestra.id));
        return actualizarMuestra(muestra.id, anterior);
      }));
      try { setMuestras(await listarMuestras()); } catch { /* Mantiene el estado local si la recarga falla. */ }
      setErrorPersistencia(error?.message || "No se pudo actualizar la agrupación.");
      return false;
    } finally { setGuardandoMuestra(false); }
  };

  const crearAgrupacion = async (nombre, ids) => {
    const nombreLimpio = String(nombre || "").trim();
    if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
      setErrorPersistencia("El nombre debe tener entre 2 y 100 caracteres.");
      return false;
    }
    const idsUnicos = [...new Set(ids.map(String))];
    if (idsUnicos.length < 2 || idsUnicos.length > 4) {
      setErrorPersistencia("Selecciona entre 2 y 4 muestras para crear la agrupación.");
      return false;
    }
    if (idsUnicos.some((id) => muestras.find((muestra) => String(muestra.id) === id)?.agrupacionId)) {
      setErrorPersistencia("Separa las muestras que ya pertenecen a una agrupación antes de crear otra.");
      return false;
    }
    const idAgrupacion = globalThis.crypto?.randomUUID?.() || `agrupacion-${Date.now()}`;
    return actualizarMembresiaAgrupacion(idAgrupacion, nombreLimpio, idsUnicos);
  };

  const separarAgrupacion = async (idAgrupacion) => {
    const ids = muestras.filter((muestra) => muestra.agrupacionId === idAgrupacion).map((muestra) => String(muestra.id));
    return actualizarMembresiaAgrupacion(idAgrupacion, "", ids, false);
  };

  return {
    usuario, navigate, muestras, cargandoMuestras, guardandoMuestra, eliminandoMuestra, reordenandoMuestras,
    datosMuestras, cargandoDatosMuestras: Object.values(datosMuestras).some((datos) => datos?.cargando),
    errorPersistencia, setErrorPersistencia, guardarMuestra, reordenarMuestras, eliminarMuestraPersistida, crearAgrupacion, separarAgrupacion,
  };
}
