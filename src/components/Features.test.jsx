/**
 * @uso        Pruebas unitarias para el componente Features
 * @funciones  test "renderiza 5 tarjetas de funcionalidades"
 * @datos      Mock de IntersectionObserver
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Features from "./Features";

describe("Features", () => {
  it("renderiza las 5 tarjetas de funcionalidades", () => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));

    render(<Features />);

    expect(screen.getByText("Registro personal")).toBeDefined();
    expect(screen.getByText("Ahorro")).toBeDefined();
    expect(screen.getByText("Gastos")).toBeDefined();
    expect(screen.getByText("Ingresos")).toBeDefined();
    expect(screen.getByText("Otro")).toBeDefined();
  });
});
