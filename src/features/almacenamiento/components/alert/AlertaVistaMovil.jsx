/**
 * @uso        Aviso temporal top-right cuando se intenta cambiar de vista en móvil
 * @funciones  AlertaVistaMovil({ mensaje, alCerrar })
 * @datos      Recibe el texto del aviso; no consulta servicios
 * @eventos    Autocierre a los 4 s y cierre manual con el botón «X»
 * @estados    Ninguno; la visibilidad y el texto son controlados por el consumidor
 * @usadoPor   AlmacenamientoToolbar
 */
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

/** Aviso apilable en la esquina superior derecha; desaparece solo al cabo de unos segundos. */
export default function AlertaVistaMovil({ mensaje, alCerrar }) {
  useEffect(() => {
    if (!mensaje) return undefined;
    const temporizador = window.setTimeout(() => alCerrar?.(), 4000);
    return () => window.clearTimeout(temporizador);
  }, [mensaje, alCerrar]);

  if (!mensaje) return null;

  return (
    <div
      role="alert"
      className="fixed right-4 top-20 z-[1150] flex w-[min(calc(100vw-2rem),20rem)] items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900 shadow-lg"
    >
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 break-words">{mensaje}</p>
      <button
        type="button"
        onClick={() => alCerrar?.()}
        aria-label="Cerrar aviso"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-amber-800 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
