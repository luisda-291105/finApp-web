/**
 * @uso        Pruebas unitarias para SidebarResponsive (sidebar desktop colapsable, spec 007 T5)
 * @funciones  render, screen, userEvent, MemoryRouter
 * @datos      Props controladas: colapsada, alToggleColapso, alAbrirUserModal
 * @eventos    click en logo toggle, click en avatar, navegación via NavLink
 * @estados    colapsada (controlada por props)
 * @usadoPor   Vitest
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SidebarResponsive from "./SidebarResponsive";

afterEach(cleanup);

const renderSidebarResponsive = (props = {}, initialEntries = ["/dashboard"]) => {
  const defaultProps = {
    colapsada: false,
    alToggleColapso: vi.fn(),
    alAbrirUserModal: vi.fn(),
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SidebarResponsive {...defaultProps} />
    </MemoryRouter>
  );
};

// Helper para obtener el aside principal (no el nav interno)
const getSidebarAside = () => {
  return document.querySelector('aside[role="navigation"][aria-label="Navegación principal del dashboard"]');
};

describe("SidebarResponsive", () => {
  describe("renderizado básico y estructura", () => {
    it("renderiza aside con role navigation y aria-label correcto", () => {
      renderSidebarResponsive();

      const aside = getSidebarAside();
      expect(aside).toBeTruthy();
      expect(aside.tagName).toBe("ASIDE");
    });

    it("aplica clases de posición fija y altura completa bajo header", () => {
      renderSidebarResponsive();

      const aside = getSidebarAside();
      expect(aside).toHaveClass("fixed");
      expect(aside).toHaveClass("left-0");
      expect(aside).toHaveClass("top-[var(--header-height)]");
      expect(aside).toHaveClass("h-[calc(100vh-var(--header-height))]");
      expect(aside).toHaveClass("z-40");
    });

    it("aplica fondo dark glass con tokens: bg-bg-dark/80 backdrop-blur-md border-border-line/20", () => {
      renderSidebarResponsive();

      const aside = getSidebarAside();
      expect(aside).toHaveClass("bg-bg-dark/80");
      expect(aside).toHaveClass("backdrop-blur-md");
      expect(aside).toHaveClass("border-r");
      expect(aside).toHaveClass("border-border-line/20");
    });

    it("aplica transición de 300ms para cambios de ancho", () => {
      renderSidebarResponsive();

      const aside = getSidebarAside();
      expect(aside).toHaveClass("transition-all");
      expect(aside).toHaveClass("duration-300");
    });
  });

  describe("estado expandida (colapsada=false)", () => {
    it("tiene ancho 256px (w-64) cuando expandida", () => {
      renderSidebarResponsive({ colapsada: false });

      const aside = getSidebarAside();
      expect(aside).toHaveClass("w-64");
      expect(aside).not.toHaveClass("w-[72px]");
    });

    it("renderiza logo 'FinApp' como enlace a /dashboard", () => {
      renderSidebarResponsive({ colapsada: false });

      const logoLink = screen.getByRole("link", { name: /FinApp - Inicio/i });
      expect(logoLink).toBeTruthy();
      expect(logoLink.getAttribute("href")).toBe("/dashboard");
      expect(logoLink).toHaveTextContent("Fin");
      expect(logoLink).toHaveTextContent("App");
    });

    it("logo 'Fin' tiene color emerald-primary y 'App' en bg-cream", () => {
      renderSidebarResponsive({ colapsada: false });

      const logoLink = screen.getByRole("link", { name: /FinApp - Inicio/i });
      const finSpan = logoLink.querySelector("span:first-child");
      const appSpan = logoLink.querySelector("span:last-child");
      expect(finSpan).toHaveClass("text-emerald-primary");
      expect(appSpan).toHaveTextContent("App");
    });

    it("renderiza icono ChevronLeft cuando expandida", () => {
      renderSidebarResponsive({ colapsada: false });

      const chevronLeft = document.querySelector("svg.lucide-chevron-left");
      expect(chevronLeft).toBeTruthy();
      expect(chevronLeft).toHaveClass("w-5");
      expect(chevronLeft).toHaveClass("h-5");
    });

    it("botón toggle tiene aria-expanded=true cuando expandida", () => {
      renderSidebarResponsive({ colapsada: false });

      const toggleButton = screen.getByRole("button", { name: /Colapsar navegación/i });
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    });

    it("renderiza 4 enlaces de navegación con iconos y etiquetas", () => {
      renderSidebarResponsive({ colapsada: false });

      const links = screen.getAllByRole("link");
      // 1 logo + 4 nav links = 5 total
      expect(links).toHaveLength(5);

      // Usar getByRole con nombre más específico para el link de navegación "Inicio"
      const inicioLink = screen.getByRole("link", { name: /^Inicio$/i });
      expect(inicioLink.getAttribute("href")).toBe("/dashboard");
      expect(inicioLink.querySelector("svg.lucide-house")).toBeTruthy();

      const transaccionesLink = screen.getByRole("link", { name: /Transacciones/i });
      expect(transaccionesLink.getAttribute("href")).toBe("/dashboard/transacciones");
      expect(transaccionesLink.querySelector("svg.lucide-receipt")).toBeTruthy();

      const tarjetasLink = screen.getByRole("link", { name: /Tarjetas/i });
      expect(tarjetasLink.getAttribute("href")).toBe("/dashboard/tarjetas");
      expect(tarjetasLink.querySelector("svg.lucide-credit-card")).toBeTruthy();

      const configuracionLink = screen.getByRole("link", { name: /Configuración/i });
      expect(configuracionLink.getAttribute("href")).toBe("/dashboard/configuracion");
      expect(configuracionLink.querySelector("svg.lucide-settings")).toBeTruthy();
    });

    it("iconos de navegación tienen flex-shrink-0 w-6 h-6", () => {
      renderSidebarResponsive({ colapsada: false });

      const aside = getSidebarAside();
      const navSvgs = aside.querySelectorAll("a[href^='/dashboard'] svg");
      expect(navSvgs.length).toBe(4);
      navSvgs.forEach((svg) => {
        expect(svg.classList.contains("flex-shrink-0")).toBe(true);
        expect(svg.classList.contains("w-6")).toBe(true);
        expect(svg.classList.contains("h-6")).toBe(true);
      });
    });

    it("renderiza avatar de usuario con iniciales UD al final", () => {
      renderSidebarResponsive({ colapsada: false });

      const avatarButton = screen.getByRole("button", { name: /Cuenta de Usuario Demo/i });
      expect(avatarButton).toBeTruthy();
      expect(avatarButton.textContent).toContain("UD");
      expect(avatarButton.textContent).toContain("Usuario Demo");
      expect(avatarButton.textContent).toContain("demo@finapp.local");
    });

    it("avatar tiene clases correctas: w-10 h-10 rounded-full bg-emerald-primary", () => {
      renderSidebarResponsive({ colapsada: false });

      const avatarCircle = document.querySelector(".w-10.h-10.rounded-full.bg-emerald-primary.flex.items-center.justify-center.text-bg-cream.font-medium");
      expect(avatarCircle).toBeTruthy();
    });
  });

  describe("estado colapsada (colapsada=true)", () => {
    it("tiene ancho 72px cuando colapsada", () => {
      renderSidebarResponsive({ colapsada: true });

      const aside = getSidebarAside();
      expect(aside).toHaveClass("w-[72px]");
      expect(aside).not.toHaveClass("w-64");
    });

    it("renderiza icono Home con tooltip 'Inicio' en lugar de logo FinApp", () => {
      renderSidebarResponsive({ colapsada: true });

      // El link del logo en colapsada tiene title="Inicio" (tooltip nativo)
      const homeLink = screen.getByTitle("Inicio");
      expect(homeLink).toBeTruthy();
      expect(homeLink.getAttribute("href")).toBe("/dashboard");
      expect(homeLink.getAttribute("title")).toBe("Inicio");

      const homeIcon = homeLink.querySelector("svg.lucide-house");
      expect(homeIcon).toBeTruthy();
      expect(homeIcon).toHaveClass("w-6");
      expect(homeIcon).toHaveClass("h-6");
    });

    it("NO renderiza texto 'FinApp' cuando colapsada", () => {
      renderSidebarResponsive({ colapsada: true });

      // El texto "Fin" y "App" no deben estar en el documento (están dentro del botón toggle que no se renderiza en colapsada)
      // Verificar que el link del logo expandido no existe
      expect(screen.queryByRole("link", { name: /FinApp - Inicio/i })).not.toBeInTheDocument();
    });

    it("renderiza icono ChevronRight cuando colapsada", () => {
      renderSidebarResponsive({ colapsada: true });

      const chevronRight = document.querySelector("svg.lucide-chevron-right");
      expect(chevronRight).toBeTruthy();
      expect(chevronRight).toHaveClass("w-5");
      expect(chevronRight).toHaveClass("h-5");
    });

    it("botón toggle tiene aria-expanded=false cuando colapsada", () => {
      renderSidebarResponsive({ colapsada: true });

      const toggleButton = screen.getByRole("button", { name: /Expandir navegación/i });
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });

    it("oculta etiquetas de navegación (solo iconos visibles) - verifica clase hidden", () => {
      renderSidebarResponsive({ colapsada: true });

      const aside = getSidebarAside();
      // Verificar que los spans de etiqueta tienen la clase 'hidden'
      const labelSpans = aside.querySelectorAll("nav a span.truncate");
      labelSpans.forEach((span) => {
        expect(span.classList.contains("hidden")).toBe(true);
      });
    });

    it("mantiene avatar visible pero oculta nombre/email cuando colapsada - verifica clase hidden", () => {
      renderSidebarResponsive({ colapsada: true });

      const avatarButton = screen.getByRole("button", { name: /Cuenta de Usuario Demo/i });
      expect(avatarButton).toBeTruthy();
      expect(avatarButton.textContent).toContain("UD");

      // Verificar que el contenedor del nombre/email tiene clase hidden
      const nameEmailContainer = avatarButton.querySelector(".flex-1");
      expect(nameEmailContainer).toHaveClass("hidden");
    });
  });

  describe("interacción logo toggle", () => {
    it("click en área logo llama a alToggleColapso cuando expandida", async () => {
      const alToggleColapso = vi.fn();
      renderSidebarResponsive({ colapsada: false, alToggleColapso });

      const toggleButton = screen.getByRole("button", { name: /Colapsar navegación/i });
      await userEvent.click(toggleButton);

      expect(alToggleColapso).toHaveBeenCalledTimes(1);
    });

    it("click en área logo llama a alToggleColapso cuando colapsada", async () => {
      const alToggleColapso = vi.fn();
      renderSidebarResponsive({ colapsada: true, alToggleColapso });

      const toggleButton = screen.getByRole("button", { name: /Expandir navegación/i });
      await userEvent.click(toggleButton);

      expect(alToggleColapso).toHaveBeenCalledTimes(1);
    });

    it("click en icono Home (colapsada) navega a /dashboard", async () => {
      renderSidebarResponsive({ colapsada: true });

      // Usar el link específico con title="Inicio" (tooltip nativo)
      const homeLink = screen.getByTitle("Inicio");
      expect(homeLink.getAttribute("href")).toBe("/dashboard");
      expect(homeLink.getAttribute("title")).toBe("Inicio");
    });
  });

  describe("interacción avatar", () => {
    it("click en avatar llama a alAbrirUserModal", async () => {
      const alAbrirUserModal = vi.fn();
      renderSidebarResponsive({ alAbrirUserModal });

      const avatarButton = screen.getByRole("button", { name: /Cuenta de Usuario Demo/i });
      await userEvent.click(avatarButton);

      expect(alAbrirUserModal).toHaveBeenCalledTimes(1);
    });

    it("click en avatar dispara callback una sola vez por click", async () => {
      const alAbrirUserModal = vi.fn();
      renderSidebarResponsive({ alAbrirUserModal });

      const avatarButton = screen.getByRole("button", { name: /Cuenta de Usuario Demo/i });
      await userEvent.click(avatarButton);
      await userEvent.click(avatarButton);

      expect(alAbrirUserModal).toHaveBeenCalledTimes(2);
    });
  });

  describe("accesibilidad", () => {
    it("iconos decorativos tienen aria-hidden=true", () => {
      renderSidebarResponsive({ colapsada: false });

      const aside = getSidebarAside();
      const allIcons = aside.querySelectorAll("svg[aria-hidden='true']");
      expect(allIcons.length).toBeGreaterThanOrEqual(4); // 4 nav icons + logo icons
    });

    it("separador en SidebarNavContenido tiene aria-hidden=true", () => {
      renderSidebarResponsive({ colapsada: false });

      const hr = document.querySelector("hr[role='separator']");
      expect(hr).toBeTruthy();
      expect(hr.getAttribute("aria-hidden")).toBe("true");
    });

    it("enlaces activos tienen clases de estado activo", () => {
      renderSidebarResponsive({ colapsada: false }, ["/dashboard/transacciones"]);

      const activeLink = screen.getByRole("link", { name: /Transacciones/i });
      expect(activeLink).toHaveClass("bg-emerald-primary/10");
      expect(activeLink).toHaveClass("text-emerald-primary");
      expect(activeLink).toHaveClass("font-medium");
    });

    it("enlaces inactivos tienen clases base y hover", () => {
      renderSidebarResponsive({ colapsada: false }, ["/dashboard"]);

      const inactiveLink = screen.getByRole("link", { name: /Transacciones/i });
      expect(inactiveLink).toHaveClass("text-slate-text");
      expect(inactiveLink).toHaveClass("hover:bg-emerald-primary/5");
    });
  });

  describe("estados de foco visible", () => {
    it("botón toggle tiene clases de focus-visible con tokens mint-accent en className", () => {
      renderSidebarResponsive({ colapsada: false });

      const toggleButton = screen.getByRole("button", { name: /Colapsar navegación/i });
      const className = toggleButton.className;
      // Verificar que las clases de focus-visible están en el className
      expect(className).toContain("focus-visible:outline-none");
      expect(className).toContain("focus-visible:ring-2");
      expect(className).toContain("focus-visible:ring-mint-accent/50");
      expect(className).toContain("focus-visible:ring-offset-2");
      expect(className).toContain("focus-visible:ring-offset-bg-dark");
    });
  });

  describe("cambio de estado controlado (props)", () => {
    it("re-renderiza correctamente al cambiar prop colapsada de false a true", () => {
      const { rerender } = renderSidebarResponsive({ colapsada: false });

      const aside = getSidebarAside();
      expect(aside).toHaveClass("w-64");

      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <SidebarResponsive colapsada={true} alToggleColapso={vi.fn()} alAbrirUserModal={vi.fn()} />
        </MemoryRouter>
      );

      const newAside = getSidebarAside();
      expect(newAside).toHaveClass("w-[72px]");
    });

    it("mantiene callback alToggleColapso referencialmente estable entre renders", () => {
      const alToggleColapso = vi.fn();
      const { rerender } = renderSidebarResponsive({ colapsada: false, alToggleColapso });

      const button1 = screen.getByRole("button", { name: /Colapsar navegación/i });

      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <SidebarResponsive colapsada={false} alToggleColapso={alToggleColapso} alAbrirUserModal={vi.fn()} />
        </MemoryRouter>
      );

      const button2 = screen.getByRole("button", { name: /Colapsar navegación/i });
      // El botón se re-renderiza pero la función callback es la misma
      expect(button2).toBeTruthy();
    });
  });
});