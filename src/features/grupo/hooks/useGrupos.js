/**
 * @uso        Estado y acciones del listado de grupos del usuario
 * @funciones  useGrupos()
 * @datos      Consulta grupos y sincroniza cambios locales tras guardar/editar/eliminar
 * @eventos    Carga al cambiar usuario y refresco tras operaciones
 * @estados    grupos, cargando, error
 * @usadoPor   GruposPage
 */
import { useCallback, useEffect, useState } from "react";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { obtenerGruposPorUsuario } from "../services/gruposService";

function normalizarGrupo(grupo, index) {
  return {
    id: grupo.idGrupo || grupo.id || `grupo-${index}`,
    nombre: grupo.nombre || "Grupo sin nombre",
    descripcion: grupo.descripcion || grupo.detalle || "Sin descripción",
    fuentes: Array.isArray(grupo.fuentes) ? grupo.fuentes : [],
  };
}

/** Devuelve la colección de grupos y las acciones para mantenerla sincronizada. */
export function useGrupos() {
  const { usuario } = useUsuarioActivo();
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarGrupos = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setGrupos([]);
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      setError("");
      const respuesta = await obtenerGruposPorUsuario(usuario.idUsuario);
      const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      setGrupos(lista.map(normalizarGrupo));
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron cargar tus grupos.");
      setGrupos([]);
    } finally {
      setCargando(false);
    }
  }, [usuario?.idUsuario]);

  useEffect(() => { cargarGrupos(); }, [cargarGrupos]);

  const actualizarGrupoEnLista = useCallback((actualizado) => {
    const id = actualizado.idGrupo || actualizado.id;
    if (actualizado.eliminado) {
      setGrupos((actuales) => actuales.filter((grupo) => grupo.id !== id));
      return;
    }
    setGrupos((actuales) => actuales.map((grupo, index) => grupo.id === id
      ? normalizarGrupo({ ...grupo, ...actualizado, fuentes: actualizado.fuentes ?? grupo.fuentes }, index)
      : grupo));
  }, []);

  return { usuario, grupos, cargando, error, cargarGrupos, actualizarGrupoEnLista };
}
