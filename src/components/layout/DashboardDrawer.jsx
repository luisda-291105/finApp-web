/**
 * @uso        Menú lateral superpuesto exclusivo de móvil (portal, backdrop, focus trap)
 * @funciones  DashboardDrawer({ abierto, alCerrar, children, triggerRef })
 * @datos      Renderiza children (esperado: SidebarNavContenido) dentro de panel lateral
 * @eventos    ESC → alCerrar; click backdrop → alCerrar; focus trap Tab/Shift+Tab cicla interno
 * @estados    Recibe `abierto` controlado desde padre; sin estado propio
 * @usadoPor   DashboardLayout (menú superpuesto de móvil)
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import clsx from "clsx";

/**
 * DashboardDrawer
 * Menú lateral superpuesto de móvil: portal, backdrop, focus trap y animación de entrada.
 * La rama móvil es incondicional: el componente no bifurca por modo.
 * 
 * @param {Object} props
 * @param {boolean} props.abierto - Visibilidad del drawer
 * @param {() => void} props.alCerrar - Callback de cierre
 * @param {React.ReactNode} props.children - Contenido a renderizar (ej. SidebarNavContenido)
 * @param {React.RefObject<HTMLElement>} [props.triggerRef] - Ref al elemento trigger para retorno de foco
 */
export default function DashboardDrawer({ abierto, alCerrar, children, triggerRef }) {
  const panelRef = useRef(null);
  const focusTrapRef = useRef(null);

  // Guardar el elemento que tenía el foco antes de abrir el drawer
  const previousActiveElementRef = useRef(null);

  // Manejar cierre con teclado (ESC)
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

  // Manejar click en backdrop (solo mobile)
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      alCerrar();
    }
  };

  // Configuración común del FocusTrap
  const focusTrapOptions = {
    onActivate: () => {
      // FocusTrap enfoca automáticamente el primer elemento enfocable dentro del panel
    },
    onDeactivate: () => {
      // El retorno de foco se maneja en el useEffect de arriba
    },
    clickDeactivates: false, // No desactivar al click fuera (manejado por overlay en mobile)
    escapeDeactivates: false, // Manejado manualmente
  };

  // Panel del drawer (rama móvil incondicional: backdrop + FocusTrap + AnimatePresence + motion.div)
  const mobilePanelContent = (
    <FocusTrap
      ref={focusTrapRef}
      focusTrapOptions={focusTrapOptions}
    >
      <AnimatePresence>
        <motion.div
          ref={panelRef}
          id="dashboard-drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className={clsx(
            "fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-bg-dark/95 backdrop-blur-md border-l border-border-line/20 z-55"
          )}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </FocusTrap>
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      {/* Panel con AnimatePresence para animación de salida */}
      {mobilePanelContent}
    </>,
    document.body
  );
}