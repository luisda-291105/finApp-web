/**
 * @uso        Contenedor fijo lateral derecho superior para apilar alertas/notificaciones
 * @funciones  PilaNotificacionesLaterales({ children })
 * @datos      Recibe notificaciones como hijos
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Proveedor global de alertas y vistas con pila local
 */

/** Apila notificaciones en el lado derecho arriba, una encima de otra. */
export default function PilaNotificacionesLaterales({ children }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed right-4 top-20 z-[1150] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:top-24"
    >
      {children}
    </div>
  );
}
