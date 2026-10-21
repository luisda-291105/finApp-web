import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaginaDashboardContactos from "../../pages/PaginaDashboardContactos";

describe("PaginaDashboardContactos", () => {
  it("presenta el propósito de la sección como demostración y sin listas ni acciones", () => {
    const { container } = render(<PaginaDashboardContactos />);

    expect(screen.getByRole("heading", { name: "Contactos", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Esta sección de FinApp está destinada a organizar información de contactos relacionada con tus finanzas."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Vista de demostración. No muestra datos de contactos reales.")
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
