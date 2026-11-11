import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ResumenGlobalCards from "../../../features/contabilidad/components/cards/ResumenGlobalCards";

describe("ResumenGlobalCards", () => {
  it("combina ingresos y gastos en una card y no muestra una card de ahorros", () => {
    render(<ResumenGlobalCards mes="2026-05" alCambiarMes={vi.fn()} resumen={{
      ingresos: 12000, gastos: 5000, ahorros: 10000, transferencias: 2500,
      saldoAhorros: 80000, porRevisar: 2,
    }} />);

    expect(screen.getByRole("heading", { name: "Ingresos y gastos" })).toBeInTheDocument();
    expect(screen.getByText("Ingresos")).toBeInTheDocument();
    expect(screen.getByText("Gastos")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Ahorros" })).not.toBeInTheDocument();
    expect(screen.getByText(/12\.000/)).toBeInTheDocument();
    expect(screen.getByText(/5\.000/)).toBeInTheDocument();
    expect(screen.queryByText(/80\.000/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Aportes del mes/)).not.toBeInTheDocument();
    expect(screen.getByText(/Transferencias:/)).toHaveTextContent("2.500");
    expect(screen.getByText(/Movimientos por revisar:/)).toHaveTextContent("2");
  });

  it("notifica el mes seleccionado", async () => {
    const alCambiarMes = vi.fn();
    render(<ResumenGlobalCards mes="2026-04" alCambiarMes={alCambiarMes} resumen={{}} />);

    fireEvent.change(screen.getByLabelText("Mes"), { target: { value: "2026-05" } });

    expect(alCambiarMes).toHaveBeenCalledWith("2026-05");
  });
});
