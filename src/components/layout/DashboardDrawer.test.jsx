/**
 * @uso        Pruebas unitarias para DashboardDrawer (menú superpuesto de móvil, spec 009 T3)
 * @funciones  render, screen, userEvent, fireEvent
 * @datos      N/A
 * @eventos    ESC, click backdrop, focus restoration
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

// Mock de Framer Motion para tests - renderiza children sin animación
vi.mock("framer-motion", async () => {
  const React = await vi.importActual("react");
  return {
    __esModule: true,
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
    AnimatePresence: ({ children }) => children,
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
    it("renderiza el panel en document.body (portal) y solo una vez", () => {
      renderDrawer({ abierto: true });

      // El panel debe estar en document.body (portal) y no estar duplicado
      const paneles = document.body.querySelectorAll("#dashboard-drawer-panel");
      expect(paneles.length).toBe(1);
    });

    it("no renderiza nada cuando abierto=false", () => {
      const { container } = renderDrawer({ abierto: false });

      expect(container.firstChild).toBeNull();
      // Verificar que no hay elementos en document.body
      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toBeNull();
    });

    it("renderiza backdrop + panel en el portal", () => {
      renderDrawer({ abierto: true });

      // Backdrop debe estar en document.body - buscar div con clases específicas del backdrop
      const backdrop = document.body.querySelector('div.fixed.inset-0.bg-bg-dark\\/80[aria-hidden="true"]');
      expect(backdrop).toBeTruthy();
      expect(backdrop).toHaveClass("fixed");
      expect(backdrop).toHaveClass("inset-0");
      expect(backdrop).toHaveClass("bg-bg-dark/80");
      expect(backdrop).toHaveClass("backdrop-blur-sm");
      expect(backdrop).toHaveClass("z-50");

      // Panel debe estar en document.body
      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toBeTruthy();
    });
  });

  describe("panel del drawer (menú de móvil)", () => {
    it("panel: fixed inset-y-0 right-0 w-[85vw] max-w-sm", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("fixed")).toBe(true);
      expect(classList.contains("inset-y-0")).toBe(true);
      expect(classList.contains("right-0")).toBe(true);
      expect(classList.contains("w-[85vw]")).toBe(true);
      expect(classList.contains("max-w-sm")).toBe(true);
    });

    it("panel: bg-bg-dark/95 backdrop-blur-md border-l border-border-line/20 z-55", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("bg-bg-dark/95")).toBe(true);
      expect(classList.contains("backdrop-blur-md")).toBe(true);
      expect(classList.contains("border-l")).toBe(true);
      expect(classList.contains("border-border-line/20")).toBe(true);
      expect(classList.contains("z-55")).toBe(true);
    });

    it("panel: aria-label='Menú de navegación'", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toHaveAttribute("aria-label", "Menú de navegación");
    });

    it("panel envuelto en FocusTrap (via AnimatePresence)", () => {
      renderDrawer({ abierto: true });

      // El panel no es hijo directo de body, sino del wrapper del FocusTrap
      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel.parentElement).not.toBe(document.body);
      expect(panel.parentElement.tagName).toBe("DIV");
    });

    it("usa AnimatePresence + motion.div para la animación (motion.div renderizado como div)", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toBeTruthy();
      expect(panel.tagName).toBe("DIV");
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

  describe("click backdrop", () => {
    it("click en backdrop llama a alCerrar", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar });

      const backdrop = document.body.querySelector('div.fixed.inset-0.bg-bg-dark\\/80[aria-hidden="true"]');
      expect(backdrop).toBeTruthy();

      await userEvent.click(backdrop);

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });
  });

  describe("focus trap", () => {
    it("el primer elemento enfocable recibe foco al abrir (simulado por mock)", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const focusableElements = panel.querySelectorAll('a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

      // Debería haber 4 elementos enfocables: 3 NavLink (a[href]) + 1 avatar button
      expect(focusableElements.length).toBe(4);

      // El primer elemento debería recibir el foco al activar el focus trap (simulado por mock)
      const firstElement = focusableElements[0];
      expect(document.activeElement).toBe(firstElement);
    });

    it("elementos enfocables son solo los del panel (3 enlaces + 1 botón avatar)", () => {
      renderDrawer({ abierto: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const focusables = panel.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

      // 3 NavLink (tienen href) + 1 avatar button = 4
      expect(focusables.length).toBe(4);

      // Verificar que son los elementos esperados
      expect(focusables[0].tagName).toBe("A"); // Inicio
      expect(focusables[1].tagName).toBe("A"); // Transacciones
      expect(focusables[2].tagName).toBe("A"); // Tarjetas
      expect(focusables[3].tagName).toBe("BUTTON"); // Avatar
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

      // Verificar 3 enlaces (NavLink renderiza <a> con href)
      const links = panel.querySelectorAll("a[href]");
      expect(links.length).toBe(3);

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

    it("backdrop tiene aria-hidden=true", () => {
      renderDrawer({ abierto: true });

      const backdrop = document.body.querySelector('[aria-hidden="true"]');
      expect(backdrop).toHaveAttribute("aria-hidden", "true");
    });
  });
});
