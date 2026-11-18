/**
 * @uso        Pruebas unitarias para el componente Header
 * @funciones  test "renderiza logo y botones", test "ejecuta alAbrirAuth", test "modo landing por defecto"
 * @datos      N/A
 * @eventos    click en botones, scroll en window
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../../../../features/landing/components/layouts/Header";

describe("Header", () => {
  it("renderiza logotipo FinApp y botón de acceso en modo landing", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header alAbrirAuth={vi.fn()} modo="landing" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "FinApp" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByAltText("FinApp")).toBeDefined();
    expect(screen.getByText("Iniciar sesión")).toBeDefined();
    expect(screen.queryByText("Registrarse")).toBeNull();
  });

  it("dispara callback alAbrirAuth con el modo correspondiente", () => {
    const mockAbrir = vi.fn();
    render(
      <MemoryRouter>
        <Header alAbrirAuth={mockAbrir} modo="landing" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Iniciar sesión"));
    expect(mockAbrir).toHaveBeenCalledWith("login");
  });

  it("usa modo landing por defecto si no se especifica", () => {
    render(
      <MemoryRouter>
        <Header alAbrirAuth={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Iniciar sesión")).toBeDefined();
    expect(screen.queryByText("Registrarse")).toBeNull();
  });
});
