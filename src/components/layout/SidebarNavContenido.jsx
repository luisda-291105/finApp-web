/**
 * @uso        Contenido de navegación compartido: 4 enlaces + avatar → modal
 * @funciones  SidebarNavContenido({ alAbrirUserModal, colapsada })
 * @datos      4 NavLink fijos + avatar via getUsuarioMock()
 * @eventos    click enlaces (navegan), click avatar → alAbrirUserModal
 * @estados    Ninguno (stateless)
 * @usadoPor   SidebarResponsive (colapsada/expandida), DashboardDrawer (menú superpuesto de móvil)
 */

import { NavLink } from "react-router-dom";
import { Home, Receipt, CreditCard, Settings } from "lucide-react";
import { getUsuarioMock } from "../../config/app.config";
import clsx from "clsx";

/**
 * SidebarNavContenido
 * Componente stateless que renderiza la navegación compartida del dashboard:
 * 4 enlaces con icono + etiqueta, separador, y avatar de usuario que abre el modal.
 * No gestiona navegación propia (delega a NavLink) ni estado.
 * Cuando `colapsada=true`, oculta las etiquetas de texto de los enlaces.
 *
 * @param {Object} props
 * @param {() => void} props.alAbrirUserModal - Callback invocado al hacer click en el avatar
 * @param {boolean} [props.colapsada=false] - Si está colapsada, oculta etiquetas
 */
export default function SidebarNavContenido({ alAbrirUserModal, colapsada = false }) {
  const usuario = getUsuarioMock();

  const enlaces = [
    { ruta: "/dashboard", icono: Home, etiqueta: "Inicio", exacto: true },
    { ruta: "/dashboard/transacciones", icono: Receipt, etiqueta: "Transacciones" },
    { ruta: "/dashboard/tarjetas", icono: CreditCard, etiqueta: "Tarjetas" },
 
  ];

  return (
    <nav className="flex flex-col" aria-label="Navegación principal del dashboard">
      {/* 4 enlaces de navegación */}
      {enlaces.map(({ ruta, icono: Icono, etiqueta, exacto }) => (
        <NavLink
          key={ruta}
          to={ruta}
          end={Boolean(exacto)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-w-0 ${
              isActive
                ? "bg-emerald-primary/10 text-emerald-primary font-medium"
                : "text-slate-text hover:bg-emerald-primary/5"
            }`
          }
        >
          <Icono className="flex-shrink-0 w-6 h-6" aria-hidden="true" />
          <span className={clsx("truncate min-w-0", colapsada && "hidden")}>{etiqueta}</span>
        </NavLink>
      ))}

      {/* Separador */}
      <hr role="separator" className="border-border-line/20 my-3" aria-hidden="true" />

      {/* Avatar de usuario → abre modal */}
      <button
        type="button"
        onClick={alAbrirUserModal}
        className="flex items-center gap-3 px-3 py-2 my- rounded-lg w-full transition-colors hover:bg-emerald-primary/5"
        aria-label={`Cuenta de ${usuario.nombre}`}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-primary flex items-center justify-center text-bg-cream font-medium"
          aria-hidden="true"
        >
          {usuario.iniciales}
        </div>
        <div className={clsx("flex-1 min-w-0 truncate text-left", colapsada && "hidden")}>
          <p className="font-medium text-white truncate">{usuario.nombre}</p>
          <p className="text-xs text-slate-text truncate">{usuario.email}</p>
        </div>
      </button>
    </nav>
  );
}