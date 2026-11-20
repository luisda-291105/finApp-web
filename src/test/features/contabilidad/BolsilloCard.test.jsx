import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import BolsilloCard from "../../../features/contabilidad/components/cards/BolsilloCard";

afterEach(cleanup);

const BOLSILLO = {
  idBolsillo: "bolsillo-nu",
  nombre: "NU",
  tipo: "AHORRO",
  montoObjetivo: 0,
  descripcion: "Reserva para emergencias.",
  origenes: JSON.stringify(["Nómina"]),
};

function renderTarjeta(props = {}) {
  render(
    <ul>
      <li>
        <BolsilloCard
          bolsillo={BOLSILLO}
          resumen={{ cantidad: 2, ahorros: 200000 }}
          onDetalle={vi.fn()}
          {...props}
        />
      </li>
    </ul>,
  );

  return screen.getByRole("button", { name: /Abrir bolsillo NU/ });
}

describe("BolsilloCard", () => {
  it("muestra el total ahorrado, los movimientos y la información del bolsillo", () => {
    const tarjeta = renderTarjeta();

    expect(within(tarjeta).getByText("Total ahorrado")).toBeInTheDocument();
    expect(within(tarjeta).getByText("$ 200.000")).toBeInTheDocument();
    expect(within(tarjeta).getByText("2 movimientos")).toBeInTheDocument();
    expect(tarjeta.querySelector("p.line-clamp-2")).toHaveTextContent(
      "Reserva para emergencias.",
    );
    expect(within(tarjeta).getByText("Fondeos")).toBeInTheDocument();
    expect(within(tarjeta).getByText("Nómina")).toBeInTheDocument();
    expect(within(tarjeta).queryByText("Ver movimientos")).toBeNull();
    expect(tarjeta.getAttribute("aria-label")).toContain(
      "tipo AHORRO, 2 movimientos, sin meta definida",
    );
  });

  it("muestra el progreso y el saldo pendiente de la meta", () => {
    const tarjeta = renderTarjeta({
      bolsillo: { ...BOLSILLO, montoObjetivo: 500000 },
      resumen: { cantidad: 4, ahorros: 250000 },
    });

    expect(within(tarjeta).getByText("4 movimientos")).toBeInTheDocument();
    expect(within(tarjeta).getByText("$ 500.000")).toBeInTheDocument();
    expect(
      within(tarjeta).getByRole("progressbar", {
        name: "Avance de la meta de NU",
      }),
    ).toHaveAttribute("aria-valuenow", "50");
    expect(
      within(tarjeta).getByText("50% completado · Faltan $ 250.000"),
    ).toBeInTheDocument();
  });
});
