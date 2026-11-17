/**
 * @uso        Barra de navegación inferior para móvil (4 controles estándar; 5 entre 470px y 750px con Contactos)
 * @funciones  BottomNav({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef, menuAbierto, alCerrarMenu })
 * @datos      Recibe itemActivo (ruta activa), alNavegar (callback navegación), alAbrirMenu/alCerrarMenu (callbacks menú), menuAbierto (estado)
 * @eventos    click en ítems de navegación → alNavegar(ruta), click en «Menú» → alAbrirMenu() o alCerrarMenu() según menuAbierto
 * @estados    mostrarExtra (boolean, según ancho de pantalla 470px a 750px)
 * @usadoPor   DashboardLayout (navegación inferior de móvil)
 */

import { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import {
  Home,
  CreditCard,
  Contact,
  Wallet,
  MoreHorizontal,
} from "lucide-react";

const itemsBase = [
  { ruta: "/dashboard", etiqueta: "Inicio", icono: Home },
  { ruta: "/dashboard/contabilidad", etiqueta: "Contabilidad", icono: Wallet },
  { ruta: "/dashboard/tarjetas", etiqueta: "Tarjetas", icono: CreditCard },
];

/** Enlace de contabilidad mostrado como 4.º ítem entre 470px y 750px */
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
 * En el rango de pantalla entre 470px y 750px, muestra un 4.º ítem («Contactos»)
 * totalizando 5 controles equidistantes (4 navegación + «Menú»).
 * Incluye safe-area (safe-bottom), indicador activo en el item seleccionado,
 * y media query landscape que oculta las etiquetas.
 *
 * @param {Object} props
 * @param {string} props.itemActivo - Ruta actualmente activa (ej: "/dashboard/contabilidad")
 * @param {(ruta: string) => void} props.alNavegar - Callback al hacer click en los ítems de navegación
 * @param {() => void} props.alAbrirMenu - Callback al hacer click en «Menú» para abrir
 * @param {React.RefObject<HTMLElement>} [props.menuTriggerRef] - Ref opcional para el botón «Menú», usado para focus trap return
 * @param {boolean} [props.menuAbierto] - Indica si el menú superpuesto está abierto
 * @param {() => void} [props.alCerrarMenu] - Callback para cerrar el menú cuando está abierto
 */
export default function BottomNav({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef, menuAbierto = false, alCerrarMenu }) {
  const [mostrarExtra, setMostrarExtra] = useState(verificarRangoPantalla);
  const navRef = useRef(null);

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

  /* Publica la altura real de la barra (incluye safe-bottom) para que los modales
     móviles se anclen justo en su borde superior (var --bottom-nav-alto). */
  useEffect(() => {
    const publicarAlto = () => {
      document.documentElement.style.setProperty(
        "--bottom-nav-alto",
        `${navRef.current?.offsetHeight ?? 0}px`,
      );
    };
    publicarAlto();
    window.addEventListener("resize", publicarAlto);
    return () => {
      window.removeEventListener("resize", publicarAlto);
      document.documentElement.style.removeProperty("--bottom-nav-alto");
    };
  }, []);

  const itemsVisibles = mostrarExtra ? [...itemsBase, itemSidebarExtra] : itemsBase;

  return (
    <nav
      ref={navRef}
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-[2100] bg-bg-dark/80 glass-surface border-t border-border-line/20 safe-bottom grid",
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
        onClick={menuAbierto ? (alCerrarMenu ?? alAbrirMenu) : alAbrirMenu}
        className={clsx(
          "flex flex-col items-center gap-1 px-2 py-2 min-w-0 relative",
          "text-bg-cream hover:text-mint-accent"
        )}
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
      >
        <MoreHorizontal className="flex-shrink-0 w-6 h-6" aria-hidden="true" />
        <span className="text-xs font-medium truncate bottom-nav-label">{menuAbierto ? "Cerrar" : "Menú"}</span>
      </button>
    </nav>
  );
}
