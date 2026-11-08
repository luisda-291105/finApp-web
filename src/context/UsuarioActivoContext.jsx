/**
 * @uso        Contexto de usuario activo respaldado por la sesión del servidor
 * @funciones  UsuarioActivoProvider, useUsuarioActivo
 * @datos      usuario, estadoSesion, guardarUsuario, limpiarUsuario y cerrarSesion
 * @eventos    Comprueba sesión al iniciar; recargar dashboard la conserva y salir del dashboard la cierra
 * @estados    usuario (desde sesión del servidor), estadoSesion
 * @usadoPor   App.jsx y componentes que necesiten relacionar con id_usuario
 */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { cerrarSesionServidor, obtenerUsuarioActivo } from "../features/auth/services";

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
  // El proveedor también se monta en vistas/pruebas aisladas fuera de un Router.
  // Conserva una ruta neutral en ese caso; dentro de la app usa la ruta real.
  let location = { pathname: "/" };
  try { location = useLocation(); } catch { /* No hay router en este montaje. */ }
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
      try { sessionStorage.removeItem(CLAVE_SESION_PESTANA); } catch { /* Almacenamiento opcional. */ }
      try { localStorage.removeItem(CLAVE_ALMACEN); } catch { /* Almacenamiento opcional. */ }
    });
    return () => { activo = false; };
  }, []);

  const rutaAnterior = useRef(location.pathname);
  useEffect(() => {
    const veniaDelDashboard = rutaAnterior.current.startsWith("/dashboard");
    rutaAnterior.current = location.pathname;
    if (veniaDelDashboard && !location.pathname.startsWith("/dashboard")) {
      void cerrarSesionServidor().catch(() => {});
      revisionSesion.current += 1;
      setUsuario(null);
      setEstadoSesion("sin-sesion");
      try { sessionStorage.removeItem(CLAVE_SESION_PESTANA); } catch { /* Almacenamiento opcional. */ }
      try { localStorage.removeItem(CLAVE_ALMACEN); } catch { /* Almacenamiento opcional. */ }
    }
  }, [location.pathname]);

  const guardarUsuario = (usuarioNuevo) => {
    const id = usuarioNuevo?.idUsuario || usuarioNuevo?.id || usuarioNuevo?.id_usuario;
    if (!id) {
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
    } catch { /* El almacenamiento puede estar bloqueado por el navegador. */ }
  };

  const limpiarUsuario = () => {
    revisionSesion.current += 1;
    setUsuario(null);
    setEstadoSesion("sin-sesion");
    try {
      sessionStorage.removeItem(CLAVE_SESION_PESTANA);
    } catch { /* El almacenamiento de sesión es opcional. */ }
    try { localStorage.removeItem(CLAVE_ALMACEN); }
    catch { /* El almacenamiento local es opcional. */ }
  };

  const cerrarSesion = async () => {
    try { await cerrarSesionServidor(); }
    catch { /* Se limpia la sesión local incluso si el servidor no responde. */ }
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
