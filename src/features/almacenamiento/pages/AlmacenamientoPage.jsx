/**
 * @uso        Muestra el contenido de archivos del almacenamiento conectado
 * @funciones  AlmacenamientoPage()
 * @datos      Consulta conexiones para completar OAuth y determinar si hay cuentas disponibles
 * @eventos    Completar conexión OAuth al regresar del proveedor
 * @estados    conexiones, cargando, error
 * @usadoPor   App.jsx mediante la API pública de features/almacenamiento
 */
import { useCallback, useEffect, useState } from "react";
import { Cloud, FolderOpen } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "../../../components/ui";
import { completarConexion, obtenerConexiones } from "../services/almacenamientoServicio";

export default function AlmacenamientoPage() {
  const [conexiones, setConexiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [parametros, setParametros] = useSearchParams();

  const cargarConexiones = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setConexiones(await obtenerConexiones()); }
    catch { setError("No se pudo verificar el estado de tus cuentas. Inténtalo de nuevo más tarde."); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarConexiones(); }, [cargarConexiones]);

  // Completa el OAuth si el proveedor regresó a esta página con código y estado.
  useEffect(() => {
    const code = parametros.get("code");
    const state = parametros.get("state");
    if (!code || !state) return;
    setParametros({}, { replace: true });
    setCargando(true);
    completarConexion(code, state)
      .then(() => cargarConexiones())
      .catch(() => { setCargando(false); setError("No se pudo completar la conexión con el proveedor. Inténtalo de nuevo."); });
  }, [parametros, setParametros, cargarConexiones]);

  const hayCuentas = conexiones.length > 0;

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pb-10 pt-6">
      <header>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Almacenamiento</h1>
        <p className="mt-1 text-sm text-slate-text">Consulta y administra tus archivos en la nube.</p>
      </header>

      {cargando && (
        <Card className="p-6">
          <p role="status" className="text-sm text-slate-text">Cargando almacenamiento…</p>
        </Card>
      )}

      {!cargando && error && (
        <Card className="space-y-3 p-6">
          <p role="alert" className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={cargarConexiones} className="text-sm font-semibold text-emerald-primary underline">Reintentar</button>
        </Card>
      )}

      {!cargando && !error && !hayCuentas && (
        <Card className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-6 text-center">
          <Cloud className="mx-auto h-8 w-8 text-emerald-primary" aria-hidden="true" />
          <p className="mt-3 font-medium text-bg-dark">No tienes cuentas de almacenamiento conectadas</p>
          <p className="mt-1 text-sm text-slate-text">Conecta una cuenta desde Configuración para ver tus archivos aquí.</p>
          <Link to="/dashboard/configuracion" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover">
            Ir a Configuración
          </Link>
        </Card>
      )}

      {!cargando && !error && hayCuentas && (
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-emerald-primary" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-bg-dark">Archivos</h2>
          </div>
          <div className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-6 text-center">
            <p className="font-medium text-bg-dark">Tus cuentas están conectadas</p>
            <p className="mt-1 text-sm text-slate-text">Próximamente podrás explorar tus archivos desde aquí. Mientras tanto, administra tus cuentas desde Configuración.</p>
            <Link to="/dashboard/configuracion" className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-border-line/60 px-4 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5">
              Ir a Configuración
            </Link>
          </div>
        </Card>
      )}
    </section>
  );
}
