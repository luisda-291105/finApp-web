/**
 * @uso        Modal de cuenta (portal) con las CUATRO formas de cierre (spec 010): «X» superior,
 *             Esc, toque/clic fuera y deslizar hacia abajo (solo móvil)
 * @funciones  DashboardUserModal({ abierto, alCerrar, triggerRef })
 * @datos      Header con nombre dinámico del usuario activo o «Cuenta de Usuario Demo», correo
 *             «No registrado» de solo lectura, profile → Configuración, logout → /
 * @eventos    clic en overlay, Esc (useCierreConEsc), gesto (useDeslizarParaCerrar) → alCerrar;
 *             clic en slots → navegación + alCerrar; al cerrar, la devolución de foco se delega en
 *             `useRetornoDeFoco` (transición abierta → cerrada)
 * @estados    abierto (controlado desde padre DashboardLayout). La guarda de «estuvo abierto», la
 *             captura del elemento activo y la cadena validada viven en `useRetornoDeFoco`; su
 *             respaldo se resuelve por versión de vista vía `useBreakpoint` (móvil → botón «Menú»;
 *             ≥768px → control de la navegación lateral)
 * @usadoPor   DashboardLayout (global, portal)
 */
import { useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { BotonCerrar } from "../ui/BotonCerrar";
import { useCierreConEsc } from "../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../hooks/useRetornoDeFoco";
import { useUsuarioActivo } from "../../context/UsuarioActivoContext";

/**
 * Opciones REALES de `focus-trap` (spec 010 §2.2). `allowOutsideClick: true` hace efectivo el
 * clic exterior (la trampa no cancela ni consume el evento) SIN desactivarse; `escapeDeactivates:
 * false` deja Esc al único manejador común (`useCierreConEsc`); el foco inicial va al contenedor
 * del diálogo y el retorno de foco es manual (`returnFocusOnDeactivate: false`).
 * Solo se pasan opciones existentes de la API: no se desactiva la trampa con el clic exterior.
 */
function crearOpcionesTrampa(refPanel) {
  return {
    allowOutsideClick: true,
    escapeDeactivates: false,
    initialFocus: () => refPanel.current,
    returnFocusOnDeactivate: false,
  };
}

/**
 * DashboardUserModal
 * - Cuatro formas de cierre: «X» superior (`BotonCerrar`), Esc (mecanismo único por capa),
 *   toque/clic fuera (overlay con guarda de destino) y deslizar hacia abajo solo en móvil.
 * - Una sola trampa de foco (la del panel) y **un solo** control visible de cierre; el foco
 *   inicial va al contenedor del diálogo (`tabIndex={-1}`, fuera del ciclo de Tab).
 * - Devolución de foco delegada en la regla común `useRetornoDeFoco` (plan §2.3-M4): captura
 *   incondicional al abrir, guarda de transición abierta → cerrada, cadena validada con
 *   comprobación del resultado —disparador conectado → elemento previo conectado → respaldo— y
 *   respaldo **por versión de vista** (móvil → botón «Menú»; ≥768px → control de la navegación
 *   lateral); nunca termina en `body`.
 * - Header con el nombre del usuario activo («Cuenta de Usuario Demo» si no existe) y el correo
 *   «No registrado» de solo lectura; botón Configuración (navega a /dashboard/configuracion) y
 *   botón Salir del demo (navega a / con replace).
 * @param {Object} props
 * @param {boolean} props.abierto - Visibilidad del modal
 * @param {() => void} props.alCerrar - Callback de cierre
 * @param {React.RefObject<HTMLElement>} [props.triggerRef] - Ref al elemento trigger (avatar) para retorno de foco
 */
export default function DashboardUserModal({ abierto, alCerrar, triggerRef }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const focusTrapRef = useRef(null);
  const { usuario } = useUsuarioActivo();

  // Esc: mecanismo único compartido; la capa del modal es la del panel (60)
  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar });

  // Gesto de deslizar hacia abajo (solo móvil, con punteros nativos)
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar });

  // Devolución de foco: regla común de las superficies modales (spec 011, RF-06/RF-09). La captura
  // incondicional al abrir, la guarda de transición abierta → cerrada y la cadena validada —con
  // comprobación del resultado de cada intento de foco— viven en la pieza compartida; su respaldo se
  // resuelve por versión de vista (`useBreakpoint`): móvil → botón «Menú» de la navegación inferior;
  // ≥768px → control de la navegación lateral.
  useRetornoDeFoco({ activo: abierto, triggerRef });

  if (!abierto) return null;

  const handleConfiguracion = () => {
    navigate("/dashboard/configuracion");
    alCerrar();
  };

  const handleSalirDemo = () => {
    navigate("/", { replace: true });
    alCerrar();
  };

  const handleOverlayClick = (event) => {
    // Solo cerrar si el click es directamente en el overlay (no en el panel)
    if (event.target === event.currentTarget) {
      alCerrar();
    }
  };

  const modalContent = (
    <FocusTrap
      ref={focusTrapRef}
      focusTrapOptions={crearOpcionesTrampa(panelRef)}
    >
      <motion.div
        ref={panelRef}
        id="dashboard-user-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
        tabIndex={-1}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm max-h-[85vh] overflow-y-auto outline-none bg-bg-cream/95 glass-surface border border-border-line/30 rounded-2xl shadow-xl z-60"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header con el único control visible de cierre */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-border-line/30">
          <h2 id="user-modal-title" className="font-display text-lg font-semibold text-bg-dark">
            {usuario?.nombre || "Cuenta de Usuario Demo"}
          </h2>
          <BotonCerrar
            ariaLabel="Cerrar Cuenta"
            alCerrar={alCerrar}
            className="text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
          />
        </header>

        {/* Correo de solo lectura (se gestionará con el registro de fuentes) */}
        <div className="px-5 py-3 border-b border-border-line/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-text">Correo</p>
          <p className="text-sm text-bg-dark">No registrado</p>
        </div>

        {/* Profile: Configuración */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={handleConfiguracion}
            className="flex items-center gap-3 w-full px-4 py-3 text-left text-bg-dark hover:bg-emerald-primary/10 rounded-xl transition-colors"
          >
            <Settings className="flex-shrink-0 w-6 h-6 text-emerald-primary" aria-hidden="true" />
            <span className="font-medium">Configuración</span>
          </button>
        </div>

        {/* Separador */}
        <hr className="border-border-line/30 mx-4" />

        {/* Logout: Salir del demo */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={handleSalirDemo}
            className="flex items-center gap-3 w-full px-4 py-3 text-left text-bg-dark hover:bg-emerald-primary/10 rounded-xl transition-colors"
          >
            <LogOut className="flex-shrink-0 w-6 h-6 text-emerald-primary" aria-hidden="true" />
            <span className="font-medium">Salir del demo</span>
          </button>
        </div>
      </motion.div>
    </FocusTrap>
  );

  return createPortal(
    <>
      {/* Overlay: cierra el modal al tocar/clicar fuera (allowOutsideClick deja pasar el evento) */}
      <div
        className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      {/* Panel con AnimatePresence para animación de salida */}
      <AnimatePresence>
        {modalContent}
      </AnimatePresence>
    </>,
    document.body
  );
}
