/**
 * @uso        Pruebas del detalle de la tarjeta registrada
 * @funciones  Verifica la presentación de movimientos y del tipo de cuenta
 * @datos      Tarjeta de demostración y servicio simulado
 * @eventos    Apertura del modal de detalle
 * @estados    cargandoMovimientos, movimientos
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import DetalleTarjetaModal from "../../../features/tarjetas/components/modals/DetalleTarjetaModal";
import { obtenerMovimientosTarjeta } from "../../../features/tarjetas/services/tarjetasService";

vi.mock("../../../features/tarjetas/services/tarjetasService", () => ({
  obtenerMovimientosTarjeta: vi.fn(),
}));

const TARJETA = {
  idTarjeta: "tarjeta-1",
  titular: "Ana Pérez",
  entidad: "Banco Nacional",
  numero: "**** 1111",
  expiracion: "2029-12-01",
  tipoCuenta: "CREDITO",
};

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("DetalleTarjetaModal", () => {
  it("lista los movimientos vinculados a la tarjeta y el tipo de cuenta", async () => {
    obtenerMovimientosTarjeta.mockResolvedValue([
      { idMovimiento: "mov-1", fecha: "2026-11-11", monto: 2000000, tipo: "INGRESO", categoria: "Ingresos", concepto: "Transferencia", origenTipo: "CUENTA", origenNombre: "Banco Nacional", estadoRevision: "CONFIRMADO" },
    ]);

    render(<DetalleTarjetaModal tarjeta={TARJETA} alCerrar={vi.fn()} alGuardar={vi.fn()} alEliminar={vi.fn()} />);

    expect(await screen.findByText("Transferencia")).toBeInTheDocument();
    expect(screen.getByText("Movimientos")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Crédito")).toBeInTheDocument();
    expect(obtenerMovimientosTarjeta).toHaveBeenCalledWith("tarjeta-1");
  });

  it("abre el detalle de un movimiento al hacer clic en su fila", async () => {
    obtenerMovimientosTarjeta.mockResolvedValue([
      { idMovimiento: "mov-1", fecha: "2026-11-11", monto: 2000000, tipo: "INGRESO", categoria: "Ingresos", concepto: "Transferencia", origenTipo: "CUENTA", origenNombre: "Banco Nacional", estadoRevision: "CONFIRMADO" },
    ]);

    const usuario = userEvent.setup();
    render(<DetalleTarjetaModal tarjeta={TARJETA} alCerrar={vi.fn()} alGuardar={vi.fn()} alEliminar={vi.fn()} />);

    const fila = await screen.findByRole("button", { name: /Ver detalle del movimiento/i });
    await usuario.click(fila);

    const dialogo = await screen.findByRole("dialog", { name: "Detalle del movimiento" });
    expect(within(dialogo).getByRole("heading", { name: "Transferencia" })).toBeInTheDocument();
    expect(within(dialogo).getByText(/2\.000\.000/)).toBeInTheDocument();
    expect(within(dialogo).getByText("Confirmado")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando la tarjeta no tiene movimientos", async () => {
    obtenerMovimientosTarjeta.mockResolvedValue([]);

    render(<DetalleTarjetaModal tarjeta={TARJETA} alCerrar={vi.fn()} alGuardar={vi.fn()} alEliminar={vi.fn()} />);

    expect(await screen.findByText("Esta tarjeta todavía no tiene movimientos registrados.")).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando falla la consulta de movimientos", async () => {
    obtenerMovimientosTarjeta.mockRejectedValue(new Error("No se pudieron cargar los movimientos de esta tarjeta."));

    render(<DetalleTarjetaModal tarjeta={TARJETA} alCerrar={vi.fn()} alGuardar={vi.fn()} alEliminar={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudieron cargar los movimientos de esta tarjeta.");
  });
});
