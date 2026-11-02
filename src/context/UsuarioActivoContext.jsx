/**
 * @uso        Contexto de usuario activo respaldado por la sesión del servidor
 * @funciones  UsuarioActivoProvider, useUsuarioActivo
 * @datos      usuario, estadoSesion, guardarUsuario, limpiarUsuario y cerrarSesion
 * @eventos    Comprueba la sesión al iniciar; invalida y limpia al cerrar o recargar la pestaña
 * @estados    usuario (desde sesión del servidor), estadoSesion
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
const CLAVE_SESION_PESTANA = "finapp_sesion_pestana";

export function UsuarioActivoProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [estadoSesion, setEstadoSesion] = useState("verificando");
  const revisionSesion = useRef(0);

  useEffect(() => {
    let activo = true;
    const revisionInicial = revisionSesion.current;
    let sesionDeEstaPestana = false;
    try { sesionDeEstaPestana = sessionStorage.getItem(CLAVE_SESION_PESTANA) === "activa"; }
    catch { sesionDeEstaPestana = false; }
    if (!sesionDeEstaPestana) {
      setUsuario(null);
      setEstadoSesion("sin-sesion");
      try { localStorage.removeItem(CLAVE_ALMACEN); } catch { /* Almacenamiento opcional. */ }
      return () => { activo = false; };
    }
    obtenerUsuarioActivo().then((respuesta) => {
      const datos = respuesta?.datos || respuesta;
      if (!activo || revisionSesion.current !== revisionInicial) return;
      if (datos?.idUsuario) {
        setUsuario(datos);
        setEstadoSesion("autenticado");
        try { localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(datos)); } catch { /* La sesión no depende de localStorage. */ }
      } else {
        setUsuario(null);
        setEstadoSesion("sin-sesion");
      }
    }).catch(() => {
      if (!activo || revisionSesion.current !== revisionInicial) return;
      setUsuario(null);
      setEstadoSesion("sin-sesion");
      try { localStorage.removeItem(CLAVE_ALMACEN); } catch { /* Almacenamiento opcional. */ }
    });
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    const terminarSesionAlSalir = (evento) => {
      let habiaSesion = false;
      try {
        habiaSesion = sessionStorage.getItem(CLAVE_SESION_PESTANA) === "activa";
        sessionStorage.removeItem(CLAVE_SESION_PESTANA);
      } catch { /* El servidor igualmente recibe logout cuando el almacenamiento está disponible. */ }
      try { localStorage.removeItem(CLAVE_ALMACEN); } catch { /* Almacenamiento opcional. */ }
      if (habiaSesion) void cerrarSesionServidor({ keepalive: true }).catch(() => {});
      if (evento.persisted) window.dispatchEvent(new Event("finapp:sesion-requerida"));
    };
    window.addEventListener("pagehide", terminarSesionAlSalir);
    return () => window.removeEventListener("pagehide", terminarSesionAlSalir);
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
      sessionStorage.setItem(CLAVE_SESION_PESTANA, "activa");
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
      sessionStorage.removeItem(CLAVE_SESION_PESTANA);
    } catch (error) {
      console.error("Error al limpiar el indicador de sesión de la pestaña:", error);
    }
    try { localStorage.removeItem(CLAVE_ALMACEN); }
    catch (error) { console.error("Error al limpiar usuario activo de localStorage:", error); }
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
