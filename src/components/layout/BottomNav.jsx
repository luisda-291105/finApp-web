/**
 * @uso        Barra de navegación inferior para móvil (4 controles: 3 ítems de navegación + «Menú», safe-area, indicador activo, landscape)
 * @funciones  BottomNav({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef })
 * @datos      Recibe itemActivo (ruta activa), alNavegar (callback navegación), alAbrirMenu (callback menú)
 * @eventos    click en ítems 1-3 → alNavegar(ruta), click en «Menú» (4.º control) → alAbrirMenu()
 * @estados    Ninguno (componente controlado vía props)
 * @usadoPor   DashboardLayout (navegación inferior de móvil)
 */

import { clsx } from "clsx";
import {
  Home,
  Receipt,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";

const items = [
  { ruta: "/dashboard", etiqueta: "Inicio", icono: Home },
  { ruta: "/dashboard/transacciones", etiqueta: "Transacciones", icono: Receipt },
  { ruta: "/dashboard/tarjetas", etiqueta: "Tarjetas", icono: CreditCard }
];

/**
 * BottomNav
 * Barra de navegación inferior fija para móvil con 4 controles equidistantes
 * (3 ítems de navegación + botón «Menú»).
 * Incluye safe-area (safe-bottom), indicador activo en el item seleccionado,
 * y media query landscape que oculta las etiquetas.
 * @param {Object} props
 * @param {string} props.itemActivo - Ruta actualmente activa (ej: "/dashboard/transacciones")
 * @param {(ruta: string) => void} props.alNavegar - Callback al hacer click en los ítems 1-3
 * @param {() => void} props.alAbrirMenu - Callback al hacer click en «Menú» (4.º control)
 * @param {React.RefObject<HTMLElement>} [props.menuTriggerRef] - Ref opcional para el botón «Menú» (4.º control), usado para focus trap return
 */
export default function BottomNav({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-dark/80 glass-surface border-t border-border-line/20 safe-bottom grid grid-cols-4"
      role="navigation"
      aria-label="Navegación principal móvil"
    >
      {items.map(({ ruta, etiqueta, icono: Icono }) => (
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
      {/* 4.º control: Menú */}
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