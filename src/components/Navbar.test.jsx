/**
 * @uso        Pruebas unitarias para el componente Navbar
 * @funciones  test "renderiza logo y botones", test "ejecuta alAbrirAuth"
 * @datos      N/A
 * @eventos    click en botones, scroll en window
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renderiza logotipo FinApp y botones de accion", () => {
    render(<Navbar alAbrirAuth={vi.fn()} />);

    expect(screen.getByText("Fin")).toBeDefined();
    expect(screen.getByText("App")).toBeDefined();
    expect(screen.getByText("Iniciar sesión")).toBeDefined();
    expect(screen.getByText("Registrarse")).toBeDefined();
  });

  it("dispara callback alAbrirAuth con el modo correspondiente", () => {
    const mockAbrir = vi.fn();
    render(<Navbar alAbrirAuth={mockAbrir} />);

    fireEvent.click(screen.getByText("Iniciar sesión"));
    expect(mockAbrir).toHaveBeenCalledWith("login");

    fireEvent.click(screen.getByText("Registrarse"));
    expect(mockAbrir).toHaveBeenCalledWith("registro");
  });
});
