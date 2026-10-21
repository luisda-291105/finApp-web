/**
 * @uso        Barra de navegación inferior para móvil (4 controles en móvil estándar: 3 ítems + «Menú»; 5 controles entre 470px y 750px con el 4.º ítem del sidebar: Contactos)
 * @funciones  BottomNav({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef })
 * @datos      Recibe itemActivo (ruta activa), alNavegar (callback navegación), alAbrirMenu (callback menú)
 * @eventos    click en ítems de navegación → alNavegar(ruta), click en «Menú» → alAbrirMenu()
 * @estados    mostrarExtra (boolean, según ancho de pantalla 470px a 750px)
 * @usadoPor   DashboardLayout (navegación inferior de móvil)
 */

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import {
  Home,
  Receipt,
  CreditCard,
  Contact,
  MoreHorizontal,
} from "lucide-react";

const itemsBase = [
  { ruta: "/dashboard", etiqueta: "Inicio", icono: Home },
  { ruta: "/dashboard/transacciones", etiqueta: "Transacciones", icono: Receipt },
  { ruta: "/dashboard/tarjetas", etiqueta: "Tarjetas", icono: CreditCard },
];

/** 4.º ítem proveniente del sidebar, mostrado en pantalla de 470px a 750px */
const itemSidebarExtra = {
  ruta: "/dashboard/contactos",
  etiqueta: "Contactos",
  icono: Contact,
};

function verificarRangoPantalla() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 470 && window.innerWidth <= 750;
}

/**
 * BottomNav
 * Barra de navegación inferior fija para móvil.
 * Por defecto muestra 4 controles (3 ítems de navegación + botón «Menú»).
 * En el rango de pantalla entre 470px y 750px, muestra un 4.º ítem del sidebar («Contactos»)
 * totalizando 5 controles equidistantes (4 navegación + «Menú»).
 * Incluye safe-area (safe-bottom), indicador activo en el item seleccionado,
 * y media query landscape que oculta las etiquetas.
 *
 * @param {Object} props
 * @param {string} props.itemActivo - Ruta actualmente activa (ej: "/dashboard/transacciones")
 * @param {(ruta: string) => void} props.alNavegar - Callback al hacer click en los ítems de navegación
 * @param {() => void} props.alAbrirMenu - Callback al hacer click en «Menú»
 * @param {React.RefObject<HTMLElement>} [props.menuTriggerRef] - Ref opcional para el botón «Menú», usado para focus trap return
 */
export default function BottomNav({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef }) {
  const [mostrarExtra, setMostrarExtra] = useState(verificarRangoPantalla);

  useEffect(() => {
    const alRedimensionar = () => {
      setMostrarExtra(verificarRangoPantalla());
    };

    window.addEventListener("resize", alRedimensionar);
    alRedimensionar();

    return () => {
      window.removeEventListener("resize", alRedimensionar);
    };
  }, []);

  const itemsVisibles = mostrarExtra ? [...itemsBase, itemSidebarExtra] : itemsBase;

  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50 bg-bg-dark/80 glass-surface border-t border-border-line/20 safe-bottom grid",
        mostrarExtra ? "grid-cols-5" : "grid-cols-4"
      )}
      role="navigation"
      aria-label="Navegación principal móvil"
    >
      {itemsVisibles.map(({ ruta, etiqueta, icono: Icono }) => (
        <button
          key={ruta}
          type="button"
          onClick={() => alNavegar(ruta)}
          className={clsx(
            "flex flex-col items-center gap-1 px-2 py-2 min-w-0 relative",
            ruta === itemActivo
              ? "text-mint-accent"
              : "text-bg-cream hover:text-mint-accent"
          )}
          aria-current={ruta === itemActivo ? "page" : undefined}
        >
          <Icono className="flex-shrink-0 w-6 h-6" aria-hidden="true" />
          <span className="text-xs font-medium truncate bottom-nav-label">
            {etiqueta}
          </span>
          {ruta === itemActivo && (
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-mint-accent rounded-full"
              aria-hidden="true"
            />
          )}
        </button>
      ))}

      {/* Control: Menú */}
      <button
        type="button"
        ref={menuTriggerRef}
        onClick={alAbrirMenu}
        className={clsx(
          "flex flex-col items-center gap-1 px-2 py-2 min-w-0 relative",
          "text-bg-cream hover:text-mint-accent"
        )}
        aria-label="Abrir menú"
      >
        <MoreHorizontal className="flex-shrink-0 w-6 h-6" aria-hidden="true" />
        <span className="text-xs font-medium truncate bottom-nav-label">Menú</span>
      </button>
    </nav>
  );
}