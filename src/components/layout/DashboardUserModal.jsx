/**
 * @uso        Modal de usuario (portal) con slots fijos: Configuración + Salir del demo
 * @funciones  DashboardUserModal({ abierto, alCerrar, triggerRef })
 * @datos      Slots fijos por defecto: header "Cuenta", profile → Configuración, logout → redirect /
 * @eventos    click overlay, ESC → alCerrar; click slots → navegación + alCerrar
 * @estados    abierto (controlado desde padre DashboardLayout)
 * @usadoPor   DashboardLayout (global, portal)
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";

/**
 * DashboardUserModal
 * Modal global accesible mediante portal, con focus trap y animación Framer Motion.
 * Slots fijos: header "Cuenta", botón Configuración (navega a /dashboard/configuracion),
 * botón Salir del demo (navega a / con replace).
 * @param {Object} props
 * @param {boolean} props.abierto - Visibilidad del modal
 * @param {() => void} props.alCerrar - Callback de cierre
 * @param {React.RefObject<HTMLElement>} [props.triggerRef] - Ref al elemento trigger (avatar) para retorno de foco
 */
export default function DashboardUserModal({ abierto, alCerrar, triggerRef }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const focusTrapRef = useRef(null);

  // Guardar el elemento que tenía el foco antes de abrir el modal
  // useLayoutEffect se ejecuta sincrónicamente después de mutaciones del DOM pero antes de paint,
  // capturando el foco ANTES de que FocusTrap lo mueva al primer botón
  const previousActiveElementRef = useRef(null);

  // Manejar cierre con teclado (ESC) y focus trap
  useEffect(() => {
    if (!abierto) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        alCerrar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [abierto, alCerrar]);

  // Guardar el elemento activo ANTES de que FocusTrap actúe (useLayoutEffect = sincrónico)
  useLayoutEffect(() => {
    if (!abierto) return;
    // Solo guardar si no tenemos triggerRef (si lo tenemos, usaremos ese para retorno)
    if (!triggerRef?.current) {
      previousActiveElementRef.current = document.activeElement;
    }
  }, [abierto, triggerRef]);

  // Devolver foco al cerrar
  useEffect(() => {
    if (abierto) return; // Solo ejecutar al cerrar (cuando abierto pasa a false)

    // Devolver foco al triggerRef si existe, sino al elemento previo guardado
    if (triggerRef?.current) {
      triggerRef.current.focus();
    } else if (previousActiveElementRef.current instanceof HTMLElement) {
      previousActiveElementRef.current.focus();
    }
  }, [abierto, triggerRef]);

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
      focusTrapOptions={{
        onActivate: () => {
          // El focus-trap-react enfoca automáticamente el primer elemento enfocable
        },
        onDeactivate: () => {
          // El retorno de foco se maneja en el useEffect de arriba
        },
        clickDeactivates: false, // No desactivar al click fuera (manejado por overlay)
        escapeDeactivates: false, // Manejado manualmente
      }}
    >
      <motion.div
        ref={panelRef}
        id="dashboard-user-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-bg-cream/95 backdrop-blur-md border border-border-line/30 rounded-2xl shadow-xl z-65"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-border-line/30">
          <h2 id="user-modal-title" className="font-display text-lg font-semibold text-bg-dark">
            Cuenta
          </h2>
        </header>

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
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-60"
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