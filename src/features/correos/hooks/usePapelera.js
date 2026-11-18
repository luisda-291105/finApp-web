/**
 * @uso        Estado y acciones de la vista Papelera (composición multi-cuenta)
 * @funciones  usePapelera({ activo, intervaloMs })
 * @datos      Consulta la papelera en vivo por cuenta, restaura y refleja cambios de forma optimista
 * @eventos    Restaurar por fila, autorizar el permiso ampliado, reintentar una cuenta y cerrar avisos
 * @estados    secciones, cargando, restaurando, autorizando y aviso
 * @usadoPor   CorreosPage
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useGmail } from "../../../context/GmailContext";
import {
  listarPapeleraDeCuenta,
  listarPapeleraPorCuentas,
  restaurarCorreoDePapelera,
} from "../services/papeleraService";

export const INTERVALO_ESTADO_MS = 15 * 1000;

const claveCorreo = (cuentaId, mensajeId) => `${cuentaId}:${mensajeId}`;

/** Encapsula el listado multi-cuenta, la restauración optimista y la reconciliación. */
export function usePapelera({
  activo = false,
  intervaloMs = INTERVALO_ESTADO_MS,
} = {}) {
  const { gmailConectado, cuentasGmail, conectarGmail } = useGmail();
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [restaurando, setRestaurando] = useState({});
  const [autorizando, setAutorizando] = useState(null);
  const [aviso, setAviso] = useState(null);
  const montadoRef = useRef(true);
  const enVueloRef = useRef(false);
  const seccionesRef = useRef([]);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  useEffect(() => {
    seccionesRef.current = secciones;
  }, [secciones]);

  const cargar = useCallback(async () => {
    if (!gmailConectado || cuentasGmail.length === 0) {
      setSecciones([]);
      setCargando(false);
      return [];
    }
    if (enVueloRef.current) return [];
    enVueloRef.current = true;
    setCargando(true);
    try {
      const resultados = await listarPapeleraPorCuentas(cuentasGmail);
      if (!montadoRef.current) return [];
      setSecciones(resultados);
      return resultados;
    } finally {
      enVueloRef.current = false;
      if (montadoRef.current) setCargando(false);
    }
  }, [gmailConectado, cuentasGmail]);

  /** Reconciliación silenciosa: re-consulta sin mostrar el estado de carga global. */
  const reconciliar = useCallback(async () => {
    if (!gmailConectado || cuentasGmail.length === 0) return;
    if (enVueloRef.current) return;
    enVueloRef.current = true;
    try {
      const resultados = await listarPapeleraPorCuentas(cuentasGmail);
      if (montadoRef.current) setSecciones(resultados);
    } catch {
      /* La reconciliación no debe tapar la vista con errores transitorios. */
    } finally {
      enVueloRef.current = false;
    }
  }, [gmailConectado, cuentasGmail]);

  const reintentarCuenta = useCallback(async (cuentaId) => {
    if (!cuentaId) return;
    try {
      const datos = await listarPapeleraDeCuenta(cuentaId);
      if (!montadoRef.current) return;
      setSecciones((actuales) =>
        actuales.map((seccion) =>
          String(seccion.cuentaId) === String(cuentaId)
            ? {
                ...seccion,
                ...datos,
                error: "",
                requierePermiso: false,
                requiereReconexion: false,
              }
            : seccion,
        ),
      );
    } catch (fallo) {
      if (!montadoRef.current) return;
      const requierePermiso = fallo?.requires_scope_authorization === true;
      const requiereReconexion = fallo?.requires_reconnect === true;
      setSecciones((actuales) =>
        actuales.map((seccion) =>
          String(seccion.cuentaId) === String(cuentaId)
            ? {
                ...seccion,
                error:
                  requierePermiso || requiereReconexion
                    ? ""
                    : fallo?.message ||
                      "No se pudo consultar la papelera de Gmail.",
                requierePermiso,
                requiereReconexion,
              }
            : seccion,
        ),
      );
    }
  }, []);

  const restaurar = useCallback(async ({ cuentaId, mensajeId }) => {
    if (!cuentaId || !mensajeId) return;
    const seccion = seccionesRef.current.find(
      (actual) => String(actual.cuentaId) === String(cuentaId),
    );
    const indice = seccion
      ? seccion.correos.findIndex((correo) => correo.mensajeId === mensajeId)
      : -1;
    const respaldo = indice >= 0 ? seccion.correos[indice] : null;
    const clave = claveCorreo(cuentaId, mensajeId);

    setRestaurando((actuales) => ({ ...actuales, [clave]: true }));
    setAviso(null);
    // Reflejo optimista: el correo sale de la papelera de inmediato.
    setSecciones((actuales) =>
      actuales.map((actual) =>
        String(actual.cuentaId) === String(cuentaId)
          ? {
              ...actual,
              correos: actual.correos.filter(
                (correo) => correo.mensajeId !== mensajeId,
              ),
              total: Math.max(0, actual.total - 1),
            }
          : actual,
      ),
    );
    try {
      await restaurarCorreoDePapelera(cuentaId, mensajeId);
      if (montadoRef.current)
        setAviso({
          tipo: "exito",
          mensaje: "Correo restaurado en la bandeja de Gmail.",
        });
    } catch (fallo) {
      if (!montadoRef.current) return;
      if (fallo?.status === 410) {
        // RF-18: ya purgado; se queda fuera de la vista y se informa.
        setAviso({
          tipo: "info",
          mensaje:
            "Ese correo ya fue eliminado definitivamente por Gmail; no es recuperable.",
        });
      } else if (fallo?.mail_unavailable) {
        // RF-20: ya no estaba disponible; no es un fallo.
        setAviso({
          tipo: "info",
          mensaje: "Ese correo ya no estaba en la papelera.",
        });
      } else {
        if (respaldo) {
          setSecciones((actuales) =>
            actuales.map((actual) => {
              if (String(actual.cuentaId) !== String(cuentaId)) return actual;
              if (
                actual.correos.some((correo) => correo.mensajeId === mensajeId)
              )
                return actual;
              const correos = [...actual.correos];
              correos.splice(indice < 0 ? correos.length : indice, 0, respaldo);
              return { ...actual, correos, total: actual.total + 1 };
            }),
          );
        }
        setAviso({
          tipo: "error",
          mensaje: fallo?.message || "No se pudo restaurar el correo.",
        });
      }
    } finally {
      if (montadoRef.current)
        setRestaurando((actuales) => {
          const copia = { ...actuales };
          delete copia[clave];
          return copia;
        });
    }
  }, []);

  /** Autoriza el permiso ampliado (gmail.modify) reutilizando el flujo de conexión. */
  const autorizarPermiso = useCallback(
    async (cuentaId) => {
      if (!cuentaId)
        throw new Error("Selecciona una cuenta Gmail para autorizar.");
      setAutorizando(cuentaId);
      setAviso(null);
      try {
        await conectarGmail({ incluirModificar: true, cuentaEsperadaId: cuentaId });
        if (montadoRef.current)
          setAviso({
            tipo: "exito",
            mensaje:
              "Permiso concedido. Ya puedes ver y gestionar la papelera de esa cuenta.",
          });
        await cargar();
      } catch (fallo) {
        if (montadoRef.current)
          setAviso({
            tipo: "error",
            mensaje:
              fallo?.message ||
              "No se pudo autorizar el permiso para modificar tus correos.",
          });
        throw fallo;
      } finally {
        if (montadoRef.current) setAutorizando(null);
      }
    },
    [conectarGmail, cargar],
  );

  const cerrarAviso = useCallback(() => setAviso(null), []);

  useEffect(() => {
    if (!activo) return undefined;
    if (!gmailConectado || cuentasGmail.length === 0) {
      setSecciones([]);
      return undefined;
    }
    cargar();
    const temporizador = window.setInterval(reconciliar, intervaloMs);
    return () => window.clearInterval(temporizador);
  }, [
    activo,
    gmailConectado,
    cuentasGmail,
    cargar,
    reconciliar,
    intervaloMs,
  ]);

  return {
    secciones,
    cargando,
    restaurando,
    autorizando,
    aviso,
    cargar,
    reconciliar,
    restaurar,
    autorizarPermiso,
    reintentarCuenta,
    cerrarAviso,
  };
}
