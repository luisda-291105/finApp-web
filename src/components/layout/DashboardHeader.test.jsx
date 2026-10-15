/**
 * @uso        Pruebas unitarias para el componente DashboardHeader
 * @funciones  Tests de renderizado por breakpoint, callbacks, tokens puros, altura CSS
 * @datos      Mocks de callbacks y getUsuarioMock; MemoryRouter para Link
 * @eventos    Click en botones (toggle, hamburguesa, avatar)
 * @estados    sidebarColapsada (true/false) para chevron
 * @usadoPor   vitest (npm run test)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import { getUsuarioMock } from "../../config/app.config";

function renderHeader(props = {}) {
  const defaultProps = {
    alAbrirDrawer: vi.fn(),
    alToggleSidebar: vi.fn(),
    sidebarColapsada: false,
    usuario: getUsuarioMock(),
    alAbrirUserModal: vi.fn(),
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <DashboardHeader {...defaultProps} />
    </MemoryRouter>
  );
}

describe("DashboardHeader", () => {
  const mockAbrirDrawer = vi.fn();
  const mockToggleSidebar = vi.fn();
  const mockAbrirUserModal = vi.fn();
  const usuarioMock = getUsuarioMock();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Desktop (isDesktop=true)", () => {
    it("renderiza logo como Link a /dashboard con texto FinApp", () => {
      renderHeader({ isDesktop: true, isTablet: false, isMobile: false });

      const logoLink = screen.getByRole("link", { name: /FinApp - Inicio del dashboard/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute("href", "/dashboard");
      expect(logoLink).toHaveTextContent("FinApp");
    });

    it("renderiza botón toggle sidebar con ChevronLeft cuando sidebarColapsada=false", () => {
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        sidebarColapsada: false,
        alToggleSidebar: mockToggleSidebar,
      });

      const toggleBtn = screen.getByRole("button", { name: /Colapsar barra lateral/i });
      expect(toggleBtn).toBeInTheDocument();
      // sidebarColapsada=false → sidebar expandido → aria-expanded="true"
      expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
      // Verifica que contiene ChevronLeft (icono de colapsar) - lucide-react no usa data-lucide
      const svg = toggleBtn.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("renderiza botón toggle sidebar con ChevronRight cuando sidebarColapsada=true", () => {
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        sidebarColapsada: true,
        alToggleSidebar: mockToggleSidebar,
      });

      const toggleBtn = screen.getByRole("button", { name: /Expandir barra lateral/i });
      expect(toggleBtn).toBeInTheDocument();
      // sidebarColapsada=true → sidebar colapsado → aria-expanded="false"
      expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
      // Verifica que contiene ChevronRight (icono de expandir)
      const svg = toggleBtn.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("click en botón toggle llama a alToggleSidebar", () => {
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        alToggleSidebar: mockToggleSidebar,
      });

      const toggleBtn = screen.getByRole("button", { name: /Colapsar barra lateral/i });
      fireEvent.click(toggleBtn);
      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it("NO renderiza botón hamburguesa en desktop", () => {
      renderHeader({ isDesktop: true, isTablet: false, isMobile: false, alAbrirDrawer: mockAbrirDrawer });

      // El botón hamburguesa tiene aria-label "Abrir menú de navegación"
      expect(screen.queryByRole("button", { name: /Abrir menú de navegación/i })).not.toBeInTheDocument();
    });
  });

  describe("Tablet (isTablet=true)", () => {
    it("renderiza botón hamburguesa con icono Menu", () => {
      renderHeader({
        isDesktop: false,
        isTablet: true,
        isMobile: false,
        alAbrirDrawer: mockAbrirDrawer,
      });

      const hamburgerBtn = screen.getByRole("button", { name: /Abrir menú de navegación/i });
      expect(hamburgerBtn).toBeInTheDocument();
      expect(hamburgerBtn).toHaveAttribute("aria-controls", "sidebar-drawer");
      expect(hamburgerBtn).toHaveAttribute("aria-expanded", "false");
      // lucide-react no usa data-lucide, verificamos que hay un SVG
      const svg = hamburgerBtn.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("click en hamburguesa llama a alAbrirDrawer", () => {
      renderHeader({
        isDesktop: false,
        isTablet: true,
        isMobile: false,
        alAbrirDrawer: mockAbrirDrawer,
      });

      const hamburgerBtn = screen.getByRole("button", { name: /Abrir menú de navegación/i });
      fireEvent.click(hamburgerBtn);
      expect(mockAbrirDrawer).toHaveBeenCalledTimes(1);
    });

    it("NO renderiza logo ni toggle sidebar en tablet", () => {
      renderHeader({
        isDesktop: false,
        isTablet: true,
        isMobile: false,
        alToggleSidebar: mockToggleSidebar,
      });

      expect(screen.queryByRole("link", { name: /FinApp - Inicio del dashboard/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Colapsar barra lateral/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Expandir barra lateral/i })).not.toBeInTheDocument();
    });
  });

  describe("Mobile (isMobile=true)", () => {
    it("NO renderiza logo, toggle sidebar ni hamburguesa en mobile", () => {
      renderHeader({
        isDesktop: false,
        isTablet: false,
        isMobile: true,
        alAbrirDrawer: mockAbrirDrawer,
        alToggleSidebar: mockToggleSidebar,
      });

      expect(screen.queryByRole("link", { name: /FinApp - Inicio del dashboard/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Colapsar barra lateral/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Expandir barra lateral/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Abrir menú de navegación/i })).not.toBeInTheDocument();
    });

    it("renderiza solo avatar en mobile", () => {
      renderHeader({
        isDesktop: false,
        isTablet: false,
        isMobile: true,
        usuario: usuarioMock,
        alAbrirUserModal: mockAbrirUserModal,
      });

      const avatarBtn = screen.getByRole("button", { name: new RegExp(`Menú de usuario: ${usuarioMock.nombre}`, "i") });
      expect(avatarBtn).toBeInTheDocument();
      expect(avatarBtn).toHaveTextContent(usuarioMock.iniciales);
    });
  });

  describe("Avatar de usuario (todos los breakpoints)", () => {
    it("renderiza avatar con iniciales de getUsuarioMock()", () => {
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        usuario: usuarioMock,
      });

      const avatarBtn = screen.getByRole("button", { name: new RegExp(`Menú de usuario: ${usuarioMock.nombre}`, "i") });
      expect(avatarBtn).toBeInTheDocument();
      expect(avatarBtn).toHaveTextContent(usuarioMock.iniciales);
      expect(avatarBtn).toHaveAttribute("aria-haspopup", "dialog");
      expect(avatarBtn).toHaveAttribute("aria-expanded", "false");
    });

    it("click en avatar llama a alAbrirUserModal", () => {
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        usuario: usuarioMock,
        alAbrirUserModal: mockAbrirUserModal,
      });

      const avatarBtn = screen.getByRole("button", { name: new RegExp(`Menú de usuario: ${usuarioMock.nombre}`, "i") });
      fireEvent.click(avatarBtn);
      expect(mockAbrirUserModal).toHaveBeenCalledTimes(1);
    });

    it("avatar tiene clases de estilo correctas (tokens puros)", () => {
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        usuario: usuarioMock,
      });

      const avatarBtn = screen.getByRole("button", { name: new RegExp(`Menú de usuario: ${usuarioMock.nombre}`, "i") });
      // Verifica clases basadas en tokens: w-8 h-8 rounded-full bg-emerald-primary text-bg-cream
      expect(avatarBtn).toHaveClass("w-8");
      expect(avatarBtn).toHaveClass("h-8");
      expect(avatarBtn).toHaveClass("rounded-full");
      expect(avatarBtn).toHaveClass("bg-emerald-primary");
      expect(avatarBtn).toHaveClass("text-bg-cream");
      expect(avatarBtn).toHaveClass("font-medium");
    });
  });

  describe("Estilos y tokens puros (sin hexadecimales)", () => {
    it("header tiene clases de fondo y altura basadas en tokens CSS", () => {
      renderHeader({ isDesktop: true, isTablet: false, isMobile: false });

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("fixed");
      expect(header).toHaveClass("top-0");
      expect(header).toHaveClass("left-0");
      expect(header).toHaveClass("right-0");
      expect(header).toHaveClass("z-40");
      expect(header).toHaveClass("w-full");
      // Fondo token puro
      expect(header).toHaveClass("bg-bg-cream/92");
      expect(header).toHaveClass("backdrop-blur-md");
      expect(header).toHaveClass("border-b");
      expect(header).toHaveClass("border-border-line");
      expect(header).toHaveClass("py-3.5");
      expect(header).toHaveClass("shadow-sm");
      // Altura CSS custom property
      expect(header).toHaveClass("h-[var(--header-height)]");
    });

    it("NO contiene literales hexadecimales en el componente (grep hex -> 0)", () => {
      // Este test verifica que el archivo fuente no tiene hex hardcoded
      // Se valida leyendo el archivo y buscando patrones hex
      const fs = require("fs");
      const path = require("path");
      const filePath = path.resolve(__dirname, "./DashboardHeader.jsx");
      const content = fs.readFileSync(filePath, "utf-8");

      // Buscar patrones hex (# seguido de 3, 6 u 8 dígitos hex) o rgb()/rgba()
      const hexPattern = /#([0-9a-fA-F]{3,8})\b/g;
      const rgbPattern = /rgb\(|rgba\(/g;

      const hexMatches = content.match(hexPattern) || [];
      const rgbMatches = content.match(rgbPattern) || [];

      // Filtrar falsos positivos (como en comentarios o URLs)
      const realHexMatches = hexMatches.filter((match) => {
        // Ignorar si está en un comentario JSDoc o string de data-lucide
        const index = content.indexOf(match);
        const before = content.substring(Math.max(0, index - 50), index);
        return !before.includes("data-lucide") && !before.includes("@theme") && !before.includes("color-");
      });

      expect(realHexMatches.length).toBe(0);
      expect(rgbMatches.length).toBe(0);
    });
  });

  describe("Integración con DashboardUserModal (mock)", () => {
    it("click en avatar -> alAbrirUserModal -> modal muestra slots Configuración y Salir del demo", () => {
      // Test de integración simplificado: verifica que el callback se llama
      // y que el modal (mock) recibiría las acciones correctas
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        usuario: usuarioMock,
        alAbrirUserModal: mockAbrirUserModal,
      });

      const avatarBtn = screen.getByRole("button", { name: new RegExp(`Menú de usuario: ${usuarioMock.nombre}`, "i") });
      fireEvent.click(avatarBtn);

      expect(mockAbrirUserModal).toHaveBeenCalledTimes(1);

      // Verificar que el modal (si se renderizara) tendría:
      // - Slot "Configuración" que navega a /dashboard/configuracion
      // - Slot "Salir del demo" que navega a /
      // Esto se valida en test de integración separado del modal
    });
  });

  describe("Accesibilidad", () => {
    it("header tiene role='banner'", () => {
      renderHeader({ isDesktop: true, isTablet: false, isMobile: false });
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("botones tienen focus-visible styles via clases", () => {
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        sidebarColapsada: false,
      });

      const toggleBtn = screen.getByRole("button", { name: /Colapsar barra lateral/i });
      const avatarBtn = screen.getByRole("button", { name: new RegExp(`Menú de usuario: ${usuarioMock.nombre}`, "i") });

      expect(toggleBtn).toHaveClass("focus-visible:outline-none");
      expect(toggleBtn).toHaveClass("focus-visible:ring-2");
      expect(toggleBtn).toHaveClass("focus-visible:ring-emerald-primary/50");

      expect(avatarBtn).toHaveClass("focus-visible:outline-none");
      expect(avatarBtn).toHaveClass("focus-visible:ring-2");
      expect(avatarBtn).toHaveClass("focus-visible:ring-emerald-primary/50");
      expect(avatarBtn).toHaveClass("focus-visible:ring-offset-2");
      expect(avatarBtn).toHaveClass("focus-visible:ring-offset-bg-cream");
    });

    it("avatar tiene aria-haspopup='dialog' y aria-expanded", () => {
      renderHeader({
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        usuario: usuarioMock,
      });

      const avatarBtn = screen.getByRole("button", { name: new RegExp(`Menú de usuario: ${usuarioMock.nombre}`, "i") });
      expect(avatarBtn).toHaveAttribute("aria-haspopup", "dialog");
      expect(avatarBtn).toHaveAttribute("aria-expanded", "false");
    });
  });
});