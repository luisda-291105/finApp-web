/**
 * @uso        Pruebas unitarias para ModalTarjeta (modal accesible de spec 004)
 * @funciones  render, screen, within, userEvent
 * @datos      TARJETAS_DEMO y MOVIMIENTOS_DEMO (fixture fijo octubre 2026)
 * @eventos    Esc, clic en backdrop/contenido, botón de cierre, Tab/Shift+Tab (trampa manual)
 *             y gestos de puntero (deslizar hacia abajo solo en móvil)
 * @estados    tarjeta (null = cerrado), reducirMovimiento (mock controlable) y viewport
 *             explícito (innerWidth + matchMedia) para el corte único de 768px
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { useReducedMotion } from "framer-motion";
import ModalTarjeta from "./domain/modales/ModalTarjeta";
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

/**
 * Mock de `matchMedia` dependiente del ancho simulado: `matches` es verdadero cuando el ancho
 * alcanza el `min-width` de la consulta. Así el corte único de 768px (RF-20) que usa el gesto
 * se controla de forma explícita, sin depender del mock global de `vitest.setup.js`.
 */
const crearMockMatchMedia = (ancho) =>
  vi.fn().mockImplementation((query) => {
    const minimo = Number((/(\d+)px/.exec(query) || [])[1] ?? 0);
    return {
      matches: ancho >= minimo,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });

/** Fija el ancho de viewport simulado y su `matchMedia` coherente. */
const fijarViewport = (ancho) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: ancho,
  });
  window.matchMedia = crearMockMatchMedia(ancho);
};

// Por defecto, pantallas grandes (≥768px): el gesto de deslizar solo existe en móvil.
beforeEach(() => {
  fijarViewport(1024);
  useReducedMotion.mockReturnValue(false);
});

afterEach(() => {
  cleanup();
  fijarViewport(1024);
});

const tarjetaConMovimientos = TARJETAS_DEMO[0]; // tarjeta-azul, MARÍA GARCÍA
const tarjetaSinMovimientos = TARJETAS_DEMO.find((t) => t.id === "tarjeta-azul-2");

const renderModal = (props = {}) =>
  render(<ModalTarjeta tarjeta={tarjetaConMovimientos} onCerrar={vi.fn()} {...props} />);

/** Despacha un evento de puntero nativo con las propiedades que lee el gesto. */
const dispararPuntero = (elemento, tipo, props = {}) => {
  const evento = new Event(tipo, { bubbles: true, cancelable: true });
  Object.assign(evento, { isPrimary: true, pointerId: 7, clientX: 0, clientY: 0, ...props });
  elemento.dispatchEvent(evento);
};

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
    it("Esc cierra una sola vez por pulsación mediante el mecanismo único", async () => {
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      await userEvent.keyboard("{Escape}");
      expect(onCerrar).toHaveBeenCalledTimes(1);

      // Una pulsación ⇒ una llamada: la segunda añade exactamente otra.
      await userEvent.keyboard("{Escape}");
      expect(onCerrar).toHaveBeenCalledTimes(2);
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

  describe("gesto de deslizar hacia abajo (solo móvil, RF-06/RF-12)", () => {
    it("cierra al deslizar hacia abajo en móvil, con una sola llamada", () => {
      fijarViewport(375);
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      const dialog = screen.getByRole("dialog");

      dispararPuntero(dialog, "pointerdown", { clientY: 0 });
      dispararPuntero(dialog, "pointermove", { clientY: 160 });
      dispararPuntero(dialog, "pointerup", { clientY: 160 });

      expect(onCerrar).toHaveBeenCalledTimes(1);
    });

    it("no cierra con un arrastre corto ni predominantemente horizontal", () => {
      fijarViewport(375);
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      const dialog = screen.getByRole("dialog");

      dispararPuntero(dialog, "pointerdown", { clientX: 0, clientY: 0 });
      dispararPuntero(dialog, "pointerup", { clientX: 0, clientY: 40 });
      dispararPuntero(dialog, "pointerdown", { clientX: 0, clientY: 0 });
      dispararPuntero(dialog, "pointerup", { clientX: 200, clientY: 120 });

      expect(onCerrar).not.toHaveBeenCalled();
    });

    it("no arranca si el arrastre comienza sobre un control interactivo (flip o «X»)", () => {
      fijarViewport(375);
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      const dialog = screen.getByRole("dialog");
      const caraInteractiva = within(dialog).getByRole("button", {
        name: /reverso de la tarjeta virtual/i,
      });
      const botonCerrar = screen.getByRole("button", { name: "Cerrar detalle de tarjeta" });

      [caraInteractiva, botonCerrar].forEach((control) => {
        dispararPuntero(control, "pointerdown", { clientY: 0 });
        dispararPuntero(control, "pointermove", { clientY: 200 });
        dispararPuntero(control, "pointerup", { clientY: 200 });
      });

      expect(onCerrar).not.toHaveBeenCalled();
    });

    it("no arranca si el panel ya está desplazado (prioridad del scroll, CL-09)", () => {
      fijarViewport(375);
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      const dialog = screen.getByRole("dialog");
      Object.defineProperty(dialog, "scrollTop", { value: 40, writable: true, configurable: true });

      dispararPuntero(dialog, "pointerdown", { clientY: 0 });
      dispararPuntero(dialog, "pointermove", { clientY: 200 });
      dispararPuntero(dialog, "pointerup", { clientY: 200 });

      expect(onCerrar).not.toHaveBeenCalled();
    });

    it("no se aplica en pantallas grandes (≥768px)", () => {
      fijarViewport(1024);
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      const dialog = screen.getByRole("dialog");

      dispararPuntero(dialog, "pointerdown", { clientY: 0 });
      dispararPuntero(dialog, "pointermove", { clientY: 200 });
      dispararPuntero(dialog, "pointerup", { clientY: 200 });

      expect(onCerrar).not.toHaveBeenCalled();
    });

    it("no introduce transformación ni transición en el panel (RF-21)", () => {
      fijarViewport(375);
      const onCerrar = vi.fn();
      renderModal({ onCerrar });
      const dialog = screen.getByRole("dialog");

      dispararPuntero(dialog, "pointerdown", { clientY: 0 });
      dispararPuntero(dialog, "pointermove", { clientY: 200 });
      dispararPuntero(dialog, "pointerup", { clientY: 200 });

      expect(dialog.style.transform).toBe("");
      expect(dialog.style.transition).toBe("");
    });
  });

  describe("foco y accesibilidad de teclado", () => {
    it("el foco inicial ES el diálogo (el contenedor), no un botón", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      expect(document.activeElement).toBe(dialog);
      expect(dialog.contains(document.activeElement)).toBe(true);
      // El contenedor queda fuera del ciclo de Tab
      expect(dialog.getAttribute("tabindex")).toBe("-1");
    });

    it("el foco inicial no está en la «X» ni en el botón de flip", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      const botonCerrar = screen.getByRole("button", { name: "Cerrar detalle de tarjeta" });
      const caraInteractiva = within(dialog).getByRole("button", {
        name: /reverso de la tarjeta virtual/i,
      });

      expect(document.activeElement).not.toBe(botonCerrar);
      expect(document.activeElement).not.toBe(caraInteractiva);
    });

    it("Tab y Shift+Tab ciclan dentro del modal sin salir del diálogo (trampa manual)", async () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      const focoables = dialog.querySelectorAll("button, [tabindex='0']");
      expect(focoables.length).toBeGreaterThan(0);
      const primero = focoables[0];
      const ultimo = focoables[focoables.length - 1];
      // Situar el foco en el último elemento focoable y pulsar Tab: vuelve al primero
      ultimo.focus();
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(document.activeElement).toBe(primero);
      // Shift+Tab desde el primero: va al último y sigue dentro del diálogo
      await userEvent.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(document.activeElement).toBe(ultimo);
    });

    it("renderiza correctamente con prefers-reduced-motion activo", () => {
      useReducedMotion.mockReturnValue(true);
      renderModal();
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
  });
});
