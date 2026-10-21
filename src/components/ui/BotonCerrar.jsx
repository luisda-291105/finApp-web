/**
 * @uso        Pieza compartida del control de cierre («X») de las superficies modales (spec 010)
 * @funciones  BotonCerrar({ ariaLabel, alCerrar, className })
 * @datos      ariaLabel (nombre accesible específico de la superficie) y className (clases de tono del panel, claro u oscuro)
 * @eventos    onClick → alCerrar() una sola vez
 * @estados    Ninguno
 * @usadoPor   DashboardUserModal y DashboardDrawer (spec 010, tareas 4–5). AuthModal y
 *             ModalTarjeta conservan su propia «X» con el MISMO patrón visual (RF-14),
 *             porque su aspecto heredado no se migra (DP-03)
 */

/**
 * BotonCerrar
 * - Patrón visual común de la «X»: mismo markup, mismo aspa decorativa y mismas clases
 *   base de foco en las cuatro superficies (RF-02/RF-14).
 * - El nombre accesible se recibe por props y es específico de cada superficie
 *   (por ejemplo «Cerrar Cuenta», «Cerrar menú», «Cerrar ventana de acceso»).
 * - Las clases de tono (color del icono, hover y anillo de foco) las inyecta el
 *   consumidor por `className`, con tokens de `src/styles/index.css`, para cubrir
 *   tanto paneles claros como oscuros sin hexadecimales nuevos.
 */
export function BotonCerrar({ ariaLabel, alCerrar, className = "" }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={alCerrar}
      className={
        "rounded-full p-2 focus-visible:ring-2 outline-none " + className
      }
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
