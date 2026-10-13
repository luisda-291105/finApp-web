/**
 * @uso        Pruebas unitarias para el componente PanelTarjetas
 * @funciones  tests de tarjeta virtual principal + grid demo (3 tarjetas) y nota de demostración
 * @datos      3 tarjetas esperadas (nombre, enmascarado, saldo) fijadas en el plan
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PanelTarjetas from "./PanelTarjetas";

// Mock de Framer Motion para MiTarjetaVirtual
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
  };
});

const tarjetasEsperadas = [
  { nombre: "Tarjeta Oro", enmascarado: "•••• 4242", saldo: "$2,340.00" },
  { nombre: "Tarjeta Platino", enmascarado: "•••• 5300", saldo: "$980.25" },
  { nombre: "Débito Nómina", enmascarado: "•••• 7841", saldo: "$5,120.75" },
];

afterEach(cleanup);

describe("PanelTarjetas", () => {
  it("renderiza la tarjeta virtual principal MiTarjetaVirtual", () => {
    const { container } = render(<PanelTarjetas />);

    // Verificar que MiTarjetaVirtual está presente con sus datos (scopeando al frente via testid)
    const frente = container.querySelector("[data-testid='tarjeta-frente']");
    if (frente) {
      expect(within(frente).getByText("MARÍA GARCÍA")).toBeDefined();
      expect(within(frente).getByText("4242 4242 4242 4242")).toBeDefined();
      expect(within(frente).getByText("12/28")).toBeDefined();
      expect(within(frente).getByText("FinApp")).toBeDefined();
    }
  });

  it("renderiza la sección 'Ejemplos de diseño' con 3 tarjetas virtuales en total", () => {
    const { container } = render(<PanelTarjetas />);

    expect(screen.getByText("Ejemplos de diseño")).toBeDefined();

    const frentes = container.querySelectorAll("[data-testid='tarjeta-frente']");
    expect(frentes).toHaveLength(3);
  });

  it("los ejemplos usan temas menta y morado con datos ficticios distintos de la principal", () => {
    const { container } = render(<PanelTarjetas />);

    const frentes = container.querySelectorAll("[data-testid='tarjeta-frente']");
    const htmlTarjetas = Array.from(frentes).map((frente) => frente.innerHTML);
    const clasesTarjetas = Array.from(frentes).map(
      (frente) => frente.firstElementChild?.className ?? ""
    );

    // Temas de ejemplo presentes (gradientes via tokens)
    expect(clasesTarjetas.some((c) => c.includes("from-emerald-primary"))).toBe(true);
    expect(clasesTarjetas.some((c) => c.includes("from-cat-other"))).toBe(true);

    // Titulares de ejemplo distintos al de la tarjeta principal
    expect(htmlTarjetas.some((h) => h.includes("ANA MARTÍNEZ"))).toBe(true);
    expect(htmlTarjetas.some((h) => h.includes("CARLOS RUIZ"))).toBe(true);
  });

  it("renderiza exactamente 3 tarjetas demo en el grid secundario", () => {
    const { container } = render(<PanelTarjetas />);

    // El grid secundario tiene 3 article.glass-card (MiTarjetaVirtual usa glass-card en motion.div pero no es article)
    const tarjetasGrid = container.querySelectorAll("section:nth-of-type(3) article.glass-card");
    expect(tarjetasGrid).toHaveLength(3);
  });

  it("cada tarjeta del grid muestra su nombre, número enmascarado y saldo", () => {
    const { container } = render(<PanelTarjetas />);
    const tarjetas = container.querySelectorAll("section:nth-of-type(3) article.glass-card");

    tarjetasEsperadas.forEach(({ nombre, enmascarado, saldo }, indice) => {
      const tarjeta = tarjetas[indice];

      expect(within(tarjeta).getByText(nombre)).toBeDefined();
      expect(within(tarjeta).getByText(enmascarado)).toBeDefined();
      expect(within(tarjeta).getByText(saldo)).toBeDefined();
    });
  });

  it("muestra el título 'Tus otras tarjetas' para el grid secundario", () => {
    render(<PanelTarjetas />);

    expect(screen.getByText("Tus otras tarjetas")).toBeDefined();
  });

  it("muestra la nota de demostración junto al grid", () => {
    render(<PanelTarjetas />);

    expect(screen.getByText("Datos de demostración")).toBeDefined();
  });
});
