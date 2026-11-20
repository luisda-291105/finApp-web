/**
 * @uso        Aviso de permiso ampliado o de conexión revocada en la vista Papelera
 * @funciones  AvisoPermisoPapelera({ cuentaId, email, requiereReconexion, autorizando, alAutorizar })
 * @datos      Cuenta y motivo; no altera los correos de la cuenta
 * @eventos    Autorizar el permiso ampliado (gmail.modify) o ir a reconectar la cuenta
 * @estados    Ninguno propio; la autorización en curso llega por props
 * @usadoPor   PapeleraCorreosModal
 */
import { Link } from "react-router-dom";
import { KeyRound, RefreshCw } from "lucide-react";

/** Explica por qué la cuenta no puede gestionar su papelera y ofrece la acción adecuada. */
export default function AvisoPermisoPapelera({
  cuentaId,
  email,
  requiereReconexion = false,
  autorizando = false,
  alAutorizar,
}) {
  const nombreCuenta = email || "esta cuenta";
  if (requiereReconexion) {
    return (
      <div
        role="status"
        className="space-y-2 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-900"
      >
        <p className="flex items-start gap-2">
          <RefreshCw aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            La conexión de {nombreCuenta} fue revocada o expiró. Vuelve a conectar
            la cuenta para ver su papelera.
          </span>
        </p>
        <Link
          to="/dashboard/configuracion"
          className="inline-flex min-h-10 items-center rounded-lg border border-amber-400 px-4 text-sm font-medium text-amber-900"
        >
          Ir a Configuración
        </Link>
      </div>
    );
  }
  return (
    <div
      role="status"
      className="space-y-2 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p className="flex items-start gap-2">
        <KeyRound aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          FinApp necesita permiso para modificar tus correos de {nombreCuenta},
          además de leerlos, para gestionar su papelera. Autorízalo para ver y
          restaurar correos de esta cuenta.
        </span>
      </p>
      <button
        type="button"
        onClick={() => alAutorizar?.(cuentaId)}
        disabled={autorizando}
        className="inline-flex min-h-10 items-center rounded-lg bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {autorizando ? "Autorizando..." : "Autorizar permiso"}
      </button>
    </div>
  );
}
