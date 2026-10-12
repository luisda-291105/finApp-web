/**
 * @uso        Pruebas unitarias para el componente PanelTarjetas
 * @funciones  tests de grid demo (3 tarjetas) y nota de demostración
 * @datos      3 tarjetas esperadas (nombre, enmascarado, saldo) fijadas en el plan
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PanelTarjetas from "./PanelTarjetas";

const tarjetasEsperadas = [
  { nombre: "Tarjeta Oro", enmascarado: "•••• 4242", saldo: "$2,340.00" },
  { nombre: "Tarjeta Platino", enmascarado: "•••• 5300", saldo: "$980.25" },
  { nombre: "Débito Nómina", enmascarado: "•••• 7841", saldo: "$5,120.75" },
];

afterEach(cleanup);

describe("PanelTarjetas", () => {
  it("renderiza exactamente 3 tarjetas glass-card en el grid", () => {
    const { container } = render(<PanelTarjetas />);

    expect(container.querySelectorAll("article.glass-card")).toHaveLength(3);
  });

  it("cada tarjeta muestra su nombre, número enmascarado y saldo", () => {
    const { container } = render(<PanelTarjetas />);
    const tarjetas = container.querySelectorAll("article.glass-card");

    tarjetasEsperadas.forEach(({ nombre, enmascarado, saldo }, indice) => {
      const tarjeta = tarjetas[indice];

      expect(within(tarjeta).getByText(nombre)).toBeDefined();
      expect(within(tarjeta).getByText(enmascarado)).toBeDefined();
      expect(within(tarjeta).getByText(saldo)).toBeDefined();
    });
  });

  it("muestra la nota de demostración junto al grid", () => {
    render(<PanelTarjetas />);

    expect(screen.getByText("Datos de demostración")).toBeDefined();
  });
});
