/**
 * @uso        Drawer slide-in para navegación tablet/mobile (portal, focus trap, ancho responsive)
 * @funciones  DashboardDrawer({ abierto, alCerrar, children, triggerRef })
 * @datos      Renderiza children (esperado: SidebarNavContenido) dentro de panel lateral
 * @eventos    click overlay → alCerrar; ESC → alCerrar; focus trap Tab/Shift+Tab cicla interno
 * @estados    Recibe `abierto` controlado desde padre; sin estado propio
 * @usadoPor   DashboardLayout (tablet), DashboardLayout (mobile menú)
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";
import clsx from "clsx";

/**
 * DashboardDrawer
 * Drawer lateral accesible mediante portal, con focus trap y animación CSS (transform + transition).
 * Se posiciona debajo del header fijo y ocupa 85vw con máximo 384px (max-w-sm).
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

  const handleOverlayClick = () => {
    alCerrar();
  };

  const drawerContent = (
    <FocusTrap
      ref={focusTrapRef}
      focusTrapOptions={{
        onActivate: () => {
          // FocusTrap enfoca automáticamente el primer elemento enfocable dentro del panel
        },
        onDeactivate: () => {
          // El retorno de foco se maneja en el useEffect de arriba
        },
        clickDeactivates: false, // No desactivar al click fuera (manejado por overlay)
        escapeDeactivates: false, // Manejado manualmente
      }}
    >
      <div
        ref={panelRef}
        id="dashboard-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navegación del dashboard"
        className={clsx(
          "fixed left-0 z-60 bg-bg-dark/95 backdrop-blur-md border-r border-border-line/20",
          "top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-[85vw] max-w-sm",
          "transition-transform duration-300 ease-out",
          abierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {children}
      </div>
    </FocusTrap>
  );

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-55"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      {/* Panel del drawer */}
      {drawerContent}
    </>,
    document.body
  );
}