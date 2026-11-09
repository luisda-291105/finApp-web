import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { actualizarMuestra, crearMuestra, eliminarMuestra, listarMuestras } from "../services/muestrasService";
import { obtenerDatosMuestra } from "../services/datosMuestrasService";
import { esBorradorCompleto, esMuestraDuplicada, normalizarFuente, normalizarTitulo } from "../utils/inicioHelpers";

const claveDatos = (muestra) => `${normalizarFuente(muestra.fuente)}:${muestra.segmentoContable || "todos"}:${muestra.cuentaCorreo || "todas"}`;

/** Carga y persistencia de muestras del usuario activo. */
export default function useMuestras() {
  const navigate = useNavigate();
  const { usuario } = useUsuarioActivo();
  const [muestras, setMuestras] = useState([]);
  const [cargandoMuestras, setCargandoMuestras] = useState(true);
  const [guardandoMuestra, setGuardandoMuestra] = useState(false);
  const [eliminandoMuestra, setEliminandoMuestra] = useState(false);
  const [errorPersistencia, setErrorPersistencia] = useState("");
  const [datosMuestras, setDatosMuestras] = useState({});

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

  useEffect(() => {
    let vigente = true;
    const consultas = [...new Map(muestras.map((muestra) => [
      claveDatos(muestra),
      {
        fuente: normalizarFuente(muestra.fuente),
        segmento: muestra.segmentoContable || "todos",
        cuentaCorreo: muestra.cuentaCorreo || "todas",
      },
    ])).entries()];
    if (!usuario?.idUsuario || consultas.length === 0) {
      setDatosMuestras({});
      return () => { vigente = false; };
    }

    setDatosMuestras(Object.fromEntries(consultas.map(([clave]) => [clave, { cargando: true }])));
    consultas.forEach(([clave, { fuente, segmento, cuentaCorreo }]) => {
      obtenerDatosMuestra(fuente, usuario.idUsuario, segmento, cuentaCorreo)
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
    const cuentaCorreo = borrador.cuentaCorreo || "todas";
    const paraComparar = indiceEditando === null ? muestras : muestras.filter((_, indice) => indice !== indiceEditando);
    if (esMuestraDuplicada(paraComparar, titulo, fuente, borrador.tipo, segmentoContable, cuentaCorreo)) return false;

    setErrorPersistencia("");
    setGuardandoMuestra(true);
    try {
      const datos = {
        titulo,
        fuente,
        tipo: borrador.tipo,
        segmentoContable,
        ...(fuente === "correo" ? { cuentaCorreo } : {}),
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
    datosMuestras, cargandoDatosMuestras: Object.values(datosMuestras).some((datos) => datos?.cargando),
    errorPersistencia, setErrorPersistencia, guardarMuestra, eliminarMuestraPersistida,
  };
}
