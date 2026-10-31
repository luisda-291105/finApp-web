/**
 * @uso        Pruebas unitarias para MiTarjetaVirtual
 * @funciones  render, fireEvent, screen, within
 * @datos      Props de demostración
 * @eventos    click, keydown
 * @estados    volteada (frente/reverso)
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import MiTarjetaVirtual from "../../../../components/domain/dashboard/MiTarjetaVirtual";

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

const propsDefault = {
  titular: "MARÍA GARCÍA",
  numero: "4242 4242 4242 4242",
  expiracion: "12/28",
  cvv: "847",
  entidad: "FinApp",
};

afterEach(cleanup);

describe("MiTarjetaVirtual", () => {
  it("renderiza el frente con todos los campos requeridos", () => {
    const { container } = render(<MiTarjetaVirtual {...propsDefault} />);

    // Chip EMV (svg presente via testid)
    expect(container.querySelector("[data-testid='chip-emv']")).toBeDefined();
    // Número de tarjeta
    expect(screen.getByText("4242 4242 4242 4242")).toBeDefined();
    // Titular
    expect(screen.getByText("TITULAR")).toBeDefined();
    expect(screen.getByText("MARÍA GARCÍA")).toBeDefined();
    // Expiración
    expect(screen.getByText("EXPIRA")).toBeDefined();
    expect(screen.getByText("12/28")).toBeDefined();
    // Entidad (en el frente)
    const frenteContainer = container.querySelector("[data-testid='tarjeta-frente']");
    expect(frenteContainer && within(frenteContainer).getByText("FinApp")).toBeDefined();
    // Acento mint (svg shield)
    expect(container.querySelector("[data-testid='acento-mint']")).toBeDefined();
  });

  it("hace flip al hacer click y muestra el reverso con CVV", async () => {
    const user = userEvent.setup();
    render(<MiTarjetaVirtual {...propsDefault} />);

    const tarjeta = screen.getByRole("button", { name: /ver reverso/i });
    await user.click(tarjeta);

    // Debe mostrar reverso
    expect(screen.getByText("CVV")).toBeDefined();
    expect(screen.getByText("847")).toBeDefined();
    expect(screen.getByText("CÓDIGO DE SEGURIDAD")).toBeDefined();
    expect(screen.getByText(/tarjeta virtual emitida por finapp/i)).toBeDefined();
  });

  it("hace flip al presionar Enter o Espacio (teclado)", async () => {
    const user = userEvent.setup();
    render(<MiTarjetaVirtual {...propsDefault} />);

    const tarjeta = screen.getByRole("button", { name: /ver reverso/i });
    await user.keyboard("{Enter}");

    expect(screen.getByText("CVV")).toBeDefined();
    expect(screen.getByText("847")).toBeDefined();

    // Volver al frente con Espacio
    await user.keyboard(" ");
    expect(screen.getByText("4242 4242 4242 4242")).toBeDefined();
  });

  it("tiene atributos de accesibilidad correctos", () => {
    render(<MiTarjetaVirtual {...propsDefault} />);

    const tarjeta = screen.getByRole("button", { name: /ver reverso/i });
    expect(tarjeta.getAttribute("tabIndex")).toBe("0");
    expect(tarjeta.getAttribute("aria-pressed")).toBe("false");
    expect(tarjeta.getAttribute("aria-label")).toBe("Ver reverso de la tarjeta virtual");

    // Foco visible: la clase glass-card tiene focus-visible en index.css
    expect(tarjeta.classList.contains("glass-card")).toBe(true);
  });

  it("muestra etiqueta de estado para lectores de pantalla", () => {
    render(<MiTarjetaVirtual {...propsDefault} />);

    const estadoInicial = screen.getByText("Mostrando frente de la tarjeta virtual");
    expect(estadoInicial).toBeDefined();
  });

  it("las dos caras heredan el radio del contenedor glass-card", () => {
    render(<MiTarjetaVirtual {...propsDefault} />);

    const frente = screen.getByTestId("tarjeta-frente");
    const reverso = frente.nextElementSibling;

    [frente, reverso].forEach((cara) => {
      expect(cara).not.toBeNull();
      expect(cara.classList.contains("rounded-[inherit]")).toBe(true);
      expect(cara.classList.contains("rounded-2xl")).toBe(false);
    });
  });

});
