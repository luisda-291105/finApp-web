/**
 * @uso        Muestra alertas automáticas y envía sugerencias Gmail a la bandeja de revisión contable
 * @funciones  ImportarCorreosFinancieros()
 * @datos      Lee correo con OAuth y registra movimientos confirmados con su ID de origen
 * @eventos    Sincroniza, confirma una importación o descarta una sugerencia
 * @estados    sugerencias, bolsillos, carga, errores y confirmaciones
 * @usadoPor   CorreosPage
 */
import { useEffect, useState } from "react";
import { Card } from "../../../components/ui";
import { useGmail } from "../../../context/GmailContext";
import { guardarCorreoPorRevisar, listarCorreosImportados } from "../../contabilidad/services/movimientosService";
import {
  confirmarNotificacionesMovimientosGmail,
  listarNotificacionesMovimientosGmail,
  obtenerContenidoCorreosFinancierosGmail,
} from "../../../services/gmailServicio";
import { esCandidatoFinanciero, extraerMovimientoSugerido } from "../utils/correoFinancieroHelpers";

/** Consulta alertas automáticas y permite confirmar manualmente solo sugerencias pendientes. */
export default function ImportarCorreosFinancieros({ mensajes = [] }) {
  const { gmailConectado, cuentaGmail, cuentaSeleccionadaId } = useGmail();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviadosPorRevisar, setEnviadosPorRevisar] = useState(0);
  const [alertas, setAlertas] = useState([]);
  const [errorAlertas, setErrorAlertas] = useState("");
  useEffect(() => {
    if (!gmailConectado) { setAlertas([]); return undefined; }
    let vigente = true;
    const consultarAlertas = async () => {
      try {
        const respuesta = await listarNotificacionesMovimientosGmail();
        if (vigente) {
          setAlertas(Array.isArray(respuesta) ? respuesta : []);
          setErrorAlertas("");
        }
      } catch (fallo) {
        if (vigente) setErrorAlertas(fallo?.message || "No se pudieron consultar las alertas de movimientos Gmail.");
      }
    };
    consultarAlertas();
    const temporizador = window.setInterval(consultarAlertas, 30_000);
    return () => { vigente = false; window.clearInterval(temporizador); };
  }, [gmailConectado]);

  useEffect(() => {
    if (!gmailConectado || !cuentaSeleccionadaId) { setEnviadosPorRevisar(0); return undefined; }
    let vigente = true;
    const sincronizar = async () => {
      setCargando(true); setError("");
      try {
        const respuestaCorreos = await obtenerContenidoCorreosFinancierosGmail(cuentaSeleccionadaId, mensajes
            .filter(esCandidatoFinanciero)
            .slice(0, 5)
            .map((correo) => ({ ...correo, cuentaGmailId: cuentaSeleccionadaId })));
        if (!vigente) return;
        const cuentas = new Map((respuestaCorreos || []).map((correo) => [correo.id, { ...correo, cuentaGmailId: cuentaSeleccionadaId }]));
        const candidatas = [...cuentas.values()].map(extraerMovimientoSugerido).filter(Boolean);
        const importados = await listarCorreosImportados(candidatas.map((item) => item.origenId));
        const origenesImportados = new Set(Array.isArray(importados) ? importados : importados?.data || []);
        let guardados = 0;
        const errores = [];
        for (const item of candidatas.filter((candidata) => !origenesImportados.has(candidata.origenId))) {
          try {
            await guardarCorreoPorRevisar({
              idBolsillo: null, tipo: item.tipo, fecha: item.fecha, monto: item.monto,
              categoria: item.categoria, concepto: item.concepto,
              origenTipo: "GMAIL", origenId: item.origenId, origenNombre: item.remitente,
            });
            guardados += 1;
          } catch (fallo) {
            errores.push(fallo?.message || `No se pudo enviar «${item.concepto}» a revisión.`);
          }
        }
        if (!vigente) return;
        setEnviadosPorRevisar(guardados);
        setAviso(guardados > 0 ? `${guardados} movimiento${guardados === 1 ? "" : "s"} Gmail enviado${guardados === 1 ? "" : "s"} a Contabilidad · Por revisar.` : "");
        if (errores.length) setError(errores.slice(0, 2).join(" · "));
      } catch (fallo) { if (vigente) setError(fallo?.message || "No se pudo analizar Gmail."); }
      finally { if (vigente) setCargando(false); }
    };
    sincronizar();
    return () => { vigente = false; };
  }, [gmailConectado, cuentaGmail, cuentaSeleccionadaId, mensajes]);

  const confirmarAlertas = async () => {
    try {
      await confirmarNotificacionesMovimientosGmail(alertas.map((alerta) => alerta.id));
      setAlertas([]);
    } catch (fallo) {
      setErrorAlertas(fallo?.message || "No se pudieron marcar las alertas como vistas.");
    }
  };

  if (!gmailConectado) return null;
  return <Card className="space-y-4 p-5">
    <div><h2 className="font-display text-base font-semibold text-bg-dark">Revisión de movimientos Gmail</h2><p className="mt-1 text-sm text-slate-text">Las sugerencias detectadas se envían a Contabilidad · Por revisar. Allí puedes confirmar el ingreso o gasto como movimiento global, sin asignarlo a un bolsillo AHORRO.</p></div>
    {alertas.length > 0 && <div role="alert" className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <p className="font-semibold">{alertas.length === 1 ? "Se registró automáticamente un movimiento desde Gmail." : `Se registraron automáticamente ${alertas.length} movimientos desde Gmail.`}</p>
      <ul className="list-inside list-disc">{alertas.map((alerta) => <li key={alerta.id}>{alerta.asunto || "Movimiento Bancolombia"}</li>)}</ul>
      <button type="button" onClick={confirmarAlertas} className="text-sm font-medium underline">Marcar como visto</button>
    </div>}
    {errorAlertas && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorAlertas}</p>}
    {cargando && <p role="status" className="text-sm text-slate-text">Analizando correos financieros…</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {aviso && <p role="status" className="text-sm font-medium text-emerald-primary">{aviso}</p>}
    {!cargando && enviadosPorRevisar === 0 && !error && <p className="text-sm text-slate-text">No se detectaron sugerencias nuevas. Los mensajes ya registrados no se duplican.</p>}
    {enviadosPorRevisar > 0 && <p className="text-sm text-slate-text">Abre el botón «Por revisar» en Contabilidad para confirmar o descartar los movimientos Gmail.</p>}
  </Card>;
}
