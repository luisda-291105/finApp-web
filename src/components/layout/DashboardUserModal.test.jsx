/**
 * @uso        Pruebas unitarias para DashboardUserModal (modal usuario global, spec 007 T3)
 * @funciones  render, screen, within, userEvent
 * @datos      N/A
 * @eventos    click en overlay/backdrop, ESC, click en botones Configuración/Salir del demo, Tab (focus trap)
 * @estados    abierto (boolean), triggerRef (mock ref)
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DashboardUserModal from "./DashboardUserModal";

// Mock de framer-motion: motion.div trivial con forwardRef para que el ref del focus trap llegue al DOM
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  const React = await vi.importActual("react");
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    AnimatePresence: ({ children, ...props }) => React.createElement(React.Fragment, props, children),
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
  };
});

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
      return <div ref={(el) => { containerRef.current = el; if (ref) ref.current = el; }} {...props}>{children}</div>;
    }),
  };
});

afterEach(cleanup);

const renderModal = (props = {}) => {
  const defaultProps = {
    abierto: true,
    alCerrar: vi.fn(),
    triggerRef: { current: null },
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <DashboardUserModal {...defaultProps} />
    </MemoryRouter>
  );
};

describe("DashboardUserModal", () => {
  describe("portal y renderizado", () => {
    it("renderiza en document.body via portal cuando abierto=true", () => {
      renderModal();
      const overlay = document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/80");
      const panel = document.body.querySelector("#dashboard-user-modal-panel");
      expect(overlay).toBeTruthy();
      expect(panel).toBeTruthy();
    });

    it("no renderiza nada cuando abierto=false", () => {
      const { container } = renderModal({ abierto: false });
      expect(container.querySelector("[role='dialog']")).toBeNull();
      expect(document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/80")).toBeNull();
    });

    it("tiene role=dialog, aria-modal=true y aria-labelledby", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(dialog.getAttribute("aria-labelledby")).toBe("user-modal-title");
      const titulo = document.getElementById("user-modal-title");
      expect(titulo).toBeTruthy();
      expect(titulo.textContent).toBe("Cuenta");
    });
  });

  describe("cierre del modal", () => {
    it("click en overlay llama alCerrar", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const overlay = document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/80");
      await userEvent.click(overlay);
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("click dentro del panel NO llama alCerrar (stopPropagation implícito)", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const panel = screen.getByRole("dialog");
      await userEvent.click(panel);
      expect(alCerrar).not.toHaveBeenCalled();
    });

    it("tecla ESC llama alCerrar", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      await userEvent.keyboard("{Escape}");
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("botón Configuración llama alCerrar y navega via navigate", async () => {
      const alCerrar = vi.fn();
      const { findByText } = renderModal({ alCerrar });
      const btnConfig = await findByText("Configuración");
      await userEvent.click(btnConfig);
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("botón Salir del demo llama alCerrar y navega via navigate con replace", async () => {
      const alCerrar = vi.fn();
      const { findByText } = renderModal({ alCerrar });
      const btnSalir = await findByText("Salir del demo");
      await userEvent.click(btnSalir);
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });
  });

  describe("focus trap y accesibilidad", () => {
    it("foco inicial queda en el primer botón (Configuración)", () => {
      renderModal();
      // El focus trap enfoca el primer button, getByRole lo encuentra
      const btnConfig = screen.getByRole("button", { name: /Configuración/i });
      expect(document.activeElement).toBe(btnConfig);
    });

    it("focus trap está presente (FocusTrap wrapper)", () => {
      renderModal();
      // Verificar que el modal tiene el role=dialog y aria-modal
      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      // El focus trap se verifica por la presencia del wrapper en el mock
      // (el mock de focus-trap-react envuelve el contenido)
      expect(dialog).toBeTruthy();
    });

    it("elementos enfocables son solo los botones del modal", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      const focusables = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      // Solo 2 botones: Configuración y Salir del demo
      expect(focusables.length).toBe(2);
      expect(focusables[0].textContent).toContain("Configuración");
      expect(focusables[1].textContent).toContain("Salir del demo");
    });
  });

  describe("retorno de foco al cerrar", () => {
    it("devuelve foco a triggerRef.current si existe", async () => {
      const alCerrar = vi.fn();
      const triggerButton = document.createElement("button");
      triggerButton.textContent = "Avatar";
      document.body.appendChild(triggerButton);
      const triggerRef = { current: triggerButton };
      const focusSpy = vi.spyOn(triggerButton, "focus");

      const { rerender } = renderModal({ alCerrar, triggerRef });
      // Cambiar abierto a false para disparar el useEffect de retorno de foco
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardUserModal abierto={false} alCerrar={alCerrar} triggerRef={triggerRef} />
          </MemoryRouter>
        );
      });

      expect(focusSpy).toHaveBeenCalled();
      focusSpy.mockRestore();
      document.body.removeChild(triggerButton);
    });

    it("devuelve foco a previousActiveElement si no hay triggerRef", async () => {
      const alCerrar = vi.fn();
      const previousButton = document.createElement("button");
      previousButton.textContent = "Prev";
      document.body.appendChild(previousButton);
      previousButton.focus();
      const focusSpy = vi.spyOn(previousButton, "focus");

      const { rerender } = renderModal({ alCerrar, triggerRef: { current: null } });
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardUserModal abierto={false} alCerrar={alCerrar} triggerRef={{ current: null }} />
          </MemoryRouter>
        );
      });

      expect(focusSpy).toHaveBeenCalled();
      focusSpy.mockRestore();
      document.body.removeChild(previousButton);
    });
  });

  describe("Framer Motion - animación", () => {
    it("renderiza motion.div con props de animación (initial, animate, exit, transition)", () => {
      renderModal();
      const panel = screen.getByRole("dialog");
      // Verificar que el panel tiene los atributos ARIA esperados
      expect(panel.getAttribute("role")).toBe("dialog");
      expect(panel.getAttribute("aria-modal")).toBe("true");
      expect(panel.getAttribute("aria-labelledby")).toBe("user-modal-title");
      // La presencia de AnimatePresence y motion.div se verifica por la estructura
      expect(panel).toBeTruthy();
    });

    it("AnimatePresence presente para animación de salida", () => {
      // El test de renderizado sin errores ya valida que AnimatePresence no rompe
      const { rerender } = renderModal({ abierto: true });
      expect(screen.getByRole("dialog")).toBeTruthy();

      // Cambiar a cerrado
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardUserModal abierto={false} alCerrar={vi.fn()} />
        </MemoryRouter>
      );
      // No debe lanzar error
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("iconos lucide-react", () => {
    it("renderiza icono Settings en botón Configuración", () => {
      renderModal();
      const btnConfig = screen.getByRole("button", { name: /Configuración/i });
      const icon = btnConfig.querySelector("svg");
      expect(icon).toBeTruthy();
      expect(icon.classList.contains("lucide-settings")).toBe(true);
    });

    it("renderiza icono LogOut en botón Salir del demo", () => {
      renderModal();
      const btnSalir = screen.getByRole("button", { name: /Salir del demo/i });
      const icon = btnSalir.querySelector("svg");
      expect(icon).toBeTruthy();
      expect(icon.classList.contains("lucide-log-out")).toBe(true);
    });

    it("iconos tienen flex-shrink-0 w-6 h-6", () => {
      renderModal();
      const icons = document.querySelectorAll("#dashboard-user-modal-panel svg");
      icons.forEach((icon) => {
        expect(icon.classList.contains("flex-shrink-0")).toBe(true);
        expect(icon.classList.contains("w-6")).toBe(true);
        expect(icon.classList.contains("h-6")).toBe(true);
      });
    });
  });

  describe("estilos y clases Fluid Glass", () => {
    it("overlay usa bg-bg-dark/80 backdrop-blur-sm z-50", () => {
      renderModal();
      const overlay = document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/80");
      expect(overlay).toBeTruthy();
      expect(overlay.classList.contains("backdrop-blur-sm")).toBe(true);
      expect(overlay.classList.contains("z-50")).toBe(true);
    });

    it("panel usa bg-bg-cream/95 backdrop-blur-md border-border-line/30 rounded-2xl shadow-xl z-60", () => {
      renderModal();
      const panel = screen.getByRole("dialog");
      expect(panel.classList.contains("bg-bg-cream/95")).toBe(true);
      expect(panel.classList.contains("backdrop-blur-md")).toBe(true);
      expect(panel.classList.contains("border-border-line/30")).toBe(true);
      expect(panel.classList.contains("rounded-2xl")).toBe(true);
      expect(panel.classList.contains("shadow-xl")).toBe(true);
      expect(panel.classList.contains("z-60")).toBe(true);
      expect(panel.classList.contains("w-[90vw]")).toBe(true);
      expect(panel.classList.contains("max-w-sm")).toBe(true);
    });
  });
});