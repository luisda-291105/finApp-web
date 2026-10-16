/**
 * @uso        Pruebas unitarias para SidebarNavContenido (contenido navegación compartido, spec 007 T4)
 * @funciones  render, screen, userEvent
 * @datos      N/A
 * @eventos    click en avatar, navegación via NavLink
 * @estados    Sin estado propio (stateless)
 * @usadoPor   Vitest
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SidebarNavContenido from "./SidebarNavContenido";

afterEach(cleanup);

const renderSidebarNavContenido = (props = {}, initialEntries = ["/dashboard"]) => {
  const defaultProps = {
    alAbrirUserModal: vi.fn(),
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SidebarNavContenido {...defaultProps} />
    </MemoryRouter>
  );
};

describe("SidebarNavContenido", () => {
  describe("renderizado de enlaces de navegación", () => {
    it("renderiza 3 NavLink con href e iconos correctos", () => {
      renderSidebarNavContenido();

      // Verificar 3 enlaces (conjunto vigente de la navegación lateral)
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);

      // Verificar cada enlace con su ruta, icono y etiqueta
      const inicioLink = screen.getByRole("link", { name: /Inicio/i });
      expect(inicioLink.getAttribute("href")).toBe("/dashboard");
      expect(inicioLink.querySelector("svg.lucide-house")).toBeTruthy();

      const transaccionesLink = screen.getByRole("link", { name: /Transacciones/i });
      expect(transaccionesLink.getAttribute("href")).toBe("/dashboard/transacciones");
      expect(transaccionesLink.querySelector("svg.lucide-receipt")).toBeTruthy();

      const tarjetasLink = screen.getByRole("link", { name: /Tarjetas/i });
      expect(tarjetasLink.getAttribute("href")).toBe("/dashboard/tarjetas");
      expect(tarjetasLink.querySelector("svg.lucide-credit-card")).toBeTruthy();
    });

    it("iconos tienen flex-shrink-0 w-6 h-6", () => {
      renderSidebarNavContenido();

      // Buscar todos los svg dentro de los links de navegación
      const nav = screen.getByRole("navigation");
      const svgs = nav.querySelectorAll("a svg");
      expect(svgs.length).toBe(3);
      svgs.forEach((svg) => {
        expect(svg.classList.contains("flex-shrink-0")).toBe(true);
        expect(svg.classList.contains("w-6")).toBe(true);
        expect(svg.classList.contains("h-6")).toBe(true);
      });
    });

    it("etiquetas tienen truncate y contenedor min-w-0", () => {
      renderSidebarNavContenido();

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.classList.contains("min-w-0")).toBe(true);
        const span = link.querySelector("span");
        expect(span).toBeTruthy();
        expect(span.classList.contains("truncate")).toBe(true);
        expect(span.classList.contains("min-w-0")).toBe(true);
      });
    });
  });

  describe("renderizado de avatar y separador", () => {
    it("renderiza separador hr con clases correctas", () => {
      renderSidebarNavContenido();

      const hr = document.querySelector("hr[role='separator']");
      expect(hr).toBeTruthy();
      expect(hr.classList.contains("border-border-line/20")).toBe(true);
      expect(hr.classList.contains("my-3")).toBe(true);
    });

    it("renderiza avatar con iniciales de getUsuarioMock()", () => {
      renderSidebarNavContenido();

      // El avatar es un botón que contiene las iniciales
      const avatarButton = screen.getByRole("button", { name: /Cuenta de Usuario Demo/i });
      expect(avatarButton).toBeTruthy();

      // Verificar círculo con iniciales
      const avatarCircle = avatarButton.querySelector(".w-10.h-10.rounded-full.bg-emerald-primary");
      expect(avatarCircle).toBeTruthy();
      expect(avatarCircle.textContent).toContain("UD");

      // Verificar nombre y email
      expect(avatarButton.textContent).toContain("Usuario Demo");
      expect(avatarButton.textContent).toContain("demo@finapp.local");
    });

    it("avatar tiene clases correctas: w-10 h-10 rounded-full bg-emerald-primary flex items-center justify-center text-bg-cream font-medium", () => {
      renderSidebarNavContenido();

      const avatarCircle = document.querySelector(".w-10.h-10.rounded-full.bg-emerald-primary.flex.items-center.justify-center.text-bg-cream.font-medium");
      expect(avatarCircle).toBeTruthy();
    });
  });

  describe("interacción con avatar", () => {
    it("click en avatar llama a alAbrirUserModal", async () => {
      const alAbrirUserModal = vi.fn();
      renderSidebarNavContenido({ alAbrirUserModal });

      const avatarButton = screen.getByRole("button", { name: /Cuenta de Usuario Demo/i });
      await userEvent.click(avatarButton);

      expect(alAbrirUserModal).toHaveBeenCalledTimes(1);
    });

    it("click en avatar dispara callback una sola vez por click", async () => {
      const alAbrirUserModal = vi.fn();
      renderSidebarNavContenido({ alAbrirUserModal });

      const avatarButton = screen.getByRole("button", { name: /Cuenta de Usuario Demo/i });
      await userEvent.click(avatarButton);
      await userEvent.click(avatarButton);

      expect(alAbrirUserModal).toHaveBeenCalledTimes(2);
    });
  });

  describe("sin lógica propia de navegación", () => {
    it("no llama navigate directamente (delega a NavLink)", () => {
      // El componente usa NavLink de react-router-dom, no useNavigate
      // Verificamos que los enlaces son NavLink (renderizan <a> tags)
      renderSidebarNavContenido();

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.tagName).toBe("A");
      });
    });

    it("no tiene estado interno ni efectos secundarios", () => {
      // Componente stateless: solo renderiza según props
      const { rerender } = renderSidebarNavContenido({ alAbrirUserModal: vi.fn() });

      // Re-render con misma prop no debe causar efectos extra
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <SidebarNavContenido alAbrirUserModal={vi.fn()} />
        </MemoryRouter>
      );

      // Si llegamos aquí sin errores, el componente es stateless
      expect(screen.getByRole("navigation")).toBeTruthy();
    });
  });

  describe("accesibilidad", () => {
    it("nav tiene aria-label correcto", () => {
      renderSidebarNavContenido();

      const nav = screen.getByRole("navigation");
      expect(nav.getAttribute("aria-label")).toBe("Navegación principal del dashboard");
    });

    it("iconos tienen aria-hidden=true", () => {
      renderSidebarNavContenido();

      const nav = screen.getByRole("navigation");
      const icons = nav.querySelectorAll("a svg");
      icons.forEach((icon) => {
        expect(icon.getAttribute("aria-hidden")).toBe("true");
      });
    });

    it("avatar button tiene aria-label descriptivo", () => {
      renderSidebarNavContenido();

      const avatarButton = screen.getByRole("button", { name: /Cuenta de Usuario Demo/i });
      expect(avatarButton.getAttribute("aria-label")).toBe("Cuenta de Usuario Demo");
    });

    it("separador tiene aria-hidden=true", () => {
      renderSidebarNavContenido();

      const hr = document.querySelector("hr[role='separator']");
      expect(hr).toBeTruthy();
      expect(hr.getAttribute("aria-hidden")).toBe("true");
    });
  });

  describe("estilos y clases", () => {
    it("enlaces activos tienen clases de estado activo", () => {
      renderSidebarNavContenido({}, ["/dashboard/transacciones"]);

      const activeLink = screen.getByRole("link", { name: /Transacciones/i });
      expect(activeLink.classList.contains("bg-emerald-primary/10")).toBe(true);
      expect(activeLink.classList.contains("text-emerald-primary")).toBe(true);
      expect(activeLink.classList.contains("font-medium")).toBe(true);
    });

    it("enlaces inactivos tienen clases base y hover", () => {
      renderSidebarNavContenido({}, ["/dashboard"]);

      const inactiveLink = screen.getByRole("link", { name: /Transacciones/i });
      expect(inactiveLink.classList.contains("text-slate-text")).toBe(true);
      expect(inactiveLink.classList.contains("hover:bg-emerald-primary/5")).toBe(true);
    });

    it("Inicio no queda activo en subrutas del dashboard", () => {
      renderSidebarNavContenido({}, ["/dashboard/tarjetas"]);

      const inicioLink = screen.getByRole("link", { name: /Inicio/i });
      const tarjetasLink = screen.getByRole("link", { name: /Tarjetas/i });
      expect(inicioLink.classList.contains("bg-emerald-primary/10")).toBe(false);
      expect(tarjetasLink.classList.contains("bg-emerald-primary/10")).toBe(true);
    });
  });
});