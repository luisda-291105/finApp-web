import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUsuarioActivo } from "./UsuarioActivoContext";
import {
  canjearCodigoGmail,
  eliminarCuentaGmail,
  GMAIL_CONFIGURADO,
  iniciarCodigoAutorizacionGmail,
  listarCuentasGmail,
  obtenerConexionCuentaGmail,
  prepararGoogleIdentityServices,
} from "../services/gmailServicio";

const GmailContext = createContext({
  gmailConectado: false,
  cuentaGmail: "",
  cuentasGmail: [],
  cuentaSeleccionadaId: null,
  gisListo: false,
  conexionCargando: false,
  errorGmail: "",
  conectarGmail: async () => {},
  desconectarGmail: async () => {},
  recargarCuentasGmail: async () => [],
  seleccionarCuentaGmail: () => {},
  limpiarErrorGmail: () => {},
});

export function GmailProvider({ children }) {
  const { usuario } = useUsuarioActivo();
  const [gmailConectado, setGmailConectado] = useState(false);
  const [cuentaGmail, setCuentaGmail] = useState("");
  const [cuentasGmail, setCuentasGmail] = useState([]);
  const [cuentaSeleccionadaId, setCuentaSeleccionadaId] = useState(null);
  const [gisListo, setGisListo] = useState(!GMAIL_CONFIGURADO);
  const [conexionCargando, setConexionCargando] = useState(false);
  const [errorGmail, setErrorGmail] = useState("");

  useEffect(() => {
    if (!errorGmail) return undefined;
    const temporizador = window.setTimeout(() => {
      setErrorGmail((actual) => (actual === errorGmail ? "" : actual));
    }, 5000);
    return () => window.clearTimeout(temporizador);
  }, [errorGmail]);

  useEffect(() => {
    let vigente = true;
    if (!GMAIL_CONFIGURADO) return undefined;
    prepararGoogleIdentityServices()
      .catch((error) => {
        if (vigente)
          setErrorGmail(error?.message || "No se pudo cargar Google.");
      })
      .finally(() => {
        if (vigente) setGisListo(true);
      });
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    let vigente = true;
    setGmailConectado(false);
    setCuentaGmail("");
    setCuentasGmail([]);
    setCuentaSeleccionadaId(null);
    setErrorGmail("");
    if (!usuario?.idUsuario) {
      setConexionCargando(false);
      return () => {
        vigente = false;
      };
    }
    setConexionCargando(true);
    listarCuentasGmail()
      .then((cuentas) => {
        if (!vigente) return;
        setCuentasGmail(cuentas);
        setCuentaSeleccionadaId(cuentas[0]?.id ?? null);
      })
      .catch((error) => {
        if (vigente)
          setErrorGmail(
            error?.message || "No se pudieron cargar las cuentas Gmail.",
          );
      })
      .finally(() => {
        if (vigente) setConexionCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [usuario?.idUsuario]);

  useEffect(() => {
    let vigente = true;
    setGmailConectado(false);
    const cuenta = cuentasGmail.find(
      (item) => String(item.id) === String(cuentaSeleccionadaId),
    );
    setCuentaGmail(cuenta?.email || "");
    if (!usuario?.idUsuario || !cuentaSeleccionadaId) {
      setConexionCargando(false);
      return () => {
        vigente = false;
      };
    }
    setConexionCargando(true);
    obtenerConexionCuentaGmail(cuentaSeleccionadaId)
      .then((conexion) => {
        if (!vigente) return;
        setGmailConectado(conexion.connected === true);
        if (conexion.email) setCuentaGmail(conexion.email);
      })
      .catch((error) => {
        if (vigente)
          setErrorGmail(
            error?.message || "No se pudo restaurar esta cuenta Gmail.",
          );
      })
      .finally(() => {
        if (vigente) setConexionCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [usuario?.idUsuario, cuentasGmail, cuentaSeleccionadaId]);

  const conectarGmail = async ({
    incluirContactos = false,
    incluirModificar = false,
    cuentaEsperadaId = cuentaSeleccionadaId,
  } = {}) => {
    setErrorGmail("");
    setConexionCargando(true);
    try {
      // Un permiso adicional (Contactos o modificar correos) se pide sobre una
      // cuenta ya registrada y no debe reiniciar la cuenta Gmail activa.
      const requiereCuentaEspecifica = incluirContactos || incluirModificar;
      const cuentaEsperada = requiereCuentaEspecifica
        ? cuentasGmail.find(
            (cuenta) => String(cuenta.id) === String(cuentaEsperadaId),
          )
        : null;
      if (requiereCuentaEspecifica && !cuentaEsperada)
        throw new Error(
          incluirModificar
            ? "Selecciona una cuenta Gmail registrada en Fuentes antes de autorizar el permiso para modificar sus correos."
            : "Selecciona una cuenta Gmail registrada en Fuentes antes de autorizar Google Contacts.",
        );
      const code = await iniciarCodigoAutorizacionGmail({
        incluirContactos,
        incluirModificar,
        cuentaEsperada: cuentaEsperada?.email || "",
      });
      const conexion = await canjearCodigoGmail(
        code,
        requiereCuentaEspecifica ? cuentaEsperadaId : "",
      );
      if (requiereCuentaEspecifica) {
        // El backend actualiza la conexión de la fuente indicada.
        if (String(cuentaSeleccionadaId) === String(conexion.accountId)) {
          setGmailConectado(true);
          setCuentaGmail(conexion.email);
        }
      } else {
        const cuentas = await listarCuentasGmail();
        setCuentasGmail(cuentas);
        setCuentaSeleccionadaId(conexion.accountId);
        setGmailConectado(true);
        setCuentaGmail(conexion.email);
      }
      if (conexion.pushWarning) setErrorGmail(conexion.pushWarning);
      return conexion;
    } catch (error) {
      const mensaje =
        error?.message || "No se pudo iniciar la conexión con Gmail.";
      setErrorGmail(mensaje);
      throw error;
    } finally {
      setConexionCargando(false);
    }
  };

  /** Vuelve a consultar en el backend las cuentas Gmail vinculadas. */
  const recargarCuentasGmail = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setCuentasGmail([]);
      setCuentaSeleccionadaId(null);
      return [];
    }
    const cuentas = await listarCuentasGmail();
    setCuentasGmail(cuentas);
    setCuentaSeleccionadaId((actual) =>
      cuentas.some((cuenta) => String(cuenta.id) === String(actual))
        ? actual
        : (cuentas[0]?.id ?? null),
    );
    return cuentas;
  }, [usuario?.idUsuario]);

  const desconectarGmail = async (
    persistir = true,
    idCuenta = cuentaSeleccionadaId,
  ) => {
    if (!persistir) {
      setGmailConectado(false);
      return;
    }
    if (!idCuenta) return;
    try {
      await eliminarCuentaGmail(idCuenta);
    } catch (error) {
      // 404: la cuenta ya no existe en el backend (por ejemplo, porque la
      // fuente se eliminó). Se trata como desconexión idempotente y se
      // resincroniza la lista en lugar de dejar una cuenta fantasma.
      if (error?.status !== 404) {
        setErrorGmail(
          error?.message || "No se pudo eliminar la conexión guardada de Gmail.",
        );
        return;
      }
    }
    const restantes = cuentasGmail.filter(
      (cuenta) => String(cuenta.id) !== String(idCuenta),
    );
    setCuentasGmail(restantes);
    if (String(idCuenta) === String(cuentaSeleccionadaId)) {
      setGmailConectado(false);
      setCuentaGmail("");
      setCuentaSeleccionadaId(restantes[0]?.id ?? null);
    }
    setErrorGmail("");
    try {
      await recargarCuentasGmail();
    } catch {
      /* Si falla la resincronización se conserva el estado local ya corregido. */
    }
  };

  const seleccionarCuentaGmail = (id) => {
    setErrorGmail("");
    setCuentaSeleccionadaId(id || null);
  };
  const limpiarErrorGmail = () => setErrorGmail("");

  return (
    <GmailContext.Provider
      value={{
        gmailConectado,
        cuentaGmail,
        cuentasGmail,
        cuentaSeleccionadaId,
        gisListo,
        conexionCargando,
        errorGmail,
        conectarGmail,
        desconectarGmail,
        recargarCuentasGmail,
        seleccionarCuentaGmail,
        limpiarErrorGmail,
      }}
    >
      {children}
    </GmailContext.Provider>
  );
}

export function useGmail() {
  return useContext(GmailContext);
}
