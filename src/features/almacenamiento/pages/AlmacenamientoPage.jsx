/**
 * @uso        Lista las cuentas de almacenamiento conectadas al usuario
 * @funciones  AlmacenamientoPage()
 * @datos      Obtiene conexiones seguras desde el backend por almacenamientoServicio
 * @eventos    Actualizar lista y desconectar una cuenta
 * @estados    conexiones, cargando, error, cuentaDesconectando
 * @usadoPor   App.jsx mediante la API pública de features/almacenamiento
 */
import { useCallback, useEffect, useState } from "react";
import { Cloud, HardDrive, RefreshCw, Unplug } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui";
import { desconectarCuenta, obtenerConexiones } from "../services/almacenamientoServicio";

const ETIQUETAS_PROVEEDOR = { GOOGLE_DRIVE: "Google Drive", ONEDRIVE: "OneDrive", NEXTCLOUD: "Nextcloud" };
const ETIQUETAS_ESTADO = { ACTIVA: "Conectada", REQUIERE_RECONEXION: "Requiere reconexión", DESCONECTADA: "Desconectada" };

export default function AlmacenamientoPage() {
  const [conexiones, setConexiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cuentaDesconectando, setCuentaDesconectando] = useState(null);

  const cargarConexiones = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setConexiones(await obtenerConexiones()); }
    catch { setError("No se pudieron cargar las cuentas. Inténtalo de nuevo más tarde."); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarConexiones(); }, [cargarConexiones]);

  const alDesconectar = async (cuenta) => {
    setCuentaDesconectando(cuenta.id);
    setError("");
    try { await desconectarCuenta(cuenta.id); await cargarConexiones(); }
    catch { setError("No se pudo desconectar la cuenta. Inténtalo de nuevo."); }
    finally { setCuentaDesconectando(null); }
  };

  return <section aria-labelledby="dashboard-title" className="space-y-6 pt-6 pb-10">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p><h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Almacenamiento</h1><p className="mt-1 text-sm text-slate-text">Administra tus cuentas de almacenamiento en la nube.</p></div>
      <button type="button" onClick={cargarConexiones} disabled={cargando} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-line/60 px-4 py-2 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5 disabled:opacity-50"><RefreshCw className="h-4 w-4" aria-hidden="true" />Actualizar</button>
    </header>
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-3"><HardDrive className="h-5 w-5 text-emerald-primary" aria-hidden="true"/><h2 className="font-display text-lg font-semibold text-bg-dark">Cuentas conectadas</h2></div>
      {cargando && <p role="status" className="text-sm text-slate-text">Cargando cuentas…</p>}
      {!cargando && error && <div role="alert" className="space-y-3"><p className="text-sm text-red-700">{error}</p><button type="button" onClick={cargarConexiones} className="text-sm font-semibold text-emerald-primary underline">Reintentar</button></div>}
      {!cargando && !error && conexiones.length === 0 && <div className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-6 text-center"><Cloud className="mx-auto h-8 w-8 text-emerald-primary" aria-hidden="true"/><p className="mt-3 font-medium text-bg-dark">Aún no tienes cuentas conectadas</p><p className="mt-1 text-sm text-slate-text">Conecta Google Drive, OneDrive o Nextcloud desde Configuración.</p><Link to="/dashboard/configuracion" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover">Ir a Configuración</Link></div>}
      {!cargando && conexiones.length > 0 && <ul className="divide-y divide-border-line/40">{conexiones.map((cuenta) => <li key={cuenta.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="font-semibold text-bg-dark">{ETIQUETAS_PROVEEDOR[cuenta.proveedor] || cuenta.proveedor}</p><p className="truncate text-sm text-slate-text">{cuenta.etiquetaCuenta || cuenta.urlServidor || "Cuenta de almacenamiento"}</p><p className="mt-1 text-xs text-slate-text">{ETIQUETAS_ESTADO[cuenta.estado] || cuenta.estado}</p></div><button type="button" onClick={() => alDesconectar(cuenta)} disabled={cuentaDesconectando === cuenta.id} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-line/60 px-3 text-sm text-slate-text hover:bg-red-50 hover:text-red-700 disabled:opacity-50"><Unplug className="h-4 w-4" aria-hidden="true"/>{cuentaDesconectando === cuenta.id ? "Desconectando…" : "Desconectar"}</button></li>)}</ul>}
    </Card>
  </section>;
}
