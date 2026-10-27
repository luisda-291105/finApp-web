/**
 * @uso        Contexto para mantener el usuario activo (sin autenticación)
 * @funciones  UsuarioActivoProvider, useUsuarioActivo
 * @datos      usuario (objeto con idUsuario, nombre, fechaCreacion), guardarUsuario, limpiarUsuario
 * @eventos    Ninguno
 * @estados    usuario (desde localStorage o null)
 * @usadoPor   App.jsx y componentes que necesiten relacionar con id_usuario
 */
import { createContext, useContext, useEffect, useState } from "react";

const UsuarioActivoContext = createContext(null);

const CLAVE_ALMACEN = "finapp_usuario_activo";

export function UsuarioActivoProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_ALMACEN);
      if (guardado) {
        const parseado = JSON.parse(guardado);
        if (parseado?.idUsuario) {
          setUsuario(parseado);
        }
      }
    } catch (error) {
      console.error("Error al leer usuario activo desde localStorage:", error);
    }
  }, []);

  const guardarUsuario = (usuarioNuevo) => {
    if (!usuarioNuevo?.idUsuario) {
      console.error("guardarUsuario: usuarioNuevo.idUsuario es obligatorio", usuarioNuevo);
      return;
    }
    setUsuario(usuarioNuevo);
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(usuarioNuevo));
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
  const contexto = useContext(UsuarioActivoContext);
  if (contexto === null) {
    throw new Error("useUsuarioActivo debe usarse dentro de UsuarioActivoProvider");
  }
  return contexto;
}
