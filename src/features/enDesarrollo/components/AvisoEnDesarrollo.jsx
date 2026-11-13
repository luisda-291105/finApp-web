/**
 * @uso        Aviso informativo para secciones en creación o mantenimiento
 * @funciones  AvisoEnDesarrollo({ titulo, mensaje, className })
 * @datos      Recibe textos opcionales para personalizar el aviso
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Páginas de otros features que necesitan indicar trabajo en curso sin bloquear su uso
 */
import { Construction } from "lucide-react";

export default function AvisoEnDesarrollo({
  titulo = "Sección en desarrollo",
  mensaje = "Esta sección está en creación o mantenimiento. Algunas funciones pueden cambiar, pero puedes seguir utilizándola.",
  className = "",
}) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-2xl border border-emerald-primary/20 bg-emerald-primary/5 px-4 py-3 text-sm text-bg-dark ${className}`.trim()}
    >
      <Construction className="mt-0.5 h-4 w-4 shrink-0 text-emerald-primary" aria-hidden="true" />
      <div>
        <p className="font-medium">{titulo}</p>
        <p className="mt-0.5 text-slate-text">{mensaje}</p>
      </div>
    </div>
  );
}
