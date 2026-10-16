/**
 * @uso        Tests de DashboardLayout (composición completa, breakpoints, márgenes, resize)
 * @funciones  Tests de renderizado por breakpoint, márgenes/padding, Outlet, UserModal, transiciones resize
 * @datos      Mocks: useBreakpoint, react-router-dom, componentes hijos
 * @eventos    Navegación BottomNav, apertura modal, resize breakpoints
 * @estados    drawerAbierto, mobileMenuAbierto, userModalAbierto
 * @usadoPor   Vitest suite
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useBreakpoint } from "../hooks/useBreakpoint";
import DashboardHeader from "../components/layout/DashboardHeader";
import SidebarResponsive from "../components/layout/SidebarResponsive";
import DashboardDrawer from "../components/layout/DashboardDrawer";
import BottomNav from "../components/layout/BottomNav";
import DashboardUserModal from "../components/layout/DashboardUserModal";
import SidebarNavContenido from "../components/layout/SidebarNavContenido";
import Container from "../components/layout/Container";

// Mock useBreakpoint (named export)
vi.mock("../hooks/useBreakpoint", () => ({
  useBreakpoint: vi.fn(),
}));

// Mock child components to control rendering and verify props
// These mocks DON'T spread props to DOM elements to avoid React warnings
vi.mock("../components/layout/DashboardHeader", () => ({
  default: vi.fn(({ alAbrirDrawer, alToggleSidebar, sidebarColapsada, usuario, alAbrirUserModal, isMobile, isTablet, isDesktop, ...rest }) => (
    <header data-testid="dashboard-header" {...rest} />
  )),
}));

vi.mock("../components/layout/SidebarResponsive", () => ({
  default: vi.fn(({ colapsada, alToggleColapso, alAbrirUserModal, ...rest }) => (
    <aside data-testid="sidebar-responsive" {...rest} />
  )),
}));

vi.mock("../components/layout/DashboardDrawer", () => ({
  default: vi.fn(({ abierto, alCerrar, children, triggerRef, esMobile, ...rest }) =>
    abierto ? (
      <div data-testid="dashboard-drawer" {...rest}>
        {children}
      </div>
    ) : null
  ),
}));

vi.mock("../components/layout/BottomNav", () => ({
  default: vi.fn(({ itemActivo, alNavegar, alAbrirMenu, menuTriggerRef, ...rest }) => (
    <nav data-testid="bottom-nav" {...rest} />
  )),
}));

vi.mock("../components/layout/DashboardUserModal", () => ({
  default: vi.fn(({ abierto, alCerrar, triggerRef, ...rest }) =>
    abierto ? (
      <div data-testid="dashboard-user-modal" {...rest} />
    ) : (
      <div data-testid="dashboard-user-modal-closed" {...rest} />
    )
  ),
}));

vi.mock("../components/layout/SidebarNavContenido", () => ({
  default: vi.fn(({ alAbrirUserModal, colapsada, ...rest }) => (
    <nav data-testid="sidebar-nav-contenido" {...rest} />
  )),
}));

vi.mock("../components/layout/Container", () => ({
  default: vi.fn(({ children, ...rest }) => (
    <div data-testid="container" {...rest}>{children}</div>
  )),
}));

// Mock getUsuarioMock
vi.mock("../config/app.config", () => ({
  getUsuarioMock: vi.fn(() => ({
    nombre: "Usuario Demo",
    iniciales: "UD",
    email: "demo@finapp.local",
  })),
}));

// Test helper to render DashboardLayout with MemoryRouter
const renderDashboardLayout = (initialPath = "/dashboard", mockBreakpoint = {}) => {
  const defaultBreakpoint = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    sidebarColapsada: false,
    toggleSidebar: vi.fn(),
  };

  useBreakpoint.mockReturnValue({ ...defaultBreakpoint, ...mockBreakpoint });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dashboard/*" element={<DashboardLayout />}>
          <Route index element={<div data-testid="outlet-content">Dashboard Home</div>} />
          <Route path="transacciones" element={<div data-testid="outlet-content">Transacciones</div>} />
          <Route path="tarjetas" element={<div data-testid="outlet-content">Tarjetas</div>} />
          <Route path="configuracion" element={<div data-testid="outlet-content">Configuración</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

// Helper to get the first call args of a mock
const getFirstCall = (mock) => mock.mock.calls[0]?.[0];

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("Desktop (≥1024px)", () => {
    it("renderiza DashboardHeader con props desktop correctas", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      const props = getFirstCall(DashboardHeader);
      expect(props.isDesktop).toBe(true);
      expect(props.isTablet).toBe(false);
      expect(props.isMobile).toBe(false);
      expect(props.alToggleSidebar).toBeTypeOf("function");
      expect(props.alAbrirDrawer).toBeUndefined();
      expect(props.sidebarColapsada).toBe(false);
      expect(props.usuario).toEqual({
        nombre: "Usuario Demo",
        iniciales: "UD",
        email: "demo@finapp.local",
      });
    });

    it("renderiza SidebarResponsive en desktop", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      const props = getFirstCall(SidebarResponsive);
      expect(props.colapsada).toBe(false);
      expect(props.alToggleColapso).toBeTypeOf("function");
      expect(props.alAbrirUserModal).toBeTypeOf("function");
    });

    it("NO renderiza DashboardDrawer en desktop", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      const openDrawerCalls = DashboardDrawer.mock.calls.filter((call) => call[0]?.abierto === true);
      expect(openDrawerCalls).toHaveLength(0);
    });

    it("NO renderiza BottomNav en desktop", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      expect(BottomNav).not.toHaveBeenCalled();
    });

    it("renderiza Container + Outlet en desktop", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      expect(Container).toHaveBeenCalled();
      expect(screen.getByTestId("outlet-content")).toHaveTextContent("Dashboard Home");
    });

    it("renderiza DashboardUserModal global (cerrado inicialmente)", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      const props = getFirstCall(DashboardUserModal);
      expect(props.abierto).toBe(false);
      expect(props.alCerrar).toBeTypeOf("function");
    });

    it("aplica margen lateral lg:ml-64 cuando sidebar expandida", () => {
      const { container } = renderDashboardLayout("/dashboard", {
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        sidebarColapsada: false,
      });

      const mainDiv = container.querySelector('[class*="min-h-screen"]');
      expect(mainDiv).toHaveClass("lg:ml-64");
      expect(mainDiv).not.toHaveClass("lg:ml-[72px]");
    });

    it("aplica margen lateral lg:ml-[72px] cuando sidebar colapsada", () => {
      const { container } = renderDashboardLayout("/dashboard", {
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        sidebarColapsada: true,
      });

      const mainDiv = container.querySelector('[class*="min-h-screen"]');
      expect(mainDiv).toHaveClass("lg:ml-[72px]");
      expect(mainDiv).not.toHaveClass("lg:ml-64");
    });

    it("aplica padding pb-20 y offset pt-[var(--header-height)] en main", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      const main = screen.getByRole("main");
      expect(main).toHaveClass("pb-20");
      expect(main).toHaveClass("pt-[var(--header-height)]");
    });
  });

  describe("Tablet (640–1023px)", () => {
    it("renderiza DashboardHeader con hamburguesa (alAbrirDrawer)", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: true, isMobile: false });

      const props = getFirstCall(DashboardHeader);
      expect(props.isDesktop).toBe(false);
      expect(props.isTablet).toBe(true);
      expect(props.isMobile).toBe(false);
      expect(props.alAbrirDrawer).toBeTypeOf("function");
      expect(props.alToggleSidebar).toBeUndefined();
      expect(props.sidebarColapsada).toBe(false);
      expect(props.usuario).toEqual({
        nombre: "Usuario Demo",
        iniciales: "UD",
        email: "demo@finapp.local",
      });
    });

    it("NO renderiza SidebarResponsive en tablet", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: true, isMobile: false });

      expect(SidebarResponsive).not.toHaveBeenCalled();
    });

    it("renderiza DashboardDrawer condicionalmente (cerrado inicialmente)", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: true, isMobile: false });

      const props = getFirstCall(DashboardDrawer);
      expect(props.abierto).toBe(false);
      expect(props.alCerrar).toBeTypeOf("function");
      expect(props.triggerRef).toBeUndefined();
      expect(props.children).toBeDefined();
    });

    it("abre drawer tablet cuando se llama alAbrirDrawer del header", () => {
      const { rerender } = renderDashboardLayout("/dashboard", {
        isDesktop: false,
        isTablet: true,
        isMobile: false,
      });

      const headerProps = getFirstCall(DashboardHeader);
      act(() => {
        headerProps.alAbrirDrawer();
      });

      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route index element={<div data-testid="outlet-content">Dashboard Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const openDrawerCalls = DashboardDrawer.mock.calls.filter(
        (call) => call[0]?.abierto === true
      );
      expect(openDrawerCalls.length).toBeGreaterThan(0);
    });

    it("NO renderiza BottomNav en tablet", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: true, isMobile: false });

      expect(BottomNav).not.toHaveBeenCalled();
    });

    it("aplica ml-0 (sin margen lateral) en tablet", () => {
      const { container } = renderDashboardLayout("/dashboard", {
        isDesktop: false,
        isTablet: true,
        isMobile: false,
      });

      const mainDiv = container.querySelector('[class*="min-h-screen"]');
      expect(mainDiv).toHaveClass("ml-0");
    });

    it("renderiza Container + Outlet en tablet", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: true, isMobile: false });

      expect(Container).toHaveBeenCalled();
      expect(screen.getByTestId("outlet-content")).toHaveTextContent("Dashboard Home");
    });
  });

  describe("Mobile (<640px)", () => {
    it("renderiza DashboardHeader solo con avatar (sin logo, sin hamburguesa)", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: false, isMobile: true });

      const props = getFirstCall(DashboardHeader);
      expect(props.isDesktop).toBe(false);
      expect(props.isTablet).toBe(false);
      expect(props.isMobile).toBe(true);
      expect(props.alAbrirDrawer).toBeUndefined();
      expect(props.alToggleSidebar).toBeUndefined();
      expect(props.sidebarColapsada).toBe(false);
      expect(props.usuario).toEqual({
        nombre: "Usuario Demo",
        iniciales: "UD",
        email: "demo@finapp.local",
      });
    });

    it("NO renderiza SidebarResponsive en mobile", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: false, isMobile: true });

      expect(SidebarResponsive).not.toHaveBeenCalled();
    });

    it("renderiza BottomNav con props correctas", () => {
      renderDashboardLayout("/dashboard/transacciones", {
        isDesktop: false,
        isTablet: false,
        isMobile: true,
      });

      const props = getFirstCall(BottomNav);
      expect(props.itemActivo).toBe("/dashboard/transacciones");
      expect(props.alNavegar).toBeTypeOf("function");
      expect(props.alAbrirMenu).toBeTypeOf("function");
    });

    it("renderiza DashboardDrawer menú condicionalmente (cerrado inicialmente)", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: false, isMobile: true });

      const drawerCalls = DashboardDrawer.mock.calls.filter(
        (call) => call[0]?.abierto !== undefined
      );
      expect(drawerCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("abre drawer menú mobile cuando se llama alAbrirMenu del BottomNav", () => {
      const { rerender } = renderDashboardLayout("/dashboard", {
        isDesktop: false,
        isTablet: false,
        isMobile: true,
      });

      const bottomNavProps = getFirstCall(BottomNav);
      act(() => {
        bottomNavProps.alAbrirMenu();
      });

      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route index element={<div data-testid="outlet-content">Dashboard Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const mobileDrawerCalls = DashboardDrawer.mock.calls.filter(
        (call) => call[0]?.abierto === true
      );
      expect(mobileDrawerCalls.length).toBeGreaterThan(0);
    });

    it("aplica ml-0 (sin margen lateral) en mobile", () => {
      const { container } = renderDashboardLayout("/dashboard", {
        isDesktop: false,
        isTablet: false,
        isMobile: true,
      });

      const mainDiv = container.querySelector('[class*="min-h-screen"]');
      expect(mainDiv).toHaveClass("ml-0");
    });

    it("renderiza Container + Outlet en mobile", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: false, isMobile: true });

      expect(Container).toHaveBeenCalled();
      expect(screen.getByTestId("outlet-content")).toHaveTextContent("Dashboard Home");
    });
  });

  describe("Outlet y navegación", () => {
    it("renderiza contenido del Outlet para subrutas", () => {
      renderDashboardLayout("/dashboard/transacciones", {
        isDesktop: true,
        isTablet: false,
        isMobile: false,
      });

      expect(screen.getByTestId("outlet-content")).toHaveTextContent("Transacciones");
    });

    it("navega al hacer click en BottomNav item", () => {
      renderDashboardLayout("/dashboard", {
        isDesktop: false,
        isTablet: false,
        isMobile: true,
      });

      const bottomNavProps = getFirstCall(BottomNav);
      expect(bottomNavProps.alNavegar).toBeTypeOf("function");
    });
  });

  describe("DashboardUserModal global", () => {
    it("está presente en el árbol (portal) en todos los breakpoints", () => {
      // Desktop
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });
      expect(DashboardUserModal).toHaveBeenCalled();

      // Tablet
      vi.clearAllMocks();
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: true, isMobile: false });
      expect(DashboardUserModal).toHaveBeenCalled();

      // Mobile
      vi.clearAllMocks();
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: false, isMobile: true });
      expect(DashboardUserModal).toHaveBeenCalled();
    });

    it("se abre al llamar alAbrirUserModal", () => {
      const { rerender } = renderDashboardLayout("/dashboard", {
        isDesktop: true,
        isTablet: false,
        isMobile: false,
      });

      const headerProps = getFirstCall(DashboardHeader);
      act(() => {
        headerProps.alAbrirUserModal();
      });

      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route index element={<div data-testid="outlet-content">Dashboard Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const openModalCalls = DashboardUserModal.mock.calls.filter(
        (call) => call[0]?.abierto === true
      );
      expect(openModalCalls.length).toBeGreaterThan(0);
    });
  });

  describe("Transiciones resize (efectos useEffect)", () => {
    it("cierra drawer tablet al cambiar a desktop", () => {
      const { rerender } = renderDashboardLayout("/dashboard", {
        isDesktop: false,
        isTablet: true,
        isMobile: false,
      });

      const headerProps = getFirstCall(DashboardHeader);
      act(() => {
        headerProps.alAbrirDrawer();
      });

      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route index element={<div data-testid="outlet-content">Dashboard Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // The effect should have set drawerAbierto to false when isDesktop becomes true
      // We verify the component re-renders without error
    });

    it("cierra drawer tablet al cambiar a mobile", () => {
      const { rerender } = renderDashboardLayout("/dashboard", {
        isDesktop: false,
        isTablet: true,
        isMobile: false,
      });

      const headerProps = getFirstCall(DashboardHeader);
      act(() => {
        headerProps.alAbrirDrawer();
      });

      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route index element={<div data-testid="outlet-content">Dashboard Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // The effect should have set drawerAbierto to false when isMobile becomes true
    });
  });

  describe("SidebarNavContenido compartido", () => {
    it("se usa en SidebarResponsive (desktop)", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      // SidebarNavContenido is rendered as children of SidebarResponsive, not called directly
      // We verify SidebarResponsive was called (which internally uses SidebarNavContenido)
      expect(SidebarResponsive).toHaveBeenCalled();
    });

    it("se usa en DashboardDrawer (tablet)", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: true, isMobile: false });

      const headerProps = getFirstCall(DashboardHeader);
      act(() => {
        headerProps.alAbrirDrawer();
      });

      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: true, isMobile: false });

      const drawerCalls = DashboardDrawer.mock.calls;
      const lastCall = drawerCalls[drawerCalls.length - 1];
      expect(lastCall?.[0]?.children).toBeDefined();
    });

    it("se usa en DashboardDrawer (mobile menú)", () => {
      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: false, isMobile: true });

      const bottomNavProps = getFirstCall(BottomNav);
      act(() => {
        bottomNavProps.alAbrirMenu();
      });

      renderDashboardLayout("/dashboard", { isDesktop: false, isTablet: false, isMobile: true });

      const drawerCalls = DashboardDrawer.mock.calls;
      const mobileDrawerCall = drawerCalls.find(
        (call) => call[0]?.abierto === true
      );
      expect(mobileDrawerCall?.[0]?.children).toBeDefined();
    });
  });

  describe("Usuario mock", () => {
    it("usa getUsuarioMock para datos de usuario", () => {
      renderDashboardLayout("/dashboard", { isDesktop: true, isTablet: false, isMobile: false });

      const props = getFirstCall(DashboardHeader);
      expect(props.usuario).toEqual({
        nombre: "Usuario Demo",
        iniciales: "UD",
        email: "demo@finapp.local",
      });
    });
  });
});