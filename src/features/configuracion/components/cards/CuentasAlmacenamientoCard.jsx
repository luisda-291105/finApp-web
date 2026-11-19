/**
 * @uso        Sección de Configuración para gestionar cuentas de almacenamiento conectadas
 * @funciones  CuentasAlmacenamientoCard({ nextcloudAbierto, alAbrirNextcloud, alCerrarNextcloud })
 * @datos      Obtiene y actualiza conexiones mediante almacenamientoServicio
 * @eventos    Conectar nuevas cuentas, abrir Google Drive, reconectar, desconectar cuentas y minimizar/expandir el bloque
 * @estados    conexiones, cargando, error, aviso, proveedorIniciando, cuentaDesconectando, cuentaReconectando, modalDriveAbierto, cuentaSeleccionadaDrive, abierto
 * @usadoPor   ConfiguracionPage
 */
import { useCallback, useEffect, useState } from "react";
import {
  Cloud,
  ExternalLink,
  HardDrive,
  ChevronRight,
  RefreshCcw,
  Unplug,
} from "lucide-react";
import { Card } from "../../../../components/ui";
import useMinimizadoPersistente from "../../../../hooks/useMinimizadoPersistente";
import {
  conectarGoogleDrive,
  desconectarCuenta,
  iniciarConexion,
  obtenerConexiones,
} from "../../../almacenamiento/services/almacenamientoServicio";
import ModalGoogleDrive from "../../../almacenamiento/components/modals/ModalGoogleDrive";

const PROVEEDORES = [
  {
    id: "GOOGLE_DRIVE",
    etiqueta: "Conectar Google Drive",
    accion: conectarGoogleDrive,
  },
  {
    id: "ONEDRIVE",
    etiqueta: "Conectar OneDrive",
    accion: () => iniciarConexion("ONEDRIVE"),
  },
];
const ETIQUETAS_PROVEEDOR = {
  GOOGLE_DRIVE: "Google Drive",
  ONEDRIVE: "OneDrive",
  NEXTCLOUD: "Nextcloud",
};
const ETIQUETAS_ESTADO = {
  ACTIVA: "Conectada",
  REQUIERE_RECONEXION: "Requiere reconexión",
  DESCONECTADA: "Desconectada",
};
const CLASES_ESTADO = {
  ACTIVA: "bg-emerald-primary/10 text-emerald-primary",
  REQUIERE_RECONEXION: "bg-amber-500/10 text-amber-700",
  DESCONECTADA: "bg-slate-500/10 text-slate-600",
};

export default function CuentasAlmacenamientoCard({
  nextcloudAbierto,
  alAbrirNextcloud,
  alCerrarNextcloud,
}) {
  const [conexiones, setConexiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [proveedorIniciando, setProveedorIniciando] = useState(null);
  const [cuentaDesconectando, setCuentaDesconectando] = useState(null);
  const [cuentaReconectando, setCuentaReconectando] = useState(null);
  const [modalDriveAbierto, setModalDriveAbierto] = useState(false);
  const [cuentaSeleccionadaDrive, setCuentaSeleccionadaDrive] = useState(null);
  // Persistido en localStorage: la tarjeta recuerda si quedó minimizada al recargar.
  const [minimizadaAlmacenamiento, alternarAlmacenamiento] =
    useMinimizadoPersistente("almacenamientoMinimizada", false);
  const abierto = !minimizadaAlmacenamiento;

  const cargarConexiones = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setConexiones(await obtenerConexiones());
    } catch {
      setError(
        "No se pudieron cargar las cuentas. Inténtalo de nuevo más tarde.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarConexiones();
  }, [cargarConexiones]);

  const alIniciar = async (proveedor) => {
    setProveedorIniciando(proveedor.id);
    setError("");
    setAviso("");
    try {
      await proveedor.accion();
      setAviso(
        `Cuenta ${proveedor.etiqueta.replace("Conectar ", "")} conectada.`,
      );
      await cargarConexiones();
    } catch (errorConexion) {
      setError(
        errorConexion?.message ||
          "No se pudo iniciar la conexión. Inténtalo de nuevo.",
      );
    } finally {
      setProveedorIniciando(null);
    }
  };

  const alDesconectar = async (cuenta) => {
    setCuentaDesconectando(cuenta.id);
    setError("");
    setAviso("");
    try {
      await desconectarCuenta(cuenta.id);
      await cargarConexiones();
    } catch {
      setError("No se pudo desconectar la cuenta. Inténtalo de nuevo.");
    } finally {
      setCuentaDesconectando(null);
    }
  };

  const alReconectar = async (cuenta) => {
    setCuentaReconectando(cuenta.id);
    setError("");
    setAviso("");
    try {
      if (cuenta.proveedor === "GOOGLE_DRIVE") await conectarGoogleDrive();
      else if (cuenta.proveedor === "ONEDRIVE")
        await iniciarConexion("ONEDRIVE");
      else throw new Error("Reconecta esta cuenta desde su proveedor.");
      setAviso(
        "Cuenta reconectada. Si se actualizó el alcance, ya puedes acceder a tus archivos.",
      );
      await cargarConexiones();
    } catch (errorConexion) {
      setError(
        errorConexion?.message ||
          "No se pudo reconectar la cuenta. Inténtalo de nuevo.",
      );
    } finally {
      setCuentaReconectando(null);
    }
  };

  return (
    <>
      <Card className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <HardDrive
              className="h-5 w-5 shrink-0 text-emerald-primary"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h2
                id="cuentas-almacenamiento-titulo"
                className="font-display text-lg font-semibold text-bg-dark"
              >
                Cuentas de almacenamiento conectadas
              </h2>
              {abierto && (
                <p className="text-sm text-slate-text">
                  Administra las cuentas vinculadas y conecta nuevas cuentas
                  de almacenamiento.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-expanded={abierto}
            aria-controls="cuentas-almacenamiento-contenido"
            onClick={() => alternarAlmacenamiento()}
            aria-label={`${abierto ? "Minimizar" : "Expandir"} cuentas de almacenamiento`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-text transition-colors hover:bg-bg-cream/60 hover:text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
          >
            <ChevronRight
              aria-hidden="true"
              className={`h-5 w-5 transition-transform ${abierto ? "rotate-90" : ""}`}
            />
          </button>
        </div>

        <div
          id="cuentas-almacenamiento-contenido"
          hidden={!abierto}
          className="space-y-3"
        >
          {cargando && (
            <p role="status" className="text-sm text-slate-text">
              Cargando cuentas…
            </p>
          )}
          {!cargando && error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          {aviso && (
            <p role="status" className="text-sm text-emerald-primary">
              {aviso}
            </p>
          )}

          {!cargando && conexiones.length > 0 && (
            <ul className="divide-y divide-border-line/40">
              {conexiones.map((cuenta) => (
                <li
                  key={cuenta.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-bg-dark">
                      {ETIQUETAS_PROVEEDOR[cuenta.proveedor] ||
                        cuenta.proveedor}
                    </p>
                    <p className="truncate text-sm text-slate-text">
                      {cuenta.etiquetaCuenta ||
                        cuenta.urlServidor ||
                        "Cuenta de almacenamiento"}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${CLASES_ESTADO[cuenta.estado] || CLASES_ESTADO.DESCONECTADA}`}
                    >
                      {ETIQUETAS_ESTADO[cuenta.estado] || cuenta.estado}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {cuenta.proveedor === "GOOGLE_DRIVE" && (
                      <button
                        type="button"
                        onClick={() => {
                          setCuentaSeleccionadaDrive(cuenta);
                          setModalDriveAbierto(true);
                        }}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border-line/60 px-3 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"
                      >
                        Ver Drive
                        <ExternalLink
                          className="h-4 w-4 text-emerald-primary"
                          aria-hidden="true"
                        />
                      </button>
                    )}
                    {cuenta.estado === "REQUIERE_RECONEXION" &&
                      (cuenta.proveedor === "GOOGLE_DRIVE" ||
                        cuenta.proveedor === "ONEDRIVE") && (
                        <button
                          type="button"
                          onClick={() => alReconectar(cuenta)}
                          disabled={cuentaReconectando === cuenta.id}
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 text-sm font-medium text-amber-800 hover:bg-amber-500/20 disabled:opacity-50"
                        >
                          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                          {cuentaReconectando === cuenta.id
                            ? "Reconectando…"
                            : "Reconectar"}
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => alDesconectar(cuenta)}
                      disabled={cuentaDesconectando === cuenta.id}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-line/60 px-3 text-sm text-slate-text hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                      <Unplug className="h-4 w-4" aria-hidden="true" />
                      {cuentaDesconectando === cuenta.id
                        ? "Desconectando…"
                        : "Desconectar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!cargando && !error && (
            <p className="text-xs text-slate-text">
              Si se actualizó el alcance de Google Drive, reconecta la cuenta
              para autorizar los nuevos permisos.
            </p>
          )}

          {!cargando && conexiones.length === 0 && !error && (
            <p className="text-sm text-slate-text">
              No hay cuentas conectadas. Conecta una para empezar.
            </p>
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
                {proveedorIniciando === proveedor.id
                  ? "Conectando…"
                  : proveedor.etiqueta}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                nextcloudAbierto ? alCerrarNextcloud() : alAbrirNextcloud()
              }
              aria-expanded={nextcloudAbierto}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-line/60 px-4 py-2 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5"
            >
              <Cloud className="h-4 w-4" aria-hidden="true" />
              {nextcloudAbierto ? "Cerrar Nextcloud" : "Conectar Nextcloud"}
            </button>
          </div>
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
