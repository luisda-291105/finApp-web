/**
 * @uso        Contenido compartido de navegación: 6 enlaces y avatar → modal
 * @funciones  SidebarNavContenido({ alAbrirUserModal, colapsada, avatarSeparado })
 * @datos      6 NavLink fijos + avatar con el usuario activo de UsuarioActivoContext (nombre,
 *             iniciales derivadas y correo «No registrado»)
 * @eventos    click enlaces (navegan), click avatar → alAbrirUserModal
 * @estados    Ninguno (stateless)
 * @usadoPor   SidebarResponsive (avatar al pie), DashboardDrawer (avatar tras los enlaces)
 */

import { NavLink } from "react-router-dom";
import { Home, Receipt, CreditCard, Users, Contact, Mail } from "lucide-react";
import { useUsuarioActivo } from "../../context/UsuarioActivoContext";
import clsx from "clsx";

/** Nombre mostrado cuando no hay usuario activo con nombre. */
const NOMBRE_RESPALDO = "Cuenta de Usuario Demo";

/**
 * calcularIniciales
 * Deriva las iniciales del nombre: primera letra de las dos primeras palabras, en mayúscula.
 * Tolera acentos, espacios múltiples y nombres de una sola palabra (una sola inicial).
 * @param {string} [nombre]
 * @returns {string} Iniciales o «UD» cuando no hay nombre
 */
function calcularIniciales(nombre) {
  const palabras = String(nombre || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (palabras.length === 0) return "UD";

  return palabras
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase();
}

/**
 * SidebarNavContenido
 * Componente stateless que renderiza la navegación compartida del dashboard:
 * 6 enlaces con icono + etiqueta, separador, y avatar de usuario que abre el modal.
 * No gestiona navegación propia (delega a NavLink) ni estado.
 * Cuando `colapsada=true`, oculta las etiquetas de texto de los enlaces.
 * Con `avatarSeparado=true`, renderiza el avatar como bloque hermano de la navegación
 * para que el contenedor de escritorio pueda mantenerlo al pie.
 *
 * @param {Object} props
 * @param {() => void} props.alAbrirUserModal - Callback invocado al hacer click en el avatar
 * @param {boolean} [props.colapsada=false] - Si está colapsada, oculta etiquetas
 * @param {boolean} [props.avatarSeparado=false] - Separa el bloque del avatar de los enlaces
 */
export default function SidebarNavContenido({
  alAbrirUserModal,
  colapsada = false,
  avatarSeparado = false,
  alCerrarSidebar,
}) {
  const { usuario } = useUsuarioActivo();
  const nombreUsuario = String(usuario?.nombre || "").trim();
  const nombre = nombreUsuario || NOMBRE_RESPALDO;
  const iniciales = nombreUsuario ? calcularIniciales(nombreUsuario) : "UD";
  const correo = "No registrado";

  const enlaces = [
    { ruta: "/dashboard", icono: Home, etiqueta: "Inicio", exacto: true },
    { ruta: "/dashboard/transacciones", icono: Receipt, etiqueta: "Transacciones" },
    { ruta: "/dashboard/tarjetas", icono: CreditCard, etiqueta: "Tarjetas" },
    { ruta: "/dashboard/bolsillos", icono: Users, etiqueta: "Grupos" },
    { ruta: "/dashboard/contactos", icono: Contact, etiqueta: "Contactos" },
    { ruta: "/dashboard/correos", icono: Mail, etiqueta: "Correos" },
  ];

  const enlacesNavegacion = enlaces.map(({ ruta, icono: Icono, etiqueta, exacto }) => (
    <NavLink
      key={ruta}
      to={ruta}
      end={Boolean(exacto)}
      aria-label={etiqueta}
      onClick={() => {
        if (alCerrarSidebar) alCerrarSidebar();
      }}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-w-0 ${
          isActive
            ? "bg-emerald-primary/10 text-mint-accent font-medium"
            : "text-bg-cream/70 hover:bg-emerald-primary/5"
        }`
      }
    >
      <Icono className="flex-shrink-0 w-6 h-6" aria-hidden="true" />
      <span className={clsx("truncate min-w-0", colapsada && "hidden")}>{etiqueta}</span>
    </NavLink>
  ));

  const bloqueAvatar = (
    <button
      type="button"
      onClick={alAbrirUserModal}
      className="flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors hover:bg-emerald-primary/5"
      aria-label={`Cuenta de ${nombre}`}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-primary flex items-center justify-center text-bg-cream font-medium"
        aria-hidden="true"
      >
        {iniciales}
      </div>
      <div className={clsx("flex-1 min-w-0 truncate text-left", colapsada && "hidden")}>
        <p className="font-medium text-white truncate">{nombre}</p>
        <p className="text-xs text-bg-cream/70 truncate">{correo}</p>
      </div>
    </button>
  );

  if (avatarSeparado) {
    return (
      <>
        <nav
          className="flex flex-col flex-1 min-h-0 overflow-y-auto sidebar-scroll"
          aria-label="Navegación principal del dashboard"
        >
          {enlacesNavegacion}
        </nav>
        <div className="shrink-0">
          <hr role="separator" className="border-border-line/20 my-3" aria-hidden="true" />
          {bloqueAvatar}
        </div>
      </>
    );
  }

  return (
    <nav className="flex flex-col flex-1 min-h-0 overflow-y-auto sidebar-scroll" aria-label="Navegación principal del dashboard">
      {enlacesNavegacion}
      <hr role="separator" className="border-border-line/20 my-3" aria-hidden="true" />
      {bloqueAvatar}
    </nav>
  );
}