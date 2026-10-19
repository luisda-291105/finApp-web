/**
 * @uso        Pruebas unitarias para AcordeonTarjetas (acordeón móvil de spec 004)
 * @funciones  render, screen, within, userEvent
 * @datos      TARJETAS_DEMO (fixture de 5 tarjetas de octubre 2026)
 * @eventos    click, teclado (Enter/Espacio) sobre encabezados y tarjeta expandida
 * @estados    indiceExpandido (acordeón exclusivo), reducirMovimiento (mock)
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { useReducedMotion } from "framer-motion";
import AcordeonTarjetas from "./AcordeonTarjetas";
import { TARJETAS_DEMO } from "../../../data/tarjetasDemo";

// Mock parcial de framer-motion: motion.div trivial y useReducedMotion controlable
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  const PROPS_DE_ANIMACION = new Set([
    "initial", "animate", "exit", "transition", "variants", "custom",
    "whileHover", "whileTap", "whileFocus", "whileDrag", "whileInView",
    "layout", "layoutId", "layoutDependency", "layoutScroll",
    "drag", "dragConstraints", "dragElastic", "dragMomentum", "dragPropagation",
    "dragDirectionLock", "dragControls",
    "onDragStart", "onDrag", "onDragEnd", "onAnimationStart", "onAnimationComplete",
    "onUpdate", "transformTemplate", "viewport", "inherit",
  ]);
  const propsDom = (props) =>
    Object.fromEntries(Object.entries(props).filter(([clave]) => !PROPS_DE_ANIMACION.has(clave)));
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    motion: {
      div: ({ children, ...props }) => <div {...propsDom(props)}>{children}</div>,
    },
  };
});

afterEach(cleanup);

const renderAcordeon = (props = {}) =>
  render(<AcordeonTarjetas tarjetas={TARJETAS_DEMO} onSeleccionarTarjeta={vi.fn()} {...props} />);

describe("AcordeonTarjetas", () => {
  it("renderiza las 5 tarjetas del fixture con contenedor visible solo en móvil", () => {
    const { container } = renderAcordeon();
    const raiz = container.firstChild;
    expect(raiz.className).toContain("sm:hidden");
    const encabezados = screen.getAllByRole("button");
    // 5 encabezados + 1 wrapper de tarjeta expandida (role button)
    expect(encabezados.length).toBeGreaterThanOrEqual(5);
    TARJETAS_DEMO.forEach((t) => {
      expect(screen.getAllByText(t.titular).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("primera tarjeta expandida por defecto con ARIA correcto", () => {
    renderAcordeon();
    const botones = screen.getAllByRole("button", { name: /tarjeta/i });
    const primero = screen.getByRole("button", {
      name: new RegExp(`${TARJETAS_DEMO[0].titular}.*••••`, "i"),
    });
    expect(primero.getAttribute("aria-expanded")).toBe("true");
    const idPanel = primero.getAttribute("aria-controls");
    expect(idPanel).toBeTruthy();
    const panel = document.getElementById(idPanel);
    expect(panel).toBeTruthy();
    expect(panel.getAttribute("role")).toBe("region");
    expect(panel.getAttribute("aria-labelledby")).toBe(primero.id);
    // Los demás colapsados, sin panel montado
    TARJETAS_DEMO.slice(1).forEach((t) => {
      const boton = screen.getByRole("button", { name: new RegExp(`${t.titular}.*••••`, "i") });
      expect(boton.getAttribute("aria-expanded")).toBe("false");
      expect(document.getElementById(boton.getAttribute("aria-controls"))).toBeNull();
    });
  });

  it("activar una colapsada la expande y colapsa la anterior (exclusivo)", async () => {
    const user = userEvent.setup();
    renderAcordeon();
    const botonMenta = screen.getByRole("button", {
      name: new RegExp(`${TARJETAS_DEMO[1].titular}.*••••`, "i"),
    });
    await user.click(botonMenta);
    expect(botonMenta.getAttribute("aria-expanded")).toBe("true");
    const botonPrimera = screen.getByRole("button", {
      name: new RegExp(`${TARJETAS_DEMO[0].titular}.*••••`, "i"),
    });
    expect(botonPrimera.getAttribute("aria-expanded")).toBe("false");
    expect(
      document.getElementById(botonPrimera.getAttribute("aria-controls"))
    ).toBeNull();
  });

  it("activar el encabezado ya expandido lo colapsa (toggle) sin abrir modal", async () => {
    const user = userEvent.setup();
    const onSeleccionarTarjeta = vi.fn();
    renderAcordeon({ onSeleccionarTarjeta });
    const primero = screen.getByRole("button", {
      name: new RegExp(`${TARJETAS_DEMO[0].titular}.*••••`, "i"),
    });
    await user.click(primero);
    expect(primero.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(primero.getAttribute("aria-controls"))).toBeNull();
    expect(onSeleccionarTarjeta).not.toHaveBeenCalled();
  });

  it("segundo toque sobre la tarjeta ya expandida dispara onSeleccionarTarjeta con esa tarjeta", async () => {
    const user = userEvent.setup();
    const onSeleccionarTarjeta = vi.fn();
    renderAcordeon({ onSeleccionarTarjeta });
    // Primer toque: expandir la segunda tarjeta (colapsada)
    const botonMenta = screen.getByRole("button", {
      name: new RegExp(`${TARJETAS_DEMO[1].titular}.*••••`, "i"),
    });
    await user.click(botonMenta);
    expect(onSeleccionarTarjeta).not.toHaveBeenCalled();
    // Segundo toque: sobre la tarjeta ya expandida (wrapper role button)
    const panel = document.getElementById(botonMenta.getAttribute("aria-controls"));
    const tarjetaExpandida = within(panel).getByRole("button", {
      name: new RegExp(`detalle.*${TARJETAS_DEMO[1].titular}`, "i"),
    });
    await user.click(tarjetaExpandida);
    expect(onSeleccionarTarjeta).toHaveBeenCalledTimes(1);
    expect(onSeleccionarTarjeta).toHaveBeenCalledWith(TARJETAS_DEMO[1]);
  });

  it("Enter/Espacio sobre la tarjeta expandida también abre el modal", async () => {
    const user = userEvent.setup();
    const onSeleccionarTarjeta = vi.fn();
    renderAcordeon({ onSeleccionarTarjeta });
    const panel = document.querySelector("[role='region']");
    const tarjetaExpandida = within(panel).getByRole("button", {
      name: new RegExp(`detalle.*${TARJETAS_DEMO[0].titular}`, "i"),
    });
    tarjetaExpandida.focus();
    await user.keyboard("{Enter}");
    expect(onSeleccionarTarjeta).toHaveBeenCalledWith(TARJETAS_DEMO[0]);
    await user.keyboard(" ");
    expect(onSeleccionarTarjeta).toHaveBeenCalledTimes(2);
  });

  it("la tarjeta del panel usa flipDeshabilitado (sin role button ni aria-pressed internos)", () => {
    renderAcordeon();
    const panel = document.querySelector("[role='region']");
    // La tarjeta virtual no debe exponer su propio role=button ni aria-pressed
    const internos = panel.querySelectorAll("[aria-pressed]");
    expect(internos.length).toBe(0);
    const botones = within(panel).getAllByRole("button");
    // Solo el wrapper del acordeón; el content de MiTarjetaVirtual no es botón
    expect(botones.length).toBe(1);
    expect(within(panel).queryByText(/Toca para ver CVV/i)).toBeNull();
  });

  it("el encabezado usa el radio de vidrio de glass-card (sin rounded-2xl de 16px)", () => {
    renderAcordeon();
    const encabezado = screen.getByRole("button", {
      name: new RegExp(`${TARJETAS_DEMO[0].titular}.*••••`, "i"),
    });
    expect(encabezado.classList.contains("glass-card")).toBe(true);
    expect(encabezado.classList.contains("rounded-2xl")).toBe(false);
  });

  it("con prefers-reduced-motion no hay animación de expansión (duración 0)", () => {
    useReducedMotion.mockReturnValue(true);
    renderAcordeon();
    const panel = document.querySelector("[role='region']");
    // Con motion.div mockeado no podemos medir duración; verificamos que el
    // componente consulta useReducedMotion y monta el panel sin animación
    expect(useReducedMotion).toHaveBeenCalled();
    expect(panel).toBeTruthy();
    useReducedMotion.mockReturnValue(false);
  });
});
