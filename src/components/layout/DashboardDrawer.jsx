/**
 * @uso        Menú lateral superpuesto exclusivo de móvil (portal, backdrop, trampa de foco real)
 * @funciones  DashboardDrawer({ abierto, alCerrar, children, triggerRef })
 * @datos      Renderiza children (esperado: SidebarNavContenido) dentro del panel lateral
 * @eventos    «X» superior → alCerrar; ESC (mecanismo único) → alCerrar; click backdrop → alCerrar;
 *             click en el panel → no cierra; Tab/Shift+Tab ciclan dentro de la trampa
 * @estados    Recibe `abierto` controlado desde padre; sin estado propio
 * @usadoPor   DashboardLayout (menú superpuesto de móvil)
 *
 * Contrato (spec 010, T5 — RF-02, RF-05, RF-10, RF-15, RF-16, RF-22):
 * - Tres formas de cierre aplicables: «X» superior (`BotonCerrar`), Esc (un único mecanismo por
 *   capa, `zIndex: 55`) y toque/clic fuera. El gesto de deslizar hacia abajo **no** aplica
 *   (DP-08: este panel se desliza lateralmente y su contenido es desplazable).
 * - La trampa de foco se crea **de verdad**: `AnimatePresence` envuelve a `FocusTrap` y el hijo
 *   directo es el `motion.div` del panel (con su `ref`), de modo que `focus-trap-react` recibe un
 *   nodo real; `allowOutsideClick: true` deja pasar el clic exterior sin desactivar la trampa.
 * - Foco inicial en el contenedor (`tabIndex={-1}`, fuera del ciclo de Tab). El panel conserva la
 *   altura completa (`inset-y-0`, Spec 008) con `flex flex-col` y su contenido en un envoltorio
 *   `min-h-0 flex-1 overflow-y-auto`; la fila de cromo superior deja el contenido un poco más
 *   abajo (RF-15) sin solaparse con la «X».
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import clsx from "clsx";
import { BotonCerrar } from "../ui/BotonCerrar";
import { useCierreConEsc } from "../../hooks/useCierreConEsc";

/** Capa del panel del menú en el registro de Esc (plan §2.3-M1; el modal de Cuenta usa 60). */
const CAPA_MENU = 55;

/**
 * Opciones REALES de `focus-trap` (plan §2.2): `allowOutsideClick: true` hace efectivo el clic
 * exterior sin desactivar la trampa, `escapeDeactivates: false` deja Esc al único mecanismo común
 * (`useCierreConEsc`), el foco inicial va al contenedor del diálogo y el retorno de foco es manual
 * (`returnFocusOnDeactivate: false`). El clic exterior no desactiva la trampa (nunca se usa la
 * opción que lo haría): la trampa sigue activa y confinando el foco.
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
 * DashboardDrawer
 * Menú lateral superpuesto de móvil: portal, backdrop, trampa de foco real y animación de entrada.
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

  // Esc: mecanismo único compartido con el resto de superficies (capa del panel: 55)
  useCierreConEsc({ activo: abierto, zIndex: CAPA_MENU, alCerrar });

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

  // Configuración común del FocusTrap (opciones reales de la API, plan §2.2)
  const focusTrapOptions = crearOpcionesTrampa(panelRef);

  // Panel del drawer (rama móvil incondicional: backdrop + AnimatePresence + FocusTrap + motion.div)
  // `AnimatePresence` envuelve a `FocusTrap` para que el `motion.div` del panel sea el hijo directo
  // y la trampa se cree de verdad (plan §2.3-M5). Sin animaciones nuevas (DP-07).
  const mobilePanelContent = (
    <AnimatePresence>
      <FocusTrap
        ref={focusTrapRef}
        focusTrapOptions={focusTrapOptions}
      >
        <motion.div
          ref={panelRef}
          id="dashboard-drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          tabIndex={-1}
          className={clsx(
            "fixed inset-y-0 right-0 w-[85vw] max-w-sm flex flex-col bg-bg-dark/95 backdrop-blur-md border-l border-border-line/20 z-55 outline-none"
          )}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Cromo superior: único control visible de cierre, alineado a la derecha. Deja el
              contenido un poco más abajo (RF-15) sin solaparse con la «X». */}
          <div className="flex justify-end px-4 pt-6 pb-2">
            <BotonCerrar
              ariaLabel="Cerrar menú"
              alCerrar={alCerrar}
              className="text-bg-cream hover:text-mint-accent hover:bg-emerald-primary/10 focus-visible:ring-mint-accent"
            />
          </div>

          {/* Contenido desplazable: ocupa el resto de la altura completa del panel (RF-22) */}
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            {children}
          </div>
        </motion.div>
      </FocusTrap>
    </AnimatePresence>
  );

  return createPortal(
    <>
      {/* Backdrop: cierra el menú al tocar/clicar fuera (`allowOutsideClick` deja pasar el evento) */}
      <div
        className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      {mobilePanelContent}
    </>,
    document.body
  );
}