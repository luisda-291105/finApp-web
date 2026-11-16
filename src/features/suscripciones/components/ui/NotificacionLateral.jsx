/**
 * @uso        Notificación lateral apilable (éxito, fallo o advertencia) con cierre por X y Esc
 * @funciones  NotificacionLateral({ tipo, mensaje, alCerrar, cerrarConEsc })
 * @datos      Mensaje y tipo visual de la notificación
 * @eventos    Click en cerrar y tecla Escape cierran la notificación
 * @estados    Ninguno; visibilidad controlada por el consumidor
 * @usadoPor   PilaNotificacionesLaterales en suscripciones
 */
import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, X } from "lucide-react";

const ESTILOS = {
  error: {
    contenedor: "border-red-300/60 bg-red-50 text-red-800",
    boton: "text-red-700 hover:bg-red-100 focus-visible:ring-red-400",
    Icono: CircleAlert,
    etiquetaCerrar: "Cerrar notificación de error",
  },
  advertencia: {
    contenedor: "border-amber-300/60 bg-amber-50 text-amber-900",
    boton: "text-amber-800 hover:bg-amber-100 focus-visible:ring-amber-400",
    Icono: AlertTriangle,
    etiquetaCerrar: "Cerrar notificación de advertencia",
  },
  exito: {
    contenedor: "border-emerald-300/60 bg-emerald-50 text-emerald-800",
    boton: "text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-400",
    Icono: CheckCircle2,
    etiquetaCerrar: "Cerrar notificación de éxito",
  },
};

/** Muestra una notificación apilable en el lado derecho con métodos de cierre. */
export default function NotificacionLateral({ tipo = "error", mensaje, alCerrar, cerrarConEsc = true }) {
  useEffect(() => {
    if (!mensaje || !cerrarConEsc) return undefined;
    const manejarTecla = (evento) => {
      if (evento.key === "Escape") alCerrar?.();
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [mensaje, alCerrar, cerrarConEsc]);

  if (!mensaje) return null;
  const estilo = ESTILOS[tipo] || ESTILOS.error;
  const { Icono } = estilo;

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-3 text-sm shadow-lg ${estilo.contenedor}`}
    >
      <Icono className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 break-words">{mensaje}</p>
      <button
        type="button"
        onClick={alCerrar}
        aria-label={estilo.etiquetaCerrar}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 ${estilo.boton}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
