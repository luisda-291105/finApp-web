/**
 * @uso        Contenedor fijo lateral derecho para apilar notificaciones
 * @funciones  PilaNotificacionesLaterales({ children })
 * @datos      Recibe notificaciones como hijos
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   SuscripcionesPage y vistas que muestran notificaciones apiladas
 */

/** Apila notificaciones en el lado derecho, una encima de otra. */
export default function PilaNotificacionesLaterales({ children }) {
  if (!children) return null;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-[1150] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:top-24"
    >
      {children}
    </div>
  );
}
