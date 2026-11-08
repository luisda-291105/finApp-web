import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { actualizarMuestra, crearMuestra, eliminarMuestra, listarMuestras } from "../services/muestrasService";
import { esBorradorCompleto, esMuestraDuplicada, normalizarFuente, normalizarTitulo } from "../utils/inicioHelpers";

/** Carga y persistencia de muestras del usuario activo. */
export default function useMuestras() {
  const navigate = useNavigate();
  const { usuario } = useUsuarioActivo();
  const [muestras, setMuestras] = useState([]);
  const [cargandoMuestras, setCargandoMuestras] = useState(true);
  const [guardandoMuestra, setGuardandoMuestra] = useState(false);
  const [eliminandoMuestra, setEliminandoMuestra] = useState(false);
  const [errorPersistencia, setErrorPersistencia] = useState("");

  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario) {
      navigate("/", { replace: true });
      return () => { vigente = false; };
    }
    setCargandoMuestras(true);
    setErrorPersistencia("");
    listarMuestras()
      .then((guardadas) => { if (vigente) setMuestras(guardadas); })
      .catch((error) => { if (vigente) setErrorPersistencia(error?.message || "No se pudieron cargar las muestras."); })
      .finally(() => { if (vigente) setCargandoMuestras(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario, navigate]);

  const guardarMuestra = async (borrador, indiceEditando) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return false; }
    if (guardandoMuestra || !esBorradorCompleto(borrador)) return false;
    const titulo = normalizarTitulo(borrador.titulo);
    const fuente = normalizarFuente(borrador.fuente);
    const segmentoContable = borrador.segmentoContable || "todos";
    const paraComparar = indiceEditando === null ? muestras : muestras.filter((_, indice) => indice !== indiceEditando);
    if (esMuestraDuplicada(paraComparar, titulo, fuente, borrador.tipo, segmentoContable)) return false;

    setErrorPersistencia("");
    setGuardandoMuestra(true);
    try {
      const datos = { titulo, fuente, tipo: borrador.tipo, segmentoContable };
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

  return {
    usuario, navigate, muestras, cargandoMuestras, guardandoMuestra, eliminandoMuestra,
    errorPersistencia, setErrorPersistencia, guardarMuestra, eliminarMuestraPersistida,
  };
}
