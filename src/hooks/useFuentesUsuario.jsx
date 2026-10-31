/**
 * @uso        Hook para obtener las fuentes registradas de un usuario activo y extraer
 *             el correo y el teléfono por tipo de fuente.
 * @funciones  useFuentesUsuario(idUsuario) → { correo, telefono, fuentes, cargando, error }
 * @datos      Llama a obtenerFuentesPorUsuario(idUsuario); una fuente tiene { tipo, contenido,
 *             estado, fechaCreacion }. El tipo se almacena en mayúsculas: "CORREO", "TELEFONO".
 * @estados    fuentes (array), cargando (boolean), error (string), correo (string|null),
 *             telefono (string|null)
 * @usadoPor   SidebarNavContenido, DashboardUserModal, ModalPerfilUsuario (spec 036)
 */
import { useState, useEffect } from "react";
import { obtenerFuentesPorUsuario } from "../services/fuenteServicio";

export function useFuentesUsuario(idUsuario) {
  const [fuentes, setFuentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      if (!idUsuario) {
        setFuentes([]);
        setCargando(false);
        return;
      }
      try {
        setCargando(true);
        setError("");
        const respuesta = await obtenerFuentesPorUsuario(idUsuario);
        let lista = [];
        if (Array.isArray(respuesta)) {
          lista = respuesta;
        } else if (respuesta && Array.isArray(respuesta.data)) {
          lista = respuesta.data;
        } else if (respuesta && Array.isArray(respuesta.content)) {
          lista = respuesta.content;
        }
        if (!cancelado) setFuentes(lista);
      } catch (err) {
        if (!cancelado) {
          setError(err?.message || "No se pudieron cargar las fuentes.");
          setFuentes([]);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [idUsuario]);

  const correo = fuentes.find(
    (f) => String(f.tipo).toUpperCase() === "CORREO"
  )?.contenido || null;

  const telefono = fuentes.find(
    (f) => String(f.tipo).toUpperCase() === "TELEFONO"
  )?.contenido || null;

  return { correo, telefono, fuentes, cargando, error };
}
