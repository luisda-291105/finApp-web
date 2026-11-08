/**
 * @uso        Estado y acciones para consultar y mantener contactos
 * @funciones  useContactos()
 * @datos      Carga contactos del usuario y aplica actualizaciones/eliminaciones
 * @eventos    Carga al cambiar usuario y acciones CRUD del detalle
 * @estados    contactos, cargando, error
 * @usadoPor   ContactosPage
 */
import { useCallback, useEffect, useState } from "react";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { actualizarContacto, eliminarContacto, obtenerContactosPorUsuario } from "../services/contactosService";

function extraerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.data || respuesta?.content || [];
}

/** Encapsula la carga y la sincronización de contactos en el feature. */
export function useContactos() {
  const { usuario } = useUsuarioActivo();
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const cargarContactos = useCallback(async () => {
    if (!usuario?.idUsuario) { setContactos([]); setCargando(false); return; }
    try {
      setCargando(true); setError("");
      setContactos(extraerLista(await obtenerContactosPorUsuario(usuario.idUsuario)));
    } catch (fallo) {
      setContactos([]); setError(fallo?.message || "No se pudieron cargar tus contactos.");
    } finally { setCargando(false); }
  }, [usuario?.idUsuario]);
  useEffect(() => { cargarContactos(); }, [cargarContactos]);
  const guardarContacto = useCallback(async (idContacto, cambios) => {
    await actualizarContacto(idContacto, cambios);
    setContactos((actuales) => actuales.map((contacto) => contacto.idContacto === idContacto ? { ...contacto, ...cambios } : contacto));
  }, []);
  const borrarContacto = useCallback(async (idContacto) => {
    await eliminarContacto(idContacto);
    setContactos((actuales) => actuales.filter((contacto) => contacto.idContacto !== idContacto));
  }, []);
  return { usuario, contactos, cargando, error, cargarContactos, guardarContacto, borrarContacto };
}
