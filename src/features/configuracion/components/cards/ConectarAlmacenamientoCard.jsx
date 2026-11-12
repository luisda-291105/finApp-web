/**
 * @uso        Bloque de Configuración para conectar cuentas de almacenamiento en la nube
 * @funciones  ConectarAlmacenamientoCard({ nextcloudAbierto, alAbrirNextcloud, alCerrarNextcloud })
 * @datos      Inicia OAuth vía almacenamientoServicio.iniciarConexion y Nextcloud vía conectarNextcloud
 * @eventos    Redirección al proveedor y conexión directa de Nextcloud
 * @estados    proveedorIniciando, nextcloudAbierto, camposNextcloud, conectandoNextcloud, error, aviso
 * @usadoPor   ConfiguracionPage
 */
import { useState } from "react";
import { Cloud, HardDrive } from "lucide-react";
import { Card } from "../../../../components/ui";
import { conectarGoogleDrive, conectarNextcloud, iniciarConexion } from "../../../almacenamiento/services/almacenamientoServicio";

const PROVEEDORES = [
  { id: "GOOGLE_DRIVE", etiqueta: "Conectar Google Drive", accion: conectarGoogleDrive },
  { id: "ONEDRIVE", etiqueta: "Conectar OneDrive", accion: () => iniciarConexion("ONEDRIVE") },
];

export default function ConectarAlmacenamientoCard({ nextcloudAbierto, alAbrirNextcloud, alCerrarNextcloud }) {
  const [proveedorIniciando, setProveedorIniciando] = useState(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const alIniciar = async (proveedor) => {
    setProveedorIniciando(proveedor.id);
    setError("");
    setAviso("");
    try {
      await proveedor.accion();
      setAviso(`Cuenta ${proveedor.etiqueta.replace("Conectar ", "")} conectada. Revísala en Almacenamiento.`);
      setProveedorIniciando(null);
    } catch (errorConexion) {
      setError(errorConexion?.message || "No se pudo iniciar la conexión. Inténtalo de nuevo.");
      setProveedorIniciando(null);
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <HardDrive className="h-5 w-5 text-emerald-primary" aria-hidden="true" />
        <div>
          <h2 className="font-display text-lg font-semibold text-bg-dark">Conectar almacenamiento</h2>
          <p className="text-sm text-slate-text">Vincula tus cuentas de Google Drive, OneDrive y Nextcloud. Las gestiona después desde Almacenamiento.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {PROVEEDORES.map((proveedor) => (
          <button key={proveedor.id} type="button" onClick={() => alIniciar(proveedor)} disabled={proveedorIniciando !== null}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-line/60 px-4 py-2 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5 disabled:opacity-50">
            <Cloud className="h-4 w-4" aria-hidden="true" />
            {proveedorIniciando === proveedor.id ? "Conectando…" : proveedor.etiqueta}
          </button>
        ))}
        <button type="button" onClick={() => (nextcloudAbierto ? alCerrarNextcloud() : alAbrirNextcloud())}
          aria-expanded={nextcloudAbierto}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-line/60 px-4 py-2 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5">
          <Cloud className="h-4 w-4" aria-hidden="true" />
          {nextcloudAbierto ? "Cerrar Nextcloud" : "Conectar Nextcloud"}
        </button>
      </div>

      {aviso && <p role="status" className="text-sm text-emerald-primary">{aviso}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </Card>
  );
}
