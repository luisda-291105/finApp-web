import { useCallback, useEffect, useState } from "react";
import { actualizarFuente, eliminarFuente, obtenerFuentesPorUsuario } from "../../../services/fuenteServicio";

function listaDeFuentes(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.content)) return respuesta.content;
  return [];
}

export function useFuentesConfiguracion(idUsuario) {
  const [fuentes, setFuentes] = useState([]);
  const [cargandoFuentes, setCargandoFuentes] = useState(true);
  const [errorFuentes, setErrorFuentes] = useState("");
  const [fuenteEditando, setFuenteEditando] = useState(null);
  const [fuenteEliminando, setFuenteEliminando] = useState(null);
  const [operacionFuente, setOperacionFuente] = useState(false);

  const cargarFuentes = useCallback(async () => {
    if (!idUsuario) {
      setFuentes([]);
      setCargandoFuentes(false);
      return [];
    }
    try {
      setCargandoFuentes(true);
      setErrorFuentes("");
      const lista = listaDeFuentes(await obtenerFuentesPorUsuario(idUsuario));
      setFuentes(lista);
      return lista;
    } catch (error) {
      setErrorFuentes(error?.message || "No se pudieron cargar las fuentes.");
      setFuentes([]);
      return [];
    } finally {
      setCargandoFuentes(false);
    }
  }, [idUsuario]);

  useEffect(() => { cargarFuentes(); }, [cargarFuentes]);

  const confirmarFuenteGuardada = async (nuevaFuente) => {
    try {
      const lista = listaDeFuentes(await obtenerFuentesPorUsuario(idUsuario));
      setFuentes(lista);
      setErrorFuentes(lista.some((fuente) => fuente.idFuente === nuevaFuente.idFuente)
        ? ""
        : "El servidor aceptó el registro, pero no aparece al volver a consultar las fuentes. Revisa la conexión y vuelve a cargar.");
    } catch (fallo) {
      setErrorFuentes(`La fuente se envió, pero no se pudo confirmar su persistencia: ${fallo?.message || "error al consultar el servidor"}`);
    }
  };

  const guardarEdicionFuente = async (cambios = fuenteEditando) => {
    if (!cambios || !idUsuario || operacionFuente) return false;
    setOperacionFuente(true);
    setErrorFuentes("");
    try {
      const payload = { tipo: cambios.tipo.trim().toUpperCase(), contenido: cambios.contenido.trim(), estado: cambios.estado, usuario: { idUsuario } };
      const respuesta = await actualizarFuente(cambios.idFuente, payload, idUsuario);
      const guardada = respuesta?.data || respuesta || { ...cambios, ...payload };
      setFuentes((actuales) => actuales.map((fuente) => fuente.idFuente === cambios.idFuente ? { ...fuente, ...guardada } : fuente));
      setFuenteEditando(null);
      return true;
    } catch (fallo) {
      setErrorFuentes(fallo?.message || "No se pudo actualizar la fuente.");
      return false;
    } finally { setOperacionFuente(false); }
  };

  const confirmarEliminacionFuente = async (fuenteObjetivo = fuenteEliminando) => {
    if (!fuenteObjetivo || !idUsuario || operacionFuente) return false;
    setOperacionFuente(true);
    setErrorFuentes("");
    try {
      await eliminarFuente(fuenteObjetivo.idFuente, idUsuario);
      setFuentes((actuales) => actuales.filter((fuente) => fuente.idFuente !== fuenteObjetivo.idFuente));
      setFuenteEliminando(null);
      return true;
    } catch (fallo) {
      setErrorFuentes(fallo?.message || "No se pudo eliminar la fuente.");
      return false;
    } finally { setOperacionFuente(false); }
  };

  return { fuentes, setFuentes, cargandoFuentes, errorFuentes, setErrorFuentes, fuenteEditando, setFuenteEditando, fuenteEliminando, setFuenteEliminando, operacionFuente, confirmarFuenteGuardada, guardarEdicionFuente, confirmarEliminacionFuente, cargarFuentes };
}
