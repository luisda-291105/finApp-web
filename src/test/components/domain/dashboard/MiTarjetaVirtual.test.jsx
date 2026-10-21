/**
 * @uso        Pruebas unitarias para MiTarjetaVirtual
 * @funciones  render, fireEvent, screen, within
 * @datos      Props de demostración
 * @eventos    click, keydown
 * @estados    volteada (frente/reverso)
 * @usadoPor   Vitest
 */
import { StrictMode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import MiTarjetaVirtual from "./MiTarjetaVirtual";

// Mock de useReducedMotion de Framer Motion
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
  colorTema: "azul",
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

  it("dispara callback onFlip con true al voltear a reverso y false al volver", async () => {
    const onFlip = vi.fn();
    const user = userEvent.setup();
    render(<MiTarjetaVirtual {...propsDefault} onFlip={onFlip} />);

    const tarjeta = screen.getByRole("button", { name: /ver reverso/i });
    await user.click(tarjeta);

    // Esperar a que se dispare el callback (600ms + margen)
    await new Promise((r) => setTimeout(r, 650));

    expect(onFlip).toHaveBeenCalledWith(true);

    // Click de vuelta
    await user.click(screen.getByRole("button", { name: /ver frente/i }));

    await new Promise((r) => setTimeout(r, 650));

    expect(onFlip).toHaveBeenCalledWith(false);
  });

  it("aplica gradiente correcto según colorTema usando tokens del tema", () => {
    const { container, rerender } = render(<MiTarjetaVirtual {...propsDefault} colorTema="azul" />);
    // El gradiente está en el div interior del frente (hijo del data-testid)
    const frenteInner = container.querySelector("[data-testid='tarjeta-frente'] > div");
    expect(frenteInner?.classList.contains("from-cat-income")).toBe(true);

    rerender(<MiTarjetaVirtual {...propsDefault} colorTema="menta" />);
    const frenteInnerMenta = container.querySelector("[data-testid='tarjeta-frente'] > div");
    expect(frenteInnerMenta?.classList.contains("from-emerald-primary")).toBe(true);
    expect(frenteInnerMenta?.classList.contains("via-emerald-hover")).toBe(true);

    rerender(<MiTarjetaVirtual {...propsDefault} colorTema="morado" />);
    const frenteInnerMorado = container.querySelector("[data-testid='tarjeta-frente'] > div");
    expect(frenteInnerMorado?.classList.contains("from-cat-other")).toBe(true);
  });

  it("onFlip se dispara una sola vez por giro, incluso en StrictMode", async () => {
    const onFlip = vi.fn();
    const user = userEvent.setup();
    render(
      <StrictMode>
        <MiTarjetaVirtual {...propsDefault} onFlip={onFlip} />
      </StrictMode>
    );

    const tarjeta = screen.getByRole("button", { name: /ver reverso/i });
    await user.click(tarjeta);

    await new Promise((r) => setTimeout(r, 650));

    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(onFlip).toHaveBeenCalledWith(true);
  });

  it("onFlip NO se dispara al montar en StrictMode (guardia por valor anterior)", () => {
    vi.useFakeTimers();
    const onFlip = vi.fn();
    render(
      <StrictMode>
        <MiTarjetaVirtual {...propsDefault} onFlip={onFlip} />
      </StrictMode>
    );

    vi.advanceTimersByTime(1200);

    expect(onFlip).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("onFlip se dispara en cada giro, no solo en el primero", async () => {
    const onFlip = vi.fn();
    const user = userEvent.setup();
    render(<MiTarjetaVirtual {...propsDefault} onFlip={onFlip} />);

    const tarjeta = screen.getByRole("button", { name: /ver reverso/i });
    await user.click(tarjeta);
    await new Promise((r) => setTimeout(r, 650));
    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(onFlip).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByRole("button", { name: /ver frente/i }));
    await new Promise((r) => setTimeout(r, 650));
    expect(onFlip).toHaveBeenCalledTimes(2);
    expect(onFlip).toHaveBeenLastCalledWith(false);
  });

  it("tiene atributos de accesibilidad correctos", () => {
    render(<MiTarjetaVirtual {...propsDefault} />);

    const tarjeta = screen.getByRole("button", { name: /ver reverso/i });
    expect(tarjeta.getAttribute("tabIndex")).toBe("0");
    expect(tarjeta.getAttribute("aria-pressed")).toBe("false");
    expect(tarjeta.getAttribute("aria-label")).toBe("Ver reverso de la tarjeta virtual (CVV)");

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

  describe("flipDeshabilitado", () => {
    it("no gira la tarjeta con click", async () => {
      const user = userEvent.setup();
      render(<MiTarjetaVirtual {...propsDefault} flipDeshabilitado />);

      const frente = screen.getByTestId("tarjeta-frente");
      await user.click(frente);

      // El aria-label interactivo no existe y la etiqueta sr-only sigue en "frente"
      expect(screen.queryByRole("button")).toBeNull();
      expect(screen.getByText("Mostrando frente de la tarjeta virtual")).toBeDefined();
      expect(screen.queryByText("Mostrando reverso de la tarjeta con CVV")).toBeNull();
      // El reverso permanece inaccesible
      expect(screen.getByText("CVV").closest("[aria-hidden]").getAttribute("aria-hidden")).toBe("true");
    });

    it("no gira la tarjeta con teclado (Enter/Espacio) ni gestiona focus", async () => {
      const user = userEvent.setup();
      const { container } = render(<MiTarjetaVirtual {...propsDefault} flipDeshabilitado />);

      // No hay elemento enfocable dentro de la tarjeta: Tab no entra
      await user.tab();
      expect(container.contains(document.activeElement)).toBe(false);

      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(screen.getByText("Mostrando frente de la tarjeta virtual")).toBeDefined();
      expect(screen.queryByText("Mostrando reverso de la tarjeta con CVV")).toBeNull();
    });

    it("no expone role=button, tabIndex ni aria-pressed en la cara de la tarjeta", () => {
      render(<MiTarjetaVirtual {...propsDefault} flipDeshabilitado />);

      expect(screen.queryByRole("button")).toBeNull();
      const frente = screen.getByTestId("tarjeta-frente");
      const cara = frente.parentElement;
      expect(cara.getAttribute("role")).toBeNull();
      expect(cara.getAttribute("tabindex")).toBeNull();
      expect(cara.getAttribute("aria-pressed")).toBeNull();
    });

    it("no muestra la pill 'Toca para ver CVV'", () => {
      render(<MiTarjetaVirtual {...propsDefault} flipDeshabilitado />);

      expect(screen.queryByText("Toca para ver CVV")).toBeNull();
    });

    it("sigue mostrando el frente con todos los datos", () => {
      const { container } = render(<MiTarjetaVirtual {...propsDefault} flipDeshabilitado />);

      expect(container.querySelector("[data-testid='chip-emv']")).not.toBeNull();
      expect(screen.getByText("4242 4242 4242 4242")).toBeDefined();
      expect(screen.getByText("MARÍA GARCÍA")).toBeDefined();
      expect(screen.getByText("12/28")).toBeDefined();
      expect(container.querySelector("[data-testid='acento-mint']")).not.toBeNull();
      // Etiqueta sr-only siempre de frente
      expect(screen.getByText("Mostrando frente de la tarjeta virtual")).toBeDefined();
    });

    it("no dispara onFlip al interactuar", async () => {
      const onFlip = vi.fn();
      const user = userEvent.setup();
      render(<MiTarjetaVirtual {...propsDefault} flipDeshabilitado onFlip={onFlip} />);

      await user.click(screen.getByTestId("tarjeta-frente"));
      await new Promise((r) => setTimeout(r, 650));

      expect(onFlip).not.toHaveBeenCalled();
    });
  });
});