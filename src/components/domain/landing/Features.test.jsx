/**
 * @uso        Pruebas unitarias para el componente Features
 * @funciones  test "renderiza 5 tarjetas vía Card con clase glass-card efectiva"
 * @datos      Mock de IntersectionObserver
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Features from "./Features";

describe("Features", () => {
  it("renderiza las 5 tarjetas de funcionalidades vía Card con clase glass-card efectiva", () => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));

    render(<Features />);

    // Verificar que se renderizan los 5 títulos
    expect(screen.getByText("Registro personal")).toBeDefined();
    expect(screen.getByText("Ahorro")).toBeDefined();
    expect(screen.getByText("Gastos")).toBeDefined();
    expect(screen.getByText("Ingresos")).toBeDefined();
    expect(screen.getByText("Otro")).toBeDefined();

    // Verificar que hay 5 elementos con la clase glass-card efectiva en el DOM
    const elementosGlassCard = document.querySelectorAll(".glass-card");
    expect(elementosGlassCard.length).toBe(5);
  });
});