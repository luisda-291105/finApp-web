/**
 * @uso        Pruebas unitarias para el componente Hero
 * @funciones  test "renderiza titular y resumen de 4 categorias"
 * @datos      Mock de IntersectionObserver
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "./Hero";

describe("Hero", () => {
  it("renderiza el titular y las 4 categorias del resumen", () => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));

    render(<Hero alAbrirAuth={vi.fn()} />);

    expect(screen.getByText(/Controla tu dinero/i)).toBeDefined();
    expect(screen.getByText(/decide tu futuro/i)).toBeDefined();
    expect(screen.getByText("Ingresos")).toBeDefined();
    expect(screen.getByText("Gastos")).toBeDefined();
    expect(screen.getByText("Ahorro")).toBeDefined();
    expect(screen.getByText("Otro")).toBeDefined();
    expect(screen.getByText("$ 3,200")).toBeDefined();
  });
});
