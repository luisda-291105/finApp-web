/**
 * @uso        Carga suscripciones Gmail desde el endpoint del backend
 * @funciones  useSuscripcionesGmail({ cuentasGmail })
 * @datos      Consume DTOs filtrados por el usuario activo
 * @eventos    Consulta automáticamente al entrar y cuando se solicita recarga
 * @estados    suscripcionesCorreo, cargando, erroresCuentas, error, consultaRealizada
 * @usadoPor   SuscripcionesPage
 */
import { useCallback, useEffect, useState } from "react";
import { listarSuscripcionesGmail } from "../../../services/gmailServicio";

/** El navegador no obtiene tokens ni consulta Gmail directamente para esta vista. */
export default function useSuscripcionesGmail({ cuentasGmail }) {
  const [suscripcionesCorreo, setSuscripcionesCorreo] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [erroresCuentas, setErroresCuentas] = useState([]);
  const [error, setError] = useState("");
  const [consultaRealizada, setConsultaRealizada] = useState(false);

  const cargarSuscripciones = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await listarSuscripcionesGmail();
      setSuscripcionesCorreo(Array.isArray(respuesta?.suscripciones) ? respuesta.suscripciones : []);
      setErroresCuentas(Array.isArray(respuesta?.erroresCuentas) ? respuesta.erroresCuentas : []);
      if (respuesta?.erroresCuentas?.length) setError("Algunas cuentas Gmail no se pudieron consultar.");
    } catch (fallo) {
      setSuscripcionesCorreo([]);
      setErroresCuentas([]);
      setError(fallo?.message || "No se pudieron cargar las suscripciones Gmail.");
    } finally {
      setCargando(false);
      setConsultaRealizada(true);
    }
  }, []);

  useEffect(() => { cargarSuscripciones(); }, [cargarSuscripciones, cuentasGmail.length]);

  return { suscripcionesCorreo, cargando, erroresCuentas, error, consultaRealizada, actualizarSuscripciones: cargarSuscripciones };
}
