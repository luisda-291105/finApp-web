/**
 * @uso        Pruebas unitarias para DashboardDrawer (drawer tablet/mobile slide-in, spec 007 T6)
 * @funciones  render, screen, userEvent, fireEvent
 * @datos      N/A
 * @eventos    click overlay, ESC, Tab navigation, focus restoration
 * @estados    Controlado por prop `abierto`
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DashboardDrawer from "./DashboardDrawer";
import SidebarNavContenido from "./SidebarNavContenido";

// Mock de focus-trap-react para evitar error "no tabbable nodes" en jsdom
vi.mock("focus-trap-react", async () => {
  const React = await vi.importActual("react");
  return {
    __esModule: true,
    default: React.forwardRef(({ children, focusTrapOptions, ...props }, ref) => {
      // Simular focus trap: enfocar primer elemento enfocable al montar
      const containerRef = React.useRef(null);
      React.useEffect(() => {
        if (containerRef.current) {
          const focusable = containerRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) {
            focusable.focus();
          }
        }
        // Cleanup: focus trap options onDeactivate
        return () => {
          if (focusTrapOptions?.onDeactivate) {
            focusTrapOptions.onDeactivate();
          }
        };
      }, []);
      return (
        <div
          ref={(el) => {
            containerRef.current = el;
            if (ref) ref.current = el;
          }}
          {...props}
        >
          {children}
        </div>
      );
    }),
  };
});

afterEach(cleanup);

const renderDrawer = (props = {}, initialEntries = ["/dashboard"]) => {
  const defaultProps = {
    abierto: true,
    alCerrar: vi.fn(),
    children: (
      <SidebarNavContenido alAbrirUserModal={vi.fn()} />
    ),
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <DashboardDrawer {...defaultProps} />
    </MemoryRouter>
  );
};

describe("DashboardDrawer", () => {
  describe("portal y renderizado condicional", () => {
    it("renderiza el portal en document.body", () => {
      renderDrawer({ abierto: true });

      // El overlay y panel deben estar en document.body (portal)
      const overlay = document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/50");
      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(overlay).toBeTruthy();
      expect(panel).toBeTruthy();
    });

    it("no renderiza nada cuando abierto=false", () => {
      const { container } = renderDrawer({ abierto: false });

      expect(container.firstChild).toBeNull();
      // Verificar que no hay elementos en document.body
      const overlay = document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/50");
      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(overlay).toBeNull();
      expect(panel).toBeNull();
    });
  });

  describe("overlay", () => {
    it("overlay tiene clases correctas: fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-55", () => {
      renderDrawer({ abierto: true });

      const overlay = document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/50.backdrop-blur-sm.z-55");
      expect(overlay).toBeTruthy();
      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });

    it("click en overlay llama a alCerrar", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar });

      const overlay = document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/50");
      await userEvent.click(overlay);

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });
  });

  describe("panel del drawer", () => {
    it("panel tiene clases base correctas", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toBeTruthy();
      expect(panel).toHaveAttribute("role", "dialog");
      expect(panel).toHaveAttribute("aria-modal", "true");
      expect(panel).toHaveAttribute("aria-label", "Navegación del dashboard");
    });

    it("panel tiene clases de posición y dimensiones: fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-[85vw] max-w-sm", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("fixed")).toBe(true);
      expect(classList.contains("left-0")).toBe(true);
      expect(classList.contains("top-[var(--header-height)]")).toBe(true);
      expect(classList.contains("h-[calc(100vh-var(--header-height))]")).toBe(true);
      expect(classList.contains("w-[85vw]")).toBe(true);
      expect(classList.contains("max-w-sm")).toBe(true);
    });

    it("panel tiene clases visuales: bg-bg-dark/95 backdrop-blur-md border-r border-border-line/20 z-60", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("bg-bg-dark/95")).toBe(true);
      expect(classList.contains("backdrop-blur-md")).toBe(true);
      expect(classList.contains("border-r")).toBe(true);
      expect(classList.contains("border-border-line/20")).toBe(true);
      expect(classList.contains("z-60")).toBe(true);
    });

    it("panel tiene clases de transición: transition-transform duration-300 ease-out", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("transition-transform")).toBe(true);
      expect(classList.contains("duration-300")).toBe(true);
      expect(classList.contains("ease-out")).toBe(true);
    });

    it("panel tiene clase translate-x-0 cuando abierto=true", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel.classList.contains("translate-x-0")).toBe(true);
    });
  });

  describe("teclado - ESC", () => {
    it("presionar ESC llama a alCerrar", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar });

      await userEvent.keyboard("{Escape}");

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });
  });

  describe("focus trap", () => {
    it("primer elemento enfocable recibe foco al abrir (simulado por mock)", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const focusableElements = panel.querySelectorAll('a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      // Debería haber 5 elementos enfocables: 4 NavLink (a[href]) + 1 avatar button
      expect(focusableElements.length).toBe(5);

      // El primer elemento debería recibir el foco al activar el focus trap (simulado por mock)
      const firstElement = focusableElements[0];
      expect(document.activeElement).toBe(firstElement);
    });

    it("elementos enfocables son solo los del panel (4 enlaces + 1 botón avatar)", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const focusables = panel.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      // 4 NavLink (tienen href) + 1 avatar button = 5
      expect(focusables.length).toBe(5);
      
      // Verificar que son los elementos esperados
      expect(focusables[0].tagName).toBe("A"); // Inicio
      expect(focusables[1].tagName).toBe("A"); // Transacciones
      expect(focusables[2].tagName).toBe("A"); // Tarjetas
      expect(focusables[3].tagName).toBe("A"); // Configuración
      expect(focusables[4].tagName).toBe("BUTTON"); // Avatar
    });
  });

  describe("restauración de foco al cerrar", () => {
    it("devuelve foco a triggerRef.current al cerrar", async () => {
      const alCerrar = vi.fn();
      const triggerRef = { current: document.createElement("button") };
      triggerRef.current.textContent = "Trigger";
      document.body.appendChild(triggerRef.current);

      const { rerender } = renderDrawer({ abierto: true, alCerrar, triggerRef });

      // Cerrar el drawer
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto={false} alCerrar={alCerrar} children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />} triggerRef={triggerRef} />
        </MemoryRouter>
      );

      // El foco debería estar en el trigger
      expect(document.activeElement).toBe(triggerRef.current);

      document.body.removeChild(triggerRef.current);
    });

    it("devuelve foco al elemento previo si no hay triggerRef", async () => {
      const alCerrar = vi.fn();
      const previousElement = document.createElement("button");
      previousElement.textContent = "Previous";
      document.body.appendChild(previousElement);
      previousElement.focus();

      const { rerender } = renderDrawer({ abierto: true, alCerrar });

      // Cerrar el drawer
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto={false} alCerrar={alCerrar} children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />} />
        </MemoryRouter>
      );

      // El foco debería volver al elemento previo
      expect(document.activeElement).toBe(previousElement);

      document.body.removeChild(previousElement);
    });
  });

  describe("children renderizado", () => {
    it("renderiza children dentro del panel (SidebarNavContenido)", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const nav = panel.querySelector("nav[aria-label='Navegación principal del dashboard']");
      expect(nav).toBeTruthy();

      // Verificar 4 enlaces (NavLink renderiza <a> con href)
      const links = panel.querySelectorAll("a[href]");
      expect(links.length).toBe(4);

      // Verificar avatar button
      const avatarButton = panel.querySelector("button[aria-label*='Cuenta de']");
      expect(avatarButton).toBeTruthy();
    });
  });

  describe("accesibilidad", () => {
    it("panel tiene role=dialog y aria-modal=true", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toHaveAttribute("role", "dialog");
      expect(panel).toHaveAttribute("aria-modal", "true");
    });

    it("overlay tiene aria-hidden=true", () => {
      renderDrawer({ abierto: true });

      const overlay = document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/50");
      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });
  });
});