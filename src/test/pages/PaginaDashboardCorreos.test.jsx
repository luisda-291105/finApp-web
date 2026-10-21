import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaginaDashboardCorreos from "../../pages/PaginaDashboardCorreos";

describe("PaginaDashboardCorreos", () => {
  it("presenta el propósito de la sección como demostración y sin listas ni acciones", () => {
    const { container } = render(<PaginaDashboardCorreos />);

    expect(screen.getByRole("heading", { name: "Correos", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Esta sección de FinApp está pensada para reunir correos relacionados con tu actividad financiera."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Vista de demostración. No muestra correos reales ni se conecta a cuentas.")
    ).toBeInTheDocument();
    expect(container.querySelector("ul, ol")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button") ||
        screen.queryByRole("link") ||
        screen.queryByRole("textbox")
    ).not.toBeInTheDocument();
  });
});
