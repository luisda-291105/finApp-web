/**
 * @uso        Sección de Configuración para gestionar cuentas de almacenamiento conectadas
 * @funciones  CuentasAlmacenamientoCard({ nextcloudAbierto, alAbrirNextcloud, alCerrarNextcloud })
 * @datos      Obtiene y actualiza conexiones mediante almacenamientoServicio
 * @eventos    Conectar nuevas cuentas, abrir Google Drive, desconectar cuentas
 * @estados    conexiones, cargando, error, aviso, proveedorIniciando, cuentaDesconectando, modalDriveAbierto, cuentaSeleccionadaDrive
 * @usadoPor   ConfiguracionPage
 */
import { useCallback, useEffect, useState } from "react";
import { Cloud, ExternalLink, HardDrive, Unplug } from "lucide-react";
import { Card } from "../../../../components/ui";
import { conectarGoogleDrive, desconectarCuenta, iniciarConexion, obtenerConexiones } from "../../../almacenamiento/services/almacenamientoServicio";
import ModalGoogleDrive from "../../../almacenamiento/components/modals/ModalGoogleDrive";

const PROVEEDORES = [
  { id: "GOOGLE_DRIVE", etiqueta: "Conectar Google Drive", accion: conectarGoogleDrive },
  { id: "ONEDRIVE", etiqueta: "Conectar OneDrive", accion: () => iniciarConexion("ONEDRIVE") },
];
const ETIQUETAS_PROVEEDOR = { GOOGLE_DRIVE: "Google Drive", ONEDRIVE: "OneDrive", NEXTCLOUD: "Nextcloud" };
const ETIQUETAS_ESTADO = { ACTIVA: "Conectada", REQUIERE_RECONEXION: "Requiere reconexión", DESCONECTADA: "Desconectada" };

export default function CuentasAlmacenamientoCard({ nextcloudAbierto, alAbrirNextcloud, alCerrarNextcloud }) {
  const [conexiones, setConexiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [proveedorIniciando, setProveedorIniciando] = useState(null);
  const [cuentaDesconectando, setCuentaDesconectando] = useState(null);
  const [modalDriveAbierto, setModalDriveAbierto] = useState(false);
  const [cuentaSeleccionadaDrive] = useState(null);

  const cargarConexiones = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setConexiones(await obtenerConexiones()); }
    catch { setError("No se pudieron cargar las cuentas. Inténtalo de nuevo más tarde."); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarConexiones(); }, [cargarConexiones]);

  const alIniciar = async (proveedor) => {
    setProveedorIniciando(proveedor.id);
    setError("");
    setAviso("");
    try {
      await proveedor.accion();
      setAviso(`Cuenta ${proveedor.etiqueta.replace("Conectar ", "")} conectada.`);
      await cargarConexiones();
    } catch (errorConexion) {
      setError(errorConexion?.message || "No se pudo iniciar la conexión. Inténtalo de nuevo.");
    } finally {
      setProveedorIniciando(null);
    }
  };

  const alDesconectar = async (cuenta) => {
    setCuentaDesconectando(cuenta.id);
    setError("");
    setAviso("");
    try { await desconectarCuenta(cuenta.id); await cargarConexiones(); }
    catch { setError("No se pudo desconectar la cuenta. Inténtalo de nuevo."); }
    finally { setCuentaDesconectando(null); }
  };

  return (
    <>
      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-emerald-primary" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-semibold text-bg-dark">Cuentas de almacenamiento conectadas</h2>
            <p className="text-sm text-slate-text">Administra las cuentas vinculadas y conecta nuevas cuentas de almacenamiento.</p>
          </div>
        </div>

        {cargando && <p role="status" className="text-sm text-slate-text">Cargando cuentas…</p>}
        {!cargando && error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {aviso && <p role="status" className="text-sm text-emerald-primary">{aviso}</p>}

        {!cargando && conexiones.length > 0 && (
          <ul className="divide-y divide-border-line/40">
            {conexiones.map((cuenta) => (
              <li key={cuenta.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-bg-dark">{ETIQUETAS_PROVEEDOR[cuenta.proveedor] || cuenta.proveedor}</p>
                  <p className="truncate text-sm text-slate-text">{cuenta.etiquetaCuenta || cuenta.urlServidor || "Cuenta de almacenamiento"}</p>
                  <p className="mt-1 text-xs text-slate-text">{ETIQUETAS_ESTADO[cuenta.estado] || cuenta.estado}</p>
                </div>
                <div className="flex items-center gap-2">
                  {cuenta.proveedor === "GOOGLE_DRIVE" && (
                    <a
                      href="https://drive.google.com/drive/u/0/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"
                    >
                      Abrir Drive
                      <ExternalLink className="h-4 w-4 text-emerald-primary" aria-hidden="true" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => alDesconectar(cuenta)}
                    disabled={cuentaDesconectando === cuenta.id}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-line/60 px-3 text-sm text-slate-text hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    <Unplug className="h-4 w-4" aria-hidden="true" />
                    {cuentaDesconectando === cuenta.id ? "Desconectando…" : "Desconectar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!cargando && conexiones.length === 0 && !error && (
          <p className="text-sm text-slate-text">No hay cuentas conectadas. Conecta una para empezar.</p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-border-line/40 pt-4">
          {PROVEEDORES.map((proveedor) => (
            <button
              key={proveedor.id}
              type="button"
              onClick={() => alIniciar(proveedor)}
              disabled={proveedorIniciando !== null}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-line/60 px-4 py-2 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5 disabled:opacity-50"
            >
              <Cloud className="h-4 w-4" aria-hidden="true" />
              {proveedorIniciando === proveedor.id ? "Conectando…" : proveedor.etiqueta}
            </button>
          ))}
          <button
            type="button"
            onClick={() => (nextcloudAbierto ? alCerrarNextcloud() : alAbrirNextcloud())}
            aria-expanded={nextcloudAbierto}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-line/60 px-4 py-2 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"
          >
            <Cloud className="h-4 w-4" aria-hidden="true" />
            {nextcloudAbierto ? "Cerrar Nextcloud" : "Conectar Nextcloud"}
          </button>
        </div>
      </Card>

      <ModalGoogleDrive
        abierto={modalDriveAbierto}
        alCerrar={() => setModalDriveAbierto(false)}
        cuenta={cuentaSeleccionadaDrive}
      />
    </>
  );
}
