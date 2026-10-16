import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useBreakpoint } from "../hooks/useBreakpoint";

import SidebarResponsive from "../components/layout/SidebarResponsive";
import DashboardDrawer from "../components/layout/DashboardDrawer";
import BottomNav from "../components/layout/BottomNav";
import DashboardUserModal from "../components/layout/DashboardUserModal";
import SidebarNavContenido from "../components/layout/SidebarNavContenido";
import Container from "../components/layout/Container";
import { getUsuarioMock } from "../config/app.config";

/**doc
 * @uso        Layout del dashboard con dos versiones de vista (móvil / pantallas grandes)
 * @funciones  DashboardLayout()
 * @datos      Orquesta SidebarResponsive, DashboardDrawer (menú de móvil), BottomNav, Container, Outlet, DashboardUserModal
 * @eventos    Cruce del corte de 768px (cierra el menú de móvil y traslada el foco), navegación BottomNav, apertura modal usuario
 * @estados    mobileMenuAbierto (móvil), userModalAbierto (global)
 * @usadoPor   App.jsx (rutas /dashboard/*)

 * DashboardLayout
 * Composición raíz del área autenticada (dashboard). Dos versiones de vista con un único
 * corte en 768px: «pantallas grandes» (≥768px) con navegación lateral permanente y
 * colapsable; «móvil» (<768px) con navegación inferior y menú superpuesto. Sin categoría intermedia.
 *
 * Márgenes/padding condicionales:
 * - Pantallas grandes expandida: ml-64 | colapsada: ml-[72px]
 * - Móvil: ml-0
 * - Main: pb-20 (espacio de la navegación inferior de móvil)
 *
 * @returns {JSX.Element} Layout completo del dashboard
 */


export default function DashboardLayout() {
  const { isMobile, isDesktop, sidebarColapsada, toggleSidebar } = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuAbierto, setMobileMenuAbierto] = useState(false);
  const [userModalAbierto, setUserModalAbierto] = useState(false);

  const bottomNavMenuRef = useRef(null);

  const alAbrirUserModal = () => setUserModalAbierto(true);
  const alCerrarUserModal = () => setUserModalAbierto(false);
  const usuario = getUsuarioMock();

  // Efecto: al salir de móvil, cerrar el menú superpuesto y trasladar el foco al
  // control de la navegación lateral que lo sustituye (no dejarlo en un elemento que
  // se desmonta). El modal de cuenta (global) permanece intacto.
  useEffect(() => {
    if (isMobile || !mobileMenuAbierto) return;

    setMobileMenuAbierto(false);
    const controlNavegacionLateral = document.querySelector(
      'aside[role="navigation"] button'
    );
    if (controlNavegacionLateral instanceof HTMLElement) {
      controlNavegacionLateral.focus();
    }
  }, [isMobile, mobileMenuAbierto]);

  return (
    <>
      
      {/* Navegación lateral permanente (pantallas grandes ≥768px) */}
      {isDesktop && (
        <SidebarResponsive
          colapsada={sidebarColapsada}
          alToggleColapso={toggleSidebar}
          alAbrirUserModal={alAbrirUserModal}
        />
      )}

      {/* Área principal: margen reservado para la navegación desde 768px (sin prefijo lg:) */}
      <div
        className={clsx(
          "min-h-screen bg-bg-cream transition-all duration-300",
          isDesktop ? (sidebarColapsada ? "ml-[72px]" : "ml-64") : "ml-0"
        )}
      >
        <Container>
          <main className="pb-20">
            <Outlet />
          </main>
        </Container>
      </div>

      {/* Navegación inferior (móvil) */}
      {isMobile && (
        <BottomNav
          itemActivo={location.pathname}
          alNavegar={(ruta) => navigate(ruta)}
          alAbrirMenu={() => setMobileMenuAbierto(true)}
          menuTriggerRef={bottomNavMenuRef}
        />
      )}

      {/* Menú superpuesto (móvil, 5.º item del BottomNav) */}
      {isMobile && (
        <DashboardDrawer
          abierto={mobileMenuAbierto}
          alCerrar={() => setMobileMenuAbierto(false)}
          triggerRef={bottomNavMenuRef}
        >
          <SidebarNavContenido alAbrirUserModal={alAbrirUserModal} />
        </DashboardDrawer>
      )}

      {/* Modal usuario global (portal, siempre al final para z-index) */}
      <DashboardUserModal
        abierto={userModalAbierto}
        alCerrar={alCerrarUserModal}
      />
    </>
  );
}