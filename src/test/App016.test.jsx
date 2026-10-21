import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("rutas informativas de la spec 016", () => {
  it.each([
    ["/dashboard/contactos", "Contactos"],
    ["/dashboard/correos", "Correos"],
  ])("muestra %s dentro del dashboard de demostración", (ruta, titulo) => {
    render(
      <MemoryRouter initialEntries={[ruta]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: titulo, level: 1 })).toBeInTheDocument();
  });
});
