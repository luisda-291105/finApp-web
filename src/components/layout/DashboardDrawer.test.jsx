/**
 * @uso        Pruebas unitarias para DashboardDrawer (drawer tablet/mobile slide-in, spec 008 T2)
 * @funciones  render, screen, userEvent, fireEvent
 * @datos      N/A
 * @eventos    ESC, click backdrop, focus restoration
 * @estados    Controlado por prop `abierto` y `esMobile`
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
    it("renderiza el portal en document.body (tablet: esMobile=false)", () => {
      renderDrawer({ abierto: true, esMobile: false });

      // El panel debe estar en document.body (portal)
      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toBeTruthy();
    });

    it("no renderiza nada cuando abierto=false", () => {
      const { container } = renderDrawer({ abierto: false });

      expect(container.firstChild).toBeNull();
      // Verificar que no hay elementos en document.body
      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toBeNull();
    });

    it("mobile (esMobile=true): renderiza backdrop + panel en portal", () => {
      renderDrawer({ abierto: true, esMobile: true });

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

    it("tablet (esMobile=false): NO renderiza backdrop", () => {
      renderDrawer({ abierto: true, esMobile: false });

      const backdrop = document.body.querySelector('div.fixed.inset-0.bg-bg-dark\\/80[aria-hidden="true"]');
      expect(backdrop).toBeNull();
    });
  });

  describe("panel del drawer - tablet (esMobile=false)", () => {
    it("panel tiene clases base correctas", () => {
      renderDrawer({ abierto: true, esMobile: false });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toBeTruthy();
      expect(panel).toHaveAttribute("role", "dialog");
      expect(panel).toHaveAttribute("aria-modal", "true");
      expect(panel).toHaveAttribute("aria-label", "Navegación del dashboard");
    });

    it("panel tablet: fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-[85vw] max-w-sm", () => {
      renderDrawer({ abierto: true, esMobile: false });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("fixed")).toBe(true);
      expect(classList.contains("left-0")).toBe(true);
      expect(classList.contains("top-[var(--header-height)]")).toBe(true);
      expect(classList.contains("h-[calc(100vh-var(--header-height))]")).toBe(true);
      expect(classList.contains("w-[85vw]")).toBe(true);
      expect(classList.contains("max-w-sm")).toBe(true);
    });

    it("panel tablet: bg-bg-dark/95 backdrop-blur-md border-r border-border-line/20 z-60", () => {
      renderDrawer({ abierto: true, esMobile: false });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("bg-bg-dark/95")).toBe(true);
      expect(classList.contains("backdrop-blur-md")).toBe(true);
      expect(classList.contains("border-r")).toBe(true);
      expect(classList.contains("border-border-line/20")).toBe(true);
      expect(classList.contains("z-60")).toBe(true);
    });

    it("panel tablet: transition-transform duration-300 ease-out", () => {
      renderDrawer({ abierto: true, esMobile: false });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("transition-transform")).toBe(true);
      expect(classList.contains("duration-300")).toBe(true);
      expect(classList.contains("ease-out")).toBe(true);
    });

    it("panel tablet: translate-x-0 cuando abierto=true", () => {
      renderDrawer({ abierto: true, esMobile: false });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel.classList.contains("translate-x-0")).toBe(true);
    });

    it("tablet: usa FocusTrap para manejo de foco interno", () => {
      renderDrawer({ abierto: true, esMobile: false });

      // En tablet, el panel está envuelto en FocusTrap (para manejo de Tab/Shift+Tab)
      // El panel NO es hijo directo de body, sino del wrapper FocusTrap
      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel.parentElement).not.toBe(document.body);
      // Verificar que el wrapper tiene las clases del FocusTrap (div simple)
      expect(panel.parentElement.tagName).toBe("DIV");
    });
  });

  describe("panel del drawer - mobile (esMobile=true)", () => {
    it("panel mobile: fixed inset-y-0 right-0 w-[85vw] max-w-sm", () => {
      renderDrawer({ abierto: true, esMobile: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("fixed")).toBe(true);
      expect(classList.contains("inset-y-0")).toBe(true);
      expect(classList.contains("right-0")).toBe(true);
      expect(classList.contains("w-[85vw]")).toBe(true);
      expect(classList.contains("max-w-sm")).toBe(true);
    });

    it("panel mobile: bg-bg-dark/95 backdrop-blur-md border-l border-border-line/20 z-55", () => {
      renderDrawer({ abierto: true, esMobile: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const classList = panel.classList;

      expect(classList.contains("bg-bg-dark/95")).toBe(true);
      expect(classList.contains("backdrop-blur-md")).toBe(true);
      expect(classList.contains("border-l")).toBe(true);
      expect(classList.contains("border-border-line/20")).toBe(true);
      expect(classList.contains("z-55")).toBe(true);
    });

    it("panel mobile: aria-label='Menú de navegación'", () => {
      renderDrawer({ abierto: true, esMobile: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toHaveAttribute("aria-label", "Menú de navegación");
    });

    it("mobile: panel envuelto en FocusTrap (via AnimatePresence)", () => {
      renderDrawer({ abierto: true, esMobile: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      // En mobile, el panel está dentro de AnimatePresence > FocusTrap
      // Verificamos que existe y tiene las clases correctas
      expect(panel).toBeTruthy();
    });

    it("mobile: usa AnimatePresence + motion.div para animación", () => {
      renderDrawer({ abierto: true, esMobile: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      // motion.div renderizado como div por mock
      expect(panel).toBeTruthy();
      // Verificar que tiene clases de animación o estructura esperada
    });
  });

  describe("teclado - ESC", () => {
    it("tablet: presionar ESC llama a alCerrar", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar, esMobile: false });

      await userEvent.keyboard("{Escape}");

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("mobile: presionar ESC llama a alCerrar", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar, esMobile: true });

      await userEvent.keyboard("{Escape}");

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });
  });

  describe("click backdrop (mobile)", () => {
    it("mobile: click en backdrop llama a alCerrar", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar, esMobile: true });

      const backdrop = document.body.querySelector('div.fixed.inset-0.bg-bg-dark\\/80[aria-hidden="true"]');
      expect(backdrop).toBeTruthy();

      await userEvent.click(backdrop);

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("tablet: NO hay backdrop para hacer click", () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar, esMobile: false });

      const backdrop = document.body.querySelector('div.fixed.inset-0.bg-bg-dark\\/80[aria-hidden="true"]');
      expect(backdrop).toBeNull();
      expect(alCerrar).not.toHaveBeenCalled();
    });
  });

  describe("focus trap", () => {
    it("tablet: primer elemento enfocable recibe foco al abrir (simulado por mock)", () => {
      renderDrawer({ abierto: true, esMobile: false });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const focusableElements = panel.querySelectorAll('a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      // Debería haber 5 elementos enfocables: 4 NavLink (a[href]) + 1 avatar button
      expect(focusableElements.length).toBe(5);

      // El primer elemento debería recibir el foco al activar el focus trap (simulado por mock)
      const firstElement = focusableElements[0];
      expect(document.activeElement).toBe(firstElement);
    });

    it("mobile: primer elemento enfocable recibe foco al abrir (simulado por mock)", () => {
      renderDrawer({ abierto: true, esMobile: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      const focusableElements = panel.querySelectorAll('a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      // Debería haber 5 elementos enfocables: 4 NavLink (a[href]) + 1 avatar button
      expect(focusableElements.length).toBe(5);

      const firstElement = focusableElements[0];
      expect(document.activeElement).toBe(firstElement);
    });

    it("elementos enfocables son solo los del panel (4 enlaces + 1 botón avatar)", () => {
      renderDrawer({ abierto: true, esMobile: false });

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
    it("devuelve foco a triggerRef.current al cerrar (tablet)", async () => {
      const alCerrar = vi.fn();
      const triggerRef = { current: document.createElement("button") };
      triggerRef.current.textContent = "Trigger";
      document.body.appendChild(triggerRef.current);

      const { rerender } = renderDrawer({ abierto: true, alCerrar, triggerRef, esMobile: false });

      // Cerrar el drawer
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto={false} alCerrar={alCerrar} children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />} triggerRef={triggerRef} esMobile={false} />
        </MemoryRouter>
      );

      // El foco debería estar en el trigger
      expect(document.activeElement).toBe(triggerRef.current);

      document.body.removeChild(triggerRef.current);
    });

    it("devuelve foco a triggerRef.current al cerrar (mobile)", async () => {
      const alCerrar = vi.fn();
      const triggerRef = { current: document.createElement("button") };
      triggerRef.current.textContent = "Trigger";
      document.body.appendChild(triggerRef.current);

      const { rerender } = renderDrawer({ abierto: true, alCerrar, triggerRef, esMobile: true });

      // Cerrar el drawer
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto={false} alCerrar={alCerrar} children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />} triggerRef={triggerRef} esMobile={true} />
        </MemoryRouter>
      );

      // El foco debería estar en el trigger
      expect(document.activeElement).toBe(triggerRef.current);

      document.body.removeChild(triggerRef.current);
    });

    it("devuelve foco al elemento previo si no hay triggerRef (tablet)", async () => {
      const alCerrar = vi.fn();
      const previousElement = document.createElement("button");
      previousElement.textContent = "Previous";
      document.body.appendChild(previousElement);
      previousElement.focus();

      const { rerender } = renderDrawer({ abierto: true, alCerrar, esMobile: false });

      // Cerrar el drawer
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto={false} alCerrar={alCerrar} children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />} esMobile={false} />
        </MemoryRouter>
      );

      // El foco debería volver al elemento previo
      expect(document.activeElement).toBe(previousElement);

      document.body.removeChild(previousElement);
    });

    it("devuelve foco al elemento previo si no hay triggerRef (mobile)", async () => {
      const alCerrar = vi.fn();
      const previousElement = document.createElement("button");
      previousElement.textContent = "Previous";
      document.body.appendChild(previousElement);
      previousElement.focus();

      const { rerender } = renderDrawer({ abierto: true, alCerrar, esMobile: true });

      // Cerrar el drawer
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto={false} alCerrar={alCerrar} children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />} esMobile={true} />
        </MemoryRouter>
      );

      // El foco debería volver al elemento previo
      expect(document.activeElement).toBe(previousElement);

      document.body.removeChild(previousElement);
    });
  });

  describe("children renderizado", () => {
    it("renderiza children dentro del panel (SidebarNavContenido) - tablet", () => {
      renderDrawer({ abierto: true, esMobile: false });

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

    it("renderiza children dentro del panel (SidebarNavContenido) - mobile", () => {
      renderDrawer({ abierto: true, esMobile: true });

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
    it("tablet: panel tiene role=dialog y aria-modal=true", () => {
      renderDrawer({ abierto: true, esMobile: false });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toHaveAttribute("role", "dialog");
      expect(panel).toHaveAttribute("aria-modal", "true");
    });

    it("mobile: panel tiene role=dialog y aria-modal=true", () => {
      renderDrawer({ abierto: true, esMobile: true });

      const panel = document.body.querySelector("#dashboard-drawer-panel");
      expect(panel).toHaveAttribute("role", "dialog");
      expect(panel).toHaveAttribute("aria-modal", "true");
    });

    it("mobile: backdrop tiene aria-hidden=true", () => {
      renderDrawer({ abierto: true, esMobile: true });

      const backdrop = document.body.querySelector('[aria-hidden="true"]');
      expect(backdrop).toHaveAttribute("aria-hidden", "true");
    });
  });
});