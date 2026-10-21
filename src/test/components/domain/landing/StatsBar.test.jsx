/**
 * @uso        Pruebas unitarias para el componente StatsBar
 * @funciones  test "muestra las cuatro métricas", test "la etiqueta secundaria usa text-white (AA sobre la franja)"
 * @datos      Métricas fijas del componente
 * @eventos    Ninguno
 * @estados    Usa useReveal (IntersectionObserver)
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsBar from "../../../../components/domain/landing/StatsBar";

describe("StatsBar", () => {
  beforeEach(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it("muestra las cuatro métricas con su etiqueta", () => {
    render(<StatsBar />);

    ["12 k+", "98 %", "$2.4 M", "0 costo"].forEach((valor) => {
      expect(screen.getByText(valor)).toBeDefined();
    });
    ["Usuarios activos", "Satisfacción", "Gestionados", "Para empezar"].forEach(
      (etiqueta) => {
        expect(screen.getByText(etiqueta)).toBeDefined();
      }
    );
  });

  it("la etiqueta secundaria usa text-white (AA sobre la franja) y no text-white/80", () => {
    render(<StatsBar />);

    ["Usuarios activos", "Satisfacción", "Gestionados", "Para empezar"].forEach(
      (etiqueta) => {
        const nodo = screen.getByText(etiqueta);
        expect(nodo).toHaveClass("text-white");
        expect(nodo).not.toHaveClass("text-white/80");
      }
    );
    expect(document.querySelector(".text-white\\/80")).toBeNull();
  });
});
