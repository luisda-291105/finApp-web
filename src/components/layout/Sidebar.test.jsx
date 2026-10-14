/**
 * @uso        Pruebas unitarias para el componente Sidebar
 * @funciones  test "renderiza logo y 4 enlaces de navegación", test "marca enlace activo según ruta"
 * @datos      N/A
 * @eventos    Navegación vía MemoryRouter
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";

describe("Sidebar", () => {
  const renderSidebar = (initialEntries = ["/dashboard"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Sidebar />
      </MemoryRouter>
    );
  };

  it("renderiza logo FinApp y 4 enlaces de navegación", () => {
    renderSidebar();

    expect(screen.getByText("Fin")).toBeDefined();
    expect(screen.getByText("App")).toBeDefined();
    expect(screen.getByText("Inicio")).toBeDefined();
    expect(screen.getByText("Transacciones")).toBeDefined();
    expect(screen.getByText("Tarjetas")).toBeDefined();
    expect(screen.getByText("Configuración")).toBeDefined();
  });

  it("marca enlace activo según ruta actual", () => {
    renderSidebar(["/dashboard/transacciones"]);

    const enlaceActivo = screen.getByText("Transacciones").closest("a");
    expect(enlaceActivo.className).toContain("bg-emerald-primary/10");
    expect(enlaceActivo.className).toContain("text-emerald-primary");
    expect(enlaceActivo.className).toContain("font-medium");
  });

  it("aplica estilos inactivos a enlaces no activos", () => {
    renderSidebar(["/dashboard"]);

    const enlaceInactivo = screen.getByText("Transacciones").closest("a");
    expect(enlaceInactivo.className).toContain("text-slate-text");
    // hover:bg-emerald-primary/5 is a pseudo-class, not in className
    // We verify the base class is present
    expect(enlaceInactivo.className).toContain("hover:bg-emerald-primary/5");
  });

  it("tiene clases de contenedor correctas", () => {
    renderSidebar();

    const aside = screen.getByRole("complementary");
    expect(aside.className).toContain("w-64");
    expect(aside.className).toContain("bg-white");
    expect(aside.className).toContain("border-r");
    expect(aside.className).toContain("p-4");
    expect(aside.className).toContain("space-y-2");
  });
});