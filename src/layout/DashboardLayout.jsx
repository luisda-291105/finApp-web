/**
 * @uso        Layout completo del dashboard (composición global responsive)
 * @funciones  DashboardLayout()
 * @datos      Orquesta DashboardHeader, SidebarResponsive, DashboardDrawer (tablet + mobile), BottomNav, Container, Outlet, DashboardUserModal
 * @eventos    Resize breakpoints (cierra drawers), navegación BottomNav, apertura modal usuario
 * @estados    drawerAbierto (tablet), mobileMenuAbierto (mobile menú), userModalAbierto (global)
 * @usadoPor   App.jsx (rutas /dashboard/*)
 */

import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useBreakpoint } from "../hooks/useBreakpoint";
import DashboardHeader from "../components/layout/DashboardHeader";
import SidebarResponsive from "../components/layout/SidebarResponsive";
import DashboardDrawer from "../components/layout/DashboardDrawer";
import BottomNav from "../components/layout/BottomNav";
import DashboardUserModal from "../components/layout/DashboardUserModal";
import SidebarNavContenido from "../components/layout/SidebarNavContenido";
import Container from "../components/layout/Container";
import { getUsuarioMock } from "../config/app.config";

/**
 * DashboardLayout
 * Composición raíz del área autenticada (dashboard). Integra header, navegación lateral
 * (sidebar desktop / drawer tablet / drawer mobile menú), navegación inferior (mobile),
 * área de contenido con Outlet y modal de usuario global.
 *
 * Breakpoints (vía useBreakpoint):
 * - Desktop (≥1024px): SidebarResponsive fija + Header con toggle + Container con margen lateral
 * - Tablet (640–1023px): Header con hamburguesa + Drawer condicional + Container sin margen
 * - Mobile (<640px): Header solo avatar + BottomNav + Drawer menú condicional + Container con padding inferior
 *
 * Márgenes/padding condicionales:
 * - Desktop expandida: lg:ml-64 | colapsada: lg:ml-[72px]
 * - Tablet/Mobile: ml-0
 * - Main: pt-[var(--header-height)] (header fijo) + pb-20 (bottom nav mobile)
 *
 * @returns {JSX.Element} Layout completo del dashboard
 */
export default function DashboardLayout() {
  const { isMobile, isTablet, isDesktop, sidebarColapsada, toggleSidebar } = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [mobileMenuAbierto, setMobileMenuAbierto] = useState(false);
  const [userModalAbierto, setUserModalAbierto] = useState(false);

  const alAbrirUserModal = () => setUserModalAbierto(true);
  const alCerrarUserModal = () => setUserModalAbierto(false);
  const usuario = getUsuarioMock();

  // Efecto: al pasar a desktop, cerrar drawer tablet
  useEffect(() => {
    if (isDesktop) {
      setDrawerAbierto(false);
    }
  }, [isDesktop]);

  // Efecto: al pasar a mobile, cerrar drawer tablet
  useEffect(() => {
    if (isMobile) {
      setDrawerAbierto(false);
    }
  }, [isMobile]);

  return (
    <>
      {/* Header fijo - siempre renderizado */}
      <DashboardHeader
        alAbrirDrawer={isTablet ? () => setDrawerAbierto(true) : undefined}
        alToggleSidebar={isDesktop ? toggleSidebar : undefined}
        sidebarColapsada={isDesktop ? sidebarColapsada : false}
        usuario={usuario}
        alAbrirUserModal={alAbrirUserModal}
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
      />

      {/* Sidebar desktop fija */}
      {isDesktop && (
        <SidebarResponsive
          colapsada={sidebarColapsada}
          alToggleColapso={toggleSidebar}
          alAbrirUserModal={alAbrirUserModal}
        />
      )}

      {/* Drawer tablet (navegación) */}
      {isTablet && (
        <DashboardDrawer
          abierto={drawerAbierto}
          alCerrar={() => setDrawerAbierto(false)}
          triggerRef={undefined}
        >
          <SidebarNavContenido alAbrirUserModal={alAbrirUserModal} />
        </DashboardDrawer>
      )}

      {/* Área principal con márgenes condicionales */}
      <div
        className={clsx(
          "min-h-screen bg-bg-cream transition-all duration-300",
          isDesktop && sidebarColapsada ? "lg:ml-[72px]" : "lg:ml-64",
          !isDesktop && "ml-0"
        )}
      >
        <Container>
          <main
            className={clsx(
              "pb-20",                    // espacio bottom nav mobile
              "pt-[var(--header-height)]" // espacio header fijo (token, no magic number)
            )}
          >
            <Outlet />
          </main>
        </Container>
      </div>

      {/* BottomNav mobile */}
      {isMobile && (
        <BottomNav
          itemActivo={location.pathname}
          alNavegar={(ruta) => navigate(ruta)}
          alAbrirMenu={() => setMobileMenuAbierto(true)}
        />
      )}

      {/* Drawer mobile (menú - 5º item BottomNav) */}
      {isMobile && (
        <DashboardDrawer
          abierto={mobileMenuAbierto}
          alCerrar={() => setMobileMenuAbierto(false)}
          triggerRef={undefined}
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