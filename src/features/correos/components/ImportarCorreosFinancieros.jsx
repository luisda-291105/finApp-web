/**
 * @uso        Propone ingresos y gastos encontrados en Gmail para revisión contable
 * @funciones  ImportarCorreosFinancieros()
 * @datos      Lee correo con OAuth y registra movimientos confirmados con su ID de origen
 * @eventos    Sincroniza, confirma una importación o descarta una sugerencia
 * @estados    sugerencias, bolsillos, carga, errores y confirmaciones
 * @usadoPor   CorreosPage
 */
import { useEffect, useMemo, useState } from "react";
import { Card } from "../../../components/ui";
import { useGmail } from "../../../context/GmailContext";
import { crearMovimiento, listarCorreosImportados } from "../../contabilidad/services/movimientosService";
import { listarBolsillos as obtenerBolsillos } from "../../contabilidad/services/bolsillosService";
import { obtenerContenidoCorreosFinancierosGmail } from "../../../services/gmailServicio";
import { esCandidatoFinanciero, extraerMovimientoSugerido } from "../utils/correoFinancieroHelpers";

/** Sincroniza automáticamente al conectar Gmail y espera confirmación antes de guardar. */
export default function ImportarCorreosFinancieros({ mensajes = [] }) {
  const { tokenGmail, cuentaGmail, cuentaSeleccionadaId } = useGmail();
  const [sugerencias, setSugerencias] = useState([]);
  const [bolsillos, setBolsillos] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [omitidos, setOmitidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [ocupado, setOcupado] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const visibles = useMemo(() => sugerencias.filter((sugerencia) => !omitidos.includes(sugerencia.idCorreo)), [sugerencias, omitidos]);

  useEffect(() => {
    if (!tokenGmail) { setSugerencias([]); return undefined; }
    let vigente = true;
    const sincronizar = async () => {
      setCargando(true); setError("");
      try {
        const [respuestaCorreos, respuestaBolsillos] = await Promise.all([
          obtenerContenidoCorreosFinancierosGmail(tokenGmail, mensajes
            .filter(esCandidatoFinanciero)
            .slice(0, 5)
            .map((correo) => ({ ...correo, cuentaGmailId: cuentaSeleccionadaId }))),
          obtenerBolsillos(),
        ]);
        if (!vigente) return;
        const cuentas = new Map((respuestaCorreos || []).map((correo) => [correo.id, { ...correo, cuentaGmailId: cuentaSeleccionadaId }]));
        const candidatas = [...cuentas.values()].map(extraerMovimientoSugerido).filter(Boolean);
        const importados = await listarCorreosImportados(candidatas.map((item) => item.origenId));
        const origenesImportados = new Set(Array.isArray(importados) ? importados : importados?.data || []);
        setSugerencias(candidatas.filter((item) => !origenesImportados.has(item.origenId)));
        setBolsillos(Array.isArray(respuestaBolsillos) ? respuestaBolsillos : respuestaBolsillos?.data || respuestaBolsillos?.content || []);
      } catch (fallo) { if (vigente) setError(fallo?.message || "No se pudo analizar Gmail."); }
      finally { if (vigente) setCargando(false); }
    };
    sincronizar();
    return () => { vigente = false; };
  }, [tokenGmail, cuentaGmail, cuentaSeleccionadaId, mensajes]);

  const importar = async (sugerencia) => {
    const idBolsillo = selecciones[sugerencia.idCorreo];
    if (!idBolsillo) return;
    setOcupado(sugerencia.idCorreo); setError(""); setAviso("");
    try {
      await crearMovimiento({
        idBolsillo, fecha: sugerencia.fecha, monto: sugerencia.monto,
        categoria: sugerencia.categoria, concepto: sugerencia.concepto,
        origenTipo: "GMAIL", origenId: sugerencia.origenId,
        origenNombre: sugerencia.remitente || "Cuenta Gmail",
      });
      setOmitidos((actuales) => [...actuales, sugerencia.idCorreo]);
      setAviso("Movimiento importado en Contabilidad.");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo importar el movimiento. Si ya fue registrado, no necesitas volver a importarlo.");
    } finally { setOcupado(""); }
  };

  if (!tokenGmail) return null;
  return <Card className="space-y-4 p-5">
    <div><h2 className="font-display text-base font-semibold text-bg-dark">Movimientos sugeridos desde Gmail</h2><p className="mt-1 text-sm text-slate-text">Detectamos compras, pagos, suscripciones e ingresos en {cuentaGmail || "tu cuenta"}. Revisa cada sugerencia y confirma para registrarla.</p></div>
    {cargando && <p role="status" className="text-sm text-slate-text">Analizando correos financieros…</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {aviso && <p role="status" className="text-sm font-medium text-emerald-primary">{aviso}</p>}
    {!cargando && visibles.length === 0 && <p className="text-sm text-slate-text">No hay nuevos movimientos para revisar. Se consultan hasta 10 correos recientes y se analizan con más detalle hasta 5 mensajes financieros. Los mensajes importados se bloquean como duplicados.</p>}
    {visibles.length > 0 && <ul className="divide-y divide-border-line/30">{visibles.map((item) => {
      const opciones = bolsillos.filter((bolsillo) => bolsillo.estado !== false && String(bolsillo.tipo).toUpperCase() === item.tipo);
      return <li key={item.idCorreo} className="space-y-3 py-4 first:pt-0 last:pb-0">
        <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-medium text-bg-dark">{item.concepto}</p><p className="truncate text-xs text-slate-text">{item.tipo === "INGRESO" ? "Ingreso" : "Gasto"} · {item.categoria} · {item.remitente} · {item.fecha} · {item.etiquetas.join(", ") || "Sin etiqueta"}</p></div><span className="shrink-0 font-semibold text-bg-dark">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2 }).format(item.monto)}</span></div>
        <div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor={`bolsillo-correo-${item.idCorreo}`}>Bolsillo para {item.concepto}</label><select id={`bolsillo-correo-${item.idCorreo}`} value={selecciones[item.idCorreo] || ""} onChange={(evento) => setSelecciones((actuales) => ({ ...actuales, [item.idCorreo]: evento.target.value }))} className="min-h-10 min-w-48 flex-1 rounded-lg border border-border-line bg-white px-3 text-sm"><option value="">Selecciona un bolsillo de {item.tipo === "INGRESO" ? "ingresos" : "gastos"}</option>{opciones.map((bolsillo) => <option key={bolsillo.idBolsillo} value={bolsillo.idBolsillo}>{bolsillo.nombre}</option>)}</select><button type="button" disabled={!selecciones[item.idCorreo] || ocupado === item.idCorreo} onClick={() => importar(item)} className="min-h-10 rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream disabled:opacity-50">{ocupado === item.idCorreo ? "Guardando…" : "Confirmar importación"}</button><button type="button" onClick={() => setOmitidos((actuales) => [...actuales, item.idCorreo])} className="min-h-10 px-2 text-sm text-slate-text underline">Descartar</button><a href={`https://mail.google.com/mail/u/?authuser=${encodeURIComponent(cuentaGmail)}#all/${encodeURIComponent(item.idCorreo)}`} target="_blank" rel="noreferrer" className="text-sm text-emerald-primary underline">Ver correo</a></div>
        {opciones.length === 0 && <p className="text-xs text-amber-800">Crea y activa un bolsillo de tipo {item.tipo} para poder importar este movimiento.</p>}
      </li>;
    })}</ul>}
  </Card>;
}
