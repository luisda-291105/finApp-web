/**
 * @uso        Contexto para mantener el usuario activo (sin autenticación)
 * @funciones  UsuarioActivoProvider, useUsuarioActivo
 * @datos      usuario (objeto con idUsuario, nombre, fechaCreacion), guardarUsuario, limpiarUsuario;
 *             valor por defecto seguro (usuario null y funciones no-op) fuera del provider
 * @eventos    Ninguno
 * @estados    usuario (desde localStorage o null)
 * @usadoPor   App.jsx y componentes que necesiten relacionar con id_usuario
 */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { cerrarSesionServidor, obtenerUsuarioActivo } from "../services/usuarioServicio";

/** Valor seguro cuando un componente se monta sin `UsuarioActivoProvider` (pruebas/aislados). */
const contextoPorDefecto = {
  usuario: null,
  estadoSesion: "sin-sesion",
  guardarUsuario: () => {},
  limpiarUsuario: () => {},
  cerrarSesion: async () => {},
};

const UsuarioActivoContext = createContext(contextoPorDefecto);

const CLAVE_ALMACEN = "finapp_usuario_activo";

export function UsuarioActivoProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [estadoSesion, setEstadoSesion] = useState("verificando");
  const revisionSesion = useRef(0);

  useEffect(() => {
    let activo = true;
    const revisionInicial = revisionSesion.current;
    obtenerUsuarioActivo().then((respuesta) => {
      const datos = respuesta?.datos || respuesta;
      if (!activo || revisionSesion.current !== revisionInicial) return;
      if (datos?.idUsuario) {
        setUsuario(datos);
        setEstadoSesion("autenticado");
        localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(datos));
      } else {
        setUsuario(null);
        setEstadoSesion("sin-sesion");
      }
    }).catch(() => {
      if (!activo || revisionSesion.current !== revisionInicial) return;
      setUsuario(null);
      setEstadoSesion("sin-sesion");
      localStorage.removeItem(CLAVE_ALMACEN);
    });
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
    revisionSesion.current += 1;
    setUsuario(normalizado);
    setEstadoSesion("autenticado");
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(normalizado));
    } catch (error) {
      console.error("Error al guardar usuario activo en localStorage:", error);
    }
  };

  const limpiarUsuario = () => {
    revisionSesion.current += 1;
    setUsuario(null);
    setEstadoSesion("sin-sesion");
    try {
      localStorage.removeItem(CLAVE_ALMACEN);
    } catch (error) {
      console.error("Error al limpiar usuario activo de localStorage:", error);
    }
  };

  const cerrarSesion = async () => {
    try { await cerrarSesionServidor(); }
    catch (error) { console.warn("No se pudo confirmar el cierre de sesión en el servidor:", error); }
    limpiarUsuario();
  };

  useEffect(() => {
    const exigirSesion = () => limpiarUsuario();
    window.addEventListener("finapp:sesion-requerida", exigirSesion);
    return () => window.removeEventListener("finapp:sesion-requerida", exigirSesion);
  }, []);

  return (
    <UsuarioActivoContext.Provider value={{ usuario, estadoSesion, guardarUsuario, limpiarUsuario, cerrarSesion }}>
      {children}
    </UsuarioActivoContext.Provider>
  );
}

export function useUsuarioActivo() {
  return useContext(UsuarioActivoContext);
}
