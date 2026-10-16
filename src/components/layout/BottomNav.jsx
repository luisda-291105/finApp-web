/**
 * @uso        Barra de navegación inferior para móvil (5 items fijos, safe-area, indicador activo, landscape)
 * @funciones  BottomNav({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef })
 * @datos      Recibe itemActivo (ruta activa), alNavegar (callback navegación), alAbrirMenu (callback menú)
 * @eventos    click en items 1-4 → alNavegar(ruta), click item 5 (Menú) → alAbrirMenu()
 * @estados    Ninguno (componente controlado vía props)
 * @usadoPor   DashboardLayout (navegación inferior de móvil)
 */

import { clsx } from "clsx";
import {
  Home,
  Receipt,
  CreditCard,
  Settings,
  MoreHorizontal,
} from "lucide-react";

const items = [
  { ruta: "/dashboard", etiqueta: "Inicio", icono: Home },
  { ruta: "/dashboard/transacciones", etiqueta: "Transacciones", icono: Receipt },
  { ruta: "/dashboard/tarjetas", etiqueta: "Tarjetas", icono: CreditCard },
  { ruta: "/dashboard/configuracion", etiqueta: "Configuración", icono: Settings },
];

/**
 * BottomNav
 * Barra de navegación inferior fija para móvil con 5 items equidistantes.
 * Incluye safe-area (pb-safe), indicador activo en el item seleccionado,
 * y media query landscape que oculta las etiquetas.
 * @param {Object} props
 * @param {string} props.itemActivo - Ruta actualmente activa (ej: "/dashboard/transacciones")
 * @param {(ruta: string) => void} props.alNavegar - Callback al hacer click en items 1-4
 * @param {() => void} props.alAbrirMenu - Callback al hacer click en item 5 (Menú)
 * @param {React.RefObject<HTMLElement>} [props.menuTriggerRef] - Ref opcional para el botón Menú (item 5), usado para focus trap return
 */
export default function BottomNav({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-dark/80 backdrop-blur-md border-t border-border-line/20 pb-safe grid grid-cols-5"
      role="navigation"
      aria-label="Navegación principal móvil"
    >
      <style jsx>{`
        .bottom-nav-label {
          display: block;
        }
        @media (orientation: landscape) {
          .bottom-nav-label {
            display: none;
          }
        }
      `}</style>
      {items.map(({ ruta, etiqueta, icono: Icono }) => (
        <button
          key={ruta}
          type="button"
          onClick={() => alNavegar(ruta)}
          className={clsx(
            "flex flex-col items-center gap-1 px-2 py-2 min-w-0 relative",
            ruta === itemActivo
              ? "text-emerald-primary"
              : "text-slate-text hover:text-emerald-primary/70"
          )}
          aria-current={ruta === itemActivo ? "page" : undefined}
        >
          <Icono className="flex-shrink-0 w-6 h-6" aria-hidden="true" />
          <span className="text-xs font-medium truncate bottom-nav-label">
            {etiqueta}
          </span>
          {ruta === itemActivo && (
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-primary rounded-full"
              aria-hidden="true"
            />
          )}
        </button>
      ))}
      {/* Item 5: Menú */}
      <button
        type="button"
        ref={menuTriggerRef}
        onClick={alAbrirMenu}
        className={clsx(
          "flex flex-col items-center gap-1 px-2 py-2 min-w-0 relative",
          "text-slate-text hover:text-emerald-primary/70"
        )}
        aria-label="Abrir menú"
      >
        <MoreHorizontal className="flex-shrink-0 w-6 h-6" aria-hidden="true" />
        <span className="text-xs font-medium truncate bottom-nav-label">Menú</span>
      </button>
    </nav>
  );
}