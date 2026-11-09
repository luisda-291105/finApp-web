import { createContext, useContext, useEffect, useState } from "react";
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
  gmailConectado: false, cuentaGmail: "", cuentasGmail: [], cuentaSeleccionadaId: null,
  gisListo: false, conexionCargando: false, errorGmail: "",
  conectarGmail: async () => {}, desconectarGmail: async () => {},
  seleccionarCuentaGmail: () => {}, limpiarErrorGmail: () => {},
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
      setErrorGmail((actual) => actual === errorGmail ? "" : actual);
    }, 5000);
    return () => window.clearTimeout(temporizador);
  }, [errorGmail]);

  useEffect(() => {
    let vigente = true;
    if (!GMAIL_CONFIGURADO) return undefined;
    prepararGoogleIdentityServices()
      .catch((error) => { if (vigente) setErrorGmail(error?.message || "No se pudo cargar Google."); })
      .finally(() => { if (vigente) setGisListo(true); });
    return () => { vigente = false; };
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
      return () => { vigente = false; };
    }
    setConexionCargando(true);
    listarCuentasGmail()
      .then((cuentas) => {
        if (!vigente) return;
        setCuentasGmail(cuentas);
        setCuentaSeleccionadaId(cuentas[0]?.id ?? null);
      })
      .catch((error) => { if (vigente) setErrorGmail(error?.message || "No se pudieron cargar las cuentas Gmail."); })
      .finally(() => { if (vigente) setConexionCargando(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario]);

  useEffect(() => {
    let vigente = true;
    setGmailConectado(false);
    const cuenta = cuentasGmail.find((item) => String(item.id) === String(cuentaSeleccionadaId));
    setCuentaGmail(cuenta?.email || "");
    if (!usuario?.idUsuario || !cuentaSeleccionadaId) {
      setConexionCargando(false);
      return () => { vigente = false; };
    }
    setConexionCargando(true);
    obtenerConexionCuentaGmail(cuentaSeleccionadaId)
      .then((conexion) => {
        if (!vigente) return;
        setGmailConectado(conexion.connected === true);
        if (conexion.email) setCuentaGmail(conexion.email);
      })
      .catch((error) => { if (vigente) setErrorGmail(error?.message || "No se pudo restaurar esta cuenta Gmail."); })
      .finally(() => { if (vigente) setConexionCargando(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario, cuentasGmail, cuentaSeleccionadaId]);

  const conectarGmail = async ({ incluirContactos = false, cuentaEsperadaId = cuentaSeleccionadaId } = {}) => {
    setErrorGmail("");
    setConexionCargando(true);
    try {
      const cuentaEsperada = incluirContactos ? cuentasGmail.find((cuenta) => String(cuenta.id) === String(cuentaEsperadaId)) : null;
      if (incluirContactos && !cuentaEsperada) throw new Error("Selecciona una cuenta Gmail registrada en Fuentes antes de autorizar Google Contacts.");
      const code = await iniciarCodigoAutorizacionGmail({ incluirContactos, cuentaEsperada: cuentaEsperada?.email || "" });
      const conexion = await canjearCodigoGmail(code, incluirContactos ? cuentaEsperadaId : "");
      if (incluirContactos) {
        // La autorización de un permiso adicional no debe reiniciar la cuenta Gmail activa.
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
      const mensaje = error?.message || "No se pudo iniciar la conexión con Gmail.";
      setErrorGmail(mensaje);
      throw error;
    } finally {
      setConexionCargando(false);
    }
  };

  const desconectarGmail = async (persistir = true, idCuenta = cuentaSeleccionadaId) => {
    if (!persistir) {
      setGmailConectado(false);
      return;
    }
    if (!idCuenta) return;
    try {
      await eliminarCuentaGmail(idCuenta);
      const restantes = cuentasGmail.filter((cuenta) => String(cuenta.id) !== String(idCuenta));
      setCuentasGmail(restantes);
      if (String(idCuenta) === String(cuentaSeleccionadaId)) {
        setGmailConectado(false);
        setCuentaGmail("");
        setCuentaSeleccionadaId(restantes[0]?.id ?? null);
      }
      setErrorGmail("");
    } catch (error) {
      setErrorGmail(error?.message || "No se pudo eliminar la conexión guardada de Gmail.");
    }
  };

  const seleccionarCuentaGmail = (id) => {
    setErrorGmail("");
    setCuentaSeleccionadaId(id || null);
  };
  const limpiarErrorGmail = () => setErrorGmail("");

  return (
    <GmailContext.Provider value={{
      gmailConectado, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, gisListo,
      conexionCargando, errorGmail, conectarGmail, desconectarGmail,
      seleccionarCuentaGmail, limpiarErrorGmail,
    }}>
      {children}
    </GmailContext.Provider>
  );
}

export function useGmail() { return useContext(GmailContext); }
