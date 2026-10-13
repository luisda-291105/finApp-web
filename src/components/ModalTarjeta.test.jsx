/**
 * @uso        Pruebas unitarias para ModalTarjeta (modal accesible de spec 004)
 * @funciones  render, screen, within, userEvent
 * @datos      TARJETAS_DEMO y MOVIMIENTOS_DEMO (fixture fijo octubre 2026)
 * @eventos    Esc, clic en backdrop/contenido, botón de cierre, Tab (focus trap)
 * @estados    tarjeta (null = cerrado), reducirMovimiento (mock controlable)
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { useReducedMotion } from "framer-motion";
import ModalTarjeta from "./ModalTarjeta";
import { TARJETAS_DEMO, MOVIMIENTOS_DEMO } from "../data/tarjetasDemo";

// Mock parcial de framer-motion: motion.div trivial y useReducedMotion controlable
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  const React = await vi.importActual("react");
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    motion: {
      // forwardRef para que el ref del diálogo (focus trap) llegue al DOM
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
  };
});

afterEach(cleanup);

const tarjetaConMovimientos = TARJETAS_DEMO[0]; // tarjeta-azul, MARÍA GARCÍA
const tarjetaSinMovimientos = TARJETAS_DEMO.find((t) => t.id === "tarjeta-azul-2");

const renderModal = (props = {}) =>
  render(<ModalTarjeta tarjeta={tarjetaConMovimientos} onCerrar={vi.fn()} {...props} />);

describe("ModalTarjeta", () => {
  describe("apertura y ARIA", () => {
    it("no renderiza nada cuando tarjeta es null (cerrado)", () => {
      const { container } = renderModal({ tarjeta: null });
      expect(container.querySelector("[role='dialog']")).toBeNull();
      expect(container.innerHTML).toBe("");
    });

    it("renderiza role=dialog con aria-modal y aria-labelledby al titular", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeTruthy();
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      const idTitulo = dialog.getAttribute("aria-labelledby");
      expect(idTitulo).toBeTruthy();
      const titulo = document.getElementById(idTitulo);
      expect(titulo).toBeTruthy();
      expect(titulo.textContent).toContain(tarjetaConMovimientos.titular);
    });
  });

  describe("contenido: tarjeta con flip + datos + log", () => {
    it("muestra la tarjeta con flip habilitado (role button interno) y sus datos", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      // Flip habilitado: la cara interna expone role="button" con aria-pressed
      const caraInteractiva = within(dialog).getByRole("button", {
        name: /reverso de la tarjeta virtual/i,
      });
      expect(caraInteractiva.getAttribute("aria-pressed")).toBe("false");
      // Datos básicos: titular, número enmascarado, expiración y entidad
      expect(within(dialog).getAllByText(tarjetaConMovimientos.titular).length).toBeGreaterThanOrEqual(1);
      const enmascarado = tarjetaConMovimientos.numero.replace(/\s/g, "").slice(-4);
      expect(within(dialog).getByText(`•••• ${enmascarado}`)).toBeTruthy();
      expect(within(dialog).getAllByText(tarjetaConMovimientos.expiracion).length).toBeGreaterThanOrEqual(1);
      expect(within(dialog).getAllByText(tarjetaConMovimientos.entidad).length).toBeGreaterThanOrEqual(1);
    });

    it("lista los movimientos del fixture para esa tarjeta", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      MOVIMIENTOS_DEMO[tarjetaConMovimientos.id].forEach((mov) => {
        expect(within(dialog).getByText(mov.descripcion)).toBeTruthy();
      });
    });

    it("muestra el estado vacío cuando la tarjeta no tiene movimientos", () => {
      renderModal({ tarjeta: tarjetaSinMovimientos });
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByText("Sin movimientos este mes")).toBeTruthy();
    });
  });

  describe("cierre del modal", () => {
    it("Esc cierra llamando onCerrar", async () => {
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      await userEvent.keyboard("{Escape}");
      expect(onCerrar).toHaveBeenCalledTimes(1);
    });

    it("clic en el backdrop cierra y clic dentro no cierra", async () => {
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      const dialog = screen.getByRole("dialog");
      const backdrop = dialog.parentElement;
      // Clic dentro del panel: no cierra
      await userEvent.click(dialog);
      expect(onCerrar).not.toHaveBeenCalled();
      // Clic en el backdrop: cierra
      await userEvent.click(backdrop);
      expect(onCerrar).toHaveBeenCalledTimes(1);
    });

    it("el botón 'Cerrar detalle de tarjeta' cierra", async () => {
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      await userEvent.click(screen.getByRole("button", { name: "Cerrar detalle de tarjeta" }));
      expect(onCerrar).toHaveBeenCalledTimes(1);
    });
  });

  describe("foco y accesibilidad de teclado", () => {
    it("el foco inicial queda dentro del diálogo", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it("Tab cicla dentro del modal sin salir del diálogo (focus trap)", async () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      const focoables = dialog.querySelectorAll("button, [tabindex='0']");
      expect(focoables.length).toBeGreaterThan(0);
      // Situar el foco en el último elemento focoable y pulsar Tab
      const ultimo = focoables[focoables.length - 1];
      ultimo.focus();
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(document.activeElement).toBe(focoables[0]);
    });

    it("renderiza correctamente con prefers-reduced-motion activo", () => {
      useReducedMotion.mockReturnValue(true);
      renderModal();
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
  });
});
