/**
 * @uso        Estado y acciones de la vista Papelera (composición multi-cuenta)
 * @funciones  usePapelera({ activo, intervaloMs, intervaloLoteMs })
 * @datos      Consulta la papelera en vivo por cuenta, restaura, configura la limpieza automática, genera la vista previa, ejecuta y sigue la limpieza y gestiona la lista blanca
 * @eventos    Restaurar por fila, autorizar el permiso ampliado, reintentar una cuenta, guardar la configuración, previsualizar, confirmar la limpieza y añadir/quitar remitentes
 * @estados    secciones, cargando, restaurando, autorizando, aviso y el subestado de gestión (configuración, vista previa, lote y lista blanca)
 * @usadoPor   CorreosPage
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useGmail } from "../../../context/GmailContext";
import {
  agregarRemitenteListaBlanca,
  eliminarRemitenteListaBlanca,
  generarVistaPreviaPapelera,
  guardarConfiguracionPapelera,
  iniciarLimpiezaPapelera,
  listarListaBlanca,
  listarPapeleraDeCuenta,
  listarPapeleraPorCuentas,
  obtenerConfiguracionPapelera,
  obtenerEstadoLimpiezaPapelera,
  restaurarCorreoDePapelera,
} from "../services/papeleraService";

export const INTERVALO_ESTADO_MS = 15 * 1000;
export const INTERVALO_LOTE_MS = 3 * 1000;

const claveCorreo = (cuentaId, mensajeId) => `${cuentaId}:${mensajeId}`;

/** Encapsula el listado multi-cuenta, la restauración optimista y la limpieza automática. */
export function usePapelera({
  activo = false,
  intervaloMs = INTERVALO_ESTADO_MS,
  intervaloLoteMs = INTERVALO_LOTE_MS,
} = {}) {
  const { gmailConectado, cuentasGmail, conectarGmail } = useGmail();
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [restaurando, setRestaurando] = useState({});
  const [autorizando, setAutorizando] = useState(null);
  const [aviso, setAviso] = useState(null);
  // Subestado de gestión (configuración, vista previa, limpieza y lista blanca).
  const [gestionCuentaId, setGestionCuentaId] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [cargandoConfiguracion, setCargandoConfiguracion] = useState(false);
  const [guardandoConfiguracion, setGuardandoConfiguracion] = useState(false);
  const [requierePermisoGestion, setRequierePermisoGestion] = useState(false);
  const [vistaPreviaInformativa, setVistaPreviaInformativa] = useState(null);
  const [vistaPreviaLimpieza, setVistaPreviaLimpieza] = useState(null);
  const [generandoVistaPrevia, setGenerandoVistaPrevia] = useState(false);
  const [vistaPreviaDesactualizada, setVistaPreviaDesactualizada] =
    useState(false);
  const [lote, setLote] = useState(null);
  const [limpiando, setLimpiando] = useState(false);
  const [listaBlanca, setListaBlanca] = useState([]);
  const [cargandoListaBlanca, setCargandoListaBlanca] = useState(false);
  const [agregandoRemitente, setAgregandoRemitente] = useState(false);
  const [eliminandoRemitenteId, setEliminandoRemitenteId] = useState(null);

  const montadoRef = useRef(true);
  const enVueloRef = useRef(false);
  const seccionesRef = useRef([]);
  const gestionCuentaIdRef = useRef(null);
  const vistaPreviaInformativaRef = useRef(null);
  const vistaPreviaLimpiezaRef = useRef(null);
  const loteRef = useRef(null);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  useEffect(() => {
    seccionesRef.current = secciones;
  }, [secciones]);

  useEffect(() => {
    gestionCuentaIdRef.current = gestionCuentaId;
  }, [gestionCuentaId]);

  useEffect(() => {
    vistaPreviaInformativaRef.current = vistaPreviaInformativa;
  }, [vistaPreviaInformativa]);

  useEffect(() => {
    vistaPreviaLimpiezaRef.current = vistaPreviaLimpieza;
  }, [vistaPreviaLimpieza]);

  useEffect(() => {
    loteRef.current = lote;
  }, [lote]);

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

  /** Carga la configuración y la lista blanca de la cuenta en gestión. */
  const cargarGestion = useCallback(async (cuentaId) => {
    if (!cuentaId) return;
    setCargandoConfiguracion(true);
    setCargandoListaBlanca(true);
    setVistaPreviaInformativa(null);
    setVistaPreviaLimpieza(null);
    setVistaPreviaDesactualizada(false);
    setLote(null);
    try {
      const [configRes, listaRes] = await Promise.allSettled([
        obtenerConfiguracionPapelera(cuentaId),
        listarListaBlanca(cuentaId),
      ]);
      if (!montadoRef.current) return;
      if (configRes.status === "fulfilled") {
        setConfiguracion(configRes.value);
        setRequierePermisoGestion(configRes.value.scopeAutorizado === false);
      } else {
        setConfiguracion(null);
        setRequierePermisoGestion(
          configRes.reason?.requires_scope_authorization === true,
        );
        setAviso({
          tipo: "error",
          mensaje:
            configRes.reason?.message ||
            "No se pudo cargar la configuración de la papelera.",
        });
      }
      setListaBlanca(listaRes.status === "fulfilled" ? listaRes.value : []);
    } finally {
      if (montadoRef.current) {
        setCargandoConfiguracion(false);
        setCargandoListaBlanca(false);
      }
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
        setRequierePermisoGestion(false);
        await cargar();
        if (gestionCuentaIdRef.current)
          await cargarGestion(gestionCuentaIdRef.current);
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
    [conectarGmail, cargar, cargarGestion],
  );

  /** Selecciona la cuenta cuya limpieza automática se va a configurar. */
  const seleccionarCuentaGestion = useCallback(
    (cuentaId) => {
      const id = cuentaId || null;
      gestionCuentaIdRef.current = id;
      setGestionCuentaId(id);
      setAviso(null);
      if (id) cargarGestion(id);
    },
    [cargarGestion],
  );

  /** Guarda la configuración y refleja la que devuelve el backend. */
  const guardarConfiguracion = useCallback(async (configuracionNueva) => {
    const cuentaId = gestionCuentaIdRef.current;
    if (!cuentaId) return null;
    setGuardandoConfiguracion(true);
    setAviso(null);
    try {
      const resultado = await guardarConfiguracionPapelera(
        cuentaId,
        configuracionNueva,
      );
      if (!montadoRef.current) return null;
      setConfiguracion(resultado);
      setRequierePermisoGestion(resultado.scopeAutorizado === false);
      setVistaPreviaInformativa(null);
      setAviso({
        tipo: "exito",
        mensaje: "Configuración de la papelera guardada.",
      });
      return resultado;
    } catch (fallo) {
      if (!montadoRef.current) return null;
      if (fallo?.requires_scope_authorization) setRequierePermisoGestion(true);
      setAviso({
        tipo: "error",
        mensaje: fallo?.message || "No se pudo guardar la configuración.",
      });
      return null;
    } finally {
      if (montadoRef.current) setGuardandoConfiguracion(false);
    }
  }, []);

  /** Vista previa informativa (no bloqueante) del remanente antes de activar categorías. */
  const previsualizarInformativa = useCallback(async (parametros) => {
    const cuentaId = gestionCuentaIdRef.current;
    if (!cuentaId) return null;
    setGenerandoVistaPrevia(true);
    try {
      const resultado = await generarVistaPreviaPapelera(cuentaId, parametros);
      if (!montadoRef.current) return null;
      setVistaPreviaInformativa({ ...resultado, parametros });
      setRequierePermisoGestion(false);
      return resultado;
    } catch (fallo) {
      if (!montadoRef.current) return null;
      if (fallo?.requires_scope_authorization) setRequierePermisoGestion(true);
      else
        setAviso({
          tipo: "error",
          mensaje: fallo?.message || "No se pudo generar la vista previa.",
        });
      return null;
    } finally {
      if (montadoRef.current) setGenerandoVistaPrevia(false);
    }
  }, []);

  /** Vista previa obligatoria que fija el conteo a confirmar antes de limpiar. */
  const generarVistaPrevia = useCallback(async (parametros) => {
    const cuentaId = gestionCuentaIdRef.current;
    if (!cuentaId) return null;
    setGenerandoVistaPrevia(true);
    setVistaPreviaDesactualizada(false);
    try {
      const resultado = await generarVistaPreviaPapelera(cuentaId, parametros);
      if (!montadoRef.current) return null;
      setVistaPreviaLimpieza({ ...resultado, parametros });
      setRequierePermisoGestion(false);
      return resultado;
    } catch (fallo) {
      if (!montadoRef.current) return null;
      if (fallo?.requires_scope_authorization) setRequierePermisoGestion(true);
      else
        setAviso({
          tipo: "error",
          mensaje: fallo?.message || "No se pudo generar la vista previa.",
        });
      return null;
    } finally {
      if (montadoRef.current) setGenerandoVistaPrevia(false);
    }
  }, []);

  /** Consulta el estado de un lote de limpieza concreto. */
  const consultarLote = useCallback(
    async (cuentaId, loteId) => {
      if (!cuentaId || !loteId) return;
      try {
        const estado = await obtenerEstadoLimpiezaPapelera(cuentaId, loteId);
        if (!montadoRef.current) return;
        setLote(estado);
        if (estado.estado === "COMPLETADO") {
          setAviso({
            tipo: "exito",
            mensaje: `Limpieza completada: ${estado.movidos} correo(s) movido(s) a la papelera.`,
          });
          await cargar();
        } else if (estado.estado === "FALLIDO") {
          setAviso({
            tipo: "error",
            mensaje:
              "La limpieza no se pudo completar. Los correos movidos se mantienen y los fallidos pueden reintentarse.",
          });
        } else if (estado.limiteEjecucionAlcanzado) {
          setAviso({
            tipo: "info",
            mensaje:
              "La limpieza alcanzó el límite por ejecución; la siguiente ejecución retoma el remanente.",
          });
        }
      } catch (fallo) {
        if (montadoRef.current)
          setAviso({
            tipo: "error",
            mensaje:
              fallo?.message || "No se pudo consultar el estado de la limpieza.",
          });
      }
    },
    [cargar],
  );

  const refrescarLote = useCallback(
    () => consultarLote(gestionCuentaIdRef.current, loteRef.current?.loteId),
    [consultarLote],
  );

  /** Ejecuta la limpieza explícita de los correos ya recibidos según la vista previa. */
  const confirmarLimpieza = useCallback(async () => {
    const cuentaId = gestionCuentaIdRef.current;
    const previa = vistaPreviaLimpiezaRef.current;
    if (!cuentaId || !previa?.vistaPreviaId) return;
    setLimpiando(true);
    setAviso(null);
    try {
      const inicio = await iniciarLimpiezaPapelera(cuentaId, {
        vistaPreviaId: previa.vistaPreviaId,
        totalEstimado: previa.totalEstimado,
      });
      if (!montadoRef.current) return;
      setVistaPreviaLimpieza(null);
      setLote({
        loteId: inicio.loteId,
        estado: inicio.estado || "EN_PROCESO",
        total: previa.totalEstimado,
        movidos: 0,
        omitidos: 0,
        fallidos: 0,
        limiteEjecucionAlcanzado: false,
      });
      if (inicio.loteId) await consultarLote(cuentaId, inicio.loteId);
    } catch (fallo) {
      if (!montadoRef.current) return;
      if (fallo?.conteo_cambiado) {
        // RF-39: el conteo confirmado ya no coincide; se pide una nueva vista previa.
        setVistaPreviaLimpieza(null);
        setVistaPreviaDesactualizada(true);
        setAviso({
          tipo: "info",
          mensaje:
            "El conteo cambió desde la vista previa. Genera una nueva vista previa y confirma de nuevo.",
        });
      } else if (fallo?.limpieza_en_curso) {
        setAviso({
          tipo: "info",
          mensaje:
            "Ya hay una limpieza en curso para esta cuenta. Espera a que termine para reintentar.",
        });
      } else if (fallo?.limite_ejecucion_alcanzado) {
        setAviso({
          tipo: "info",
          mensaje:
            "La limpieza alcanzó el límite por ejecución; la siguiente ejecución retoma el remanente.",
        });
      } else if (fallo?.requires_scope_authorization) {
        setRequierePermisoGestion(true);
        setAviso({
          tipo: "error",
          mensaje: fallo?.message || "Falta autorizar el permiso ampliado.",
        });
      } else {
        setAviso({
          tipo: "error",
          mensaje: fallo?.message || "No se pudo iniciar la limpieza.",
        });
      }
    } finally {
      if (montadoRef.current) setLimpiando(false);
    }
  }, [consultarLote]);

  /** Regenera las vistas previas abiertas para reflejar los cambios de lista blanca. */
  const regenerarVistasPrevias = useCallback(async () => {
    const cuentaId = gestionCuentaIdRef.current;
    if (!cuentaId) return;
    const limpieza = vistaPreviaLimpiezaRef.current;
    const informativa = vistaPreviaInformativaRef.current;
    const tareas = [];
    if (limpieza?.parametros) {
      tareas.push(
        generarVistaPreviaPapelera(cuentaId, limpieza.parametros)
          .then((nueva) => {
            if (montadoRef.current)
              setVistaPreviaLimpieza({ ...nueva, parametros: limpieza.parametros });
          })
          .catch(() => {}),
      );
    }
    if (informativa?.parametros) {
      tareas.push(
        generarVistaPreviaPapelera(cuentaId, informativa.parametros)
          .then((nueva) => {
            if (montadoRef.current)
              setVistaPreviaInformativa({
                ...nueva,
                parametros: informativa.parametros,
              });
          })
          .catch(() => {}),
      );
    }
    await Promise.all(tareas);
  }, []);

  /** Añade un remitente a la lista blanca y refleja el cambio en la vista previa. */
  const agregarRemitente = useCallback(
    async (remitente) => {
      const cuentaId = gestionCuentaIdRef.current;
      if (!cuentaId || !remitente) return;
      setAgregandoRemitente(true);
      setAviso(null);
      try {
        await agregarRemitenteListaBlanca(cuentaId, remitente);
        if (!montadoRef.current) return;
        const lista = await listarListaBlanca(cuentaId);
        if (!montadoRef.current) return;
        setListaBlanca(lista);
        setAviso({
          tipo: "exito",
          mensaje: "Remitente añadido a la lista blanca.",
        });
        await regenerarVistasPrevias();
      } catch (fallo) {
        if (montadoRef.current)
          setAviso({
            tipo: "error",
            mensaje:
              fallo?.message ||
              "No se pudo añadir el remitente a la lista blanca.",
          });
      } finally {
        if (montadoRef.current) setAgregandoRemitente(false);
      }
    },
    [regenerarVistasPrevias],
  );

  /** Quita un remitente de la lista blanca y refleja el cambio en la vista previa. */
  const eliminarRemitente = useCallback(
    async (remitenteId) => {
      const cuentaId = gestionCuentaIdRef.current;
      if (!cuentaId || !remitenteId) return;
      setEliminandoRemitenteId(remitenteId);
      setAviso(null);
      try {
        await eliminarRemitenteListaBlanca(cuentaId, remitenteId);
        if (!montadoRef.current) return;
        const lista = await listarListaBlanca(cuentaId);
        if (!montadoRef.current) return;
        setListaBlanca(lista);
        setAviso({
          tipo: "exito",
          mensaje: "Remitente quitado de la lista blanca.",
        });
        await regenerarVistasPrevias();
      } catch (fallo) {
        if (montadoRef.current)
          setAviso({
            tipo: "error",
            mensaje:
              fallo?.message ||
              "No se pudo quitar el remitente de la lista blanca.",
          });
      } finally {
        if (montadoRef.current) setEliminandoRemitenteId(null);
      }
    },
    [regenerarVistasPrevias],
  );

  const cerrarAviso = useCallback(() => setAviso(null), []);

  useEffect(() => {
    if (!activo) return undefined;
    if (!gmailConectado || cuentasGmail.length === 0) {
      setSecciones([]);
      return undefined;
    }
    cargar().then((resultados) => {
      if (!montadoRef.current || gestionCuentaIdRef.current) return;
      const lista = resultados || [];
      const elegida =
        lista.find(
          (seccion) => !seccion.requierePermiso && !seccion.requiereReconexion,
        ) || lista[0];
      if (elegida?.cuentaId) seleccionarCuentaGestion(elegida.cuentaId);
    });
    const temporizador = window.setInterval(reconciliar, intervaloMs);
    return () => window.clearInterval(temporizador);
  }, [
    activo,
    gmailConectado,
    cuentasGmail,
    cargar,
    reconciliar,
    intervaloMs,
    seleccionarCuentaGestion,
  ]);

  // Sigue el lote mientras esté en proceso, hasta COMPLETADO o FALLIDO.
  useEffect(() => {
    if (!activo) return undefined;
    if (!lote?.loteId || lote.estado !== "EN_PROCESO") return undefined;
    const loteId = lote.loteId;
    const temporizador = window.setInterval(
      () => consultarLote(gestionCuentaIdRef.current, loteId),
      intervaloLoteMs,
    );
    return () => window.clearInterval(temporizador);
  }, [activo, lote?.loteId, lote?.estado, consultarLote, intervaloLoteMs]);

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
    gestion: {
      cuentaId: gestionCuentaId,
      configuracion,
      cargandoConfiguracion,
      guardandoConfiguracion,
      requierePermiso: requierePermisoGestion,
      vistaPreviaInformativa,
      vistaPreviaLimpieza,
      generandoVistaPrevia,
      vistaPreviaDesactualizada,
      lote,
      limpiando,
      listaBlanca,
      cargandoListaBlanca,
      agregandoRemitente,
      eliminandoRemitenteId,
    },
    accionesGestion: {
      alSeleccionarCuenta: seleccionarCuentaGestion,
      alGuardarConfiguracion: guardarConfiguracion,
      alPrevisualizar: previsualizarInformativa,
      alGenerarVistaPrevia: generarVistaPrevia,
      alConfirmarLimpieza: confirmarLimpieza,
      alRefrescarLote: refrescarLote,
      alAgregarRemitente: agregarRemitente,
      alEliminarRemitente: eliminarRemitente,
    },
  };
}
