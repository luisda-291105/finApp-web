/**
 * @uso        Esqueleto de layout para el área del dashboard (composición base)
 * @funciones  DashboardLayout({ children })
 * @datos      Recibe children (renderizado vía Outlet para subrutas)
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   PaginaDashboardInicio, PaginaDashboardTransacciones, PaginaDashboardTarjetas, PaginaDashboardConfiguracion
 */

import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Container from "../components/layout/Container";

/**
 * DashboardLayout
 * Composición base del dashboard: Sidebar (placeholder) + Container + área de contenido con Outlet.
 * La navegación responsive completa (sidebar desktop + drawer tablet + bottom nav mobile) es spec posterior.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido de las subrutas (se ignora; usa Outlet)
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-cream text-bg-dark md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      {/* Sidebar placeholder (aside vacío) */}
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      {/* Área principal: Container + main con Outlet */}
      <div className="md:col-start-2">
        <Container>
          <main>
            <Outlet />
          </main>
        </Container>
      </div>
    </div>
  );
}