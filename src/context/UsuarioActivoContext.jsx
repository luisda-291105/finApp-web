/**
 * @uso        Contexto para mantener el usuario activo (sin autenticación)
 * @funciones  UsuarioActivoProvider, useUsuarioActivo
 * @datos      usuario (objeto con idUsuario, nombre, fechaCreacion), guardarUsuario, limpiarUsuario;
 *             valor por defecto seguro (usuario null y funciones no-op) fuera del provider
 * @eventos    Ninguno
 * @estados    usuario (desde localStorage o null)
 * @usadoPor   App.jsx y componentes que necesiten relacionar con id_usuario
 */
import { createContext, useContext, useEffect, useState } from "react";
import { obtenerUsuarioActivo } from "../services/usuarioServicio";

/** Valor seguro cuando un componente se monta sin `UsuarioActivoProvider` (pruebas/aislados). */
const contextoPorDefecto = {
  usuario: null,
  guardarUsuario: () => {},
  limpiarUsuario: () => {},
};

const UsuarioActivoContext = createContext(contextoPorDefecto);

const CLAVE_ALMACEN = "finapp_usuario_activo";

export function UsuarioActivoProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    let activo = true;
    obtenerUsuarioActivo().then((respuesta) => {
      const datos = respuesta?.datos || respuesta;
      if (activo && datos?.idUsuario) { setUsuario(datos); localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(datos)); }
    }).catch(() => { if (activo) { setUsuario(null); localStorage.removeItem(CLAVE_ALMACEN); } });
    return () => { activo = false; };
  }, []);

  const guardarUsuario = (usuarioNuevo) => {
    const id = usuarioNuevo?.idUsuario || usuarioNuevo?.id || usuarioNuevo?.id_usuario;
    if (!id) {
      console.error("guardarUsuario: idUsuario es obligatorio", usuarioNuevo);
      return;
    }
    const normalizado = {
      ...usuarioNuevo,
      idUsuario: id,
    };
    setUsuario(normalizado);
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(normalizado));
    } catch (error) {
      console.error("Error al guardar usuario activo en localStorage:", error);
    }
  };

  const limpiarUsuario = () => {
    setUsuario(null);
    try {
      localStorage.removeItem(CLAVE_ALMACEN);
    } catch (error) {
      console.error("Error al limpiar usuario activo de localStorage:", error);
    }
  };

  return (
    <UsuarioActivoContext.Provider value={{ usuario, guardarUsuario, limpiarUsuario }}>
      {children}
    </UsuarioActivoContext.Provider>
  );
}

export function useUsuarioActivo() {
  return useContext(UsuarioActivoContext);
}
