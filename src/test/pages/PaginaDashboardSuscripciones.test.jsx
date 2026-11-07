import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import PaginaDashboardSuscripciones from "../../pages/PaginaDashboardSuscripciones";

afterEach(cleanup);

function listaSuscripciones() {
  return screen.getByRole("list", { name: "Suscripciones" });
}

describe("PaginaDashboardSuscripciones", () => {
  it("presenta el resumen mensual y las suscripciones de demostración", () => {
    render(<PaginaDashboardSuscripciones />);

    expect(screen.getByRole("heading", { name: "Suscripciones" })).toBeInTheDocument();
    expect(screen.getByTestId("total-mensual")).toHaveTextContent(/105\.600/);
    expect(screen.getByTestId("total-activas")).toHaveTextContent("4 de 5");
    expect(screen.getByRole("note")).toHaveTextContent("Datos de demostración");
    expect(within(listaSuscripciones()).getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("heading", { name: "Netflix" })).toBeInTheDocument();
  });

  it("filtra por suscripciones activas y pausadas", async () => {
    const usuario = userEvent.setup();
    render(<PaginaDashboardSuscripciones />);

    await usuario.click(screen.getByRole("button", { name: "Activas" }));
    expect(screen.getByRole("button", { name: "Activas" })).toHaveAttribute("aria-pressed", "true");
    expect(within(listaSuscripciones()).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.queryByRole("heading", { name: "Gimnasio" })).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Pausadas" }));
    expect(within(listaSuscripciones()).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Gimnasio" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Netflix" })).not.toBeInTheDocument();
  });

  it("actualiza el resumen al pausar una suscripción", async () => {
    const usuario = userEvent.setup();
    render(<PaginaDashboardSuscripciones />);

    await usuario.click(screen.getByRole("button", { name: "Pausar Netflix" }));

    expect(screen.getByTestId("total-mensual")).toHaveTextContent(/60\.700/);
    expect(screen.getByTestId("total-activas")).toHaveTextContent("3 de 5");
    expect(screen.getByRole("button", { name: "Activar Netflix" })).toBeInTheDocument();
    const tarjetaNetflix = screen.getByRole("heading", { name: "Netflix" }).closest("li");
    expect(within(tarjetaNetflix).getByText("Pausada")).toBeInTheDocument();
  });
});
