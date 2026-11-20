/**
 * @uso        Alerta de error flotante en el lado derecho, cerrable con X y Esc
 * @funciones  AlertaErrorLateral({ mensaje, alCerrar, visible })
 * @datos      Mensaje de error a mostrar
 * @eventos    Click en cerrar y tecla Escape cierran la alerta
 * @estados    Ninguno; visibilidad controlada por el consumidor
 * @usadoPor   Componentes de suscripciones que muestran errores
 */
import { useEffect } from "react";
import { X } from "lucide-react";

/** Muestra una notificación de error fija a la derecha con métodos de cierre. */
export default function AlertaErrorLateral({
  mensaje,
  alCerrar,
  visible = true,
}) {
  useEffect(() => {
    if (!visible || !mensaje) return undefined;
    const manejarTecla = (evento) => {
      if (evento.key === "Escape") alCerrar?.();
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [visible, mensaje, alCerrar]);

  if (!visible || !mensaje) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[1150] flex w-[calc(100%-2rem)] max-w-sm justify-end sm:top-24">
      <div
        role="alert"
        className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-red-300/60 bg-red-50 p-3 text-sm text-red-800 shadow-lg"
      >
        <p className="min-w-0 flex-1 break-words">{mensaje}</p>
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar alerta de error"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
