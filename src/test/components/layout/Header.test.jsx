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
import Header from "../../../components/layout/Header";

describe("Header", () => {
  it("renderiza logotipo FinApp y botones de accion en modo landing", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header alAbrirAuth={vi.fn()} modo="landing" />
      </MemoryRouter>
    );

    expect(screen.getByText("Fin")).toBeDefined();
    expect(screen.getByText("App")).toBeDefined();
    expect(screen.getByText("Iniciar sesión")).toBeDefined();
    expect(screen.getByText("Registrarse")).toBeDefined();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/");
  });

  it("dispara callback alAbrirAuth con el modo correspondiente", () => {
    const mockAbrir = vi.fn();
    render(
      <MemoryRouter>
        <Header alAbrirAuth={mockAbrir} modo="landing" />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Iniciar sesión"));
    expect(mockAbrir).toHaveBeenCalledWith("login");

    fireEvent.click(screen.getByText("Registrarse"));
    expect(mockAbrir).toHaveBeenCalledWith("registro");
  });

  it("usa modo landing por defecto si no se especifica", () => {
    render(
      <MemoryRouter>
        <Header alAbrirAuth={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Iniciar sesión")).toBeDefined();
    expect(screen.getByText("Registrarse")).toBeDefined();
  });
});