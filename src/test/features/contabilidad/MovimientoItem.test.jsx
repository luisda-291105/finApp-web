import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import MovimientoItem from "../../../features/contabilidad/components/cards/MovimientoItem";

afterEach(cleanup);

function renderMovimiento(tipo, concepto) {
  render(
    <ul>
      <MovimientoItem
        movimiento={{
          tipo,
          concepto,
          monto: 100000,
          fecha: "2026-11-14",
        }}
        onDetalle={vi.fn()}
      />
    </ul>,
  );

  return screen.getByRole("button", {
    name: `Ver detalle del movimiento ${concepto}`,
  });
}

describe("MovimientoItem", () => {
  it("representa los ingresos en verde", () => {
    const boton = renderMovimiento("INGRESO", "Nómina");
    const monto = within(boton).getByText(/100\.000/);

    expect(monto).toHaveClass("text-emerald-primary");
    expect(boton.querySelector("svg")?.parentElement).toHaveClass(
      "text-emerald-primary",
    );
  });

  it("representa los ahorros en azul", () => {
    const boton = renderMovimiento("AHORRO", "Ahorro mensual");
    const monto = within(boton).getByText(/100\.000/);

    expect(monto).toHaveClass("text-cat-income");
    expect(boton.querySelector("svg")?.parentElement).toHaveClass(
      "text-cat-income",
    );
  });
});
