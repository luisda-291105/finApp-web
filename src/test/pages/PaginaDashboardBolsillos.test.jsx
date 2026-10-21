/**
 * @uso        Pruebas unitarias para la página de Bolsillos Grupales del dashboard (spec 021)
 * @funciones  test renderiza cabecera y métricas, test tarjetas de equipo, test acción compartir
 * @datos      N/A
 * @eventos    click en botones de compartir y nuevo bolsillo
 * @estados    feedback de copia, aviso informativo
 * @usadoPor   Vitest (npm test)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import PaginaDashboardBolsillos from "../../pages/PaginaDashboardBolsillos";

describe("PaginaDashboardBolsillos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza la cabecera y el título accesible de la página", () => {
    render(<PaginaDashboardBolsillos />);

    const titulo = screen.getByRole("heading", { level: 1, name: "Bolsillos Grupales" });
    expect(titulo).toBeInTheDocument();
    expect(screen.getByText("FinApp / Panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear nuevo bolsillo grupal" })).toBeInTheDocument();
  });

  it("muestra las cuatro métricas de resumen colectivo", () => {
    render(<PaginaDashboardBolsillos />);

    expect(screen.getByText("Balance Colectivo")).toBeInTheDocument();
    expect(screen.getByText("Meta Total")).toBeInTheDocument();
    expect(screen.getByText("Bolsillos Activos")).toBeInTheDocument();
    expect(screen.getByText("Fuentes Vinculadas")).toBeInTheDocument();

    // Comprobar valor de bolsillos activos (3)
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("3 cuentas")).toBeInTheDocument();
  });

  it("renderiza las tarjetas de bolsillos de equipo con sus fuentes y progreso", () => {
    render(<PaginaDashboardBolsillos />);

    expect(screen.getByText("Gastos de Oficina")).toBeInTheDocument();
    expect(screen.getByText("Viaje y Retiro de Equipo")).toBeInTheDocument();
    expect(screen.getByText("Fondo Común de Innovación")).toBeInTheDocument();

    expect(screen.getByText("Cuenta Operativa BBVA")).toBeInTheDocument();
    expect(screen.getByText("Fondo Santander Ahorro")).toBeInTheDocument();
    expect(screen.getByText("Billetera Digital Stripe")).toBeInTheDocument();

    const barras = screen.getAllByRole("progressbar");
    expect(barras).toHaveLength(3);
    barras.forEach((barra) => {
      expect(barra).toHaveAttribute("aria-valuenow");
      expect(barra).toHaveAttribute("aria-valuemin", "0");
      expect(barra).toHaveAttribute("aria-valuemax", "100");
    });
  });

  it("permite simular la copia del enlace de entrada con feedback visual accesible", async () => {
    render(<PaginaDashboardBolsillos />);

    const botonCompartir = screen.getByRole("button", {
      name: "Compartir entrada de Gastos de Oficina",
    });
    expect(botonCompartir).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(botonCompartir);
    });

    // Se muestra estado de confirmación
    expect(screen.getByText("¡Copiado!")).toBeInTheDocument();
  });

  it("muestra aviso informativo al hacer click en 'Nuevo bolsillo'", () => {
    render(<PaginaDashboardBolsillos />);

    const botonNuevo = screen.getByRole("button", { name: "Crear nuevo bolsillo grupal" });
    fireEvent.click(botonNuevo);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.getByText(/Funcionalidad de creación en modo demostración/i)
    ).toBeInTheDocument();

    // Permite descartar el aviso
    const botonEntendido = screen.getByRole("button", { name: "Entendido" });
    fireEvent.click(botonEntendido);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
